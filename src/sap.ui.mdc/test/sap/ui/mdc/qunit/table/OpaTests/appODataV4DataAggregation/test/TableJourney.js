/* global QUnit */

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/EnterText",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Util",
	"sap/ui/core/library"
], function(
	/** @type sap.ui.test.opaQunit */ opaTest,
	EnterText,
	Util,
	coreLibrary
) {
	"use strict";

	const sTableId = "mdcTable";

	QUnit.module("Data");

	opaTest("Visual grouping and totals should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 0,
			data: {
				"@$ui5.node.isExpanded": false,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 1,
				Country: "USA",
				Country_Code: "1",
				SalesAmountLocalCurrency: 40405175,
				LocalCurrency: "USD"
			}
		});
		Then.onTheAppMDCTable.iCheckGroupHeaderRowTitle(sTableId, {
			index: 0,
			title: "Country: 1 - USA"
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 1,
			data: {
				"@$ui5.node.isExpanded": false,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 1,
				Country: "United Kingdom",
				Country_Code: "2",
				SalesAmountLocalCurrency: 14548502,
				LocalCurrency: "GBP"
			}
		});
		Then.onTheAppMDCTable.iCheckGroupHeaderRowTitle(sTableId, {
			index: 1,
			title: "Country: 2 - United Kingdom"
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 2,
			data: {
				"@$ui5.node.isExpanded": false,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 1,
				Country: "Germany",
				Country_Code: "3",
				SalesAmountLocalCurrency: 24489638,
				LocalCurrency: "EUR"
			}
		});
		Then.onTheAppMDCTable.iCheckGroupHeaderRowTitle(sTableId, {
			index: 2,
			title: "Country: 3 - Germany"
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 3,
			data: {
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 0,
				SalesAmountLocalCurrency: 79443315,
				LocalCurrency: null
			}
		});
		Then.onTheAppMDCTable.iCheckRowIsEmpty(sTableId, {index: 4});
	});

	opaTest("Expand 'Country: 3 - Germany'", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressExpandRowButton(sTableId, {
			index: 2,
			data: {
				Country: "Germany",
				Country_Code: "3"
			}
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 3,
			data: {
				"@$ui5.node.isExpanded": false,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 2,
				Region: "Saxony"
			}
		});
		Then.onTheAppMDCTable.iCheckGroupHeaderRowTitle(sTableId, {
			index: 3,
			title: "Region: Saxony"
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 4,
			data: {
				"@$ui5.node.isExpanded": true,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 0,
				SalesAmountLocalCurrency: 79443315,
				LocalCurrency: null
			}
		});
	});

	opaTest("Scroll to bottom", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			Then.iWaitForPromise(oTable.scrollToIndex(-1));
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 2,
			data: {
				"@$ui5.node.isExpanded": false,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 2,
				Region: "Baden-Württemberg"
			}
		});
		Then.onTheAppMDCTable.iCheckGroupHeaderRowTitle(sTableId, {
			index: 2,
			title: "Region: Baden-Württemberg"
		});
	});

	opaTest("Expand 'Region: Baden-Württemberg'", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressExpandRowButton(sTableId, {
			index: 2,
			data: {
				Region: "Baden-Württemberg"
			}
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 2,
			data: {
				"@$ui5.node.isExpanded": true,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 2,
				Region: "Baden-Württemberg"
			}
		});
	});

	opaTest("Scroll to bottom and check group totals", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			Then.iWaitForPromise(oTable.scrollToIndex(-1));
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 2,
			data: {
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 2,
				SalesAmountLocalCurrency: 4416538,
				LocalCurrency: "EUR"
			}
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 3,
			data: {
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 1,
				SalesAmountLocalCurrency: 24489638,
				LocalCurrency: "EUR"
			}
		});
	});

	QUnit.module("Filter and search");

	opaTest("Filter", function(Given, When, Then) {
		When.onTheMDCTable.iPersonalizeFilter(sTableId, [{
			key: "Region",
			values: [">M"],
			inputControl: sTableId + "--filter--Region"
		}]);
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 0,
			data: {
				"@$ui5.node.isExpanded": false,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 1,
				Country: "USA",
				Country_Code: "1",
				SalesAmountLocalCurrency: 26040410,
				LocalCurrency: "USD"
			}
		});
		Then.onTheAppMDCTable.iCheckGroupHeaderRowTitle(sTableId, {
			index: 0,
			title: "Country: 1 - USA"
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 3,
			data: {
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 0,
				SalesAmountLocalCurrency: 29709155,
				LocalCurrency: null
			}
		});
	});

	opaTest("Expand 'Country: 3 - Germany' and scroll to bottom", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressExpandRowButton(sTableId, {
			index: 2,
			data: {
				Country: "Germany",
				Country_Code: "3"
			}
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 2,
			data: {
				"@$ui5.node.isExpanded": true,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 1,
				Country: "Germany",
				Country_Code: "3"
			}
		});
	});

	opaTest("Scroll to bottom", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			Then.iWaitForPromise(oTable.scrollToIndex(-1));
		});
		Then.onTheAppMDCTable.iCheckGroupHeaderRowTitle(sTableId, {
			index: 2,
			title: "Region: Saxony"
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 3,
			data: {
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 1,
				SalesAmountLocalCurrency: 1161590,
				LocalCurrency: "EUR"
			}
		});
	});

	opaTest("Search", function(Given, When, Then) {
		When.waitFor({
			id: "searchField",
			actions: new EnterText({
				text: "Carol Johnson",
				pressEnterKey: true
			})
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 0,
			data: {
				"@$ui5.node.isExpanded": false,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 1,
				Country: "United Kingdom",
				Country_Code: "UK",
				SalesAmountLocalCurrency: 815825,
				LocalCurrency: "GBP"
			}
		});
		Then.onTheAppMDCTable.iCheckGroupHeaderRowTitle(sTableId, {
			index: 0,
			title: "Country: UK - United Kingdom"
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 1,
			data: {
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 0,
				SalesAmountLocalCurrency: 815825,
				LocalCurrency: "GBP"
			}
		});
		Then.onTheAppMDCTable.iCheckRowIsEmpty(sTableId, {index: 2});
	});

	opaTest("Expand 'Country: UK - United Kingdom", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressExpandRowButton(sTableId, {
			index: 0,
			data: {
				Country: "United Kingdom",
				Country_Code: "UK"
			}
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 1,
			data: {
				"@$ui5.node.isExpanded": false,
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 2,
				Region: "Wales",
				SalesAmountLocalCurrency: 815825,
				LocalCurrency: "GBP"
			}
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 2,
			data: {
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 1,
				SalesAmountLocalCurrency: 815825,
				LocalCurrency: "GBP"
			}
		});
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {
			index: 3,
			data: {
				"@$ui5.node.isTotal": true,
				"@$ui5.node.level": 0,
				SalesAmountLocalCurrency: 815825,
				LocalCurrency: "GBP"
			}
		});
	});

	QUnit.module("Column menu");

	opaTest("Open column menu with groupable property", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Region");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuQuickActions(2);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "Region", label: "Region", sortOrder: coreLibrary.SortOrder.None});
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Region", label: "Region", grouped: true});
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuItems(4);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItems([
			Util.P13nDialogInfo.Titles.sort,
			Util.P13nDialogInfo.Titles.filter,
			Util.P13nDialogInfo.Titles.group,
			Util.P13nDialogInfo.Titles.columns
		]);
	});

	opaTest("Open column menu with aggregatable property", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Sales Amount (local currency)");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuQuickActions(2);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({
			key: "SalesAmountLocalCurrency",
			label: "Sales Amount (local currency)",
			sortOrder: coreLibrary.SortOrder.None
		});
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickTotal({
			key: "SalesAmountLocalCurrency",
			label: "Sales Amount (local currency)",
			totaled: true
		});
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuItems(4);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItems([
			Util.P13nDialogInfo.Titles.sort,
			Util.P13nDialogInfo.Titles.filter,
			Util.P13nDialogInfo.Titles.group,
			Util.P13nDialogInfo.Titles.columns
		]);
	});
});