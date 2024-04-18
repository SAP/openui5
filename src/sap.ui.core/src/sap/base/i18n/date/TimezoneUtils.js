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
	 * @alias module:sap/base/i18n/date/TimezoneUtils
	 * @private
	 */
	var TimezoneUtils = {};

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
				era: 'narrow',
				weekday: "short"
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
	 * @ui5-restricted sap.ui.comp.util.DateTimeUtil, sap.ui.core.format.DateFormat, sap.viz,
	 *   sap/base/i18n/Localization, sap/ui/core/format/TimezoneUtil
	 */
	TimezoneUtils.isValidTimezone = function(sTimezone) {
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
	 * TimezoneUtils.convertToTimezone(oDate, "America/New_York");
	 * // result is:
	 * // 2021-10-13 11:22:33 in America/New_York
	 * // same as new Date("2021-10-13T11:22:33Z"); // UTC
	 *
	 * @param {Date} oDate The date which should be converted.
	 * @param {string} sTargetTimezone The target IANA timezone ID, e.g <code>"Europe/Berlin"</code>
	 * @returns {Date} The new date in the target time zone.
	 * @private
	 * @ui5-restricted sap.ui.core.format.DateFormat, sap.ui.comp.util.DateTimeUtil, sap.viz,
	 *   sap/ui/core/format/TimezoneUtil
	 */
	TimezoneUtils.convertToTimezone = function(oDate, sTargetTimezone) {
		var oFormatParts = this._getParts(oDate, sTargetTimezone);
		return TimezoneUtils._getDateFromParts(oFormatParts);
	};

	/**
	 * Uses the <code>Intl.DateTimeFormat</code> API to convert a date to a specific time zone.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts
	 * @param {Date} oDate The date which should be converted.
	 * @param {string} sTargetTimezone The target IANA timezone ID, e.g <code>"Europe/Berlin"</code>
	 * @returns {{
	 *     day: string,
	 *     era: string,
	 *     fractionalSecond: string,
	 *     hour: string,
	 *     minute: string,
	 *     month: string,
	 *     second: string,
	 *     timeZoneName: string,
	 *     weekday: string,
	 *     year: string
	 * }} An object containing the date and time fields considering the target time zone.
	 * @private
	 * @ui5-restricted sap.viz, sap/ui/core/date/UI5Date, sap/ui/core/format/TimezoneUtil
	 */
	TimezoneUtils._getParts = function(oDate, sTargetTimezone) {
		var sKey, oPart,
			oDateParts = Object.create(null),
			oIntlDate = oIntlDateTimeFormatCache.get(sTargetTimezone),
			// clone the date object before passing it to the Intl API, to ensure that no
			// UniversalDate gets passed to it;
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			oParts = oIntlDate.formatToParts(new Date(oDate.getTime()));

		for (sKey in oParts) {
			oPart = oParts[sKey];
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
	 * @ui5-restricted sap.viz, sap/ui/core/date/UI5Date, sap/ui/core/format/TimezoneUtil
	 */
	TimezoneUtils._getDateFromParts = function(oParts) {
		// no need to use UI5Date.getInstance as only the UTC timestamp is used
		var oDate = new Date(0),
			iUTCYear = parseInt(oParts.year);

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
			parseInt(oParts.fractionalSecond || 0)); // some older browsers don't support fractionalSecond, e.g. Safari < 14.1 */

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
	 * TimezoneUtils.calculateOffset(oDate, "America/New_York");
	 * // => +14400 seconds (4 * 60 * 60 seconds)
	 *
	 * TimezoneUtils.calculateOffset(oDate, "Europe/Berlin");
	 * // => -7200 seconds (-2 * 60 * 60 seconds)
	 *
	 * // daylight saving time (2018 Sun, 25 Mar, 02:00	CET → CEST	+1 hour (DST start)	UTC+2h)
	 * // the given date is taken as it is in the time zone
	 * TimezoneUtils.calculateOffset(new Date("2018-03-25T00:00:00Z"), "Europe/Berlin");
	 * // => -3600 seconds (-1 * 60 * 60 seconds), interpreted as: 2018-03-25 00:00:00 (CET)
	 *
	 * TimezoneUtils.calculateOffset(new Date("2018-03-25T03:00:00Z"), "Europe/Berlin");
	 * // => -7200 seconds (-2 * 60 * 60 seconds)
	 *
	 * var oHistoricalDate = new Date("1800-10-13T13:22:33Z");
	 * TimezoneUtils.calculateOffset(oHistoricalDate, "Europe/Berlin");
	 * // => -3208 seconds (-3208 seconds)
	 *
	 * @param {Date} oDate The date in the time zone used to calculate the offset to UTC.
	 * @param {string} sTimezoneSource The source IANA timezone ID, e.g <code>"Europe/Berlin"</code>
	 * @returns {number} The difference to UTC between the date in the time zone.
	 * @private
	 * @ui5-restricted sap.ui.core.format.DateFormat, sap.viz, sap/ui/core/date/UI5Date,
	 *   sap/ui/core/format/TimezoneUtil
	 */
	TimezoneUtils.calculateOffset = function(oDate, sTimezoneSource) {
		const oDateInTimezone = TimezoneUtils.convertToTimezone(oDate, sTimezoneSource);
		const iGivenTimestamp = oDate.getTime();
		const iInitialOffset = iGivenTimestamp - oDateInTimezone.getTime();
		// no need to use UI5Date.getInstance as only the UTC timestamp is used
		const oFirstGuess = new Date(iGivenTimestamp + iInitialOffset);
		const oFirstGuessInTimezone = TimezoneUtils.convertToTimezone(oFirstGuess, sTimezoneSource);
		const iFirstGuessInTimezoneTimestamp = oFirstGuessInTimezone.getTime();
		const iSecondOffset = oFirstGuess.getTime() - iFirstGuessInTimezoneTimestamp;
		let iTimezoneOffset = iSecondOffset;

		if (iInitialOffset !== iSecondOffset) {
			const oSecondGuess = new Date(iGivenTimestamp + iSecondOffset);
			const oSecondGuessInTimezone = TimezoneUtils.convertToTimezone(oSecondGuess, sTimezoneSource);
			const iSecondGuessInTimezoneTimestamp = oSecondGuessInTimezone.getTime();
			// if time is different, the given date/time does not exist in the target time zone (switch to Daylight
			// Saving Time) -> take the offset for the greater date
			if (iSecondGuessInTimezoneTimestamp !== iGivenTimestamp
					&& iFirstGuessInTimezoneTimestamp > iSecondGuessInTimezoneTimestamp) {
				iTimezoneOffset = iInitialOffset;
			}
		}
		return iTimezoneOffset / 1000;
	};

	/**
	 * Map outdated IANA timezone IDs used in CLDR to correct and up-to-date IANA IDs as maintained in ABAP systems.
	 *
	 * @private
 	 */
	TimezoneUtils.mCLDR2ABAPTimezones = {
		"America/Buenos_Aires": "America/Argentina/Buenos_Aires",
		"America/Catamarca": "America/Argentina/Catamarca",
		"America/Cordoba": "America/Argentina/Cordoba",
		"America/Jujuy": "America/Argentina/Jujuy",
		"America/Mendoza": "America/Argentina/Mendoza",
		"America/Indianapolis": "America/Indiana/Indianapolis",
		"America/Louisville": "America/Kentucky/Louisville",
		"Africa/Asmera": "Africa/Asmara",
		"Asia/Katmandu": "Asia/Kathmandu",
		"Asia/Calcutta": "Asia/Kolkata",
		"Atlantic/Faeroe": "Atlantic/Faroe",
		"Pacific/Ponape": "Pacific/Pohnpei",
		"Asia/Rangoon": "Asia/Yangon",
		"Pacific/Truk": "Pacific/Chuuk",
		"America/Godthab": "America/Nuuk",
		"Asia/Saigon": "Asia/Ho_Chi_Minh",
		"America/Coral_Harbour": "America/Atikokan"
	};

	/**
	 * Retrieves the browser's local IANA timezone ID; if the browser's timezone ID is not the up-to-date IANA
	 * timezone ID, the corresponding IANA timezone ID is returned.
	 *
	 * @returns {string} The local IANA timezone ID of the browser as up-to-date IANA timezone ID,
	 *   e.g. <code>"Europe/Berlin"</code> or <code>"Asia/Kolkata"</code>
	 *
	 * @private
	 * @ui5-restricted sap.gantt, sap.gantt, sap.viz, lib/cldr-openui5/lib/Generator,
	 *   sap/base/i18n/Localization, sap/ui/core/date/UI5Date, sap/ui/core/format/TimezoneUtil
	 */
	TimezoneUtils.getLocalTimezone = function() {
		if (sLocalTimezone === "") { // timezone may be undefined, only value "" means empty cache
			sLocalTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
			sLocalTimezone = TimezoneUtils.mCLDR2ABAPTimezones[sLocalTimezone] || sLocalTimezone;
		}

		return sLocalTimezone;
	};

	/**
	 * Clears the cache for the browser's local IANA timezone ID.
	 *
	 * @private
	 */
	TimezoneUtils._clearLocalTimezoneCache = function () {
		sLocalTimezone = "";
	};

	return TimezoneUtils;
});
