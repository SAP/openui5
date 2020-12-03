sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'sap/ui/Device'
], function (Opa5, opaTest, Arrangement, TestUtil, Action, Assertion, Device) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/mdc");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view.",
		autoWait: true
	});

	var oFilterItems = {
		"Artists": [
			{p13nItem: "artistUUID", selected: true},
			{p13nItem: "Breakout Year", selected: true},
			{p13nItem: "cityOfOrigin_city", selected: false},
			{p13nItem: "Country", selected: false},
			{p13nItem: "Founding Year", selected: true},
			{p13nItem: "Name", selected: true},
			{p13nItem: "regionOfOrigin_code", selected: false}
		],
		"Countries": [
			{p13nItem: "Country Country Code", selected: false},
			{p13nItem: "Country Description", selected: false},
			{p13nItem: "Country Name", selected: false}
		],
		"Countries_texts": [
			{p13nItem: "Localized Country Code", selected: false},
			{p13nItem: "Localized Description", selected: false},
			{p13nItem: "Localized locale", selected: false},
			{p13nItem: "Localized Name", selected: false}
		],
		"Regions": [
			{p13nItem: "Region Country", selected: false},
			{p13nItem: "Region Region Code", selected: false},
			{p13nItem: "Region Region Name", selected: false}
		],
		"Cities": [
			{p13nItem: "City Code", selected: false},
			{p13nItem: "City Name", selected: false},
			{p13nItem: "Country Code", selected: false},
			{p13nItem: "Region Code", selected: false}
		]
	};


	opaTest("When I start the 'appUnderTestTable' app, the FilterBar should appear", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		Given.enableAndDeleteLrepLocalStorage();
		When.iLookAtTheScreen();

		//check buttons
		Then.iShouldSeeButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		Then.iShouldSeeButtonWithText(Arrangement.P13nDialog.AdaptFilter.go);

		//check initially visible FilterFields
		Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year"]);

		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I press on 'Adapt Filters' button, the 'Adapt Filters' Dialog opens", function (Given, When, Then) {
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		When.iChangeAdaptFiltersView("sap-icon://group-2");

		Then.thePersonalizationDialogOpens(false);
		Then.iShouldSeeAdaptFiltersTitle(Arrangement.P13nDialog.Titles.adaptFilter);

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists");

		When.iTogglePanelInDialog("Artists");
		When.iTogglePanelInDialog("Countries");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries"], "Countries");

		When.iTogglePanelInDialog("Countries");
		When.iTogglePanelInDialog("Countries_texts");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries_texts"], "Countries_texts");

		When.iTogglePanelInDialog("Countries_texts");
		When.iTogglePanelInDialog("Regions");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Regions"], "Regions");

		When.iTogglePanelInDialog("Regions");
		When.iTogglePanelInDialog("Cities");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Cities"], "Cities");

		When.iTogglePanelInDialog("Cities");
	});

	opaTest("When I close the 'Adapt Filters' button, the FilterBar has not been changed", function (Given, When, Then) {
		When.iPressDialogOk();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

		//check initially visible FilterFields
		Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year"]);

		//check dirty flag
		Then.theVariantManagementIsDirty(false);
	});


	// ----------------------------------------------------------------
	// Define new FilterFields
	// ----------------------------------------------------------------
	opaTest("When I press on 'Adapt Filters' button, I change the FilterField selection", function (Given, When, Then) {
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);

		Then.thePersonalizationDialogOpens(false);

		When.iTogglePanelInDialog("Artists");

		When.iSelectColumn("Country", null, oFilterItems["Artists"], true, true);
		When.iSelectColumn("cityOfOrigin_city", null, oFilterItems["Artists"], true, true);

		oFilterItems["Artists"][2].selected = true;
		oFilterItems["Artists"][3].selected = true;

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists");

		When.iPressDialogOk();

		Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city", "Country"]);

		//check dirty flag
		Then.theVariantManagementIsDirty(true);
	});

	// ----------------------------------------------------------------
	// Move a FilterField to the top
	// ----------------------------------------------------------------
	opaTest("When I select the 'Country' column and move it to the top, the FilterBar should be changed", function (Given, When, Then) {
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		When.iChangeAdaptFiltersView("sap-icon://list");
		When.iClickOnTableItem("Country").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);

		var aCurrentFilterItems = [
			{p13nItem: "Country", selected: true},
			{p13nItem: "Name", selected: true},
			{p13nItem: "Founding Year", selected: true},
			{p13nItem: "artistUUID", selected: true},
			{p13nItem: "Breakout Year", selected: true},
			{p13nItem: "cityOfOrigin_city", selected: true}
		];

		Then.iShouldSeeP13nItems(aCurrentFilterItems);

		When.iPressDialogOk();
	});

	opaTest("The List view order should not affect the group view", function (Given, When, Then) {
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		When.iChangeAdaptFiltersView("sap-icon://group-2");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists");

		When.iTogglePanelInDialog("Artists");
		When.iTogglePanelInDialog("Countries");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries"], "Countries");

		When.iTogglePanelInDialog("Countries");
		When.iTogglePanelInDialog("Countries_texts");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries_texts"], "Countries_texts");

		When.iTogglePanelInDialog("Countries_texts");
		When.iTogglePanelInDialog("Regions");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Regions"], "Regions");

		When.iTogglePanelInDialog("Regions");
		When.iTogglePanelInDialog("Cities");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Cities"], "Cities");

		When.iTogglePanelInDialog("Cities");

		When.iPressDialogOk();
	});

	// ----------------------------------------------------------------
	// Check view toggle
	// ----------------------------------------------------------------
	opaTest("When toggling to list view to select filters and switch back the filters should be selected in both view modes", function(Given, When, Then){
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		When.iChangeAdaptFiltersView("sap-icon://list");

		When.iSelectColumn("Localized Country Code", null, null, true);

		oFilterItems["Countries_texts"][0].selected = true;

		When.iChangeAdaptFiltersView("sap-icon://group-2");

		When.iTogglePanelInDialog("Artists");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists");

		When.iTogglePanelInDialog("Artists");
		When.iTogglePanelInDialog("Countries");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries"], "Countries");

		When.iTogglePanelInDialog("Countries");
		When.iTogglePanelInDialog("Countries_texts");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries_texts"], "Countries_texts");

		When.iTogglePanelInDialog("Countries_texts");
		When.iTogglePanelInDialog("Regions");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Regions"], "Regions");

		When.iTogglePanelInDialog("Regions");
		When.iTogglePanelInDialog("Cities");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Cities"], "Cities");

		When.iTogglePanelInDialog("Cities");
		When.iTogglePanelInDialog("Artists");

		When.iPressDialogOk();
	});

	// ----------------------------------------------------------------
	// Define new FilterFields
	// ----------------------------------------------------------------
	opaTest("Recheck Dialog on reopening and add/remove some more FilterFields", function (Given, When, Then) {

		//check dirty flag
		Then.theVariantManagementIsDirty(true);

		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		Then.thePersonalizationDialogOpens(false);

		//deselect a FilterField
		When.iSelectColumn("Country", null, oFilterItems["Artists"], true, true);
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists");

		When.iPressDialogOk();

		Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city", "Localized Country Code"]);

		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);

		//Select FilterField from different group
		When.iTogglePanelInDialog("Artists");
		When.iTogglePanelInDialog("Countries");
		When.iSelectColumn("Country Name", null, oFilterItems["Artists"], true, true);
		oFilterItems["Countries"][2].selected = true;

		When.iPressDialogOk();
		Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city", "Localized Country Code", "Country Name"]);
	});


	// ----------------------------------------------------------------
	// Enter some values in Adapt Filters Dialog
	// ----------------------------------------------------------------
	opaTest("Open the filter personalization dialog and enter some values", function (Given, When, Then) {
		//open dialig
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		Then.thePersonalizationDialogOpens(false);

		//Go to "Artists" and enter a value
		When.iTogglePanelInDialog("Countries");
		When.iTogglePanelInDialog("Artists");
		When.iEnterTextInFilterDialog("Founding Year", "1989");
		oFilterItems["Artists"][4].value = ["1989"];

		//Go to "Countries" and enter a value
		When.iTogglePanelInDialog("Artists");
		When.iTogglePanelInDialog("Countries");
		When.iEnterTextInFilterDialog("Country Name", "DE");
		oFilterItems["Countries"][2].value = ["DE"];
	});

	opaTest("When I close the 'Adapt Filters' button, the FilterBar has not been changed", function (Given, When, Then) {
		When.iPressDialogOk();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

		//check initially visible FilterFields
		Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city", "Localized Country Code", "Country Name"]);

		//check dirty flag
		Then.theVariantManagementIsDirty(true);
	});

	opaTest("Reopen Dialog to check values", function (Given, When, Then) {
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.getButtonCountText(2));

		//recheck values upon opening
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries"], "Countries");
		When.iTogglePanelInDialog("Countries");
		When.iTogglePanelInDialog("Artists");
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists");

		//shut down app frame for next test
		Then.iTeardownMyAppFrame();
	});

	opaTest("When I start the 'appUnderTestTable' app, the FilterBar should be toggled to not persist values (modify p13nMode)", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		When.iLookAtTheScreen();

		When.iSetP13nMode("sap.ui.mdc.FilterBar", ["Item"]);

		//open dialig
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		When.iChangeAdaptFiltersView("sap-icon://group-2");
		Then.thePersonalizationDialogOpens(false);

		//Go to "Artists" and enter a value
		When.iEnterTextInFilterDialog("Founding Year", "1989");
		oFilterItems["Artists"][4].value = ["1989"];

		When.iPressDialogOk();

		//check dirty flag
		Then.theVariantManagementIsDirty(false);

		Then.iTeardownMyAppFrame();
	});

	// ----------------------------------------------------------------
	// Prepare dirty changes for reset tests
	// ----------------------------------------------------------------
	opaTest("When I start the 'appUnderTestTable' app and create new p13n changes - create some changes", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		When.iLookAtTheScreen();

		When.iSetP13nMode("sap.ui.mdc.FilterBar", ["Item","Value"]);

		//open dialig
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		When.iChangeAdaptFiltersView("sap-icon://group-2");
		Then.thePersonalizationDialogOpens(false);

		//Go to "Artists" and enter a value
		When.iEnterTextInFilterDialog("Founding Year", "1989");
		When.iSelectColumn("Country", null, oFilterItems["Artists"], true, true);
		oFilterItems["Artists"][4].value = ["1989"];
		oFilterItems["Artists"][2].selected = false;//needs to be reset due to prior test

		When.iPressDialogOk();

		//check dirty flag
		Then.theVariantManagementIsDirty(true);

	});

	// ----------------------------------------------------------------
	// Cancel Reset (Standard variant) --> no changes reverted
	// ----------------------------------------------------------------
	opaTest("Press reset and cancel - no changes expected", function(Given, When, Then){

		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.getButtonCountText(1));
		When.iPressResetInDialog();
		When.iCancelResetWarning();

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists");

		When.iPressDialogOk();
	});

	// ----------------------------------------------------------------
	// Confirm Reset (Standard variant) --> dirty changes reverted
	// ----------------------------------------------------------------
	opaTest("Press reset and confirm - reset should revert the changes based on the current variant", function(Given, When, Then){

		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.getButtonCountText(1));
		When.iPressResetInDialog();
		When.iConfirmResetWarning();

		oFilterItems["Artists"][4].value = undefined;
		oFilterItems["Artists"][3].selected = false;
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists");

		When.iPressDialogOk();

		Then.iTeardownMyAppFrame();
	});

});
