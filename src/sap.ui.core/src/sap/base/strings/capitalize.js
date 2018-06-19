/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Converts first character of the string to upper case.
	 *
	 * @function
	 * @exports sap/base/strings/capitalize
	 * @private
	 * @param {string} sString String for which first character should be converted
	 * @returns {string} String input with first character uppercase
	 * @SecPassthrough {0|return}
	 * @example capitalize("foobar") -> "Foobar"
	 */
	var fnCapitalize = function (sString) {
		return sString.charAt(0).toUpperCase() + sString.substring(1);
	};
	return fnCapitalize;

});


