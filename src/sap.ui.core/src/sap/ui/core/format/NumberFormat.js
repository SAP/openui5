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
	 * <li>decimals: define the number of decimal in the formatted string</li>
	 * <li>shortDecimals: define the number of decimal in the shortified format string. If this isn't specified, the decimal options is used</li>
	 * <li>pattern: CLDR number pattern</li>
	 * <li>groupingEnabled: enable grouping (show the grouping separators)</li>
	 * <li>groupingSeparator: the used grouping separator</li>
	 * <li>decimalSeparator: the used decimal separator</li>
	 * <li>plusSign: the used plus symbol</li>
	 * <li>minusSign: the used minus symbol</li>
	 * <li>showMeasure: show the measure according to the format in the formatted string</li>
	 * <li>currencyCode: whether the currency is shown as code in currency format. The currency symbol is displayed when this is set to false and there's symbol defined for the given currency code.
	 * <li>currencyContext: either 'standard' (the default format) or 'accounting' for an accounting specific currency display
	 * <li>style: either empty or 'short, 'long' or 'standard' (based on CLDR decimalFormat)</li>
	 * <li>roundingMode: specifies a rounding behavior for discarding the digits after the maximum fraction digits defined by maxFractionDigits.
	 *  Rounding will only be applied, if the passed value if of type number. This can be assigned by value in
	 *  {@link sap.ui.core.format.NumberFormat.RoundingMode RoundingMode} or a function which will be used for rounding the number. The function
	 *  is called with two parameters: the number and how many decimal digits should be reserved.</li>
	 * </ul>
	 * For format options which are not specified default values according to the type and locale settings are used.
	 *
	 * @public
	 * @alias sap.ui.core.format.NumberFormat
	 */
	var NumberFormat = sap.ui.base.Object.extend("sap.ui.core.format.NumberFormat", /** @lends sap.ui.core.format.NumberFormat.prototype */ {
		constructor : function(oFormatOptions) {
			// Do not use the constructor
			throw new Error();
		}
	});

	/**
	 * Internal enumeration to differentiate number types
	 */
	var mNumberType = {
		INTEGER: "integer",
		FLOAT: "float",
		CURRENCY: "currency",
		PERCENT: "percent"
	};

	/**
	 * Internal enumeration for type of number grouping
	 */
	var mGroupingType = {
		ARABIC: "arabic",
		INDIAN: "indian"
	};

	/**
	 * Specifies a rounding behavior for numerical operations capable of discarding precision. Each rounding mode in this object indicates how the least
	 * significant returned digits of rounded result is to be calculated.
	 *
	 * @public
	 * @enum {string}
	 * @alias sap.ui.core.format.NumberFormat.RoundingMode
	 */
	var mRoundingMode = {
		/**
		 * Rounding mode to round towards negative infinity
		 * @public
		 */
		FLOOR: "floor",
		/**
		 * Rounding mode to round towards positive infinity
		 * @public
		 */
		CEILING: "ceiling",
		/**
		 * Rounding mode to round towards zero
		 * @public
		 */
		TOWARDS_ZERO: "towards_zero",
		/**
		 * Rounding mode to round away from zero
		 * @public
		 */
		AWAY_FROM_ZERO: "away_from_zero",
		/**
		 * Rounding mode to round towards the nearest neighbor unless both neighbors are equidistant, in which case round towards negative infinity.
		 * @public
		 */
		HALF_FLOOR: "half_floor",
		/**
		 * Rounding mode to round towards the nearest neighbor unless both neighbors are equidistant, in which case round towards positive infinity.
		 * @public
		 */
		HALF_CEILING: "half_ceiling",
		/**
		 * Rounding mode to round towards the nearest neighbor unless both neighbors are equidistant, in which case round towards zero.
		 * @public
		 */
		HALF_TOWARDS_ZERO: "half_towards_zero",
		/**
		 * Rounding mode to round towards the nearest neighbor unless both neighbors are equidistant, in which case round away from zero.
		 * @public
		 */
		HALF_AWAY_FROM_ZERO: "half_away_from_zero"
	};

	var mRoundingFunction = {};
	mRoundingFunction[mRoundingMode.FLOOR] = Math.floor;
	mRoundingFunction[mRoundingMode.CEILING] = Math.ceil;
	mRoundingFunction[mRoundingMode.TOWARDS_ZERO] = function(nValue) {
		return nValue > 0 ? Math.floor(nValue) : Math.ceil(nValue);
	};
	mRoundingFunction[mRoundingMode.AWAY_FROM_ZERO] = function(nValue) {
		return nValue > 0 ? Math.ceil(nValue) : Math.floor(nValue);
	};
	mRoundingFunction[mRoundingMode.HALF_TOWARDS_ZERO] = function(nValue) {
		return nValue > 0 ? Math.ceil(nValue - 0.5) : Math.floor(nValue + 0.5);
	};
	mRoundingFunction[mRoundingMode.HALF_AWAY_FROM_ZERO] = function(nValue) {
		return nValue > 0 ? Math.floor(nValue + 0.5) : Math.ceil(nValue - 0.5);
	};
	mRoundingFunction[mRoundingMode.HALF_FLOOR] = function(nValue) {
		return Math.ceil(nValue - 0.5);
	};
	mRoundingFunction[mRoundingMode.HALF_CEILING] = Math.round;

	NumberFormat.RoundingMode = mRoundingMode;

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
		groupingType: mGroupingType.ARABIC,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		isInteger: true,
		type: mNumberType.INTEGER,
		showMeasure: false,
		style: "standard",
		roundingMode: NumberFormat.RoundingMode.TOWARDS_ZERO
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
		groupingType: mGroupingType.ARABIC,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		isInteger: false,
		type: mNumberType.FLOAT,
		showMeasure: false,
		style: "standard",
		roundingMode: NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO
	};

	/*
	* Default format options for Percent
	* @name sap.ui.core.format.NumberFormat.oDefaultFloatFormat
	*/
	NumberFormat.oDefaultPercentFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		minFractionDigits: 0,
		maxFractionDigits: 99,
		groupingEnabled: true,
		groupingType: mGroupingType.ARABIC,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		percentSign: "%",
		isInteger: false,
		type: mNumberType.PERCENT,
		showMeasure: false,
		style: "standard",
		roundingMode: NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO
	};

	/*
	 * Default format options for Currency
	 * @name sap.ui.core.format.NumberFormat.oDefaultCurrencyFormat
	 */
	NumberFormat.oDefaultCurrencyFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		// the default value for min/maxFractionDigits is defined in oLocaleData.getCurrencyDigits
		// they need to be left undefined here in order to detect whether they are set from outside
		groupingEnabled: true,
		groupingType: mGroupingType.ARABIC,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		isInteger: false,
		type: mNumberType.CURRENCY,
		showMeasure: true,
		currencyCode: true,
		currencyContext: 'standard',
		style: "standard",
		roundingMode: NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO
	};

	/**
	 * An alias for {@link #getFloatInstance}.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.NumberFormat} float instance of the NumberFormat
	 *
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
	 * <p>
	 * This instance has HALF_AWAY_FROM_ZERO set as default rounding mode.
	 * Please set the roundingMode property in oFormatOptions to change the
	 * default value.
	 * </p>
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.NumberFormat} float instance of the NumberFormat
	 * @static
	 * @public
	 */
	NumberFormat.getFloatInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, mNumberType.FLOAT);

		oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultFloatFormat, oLocaleFormatOptions, oFormatOptions);
		return oFormat;
	};

	/**
	 * Get an integer instance of the NumberFormat, which can be used for formatting.
	 *
	 * If no locale is given, the currently configured
	 * {@link sap.ui.core.Configuration.FormatSettings#getFormatLocale formatLocale} will be used.
	 *
	 * <p>
	 * This instance has TOWARDS_ZERO set as default rounding mode.
	 * Please set the roundingMode property in oFormatOptions to change the
	 * default value.
	 * </p>
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.NumberFormat} integer instance of the NumberFormat
	 * @static
	 * @public
	 */
	NumberFormat.getIntegerInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, mNumberType.INTEGER);

		oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultIntegerFormat, oLocaleFormatOptions, oFormatOptions);
		return oFormat;
	};

	/**
	 * Get a currency instance of the NumberFormat, which can be used for formatting.
	 *
	 * If no locale is given, the currently configured
	 * {@link sap.ui.core.Configuration.FormatSettings#getFormatLocale formatLocale} will be used.
	 *
	 * <p>
	 * This instance has HALF_AWAY_FROM_ZERO set as default rounding mode.
	 * Please set the roundingMode property in oFormatOptions to change the
	 * default value.
	 * </p>
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.NumberFormat} integer instance of the NumberFormat
	 * @static
	 * @public
	 */
	NumberFormat.getCurrencyInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			sContext = oFormatOptions && oFormatOptions.currencyContext,
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, mNumberType.CURRENCY, sContext);

		oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultCurrencyFormat, oLocaleFormatOptions, oFormatOptions);
		return oFormat;
	};

	/**
	 * Get a percent instance of the NumberFormat, which can be used for formatting.
	 *
	 * If no locale is given, the currently configured
	 * {@link sap.ui.core.Configuration.FormatSettings#getFormatLocale formatLocale} will be used.
	 *
	 * <p>
	 * This instance has HALF_AWAY_FROM_ZERO set as default rounding mode.
	 * Please set the roundingMode property in oFormatOptions to change the
	 * default value.
	 * </p>
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
	 * @return {sap.ui.core.format.NumberFormat} integer instance of the NumberFormat
	 * @static
	 * @public
	*/
	NumberFormat.getPercentInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, mNumberType.PERCENT);

		oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultPercentFormat, oLocaleFormatOptions, oFormatOptions);
		return oFormat;
	};

	/**
	 * Create an instance of the NumberFormat.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options
	 * @return {sap.ui.core.format.NumberFormat} integer instance of the NumberFormat
	 * @static
	 * @private
	 */
	NumberFormat.createInstance = function(oFormatOptions, oLocale) {
		var oFormat = jQuery.sap.newObject(this.prototype),
			oPatternOptions;
		if ( oFormatOptions instanceof sap.ui.core.Locale ) {
			oLocale = oFormatOptions;
			oFormatOptions = undefined;
		}
		if (!oLocale) {
			oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
		}
		oFormat.oLocale = oLocale;
		oFormat.oLocaleData = LocaleData.getInstance(oLocale);

		// If a pattern is defined in the format option, parse it and add options
		if (oFormatOptions && oFormatOptions.pattern) {
			oPatternOptions = this.parseNumberPattern(oFormatOptions.pattern);
			jQuery.each(oPatternOptions, function(sName, vOption) {
				oFormatOptions[sName] = vOption;
			});
		}
		return oFormat;
	};


	/**
	 * Get locale dependent default format options.
	 *
	 * @static
	 */
	NumberFormat.getLocaleFormatOptions = function(oLocaleData, iType, sContext) {
		var oLocaleFormatOptions = {},
			sNumberPattern;

		switch (iType) {
			case mNumberType.PERCENT:
				sNumberPattern = oLocaleData.getPercentPattern();
				break;
			case mNumberType.CURRENCY:
				sNumberPattern = oLocaleData.getCurrencyPattern(sContext);
				break;
			default:
				sNumberPattern = oLocaleData.getDecimalPattern();
		}

		oLocaleFormatOptions = this.parseNumberPattern(sNumberPattern);

		oLocaleFormatOptions.plusSign = oLocaleData.getNumberSymbol("plusSign");
		oLocaleFormatOptions.minusSign = oLocaleData.getNumberSymbol("minusSign");
		oLocaleFormatOptions.decimalSeparator = oLocaleData.getNumberSymbol("decimal");
		oLocaleFormatOptions.groupingSeparator = oLocaleData.getNumberSymbol("group");
		oLocaleFormatOptions.percentSign = oLocaleData.getNumberSymbol("percentSign");
		oLocaleFormatOptions.pattern = sNumberPattern;

		// Some options need to be overridden to stay compatible with the formatting defaults
		// before pattern parsing was added to the NumberFormat
		switch (iType) {
			case mNumberType.FLOAT:
			case mNumberType.PERCENT:
				// Unlimited fraction digits for float and percent values
				oLocaleFormatOptions.minFractionDigits = 0;
				oLocaleFormatOptions.maxFractionDigits = 99;
				break;
			case mNumberType.INTEGER:
				// No fraction digits and no grouping for integer values
				oLocaleFormatOptions.minFractionDigits = 0;
				oLocaleFormatOptions.maxFractionDigits = 0;
				oLocaleFormatOptions.groupingEnabled = false;
				break;
			case mNumberType.CURRENCY:
				// reset the iMin/MaxFractionDigits because the extracted info from the pattern doesn't contain the currency specific info.
				oLocaleFormatOptions.minFractionDigits = undefined;
				oLocaleFormatOptions.maxFractionDigits = undefined;
				break;
		}

		return oLocaleFormatOptions;
	};

	/**
	 * Get digit information from number format.
	 *
	 * @static
	 */
	NumberFormat.parseNumberPattern = function(sFormatString) {
		var iMinIntegerDigits = 0;
		var iMinFractionDigits = 0;
		var iMaxFractionDigits = 0;
		var bGroupingEnabled = false;
		var sGroupingType = mGroupingType.ARABIC;
		var iSeparatorPos = sFormatString.indexOf(";");

		// The sFormatString can be ¤#,##0.00;(¤#,##0.00). If the whole string is parsed, the wrong
		// iMinFractionDigits and iMaxFractionDigits are wrong.
		// Only the sub string before ';' is taken into consideration.
		if (iSeparatorPos !== -1) {
			sFormatString = sFormatString.substring(0, iSeparatorPos);
		}

		var iSection = 0;

		for (var i = 0; i < sFormatString.length; i++) {
			var sCharacter = sFormatString[i];

			if (sCharacter === ",") {
				// If there are multiple grouping separators, enable indian grouping
				if (bGroupingEnabled) {
					sGroupingType = mGroupingType.INDIAN;
				}
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
			groupingEnabled: bGroupingEnabled,
			groupingType: sGroupingType
		};
	};

	/**
	 * Format a number according to the given format options.
	 *
	 * @param {number|array} oValue the number to format or an array which contains the number to format and the sMeasure parameter
	 * @param {string} [sMeasure] a measure which has an impact on the formatting
	 * @return {string} the formatted output value
	 * @public
	 */
	NumberFormat.prototype.format = function(oValue, sMeasure) {
		if (jQuery.isArray(oValue)) {
			sMeasure = oValue[1];
			oValue = oValue[0];
		}

		var sIntegerPart = "",
			sFractionPart = "",
			sGroupedIntegerPart = "",
			sResult = "",
			sNumber = "",
			sPattern = "",
			iPosition = 0,
			iLength = 0,
			iGroupSize = 0,
			bNegative = oValue < 0,
			iDotPos = -1,
			oOptions = jQuery.extend({}, this.oFormatOptions), aPatternParts;

		if (oOptions.decimals !== undefined) {
			oOptions.minFractionDigits = oOptions.decimals;
			oOptions.maxFractionDigits = oOptions.decimals;
		}

		var oShortFormat = getShortenedFormat(oValue, this.oFormatOptions.style, this.oLocaleData);
		if (oShortFormat) {
			if (oOptions.shortDecimals !== undefined) {
				oOptions.minFractionDigits = oOptions.shortDecimals;
				oOptions.maxFractionDigits = oOptions.shortDecimals;
			}
			oValue =  oValue / oShortFormat.magnitude;
		}

		if (oOptions.type == mNumberType.PERCENT) {
			oValue = shiftDecimalPoint(+oValue, 2);
		}

		//handle measure
		if (oOptions.type == mNumberType.CURRENCY) {
			var iDigits = this.oLocaleData.getCurrencyDigits(sMeasure);
			if (oOptions.maxFractionDigits === undefined) {
				oOptions.maxFractionDigits = iDigits;
			}
			if (oOptions.minFractionDigits === undefined) {
				oOptions.minFractionDigits = iDigits;
			}
		}

		// Rounding the value with oOptions.maxFractionDigits and oOptions.roundingMode.
		//
		// If the number of fraction digits are equal or less than oOptions.maxFractionDigits, the
		// number isn't changed. After this operation, the number of fraction digits is
		// equal or less than oOptions.maxFractionDigits.
		if (typeof oValue == "number") {
			oValue = rounding(oValue, oOptions);
		}

		sNumber = this.convertToDecimal(oValue);

		if (sNumber == "NaN") {
			return sNumber;
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
		} else if (sIntegerPart.length > oOptions.maxIntegerDigits) {
			sIntegerPart = jQuery.sap.padLeft("", "?", oOptions.maxIntegerDigits);
		}

		// fraction part length
		if (sFractionPart.length < oOptions.minFractionDigits) {
			sFractionPart = jQuery.sap.padRight(sFractionPart, "0", oOptions.minFractionDigits);
		} else if (sFractionPart.length > oOptions.maxFractionDigits) {
			sFractionPart = sFractionPart.substr(0, oOptions.maxFractionDigits);
		}

		// grouping
		iLength = sIntegerPart.length;
		if (oOptions.groupingEnabled && iLength > 3) {
			if (oOptions.groupingType == mGroupingType.ARABIC) {
				iPosition = iLength % 3 || 3;
				iGroupSize = 3;
			} else {
				iPosition = iLength % 2 + 1 || 3;
				iGroupSize = 2;
			}
			sGroupedIntegerPart = sIntegerPart.substr(0, iPosition);
			while (iPosition < sIntegerPart.length - 1) {
				sGroupedIntegerPart += oOptions.groupingSeparator;
				sGroupedIntegerPart += sIntegerPart.substr(iPosition, iGroupSize);
				iPosition += iGroupSize;
			}
			sGroupedIntegerPart += sIntegerPart.substr(iPosition);
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

		if (oOptions.type == mNumberType.CURRENCY) {
			sPattern = oOptions.pattern;

			// The currency pattern is definde in some locale, for example in "ko", as: ¤#,##0.00;(¤#,##0.00)
			// where the pattern after ';' should be used for negative numbers.
			// Therefore it's needed to check whether the pattern contains ';' and use the later part for
			// negative values
			aPatternParts = sPattern.split(";");
			if (aPatternParts.length === 2) {
				sPattern = bNegative ? aPatternParts[1] : aPatternParts[0];
				if (bNegative) {
					sResult = sResult.substring(1);
				}
			}

			if (!oOptions.currencyCode) {
				sMeasure = this.oLocaleData.getCurrencySymbol(sMeasure);
			}
			if (oOptions.showMeasure && sMeasure) {
				sPattern = sPattern.replace(/\u00a4/, sMeasure);
			} else {
				// If measure is not shown, also remove whitespace next to the measure symbol
				sPattern = sPattern.replace(/\s*\u00a4\s*/, "");
			}
			if (bNegative) {
				sPattern = sPattern.replace(/-/, oOptions.minusSign);
			}
			sPattern = sPattern.replace(/[0#.,]+/, sResult);

			sResult = sPattern;
		}

		if (oOptions.type == mNumberType.PERCENT) {
			sPattern = oOptions.pattern;
			sResult = sPattern.replace(/[0#.,]+/, sResult);
			sResult = sResult.replace(/%/, oOptions.percentSign);
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
	 * @return {number|array} the parsed value or an array which contains the parsed value and the currency code (symbol) when the NumberFormat is a currency instance
	 * @public
	 */
	NumberFormat.prototype.parse = function(sValue) {
		var oOptions = this.oFormatOptions,
			sRegExpFloat = "^\\s*([+-]?(?:[0-9\\" + oOptions.groupingSeparator + "]+|[0-9\\" + oOptions.groupingSeparator + "]*\\" + oOptions.decimalSeparator + "[0-9]+)(?:[eE][+-][0-9]+)?)\\s*$",
			sRegExpInt = "^\\s*([+-]?[0-9\\" + oOptions.groupingSeparator + "]+)\\s*$",
			oGroupingRegExp = new RegExp("\\" + oOptions.groupingSeparator, "g"),
			oDecimalRegExp = new RegExp("\\" + oOptions.decimalSeparator, "g"),
			sPercentPattern = this.oLocaleData.getPercentPattern(),
			sPercentSign = this.oLocaleData.getNumberSymbol("percentSign"),
			oRegExp, bPercent, sRegExpCurrency, sRegExpCurrencyMeasure, aParsed, sCurrencyMeasure,
			oResult = 0;

		if (sPercentPattern.charAt(0) === "%") {
			sRegExpFloat = sRegExpFloat.slice(0, 1) + "%?" + sRegExpFloat.slice(1);
		} else if (sPercentPattern.charAt(sPercentPattern.length - 1) === "%") {
			sRegExpFloat = sRegExpFloat.slice(0, sRegExpFloat.length - 1) + "%?" + sRegExpFloat.slice(sRegExpFloat.length - 1);
		}

		// remove all white spaces because when grouping separator is a non-breaking space (russian and french for example)
		// user will not input it this way. Also white spaces or grouping separator can be ignored by determining the value
		sValue = sValue.replace(/\s/g, "");

		var oShort = getNumberFromShortened(sValue, this.oFormatOptions.style, this.oLocaleData);
		sValue = oShort.number;

		// Check for valid syntax
		if (oOptions.isInteger) {
			oRegExp = new RegExp(sRegExpInt);
		} else if (oOptions.type === mNumberType.CURRENCY) {
			sRegExpCurrencyMeasure = "[^\\d\\s+-]*";
			sRegExpCurrency = "(?:^(" + sRegExpCurrencyMeasure + ")" + sRegExpFloat.substring(1, sRegExpFloat.length - 1) + "$)|(?:^" + sRegExpFloat.substring(1, sRegExpFloat.length - 1) + "(" + sRegExpCurrencyMeasure + ")\\s*$)";
			oRegExp = new RegExp(sRegExpCurrency);
		} else {
			oRegExp = new RegExp(sRegExpFloat);
		}
		if (!oRegExp.test(sValue)) {
			return NaN;
		}

		if (oOptions.type === mNumberType.CURRENCY) {
			aParsed = oRegExp.exec(sValue);
			// checks whether the currency code (symbol) is at the beginnig or end of the string
			if (aParsed[2]) {
				// currency code is at the begining
				sValue = aParsed[2];
				sCurrencyMeasure = aParsed[1];
			} else {
				// currency code is at the end
				sValue = aParsed[3];
				sCurrencyMeasure = aParsed[4];
			}
		}

		if (sCurrencyMeasure) {
			sCurrencyMeasure = this.oLocaleData.getCurrencyCodeBySymbol(sCurrencyMeasure) || sCurrencyMeasure;
		}

		// Remove grouping separator and replace locale dependant decimal separator,
		// before calling parseInt/parseFloat
		sValue = sValue.replace(oGroupingRegExp, "");

		if (oOptions.isInteger) {
			oResult = parseInt(sValue, 10);
		} else {
			sValue = sValue.replace(oDecimalRegExp, ".");
			if (sValue.indexOf(sPercentSign) !== -1) {
				bPercent = true;
				sValue = sValue.replace(sPercentSign, "");
			}
			oResult = parseFloat(sValue);
			if (bPercent) {
				oResult = shiftDecimalPoint(oResult, -2);
			}
		}

		if (oShort.factor > 1) {
			oResult = oResult * oShort.factor;
		}

		return oOptions.type === mNumberType.CURRENCY ? [oResult, sCurrencyMeasure] : oResult;
	};

	/**
	 * Convert to decimal representation
	 * Floats larger than 1e+20 or smaller than 1e-6 are shown in exponential format,
	 * but need to be converted to decimal format for further formatting
	 *
	 * @param {float} fValue
	 * @private
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

	function rounding(fValue, oOptions) {
		if (typeof fValue !== "number") {
			return NaN;
		}

		var sRoundingMode = oOptions.roundingMode || NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO;

		if (typeof sRoundingMode === "function") {
			// Support custom function for rounding the number
			fValue = sRoundingMode(fValue, oOptions.maxFractionDigits);
		} else {
			if (!oOptions.maxFractionDigits) {
				return mRoundingFunction[sRoundingMode](fValue);
			}
			// First move the decimal point towards right by maxFactionDigits
			// Then using the rounding function to round the first digit after decimal point
			// In the end, move the decimal point back to the original position
			//
			// For example rounding 1.005 by maxFractionDigits 2
			// 	1. Move the decimal point to right by 2 digits, result 100.5
			// 	2. Using the round function, for example, Math.round(100.5) = 101
			// 	3. Move the decimal point back by 2 digits, result 1.01
			fValue =  shiftDecimalPoint(mRoundingFunction[sRoundingMode](shiftDecimalPoint(fValue, oOptions.maxFractionDigits)), -oOptions.maxFractionDigits);
		}

		return fValue;
	}

	function shiftDecimalPoint(fValue, iStep) {
		if (typeof fValue !== "number" || typeof iStep !== "number") {
			return NaN;
		}

		// Exponential operation is used instead of simply multiply the number by
		// Math.pow(10, maxFractionDigits) because Exponential operation returns exact float
		// result but multiply doesn't. For example 1.005*100 = 100.49999999999999.
		var aExpParts = fValue.toString().split("e");
		iStep = aExpParts[1] ? (+aExpParts[1] + iStep) : iStep;

		return +(aExpParts[0] + "e" + iStep);
	}

	return NumberFormat;

}, /* bExport= */ true);
