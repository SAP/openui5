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
	 * Functions returns true if the input's text is completely selected
	 *
	 * @param {HTMLElement} oInputDomRef The input field to be checked
	 * @private
	 * @returns {boolean} true if text is selected, otherwise false,
	 */
	var completeTextSelected = function (oInputDomRef) {
		var iValueLength = oInputDomRef && oInputDomRef.value && oInputDomRef.value.length;

		if (!oInputDomRef || !iValueLength || oInputDomRef.selectionStart !== 0 || oInputDomRef.selectionEnd !== iValueLength) {
			return false;
		}

		return true;
	};

	return completeTextSelected;
});