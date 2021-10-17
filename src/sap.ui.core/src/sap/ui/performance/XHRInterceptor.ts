import Log from "sap/base/Log";
export class oXHRInterceptor {
    static register(sName: any, sXHRMethod: any, fnCallback: any) {
        Log.debug("Register '" + sName + "' for XHR function '" + sXHRMethod + "'", XHRINTERCEPTOR);
        if (!mRegistry[sXHRMethod]) {
            createOverride(sXHRMethod);
        }
        mRegistry[sXHRMethod][sName] = fnCallback;
    }
    static unregister(sName: any, sXHRMethod: any) {
        var bRemove = delete mRegistry[sXHRMethod][sName];
        Log.debug("Unregister '" + sName + "' for XHR function '" + sXHRMethod + (bRemove ? "'" : "' failed"), XHRINTERCEPTOR);
        return bRemove;
    }
    static isRegistered(sName: any, sXHRMethod: any) {
        return mRegistry[sXHRMethod] && mRegistry[sXHRMethod][sName];
    }
}
var XHRINTERCEPTOR = "XHRInterceptor";
var mRegistry = Object.create(null);
var mXHRFunctions = Object.create(null);
function createOverride(sXHRMethod) {
    mRegistry[sXHRMethod] = Object.create(null);
    mXHRFunctions[sXHRMethod] = window.XMLHttpRequest.prototype[sXHRMethod];
    window.XMLHttpRequest.prototype[sXHRMethod] = function () {
        var oArgs = arguments;
        mXHRFunctions[sXHRMethod].apply(this, oArgs);
        for (var sName in mRegistry[sXHRMethod]) {
            mRegistry[sXHRMethod][sName].apply(this, oArgs);
        }
    };
}