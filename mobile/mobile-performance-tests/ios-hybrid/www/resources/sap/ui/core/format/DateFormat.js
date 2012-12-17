/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.core.format.DateFormat
jQuery.sap.declare("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.core.LocaleData");

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
 */
sap.ui.core.format.DateFormat = function() {
	// Do not use the constructor
	throw new Error();
};

sap.ui.core.format.DateFormat.oDateInfo = {
	oDefaultFormatOptions: {
		style: "medium"
	},
	aFallbackFormatOptions: [
		{style: "short"},
		{style: "medium"},
		{pattern: "yyyy-MM-dd"},
		{pattern: "yyyyMMdd"}
	],
	getPattern: function(oLocaleData, sStyle) {
		return oLocaleData.getDatePattern(sStyle);
	},
	oRequiredParts: {
		"text": true, "year": true, "weekYear": true, "month": true, "day": true
	}
};

sap.ui.core.format.DateFormat.oDateTimeInfo = {
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

sap.ui.core.format.DateFormat.oTimeInfo = {
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
 */
sap.ui.core.format.DateFormat.getInstance = function(oFormatOptions, oLocale) {
	return this.getDateInstance(oFormatOptions, oLocale);
};


/**
 * Get a date instance of the DateFormat, which can be used for formatting.
 *
 * @param {object} [oFormatOptions] Object which defines the format options
 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
 * @return {sap.ui.core.format.DateFormat} date instance of the DateFormat
 * @static
 * @public
 */
sap.ui.core.format.DateFormat.getDateInstance = function(oFormatOptions, oLocale) {
	return this.createInstance(oFormatOptions, oLocale, this.oDateInfo);
};

/**
 * Get a datetime instance of the DateFormat, which can be used for formatting.
 *
 * @param {object} [oFormatOptions] Object which defines the format options
 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
 * @return {sap.ui.core.format.DateFormat} datetime instance of the DateFormat
 * @static
 * @public
 */
sap.ui.core.format.DateFormat.getDateTimeInstance = function(oFormatOptions, oLocale) {
	return this.createInstance(oFormatOptions, oLocale, this.oDateTimeInfo);
};

/**
 * Get a time instance of the DateFormat, which can be used for formatting.
 *
 * @param {object} [oFormatOptions] Object which defines the format options
 * @param {sap.ui.core.Locale} [oLocale] Locale to ask for locale specific texts/settings
 * @return {sap.ui.core.format.DateFormat} time instance of the DateFormat
 * @static
 * @public
 */
sap.ui.core.format.DateFormat.getTimeInstance = function(oFormatOptions, oLocale) {
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
sap.ui.core.format.DateFormat.createInstance = function(oFormatOptions, oLocale, oInfo) {
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
	oFormat.oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);
	
	// Extend the default format options with custom format options and retrieve the pattern
	// from the LocaleData, in case it is not defined yet
	oFormat.oFormatOptions = jQuery.extend(false, {}, oInfo.oDefaultFormatOptions, oFormatOptions);
	if (!oFormat.oFormatOptions.pattern) {
		oFormat.oFormatOptions.pattern = oInfo.getPattern(oFormat.oLocaleData, oFormat.oFormatOptions.style);
	}

	// If fallback DateFormats have not been created yet, do it now
	if (!oInfo.aFallbackFormats) {
		oInfo.aFallbackFormats = [];
		jQuery.each(oInfo.aFallbackFormatOptions, function(i, oFormatOptions) {
			var oFallbackFormat = sap.ui.core.format.DateFormat.createInstance(oFormatOptions, oLocale, oInfo);
			oFallbackFormat.bIsFallback = true;
			oInfo.aFallbackFormats.push(oFallbackFormat);
		})
	}
	oFormat.aFallbackFormats = oInfo.aFallbackFormats;
	oFormat.oRequiredParts = oInfo.oRequiredParts;
	
	oFormat.init();
	return oFormat;
};

/**
 * Initialize date format
 */
sap.ui.core.format.DateFormat.prototype.init = function() {
	this.aMonthsAbbrev = this.oLocaleData.getMonths("abbreviated");
	this.aMonthsWide = this.oLocaleData.getMonths("wide");
	this.aDaysAbbrev = this.oLocaleData.getDays("abbreviated");
	this.aDaysWide = this.oLocaleData.getDays("wide");
	this.aDayPeriods = this.oLocaleData.getDayPeriods("abbreviated");
	this.aFormatArray = this.parseJavaDateFormat(this.oFormatOptions.pattern);
};

/**
 * Pattern elements
 */
sap.ui.core.format.DateFormat.prototype.oStates = {
	"G": "era",
	"y": "year",
	"Y": "weekYear",
	"M": "month",
	"w": "weekInYear",
	"W": "weekInMonth",
	"D": "dayInYear",
	"d": "day",
	"F": "dayOfWeekInMonth",
	"E": "dayNameInWeek",
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
 * @param {Date} oValue the vale to format
 * @param {boolean} bUTC whether to use UTC
 * @return {string} the formatted output value
 * @public
 */
sap.ui.core.format.DateFormat.prototype.format = function(oDate, bUTC) {
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
				} else if (oPart.iDigits >= 4){
					aBuffer.push(this.aDaysWide[iDay]);
				}
				break;
			case "dayNumberOfWeek":
				aBuffer.push(iDay || 7);
				break;
			case "month":
				if (oPart.iDigits == 3) {
					aBuffer.push(this.aMonthsAbbrev[iMonth]);
				} else if (oPart.iDigits >= 4){
					aBuffer.push(this.aMonthsWide[iMonth]);
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
				}
				else {
					sHours = String(iHours);
				}
				aBuffer.push(jQuery.sap.padLeft(sHours, "0", oPart.iDigits));
				break;
			case "hour0_11":
				if (iHours > 11) {
					sHours = String(iHours - 12);
				}
				else {
					sHours = String(iHours)
				}
				aBuffer.push(jQuery.sap.padLeft(sHours, "0", oPart.iDigits));
				break;
			case "hour1_12":
				if (iHours > 12) {
					sHours = String(iHours - 12);
				}
				else if (iHours == 0) {
					sHours = "12";
				}
				else {
					sHours = String(iHours)
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
				aBuffer.push(jQuery.sap.padLeft(String(iMilliseconds), "0", oPart.iDigits));
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
				else if (oDate.getTimezoneShort){
					aBuffer.push(oDate.getTimezoneShort());
					break;
				}
				aBuffer.push("GMT");
			case "timezoneISO8601":
				if (!bUTC && iTZOffset != 0) {
					aBuffer.push(bPositiveOffset ? "-" : "+");
					aBuffer.push(jQuery.sap.padLeft(String(iHourOffset), "0", 2));
					aBuffer.push(":");
					aBuffer.push(jQuery.sap.padLeft(String(iMinuteOffset), "0", 2));
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
 * @return {Date} the parsed value
 * @public
 */
sap.ui.core.format.DateFormat.prototype.parse = function(oValue) {
	var oDate = new Date(0),
		iIndex = 0,
		bError = false,
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
		var i;
		for (i = 0; i < aList.length; i++) {
			if (oValue.indexOf(aList[i], iIndex) == iIndex) {
				return aList[i];
			}
		}
		return null;
	}

	function findEntryIndex(aList) {
		var i;
		for (i = 0; i < aList.length; i++) {
			if (oValue.indexOf(aList[i], iIndex) == iIndex) {
				return i;
			}
		}
		return null;
	}

	function parseTZ(bISO) {
		var iTZFactor = oValue.charAt(iIndex) == "+" ? -1 : 1;
		iIndex++; //"+" or "-"
		sPart = findNumbers(2);
		var iTZDiffHour = parseInt(sPart, 10);
		iIndex = iIndex+2; //hh: 2 digits for hours
		if(bISO){
			iIndex++; //":"
		}
		sPart = findNumbers(2);
		iIndex = iIndex+2; //mm: 2 digits for minutes
		iTZDiff = parseInt(sPart, 10);
		iTZDiff = (iTZDiff + 60*iTZDiffHour)*iTZFactor;
	}
	
	function checkValid(sType, bPartInvalid) {
		if (sType in oRequiredParts && bPartInvalid) {
			bValid = false;
		}
	} 
	
	oValue = jQuery.trim(oValue);

	for (var i = 0; i < this.aFormatArray.length; i++) {
		oPart = this.aFormatArray[i];
		switch (oPart.sType) {
			case "text":
				if (oValue.indexOf(oPart.sValue, iIndex) == iIndex) {
					iIndex += oPart.sValue.length;
				} else {
					// only require text, if next part is also required
					checkValid(oPart.sType, this.aFormatArray[i+1].sType in oRequiredParts);
				}
				break;
			case "day":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				checkValid(oPart.sType, sPart === "");
				iIndex += sPart.length;
				iDay = parseInt(sPart, 10);
				break;
			case "dayNameInWeek":
				sPart = findEntry(this.aDaysWide);
				if (!sPart) {
					sPart = findEntry(this.aDaysAbbrev);
				}
				if (sPart) {
					iIndex += sPart.length;
				}
				break;
			case "dayNumberOfWeek":
				sPart = findNumbers(oPart.iDigits);
				iIndex += sPart.length;
				break;
			case "month":
				if (oPart.iDigits < 3) {
					sPart = findNumbers(Math.max(oPart.iDigits, 2));
					checkValid(oPart.sType, sPart === "");
					iMonth = parseInt(sPart, 10) - 1;
					iIndex += sPart.length;
				} else {
					iMonth = findEntryIndex(this.aMonthsWide);
					if (iMonth != null) {
						iIndex += this.aMonthsWide[iMonth].length;
					}
					else {
						iMonth = findEntryIndex(this.aMonthsAbbrev);
						if (iMonth != null) {
							iIndex += this.aMonthsAbbrev[iMonth].length;
						}
						else {
							checkValid(oPart.sType, true);
						}
					}
				}
				break;
			case "era":
				// TODO
				break;
			case "year":
			case "weekYear":
				if (oPart.iDigits == 1) {
					sPart = findNumbers(4);
					iIndex += sPart.length;
				}
				else if (oPart.iDigits == 2) {
					sPart = findNumbers(2);
					if (sPart.length == 2) {
						iYear = parseInt(sPart, 10);
						if (iYear < 90) {
							sPart = "20" + sPart;
						} else {
							sPart = "19" + sPart;
						}
						iIndex +=2;
					}
					else {
						iIndex += sPart.length;
					}
				}
				else {
					sPart = findNumbers(oPart.iDigits);
					iIndex += sPart.length;
				}
				checkValid(oPart.sType, sPart === "");
				iYear = parseInt(sPart, 10);
				break;
			case "weekInYear":
				// TODO
				break;
			case "hour0_23":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				checkValid(oPart.sType, sPart === "");
				iIndex += sPart.length;
				iHours = parseInt(sPart, 10);
				break;
			case "hour1_24":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				checkValid(oPart.sType, sPart === "");
				iIndex += sPart.length;
				iHours = parseInt(sPart, 10);
				if (iHours == 24) {
					iHours = 0;
				}
				break;
			case "hour0_11":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				checkValid(oPart.sType, sPart === "");
				iIndex += sPart.length;
				iHours = parseInt(sPart, 10);
				break;
			case "hour1_12":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				checkValid(oPart.sType, sPart === "");
				iIndex += sPart.length;
				iHours = parseInt(sPart, 10);
				if (iHours == 12) {
					iHours = 0;
				}
				break;
			case "minute":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				checkValid(oPart.sType, sPart === "");
				iIndex += sPart.length;
				iMinutes = parseInt(sPart, 10);
				break;
			case "second":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				checkValid(oPart.sType, sPart === "");
				iIndex += sPart.length;
				iSeconds = parseInt(sPart, 10);
				break;
			case "millisecond":
				sPart = findNumbers(Math.max(oPart.iDigits, 3));
				sPart = jQuery.sap.padRight(sPart, "0", 3);
				iIndex += sPart.length;
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
				var oTZ = oValue.substring(iIndex, iIndex+3);
				if(oTZ === "GMT" || oTZ === "UTC"){
					iIndex = iIndex+3;
				}else if(oValue.substring(iIndex, iIndex+2) === "UT"){
					iIndex = iIndex+2;
				}else if(oValue.charAt(iIndex) == "Z"){
					iIndex = iIndex+1;
					iTZDiff = 0;
					break;
				}else{
					jQuery.sap.log.error(oValue + " cannot be parsed correcly by sap.ui.core.format.DateFormat: The given timezone is not supported!");
					break;
				}
			case "timezoneISO8601": //e.g. -02:00 or +02:00
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
			oDate.setUTCFullYear(iYear || 1970);
			oDate.setUTCMonth(iMonth || 0);
			oDate.setUTCDate(iDay || 1);
			oDate.setUTCHours(iHours || 0);
			oDate.setUTCMinutes((iMinutes || 0) + iTZDiff);
			oDate.setUTCSeconds(iSeconds || 0);
			oDate.setUTCMilliseconds(iMilliseconds || 0);
		} else {
			oDate.setFullYear(iYear || 1970);
			oDate.setMonth(iMonth || 0);
			oDate.setDate(iDay || 1);
			oDate.setHours(iHours || 0);
			oDate.setMinutes(iMinutes || 0);
			oDate.setSeconds(iSeconds || 0);
			oDate.setMilliseconds(iMilliseconds || 0);
		}
		return oDate;
	}
	
	if (!this.bIsFallback) {
		jQuery.each(this.aFallbackFormats, function(i, oFallbackFormat) {
			oDate = oFallbackFormat.parse(oValue);
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
sap.ui.core.format.DateFormat.prototype.parseJavaDateFormat = function(sFormat) {
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
				}
				//  normal quote 'abcdef'
				else {
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
			else if (this.oStates[sCurChar]){
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
			}
			else {
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
