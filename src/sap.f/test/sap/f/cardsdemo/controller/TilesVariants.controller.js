sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ActionDefinition"
], function (Controller, ActionDefinition) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.TilesVariants", {
		onInit: function () {
			var aCards = ["card1", "card2", "card3", "card4", "card5", "card6"];
			aCards.forEach(function (sCardId) {
				var oCard = this.getView().byId(sCardId);

				// Adds a toolbar with actions for testing
				oCard.attachManifestApplied(function () {
					oCard.addActionDefinition(new ActionDefinition({ text: "Test" }));
				});
			}.bind(this));
		}
	});
});