sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.Progressive.ComponentCard.Regular", {
		onInit: function () {
			const oComponent = this.getOwnerComponent(),
				oCard = oComponent.card;

			this.getView().setModel(oCard.getModel("size"), "size");
		}
	});
});