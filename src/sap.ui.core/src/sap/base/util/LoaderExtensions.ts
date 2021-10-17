import jQuery from "sap/ui/thirdparty/jquery";
import Log from "sap/base/Log";
import assert from "sap/base/assert";
import extend from "sap/base/util/extend";
export class LoaderExtensions {
    static notifyResourceLoading = null;
    static getKnownSubtypes(...args: any) {
        return KNOWN_SUBTYPES;
    }
    static getAllRequiredModules(...args: any) {
        var aModuleNames = [], mModules = sap.ui.loader._.getAllModules(true), oModule;
        for (var sModuleName in mModules) {
            oModule = mModules[sModuleName];
            if (oModule.ui5 && oModule.state !== -1) {
                aModuleNames.push(oModule.ui5);
            }
        }
        return aModuleNames;
    }
    static registerResourcePath(sResourceNamePrefix: any, vUrlPrefix: any) {
        if (!vUrlPrefix) {
            vUrlPrefix = { url: null };
        }
        if (!mFinalPrefixes[sResourceNamePrefix]) {
            var sUrlPrefix;
            if (typeof vUrlPrefix === "string" || vUrlPrefix instanceof String) {
                sUrlPrefix = vUrlPrefix;
            }
            else {
                sUrlPrefix = vUrlPrefix.url;
                if (vUrlPrefix.final) {
                    mFinalPrefixes[sResourceNamePrefix] = vUrlPrefix.final;
                }
            }
            var sOldUrlPrefix = sap.ui.require.toUrl(sResourceNamePrefix);
            var oConfig;
            if (sUrlPrefix !== sOldUrlPrefix || vUrlPrefix.final) {
                oConfig = {
                    paths: {}
                };
                oConfig.paths[sResourceNamePrefix] = sUrlPrefix;
                sap.ui.loader.config(oConfig);
                Log.info("LoaderExtensions.registerResourcePath ('" + sResourceNamePrefix + "', '" + sUrlPrefix + "')" + (vUrlPrefix["final"] ? " (final)" : ""));
            }
        }
        else {
            Log.warning("LoaderExtensions.registerResourcePath with prefix " + sResourceNamePrefix + " already set as final. This call is ignored.");
        }
    }
    static resolveUI5Url(sUrl: any) {
        if (sUrl.startsWith("ui5:")) {
            var sNoScheme = sUrl.replace("ui5:", "");
            if (!sNoScheme.startsWith("//")) {
                throw new Error("URLs using the 'ui5' protocol must be absolute. Relative and server absolute URLs are reserved for future use.");
            }
            sNoScheme = sNoScheme.replace("//", "");
            return sap.ui.loader._.resolveURL(sap.ui.require.toUrl(sNoScheme));
        }
        else {
            return sUrl;
        }
    }
    static loadResource(sResourceName: any, mOptions: any) {
        var sType, oData, sUrl, oError, oDeferred, fnDone, iSyncCallBehavior;
        if (LoaderExtensions.notifyResourceLoading) {
            fnDone = LoaderExtensions.notifyResourceLoading();
        }
        if (typeof sResourceName === "string") {
            mOptions = mOptions || {};
        }
        else {
            mOptions = sResourceName || {};
            sResourceName = mOptions.name;
        }
        mOptions = extend({ failOnError: true, async: false }, mOptions);
        sType = mOptions.dataType;
        if (sType == null && sResourceName) {
            sType = (sType = rTypes.exec(sResourceName || mOptions.url)) && sType[1];
        }
        assert(/^(xml|html|json|text)$/.test(sType), "type must be one of xml, html, json or text");
        oDeferred = mOptions.async ? new jQuery.Deferred() : null;
        function handleData(d, e) {
            if (d == null && mOptions.failOnError) {
                oError = e || new Error("no data returned for " + sResourceName);
                if (mOptions.async) {
                    oDeferred.reject(oError);
                    Log.error(oError);
                }
                if (fnDone) {
                    fnDone();
                }
                return null;
            }
            if (mOptions.async) {
                oDeferred.resolve(d);
            }
            if (fnDone) {
                fnDone();
            }
            return d;
        }
        function convertData(d) {
            var vConverter = jQuery.ajaxSettings.converters["text " + sType];
            if (typeof vConverter === "function") {
                d = vConverter(d);
            }
            return handleData(d);
        }
        oData = sap.ui.loader._.getModuleContent(sResourceName, mOptions.url);
        if (oData != undefined) {
            if (mOptions.async) {
                setTimeout(function () {
                    convertData(oData);
                }, 0);
            }
            else {
                oData = convertData(oData);
            }
        }
        else {
            iSyncCallBehavior = sap.ui.loader._.getSyncCallBehavior();
            if (!mOptions.async && iSyncCallBehavior) {
                if (iSyncCallBehavior >= 1) {
                    Log.error("[nosync] loading resource '" + (sResourceName || mOptions.url) + "' with sync XHR");
                }
                else {
                    throw new Error("[nosync] loading resource '" + (sResourceName || mOptions.url) + "' with sync XHR");
                }
            }
            jQuery.ajax({
                url: sUrl = mOptions.url || sap.ui.loader._.getResourcePath(sResourceName),
                async: mOptions.async,
                dataType: sType,
                headers: mOptions.headers,
                success: function (data, textStatus, xhr) {
                    oData = handleData(data);
                },
                error: function (xhr, textStatus, error) {
                    oError = new Error("resource " + sResourceName + " could not be loaded from " + sUrl + ". Check for 'file not found' or parse errors. Reason: " + error);
                    oError.status = textStatus;
                    oError.error = error;
                    oError.statusCode = xhr.status;
                    oData = handleData(null, oError);
                }
            });
        }
        if (mOptions.async) {
            return Promise.resolve(oDeferred);
        }
        if (oError != null && mOptions.failOnError) {
            throw oError;
        }
        return oData;
    }
}
var KNOWN_SUBTYPES = {
    js: ["controller", "designtime", "fragment", "support", "view"],
    json: ["fragment", "view"],
    html: ["fragment", "view"],
    xml: ["fragment", "view"]
};
var rTypes = new RegExp("\\.(" + Object.keys(KNOWN_SUBTYPES).join("|") + ")$");
var mFinalPrefixes = Object.create(null);