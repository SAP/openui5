sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/gherkin/opa5TestHarness",
	"./arrangements/iframe/Startup",
	"sap/ui/test/gherkin/StepDefinitions",

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
], function (Opa5, testHarness, Startup, StepDefinitions) {
	"use strict";

	var startupInstance = new Startup();
	var Steps = StepDefinitions.extend("GherkinWithOPA5.Steps", {
		init: function() {
			this.register(
				/^I start my App with the hash "(.*)" (.*)/i,
				function(sHash, sStorage) {
					var bKeepStorage = sStorage.indexOf("keeping") >= 0;
					startupInstance.iStartMyApp({
						keepStorage: bKeepStorage,
						hash: sHash
					});
				}
			);
		}
	});

	testHarness.test({featurePath: "sap/ui/demo/cart/test/integration/DeleteProduct", generateMissingSteps : true});
	testHarness.test({featurePath: "sap/ui/demo/cart/test/integration/BuyProduct", generateMissingSteps : true, steps: Steps});
	testHarness.test({featurePath: "sap/ui/demo/cart/test/integration/SaveForLater", generateMissingSteps : true});
	testHarness.test({featurePath: "sap/ui/demo/cart/test/integration/ProductsFilter", generateMissingSteps : true});

	Opa5.extendConfig({
		arrangements : startupInstance,
		viewNamespace : "sap.ui.demo.cart.view.",
		autoWait: true
	});
});