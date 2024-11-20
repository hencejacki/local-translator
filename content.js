// content.js

let isDebugMode = true;

const WordOPType = {
    WORD_SELECTED: 'word_selected',
    WORD_TRANSLATED: 'word_translated',
    WORD_NOT_FOUND: 'word_not_found',
};
let selectionRect = null;

/**
 * Handles incoming messages for the offscreen context.
 *
 * @param {Object} message - The message object received.
 * @param {string} message.target - The target of the message, should be 'offscreen'.
 * @param {string} message.type - The type of operation to perform.
 * @returns {boolean} - Returns true if the message was handled, false otherwise.
 */
const handleMessages = async (message) => {
    if (message.target != 'content') {
        return false;
    }

    switch (message.type) {
        case WordOPType.WORD_TRANSLATED:
            if (isDebugMode) {
                console.log('Word translated: ', message.data);
            }
            translateComplete(message.data);
            break;
        case WordOPType.WORD_NOT_FOUND:
            if (isDebugMode) {
                console.log('Word not found: ', message.data);
            }
            break;
        default:
            if (isDebugMode) {
                console.warn(`Unexpected message type received: '${message.type}'.`);
            }
            return false;
    }

    return true;
};

chrome.runtime.onMessage.addListener(handleMessages);

/**
 * Sends a message to the background context with the given type and data.
 *
 * @param {string} type - The type of message to send.
 * @param {Object} data - The data of the message to send.
 */
const send2BackGround = (type, data) => {
    chrome.runtime.sendMessage({ target: 'background', type, data });
};

const getSelectionText = () => {
    let text = "";

    if (window.getSelection) {
        text = window.getSelection().toString();
        if (text.length != 0) {
            const range = window.getSelection().getRangeAt(0);
            selectionRect = range.getBoundingClientRect();
        }
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
        if (text.length != 0) {
            selectionRect = document.selection.createRange().getBoundingClientRect();
        }
    }

    return text;
}

let floatingContainer = null;

const translateComplete = (text) => {
    if (!selectionRect) {
        selectionRect = document.getSelection().getRangeAt(0).getBoundingClientRect();
    }

    // Split definition and translation into multiple lines
    const definitionLines = text.definition.split('\\n');
    const translationLines = text.translation.split('\\n');
    text.definition = definitionLines.join('<br>');
    text.translation = translationLines.join('<br>');
    console.log(definitionLines, translationLines);

    // Create floating container
    if (!floatingContainer) {
        floatingContainer = document.createElement('div');
        floatingContainer.classList.add('local-translate-root');
        floatingContainer.style.position = 'absolute';
        floatingContainer.style.left = `${selectionRect.left + window.scrollX}px`;
        floatingContainer.style.top = `${selectionRect.top + window.scrollY - 40}px`;
        floatingContainer.style.width = `auto`;
        floatingContainer.style.height = `auto`;
        floatingContainer.style.backgroundColor = `#ffffff`;
        floatingContainer.style.color = `#000000`;
        floatingContainer.innerHTML = `
            <div class="local-translate-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3>${text.word}</h3>
                <button class="local-translate-audio">Close</button>
            </div>
            <div class="local-translate-phonetic" style="margin-top: 0.5rem;">
                <p>/${text.phonetic}/</p>
            </div>
            <div class="local-translate-definition" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                <p>${text.definition}</p>
            </div>
            <div class="local-translate-translation" style="margin-top: 0.5rem;">
                <p>${text.translation}</p>
            </div>
        `;
        document.body.appendChild(floatingContainer);
    }
}

document.onmouseup = document.onkeyup = function () {
    let selectedText = getSelectionText().trim();
    if (selectedText.length == 0) {
        floatingContainer?.remove();
        floatingContainer = null;
        return;
    }
    console.log('Content: Text selected: ' + selectedText);
    send2BackGround(WordOPType.WORD_SELECTED, selectedText);
};