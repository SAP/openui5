/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	var Utils = { };

	/**
	 * Check if given string is a JSON.
	 * @param {string} sText The text to be tested.
	 * @returns {boolean} Whether the string is in a JSON format or not.
	 */
	Utils.isJson = function (sText) {
		if (typeof sText !== "string") {
			return false;
		}
		try {
			JSON.parse(sText);
			return true;
		} catch (error) {
			return false;
		}
	};

	return Utils;
});