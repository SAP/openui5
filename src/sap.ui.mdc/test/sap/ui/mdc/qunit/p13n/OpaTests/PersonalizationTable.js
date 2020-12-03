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

	var aTableItems = [
		{p13nItem: "Name", selected: true},
		{p13nItem: "Founding Year", selected: true},
		{p13nItem: "Changed By", selected: true},
		{p13nItem: "Created On", selected: true},
		{p13nItem: "artistUUID", selected: false},
		{p13nItem: "Breakout Year", selected: false},
		{p13nItem: "Changed On", selected: false},
		{p13nItem: "cityOfOrigin_city", selected: false},
		{p13nItem: "Country", selected: false},
		{p13nItem: "Created (Complex)", selected: false},
		{p13nItem: "Created By", selected: false},
		{p13nItem: "regionOfOrigin_code", selected: false}
	];

	var aSortItems = [
		{p13nItem: "artistUUID", selected: false},
		{p13nItem: "Breakout Year", selected: false},
		{p13nItem: "Changed By", selected: false},
		{p13nItem: "Changed On", selected: false},
		{p13nItem: "cityOfOrigin_city", selected: false},
		{p13nItem: "Country", selected: false},
		{p13nItem: "Created By", selected: false},
		{p13nItem: "Created On", selected: false},
		{p13nItem: "Founding Year", selected: false},
		{p13nItem: "Name", selected: false},
		{p13nItem: "regionOfOrigin_code", selected: false}
	];

	var aFilterItems = [
		{p13nItem: "artistUUID", value: null},
		{p13nItem: "Breakout Year", value: null},
		{p13nItem: "Changed By", value: null},
		{p13nItem: "Changed On", value: null},
		{p13nItem: "cityOfOrigin_city", value: null},
		{p13nItem: "Country", value: null},
		{p13nItem: "Created By", value: null},
		{p13nItem: "Created On", value: null},
		{p13nItem: "Founding Year", value: null},
		{p13nItem: "Name", value: null},
		{p13nItem: "regionOfOrigin_code", value: null}
	];

	opaTest("When I start the 'appUnderTestTable' app, the table should appear and contain some columns", function (Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		Given.enableAndDeleteLrepLocalStorage();
		When.iLookAtTheScreen();

		//check icons
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I press on 'Add/Remove Columns' button, the table-specific-dialog opens", function (Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.columns);

		Then.iShouldSeeP13nItems(aTableItems);
	});

	opaTest("Open the filter personalization dialog", function (Given, When, Then) {
		//close popover
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Back) : When.iPressDialogOk();

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.filter);

		Then.iShouldSeeP13nFilterItems(aFilterItems);
	});

	opaTest("When I close the 'Add/Remove Columns' button, the table has not been changed", function (Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		//check dirty flag
		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I press on 'Define Sort Properties' button, sort dialog should open", function (Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.sort);

		Then.iShouldSeeP13nItems(aSortItems);

	});

	opaTest("When I close the 'Define Sort Properties' button, the table has not been changed", function (Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		//check dirty flag
		Then.theVariantManagementIsDirty(false);
	});

	// ----------------------------------------------------------------
	// Define a new sorter
	// ----------------------------------------------------------------
	opaTest("When I press on the Checkbox to sort for Country, the table should be changed", function (Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.sort);
		When.iSelectColumn("Country", Arrangement.P13nDialog.Titles.sort, aSortItems);

		Then.iShouldSeeP13nItems(aSortItems);
	});

	opaTest("When I close the 'Selected Columns' button, the table has been changed", function (Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		//check dirty flag
		Then.theVariantManagementIsDirty(true);
	});

	// ----------------------------------------------------------------
	// Move a Column to the top
	// ----------------------------------------------------------------
	opaTest("When I select the 'Country' column and move it to the top, the table should be changed", function (Given, When, Then) {

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Country", Arrangement.P13nDialog.Titles.columns, aTableItems);

		When.iPressButtonWithText("Reorder");
		When.iClickOnTableItem("Country").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);

		Then.iShouldSeeP13nItem("Country", 0);
		Then.iShouldSeeP13nItem("Name", 1);
		Then.iShouldSeeP13nItem("Founding Year", 2);
		Then.iShouldSeeP13nItem("Changed By", 3);
		Then.iShouldSeeP13nItem("Created On", 4);
	});

	// ----------------------------------------------------------------
	// Select two columns and 'Cancel'
	// ----------------------------------------------------------------
	opaTest("When I do some changes and press 'Cancel', the changes should be discarded", function (Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Breakout Year", Arrangement.P13nDialog.Titles.columns, aTableItems);
		When.iSelectColumn("Created By", Arrangement.P13nDialog.Titles.columns, aTableItems);

		When.iPressButtonWithText("Reorder");
		When.iClickOnTableItem("Breakout Year").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);
		When.iClickOnTableItem("Created By").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);

		//Cancel selection
		When.iPressDialogCancel();

		//Reopen Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		//check that Table is unchanged
		Then.iShouldSeeP13nItem("Country", 0);
		Then.iShouldSeeP13nItem("Name", 1);
		Then.iShouldSeeP13nItem("Founding Year", 2);
		Then.iShouldSeeP13nItem("Changed By", 3);
		Then.iShouldSeeP13nItem("Created On", 4);

	});

	// ----------------------------------------------------------------
	// Select two columns and 'Escape' and reopen to check
	// ----------------------------------------------------------------
	opaTest("When I do some changes and press 'Escape', the changes should be discarded + Dialog should open again", function (Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Breakout Year", Arrangement.P13nDialog.Titles.columns, aTableItems);
		When.iSelectColumn("Created By", Arrangement.P13nDialog.Titles.columns, aTableItems);

		When.iPressButtonWithText("Reorder");
		When.iClickOnTableItem("Breakout Year").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);
		When.iClickOnTableItem("Created By").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);

		//Cancel selection
		When.iPressEscapeInDialog();

		//Reopen Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		//check that Table is unchanged
		Then.iShouldSeeP13nItem("Country", 0);
		Then.iShouldSeeP13nItem("Name", 1);
		Then.iShouldSeeP13nItem("Founding Year", 2);
		Then.iShouldSeeP13nItem("Changed By", 3);
		Then.iShouldSeeP13nItem("Created On", 4);

	});

	// ----------------------------------------------------------------
	// Select two columns and 'Confirm'
	// ----------------------------------------------------------------
	opaTest("When I select two additional columns and move them one up, the table should be changed", function (Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Breakout Year", Arrangement.P13nDialog.Titles.columns, aTableItems);
		When.iSelectColumn("Created By", Arrangement.P13nDialog.Titles.columns, aTableItems);

		When.iPressButtonWithText("Reorder");
		When.iClickOnTableItem("Breakout Year").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);
		When.iClickOnTableItem("Created By").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);

		Then.iShouldSeeP13nItem("Created By", 0);
		Then.iShouldSeeP13nItem("Breakout Year", 1);
		Then.iShouldSeeP13nItem("Country", 2);
		Then.iShouldSeeP13nItem("Name", 3);
		Then.iShouldSeeP13nItem("Founding Year", 4);
		Then.iShouldSeeP13nItem("Changed By", 5);
		Then.iShouldSeeP13nItem("Created On", 6);

	});

	// ----------------------------------------------------------------
	// Close the dialog
	// ----------------------------------------------------------------
	opaTest("Close the dialog", function (Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();
	});

	// ----------------------------------------------------------------
	// Reopen the dialog to see if it the items have been rearranged
	// ----------------------------------------------------------------
	opaTest("Reopen the dialog to see if it the items have been rearranged", function (Give, When, Then) {
		//Reopen the dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.columns);

		aTableItems = [
			{p13nItem: "Created By", selected: true},
			{p13nItem: "Breakout Year", selected: true},
			{p13nItem: "Country", selected: true},
			{p13nItem: "Name", selected: true},
			{p13nItem: "Founding Year", selected: true},
			{p13nItem: "Changed By", selected: true},
			{p13nItem: "Created On", selected: true},
			{p13nItem: "artistUUID", selected: false},
			{p13nItem: "Changed On", selected: false},
			{p13nItem: "cityOfOrigin_city", selected: false},
			{p13nItem: "Created (Complex)", selected: false},
			{p13nItem: "regionOfOrigin_code", selected: false}
		];

		Then.iShouldSeeP13nItems(aTableItems);

	});

	// ----------------------------------------------------------------
	// Check the 'Reorder' / 'Select' functionality
	// ----------------------------------------------------------------
	opaTest("check 'Reorder' mode", function (Given, When, Then) {
		//Reorder table items
		When.iPressButtonWithText("Reorder");
		Then.iShouldSeeP13nItem("Created By", 0);
		Then.iShouldSeeP13nItem("Breakout Year", 1);
		Then.iShouldSeeP13nItem("Country", 2);
		Then.iShouldSeeP13nItem("Name", 3);
		Then.iShouldSeeP13nItem("Founding Year", 4);
		Then.iShouldSeeP13nItem("Changed By", 5);
		Then.iShouldSeeP13nItem("Created On", 6);
	});

	opaTest("check 'Select' mode", function (Given, When, Then) {
		//Select table items
		When.iPressButtonWithText("Select");
		Then.iShouldSeeP13nItems(aTableItems);
	});

	opaTest("check column header sort functionality: all previous sorters are deleted", function (Given, When, Then) {
		//close popover
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		When.iClickOnColumn("Founding Year");
		When.iSortCurrentOpenColumnContextMenu();

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		Then.thePersonalizationDialogOpens();

		aSortItems = [
			{p13nItem: "Founding Year", selected: true},
			{p13nItem: "artistUUID", selected: false},
			{p13nItem: "Breakout Year", selected: false},
			{p13nItem: "Changed By", selected: false},
			{p13nItem: "Changed On", selected: false},
			{p13nItem: "cityOfOrigin_city", selected: false},
			{p13nItem: "Country", selected: false},
			{p13nItem: "Created By", selected: false},
			{p13nItem: "Created On", selected: false},
			{p13nItem: "Name", selected: false},
			{p13nItem: "regionOfOrigin_code", selected: false}
		];

		Then.iShouldSeeP13nItems(aSortItems);
	});

	opaTest("sort another column via context menu: only new column should be sorted", function (Given, When, Then) {
		//close popover
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		When.iClickOnColumn("Name");
		When.iSortCurrentOpenColumnContextMenu();

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		Then.thePersonalizationDialogOpens();

		aSortItems = [
			{p13nItem: "Name", selected: true},
			{p13nItem: "artistUUID", selected: false},
			{p13nItem: "Breakout Year", selected: false},
			{p13nItem: "Changed By", selected: false},
			{p13nItem: "Changed On", selected: false},
			{p13nItem: "cityOfOrigin_city", selected: false},
			{p13nItem: "Country", selected: false},
			{p13nItem: "Created By", selected: false},
			{p13nItem: "Created On", selected: false},
			{p13nItem: "Founding Year", selected: false},
			{p13nItem: "regionOfOrigin_code", selected: false}
		];

		Then.iShouldSeeP13nItems(aSortItems);
	});

	opaTest("Open the filter personalization dialog", function (Given, When, Then) {
		//close popover
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Back) : When.iPressDialogOk();

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.filter);

		Then.iShouldSeeP13nFilterItems(aFilterItems);
	});

	opaTest("Open the filter personalization dialog and enter a value", function (Given, When, Then) {
		//close popover
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Back) : When.iPressDialogOk();

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.filter);

		When.iEnterTextInFilterDialog("Founding Year", "1989");
		When.iEnterTextInFilterDialog("Country", "DE");

		aFilterItems[5].value = ["DE"];
		aFilterItems[8].value = ["1989"];

		Then.iShouldSeeP13nFilterItems(aFilterItems);
	});

	opaTest("Close and open the filter dialog to check if the value is still there", function (Given, When, Then) {
		//close popover
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Back) : When.iPressDialogOk();

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.filter);

		Then.iShouldSeeP13nFilterItem({
			itemText: "Country",
			index: 5,
			values: ["DE"]
		});
		Then.iShouldSeeP13nFilterItem({
			itemText: "Founding Year",
			index: 8,
			values: ["1989"]
		});

		//shut down app frame for next test
		Then.iTeardownMyAppFrame();
	});
});
