/* global QUnit */

sap.ui.define([
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Util",
	"sap/ui/test/actions/Press",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/ui/core/library"
], function(
	/** @type sap.ui.test.opaQunit */ opaTest,
	/** @type sap.ui.mdc.qunit.table.OpaTests.pages.Util */ Util,
	Press,
	TableP13nMode,
	coreLibrary
) {
	"use strict";

	const sTableId = "mdcTable";

	QUnit.module("Toolbar content");

	opaTest("Title should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheHeaderText(sTableId, "Products");
	});

	opaTest("Row count should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheCount(sTableId);
	});

	opaTest("Variant management should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheVariantManagement(sTableId);
	});

	opaTest("Paste button should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeThePasteButton(sTableId);
	});

	opaTest("P13n button should be visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheP13nButton(sTableId);
	});

	opaTest("P13n button should be hidden", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			oTable._setShowP13nButton(false);
		});
		Then.onTheAppMDCTable.iShouldSeeTheP13nButton(sTableId, false);
	});

	QUnit.module("Filter info bar");

	opaTest("Filter and open filter info bar", function(Given, When, Then) {
		// Filter 'Category' column
		When.onTheMDCTable.iPersonalizeFilter(sTableId, [{key: "Category", values: ["*Notebooks*"], inputControl: sTableId + "--filter--Category"}]);

		// Check if Info Filter Bar is visible
		Then.onTheAppMDCTable.iShouldSeeInfoFilterBarWithFilters(sTableId, ["Category"]);

		// Press Info Filter Bar and check if filter is set
		When.onTheAppMDCTable.iPressFilterInfoBar(sTableId);
		Then.P13nAssertions.iShouldSeeTheFilterDialog();
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

	QUnit.module("Column menu");

	opaTest("Open column menu", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			// TODO: Move tests related to grouping to ResponsiveTableJourney and DataAggregation app -> TableJourney. The mock server used in this
			//       app does not support grouping of the GridTable.
			oTable.setP13nMode(oTable.getP13nMode().concat(TableP13nMode.Group));
		});

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
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
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.Ascending});
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Group with column menu quick action", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		When.onTheAppMDCTable.iUseColumnMenuQuickGroup({key: "Category", grouped: true});
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: true});
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Sort with column menu item", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		When.onTheAppMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.sort);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItemContent(Util.P13nDialogInfo.Titles.sort);

		When.onTheAppMDCTable.iSortByColumnInColumnMenuItemContent("Name");
		When.onTheAppMDCTable.iPressConfirmInColumnMenuItemContent();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		When.onTheAppMDCTable.iPressOnColumnMenuItem(Util.P13nDialogInfo.Titles.sort);
		Then.onTheAppMDCTable.iShouldSeeColumnMenuItemContent(Util.P13nDialogInfo.Titles.sort);
		Then.onTheAppMDCTable.iShouldSeeSortedByColumnInColumnMenuItem("Name");
		Then.onTheAppMDCTable.iShouldSeeSortDirectionInColumnMenuItem(false);
		When.onTheAppMDCTable.iPressConfirmInColumnMenuItemContent();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "Category", label: "Category", sortOrder: coreLibrary.SortOrder.None});
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickGroup({key: "Category", label: "Category", grouped: true});
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();

		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Product Name");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickSort({key: "Name", label: "Name", sortOrder: coreLibrary.SortOrder.Ascending});
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("Reset changes", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
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
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		When.onTheAppMDCTable.iUseColumnMenuQuickGroup({key: "Category", grouped: false});
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
	});

	opaTest("P13n button hidden", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			oTable._setShowP13nButton(false);
		});
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Category");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeColumnMenuItems();
		When.onTheAppMDCTable.iCloseTheColumnMenu();
		Then.onTheAppMDCTable.iShouldNotSeeTheColumnMenu();
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			oTable._setShowP13nButton(true);
		});
	});

	QUnit.module("DataStateIndicator");

	opaTest("Set Messages", function(Given, When, Then) {
		When.waitFor({
			id: "setMessagesButton",
			actions: new Press()
		});
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 201);
	});

	opaTest("Filter by messages", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressFilterOfDataStateIndicator(sTableId);
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 1);
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {index: 0, data: {ProductID: "HT-1002"}});
	});

	opaTest("Press filter info bar to open filter dialog", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressFilterInfoBarOfDataStateIndicator(sTableId);
		Then.P13nAssertions.iShouldSeeTheFilterDialog();
		Then.P13nActions.iPressDialogCancel();
	});

	opaTest("Remove message filtering", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressFilterOfDataStateIndicator(sTableId);
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 201);
	});
});