sap.ui.define([
	"sap/ui/test/Opa5",
	"Arrangement",
	"sap/ui/test/opaQunit",
	"sap/ui/demo/cart/test/PhoneNavigationJourney"
], function (Opa5, Arrangement) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Arrangement(),
		viewNamespace: "sap.ui.demo.cart.view.",
		autoWait: true
	});
});
