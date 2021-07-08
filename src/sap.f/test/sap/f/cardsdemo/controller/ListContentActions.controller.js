sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ListActionsController", {

		onInit: function () {
			var oCardManifests = new JSONModel(sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/listContent/quickActions.json"));
			this.getView().setModel(oCardManifests, "manifests");
		},

		onFormFactorChange: function () {
			document.getElementsByClassName("sapFGridContainer")[0].classList.toggle("sapUiSizeCompact");
		},

		onAction: function (oEvent) {
			// var oParameters = oEvent.getParameter("parameters");
			// var oItem = oParameters.item;
		}
	});
});