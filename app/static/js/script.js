require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs",
  },
});

fetch("/clearchat", { method: "POST" });

require(["vs/editor/editor.main"], function () {
  const editorContainer = document.getElementById("editor");
  window.editor = monaco.editor.create(editorContainer, {
    value: "",
    language: "c",
    fontSize: 16,
    fontFamily: "JetBrains Mono",
    roundedSelection: true,
    automaticLayout: true,
    fixedOverflowWidgets: true,
    minimap: {
      enabled: false,
    },
    "bracketPairColorization.enabled": true,
  });
  defineCatppuccinFrappeTheme();
  defineCatppuccinLatteTheme();
  monaco.editor.setTheme("catppuccin-latte");
});

async function addMessage(author, messageText) {
  const chatMessageTemplate = document.getElementById("template-chat-message");
  const chatHistoryDiv = document.getElementById("chat-container");
  const chatMessageDiv = chatMessageTemplate.content.cloneNode(true);
  chatMessageDiv.querySelector(".chat-message-author").textContent = author;
  chatMessageDiv.querySelector(".chat-message-content").textContent =
    messageText;
  // const spacerDiv = chatHistoryDiv.querySelector('.spacer');
  chatHistoryDiv.appendChild(chatMessageDiv);
}

async function addToTerminal(content) {
  const terminal = document.getElementById("terminal-content");
  if (Array.isArray(content)) {
    content.forEach((line) => {
      terminal.textContent += line + "\n";
    });
  } else if (typeof content === "string") {
    terminal.textContent += content + "\n";
  }
  terminal.scrollTop = terminal.scrollHeight;
}

document
  .querySelector("button#send")
  .addEventListener("click", async function () {
    const editorText = window.editor.getValue();
    const textarea = document.querySelector("textarea#message-textarea");
    const messageText = textarea.value;
    textarea.value = "";
    const config = {
      method: "POST",
      body: JSON.stringify({ message: messageText, code: editorText }),
    };
    await addMessage("user", messageText);

    const chatHistoryDiv = document.getElementById("chat-container");

    const response = await fetch("/code/send", config);
    const responseJson = await response.json();

    if (response.status == 403) {
      await addMessage("bot", responseJson.error);
      return;
    }

    const {
      acknowledgement,
      supportive_suggestion: supportiveSuggestion,
      error_explanation: errorExplanation,
    } = responseJson.reply;
    console.log(responseJson);
    console.log(acknowledgement);
    console.log(supportiveSuggestion);
    await addMessage("bot", acknowledgement);
    await addMessage("bot", supportiveSuggestion);
    if (errorExplanation) {
      await addMessage("bot", errorExplanation);
    }
  });

const filePickerTypes = [
  {
    description: "C file",
    accept: { "text/plain": [".c"] },
  },
];

function supportsFileSystemAccess() {
  try {
    return "showOpenFilePicker" in window && window.self === window.top;
  } catch {
    return false;
  }
}

async function openFilePicker(opts) {
  if (supportsFileSystemAccess()) {
    return await window.showOpenFilePicker(opts)
  } else {
    alert("Unfortunately, we only support Chromium-based browsers.");
  }
}

async function saveFilePicker(opts) {
  if (supportsFileSystemAccess()) {
    return await window.showSaveFilePicker(opts)
  } else {
    alert("Unfortunately, we only support Chromium-based browsers.");
  }
}

document
  .querySelector("button#open")
  .addEventListener("click", async function () {
    const [fileHandle] = await openFilePicker({ types: filePickerTypes });
    const file = await fileHandle.getFile();
    const content = await file.text();
    window.editor.setValue(content);
  });

document
  .querySelector("button#save")
  .addEventListener("click", async function () {
    const editorText = window.editor.getValue();
    const handle = await saveFilePicker({ types: filePickerTypes });
    const blob = new Blob([editorText]);
    const writableStream = await handle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();
  });

document
  .querySelector("button#run")
  .addEventListener("click", async function () {
    const runButton = this;
    const buttonText = runButton.querySelector(".button-text");
    const spinner = runButton.querySelector(".spinner");

    buttonText.style.opacity = "0";
    spinner.style.display = "inline-block";
    runButton.disabled = true;

    try {
      const editorText = window.editor.getValue();
      const config = {
        method: "POST",
        body: JSON.stringify({ code: editorText }),
      };
      const response = await fetch("/code/run", config);
      const responseJson = await response.json();

      if (response.status == 403) {
        await addMessage("bot", responseJson.error);
        return;
      }
      const {
        acknowledgement,
        supportive_suggestion: supportiveSuggestion,
        error_explanation: errorExplanation,
      } = responseJson.reply;
      console.log(responseJson);
      console.log(acknowledgement);
      console.log(supportiveSuggestion);
      await addMessage("bot", acknowledgement);
      await addMessage("bot", supportiveSuggestion);
      if (errorExplanation) {
        await addMessage("bot", errorExplanation);
      }

      await addToTerminal(responseJson.output);
    } finally {
      buttonText.style.opacity = "1";
      spinner.style.display = "none";
      runButton.disabled = false;
    }
  });

document
  .querySelector("button#set-api-key")
  .addEventListener("click", async function () {
    const apiKeyInput = document.getElementById("api-key-input");

    const config = {
      method: "POST",
      body: JSON.stringify({ gemini_api_key: apiKeyInput.value }),
    };
    const response = await fetch("/code/api-key", config);

    const modal = document.getElementById("modal-gemini-api-key");
    modal.classList.remove("modal-visible");
  });

document
  .querySelector("button#clear-console")
  .addEventListener("click", async function () {
    const terminal = document.getElementById("terminal-content");
    terminal.textContent = "";
  });

document
  .querySelector("button#open-api-key-modal")
  .addEventListener("click", async function () {
    const apiKeyInput = document.getElementById("api-key-input");
    apiKeyInput.disabled = true;
    apiKeyInput.value = "Checking if API key exists...";

    const modal = document.getElementById("modal-gemini-api-key");
    modal.classList.add("modal-visible");

    const config = { method: "GET" };
    const response = await fetch("/code/api-key", config);
    const responseJson = await response.json();
    const geminiApiKey = responseJson.reply;

    apiKeyInput.value = geminiApiKey;
    apiKeyInput.disabled = false;
  });

document
  .querySelector("button#close-api-key-modal")
  .addEventListener("click", async function () {
    const modal = document.getElementById("modal-gemini-api-key");
    modal.classList.remove("modal-visible");
  });

if (!supportsFileSystemAccess()) {
  alert("We have detected that you are running on a non-Chromium-based browser."
    + " Unfortunately, we currently only support Chromium-based browsers like"
    + " Google Chrome or Microsoft Edge. You will experience errors when saving"
    + " and opening files otherwise."
  )
}