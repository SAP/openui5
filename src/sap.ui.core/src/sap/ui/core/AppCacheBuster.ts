import ManagedObject from "sap/ui/base/ManagedObject";
import URI from "sap/ui/thirdparty/URI";
import Log from "sap/base/Log";
import extend from "sap/base/util/extend";
import escapeRegExp from "sap/base/strings/escapeRegExp";
import jQuery from "sap/ui/thirdparty/jquery";
import _IconRegistry from "sap/ui/core/_IconRegistry";
export class AppCacheBuster {
    static boot(oSyncPoint: any) {
        var oConfig = oConfiguration.getAppCacheBuster();
        if (oConfig && oConfig.length > 0) {
            oConfig = oConfig.slice();
            var bActive = true;
            var sValue = String(oConfig[0]).toLowerCase();
            if (oConfig.length === 1) {
                if (sValue === "true" || sValue === "x") {
                    var oUri = URI(sOrgBaseUrl);
                    oConfig = oUri.is("relative") ? [oUri.toString()] : [];
                }
                else if (sValue === "false") {
                    bActive = false;
                }
            }
            if (bActive) {
                AppCacheBuster.init();
                fnRegister(oConfig, oSyncPoint);
            }
        }
    }
    static init(...args: any) {
        oSession.active = true;
        fnValidateProperty = ManagedObject.prototype.validateProperty;
        descScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
        descLinkHref = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, "href");
        var fnConvertUrl = AppCacheBuster.convertURL;
        var fnNormalizeUrl = AppCacheBuster.normalizeURL;
        var fnIsACBUrl = function (sUrl) {
            if (this.active === true && sUrl && typeof (sUrl) === "string") {
                sUrl = fnNormalizeUrl(sUrl);
                return !sUrl.match(oFilter);
            }
            return false;
        }.bind(oSession);
        fnXhrOpenOrig = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (sMethod, sUrl) {
            if (sUrl && fnIsACBUrl(sUrl)) {
                arguments[1] = fnConvertUrl(sUrl);
            }
            fnXhrOpenOrig.apply(this, arguments);
        };
        fnEnhancedXhrOpen = XMLHttpRequest.prototype.open;
        ManagedObject.prototype.validateProperty = function (sPropertyName, oValue) {
            var oMetadata = this.getMetadata(), oProperty = oMetadata.getProperty(sPropertyName), oArgs;
            if (oProperty && oProperty.type === "sap.ui.core.URI") {
                oArgs = Array.prototype.slice.apply(arguments);
                try {
                    if (fnIsACBUrl(oArgs[1])) {
                        oArgs[1] = fnConvertUrl(oArgs[1]);
                    }
                }
                catch (e) {
                }
            }
            return fnValidateProperty.apply(this, oArgs || arguments);
        };
        _IconRegistry._convertUrl = function (sUrl) {
            return fnConvertUrl(sUrl);
        };
        var fnCreateInterceptorDescriptor = function (descriptor) {
            var newDescriptor = {
                get: descriptor.get,
                set: function (val) {
                    if (fnIsACBUrl(val)) {
                        val = fnConvertUrl(val);
                    }
                    descriptor.set.call(this, val);
                },
                enumerable: descriptor.enumerable,
                configurable: descriptor.configurable
            };
            newDescriptor.set._sapUiCoreACB = true;
            return newDescriptor;
        };
        var bError = false;
        try {
            Object.defineProperty(HTMLScriptElement.prototype, "src", fnCreateInterceptorDescriptor(descScriptSrc));
        }
        catch (ex) {
            Log.error("Your browser doesn't support redefining the src property of the script tag. Disabling AppCacheBuster as it is not supported on your browser!\nError: " + ex);
            bError = true;
        }
        try {
            Object.defineProperty(HTMLLinkElement.prototype, "href", fnCreateInterceptorDescriptor(descLinkHref));
        }
        catch (ex) {
            Log.error("Your browser doesn't support redefining the href property of the link tag. Disabling AppCacheBuster as it is not supported on your browser!\nError: " + ex);
            bError = true;
        }
        if (bError) {
            this.exit();
        }
    }
    static exit(...args: any) {
        ManagedObject.prototype.validateProperty = fnValidateProperty;
        delete _IconRegistry._convertUrl;
        if (XMLHttpRequest.prototype.open === fnEnhancedXhrOpen) {
            XMLHttpRequest.prototype.open = fnXhrOpenOrig;
        }
        var descriptor;
        if ((descriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src")) && descriptor.set && descriptor.set._sapUiCoreACB === true) {
            Object.defineProperty(HTMLScriptElement.prototype, "src", descScriptSrc);
        }
        if ((descriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, "href")) && descriptor.set && descriptor.set._sapUiCoreACB === true) {
            Object.defineProperty(HTMLLinkElement.prototype, "href", descLinkHref);
        }
        oSession.index = {};
        oSession.active = false;
        oSession = {
            index: {},
            active: false
        };
    }
    static register(sBaseUrl: any) {
        fnRegister(sBaseUrl);
    }
    static convertURL(sUrl: any) {
        Log.debug("sap.ui.core.AppCacheBuster.convertURL(\"" + sUrl + "\");");
        var mIndex = oSession.index;
        if (mIndex && sUrl && !/^#/.test(sUrl)) {
            var sNormalizedUrl = AppCacheBuster.normalizeURL(sUrl);
            Log.debug("  --> normalized to: \"" + sNormalizedUrl + "\"");
            if (sNormalizedUrl && AppCacheBuster.handleURL(sNormalizedUrl)) {
                for (var sBaseUrl in mIndex) {
                    var mBaseUrlIndex = mIndex[sBaseUrl], sUrlToAppend, sUrlPath;
                    if (sBaseUrl && sNormalizedUrl.length >= sBaseUrl.length && sNormalizedUrl.slice(0, sBaseUrl.length) === sBaseUrl) {
                        sUrlToAppend = sNormalizedUrl.slice(sBaseUrl.length);
                        sUrlPath = sUrlToAppend.match(/([^?#]*)/)[1];
                        if (mBaseUrlIndex[sUrlPath]) {
                            sUrl = sBaseUrl + "~" + mBaseUrlIndex[sUrlPath] + "~/" + sUrlToAppend;
                            Log.debug("  ==> rewritten to \"" + sUrl + "\";");
                            break;
                        }
                    }
                }
            }
        }
        return sUrl;
    }
    static normalizeURL(sUrl: any) {
        var oUri = URI(sUrl || "./");
        if (oUri.is("relative")) {
            oUri = oUri.absoluteTo(sLocation);
        }
        return oUri.normalizeProtocol().normalizeHostname().normalizePort().normalizePath().toString();
    }
    static handleURL(sUrl: any) {
        return true;
    }
    static onIndexLoad(sUrl: any) {
        return null;
    }
    static onIndexLoaded(sUrl: any, mIndexInfo: any) {
    }
}
var oConfiguration = sap.ui.getCore().getConfiguration();
var sLanguage = oConfiguration.getLanguage();
var bSync = oConfiguration.getAppCacheBusterMode() === "sync";
var bBatch = oConfiguration.getAppCacheBusterMode() === "batch";
var oSession = {
    index: {},
    active: false
};
var fnValidateProperty, descScriptSrc, descLinkHref, fnXhrOpenOrig, fnEnhancedXhrOpen;
var sLocation = document.baseURI.replace(/\?.*|#.*/g, "");
var oUri = URI(sap.ui.require.toUrl("") + "/../");
var sOrgBaseUrl = oUri.toString();
if (oUri.is("relative")) {
    oUri = oUri.absoluteTo(sLocation);
}
var sBaseUrl = oUri.normalize().toString();
var sResBaseUrl = URI("resources").absoluteTo(sBaseUrl).toString();
var oFilter = new RegExp("^" + escapeRegExp(sResBaseUrl));
var fnEnsureTrailingSlash = function (sUrl) {
    if (sUrl.length > 0 && sUrl.slice(-1) !== "/") {
        sUrl += "/";
    }
    return sUrl;
};
var fnRegister = function (sBaseUrl, oSyncPoint) {
    var mIndex = oSession.index;
    var oRequest;
    var sUrl;
    var sAbsoluteBaseUrl;
    if (Array.isArray(sBaseUrl) && !bBatch) {
        sBaseUrl.forEach(function (sBaseUrlEntry) {
            fnRegister(sBaseUrlEntry, oSyncPoint);
        });
    }
    else if (Array.isArray(sBaseUrl) && bBatch) {
        var sRootUrl = fnEnsureTrailingSlash(sBaseUrl[0]);
        var sContent = [];
        Log.debug("sap.ui.core.AppCacheBuster.register(\"" + sRootUrl + "\"); // BATCH MODE!");
        var sAbsoluteRootUrl = AppCacheBuster.normalizeURL(sRootUrl);
        Log.debug("  --> normalized to: \"" + sAbsoluteRootUrl + "\"");
        sBaseUrl.forEach(function (sUrlEntry) {
            sUrl = fnEnsureTrailingSlash(sUrlEntry);
            var sAbsoluteUrl = AppCacheBuster.normalizeURL(sUrl);
            if (!mIndex[sAbsoluteBaseUrl]) {
                sContent.push(sAbsoluteUrl);
            }
        });
        if (sContent.length > 0) {
            var sUrl = sAbsoluteRootUrl + "sap-ui-cachebuster-info.json?sap-ui-language=" + sLanguage;
            oRequest = {
                url: sUrl,
                type: "POST",
                async: !bSync && !!oSyncPoint,
                dataType: "json",
                contentType: "text/plain",
                data: sContent.join("\n"),
                success: function (data) {
                    AppCacheBuster.onIndexLoaded(sUrl, data);
                    extend(mIndex, data);
                },
                error: function () {
                    Log.error("Failed to batch load AppCacheBuster index file from: \"" + sUrl + "\".");
                }
            };
        }
    }
    else {
        sBaseUrl = fnEnsureTrailingSlash(sBaseUrl);
        Log.debug("sap.ui.core.AppCacheBuster.register(\"" + sBaseUrl + "\");");
        sAbsoluteBaseUrl = AppCacheBuster.normalizeURL(sBaseUrl);
        Log.debug("  --> normalized to: \"" + sAbsoluteBaseUrl + "\"");
        if (!mIndex[sAbsoluteBaseUrl]) {
            var sUrl = sAbsoluteBaseUrl + "sap-ui-cachebuster-info.json?sap-ui-language=" + sLanguage;
            oRequest = {
                url: sUrl,
                async: !bSync && !!oSyncPoint,
                dataType: "json",
                success: function (data) {
                    AppCacheBuster.onIndexLoaded(sUrl, data);
                    mIndex[sAbsoluteBaseUrl] = data;
                },
                error: function () {
                    Log.error("Failed to load AppCacheBuster index file from: \"" + sUrl + "\".");
                }
            };
        }
    }
    if (oRequest) {
        var mIndexInfo = AppCacheBuster.onIndexLoad(oRequest.url);
        if (mIndexInfo != null) {
            Log.info("AppCacheBuster index file injected for: \"" + sUrl + "\".");
            oRequest.success(mIndexInfo);
        }
        else {
            if (oRequest.async) {
                var iSyncPoint = oSyncPoint.startTask("load " + sUrl);
                var fnSuccess = oRequest.success, fnError = oRequest.error;
                Object.assign(oRequest, {
                    success: function (data) {
                        fnSuccess.apply(this, arguments);
                        oSyncPoint.finishTask(iSyncPoint);
                    },
                    error: function () {
                        fnError.apply(this, arguments);
                        oSyncPoint.finishTask(iSyncPoint, false);
                    }
                });
            }
            Log.info("Loading AppCacheBuster index file from: \"" + sUrl + "\".");
            jQuery.ajax(oRequest);
        }
    }
};
var mHooks = oConfiguration.getAppCacheBusterHooks();
if (mHooks) {
    ["handleURL", "onIndexLoad", "onIndexLoaded"].forEach(function (sFunction) {
        if (typeof mHooks[sFunction] === "function") {
            AppCacheBuster[sFunction] = mHooks[sFunction];
        }
    });
}