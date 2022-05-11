/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/table/columnmenu/ItemBase"
], function(
	ItemBase
) {
	"use strict";

	var ItemContainer = ItemBase.extend("sap.m.table.columnmenu.ItemContainer", {
		metadata: {
			library: "sap.m",
			aggregations: {
				items: {type: "sap.m.table.columnmenu.ItemBase"}
			}
		}
	});

	ItemContainer.prototype.getEffectiveItems = function() {
		return !this.getVisible() ? [] : this.getItems().reduce(function(aItems, oItem) {
			return aItems.concat(oItem.getEffectiveItems());
		}, []);
	};

	return ItemContainer;
});