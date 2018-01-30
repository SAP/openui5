/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";
	/*
	 * Encoding according to the Secure Programming Guide
	 * <SAPWIKI>/wiki/display/NWCUIAMSIM/XSS+Secure+Programming+Guide
	 */

	/**
	 * Create hex and pad to length with zeros.
	 *
	 * @function
	 * @private
	 * @exports sap/base/encoding/toHex
	 * @param {Number} iChar UTF-16 character code
	 * @param {Number} [iLength=0] number of padded zeros
	 * @returns {string} padded hex representation of the given character code
	 */
	var fnToHex = function(iChar, iLength) {
		var sHex = iChar.toString(16);
		if (iLength) {
			while (iLength > sHex.length) {
				sHex = "0" + sHex;
			}
		}
		return sHex;
	};
	return fnToHex;
});