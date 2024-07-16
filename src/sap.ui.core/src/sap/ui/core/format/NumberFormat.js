/*!
 * ${copyright}
 */

// Provides class sap.ui.core.format.NumberFormat
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	'sap/ui/base/Object',
	'sap/ui/core/Locale',
	'sap/ui/core/LocaleData',
	'sap/ui/core/Supportability',
	'sap/ui/core/format/FormatUtils',
	'sap/base/Log',
	'sap/base/assert',
	'sap/base/util/extend'
],
	function(Formatting, Localization, BaseObject, Locale, LocaleData, Supportability, FormatUtils, Log, assert, extend) {
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
	 * @alias sap.ui.core.format.NumberFormat
	 * @extends sap.ui.base.Object
	 */
	var NumberFormat = BaseObject.extend("sap.ui.core.format.NumberFormat", /** @lends sap.ui.core.format.NumberFormat.prototype */ {
		constructor : function(oFormatOptions) {
			// Do not use the constructor
			throw new Error();
		}
	});

	const rAllWhiteSpaces = /\s/g;
	const rDigit = /\d/;
	// Regex for checking if a number has leading zeros
	const rLeadingZeros = /^(-?)0+(\d)/;
	// Not matching Sc (currency symbol) and Z (separator) characters
	// https://www.unicode.org/reports/tr44/#General_Category_Values
	const rNotSAndNotZ = /[^\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6\u0020\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
	// Regex for matching the number placeholder in pattern
	const rNumPlaceHolder = /0+(\.0+)?/;
	// Regex for checking that the given string only consists of '0' characters
	const rOnlyZeros = /^0+$/;
	// A regular expresssion that can be used to remove a leading "-" from a number representing zero,
	// e.g. "-0", or "-0.00"; $1 contains the number without the leading "-"
	const rRemoveMinusFromZero = /^-(0(?:.0+)?)$/;
	// A regular expression that can be used to remove trailing zeros from a number
	const rTrailingZeros = /0+$/;

	/*
	 * Is used to validate existing grouping separators.
	 * e.g. yyy.yyy.yyy -> /^\d+(?:\.?\d{3})*\.?\d{3}$/
	 */
	var getGroupingRegExp = function(groupingSeparator, groupingSize, groupingBaseSize) {
		var sGroupingEscaped = quote(groupingSeparator);
		return new RegExp("^\\d+"
			+ "(?:" + sGroupingEscaped + "?" + "\\d{" + groupingSize + "}" + ")*"
			+ "" + sGroupingEscaped + "?" + "\\d{" + groupingBaseSize + "}" + "$");
	};

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
	 * Specifies a rounding behavior for numerical operations capable of discarding precision. Each rounding mode in
	 * this object indicates how the least significant returned digits of rounded result are to be calculated.
	 *
	 * @public
	 * @enum {string}
	 * @alias sap.ui.core.format.NumberFormat.RoundingMode
	 */
	var mRoundingMode = {
		/**
		 * Rounding mode to round towards negative infinity; examples of rounding results to one fractional digit: 0.51
		 * is rounded to 0.5, and -0.51 is rounded to -0.6.
		 * @public
		 * @type {string}
		 */
		FLOOR: "FLOOR",
		/**
		 * Rounding mode to round towards positive infinity; examples of rounding results to one fractional digit: 0.51
		 * is rounded to 0.6, and -0.51 is rounded to -0.5.
		 * @public
		 * @type {string}
		 */
		CEILING: "CEILING",
		/**
		 * Rounding mode to round towards zero; examples of rounding results to one fractional digit: 0.59 is rounded to
		 * 0.5, and -0.59 is rounded to -0.5.
		 * @public
		 * @type {string}
		 */
		TOWARDS_ZERO: "TOWARDS_ZERO",
		/**
		 * Rounding mode to round away from zero; examples of rounding results to one fractional digit: 0.51 is rounded
		 * to 0.6, and -0.51 is rounded to -0.6.
		 * @public
		 * @type {string}
		 */
		AWAY_FROM_ZERO: "AWAY_FROM_ZERO",
		/**
		 * Rounding mode to round towards the nearest neighbor, unless both neighbors are equidistant, in which case
		 * round towards negative infinity; examples of rounding results to one fractional digit: 0.54 or 0.46 are
		 * rounded to 0.5, -0.54 or -0.46 are rounded to -0.5, 0.55 is rounded to 0.5, and -0.55 is rounded to -0.6.
		 * @public
		 * @type {string}
		 */
		HALF_FLOOR: "HALF_FLOOR",
		/**
		 * Rounding mode to round towards the nearest neighbor, unless both neighbors are equidistant, in which case
		 * round towards positive infinity; examples of rounding results to one fractional digit: 0.54 or 0.46 are
		 * rounded to 0.5, -0.54 or -0.46 are rounded to -0.5, 0.55 is rounded to 0.6, and -0.55 is rounded to -0.5.
		 * @public
		 * @type {string}
		 */
		HALF_CEILING: "HALF_CEILING",
		/**
		 * Rounding mode to round towards the nearest neighbor, unless both neighbors are equidistant, in which case
		 * round towards zero; examples of rounding results to one fractional digit: 0.54 or 0.46 are rounded to 0.5,
		 * -0.54 or -0.46 are rounded to -0.5, 0.55 is rounded to 0.5, and -0.55 is rounded to -0.5.
		 * @public
		 * @type {string}
		 */
		HALF_TOWARDS_ZERO: "HALF_TOWARDS_ZERO",
		/**
		 * Rounding mode to round towards the nearest neighbor unless, both neighbors are equidistant, in which case
		 * round away from zero; examples of rounding results to one fractional digit: 0.54 or 0.46 are rounded to 0.5,
		 * -0.54 or -0.46 are rounded to -0.5, 0.55 is rounded to 0.6, and -0.55 is rounded to -0.6.
		 * @public
		 * @type {string}
		 */
		HALF_AWAY_FROM_ZERO: "HALF_AWAY_FROM_ZERO"
	};

	/**
	 * Adds the summand given as a number to an decimal given as a string.
	 *
	 * @param {string} sDecimal A positive or negative decimal number as string
	 * @param {int} iSummand An integer between -9 and 9 to be added to the given decimal number
	 * @returns {string} The sum of the two numbers as a string
	 *
	 * @private
	 */
	NumberFormat.add = function (sDecimal, iSummand) {
		const aParts = sDecimal.split(".");
		let sInteger = aParts[0];
		const sFractionPart = aParts[1];
		const bNegative = sInteger[0] === "-";
		if (bNegative) {
			sInteger = sInteger.slice(1);
			iSummand = -iSummand;
		}
		const aDigits = sInteger.split("").map(Number);
		const iLastIndex = aDigits.length - 1;
		aDigits[iLastIndex] += iSummand;
		for (let i = iLastIndex; i >= 0; i -= 1) {
			if (aDigits[i] >= 10) {
				aDigits[i] = aDigits[i] % 10;
				if (i === 0) {
					aDigits.unshift(1);
					break;
				}
				aDigits[i - 1] += 1;
			} else if (aDigits[i] < 0 && i > 0) {
				aDigits[i] = 10 + aDigits[i];
				aDigits[i - 1] -= 1;
				if (i === 1 && aDigits[0] === 0) {
					aDigits.shift();
					break;
				}
			} else {
				break;
			}
		}
		if (bNegative) {
			aDigits[0] = -aDigits[0];
		}
		let sResult = aDigits.join("");
		if (!sFractionPart) {
			return sResult;
		}

		// If sResult is 0, the sign may be lost and has to be restored, e.g. "-5.123" + 5 => -5 + 5 = 0 => "-0.123"
		sResult = sResult === "0" && bNegative ? "-0" : sResult;
		const sResultSign = sResult[0] === "-" ? "-" : "";
		// If both signs are equal, the fraction part can simply be appended
		if (bNegative === !!sResultSign) {
			return sResult + "." + sFractionPart;
		}

		// If the signs are different, aDigits contains only one digit which is different from zero; to compute the
		// result, the result sign has to be kept, the integer part is the absolute sResult reduced by one, and the
		// fractional part is (1 - fractional part), e.g. "2.123" - 5 => 2 - 5 = -3 => sign = "-", integer part is
		// |-3| - 1 = 2 and fractional part is 1 - 0.123 = 0.877 without the leading "0." => "-2.877"
		const aFractionDigits = sFractionPart.split("").map(Number);
		for (let i = aFractionDigits.length - 1; i >= 0; i -= 1) {
			aFractionDigits[i] = 10 - aFractionDigits[i];
			if (i > 0) {
				aFractionDigits[i - 1] += 1;
			}
		}
		return sResultSign + (Math.abs(aDigits[0]) - 1) + "." + aFractionDigits.join("");
	};

	/**
	 * Derives the maximal possible decimals from the given format option's <code>maxFractionDigits</code>
	 * and <code>decimals</code> properties.
	 *
	 * If <code>decimals</code> and <code>maxFractionDigits</code> are >= 0, then the minimum of
	 * <code>maxFractionDigits</code> and <code>decimals</code> is returned, - otherwise
	 * <code>decimals</code> is returned.
	 *
	 * @param {object} oFormatOptions
	 * @param {int} [oFormatOptions.decimals]
	 *   The number of decimal digits
	 * @param {int} [oFormatOptions.maxFractionDigits]
	 *   The maximum number of decimal digits
	 * @returns {int}
	 *   The maximum decimals to be used
	 *
	 * @private
	 * @static
	 */
	NumberFormat.getMaximalDecimals = function ({decimals, maxFractionDigits}) {
		if (maxFractionDigits >= 0 && decimals > 0 && maxFractionDigits < decimals) {
			return maxFractionDigits;
		}
		return decimals;
	};

	/**
	 * Rounds the given number up to the smallest integer greater than or equal to the given number.
	 *
	 * @param {number|string} vNumber
	 *   The number to be rounded up; it has at least one digit in front of the decimal point in case of type "string"
	 * @returns {number|string}
	 *   The smallest integer greater than or equal to the given number; the returned type is the same as the type of
	 *   the given number
	 */
	function ceil(vNumber) {
		if (typeof vNumber === "number") {
			return Math.ceil(vNumber);
		}

		const [sIntegerPart, sFractionPart = "0"] = vNumber.split(".");
		return rOnlyZeros.test(sFractionPart) || sIntegerPart[0] === "-"
			? sIntegerPart
			: NumberFormat.add(sIntegerPart, 1);
	}

	/**
	 * Rounds the given number down to the largest integer less than or equal to the given number.
	 *
	 * @param {number|string} vNumber
	 *   The number to be rounded down; it has at least one digit in front of the decimal point in case of type "string"
	 * @returns {number|string}
	 *   The largest integer less than or equal to the given number; the returned type is the same as the type of the
	 *   given number
	 */
	function floor(vNumber) {
		if (typeof vNumber === "number") {
			return Math.floor(vNumber);
		}

		const [sIntegerPart, sFractionPart = "0"] = vNumber.split(".");
		return rOnlyZeros.test(sFractionPart) || sIntegerPart[0] !== "-"
			? sIntegerPart
			: NumberFormat.add(sIntegerPart, -1);
	}

	/**
	 * Adds 0.5 to or subtracts 0.5 from the given number.
	 *
	 * @param {number|string} vNumber
	 *   The number to be increased or decreased by 0.5
	 * @param {boolean} bIncrease
	 *   Whether to increase the number by 0.5; otherwise the number is decreased by 0.5
	 * @returns {number|string}
	 *   The number increased or decreased by 0.5; the returned type is the same as the type of the given number
	 */
	function increaseOrDecreaseByHalf(vNumber, bIncrease) {
		if (typeof vNumber === "number") {
			return bIncrease ? vNumber + 0.5 : vNumber - 0.5;
		}

		vNumber = NumberFormat._shiftDecimalPoint(vNumber, 1);
		vNumber = NumberFormat.add(vNumber, bIncrease ? 5 : -5);
		return NumberFormat._shiftDecimalPoint(vNumber, -1);
	}

	const mRoundingFunction = {
		[mRoundingMode.FLOOR]: floor,
		[mRoundingMode.CEILING]: ceil,
		[mRoundingMode.TOWARDS_ZERO]: (vNumber) => (vNumber > 0 ? floor(vNumber) : ceil(vNumber)),
		[mRoundingMode.AWAY_FROM_ZERO]: (vNumber) => (vNumber > 0 ? ceil(vNumber) : floor(vNumber)),
		[mRoundingMode.HALF_TOWARDS_ZERO]: (vNumber) => {
			const bPositive = vNumber > 0;
			vNumber = increaseOrDecreaseByHalf(vNumber, !bPositive);
			return bPositive ? ceil(vNumber) : floor(vNumber);
		},
		[mRoundingMode.HALF_AWAY_FROM_ZERO]: (vNumber) => {
			const bPositive = vNumber > 0;
			vNumber = increaseOrDecreaseByHalf(vNumber, bPositive);
			return bPositive ? floor(vNumber) : ceil(vNumber);
		},
		[mRoundingMode.HALF_FLOOR]: (vNumber) => ceil(increaseOrDecreaseByHalf(vNumber, false)),
		[mRoundingMode.HALF_CEILING]: (vNumber) => floor(increaseOrDecreaseByHalf(vNumber, true))
	};

	NumberFormat.RoundingMode = mRoundingMode;

	/*
	 * Default format options for Integer
	 */
	NumberFormat.oDefaultIntegerFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		minFractionDigits: 0,
		maxFractionDigits: 0,
		strictGroupingValidation: false,
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
		showNumber: true,
		parseAsString: false,
		preserveDecimals: false,
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
		strictGroupingValidation: false,
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
		showNumber: true,
		parseAsString: false,
		preserveDecimals: false,
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
		strictGroupingValidation: false,
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
		showNumber: true,
		parseAsString: false,
		preserveDecimals: false,
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
		strictGroupingValidation: false,
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
		showNumber: true,
		customCurrencies: undefined,
		parseAsString: false,
		preserveDecimals: false,
		roundingMode: NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO,
		emptyString: NaN,
		showScale: true,
		// The 'precision' format option is ignored because the number of decimals shouldn't
		// depend on the number of integer part of a number
		ignorePrecision: true
	};

	/*
	 * Default format options for Unit (type is CLDR)
	 * @name sap.ui.core.format.NumberFormat.oDefaultUnitFormat
	 */
	NumberFormat.oDefaultUnitFormat = {
		minIntegerDigits: 1,
		maxIntegerDigits: 99,
		strictGroupingValidation: false,
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
		showNumber: true,
		customUnits: undefined,
		allowedUnits: undefined,
		parseAsString: false,
		preserveDecimals: false,
		roundingMode: NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO,
		emptyString: NaN,
		showScale: true
	};

	/**
	 * An alias for {@link #getFloatInstance}.
	 *
	 * @param {object} [oFormatOptions] Object which defines the format options. See the documentation of
	 *  {@link #getFloatInstance} for the parameters
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
	 * <p>
	 * This instance has HALF_AWAY_FROM_ZERO set as default rounding mode.
	 * Please set the roundingMode property in oFormatOptions to change the
	 * default value.
	 * </p>
	 *
	 * The following example shows how grouping is done:
	 * <pre>
	 * var oFormat = NumberFormat.getFloatInstance({
	 *     "groupingEnabled": true,  // grouping is enabled
	 *     "groupingSeparator": '.', // grouping separator is '.'
	 *     "groupingSize": 3,        // the amount of digits to be grouped (here: thousand)
	 *     "decimalSeparator": ","   // the decimal separator must be different from the grouping separator
	 * });
	 *
	 * oFormat.format(1234.56); // "1.234,56"
	 * </pre>
	 *
	 * @param {object} [oFormatOptions] The option object, which supports the following parameters.
	 *   If no options are given, default values according to the type and locale settings are used.
	 * @param {int} [oFormatOptions.decimals] defines the number of decimal digits
	 * @param {string} [oFormatOptions.decimalSeparator] defines the character used as decimal separator.
	 *   Note: <code>decimalSeparator</code> must always be different from <code>groupingSeparator</code>.
	 * @param {null|number|string} [oFormatOptions.emptyString=NaN] since 1.30.0 defines what an empty string
	 *   is parsed as, and what is formatted as an empty string. The allowed values are "" (empty string),
	 *   NaN, <code>null</code>, or 0.
	 *   The 'format' and 'parse' functions are done in a symmetric way. For example, when this
	 *   parameter is set to NaN, an empty string is parsed as NaN, and NaN is formatted as an empty
	 *   string.
	 * @param {int} [oFormatOptions.groupingBaseSize=3] defines the grouping base size in digits if
	 *   it is different from the grouping size (e.g. Indian grouping)
	 * @param {boolean} [oFormatOptions.groupingEnabled=true] defines whether grouping is enabled
	 *   (grouping separators are shown)
	 * @param {string} [oFormatOptions.groupingSeparator] defines the character used as grouping separator.
	 *   Note: <code>groupingSeparator</code> must always be different from <code>decimalSeparator</code>.
	 * @param {int} [oFormatOptions.groupingSize=3] defines the grouping size in digits; the default
	 *   is <code>3</code>. It must be a positive number.
	 * @param {int} [oFormatOptions.maxFractionDigits=99] defines the maximum number of decimal digits
	 * @param {int} [oFormatOptions.maxIntegerDigits=99] defines the maximum number of non-decimal digits.
	 *   If the number exceeds this maximum, e.g. 1e+120, "?" characters are shown instead of digits.
	 * @param {int} [oFormatOptions.minFractionDigits=0] defines the minimal number of decimal digits
	 * @param {int} [oFormatOptions.minIntegerDigits=1] defines the minimal number of non-decimal digits
	 * @param {string} [oFormatOptions.minusSign] defines the used minus symbol
	 * @param {boolean} [oFormatOptions.parseAsString=false] since 1.28.2 defines whether to output
	 *   the string from the parse function in order to keep the precision for big numbers. Numbers
	 *   in scientific notation are parsed back to standard notation. For example, "5e-3" is parsed
	 *   to "0.005".
	 * @param {string} [oFormatOptions.pattern] CLDR number pattern which is used to format the number
	 * @param {string} [oFormatOptions.plusSign] defines the used plus symbol
	 * @param {int} [oFormatOptions.precision] defines the numerical precision; the number of decimals
	 *   is calculated dependent on the integer digits
	 * @param {boolean} [oFormatOptions.preserveDecimals=false] Whether {@link #format} preserves
	 *   decimal digits except trailing zeros in case there are more decimals than the
	 *   <code>maxFractionDigits</code> format option allows.
	 *   If decimals are not preserved, the formatted number is rounded to <code>maxFractionDigits</code>.
	 * @param {sap.ui.core.format.NumberFormat.RoundingMode} [oFormatOptions.roundingMode=HALF_AWAY_FROM_ZERO]
	 *   Specifies the rounding behavior for discarding the digits after the maximum fraction digits
	 *   defined by <code>maxFractionDigits</code>.
	 *   This can be assigned
	 *   <ul>
	 *     <li>by value in {@link sap.ui.core.format.NumberFormat.RoundingMode RoundingMode},</li>
	 *     <li>via a function that is used for rounding the number and takes two parameters: the number itself, and the
	 *         number of decimal digits that should be reserved. <b>Using a function is deprecated since 1.121.0</b>;
	 *         string based numbers are not rounded via this custom function.</li>
	 *   </ul>
	 * @param {int} [oFormatOptions.shortDecimals] defines the number of decimal in the shortened format string. If this isn't specified, the 'decimals' options is used
	 * @param {int} [oFormatOptions.shortLimit] only use short number formatting for values above this limit
	 * @param {int} [oFormatOptions.shortRefNumber] since 1.40 specifies a number from which the scale factor for 'short' or 'long' style format is generated. The generated scale factor is
	 *  used for all numbers which are formatted with this format instance. This option has effect only when the option 'style' is set to 'short' or 'long'. This option is by default set
	 *  with <code>undefined</code> which means the scale factor is selected automatically for each number being formatted.
	 * @param {boolean} [oFormatOptions.showScale=true] since 1.40 specifies whether the scale factor is shown in the formatted number. This option takes effect only when the 'style' options is set to either 'short' or 'long'.
	 * @param {boolean} [oFormatOptions.strictGroupingValidation=false] whether the positions of grouping separators are validated. Space characters used as grouping separators are not validated.
	 * @param {string} [oFormatOptions.style=standard] defines the style of format. Valid values are
	 *   'short, 'long' or 'standard' (based on the CLDR decimalFormat). When set to 'short' or 'long',
	 *   numbers are formatted into compact forms. When this option is set, the default value of the
	 *   'precision' option is set to 2. This can be changed by setting either min/maxFractionDigits,
	 *   decimals, shortDecimals, or the 'precision' option itself.
	 * @param {sap.ui.core.Locale} [oLocale]
	 *   The locale to get the formatter for; if no locale is given, a locale for the currently configured language is
	 *   used; see {@link module:sap/base/i18n/Formatting.getLanguageTag Formatting.getLanguageTag}
	 * @return {sap.ui.core.format.NumberFormat} float instance of the NumberFormat
	 * @static
	 * @public
	 */
	NumberFormat.getFloatInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, mNumberType.FLOAT);

		oFormat.oFormatOptions = extend({}, this.oDefaultFloatFormat, oLocaleFormatOptions, oFormat.oOriginalFormatOptions);
		return oFormat;
	};

	/**
	 * Get an integer instance of the NumberFormat, which can be used for formatting.
	 *
	 * <p>
	 * This instance has TOWARDS_ZERO set as default rounding mode.
	 * Please set the roundingMode property in oFormatOptions to change the
	 * default value.
	 * </p>
	 *
	 * The following example shows how grouping is done:
	 * <pre>
	 * var oFormat = NumberFormat.getIntegerInstance({
	 *     "groupingEnabled": true,  // grouping is enabled
	 *     "groupingSeparator": '.', // grouping separator is '.'
	 *     "groupingSize": 3         // the amount of digits to be grouped (here: thousand)
	 * });
	 *
	 * oFormat.format(1234); // "1.234"
	 * </pre>
	 *
	 * @param {object} [oFormatOptions] The option object, which supports the following parameters.
	 *   If no options are given, default values according to the type and locale settings are used.
	 * @param {int} [oFormatOptions.decimals] defines the number of decimal digits
	 * @param {string} [oFormatOptions.decimalSeparator] defines the character used as decimal separator.
	 *   Note: <code>decimalSeparator</code> must always be different from <code>groupingSeparator</code>.
	 * @param {null|number|string} [oFormatOptions.emptyString=NaN] since 1.30.0 defines what an empty string
	 *   is parsed as, and what is formatted as an empty string. The allowed values are "" (empty string)
	 *   NaN, <code>null</code>, or 0.
	 *   The 'format' and 'parse' functions are done in a symmetric way. For example, when this
	 *   parameter is set to NaN, an empty string is parsed as NaN, and NaN is formatted as an empty
	 *   string.
	 * @param {int} [oFormatOptions.groupingBaseSize=3] defines the grouping base size in digits if
	 *   it is different from the grouping size (e.g. Indian grouping)
	 * @param {boolean} [oFormatOptions.groupingEnabled=false] defines whether grouping is enabled
	 *   (grouping separators are shown)
	 * @param {string} [oFormatOptions.groupingSeparator] defines the character used as grouping separator.
	 *   Note: <code>groupingSeparator</code> must always be different from <code>decimalSeparator</code>.
	 * @param {int} [oFormatOptions.groupingSize=3] defines the grouping size in digits; the default
	 *   is <code>3</code>. It must be a positive number.
	 * @param {int} [oFormatOptions.maxFractionDigits=0] defines the maximum number of decimal digits
	 * @param {int} [oFormatOptions.maxIntegerDigits=99] defines the maximum number of non-decimal digits.
	 *   If the number exceeds this maximum, e.g. 1e+120, "?" characters are shown instead of digits.
	 * @param {int} [oFormatOptions.minFractionDigits=0] defines the minimal number of decimal digits
	 * @param {int} [oFormatOptions.minIntegerDigits=1] defines the minimal number of non-decimal digits
	 * @param {string} [oFormatOptions.minusSign] defines the used minus symbol
	 * @param {boolean} [oFormatOptions.parseAsString=false] since 1.28.2 defines whether to output
	 *   the string from the parse function in order to keep the precision for big numbers. Numbers
	 *   in scientific notation are parsed back to standard notation. For example, "5e+3" is parsed
	 *   to "5000".
	 * @param {string} [oFormatOptions.pattern] CLDR number pattern which is used to format the number
	 * @param {string} [oFormatOptions.plusSign] defines the used plus symbol
	 * @param {int} [oFormatOptions.precision] defines the numerical precision; the number of decimals
	 *   is calculated dependent on the integer digits
	 * @param {boolean} [oFormatOptions.preserveDecimals=false] Whether {@link #format} preserves
	 *   decimal digits except trailing zeros in case there are more decimals than the
	 *   <code>maxFractionDigits</code> format option allows.
	 *   If decimals are not preserved, the formatted number is rounded to <code>maxFractionDigits</code>.
	 * @param {sap.ui.core.format.NumberFormat.RoundingMode} [oFormatOptions.roundingMode=TOWARDS_ZERO]
	 *   Specifies the rounding behavior for discarding the digits after the maximum fraction digits
	 *   defined by <code>maxFractionDigits</code>.
	 *   This can be assigned
	 *   <ul>
	 *     <li>by value in {@link sap.ui.core.format.NumberFormat.RoundingMode RoundingMode},</li>
	 *     <li>via a function that is used for rounding the number and takes two parameters: the number itself, and the
	 *         number of decimal digits that should be reserved. <b>Using a function is deprecated since 1.121.0</b>;
	 *         string based numbers are not rounded via this custom function.</li>
	 *   </ul>
	 * @param {int} [oFormatOptions.shortDecimals] defines the number of decimal in the shortened format string. If this isn't specified, the 'decimals' options is used
	 * @param {int} [oFormatOptions.shortLimit] only use short number formatting for values above this limit
	 * @param {int} [oFormatOptions.shortRefNumber] since 1.40 specifies a number from which the scale factor for 'short' or 'long' style format is generated. The generated scale factor is
	 *  used for all numbers which are formatted with this format instance. This option has effect only when the option 'style' is set to 'short' or 'long'. This option is by default set
	 *  with <code>undefined</code> which means the scale factor is selected automatically for each number being formatted.
	 * @param {boolean} [oFormatOptions.showScale=true] since 1.40 specifies whether the scale factor is shown in the formatted number. This option takes effect only when the 'style' options is set to either 'short' or 'long'.
	 * @param {boolean} [oFormatOptions.strictGroupingValidation=false] whether the positions of grouping separators are validated. Space characters used as grouping separators are not validated.
	 * @param {string} [oFormatOptions.style=standard] defines the style of format. Valid values are
	 *   'short, 'long' or 'standard' (based on the CLDR decimalFormat). When set to 'short' or 'long',
	 *   numbers are formatted into compact forms. When this option is set, the default value of the
	 *   'precision' option is set to 2. This can be changed by setting either min/maxFractionDigits,
	 *   decimals, shortDecimals, or the 'precision' option itself.
	 * @param {sap.ui.core.Locale} [oLocale]
	 *   The locale to get the formatter for; if no locale is given, a locale for the currently configured language is
	 *   used; see {@link module:sap/base/i18n/Formatting.getLanguageTag Formatting.getLanguageTag}
	 * @return {sap.ui.core.format.NumberFormat} integer instance of the NumberFormat
	 * @static
	 * @public
	 */
	NumberFormat.getIntegerInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, mNumberType.INTEGER);

		oFormat.oFormatOptions = extend({}, this.oDefaultIntegerFormat, oLocaleFormatOptions, oFormat.oOriginalFormatOptions);
		return oFormat;
	};

	/**
	 * Get a currency instance of the NumberFormat, which can be used for formatting.
	 *
	 * <p>
	 * This instance has HALF_AWAY_FROM_ZERO set as default rounding mode.
	 * Please set the roundingMode property in oFormatOptions to change the
	 * default value.
	 * </p>
	 *
	 * The currency instance supports locally defined custom currency exclusive to the created instance.
	 * The following example shows how to use custom currencies (e.g. for Bitcoins):
	 * <pre>
	 * var oFormat = NumberFormat.getCurrencyInstance({
	 *     "currencyCode": false,
	 *     "customCurrencies": {
	 *         "BTC": {
	 *             "symbol": "\u0243",
	 *             "decimals": 3
	 *         }
	 *     }
	 * });
	 *
	 * oFormat.format(123.4567, "BTC"); // "Ƀ 123.457"
	 * </pre>
	 *
	 * As an alternative to using a fixed <code>symbol</code> for your custom currencies, you can also provide an ISO-Code.
	 * The provided ISO-Code will be used to look up the currency symbol in the global configuration,
	 * either defined in the CLDR or custom defined on the Format Settings (see
	 * {@link module:sap/base/i18n/Formatting.setCustomCurrencies Formatting.setCustomCurrencies},
	 * {@link module:sap/base/i18n/Formatting.addCustomCurrencies Formatting.addCustomCurrencies}).
	 *
	 * If no symbol is given at all, the custom currency key is used for formatting.
	 *
	 * <pre>
	 * var oFormat = NumberFormat.getCurrencyInstance({
	 *     "currencyCode": false,
	 *     "customCurrencies": {
	 *         "MyDollar": {
	 *             "isoCode": "USD",
	 *             "decimals": 3
	 *         },
	 *         "Bitcoin": {
	 *             "decimals": 2
	 *         }
	 *     }
	 * });
	 *
	 * // symbol looked up from global configuration
	 * oFormat.format(123.4567, "MyDollar"); // "$123.457"
	 *
	 * // no symbol available, custom currency key is rendered
	 * oFormat.format(777.888, "Bitcoin"); // "Bitcoin 777.89"
	 * </pre>
	 *
	 * @param {object} [oFormatOptions] The option object, which supports the following parameters.
	 *   If no options are given, default values according to the type and locale settings are used.
	 * @param {boolean} [oFormatOptions.currencyCode=true] defines whether the currency is shown as
	 *   a code in currency format. The currency symbol is displayed when this option is set to
	 *   <code>false</code> and a symbol has been defined for the given currency code.
	 * @param {string} [oFormatOptions.currencyContext=standard] can be set either to 'standard'
	 *   (the default value) or to 'accounting' for an accounting-specific currency display
	 * @param {Object<string,object>} [oFormatOptions.customCurrencies] defines a set of custom currencies exclusive to this NumberFormat instance.
	 *   Custom currencies must not only consist of digits.
	 *   If custom currencies are defined on the instance, no other currencies can be formatted and parsed by this instance.
	 *   Globally available custom currencies can be added via the global configuration.
	 *   See the above examples.
	 *   See also {@link module:sap/base/i18n/Formatting.setCustomCurrencies Formatting.setCustomCurrencies} and
	 *   {@link module:sap/base/i18n/Formatting.addCustomCurrencies Formatting.addCustomCurrencies}.
	 * @param {int} [oFormatOptions.decimals] defines the number of decimal digits
	 * @param {string} [oFormatOptions.decimalSeparator] defines the character used as decimal separator.
	 *   Note: <code>decimalSeparator</code> must always be different from <code>groupingSeparator</code>.
	 * @param {null|number|string} [oFormatOptions.emptyString=NaN] since 1.30.0 defines what an empty string
	 *   is parsed as, and what is formatted as an empty string. The allowed values are "" (empty string),
	 *   NaN, <code>null</code>, or 0.
	 *   The 'format' and 'parse' functions are done in a symmetric way. For example, when this
	 *   parameter is set to NaN, an empty string is parsed as [NaN, undefined], and NaN is
	 *   formatted as an empty string.
	 * @param {int} [oFormatOptions.groupingBaseSize=3] defines the grouping base size in digits if
	 *   it is different from the grouping size (e.g. Indian grouping)
	 * @param {boolean} [oFormatOptions.groupingEnabled=true] defines whether grouping is enabled
	 *   (grouping separators are shown)
	 * @param {string} [oFormatOptions.groupingSeparator] defines the character used as grouping separator.
	 *   Note: <code>groupingSeparator</code> must always be different from <code>decimalSeparator</code>.
	 * @param {int} [oFormatOptions.groupingSize=3] defines the grouping size in digits; the default
	 *   is <code>3</code>. It must be a positive number.
	 * @param {int} [oFormatOptions.maxFractionDigits=99] defines the maximum number of decimal digits
	 * @param {int} [oFormatOptions.maxIntegerDigits=99] defines the maximum number of non-decimal digits.
	 *   If the number exceeds this maximum, e.g. 1e+120, "?" characters are shown instead of digits.
	 * @param {int} [oFormatOptions.minFractionDigits=0] defines the minimal number of decimal digits
	 * @param {int} [oFormatOptions.minIntegerDigits=1] defines the minimal number of non-decimal digits
	 * @param {string} [oFormatOptions.minusSign] defines the used minus symbol
	 * @param {boolean} [oFormatOptions.parseAsString=false] since 1.28.2 defines whether to output
	 *   the string from the parse function in order to keep the precision for big numbers. Numbers
	 *   in scientific notation are parsed back to standard notation. For example, "5e-3" is parsed
	 *   to "0.005".
	 * @param {string} [oFormatOptions.pattern] CLDR number pattern which is used to format the number
	 * @param {string} [oFormatOptions.plusSign] defines the used plus symbol
	 * @param {boolean} [oFormatOptions.preserveDecimals=false] Whether {@link #format} preserves
	 *   decimal digits except trailing zeros in case there are more decimals than the
	 *   <code>maxFractionDigits</code> format option allows.
	 *   If decimals are not preserved, the formatted number is rounded to <code>maxFractionDigits</code>.
	 * @param {sap.ui.core.format.NumberFormat.RoundingMode} [oFormatOptions.roundingMode=HALF_AWAY_FROM_ZERO]
	 *   Specifies the rounding behavior for discarding the digits after the maximum fraction digits
	 *   defined by <code>maxFractionDigits</code>.
	 *   This can be assigned
	 *   <ul>
	 *     <li>by value in {@link sap.ui.core.format.NumberFormat.RoundingMode RoundingMode},</li>
	 *     <li>via a function that is used for rounding the number and takes two parameters: the number itself, and the
	 *         number of decimal digits that should be reserved. <b>Using a function is deprecated since 1.121.0</b>;
	 *         string based numbers are not rounded via this custom function.</li>
	 *   </ul>
	 * @param {int} [oFormatOptions.shortDecimals] defines the number of decimal in the shortened format string. If this isn't specified, the 'decimals' options is used
	 * @param {int} [oFormatOptions.shortLimit] only use short number formatting for values above this limit
	 * @param {int} [oFormatOptions.shortRefNumber] since 1.40 specifies a number from which the scale factor for 'short' or 'long' style format is generated. The generated scale factor is
	 *  used for all numbers which are formatted with this format instance. This option has effect only when the option 'style' is set to 'short' or 'long'. This option is by default set
	 *  with <code>undefined</code> which means the scale factor is selected automatically for each number being formatted.
	 * @param {boolean} [oFormatOptions.showMeasure=true] defines whether the currency code/symbol is shown in the formatted string,
	 *  e.g. true: "1.00 EUR", false: "1.00" for locale "en"
	 *  If both <code>showMeasure</code> and <code>showNumber</code> are false, an empty string is returned
	 * @param {boolean} [oFormatOptions.showNumber=true] defines whether the number is shown as part of the result string,
	 *  e.g. 1 EUR for locale "en"
	 *      <code>NumberFormat.getCurrencyInstance({showNumber:true}).format(1, "EUR"); // "1.00 EUR"</code>
	 *      <code>NumberFormat.getCurrencyInstance({showNumber:false}).format(1, "EUR"); // "EUR"</code>
	 *  If both <code>showMeasure</code> and <code>showNumber</code> are false, an empty string is returned
	 * @param {boolean} [oFormatOptions.showScale=true] since 1.40 specifies whether the scale factor is shown in the formatted number.
	 *   This option takes effect only when the 'style' options is set to either 'short' or 'long'.
	 * @param {boolean} [oFormatOptions.strictGroupingValidation=false] whether the positions of grouping separators are validated. Space characters used as grouping separators are not validated.
	 * @param {string} [oFormatOptions.style=standard] defines the style of format. Valid values are
	 *   'short, 'long' or 'standard' (based on the CLDR decimalFormat). When set to 'short' or 'long',
	 *   numbers are formatted into the 'short' form only. When this option is set, the default value of the
	 *   'precision' option is set to 2. This can be changed by setting either min/maxFractionDigits,
	 *   decimals, shortDecimals, or the 'precision' option itself.
	 * @param {boolean} [oFormatOptions.trailingCurrencyCode] overrides the global configuration
	 *   value {@link module:sap/base/i18n/Formatting.getTrailingCurrencyCode Formatting.getTrailingCurrencyCode},
	 *   which has a default value of <code>true</>.
	 *   This is ignored if <code>oFormatOptions.currencyCode</code> is set to <code>false</code>,
	 *   or if <code>oFormatOptions.pattern</code> is supplied.
	 * @param {sap.ui.core.Locale} [oLocale]
	 *   The locale to get the formatter for; if no locale is given, a locale for the currently configured language is
	 *   used; see {@link module:sap/base/i18n/Formatting.getLanguageTag Formatting.getLanguageTag}
	 * @return {sap.ui.core.format.NumberFormat} currency instance of the NumberFormat
	 * @static
	 * @public
	 */
	NumberFormat.getCurrencyInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale);
		var sContext = oFormat.oOriginalFormatOptions && oFormat.oOriginalFormatOptions.currencyContext;

		// currency code trailing
		var bShowTrailingCurrencyCode = showTrailingCurrencyCode(oFormat.oOriginalFormatOptions);


		// prepend "sap-" to pattern params to load (context and short)
		if (bShowTrailingCurrencyCode) {
			sContext = sContext || this.oDefaultCurrencyFormat.style;
			sContext = "sap-" + sContext;
		}
		var oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, mNumberType.CURRENCY, sContext);

		oFormat.oFormatOptions = extend({}, this.oDefaultCurrencyFormat, oLocaleFormatOptions, oFormat.oOriginalFormatOptions);

		// Trailing currency code option
		//
		// The format option "trailingCurrencyCode" is influenced by other options, such as pattern, currencyCode, global config
		// Therefore set it manually without modifying the original oFormatOptions.
		// E.g. the "pattern" option would overwrite this option, even if the "trailingCurrencyCode" option is set
		// oFormatOptions.pattern = "###"
		// oFormatOptions.trailingCurrencyCode = true
		// ->
		// oFormatOptions.trailingCurrencyCode = false
		oFormat.oFormatOptions.trailingCurrencyCode = bShowTrailingCurrencyCode;
		oFormat._defineCustomCurrencySymbols();

		return oFormat;
	};

	/**
	 * Get a unit instance of the NumberFormat, which can be used for formatting units.
	 *
	 * <p>
	 * This instance has HALF_AWAY_FROM_ZERO set as default rounding mode.
	 * Please set the roundingMode property in oFormatOptions to change the
	 * default value.
	 * </p>
	 *
	 * @param {object} [oFormatOptions] The option object, which supports the following parameters.
	 *   If no options are given, default values according to the type and locale settings are used.
	 * @param {array} [oFormatOptions.allowedUnits] defines the allowed units for formatting and parsing, e.g. ["size-meter", "volume-liter", ...]
	 * @param {Object<string,object>} [oFormatOptions.customUnits] defines a set of custom units, e.g.
	 *   {"electric-inductance": {
	 *      "displayName": "henry",
	 *      "unitPattern-count-one": "{0} H",
	 *      "unitPattern-count-other": "{0} H",
	 *      "perUnitPattern": "{0}/H",
	 *      "decimals": 2,
	 *      "precision": 4
	 *   }}
	 * @param {int} [oFormatOptions.decimals] defines the number of decimal digits
	 * @param {string} [oFormatOptions.decimalSeparator] defines the character used as decimal separator.
	 *   Note: <code>decimalSeparator</code> must always be different from <code>groupingSeparator</code>.
	 * @param {null|number|string} [oFormatOptions.emptyString=NaN] since 1.30.0 defines what an empty string
	 *   is parsed as, and what is formatted as an empty string. The allowed values are "" (empty string),
	 *   NaN, <code>null</code>, or 0.
	 *   The 'format' and 'parse' functions are done in a symmetric way. For example, when this
	 *   parameter is set to NaN, an empty string is parsed as [NaN, undefined], and NaN is
	 *   formatted as an empty string.
	 * @param {int} [oFormatOptions.groupingBaseSize=3] defines the grouping base size in digits if
	 *   it is different from the grouping size (e.g. Indian grouping)
	 * @param {boolean} [oFormatOptions.groupingEnabled=true] defines whether grouping is enabled
	 *   (grouping separators are shown)
	 * @param {string} [oFormatOptions.groupingSeparator] defines the character used as grouping separator.
	 *   Note: <code>groupingSeparator</code> must always be different from <code>decimalSeparator</code>.
	 * @param {int} [oFormatOptions.groupingSize=3] defines the grouping size in digits; the default
	 *   is <code>3</code>. It must be a positive number.
	 * @param {int} [oFormatOptions.maxFractionDigits=99] defines the maximum number of decimal digits
	 * @param {int} [oFormatOptions.maxIntegerDigits=99] defines the maximum number of non-decimal digits.
	 *   If the number exceeds this maximum, e.g. 1e+120, "?" characters are shown instead of digits.
	 * @param {int} [oFormatOptions.minFractionDigits=0] defines the minimal number of decimal digits
	 * @param {int} [oFormatOptions.minIntegerDigits=1] defines the minimal number of non-decimal digits
	 * @param {string} [oFormatOptions.minusSign] defines the used minus symbol
	 * @param {boolean} [oFormatOptions.parseAsString=false] since 1.28.2 defines whether to output
	 *   the string from the parse function in order to keep the precision for big numbers. Numbers
	 *   in scientific notation are parsed back to standard notation. For example, "5e-3" is parsed
	 *   to "0.005".
	 * @param {string} [oFormatOptions.pattern] CLDR number pattern which is used to format the number
	 * @param {string} [oFormatOptions.plusSign] defines the used plus symbol
	 * @param {int} [oFormatOptions.precision] defines the numerical precision; the number of decimals
	 *   is calculated dependent on the integer digits
	 * @param {boolean} [oFormatOptions.preserveDecimals=false] Whether {@link #format} preserves
	 *   decimal digits except trailing zeros in case there are more decimals than the
	 *   <code>maxFractionDigits</code> format option allows.
	 *   If decimals are not preserved, the formatted number is rounded to <code>maxFractionDigits</code>.
	 * @param {sap.ui.core.format.NumberFormat.RoundingMode} [oFormatOptions.roundingMode=HALF_AWAY_FROM_ZERO]
	 *   Specifies the rounding behavior for discarding the digits after the maximum fraction digits
	 *   defined by <code>maxFractionDigits</code>.
	 *   This can be assigned
	 *   <ul>
	 *     <li>by value in {@link sap.ui.core.format.NumberFormat.RoundingMode RoundingMode},</li>
	 *     <li>via a function that is used for rounding the number and takes two parameters: the number itself, and the
	 *         number of decimal digits that should be reserved. <b>Using a function is deprecated since 1.121.0</b>;
	 *         string based numbers are not rounded via this custom function.</li>
	 *   </ul>
	 * @param {int} [oFormatOptions.shortDecimals] defines the number of decimals in the shortened
	 *   format string. If this option isn't specified, the 'decimals' option is used instead.
	 * @param {int} [oFormatOptions.shortLimit] defines a limit above which only short number formatting is used
	 * @param {int} [oFormatOptions.shortRefNumber] since 1.40 specifies a number from which the
	 *   scale factor for the 'short' or 'long' style format is generated. The generated scale
	 *   factor is used for all numbers which are formatted with this format instance. This option
	 *   only takes effect when the 'style' option is set to 'short' or 'long'. This option is
	 *   set to <code>undefined</code> by default, which means that the scale factor is selected
	 *   automatically for each number being formatted.
	 * @param {boolean} [oFormatOptions.showMeasure=true] defines whether the unit of measure is shown in the formatted string,
	 *  e.g. for input 1 and "duration-day" true: "1 day", false: "1".
	 *  If both <code>showMeasure</code> and <code>showNumber</code> are false, an empty string is returned
	 * @param {boolean} [oFormatOptions.showNumber=true] defines whether the number is shown as part of the result string,
	 *  e.g. 1 day for locale "en"
	 *      <code>NumberFormat.getUnitInstance({showNumber:true}).format(1, "duration-day"); // "1 day"</code>
	 *      <code>NumberFormat.getUnitInstance({showNumber:false}).format(1, "duration-day"); // "day"</code>
	 *  e.g. 2 days for locale "en"
	 *      <code>NumberFormat.getUnitInstance({showNumber:true}).format(2, "duration-day"); // "2 days"</code>
	 *      <code>NumberFormat.getUnitInstance({showNumber:false}).format(2, "duration-day"); // "days"</code>
	 *  If both <code>showMeasure</code> and <code>showNumber</code> are false, an empty string is returned
	 * @param {boolean} [oFormatOptions.showScale=true] since 1.40 specifies whether the scale factor is shown in the formatted number. This option takes effect only when the 'style' options is set to either 'short' or 'long'.
	 * @param {boolean} [oFormatOptions.strictGroupingValidation=false] whether the positions of grouping separators are validated. Space characters used as grouping separators are not validated.
	 * @param {string} [oFormatOptions.style=standard] defines the style of format. Valid values are
	 *   'short, 'long' or 'standard' (based on the CLDR decimalFormat). When set to 'short' or 'long',
	 *   numbers are formatted into compact forms. When this option is set, the default value of the
	 *   'precision' option is set to 2. This can be changed by setting either min/maxFractionDigits,
	 *   decimals, shortDecimals, or the 'precision' option itself.
	 * @param {sap.ui.core.Locale} [oLocale]
	 *   The locale to get the formatter for; if no locale is given, a locale for the currently configured language is
	 *   used; see {@link module:sap/base/i18n/Formatting.getLanguageTag Formatting.getLanguageTag}
	 * @return {sap.ui.core.format.NumberFormat} unit instance of the NumberFormat
	 * @static
	 * @public
	 */
	NumberFormat.getUnitInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, mNumberType.UNIT);

		oFormat.oFormatOptions = extend({}, this.oDefaultUnitFormat, oLocaleFormatOptions, oFormat.oOriginalFormatOptions);
		return oFormat;
	};

	/**
	 * Get a percent instance of the NumberFormat, which can be used for formatting.
	 *
	 * <p>
	 * This instance has HALF_AWAY_FROM_ZERO set as default rounding mode.
	 * Please set the roundingMode property in oFormatOptions to change the
	 * default value.
	 * </p>
	 *
	 * @param {object} [oFormatOptions] The option object, which supports the following parameters.
	 *   If no options are given, default values according to the type and locale settings are used.
	 * @param {int} [oFormatOptions.decimals] defines the number of decimal digits
	 * @param {string} [oFormatOptions.decimalSeparator] defines the character used as decimal separator.
	 *   Note: <code>decimalSeparator</code> must always be different from <code>groupingSeparator</code>.
	 * @param {null|number|string} [oFormatOptions.emptyString=NaN] since 1.30.0 defines what an empty string
	 *   is parsed as, and what is formatted as an empty string. The allowed values are "" (empty string),
	 *   NaN, <code>null</code>, or 0.
	 *   The 'format' and 'parse' functions are done in a symmetric way. For example, when this
	 *   parameter is set to NaN, an empty string is parsed as NaN, and NaN is formatted as an empty
	 *   string.
	 * @param {int} [oFormatOptions.groupingBaseSize=3] defines the grouping base size in digits if
	 *   it is different from the grouping size (e.g. Indian grouping)
	 * @param {boolean} [oFormatOptions.groupingEnabled=true] defines whether grouping is enabled
	 *   (grouping separators are shown)
	 * @param {string} [oFormatOptions.groupingSeparator] defines the character used as grouping separator.
	 *   Note: <code>groupingSeparator</code> must always be different from <code>decimalSeparator</code>.
	 * @param {int} [oFormatOptions.groupingSize=3] defines the grouping size in digits; the default
	 *   is <code>3</code>. It must be a positive number.
	 * @param {int} [oFormatOptions.maxFractionDigits=99] defines the maximum number of decimal digits
	 * @param {int} [oFormatOptions.maxIntegerDigits=99] defines the maximum number of non-decimal digits.
	 *   If the number exceeds this maximum, e.g. 1e+120, "?" characters are shown instead of digits.
	 * @param {int} [oFormatOptions.minFractionDigits=0] defines the minimal number of decimal digits
	 * @param {int} [oFormatOptions.minIntegerDigits=1] defines the minimal number of non-decimal digits
	 * @param {string} [oFormatOptions.minusSign] defines the used minus symbol
	 * @param {boolean} [oFormatOptions.parseAsString=false] since 1.28.2 defines whether to output
	 *   the string from the parse function in order to keep the precision for big numbers. Numbers
	 *   in scientific notation are parsed back to standard notation. For example, "5e-3" is parsed
	 *   to "0.005".
	 * @param {string} [oFormatOptions.pattern] CLDR number pattern which is used to format the number
	 * @param {string} [oFormatOptions.percentSign] defines the used percent symbol
	 * @param {string} [oFormatOptions.plusSign] defines the used plus symbol
	 * @param {int} [oFormatOptions.precision] defines the numerical precision; the number of decimals
	 *   is calculated dependent on the integer digits
	 * @param {boolean} [oFormatOptions.preserveDecimals=false] Whether {@link #format} preserves
	 *   decimal digits except trailing zeros in case there are more decimals than the
	 *   <code>maxFractionDigits</code> format option allows.
	 *   If decimals are not preserved, the formatted number is rounded to <code>maxFractionDigits</code>.
	 * @param {sap.ui.core.format.NumberFormat.RoundingMode} [oFormatOptions.roundingMode=HALF_AWAY_FROM_ZERO]
	 *   Specifies the rounding behavior for discarding the digits after the maximum fraction digits
	 *   defined by <code>maxFractionDigits</code>.
	 *   This can be assigned
	 *   <ul>
	 *     <li>by value in {@link sap.ui.core.format.NumberFormat.RoundingMode RoundingMode},</li>
	 *     <li>via a function that is used for rounding the number and takes two parameters: the number itself, and the
	 *         number of decimal digits that should be reserved. <b>Using a function is deprecated since 1.121.0</b>;
	 *         string based numbers are not rounded via this custom function.</li>
	 *   </ul>
	 * @param {int} [oFormatOptions.shortDecimals] defines the number of decimal in the shortened format string. If this isn't specified, the 'decimals' options is used
	 * @param {int} [oFormatOptions.shortLimit] only use short number formatting for values above this limit
	 * @param {int} [oFormatOptions.shortRefNumber] since 1.40 specifies a number from which the scale factor for 'short' or 'long' style format is generated. The generated scale factor is
	 *  used for all numbers which are formatted with this format instance. This option has effect only when the option 'style' is set to 'short' or 'long'. This option is by default set
	 *  with <code>undefined</code> which means the scale factor is selected automatically for each number being formatted.
	 * @param {boolean} [oFormatOptions.showScale=true] since 1.40 specifies whether the scale factor is shown in the formatted number. This option takes effect only when the 'style' options is set to either 'short' or 'long'.
	 * @param {boolean} [oFormatOptions.strictGroupingValidation=false] whether the positions of grouping separators are validated. Space characters used as grouping separators are not validated.
	 * @param {string} [oFormatOptions.style=standard] defines the style of format. Valid values are
	 *   'short, 'long' or 'standard' (based on the CLDR decimalFormat). When set to 'short' or 'long',
	 *   numbers are formatted into compact forms. When this option is set, the default value of the
	 *   'precision' option is set to 2. This can be changed by setting either min/maxFractionDigits,
	 *   decimals, shortDecimals, or the 'precision' option itself.
	 * @param {sap.ui.core.Locale} [oLocale]
	 *   The locale to get the formatter for; if no locale is given, a locale for the currently configured language is
	 *   used; see {@link module:sap/base/i18n/Formatting.getLanguageTag Formatting.getLanguageTag}
	 * @return {sap.ui.core.format.NumberFormat} percentage instance of the NumberFormat
	 * @static
	 * @public
	 */
	NumberFormat.getPercentInstance = function(oFormatOptions, oLocale) {
		var oFormat = this.createInstance(oFormatOptions, oLocale),
			oLocaleFormatOptions = this.getLocaleFormatOptions(oFormat.oLocaleData, mNumberType.PERCENT);

		oFormat.oFormatOptions = extend({}, this.oDefaultPercentFormat, oLocaleFormatOptions, oFormat.oOriginalFormatOptions);
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
			oLocale = new Locale(Formatting.getLanguageTag());
		}
		oFormat.oLocale = oLocale;
		oFormat.oLocaleData = LocaleData.getInstance(oLocale);
		oFormat.oOriginalFormatOptions = oFormatOptions;

		// If a pattern is defined in the format option, parse it and add options
		if (oFormatOptions) {
			if (oFormatOptions.pattern) {
				oPatternOptions = this.parseNumberPattern(oFormatOptions.pattern);

				Object.keys(oPatternOptions).forEach(function(sName) {
					oFormatOptions[sName] = oPatternOptions[sName];
				});
			}
			if (oFormatOptions.emptyString !== undefined) {
				assert(oFormatOptions.emptyString === ""
					|| oFormatOptions.emptyString === 0
					|| oFormatOptions.emptyString === null
					// eslint-disable-next-line no-self-compare -- check if it's NaN (only NaN doesn't equal to itself)
					|| oFormatOptions.emptyString !== oFormatOptions.emptyString,
					"The format option 'emptyString' must be either '', 0, null, or NaN");
			}
		}

		return oFormat;
	};

	/**
	 * Returns a default unit format/parse pattern for the given unit short name.
	 * The returned pattern can then be used for custom units, for example as a <code>unitPattern-count-other</code> pattern.
	 * The <code>unitPattern-count-other</code> pattern is then used by NumberFormat instances as a fallback in case
	 * no other patterns are defined, see the below example:
	 *
	 * <pre>
	 * var oFormat = NumberFormat.getUnitInstance({
	 *     "customUnits": {
	 *         "myUnit": {
	 *             "unitPattern-count-other": NumberFormat.getDefaultUnitPattern("Bottles"); // returns "{0} Bottles"
	 *         }
	 *     }
	 * });
	 * oFormat.format(1234, "myUnit"); // returns "1.234,00 Bottles"
	 * </pre>
	 *
	 * @param {string} sShortName the short name of the unit used in the created pattern
	 * @returns {string} a pattern, which can be used for formatting and parsing a custom unit of measure
	 * @private
	 * @ui5-restricted sap.ui.model.odata.type
	 */
	NumberFormat.getDefaultUnitPattern = function(sShortName) {
		return "{0} " + sShortName;
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
			case mNumberType.UNIT:
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
	 * Compiles a map <code>this.mKnownCurrencySymbols</code>
	 * of all custom currency symbols. Symbols are either defined in
	 * the custom currency object itself, or are looked up on the
	 * LocaleData in case an ISO Code is given.
	 *
	 * It also checks if there are duplicated symbols defined,
	 * which lead to an ambiguous parse result.
	 *
	 * In case there are custom currencies defined on instance level,
	 * it also compiles a map <code>this.mKnownCurrencyCodes</code>
	 * of custom currency codes.
	 *
	 * The function is only used by the Currency formatting.
	 * @private
	 */
	NumberFormat.prototype._defineCustomCurrencySymbols = function() {
		var oOptions = this.oFormatOptions;
		var mCurrencySymbols = this.oLocaleData.getCurrencySymbols();

		var fnFindDuplicates = function(mSymbols, mResult) {
			var aUniqueSymbols = [];
			var sSymbol;
			for (var sKey in mSymbols) {
				sSymbol = mSymbols[sKey];
				if (aUniqueSymbols.indexOf(sSymbol) === -1) {
					aUniqueSymbols.push(sSymbol);
				} else if (sSymbol !== undefined) {
					// Duplicated symbol found
					mResult[sSymbol] = true;
					Log.error("Symbol '" + sSymbol + "' is defined multiple times in custom currencies.", undefined, "NumberFormat");
				}
			}
		};

		// process custom currencies on instance-level
		if (oOptions.customCurrencies && typeof oOptions.customCurrencies === "object") {
			this.mKnownCurrencySymbols = {};
			this.mKnownCurrencyCodes = {};

			// get all relevant symbols for custom currencies
			Object.keys(oOptions.customCurrencies).forEach(function (sKey) {
				if (oOptions.customCurrencies[sKey].symbol) {
					this.mKnownCurrencySymbols[sKey] = oOptions.customCurrencies[sKey].symbol;
				} else {
					// if no symbol is defined, we make a look up into the locale data with the given isoCode
					var sIsoCode = oOptions.customCurrencies[sKey].isoCode;
					if (sIsoCode) {
						this.mKnownCurrencySymbols[sKey] = mCurrencySymbols[sIsoCode];
					}
				}

				// In case no symbol is found during parsing,
				// we take the custom currency key itself
				this.mKnownCurrencyCodes[sKey] = sKey;

			}.bind(this));

		} else {
			// find duplicated symbols in global config/CLDR
			// mCurrencySymbols
			this.mKnownCurrencySymbols = mCurrencySymbols;
			this.mKnownCurrencyCodes = this.oLocaleData.getCustomCurrencyCodes();
		}

		// Find duplicated symbols defined in custom currencies
		this.mDuplicatedSymbols = {};
		fnFindDuplicates(this.mKnownCurrencySymbols, this.mDuplicatedSymbols);
	};

	/**
	 * Removes trailing zero decimals
	 * @param {string} sNumber the number, e.g. "1.23000"
	 * @param {number} minDecimalsPreserved the minimum decimals preserved, e.g. 3
	 * @returns {string} the number with stripped trailing zero decimals, e.g. "1.230"
	 */
	function stripTrailingZeroDecimals(sNumber, minDecimalsPreserved) {
		if (sNumber.indexOf(".") >= 0 && !isScientificNotation(sNumber) && sNumber.endsWith("0")) {
			var iFractionDigitsLength = sNumber.length - sNumber.lastIndexOf(".") - 1;
			var iFractionsToRemove = iFractionDigitsLength - minDecimalsPreserved;
			if (iFractionsToRemove > 0) {
				while (sNumber.endsWith("0") && (iFractionsToRemove-- > 0)) {
					sNumber = sNumber.substring(0, sNumber.length - 1);
				}
				if (sNumber.endsWith(".")) {
					sNumber = sNumber.substring(0, sNumber.length - 1);
				}
			}
		}
		return sNumber;
	}

	/**
	 * Applies the grouping to the given integer part and returns it.
	 *
	 * @param {string} sIntegerPart
	 *   A string with the integer value, e.g. "1234567"
	 * @param {object} oOptions
	 *   The format options
	 * @param {int} oOptions.groupingBaseSize
	 *   The grouping base size in digits if it is different from the grouping size (e.g. Indian grouping)
	 * @param {string} oOptions.groupingSeparator
	 *   The character used as grouping separator
	 * @param {int} oOptions.groupingSize
	 *   The grouping size in digits
	 * @returns {string}
	 *   The integer part with grouping, e.g. "1.234.567" for locale de-DE
	 * @private
	 */
	function applyGrouping(sIntegerPart, oOptions) {
		var iGroupSize = oOptions.groupingSize,
			iBaseGroupSize = oOptions.groupingBaseSize || iGroupSize,
			iLength = sIntegerPart.length,
			iPosition = Math.max(iLength - iBaseGroupSize, 0) % iGroupSize || iGroupSize,
			sGroupedIntegerPart = sIntegerPart.slice(0, iPosition);

		while (iLength - iPosition >= iBaseGroupSize) {
			sGroupedIntegerPart += oOptions.groupingSeparator;
			sGroupedIntegerPart += sIntegerPart.slice(iPosition, iPosition + iGroupSize);
			iPosition += iGroupSize;
		}
		sGroupedIntegerPart += sIntegerPart.slice(iPosition, iLength);

		return sGroupedIntegerPart;
	}

	/**
	 * Format a number according to the given format options.
	 *
	 * @param {number|string|array} vValue
	 *   The number to format as a number or a string, such as <code>1234.45</code> or <code>"-1234.45"</code>, or an
	 *   array which contains both the number to format as a number or a string and the <code>sMeasure</code> parameter
	 * @param {string} [sMeasure]
	 *   An optional unit which has an impact on formatting currencies and units
	 * @returns {string}
	 *   The formatted value
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
			bNegative = vValue < 0,
			iDotPos = -1,
			oOptions = Object.assign({}, this.oFormatOptions),
			oOrigOptions = this.oOriginalFormatOptions,
			bIndianCurrency = oOptions.type === mNumberType.CURRENCY && sMeasure === "INR" &&
				this.oLocale.getLanguage() === "en" && this.oLocale.getRegion() === "IN",
			aPatternParts,
			oShortFormat,
			nShortRefNumber,
			sPluralCategory,
			mUnitPatterns,
			sLookupMeasure,
			bValueIsNullOrUndefined = vValue === undefined || vValue === null;

		if (oOptions.groupingEnabled && oOptions.groupingSize <= 0) {
			// invalid grouping size specified
			Log.error("Grouping requires the 'groupingSize' format option to be a positive number, but it is '" + oOptions.groupingSize + "' instead.");
			return "";
		}

		// emptyString is only relevant for the number part (vValue)
		if (oOptions.showNumber && (vValue === oOptions.emptyString || (isNaN(vValue) && isNaN(oOptions.emptyString)))) {
			// if the value equals the 'emptyString' format option, return empty string.
			// the NaN case has to be checked by using isNaN because NaN !== NaN
			return "";
		}

		// sMeasure must be a string if defined
		if (sMeasure !== undefined
			&& sMeasure !== null
			&& typeof sMeasure !== "string"
			&& !(sMeasure instanceof String)) {
			return "";
		}

		if (!oOptions.showNumber && !sMeasure) {
			return "";
		}

		// cannot create number from null or undefined
		if (bValueIsNullOrUndefined && (!sMeasure || !oOptions.showMeasure || oOptions.showNumber)) {
			return "";
		}

		// If custom currencies are defined, we exclusively accept the defined ones,
		// other currencies are ignored
		if (sMeasure && oOptions.customCurrencies && !oOptions.customCurrencies[sMeasure]) {
			Log.error("Currency '" + sMeasure + "' is unknown.");
			return "";
		}

		if (!oOptions.showNumber && !oOptions.showMeasure) {
			return "";
		}

		// Recognize the correct unit definition (either custom unit or CLDR unit)
		if (sMeasure && oOptions.type === mNumberType.UNIT) {
			if (oOptions.customUnits && typeof oOptions.customUnits === "object") {
				//custom units are exclusive (no fallback to LocaleData)
				mUnitPatterns = oOptions.customUnits[sMeasure];
			} else {
				//check if there is a unit mapping for the given unit
				sLookupMeasure = this.oLocaleData.getUnitFromMapping(sMeasure) || sMeasure;
				mUnitPatterns = this.oLocaleData.getUnitFormat(sLookupMeasure);
			}

			if (oOptions.showMeasure) {
				// a list of allowed unit types is given, so we check if the given measure is ok
				var bUnitTypeAllowed = !oOptions.allowedUnits || oOptions.allowedUnits.indexOf(sMeasure) >= 0;
				if (!bUnitTypeAllowed) {
					return "";
				}
			}

			if (!mUnitPatterns && !oOptions.showNumber) {
				return this._addOriginInfo(sMeasure);
			}

			// either take the decimals/precision on the custom units or fallback to the given format-options
			oOptions.decimals = (mUnitPatterns && (typeof mUnitPatterns.decimals === "number" && mUnitPatterns.decimals >= 0)) ? mUnitPatterns.decimals : oOptions.decimals;
			oOptions.decimals = NumberFormat.getMaximalDecimals(oOptions);
			oOptions.precision = (mUnitPatterns && (typeof mUnitPatterns.precision === "number" && mUnitPatterns.precision >= 0)) ? mUnitPatterns.precision : oOptions.precision;
		}

		if (oOptions.type == mNumberType.CURRENCY) {
			// Make sure the "trailingCurrencyCode" mode is only used on currency codes:
			// The "customCurrencies" format option takes precedence over CLDR and global configuration. If the given measure isn't found
			// there, we already return an empty string in the check above (look for error log 'Currency "xy" is unknown').
			// "mKnownCurrencyCodes" either contains the keys of the "customCurrencies" format option or the accumulated currency codes
			// from CLDR and global configuration. If the given measure isn't found there and does not have the three letter ISO code format,
			// it shouldn't be formatted with the "trailingCurrencyCode" pattern.
			if (sMeasure && oOptions.trailingCurrencyCode) {
				if (!this.mKnownCurrencyCodes[sMeasure] && !/(^[A-Z]{3}$)/.test(sMeasure)) {
					oOptions.trailingCurrencyCode = false;
					// Revert to non-"sap-" prefixed (trailing-currency-code) pattern. Also see code in getCurrencyInstance()
					oOptions.pattern = this.oLocaleData.getCurrencyPattern(oOptions.currencyContext);
				}
			}

			if (!oOptions.showNumber) {
				// if the number should not be shown, return the sMeasure part standalone, without anything number specific
				if (!oOptions.currencyCode) {
					var sSymbol;
					// custom currencies provided
					if (oOptions.customCurrencies && typeof oOptions.customCurrencies === "object") {
						// the custom currency symbol map was preprocessed on instance creation
						sSymbol = this.mKnownCurrencySymbols[sMeasure];
					} else {
						sSymbol = this.oLocaleData.getCurrencySymbol(sMeasure);
					}

					if (sSymbol && sSymbol !== sMeasure) {
						sMeasure = sSymbol;
					}
				}
				return sMeasure;
			}
			// if decimals are given on a custom currency, they have precedence over the decimals defined on the format options
			if (oOptions.customCurrencies && oOptions.customCurrencies[sMeasure]) {
				// we either take the custom decimals or use decimals defined in the format-options
				// we check for undefined here, since 0 is an accepted value
				oOptions.decimals = oOptions.customCurrencies[sMeasure].decimals !== undefined ? oOptions.customCurrencies[sMeasure].decimals : oOptions.decimals;
				oOptions.decimals = NumberFormat.getMaximalDecimals(oOptions);
			}
		}

		// set fraction digits based on the given or derived decimals
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
						// set the default min/maxFractionDigits after setting the default precision
						oOptions.minFractionDigits = 0;
						oOptions.maxFractionDigits = 99;
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
		// If short format is enabled or the precision isn't ignored, take the precision
		// option into consideration
		if ((oShortFormat || !oOptions.ignorePrecision) && oOptions.precision !== undefined) {
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

			// decimals might be undefined, yet 0 is accepted of course
			if (oOptions.customCurrencies && oOptions.customCurrencies[sMeasure] && oOptions.customCurrencies[sMeasure].decimals !== undefined) {
				iDigits = oOptions.customCurrencies[sMeasure].decimals;
			}

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
		if ((typeof vValue === "number" || typeof vValue === "string" && typeof oOptions.roundingMode !== "function")
				&& !oOptions.preserveDecimals) {
			vValue = rounding(vValue, oOptions.maxFractionDigits, oOptions.roundingMode);
		}

		// No sign on zero values
		if (vValue == 0) {
			bNegative = false;
		}

		// strip of trailing zeros in decimals
		// "1000.00" -> "1000"   (maxFractionDigits: 0)
		// "1000.0"  -> "1000.0" (maxFractionDigits: 1)
		// the intention behind preserveDecimals is to keep the precision in the number.
		// Trailing zero decimals are not required for the precision (e.g. 1,23000000 EUR).
		// These zeros are cut off until maxFractionDigits is reached to be backward compatible.
		// If more trailing decimal zeros are required the option maxFractionDigits can be increased.
		// Note: default maxFractionDigits for Unit and Float is 99.
		if (oOptions.preserveDecimals && (typeof vValue === "string" || vValue instanceof String)) {
			vValue = stripTrailingZeroDecimals(vValue, oOptions.maxFractionDigits);
		}

		if (!bValueIsNullOrUndefined) {
			sNumber = LocaleData.convertToDecimal(vValue);
		}

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
		} else if (sFractionPart.length > oOptions.maxFractionDigits && !oOptions.preserveDecimals) {
			sFractionPart = sFractionPart.substr(0, oOptions.maxFractionDigits);
		}

		if (oOptions.type === mNumberType.UNIT && !oOptions.showNumber) {
			if (mUnitPatterns) {
				// the plural category of a unit pattern is determined for the complete number, maybe as compact
				// notation, e.g. "1.2M" must check "1.2c6"
				sPluralCategory = this._getPluralCategory(sIntegerPart, sFractionPart, oShortFormat);

				sPattern = mUnitPatterns["unitPattern-count-" + sPluralCategory];
				if (!sPattern) {
					sPattern = mUnitPatterns["unitPattern-count-other"];
				}
				if (!sPattern) {
					return this._addOriginInfo(sMeasure);
				}
				// fallback to "other" pattern if pattern does not include the number placeholder
				if (sPluralCategory !== "other" && sPattern.indexOf("{0}") === -1) {
					sPattern = mUnitPatterns["unitPattern-count-other"];
					if (!sPattern) {
						return this._addOriginInfo(sMeasure);
					}
				}

				// with the current CLDR data this is not possible
				// but if there is the case when there is no number placeholder, the number cannot be separated from the unit
				// therefore it does not make sense to return a pattern which contains the number part in any other form as part of the pattern
				if (sPattern.indexOf("{0}") === -1) {
					Log.warning("Cannot separate the number from the unit because unitPattern-count-other '" + sPattern + "' does not include the number placeholder '{0}' for unit '" + sMeasure + "'");
				} else {
					return this._addOriginInfo(sPattern.replace("{0}", "").trim());
				}
			}
		}

		// grouping
		if (oOptions.groupingEnabled) {
			sGroupedIntegerPart = applyGrouping(sIntegerPart, oOptions);
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
			// the plural category of a compact number is determined for the reduced short number without compact
			// notation, e.g. "1.2M" must check "1.2" (see CLDR "decimalFormat-short" and "decimalFormat-long")
			sPluralCategory = this._getPluralCategory(sIntegerPart, sFractionPart);
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
				var sStyle;

				// Currency formatting has only short style (no long)
				if (oOptions.trailingCurrencyCode) {
					sStyle = "sap-short";
				} else {
					sStyle = "short";
				}

				// Get correct format string based on actual decimal/fraction digits
				// the plural category of a compact currency is determined for the reduced short number without compact
				// notation, e.g. "1.2M" must check "1.2" (see CLDR "currencyFormat-short")
				sPluralCategory = this._getPluralCategory(sIntegerPart, sFractionPart);
				if (bIndianCurrency) {
					sPattern = getIndianCurrencyFormat(sStyle, oShortFormat.key, sPluralCategory);
				} else {
					sPattern = this.oLocaleData.getCurrencyFormat(sStyle, oShortFormat.key, sPluralCategory);
				}
				//formatString may contain '.' (quoted to differentiate them decimal separator)
				//which must be replaced with .
				sPattern = sPattern.replace(/'.'/g, ".");
			}

			// The currency pattern is defined in some locale, for example in "ko", as: ¤#,##0.00;(¤#,##0.00)
			// where the pattern after ';' should be used for negative numbers.
			// Therefore it's needed to check whether the pattern contains ';' and use the later part for
			// negative values
			aPatternParts = sPattern.split(";");
			if (aPatternParts.length === 2) {
				sPattern = bNegative ? aPatternParts[1] : aPatternParts[0];
				if (bNegative) {
					sResult = sResult.substring(oOptions.minusSign.length);
				}
			}

			// check if we need to render a symbol instead of a currency-code
			if (!oOptions.currencyCode) {
				var sSymbol;
				// custom currencies provided
				if (oOptions.customCurrencies && typeof oOptions.customCurrencies === "object") {
					// the custom currency symbol map was preprocessed on instance creation
					sSymbol = this.mKnownCurrencySymbols[sMeasure];
				} else {
					sSymbol = this.oLocaleData.getCurrencySymbol(sMeasure);
				}

				if (sSymbol && sSymbol !== sMeasure) {
					sMeasure = sSymbol;
				}
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

		if (oOptions.showMeasure && sMeasure && oOptions.type === mNumberType.UNIT) {
			// the plural category of a unit pattern is determined for the complete number, maybe as compact
			// notation, e.g. "1.2M" must check "1.2c6"
			sPluralCategory = this._getPluralCategory(sIntegerPart, sFractionPart, oShortFormat);

			if (mUnitPatterns) {
				sPattern = mUnitPatterns["unitPattern-count-" + sPluralCategory];
				// some units do not have a pattern for each plural and therefore "other" is used as fallback
				if (!sPattern) {
					sPattern = mUnitPatterns["unitPattern-count-other"];
				}
				if (!sPattern) {
					sPattern = NumberFormat.getDefaultUnitPattern(sMeasure);
				}
			} else {
				sPattern = NumberFormat.getDefaultUnitPattern(sMeasure);
			}
			sResult = sPattern.replace("{0}", sResult);
		}
		return this._addOriginInfo(sResult);
	};

	/**
	 * Gets the plural category for the given number information. With a given <code>oShortFormat</code>
	 * the category is determined based on the compact notation.
	 *
	 * @param {int} sIntegerPart
	 *   The integer part
	 * @param {int} [sFractionPart]
	 *   The fraction part
	 * @param {{magnitude: int}} [oShortFormat]
	 *   An object containing the <code>magnitude</code> information describing the factor of a compact number
	 * @returns {string}
	 *   The plural category
	 *
	 * @private
	 */
	NumberFormat.prototype._getPluralCategory = function (sIntegerPart, sFractionPart, oShortFormat) {
		var sNumber = sIntegerPart;

		if (sFractionPart) {
			sNumber += "." + sFractionPart;
		}
		if (oShortFormat) {
			sNumber += "c" + oShortFormat.magnitude.toExponential().slice(2);
		}

		return this.oLocaleData.getPluralCategory(sNumber);
	};

	NumberFormat.prototype._addOriginInfo = function(sResult) {
		if (Supportability.collectOriginInfo()) {
			// String object is created on purpose and must not be a string literal
			// eslint-disable-next-line no-new-wrappers
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
				mRegex = {
					"[:digit:]": rDigit,
					"[[:^S:]&[:^Z:]]": rNotSAndNotZ
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
	 * @return {number|array|string|null} the parsed value as:
	 * <ul>
	 *  <li>number</li>
	 *  <li>array which contains the parsed value and the currency code (symbol) or unit for currency and unit instances</li>
	 *  <li>string when option "parseAsString" is <code>true</code></li>
	 *  <li><code>NaN</code> if value cannot be parsed</li>
	 *  <li><code>null</code> if value is invalid</li>
	 * </ul>
	 * @public
	 */
	NumberFormat.prototype.parse = function(sValue) {
		var oOptions = this.oFormatOptions,
			sPlusSigns = oOptions.plusSign + this.oLocaleData.getLenientNumberSymbols("plusSign"),
			sMinusSigns = oOptions.minusSign + this.oLocaleData.getLenientNumberSymbols("minusSign"),
			// Note: the minus sign ('-') needs to be quoted as well such that it is not confused with the range operator, e.g. in [A-Z]
			sPlusMinusSigns = quote(sPlusSigns + sMinusSigns),
			sGroupingSeparator = quote(oOptions.groupingSeparator),
			sDecimalSeparator = quote(oOptions.decimalSeparator),
			sRegExpFloat = "^\\s*([" + sPlusMinusSigns + "]?(?:[0-9" + sGroupingSeparator + "]+|[0-9" + sGroupingSeparator + "]*" + sDecimalSeparator + "[0-9]*)(?:[eE][+-][0-9]+)?)\\s*$",
			sRegExpInt = "^\\s*([" + sPlusMinusSigns + "]?[0-9" + sGroupingSeparator + "]+)\\s*$",
			oGroupingRegExp = new RegExp(sGroupingSeparator, "g"),
			oDecimalRegExp = new RegExp(sDecimalSeparator, "g"),
			sPercentSign = this.oLocaleData.getNumberSymbol("percentSign"),
			bIndianCurrency = oOptions.type === mNumberType.CURRENCY && this.oLocale.getLanguage() === "en" && this.oLocale.getRegion() === "IN",
			oRegExp, bPercent, sMeasure, sPercentPattern,
			vResult = 0,
			oShort, vEmptyParseValue;

		if (typeof sValue !== "string" && !(sValue instanceof String)) {
			return null;
		}

		sValue = FormatUtils.normalize(sValue).trim();

		if (sValue === "") {
			if (!oOptions.showNumber) {
				return null;
			}
			vEmptyParseValue = oOptions.emptyString;
			// If the 'emptyString' option is set to 0 or NaN and parseAsString is set to true, the return value should be converted to a string.
			// Because null is a valid value for string type, therefore null is not converted to a string.
			if (oOptions.parseAsString && (oOptions.emptyString === 0 || isNaN(oOptions.emptyString))) {
				vEmptyParseValue = oOptions.emptyString + "";
			}
			if (oOptions.type === mNumberType.CURRENCY || oOptions.type === mNumberType.UNIT) {
				return [vEmptyParseValue, undefined];
			} else {
				return vEmptyParseValue;
			}
		}

		if (oOptions.groupingSeparator === oOptions.decimalSeparator) {
			Log.error("The grouping and decimal separator both have the same value '" + oOptions.groupingSeparator + "'. " +
				"They must be different from each other such that values can be parsed correctly.");
		}

		sPercentPattern = oOptions.type === mNumberType.PERCENT ? oOptions.pattern : this.oLocaleData.getPercentPattern();
		if (sPercentPattern.charAt(0) === "%") {
			sRegExpFloat = sRegExpFloat.slice(0, 1) + "%?" + sRegExpFloat.slice(1);
		} else if (sPercentPattern.charAt(sPercentPattern.length - 1) === "%") {
			sRegExpFloat = sRegExpFloat.slice(0, sRegExpFloat.length - 1) + "%?" + sRegExpFloat.slice(sRegExpFloat.length - 1);
		}

		var aUnitCode;
		if (oOptions.type === mNumberType.UNIT && oOptions.showMeasure) {

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

			var oPatternAndResult = parseNumberAndUnit(mUnitPatterns, sValue, oOptions.showNumber,
					this.oLocaleData.sCLDRLocaleId);
			var bUnitIsAmbiguous = false;

			aUnitCode = oPatternAndResult.cldrCode;
			if (aUnitCode.length === 1) {
				sMeasure = aUnitCode[0];
				if (!oOptions.showNumber) {
					return [undefined, sMeasure];
				}
			} else if (aUnitCode.length === 0) {
				// in case showMeasure is set to false or unitOptional is set to true
				// we only try to parse the numberValue
				// the currency format behaves the same
				if (oOptions.unitOptional) {
					oPatternAndResult.numberValue = sValue;
				} else {
					//unit not found
					return null;
				}
			} else {
				//ambiguous unit
				assert(aUnitCode.length === 1, "Ambiguous unit [" + aUnitCode.join(", ") + "] for input: '" + (sValue) + "'");
				sMeasure = undefined;
				bUnitIsAmbiguous = true;
			}

			// TODO: better error handling in strict mode
			// Next steps will be to implement a more helpful error message for these cases.
			// Right now we simply return null. For now this will force the types to throw
			// a default ParseException with a non-descriptive error.
			if (oOptions.strictParsing) {
				// two cases:
				// 1. showMeasure is set to false, but still a unit was parsed
				// 2. no unit (either none could be found OR the unit is ambiguous, should be separate error logs later on)
				if (bUnitIsAmbiguous) {
					return null;
				}
			}

			sValue = oPatternAndResult.numberValue || sValue;
		}

		var oResult;
		if (oOptions.type === mNumberType.CURRENCY && oOptions.showMeasure) {
			oResult = parseNumberAndCurrency({
				value: sValue,
				currencySymbols: this.mKnownCurrencySymbols,
				customCurrencyCodes: this.mKnownCurrencyCodes,
				duplicatedSymbols: this.mDuplicatedSymbols,
				customCurrenciesAvailable: !!oOptions.customCurrencies
			});

			if (!oResult) {
				return null;
			}

			// TODO: better error handling in strict mode
			// Next steps will be to implement a more helpful error message for these cases.
			// Right now we simply return null. For now this will force the types to throw
			// a default ParseException with a non-descriptive error.
			if (oOptions.strictParsing) {
				if (!oResult.currencyCode || oResult.duplicatedSymbolFound) {
					// here we need an error log for:
					// 1. missing currency code/symbol (CLDR & custom)
					// 2. duplicated symbol was found (only custom, CLDR has no duplicates)
					return null;
				}
			}

			sValue = oResult.numberValue;
			sMeasure = oResult.currencyCode;

			if (oOptions.customCurrencies && sMeasure === null) {
				return null;
			}

			if (!oOptions.showNumber) {
				if (sValue) {
					return null;
				}
				return [undefined, sMeasure];
			}
		}

		// remove all white spaces because when grouping separator is a non-breaking space (russian and french for example)
		// user will not input it this way. Also white spaces or grouping separator can be ignored by determining the value
		sValue = sValue.replace(rAllWhiteSpaces, "");

		oShort = getNumberFromShortened(sValue, this.oLocaleData, bIndianCurrency);
		if (oShort) {
			sValue = oShort.number;
		}
		var bScientificNotation = isScientificNotation(sValue);

		// Check for valid syntax
		// integer might be expressed in scientific format, e.g. 1.23e+5
		// for this case it must be parsed as float
		if (oOptions.isInteger && !oShort && !bScientificNotation) {
			oRegExp = new RegExp(sRegExpInt);
		} else {
			oRegExp = new RegExp(sRegExpFloat);
		}
		if (!oRegExp.test(sValue)) {
			return oOptions.type === mNumberType.CURRENCY || oOptions.type === mNumberType.UNIT ? null : NaN;
		}

		// Replace "minus/plus" sign with a parsable symbol
		// e.g. "➖47" ("➖" or "\u2796" cannot be parsed using parseInt) --> "-47" (can be parsed using parseInt)
		var iValueLength = sValue.length;
		for (var iValuePos = 0; iValuePos < iValueLength; iValuePos++) {
			var sCurrentValueChar = sValue[iValuePos];

			// it can either be a minus or a plus
			// if one was found break because there can only be one in a value
			if (sPlusSigns.includes(sCurrentValueChar)) {
				sValue = sValue.replace(sCurrentValueChar, "+");
				break;
			} else if (sMinusSigns.includes(sCurrentValueChar)) {
				sValue = sValue.replace(sCurrentValueChar, "-");
				break;
			}
		}

		// Remove the leading "+" sign because when "parseAsString" is set to true the "parseInt" or "parseFloat" isn't called and the leading "+" has to be moved manually
		sValue = sValue.replace(/^\+/, "");

		// remove the percentage sign
		if (!oOptions.isInteger && sValue.indexOf(sPercentSign) !== -1) {
			bPercent = true;
			sValue = sValue.replace(sPercentSign, "");
		}

		var sValueWithGrouping = sValue;

		// Remove grouping separator and replace locale dependant decimal separator,
		// before calling parseInt/parseFloat
		sValue = sValue.replace(oGroupingRegExp, "");

		// Expanding short value before using parseInt/parseFloat
		if (oShort) {
			sValue = sValue.replace(oDecimalRegExp, ".");
			sValue = NumberFormat._shiftDecimalPoint(sValue, Math.round(Math.log(oShort.factor) / Math.LN10));
		}

		if (oOptions.isInteger) {
			var iInt;
			// check if it is a valid integer
			// 1.234567e+5 is 123456.7 is not an integer
			// 1.234567e+6 is 1234567 is an integer
			if (bScientificNotation) {
				sValue = sValue.replace(oDecimalRegExp, ".");
				iInt = getInteger(sValue);
				if (iInt === undefined) {
					return NaN;
				}
			} else {
				iInt = parseInt(sValue);
			}
			vResult = oOptions.parseAsString ? sValue : iInt;
		} else {
			sValue = sValue.replace(oDecimalRegExp, ".");
			vResult = oOptions.parseAsString ? sValue : parseFloat(sValue);
			if (bPercent) {
				vResult = NumberFormat._shiftDecimalPoint(vResult, -2);
			}
		}

		// strict grouping validation
		var bIsGroupingValid = this._checkGrouping(sValueWithGrouping, oOptions, bScientificNotation);
		if (!bIsGroupingValid) {
			// treat invalid grouping the same way as if the value cannot be parsed
			return (oOptions.type === mNumberType.CURRENCY || oOptions.type === mNumberType.UNIT) ? null : NaN;
		}

		// Get rid of leading zeros (percent was already shifted)
		if (oOptions.parseAsString && !bPercent) {
			vResult = NumberFormat._shiftDecimalPoint(sValue, 0);
		}

		if (oOptions.type === mNumberType.CURRENCY || oOptions.type === mNumberType.UNIT) {
			return [vResult, sMeasure];
		}
		return vResult;
	};

	/**
	 * Returns the scaling factor which is calculated based on the format options and the current locale being used.
	 *
	 * This function only returns a meaningful scaling factor when the 'style' formatting option is set
	 * to 'short' or 'long', and the 'shortRefNumber' option for calculating the scale factor is set.
	 *
	 * Consider using this function when the 'showScale' option is set to <code>false</code>, which
	 * causes the scale factor not to appear in every formatted number but in a shared place.
	 *
	 * @example thousand (locale "en")
	 *
	 * NumberFormat.getFloatInstance({style: "long", shortRefNumber: 1000}).getScale();
	 * // "thousand"
	 *
	 * @returns {string|undefined} The scale string if it exists based on the given 'shortRefNumber' option. Otherwise it returns <code>undefined</code>.
	 * @since 1.100
	 * @public
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

	/**
	 * Moves the decimal seperator of the given number by the given steps to the right or left.
	 *
	 * @param {number|string} vValue
	 *   The number
	 * @param {int} iStep
	 *   The number of decimal places to shift the "."; positive values shift to the right, negative values shift to the
	 *   left
	 * @param {boolean} bNormalize
	 *   Whether the result is normalized if <code>vValue</code> is of type "string"; that means whether trailing zeros
	 *   are removed and whether scientific notation is resolved to a decimal string without exponent
	 * @returns {number|string|null}
	 *   The number with shifted decimal point; or <code>null</code> if the given value is neither of type "number", nor
	 *   of type "string"
	 */
	NumberFormat._shiftDecimalPoint = function(vValue, iStep, bNormalize) {
		var sMinus = "";
		var aExpParts = vValue.toString().toLowerCase().split("e");

		if (typeof vValue === "number") {
			// Exponential operation is used instead of simply multiply the number by
			// Math.pow(10, maxFractionDigits) because Exponential operation returns exact float
			// result but multiply doesn't. For example 1.005*100 = 100.49999999999999.

			iStep = aExpParts[1] ? (+aExpParts[1] + iStep) : iStep;

			return +(aExpParts[0] + "e" + iStep);
		} else if (typeof vValue === "string") {
			if (!bNormalize && parseFloat(vValue) === 0 && iStep >= 0) {
				// input "00000" should become "0"
				// input "000.000" should become "0.000" to keep precision of decimals
				// input "1e-1337" should remain "1e-1337" in order to keep the precision
				return vValue.replace(rLeadingZeros, "$1$2");
			}
			// In case of a negative value the leading minus needs to be cut off before shifting the decimal point.
			// Otherwise the minus will affect the positioning by index 1.
			// The minus sign will be added to the final result again.
			var sFirstChar = aExpParts[0].charAt(0);
			sMinus = sFirstChar === "-" ? sFirstChar : "";

			if (sMinus || sFirstChar === "+") {
				aExpParts[0] = aExpParts[0].slice(1);
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
			sInt = sInt.replace(rLeadingZeros, "$1$2");
			if (bNormalize) {
				sDecimal = sDecimal.replace(rTrailingZeros, "");
			}

			return sMinus + sInt + (sDecimal ? ("." + sDecimal) : "");
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
		if (oOptions.type === mNumberType.CURRENCY) {
			if (oOptions.trailingCurrencyCode) {
				sStyle = "sap-short";
			}
			if (bIndianCurrency) {
				sCldrFormat = getIndianCurrencyFormat(sStyle, sKey, "other", true);
			} else {
				// Use currency specific format because for some languages there is a difference between the decimalFormat and the currencyFormat
				sCldrFormat = oLocaleData.getCurrencyFormat(sStyle, sKey, "other");
			}
		} else {
			sCldrFormat = oLocaleData.getDecimalFormat(sStyle, sKey, "other");
		}

		if (!sCldrFormat || sCldrFormat == "0") {
			//no format or special "0" format => number doesn't need to be shortened
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
				//we cannot shorten
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
					// Note: CLDR uses a non-breaking space and right-to-left mark u+200f in the format string
					sCldrFormat = FormatUtils.normalize(sCldrFormat, true);
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

	/**
	 * Based on the format options and the global config, determine whether to display a trailing currency code
	 * @param oFormatOptions
	 * @returns {boolean}
	 */
	function showTrailingCurrencyCode(oFormatOptions) {
		var bShowTrailingCurrencyCodes = Formatting.getTrailingCurrencyCode();
		if (oFormatOptions) {

			// overwritten by instance configuration
			if (oFormatOptions.trailingCurrencyCode !== undefined) {
				bShowTrailingCurrencyCodes = oFormatOptions.trailingCurrencyCode;
			}

			// is false when custom pattern is used
			if (oFormatOptions.pattern) {
				bShowTrailingCurrencyCodes = false;
			}

			// is false when currencyCode is not used
			if (oFormatOptions.currencyCode === false) {
				bShowTrailingCurrencyCodes = false;
			}
		}
		return bShowTrailingCurrencyCodes;
	}

	function getIndianCurrencyFormat(sStyle, sKey, sPlural, bDecimal) {
		var sFormat,
			oCurrencyFormats = {
				"short": {
					"1000-one": "\xa40000",
					"1000-other": "\xa40000",
					"10000-one": "\xa400000",
					"10000-other": "\xa400000",
					"100000-one": "\xa40 Lk",
					"100000-other": "\xa40 Lk",
					"1000000-one": "\xa400 Lk",
					"1000000-other": "\xa400 Lk",
					"10000000-one": "\xa40 Cr",
					"10000000-other": "\xa40 Cr",
					"100000000-one": "\xa400 Cr",
					"100000000-other": "\xa400 Cr",
					"1000000000-one": "\xa4000 Cr",
					"1000000000-other": "\xa4000 Cr",
					"10000000000-one": "\xa40000 Cr",
					"10000000000-other": "\xa40000 Cr",
					"100000000000-one": "\xa400000 Cr",
					"100000000000-other": "\xa400000 Cr",
					"1000000000000-one": "\xa40 Lk Cr",
					"1000000000000-other": "\xa40 Lk Cr",
					"10000000000000-one": "\xa400 Lk Cr",
					"10000000000000-other": "\xa400 Lk Cr",
					"100000000000000-one": "\xa40 Cr Cr",
					"100000000000000-other": "\xa40 Cr Cr"
				},
				"sap-short": {
					"1000-one": "0000\xa0\xa4",
					"1000-other": "0000\xa0\xa4",
					"10000-one": "00000\xa0\xa4",
					"10000-other": "00000\xa0\xa4",
					"100000-one": "0 Lk\xa0\xa4",
					"100000-other": "0 Lk\xa0\xa4",
					"1000000-one": "00 Lk\xa0\xa4",
					"1000000-other": "00 Lk\xa0\xa4",
					"10000000-one": "0 Cr\xa0\xa4",
					"10000000-other": "0 Cr\xa0\xa4",
					"100000000-one": "00 Cr\xa0\xa4",
					"100000000-other": "00 Cr\xa0\xa4",
					"1000000000-one": "000 Cr\xa0\xa4",
					"1000000000-other": "000 Cr\xa0\xa4",
					"10000000000-one": "0000 Cr\xa0\xa4",
					"10000000000-other": "0000 Cr\xa0\xa4",
					"100000000000-one": "00000 Cr\xa0\xa4",
					"100000000000-other": "00000 Cr\xa0\xa4",
					"1000000000000-one": "0 Lk Cr\xa0\xa4",
					"1000000000000-other": "0 Lk Cr\xa0\xa4",
					"10000000000000-one": "00 Lk Cr\xa0\xa4",
					"10000000000000-other": "00 Lk Cr\xa0\xa4",
					"100000000000000-one": "0 Cr Cr\xa0\xa4",
					"100000000000000-other": "0 Cr Cr\xa0\xa4"
				}
			},
			oDecimalFormats = {
				"short": {
					"1000-one": "0000",
					"1000-other": "0000",
					"10000-one": "00000",
					"10000-other": "00000",
					"100000-one": "0 Lk",
					"100000-other": "0 Lk",
					"1000000-one": "00 Lk",
					"1000000-other": "00 Lk",
					"10000000-one": "0 Cr",
					"10000000-other": "0 Cr",
					"100000000-one": "00 Cr",
					"100000000-other": "00 Cr",
					"1000000000-one": "000 Cr",
					"1000000000-other": "000 Cr",
					"10000000000-one": "0000 Cr",
					"10000000000-other": "0000 Cr",
					"100000000000-one": "00000 Cr",
					"100000000000-other": "00000 Cr",
					"1000000000000-one": "0 Lk Cr",
					"1000000000000-other": "0 Lk Cr",
					"10000000000000-one": "00 Lk Cr",
					"10000000000000-other": "00 Lk Cr",
					"100000000000000-one": "0 Cr Cr",
					"100000000000000-other": "0 Cr Cr"
				}
			};
		// decimal format for short and sap-short is the same
		oDecimalFormats["sap-short"] = oDecimalFormats["short"];

		// use the appropriate format (either decimal or currency)
		var oTargetFormat = bDecimal ? oDecimalFormats : oCurrencyFormats;
		var oStyledFormat = oTargetFormat[sStyle];
		if (!oStyledFormat) {
			oStyledFormat = oTargetFormat["short"];
		}
		if (sPlural !== "one") {
			sPlural = "other";
		}
		sFormat = oStyledFormat[sKey + "-" + sPlural];
		return sFormat;
	}

	/**
	 * Checks if grouping is performed correctly (decimal separator is not confused with grouping separator).
	 * The examples use the German locale.
	 *
	 * Validity:
	 * * The grouping is valid if there are at least 2 grouping separators present.
	 *   Because there can only be one decimal separator, and by writing 2 grouping separators there is no confusion.
	 *   E.g. 1.2.3
	 * * The grouping is valid if there is a decimal separator and one grouping separator present.
	 *   Because the user wrote both, there cannot be a confusion.
	 *   (If it was confused, it has already been taken care by the syntax check.)
	 *   E.g. 1.2,3
	 *
	 * Invalidity:
	 * * If there is exactly one grouping separator present, no decimal separator, and the grouping
	 *   separator at the most right grouping position is wrong.
	 *   E.g. 1.2
	 *   E.g. 1.234567
	 *
	 * The grouping is checked even if the groupingEnabled format is set to <code>false</code>, because the
	 * input could be copied from external sources which might have wrong grouping separators.
	 *
	 * The empty grouping separator is ignored and <code>true</code> is returned, because it cannot be validated.
	 *
	 * An additional check is performed which invalidates a wrong number syntax
	 * E.g. 0.123
	 * E.g. -.123
	 *
	 * @param {string} sValueWithGrouping the normalized value which only contains the grouping (e.g. "1.000"),
	 *  i.e. the following modifications were already applied:
	 *  <ul>
	 *   <li>remove percent symbol</li>
	 *   <li>remove leading plus</li>
	 *   <li>remove whitespaces</li>
	 *   <li>remove RTL characters</li>
	 *   <li>remove short/long format (e.g. "Mio"/"Million")</li>
	 *   <li>resolve lenient symbols</li>
	 *  </ul>
	 * This means grouping separators which are space characters or RTL characters are not validated.
	 * @param {object} oOptions the format options, relevant are: groupingSeparator, groupingSize, groupingBaseSize and decimalSeparator
	 * @param {boolean} bScientificNotation is scientific notation, e.g. "1.234e+1"
	 * @returns {boolean} true if the grouping is done correctly, e.g. "1.23" is not grouped correctly for grouping separator "." and groupingSize 3
	 * @private
	 */
	NumberFormat.prototype._checkGrouping = function(sValueWithGrouping, oOptions, bScientificNotation) {
		if (oOptions.groupingSeparator && sValueWithGrouping.includes(oOptions.groupingSeparator)) {
			// All following checks are only done, if the value contains at least one (non-falsy) grouping separator.
			// The examples below use the German locale:
			// groupingSeparator: '.'
			// decimalSeparator: ','
			// groupingSize: 3

			// remove leading minus sign, it is irrelevant for grouping check
			// "-123.456" -> "123.456"
			sValueWithGrouping = sValueWithGrouping.replace(/^-/, "");

			// remove leading zeros before non-zero digits
			// "001.234" -> "1.234"
			// "0.234" -> "0.234"
			sValueWithGrouping = sValueWithGrouping.replace(/^0+(\d)/, "$1");

			// if value still starts with 0, or it starts with a grouping separator, it is invalid
			// e.g. "0.123", ".123" (invalid)
			if (sValueWithGrouping.startsWith("0") || sValueWithGrouping.startsWith(oOptions.groupingSeparator)) {
				return false;
			}

			// remove scientific notation
			// "1.234e+1" -> "1.234"
			if (bScientificNotation) {
				sValueWithGrouping = sValueWithGrouping.replace(/[eE].*/, "");
			}

			var bHasDecimalSeparator = sValueWithGrouping.includes(oOptions.decimalSeparator);
			// Integer types often have identical decimal and grouping separators configured,
			// therefore we do not remove the decimals part and validate them as if they would not
			// have decimals
			if (oOptions.decimalSeparator === oOptions.groupingSeparator) {
				bHasDecimalSeparator = false;
			} else if (bHasDecimalSeparator) {
				// remove decimals part to be able to validate grouping
				sValueWithGrouping = sValueWithGrouping.split(oOptions.decimalSeparator)[0];
			}

			// check if decimal and grouping separator were confused.
			// This check is performed in addition to stricter grouping validation (strictGroupingValidation)
			// to reduce the confusion between decimal and grouping separator.
			// e.g. for "de": 1.234567 (is invalid)
			// Pre-requisites (examples for "de")
			// * number has exactly one grouping separator, e.g. "1.23"
			//   since there can be only one decimal separator, if there is exactly one grouping
			//   separator they could have been confused
			// * number has no decimal separator, e.g. 1.23
			//   if there is a decimal separator and a grouping separator present,
			//   there cannot be a confusion
			var bHasExactlyOneGroupingSeparator = sValueWithGrouping.split(oOptions.groupingSeparator).length === 2;
			if (bHasExactlyOneGroupingSeparator && !bHasDecimalSeparator) {
				// find least-significant ("lowest") grouping separator
				var iLowestGroupingIndex = sValueWithGrouping.length - sValueWithGrouping.lastIndexOf(oOptions.groupingSeparator);
				var iBaseGroupSize = oOptions.groupingBaseSize || oOptions.groupingSize;
				// if least-significant grouping size doesn't match grouping base size, the value is invalid
				// e.g. 12.34 (invalid)
				if (iLowestGroupingIndex !== iBaseGroupSize + oOptions.groupingSeparator.length) {
					return false;
				}
			}

			/**
			 * With strictGroupingValidation enabled the behaviour is closer to ABAP, the position
			 * of the grouping separators are validated as well.
			 * e.g. for "de" <code>1.2.3</code> becomes invalid
			 */
			if (oOptions.strictGroupingValidation) {
				if (!this._rGrouping) {
					this._rGrouping = getGroupingRegExp(oOptions.groupingSeparator,
						oOptions.groupingSize, oOptions.groupingBaseSize || oOptions.groupingSize);
				}

				// e.g. for "de" with valid grouping separators at the correct position
				// rGrouping: /^\d+(?:\.?\d{3})*\.?\d{3}$/
				// sValueWithGrouping: 123 456.789
				//                     123 456 789
				//                     123.456.789
				// Note: spaces are just there for visual aid.
				if (!this._rGrouping.test(sValueWithGrouping)) {
					return false;
				}
			}
		}

		return true;
	};

	/**
	 * Whether or not the given value is in scientific notation
	 *
	 * @param {string} sValue string value, e.g. "9e+4"
	 * @returns {boolean} <code>true</code> if it is in scientific notation
	 */
	function isScientificNotation(sValue) {
		return sValue.indexOf("e") > 0 || sValue.indexOf("E") > 0;
	}

	/**
	 * Evaluates if the given number is an integer and returns it.
	 * Otherwise returns <code>undefined</code>
	 *
	 * @param {string} sValue string value, e.g. "9e+4" or "1.2345e+25"
	 * @returns {int} if value can be parsed to integer e.g. 90000, <code>undefined</code> otherwise
	 */
	function getInteger(sValue) {
		// when resolving the e-notation check if there is still a dot character present and after the dot character there are no zeros
		var sResolvedENotation = NumberFormat._shiftDecimalPoint(sValue, 0);
		if (sResolvedENotation.indexOf(".") > 0 && !rOnlyZeros.test(sResolvedENotation.split(".")[1])) {
			return undefined;
		}

		var fFloat = parseFloat(sResolvedENotation);
		var sFloat = "" + fFloat;

		// parseFloat() still produces the scientific notation output for bigger values such
		// as "1.2345e+25".
		// This conversion is required because parseInt() cannot handle scientific notation with
		// the mantissa being a floating point number, e.g. "1.2345e+25"
		if (isScientificNotation(sFloat)) {
			// retrieve the string value from the given float number
			// "1.2345e+25" becomes "12345000000000000000000000"
			sFloat = NumberFormat._shiftDecimalPoint(sFloat, 0);
		}

		var iInt = parseInt(sFloat);

		if (iInt !== fFloat) {
			return undefined;
		}
		return iInt;
	}

	/**
	 * Rounds the given value by the given number of fraction digits based on the given rounding mode.
	 *
	 * @param {number|string} vValue
	 *   The number to be rounded, may be a string or a number; has to be of type number if a custom rounding function
	 *   is used
	 * @param {int|string} iMaxFractionDigits
	 *   The maximum number of fraction digits
	 * @param {sap.ui.core.format.NumberFormat.RoundingMode|function(number,int):number} vRoundingMode
	 *   The rounding mode or a custom function for rounding which is called with the number and the number of decimal
	 *   digits that should be reserved; <b>using a function is deprecated since 1.121.0</b>; string based numbers are
	 *   not rounded via this custom function.
	 * @returns {number|string}
	 *   The rounded value; the returned type is the same as the type of the given <code>vValue</code>
	 */
	function rounding(vValue, iMaxFractionDigits, vRoundingMode) {
		vRoundingMode = vRoundingMode || NumberFormat.RoundingMode.HALF_AWAY_FROM_ZERO;
		iMaxFractionDigits = parseInt(iMaxFractionDigits);

		// only round if it is required (number of fraction digits is bigger than the maxFractionDigits option)
		var sValue = "" + vValue;
		if (!isScientificNotation(sValue)) {
			var iIndexOfPoint = sValue.indexOf(".");
			if (iIndexOfPoint < 0) {
				return vValue;
			}
			if (sValue.substring(iIndexOfPoint + 1).length <= iMaxFractionDigits) {
				if (typeof vValue === "string") {
					vValue = NumberFormat._shiftDecimalPoint(vValue, 0, true);
				}
				return vValue;
			}
		}

		if (typeof vRoundingMode === "function") {
			// Support custom function for rounding the number
			vValue = vRoundingMode(vValue, iMaxFractionDigits);
		} else {
			// The NumberFormat.RoundingMode had all values in lower case before and later changed all values to upper case
			// to match the key according to the UI5 guideline for defining enum. Therefore it's needed to support both
			// lower and upper cases. Here checks whether the value has only lower case letters and converts it all to upper
			// case if so.
			if (vRoundingMode.match(/^[a-z_]+$/)) {
				vRoundingMode = vRoundingMode.toUpperCase();
			}

			// 1. Move the decimal point to right by maxFactionDigits; e.g. 1.005 with maxFractionDigits 2 => 100.5
			vValue = NumberFormat._shiftDecimalPoint(vValue, iMaxFractionDigits, true);
			// 2. Use the rounding function to round the first digit after decimal point; e.g. ceil(100.5) => 101
			vValue = mRoundingFunction[vRoundingMode](vValue);
			// 3. Finally move the decimal point back to the original position; e.g. by 2 digits => 1.01
			vValue = NumberFormat._shiftDecimalPoint(vValue, -iMaxFractionDigits, true);
			if (typeof vValue === "string") {
				vValue = vValue.replace(rRemoveMinusFromZero, "$1");
			}
		}
		return vValue;
	}

	function quote(sRegex) {
		return sRegex.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	}

	function getDecimals(fValue, iPrecision) {
		var iIntegerDigits = Math.floor(Math.log(Math.abs(fValue)) / Math.LN10);
		return Math.max(0, iPrecision - iIntegerDigits - 1);
	}

	/**
	 * Returns the CLDR code and the number value by checking each pattern and finding the best
	 * match. The best match means most of the unit value matched and the number match is shorter.
	 *
	 * Example input: "12km" matches for the unit postfix "m" and the resulting number value is
	 * "12k" while the unit postfix "km" results in "12". Since unit postfix "km" returns a shorter
	 * result it is considered the best match.
	 *
	 * Note: the CLDR data is not distinct in its patterns.
	 * For example "100 c" could be in "en_gb" either 100 units of "volume-cup" or
	 * "duration-century" both having the same pattern "{0} c". Therefore best matches will be
	 * returned in an array.
	 *
	 * @param {object} mUnitPatterns The unit patterns
	 * @param {string} sValue The given value
	 * @param {boolean} bShowNumber Whether the number is shown
	 * @param {string} sLanguageTag The language tag of the locale for language dependent processing
	 * @return {{cldrCode: string[], numberValue: (string|undefined)}}
	 *   An object containing the unit codes and the number value
	 */
	function parseNumberAndUnit(mUnitPatterns, sValue, bShowNumber, sLanguageTag) {
		var bContainsNumber, sKey, sNumber, iNumberPatternIndex, sPostfix, sPostfixLowerCase,
			sPrefix, sPrefixLowerCase, sUnitCode, sUnitPattern, sUnitPatternLowerCase,
			oBestMatch = {
				numberValue : undefined,
				cldrCode : []
			},
			aCaseInsensitiveMatches = [],
			bCaseSensitive = true,
			bPatternMatchWasCaseSensitive = true,
			iShortestNumberPartLength = Number.POSITIVE_INFINITY,
			bShortestNumberPartWasCaseSensitive = true,
			sValueLowerCase = sValue.toLocaleLowerCase(sLanguageTag);

		for (sUnitCode in mUnitPatterns) {
			for (sKey in mUnitPatterns[sUnitCode]) {
				//use only unit patterns
				if (!sKey.startsWith("unitPattern")) {
					continue;
				}
				sUnitPattern = FormatUtils.normalize(mUnitPatterns[sUnitCode][sKey]);

				// IMPORTANT:
				// To increase performance we are using native string operations instead of regex,
				// to match the patterns against the input.
				//
				// sample input: e.g. "mi 12 tsd. ms²"
				// unit pattern: e.g. "mi {0} ms²"

				// The smallest resulting number (String length) will be the best match
				iNumberPatternIndex = sUnitPattern.indexOf("{0}");
				bContainsNumber = iNumberPatternIndex > -1;
				if (bContainsNumber && !bShowNumber) {
					sUnitPattern = sUnitPattern.replace("{0}", "").trim();
					bContainsNumber = false;
				}
				sNumber = undefined;
				bCaseSensitive = true;
				if (bContainsNumber) {
					sPrefix = sUnitPattern.substring(0, iNumberPatternIndex);
					sPrefixLowerCase = sPrefix.toLocaleLowerCase(sLanguageTag);
					sPostfix = sUnitPattern.substring(iNumberPatternIndex + 3);
					sPostfixLowerCase = sPostfix.toLocaleLowerCase(sLanguageTag);

					if (sValue.startsWith(sPrefix) && sValue.endsWith(sPostfix)) {
						sNumber = sValue.substring(sPrefix.length, sValue.length - sPostfix.length);
					} else if (sValueLowerCase.startsWith(sPrefixLowerCase)
							&& sValueLowerCase.endsWith(sPostfixLowerCase)) {
						bCaseSensitive = false;
						sNumber = sValue.substring(sPrefixLowerCase.length,
							sValueLowerCase.length - sPostfixLowerCase.length);
					}

					if (sNumber) {
						//get the match with the shortest result.
						// e.g. 1km -> (.+)m -> "1k" -> length 2
						// e.g. 1km -> (.+)km -> "1" -> length 1

						if (sNumber.length < iShortestNumberPartLength) {
							iShortestNumberPartLength = sNumber.length;
							bShortestNumberPartWasCaseSensitive = bCaseSensitive;
							oBestMatch.numberValue = sNumber;
							oBestMatch.cldrCode = [sUnitCode];
						} else if (sNumber.length === iShortestNumberPartLength
								&& oBestMatch.cldrCode.indexOf(sUnitCode) === -1) {
							if (bCaseSensitive && !bShortestNumberPartWasCaseSensitive) {
								oBestMatch.numberValue = sNumber;
								oBestMatch.cldrCode = [sUnitCode];
								bShortestNumberPartWasCaseSensitive = true;
							} else if (bCaseSensitive || !bShortestNumberPartWasCaseSensitive) {
								//ambiguous unit (en locale)
								// e.g. 100 c -> (.+) c -> duration-century
								// e.g. 100 c -> (.+) c -> volume-cup
								oBestMatch.cldrCode.push(sUnitCode);
							}
						}
					}
				} else {
					sUnitPatternLowerCase = sUnitPattern.toLocaleLowerCase(sLanguageTag);

					if (sUnitPattern === sValue || sUnitPatternLowerCase === sValueLowerCase) {
						if (bShowNumber) {

							//for units which do not have a number representation, get the number from the pattern
							if (sKey.endsWith("-zero")) {
								sNumber = "0";
							} else if (sKey.endsWith("-one")) {
								sNumber = "1";
							} else if (sKey.endsWith("-two")) {
								sNumber = "2";
							}

							if (sUnitPattern === sValue) {
								oBestMatch.numberValue = sNumber;
								oBestMatch.cldrCode = [sUnitCode];

								return oBestMatch;
							} else if (!oBestMatch.cldrCode.includes(sUnitCode)) {
								bPatternMatchWasCaseSensitive = false;
								oBestMatch.numberValue = sNumber;
								oBestMatch.cldrCode.push(sUnitCode);
							}
						} else if (oBestMatch.cldrCode.indexOf(sUnitCode) === -1) {
							if (sUnitPattern === sValue) {
								oBestMatch.cldrCode.push(sUnitCode);
							} else if (!aCaseInsensitiveMatches.includes(sUnitCode)) {
								aCaseInsensitiveMatches.push(sUnitCode);
							}
						}
					}
				}
			}
		}
		if ((!bShortestNumberPartWasCaseSensitive || !bPatternMatchWasCaseSensitive)
				&& oBestMatch.cldrCode.length > 1) {
			oBestMatch.numberValue = undefined;
		}
		if (!bShowNumber && !oBestMatch.cldrCode.length) {
			oBestMatch.cldrCode = aCaseInsensitiveMatches;
		}

		return oBestMatch;
	}

	/**
	 * Identify the longest match between a sub string of <code>sValue</code>
	 * and one of the values of the <code>mCollection</code> map.
	 *
	 * @param {string} sValue
	 *   The string value which is checked for all currency codes/symbols
	 * @param {Object<string, string>} mCollection
	 *   An object mapping a currency code to a either a currency symbol or the currency code itself
	 * @param {boolean} bCaseInsensitive Whether case insensitive matches are allowed
	 * @return {{code: string, recognizedCurrency: string, symbol: string}}
	 *   An object with the code, the recognized currency and the symbol found in the given value;
	 *   an empty object in case of either conflicting case insensitive matches, or no match
	 */
	function findLongestMatch(sValue, mCollection, bCaseInsensitive) {
		var sCode, sCurCode, sCurSymbol, sCurSymbolToUpperCase, iIndex, sLanguageTag,
			sRecognizedCurrency, sValueSubStr,
			bDuplicate = false,
			bExactMatch = false,
			sSymbol = "";

		for (sCurCode in mCollection) {
			sCurSymbol = mCollection[sCurCode];
			if (!sCurSymbol) {
				continue;
			}
			sCurSymbol = FormatUtils.normalize(sCurSymbol);
			if (sValue.indexOf(sCurSymbol) >= 0 && sSymbol.length <= sCurSymbol.length) {
				sCode = sCurCode;
				bDuplicate = false;
				bExactMatch = true;
				sSymbol = sCurSymbol;
				sRecognizedCurrency = sCurSymbol;
			} else if (bCaseInsensitive) {
				sLanguageTag = Localization.getLanguageTag().toString();
				sCurSymbolToUpperCase = sCurSymbol.toLocaleUpperCase(sLanguageTag);
				iIndex = sValue.toLocaleUpperCase(sLanguageTag).indexOf(sCurSymbolToUpperCase);
				if (iIndex >= 0) {
					if (sSymbol.length === sCurSymbol.length && !bExactMatch) {
						bDuplicate = true;
					} else if (sSymbol.length < sCurSymbol.length) {
						sValueSubStr = sValue.substring(iIndex, iIndex + sCurSymbol.length);
						if (sValueSubStr.toLocaleUpperCase(sLanguageTag)
								=== sCurSymbolToUpperCase) {
							sCode = sCurCode;
							bDuplicate = false;
							bExactMatch = false;
							sSymbol = sCurSymbol;
							sRecognizedCurrency = sValueSubStr;
						}
					}
				}
			}
		}

		if (bDuplicate || !sCode) {
			return {};
		}

		return {
			code : sCode,
			recognizedCurrency : sRecognizedCurrency,
			symbol : sSymbol
		};
	}

	/**
	 * Parses number and currency.
	 *
	 * Search for the currency symbol first, looking for the longest match. In case no currency
	 * symbol is found, search for a three letter currency code.
	 *
	 * @param {object} oConfig
	 * @param {string} oConfig.value the string value to be parse
	 * @param {object} oConfig.currencySymbols the list of currency symbols to respect during parsing
	 * @param {object} oConfig.customCurrencyCodes the list of currency codes used for parsing in case no symbol was found in the value string
	 * @param {object} oConfig.duplicatedSymbols a list of all duplicated symbols;
	 * In case oFormatOptions.currencyCode is set to false and the value string contains a duplicated symbol,
	 * the value is not parsable. The result will be a parsed number and <code>undefined</code> for the currency.
	 * @param {boolean} oConfig.customCurrenciesAvailable a flag to mark if custom currencies are available on the instance
	 *
	 * @private
	 * @returns {object|undefined} returns object containing numberValue and currencyCode or undefined
	 */
	function parseNumberAndCurrency(oConfig) {
		var aIsoMatches,
			sValue = oConfig.value;

		// Search for known symbols (longest match)
		// no distinction between default and custom currencies
		var oMatch = findLongestMatch(sValue, oConfig.currencySymbols);

		// Search for currency code
		if (!oMatch.code) {
			// before falling back to the default regex for ISO codes we check the
			// codes for custom currencies (if defined)
			oMatch = findLongestMatch(sValue, oConfig.customCurrencyCodes, true);

			if (!oMatch.code && !oConfig.customCurrenciesAvailable) {
				// Match 3-letter iso code
				aIsoMatches = sValue.match(/(^[A-Z]{3}|[A-Z]{3}$)/i);
				oMatch.code = aIsoMatches
					&& aIsoMatches[0].toLocaleUpperCase(Localization.getLanguageTag().toString());
				oMatch.recognizedCurrency = aIsoMatches && aIsoMatches[0];
			}
		}

		// Remove symbol/code from value
		if (oMatch.code) {
			var iLastCodeIndex = oMatch.recognizedCurrency.length - 1;
			var sLastCodeChar = oMatch.recognizedCurrency.charAt(iLastCodeIndex);
			var iDelimiterPos;
			var rValidDelimiters = /[\-\s]+/;

			// Check whether last character of matched code is a number
			if (/\d$/.test(sLastCodeChar)) {
				// Check whether parse string starts with the matched code
				if (sValue.startsWith(oMatch.recognizedCurrency)) {
					iDelimiterPos = iLastCodeIndex + 1;
					// \s matching any whitespace character including
					// non-breaking ws and invisible non-breaking ws
					if (!rValidDelimiters.test(sValue.charAt(iDelimiterPos))) {
						return undefined;
					}
				}
			// Check whether first character of matched code is a number
			} else if (/^\d/.test(oMatch.recognizedCurrency)) {
				// Check whether parse string ends with the matched code
				if (sValue.endsWith(oMatch.recognizedCurrency)) {
					iDelimiterPos = sValue.indexOf(oMatch.recognizedCurrency) - 1;
					if (!rValidDelimiters.test(sValue.charAt(iDelimiterPos))) {
						return undefined;
					}
				}
			}
			sValue = sValue.replace(oMatch.recognizedCurrency, "");
		}

		// Set currency code to undefined, as the defined custom currencies
		// contain multiple currencies having the same symbol.
		var bDuplicatedSymbolFound = false;
		if (oConfig.duplicatedSymbols && oConfig.duplicatedSymbols[oMatch.symbol]) {
			oMatch.code = undefined;
			bDuplicatedSymbolFound = true;
			Log.error("The parsed currency symbol '" + oMatch.symbol + "' is defined multiple " +
					"times in custom currencies.Therefore the result is not distinct.");
		}

		return {
			numberValue: sValue,
			currencyCode: oMatch.code || undefined,
			duplicatedSymbolFound: bDuplicatedSymbolFound
		};
	}

	return NumberFormat;

});
