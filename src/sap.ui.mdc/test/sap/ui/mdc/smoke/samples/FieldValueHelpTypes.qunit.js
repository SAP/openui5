sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/events/KeyCodes",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, KeyCodes, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		// autoWait: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const aFields = [
		{ id: "container-mdc.sample---sample--F-TypeAhead", vh: "container-mdc.sample---sample--VH-TypeAhead", input: "A"},
		{ id: "container-mdc.sample---sample--F-TypeAheadDropdown", vh: "container-mdc.sample---sample--VH-TypeAheadDropdown", input:"A"},
		{ id: "container-mdc.sample---sample--F-TypeAheadDropdownFocus", vh: "container-mdc.sample---sample--VH-TypeAheadDropdownFocus", input:""},
		{ id: "container-mdc.sample---sample--F-DropdownOnly", vh: "container-mdc.sample---sample--VH-DropdownOnly", input:""},
		{ id: "container-mdc.sample---sample--F-DialogOnly", vh: "container-mdc.sample---sample--VH-DialogOnly", input:""},
		{ id: "container-mdc.sample---sample--F-Countries", vh: "container-mdc.sample---sample--VH-Countries", input:""}
	];


	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/FieldValueHelpTypes/index.html";

	opaTest("All fields are properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheMDCField.iShouldSeeTheField(aFields[0].id);
		Then.onTheMDCField.iShouldSeeTheField(aFields[1].id);
		Then.onTheMDCField.iShouldSeeTheField(aFields[2].id);
		Then.onTheMDCField.iShouldSeeTheField(aFields[3].id);
		Then.onTheMDCField.iShouldSeeTheField(aFields[4].id);
		Then.onTheMDCField.iShouldSeeTheField(aFields[5].id);
		Opa5.assert.ok(true);
	});

	opaTest(`TypeAhead Field works`, function (Given, When, Then) {
		const oField = aFields[0];
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oField.id, "");
		When.onTheMDCField.iEnterTextOnTheField(oField.id, oField.input, true);
		Then.onTheMDCValueHelp.iShouldSeeValueHelpPopover(oField.vh);
	});

	opaTest(`TypeAheadDropdown Field works`, function (Given, When, Then) {
		const oField = aFields[1];
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oField.id, "");
		When.onTheMDCField.iOpenTheValueHelpForField(oField.id);
		Then.onTheMDCValueHelp.iShouldSeeValueHelpPopover(oField.vh);
	});

	opaTest(`TypeAheadDropdownFocus Field works`, function (Given, When, Then) {
		const oField = aFields[2];
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oField.id, "");
		When.onTheMDCField.iOpenTheValueHelpForField(oField.id);
		Then.onTheMDCValueHelp.iShouldSeeValueHelpPopover(oField.vh);
	});

	opaTest(`DropdownOnly Field works`, function (Given, When, Then) {
		const oField = aFields[3];
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oField.id, "");
		When.onTheMDCField.iOpenTheValueHelpForField(oField.id);
		Then.onTheMDCValueHelp.iShouldSeeValueHelpPopover(oField.vh);
	});

	opaTest(`DialogOnly Field works`, function (Given, When, Then) {
		const oField = aFields[4];
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oField.id, "");
		When.onTheMDCField.iOpenTheValueHelpForField(oField.id);
		Then.onTheMDCValueHelp.iShouldSeeTheValueHelpDialog(oField.vh);
	});

	opaTest(`Countries Field works`, function (Given, When, Then) {
		const oField = aFields[5];
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oField.id, "");
		When.onTheMDCField.iOpenTheValueHelpForField(oField.id);
		Then.onTheMDCValueHelp.iShouldSeeTheValueHelpDialog(oField.vh);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});