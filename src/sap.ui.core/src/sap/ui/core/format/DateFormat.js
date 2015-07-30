/*!
 * ${copyright}
 */

// Provides class sap.ui.core.format.DateFormat
sap.ui.define(['jquery.sap.global', 'sap/ui/core/LocaleData', 'sap/ui/core/date/IslamicDate', 'jquery.sap.strings'],
	function(jQuery, LocaleData, IslamicDate/*, jQuerySap1 */) {
	"use strict";


	/**
	 * Constructor for DateFormat - must not be used: To get a DateFormat instance, please use getInstance, getDateTimeInstance or getTimeInstance.
	 *
	 * @class
	 * The DateFormat is a static class for formatting and parsing date and time values according
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

	DateFormat.oDateInfo = {
		oDefaultFormatOptions: {
			style: "medium"
		},
		aFallbackFormatOptions: [
			{style: "short"},
			{style: "medium"},
			{pattern: "yyyy-MM-dd"},
			{pattern: "yyyyMMdd", strictParsing: true}
		],
		bShortFallbackFormatOptions: true,
		getPattern: function(oLocaleData, sStyle, sCalendarType) {
			return oLocaleData.getDatePattern(sStyle, sCalendarType);
		},
		oRequiredParts: {
			"text": true, "year": true, "weekYear": true, "month": true, "day": true
		},
		bSupportRelative: true
	};

	DateFormat.oDateTimeInfo = {
		oDefaultFormatOptions: {
			style: "medium"
		},
		aFallbackFormatOptions: [
			{style: "short"},
			{style: "medium"},
			{pattern: "yyyy-MM-dd'T'HH:mm:ss"},
			{pattern: "yyyyMMdd HHmmss"}
		],
		getPattern: function(oLocaleData, sStyle, sCalendarType) {
			var sDateTimePattern = oLocaleData.getDateTimePattern(sStyle, sCalendarType),
				sDatePattern = oLocaleData.getDatePattern(sStyle, sCalendarType),
				sTimePattern = oLocaleData.getTimePattern(sStyle, sCalendarType);
			return sDateTimePattern.replace("{1}", sDatePattern).replace("{0}", sTimePattern);
		},
		oRequiredParts: {
			"text": true, "year": true, "weekYear": true, "month": true, "day": true, "hour0_23": true,
			"hour1_24": true, "hour0_11": true, "hour1_12": true
		}

	};

	DateFormat.oTimeInfo = {
		oDefaultFormatOptions: {
			style: "medium"
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
		}
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
	 * @param {string} [oFormatOptions.pattern] a data pattern in LDML format. It is not verified whether the pattern represents only a date.
	 * @param {string} [oFormatOptions.style] can be either 'short, 'medium' or 'long'. If no pattern is given, a locale dependent default date pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] if true, by parsing it is checked if the value is a valid date
	 * @param {boolean} [oFormatOptions.relative] if true, the date is formatted relatively to todays date if it is within the given day range, e.g. "today", "yesterday", "in 5 days"
	 * @param {boolean} [oFormatOptions.UTC] if true, the date is formatted and parsed as UTC instead of the local timezone
	 * @param {sap.ui.core.CalendarType} [oFormatOptions.calendarType] The calender type which is used to format and parse the date. This value is by default either set in configuration or calculated based on current locale.
	 * @param {int[]} [oFormatOptions.relativeRange] the day range used for relative formatting (default [-6, 6], which means only the last 6 days, today and the next 6 days are formatted relatively).
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
	 * @param {string} [oFormatOptions.pattern] a datetime pattern in LDML format. It is not verified whether the pattern represents a full datetime.
	 * @param {string} [oFormatOptions.style] can be either 'short, 'medium' or 'long'. If no pattern is given, a locale dependent default datetime pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] if true, by parsing it is checked if the value is a valid datetime
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
	 * @param {string} [oFormatOptions.pattern] a time pattern in LDML format. It is not verified whether the pattern only represents a time.
	 * @param {string} [oFormatOptions.style] can be either 'short, 'medium' or 'long'. If no pattern is given, a locale dependent default time pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] if true, by parsing it is checked if the value is a valid time
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
		var oFormat = jQuery.sap.newObject(this.prototype);

		// Handle optional parameters
		if ( oFormatOptions instanceof sap.ui.core.Locale ) {
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
			oFormat.oFormatOptions.pattern = oInfo.getPattern(oFormat.oLocaleData, oFormat.oFormatOptions.style, oFormat.oFormatOptions.calendarType);
		}

		// If fallback DateFormats have not been created yet, do it now
		if (!oInfo.aFallbackFormats) {
			// Add two fallback patterns for locale-dependent short format without delimiters
			if (oInfo.bShortFallbackFormatOptions && oInfo.aFallbackFormatOptions) {
				var sPattern = oInfo.getPattern(oFormat.oLocaleData, "short").replace(/[^dMyU]/g, ""); // U for chinese year
				sPattern = sPattern.replace(/d+/g, "dd"); // disallow 1 digit day entries
				sPattern = sPattern.replace(/M+/g, "MM"); // disallow 1 digit month entries
				oInfo.aFallbackFormatOptions.push({
					pattern: sPattern.replace(/[yU]+/g, "yyyy"), strictParsing: true // e.g. ddMMyyyy
				});
				oInfo.aFallbackFormatOptions.push({
					pattern: sPattern.replace(/[yU]+/g, "yy"), strictParsing: true // e.g. ddMMyy
				});
			}
			oInfo.aFallbackFormats = [];
			jQuery.each(oInfo.aFallbackFormatOptions, function(i, oFormatOptions) {
				var oFallbackFormat = DateFormat.createInstance(oFormatOptions, oLocale, oInfo);
				oFallbackFormat.bIsFallback = true;
				oInfo.aFallbackFormats.push(oFallbackFormat);
			});
		}
		oFormat.aFallbackFormats = oInfo.aFallbackFormats;
		oFormat.oRequiredParts = oInfo.oRequiredParts;
		oFormat.bSupportRelative = !!oInfo.bSupportRelative;

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
		this.aMonthsAbbrevSt = this.oLocaleData.getMonthsStandAlone("abbreviated", sCalendarType);
		this.aMonthsWideSt = this.oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		this.aDaysAbbrev = this.oLocaleData.getDays("abbreviated", sCalendarType);
		this.aDaysWide = this.oLocaleData.getDays("wide", sCalendarType);
		this.aDaysAbbrevSt = this.oLocaleData.getDaysStandAlone("abbreviated", sCalendarType);
		this.aDaysWideSt = this.oLocaleData.getDaysStandAlone("wide", sCalendarType);
		this.aQuartersAbbrev = this.oLocaleData.getQuarters("abbreviated", sCalendarType);
		this.aQuartersWide = this.oLocaleData.getQuarters("wide", sCalendarType);
		this.aQuartersAbbrevSt = this.oLocaleData.getQuartersStandAlone("abbreviated", sCalendarType);
		this.aQuartersWideSt = this.oLocaleData.getQuartersStandAlone("wide", sCalendarType);
		this.aDayPeriods = this.oLocaleData.getDayPeriods("abbreviated", sCalendarType);
		this.aFormatArray = this.parseJavaDateFormat(this.oFormatOptions.pattern);
		this.sAllowedCharacters = this.getAllowedCharacters(this.aFormatArray);
	};

	/**
	 * Pattern elements
	 */
	DateFormat.prototype.oStates = {
		"G": "era",
		"y": "year",
		"Y": "weekYear",
		"M": "month",
		"L": "monthStandalone",
		"w": "weekInYear",
		"W": "weekInMonth",
		"D": "dayInYear",
		"d": "day",
		"Q": "quarter",
		"q": "quarterStandalone",
		"F": "dayOfWeekInMonth",
		"E": "dayNameInWeek",
		"c": "dayNameInWeekStandalone",
		"u": "dayNumberOfWeek",
		"a": "amPmMarker",
		"H": "hour0_23",
		"k": "hour1_24",
		"K": "hour0_11",
		"h": "hour1_12",
		"m": "minute",
		"s": "second",
		"S": "millisecond",
		"z": "timezoneGeneral",
		"Z": "timezoneRFC822",
		"X": "timezoneISO8601"
	};

	/**
	 * Format a date according to the given format options.
	 *
	 * @param {Date} oDate the value to format
	 * @param {boolean} bUTC whether to use UTC
	 * @return {string} the formatted output value
	 * @public
	 */
	DateFormat.prototype.format = function(oDate, bUTC) {
		if (bUTC === undefined) {
			bUTC = this.oFormatOptions.UTC;
		}

		var sCalendarType = this.oFormatOptions.calendarType;

		if ((sCalendarType === sap.ui.core.CalendarType.Islamic) && oDate instanceof Date) {
			oDate = new IslamicDate(oDate.getTime());
		}

		//Relative formatting only active we supported (Date) and configured
		if (this.bSupportRelative && this.oFormatOptions.relative) {
			var sRes = this.formatRelative(oDate, bUTC, this.oFormatOptions.relativeRange || [-6, 6]);
			if (sRes) { //Stop when relative formatting possible, else go on with standard formatting
				return sRes;
			}
		}

		var aBuffer = [],
			oPart,
			iDay = bUTC ? oDate.getUTCDay() : oDate.getDay(),
			iDate = bUTC ? oDate.getUTCDate() : oDate.getDate(),
			iMonth = bUTC ? oDate.getUTCMonth() : oDate.getMonth(),
			iYear = bUTC ? oDate.getUTCFullYear() : oDate.getFullYear(),
			iMilliseconds = bUTC ? oDate.getUTCMilliseconds() : oDate.getMilliseconds(),
			iSeconds = bUTC ? oDate.getUTCSeconds() : oDate.getSeconds(),
			iMinutes = bUTC ? oDate.getUTCMinutes() : oDate.getMinutes(),
			iHours = bUTC ? oDate.getUTCHours() : oDate.getHours(),
			iTZOffset = Math.abs(oDate.getTimezoneOffset()),
			bPositiveOffset = oDate.getTimezoneOffset() > 0,
			iHourOffset = Math.floor(iTZOffset / 60),
			iMinuteOffset = iTZOffset % 60,
			iQuarter = Math.floor(iMonth / 3),
			sYear,
			sWeek,
			sHours,
			sResult;

		for (var i = 0; i < this.aFormatArray.length; i++) {
			oPart = this.aFormatArray[i];
			switch (oPart.sType) {
				case "text":
					aBuffer.push(oPart.sValue);
					break;
				case "day":
					aBuffer.push(jQuery.sap.padLeft(String(iDate), "0", oPart.iDigits));
					break;
				case "dayNameInWeek":
					if (oPart.iDigits < 4) {
						aBuffer.push(this.aDaysAbbrev[iDay]);
					} else if (oPart.iDigits >= 4) {
						aBuffer.push(this.aDaysWide[iDay]);
					}
					break;
				case "dayNameInWeekStandalone":
					if (oPart.iDigits < 4) {
						aBuffer.push(this.aDaysAbbrevSt[iDay]);
					} else if (oPart.iDigits >= 4) {
						aBuffer.push(this.aDaysWideSt[iDay]);
					}
					break;
				case "dayNumberOfWeek":
					aBuffer.push(iDay || 7);
					break;
				case "month":
					if (oPart.iDigits == 3) {
						aBuffer.push(this.aMonthsAbbrev[iMonth]);
					} else if (oPart.iDigits >= 4) {
						aBuffer.push(this.aMonthsWide[iMonth]);
					} else {
						aBuffer.push(jQuery.sap.padLeft(String(iMonth + 1), "0", oPart.iDigits));
					}
					break;
				case "monthStandalone":
					if (oPart.iDigits == 3) {
						aBuffer.push(this.aMonthsAbbrevSt[iMonth]);
					} else if (oPart.iDigits >= 4) {
						aBuffer.push(this.aMonthsWideSt[iMonth]);
					} else {
						aBuffer.push(jQuery.sap.padLeft(String(iMonth + 1), "0", oPart.iDigits));
					}
					break;
				case "quarter":
					if (oPart.iDigits == 3) {
						aBuffer.push(this.aQuartersAbbrev[iQuarter]);
					} else if (oPart.iDigits >= 4) {
						aBuffer.push(this.aQuartersWide[iQuarter]);
					} else {
						aBuffer.push(jQuery.sap.padLeft(String(iQuarter + 1), "0", oPart.iDigits));
					}
					break;
				case "quarterStandalone":
					if (oPart.iDigits == 3) {
						aBuffer.push(this.aQuartersAbbrevSt[iQuarter]);
					} else if (oPart.iDigits >= 4) {
						aBuffer.push(this.aQuartersWideSt[iQuarter]);
					} else {
						aBuffer.push(jQuery.sap.padLeft(String(iQuarter + 1), "0", oPart.iDigits));
					}
					break;
				case "era":
					if (oPart.iDigits <= 3) {
						aBuffer.push(this.oLocaleData.getEra("abbreviated", sCalendarType));
					} else if (oPart.iDigits === 4) {
						aBuffer.push(this.oLocaleData.getEra("wide", sCalendarType));
					} else {
						aBuffer.push(this.oLocaleData.getEra("narrow", sCalendarType));
					}
					break;
				case "year":
				case "weekYear":
					sYear = "" + iYear;
					if (oPart.iDigits == 2 && sYear.length > 2) {
						sYear = sYear.substr(sYear.length - 2);
					}
					// When parsing we assume dates less than 100 to be in the current/last century,
					// so when formatting we have to make sure they are differentiable by prefixing with zeros
					if (oPart.iDigits == 1 && iYear < 100) {
						sYear = jQuery.sap.padLeft(sYear, "0", 4);
					}
					aBuffer.push(jQuery.sap.padLeft(sYear, "0", oPart.iDigits));
					break;
				case "weekInYear":
					sWeek = "";
					//TODO getWeek does not exist on Date object
					//-> this is a preparation for a future or custom week support
					if (oDate.getWeek) {
						sWeek += oDate.getWeek();
					}
					aBuffer.push(jQuery.sap.padLeft(sWeek, "0", oPart.iDigits));
					break;
				case "hour0_23":
					aBuffer.push(jQuery.sap.padLeft(String(iHours), "0", oPart.iDigits));
					break;
				case "hour1_24":
					if (iHours == 0) {
						sHours = "24";
					} else {
						sHours = String(iHours);
					}
					aBuffer.push(jQuery.sap.padLeft(sHours, "0", oPart.iDigits));
					break;
				case "hour0_11":
					if (iHours > 11) {
						sHours = String(iHours - 12);
					} else {
						sHours = String(iHours);
					}
					aBuffer.push(jQuery.sap.padLeft(sHours, "0", oPart.iDigits));
					break;
				case "hour1_12":
					if (iHours > 12) {
						sHours = String(iHours - 12);
					} else if (iHours == 0) {
						sHours = "12";
					} else {
						sHours = String(iHours);
					}
					aBuffer.push(jQuery.sap.padLeft(sHours, "0", oPart.iDigits));
					break;
				case "minute":
					aBuffer.push(jQuery.sap.padLeft(String(iMinutes), "0", oPart.iDigits));
					break;
				case "second":
					aBuffer.push(jQuery.sap.padLeft(String(iSeconds), "0", oPart.iDigits));
					break;
				case "millisecond":
					aBuffer.push(jQuery.sap.padRight(jQuery.sap.padLeft(String(iMilliseconds), "0", Math.min(3, oPart.iDigits)), "0", oPart.iDigits));
					break;
				case "amPmMarker":
					var iDayPeriod = iHours < 12 ? 0 : 1;
					aBuffer.push(this.aDayPeriods[iDayPeriod]);
					break;
				case "timezoneGeneral":
					//TODO getTimezoneLong and getTimezoneShort does not exist on Date object
					//-> this is a preparation for a future full timezone support (only used by unit test so far)
					if (oPart.iDigits > 3 && oDate.getTimezoneLong) {
						aBuffer.push(oDate.getTimezoneLong());
						break;
					} else if (oDate.getTimezoneShort) {
						aBuffer.push(oDate.getTimezoneShort());
						break;
					}
					aBuffer.push("GMT");
					// falls through
				case "timezoneISO8601":
					if (!bUTC && iTZOffset != 0) {
						aBuffer.push(bPositiveOffset ? "-" : "+");
						aBuffer.push(jQuery.sap.padLeft(String(iHourOffset), "0", 2));
						aBuffer.push(":");
						aBuffer.push(jQuery.sap.padLeft(String(iMinuteOffset), "0", 2));
					} else {
						aBuffer.push("Z");
					}
					break;
				case "timezoneRFC822":
					if (!bUTC && iTZOffset != 0) {
						aBuffer.push(bPositiveOffset ? "-" : "+");
						aBuffer.push(jQuery.sap.padLeft(String(iHourOffset), "0", 2));
						aBuffer.push(jQuery.sap.padLeft(String(iMinuteOffset), "0", 2));
					}
					break;

			}
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
			iHours = null,
			iMinutes = null,
			iSeconds = null,
			iMilliseconds = null,
			iQuarter = null,
			bPM = false,
			oPart,
			sPart,
			iTZDiff = null,
			bValid = true,
			oFound,
			bFound,
			oRequiredParts = this.oRequiredParts,
			sCalendarType = this.oFormatOptions.calendarType,
			aDaysVariants = [this.aDaysWide, this.aDaysWideSt, this.aDaysAbbrev, this.aDaysAbbrevSt],
			aMonthsVariants = [this.aMonthsWide, this.aMonthsWideSt, this.aMonthsAbbrev, this.aMonthsAbbrevSt],
			aQuartersVariants = [this.aQuartersWide, this.aQuartersWideSt, this.aQuartersAbbrev, this.aQuartersAbbrevSt];

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
				if (aList[j].length > iMatchedLength && oValue.indexOf(aList[j], iIndex) == iIndex) {
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

		//Relative parsing only active we supported (Date)
		if (this.bSupportRelative) {
			var oDate = this.parseRelative(oValue, bUTC);
			if (oDate) { //Stop when relative parsing possible, else go on with standard parsing
				return oDate;
			}
		}

		for (var i = 0; i < this.aFormatArray.length; i++) {
			oPart = this.aFormatArray[i];
			switch (oPart.sType) {
				case "text":
					if (oValue.indexOf(oPart.sValue, iIndex) == iIndex) {
						iIndex += oPart.sValue.length;
					} else {
						// only require text, if next part is also required
						checkValid(oPart.sType, this.aFormatArray[i + 1].sType in oRequiredParts);
					}
					break;
				case "day":
					sPart = findNumbers(Math.max(oPart.iDigits, 2));
					checkValid(oPart.sType, sPart === "");
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
					sPart = findNumbers(oPart.iDigits);
					iIndex += sPart.length;
					break;
				case "month":
				case "monthStandalone":
					if (oPart.iDigits < 3) {
						sPart = findNumbers(Math.max(oPart.iDigits, 2));
						checkValid(oPart.sType, sPart === "");
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
							checkValid(oPart.sType, true);
						}
					}
					break;
				case "quarter":
				case "quarterStandalone":
					if (oPart.iDigits < 3) {
						sPart = findNumbers(Math.max(oPart.iDigits, 2));
						checkValid(oPart.sType, sPart === "");
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
							checkValid(oPart.sType, true);
						}
					}
					break;
				case "era":
					if (oPart.iDigits <= 3) {
						sPart = "abbreviated";
					} else if (oPart.iDigits === 4) {
						sPart = "wide";
					} else {
						sPart = "narrow";
					}
					iIndex += (this.oLocaleData.getEra(sPart).length);
					break;
				case "year":
				case "weekYear":
					if (oPart.iDigits == 1) {
						sPart = findNumbers(4);
					} else if (oPart.iDigits == 2) {
						sPart = findNumbers(2);
					} else {
						sPart = findNumbers(oPart.iDigits);
					}
					iIndex += sPart.length;
					checkValid(oPart.sType, sPart === "");
					iYear = parseInt(sPart, 10);
					// Find the right century for two-digit years
					if (sPart.length <= 2) {
						var iCurrentYear = this._now().getFullYear(),
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
				case "weekInYear":
					// TODO
					break;
				case "hour0_23":
					sPart = findNumbers(Math.max(oPart.iDigits, 2));
					checkValid(oPart.sType, sPart === "");
					iIndex += sPart.length;
					iHours = parseInt(sPart, 10);
					if (bStrict && iHours > 23) {
						bValid = false;
					}
					break;
				case "hour1_24":
					sPart = findNumbers(Math.max(oPart.iDigits, 2));
					checkValid(oPart.sType, sPart === "");
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
					sPart = findNumbers(Math.max(oPart.iDigits, 2));
					checkValid(oPart.sType, sPart === "");
					iIndex += sPart.length;
					iHours = parseInt(sPart, 10);
					if (bStrict && iHours > 11) {
						bValid = false;
					}
					break;
				case "hour1_12":
					sPart = findNumbers(Math.max(oPart.iDigits, 2));
					checkValid(oPart.sType, sPart === "");
					iIndex += sPart.length;
					iHours = parseInt(sPart, 10);
					if (iHours == 12) {
						iHours = 0;
						// 12:00 defaults to 12:00 PM
						bPM = true;
					}
					if (bStrict && iHours > 11) {
						bValid = false;
					}
					break;
				case "minute":
					sPart = findNumbers(Math.max(oPart.iDigits, 2));
					checkValid(oPart.sType, sPart === "");
					iIndex += sPart.length;
					iMinutes = parseInt(sPart, 10);
					if (bStrict && iMinutes > 59) {
						bValid = false;
					}
					break;
				case "second":
					sPart = findNumbers(Math.max(oPart.iDigits, 2));
					checkValid(oPart.sType, sPart === "");
					iIndex += sPart.length;
					iSeconds = parseInt(sPart, 10);
					if (bStrict && iSeconds > 59) {
						bValid = false;
					}
					break;
				case "millisecond":
					sPart = findNumbers(Math.max(oPart.iDigits, 3));
					iIndex += sPart.length;
					sPart = jQuery.sap.padRight(sPart, "0", 3);
					iMilliseconds = parseInt(sPart, 10);
					break;
				case "amPmMarker":
					var sAM = this.aDayPeriods[0],
						sPM = this.aDayPeriods[1];
					if (oValue.indexOf(sAM, iIndex) == iIndex) {
						bPM = false;
						iIndex += sAM.length;
					} else if (oValue.indexOf(sPM, iIndex) == iIndex) {
						bPM = true;
						iIndex += sPM.length;
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

		if (bValid) {
			if (bUTC || iTZDiff != null) {
				oDate = DateFormat.createDate(sCalendarType, 0);
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
				} else if (iTZDiff) {
					// Set TZDiff after checking for valid day, as it may switch the day as well
					oDate.setUTCMinutes((iMinutes || 0) + iTZDiff);
				}
			} else {
				oDate = DateFormat.createDate(sCalendarType, 1970, 0, 1, 0, 0, 0);
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
				}
			}

			if (bValid) {
				if (oDate instanceof IslamicDate) {
					oDate = new Date(oDate.getTime());
				}
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
	 * Parse the date format string and create an format array from it, which can be
	 * used for parsing and formatting the date
	 *
	 * @param sFormat the java date format string
	 * @returns {Array} format array
	 */
	DateFormat.prototype.parseJavaDateFormat = function(sFormat) {
		var aFormatArray = [],
			i,
			bQuoted = false,
			oCurrentObject = null,
			sState = "",
			sNewState = "";


		for (i = 0; i < sFormat.length; i++) {
			var sCurChar = sFormat.charAt(i), sNextChar, sPrevChar, sPrevPrevChar;
			if (bQuoted) {
				if (sCurChar == "'") {
					sPrevChar = sFormat.charAt(i - 1);
					sPrevPrevChar = sFormat.charAt(i - 2);
					sNextChar = sFormat.charAt(i + 1);
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
					oCurrentObject.sValue += sCurChar;
				} else {
					oCurrentObject = {
						sType:"text",
						sValue : sCurChar
					};
					aFormatArray.push(oCurrentObject);
					sState = "text";
				}

			} else {
				if (sCurChar == "'") {
					bQuoted = true;
				} else if (this.oStates[sCurChar]) {
					sNewState = this.oStates[sCurChar];
					if (sState == sNewState) {
						oCurrentObject.iDigits++;
					} else {
						oCurrentObject = {
							sType: sNewState,
							iDigits: 1
						};
						aFormatArray.push(oCurrentObject);
						sState = sNewState;
					}
				} else {
					if (sState == "text") {
						oCurrentObject.sValue += sCurChar;
					} else {
						oCurrentObject = {
							sType:"text",
							sValue : sCurChar
						};
						aFormatArray.push(oCurrentObject);
						sState = "text";
					}
				}
			}

		}
		return aFormatArray;
	};

	DateFormat.prototype._now = function() {
		return DateFormat.createDate(this.oFormatOptions.calendarType);
	};

	DateFormat.createDate = function(sCalendarType) {
		switch (sCalendarType) {
			case sap.ui.core.CalendarType.Islamic:
				return new (Function.prototype.bind.apply(IslamicDate, arguments));
			default:
				return new (Function.prototype.bind.apply(Date, arguments));
		}
	};

	DateFormat.createUTCDate = function(sCalendarType) {
		// Save the sCalendarType because after shift it out the sCalendarType points to the second parameter
		var sType = Array.prototype.shift.apply(arguments);
		switch (sType) {
			case sap.ui.core.CalendarType.Islamic:
				return IslamicDate.UTC.apply(IslamicDate, arguments);
			default:
				return Date.UTC.apply(Date, arguments);
		}
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
		if (!sValue) {
			return null;
		}

		var that = this,
			sCalendarType = this.oFormatOptions.calendarType;

		function computeRelativeDate(iDiff){
			var iDate, iToday,
				oToday = that._now(),
				oDate,
				iToday = DateFormat.createUTCDate(sCalendarType, oToday.getFullYear(), oToday.getMonth(), oToday.getDate()),
				iDiffMillis = iDiff * (24 * 60 * 60 * 1000);

			var iDate = iToday + iDiffMillis;
			oDate = DateFormat.createDate(sCalendarType, iDate);
			if (!bUTC) {
				oDate = DateFormat.createDate(sCalendarType, oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate());
			}
			return oDate;
		}

		var sPattern, _oPattern, _sValue, i, iSign;

		try {
			for (i = -2; i <= 2; i++) {
				sPattern = this.oLocaleData.getRelativeDay(i);
				iSign = i < 0 ? -1 : 1;
				if (sPattern.indexOf("{0}") < 0) {
					if (Math.abs(i) <= 1 && jQuery.sap.startsWithIgnoreCase(sValue, sPattern) && sValue.length == sPattern.length) {
						return computeRelativeDate(i);
					}
				} else if (jQuery.sap.startsWith(sPattern, "{0}")) {
					_oPattern = sPattern.substr(3, sPattern.length);
					if (jQuery.sap.endsWithIgnoreCase(sValue, _oPattern)) {
						_sValue = sValue.substr(0, sValue.length - _oPattern.length);
						return computeRelativeDate(parseInt(_sValue, 10) * iSign);
					}
				} else if (jQuery.sap.endsWith(sPattern, "{0}")) {
					_oPattern = sPattern.substr(0, sPattern.length - 3);
					if (jQuery.sap.startsWithIgnoreCase(sValue, _oPattern)) {
						_sValue = sValue.substr(_oPattern.length, sValue.length);
						return computeRelativeDate(parseInt(_sValue, 10) * iSign);
					}
				} else {
					_oPattern = sPattern.split("{0}");
					if (_oPattern.length == 2 && jQuery.sap.startsWithIgnoreCase(sValue, _oPattern[0]) && jQuery.sap.endsWithIgnoreCase(sValue, _oPattern[1])) {
						_sValue = sValue.substr(_oPattern[0].length, sValue.length - _oPattern[1].length);
						return computeRelativeDate(parseInt(_sValue, 10) * iSign);
					}
				}
			}
		}catch(e){
			jQuery.sap.log.warning("Relative Date parsing not possible: " + e);
		}

		return null;

	};

	/**
	 * Format a date relative to the current date.
	 *
	 * @param {Date} oDate the value to format
	 * @param {boolean} bUTC whether to use UTC
	 * @return {string} the formatted output value or null if relative formatting not possible
	 * @private
	 */
	DateFormat.prototype.formatRelative = function(oDate, bUTC, aRange) {

		var oToday = this._now(),
			sCalendarType = this.oFormatOptions.calendarType,
			iToday = DateFormat.createUTCDate(sCalendarType, oToday.getFullYear(), oToday.getMonth(), oToday.getDate()),
			iDate, iDiffDays, sPattern;

		if (bUTC) {
			iDate = DateFormat.createUTCDate(sCalendarType, oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate());
		} else {
			iDate = DateFormat.createUTCDate(sCalendarType, oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
		}

		iDiffDays = Math.floor((iDate - iToday) / (24 * 60 * 60 * 1000));

		if (iDiffDays < aRange[0] || iDiffDays > aRange[1]) { //Relative parsing only in range +/- x days
			return null;
		}

		sPattern = this.oLocaleData.getRelativeDay(iDiffDays);
		return jQuery.sap.formatMessage(sPattern, [Math.abs(iDiffDays)]);

	};

	DateFormat.prototype.getAllowedCharacters = function(aFormatArray) {

		if (this.bSupportRelative && this.oFormatOptions.relative) {
			return ""; //Allow all
		}

		var sAllowedCharacters = "";
		var bNumbers = false;
		var bAll = false;
		var oPart;

		for (var i = 0; i < this.aFormatArray.length; i++) {
			oPart = this.aFormatArray[i];
			switch (oPart.sType) {
			case "text":
				if (sAllowedCharacters.indexOf(oPart.sValue) < 0) {
					sAllowedCharacters += oPart.sValue;
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
			case "millisecond":
				if (!bNumbers) {
					sAllowedCharacters += "0123456789";
					bNumbers = true;
				}
				break;
			case "month":
			case "monthStandalone":
				if (oPart.iDigits < 3) {
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
