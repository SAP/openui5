sap.ui.define([
	"sap/ui/test/Opa5",
	"Arrangement",
	"./WelcomeJourney",
	"./NavigationJourney",
	"./DeleteProductJourney",
	"./BuyProductJourney",
	"./FilterJourney"
], function (Opa5, Arrangement) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		viewNamespace: "sap.ui.demo.cart.view.",
		autoWait: true
	});
});

