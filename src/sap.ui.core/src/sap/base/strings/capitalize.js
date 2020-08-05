/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Converts first character of the string to upper case.
	 *
	 * @example
	 * sap.ui.require(["sap/base/strings/capitalize"], function(capitalize){
	 *      capitalize("foobar"); // "Foobar"
	 * });
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/strings/capitalize
	 * @public
	 * @param {string} sString String for which first character should be converted
	 * @returns {string} String input with first character uppercase
	 * @SecPassthrough {0|return}
	 */
	var fnCapitalize = function (sString) {
		return sString.charAt(0).toUpperCase() + sString.substring(1);
	};
	return fnCapitalize;

});


