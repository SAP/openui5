/*!
 * ${copyright}
 */

// Provides class sap.ui.core.format.NumberFormat
sap.ui.define(['jquery.sap.global', 'sap/ui/core/LocaleData'],
	function(jQuery, LocaleData) {
	"use strict";


	/**
	 * Format classes
	 *
	 * @namespace
	 * @name sap.ui.core.format
	 * @public
	 */
	
	/**
	 * Constructor for NumberFormat - must not be used: To get a NumberFormat instance, please use getInstance, getFloatInstance or getIntegerInstance.
	 *
	 * @class
	 * The NumberFormat is a static class for formatting and parsing numeric values according
	 * to a set of format options.
	 *
	 * Supported format options:
	 * <ul>
	 * <li>minIntegerDigits: minimal number of non-fraction digits</li>
	 * <li>maxIntegerDigits: maximum number of non-fraction digits</li>
	 * <li>minFractionDigits: minimal number of fraction digits</li>
	 * <li>maxFractionDigits: maximum number of fraction digits</li>
	 * <li>pattern: CLDR number pattern</li>
	 * <li>groupingEnabled: enable grouping (show the grouping separators</li>
	 * <li>groupingSeparator: the used grouping separator</li>
	 * <li>decimalSeparator: the used decimal separator</li>
	 * <li>plusSign: the used plus symbol</li>
	 * <li>minusSign: the used minus symbol</li>
	 * <li>showMeasure: Show the measure according to the format in the formatted string</li>
	 * <li>style either empty or 'short, 'long' or 'standard' (based on CLDR decimalFormat)</li>
	 * </ul>
	 * For format options which are not specified default values according to the type and locale settings are used.
	 *
	 * @public
	 * @name sap.ui.core.format.NumberFormat
	 */
	var NumberFormat = sap.ui.base.Object.extend("sap.ui.core.format.NumberFormat", /** @lends sap.ui.core.format.NumberFormat.prototype */ {
		constructor : function(oFormatOptions) {
			// Do not use the constructor
			throw new Error();
		}
	});

	NumberFormat.INTEGER = 0;
	NumberFormat.FLOAT = 1;
	NumberFormat.CURRENCY = 2;
	NumberFormat.PERCENT = 3;

	/*
	 * Default format options for Integer
	 * @name sap.ui.core.format.NumberFormat.oDefaultIntegerFormat
	 */
	NumberFormat.oDefaultIntegerFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		minFractionDigits: 0,
		maxFractionDigits: 0,
		groupingEnabled: false,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		isInteger: true,
		type: NumberFormat.INTEGER,
		showMeasure: false,
		style: "standard"
	};
	
	/*
	 * Default format options for Float
	 * @name sap.ui.core.format.NumberFormat.oDefaultFloatFormat
	 */
	NumberFormat.oDefaultFloatFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		minFractionDigits: 0,
		maxFractionDigits: 99,
		groupingEnabled: true,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		isInteger: false,
		type: NumberFormat.FLOAT,
		showMeasure: false,
		style: "standard"
	};
	
	/*
	 * Default format options for Currency
	 * @name sap.ui.core.format.NumberFormat.oDefaultCurrencyFormat
	 */
	NumberFormat.oDefaultCurrencyFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		minFractionDigits: 2,
		maxFractionDigits: 2,
		groupingEnabled: true,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		isInteger: false,
		type: NumberFormat.CURRENCY,
		showMeasure: true,
		style: "standard"
	};
	
	/**
	 * An alias for {@link #getFloatInstance}.
	 * 
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.NumberFormat} float instance of the NumberFormat
	 * 
	 * @name sap.ui.core.format.NumberFormat.getInstance
	 * @function
	 */
	NumberFormat.getInstance = function(oFormatOptions, oLocale) {
		return this.getFloatInstance(oFormatOptions, oLocale);
	};
	
	/**
	 * Get a float instance of the NumberFormat, which can be used for formatting.
	 * 
	 * If no locale is given, the currently configured 
	 * {@link sap.ui.core.Configuration.FormatSettings#getFormatLocale formatLocale} will be used. 
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.NumberFormat} float instance of the NumberFormat
	 * @static
	 * @public
	 * @name sap.ui.core.format.NumberFormat.getFloatInstance
	 * @function
	 */
	NumberFormat.getFloatInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, NumberFormat.FLOAT);
		
		oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultFloatFormat, oLocaleFormatOptions, oFormatOptions);
		if (oFormatOptions && oFormatOptions.pattern) {
			oFormat.oFormatOptions = jQuery.extend(false, oFormat.oFormatOptions, this.parseNumberPattern(oFormatOptions.pattern));
		}
		return oFormat;
	};
	
	/**
	 * Get an integer instance of the NumberFormat, which can be used for formatting.
	 *
	 * If no locale is given, the currently configured 
	 * {@link sap.ui.core.Configuration.FormatSettings#getFormatLocale formatLocale} will be used. 
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.NumberFormat} integer instance of the NumberFormat
	 * @static
	 * @public
	 * @name sap.ui.core.format.NumberFormat.getIntegerInstance
	 * @function
	 */
	NumberFormat.getIntegerInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, NumberFormat.INTEGER);
		
		oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultIntegerFormat, oLocaleFormatOptions, oFormatOptions);
		if (oFormatOptions && oFormatOptions.pattern) {
			oFormat.oFormatOptions = jQuery.extend(false, oFormat.oFormatOptions, this.parseNumberPattern(oFormatOptions.pattern));
		}
		return oFormat;
	};
	
	/**
	 * Get an currency instance of the NumberFormat, which can be used for formatting.
	 *
	 * If no locale is given, the currently configured 
	 * {@link sap.ui.core.Configuration.FormatSettings#getFormatLocale formatLocale} will be used. 
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.NumberFormat} integer instance of the NumberFormat
	 * @static
	 * @public
	 * @name sap.ui.core.format.NumberFormat.getCurrencyInstance
	 * @function
	 */
	NumberFormat.getCurrencyInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, NumberFormat.CURRENCY);

		oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultCurrencyFormat, oLocaleFormatOptions, oFormatOptions);
		if (oFormatOptions && oFormatOptions.pattern) {
			oFormat.oFormatOptions = jQuery.extend(false, oFormat.oFormatOptions, this.parseNumberPattern(oFormatOptions.pattern));
		}
		return oFormat;
	};
	
	/**
	 * Create an instance of the NumberFormat.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @return {sap.ui.core.format.NumberFormat} integer instance of the NumberFormat
	 * @static
	 * @private
	 * @name sap.ui.core.format.NumberFormat.createInstance
	 * @function
	 */
	NumberFormat.createInstance = function(oFormatOptions, oLocale) {
		var oFormat = jQuery.sap.newObject(this.prototype);
		if ( oFormatOptions instanceof sap.ui.core.Locale ) {
			oLocale = oFormatOptions;
			oFormatOptions = undefined;
		}
		if (!oLocale) {
			oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
		}
		oFormat.oLocale = oLocale;
		oFormat.oLocaleData = LocaleData.getInstance(oLocale);
		return oFormat;
	};
	
	
	/**
	 * Get locale dependent default format options.
	 *
	 * @static
	 * @name sap.ui.core.format.NumberFormat.getLocaleFormatOptions
	 * @function
	 */
	NumberFormat.getLocaleFormatOptions = function(oLocaleData, iType) {
		var oLocaleFormatOptions = {},
			sNumberPattern;
		
		if (iType == NumberFormat.CURRENCY) {
			sNumberPattern = oLocaleData.getCurrencyPattern();
			oLocaleFormatOptions = this.parseNumberPattern(sNumberPattern);
		}
		
		oLocaleFormatOptions.plusSign = oLocaleData.getNumberSymbol("plusSign");
		oLocaleFormatOptions.minusSign = oLocaleData.getNumberSymbol("minusSign");
		oLocaleFormatOptions.decimalSeparator = oLocaleData.getNumberSymbol("decimal");
		oLocaleFormatOptions.groupingSeparator = oLocaleData.getNumberSymbol("group");
		oLocaleFormatOptions.pattern = sNumberPattern;
		
		return oLocaleFormatOptions;
	};
	
	/**
	 * Get digit information from number format.
	 *
	 * @static
	 * @name sap.ui.core.format.NumberFormat.parseNumberFormat
	 * @function
	 */
	NumberFormat.parseNumberPattern = function(sFormatString) {
		var iMinIntegerDigits = 0;
		var iMinFractionDigits = 0;
		var iMaxFractionDigits = 0;
		var bGroupingEnabled = false;
		
		var iSection = 0;

		for (var i = 0; i < sFormatString.length; i++) {
			var sCharacter = sFormatString[i];
			
			if (sCharacter === ",") {
				bGroupingEnabled = true;
				continue;
			} else if (sCharacter === ".") {
				iSection = 1;
				continue;
			} else if (iSection == 0 && sCharacter === "0") {
				iMinIntegerDigits++;
			} else if (iSection == 1) {
				if (sCharacter === "0") {
					iMinFractionDigits++;
					iMaxFractionDigits++;
				} else if (sCharacter === "#") {
					iMaxFractionDigits++;
				}
			}
			
		}
		
		return {
			minIntegerDigits: iMinIntegerDigits,
			minFractionDigits: iMinFractionDigits,
			maxFractionDigits: iMaxFractionDigits,
			groupingEnabled: bGroupingEnabled
		};
	};
	
	/**
	 * Format a number according to the given format options.
	 *
	 * @param {number} oValue the number to format
	 * @param {string} sMeasure a measure which has an impact on the formatting
	 * @return {string} the formatted output value
	 * @public
	 * @name sap.ui.core.format.NumberFormat#format
	 * @function
	 */
	NumberFormat.prototype.format = function(oValue, sMeasure) {
		var sNumber = this.convertToDecimal(oValue),
			sIntegerPart = "",
			sFractionPart = "",
			sGroupedIntegerPart = "",
			sResult = "",
			iPosition = 0,
			iLength = 0,
			bNegative = oValue < 0,
			iDotPos = -1,
			oOptions = this.oFormatOptions;
	
		if (sNumber == "NaN") {
			return sNumber;
		}

		var oShortFormat = getShortenedFormat(oValue, this.oFormatOptions.style, this.oLocaleData);
		if (oShortFormat) {
			var fShortValue =  oValue / oShortFormat.magnitude;
			sNumber = this.convertToDecimal(fShortValue);
			if (oShortFormat.decimals !== undefined) {
				oOptions.maxFractionDigits = oShortFormat.decimals;
				oOptions.minFractionDigits = oShortFormat.decimals;
			}
		}

		//handle measure
		if (oOptions.type == NumberFormat.CURRENCY) {
			var iDigits = this.oLocaleData.getCurrencyDigits(sMeasure);
			oOptions.maxFractionDigits = iDigits;
			oOptions.minFractionDigits = iDigits;
		}

		// if number is negative remove minus
		if (bNegative) {
			sNumber = sNumber.substr(1);
		}
	
		// if number contains fraction, extract it
		iDotPos = sNumber.indexOf(".");
		if (iDotPos > -1) {
			sIntegerPart = sNumber.substr(0, iDotPos);
			sFractionPart = sNumber.substr(iDotPos + 1);
		} else {
			sIntegerPart = sNumber;
		}
	
		// integer part length
		if (sIntegerPart.length < oOptions.minIntegerDigits) {
			sIntegerPart = jQuery.sap.padLeft(sIntegerPart, "0", oOptions.minIntegerDigits);
		}
		else if (sIntegerPart.length > oOptions.maxIntegerDigits) {
			sIntegerPart = jQuery.sap.padLeft("", "?", oOptions.maxIntegerDigits);
		}
	
		// fraction part length
		if (sFractionPart.length < oOptions.minFractionDigits) {
			sFractionPart = jQuery.sap.padRight(sFractionPart, "0", oOptions.minFractionDigits);
		}
		else if (sFractionPart.length > oOptions.maxFractionDigits) {
			sFractionPart = sFractionPart.substr(0, oOptions.maxFractionDigits);
		}
	
		// grouping
		iLength = sIntegerPart.length;
		if (oOptions.groupingEnabled && iLength > 3) {
			iPosition = iLength % 3 || 3;
			sGroupedIntegerPart = sIntegerPart.substr(0, iPosition);
			while (iPosition < sIntegerPart.length) {
				sGroupedIntegerPart += oOptions.groupingSeparator;
				sGroupedIntegerPart += sIntegerPart.substr(iPosition, 3);
				iPosition += 3;
			}
			sIntegerPart = sGroupedIntegerPart;
		}
	
		// combine
		if (bNegative) {
			sResult = oOptions.minusSign;
		}
		sResult += sIntegerPart;
		if (sFractionPart) {
			sResult += oOptions.decimalSeparator + sFractionPart;
		}

		if (oShortFormat && oShortFormat.formatString) {
			//inject formatted shortValue in the formatString
			sResult = oShortFormat.formatString.replace(oShortFormat.valueSubString, sResult);
			//formatString may contain '.' (quoted to differentiate them decimal separator)
			//which must be replaced with .
			sResult = sResult.replace(/'.'/g, ".");
		}

		if (sMeasure && oOptions.showMeasure) {
			if (oOptions.type == NumberFormat.CURRENCY) {
				var sPattern = oOptions.pattern;
				
				sPattern = sPattern.replace(/\u00a4/, this.oLocaleData.getCurrencySymbol(sMeasure));
				sPattern = sPattern.replace(/[0#.,]+/, sResult);
				
				sResult = sPattern;
			}
		}
	
		if (sap.ui.getCore().getConfiguration().getOriginInfo()) {
			sResult = new String(sResult);
			sResult.originInfo = {
				source: "Common Locale Data Repository",
				locale: this.oLocale.toString()
			};
		}
	
		return sResult;
	
	};
	
	/**
	 * Parse a string which is formatted according to the given format options.
	 *
	 * @param {string} sValue the string containing a formatted numeric value
	 * @return {number} the parsed value
	 * @public
	 * @name sap.ui.core.format.NumberFormat#parse
	 * @function
	 */
	NumberFormat.prototype.parse = function(sValue) {
		var oOptions = this.oFormatOptions,
			sRegExpFloat = "^\\s*([+-]?(?:[0-9\\" + oOptions.groupingSeparator + "]+|[0-9\\" + oOptions.groupingSeparator + "]*\\" + oOptions.decimalSeparator + "[0-9]+)([eE][+-][0-9]+)?)\\s*$",
			sRegExpInt = "^\\s*([+-]?[0-9\\" + oOptions.groupingSeparator + "]+)\\s*$",
			oGroupingRegExp = new RegExp("\\" + oOptions.groupingSeparator, "g"),
			oDecimalRegExp = new RegExp("\\" + oOptions.decimalSeparator, "g"),
			oRegExp,
			oResult = 0;

		// remove all white spaces because when grouping separator is a non-breaking space (russian and french for example)
		// user will not input it this way. Also white spaces or grouping separator can be ignored by determining the value
		sValue = sValue.replace(/\s/g, "");

		var oShort = getNumberFromShortened(sValue, this.oFormatOptions.style, this.oLocaleData);
		sValue = oShort.number;

		// Check for valid syntax
		if (oOptions.isInteger) {
			oRegExp = new RegExp(sRegExpInt);
		} else {
			oRegExp = new RegExp(sRegExpFloat);
		}
		if (!oRegExp.test(sValue)) {
			return NaN;
		}

		// Remove grouping separator and replace locale dependant decimal separator, 
		// before calling parseInt/parseFloat
		sValue = sValue.replace(oGroupingRegExp, "");
		if (oOptions.isInteger) {
			oResult = parseInt(sValue, 10);
		} else {
			sValue = sValue.replace(oDecimalRegExp, ".");
			oResult = parseFloat(sValue);
		}

		if (oShort.factor > 1) {
			oResult = oResult * oShort.factor;
		}

		return oResult;
	};

	/**
	 * Convert to decimal representation
	 * Floats larger than 1e+20 or smaller than 1e-6 are shown in exponential format,
	 * but need to be converted to decimal format for further formatting
	 * 
	 * @param {float} fValue
	 * @private
	 * @name sap.ui.core.format.NumberFormat#convertToDecimal
	 * @function
	 */
	NumberFormat.prototype.convertToDecimal = function(fValue) {
		var sValue = "" + fValue,
			bNegative, sBase, iDecimalLength, iFractionLength, iExponent, iPos;
		if (sValue.indexOf("e") == -1 && sValue.indexOf("E") == -1) {
			return sValue;
		}
		var aResult = sValue.match(/^([+-]?)((\d+)(?:\.(\d+))?)[eE]([+-]?\d+)$/);
		bNegative = aResult[1] == "-";
		sBase = aResult[2].replace(/\./g,"");
		iDecimalLength = aResult[3] ? aResult[3].length : 0;
		iFractionLength = aResult[4] ? aResult[4].length : 0;
		iExponent = parseInt(aResult[5], 10);
		
		if (iExponent > 0) {
			if (iExponent < iFractionLength) {
				iPos = iDecimalLength + iExponent;
				sValue = sBase.substr(0, iPos) + "." + sBase.substr(iPos);
			} else {
				sValue = sBase;
				iExponent -= iFractionLength;
				for (var i = 0; i < iExponent; i++) {
					sValue += "0";
				}
			}
		} else {
			if (-iExponent < iDecimalLength) {
				iPos = iDecimalLength + iExponent;
				sValue = sBase.substr(0, iPos) + "." + sBase.substr(iPos);
			} else {
				sValue = sBase;
				iExponent += iDecimalLength;
				for (var i = 0; i > iExponent; i--) {
					sValue = "0" + sValue;
				}
				sValue = "0." + sValue;
			}
		}
		if (bNegative) {
			sValue = "-" + sValue;
		}
		return sValue;
	};

	function getShortenedFormat(fValue, sStyle, oLocaleData) {

		var oShortFormat;

		if (sStyle != "short" && sStyle != "long") {
			return oShortFormat;
		}

		var iKey = 1;
		while ( Math.abs(fValue) >= iKey * 10 && iKey < 1e14) {
			iKey = iKey * 10;
		}

		// determine plural version of format
		var fShortNumber = fValue / iKey;
		var sPlural = "other";
		if (fShortNumber == 0) {
			sPlural = "zero";
		} else if (fShortNumber == 1) {
			sPlural = "one";
		} else if (fShortNumber == 2) {
			sPlural = "two";
		} else if (fShortNumber > 2 && fShortNumber <= 5) {
			sPlural = "few";
		} else if (fShortNumber > 5 && fShortNumber <= 10) {
			sPlural = "many";
		}

		var sCldrFormat = oLocaleData.getDecimalFormat(sStyle, iKey.toString(), sPlural);

		if (!sCldrFormat) {
			return oShortFormat;
		}

		oShortFormat = {};
		if (!sCldrFormat ||  sCldrFormat == "0") {
			//no format or special "0" format => number doesn't need to be shortified
			oShortFormat.magnitude = 1;
		}else {
			oShortFormat.formatString = sCldrFormat;
			var match = sCldrFormat.match(/0+\.*0*/);
			if (match) {
				//to get magnitude, we need to remove from key the number of zeros
				//contained in valueSubString before decimal separator minus 1
				//    "0.0" => magnitude = key
				//    "00"  => magnitude = key / 10
				//    "000" => magnitude = key / 100
				oShortFormat.valueSubString = match[0];
				var decimalSeparatorPosition =  oShortFormat.valueSubString.indexOf(".");
				if (decimalSeparatorPosition == -1) {
					oShortFormat.decimals = 0;
					oShortFormat.magnitude = iKey * Math.pow(10,1 - oShortFormat.valueSubString.length);
				}else {
					oShortFormat.decimals = oShortFormat.valueSubString.length -  decimalSeparatorPosition - 1;
					oShortFormat.magnitude = iKey * Math.pow(10,1 - decimalSeparatorPosition);
				}
			}else {
				//value pattern has not be recognized
				//we cannot shortify
				oShortFormat.magnitude = 1;
			}
		}

		return oShortFormat;

	}

	function getNumberFromShortened(sValue, sStyle, oLocaleData) {

		var sNumber;
		var iFactor = 1;

		if (sStyle != "short" && sStyle != "long") {
			return {number: sValue, factor: iFactor};
		}

		var iKey = 10;
		var sPlural;
		var sCldrFormat;
		while ( iKey < 1e14) {
			for (var i = 0; i < 6; i++) {
				switch (i) {
				case 0:
					sPlural = "zero";
					break;

				case 1:
					sPlural = "one";
					break;

				case 2:
					sPlural = "two";
					break;

				case 3:
					sPlural = "few";
					break;

				case 4:
					sPlural = "many";
					break;

				default:
					sPlural = "other";
				}

				sCldrFormat = oLocaleData.getDecimalFormat(sStyle, iKey.toString(), sPlural);

				if (sCldrFormat) {
					// Note: CLDR uses a non-breaking space in the forma tstring 
					sCldrFormat = sCldrFormat.replace(/[\s\u00a0]/g, "");
					var match = sCldrFormat.match(/0+\.*0*/);
					if (match) {
						// determine unit -> may be on the beginning e.g. for he
						var sValueSubString = match[0];
						var sUnit = sCldrFormat.replace(sValueSubString, "");
						var iIndex = sValue.indexOf(sUnit);
						if (iIndex >= 0) {
							// parse the number part like every other number and then use the factor to get the real number
							sNumber = sValue.replace(sUnit, "");
							iFactor = iKey;
							break;
						}
					}
				}
			}

			if (sNumber) {
				break;
			}

			iKey = iKey * 10;
		}

		if (!sNumber) {
			// no match found -> use given value
			sNumber = sValue;
		}

		return {number: sNumber, factor: iFactor};

	}

	return NumberFormat;

}, /* bExport= */ true);
