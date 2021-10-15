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
	"sap/m/StandardListItem",
	"sap/ui/base/ManagedObject"],
	function (
		library,
		deepEqual,
		GroupHeaderListItem,
		StandardListItem,
		ManagedObject) {
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

		if (!Array.isArray(aItems) || !oDataObject) {
			return null;
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
			return [];
		}

		return aItems.filter(function (oItem) {
			return oItem.getEnabled && oItem.getEnabled();
		});
	};

	/**
	 * Gets the selectable items from the aggregation named <code>items</code>.
	 *
	 * @param {sap.ui.core.Item[]} aItems Items to filter
	 * @returns {sap.ui.core.Item[]} An array containing the selectables items.
	 */
	ListHelpers.getSelectableItems = function(aItems) {
		if (!Array.isArray(aItems)) {
			return [];
		}

		return this.getAllSelectableItems(this.getVisibleItems(aItems));
	};

	/**
	 * Gets the selectable items from the aggregation named <code>items</code>, including not visible ones.
	 *
	 * @param {sap.ui.core.Item[]} aItems Items to filter
	 * @returns {sap.ui.core.Item[]} An array containing the selectables items.
	 */
	ListHelpers.getAllSelectableItems = function(aItems) {
		if (!Array.isArray(aItems)) {
			return [];
		}

		return this.getEnabledItems(aItems).filter(function(oListItem){
			return !oListItem.isA("sap.ui.core.SeparatorItem");
		});
	};

	/*
	* Gets the visible items from the aggregation named <code>items</code>.
	*
	* @return {sap.ui.core.Item[]}
	* @protected
	*/
	ListHelpers.getVisibleItems = function(aItems) {
		var oListItem;

		if (!Array.isArray(aItems)) {
			return [];
		}

		return aItems.filter(function(oItem) {
			oListItem = ListHelpers.getListItem(oItem);

			return oListItem && oListItem.getVisible();
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

		var sTextDirection = oItem.getTextDirection();

		if (oItem.isA("sap.ui.core.SeparatorItem")) {
			oListItem = new GroupHeaderListItem({
				// GroupHeaderListItem does not escape the title so we need to do it once more.
				// The first time this value was escaped is when the Separator item was created.
				title: ManagedObject.escapeSettingsValue(oItem.getText()),
				type: ListType.Inactive,
				titleTextDirection: sTextDirection
			});
		} else if (oItem.isA("sap.ui.core.Item")) {
			oListItem = new StandardListItem({
				type: ListType.Active,
				visible: oItem.getEnabled(),
				titleTextDirection: sTextDirection,
				infoTextDirection: sTextDirection
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
			oListItem.addCustomData(oCustomData.clone(null, null, {cloneBindings: false}));
		});

		return oListItem;
	};

	/**
	 * Fills an item Container (sap.m.List or sap.m.Table) with items mapped by the <code>fnMapItem</code>.
	 *
	 * @param aItems Array of sap.ui.core.Item to be mapped
	 * @param oItemsContainer A container to be filled with items (List or Table)
	 * @param fnMapItem Mapping function for core items to listItems
	 */
	ListHelpers.fillList = function (aItems, oItemsContainer, fnMapItem) {
		if (!oItemsContainer || !Array.isArray(aItems)) {
			return;
		}

		if (oItemsContainer.isA("sap.m.Table")) {
			oItemsContainer.removeSelections(true);
		} else {
			oItemsContainer.destroyItems();
		}

		// map the items to list items and add them to the list
		aItems.forEach(function (oItem) {
			oItemsContainer.addItem(fnMapItem(oItem));
		});
	};

	return ListHelpers;
});