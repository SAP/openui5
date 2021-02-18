/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	'sap/ui/Device'
	], function (Device) {
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
			sValue = oFocusDomRef.value,
			oRange = {start: iSelectionStart, end: iSelectionEnd};

		// This fixes an issue in IE & Edge, related to the selection,
		// when the last focused item is a group header.
		if ((Device.browser.msie || Device.browser.edge) && bSkipTextSelection) {
			oRange.start = sValue.length;
			oRange.end = sValue.length;
		}

		return oRange;
	};

	return selectionRange;
});