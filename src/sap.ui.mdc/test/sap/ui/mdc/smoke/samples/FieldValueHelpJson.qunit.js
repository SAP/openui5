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

	const oField = { id: "container-mdc.sample---sample--fieldSelectBuilding"};
	const oValueHelp = { id: "container-mdc.sample---sample--vhSelectBuilding" };
	const sTableId = "container-mdc.sample---sample--mdcTableBuildings";
	const aInputs = [
		{ id: "container-mdc.sample---sample--inSelectedBuildingId", value: "ROT01", newValue: "ADL20" },
		{ id: "container-mdc.sample---sample--inSelectedBuildingName", value: "ROT01-LCR", newValue: "ADL20-Regus Virtual Office" },
		{ id: "container-mdc.sample---sample--selectedbuilding_address", value: "Opelstraße 6, 68789 St. Leon-Rot", newValue: "25 Grenfell Street, 5000 Adelaide" },
		{ id: "container-mdc.sample---sample--inSelectedBuildingLocation", value: "St. Leon-Rot", newValue: "Adelaide" },
		{ id: "container-mdc.sample---sample--inSelectedBuildingCountry", value: "Germany", newValue: "Australia" }
	];
	const aFilterFields = [
		{ id: "container-mdc.sample---sample--ffCountry", label: "Country", value: "Australia" },
		{ id: "container-mdc.sample---sample--ffLocation", label: "Location", value: "Adelaide" }
	];

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/FieldValueHelpJson/index.html";

	opaTest("All controls are properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheMDCField.iShouldSeeTheField(oField.id);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[0].id, aInputs[0].value);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[1].id, aInputs[1].value);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[2].id, aInputs[2].value);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[3].id, aInputs[3].value);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[4].id, aInputs[4].value);
		Opa5.assert.ok(true);
	});

	opaTest(`ValueHelp Dialog opens with FilterFields`, function (Given, When, Then) {
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(oField.id, "");
		When.onTheApp.iOpenTheValueHelpForField(oField.id);
		Then.onTheMDCValueHelp.iShouldSeeTheValueHelpDialog(oValueHelp.id);
		When.onTheApp.iPressButtonOnValueHelpDialogWithText(oValueHelp.id, "valuehelp.SHOWADVSEARCH"); // Show Filters button
		Then.onTheApp.iShouldSeeFilterField(aFilterFields[0].id);
		Then.onTheApp.iShouldSeeFilterField(aFilterFields[1].id);
	});

	opaTest(`Selection via ValueHelp is changed correctly`, function (Given, When, Then) {
		When.onTheApp.iEnterTextOnFilterField(aFilterFields[0].id, aFilterFields[0].value);
		When.onTheApp.iEnterTextOnFilterField(aFilterFields[1].id, aFilterFields[1].value);
		When.onTheApp.iPressButtonOnValueHelpDialogWithText(oValueHelp.id, "filterbar.GO"); // Go button

		Then.onTheApp.iShouldSeeRows(sTableId, 1, false);
		When.onTheApp.iClickOnRow(sTableId, 0, false);

		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[0].id, aInputs[0].newValue);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[1].id, aInputs[1].newValue);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[2].id, aInputs[2].newValue);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[3].id, aInputs[3].newValue);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[4].id, aInputs[4].newValue);
	});


	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});