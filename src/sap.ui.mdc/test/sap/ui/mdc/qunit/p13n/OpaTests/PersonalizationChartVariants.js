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
		executionDelay: 50
	});

	// Apply a variant and switch back to the standard
	opaTest("When I start the 'appUnderTestChart' app, the chart with some dimensions and measures appears", function(Given, When, Then) {
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html',
			autoWait: true
		});
		Given.enableAndDeleteLrepLocalStorage();

		When.iLookAtTheScreen();

		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

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
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.chart);

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

		Then.iShouldSeeP13nItems(aLanguageFirst);
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
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.chart);

		Then.iShouldSeeP13nItems([
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
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

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
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.chart);

		Then.iShouldSeeP13nItems([
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
		When.iSelectColumn("Genre", Arrangement.P13nDialog.Titles.chart).and.iSelectColumn("Title", Arrangement.P13nDialog.Titles.chart);

		Then.iShouldSeeP13nItems([
			{p13nItem: "Genre", selected: false},
			{p13nItem: "Price (average)", selected: true},
			{p13nItem: "Author ID", selected: false},
			{p13nItem: "Classification", selected: false},
			{p13nItem: "DetailGenre", selected: false},
			{p13nItem: "Language", selected: false},
			{p13nItem: "Price (max)", selected: false},
			{p13nItem: "Price (min)", selected: false},
			{p13nItem: "SubGenre", selected: false},
			{p13nItem: "Title", selected: true},
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
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon).and.iSelectColumn("Price (average)", Arrangement.P13nDialog.Titles.sort);

		Then.iShouldSeeP13nItem("Price (average)", 5, true);
		Then.iShouldSeeEnabledSelectControl("Price (average)", true);

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

		Then.iTeardownMyAppFrame();
	});
});
