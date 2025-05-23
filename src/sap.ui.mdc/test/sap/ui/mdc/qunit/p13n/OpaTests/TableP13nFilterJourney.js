sap.ui.define([
	'sap/ui/test/Opa5',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'sap/ui/Device',
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary',
	'test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Util',
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/TestObjects",
	'sap/ui/core/library'
], function (Opa5, Arrangement, TestUtil, Action, Assertion, Device, TestLibrary, TableTestUtil, TableTestObjects, coreLibrary) {
	'use strict';

	return function (opaTestOrSkip) {
		Opa5.extendConfig({
			arrangements: new Arrangement(),
			actions: new Action(),
			assertions: new Assertion(),
			viewNamespace: "view.",
			autoWait: true
		});

		const aAvailableFilters = ["artistUUID", "Breakout Year", "Changed By", "Changed On", "City of Origin", "Country", "Created By", "Created On", "Founding Year", "Name", "regionOfOrigin_code"];
		const sTableID = "IDTableOfInternalSampleApp_01";

		opaTestOrSkip("Open TableOpaApp", function (Given, When, Then) {
			//insert application
			Given.iStartMyAppInAFrame({
				source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
				autoWait: true
			});
			Given.enableAndDeleteLrepLocalStorage();
			When.iLookAtTheScreen();

			//check icons
			Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

			//check initially visible columns
			Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
				"name", "foundingYear", "modifiedBy", "createdAt"
			]);

			Then.theVariantManagementIsDirty(false);
		});

		opaTestOrSkip("Open the filter personalization dialog", function (Given, When, Then) {
			//Intially, all filters are available and no filters are set in Standard variant
			Then.onTheMDCTable.iCheckAvailableFilters(sTableID, aAvailableFilters);
			Then.onTheMDCTable.iCheckFilterPersonalization(sTableID, []);
		});

		opaTestOrSkip("Open the filter personalization dialog and enter a value", function (Given, When, Then) {

			//add two filters
			When.onTheMDCTable.iPersonalizeFilter(sTableID, [
				{key : "Founding Year", values: ["1989"], inputControl: "IDTableOfInternalSampleApp_01--filter--foundingYear"},
				{key : "Country", values: ["DE"], inputControl: "IDTableOfInternalSampleApp_01--filter--countryOfOrigin_code"}
			]);

			//reopen the dialog and assert filters
			Then.onTheMDCTable.iCheckFilterPersonalization(sTableID, [
				{key : "Founding Year", values: ["1989"], inputControl: "IDTableOfInternalSampleApp_01--filter--foundingYear"},
				{key : "Country", values: ["DE"], inputControl: "IDTableOfInternalSampleApp_01--filter--countryOfOrigin_code"}
			]);

			//the combobox in the panel should NOT contain Country & Founding Year anymore
			Then.onTheMDCTable.iCheckAvailableFilters(sTableID, ["artistUUID", "Breakout Year", "Changed By", "Changed On", "City of Origin", "Created By", "Created On", "Name", "regionOfOrigin_code"]);

			//Clear all filters
			When.onTheMDCTable.iPersonalizeFilter(sTableID, []);
		});

		opaTestOrSkip("Cancel and open the filter dialog to check if the values have been discarded --> Correct values", function (Given, When, Then) {
			When.onTheMDCTable.iPersonalizeFilter(sTableID, [
				{key : "Founding Year", values: ["1989"], inputControl: "IDTableOfInternalSampleApp_01--filter--foundingYear"},
				{key : "Country", values: ["DE"], inputControl: "IDTableOfInternalSampleApp_01--filter--countryOfOrigin_code"}
			], undefined, true/** This flag will cancel the dialog instead of confirming it*/);

			//Dialog cancelled --> no filters added
			Then.onTheMDCTable.iCheckFilterPersonalization(sTableID, []);
			Then.onTheMDCTable.iCheckAvailableFilters(sTableID, aAvailableFilters);
		});


		opaTestOrSkip("Open dialog, enter filter, open column menu, reopen dialog --> check that value is still shown", function (Given, When, Then) {

			//Enter filter values via settings p13n dialog
			When.onTheMDCTable.iPersonalizeFilter(sTableID, [
				{key : "Founding Year", values: ["1989"], inputControl: "IDTableOfInternalSampleApp_01--filter--foundingYear"},
				{key : "Country", values: ["DE"], inputControl: "IDTableOfInternalSampleApp_01--filter--countryOfOrigin_code"}
			]);

			//open column menu
			When.onTheAppMDCTable.iPressOnColumnHeader(sTableID, "Founding Year");
			Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
			Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuQuickActions(3);
			Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuItems(0);
			When.onTheAppMDCTable.iCloseTheColumnMenu();

			//recheck filter dialog
			Then.onTheMDCTable.iCheckFilterPersonalization(sTableID, [
				{key : "Founding Year", values: ["1989"], inputControl: "IDTableOfInternalSampleApp_01--filter--foundingYear"},
				{key : "Country", values: ["DE"], inputControl: "IDTableOfInternalSampleApp_01--filter--countryOfOrigin_code"}
			]);

			//Clear all filters
			When.onTheMDCTable.iPersonalizeFilter(sTableID, []);
		});

		opaTestOrSkip("Cancel and open the filter dialog to check if the values have been discarded --> Erroneous values", function (Given, When, Then) {
			When.onTheMDCTable.iPersonalizeFilter(sTableID, [
				{key : "artistUUID", values: ["asd"], inputControl: "IDTableOfInternalSampleApp_01--filter--artistUUID"}
			], undefined, true/** This flag will cancel the dialog instead of confirming it*/);

			//Dialog cancelled --> no filters added
			Then.onTheMDCTable.iCheckFilterPersonalization(sTableID, []);
			Then.onTheMDCTable.iCheckAvailableFilters(sTableID, aAvailableFilters);
		});

		opaTestOrSkip("Open dialog via the column menu should preselect column related filters", function (Given, When, Then) {
			When.onTheAppMDCTable.iPressOnColumnHeader(sTableID, "Founding Year");
			Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
			When.onTheAppMDCTable.iPressTableSettingsButton();
			Then.P13nAssertions.iShouldSeeTheP13nDialog();
			When.P13nActions.iSwitchToP13nTab("Filter");
			Then.P13nAssertions.iShouldSeeFiltersInPanel(["Founding Year"]);

			When.P13nActions.iPressDialogOk();
			When.onTheAppMDCTable.iOpenP13nDialog();
			Then.P13nAssertions.iShouldSeeTheP13nDialog();

			When.P13nActions.iSwitchToP13nTab("Filter");
			Then.P13nAssertions.iShouldSeeFiltersInPanel([]);

			//shut down app frame for next test
			Given.enableAndDeleteLrepLocalStorage();
			Then.iTeardownMyAppFrame();
		});
	};

});
