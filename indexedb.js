import { DBName, DBVersion, DictTableName, DictUniqueIndexName } from "./constant.js";

class IndexDBHelper {
    /**
     * Initializes the database.
     *
     * Opens the database and creates the table and index if they don't exist.
     *
     * @returns {Promise} - Resolves when the database is ready, rejects if any error occurs
     */
    async Init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DBName, DBVersion);

            request.onerror = (event) => {
                console.log("Database error: " + event.target.error?.message);
                reject("Database error: " + event.target.error?.message);
            };

            request.onupgradeneeded = (event) => {
                this.db_ = event.target.result;

                const objectStore = this.db_.createObjectStore(DictTableName, { autoIncrement: true });

                // 创建索引
                objectStore.createIndex(DictUniqueIndexName, DictUniqueIndexName, { unique: false });
            };

            request.onsuccess = (event) => {
                this.db_ = event.target.result;
                this.opened_ = true;
                console.log("Database opened.");
                resolve();  // 解决 Promise
            };
        });
    }


    /**
     * Inserts a list of words into the database.
     * @param {array} dataArr - a list of words object
     * @returns {Promise} - Resolves when all inserts are done, rejects if any error occurs
     */
    async Insert(dataArr) {
        return new Promise((resolve, reject) => {
            if (!this.opened_) {
                console.log("Database is not opened.");
                reject("Database is not opened.");
                return;
            }
            if (dataArr.length == 0) {
                reject("No data to insert.");
                return;
            }

            const transaction = this.db_.transaction(DictTableName, "readwrite");
            const objectStore = transaction.objectStore(DictTableName);

            let errorOccurred = false;

            dataArr.forEach(data => {
                const request = objectStore.add(data);
                request.onerror = (event) => {
                    console.log("Database insert error: " + event.target.error?.message);
                    errorOccurred = true;
                };
                request.onsuccess = (event) => {
                    // Console log if needed for each success (optional)
                    // console.log("Database insert success.");
                };
            });

            transaction.oncomplete = () => {
                if (errorOccurred) {
                    reject("Some inserts failed.");
                } else {
                    resolve("All data inserted successfully.");
                }
            };

            transaction.onerror = (event) => {
                console.log("Transaction error: " + event.target.error?.message);
                reject("Transaction failed.");
            };
        });
    }


    /**
     * Appends a word object into the database.
     * @param {object} data - a word object
     * @returns {Promise} - Resolves when append is done, rejects if error occurs
     */
    async Append(data) {
        return new Promise((resolve, reject) => {
            if (!this.opened_) {
                console.log("Database is not opened.");
                reject("Database is not opened.");
                return;
            }

            const transaction = this.db_.transaction(DictTableName, "readwrite");
            const objectStore = transaction.objectStore(DictTableName);
            const request = objectStore.add(data);

            request.onerror = (event) => {
                console.log("Database append error: " + event.target.error?.message);
                reject("Append failed.");
            };

            request.onsuccess = (event) => {
                // console.log("Database append success.");
                resolve("Data appended successfully.");
            };

            transaction.onerror = (event) => {
                console.log("Transaction error: " + event.target.error?.message);
                reject("Transaction failed.");
            };
        });
    }

    async Search(word) {
        return new Promise((resolve, reject) => {
            if (!this.opened_) {
                console.log("Database is not opened.");
                reject("Database is not opened.");
                return;
            }

            if (word.length == 0) {
                return;
            }

            const transaction = this.db_.transaction(DictTableName, "readonly");
            const objectStore = transaction.objectStore(DictTableName);
            const index = objectStore.index(DictUniqueIndexName);
            const request = index.get(word);

            request.onerror = (event) => {
                console.log("Database search error: " + event.target.error?.message);
                reject("Search failed.");
            };

            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    resolve(result);
                } else {
                    reject("Word not found.");
                }
            };
        });
    }

    isOpened() {
        return this.opened_;
    }

    // Member fields
    db_;
    opened_ = false;
}

export {
    IndexDBHelper,
};