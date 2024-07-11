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

	const sTableId = "container-sap.m.sample.p13n.EngineGridTable---app--persoTable";
	const sSampleResource = "test-resources/sap/m/demokit/sample/p13n/EngineGridTable/index.html";

	opaTest("A table is properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheApp.iShouldSeeColumnsInOrder(sTableId, ["First Name", "Last Name", "City"], false);
		Opa5.assert.ok(true);
	});

	opaTest("Hiding and adding columns works", function (Given, When, Then) {
		When.iPersonalizeFields(sTableId, ["Last Name", "City", "Size"]);
		Then.onTheApp.iShouldSeeColumnsInOrder(sTableId, ["Last Name", "City", "Size"], false);
	});

	opaTest("Sorting works", function (Given, When, Then) {
		When.iPersonalizeSort(sTableId, [{key: "Size"}]);
		Then.onTheApp.iShouldSeeRowsInOrder(sTableId, [
			"1.55",
			"1.65",
			"1.75",
			"1.85",
			"1.95"
		], false);
		Opa5.assert.ok(true);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});