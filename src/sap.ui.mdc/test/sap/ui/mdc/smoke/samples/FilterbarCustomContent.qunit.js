sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"sap/ui/events/KeyCodes",
	"test-resources/sap/ui/mdc/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, P13nAssertion, FilterFieldActions, KeyCodes, App, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		viewNamespace: "sap.ui.mdc.demokit.sample.FilterbarCustomContent",
		assertions: new P13nAssertion(),
		actions: FilterFieldActions,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const aCustomControls = {
		"sap.m.Slider": {
				"numberWords": [
					{
						"operator": "EQ",
						"values": [
							1000
						],
						"validated": "NotValidated"
					}
				]
			},
			"sap.m.MultiInput": {
				"numberWords": [
					{
						"operator": "EQ",
						"values": [
							1000
						],
						"validated": "NotValidated"
					}
				],
				"descr": [
					{
						"operator": "EQ",
						"values": [
							"sample text"
					],
					"validated": "NotValidated"
				}
			]
		},
		"sap.m.SegmentedButton": {
			"numberWords": [
				{
					"operator": "EQ",
					"values": [
						1000
					],
					"validated": "NotValidated"
				}
			],
			"descr": [
				{
					"operator": "EQ",
					"values": [
						"sample text"
					],
					"validated": "NotValidated"
				}
			],
			"status": [
				{
					"operator": "EQ",
					"values": [
						"done"
					],
					"validated": "NotValidated"
				}
			]
		}
	};

	const oConditionShowValues = {
		"numberWords": [
			{
				"operator": "EQ",
				"values": [
					50000
				],
				"validated": "NotValidated"
			}
		],
		"descr": [
			{
				"operator": "EQ",
				"values": [
					"sample text"
				],
				"validated": "NotValidated"
			},
			{
				"operator": "EQ",
				"values": [
					"another text"
				],
				"validated": "NotValidated"
			}
		],
		"status": [
			{
				"operator": "EQ",
				"values": [
					"planning"
				],
				"validated": "NotValidated"
			}
		]
	};

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/FilterbarCustomContent/index.html";

	opaTest("All FilterFields are properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheMDCFilterBar.iShouldSeeTheFilterBar();
		Then.onTheMDCFilterBar.iShouldSeeTheAdaptFiltersButton();
		Object.keys(aCustomControls).forEach((sCustomControl) => {
			Then.onTheApp.iShouldSeeAFilterFieldWithCustomControl(sCustomControl);
		});
	});

	opaTest(`Slider FilterField works`, function (Given, When, Then) {
		const oCondition = aCustomControls["sap.m.Slider"];

		When.onTheApp.iChangeTheSliderValueInTheField(1000, true);
		Then.iShouldSeeConditons("sap.ui.mdc.FilterBar", oCondition);
		Then.onTheApp.iShouldSeeACodeEditorWithContent(JSON.stringify(oCondition, "\t", 4), "__editor0");
	});

	opaTest(`MultiInput FilterField works`, function (Given, When, Then) {
		const oCondition = aCustomControls["sap.m.MultiInput"];

		When.onTheApp.iEnterTextOnTheMultiInputFilterField("sample text");
		When.onTheApp.iPressKeyOnTheMultiInputFilterField(KeyCodes.ENTER);
		Then.iShouldSeeConditons("sap.ui.mdc.FilterBar", oCondition);
		Then.onTheApp.iShouldSeeACodeEditorWithContent(JSON.stringify(oCondition, "\t", 4), "__editor0");
	});

	opaTest(`SegmentedButton FilterField works`, function (Given, When, Then) {
		const oCondition = aCustomControls["sap.m.SegmentedButton"];

		When.onTheApp.iChangeTheSegementedButtonValueInTheFilterField("Done");
		Then.iShouldSeeConditons("sap.ui.mdc.FilterBar", oCondition);
		Then.onTheApp.iShouldSeeACodeEditorWithContent(JSON.stringify(oCondition, "\t", 4), "__editor0");
	});
	opaTest(`Changes in "Show Values" are correctly reflected`, function (Given, When, Then) {
		When.onTheMDCFilterBar.iPressOnTheAdaptFiltersButton();
		When.onTheMDCFilterBar.iPressTheAdaptFiltersShowValuesButton();
		When.onTheApp.iChangeTheSliderValueInTheField(50000, true, true);
		When.onTheApp.iChangeTheSegementedButtonValueInTheFilterField("Planning", true);

		When.onTheApp.iEnterTextOnTheMultiInputFilterField("another text", true);
		When.onTheApp.iPressKeyOnTheMultiInputFilterField(KeyCodes.ENTER, true);

		When.onTheMDCFilterBar.iCloseTheAdaptFiltersDialogWithOk();
		Then.iShouldSeeConditons("sap.ui.mdc.FilterBar", oConditionShowValues);
		Then.onTheApp.iShouldSeeACodeEditorWithContent(JSON.stringify(oConditionShowValues, "\t", 4), "__editor0");
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});