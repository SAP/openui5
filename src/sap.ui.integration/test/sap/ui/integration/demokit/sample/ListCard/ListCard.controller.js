sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.ListCard.ListCard", {
		onInit: function () {
			var sManifestPath = sap.ui.require.toUrl("sap/ui/integration/sample/ListCard") + "/model/cardManifest.json";
			this.getView().byId("listCardSample").setManifest(sManifestPath);
		}
	});
});