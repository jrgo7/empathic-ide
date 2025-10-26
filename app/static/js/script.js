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


document.querySelector('button#send').addEventListener("click", async function () {
    // TODO: Add messages sent and received to frontend
    const editorText = window.editor.getValue()
    const textarea = document.querySelector('textarea#message-textarea')
    const messageText = textarea.value
    textarea.value = ''
    const config = {
        method: 'POST',
        body: JSON.stringify({ editorText, messageText })
    }
    const response = await fetch("/code/send", config)
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
    // TODO: Open a modal and save the API key somewhere.
    // TODO: Also, load the API key if present (somewhere else in the code)
})
