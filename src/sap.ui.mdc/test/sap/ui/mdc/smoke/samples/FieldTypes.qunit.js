sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const oTimeRegex = /[0-9]{1,2}:[0-9]{2}:[0-9]{2}\s(PM|AM)/;
	const oDateRegex = /[A-Z][a-z]{2} [0-9]{1,2},\s[0-9]{4}/;
	const oDateTimeRegex = /[A-Z][a-z]{2} [0-9]{1,2},\s[0-9]{4},\s[0-9]{1,2}:[0-9]{2}:[0-9]{2}\s(PM|AM)/;

	const aFields = [
		{ id: "container-mdc.sample---sample--F-String", value: "Test", input: "Another one", newValue: "Another one", label: "string Field" },
		{ id: "container-mdc.sample---sample--F-Integer", value: "1", input: "456789", newValue: "456789", label: "integer Field" },
		{ id: "container-mdc.sample---sample--F-Boolean", value: "true", input: "false", newValue: "false", label: "boolean Field" },
		{ id: "container-mdc.sample---sample--F-Currency", value: "1.23", input: "60", newValue: "60.00", label: "currency Field" }
	];
	const aTimeFields = [
		{ id: "container-mdc.sample---sample--F-Date", regex: oDateRegex, input: "2023-10-02", label: "date Field" },
		{ id: "container-mdc.sample---sample--F-Time", regex: oTimeRegex, input: "10:56:24", label: "time Field" },
		{ id: "container-mdc.sample---sample--F-DateTime", regex: oDateTimeRegex, input: "2022-10-02T10:56:24", label: "dateTime Field" }
	];


	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/FieldTypes/index.html";

	opaTest("All fields are properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheMDCField.iShouldSeeTheField(aFields[0].id);
		Then.onTheMDCField.iShouldSeeTheField(aFields[1].id);
		Then.onTheMDCField.iShouldSeeTheField(aFields[2].id);
		Then.onTheMDCField.iShouldSeeTheField(aFields[3].id);
		Then.onTheMDCField.iShouldSeeTheField(aTimeFields[0].id);
		Then.onTheMDCField.iShouldSeeTheField(aTimeFields[1].id);
		Then.onTheMDCField.iShouldSeeTheField(aTimeFields[2].id);
	});

	aFields.forEach(function (oField, index) {
		opaTest(`Field with label "${oField.label}" works`, function (Given, When, Then) {
			Then.onTheMDCField.iShouldSeeTheFieldWithValues(oField.id, oField.value);
			When.onTheMDCField.iEnterTextOnTheField(oField.id, oField.input);
			Then.onTheMDCField.iShouldSeeTheFieldWithValues(oField.id, oField.newValue);
		});
	});

	aTimeFields.forEach(function (oField, index) {
		opaTest(`Field with label "${oField.label}" works`, function (Given, When, Then) {
			Then.onTheMDCField.iShouldSeeTheFieldWithMatchingValue(oField.id, oField.regex);
			When.onTheMDCField.iEnterTextOnTheField(oField.id, oField.input);
			Then.onTheMDCField.iShouldSeeTheFieldWithMatchingValue(oField.id, oField.regex);
		});
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});