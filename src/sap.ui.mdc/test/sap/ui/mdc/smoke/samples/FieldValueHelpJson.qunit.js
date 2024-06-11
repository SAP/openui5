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

	const oField = { id: "container-mdc.sample---sample--fieldSelectBuilding", input: "brq"};
	const oValueHelp = { id: "container-mdc.sample---sample--vhSelectBuilding" };
	const sTableId = "container-mdc.sample---sample--mdcTableBuildings";
	const aInputs = [
		{ id: "container-mdc.sample---sample--inSelectedBuildingId", values: ["ROT01", "ADL20", "BRQ02"] },
		{ id: "container-mdc.sample---sample--inSelectedBuildingName", values: ["ROT01-LCR", "ADL20-Regus Virtual Office", "BRQ02-Spielberk Brno"] },
		{ id: "container-mdc.sample---sample--selectedbuilding_address", values: ["Opelstraße 6, 68789 St. Leon-Rot", "25 Grenfell Street, 5000 Adelaide", "Holandska 2/4, 63900 Brno"] },
		{ id: "container-mdc.sample---sample--inSelectedBuildingLocation", values: ["St. Leon-Rot", "Adelaide", "Brno"] },
		{ id: "container-mdc.sample---sample--inSelectedBuildingCountry", values: ["Germany", "Australia", "Czech Republic"] }
	];
	const aFilterFields = [
		{ id: "container-mdc.sample---sample--ffCountry", label: "Country", value: "Australia" },
		{ id: "container-mdc.sample---sample--ffLocation", label: "Location", value: "Adelaide" }
	];
	const oPopover = {
		id: "__popover0",
		value: "BRQ02-Spielberk Brno"
	};

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/FieldValueHelpJson/index.html";

	opaTest("All controls are properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheMDCField.iShouldSeeTheField(oField.id);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[0].id, aInputs[0].values[0]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[1].id, aInputs[1].values[0]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[2].id, aInputs[2].values[0]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[3].id, aInputs[3].values[0]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[4].id, aInputs[4].values[0]);
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

	opaTest(`Search on table works`, function (Given, When, Then) {
		When.onTheApp.iSearchOnValueHelpDialog(oValueHelp.id, "BUD");
		Then.onTheApp.iShouldSeeRows(sTableId, 6, false);
		When.onTheApp.iSearchOnValueHelpDialog(oValueHelp.id, "");
	});

	opaTest(`Selection via ValueHelp is changed correctly`, function (Given, When, Then) {
		When.onTheApp.iEnterTextOnFilterField(aFilterFields[0].id, aFilterFields[0].value);
		When.onTheApp.iEnterTextOnFilterField(aFilterFields[1].id, aFilterFields[1].value);
		When.onTheApp.iPressButtonOnValueHelpDialogWithText(oValueHelp.id, "filterbar.GO"); // Go button

		Then.onTheApp.iShouldSeeRows(sTableId, 1, false);
		When.onTheApp.iClickOnRow(sTableId, 0, false);

		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[0].id, aInputs[0].values[1]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[1].id, aInputs[1].values[1]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[2].id, aInputs[2].values[1]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[3].id, aInputs[3].values[1]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[4].id, aInputs[4].values[1]);
	});

	opaTest(`Selection via search works correctly`, function (Given, When, Then) {
		When.onTheApp.iEnterTextOnTheFieldWithFocus(oField.id, oField.input, false);
		When.onTheApp.iClickEntryInValueHelpPopover(oPopover.id, oPopover.value);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[0].id, aInputs[0].values[2]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[1].id, aInputs[1].values[2]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[2].id, aInputs[2].values[2]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[3].id, aInputs[3].values[2]);
		Then.onTheApp.iShouldSeeTheInputWithValue(aInputs[4].id, aInputs[4].values[2]);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});