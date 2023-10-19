sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ActionDefinition"
], function (Controller, ActionDefinition) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.TilesVariants", {
		onInit: function () {
			var aCards = this.getView().findAggregatedObjects(true, function (e) {
				return e.isA("sap.ui.integration.widgets.Card");
			});

			aCards.forEach(function (oCard) {
				// Adds a toolbar with actions for testing
				oCard.attachManifestApplied(function () {
					oCard.addActionDefinition(new ActionDefinition({ text: "Test" }));
				});
			});
		}
	});
});