import assert from "sap/base/assert";
export class Storage {
    static Type = {
        local: "local",
        session: "session"
    };
    constructor(pStorage: any, sStorageKeyPrefix: any) {
        var sType = "unknown", sPrefix = (sStorageKeyPrefix || STATE_STORAGE_KEY_PREFIX) + "-", oStorageImpl;
        if (!pStorage || typeof (pStorage) === "string") {
            sType = pStorage || Storage.Type.session;
            try {
                oStorageImpl = window[sType + "Storage"];
                if (oStorageImpl) {
                    var sTestKey = sPrefix + "___sapui5TEST___";
                    oStorageImpl.setItem(sTestKey, "1");
                    oStorageImpl.removeItem(sTestKey);
                }
            }
            catch (e) {
                oStorageImpl = null;
            }
        }
        else if (typeof (pStorage) === "object") {
            sType = pStorage.getType ? pStorage.getType() : "unknown";
            oStorageImpl = pStorage;
        }
        var hasExecuted = function (fnToExecute) {
            try {
                if (this.isSupported()) {
                    fnToExecute();
                    return true;
                }
            }
            catch (e) {
                return false;
            }
            return false;
        }.bind(this);
        this.isSupported = function () {
            return typeof (oStorageImpl.isSupported) == "function" ? oStorageImpl.isSupported() : true;
        };
        this.put = function (sKey, sStateToStore) {
            assert(typeof sKey === "string" && sKey.length > 0, "key must be a non-empty string");
            return hasExecuted(function () {
                oStorageImpl.setItem(sPrefix + sKey, JSON.stringify(sStateToStore));
            });
        };
        this.get = function (sKey) {
            assert(typeof sKey === "string" && sKey.length > 0, "key must be a non-empty string");
            var oData;
            hasExecuted(function () {
                oData = JSON.parse(oStorageImpl.getItem(sPrefix + sKey));
            });
            return oData !== undefined ? oData : null;
        };
        this.remove = function (sKey) {
            assert(typeof sKey === "string" && sKey.length > 0, "key must be a non-empty string");
            return hasExecuted(function () {
                oStorageImpl.removeItem(sPrefix + sKey);
            });
        };
        this.removeAll = function (sIdPrefix) {
            return hasExecuted(function () {
                var p = sPrefix + (sIdPrefix || ""), keysToRemove = [], key, i;
                for (i = 0; i < oStorageImpl.length; i++) {
                    key = oStorageImpl.key(i);
                    if (key && key.startsWith(p)) {
                        keysToRemove.push(key);
                    }
                }
                for (i = 0; i < keysToRemove.length; i++) {
                    oStorageImpl.removeItem(keysToRemove[i]);
                }
            });
        };
        this.clear = function () {
            return hasExecuted(function () {
                oStorageImpl.clear();
            });
        };
        this.getType = function () {
            return sType;
        };
    }
}
var STATE_STORAGE_KEY_PREFIX = "state.key_";
Object.assign(Storage, new Storage());