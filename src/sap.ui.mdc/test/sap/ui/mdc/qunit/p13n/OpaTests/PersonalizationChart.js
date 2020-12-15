sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'sap/ui/Device'
], function(Opa5, opaTest, Arrangement, TestUtil, Action, Assertion,  Device) {
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

	//set execution delay for Internet Explorer and Edge
	if (Device.browser.msie || Device.browser.edge) {
		Opa5.extendConfig({
			executionDelay: 50
		});
	}

	var aChartItems = [
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
	];

	var aSortItems = [
		{p13nItem: "Author ID", selected: false},
		{p13nItem: "Classification", selected: false},
		{p13nItem: "DetailGenre", selected: false},
		{p13nItem: "Genre", selected: false},
		{p13nItem: "Language", selected: false},
		{p13nItem: "Price (average)", selected: false},
		{p13nItem: "Price (max)", selected: false},
		{p13nItem: "Price (min)", selected: false},
		{p13nItem: "SubGenre", selected: false},
		{p13nItem: "Title", selected: false},
		{p13nItem: "Words (average)", selected: false},
		{p13nItem: "Words (max)", selected: false},
		{p13nItem: "Words (min)", selected: false}
	];

	opaTest("When I start the 'appUnderTestChart' app, the chart with some dimentions and measures appears", function(Given, When, Then) {
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

		Then.iShouldSeeP13nItems(aChartItems);
	});
	opaTest("When I close the 'Define Chart Properties', the chart has not been changed", function(Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

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
	});
	opaTest("When I press on 'Define Sort Properties' button, sort dialog should open", function(Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.sort);

		Then.iShouldSeeP13nItems(aSortItems);
	});
	opaTest("When I close the 'Define Sort Properties', the chart has not been changed", function(Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

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
	});
	opaTest("When I press on 'Define Chart Type' button, a dialog should open", function(Given, When, Then) {
		When.iPressOnButtonWithIcon("sap-icon://vertical-bar-chart");

		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("bar"), 0);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("column"), 1);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("line"), 2);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("pie"), 3);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("donut"), 4);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("heatmap"), 5);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("bullet"), 6);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("vertical_bullet"), 7);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("stacked_bar"), 8);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("stacked_column"), 9);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("100_stacked_bar"), 10);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("100_stacked_column"), 11);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("waterfall"), 12);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("horizontal_waterfall"), 13);
	});
	opaTest("When I close the 'Define Chart Type', the chart has not been changed", function(Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Filter.Back) : Given.closeAllPopovers();

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

	// ----------------------------------------------------------------
	// Change chart type from vertical-bar to pie
	// ----------------------------------------------------------------
	opaTest("When I start the 'appUnderTestChart' app again and press on 'Define Chart Type' button, the dialog should open", function(Given, When, Then) {
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html',
			autoWait: true
		});

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

		When.iPressOnButtonWithIcon("sap-icon://vertical-bar-chart");

		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("bar"), 0);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("column"), 1);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("line"), 2);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("pie"), 3);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("donut"), 4);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("heatmap"), 5);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("bullet"), 6);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("vertical_bullet"), 7);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("stacked_bar"), 8);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("stacked_column"), 9);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("100_stacked_bar"), 10);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("100_stacked_column"), 11);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("waterfall"), 12);
		Then.iShouldSeeListItemOnPosition(TestUtil.getTextOfChartType("horizontal_waterfall"), 13);
	});
	opaTest("When I select the 'Pie Chart' type, the chart should be changed", function(Given, When, Then) {
		When.iClickOnListItem(TestUtil.getTextOfChartType("pie"));

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Genre"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Price (average)"
		]);
		Then.iShouldSeeChartOfType("pie");
		Then.iShouldSeeButtonWithIcon("sap-icon://pie-chart");
		Then.theVariantManagementIsDirty(true);

		Then.iTeardownMyAppFrame();
	});

	// ----------------------------------------------------------------
	// BCP 1880469461: Wrong order of measures
	// ----------------------------------------------------------------
	opaTest("When I start the 'appUnderTestChart' app again and press on on 'Define Chart Properties' button, the chart-specific-dialog opens", function(Given, When, Then) {
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html',
			autoWait: true
		});

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

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.chart);

		Then.iShouldSeeP13nItems(aChartItems);
	});
	opaTest("When I select the 'Words (average)' measure and move the 'Words (average)' to the top, the chart should be changed", function(Given, When, Then) {
		When.iSelectColumn("Words (average)", Arrangement.P13nDialog.Titles.chart);

		When.iPressButtonWithText("Reorder");
		When.iClickOnTableItem("Words (average)").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);
		When.iPressButtonWithText("Select");

		aChartItems = [
			{p13nItem: "Words (average)", selected: true},
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
			{p13nItem: "Words (max)", selected: false},
			{p13nItem: "Words (min)", selected: false}
		];

		Then.iShouldSeeP13nItems(aChartItems);

		When.iPressDialogOk();

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Genre"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Words (average)", "Price (average)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(true);
	});
	opaTest("When I close the 'Define Chart Properties', the dialog should close", function(Given, When, Then) {
		Then.thePersonalizationDialogShouldBeClosed();

		Then.iTeardownMyAppFrame();
	});

	// ----------------------------------------------------------------
	// BCP 1880469461: Wrong order of dimensions
	// ----------------------------------------------------------------
	opaTest("When I start the 'appUnderTestChart' app again and press on on 'Define Chart Properties' button, the chart-specific-dialog opens", function(Given, When, Then) {
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html',
			autoWait: true
		});

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

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
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
	opaTest("When I select the 'Language' dimension and move the 'Language' to the top, the chart should be changed", function(Given, When, Then) {
		When.iSelectColumn("Language", Arrangement.P13nDialog.Titles.chart);

		When.iPressButtonWithText("Reorder");
		When.iClickOnTableItem("Language").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);
		When.iPressButtonWithText("Select");

		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		aChartItems = [
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

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.iShouldSeeP13nItems(aChartItems);

		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Language", "Genre"
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

		Then.iTeardownMyAppFrame();
	});
});
