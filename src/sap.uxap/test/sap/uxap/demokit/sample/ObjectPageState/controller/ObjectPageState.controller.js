sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (jQuery, JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageState.controller.ObjectPageState", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/SharedJSONData/HRData.json");

			this.getView().setModel(oJsonModel, "ObjectPageModel");
		}
	});
}, true);
