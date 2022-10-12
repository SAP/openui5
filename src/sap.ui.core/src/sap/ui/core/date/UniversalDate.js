/*!
 * ${copyright}
 */

// Provides class sap.ui.core.date.UniversalDate
sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/core/Configuration',
	'sap/ui/core/Locale',
	'sap/ui/core/LocaleData',
	'./_Calendars',
	'./CalendarUtils',
	'./CalendarWeekNumbering'
], function(
	BaseObject,
	Configuration,
	Locale,
	LocaleData,
	_Calendars,
	CalendarUtils,
	CalendarWeekNumbering
) {
	"use strict";


	/**
	 * Constructor for UniversalDate.
	 *
	 * @class
	 * The UniversalDate is the base class of calendar date instances. It contains the static methods to create calendar
	 * specific instances.
	 *
	 * The member variable <code>this.oDate</code> contains the JS Date object, which is the source value of the date information.
	 * The prototype is containing getters and setters of the JS Date and is delegating them to the internal date object.
	 * Implementations for specific calendars may override methods needed for their specific calendar (e.g. getYear
	 * and getEra for Japanese emperor calendar);
	 *
	 * @private
	 * @ui5-restricted
	 * @alias sap.ui.core.date.UniversalDate
	 */
	var UniversalDate = BaseObject.extend("sap.ui.core.date.UniversalDate", /** @lends sap.ui.core.date.UniversalDate.prototype */ {
		constructor: function() {
			var clDate = UniversalDate.getClass();
			return this.createDate(clDate, arguments);
		}
	});

	UniversalDate.UTC = function() {
		var clDate = UniversalDate.getClass();
		return clDate.UTC.apply(clDate, arguments);
	};

	UniversalDate.now = function() {
		return Date.now();
	};

	UniversalDate.prototype.createDate = function(clDate, aArgs) {
		switch (aArgs.length) {
			case 0: return new clDate();
			// new Date(new Date()) is officially not supported
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
			case 1: return new clDate(aArgs[0] instanceof Date ? aArgs[0].getTime() : aArgs[0]);
			case 2: return new clDate(aArgs[0], aArgs[1]);
			case 3: return new clDate(aArgs[0], aArgs[1], aArgs[2]);
			case 4: return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3]);
			case 5: return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3], aArgs[4]);
			case 6: return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3], aArgs[4], aArgs[5]);
			case 7: return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3], aArgs[4], aArgs[5], aArgs[6]);
		}
	};

	/**
	 * Returns an instance of Date, based on the calendar type from the configuration, or as explicitly
	 * defined by parameter. The object provides all methods also known on the JavaScript Date object.
	 *
	 * Note: Prefer this method over calling <code>new UniversalDate</code> with an instance of <code>Date</code>
	 *
	 * @param {Date|sap.ui.core.date.UniversalDate} [oDate] JavaScript date object, defaults to <code>new Date()</code>
	 * @param {sap.ui.core.CalendarType} [sCalendarType] The calendar type, defaults to <code>sap.ui.getCore().getConfiguration().getCalendarType()</code>
	 * @returns {sap.ui.core.date.UniversalDate} The date instance
	 * @public
	 */
	UniversalDate.getInstance = function(oDate, sCalendarType) {
		var clDate, oInstance;
		if (oDate instanceof UniversalDate) {
			oDate = oDate.getJSDate();
		} else if (!oDate) {
			oDate = new Date();
		}

		if (isNaN(oDate.getTime())) {
			throw new Error("The given date object is invalid");
		}

		if (!sCalendarType) {
			sCalendarType = Configuration.getCalendarType();
		}
		clDate = UniversalDate.getClass(sCalendarType);
		oInstance = Object.create(clDate.prototype);
		oInstance.oDate = oDate;
		oInstance.sCalendarType = sCalendarType;
		return oInstance;
	};

	/**
	 * Returns a specific Date class, based on the calendar type from the configuration, or as explicitly
	 * defined by parameter. The object provides all methods also known on the JavaScript Date object.
	 *
	 * @param {sap.ui.core.CalendarType} sCalendarType the type of the used calendar
	 * @public
	 */
	UniversalDate.getClass = function(sCalendarType) {
		if (!sCalendarType) {
			sCalendarType = Configuration.getCalendarType();
		}
		return _Calendars.get(sCalendarType);
	};

	/*
	 * Loop through the Date class and create delegates of all Date API methods
	 */
	[
		"getDate", "getMonth", "getFullYear", "getYear", "getDay", "getHours", "getMinutes", "getSeconds", "getMilliseconds",
		"getUTCDate", "getUTCMonth", "getUTCFullYear", "getUTCDay", "getUTCHours", "getUTCMinutes", "getUTCSeconds", "getUTCMilliseconds",
		"getTime", "valueOf", "getTimezoneOffset", "toString", "toDateString",
		"setDate", "setFullYear", "setYear", "setMonth", "setHours", "setMinutes", "setSeconds", "setMilliseconds",
		"setUTCDate", "setUTCFullYear", "setUTCMonth", "setUTCHours", "setUTCMinutes", "setUTCSeconds", "setUTCMilliseconds"
	].forEach(function(sName) {
		UniversalDate.prototype[sName] = function() {
			return this.oDate[sName].apply(this.oDate, arguments);
		};
	});

	/**
	 * Returns the JS date object representing the current calendar date value.
	 *
	 * @returns {Date} The JS date object representing the current calendar date value
	 * @public
	 */
	UniversalDate.prototype.getJSDate = function() {
		return this.oDate;
	};

	/**
	 * Returns the calendar type of the current instance of a UniversalDate.
	 *
	 * @returns {sap.ui.core.CalendarType} The calendar type of the date
	 */
	UniversalDate.prototype.getCalendarType = function() {
		return this.sCalendarType;
	};

	/*
	 * Provide additional getters/setters, not yet covered by the JS Date
	 */
	UniversalDate.prototype.getEra = function() {
		return UniversalDate.getEraByDate(this.sCalendarType, this.oDate.getFullYear(), this.oDate.getMonth(), this.oDate.getDate());
	};
	UniversalDate.prototype.setEra = function(iEra) {
		// The default implementation does not support setting the era
	};
	UniversalDate.prototype.getUTCEra = function() {
		return UniversalDate.getEraByDate(this.sCalendarType, this.oDate.getUTCFullYear(), this.oDate.getUTCMonth(), this.oDate.getUTCDate());
	};
	UniversalDate.prototype.setUTCEra = function(iEra) {
		// The default implementation does not support setting the era
	};

	/**
	 * Retrieves the calendar week
	 *
	 * @param {sap.ui.core.Locale} [oLocale] the locale used to get the calendar week calculation properties, defaults to the formatLocale
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>,
	 *   the default is derived from <code>oLocale</code> but this parameter has precedence over oLocale if both are provided.
	 *   In case an object is provided, both properties <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> must be set, otherwise an error is thrown.
	 *   If calendar week numbering is not determined from the locale then {@link LocaleData#firstDayStartsFirstWeek} is ignored.
	 *   e.g. <code>{firstDayOfWeek: 1, minimalDaysInFirstWeek: 4}</code>
	 * @returns {{week: int, year: int}} resulting calendar week, note: week index starts with <code>0</code>
	 * @private
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.prototype.getWeek = function(oLocale, vCalendarWeekNumbering) {
		checkWeekConfig(vCalendarWeekNumbering);
		return UniversalDate.getWeekByDate(this.sCalendarType, this.getFullYear(), this.getMonth(), this.getDate(), oLocale, vCalendarWeekNumbering);
	};

	/**
	 * Sets the calendar week
	 *
	 * @param {{week: int, year: int}} oWeek the calendar week, note: week index starts with <code>0</code>,
	 *   <code>oWeek.year</code> is optional and defaults to {@link sap.ui.core.date.UniversalDate#getFullYear}
	 * @param {sap.ui.core.Locale} [oLocale] the locale used to get the calendar week calculation properties, defaults to the formatLocale
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>,
	 *   the default is derived from <code>oLocale</code> but this parameter has precedence over oLocale if both are provided.
	 *   In case an object is provided, both properties <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> must be set, otherwise an error is thrown.
	 *   If calendar week numbering is not determined from the locale then {@link LocaleData#firstDayStartsFirstWeek} is ignored.
	 *   e.g. <code>{firstDayOfWeek: 1, minimalDaysInFirstWeek: 4}</code>
	 * @private
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.prototype.setWeek = function(oWeek, oLocale, vCalendarWeekNumbering) {
		checkWeekConfig(vCalendarWeekNumbering);
		var oDate = UniversalDate.getFirstDateOfWeek(this.sCalendarType, oWeek.year || this.getFullYear(), oWeek.week, oLocale, vCalendarWeekNumbering);
		this.setFullYear(oDate.year, oDate.month, oDate.day);
	};

	/**
	 * Retrieves the UTC calendar week
	 *
	 * @param {sap.ui.core.Locale} [oLocale] the locale used to get the calendar week calculation properties, defaults to the formatLocale
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>,
	 *   the default is derived from <code>oLocale</code> but this parameter has precedence over oLocale if both are provided.
	 *   In case an object is provided, both properties <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> must be set, otherwise an error is thrown.
	 *   If calendar week numbering is not determined from the locale then {@link LocaleData#firstDayStartsFirstWeek} is ignored.
	 *   e.g. <code>{firstDayOfWeek: 1, minimalDaysInFirstWeek: 4}</code>
	 * @returns {{week: int, year: int}} resulting calendar week, note: week index starts with <code>0</code>
	 * @private
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.prototype.getUTCWeek = function(oLocale, vCalendarWeekNumbering) {
		checkWeekConfig(vCalendarWeekNumbering);
		return UniversalDate.getWeekByDate(this.sCalendarType, this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate(), oLocale, vCalendarWeekNumbering);
	};

	/**
	 * Sets the UTC calendar week
	 *
	 * @param {{week: int, year: int}} oWeek the calendar week, note: week index starts with <code>0</code>,
	 *   <code>oWeek.year</code> is optional and defaults to {@link sap.ui.core.date.UniversalDate#getFullYear}
	 * @param {sap.ui.core.Locale} [oLocale] the locale used to get the calendar week calculation properties, defaults to the formatLocale
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>,
	 *   the default is derived from <code>oLocale</code> but this parameter has precedence over oLocale if both are provided.
	 *   In case an object is provided, both properties <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> must be set, otherwise an error is thrown.
	 *   If calendar week numbering is not determined from the locale then {@link LocaleData#firstDayStartsFirstWeek} is ignored.
	 *   e.g. <code>{firstDayOfWeek: 1, minimalDaysInFirstWeek: 4}</code>
	 * @private
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.prototype.setUTCWeek = function(oWeek, oLocale, vCalendarWeekNumbering) {
		checkWeekConfig(vCalendarWeekNumbering);
		var oDate = UniversalDate.getFirstDateOfWeek(this.sCalendarType, oWeek.year || this.getFullYear(), oWeek.week, oLocale, vCalendarWeekNumbering);
		this.setUTCFullYear(oDate.year, oDate.month, oDate.day);
	};
	UniversalDate.prototype.getQuarter = function() {
		return Math.floor((this.getMonth() / 3));
	};
	UniversalDate.prototype.getUTCQuarter = function() {
		return Math.floor((this.getUTCMonth() / 3));
	};
	UniversalDate.prototype.getDayPeriod = function() {
		if (this.getHours() < 12) {
			return 0;
		} else {
			return 1;
		}
	};
	UniversalDate.prototype.getUTCDayPeriod = function() {
		if (this.getUTCHours() < 12) {
			return 0;
		} else {
			return 1;
		}
	};


	// TODO: These are currently needed for the DateFormat test, as the date used in the test
	// has been enhanced with these methods. Should be implemented using CLDR data.
	UniversalDate.prototype.getTimezoneShort = function() {
		if (this.oDate.getTimezoneShort) {
			return this.oDate.getTimezoneShort();
		}
	};
	UniversalDate.prototype.getTimezoneLong = function() {
		if (this.oDate.getTimezoneLong) {
			return this.oDate.getTimezoneLong();
		}
	};

	/*
	 * Helper methods for week calculations
	 */
	var iMillisecondsInWeek = 7 * 24 * 60 * 60 * 1000;

	/**
	 * Retrieves the calendar week for a given date, specified by year, month, and day.
	 *
	 * @param {string} sCalendarType the calendar type, e.g. <code>"Gregorian"</code>
	 * @param {int} iYear year, e.g. <code>2016</code>
	 * @param {int} iMonth the month, e.g. <code>2</code>
	 * @param {int} iDay the date, e.g. <code>3</code>
	 * @param {sap.ui.core.Locale} [oLocale] the locale used for the week calculation, if oWeekConfig is not provided (falls back to the formatLocale)
	 *   e.g. <code>new Locale("de-DE")</code>
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>,
	 *   the default is derived from <code>oLocale</code> but this parameter has precedence over oLocale if both are provided.
	 *   In case an object is provided, both properties <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> must be set, otherwise an error is thrown.
	 *   If calendar week numbering is not determined from the locale then {@link LocaleData#firstDayStartsFirstWeek} is ignored.
	 *   e.g. <code>{firstDayOfWeek: 1, minimalDaysInFirstWeek: 4}</code>
	 * @returns {{week: int, year: int}} resulting calendar week, note: week index starts with <code>0</code>, e.g. <code>{year: 2016, week: 8}</code>
	 * @private
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.getWeekByDate = function(sCalendarType, iYear, iMonth, iDay, oLocale, vCalendarWeekNumbering) {
		checkWeekConfig(vCalendarWeekNumbering);
		oLocale = oLocale || Configuration.getFormatSettings().getFormatLocale();
		var clDate = this.getClass(sCalendarType);
		var oFirstDay = getFirstDayOfFirstWeek(clDate, iYear, oLocale, vCalendarWeekNumbering);
		var oDate = new clDate(clDate.UTC(iYear, iMonth, iDay));
		var iWeek, iLastYear, iNextYear, oLastFirstDay, oNextFirstDay;
		var bSplitWeek = isSplitWeek(vCalendarWeekNumbering, oLocale);
		if (bSplitWeek) {
			iWeek = calculateWeeks(oFirstDay, oDate);
		} else {
			iLastYear = iYear - 1;
			iNextYear = iYear + 1;
			oLastFirstDay = getFirstDayOfFirstWeek(clDate, iLastYear, oLocale, vCalendarWeekNumbering);
			oNextFirstDay = getFirstDayOfFirstWeek(clDate, iNextYear, oLocale, vCalendarWeekNumbering);
			if (oDate >= oNextFirstDay) {
				iYear = iNextYear;
				iWeek = 0;
			} else if (oDate < oFirstDay) {
				iYear = iLastYear;
				iWeek = calculateWeeks(oLastFirstDay, oDate);
			} else {
				iWeek = calculateWeeks(oFirstDay, oDate);
			}
		}
		return {
			year: iYear,
			week: iWeek
		};
	};

	/**
	 * Retrieves the first day's date of the given week in the given year.
	 *
	 * @param {string} sCalendarType the calendar type, e.g. <code>"Gregorian"</code>
	 * @param {int} iYear year, e.g. <code>2016</code>
	 * @param {int} iWeek the calendar week index, e.g. <code>8</code>
	 * @param {sap.ui.core.Locale} [oLocale] the locale used for the week calculation, if oWeekConfig is not provided (falls back to the formatLocale)
	 *   e.g. <code>new Locale("de-DE")</code>
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>,
	 *   the default is derived from <code>oLocale</code> but this parameter has precedence over oLocale if both are provided.
	 *   In case an object is provided, both properties <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> must be set, otherwise an error is thrown.
	 *   If calendar week numbering is not determined from the locale then {@link LocaleData#firstDayStartsFirstWeek} is ignored.
	 *   e.g. <code>{firstDayOfWeek: 1, minimalDaysInFirstWeek: 4}</code>
	 * @returns {{month: int, year: int, day: int}} the resulting date, e.g. <code>{year: 2016, month: 1, day: 29}</code>
	 * @private
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.getFirstDateOfWeek = function(sCalendarType, iYear, iWeek, oLocale, vCalendarWeekNumbering) {
		checkWeekConfig(vCalendarWeekNumbering);
		oLocale = oLocale || Configuration.getFormatSettings().getFormatLocale();
		var clDate = this.getClass(sCalendarType);
		var oFirstDay = getFirstDayOfFirstWeek(clDate, iYear, oLocale, vCalendarWeekNumbering);
		var oDate = new clDate(oFirstDay.valueOf() + iWeek * iMillisecondsInWeek);
		var bSplitWeek = isSplitWeek(vCalendarWeekNumbering, oLocale);
		if (bSplitWeek && iWeek === 0 && oFirstDay.getUTCFullYear() < iYear) {
			return {
				year: iYear,
				month: 0,
				day: 1
			};
		}
		return {
			year: oDate.getUTCFullYear(),
			month: oDate.getUTCMonth(),
			day: oDate.getUTCDate()
		};
	};

	/**
	 * Determines if the split week algorithm should be applied (the first day of the first calendar
	 * week of the year is January 1st).
	 *
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and
	 *   <code>minimalDaysInFirstWeek</code>
	 * @param {sap.ui.core.Locale} [oLocale] the locale used for the week calculation
	 * @returns {boolean} if the split week should be applied
	 * @private
	 */
	function isSplitWeek(vCalendarWeekNumbering, oLocale) {
		oLocale = oLocale || Configuration.getFormatSettings().getFormatLocale();
		var oLocaleData = LocaleData.getInstance(oLocale);
		return (!isCalendarWeekConfigurationDefined(vCalendarWeekNumbering) ||
			vCalendarWeekNumbering === CalendarWeekNumbering.Default)
			&& oLocaleData.firstDayStartsFirstWeek();
	}

	/**
	 * Checks the calendar week configuration
	 *
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 * @private
	 */
	function checkWeekConfig(vCalendarWeekNumbering) {
		if (typeof vCalendarWeekNumbering === "object") {
			if (!isCalendarWeekConfigurationDefined(vCalendarWeekNumbering)) {
				throw new TypeError("Week config requires firstDayOfWeek and minimalDaysInFirstWeek to be set");
			}
		} else if (vCalendarWeekNumbering && !Object.values(CalendarWeekNumbering).includes(vCalendarWeekNumbering)) {
			throw new TypeError("Illegal format option calendarWeekNumbering: '" + vCalendarWeekNumbering + "'");
		}
	}

	/**
	 * Checks if the calendar week configuration is defined
	 *
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   the parameter which is checked
	 * @returns {boolean} if the parameter vCalendarWeekNumbering is defined and in case of an
	 *   object has the required properties <code>firstDayOfWeek</code> and
	 *   <code>minimalDaysInFirstWeek</code> defined with a numeric value
	 * @private
	 */
	function isCalendarWeekConfigurationDefined (vCalendarWeekNumbering) {
		if (typeof vCalendarWeekNumbering === "object") {
			return typeof vCalendarWeekNumbering.firstDayOfWeek === "number"
				&& typeof vCalendarWeekNumbering.minimalDaysInFirstWeek === "number";
		} else if (vCalendarWeekNumbering) {
			return true;
		}
		return false;
	}

	/**
	 * Resolves the calendar week configuration
	 *
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>
	 * @param {sap.ui.core.Locale} [oLocale] locale to be used
	 * @returns {{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} calendar week calculation configuration
	 * @private
	 */
	 function resolveCalendarWeekConfiguration (vCalendarWeekNumbering, oLocale) {
		// be backward compatible
		if (typeof vCalendarWeekNumbering === "object"
				&& typeof vCalendarWeekNumbering.firstDayOfWeek === "number"
				&& typeof vCalendarWeekNumbering.minimalDaysInFirstWeek === "number") {
			return vCalendarWeekNumbering;
		}
		return CalendarUtils.getWeekConfigurationValues(vCalendarWeekNumbering, oLocale);
	}

	/**
	 * Returns the first day of the first week in the given year.
	 *
	 * @param {UniversalDate} clDate the date class
	 * @param {int} iYear year, e.g. <code>2016</code>
	 * @param {sap.ui.core.Locale} [oLocale] the locale used for the week calculation, if oWeekConfig is not provided (falls back to the formatLocale)
	 *   e.g. <code>new Locale("de-DE")</code>
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} [vCalendarWeekNumbering]
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>,
	 *   the default is derived from <code>oLocale</code> but this parameter has precedence over oLocale if both are provided.
	 *   e.g. <code>{firstDayOfWeek: 1, minimalDaysInFirstWeek: 4}</code>
	 * @returns {Date} first day of the first week in the given year, e.g. <code>Mon Jan 04 2016 01:00:00 GMT+0100</code>
	 * @private
	 */
	function getFirstDayOfFirstWeek(clDate, iYear, oLocale, vCalendarWeekNumbering) {
		oLocale = oLocale || Configuration.getFormatSettings().getFormatLocale();

		var oWeekConfig = resolveCalendarWeekConfiguration(vCalendarWeekNumbering, oLocale);
		var iMinDays = oWeekConfig.minimalDaysInFirstWeek;
		var iFirstDayOfWeek = oWeekConfig.firstDayOfWeek;

		var oFirstDay = new clDate(clDate.UTC(iYear, 0, 1));
		var iDayCount = 7;

		if (isNaN(oFirstDay.getTime())) {
			throw new Error("Could not determine the first day of the week, because the date " +
				"object is invalid");
		}
		// Find the first day of the first week of the year
		while (oFirstDay.getUTCDay() !== iFirstDayOfWeek) {
			oFirstDay.setUTCDate(oFirstDay.getUTCDate() - 1);
			iDayCount--;
		}
		// If less than min days are left, first week is one week later
		if (iDayCount < iMinDays) {
			oFirstDay.setUTCDate(oFirstDay.getUTCDate() + 7);
		}
		return oFirstDay;
	}

	function calculateWeeks(oFromDate, oToDate) {
		return Math.floor((oToDate.valueOf() - oFromDate.valueOf()) / iMillisecondsInWeek);
	}

	/*
	 * Helper methods for era calculations
	 */
	var mEras = {};

	UniversalDate.getEraByDate = function(sCalendarType, iYear, iMonth, iDay) {
		var aEras = getEras(sCalendarType),
			iTimestamp = new Date(0).setUTCFullYear(iYear, iMonth, iDay),
			oEra;
		for (var i = aEras.length - 1; i >= 0; i--) {
			oEra = aEras[i];
			if (!oEra) {
				continue;
			}
			if (oEra._start && iTimestamp >= oEra._startInfo.timestamp) {
				return i;
			}
			if (oEra._end && iTimestamp < oEra._endInfo.timestamp) {
				return i;
			}
		}
	};

	UniversalDate.getCurrentEra = function(sCalendarType) {
		var oNow = new Date();
		return this.getEraByDate(sCalendarType, oNow.getFullYear(), oNow.getMonth(), oNow.getDate());
	};

	UniversalDate.getEraStartDate = function(sCalendarType, iEra) {
		var aEras = getEras(sCalendarType),
			oEra = aEras[iEra] || aEras[0];
		if (oEra._start) {
			return oEra._startInfo;
		}
	};

	function getEras(sCalendarType) {
		var oLocale = Configuration.getFormatSettings().getFormatLocale(),
			oLocaleData = LocaleData.getInstance(oLocale),
			aEras = mEras[sCalendarType];
		if (!aEras) {
			// Get eras from localedata, parse it and add it to the array
			var aEras = oLocaleData.getEraDates(sCalendarType);
			if (!aEras[0]) {
				aEras[0] = {_start: "1-1-1"};
			}
			for (var i = 0; i < aEras.length; i++) {
				var oEra = aEras[i];
				if (!oEra) {
					continue;
				}
				if (oEra._start) {
					oEra._startInfo = parseDateString(oEra._start);
				}
				if (oEra._end) {
					oEra._endInfo = parseDateString(oEra._end);
				}
			}
			mEras[sCalendarType] = aEras;
		}
		return aEras;
	}

	function parseDateString(sDateString) {
		var aParts = sDateString.split("-"),
			iYear, iMonth, iDay;
		if (aParts[0] == "") {
			// negative year
			iYear = -parseInt(aParts[1]);
			iMonth = parseInt(aParts[2]) - 1;
			iDay = parseInt(aParts[3]);
		} else {
			iYear = parseInt(aParts[0]);
			iMonth = parseInt(aParts[1]) - 1;
			iDay = parseInt(aParts[2]);
		}
		return {
			timestamp: new Date(0).setUTCFullYear(iYear, iMonth, iDay),
			year: iYear,
			month: iMonth,
			day: iDay
		};
	}

	return UniversalDate;

});
