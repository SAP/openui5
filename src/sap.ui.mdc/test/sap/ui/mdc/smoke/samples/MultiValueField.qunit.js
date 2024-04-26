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

	const aDateConditions = [
		{
			"operator": "EQ",
			"values": [
				"2023-12-04T23:00:00.000Z"
			],
			"isEmpty": null,
			"validated": "NotValidated"
		},
		{
			"operator": "EQ",
			"values": [
				"2024-07-27T22:00:00.000Z"
			],
			"isEmpty": null,
			"validated": "NotValidated"
		},
		{
			"operator": "EQ",
			"values": [
				"2021-03-02T23:00:00.000Z"
			],
			"isEmpty": null,
			"validated": "NotValidated"
		}
	];
	const aCountryKeys = ["DE", "LV", "ES"];
	const aFields = [
		{ id: "container-mdc.sample---sample--F-VH", value: "", input: ["Germany", "Latvia", "Spain"], label: "MultiValueField with ValueHelp" },
		{ id: "container-mdc.sample---sample--F4-date", value: "", input: ["2023-12-05", "2024-07-28", "2021-03-03"], label: "date field" }
	];


	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/MultiValueField/index.html";

	opaTest("All multi-value fields are properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheMDCMultiValueField.iShouldSeeTheMultiValueField(aFields[0].id);
		Then.onTheMDCMultiValueField.iShouldSeeTheMultiValueField(aFields[1].id);
		Opa5.assert.ok(true);
	});

	opaTest(`Multi-value field with label "${aFields[0].label}" works`, function (Given, When, Then) {
		const oField = aFields[0];

		Then.onTheMDCMultiValueField.iShouldSeeTheMultiValueFieldWithValues(oField.id, oField.value);
		oField.input.forEach((sInput) => {
			When.onTheMDCMultiValueField.iEnterTextOnTheMultiValueField(oField.id, sInput);
		});
		Then.onTheMDCMultiValueField.iShouldSeeTheKeys(oField.id, aCountryKeys);
	});

	opaTest(`Multi-value field with label "${aFields[1].label}" works`, function (Given, When, Then) {
		const oField = aFields[1];

		Then.onTheMDCMultiValueField.iShouldSeeTheMultiValueFieldWithValues(oField.id, oField.value);
		oField.input.forEach((sInput) => {
			When.onTheMDCMultiValueField.iEnterTextOnTheMultiValueField(oField.id, sInput);
		});
		Then.onTheMDCMultiValueField.iShouldSeeConditions(oField.id, aDateConditions);
	});


	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});