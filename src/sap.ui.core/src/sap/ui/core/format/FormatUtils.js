/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Formatter related utility functions
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @private
	 */
	const FormatUtils = {};
	// https://www.unicode.org/reports/tr44/#Bidi_Class_Values (Explicit Formatting Types)
	const rAllRTLCharacters = /[\u061c\u200e\u200f\u202a\u202b\u202c]/g;
	const rAllSpaces = /\s/g;

	/**
	 * Normalizes the given string by removing RTL characters and either by replacing special space
	 * characters by the standard ASCII space (\u0020) or removing all spaces.
	 *
	 * @param {string} sValue The value to be normalized
	 * @param {boolean} [bRemoveSpaces=false] Whether all spaces are removed
	 * @returns {string} The normalized value
	 */
	FormatUtils.normalize = function (sValue, bRemoveSpaces) {
		return sValue.replace(rAllRTLCharacters, "").replace(rAllSpaces, bRemoveSpaces ? "" : " ");
	};

	return FormatUtils;
});
