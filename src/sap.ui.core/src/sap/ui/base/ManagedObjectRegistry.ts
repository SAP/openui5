import ManagedObject from "sap/ui/base/ManagedObject";
import Log from "sap/base/Log";
import assert from "sap/base/assert";
function apply(FNClass, oOptions) {
    if (typeof FNClass !== "function" || !(FNClass.prototype instanceof ManagedObject)) {
        throw new TypeError("ManagedObjectRegistry mixin can only be applied to subclasses of sap.ui.base.ManagedObject");
    }
    oOptions = oOptions || {};
    var fnOnDuplicate = oOptions.onDuplicate || function (sId, oldInstance, newInstance) {
        var sStereotype = FNClass.getMetadata().getStereotype();
        Log.error("adding object \"" + sStereotype + "\" with duplicate id '" + sId + "'");
        throw new Error("Error: adding object \"" + sStereotype + "\" with duplicate id '" + sId + "'");
    };
    var fnOnDeregister = oOptions.onDeregister || null;
    var mInstances = Object.create(null);
    var iInstancesCount = 0;
    FNClass.prototype.register = function register() {
        var sId = this.getId(), old = mInstances[sId];
        if (old && old !== this) {
            fnOnDuplicate(sId, old, this);
            iInstancesCount--;
        }
        mInstances[sId] = this;
        iInstancesCount++;
    };
    FNClass.prototype.deregister = function deregister() {
        if (mInstances[this.sId]) {
            if (fnOnDeregister) {
                fnOnDeregister(this.sId);
            }
            delete mInstances[this.sId];
            iInstancesCount--;
        }
    };
    FNClass["registry"] = Object.freeze({
        get size() {
            return iInstancesCount;
        },
        all: function () {
            var mResults = Object.create(null);
            return Object.assign(mResults, mInstances);
        },
        get: function (id) {
            assert(id == null || typeof id === "string", "id must be a string when defined");
            return id == null ? undefined : mInstances[id];
        },
        forEach: function (callback, thisArg) {
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            if (thisArg != null) {
                callback = callback.bind(thisArg);
            }
            for (var id in mInstances) {
                callback(mInstances[id], id);
            }
        },
        filter: function (callback, thisArg) {
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            if (thisArg != null) {
                callback = callback.bind(thisArg);
            }
            var result = [], id;
            for (id in mInstances) {
                if (callback(mInstances[id], id)) {
                    result.push(mInstances[id]);
                }
            }
            return result;
        }
    });
}