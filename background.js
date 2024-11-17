import { DictOPType, DictDefaultData, DictOffScreenDocPath, WordOPType } from "./constant.js";
import { IndexDBHelper } from "./indexedb.js";

let indexDb = new IndexDBHelper();

const createDocIfNotExist = async () => {
    if (!(await hasDocument())) {
        await chrome.offscreen.createDocument({
            url: DictOffScreenDocPath,
            reasons: [chrome.offscreen.Reason.DOM_PARSER],
            justification: 'DOM operate'
        });
    }
}

const initOnInstalled = async () => {
    await chrome.storage.local.set({ virgin: true });
    // Send message to offscreen
    await createDocIfNotExist();
    // console.log(`1. ${DictOPType.EXPORT_CSV_FILE}`)
    send2Offscreen(DictOPType.EXPORT_CSV_FILE, DictDefaultData);
}

const exportData2Database = async (csvObjects) => {
    // Check if database is opened
    if (!indexDb.isOpened()) {
        await indexDb.Init();
    }

    console.log(`Inserting data: ${csvObjects.length}`);

    // Insert data
    if (!(await indexDb.Insert(csvObjects))) {
        console.log("Insert data failed.");
        return false;
    }

    console.log(`Inserted data: ${csvObjects.length}`);

    // Request next chunk
    // console.log(`2. [background.js]: ${DictOPType.EXPORT_CSV_NEXT}`)
    send2Offscreen(DictOPType.EXPORT_CSV_NEXT, DictDefaultData);

    return true;
};

const handleMessages = async (message, sender) => {
    if (message.target !== 'background') return false;

    switch (message.type) {
        case DictOPType.EXPORT_CSV_NEXT:
            // console.log(`2. [offscreen.js]: ${DictOPType.EXPORT_CSV_NEXT}`)
            exportData2Database(message.data);
            break;
        case DictOPType.EXPORT_CSV_FINISHED:
            let { inserted, total } = message.data;
            if (inserted != total) {
                console.warn(`Insert data incomplete, inserted: ${inserted}, total: ${total}`);
            }
            // console.log(`3. [offscreen.js]: ${DictOPType.EXPORT_CSV_FINISHED}`)
            console.log("Export data finished.");
            break;
        case WordOPType.WORD_SELECTED:
            console.log("sender: ", sender);
            console.log('Text selected: ', message.data);
            English2Chinese(message.data, sender.tab.id);
            break;
        default:
            console.warn(`Unexpected message type received: '${message.type}'.`);
            return false;
    }

    return true;
}

const send2Offscreen = async (type, data) => {
    console.log('Send to offscreen');
    await createDocIfNotExist();
    chrome.runtime.sendMessage({ target: 'offscreen', type, data });
}

const send2Content = (type, data, id) => {
    console.log('Send to content: ', type, data, id);
    chrome.tabs.sendMessage(id, { target: 'content', type, data });
}

const hasDocument = async () => {
    // Check all windows controlled by the service worker if one of them is the offscreen document
    const matchedClients = await clients.matchAll();
    for (const client of matchedClients) {
        if (client.url.endsWith(DictOffScreenDocPath)) {
            return true;
        }
    }
    return false;
};

const closeOffscreenDocument = async () => {
    if (!(await hasDocument())) {
        return;
    }
    await chrome.offscreen.closeDocument();
}

const English2Chinese = async (text, tabId) => {
    // Match word against with database
    text = text.trim();
    // console.log("Text would be translated: " + text);
    try {
        // Check if database is opened
        if (!indexDb.isOpened()) {
            await indexDb.Init();
        }
        const translatedText = await indexDb.Search(text);
        // Reject if word not found
        if (!translatedText) {
            console.log("Word not found in database: " + text);
            return;
        }
        send2Content(WordOPType.WORD_TRANSLATED, translatedText, tabId);
    } catch (error) {
        send2Content(WordOPType.WORD_NOT_FOUND, error, tabId);
    }
};

chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason !== "install" && details.reason !== "update") return;
    initOnInstalled();
});

chrome.runtime.onMessage.addListener(handleMessages);

chrome.runtime.onSuspend.addListener(() => {
    console.log("Extension is being unloaded.");
    closeOffscreenDocument();
});

chrome.runtime.onStartup.addListener(async () => {
    // Fired when window is reopened
    console.log("onStartup");
});
