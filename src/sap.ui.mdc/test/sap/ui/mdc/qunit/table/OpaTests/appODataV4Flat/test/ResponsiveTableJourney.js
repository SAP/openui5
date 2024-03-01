/*global QUnit */
sap.ui.define([
	"sap/ui/test/opaQunit"
], function(
	/** @type sap.ui.test.opaQunit */ opaTest
) {
	"use strict";

	const sTableId = "mdcTable";

	QUnit.module("Selection");

	opaTest("Select All visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheSelectAllCheckBox(sTableId);
	});

	opaTest("Select / deselect all visible rows via Select All", function(Given, When, Then) {
		When.onTheAppMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, true);
		When.onTheAppMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	opaTest("Change the multiSelectMode to 'ClearAll'", function(Given, When, Then) {
		When.onTheApp.iGetTheTableInstance(sTableId, function(oTable) {
			oTable.setMultiSelectMode("ClearAll");
		});
		Then.onTheAppMDCTable.iShouldSeeTheDeselectAllIcon(sTableId);
	});

	opaTest("Select / deselect some rows via the check box", function(Given, When, Then) {
		When.onTheAppMDCTable.iClickOnRowSelectCheckBox(sTableId, 3, 6);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 3, 6);
		When.onTheAppMDCTable.iClickOnRowSelectCheckBox(sTableId, 6, 6);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 3, 5);
		When.onTheAppMDCTable.iClickOnClearAllIcon(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	QUnit.module("Show/Hide Details");

	opaTest("Show/Hide Details button visible", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "hideDetails", true);
	});

	opaTest("Press the Show/Hide Details button", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeePopins(sTableId, false);
		When.onTheAppMDCTable.iPressShowMoreButton(sTableId);
		Then.onTheAppMDCTable.iShouldSeePopins(sTableId, true);
		When.onTheAppMDCTable.iPressShowLessButton(sTableId);
		Then.onTheAppMDCTable.iShouldSeePopins(sTableId, false);
	});

	opaTest("Show/Hide columns", function(Given, When, Then) {
		// Hide columns
		When.onTheAppMDCTable.iOpenP13nDialog();
		When.P13nActions.iSelectColumns(["Range of Creation Date", "Product", "Category"], null, undefined);
		When.P13nActions.iPressDialogOk();
		Then.onTheAppMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, null, false);

		// Show a column
		When.onTheAppMDCTable.iOpenP13nDialog();
		When.P13nActions.iSelectColumns(["Category"], null, undefined);
		When.P13nActions.iPressDialogOk();
		Then.onTheAppMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", true);

		// Show one column and hide another one at the same time
		When.onTheAppMDCTable.iOpenP13nDialog();
		When.P13nActions.iSelectColumns(["Category", "ChangedAt"], null, undefined);
		When.P13nActions.iPressDialogOk();
		Then.onTheAppMDCTable.iShouldSeeTheShowHideDetailsButton(sTableId, "showDetails", true);
	});

	return {
		tableType: "ResponsiveTableType"
	};
});