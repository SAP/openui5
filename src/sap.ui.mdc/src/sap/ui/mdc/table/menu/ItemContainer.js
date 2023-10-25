/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/table/columnmenu/ItemContainer",
	"sap/ui/core/Element",
	"sap/ui/mdc/table/menu/Item"
], function(
	ItemContainerBase,
	Element,
	Item
) {
	"use strict";

	const ItemContainer = ItemContainerBase.extend("sap.ui.mdc.table.menu.ItemContainer", {
		metadata: {
			library: "sap.ui.mdc",
			associations: {
				table: {type: "sap.ui.mdc.Table"},
				column: {type: "sap.ui.mdc.table.Column"}
			}
		}
	});

	ItemContainer.prototype.initializeItems = function() {
		const oTable = this.getTable();
		this.destroyItems();

		if (oTable._isP13nButtonHidden()) {
			return Promise.resolve();
		}

		if (oTable.isSortingEnabled()) {
			this.addItem(new Item({key: "Sort", icon: "sap-icon://sort"}));
		}

		if (oTable.isFilteringEnabled()) {
			this.addItem(new Item({key: "Filter", icon: "sap-icon://filter"}));
		}

		if (oTable.isGroupingEnabled()) {
			this.addItem(new Item({key: "Group", icon: "sap-icon://group-2"}));
		}

		if (oTable.getActiveP13nModes().includes("Column")) {
			this.addItem(new Item({key: "Column", icon: "sap-icon://table-column"}));
		}

		return Promise.all(this.getItems().map(function(oItem) {
			return oItem.initializeContent();
		}));
	};

	ItemContainer.prototype.hasItems = function() {
		return this.getEffectiveItems().length > 0;
	};

	ItemContainer.prototype.getTable = function() {
		return Element.getElementById(this.getAssociation("table"));
	};

	return ItemContainer;
});