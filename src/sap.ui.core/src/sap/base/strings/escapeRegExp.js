/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	var rEscapeRegExp = /[[\]{}()*+?.\\^$|]/g;

	/**
	 * Escapes all characters that would have a special meaning in a regular expression.
	 *
	 * This method can be used when a string with arbitrary content has to be integrated
	 * into a regular expression and when the whole string should match literally.
	 *
	 * @example
	 * sap.ui.require(["sap/base/strings/escapeRegExp"], function(escapeRegExp) {
	 *
	 *    var text = "E=m*c^2"; // text to search
	 *    var search = "m*c";   // text to search for
	 *
	 *    text.match( new RegExp(              search  ) ); // [ "c" ]
	 *    text.match( new RegExp( escapeRegExp(search) ) ); // [ "m*c" ]
	 *
	 * });
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/strings/escapeRegExp
	 * @param {string} sString String to escape
	 * @returns {string} The escaped string
	 * @public
	 * @SecPassthrough {0|return}
	 */
	var fnEscapeRegExp = function (sString) {
		return sString.replace(rEscapeRegExp, "\\$&");
	};
	return fnEscapeRegExp;

});


