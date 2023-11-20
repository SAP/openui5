/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/m/inputUtils/ListHelpers"
], function (ListHelpers) {
	"use strict";

	/**
	 * Filters the items with the passed filter function.
	 *
	 * @param {sap.m.InputBase} oInput The input with suggestions control
	 * @param {Array} aItems The array of items to be filtered
	 * @param {string} sValue The value, to be used as a filter
	 * @param {boolean} bFilterItems True, if the items should be filtered
	 * @param {boolean} bFilterSecondaryValues True, if the items should be filtered by secondary values also
	 * @param {function} fnFilter The filter function
	 *
	 * @returns {Object} A filtering result object, containing the matching items and list groups
	 */
	var filterItems = function(oInput, aItems, sValue, bFilterItems, bFilterSecondaryValues, fnFilter) {
		var aGroups = [],
			aFilteredItems = [];


		aItems = aItems && ListHelpers.getEnabledItems(aItems);

		aItems.forEach(function (oItem) {
			if (oItem.isA("sap.ui.core.SeparatorItem")) {
				aGroups.push({
					header: oItem,
					visible: false
				});
			} else if (!bFilterItems || fnFilter.call(oInput, sValue, oItem, bFilterSecondaryValues)) {
				if (aGroups.length) {
					aGroups[aGroups.length - 1].visible = true;
				}
				aFilteredItems.push(oItem);
			}
		});

		return {
			items: aFilteredItems,
			groups: aGroups
		};
	};

	return filterItems;
});