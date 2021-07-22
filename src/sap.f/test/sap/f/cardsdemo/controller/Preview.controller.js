sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Preview", {

		onInit: function () {
			[
				"card1",
				"card2",
				"card3",
				"card4"
			].forEach(function (sCardId) {
				this.byId(sCardId)._setPreviewMode(true);
			}.bind(this));
		}
	});
});