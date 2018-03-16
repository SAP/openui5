/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	var rCamelCase = /-(.)/ig;

	/**
	 * Transforms a hyphen separated string to a camel case string.
	 *
	 * @function
	 * @exports sap/base/strings/camelCase
	 * @param {string} sString Hyphen separated string
	 * @returns {string} The transformed string
	 * @private
	 * @SecPassthrough {0|return}
	 * @example "foo-bar" -> "fooBar"
	 */
	var fnCamelCase = function (sString) {
		return sString.replace( rCamelCase, function( sMatch, sChar ) {
			return sChar.toUpperCase();
		});
	};
	return fnCamelCase;

});
