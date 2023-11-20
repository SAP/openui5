sap.ui.define([
	"sap/ui/test/Opa5",
	"Startup",
	// QUnit additions
	"sap/ui/qunit/qunit-css",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage",
	// Page Objects
	"./pages/Home",
	"./pages/Welcome",
	"./pages/Category",
	"./pages/Product",
	"./pages/Cart",
	"./pages/Dialog",
	"./pages/Checkout",
	"./pages/OrderCompleted"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements : new Startup(),
		viewNamespace : "sap.ui.demo.cart.view.",
		autoWait: true
	});
});
