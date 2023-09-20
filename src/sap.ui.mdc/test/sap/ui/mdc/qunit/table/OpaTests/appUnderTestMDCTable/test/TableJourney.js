/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary',
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Arrangements",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Util",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/AppUnderTestMDCTable",
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	"sap/ui/core/library"
], function(
	/** @type sap.base.Log */ Log,
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.opaQunit */ opaTest,
	/** @type sap.ui.test.Opa5 */ TestLibrary,
	/** @type sap.ui.test.Opa5 */ Arrangements,
	/** @type sap.ui.mdc.qunit.table.OpaTests.pages.Util */ Util,
	/** @type sap.ui.test.PageObjectDefinition */ TestObjects,
	/** @type sap.ui.test.Opa5 */ P13nActions,
	coreLibrary) {
	"use strict";

	if (window.blanket) {
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		viewNamespace: "appUnderTestMDCTable",
		arrangements: new Arrangements(),
		actions: {
			P13nActions: new P13nActions()
		},
		autoWait: true,
		async: true,
		timeout: 40,
		debugTimeout: 40,
		pollingInterval: 10,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sTableId = "container-appUnderTestMDCTable---MyView--mdcTable";

	QUnit.module("MDC Table OpaTests");

	opaTest("After starting the OPA tests and I look at the screen I should see an MDCTable", function(Given, When, Then) {
		//insert application
		Given.iStartMyApp("appUnderTestMDCTable");
		When.onTheAppUnderTestMDCTable.iLookAtTheScreen();
		Then.onTheAppUnderTestMDCTable.iShouldSeeATable(sTableId);
	});

	/* =========================================================== */
	/* opaTests that are tableType independent                     */
	/* =========================================================== */
	opaTest("The table should have the 'Select All' check box", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheSelectAllCheckBox(sTableId);
	});

	opaTest("The table should have a title", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheHeaderText(sTableId, "Products");
	});

	opaTest("The table should have a item count", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheCount(sTableId);
	});

	opaTest("The table should have a variant management", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheVariantManagement(sTableId);
	});

	opaTest("The table should have the show/hide details button", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "hideDetails", true);
	});

	opaTest("The table should have the paste button", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldSeeThePasteButton(sTableId);
	});

	opaTest("The table shouldn't have the p13n button", function(Given, When, Then) {
		Given.iGetTheTableInstance(sTableId, function(oTable) {
			oTable._setShowP13nButton(false);
		});
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheP13nButton(sTableId, false);

		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldSeeNumberOfColumnMenuItems(0);
		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("The first table column header should have a visible ColumnMenu", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Product ID");
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheColumnMenu();
	});

	opaTest("The ColumnMenu shouldn't have any Table QuickActions", function(Give, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeColumnMenuItems();
	});

	opaTest("The table should have the p13n button", function(Given, When, Then) {
		Given.iGetTheTableInstance(sTableId, function(oTable) {
			oTable._setShowP13nButton(true);
		});
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheP13nButton(sTableId, true);

		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldSeeNumberOfColumnMenuItems(4);
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuItems([
			Util.P13nDialogInfo.Titles.sort,
			Util.P13nDialogInfo.Titles.filter,
			Util.P13nDialogInfo.Titles.group,
			Util.P13nDialogInfo.Titles.columns
		]);
		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();
	});

	/* ================================================================ */
	/* opaTests related to the excel export                             */
	/*                                                                  */
	/* THESE TESTS ARE SKIPPED IF NO sap.ui.export LIBRARY IS AVAILABLE */
	/* ================================================================ */
	if (sap.ui.getCore().getLoadedLibraries().hasOwnProperty("sap.ui.export")) {
		opaTest("The table should have the export button", function(Given, When, Then) {
			Then.onTheAppUnderTestMDCTable.iShouldSeeTheExportMenuButton(sTableId);
		});

		opaTest("Export to Excel via quick export", function(Given, When, Then) {
			When.onTheAppUnderTestMDCTable.iPressQuickExportButton(sTableId);
			Then.onTheAppUnderTestMDCTable.iShouldSeeExportProcessDialog();
		});

		opaTest("Export to Excel via menu", function(Given, When, Then) {
			When.onTheAppUnderTestMDCTable.iPressExportMenuButton(sTableId);
			Then.onTheAppUnderTestMDCTable.iShouldSeeExportMenu();
			When.onTheAppUnderTestMDCTable.iPressExportButtonInMenu();
			Then.onTheAppUnderTestMDCTable.iShouldSeeExportProcessDialog();
		});

		opaTest("Export to Excel via Export as...", function(Given, When, Then) {
			When.onTheAppUnderTestMDCTable.iPressExportMenuButton(sTableId);
			When.onTheAppUnderTestMDCTable.iPressExportAsButtonInMenu();
			Then.onTheAppUnderTestMDCTable.iShouldSeeExportSettingsDialog();
			When.onTheAppUnderTestMDCTable.iFillInExportSettingsDialog(sTableId, {
				fileName: "Products List",
				fileType: "XLSX",
				includeFilterSettings: true,
				splitCells: true
			});
			Then.onTheAppUnderTestMDCTable.iShouldSeeExportProcessDialog();
		});
	} else {
		Log.warning("sap.ui.export not available", "Export tests are skipped, ensure sap.ui.export is loaded to execute them");
	}

	/* =========================================================== */
	/* opaTests when tableType is ResponsiveTableType              */
	/* =========================================================== */
	opaTest("Select / de-select all visible rows via 'Select all'", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, true);
		When.onTheAppUnderTestMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	opaTest("Change the multiSelectMode to 'ClearAll'", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iChangeMultiSelectMode(sTableId, "ClearAll");
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheDeselectAllIcon(sTableId);
	});

	opaTest("Select / de-select some rows via the check box", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iClickOnRowSelectCheckBox(sTableId, 3, 6);
		Then.onTheAppUnderTestMDCTable.iShouldSeeSomeRowsSelected(sTableId, 3, 6);
		When.onTheAppUnderTestMDCTable.iClickOnRowSelectCheckBox(sTableId, 6, 6);
		Then.onTheAppUnderTestMDCTable.iShouldSeeSomeRowsSelected(sTableId, 3, 5);
		When.onTheAppUnderTestMDCTable.iClickOnClearAllIcon(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	opaTest("Interact with the Show / Hide Details button", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldSeePopins(sTableId, false);
		When.onTheAppUnderTestMDCTable.iPressShowMoreButton(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeePopins(sTableId, true);
		When.onTheAppUnderTestMDCTable.iPressShowLessButton(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeePopins(sTableId, false);
	});

	//test the public actions
	opaTest("Tests the public actions in combination with a ResponsiveTable", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iChangeMultiSelectMode(sTableId, "Default");
		When.onTheAppUnderTestMDCTable.iSelectAllRows(sTableId); // <- public action
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, true);
		When.onTheAppUnderTestMDCTable.iClearSelection(sTableId); // <- public action
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 3); // <- public action
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 4);
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 5);
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 6);
		Then.onTheAppUnderTestMDCTable.iShouldSeeSomeRowsSelected(sTableId, 3, 6);
		When.onTheAppUnderTestMDCTable.iClearSelection(sTableId); // <- public action
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	opaTest("Filter and open filter info bar", function(Given, When, Then) {
		// Filter 'Category' column
		When.onTheMDCTable.iPersonalizeFilter(sTableId, [{key: "Category", values: ["*Notebooks*"], inputControl: sTableId + "--filter--Category"}]);

		// Check if Info Filter Bar is visible
		Then.onTheAppUnderTestMDCTable.iShouldSeeInfoFilterBarWithFilters(sTableId, ["Category"]);

		// Press Info Filter Bar and check if filter is set
		When.onTheAppUnderTestMDCTable.iPressFilterInfoBar(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeeP13nDialog();
		Then.onTheAppUnderTestMDCTable.iShouldSeeValuesInFilterDialog("Category", "Notebooks");

		// Check Focus Handling when closing the dialog
		When.P13nActions.iPressDialogOk();
		Then.onTheAppUnderTestMDCTable.iShouldSeeFocusOnControl(sTableId);
	});

	opaTest("Remove all filter via info filterbar", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldSeeInfoFilterBarWithFilters(sTableId, ["Category"]);
		When.onTheAppUnderTestMDCTable.iRemoveAllFiltersViaInfoFilterBar(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeInfoFilterBar(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeeFocusOnControl(sTableId);
	});

	opaTest("Select a column from column header menu", function (Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Supplier");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldSeeNumberOfColumnMenuItems(4);
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuItems([
			Util.P13nDialogInfo.Titles.sort,
			Util.P13nDialogInfo.Titles.filter,
			Util.P13nDialogInfo.Titles.group,
			Util.P13nDialogInfo.Titles.columns
		]);

		When.onTheAppUnderTestMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.columns);
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuItemContent(Util.P13nDialogInfo.Titles.columns);
		When.onTheAppUnderTestMDCTable.iSelectColumns(["Range of Creation Date", "Product", "Name"], false);
		When.onTheAppUnderTestMDCTable.iConfirmColumnMenuItemContent();
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", false);

		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Supplier");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppUnderTestMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.columns);
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuItemContent(Util.P13nDialogInfo.Titles.columns);
		When.onTheAppUnderTestMDCTable.iSelectColumns(["Name"], false);
		When.onTheAppUnderTestMDCTable.iConfirmColumnMenuItemContent();
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", true);

		When.onTheAppUnderTestMDCTable.iSelectVariant("Standard");
		Then.onTheAppUnderTestMDCTable.iShouldSeeSelectedVariant("Standard");
	});

	opaTest("When I select the 'Country' column and press ok, the table should be changed", function (Given, When, Then) {

		When.onTheAppUnderTestMDCTable.iOpenP13nDialog();
		Then.onTheAppUnderTestMDCTable.iShouldSeeP13nDialog();
		When.onTheAppUnderTestMDCTable.iSelectColumns(["Range of Creation Date", "Product", "Category"], null, undefined);

		When.onTheAppUnderTestMDCTable.iPressDialogOk();

		When.onTheAppUnderTestMDCTable.iOpenP13nDialog();
		Then.onTheAppUnderTestMDCTable.iShouldSeeP13nDialog();
		When.onTheAppUnderTestMDCTable.iSelectColumns(["Category"], null, undefined);
		When.onTheAppUnderTestMDCTable.iPressDialogOk();
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", true);

		When.onTheAppUnderTestMDCTable.iSelectVariant("Standard");
		Then.onTheAppUnderTestMDCTable.iShouldSeeSelectedVariant("Standard");
	});

	opaTest("When I remove column and add another column the showDetail button is not visible", function (Given, When, Then) {

		When.onTheAppUnderTestMDCTable.iOpenP13nDialog();
		Then.onTheAppUnderTestMDCTable.iShouldSeeP13nDialog();
		When.onTheAppUnderTestMDCTable.iSelectColumns(["Range of Creation Date", "Product", "Category"], null, undefined);

		When.onTheAppUnderTestMDCTable.iPressDialogOk();

		When.onTheAppUnderTestMDCTable.iOpenP13nDialog();
		Then.onTheAppUnderTestMDCTable.iShouldSeeP13nDialog();
		When.onTheAppUnderTestMDCTable.iSelectColumns(["Category"], null, undefined);
		When.onTheAppUnderTestMDCTable.iPressDialogOk();

		When.onTheAppUnderTestMDCTable.iOpenP13nDialog();
		Then.onTheAppUnderTestMDCTable.iShouldSeeP13nDialog();
		When.onTheAppUnderTestMDCTable.iSelectColumns(["Category"], null, undefined);
		When.onTheAppUnderTestMDCTable.iPressDialogOk();
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", false);

		When.onTheAppUnderTestMDCTable.iOpenP13nDialog();
		Then.onTheAppUnderTestMDCTable.iShouldSeeP13nDialog();
		When.onTheAppUnderTestMDCTable.iSelectColumns(["ChangedAt"], null, undefined);
		When.onTheAppUnderTestMDCTable.iPressDialogOk();
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", true);

		When.onTheAppUnderTestMDCTable.iSelectVariant("Standard");
		Then.onTheAppUnderTestMDCTable.iShouldSeeSelectedVariant("Standard");
	});

	/* =========================================================== */
	/* opaTests when tableType is GridTableType                    */
	/* =========================================================== */
	opaTest("The table should be changed to type 'Table' so it has a GridTable inside", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iChangeType(sTableId, "Table");
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheDeselectAllIcon(sTableId);
	});

	opaTest("Select / de-select some rows via the check box", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iClickOnRowSelectCheckBox(sTableId, 2, 8);
		Then.onTheAppUnderTestMDCTable.iShouldSeeSomeRowsSelected(sTableId, 2, 8);
		When.onTheAppUnderTestMDCTable.iClickOnRowSelectCheckBox(sTableId, 6, 6);
		Then.onTheAppUnderTestMDCTable.iShouldSeeSomeRowsSelected(sTableId, 2, 5);
		Then.onTheAppUnderTestMDCTable.iShouldSeeSomeRowsSelected(sTableId, 7, 8);
		When.onTheAppUnderTestMDCTable.iClickOnClearAllIcon(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	opaTest("Select / de-select all visible rows via 'Select all'", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iChangeLimit(sTableId, 0);
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheSelectAllCheckBox(sTableId);
		When.onTheAppUnderTestMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, true);
		When.onTheAppUnderTestMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	//test the public actions
	opaTest("Tests the public actions in combination with a GridTable", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iSelectAllRows(sTableId); // <- public action
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, true);
		When.onTheAppUnderTestMDCTable.iClearSelection(sTableId); // <- public action
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 2); // <- public action
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 3);
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 4);
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 5);
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 6);
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 7);
		When.onTheAppUnderTestMDCTable.iSelectRows(sTableId, 8);
		Then.onTheAppUnderTestMDCTable.iShouldSeeSomeRowsSelected(sTableId, 2, 8);
		When.onTheAppUnderTestMDCTable.iClearSelection(sTableId); // <- public action
		Then.onTheAppUnderTestMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	/* =========================================================== */
	/* Column menu                                                 */
	/* =========================================================== */

	opaTest("Open column menu", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldSeeNumberOfColumnMenuQuickActions(2);
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.None});
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: false});
		Then.onTheAppUnderTestMDCTable.iShouldSeeNumberOfColumnMenuItems(4);
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuItems([
			Util.P13nDialogInfo.Titles.sort,
			Util.P13nDialogInfo.Titles.filter,
			Util.P13nDialogInfo.Titles.group,
			Util.P13nDialogInfo.Titles.columns
		]);
	});

	opaTest("Sort with column menu quick action", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iUseColumnMenuQuickSort({key: "Category", sortOrder: coreLibrary.SortOrder.Ascending});
		Given.iGetTheTableInstance(sTableId, function(oTable) {
			Then.onTheAppUnderTestMDCTable.iShouldSeeColumnSorted(oTable, "Category", false);
		});
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.Ascending});
		When.onTheAppUnderTestMDCTable.iCloseTheColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Group with column menu quick action", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppUnderTestMDCTable.iUseColumnMenuQuickGroup({key: "Category", grouped: true});
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: true});
		When.onTheAppUnderTestMDCTable.iCloseTheColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Sort with column menu item", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppUnderTestMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.sort);
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuItemContent(Util.P13nDialogInfo.Titles.sort);

		When.onTheAppUnderTestMDCTable.iSortByColumnInColumnMenuItemContent("Product");
		When.onTheAppUnderTestMDCTable.iPressConfirmInColumnMenuItemContent();
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppUnderTestMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.sort);
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuItemContent(Util.P13nDialogInfo.Titles.sort);
		Then.onTheAppUnderTestMDCTable.iShouldSeeSortedByColumnInColumnMenuItem("Product");
		Then.onTheAppUnderTestMDCTable.iShouldSeeSortDirectionInColumnMenuItem(false);
		When.onTheAppUnderTestMDCTable.iPressConfirmInColumnMenuItemContent();
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.None});
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: true});
		When.onTheAppUnderTestMDCTable.iCloseTheColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Product");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuQuickSort({key: "ProductID", label: "Product", sortOrder: coreLibrary.SortOrder.Ascending});
		When.onTheAppUnderTestMDCTable.iCloseTheColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Reset  changes", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppUnderTestMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.sort);
		When.onTheAppUnderTestMDCTable.iPressResetInColumnMenuItemContent();
		When.onTheAppUnderTestMDCTable.iNavigateBackFromColumnMenuItemContent();
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.None});
		Then.onTheAppUnderTestMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: true});
	});

	opaTest("Close column menu", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iCloseTheColumnMenu();
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Group with column menu quick action", function(Given, When, Then) {
		When.onTheAppUnderTestMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppUnderTestMDCTable.iShouldSeeOneColumnMenu();
		When.onTheAppUnderTestMDCTable.iUseColumnMenuQuickGroup({key: "Category", grouped: false});
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Filter and open filter info bar", function(Given, When, Then) {
		// Filter 'Category' column
		When.onTheMDCTable.iPersonalizeFilter(sTableId, [{key: "Category", values: ["*Notebooks*"], inputControl: sTableId + "--filter--Category"}]);

		// Check if Info Filter Bar is visible
		Then.onTheAppUnderTestMDCTable.iShouldSeeInfoFilterBarWithFilters(sTableId, ["Category"]);

		// Press Info Filter Bar and check if filter is set
		When.onTheAppUnderTestMDCTable.iPressFilterInfoBar(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeeP13nDialog();
		Then.onTheAppUnderTestMDCTable.iShouldSeeValuesInFilterDialog("Category", "Notebooks");

		// Check Focus Handling when closing the dialog
		When.P13nActions.iPressDialogOk();
		Then.onTheAppUnderTestMDCTable.iShouldSeeFocusOnControl(sTableId);
	});

	opaTest("Remove all filter via info filterbar", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldSeeInfoFilterBarWithFilters(sTableId, ["Category"]);
		When.onTheAppUnderTestMDCTable.iRemoveAllFiltersViaInfoFilterBar(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldNotSeeInfoFilterBar(sTableId);
		Then.onTheAppUnderTestMDCTable.iShouldSeeFocusOnControl(sTableId);

		Then.onTheAppUnderTestMDCTable.iTeardownMyAppFrame();
	});

});