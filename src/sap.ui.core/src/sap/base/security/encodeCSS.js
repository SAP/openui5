/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/strings/toHex"], function(toHex) {
	"use strict";

	/**
	 * RegExp and escape function for CSS escaping
	 */
	// eslint-disable-next-line no-control-regex -- special characters are really needed here!
	var rCSS = /[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xff\u2028\u2029][0-9A-Fa-f]?/g;

	var fnCSS = function(sChar) {
		var iChar = sChar.charCodeAt(0);
		if (sChar.length === 1) {
			return "\\" + toHex(iChar);
		} else {
			return "\\" + toHex(iChar) + " " + sChar.substr(1);
		}
	};

	/*
	 * Encoding according to the Secure Programming Guide
	 * <SAPWIKI>/wiki/display/NWCUIAMSIM/XSS+Secure+Programming+Guide
	 */

	/**
	 * Encode the string for inclusion into CSS string literals or identifiers.
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/security/encodeCSS
	 * @param {string} sString The string to be escaped
	 * @returns {string} The encoded string
	 * @SecValidate {0|return|XSS} validates the given string for a CSS context
	 * @public
	 */
	var fnEncodeCSS = function(sString) {
		return sString.replace(rCSS, fnCSS);
	};
	return fnEncodeCSS;
});