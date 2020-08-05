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
		viewNamespace: "view."
	});

	//set execution delay for Internet Explorer and Edge
	if (Device.browser.msie || Device.browser.edge) {
		Opa5.extendConfig({
			executionDelay: 50
		});
	}

	// Apply a variant and switch back to the standard
	opaTest("When I start the 'appUnderTestChart' app, the chart with some dimensions and measures appears", function(Given, When, Then) {
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

		Then.iShouldSeeItemOnPosition("Date", 1);
		Then.iShouldSeeItemWithSelection("Date", true);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Amount)", 2);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Amount)", true);

		Then.iShouldSeeItemOnPosition("CategoryId", 3);
		Then.iShouldSeeItemWithSelection("CategoryId", false);

		Then.iShouldSeeItemOnPosition("CategoryName", 4);
		Then.iShouldSeeItemWithSelection("CategoryName", false);

		Then.iShouldSeeItemOnPosition("Color", 5);
		Then.iShouldSeeItemWithSelection("Color", false);

		Then.iShouldSeeItemOnPosition("Country", 6);
		Then.iShouldSeeItemWithSelection("Country", false);

		Then.iShouldSeeItemOnPosition("CurrencyCode", 7);
		Then.iShouldSeeItemWithSelection("CurrencyCode", false);

		Then.iShouldSeeItemOnPosition("CurrencyName", 8);
		Then.iShouldSeeItemWithSelection("CurrencyName", false);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Forecast)", 9);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Forecast)", false);

		Then.iShouldSeeItemOnPosition("CustomerId", 10);
		Then.iShouldSeeItemWithSelection("CustomerId", false);

		Then.iShouldSeeItemOnPosition("CustomerName", 11);
		Then.iShouldSeeItemWithSelection("CustomerName", false);

		Then.iShouldSeeItemOnPosition("Month", 12);
		Then.iShouldSeeItemWithSelection("Month", false);

		Then.iShouldSeeItemOnPosition("ProductId", 13);
		Then.iShouldSeeItemWithSelection("ProductId", false);

		Then.iShouldSeeItemOnPosition("Quarter", 14);
		Then.iShouldSeeItemWithSelection("Quarter", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationId", 15);
		Then.iShouldSeeItemWithSelection("SalesOrganizationId", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationName", 16);
		Then.iShouldSeeItemWithSelection("SalesOrganizationName", false);

		Then.iShouldSeeItemOnPosition("SuperOrdinateId", 17);
		Then.iShouldSeeItemWithSelection("SuperOrdinateId", false);

		Then.iShouldSeeItemOnPosition("TaxRate", 18);
		Then.iShouldSeeItemWithSelection("TaxRate", false);

		Then.iShouldSeeItemOnPosition("Year", 19);
		Then.iShouldSeeItemWithSelection("Year", false);
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
	opaTest("When I load 'Country Visible On First Position' variant, the chart should be changed", function(Given, When, Then) {
		//Actions
		When.iSelectVariant("Country Visible On First Position");

		// Assertions
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Country", "Product Name", "Date"
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

		Then.iShouldSeeItemOnPosition("Country", 0);
		Then.iShouldSeeItemWithSelection("Country", true);

		Then.iShouldSeeItemOnPosition("ProductName", 1);
		Then.iShouldSeeItemWithSelection("ProductName", true);

		Then.iShouldSeeItemOnPosition("Date", 2);
		Then.iShouldSeeItemWithSelection("Date", true);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Amount)", 3);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Amount)", true);

		Then.iShouldSeeItemOnPosition("CategoryId", 4);
		Then.iShouldSeeItemWithSelection("CategoryId", false);

		Then.iShouldSeeItemOnPosition("CategoryName", 5);
		Then.iShouldSeeItemWithSelection("CategoryName", false);

		Then.iShouldSeeItemOnPosition("Color", 6);
		Then.iShouldSeeItemWithSelection("Color", false);

		Then.iShouldSeeItemOnPosition("CurrencyCode", 7);
		Then.iShouldSeeItemWithSelection("CurrencyCode", false);

		Then.iShouldSeeItemOnPosition("CurrencyName", 8);
		Then.iShouldSeeItemWithSelection("CurrencyName", false);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Forecast)", 9);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Forecast)", false);

		Then.iShouldSeeItemOnPosition("CustomerId", 10);
		Then.iShouldSeeItemWithSelection("CustomerId", false);

		Then.iShouldSeeItemOnPosition("CustomerName", 11);
		Then.iShouldSeeItemWithSelection("CustomerName", false);

		Then.iShouldSeeItemOnPosition("Month", 12);
		Then.iShouldSeeItemWithSelection("Month", false);

		Then.iShouldSeeItemOnPosition("ProductId", 13);
		Then.iShouldSeeItemWithSelection("ProductId", false);

		Then.iShouldSeeItemOnPosition("Quarter", 14);
		Then.iShouldSeeItemWithSelection("Quarter", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationId", 15);
		Then.iShouldSeeItemWithSelection("SalesOrganizationId", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationName", 16);
		Then.iShouldSeeItemWithSelection("SalesOrganizationName", false);

		Then.iShouldSeeItemOnPosition("SuperOrdinateId", 17);
		Then.iShouldSeeItemWithSelection("SuperOrdinateId", false);

		Then.iShouldSeeItemOnPosition("TaxRate", 18);
		Then.iShouldSeeItemWithSelection("TaxRate", false);

		Then.iShouldSeeItemOnPosition("Year", 19);
		Then.iShouldSeeItemWithSelection("Year", false);
	});
	opaTest("When I close the 'Define Chart Properties', the chart has not been changed", function(Given, When, Then) {
		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		Then.thePersonalizationDialogShouldBeClosed();
		Then.iShouldSeeVisibleDimensionsInOrder([
			"Country", "Product Name", "Date"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Amount)"
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

		Then.iShouldSeeItemOnPosition("Date", 1);
		Then.iShouldSeeItemWithSelection("Date", true);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Amount)", 2);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Amount)", true);

		Then.iShouldSeeItemOnPosition("CategoryId", 3);
		Then.iShouldSeeItemWithSelection("CategoryId", false);

		Then.iShouldSeeItemOnPosition("CategoryName", 4);
		Then.iShouldSeeItemWithSelection("CategoryName", false);

		Then.iShouldSeeItemOnPosition("Color", 5);
		Then.iShouldSeeItemWithSelection("Color", false);

		Then.iShouldSeeItemOnPosition("Country", 6);
		Then.iShouldSeeItemWithSelection("Country", false);

		Then.iShouldSeeItemOnPosition("CurrencyCode", 7);
		Then.iShouldSeeItemWithSelection("CurrencyCode", false);

		Then.iShouldSeeItemOnPosition("CurrencyName", 8);
		Then.iShouldSeeItemWithSelection("CurrencyName", false);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Forecast)", 9);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Forecast)", false);

		Then.iShouldSeeItemOnPosition("CustomerId", 10);
		Then.iShouldSeeItemWithSelection("CustomerId", false);

		Then.iShouldSeeItemOnPosition("CustomerName", 11);
		Then.iShouldSeeItemWithSelection("CustomerName", false);

		Then.iShouldSeeItemOnPosition("Month", 12);
		Then.iShouldSeeItemWithSelection("Month", false);

		Then.iShouldSeeItemOnPosition("ProductId", 13);
		Then.iShouldSeeItemWithSelection("ProductId", false);

		Then.iShouldSeeItemOnPosition("Quarter", 14);
		Then.iShouldSeeItemWithSelection("Quarter", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationId", 15);
		Then.iShouldSeeItemWithSelection("SalesOrganizationId", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationName", 16);
		Then.iShouldSeeItemWithSelection("SalesOrganizationName", false);

		Then.iShouldSeeItemOnPosition("SuperOrdinateId", 17);
		Then.iShouldSeeItemWithSelection("SuperOrdinateId", false);

		Then.iShouldSeeItemOnPosition("TaxRate", 18);
		Then.iShouldSeeItemWithSelection("TaxRate", false);

		Then.iShouldSeeItemOnPosition("Year", 19);
		Then.iShouldSeeItemWithSelection("Year", false);
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

		Then.iTeardownMyAppFrame();
	});

	// Apply a variant, make some changes and save as another variant
	opaTest("When I start the 'appUnderTestChart' app again, the chart with some dimensions and measures appears", function(Given, When, Then) {
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

		Then.iShouldSeeItemOnPosition("Date", 1);
		Then.iShouldSeeItemWithSelection("Date", true);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Amount)", 2);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Amount)", true);

		Then.iShouldSeeItemOnPosition("CategoryId", 3);
		Then.iShouldSeeItemWithSelection("CategoryId", false);

		Then.iShouldSeeItemOnPosition("CategoryName", 4);
		Then.iShouldSeeItemWithSelection("CategoryName", false);

		Then.iShouldSeeItemOnPosition("Color", 5);
		Then.iShouldSeeItemWithSelection("Color", false);

		Then.iShouldSeeItemOnPosition("Country", 6);
		Then.iShouldSeeItemWithSelection("Country", false);

		Then.iShouldSeeItemOnPosition("CurrencyCode", 7);
		Then.iShouldSeeItemWithSelection("CurrencyCode", false);

		Then.iShouldSeeItemOnPosition("CurrencyName", 8);
		Then.iShouldSeeItemWithSelection("CurrencyName", false);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Forecast)", 9);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Forecast)", false);

		Then.iShouldSeeItemOnPosition("CustomerId", 10);
		Then.iShouldSeeItemWithSelection("CustomerId", false);

		Then.iShouldSeeItemOnPosition("CustomerName", 11);
		Then.iShouldSeeItemWithSelection("CustomerName", false);

		Then.iShouldSeeItemOnPosition("Month", 12);
		Then.iShouldSeeItemWithSelection("Month", false);

		Then.iShouldSeeItemOnPosition("ProductId", 13);
		Then.iShouldSeeItemWithSelection("ProductId", false);

		Then.iShouldSeeItemOnPosition("Quarter", 14);
		Then.iShouldSeeItemWithSelection("Quarter", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationId", 15);
		Then.iShouldSeeItemWithSelection("SalesOrganizationId", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationName", 16);
		Then.iShouldSeeItemWithSelection("SalesOrganizationName", false);

		Then.iShouldSeeItemOnPosition("SuperOrdinateId", 17);
		Then.iShouldSeeItemWithSelection("SuperOrdinateId", false);

		Then.iShouldSeeItemOnPosition("TaxRate", 18);
		Then.iShouldSeeItemWithSelection("TaxRate", false);

		Then.iShouldSeeItemOnPosition("Year", 19);
		Then.iShouldSeeItemWithSelection("Year", false);
	});
	opaTest("When I deselect 'Date', select 'Custom Aggregate (Forecast)' and deselect 'Custom Aggregate (Amount)', the chart should be changed", function(Given, When, Then) {
		When.iSelectColumn("Date", Arrangement.P13nDialog.Titles.chart).and.iSelectColumn("Custom Aggregate (Forecast)", Arrangement.P13nDialog.Titles.chart).and.iSelectColumn("Custom Aggregate (Amount)", Arrangement.P13nDialog.Titles.chart);

		Then.iShouldSeeItemOnPosition("ProductName", 0);
		Then.iShouldSeeItemWithSelection("ProductName", true);

		Then.iShouldSeeItemOnPosition("Date", 1);
		Then.iShouldSeeItemWithSelection("Date", false);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Amount)", 2);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Amount)", false);

		Then.iShouldSeeItemOnPosition("CategoryId", 3);
		Then.iShouldSeeItemWithSelection("CategoryId", false);

		Then.iShouldSeeItemOnPosition("CategoryName", 4);
		Then.iShouldSeeItemWithSelection("CategoryName", false);

		Then.iShouldSeeItemOnPosition("Color", 5);
		Then.iShouldSeeItemWithSelection("Color", false);

		Then.iShouldSeeItemOnPosition("Country", 6);
		Then.iShouldSeeItemWithSelection("Country", false);

		Then.iShouldSeeItemOnPosition("CurrencyCode", 7);
		Then.iShouldSeeItemWithSelection("CurrencyCode", false);

		Then.iShouldSeeItemOnPosition("CurrencyName", 8);
		Then.iShouldSeeItemWithSelection("CurrencyName", false);

		Then.iShouldSeeItemOnPosition("Custom Aggregate (Forecast)", 9);
		Then.iShouldSeeItemWithSelection("Custom Aggregate (Forecast)", true);

		Then.iShouldSeeItemOnPosition("CustomerId", 10);
		Then.iShouldSeeItemWithSelection("CustomerId", false);

		Then.iShouldSeeItemOnPosition("CustomerName", 11);
		Then.iShouldSeeItemWithSelection("CustomerName", false);

		Then.iShouldSeeItemOnPosition("Month", 12);
		Then.iShouldSeeItemWithSelection("Month", false);

		Then.iShouldSeeItemOnPosition("ProductId", 13);
		Then.iShouldSeeItemWithSelection("ProductId", false);

		Then.iShouldSeeItemOnPosition("Quarter", 14);
		Then.iShouldSeeItemWithSelection("Quarter", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationId", 15);
		Then.iShouldSeeItemWithSelection("SalesOrganizationId", false);

		Then.iShouldSeeItemOnPosition("SalesOrganizationName", 16);
		Then.iShouldSeeItemWithSelection("SalesOrganizationName", false);

		Then.iShouldSeeItemOnPosition("SuperOrdinateId", 17);
		Then.iShouldSeeItemWithSelection("SuperOrdinateId", false);

		Then.iShouldSeeItemOnPosition("TaxRate", 18);
		Then.iShouldSeeItemWithSelection("TaxRate", false);

		Then.iShouldSeeItemOnPosition("Year", 19);
		Then.iShouldSeeItemWithSelection("Year", false);

		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Product Name"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Forecast)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(true);
	});
	opaTest("When I close the 'Define Chart Properties', the dialog should close", function(Given, When, Then) {

		Then.thePersonalizationDialogShouldBeClosed();
	});
	opaTest("When I press on 'Define Sort Properties' button and sort ascending by 'Custom Aggregate (Forecast)', the chart should be changed", function(Given, When, Then) {
		When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Sort.Icon).and.iSelectColumn("Custom Aggregate (Forecast)", Arrangement.P13nDialog.Titles.sort);

		Then.iShouldSeeP13nItem("Custom Aggregate (Forecast)", 7, true);
		Then.iShouldSeeEnabledSelectControl("Custom Aggregate (Forecast)", true);

		Then.iShouldSeeP13nItem("ProductName", 13, false);
		Then.iShouldSeeEnabledSelectControl("ProductName", false);

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Product Name"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Forecast)"
		]);

		Device.system.phone ? When.iPressOnButtonWithIcon(Arrangement.P13nDialog.Settings.Back) : When.iPressDialogOk();

		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(true);
	});
	opaTest("When I close the 'Define Sort Properties', the dialog should close", function(Given, When, Then) {

		Then.thePersonalizationDialogShouldBeClosed();
	});
	opaTest("When I save the variant as 'Custom Aggregate (Forecast) On First Position', new variant name should appear", function(Given, When, Then) {
		When.iSaveVariantAs("Standard", "Sorted by Custom Aggregate (Forecast)");

		Then.iShouldSeeSelectedVariant("Sorted by Custom Aggregate (Forecast)");

		Then.iShouldSeeVisibleDimensionsInOrder([
			"Product Name"
		]);
		Then.iShouldSeeVisibleMeasuresInOrder([
			"Custom Aggregate (Forecast)"
		]);
		Then.iShouldSeeChartOfType("column");
		Then.iShouldSeeButtonWithIcon("sap-icon://vertical-bar-chart");
		Then.theVariantManagementIsDirty(false);
	});
});
