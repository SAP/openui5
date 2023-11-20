sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ManifestReady", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/listContent/manifest.json"));
			this.getView().setModel(oModel, "manifests");
			this._iEventsCounter = 0;
		},

		onManifestReady: function () {
			MessageToast.show("manifestReady event fired " + this._iEventsCounter++);
		}

	});
});