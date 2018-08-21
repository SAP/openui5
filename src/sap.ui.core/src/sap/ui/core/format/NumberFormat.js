/*!
 * ${copyright}
 */

// Provides class sap.ui.core.format.NumberFormat
sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/core/Locale',
	'sap/ui/core/LocaleData',
	"sap/base/strings/escapeRegExp",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery"
],
	function(BaseObject, Locale, LocaleData, escapeRegExp, assert, jQuery) {
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
	 * @public
	 * @hideconstructor
	 * @param {object} [oFormatOptions] The option object which support the following parameters. If no options is given, default values according to the type and locale settings are used.
	 * @param {int} [oFormatOptions.minIntegerDigits] defines minimal number of non-decimal digits
	 * @param {int} [oFormatOptions.maxIntegerDigits] defines maximum number of non-decimal digits
	 * @param {int} [oFormatOptions.minFractionDigits] defines minimal number of decimal digits
	 * @param {int} [oFormatOptions.maxFractionDigits] defines maximum number of decimal digits
	 * @param {int} [oFormatOptions.decimals] defines the number of decimal digits
	 * @param {int} [oFormatOptions.shortDecimals] defines the number of decimal in the shortified format string. If this isn't specified, the 'decimals' options is used
	 * @param {int} [oFormatOptions.shortLimit] only use short number formatting for values above this limit
	 * @param {int} [oFormatOptions.shortRefNumber] @since 1.40 specifies a number from which the scale factor for 'short' or 'long' style format is generated. The generated scale factor is
	 *  used for all numbers which are formatted with this format instance. This option has effect only when the option 'style' is set to 'short' or 'long'. This option is by default set
	 *  with undefined which means the scale factor is selected automatically for each number being formatted.
	 * @param {boolean} [oFormatOptions.showScale=true] @since 1.40 specifies whether the scale factor is shown in the formatted number. This option takes effect only when the 'style' options is set to either 'short' or 'long'.
	 * @param {int} [oFormatOptions.precision] defines the number precision, number of decimals is calculated dependent on the integer digits
	 * @param {string} [oFormatOptions.pattern] CLDR number pattern which is used to format the number
	 * @param {boolean} [oFormatOptions.groupingEnabled] defines whether grouping is enabled (show the grouping separators)
	 * @param {string} [oFormatOptions.groupingSeparator] defines the used grouping separator
	 * @param {int} [oFormatOptions.groupingSize] defines the grouping size in digits, the default is three
	 * @param {int} [oFormatOptions.groupingBaseSize] defines the grouping base size in digits, in case it is different from the grouping size (e.g. indian grouping)
	 * @param {string} [oFormatOptions.decimalSeparator] defines the used decimal separator
	 * @param {string} [oFormatOptions.customUnits] defines a set of custom units, e.g. {"electric-inductance": {
				"displayName": "henry",
				"unitPattern-count-one": "{0} H",
				"unitPattern-count-other": "{0} H",
				"perUnitPattern": "{0}/H",
				"decimals": 2,
				"precision": 4
			}}
	 * @param {array} [oFormatOptions.allowedUnits] defines the allowed units for formatting and parsing, e.g. ["size-meter", "volume-liter", ...]
	 * @param {string} [oFormatOptions.plusSign] defines the used plus symbol
	 * @param {string} [oFormatOptions.minusSign] defines the used minus symbol
	 * @param {boolean} [oFormatOptions.parseAsString] @since 1.28.2 defines whether to output string from parse function in order to keep the precision for big numbers. Numbers in scientific notation are parsed
	 *  back to the standard notation. For example ".5e-3" is parsed to "0.0005".
	 * @param {string} [oFormatOptions.style] defines the style of format. Valid values are 'short, 'long' or 'standard' (based on CLDR decimalFormat). Numbers are formatted into compact forms when it's set to
	 * 'short' or 'long'. When this option is set, the default value of option 'precision' is set to 2. This can be changed by setting either min/maxFractionDigits, decimals, shortDecimals or precision option.
	 * @param {sap.ui.core.format.NumberFormat.RoundingMode} [oFormatOptions.roundingMode] specifies a rounding behavior for discarding the digits after the maximum fraction digits
	 *  defined by maxFractionDigits. Rounding will only be applied, if the passed value if of type number. This can be assigned by value in {@link sap.ui.core.format.NumberFormat.RoundingMode RoundingMode}
	 *  or a function which will be used for rounding the number. The function is called with two parameters: the number and how many decimal digits should be reserved.
	 * @param {boolean} [oFormatOptions.showMeasure] defines whether the measure according to the format is shown in the formatted string
	 * @param {boolean} [oFormatOptions.currencyCode] defines whether the currency is shown as code in currency format. The currency symbol is displayed when this is set to false and there's symbol defined
	 *  for the given currency code.
	 * @param {string} [oFormatOptions.currencyContext] It can be set either with 'standard' (the default value) or with 'accounting' for an accounting specific currency display
	 * @param {number} [oFormatOptions.emptyString=NaN] @since 1.30.0 defines what empty string is parsed as and what is formatted as empty string. The allowed values are only NaN, null or 0.
	 *  The 'format' and 'parse' are done in a symmetric way which means when this parameter is set to NaN, empty string is parsed as NaN and NaN is formatted as empty string.
	 *
	 * @alias sap.ui.core.format.NumberFormat
	 * @extends sap.ui.base.Object
	 */
	var NumberFormat = BaseObject.extend("sap.ui.core.format.NumberFormat", /** @lends sap.ui.core.format.NumberFormat.prototype */ {
		constructor : function(oFormatOptions) {
			// Do not use the constructor
			throw new Error();
		}
	});

	// Regex for matching the number placeholder in pattern
	var rNumPlaceHolder = /0+(\.0+)?/;

	/**
	 * Internal enumeration to differentiate number types
	 */
	var mNumberType = {
		INTEGER: "integer",
		FLOAT: "float",
		CURRENCY: "currency",
		UNIT: "unit",
		PERCENT: "percent"
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
	 */
	NumberFormat.oDefaultIntegerFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		minFractionDigits: 0,
		maxFractionDigits: 0,
		groupingEnabled: false,
		groupingSize: 3,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		isInteger: true,
		type: mNumberType.INTEGER,
		showMeasure: false,
		style: "standard",
		parseAsString: false,
		roundingMode: NumberFormat.RoundingMode.TOWARDS_ZERO,
		emptyString: NaN,
		showScale: true
	};

	/*
	 * Default format options for Float
	 */
	NumberFormat.oDefaultFloatFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		minFractionDigits: 0,
		maxFractionDigits: 99,
		groupingEnabled: true,
		groupingSize: 3,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		isInteger: false,
		type: mNumberType.FLOAT,
		showMeasure: false,
		style: "standard",
		parseAsString: false,
		roundingMode: NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO,
		emptyString: NaN,
		showScale: true
	};

	/*
	* Default format options for Percent
	*/
	NumberFormat.oDefaultPercentFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		minFractionDigits: 0,
		maxFractionDigits: 99,
		groupingEnabled: true,
		groupingSize: 3,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		percentSign: "%",
		isInteger: false,
		type: mNumberType.PERCENT,
		showMeasure: false,
		style: "standard",
		parseAsString: false,
		roundingMode: NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO,
		emptyString: NaN,
		showScale: true
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
		groupingSize: 3,
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
		parseAsString: false,
		roundingMode: NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO,
		emptyString: NaN,
		showScale: true
	};

	/*
	 * Default format options for Unit (type is CLDR)
	 * @name sap.ui.core.format.NumberFormat.oDefaultUnitFormat
	 */
	NumberFormat.oDefaultUnitFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		groupingEnabled: true,
		groupingSize: 3,
		groupingSeparator: ",",
		decimalSeparator: ".",
		plusSign: "+",
		minusSign: "-",
		isInteger: false,
		type: mNumberType.UNIT,
		showMeasure: true,
		style: "standard",
		customUnits: undefined,
		allowedUnits: undefined,
		parseAsString: false,
		roundingMode: NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO,
		emptyString: NaN,
		showScale: true
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
	 * Get a unit instance of the NumberFormat, which can be used for formatting units.
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
	 * @return {sap.ui.core.format.NumberFormat} unit instance of the NumberFormat
	 * @static
	 * @public
	 */
	NumberFormat.getUnitInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, mNumberType.UNIT);

		oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultUnitFormat, oLocaleFormatOptions, oFormatOptions);
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
		var oFormat = Object.create(this.prototype),
			oPatternOptions;
		if ( oFormatOptions instanceof Locale ) {
			oLocale = oFormatOptions;
			oFormatOptions = undefined;
		}
		if (!oLocale) {
			oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
		}
		oFormat.oLocale = oLocale;
		oFormat.oLocaleData = LocaleData.getInstance(oLocale);
		oFormat.oOriginalFormatOptions = oFormatOptions;

		// If a pattern is defined in the format option, parse it and add options
		if (oFormatOptions) {
			if (oFormatOptions.pattern) {
				oPatternOptions = this.parseNumberPattern(oFormatOptions.pattern);
				jQuery.each(oPatternOptions, function(sName, vOption) {
					oFormatOptions[sName] = vOption;
				});
			}
			if (oFormatOptions.emptyString !== undefined) {
				assert(typeof oFormatOptions.emptyString !== "string", "The format option 'emptyString' can not be with type 'string'");
				assert(oFormatOptions.emptyString === 0 || oFormatOptions.emptyString === null || /* check if it's NaN (only NaN doesn't equal to itself) */ oFormatOptions.emptyString !== oFormatOptions.emptyString, "The format option 'emptyString' must be either 0, null or NaN");
			}
		}

		return oFormat;
	};


	/**
	 * Get locale dependent default format options.
	 *
	 * @static
	 */
	NumberFormat.getLocaleFormatOptions = function(oLocaleData, iType, sContext) {
		var oLocaleFormatOptions,
			sNumberPattern;

		switch (iType) {
			case mNumberType.PERCENT:
				sNumberPattern = oLocaleData.getPercentPattern();
				break;
			case mNumberType.CURRENCY:
				sNumberPattern = oLocaleData.getCurrencyPattern(sContext);
				break;
			case mNumberType.UNIT:
				sNumberPattern = oLocaleData.getDecimalPattern();
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
		var iMinIntegerDigits = 0,
			iMinFractionDigits = 0,
			iMaxFractionDigits = 0,
			bGroupingEnabled = false,
			iGroupSize = 0,
			iBaseGroupSize = 0,
			iSeparatorPos = sFormatString.indexOf(";"),
			mSection = {
				Integer: 0,
				Fraction: 1
			},
			iSection = mSection.Integer;

		// The sFormatString can be ¤#,##0.00;(¤#,##0.00). If the whole string is parsed, the wrong
		// iMinFractionDigits and iMaxFractionDigits are wrong.
		// Only the sub string before ';' is taken into consideration.
		if (iSeparatorPos !== -1) {
			sFormatString = sFormatString.substring(0, iSeparatorPos);
		}

		for (var i = 0; i < sFormatString.length; i++) {
			var sCharacter = sFormatString[i];
			switch (sCharacter) {
				case ",":
					if (bGroupingEnabled) {
						iGroupSize = iBaseGroupSize;
						iBaseGroupSize = 0;
					}
					bGroupingEnabled = true;
					break;
				case ".":
					iSection = mSection.Fraction;
					break;
				case "0":
					if (iSection === mSection.Integer) {
						iMinIntegerDigits++;
						if (bGroupingEnabled) {
							iBaseGroupSize++;
						}
					} else {
						iMinFractionDigits++;
						iMaxFractionDigits++;
					}
					break;
				case "#":
					if (iSection === mSection.Integer) {
						if (bGroupingEnabled) {
							iBaseGroupSize++;
						}
					} else {
						iMaxFractionDigits++;
					}
					break;
			}
		}
		if (!iGroupSize) {
			iGroupSize = iBaseGroupSize;
			iBaseGroupSize = 0;
		}

		return {
			minIntegerDigits: iMinIntegerDigits,
			minFractionDigits: iMinFractionDigits,
			maxFractionDigits: iMaxFractionDigits,
			groupingEnabled: bGroupingEnabled,
			groupingSize: iGroupSize,
			groupingBaseSize: iBaseGroupSize
		};
	};

	/**
	 * Format a number according to the given format options.
	 *
	 * @param {number|array} vValue the number to format or an array which contains the number to format and the sMeasure parameter
	 * @param {string} [sMeasure] an optional unit which has an impact on formatting currencies and units
	 * @return {string} the formatted output value
	 * @public
	 */
	NumberFormat.prototype.format = function(vValue, sMeasure) {
		if (Array.isArray(vValue)) {
			sMeasure = vValue[1];
			vValue = vValue[0];
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
			iBaseGroupSize = 0,
			bNegative = vValue < 0,
			iDotPos = -1,
			oOptions = jQuery.extend({}, this.oFormatOptions),
			oOrigOptions = this.oOriginalFormatOptions,
			bIndianCurrency = oOptions.type === mNumberType.CURRENCY && sMeasure === "INR" &&
				this.oLocale.getLanguage() === "en" && this.oLocale.getRegion() === "IN",
			aPatternParts,
			oShortFormat,
			nShortRefNumber,
			sPluralCategory,
			mUnitPatterns,
			sLookupMeasure;

		if (vValue === oOptions.emptyString || (isNaN(vValue) && isNaN(oOptions.emptyString))) {
			// if the value equals the 'emptyString' format option, return empty string.
			// the NaN case has to be checked by using isNaN because NaN !== NaN
			return "";
		}

		// Recognize the correct unit definition (either custom unit or CLDR unit)
		if (oOptions.type === mNumberType.UNIT) {
			if (oOptions.customUnits && typeof oOptions.customUnits === "object") {
				//custom units are exclusive (no fallback to LocaleData)
				mUnitPatterns = oOptions.customUnits[sMeasure];
			} else {
				//check if there is a unit mapping for the given unit
				sLookupMeasure = this.oLocaleData.getUnitFromMapping(sMeasure) || sMeasure;
				mUnitPatterns = this.oLocaleData.getUnitFormat(sLookupMeasure);
			}

			oOptions.decimals = (mUnitPatterns && (typeof mUnitPatterns.decimals === "number" && mUnitPatterns.decimals >= 0)) ? mUnitPatterns.decimals : oOptions.decimals;
			oOptions.precision = (mUnitPatterns && (typeof mUnitPatterns.precision === "number" && mUnitPatterns.precision >= 0)) ? mUnitPatterns.precision : oOptions.precision;
		}

		if (oOptions.decimals !== undefined) {
			oOptions.minFractionDigits = oOptions.decimals;
			oOptions.maxFractionDigits = oOptions.decimals;
		}

		if (oOptions.shortLimit === undefined || Math.abs(vValue) >= oOptions.shortLimit) {
			nShortRefNumber = oOptions.shortRefNumber === undefined ? vValue : oOptions.shortRefNumber;
			oShortFormat = getShortenedFormat(nShortRefNumber, oOptions, this.oLocaleData, bIndianCurrency);
			if (oShortFormat && oShortFormat.formatString != "0") {
				vValue = vValue / oShortFormat.magnitude;
				// If shortDecimals is defined, override the fractionDigits
				if (oOptions.shortDecimals !== undefined) {
					oOptions.minFractionDigits = oOptions.shortDecimals;
					oOptions.maxFractionDigits = oOptions.shortDecimals;
				} else {
					if (oOrigOptions.minFractionDigits === undefined
						&& oOrigOptions.maxFractionDigits === undefined
						&& oOrigOptions.decimals === undefined
						&& oOrigOptions.precision === undefined
						&& oOrigOptions.pattern === undefined) {
						// if none of the options which can affect the decimal digits is set, the default precision is set to 2
						oOptions.precision = 2;
					}

					if (oOrigOptions.maxFractionDigits === undefined && oOrigOptions.decimals === undefined) {
						// overwrite the default setting of Integer instance because
						// Integer with short format could have fraction part
						oOptions.maxFractionDigits = 99;
					}
				}

				// Always use HALF_AWAY_FROM_ZERO for short formats
				oOptions.roundingMode = NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO;
			}
		}

		// Must be done after calculating the short value, as it depends on the value
		if (oOptions.precision !== undefined) {
			// the number of decimal digits is calculated using (precision - number of integer digits)
			// the maxFractionDigits is adapted if the calculated value is smaller than the maxFractionDigits
			oOptions.maxFractionDigits = Math.min(oOptions.maxFractionDigits, getDecimals(vValue, oOptions.precision));

			// if the minFractionDigits is greater than the maxFractionDigits, adapt the minFractionDigits with
			// the same value of the maxFractionDigits
			oOptions.minFractionDigits = Math.min(oOptions.minFractionDigits, oOptions.maxFractionDigits);
		}

		if (oOptions.type == mNumberType.PERCENT) {
			vValue = NumberFormat._shiftDecimalPoint(vValue, 2);
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
		if (typeof vValue === "number") {
			vValue = rounding(vValue, oOptions.maxFractionDigits, oOptions.roundingMode);
		}

		// No sign on zero values
		if (vValue == 0) {
			bNegative = false;
		}

		sNumber = this.convertToDecimal(vValue);

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
			sIntegerPart = sIntegerPart.padStart(oOptions.minIntegerDigits, "0");
		} else if (sIntegerPart.length > oOptions.maxIntegerDigits) {
			sIntegerPart = "".padStart(oOptions.maxIntegerDigits, "?");
		}

		// fraction part length
		if (sFractionPart.length < oOptions.minFractionDigits) {
			sFractionPart = sFractionPart.padEnd(oOptions.minFractionDigits, "0");
		} else if (sFractionPart.length > oOptions.maxFractionDigits) {
			sFractionPart = sFractionPart.substr(0, oOptions.maxFractionDigits);
		}

		// grouping
		iLength = sIntegerPart.length;

		if (oOptions.groupingEnabled) {
			// Speical grouping for lakh crore/crore crore in India
			if (bIndianCurrency) {
				var aGroups = [3, 2, 2], iCurGroupSize, iIndex = 0;
				iPosition = sIntegerPart.length;
				while (iPosition > 0) {
					iCurGroupSize = aGroups[iIndex % 3];
					iPosition -= iCurGroupSize;
					if (iIndex > 0) {
						sGroupedIntegerPart = oOptions.groupingSeparator + sGroupedIntegerPart;
					}
					if (iPosition < 0) {
						iCurGroupSize += iPosition;
						iPosition = 0;
					}
					sGroupedIntegerPart = sIntegerPart.substr(iPosition, iCurGroupSize) + sGroupedIntegerPart;
					iIndex++;
				}
			} else {
				iGroupSize = oOptions.groupingSize;
				iBaseGroupSize = oOptions.groupingBaseSize || iGroupSize;
				iPosition = Math.max(iLength - iBaseGroupSize, 0) % iGroupSize || iGroupSize;
				sGroupedIntegerPart = sIntegerPart.substr(0, iPosition);
				while (iLength - iPosition >= iBaseGroupSize) {
					sGroupedIntegerPart += oOptions.groupingSeparator;
					sGroupedIntegerPart += sIntegerPart.substr(iPosition, iGroupSize);
					iPosition += iGroupSize;
				}
				sGroupedIntegerPart += sIntegerPart.substr(iPosition);
			}
		} else {
			sGroupedIntegerPart = sIntegerPart;
		}

		// combine
		if (bNegative) {
			sResult = oOptions.minusSign;
		}
		sResult += sGroupedIntegerPart;
		if (sFractionPart) {
			sResult += oOptions.decimalSeparator + sFractionPart;
		}

		if (oShortFormat && oShortFormat.formatString && oOptions.showScale && oOptions.type !== mNumberType.CURRENCY) {
			// Get correct format string based on actual decimal/fraction digits
			sPluralCategory = this.oLocaleData.getPluralCategory(sIntegerPart + "." + sFractionPart);
			oShortFormat.formatString = this.oLocaleData.getDecimalFormat(oOptions.style, oShortFormat.key, sPluralCategory);
			//inject formatted shortValue in the formatString
			sResult = oShortFormat.formatString.replace(oShortFormat.valueSubString, sResult);
			//formatString may contain '.' (quoted to differentiate them decimal separator)
			//which must be replaced with .
			sResult = sResult.replace(/'.'/g, ".");
		}

		if (oOptions.type === mNumberType.CURRENCY) {
			sPattern = oOptions.pattern;

			if (oShortFormat && oShortFormat.formatString && oOptions.showScale) {
				// Get correct format string based on actual decimal/fraction digits
				sPluralCategory = this.oLocaleData.getPluralCategory(sIntegerPart + "." + sFractionPart);
				if (bIndianCurrency) {
					sPattern = getIndianCurrencyFormat("short", oShortFormat.key, sPluralCategory);
				} else {
					sPattern = this.oLocaleData.getCurrencyFormat("short", oShortFormat.key, sPluralCategory);
				}
				//formatString may contain '.' (quoted to differentiate them decimal separator)
				//which must be replaced with .
				sPattern = sPattern.replace(/'.'/g, ".");
			}

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

			sResult = this._composeCurrencyResult(sPattern, sResult, sMeasure, {
				showMeasure: oOptions.showMeasure,
				negative: bNegative,
				minusSign: oOptions.minusSign
			});
		}

		// format percent values:
		if (oOptions.type === mNumberType.PERCENT) {
			sPattern = oOptions.pattern;
			sResult = sPattern.replace(/[0#.,]+/, sResult);
			sResult = sResult.replace(/%/, oOptions.percentSign);
		}

		if (oOptions.showMeasure && oOptions.type === mNumberType.UNIT) {

			sPluralCategory = this.oLocaleData.getPluralCategory(sIntegerPart + "." + sFractionPart);
			assert(sPluralCategory, "Cannot find plural category for " + (sIntegerPart + "." + sFractionPart));

			// a list of allowed unit types is given, so we check if the given measure is ok
			var bUnitTypeAllowed = !oOptions.allowedUnits || oOptions.allowedUnits.indexOf(sMeasure) >= 0;
			if (!bUnitTypeAllowed) {
				assert(bUnitTypeAllowed, "The given unit '" + sMeasure + "' is not part of the allowed unit types: [" + oOptions.allowedUnits.join(",") + "].");
				return "";
			}

			if (mUnitPatterns) {
				sPattern = mUnitPatterns["unitPattern-count-" + sPluralCategory];
				// some units do not have a pattern for each plural and therefore "other" is used as fallback
				if (!sPattern) {
					sPattern = mUnitPatterns["unitPattern-count-other"];
				}
				assert(sPattern, "Cannot find pattern 'unitPattern-count-" + sPluralCategory + "' in '" + sMeasure + "'");
				if (!sPattern) {
					return "";
				}
				sResult = sPattern.replace("{0}", sResult);
			} else {
				assert(mUnitPatterns, "Unit '" + sMeasure + "' is unknown");
				return "";
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

	NumberFormat.prototype._composeCurrencyResult = function(sPattern, sFormattedNumber, sMeasure, oOptions) {
		var sMinusSign = oOptions.minusSign;

		sPattern = sPattern.replace(/[0#.,]+/, sFormattedNumber);

		if (oOptions.showMeasure && sMeasure) {
			var sPlaceHolder = "\u00a4",
				// convert the PCRE regex in CLDR to the regex supported by Javascript
				mRegex = {
					"[:digit:]": /\d/,
					"[:^S:]": /[^\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/
				},
				iMeasureStart = sPattern.indexOf(sPlaceHolder),
				// determine whether the number is before the measure or after it by comparing the position of measure placeholder with half of the length of the pattern string
				sPosition = iMeasureStart < sPattern.length / 2 ? "after" : "before",
				oSpacingSetting = this.oLocaleData.getCurrencySpacing(sPosition),
				sCurrencyChar = (sPosition === "after" ? sMeasure.charAt(sMeasure.length - 1) : sMeasure.charAt(0)),
				sNumberChar,
				rCurrencyChar = mRegex[oSpacingSetting.currencyMatch],
				rNumberChar = mRegex[oSpacingSetting.surroundingMatch],
				iInsertPos;

			sPattern = sPattern.replace(sPlaceHolder, sMeasure);

			sNumberChar = (sPosition === "after" ? sPattern.charAt(iMeasureStart + sMeasure.length) : sPattern.charAt(iMeasureStart - 1));

			if (rCurrencyChar && rCurrencyChar.test(sCurrencyChar) && rNumberChar && rNumberChar.test(sNumberChar)) {
				// when both checks are valid, insert the defined space

				if (sPosition === "after") {
					iInsertPos = iMeasureStart + sMeasure.length;
				} else {
					iInsertPos = iMeasureStart;
				}

				// insert the space char between the measure and the number
				sPattern = sPattern.slice(0, iInsertPos) + oSpacingSetting.insertBetween + sPattern.slice(iInsertPos);
			} else if (oOptions.negative && sPosition === "after") {
				// when no space is inserted between measure and number
				// and when the number is negative and the measure is shown before the number
				// a zero-width non-breakable space ("\ufeff") is inserted before the minus sign
				// in order to prevent the formatted currency number from being wrapped after the
				// minus sign when the space isn't enough for displaying the currency number within
				// one line
				sMinusSign = "\ufeff" + oOptions.minusSign;
			}
		} else {
			// If measure is not shown, also remove whitespace next to the measure symbol
			sPattern = sPattern.replace(/\s*\u00a4\s*/, "");
		}

		if (oOptions.negative) {
			sPattern = sPattern.replace(/-/, sMinusSign);
		}

		return sPattern;
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
			sPlusMinusSigns = quote(oOptions.plusSign + oOptions.minusSign),
			sGroupingSeparator = quote(oOptions.groupingSeparator),
			sDecimalSeparator = quote(oOptions.decimalSeparator),
			sRegExpFloat = "^\\s*([" + sPlusMinusSigns + "]?(?:[0-9" + sGroupingSeparator + "]+|[0-9" + sGroupingSeparator + "]*" + sDecimalSeparator + "[0-9]*)(?:[eE][+-][0-9]+)?)\\s*$",
			sRegExpInt = "^\\s*([" + sPlusMinusSigns + "]?[0-9" + sGroupingSeparator + "]+)\\s*$",
			oGroupingRegExp = new RegExp(sGroupingSeparator, "g"),
			oDecimalRegExp = new RegExp(sDecimalSeparator, "g"),
			sPercentSign = this.oLocaleData.getNumberSymbol("percentSign"),
			bIndianCurrency = oOptions.type === mNumberType.CURRENCY && this.oLocale.getLanguage() === "en" && this.oLocale.getRegion() === "IN",
			oRegExp, bPercent, sRegExpCurrency, sRegExpCurrencyMeasure, aParsed, sMeasure, sPercentPattern,
			vResult = 0,
			oShort, vEmptyParseValue;

		if (sValue === "") {
			vEmptyParseValue = oOptions.emptyString;
			// If the 'emptyString' option is set to 0 or NaN and parseAsString is set to true, the return value should be converted to a string.
			// Because null is a valid value for string type, therefore null is not converted to a string.
			if (oOptions.parseAsString && (oOptions.emptyString === 0 || isNaN(oOptions.emptyString))) {
				vEmptyParseValue = oOptions.emptyString + "";
			}
			if (oOptions.type === mNumberType.CURRENCY) {
				return [vEmptyParseValue, undefined];
			} else {
				return vEmptyParseValue;
			}
		}

		sPercentPattern = oOptions.type === mNumberType.PERCENT ? oOptions.pattern : this.oLocaleData.getPercentPattern();
		if (sPercentPattern.charAt(0) === "%") {
			sRegExpFloat = sRegExpFloat.slice(0, 1) + "%?" + sRegExpFloat.slice(1);
		} else if (sPercentPattern.charAt(sPercentPattern.length - 1) === "%") {
			sRegExpFloat = sRegExpFloat.slice(0, sRegExpFloat.length - 1) + "%?" + sRegExpFloat.slice(sRegExpFloat.length - 1);
		}

		var aUnitCode;
		if (oOptions.type === mNumberType.UNIT) {

			var mUnitPatterns;
			if (oOptions.customUnits && typeof oOptions.customUnits === "object") {
				//custom units are exclusive (no fallback to LocaleData)
				mUnitPatterns = oOptions.customUnits;
			} else {
				mUnitPatterns = this.oLocaleData.getUnitFormats();
			}
			assert(mUnitPatterns, "Unit patterns cannot be loaded");

			// filter using allowedUnits option
			if (oOptions.allowedUnits) {
				var mFilteredUnits = {};
				for (var i = 0; i < oOptions.allowedUnits.length; i++) {
					var sUnitType = oOptions.allowedUnits[i];
					mFilteredUnits[sUnitType] = mUnitPatterns[sUnitType];
				}
				mUnitPatterns = mFilteredUnits;
			}

			var oPatternAndResult = parseNumberAndUnit(mUnitPatterns, sValue);

			aUnitCode = oPatternAndResult.cldrCode;
			if (aUnitCode.length === 1) {
				sMeasure = aUnitCode[0];
			} else if (aUnitCode.length === 0) {
				//unit not found
				assert(aUnitCode.length === 1, "Cannot find unit for input: '" + (sValue) + "'");
				return null;
			} else {
				//ambiguous unit
				assert(aUnitCode.length === 1, "Ambiguous unit [" + aUnitCode.join(", ") + "] for input: '" + (sValue) + "'");
				sMeasure = undefined;
			}

			sValue = oPatternAndResult.numberValue || sValue;
		}


		// remove all white spaces because when grouping separator is a non-breaking space (russian and french for example)
		// user will not input it this way. Also white spaces or grouping separator can be ignored by determining the value
		sValue = sValue.replace(/\s/g, "");

		oShort = getNumberFromShortened(sValue, this.oLocaleData, bIndianCurrency);
		if (oShort) {
			sValue = oShort.number;
		}

		// Check for valid syntax
		if (oOptions.isInteger && !oShort) {
			oRegExp = new RegExp(sRegExpInt);
		} else if (oOptions.type === mNumberType.CURRENCY) {
			sRegExpCurrencyMeasure = "[^\\d\\s+-]*";
			sRegExpCurrency = "(?:^(" + sRegExpCurrencyMeasure + ")" + sRegExpFloat.substring(1, sRegExpFloat.length - 1) + "$)|(?:^" + sRegExpFloat.substring(1, sRegExpFloat.length - 1) + "(" + sRegExpCurrencyMeasure + ")\\s*$)";
			oRegExp = new RegExp(sRegExpCurrency);
		} else {
			oRegExp = new RegExp(sRegExpFloat);
		}
		if (!oRegExp.test(sValue)) {
			return oOptions.type === mNumberType.CURRENCY || oOptions.type === mNumberType.UNIT ? null : NaN;
		}

		if (oOptions.type === mNumberType.CURRENCY) {
			aParsed = oRegExp.exec(sValue);
			// checks whether the currency code (symbol) is at the beginning or end of the string
			if (aParsed[2]) {
				// currency code is at the beginning
				sValue = aParsed[2];
				sMeasure = aParsed[1] || undefined;
			} else {
				// currency code is at the end
				sValue = aParsed[3];
				sMeasure = aParsed[4] || undefined;
			}
			if (sMeasure && !oOptions.showMeasure) {
				return null;
			}

			if (sMeasure) {
				sMeasure = this.oLocaleData.getCurrencyCodeBySymbol(sMeasure) || sMeasure;
			}
		}

		// Remove grouping separator and replace locale dependant decimal separator,
		// before calling parseInt/parseFloat
		sValue = sValue.replace(oGroupingRegExp, "");
		sValue = sValue.replace(oOptions.plusSign, "+");
		sValue = sValue.replace(oOptions.minusSign, "-");

		// Remove the leading "+" sign because when "parseAsString" is set to true the "parseInt" or "parseFloat" isn't called and the leading "+" has to be moved manually
		sValue = sValue.replace(/^\+/, "");

		// Expanding short value before using parseInt/parseFloat
		if (oShort) {
			sValue = sValue.replace(oDecimalRegExp, ".");
			sValue = NumberFormat._shiftDecimalPoint(sValue, Math.round(Math.log(oShort.factor) / Math.LN10));
		}

		if (oOptions.isInteger) {
			vResult = oOptions.parseAsString ? sValue : parseInt(sValue, 10);
		} else {
			sValue = sValue.replace(oDecimalRegExp, ".");
			if (sValue.indexOf(sPercentSign) !== -1) {
				bPercent = true;
				sValue = sValue.replace(sPercentSign, "");
			}
			vResult = oOptions.parseAsString ? sValue : parseFloat(sValue);
			if (bPercent) {
				vResult = NumberFormat._shiftDecimalPoint(vResult, -2);
			}
		}

		// Get rid of leading zeros
		if (oOptions.parseAsString) {
			vResult = NumberFormat._shiftDecimalPoint(sValue, 0);
		}

		if (oOptions.type === mNumberType.CURRENCY || oOptions.type === mNumberType.UNIT) {
			return [vResult, sMeasure];
		}
		return vResult;
	};

	/**
	 * Convert to decimal representation
	 * Floats larger than 1e+20 or smaller than 1e-6 are shown in exponential format,
	 * but need to be converted to decimal format for further formatting
	 *
	 * @param {float} fValue float number e.g. 10.1
	 * @return {string} decimal number
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


	/**
	 * Returns the scaling factor which is calculated based on the format options and the current locale being used.
	 *
	 * This function returns meaningful scaling factor only when the formatting option 'style' is set to 'short' or 'long' and the option 'shortRefNumber' is set which
	 * is used for calculating the scale factor.
	 *
	 * Consider using this function when the option 'showScale' is set to false which makes the scale factor not to appear in every formatted number but in a shared place.
	 *
	 * @since 1.40
	 * @returns {string|undefined} The scale string if it exists based on the given 'shortRefNumber' option. Otherwise it returns undefined.
	 */
	NumberFormat.prototype.getScale = function() {
		if ((this.oFormatOptions.style !== "short" && this.oFormatOptions.style !== "long") || this.oFormatOptions.shortRefNumber === undefined) {
			return;
		}

		var oShortFormat = getShortenedFormat(this.oFormatOptions.shortRefNumber, this.oFormatOptions, this.oLocaleData),
			sScale;
		if (oShortFormat && oShortFormat.formatString) {
			// remove the placeholder of number
			// replace the "'.'" with "."
			// trim to remove the space and non-breakable space
			sScale = oShortFormat.formatString.replace(rNumPlaceHolder, "").replace(/'.'/g, ".").trim();
			if (sScale) {
				// sScale could be an empty string and undefined should be returned in this case
				return sScale;
			}
		}
	};

	NumberFormat._shiftDecimalPoint = function(vValue, iStep) {
		if (typeof iStep !== "number") {
			return NaN;
		}

		var aExpParts = vValue.toString().toLowerCase().split("e");

		if (typeof vValue === "number") {
			// Exponential operation is used instead of simply multiply the number by
			// Math.pow(10, maxFractionDigits) because Exponential operation returns exact float
			// result but multiply doesn't. For example 1.005*100 = 100.49999999999999.

			iStep = aExpParts[1] ? (+aExpParts[1] + iStep) : iStep;

			return +(aExpParts[0] + "e" + iStep);
		} else if (typeof vValue === "string") {
			if (parseFloat(vValue) === 0 && iStep >= 0) {
				return vValue;
			}

			vValue = aExpParts[0];

			var iDecimalPos = vValue.indexOf("."),
					// the expected position after move
					iAfterMovePos,
					// the integer part in the final result
					sInt,
					// the decimal part in the final result
					sDecimal;

			if (iDecimalPos === -1) {
				// when there's no decimal point, add one to the end
				vValue = vValue + ".";
				iDecimalPos = vValue.length - 1;
			}

			if (aExpParts[1]) {
				iDecimalPos += (+aExpParts[1]);
			}

			iAfterMovePos = iDecimalPos + iStep;
			if (iAfterMovePos <= 0) {
				// pad 0 to the left when decimal point should be shifted far left
				vValue = vValue.padStart(vValue.length - iAfterMovePos + 1, '0');
				iAfterMovePos = 1;
			} else if (iAfterMovePos >= vValue.length - 1) {
				// pad 0 to the right
				vValue = vValue.padEnd(iAfterMovePos + 1, '0');
				iAfterMovePos = vValue.length - 1;
			}

			vValue = vValue.replace(".", "");

			sInt = vValue.substring(0, iAfterMovePos);
			sDecimal = vValue.substring(iAfterMovePos);

			// remove unnecessary leading zeros
			sInt = sInt.replace(/^(-?)0+(\d)/, "$1$2");

			return sInt + (sDecimal ? ("." + sDecimal) : "");
		} else {
			// can't shift decimal point in this case
			return null;
		}
	};

	function getShortenedFormat(fValue, oOptions, oLocaleData, bIndianCurrency) {
		var oShortFormat, iKey, sKey, sCldrFormat,
			sStyle = oOptions.style,
			iPrecision = oOptions.precision !== undefined ? oOptions.precision : 2;

		if (sStyle != "short" && sStyle != "long") {
			return undefined;
		}

		for (var i = 0; i < 15; i++) {
			iKey = Math.pow(10, i);
			if (rounding(Math.abs(fValue) / iKey, iPrecision - 1) < 10) {
				break;
			}
		}
		sKey = iKey.toString();

		// Use "other" format to find the right magnitude, the actual format will be retrieved later
		// after the value has been calculated
		if (bIndianCurrency) {
			sCldrFormat = getIndianCurrencyFormat(sStyle, sKey, "other", true);
		} else {
			sCldrFormat = oLocaleData.getDecimalFormat(sStyle, sKey, "other");
		}

		if (!sCldrFormat || sCldrFormat == "0") {
			//no format or special "0" format => number doesn't need to be shortified
			return undefined;
		} else {
			oShortFormat = {};
			oShortFormat.key = sKey;
			oShortFormat.formatString = sCldrFormat;
			var match = sCldrFormat.match(rNumPlaceHolder);
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
				} else {
					oShortFormat.decimals = oShortFormat.valueSubString.length -  decimalSeparatorPosition - 1;
					oShortFormat.magnitude = iKey * Math.pow(10,1 - decimalSeparatorPosition);
				}
			} else {
				//value pattern has not be recognized
				//we cannot shortify
				return undefined;
			}
		}

		return oShortFormat;

	}

	function getNumberFromShortened(sValue, oLocaleData, bIndianCurrency) {
		var sNumber,
			iFactor = 1,
			iKey = 10,
			aPluralCategories = oLocaleData.getPluralCategories(),
			sCldrFormat,
			bestResult = {number: undefined,
				factor: iFactor},
			fnGetFactor = function(sPlural, iKey, sStyle, bIndian) {
				if (bIndian) {
					sCldrFormat = getIndianCurrencyFormat(sStyle, iKey.toString(), sPlural, true);
				} else {
					sCldrFormat = oLocaleData.getDecimalFormat(sStyle, iKey.toString(), sPlural);
				}

				if (sCldrFormat) {
					// Note: CLDR uses a non-breaking space in the format string
					// remove right-to-left mark u+200f character
					sCldrFormat = sCldrFormat.replace(/[\s\u00a0\u200F]/g, "");
					//formatString may contain '.' (quoted to differentiate them decimal separator)
					//which must be replaced with .
					sCldrFormat = sCldrFormat.replace(/'.'/g, ".");
					var match = sCldrFormat.match(rNumPlaceHolder);
					if (match) {
						// determine unit -> may be on the beginning e.g. for he
						var sValueSubString = match[0];
						var sUnit = sCldrFormat.replace(sValueSubString, "");
						if (!sUnit) {
							// If there's no scale defined in the pattern, skip the pattern
							return;
						}
						var iIndex = sValue.indexOf(sUnit);
						if (iIndex >= 0) {
							// parse the number part like every other number and then use the factor to get the real number
							sNumber = sValue.replace(sUnit, "");
							// remove right-to-left mark u+200f character
							sNumber = sNumber.replace(/\u200F/g, "");
							iFactor = iKey;
							// spanish numbers e.g. for MRD in format for "one" is "00 MRD" therefore factor needs to be adjusted
							// german numbers e.g. for Mrd. in format for "one" is "0 Mrd." therefore number does not need to be adjusted
							//    "0" => magnitude = key
							//    "00"  => magnitude = key / 10
							//    "000" => magnitude = key / 100
							iFactor *= Math.pow(10, 1 - sValueSubString.length);

							// if best result has no number yet or the new number is smaller that the current one set the new number as best result
							if (bestResult.number === undefined || sNumber.length < bestResult.number.length) {
								bestResult.number = sNumber;
								bestResult.factor = iFactor;
							}
						}
					}
				}
			};
		// iterate over all formats. Max:  100 000 000 000 000
		// find best result as format can have multiple matches:
		// * value can be contained one in another (de-DE): "Million" and "Millionen"
		// * end with each other (es-ES): "mil millones" and "millones"
		["long", "short"].forEach(function(sStyle) {
			iKey = 10;
			while (iKey < 1e15) {
				for (var i = 0; i < aPluralCategories.length; i++) {
					var sPluralCategory = aPluralCategories[i];
					fnGetFactor(sPluralCategory, iKey, sStyle);
				}
				iKey = iKey * 10;
			}
		});

		// For india currencies try lakhs/crores
		if (bIndianCurrency && !sNumber) {
			iKey = 10;
			while (iKey < 1e15) {
				for (var i = 0; i < aPluralCategories.length; i++) {
					var sPluralCategory = aPluralCategories[i];
					fnGetFactor(sPluralCategory, iKey, "short", true);
				}
				iKey = iKey * 10;
			}
		}

		if (!sNumber) {
			return;
		}

		return bestResult;

	}

	function getIndianCurrencyFormat(sStyle, sKey, sPlural, bDecimal) {
		var sFormat,
			oFormats = {
				"short": {
					"1000-one": "¤0000",
					"1000-other": "¤0000",
					"10000-one": "¤00000",
					"10000-other": "¤00000",
					"100000-one": "¤0 Lk",
					"100000-other": "¤0 Lk",
					"1000000-one": "¤00 Lk",
					"1000000-other": "¤00 Lk",
					"10000000-one": "¤0 Cr",
					"10000000-other": "¤0 Cr",
					"100000000-one": "¤00 Cr",
					"100000000-other": "¤00 Cr",
					"1000000000-one": "¤000 Cr",
					"1000000000-other": "¤000 Cr",
					"10000000000-one": "¤0000 Cr",
					"10000000000-other": "¤0000 Cr",
					"100000000000-one": "¤00000 Cr",
					"100000000000-other": "¤00000 Cr",
					"1000000000000-one": "¤0 Lk Cr",
					"1000000000000-other": "¤0 Lk Cr",
					"10000000000000-one": "¤00 Lk Cr",
					"10000000000000-other": "¤00 Lk Cr",
					"100000000000000-one": "¤0 Cr Cr",
					"100000000000000-other": "¤0 Cr Cr"
				}
			};
		sStyle = "short";
		if (sPlural !== "one") {
			sPlural = "other";
		}
		sFormat = oFormats[sStyle][sKey + "-" + sPlural];
		if (sFormat && bDecimal) {
			sFormat = sFormat.substr(1);
		}
		return sFormat;
	}

	function rounding(fValue, iMaxFractionDigits, sRoundingMode) {
		if (typeof fValue !== "number") {
			return NaN;
		}

		sRoundingMode = sRoundingMode || NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO;
		iMaxFractionDigits = parseInt(iMaxFractionDigits, 10);

		if (typeof sRoundingMode === "function") {
			// Support custom function for rounding the number
			fValue = sRoundingMode(fValue, iMaxFractionDigits);
		} else {
			if (!iMaxFractionDigits) {
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
			fValue =  NumberFormat._shiftDecimalPoint(mRoundingFunction[sRoundingMode](NumberFormat._shiftDecimalPoint(fValue, iMaxFractionDigits)), -iMaxFractionDigits);
		}

		return fValue;
	}

	function quote(sRegex) {
		return sRegex.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	}

	function getDecimals(fValue, iPrecision) {
		var iIntegerDigits = Math.floor(Math.log(Math.abs(fValue)) / Math.LN10);
		return Math.max(0, iPrecision - iIntegerDigits - 1);
	}

	/**
	 * Returns the cldr code and the number value by checking each pattern and finding the best match.
	 *
	 * 1. iterate over each unit pattern, e.g. "{0}m", "{0}km"
	 * 1a. convert it to a reg exp pattern, e.g. "^(.+)m$"
	 * 1b. match it with the input "12km" and store the value "12k" and the unit value "m"
	 * 1c. do this for each pattern and update the best result if a better match is found
	 *
	 * A better match means most of the unit value matched and the number match is shorter.
	 * E.g. input: 12km matches for the pattern "^(.+)m$" and the resulting value is "12k"
	 * while the pattern "^(.+)km$" results in "12".
	 * Since pattern "^(.+)km$" returns a shorter result it is considered the better match.
	 *
	 * Note: the cldr data is not distinct in its patterns.
	 * E.g. "100 c" could be in "en_gb" either 100 units of "volume-cup" or "duration-century" both having the same pattern "{0} c"
	 * Therefore best matches will be returned in an array.
	 *
	 * @param {object} mUnitPatterns the unit patterns
	 * @param {string} sValue The value e.g. "12 km"
	 * @return {object} An object containing the unit codes (key: <code>[cldrCode]</code>) and the number value (key: <code>numberValue</code>).
	 * Values are <code>undefined</code> or an empty array if not found. E.g. <code>{
			numberValue: 12,
			cldrCode: [length-kilometer]
		}</code>
	 */
	function parseNumberAndUnit(mUnitPatterns, sValue) {
		var oBestMatch = {
			numberValue: undefined,
			cldrCode: []
		};
		var iBestLength;
		var sUnitCode, sKey;
		for (sUnitCode in mUnitPatterns) {
			for (sKey in mUnitPatterns[sUnitCode]) {
				//use only unit patterns
				if (sKey.indexOf("unitPattern") === 0) {
					var sUnitPattern = mUnitPatterns[sUnitCode][sKey];

					// sample input: e.g. "mi 12 tsd. ms²"
					// unit pattern: e.g. "mi {0} ms²"
					// regex from pattern: "^mi (.+) ms²$"
					// match regex against input to get number.
					// The smallest resulting number (String length) will be the best match
					var bContainsExpression = sUnitPattern.indexOf("{0}") > -1;
					if (bContainsExpression) {

						//escape regex characters to match it properly
						sUnitPattern = "^" + escapeRegExp(sUnitPattern).replace("\\{0\\}", "(.+)") + "$";

						var regexp = new RegExp(sUnitPattern);
						var match = regexp.exec(sValue);
						if (match && match[1]) {
							//get the match with the shortest result.
							// e.g. 1km -> (.+)m -> "1k" -> length 2
							// e.g. 1km -> (.+)km -> "1" -> length 1

							if (iBestLength === undefined || match[1].length < iBestLength) {
								iBestLength = match[1].length;
								oBestMatch.numberValue = match[1];
								oBestMatch.cldrCode = [sUnitCode];
							} else if (match[1].length === iBestLength && oBestMatch.cldrCode.indexOf(sUnitCode) === -1) {
								//ambiguous unit (en locale)
								// e.g. 100 c -> (.+) c -> duration-century
								// e.g. 100 c -> (.+) c -> volume-cup
								oBestMatch.cldrCode.push(sUnitCode);
							}
						}
					} else if (sUnitPattern === sValue) {
						oBestMatch.cldrCode = [sUnitCode];

						//for units which do not have a number representation, get the number from the pattern
						var sNumber;
						if (sKey.endsWith("-zero")) {
							sNumber = "0";
						} else if (sKey.endsWith("-one")) {
							sNumber = "1";
						} else if (sKey.endsWith("-two")) {
							sNumber = "2";
						}
						oBestMatch.numberValue = sNumber;
						return oBestMatch;
					}
				}
			}
		}

		return oBestMatch;
	}


	return NumberFormat;

});