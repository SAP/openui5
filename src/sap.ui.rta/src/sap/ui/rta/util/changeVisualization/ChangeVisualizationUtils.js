/*!
 * ${copyright}
 */

sap.ui.define([
], function(
) {
	"use strict";

	var ChangeVisualizationUtils = {};

	/**
	 *
	 * Shortens a string if it is longer than 60 characters in the middle
	 * and only shows the first and last part of it.
	 *
	 * @param {string} sString - Any string
	 * @returns {string} Shortened string
	 * @private
	 */
	ChangeVisualizationUtils.shortenString = function(sString) {
		if (!sString) {
			return null;
		}
		var iStringLength = sString.length;
		if (iStringLength > 60) {
			var sFirstPart = sString.substring(0, 27);
			var sLastPart = sString.substring(iStringLength - 27);
			sString = sFirstPart + "(...)" + sLastPart;
		}
		return sString;
	};

	return ChangeVisualizationUtils;
});