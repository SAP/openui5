/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/m/inputUtils/selectionRange"
	], function (selectionRange) {
	"use strict";

	/**
	 * Checks whether the text of an item starts with the user input.
	 *
	 * @param {string} sItemText The item text property.
	 * @param {string} sTypedValue The user input.
	 * @returns {boolean} Whether the item starts with the given input.
	 */
	var itemsTextStartsWithTypedValue = function (sItemText, sTypedValue) {
		if (typeof sItemText != "string" || sItemText === "" || typeof sTypedValue != "string" || sTypedValue === "") {
			return false;
		}
		return sItemText.toLowerCase().startsWith(sTypedValue.toLowerCase());
	};

	/**
	 * Calculates the correct start of a text selection.
	 *
	 * @param {object} oSelectionRange Start and end range.
	 * @param {string} sItemText The item text property.
	 * @param {string} sTypedValue The user input.
	 * @param {boolean} bSkipTextSelection True, if the selection should be skipped.
	 *
	 * @returns {int} The correct start position of a selection.
	 */
	var calculateSelectionStart = function (oSelectionRange, sItemText, sTypedValue, bSkipTextSelection) {
		var bIsTextSelected = oSelectionRange && oSelectionRange.start !== oSelectionRange.end,
			bItemsTextStartsWithTypedValue = itemsTextStartsWithTypedValue(sItemText, sTypedValue),
			bShoulResetSelectionStart = !(bItemsTextStartsWithTypedValue && (bIsTextSelected || bSkipTextSelection));

		return bShoulResetSelectionStart ? 0 : oSelectionRange.start;
	};

	return calculateSelectionStart;
});