/*!
 * ${copyright}
 */

// Provides class sap.ui.core.date.UniversalDate
sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/core/Configuration',
	'sap/ui/core/LocaleData',
	'./_Calendars',
	'./CalendarUtils',
	'./CalendarWeekNumbering',
	'./UI5Date'
], function(BaseObject, Configuration, LocaleData, _Calendars, CalendarUtils, CalendarWeekNumbering, UI5Date) {
	"use strict";

	/**
	 * Constructor for UniversalDate.
	 *
	 * @class
	 * The UniversalDate is the base class of calendar date instances. It contains the static methods to create calendar
	 * specific instances.
	 *
	 * The member variable <code>this.oDate</code> contains a date instance
	 * (either JavaScript Date or <code>module:sap/ui/core/date/UI5Date</code>) which considers the
	 * configured time zone wherever JavaScript Date uses the local browser time zone; see
	 * {@link module:sap/ui/core/date/UI5Date#getInstance}. This is the source value of the date
	 * information. The prototype contains getters and setters of the Date and is delegating them
	 * to the internal date object. Implementations for specific calendars may override methods
	 * needed for their specific calendar (e.g. getYear and getEra for Japanese emperor calendar).
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @alias sap.ui.core.date.UniversalDate
	 */
	var UniversalDate = BaseObject.extend("sap.ui.core.date.UniversalDate", /** @lends sap.ui.core.date.UniversalDate.prototype */ {
		constructor: function() {
			var clDate = UniversalDate.getClass();
			return this.createDate(clDate, arguments);
		}
	});

	/**
	 * Delegates this method to the calender specific implementation.
	 *
	 * @returns {int}
	 *   The number of milliseconds since January 1, 1970, 00:00:00 UTC based on the Gregorian
	 *   calendar, for the given calendar specific arguments
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.UTC = function() {
		var clDate = UniversalDate.getClass();
		return clDate.UTC.apply(clDate, arguments);
	};

	/**
	 * Returns a number representing the millisecond since January 1, 1970, 00:00:00 to the current date,
	 * see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now Date.now}.
	 *
	 * @returns {int} A number representing the millisecond since January 1, 1970, 00:00:00 to the current date
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.now = function() {
		return Date.now();
	};

	/**
	 * Creates an object of the provided date class and with the given arguments.
	 *
	 * @param {function} clDate
	 *   The constructor function for either <code>Date</code> or an implementation of
	 *   <code>sap.ui.core.date.UniversalDate</code>
	 * @param {object} aArgs
	 *   The <code>arguments</code> object which is given to the constructor of the given date class
	 *   to create the date object
	 * @returns {sap.ui.core.date.UniversalDate|module:sap/ui/core/date/UI5Date}
	 *   The created date, either an UI5Date or UniversalDate instance
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.createDate = function(clDate, aArgs) {
		if (clDate === Date) {
			return UI5Date.getInstance.apply(null, aArgs);
		}

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
	 * Returns an instance of UniversalDate, based on the calendar type from the configuration, or as explicitly
	 * defined by parameter. The object contains getters and setters of the JavaScript Date and is delegating them
	 * to an internal date object.
	 *
	 * Note: Prefer this method over calling <code>new UniversalDate</code> with an instance of <code>Date</code>.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date|sap.ui.core.date.UniversalDate} [oDate]
	 *   The date object, defaults to <code>UI5Date.getInstance()</code>
	 * @param {sap.ui.core.CalendarType} [sCalendarType]
	 *   The calendar type, defaults to <code>sap.ui.getCore().getConfiguration().getCalendarType()</code>
	 * @returns {sap.ui.core.date.UniversalDate}
	 *   An instance of <code>UniversalDate</code>
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.getInstance = function(oDate, sCalendarType) {
		var clDate, oInstance;

		if (oDate instanceof UniversalDate) {
			oDate = oDate.getJSDate();
		}

		if (oDate && isNaN(oDate.getTime())) {
			throw new Error("The given date object is invalid");
		}

		if (!sCalendarType) {
			sCalendarType = Configuration.getCalendarType();
		}
		clDate = UniversalDate.getClass(sCalendarType);
		oInstance = Object.create(clDate.prototype);
		oInstance.oDate = oDate ? UI5Date.getInstance(oDate) : UI5Date.getInstance();
		oInstance.sCalendarType = sCalendarType;

		return oInstance;
	};

	/**
	 * Returns the constructor function of a subclass of <code>UniversalDate</code> for the given calendar type.
	 * If no calendar type is given the globally configured calendar type is used.
	 *
	 * @param {sap.ui.core.CalendarType} sCalendarType the type of the used calendar
	 *
	 * @returns {function}
	 *   The class of the given <code>sCalenderType</code>. If <code>sCalenderType</code> is not
	 *   provided, the class of the configured calendar type is returned.
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.getClass = function(sCalendarType) {
		if (!sCalendarType) {
			sCalendarType = Configuration.getCalendarType();
		}
		return _Calendars.get(sCalendarType);
	};

	/**
	 * Returns the day of the month of the embedded date instance according to the configured time
	 * zone and selected calender.
	 *
	 * @returns {int}
	 *   A number representing the day of the month of the embedded date instance according
	 *   to the configured time zone and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getDate
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the day of the week of the embedded date instance according to the configured time zone and
	 * selected calender.
	 *
	 * @returns {int}
	 *   A number representing the day of the week of the embedded date instance according to the configured
	 *   time zone and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getDay
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the year of the embedded date instance according to the configured time zone and selected calender.
	 *
	 * @returns {int}
	 *   The year of the embedded date instance according to the configured time zone and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getFullYear
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the hours of the embedded date instance according to the configured time zone and selected
	 * calender.
	 *
	 * @returns {int}
	 *   A number representing the hours of the embedded date instance according to the configured time zone
	 *   and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getHours
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the milliseconds of the embedded date instance according to the configured time zone
	 * and selected calender.
	 *
	 * @returns {int}
	 *   A number between 0 and 999 representing the milliseconds of the embedded date instance according to
	 *   the configured time zone and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getMilliseconds
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the minutes of the embedded date instance according to the configured time zone and selected calender.
	 *
	 * @returns {int}
	 *   A number between 0 and 59 representing the minutes of the embedded date instance according to the
	 *   configured time zone and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getMinutes
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the month index of the embedded date instance according to the configured time zone
	 * and selected calender.
	 *
	 * @returns {int}
	 *   The month index of the embedded date instance according to the configured time zone and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getMonth
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the seconds of the embedded date instance according to the configured time zone and selected calender.
	 *
	 * @returns {int}
	 *   A number between 0 and 59 representing the seconds of the embedded date instance according to the
	 *   configured time zone and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getSeconds
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the difference in minutes between the UTC and the configured time zone for the embedded date.
	 *
	 * @returns {int}
	 *   The difference in minutes between the UTC and the configured time zone for the embedded date
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getTimezoneOffset
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the timestamp in milliseconds of the embedded date based on the UNIX epoch.
	 *
	 * @returns {int}
	 *   The timestamp in milliseconds of the embedded date based on the UNIX epoch, or <code>NaN</code> if
	 *   the embedded date is an invalid date
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getTime
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the day of the month of the embedded date instance according to universal time and
	 * selected calender.
	 *
	 * @returns {int}
	 *   A number representing the day of the month of the embedded date instance according
	 *   to universal time and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getUTCDate
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 *
	 * Returns the day of the week of the embedded date instance according to universal time and
	 * selected calender.
	 *
	 * @returns {int}
	 *   A number representing the day of the week of the embedded date instance according to universal
	 *   time and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getUTCDay
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the year of the embedded date instance according to universal time and selected calender.
	 *
	 * @returns {int}
	 *   The year of the embedded date instance according to universal time and selected calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getUTCFullYear
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the hours of the embedded date instance according to universal time.
	 *
	 * @returns {int}
	 *   A number representing the hours of the embedded date instance according to universal time
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getUTCHours
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the milliseconds of the embedded date instance according to universal time.
	 *
	 * @returns {int}
	 *   A number between 0 and 999 representing the milliseconds of the embedded date instance
	 *   according to universal time
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getUTCMilliseconds
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the minutes of the embedded date instance according to universal time.
	 *
	 * @returns {int}
	 *   A number between 0 and 59 representing the minutes of the embedded date instance according
	 *   to universal time
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getUTCMinutes
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the month index of the embedded date instance according to universal time and
	 * selected calender.
	 *
	 * @returns {int}
	 *   The month index of the embedded date instance according to universal time and selected
	 *   calender
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getUTCMonth
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the seconds of the embedded date instance according to universal time.
	 *
	 * @returns {int}
	 *   A number between 0 and 59 representing the seconds of the embedded date instance according
	 *   to universal time
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.getUTCSeconds
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the day of the month for the embedded date instance considering the configured time zone
	 * and selected calender.
	 *
	 * @param {int} iDay
	 *   An integer representing the new day value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setDate
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the year, month and day for the embedded date instance considering the configured time
	 * zone and selected calender.
	 *
	 * @param {int} yearValue An integer representing the new year value
	 * @param {int} [monthValue] An integer representing the new month index
	 * @param {int} [dateValue] An integer representing the new day value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setFullYear
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the hours, minutes, seconds and milliseconds for the embedded date instance considering
	 * the configured time zone.
	 *
	 * @param {int} hoursValue An integer representing the new hours value
	 * @param {int} [minutesValue] An integer representing the new minutes value
	 * @param {int} [secondsValue] An integer representing the new seconds value
	 * @param {int} [msValue] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setHours
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the milliseconds for the embedded date instance considering the configured time zone.
	 *
	 * @param {int} millisecondsValue An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setMilliseconds
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the minutes, seconds and milliseconds for the embedded date instance considering the configured
	 * time zone.
	 *
	 * @param {int} minutesValue An integer representing the new minutes value
	 * @param {int} [secondsValue] An integer representing the new seconds value
	 * @param {int} [msValue] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setMinutes
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the month and day for the embedded date instance considering the configured time zone and
	 * selected calender.
	 *
	 * @param {int} monthValue An integer representing the new month index
	 * @param {int} [dayValue] An integer representing the new day value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setMonth
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the seconds and milliseconds for the embedded date instance considering the configured time zone.
	 *
	 * @param {int} secondsValue An integer representing the new seconds value
	 * @param {int} [msValue] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setSeconds
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the day of the month for the embedded date instance according to universal time and
	 * selected calender.
	 *
	 * @param {int} dayValue
	 *   An integer representing the new day value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setUTCDate
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the year, month and day for the embedded date instance according to universal time and
	 * selected calender.
	 *
	 * @param {int} yearValue An integer representing the new year value
	 * @param {int} [monthValue] An integer representing the new month index
	 * @param {int} [dateValue] An integer representing the new day value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setUTCFullYear
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the hours, minutes, seconds and milliseconds for the embedded date instance according to
	 * universal time.
	 *
	 * @param {int} hoursValue An integer representing the new hours value
	 * @param {int} [minutesValue] An integer representing the new minutes value
	 * @param {int} [secondsValue] An integer representing the new seconds value
	 * @param {int} [msValue] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setUTCHours
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the milliseconds for the embedded date instance according to universal time.
	 *
	 * @param {int} msValue An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setUTCMilliseconds
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the minutes, seconds and milliseconds for the embedded date instance according to universal
	 * time.
	 *
	 * @param {int} minutesValue An integer representing the new minutes value
	 * @param {int} [secondsValue] An integer representing the new seconds value
	 * @param {int} [msValue] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setUTCMinutes
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the month and day for the embedded date instance according to universal time and
	 * selected calender.
	 *
	 * @param {int} monthValue An integer representing the new month index
	 * @param {int} [dateValue] An integer representing the new day value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setUTCMonth
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Sets the seconds and milliseconds for the embedded date instance according to universal time.
	 *
	 * @param {int} secondsValue An integer representing the new seconds value
	 * @param {int} [msValue] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated. The new timestamp is a Gregorian timestamp.
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.setUTCSeconds
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the date portion of the embedded date object interpreted in the configured time zone,
	 * independent on the selected calendar.
	 *
	 * @returns {string}
	 *   The date portion of the embedded date object interpreted in the configured time zone
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.toDateString
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns a string representing the embedded date object interpreted in the configured time
	 * zone, independent on the selected calendar.
	 *
	 * @returns {string}
	 *   A string representing the embedded date object interpreted in the configured time zone
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.toString
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */

	/**
	 * Returns the value of the embedded date object in milliseconds based on the UNIX epoch.
	 *
	 * @returns {int} The primitive value of the embedded date object in milliseconds based on the UNIX epoch
	 *
	 * @function
	 * @name sap.ui.core.date.UniversalDate.prototype.valueOf
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
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
	 * Returns the date object representing the current calendar date value.
	 *
	 * @returns {Date|module:sap/ui/core/date/UI5Date} The date object representing the current calendar date value
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.getJSDate = function() {
		return this.oDate;
	};

	/**
	 * Returns the calendar type of the current instance of a UniversalDate.
	 *
	 * @returns {sap.ui.core.CalendarType} The calendar type of the date
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.getCalendarType = function() {
		return this.sCalendarType;
	};

	/**
	 * Returns the era index of for the embedded date instance.
	 *
	 * @returns {int} The index of the era for the embedded date instance
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.getEra = function() {
		return UniversalDate.getEraByDate(this.sCalendarType, this.oDate.getFullYear(), this.oDate.getMonth(), this.oDate.getDate());
	};

	/**
	 * Placeholder method which is overwritten by calendar specific implementations. General usage of
	 * this method is to use it to set the era for the embedded date instance.
	 *
	 * @param {int} iEra
	 *   An number representing the era index which is to be set for the embedded date instance
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.setEra = function(iEra) {
		// The default implementation does not support setting the era
	};

	/**
	 * Returns the era index of for the embedded date instance in universal time.
	 *
	 * @returns {int} The index of the era for the embedded date instance in universal time
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.getUTCEra = function() {
		return UniversalDate.getEraByDate(this.sCalendarType, this.oDate.getUTCFullYear(), this.oDate.getUTCMonth(), this.oDate.getUTCDate());
	};

	/**
	 * Placeholder method which is overwritten by calendar specific implementations. General usage of
	 * this method is to use it to set the era for the embedded date instance in universal time.
	 *
	 * @param {int} iEra
	 *   An number representing the era index which is to be set for the embedded date instance
	 *   in universal time
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
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
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.prototype.getWeek = function(oLocale, vCalendarWeekNumbering) {
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
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.prototype.setWeek = function(oWeek, oLocale, vCalendarWeekNumbering) {
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
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.prototype.getUTCWeek = function(oLocale, vCalendarWeekNumbering) {
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
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.prototype.setUTCWeek = function(oWeek, oLocale, vCalendarWeekNumbering) {
		var oDate = UniversalDate.getFirstDateOfWeek(this.sCalendarType, oWeek.year || this.getFullYear(), oWeek.week, oLocale, vCalendarWeekNumbering);
		this.setUTCFullYear(oDate.year, oDate.month, oDate.day);
	};

	/**
	 * Returns the current quarter of the embedded date instance
	 *
	 * @returns {int} The quarter of the embedded date instance
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.getQuarter = function() {
		return Math.floor((this.getMonth() / 3));
	};

	/**
	 * Returns the current quarter of the embedded date instance in universal time
	 *
	 * @returns {int} The quarter of the embedded date instance in universal time
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.getUTCQuarter = function() {
		return Math.floor((this.getUTCMonth() / 3));
	};

	/**
	 * Returns an integer value depending on whether the embedded date instance time is set to the
	 * afternoon or morning.
	 *
	 * @returns {int}
	 *   An integer value which indicates which day period the embedded date instance is set to. If,
	 *   date time is set in the morning time 0 (i.e. 0:00 - 11:59) or 1 if date time is set in the
	 *   afternoon (i.e. 12:00 - 23:59).
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.getDayPeriod = function() {
		if (this.getHours() < 12) {
			return 0;
		} else {
			return 1;
		}
	};


	/**
	 * Returns an integer value depending on whether the embedded date instance time, is set to the
	 * afternoon or morning, in universal time.
	 *
	 * @returns {int}
	 *   An integer value which indicates which day period the embedded date instance is set to, in
	 *   universal time. If, universal date time is set in the morning time 0 (i.e. 0:00 - 11:59) or
	 *   1 if universal date time is set in the afternoon (i.e. 12:00 - 23:59).
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.getUTCDayPeriod = function() {
		if (this.getUTCHours() < 12) {
			return 0;
		} else {
			return 1;
		}
	};


	// TODO: These are currently needed for the DateFormat test, as the date used in the test
	// has been enhanced with these methods. Should be implemented using CLDR data.
	/**
	 * Returns the short version of the time zone name of the embedded date instance.
	 *
	 * @returns {string} The short version of the name, of the time zone of the embedded date instance
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.prototype.getTimezoneShort = function() {
		if (this.oDate.getTimezoneShort) {
			return this.oDate.getTimezoneShort();
		}
	};

	/**
	 * Returns the long version of the time zone name of the embedded date instance.
	 *
	 * @returns {string} The long version of the name, of the time zone of the embedded date instance
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
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
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.getWeekByDate = function(sCalendarType, iYear, iMonth, iDay, oLocale, vCalendarWeekNumbering) {
		vCalendarWeekNumbering = vCalendarWeekNumbering || Configuration.getCalendarWeekNumbering();
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
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	UniversalDate.getFirstDateOfWeek = function(sCalendarType, iYear, iWeek, oLocale, vCalendarWeekNumbering) {
		vCalendarWeekNumbering = vCalendarWeekNumbering || Configuration.getCalendarWeekNumbering();
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
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} vCalendarWeekNumbering
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and
	 *   <code>minimalDaysInFirstWeek</code>
	 * @param {sap.ui.core.Locale} oLocale the locale used for the week calculation
	 * @returns {boolean} if the split week should be applied
	 */
	function isSplitWeek(vCalendarWeekNumbering, oLocale) {
		var oLocaleData = LocaleData.getInstance(oLocale);

		// only applies for en_US with default CalendarWeekNumbering (WesternTraditional is default in en_US)
		return (vCalendarWeekNumbering === CalendarWeekNumbering.Default
				|| vCalendarWeekNumbering === CalendarWeekNumbering.WesternTraditional)
			&& oLocaleData.firstDayStartsFirstWeek();
	}

	/**
	 * Checks the calendar week configuration
	 *
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} vCalendarWeekNumbering
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>vCalendarWeekNumbering is an object and the fields <code>firstDayOfWeek</code> or <code>minimalDaysInFirstWeek</code>) are missing or have a non-numeric value</li>
	 *   <li>vCalendarWeekNumbering is a string and has an invalid week numbering value</li>
	 * </ul>
	 */
	function checkWeekConfig(vCalendarWeekNumbering) {
		if (typeof vCalendarWeekNumbering === "object") {
			if (typeof vCalendarWeekNumbering.firstDayOfWeek !== "number"
					|| typeof vCalendarWeekNumbering.minimalDaysInFirstWeek !== "number") {
				throw new TypeError("Week config requires firstDayOfWeek and minimalDaysInFirstWeek to be set");
			}
		} else if (!Object.values(CalendarWeekNumbering).includes(vCalendarWeekNumbering)) {
			throw new TypeError("Illegal format option calendarWeekNumbering: '" + vCalendarWeekNumbering + "'");
		}
	}

	/**
	 * Resolves the calendar week configuration
	 *
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} vCalendarWeekNumbering
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>
	 * @param {sap.ui.core.Locale} [oLocale] locale to be used
	 * @returns {{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} calendar week calculation configuration
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
	 * @param {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}} vCalendarWeekNumbering
	 *   calendar week numbering or object with fields <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code>,
	 *   the default is derived from <code>oLocale</code> but this parameter has precedence over oLocale if both are provided.
	 *   e.g. <code>{firstDayOfWeek: 1, minimalDaysInFirstWeek: 4}</code>
	 * @returns {Date} first day of the first week in the given year, e.g. <code>Mon Jan 04 2016 01:00:00 GMT+0100</code>
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

	/**
	 * Returns the rounded amount of weeks a given time frame.
	 *
	 * @param {Date} oFromDate The beginning date of the time interval
	 * @param {Date} oToDate The end date of the time interval
	 * @returns {int} A rounded number which represents the amount of weeks in the given timer interval
	 */
	function calculateWeeks(oFromDate, oToDate) {
		return Math.floor((oToDate.valueOf() - oFromDate.valueOf()) / iMillisecondsInWeek);
	}

	/*
	 * Helper methods for era calculations
	 */
	var mEras = {};

	/**
	 * Returns an index of the era for the given date values in the given calender. For
	 * an index to be returned the date value has to be within the era time period, i.e. the
	 * timestamp value of the date has to be bigger or equal than the start timestamp of the era
	 * or smaller than the end of the end period.
	 *
	 * @param {string} sCalendarType The given calender type which the eras available for selection
	 * @param {int} iYear The year value for which the era is looked for
	 * @param {int} iMonth The month value for which the era is looked for
	 * @param {int} iDay The date value for which the era is looked for
	 * @returns {int} The index of the found era for the given date values in the given calender
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.getEraByDate = function(sCalendarType, iYear, iMonth, iDay) {
		var aEras = getEras(sCalendarType),
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
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

	/**
	 * Returns an index of the current era for the embedded date instance.
	 *
	 * @param {string} sCalendarType The calender type which defines the available eras to select from
	 * @returns {int} The index of the current era of the embedded date instance
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.getCurrentEra = function(sCalendarType) {
		var oNow = UI5Date.getInstance();
		return this.getEraByDate(sCalendarType, oNow.getFullYear(), oNow.getMonth(), oNow.getDate());
	};

	/**
	 * Returns the start date of the selected era from the given era index, in the given calender type.
	 *
	 * @param {string} sCalendarType The calender type from which the era is to be picked
	 * @param {int} iEra The given era index of the to be selected era
	 * @returns {object|null}
	 *   The start date object of the selected era. If no era can be found for the given index the first
	 *   era of the selected calender is chosen. If the chosen era does not have a start date defined
	 *   <code>null</code>
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 */
	UniversalDate.getEraStartDate = function(sCalendarType, iEra) {
		var aEras = getEras(sCalendarType),
			oEra = aEras[iEra] || aEras[0];
		if (oEra._start) {
			return oEra._startInfo;
		}
	};

	/**
	 * Returns an array of era for the given calender.
	 *
	 * @param {string} sCalendarType
	 *   The calender type from which the the locale era data is taken from and the era array is
	 *   generated
	 * @returns {array} An array of all available era in the given calender
	 */
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

	/**
	 * Returns an object containing the date parts year, month, day of month and the date timestamp value
	 * of the given date string.
	 *
	 * @param {string} sDateString The date string which is to be parsed
	 * @returns {object}
	 *   An object containing the year, month, day of month and date timestamp values of the given
	 *   date string
	 */
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
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			timestamp: new Date(0).setUTCFullYear(iYear, iMonth, iDay),
			year: iYear,
			month: iMonth,
			day: iDay
		};
	}

	return UniversalDate;

});
