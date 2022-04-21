sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion"
], function (Opa5, opaTest, Arrangement, TestUtil, Action, Assertion) {
	"use strict";

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

	var aSortItems = [
		{p13nItem: "artistUUID", descending: false},
		{p13nItem: "Breakout Year", descending: false},
		{p13nItem: "Changed By", descending: false},
		{p13nItem: "Changed On", descending: false},
		{p13nItem: "City of Origin", descending: false},
		{p13nItem: "Country", descending: false},
		{p13nItem: "Created By", descending: false},
		{p13nItem: "Created On", descending: false},
		{p13nItem: "Founding Year", descending: false},
		{p13nItem: "Name", descending: false},
		{p13nItem: "regionOfOrigin_code", descending: false}
	];

	var aFilterItems = [
		{p13nItem: "artistUUID", value: null},
		{p13nItem: "Breakout Year", value: null},
		{p13nItem: "Changed By", value: null},
		{p13nItem: "Changed On", value: null},
		{p13nItem: "City of Origin", value: null},
		{p13nItem: "Country", value: null},
		{p13nItem: "Created By", value: null},
		{p13nItem: "Created On", value: null},
		{p13nItem: "Founding Year", value: null},
		{p13nItem: "Name", value: null},
		{p13nItem: "regionOfOrigin_code", value: null}
	];

	// ----------------------------------------------------------------
	// Check if the application is running normaly
	// ----------------------------------------------------------------
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

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I press on 'Add/Remove Columns' button, the table-specific-dialog opens", function (Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.settings);

		Then.iShouldSeeP13nItems(aTableItems);
	});

	opaTest("When I close the 'Add/Remove Columns' button, the table has not been changed", function (Given, When, Then) {
		When.iPressDialogOk();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

		//check initially visible columns
		Then.iShouldSeeVisibleColumnsInOrder("sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);

		//check dirty flag
		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I press on 'Sort' tab, sort dialog should open", function (Given, When, Then) {

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Sort");

		Then.thePersonalizationDialogOpens();

		//open the select control in the sort tab
		When.iClickOnP13nSelect("");

		//check that the expected keys are visible in the sort dialog
		Then.iShouldSeeP13nMenuItems(aSortItems);
	});

	opaTest("When I close the 'Sort' tab, the table has not been changed", function (Given, When, Then) {
		When.iPressDialogOk();

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
	// Variant Management tests + set default variant
	// ----------------------------------------------------------------

	opaTest("When I select 2 additional row and also remove 1 and save a new Variant the personalization should change", function (Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		When.iSelectColumn("Breakout Year", undefined, aTableItems);
		When.iSelectColumn("City of Origin", undefined, aTableItems);
		When.iSelectColumn("Founding Year", undefined, aTableItems);

		checkTestVariantColumnsDialog(Then);

		When.iPressDialogOk();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

		Then.iShouldSeeVisibleColumnsInOrderInTable(
			"sap.ui.mdc.Table",
			"sap.ui.mdc.table.Column", [
			"name", "modifiedBy", "createdAt", "breakupYear", "cityOfOrigin_city"
		]);

		Then.iShouldSeeSelectedVariant("Standard");
		When.iSaveVariantAs("Standard", "TestVariant");
		Then.iShouldSeeSelectedVariant("TestVariant");

		//select a default variant
		When.iSelectDefaultVariant("TestVariant");
		Then.iShouldSeeSelectedVariant("TestVariant");

		//shut down app frame for next test
		Then.iTeardownMyAppFrame();
	});

	// ----------------------------------------------------------------
	// Select a default variant and restart the app (mock preprocessing)
	// ----------------------------------------------------------------
	opaTest("When I select the default variant and restart the application, it should load the default variant", function(Given, When, Then){
		//simulate restart
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});

		//check if the correct variant is selected
		Then.iShouldSeeSelectedVariant("TestVariant");

		//check if the correct columns are there from default variant "TestVariant"
		Then.iShouldSeeVisibleColumnsInOrderInTable(
			"sap.ui.mdc.Table",
			"sap.ui.mdc.table.Column", [
			"name", "modifiedBy", "createdAt", "breakupYear", "cityOfOrigin_city"
		]);
	});

	opaTest("When I switch the variant back to 'Standard' I should see the default personalization again", function (Given, When, Then) {
		When.iSelectVariant("Standard");

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeP13nItem("Name", 0, true);
		Then.iShouldSeeP13nItem("Founding Year", 1, true);
		Then.iShouldSeeP13nItem("Changed By", 2, true);
		Then.iShouldSeeP13nItem("Created On", 3, true);
		Then.iShouldSeeP13nItem("artistUUID", 4, false);
		Then.iShouldSeeP13nItem("Breakout Year", 5, false);
		Then.iShouldSeeP13nItem("Changed On", 6, false);
		Then.iShouldSeeP13nItem("City of Origin", 7, false);
		Then.iShouldSeeP13nItem("Country", 8, false);
		Then.iShouldSeeP13nItem("Created (Complex)", 9, false);
		Then.iShouldSeeP13nItem("Created By", 10, false);
		Then.iShouldSeeP13nItem("regionOfOrigin_code", 11, false);

		When.iPressDialogOk();

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

		Then.iShouldSeeVisibleColumnsInOrderInTable(
			"sap.ui.mdc.Table",
			"sap.ui.mdc.table.Column", [
			"name", "foundingYear", "modifiedBy", "createdAt"
		]);
	});

	var oTableConditions = {
		foundingYear:[
			{operator:"EQ",values:["1989"],validated:"NotValidated"},
			{operator:"EQ",values:["1904"],validated:"NotValidated"}
		],
		name:[
			{operator:"Contains",values:["S"],validated:"NotValidated"}
		]
	};

	opaTest("Open the filter personalization dialog and save some conditions as variant 'FilterVariantTest'", function (Given, When, Then) {
		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Filter");

		Then.thePersonalizationDialogOpens();

		//check filter field creation
		Then.iShouldSeeP13nFilterItems(aFilterItems);

		//enter some filter values
		When.iEnterTextInFilterDialog("Founding Year", "1989");
		When.iEnterTextInFilterDialog("Founding Year", "1904");
		When.iEnterTextInFilterDialog("Name", "*S*");

		When.iPressDialogOk();

		Then.iShouldSeeVisibleItemsInTable(2);

		//create a new variant 'FilterVariantTest'
		When.iSaveVariantAs("Standard", "FilterVariantTest");
		Then.iShouldSeeSelectedVariant("FilterVariantTest");

		//select a default variant
		When.iSelectDefaultVariant("FilterVariantTest");
		Then.iShouldSeeSelectedVariant("FilterVariantTest");

		//Check Table conditions
		Then.iShouldSeeConditons("sap.ui.mdc.Table",oTableConditions);

		//restart app
		Then.iTeardownMyAppFrame();

	});

	opaTest("Switch Variant after restart without opening the dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});

		//check default variant appliance
		Then.iShouldSeeSelectedVariant("FilterVariantTest");

		Then.iShouldSeeVisibleItemsInTable(2);

		When.iSelectVariant("Standard");

		Then.iShouldSeeVisibleItemsInTable(100);
	});

	opaTest("Close 'FilterVariantTest' appliance after restart", function (Given, When, Then) {
		When.iSelectVariant("FilterVariantTest");

		//Recheck default variant appliance
		Then.iShouldSeeConditons("sap.ui.mdc.Table",oTableConditions);

		Then.iShouldSeeVisibleItemsInTable(2);

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Filter");

		When.iPressDialogOk();
	});

	opaTest("Reopen the filter personalization dialog to validate 'FilterVariantTest'", function (Given, When, Then) {
		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Filter");

		Then.thePersonalizationDialogOpens();

		//check values from variant
		Then.iShouldSeeP13nFilterItem({
			itemText: "Founding Year",
			index: 8,
			values: ["1989", "1904"]
		});
		Then.iShouldSeeP13nFilterItem({
			itemText: "Name",
			index: 9,
			values: ["S"]
		});

		When.iPressDialogOk();

		Then.iShouldSeeVisibleItemsInTable(2);

		//Check Table conditions
		Then.iShouldSeeConditons("sap.ui.mdc.Table",oTableConditions);
	});

	opaTest("Check if Variant remains unchanged after dialog closes", function (Given, When, Then) {

		//Variant Management is not dirty --> no changes made
		Then.theVariantManagementIsDirty(false);

	});

	opaTest("Check that filter dialog changes values upon variant switch", function (Given, When, Then) {

		When.iSelectVariant("Standard");

		//no filters on standard
		Then.iShouldSeeConditons("sap.ui.mdc.Table",{filter: {}});

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Filter");

		//check values from variant

		Then.iShouldSeeP13nFilterItem({
			itemText: "Founding Year",
			index: 8,
			values: [undefined]
		});
		Then.iShouldSeeP13nFilterItem({
			itemText: "Name",
			index: 9,
			values: [undefined]
		});

		When.iPressDialogOk();

		Then.iShouldSeeVisibleItemsInTable(100);

		Then.theVariantManagementIsDirty(false);
	});

	opaTest("Switch back to 'FilterVariantTest' to check reappliance of condition values", function (Given, When, Then) {

		//Switch back to check condition appliance in filter dialog
		When.iSelectVariant("FilterVariantTest");

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Filter");

		Then.thePersonalizationDialogOpens();

		//check values persisted in variant --> values should be present again
		Then.iShouldSeeP13nFilterItem({
			itemText: "Founding Year",
			index: 8,
			values: ["1989", "1904"]
		});
		Then.iShouldSeeP13nFilterItem({
			itemText: "Name",
			index: 9,
			values: ["S"]
		});

		//close dialogs
		When.iPressDialogOk();

		Then.iShouldSeeVisibleItemsInTable(2);

		//tear down app
		Then.iTeardownMyAppFrame();

	});

	opaTest("When i use a PersistenceProvider having mode='Global', the changes should implicitly be stored.", function (Given, When, Then) {
		Given.enableAndDeleteLrepLocalStorage();
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?view=Implicit',
			autoWait: true
		});

		When.iLookAtTheScreen();
		When.iClickOnColumn("Name");

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Ascending);
		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Sort");

		Then.thePersonalizationDialogOpens();

		aSortItems = [
			{p13nItem: "Name", sorted: true, descending: false}
		];

		Then.iShouldSeeP13nSortItems(aSortItems);

		When.iPressDialogOk();

		Then.iTeardownMyAppFrame();
	});

	opaTest("'Implicit' changes are applied when i restart the 'appUnderTestTable' app", function (Given, When, Then) {
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		When.iLookAtTheScreen();
		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Sort");

		Then.thePersonalizationDialogOpens();

		aSortItems = [
			{p13nItem: "Name", sorted: true, descending: false}
		];

		Then.iShouldSeeP13nSortItems(aSortItems);
		When.iPressDialogOk();
		Then.iTeardownMyAppFrame();

	});


	opaTest("When i use a PersistenceProvider having mode='Transient', the changes are never stored and never affect an existing VariantManagement", function (Given, When, Then) {
		Given.enableAndDeleteLrepLocalStorage();
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?view=Transient',
			autoWait: true
		});

		When.iLookAtTheScreen();
		When.iClickOnColumn("Name");

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Ascending);

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Sort");

		Then.thePersonalizationDialogOpens();

		aSortItems = [
			{p13nItem: "Name", sorted: true, descending: false}
		];

		Then.iShouldSeeP13nSortItems(aSortItems);
		When.iPressDialogOk();

		Then.theVariantManagementIsDirty(false);

		Then.iTeardownMyAppFrame();
	});

	opaTest("'Transient' changes are never applied after i restart the 'appUnderTestTable' app", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html?view=Transient',
			autoWait: true
		});
		When.iLookAtTheScreen();

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Sort");

		Then.thePersonalizationDialogOpens();

		Then.iShouldSeeP13nSortItems([]);
		When.iPressDialogOk();

		Given.enableAndDeleteLrepLocalStorage();
		Then.iTeardownMyAppFrame();

	});

	// ----------------------------------------------------------------
	// Methods
	// ----------------------------------------------------------------

	function checkTestVariantColumnsDialog(Then) {
		Then.iShouldSeeP13nItem("Name", 0, true);
		Then.iShouldSeeP13nItem("Founding Year", 1, false);
		Then.iShouldSeeP13nItem("Changed By", 2, true);
		Then.iShouldSeeP13nItem("Created On", 3, true);
		Then.iShouldSeeP13nItem("artistUUID", 4, false);
		Then.iShouldSeeP13nItem("Breakout Year", 5, true);
		Then.iShouldSeeP13nItem("Changed On", 6, false);
		Then.iShouldSeeP13nItem("City of Origin", 7, true);
		Then.iShouldSeeP13nItem("Country", 8, false);
		Then.iShouldSeeP13nItem("Created (Complex)", 9, false);
		Then.iShouldSeeP13nItem("Created By", 10, false);
		Then.iShouldSeeP13nItem("regionOfOrigin_code", 11, false);
	}
});
