sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageOnJSONWithLazyLoading.controller.ObjectPageOnJSONWithLazyLoading", {
		onInit: function () {
			var oJsonModel = new JSONModel(sap.ui.require.toUrl("sap/uxap/sample/SharedJSONData/HRData.json"));
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		}
	});
});
