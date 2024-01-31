/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Lib",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Arrangements",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Util",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/TestObjects",
	"sap/ui/core/library"
], function(
	/** @type sap.base.Log */ Log,
	Lib,
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.opaQunit */ opaTest,
	/** @type sap.ui.test.Opa5 */ TestLibrary,
	/** @type sap.ui.test.Opa5 */ Arrangements,
	/** @type sap.ui.mdc.qunit.table.OpaTests.pages.Util */ Util,
	/** @type sap.ui.test.PageObjectDefinition */ TestObjects,
	coreLibrary
) {
	"use strict";

	Opa5.extendConfig({
		viewNamespace: "appODataV4Flat",
		arrangements: new Arrangements(),
		autoWait: true,
		async: true,
		timeout: 40,
		debugTimeout: 40,
		pollingInterval: 10,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sTableId = "container-appODataV4Flat---MyView--mdcTable";

	QUnit.module("Basics");

	opaTest("After starting the app I should see a table", function(Given, When, Then) {
		Given.iStartMyApp("appODataV4Flat");
		When.onTheApp.iLookAtTheScreen();
		Then.onTheApp.iShouldSeeATable(sTableId);
	});

	opaTest("The table should have the 'Select All' check box", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheSelectAllCheckBox(sTableId);
	});

	opaTest("The table should have a title", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheHeaderText(sTableId, "Products");
	});

	opaTest("The table should have a item count", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheCount(sTableId);
	});

	opaTest("The table should have a variant management", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheVariantManagement(sTableId);
	});

	opaTest("The table should have the show/hide details button", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "hideDetails", true);
	});

	opaTest("The table should have the paste button", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeThePasteButton(sTableId);
	});

	opaTest("The table shouldn't have the p13n button", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			oTable._setShowP13nButton(false);
		});
		Then.onTheAppMDCTable.iShouldSeeTheP13nButton(sTableId, false);

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuItems(0);
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("The first table column header should have a visible ColumnMenu", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Product ID");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
	});

	opaTest("The ColumnMenu shouldn't have any Table QuickActions", function(Give, When, Then) {
		Then.onTheAppMDCTable.iShouldNotSeeColumnMenuItems();
	});

	opaTest("The table should have the p13n button", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			oTable._setShowP13nButton(true);
		});
		Then.onTheAppMDCTable.iShouldSeeTheP13nButton(sTableId, true);

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuItems(4);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItems([
			Util.P13nDialogInfo.Titles.sort,
			Util.P13nDialogInfo.Titles.filter,
			Util.P13nDialogInfo.Titles.group,
			Util.P13nDialogInfo.Titles.columns
		]);
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	if (Lib.all().hasOwnProperty("sap.ui.export")) {
		QUnit.module("Excel export");

		opaTest("The table should have the export button", function(Given, When, Then) {
			Then.onTheAppMDCTable.iShouldSeeTheExportMenuButton(sTableId);
		});

		opaTest("Export to Excel via quick export", function(Given, When, Then) {
			When.onTheAppMDCTable.iPressQuickExportButton(sTableId);
			Then.onTheAppMDCTable.iShouldSeeExportProcessDialog();
		});

		opaTest("Export to Excel via menu", function(Given, When, Then) {
			When.onTheAppMDCTable.iPressExportMenuButton(sTableId);
			Then.onTheAppMDCTable.iShouldSeeExportMenu();
			When.onTheAppMDCTable.iPressExportButtonInMenu();
			Then.onTheAppMDCTable.iShouldSeeExportProcessDialog();
		});

		opaTest("Export to Excel via Export as...", function(Given, When, Then) {
			When.onTheAppMDCTable.iPressExportMenuButton(sTableId);
			When.onTheAppMDCTable.iPressExportAsButtonInMenu();
			Then.onTheAppMDCTable.iShouldSeeExportSettingsDialog();
			When.onTheAppMDCTable.iFillInExportSettingsDialog(sTableId, {
				fileName: "Products List",
				fileType: "XLSX",
				includeFilterSettings: true,
				splitCells: true
			});
			Then.onTheAppMDCTable.iShouldSeeExportProcessDialog();
		});
	} else {
		Log.warning("sap.ui.export not available", "Export tests are skipped. Ensure sap.ui.export is loaded to execute them");
	}

	QUnit.module("ResponsiveTableType");

	opaTest("Select / de-select all visible rows via 'Select all'", function(Given, When, Then) {
		When.onTheAppMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, true);
		When.onTheAppMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	opaTest("Change the multiSelectMode to 'ClearAll'", function(Given, When, Then) {
		When.onTheAppMDCTable.iChangeMultiSelectMode(sTableId, "ClearAll");
		Then.onTheAppMDCTable.iShouldSeeTheDeselectAllIcon(sTableId);
	});

	opaTest("Select / de-select some rows via the check box", function(Given, When, Then) {
		When.onTheAppMDCTable.iClickOnRowSelectCheckBox(sTableId, 3, 6);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 3, 6);
		When.onTheAppMDCTable.iClickOnRowSelectCheckBox(sTableId, 6, 6);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 3, 5);
		When.onTheAppMDCTable.iClickOnClearAllIcon(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	opaTest("Interact with the Show / Hide Details button", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeePopins(sTableId, false);
		When.onTheAppMDCTable.iPressShowMoreButton(sTableId);
		Then.onTheAppMDCTable.iShouldSeePopins(sTableId, true);
		When.onTheAppMDCTable.iPressShowLessButton(sTableId);
		Then.onTheAppMDCTable.iShouldSeePopins(sTableId, false);
	});

	opaTest("Tests the public actions in combination with a ResponsiveTable", function(Given, When, Then) {
		When.onTheAppMDCTable.iChangeMultiSelectMode(sTableId, "Default");
		When.onTheAppMDCTable.iSelectAllRows(sTableId); // <- public action
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, true);
		When.onTheAppMDCTable.iClearSelection(sTableId); // <- public action
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
		When.onTheAppMDCTable.iSelectRows(sTableId, 3); // <- public action
		When.onTheAppMDCTable.iSelectRows(sTableId, 4);
		When.onTheAppMDCTable.iSelectRows(sTableId, 5);
		When.onTheAppMDCTable.iSelectRows(sTableId, 6);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 3, 6);
		When.onTheAppMDCTable.iClearSelection(sTableId); // <- public action
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	QUnit.module("Filter info bar");

	opaTest("Filter and open filter info bar", function(Given, When, Then) {
		// Filter 'Category' column
		When.onTheMDCTable.iPersonalizeFilter(sTableId, [{key: "Category", values: ["*Notebooks*"], inputControl: sTableId + "--filter--Category"}]);

		// Check if Info Filter Bar is visible
		Then.onTheAppMDCTable.iShouldSeeInfoFilterBarWithFilters(sTableId, ["Category"]);

		// Press Info Filter Bar and check if filter is set
		When.onTheAppMDCTable.iPressFilterInfoBar(sTableId);
		Then.onTheAppMDCTable.iShouldSeeP13nDialog();
		Then.onTheAppMDCTable.iShouldSeeValuesInFilterDialog("Category", "Notebooks");

		// Check Focus Handling when closing the dialog
		When.P13nActions.iPressDialogOk();
		Then.onTheAppMDCTable.iShouldSeeFocusOnControl(sTableId);
	});

	opaTest("Remove all filter via info filterbar", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeInfoFilterBarWithFilters(sTableId, ["Category"]);
		When.onTheAppMDCTable.iRemoveAllFiltersViaInfoFilterBar(sTableId);
		Then.onTheAppMDCTable.iShouldNotSeeInfoFilterBar(sTableId);
	});

	opaTest("Select a column from column header menu", function (Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Supplier");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuItems(4);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItems([
			Util.P13nDialogInfo.Titles.sort,
			Util.P13nDialogInfo.Titles.filter,
			Util.P13nDialogInfo.Titles.group,
			Util.P13nDialogInfo.Titles.columns
		]);

		When.onTheAppMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.columns);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItemContent(Util.P13nDialogInfo.Titles.columns);
		When.P13nActions.iSelectColumns(["Range of Creation Date", "Product", "Name"], false);
		When.onTheAppMDCTable.iConfirmColumnMenuItemContent();
		Then.onTheAppMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", false);

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Supplier");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.columns);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItemContent(Util.P13nDialogInfo.Titles.columns);
		When.P13nActions.iSelectColumns(["Name"], false);
		When.onTheAppMDCTable.iConfirmColumnMenuItemContent();
		Then.onTheAppMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", true);

		When.P13nActions.iSelectVariant("Standard");
		Then.onTheAppMDCTable.iShouldSeeSelectedVariant("Standard");
	});

	opaTest("When I select the 'Country' column and press ok, the table should be changed", function (Given, When, Then) {
		When.onTheAppMDCTable.iOpenP13nDialog();
		Then.onTheAppMDCTable.iShouldSeeP13nDialog();
		When.P13nActions.iSelectColumns(["Range of Creation Date", "Product", "Category"], null, undefined);

		When.P13nActions.iPressDialogOk();

		When.onTheAppMDCTable.iOpenP13nDialog();
		Then.onTheAppMDCTable.iShouldSeeP13nDialog();
		When.P13nActions.iSelectColumns(["Category"], null, undefined);
		When.P13nActions.iPressDialogOk();
		Then.onTheAppMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", true);

		When.P13nActions.iSelectVariant("Standard");
		Then.onTheAppMDCTable.iShouldSeeSelectedVariant("Standard");
	});

	opaTest("When I remove column and add another column the showDetail button is not visible", function (Given, When, Then) {
		When.onTheAppMDCTable.iOpenP13nDialog();
		Then.onTheAppMDCTable.iShouldSeeP13nDialog();
		When.P13nActions.iSelectColumns(["Range of Creation Date", "Product", "Category"], null, undefined);

		When.P13nActions.iPressDialogOk();

		When.onTheAppMDCTable.iOpenP13nDialog();
		Then.onTheAppMDCTable.iShouldSeeP13nDialog();
		When.P13nActions.iSelectColumns(["Category"], null, undefined);
		When.P13nActions.iPressDialogOk();

		When.onTheAppMDCTable.iOpenP13nDialog();
		Then.onTheAppMDCTable.iShouldSeeP13nDialog();
		When.P13nActions.iSelectColumns(["Category"], null, undefined);
		When.P13nActions.iPressDialogOk();
		Then.onTheAppMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", false);

		When.onTheAppMDCTable.iOpenP13nDialog();
		Then.onTheAppMDCTable.iShouldSeeP13nDialog();
		When.P13nActions.iSelectColumns(["ChangedAt"], null, undefined);
		When.P13nActions.iPressDialogOk();
		Then.onTheAppMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", true);

		When.P13nActions.iSelectVariant("Standard");
		Then.onTheAppMDCTable.iShouldSeeSelectedVariant("Standard");
	});

	QUnit.module("GridTableType");

	opaTest("The table should be changed to type 'Table' so it has a GridTable inside", function(Given, When, Then) {
		When.onTheAppMDCTable.iChangeType(sTableId, "Table");
		Then.onTheAppMDCTable.iShouldSeeTheDeselectAllIcon(sTableId);
	});

	opaTest("Select / de-select some rows via the check box", function(Given, When, Then) {
		When.onTheAppMDCTable.iClickOnRowSelectCheckBox(sTableId, 2, 8);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 2, 8);
		When.onTheAppMDCTable.iClickOnRowSelectCheckBox(sTableId, 6, 6);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 2, 5);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 7, 8);
		When.onTheAppMDCTable.iClickOnClearAllIcon(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	opaTest("Select / de-select all visible rows via 'Select all'", function(Given, When, Then) {
		When.onTheAppMDCTable.iChangeLimit(sTableId, 0);
		Then.onTheAppMDCTable.iShouldSeeTheSelectAllCheckBox(sTableId);
		When.onTheAppMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, true);
		When.onTheAppMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	opaTest("Tests the public actions in combination with a GridTable", function(Given, When, Then) {
		When.onTheAppMDCTable.iSelectAllRows(sTableId); // <- public action
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, true);
		When.onTheAppMDCTable.iClearSelection(sTableId); // <- public action
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
		When.onTheAppMDCTable.iSelectRows(sTableId, 2); // <- public action
		When.onTheAppMDCTable.iSelectRows(sTableId, 3);
		When.onTheAppMDCTable.iSelectRows(sTableId, 4);
		When.onTheAppMDCTable.iSelectRows(sTableId, 5);
		When.onTheAppMDCTable.iSelectRows(sTableId, 6);
		When.onTheAppMDCTable.iSelectRows(sTableId, 7);
		When.onTheAppMDCTable.iSelectRows(sTableId, 8);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 2, 8);
		When.onTheAppMDCTable.iClearSelection(sTableId); // <- public action
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	QUnit.module("Column menu");

	opaTest("Open column menu", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuQuickActions(2);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.None});
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: false});
		Then.onTheAppMDCTable.iShouldSeeNumberOfColumnMenuItems(4);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItems([
			Util.P13nDialogInfo.Titles.sort,
			Util.P13nDialogInfo.Titles.filter,
			Util.P13nDialogInfo.Titles.group,
			Util.P13nDialogInfo.Titles.columns
		]);
	});

	opaTest("Sort with column menu quick action", function(Given, When, Then) {
		When.onTheAppMDCTable.iUseColumnMenuQuickSort({key: "Category", sortOrder: coreLibrary.SortOrder.Ascending});
		Then.onTheAppMDCTable.iShouldSeeColumnSorted(sTableId, "Category", false);
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.Ascending});
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Group with column menu quick action", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppMDCTable.iUseColumnMenuQuickGroup({key: "Category", grouped: true});
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: true});
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Sort with column menu item", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.sort);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItemContent(Util.P13nDialogInfo.Titles.sort);

		When.onTheAppMDCTable.iSortByColumnInColumnMenuItemContent("Product");
		When.onTheAppMDCTable.iPressConfirmInColumnMenuItemContent();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.sort);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItemContent(Util.P13nDialogInfo.Titles.sort);
		Then.onTheAppMDCTable.iShouldSeeSortedByColumnInColumnMenuItem("Product");
		Then.onTheAppMDCTable.iShouldSeeSortDirectionInColumnMenuItem(false);
		When.onTheAppMDCTable.iPressConfirmInColumnMenuItemContent();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.None});
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: true});
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Product");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "ProductID", label: "Product", sortOrder: coreLibrary.SortOrder.Ascending});
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Reset changes", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.sort);
		When.onTheAppMDCTable.iPressResetInColumnMenuItemContent();
		When.onTheAppMDCTable.iNavigateBackFromColumnMenuItemContent();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.None});
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: true});
	});

	opaTest("Close column menu", function(Given, When, Then) {
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Group with column menu quick action", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppMDCTable.iUseColumnMenuQuickGroup({key: "Category", grouped: false});
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Filter and open filter info bar", function(Given, When, Then) {
		// Filter 'Category' column
		When.onTheMDCTable.iPersonalizeFilter(sTableId, [{key: "Category", values: ["*Notebooks*"], inputControl: sTableId + "--filter--Category"}]);

		// Check if Info Filter Bar is visible
		Then.onTheAppMDCTable.iShouldSeeInfoFilterBarWithFilters(sTableId, ["Category"]);

		// Press Info Filter Bar and check if filter is set
		When.onTheAppMDCTable.iPressFilterInfoBar(sTableId);
		Then.onTheAppMDCTable.iShouldSeeP13nDialog();
		Then.onTheAppMDCTable.iShouldSeeValuesInFilterDialog("Category", "Notebooks");

		// Check Focus Handling when closing the dialog
		When.P13nActions.iPressDialogOk();
		Then.onTheAppMDCTable.iShouldSeeFocusOnControl(sTableId);
	});

	opaTest("Remove all filter via info filterbar", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeInfoFilterBarWithFilters(sTableId, ["Category"]);
		When.onTheAppMDCTable.iRemoveAllFiltersViaInfoFilterBar(sTableId);
		Then.onTheAppMDCTable.iShouldNotSeeInfoFilterBar(sTableId);

		Then.iTeardownMyAppFrame();
	});

});