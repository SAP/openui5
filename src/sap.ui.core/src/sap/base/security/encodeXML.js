/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/strings/toHex"], function(toHex) {
	"use strict";


	/* eslint-disable no-control-regex -- special characters are really needed here! */
	/**
	 * RegExp and escape function for HTML escaping
	 */
	var rHtml = /[\x00-\x2b\x2f\x3a-\x40\x5b-\x5e\x60\x7b-\xff\u2028\u2029]/g,
		rHtmlReplace = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/,
		mHtmlLookup = {
			"<": "&lt;",
			">": "&gt;",
			"&": "&amp;",
			"\"": "&quot;"
		};
	/* eslint-enable no-control-regex */

	var fnHtml = function(sChar) {
		var sEncoded = mHtmlLookup[sChar];
		if (!sEncoded) {
			if (rHtmlReplace.test(sChar)) {
				sEncoded = "&#xfffd;";
			} else {
				sEncoded = "&#x" + toHex(sChar.charCodeAt(0)) + ";";
			}
			mHtmlLookup[sChar] = sEncoded;
		}
		return sEncoded;
	};

	/*
	 * Encoding according to the Secure Programming Guide
	 * <SAPWIKI>/wiki/display/NWCUIAMSIM/XSS+Secure+Programming+Guide
	 */

	/**
	 * Encode the string for inclusion into XML content/attribute.
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/security/encodeXML
	 * @param {string} sString The string to be escaped
	 * @returns {string} The encoded string
	 * @SecValidate {0|return|XSS} validates the given string for XML contexts
	 * @public
	 */
	var fnEncodeXML = function(sString) {
		return sString.replace(rHtml, fnHtml);
	};
	return fnEncodeXML;
});