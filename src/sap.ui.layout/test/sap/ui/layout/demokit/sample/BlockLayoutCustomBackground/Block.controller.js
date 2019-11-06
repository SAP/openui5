sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/library"
], function (Controller, JSONModel, layoutLibrary) {
	"use strict";

	var CellColorShade = layoutLibrary.BlockLayoutCellColorShade;

	return Controller.extend("sap.ui.layout.sample.BlockLayoutCustomBackground.Block", {

		onInit: function () {
			var oView = this.getView(),
				oModel = new JSONModel();

			oView.setModel(oModel);
			this._fillModel(this._modelData);
		},

		_modelData: {
			selectEnabled: true,
			colorSet: "ColorSet5",
			shades: [
				CellColorShade.ShadeA,
				CellColorShade.ShadeB,
				CellColorShade.ShadeC,
				CellColorShade.ShadeD,
				CellColorShade.ShadeE,
				CellColorShade.ShadeF

			],
			contrastCells: []
		},

		_fillModel: function (oData) {
			var oModel = this.getView().getModel();
			oModel.setData(oData);
		},

		handleChecked: function (oEvent) {
			var bChecked = oEvent.getParameter("selected");

			if (bChecked) {
				this._fillModel(this._modelData);
			} else {
				this._modelData = this.getView().getModel().getData();
				this._fillModel({ selectEnabled: false });
			}
		},

		handleContrastCellSelection: function (oEvent) {
			var oView = this.getView(),
				oItem = oEvent.getParameter("changedItem"),
				bSelected = oEvent.getParameter("selected"),
				oBLCell = oView.byId(oItem.getKey());

			if (!oBLCell) {
				return;
			}

			if (bSelected) {
				oBLCell.addStyleClass("sapContrast").addStyleClass("sapContrastPlus");
			} else {
				oBLCell.removeStyleClass("sapContrast").removeStyleClass("sapContrastPlus");
			}
		}

	});
});