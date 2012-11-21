/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.core.format.NumberFormat
jQuery.sap.declare("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ui.core.LocaleData");

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
 * <li>groupingEnabled: enable grouping (show the grouping separators</li>
 * <li>groupingSeparator: the used grouping separator</li>
 * <li>decimalSeparator: the used decimal separator</li>
 * <li>plusSign: the used plus symbol</li>
 * <li>minusSign: the used minus symbol</li>
 * </ul>
 * For format options which are not specified default values according to the type and locale settings are used.
 *
 * @public
 */
sap.ui.core.format.NumberFormat = function(oFormatOptions) {
	// Do not use the constructor
	throw new Error();
};
sap.ui.core.format.NumberFormat.prototype = jQuery.sap.newObject(sap.ui.base.Object.prototype);

/*
 * Default format options for Integer
 */
sap.ui.core.format.NumberFormat.oDefaultIntegerFormat = {
	minIntegerDigits: 1,
	maxIntegerDigits: 99,
	minFractionDigits: 0,
	maxFractionDigits: 0,
	groupingEnabled: false,
	groupingSeparator: ",",
	decimalSeparator: ".",
	plusSign: "+",
	minusSign: "-",
	isInteger: true
};

/*
 * Default format options for Float
 */
sap.ui.core.format.NumberFormat.oDefaultFloatFormat = {
	minIntegerDigits: 1,
	maxIntegerDigits: 99,
	minFractionDigits: 0,
	maxFractionDigits: 99,
	groupingEnabled: true,
	groupingSeparator: ",",
	decimalSeparator: ".",
	plusSign: "+",
	minusSign: "-",
	isInteger: false
};

/**
 * @see sap.ui.core.format.NumberFormat.getFloatInstance
 */
sap.ui.core.format.NumberFormat.getInstance = function(oFormatOptions, oLocale) {
	return this.getFloatInstance(oFormatOptions, oLocale);
};

/**
 * Get a float instance of the NumberFormat, which can be used for formatting.
 *
 * @param {object} [oFormatOptions] Object which defines the format options
 * @return {sap.ui.core.format.NumberFormat} float instance of the NumberFormat
 * @static
 * @public
 */
sap.ui.core.format.NumberFormat.getFloatInstance = function(oFormatOptions, oLocale) {
	var oFormat = this.createInstance(oFormatOptions, oLocale);
	oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultFloatFormat, this.getLocaleFormatOptions(oFormat.oLocaleData), oFormatOptions);
	return oFormat;
};

/**
 * Get an integer instance of the NumberFormat, which can be used for formatting.
 *
 * @param {object} [oFormatOptions] Object which defines the format options
 * @return {sap.ui.core.format.NumberFormat} integer instance of the NumberFormat
 * @static
 * @public
 */
sap.ui.core.format.NumberFormat.getIntegerInstance = function(oFormatOptions, oLocale) {
	var oFormat = this.createInstance(oFormatOptions, oLocale);
	oFormat.oFormatOptions = jQuery.extend(false, {}, this.oDefaultIntegerFormat, this.getLocaleFormatOptions(oFormat.oLocaleData), oFormatOptions);
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
sap.ui.core.format.NumberFormat.createInstance = function(oFormatOptions, oLocale) {
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
 * Get locale dependent default format options.
 *
 * @static
 */
sap.ui.core.format.NumberFormat.getLocaleFormatOptions = function(oLocaleData) {
	return {
		plusSign: oLocaleData.getNumberSymbol("plusSign"),
		minusSign: oLocaleData.getNumberSymbol("minusSign"),
		decimalSeparator: oLocaleData.getNumberSymbol("decimal"),
		groupingSeparator: oLocaleData.getNumberSymbol("group")
	}
};

/**
 * Format a number according to the given format options.
 *
 * @param {number} oValue the number to format
 * @return {string} the formatted output value
 * @public
 */
sap.ui.core.format.NumberFormat.prototype.format = function(oValue) {
	var sNumber = "" + oValue,
		sIntegerPart = "",
		sFractionPart = "",
		sGroupedIntegerPart = "",
		sResult = "",
		iPosition = 0,
		iLength = 0,
		bNegative = oValue < 0,
		iDotPos = -1,
		oOptions = this.oFormatOptions;

	// if number is negative remove minus
	if (bNegative) {
		sNumber = sNumber.substr(1);
	}

	// if number contains fraction, extract it
	iDotPos = sNumber.indexOf(".");
	if (iDotPos > -1) {
		sIntegerPart = sNumber.substr(0, iDotPos);
		sFractionPart = sNumber.substr(iDotPos + 1);
	}
	else {
		sIntegerPart = sNumber
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
 */
sap.ui.core.format.NumberFormat.prototype.parse = function(sValue) {
	// Remove all characters but numbers and decimal separator, then use parseInt/parseFloat
	var oOptions = this.oFormatOptions,
		sRegExpFloat = "^\\s*([+-]?(?:[0-9\\" + oOptions.groupingSeparator + "]+|[0-9\\" + oOptions.groupingSeparator + "]*\\" + oOptions.decimalSeparator + "[0-9]+)([eE][+-][0-9]+)?)\\s*$",
		sRegExpInt = "^\\s*([+-]?[0-9\\" + oOptions.groupingSeparator + "]+)\\s*$",
		match, oRegExp,
		oResult = 0;
	
	if (oOptions.isInteger) {
		oRegExp = new RegExp(sRegExpInt);
	} else {
		oRegExp = new RegExp(sRegExpFloat);
	}
	match = oRegExp.exec(sValue);
	if (!match) {
		return NaN;
	}
	sValue = match[1].replace(oOptions.groupingSeparator, "");
	if (oOptions.isInteger) {
		oResult = parseInt(sValue, 10);
	}
	else {
		sValue = sValue.replace(oOptions.decimalSeparator, ".");
		oResult = parseFloat(sValue);
	}
	return oResult;
};
