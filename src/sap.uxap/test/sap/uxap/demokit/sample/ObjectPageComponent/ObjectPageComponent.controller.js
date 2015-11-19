sap.ui.define([
	"sap/uxap/sample/ObjectPageComponent/ObjectPageEvents",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (ObjectPageEvents, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageComponent.ObjectPageComponent", {
		onInit: function () {
			this.oDataModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageComponent/HRData.json");
			this.getView().setModel(this.oDataModel, "objectPageData");
		}
	});
}, /* bExport= */ true);
