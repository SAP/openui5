/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/m/inputUtils/wordStartsWithValue"
], function (wordStartsWithValue) {
	"use strict";

	/**
	 * The default filter function for one and two-value. It checks whether the item text begins with the typed value.
	 *
	 * @param {string} sValue the current filter string.
	 * @param {sap.ui.core.Item} oItem the filtered list item.
	 * @returns {boolean} true for items that start with the parameter sValue, false for non matching items.
	 */
	var defaultFilterFn = function (sValue, oItem) {
		if (oItem.isA("sap.ui.core.ListItem") && wordStartsWithValue(oItem.getAdditionalText(), sValue)) {
			return true;
		}

		return wordStartsWithValue(oItem.getText(), sValue);
	};

	return defaultFilterFn;
});