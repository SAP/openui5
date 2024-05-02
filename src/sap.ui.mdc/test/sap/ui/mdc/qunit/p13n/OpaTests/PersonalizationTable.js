sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary'
], function(Opa5, opaTest, Arrangement, TestUtil, Action, Assertion, TestLibrary) {
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

	let aTableItems = [
		{ p13nItem: "Name", selected: true },
		{ p13nItem: "Founding Year", selected: true },
		{ p13nItem: "Changed By", selected: true },
		{ p13nItem: "Created On", selected: true },
		{ p13nItem: "artistUUID", selected: false },
		{ p13nItem: "Breakout Year", selected: false },
		{ p13nItem: "Changed On", selected: false },
		{ p13nItem: "City of Origin", selected: false },
		{ p13nItem: "City of Origin + Text", selected: false },
		{ p13nItem: "Country", selected: false },
		{ p13nItem: "Country + Text", selected: false },
		{ p13nItem: "Created (Complex)", selected: false },
		{ p13nItem: "Created By", selected: false },
		{ p13nItem: "regionOfOrigin_code", selected: false },
		{ p13nItem: "regionOfOrigin_code + Text", selected: false }
	];

	let aSortItems = [
		{ p13nItem: "artistUUID", descending: false },
		{ p13nItem: "Breakout Year", descending: false },
		{ p13nItem: "Changed By", descending: false },
		{ p13nItem: "Changed On", descending: false },
		{ p13nItem: "City of Origin", descending: false },
		{ p13nItem: "Country", descending: false },
		{ p13nItem: "Created By", descending: false },
		{ p13nItem: "Created On", descending: false },
		{ p13nItem: "Founding Year", descending: false },
		{ p13nItem: "Name", descending: false },
		{ p13nItem: "regionOfOrigin_code", descending: false }
	];

	const aAvailableFilters = ["artistUUID", "Breakout Year", "Changed By", "Changed On", "City of Origin", "Country", "Created By", "Created On", "Founding Year", "Name", "regionOfOrigin_code"];
	const sTableID = "IDTableOfInternalSampleApp_01";

	const sViewSettings = Arrangement.P13nDialog.Titles.settings;

	opaTest("When I start the 'appUnderTestTable' app, the table should appear and contain some columns", function(Given, When, Then) {
		//insert application
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		When.iLookAtTheScreen();

		//check icons
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I Resize the columns and save it as new variant", function(Given, When, Then) {
		When.iSimulateColumnResize("Name", "500px");
		When.iSaveVariantAs("Standard", "ColumnResizeVariant");
		When.iSelectDefaultVariant("ColumnResizeVariant");
		Then.iShouldSeeSelectedVariant("ColumnResizeVariant");

		Then.iTeardownMyAppFrame();
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		Then.iShouldSeeSelectedVariant("ColumnResizeVariant");
		Then.iShouldSeeTheUpdatedColumnWidth();
		When.iSelectVariant("Standard");
		Then.iShouldSeeSelectedVariant("Standard");
	});

	opaTest("When I press on 'Add/Remove Columns' button, the table-specific-dialog opens", function(Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(sViewSettings);

		Then.iShouldSeeP13nItems(aTableItems);

		//close dialog
		When.iPressDialogOk();
	});

	opaTest("Open the filter personalization dialog", function(Given, When, Then) {
		//Intially, all filters are available and no filters are set in Standard variant
		Then.onTheMDCTable.iCheckAvailableFilters(sTableID, aAvailableFilters);
		Then.onTheMDCTable.iCheckFilterPersonalization(sTableID, []);
	});

	opaTest("When I close the 'View Settings' dialog without doing changes, the table has not been changed", function(Given, When, Then) {
		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		//check dirty flag
		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I press on 'Sort' tab, sort p13n should show", function(Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		//open 'sort' tab
		When.iSwitchToP13nTab("Sort");

		//check that dialog is open
		Then.thePersonalizationDialogOpens();

		//open the select control in the sort tab
		When.iClickOnP13nSelect("");

		//check that the expected keys are visible in the sort dialog
		Then.iShouldSeeP13nMenuItems(aSortItems);

	});

	opaTest("When I close the view settings dialog on 'sort' tab, the table has not been changed", function(Given, When, Then) {

		//close dialog
		When.iPressDialogOk();
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
	opaTest("Add a sorter for 'Country'", function(Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		When.iSwitchToP13nTab("Sort");

		Then.thePersonalizationDialogOpens();

		//open select (empty) select control in sort panel and select 'Country'
		When.iClickOnP13nSelect("");
		When.iSelectP13nMenuItem("Country");

	});

	opaTest("When I close the 'Selected Columns' button, the table has been changed", function(Given, When, Then) {
		When.iPressDialogOk();

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
	opaTest("When I select the 'Country' column and move it to the top, the table should be changed", function(Given, When, Then) {

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Country", undefined, aTableItems);

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
	opaTest("When I do some changes and press 'Cancel', the changes should be discarded", function(Given, When, Then) {
		When.iPressDialogOk();
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Breakout Year", undefined, aTableItems);
		When.iSelectColumn("Created By", undefined, aTableItems);

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
	opaTest("When I do some changes and press 'Escape', the changes should be discarded + Dialog should open again", function(Given, When, Then) {
		When.iPressDialogOk();
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Breakout Year", undefined, aTableItems);
		When.iSelectColumn("Created By", undefined, aTableItems);

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
	opaTest("When I select two additional columns and move them one up, the table should be changed", function(Given, When, Then) {
		When.iPressDialogOk();
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Breakout Year", undefined, aTableItems);
		When.iSelectColumn("Created By", undefined, aTableItems);

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
	opaTest("Close the dialog", function(Given, When, Then) {
		When.iPressDialogOk();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();
	});

	// ----------------------------------------------------------------
	// Reopen the dialog to see if it the items have been rearranged
	// ----------------------------------------------------------------
	opaTest("Reopen the dialog to see if it the items have been rearranged", function(Give, When, Then) {
		//Reopen the dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		aTableItems = [
			{ p13nItem: "Created By", selected: true },
			{ p13nItem: "Breakout Year", selected: true },
			{ p13nItem: "Country", selected: true },
			{ p13nItem: "Name", selected: true },
			{ p13nItem: "Founding Year", selected: true },
			{ p13nItem: "Changed By", selected: true },
			{ p13nItem: "Created On", selected: true },
			{ p13nItem: "artistUUID", selected: false },
			{ p13nItem: "Changed On", selected: false },
			{ p13nItem: "City of Origin", selected: false },
			{ p13nItem: "City of Origin + Text", selected: false },
			{ p13nItem: "Country + Text", selected: false },
			{ p13nItem: "Created (Complex)", selected: false },
			{ p13nItem: "regionOfOrigin_code", selected: false },
			{ p13nItem: "regionOfOrigin_code + Text", selected: false }
		];

		Then.iShouldSeeP13nItems(aTableItems);

	});

	// ----------------------------------------------------------------
	// Assert 'Reorder' functionality
	// ----------------------------------------------------------------
	opaTest("check order", function(Given, When, Then) {
		//Reorder table items
		Then.iShouldSeeP13nItem("Created By", 0);
		Then.iShouldSeeP13nItem("Breakout Year", 1);
		Then.iShouldSeeP13nItem("Country", 2);
		Then.iShouldSeeP13nItem("Name", 3);
		Then.iShouldSeeP13nItem("Founding Year", 4);
		Then.iShouldSeeP13nItem("Changed By", 5);
		Then.iShouldSeeP13nItem("Created On", 6);
	});

	opaTest("check search", function(Given, When, Then) {
		When.iEnterValueInP13nSearchField("name");

		Then.iShouldSeeP13nItems([{ p13nItem: "Name", selected: true }]);
		Then.iShouldSeeP13nItem("Name", 0);
	});

	opaTest("check column header sort functionality: all previous sorters are deleted", function(Given, When, Then) {
		//close Dialog
		When.iPressDialogOk();

		When.iClickOnColumn("Founding Year");

		When.iPressOnButtonWithText(Arrangement.P13nDialog.Sort.Ascending);

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'sort' tab
		When.iSwitchToP13nTab("Sort");

		Then.thePersonalizationDialogOpens();

		aSortItems = [
			{ p13nItem: "Founding Year", sorted: true, descending: false }
		];

		Then.iShouldSeeP13nSortItems(aSortItems);
	});

	opaTest("sort another column via context menu: only new column should be sorted", function(Given, When, Then) {
		//close Dialog
		When.iPressDialogOk();

		When.iClickOnColumn("Name");

		When.iPressOnButtonWithText(Arrangement.P13nDialog.Sort.Descending);

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'sort' tab
		When.iSwitchToP13nTab("Sort");

		Then.thePersonalizationDialogOpens();

		aSortItems = [
			{ p13nItem: "Name", sorted: true, descending: true }
		];

		Then.iShouldSeeP13nSortItems(aSortItems);

		Given.enableAndDeleteLrepLocalStorage();
		Then.iTeardownMyAppFrame();
	});

	opaTest("Should be able to select all columns", function(Given, When, Then) {
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectAllColumns();

		aTableItems = [
			{ p13nItem: "Name", selected: true },
			{ p13nItem: "Founding Year", selected: true },
			{ p13nItem: "Changed By", selected: true },
			{ p13nItem: "Created On", selected: true },
			{ p13nItem: "artistUUID", selected: true },
			{ p13nItem: "Breakout Year", selected: true },
			{ p13nItem: "Changed On", selected: true },
			{ p13nItem: "City of Origin", selected: true },
			{ p13nItem: "City of Origin + Text", selected: true },
			{ p13nItem: "Country", selected: true },
			{ p13nItem: "Country + Text", selected: true },
			{ p13nItem: "Created (Complex)", selected: true },
			{ p13nItem: "Created By", selected: true },
			{ p13nItem: "regionOfOrigin_code", selected: true },
			{ p13nItem: "regionOfOrigin_code + Text", selected: true }
		];

		Then.iShouldSeeP13nItems(aTableItems);

		When.iPressDialogOk();
		Then.thePersonalizationDialogShouldBeClosed();
	});
});
