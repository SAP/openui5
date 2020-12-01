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

	opaTest("When I hide the FilterFields, I should not be able to use them", function (Given, When, Then) {
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		When.iChangeAdaptFiltersView("sap-icon://group-2");

		Then.thePersonalizationDialogOpens(false);
		Then.iShouldSeeAdaptFiltersTitle(Arrangement.P13nDialog.Titles.adaptFilter);

		When.iPressButtonWithText("Hide Values");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists", true);

		When.iTogglePanelInDialog("Artists");
		When.iTogglePanelInDialog("Countries");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries"], "Countries", true);

		When.iTogglePanelInDialog("Countries");
		When.iTogglePanelInDialog("Countries_texts");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries_texts"], "Countries_texts", true);

		When.iTogglePanelInDialog("Countries_texts");
		When.iTogglePanelInDialog("Regions");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Regions"], "Regions", true);

		When.iTogglePanelInDialog("Regions");
		When.iTogglePanelInDialog("Cities");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Cities"], "Cities", true);

		When.iTogglePanelInDialog("Cities");

		When.iPressDialogOk();
	});

	opaTest("When I show/hide the FilterFields, I should be able to toggle their visibility", function (Given, When, Then) {
		When.iPressButtonWithText(Arrangement.P13nDialog.AdaptFilter.button);
		When.iChangeAdaptFiltersView("sap-icon://group-2");

		Then.thePersonalizationDialogOpens(false);
		Then.iShouldSeeAdaptFiltersTitle(Arrangement.P13nDialog.Titles.adaptFilter);

		When.iPressButtonWithText("Show Values");

		When.iTogglePanelInDialog("Artists");
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists", false);
		When.iTogglePanelInDialog("Countries");
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries"], "Countries", false);
		When.iTogglePanelInDialog("Countries_texts");
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries_texts"], "Countries_texts", false);
		When.iTogglePanelInDialog("Regions");
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Regions"], "Regions", false);
		When.iTogglePanelInDialog("Cities");
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Cities"], "Cities", false);

		When.iPressButtonWithText("Hide Values");

		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Artists"], "Artists", true);
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries"], "Countries", true);
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Countries_texts"], "Countries_texts", true);
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Regions"], "Regions", true);
		Then.iShouldSeeP13nFilterItemsInPanel(oFilterItems["Cities"], "Cities", true);

		Then.iTeardownMyAppFrame();
	});

});
