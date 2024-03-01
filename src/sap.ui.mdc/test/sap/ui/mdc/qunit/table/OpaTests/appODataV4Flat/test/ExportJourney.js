/* global QUnit */

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/core/Lib"
], function(
	/** @type sap.ui.test.opaQunit */ opaTest,
	Lib
) {
	"use strict";

	const sTableId = "mdcTable";

	if (!Lib.all().hasOwnProperty("sap.ui.export")) {
		// Make at least one assertion to avoid "did not report any tests" error
		QUnit.test("sap.ui.export not available", () => {
			QUnit.assert.ok(true, "Make sure that the sap.ui.export library can be loaded to run the tests");
		});
		return;
	}

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
});