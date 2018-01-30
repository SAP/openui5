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

	var fHtml = function(sChar) {
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

	/**
	 * Encode the string for inclusion into XML content/attribute.
	 *
	 * @function
	 * @private
	 * @exports sap/base/encoding/encodeXML
	 * @param {string} sString The string to be escaped
	 * @returns {string} The encoded string
	 * @SecValidate {0|return|XSS} validates the given string for XML contexts
	 */
	var fnEncodeXML = function(sString) {
		return sString.replace(rHtml, fHtml);
	};
	return fnEncodeXML;
});