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

	return {
		tableType: "GridTableType"
	};
});