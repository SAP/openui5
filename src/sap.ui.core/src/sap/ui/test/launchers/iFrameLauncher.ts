import URI from "sap/ui/thirdparty/URI";
import Device from "sap/ui/Device";
import _LogCollector from "sap/ui/test/_LogCollector";
import Log from "sap/base/Log";
import jQueryDOM from "sap/ui/thirdparty/jquery";
import ObjectPath from "sap/base/util/ObjectPath";
var DEFAULT_WIDTH = 1280;
var DEFAULT_HEIGHT = 1024;
var oFrameWindow = null, $Frame = null, $FrameContainer = null, oFramePlugin = null, oFrameUtils = null, oFrameJQuery = null, bRegisteredToUI5Init = false, bUi5Loaded = false, oAutoWaiter = null, FrameHashChanger = null, sOpaLogLevel, bDisableHistoryOverride;
function handleFrameLoad() {
    oFrameWindow = $Frame[0].contentWindow;
    registerOnError();
    checkForUI5ScriptLoaded();
}
function setFrameSize(sWidth, sHeight) {
    if (sWidth) {
        $Frame.css("width", sWidth);
        $FrameContainer.css("padding-left", sWidth);
    }
    else {
        $Frame.css("width", DEFAULT_WIDTH);
        $Frame.addClass("default-scale-x");
    }
    if (sHeight) {
        $Frame.css("height", sHeight);
    }
    else {
        $Frame.css("height", DEFAULT_HEIGHT);
        $Frame.addClass("default-scale-y");
    }
    if (!sWidth && !sHeight) {
        $Frame.addClass("default-scale-both");
    }
}
function registerOnError() {
    var fnFrameOnError = oFrameWindow.onerror;
    oFrameWindow.onerror = function (sErrorMsg, sUrl, iLine, iColumn, oError) {
        var vReturnValue = false;
        if (fnFrameOnError) {
            vReturnValue = fnFrameOnError.apply(this, arguments);
        }
        setTimeout(function () {
            var sColumn = iColumn ? "\ncolumn: " + iColumn : "";
            var sIFrameError = oError && "\niFrame error: " + (oError.stack ? oError.message + "\n" + oError.stack : oError) || "";
            throw new Error("Error in launched application iFrame: " + sErrorMsg + "\nurl: " + sUrl + "\nline: " + iLine + sColumn + sIFrameError);
        }, 0);
        return vReturnValue;
    };
}
function checkForUI5ScriptLoaded() {
    if (bUi5Loaded) {
        return true;
    }
    if (oFrameWindow && oFrameWindow.sap && oFrameWindow.sap.ui && oFrameWindow.sap.ui.getCore) {
        if (!bRegisteredToUI5Init) {
            oFrameWindow.sap.ui.getCore().attachInit(handleUi5Loaded);
        }
        bRegisteredToUI5Init = true;
    }
    return bUi5Loaded;
}
function loadSinon(fnDone) {
    oFrameWindow.sap.ui.require(["sap/ui/thirdparty/sinon"], function (sinon) {
        if (!sinon) {
            setTimeout(function () {
                loadSinon(fnDone);
            }, 50);
        }
        else {
            fnDone();
        }
    });
}
function handleUi5Loaded() {
    registerFrameResourcePaths();
    if (Device.browser.firefox) {
        loadSinon(loadFrameModules);
    }
    else {
        loadFrameModules();
    }
}
function afterModulesLoaded() {
    oFrameJQuery.sap.log.addLogListener(_LogCollector.getInstance()._oListener);
    bUi5Loaded = true;
}
function registerFrameResourcePaths() {
    oFrameJQuery = oFrameWindow.jQuery;
    registerAbsoluteResourcePathInIframe("sap/ui/test");
    registerAbsoluteResourcePathInIframe("sap/ui/qunit");
    registerAbsoluteResourcePathInIframe("sap/ui/thirdparty");
}
function modifyIFrameNavigation(hasher, History, HashChanger) {
    var oHashChanger = new HashChanger(), oHistory = new History(oHashChanger), fnOriginalSetHash = hasher.setHash, fnOriginalGetHash = hasher.getHash, sCurrentHash, bKnownHashChange = false, fnOriginalGo = oFrameWindow.history.go;
    hasher.replaceHash = function (sHash) {
        bKnownHashChange = true;
        var sOldHash = this.getHash();
        sCurrentHash = sHash;
        oHashChanger.fireEvent("hashReplaced", { sHash: sHash });
        this.changed.dispatch(sHash, sOldHash);
    };
    hasher.setHash = function (sHash) {
        bKnownHashChange = true;
        var sRealCurrentHash = fnOriginalGetHash.call(this);
        sCurrentHash = sHash;
        oHashChanger.fireEvent("hashSet", { sHash: sHash });
        fnOriginalSetHash.apply(this, arguments);
        if (sRealCurrentHash === this.getHash()) {
            this.changed.dispatch(sRealCurrentHash, oHistory.aHistory[oHistory.iHistoryPosition]);
        }
    };
    hasher.getHash = function () {
        if (sCurrentHash === undefined) {
            return fnOriginalGetHash.apply(this, arguments);
        }
        return sCurrentHash;
    };
    hasher.changed.add(function (sNewHash) {
        if (!bKnownHashChange) {
            oHashChanger.fireEvent("hashSet", { sHash: sNewHash });
            sCurrentHash = sNewHash;
        }
        bKnownHashChange = false;
    });
    oHashChanger.init();
    function goBack() {
        bKnownHashChange = true;
        var sNewPreviousHash = oHistory.aHistory[oHistory.iHistoryPosition], sNewCurrentHash = oHistory.getPreviousHash();
        sCurrentHash = sNewCurrentHash;
        hasher.changed.dispatch(sNewCurrentHash, sNewPreviousHash);
    }
    function goForward() {
        bKnownHashChange = true;
        var sNewCurrentHash = oHistory.aHistory[oHistory.iHistoryPosition + 1], sNewPreviousHash = oHistory.aHistory[oHistory.iHistoryPosition];
        if (sNewCurrentHash === undefined) {
            Log.error("Could not navigate forwards, there is no history entry in the forwards direction", this);
            return;
        }
        sCurrentHash = sNewCurrentHash;
        hasher.changed.dispatch(sNewCurrentHash, sNewPreviousHash);
    }
    oFrameWindow.history.back = goBack;
    oFrameWindow.history.forward = goForward;
    oFrameWindow.history.go = function (iSteps) {
        if (iSteps === -1) {
            goBack();
            return;
        }
        else if (iSteps === 1) {
            goForward();
            return;
        }
        Log.error("Using history.go with a number greater than 1 is not supported by OPA5", this);
        return fnOriginalGo.apply(oFrameWindow.history, arguments);
    };
}
function loadFrameModules() {
    oFrameWindow.sap.ui.require([
        "sap/ui/test/OpaPlugin",
        "sap/ui/test/autowaiter/_autoWaiter",
        "sap/ui/test/_OpaLogger",
        "sap/ui/qunit/QUnitUtils",
        "sap/ui/thirdparty/hasher",
        "sap/ui/core/routing/History",
        "sap/ui/core/routing/HashChanger"
    ], function (OpaPlugin, _autoWaiter, _OpaLogger, QUnitUtils, hasher, History, HashChanger) {
        _OpaLogger.setLevel(sOpaLogLevel);
        oFramePlugin = new OpaPlugin();
        oAutoWaiter = _autoWaiter;
        oFrameUtils = QUnitUtils;
        if (!bDisableHistoryOverride) {
            modifyIFrameNavigation(hasher, History, HashChanger);
        }
        FrameHashChanger = HashChanger;
        afterModulesLoaded();
    });
}
function registerAbsoluteResourcePathInIframe(sResource) {
    var sOpaLocation = sap.ui.require.toUrl(sResource);
    var sAbsoluteOpaPath = new URI(sOpaLocation).absoluteTo(document.baseURI).search("").toString();
    var fnConfig = ObjectPath.get("sap.ui._ui5loader.config", oFrameWindow) || ObjectPath.get("sap.ui.loader.config", oFrameWindow);
    if (fnConfig) {
        var paths = {};
        paths[sResource] = sAbsoluteOpaPath;
        fnConfig({
            paths: paths
        });
    }
    else if (oFrameJQuery && oFrameJQuery.sap && oFrameJQuery.sap.registerResourcePath) {
        oFrameJQuery.sap.registerResourcePath(sResource, sAbsoluteOpaPath);
    }
    else {
        throw new Error("iFrameLauncher.js: UI5 module system not found.");
    }
}
function destroyFrame() {
    if (!oFrameWindow) {
        throw new Error("sap.ui.test.launchers.iFrameLauncher: Teardown was called before launch. No iFrame was loaded.");
    }
    oFrameWindow.onerror = jQueryDOM.noop;
    for (var i = 0; i < $Frame.length; i++) {
        $Frame[0].src = "about:blank";
        $Frame[0].contentWindow.document.write("");
        $Frame[0].contentWindow.close();
    }
    if (typeof CollectGarbage == "function") {
        CollectGarbage();
    }
    $Frame.remove();
    $FrameContainer.remove();
    oFrameJQuery = null;
    oFramePlugin = null;
    oFrameUtils = null;
    oFrameWindow = null;
    bUi5Loaded = false;
    bRegisteredToUI5Init = false;
    oAutoWaiter = null;
    FrameHashChanger = null;
}