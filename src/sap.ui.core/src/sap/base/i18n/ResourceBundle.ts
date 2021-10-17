import assert from "sap/base/assert";
import Log from "sap/base/Log";
import formatMessage from "sap/base/strings/formatMessage";
import Properties from "sap/base/util/Properties";
import merge from "sap/base/util/merge";
var rLocale = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;
var M_ISO639_NEW_TO_OLD = {
    "he": "iw",
    "yi": "ji",
    "nb": "no",
    "sr": "sh"
};
var M_ISO639_OLD_TO_NEW = {
    "iw": "he",
    "ji": "yi",
    "no": "nb"
};
var M_SUPPORTABILITY_TO_XS = {
    "en_US_saptrc": "1Q",
    "en_US_sappsd": "2Q",
    "en_US_saprigi": "3Q"
};
var sDefaultFallbackLocale = "en";
var rSAPSupportabilityLocales = /(?:^|-)(saptrc|sappsd|saprigi)(?:-|$)/i;
function normalize(sLocale, bPreserveLanguage) {
    var m;
    if (typeof sLocale === "string" && (m = rLocale.exec(sLocale.replace(/_/g, "-")))) {
        var sLanguage = m[1].toLowerCase();
        if (!bPreserveLanguage) {
            sLanguage = M_ISO639_NEW_TO_OLD[sLanguage] || sLanguage;
        }
        var sScript = m[2] ? m[2].toLowerCase() : undefined;
        var sRegion = m[3] ? m[3].toUpperCase() : undefined;
        var sVariants = m[4] ? m[4].slice(1) : undefined;
        var sPrivate = m[6];
        if ((sPrivate && (m = rSAPSupportabilityLocales.exec(sPrivate))) || (sVariants && (m = rSAPSupportabilityLocales.exec(sVariants)))) {
            return "en_US_" + m[1].toLowerCase();
        }
        if (sLanguage === "zh" && !sRegion) {
            if (sScript === "hans") {
                sRegion = "CN";
            }
            else if (sScript === "hant") {
                sRegion = "TW";
            }
        }
        if (sLanguage === "sr" && sScript === "latn") {
            if (bPreserveLanguage) {
                sLanguage = "sr_Latn";
            }
            else {
                sLanguage = "sh";
            }
        }
        return sLanguage + (sRegion ? "_" + sRegion + (sVariants ? "_" + sVariants.replace("-", "_") : "") : "");
    }
}
function normalizePreserveEmpty(sLocale, bPreserveLanguage) {
    if (sLocale === "") {
        return sLocale;
    }
    var sNormalizedLocale = normalize(sLocale, bPreserveLanguage);
    if (sNormalizedLocale === undefined) {
        throw new TypeError("Locale '" + sLocale + "' is not a valid BCP47 language tag");
    }
    return sNormalizedLocale;
}
function defaultLocale(sFallbackLocale) {
    var sLocale;
    if (window.sap && window.sap.ui && sap.ui.getCore) {
        sLocale = sap.ui.getCore().getConfiguration().getLanguage();
        sLocale = normalize(sLocale);
    }
    return sLocale || sFallbackLocale;
}
function defaultSupportedLocales() {
    if (window.sap && window.sap.ui && sap.ui.getCore) {
        return sap.ui.getCore().getConfiguration().getSupportedLanguages();
    }
    return [];
}
function convertLocaleToBCP47(sLocale, bConvertToModern) {
    var m;
    if (typeof sLocale === "string" && (m = rLocale.exec(sLocale.replace(/_/g, "-")))) {
        var sLanguage = m[1].toLowerCase();
        var sScript = m[2] ? m[2].toLowerCase() : undefined;
        if (bConvertToModern && sLanguage === "sh" && !sScript) {
            sLanguage = "sr_Latn";
        }
        else if (!bConvertToModern && sLanguage === "sr" && sScript === "latn") {
            sLanguage = "sh";
        }
        sLanguage = M_ISO639_OLD_TO_NEW[sLanguage] || sLanguage;
        return sLanguage + (m[3] ? "-" + m[3].toUpperCase() + (m[4] ? "-" + m[4].slice(1).replace("_", "-") : "") : "");
    }
}
var rUrl = /^((?:[^?#]*\/)?[^\/?#]*)(\.[^.\/?#]+)((?:\?([^#]*))?(?:#(.*))?)$/;
var A_VALID_FILE_TYPES = [".properties", ".hdbtextbundle"];
function splitUrl(sUrl) {
    var m = rUrl.exec(sUrl);
    if (!m || A_VALID_FILE_TYPES.indexOf(m[2]) < 0) {
        throw new Error("resource URL '" + sUrl + "' has unknown type (should be one of " + A_VALID_FILE_TYPES.join(",") + ")");
    }
    return { url: sUrl, prefix: m[1], ext: m[2], query: m[4], hash: (m[5] || ""), suffix: m[2] + (m[3] || "") };
}
function ResourceBundle(sUrl, sLocale, bIncludeInfo, bAsync, aSupportedLocales, sFallbackLocale, bSkipFallbackLocaleAndRaw) {
    this.sLocale = normalize(sLocale) || defaultLocale(sFallbackLocale === undefined ? sDefaultFallbackLocale : sFallbackLocale);
    this.oUrlInfo = splitUrl(sUrl);
    this.bIncludeInfo = bIncludeInfo;
    this.aCustomBundles = [];
    this.aPropertyFiles = [];
    this.aPropertyOrigins = [];
    this.aLocales = [];
    this._aFallbackLocales = calculateFallbackChain(this.sLocale, aSupportedLocales || defaultSupportedLocales(), sFallbackLocale, " of the bundle '" + this.oUrlInfo.url + "'", bSkipFallbackLocaleAndRaw);
    if (bAsync) {
        var resolveWithThis = function () { return this; }.bind(this);
        return loadNextPropertiesAsync(this).then(resolveWithThis, resolveWithThis);
    }
    loadNextPropertiesSync(this);
}
ResourceBundle.prototype._enhance = function (oCustomBundle) {
    if (oCustomBundle instanceof ResourceBundle) {
        this.aCustomBundles.push(oCustomBundle);
    }
    else {
        Log.error("Custom resource bundle is either undefined or not an instanceof sap/base/i18n/ResourceBundle. Therefore this custom resource bundle will be ignored!");
    }
};
ResourceBundle.prototype.getText = function (sKey, aArgs, bIgnoreKeyFallback) {
    var sValue = this._getTextFromProperties(sKey, aArgs);
    if (sValue != null) {
        return sValue;
    }
    sValue = this._getTextFromFallback(sKey, aArgs);
    if (sValue != null) {
        return sValue;
    }
    if (bIgnoreKeyFallback) {
        return undefined;
    }
    else {
        assert(false, "could not find any translatable text for key '" + sKey + "' in bundle file(s): '" + this.aPropertyOrigins.join("', '") + "'");
        return this._formatValue(sKey, sKey, aArgs);
    }
};
ResourceBundle.prototype._formatValue = function (sValue, sKey, aArgs) {
    if (typeof sValue === "string") {
        if (aArgs) {
            sValue = formatMessage(sValue, aArgs);
        }
        if (this.bIncludeInfo) {
            sValue = new String(sValue);
            sValue.originInfo = {
                source: "Resource Bundle",
                url: this.oUrlInfo.url,
                locale: this.sLocale,
                key: sKey
            };
        }
    }
    return sValue;
};
ResourceBundle.prototype._getTextFromFallback = function (sKey, aArgs) {
    var sValue, i;
    for (i = this.aCustomBundles.length - 1; i >= 0; i--) {
        sValue = this.aCustomBundles[i]._getTextFromFallback(sKey, aArgs);
        if (sValue != null) {
            return sValue;
        }
    }
    while (typeof sValue !== "string" && this._aFallbackLocales.length) {
        var oProperties = loadNextPropertiesSync(this);
        if (oProperties) {
            sValue = oProperties.getProperty(sKey);
            if (typeof sValue === "string") {
                return this._formatValue(sValue, sKey, aArgs);
            }
        }
    }
    return null;
};
ResourceBundle.prototype._getTextFromProperties = function (sKey, aArgs) {
    var sValue = null, i;
    for (i = this.aCustomBundles.length - 1; i >= 0; i--) {
        sValue = this.aCustomBundles[i]._getTextFromProperties(sKey, aArgs);
        if (sValue != null) {
            return sValue;
        }
    }
    for (i = 0; i < this.aPropertyFiles.length; i++) {
        sValue = this.aPropertyFiles[i].getProperty(sKey);
        if (typeof sValue === "string") {
            return this._formatValue(sValue, sKey, aArgs);
        }
    }
    return null;
};
ResourceBundle.prototype.hasText = function (sKey) {
    return this.aPropertyFiles.length > 0 && typeof this.aPropertyFiles[0].getProperty(sKey) === "string";
};
function loadNextPropertiesAsync(oBundle) {
    if (oBundle._aFallbackLocales.length) {
        return tryToLoadNextProperties(oBundle, true).then(function (oProps) {
            return oProps || loadNextPropertiesAsync(oBundle);
        });
    }
    return Promise.resolve(null);
}
function loadNextPropertiesSync(oBundle) {
    while (oBundle._aFallbackLocales.length) {
        var oProps = tryToLoadNextProperties(oBundle, false);
        if (oProps) {
            return oProps;
        }
    }
    return null;
}
function tryToLoadNextProperties(oBundle, bAsync) {
    var sLocale = oBundle._aFallbackLocales.shift();
    if (sLocale != null) {
        var oUrl = oBundle.oUrlInfo, sUrl, mHeaders;
        if (oUrl.ext === ".hdbtextbundle") {
            if (M_SUPPORTABILITY_TO_XS[sLocale]) {
                sUrl = oUrl.prefix + oUrl.suffix + "?" + (oUrl.query ? oUrl.query + "&" : "") + "sap-language=" + M_SUPPORTABILITY_TO_XS[sLocale] + (oUrl.hash ? "#" + oUrl.hash : "");
            }
            else {
                sUrl = oUrl.url;
            }
            mHeaders = {
                "Accept-Language": convertLocaleToBCP47(sLocale) || ""
            };
        }
        else {
            sUrl = oUrl.prefix + (sLocale ? "_" + sLocale : "") + oUrl.suffix;
        }
        var vProperties = Properties.create({
            url: sUrl,
            headers: mHeaders,
            async: !!bAsync,
            returnNullIfMissing: true
        });
        var addProperties = function (oProps) {
            if (oProps) {
                oBundle.aPropertyFiles.push(oProps);
                oBundle.aPropertyOrigins.push(sUrl);
                oBundle.aLocales.push(sLocale);
            }
            return oProps;
        };
        return bAsync ? vProperties.then(addProperties) : addProperties(vProperties);
    }
    return bAsync ? Promise.resolve(null) : null;
}
ResourceBundle._getUrl = function (bundleUrl, bundleName) {
    var sUrl = bundleUrl;
    if (bundleName) {
        bundleName = bundleName.replace(/\./g, "/");
        sUrl = sap.ui.require.toUrl(bundleName) + ".properties";
    }
    return sUrl;
};
function getEnhanceWithResourceBundles(aActiveTerminologies, aEnhanceWith, sLocale, bIncludeInfo, bAsync, sFallbackLocale, aSupportedLocales) {
    if (!aEnhanceWith) {
        return [];
    }
    var aCustomBundles = [];
    aEnhanceWith.forEach(function (oEnhanceWith) {
        if (oEnhanceWith.fallbackLocale === undefined) {
            oEnhanceWith.fallbackLocale = sFallbackLocale;
        }
        if (oEnhanceWith.supportedLocales === undefined) {
            oEnhanceWith.supportedLocales = aSupportedLocales;
        }
        var sUrl = ResourceBundle._getUrl(oEnhanceWith.bundleUrl, oEnhanceWith.bundleName);
        var vResourceBundle = new ResourceBundle(sUrl, sLocale, bIncludeInfo, bAsync, oEnhanceWith.supportedLocales, oEnhanceWith.fallbackLocale);
        aCustomBundles.push(vResourceBundle);
        if (oEnhanceWith.terminologies) {
            aCustomBundles = aCustomBundles.concat(getTerminologyResourceBundles(aActiveTerminologies, oEnhanceWith.terminologies, sLocale, bIncludeInfo, bAsync));
        }
    });
    return aCustomBundles;
}
function getTerminologyResourceBundles(aActiveTerminologies, oTerminologies, sLocale, bIncludeInfo, bAsync) {
    if (!aActiveTerminologies) {
        return [];
    }
    aActiveTerminologies = aActiveTerminologies.filter(function (sActiveTechnology) {
        return oTerminologies.hasOwnProperty(sActiveTechnology);
    });
    aActiveTerminologies.reverse();
    return aActiveTerminologies.map(function (sActiveTechnology) {
        var mParamsTerminology = oTerminologies[sActiveTechnology];
        var sUrl = ResourceBundle._getUrl(mParamsTerminology.bundleUrl, mParamsTerminology.bundleName);
        var aSupportedLocales = mParamsTerminology.supportedLocales;
        return new ResourceBundle(sUrl, sLocale, bIncludeInfo, bAsync, aSupportedLocales, null, true);
    });
}
ResourceBundle.create = function (mParams) {
    mParams = merge({ url: "", includeInfo: false }, mParams);
    if (mParams.bundleUrl || mParams.bundleName) {
        mParams.url = mParams.url || ResourceBundle._getUrl(mParams.bundleUrl, mParams.bundleName);
    }
    var vResourceBundle = new ResourceBundle(mParams.url, mParams.locale, mParams.includeInfo, !!mParams.async, mParams.supportedLocales, mParams.fallbackLocale);
    var aCustomBundles = [];
    if (mParams.terminologies) {
        aCustomBundles = aCustomBundles.concat(getTerminologyResourceBundles(mParams.activeTerminologies, mParams.terminologies, mParams.locale, mParams.includeInfo, !!mParams.async));
    }
    if (mParams.enhanceWith) {
        aCustomBundles = aCustomBundles.concat(getEnhanceWithResourceBundles(mParams.activeTerminologies, mParams.enhanceWith, mParams.locale, mParams.includeInfo, !!mParams.async, mParams.fallbackLocale, mParams.supportedLocales));
    }
    if (aCustomBundles.length) {
        if (vResourceBundle instanceof Promise) {
            vResourceBundle = vResourceBundle.then(function (oResourceBundle) {
                return Promise.all(aCustomBundles).then(function (aCustomBundles) {
                    aCustomBundles.forEach(oResourceBundle._enhance, oResourceBundle);
                }).then(function () {
                    return oResourceBundle;
                });
            });
        }
        else {
            aCustomBundles.forEach(vResourceBundle._enhance, vResourceBundle);
        }
    }
    return vResourceBundle;
};
function findSupportedLocale(sLocale, aSupportedLocales) {
    if (!aSupportedLocales || aSupportedLocales.length === 0 || aSupportedLocales.indexOf(sLocale) >= 0) {
        return sLocale;
    }
    sLocale = convertLocaleToBCP47(sLocale, true);
    if (sLocale) {
        sLocale = normalize(sLocale, true);
    }
    if (aSupportedLocales.indexOf(sLocale) >= 0) {
        return sLocale;
    }
    return undefined;
}
function calculateFallbackChain(sLocale, aSupportedLocales, sFallbackLocale, sContextInfo, bSkipFallbackLocaleAndRaw) {
    aSupportedLocales = aSupportedLocales && aSupportedLocales.map(function (sSupportedLocale) {
        return normalizePreserveEmpty(sSupportedLocale, true);
    });
    if (!bSkipFallbackLocaleAndRaw) {
        var bFallbackLocaleDefined = sFallbackLocale !== undefined;
        sFallbackLocale = bFallbackLocaleDefined ? sFallbackLocale : sDefaultFallbackLocale;
        sFallbackLocale = normalizePreserveEmpty(sFallbackLocale);
        if (sFallbackLocale !== "" && !findSupportedLocale(sFallbackLocale, aSupportedLocales)) {
            var sMessage = "The fallback locale '" + sFallbackLocale + "' is not contained in the list of supported locales ['" + aSupportedLocales.join("', '") + "']" + sContextInfo + " and will be ignored.";
            if (bFallbackLocaleDefined) {
                throw new Error(sMessage);
            }
            Log.error(sMessage);
        }
    }
    var aLocales = [], sSupportedLocale;
    while (sLocale != null) {
        sSupportedLocale = findSupportedLocale(sLocale, aSupportedLocales);
        if (sSupportedLocale !== undefined && aLocales.indexOf(sSupportedLocale) === -1) {
            aLocales.push(sSupportedLocale);
        }
        if (!sLocale) {
            sLocale = null;
        }
        else if (sLocale === "zh_HK") {
            sLocale = "zh_TW";
        }
        else if (sLocale.lastIndexOf("_") >= 0) {
            sLocale = sLocale.slice(0, sLocale.lastIndexOf("_"));
        }
        else if (bSkipFallbackLocaleAndRaw) {
            sLocale = null;
        }
        else if (sFallbackLocale) {
            sLocale = sFallbackLocale;
            sFallbackLocale = null;
        }
        else {
            sLocale = "";
        }
    }
    return aLocales;
}
ResourceBundle._getFallbackLocales = function (sLocale, aSupportedLocales, sFallbackLocale) {
    return calculateFallbackChain(normalize(sLocale), aSupportedLocales, sFallbackLocale, "");
};