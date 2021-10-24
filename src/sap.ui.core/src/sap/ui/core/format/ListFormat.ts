import Locale from "sap/ui/core/Locale";
import LocaleData from "sap/ui/core/LocaleData";
import Log from "sap/base/Log";
import extend from "sap/base/util/extend";
import isEmptyObject from "sap/base/util/isEmptyObject";
export class ListFormat {
    static oDefaultListFormat = {
        type: "standard",
        style: "wide"
    };
    format(aList: any) {
        if (!Array.isArray(aList)) {
            Log.error("ListFormat can only format with an array given.");
            return "";
        }
        var oOriginalFormat = this.oOriginalFormatOptions, mListPatterns, sPattern, sValue, sStart, sMiddle, sEnd, aValues = [].concat(aList), aStart, aMiddle;
        mListPatterns = this.oLocaleData.getListFormat(oOriginalFormat.type, oOriginalFormat.style);
        if (isEmptyObject(mListPatterns)) {
            Log.error("No list pattern exists for the provided format options (type, style).");
            return "";
        }
        function replaceMiddlePatterns(aValues, sPattern) {
            var sResult = aValues[0];
            for (var i = 1; i < aValues.length; i++) {
                sResult = sPattern.replace("{0}", sResult);
                sResult = sResult.replace("{1}", aValues[i]);
            }
            return sResult;
        }
        if (mListPatterns[aValues.length]) {
            sPattern = mListPatterns[aValues.length];
            for (var i = 0; i < aValues.length; i++) {
                sPattern = sPattern.replace("{" + i + "}", aValues[i]);
            }
            sValue = sPattern;
        }
        else if (aValues.length < 2) {
            sValue = aValues.toString();
        }
        else {
            aStart = aValues.shift();
            sEnd = aValues.pop();
            aMiddle = aValues;
            sStart = mListPatterns.start.replace("{0}", aStart);
            sEnd = mListPatterns.end.replace("{1}", sEnd);
            sMiddle = replaceMiddlePatterns(aMiddle, mListPatterns.middle);
            sValue = sStart.replace("{1}", sEnd.replace("{0}", sMiddle));
        }
        return sValue;
    }
    parse(sValue: any) {
        if (typeof sValue !== "string") {
            Log.error("ListFormat can only parse a String.");
            return [];
        }
        var aResult = [], aStart = [], aMiddle = [], aEnd = [], aExactNumber = [], oOriginalFormat = this.oOriginalFormatOptions, mListPatterns, rPlaceholder = /\{[01]\}/g, sEnd, sSeparatorExactNumber, sSeparatorStart, sSeparatorMiddle, sSeparatorEnd;
        if (!oOriginalFormat) {
            oOriginalFormat = ListFormat.oDefaultListFormat;
        }
        mListPatterns = this.oLocaleData.getListFormat(oOriginalFormat.type, oOriginalFormat.style);
        if (isEmptyObject(mListPatterns)) {
            Log.error("No list pattern exists for the provided format options (type, style).");
            return [];
        }
        sSeparatorStart = mListPatterns.start.replace(rPlaceholder, "");
        sSeparatorMiddle = mListPatterns.middle.replace(rPlaceholder, "");
        sSeparatorEnd = mListPatterns.end.replace(rPlaceholder, "");
        aStart = sValue.split(sSeparatorStart);
        aResult = aResult.concat(aStart.shift());
        aEnd = aStart.join(sSeparatorStart).split(sSeparatorEnd);
        sEnd = aEnd.pop();
        aMiddle = aEnd.join(sSeparatorEnd).split(sSeparatorMiddle);
        aResult = aResult.concat(aMiddle);
        aResult.push(sEnd);
        if (aStart.length < 1 || aMiddle.length < 1 || aEnd.length < 1) {
            sSeparatorExactNumber = mListPatterns["2"].replace(rPlaceholder, "");
            aExactNumber = sValue.split(sSeparatorExactNumber);
            if (aExactNumber.length === 2) {
                return aExactNumber;
            }
            if (sValue) {
                return [sValue];
            }
            else {
                return [];
            }
        }
        return aResult;
    }
    static getInstance(oFormatOptions: any, oLocale: any) {
        return this.createInstance(oFormatOptions, oLocale);
    }
    static createInstance(oFormatOptions: any, oLocale: any) {
        var oFormat = Object.create(this.prototype);
        if (oFormatOptions instanceof Locale) {
            oLocale = oFormatOptions;
            oFormatOptions = undefined;
        }
        if (!oLocale) {
            oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
        }
        oFormat.oLocale = oLocale;
        oFormat.oLocaleData = LocaleData.getInstance(oLocale);
        oFormat.oOriginalFormatOptions = extend({}, this.oDefaultListFormat, oFormatOptions);
        return oFormat;
    }
    constructor(...args: any) {
        throw new Error();
    }
}