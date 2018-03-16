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
	 * RegExp and escape function for JS escaping
	 */
	var rJS = /[\x00-\x2b\x2d\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\xff\u2028\u2029]/g,
		mJSLookup = {};

	var fJS = function(sChar) {
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

	/**
	 * Encode the string for inclusion into a JS string literal.
	 *
	 * @function
	 * @private
	 * @exports sap/base/encoding/encodeJS
	 * @param {string} sString The string to be escaped
	 * @returns {string} The encoded string
	 * @SecValidate {0|return|XSS} validates the given string for a JavaScript contexts
	 */
	var fnEncodeJS = function(sString) {
		return sString.replace(rJS, fJS);
	};
	return fnEncodeJS;
});