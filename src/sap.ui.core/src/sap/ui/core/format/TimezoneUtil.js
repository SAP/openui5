/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Static collection of utility functions to handle time zone related conversions
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.core.format.TimezoneUtil
	 * @private
	 * @ui5-restricted sap.ui.core.Configuration, sap.ui.core.format.DateFormat
	 */
	var TimezoneUtil = {};

	/**
	 * Cache for the (browser's) local IANA timezone ID
	 *
	 * @type {string}
	 */
	var sLocalTimezone = "";

	/**
	 * Cache for valid time zones provided by <code>Intl.supportedValuesOf("timeZone")</code>
	 *
	 * @type {Array}
	 */
	var aSupportedTimezoneIDs;

	/**
	 * Cache for Intl.DateTimeFormat instances
	 */
	var oIntlDateTimeFormatCache = {
		_oCache: new Map(),
		/**
		 * When cache limit is reached, it gets cleared
		 */
		_iCacheLimit: 10,

		/**
		 * Creates or gets an instance of Intl.DateTimeFormat.
		 *
		 * @param {string} sTimezone IANA timezone ID
		 * @returns {Intl.DateTimeFormat} Intl.DateTimeFormat instance
		 */
		get: function (sTimezone) {
			var cacheEntry = this._oCache.get(sTimezone);
			if (cacheEntry) {
				return cacheEntry;
			}

			var oOptions = {
				hourCycle: "h23",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				fractionalSecondDigits: 3,
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				timeZone: sTimezone,
				timeZoneName: 'short',
				era: 'narrow'
			};
			var oInstance = new Intl.DateTimeFormat("en-US", oOptions);

			// only store a limited number of entries in the cache
			if (this._oCache.size === this._iCacheLimit) {
				this._oCache = new Map();
			}
			this._oCache.set(sTimezone, oInstance);
			return oInstance;
		}
	};

	/**
	 * Uses the <code>Intl.supportedValuesOf('timeZone')</code> and <code>Intl.DateTimeFormat</code>
	 * API to check if the browser can handle the given IANA timezone ID.
	 * <code>Intl.supportedValuesOf('timeZone')</code> offers direct access to the list of supported
	 * time zones. It is not yet supported by all browsers but if it is supported and the given time
	 * zone is in the list it is faster than probing.
	 *
	 * <code>Intl.supportedValuesOf('timeZone')</code> does not return all IANA timezone IDs which
	 * the <code>Intl.DateTimeFormat</code> can handle, e.g. "Japan", "Etc/UTC".
	 *
	 * @param {string} sTimezone The IANA timezone ID which is checked, e.g <code>"Europe/Berlin"</code>
	 * @returns {boolean} Whether the time zone is a valid IANA timezone ID
	 * @private
	 * @ui5-restricted sap.ui.core.Configuration, sap.ui.core.format.DateFormat
	 */
	TimezoneUtil.isValidTimezone = function(sTimezone) {
		if (!sTimezone) {
			return false;
		}

		if (Intl.supportedValuesOf) {
			try {
				aSupportedTimezoneIDs = aSupportedTimezoneIDs || Intl.supportedValuesOf('timeZone');
				if (aSupportedTimezoneIDs.includes(sTimezone)) {
					return true;
				}
				// although not contained in the supportedValues it still can be valid, therefore continue
			} catch (oError) {
				// ignore error
				aSupportedTimezoneIDs = [];
			}
		}

		try {
			oIntlDateTimeFormatCache.get(sTimezone);
			return true;
		} catch (oError) {
			return false;
		}
	};

	/**
	 * Converts a date to a specific time zone.
	 * The resulting date reflects the given time zone such that the "UTC" Date methods
	 * can be used, e.g. Date#getUTCHours() to display the hours in the given time zone.
	 *
	 * @example
	 * var oDate = new Date("2021-10-13T15:22:33Z"); // UTC
	 * // time zone difference UTC-4 (DST)
	 * TimezoneUtil.convertToTimezone(oDate, "America/New_York");
	 * // 2021-10-13 11:22:33 in America/New_York
	 *
	 * @param {Date} oDate The date which should be converted.
	 * @param {string} sTargetTimezone The target IANA timezone ID, e.g <code>"Europe/Berlin"</code>
	 * @returns {Date} The new date in the target time zone.
	 * @private
	 * @ui5-restricted sap.ui.core.format.DateFormat, sap.ui.unified, sap.m
	 */
	TimezoneUtil.convertToTimezone = function(oDate, sTargetTimezone) {
		var oFormatParts = this._getParts(oDate, sTargetTimezone);
		return TimezoneUtil._getDateFromParts(oFormatParts);
	};

	/**
	 * Uses the <code>Intl.DateTimeFormat</code> API to convert a date to a specific time zone.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts
	 * @param {Date} oDate The date which should be converted.
	 * @param {string} sTargetTimezone The target IANA timezone ID, e.g <code>"Europe/Berlin"</code>
	 * @returns {{
	 *     month: string,
	 *     day: string,
	 *     year: string,
	 *     hour: string,
	 *     minute: string,
	 *     second: string,
	 *     era: string,
	 *     fractionalSecond: string,
	 *     timeZoneName: string
	 * }} An object containing the date and time fields considering the target time zone.
	 * @private
	 */
	TimezoneUtil._getParts = function(oDate, sTargetTimezone) {
		var oIntlDate = oIntlDateTimeFormatCache.get(sTargetTimezone);
		// clone the date object before passing it to the Intl API, to ensure that no
		// UniversalDate gets passed to it
		var oParts = oIntlDate.formatToParts(new Date(oDate.getTime()));
		var oDateParts = Object.create(null);
		for (var sKey in oParts) {
			var oPart = oParts[sKey];
			if (oPart.type !== "literal") {
				oDateParts[oPart.type] = oPart.value;
			}
		}
		return oDateParts;
	};

	/**
	 * Creates a Date from the provided date parts.
	 *
	 * @param {object} oParts Separated date and time fields as object, see {@link #_getParts}.
	 * @returns {Date} Returns the date object created from the provided parts.
	 * @private
	 */
	TimezoneUtil._getDateFromParts = function(oParts) {
		var oDate = new Date(0);

		var iUTCYear = parseInt(oParts.year);
		if (oParts.era === "B") {
			// The JS Date uses astronomical year numbering which supports year zero and negative
			// year numbers.
			// The Intl.DateTimeFormat API uses eras (no year zero and no negative year numbers).
			// years around zero overview:
			// | Astronomical | In Era
			// |            2 | 2 Anno Domini (era: "A")
			// |            1 | 1 Anno Domini (era: "A")
			// |            0 | 1 Before Christ (era: "B")
			// |           -1 | 2 Before Christ (era: "B")
			// |           -2 | 3 Before Christ (era: "B")
			// For the conversion to the JS Date the parts returned by the Intl.DateTimeFormat API
			// need to be adapted.
			iUTCYear = (iUTCYear * -1) + 1;
		}

		// Date.UTC cannot be used here to be able to support dates before the UNIX epoch
		oDate.setUTCFullYear(iUTCYear,
			parseInt(oParts.month) - 1,
			parseInt(oParts.day));
		oDate.setUTCHours(
			parseInt(oParts.hour),
			parseInt(oParts.minute),
			parseInt(oParts.second),
			parseInt(oParts.fractionalSecond));

		return oDate;
	};

	/**
	 * Gets the offset to UTC in seconds for a given date in the time zone specified.
	 *
	 * For non-unique points in time, the daylight saving time takes precedence over the standard
	 * time shortly after the switch back (e.g. clock gets set back 1 hour, duplicate hour).
	 *
	 * @example
	 * var oDate = new Date("2021-10-13T13:22:33Z");
	 * TimezoneUtil.calculateOffset(oDate, "America/New_York");
	 * // => +14400 seconds (4 * 60 * 60 seconds)
	 *
	 * TimezoneUtil.calculateOffset(oDate, "Europe/Berlin");
	 * // => -7200 seconds (-2 * 60 * 60 seconds)
	 *
	 * // daylight saving time (2018 Sun, 25 Mar, 02:00	CET → CEST	+1 hour (DST start)	UTC+2h)
	 * // the given date is taken as it is in the time zone
	 * TimezoneUtil.calculateOffset(new Date("2018-03-25T00:00:00Z"), "Europe/Berlin");
	 * // => -3600 seconds (-1 * 60 * 60 seconds), interpreted as: 2018-03-25 00:00:00 (CET)
	 *
	 * TimezoneUtil.calculateOffset(new Date("2018-03-25T03:00:00Z"), "Europe/Berlin");
	 * // => -7200 seconds (-2 * 60 * 60 seconds)
	 *
	 * var oHistoricalDate = new Date("1800-10-13T13:22:33Z");
	 * TimezoneUtil.calculateOffset(oHistoricalDate, "Europe/Berlin");
	 * // => -3208 seconds (-3208 seconds)
	 *
	 * @param {Date} oDate The date in the time zone used to calculate the offset to UTC.
	 * @param {string} sTimezoneSource The source IANA timezone ID, e.g <code>"Europe/Berlin"</code>
	 * @returns {number} The difference to UTC between the date in the time zone.
	 * @private
	 * @ui5-restricted sap.ui.core.format.DateFormat
	 */
	TimezoneUtil.calculateOffset = function(oDate, sTimezoneSource) {
		var oFirstGuess = this.convertToTimezone(oDate, sTimezoneSource);

		var iInitialOffset = oDate.getTime() - oFirstGuess.getTime();

		// to get the correct summer/wintertime (daylight saving time) handling use the source date (apply the diff)
		var oDateSource = new Date(oDate.getTime() + iInitialOffset);
		var oDateTarget = this.convertToTimezone(oDateSource, sTimezoneSource);

		return (oDateSource.getTime() - oDateTarget.getTime()) / 1000;
	};

	/**
	 * Retrieves the browser's local IANA timezone ID.
	 *
	 * @returns {string} The local IANA timezone ID of the browser, e.g <code>"Europe/Berlin"</code>
	 * @private
	 * @ui5-restricted sap.ui.core.Configuration,sap.m.DateTimeField
	 */
	TimezoneUtil.getLocalTimezone = function() {
		if (sLocalTimezone) {
			return sLocalTimezone;
		}
		sLocalTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
		return sLocalTimezone;
	};


	return TimezoneUtil;
});
