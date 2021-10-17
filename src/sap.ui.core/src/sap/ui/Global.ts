import VersionInfo from "sap/ui/VersionInfo";
import Log from "sap/base/Log";
import assert from "sap/base/assert";
import ObjectPath from "sap/base/util/ObjectPath";
if (window.OpenAjax && window.OpenAjax.hub) {
    OpenAjax.hub.registerLibrary("sap", "http://www.sap.com/", "0.1", {});
}
var BaseObject;
if (typeof window.sap !== "object" && typeof window.sap !== "function") {
    window.sap = {};
}
if (typeof window.sap.ui !== "object") {
    window.sap.ui = {};
}
sap.ui = Object.assign(sap.ui, {
    version: "${version}",
    buildinfo: { lastchange: "", buildtime: "${buildtime}" }
});
var oCfgData = window["sap-ui-config"] || {};
var syncCallBehavior = 0;
if (oCfgData["xx-nosync"] === "warn" || /(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search)) {
    syncCallBehavior = 1;
}
if (oCfgData["xx-nosync"] === true || oCfgData["xx-nosync"] === "true" || /(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search)) {
    syncCallBehavior = 2;
}
sap.ui.getVersionInfo = function (mOptions) {
    if (mOptions && mOptions.async) {
        Log.info("Do not use deprecated function 'sap.ui.getVersionInfo'. Use" + " 'sap/ui/VersionInfo' module's asynchronous .load function instead");
    }
    else {
        Log.warning("Do not use deprecated function 'sap.ui.getVersionInfo' synchronously! Use" + " 'sap/ui/VersionInfo' module's asynchronous .load function instead", "Deprecation", null, function () {
            return {
                type: "sap.ui.getVersionInfo",
                name: "Global"
            };
        });
    }
    return VersionInfo._load(mOptions);
};
sap.ui.namespace = function (sNamespace) {
    assert(false, "sap.ui.namespace is long time deprecated and shouldn't be used");
    return ObjectPath.create(sNamespace);
};
sap.ui.lazyRequire = function (sClassName, sMethods, sModuleName) {
    assert(typeof sClassName === "string" && sClassName, "lazyRequire: sClassName must be a non-empty string");
    assert(!sMethods || typeof sMethods === "string", "lazyRequire: sMethods must be empty or a string");
    if (syncCallBehavior === 2) {
        Log.error("[nosync] lazy stub creation ignored for '" + sClassName + "'");
        return;
    }
    var sFullClass = sClassName.replace(/\//gi, "."), iLastDotPos = sFullClass.lastIndexOf("."), sPackage = sFullClass.substr(0, iLastDotPos), sClass = sFullClass.substr(iLastDotPos + 1), oPackage = ObjectPath.create(sPackage), oClass = oPackage[sClass], aMethods = (sMethods || "new").split(" "), iConstructor = aMethods.indexOf("new");
    sModuleName = sModuleName || sFullClass;
    if (!oClass) {
        if (iConstructor >= 0) {
            oClass = function () {
                if (syncCallBehavior) {
                    if (syncCallBehavior === 1) {
                        Log.error("[nosync] lazy stub for constructor '" + sFullClass + "' called");
                    }
                }
                else {
                    Log.debug("lazy stub for constructor '" + sFullClass + "' called.");
                }
                sap.ui.requireSync(sModuleName.replace(/\./g, "/"));
                var oRealClass = oPackage[sClass];
                assert(typeof oRealClass === "function", "lazyRequire: oRealClass must be a function after loading");
                if (oRealClass._sapUiLazyLoader) {
                    throw new Error("lazyRequire: stub '" + sFullClass + "'has not been replaced by module '" + sModuleName + "'");
                }
                var oInstance = Object.create(oRealClass.prototype);
                if (!(this instanceof oClass)) {
                    BaseObject = BaseObject || sap.ui.require("sap/ui/base/Object");
                    if (BaseObject && oInstance instanceof BaseObject) {
                        Log.error("Constructor " + sClassName + " has been called without \"new\" operator!", null, null, function () {
                            try {
                                throw new Error();
                            }
                            catch (e) {
                                return e;
                            }
                        });
                    }
                }
                var oResult = oRealClass.apply(oInstance, arguments);
                if (oResult && (typeof oResult === "function" || typeof oResult === "object")) {
                    oInstance = oResult;
                }
                return oInstance;
            };
            oClass._sapUiLazyLoader = true;
            aMethods.splice(iConstructor, 1);
        }
        else {
            oClass = {};
        }
        oPackage[sClass] = oClass;
    }
    aMethods.forEach(function (sMethod) {
        if (!oClass[sMethod]) {
            oClass[sMethod] = function () {
                if (syncCallBehavior) {
                    if (syncCallBehavior === 1) {
                        Log.error("[no-sync] lazy stub for method '" + sFullClass + "." + sMethod + "' called");
                    }
                }
                else {
                    Log.debug("lazy stub for method '" + sFullClass + "." + sMethod + "' called.");
                }
                sap.ui.requireSync(sModuleName.replace(/\./g, "/"));
                var oRealClass = oPackage[sClass];
                assert(typeof oRealClass === "function" || typeof oRealClass === "object", "lazyRequire: oRealClass must be a function or object after loading");
                assert(typeof oRealClass[sMethod] === "function", "lazyRequire: method must be a function");
                if (oRealClass[sMethod]._sapUiLazyLoader) {
                    throw new Error("lazyRequire: stub '" + sFullClass + "." + sMethod + "' has not been replaced by loaded module '" + sModuleName + "'");
                }
                return oRealClass[sMethod].apply(oRealClass, arguments);
            };
            oClass[sMethod]._sapUiLazyLoader = true;
        }
    });
};
sap.ui.lazyRequire._isStub = function (sClassName) {
    assert(typeof sClassName === "string" && sClassName, "lazyRequire._isStub: sClassName must be a non-empty string");
    var iLastDotPos = sClassName.lastIndexOf("."), sContext = sClassName.slice(0, iLastDotPos), sProperty = sClassName.slice(iLastDotPos + 1), oContext = ObjectPath.get(sContext || "");
    return !!(oContext && typeof oContext[sProperty] === "function" && oContext[sProperty]._sapUiLazyLoader);
};
sap.ui.resource = function (sLibraryName, sResourcePath) {
    assert(typeof sLibraryName === "string", "sLibraryName must be a string");
    assert(typeof sResourcePath === "string", "sResourcePath must be a string");
    return sap.ui.require.toUrl((String(sLibraryName).replace(/\./g, "/") + "/" + sResourcePath).replace(/^\/*/, ""));
};
sap.ui.localResources = function (sNamespace) {
    assert(sNamespace, "sNamespace must not be empty");
    var mPaths = {};
    mPaths[sNamespace.replace(/\./g, "/")] = "./" + sNamespace.replace(/\./g, "/");
    sap.ui.loader.config({ paths: mPaths });
};