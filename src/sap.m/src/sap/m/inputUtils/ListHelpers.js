/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/m/library",
	"sap/base/util/deepEqual",
	"sap/m/GroupHeaderListItem",
	"sap/m/StandardListItem"],
	function (library, deepEqual, GroupHeaderListItem, StandardListItem) {
	"use strict";

	var ListType = library.ListType;

	/**
	 * A helper module containing general methods for list handling in input with suggestions.
	 */
	var ListHelpers = {};

	/**
	 * Style class used to map items to the corresponding list items/tokens.
	 */
	ListHelpers.CSS_CLASS = "InputWithSuggestions";

	/**
	 * Gets the item corresponding to a given list item.
	 *
	 * @param {Array} aItems Array of available items
	 * @param {sap.m.StandardListItem | sap.m.GroupHeaderListItem | null} oListItem The given list item
	 * @return {sap.ui.core.Item} The corresponding item
	 */
	ListHelpers.getItemByListItem = function (aItems, oListItem) {
		return this.getItemBy(aItems, oListItem, "ListItem");
	};

	/**
	 * Gets the list item corresponding to a given item.
	 *
	 * @param {sap.ui.core.Item} oItem The item
	 * @returns {sap.m.StandardListItem | sap.m.GroupHeaderListItem | null} The ListItem
	 */
	ListHelpers.getListItem = function (oItem) {
		return oItem && oItem.data ? oItem.data(ListHelpers.CSS_CLASS + "ListItem") : null;
	};

	/**
	 * Gets the item corresponding to a given data object.
	 *
	 * @param {Array} aItems Array of available items
	 * @param {Object | null} oDataObject The given object
	 * @param {string} sDataName The data name
	 * @return {sap.ui.core.Item} The corresponding item
	 */
	ListHelpers.getItemBy = function (aItems, oDataObject, sDataName) {
		var oItem;

		sDataName = ListHelpers.CSS_CLASS + sDataName;

		if (!Array.isArray(aItems)) {
			return;
		}

		for (var i = 0; i < aItems.length; i++) {
			oItem = aItems[i].data && aItems[i].data(sDataName);
			if (oItem === oDataObject || deepEqual(oItem, oDataObject)) {
				return aItems[i];
			}
		}

		return null;
	};

	/**
	 * Gets the enabled items from the array of items.
	 *
	 * @param {sap.ui.core.Item[]} aItems Items to filter
	 * @returns {sap.ui.core.Item[]} An array containing the enabled items
	 */
	ListHelpers.getEnabledItems = function (aItems) {
		if (!Array.isArray(aItems)) {
			return;
		}

		return aItems.filter(function (oItem) {
			return oItem.getEnabled && oItem.getEnabled();
		});
	};

	/**
	 * Creates ListItem from core.Item.
	 *
	 * @param oItem
	 * @param bShowSecondaryValues
	 * @returns {StandardListItem|GroupHeaderListItem|null}
	 */
	ListHelpers.createListItemFromCoreItem = function (oItem, bShowSecondaryValues) {
		var oListItem;

		if (!oItem) {
			return null;
		}

		if (oItem.isA("sap.ui.core.SeparatorItem")) {
			oListItem = new GroupHeaderListItem({
				title: oItem.getText(),
				type: ListType.Inactive
			});
		} else if (oItem.isA("sap.ui.core.Item")) {
			oListItem = new StandardListItem({
				type: ListType.Active,
				visible: oItem.getEnabled()
			});

			// Constructor does not escape properly curly braces and binding. We need to use the setters instead.
			oListItem.setTitle(oItem.getText());
			oListItem.setInfo((oItem.getAdditionalText && bShowSecondaryValues) ? oItem.getAdditionalText() : "");
			oListItem.setTooltip(oItem.getTooltip());
		} else {
			return null;
		}

		oItem.data(ListHelpers.CSS_CLASS + "ListItem", oListItem);
		oItem.getCustomData().forEach(function (oCustomData) {
			oListItem.addCustomData(oCustomData.clone());
		});

		return oListItem;
	};

	return ListHelpers;
});