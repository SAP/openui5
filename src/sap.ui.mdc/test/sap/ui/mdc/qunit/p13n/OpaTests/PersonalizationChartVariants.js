sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'sap/ui/Device'
], function(Opa5, opaTest, Arrangement, TestUtil, Action, Assertion, Device) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/comp");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view.",
		autoWait: true,
		timeout: 45
	});

	var aFilterItems = [
		{p13nItem: "Author ID", value: null},
		{p13nItem: "Classification", value: null},
		{p13nItem: "DetailGenre", value: null},
		{p13nItem: "Genre", value: null},
		{p13nItem: "Language", value: null},
		{p13nItem: "Price (average)", value: null},
		{p13nItem: "Price (max)", value: null},
		{p13nItem: "Price (min)", value: null},
		{p13nItem: "SubGenre", value: null},
		{p13nItem: "Title", value: null},
		{p13nItem: "Words (average)", value: null},
		{p13nItem: "Words (max)", value: null},
		{p13nItem: "Words (min)", value: null}
	];

	var sViewSettings = Arrangement.P13nDialog.Titles.settings;

	// Apply a variant and switch back to the standard
	opaTest("When I start the 'appUnderTestChart' app, the chart with some dimensions and measures appears", function(Given, When, Then) {
		Given.enableAndDeleteLrepLocalStorage();
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html',
			autoWait: true
		});

		When.iLookAtTheScreen();

		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Genre"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Price (average)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I select 'Language Visible On First Position' variant, the chart should be changed", function(Given, When, Then) {
		//Actions
		When.iSelectVariant("Language Visible On First Position");

		// Assertions
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Language", "Genre"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Price (average)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I press on 'Define Chart Properties' button, the chart-specific-dialog opens", function(Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(sViewSettings);

		var aLanguageFirst = [
			{p13nItem: "Language", selected: true},
			{p13nItem: "Genre", selected: true},
			{p13nItem: "Price (average)", selected: true},
			{p13nItem: "Author ID", selected: false},
			{p13nItem: "Classification", selected: false},
			{p13nItem: "DetailGenre", selected: false},
			{p13nItem: "Price (max)", selected: false},
			{p13nItem: "Price (min)", selected: false},
			{p13nItem: "SubGenre", selected: false},
			{p13nItem: "Title", selected: false},
			{p13nItem: "Words (average)", selected: false},
			{p13nItem: "Words (max)", selected: false},
			{p13nItem: "Words (min)", selected: false}
		];

		Then.iShouldSeeChartP13nItems(aLanguageFirst);
	});
	opaTest("When I close the 'Define Chart Properties', the chart has not been changed", function(Given, When, Then) {
		When.iPressDialogOk();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Language", "Genre"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Price (average)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);
	});
	opaTest("When I change to the 'Standard' variant, the chart should be changed", function(Given, When, Then) {
		//Actions
		When.iSelectVariant("Standard");

		// Assertions
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Genre"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Price (average)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);
	});
	opaTest("When I press on 'Define Chart Properties' button, the chart-specific-dialog opens", function(Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(sViewSettings);

		Then.iShouldSeeChartP13nItems([
			{p13nItem: "Genre", selected: true},
			{p13nItem: "Price (average)", selected: true},
			{p13nItem: "Author ID", selected: false},
			{p13nItem: "Classification", selected: false},
			{p13nItem: "DetailGenre", selected: false},
			{p13nItem: "Language", selected: false},
			{p13nItem: "Price (max)", selected: false},
			{p13nItem: "Price (min)", selected: false},
			{p13nItem: "SubGenre", selected: false},
			{p13nItem: "Title", selected: false},
			{p13nItem: "Words (average)", selected: false},
			{p13nItem: "Words (max)", selected: false},
			{p13nItem: "Words (min)", selected: false}
		]);
	});
	opaTest("When I close the 'Define Chart Properties', the chart has not been changed", function(Given, When, Then) {
		When.iPressDialogOk();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Genre"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Price (average)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);

		Then.iTeardownMyAppFrame();
	});

	// Apply a variant, make some changes and save as another variant
	opaTest("When I start the 'appUnderTestChart' app again, the chart with some dimensions and measures appears", function(Given, When, Then) {
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html',
			autoWait: true
		});
		Given.enableAndDeleteLrepLocalStorage();

		When.iLookAtTheScreen();

		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Genre"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Price (average)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);
	});
	opaTest("When I press on 'Define Chart Properties' button, the chart-specific-dialog opens", function(Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(sViewSettings);

		Then.iShouldSeeChartP13nItems([
			{p13nItem: "Genre", selected: true},
			{p13nItem: "Price (average)", selected: true},
			{p13nItem: "Author ID", selected: false},
			{p13nItem: "Classification", selected: false},
			{p13nItem: "DetailGenre", selected: false},
			{p13nItem: "Language", selected: false},
			{p13nItem: "Price (max)", selected: false},
			{p13nItem: "Price (min)", selected: false},
			{p13nItem: "SubGenre", selected: false},
			{p13nItem: "Title", selected: false},
			{p13nItem: "Words (average)", selected: false},
			{p13nItem: "Words (max)", selected: false},
			{p13nItem: "Words (min)", selected: false}
		]);
	});
	opaTest("When I deselect 'Genre' and select 'Title', the chart should be changed", function(Given, When, Then) {
		When.iRemoveDimension("Genre", sViewSettings).and.iAddDimension("Title", sViewSettings);

		Then.iShouldSeeChartP13nItems([
			{p13nItem: "Genre", selected: false},
			{p13nItem: "Title", selected: true},
			{p13nItem: "Price (average)", selected: true},
			{p13nItem: "Author ID", selected: false},
			{p13nItem: "Classification", selected: false},
			{p13nItem: "DetailGenre", selected: false},
			{p13nItem: "Language", selected: false},
			{p13nItem: "Price (max)", selected: false},
			{p13nItem: "Price (min)", selected: false},
			{p13nItem: "SubGenre", selected: false},
			{p13nItem: "Words (average)", selected: false},
			{p13nItem: "Words (max)", selected: false},
			{p13nItem: "Words (min)", selected: false}
		]);


		When.iPressDialogOk();

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Title"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Price (average)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(true);
	});
	opaTest("When I close the 'Define Chart Properties', the dialog should close", function(Given, When, Then) {

		Then.thePersonalizationDialogShouldBeClosed();
	});
	opaTest("When I press on 'Define Sort Properties' button and sort ascending by 'Price (average)', the chart should be changed", function(Given, When, Then) {
		//open 'sort' tab
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		When.iSwitchToP13nTab("Sort");

		//open select (empty) select control in sort panel and select 'Country'
		When.iClickOnP13nSelect("");
		When.iSelectP13nMenuItem("Price (average)");

		When.iPressDialogOk();

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Title"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Price (average)"
		]);

		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(true);
	});
	opaTest("When I close the 'Define Sort Properties', the dialog should close", function(Given, When, Then) {

		Then.thePersonalizationDialogShouldBeClosed();
	});
	opaTest("When I save the variant as 'Price (average) On First Position', new variant name should appear", function(Given, When, Then) {
		When.iSaveVariantAs("Standard", "Sorted by Price (average)");

		Then.iShouldSeeSelectedVariant("Sorted by Price (average)");

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Title"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Price (average)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);

		Given.enableAndDeleteLrepLocalStorage();
	});

	var oChartConditions = {
		Title:[
			{operator:"Contains",values:["Pride"],validated:"NotValidated"}
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
		When.iEnterTextInFilterDialog("Title", "*Pride*");

		When.iPressDialogOk();


		//create a new variant 'FilterVariantTest'
		When.iSaveVariantAs("Sorted by Price (average)", "FilterVariantTest");
		Then.iShouldSeeSelectedVariant("FilterVariantTest");

		//select a default variant
		When.iSelectDefaultVariant("FilterVariantTest");
		Then.iShouldSeeSelectedVariant("FilterVariantTest");

		//restart app
		Then.iTeardownMyAppFrame();

	});

	opaTest("Switch Variant after restart without opening the dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html',
			autoWait: true
		});

		//check default variant appliance
		Then.iShouldSeeSelectedVariant("FilterVariantTest");

		When.iSelectVariant("Standard");
	});

	opaTest("Close 'FilterVariantTest' appliance after restart", function (Given, When, Then) {
		When.iSelectVariant("FilterVariantTest");

		//Recheck default variant appliance
		Then.iShouldSeeConditons("sap.ui.mdc.Chart",oChartConditions);

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
			itemText: "Title",
			index: 9,
			values: ["Pride"]
		});

		When.iPressDialogOk();

		//Check chart conditions
		Then.iShouldSeeConditons("sap.ui.mdc.Chart",oChartConditions);
	});

	opaTest("Check if Variant remains unchanged after dialog closes", function (Given, When, Then) {

		//Variant Management is not dirty --> no changes made
		Then.theVariantManagementIsDirty(false);

	});

	opaTest("Check that filter dialog changes values upon variant switch", function (Given, When, Then) {

		When.iSelectVariant("Standard");

		//no filters on standard
		Then.iShouldSeeConditons("sap.ui.mdc.Chart",{filter: {}});

		//open Dialog
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		//open 'filter' tab
		When.iSwitchToP13nTab("Filter");

		//check values from variant
		Then.iShouldSeeP13nFilterItem({
			itemText: "Title",
			index: 9,
			values: [undefined]
		});

		When.iPressDialogOk();

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
			itemText: "Title",
			index: 9,
			values: ["Pride"]
		});
		//close dialogs
		When.iPressDialogOk();

		//tear down app
		Then.iTeardownMyAppFrame();

	});
});
