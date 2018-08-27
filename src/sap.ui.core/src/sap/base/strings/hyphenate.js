/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	var rHyphen = /([A-Z])/g;

	/**
	 * Transforms a camel case string (camelCase) into a hyphen separated string (kebab-case).
	 *
	 * @example
	 * sap.ui.require(["sap/base/strings/hyphenate"], function(hyphenate){
	 *      hyphenate("fooBar"); // "foo-bar"
	 * });
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/strings/hyphenate
	 * @param {string} sString camel case string
	 * @returns {string} The transformed string
	 * @public
	 * @SecPassthrough {0|return}
	 */
	var fnHyphenate = function (sString) {
		return sString.replace( rHyphen, function(sMatch, sChar) {
			return "-" + sChar.toLowerCase();
		});
	};
	return fnHyphenate;

});


