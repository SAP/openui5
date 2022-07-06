/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	], function () {
	"use strict";

	/**
	 * Returns 0-based indexes of the first and last selected characters.
	 *
	 * @param {HTMLElement} oFocusDomRef The inner input element.
	 * @param {boolean} bSkipTextSelection True, if the selection should be skipped for legacy browsers.
	 *
	 * @returns {object | null} The selection range.
	 */
	var selectionRange = function (oFocusDomRef, bSkipTextSelection) {
		if (!oFocusDomRef) {
			return null;
		}

		var iSelectionStart = oFocusDomRef.selectionStart,
			iSelectionEnd = oFocusDomRef.selectionEnd,
			oRange = {start: iSelectionStart, end: iSelectionEnd};

		return oRange;
	};

	return selectionRange;
});