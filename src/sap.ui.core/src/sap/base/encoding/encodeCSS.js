/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(
	["./toHex"],
	function(toHex) {
	"use strict";


	/**
	 * RegExp and escape function for CSS escaping
	 */
	var rCSS = /[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xff\u2028\u2029][0-9A-Fa-f]?/g;

	var fCSS = function(sChar) {
		var iChar = sChar.charCodeAt(0);
		if (sChar.length === 1) {
			return "\\" + toHex(iChar);
		} else {
			return "\\" + toHex(iChar) + " " + sChar.substr(1);
		}
	};

	/**
	 * Encode the string for inclusion into CSS string literals or identifiers.
	 *
	 * @function
	 * @private
	 * @exports sap/base/encoding/encodeCSS
	 * @param {string} sString The string to be escaped
	 * @returns {string} The encoded string
	 * @SecValidate {0|return|XSS} validates the given string for a CSS context
	 */
	var fnEncodeCSS = function(sString) {
		return sString.replace(rCSS, fCSS);
	};
	return fnEncodeCSS;
});