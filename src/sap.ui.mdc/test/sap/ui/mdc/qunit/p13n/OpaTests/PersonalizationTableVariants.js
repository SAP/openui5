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

	opaTest("When I close the 'Add/Remove Columns' button, the table has not been changed", function (Given, When, Then) {
		if (sap.ui.Device.system.phone) {
			When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back);
		} else {
			When.iPressDialogOk();
		}

		//close p13n dialog
		Then.thePersonalizationDialogShouldBeClosed();

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
		if (sap.ui.Device.system.phone) {
			When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Back);
		} else {
			When.iPressDialogOk();
		}

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

		When.iSelectColumn("Breakout Year", Arrangement.P13nDialog.Titles.columns, aTableItems);
		When.iSelectColumn("cityOfOrigin_city", Arrangement.P13nDialog.Titles.columns, aTableItems);
		When.iSelectColumn("Founding Year", Arrangement.P13nDialog.Titles.columns, aTableItems);

		checkTestVariantColumnsDialog(Then);

		if (sap.ui.Device.system.phone) {
			When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back);
		} else {
			When.iPressDialogOk();
		}

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
		Then.iShouldSeeP13nItem("cityOfOrigin_city", 7, false);
		Then.iShouldSeeP13nItem("Country", 8, false);
		Then.iShouldSeeP13nItem("Created (Complex)", 9, false);
		Then.iShouldSeeP13nItem("Created By", 10, false);
		Then.iShouldSeeP13nItem("regionOfOrigin_code", 11, false);

		if (sap.ui.Device.system.phone) {
			When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back);
		} else {
			When.iPressDialogOk();
		}

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
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Icon);

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
		Then.iShouldSeeTableConditions(oTableConditions);

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

		Then.iShouldSeeVisibleItemsInTable(20);
	});

	opaTest("Close 'FilterVariantTest' appliance after restart", function (Given, When, Then) {
		When.iSelectVariant("FilterVariantTest");

		//Recheck default variant appliance
		Then.iShouldSeeTableConditions(oTableConditions);

		Then.iShouldSeeVisibleItemsInTable(2);

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Icon);

		When.iPressDialogOk();
	});

	opaTest("Reopen the filter personalization dialog to validate 'FilterVariantTest'", function (Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Icon);

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
		Then.iShouldSeeTableConditions(oTableConditions);
	});

	opaTest("Check if Variant remains unchanged after dialog closes", function (Given, When, Then) {

		//Variant Management is not dirty --> no changes made
		Then.theVariantManagementIsDirty(false);

	});

	opaTest("Check that filter dialog changes values upon variant switch", function (Given, When, Then) {

		When.iSelectVariant("Standard");

		//no filters on standard
		Then.iShouldSeeTableConditions({filter: {}});

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Icon);

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

		Then.iShouldSeeVisibleItemsInTable(20);

		Then.theVariantManagementIsDirty(false);
	});

	opaTest("Switch back to 'FilterVariantTest' to check reappliance of condition values", function (Given, When, Then) {

		//Switch back to check condition appliance in filter dialog
		When.iSelectVariant("FilterVariantTest");

		//open dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Icon);

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

		When.iPressDialogOk();

		Then.iTeardownMyAppFrame();
	});

	opaTest("'Implicit' changes are applied when i restart the 'appUnderTestTable' app", function (Given, When, Then) {
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestTable/TableOpaApp.html',
			autoWait: true
		});
		When.iLookAtTheScreen();
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
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		Then.thePersonalizationDialogOpens();

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

		Then.iShouldSeeP13nItems(aSortItems);
		When.iPressDialogOk();
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
		Then.iShouldSeeP13nItem("cityOfOrigin_city", 7, true);
		Then.iShouldSeeP13nItem("Country", 8, false);
		Then.iShouldSeeP13nItem("Created (Complex)", 9, false);
		Then.iShouldSeeP13nItem("Created By", 10, false);
		Then.iShouldSeeP13nItem("regionOfOrigin_code", 11, false);
	}
});
