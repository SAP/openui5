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
	 * Generates a hash-code from a string.
	 *
	 * @function
	 * @param {string} sString The string to generate the hash-code from
	 * @exports sap/base/util/hashCode
	 * @return {int} The generated hash-code
	 * @private
	 */
	var fnHashCode = function(sString) {
		var i = sString.length, iHash = 0;

		while (i--) {
			iHash = (iHash << 5) - iHash + sString.charCodeAt(i);
			iHash = iHash & iHash; // convert to 32 bit
		}

		return iHash;
	};

	return fnHashCode;
});
