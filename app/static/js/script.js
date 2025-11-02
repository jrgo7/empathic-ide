require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' } })


require(['vs/editor/editor.main'], function () {
    const editorContainer = document.getElementById('editor')
    window.editor = monaco.editor.create(editorContainer, {
        value: '',
        language: 'c',
        automaticLayout: true,
        fixedOverflowWidgets: true,
        minimap: {
            enabled: false,
        },
    })
})

async function addMessage(author, messageText) {
    const chatMessageTemplate = document.getElementById("template-chat-message");
    const chatHistoryDiv = document.getElementById("chat");
    const chatMessageDiv = chatMessageTemplate.content.cloneNode(true);
    chatMessageDiv.querySelector(".chat-message-author").textContent = author;
    chatMessageDiv.querySelector(".chat-message-content").textContent = messageText;
    const spacerDiv = chatHistoryDiv.querySelector('.spacer');
    chatHistoryDiv.insertBefore(chatMessageDiv, spacerDiv);
}

document.querySelector('button#send').addEventListener("click", async function () {
    const editorText = window.editor.getValue()
    const textarea = document.querySelector('textarea#message-textarea')
    const messageText = textarea.value
    textarea.value = ''
    const config = {
        method: 'POST',
        body: JSON.stringify({ message: messageText, code: editorText })
    }
    await addMessage("user", messageText);
    const response = await fetch("/code/send", config);
    const responseJson = await response.json();

    if (response.status == 403) {
        await addMessage(
            "bot",
            responseJson.error
        );
        return;
    }

    const { acknowledgement, supportive_suggestion: supportiveSuggestion } = responseJson.reply;
    console.log(responseJson)
    console.log(acknowledgement)
    console.log(supportiveSuggestion)
    await addMessage("bot", acknowledgement);
    await addMessage("bot", supportiveSuggestion);
})


document.querySelector('button#open').addEventListener("click", async function () {
    // TODO: Open file
    window.editor.setValue("Value set")
})


document.querySelector('button#save').addEventListener("click", async function () {
    // TODO: Save file
    const editorText = window.editor.getValue()
})


document.querySelector('button#compile').addEventListener("click", async function () {
    // TODO: Display results
    const editorText = window.editor.getValue()
    const config = {
        method: 'POST',
        body: JSON.stringify({ editorText })
    }
    const response = await fetch("/code/compile", config)
})


document.querySelector('button#run').addEventListener("click", async function () {
    // TODO: Display results
    const editorText = window.editor.getValue()
    const config = {
        method: 'POST',
        body: JSON.stringify({ editorText })
    }
    const response = await fetch("/code/run", config)
})

document.querySelector('button#set-api-key').addEventListener("click", async function () {
    const apiKeyInput = document.getElementById('api-key-input');

    const config = { method: "POST", body: JSON.stringify({ gemini_api_key: apiKeyInput.value }) };
    const response = await fetch("/code/api-key", config);

    const modal = document.getElementById('modal-gemini-api-key');
    modal.classList.remove("modal-visible");
})

document.querySelector('button#open-api-key-modal').addEventListener("click", async function () {
    const apiKeyInput = document.getElementById('api-key-input');
    apiKeyInput.disabled = true;
    apiKeyInput.value = "Checking if API key exists...";

    const modal = document.getElementById('modal-gemini-api-key');
    modal.classList.add("modal-visible");

    const config = { method: 'GET' }
    const response = await fetch("/code/api-key", config);
    const responseJson = await response.json();
    const geminiApiKey = responseJson.reply;

    apiKeyInput.value = geminiApiKey;
    apiKeyInput.disabled = false;
})

document.querySelector('button#close-api-key-modal').addEventListener("click", async function () {
    modal = document.getElementById('modal-gemini-api-key');
    modal.classList.remove("modal-visible");
})
