/*!
 * ${copyright}
 */

// Provides class sap.ui.core.date.Gregorian
sap.ui.define(['jquery.sap.global', './UniversalDate', 'sap/ui/core/Locale', 'sap/ui/core/LocaleData'],
	function(jQuery, UniversalDate, Locale, LocaleData) {
	"use strict";


	/**
	 * The Gregorian date class
	 *
	 * @class
	 * The gregorian date adds support for era, by returning the CLDR era type in the getEra method and making the year
	 * an absolute value.
	 *
	 * @private
	 * @alias sap.ui.core.date.Gregorian
	 */
	var Gregorian = UniversalDate.extend("sap.ui.core.date.Gregorian", /** @lends sap.ui.core.date.Date.prototype */ {
		constructor: function() {
			this.oDate = this.createDate(Date, arguments);
			this.sCalendarType = sap.ui.core.CalendarType.Gregorian;
		}
	});
	
	Gregorian.UTC = function() {
		return Date.UTC.apply(Date, arguments);
	};
	
	Gregorian.now = function() {
		return Date.now();
	};

	Gregorian.prototype.getWeek = function() {
		return this._calculateWeekNumber(this.oDate);
	};
	Gregorian.prototype.getUTCWeek = function() {
		return this._calculateWeekNumber(this.oDate, {UTC: true});
	};
	
	/**
	 * Calculates the week number in year of the given date.
	 *
	 * The first week of a year is calculated differently depending on the locale:
	 *  1. en-US: The first week of a year starts with 1st, January. Therefore the week beginning in December and ending in January has 2 week numbers.
	 *  In order to get the different calendar week number, set the baseYear option in oParams.
	 *  2. The rest locales: The first week of a year is the week with the year's first Thursday in it. This means 1st January is in either the first week of this year or the last week of previous year.
	 *
	 * @param {Date} oDate the date which the week number is calculated base on
	 * @param {Object} [oParams] the addtional parameters
	 * @param {boolean} [oParams.UTC=false] whether the calculation is done based on the UTC date
	 * @param {string} [oParams.locale] the locale which affects the calculation algorithm
	 * @param {number} [oParams.baseYear] the year for deciding the week number of the week which starts from December and ends in January. This option has effect only when locale is set to "en-US".
	 *
	 * @return {number} the week number of the given date
	 * @private
	 * @since 1.32.0
	 */
	Gregorian.prototype._calculateWeekNumber = function(oDate, oParams) {
		var oDefaultParams = {
			UTC: false,
			locale: sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString()
		};

		jQuery.extend(oDefaultParams, oParams);

		if (oDefaultParams.baseYear === undefined) {
			oDefaultParams.baseYear = oDefaultParams.UTC ? oDate.getUTCFullYear() : oDate.getFullYear();
		}

		var bUTC = oDefaultParams.UTC,
			iYear = oDefaultParams.baseYear,
			sLocale = oDefaultParams.locale;

		var iWeekNum = 0,
			iWeekDay = 0,
			oLocale = new Locale(sLocale),
			oLocaleData = LocaleData.getInstance(oLocale),
			iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek(),
			oProto = oDate.constructor.prototype;

		var fnSetFullYear = bUTC ? oProto.setUTCFullYear : oProto.setFullYear,
			fnSetDate = bUTC ? oProto.setUTCDate : oProto.setDate,
			fnGetDate = bUTC ? oProto.getUTCDate : oProto.getDate,
			fnGetDay = bUTC ? oProto.getUTCDay : oProto.getDay,
			fnSetMonth = bUTC ? oProto.setUTCMonth : oProto.setMonth;

		var cloneDate = function(oDate) {
			return new oDate.constructor(oDate.getTime());
		};

		if (oLocale.getLanguage() === "en" && oLocale.getRegion() === "US") {
			/*
			 * in US the week starts with Sunday
			 * The first week of the year starts with January 1st. But Dec. 31 is still in the last year
			 * So the week beginning in December and ending in January has 2 week numbers
			 */
			var oJanFirst = cloneDate(oDate);
			fnSetFullYear.apply(oJanFirst, [iYear, 0, 1]);
			iWeekDay = fnGetDay.apply(oJanFirst);

			//get the date for the same weekday like jan 1.
			var oCheckDate = cloneDate(oDate);
			fnSetDate.apply(oCheckDate, [fnGetDate.apply(oCheckDate) - fnGetDay.apply(oCheckDate) + iWeekDay]);
			iWeekNum = Math.round((oCheckDate.getTime() - oJanFirst.getTime()) / 86400000 / 7) + 1;
		} else {
			// normally the first week of the year is the one where the first Thursday of the year is
			// find Thursday of this week
			// if the checked day is before the 1. day of the week use a day of the previous week to check
			var oThursday = cloneDate(oDate);
			fnSetDate.apply(oThursday, [fnGetDate.apply(oThursday) - iFirstDayOfWeek]);

			iWeekDay = fnGetDay.apply(oThursday);
			fnSetDate.apply(oThursday, [fnGetDate.apply(oThursday) - iWeekDay + 4]);

			var oFirstDayOfYear = cloneDate(oThursday);
			fnSetMonth.apply(oFirstDayOfYear, [0, 1]);

			iWeekDay = fnGetDay.apply(oFirstDayOfYear);

			var iAddDays = 0;
			if (iWeekDay > 4) {
				iAddDays = 7; // first day of year is after Thursday, so first Thursday is in the next week
			}
			var oFirstThursday = cloneDate(oFirstDayOfYear);
			fnSetDate.apply(oFirstThursday, [1 - iWeekDay + 4 + iAddDays]);

			iWeekNum = Math.round((oThursday.getTime() - oFirstThursday.getTime()) / 86400000 / 7) + 1;
		}

		return iWeekNum;
	};
	
	return Gregorian;

});