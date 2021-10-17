import now from "sap/base/util/now";
import Version from "sap/base/util/Version";
import assert from "sap/base/assert";
import Log from "sap/base/Log";
import getComputedStyleFix from "sap/ui/dom/getComputedStyleFix";
import includeScript from "sap/ui/dom/includeScript";
import includeStylesheet from "sap/ui/dom/includeStylesheet";
import SupportHotkeys from "sap/ui/core/support/Hotkeys";
import TestRecorderHotkeyListener from "sap/ui/test/RecorderHotkeyListener";
import FrameOptions from "sap/ui/security/FrameOptions";
import Measurement from "sap/ui/performance/Measurement";
import Interaction from "sap/ui/performance/trace/Interaction";
import syncXHRFix from "sap/ui/base/syncXHRFix";
import LoaderExtensions from "sap/base/util/LoaderExtensions";
import Device from "sap/ui/Device";
import jQuery from "sap/ui/thirdparty/jquery";
if (!jQuery) {
    throw new Error("Loading of jQuery failed");
}
var ui5loader = sap.ui.loader;
if (!ui5loader || !ui5loader._) {
    throw new Error("The UI5 compatilbility module requires a UI5 specific AMD implementation");
}
var _ui5loader = ui5loader._;
var _earlyLogs = [];
function _earlyLog(sLevel, sMessage) {
    _earlyLogs.push({
        level: sLevel,
        message: sMessage
    });
}
var oJQVersion = Version(jQuery.fn.jquery);
(function () {
    jQuery.support = jQuery.support || {};
    jQuery.support.retina = Device.support.retina;
    jQuery.support.touch = Device.support.touch;
    jQuery.support.cssTransforms = true;
    jQuery.support.cssTransforms3d = true;
    jQuery.support.cssTransitions = true;
    jQuery.support.cssAnimations = true;
    jQuery.support.cssGradients = true;
    jQuery.support.flexBoxPrefixed = false;
    jQuery.support.flexBoxLayout = false;
    jQuery.support.newFlexBoxLayout = true;
    jQuery.support.hasFlexBoxSupport = true;
}());
if (Device.browser.firefox) {
    getComputedStyleFix();
}
if (Device.browser.firefox && window.Proxy) {
    syncXHRFix();
}
var oCfgData = window["sap-ui-config"] = (function () {
    function normalize(o) {
        for (var i in o) {
            var v = o[i];
            var il = i.toLowerCase();
            if (!o.hasOwnProperty(il)) {
                o[il] = v;
                delete o[i];
            }
        }
        return o;
    }
    function loadExternalConfig(url) {
        var sCfgFile = "sap-ui-config.json", config;
        Log.warning("Loading external bootstrap configuration from \"" + url + "\". This is a design time feature and not for productive usage!");
        if (url !== sCfgFile) {
            Log.warning("The external bootstrap configuration file should be named \"" + sCfgFile + "\"!");
        }
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function (e) {
            if (xhr.status === 200 && xhr.responseText) {
                try {
                    config = JSON.parse(xhr.responseText);
                }
                catch (error) {
                    Log.error("Parsing externalized bootstrap configuration from \"" + url + "\" failed! Reason: " + error + "!");
                }
            }
            else {
                Log.error("Loading externalized bootstrap configuration from \"" + url + "\" failed! Response: " + xhr.status + "!");
            }
        });
        xhr.open("GET", url, false);
        try {
            xhr.send();
        }
        catch (error) {
            Log.error("Loading externalized bootstrap configuration from \"" + url + "\" failed! Reason: " + error + "!");
        }
        config = config || {};
        config.__loaded = true;
        return config;
    }
    function getInfo() {
        function check(oScript, rUrlPattern) {
            var sUrl = oScript && oScript.getAttribute("src");
            var oMatch = rUrlPattern.exec(sUrl);
            if (oMatch) {
                return {
                    tag: oScript,
                    url: sUrl,
                    resourceRoot: oMatch[1] || ""
                };
            }
        }
        var rResources = /^((?:.*\/)?resources\/)/, rBootScripts, aScripts, i, oResult;
        oResult = check(document.querySelector("SCRIPT[src][id=sap-ui-bootstrap]"), rResources);
        if (!oResult) {
            aScripts = document.querySelectorAll("SCRIPT[src]");
            rBootScripts = /^([^?#]*\/)?(?:sap-ui-(?:core|custom|boot|merged)(?:-[^?#/]*)?|jquery.sap.global|ui5loader(?:-autoconfig)?)\.js(?:[?#]|$)/;
            for (i = 0; i < aScripts.length; i++) {
                oResult = check(aScripts[i], rBootScripts);
                if (oResult) {
                    break;
                }
            }
        }
        return oResult || {};
    }
    var _oBootstrap = getInfo(), oScriptTag = _oBootstrap.tag, oCfg = window["sap-ui-config"];
    if (typeof oCfg === "string") {
        oCfg = loadExternalConfig(oCfg);
    }
    oCfg = normalize(oCfg || {});
    oCfg.resourceroots = oCfg.resourceroots || {};
    oCfg.themeroots = oCfg.themeroots || {};
    if (/(^|\/)(sap-?ui5|[^\/]+-all).js([?#]|$)/.test(_oBootstrap.url)) {
        Log.error("The all-in-one file 'sap-ui-core-all.js' has been abandoned in favour of standard preloads." + " Please migrate to sap-ui-core.js and consider to use async preloads.");
        oCfg.preload = "sync";
    }
    if (oScriptTag) {
        var sConfig = oScriptTag.getAttribute("data-sap-ui-config");
        if (sConfig) {
            try {
                var oParsedConfig;
                try {
                    oParsedConfig = JSON.parse("{" + sConfig + "}");
                }
                catch (e) {
                    Log.error("JSON.parse on the data-sap-ui-config attribute failed. Please check the config for JSON syntax violations.");
                    oParsedConfig = (new Function("return {" + sConfig + "};"))();
                }
                Object.assign(oCfg, normalize(oParsedConfig));
            }
            catch (e) {
                Log.error("failed to parse data-sap-ui-config attribute: " + (e.message || e));
            }
        }
        for (var i = 0; i < oScriptTag.attributes.length; i++) {
            var attr = oScriptTag.attributes[i];
            var m = attr.name.match(/^data-sap-ui-(.*)$/);
            if (m) {
                m = m[1].toLowerCase();
                if (m === "resourceroots") {
                    Object.assign(oCfg[m], JSON.parse(attr.value));
                }
                else if (m === "theme-roots") {
                    Object.assign(oCfg.themeroots, JSON.parse(attr.value));
                }
                else if (m !== "config") {
                    oCfg[m] = attr.value;
                }
            }
        }
    }
    return oCfg;
}());
var syncCallBehavior = 0;
if (oCfgData["xx-nosync"] === "warn" || /(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search)) {
    syncCallBehavior = 1;
}
if (oCfgData["xx-nosync"] === true || oCfgData["xx-nosync"] === "true" || /(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search)) {
    syncCallBehavior = 2;
}
ui5loader.config({
    reportSyncCalls: syncCallBehavior
});
if (syncCallBehavior && oCfgData.__loaded) {
    _earlyLog(syncCallBehavior === 1 ? "warning" : "error", "[nosync]: configuration loaded via sync XHR");
}
if (oCfgData.noconflict === true || oCfgData.noconflict === "true" || oCfgData.noconflict === "x") {
    jQuery.noConflict();
}
jQuery.sap = jQuery.sap || {};
jQuery.sap.Version = Version;
jQuery.sap.now = now;
var fnMakeLocalStorageAccessor = function (key, type, callback) {
    return function (value) {
        try {
            if (value != null || type === "string") {
                if (value) {
                    localStorage.setItem(key, type === "boolean" ? "X" : value);
                }
                else {
                    localStorage.removeItem(key);
                }
                callback(value);
            }
            value = localStorage.getItem(key);
            return type === "boolean" ? value === "X" : value;
        }
        catch (e) {
            Log.warning("Could not access localStorage while accessing '" + key + "' (value: '" + value + "', are cookies disabled?): " + e.message);
        }
    };
};
jQuery.sap.debug = fnMakeLocalStorageAccessor.call(this, "sap-ui-debug", "", function (vDebugInfo) {
    alert("Usage of debug sources is " + (vDebugInfo ? "on" : "off") + " now.\nFor the change to take effect, you need to reload the page.");
});
jQuery.sap.setReboot = fnMakeLocalStorageAccessor.call(this, "sap-ui-reboot-URL", "string", function (sRebootUrl) {
    if (sRebootUrl) {
        alert("Next time this app is launched (only once), it will load UI5 from:\n" + sRebootUrl + ".\nPlease reload the application page now.");
    }
});
jQuery.sap.statistics = fnMakeLocalStorageAccessor.call(this, "sap-ui-statistics", "boolean", function (bUseStatistics) {
    alert("Usage of Gateway statistics " + (bUseStatistics ? "on" : "off") + " now.\nFor the change to take effect, you need to reload the page.");
});
jQuery.sap.log = Object.assign(Log.getLogger(), {
    Level: Log.Level,
    getLogger: Log.getLogger,
    getLogEntries: Log.getLogEntries,
    addLogListener: Log.addLogListener,
    removeLogListener: Log.removeLogListener,
    logSupportInfo: Log.logSupportInfo,
    LogLevel: Log.Level,
    getLog: Log.getLogEntries
});
var sWindowName = (typeof window === "undefined" || window.top == window) ? "" : "[" + window.location.pathname.split("/").slice(-1)[0] + "] ";
jQuery.sap.assert = function (bResult, vMessage) {
    if (!bResult) {
        var sMessage = typeof vMessage === "function" ? vMessage() : vMessage;
        assert(bResult, sWindowName + sMessage);
    }
};
oCfgData.loglevel = (function () {
    var m = /(?:\?|&)sap-ui-log(?:L|-l)evel=([^&]*)/.exec(window.location.search);
    return m && m[1];
}()) || oCfgData.loglevel;
if (oCfgData.loglevel) {
    Log.setLevel(Log.Level[oCfgData.loglevel.toUpperCase()] || parseInt(oCfgData.loglevel));
}
else if (!window["sap-ui-optimized"]) {
    Log.setLevel(Log.Level.DEBUG);
}
Log.info("SAP Logger started.");
jQuery.each(_earlyLogs, function (i, e) {
    Log[e.level](e.message);
});
_earlyLogs = null;
jQuery.sap.factory = function factory(oPrototype) {
    jQuery.sap.assert(typeof oPrototype == "object", "oPrototype must be an object (incl. null)");
    function Factory() { }
    Factory.prototype = oPrototype;
    return Factory;
};
jQuery.sap.newObject = function newObject(oPrototype) {
    jQuery.sap.assert(typeof oPrototype == "object", "oPrototype must be an object (incl. null)");
    return Object.create(oPrototype || null);
};
jQuery.sap.getter = function (oValue) {
    return function () {
        return oValue;
    };
};
jQuery.sap.getObject = function (sName, iNoCreates, oContext) {
    var oObject = oContext || window, aNames = (sName || "").split("."), l = aNames.length, iEndCreate = isNaN(iNoCreates) ? 0 : l - iNoCreates, i;
    if (syncCallBehavior && oContext === window) {
        Log.error("[nosync] getObject called to retrieve global name '" + sName + "'");
    }
    for (i = 0; oObject && i < l; i++) {
        if (!oObject[aNames[i]] && i < iEndCreate) {
            oObject[aNames[i]] = {};
        }
        oObject = oObject[aNames[i]];
    }
    return oObject;
};
jQuery.sap.setObject = function (sName, vValue, oContext) {
    var oObject = oContext || window, aNames = (sName || "").split("."), l = aNames.length, i;
    if (l > 0) {
        for (i = 0; oObject && i < l - 1; i++) {
            if (!oObject[aNames[i]]) {
                oObject[aNames[i]] = {};
            }
            oObject = oObject[aNames[i]];
        }
        oObject[aNames[l - 1]] = vValue;
    }
};
jQuery.sap.measure = Measurement;
jQuery.sap.measure.clearInteractionMeasurements = Interaction.clear;
jQuery.sap.measure.startInteraction = Interaction.start;
jQuery.sap.measure.endInteraction = Interaction.end;
jQuery.sap.measure.getPendingInteractionMeasurement = Interaction.getPending;
jQuery.sap.measure.filterInteractionMeasurements = Interaction.filter;
jQuery.sap.measure.getAllInteractionMeasurements = Interaction.getAll;
jQuery.sap.measure.getRequestTimings = function () {
    if (window.performance.getEntriesByType) {
        return window.performance.getEntriesByType("resource");
    }
    return [];
};
jQuery.sap.measure.clearRequestTimings = function () {
    if (window.performance.clearResourceTimings) {
        window.performance.clearResourceTimings();
    }
};
jQuery.sap.measure.setRequestBufferSize = function (iSize) {
    if (window.performance.setResourceTimingBufferSize) {
        window.performance.setResourceTimingBufferSize(iSize);
    }
};
var getModuleSystemInfo = (function () {
    var oLog = _ui5loader.logger = Log.getLogger("sap.ui.ModuleSystem", (/sap-ui-xx-debug(M|-m)odule(L|-l)oading=(true|x|X)/.test(location.search) || oCfgData["xx-debugModuleLoading"]) ? Log.Level.DEBUG : Math.min(Log.getLevel(), Log.Level.INFO)), mKnownSubtypes = LoaderExtensions.getKnownSubtypes(), rSubTypes;
    (function () {
        var sSub = "";
        for (var sType in mKnownSubtypes) {
            sSub = (sSub ? sSub + "|" : "") + "(?:(?:" + mKnownSubtypes[sType].join("\\.|") + "\\.)?" + sType + ")";
        }
        sSub = "\\.(?:" + sSub + "|[^./]+)$";
        oLog.debug("constructed regexp for file sub-types :" + sSub);
        rSubTypes = new RegExp(sSub);
    }());
    function ui5ToRJS(sName) {
        if (/^jquery\.sap\./.test(sName)) {
            return sName;
        }
        return sName.replace(/\./g, "/");
    }
    jQuery.sap.getModulePath = function (sModuleName, sSuffix) {
        return jQuery.sap.getResourcePath(ui5ToRJS(sModuleName), sSuffix);
    };
    jQuery.sap.getResourcePath = function (sResourceName, sSuffix) {
        if (arguments.length === 1 && sResourceName != "") {
            var aSegments = sResourceName.split(/\//);
            var m = rSubTypes.exec(aSegments[aSegments.length - 1]);
            if (m) {
                sSuffix = m[0];
                aSegments[aSegments.length - 1] = aSegments[aSegments.length - 1].slice(0, m.index);
                sResourceName = aSegments.join("/");
            }
            else {
                sSuffix = "";
            }
        }
        return _ui5loader.getResourcePath(sResourceName, sSuffix);
    };
    jQuery.sap.registerModulePath = function registerModulePath(sModuleName, vUrlPrefix) {
        jQuery.sap.assert(!/\//.test(sModuleName), "module name must not contain a slash.");
        sModuleName = sModuleName.replace(/\./g, "/");
        vUrlPrefix = vUrlPrefix || ".";
        LoaderExtensions.registerResourcePath(sModuleName, vUrlPrefix);
    };
    jQuery.sap.registerResourcePath = LoaderExtensions.registerResourcePath;
    jQuery.sap.registerModuleShims = function (mShims) {
        jQuery.sap.assert(typeof mShims === "object", "mShims must be an object");
        ui5loader.config({
            shim: mShims
        });
    };
    jQuery.sap.isDeclared = function isDeclared(sModuleName, bIncludePreloaded) {
        var state = _ui5loader.getModuleState(ui5ToRJS(sModuleName) + ".js");
        return state && (bIncludePreloaded || state > 0);
    };
    jQuery.sap.isResourceLoaded = function isResourceLoaded(sResourceName) {
        return !!_ui5loader.getModuleState(sResourceName);
    };
    jQuery.sap.getAllDeclaredModules = LoaderExtensions.getAllRequiredModules;
    var paths = {};
    for (var n in oCfgData.resourceroots) {
        paths[ui5ToRJS(n)] = oCfgData.resourceroots[n] || ".";
    }
    ui5loader.config({ paths: paths });
    var mUrlPrefixes = _ui5loader.getUrlPrefixes();
    oLog.info("URL prefixes set to:");
    for (var n in mUrlPrefixes) {
        oLog.info("  " + (n ? "'" + n + "'" : "(default)") + " : " + mUrlPrefixes[n]);
    }
    jQuery.sap.declare = function (sModuleName, bCreateNamespace) {
        var sNamespaceObj = sModuleName;
        if (typeof (sModuleName) === "object") {
            sNamespaceObj = sModuleName.modName;
            sModuleName = ui5ToRJS(sModuleName.modName) + (sModuleName.type ? "." + sModuleName.type : "") + ".js";
        }
        else {
            sModuleName = ui5ToRJS(sModuleName) + ".js";
        }
        _ui5loader.declareModule(sModuleName);
        if (bCreateNamespace !== false) {
            jQuery.sap.getObject(sNamespaceObj, 1);
        }
    };
    jQuery.sap.require = function (vModuleName) {
        if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; i++) {
                jQuery.sap.require(arguments[i]);
            }
            return this;
        }
        if (typeof (vModuleName) === "object") {
            jQuery.sap.assert(!vModuleName.type || mKnownSubtypes.js.indexOf(vModuleName.type) >= 0, "type must be empty or one of " + mKnownSubtypes.js.join(", "));
            vModuleName = ui5ToRJS(vModuleName.modName) + (vModuleName.type ? "." + vModuleName.type : "");
        }
        else {
            vModuleName = ui5ToRJS(vModuleName);
        }
        sap.ui.requireSync(vModuleName);
    };
    Object.defineProperty(jQuery.sap.require, "_hook", {
        get: function () {
            return _ui5loader.translate;
        },
        set: function (hook) {
            jQuery.sap.assert(false, "jquery.sap.global: legacy hook for code transformation should no longer be used");
            _ui5loader.translate = hook;
        }
    });
    jQuery.sap.preloadModules = function (sPreloadModule, bAsync, oSyncPoint) {
        Log.error("jQuery.sap.preloadModules was never a public API and has been removed. Migrate to Core.loadLibrary()!");
    };
    jQuery.sap.registerPreloadedModules = function (oData) {
        var modules = oData.modules;
        if (Version(oData.version || "1.0").compareTo("2.0") < 0) {
            modules = {};
            for (var sName in oData.modules) {
                modules[ui5ToRJS(sName) + ".js"] = oData.modules[sName];
            }
        }
        sap.ui.require.preload(modules, oData.name, oData.url);
    };
    jQuery.sap.unloadResources = _ui5loader.unloadResources;
    jQuery.sap.getResourceName = function (sModuleName, sSuffix) {
        return ui5ToRJS(sModuleName) + (sSuffix == null ? ".js" : sSuffix);
    };
    jQuery.sap.loadResource = LoaderExtensions.loadResource;
    jQuery.sap._loadJSResourceAsync = _ui5loader.loadJSResourceAsync;
    return function () {
        return {
            modules: _ui5loader.getAllModules(),
            prefixes: _ui5loader.getUrlPrefixes()
        };
    };
}());
jQuery.sap.includeScript = includeScript;
jQuery.sap.includeStyleSheet = includeStylesheet;
if (!(oCfgData.productive === true || oCfgData.productive === "true" || oCfgData.productive === "x")) {
    SupportHotkeys.init(getModuleSystemInfo, oCfgData);
    TestRecorderHotkeyListener.init(getModuleSystemInfo, oCfgData);
}
if (oJQVersion.compareTo("3.6.0") != 0) {
    Log.warning("SAPUI5's default jQuery version is 3.6.0; current version is " + jQuery.fn.jquery + ". Please note that we only support version 3.6.0.");
}
jQuery.sap.FrameOptions = FrameOptions;
jQuery.sap.globalEval = function () {
    eval(arguments[0]);
};
(function () {
    var b = Device.browser;
    var id = b.name;
    if (!jQuery.browser) {
        jQuery.browser = (function (ua) {
            var rwebkit = /(webkit)[ \/]([\w.]+)/, ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/, rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/, ua = ua.toLowerCase(), match = rwebkit.exec(ua) || ropera.exec(ua) || ua.indexOf("compatible") < 0 && rmozilla.exec(ua) || [], browser = {};
            if (match[1]) {
                browser[match[1]] = true;
                browser.version = match[2] || "0";
                if (browser.webkit) {
                    browser.safari = true;
                }
            }
            return browser;
        }(window.navigator.userAgent));
    }
    if (id === b.BROWSER.CHROME) {
        jQuery.browser.safari = false;
        jQuery.browser.chrome = true;
    }
    else if (id === b.BROWSER.SAFARI) {
        jQuery.browser.safari = true;
        jQuery.browser.chrome = false;
    }
    if (id) {
        jQuery.browser.fVersion = b.version;
        jQuery.browser.mobile = b.mobile;
    }
}());