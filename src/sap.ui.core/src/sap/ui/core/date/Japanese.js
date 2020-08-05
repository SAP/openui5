/*!
 * ${copyright}
 */

// Provides class sap.ui.core.date.Japanese
sap.ui.define(['./UniversalDate', '../CalendarType', './_Calendars'],
	function(UniversalDate, CalendarType, _Calendars) {
	"use strict";


	/**
	 * The Japanese date class
	 *
	 * @class
	 * The Japanese date adds support for era, by returning the CLDR era type in the getEra method and calculating
	 * the year dependent on the current era.
	 *
	 * For the constructor and the UTC method, for the year parameter the following rules apply:
	 * - A year less than 100 will be treated as year of the current emperor era
	 * - A year equal or more than 100 will be treated as a gregorian year
	 * - An array with two entries will be treated as era and emperor year
	 *
	 * @private
	 * @alias sap.ui.core.date.Japanese
	 * @extends sap.ui.core.date.UniversalDate
	 */
	var Japanese = UniversalDate.extend("sap.ui.core.date.Japanese", /** @lends sap.ui.core.date.Japanese.prototype */ {
		constructor: function() {
			var aArgs = arguments;
			if (aArgs.length > 1) {
				aArgs = toGregorianArguments(aArgs);
			}
			this.oDate = this.createDate(Date, aArgs);
			this.sCalendarType = CalendarType.Japanese;
		}
	});

	Japanese.UTC = function() {
		var aArgs = toGregorianArguments(arguments);
		return Date.UTC.apply(Date, aArgs);
	};

	Japanese.now = function() {
		return Date.now();
	};

	/**
	 * Find the matching japanese date for the given gregorian date
	 *
	 * @param {object} oGregorian
	 * @return {object}
	 */
	function toJapanese(oGregorian) {
		var iEra = UniversalDate.getEraByDate(CalendarType.Japanese, oGregorian.year, oGregorian.month, oGregorian.day),
			iEraStartYear = UniversalDate.getEraStartDate(CalendarType.Japanese, iEra).year;
		return {
			era: iEra,
			year: oGregorian.year - iEraStartYear + 1,
			month: oGregorian.month,
			day: oGregorian.day
		};
	}

	/**
	 * Calculate gregorian year from japanes era and year
	 *
	 * @param {object} oJapanese
	 * @return {int}
	 */
	function toGregorian(oJapanese) {
		var iEraStartYear = UniversalDate.getEraStartDate(CalendarType.Japanese, oJapanese.era).year;
		return {
			year: iEraStartYear + oJapanese.year - 1,
			month: oJapanese.month,
			day: oJapanese.day
		};
	}

	/**
	 * Convert arguments array from japanese date to gregorian data
	 *
	 * @param {object} oJapanese
	 * @return {int}
	 */
	function toGregorianArguments(aArgs) {
		var oJapanese, oGregorian,
			iEra,
			vYear = aArgs[0];
		if (typeof vYear == "number") {
			if (vYear >= 100) {
				// Year greater than 100 will be treated as gregorian year
				return aArgs;
			} else {
				// Year less than 100 is emperor year in the current era
				iEra = UniversalDate.getCurrentEra(CalendarType.Japanese);
				vYear = [iEra, vYear];
			}
		} else if (!Array.isArray(vYear)) {
			// Invalid year
			vYear = [];
		}

		oJapanese = {
			era: vYear[0],
			year: vYear[1],
			month: aArgs[1],
			day: aArgs[2] !== undefined ? aArgs[2] : 1
		};
		oGregorian = toGregorian(oJapanese);
		aArgs[0] = oGregorian.year;
		return aArgs;
	}

	/**
	 * Get the japanese era/year from this.oDate
	 *
	 * @return {object}
	 */
	Japanese.prototype._getJapanese = function() {
		var oGregorian = {
			year: this.oDate.getFullYear(),
			month: this.oDate.getMonth(),
			day: this.oDate.getDate()
		};
		return toJapanese(oGregorian);
	};

	/**
	 * Set the japanese era/year to this.oDate
	 */
	Japanese.prototype._setJapanese = function(oJapanese) {
		var oGregorian = toGregorian(oJapanese);
		return this.oDate.setFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	/**
	 * Get the japanese era/year from this.oDate in UTC
	 *
	 * @return {object}
	 */
	Japanese.prototype._getUTCJapanese = function() {
		var oGregorian = {
			year: this.oDate.getUTCFullYear(),
			month: this.oDate.getUTCMonth(),
			day: this.oDate.getUTCDate()
		};
		return toJapanese(oGregorian);
	};

	/**
	 * Set the japanese era/year to this.oDate in UTC
	 */
	Japanese.prototype._setUTCJapanese = function(oJapanese) {
		var oGregorian = toGregorian(oJapanese);
		return this.oDate.setUTCFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	/*
	 * Override relevant getters/setters
	 */
	Japanese.prototype.getYear = function() {
		return this._getJapanese().year;
	};
	Japanese.prototype.getFullYear = function() {
		return this._getJapanese().year;
	};
	Japanese.prototype.getEra = function() {
		return this._getJapanese().era;
	};
	Japanese.prototype.getUTCFullYear = function() {
		return this._getUTCJapanese().year;
	};
	Japanese.prototype.getUTCEra = function() {
		return this._getUTCJapanese().era;
	};
	Japanese.prototype.setYear = function(iYear) {
		var oJapanese = this._getJapanese();
		oJapanese.year = iYear;
		return this._setJapanese(oJapanese);
	};
	Japanese.prototype.setFullYear = function(iYear, iMonth, iDay) {
		var oJapanese = this._getJapanese();
		oJapanese.year = iYear;
		if (iMonth !== undefined) {
			oJapanese.month = iMonth;
		}
		if (iDay !== undefined) {
			oJapanese.day = iDay;
		}
		return this._setJapanese(oJapanese);
	};
	Japanese.prototype.setEra = function(iEra, iYear, iMonth, iDay) {
		var oEraStartDate = UniversalDate.getEraStartDate(CalendarType.Japanese, iEra),
			oJapanese = toJapanese(oEraStartDate);
		if (iYear !== undefined) {
			oJapanese.year = iYear;
		}
		if (iMonth !== undefined) {
			oJapanese.month = iMonth;
		}
		if (iDay !== undefined) {
			oJapanese.day = iDay;
		}
		return this._setJapanese(oJapanese);
	};
	Japanese.prototype.setUTCFullYear = function(iYear, iMonth, iDay) {
		var oJapanese = this._getUTCJapanese();
		oJapanese.year = iYear;
		if (iMonth !== undefined) {
			oJapanese.month = iMonth;
		}
		if (iDay !== undefined) {
			oJapanese.day = iDay;
		}
		return this._setUTCJapanese(oJapanese);
	};
	Japanese.prototype.setUTCEra = function(iEra, iYear, iMonth, iDay) {
		var oEraStartDate = UniversalDate.getEraStartDate(CalendarType.Japanese, iEra),
			oJapanese = toJapanese(oEraStartDate);
		if (iYear !== undefined) {
			oJapanese.year = iYear;
		}
		if (iMonth !== undefined) {
			oJapanese.month = iMonth;
		}
		if (iDay !== undefined) {
			oJapanese.day = iDay;
		}
		return this._setUTCJapanese(oJapanese);
	};
	Japanese.prototype.getWeek = function() {
		return UniversalDate.getWeekByDate(this.sCalendarType, this.oDate.getFullYear(), this.getMonth(), this.getDate());
	};
	Japanese.prototype.getUTCWeek = function() {
		return UniversalDate.getWeekByDate(this.sCalendarType, this.oDate.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate());
	};

	_Calendars.set(CalendarType.Japanese, Japanese);

	return Japanese;

});
