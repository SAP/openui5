import jQuery from "jquery.sap.global";
import assert from "sap/base/assert";
import Storage from "sap/ui/util/Storage";
var mStorages = {};
jQuery.sap.storage = function (oStorage, sIdPrefix) {
    if (!oStorage) {
        oStorage = Storage.Type.session;
    }
    if (typeof (oStorage) === "string" && Storage.Type[oStorage]) {
        var sKey = oStorage;
        if (sIdPrefix && sIdPrefix != "state.key_") {
            sKey = oStorage + "_" + sIdPrefix;
        }
        if (!mStorages[sKey]) {
            mStorages[sKey] = new Storage(oStorage, sIdPrefix);
        }
        return mStorages[sKey];
    }
    assert(oStorage instanceof Object && oStorage.clear && oStorage.setItem && oStorage.getItem && oStorage.removeItem, "storage: duck typing the storage");
    return new Storage(oStorage, sIdPrefix);
};
jQuery.sap.storage.Storage = Storage;
jQuery.sap.storage.Type = Storage.Type;
Object.assign(jQuery.sap.storage, Storage);