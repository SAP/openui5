sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ProfileObjectPageHeader.ProfileObjectPageHeader", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ProfileObjectPageHeader/employee.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		}
	});
}, true);
