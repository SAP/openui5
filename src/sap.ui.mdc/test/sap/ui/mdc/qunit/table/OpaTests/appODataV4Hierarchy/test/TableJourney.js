/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Arrangements",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/TestObjects"
], function(
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.opaQunit */ opaTest,
	/** @type sap.ui.test.Opa5 */ Arrangements,
	/** @type sap.ui.test.PageObjectDefinition */ TestObjects
	) {
	"use strict";

	const sTableId = "mdcTable";

	QUnit.module("Column reordering");

	opaTest("Drag 2nd column to 4th position", function(Given, When, Then) {
		Then.onTheAppMDCTable.iCheckColumnPosition(sTableId, `${sTableId}-Name`, 1);
		When.onTheAppMDCTable.iDragColumn(sTableId, 1);
		When.onTheAppMDCTable.iDropColumnAfter(sTableId, 3);
		Then.onTheAppMDCTable.iCheckColumnPosition(sTableId, `${sTableId}-Name`, 3);
	});

	opaTest("Drag 1st column to 2nd position", function(Given, When, Then) {
		Then.onTheAppMDCTable.iCheckColumnPosition(sTableId, `${sTableId}-ID`, 0);
		When.onTheAppMDCTable.iDragColumn(sTableId, 0);
		When.onTheAppMDCTable.iDropColumnAfter(sTableId, 2);
		Then.onTheAppMDCTable.iCheckColumnPosition(sTableId, `${sTableId}-ID`, 0);
	});

	QUnit.module("Expand/Collapse");

	opaTest("Collapse all", function(Given, When, Then) {
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 6);
		When.onTheAppMDCTable.iClickOnCollapseAllRowsButton(sTableId);
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 1);
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {index: 0, data: {ID: "0"}});
		Then.onTheAppMDCTable.iCheckRowIsEmpty(sTableId, {index: 1});
		When.onTheAppMDCTable.iPressExpandRowButton(sTableId, {index: 0, data: {ID: "0"}});
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 6);
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {index: 1, data: {ID: "1"}});
		When.onTheAppMDCTable.iClickOnCollapseAllRowsButton(sTableId);
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 1);
		Then.onTheAppMDCTable.iCheckRowIsEmpty(sTableId, {index: 1});
	});

	opaTest("Expand all", function(Given, When, Then) {
		When.onTheAppMDCTable.iClickOnExpandAllRowsButton(sTableId);
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 24);
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {index: 8, data: {ID: "1.2.3"}});
		When.onTheAppMDCTable.iPressCollapseRowButton(sTableId, {index: 1, data: {ID: "1"}});
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 17);
		Then.onTheAppMDCTable.iCheckRowData(sTableId, {index: 8, data: {ID: "5.1.1"}});
		When.onTheAppMDCTable.iClickOnExpandAllRowsButton(sTableId);
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 24);
	});
});