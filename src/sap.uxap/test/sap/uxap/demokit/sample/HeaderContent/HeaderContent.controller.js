sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.HeaderContent.HeaderContent", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/HeaderContent/employee.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		}
	});
}, true);
