sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/ToolbarSpacer",
	"sap/ui/table/Row",
	"sap/ui/thirdparty/jquery"
], function(Controller, JSONModel, MessageToast, ToolbarSpacer, TableRow, jQuery) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.DnD.Controller", {

		onInit: function() {
			const oView = this.getView();

			// set explored app's demo model on this sample
			this.oProductsModel = this.initSampleProductsModel();
			oView.setModel(this.oProductsModel);

			sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
				const oTb = oView.byId("infobar");
				oTb.addContent(new ToolbarSpacer());
				oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/DnD"));
			}, function(oError) { /*ignore*/ });
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
			let oData;
			jQuery.ajax({
				async: false,
				url: sap.ui.require.toUrl("sap/ui/demo/mock/products.json"),
				dataType: "json",
				success: function(oResponse) {
					oData = oResponse;
				}
			});

			// prepare and initialize the rank property
			oData.ProductCollection.forEach(function(oProduct) {
				oProduct.Rank = this.config.initialRank;
			}, this);

			const oModel = new JSONModel();
			oModel.setData(oData);
			return oModel;
		},

		getSelectedRowContext: function(sTableId, fnCallback) {
			const oTable = this.byId(sTableId);
			const iSelectedIndex = oTable.getSelectedIndex();

			if (iSelectedIndex === -1) {
				MessageToast.show("Please select a row!");
				return;
			}

			const oSelectedContext = oTable.getContextByIndex(iSelectedIndex);
			if (oSelectedContext && fnCallback) {
				fnCallback.call(this, oSelectedContext, iSelectedIndex, oTable);
			}

			return oSelectedContext;
		},

		onDragStart: function(oEvent) {
			const oDraggedRow = oEvent.getParameter("target");
			const oDragSession = oEvent.getParameter("dragSession");

			// keep the dragged row context for the drop action
			oDragSession.setComplexData("draggedRowContext", oDraggedRow.getBindingContext());
		},

		onDropTable1: function(oEvent) {
			const oDragSession = oEvent.getParameter("dragSession");
			const oDraggedRowContext = oDragSession.getComplexData("draggedRowContext");
			if (!oDraggedRowContext) {
				return;
			}

			// reset the rank property and update the model to refresh the bindings
			this.oProductsModel.setProperty("Rank", this.config.initialRank, oDraggedRowContext);
			this.oProductsModel.refresh(true);
		},

		moveToTable1: function() {
			this.getSelectedRowContext("table2", function(oSelectedRowContext, iSelectedRowIndex, oTable2) {
				// reset the rank property and update the model to refresh the bindings
				this.oProductsModel.setProperty("Rank", this.config.initialRank, oSelectedRowContext);
				this.oProductsModel.refresh(true);

				// select the previous row when there is no row to select
				const oNextContext = oTable2.getContextByIndex(iSelectedRowIndex + 1);
				if (!oNextContext) {
					oTable2.setSelectedIndex(iSelectedRowIndex - 1);
				}
			});
		},

		onDropTable2: function(oEvent) {
			const oDragSession = oEvent.getParameter("dragSession");
			const oDraggedRowContext = oDragSession.getComplexData("draggedRowContext");
			if (!oDraggedRowContext) {
				return;
			}

			const oConfig = this.config;
			let iNewRank = oConfig.defaultRank;
			const oDroppedRow = oEvent.getParameter("droppedControl");

			if (oDroppedRow && oDroppedRow instanceof TableRow) {
				// get the dropped row data
				const sDropPosition = oEvent.getParameter("dropPosition");
				const oDroppedRowContext = oDroppedRow.getBindingContext();
				const iDroppedRowRank = oDroppedRowContext.getProperty("Rank");
				const iDroppedRowIndex = oDroppedRow.getIndex();
				const oDroppedTable = oDroppedRow.getParent();

				// find the new index of the dragged row depending on the drop position
				const iNewRowIndex = iDroppedRowIndex + (sDropPosition === "After" ? 1 : -1);
				const oNewRowContext = oDroppedTable.getContextByIndex(iNewRowIndex);
				if (!oNewRowContext) {
					// dropped before the first row or after the last row
					iNewRank = oConfig.rankAlgorithm[sDropPosition](iDroppedRowRank);
				} else {
					// dropped between first and the last row
					iNewRank = oConfig.rankAlgorithm.Between(iDroppedRowRank, oNewRowContext.getProperty("Rank"));
				}
			}

			// set the rank property and update the model to refresh the bindings
			this.oProductsModel.setProperty("Rank", iNewRank, oDraggedRowContext);
			this.oProductsModel.refresh(true);
		},

		moveToTable2: function() {
			this.getSelectedRowContext("table1", function(oSelectedRowContext) {
				const oTable2 = this.byId("table2");
				const oFirstRowContext = oTable2.getContextByIndex(0);

				// insert always as a first row
				let iNewRank = this.config.defaultRank;
				if (oFirstRowContext) {
					iNewRank = this.config.rankAlgorithm.Before(oFirstRowContext.getProperty("Rank"));
				}

				this.oProductsModel.setProperty("Rank", iNewRank, oSelectedRowContext);
				this.oProductsModel.refresh(true);

				// select the inserted row
				oTable2.setSelectedIndex(0);
			});
		},

		moveSelectedRow: function(sDirection) {
			this.getSelectedRowContext("table2", function(oSelectedRowContext, iSelectedRowIndex, oTable2) {
				const iSiblingRowIndex = iSelectedRowIndex + (sDirection === "Up" ? -1 : 1);
				const oSiblingRowContext = oTable2.getContextByIndex(iSiblingRowIndex);
				if (!oSiblingRowContext) {
					return;
				}

				// swap the selected and the siblings rank
				const iSiblingRowRank = oSiblingRowContext.getProperty("Rank");
				const iSelectedRowRank = oSelectedRowContext.getProperty("Rank");
				this.oProductsModel.setProperty("Rank", iSiblingRowRank, oSelectedRowContext);
				this.oProductsModel.setProperty("Rank", iSelectedRowRank, oSiblingRowContext);
				this.oProductsModel.refresh(true);

				// after move select the sibling
				oTable2.setSelectedIndex(iSiblingRowIndex);
			});
		},

		moveUp: function() {
			this.moveSelectedRow("Up");
		},

		moveDown: function() {
			this.moveSelectedRow("Down");
		}
	});

});