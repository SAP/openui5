sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/cart/test/arrangement/Arrangement",
	"sap/ui/demo/cart/test/action/BuyProductJourneyAction",
	"sap/ui/demo/cart/test/assertion/BuyProductJourneyAssertion",
	// QUnit additions
	"sap/ui/qunit/qunit-css",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage",
	// Page Objects
	"sap/ui/demo/cart/test/pageobjects/Home",
	"sap/ui/demo/cart/test/pageobjects/Category",
	"sap/ui/demo/cart/test/pageobjects/Product",
	"sap/ui/demo/cart/test/pageobjects/Cart",
	"sap/ui/demo/cart/test/pageobjects/Dialog"
], function (Opa5, Arrangement, BuyProductJourneyAction, BuyProductJourneyAssertion) {
	"use strict";

	Opa5.extendConfig({
		arrangements : new Arrangement(),
		actions: new BuyProductJourneyAction(),
		assertions: new BuyProductJourneyAssertion(),
		viewNamespace : "sap.ui.demo.cart.view.",
		autoWait: true
	});
});

