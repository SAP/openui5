sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"sap/ui/events/KeyCodes",
	'sap/ui/core/date/UniversalDateUtils',
	"test-resources/sap/ui/mdc/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, P13nAssertion, FilterFieldActions, KeyCodes, UniversalDateUtils, App, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		assertions: new P13nAssertion(),
		actions: FilterFieldActions,
		autoWait: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/FilterbarCustomOperators/index.html";
	const aFilterFields = [
		{label: "Rank (Custom operator)"},
		{label: "First ascent (Custom operator)"}
	];

	const iValueMyNextDays = 100;
	const iSRange1 = 70;
	const iSRange2 = 2;
	const aUniversalDates = UniversalDateUtils.ranges.nextDays(iValueMyNextDays);
	const sDate1 = aUniversalDates[0].oDate.toISOString();
	const sDate2 = aUniversalDates[1].oDate.toISOString();

	const oCondition1 = {
		"rank": [
			{
				"operator": "SRANGE",
				"values": [
					iSRange1,
					iSRange2
				],
				"validated": "NotValidated"
			}
		]
	};

	const oPretty1 = {
		"aFilters": [
			{
				"sPath": "rank",
				"sOperator": "BT",
				"oValue1": iSRange1 - iSRange2,
				"oValue2": iSRange1 + iSRange2
			}
		]
	};

	const oCondition2 = {
		"first_ascent": [
			{
				"operator": "MYNEXTDAYS",
				"values": [iValueMyNextDays],
				"validated": "NotValidated"
			}
		]
	};

	const oPretty2 = {
		"aFilters": [
			{
				"aFilters": [
					{
						"sPath": "rank",
						"sOperator": "BT",
						"oValue1": iSRange1 - iSRange2,
						"oValue2": iSRange1 + iSRange2
					}
				]
			},
			{
				"sPath": "first_ascent",
				"sOperator": "BT",
				"oValue1": sDate1,
				"oValue2": sDate2
			}
		],
		"bAnd": true
	};

	opaTest("All FilterFields are properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheMDCFilterBar.iShouldSeeTheFilterBar();
		Then.onTheMDCFilterBar.iShouldSeeTheFilterFieldsWithLabels(aFilterFields.map((oFilterField) => oFilterField.label), { showAdaptFiltersButton: false });
	});

	opaTest(`"rank" FilterField works`, function (Given, When, Then) {
		const oCurrentFilterField = aFilterFields[0];
		// eslint-disable-next-line max-nested-callbacks
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(oCurrentFilterField, "70+-2");
		When.iPressKeyOnTheFilterField(oCurrentFilterField, KeyCodes.ENTER);
		Then.iShouldSeeConditons("sap.ui.mdc.FilterBar", oCondition1);
		Then.onTheApp.iShouldSeeACodeEditorWithContent(JSON.stringify(oCondition1, "\t", 4), "__editor0");
		Then.onTheApp.iShouldSeeACodeEditorWithContent(JSON.stringify(oPretty1, "\t", 4), "__editor1");
	});

	opaTest(`"first_ascent" FilterField works`, function (Given, When, Then) {
		const oCurrentFilterField = aFilterFields[1];
		// eslint-disable-next-line max-nested-callbacks
		When.onTheMDCFilterField.iEnterTextOnTheFilterField(oCurrentFilterField, "n100");
		When.iPressKeyOnTheFilterField(oCurrentFilterField, KeyCodes.ENTER);
		Then.iShouldSeeConditons("sap.ui.mdc.FilterBar", {...oCondition1, ...oCondition2});
		Then.onTheApp.iShouldSeeACodeEditorWithContent(JSON.stringify({...oCondition1, ...oCondition2}, "\t", 4), "__editor0");
		Then.onTheApp.iShouldSeeACodeEditorWithContent(JSON.stringify(oPretty2, "\t", 4), "__editor1");
		Then.iTeardownMyApp();
	});
});