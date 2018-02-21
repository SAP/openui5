sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./Utils"
], function(Controller, Utils) {
	"use strict";

	return Controller.extend("sap.m.sample.TableDnD.AvailableProducts", {

		onDropAvailableProductsTable: function(oEvent) {
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContext = oDraggedItem.getBindingContext();
			if (!oDraggedItemContext) {
				return;
			}

			// reset the rank property and update the model to refresh the bindings
			var oAvailableProductsTable = Utils.getAvailableProductsTable(this);
			var oProductsModel = oAvailableProductsTable.getModel();
			oProductsModel.setProperty("Rank", Utils.ranking.Initial, oDraggedItemContext);
			oProductsModel.refresh(true);
		},

		moveToSelectedProductsTable: function() {
			var oAvailableProductsTable = Utils.getAvailableProductsTable(this);
			Utils.getSelectedItemContext(oAvailableProductsTable, function(oAvailableItemContext, iAvailableItemIndex) {
				var oSelectedProductsTable = Utils.getSelectedProductsTable(this);
				var oFirstItemOfSelectedProductsTable = oSelectedProductsTable.getItems()[0];
				var iNewRank = Utils.ranking.Default;

				if (oFirstItemOfSelectedProductsTable) {
					var oFirstContextOfSelectedProductsTable = oFirstItemOfSelectedProductsTable.getBindingContext();
					iNewRank =  Utils.ranking.Before(oFirstContextOfSelectedProductsTable.getProperty("Rank"));
				}

				var oProductsModel = oAvailableProductsTable.getModel();
				oProductsModel.setProperty("Rank", iNewRank, oAvailableItemContext);
				oProductsModel.refresh(true);

				// select the inserted and previously selected item
				oSelectedProductsTable.getItems()[0].setSelected(true);
				var oPrevSelectedItem = oAvailableProductsTable.getItems()[iAvailableItemIndex];
				if (oPrevSelectedItem) {
					oPrevSelectedItem.setSelected(true);
				}
			}.bind(this));
		},

		onBeforeOpenContextMenu: function(oEvent) {
			oEvent.getParameter("listItem").setSelected(true);
		}
	});

});
