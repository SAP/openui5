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
	 * Create hex string and pad to length with zeros.
	 * @example
	 * sap.ui.require(["sap/base/strings/toHex"], function(toHex){
	 *      toHex(10, 2); // "0a"
	 *      toHex(16, 2); // "10"
	 * });
	 *
	 * @function
	 * @since 1.58
	 * @private
	 * @alias module:sap/base/strings/toHex
	 * @param {int} iChar UTF-16 character code
	 * @param {int} [iLength=0] number of padded zeros
	 * @returns {string} padded hex representation of the given character code
	 */
	var fnToHex = function(iChar, iLength) {
		var sHex = iChar.toString(16);
		if (iLength) {
			sHex = sHex.padStart(iLength, '0');
		}
		return sHex;
	};
	return fnToHex;
});