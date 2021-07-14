/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function () {
	"use strict";

	/**
	 * Returns true if some word from the text starts with specific value.
	 *
	 * @param {string} sText The text of the word.
	 * @param {string} sValue The value which must be compared to the word.
	 * @returns {boolean} Indication if the word starts with the passed value.
	 */
	var wordStartsWithValue = function (sText, sValue) {
		var index;

		if (typeof sText !== "string" || typeof sValue !== "string") {
			return false;
		}

		if (sValue === "") {
			return true;
		}

		while (sText) {
			if (sText.toLowerCase().indexOf(sValue.toLowerCase()) === 0 /* startsWith */) {
				return true;
			}

			index = sText.indexOf(' ');
			if (index === -1) {
				break;
			}

			sText = sText.substring(index + 1);
		}

		return false;
	};

	return wordStartsWithValue;
});