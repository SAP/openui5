sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, App, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/TableFilterBarJson/index.html";
	const sTableId = "container-mdc.sample---sample--table";
	const sSearchFieldId = "__field0";
	const sNameFieldId = "__field1";
	const sFilterBarId = "container-mdc.sample---sample--filterbar";

	opaTest("A table is properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheApp.iShouldSeeATable(sTableId);
		Then.onTheApp.iShouldSeeRows(sTableId, 100);
		Then.onTheApp.iShouldSeeTheMoreButton(sTableId);
		Then.onTheMDCTable.iCheckColumnsInOrder(sTableId, [
			"Name",
			"Height",
			"Range",
			"First Ascent",
			"Countries",
			"Parent Mountain"
		]);
	});

	opaTest("Search functionality works", function (Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(sSearchFieldId, "K2");
		Then.onTheApp.iShouldSeeRows(sTableId, 8);
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(sSearchFieldId, "");
		Then.onTheApp.iShouldSeeRows(sTableId, 100);
	});

	opaTest("Name ValueHelp dialog works", function (Given, When, Then) {
		When.onTheMDCFilterField.iOpenTheValueHelpForFilterField(sNameFieldId);
		When.onTheApp.iCloseTheValueHelpDialog();
		Then.onTheApp.iShouldSeeRows(sTableId, 100);
	});

	opaTest("Name FilterField works", function (Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(sNameFieldId, "Mount Everest");
		When.onTheApp.iPressGoButtonOnFilterBar(sFilterBarId);
		Then.onTheApp.iShouldSeeRows(sTableId, 1);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});