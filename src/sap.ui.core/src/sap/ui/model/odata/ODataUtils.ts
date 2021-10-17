import assert from "sap/base/assert";
import Log from "sap/base/Log";
import encodeURL from "sap/base/security/encodeURL";
import each from "sap/base/util/each";
import CalendarType from "sap/ui/core/CalendarType";
import DateFormat from "sap/ui/core/format/DateFormat";
import FilterProcessor from "sap/ui/model/FilterProcessor";
import Sorter from "sap/ui/model/Sorter";
var oDateTimeFormat, oDateTimeFormatMs, oDateTimeOffsetFormat, rDecimal = /^([-+]?)0*(\d+)(\.\d+|)$/, oTimeFormat, rTrailingDecimal = /\.$/, rTrailingZeroes = /0+$/;
function setDateTimeFormatter() {
    if (!oDateTimeFormat) {
        oDateTimeFormat = DateFormat.getDateInstance({
            pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss''",
            calendarType: CalendarType.Gregorian
        });
        oDateTimeFormatMs = DateFormat.getDateInstance({
            pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss.SSS''",
            calendarType: CalendarType.Gregorian
        });
        oDateTimeOffsetFormat = DateFormat.getDateInstance({
            pattern: "'datetimeoffset'''yyyy-MM-dd'T'HH:mm:ss'Z'''",
            calendarType: CalendarType.Gregorian
        });
        oTimeFormat = DateFormat.getTimeInstance({
            pattern: "'time''PT'HH'H'mm'M'ss'S'''",
            calendarType: CalendarType.Gregorian
        });
    }
}
var ODataUtils = function () { };
ODataUtils.createSortParams = function (aSorters) {
    var sSortParam;
    if (!aSorters || aSorters.length == 0) {
        return;
    }
    sSortParam = "$orderby=";
    for (var i = 0; i < aSorters.length; i++) {
        var oSorter = aSorters[i];
        if (oSorter instanceof Sorter) {
            sSortParam += oSorter.sPath;
            sSortParam += oSorter.bDescending ? "%20desc" : "%20asc";
            sSortParam += ",";
        }
        else {
            Log.error("Trying to use " + oSorter + " as a Sorter, but it is a " + typeof oSorter);
        }
    }
    sSortParam = sSortParam.slice(0, -1);
    return sSortParam;
};
function convertLegacyFilter(oFilter) {
    if (oFilter && typeof oFilter.convert === "function") {
        oFilter = oFilter.convert();
    }
    return oFilter;
}
ODataUtils.createFilterParams = function (vFilter, oMetadata, oEntityType) {
    var oFilter;
    if (Array.isArray(vFilter)) {
        vFilter = vFilter.map(convertLegacyFilter);
        oFilter = FilterProcessor.groupFilters(vFilter);
    }
    else {
        oFilter = convertLegacyFilter(vFilter);
    }
    if (!oFilter) {
        return;
    }
    return "$filter=" + this._createFilterParams(oFilter, oMetadata, oEntityType);
};
ODataUtils._createFilterParams = function (vFilter, oMetadata, oEntityType) {
    var that = this, oFilter = Array.isArray(vFilter) ? FilterProcessor.groupFilters(vFilter) : vFilter;
    function create(oFilter, bOmitBrackets) {
        oFilter = convertLegacyFilter(oFilter);
        if (oFilter.aFilters) {
            return createMulti(oFilter, bOmitBrackets);
        }
        return that._createFilterSegment(oFilter.sPath, oMetadata, oEntityType, oFilter.sOperator, oFilter.oValue1, oFilter.oValue2, oFilter.bCaseSensitive);
    }
    function createMulti(oMultiFilter, bOmitBrackets) {
        var aFilters = oMultiFilter.aFilters, bAnd = !!oMultiFilter.bAnd, sFilter = "";
        if (aFilters.length === 0) {
            return bAnd ? "true" : "false";
        }
        if (aFilters.length === 1) {
            if (aFilters[0]._bMultiFilter) {
                return create(aFilters[0]);
            }
            return create(aFilters[0], true);
        }
        if (!bOmitBrackets) {
            sFilter += "(";
        }
        sFilter += create(aFilters[0]);
        for (var i = 1; i < aFilters.length; i++) {
            sFilter += bAnd ? "%20and%20" : "%20or%20";
            sFilter += create(aFilters[i]);
        }
        if (!bOmitBrackets) {
            sFilter += ")";
        }
        return sFilter;
    }
    if (!oFilter) {
        return;
    }
    return create(oFilter, true);
};
ODataUtils._createUrlParamsArray = function (vParams) {
    var aUrlParams, sType = typeof vParams, sParams;
    if (Array.isArray(vParams)) {
        return vParams;
    }
    aUrlParams = [];
    if (sType === "string" || vParams instanceof String) {
        if (vParams) {
            aUrlParams.push(vParams);
        }
    }
    else if (sType === "object") {
        sParams = this._encodeURLParameters(vParams);
        if (sParams) {
            aUrlParams.push(sParams);
        }
    }
    return aUrlParams;
};
ODataUtils._encodeURLParameters = function (mParams) {
    if (!mParams) {
        return "";
    }
    var aUrlParams = [];
    each(mParams, function (sName, oValue) {
        if (typeof oValue === "string" || oValue instanceof String) {
            oValue = encodeURIComponent(oValue);
        }
        sName = sName.startsWith("$") ? sName : encodeURIComponent(sName);
        aUrlParams.push(sName + "=" + oValue);
    });
    return aUrlParams.join("&");
};
ODataUtils.setOrigin = function (sServiceURL, vParameters) {
    var sOrigin, sSystem, sClient;
    if (!sServiceURL || !vParameters || sServiceURL.indexOf(";mo") > 0) {
        return sServiceURL;
    }
    if (typeof vParameters == "string") {
        sOrigin = vParameters;
    }
    else {
        sOrigin = vParameters.alias;
        if (!sOrigin) {
            sSystem = vParameters.system;
            sClient = vParameters.client;
            if (!sSystem || !sClient) {
                Log.warning("ODataUtils.setOrigin: No Client or System ID given for Origin");
                return sServiceURL;
            }
            sOrigin = "sid(" + sSystem + "." + sClient + ")";
        }
    }
    var aUrlParts = sServiceURL.split("?");
    var sBaseURL = aUrlParts[0];
    var sURLParams = aUrlParts[1] ? "?" + aUrlParts[1] : "";
    var sTrailingSlash = "";
    if (sBaseURL[sBaseURL.length - 1] === "/") {
        sBaseURL = sBaseURL.substring(0, sBaseURL.length - 1);
        sTrailingSlash = "/";
    }
    var rSegmentCheck = /(\/[^\/]+)$/g;
    var rOriginCheck = /(;o=[^\/;]+)/g;
    var sLastSegment = sBaseURL.match(rSegmentCheck)[0];
    var aLastOrigin = sLastSegment.match(rOriginCheck);
    var sFoundOrigin = aLastOrigin ? aLastOrigin[0] : null;
    if (sFoundOrigin) {
        if (vParameters.force) {
            var sChangedLastSegment = sLastSegment.replace(sFoundOrigin, ";o=" + sOrigin);
            sBaseURL = sBaseURL.replace(sLastSegment, sChangedLastSegment);
            return sBaseURL + sTrailingSlash + sURLParams;
        }
        return sServiceURL;
    }
    sBaseURL = sBaseURL + ";o=" + sOrigin + sTrailingSlash;
    return sBaseURL + sURLParams;
};
ODataUtils.setAnnotationOrigin = function (sAnnotationURL, vParameters) {
    var sFinalAnnotationURL;
    var iAnnotationIndex = sAnnotationURL.indexOf("/Annotations(");
    var iHanaXsSegmentIndex = vParameters && vParameters.preOriginBaseUri ? vParameters.preOriginBaseUri.indexOf(".xsodata") : -1;
    if (iAnnotationIndex === -1) {
        iAnnotationIndex = sAnnotationURL.indexOf("/Annotations%28");
    }
    if (iAnnotationIndex >= 0) {
        if (sAnnotationURL.indexOf("/$value", iAnnotationIndex) === -1) {
            Log.warning("ODataUtils.setAnnotationOrigin: Annotation url is missing $value segment.");
            sFinalAnnotationURL = sAnnotationURL;
        }
        else {
            var sAnnotationUrlBase = sAnnotationURL.substring(0, iAnnotationIndex);
            var sAnnotationUrlRest = sAnnotationURL.substring(iAnnotationIndex, sAnnotationURL.length);
            var sAnnotationWithOrigin = ODataUtils.setOrigin(sAnnotationUrlBase, vParameters);
            sFinalAnnotationURL = sAnnotationWithOrigin + sAnnotationUrlRest;
        }
    }
    else if (iHanaXsSegmentIndex >= 0) {
        sFinalAnnotationURL = ODataUtils.setOrigin(sAnnotationURL, vParameters);
    }
    else {
        sFinalAnnotationURL = sAnnotationURL.replace(vParameters.preOriginBaseUri, vParameters.postOriginBaseUri);
    }
    return sFinalAnnotationURL;
};
ODataUtils._resolveMultiFilter = function (oMultiFilter, oMetadata, oEntityType) {
    var that = this, aFilters = oMultiFilter.aFilters, sFilterParam = "";
    if (aFilters) {
        sFilterParam += "(";
        each(aFilters, function (i, oFilter) {
            if (oFilter._bMultiFilter) {
                sFilterParam += that._resolveMultiFilter(oFilter, oMetadata, oEntityType);
            }
            else if (oFilter.sPath) {
                sFilterParam += that._createFilterSegment(oFilter.sPath, oMetadata, oEntityType, oFilter.sOperator, oFilter.oValue1, oFilter.oValue2, "", oFilter.bCaseSensitive);
            }
            if (i < (aFilters.length - 1)) {
                if (oMultiFilter.bAnd) {
                    sFilterParam += "%20and%20";
                }
                else {
                    sFilterParam += "%20or%20";
                }
            }
        });
        sFilterParam += ")";
    }
    return sFilterParam;
};
ODataUtils._createFilterSegment = function (sPath, oMetadata, oEntityType, sOperator, oValue1, oValue2, bCaseSensitive) {
    var oPropertyMetadata, sType;
    if (bCaseSensitive === undefined) {
        bCaseSensitive = true;
    }
    if (oEntityType) {
        oPropertyMetadata = oMetadata._getPropertyMetadata(oEntityType, sPath);
        sType = oPropertyMetadata && oPropertyMetadata.type;
        assert(oPropertyMetadata, "PropertyType for property " + sPath + " of EntityType " + oEntityType.name + " not found!");
    }
    if (sType) {
        oValue1 = this.formatValue(oValue1, sType, bCaseSensitive);
        oValue2 = (oValue2 != null) ? this.formatValue(oValue2, sType, bCaseSensitive) : null;
    }
    else {
        assert(null, "Type for filter property could not be found in metadata!");
    }
    if (oValue1) {
        oValue1 = encodeURL(String(oValue1));
    }
    if (oValue2) {
        oValue2 = encodeURL(String(oValue2));
    }
    if (!bCaseSensitive && sType === "Edm.String") {
        sPath = "toupper(" + sPath + ")";
    }
    switch (sOperator) {
        case "EQ":
        case "NE":
        case "GT":
        case "GE":
        case "LT":
        case "LE": return sPath + "%20" + sOperator.toLowerCase() + "%20" + oValue1;
        case "BT": return "(" + sPath + "%20ge%20" + oValue1 + "%20and%20" + sPath + "%20le%20" + oValue2 + ")";
        case "NB": return "not%20(" + sPath + "%20ge%20" + oValue1 + "%20and%20" + sPath + "%20le%20" + oValue2 + ")";
        case "Contains": return "substringof(" + oValue1 + "," + sPath + ")";
        case "NotContains": return "not%20substringof(" + oValue1 + "," + sPath + ")";
        case "StartsWith": return "startswith(" + sPath + "," + oValue1 + ")";
        case "NotStartsWith": return "not%20startswith(" + sPath + "," + oValue1 + ")";
        case "EndsWith": return "endswith(" + sPath + "," + oValue1 + ")";
        case "NotEndsWith": return "not%20endswith(" + sPath + "," + oValue1 + ")";
        default:
            Log.error("ODataUtils :: Unknown filter operator " + sOperator);
            return "true";
    }
};
ODataUtils.formatValue = function (vValue, sType, bCaseSensitive) {
    var oDate, sValue;
    if (bCaseSensitive === undefined) {
        bCaseSensitive = true;
    }
    if (vValue === null || vValue === undefined) {
        return "null";
    }
    setDateTimeFormatter();
    switch (sType) {
        case "Edm.String":
            vValue = bCaseSensitive ? vValue : vValue.toUpperCase();
            sValue = "'" + String(vValue).replace(/'/g, "''") + "'";
            break;
        case "Edm.Time":
            if (typeof vValue === "object") {
                sValue = oTimeFormat.format(new Date(vValue.ms), true);
            }
            else {
                sValue = "time'" + vValue + "'";
            }
            break;
        case "Edm.DateTime":
            oDate = vValue instanceof Date ? vValue : new Date(vValue);
            if (oDate.getMilliseconds() > 0) {
                sValue = oDateTimeFormatMs.format(oDate, true);
            }
            else {
                sValue = oDateTimeFormat.format(oDate, true);
            }
            break;
        case "Edm.DateTimeOffset":
            oDate = vValue instanceof Date ? vValue : new Date(vValue);
            sValue = oDateTimeOffsetFormat.format(oDate, true);
            break;
        case "Edm.Guid":
            sValue = "guid'" + vValue + "'";
            break;
        case "Edm.Decimal":
            sValue = vValue + "m";
            break;
        case "Edm.Int64":
            sValue = vValue + "l";
            break;
        case "Edm.Double":
            sValue = vValue + "d";
            break;
        case "Edm.Float":
        case "Edm.Single":
            sValue = vValue + "f";
            break;
        case "Edm.Binary":
            sValue = "binary'" + vValue + "'";
            break;
        default:
            sValue = String(vValue);
            break;
    }
    return sValue;
};
ODataUtils.parseValue = function (sValue) {
    var sFirstChar = sValue[0], sLastChar = sValue[sValue.length - 1];
    setDateTimeFormatter();
    if (sFirstChar === "'") {
        return sValue.slice(1, -1).replace(/''/g, "'");
    }
    else if (sValue.startsWith("time'")) {
        return {
            __edmType: "Edm.Time",
            ms: oTimeFormat.parse(sValue, true).getTime()
        };
    }
    else if (sValue.startsWith("datetime'")) {
        if (sValue.indexOf(".") === -1) {
            return oDateTimeFormat.parse(sValue, true);
        }
        else {
            return oDateTimeFormatMs.parse(sValue, true);
        }
    }
    else if (sValue.startsWith("datetimeoffset'")) {
        return oDateTimeOffsetFormat.parse(sValue, true);
    }
    else if (sValue.startsWith("guid'")) {
        return sValue.slice(5, -1);
    }
    else if (sValue === "null") {
        return null;
    }
    else if (sLastChar === "m" || sLastChar === "l" || sLastChar === "d" || sLastChar === "f") {
        return sValue.slice(0, -1);
    }
    else if (!isNaN(sFirstChar) || sFirstChar === "-") {
        return parseInt(sValue);
    }
    else if (sValue === "true" || sValue === "false") {
        return sValue === "true";
    }
    else if (sValue.startsWith("binary'")) {
        return sValue.slice(7, -1);
    }
    throw new Error("Cannot parse value '" + sValue + "', no Edm type found");
};
function simpleCompare(vValue1, vValue2) {
    if (vValue1 === vValue2) {
        return 0;
    }
    if (vValue1 === null || vValue2 === null || vValue1 === undefined || vValue2 === undefined) {
        return NaN;
    }
    return vValue1 > vValue2 ? 1 : -1;
}
function parseDecimal(sValue) {
    var aMatches;
    if (typeof sValue !== "string") {
        return undefined;
    }
    aMatches = rDecimal.exec(sValue);
    if (!aMatches) {
        return undefined;
    }
    return {
        sign: aMatches[1] === "-" ? -1 : 1,
        integerLength: aMatches[2].length,
        abs: aMatches[2] + aMatches[3].replace(rTrailingZeroes, "").replace(rTrailingDecimal, "")
    };
}
function decimalCompare(sValue1, sValue2) {
    var oDecimal1, oDecimal2, iResult;
    if (sValue1 === sValue2) {
        return 0;
    }
    oDecimal1 = parseDecimal(sValue1);
    oDecimal2 = parseDecimal(sValue2);
    if (!oDecimal1 || !oDecimal2) {
        return NaN;
    }
    if (oDecimal1.sign !== oDecimal2.sign) {
        return oDecimal1.sign > oDecimal2.sign ? 1 : -1;
    }
    iResult = simpleCompare(oDecimal1.integerLength, oDecimal2.integerLength) || simpleCompare(oDecimal1.abs, oDecimal2.abs);
    return oDecimal1.sign * iResult;
}
var rTime = /^PT(\d\d)H(\d\d)M(\d\d)S$/;
function extractMilliseconds(vValue) {
    if (typeof vValue === "string" && rTime.test(vValue)) {
        vValue = parseInt(RegExp.$1) * 3600000 + parseInt(RegExp.$2) * 60000 + parseInt(RegExp.$3) * 1000;
    }
    if (vValue instanceof Date) {
        return vValue.getTime();
    }
    if (vValue && vValue.__edmType === "Edm.Time") {
        return vValue.ms;
    }
    return vValue;
}
ODataUtils.compare = function (vValue1, vValue2, bAsDecimal) {
    return bAsDecimal ? decimalCompare(vValue1, vValue2) : simpleCompare(extractMilliseconds(vValue1), extractMilliseconds(vValue2));
};
ODataUtils.getComparator = function (sEdmType) {
    switch (sEdmType) {
        case "Edm.Date":
        case "Edm.DateTime":
        case "Edm.DateTimeOffset":
        case "Edm.Time": return ODataUtils.compare;
        case "Edm.Decimal":
        case "Edm.Int64": return decimalCompare;
        default: return simpleCompare;
    }
};
var rNormalizeString = /([(=,])('.*?')([,)])/g, rNormalizeCase = /[MLDF](?=[,)](?:[^']*'[^']*')*[^']*$)/g, rNormalizeBinary = /([(=,])(X')/g, fnNormalizeString = function (value, p1, p2, p3) {
    return p1 + encodeURIComponent(decodeURIComponent(p2)) + p3;
}, fnNormalizeCase = function (value) {
    return value.toLowerCase();
}, fnNormalizeBinary = function (value, p1) {
    return p1 + "binary'";
};
ODataUtils._normalizeKey = function (sKey) {
    return sKey.replace(rNormalizeString, fnNormalizeString).replace(rNormalizeCase, fnNormalizeCase).replace(rNormalizeBinary, fnNormalizeBinary);
};
ODataUtils._mergeIntervals = function (aIntervals) {
    if (aIntervals.length) {
        return { start: aIntervals[0].start, end: aIntervals[aIntervals.length - 1].end };
    }
    return undefined;
};
ODataUtils._getReadIntervals = function (aElements, iStart, iLength, iPrefetchLength, iLimit) {
    var i, iEnd, n, iGapStart = -1, aIntervals = [], oRange = ODataUtils._getReadRange(aElements, iStart, iLength, iPrefetchLength);
    if (iLimit === undefined) {
        iLimit = Infinity;
    }
    iEnd = Math.min(oRange.start + oRange.length, iLimit);
    n = Math.min(iEnd, Math.max(oRange.start, aElements.length) + 1);
    for (i = oRange.start; i < n; i += 1) {
        if (aElements[i] !== undefined) {
            if (iGapStart >= 0) {
                aIntervals.push({ start: iGapStart, end: i });
                iGapStart = -1;
            }
        }
        else if (iGapStart < 0) {
            iGapStart = i;
        }
    }
    if (iGapStart >= 0) {
        aIntervals.push({ start: iGapStart, end: iEnd });
    }
    return aIntervals;
};
ODataUtils._getReadRange = function (aElements, iStart, iLength, iPrefetchLength) {
    function isDataMissing(iStart, iEnd) {
        var i;
        for (i = iStart; i < iEnd; i += 1) {
            if (aElements[i] === undefined) {
                return true;
            }
        }
        return false;
    }
    if (isDataMissing(iStart + iLength, iStart + iLength + iPrefetchLength / 2)) {
        iLength += iPrefetchLength;
    }
    if (isDataMissing(Math.max(iStart - iPrefetchLength / 2, 0), iStart)) {
        iLength += iPrefetchLength;
        iStart -= iPrefetchLength;
        if (iStart < 0) {
            iLength += iStart;
            if (isNaN(iLength)) {
                iLength = Infinity;
            }
            iStart = 0;
        }
    }
    return { length: iLength, start: iStart };
};