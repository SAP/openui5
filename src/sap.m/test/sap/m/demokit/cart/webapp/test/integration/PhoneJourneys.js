/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	'sap/ui/demo/cart/test/arrangement/Arrangement',
	"sap/ui/test/opaQunit",
	//page objects
	'sap/ui/demo/cart/test/pageobjects/Welcome',
	'sap/ui/demo/cart/test/pageobjects/Checkout',
	'sap/ui/demo/cart/test/pageobjects/Home',
	'sap/ui/demo/cart/test/pageobjects/Category',
	'sap/ui/demo/cart/test/pageobjects/Product',
	'sap/ui/demo/cart/test/pageobjects/Cart',
	'sap/ui/demo/cart/test/pageobjects/Dialog',
	'sap/ui/demo/cart/test/PhoneNavigationJourney'
], function (Opa5, Arrangement) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Arrangement(),
		viewNamespace: "sap.ui.demo.cart.view."
	});
});