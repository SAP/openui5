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

sap.ui.core.format.DateFormat.oDefaultDateFormat = {
	style: "medium"
};

sap.ui.core.format.DateFormat.oDefaultDateTimeFormat = {
	style: "medium"
};

sap.ui.core.format.DateFormat.oDefaultTimeFormat = {
	style: "medium"
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
	var oFormat = this.createInstance(oFormatOptions, oLocale);
	oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultDateFormat, oFormatOptions);
	if (!oFormat.oFormatOptions.pattern) {
		oFormat.oFormatOptions.pattern = oFormat.oLocaleData.getDatePattern(oFormat.oFormatOptions.style);
	}
	oFormat.init();
	return oFormat;
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
	var oFormat = this.createInstance(oFormatOptions, oLocale);
	oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultDateTimeFormat, oFormatOptions);
	if (!oFormat.oFormatOptions.pattern) {
		var sDateTimePattern = oFormat.oLocaleData.getDateTimePattern(oFormat.oFormatOptions.style),
			sDatePattern = oFormat.oLocaleData.getDatePattern(oFormat.oFormatOptions.style),
			sTimePattern = oFormat.oLocaleData.getTimePattern(oFormat.oFormatOptions.style);
		oFormat.oFormatOptions.pattern = sDateTimePattern.replace("{1}", sDatePattern).replace("{0}", sTimePattern);
	}
	oFormat.init();
	return oFormat;
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
	var oFormat = this.createInstance(oFormatOptions, oLocale);
	oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultTimeFormat, oFormatOptions);
	if (!oFormat.oFormatOptions.pattern) {
		oFormat.oFormatOptions.pattern = oFormat.oLocaleData.getTimePattern(oFormat.oFormatOptions.style);
	}
	oFormat.init();
	return oFormat;
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
sap.ui.core.format.DateFormat.createInstance = function(oFormatOptions, oLocale) {
	var oFormat = jQuery.sap.newObject(this.prototype);
	if ( oFormatOptions instanceof sap.ui.core.Locale ) {
		oLocale = oFormatOptions;
		oFormatOptions = undefined;
	}
	if (!oLocale) {
		oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
	}
	oFormat.oLocale = oLocale;
	oFormat.oLocaleData = sap.ui.core.LocaleData.getInstance(oLocale);
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
 * @return {string} the formatted output value
 * @public
 */
sap.ui.core.format.DateFormat.prototype.format = function(oDate) {
	var aBuffer = [],
		oPart,
		iHour = oDate.getHours(),
		iTZOffset = Math.abs(oDate.getTimezoneOffset()),
		bPositiveOffset = oDate.getTimezoneOffset() > 0,
		iHourOffset = Math.floor(iTZOffset / 60),
		iMinuteOffset = iTZOffset % 60,
		sYear,
		sWeek,
		sResult;

	for (var i = 0; i < this.aFormatArray.length; i++) {
		oPart = this.aFormatArray[i];
		switch (oPart.sType) {
			case "text":
				aBuffer.push(oPart.sValue);
				break;
			case "day":
				aBuffer.push(jQuery.sap.padLeft(String(oDate.getDate()), "0", oPart.iDigits));
				break;
			case "dayNameInWeek":
				if (oPart.iDigits < 4) {
					aBuffer.push(this.aDaysAbbrev[oDate.getDay()]);
				} else if (oPart.iDigits >= 4){
					aBuffer.push(this.aDaysWide[oDate.getDay()]);
				}
				break;
			case "dayNumberOfWeek":
				aBuffer.push(oDate.getDay() || 7);
				break;
			case "month":
				if (oPart.iDigits == 3) {
					aBuffer.push(this.aMonthsAbbrev[oDate.getMonth()]);
				} else if (oPart.iDigits >= 4){
					aBuffer.push(this.aMonthsWide[oDate.getMonth()]);
				} else {
					aBuffer.push(jQuery.sap.padLeft(String(oDate.getMonth() + 1), "0", oPart.iDigits));
				}
				break;
			case "era":
				aBuffer.push("AD");
				break;
			case "year":
			case "weekYear":
				sYear = "" + oDate.getFullYear();
				if (oPart.iDigits == 2 && sYear.length > 2) {
					sYear = sYear.substr(sYear.length - 2);
				}
				aBuffer.push(jQuery.sap.padLeft(sYear, "0", oPart.iDigits));
				break;
			case "weekInYear":
				sWeek = "";
				if (oDate.getWeek) {
					sWeek += oDate.getWeek();
				}
				aBuffer.push(jQuery.sap.padLeft(sWeek, "0", oPart.iDigits));
				break;
			case "hour0_23":
				aBuffer.push(jQuery.sap.padLeft(String(iHour), "0", oPart.iDigits));
				break;
			case "hour1_24":
				if (iHour == 0) {
					iHour = 24;
				}
				aBuffer.push(jQuery.sap.padLeft(String(iHour), "0", oPart.iDigits));
				break;
			case "hour0_11":
				if (iHour > 11) {
					iHour -= 12;
				}
				aBuffer.push(jQuery.sap.padLeft(String(iHour), "0", oPart.iDigits));
				break;
			case "hour1_12":
				if (iHour > 12) {
					iHour -= 12;
				}
				else if (iHour == 0) {
					iHour = 12;
				}
				aBuffer.push(jQuery.sap.padLeft(String(iHour), "0", oPart.iDigits));
				break;
			case "minute":
				aBuffer.push(jQuery.sap.padLeft(String(oDate.getMinutes()), "0", oPart.iDigits));
				break;
			case "second":
				aBuffer.push(jQuery.sap.padLeft(String(oDate.getSeconds()), "0", oPart.iDigits));
				break;
			case "millisecond":
				aBuffer.push(jQuery.sap.padLeft(String(oDate.getMilliseconds()), "0", oPart.iDigits));
				break;
			case "amPmMarker":
				var iDayPeriod = oDate.getHours() < 12 ? 0 : 1;
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
				if (iTZOffset != 0) {
					aBuffer.push(bPositiveOffset ? "-" : "+");
					aBuffer.push(jQuery.sap.padLeft(String(iHourOffset), "0", 2));
					aBuffer.push(":");
					aBuffer.push(jQuery.sap.padLeft(String(iMinuteOffset), "0", 2));
				}
				break;
			case "timezoneRFC822":
				if (iTZOffset != 0) {
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
		iHour = null,
		iMinute = null,
		iSecond = null,
		iMillisecond = null,
		bPM = false,
		oPart,
		sPart,
		iTZDiff = null;

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

	for (var i = 0; i < this.aFormatArray.length; i++) {
		oPart = this.aFormatArray[i];
		switch (oPart.sType) {
			case "text":
				if (oValue.indexOf(oPart.sValue, iIndex) == iIndex) {
					iIndex += oPart.sValue.length;
				}
				break;
			case "day":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
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
				iYear = parseInt(sPart, 10);
				break;
			case "weekInYear":
				// TODO
				break;
			case "hour0_23":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				iIndex += sPart.length;
				iHour = parseInt(sPart, 10);
				break;
			case "hour1_24":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				iIndex += sPart.length;
				iHour = parseInt(sPart, 10);
				if (iHour == 24) {
					iHour = 0;
				}
				break;
			case "hour0_11":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				iIndex += sPart.length;
				iHour = parseInt(sPart, 10);
				break;
			case "hour1_12":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				iIndex += sPart.length;
				iHour = parseInt(sPart, 10);
				if (iHour == 12) {
					iHour = 0;
				}
				break;
			case "minute":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				iIndex += sPart.length;
				iMinute = parseInt(sPart, 10);
				break;
			case "second":
				sPart = findNumbers(Math.max(oPart.iDigits, 2));
				iIndex += sPart.length;
				iSecond = parseInt(sPart, 10);
				break;
			case "millisecond":
				sPart = findNumbers(Math.max(oPart.iDigits, 3));
				sPart = jQuery.sap.padRight(sPart, "0", 3);
				iIndex += sPart.length;
				iMillisecond = parseInt(sPart, 10);
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
	}
	if (bPM) {
		iHour += 12;
	}
	if(iTZDiff != null){
		oDate.setUTCFullYear(iYear || 1970);
		oDate.setUTCMonth(iMonth || 0);
		oDate.setUTCDate(iDay || 1);
		oDate.setUTCHours(iHour || 0);
		oDate.setUTCMinutes((iMinute || 0) + iTZDiff);
		oDate.setUTCSeconds(iSecond || 0);
		oDate.setUTCMilliseconds(iMillisecond || 0);
	}else{
		oDate.setFullYear(iYear || 1970);
		oDate.setMonth(iMonth || 0);
		oDate.setDate(iDay || 1);
		oDate.setHours(iHour || 0);
		oDate.setMinutes(iMinute || 0);
		oDate.setSeconds(iSecond || 0);
		oDate.setMilliseconds(iMillisecond || 0);
	}

	return oDate;
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
