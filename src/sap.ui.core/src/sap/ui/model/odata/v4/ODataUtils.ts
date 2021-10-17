import CalendarType from "sap/ui/core/CalendarType";
import DateFormat from "sap/ui/core/format/DateFormat";
import BaseODataUtils from "sap/ui/model/odata/ODataUtils";
import _Batch from "sap/ui/model/odata/v4/lib/_Batch";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
var oDateFormatter, oDateTimeOffsetFormatter, sDateValue = "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])", oTimeFormatter, sTimeOfDayValue = "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(\\.\\d{1,12})?)?", rDate = new RegExp("^" + sDateValue + "$"), rDateTimeOffset = new RegExp("^" + sDateValue + "T" + sTimeOfDayValue + "(?:Z|[-+](?:0\\d|1[0-3]):[0-5]\\d|[-+]14:00)$", "i"), rTimeOfDay = new RegExp("^" + sTimeOfDayValue + "$"), ODataUtils = {
    _setDateTimeFormatter: function () {
        oDateFormatter = DateFormat.getDateInstance({
            calendarType: CalendarType.Gregorian,
            pattern: "yyyy-MM-dd",
            strictParsing: true,
            UTC: true
        });
        oDateTimeOffsetFormatter = DateFormat.getDateTimeInstance({
            calendarType: CalendarType.Gregorian,
            pattern: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
            strictParsing: true
        });
        oTimeFormatter = DateFormat.getTimeInstance({
            calendarType: CalendarType.Gregorian,
            pattern: "HH:mm:ss.SSS",
            strictParsing: true,
            UTC: true
        });
    },
    compare: function (vValue1, vValue2, vEdmType) {
        if (vEdmType === true || vEdmType === "Decimal") {
            return BaseODataUtils.compare(vValue1, vValue2, true);
        }
        if (vEdmType === "DateTime") {
            return BaseODataUtils.compare(ODataUtils.parseDateTimeOffset(vValue1), ODataUtils.parseDateTimeOffset(vValue2));
        }
        return BaseODataUtils.compare(vValue1, vValue2);
    },
    deserializeBatchResponse: function (sContentType, sResponseBody) {
        return _Batch.deserializeBatchResponse(sContentType, sResponseBody);
    },
    formatLiteral: function (vValue, sType) {
        return _Helper.formatLiteral(vValue, sType);
    },
    parseDate: function (sDate) {
        var oDate = rDate.test(sDate) && oDateFormatter.parse(sDate);
        if (!oDate) {
            throw new Error("Not a valid Edm.Date value: " + sDate);
        }
        return oDate;
    },
    parseDateTimeOffset: function (sDateTimeOffset) {
        var oDateTimeOffset, aMatches = rDateTimeOffset.exec(sDateTimeOffset);
        if (aMatches) {
            if (aMatches[1] && aMatches[1].length > 4) {
                sDateTimeOffset = sDateTimeOffset.replace(aMatches[1], aMatches[1].slice(0, 4));
            }
            oDateTimeOffset = oDateTimeOffsetFormatter.parse(sDateTimeOffset.toUpperCase());
        }
        if (!oDateTimeOffset) {
            throw new Error("Not a valid Edm.DateTimeOffset value: " + sDateTimeOffset);
        }
        return oDateTimeOffset;
    },
    parseTimeOfDay: function (sTimeOfDay) {
        var oTimeOfDay;
        if (rTimeOfDay.test(sTimeOfDay)) {
            if (sTimeOfDay.length > 12) {
                sTimeOfDay = sTimeOfDay.slice(0, 12);
            }
            oTimeOfDay = oTimeFormatter.parse(sTimeOfDay);
        }
        if (!oTimeOfDay) {
            throw new Error("Not a valid Edm.TimeOfDay value: " + sTimeOfDay);
        }
        return oTimeOfDay;
    },
    serializeBatchRequest: function (aRequests, sEpilogue) {
        return _Batch.serializeBatchRequest(aRequests, sEpilogue);
    }
};
ODataUtils._setDateTimeFormatter();