sap.ui.define([
	"sap/ui/test/Opa5",
	"Startup",
	"./WelcomeJourney",
	"./NavigationJourney",
	"./DeleteProductJourney",
	// this test commented out as it gets destabilized by the require
	// in "sap/ui/test/_OpaLogger"
	// "./BuyProductJourney",
	"./FilterJourney",
	"./ComparisonJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.ui.demo.cart.view.",
		autoWait: true
	});
});