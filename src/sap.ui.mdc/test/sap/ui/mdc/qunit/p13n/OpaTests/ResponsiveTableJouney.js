sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary'
], function (Opa5, opaTest, Arrangement, TestUtil, Action, Assertion, TestLibrary) {
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

	var aTableItems = [
		{p13nItem: "Name", selected: true},
		{p13nItem: "Founding Year", selected: true},
		{p13nItem: "Changed By", selected: true},
		{p13nItem: "Created On", selected: true},
		{p13nItem: "artistUUID", selected: false},
		{p13nItem: "Breakout Year", selected: false},
		{p13nItem: "Changed On", selected: false},
		{p13nItem: "City of Origin", selected: false},
		{p13nItem: "Country", selected: false},
		{p13nItem: "Created (Complex)", selected: false},
		{p13nItem: "Created By", selected: false},
		{p13nItem: "regionOfOrigin_code", selected: false}
	];

	opaTest("When I start the 'appUnderTestTable' app, the table should appear and contain some columns", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?view=Responsive',
			autoWait: true
		});
		When.iLookAtTheScreen();

		//check icons
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt", "artistUUID", "breakupYear", "created_complex", "cityOfOrigin_city", "regionOfOrigin_code"
		]);

		Then.theVariantManagementIsDirty(false);
	});

	// ----------------------------------------------------------------
	// Add a Column to the table
	// ----------------------------------------------------------------
	opaTest("Select a column from column header menu", function (Given, When, Then) {
		When.iClickOnColumn("Name", true);
		Then.iShouldSeeOneColumnMenu();
		When.iPressOnColumnMenuItem(Arrangement.P13nDialog.Titles.columns);
		When.iSelectColumnFromColumnMenu("Country", undefined, aTableItems);

		When.iConfirmColumnMenuItemContent();
		Then.iShouldSeeShowDetailsButtonWithShowDetailsKey();

		When.iSelectVariant("Standard");
		Then.iShouldSeeSelectedVariant("Standard");
	});

	opaTest("When I select the 'Country' column and press ok, the table should be changed", function (Given, When, Then) {

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Country", undefined, aTableItems);

		When.iPressDialogOk();

		Then.iShouldSeeShowDetailsButtonWithShowDetailsKey();

		When.iSelectVariant("Standard");
		Then.iShouldSeeSelectedVariant("Standard");
	});

	opaTest("When I remove 'Name' column and add 'Country' the showDetail button is not visible", function (Given, When, Then) {

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Name", undefined, aTableItems);
		When.iPressDialogOk();

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();
		When.iSelectColumn("Country", undefined, aTableItems);
		When.iPressDialogOk();
		Then.iShouldNotSeeShowDetailsButton();

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();
		When.iSelectColumn("Name", undefined, aTableItems);
		When.iPressDialogOk();
		Then.iShouldSeeShowDetailsButtonWithShowDetailsKey();

		Given.enableAndDeleteLrepLocalStorage();
		Then.iTeardownMyAppFrame();
	});

});
