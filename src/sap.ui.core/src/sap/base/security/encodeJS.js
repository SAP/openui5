/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/strings/toHex"], function(toHex) {
	"use strict";

	/**
	 * RegExp and escape function for JS escaping
	 */
	// eslint-disable-next-line no-control-regex -- special characters are really needed here!
	var rJS = /[\x00-\x2b\x2d\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\xff\u2028\u2029]/g,
		mJSLookup = {};

	var fnJS = function(sChar) {
		var sEncoded = mJSLookup[sChar];
		if (!sEncoded) {
			var iChar = sChar.charCodeAt(0);
			if (iChar < 256) {
				sEncoded = "\\x" + toHex(iChar, 2);
			} else {
				sEncoded = "\\u" + toHex(iChar, 4);
			}
			mJSLookup[sChar] = sEncoded;
		}
		return sEncoded;
	};

	/*
	 * Encoding according to the Secure Programming Guide
	 * <SAPWIKI>/wiki/display/NWCUIAMSIM/XSS+Secure+Programming+Guide
	 */

	/**
	 * Encode the string for inclusion into a JS string literal.
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/security/encodeJS
	 * @param {string} sString The string to be escaped
	 * @returns {string} The encoded string
	 * @SecValidate {0|return|XSS} validates the given string for a JavaScript contexts
	 * @public
	 */
	var fnEncodeJS = function(sString) {
		return sString.replace(rJS, fnJS);
	};
	return fnEncodeJS;
});