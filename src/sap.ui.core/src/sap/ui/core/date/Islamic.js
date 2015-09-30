/*!
 * ${copyright}
 */

// Provides class sap.ui.core.date.Islamic
sap.ui.define(['jquery.sap.global', './UniversalDate'],
	function(jQuery, UniversalDate) {
	"use strict";


	/**
	 * The Islamic date class
	 *
	 * @class
	 * The islamic date does conversion of day, month and year values based on tabular data indicating the start of a month.
	 * In case no tabular data is available for the date, a fallback calculated date will be used.
	 *
	 * @private
	 * @alias sap.ui.core.date.Islamic
	 */
	var Islamic = UniversalDate.extend("sap.ui.core.date.Islamic", /** @lends sap.ui.core.date.Date.prototype */ {
		constructor: function() {
			var aArgs = arguments;
			if (aArgs.length > 1) {
				aArgs = toGregorianArguments(aArgs);
			}
			this.oDate = this.createDate(Date, aArgs);
			this.sCalendarType = sap.ui.core.CalendarType.Islamic;
		}
	});

	Islamic.UTC = function() {
		var aArgs = toGregorianArguments(arguments);
		return Date.UTC.apply(Date, aArgs);
	};

	Islamic.now = function() {
		return Date.now();
	};

	var BASE_YEAR = 1400, // used for 2 digits "year" related method
		GREGORIAN_EPOCH_DAYS = 1721425.5, // Julian days since noon on January 1, 4713 BC
		ISLAMIC_EPOCH_DAYS = 1948439.5,   // Julian days since noon on January 1, 4713 BC
		ISLAMIC_MILLIS = -42521587200000, // 7/16/622
		ONE_DAY = 86400000;
	
	var oCustomizationMap = null;
	
	/**
	 * Calculate islamic date from gregorian
	 * 
	 * @param {object} oGregorian a JS object containing day, month and year in the gregorian calendar
	 * @private
	 */
	function toIslamic(oGregorian) {
		var iGregorianYear = oGregorian.year,
			iGregorianMonth = oGregorian.month,
			iGregorianDay = oGregorian.day;

		var iLeapAdj = 0;
		if ((iGregorianMonth + 1) > 2) {
			iLeapAdj = (isGregorianLeapYear(iGregorianYear) ? -1 : -2);
		}
		var iJulianDay = (GREGORIAN_EPOCH_DAYS - 1) + (365 * (iGregorianYear - 1)) + Math.floor((iGregorianYear - 1) / 4)
			+ (-Math.floor((iGregorianYear - 1) / 100)) + Math.floor((iGregorianYear - 1) / 400)
			+ Math.floor((((367 * (iGregorianMonth + 1)) - 362) / 12)
			+ iLeapAdj + iGregorianDay);

		iJulianDay = Math.floor(iJulianDay) + 0.5;

		var iDays = iJulianDay - ISLAMIC_EPOCH_DAYS;

		// guess the month start
		var iMonths = Math.floor(iDays / 29.530588853); // day/CalendarAstronomer.SYNODIC_MONTH

		/*
		 * Always also check the next month, since customization can
		 * differ. It can differ for not more than 3 days. so that
		 * checking the next month is enough.
		 */
		iMonths++;

		/*
		 * Check the true month start for the given month. If it is
		 * later, check the previous month, until a suitable is found.
		 */
		while (getCustomMonthStartDays(iMonths) > iDays) {
			iMonths--;
		}

		var iIslamicYear = Math.floor(iMonths / 12) + 1;
		var iIslamicMonth = iMonths % 12;
		var iIslamicDay = (iDays - getCustomMonthStartDays(12 * (iIslamicYear - 1) + iIslamicMonth)) + 1;

		return {
			day: iIslamicDay,
			month: iIslamicMonth,
			year: iIslamicYear
		};
	}
	
	/**
	 * Calculate gregorian date from islamic
	 * 
	 * @param {object} oIslamic a JS object containing day, month and year in the islamic calendar
	 * @private
	 */
	function toGregorian(oIslamic) {
		var iIslamicYear = oIslamic.year,
			iIslamicMonth = oIslamic.month,
			iIslamicDate = oIslamic.day,
			iJulianDay = iIslamicDate + getCustomMonthStartDays(12 * (iIslamicYear - 1) + iIslamicMonth) + ISLAMIC_EPOCH_DAYS - 1,
			iJulianDayNoon = Math.floor(iJulianDay - 0.5) + 0.5,
			iDaysSinceGregorianEpoch = iJulianDayNoon - GREGORIAN_EPOCH_DAYS,
			iQuadricent = Math.floor(iDaysSinceGregorianEpoch / 146097),
			iQuadricentNormalized = mod(iDaysSinceGregorianEpoch, 146097),
			iCent = Math.floor(iQuadricentNormalized / 36524),
			iCentNormalized = mod(iQuadricentNormalized, 36524),
			iQuad = Math.floor(iCentNormalized / 1461),
			iQuadNormalized = mod(iCentNormalized, 1461),
			iYearIndex = Math.floor(iQuadNormalized / 365),
			iYear = (iQuadricent * 400) + (iCent * 100) + (iQuad * 4) + iYearIndex;

		if (!(iCent == 4 || iYearIndex == 4)) {
			iYear++;
		}

		var iGregorianYearStartDays = GREGORIAN_EPOCH_DAYS + (365 * (iYear - 1)) + Math.floor((iYear - 1) / 4)
			- ( Math.floor((iYear - 1) / 100)) + Math.floor((iYear - 1) / 400);

		var iDayOfYear = iJulianDayNoon - iGregorianYearStartDays;

		var tjd = (GREGORIAN_EPOCH_DAYS - 1) + (365 * (iYear - 1)) + Math.floor((iYear - 1) / 4)
			- ( Math.floor((iYear - 1) / 100)) + Math.floor((iYear - 1) / 400) + Math.floor((739 / 12)
			+ ( (isGregorianLeapYear(iYear) ? -1 : -2)) + 1);

		var iLeapAdj = 0;
		if (iJulianDayNoon < tjd) {
			iLeapAdj = 0;
		} else {
			iLeapAdj = isGregorianLeapYear(iYear) ? 1 : 2;
		}

		var iMonth = Math.floor((((iDayOfYear + iLeapAdj) * 12) + 373) / 367);

		var tjd2 = (GREGORIAN_EPOCH_DAYS - 1) + (365 * (iYear - 1))
			+ Math.floor((iYear - 1) / 4) - (Math.floor((iYear - 1) / 100))
			+ Math.floor((iYear - 1) / 400);

		var iLeapAdj2 = 0;
		if (iMonth > 2) {
			iLeapAdj2 = isGregorianLeapYear(iYear) ? -1 : -2;
		}
		tjd2 += Math.floor((((367 * iMonth) - 362) / 12) + iLeapAdj2 + 1);

		var iDay = (iJulianDayNoon - tjd2) + 1;

		return {
			day: iDay, 
			month: iMonth - 1, 
			year: iYear
		};
	}
	
	function toGregorianArguments(aArgs) {
		var aGregorianArgs = Array.prototype.slice.call(aArgs),
			oIslamic, oGregorian;
		oIslamic = {
			year: aArgs[0],
			month: aArgs[1],
			day: aArgs[2] !== undefined ? aArgs[2] : 1
		};
		oGregorian = toGregorian(oIslamic);
		aGregorianArgs[0] = oGregorian.year;
		aGregorianArgs[1] = oGregorian.month;
		aGregorianArgs[2] = oGregorian.day;		
		return aGregorianArgs;
	}
	
	function initCustomizationMap() {
		var sDateFormat,
			oCustomizationJSON;

		oCustomizationMap = {};
	
		sDateFormat = sap.ui.getCore().getConfiguration().getFormatSettings().getLegacyDateFormat();
		oCustomizationJSON = sap.ui.getCore().getConfiguration().getFormatSettings().getLegacyDateCalendarCustomizing();
		oCustomizationJSON = oCustomizationJSON || [];
	
		if (!sDateFormat && !oCustomizationJSON.length) {//working with no customization
			jQuery.sap.log.info("No calendar customizations.");
			return;
		}
	
		if ((sDateFormat && !oCustomizationJSON.length) || (!sDateFormat && oCustomizationJSON.length)) {
			jQuery.sap.log.warning("There is a inconsistency between customization data [" + JSON.stringify(oCustomizationJSON) +
			"] and the date format [" + sDateFormat + "]. Calendar customization won't be used.");
			return;
		}
	
		oCustomizationJSON.forEach(function (oEntry) {
			if (oEntry.dateFormat === sDateFormat) {
				var date = parseDate(oEntry.gregDate);
				var iGregorianDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
				var iMillis = iGregorianDate.getTime();
				var iIslamicMonthStartDays = (iMillis - ISLAMIC_MILLIS) / ONE_DAY;
	
				date = parseDate(oEntry.islamicMonthStart);
				var iIslamicMonths = (date.year - 1) * 12 + date.month - 1;
	
				oCustomizationMap[iIslamicMonths] = iIslamicMonthStartDays;
			}
		});
		jQuery.sap.log.info("Working with date format: [" + sDateFormat + "] and customization: " + JSON.stringify(oCustomizationJSON));
	}

	function parseDate(sDate) {
		return {
			year: parseInt(sDate.substr(0, 4), 10),
			month: parseInt(sDate.substr(4, 2), 10),
			day: parseInt(sDate.substr(6, 2), 10)
		};
	}

	function getCustomMonthStartDays(months) {
		if (!oCustomizationMap) {
			initCustomizationMap();
		}
		var iIslamicMonthStartDays = oCustomizationMap[months];
		if (!iIslamicMonthStartDays) {
			var year = Math.floor(months / 12) + 1;
			var month = months % 12;
			iIslamicMonthStartDays = monthStart(year, month);
		}
		return iIslamicMonthStartDays;
	}

	function monthStart(year, month) {
		return Math.ceil(29.5 * month) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30.0);
	}

	function mod(a, b) {
		return a - (b * Math.floor(a / b));
	}

	function isGregorianLeapYear(iYear) {
		return !(iYear % 400) || (!(iYear % 4) && !!(iYear % 100));
	}

	/**
	 * Get the islamic date from the this.oDate
	 */
	Islamic.prototype._getIslamic = function() {
		return toIslamic({
			day: this.oDate.getDate(),
			month: this.oDate.getMonth(),
			year: this.oDate.getFullYear()
		});
	};
	
	/**
	 * Set the islamic date to the current this.oDate object
	 * @param {object} oIslamic a JS object containing day, month and year in the islamic calendar
	 */
	Islamic.prototype._setIslamic = function(oIslamic) {
		var oGregorian = toGregorian(oIslamic);
		this.oDate.setFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
		return this;
	};
	
	/**
	 * Get the islamic date from the this.oDate
	 */
	Islamic.prototype._getUTCIslamic = function() {
		return toIslamic({
			day: this.oDate.getUTCDate(),
			month: this.oDate.getUTCMonth(),
			year: this.oDate.getUTCFullYear()
		});
	};
	
	/**
	 * Set the islamic date to the current this.oDate object
	 * @param {object} oIslamic a JS object containing day, month and year in the islamic calendar
	 */
	Islamic.prototype._setUTCIslamic = function(oIslamic) {
		var oGregorian = toGregorian(oIslamic);
		this.oDate.setUTCFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
		return this;
	};
	
	/*
	 * Override setters and getters specific to the islamic date
	 */
	Islamic.prototype.getDate = function(iDate) {
		return this._getIslamic().day;
	};
	Islamic.prototype.getMonth = function() {
		return this._getIslamic().month;
	};
	Islamic.prototype.getYear = function() {
		return this._getIslamic().year - BASE_YEAR;
	};
	Islamic.prototype.getFullYear = function() {
		return this._getIslamic().year;
	};
	Islamic.prototype.setDate = function(iDate) {
		var oIslamic = this._getIslamic();
		oIslamic.day = iDate;
		return this._setIslamic(oIslamic);
	};
	Islamic.prototype.setMonth = function(iMonth, iDay) {
		var oIslamic = this._getIslamic();
		oIslamic.month = iMonth;
		if (iDay !== undefined) {
			oIslamic.day = iDay;
		}
		return this._setIslamic(oIslamic);
	};
	Islamic.prototype.setYear = function(iYear) {
		var oIslamic = this._getIslamic();
		oIslamic.year = iYear + BASE_YEAR;
		return this._setIslamic(oIslamic);
	};
	Islamic.prototype.setFullYear = function(iYear, iMonth, iDay) {
		var oIslamic = this._getIslamic();
		oIslamic.year = iYear;
		if (iMonth !== undefined) {
			oIslamic.month = iMonth;
		}
		if (iDay !== undefined) {
			oIslamic.day = iDay;
		}
		return this._setIslamic(oIslamic);
	};
	Islamic.prototype.getUTCDate = function(iDate) {
		return this._getUTCIslamic().day;
	};
	Islamic.prototype.getUTCMonth = function() {
		return this._getUTCIslamic().month;
	};
	Islamic.prototype.getUTCFullYear = function() {
		return this._getUTCIslamic().year;
	};
	Islamic.prototype.setUTCDate = function(iDate) {
		var oIslamic = this._getUTCIslamic();
		oIslamic.day = iDate;
		return this._setUTCIslamic(oIslamic);
	};
	Islamic.prototype.setUTCMonth = function(iMonth, iDay) {
		var oIslamic = this._getUTCIslamic();
		oIslamic.month = iMonth;
		if (iDay !== undefined) {
			oIslamic.day = iDay;
		}
		return this._setUTCIslamic(oIslamic);
	};
	Islamic.prototype.setUTCFullYear = function(iYear, iMonth, iDay) {
		var oIslamic = this._getUTCIslamic();
		oIslamic.year = iYear;
		if (iMonth !== undefined) {
			oIslamic.month = iMonth;
		}
		if (iDay !== undefined) {
			oIslamic.day = iDay;
		}
		return this._setUTCIslamic(oIslamic);
	};
	
	return Islamic;
	
});