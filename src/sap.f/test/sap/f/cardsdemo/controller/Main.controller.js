sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller,JSONModel) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Main", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
		},
        onSelectExample: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContextPath();
			var sRoute = this.getView().getModel("cardTypesExamples").getProperty(sPath + "/route");
			this.oRouter.navTo(sRoute);
		}
    });
});