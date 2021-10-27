/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	/**
	 * Clean the URL to remove ignored characters (\r, \n, \t)
	 *
	 * @param {string} sURL URL to clean
	 * @returns {string} Cleaned URL
	 * @private
	 */
	return function (sURL) {
		return sURL.replace(/\t|\r|\n/g, "");
	};
});
