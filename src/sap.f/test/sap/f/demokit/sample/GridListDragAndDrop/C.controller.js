sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListDragAndDrop.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/sample/GridListDragAndDrop/model/data.json"));
			this.getView().setModel(oModel);
		},

		onDrop: function (oInfo) {
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),
				oGrid = oDragged.getParent(),
				oModel = this.getView().getModel(),
				aItems = oModel.getProperty("/items"),
				iDragPosition = oGrid.indexOfItem(oDragged),
				iDropPosition = oGrid.indexOfItem(oDropped);

			// remove the item
			var oItem = aItems[iDragPosition];
			aItems.splice(iDragPosition, 1);

			if (iDragPosition < iDropPosition) {
				iDropPosition--;
			}

			// insert the control in target aggregation
			if (sInsertPosition === "Before") {
				aItems.splice(iDropPosition, 0, oItem);
			} else {
				aItems.splice(iDropPosition + 1, 0, oItem);
			}

			oModel.setProperty("/items", aItems);
		}

	});
});