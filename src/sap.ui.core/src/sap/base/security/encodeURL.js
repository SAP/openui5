/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/strings/toHex"], function(toHex) {
	"use strict";

	/**
	 * RegExp and escape function for URL escaping.
	 *
	 * The first term describes Unicode surrogate pairs, the second term all other chars that require encoding.
	 */
	// eslint-disable-next-line no-control-regex -- special characters are really needed here!
	var rURL = /[\ud800-\udbff][\udc00-\udfff]|[\x00-\x2c\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\uffff]/g,
		mURLLookup = {};

	var fnURL = function(sChar) {
		var sEncoded = mURLLookup[sChar];
		if (!sEncoded) {
			// encode code point as UTF-8 byte sequence and percent-encode each resulting byte
			var iChar = sChar.codePointAt(0);
			if (iChar < 128) {
				sEncoded = "%" + toHex(iChar, 2);
			} else if (iChar < 2048) {
				sEncoded = "%" + toHex((iChar >> 6) | 192, 2) +
					"%" + toHex((iChar & 63) | 128, 2);
			} else if ( iChar < 65536 ){
				sEncoded = "%" + toHex((iChar >> 12) | 224, 2) +
					"%" + toHex(((iChar >> 6) & 63) | 128, 2) +
					"%" + toHex((iChar & 63) | 128, 2);
			} else {
				sEncoded = "%" + toHex((iChar >> 18) | 240, 2) +
				"%" + toHex(((iChar >> 12) & 63) | 128, 2) +
				"%" + toHex(((iChar >>  6) & 63) | 128, 2) +
				"%" + toHex((iChar & 63) | 128, 2);
			}
			mURLLookup[sChar] = sEncoded;
		}
		return sEncoded;
	};

	/*
	 * Encoding according to the Secure Programming Guide
	 * <SAPWIKI>/wiki/display/NWCUIAMSIM/XSS+Secure+Programming+Guide
	 */

	/**
	 * Encode the string for inclusion into a URL parameter.
	 *
	 * Unescaped characters: alphabetic, decimal digits, -_. (dash, underscore, point)
	 *
	 * @example
	 * sap.ui.require(['sap/base/security/encodeURL'], function(encodeURL) {
	 *      var sEncoded = encodeURL('a/b?c=d&e');
	 *      console.log(sEncoded); // a%2fb%3fc%3dd%26e
	 * });
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/security/encodeURL
	 * @param {string} sString The string to be escaped
	 * @returns {string} The encoded string
	 * @SecValidate {0|return|XSS} validates the given string for a URL context
	 * @public
	 */
	var fnEncodeURL = function(sString) {
		return sString.replace(rURL, fnURL);
	};
	return fnEncodeURL;
});