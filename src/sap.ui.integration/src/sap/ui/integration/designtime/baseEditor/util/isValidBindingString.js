/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/BindingParser"
], function (
	BindingParser
) {
	"use strict";

	/**
	 * Checks whether a given string is a valid binding string.
	 * Card placeholders are considered as valid bindings.
	 *
	 * @function
	 * @since 1.76
	 * @param {string} sInput - String to check
	 * @param {boolean} bAllowPlainStrings - Whether to allow plain strings, default is <code>true</code>
	 * @return {boolean} <code>true</code> if the given string is a valid binding string
	 * @experimental
	 * @private
	 */

	function isValidBindingString(sInput, bAllowPlainStrings) {
		var oParsed;
		try {
			// Escape placeholders and mark them as valid bindings
			var sEscapedInput = sInput.replace(/{{([^{]*)}}/g, function (sFullMatch, sInner) {
				if (isValidBindingString(sInner)) {
					return "${}";
				}
				throw "Invalid binding string";
			});
			oParsed = BindingParser.complexParser(sEscapedInput);
		} catch (oError) {
			return false;
		}
		return bAllowPlainStrings !== false ? true : !!oParsed;
	}

	return isValidBindingString;
});
