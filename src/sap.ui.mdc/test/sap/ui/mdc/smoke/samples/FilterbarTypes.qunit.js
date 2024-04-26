sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"sap/ui/events/KeyCodes",
	"test-resources/sap/ui/mdc/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, P13nAssertion, FilterFieldActions, KeyCodes, App, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		assertions: new P13nAssertion(),
		actions: FilterFieldActions,
		autoWait: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/FilterbarTypes/index.html";
	const aFilterFields = [
		{ label: "Name (String)" },
		{ label: "Height (Integer)" },
		{ label: "Prominence (Float)" },
		{ label: "Has parent mountain (Boolean)" },
		{ label: "First Ascent (Date)" },
		{ label: "Rank (Integer)" }
	];

	const oConditions = {
		"name": [
			{
				"operator": "EQ",
				"values": [
					"Mount Everest"
				],
				"validated": "Validated"
			}
		],
		"height": [
			{
				"operator": "EQ",
				"values": [
					50
				],
				"validated": "NotValidated"
			}
		],
		"prominence": [
			{
				"operator": "EQ",
				"values": [
					4.4
				],
				"validated": "NotValidated"
			}
		],
		"parent_mountain": [
			{
				"operator": "EQ",
				"values": [
					false
				],
				"validated": "Validated"
			}
		],
		"first_ascent": [
			{
				"operator": "LASTDAYS",
				"values": [
					4
				],
				"validated": "NotValidated"
			}
		],
		"rank": [
			{
				"operator": "EQ",
				"values": [
					5
				],
				"validated": "NotValidated"
			}
		]
	};

	opaTest("All FilterFields are properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheMDCFilterBar.iShouldSeeTheFilterBar();
		Then.onTheMDCFilterBar.iShouldSeeTheAdaptFiltersButton();
		Then.onTheMDCFilterBar.iShouldSeeTheFilterFieldsWithLabels(aFilterFields.map((oFilterField) => oFilterField.label));
	});

	Object.keys(oConditions).forEach(function(sKey, index) {
		opaTest(`"${sKey}" FilterField works`, function (Given, When, Then) {
			const oCurrentFilterField = aFilterFields[index];
			const aValidKeys = Object.keys(oConditions).slice(0, index + 1);
			const oCurrentCondition = {};
			// eslint-disable-next-line max-nested-callbacks
			aValidKeys.forEach((sValidKey) => {
				oCurrentCondition[sValidKey] = oConditions[sValidKey];
			});
			if (sKey === "first_ascent") {
				When.onTheMDCFilterField.iEnterTextOnTheFilterField(oCurrentFilterField, "Last 4 Days");
			} else {
				When.onTheMDCFilterField.iEnterTextOnTheFilterField(oCurrentFilterField, oConditions[sKey][0].values[0]);
			}
			When.iPressKeyOnTheFilterField(oCurrentFilterField, KeyCodes.ENTER);
			Then.iShouldSeeConditons("sap.ui.mdc.FilterBar", oCurrentCondition);
			Then.onTheApp.iShouldSeeACodeEditorWithContent(JSON.stringify(oCurrentCondition, "\t", 4));
		});
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});