sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"sap/ui/events/KeyCodes",
	"test-resources/sap/ui/mdc/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary",
	"test-resources/sap/ui/mdc/testutils/opa/table/TestObjects"
], function (Opa5, opaTest, P13nAssertion, FilterFieldActions, KeyCodes, App, TestLibrary, TestObjects) {
	"use strict";

	Opa5.extendConfig({
		viewNamespace: "sap.ui.mdc.demokit.sample.TableJson",
		assertions: new P13nAssertion(),
		actions: {...FilterFieldActions },
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/TableJson/index.html";
	const sTableId = "container-mdc.sample---sample--table";

	opaTest("A table is properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheApp.iShouldSeeATable(sTableId);
		Then.onTheApp.iShouldSeeRows(sTableId, 25);
		Then.onTheApp.iShouldSeeTheMoreButton(sTableId);
	});

	opaTest("Adding a column works", function (Given, When, Then) {
		When.onTheMDCTable.iPersonalizeColumns(sTableId, [
			"Name",
			"Range",
			"First Ascent",
			"Countries",
			"Parent Mountain",
			"Coordinates"
		]);
		Then.onTheMDCTable.iCheckColumnsInOrder(sTableId, [
			"Coordinates",
			"Parent Mountain",
			"Countries",
			"First Ascent",
			"Range",
			"Name"
		]);
	});

	opaTest("Removing a column works", function (Given, When, Then) {
		When.onTheMDCTable.iPersonalizeColumns(sTableId, [
			"Name",
			"Range",
			"Countries",
			"Parent Mountain",
			"Coordinates"
		]);
		Then.onTheMDCTable.iCheckColumnsInOrder(sTableId, [
			"Name",
			"Parent Mountain",
			"Range",
			"Coordinates",
			"Countries"
		]);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});