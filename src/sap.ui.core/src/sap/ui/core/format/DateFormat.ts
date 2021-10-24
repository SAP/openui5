import CalendarType from "sap/ui/core/CalendarType";
import Locale from "sap/ui/core/Locale";
import LocaleData from "sap/ui/core/LocaleData";
import UniversalDate from "sap/ui/core/date/UniversalDate";
import deepEqual from "sap/base/util/deepEqual";
import formatMessage from "sap/base/strings/formatMessage";
import Log from "sap/base/Log";
import extend from "sap/base/util/extend";
export class DateFormat {
    static oDateInfo = {
        oDefaultFormatOptions: {
            style: "medium",
            relativeScale: "day",
            relativeStyle: "wide"
        },
        aFallbackFormatOptions: [
            { style: "short" },
            { style: "medium" },
            { pattern: "yyyy-MM-dd" },
            { pattern: "yyyyMMdd", strictParsing: true }
        ],
        bShortFallbackFormatOptions: true,
        bPatternFallbackWithoutDelimiter: true,
        getPattern: function (oLocaleData, sStyle, sCalendarType) {
            return oLocaleData.getDatePattern(sStyle, sCalendarType);
        },
        oRequiredParts: {
            "text": true,
            "year": true,
            "weekYear": true,
            "month": true,
            "day": true
        },
        aRelativeScales: ["year", "month", "week", "day"],
        aRelativeParseScales: ["year", "quarter", "month", "week", "day", "hour", "minute", "second"],
        aIntervalCompareFields: ["Era", "FullYear", "Quarter", "Month", "Week", "Date"]
    };
    static oDateTimeInfo = {
        oDefaultFormatOptions: {
            style: "medium",
            relativeScale: "auto",
            relativeStyle: "wide"
        },
        aFallbackFormatOptions: [
            { style: "short" },
            { style: "medium" },
            { pattern: "yyyy-MM-dd'T'HH:mm:ss" },
            { pattern: "yyyyMMdd HHmmss" }
        ],
        getPattern: function (oLocaleData, sStyle, sCalendarType) {
            var iSlashIndex = sStyle.indexOf("/");
            if (iSlashIndex > 0) {
                return oLocaleData.getCombinedDateTimePattern(sStyle.substr(0, iSlashIndex), sStyle.substr(iSlashIndex + 1), sCalendarType);
            }
            else {
                return oLocaleData.getCombinedDateTimePattern(sStyle, sStyle, sCalendarType);
            }
        },
        oRequiredParts: {
            "text": true,
            "year": true,
            "weekYear": true,
            "month": true,
            "day": true,
            "hour0_23": true,
            "hour1_24": true,
            "hour0_11": true,
            "hour1_12": true
        },
        aRelativeScales: ["year", "month", "week", "day", "hour", "minute", "second"],
        aRelativeParseScales: ["year", "quarter", "month", "week", "day", "hour", "minute", "second"],
        aIntervalCompareFields: ["Era", "FullYear", "Quarter", "Month", "Week", "Date", "DayPeriod", "Hours", "Minutes", "Seconds"]
    };
    static oTimeInfo = {
        oDefaultFormatOptions: {
            style: "medium",
            relativeScale: "auto",
            relativeStyle: "wide"
        },
        aFallbackFormatOptions: [
            { style: "short" },
            { style: "medium" },
            { pattern: "HH:mm:ss" },
            { pattern: "HHmmss" }
        ],
        getPattern: function (oLocaleData, sStyle, sCalendarType) {
            return oLocaleData.getTimePattern(sStyle, sCalendarType);
        },
        oRequiredParts: {
            "text": true,
            "hour0_23": true,
            "hour1_24": true,
            "hour0_11": true,
            "hour1_12": true
        },
        aRelativeScales: ["hour", "minute", "second"],
        aRelativeParseScales: ["year", "quarter", "month", "week", "day", "hour", "minute", "second"],
        aIntervalCompareFields: ["DayPeriod", "Hours", "Minutes", "Seconds"]
    };
    init(...args: any) {
        var sCalendarType = this.oFormatOptions.calendarType;
        this.aMonthsAbbrev = this.oLocaleData.getMonths("abbreviated", sCalendarType);
        this.aMonthsWide = this.oLocaleData.getMonths("wide", sCalendarType);
        this.aMonthsNarrow = this.oLocaleData.getMonths("narrow", sCalendarType);
        this.aMonthsAbbrevSt = this.oLocaleData.getMonthsStandAlone("abbreviated", sCalendarType);
        this.aMonthsWideSt = this.oLocaleData.getMonthsStandAlone("wide", sCalendarType);
        this.aMonthsNarrowSt = this.oLocaleData.getMonthsStandAlone("narrow", sCalendarType);
        this.aDaysAbbrev = this.oLocaleData.getDays("abbreviated", sCalendarType);
        this.aDaysWide = this.oLocaleData.getDays("wide", sCalendarType);
        this.aDaysNarrow = this.oLocaleData.getDays("narrow", sCalendarType);
        this.aDaysShort = this.oLocaleData.getDays("short", sCalendarType);
        this.aDaysAbbrevSt = this.oLocaleData.getDaysStandAlone("abbreviated", sCalendarType);
        this.aDaysWideSt = this.oLocaleData.getDaysStandAlone("wide", sCalendarType);
        this.aDaysNarrowSt = this.oLocaleData.getDaysStandAlone("narrow", sCalendarType);
        this.aDaysShortSt = this.oLocaleData.getDaysStandAlone("short", sCalendarType);
        this.aQuartersAbbrev = this.oLocaleData.getQuarters("abbreviated", sCalendarType);
        this.aQuartersWide = this.oLocaleData.getQuarters("wide", sCalendarType);
        this.aQuartersNarrow = this.oLocaleData.getQuarters("narrow", sCalendarType);
        this.aQuartersAbbrevSt = this.oLocaleData.getQuartersStandAlone("abbreviated", sCalendarType);
        this.aQuartersWideSt = this.oLocaleData.getQuartersStandAlone("wide", sCalendarType);
        this.aQuartersNarrowSt = this.oLocaleData.getQuartersStandAlone("narrow", sCalendarType);
        this.aErasNarrow = this.oLocaleData.getEras("narrow", sCalendarType);
        this.aErasAbbrev = this.oLocaleData.getEras("abbreviated", sCalendarType);
        this.aErasWide = this.oLocaleData.getEras("wide", sCalendarType);
        this.aDayPeriods = this.oLocaleData.getDayPeriods("abbreviated", sCalendarType);
        this.aFormatArray = this.parseCldrDatePattern(this.oFormatOptions.pattern);
        this.sAllowedCharacters = this.getAllowedCharacters(this.aFormatArray);
    }
    private _format(oJSDate: any, bUTC: any) {
        if (this.oFormatOptions.relative) {
            var sRes = this.formatRelative(oJSDate, bUTC, this.oFormatOptions.relativeRange);
            if (sRes) {
                return sRes;
            }
        }
        var sCalendarType = this.oFormatOptions.calendarType;
        var oDate = UniversalDate.getInstance(oJSDate, sCalendarType);
        var aBuffer = [], oPart, sResult, sSymbol;
        for (var i = 0; i < this.aFormatArray.length; i++) {
            oPart = this.aFormatArray[i];
            sSymbol = oPart.symbol || "";
            aBuffer.push(this.oSymbols[sSymbol].format(oPart, oDate, bUTC, this));
        }
        sResult = aBuffer.join("");
        if (sap.ui.getCore().getConfiguration().getOriginInfo()) {
            sResult = new String(sResult);
            sResult.originInfo = {
                source: "Common Locale Data Repository",
                locale: this.oLocale.toString(),
                style: this.oFormatOptions.style,
                pattern: this.oFormatOptions.pattern
            };
        }
        return sResult;
    }
    format(vJSDate: any, bUTC: any) {
        var sCalendarType = this.oFormatOptions.calendarType, sResult;
        if (bUTC === undefined) {
            bUTC = this.oFormatOptions.UTC;
        }
        if (Array.isArray(vJSDate)) {
            if (!this.oFormatOptions.interval) {
                Log.error("Non-interval DateFormat can't format more than one date instance.");
                return "";
            }
            if (vJSDate.length !== 2) {
                Log.error("Interval DateFormat can only format with 2 date instances but " + vJSDate.length + " is given.");
                return "";
            }
            if (this.oFormatOptions.singleIntervalValue) {
                if (vJSDate[0] === null) {
                    Log.error("First date instance which is passed to the interval DateFormat shouldn't be null.");
                    return "";
                }
                if (vJSDate[1] === null) {
                    sResult = this._format(vJSDate[0], bUTC);
                }
            }
            if (sResult === undefined) {
                var bValid = vJSDate.every(function (oJSDate) {
                    return oJSDate && !isNaN(oJSDate.getTime());
                });
                if (!bValid) {
                    Log.error("At least one date instance which is passed to the interval DateFormat isn't valid.");
                    return "";
                }
                sResult = this._formatInterval(vJSDate, bUTC);
            }
        }
        else {
            if (!vJSDate || isNaN(vJSDate.getTime())) {
                Log.error("The given date instance isn't valid.");
                return "";
            }
            if (this.oFormatOptions.interval) {
                Log.error("Interval DateFormat expects an array with two dates for the first argument but only one date is given.");
                return "";
            }
            sResult = this._format(vJSDate, bUTC);
        }
        if (sCalendarType == CalendarType.Japanese && this.oLocale.getLanguage() === "ja") {
            sResult = sResult.replace(/(^|[^\d])1年/g, "$1\u5143\u5E74");
        }
        return sResult;
    }
    private _formatInterval(aJSDates: any, bUTC: any) {
        var sCalendarType = this.oFormatOptions.calendarType;
        var oFromDate = UniversalDate.getInstance(aJSDates[0], sCalendarType);
        var oToDate = UniversalDate.getInstance(aJSDates[1], sCalendarType);
        var oDate;
        var oPart;
        var sSymbol;
        var aBuffer = [];
        var sPattern;
        var aFormatArray = [];
        var oDiffField = this._getGreatestDiffField([oFromDate, oToDate], bUTC);
        if (!oDiffField) {
            return this._format(aJSDates[0], bUTC);
        }
        if (this.oFormatOptions.format) {
            sPattern = this.oLocaleData.getCustomIntervalPattern(this.oFormatOptions.format, oDiffField, sCalendarType);
        }
        else {
            sPattern = this.oLocaleData.getCombinedIntervalPattern(this.oFormatOptions.pattern, sCalendarType);
        }
        aFormatArray = this.parseCldrDatePattern(sPattern);
        oDate = oFromDate;
        for (var i = 0; i < aFormatArray.length; i++) {
            oPart = aFormatArray[i];
            sSymbol = oPart.symbol || "";
            if (oPart.repeat) {
                oDate = oToDate;
            }
            aBuffer.push(this.oSymbols[sSymbol].format(oPart, oDate, bUTC, this));
        }
        return aBuffer.join("");
    }
    private _getGreatestDiffField(aDates: any, bUTC: any) {
        var bDiffFound = false, mDiff = {};
        this.aIntervalCompareFields.forEach(function (sField) {
            var sGetterPrefix = "get" + (bUTC ? "UTC" : ""), sMethodName = sGetterPrefix + sField, sFieldGroup = mFieldToGroup[sField], vFromValue = aDates[0][sMethodName].apply(aDates[0]), vToValue = aDates[1][sMethodName].apply(aDates[1]);
            if (!deepEqual(vFromValue, vToValue)) {
                bDiffFound = true;
                mDiff[sFieldGroup] = true;
            }
        });
        if (bDiffFound) {
            return mDiff;
        }
        return null;
    }
    private _parse(sValue: any, aFormatArray: any, bUTC: any, bStrict: any) {
        var iIndex = 0, oPart, sSubValue, oResult;
        var oDateValue = {
            valid: true
        };
        var oParseConf = {
            formatArray: aFormatArray,
            dateValue: oDateValue,
            strict: bStrict
        };
        for (var i = 0; i < aFormatArray.length; i++) {
            sSubValue = sValue.substr(iIndex);
            oPart = aFormatArray[i];
            oParseConf.index = i;
            oResult = this.oSymbols[oPart.symbol || ""].parse(sSubValue, oPart, this, oParseConf) || {};
            oDateValue = extend(oDateValue, oResult);
            if (oResult.valid === false) {
                break;
            }
            iIndex += oResult.length || 0;
        }
        oDateValue.index = iIndex;
        if (oDateValue.pm) {
            oDateValue.hour += 12;
        }
        if (oDateValue.dayNumberOfWeek === undefined && oDateValue.dayOfWeek !== undefined) {
            oDateValue.dayNumberOfWeek = this._adaptDayOfWeek(oDateValue.dayOfWeek);
        }
        if (oDateValue.quarter !== undefined && oDateValue.month === undefined && oDateValue.day === undefined) {
            oDateValue.month = 3 * oDateValue.quarter;
            oDateValue.day = 1;
        }
        return oDateValue;
    }
    private _parseInterval(sValue: any, sCalendarType: any, bUTC: any, bStrict: any) {
        var aDateValues, iRepeat, oDateValue;
        this.intervalPatterns.some(function (sPattern) {
            var aFormatArray = this.parseCldrDatePattern(sPattern);
            iRepeat = undefined;
            for (var i = 0; i < aFormatArray.length; i++) {
                if (aFormatArray[i].repeat) {
                    iRepeat = i;
                    break;
                }
            }
            if (iRepeat === undefined) {
                oDateValue = this._parse(sValue, aFormatArray, bUTC, bStrict);
                if (oDateValue.index === 0 || oDateValue.index < sValue.length) {
                    oDateValue.valid = false;
                }
                if (oDateValue.valid === false) {
                    return;
                }
                aDateValues = [oDateValue, oDateValue];
                return true;
            }
            else {
                aDateValues = [];
                oDateValue = this._parse(sValue, aFormatArray.slice(0, iRepeat), bUTC, bStrict);
                if (oDateValue.valid === false) {
                    return;
                }
                aDateValues.push(oDateValue);
                var iLength = oDateValue.index;
                oDateValue = this._parse(sValue.substring(iLength), aFormatArray.slice(iRepeat), bUTC, bStrict);
                if (oDateValue.index === 0 || oDateValue.index + iLength < sValue.length) {
                    oDateValue.valid = false;
                }
                if (oDateValue.valid === false) {
                    return;
                }
                aDateValues.push(oDateValue);
                return true;
            }
        }.bind(this));
        return aDateValues;
    }
    parse(sValue: any, bUTC: any, bStrict: any) {
        sValue = sValue == null ? "" : String(sValue).trim();
        var oDateValue;
        var sCalendarType = this.oFormatOptions.calendarType;
        if (bUTC === undefined) {
            bUTC = this.oFormatOptions.UTC;
        }
        if (bStrict === undefined) {
            bStrict = this.oFormatOptions.strictParsing;
        }
        if (sCalendarType == CalendarType.Japanese && this.oLocale.getLanguage() === "ja") {
            sValue = sValue.replace(/元年/g, "1\u5E74");
        }
        if (!this.oFormatOptions.interval) {
            var oJSDate = this.parseRelative(sValue, bUTC);
            if (oJSDate) {
                return oJSDate;
            }
            oDateValue = this._parse(sValue, this.aFormatArray, bUTC, bStrict);
            if (oDateValue.index === 0 || oDateValue.index < sValue.length) {
                oDateValue.valid = false;
            }
            oJSDate = fnCreateDate(oDateValue, sCalendarType, bUTC, bStrict);
            if (oJSDate) {
                return oJSDate;
            }
        }
        else {
            var aDateValues = this._parseInterval(sValue, sCalendarType, bUTC, bStrict);
            var oJSDate1, oJSDate2;
            if (aDateValues && aDateValues.length == 2) {
                var oDateValue1 = mergeWithoutOverwrite(aDateValues[0], aDateValues[1]);
                var oDateValue2 = mergeWithoutOverwrite(aDateValues[1], aDateValues[0]);
                oJSDate1 = fnCreateDate(oDateValue1, sCalendarType, bUTC, bStrict);
                oJSDate2 = fnCreateDate(oDateValue2, sCalendarType, bUTC, bStrict);
                if (oJSDate1 && oJSDate2) {
                    if (this.oFormatOptions.singleIntervalValue && oJSDate1.getTime() === oJSDate2.getTime()) {
                        return [oJSDate1, null];
                    }
                    var bValid = isValidDateRange(oJSDate1, oJSDate2);
                    if (bStrict && !bValid) {
                        Log.error("StrictParsing: Invalid date range. The given end date is before the start date.");
                        return [null, null];
                    }
                    return [oJSDate1, oJSDate2];
                }
            }
        }
        if (!this.bIsFallback) {
            var vDate;
            this.aFallbackFormats.every(function (oFallbackFormat) {
                vDate = oFallbackFormat.parse(sValue, bUTC, bStrict);
                if (Array.isArray(vDate)) {
                    return !(vDate[0] && vDate[1]);
                }
                else {
                    return !vDate;
                }
            });
            return vDate;
        }
        if (!this.oFormatOptions.interval) {
            return null;
        }
        else {
            return [null, null];
        }
    }
    parseCldrDatePattern(sPattern: any) {
        if (mCldrDatePattern[sPattern]) {
            return mCldrDatePattern[sPattern];
        }
        var aFormatArray = [], i, bQuoted = false, oCurrentObject = null, sState = "", sNewState = "", mAppeared = {}, bIntervalStartFound = false;
        for (i = 0; i < sPattern.length; i++) {
            var sCurChar = sPattern.charAt(i), sNextChar, sPrevChar, sPrevPrevChar;
            if (bQuoted) {
                if (sCurChar == "'") {
                    sPrevChar = sPattern.charAt(i - 1);
                    sPrevPrevChar = sPattern.charAt(i - 2);
                    sNextChar = sPattern.charAt(i + 1);
                    if (sPrevChar == "'" && sPrevPrevChar != "'") {
                        bQuoted = false;
                    }
                    else if (sNextChar == "'") {
                        i += 1;
                    }
                    else {
                        bQuoted = false;
                        continue;
                    }
                }
                if (sState == "text") {
                    oCurrentObject.value += sCurChar;
                }
                else {
                    oCurrentObject = {
                        type: "text",
                        value: sCurChar
                    };
                    aFormatArray.push(oCurrentObject);
                    sState = "text";
                }
            }
            else {
                if (sCurChar == "'") {
                    bQuoted = true;
                }
                else if (this.oSymbols[sCurChar]) {
                    sNewState = this.oSymbols[sCurChar].name;
                    if (sState == sNewState) {
                        oCurrentObject.digits++;
                    }
                    else {
                        oCurrentObject = {
                            type: sNewState,
                            symbol: sCurChar,
                            digits: 1
                        };
                        aFormatArray.push(oCurrentObject);
                        sState = sNewState;
                        if (!bIntervalStartFound) {
                            if (mAppeared[sNewState]) {
                                oCurrentObject.repeat = true;
                                bIntervalStartFound = true;
                            }
                            else {
                                mAppeared[sNewState] = true;
                            }
                        }
                    }
                }
                else {
                    if (sState == "text") {
                        oCurrentObject.value += sCurChar;
                    }
                    else {
                        oCurrentObject = {
                            type: "text",
                            value: sCurChar
                        };
                        aFormatArray.push(oCurrentObject);
                        sState = "text";
                    }
                }
            }
        }
        mCldrDatePattern[sPattern] = aFormatArray;
        return aFormatArray;
    }
    parseRelative(sValue: any, bUTC: any) {
        var aPatterns, oEntry, rPattern, oResult, iValue;
        if (!sValue) {
            return null;
        }
        aPatterns = this.oLocaleData.getRelativePatterns(this.aRelativeParseScales, this.oFormatOptions.relativeStyle);
        for (var i = 0; i < aPatterns.length; i++) {
            oEntry = aPatterns[i];
            rPattern = new RegExp("^\\s*" + oEntry.pattern.replace(/\{0\}/, "(\\d+)") + "\\s*$", "i");
            oResult = rPattern.exec(sValue);
            if (oResult) {
                if (oEntry.value !== undefined) {
                    return computeRelativeDate(oEntry.value, oEntry.scale);
                }
                else {
                    iValue = parseInt(oResult[1]);
                    return computeRelativeDate(iValue * oEntry.sign, oEntry.scale);
                }
            }
        }
        function computeRelativeDate(iDiff, sScale) {
            var iToday, oToday = new Date(), oJSDate;
            if (bUTC) {
                iToday = oToday.getTime();
            }
            else {
                iToday = Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate(), oToday.getHours(), oToday.getMinutes(), oToday.getSeconds(), oToday.getMilliseconds());
            }
            oJSDate = new Date(iToday);
            switch (sScale) {
                case "second":
                    oJSDate.setUTCSeconds(oJSDate.getUTCSeconds() + iDiff);
                    break;
                case "minute":
                    oJSDate.setUTCMinutes(oJSDate.getUTCMinutes() + iDiff);
                    break;
                case "hour":
                    oJSDate.setUTCHours(oJSDate.getUTCHours() + iDiff);
                    break;
                case "day":
                    oJSDate.setUTCDate(oJSDate.getUTCDate() + iDiff);
                    break;
                case "week":
                    oJSDate.setUTCDate(oJSDate.getUTCDate() + iDiff * 7);
                    break;
                case "month":
                    oJSDate.setUTCMonth(oJSDate.getUTCMonth() + iDiff);
                    break;
                case "quarter":
                    oJSDate.setUTCMonth(oJSDate.getUTCMonth() + iDiff * 3);
                    break;
                case "year":
                    oJSDate.setUTCFullYear(oJSDate.getUTCFullYear() + iDiff);
                    break;
            }
            if (bUTC) {
                return oJSDate;
            }
            else {
                return new Date(oJSDate.getUTCFullYear(), oJSDate.getUTCMonth(), oJSDate.getUTCDate(), oJSDate.getUTCHours(), oJSDate.getUTCMinutes(), oJSDate.getUTCSeconds(), oJSDate.getUTCMilliseconds());
            }
        }
    }
    formatRelative(oJSDate: any, bUTC: any, aRange: any) {
        var oToday = new Date(), oDateUTC, sScale = this.oFormatOptions.relativeScale || "day", iDiff, sPattern, iDiffSeconds;
        iDiffSeconds = (oJSDate.getTime() - oToday.getTime()) / 1000;
        if (this.oFormatOptions.relativeScale == "auto") {
            sScale = this._getScale(iDiffSeconds, this.aRelativeScales);
        }
        if (!aRange) {
            aRange = this._mRanges[sScale];
        }
        if (sScale == "year" || sScale == "month" || sScale == "day") {
            oToday = new Date(Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate()));
            oDateUTC = new Date(0);
            if (bUTC) {
                oDateUTC.setUTCFullYear(oJSDate.getUTCFullYear(), oJSDate.getUTCMonth(), oJSDate.getUTCDate());
            }
            else {
                oDateUTC.setUTCFullYear(oJSDate.getFullYear(), oJSDate.getMonth(), oJSDate.getDate());
            }
            oJSDate = oDateUTC;
        }
        iDiff = this._getDifference(sScale, [oToday, oJSDate]);
        if (this.oFormatOptions.relativeScale != "auto" && (iDiff < aRange[0] || iDiff > aRange[1])) {
            return null;
        }
        sPattern = this.oLocaleData.getRelativePattern(sScale, iDiff, iDiffSeconds > 0, this.oFormatOptions.relativeStyle);
        return formatMessage(sPattern, [Math.abs(iDiff)]);
    }
    private _getScale(iDiffSeconds: any, aScales: any) {
        var sScale, sTestScale;
        iDiffSeconds = Math.abs(iDiffSeconds);
        for (var i = 0; i < aScales.length; i++) {
            sTestScale = aScales[i];
            if (iDiffSeconds >= this._mScales[sTestScale]) {
                sScale = sTestScale;
                break;
            }
        }
        if (!sScale) {
            sScale = aScales[aScales.length - 1];
        }
        return sScale;
    }
    private _adaptDayOfWeek(iDayOfWeek: any) {
        var iFirstDayOfWeek = LocaleData.getInstance(sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()).getFirstDayOfWeek();
        var iDayNumberOfWeek = iDayOfWeek - (iFirstDayOfWeek - 1);
        if (iDayNumberOfWeek <= 0) {
            iDayNumberOfWeek += 7;
        }
        return iDayNumberOfWeek;
    }
    private _getDifference(sScale: any, aDates: any) {
        var oFromDate = aDates[0];
        var oToDate = aDates[1];
        return Math.round(mRelativeDiffs[sScale](oFromDate, oToDate, this));
    }
    getAllowedCharacters(aFormatArray: any) {
        if (this.oFormatOptions.relative) {
            return "";
        }
        var sAllowedCharacters = "";
        var bNumbers = false;
        var bAll = false;
        var oPart;
        for (var i = 0; i < aFormatArray.length; i++) {
            oPart = aFormatArray[i];
            switch (oPart.type) {
                case "text":
                    if (sAllowedCharacters.indexOf(oPart.value) < 0) {
                        sAllowedCharacters += oPart.value;
                    }
                    break;
                case "day":
                case "year":
                case "weekYear":
                case "dayNumberOfWeek":
                case "weekInYear":
                case "hour0_23":
                case "hour1_24":
                case "hour0_11":
                case "hour1_12":
                case "minute":
                case "second":
                case "fractionalsecond":
                    if (!bNumbers) {
                        sAllowedCharacters += "0123456789";
                        bNumbers = true;
                    }
                    break;
                case "month":
                case "monthStandalone":
                    if (oPart.digits < 3) {
                        if (!bNumbers) {
                            sAllowedCharacters += "0123456789";
                            bNumbers = true;
                        }
                    }
                    else {
                        bAll = true;
                    }
                    break;
                default:
                    bAll = true;
                    break;
            }
        }
        if (bAll) {
            sAllowedCharacters = "";
        }
        return sAllowedCharacters;
    }
    static getInstance(oFormatOptions: any, oLocale: any) {
        return this.getDateInstance(oFormatOptions, oLocale);
    }
    static getDateInstance(oFormatOptions: any, oLocale: any) {
        return this.createInstance(oFormatOptions, oLocale, this.oDateInfo);
    }
    static getDateTimeInstance(oFormatOptions: any, oLocale: any) {
        return this.createInstance(oFormatOptions, oLocale, this.oDateTimeInfo);
    }
    static getTimeInstance(oFormatOptions: any, oLocale: any) {
        return this.createInstance(oFormatOptions, oLocale, this.oTimeInfo);
    }
    static createInstance(oFormatOptions: any, oLocale: any, oInfo: any) {
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
        oFormat.oFormatOptions = extend({}, oInfo.oDefaultFormatOptions, oFormatOptions);
        if (!oFormat.oFormatOptions.calendarType) {
            oFormat.oFormatOptions.calendarType = sap.ui.getCore().getConfiguration().getCalendarType();
        }
        if (!oFormat.oFormatOptions.pattern) {
            if (oFormat.oFormatOptions.format) {
                oFormat.oFormatOptions.pattern = oFormat.oLocaleData.getCustomDateTimePattern(oFormat.oFormatOptions.format, oFormat.oFormatOptions.calendarType);
            }
            else {
                oFormat.oFormatOptions.pattern = oInfo.getPattern(oFormat.oLocaleData, oFormat.oFormatOptions.style, oFormat.oFormatOptions.calendarType);
            }
        }
        if (oFormat.oFormatOptions.interval) {
            if (oFormat.oFormatOptions.format) {
                oFormat.intervalPatterns = oFormat.oLocaleData.getCustomIntervalPattern(oFormat.oFormatOptions.format, null, oFormat.oFormatOptions.calendarType);
                if (typeof oFormat.intervalPatterns === "string") {
                    oFormat.intervalPatterns = [oFormat.intervalPatterns];
                }
                oFormat.intervalPatterns.push(oFormat.oLocaleData.getCustomDateTimePattern(oFormat.oFormatOptions.format, oFormat.oFormatOptions.calendarType));
            }
            else {
                oFormat.intervalPatterns = [
                    oFormat.oLocaleData.getCombinedIntervalPattern(oFormat.oFormatOptions.pattern, oFormat.oFormatOptions.calendarType),
                    oFormat.oFormatOptions.pattern
                ];
            }
            var sCommonConnectorPattern = createIntervalPatternWithNormalConnector(oFormat);
            oFormat.intervalPatterns.push(sCommonConnectorPattern);
        }
        if (!oFormat.oFormatOptions.fallback) {
            if (!oInfo.oFallbackFormats) {
                oInfo.oFallbackFormats = {};
            }
            var sLocale = oLocale.toString(), sCalendarType = oFormat.oFormatOptions.calendarType, sKey = sLocale + "-" + sCalendarType, sPattern, aFallbackFormatOptions;
            if (oFormat.oFormatOptions.pattern && oInfo.bPatternFallbackWithoutDelimiter) {
                sKey = sKey + "-" + oFormat.oFormatOptions.pattern;
            }
            if (oFormat.oFormatOptions.interval) {
                sKey = sKey + "-" + "interval";
            }
            var oFallbackFormats = oInfo.oFallbackFormats[sKey] ? Object.assign({}, oInfo.oFallbackFormats[sKey]) : undefined;
            if (!oFallbackFormats) {
                aFallbackFormatOptions = oInfo.aFallbackFormatOptions;
                if (oInfo.bShortFallbackFormatOptions) {
                    sPattern = oInfo.getPattern(oFormat.oLocaleData, "short");
                    aFallbackFormatOptions = aFallbackFormatOptions.concat(DateFormat._createFallbackOptionsWithoutDelimiter(sPattern));
                }
                if (oFormat.oFormatOptions.pattern && oInfo.bPatternFallbackWithoutDelimiter) {
                    aFallbackFormatOptions = DateFormat._createFallbackOptionsWithoutDelimiter(oFormat.oFormatOptions.pattern).concat(aFallbackFormatOptions);
                }
                oFallbackFormats = DateFormat._createFallbackFormat(aFallbackFormatOptions, sCalendarType, oLocale, oInfo, oFormat.oFormatOptions.interval);
            }
            oFormat.aFallbackFormats = oFallbackFormats;
        }
        oFormat.oRequiredParts = oInfo.oRequiredParts;
        oFormat.aRelativeScales = oInfo.aRelativeScales;
        oFormat.aRelativeParseScales = oInfo.aRelativeParseScales;
        oFormat.aIntervalCompareFields = oInfo.aIntervalCompareFields;
        oFormat.init();
        return oFormat;
    }
    private static _createFallbackFormat(aFallbackFormatOptions: any, sCalendarType: any, oLocale: any, oInfo: any, bInterval: any) {
        return aFallbackFormatOptions.map(function (oOptions) {
            var oFormatOptions = Object.assign({}, oOptions);
            if (bInterval) {
                oFormatOptions.interval = true;
            }
            oFormatOptions.calendarType = sCalendarType;
            oFormatOptions.fallback = true;
            var oFallbackFormat = DateFormat.createInstance(oFormatOptions, oLocale, oInfo);
            oFallbackFormat.bIsFallback = true;
            return oFallbackFormat;
        });
    }
    private static _createFallbackOptionsWithoutDelimiter(sBasePattern: any) {
        var rNonDateFields = /[^dMyGU]/g, oDayReplace = {
            regex: /d+/g,
            replace: "dd"
        }, oMonthReplace = {
            regex: /M+/g,
            replace: "MM"
        }, oYearReplace = {
            regex: /[yU]+/g,
            replace: ["yyyy", "yy"]
        };
        sBasePattern = sBasePattern.replace(rNonDateFields, "");
        sBasePattern = sBasePattern.replace(oDayReplace.regex, oDayReplace.replace);
        sBasePattern = sBasePattern.replace(oMonthReplace.regex, oMonthReplace.replace);
        return oYearReplace.replace.map(function (sReplace) {
            return {
                pattern: sBasePattern.replace(oYearReplace.regex, sReplace),
                strictParsing: true
            };
        });
    }
    constructor(...args: any) {
        throw new Error();
    }
}
var mCldrDatePattern = {};
function createIntervalPatternWithNormalConnector(oFormat) {
    var sPattern = oFormat.oLocaleData.getIntervalPattern("", oFormat.oFormatOptions.calendarType);
    sPattern = sPattern.replace(/[^\{\}01 ]/, "-");
    return sPattern.replace(/\{(0|1)\}/g, oFormat.oFormatOptions.pattern);
}
var oParseHelper = {
    isNumber: function (iCharCode) {
        return iCharCode >= 48 && iCharCode <= 57;
    },
    findNumbers: function (sValue, iMaxLength) {
        var iLength = 0;
        while (iLength < iMaxLength && this.isNumber(sValue.charCodeAt(iLength))) {
            iLength++;
        }
        if (typeof sValue !== "string") {
            sValue = sValue.toString();
        }
        return sValue.substr(0, iLength);
    },
    findEntry: function (sValue, aList) {
        var iFoundIndex = -1, iMatchedLength = 0;
        for (var j = 0; j < aList.length; j++) {
            if (aList[j] && aList[j].length > iMatchedLength && sValue.indexOf(aList[j]) === 0) {
                iFoundIndex = j;
                iMatchedLength = aList[j].length;
            }
        }
        return {
            index: iFoundIndex,
            value: iFoundIndex === -1 ? null : aList[iFoundIndex]
        };
    },
    parseTZ: function (sValue, bColonSeparated) {
        var iLength = 0;
        var iTZFactor = sValue.charAt(0) == "+" ? -1 : 1;
        var sPart;
        iLength++;
        sPart = this.findNumbers(sValue.substr(iLength), 2);
        var iTZDiffHour = parseInt(sPart);
        iLength += 2;
        if (bColonSeparated) {
            iLength++;
        }
        sPart = this.findNumbers(sValue.substr(iLength), 2);
        var iTZDiff = 0;
        if (sPart) {
            iLength += 2;
            iTZDiff = parseInt(sPart);
        }
        return {
            length: iLength,
            tzDiff: (iTZDiff + 60 * iTZDiffHour) * iTZFactor
        };
    },
    checkValid: function (sType, bPartInvalid, oFormat) {
        if (sType in oFormat.oRequiredParts && bPartInvalid) {
            return false;
        }
    }
};
DateFormat.prototype.oSymbols = {
    "": {
        name: "text",
        format: function (oField, oDate, bUTC, oFormat) {
            return oField.value;
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var sChar;
            var bValid = true;
            var iValueIndex = 0;
            var iPatternIndex = 0;
            var sDelimiter = "-~\u2010\u2011\u2012\u2013\u2014\uFE58\uFE63\uFF0D\uFF5E";
            for (; iPatternIndex < oPart.value.length; iPatternIndex++) {
                sChar = oPart.value.charAt(iPatternIndex);
                if (sChar === " ") {
                    while (sValue.charAt(iValueIndex) === " ") {
                        iValueIndex++;
                    }
                }
                else if (sDelimiter.includes(sChar)) {
                    if (!sDelimiter.includes(sValue.charAt(iValueIndex))) {
                        bValid = false;
                    }
                    iValueIndex++;
                }
                else {
                    if (sValue.charAt(iValueIndex) !== sChar) {
                        bValid = false;
                    }
                    iValueIndex++;
                }
                if (!bValid) {
                    break;
                }
            }
            if (bValid) {
                return {
                    length: iValueIndex
                };
            }
            else {
                var bPartInvalid = false;
                if (oConfig.index < oConfig.formatArray.length - 1) {
                    bPartInvalid = (oConfig.formatArray[oConfig.index + 1].type in oFormat.oRequiredParts);
                }
                return {
                    valid: oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat)
                };
            }
        }
    },
    "G": {
        name: "era",
        format: function (oField, oDate, bUTC, oFormat) {
            var iEra = bUTC ? oDate.getUTCEra() : oDate.getEra();
            if (oField.digits <= 3) {
                return oFormat.aErasAbbrev[iEra];
            }
            else if (oField.digits === 4) {
                return oFormat.aErasWide[iEra];
            }
            else {
                return oFormat.aErasNarrow[iEra];
            }
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var aErasVariants = [oFormat.aErasWide, oFormat.aErasAbbrev, oFormat.aErasNarrow];
            for (var i = 0; i < aErasVariants.length; i++) {
                var aVariants = aErasVariants[i];
                var oFound = oParseHelper.findEntry(sValue, aVariants);
                if (oFound.index !== -1) {
                    return {
                        era: oFound.index,
                        length: oFound.value.length
                    };
                }
            }
            return {
                era: oFormat.aErasWide.length - 1,
                valid: oParseHelper.checkValid(oPart.type, true, oFormat)
            };
        }
    },
    "y": {
        name: "year",
        format: function (oField, oDate, bUTC, oFormat) {
            var iYear = bUTC ? oDate.getUTCFullYear() : oDate.getFullYear();
            var sYear = String(iYear);
            var sCalendarType = oFormat.oFormatOptions.calendarType;
            if (oField.digits == 2 && sYear.length > 2) {
                sYear = sYear.substr(sYear.length - 2);
            }
            if (sCalendarType != CalendarType.Japanese && oField.digits == 1 && iYear < 100) {
                sYear = sYear.padStart(4, "0");
            }
            return sYear.padStart(oField.digits, "0");
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var sCalendarType = oFormat.oFormatOptions.calendarType;
            var sPart;
            if (oPart.digits == 1) {
                sPart = oParseHelper.findNumbers(sValue, 4);
            }
            else if (oPart.digits == 2) {
                sPart = oParseHelper.findNumbers(sValue, 2);
            }
            else {
                sPart = oParseHelper.findNumbers(sValue, oPart.digits);
            }
            var iYear = parseInt(sPart);
            if (sCalendarType != CalendarType.Japanese && sPart.length <= 2) {
                var oCurrentDate = UniversalDate.getInstance(new Date(), sCalendarType), iCurrentYear = oCurrentDate.getFullYear(), iCurrentCentury = Math.floor(iCurrentYear / 100), iYearDiff = iCurrentCentury * 100 + iYear - iCurrentYear;
                if (iYearDiff < -70) {
                    iYear += (iCurrentCentury + 1) * 100;
                }
                else if (iYearDiff < 30) {
                    iYear += iCurrentCentury * 100;
                }
                else {
                    iYear += (iCurrentCentury - 1) * 100;
                }
            }
            return {
                length: sPart.length,
                valid: oParseHelper.checkValid(oPart.type, sPart === "", oFormat),
                year: iYear
            };
        }
    },
    "Y": {
        name: "weekYear",
        format: function (oField, oDate, bUTC, oFormat) {
            var oWeek = bUTC ? oDate.getUTCWeek() : oDate.getWeek();
            var iWeekYear = oWeek.year;
            var sWeekYear = String(iWeekYear);
            var sCalendarType = oFormat.oFormatOptions.calendarType;
            if (oField.digits == 2 && sWeekYear.length > 2) {
                sWeekYear = sWeekYear.substr(sWeekYear.length - 2);
            }
            if (sCalendarType != CalendarType.Japanese && oField.digits == 1 && iWeekYear < 100) {
                sWeekYear = sWeekYear.padStart(4, "0");
            }
            return sWeekYear.padStart(oField.digits, "0");
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var sCalendarType = oFormat.oFormatOptions.calendarType;
            var sPart;
            if (oPart.digits == 1) {
                sPart = oParseHelper.findNumbers(sValue, 4);
            }
            else if (oPart.digits == 2) {
                sPart = oParseHelper.findNumbers(sValue, 2);
            }
            else {
                sPart = oParseHelper.findNumbers(sValue, oPart.digits);
            }
            var iYear = parseInt(sPart);
            var iWeekYear;
            if (sCalendarType != CalendarType.Japanese && sPart.length <= 2) {
                var oCurrentDate = UniversalDate.getInstance(new Date(), sCalendarType), iCurrentYear = oCurrentDate.getFullYear(), iCurrentCentury = Math.floor(iCurrentYear / 100), iYearDiff = iCurrentCentury * 100 + iWeekYear - iCurrentYear;
                if (iYearDiff < -70) {
                    iWeekYear += (iCurrentCentury + 1) * 100;
                }
                else if (iYearDiff < 30) {
                    iWeekYear += iCurrentCentury * 100;
                }
                else {
                    iWeekYear += (iCurrentCentury - 1) * 100;
                }
            }
            return {
                length: sPart.length,
                valid: oParseHelper.checkValid(oPart.type, sPart === "", oFormat),
                year: iYear,
                weekYear: iWeekYear
            };
        }
    },
    "M": {
        name: "month",
        format: function (oField, oDate, bUTC, oFormat) {
            var iMonth = bUTC ? oDate.getUTCMonth() : oDate.getMonth();
            if (oField.digits == 3) {
                return oFormat.aMonthsAbbrev[iMonth];
            }
            else if (oField.digits == 4) {
                return oFormat.aMonthsWide[iMonth];
            }
            else if (oField.digits > 4) {
                return oFormat.aMonthsNarrow[iMonth];
            }
            else {
                return String(iMonth + 1).padStart(oField.digits, "0");
            }
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var aMonthsVariants = [oFormat.aMonthsWide, oFormat.aMonthsWideSt, oFormat.aMonthsAbbrev, oFormat.aMonthsAbbrevSt, oFormat.aMonthsNarrow, oFormat.aMonthsNarrowSt];
            var bValid;
            var iMonth;
            var sPart;
            if (oPart.digits < 3) {
                sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
                bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
                iMonth = parseInt(sPart) - 1;
                if (oConfig.strict && (iMonth > 11 || iMonth < 0)) {
                    bValid = false;
                }
            }
            else {
                for (var i = 0; i < aMonthsVariants.length; i++) {
                    var aVariants = aMonthsVariants[i];
                    var oFound = oParseHelper.findEntry(sValue, aVariants);
                    if (oFound.index !== -1) {
                        return {
                            month: oFound.index,
                            length: oFound.value.length
                        };
                    }
                }
                bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
            }
            return {
                month: iMonth,
                length: sPart ? sPart.length : 0,
                valid: bValid
            };
        }
    },
    "L": {
        name: "monthStandalone",
        format: function (oField, oDate, bUTC, oFormat) {
            var iMonth = bUTC ? oDate.getUTCMonth() : oDate.getMonth();
            if (oField.digits == 3) {
                return oFormat.aMonthsAbbrevSt[iMonth];
            }
            else if (oField.digits == 4) {
                return oFormat.aMonthsWideSt[iMonth];
            }
            else if (oField.digits > 4) {
                return oFormat.aMonthsNarrowSt[iMonth];
            }
            else {
                return String(iMonth + 1).padStart(oField.digits, "0");
            }
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var aMonthsVariants = [oFormat.aMonthsWide, oFormat.aMonthsWideSt, oFormat.aMonthsAbbrev, oFormat.aMonthsAbbrevSt, oFormat.aMonthsNarrow, oFormat.aMonthsNarrowSt];
            var bValid;
            var iMonth;
            var sPart;
            if (oPart.digits < 3) {
                sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
                bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
                iMonth = parseInt(sPart) - 1;
                if (oConfig.strict && (iMonth > 11 || iMonth < 0)) {
                    bValid = false;
                }
            }
            else {
                for (var i = 0; i < aMonthsVariants.length; i++) {
                    var aVariants = aMonthsVariants[i];
                    var oFound = oParseHelper.findEntry(sValue, aVariants);
                    if (oFound.index !== -1) {
                        return {
                            month: oFound.index,
                            length: oFound.value.length
                        };
                    }
                }
                bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
            }
            return {
                month: iMonth,
                length: sPart ? sPart.length : 0,
                valid: bValid
            };
        }
    },
    "w": {
        name: "weekInYear",
        format: function (oField, oDate, bUTC, oFormat) {
            var oWeek = bUTC ? oDate.getUTCWeek() : oDate.getWeek();
            var iWeek = oWeek.week;
            var sWeek = String(iWeek + 1);
            if (oField.digits < 3) {
                sWeek = sWeek.padStart(oField.digits, "0");
            }
            else {
                sWeek = oFormat.oLocaleData.getCalendarWeek(oField.digits === 3 ? "narrow" : "wide", sWeek.padStart(2, "0"));
            }
            return sWeek;
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var bValid;
            var sPart;
            var iWeek;
            var iLength = 0;
            if (oPart.digits < 3) {
                sPart = oParseHelper.findNumbers(sValue, 2);
                iLength = sPart.length;
                iWeek = parseInt(sPart) - 1;
                bValid = oParseHelper.checkValid(oPart.type, !sPart, oFormat);
            }
            else {
                sPart = oFormat.oLocaleData.getCalendarWeek(oPart.digits === 3 ? "narrow" : "wide");
                sPart = sPart.replace("{0}", "[0-9]+");
                var rWeekNumber = new RegExp(sPart), oResult = rWeekNumber.exec(sValue);
                if (oResult) {
                    iLength = oResult[0].length;
                    iWeek = parseInt(oResult[0]) - 1;
                }
                else {
                    bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
                }
            }
            return {
                length: iLength,
                valid: bValid,
                week: iWeek
            };
        }
    },
    "W": {
        name: "weekInMonth",
        format: function (oField, oDate, bUTC, oFormat) {
            return "";
        },
        parse: function () {
            return {};
        }
    },
    "D": {
        name: "dayInYear",
        format: function (oField, oDate, bUTC, oFormat) {
        },
        parse: function () {
            return {};
        }
    },
    "d": {
        name: "day",
        format: function (oField, oDate, bUTC, oFormat) {
            var iDate = bUTC ? oDate.getUTCDate() : oDate.getDate();
            return String(iDate).padStart(oField.digits, "0");
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
            var bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
            var iDay = parseInt(sPart);
            if (oConfig.strict && (iDay > 31 || iDay < 1)) {
                bValid = false;
            }
            return {
                day: iDay,
                length: sPart.length,
                valid: bValid
            };
        }
    },
    "Q": {
        name: "quarter",
        format: function (oField, oDate, bUTC, oFormat) {
            var iQuarter = bUTC ? oDate.getUTCQuarter() : oDate.getQuarter();
            if (oField.digits == 3) {
                return oFormat.aQuartersAbbrev[iQuarter];
            }
            else if (oField.digits == 4) {
                return oFormat.aQuartersWide[iQuarter];
            }
            else if (oField.digits > 4) {
                return oFormat.aQuartersNarrow[iQuarter];
            }
            else {
                return String(iQuarter + 1).padStart(oField.digits, "0");
            }
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var bValid;
            var iQuarter;
            var sPart;
            var aQuartersVariants = [oFormat.aQuartersWide, oFormat.aQuartersWideSt, oFormat.aQuartersAbbrev, oFormat.aQuartersAbbrevSt, oFormat.aQuartersNarrow, oFormat.aQuartersNarrowSt];
            if (oPart.digits < 3) {
                sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
                bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
                iQuarter = parseInt(sPart) - 1;
                if (oConfig.strict && iQuarter > 3) {
                    bValid = false;
                }
            }
            else {
                for (var i = 0; i < aQuartersVariants.length; i++) {
                    var aVariants = aQuartersVariants[i];
                    var oFound = oParseHelper.findEntry(sValue, aVariants);
                    if (oFound.index !== -1) {
                        return {
                            quarter: oFound.index,
                            length: oFound.value.length
                        };
                    }
                }
                bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
            }
            return {
                length: sPart ? sPart.length : 0,
                quarter: iQuarter,
                valid: bValid
            };
        }
    },
    "q": {
        name: "quarterStandalone",
        format: function (oField, oDate, bUTC, oFormat) {
            var iQuarter = bUTC ? oDate.getUTCQuarter() : oDate.getQuarter();
            if (oField.digits == 3) {
                return oFormat.aQuartersAbbrevSt[iQuarter];
            }
            else if (oField.digits == 4) {
                return oFormat.aQuartersWideSt[iQuarter];
            }
            else if (oField.digits > 4) {
                return oFormat.aQuartersNarrowSt[iQuarter];
            }
            else {
                return String(iQuarter + 1).padStart(oField.digits, "0");
            }
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var bValid;
            var iQuarter;
            var sPart;
            var aQuartersVariants = [oFormat.aQuartersWide, oFormat.aQuartersWideSt, oFormat.aQuartersAbbrev, oFormat.aQuartersAbbrevSt, oFormat.aQuartersNarrow, oFormat.aQuartersNarrowSt];
            if (oPart.digits < 3) {
                sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
                bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
                iQuarter = parseInt(sPart) - 1;
                if (oConfig.strict && iQuarter > 3) {
                    bValid = false;
                }
            }
            else {
                for (var i = 0; i < aQuartersVariants.length; i++) {
                    var aVariants = aQuartersVariants[i];
                    var oFound = oParseHelper.findEntry(sValue, aVariants);
                    if (oFound.index !== -1) {
                        return {
                            quarter: oFound.index,
                            length: oFound.value.length
                        };
                    }
                }
                bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
            }
            return {
                length: sPart ? sPart.length : 0,
                quarter: iQuarter,
                valid: bValid
            };
        }
    },
    "F": {
        name: "dayOfWeekInMonth",
        format: function (oField, oDate, bUTC, oFormat) {
            return "";
        },
        parse: function () {
            return {};
        }
    },
    "E": {
        name: "dayNameInWeek",
        format: function (oField, oDate, bUTC, oFormat) {
            var iDay = bUTC ? oDate.getUTCDay() : oDate.getDay();
            if (oField.digits < 4) {
                return oFormat.aDaysAbbrev[iDay];
            }
            else if (oField.digits == 4) {
                return oFormat.aDaysWide[iDay];
            }
            else if (oField.digits == 5) {
                return oFormat.aDaysNarrow[iDay];
            }
            else {
                return oFormat.aDaysShort[iDay];
            }
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var aDaysVariants = [oFormat.aDaysWide, oFormat.aDaysWideSt, oFormat.aDaysAbbrev, oFormat.aDaysAbbrevSt, oFormat.aDaysShort, oFormat.aDaysShortSt, oFormat.aDaysNarrow, oFormat.aDaysNarrowSt];
            for (var i = 0; i < aDaysVariants.length; i++) {
                var aVariants = aDaysVariants[i];
                var oFound = oParseHelper.findEntry(sValue, aVariants);
                if (oFound.index !== -1) {
                    return {
                        dayOfWeek: oFound.index,
                        length: oFound.value.length
                    };
                }
            }
        }
    },
    "c": {
        name: "dayNameInWeekStandalone",
        format: function (oField, oDate, bUTC, oFormat) {
            var iDay = bUTC ? oDate.getUTCDay() : oDate.getDay();
            if (oField.digits < 4) {
                return oFormat.aDaysAbbrevSt[iDay];
            }
            else if (oField.digits == 4) {
                return oFormat.aDaysWideSt[iDay];
            }
            else if (oField.digits == 5) {
                return oFormat.aDaysNarrowSt[iDay];
            }
            else {
                return oFormat.aDaysShortSt[iDay];
            }
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var aDaysVariants = [oFormat.aDaysWide, oFormat.aDaysWideSt, oFormat.aDaysAbbrev, oFormat.aDaysAbbrevSt, oFormat.aDaysShort, oFormat.aDaysShortSt, oFormat.aDaysNarrow, oFormat.aDaysNarrowSt];
            for (var i = 0; i < aDaysVariants.length; i++) {
                var aVariants = aDaysVariants[i];
                var oFound = oParseHelper.findEntry(sValue, aVariants);
                if (oFound.index !== -1) {
                    return {
                        day: oFound.index,
                        length: oFound.value.length
                    };
                }
            }
        }
    },
    "u": {
        name: "dayNumberOfWeek",
        format: function (oField, oDate, bUTC, oFormat) {
            var iDay = bUTC ? oDate.getUTCDay() : oDate.getDay();
            return oFormat._adaptDayOfWeek(iDay);
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var sPart = oParseHelper.findNumbers(sValue, oPart.digits);
            return {
                dayNumberOfWeek: parseInt(sPart),
                length: sPart.length
            };
        }
    },
    "a": {
        name: "amPmMarker",
        format: function (oField, oDate, bUTC, oFormat) {
            var iDayPeriod = bUTC ? oDate.getUTCDayPeriod() : oDate.getDayPeriod();
            return oFormat.aDayPeriods[iDayPeriod];
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var bPM;
            var iLength;
            var sAM = oFormat.aDayPeriods[0], sPM = oFormat.aDayPeriods[1];
            var rAMPM = /[aApP](?:\.)?[\x20\xA0]?[mM](?:\.)?/;
            var aMatch = sValue.match(rAMPM);
            var bVariant = (aMatch && aMatch.index === 0);
            if (bVariant) {
                sValue = aMatch[0];
                sAM = sAM.replace(/[\x20\xA0]/g, "");
                sPM = sPM.replace(/[\x20\xA0]/g, "");
                sValue = sValue.replace(/[\x20\xA0]/g, "");
                sAM = sAM.replace(/\./g, "").toLowerCase();
                sPM = sPM.replace(/\./g, "").toLowerCase();
                sValue = sValue.replace(/\./g, "").toLowerCase();
            }
            if (sValue.indexOf(sAM) === 0) {
                bPM = false;
                iLength = (bVariant ? aMatch[0].length : sAM.length);
            }
            else if (sValue.indexOf(sPM) === 0) {
                bPM = true;
                iLength = (bVariant ? aMatch[0].length : sPM.length);
            }
            return {
                pm: bPM,
                length: iLength
            };
        }
    },
    "H": {
        name: "hour0_23",
        format: function (oField, oDate, bUTC, oFormat) {
            var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
            return String(iHours).padStart(oField.digits, "0");
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var bValid;
            var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
            var iHours = parseInt(sPart);
            bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
            if (oConfig.strict && iHours > 23) {
                bValid = false;
            }
            return {
                hour: iHours,
                length: sPart.length,
                valid: bValid
            };
        }
    },
    "k": {
        name: "hour1_24",
        format: function (oField, oDate, bUTC, oFormat) {
            var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
            var sHours = (iHours === 0 ? "24" : String(iHours));
            return sHours.padStart(oField.digits, "0");
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var bValid;
            var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
            var iHours = parseInt(sPart);
            bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
            if (iHours == 24) {
                iHours = 0;
            }
            if (oConfig.strict && iHours > 23) {
                bValid = false;
            }
            return {
                hour: iHours,
                length: sPart.length,
                valid: bValid
            };
        }
    },
    "K": {
        name: "hour0_11",
        format: function (oField, oDate, bUTC, oFormat) {
            var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
            var sHours = String(iHours > 11 ? iHours - 12 : iHours);
            return sHours.padStart(oField.digits, "0");
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var bValid;
            var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
            var iHours = parseInt(sPart);
            bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
            if (oConfig.strict && iHours > 11) {
                bValid = false;
            }
            return {
                hour: iHours,
                length: sPart.length,
                valid: bValid
            };
        }
    },
    "h": {
        name: "hour1_12",
        format: function (oField, oDate, bUTC, oFormat) {
            var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
            var sHours;
            if (iHours > 12) {
                sHours = String(iHours - 12);
            }
            else if (iHours == 0) {
                sHours = "12";
            }
            else {
                sHours = String(iHours);
            }
            return sHours.padStart(oField.digits, "0");
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var bPM = oConfig.dateValue.pm;
            var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
            var iHours = parseInt(sPart);
            var bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
            if (iHours == 12) {
                iHours = 0;
                bPM = (bPM === undefined) ? true : bPM;
            }
            if (oConfig.strict && iHours > 11) {
                bValid = false;
            }
            return {
                hour: iHours,
                length: sPart.length,
                pm: bPM,
                valid: bValid
            };
        }
    },
    "m": {
        name: "minute",
        format: function (oField, oDate, bUTC, oFormat) {
            var iMinutes = bUTC ? oDate.getUTCMinutes() : oDate.getMinutes();
            return String(iMinutes).padStart(oField.digits, "0");
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var bValid;
            var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
            var iMinutes = parseInt(sPart);
            bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
            if (oConfig.strict && iMinutes > 59) {
                bValid = false;
            }
            return {
                length: sPart.length,
                minute: iMinutes,
                valid: bValid
            };
        }
    },
    "s": {
        name: "second",
        format: function (oField, oDate, bUTC, oFormat) {
            var iSeconds = bUTC ? oDate.getUTCSeconds() : oDate.getSeconds();
            return String(iSeconds).padStart(oField.digits, "0");
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var bValid;
            var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
            var iSeconds = parseInt(sPart);
            bValid = oParseHelper.checkValid(oPart.type, sPart === "", oFormat);
            if (oConfig.strict && iSeconds > 59) {
                bValid = false;
            }
            return {
                length: sPart.length,
                second: iSeconds,
                valid: bValid
            };
        }
    },
    "S": {
        name: "fractionalsecond",
        format: function (oField, oDate, bUTC, oFormat) {
            var iMilliseconds = bUTC ? oDate.getUTCMilliseconds() : oDate.getMilliseconds();
            var sMilliseconds = String(iMilliseconds);
            var sFractionalseconds = sMilliseconds.padStart(3, "0");
            sFractionalseconds = sFractionalseconds.substr(0, oField.digits);
            sFractionalseconds = sFractionalseconds.padEnd(oField.digits, "0");
            return sFractionalseconds;
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var sPart = oParseHelper.findNumbers(sValue, oPart.digits);
            var iLength = sPart.length;
            sPart = sPart.substr(0, 3);
            sPart = sPart.padEnd(3, "0");
            var iMilliseconds = parseInt(sPart);
            return {
                length: iLength,
                millisecond: iMilliseconds
            };
        }
    },
    "z": {
        name: "timezoneGeneral",
        format: function (oField, oDate, bUTC, oFormat) {
            if (oField.digits > 3 && oDate.getTimezoneLong && oDate.getTimezoneLong()) {
                return oDate.getTimezoneLong();
            }
            else if (oDate.getTimezoneShort && oDate.getTimezoneShort()) {
                return oDate.getTimezoneShort();
            }
            var sTimeZone = "GMT";
            var iTZOffset = Math.abs(oDate.getTimezoneOffset());
            var bPositiveOffset = oDate.getTimezoneOffset() > 0;
            var iHourOffset = Math.floor(iTZOffset / 60);
            var iMinuteOffset = iTZOffset % 60;
            if (!bUTC && iTZOffset != 0) {
                sTimeZone += (bPositiveOffset ? "-" : "+");
                sTimeZone += String(iHourOffset).padStart(2, "0");
                sTimeZone += ":";
                sTimeZone += String(iMinuteOffset).padStart(2, "0");
            }
            else {
                sTimeZone += "Z";
            }
            return sTimeZone;
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            var iLength = 0;
            var iTZDiff;
            var oTZ = sValue.substring(0, 3);
            if (oTZ === "GMT" || oTZ === "UTC") {
                iLength = 3;
            }
            else if (sValue.substring(0, 2) === "UT") {
                iLength = 2;
            }
            else if (sValue.charAt(0) === "Z") {
                iLength = 1;
                iTZDiff = 0;
            }
            else {
                return {
                    error: "cannot be parsed correctly by sap.ui.core.format.DateFormat: The given timezone is not supported!"
                };
            }
            if (sValue.charAt(0) !== "Z") {
                var oParsedTZ = oParseHelper.parseTZ(sValue.substr(iLength), true);
                iLength += oParsedTZ.length;
                iTZDiff = oParsedTZ.tzDiff;
            }
            return {
                length: iLength,
                tzDiff: iTZDiff
            };
        }
    },
    "Z": {
        name: "timezoneRFC822",
        format: function (oField, oDate, bUTC, oFormat) {
            var iTZOffset = Math.abs(oDate.getTimezoneOffset());
            var bPositiveOffset = oDate.getTimezoneOffset() > 0;
            var iHourOffset = Math.floor(iTZOffset / 60);
            var iMinuteOffset = iTZOffset % 60;
            var sTimeZone = "";
            if (!bUTC) {
                sTimeZone += (bPositiveOffset ? "-" : "+");
                sTimeZone += String(iHourOffset).padStart(2, "0");
                sTimeZone += String(iMinuteOffset).padStart(2, "0");
            }
            return sTimeZone;
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            return oParseHelper.parseTZ(sValue, false);
        }
    },
    "X": {
        name: "timezoneISO8601",
        format: function (oField, oDate, bUTC, oFormat) {
            var iTZOffset = Math.abs(oDate.getTimezoneOffset());
            var bPositiveOffset = oDate.getTimezoneOffset() > 0;
            var iHourOffset = Math.floor(iTZOffset / 60);
            var iMinuteOffset = iTZOffset % 60;
            var sTimeZone = "";
            if (!bUTC && iTZOffset != 0) {
                sTimeZone += (bPositiveOffset ? "-" : "+");
                sTimeZone += String(iHourOffset).padStart(2, "0");
                if (oField.digits > 1 || iMinuteOffset > 0) {
                    if (oField.digits === 3 || oField.digits === 5) {
                        sTimeZone += ":";
                    }
                    sTimeZone += String(iMinuteOffset).padStart(2, "0");
                }
            }
            else {
                sTimeZone += "Z";
            }
            return sTimeZone;
        },
        parse: function (sValue, oPart, oFormat, oConfig) {
            if (sValue.charAt(0) === "Z") {
                return {
                    length: 1,
                    tzDiff: 0
                };
            }
            else {
                return oParseHelper.parseTZ(sValue, oPart.digits === 3 || oPart.digits === 5);
            }
        }
    }
};
var mFieldToGroup = {
    Era: "Era",
    FullYear: "Year",
    Quarter: "Quarter",
    Month: "Month",
    Week: "Week",
    Date: "Day",
    DayPeriod: "DayPeriod",
    Hours: "Hour",
    Minutes: "Minute",
    Seconds: "Second"
};
var fnCreateDate = function (oDateValue, sCalendarType, bUTC, bStrict) {
    var oDate, iYear = typeof oDateValue.year === "number" ? oDateValue.year : 1970;
    if (oDateValue.valid) {
        if (bUTC || oDateValue.tzDiff !== undefined) {
            oDate = UniversalDate.getInstance(new Date(0), sCalendarType);
            oDate.setUTCEra(oDateValue.era || UniversalDate.getCurrentEra(sCalendarType));
            oDate.setUTCFullYear(iYear);
            oDate.setUTCMonth(oDateValue.month || 0);
            oDate.setUTCDate(oDateValue.day || 1);
            oDate.setUTCHours(oDateValue.hour || 0);
            oDate.setUTCMinutes(oDateValue.minute || 0);
            oDate.setUTCSeconds(oDateValue.second || 0);
            oDate.setUTCMilliseconds(oDateValue.millisecond || 0);
            if (bStrict && (oDateValue.day || 1) !== oDate.getUTCDate()) {
                oDateValue.valid = false;
                oDate = undefined;
            }
            else {
                if (oDateValue.tzDiff) {
                    oDate.setUTCMinutes((oDateValue.minute || 0) + oDateValue.tzDiff);
                }
                if (oDateValue.week !== undefined && (oDateValue.month === undefined || oDateValue.day === undefined)) {
                    oDate.setUTCWeek({
                        year: oDateValue.weekYear || oDateValue.year,
                        week: oDateValue.week
                    });
                    if (oDateValue.dayNumberOfWeek !== undefined) {
                        oDate.setUTCDate(oDate.getUTCDate() + oDateValue.dayNumberOfWeek - 1);
                    }
                }
            }
        }
        else {
            oDate = UniversalDate.getInstance(new Date(1970, 0, 1, 0, 0, 0), sCalendarType);
            oDate.setEra(oDateValue.era || UniversalDate.getCurrentEra(sCalendarType));
            oDate.setFullYear(iYear);
            oDate.setMonth(oDateValue.month || 0);
            oDate.setDate(oDateValue.day || 1);
            oDate.setHours(oDateValue.hour || 0);
            oDate.setMinutes(oDateValue.minute || 0);
            oDate.setSeconds(oDateValue.second || 0);
            oDate.setMilliseconds(oDateValue.millisecond || 0);
            if (bStrict && (oDateValue.day || 1) !== oDate.getDate()) {
                oDateValue.valid = false;
                oDate = undefined;
            }
            else if (oDateValue.week !== undefined && (oDateValue.month === undefined || oDateValue.day === undefined)) {
                oDate.setWeek({
                    year: oDateValue.weekYear || oDateValue.year,
                    week: oDateValue.week
                });
                if (oDateValue.dayNumberOfWeek !== undefined) {
                    oDate.setDate(oDate.getDate() + oDateValue.dayNumberOfWeek - 1);
                }
            }
        }
        if (oDateValue.valid) {
            oDate = oDate.getJSDate();
            return oDate;
        }
    }
    return null;
};
function mergeWithoutOverwrite(object1, object2) {
    if (object1 === object2) {
        return object1;
    }
    var oMergedObject = {};
    Object.keys(object1).forEach(function (sKey) {
        oMergedObject[sKey] = object1[sKey];
    });
    Object.keys(object2).forEach(function (sKey) {
        if (!oMergedObject.hasOwnProperty(sKey)) {
            oMergedObject[sKey] = object2[sKey];
        }
    });
    return oMergedObject;
}
function isValidDateRange(oStartDate, oEndDate) {
    if (oStartDate.getTime() > oEndDate.getTime()) {
        return false;
    }
    return true;
}
DateFormat.prototype._mRanges = {
    second: [-60, 60],
    minute: [-60, 60],
    hour: [-24, 24],
    day: [-6, 6],
    week: [-4, 4],
    month: [-12, 12],
    year: [-10, 10]
};
DateFormat.prototype._mScales = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2592000,
    quarter: 7776000,
    year: 31536000
};
function cutDateFields(oDate, iStartIndex) {
    var aFields = [
        "FullYear",
        "Month",
        "Date",
        "Hours",
        "Minutes",
        "Seconds",
        "Milliseconds"
    ], sMethodName;
    var oDateCopy = new Date(oDate.getTime());
    for (var i = iStartIndex; i < aFields.length; i++) {
        sMethodName = "set" + aFields[iStartIndex];
        oDateCopy[sMethodName].apply(oDateCopy, [0]);
    }
    return oDateCopy;
}
var mRelativeDiffs = {
    year: function (oFromDate, oToDate) {
        return oToDate.getFullYear() - oFromDate.getFullYear();
    },
    month: function (oFromDate, oToDate) {
        return oToDate.getMonth() - oFromDate.getMonth() + (this.year(oFromDate, oToDate) * 12);
    },
    week: function (oFromDate, oToDate, oFormat) {
        var iFromDay = oFormat._adaptDayOfWeek(oFromDate.getDay());
        var iToDay = oFormat._adaptDayOfWeek(oToDate.getDay());
        oFromDate = cutDateFields(oFromDate, 3);
        oToDate = cutDateFields(oToDate, 3);
        return (oToDate.getTime() - oFromDate.getTime() - (iToDay - iFromDay) * oFormat._mScales.day * 1000) / (oFormat._mScales.week * 1000);
    },
    day: function (oFromDate, oToDate, oFormat) {
        oFromDate = cutDateFields(oFromDate, 3);
        oToDate = cutDateFields(oToDate, 3);
        return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.day * 1000);
    },
    hour: function (oFromDate, oToDate, oFormat) {
        oFromDate = cutDateFields(oFromDate, 4);
        oToDate = cutDateFields(oToDate, 4);
        return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.hour * 1000);
    },
    minute: function (oFromDate, oToDate, oFormat) {
        oFromDate = cutDateFields(oFromDate, 5);
        oToDate = cutDateFields(oToDate, 5);
        return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.minute * 1000);
    },
    second: function (oFromDate, oToDate, oFormat) {
        oFromDate = cutDateFields(oFromDate, 6);
        oToDate = cutDateFields(oToDate, 6);
        return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.second * 1000);
    }
};