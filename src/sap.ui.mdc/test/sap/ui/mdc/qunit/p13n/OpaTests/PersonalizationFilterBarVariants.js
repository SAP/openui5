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
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?sap-ui-xx-complexP13n=true');
		Given.enableAndDeleteLrepLocalStorage();
		When.iLookAtTheScreen();

		//check buttons
		Then.iShouldSeeButtonWithText("Adapt Filters");
		Then.iShouldSeeButtonWithText("Go");

		//check initially visible FilterFields
		Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year"]);

		Then.theVariantManagementIsDirty(false);
	});


	// ----------------------------------------------------------------
	// Define new FilterFields and enter values
	// ----------------------------------------------------------------
	opaTest("When I press on 'Adapt Filters' button, I change the FilterField selection", function (Given, When, Then) {
		When.iPressButtonWithText("Adapt Filters");
		Then.thePersonalizationDialogOpens(false);

		//add 2 new FilterFields
		When.iSelectColumn("Country", Arrangement.P13nDialog.Titles.adaptFilter, oFilterItems["Artists"], true, true);
		When.iSelectColumn("cityOfOrigin_city", Arrangement.P13nDialog.Titles.adaptFilter, oFilterItems["Artists"], true, true);
		oFilterItems["Artists"][3].selected = true;
		oFilterItems["Artists"][2].selected = true;

		//Enter some values
		When.iEnterTextInFilterDialog("Founding Year", "1989");
		oFilterItems["Artists"][4].value = ["1989"];
		When.iTogglePanelInDialog("Artists");
		When.iTogglePanelInDialog("Countries");
		When.iEnterTextInFilterDialog("Country Name", "DE");
		oFilterItems["Countries"][2].value = ["DE"];

		//close modal dialog
		When.iPressDialogOk();

		//check that variant is dirty
		Then.theVariantManagementIsDirty(true);

		//save as a new variant
		Then.iShouldSeeSelectedVariant("Standard");
		When.iSaveVariantAs("Standard", "FilterBarVariant");
		Then.iShouldSeeSelectedVariant("FilterBarVariant");

		//select a default variant
		When.iSelectDefaultVariant("FilterBarVariant");
		Then.iShouldSeeSelectedVariant("FilterBarVariant");

		//shut down app frame for next test
		Then.iTeardownMyAppFrame();

	});

	opaTest("When I start the 'appUnderTestTable' app, the current variant should affect the FilterBar", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?sap-ui-xx-complexP13n=true');
		When.iLookAtTheScreen();

		//check buttons
		Then.iShouldSeeButtonWithText("Adapt Filters (2)");
		Then.iShouldSeeButtonWithText("Go");

		//check initially visible FilterFields
		Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city", "Country"]);

		Then.theVariantManagementIsDirty(false);

		//check if the correct variant is selected
		Then.iShouldSeeSelectedVariant("FilterBarVariant");
	});

	opaTest("Recheck dialog", function (Given, When, Then) {
		When.iPressButtonWithText("Adapt Filters (2)");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists");
		When.iTogglePanelInDialog("Artists");
		When.iTogglePanelInDialog("Countries");
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries"], "Countries");

		//close modal dialog
		When.iPressDialogOk();
	});

	opaTest("When I switch back to standard variant I should see the default items", function (Given, When, Then) {
		//Select "Standard"
		When.iSelectVariant("Standard");

		//Check default FilterItems
		Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year"]);

		//check dialog + Filter values
		When.iPressButtonWithText("Adapt Filters");

		//Check "Countries" Panel
		oFilterItems["Countries"][2].value = null;
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries"], "Countries");

		//Check "Artists" Panel
		When.iTogglePanelInDialog("Countries");
		When.iTogglePanelInDialog("Artists");
		oFilterItems["Artists"][4].value = null;
		oFilterItems["Artists"][3].selected = false;
		oFilterItems["Artists"][2].selected = false;
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists");
	});

});
