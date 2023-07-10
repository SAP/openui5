/**
 * Handles currency patterns from CLDR.
 * It provides functions to modify them such that they are "standardized" (trailing currency code)
 */

// currency placeholder character ¤
// http://cldr.unicode.org/translation/numbers-currency/number-patterns
const sCurrencySymbolPlaceHolder = "\u00a4";
const rCurrencySymbolPlaceHolder = /\u00a4/;
const rCurrencySymbolPlaceHolderWithSpaces = /\s*\u00a4(\s*)/;
// number placeholder
const rNumberSymbolPlaceHolder = /[0#.,]+/;
const rNumberSymbolPlaceHolderWithSpaces = /\s*[0#.,]+\s*/;

export function isCurrencySymbolTrailing(sPattern) {
	const iNumberSymbolIndex = sPattern.search(rNumberSymbolPlaceHolder);
	const iCurrencySymbolIndex = sPattern.search(rCurrencySymbolPlaceHolder);
	if (iCurrencySymbolIndex === -1) {
		throw new Error("no currency symbol");
	}
	if (iNumberSymbolIndex === -1) {
		throw new Error("no number symbol");
	}
	return iNumberSymbolIndex < iCurrencySymbolIndex;
}

/**
 * Transformation for style "short".
 * Specialities:
 * * pattern can include scale information such as "K" e.g. in "## K ¤"
 * * pattern can be "0"
 * @param {string} sPattern The pattern
 * @param {string} sSpace The space character inserted before a currency symbol
 * @returns {string} The transformed pattern if applicable
 */
export function transformShortCurrencyPattern(sPattern, sSpace) {
	if (sPattern.indexOf(sCurrencySymbolPlaceHolder) === -1 || isCurrencySymbolTrailing(sPattern)) {
		return sPattern;
	}

	// for non-standard styled patterns add it to the end
	// e.g. "¤0M" -> "0M¤"
	sPattern = sPattern.replace(rCurrencySymbolPlaceHolderWithSpaces, "");
	return sPattern + sSpace + sCurrencySymbolPlaceHolder;
}

/**
 * Transformation for patterns "standard" and "accounting"
 * Specialities:
 * * pattern can contain a positive and negative part separated by semicolon, e.g. "¤ 0;-¤ 0"
 * * pattern can be surrounded by brackets, e.g. (¤ 0)
 *
 * Keep spacing between number and currency (as for the existing patterns)
 * The runtime will ensure that a space is inserted between number and currency
 * @param {string} sPattern The input pattern
 * @param {string} sSpace The spacing
 * @returns {string} The resulting pattern
 */
export function transformCurrencyPattern(sPattern, sSpace){

	// standard pattern may include the negative pattern
	// e.g. "¤ 0;(¤ 0)" -> "0 ¤;(0 ¤)"
	if (sPattern.includes(";")) {
		return sPattern.split(";").map(function(sPartPattern) {
			return transformCurrencyPattern(sPartPattern, sSpace);
		}).join(";");
	}

	if (isCurrencySymbolTrailing(sPattern)) {
		return sPattern;
	}
	// add currency symbol right after the number
	// "¤ 100" -> "100 ¤"
	const oGetNumberSymbol = rNumberSymbolPlaceHolder.exec(sPattern);
	if (oGetNumberSymbol.length === 1) {
		const sNumberSymbol = oGetNumberSymbol[0];
		const oResult = rCurrencySymbolPlaceHolderWithSpaces.exec(sPattern);
		// if there was no space before, keep it that way
		if (oResult.length !== 2 || !oResult[1]) {
			sSpace = "";
		}
		sPattern = sPattern.replace(rCurrencySymbolPlaceHolderWithSpaces, "");


		// remove space between currency and number
		const sNewNumberSymbolWithPlaceholder = sNumberSymbol + sSpace + sCurrencySymbolPlaceHolder;
		sPattern = sPattern.replace(rNumberSymbolPlaceHolderWithSpaces, sNewNumberSymbolWithPlaceholder);
	}
	return sPattern;
}
