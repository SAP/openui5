/*!
 * ${copyright}
 */

// Provides class sap.ui.core.date.Buddhist
sap.ui.define(['./UniversalDate', '../CalendarType', './_Calendars'],
	function(UniversalDate, CalendarType, _Calendars) {
	"use strict";

	/**
	 * The Buddhist date class
	 *
	 * @class
	 * The Buddhist date implements the Thai solar calendar (BE - Buddhist Era). In this calendar
	 * the year is offset by 543 compared to the Gregorian calendar.
	 * e.g. Year 2022 CE corresponds to 2565 BE
	 *
	 *
	 * Before 1941 CE the year start was 1st of April, so Januar to March belong to the previous year.
	 * <pre>
	 * Month | 1-3 | 4-6 | 7-9 | 10-12 | 1-3 | 4-6 | 7-9 | 10-12 | 1-3 | 4-6 | 7-9 | 10-12 | 1-3 | 4-6 | 7-9 | 10-12 |
	 * CE    |       1939              |           1940          |         1941            |          1942           |
	 * BE     2481 |        2482             |      2483         |         2484            |          2485           |
	 * </pre>
	 *
	 * @private
	 * @alias sap.ui.core.date.Buddhist
	 * @extends sap.ui.core.date.UniversalDate
	 */
	var Buddhist = UniversalDate.extend("sap.ui.core.date.Buddhist", /** @lends sap.ui.core.date.Buddhist.prototype */ {
		constructor: function() {
			var aArgs = arguments;
			if (aArgs.length > 1) {
				aArgs = toGregorianArguments(aArgs);
			}
			this.oDate = this.createDate(Date, aArgs);
			this.sCalendarType = CalendarType.Buddhist;
		}
	});

	Buddhist.UTC = function() {
		var aArgs = toGregorianArguments(arguments);
		return Date.UTC.apply(Date, aArgs);
	};

	Buddhist.now = function() {
		return Date.now();
	};

	/**
	 * Find the matching Buddhist date for the given gregorian date
	 *
	 * @param {{year: int, month: int, day: int}} oGregorian Gregorian date
	 * @return {{year: int, month: int, day: int}} the resulting Buddhist date
	 */
	function toBuddhist(oGregorian) {
		var iEraStartYear = UniversalDate.getEraStartDate(CalendarType.Buddhist, 0).year,
			iYear = oGregorian.year - iEraStartYear + 1;
		// Before 1941 new year started on 1st of April
		if (oGregorian.year < 1941 && oGregorian.month < 3) {
			iYear -= 1;
		}
		if (oGregorian.year === null) {
			iYear = undefined;
		}
		return {
			year: iYear,
			month: oGregorian.month,
			day: oGregorian.day
		};
	}

	/**
	 * Calculate gregorian year from Buddhist year and month
	 *
	 * @param {{year: int, month: int, day: int}} oBuddhist Buddhist date
	 * @return {{year: int, month: int, day: int}} the resulting Gregorian date
	 */
	function toGregorian(oBuddhist) {
		var iEraStartYear = UniversalDate.getEraStartDate(CalendarType.Buddhist, 0).year,
			iYear = oBuddhist.year + iEraStartYear - 1;
		// Before 1941 new year started on 1st of April
		if (iYear < 1941 && oBuddhist.month < 3) {
			iYear += 1;
		}
		if (oBuddhist.year === null) {
			iYear = undefined;
		}
		return {
			year: iYear,
			month: oBuddhist.month,
			day: oBuddhist.day
		};
	}

	/**
	 * Convert arguments array from Buddhist date to Gregorian data.
	 *
	 * @param {int[]} aArgs Array with year, month, day (optional) according to Buddhist calendar
	 * @returns {int[]} Array with year, month, day according to Gregorian calendar
	 */
	function toGregorianArguments(aArgs) {
		var oBuddhist, oGregorian;
		oBuddhist = {
			year: aArgs[0],
			month: aArgs[1],
			day: aArgs[2] !== undefined ? aArgs[2] : 1
		};
		oGregorian = toGregorian(oBuddhist);
		aArgs[0] = oGregorian.year;
		return aArgs;
	}

	/**
	 * Get the Buddhist year from this.oDate
	 *
	 * @return {object}
	 */
	Buddhist.prototype._getBuddhist = function() {
		var oGregorian = {
			year: this.oDate.getFullYear(),
			month: this.oDate.getMonth(),
			day: this.oDate.getDate()
		};
		return toBuddhist(oGregorian);
	};

	/**
	 * Set the Buddhist year to this.oDate
	 */
	Buddhist.prototype._setBuddhist = function(oBuddhist) {
		var oGregorian = toGregorian(oBuddhist);
		return this.oDate.setFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	/**
	 * Get the Buddhist year from this.oDate in UTC
	 *
	 * @return {object}
	 */
	Buddhist.prototype._getUTCBuddhist = function() {
		var oGregorian = {
			year: this.oDate.getUTCFullYear(),
			month: this.oDate.getUTCMonth(),
			day: this.oDate.getUTCDate()
		};
		return toBuddhist(oGregorian);
	};

	/**
	 * Set the Buddhist year to this.oDate in UTC
	 */
	Buddhist.prototype._setUTCBuddhist = function(oBuddhist) {
		var oGregorian = toGregorian(oBuddhist);
		return this.oDate.setUTCFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	/*
	 * Override relevant getters/setters
	 */
	Buddhist.prototype.getYear = function() {
		return this._getBuddhist().year;
	};
	Buddhist.prototype.getFullYear = function() {
		return this._getBuddhist().year;
	};
	Buddhist.prototype.getUTCFullYear = function() {
		return this._getUTCBuddhist().year;
	};
	Buddhist.prototype.setYear = function(iYear) {
		var oBuddhist = this._getBuddhist();
		oBuddhist.year = iYear;
		return this._setBuddhist(oBuddhist);
	};
	Buddhist.prototype.setFullYear = function(iYear, iMonth, iDay) {
		var oBuddhist = this._getBuddhist();
		oBuddhist.year = iYear;
		if (iMonth !== undefined) {
			oBuddhist.month = iMonth;
		}
		if (iDay !== undefined) {
			oBuddhist.day = iDay;
		}
		return this._setBuddhist(oBuddhist);
	};
	Buddhist.prototype.setUTCFullYear = function(iYear, iMonth, iDay) {
		var oBuddhist = this._getUTCBuddhist();
		oBuddhist.year = iYear;
		if (iMonth !== undefined) {
			oBuddhist.month = iMonth;
		}
		if (iDay !== undefined) {
			oBuddhist.day = iDay;
		}
		return this._setUTCBuddhist(oBuddhist);
	};

	_Calendars.set(CalendarType.Buddhist, Buddhist);

	return Buddhist;

});
