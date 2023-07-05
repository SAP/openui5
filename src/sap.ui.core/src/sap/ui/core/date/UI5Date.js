/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Configuration",
	"sap/ui/core/format/TimezoneUtil"
], function (Configuration, TimezoneUtil) {
	"use strict";

	var aAllParts = ["year", "month", "day", "hour", "minute", "second", "fractionalSecond"],
		// "2023", "2023-01", "2023-01-20", "+002023-01-20" are parsed by JavaScript Date as UTC
		// timestamps, whereas "798", "2023-1", "2023-01-5" are parsed as local dates.
		// If "Z", "GMT" or a time zone offset (e.g. 00:00+0530) is included in the input string,
		// the string is parsed as a UTC related timestamp
		rIsUTCString = /Z|GMT|:.*[\+|\-]|^([\+|\-]\d{2})?\d{4}(-\d{2}){0,2}$/,
		aWeekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		aMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		mWeekdayToDay = {Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6};

	/**
	 * Pads the start of the absolute given value with zeros up to the given length. If the given
	 * value is negative the leading minus is added in front of the zeros.
	 *
	 * @param {int} iValue The value to be padded
	 * @param {int} iLength The minimal length of the resulting string excluding the minus sign
	 * @returns {string} The padded string
	 */
	function addLeadingZeros(iValue, iLength) {
		return (iValue < 0 ? "-" : "") + Math.abs(iValue).toString().padStart(iLength, "0");
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * DO NOT call the constructor for UI5Date directly; use <code>UI5Date.getInstance</code>.
	 *
	 * @param {object} vDateParts
	 *   An array like object containing the arguments as passed to
	 *   <code>UI5Date.getInstance</code>
	 * @param {string} sTimezoneID
	 *   The time zone ID to use for local methods of <code>Date</code>
	 *
	 * @alias module:sap/ui/core/date/UI5Date
	 * @author SAP SE
	 * @extends Date
	 * @class A date implementation considering the configured time zone
	 *
	 *   A subclass of JavaScript <code>Date</code> that considers the configured time zone, see
	 *   {@link sap.ui.core.Configuration#getTimezone}. All JavaScript <code>Date</code> functions
	 *   that use the local browser time zone, like <code>getDate</code>,
	 *   <code>setDate</code>, and <code>toString</code>, are overwritten and use the
	 *   configured time zone to compute the values.
	 *
	 *   Use {@link module:sap/ui/core/date/UI5Date.getInstance} to create new date instances.
	 *
	 *   <b>Note:</b> Adjusting the time zone in a running application can lead to unexpected data
	 *   inconsistencies. For more information, see {@link sap.ui.core.Configuration#setTimezone}.
	 *
	 * @hideconstructor
	 * @public
	 * @since 1.111.0
	 * @version ${version}
	 */
	function UI5Date(vDateParts, sTimezoneID) {
		var oDateInstance = UI5Date._createDateInstance(vDateParts);
		// mark internal properties not enumerable -> deepEqual handles this as a Date instance
		Object.defineProperties(this, {
			sTimezoneID: {value: sTimezoneID},
			oDate: {value: oDateInstance, writable: true},
			oDateParts: {value: undefined, writable: true}
		});

		if (isNaN(oDateInstance)) {
			return;
		}

		if (vDateParts.length > 1
				|| vDateParts.length === 1 && typeof vDateParts[0] === "string"
					&& !rIsUTCString.test(vDateParts[0])) {
			this._setParts(aAllParts,
				// JavaScript Date parsed the arguments already in local browser time zone
				[oDateInstance.getFullYear(), oDateInstance.getMonth(), oDateInstance.getDate(),
				oDateInstance.getHours(), oDateInstance.getMinutes(), oDateInstance.getSeconds(),
				oDateInstance.getMilliseconds()]);
		}
	}

	UI5Date.prototype = Object.create(Date.prototype, {
		constructor: {
			value: Date
		}
	});
	// QUnit uses Object.prototype.toString.call and expects "[object Date]" for dates; UI5Date
	// shall be treated as a JavaScript Date so Symbol.toStringTag has to be "Date"
	UI5Date.prototype[Symbol.toStringTag] = "Date";

	/**
	 * Returns the value for the requested date part (e.g. "month", "year", "hour") of this date
	 * according to the configured time zone.
	 *
	 * @param {string} sPart The date part name
	 * @returns {int} The value of the date part
	 *
	 * @private
	 */
	UI5Date.prototype._getPart = function (sPart) {
		var iResult;

		if (isNaN(this.oDate)) {
			return NaN;
		}

		this.oDateParts = this.oDateParts || TimezoneUtil._getParts(this.oDate, this.sTimezoneID);
		if (sPart === "weekday") {
			return mWeekdayToDay[this.oDateParts.weekday];
		}

		iResult = parseInt(this.oDateParts[sPart]);
		if (sPart === "month") {
			iResult -= 1;
		} else if (sPart === "year") {
			if (this.oDateParts.era === "B") {
				iResult = 1 - iResult;
			}
		}

		return iResult;
	};

	/**
	 * Updates this date instance by setting the given parts in the configured time zone.
	 *
	 * @param {string[]} aParts
	 *   The names of the date parts to be updated, supported names are: "year", "month", "day",
	 *   "hour", "minute", "second", "fractionalSecond"
	 * @param {object} aValues
	 *   The arguments object of the local setters
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be created
	 *
	 * @private
	 */
	UI5Date.prototype._setParts = function (aParts, aValues) {
		var i, oCurrentDateParts, oNewDateAsUTCTimestamp, iNewTimestamp, sPart, vValue,
			oDateParts = {},
			iMaxLength = Math.min(aParts.length, aValues.length);

		if (iMaxLength === 0) {
			return this.setTime(NaN);
		}

		for (i = 0; i < iMaxLength; i += 1) {
			// convert the value to number as JavaScript Date does it;
			// +"" -> 0, +null -> 0, +undefined -> NaN, +"foo" -> NaN, +"4" -> 4
			vValue = parseInt(+aValues[i]);
			sPart = aParts[i];
			if (isNaN(vValue)) {
				return this.setTime(NaN);
			}

			if (sPart === "month") {
				vValue += 1;
			} else if (sPart === "year") {
				if (vValue <= 0) {
					vValue = 1 - vValue;
					oDateParts.era = "B";
				} else {
					oDateParts.era = "A";
				}
			}
			oDateParts[sPart] = vValue.toString();
		}
		if (this.oDateParts) {
			oCurrentDateParts = this.oDateParts;
		} else if (isNaN(this.oDate)) {
			//era and year are given at least
			oCurrentDateParts = {day: "1", fractionalSecond: "0", hour: "0", minute: "0",
				month: "1", second: "0"};
		} else {
			oCurrentDateParts = TimezoneUtil._getParts(this.oDate, this.sTimezoneID);
		}
		oDateParts = Object.assign({}, oCurrentDateParts, oDateParts);

		// NaN may happen if no year is given if current date is invalid
		oNewDateAsUTCTimestamp = TimezoneUtil._getDateFromParts(oDateParts);
		if (isNaN(oNewDateAsUTCTimestamp)) {
			return this.setTime(NaN);
		}

		iNewTimestamp = oNewDateAsUTCTimestamp.getTime()
			+ TimezoneUtil.calculateOffset(oNewDateAsUTCTimestamp, this.sTimezoneID) * 1000;
		return this.setTime(iNewTimestamp);
	};

	/**
	 * Clones this UI5Date instance.
	 *
	 * @returns {Date|module:sap/ui/core/date/UI5Date} The cloned date instance
	 *
	 * @private
	 */
	UI5Date.prototype.clone = function () {
		return UI5Date.getInstance(this);
	};

	/**
	 * Returns the day of the month of this date instance according to the configured time zone,
	 * see <code>Date.prototype.getDate</code>.
	 *
	 * @returns {int}
	 *   A number between 1 and 31 representing the day of the month of this date instance according
	 *   to the configured time zone
	 *
	 * @public
	 */
	UI5Date.prototype.getDate = function () {
		return this._getPart("day");
	};

	/**
	 * Returns the day of the week of this date instance according to the configured time zone,
	 * see <code>Date.prototype.getDay</code>.
	 *
	 * @returns {int}
	 *   A number between 0 (Sunday) and 6 (Saturday) representing the day of the week of this date
	 *   instance according to the configured time zone
	 *
	 * @public
	 */
	UI5Date.prototype.getDay = function () {
		return this._getPart("weekday");
	};

	/**
	 * Returns the year of this date instance according to the configured time zone,
	 * see <code>Date.prototype.getFullYear</code>.
	 *
	 * @returns {int} The year of this date instance according to the configured time zone
	 *
	 * @public
	 */
	UI5Date.prototype.getFullYear = function () {
		return this._getPart("year");
	};

	/**
	 * Returns the hours of this date instance according to the configured time zone, see
	 * <code>Date.prototype.getHours</code>.
	 *
	 * @returns {int}
	 *   A number between 0 and 23 representing the hours of this date instance according to the
	 *   configured time zone
	 *
	 * @public
	 */
	UI5Date.prototype.getHours = function () {
		return this._getPart("hour");
	};

	/**
	 * Returns the milliseconds of this date instance according to the configured time zone,
	 * see <code>Date.prototype.getMilliseconds</code>.
	 *
	 * @returns {int}
	 *   A number between 0 and 999 representing the milliseconds of this date instance according to
	 *   the configured time zone
	 *
	 * @public
	 */
	UI5Date.prototype.getMilliseconds = function () {
		return this._getPart("fractionalSecond");
	};

	/**
	 * Returns the minutes of this date instance according to the configured time zone,
	 * see <code>Date.prototype.getMinutes</code>.
	 *
	 * @returns {int}
	 *   A number between 0 and 59 representing the minutes of this date instance according to the
	 *   configured time zone
	 *
	 * @public
	 */
	UI5Date.prototype.getMinutes = function () {
		return this._getPart("minute");
	};

	/**
	 * Returns the month index of this date instance according to the configured time zone,
	 * see <code>Date.prototype.getMonth</code>.
	 *
	 * @returns {int}
	 *   The month index between 0 (January) and 11 (December) of this date instance according to
	 *   the configured time zone
	 *
	 * @public
	 */
	UI5Date.prototype.getMonth = function () {
		return this._getPart("month");
	};

	/**
	 * Returns the seconds of this date instance according to the configured time zone,
	 * see <code>Date.prototype.getSeconds</code>.
	 *
	 * @returns {int}
	 *   A number between 0 and 59 representing the seconds of this date instance according to the
	 *   configured time zone
	 *
	 * @public
	 */
	UI5Date.prototype.getSeconds = function () {
		return this._getPart("second");
	};

	/**
	 * Returns the difference in minutes between the UTC and the configured time zone for this date,
	 * see <code>Date.prototype.getTimezoneOffset</code>.
	 *
	 * @returns {int}
	 *   The difference in minutes between the UTC and the configured time zone for this date
	 *
	 * @public
	 */
	UI5Date.prototype.getTimezoneOffset = function () {
		return TimezoneUtil.calculateOffset(this.oDate, this.sTimezoneID) / 60;
	};

	/**
	 * Returns the year of this date instance minus 1900 according to the configured time zone,
	 * see <code>Date.prototype.getYear</code>.
	 *
	 * @returns {int}
	 *   The year of this date instance minus 1900 according to the configured time zone
	 *
	 * @deprecated As of version 1.111 as it is deprecated in the base class JavaScript Date; use
	 *   {@link #getFullYear} instead
	 * @public
	 */
	UI5Date.prototype.getYear = function () {
		return this._getPart("year") - 1900;
	};

	/**
	 * Sets the day of the month for this date instance considering the configured time zone,
	 * see <code>Date.prototype.setDate</code>.
	 *
	 * @param {int} iDay
	 *   An integer representing the new day value, see <code>Date.prototype.setDate</code>
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @public
	 */
	UI5Date.prototype.setDate = function (iDay) {
		return this._setParts(["day"], arguments);
	};

	/**
	 * Sets the year, month and day for this date instance considering the configured time zone,
	 * see <code>Date.prototype.setFullYear</code>.
	 *
	 * @param {int} iYear An integer representing the new year value
	 * @param {int} [iMonth] An integer representing the new month index
	 * @param {int} [iDay] An integer representing the new day value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @public
	 */
	UI5Date.prototype.setFullYear = function (iYear, iMonth, iDay) {
		return this._setParts(["year", "month", "day"], arguments);
	};

	/**
	 * Sets the hours, minutes, seconds and milliseconds for this date instance considering the
	 * configured time zone, see <code>Date.prototype.setHours</code>.
	 *
	 * @param {int} iHours An integer representing the new hour value
	 * @param {int} [iMinutes] An integer representing the new minutes value
	 * @param {int} [iSeconds] An integer representing the new seconds value
	 * @param {int} [iMilliseconds] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @public
	 */
	UI5Date.prototype.setHours = function (iHours, iMinutes, iSeconds, iMilliseconds) {
		return this._setParts(["hour", "minute", "second", "fractionalSecond"], arguments);
	};

	/**
	 * Sets the milliseconds for this date instance considering the configured time zone, see
	 * <code>Date.prototype.setMilliseconds</code>.
	 *
	 * @param {int} iMilliseconds An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @public
	 */
	UI5Date.prototype.setMilliseconds = function (iMilliseconds) {
		return this._setParts(["fractionalSecond"], arguments);
	};

	/**
	 * Sets the minutes, seconds and milliseconds for this date instance considering the configured
	 * time zone, see <code>Date.prototype.setMinutes</code>.
	 *
	 * @param {int} iMinutes An integer representing the new minutes value
	 * @param {int} [iSeconds] An integer representing the new seconds value
	 * @param {int} [iMilliseconds] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @public
	 */
	UI5Date.prototype.setMinutes = function (iMinutes, iSeconds, iMilliseconds) {
		return this._setParts(["minute", "second", "fractionalSecond"], arguments);
	};

	/**
	 * Sets the month and day for this date instance considering the configured time zone,
	 * see <code>Date.prototype.setMonth</code>.
	 *
	 * @param {int} iMonth An integer representing the new month index
	 * @param {int} [iDay] An integer representing the new day value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @public
	 */
	UI5Date.prototype.setMonth = function (iMonth, iDay) {
		return this._setParts(["month", "day"], arguments);
	};

	/**
	 * Sets the seconds and milliseconds for this date instance considering the configured time zone,
	 * see <code>Date.prototype.setSeconds</code>.
	 *
	 * @param {int} iSeconds An integer representing the new seconds value
	 * @param {int} [iMilliseconds] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @public
	 */
	UI5Date.prototype.setSeconds = function (iSeconds, iMilliseconds) {
		return this._setParts(["second", "fractionalSecond"], arguments);
	};

	/**
	 * Sets this date object to the given time represented by a number of milliseconds based on the
	 * UNIX epoch and resets the previously set date parts, see
	 * <code>Date.prototype.setTime</code>.
	 *
	 * @param {int} iTime The date time in milliseconds based in the UNIX epoch
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @public
	 */
	UI5Date.prototype.setTime = function (iTime) {
		this.oDateParts = undefined;
		return this.oDate.setTime(iTime);
	};

	/**
	 * Sets the year for this date instance plus 1900 considering the configured time zone, see
	 * <code>Date.prototype.setYear</code>.
	 *
	 * @param {int} iYear The year which is to be set for this date. If iYear is a number between 0
	 *   and 99 (inclusive), then the year for this date is set to 1900 + iYear. Otherwise, the year
	 *   for this date is set to iYear.
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @deprecated As of version 1.111 as it is deprecated in the base class JavaScript Date; use
	 *   {@link #setFullYear} instead
	 * @public
	 */
	UI5Date.prototype.setYear = function (iYear) {
		var iValue = parseInt(iYear);

		iValue =  (iValue < 0 || iValue > 99) ?  iValue : iValue + 1900;

		return this._setParts(["year"], [iValue]);
	};

	/**
	 * Returns this date object to the given time represented by a number of milliseconds based on the
	 * UNIX epoch, see <code>Date.prototype.getTime</code>.
	 *
	 * @returns {int}
	 *   The timestamp in milliseconds of this date based on the UNIX epoch, or <code>NaN</code> if
	 *   the date is an invalid date
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.getTime
	 * @public
	 */

	/**
	 * Returns the day of the month of this date instance according to universal time,
	 * see <code>Date.prototype.getUTCDate</code>.
	 *
	 * @returns {int}
	 *   A number between 1 and 31 representing the day of the month of this date instance according
	 *   to universal time
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.getUTCDate
	 * @public
	 */

	/**
	 *
	 * Returns the day of the week of this date instance according to universal time,
	 * see <code>Date.prototype.getUTCDay</code>.
	 *
	 * @returns {int}
	 *   A number between 0 (Sunday) and 6 (Saturday) representing the day of the week of this date
	 *   instance according to universal time
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.getUTCDay
	 * @public
	 */

	/**
	 * Returns the year of this date instance according to universal time, see
	 * <code>Date.prototype.getUTCFullYear</code>.
	 *
	 * @returns {int} The year of this date instance according to universal time
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.getUTCFullYear
	 * @public
	 */

	/**
	 * Returns the hours of this date instance according to universal time, see
	 * <code>Date.prototype.getUTCHours</code>.
	 *
	 * @returns {int}
	 *   A number between 0 and 23 representing the hours of this date instance according to
	 *   universal time
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.getUTCHours
	 * @public
	 */

	/**
	 * Returns the milliseconds of this date instance according to universal time,
	 * see <code>Date.prototype.getUTCMilliseconds</code>.
	 *
	 * @returns {int}
	 *   A number between 0 and 999 representing the milliseconds of this date instance according to
	 *   universal time
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.getUTCMilliseconds
	 * @public
	 */

	/**
	 * Returns the minutes of this date instance according to universal time, see
	 * <code>Date.prototype.getUTCMinutes</code>.
	 *
	 * @returns {int}
	 *   A number between 0 and 59 representing the minutes of this date instance according to
	 *   universal time
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.getUTCMinutes
	 * @public
	 */

	/**
	 * Returns the month index of this date instance according to universal time, see
	 * <code>Date.prototype.getUTCMonth</code>.
	 *
	 * @returns {int}
	 *   The month index between 0 (January) and 11 (December) of this date instance according to
	 *   universal time
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.getUTCMonth
	 * @public
	 */

	/**
	 * Returns the seconds of this date instance according to universal time, see
	 * <code>Date.prototype.getUTCSeconds</code>.
	 *
	 * @returns {int}
	 *   A number between 0 and 59 representing the seconds of this date instance according to
	 *   universal time
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.getUTCSeconds
	 * @public
	 */

	/**
	 * Sets the day of the month for this date instance according to universal time,
	 * see <code>Date.prototype.setUTCDate</code>.
	 *
	 * @param {int} iDay
	 *   An integer representing the new day value, see <code>Date.prototype.setUTCDate</code>
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.setUTCDate
	 * @public
	 */

	/**
	 * Sets the year, month and day for this date instance according to universal time,
	 * see <code>Date.prototype.setUTCFullYear</code>.
	 *
	 * @param {int} iYear An integer representing the new year value
	 * @param {int} [iMonth] An integer representing the new month index
	 * @param {int} [iDay] An integer representing the new day value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.setUTCFullYear
	 * @public
	 */

	/**
	 * Sets the hours, minutes, seconds and milliseconds for this date instance according to
	 * universal time, see <code>Date.prototype.setUTCHours</code>.
	 *
	 * @param {int} iHours An integer representing the new hour value
	 * @param {int} [iMinutes] An integer representing the new minutes value
	 * @param {int} [iSeconds] An integer representing the new seconds value
	 * @param {int} [iMilliseconds] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.setUTCHours
	 * @public
	 */

	/**
	 * Sets the milliseconds for this date instance according to universal time, see
	 * <code>Date.prototype.setUTCMilliseconds</code>.
	 *
	 * @param {int} iMilliseconds An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.setUTCMilliseconds
	 * @public
	 */

	/**
	 * Sets the minutes, seconds and milliseconds for this date instance according to universal
	 * time, see <code>Date.prototype.setUTCMinutes</code>.
	 *
	 * @param {int} iMinutes An integer representing the new minutes value
	 * @param {int} [iSeconds] An integer representing the new seconds value
	 * @param {int} [iMilliseconds] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.setUTCMinutes
	 * @public
	 */

	/**
	 * Sets the month and day for this date instance according to universal time,
	 * see <code>Date.prototype.setUTCMonth</code>.
	 *
	 * @param {int} iMonth An integer representing the new month index
	 * @param {int} [iDay] An integer representing the new day value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.setUTCMonth
	 * @public
	 */

	/**
	 * Sets the seconds and milliseconds for this date instance  according to universal time,
	 * see <code>Date.prototype.setUTCSeconds</code>.
	 *
	 * @param {int} iSeconds An integer representing the new seconds value
	 * @param {int} [iMilliseconds] An integer representing the new milliseconds value
	 * @returns {int}
	 *   The milliseconds of the new timestamp based on the UNIX epoch, or <code>NaN</code> if the
	 *   timestamp could not be updated
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.setUTCSeconds
	 * @public
	 */

	/**
	 * Converts this date to a string, interpreting it in the UTC time zone, see
	 * <code>Date.prototype.toGMTString</code>.
	 *
	 * @returns {string} The converted date as string in the UTC time zone
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.toGMTString
	 * @public
	 */

	/**
	 * Converts this date to a string in ISO format in the UTC offset zero time zone, as denoted
	 * by the suffix <code>Z</code>, see <code>Date.prototype.toISOString</code>.
	 *
	 * @returns {string}
	 *   The converted date as a string in ISO format, in the UTC offset zero time zone
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.toISOString
	 * @public
	 */

	/**
	 * Returns a string representation of this date object, see <code>Date.prototype.toJSON</code>.
	 *
	 * @returns {string} The date object representation as a string
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.toJSON
	 * @public
	 */

	/**
	 * Returns the date portion of this date object interpreted in the configured time zone in
	 * English, see <code>Date.prototype.toDateString</code>.
	 *
	 * @returns {string}
	 *   The date portion of this date object interpreted in the configured time zone in English
	 *
	 * @public
	 */
	UI5Date.prototype.toDateString = function () {
		if (isNaN(this.oDate)) {
			return this.oDate.toDateString();
		}

		return aWeekday[this.getDay()] + " " + aMonths[this.getMonth()] + " "
			+ addLeadingZeros(this.getDate(), 2) + " " + addLeadingZeros(this.getFullYear(), 4);
	};

	/**
	 * Returns a string with a language-dependent representation of the date part of this date
	 * object interpreted by default in the configured time zone, see
	 * <code>Date.prototype.toLocaleDateString</code>.
	 *
	 * @param {string} [sLocale=sap.ui.core.Configuration.getLanguageTag()]
	 *   The locale used for formatting; the configured locale by default
	 * @param {object} [oOptions]
	 *   The options object used for formatting, corresponding to the options parameter of the
	 *   <code>Intl.DateTimeFormat</code> constructor
	 * @param {string} [oOptions.timeZone=sap.ui.core.Configuration.getTimezone()]
	 *   The IANA time zone ID; the configured time zone by default
	 * @returns {string}
	 *   The language-dependent representation of the date part of this date object
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.toLocaleDateString
	 * @public
	 */

	/**
	 * Returns a string with a language-dependent representation of this date object interpreted by
	 * default in the configured time zone, see <code>Date.prototype.toLocaleString</code>.
	 *
	 * @param {string} [sLocale=sap.ui.core.Configuration.getLanguageTag()]
	 *   The locale used for formatting; the configured locale by default
	 * @param {object} [oOptions]
	 *   The options object used for formatting, corresponding to the options parameter of the
	 *   <code>Intl.DateTimeFormat</code> constructor
	 * @param {string} [oOptions.timeZone=sap.ui.core.Configuration.getTimezone()]
	 *   The IANA time zone ID; the configured time zone by default
	 * @returns {string}
	 *   The language-dependent representation of this date object
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.toLocaleString
	 * @public
	 */

	/**
	 * Returns a string with a language-dependent representation of the time part of this date
	 * object interpreted by default in the configured time zone, see
	 * <code>Date.prototype.toLocaleTimeString</code>.
	 *
	 * @param {string} [sLocale=sap.ui.core.Configuration.getLanguageTag()]
	 *   The locale used for formatting; the configured locale by default
	 * @param {object} [oOptions]
	 *   The options object used for formatting, corresponding to the options parameter of the
	 *   <code>Intl.DateTimeFormat</code> constructor
	 * @param {string} [oOptions.timeZone=sap.ui.core.Configuration.getTimezone()]
	 *   The IANA time zone ID; the configured time zone by default
	 * @returns {string}
	 *   The language-dependent representation of the time part of this date object
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.toLocaleTimeString
	 * @public
	 */

	/**
	 * Returns a string representing this date object interpreted in the configured time zone.
	 *
	 * @returns {string}
	 *   A string representing this date object interpreted in the configured time zone
	 *
	 * @public
	 */
	UI5Date.prototype.toString = function () {
		if (isNaN(this.oDate)) {
			return this.oDate.toString();
		}

		return this.toDateString() + " " + this.toTimeString();
	};

	/**
	 * Returns the time portion of this date object interpreted in the configured time zone in English.
	 *
	 * @returns {string}
	 *   The time portion of this date object interpreted in the configured time zone in English
	 *
	 * @public
	 */
	UI5Date.prototype.toTimeString = function () {
		var iHours, iMinutes, sSign, iTimeZoneOffset;
		if (isNaN(this.oDate)) {
			return this.oDate.toTimeString();
		}
		iTimeZoneOffset = this.getTimezoneOffset();
		sSign = iTimeZoneOffset > 0 ? "-" : "+";
		iHours = Math.floor(Math.abs(iTimeZoneOffset) / 60);
		iMinutes = Math.abs(iTimeZoneOffset) % 60;

		// ommit the optional, implementation dependent time zone name
		return addLeadingZeros(this.getHours(), 2) + ":" + addLeadingZeros(this.getMinutes(), 2)
			+ ":" + addLeadingZeros(this.getSeconds(), 2) + " GMT" + sSign
			+ addLeadingZeros(iHours, 2) + addLeadingZeros(iMinutes, 2);
	};

	/**
	 * Converts this date to a string, interpreting it in the UTC time zone, see
	 * <code>Date.prototype.toUTCString</code>.
	 *
	 * @returns {string} The converted date as a string in the UTC time zone
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.toUTCString
	 * @public
	 */

	/**
	 * Returns the value of this date object in milliseconds based on the UNIX epoch, see
	 * <code>Date.prototype.valueOf</code>.
	 *
	 * @returns {int} The primitive value of this date object in milliseconds based on the UNIX epoch
	 *
	 * @function
	 * @name module:sap/ui/core/date/UI5Date.prototype.valueOf
	 * @public
	 */

	// functions that simply delegate to the inner date instance
	[
		"getTime", "getUTCDate", "getUTCDay", "getUTCFullYear", "getUTCHours", "getUTCMilliseconds",
		"getUTCMinutes", "getUTCMonth", "getUTCSeconds",
		"toGMTString", "toISOString", "toJSON", "toUTCString", "valueOf"
	].forEach(function (sMethod) {
		UI5Date.prototype[sMethod] = function () {
			return this.oDate[sMethod].apply(this.oDate, arguments);
		};
	});

	["toLocaleDateString", "toLocaleString", "toLocaleTimeString"].forEach(function (sMethod) {
		UI5Date.prototype[sMethod] = function (sLocale, oOptions) {
			return this.oDate[sMethod](sLocale || Configuration.getLanguageTag(),
				Object.assign({timeZone: this.sTimezoneID}, oOptions));
		};
	});

	// before delegating to the inner date instance clear the cached date parts
	[
		"setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes",
		"setUTCMonth", "setUTCSeconds"
	].forEach(function (sMethod) {
		UI5Date.prototype[sMethod] = function () {
			this.oDateParts = undefined;
			return this.oDate[sMethod].apply(this.oDate, arguments);
		};
	});

	/**
	 * Creates a JavaScript Date instance.
	 *
	 * @param {object} vParts
	 *   The <code>arguments</code> object which is given to
	 *   <code>module:sap/ui/core/date/UI5Date.getInstance</code>
	 * @returns {Date}
	 *   A JavaScript Date instance
	 *
	 * @private
	 */
	UI5Date._createDateInstance = function (vParts) {
		if (vParts[0] instanceof Date) {
			vParts[0] = vParts[0].valueOf();
		}

		// ES5 variant of new Date(...vParts)
		return new (Function.prototype.bind.apply(Date, [].concat.apply([null], vParts)))();
	};

	/**
	 * Creates a date instance (either JavaScript Date or <code>UI5Date</code>) which considers the
	 * configured time zone wherever JavaScript Date uses the local browser time zone, for example
	 * in <code>getDate</code>, <code>toString</code>, or <code>setHours</code>. The supported
	 * parameters are the same as the ones supported by the JavaScript Date constructor.
	 *
	 * <b>Note:</b> Adjusting the time zone in a running application can lead to unexpected data
	 * inconsistencies. For more information, see {@link sap.ui.core.Configuration#setTimezone}.
	 *
	 * @param {int|string|Date|module:sap/ui/core/date/UI5Date|null} [vYearOrValue]
	 *   Same meaning as in the JavaScript Date constructor
	 * @param {int|string} [vMonthIndex]
	 *   Same meaning as in the JavaScript Date constructor
	 * @param {int|string} [vDay=1] Same meaning as in the JavaScript Date constructor
	 * @param {int|string} [vHours=0] Same meaning as in the JavaScript Date constructor
	 * @param {int|string} [vMinutes=0] Same meaning as in the JavaScript Date constructor
	 * @param {int|string} [vSeconds=0] Same meaning as in the JavaScript Date constructor
	 * @param {int|string} [vMilliseconds=0] Same meaning as in the JavaScript Date constructor
	 * @returns {Date|module:sap/ui/core/date/UI5Date}
	 *   The date instance that considers the configured time zone in all local getters and setters.
	 *
	 * @public
	 * @see sap.ui.core.Configuration#getTimezone
	 */
	UI5Date.getInstance = function () {
		var sTimezone = Configuration.getTimezone();

		if (sTimezone !== TimezoneUtil.getLocalTimezone()) {
			return new UI5Date(arguments, sTimezone);
		}
		// time zones are equal -> use JavaScript Date as it is
		return UI5Date._createDateInstance(arguments);
	};

	/**
	 * Checks whether the given date object is a valid date, considers the configured time zone
	 * and throws an error otherwise.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate
	 *   The date object created via <code>UI5Date.getInstance</code>
	 * @throws {Error}
	 *   If the given date object is not valid or does not consider the configured time zone
	 *
	 * @private
	 */
	UI5Date.checkDate = function (oDate) {
		if (isNaN(oDate.getTime())) {
			throw new Error("The given Date is not valid");
		}
		if (!(oDate instanceof UI5Date) && (Configuration.getTimezone() !== TimezoneUtil.getLocalTimezone())) {
			throw new Error("Configured time zone requires the parameter 'oDate' to be an instance of"
				+ " sap.ui.core.date.UI5Date");
		}
	};

	return UI5Date;
});
