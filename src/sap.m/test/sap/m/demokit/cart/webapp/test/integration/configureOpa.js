 /*global QUnit*/
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/cart/test/arrangement/Arrangement",
	// QUnit additions
	"sap/ui/qunit/qunit-css",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage",
	// Page Objects
	"sap/ui/demo/cart/test/pageobjects/Home",
	"sap/ui/demo/cart/test/pageobjects/Welcome",
	"sap/ui/demo/cart/test/pageobjects/Category",
	"sap/ui/demo/cart/test/pageobjects/Product",
	"sap/ui/demo/cart/test/pageobjects/Cart",
	"sap/ui/demo/cart/test/pageobjects/Dialog",
	"sap/ui/demo/cart/test/pageobjects/Checkout",
	"sap/ui/demo/cart/test/pageobjects/OrderCompleted"
], function (Opa5, Arrangement) {
	"use strict";

	Opa5.extendConfig({
		arrangements : new Arrangement(),
		actions: new Opa5({
			iLookAtTheScreen : function () {
				return this;
			}
		}),
		viewNamespace : "sap.ui.demo.cart.view.",
		autoWait: true
	});

	// some features take more than 90sec that is the default timeout so need to increase it
	QUnit.config.testTimeout = 180000;
});

