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

const ding = new Audio('/static/sound/ding.mp3')
let username;
const BOT_NAME = "Ceci"
const BOT_CHARS_PER_SEC = 200

/**
 * @param {number} n 
 * @param {number} minimum 
 * @param {number} maximum 
 * @returns n itself, or minimum if it is smaller than it, or maximum if it is larger than it
 */
function clamp(n, minimum, maximum) {
  return Math.max(Math.min(n, maximum), minimum);
}

/**
 * Sleep for a specified amount of milliseconds. This is used to humanize the
 * chatbot a little more e.g. to delay responses for a bit.
 * @param {number} ms How long to sleep for, in milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showTypingIndicator() {
  document.getElementById('typing-indicator').textContent = "Cece is typing..."
}

function hideTypingIndicator() {
  document.getElementById('typing-indicator').textContent = ""
}

/**
 * Add a message to the chatbot user interface.
 * @param {string} author The author of the message
 * @param {string} messageText The content of the message
 */
async function addMessage(author, messageText) {
  const chatMessageTemplate = document.getElementById("template-chat-message");
  const chatHistoryDiv = document.getElementById("chat-container");
  const chatMessageDiv = chatMessageTemplate.content.cloneNode(true);
  chatMessageDiv.querySelector(".chat-message-author").textContent = author;
  chatMessageDiv.querySelector(".chat-message-content").textContent = messageText;
  if (author === BOT_NAME) {
    const typingDuration = clamp(messageText.length / BOT_CHARS_PER_SEC * 1000, 0.1, 2000);
    console.log(typingDuration)
    showTypingIndicator();
    await sleep(typingDuration);
    hideTypingIndicator();
    ding.play();
  } else {
    ding.play();
  }
  chatHistoryDiv.appendChild(chatMessageDiv);
}

/**
 * Add a line of content to the terminal
 * @param {string} content The content to add
 */
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

/**
 * Determine if the current browser context soupports file system access
 * functions, e.g. window.showOpenFilePicker() and window.showSaveFilePicker().
 * The MDN docs suggest only Chromium-based browsers support these as of
 * 2025-11-23.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker
 * @returns {boolean} Whether or not the browser supports file system access
 */
function supportsFileSystemAccess() {
  try {
    return "showOpenFilePicker" in window && window.self === window.top;
  } catch {
    return false;
  }
}

/**
 * Open a file by selecting it from the file picker
 * @param {{}} opts Options, like what types to accept.
 * @returns A file handler that lets users access a file's contents
 */
async function openFilePicker(opts) {
  if (supportsFileSystemAccess()) {
    return await window.showOpenFilePicker(opts)
  } else {
    alert("Unfortunately, we only support Chromium-based browsers.");
  }
}

/**
 * Save a file by selecting where to save it to from the file picker
 * @param {{}} opts Options, like what types to accept.
 * @returns A file handler that lets users write a file's contents
 */
async function saveFilePicker(opts) {
  if (supportsFileSystemAccess()) {
    return await window.showSaveFilePicker(opts)
  } else {
    alert("Unfortunately, we only support Chromium-based browsers.");
  }
}

function disableSendButton() {
  btn = document.querySelector("button#send");
  btn.disabled = true;
}

function enableSendButton() {
  btn = document.querySelector("button#send");
  btn.disabled = false;
}

document
  .querySelector("button#send")
  .addEventListener("click", async function () {
    const editorText = window.editor.getValue();
    const textarea = document.querySelector("textarea#message-textarea");
    const messageText = textarea.value;
    textarea.value = "";
    disableSendButton();
    const config = {
      method: "POST",
      body: JSON.stringify({ message: messageText, code: editorText }),
    };
    await addMessage(username, messageText);

    const chatHistoryDiv = document.getElementById("chat-container");
    showTypingIndicator();
    const response = await fetch("/code/send", config);
    const responseJson = await response.json();
    hideTypingIndicator();

    if (response.status == 403) {
      await addMessage(BOT_NAME, responseJson.error);
      enableSendButton();
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
    await addMessage(BOT_NAME, acknowledgement);
    await addMessage(BOT_NAME, supportiveSuggestion);
    if (errorExplanation) {
      await addMessage(BOT_NAME, errorExplanation);
    }
    enableSendButton();
  });

const filePickerTypes = [
  {
    description: "C file",
    accept: { "text/plain": [".c"] },
  },
];

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
        await addMessage(BOT_NAME, responseJson.error);
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
      await addMessage(BOT_NAME, acknowledgement);
      await addMessage(BOT_NAME, supportiveSuggestion);
      if (errorExplanation) {
        await addMessage(BOT_NAME, errorExplanation);
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

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add("modal-visible");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("modal-visible");
}

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


document
  .querySelector("button#open-name-modal")
  .addEventListener("click", () => openModal('modal-input-name'));

document
  .querySelector("button#close-name-modal")
  .addEventListener("click", () => {
    username = document.querySelector("input#name").value;
    closeModal('modal-input-name');
  });


document.addEventListener('DOMContentLoaded', function () {
  if (!supportsFileSystemAccess()) {
    alert("We have detected that you are running on a non-Chromium-based browser."
      + " Unfortunately, we currently only support Chromium-based browsers like"
      + " Google Chrome or Microsoft Edge. You will experience errors when saving"
      + " and opening files otherwise."
    )
  }
  openModal('modal-input-name');
  addMessage(BOT_NAME, `Hello! I'm ${BOT_NAME}, your helpful CCPROG1 tutoring bot. What are we doing today?`);
});
