import LRUPersistentCache from "./LRUPersistentCache";
import CacheManagerNOP from "./CacheManagerNOP";
import Device from "sap/ui/Device";
import Log from "sap/base/Log";
import Measurement from "sap/ui/performance/Measurement";
import Interaction from "sap/ui/performance/trace/Interaction";
export class CacheManager {
    private static _getInstance(...args: any) {
        var pInstanceCreation, oMsr = startMeasurements("_getInstance"), that = this;
        pInstanceCreation = new Promise(function (resolve, reject) {
            var oInstance;
            Log.debug("Cache Manager: Initialization...");
            if (!CacheManager._instance) {
                oInstance = that._findImplementation();
                Measurement.start(S_MSR_INIT_IMPLEMENTATION, "CM", S_MSR_CAT_CACHE_MANAGER);
                oInstance.init().then(resolveCacheManager, reject);
                Measurement.end(S_MSR_INIT_IMPLEMENTATION, "CM");
            }
            else {
                resolveCacheManager(CacheManager._instance);
            }
            function resolveCacheManager(instance) {
                CacheManager._instance = instance;
                oMsr.endAsync();
                Log.debug("Cache Manager initialized with implementation [" + CacheManager._instance.name + "], resolving _getInstance promise");
                resolve(instance);
            }
        });
        oMsr.endSync();
        return pInstanceCreation;
    }
    private static _findImplementation(...args: any) {
        if (isSwitchedOn() && this._isSupportedEnvironment()) {
            return LRUPersistentCache;
        }
        else {
            Log.warning("UI5 Cache Manager is switched off");
            return CacheManagerNOP;
        }
    }
    static set(key: any, value: any) {
        var pSet, oMsr = startMeasurements("set", key);
        Log.debug("Cache Manager: Setting value of type[" + typeof value + "] with key [" + key + "]");
        pSet = this._callInstanceMethod("set", arguments).then(function callInstanceHandler() {
            Log.debug("Cache Manager: Setting key [" + key + "] completed successfully");
            oMsr.endAsync();
        }, function (e) {
            Log.error("Cache Manager: Setting key [" + key + "] failed. Error:" + e);
            oMsr.endAsync();
            throw e;
        });
        oMsr.endSync();
        return pSet;
    }
    static get(key: any) {
        var pGet, fnDone = Interaction.notifyAsyncStep(), oMsr = startMeasurements("get", key);
        Log.debug("Cache Manager: Getting key [" + key + "]");
        pGet = this._callInstanceMethod("get", arguments).then(function callInstanceHandler(v) {
            Log.debug("Cache Manager: Getting key [" + key + "] done");
            oMsr.endAsync();
            return v;
        }, function (e) {
            Log.debug("Cache Manager: Getting key [" + key + "] failed. Error: " + e);
            oMsr.endAsync();
            throw e;
        }).finally(fnDone);
        oMsr.endSync();
        return pGet;
    }
    static has(key: any) {
        var pHas, oMsr = startMeasurements("has", key);
        Log.debug("Cache Manager: has key [" + key + "] called");
        pHas = this._callInstanceMethod("has", arguments).then(function callInstanceHandler(result) {
            oMsr.endAsync();
            Log.debug("Cache Manager: has key [" + key + "] returned " + result);
            return result;
        });
        oMsr.endSync();
        return pHas;
    }
    static del(key: any) {
        var pDel, oMsr = startMeasurements("del", key);
        Log.debug("Cache Manager: del called.");
        pDel = this._callInstanceMethod("del", arguments).then(function callInstanceHandler() {
            Log.debug("Cache Manager: del completed successfully.");
            oMsr.endAsync();
        }, function (e) {
            Log.debug("Cache Manager: del failed. Error: " + e);
            oMsr.endAsync();
            throw e;
        });
        oMsr.endSync();
        return pDel;
    }
    static reset(...args: any) {
        var pReset, oMsr = startMeasurements("reset");
        Log.debug("Cache Manager: Reset called.");
        pReset = this._callInstanceMethod("reset", arguments).then(function callInstanceHandler() {
            Log.debug("Cache Manager: Reset completed successfully.");
            oMsr.endAsync();
        }, function (e) {
            Log.debug("Cache Manager: Reset failed. Error: " + e);
            oMsr.endAsync();
            throw e;
        });
        oMsr.endSync();
        return pReset;
    }
    private static _switchOff(...args: any) {
        var that = this;
        return Promise.resolve().then(function () {
            safeClearInstance(that);
            sap.ui.getCore().getConfiguration().setUI5CacheOn(false);
        });
    }
    private static _switchOn(...args: any) {
        var that = this;
        return Promise.resolve().then(function () {
            var oCfg = sap.ui.getCore().getConfiguration();
            if (!oCfg.isUI5CacheOn()) {
                safeClearInstance(that);
                sap.ui.getCore().getConfiguration().setUI5CacheOn(true);
            }
            return Promise.resolve();
        });
    }
    private static _callInstanceMethod(sMethodName: any, aArgs: any) {
        var pCallInstance, sMsrCallInstance = "[sync ] _callInstanceMethod";
        Measurement.start(sMsrCallInstance, "CM", S_MSR_CAT_CACHE_MANAGER);
        if (this._instance) {
            Log.debug("Cache Manager: calling instance...");
            return this._instance[sMethodName].apply(this._instance, aArgs);
        }
        Log.debug("Cache Manager: getting instance...");
        pCallInstance = this._getInstance().then(function instanceResolving(instance) {
            return instance[sMethodName].apply(instance, aArgs);
        });
        Measurement.end(sMsrCallInstance);
        return pCallInstance;
    }
    private static _isSupportedEnvironment(...args: any) {
        var aSupportedEnv = [];
        if (this._bSupportedEnvironment == undefined) {
            aSupportedEnv.push({
                system: Device.system.SYSTEMTYPE.DESKTOP,
                browserName: Device.browser.BROWSER.CHROME,
                browserVersion: 49
            });
            aSupportedEnv.push({
                system: Device.system.SYSTEMTYPE.DESKTOP,
                browserName: Device.browser.BROWSER.SAFARI,
                browserVersion: 13
            });
            aSupportedEnv.push({
                system: Device.system.SYSTEMTYPE.TABLET,
                browserName: Device.browser.BROWSER.SAFARI,
                browserVersion: 13
            });
            aSupportedEnv.push({
                system: Device.system.SYSTEMTYPE.PHONE,
                browserName: Device.browser.BROWSER.SAFARI,
                browserVersion: 13
            });
            aSupportedEnv.push({
                system: Device.system.SYSTEMTYPE.TABLET,
                os: Device.os.OS.ANDROID,
                browserName: Device.browser.BROWSER.CHROME,
                browserVersion: 80
            });
            aSupportedEnv.push({
                system: Device.system.SYSTEMTYPE.PHONE,
                os: Device.os.OS.ANDROID,
                browserName: Device.browser.BROWSER.CHROME,
                browserVersion: 80
            });
            this._bSupportedEnvironment = aSupportedEnv.some(function (oSuppportedEnv) {
                var bSupportedSystem = Device.system[oSuppportedEnv.system], bSupportedOSName = oSuppportedEnv.os ? oSuppportedEnv.os === Device.os.name : true, bSupportedBrowserName = oSuppportedEnv.browserName === Device.browser.name, bSupportedBrowserVersion = Device.browser.version >= oSuppportedEnv.browserVersion;
                try {
                    return bSupportedSystem && bSupportedOSName && bSupportedBrowserName && bSupportedBrowserVersion && window.indexedDB;
                }
                catch (error) {
                    return false;
                }
            });
        }
        return this._bSupportedEnvironment;
    }
}
var S_MSR_CAT_CACHE_MANAGER = "CacheManager", S_MSR_INIT_IMPLEMENTATION = "[sync ] _initImplementation", iMsrCounter = 0;
function isSwitchedOn() {
    return sap.ui.getCore().getConfiguration().isUI5CacheOn();
}
function safeClearInstance(cm) {
    if (cm._instance) {
        cm._instance._destroy();
        cm._instance = null;
    }
}
function startMeasurements(sOperation, key) {
    iMsrCounter++;
    var sMeasureAsync = "[async]  " + sOperation + "[" + key + "]- #" + (iMsrCounter), sMeasureSync = "[sync ]  " + sOperation + "[" + key + "]- #" + (iMsrCounter);
    Measurement.start(sMeasureAsync, "CM", [S_MSR_CAT_CACHE_MANAGER, sOperation]);
    Measurement.start(sMeasureSync, "CM", [S_MSR_CAT_CACHE_MANAGER, sOperation]);
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