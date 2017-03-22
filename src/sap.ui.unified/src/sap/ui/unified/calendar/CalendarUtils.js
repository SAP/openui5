/*!
 * ${copyright}
 */

/**
 * Calendar Utility Class
 *
 * @namespace
 * @name sap.ui.unified.calendar
 * @public
 */

// Provides class sap.ui.unified.caledar.CalendarUtils
sap.ui.define(['jquery.sap.global', 'sap/ui/core/date/UniversalDate'],
	function (jQuery, UniversalDate) {
		"use strict";

		// Static class

		/**
		 * @alias sap.ui.unified.caledar.CalendarUtils
		 * @namespace
		 * @private
		 */
		var CalendarUtils = {};

		/**
		 * The maximum ECMAScript Date converted to milliseconds.
		 * @type {number} milliseconds
		 * @private
		 */
		CalendarUtils.MAX_MILLISECONDS = 8640000000000000;

		/**
		 * Creates a Date in local timezone from UTC timezone
		 * @param {Date} oDate in UTC timezone
		 * @param {boolean} bTime if set the time part of the date will be used too, otherwise it will be initial
		 * @return {Date} in local timezone
		 * @private
		 */
		CalendarUtils._createLocalDate = function (oDate, bTime) {

			var oLocaleDate;

			if (oDate) {
				var oMyDate;

				if (oDate instanceof UniversalDate) {
					oMyDate = oDate.getJSDate();
				} else {
					oMyDate = oDate;
				}

				oLocaleDate = new Date(oMyDate.getUTCFullYear(), oMyDate.getUTCMonth(), oMyDate.getUTCDate());
				if (oMyDate.getFullYear() < 1000) {
					oLocaleDate.setFullYear(oMyDate.getFullYear());
				}

				if (bTime) {
					oLocaleDate.setHours(oMyDate.getUTCHours());
					oLocaleDate.setMinutes(oMyDate.getUTCMinutes());
					oLocaleDate.setSeconds(oMyDate.getUTCSeconds());
					oLocaleDate.setMilliseconds(oMyDate.getUTCMilliseconds());
				}
			}

			return oLocaleDate;

		};

		/**
		 * Creates a Date in UTC timezone from local timezone
		 * @param {Date} oDate in local timezone
		 * @param {boolean} bTime if set the time part of the date will be used too, otherwise it will be initial
		 * @return {Date} in UTC timezone
		 * @private
		 */
		CalendarUtils._createUTCDate = function (oDate, bTime) {

			var oUTCDate;

			if (oDate) {
				var oMyDate;

				if (oDate instanceof UniversalDate) {
					oMyDate = oDate.getJSDate();
				} else {
					oMyDate = oDate;
				}

				oUTCDate = new Date(Date.UTC(oMyDate.getFullYear(), oMyDate.getMonth(), oMyDate.getDate()));
				if (oMyDate.getFullYear() < 1000) {
					oUTCDate.setUTCFullYear(oMyDate.getFullYear());
				}

				if (bTime) {
					oUTCDate.setUTCHours(oMyDate.getHours());
					oUTCDate.setUTCMinutes(oMyDate.getMinutes());
					oUTCDate.setUTCSeconds(oMyDate.getSeconds());
					oUTCDate.setUTCMilliseconds(oMyDate.getMilliseconds());
				}
			}

			return oUTCDate;

		};

		/**
		 * Creates a Date in UTC timezone from local timezone
		 * @param {Date} oDate in local timezone
		 * @param {sap.ui.core.CalendarType} sCalendarType the type of the used calendar
		 * @param {boolean} bTime if set the time part of the date will be used too, otherwise it will be initial
		 * @return {UniversalDate} in UTC timezone
		 * @private
		 */
		CalendarUtils._createUniversalUTCDate = function (oDate, sCalendarType, bTime) {

			var oUTCDate;

			if (sCalendarType) {
				oUTCDate = UniversalDate.getInstance(this._createUTCDate(oDate, bTime), sCalendarType);
			} else {
				oUTCDate = new UniversalDate(this._createUTCDate(oDate, bTime).getTime()); // use getTime() because IE and FF can not parse dates < 0100.01.01
			}

			return oUTCDate;

		};

		/**
		 * Calculates the week number for a date
		 * @param {Date} oDate date to get week number
		 * @param {int} iYear year for the week number. (In en-US the week number for the last Days in December depends on the year.)
		 * @param {string} sLocale used locale
		 * @param {object} oLocaleData locale date for used locale
		 * @return {int} week number
		 * @private
		 */
		CalendarUtils.calculateWeekNumber = function (oDate, iYear, sLocale, oLocaleData) {

			var iWeekNum = 0;
			var iWeekDay = 0;
			var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
			var oLocale = new sap.ui.core.Locale(sLocale);

			// search Locale for containing "en-US", since sometimes
			// when any user settings have been defined, subtag "sapufmt" is added to the locale name
			// this is described inside sap.ui.core.Configuration file
			if (oLocale && (oLocale.getLanguage() == 'en' && oLocale.getRegion() == 'US')) {
				/*
				 * in US the week starts with Sunday
				 * The first week of the year starts with January 1st. But Dec. 31 is still in the last year
				 * So the week beginning in December and ending in January has 2 week numbers
				 */
				var oJanFirst = new UniversalDate(oDate.getTime());
				oJanFirst.setUTCFullYear(iYear, 0, 1);
				iWeekDay = oJanFirst.getUTCDay();

				//get the date for the same weekday like jan 1.
				var oCheckDate = new UniversalDate(oDate.getTime());
				oCheckDate.setUTCDate(oCheckDate.getUTCDate() - oCheckDate.getUTCDay() + iWeekDay);

				iWeekNum = Math.round((oCheckDate.getTime() - oJanFirst.getTime()) / 86400000 / 7) + 1;

			} else {
				// normally the first week of the year is the one where the first Thursday of the year is
				// find Thursday of this week
				// if the checked day is before the 1. day of the week use a day of the previous week to check
				var oThursday = new UniversalDate(oDate.getTime());
				oThursday.setUTCDate(oThursday.getUTCDate() - iFirstDayOfWeek);
				iWeekDay = oThursday.getUTCDay();
				oThursday.setUTCDate(oThursday.getUTCDate() - iWeekDay + 4);

				var oFirstDayOfYear = new UniversalDate(oThursday.getTime());
				oFirstDayOfYear.setUTCMonth(0, 1);
				iWeekDay = oFirstDayOfYear.getUTCDay();
				var iAddDays = 0;
				if (iWeekDay > 4) {
					iAddDays = 7; // first day of year is after Thursday, so first Thursday is in the next week
				}
				var oFirstThursday = new UniversalDate(oFirstDayOfYear.getTime());
				oFirstThursday.setUTCDate(1 - iWeekDay + 4 + iAddDays);

				iWeekNum = Math.round((oThursday.getTime() - oFirstThursday.getTime()) / 86400000 / 7) + 1;

			}

			return iWeekNum;

		};

		/**
		 * Retrieves the first date of the same week in which is the given date.
		 * This function works with date values in UTC to produce timezone agnostic results.
		 * <br><br>
		 * The US weeks at the end of December and at the beginning of January(53th and 0th), are not considered.
		 * If a given date is in the beginning of January (e.g. Friday, 2 Jan 2015, week 0), the function will return
		 * week start date in the previous year(e.g. Sunday, 28 Dec 2014, week 53).
		 *
		 * @param {Date} oDate the input date for which we search the first week date.
		 * This date is considered as is (no UTC conversion, time cut etc).
		 * @returns {Date} first date of the same week as the given <code>oDate</code> in local timezone.
		 * @public
		 */
		CalendarUtils.getFirstDateOfWeek = function (oDate) {
			var oUniversalDate = new UniversalDate(oDate.getTime()),
				oFirstDateOfWeek,
				oWeek;

			oWeek = UniversalDate.getWeekByDate(oUniversalDate.getCalendarType(), oUniversalDate.getUTCFullYear(),
				oUniversalDate.getUTCMonth(), oUniversalDate.getUTCDate());

			if (oWeek.week === 0 && sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().getRegion() === "US") {
				oWeek.year--;
				oWeek.week = 52;
			}
			oFirstDateOfWeek = UniversalDate.getFirstDateOfWeek(oUniversalDate.getCalendarType(), oWeek.year, oWeek.week);

			return new UniversalDate(Date.UTC(oFirstDateOfWeek.year, oFirstDateOfWeek.month, oFirstDateOfWeek.day,
				oDate.getUTCHours(), oDate.getUTCMinutes(), oDate.getUTCSeconds())).getJSDate();
		};

		/**
		 * Gets the first day of a given month.
		 * This function works with date values in UTC to produce timezone agnostic results.
		 *
		 * @param {Date} oDate JavaScript date
		 * @returns {Date} JavaScript date corresponding to the first date of the month
		 * @public
		 */
		CalendarUtils.getFirstDateOfMonth = function(oDate) {
			var oNewDate = new UniversalDate(oDate.getTime());
			oNewDate.setUTCDate(1);

			return oNewDate;
		};

		/**
		 * Calculates the number of weeks for a given year using the current locale settings
		 * @param {number} iYear The target year of interest in format (YYYY)
		 * @returns {number} The number of weeks for the given year
		 * @private
		 */
		CalendarUtils._getNumberOfWeeksForYear = function (iYear) {
			var sLocale = sap.ui.getCore().getConfiguration().getFormatLocale(),
				oLocaleData = sap.ui.core.LocaleData.getInstance(new sap.ui.core.Locale(sLocale)),
				o1stJan = new Date(Date.UTC(iYear, 0, 1)),
				i1stDay = o1stJan.getUTCDay(),
				iNumberOfWeeksInYear = 52;

			//This is valid for all the regions where Sunday is the first day of the week
			if (oLocaleData.getFirstDayOfWeek() === 0) {
				if (i1stDay === 5 || i1stDay === 6) {
					iNumberOfWeeksInYear = 53;
				}
			} else {
				if (i1stDay === 3 || i1stDay === 4) {
					iNumberOfWeeksInYear = 53;
				}
			}

			return iNumberOfWeeksInYear;
		};

		/**
		 * Determines if the given dates' months differ, including same months from different years.
		 *
		 * @param {Date} oDate1 JavaScript date
		 * @param {Date} oDate2 JavaScript date
		 * @return {boolean} true if the given dates' months differ
		 * @public
		 */
		CalendarUtils.monthsDiffer = function(oDate1, oDate2) {
			return (oDate1.getMonth() !== oDate2.getMonth() || oDate1.getFullYear() !== oDate2.getFullYear());
		};

		/**
		 * Checks in UTC mode if the corresponding date is last in a month.
		 * @param {UniversalDate} Date
		 * @returns {boolean} true if the next date is bigger or not regarding the selected one.
		 * @public
		 */
		CalendarUtils.isDateLastInMonth = function(oDate) {
			var oNextDay = new Date(oDate.getTime() + 24 * 60 * 60 * 1000);
			return oNextDay.getUTCDate() < oDate.getUTCDate();
		};

		/**
		 * Returns the last day in a month
		 * @param {Date} local date
		 * @returns {Date } the JS Date corresponding to the last day for the given month
		 * @private
		 */
		CalendarUtils._getLastDayInMonth = function(oDate) {
			var oUniversalDate = this._createUniversalUTCDate(oDate);

			oUniversalDate.setUTCMonth(oUniversalDate.getUTCMonth() + 1);
			oUniversalDate.setUTCDate(0);

			return this._createLocalDate(oUniversalDate);
		};

		return CalendarUtils;

	}, /* bExport= */ true);
