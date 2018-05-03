sap.ui.define([
	"sap/ui/test/Opa5",
	"Arrangement",
	// QUnit additions
	"sap/ui/qunit/qunit-css",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage",
	// Page Objects
	"sap/ui/demo/cart/test/integration/pages/Home",
	"sap/ui/demo/cart/test/integration/pages/Welcome",
	"sap/ui/demo/cart/test/integration/pages/Category",
	"sap/ui/demo/cart/test/integration/pages/Product",
	"sap/ui/demo/cart/test/integration/pages/Cart",
	"sap/ui/demo/cart/test/integration/pages/Dialog",
	"sap/ui/demo/cart/test/integration/pages/Checkout",
	"sap/ui/demo/cart/test/integration/pages/OrderCompleted"
], function (Opa5, Arrangement) {
	"use strict";

	Opa5.extendConfig({
		arrangements : new Arrangement(),
		viewNamespace : "sap.ui.demo.cart.view.",
		autoWait: true
	});
});
