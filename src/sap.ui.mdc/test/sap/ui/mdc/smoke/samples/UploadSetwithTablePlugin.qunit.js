sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	"test-resources/sap/ui/mdc/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, P13nAssertion, App, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		assertions: new P13nAssertion(),
		autoWait: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/table/UploadSetwithTablePlugin/index.html";
	const sTableId = "container-mdc.sample---sample--table-uploadSet";
	const sDownloadButtonId = "container-mdc.sample---sample--downloadSelectedButton-action";

	opaTest("A table is properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheApp.iShouldSeeATable(sTableId);
	});

	opaTest("Adding a column works", function (Given, When, Then) {
		When.onTheMDCTable.iPersonalizeColumns(sTableId, [
			"File Name",
			"ID",
			"Revision",
			"Status",
			"File Size",
			"Last Modified"
		]);
		Then.onTheMDCTable.iCheckColumnsInOrder(sTableId, [
			"Last Modified",
			"File Size",
			"Status",
			"Revision",
			"ID",
			"File Name"
		]);
	});

	opaTest("Removing a column works", function (Given, When, Then) {
		When.onTheMDCTable.iPersonalizeColumns(sTableId, [
			"File Name",
			"ID",
			"Revision",
			"Status",
			"File Size"
		]);
		Then.onTheMDCTable.iCheckColumnsInOrder(sTableId, [
			"File Name",
			"ID",
			"Revision",
			"Status",
			"File Size"
		]);
	});

	opaTest("Upload button is visible", function (Given, When, Then) {
		Then.onTheApp.iShouldSeeUploadButton(sTableId);
	});

	opaTest("Download button is visible", function (Given, When, Then) {
		Then.onTheApp.iShouldseeDownloadButton(sDownloadButtonId);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});