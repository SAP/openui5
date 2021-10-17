import URI from "sap/ui/thirdparty/URI";
import Element from "../Element";
import UriParameters from "sap/base/util/UriParameters";
import Log from "sap/base/Log";
import extend from "sap/base/util/extend";
import ThemeCheck from "sap/ui/core/ThemeCheck";
import LoaderExtensions from "sap/base/util/LoaderExtensions";
import jQuery from "sap/ui/thirdparty/jquery";
import ThemeHelper from "./ThemeHelper";
export class Parameters {
    private static _addLibraryTheme(sLibId: any) {
        if (mParameters) {
            aParametersToLoad.push("sap-ui-theme-" + sLibId);
        }
    }
    private static _getScopes(bAvoidLoading: any, bAsync: any) {
        if (bAvoidLoading && !mParameters) {
            return;
        }
        var oParams = getParameters(bAsync);
        var aScopes = Object.keys(oParams["scopes"]);
        return aScopes;
    }
    static getActiveScopesFor(oElement: any, bAsync: any) {
        var aScopeChain = [];
        if (oElement instanceof Element) {
            var domRef = oElement.getDomRef();
            if (bAsync) {
                parsePendingLibraryParameters();
            }
            else {
                loadPendingLibraryParameters();
            }
            var aScopes = this._getScopes(undefined, bAsync);
            if (aScopes.length) {
                if (domRef) {
                    var fnNodeHasStyleClass = function (sScopeName) {
                        var scopeList = domRef.classList;
                        return scopeList && scopeList.contains(sScopeName);
                    };
                    while (domRef) {
                        var aFoundScopeClasses = aScopes.filter(fnNodeHasStyleClass);
                        if (aFoundScopeClasses.length > 0) {
                            aScopeChain.push(aFoundScopeClasses);
                        }
                        domRef = domRef.parentNode;
                    }
                }
                else {
                    var fnControlHasStyleClass = function (sScopeName) {
                        return typeof oElement.hasStyleClass === "function" && oElement.hasStyleClass(sScopeName);
                    };
                    while (oElement) {
                        var aFoundScopeClasses = aScopes.filter(fnControlHasStyleClass);
                        if (aFoundScopeClasses.length > 0) {
                            aScopeChain.push(aFoundScopeClasses);
                        }
                        oElement = typeof oElement.getParent === "function" && oElement.getParent();
                    }
                }
            }
        }
        return aScopeChain;
    }
    static get(vName: any, oElement: any) {
        var sParamName, fnAsyncCallback, bAsync, aNames, iIndex;
        var findRegisteredCallback = function (oCallbackInfo) { return oCallbackInfo.callback === fnAsyncCallback; };
        if (!sap.ui.getCore().isInitialized()) {
            Log.warning("Called sap.ui.core.theming.Parameters.get() before core has been initialized. " + "Consider using the API only when required, e.g. onBeforeRendering.");
        }
        if (arguments.length === 0) {
            Log.warning("Legacy variant usage of sap.ui.core.theming.Parameters.get API detected. Do not use the Parameters.get() API to retrieve ALL theming parameters, " + "as this will lead to unwanted synchronous requests. " + "Use the asynchronous API variant instead and retrieve a fixed set of parameters.", "LegacyParametersGet", "sap.ui.support", function () { return { type: "LegacyParametersGet" }; });
            loadPendingLibraryParameters(true);
            var oParams = getParameters(false, true);
            return Object.assign({}, oParams["default"]);
        }
        if (!vName) {
            return undefined;
        }
        if (vName instanceof Object && !Array.isArray(vName)) {
            if (!vName.name) {
                Log.warning("sap.ui.core.theming.Parameters.get was called with an object argument without one or more parameter names.");
                return undefined;
            }
            oElement = vName.scopeElement;
            fnAsyncCallback = vName.callback;
            aNames = typeof vName.name === "string" ? [vName.name] : vName.name;
            bAsync = true;
        }
        else {
            if (typeof vName === "string") {
                aNames = [vName];
            }
            else {
                aNames = vName;
            }
            Log.warning("Legacy variant usage of sap.ui.core.theming.Parameters.get API detected for parameter(s): '" + aNames.join(", ") + "'. This could lead to bad performance and additional synchronous XHRs, as parameters might not be available yet. Use asynchronous variant instead.", "LegacyParametersGet", "sap.ui.support", function () { return { type: "LegacyParametersGet" }; });
        }
        var resolveWithParameter, vResult;
        var lookForParameter = function (sName) {
            if (oElement instanceof Element) {
                return getParamForActiveScope(sName, oElement, bAsync);
            }
            else {
                if (bAsync) {
                    parsePendingLibraryParameters();
                }
                return getParam({
                    parameterName: sName,
                    loadPendingParameters: !bAsync,
                    async: bAsync
                });
            }
        };
        vResult = {};
        for (var i = 0; i < aNames.length; i++) {
            sParamName = aNames[i];
            var sParamValue = lookForParameter(sParamName);
            if (!bAsync || sParamValue) {
                vResult[sParamName] = sParamValue;
            }
        }
        if (bAsync && fnAsyncCallback && Object.keys(vResult).length !== aNames.length) {
            if (!sap.ui.getCore().isThemeApplied()) {
                resolveWithParameter = function () {
                    var vParams = this.get({
                        name: vName.name,
                        scopeElement: vName.scopeElement
                    });
                    if (!vParams || (typeof vParams === "object" && (Object.keys(vParams).length !== aNames.length))) {
                        Log.error("One or more parameters could not be found.", "sap.ui.core.theming.Parameters");
                    }
                    fnAsyncCallback(vParams);
                    aCallbackRegistry.splice(aCallbackRegistry.findIndex(findRegisteredCallback), 1);
                    sap.ui.getCore().detachThemeChanged(resolveWithParameter);
                }.bind(this);
                iIndex = aCallbackRegistry.findIndex(findRegisteredCallback);
                if (iIndex >= 0) {
                    sap.ui.getCore().detachThemeChanged(aCallbackRegistry[iIndex].eventHandler);
                    aCallbackRegistry[iIndex].eventHandler = resolveWithParameter;
                }
                else {
                    aCallbackRegistry.push({ callback: fnAsyncCallback, eventHandler: resolveWithParameter });
                }
                sap.ui.getCore().attachThemeChanged(resolveWithParameter);
                return undefined;
            }
            else {
                Log.error("One or more parameters could not be found.", "sap.ui.core.theming.Parameters");
            }
        }
        return aNames.length === 1 ? vResult[aNames[0]] : vResult;
    }
    private static _setOrLoadParameters(mLibraryParameters: any) {
        mParameters = {
            "default": {},
            "scopes": {}
        };
        sTheme = sap.ui.getCore().getConfiguration().getTheme();
        forEachStyleSheet(function (sId) {
            var sLibname = sId.substr(13);
            if (mLibraryParameters[sLibname]) {
                extend(mParameters["default"], mLibraryParameters[sLibname]);
            }
            else {
                loadParameters(sId);
            }
        });
    }
    static reset(...args: any) {
        var bOnlyWhenNecessary = arguments[0] === true;
        if (!bOnlyWhenNecessary || sap.ui.getCore().getConfiguration().getTheme() !== sTheme) {
            mParameters = null;
            if (oDummyScopeElement) {
                document.documentElement.removeChild(oDummyScopeElement);
                oDummyScopeElement = oComputedScopeStyle = undefined;
            }
            ThemeHelper.reset();
        }
    }
    private static _getThemeImage(sParamName: any, bForce: any) {
        sParamName = sParamName || "sapUiGlobalLogo";
        var logo = Parameters.get(sParamName);
        if (logo) {
            var match = rCssUrl.exec(logo);
            if (match) {
                logo = match[1];
            }
            else if (logo === "''" || logo === "none") {
                logo = null;
            }
        }
        if (bForce && !logo) {
            return sap.ui.resource("sap.ui.core", "themes/base/img/1x1.gif");
        }
        return logo;
    }
}
var oCfgData = window["sap-ui-config"] || {};
var syncCallBehavior = 0;
if (oCfgData["xx-nosync"] === "warn" || /(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search)) {
    syncCallBehavior = 1;
}
if (oCfgData["xx-nosync"] === true || oCfgData["xx-nosync"] === "true" || /(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search)) {
    syncCallBehavior = 2;
}
var mParameters = null;
var sTheme = null;
var aParametersToLoad = [];
var aCallbackRegistry = [];
var sBootstrapOrigin = new URI(sap.ui.require.toUrl(""), document.baseURI).origin();
var mOriginsNeedingCredentials = {};
var rCssUrl = /url[\s]*\('?"?([^\'")]*)'?"?\)/;
var bUseInlineParameters = UriParameters.fromQuery(window.location.search).get("sap-ui-xx-no-inline-theming-parameters") !== "true";
var oComputedScopeStyle, oDummyScopeElement;
function checkAndResolveRelativeUrl(sUrl, sThemeBaseUrl) {
    var aMatch = rCssUrl.exec(sUrl);
    if (aMatch) {
        var oUri = new URI(aMatch[1]);
        if (oUri.is("relative")) {
            var sNormalizedUrl = oUri.absoluteTo(sThemeBaseUrl).normalize().toString();
            sUrl = "url('" + sNormalizedUrl + "')";
        }
    }
    return sUrl;
}
function checkAndResolveUI5Url(sParamValue, sParameterName) {
    var aMatch = rCssUrl.exec(sParamValue);
    if (aMatch && aMatch[1]) {
        var oBodyStyle = window.getComputedStyle(document.body || document.documentElement);
        sParamValue = oBodyStyle.getPropertyValue("--" + sParameterName + "__asResolvedUrl").trim();
        if (sParamValue) {
            sParamValue = JSON.parse(sParamValue);
            var sResolvedUrl = LoaderExtensions.resolveUI5Url(sParamValue);
            sParamValue = "url(" + JSON.stringify(sResolvedUrl) + ")";
        }
        else {
            Log.error("The parameter '" + sParameterName + "' contains a url, but no matching resolved-url CSS variable could be found.");
        }
    }
    return sParamValue;
}
function mergeParameterSet(mCurrent, mNew, sThemeBaseUrl) {
    for (var sParam in mNew) {
        if (typeof mCurrent[sParam] === "undefined") {
            mCurrent[sParam] = checkAndResolveRelativeUrl(mNew[sParam], sThemeBaseUrl);
        }
    }
    return mCurrent;
}
function mergeParameters(mNewParameters, sThemeBaseUrl) {
    if (typeof mNewParameters["default"] !== "object") {
        mNewParameters = {
            "default": mNewParameters,
            "scopes": {}
        };
    }
    mParameters = mParameters || {};
    mParameters["default"] = mParameters["default"] || {};
    mParameters["scopes"] = mParameters["scopes"] || {};
    mergeParameterSet(mParameters["default"], mNewParameters["default"], sThemeBaseUrl);
    if (typeof mNewParameters["scopes"] === "object") {
        for (var sScopeName in mNewParameters["scopes"]) {
            mParameters["scopes"][sScopeName] = mParameters["scopes"][sScopeName] || {};
            mergeParameterSet(mParameters["scopes"][sScopeName], mNewParameters["scopes"][sScopeName], sThemeBaseUrl);
        }
    }
    var aScopeList = Object.keys(mParameters["scopes"]);
    if (aScopeList.length) {
        if (aScopeList.length > 1) {
            Log.error("There are multiple theming parameter scopes available but only a single scope is supported. Only the first scope '" + aScopeList[0] + "' is used for retrieval of parameters.");
        }
        if (!oComputedScopeStyle) {
            oDummyScopeElement = document.createElement("span");
            oDummyScopeElement.classList.add(aScopeList[0]);
            document.documentElement.appendChild(oDummyScopeElement);
            oComputedScopeStyle = window.getComputedStyle(oDummyScopeElement);
        }
    }
}
function forEachStyleSheet(fnCallback) {
    jQuery("link[id^=sap-ui-theme-]").each(function () {
        fnCallback(this.getAttribute("id"));
    });
}
function parseParameters(sId) {
    if (libSupportsCSSVariables(sId)) {
        return false;
    }
    var oUrl = getThemeBaseUrlForId(sId);
    var bThemeApplied = ThemeCheck.checkStyle(sId);
    if (!bThemeApplied) {
        Log.warning("Parameters have been requested but theme is not applied, yet.", "sap.ui.core.theming.Parameters");
    }
    if (bThemeApplied && bUseInlineParameters) {
        var $link = jQuery(document.getElementById(sId));
        var sDataUri = $link.css("background-image");
        var aParams = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(sDataUri);
        if (aParams && aParams.length >= 2) {
            var sParams = aParams[1];
            if (sParams.charAt(0) !== "{" && sParams.charAt(sParams.length - 1) !== "}") {
                try {
                    sParams = decodeURIComponent(sParams);
                }
                catch (ex) {
                    Log.warning("Could not decode theme parameters URI from " + oUrl.styleSheetUrl);
                }
            }
            try {
                var oParams = JSON.parse(sParams);
                mergeParameters(oParams, oUrl.themeBaseUrl);
                return true;
            }
            catch (ex) {
                Log.warning("Could not parse theme parameters from " + oUrl.styleSheetUrl + ". Loading library-parameters.json as fallback solution.");
            }
        }
    }
    return false;
}
function libSupportsCSSVariables(sId) {
    var sLibName = sId.replace("sap-ui-theme-", "").replace(/\./g, "-");
    var sVariablesMarker = !!(window.getComputedStyle(document.body || document.documentElement).getPropertyValue("--sapUiTheme-" + sLibName).trim());
    if (sVariablesMarker) {
        var oMetadata = ThemeHelper.getMetadata(sId);
        if (oMetadata && oMetadata.Scopes && oMetadata.Scopes.length > 0) {
            var mScopes = {};
            oMetadata.Scopes.forEach(function (sScope) {
                mScopes[sScope] = {};
            });
            mergeParameters({
                "default": {},
                scopes: mScopes
            });
        }
    }
    return sVariablesMarker;
}
function loadParameters(sId, bGetAll) {
    var oUrl = getThemeBaseUrlForId(sId);
    if (libSupportsCSSVariables(sId) && !bGetAll) {
        return;
    }
    if (!parseParameters(sId)) {
        var sUrl = oUrl.styleSheetUrl.replace(/\/(?:css_variables|library)([^\/.]*)\.(?:css|less)($|[?#])/, function ($0, $1, $2) {
            return "/library-parameters.json" + ($2 ? $2 : "");
        });
        if (syncCallBehavior === 2) {
            Log.error("[nosync] Loading library-parameters.json ignored", sUrl, "sap.ui.core.theming.Parameters");
            return;
        }
        else if (syncCallBehavior === 1) {
            Log.error("[nosync] Loading library-parameters.json with sync XHR", sUrl, "sap.ui.core.theming.Parameters");
        }
        var sThemeOrigin = new URI(oUrl.themeBaseUrl).origin();
        var bWithCredentials = mOriginsNeedingCredentials[sThemeOrigin];
        var aWithCredentials = [];
        if (bWithCredentials === undefined) {
            if (sUrl.startsWith(sBootstrapOrigin)) {
                aWithCredentials = [false, true];
            }
            else {
                aWithCredentials = [true, false];
            }
        }
        else {
            aWithCredentials = [bWithCredentials];
        }
        loadParametersJSON(sUrl, oUrl.themeBaseUrl, aWithCredentials);
    }
}
function getThemeBaseUrlForId(sId) {
    var oLink = document.getElementById(sId);
    if (!oLink) {
        Log.warning("Could not find stylesheet element with ID", sId, "sap.ui.core.theming.Parameters");
        return undefined;
    }
    var sStyleSheetUrl = oLink.href;
    return {
        themeBaseUrl: new URI(sStyleSheetUrl).filename("").query("").toString(),
        styleSheetUrl: sStyleSheetUrl
    };
}
function loadParametersJSON(sUrl, sThemeBaseUrl, aWithCredentials) {
    var bCurrentWithCredentials = aWithCredentials.shift();
    var mHeaders = bCurrentWithCredentials ? {
        "X-Requested-With": "XMLHttpRequest"
    } : {};
    jQuery.ajax({
        url: sUrl,
        dataType: "json",
        async: false,
        xhrFields: {
            withCredentials: bCurrentWithCredentials
        },
        headers: mHeaders,
        success: function (data, textStatus, xhr) {
            var sThemeOrigin = new URI(sThemeBaseUrl).origin();
            mOriginsNeedingCredentials[sThemeOrigin] = bCurrentWithCredentials;
            if (Array.isArray(data)) {
                for (var j = 0; j < data.length; j++) {
                    var oParams = data[j];
                    mergeParameters(oParams, sThemeBaseUrl);
                }
            }
            else {
                mergeParameters(data, sThemeBaseUrl);
            }
        },
        error: function (xhr, textStatus, error) {
            Log.error("Could not load theme parameters from: " + sUrl, error);
            if (aWithCredentials.length > 0) {
                Log.warning("Initial library-parameters.json request failed ('withCredentials=" + bCurrentWithCredentials + "'; sUrl: '" + sUrl + "').\n" + "Retrying with 'withCredentials=" + !bCurrentWithCredentials + "'.", "sap.ui.core.theming.Parameters");
                loadParametersJSON(sUrl, sThemeBaseUrl, aWithCredentials);
            }
        }
    });
}
function getParameters(bAsync, bGetAll) {
    if (!mParameters) {
        mergeParameters({}, "");
        sTheme = sap.ui.getCore().getConfiguration().getTheme();
        forEachStyleSheet(function (sId) {
            if (bAsync) {
                if (ThemeCheck.checkStyle(sId)) {
                    parseParameters(sId);
                }
                else {
                    aParametersToLoad.push(sId);
                }
            }
            else {
                loadParameters(sId, bGetAll);
            }
        });
    }
    return mParameters;
}
function parsePendingLibraryParameters() {
    var aPendingThemes = [];
    aParametersToLoad.forEach(function (sId) {
        if (ThemeCheck.checkStyle(sId)) {
            parseParameters(sId);
        }
        else {
            aPendingThemes.push(sId);
        }
    });
    aParametersToLoad = aPendingThemes;
}
function loadPendingLibraryParameters(bGetAll) {
    aParametersToLoad.forEach(function (sLibId) {
        loadParameters(sLibId, bGetAll);
    });
    aParametersToLoad = [];
}
function lookUpParameter(mParams, sParameterName, bUseScope) {
    var sParam = mParams[sParameterName];
    if (!sParam) {
        var oComputedStyle = bUseScope ? oComputedScopeStyle : window.getComputedStyle(document.body || document.documentElement);
        sParam = oComputedStyle.getPropertyValue("--" + sParameterName).trim();
        sParam = sParam != "" ? sParam : undefined;
        if (sParam) {
            sParam = checkAndResolveUI5Url(sParam, sParameterName);
            mParams[sParameterName] = sParam;
        }
    }
    return sParam;
}
function getParam(mOptions) {
    var bAsync = mOptions.async, bUseScope = false, oParams = getParameters(bAsync);
    if (mOptions.scopeName) {
        oParams = oParams["scopes"][mOptions.scopeName];
        bUseScope = true;
    }
    else {
        oParams = oParams["default"];
    }
    var sParamValue = lookUpParameter(oParams, mOptions.parameterName, bUseScope);
    if (!sParamValue) {
        var iIndex = mOptions.parameterName.indexOf(":");
        if (iIndex != -1) {
            var sParamNameWithoutColon = mOptions.parameterName.substr(iIndex + 1);
            sParamValue = lookUpParameter(oParams, sParamNameWithoutColon, bUseScope);
        }
    }
    if (mOptions.loadPendingParameters && typeof sParamValue === "undefined" && !bAsync) {
        loadPendingLibraryParameters();
        sParamValue = getParam({
            parameterName: mOptions.parameterName,
            scopeName: mOptions.scopeName,
            loadPendingParameters: false
        });
    }
    return sParamValue;
}
function getParamForActiveScope(sParamName, oElement, bAsync) {
    var aScopeChain = Parameters.getActiveScopesFor(oElement, bAsync);
    var aFilteredScopeChain = aScopeChain.flat().reduce(function (aResult, sScope) {
        if (aResult.indexOf(sScope) === -1) {
            aResult.push(sScope);
        }
        return aResult;
    }, []);
    for (var i = 0; i < aFilteredScopeChain.length; i++) {
        var sScopeName = aFilteredScopeChain[i];
        var sParamValue = getParam({
            parameterName: sParamName,
            scopeName: sScopeName,
            async: bAsync
        });
        if (sParamValue) {
            return sParamValue;
        }
    }
    return getParam({
        parameterName: sParamName,
        async: bAsync
    });
}