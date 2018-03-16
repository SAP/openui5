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
	 * RegExp and escape function for URL escaping
	 */
	var rURL = /[\x00-\x2c\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\uffff]/g,
		mURLLookup = {};

	var fURL = function(sChar) {
		var sEncoded = mURLLookup[sChar];
		if (!sEncoded) {
			var iChar = sChar.charCodeAt(0);
			if (iChar < 128) {
				sEncoded = "%" + toHex(iChar, 2);
			} else if (iChar < 2048) {
				sEncoded = "%" + toHex((iChar >> 6) | 192, 2) +
					"%" + toHex((iChar & 63) | 128, 2);
			} else {
				sEncoded = "%" + toHex((iChar >> 12) | 224, 2) +
					"%" + toHex(((iChar >> 6) & 63) | 128, 2) +
					"%" + toHex((iChar & 63) | 128, 2);
			}
			mURLLookup[sChar] = sEncoded;
		}
		return sEncoded;
	};

	/**
	 * Encode the string for inclusion into a URL parameter.
	 *
	 * Unescaped characters: alphabetic, decimal digits, -_. (dash, underscore, point)
	 *
	 * @function
	 * @private
	 * @exports sap/base/encoding/encodeURL
	 * @param {string} sString The string to be escaped
	 * @returns {string} The encoded string
	 * @SecValidate {0|return|XSS} validates the given string for a URL context
	 */
	var fnEncodeURL = function(sString) {
		return sString.replace(rURL, fURL);
	};
	return fnEncodeURL;
});