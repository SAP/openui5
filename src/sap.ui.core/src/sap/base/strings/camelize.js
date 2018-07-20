/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	var rCamelCase = /-(.)/ig;

	/**
	 * Transforms a hyphen separated string to a camel case string.
	 *
	 * @example
	 * sap.ui.require(["sap/base/strings/camelize"], function(camelize){
	 *      camelize("foo-bar"); // "fooBar"
	 * });
	 *
	 * @function
	 * @since 1.58
	 * @alias module:sap/base/strings/camelize
	 * @param {string} sString Hyphen separated string
	 * @returns {string} The transformed string
	 * @public
	 * @SecPassthrough {0|return}
	 */
	var fnCamelize = function (sString) {
		return sString.replace( rCamelCase, function( sMatch, sChar ) {
			return sChar.toUpperCase();
		});
	};
	return fnCamelize;

});
