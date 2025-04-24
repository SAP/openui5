/*global QUnit */
sap.ui.define([
	"sap/ui/test/opaQunit"
], function(
	/** @type sap.ui.test.opaQunit */ opaTest
) {
	"use strict";

	const sTableId = "mdcTable";

	QUnit.module("Selection");

	opaTest("Remove the selection limit", function(Given, When, Then) {
		When.onTheAppMDCTable.iChangeSelectionLimit(sTableId, 0);
		Then.onTheAppMDCTable.iShouldSeeTheSelectAllCheckBox(sTableId);
	});

	opaTest("Select / deselect all visible rows via Select All", function(Given, When, Then) {
		When.onTheAppMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, true);
		When.onTheAppMDCTable.iClickOnSelectAllCheckBox(sTableId);
		Then.onTheAppMDCTable.iShouldSeeAllVisibleRowsSelected(sTableId, false);
	});

	opaTest("Select / deselect some rows via the check box", function(Given, When, Then) {
		When.onTheAppMDCTable.iClickOnRowSelectCheckBox(sTableId, 2, 8);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 2, 8);
		When.onTheAppMDCTable.iClickOnRowSelectCheckBox(sTableId, 6, 6);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 2, 5);
		Then.onTheAppMDCTable.iShouldSeeSomeRowsSelected(sTableId, 7, 8);
	});

	QUnit.module("Fixed Column Count");

	opaTest("The column freeze quick action is shown in the column menu", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Created On");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickAction("Freeze");
	});

	opaTest("Set the fixed column count and save it to a variant", function(Given, When, Then) {
		When.onTheAppMDCTable.iUseColumnMenuQuickFreeze();
		Then.onTheAppMDCTable.iCheckFixedColumnCount(sTableId, 1);
		Then.onTheAppMDCTable.iShouldSeeTheVariantManagement(sTableId, true);
		When.P13nActions.iSaveVariantAs("Standard", "TestVariant");
	});

	opaTest("Selecting the Standard variant reverts the number of Fixed columns", function(Given, When, Then) {
		When.P13nActions.iSelectVariant("Standard");
		Then.onTheAppMDCTable.iCheckFixedColumnCount(sTableId, 0);
		When.P13nActions.iSelectVariant("TestVariant");
		Then.onTheAppMDCTable.iCheckFixedColumnCount(sTableId, 1);
	});

	opaTest("Reset the fixed column count", function(Given, When, Then) {
		When.onTheAppMDCTable.iPressOnColumnHeader(sTableId, "Created On");
		Then.onTheAppMDCTable.iShouldSeeTheColumnMenu();
		Then.onTheAppMDCTable.iShouldSeeColumnMenuQuickAction("Freeze");
		When.onTheAppMDCTable.iUseColumnMenuQuickFreeze();
		Then.onTheAppMDCTable.iCheckFixedColumnCount(sTableId, 0);
	});

	return {
		tableType: "GridTableType"
	};
});