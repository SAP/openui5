sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'sap/ui/Device',
	'test-resources/sap/ui/rta/integration/pages/Adaptation'
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


	// ----------------------------------------------------------------
	// initialize application
	// ----------------------------------------------------------------
	opaTest("When I start the 'appUnderTestTable' app, the FilterBar should appear and contain some items", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		When.iLookAtTheScreen();

		Then.theVariantManagementIsDirty(false);
	});

	// ----------------------------------------------------------------
	// start and enable RTA
	// ----------------------------------------------------------------
	opaTest("When I enable key user adaptation, the App should change into 'RTA' mode", function(Given, When, Then){
		When.iPressButtonWithText("Start RTA");
		Then.onPageWithRTA.iShouldSeeTheToolbar();
	});

	// ----------------------------------------------------------------
	// open RTA settings
	// ----------------------------------------------------------------
	opaTest("When I press on the FilterBar, the settings context menu opens", function (Given, When, Then) {
		When.iClickOnOverlayForControl("sap.ui.mdc.FilterBar");
		Then.onPageWithRTA.iShouldSeetheContextMenu();
		Then.onPageWithRTA.iShouldSeetheNumberOfContextMenuActions(3);
	});

	// ----------------------------------------------------------------
	// open Personalization dialog
	// ----------------------------------------------------------------
	opaTest("When I press on RTA settings icon the personalization dialog appears", function (Given, When, Then) {
		When.onPageWithRTA.iClickOnAContextMenuEntryWithIcon("sap-icon://key-user-settings");
		When.iChangeAdaptFiltersView("sap-icon://group-2");
		Then.iShouldSeeP13nFilterItem({
			itemText: "cityOfOrigin_city",
			index: 2
		});
		Then.iShouldSeeP13nFilterItem({
			itemText: "Country",
			index: 3
		});
	});

	// ----------------------------------------------------------------
	// open Personalization dialog
	// ----------------------------------------------------------------
	opaTest("When I select items and change values in the personalization dialog, the changes are reflected after confirmation", function (Given, When, Then) {
		When.iSelectColumn("Country", null, undefined, true, true);
		When.iSelectColumn("cityOfOrigin_city",null, undefined, true, true);
		When.iEnterTextInFilterDialog("Founding Year", "1989");
		When.iPressButtonWithText("OK");
		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeVisibleFiltersInOrderInFilterBar(["Name", "Founding Year", "artistUUID", "Breakout Year", "cityOfOrigin_city", "Country"]);
		Then.iShouldSeeConditionValuesInFilterBar(["1989"], "foundingYear");
	});

	opaTest("Quit RTA", function(Given, When, Then){
		//Quit RTA
		When.onPageWithRTA.iExitRtaMode();

		//Just to check that runtime Dialog opens again (no more overlays)
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		//close Dialog
		When.iPressDialogOk();
		Then.thePersonalizationDialogShouldBeClosed();

		//tear down app
		When.onPageWithRTA.enableAndDeleteLrepLocalStorageAfterRta();
		Then.iTeardownMyAppFrame();
	});
});
