sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/library"
], function (Controller, JSONModel, layoutLibrary) {
	"use strict";

	var CellColorShade = layoutLibrary.BlockLayoutCellColorShade;
	var CellColorSet = layoutLibrary.BlockLayoutCellColorSet;

	return Controller.extend("sap.ui.layout.sample.BlockLayoutCustomBackgroundPerCell.Block", {

		onInit: function () {
			var oView = this.getView(),
				oModel = new JSONModel();

			oView.setModel(oModel);
			this._setModelData(this._modelData);
		},

		_modelData: {
			cell1: {
				colorSet: CellColorSet.ColorSet6,
				colorShade: CellColorShade.ShadeA
			},
			cell2: {
				colorSet: CellColorSet.ColorSet6,
				colorShade: CellColorShade.ShadeB
			},
			cell3: {
				colorSet: CellColorSet.ColorSet6,
				colorShade: CellColorShade.ShadeC
			},
			cell4: {
				colorSet: CellColorSet.ColorSet6,
				colorShade: CellColorShade.ShadeD
			},
			cell5: {
				colorSet: CellColorSet.ColorSet6,
				colorShade: CellColorShade.ShadeE
			},
			cell6: {
				colorSet: CellColorSet.ColorSet6,
				colorShade: CellColorShade.ShadeF
			}
		},

		_setModelData: function (oData) {
			var oModel = this.getView().getModel();
			oModel.setData(oData);
		}
	});
});