sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"test-resources/sap/ui/mdc/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, P13nAssertion, FilterFieldActions, App, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		assertions: new P13nAssertion(),
		actions: {...FilterFieldActions },
		autoWait: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/table/TablePropertyInfos/index.html";
	const sTableId = "container-mdc.sample---sample--table";

	opaTest("A table is properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheApp.iShouldSeeATable(sTableId);
		Then.onTheApp.iShouldSeeTheMoreButton(sTableId);
	});

	opaTest("Adding a column works", function (Given, When, Then) {
		When.onTheMDCTable.iPersonalizeColumns(sTableId, [
			"Name (Range)",
			"First Ascent",
			"Countries",
			"Parent Mountain",
			"Coordinates",
			"Height",
			"Height / Prominence",
			"Name",
			"Prominence",
			"Rank"
		]);
		Then.onTheMDCTable.iCheckColumnsInOrder(sTableId, [
			"Rank",
			"Name",
			"Coordinates",
			"Prominence",
			"Height",
			"Height / Prominence",
			"Parent Mountain",
			"Countries",
			"First Ascent",
			"Name (Range)"
		]);
	});

	opaTest("Removing a column works", function (Given, When, Then) {
		When.onTheMDCTable.iPersonalizeColumns(sTableId, [
			"Name (Range)",
			"First Ascent",
			"Countries",
			"Parent Mountain"
		]);
		Then.onTheMDCTable.iCheckColumnsInOrder(sTableId, [
			"Name (Range)",
			"First Ascent",
			"Countries",
			"Parent Mountain"
		]);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});