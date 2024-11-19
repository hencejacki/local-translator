// Popup constants
const checkItems = [
    {
        "id": 0,
        "option": "Phonetic",
        "defaultChecked": true
    },
    {
        "id": 1,
        "option": "Definition",
        "defaultChecked": false
    },
    {
        "id": 2,
        "option": "Collins",
        "defaultChecked": false
    },
    {
        "id": 3,
        "option": "Oxford",
        "defaultChecked": false
    },
    {
        "id": 4,
        "option": "Tag",
        "defaultChecked": false
    },
    {
        "id": 5,
        "option": "Bnc",
        "defaultChecked": false
    },
    {
        "id": 6,
        "option": "Frequency",
        "defaultChecked": true
    },
    {
        "id": 7,
        "option": "Exchange",
        "defaultChecked": false
    },
    {
        "id": 8,
        "option": "Detail",
        "defaultChecked": false
    },
    {
        "id": 9,
        "option": "Audio",
        "defaultChecked": false
    }
];

const LoadType = {
    LOAD_FROM_CACHE: 0,
    LOAD_FROM_LOCAL: 1
}

// IndexDB constants
const DBName = "local-translation";
const DBVersion = 1;
const DictTableName = "dict";
const DictUniqueIndexName = "word";

// Dict constants
const DictFilePath = "../data/ecdict.csv";
const DictOPType = {
    EXPORT_CSV_FILE: 'export_csv_file',
    EXPORT_CSV_NEXT: 'export_csv_next',
    EXPORT_CSV_FINISHED: 'export_csv_finished',
};
const DictDefaultData = "Oh my God";
const DictFailedData = "holy shit";
const DictOffScreenDocPath = "offscreen/offscreen.html";

// IndexDB constants
const DBChunkSize = 50000;
/**
 * export2Database with DBChunkSize: 10000: 84434.31909179688 ms
 * export2Database with DBChunkSize: 20000: 97092.59814453125 ms
 * export2Database with DBChunkSize: 30000: 86558.19409179688 ms
 * export2Database with DBChunkSize: 30000: 83573.93701171875 ms
 * export2Database with DBChunkSize: 40000: 86095.26391601562 ms
 * export2Database with DBChunkSize: 40000: 94634.39184570312 ms
 * export2Database with DBChunkSize: 40000: 85123.88012695312 ms
 * export2Database with DBChunkSize: 50000: 84594.60498046875 ms
 * export2Database with DBChunkSize: 50000: 86733.40112304688 ms
 * export2Database with DBChunkSize: 50000: 94931.90307617188 ms
 */

// Word constants
const WordOPType = {
    WORD_SELECTED: 'word_selected',
    WORD_TRANSLATED: 'word_translated',
    WORD_NOT_FOUND: 'word_not_found',
};

const isDebugMode = true;

export {
    checkItems,
    LoadType,
    DBName,
    DBVersion,
    DictTableName,
    DictUniqueIndexName,
    DictFilePath,
    DictOPType,
    DictDefaultData,
    DictFailedData,
    DictOffScreenDocPath,
    DBChunkSize,
    WordOPType,
    isDebugMode,
};