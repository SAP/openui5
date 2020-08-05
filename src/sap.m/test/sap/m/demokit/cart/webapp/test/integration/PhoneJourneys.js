sap.ui.define([
	"sap/ui/test/Opa5",
	"Startup",
	"./PhoneNavigationJourney"
], function (Opa5, Startup) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "sap.ui.demo.cart.view.",
		autoWait: true
	});
});
