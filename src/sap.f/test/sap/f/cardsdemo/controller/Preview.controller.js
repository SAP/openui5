sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Preview", {

		onInit: function () {
			this.byId("card1")._setPreviewMode(true);
			this.byId("card2")._setPreviewMode(true);
			// comment temporary until NumericHeader preview is fixed
			// this.byId("card3")._setPreviewMode(true);
		}
	});
});