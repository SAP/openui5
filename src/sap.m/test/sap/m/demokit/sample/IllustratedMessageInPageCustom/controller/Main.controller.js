sap.ui.define([
	"sap/m/IllustratedMessageSize",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (oIllustratedMessageSize, JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.IllustratedMessageInPageCustom.controller.Main", {

		onInit: function () {

			var aIMISizeData = [];

			Object.keys(oIllustratedMessageSize).forEach(function (sKey) {
				aIMISizeData.push({key: oIllustratedMessageSize[sKey], text: sKey});
			});

			this.oModel = new JSONModel({
				sizeTypes: aIMISizeData
			});

			this.oModel.setProperty("/sSelectedSize", aIMISizeData[0].key);

			this.getView().setModel(this.oModel);
		},
		onSelectSize: function (oEvent) {
			this.oModel.setProperty("/sSelectedSize", oEvent.getParameter("selectedItem").getKey());
		}
	});
});
