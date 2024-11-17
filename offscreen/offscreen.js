import { DictFilePath, DictOPType, DBChunkSize, DictFailedData, WordOPType } from "../constant.js";
import "../third-party/jquery/jquery-3.7.1.min.js"
import "../third-party/jquery/jquery.csv.js";

let insertCnt = 0;
let csvData = [];
let csvLength = 0;
let cnt = 0;
let remain = 0;

/**
 * Sends a message to the background context with the given type and data.
 *
 * @param {string} type - The type of message to send.
 * @param {Object} data - The data of the message to send.
 */
const send2BackGround = (type, data) => {
    chrome.runtime.sendMessage({ target: 'background', type, data });
};

/**
 * Handles incoming messages for the offscreen context.
 *
 * @param {Object} message - The message object received.
 * @param {string} message.target - The target of the message, should be 'offscreen'.
 * @param {string} message.type - The type of operation to perform.
 * @returns {boolean} - Returns true if the message was handled, false otherwise.
 */
const handleMessages = async (message) => {
    if (message.target != 'offscreen') {
        return false;
    }

    switch (message.type) {
        case DictOPType.EXPORT_CSV_FILE:
            parseExcel2Object();
            break;
        case DictOPType.EXPORT_CSV_NEXT:
            parseExcel2NextObject();
            break;
        case WordOPType.WORD_SELECTED:
            English2Chinese(message.data);
            break;
        default:
            console.warn(`Unexpected message type received: '${message.type}'.`);
            return false;
    }

    return true;
};

// Export data to database when installed
const parseExcel2Object = async () => {
    // Read data from csv file as text
    const response = await fetch(DictFilePath);
    const data = await response.text();
    // Parse data to object
    csvData = $.csv.toObjects(data, { headers: true, delimiter: "," });
    // console.log(csvData);

    csvLength = csvData.length;
    cnt = Math.floor(csvLength / DBChunkSize);
    remain = csvLength % DBChunkSize;

    // Calculate time consumed
    console.time("export2Database with DBChunkSize: " + DBChunkSize);
    let firstChunk = cnt-- > 0 ? csvData.slice(0, DBChunkSize) : csvData;

    insertCnt += firstChunk.length;

    // Response to background.js
    send2BackGround(DictOPType.EXPORT_CSV_NEXT, firstChunk);
};

const parseExcel2NextObject = () => {
    if (cnt-- > 0) {
        let nextChunk = csvData.slice(insertCnt, insertCnt + DBChunkSize);
        insertCnt += nextChunk.length;
        send2BackGround(DictOPType.EXPORT_CSV_NEXT, nextChunk);
    }
    else if (remain > 0) {
        let remainChunk = csvData.slice(insertCnt);
        insertCnt += remainChunk.length;
        remain = 0;
        send2BackGround(DictOPType.EXPORT_CSV_NEXT, remainChunk);
    }
    else {
        console.timeEnd("export2Database with DBChunkSize: " + DBChunkSize);
        send2BackGround(DictOPType.EXPORT_CSV_FINISHED, {
            inserted: insertCnt,
            total: csvLength
        });
    }
};

chrome.runtime.onMessage.addListener(handleMessages);
