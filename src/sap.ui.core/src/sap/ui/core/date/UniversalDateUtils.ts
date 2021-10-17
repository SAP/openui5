import UniversalDate from "sap/ui/core/date/UniversalDate";
import Locale from "sap/ui/core/Locale";
import LocaleData from "sap/ui/core/LocaleData";
import assert from "sap/base/assert";
export class UniversalDateUtils {
    static ranges = {
        lastDays: function (iDays) {
            return UniversalDateUtils.getRange(-iDays, "DAY");
        },
        yesterday: function () {
            return UniversalDateUtils.getRange(-1, "DAY");
        },
        today: function () {
            return UniversalDateUtils.getRange(0, "DAY");
        },
        tomorrow: function () {
            return UniversalDateUtils.getRange(1, "DAY");
        },
        nextDays: function (iDays) {
            return UniversalDateUtils.getRange(iDays, "DAY");
        },
        lastWeeks: function (iWeeks) {
            return UniversalDateUtils.getRange(-iWeeks, "WEEK");
        },
        lastWeek: function () {
            return UniversalDateUtils.getRange(-1, "WEEK");
        },
        currentWeek: function () {
            return UniversalDateUtils.getRange(0, "WEEK");
        },
        nextWeek: function () {
            return UniversalDateUtils.getRange(1, "WEEK");
        },
        nextWeeks: function (iWeeks) {
            return UniversalDateUtils.getRange(iWeeks, "WEEK");
        },
        lastMonths: function (iMonths) {
            return UniversalDateUtils.getRange(-iMonths, "MONTH");
        },
        lastMonth: function () {
            return UniversalDateUtils.getRange(-1, "MONTH");
        },
        currentMonth: function () {
            return UniversalDateUtils.getRange(0, "MONTH");
        },
        nextMonth: function () {
            return UniversalDateUtils.getRange(1, "MONTH");
        },
        nextMonths: function (iMonths) {
            return UniversalDateUtils.getRange(iMonths, "MONTH");
        },
        lastQuarters: function (iQuarters) {
            return UniversalDateUtils.getRange(-iQuarters, "QUARTER");
        },
        lastQuarter: function () {
            return UniversalDateUtils.getRange(-1, "QUARTER");
        },
        currentQuarter: function () {
            return UniversalDateUtils.getRange(0, "QUARTER");
        },
        nextQuarter: function () {
            return UniversalDateUtils.getRange(1, "QUARTER");
        },
        nextQuarters: function (iQuarters) {
            return UniversalDateUtils.getRange(iQuarters, "QUARTER");
        },
        quarter: function (iQuarter) {
            if (iQuarter <= 2) {
                return UniversalDateUtils.getRange(iQuarter - 1, "QUARTER", UniversalDateUtils.getYearStartDate());
            }
            else {
                var aRange = UniversalDateUtils.getRange(iQuarter - 2, "QUARTER", UniversalDateUtils.getYearStartDate());
                var oStartDate = aRange[1];
                oStartDate.setMilliseconds(1000);
                return UniversalDateUtils.getRange(0, "QUARTER", oStartDate);
            }
        },
        lastYears: function (iYears) {
            return UniversalDateUtils.getRange(-iYears, "YEAR");
        },
        lastYear: function () {
            return UniversalDateUtils.getRange(-1, "YEAR");
        },
        currentYear: function () {
            return UniversalDateUtils.getRange(0, "YEAR");
        },
        nextYear: function () {
            return UniversalDateUtils.getRange(1, "YEAR");
        },
        nextYears: function (iYears) {
            return UniversalDateUtils.getRange(iYears, "YEAR");
        },
        yearToDate: function () {
            var oToday = UniversalDateUtils.createNewUniversalDate();
            return [
                UniversalDateUtils.getYearStartDate(oToday),
                UniversalDateUtils.resetEndTime(oToday)
            ];
        }
    };
    static getRange(iDuration: any, sUnit: any, oBaseDate: any, bBaseOnUnit: any) {
        if (bBaseOnUnit === undefined) {
            bBaseOnUnit = true;
        }
        if (isNaN(iDuration)) {
            throw new TypeError("duration is NaN, but is " + iDuration);
        }
        iDuration = Math.trunc(iDuration);
        var oStartDate = UniversalDateUtils.resetStartTime(oBaseDate == undefined ? null : oBaseDate), oEndDate;
        if (bBaseOnUnit) {
            switch (sUnit) {
                case "DAY": break;
                case "WEEK":
                    oStartDate = UniversalDateUtils.getWeekStartDate(oStartDate);
                    break;
                case "MONTH":
                    oStartDate = UniversalDateUtils.getMonthStartDate(oStartDate);
                    break;
                case "QUARTER":
                    oStartDate = UniversalDateUtils.getQuarterStartDate(oStartDate);
                    break;
                case "YEAR":
                    oStartDate = UniversalDateUtils.getYearStartDate(oStartDate);
                    break;
                default: throw new TypeError("invalid unit " + sUnit);
            }
        }
        switch (sUnit) {
            case "DAY":
                if (iDuration > 0) {
                    oStartDate.setDate(oStartDate.getDate() + 1);
                }
                oEndDate = clone(oStartDate);
                iDuration = iDuration == 0 ? 1 : iDuration;
                oEndDate.setDate(oStartDate.getDate() + iDuration);
                break;
            case "WEEK":
                if (iDuration > 0) {
                    oStartDate.setDate(oStartDate.getDate() + 7);
                }
                oEndDate = clone(oStartDate);
                iDuration = iDuration == 0 ? 1 : iDuration;
                oEndDate.setDate(oStartDate.getDate() + (iDuration * 7));
                break;
            case "MONTH":
                if (iDuration > 0) {
                    oStartDate.setMonth(oStartDate.getMonth() + 1);
                }
                oEndDate = clone(oStartDate);
                iDuration = iDuration == 0 ? 1 : iDuration;
                oEndDate.setMonth(oStartDate.getMonth() + iDuration);
                break;
            case "QUARTER":
                if (iDuration > 0) {
                    oStartDate.setMonth(oStartDate.getMonth() + 3);
                }
                oEndDate = clone(oStartDate);
                iDuration = iDuration == 0 ? 1 : iDuration;
                oEndDate.setMonth(oStartDate.getMonth() + (iDuration * 3));
                break;
            case "YEAR":
                if (iDuration > 0) {
                    oStartDate.setFullYear(oStartDate.getFullYear() + 1);
                }
                oEndDate = clone(oStartDate);
                iDuration = iDuration == 0 ? 1 : iDuration;
                oEndDate.setFullYear(oStartDate.getFullYear() + iDuration);
                break;
            default: throw new TypeError("invalid unit " + sUnit);
        }
        if (oEndDate.getTime() < oStartDate.getTime()) {
            oEndDate = [oStartDate, oStartDate = oEndDate][0];
        }
        oEndDate.setDate(oEndDate.getDate() - 1);
        return [
            UniversalDateUtils.resetStartTime(oStartDate),
            UniversalDateUtils.resetEndTime(oEndDate)
        ];
    }
    static getWeekStartDate(oUniversalDate: any, sLocale: any) {
        var oLocale = sLocale ? new Locale(sLocale) : sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(), oLocaleData = LocaleData.getInstance(oLocale), iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
        oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
        oUniversalDate.setDate(oUniversalDate.getDate() - oUniversalDate.getDay() + iFirstDayOfWeek);
        return UniversalDateUtils.resetStartTime(oUniversalDate);
    }
    static getMonthStartDate(oUniversalDate: any) {
        oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
        oUniversalDate.setDate(1);
        return UniversalDateUtils.resetStartTime(oUniversalDate);
    }
    static getQuarterStartDate(oUniversalDate: any) {
        oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
        oUniversalDate.setMonth(3 * Math.floor(oUniversalDate.getMonth() / 3));
        oUniversalDate.setDate(1);
        return UniversalDateUtils.resetStartTime(oUniversalDate);
    }
    static getYearStartDate(oUniversalDate: any) {
        oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
        oUniversalDate.setMonth(0);
        oUniversalDate.setDate(1);
        return UniversalDateUtils.resetStartTime(oUniversalDate);
    }
    static resetStartTime(oUniversalDate: any) {
        oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
        oUniversalDate.setHours(0, 0, 0, 0);
        return oUniversalDate;
    }
    static resetEndTime(oUniversalDate: any) {
        oUniversalDate = oUniversalDate ? clone(oUniversalDate) : clone(UniversalDateUtils.createNewUniversalDate());
        oUniversalDate.setHours(23, 59, 59, 999);
        return oUniversalDate;
    }
    static createNewUniversalDate(...args: any) {
        return new UniversalDate();
    }
}
function clone(oUniversalDate) {
    assert(oUniversalDate instanceof UniversalDate, "method accepts only instances of UniversalDate");
    return oUniversalDate.createDate(oUniversalDate.constructor, [oUniversalDate.getJSDate()]);
}