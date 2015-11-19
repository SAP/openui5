sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageOnJSONWithLazyLoading.ObjectPageOnJSONWithLazyLoading", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageOnJSONWithLazyLoading/HRData.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		}
	});
}, true)
