/*!
 * ${copyright}
 */

// Provides class sap.ui.core.format.DateFormat
sap.ui.define(['jquery.sap.global', 'sap/ui/core/LocaleData', 'jquery.sap.strings'],
	function(jQuery, LocaleData, jQuerySapStrings) {
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
	 * @name sap.ui.core.format.DateFormat
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
		getPattern: function(oLocaleData, sStyle) {
			return oLocaleData.getDatePattern(sStyle);
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
				{pattern: "yyyy-MM-dd'T'hh:mm:ss"},
				{pattern: "yyyyMMdd hhmmss"}
		],
		getPattern: function(oLocaleData, sStyle) {
			var sDateTimePattern = oLocaleData.getDateTimePattern(sStyle),
				sDatePattern = oLocaleData.getDatePattern(sStyle),
				sTimePattern = oLocaleData.getTimePattern(sStyle);
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
				{pattern: "hh:mm:ss"},
				{pattern: "hhmmss"}
		],
		getPattern: function(oLocaleData, sStyle) {
			return oLocaleData.getTimePattern(sStyle);
		},
		oRequiredParts: {
			"text": true, "hour0_23": true, "hour1_24": true, "hour0_11": true, "hour1_12": true
		}
	};


	/**
	 * @see sap.ui.core.format.DateFormat.getDateInstance
	 * @name sap.ui.core.format.DateFormat.getInstance
	 * @function
	 */
	DateFormat.getInstance = function(oFormatOptions, oLocale) {
		return this.getDateInstance(oFormatOptions, oLocale);
	};


	/**
	 * Get a date instance of the DateFormat, which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {string} [oFormatOptions.pattern] a data pattern in LDML format. It is not verified whether the pattern represents only a date.
	 * @param {string} [oFormatOptions.style] either empty or 'short, 'medium' or 'long'. If no pattern is given, a locale dependent default date pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] either empty or 'true' or 'false'. If true, by parsing it is checked if the value is a valid date
	 * @param {boolean} [oFormatOptions.relative] either empty or 'true' or 'false'. If true, the date is formatted relatively to todays date if it is within the given day range, e.g. "today", "yesterday", "in 5 days"
	 * @param {int[]} [oFormatOptions.relativeRange] the day range used for relative formatting (default [-6, 6], which means only the last 6 days, today and the next 6 days are formatted relatively).
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @return {sap.ui.core.format.DateFormat} date instance of the DateFormat
	 * @static
	 * @public
	 * @name sap.ui.core.format.DateFormat.getDateInstance
	 * @function
	 */
	DateFormat.getDateInstance = function(oFormatOptions, oLocale) {
		return this.createInstance(oFormatOptions, oLocale, this.oDateInfo);
	};

	/**
	 * Get a datetime instance of the DateFormat, which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {string} [oFormatOptions.pattern] a datetime pattern in LDML format. It is not verified whether the pattern represents a full datetime.
	 * @param {string} [oFormatOptions.style] either empty or 'short, 'medium' or 'long'. If no pattern is given, a locale dependent default datetime pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] either empty or 'true' or 'false'. If true, by parsing it is checked if the value is a valid datetime
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @return {sap.ui.core.format.DateFormat} datetime instance of the DateFormat
	 * @static
	 * @public
	 * @name sap.ui.core.format.DateFormat.getDateTimeInstance
	 * @function
	 */
	DateFormat.getDateTimeInstance = function(oFormatOptions, oLocale) {
		return this.createInstance(oFormatOptions, oLocale, this.oDateTimeInfo);
	};

	/**
	 * Get a time instance of the DateFormat, which can be used for formatting.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {string} [oFormatOptions.pattern] a time pattern in LDML format. It is not verified whether the pattern only represents a time.
	 * @param {string} [oFormatOptions.style] either empty or 'short, 'medium' or 'long'. If no pattern is given, a locale dependent default time pattern of that style is used from the LocaleData class.
	 * @param {boolean} [oFormatOptions.strictParsing] either empty or 'true' or 'false'. If true, by parsing it is checked if the value is a valid time
	 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
	 * @return {sap.ui.core.format.DateFormat} time instance of the DateFormat
	 * @static
	 * @public
	 * @name sap.ui.core.format.DateFormat.getTimeInstance
	 * @function
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
	 * @name sap.ui.core.format.DateFormat.createInstance
	 * @function
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
		if (!oFormat.oFormatOptions.pattern) {
			oFormat.oFormatOptions.pattern = oInfo.getPattern(oFormat.oLocaleData, oFormat.oFormatOptions.style);
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
	 * @name sap.ui.core.format.DateFormat#init
	 * @function
	 */
	DateFormat.prototype.init = function() {
		this.aMonthsAbbrev = this.oLocaleData.getMonths("abbreviated");
		this.aMonthsWide = this.oLocaleData.getMonths("wide");
		this.aMonthsAbbrevSt = this.oLocaleData.getMonthsStandAlone("abbreviated");
		this.aMonthsWideSt = this.oLocaleData.getMonthsStandAlone("wide");
		this.aDaysAbbrev = this.oLocaleData.getDays("abbreviated");
		this.aDaysWide = this.oLocaleData.getDays("wide");
		this.aDaysAbbrevSt = this.oLocaleData.getDaysStandAlone("abbreviated");
		this.aDaysWideSt = this.oLocaleData.getDaysStandAlone("wide");
		this.aDayPeriods = this.oLocaleData.getDayPeriods("abbreviated");
		this.aFormatArray = this.parseJavaDateFormat(this.oFormatOptions.pattern);
		this.sAllowedCharacters = this.getAllowedCharacters(this.aFormatArray);
	};

	/**
	 * Pattern elements
	 * @name sap.ui.core.format.DateFormat#oStates
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
	 * @name sap.ui.core.format.DateFormat#format
	 * @function
	 */
	DateFormat.prototype.format = function(oDate, bUTC) {
		if (bUTC === undefined) {
			bUTC = this.oFormatOptions.UTC;
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
				case "era":
					aBuffer.push("AD");
					break;
				case "year":
				case "weekYear":
					sYear = "" + iYear;
					if (oPart.iDigits == 2 && sYear.length > 2) {
						sYear = sYear.substr(sYear.length - 2);
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
					}
					else if (iHours == 0) {
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
					}
					else if (oDate.getTimezoneShort) {
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
	 * @name sap.ui.core.format.DateFormat#parse
	 * @function
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
			bPM = false,
			oPart,
			sPart,
			iTZDiff = null,
			bValid = true,
			oRequiredParts = this.oRequiredParts;

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
			for (var j = 0; j < aList.length; j++) {
				if (oValue.indexOf(aList[j], iIndex) == iIndex) {
					return aList[j];
				}
			}
			return null;
		}

		function findEntryIndex(aList) {
			for (var j = 0; j < aList.length; j++) {
				if (oValue.indexOf(aList[j], iIndex) == iIndex) {
					return j;
				}
			}
			return null;
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
					if (bStrict && iDay > 31) {
						bValid = false;
					}
					break;
				case "dayNameInWeek":
				case "dayNameInWeekStandalone":
					sPart = findEntry(this.aDaysWide);
					if (sPart) {
						iIndex += sPart.length;
						break;
					}
					sPart = findEntry(this.aDaysWideSt);
					if (sPart) {
						iIndex += sPart.length;
						break;
					}
					sPart = findEntry(this.aDaysAbbrev);
					if (sPart) {
						iIndex += sPart.length;
						break;
					}
					sPart = findEntry(this.aDaysAbbrevSt);
					if (sPart) {
						iIndex += sPart.length;
						break;
					}
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
						if (bStrict && iMonth > 11) {
							bValid = false;
						}
					} else {
						iMonth = findEntryIndex(this.aMonthsWide);
						if (iMonth != null) {
							iIndex += this.aMonthsWide[iMonth].length;
							break;
						}
						iMonth = findEntryIndex(this.aMonthsWideSt);
						if (iMonth != null) {
							iIndex += this.aMonthsWideSt[iMonth].length;
							break;
						}
						iMonth = findEntryIndex(this.aMonthsAbbrev);
						if (iMonth != null) {
							iIndex += this.aMonthsAbbrev[iMonth].length;
							break;
						}
						iMonth = findEntryIndex(this.aMonthsAbbrevSt);
						if (iMonth != null) {
							iIndex += this.aMonthsAbbrevSt[iMonth].length;
							break;
						}
						checkValid(oPart.sType, true);
					}
					break;
				case "era":
					// TODO
					break;
				case "year":
				case "weekYear":
					if (oPart.iDigits == 1) {
						sPart = findNumbers(4);
					}
					else if (oPart.iDigits == 2) {
						sPart = findNumbers(2);
					} else {
						sPart = findNumbers(oPart.iDigits);
					}
					iIndex += sPart.length;
					checkValid(oPart.sType, sPart === "");
					iYear = parseInt(sPart, 10);
					// Find the right century for two-digit years
					if (sPart.length <= 2) {
						var iCurrentYear = new Date().getFullYear(),
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
						iIndex += 2;
					}
					else if (oValue.indexOf(sPM, iIndex) == iIndex) {
						bPM = true;
						iIndex += 2;
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
			if (iTZDiff != null) {
				oDate = new Date(0);
				oDate.setUTCFullYear(iYear || 1970);
				oDate.setUTCMonth(iMonth || 0);
				oDate.setUTCDate(iDay || 1);
				oDate.setUTCHours(iHours || 0);
				oDate.setUTCMinutes((iMinutes || 0) + iTZDiff);
				oDate.setUTCSeconds(iSeconds || 0);
				oDate.setUTCMilliseconds(iMilliseconds || 0);
				if (bStrict && (iDay || 1) !== oDate.getUTCDate()) {
					// check if valid date given - if invalid, day is not the same (31.Apr -> 1.May)
					bValid = false;
					oDate = undefined;
				}
			} else if (bUTC) {
				oDate = new Date(0);
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
				}
			} else {
				oDate = new Date(1970, 0, 1, 0, 0, 0);
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
	 * @name sap.ui.core.format.DateFormat#parseJavaDateFormat
	 * @function
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
					}
					// handle 'abc''def' correctly
					else if (sNextChar == "'") {
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
				}
				else if (this.oStates[sCurChar]) {
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
		return new Date();
	};
	
	/**
	 * Parse a date string relative to the current date.
	 *
	 * @param {string} sValue the string containing a formatted date/time value
	 * @param {boolean} bUTC whether to use UTC, if no timezone is contained
	 * @param {boolean} bStrict to use strict value check
	 * @return {Date} the parsed value or null if relative parsing not possible
	 * @private
	 * @name sap.ui.core.format.DateFormat#parseRelative
	 * @function
	 */
	DateFormat.prototype.parseRelative = function(sValue, bUTC) {
		if (!sValue) {
			return null;
		}
		
		var that = this;
		
		function computeRelativeDate(iDiff){
			var iDate, iToday,
				oToday = that._now(),
				iToday = Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate());
			
			var iDate = iToday + iDiff * (24 * 60 * 60 * 1000);
			if (!bUTC) {
				iDate += oToday.getTimezoneOffset() * 60 * 1000;
			}
			return new Date(iDate);
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
	 * @name sap.ui.core.format.DateFormat#formatRelative
	 * @function
	 */
	DateFormat.prototype.formatRelative = function(oDate, bUTC, aRange) {
		
		var oToday = this._now(),
			iToday = Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate()),
			iDate, iDiffDays, sPattern;
		
		if (bUTC) {
			iDate = Date.UTC(oDate.getUTCFullYear(), oDate.getUTCMonth(), oDate.getUTCDate());
		} else {
			iDate = Date.UTC(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
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
