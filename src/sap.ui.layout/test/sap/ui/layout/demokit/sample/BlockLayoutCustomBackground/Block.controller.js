sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Controller, JSONModel) {
	"use strict";

	var BlockController = Controller.extend("sap.ui.layout.sample.BlockLayoutCustomBackground.Block", {
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
				sap.ui.layout.BlockLayoutCellColorShade.ShadeA,
				sap.ui.layout.BlockLayoutCellColorShade.ShadeB,
				sap.ui.layout.BlockLayoutCellColorShade.ShadeC,
				sap.ui.layout.BlockLayoutCellColorShade.ShadeD
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
				this._fillModel({selectEnabled: false});
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

	return BlockController;

});
