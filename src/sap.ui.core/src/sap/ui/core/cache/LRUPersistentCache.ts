import Log from "sap/base/Log";
import Measurement from "sap/ui/performance/Measurement";
export class LRUPersistentCache {
    static init(...args: any) {
        this._metadata = {};
        this._mru = -1;
        this._lru = -1;
        return initIndexedDB(this);
    }
    private static _destroy(...args: any) {
        if (this._db.close) {
            this._db.close();
        }
        this._metadata = null;
        this._ui5version = null;
    }
    static set(key: any, value: any) {
        if (keyMatchesExclusionStrings(key)) {
            Log.warning("Cache Manager ignored 'set' for key [" + key + "]");
            return Promise.resolve();
        }
        if (key == null) {
            return Promise.reject("Cache Manager does not accept undefined or null as key");
        }
        if (typeof value === "undefined") {
            return Promise.reject("Cache Manager does not accept undefined as value");
        }
        Log.debug("Cache Manager LRUPersistentCache: adding item with key [" + key + "]...");
        var self = this, sMsrTotal = "[sync ] fnSet: total[sync]  key [" + key + "]", sMsrOpeningTx = "[sync ] fnSet: txStart[sync]  key [" + key + "]", sMsrOpeningStores = "[sync ] fnSet: storeOpen[sync]  key [" + key + "]", sMsrPutContent = "[sync ] fnSet: putContent[sync]  key [" + key + "]", sMsrPutMetadata = "[sync ] fnSet: putMetadata[sync]  key [" + key + "]", sMsrSerialize = "[sync ] fnSet: serialize[sync]  key [" + key + "]";
        return new Promise(function fnSet(resolve, reject) {
            Measurement.start(sMsrTotal, "CM", sMsrCatSet);
            var objectStore, objectStoreRequest, objectMetadataStore, oItem, backupMetadata;
            backupMetadata = cloneMetadata(self._metadata);
            oItem = new Item(key, value, typeof value, ++self._mru, sMsrSerialize, sMsrCatSet).serialize();
            Measurement.start(sMsrOpeningTx, "CM", sMsrCatSet);
            var transaction = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
            Measurement.end(sMsrOpeningTx);
            transaction.onerror = function (event) {
                var sMessage = "Cache Manager cannot complete add/put transaction for entry with key: " + oItem.oData.key + ". Details: " + collectErrorData(event);
                Log.error(sMessage);
                self._metadata = backupMetadata;
                assignRUCounters(self);
                reject(sMessage);
            };
            transaction.onabort = function (event) {
                self._metadata = backupMetadata;
                assignRUCounters(self);
                var iOriginalItemCount = getItemCount(self);
                if (isQuotaExceeded(event) && iOriginalItemCount > 0) {
                    Log.warning("Cache Manager is trying to free some space to add/put new item");
                    cleanAndStore(self, key, value).then(function () {
                        Log.debug("Cache Manager LRUPersistentCache: set completed after freeing space. ItemCount changed from " + iOriginalItemCount + " to " + getItemCount(self));
                        resolve();
                    }, function (sMessage) {
                        var sMsg = "Cache Manager LRUPersistentCache: set unsuccessful. Cannot free space to add/put entry. Details: " + sMessage;
                        Log.error(sMsg);
                        reject(sMsg);
                    });
                }
                else {
                    var sErrMsg = "Cache Manager LRUPersistentCache: set failed: " + collectErrorData(event);
                    Log.error(sErrMsg);
                    reject(sErrMsg);
                }
            };
            transaction.oncomplete = function () {
                Log.debug("Cache Manager LRUPersistentCache: adding item with key [" + key + "]... done");
                resolve();
            };
            Measurement.start(sMsrOpeningStores, "CM", sMsrCatSet);
            objectStore = transaction.objectStore(self.defaultOptions._contentStoreName);
            objectMetadataStore = transaction.objectStore(self.defaultOptions._metadataStoreName);
            Measurement.end(sMsrOpeningStores);
            Measurement.start(sMsrPutContent, "CM", sMsrCatSet);
            objectStoreRequest = objectStore.put(oItem.oData, oItem.oData.key);
            Measurement.end(sMsrPutContent);
            Measurement.end(sMsrTotal);
            objectStoreRequest.onsuccess = function () {
                updateItemUsage(self, oItem);
                Measurement.start(sMsrPutMetadata, "CM", sMsrCatSet);
                objectMetadataStore.put(self._metadata, self.defaultOptions._metadataKey);
                Measurement.end(sMsrPutMetadata);
            };
            if (Log.getLevel() >= Log.Level.DEBUG) {
                Log.debug("Cache Manager LRUPersistentCache: measurements: " + sMsrTotal + ": " + Measurement.getMeasurement(sMsrTotal).duration + "; " + sMsrSerialize + ": " + Measurement.getMeasurement(sMsrSerialize).duration + "; " + sMsrOpeningTx + ": " + Measurement.getMeasurement(sMsrOpeningTx).duration + "; " + sMsrOpeningStores + ": " + Measurement.getMeasurement(sMsrOpeningStores).duration + "; " + sMsrPutContent + ": " + Measurement.getMeasurement(sMsrPutContent).duration + "; " + sMsrPutMetadata + ": " + Measurement.getMeasurement(sMsrPutMetadata).duration);
            }
        });
    }
    static has(key: any) {
        if (keyMatchesExclusionStrings(key)) {
            Log.warning("Cache Manager ignored 'has' for key [" + key + "]");
            return Promise.resolve(false);
        }
        return this.get(key).then(function (value) {
            return typeof value !== "undefined";
        });
    }
    private static _getCount(...args: any) {
        return Promise.resolve(getItemCount(this));
    }
    private static _getAll(bDeserialize: any) {
        var self = this, oItem, sMsrDeserialize = "[sync ] _getAll: deserialize";
        return new Promise(function (resolve, reject) {
            var entries = [], transaction = self._db.transaction([self.defaultOptions._contentStoreName], "readonly"), objectStore = transaction.objectStore(self.defaultOptions._contentStoreName);
            transaction.onerror = function (event) {
                reject(collectErrorData(event));
            };
            transaction.oncomplete = function (event) {
                resolve(entries);
            };
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor && cursor.value) {
                    oItem = new Item(cursor.value, sMsrDeserialize, sMsrCatGet).deserialize();
                    entries.push({
                        key: oItem.oData.key,
                        value: oItem.oData.value
                    });
                    cursor.continue();
                }
            };
        });
    }
    private static _loadMetaStructure(...args: any) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var transaction = self._db.transaction([self.defaultOptions._metadataStoreName], "readonly");
            transaction.onerror = function (event) {
                if (!transaction.errorHandled) {
                    transaction.errorHandled = true;
                    var sMessage = "Cache Manager cannot complete transaction for read metadata. Details: " + transaction.error;
                    Log.error(sMessage);
                    reject(sMessage);
                }
            };
            var objectStore = transaction.objectStore(self.defaultOptions._metadataStoreName);
            try {
                var objectStoreRequest = objectStore.get(self.defaultOptions._metadataKey);
                objectStoreRequest.onsuccess = function (event) {
                    self._metadata = objectStoreRequest.result ? objectStoreRequest.result : initMetadata(self._ui5version);
                    if (self._metadata.__ui5version !== self._ui5version) {
                        self.reset().then(resolve, function (e) {
                            Log.error("Cannot reset the cache. Details:" + e);
                            transaction.abort();
                        });
                    }
                    else {
                        resolve();
                    }
                };
                objectStoreRequest.onerror = function (event) {
                    Log.error("Cache Manager cannot complete transaction for read metadata items. Details: " + event.message);
                    reject(event.message);
                };
            }
            catch (e) {
                Log.error("Cache Manager cannot read metadata entries behind key: " + self.defaultOptions._metadataKey + ". Details: " + e.message);
                reject(e.message);
            }
        });
    }
    static get(key: any) {
        if (keyMatchesExclusionStrings(key)) {
            Log.warning("Cache Manager ignored 'get' for key [" + key + "]");
            return Promise.resolve();
        }
        return get(this, key);
    }
    static del(key: any) {
        if (keyMatchesExclusionStrings(key)) {
            Log.warning("Cache Manager ignored 'del' for key [" + key + "]");
            return Promise.resolve();
        }
        return del(this, key);
    }
    static reset(...args: any) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var genericStore, metadataStore, clearGenericStoreReq, clearMetadataStoreReq, transaction;
            transaction = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
            transaction.onerror = transaction.onabort = function (event) {
                if (!transaction.errorHandled) {
                    transaction.errorHandled = true;
                    var sMessage = "Cache Manager LRUPersistentCache: transaction for reset() failed. Details: " + transaction.error;
                    Log.error(sMessage);
                    reject(sMessage);
                }
            };
            transaction.oncomplete = function (event) {
                resolve();
            };
            genericStore = transaction.objectStore(self.defaultOptions._contentStoreName);
            metadataStore = transaction.objectStore(self.defaultOptions._metadataStoreName);
            try {
                clearGenericStoreReq = genericStore.clear();
                clearGenericStoreReq.onerror = function () {
                    transaction.abort();
                };
                clearGenericStoreReq.onsuccess = function () {
                    clearMetadataStoreReq = metadataStore.clear();
                    clearMetadataStoreReq.onerror = function () {
                        transaction.abort();
                    };
                    clearMetadataStoreReq.onsuccess = function () {
                        self._metadata = initMetadata(sap.ui.version);
                        assignRUCounters(self);
                    };
                };
            }
            catch (e) {
                transaction.abort();
            }
        });
    }
}
var sMsrCatGet = "LRUPersistentCache,get", sMsrCatSet = "LRUPersistentCache,set", iMsrCounter = 0;
function scheduleMetadataSave(self) {
    var transaction = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
    transaction.onerror = transaction.onabort = function (event) {
        Log.warning("Cache Manager cannot persist the information about usage of an entry. This may lead to earlier removal of the entry if browser storage space is over. Details: " + transaction.error);
    };
    try {
        transaction.objectStore(self.defaultOptions._metadataStoreName).put(self._metadata, self.defaultOptions._metadataKey);
    }
    catch (e) {
        Log.warning("Cache Manager cannot persist the information about usage of an entry. This may lead to earlier removal of the entry if browser storage space is over. Details: " + e.message);
    }
}
function del(self, key) {
    return new Promise(function (resolve, reject) {
        var tx, oMetadataBackup;
        tx = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
        oMetadataBackup = cloneMetadata(self._metadata);
        function errorHandler(event) {
            self._metadata = oMetadataBackup;
            assignRUCounters(self);
            var sMessage = "Cache Manager LRUPersistentCache: cannot delete item with key: " + key + ". Details: " + collectErrorData(event);
            Log.error(sMessage);
            reject(sMessage);
        }
        tx.onerror = errorHandler;
        tx.onabort = errorHandler;
        tx.oncomplete = function () {
            if (getItemCount(self) === 0) {
                self._lru = -1;
                self._mru = -1;
                self._metadata = initMetadata(self._ui5version);
            }
            Log.debug("Cache Manager LRUPersistentCache: item with key " + key + " deleted");
            resolve();
        };
        Log.debug("Cache Manager LRUPersistentCache: deleting item [" + key + "]");
        var oDeleteRst = tx.objectStore(self.defaultOptions._contentStoreName).delete(key);
        oDeleteRst.onsuccess = function () {
            Log.debug("Cache Manager LRUPersistentCache: request for deleting item [" + key + "] is successful, updating metadata...");
            deleteMetadataForEntry(self, key);
            tx.objectStore(self.defaultOptions._metadataStoreName).put(self._metadata, self.defaultOptions._metadataKey);
        };
    });
}
function get(self, key) {
    if (self.getCounter === undefined) {
        self.getCounter = 0;
    }
    self.getCounter++;
    var sMsrTotal = "[sync ] fnGet" + self.getCounter + ": total[sync]  key [" + key + "]", sMsrOpeningTx = "[sync ] fnGet" + self.getCounter + ": txStart[sync]  key [" + key + "]", sMsrOpeningStores = "[sync ] fnGet" + self.getCounter + ": storeOpen[sync]  key [" + key + "]", sMsrAccessingResult = "[sync ] fnGet" + self.getCounter + ": access result[sync]  key [" + key + "]", sMsrPutMetadata = "[sync ] fnGet" + self.getCounter + ": putMetadata[sync]  key [" + key + "]", sMsrDeserialize = "[sync ] fnGet" + self.getCounter + ": deserialize[sync]  key [" + key + "]", sMsrImplementationGet = "[sync ]  _instance.get", sMsrGetRequestOnSuccess = "[sync ]  getRequest.onSuccess";
    Log.debug("Cache Manager LRUPersistentCache: get for key [" + key + "]...");
    Measurement.start(sMsrImplementationGet, "CM", sMsrCatGet);
    var p = new Promise(function fnGet(resolve, reject) {
        var result, transaction, getRequest, oItem;
        Measurement.start(sMsrTotal, "CM", sMsrCatGet);
        Measurement.start(sMsrOpeningTx, "CM", sMsrCatGet);
        transaction = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
        Measurement.end(sMsrOpeningTx);
        transaction.onerror = function (event) {
            var sMessage = "Cache Manager cannot complete delete transaction for entry with key: " + key + ". Details: " + transaction.error;
            Log.error(sMessage);
            reject(sMessage);
        };
        try {
            Measurement.start(sMsrOpeningStores, "CM", sMsrCatGet);
            getRequest = transaction.objectStore(self.defaultOptions._contentStoreName).get(key);
            Measurement.end(sMsrOpeningStores);
            getRequest.onsuccess = function (event) {
                Measurement.start(sMsrGetRequestOnSuccess, "CM", sMsrCatGet);
                Measurement.start(sMsrAccessingResult, "CM", sMsrCatGet);
                oItem = new Item(getRequest.result, sMsrDeserialize, sMsrCatGet);
                Measurement.end(sMsrAccessingResult);
                debugMsr("Cache Manager LRUPersistentCache: accessing the result", key, sMsrAccessingResult);
                if (oItem.oData) {
                    Measurement.start(sMsrPutMetadata, "CM", sMsrCatGet);
                    if (oItem.oData.lu !== self._mru) {
                        oItem.oData.lu = ++self._mru;
                        updateItemUsage(self, oItem);
                        scheduleMetadataSave(self);
                    }
                    Measurement.end(sMsrPutMetadata);
                    result = oItem.deserialize().oData.value;
                }
                Measurement.end(sMsrGetRequestOnSuccess);
                Log.debug("Cache Manager LRUPersistentCache: get for key [" + key + "]...done");
                resolve(result);
            };
            getRequest.onerror = function (event) {
                Log.error("Cache Manager cannot get entry with key: " + key + ". Details: " + event.message);
                reject(event.message);
            };
        }
        catch (e) {
            Log.error("Cache Manager cannot get entry with key: " + key + ". Details: " + e.message);
            reject(e.message);
            return;
        }
        Measurement.end(sMsrTotal);
    });
    Measurement.end(sMsrImplementationGet);
    return p;
}
function deleteItemAndUpdateMetadata(self) {
    var vKeyToDelete = getNextItemToDelete(self);
    if (vKeyToDelete == undefined) {
        var sErrMsg = "Cache Manager LRUPersistentCache: deleteItemAndUpdateMetadata cannot find item to delete";
        Log.debug(sErrMsg);
        return Promise.reject(sErrMsg);
    }
    return internalDel(self, vKeyToDelete).then(function () {
        return Promise.resolve().then(function () {
            deleteMetadataForEntry(self, vKeyToDelete);
            return persistMetadata(self).then(function () {
                return vKeyToDelete;
            }, function () {
                Log.warning("Cache Manager LRUPersistentCache: Free space algorithm deleted item " + "but the metadata changes could not be persisted. This won't break the functionality.");
                return vKeyToDelete;
            });
        });
    });
}
function persistMetadata(self) {
    return new Promise(function (resolve, reject) {
        try {
            var tx = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
            tx.onerror = errorHandler;
            tx.onabort = errorHandler;
            tx.oncomplete = function () {
                Log.debug("Cache Manager LRUPersistentCache: persistMetadata - metadata was successfully updated");
                resolve();
            };
            tx.objectStore(self.defaultOptions._metadataStoreName).put(self._metadata, self.defaultOptions._metadataKey);
        }
        catch (e) {
            errorHandler(null, e);
        }
        function errorHandler(event, exception) {
            var sErrMsg = "Cache Manager LRUPersistentCache: persistMetadata error - metadata was not successfully persisted. Details: " + collectErrorData(event) + ". Exception: " + (exception ? exception.message : "");
            Log.debug(sErrMsg);
            reject(sErrMsg);
        }
    });
}
function internalDel(self, key) {
    return new Promise(function (resolve, reject) {
        var tx = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
        function errorHandler(event) {
            var sMessage = "Cache Manager LRUPersistentCache: internalDel cannot complete delete transaction for entry with key: " + key + ". Details: " + collectErrorData(event);
            Log.warning(sMessage);
            reject(event);
        }
        tx.onerror = errorHandler;
        tx.onabort = errorHandler;
        tx.oncomplete = function () {
            if (getItemCount(self) === 0) {
                self._lru = 0;
                self._mru = 0;
                self._metadata = initMetadata(self._ui5version);
            }
            Log.debug("Cache Manager LRUPersistentCache: internalDel deleting item [" + key + "]...done");
            resolve();
        };
        Log.debug("Cache Manager LRUPersistentCache: internalDel deleting item [" + key + "]...");
        tx.objectStore(self.defaultOptions._contentStoreName).delete(key);
    });
}
function internalSet(self, key, value) {
    return new Promise(function (resolve, reject) {
        var objectStoreRequest, transaction, backupMetadata, sMsrSerialize = "[sync ] internalSet: serialize[sync]  key [" + key + "]";
        backupMetadata = cloneMetadata(self._metadata);
        var oItem = new Item(key, value, typeof value, ++self._mru, sMsrSerialize, sMsrCatSet).serialize();
        Log.debug("Cache Manager: LRUPersistentCache: internal set with parameters: key [" + oItem.oData.key + "], access index [" + oItem.oData.lu + "]");
        transaction = self._db.transaction([self.defaultOptions._contentStoreName, self.defaultOptions._metadataStoreName], "readwrite");
        transaction.onerror = errorHandler;
        transaction.onabort = errorHandler;
        function errorHandler(event) {
            Log.debug("Cache Manager: LRUPersistentCache: internal set failed. Details: " + collectErrorData(event));
            self._metadata = backupMetadata;
            assignRUCounters(self);
            reject(event);
        }
        transaction.oncomplete = function () {
            Log.debug("Cache Manager: LRUPersistentCache: Internal set transaction completed. ItemCount: " + getItemCount(self));
            resolve();
        };
        objectStoreRequest = transaction.objectStore(self.defaultOptions._contentStoreName).put(oItem.oData, oItem.oData.key);
        objectStoreRequest.onsuccess = function () {
            updateItemUsage(self, oItem);
            transaction.objectStore(self.defaultOptions._metadataStoreName).put(self._metadata, self.defaultOptions._metadataKey);
        };
    });
}
function updateItemUsage(self, oItem) {
    if (self._metadata.__byKey__[oItem.oData.key] != null) {
        var oldIndex = self._metadata.__byKey__[oItem.oData.key];
        delete self._metadata.__byIndex__[oldIndex];
        Log.debug("Cache Manager LRUPersistentCache: set/internalset - item already exists, so its indexes are updated");
    }
    self._metadata.__byIndex__[oItem.oData.lu] = oItem.oData.key;
    self._metadata.__byKey__[oItem.oData.key] = oItem.oData.lu;
    seekMetadataLRU(self);
}
function initIndexedDB(instance) {
    instance._ui5version = sap.ui.version;
    return new Promise(function executorInitIndexedDB(resolve, reject) {
        var DBOpenRequest;
        Log.debug("Cache Manager " + "_initIndexedDB started");
        function openDB() {
            try {
                DBOpenRequest = window.indexedDB.open(instance.defaultOptions.databaseName, 1);
            }
            catch (e) {
                Log.error("Could not open Cache Manager database. Details: " + e.message);
                reject(e.message);
            }
        }
        openDB();
        DBOpenRequest.onerror = function (event) {
            Log.error("Could not initialize Cache Manager database. Details: " + event.message);
            reject(event.error);
        };
        DBOpenRequest.onsuccess = function (event) {
            var oMsr = startMeasurements("init_onsuccess");
            instance._db = DBOpenRequest.result;
            instance._db.onversionchange = function (event) {
                if (!event.newVersion) {
                    event.target.close();
                }
            };
            instance._loadMetaStructure().then(function () {
                Log.debug("Cache Manager " + " metadataLoaded. Serialization support: " + isSerializationSupportOn() + ", resolving initIndexDb promise");
                resolve(instance);
            }, reject);
            oMsr.endSync();
        };
        DBOpenRequest.onupgradeneeded = function (event) {
            var db = event.target.result;
            db.onerror = function (event) {
                Log.error("Cache Manager error. Details: " + event.message);
                reject(db.error);
            };
            try {
                var objectStore = db.createObjectStore(instance.defaultOptions._contentStoreName);
                db.createObjectStore(instance.defaultOptions._metadataStoreName);
            }
            catch (e) {
                Log.error("Could not initialize Cache Manager object store. Details: " + e.message);
                throw e;
            }
            objectStore.createIndex("ui5version", "ui5version", { unique: false });
        };
    });
}
function ItemData(key, value, type, lastUsedIndex) {
    this.key = key;
    this.sOrigType = type;
    this.value = value;
    this.lu = lastUsedIndex;
}
function Item(key, value, type, lastUsedIndex, sMeasureId, sMsrCat) {
    if (arguments.length === 3) {
        this.oData = key;
        this.sMeasureId = value;
        this.sMsrCat = type;
    }
    else {
        this.oData = new ItemData(key, value, type, lastUsedIndex);
    }
}
Item.prototype.deserialize = function () {
    if (isSerializationSupportOn() && this.oData.sOrigType === "object") {
        Measurement.start(this.sMeasureId, this.sMeasureId, this.sMsrCat);
        this.oData.value = JSON.parse(this.oData.value);
        Measurement.end(this.sMeasureId);
        debugMsr("Cache Manager LRUPersistentCache: de-serialization the result", this.oData.key, this.sMeasureId);
    }
    return this;
};
Item.prototype.serialize = function () {
    if (isSerializationSupportOn() && this.oData.sOrigType === "object") {
        Measurement.start(this.sMeasureId, this.sMeasureId, this.sMsrCat);
        this.oData.value = JSON.stringify(this.oData.value);
        Measurement.end(this.sMeasureId);
        debugMsr("Cache Manager LRUPersistentCache: serialization of the value", this.oData.key, this.sMeasureId);
    }
    return this;
};
function initMetadata(ui5version) {
    return {
        __byKey__: {},
        __byIndex__: {},
        __ui5version: ui5version
    };
}
function cloneMetadata(source) {
    var backupMetadata = initMetadata(source.__ui5version);
    for (var index in source.__byIndex__) {
        backupMetadata.__byIndex__[index] = source.__byIndex__[index];
    }
    for (var key in source.__byKey__) {
        backupMetadata.__byKey__[key] = source.__byKey__[key];
    }
    return backupMetadata;
}
function assignRUCounters(self) {
    var lrumru = computeLRUMRU(self._metadata.__byIndex__);
    self._mru = lrumru.mru;
    self._lru = lrumru.lru;
    Log.debug("Cache Manager LRUPersistentCache: LRU counters are assigned to the CM: " + JSON.stringify(lrumru));
}
function getItemCount(self) {
    return Object.keys(self._metadata.__byKey__).length;
}
function getNextItemToDelete(self) {
    var oKey = self._metadata.__byIndex__[self._lru];
    if (oKey == undefined && !seekMetadataLRU(self)) {
        return null;
    }
    else {
        return self._metadata.__byIndex__[self._lru];
    }
}
function computeLRUMRU(lruIndexes) {
    var i = -1, mru = -1, lru = Number.MAX_VALUE, aLruIndexKeys = Object.keys(lruIndexes), iLength = aLruIndexKeys.length;
    if (iLength === 0) {
        return { mru: -1, lru: -1 };
    }
    else {
        while (++i < iLength) {
            var iIndex = parseInt(aLruIndexKeys[i]);
            if (mru < iIndex) {
                mru = iIndex;
            }
            if (lru > iIndex) {
                lru = iIndex;
            }
        }
        return { mru: mru, lru: lru };
    }
}
function cleanAndStore(self, key, value) {
    return new Promise(function (resolve, reject) {
        var attempt = 0;
        _cleanAndStore(self, key, value);
        function _cleanAndStore(self, key, value) {
            attempt++;
            Log.debug("Cache Manager LRUPersistentCache: cleanAndStore: freeing space attempt [" + (attempt) + "]");
            deleteItemAndUpdateMetadata(self).then(function (deletedKey) {
                Log.debug("Cache Manager LRUPersistentCache: cleanAndStore: deleted item with key [" + deletedKey + "]. Going to put " + key);
                return internalSet(self, key, value).then(resolve, function (event) {
                    if (isQuotaExceeded(event)) {
                        Log.debug("Cache Manager LRUPersistentCache: cleanAndStore: QuotaExceedError during freeing up space...");
                        if (getItemCount(self) > 0) {
                            _cleanAndStore(self, key, value);
                        }
                        else {
                            reject("Cache Manager LRUPersistentCache: cleanAndStore: even when the cache is empty, the new item with key [" + key + "] cannot be added");
                        }
                    }
                    else {
                        reject("Cache Manager LRUPersistentCache: cleanAndStore: cannot free space: " + collectErrorData(event));
                    }
                });
            }, reject);
        }
    });
}
function isQuotaExceeded(event) {
    return (event && event.target && event.target.error && event.target.error.name === "QuotaExceededError");
}
function deleteMetadataForEntry(self, key) {
    var iIndex = self._metadata.__byKey__[key];
    delete self._metadata.__byKey__[key];
    delete self._metadata.__byIndex__[iIndex];
    seekMetadataLRU(self);
}
function seekMetadataLRU(self) {
    while (self._lru <= self._mru && self._metadata.__byIndex__[self._lru] == undefined) {
        self._lru++;
    }
    return (self._lru <= self._mru);
}
function collectErrorData(event) {
    if (!event) {
        return "";
    }
    var sResult = event.message;
    if (event.target && event.target.error && event.target.error.name) {
        sResult += " Error name: " + event.target.error.name;
    }
    return sResult;
}
function isSerializationSupportOn() {
    return sap.ui.getCore().getConfiguration().isUI5CacheSerializationSupportOn();
}
function getExcludedKeys() {
    return sap.ui.getCore().getConfiguration().getUI5CacheExcludedKeys();
}
function keyMatchesExclusionStrings(key) {
    return getExcludedKeys().some(function (excludedKey) {
        return key.indexOf(excludedKey) > -1;
    });
}
function startMeasurements(sOperation, key) {
    iMsrCounter++;
    var sMeasureAsync = "[async]  " + sOperation + "[" + key + "]- #" + (iMsrCounter), sMeasureSync = "[sync ]  " + sOperation + "[" + key + "]- #" + (iMsrCounter);
    Measurement.start(sMeasureAsync, "CM", ["LRUPersistentCache", sOperation]);
    Measurement.start(sMeasureSync, "CM", ["LRUPersistentCache", sOperation]);
    return {
        sMeasureAsync: sMeasureAsync,
        sMeasureSync: sMeasureSync,
        endAsync: function () {
            Measurement.end(this.sMeasureAsync);
        },
        endSync: function () {
            Measurement.end(this.sMeasureSync);
        }
    };
}
function debugMsr(sMsg, sKey, sMsrId) {
    if (Log.getLevel() >= Log.Level.DEBUG) {
        Log.debug(sMsg + " for key [" + sKey + "] took: " + Measurement.getMeasurement(sMsrId).duration);
    }
}