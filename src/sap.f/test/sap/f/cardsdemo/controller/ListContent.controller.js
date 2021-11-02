sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ListController", {

		onFormFactorChange: function () {
			this.byId("gridCont").toggleStyleClass("sapUiSizeCompact");
			this.byId("gridCont").invalidate(); // retrigger calculations for minimum height of cards
		},

		onLoadingSelect: function (oEvent) {
			// Note: Currently placeholders don't handle cozy/compact change

			var bLoading = oEvent.getParameter("selected");
			this.byId("gridCont").getItems().forEach(function (oCard) {
				oCard._setPreviewMode(bLoading);
			});
		}

	});
});