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
		viewNamespace: "view."
	});

	//set execution delay for Internet Explorer and Edge
	if (Device.browser.msie || Device.browser.edge) {
		Opa5.extendConfig({
			executionDelay: 50
		});
	}

	opaTest("When I start the 'appUnderTestChart' app, the chart with some dimentions and measures appears", function(Given, When, Then) {
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html');
		Given.enableAndDeleteLrepLocalStorage();

		When.iLookAtTheScreen();

		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Amount)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);
	});

	opaTest("When I press on 'Define Chart Properties' button, the chart-specific-dialog opens", function(Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.chart);

		Then.iShouldSeeItemOnPosition("ProductName", 0);
		Then.iShouldSeeItemWithSelection("ProductName", true);
		Then.iShouldSeeEnabledSelectControl("ProductName", true);

		Then.iShouldSeeItemOnPosition("Date", 1);
		Then.iShouldSeeItemWithSelection("Date", true);
		Then.iShouldSeeEnabledSelectControl("Date", true);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Amount)", 2);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Amount)", true);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Amount)", true);

		Then.iShouldSeeItemOnPosition("CategoryId", 3);
		Then.iShouldSeeItemWithSelection("CategoryId", false);
		Then.iShouldSeeEnabledSelectControl("CategoryId", false);

		Then.iShouldSeeItemOnPosition("CategoryName", 4);
		Then.iShouldSeeItemWithSelection("CategoryName", false);
		Then.iShouldSeeEnabledSelectControl("CategoryName", false);

		Then.iShouldSeeItemOnPosition("Color", 5);
		Then.iShouldSeeItemWithSelection("Color", false);
		Then.iShouldSeeEnabledSelectControl("Color", false);

		Then.iShouldSeeItemOnPosition("Country", 6);
		Then.iShouldSeeItemWithSelection("Country", false);
		Then.iShouldSeeEnabledSelectControl("Country", false);

		Then.iShouldSeeItemOnPosition("CurrencyCode", 7);
		Then.iShouldSeeItemWithSelection("CurrencyCode", false);
		Then.iShouldSeeEnabledSelectControl("CurrencyCode", false);

		Then.iShouldSeeItemOnPosition("CurrencyName", 8);
		Then.iShouldSeeItemWithSelection("CurrencyName", false);
		Then.iShouldSeeEnabledSelectControl("CurrencyName", false);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Forecast)", 9);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Forecast)", false);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Forecast)", false);

		Then.iShouldSeeItemOnPosition("CustomerId", 10);
		Then.iShouldSeeItemWithSelection("CustomerId", false);
		Then.iShouldSeeEnabledSelectControl("CustomerId", false);

		Then.iShouldSeeItemOnPosition("CustomerName", 11);
		Then.iShouldSeeItemWithSelection("CustomerName", false);
		Then.iShouldSeeEnabledSelectControl("CustomerName", false);

		Then.iShouldSeeItemOnPosition("Month", 12);
		Then.iShouldSeeItemWithSelection("Month", false);
		Then.iShouldSeeEnabledSelectControl("Month", false);

		Then.iShouldSeeItemOnPosition("ProductId", 13);
		Then.iShouldSeeItemWithSelection("ProductId", false);
		Then.iShouldSeeEnabledSelectControl("ProductId", false);

		Then.iShouldSeeItemOnPosition("Quarter", 14);
		Then.iShouldSeeItemWithSelection("Quarter", false);
		Then.iShouldSeeEnabledSelectControl("Quarter", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationId", 15);
		Then.iShouldSeeItemWithSelection("SalesOrganizationId", false);
		Then.iShouldSeeEnabledSelectControl("SalesOrganizationId", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationName", 16);
		Then.iShouldSeeItemWithSelection("SalesOrganizationName", false);
		Then.iShouldSeeEnabledSelectControl("SalesOrganizationName", false);

		Then.iShouldSeeItemOnPosition("SuperOrdinateId", 17);
		Then.iShouldSeeItemWithSelection("SuperOrdinateId", false);
		Then.iShouldSeeEnabledSelectControl("SuperOrdinateId", false);

		Then.iShouldSeeItemOnPosition("TaxRate", 18);
		Then.iShouldSeeItemWithSelection("TaxRate", false);
		Then.iShouldSeeEnabledSelectControl("TaxRate", false);

		Then.iShouldSeeItemOnPosition("Year", 19);
		Then.iShouldSeeItemWithSelection("Year", false);
		Then.iShouldSeeEnabledSelectControl("Year", false);
	});
	opaTest("When I close the 'Define Chart Properties', the chart has not been changed", function(Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Amount)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);
	});
	opaTest("When I press on 'Define Sort Properties' button, sort dialog should open", function(Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.sort);

		Then.iShouldSeeP13nItem("Custom Aggregate (Amount)", 6, false);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Amount)", false);

		Then.iShouldSeeP13nItem("Date", 10, false);
		Then.iShouldSeeEnabledSelectControl("Date", false);

		Then.iShouldSeeP13nItem("ProductName", 13, false);
		Then.iShouldSeeEnabledSelectControl("ProductName", false);
	});
	opaTest("When I close the 'Define Sort Properties', the chart has not been changed", function(Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Amount)"
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
			"Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Amount)"
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
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html');

		When.iLookAtTheScreen();

		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Amount)"
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
			"Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Amount)"
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
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html');

		When.iLookAtTheScreen();

		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Amount)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.chart);

		Then.iShouldSeeItemOnPosition("ProductName", 0);
		Then.iShouldSeeItemWithSelection("ProductName", true);
		Then.iShouldSeeEnabledSelectControl("ProductName", true);

		Then.iShouldSeeItemOnPosition("Date", 1);
		Then.iShouldSeeItemWithSelection("Date", true);
		Then.iShouldSeeEnabledSelectControl("Date", true);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Amount)", 2);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Amount)", true);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Amount)", true);

		Then.iShouldSeeItemOnPosition("CategoryId", 3);
		Then.iShouldSeeItemWithSelection("CategoryId", false);
		Then.iShouldSeeEnabledSelectControl("CategoryId", false);

		Then.iShouldSeeItemOnPosition("CategoryName", 4);
		Then.iShouldSeeItemWithSelection("CategoryName", false);
		Then.iShouldSeeEnabledSelectControl("CategoryName", false);

		Then.iShouldSeeItemOnPosition("Color", 5);
		Then.iShouldSeeItemWithSelection("Color", false);
		Then.iShouldSeeEnabledSelectControl("Color", false);

		Then.iShouldSeeItemOnPosition("Country", 6);
		Then.iShouldSeeItemWithSelection("Country", false);
		Then.iShouldSeeEnabledSelectControl("Country", false);

		Then.iShouldSeeItemOnPosition("CurrencyCode", 7);
		Then.iShouldSeeItemWithSelection("CurrencyCode", false);
		Then.iShouldSeeEnabledSelectControl("CurrencyCode", false);

		Then.iShouldSeeItemOnPosition("CurrencyName", 8);
		Then.iShouldSeeItemWithSelection("CurrencyName", false);
		Then.iShouldSeeEnabledSelectControl("CurrencyName", false);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Forecast)", 9);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Forecast)", false);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Forecast)", false);

		Then.iShouldSeeItemOnPosition("CustomerId", 10);
		Then.iShouldSeeItemWithSelection("CustomerId", false);
		Then.iShouldSeeEnabledSelectControl("CustomerId", false);

		Then.iShouldSeeItemOnPosition("CustomerName", 11);
		Then.iShouldSeeItemWithSelection("CustomerName", false);
		Then.iShouldSeeEnabledSelectControl("CustomerName", false);

		Then.iShouldSeeItemOnPosition("Month", 12);
		Then.iShouldSeeItemWithSelection("Month", false);
		Then.iShouldSeeEnabledSelectControl("Month", false);

		Then.iShouldSeeItemOnPosition("ProductId", 13);
		Then.iShouldSeeItemWithSelection("ProductId", false);
		Then.iShouldSeeEnabledSelectControl("ProductId", false);

		Then.iShouldSeeItemOnPosition("Quarter", 14);
		Then.iShouldSeeItemWithSelection("Quarter", false);
		Then.iShouldSeeEnabledSelectControl("Quarter", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationId", 15);
		Then.iShouldSeeItemWithSelection("SalesOrganizationId", false);
		Then.iShouldSeeEnabledSelectControl("SalesOrganizationId", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationName", 16);
		Then.iShouldSeeItemWithSelection("SalesOrganizationName", false);
		Then.iShouldSeeEnabledSelectControl("SalesOrganizationName", false);

		Then.iShouldSeeItemOnPosition("SuperOrdinateId", 17);
		Then.iShouldSeeItemWithSelection("SuperOrdinateId", false);
		Then.iShouldSeeEnabledSelectControl("SuperOrdinateId", false);

		Then.iShouldSeeItemOnPosition("TaxRate", 18);
		Then.iShouldSeeItemWithSelection("TaxRate", false);
		Then.iShouldSeeEnabledSelectControl("TaxRate", false);

		Then.iShouldSeeItemOnPosition("Year", 19);
		Then.iShouldSeeItemWithSelection("Year", false);
		Then.iShouldSeeEnabledSelectControl("Year", false);
	});
	opaTest("When I select the 'Custom Aggregate (Forecast)' measure and move the 'Custom Aggregate (Forecast)' to the top, the chart should be changed", function(Given, When, Then) {
		When.iSelectColumn("Custom Aggregate (Forecast)", Arrangement.P13nDialog.Titles.chart);

		When.iPressButtonWithText("Reorder");
		When.iClickOnTableItem("Custom Aggregate (Forecast)").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);
		When.iPressButtonWithText("Select");

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Forecast)", 0);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Forecast)", true);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Amount)", true);

		Then.iShouldSeeItemOnPosition("ProductName", 1);
		Then.iShouldSeeItemWithSelection("ProductName", true);
		Then.iShouldSeeEnabledSelectControl("ProductName", true);

		Then.iShouldSeeItemOnPosition("Date", 2);
		Then.iShouldSeeItemWithSelection("Date", true);
		Then.iShouldSeeEnabledSelectControl("Date", true);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Amount)", 3);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Amount)", true);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Amount)", true);

		Then.iShouldSeeItemOnPosition("CategoryId", 4);
		Then.iShouldSeeItemWithSelection("CategoryId", false);
		Then.iShouldSeeEnabledSelectControl("CategoryId", false);

		Then.iShouldSeeItemOnPosition("CategoryName", 5);
		Then.iShouldSeeItemWithSelection("CategoryName", false);
		Then.iShouldSeeEnabledSelectControl("CategoryName", false);

		Then.iShouldSeeItemOnPosition("Color", 6);
		Then.iShouldSeeItemWithSelection("Color", false);
		Then.iShouldSeeEnabledSelectControl("Color", false);

		Then.iShouldSeeItemOnPosition("Country", 7);
		Then.iShouldSeeItemWithSelection("Country", false);
		Then.iShouldSeeEnabledSelectControl("Country", false);

		Then.iShouldSeeItemOnPosition("CurrencyCode", 8);
		Then.iShouldSeeItemWithSelection("CurrencyCode", false);
		Then.iShouldSeeEnabledSelectControl("CurrencyCode", false);

		Then.iShouldSeeItemOnPosition("CurrencyName", 9);
		Then.iShouldSeeItemWithSelection("CurrencyName", false);
		Then.iShouldSeeEnabledSelectControl("CurrencyName", false);

		Then.iShouldSeeItemOnPosition("CustomerId", 10);
		Then.iShouldSeeItemWithSelection("CustomerId", false);
		Then.iShouldSeeEnabledSelectControl("CustomerId", false);

		Then.iShouldSeeItemOnPosition("CustomerName", 11);
		Then.iShouldSeeItemWithSelection("CustomerName", false);
		Then.iShouldSeeEnabledSelectControl("CustomerName", false);

		Then.iShouldSeeItemOnPosition("Month", 12);
		Then.iShouldSeeItemWithSelection("Month", false);
		Then.iShouldSeeEnabledSelectControl("Month", false);

		Then.iShouldSeeItemOnPosition("ProductId", 13);
		Then.iShouldSeeItemWithSelection("ProductId", false);
		Then.iShouldSeeEnabledSelectControl("ProductId", false);

		Then.iShouldSeeItemOnPosition("Quarter", 14);
		Then.iShouldSeeItemWithSelection("Quarter", false);
		Then.iShouldSeeEnabledSelectControl("Quarter", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationId", 15);
		Then.iShouldSeeItemWithSelection("SalesOrganizationId", false);
		Then.iShouldSeeEnabledSelectControl("SalesOrganizationId", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationName", 16);
		Then.iShouldSeeItemWithSelection("SalesOrganizationName", false);
		Then.iShouldSeeEnabledSelectControl("SalesOrganizationName", false);

		Then.iShouldSeeItemOnPosition("SuperOrdinateId", 17);
		Then.iShouldSeeItemWithSelection("SuperOrdinateId", false);
		Then.iShouldSeeEnabledSelectControl("SuperOrdinateId", false);

		Then.iShouldSeeItemOnPosition("TaxRate", 18);
		Then.iShouldSeeItemWithSelection("TaxRate", false);
		Then.iShouldSeeEnabledSelectControl("TaxRate", false);

		Then.iShouldSeeItemOnPosition("Year", 19);
		Then.iShouldSeeItemWithSelection("Year", false);
		Then.iShouldSeeEnabledSelectControl("Year", false);

		When.iPressDialogOk();

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Forecast)", "Custom Aggregate (Amount)"
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
		Given.iStartMyAppInAFrame('test-resources/sap/ui/mdc/qunit/p13n/OpaTests/appUnderTestChart/ChartOpaApp.html');

		When.iLookAtTheScreen();

		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);
		Then.iShouldSeeButtonWithIcon(Arrangement.P13nDialog.Sort.Icon);
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Amount)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);

		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Icon);

		Then.thePersonalizationDialogOpens();
		Then.iShouldSeeDialogTitle(Arrangement.P13nDialog.Titles.chart);

		Then.iShouldSeeItemOnPosition("ProductName", 0);
		Then.iShouldSeeItemWithSelection("ProductName", true);
		Then.iShouldSeeEnabledSelectControl("ProductName", true);

		Then.iShouldSeeItemOnPosition("Date", 1);
		Then.iShouldSeeItemWithSelection("Date", true);
		Then.iShouldSeeEnabledSelectControl("Date", true);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Amount)", 2);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Amount)", true);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Amount)", true);

		Then.iShouldSeeItemOnPosition("CategoryId", 3);
		Then.iShouldSeeItemWithSelection("CategoryId", false);
		Then.iShouldSeeEnabledSelectControl("CategoryId", false);

		Then.iShouldSeeItemOnPosition("CategoryName", 4);
		Then.iShouldSeeItemWithSelection("CategoryName", false);
		Then.iShouldSeeEnabledSelectControl("CategoryName", false);

		Then.iShouldSeeItemOnPosition("Color", 5);
		Then.iShouldSeeItemWithSelection("Color", false);
		Then.iShouldSeeEnabledSelectControl("Color", false);

		Then.iShouldSeeItemOnPosition("Country", 6);
		Then.iShouldSeeItemWithSelection("Country", false);
		Then.iShouldSeeEnabledSelectControl("Country", false);

		Then.iShouldSeeItemOnPosition("CurrencyCode", 7);
		Then.iShouldSeeItemWithSelection("CurrencyCode", false);
		Then.iShouldSeeEnabledSelectControl("CurrencyCode", false);

		Then.iShouldSeeItemOnPosition("CurrencyName", 8);
		Then.iShouldSeeItemWithSelection("CurrencyName", false);
		Then.iShouldSeeEnabledSelectControl("CurrencyName", false);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Forecast)", 9);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Forecast)", false);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Forecast)", false);

		Then.iShouldSeeItemOnPosition("CustomerId", 10);
		Then.iShouldSeeItemWithSelection("CustomerId", false);
		Then.iShouldSeeEnabledSelectControl("CustomerId", false);

		Then.iShouldSeeItemOnPosition("CustomerName", 11);
		Then.iShouldSeeItemWithSelection("CustomerName", false);
		Then.iShouldSeeEnabledSelectControl("CustomerName", false);

		Then.iShouldSeeItemOnPosition("Month", 12);
		Then.iShouldSeeItemWithSelection("Month", false);
		Then.iShouldSeeEnabledSelectControl("Month", false);

		Then.iShouldSeeItemOnPosition("ProductId", 13);
		Then.iShouldSeeItemWithSelection("ProductId", false);
		Then.iShouldSeeEnabledSelectControl("ProductId", false);

		Then.iShouldSeeItemOnPosition("Quarter", 14);
		Then.iShouldSeeItemWithSelection("Quarter", false);
		Then.iShouldSeeEnabledSelectControl("Quarter", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationId", 15);
		Then.iShouldSeeItemWithSelection("SalesOrganizationId", false);
		Then.iShouldSeeEnabledSelectControl("SalesOrganizationId", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationName", 16);
		Then.iShouldSeeItemWithSelection("SalesOrganizationName", false);
		Then.iShouldSeeEnabledSelectControl("SalesOrganizationName", false);

		Then.iShouldSeeItemOnPosition("SuperOrdinateId", 17);
		Then.iShouldSeeItemWithSelection("SuperOrdinateId", false);
		Then.iShouldSeeEnabledSelectControl("SuperOrdinateId", false);

		Then.iShouldSeeItemOnPosition("TaxRate", 18);
		Then.iShouldSeeItemWithSelection("TaxRate", false);
		Then.iShouldSeeEnabledSelectControl("TaxRate", false);

		Then.iShouldSeeItemOnPosition("Year", 19);
		Then.iShouldSeeItemWithSelection("Year", false);
		Then.iShouldSeeEnabledSelectControl("Year", false);
	});
	opaTest("When I select the 'Country' dimension and move the 'Country' to the top, the chart should be changed", function(Given, When, Then) {
		When.iSelectColumn("Country", Arrangement.P13nDialog.Titles.chart);

		When.iPressButtonWithText("Reorder");
		When.iClickOnTableItem("Country").and.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.MoveToTop);
		When.iPressButtonWithText("Select");

		Then.iShouldSeeItemOnPosition("Country", 0);
		Then.iShouldSeeItemWithSelection("Country", true);
		Then.iShouldSeeEnabledSelectControl("Country", true);

		Then.iShouldSeeItemOnPosition("ProductName", 1);
		Then.iShouldSeeItemWithSelection("ProductName", true);
		Then.iShouldSeeEnabledSelectControl("ProductName", true);

		Then.iShouldSeeItemOnPosition("Date", 2);
		Then.iShouldSeeItemWithSelection("Date", true);
		Then.iShouldSeeEnabledSelectControl("Date", true);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Amount)", 3);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Amount)", true);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Amount)", true);

		Then.iShouldSeeItemOnPosition("CategoryId", 4);
		Then.iShouldSeeItemWithSelection("CategoryId", false);
		Then.iShouldSeeEnabledSelectControl("CategoryId", false);

		Then.iShouldSeeItemOnPosition("CategoryName", 5);
		Then.iShouldSeeItemWithSelection("CategoryName", false);
		Then.iShouldSeeEnabledSelectControl("CategoryName", false);

		Then.iShouldSeeItemOnPosition("Color", 6);
		Then.iShouldSeeItemWithSelection("Color", false);
		Then.iShouldSeeEnabledSelectControl("Color", false);

		Then.iShouldSeeItemOnPosition("CurrencyCode", 7);
		Then.iShouldSeeItemWithSelection("CurrencyCode", false);
		Then.iShouldSeeEnabledSelectControl("CurrencyCode", false);

		Then.iShouldSeeItemOnPosition("CurrencyName", 8);
		Then.iShouldSeeItemWithSelection("CurrencyName", false);
		Then.iShouldSeeEnabledSelectControl("CurrencyName", false);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Forecast)", 9);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Forecast)", false);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Forecast)", false);

		Then.iShouldSeeItemOnPosition("CustomerId", 10);
		Then.iShouldSeeItemWithSelection("CustomerId", false);
		Then.iShouldSeeEnabledSelectControl("CustomerId", false);

		Then.iShouldSeeItemOnPosition("CustomerName", 11);
		Then.iShouldSeeItemWithSelection("CustomerName", false);
		Then.iShouldSeeEnabledSelectControl("CustomerName", false);

		Then.iShouldSeeItemOnPosition("Month", 12);
		Then.iShouldSeeItemWithSelection("Month", false);
		Then.iShouldSeeEnabledSelectControl("Month", false);

		Then.iShouldSeeItemOnPosition("ProductId", 13);
		Then.iShouldSeeItemWithSelection("ProductId", false);
		Then.iShouldSeeEnabledSelectControl("ProductId", false);

		Then.iShouldSeeItemOnPosition("Quarter", 14);
		Then.iShouldSeeItemWithSelection("Quarter", false);
		Then.iShouldSeeEnabledSelectControl("Quarter", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationId", 15);
		Then.iShouldSeeItemWithSelection("SalesOrganizationId", false);
		Then.iShouldSeeEnabledSelectControl("SalesOrganizationId", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationName", 16);
		Then.iShouldSeeItemWithSelection("SalesOrganizationName", false);
		Then.iShouldSeeEnabledSelectControl("SalesOrganizationName", false);

		Then.iShouldSeeItemOnPosition("SuperOrdinateId", 17);
		Then.iShouldSeeItemWithSelection("SuperOrdinateId", false);
		Then.iShouldSeeEnabledSelectControl("SuperOrdinateId", false);

		Then.iShouldSeeItemOnPosition("TaxRate", 18);
		Then.iShouldSeeItemWithSelection("TaxRate", false);
		Then.iShouldSeeEnabledSelectControl("TaxRate", false);

		Then.iShouldSeeItemOnPosition("Year", 19);
		Then.iShouldSeeItemWithSelection("Year", false);
		Then.iShouldSeeEnabledSelectControl("Year", false);

		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Country", "Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Amount)"
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
