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
	function(jQuery, UniversalDate) {
	"use strict";

	// Static class

	/**
	 * @alias sap.ui.unified.caledar.CalendarUtils
	 * @namespace
	 * @private
	 */
	var CalendarUtils = {};

	/**
	 * Creates a Date in local timezone from UTC timezone
	 * @param {Date} oDate in UTC timezone
	 * @return {Date} in local timezone
	 * @private
	 */
	CalendarUtils._createLocalDate = function(oDate) {

		var oLocaleDate;

		if (oDate) {
			var oMyDate;

			if (oDate instanceof UniversalDate) {
				oMyDate = new Date(oDate.getTime());
			}else {
				oMyDate = oDate;
			}

			oLocaleDate = new Date(oMyDate.getTime() + oMyDate.getTimezoneOffset() * 60000);
		}

		return oLocaleDate;

	};

	/**
	 * Creates a Date in UTC timezone from local timezone
	 * @param {Date} oDate in local timezone
	 * @return {Date} in UTC timezone
	 * @private
	 */
	CalendarUtils._createUTCDate = function(oDate) {

		var oUTCDate;

		if (oDate) {
			var oMyDate;

			if (oDate instanceof UniversalDate) {
				oMyDate = new Date(oDate.getTime());
			}else {
				oMyDate = oDate;
			}

			oUTCDate = new Date(Date.UTC(oMyDate.getFullYear(),oMyDate.getMonth(),oMyDate.getDate()));
			if (oMyDate.getFullYear() < 1000) {
				oUTCDate.setUTCFullYear(oMyDate.getFullYear());
			}
		}

		return oUTCDate;

	};

	/**
	 * Creates a Date in UTC timezone from local timezone
	 * @param {Date} oDate in local timezone
	 * @return {UniversalDate} in UTC timezone
	 * @private
	 */
	CalendarUtils._createUniversalUTCDate = function(oDate) {

		var oUTCDate = new UniversalDate(this._createUTCDate(oDate).getTime());
		return oUTCDate;

	};

	/**
	 * Calculates the week number for a date
	 * @param {Date} oDate date to get week number
	 * @param {int} iYear year for the week number. (In en-US the week number for the last Days in December depends on the year.)
	 * @param {string} sLocale used locale
	 * @param {object} oLocaleData locale date for used locale
	 * @return {integer} week number
	 * @private
	 */
	CalendarUtils.calculateWeekNumber = function(oDate, iYear, sLocale, oLocaleData){

		var iWeekNum = 0;
		var iWeekDay = 0;
		var iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();

		if (sLocale == "en-US") {
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

		}else {
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

	return CalendarUtils;

}, /* bExport= */ true);
