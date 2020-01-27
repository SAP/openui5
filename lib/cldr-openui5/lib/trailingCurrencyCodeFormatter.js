/**
 * Handles currency patterns from CLDR.
 * It provides functions to modify them such that they are "standardized" (trailing currency code)
 */
var TrailingCurrencyCodeFormatter = {};


// currency placeholder character ¤
// http://cldr.unicode.org/translation/numbers-currency/number-patterns
var sCurrencySymbolPlaceHolder = "\u00a4";
var rCurrencySymbolPlaceHolder = /\u00a4/;
var rCurrencySymbolPlaceHolderWithSpaces = /\s*\u00a4(\s*)/;


var rNumberSymbolPlaceHolder = /[0#.,]+/;
var rNumberSymbolPlaceHolderWithSpaces = /\s*[0#.,]+\s*/;

TrailingCurrencyCodeFormatter.isCurrencySymbolTrailing = function(sPattern) {
	var iNumberSymbolIndex = sPattern.search(rNumberSymbolPlaceHolder);
	var iCurrencySymbolIndex = sPattern.search(rCurrencySymbolPlaceHolder);
	if (iCurrencySymbolIndex === -1) {
		throw new Error("no currency symbol");
	}
	if (iNumberSymbolIndex === -1) {
		throw new Error("no number symbol");
	}
	return iNumberSymbolIndex < iCurrencySymbolIndex;
};

/**
 * Transformation for style "short".
 * Specialities:
 * * pattern can include scale information such as "K" e.g. in "## K ¤"
 * * pattern can be "0"
 * @param {string} sPattern
 * @param {string} sSpace The space character inserted before a currency symbol
 * @returns {string} The transformed pattern if applicable
 */
TrailingCurrencyCodeFormatter.transformShortCurrencyPattern = function(sPattern, sSpace) {
	if (sPattern.indexOf(sCurrencySymbolPlaceHolder) === -1 || TrailingCurrencyCodeFormatter.isCurrencySymbolTrailing(sPattern)) {
		return sPattern;
	}

	// for non-standard styled patterns add it to the end
	// e.g. "¤0M" -> "0M¤"
	sPattern = sPattern.replace(rCurrencySymbolPlaceHolderWithSpaces, "");
	return sPattern + sSpace + sCurrencySymbolPlaceHolder;
};

/**
 * Transformation for patterns "standard" and "accounting"
 * Specialities:
 * * pattern can contain a positive and negative part separated by semicolon, e.g. "¤ 0;-¤ 0"
 * * pattern can be surrounded by brackets, e.g. (¤ 0)
 *
 * Keep spacing between number and currency (as for the existing patterns)
 * The runtime will ensure that a space is inserted between number and currency
 * @param sPattern
 * @param sSpace
 * @returns {*}
 */
TrailingCurrencyCodeFormatter.transformCurrencyPattern = function(sPattern, sSpace){

	// standard pattern may include the negative pattern
	// e.g. "¤ 0;(¤ 0)" -> "0 ¤;(0 ¤)"
	if (sPattern.includes(";")) {
		return sPattern.split(";").map(function(sPartPattern) {
			return TrailingCurrencyCodeFormatter.transformCurrencyPattern(sPartPattern, sSpace);
		}).join(";");
	}

	if (TrailingCurrencyCodeFormatter.isCurrencySymbolTrailing(sPattern)) {
		return sPattern;
	}
	// add currency symbol right after the number
	// "¤ 100" -> "100 ¤"
	var oGetNumberSymbol = rNumberSymbolPlaceHolder.exec(sPattern);
	if (oGetNumberSymbol.length === 1) {
		var sNumberSymbol = oGetNumberSymbol[0];
		var oResult = rCurrencySymbolPlaceHolderWithSpaces.exec(sPattern);
		// if there was no space before, keep it that way
		if (oResult.length !== 2 || !oResult[1]) {
			sSpace = "";
		}
		sPattern = sPattern.replace(rCurrencySymbolPlaceHolderWithSpaces, "");


		// remove space between currency and number
		sPattern = sPattern.replace(rNumberSymbolPlaceHolderWithSpaces, sNumberSymbol + sSpace + sCurrencySymbolPlaceHolder);
	}
	return sPattern;
};

module.exports = TrailingCurrencyCodeFormatter;
