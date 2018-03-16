/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Converts one character of the string to upper case, at a given position.
	 *
	 * If no position is given or when it is negative or beyond the last character
	 * of <code>sString</code>, then the first character will be converted to upper case.
	 * The first character position is 0.
	 *
	 * @function
	 * @exports sap/base/strings/charToUpperCase
	 * @private
	 * @param {string} sString String for which one character should be converted
	 * @param {number} iPos Position of the character that should be converted
	 * @returns {string} String with the converted character
	 * @SecPassthrough {0|return}
	 * @example charToUpperCase("foobar", 3) -> "fooBar"
	 */
	var fnCharToUpperCase = function (sString, iPos) {
		if (!sString) {
			return sString;
		}
		if (!iPos || isNaN(iPos) || iPos <= 0 || iPos >= sString.length) {
			iPos = 0;
		}
		var sChar = sString.charAt(iPos).toUpperCase();
		if (iPos > 0) {
			return sString.substring(0,iPos) + sChar + sString.substring(iPos + 1);
		}
		return sChar + sString.substring(iPos + 1);
	};
	return fnCharToUpperCase;

});


