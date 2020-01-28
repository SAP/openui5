sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/ui/core/dnd/DragInfo',
	'sap/ui/core/dnd/DropInfo',
	'sap/f/dnd/GridDropInfo',
	'sap/f/sample/GridContainerDragAndDropFromList/RevealGrid/RevealGrid'
], function (Controller, JSONModel, DragInfo, DropInfo, GridDropInfo, RevealGrid) {
	"use strict";

	return Controller.extend("sap.f.sample.GridContainerDragAndDropFromList.C", {

		onInit: function () {
			this.initData();
			this.attachDragAndDrop();
		},

		onRevealGrid: function () {
			RevealGrid.toggle("grid1", this.getView());
		},

		onExit: function () {
			RevealGrid.destroy("grid1", this.getView());
		},

		attachDragAndDrop: function () {
			var oGrid = this.byId("grid1"),
				oList = this.byId("list1");

			oList.addDragDropConfig(new DragInfo({
				sourceAggregation: "items"
			}));
			oList.addDragDropConfig(new DropInfo({
				targetAggregation: "items",
				dropPosition: "Between",
				dropLayout: "Vertical",
				drop: this.onDrop.bind(this)
			}));

			oGrid.addDragDropConfig(new DragInfo({
				sourceAggregation: "items"
			}));
			oGrid.addDragDropConfig(new GridDropInfo({
				targetAggregation: "items",
				dropPosition: "Between",
				dropLayout: "Horizontal",
				dropIndicatorSize: this.onDropIndicatorSize.bind(this),
				drop: this.onDrop.bind(this)
			}));
		},

		onDropIndicatorSize: function (oDraggedControl) {
			var oBindingContext = oDraggedControl.getBindingContext(),
				oData = oBindingContext.getModel().getProperty(oBindingContext.getPath());

			if (oDraggedControl.isA("sap.m.StandardListItem")) {
				return {
					rows: oData.rows,
					columns: oData.columns
				};
			}
		},

		onDrop: function (oInfo) {
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),

				oDraggedParent = oDragged.getParent(),
				oDroppedParent = oDropped.getParent(),

				oDragModel = oDraggedParent.getModel(),
				oDropModel = oDroppedParent.getModel(),
				oDragModelData = oDragModel.getData(),
				oDropModelData = oDropModel.getData(),

				iDragPosition = oDraggedParent.indexOfItem(oDragged),
				iDropPosition = oDroppedParent.indexOfItem(oDropped);

			// remove the item
			var oItem = oDragModelData[iDragPosition];
			oDragModelData.splice(iDragPosition, 1);

			if (oDragModel === oDropModel && iDragPosition < iDropPosition) {
				iDropPosition--;
			}

			// insert the control in target aggregation
			if (sInsertPosition === "Before") {
				oDropModelData.splice(iDropPosition, 0, oItem);
			} else {
				oDropModelData.splice(iDropPosition + 1, 0, oItem);
			}

			if (oDragModel !== oDropModel) {
				oDragModel.setData(oDragModelData);
				oDropModel.setData(oDropModelData);
			} else {
				oDropModel.setData(oDropModelData);
			}
		},

		initData: function () {
			this.byId("list1").setModel(new JSONModel([
				{ title: "Open SAP Homepage 2x2", rows: 2, columns: 2 },
				{ title: "Your personal information 3x3", rows: 3, columns: 3 },
				{ title: "Appointments management 2x4", rows: 2, columns: 4 }
			]));

			this.byId("grid1").setModel(new JSONModel([
				{ title: "Sales Fulfillment Application Title 4x2", rows: 4, columns: 2 },
				{ title: "Manage Activity Master Data Type 2x3", rows: 2, columns: 3 },
				{ title: "Success Map 2x2", rows: 2, columns: 2 }
			]));
		}
	});
});