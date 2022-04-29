sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/library"
], function (Controller, JSONModel, layoutLibrary) {
	"use strict";

	var CellColorSet = layoutLibrary.BlockLayoutCellColorSet;

	return Controller.extend("sap.ui.layout.sample.BlockLayoutCustomBackground.Block", {

		onInit: function () {
			var oView = this.getView(),
				oModel = new JSONModel();

			oView.setModel(oModel);
			this._setModelData(this._modelData);
		},

		_modelData: {
			colorSet: CellColorSet.ColorSet5
		},

		_setModelData: function (oData) {
			var oModel = this.getView().getModel();
			oModel.setData(oData);
		}
	});
});