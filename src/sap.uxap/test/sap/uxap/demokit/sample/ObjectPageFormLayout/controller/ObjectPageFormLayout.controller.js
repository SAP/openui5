sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (JSONModel, Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageFormLayout.controller.ObjectPageFormLayout", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/SharedJSONData/HRData.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		},
		handleLink1Press: function () {
			MessageToast.show("Page 1 a very long link clicked");
		},

		handleLink2Press: function () {
			MessageToast.show("Page 2 long link clicked");
		}
	});
});
