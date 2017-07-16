/*!
 * ${copyright}
 */

// Provides class sap.ui.core.format.DateFormat
sap.ui.define(['jquery.sap.global', 'sap/ui/core/library', 'sap/ui/core/Locale', 'sap/ui/core/LocaleData', 'sap/ui/core/date/UniversalDate', 'jquery.sap.strings'],
	function(jQuery, library, Locale, LocaleData, UniversalDate/* , jQuerySapStrings*/) {
	"use strict";

	// shortcut
	var CalendarType = library.CalendarType;

	/**
	 * Constructor for DateFormat - must not be used: To get a DateFormat instance, please use getDateInstance, getDateTimeInstance or getTimeInstance.
	 *
	 * @class
	 * The DateFormat is a static class for formatting and parsing single date and time values or date and time intervals according
	 * to a set of format options.
	 *
	 * Supported format options are pattern based on Unicode LDML Date Format notation.
	 * If no pattern is specified a default pattern according to the locale settings is used.
	 *
	 * @public
	 * @see http://unicode.org/reports/tr35/#Date_Field_Symbol_Table
	 * @alias sap.ui.core.format.DateFormat
	 */
	var DateFormat = function() {
		// Do not use the constructor
		throw new Error();
	};

	// Cache for parsed CLDR DatePattern
	var mCldrDatePattern = {};

	DateFormat.oDateInfo = {
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
		aIntervalCompareFields: ["FullYear", "Month", "Date"]
	};

	DateFormat.oDateTimeInfo = {
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
		aIntervalCompareFields: ["FullYear", "Month", "Date", "Hours", "Minutes", "Seconds"]
	};

	DateFormat.oTimeInfo = {
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
		aIntervalCompareFields: ["Hours", "Minutes", "Seconds"]
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
	 * @param {string} [oFormatOptions.format] @since 1.34.0 contains pattern symbols (e.g. "yMMMd" or "Hms") which will be converted into the pattern in the used locale, which matches the wanted symbols best.
	 *  The symbols must be in canonical order, that is: Era (G), Year (y/Y), Quarter (q/Q), Month (M/L), Week (w/W), Day-Of-Week (E/e/c), Day (d/D), Hour (h/H/k/K/j/J), Minute (m), Second (s), Timezone (z/Z/v/V/O/X/x)
	 *  See http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems
	 * @param {string} [oFormatOptions.pattern] a data pattern in LDML format. It is not verified whether the pattern represents only a date.
	 * @param {string} [oFormatOptions.style] can be either 'short, 'medium', 'long' or 'full'. If no pattern is given, a locale dependent default date pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] if true, by parsing it is checked if the value is a valid date
	 * @param {boolean} [oFormatOptions.relative] if true, the date is formatted relatively to todays date if it is within the given day range, e.g. "today", "yesterday", "in 5 days"
	 * @param {int[]} [oFormatOptions.relativeRange] the day range used for relative formatting. If oFormatOptions.relatvieScale is set to default value 'day', the relativeRange is by default [-6, 6], which means only the last 6 days, today and the next 6 days are formatted relatively. Otherwise when oFormatOptions.relativeScale is set to 'auto', all dates are formatted relatively.
	 * @param {string} [oFormatOptions.relativeScale="day"] if 'auto' is set, new relative time format is switched on for all Date/Time Instances. The relative scale is chosen depending on the difference between the given date and now.
	 * @param {string} [oFormatOptions.relativeStyle="wide"] @since 1.32.10, 1.34.4 the style of the relative format. The valid values are "wide", "short", "narrow"
	 * @param {boolean} [oFormatOptions.interval=false] @since 1.48.0 if true, the [format]{@link sap.ui.core.format.DateFormat#format} method expects an array with two dates as the first argument and formats them as interval. Further interval "Jan 10, 2008 - Jan 12, 2008" will be formatted as "Jan 10-12, 2008" if the 'format' option is set with necessary symbols.
	 *   Otherwise the two given dates are formatted separately and concatenated with local dependent pattern.
	 * @param {boolean} [oFormatOptions.UTC] if true, the date is formatted and parsed as UTC instead of the local timezone
	 * @param {sap.ui.core.CalendarType} [oFormatOptions.calendarType] The calender type which is used to format and parse the date. This value is by default either set in configuration or calculated based on current locale.
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @return {sap.ui.core.format.DateFormat} date instance of the DateFormat
	 * @static
	 * @public
	 */
	DateFormat.getDateInstance = function(oFormatOptions, oLocale) {
		return this.createInstance(oFormatOptions, oLocale, this.oDateInfo);
	};

	/**
	 * Get a datetime instance of the DateFormat, which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {string} [oFormatOptions.format] @since 1.34.0 contains pattern symbols (e.g. "yMMMd" or "Hms") which will be converted into the pattern in the used locale, which matches the wanted symbols best.
	 *  The symbols must be in canonical order, that is: Era (G), Year (y/Y), Quarter (q/Q), Month (M/L), Week (w/W), Day-Of-Week (E/e/c), Day (d/D), Hour (h/H/k/K/j/J), Minute (m), Second (s), Timezone (z/Z/v/V/O/X/x)
	 *  See http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems
	 * @param {string} [oFormatOptions.pattern] a datetime pattern in LDML format. It is not verified whether the pattern represents a full datetime.
	 * @param {string} [oFormatOptions.style] can be either 'short, 'medium', 'long' or 'full'. For datetime you can also define mixed styles, separated with a slash, where the first part is the date style and the second part is the time style (e.g. "medium/short"). If no pattern is given, a locale dependent default datetime pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] if true, by parsing it is checked if the value is a valid datetime
	 * @param {boolean} [oFormatOptions.relative] if true, the date is formatted relatively to todays date if it is within the given day range, e.g. "today", "yesterday", "in 5 days"@param {boolean} [oFormatOptions.UTC] if true, the date is formatted and parsed as UTC instead of the local timezone
	 * @param {int[]} [oFormatOptions.relativeRange] the day range used for relative formatting. If oFormatOptions.relatvieScale is set to default value 'day', the relativeRange is by default [-6, 6], which means only the last 6 days, today and the next 6 days are formatted relatively. Otherwise when oFormatOptions.relativeScale is set to 'auto', all dates are formatted relatively.
	 * @param {string} [oFormatOptions.relativeScale="day"] if 'auto' is set, new relative time format is switched on for all Date/Time Instances. The relative scale is chosen depending on the difference between the given date and now.
	 * @param {string} [oFormatOptions.relativeStyle="wide"] @since 1.32.10, 1.34.4 the style of the relative format. The valid values are "wide", "short", "narrow"
	 * @param {boolean} [oFormatOptions.interval=false] @since 1.48.0 if true, the [format]{@link sap.ui.core.format.DateFormat#format} method expects an array with two dates as the first argument and formats them as interval. Further interval "Jan 10, 2008 - Jan 12, 2008" will be formatted as "Jan 10-12, 2008" if the 'format' option is set with necessary symbols.
	 *   Otherwise the two given dates are formatted separately and concatenated with local dependent pattern.
	 * @param {boolean} [oFormatOptions.UTC] if true, the date is formatted and parsed as UTC instead of the local timezone
	 * @param {sap.ui.core.CalendarType} [oFormatOptions.calendarType] The calender type which is used to format and parse the date. This value is by default either set in configuration or calculated based on current locale.
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @return {sap.ui.core.format.DateFormat} datetime instance of the DateFormat
	 * @static
	 * @public
	 */
	DateFormat.getDateTimeInstance = function(oFormatOptions, oLocale) {
		return this.createInstance(oFormatOptions, oLocale, this.oDateTimeInfo);
	};

	/**
	 * Get a time instance of the DateFormat, which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {string} [oFormatOptions.format] @since 1.34.0 contains pattern symbols (e.g. "yMMMd" or "Hms") which will be converted into the pattern in the used locale, which matches the wanted symbols best.
	 *  The symbols must be in canonical order, that is: Era (G), Year (y/Y), Quarter (q/Q), Month (M/L), Week (w/W), Day-Of-Week (E/e/c), Day (d/D), Hour (h/H/k/K/j/J), Minute (m), Second (s), Timezone (z/Z/v/V/O/X/x)
	 *  See http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems
	 * @param {string} [oFormatOptions.pattern] a time pattern in LDML format. It is not verified whether the pattern only represents a time.
	 * @param {string} [oFormatOptions.style] can be either 'short, 'medium', 'long' or 'full'. If no pattern is given, a locale dependent default time pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] if true, by parsing it is checked if the value is a valid time
	 * @param {boolean} [oFormatOptions.relative] if true, the date is formatted relatively to todays date if it is within the given day range, e.g. "today", "yesterday", "in 5 days"
	 * @param {int[]} [oFormatOptions.relativeRange] the day range used for relative formatting. If oFormatOptions.relatvieScale is set to default value 'day', the relativeRange is by default [-6, 6], which means only the last 6 days, today and the next 6 days are formatted relatively. Otherwise when oFormatOptions.relativeScale is set to 'auto', all dates are formatted relatively.
	 * @param {string} [oFormatOptions.relativeScale="day"] if 'auto' is set, new relative time format is switched on for all Date/Time Instances. The relative scale is chosen depending on the difference between the given date and now.
	 * @param {string} [oFormatOptions.relativeStyle="wide"] @since 1.32.10, 1.34.4 the style of the relative format. The valid values are "wide", "short", "narrow"
	 * @param {boolean} [oFormatOptions.interval=false] @since 1.48.0 if true, the [format]{@link sap.ui.core.format.DateFormat#format} method expects an array with two dates as the first argument and formats them as interval. Further interval "Jan 10, 2008 - Jan 12, 2008" will be formatted as "Jan 10-12, 2008" if the 'format' option is set with necessary symbols.
	 *   Otherwise the two given dates are formatted separately and concatenated with local dependent pattern.
	 * @param {boolean} [oFormatOptions.UTC] if true, the time is formatted and parsed as UTC instead of the local timezone
	 * @param {sap.ui.core.CalendarType} [oFormatOptions.calendarType] The calender type which is used to format and parse the date. This value is by default either set in configuration or calculated based on current locale.
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @return {sap.ui.core.format.DateFormat} time instance of the DateFormat
	 * @static
	 * @public
	 */
	DateFormat.getTimeInstance = function(oFormatOptions, oLocale) {
		return this.createInstance(oFormatOptions, oLocale, this.oTimeInfo);
	};

	/**
	 * Create instance of the DateFormat.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @return {sap.ui.core.format.DateFormat} time instance of the DateFormat
	 * @static
	 * @private
	 */
	DateFormat.createInstance = function(oFormatOptions, oLocale, oInfo) {
		// Create an instance of the DateFormat
		var oFormat = Object.create(this.prototype);

		// Handle optional parameters
		if ( oFormatOptions instanceof Locale ) {
			oLocale = oFormatOptions;
			oFormatOptions = undefined;
		}

		// Get Locale and LocaleData to use
		if (!oLocale) {
			oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
		}
		oFormat.oLocale = oLocale;
		oFormat.oLocaleData = LocaleData.getInstance(oLocale);

		// Extend the default format options with custom format options and retrieve the pattern
		// from the LocaleData, in case it is not defined yet
		oFormat.oFormatOptions = jQuery.extend(false, {}, oInfo.oDefaultFormatOptions, oFormatOptions);

		if (!oFormat.oFormatOptions.calendarType) {
			oFormat.oFormatOptions.calendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		}

		if (!oFormat.oFormatOptions.pattern) {
			if (oFormat.oFormatOptions.format) {
				oFormat.oFormatOptions.pattern = oFormat.oLocaleData.getCustomDateTimePattern(oFormat.oFormatOptions.format, oFormat.oFormatOptions.calendarType);
			} else {
				oFormat.oFormatOptions.pattern = oInfo.getPattern(oFormat.oLocaleData, oFormat.oFormatOptions.style, oFormat.oFormatOptions.calendarType);
			}
		}

		// if the current format isn't a fallback format, create its fallback formats
		if (!oFormat.oFormatOptions.fallback) {
			// If fallback DateFormats have not been created yet, do it now
			if (!oInfo.oFallbackFormats) {
				oInfo.oFallbackFormats = {};
			}
			// Store fallback formats per locale and calendar type
			var sLocale = oLocale.toString(),
				sCalendarType = oFormat.oFormatOptions.calendarType,
				sKey = sLocale + "-" + sCalendarType,
				sPattern,
				aFallbackFormatOptions;

			if (oFormat.oFormatOptions.pattern && oInfo.bPatternFallbackWithoutDelimiter) {
				sKey = sKey + "-" + oFormat.oFormatOptions.pattern;
			}

			if (!oInfo.oFallbackFormats[sKey]) {
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

				oInfo.oFallbackFormats[sKey] = DateFormat._createFallbackFormat(aFallbackFormatOptions, sCalendarType, oLocale, oInfo);
			}

			oFormat.aFallbackFormats = oInfo.oFallbackFormats[sKey];
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

		this.aMonthsAbbrev = this.oLocaleData.getMonths("abbreviated", sCalendarType);
		this.aMonthsWide = this.oLocaleData.getMonths("wide", sCalendarType);
		this.aMonthsNarrow = this.oLocaleData.getMonths("narrow", sCalendarType);
		this.aMonthsAbbrevSt = this.oLocaleData.getMonthsStandAlone("abbreviated", sCalendarType);
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
		this.aDayPeriods = this.oLocaleData.getDayPeriods("abbreviated", sCalendarType);
		this.aFormatArray = this.parseCldrDatePattern(this.oFormatOptions.pattern);
		this.sAllowedCharacters = this.getAllowedCharacters(this.aFormatArray);
	};

	/**
	 * Creates DateFormat instances based on the given format options. The created
	 * instances are used as fallback formats of another DateFormat instances.
	 *
	 * All fallback formats are marked with 'bIsFallback' to make it distinguishable
	 * from the normal DateFormat instances.
	 *
	 * @param {Object[]} aFallbackFormatOptions the options for creating the fallback DateFormat
	 * @param {sap.ui.core.CalendarType} sCalendarType the type of the current calendarType
	 * @param {sap.ui.core.LocalData} oLocale Locale to ask for locale specific texts/settings
	 * @param {Object} oInfo The default info object of the current date type
	 * @return {sap.ui.core.DateFormat[]} an array of fallback DateFormat instances
	 */
	DateFormat._createFallbackFormat = function(aFallbackFormatOptions, sCalendarType, oLocale, oInfo) {
		return aFallbackFormatOptions.map(function(oFormatOptions) {
			oFormatOptions.calendarType = sCalendarType;
			// mark the current format as a fallback in order to avoid endless recursive call of function 'createInstance'
			oFormatOptions.fallback = true;
			var oFallbackFormat = DateFormat.createInstance(oFormatOptions, oLocale, oInfo);
			oFallbackFormat.bIsFallback = true;
			return oFallbackFormat;
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

	/**
	 * Pattern elements
	 */
	DateFormat.prototype.oSymbols = {
		"": {
			name: "text",
			format: function(oField, oDate, bUTC, oFormat) {
				return oField.value;
			}
		},
		"G": {
			name: "era",
			format: function(oField, oDate, bUTC, oFormat) {
				var iEra = bUTC ? oDate.getUTCEra() : oDate.getEra();
				if (oField.digits <= 3) {
					return oFormat.aErasAbbrev[iEra];
				} else if (oField.digits === 4) {
					return oFormat.aErasWide[iEra];
				} else {
					return oFormat.aErasNarrow[iEra];
				}
			}
		},
		"y": {
			name: "year",
			format: function(oField, oDate, bUTC, oFormat) {
				var iYear = bUTC ? oDate.getUTCFullYear() : oDate.getFullYear();
				var sYear = String(iYear);
				var sCalendarType = oFormat.oFormatOptions.calendarType;

				if (oField.digits == 2 && sYear.length > 2) {
					sYear = sYear.substr(sYear.length - 2);
				}
				// When parsing we assume dates less than 100 to be in the current/last century,
				// so when formatting we have to make sure they are differentiable by prefixing with zeros
				if (sCalendarType != CalendarType.Japanese && oField.digits == 1 && iYear < 100) {
					sYear = jQuery.sap.padLeft(sYear, "0", 4);
				}
				return jQuery.sap.padLeft(sYear, "0", oField.digits);
			}
		},
		"Y": {
			name: "weekYear",
			format: function(oField, oDate, bUTC, oFormat) {
				var oWeek = bUTC ? oDate.getUTCWeek() : oDate.getWeek();
				var iWeekYear = oWeek.year;
				var sWeekYear = String(iWeekYear);
				var sCalendarType = oFormat.oFormatOptions.calendarType;

				if (oField.digits == 2 && sWeekYear.length > 2) {
					sWeekYear = sWeekYear.substr(sWeekYear.length - 2);
				}
				// When parsing we assume dates less than 100 to be in the current/last century,
				// so when formatting we have to make sure they are differentiable by prefixing with zeros
				if (sCalendarType != CalendarType.Japanese && oField.digits == 1 && iWeekYear < 100) {
					sWeekYear = jQuery.sap.padLeft(sWeekYear, "0", 4);
				}
				return jQuery.sap.padLeft(sWeekYear, "0", oField.digits);
			}
		},
		"M": {
			name: "month",
			format: function(oField, oDate, bUTC, oFormat) {
				var iMonth = bUTC ? oDate.getUTCMonth() : oDate.getMonth();
				if (oField.digits == 3) {
					return oFormat.aMonthsAbbrev[iMonth];
				} else if (oField.digits == 4) {
					return oFormat.aMonthsWide[iMonth];
				} else if (oField.digits > 4) {
					return oFormat.aMonthsNarrow[iMonth];
				} else {
					return jQuery.sap.padLeft(String(iMonth + 1), "0", oField.digits);
				}
			}
		},
		"L": {
			name: "monthStandalone",
			format: function(oField, oDate, bUTC, oFormat) {
				var iMonth = bUTC ? oDate.getUTCMonth() : oDate.getMonth();
				if (oField.digits == 3) {
					return oFormat.aMonthsAbbrevSt[iMonth];
				} else if (oField.digits == 4) {
					return oFormat.aMonthsWideSt[iMonth];
				} else if (oField.digits > 4) {
					return oFormat.aMonthsNarrowSt[iMonth];
				} else {
					return jQuery.sap.padLeft(String(iMonth + 1), "0", oField.digits);
				}
			}
		},
		"w": {
			name: "weekInYear",
			format: function(oField, oDate, bUTC, oFormat) {
				var oWeek = bUTC ? oDate.getUTCWeek() : oDate.getWeek();
				var iWeek = oWeek.week;
				var sWeek = String(iWeek + 1);
				if (oField.digits < 3) {
					sWeek = jQuery.sap.padLeft(sWeek, "0", oField.digits);
				} else {
					sWeek = oFormat.oLocaleData.getCalendarWeek(oField.digits === 3 ? "narrow" : "wide", jQuery.sap.padLeft(sWeek, "0", 2));
				}
				return sWeek;
			}
		},
		"W": {
			name: "weekInMonth",
			format: function(oField, oDate, bUTC, oFormat) {
				// not supported
				return "";
			}
		},
		"D": {
			name: "dayInYear",
			format: function(oField, oDate, bUTC, oFormat) {

			}
		},
		"d": {
			name: "day",
			format: function(oField, oDate, bUTC, oFormat) {
				var iDate = bUTC ? oDate.getUTCDate() : oDate.getDate();
				return jQuery.sap.padLeft(String(iDate), "0", oField.digits);
			}
		},
		"Q": {
			name: "quarter",
			format: function(oField, oDate, bUTC, oFormat) {
				var iMonth = bUTC ? oDate.getUTCMonth() : oDate.getMonth();
				var iQuarter = Math.floor(iMonth / 3);
				if (oField.digits == 3) {
					return oFormat.aQuartersAbbrev[iQuarter];
				} else if (oField.digits == 4) {
					return oFormat.aQuartersWide[iQuarter];
				} else if (oField.digits > 4) {
					return oFormat.aQuartersNarrow[iQuarter];
				} else {
					return jQuery.sap.padLeft(String(iQuarter + 1), "0", oField.digits);
				}
			}
		},
		"q": {
			name: "quarterStandalone",
			format: function(oField, oDate, bUTC, oFormat) {
				var iMonth = bUTC ? oDate.getUTCMonth() : oDate.getMonth();
				var iQuarter = Math.floor(iMonth / 3);
				if (oField.digits == 3) {
					return oFormat.aQuartersAbbrevSt[iQuarter];
				} else if (oField.digits == 4) {
					return oFormat.aQuartersWideSt[iQuarter];
				} else if (oField.digits > 4) {
					return oFormat.aQuartersNarrowSt[iQuarter];
				} else {
					return jQuery.sap.padLeft(String(iQuarter + 1), "0", oField.digits);
				}
			}
		},
		"F": {
			name: "dayOfWeekInMonth",
			format: function(oField, oDate, bUTC, oFormat) {
				// not supported
				return "";
			}
		},
		"E": {
			name: "dayNameInWeek",
			format: function(oField, oDate, bUTC, oFormat) {
				var iDay = bUTC ? oDate.getUTCDay() : oDate.getDay();
				if (oField.digits < 4) {
					return oFormat.aDaysAbbrev[iDay];
				} else if (oField.digits == 4) {
					return oFormat.aDaysWide[iDay];
				} else if (oField.digits == 5) {
					return oFormat.aDaysNarrow[iDay];
				} else {
					return oFormat.aDaysShort[iDay];
				}
			}
		},
		"c": {
			name: "dayNameInWeekStandalone",
			format: function(oField, oDate, bUTC, oFormat) {
				var iDay = bUTC ? oDate.getUTCDay() : oDate.getDay();
				if (oField.digits < 4) {
					return oFormat.aDaysAbbrevSt[iDay];
				} else if (oField.digits == 4) {
					return oFormat.aDaysWideSt[iDay];
				} else if (oField.digits == 5) {
					return oFormat.aDaysNarrowSt[iDay];
				} else {
					return oFormat.aDaysShortSt[iDay];
				}
			}
		},
		"u": {
			name: "dayNumberOfWeek",
			format: function(oField, oDate, bUTC, oFormat) {
				var iDay = bUTC ? oDate.getUTCDay() : oDate.getDay();
				var iFirstDayOfWeek = oFormat.oLocaleData.getFirstDayOfWeek();
				var iDayNumberOfWeek = iDay - (iFirstDayOfWeek - 1);

				if (iDayNumberOfWeek <= 0) {
					iDayNumberOfWeek += 7;
				}
				return iDayNumberOfWeek;
			}
		},
		"a": {
			name: "amPmMarker",
			format: function(oField, oDate, bUTC, oFormat) {
				var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
				var iDayPeriod = iHours < 12 ? 0 : 1;

				return oFormat.aDayPeriods[iDayPeriod];
			}
		},
		"H": {
			name: "hour0_23",
			format: function(oField, oDate, bUTC, oFormat) {
				var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
				return jQuery.sap.padLeft(String(iHours), "0", oField.digits);
			}
		},
		"k": {
			name: "hour1_24",
			format: function(oField, oDate, bUTC, oFormat) {
				var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
				var sHours = (iHours === 0 ? "24" : String(iHours));

				return jQuery.sap.padLeft(sHours, "0", oField.digits);
			}
		},
		"K": {
			name: "hour0_11",
			format: function(oField, oDate, bUTC, oFormat) {
				var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
				var sHours = String(iHours > 11 ? iHours - 12 : iHours);

				return jQuery.sap.padLeft(sHours, "0", oField.digits);
			}
		},
		"h": {
			name: "hour1_12",
			format: function(oField, oDate, bUTC, oFormat) {
				var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
				var sHours;

				if (iHours > 12) {
					sHours = String(iHours - 12);
				} else if (iHours == 0) {
					sHours = "12";
				} else {
					sHours = String(iHours);
				}
				return jQuery.sap.padLeft(sHours, "0", oField.digits);
			}
		},
		"m": {
			name: "minute",
			format: function(oField, oDate, bUTC, oFormat) {
				var iMinutes = bUTC ? oDate.getUTCMinutes() : oDate.getMinutes();
				return jQuery.sap.padLeft(String(iMinutes), "0", oField.digits);
			}
		},
		"s": {
			name: "second",
			format: function(oField, oDate, bUTC, oFormat) {
				var iSeconds = bUTC ? oDate.getUTCSeconds() : oDate.getSeconds();
				return jQuery.sap.padLeft(String(iSeconds), "0", oField.digits);
			}
		},
		"S": {
			name: "fractionalsecond",
			format: function(oField, oDate, bUTC, oFormat) {
				var iMilliseconds = bUTC ? oDate.getUTCMilliseconds() : oDate.getMilliseconds();
				var sMilliseconds = String(iMilliseconds);
				var sFractionalseconds = jQuery.sap.padLeft(sMilliseconds, "0", 3);
				sFractionalseconds = sFractionalseconds.substr(0, oField.digits);
				sFractionalseconds = jQuery.sap.padRight(sFractionalseconds, "0", oField.digits);
				return sFractionalseconds;
			}
		},
		"z": {
			name: "timezoneGeneral",
			format: function(oField, oDate, bUTC, oFormat) {
				//TODO getTimezoneLong and getTimezoneShort does not exist on Date object
				//-> this is a preparation for a future full timezone support (only used by unit test so far)
				if (oField.digits > 3 && oDate.getTimezoneLong()) {
					return oDate.getTimezoneLong();
				} else if (oDate.getTimezoneShort()) {
					return oDate.getTimezoneShort();
				}

				var sTimeZone = "GMT";
				var iTZOffset = Math.abs(oDate.getTimezoneOffset());
				var bPositiveOffset = oDate.getTimezoneOffset() > 0;
				var iHourOffset = Math.floor(iTZOffset / 60);
				var iMinuteOffset = iTZOffset % 60;

				if (!bUTC && iTZOffset != 0) {
					sTimeZone += (bPositiveOffset ? "-" : "+");
					sTimeZone += jQuery.sap.padLeft(String(iHourOffset), "0", 2);
					sTimeZone += ":";
					sTimeZone += jQuery.sap.padLeft(String(iMinuteOffset), "0", 2);
				} else {
					sTimeZone += "Z";
				}

				return sTimeZone;
			}
		},
		"Z": {
			name: "timezoneRFC822",
			format: function(oField, oDate, bUTC, oFormat) {
				var iTZOffset = Math.abs(oDate.getTimezoneOffset());
				var bPositiveOffset = oDate.getTimezoneOffset() > 0;
				var iHourOffset = Math.floor(iTZOffset / 60);
				var iMinuteOffset = iTZOffset % 60;
				var sTimeZone = "";

				if (!bUTC && iTZOffset != 0) {
					sTimeZone += (bPositiveOffset ? "-" : "+");
					sTimeZone += jQuery.sap.padLeft(String(iHourOffset), "0", 2);
					sTimeZone += jQuery.sap.padLeft(String(iMinuteOffset), "0", 2);
				}

				return sTimeZone;
			}
		},
		"X": {
			name: "timezoneISO8601",
			format: function(oField, oDate, bUTC, oFormat) {
				var iTZOffset = Math.abs(oDate.getTimezoneOffset());
				var bPositiveOffset = oDate.getTimezoneOffset() > 0;
				var iHourOffset = Math.floor(iTZOffset / 60);
				var iMinuteOffset = iTZOffset % 60;

				var sTimeZone = "";
				if (!bUTC && iTZOffset != 0) {
					sTimeZone += (bPositiveOffset ? "-" : "+");
					sTimeZone += jQuery.sap.padLeft(String(iHourOffset), "0", 2);
					sTimeZone += ":";
					sTimeZone += jQuery.sap.padLeft(String(iMinuteOffset), "0", 2);
				} else {
					sTimeZone += "Z";
				}

				return sTimeZone;
			}
		}
	};

	DateFormat.prototype._format = function(oJSDate, bUTC) {
		if (this.oFormatOptions.relative) {
			var sRes = this.formatRelative(oJSDate, bUTC, this.oFormatOptions.relativeRange);
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

			aBuffer.push(this.oSymbols[sSymbol].format(oPart, oDate, bUTC, this));
		}

		sResult = aBuffer.join("");
		if (sap.ui.getCore().getConfiguration().getOriginInfo()) {
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
	 * @param {Date|Date[]} vJSDate the value to format
	 * @param {boolean} bUTC whether to use UTC
	 * @return {string} the formatted output value. If an invalid date is given, an empty string is returned.
	 * @public
	 */
	DateFormat.prototype.format = function(vJSDate, bUTC) {
		if (bUTC === undefined) {
			bUTC = this.oFormatOptions.UTC;
		}

		if (Array.isArray(vJSDate)) {
			if (!this.oFormatOptions.interval) {
				jQuery.sap.log.error("Non-interval DateFormat can't format more than one date instance.");
				return "";
			}

			if (vJSDate.length !== 2) {
				jQuery.sap.log.error("Interval DateFormat can only format with 2 date instances but " + vJSDate.length + " is given.");
				return "";
			}

			var bValid = vJSDate.every(function(oJSDate) {
				return oJSDate && !isNaN(oJSDate.getTime());
			});

			if (!bValid) {
				jQuery.sap.log.error("At least one date instance which is passed to the interval DateFormat isn't valid.");
				return "";
			}

			return this._formatInterval(vJSDate, bUTC);
		} else {
			if (!vJSDate || isNaN(vJSDate.getTime())) {
				jQuery.sap.log.error("The given date instance isn't valid.");
				return "";
			}

			if (this.oFormatOptions.interval) {
				jQuery.sap.log.error("Interval DateFormat expects an array with two dates for the first argument but only one date is given.");
				return "";
			}

			return this._format(vJSDate, bUTC);
		}
	};

	DateFormat.prototype._formatInterval = function(aJSDates, bUTC) {
		var sCalendarType = this.oFormatOptions.calendarType;
		var oFromDate = UniversalDate.getInstance(aJSDates[0], sCalendarType);
		var oToDate = UniversalDate.getInstance(aJSDates[1], sCalendarType);
		var oDate;
		var oPart;
		var sSymbol;
		var aBuffer = [];
		var sPattern;

		var sDiffField = this._getGreatestDiffField(aJSDates, bUTC);

		if (!sDiffField) {
			return this._format(aJSDates[0], bUTC);
		}

		if (this.oFormatOptions.format) {
			// when 'format' option is set, generate the pattern based on the greatest difference
			sPattern = this.oLocaleData.getCustomIntervalPattern(this.oFormatOptions.format, sDiffField, sCalendarType);

		} else {
			sPattern = this.oLocaleData.getCombinedIntervalPattern(this.oFormatOptions.pattern, sCalendarType);
		}

		this.aFormatArray = this.parseCldrDatePattern(sPattern);

		oDate = oFromDate;
		for (var i = 0; i < this.aFormatArray.length; i++) {
			oPart = this.aFormatArray[i];
			sSymbol = oPart.symbol || "";

			if (oPart.repeat) {
				oDate = oToDate;
			}

			aBuffer.push(this.oSymbols[sSymbol].format(oPart, oDate, bUTC, this));
		}

		return aBuffer.join("");
	};

	var mFieldToGroup = {
		"FullYear": {
			group: "Year"
		},
		"Month": {
			group: "Month"
		},
		"Date": {
			group: "Day"
		},
		"Hours": {
			group: "Hour"
		},
		"Minutes": {
			group: "Minute"
		},
		"Seconds": {
			group: "Second"
		}
	};

	DateFormat.prototype._getGreatestDiffField = function(aJSDates, bUTC) {
		var vFromValue;
		var vToValue;
		var sField;
		var sFieldGroup;

		var bDiffFound = this.aIntervalCompareFields.some(function(sCompareField, index) {
			var sMethodName = "get" + (bUTC ? "UTC" : "") + sCompareField;
			vFromValue = aJSDates[0][sMethodName].apply(aJSDates[0]);
			vToValue = aJSDates[1][sMethodName].apply(aJSDates[1]);

			if (vFromValue !== vToValue) {
				sField = sCompareField;
				return true;
			}
		});

		if (bDiffFound) {
			sFieldGroup = mFieldToGroup[sField].group;

			if (sFieldGroup === "Hour") {
				// If the two 'Hour' values differ on the dayperiod level,
				// set field group to 'a'
				if ((vFromValue < 12 && vToValue >= 12) || (vToValue < 12 && vFromValue >= 12)) {
					// Dayperiod
					sFieldGroup = "a";
				}
			}

			return sFieldGroup;
		} else {
			return null;
		}
	};

	/**
	 * Parse a string which is formatted according to the given format options.
	 *
	 * @param {string} sValue the string containing a formatted date/time value
	 * @param {boolean} bUTC whether to use UTC, if no timezone is contained
	 * @param {boolean} bStrict to use strict value check
	 * @return {Date} the parsed value
	 * @public
	 */
	DateFormat.prototype.parse = function(oValue, bUTC, bStrict) {
		if (bUTC === undefined) {
			bUTC = this.oFormatOptions.UTC;
		}

		if (bStrict === undefined) {
			bStrict = this.oFormatOptions.strictParsing;
		}

		var oDate,
			iIndex = 0,
			iDay = null,
			iMonth = null,
			iYear = null,
			iWeekYear = null,
			iWeek = null,
			iDayNumberOfWeek = null,
			iEra = null,
			iHours = null,
			iMinutes = null,
			iSeconds = null,
			iMilliseconds = null,
			iQuarter = null,
			bPM,
			oPart,
			sPart,
			iTZDiff = null,

			bValid = true,
			oFound,
			bFound,
			iCurrentEra = this.aErasWide.length - 1,
			oRequiredParts = this.oRequiredParts,
			sCalendarType = this.oFormatOptions.calendarType,
			aDaysVariants = [this.aDaysWide, this.aDaysWideSt, this.aDaysAbbrev, this.aDaysAbbrevSt, this.aDaysShort, this.aDaysShortSt, this.aDaysNarrow, this.aDaysNarrowSt],
			aMonthsVariants = [this.aMonthsWide, this.aMonthsWideSt, this.aMonthsAbbrev, this.aMonthsAbbrevSt, this.aMonthsNarrow, this.aMonthsNarrowSt],
			aQuartersVariants = [this.aQuartersWide, this.aQuartersWideSt, this.aQuartersAbbrev, this.aQuartersAbbrevSt, this.aQuartersNarrow, this.aQuartersNarrowSt],
			aErasVariants = [this.aErasWide, this.aErasAbbrev, this.aErasNarrow];

		function isNumber(iCharCode) {
			return iCharCode >= 48 && iCharCode <= 57;
		}

		function findNumbers(iMaxLength) {
			var iLength = 0;
			while (iLength < iMaxLength && isNumber(oValue.charCodeAt(iIndex + iLength))) {
				iLength++;
			}
			return oValue.substr(iIndex, iLength);
		}

		function findEntry(aList) {
			var iFoundIndex = -1,
				iMatchedLength = 0;

			for (var j = 0; j < aList.length; j++) {
				if (aList[j] && aList[j].length > iMatchedLength && oValue.indexOf(aList[j], iIndex) == iIndex) {
					iFoundIndex = j;
					iMatchedLength = aList[j].length;
				}
			}
			return {
				index: iFoundIndex,
				value: iFoundIndex === -1 ? null : aList[iFoundIndex]
			};
		}

		function parseTZ(bISO) {
			var iTZFactor = oValue.charAt(iIndex) == "+" ? -1 : 1;
			iIndex++; //"+" or "-"
			sPart = findNumbers(2);
			var iTZDiffHour = parseInt(sPart, 10);
			iIndex = iIndex + 2; //hh: 2 digits for hours
			if (bISO) {
				iIndex++; //":"
			}
			sPart = findNumbers(2);
			iIndex = iIndex + 2; //mm: 2 digits for minutes
			iTZDiff = parseInt(sPart, 10);
			iTZDiff = (iTZDiff + 60 * iTZDiffHour) * iTZFactor;
		}

		function checkValid(sType, bPartInvalid) {
			if (sType in oRequiredParts && bPartInvalid) {
				bValid = false;
			}
		}

		function matchInArray(aArray) {
			oFound = findEntry(aArray);
			if (oFound.index !== -1) {
				iIndex += oFound.value.length;
				return true;
			}
		}

		oValue = jQuery.trim(oValue);

		var oJSDate = this.parseRelative(oValue, bUTC);
		if (oJSDate) { //Stop when relative parsing possible, else go on with standard parsing
			return oJSDate;
		}

		for (var i = 0; i < this.aFormatArray.length; i++) {
			oPart = this.aFormatArray[i];
			switch (oPart.type) {
				case "text":
					if (oValue.indexOf(oPart.value, iIndex) == iIndex) {
						iIndex += oPart.value.length;
					} else {
						// only require text, if next part is also required
						checkValid(oPart.type, this.aFormatArray[i + 1].type in oRequiredParts);
					}
					break;
				case "day":
					sPart = findNumbers(Math.max(oPart.digits, 2));
					checkValid(oPart.type, sPart === "");
					iIndex += sPart.length;
					iDay = parseInt(sPart, 10);
					if (bStrict && (iDay > 31 || iDay < 1)) {
						bValid = false;
					}
					break;
				case "dayNameInWeek":
				case "dayNameInWeekStandalone":
					aDaysVariants.some(matchInArray);
					break;
				case "dayNumberOfWeek":
					sPart = findNumbers(oPart.digits);
					iIndex += sPart.length;
					iDayNumberOfWeek = parseInt(sPart, 10);
					break;
				case "month":
				case "monthStandalone":
					if (oPart.digits < 3) {
						sPart = findNumbers(Math.max(oPart.digits, 2));
						checkValid(oPart.type, sPart === "");
						iMonth = parseInt(sPart, 10) - 1;
						iIndex += sPart.length;
						if (bStrict && (iMonth > 11 || iMonth < 0)) {
							bValid = false;
						}
					} else {
						bFound = aMonthsVariants.some(matchInArray);
						if (bFound) {
							iMonth = oFound.index;
						} else {
							checkValid(oPart.type, true);
						}
					}
					break;
				case "quarter":
				case "quarterStandalone":
					if (oPart.digits < 3) {
						sPart = findNumbers(Math.max(oPart.digits, 2));
						checkValid(oPart.type, sPart === "");
						iQuarter = parseInt(sPart, 10) - 1;
						iIndex += sPart.length;
						if (bStrict && iQuarter > 3) {
							bValid = false;
						}
					} else {
						bFound = aQuartersVariants.some(matchInArray);
						if (bFound) {
							iQuarter = oFound.index;
						} else {
							checkValid(oPart.type, true);
						}
					}
					break;
				case "era":
					bFound = aErasVariants.some(matchInArray);
					if (bFound) {
						iEra = oFound.index;
					} else {
						checkValid(oPart.type, true);
						iEra = iCurrentEra;
					}
					break;
				case "year":
					if (oPart.digits == 1) {
						sPart = findNumbers(4);
					} else if (oPart.digits == 2) {
						sPart = findNumbers(2);
					} else {
						sPart = findNumbers(oPart.digits);
					}
					iIndex += sPart.length;
					checkValid(oPart.type, sPart === "");
					iYear = parseInt(sPart, 10);
					// Find the right century for two-digit years
					if (sCalendarType != CalendarType.Japanese && sPart.length <= 2) {
						var oCurrentDate = UniversalDate.getInstance(new Date(), sCalendarType),
							iCurrentYear = oCurrentDate.getFullYear(),
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
					break;
				case "weekYear":
					if (oPart.digits == 1) {
						sPart = findNumbers(4);
					} else if (oPart.digits == 2) {
						sPart = findNumbers(2);
					} else {
						sPart = findNumbers(oPart.digits);
					}
					iIndex += sPart.length;
					checkValid(oPart.type, sPart === "");
					iYear = parseInt(sPart, 10);
					// Find the right century for two-digit years
					if (sCalendarType != CalendarType.Japanese && sPart.length <= 2) {
						var oCurrentDate = UniversalDate.getInstance(new Date(), sCalendarType),
							iCurrentYear = oCurrentDate.getFullYear(),
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
					break;
				case "weekInYear":
					if (oPart.digits < 3) {
						sPart = findNumbers(2);
						iWeek = parseInt(sPart, 10) - 1;
						iIndex += sPart.length;
						checkValid(oPart.type, !sPart);
					} else {
						sPart = this.oLocaleData.getCalendarWeek(oPart.digits === 3 ? "narrow" : "wide");
						sPart = sPart.replace("{0}", "[0-9]+");
						var rWeekNumber = new RegExp(sPart),
							oResult = rWeekNumber.exec(oValue.substring(iIndex));
						if (oResult) {
							iIndex += oResult[0].length;
							iWeek = parseInt(oResult[0], 10) - 1;
						} else {
							checkValid(oPart.type, true);
						}
					}
					break;
				case "hour0_23":
					sPart = findNumbers(Math.max(oPart.digits, 2));
					checkValid(oPart.type, sPart === "");
					iIndex += sPart.length;
					iHours = parseInt(sPart, 10);
					if (bStrict && iHours > 23) {
						bValid = false;
					}
					break;
				case "hour1_24":
					sPart = findNumbers(Math.max(oPart.digits, 2));
					checkValid(oPart.type, sPart === "");
					iIndex += sPart.length;
					iHours = parseInt(sPart, 10);
					if (iHours == 24) {
						iHours = 0;
					}
					if (bStrict && iHours > 23) {
						bValid = false;
					}
					break;
				case "hour0_11":
					sPart = findNumbers(Math.max(oPart.digits, 2));
					checkValid(oPart.type, sPart === "");
					iIndex += sPart.length;
					iHours = parseInt(sPart, 10);
					if (bStrict && iHours > 11) {
						bValid = false;
					}
					break;
				case "hour1_12":
					sPart = findNumbers(Math.max(oPart.digits, 2));
					checkValid(oPart.type, sPart === "");
					iIndex += sPart.length;
					iHours = parseInt(sPart, 10);
					if (iHours == 12) {
						iHours = 0;
						// change the PM only when it's not yet parsed
						// 12:00 defaults to 12:00 PM
						bPM = (bPM === undefined) ? true : bPM;
					}
					if (bStrict && iHours > 11) {
						bValid = false;
					}
					break;
				case "minute":
					sPart = findNumbers(Math.max(oPart.digits, 2));
					checkValid(oPart.type, sPart === "");
					iIndex += sPart.length;
					iMinutes = parseInt(sPart, 10);
					if (bStrict && iMinutes > 59) {
						bValid = false;
					}
					break;
				case "second":
					sPart = findNumbers(Math.max(oPart.digits, 2));
					checkValid(oPart.type, sPart === "");
					iIndex += sPart.length;
					iSeconds = parseInt(sPart, 10);
					if (bStrict && iSeconds > 59) {
						bValid = false;
					}
					break;
				case "fractionalsecond":
					sPart = findNumbers(oPart.digits);
					iIndex += sPart.length;
					sPart = sPart.substr(0, 3);
					sPart = jQuery.sap.padRight(sPart, "0", 3);
					iMilliseconds = parseInt(sPart, 10);
					break;
				case "amPmMarker":
					var sAM = this.aDayPeriods[0],
						sPM = this.aDayPeriods[1];

					// check whether the value is one of the ASCII variants for AM/PM
					// for example: "am", "a.m.", "am." (and their case variants)
					// if true, remove the '.' and compare with the defined am/pm case
					// insensitive
					var rAMPM = /[aApP](?:\.)?[mM](?:\.)?/;
					var oSubValue = oValue.substring(iIndex);
					var aMatch = oSubValue.match(rAMPM);
					var bVariant = (aMatch && aMatch.index === 0);
					if (bVariant) {
						oSubValue = aMatch[0].replace(/\./g, "").toLowerCase() + oSubValue.substring(aMatch[0].length);
						sAM = sAM.toLowerCase();
						sPM = sPM.toLowerCase();
					}

					if (oSubValue.indexOf(sAM) == 0) {
						bPM = false;
						iIndex += (bVariant ? aMatch[0].length : sAM.length);
					} else if (oSubValue.indexOf(sPM) == 0) {
						bPM = true;
						iIndex += (bVariant ? aMatch[0].length : sPM.length);
					}
					break;
				case "timezoneGeneral": //e.g. GMT-02:00 or GMT+02:00
					var oTZ = oValue.substring(iIndex, iIndex + 3);
					if (oTZ === "GMT" || oTZ === "UTC") {
						iIndex = iIndex + 3;
					} else if (oValue.substring(iIndex, iIndex + 2) === "UT") {
						iIndex = iIndex + 2;
					} else if (oValue.charAt(iIndex) == "Z") {
						iIndex = iIndex + 1;
						iTZDiff = 0;
						break;
					} else {
						jQuery.sap.log.error(oValue + " cannot be parsed correcly by sap.ui.core.format.DateFormat: The given timezone is not supported!");
						break;
					}
					// falls through
				case "timezoneISO8601": //e.g. -02:00 or +02:00 or Z
					if (oValue.charAt(iIndex) == "Z") {
						iIndex = iIndex + 1;
						iTZDiff = 0;
						break;
					}
					parseTZ(true);
					break;
				case "timezoneRFC822": //e.g. -0200 or +0200
					parseTZ(false);
					break;

			}
			if (!bValid) {
				break;
			}
		}

		// If input value has not been completely parsed, mark it as invalid
		if (iIndex < oValue.length) {
			bValid = false;
		}

		if (bPM) {
			iHours += 12;
		}

		if (iQuarter !== null && iMonth === null && iDay === null) {
			iMonth = 3 * iQuarter;
			iDay = 1;
		}

		if (bValid) {
			if (bUTC || iTZDiff != null) {
				oDate = UniversalDate.getInstance(new Date(0), sCalendarType);
				oDate.setUTCEra(iEra || UniversalDate.getCurrentEra(sCalendarType));
				oDate.setUTCFullYear(iYear || 1970);
				oDate.setUTCMonth(iMonth || 0);
				oDate.setUTCDate(iDay || 1);
				oDate.setUTCHours(iHours || 0);
				oDate.setUTCMinutes(iMinutes || 0);
				oDate.setUTCSeconds(iSeconds || 0);
				oDate.setUTCMilliseconds(iMilliseconds || 0);
				if (bStrict && (iDay || 1) !== oDate.getUTCDate()) {
					// check if valid date given - if invalid, day is not the same (31.Apr -> 1.May)
					bValid = false;
					oDate = undefined;
				} else {
					if (iTZDiff) {
						// Set TZDiff after checking for valid day, as it may switch the day as well
						oDate.setUTCMinutes((iMinutes || 0) + iTZDiff);
					}
					if (iWeek !== null) {
						oDate.setUTCWeek({
							year: iWeekYear || iYear,
							week: iWeek
						});

						if (iDayNumberOfWeek !== null) {
							oDate.setUTCDate(oDate.getUTCDate() + iDayNumberOfWeek - 1);
						}
					}
				}
			} else {
				oDate = UniversalDate.getInstance(new Date(1970, 0, 1, 0, 0, 0), sCalendarType);
				oDate.setEra(iEra || UniversalDate.getCurrentEra(sCalendarType));
				oDate.setFullYear(iYear || 1970);
				oDate.setMonth(iMonth || 0);
				oDate.setDate(iDay || 1);
				oDate.setHours(iHours || 0);
				oDate.setMinutes(iMinutes || 0);
				oDate.setSeconds(iSeconds || 0);
				oDate.setMilliseconds(iMilliseconds || 0);
				if (bStrict && (iDay || 1) !== oDate.getDate()) {
					// check if valid date given - if invalid, day is not the same (31.Apr -> 1.May)
					bValid = false;
					oDate = undefined;
				} else if (iWeek !== null) {
					oDate.setWeek({
						year: iWeekYear || iYear,
						week: iWeek
					});

					if (iDayNumberOfWeek !== null) {
						oDate.setDate(oDate.getDate() + iDayNumberOfWeek - 1);
					}
				}
			}

			if (bValid) {
				oDate = oDate.getJSDate();
				return oDate;
			}
		}

		if (!this.bIsFallback) {
			jQuery.each(this.aFallbackFormats, function(i, oFallbackFormat) {
				oDate = oFallbackFormat.parse(oValue, bUTC, bStrict);
				if (oDate) {
					return false;
				}
			});
			return oDate;
		}

		return null;

	};


	/**
	 * Parse the date pattern string and create a format array from it, which can be
	 * used for parsing and formatting the date
	 *
	 * @param sPattern the CLDR date pattern string
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
				if (sCurChar == "'") {
					sPrevChar = sPattern.charAt(i - 1);
					sPrevPrevChar = sPattern.charAt(i - 2);
					sNextChar = sPattern.charAt(i + 1);
					// handle abc''def correctly
					if (sPrevChar == "'" && sPrevPrevChar != "'") {
						bQuoted = false;
					} else if (sNextChar == "'") {
						// handle 'abc''def' correctly

						i += 1;
					} else {
						//  normal quote 'abcdef'
						bQuoted = false;
						continue;
					}
				}
				if (sState == "text") {
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
				if (sCurChar == "'") {
					bQuoted = true;
				} else if (this.oSymbols[sCurChar]) {
					sNewState = this.oSymbols[sCurChar].name;
					if (sState == sNewState) {
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
					if (sState == "text") {
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
	 * @param {boolean} bUTC whether to use UTC, if no timezone is contained
	 * @param {boolean} bStrict to use strict value check
	 * @return {Date} the parsed value or null if relative parsing not possible
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
					iValue = parseInt(oResult[1], 10);
					return computeRelativeDate(iValue * oEntry.sign, oEntry.scale);
				}
			}
		}

		function computeRelativeDate(iDiff, sScale){
			var iToday,
				oToday = new Date(),
				oJSDate;

			if (bUTC) {
				iToday = oToday.getTime();
			} else {
				iToday = Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate(), oToday.getHours(), oToday.getMinutes(), oToday.getSeconds(), oToday.getMilliseconds());
			}

			oJSDate = new Date(iToday);

			switch (sScale) {
				case "second": oJSDate.setUTCSeconds(oJSDate.getUTCSeconds() + iDiff); break;
				case "minute": oJSDate.setUTCMinutes(oJSDate.getUTCMinutes() + iDiff); break;
				case "hour": oJSDate.setUTCHours(oJSDate.getUTCHours() + iDiff); break;
				case "day": oJSDate.setUTCDate(oJSDate.getUTCDate() + iDiff); break;
				case "week": oJSDate.setUTCDate(oJSDate.getUTCDate() + iDiff * 7); break;
				case "month": oJSDate.setUTCMonth(oJSDate.getUTCMonth() + iDiff); break;
				case "quarter": oJSDate.setUTCMonth(oJSDate.getUTCMonth() + iDiff * 3); break;
				case "year": oJSDate.setUTCFullYear(oJSDate.getUTCFullYear() + iDiff); break;
			}

			if (bUTC) {
				return oJSDate;
			} else {
				return new Date(oJSDate.getUTCFullYear(), oJSDate.getUTCMonth(), oJSDate.getUTCDate(), oJSDate.getUTCHours(), oJSDate.getUTCMinutes(), oJSDate.getUTCSeconds(), oJSDate.getUTCMilliseconds());
			}
		}
	};

	/**
	 * Format a date relative to the current date.
	 *
	 * @param {Date} oDate the value to format
	 * @param {boolean} bUTC whether to use UTC
	 * @return {string} the formatted output value or null if relative formatting not possible
	 * @private
	 */
	DateFormat.prototype.formatRelative = function(oJSDate, bUTC, aRange) {

		var oToday = new Date(),
			sScale = this.oFormatOptions.relativeScale || "day",
			iToday, iDate, iDiff, sPattern, iDiffSeconds;

		iDiffSeconds = (oJSDate.getTime() - oToday.getTime()) / 1000;
		if (this.oFormatOptions.relativeScale == "auto") {
			sScale = this._getScale(iDiffSeconds, this.aRelativeScales);
		}

		if (!aRange) {
			aRange = this._mRanges[sScale];
		}

		// For dates normalize to UTC to avoid issues with summer-/wintertime
		if (sScale == "year" || sScale == "month" || sScale == "day") {
			iToday = Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate());
			if (bUTC) {
				iDate = Date.UTC(oJSDate.getUTCFullYear(), oJSDate.getUTCMonth(), oJSDate.getUTCDate());
			} else {
				iDate = Date.UTC(oJSDate.getFullYear(), oJSDate.getMonth(), oJSDate.getDate());
			}
			iDiffSeconds = (iDate - iToday) / 1000;
		}

		iDiff = this._getDifference(sScale, iDiffSeconds);

		if (this.oFormatOptions.relativeScale != "auto" && (iDiff < aRange[0] || iDiff > aRange[1])) {
			//Relative parsing only in range +/- x days
			return null;
		}

		sPattern = this.oLocaleData.getRelativePattern(sScale, iDiff, iDiffSeconds > 0, this.oFormatOptions.relativeStyle);
		return jQuery.sap.formatMessage(sPattern, [Math.abs(iDiff)]);

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
		second: 1,
		minute: 60,
		hour: 3600,
		day: 86400,
		week: 604800,
		month: 2592000,
		quarter: 7776000,
		year: 31536000
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

	DateFormat.prototype._getDifference = function(sScale, iDiffSeconds) {
		var iScaleSeconds = this._mScales[sScale],
			iDiff = iDiffSeconds / iScaleSeconds;
		if (iDiffSeconds > 0) {
			iDiff = Math.floor(iDiff);
		} else {
			iDiff = Math.ceil(iDiff);
		}
		return iDiff;
	};


	DateFormat.prototype.getAllowedCharacters = function(aFormatArray) {

		if (this.oFormatOptions.relative) {
			return ""; //Allow all
		}

		var sAllowedCharacters = "";
		var bNumbers = false;
		var bAll = false;
		var oPart;

		for (var i = 0; i < this.aFormatArray.length; i++) {
			oPart = this.aFormatArray[i];
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
				}else {
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

	return DateFormat;

}, /* bExport= */ true);
