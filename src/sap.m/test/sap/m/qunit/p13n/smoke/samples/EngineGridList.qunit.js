sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",

	"test-resources/sap/ui/mdc/testutils/opa/p13n/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/Assertions",
	"test-resources/sap/ui/mdc/testutils/opa/p13n/Util",
	"test-resources/sap/m/qunit/p13n/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, P13nAction, P13nAssertion, P13nUtil, P13nApp, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		actions: P13nAction,
		assertions: P13nAssertion,
		autoWait: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sGridList = "container-sap.m.sample.p13n.EngineGridList---app--persoList";
	const sSampleResource = "test-resources/sap/m/demokit/sample/p13n/EngineGridList/index.html";

	opaTest("A table is properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheApp.iShouldGridItemsInOrder(sGridList, [
			"Peter",
			"Petra",
			"Thomas",
			"Maria",
			"John"
		]);
		Opa5.assert.ok(true);
	});

	opaTest("Hiding and adding columns works", function (Given, When, Then) {
		When.onTheApp.iPersonalizeFieldsOnGridList(sGridList, [
			"Peter Mueller",
			"Maria Jones",
			"Thomas Smith"
		]);
		Then.onTheApp.iShouldGridItemsInOrder(sGridList, [
			"Maria",
			"Thomas",
			"Peter"
		]);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});