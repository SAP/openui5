sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.TableDnD.Controller", {

		onInit: function () {
			// set explored app's demo model on this sample
			this.oProductsModel = this.initSampleProductsModel();
			this.getView().setModel(this.oProductsModel);
		},

		onExit: function() {
			this.oProductsModel.destroy();
		},

		config: {
			initialRank: 0,
			defaultRank: 1024,
			rankAlgorithm: {
				Before: function(iRank) {
					return iRank + 1024;
				},
				Between: function(iRank1, iRank2) {
					// limited to 53 rows
					return (iRank1 + iRank2) / 2;
				},
				After: function(iRank) {
					return iRank / 2;
				}
			}
		},

		initSampleProductsModel: function() {
			var oData = jQuery.sap.sjax({
				url: jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"),
				dataType: "json"
			}).data;

			// prepare and initialize the rank property
			oData.ProductCollection.forEach(function(oProduct) {
				oProduct.Rank = this.config.initialRank;
			}, this);

			var oModel = new JSONModel();
			oModel.setData(oData);
			return oModel;
		},

		getSelectedItemContext: function(sTableId, fnCallback) {
			var oTable = this.byId(sTableId);
			var aSelectedItems = oTable.getSelectedItems();
			var oSelectedItem = aSelectedItems[0];

			if (!oSelectedItem) {
				MessageToast.show("Please select a row!");
				return;
			}

			var oSelectedContext = oSelectedItem.getBindingContext();
			if (oSelectedContext && fnCallback) {
				var iSelectedIndex = oTable.indexOfItem(oSelectedItem);
				fnCallback.call(this, oSelectedContext, iSelectedIndex, oTable);
			}

			return oSelectedContext;
		},

		onDropTable1: function(oEvent) {
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContext = oDraggedItem.getBindingContext();
			if (!oDraggedItemContext) {
				return;
			}

			// reset the rank property and update the model to refresh the bindings
			this.oProductsModel.setProperty("Rank", this.config.initialRank, oDraggedItemContext);
			this.oProductsModel.refresh(true);
		},

		moveToTable1: function() {
			this.getSelectedItemContext("table2", function(oSelectedItemContext, iSelectedItemIndex, oTable2) {
				// reset the rank property and update the model to refresh the bindings
				this.oProductsModel.setProperty("Rank", this.config.initialRank, oSelectedItemContext);
				this.oProductsModel.refresh(true);

				// select the previously selected position
				var oNextItem = oTable2.getItems()[iSelectedItemIndex];
				if (oNextItem) {
					oNextItem.setSelected(true);
				}
			});
		},

		onDropTable2: function(oEvent) {
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContext = oDraggedItem.getBindingContext();
			if (!oDraggedItemContext) {
				return;
			}

			var oConfig = this.config;
			var iNewRank = oConfig.defaultRank;
			var oDroppedItem = oEvent.getParameter("droppedControl");

			if (oDroppedItem && oDroppedItem instanceof sap.m.ColumnListItem) {
				// get the dropped row data
				var sDropPosition = oEvent.getParameter("dropPosition");
				var oDroppedItemContext = oDroppedItem.getBindingContext();
				var iDroppedItemRank = oDroppedItemContext.getProperty("Rank");
				var oDroppedTable = oDroppedItem.getParent();
				var iDroppedItemIndex = oDroppedTable.indexOfItem(oDroppedItem);

				// find the new index of the dragged row depending on the drop position
				var iNewItemIndex = iDroppedItemIndex + (sDropPosition === "After" ? 1 : -1);
				var oNewItem = oDroppedTable.getItems()[iNewItemIndex];
				if (!oNewItem) {
					// dropped before the first row or after the last row
					iNewRank = oConfig.rankAlgorithm[sDropPosition](iDroppedItemRank);
				} else {
					// dropped between first and the last row
					var oNewItemContext = oNewItem.getBindingContext();
					iNewRank = oConfig.rankAlgorithm.Between(iDroppedItemRank, oNewItemContext.getProperty("Rank"));
				}
			}

			// set the rank property and update the model to refresh the bindings
			this.oProductsModel.setProperty("Rank", iNewRank, oDraggedItemContext);
			this.oProductsModel.refresh(true);
		},

		moveToTable2: function() {
			this.getSelectedItemContext("table1", function(oSelectedItemContext, iSelectedItemIndex, oTable1) {
				var oTable2 = this.byId("table2");
				var oFirstItem = oTable2.getItems()[0];
				var iNewRank = this.config.defaultRank;

				if (oFirstItem) {
					var oFirstItemContext = oFirstItem.getBindingContext();
					iNewRank =  this.config.rankAlgorithm.Before(oFirstItemContext.getProperty("Rank"));
				}

				this.oProductsModel.setProperty("Rank", iNewRank, oSelectedItemContext);
				this.oProductsModel.refresh(true);

				// select the inserted and previously selected item
				oTable2.getItems()[0].setSelected(true);
				var oPrevSelectedItem = oTable1.getItems()[iSelectedItemIndex];
				if (oPrevSelectedItem) {
					oPrevSelectedItem.setSelected(true);
				}
			});
		},

		moveSelectedItem: function(sDirection) {
			this.getSelectedItemContext("table2", function(oSelectedItemContext, iSelectedItemIndex, oTable2) {
				var iSiblingItemIndex = iSelectedItemIndex + (sDirection === "Up" ? -1 : 1);
				var oSiblingItem = oTable2.getItems()[iSiblingItemIndex];
				var oSiblingItemContext = oSiblingItem.getBindingContext();
				if (!oSiblingItemContext) {
					return;
				}

				// swap the selected and the siblings rank
				var iSiblingItemRank = oSiblingItemContext.getProperty("Rank");
				var iSelectedItemRank = oSelectedItemContext.getProperty("Rank");
				this.oProductsModel.setProperty("Rank", iSiblingItemRank, oSelectedItemContext);
				this.oProductsModel.setProperty("Rank", iSelectedItemRank, oSiblingItemContext);
				this.oProductsModel.refresh(true);

				// after move select the sibling
				oTable2.getItems()[iSiblingItemIndex].setSelected(true);
			});
		},

		moveUp: function() {
			this.moveSelectedItem("Up");
		},

		moveDown: function() {
			this.moveSelectedItem("Down");
		}
	});

});
