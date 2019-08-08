sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.sample.GridListDragAndDrop.C", {
		onInit: function () {
			var sDataUrl = sap.ui.require.toUrl("sap/f/sample/GridListDragAndDrop/data.json");
			this.model = new JSONModel(sDataUrl);
			this.getView().setModel(this.model);
		},
		onDrop: function (oInfo) {
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),
				oGrid = oDragged.getParent(),
				oData = this.model.getData(),
				iDragPosition = oGrid.indexOfItem(oDragged),
				iDropPosition = oGrid.indexOfItem(oDropped);

			// remove the item
			var oItem = oData[iDragPosition];
			oData.splice(iDragPosition, 1);

			if (iDragPosition < iDropPosition) {
				iDropPosition--;
			}

			// insert the control in target aggregation
			if (sInsertPosition === "Before") {
				oData.splice(iDropPosition, 0, oItem);
			} else {
				oData.splice(iDropPosition + 1, 0, oItem);
			}

			this.model.setData(oData);
		}
	});

});

