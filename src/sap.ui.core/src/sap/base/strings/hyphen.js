/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	var rHyphen = /([A-Z])/g;

	/**
	 * Transforms a camel case string (camelCase) into a hyphen separated string (kebab-case).
	 *
	 * @function
	 * @exports sap/base/strings/hyphen
	 * @param {string} sString camel case string
	 * @returns {string} The transformed string
	 * @private
	 * @SecPassthrough {0|return}
	 * @example "fooBar" -> "foo-bar"
	 */
	var fnHyphen = function (sString) {
		return sString.replace( rHyphen, function(sMatch, sChar) {
			return "-" + sChar.toLowerCase();
		});
	};
	return fnHyphen;

});


