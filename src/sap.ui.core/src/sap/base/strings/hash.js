/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Generates a hash-code from a string.
	 *
	 * @example
	 * sap.ui.require(["sap/base/strings/hash"], function(hash) {
	 *      hash(""); // 0
	 *      hash("test"); // 3569518
	 * });
	 *
	 * @function
	 * @since 1.58
	 * @param {string} sString The string to generate the hash-code from
	 * @alias module:sap/base/strings/hash
	 * @return {int} The generated hash-code
	 * @private
	 */
	var fnHash = function(sString) {
		var i = sString.length, iHash = 0;

		while (i--) {
			iHash = (iHash << 5) - iHash + sString.charCodeAt(i);
			iHash = iHash & iHash; // convert to 32 bit
		}

		return iHash;
	};

	return fnHash;
});
