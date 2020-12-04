/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/m/inputUtils/ListHelpers"], function (ListHelpers) {
	"use strict";

	/**
	 * Updates the visible property of each list item, depending on the filtering result.
	 *
	 * @param aItems {sap.ui.core.Item[]} All items from the list.
	 * @param oFilterResults {Object} The visible items & groups.
	 */
	return function (aItems, oFilterResults) {
		var aFilteredItems, aGroups, oListItem;

		if (!Array.isArray(aItems) || !aItems.length) {
			return;
		}

		oFilterResults = oFilterResults || {};
		aFilteredItems = oFilterResults.items || [];
		aGroups = oFilterResults.groups || [];

		// toggle visibility of list items, depending if the item is present in the filtered items
		aItems.forEach(function (oItem) {
			oListItem = ListHelpers.getListItem(oItem);

			if (!oItem.isA("sap.ui.core.SeparatorItem") && oListItem) {
				oListItem.setVisible(aFilteredItems.indexOf(oItem) !== -1);
			}
		});

		// toggle group headers visibility
		aGroups.forEach(function (oGroupItem) {
			oListItem = ListHelpers.getListItem(oGroupItem.header);
			oListItem && oListItem.setVisible(oGroupItem.visible);
		});
	};
});