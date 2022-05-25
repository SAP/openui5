sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ListController", {

		onFormFactorChange: function () {
			this.byId("gridCont").toggleStyleClass("sapUiSizeCompact");
			this.byId("gridCont").invalidate(); // retrigger calculations for minimum height of cards
		}

	});
});