/*!
 * ${copyright}
 */

// Provides class sap.ui.core.format.DateFormat
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/base/i18n/date/TimezoneUtils",
	"sap/base/strings/formatMessage",
	"sap/base/util/deepEqual",
	"sap/base/util/extend",
	"sap/ui/core/CalendarType",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/core/Supportability",
	"sap/ui/core/date/CalendarUtils",
	"sap/ui/core/date/CalendarWeekNumbering",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/format/FormatUtils"
], function(Log, Formatting, Localization, TimezoneUtils, formatMessage, deepEqual, extend, CalendarType,
		Library, Locale, LocaleData, Supportability, CalendarUtils, CalendarWeekNumbering, UI5Date,
		UniversalDate, FormatUtils) {
	"use strict";

	/**
	 * Constructor for DateFormat - must not be used:
	 * <ul>
	 *   <li>To get a {@link sap.ui.core.format.DateFormat} instance, please use {@link sap.ui.core.format.DateFormat.getDateInstance}, {@link sap.ui.core.format.DateFormat.getDateTimeInstance} or {@link sap.ui.core.format.DateFormat.getTimeInstance}</li>
	 *   <li>To get a {@link sap.ui.core.format.DateFormat.DateTimeWithTimezone} instance, please use {@link sap.ui.core.format.DateFormat.getDateTimeWithTimezoneInstance}</li>
	 * </ul>
	 *
	 * @class
	 * The DateFormat is a static class for formatting and parsing single date and time values or date and time intervals according
	 * to a set of format options.
	 *
	 * Important:
	 * Every Date is converted with the timezone taken from
	 * {@link module:sap/base/i18n/Localization.getTimezone Localization.getTimezone}.
	 * The timezone falls back to the browser's local timezone.
	 *
	 * Supported format options are pattern based on Unicode LDML Date Format notation. Please note that only a subset of the LDML date symbols
	 * is supported.
	 * If no pattern is specified a default pattern according to the locale settings is used.
	 *
	 * Documentation links:
	 * <ul>
	 *   <li>{@link topic:91f2eba36f4d1014b6dd926db0e91070 Date Format}</li>
	 *   <li>{@link http://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table}</li>
	 * </ul>
	 *
	 * @public
	 * @hideconstructor
	 * @alias sap.ui.core.format.DateFormat
	 */
	var DateFormat = function() {
		// Do not use the constructor
		throw new Error();
	};

	/**
	 * Internal enumeration to differentiate DateFormat types
	 */
	var mDateFormatTypes = {
		DATE: "date",
		TIME: "time",
		DATETIME: "datetime",
		DATETIME_WITH_TIMEZONE: "datetimeWithTimezone"
	};

	// Cache for parsed CLDR DatePattern
	var mCldrDatePattern = {};

	/**
	 * Timezone parameter type check
	 *
	 * @param {string} sTimezone The timezone to check
	 * @throws {TypeError} Thrown if the parameter <code>sTimezone</code> is provided and has the wrong type.
	 */
	var checkTimezoneParameterType = function (sTimezone) {
		if (typeof sTimezone !== "string" && !(sTimezone instanceof String) && sTimezone != null) {
			throw new TypeError("The given timezone must be a string.");
		}
	};

	DateFormat.oDateInfo = {
		type: mDateFormatTypes.DATE,
		oDefaultFormatOptions: {
			style: "medium",
			relativeScale: "day",
			relativeStyle: "wide"
		},
		aFallbackFormatOptions: [
			{style: "short"},
			{style: "medium"},
			{pattern: "yyyy-MM-dd"},
			{pattern: "yyyyMMdd", strictParsing: true}
		],
		bShortFallbackFormatOptions: true,
		bPatternFallbackWithoutDelimiter: true,
		getPattern: function(oLocaleData, sStyle, sCalendarType) {
			return oLocaleData.getDatePattern(sStyle, sCalendarType);
		},
		oRequiredParts: {
			"text": true, "year": true, "weekYear": true, "month": true, "day": true
		},
		aRelativeScales: ["year", "month", "week", "day"],
		aRelativeParseScales: ["year", "quarter", "month", "week", "day", "hour", "minute", "second"],
		aIntervalCompareFields: ["Era", "FullYear", "Quarter", "Month", "Week" ,"Date"]
	};

	DateFormat.oDateTimeInfo = {
		type: mDateFormatTypes.DATETIME,
		oDefaultFormatOptions: {
			style: "medium",
			relativeScale: "auto",
			relativeStyle: "wide"
		},
		aFallbackFormatOptions: [
			{style: "short"},
			{style: "medium"},
			{pattern: "yyyy-MM-dd'T'HH:mm:ss"},
			{pattern: "yyyyMMdd HHmmss"}
		],
		getPattern: function(oLocaleData, sStyle, sCalendarType) {
			// If style is mixed ("medium/short") split it and pass both parts separately
			var iSlashIndex = sStyle.indexOf("/");
			if (iSlashIndex > 0) {
				return oLocaleData.getCombinedDateTimePattern(sStyle.substr(0, iSlashIndex), sStyle.substr(iSlashIndex + 1), sCalendarType);
			} else {
				return oLocaleData.getCombinedDateTimePattern(sStyle, sStyle, sCalendarType);
			}
		},
		oRequiredParts: {
			"text": true, "year": true, "weekYear": true, "month": true, "day": true, "hour0_23": true,
			"hour1_24": true, "hour0_11": true, "hour1_12": true
		},
		aRelativeScales: ["year", "month", "week", "day", "hour", "minute", "second"],
		aRelativeParseScales: ["year", "quarter", "month", "week", "day", "hour", "minute", "second"],
		aIntervalCompareFields: ["Era", "FullYear", "Quarter", "Month", "Week", "Date", "DayPeriod", "Hours", "Minutes", "Seconds"]
	};

	/**
	 * Retrieves info object for timezone instance
	 *
	 * @param {object} oFormatOptions the format options, relevant are: showDate, showTime and showTimezone
	 * @returns {object} info object
	 * @private
	 */
	DateFormat._getDateTimeWithTimezoneInfo = function(oFormatOptions) {
		var bShowDate = oFormatOptions.showDate === undefined || oFormatOptions.showDate;
		var bShowTime = oFormatOptions.showTime === undefined || oFormatOptions.showTime;
		var bShowTimezone = oFormatOptions.showTimezone === undefined || oFormatOptions.showTimezone;

		var oBaselineType = DateFormat.oDateTimeInfo;
		if (bShowDate && !bShowTime) {
			oBaselineType = DateFormat.oDateInfo;
		} else if (!bShowDate && bShowTime) {
			oBaselineType = DateFormat.oTimeInfo;
		}
		return Object.assign({}, oBaselineType, {
			type: mDateFormatTypes.DATETIME_WITH_TIMEZONE,
			// This function is used to transform the pattern of the fallbackFormatOptions to a timezone pattern.
			getTimezonePattern: function(sPattern) {
				if (!bShowDate && !bShowTime && bShowTimezone) {
					return "VV";
				} else if (!bShowTimezone) {
					return sPattern;
				} else {
					return sPattern + " VV";
				}
			},
			getPattern: function(oLocaleData, sStyle, sCalendarType) {
				if (!bShowDate && !bShowTime && bShowTimezone) {
					return "VV";
				}
				if (!bShowTimezone) {
					return oBaselineType.getPattern(oLocaleData, sStyle, sCalendarType);
				}

				var sPattern = oBaselineType.getPattern(oLocaleData, sStyle, sCalendarType);
				return oLocaleData.applyTimezonePattern(sPattern);
			}
		});
	};

	DateFormat.oTimeInfo = {
		type: mDateFormatTypes.TIME,
		oDefaultFormatOptions: {
			style: "medium",
			relativeScale: "auto",
			relativeStyle: "wide"
		},
		aFallbackFormatOptions: [
			{style: "short"},
			{style: "medium"},
			{pattern: "HH:mm:ss"},
			{pattern: "HHmmss"}
		],
		getPattern: function(oLocaleData, sStyle, sCalendarType) {
			return oLocaleData.getTimePattern(sStyle, sCalendarType);
		},
		oRequiredParts: {
			"text": true, "hour0_23": true, "hour1_24": true, "hour0_11": true, "hour1_12": true
		},
		aRelativeScales: ["hour", "minute", "second"],
		aRelativeParseScales: ["year", "quarter", "month", "week", "day", "hour", "minute", "second"],
		aIntervalCompareFields: ["DayPeriod", "Hours", "Minutes", "Seconds"]
	};


	/**
	 * @see sap.ui.core.format.DateFormat.getDateInstance
	 */
	DateFormat.getInstance = function(oFormatOptions, oLocale) {
		return this.getDateInstance(oFormatOptions, oLocale);
	};


	/**
	 * Get a date instance of the DateFormat, which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.date.CalendarWeekNumbering} [oFormatOptions.calendarWeekNumbering] since 1.108.0 specifies the calendar week numbering.
	 *   If specified, this overwrites <code>oFormatOptions.firstDayOfWeek</code> and <code>oFormatOptions.minimalDaysInFirstWeek</code>.
	 * @param {int} [oFormatOptions.firstDayOfWeek] since 1.105.0 specifies the first day of the week starting with <code>0</code> (which is Sunday); if not defined, the value taken from the locale is used
	 * @param {int} [oFormatOptions.minimalDaysInFirstWeek] since 1.105.0 minimal days at the beginning of the year which define the first calendar week; if not defined, the value taken from the locale is used
	 * @param {string} [oFormatOptions.format] since 1.34.0 contains pattern symbols (e.g. "yMMMd" or "Hms") which will be converted into the pattern in the used locale, which matches the wanted symbols best.
	 *  The symbols must be in canonical order, that is: Era (G), Year (y/Y), Quarter (q/Q), Month (M/L), Week (w), Day-Of-Week (E/e/c), Day (d), Hour (h/H/k/K/j/J), Minute (m), Second (s), Timezone (z/Z/v/V/O/X/x)
	 *  See {@link http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems}
	 * @param {string} [oFormatOptions.pattern] a data pattern in LDML format. It is not verified whether the pattern represents only a date.
	 * @param {string} [oFormatOptions.style] can be either 'short, 'medium', 'long' or 'full'. If no pattern is given, a locale dependent default date pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] if true, by parsing it is checked if the value is a valid date
	 * @param {boolean} [oFormatOptions.relative] if true, the date is formatted relatively to todays date if it is within the given day range, e.g. "today", "1 day ago", "in 5 days"
	 * @param {int[]} [oFormatOptions.relativeRange] the day range used for relative formatting. If <code>oFormatOptions.relativeScale</code> is set to default value 'day', the relativeRange is by default [-6, 6], which means only the last 6 days, today and the next 6 days are formatted relatively. Otherwise when <code>oFormatOptions.relativeScale</code> is set to 'auto', all dates are formatted relatively.
	 * @param {string} [oFormatOptions.relativeScale="day"] if 'auto' is set, new relative time format is switched on for all Date/Time Instances. The relative scale is chosen depending on the difference between the given date and now.
	 * @param {string} [oFormatOptions.relativeStyle="wide"] since 1.32.10, 1.34.4 the style of the relative format. The valid values are "wide", "short", "narrow"
	 * @param {boolean} [oFormatOptions.interval=false] since 1.48.0 if true, the {@link sap.ui.core.format.DateFormat#format format} method expects an array with two dates as the first argument and formats them as interval. Further interval "Jan 10, 2008 - Jan 12, 2008" will be formatted as "Jan 10-12, 2008" if the 'format' option is set with necessary symbols.
	 *   Otherwise the two given dates are formatted separately and concatenated with local dependent pattern.
	 * @param {string} [oFormatOptions.intervalDelimiter]
	 *   Since 1.113.0, a delimiter for intervals. With a given interval delimiter a specific interval format is
	 *   created. <b>Example:</b> If <code>oFormatOptions.intervalDelimiter</code> is set to "...", an interval would be
	 *   given as "Jan 10, 2008...Feb 12, 2008".
	 *   <b>Note:</b> If this format option is set, the locale-specific interval notation is overruled, for example
	 *   "Jan 10 – Feb 12, 2008" becomes "Jan 10, 2008...Feb 12, 2008".
	 * @param {boolean} [oFormatOptions.singleIntervalValue=false] Only relevant if oFormatOptions.interval is set to 'true'. This allows to pass an array with only one date object to the {@link sap.ui.core.format.DateFormat#format format} method.
	 * @param {boolean} [oFormatOptions.UTC] if true, the date is formatted and parsed as UTC instead of the local timezone
	 * @param {sap.ui.core.CalendarType} [oFormatOptions.calendarType] The calender type which is used to format and parse the date. This value is by default either set in configuration or calculated based on current locale.
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @ui5-omissible-params oFormatOptions
	 * @return {sap.ui.core.format.DateFormat} date instance of the DateFormat
	 * @static
	 * @public
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>The <code>calendarWeekNumbering</code> format option has an unsupported value, or</li>
	 *   <li>only one of the <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> parameters was provided.</li>
	 * </ul>
	 */
	DateFormat.getDateInstance = function(oFormatOptions, oLocale) {
		return this.createInstance(oFormatOptions, oLocale, this.oDateInfo);
	};

	/**
	 * Get a datetime instance of the DateFormat, which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.date.CalendarWeekNumbering} [oFormatOptions.calendarWeekNumbering] since 1.108.0 specifies the calendar week numbering.
	 *   If specified, this overwrites <code>oFormatOptions.firstDayOfWeek</code> and <code>oFormatOptions.minimalDaysInFirstWeek</code>.
	 * @param {int} [oFormatOptions.firstDayOfWeek] since 1.105.0 specifies the first day of the week starting with <code>0</code> (which is Sunday); if not defined, the value taken from the locale is used
	 * @param {int} [oFormatOptions.minimalDaysInFirstWeek] since 1.105.0 minimal days at the beginning of the year which define the first calendar week; if not defined, the value taken from the locale is used
	 * @param {string} [oFormatOptions.format] since 1.34.0 contains pattern symbols (e.g. "yMMMd" or "Hms") which will be converted into the pattern in the used locale, which matches the wanted symbols best.
	 *  The symbols must be in canonical order, that is: Era (G), Year (y/Y), Quarter (q/Q), Month (M/L), Week (w), Day-Of-Week (E/e/c), Day (d), Hour (h/H/k/K/j/J), Minute (m), Second (s), Timezone (z/Z/v/V/O/X/x)
	 *  See http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems
	 * @param {string} [oFormatOptions.pattern] a datetime pattern in LDML format. It is not verified whether the pattern represents a full datetime.
	 * @param {string} [oFormatOptions.style] can be either 'short, 'medium', 'long' or 'full'. For datetime you can also define mixed styles, separated with a slash, where the first part is the date style and the second part is the time style (e.g. "medium/short"). If no pattern is given, a locale dependent default datetime pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] if true, by parsing it is checked if the value is a valid datetime
	 * @param {boolean} [oFormatOptions.relative] if true, the date is formatted relatively to today's date if it is within the given day range, e.g. "today", "1 day ago", "in 5 days"
	 * @param {int[]} [oFormatOptions.relativeRange] the day range used for relative formatting. If <code>oFormatOptions.relativeScale</code> is set to value 'day', the relativeRange is by default [-6, 6], which means only the last 6 days, today and the next 6 days are formatted relatively. Otherwise when <code>oFormatOptions.relativeScale</code> is set to 'auto', all dates are formatted relatively.
	 * @param {string} [oFormatOptions.relativeScale="auto"] if 'auto' is set, new relative time format is switched on for all Date/Time Instances. The relative scale is chosen depending on the difference between the given date and now.
	 * @param {string} [oFormatOptions.relativeStyle="wide"] since 1.32.10, 1.34.4 the style of the relative format. The valid values are "wide", "short", "narrow"
	 * @param {boolean} [oFormatOptions.interval=false] since 1.48.0 if true, the {@link sap.ui.core.format.DateFormat#format format} method expects an array with two dates as the first argument and formats them as interval. Further interval "Jan 10, 2008 - Jan 12, 2008" will be formatted as "Jan 10-12, 2008" if the 'format' option is set with necessary symbols.
	 *   Otherwise the two given dates are formatted separately and concatenated with local dependent pattern.
	 * @param {string} [oFormatOptions.intervalDelimiter]
	 *   Since 1.113.0, a delimiter for intervals. With a given interval delimiter a specific interval format is
	 *   created. <b>Example:</b> If <code>oFormatOptions.intervalDelimiter</code> is set to "...", an interval would be
	 *   given as "Jan 10, 2008, 9:15:00 AM...Jan 10, 2008, 11:45:00 AM".
	 *   <b>Note:</b> If this format option is set, the locale-specific interval notation is overruled, for example
	 *   "Jan 10, 2008, 9:15 – 11:45 AM" becomes "Jan 10, 2008, 9:15 AM...Jan 10, 2008, 11:45 AM".
	 * @param {boolean} [oFormatOptions.singleIntervalValue=false] Only relevant if oFormatOptions.interval is set to 'true'. This allows to pass an array with only one date object to the {@link sap.ui.core.format.DateFormat#format format} method.
	 * @param {boolean} [oFormatOptions.UTC] if true, the date is formatted and parsed as UTC instead of the local timezone
	 * @param {sap.ui.core.CalendarType} [oFormatOptions.calendarType] The calender type which is used to format and parse the date. This value is by default either set in configuration or calculated based on current locale.
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @ui5-omissible-params oFormatOptions
	 * @return {sap.ui.core.format.DateFormat} datetime instance of the DateFormat
	 * @static
	 * @public
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>The <code>calendarWeekNumbering</code> format option has an unsupported value, or</li>
	 *   <li>only one of the <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> parameters was provided.</li>
	 * </ul>
	 */
	DateFormat.getDateTimeInstance = function(oFormatOptions, oLocale) {
		return this.createInstance(oFormatOptions, oLocale, this.oDateTimeInfo);
	};

	/**
	 * Interface for a timezone-specific DateFormat, which is able to format and parse a date
	 * based on a given timezone. The timezone is used to convert the given date, and also for
	 * timezone-related pattern symbols. The timezone is an IANA timezone ID, e.g. "America/New_York".
	 *
	 * @see sap.ui.core.format.DateFormat
	 *
	 * @author SAP SE
	 * @since 1.99
	 * @interface
	 * @name sap.ui.core.format.DateFormat.DateTimeWithTimezone
	 * @public
	 */

	/**
	 * Format a date object to a string according to the given timezone and format options.
	 *
	 * @example <caption>Format option showTimezone: true (default)</caption>
	 * var oDate = UI5Date.getInstance("2021-12-24T13:37:00Z");
	 *
	 * DateFormat.getDateTimeWithTimezoneInstance().format(oDate, "Europe/Berlin");
	 * // output: "Dec 24, 2021, 2:37:00 PM Europe, Berlin"
	 *
	 * DateFormat.getDateTimeWithTimezoneInstance().format(oDate, "America/New_York");
	 * // output: "Dec 24, 2021, 8:37:00 AM Americas, New York"
	 *
	 * @example <caption>Format option showTimezone: false</caption>
	 * var oDate = UI5Date.getInstance("2021-12-24T13:37:00Z");
	 * DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false}).format(oDate, "America/New_York");
	 * // output: "Dec 24, 2021, 8:37:00 AM"
	 *
	 * @example <caption>Format option showDate: false and showTime:false</caption>
	 * var oDate = UI5Date.getInstance("2021-12-24T13:37:00Z");
	 * DateFormat.getDateTimeWithTimezoneInstance({showDate: false, showTime: false}).format(oDate, "America/New_York");
	 * // output: "Americas, New York"
	 *
	 * @param {Date} oJSDate The date to format
	 * @param {string} [sTimezone] The IANA timezone ID in which the date will be calculated and
	 *   formatted e.g. "America/New_York". If the parameter is omitted, <code>null</code> or an empty string, the
	 *   timezone will be taken from {@link module:sap/base/i18n/Localization.getTimezone Localization.getTimezone}.
	 *   For an invalid IANA time zone ID, an empty string will be returned.
	 * @throws {TypeError} Thrown if the parameter <code>sTimezone</code> is provided and has the wrong type.
	 * @return {string} the formatted output value. If an invalid date or timezone is given, an empty string is returned.
	 * @name sap.ui.core.format.DateFormat.DateTimeWithTimezone.format
	 * @function
	 * @public
	 * @since 1.99
	 */

	/**
	 * Parse a string which is formatted according to the given format options to an array
	 * containing a date object and the timezone.
	 *
	 * @example <caption>Format option showTimezone: true (default)</caption>
	 * var oDate = UI5Date.getInstance("2021-12-24T13:37:00Z");
	 *
	 * DateFormat.getDateTimeWithTimezoneInstance().parse("Dec 24, 2021, 2:37:00 PM Europe, Berlin", "Europe/Berlin");
	 * // output: [oDate, "Europe/Berlin"]
	 *
	 * DateFormat.getDateTimeWithTimezoneInstance().parse("Dec 24, 2021, 8:37:00 AM Americas, New York", "America/New_York");
	 * // output: [oDate, "America/New_York"]
	 *
	 * @example <caption>Format option showTimezone: false</caption>
	 * var oDate = UI5Date.getInstance("2021-12-24T13:37:00Z");
	 * DateFormat.getDateTimeWithTimezoneInstance({showTimezone: false}).parse("Dec 24, 2021, 8:37:00 AM", "America/New_York");
	 * // output: [oDate, undefined]
	 *
	 * @example <caption>Format option showDate: false and showTime: false</caption>
	 * DateFormat.getDateTimeWithTimezoneInstance({showDate: false, showTime: false}).parse("Americas, New York", "America/New_York");
	 * // output: [undefined, "America/New_York"]
	 *
	 * @param {string} sValue the string containing a formatted date/time value
	 * @param {string} [sTimezone] The IANA timezone ID which should be used to convert the date
	 *   e.g. "America/New_York". If the parameter is omitted, <code>null</code> or an empty string, the timezone will
	 *   be taken from {@link module:sap/base/i18n/Localization.getTimezone Localization.getTimezone}. For an invalid
	 *   IANA timezone ID, <code>null</code> will be returned.
	 * @param {boolean} [bStrict] Whether to be strict with regards to the value ranges of date fields,
	 * e.g. for a month pattern of <code>MM</code> and a value range of [1-12]
	 * <code>strict</code> ensures that the value is within the range;
	 * if it is larger than <code>12</code> it cannot be parsed and <code>null</code> is returned
	 * @throws {TypeError} Thrown if one of the following applies:
	 *   <ul>
	 *       <li>the <code>sTimezone</code> parameter is provided and has the wrong type</li>
	 *       <li>only the time is shown (<code>showDate</code> is <code>false</code>), or only the
	 *       date is shown (<code>showTime</code> is <code>false</code>)</li>
	 *   </ul>
	 * @return {Array} the parsed values
	 * <ul>
	 *   <li>An array containing datetime and timezone depending on the showDate, showTime and showTimezone options
	 *     <ul>
	 *         <li>(Default): [Date, string], e.g.
	 *           [UI5Date.getInstance("2021-11-13T13:22:33Z"), "America/New_York"]</li>
	 *         <li><code>showTimezone: false</code>: [Date, undefined], e.g.
	 *           [UI5Date.getInstance("2021-11-13T13:22:33Z"), undefined]</li>
	 *         <li><code>showDate: false, showTime: false</code>: [undefined, string], e.g.
	 *           [undefined, "America/New_York"]</li>
	 *     </ul>
	 *   </li>
	 * </ul>
	 *
	 * @public
	 * @name sap.ui.core.format.DateFormat.DateTimeWithTimezone.parse
	 * @function
	 * @since 1.99
	 */
	// This method has a TypeScript specific overlay for a better return value documentation,
	// see 'src/sap.ui.core/.dtsgenrc'

	/**
	 * Get a datetimeWithTimezone instance of the DateFormat, which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions] An object which defines the format options
	 * @param {sap.ui.core.date.CalendarWeekNumbering} [oFormatOptions.calendarWeekNumbering] since 1.108.0 specifies the calendar week numbering.
	 *   If specified, this overwrites <code>oFormatOptions.firstDayOfWeek</code> and <code>oFormatOptions.minimalDaysInFirstWeek</code>.
	 * @param {int} [oFormatOptions.firstDayOfWeek] since 1.105.0 specifies the first day of the week starting with <code>0</code> (which is Sunday); if not defined, the value taken from the locale is used
	 * @param {int} [oFormatOptions.minimalDaysInFirstWeek] since 1.105.0 minimal days at the beginning of the year which define the first calendar week; if not defined, the value taken from the locale is used
	 * @param {string} [oFormatOptions.format] A string containing pattern symbols (e.g. "yMMMd" or "Hms") which will be converted into a pattern for the used locale that matches the wanted symbols best.
	 *  The symbols must be in canonical order, that is: Era (G), Year (y/Y), Quarter (q/Q), Month (M/L), Week (w), Day-Of-Week (E/e/c), Day (d), Hour (h/H/k/K/j/J), Minute (m), Second (s), Timezone (z/Z/v/V/O/X/x)
	 *  See http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems
	 * @param {string} [oFormatOptions.pattern] a datetime pattern in LDML format. It is not verified whether the pattern represents a full datetime.
	 * @param {boolean} [oFormatOptions.showDate=true] Specifies if the date should be displayed.
	 *   It is ignored for formatting when an options pattern or a format are supplied.
	 * @param {boolean} [oFormatOptions.showTime=true] Specifies if the time should be displayed.
	 *   It is ignored for formatting when an options pattern or a format are supplied.
	 * @param {boolean} [oFormatOptions.showTimezone=true] Specifies if the timezone should be displayed.
	 *   It is ignored for formatting when an options pattern or a format are supplied.
	 * @param {string} [oFormatOptions.style] Can be either 'short, 'medium', 'long' or 'full'. For datetime you can also define mixed styles, separated with a slash, where the first part is the date style and the second part is the time style (e.g. "medium/short"). If no pattern is given, a locale-dependent default datetime pattern of that style from the LocaleData class is used.
	 * @param {boolean} [oFormatOptions.strictParsing] Whether to check by parsing if the value is a valid datetime
	 * @param {boolean} [oFormatOptions.relative] Whether the date is formatted relatively to today's date if it is within the given day range, e.g. "today", "1 day ago", "in 5 days"
	 * @param {int[]} [oFormatOptions.relativeRange] The day range used for relative formatting. If <code>oFormatOptions.relativeScale</code> is set to the default value 'day', the <code>relativeRange<code> is by default [-6, 6], which means that only the previous 6 and the following 6 days are formatted relatively. If <code>oFormatOptions.relativeScale</code> is set to 'auto', all dates are formatted relatively.
	 * @param {string} [oFormatOptions.relativeScale] If 'auto' is set, a new relative time format is switched on for all Date/Time instances. The default value depends on <code>showDate</code> and <code>showTime</code> options.
	 * @param {string} [oFormatOptions.relativeStyle="wide"] The style of the relative format. The valid values are "wide", "short", "narrow"
	 * @param {sap.ui.core.CalendarType} [oFormatOptions.calendarType] The calendar type which is used to format and parse the date. This value is by default either set in the configuration or calculated based on the current locale.
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale-specific texts/settings
	 * @ui5-omissible-params oFormatOptions
	 * @throws {TypeError} If an invalid configuration was supplied, i.e. when the
	 *   <code>showDate</code>, <code>showTime</code>, and <code>showTimezone</code> format options
	 *   are all <code>false</code>
	 * @return {sap.ui.core.format.DateFormat.DateTimeWithTimezone} dateTimeWithTimezone instance of the DateFormat
	 * @static
	 * @public
	 * @since 1.99.0
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>The <code>calendarWeekNumbering</code> format option has an unsupported value, or</li>
	 *   <li>only one of the <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> parameters was provided.</li>
	 * </ul>
	 */
	DateFormat.getDateTimeWithTimezoneInstance = function(oFormatOptions, oLocale) {
		if (oFormatOptions && !(oFormatOptions instanceof Locale)) {
			if (oFormatOptions.showDate === false
				&& oFormatOptions.showTime === false
				&& oFormatOptions.showTimezone === false) {
				throw new TypeError("Invalid Configuration. One of the following format options must be true: "
					+ "showDate, showTime or showTimezone.");
			}
		}
		return this.createInstance(oFormatOptions, oLocale,
			DateFormat._getDateTimeWithTimezoneInfo(oFormatOptions || {}));
	};

	/**
	 * Get a time instance of the DateFormat, which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.date.CalendarWeekNumbering} [oFormatOptions.calendarWeekNumbering] since 1.108.0 specifies the calendar week numbering.
	 *   If specified, this overwrites <code>oFormatOptions.firstDayOfWeek</code> and <code>oFormatOptions.minimalDaysInFirstWeek</code>.
	 * @param {int} [oFormatOptions.firstDayOfWeek] since 1.105.0 specifies the first day of the week starting with <code>0</code> (which is Sunday); if not defined, the value taken from the locale is used
	 * @param {int} [oFormatOptions.minimalDaysInFirstWeek] since 1.105.0 minimal days at the beginning of the year which define the first calendar week; if not defined, the value taken from the locale is used
	 * @param {string} [oFormatOptions.format] since 1.34.0 contains pattern symbols (e.g. "yMMMd" or "Hms") which will be converted into the pattern in the used locale, which matches the wanted symbols best.
	 *  The symbols must be in canonical order, that is: Era (G), Year (y/Y), Quarter (q/Q), Month (M/L), Week (w), Day-Of-Week (E/e/c), Day (d), Hour (h/H/k/K/j/J), Minute (m), Second (s), Timezone (z/Z/v/V/O/X/x)
	 *  See http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems
	 * @param {string} [oFormatOptions.pattern] a time pattern in LDML format. It is not verified whether the pattern only represents a time.
	 * @param {string} [oFormatOptions.style] can be either 'short, 'medium', 'long' or 'full'. If no pattern is given, a locale dependent default time pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] if true, by parsing it is checked if the value is a valid time
	 * @param {boolean} [oFormatOptions.relative] if true, the date is formatted relatively to todays date if it is within the given day range, e.g. "today", "1 day ago", "in 5 days"
	 * @param {int[]} [oFormatOptions.relativeRange] the day range used for relative formatting. If <code>oFormatOptions.relativeScale</code> is set to value 'day', the relativeRange is by default [-6, 6], which means only the last 6 days, today and the next 6 days are formatted relatively. Otherwise when <code>oFormatOptions.relativeScale</code> is set to 'auto', all dates are formatted relatively.
	 * @param {string} [oFormatOptions.relativeScale="auto"] if 'auto' is set, new relative time format is switched on for all Date/Time Instances. The relative scale is chosen depending on the difference between the given date and now.
	 * @param {string} [oFormatOptions.relativeStyle="wide"] since 1.32.10, 1.34.4 the style of the relative format. The valid values are "wide", "short", "narrow"
	 * @param {boolean} [oFormatOptions.interval=false] since 1.48.0 if true, the {@link sap.ui.core.format.DateFormat#format format} method expects an array with two dates as the first argument and formats them as interval. Further interval "Jan 10, 2008 - Jan 12, 2008" will be formatted as "Jan 10-12, 2008" if the 'format' option is set with necessary symbols.
	 *   Otherwise the two given dates are formatted separately and concatenated with local dependent pattern.
	 * @param {string} [oFormatOptions.intervalDelimiter]
	 *   Since 1.113.0, a delimiter for intervals. With a given interval delimiter a specific interval format is
	 *   created. <b>Example:</b> If <code>oFormatOptions.intervalDelimiter</code> is set to "...", an interval would be
	 *   given as "09:15 AM...11:45 AM".
	 *   <b>Note:</b> If this format option is set, the locale-specific interval notation is overruled, for example
	 *   "09:15 – 11:45 AM" becomes "9:15 AM...11:45 AM".
	 * @param {boolean} [oFormatOptions.singleIntervalValue=false] Only relevant if oFormatOptions.interval is set to 'true'. This allows to pass an array with only one date object to the {@link sap.ui.core.format.DateFormat#format format} method.
	 * @param {boolean} [oFormatOptions.UTC] if true, the time is formatted and parsed as UTC instead of the local timezone
	 * @param {sap.ui.core.CalendarType} [oFormatOptions.calendarType] The calender type which is used to format and parse the date. This value is by default either set in configuration or calculated based on current locale.
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @ui5-omissible-params oFormatOptions
	 * @return {sap.ui.core.format.DateFormat} time instance of the DateFormat
	 * @static
	 * @public
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>The <code>calendarWeekNumbering</code> format option has an unsupported value, or</li>
	 *   <li>only one of the <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> parameters was provided.</li>
	 * </ul>
	 */
	DateFormat.getTimeInstance = function(oFormatOptions, oLocale) {
		return this.createInstance(oFormatOptions, oLocale, this.oTimeInfo);
	};

	/**
	 * Create instance of the DateFormat.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @param {object} [oInfo] Info information common to all instances of the created "type",
	 *   e.g. default format options
	 * @param {boolean} [bIsFallback=false] Whether this is a fallback format instance
	 * @return {sap.ui.core.format.DateFormat} time instance of the DateFormat
	 * @static
	 * @private
	 * @throws {TypeError} If:
	 * <ul>
	 *   <li>The <code>calendarWeekNumbering</code> format option has an unsupported value, or</li>
	 *   <li>only one of the <code>firstDayOfWeek</code> and <code>minimalDaysInFirstWeek</code> parameters was provided.</li>
	 * </ul>
	 */
	DateFormat.createInstance = function(oFormatOptions, oLocale, oInfo, bIsFallback) {
		var aFallbackFormatOptions, oFormat, sPattern;

		// Create an instance of the DateFormat
		oFormat = Object.create(this.prototype);

		// Handle optional parameters
		if ( oFormatOptions instanceof Locale ) {
			oLocale = oFormatOptions;
			oFormatOptions = undefined;
		}

		// Get Locale and LocaleData to use
		if (!oLocale) {
			oLocale = new Locale(Formatting.getLanguageTag());
		}
		oFormat.oLocale = oLocale;
		oFormat.oLocaleData = LocaleData.getInstance(oLocale);

		// Extend the default format options with custom format options and retrieve the pattern
		// from the LocaleData, in case it is not defined yet
		oFormat.oFormatOptions = extend({}, oInfo.oDefaultFormatOptions, oFormatOptions);

		// set unsupported properties to false/undefined
		if (oInfo.type === mDateFormatTypes.DATETIME_WITH_TIMEZONE) {
			oFormat.oFormatOptions.interval = false;
			oFormat.oFormatOptions.singleIntervalValue = false;
			oFormat.oFormatOptions.UTC = false;
		} else {
			oFormat.oFormatOptions.showTimezone = undefined;
			oFormat.oFormatOptions.showDate = undefined;
			oFormat.oFormatOptions.showTime = undefined;
		}

		// type cannot be changed and should be an instance property instead of a format option
		oFormat.type = oInfo.type;

		if (!oFormat.oFormatOptions.calendarType) {
			oFormat.oFormatOptions.calendarType = Formatting.getCalendarType();
		}

		if (oFormat.oFormatOptions.firstDayOfWeek === undefined && oFormat.oFormatOptions.minimalDaysInFirstWeek !== undefined
			|| oFormat.oFormatOptions.firstDayOfWeek !== undefined && oFormat.oFormatOptions.minimalDaysInFirstWeek === undefined) {
			throw new TypeError("Format options firstDayOfWeek and minimalDaysInFirstWeek need both to be set, but only one was provided.");
		}

		if (oFormat.oFormatOptions.calendarWeekNumbering && !Object.values(CalendarWeekNumbering).includes(oFormat.oFormatOptions.calendarWeekNumbering)) {
			throw new TypeError("Illegal format option calendarWeekNumbering: '" + oFormat.oFormatOptions.calendarWeekNumbering + "'");
		}

		if (!oFormat.oFormatOptions.pattern) {
			if (oFormat.oFormatOptions.format) {
				oFormat.oFormatOptions.pattern = oFormat.oLocaleData.getCustomDateTimePattern(oFormat.oFormatOptions.format, oFormat.oFormatOptions.calendarType);
			} else {
				oFormat.oFormatOptions.pattern = oInfo.getPattern(oFormat.oLocaleData, oFormat.oFormatOptions.style, oFormat.oFormatOptions.calendarType);
			}
		}

		if (oFormat.oFormatOptions.interval) {
			var sSinglePattern,
				sDelimiter = oFormat.oFormatOptions.intervalDelimiter;

			if (oFormat.oFormatOptions.format) {
				// when 'format' option is set, generate the pattern based on the greatest difference
				oFormat.intervalPatterns = oFormat.oLocaleData.getCustomIntervalPattern(oFormat.oFormatOptions.format, null/*=no diff*/, oFormat.oFormatOptions.calendarType);

				// In case oFormat.intervalPatterns is a string, put the single string into array
				if (typeof oFormat.intervalPatterns === "string") {
					oFormat.intervalPatterns = [oFormat.intervalPatterns];
				}

				sSinglePattern = oFormat.oLocaleData.getCustomDateTimePattern(oFormat.oFormatOptions.format,
					oFormat.oFormatOptions.calendarType);
				// Put the single date pattern, which is generated based on the oFormatOptions.format, into the array in
				// case the date interval is formatted as a single date
				oFormat.intervalPatterns.push(sSinglePattern);

			} else {
				sSinglePattern = oFormat.oFormatOptions.pattern;
				oFormat.intervalPatterns = [
					// when 'format' option is not set, generate the combined interval pattern
					oFormat.oLocaleData.getCombinedIntervalPattern(oFormat.oFormatOptions.pattern, oFormat.oFormatOptions.calendarType),
					// Put the single date pattern into the array in case the date interval is formatted as a single date
					oFormat.oFormatOptions.pattern
				];
			}
			oFormat.intervalPatterns.push(oFormat.oFormatOptions.pattern + " - " + oFormat.oFormatOptions.pattern);
			if (sDelimiter) { // use delimiter pattern as first choice
				sDelimiter = sDelimiter.replace(/'/g, "''");
				sDelimiter = "'" + sDelimiter + "'";
				oFormat.intervalPatterns.unshift(sSinglePattern + sDelimiter + sSinglePattern);
			}
			oFormat.intervalPatterns = Array.from(new Set(oFormat.intervalPatterns));
		}

		// if the current format isn't a fallback format, create its fallback formats
		if (!bIsFallback) {
			aFallbackFormatOptions = oInfo.aFallbackFormatOptions;
			// Add two fallback patterns for locale-dependent short format without delimiters
			if (oInfo.bShortFallbackFormatOptions) {
				sPattern = oInfo.getPattern(oFormat.oLocaleData, "short");
				// add the options of fallback formats without delimiters to the fallback options array
				aFallbackFormatOptions = aFallbackFormatOptions.concat(DateFormat._createFallbackOptionsWithoutDelimiter(sPattern));
			}

			if (oFormat.oFormatOptions.pattern && oInfo.bPatternFallbackWithoutDelimiter) {
				// create options of fallback formats by removing delimiters from the given pattern
				// insert the new fallback format options to the front of the array
				aFallbackFormatOptions = DateFormat._createFallbackOptionsWithoutDelimiter(oFormat.oFormatOptions.pattern).concat(aFallbackFormatOptions);
			}

			// remove duplicate format options (e.g. fallback format with same pattern is not needed twice)
			aFallbackFormatOptions = aFallbackFormatOptions.reduce(function (aFallbacks, oOptions) {
				var aKeys = Object.keys(oOptions),
					bDuplicate = aFallbacks.some(function (oOptions0) {
						return Object.keys(oOptions0).length === aKeys.length
							&& aKeys.every(function (sKey) {
								return oOptions0[sKey] === oOptions[sKey];
							});
					});

				if (!bDuplicate) {
					aFallbacks.push(oOptions);
				}

				return aFallbacks;
			}, []);

			oFormat.aFallbackFormats = DateFormat._createFallbackFormat(
				aFallbackFormatOptions, oFormat.oFormatOptions.calendarType, oLocale, oInfo, oFormat.oFormatOptions
			);
		}

		oFormat.oRequiredParts = oInfo.oRequiredParts;
		oFormat.aRelativeScales = oInfo.aRelativeScales;
		oFormat.aRelativeParseScales = oInfo.aRelativeParseScales;
		oFormat.aIntervalCompareFields = oInfo.aIntervalCompareFields;

		oFormat.init();
		return oFormat;
	};

	/**
	 * Initialize date format
	 */
	DateFormat.prototype.init = function() {
		var sCalendarType = this.oFormatOptions.calendarType;

		this.aMonthsAbbrev = this.oLocaleData._getMonthsWithAlternatives("abbreviated", sCalendarType);
		this.aMonthsWide = this.oLocaleData.getMonths("wide", sCalendarType);
		this.aMonthsNarrow = this.oLocaleData.getMonths("narrow", sCalendarType);
		this.aMonthsAbbrevSt = this.oLocaleData._getMonthsStandAloneWithAlternatives("abbreviated", sCalendarType);
		this.aMonthsWideSt = this.oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		this.aMonthsNarrowSt = this.oLocaleData.getMonthsStandAlone("narrow", sCalendarType);
		this.aDaysAbbrev = this.oLocaleData.getDays("abbreviated", sCalendarType);
		this.aDaysWide = this.oLocaleData.getDays("wide", sCalendarType);
		this.aDaysNarrow = this.oLocaleData.getDays("narrow", sCalendarType);
		this.aDaysShort = this.oLocaleData.getDays("short", sCalendarType);
		this.aDaysAbbrevSt = this.oLocaleData.getDaysStandAlone("abbreviated", sCalendarType);
		this.aDaysWideSt = this.oLocaleData.getDaysStandAlone("wide", sCalendarType);
		this.aDaysNarrowSt = this.oLocaleData.getDaysStandAlone("narrow", sCalendarType);
		this.aDaysShortSt = this.oLocaleData.getDaysStandAlone("short", sCalendarType);
		this.aQuartersAbbrev = this.oLocaleData.getQuarters("abbreviated", sCalendarType);
		this.aQuartersWide = this.oLocaleData.getQuarters("wide", sCalendarType);
		this.aQuartersNarrow = this.oLocaleData.getQuarters("narrow", sCalendarType);
		this.aQuartersAbbrevSt = this.oLocaleData.getQuartersStandAlone("abbreviated", sCalendarType);
		this.aQuartersWideSt = this.oLocaleData.getQuartersStandAlone("wide", sCalendarType);
		this.aQuartersNarrowSt = this.oLocaleData.getQuartersStandAlone("narrow", sCalendarType);
		this.aErasNarrow = this.oLocaleData.getEras("narrow", sCalendarType);
		this.aErasAbbrev = this.oLocaleData.getEras("abbreviated", sCalendarType);
		this.aErasWide = this.oLocaleData.getEras("wide", sCalendarType);
		this.aDayPeriodsAbbrev = this.oLocaleData.getDayPeriods("abbreviated", sCalendarType);
		this.aDayPeriodsNarrow = this.oLocaleData.getDayPeriods("narrow", sCalendarType);
		this.aDayPeriodsWide = this.oLocaleData.getDayPeriods("wide", sCalendarType);
		this.oFlexibleDayPeriodsAbbrev = this.oLocaleData.getFlexibleDayPeriods("abbreviated",
			sCalendarType);
		this.oFlexibleDayPeriodsNarrow = this.oLocaleData.getFlexibleDayPeriods("narrow",
			sCalendarType);
		this.oFlexibleDayPeriodsWide = this.oLocaleData.getFlexibleDayPeriods("wide",
			sCalendarType);
		this.oFlexibleDayPeriodsAbbrevSt = this.oLocaleData.getFlexibleDayPeriodsStandAlone(
			"abbreviated", sCalendarType);
		this.oFlexibleDayPeriodsNarrowSt = this.oLocaleData.getFlexibleDayPeriodsStandAlone(
			"narrow", sCalendarType);
		this.oFlexibleDayPeriodsWideSt = this.oLocaleData.getFlexibleDayPeriodsStandAlone(
			"wide", sCalendarType);
		this.aFormatArray = this.parseCldrDatePattern(this.oFormatOptions.pattern);
		this.sAllowedCharacters = this.getAllowedCharacters(this.aFormatArray);
	};

	/**
	 * Creates DateFormat instances based on the given format options. The created
	 * instances are used as fallback formats of another DateFormat instances.
	 *
	 * @param {Object[]} aFallbackFormatOptions the options for creating the fallback DateFormat
	 * @param {sap.ui.core.CalendarType} sCalendarType the type of the current calendarType
	 * @param {sap.ui.core.Locale} oLocale Locale to ask for locale specific texts/settings
	 * @param {Object} oInfo The default info object of the current date type
	 * @param {object} oParentFormatOptions the format options, relevant are: interval, showDate, showTime and showTimezone
	 * @return {sap.ui.core.DateFormat[]} an array of fallback DateFormat instances
	 * @private
	 */
	DateFormat._createFallbackFormat = function(aFallbackFormatOptions, sCalendarType, oLocale, oInfo, oParentFormatOptions) {
		return aFallbackFormatOptions.map(function(oOptions) {
			// The format options within the aFallbackFormatOptions array are static
			// and shouldn't be manipulated. Hence, cloning each format option is required.
			var oFormatOptions = Object.assign({}, oOptions);

			// Pass the showDate, showTime and showTimezone format options to the fallback instance.
			oFormatOptions.showDate = oParentFormatOptions.showDate;
			oFormatOptions.showTime = oParentFormatOptions.showTime;
			oFormatOptions.showTimezone = oParentFormatOptions.showTimezone;

			// the timezone instance's fallback patterns depend on the showDate, showTime and
			// showTimezone format option which means they cannot be static,
			// therefore they are generated using the getTimezonePattern function
			if (typeof oInfo.getTimezonePattern === "function" && oFormatOptions.pattern) {
				oFormatOptions.pattern = oInfo.getTimezonePattern(oFormatOptions.pattern);
			}

			if (oParentFormatOptions.interval) {
				oFormatOptions.interval = true;
			}
			oFormatOptions.calendarType = sCalendarType;

			return DateFormat.createInstance(oFormatOptions, oLocale, oInfo, true);
		});
	};

	/**
	 * Creates options for fallback DateFormat instance by removing all delimiters
	 * from the given base pattern.
	 *
	 * @param {string} sBasePattern The pattern where the result pattern will be
	 * generated by removing the delimiters
	 * @return {Object} Format option object which contains the new pattern
	 */
	DateFormat._createFallbackOptionsWithoutDelimiter = function(sBasePattern) {
		var rNonDateFields = /[^dMyGU]/g,
			oDayReplace = {
				regex: /d+/g,
				replace: "dd"
			},
			oMonthReplace = {
				regex: /M+/g,
				replace: "MM"
			},
			oYearReplace = {
				regex: /[yU]+/g,
				replace: ["yyyy", "yy"]
			};

		sBasePattern = sBasePattern.replace(rNonDateFields, ""); //remove all delimiters
		sBasePattern = sBasePattern.replace(oDayReplace.regex, oDayReplace.replace); // replace day entries with 2 digits
		sBasePattern = sBasePattern.replace(oMonthReplace.regex, oMonthReplace.replace); // replace month entries with 2 digits

		return oYearReplace.replace.map(function(sReplace) {
			return {
				pattern: sBasePattern.replace(oYearReplace.regex, sReplace),
				strictParsing: true
			};
		});
	};


	var oParseHelper = {
		isNumber: function (iCharCode) {
			return iCharCode >= 48 && iCharCode <= 57;
		},
		findNumbers: function (sValue, iMaxLength) {
			var iLength = 0;
			while (iLength < iMaxLength && this.isNumber(sValue.charCodeAt(iLength))) {
				iLength++;
			}

			return sValue.substr(0, iLength);
		},

		/**
		 * Returns if the given string starts with another given string ignoring the case.
		 *
		 * Takes the locale into account to ensure the characters are interpreted the right way.
		 *
		 * First, an exact case check is performed to remain backward compatible, then a case-insensitive check
		 * based on the locale is done.
		 *
		 * When during the case conversion the length of the string changes we cannot safely match
		 * it and return <code>false</code>.
		 *
		 * @param {string} sValue the value to check, e.g. "März 2013"
		 * @param {string} sSubstring the string to compare it with, e.g. "MÄRZ"
		 * @param {string} sLocale the locale, e.g. "de-DE"
		 * @returns {boolean} true if the given string <code>sValue</code> starts with <code>sSubstring</code>
		 * @private
		 */
		startsWithIgnoreCase: function (sValue, sSubstring, sLocale) {
			// exact case comparison (backward compatible)
			if (sValue.startsWith(sSubstring)) {
				return true;
			}
			try {
				// Use String#toLocaleUpperCase instead of String#toLocaleLowerCase because there
				// are known cases where an upper case letter has 2 lower case variants, e.g. Greek sigma.
				var sSubToLocaleUpperCase = sSubstring.toLocaleUpperCase(sLocale);
				var sValueUpperCase = sValue.toLocaleUpperCase(sLocale);

				// During the upper-case conversion there are cases where length changes, e.g. ß -> SS.
				// This cannot be properly determined without probing therefore we do not support this case.
				if (sSubToLocaleUpperCase.length !== sSubstring.length || sValueUpperCase.length !== sValue.length) {
					return false;
				}
				return sValueUpperCase.startsWith(sSubToLocaleUpperCase);
			} catch (e) {
				// Can fail for String#toLocaleUpperCase with an invalid locale
				// the API fails in the case with: Incorrect locale information provided
				return false;
			}
		},

		/**
		 * Finds the longest matching entry for which the following applies:
		 * * <code>sValue</code> starts with the found entry
		 *
		 * The index of the finding in <code>aList</code> and the length of the match is returned.
		 * The case is ignored and the given locale is used for the string comparison.
		 *
		 * @example
		 * findEntry("MÄRZ 2013", ["Januar", "Februar", "März", "April", ...], "de-DE");
		 * // {length: 4, index: 2}
		 * @example
		 * findEntry("Sep 2013", [..., "Aug", ["Sept", "Sep"], "Oct", ...], "en-GB");
		 * // {length: 3, index: 8}
		 *
		 * @param {string} sValue the input value, e.g. "MÄRZ 2013"
		 * @param {string[]|Array<string[]>} aList
		 *   The list of values to check, e.g. ["Januar", "Februar", "März", "April", ...]; the list may contain also
		 *   arrays of strings containing alternatives, e.g. [..., "Aug", ["Sept", "Sep"], "Oct", ...]
		 * @param {string} sLocale the locale which is used for the string comparison, e.g. "de-DE"
		 * @returns {{length: number, index: number}} the length of the match in sValue, the index in the list of values
		 *   e.g. length: 4, index: 2 ("MÄRZ")
		 * @private
		 */
		findEntry: function (sValue, aList, sLocale) {
			let iFoundIndex = -1;
			let iMatchedLength = 0;

			aList.forEach((vEntry, j) => {
				(Array.isArray(vEntry) ? vEntry : [vEntry]).forEach((sEntry) => {
					if (sEntry.length > iMatchedLength && this.startsWithIgnoreCase(sValue, sEntry, sLocale)) {
						iFoundIndex = j;
						iMatchedLength = sEntry.length;
					}
				});
			});

			return {
				index: iFoundIndex,
				length: iMatchedLength
			};
		},

		/**
		 * Parses a given timezone
		 *
		 * @param {string} sValue String to parse, e.g. "-0800", "-08:00", "-08"
		 * @param {boolean} bColonSeparated Whether or not the values are colon separated, e.g. "-08:00"
		 * @returns {{tzDiff: number, length: number}} Object containing the timezone difference in seconds and the length of the parsed segment
		 */
		parseTZ: function (sValue, bColonSeparated) {
			var iLength = 0;
			var iTZFactor = sValue.charAt(0) === "+" ? -1 : 1;
			var sPart;

			if (sValue[0] === "Z") {
				return {length : 1, tzDiff : 0};
			}

			iLength++; //"+" or "-"
			sPart = this.findNumbers(sValue.substr(iLength), 2);

			var iTZDiffHour = parseInt(sPart);
			iLength += 2; //hh: 2 digits for hours

			if (bColonSeparated) {
				iLength++; //":"
			}
			sPart = this.findNumbers(sValue.substr(iLength), 2);
			var iTZDiff = 0;
			// timezone pattern "X": will produce only 2 digits: "-08"
			if (sPart) {
				iLength += 2; //mm: 2 digits for minutes
				iTZDiff = parseInt(sPart);
			}

			return {
				length: iLength,
				tzDiff: (iTZDiff + 60 * iTZDiffHour) * 60 * iTZFactor
			};
		},

		/**
		 * Returns <code>false</code> if the given pattern symbol name is required and the value for that part is
		 * invalid, otherwise <code>true</code> is returned.
		 *
		 * @param {string} sSymbolName
		 *   A unique pattern symbol name
		 * @param {boolean} bPartInvalid
		 *   Whether the value for the given pattern symbol name is invalid
		 * @param {sap.ui.core.format.DateFormat} oFormat
		 *   The <code>DateFormat</code> instance
		 * @returns {boolean}
		 *   <code>false</code> if the given pattern symbol name is required and the value for that part is invalid,
		 *   otherwise <code>true</code>
		 */
		checkValid: function (sSymbolName, bPartInvalid, oFormat) {
			if (sSymbolName in oFormat.oRequiredParts && bPartInvalid) {
				return false;
			}
			return true;
		}
	};
	DateFormat._oParseHelper = oParseHelper; // make parse helper a private static member for testing

	/**
	 * Creates a pattern symbol object containing all needed functions to be used for formatting and parsing.
	 * Functions which are not given in <code>mParameters</code> are provided with a default implementation.
	 *
	 * @param {Object<string,any>} mParameters
	 *   A parameters map for creating a pattern symbol
	 * @param {string} mParameters.name
	 *   An internal unique name describing this symbol
	 * @param {function(Object<string, any>, sap.ui.core.date.UniversalDate, boolean, sap.ui.core.format.DateFormat,
	 *     string): string} [mParameters.format]
	 *   A function to format the symbol part based on a given date object
	 * @param {function(string, Object<string, any>, sap.ui.core.format.DateFormat, object, string): object}
	 *     [mParameters.parse]
	 *   A function to parse the symbol part based on a given date string
	 * @param {boolean|function(int): boolean} [mParameters.isNumeric]
	 *   A boolean to describe, or a function to evaluate, whether the pattern symbol expects a
	 *   numeric representation. For example pattern "MM" results in "02" and is therefore numeric,
	 *   but "MMM" results in "Feb" which is not numeric.
	 * @returns {{name: string, format: function, parse: function, isNumeric: function}}
	 *   A pattern symbol object
	 *
	 * @private
	 */
	DateFormat._createPatternSymbol = function (mParameters) {
		var fnIsNumeric = typeof mParameters.isNumeric === "function" && mParameters.isNumeric
				// Default: false
				|| function () { return mParameters.isNumeric || false; };

		return {
			name: mParameters.name,

			/**
			 * Formatter for a pattern symbol.
			 *
			 * @param {Object<string, any>} oField
			 *   The date pattern field as parsed by {@link DateFormat#parseCldrDatePattern}
			 * @param {sap.ui.core.date.UniversalDate} oDate
			 *   The date object to format
			 * @param {boolean} bUTC
			 *   Whether the UTC option is set
			 * @param {sap.ui.core.format.DateFormat} oFormat
			 *   The <code>DateFormat</code> instance
			 * @returns {string}
			 *   The formatted date information for this date pattern part
			 */
			format: mParameters.format
				// not supported, but reserved
				|| function () { return ""; },

			/**
			 * Parser for a pattern symbol.
			 *
			 * @param {string} sValue
			 *   The given input
			 * @param {Object<string, any>} oPart
			 *   The date pattern field as parsed by {@link DateFormat#parseCldrDatePattern}
			 * @param {sap.ui.core.format.DateFormat} oFormat
			 *   The <code>DateFormat</code> instance
			 * @param {object} oConfig
			 *   The configuration object for parsing the value
			 * @param {object} oConfig.dateValue
			 *   The already parsed date fields
			 * @param {boolean} oConfig.exactLength
			 *   Whether parsing with the exact length specified by {@link DateFormat#parseCldrDatePattern} is needed
			 * @param {object[]} oConfig.formatArray
			 *   The complete format array as parsed by {@link DateFormat#parseCldrDatePattern}
			 * @param {int} oConfig.index
			 *   The current index in the format array
			 * @param {boolean} oConfig.strict
			 *   Whether to disallow overflows for component values of a date (see
			 *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date).
			 *   Note that the corresponding checks are just for number ranges which are possible <em>at max</em>
			 *   without overflow; the check for day does not consider the month and year to compute the maximum
			 *   number of days allowed.
			 * @param {string} sTimezone
			 *   The IANA timezone ID
			 * @returns {object}
			 *   The parsed date information for this date pattern part; could contain the property <code>valid</code>
			 *   set to <code>false</code> if parsing was not successful
			 */
			parse: mParameters.parse
				// not supported, but reserved
				|| function () { return {}; },

			/**
			 * Evaluates whether this symbol has a numeric representation.
			 *
			 * @param {int} [iDigits] The number of repetitions of the pattern symbol, e.g. <code>3</code> for "aaa"
			 * @returns {boolean} Whether this symbol has a numeric representation
			 */
			isNumeric: fnIsNumeric
		};
	};

	/**
	 * Provides functionality to format and parse a given pattern symbol.
	 * @see https://unicode.org/reports/tr35/tr35-dates.html#table-date-field-symbol-table
	 */
	DateFormat.prototype.oSymbols = {
		"": DateFormat._createPatternSymbol({
			name: "text",
			format: function(oField, oDate) {
				return oField.value;
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sChar;
				var bValid = true;
				var iValueIndex = 0;
				var iPatternIndex = 0;
				// https://www.compart.com/en/unicode/category/Pd
				var sDelimiter = "\u002d\u007E\u2010\u2011\u2012\u2013\u2014\ufe58\ufe63\uff0d\uFF5E";

				// Compare the letters in oPart.value (the pattern) and sValue (the given string to parse)
				// one by one.
				// If the current letter in the pattern is " ", sValue is allowed to have no match, exact match
				// or multiple " ". This makes the parsing more tolerant. Special spaces or RTL characters have
				// to be normalized before comparison.
				const sPartValue = FormatUtils.normalize(oPart.value);
				for (; iPatternIndex < sPartValue.length; iPatternIndex++) {
					sChar = sPartValue.charAt(iPatternIndex);

					if (sChar === " ") {
						// allows to have multiple spaces
						while (sValue.charAt(iValueIndex) === " ") {
							iValueIndex++;
						}
					} else if (sDelimiter.includes(sChar)) {
						if (!sDelimiter.includes(sValue.charAt(iValueIndex))) {
								bValid = false;
						}
						iValueIndex++;
					} else {
						if (sValue.charAt(iValueIndex) !== sChar) {
							// if it's not a space, there must be an exact match
							bValid = false;
						}
						iValueIndex++;
					}

					if (!bValid) {
						break;
					}
				}

				if (bValid) {
					return {
						length: iValueIndex
					};
				} else {
					var bPartInvalid = false;

					// only require text, if next part is also required
					if (oConfig.index < oConfig.formatArray.length - 1) {
						bPartInvalid = (oConfig.formatArray[oConfig.index + 1].type in oFormat.oRequiredParts);
					}
					return {
						valid: oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat)
					};
				}
			}
		}),
		"G": DateFormat._createPatternSymbol({
			name: "era",
			format: function(oField, oDate, bUTC, oFormat) {
				var iEra = oDate.getUTCEra();
				if (oField.digits <= 3) {
					return oFormat.aErasAbbrev[iEra];
				} else if (oField.digits === 4) {
					return oFormat.aErasWide[iEra];
				} else {
					return oFormat.aErasNarrow[iEra];
				}
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var aErasVariants = [oFormat.aErasWide, oFormat.aErasAbbrev, oFormat.aErasNarrow];

				for (var i = 0; i < aErasVariants.length; i++) {
					var aVariants = aErasVariants[i];
					var oFound = oParseHelper.findEntry(sValue, aVariants, oFormat.oLocaleData.sCLDRLocaleId);
					if (oFound.index !== -1) {
						return {
							era: oFound.index,
							length: oFound.length
						};
					}
				}
				return {
					era: oFormat.aErasWide.length - 1,
					valid: oParseHelper.checkValid(oPart.type, true, oFormat)
				};
			}
		}),
		"y": DateFormat._createPatternSymbol({
			name: "year",
			format: function(oField, oDate, bUTC, oFormat) {
				var iYear = oDate.getUTCFullYear();
				var sYear = String(iYear);
				var sCalendarType = oFormat.oFormatOptions.calendarType;

				if (oField.digits === 2 && sYear.length > 2) {
					sYear = sYear.substr(sYear.length - 2);
				}
				// When parsing we assume dates less than 100 to be in the current/last century,
				// so when formatting we have to make sure they are differentiable by prefixing with zeros
				if (sCalendarType !== CalendarType.Japanese && oField.digits === 1 && iYear < 100) {
					sYear = sYear.padStart(4, "0");
				}
				return sYear.padStart(oField.digits, "0");
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var iExpectedDigits, sPart, bPartInvalid,
					sCalendarType = oFormat.oFormatOptions.calendarType;

				if (oPart.digits === 1) {
					iExpectedDigits = 4;
				} else if (oPart.digits === 2) {
					iExpectedDigits = 2;
				} else {
					iExpectedDigits = oPart.digits;
				}
				sPart = oParseHelper.findNumbers(sValue, iExpectedDigits);
				bPartInvalid = sPart === ""
					|| oConfig.exactLength && sPart.length !== iExpectedDigits;

				var iYear = parseInt(sPart);
				// Find the right century for two-digit years
				// https://tc39.es/ecma262/#sec-date.parse
				// "The function first attempts to parse the String according to the format
				// described in Date Time String Format (https://tc39.es/ecma262/#sec-date-time-string-format),
				// including expanded years.
				// If the String does not conform to that format the function may fall back to
				// any implementation-specific heuristics or implementation-specific date formats."
				//
				// Since a two-digit year is not format conform, each JS implementations might differ.
				// Therefore we provide an own implementation:

				// current year: 1978
				// 1978: 08 = 1908 (diff: -70)
				// 1978: 07 = 2007 (diff: -71)

				// current year: 2018
				// 2018: 48 = 1948 (diff: 30)
				// 2018: 47 = 2047 (diff: 29)
				if (sCalendarType !== CalendarType.Japanese && sPart.length <= 2) {
					var oCurrentDate = UniversalDate.getInstance(UI5Date.getInstance(), sCalendarType),
						iCurrentYear = oCurrentDate.getUTCFullYear(),
						iCurrentCentury = Math.floor(iCurrentYear / 100),
						iYearDiff = iCurrentCentury * 100 + iYear - iCurrentYear;
					if (iYearDiff < -70) {
						iYear += (iCurrentCentury + 1) * 100;
					} else if (iYearDiff < 30 ) {
						iYear += iCurrentCentury * 100;
					} else {
						iYear += (iCurrentCentury - 1) * 100;
					}
				}
				return {
					length: sPart.length,
					valid: oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat),
					year: iYear
				};
			},
			isNumeric: true
		}),
		"Y": DateFormat._createPatternSymbol({
			name: "weekYear",
			format: function(oField, oDate, bUTC, oFormat) {
				var oWeek = oDate.getUTCWeek(oFormat.oLocale, getCalendarWeekParameter(oFormat.oFormatOptions));
				var iWeekYear = oWeek.year;
				var sWeekYear = String(iWeekYear);
				var sCalendarType = oFormat.oFormatOptions.calendarType;

				if (oField.digits === 2 && sWeekYear.length > 2) {
					sWeekYear = sWeekYear.substr(sWeekYear.length - 2);
				}
				// When parsing we assume dates less than 100 to be in the current/last century,
				// so when formatting we have to make sure they are differentiable by prefixing with zeros
				if (sCalendarType !== CalendarType.Japanese && oField.digits === 1 && iWeekYear < 100) {
					sWeekYear = sWeekYear.padStart(4, "0");
				}
				return sWeekYear.padStart(oField.digits, "0");
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var iExpectedDigits, sPart, bPartInvalid,
					sCalendarType = oFormat.oFormatOptions.calendarType;

				if (oPart.digits === 1) {
					iExpectedDigits = 4;
				} else if (oPart.digits === 2) {
					iExpectedDigits = 2;
				} else {
					iExpectedDigits = oPart.digits;
				}
				sPart = oParseHelper.findNumbers(sValue, iExpectedDigits);
				bPartInvalid = sPart === ""
					|| oConfig.exactLength && sPart.length !== iExpectedDigits;

				var iYear = parseInt(sPart);
				var iWeekYear = iYear;
				// Find the right century for two-digit years
				if (sCalendarType !== CalendarType.Japanese && sPart.length <= 2) {
					var oCurrentDate = UniversalDate.getInstance(UI5Date.getInstance(), sCalendarType),
						iCurrentYear = oCurrentDate.getUTCFullYear(),
						iCurrentCentury = Math.floor(iCurrentYear / 100),
						iYearDiff = iCurrentCentury * 100 + iWeekYear - iCurrentYear;
					if (iYearDiff < -70) {
						iWeekYear += (iCurrentCentury + 1) * 100;
					} else if (iYearDiff < 30 ) {
						iWeekYear += iCurrentCentury * 100;
					} else {
						iWeekYear += (iCurrentCentury - 1) * 100;
					}
				}
				return {
					length: sPart.length,
					valid: oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat),
					year: iYear,
					weekYear: iWeekYear
				};
			},
			isNumeric: true
		}),
		"M": DateFormat._createPatternSymbol({
			name: "month",
			format: function(oField, oDate, bUTC, oFormat) {
				var iMonth = oDate.getUTCMonth();
				if (oField.digits === 3) {
					const vName = oFormat.aMonthsAbbrev[iMonth]; // vName may be an array if there are alternatives
					return Array.isArray(vName) ? vName[0] : vName;
				} else if (oField.digits === 4) {
					return oFormat.aMonthsWide[iMonth];
				} else if (oField.digits > 4) {
					return oFormat.aMonthsNarrow[iMonth];
				} else {
					return String(iMonth + 1).padStart(oField.digits, "0");
				}
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var iMonth, sPart, bPartInvalid, bValid,
					aMonthsVariants = [
						oFormat.aMonthsWide, oFormat.aMonthsWideSt,
						oFormat.aMonthsAbbrev, oFormat.aMonthsAbbrevSt,
						oFormat.aMonthsNarrow, oFormat.aMonthsNarrowSt
					];

				if (oPart.digits < 3) {
					sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < 2;
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);
					iMonth = parseInt(sPart) - 1;
					if (oConfig.strict && (iMonth > 11 || iMonth < 0)) {
						bValid = false;
					}
				} else {
					for (var i = 0; i < aMonthsVariants.length; i++) {
						var aVariants = aMonthsVariants[i];
						var oFound = oParseHelper.findEntry(sValue, aVariants, oFormat.oLocaleData.sCLDRLocaleId);
						if (oFound.index !== -1) {
							return {
								month: oFound.index,
								length: oFound.length
							};
						}
					}
					bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
				}
				return {
					month: iMonth,
					length: sPart ? sPart.length : 0,
					valid: bValid
				};
			},
			isNumeric: function (iDigits) {
				return iDigits < 3;
			}
		}),
		"L": DateFormat._createPatternSymbol({
			name: "monthStandalone",
			format: function(oField, oDate, bUTC, oFormat) {
				var iMonth = oDate.getUTCMonth();
				if (oField.digits === 3) {
					const vName = oFormat.aMonthsAbbrevSt[iMonth]; // vName may be an array if there are alternatives
					return Array.isArray(vName) ? vName[0] : vName;
				} else if (oField.digits === 4) {
					return oFormat.aMonthsWideSt[iMonth];
				} else if (oField.digits > 4) {
					return oFormat.aMonthsNarrowSt[iMonth];
				} else {
					return String(iMonth + 1).padStart(oField.digits, "0");
				}
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var iMonth, sPart, bPartInvalid, bValid,
					aMonthsVariants = [
						oFormat.aMonthsWide, oFormat.aMonthsWideSt,
						oFormat.aMonthsAbbrev, oFormat.aMonthsAbbrevSt,
						oFormat.aMonthsNarrow, oFormat.aMonthsNarrowSt
					];

				if (oPart.digits < 3) {
					sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < 2;
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);
					iMonth = parseInt(sPart) - 1;
					if (oConfig.strict && (iMonth > 11 || iMonth < 0)) {
						bValid = false;
					}
				} else {
					for (var i = 0; i < aMonthsVariants.length; i++) {
						var aVariants = aMonthsVariants[i];
						var oFound = oParseHelper.findEntry(sValue, aVariants, oFormat.oLocaleData.sCLDRLocaleId);
						if (oFound.index !== -1) {
							return {
								month: oFound.index,
								length: oFound.length
							};
						}
					}
					bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
				}
				return {
					month: iMonth,
					length: sPart ? sPart.length : 0,
					valid: bValid
				};
			},
			isNumeric: function (iDigits) {
				return iDigits < 3;
			}
		}),
		"w": DateFormat._createPatternSymbol({
			name: "weekInYear",
			format: function(oField, oDate, bUTC, oFormat) {
				var oWeek = oDate.getUTCWeek(oFormat.oLocale, getCalendarWeekParameter(oFormat.oFormatOptions));
				var iWeek = oWeek.week;
				var sWeek = String(iWeek + 1);
				if (oField.digits < 3) {
					sWeek = sWeek.padStart(oField.digits, "0");
				} else {
					sWeek = oFormat.oLocaleData.getCalendarWeek(oField.digits === 3 ? "narrow" : "wide", sWeek.padStart(2, "0"));
				}
				return sWeek;
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sPart, bPartInvalid, bValid, iWeek,
					iLength = 0;

				if (oPart.digits < 3) {
					sPart = oParseHelper.findNumbers(sValue, 2);
					iLength = sPart.length;
					iWeek = parseInt(sPart) - 1;
					bPartInvalid = !sPart
						|| oConfig.exactLength && iLength < 2;
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);
				} else {
					sPart = oFormat.oLocaleData.getCalendarWeek(oPart.digits === 3 ? "narrow" : "wide");
					sPart = sPart.replace("{0}", "([0-9]+)");
					var rWeekNumber = new RegExp(sPart),
						oResult = rWeekNumber.exec(sValue);
					if (oResult) {
						// e.g. for input "CW 01" create pattern "CW ([0-9]+)"
						// and extract number from "01" part of the input
						iLength = oResult[0].length;
						iWeek = parseInt(oResult[oResult.length - 1]) - 1;
					} else {
						bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
					}
				}

				return {
					length: iLength,
					valid: bValid,
					week: iWeek
				};
			},
			isNumeric: function (iDigits) {
				return iDigits < 3;
			}
		}),
		"W": DateFormat._createPatternSymbol({
			name: "weekInMonth"
		}),
		"D": DateFormat._createPatternSymbol({
			name: "dayInYear"
		}),
		"d": DateFormat._createPatternSymbol({
			name: "day",
			format: function(oField, oDate) {
				var iDate = oDate.getUTCDate();
				return String(iDate).padStart(oField.digits, "0");
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2)),
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < 2,
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat),
					iDay = parseInt(sPart);

				if (oConfig.strict && (iDay > 31 || iDay < 1)) {
					bValid = false;
				}
				return {
					day: iDay,
					length: sPart.length,
					valid: bValid
				};
			},
			isNumeric: true
		}),
		"Q": DateFormat._createPatternSymbol({
			name: "quarter",
			format: function(oField, oDate, bUTC, oFormat) {
				var iQuarter = oDate.getUTCQuarter();
				if (oField.digits === 3) {
					return oFormat.aQuartersAbbrev[iQuarter];
				} else if (oField.digits === 4) {
					return oFormat.aQuartersWide[iQuarter];
				} else if (oField.digits > 4) {
					return oFormat.aQuartersNarrow[iQuarter];
				} else {
					return String(iQuarter + 1).padStart(oField.digits, "0");
				}
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sPart, bPartInvalid, iQuarter, bValid;
				var aQuartersVariants = [oFormat.aQuartersWide, oFormat.aQuartersWideSt, oFormat.aQuartersAbbrev, oFormat.aQuartersAbbrevSt, oFormat.aQuartersNarrow, oFormat.aQuartersNarrowSt];

				if (oPart.digits < 3) {
					sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < 2;
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);
					iQuarter = parseInt(sPart) - 1;
					if (oConfig.strict && iQuarter > 3) {
						bValid = false;
					}
				} else {
					for (var i = 0; i < aQuartersVariants.length; i++) {
						var aVariants = aQuartersVariants[i];
						var oFound = oParseHelper.findEntry(sValue, aVariants, oFormat.oLocaleData.sCLDRLocaleId);
						if (oFound.index !== -1) {
							return {
								quarter: oFound.index,
								length: oFound.length
							};
						}
					}

					bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
				}
				return {
					length: sPart ? sPart.length : 0,
					quarter: iQuarter,
					valid: bValid
				};
			},
			isNumeric: function (iDigits) {
				return iDigits < 3;
			}
		}),
		"q": DateFormat._createPatternSymbol({
			name: "quarterStandalone",
			format: function(oField, oDate, bUTC, oFormat) {
				var iQuarter = oDate.getUTCQuarter();
				if (oField.digits === 3) {
					return oFormat.aQuartersAbbrevSt[iQuarter];
				} else if (oField.digits === 4) {
					return oFormat.aQuartersWideSt[iQuarter];
				} else if (oField.digits > 4) {
					return oFormat.aQuartersNarrowSt[iQuarter];
				} else {
					return String(iQuarter + 1).padStart(oField.digits, "0");
				}
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sPart, bPartInvalid, iQuarter, bValid;
				var aQuartersVariants = [oFormat.aQuartersWide, oFormat.aQuartersWideSt, oFormat.aQuartersAbbrev, oFormat.aQuartersAbbrevSt, oFormat.aQuartersNarrow, oFormat.aQuartersNarrowSt];

				if (oPart.digits < 3) {
					sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < 2;
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);
					iQuarter = parseInt(sPart) - 1;
					if (oConfig.strict && iQuarter > 3) {
						bValid = false;
					}
				} else {
					for (var i = 0; i < aQuartersVariants.length; i++) {
						var aVariants = aQuartersVariants[i];
						var oFound = oParseHelper.findEntry(sValue, aVariants, oFormat.oLocaleData.sCLDRLocaleId);
						if (oFound.index !== -1) {
							return {
								quarter: oFound.index,
								length: oFound.length
							};
						}
					}

					bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
				}
				return {
					length: sPart ? sPart.length : 0,
					quarter: iQuarter,
					valid: bValid
				};
			},
			isNumeric: function (iDigits) {
				return iDigits < 3;
			}
		}),
		"F": DateFormat._createPatternSymbol({
			name: "dayOfWeekInMonth"
		}),
		"E": DateFormat._createPatternSymbol({
			name: "dayNameInWeek", //Day of week name, format style.
			format: function(oField, oDate, bUTC, oFormat) {
				var iDay = oDate.getUTCDay();
				if (oField.digits < 4) {
					return oFormat.aDaysAbbrev[iDay];
				} else if (oField.digits === 4) {
					return oFormat.aDaysWide[iDay];
				} else if (oField.digits === 5) {
					return oFormat.aDaysNarrow[iDay];
				} else {
					return oFormat.aDaysShort[iDay];
				}
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var aDaysVariants = [oFormat.aDaysWide, oFormat.aDaysWideSt, oFormat.aDaysAbbrev, oFormat.aDaysAbbrevSt, oFormat.aDaysShort, oFormat.aDaysShortSt, oFormat.aDaysNarrow, oFormat.aDaysNarrowSt];

				for (var i = 0; i < aDaysVariants.length; i++) {
					var aVariants = aDaysVariants[i];
					var oFound = oParseHelper.findEntry(sValue, aVariants, oFormat.oLocaleData.sCLDRLocaleId);
					if (oFound.index !== -1) {
						return {
							// gets translated to dayOfWeek where the day of week is relative to the week
							dayOfWeek: oFound.index,
							length: oFound.length
						};
					}
				}
			}
		}),
		"c": DateFormat._createPatternSymbol({
			name: "dayNameInWeekStandalone",
			format: function(oField, oDate, bUTC, oFormat) {
				var iDay = oDate.getUTCDay();
				if (oField.digits < 4) {
					return oFormat.aDaysAbbrevSt[iDay];
				} else if (oField.digits === 4) {
					return oFormat.aDaysWideSt[iDay];
				} else if (oField.digits === 5) {
					return oFormat.aDaysNarrowSt[iDay];
				} else {
					return oFormat.aDaysShortSt[iDay];
				}
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var aDaysVariants = [oFormat.aDaysWide, oFormat.aDaysWideSt, oFormat.aDaysAbbrev, oFormat.aDaysAbbrevSt, oFormat.aDaysShort, oFormat.aDaysShortSt, oFormat.aDaysNarrow, oFormat.aDaysNarrowSt];

				for (var i = 0; i < aDaysVariants.length; i++) {
					var aVariants = aDaysVariants[i];
					var oFound = oParseHelper.findEntry(sValue, aVariants, oFormat.oLocaleData.sCLDRLocaleId);
					if (oFound.index !== -1) {
						return {
							day: oFound.index,
							length: oFound.length
						};
					}
				}
			}
		}),
		// day number of week (depends on locale's first day of week)
		// e.g. Thursday
		// "de": 4 (firstDay: 1)
		// "en": 5 (firstDay: 0)
		// "ar": 6 (firstDay: 6)
		"u": DateFormat._createPatternSymbol({
			name: "dayNumberOfWeek",
			format: function(oField, oDate, bUTC, oFormat) {
				var iDay = oDate.getUTCDay();
				return oFormat._adaptDayOfWeek(iDay);
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sPart = oParseHelper.findNumbers(sValue, oPart.digits),
					bPartInvalid = oConfig.exactLength && sPart.length !== oPart.digits;

				return {
					dayNumberOfWeek: parseInt(sPart),
					length: sPart.length,
					valid: oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat)
				};
			},
			isNumeric: true
		}),
		"a": DateFormat._createPatternSymbol({
			name: "amPmMarker",
			/**
			 * Formats the day period.
			 *
			 * @param {Object<string, any>} oField
			 *   The date pattern field as parsed by {@link DateFormat#parseCldrDatePattern}
			 * @param {number} oField.digits
			 *   The number of repetitions of the pattern symbol, e.g. <code>3</code> for "aaa"
			 * @param {string} oField.symbol
			 *   The pattern symbol "a"
			 * @param {string} oField.type
			 *   The symbol name "amPmMarker"
			 * @param {sap.ui.core.date.UniversalDate} oDate
			 *   The date to format
			 * @param {boolean} [bUTC]
			 *   Whether the UTC option is set; not used
			 * @param {sap.ui.core.format.DateFormat} oFormat
			 *   The <code>DateFormat</code> instance
			 * @returns {string}
			 *   The formatted day period, e.g. "AM" for symbol "a"
			 */
			format : function (oField, oDate, bUTC, oFormat) {
				var iDayPeriod = oDate.getUTCDayPeriod();

				if (oField.digits <= 3) {
					return oFormat.aDayPeriodsAbbrev[iDayPeriod];
				} else if (oField.digits === 4) {
					return oFormat.aDayPeriodsWide[iDayPeriod];
				} else {
					return oFormat.aDayPeriodsNarrow[iDayPeriod];
				}
			},

			/**
			 * Parses the day period from a given input string.
			 *
			 * @param {string} sValue
			 *   The given input, e.g. "am 13:37"
			 * @param {Object<string, any>} oPart
			 *   The date pattern field as parsed by {@link DateFormat#parseCldrDatePattern}
			 * @param {number} oPart.digits
			 *   The number of repetitions of the pattern symbol, e.g. <code>3</code> for "aaa"
			 * @param {string} oPart.symbol
			 *   The pattern symbol "a"
			 * @param {string} oPart.type
			 *   The symbol name "amPmMarker"
			 * @param {sap.ui.core.format.DateFormat} oFormat
			 *   The <code>DateFormat</code> instance
			 * @param {Object<string, any>} [oConfig]
			 *   The configuration object for parsing the value
			 * @param {object[]} [oConfig.formatArray]
			 *   The complete format array as parsed by {@link DateFormat#parseCldrDatePattern}
			 * @param {object} [oConfig.dateValue]
			 *   The already parsed date fields
			 * @param {number} [oConfig.index]
			 *   The index in the format array
			 * @param {boolean} [oConfig.strict]
			 *   Whether to use the strict option
			 * @param {string} [sTimezone]
			 *   The IANA timezone ID
			 * @returns {{length : number, pm : boolean}|{}}
			 *   An object with the <code>length</code> of the match and the parsed <code>pm</code>
			 *   value; or an object with property valid <code>false</code> if it could not be
			 *   parsed correctly
			 */
			parse : function (sValue, oPart, oFormat, oConfig, sTimezone) {
				// process longer patterns first to find the longest match
				// wide > abbreviated > narrow
				var rAMPM, bAMPMAlternativeCase, oEntry, i, aMatch, aVariants,
					aDayPeriodsVariants = [oFormat.aDayPeriodsWide, oFormat.aDayPeriodsAbbrev,
						oFormat.aDayPeriodsNarrow];

				// Support ASCII alternative writings for AM/PM (when the locale has am/pm in its
				// patterns), e.g. "am", "a.m.", "am.", "a. m." (and their case alternatives)
				// see: https://unicode.org/reports/tr35/tr35-dates.html#Parsing_Dates_Times
				rAMPM = /[aApP](?:\.)?[\x20\xA0]?[mM](?:\.)?/;
				aMatch = sValue.match(rAMPM);
				bAMPMAlternativeCase = aMatch && aMatch.index === 0;
				function removeSpacesAndDots (sValue) {
					// Remove normal and non-breaking spaces and remove dots
					return sValue.replace(/[\x20\xA0]/g, "").replace(/\./g, "");
				}
				if (bAMPMAlternativeCase) {
					sValue = removeSpacesAndDots(sValue);
				}

				for (i = 0; i < aDayPeriodsVariants.length; i += 1) {
					aVariants = aDayPeriodsVariants[i].map((sDayPeriod) => {
						return FormatUtils.normalize(sDayPeriod);
					});
					if (bAMPMAlternativeCase) {
						// check normalized match for alternative case of am/pm
						aVariants = aVariants.map(removeSpacesAndDots);
					}
					// check exact and case-insensitive match
					oEntry = oParseHelper.findEntry(sValue, aVariants,
						oFormat.oLocaleData.sCLDRLocaleId);
					if (oEntry.index !== -1) {
						return {
							pm : oEntry.index === 1,
							// am/pm alternative may include an additional dot, e.g. "am."
							// therefore the length for the am/pm alternative is the length of the
							// match
							length : bAMPMAlternativeCase ? aMatch[0].length : oEntry.length
						};
					}
				}

				return {
					valid: false
				};
			}
		}),
		"B": DateFormat._createPatternSymbol({
			name : "flexibleDayPeriod",
			/**
			 * Formats the flexible day period.
			 *
			 * @param {Object<string, any>} oField
			 *   The date pattern field as parsed by {@link DateFormat#parseCldrDatePattern}
			 * @param {int} oField.digits
			 *   The number of repetitions of the pattern symbol, e.g. <code>3</code> for "BBB"
			 * @param {sap.ui.core.date.UniversalDate} oDate
			 *   The date object to format
			 * @param {boolean} bUTC
			 *   Whether the UTC option is set; not used
			 * @param {sap.ui.core.format.DateFormat} oFormat
			 *   The <code>DateFormat</code> instance
			 * @returns {string}
			 *   The selected day period e.g. "in the afternoon" for the according style width
			 *   "abbreviated", "narrow" or "wide"
			 */
			format : function (oField, oDate, bUTC, oFormat) {
				// If no hours symbol is contained in the pattern, the stand-alone format must be
				// used. Only non-input skeleton symbols are used. The pattern symbols for hour can
				// be found under:
				// https://unicode.org/reports/tr35/tr35-dates.html#dfst-hour
				var bContainsHour = oFormat.aFormatArray.some(function (oFormatElement) {
						return "hHKk".includes(oFormatElement.symbol);
					}),
					sFlexibleDayPeriod = oFormat.oLocaleData.getFlexibleDayPeriodOfTime(
						oDate.getUTCHours(), oDate.getUTCMinutes());

				if (bContainsHour) {
					if (oField.digits <= 3) {
						return oFormat.oFlexibleDayPeriodsAbbrev[sFlexibleDayPeriod];
					}
					if (oField.digits === 4) {
						return oFormat.oFlexibleDayPeriodsWide[sFlexibleDayPeriod];
					}

					return oFormat.oFlexibleDayPeriodsNarrow[sFlexibleDayPeriod];
				}

				if (oField.digits <= 3) {
					return oFormat.oFlexibleDayPeriodsAbbrevSt[sFlexibleDayPeriod];
				}
				if (oField.digits === 4) {
					return oFormat.oFlexibleDayPeriodsWideSt[sFlexibleDayPeriod];
				}

				return oFormat.oFlexibleDayPeriodsNarrowSt[sFlexibleDayPeriod];
			},
			/**
			 * Parses the flexible day period from a given input string.
			 *
			 * @param {string} sValue
			 *   The given input, e.g. "in the afternoon 01:37"
			 * @param {Object<string, any>} oPart
			 *   The date pattern field as parsed by {@link DateFormat#parseCldrDatePattern}
			 * @param {sap.ui.core.format.DateFormat} oFormat
			 *   The <code>DateFormat</code> instance
			 * @param {object} oConfig
			 *   The configuration object for parsing the value
			 * @returns {{flexDayPeriod: string, length: number}|{valid: boolean}}
			 *   An object with the parsed <code>flexDayPeriod</code> and the <code>length</code>
			 *   value of the match; otherwise, an object with property <code>valid</code>
			 *   <code>false</code> if it could not be parsed correctly or in case it is attempted
			 *   to parse a string with a stand-alone format
			 */
			parse : function (sValue, oPart, oFormat, oConfig) {
				var i, oFound, oVariant,
					bContainsHour = oFormat.aFormatArray.some(function (oFormatElement) {
						return "hHKk".includes(oFormatElement.symbol);
					}),
					// "aFlexibleDayPeriodVariants" is ordered from "wide" to "narrow" to find the
					// longest match
					aFlexibleDayPeriodVariants = [
						oFormat.oFlexibleDayPeriodsWide,
						oFormat.oFlexibleDayPeriodsAbbrev,
						oFormat.oFlexibleDayPeriodsNarrow
					];

				if (bContainsHour) {
					for (i = 0; i < aFlexibleDayPeriodVariants.length; i++) {
						oVariant = aFlexibleDayPeriodVariants[i];
						oFound = oParseHelper.findEntry(sValue, Object.values(oVariant),
							oFormat.oLocaleData.sCLDRLocaleId);

						if (oFound.index !== -1) {
							return {
								flexDayPeriod : Object.keys(oVariant)[oFound.index],
								length : oFound.length
							};
						}
					}
				}

				return {valid : false};
			}
		}),
		"H": DateFormat._createPatternSymbol({
			name: "hour0_23",
			format: function(oField, oDate) {
				var iHours = oDate.getUTCHours();
				return String(iHours).padStart(oField.digits, "0");
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2)),
					iHours = parseInt(sPart),
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < 2,
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);

				if (oConfig.strict && iHours > 23) {
					bValid = false;
				}

				return {
					hour: iHours,
					length: sPart.length,
					valid: bValid
				};
			},
			isNumeric: true
		}),
		"k": DateFormat._createPatternSymbol({
			name: "hour1_24",
			format: function(oField, oDate) {
				var iHours = oDate.getUTCHours();
				var sHours = (iHours === 0 ? "24" : String(iHours));

				return sHours.padStart(oField.digits, "0");
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2)),
					iHours = parseInt(sPart),
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < 2,
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);

				if (iHours === 24) {
					iHours = 0;
				}
				if (oConfig.strict && iHours > 23) {
					bValid = false;
				}

				return {
					hour: iHours,
					length: sPart.length,
					valid: bValid
				};
			},
			isNumeric: true
		}),
		"K": DateFormat._createPatternSymbol({
			name: "hour0_11",
			format: function(oField, oDate) {
				var iHours = oDate.getUTCHours();
				var sHours = String(iHours > 11 ? iHours - 12 : iHours);

				return sHours.padStart(oField.digits, "0");
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2)),
					iHours = parseInt(sPart),
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < 2,
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);

				if (oConfig.strict && iHours > 11) {
					bValid = false;
				}

				return {
					hour: iHours,
					length: sPart.length,
					valid: bValid
				};
			},
			isNumeric: true
		}),
		"h": DateFormat._createPatternSymbol({
			name: "hour1_12",
			format: function(oField, oDate) {
				var iHours = oDate.getUTCHours();
				var sHours;

				if (iHours > 12) {
					sHours = String(iHours - 12);
				} else if (iHours === 0) {
					sHours = "12";
				} else {
					sHours = String(iHours);
				}
				return sHours.padStart(oField.digits, "0");
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var bPM = oConfig.dateValue.pm,
					sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2)),
					iHours = parseInt(sPart),
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < 2,
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);


				if (iHours === 12) {
					iHours = 0;
					// change the PM only when it's not yet parsed
					// 12:00 defaults to 12:00 PM
					 bPM = (bPM === undefined) ? true : bPM;
				}

				if (oConfig.strict && iHours > 11) {
					bValid = false;
				}

				return {
					hour: iHours,
					length: sPart.length,
					pm: bPM,
					valid: bValid
				};
			},
			isNumeric: true
		}),
		"m": DateFormat._createPatternSymbol({
			name: "minute",
			format: function(oField, oDate) {
				var iMinutes = oDate.getUTCMinutes();
				return String(iMinutes).padStart(oField.digits, "0");
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2)),
					iMinutes = parseInt(sPart),
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < 2,
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);

				if (oConfig.strict && iMinutes > 59) {
					bValid = false;
				}

				return {
					length: sPart.length,
					minute: iMinutes,
					valid: bValid
				};
			},
			isNumeric: true
		}),
		"s": DateFormat._createPatternSymbol({
			name: "second",
			format: function(oField, oDate) {
				var iSeconds = oDate.getUTCSeconds();
				return String(iSeconds).padStart(oField.digits, "0");
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var iExpectedDigits = Math.max(oPart.digits, 2),
					sPart = oParseHelper.findNumbers(sValue, iExpectedDigits),
					bPartInvalid = sPart === ""
						|| oConfig.exactLength && sPart.length < iExpectedDigits,
					iSeconds = parseInt(sPart),
					bValid = oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat);

				if (oConfig.strict && iSeconds > 59) {
					bValid = false;
				}

				return {
					length: sPart.length,
					second: iSeconds,
					valid: bValid
				};
			},
			isNumeric: true
		}),
		"S": DateFormat._createPatternSymbol({
			name: "fractionalsecond",
			format: function(oField, oDate) {
				var iMilliseconds = oDate.getUTCMilliseconds();
				var sMilliseconds = String(iMilliseconds);
				var sFractionalseconds = sMilliseconds.padStart(3, "0");
				sFractionalseconds = sFractionalseconds.substr(0, oField.digits);
				sFractionalseconds = sFractionalseconds.padEnd(oField.digits, "0");
				return sFractionalseconds;
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var sPart = oParseHelper.findNumbers(sValue, oPart.digits),
					iLength = sPart.length,
					bPartInvalid = oConfig.exactLength && iLength < oPart.digits;

				sPart = sPart.substr(0, 3);
				sPart = sPart.padEnd(3, "0");

				var iMilliseconds = parseInt(sPart);

				return {
					length: iLength,
					millisecond: iMilliseconds,
					valid: oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat)
				};
			},
			isNumeric: true
		}),
		"z": DateFormat._createPatternSymbol({
			name: "timezoneGeneral",
			format: function(oField, oDate, bUTC, oFormat, sTimezone) {
				//TODO getTimezoneLong and getTimezoneShort does not exist on Date object
				//-> this is a preparation for a future full timezone support (only used by unit test so far)
				if (oField.digits > 3 && oDate.getTimezoneLong && oDate.getTimezoneLong()) {
					return oDate.getTimezoneLong();
				} else if (oDate.getTimezoneShort && oDate.getTimezoneShort()) {
					return oDate.getTimezoneShort();
				}

				// valid for zzzz (fallback to OOOO)
				var iTimezoneOffset = TimezoneUtils.calculateOffset(oDate, sTimezone);
				var sTimeZone = "GMT";
				var iTZOffset = Math.abs(iTimezoneOffset / 60);
				var bPositiveOffset = iTimezoneOffset > 0;
				var iHourOffset = Math.floor(iTZOffset / 60);
				var iMinuteOffset = Math.floor(iTZOffset % 60);

				if (!bUTC && iTZOffset !== 0) {
					sTimeZone += (bPositiveOffset ? "-" : "+");
					sTimeZone += String(iHourOffset).padStart(2, "0");
					sTimeZone += ":";
					sTimeZone += String(iMinuteOffset).padStart(2, "0");
				} else {
					sTimeZone += "Z";
				}

				return sTimeZone;
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				var iLength = 0;
				var iTZDiff;
				var oTZ = sValue.substring(0, 3);

				if (oTZ === "GMT" || oTZ === "UTC") {
					iLength = 3;
				} else if (sValue.substring(0, 2) === "UT") {
					iLength = 2;
				} else if (sValue.charAt(0) === "Z") {
					iLength = 1;
					iTZDiff = 0;
				} else {
					return {
						error: "cannot be parsed correctly by sap.ui.core.format.DateFormat: The given timezone is not supported!"
					};
				}

				if (sValue.charAt(0) !== "Z") {
					var oParsedTZ = oParseHelper.parseTZ(sValue.substr(iLength), true);

					iLength += oParsedTZ.length;
					iTZDiff = oParsedTZ.tzDiff;
				}

				return {
					length: iLength,
					tzDiff: iTZDiff
				};
			}
		}),
		"Z": DateFormat._createPatternSymbol({
			name: "timezoneRFC822",
			format: function(oField, oDate, bUTC, oFormat, sTimezone) {
				var iTimezoneOffset = TimezoneUtils.calculateOffset(oDate, sTimezone);
				var iTZOffset = Math.abs(iTimezoneOffset / 60);
				var bPositiveOffset = iTimezoneOffset > 0;
				var iHourOffset = Math.floor(iTZOffset / 60);
				var iMinuteOffset = Math.floor(iTZOffset % 60);
				var sTimeZone = "";

				// valid for Z-ZZZ
				// per RFC822 a timezone always has 4 digits
				// UTC+0: "+0000"
				// UTC-7: "-0700"
				// UTC+2: "+0200"
				// https://tools.ietf.org/html/rfc822 paragraph 5.1
				if (!bUTC) {
					sTimeZone += (bPositiveOffset ? "-" : "+");
					sTimeZone += String(iHourOffset).padStart(2, "0");
					sTimeZone += String(iMinuteOffset).padStart(2, "0");
				}

				return sTimeZone;
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				return oParseHelper.parseTZ(sValue, false);
			}
		}),
		"X": DateFormat._createPatternSymbol({
			name: "timezoneISO8601",
			format: function(oField, oDate, bUTC, oFormat, sTimezone) {
				/*
				 * Mountain Standard Time (MST, UTC-7)
				 * X:           "-07"
				 * XX, XXXX:    "-0700"
				 * XXX, XXXXX:  "-07:00"
				 */

				/*
				 * Central European Summer Time (CEST, UTC+2)
				 * X:           "+02"
				 * XX, XXXX:    "+0200"
				 * XXX, XXXXX:  "+02:00"
				 */

				/*
				 * Indian Standard Time (IST, UTC+5:30)
				 * X:           "+0530"
				 * XX, XXXX:    "+0530"
				 * XXX, XXXXX:  "+05:30"
				 */

				/*
				 * Greenwich Mean Time (GMT, UTC+0)
				 * X:           "Z"
				 * XX, XXXX:    "Z"
				 * XXX, XXXXX:  "Z"
				 */

				// @see http://www.unicode.org/reports/tr35/tr35-dates.html#Time_Zone_Goals
				var iTimezoneOffset = TimezoneUtils.calculateOffset(oDate, sTimezone);
				var iTZOffset = Math.abs(iTimezoneOffset / 60);
				var bPositiveOffset = iTimezoneOffset > 0;
				var iHourOffset = Math.floor(iTZOffset / 60);
				var iMinuteOffset = Math.floor(iTZOffset % 60);

				var sTimeZone = "";
				if (!bUTC && iTZOffset !== 0) {
					sTimeZone += (bPositiveOffset ? "-" : "+");
					sTimeZone += String(iHourOffset).padStart(2, "0");
					if (oField.digits > 1 || iMinuteOffset > 0) {
						if (oField.digits === 3 || oField.digits === 5) {
							sTimeZone += ":";
						}
						sTimeZone += String(iMinuteOffset).padStart(2, "0");
					}
				} else {
					sTimeZone += "Z";
				}

				return sTimeZone;
			},
			parse: function(sValue, oPart, oFormat, oConfig) {
				if (sValue.charAt(0) === "Z") {
					return {
						length: 1,
						tzDiff: 0
					};
				} else {
					return oParseHelper.parseTZ(sValue, oPart.digits === 3 || oPart.digits === 5);
				}
			}
		}),
		"V": DateFormat._createPatternSymbol({
			name: "timezoneID",
			format: function(oField, oDate, bUTC, oFormat, sTimezone) {
				// Only VV is supported
				// The IANA time zone ID
				// e.g. America/New_York
				// @see http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns
				if (!bUTC && oField.digits === 2) {
					// fallback for unknown but valid IANA time zone IDs (IANA is a living standard and the browser
					// might support more, while the CLDR data is fixed) such that the user can see, that there is no
					// translation
					return oFormat.oLocaleData.getTimezoneTranslations()[sTimezone] || sTimezone;
				}
				return "";
			},
			parse: function(sValue, oPart, oFormat, oConfig, sTimezone) {
				var oTimezoneParsed = {
					timezone: "",
					length: 0
				};

				// VV - The long IANA time zone ID
				if (oPart.digits === 2) {
					var mTimezoneTranslations = oFormat.oLocaleData.getTimezoneTranslations();

					// shortcut, first try the time zone parameter
					if (sValue === mTimezoneTranslations[sTimezone]) {
						return {
							timezone: sTimezone,
							length: sValue.length
						};
					}

					var aTimezoneTranslations = Object.values(mTimezoneTranslations);
					var oTimezoneResult = oParseHelper.findEntry(sValue, aTimezoneTranslations,
							oFormat.oLocaleData.sCLDRLocaleId);
					if (oTimezoneResult.index !== -1) {
						return {
							timezone: Object.keys(mTimezoneTranslations)[oTimezoneResult.index],
							length: oTimezoneResult.length
						};
					}

					// fallback for IANA time zone IDs
					var sCurrentValue = "";
					// find the longest valid time zone ID at the beginning of sValue
					for (var i = sValue.length; i > 0; i -= 1) {
						sCurrentValue = sValue.slice(0, i);
						if (TimezoneUtils.isValidTimezone(sCurrentValue)) {
							oTimezoneParsed.timezone = sCurrentValue;
							oTimezoneParsed.length = sCurrentValue.length;
							break;
						}
					}
				}

				return oTimezoneParsed;
			}
		})
	};

	DateFormat.prototype._format = function(oJSDate, bUTC, sTimezone) {
		if (this.oFormatOptions.relative) {
			var sRes = this.formatRelative(oJSDate, bUTC, this.oFormatOptions.relativeRange, sTimezone);
			if (sRes) { //Stop when relative formatting possible, else go on with standard formatting
				return sRes;
			}
		}

		var sCalendarType = this.oFormatOptions.calendarType;
		var oDate = UniversalDate.getInstance(oJSDate, sCalendarType);

		var aBuffer = [], oPart, sResult, sSymbol;

		for (var i = 0; i < this.aFormatArray.length; i++) {
			oPart = this.aFormatArray[i];
			sSymbol = oPart.symbol || "";

			aBuffer.push(this.oSymbols[sSymbol].format(oPart, oDate, bUTC, this, sTimezone));
		}

		sResult = aBuffer.join("");

		if (Supportability.collectOriginInfo()) {
			// String object is created on purpose and must not be a string literal
			// eslint-disable-next-line no-new-wrappers
			sResult = new String(sResult);
			sResult.originInfo = {
				source: "Common Locale Data Repository",
				locale: this.oLocale.toString(),
				style: this.oFormatOptions.style,
				pattern: this.oFormatOptions.pattern
			};
		}

		return sResult;
	};

	/**
	 * Format a date according to the given format options.
	 *
	 * Uses the timezone from {@link module:sap/base/i18n/Localization.getTimezone Localization.getTimezone}, which
	 * falls back to the browser's local timezone to convert the given date.
	 *
	 * When using instances from getDateTimeWithTimezoneInstance, please see the corresponding documentation:
	 * {@link sap.ui.core.format.DateFormat.DateTimeWithTimezone#format}.
	 *
	 * @example <caption>DateTime (assuming timezone "Europe/Berlin")</caption>
	 * var oDate = UI5Date.getInstance("2021-12-24T13:37:00Z");
	 * DateFormat.getDateTimeInstance().format(oDate);
	 * // output: "Dec 24, 2021, 2:37:00 PM"
	 *
	 * @param {Date|Date[]} vJSDate the value to format
	 * @param {boolean} [bUTC=false] whether to use UTC
	 * @return {string} the formatted output value. If an invalid date is given, an empty string is returned.
	 * @public
	 */
	DateFormat.prototype.format = function(vJSDate, bUTC) {
		var sTimezone;
		if (this.type === mDateFormatTypes.DATETIME_WITH_TIMEZONE) {
			// UTC and timezone are not supported at the same time, therefore set bUTC to false
			sTimezone = bUTC;
			bUTC = false;

			checkTimezoneParameterType(sTimezone);
			if (sTimezone && !TimezoneUtils.isValidTimezone(sTimezone)) {
				Log.error("The given timezone isn't valid.");
				return "";
			}
		}

		var sCalendarType = this.oFormatOptions.calendarType,
			sResult;

		if (bUTC === undefined) {
			bUTC = this.oFormatOptions.UTC;
		}

		// default the timezone to the local timezone to always enforce the conversion
		sTimezone = sTimezone || Localization.getTimezone();

		if (Array.isArray(vJSDate)) {
			if (!this.oFormatOptions.interval) {
				Log.error("Non-interval DateFormat can't format more than one date instance.");
				return "";
			}

			if (vJSDate.length !== 2) {
				Log.error("Interval DateFormat can only format with 2 date instances but " + vJSDate.length + " is given.");
				return "";
			}
			vJSDate = vJSDate.map(function(oJSDate) {
				return convertToTimezone(oJSDate, sTimezone, bUTC);
			});

			if (this.oFormatOptions.singleIntervalValue) {
				if (vJSDate[0] === null) {
					Log.error("First date instance which is passed to the interval DateFormat shouldn't be null.");
					return "";
				}

				if (vJSDate[1] === null) {
					sResult = this._format(vJSDate[0], bUTC, sTimezone);
				}
			}

			if (sResult === undefined) {
				if (!vJSDate.every(isValidDateObject)) {
					Log.error("At least one date instance which is passed to the interval DateFormat isn't valid.");
					return "";
				}

				sResult = this._formatInterval(vJSDate, bUTC);
			}
		} else {
			if (!isValidDateObject(vJSDate)) {
				// Although an invalid date was given, the DATETIME_WITH_TIMEZONE instance might
				// have a pattern with the timezone (VV) inside then the IANA timezone ID is returned
				if (this.type === mDateFormatTypes.DATETIME_WITH_TIMEZONE && this.oFormatOptions.pattern.includes("VV")) {
					return this.oLocaleData.getTimezoneTranslations()[sTimezone] || sTimezone;
				}
				Log.error("The given date instance isn't valid.");
				return "";
			}

			if (this.oFormatOptions.interval) {
				Log.error("Interval DateFormat expects an array with two dates for the first argument but only one date is given.");
				return "";
			}

			vJSDate = convertToTimezone(vJSDate, sTimezone, bUTC);
			sResult = this._format(vJSDate, bUTC, sTimezone);
		}

		// Support Japanese Gannen instead of Ichinen for first year of the era
		if (sCalendarType === CalendarType.Japanese && this.oLocale.getLanguage() === "ja") {
			sResult = sResult.replace(/(^|[^\d])1年/g, "$1元年");
		}

		return sResult;
	};

	/**
	 * Checks whether the interval to be formatted has to use the pattern of a custom interval delimiter.
	 *
	 * @param {object} oDiffFields
	 *   An object describing which date information is required for this instance's interval format,
	 *   for example <code>{"Day": true, "Minutes": true}</code>
	 * @returns {boolean}
	 *   Whether to use the custom interval delimiter pattern
	 *
	 * @private
	 */
	DateFormat.prototype._useCustomIntervalDelimiter = function (oDiffFields) {
		var aTokens;

		if (!this.oFormatOptions.intervalDelimiter) {
			return false;
		}
		// If there are no differences in the date/time parts specified by "oFormatOptions.format", a single value is
		// formatted and there is no need to use the custom delimiter pattern.
		if (this.oFormatOptions.format) {
			aTokens = this.oLocaleData._parseSkeletonFormat(this.oFormatOptions.format);

			return aTokens.some(function (oToken) {
				return oDiffFields[oToken.group];
			});
		}

		return true;
	};

	DateFormat.prototype._formatInterval = function(aJSDates, bUTC) {
		var oDate, oPart, sPattern, sSymbol,
			aBuffer = [],
			sCalendarType = this.oFormatOptions.calendarType,
			aFormatArray = [],
			oFromDate = UniversalDate.getInstance(aJSDates[0], sCalendarType),
			oToDate = UniversalDate.getInstance(aJSDates[1], sCalendarType),
			oDiffFields = this._getDiffFields([oFromDate, oToDate]);

		if (!oDiffFields) {
			return this._format(aJSDates[0], bUTC);
		}

		if (this._useCustomIntervalDelimiter(oDiffFields)) {
			sPattern = this.intervalPatterns[0];
		} else if (this.oFormatOptions.format) {
			// when 'format' option is set, generate the pattern based on the greatest difference
			sPattern = this.oLocaleData.getCustomIntervalPattern(this.oFormatOptions.format, oDiffFields,
				sCalendarType);
		} else {
			sPattern = this.oLocaleData.getCombinedIntervalPattern(this.oFormatOptions.pattern, sCalendarType);
		}

		aFormatArray = this.parseCldrDatePattern(sPattern);

		oDate = oFromDate;
		for (var i = 0; i < aFormatArray.length; i++) {
			oPart = aFormatArray[i];
			sSymbol = oPart.symbol || "";

			if (oPart.repeat) {
				oDate = oToDate;
			}

			aBuffer.push(this.oSymbols[sSymbol].format(oPart, oDate, bUTC, this));
		}

		return aBuffer.join("");
	};

	var mFieldToGroup = {
		Era: "Era",
		FullYear: "Year",
		Quarter: "Quarter",
		Month: "Month",
		Week: "Week",
		Date: "Day",
		DayPeriod: "DayPeriod",
		Hours: "Hour",
		Minutes: "Minute",
		Seconds: "Second"
	};

	/**
	 * Returns an object containing the relevant date/time parts that differ in the two given dates.
	 *
	 * @param {sap.ui.core.date.UniversalDate[]} aDates
	 *   An array with two UniversalDate instances representing the start and the end date of the interval;
	 *   the dates are expected to be in UTC time zone
	 * @returns {Object<string, boolean>|null}
	 *   An object containing the different date/time parts, or <code>null</code> if the dates are the same
	 *
	 * @private
	 */
	DateFormat.prototype._getDiffFields = function(aDates) {
		var bDiffFound = false,
			mDiff = {};

		this.aIntervalCompareFields.forEach(function(sField) {
			var sGetterPrefix = "getUTC",
				sMethodName = sGetterPrefix + sField,
				sFieldGroup = mFieldToGroup[sField],
				vFromValue = aDates[0][sMethodName].apply(aDates[0]),
				vToValue = aDates[1][sMethodName].apply(aDates[1]);

			if (!deepEqual(vFromValue, vToValue)) {
				bDiffFound = true;
				mDiff[sFieldGroup] = true;
			}
		});

		if (bDiffFound) {
			return mDiff;
		}

		return null;
	};

	DateFormat.prototype._parse = function(sValue, aFormatArray, bUTC, bStrict, sTimezone) {
		var sFlexibleDayPeriod, oNextPart, oPart, bPM, oPrevPart, oResult, sSubValue,
			oDateValue = {
				valid: true,
				lastTimezonePatternSymbol: ""
			},
			iIndex = 0,
			oParseConf = {
				formatArray: aFormatArray,
				dateValue: oDateValue,
				strict: bStrict
			},
			that = this;

		function getSymbol(oPart0) { return that.oSymbols[oPart0.symbol || ""]; }
		function isNumeric(oPart0) { return !!oPart0 && getSymbol(oPart0).isNumeric(oPart0.digits); }

		for (var i = 0; i < aFormatArray.length; i++) {
			sSubValue = sValue.substr(iIndex);
			oPart = aFormatArray[i];
			oPrevPart = aFormatArray[i - 1];
			oNextPart = aFormatArray[i + 1];
			oParseConf.index = i;
			oParseConf.exactLength = isNumeric(oPart) && (isNumeric(oPrevPart) || isNumeric(oNextPart));

			oResult = getSymbol(oPart).parse(sSubValue, oPart, this, oParseConf, sTimezone) || {};
			// Remember the last required timezone difference which needs to be calculated (V pattern) or applied (x and z pattern)
			if (oResult.tzDiff !== undefined || oResult.timezone) {
				oResult.lastTimezonePatternSymbol = oPart.symbol;
			}
			oDateValue = extend(oDateValue, oResult);

			if (oResult.valid === false) {
				break;
			}

			iIndex += oResult.length || 0;
		}

		oDateValue.index = iIndex;

		bPM = oDateValue.pm;
		// "getFlexibleDayPeriodOfTime" is required if the given time is earlier than 12 pm because,
		// for a "h" pattern it can't distinguished whether e.g. 1 o'clock is meant to be AM or PM
		if (oDateValue.flexDayPeriod && (oDateValue.hour * 60 + (oDateValue.minute || 0)) < 720) {
			sFlexibleDayPeriod = this.oLocaleData.getFlexibleDayPeriodOfTime(
				oDateValue.hour + 12, (oDateValue.minute || 0));

			bPM = oDateValue.flexDayPeriod === sFlexibleDayPeriod;
		}

		if (bPM) {
			oDateValue.hour += 12;
		}

		// use dayOfWeek (E) as dayNumberOfWeek (u) if dayNumberOfWeek (u) is not present
		if (oDateValue.dayNumberOfWeek === undefined && oDateValue.dayOfWeek !== undefined) {
			oDateValue.dayNumberOfWeek = this._adaptDayOfWeek(oDateValue.dayOfWeek);
		}

		if (oDateValue.quarter !== undefined && oDateValue.month === undefined && oDateValue.day === undefined) {
			oDateValue.month = 3 * oDateValue.quarter;
			oDateValue.day = 1;
		}

		return oDateValue;
	};

	DateFormat.prototype._parseInterval = function(sValue, sCalendarType, bUTC, bStrict, sTimezone) {
		var aDateValues,
			iRepeat,
			oDateValue;

		// Try out with all possible patterns until successfully parse has been done or the end of the array is reached
		this.intervalPatterns.some(function(sPattern) {
			var aFormatArray = this.parseCldrDatePattern(sPattern);

			iRepeat = undefined;

			// loop through aFormatArray until we have found the repeated date symbol and get the index
			for (var i = 0; i < aFormatArray.length; i++) {
				if (aFormatArray[i].repeat) {
					iRepeat = i;
					break;
				}
			}
			if (iRepeat === undefined) {
				// In case of standard date pattern, parse string as single date and put the same date twice into the aDateValues array
				oDateValue = this._parse(sValue, aFormatArray, bUTC, bStrict, sTimezone);

				// If input value has not been completely parsed, mark it as invalid
				if (oDateValue.index === 0 || oDateValue.index < sValue.length) {
					oDateValue.valid = false;
				}

				if (oDateValue.valid === false) {
					return;
				}

				aDateValues = [oDateValue, oDateValue];

				return true;
			} else {
				aDateValues = [];

				// Call _parse function with start 0 and end index of repeated symbol
				oDateValue = this._parse(sValue, aFormatArray.slice(0, iRepeat), bUTC, bStrict, sTimezone);

				if (oDateValue.valid === false) {
					return;
				}
				aDateValues.push(oDateValue);

				var iLength = oDateValue.index;

				// Call _parse function with start iRepeat and end of array
				oDateValue = this._parse(sValue.substring(iLength), aFormatArray.slice(iRepeat), bUTC, bStrict, sTimezone);

				// If input value has not been completely parsed, mark it as invalid
				if (oDateValue.index === 0 || oDateValue.index + iLength < sValue.length) {
					oDateValue.valid = false;
				}

				if (oDateValue.valid === false) {
					return;
				}
				aDateValues.push(oDateValue);

				return true;
			}
		}.bind(this));

		return aDateValues;
	};

	/**
	 * Retrieves the parameter for the calendar week configuration from the DateFormat's format
	 * options
	 *
	 * @param {{firstDayOfWeek: int, minimalDaysInFirstWeek: int, calendarWeekNumbering: sap.ui.core.date.CalendarWeekNumbering}} oFormatOptions
	 *   The format options with which the DateFormat instance was created
	 * @returns {sap.ui.core.date.CalendarWeekNumbering|{firstDayOfWeek: int, minimalDaysInFirstWeek: int}|undefined}
	 *   The parameter for the calendar week configuration
	 */
	function getCalendarWeekParameter (oFormatOptions) {
		if (oFormatOptions.calendarWeekNumbering) {
			return oFormatOptions.calendarWeekNumbering;
		// either both are provided or none (checked in DateFormat.createInstance)
		} else if (oFormatOptions.firstDayOfWeek !== undefined && oFormatOptions.minimalDaysInFirstWeek !== undefined) {
			return {
				firstDayOfWeek: oFormatOptions.firstDayOfWeek,
				minimalDaysInFirstWeek: oFormatOptions.minimalDaysInFirstWeek
			};
		}
		return undefined;
	}

	/**
	 * Converts a given date to the given timezone if bUTC is false
	 *
	 * @param {Date} oJSDate The date which should be converted
	 * @param {string} sTimezone target timezone
	 * @param {boolean} bUTC whether it is utc
	 * @returns {Date} the converted date
	 */
	var convertToTimezone = function(oJSDate, sTimezone, bUTC) {
		// Convert to timezone if provided and a valid date is supplied
		if (!bUTC && isValidDateObject(oJSDate)) {
			// convert given date to a date in the target timezone
			return TimezoneUtils.convertToTimezone(oJSDate, sTimezone);
		}
		return oJSDate;
	};

	// recreate javascript date object from the given oDateValues.
	// In case of oDateValue.valid == false, null value will be returned
	var fnCreateDate = function(oDateValue, sCalendarType, bUTC, bStrict, sTimezone, oFormatOptions, oLocale) {
		if (!oDateValue.valid) {
			return null;
		}

		var oDate,
			iYear = typeof oDateValue.year === "number" ? oDateValue.year : 1970;

		// no need to use UI5Date.getInstance as only the UTC timestamp is used
		oDate = UniversalDate.getInstance(new Date(0), sCalendarType);
		oDate.setUTCEra(oDateValue.era || UniversalDate.getCurrentEra(sCalendarType));
		// Set parsed year, month and day in one call to avoid calculation issues when converting the calendar specific
		// date into a Gregorian date.
		oDate.setUTCFullYear(iYear, oDateValue.month || 0, oDateValue.day || 1);
		oDate.setUTCHours(oDateValue.hour || 0);
		oDate.setUTCMinutes(oDateValue.minute || 0);
		oDate.setUTCSeconds(oDateValue.second || 0);
		oDate.setUTCMilliseconds(oDateValue.millisecond || 0);
		if (bStrict && (oDateValue.day || 1) !== oDate.getUTCDate()) {
			// check if valid date given - if invalid, day is not the same (31.Apr -> 1.May)
			return null;
		}
		if (oDateValue.week !== undefined  && (oDateValue.month === undefined || oDateValue.day === undefined)) {
			//check that the week is only set if the day/month has not been set, because day/month have higher precedence than week
			oDate.setUTCWeek({
				year: oDateValue.weekYear || oDateValue.year,
				week: oDateValue.week
			}, oLocale, getCalendarWeekParameter(oFormatOptions));

			// add the dayNumberOfWeek to the current day
			if (oDateValue.dayNumberOfWeek !== undefined) {
				oDate.setUTCDate(oDate.getUTCDate() + oDateValue.dayNumberOfWeek - 1);
			}
		}

		oDate = oDate.getJSDate();

		// Set the tzDiff based on the timezone difference
		if (!bUTC && (
			(oDateValue.lastTimezonePatternSymbol === "V" && oDateValue.timezone)
			|| oDateValue.tzDiff === undefined
		)) {
			// The last parsed timezone pattern will be considered. If this is the "V" pattern for the IANA timezone ID, it needs
			// to be calculated here. The tzDiff cannot be determined in the parse method because we need the parsed parts to calculate it.
			if (oDateValue.timezone) {
				sTimezone = oDateValue.timezone;
			}

			if (sTimezone) {
				oDateValue.tzDiff = TimezoneUtils.calculateOffset(oDate, sTimezone);
			}
		}
		if (oDateValue.tzDiff) {
			// tzDiff is in seconds for a higher precision (historical timezone might have differences in seconds)
			// e.g. UI5Date.getInstance("1730-01-01T00:00:00Z")
			// is in Berlin: Sun Jan 01 1730 00:53:28 GMT+0053 (Central European Standard Time)
			oDate.setUTCSeconds(oDate.getUTCSeconds() + oDateValue.tzDiff);
		}
		return oDate;
	};

	// Copy the properties of object2 into object1 without
	// overwriting the existing properties in object1
	function mergeWithoutOverwrite(object1, object2) {
		if (object1 === object2) {
			return object1;
		}

		var oMergedObject = {};

		// Clone object1
		Object.keys(object1).forEach(function(sKey) {
			oMergedObject[sKey] = object1[sKey];
		});

		// merge
		Object.keys(object2).forEach(function(sKey) {
			if (!oMergedObject.hasOwnProperty(sKey)) {
				oMergedObject[sKey] = object2[sKey];
			}
		});

		return oMergedObject;
	}

	// Checks if the given start date is before the end date.
	function isValidDateRange(oStartDate, oEndDate) {
		if (oStartDate.getTime() > oEndDate.getTime()) {
			return false;
		}

		return true;
	}

	// the expectation is that a valid Date has a getTime function which returns a valid number
	function isValidDateObject(oDate) {
		return oDate && typeof oDate.getTime === "function" && !isNaN(oDate.getTime());
	}

	/**
	 * Parse a string which is formatted according to the given format options.
	 *
	 * Uses the timezone from {@link module:sap/base/i18n/Localization.getTimezone Localization.getTimezone}, which
	 * falls back to the browser's local timezone to convert the given date.
	 *
	 * When using instances from getDateTimeWithTimezoneInstance, please see the corresponding documentation:
	 * {@link sap.ui.core.format.DateFormat.DateTimeWithTimezone#parse}.
	 *
	 * @example <caption>DateTime (assuming timezone "Europe/Berlin")</caption>
	 * var oDate = UI5Date.getInstance("2021-12-24T13:37:00Z");
	 * DateFormat.getDateTimeInstance().parse("Dec 24, 2021, 2:37:00 PM");
	 * // output: oDate
	 *
	 * @param {string} sValue the string containing a formatted date/time value
	 * @param {boolean} [bUTC] whether to use UTC
	 * @param {boolean} [bStrict] whether to use strict value check
	 * @return {Date|Date[]|module:sap/ui/core/date/UI5Date|module:sap/ui/core/date/UI5Date[]} the parsed value(s)
	 * @public
	 */
	DateFormat.prototype.parse = function(sValue, bUTC, bStrict) {
		// in order to convert a datetime to a timezone both the date and the time part are required.
		// If only one is present it cannot be guaranteed that the parsed result is correct, due to
		// daylight saving time which might shift hours and the timezone difference which might shift
		// days. For now only the date and time can be parsed using a timezone.
		var bShowDate = this.oFormatOptions.showDate === undefined || this.oFormatOptions.showDate;
		var bShowTime = this.oFormatOptions.showTime === undefined || this.oFormatOptions.showTime;
		if (this.type === mDateFormatTypes.DATETIME_WITH_TIMEZONE
			&& (bShowDate && !bShowTime || !bShowDate && bShowTime)) {
			throw new TypeError("The input can only be parsed back to date if both date and time are supplied.");
		}
		var sTimezone;
		if (bUTC === undefined && this.type !== mDateFormatTypes.DATETIME_WITH_TIMEZONE) {
			bUTC = this.oFormatOptions.UTC;
		}
		// preserve UTC parameter for fallback instances (must inherit format option UTC from parent)
		var bUTCInputParameter = bUTC;
		if (this.type === mDateFormatTypes.DATETIME_WITH_TIMEZONE) {

			// UTC and timezone are not supported at the same time, therefore set bUTC to false
			sTimezone = bUTC;
			bUTC = false;

			checkTimezoneParameterType(sTimezone);
			if (sTimezone && !TimezoneUtils.isValidTimezone(sTimezone)) {
				Log.error("The given timezone isn't valid.");
				return null;
			}
		}

		sValue = sValue == null ? "" : String(sValue).trim();
		// normalize input by removing all RTL special characters and replacing all special spaces
		// by a standard space (\u0020)
		sValue = FormatUtils.normalize(sValue);

		var oDateValue;
		var sCalendarType = this.oFormatOptions.calendarType;

		// default the timezone to the local timezone to always enforce the conversion
		sTimezone = sTimezone || Localization.getTimezone();

		if (bStrict === undefined) {
			bStrict = this.oFormatOptions.strictParsing;
		}

		// Support Japanese Gannen instead of Ichinen for first year of the era
		if (sCalendarType === CalendarType.Japanese && this.oLocale.getLanguage() === "ja") {
			sValue = sValue.replace(/元年/g, "1年");
		}

		if (!this.oFormatOptions.interval) {
			var oJSDate = this.parseRelative(sValue, bUTC);
			if (oJSDate) { //Stop when relative parsing possible, else go on with standard parsing
				return oJSDate;
			}

			oDateValue = this._parse(sValue, this.aFormatArray, bUTC, bStrict, sTimezone);

			// If input value has not been completely parsed, mark it as invalid
			if (oDateValue.index === 0 || oDateValue.index < sValue.length) {
				oDateValue.valid = false;
			}

			oJSDate = fnCreateDate(oDateValue, sCalendarType, bUTC, bStrict, sTimezone, this.oFormatOptions, this.oLocale);

			if (oJSDate) {
				if (this.type === mDateFormatTypes.DATETIME_WITH_TIMEZONE) {
					var bShowTimezone = this.oFormatOptions.showTimezone === undefined || this.oFormatOptions.showTimezone;
					// fill fields according to showDate, showTime and showTimezone options and parsed values
					if (!bShowTimezone && bShowDate && bShowTime) {
						return [oJSDate, undefined];
					} else if (bShowTimezone && !bShowDate && !bShowTime) {
						return [undefined, oDateValue.timezone];
					}
					return [oJSDate, oDateValue.timezone || undefined];
				}
				return oJSDate;
			}

		} else {
			var aDateValues = this._parseInterval(sValue, sCalendarType, bUTC, bStrict, sTimezone);
			var oJSDate1, oJSDate2;

			if (aDateValues && aDateValues.length === 2) {
				var oDateValue1 = mergeWithoutOverwrite(aDateValues[0], aDateValues[1]);
				var oDateValue2 = mergeWithoutOverwrite(aDateValues[1], aDateValues[0]);

				oJSDate1 = fnCreateDate(oDateValue1, sCalendarType, bUTC, bStrict, sTimezone, this.oFormatOptions, this.oLocale);
				oJSDate2 = fnCreateDate(oDateValue2, sCalendarType, bUTC, bStrict, sTimezone, this.oFormatOptions, this.oLocale);

				if (oJSDate1 && oJSDate2) {

					if (this.oFormatOptions.singleIntervalValue
						&& oJSDate1.getTime() === oJSDate2.getTime()) {

						return [oJSDate1, null];
					}

					var bValid = isValidDateRange(oJSDate1, oJSDate2);

					if (bStrict && !bValid) {
						Log.error("StrictParsing: Invalid date range. The given end date is before the start date.");
						return [null, null];
					}

					return [oJSDate1, oJSDate2];
				}
			}
		}

		if (this.aFallbackFormats) {
			var vDate;

			this.aFallbackFormats.every(function(oFallbackFormat) {
				vDate = oFallbackFormat.parse(sValue, bUTCInputParameter, bStrict);

				if (Array.isArray(vDate)) {
					if (oFallbackFormat.type === mDateFormatTypes.DATETIME_WITH_TIMEZONE) {
						return false;
					}
					return !(vDate[0] && vDate[1]);
				} else {
					return !vDate;
				}
			});

			return vDate;
		}

		if (!this.oFormatOptions.interval) {
			return null;
		} else {
			return [null, null];
		}
	};


	/**
	 * Parse the date pattern string and create a format array from it, which can be
	 * used for parsing and formatting the date
	 *
	 * @param {string} sPattern the CLDR date pattern string
	 * @returns {Array} format array
	 */
	DateFormat.prototype.parseCldrDatePattern = function(sPattern) {
		if (mCldrDatePattern[sPattern]) {
			return mCldrDatePattern[sPattern];
		}

		var aFormatArray = [],
			i,
			bQuoted = false,
			oCurrentObject = null,
			sState = "",
			sNewState = "",
			mAppeared = {},
			bIntervalStartFound = false;


		for (i = 0; i < sPattern.length; i++) {
			var sCurChar = sPattern.charAt(i), sNextChar, sPrevChar, sPrevPrevChar;
			if (bQuoted) {
				if (sCurChar === "'") {
					sPrevChar = sPattern.charAt(i - 1);
					sPrevPrevChar = sPattern.charAt(i - 2);
					sNextChar = sPattern.charAt(i + 1);
					// handle abc''def correctly
					if (sPrevChar === "'" && sPrevPrevChar !== "'") {
						bQuoted = false;
					} else if (sNextChar === "'") {
						// handle 'abc''def' correctly

						i += 1;
					} else {
						//  normal quote 'abcdef'
						bQuoted = false;
						continue;
					}
				}
				if (sState === "text") {
					oCurrentObject.value += sCurChar;
				} else {
					oCurrentObject = {
						type: "text",
						value: sCurChar
					};
					aFormatArray.push(oCurrentObject);
					sState = "text";
				}

			} else {
				if (sCurChar === "'") {
					bQuoted = true;
				} else if (this.oSymbols[sCurChar]) {
					sNewState = this.oSymbols[sCurChar].name;
					if (sState === sNewState) {
						oCurrentObject.digits++;
					} else {
						oCurrentObject = {
							type: sNewState,
							symbol: sCurChar,
							digits: 1
						};
						aFormatArray.push(oCurrentObject);
						sState = sNewState;

						if (!bIntervalStartFound) {
							if (mAppeared[sNewState]) {
								oCurrentObject.repeat = true;
								bIntervalStartFound = true;
							} else {
								mAppeared[sNewState] = true;
							}
						}

					}
				} else {
					if (sState === "text") {
						oCurrentObject.value += sCurChar;
					} else {
						oCurrentObject = {
							type: "text",
							value: sCurChar
						};
						aFormatArray.push(oCurrentObject);
						sState = "text";
					}
				}
			}

		}

		mCldrDatePattern[sPattern] = aFormatArray;

		return aFormatArray;
	};

	/**
	 * Parse a date string relative to the current date.
	 *
	 * @param {string} sValue the string containing a formatted date/time value
	 * @param {boolean} [bUTC] whether to use UTC, if no timezone is contained
	 * @returns {Date|null} the parsed value or <code>null</code> if relative parsing not possible
	 * @private
	 */
	DateFormat.prototype.parseRelative = function(sValue, bUTC) {
		var aPatterns, oEntry, rPattern, oResult, iValue;

		if (!sValue) {
			return null;
		}

		aPatterns = this.oLocaleData.getRelativePatterns(this.aRelativeParseScales, this.oFormatOptions.relativeStyle);
		for (var i = 0; i < aPatterns.length; i++) {
			oEntry = aPatterns[i];
			rPattern = new RegExp("^\\s*" + oEntry.pattern.replace(/\{0\}/, "(\\d+)") + "\\s*$", "i");
			oResult = rPattern.exec(sValue);
			if (oResult) {
				if (oEntry.value !== undefined) {
					return computeRelativeDate(oEntry.value, oEntry.scale);
				} else {
					iValue = parseInt(oResult[1]);
					return computeRelativeDate(iValue * oEntry.sign, oEntry.scale);
				}
			}
		}

		function computeRelativeDate(iDiff, sScale){
			var oResult = UI5Date.getInstance();

			if (bUTC) {
				// date part and time part have to be set individually
				oResult.setUTCFullYear(oResult.getFullYear(), oResult.getMonth(), oResult.getDate());
				oResult.setUTCHours(oResult.getHours(), oResult.getMinutes(), oResult.getSeconds(),
					oResult.getMilliseconds());
				// eslint-disable-next-line default-case
				switch (sScale) {
					case "second": oResult.setUTCSeconds(oResult.getUTCSeconds() + iDiff); break;
					case "minute": oResult.setUTCMinutes(oResult.getUTCMinutes() + iDiff); break;
					case "hour": oResult.setUTCHours(oResult.getUTCHours() + iDiff); break;
					case "day": oResult.setUTCDate(oResult.getUTCDate() + iDiff); break;
					case "week": oResult.setUTCDate(oResult.getUTCDate() + iDiff * 7); break;
					case "month": oResult.setUTCMonth(oResult.getUTCMonth() + iDiff); break;
					case "quarter": oResult.setUTCMonth(oResult.getUTCMonth() + iDiff * 3); break;
					case "year": oResult.setUTCFullYear(oResult.getUTCFullYear() + iDiff); break;
				}
			} else {
				// eslint-disable-next-line default-case
				switch (sScale) {
					case "second": oResult.setSeconds(oResult.getSeconds() + iDiff); break;
					case "minute": oResult.setMinutes(oResult.getMinutes() + iDiff); break;
					case "hour": oResult.setHours(oResult.getHours() + iDiff); break;
					case "day": oResult.setDate(oResult.getDate() + iDiff); break;
					case "week": oResult.setDate(oResult.getDate() + iDiff * 7); break;
					case "month": oResult.setMonth(oResult.getMonth() + iDiff); break;
					case "quarter": oResult.setMonth(oResult.getMonth() + iDiff * 3); break;
					case "year": oResult.setFullYear(oResult.getFullYear() + iDiff); break;
				}
			}

			return oResult;
		}
	};

	/**
	 * Format a date relative to the current date.
	 *
	 * @param {Date} oJSDate the value to format
	 * @param {boolean} bUTC whether to use UTC
	 * @param {number[]} aRange scale ranges
	 * @param {string} sTimezone the IANA timezone ID
	 * @returns {string|null} the formatted output value or <code>null</code> if relative formatting is not possible
	 * @private
	 */
	DateFormat.prototype.formatRelative = function(oJSDate, bUTC, aRange, sTimezone) {
		var oDateUTC, iDiff, iDiffSeconds, sPattern,
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			oToday = convertToTimezone(new Date(), sTimezone),
			sScale = this.oFormatOptions.relativeScale || "day";

		iDiffSeconds = (oJSDate.getTime() - oToday.getTime()) / 1000;
		if (this.oFormatOptions.relativeScale === "auto") {
			sScale = this._getScale(iDiffSeconds, this.aRelativeScales);
			sScale = fixScaleForMonths(oJSDate, oToday, sScale, iDiffSeconds);
		}

		if (!aRange) {
			aRange = this._mRanges[sScale];
		}

		// For dates normalize to UTC to avoid issues with summer-/wintertime
		if (sScale === "year" || sScale === "month" || sScale === "day") {
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			oToday = new Date(Date.UTC(oToday.getUTCFullYear(), oToday.getUTCMonth(), oToday.getUTCDate()));

			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			oDateUTC = new Date(0);

			// The Date.UTC function doesn't accept years before 1900 (converts years before 100 into 1900 + years).
			// Using setUTCFullYear to workaround this issue.
			oDateUTC.setUTCFullYear(oJSDate.getUTCFullYear(), oJSDate.getUTCMonth(), oJSDate.getUTCDate());

			oJSDate = oDateUTC;
		}

		iDiff = this._getDifference(sScale, [oToday, oJSDate]);

		if (this.oFormatOptions.relativeScale !== "auto" && (iDiff < aRange[0] || iDiff > aRange[1])) {
			//Relative parsing only in range +/- x days
			return null;
		}

		sPattern = this.oLocaleData.getRelativePattern(sScale, iDiff, iDiffSeconds > 0, this.oFormatOptions.relativeStyle);
		return formatMessage(sPattern, [Math.abs(iDiff)]);

	};

	DateFormat.prototype._mRanges = {
		second: [-60, 60],
		minute: [-60, 60],
		hour: [-24, 24],
		day: [-6, 6],
		week: [-4, 4],
		month: [-12, 12],
		year: [-10, 10]
	};

	DateFormat.prototype._mScales = {
		second: 1,          // 1
		minute: 60,         // 60
		hour: 3600,         // 60*60
		day: 86400,         // 60*60*24         1 day
		week: 604800,       // 60*60*24*7       7 days
		month: 2592000,     // 60*60*24*30      30 days
		quarter: 7776000,   // 60*60*24*30*3    90 days
		year: 31536000      // 60*60*24*365     365 days
	};

	DateFormat.prototype._getScale = function(iDiffSeconds, aScales) {
		// Determines the correct time scale
		var	sScale, sTestScale;

		iDiffSeconds = Math.abs(iDiffSeconds);

		for (var i = 0; i < aScales.length; i++) {
			sTestScale = aScales[i];
			if (iDiffSeconds >= this._mScales[sTestScale]) {
				sScale = sTestScale;
				break;
			}
		}
		if (!sScale) {
			sScale = aScales[aScales.length - 1];
		}

		return sScale;
	};

	// Fixes the scale for months/weeks
	// when involved months do not have 30 days
	function fixScaleForMonths(oJSDate, oToday, sScale, iDiffSeconds) {
		var iMonthDiff = Math.abs(oJSDate.getUTCMonth() - oToday.getUTCMonth());
		if (sScale === "week" && iMonthDiff === 2) {
			// 2 months diff
			// e.g. March 1st - Jan 31st
			return "month";
		} else if (sScale === "week" && iMonthDiff === 1) {
			// same day but different month
			// e.g. March 1st - Feb 1st
			if (oJSDate.getUTCDate() === oToday.getUTCDate()
				// future date
				// e.g. Feb 14th - 15. Mar 15th (29/30 days diff) => 1 month
				|| (iDiffSeconds < 0 && oJSDate.getUTCDate() < oToday.getUTCDate())
				// past date
				// e.g. Mar 15th - Feb 14th (29/30 days diff) => 1 month
				|| (iDiffSeconds > 0 && oJSDate.getUTCDate() > oToday.getUTCDate())
			) {
				return "month";
			}
		} else if (sScale === "month" && iMonthDiff === 1) {
			// future date
			// e.g. Mar 14th - Apr 13th (30 days diff)
			if ((iDiffSeconds > 0 && oJSDate.getUTCDate() < oToday.getUTCDate())
				// past date
				// Feb 14th - Jan 15th (30 days diff)
				|| (iDiffSeconds < 0 && oJSDate.getUTCDate() > oToday.getUTCDate())
			) {
				return "week";
			}
		}
		return sScale;
	}

	/**
	 * Modifies the Date and sets the values with a higher index to <code>0</code>
	 *
	 * @param {Date} oDate input date
	 * @param {number} iStartIndex index of the value to set to <code>0</code>. Higher indices will also be set to <code>0</code>.
	 * 0: FullYear
	 * 1: Month
	 * 2: Date
	 * 3: Hours
	 * 4: Minutes
	 * 5: Seconds
	 * 6: Milliseconds
	 * e.g. iStartIndex <code>4</code> will set Minutes, Seconds and Milliseconds to <code>0</code>
	 * @returns {Date} copy of the date with the modified values
	 */
	function cutDateFields(oDate, iStartIndex) {
		var sMethodName,
			aFields = ["FullYear", "Month", "Date", "Hours", "Minutes", "Seconds", "Milliseconds"],
			// no need to use UI5Date.getInstance as only the UTC timestamp is used
			oDateCopy = new Date(oDate.getTime());

		for (var i = iStartIndex; i < aFields.length; i++) {
			sMethodName = "setUTC" + aFields[iStartIndex];
			oDateCopy[sMethodName].apply(oDateCopy, [0]);
		}
		return oDateCopy;
	}

	var mRelativeDiffs = {
		year: function(oFromDate, oToDate) {
			return oToDate.getUTCFullYear() - oFromDate.getUTCFullYear();
		},
		month: function(oFromDate, oToDate) {
			return oToDate.getUTCMonth() - oFromDate.getUTCMonth() + (this.year(oFromDate, oToDate) * 12);
		},
		week: function(oFromDate, oToDate, oFormat) {
			var iFromDay = oFormat._adaptDayOfWeek(oFromDate.getUTCDay());
			var iToDay = oFormat._adaptDayOfWeek(oToDate.getUTCDay());

			oFromDate = cutDateFields(oFromDate, 3);
			oToDate = cutDateFields(oToDate, 3);

			return (oToDate.getTime() - oFromDate.getTime() - (iToDay - iFromDay) * oFormat._mScales.day * 1000) / (oFormat._mScales.week * 1000);
		},
		day: function(oFromDate, oToDate, oFormat) {
			oFromDate = cutDateFields(oFromDate, 3);
			oToDate = cutDateFields(oToDate, 3);

			return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.day * 1000);
		},
		hour: function(oFromDate, oToDate, oFormat) {
			oFromDate = cutDateFields(oFromDate, 4);
			oToDate = cutDateFields(oToDate, 4);

			return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.hour * 1000);
		},
		minute: function(oFromDate, oToDate, oFormat) {
			oFromDate = cutDateFields(oFromDate, 5);
			oToDate = cutDateFields(oToDate, 5);

			return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.minute * 1000);
		},
		second: function(oFromDate, oToDate, oFormat) {
			oFromDate = cutDateFields(oFromDate, 6);
			oToDate = cutDateFields(oToDate, 6);

			return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.second * 1000);
		}
	};

	DateFormat.prototype._adaptDayOfWeek = function(iDayOfWeek) {
		// day of week depends on the format locale
		// the DateFormat's locale is independent
		var vCalendarWeekParameter = getCalendarWeekParameter(this.oFormatOptions),
			iFirstDayOfWeek;
		if (typeof vCalendarWeekParameter === "object") {
			iFirstDayOfWeek = vCalendarWeekParameter.firstDayOfWeek;
		} else {
			iFirstDayOfWeek = CalendarUtils.getWeekConfigurationValues(vCalendarWeekParameter, this.oLocale).firstDayOfWeek;
		}

		var iDayNumberOfWeek = iDayOfWeek - (iFirstDayOfWeek - 1);

		if (iDayNumberOfWeek <= 0) {
			iDayNumberOfWeek += 7;
		}
		return iDayNumberOfWeek;
	};

	DateFormat.prototype._getDifference = function(sScale, aDates) {
		var oFromDate = aDates[0];
		var oToDate = aDates[1];

		return Math.round(mRelativeDiffs[sScale](oFromDate, oToDate, this));
	};


	DateFormat.prototype.getAllowedCharacters = function(aFormatArray) {

		if (this.oFormatOptions.relative) {
			return ""; //Allow all
		}

		var sAllowedCharacters = "";
		var bNumbers = false;
		var bAll = false;
		var oPart;

		for (var i = 0; i < aFormatArray.length; i++) {
			oPart = aFormatArray[i];
			switch (oPart.type) {
			case "text":
				if (sAllowedCharacters.indexOf(oPart.value) < 0) {
					sAllowedCharacters += oPart.value;
				}
				break;
			case "day":
			case "year":
			case "weekYear":
			case "dayNumberOfWeek":
			case "weekInYear":
			case "hour0_23":
			case "hour1_24":
			case "hour0_11":
			case "hour1_12":
			case "minute":
			case "second":
			case "fractionalsecond":
				if (!bNumbers) {
					sAllowedCharacters += "0123456789";
					bNumbers = true;
				}
				break;
			case "month":
			case "monthStandalone":
				if (oPart.digits < 3) {
					if (!bNumbers) {
						sAllowedCharacters += "0123456789";
						bNumbers = true;
					}
				} else {
					bAll = true;
				}
				break;

			default:
				bAll = true;
				break;
			}
		}

		if (bAll) {
			sAllowedCharacters = "";
		}

		return sAllowedCharacters;

	};

	/**
	 * Returns a language-dependent placeholder text according to this instance's format options, for example
	 * "e.g. 12/31/2023".
	 *
	 * @returns {string} The language-dependent placeholder text
	 *
	 * @private
	 * @ui5-restricted sap.m
	 */
	DateFormat.prototype.getPlaceholderText = function() {
		var oResourceBundle = Library.getResourceBundleFor("sap.ui.core");

		return oResourceBundle.getText("date.placeholder", [this.format.apply(this, this.getSampleValue())]);
	};

	/**
	 * Returns a sample date value.
	 *
	 * @returns {array}
	 *   A sample date value as an array of parameter values as expected by {@link #format}
	 *
	 * @private
	 */
	DateFormat.prototype.getSampleValue = function() {
		var oDate,
			iFullYear = UI5Date.getInstance().getFullYear(),
			bUTC = this.oFormatOptions.UTC;

		function getDate(iYear, iMonth, iDay, iHours, iMinutes, iSeconds, iMilliseconds) {
			return bUTC
				? UI5Date.getInstance(Date.UTC(iYear, iMonth, iDay, iHours, iMinutes, iSeconds, iMilliseconds))
				: UI5Date.getInstance(iYear, iMonth, iDay, iHours, iMinutes, iSeconds, iMilliseconds);
		}

		oDate = getDate(iFullYear, 11, 31, 23, 59, 58, 123);

		if (this.type === mDateFormatTypes.DATETIME_WITH_TIMEZONE) {
			return [oDate, Localization.getTimezone()];
		}

		if (this.oFormatOptions.interval) {
			return [[getDate(iFullYear, 11, 22, 9, 12, 34, 567), oDate]];
		}

		return [oDate];
	};

	return DateFormat;

});
