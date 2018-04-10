/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.require([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/TableUtils",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/library",
	"sap/ui/core/Control"
], function(qutils, TableUtils, Table, Column, RowAction, TableLibrary, Control) {
	"use strict";

	// Shortcuts
	var SelectionMode = TableLibrary.SelectionMode;

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var iNumberOfCols = window.iNumberOfCols;
	var iNumberOfRows = window.iNumberOfRows;
	var initRowActions = window.initRowActions;

	QUnit.module("TableUtils", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Grouping", function(assert) {
		assert.ok(!!TableUtils.Grouping, "Grouping namespace available");
		assert.ok(TableUtils.Grouping.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.test("Menu", function(assert) {
		assert.ok(!!TableUtils.Menu, "Menu namespace available");
		assert.ok(TableUtils.Menu.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.test("Column", function(assert) {
		assert.ok(!!TableUtils.Column, "Column namespace available");
		assert.ok(TableUtils.Column.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.test("Binding", function(assert) {
		assert.ok(!!TableUtils.Binding, "Binding namespace available");
		assert.ok(TableUtils.Binding.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.test("isRowSelectionAllowed", function(assert) {
		function check(sSelectionBehavior, sSelectionMode, bGroup, bExpected) {
			oTreeTable.setSelectionBehavior(sSelectionBehavior);
			oTreeTable.setSelectionMode(sSelectionMode);
			oTreeTable.setUseGroupMode(bGroup);
			sap.ui.getCore().applyChanges();
			var bRes = TableUtils.isRowSelectionAllowed(oTreeTable);
			assert.ok(bRes && bExpected || !bRes && !bExpected,
				"isRowSelectionAllowed: " + sSelectionBehavior + ", " + sSelectionMode + ", Group: " + bGroup);
		}

		check("RowSelector", "MultiToggle", false, false);
		check("Row", "MultiToggle", false, true);
		check("RowOnly", "MultiToggle", false, true);
		check("RowSelector", "Single", false, false);
		check("Row", "Single", false, true);
		check("RowOnly", "Single", false, true);
		check("RowSelector", "None", false, false);
		check("Row", "None", false, false);
		check("RowOnly", "None", false, false);
		check("RowSelector", "MultiToggle", true, false);
		check("Row", "MultiToggle", true, true);
		check("RowOnly", "MultiToggle", true, true);
		check("RowSelector", "Single", true, false);
		check("Row", "Single", true, true);
		check("RowOnly", "Single", true, true);
		check("RowSelector", "None", true, false);
		check("Row", "None", true, false);
		check("RowOnly", "None", true, false);
	});

	QUnit.test("isRowSelectorSelectionAllowed", function(assert) {
		function check(sSelectionBehavior, sSelectionMode, bGroup, bExpected) {
			oTreeTable.setSelectionBehavior(sSelectionBehavior);
			oTreeTable.setSelectionMode(sSelectionMode);
			oTreeTable.setUseGroupMode(bGroup);
			sap.ui.getCore().applyChanges();
			var bRes = TableUtils.isRowSelectorSelectionAllowed(oTreeTable);
			assert.ok(bRes && bExpected || !bRes && !bExpected,
				"isRowSelectorSelectionAllowed: " + sSelectionBehavior + ", " + sSelectionMode + ", Group: " + bGroup);
		}

		check("RowSelector", "MultiToggle", false, true);
		check("Row", "MultiToggle", false, true);
		check("RowOnly", "MultiToggle", false, false);
		check("RowSelector", "Single", false, true);
		check("Row", "Single", false, true);
		check("RowOnly", "Single", false, false);
		check("RowSelector", "None", false, false);
		check("Row", "None", false, false);
		check("RowOnly", "None", false, false);
		check("RowSelector", "MultiToggle", true, true);
		check("Row", "MultiToggle", true, true);
		check("RowOnly", "MultiToggle", true, true);
		check("RowSelector", "Single", true, true);
		check("Row", "Single", true, true);
		check("RowOnly", "Single", true, true);
		check("RowSelector", "None", true, false);
		check("Row", "None", true, false);
		check("RowOnly", "None", true, false);
	});

	QUnit.test("areAllRowsSelected", function(assert) {
		assert.strictEqual(TableUtils.areAllRowsSelected(), false, "No table was passed: Returned null");

		assert.ok(!TableUtils.areAllRowsSelected(oTable), "Not all rows are selected");
		oTable.selectAll();
		assert.ok(TableUtils.areAllRowsSelected(oTable), "All rows are selected");
		oTable.clearSelection();
		assert.ok(!TableUtils.areAllRowsSelected(oTable), "Not all rows are selected");
		TableUtils.toggleRowSelection(oTable, 0, true);
		assert.ok(!TableUtils.areAllRowsSelected(oTable), "Not all rows are selected");
	});

	QUnit.test("hasRowActions", function(assert) {
		assert.ok(!TableUtils.hasRowActions(oTable), "Table has no row actions");
		oTable.setRowActionCount(2);
		assert.ok(!TableUtils.hasRowActions(oTable), "Table has still no row actions");
		oTable.setRowActionTemplate(new RowAction());
		assert.ok(TableUtils.hasRowActions(oTable), "Table has row actions");
	});

	QUnit.test("getRowActionCount", function(assert) {
		assert.equal(TableUtils.getRowActionCount(oTable), 0, "Table has no row actions");
		oTable.setRowActionCount(2);
		assert.equal(TableUtils.getRowActionCount(oTable), 0, "Table still has no row actions");
		oTable.setRowActionTemplate(new RowAction());
		assert.equal(TableUtils.getRowActionCount(oTable), 2, "Table has 2 row actions");
		oTable.setRowActionCount(1);
		assert.equal(TableUtils.getRowActionCount(oTable), 1, "Table has 1 row action");
	});

	QUnit.test("hasFixedColumns", function(assert) {
		assert.ok(TableUtils.hasFixedColumns(oTable), "Table has fixed columns");
		assert.ok(!TableUtils.hasFixedColumns(oTreeTable), "Table has no fixed columns");
	});

	QUnit.test("isFixedColumn", function(assert) {
		assert.ok(TableUtils.isFixedColumn(oTable, 0), "Column 0 is fixed");
		assert.ok(!TableUtils.isFixedColumn(oTable, 1), "Column 1 is not fixed");
	});

	QUnit.test("isVariableRowHeightEnabled", function(assert) {
		assert.ok(!TableUtils.isVariableRowHeightEnabled(oTable), "VariableRowHeight is disabled by default.");
		oTable._bVariableRowHeightEnabled = true;
		assert.ok(TableUtils.isVariableRowHeightEnabled(oTable), "VariableRowHeight is enabled when bVariableRowHeight is true.");

		oTable.setFixedRowCount(1);
		assert.ok(!TableUtils.isVariableRowHeightEnabled(oTable), "VariableRowHeight is disabled when fixed top rows are available.");
		oTable.setFixedRowCount(0);
		oTable.setFixedBottomRowCount(1);
		assert.ok(!TableUtils.isVariableRowHeightEnabled(oTable), "VariableRowHeight is disabled when fixed bottom rows are available.");
		oTable.setFixedRowCount(0);
		oTable.setFixedBottomRowCount(0);
	});

	QUnit.test("getCellInfo", function(assert) {
		initRowActions(oTable, 1, 1);
		oTable.getColumns()[1].setVisible(false);
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_1_1"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_3_2"}));
		oTable.getColumns()[2].setHeaderSpan(2);
		sap.ui.getCore().applyChanges();

		/* Data Cells */

		var oCell = getCell(0, 0);
		var oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.cell.get(0), oCell.get(0), "Data Cell: Correct cell object returned");
		assert.strictEqual(oInfo.isOfType(), false, "No parameter was passed to isOfType() -> Returned false");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.DATACELL), "Is DATACELL");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER), "Is not COLUMNHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ROWHEADER), "Is not ROWHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ROWACTION), "Is not ROWACTION");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.COLUMNROWHEADER), "Is not COLUMNROWHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANYCONTENTCELL), "Is ANYCONTENTCELL");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYCOLUMNHEADER), "Is not ANYCOLUMNHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYROWHEADER), "Is not ANYROWHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANY), "Is ANY");
		assert.strictEqual(oInfo.rowIndex, 0, "Row Index: 0");
		assert.strictEqual(oInfo.columnIndex, 0, "Column Index: 0");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");

		oInfo = TableUtils.getCellInfo(getCell(1, 1));
		assert.strictEqual(oInfo.rowIndex, 1, "Row Index: 1");
		assert.strictEqual(oInfo.columnIndex, 2, "Column Index: 2");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");

		/* Column Header Cells */

		oCell = getColumnHeader(0);
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.cell.get(0), oCell.get(0), "Column Header Cell: Correct cell object returned");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.DATACELL), "Is not DATACELL");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER), "Is COLUMNHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ROWHEADER), "Is not ROWHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ROWACTION), "Is not ROWACTION");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.COLUMNROWHEADER), "Is not COLUMNROWHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYCONTENTCELL), "Is not ANYCONTENTCELL");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANYCOLUMNHEADER), "Is ANYCOLUMNHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYROWHEADER), "Is not ANYROWHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANY), "Is ANY");
		assert.strictEqual(oInfo.rowIndex, 0, "Row Index: 0");
		assert.strictEqual(oInfo.columnIndex, 0, "Column Index: 0");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");

		oCell = getColumnHeader(1);
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.rowIndex, 0, "Row Index: 0");
		assert.strictEqual(oInfo.columnIndex, 2, "Column Index: 2");
		assert.strictEqual(oInfo.columnSpan, 2, "Span Length: 2");

		oCell = getColumnHeader(2);
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.rowIndex, 0, "Row Index: 0");
		assert.strictEqual(oInfo.columnIndex, 3, "Column Index: 3");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");

		oCell = jQuery.sap.domById(getColumnHeader(2).attr("id") + "_1");
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.rowIndex, 1, "Row Index: 1");
		assert.strictEqual(oInfo.columnIndex, 3, "Column Index: 3");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");

		/* Row Header Cells */

		oCell = getRowHeader(0);
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.cell.get(0), oCell.get(0), "Row Header Cell: Correct cell object returned");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.DATACELL), "Is not DATACELL");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER), "Is not COLUMNHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ROWHEADER), "Is ROWHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ROWACTION), "Is not ROWACTION");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.COLUMNROWHEADER), "Is not COLUMNROWHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANYCONTENTCELL), "Is ANYCONTENTCELL");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYCOLUMNHEADER), "Is not ANYCOLUMNHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANYROWHEADER), "Is ANYROWHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANY), "Is ANY");
		assert.strictEqual(oInfo.rowIndex, 0, "Row Index: 0");
		assert.strictEqual(oInfo.columnIndex, -1, "Column Index: -1");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");

		/* Row Action Cells */

		oCell = getRowAction(0);
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.cell.get(0), oCell.get(0), "Row Action Cell: Correct cell object returned");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.DATACELL), "Is not DATACELL");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER), "Is not COLUMNHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ROWHEADER), "Is not ROWHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ROWACTION), "Is ROWACTION");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.COLUMNROWHEADER), "Is not COLUMNROWHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANYCONTENTCELL), "Is ANYCONTENTCELL");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYCOLUMNHEADER), "Is not ANYCOLUMNHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYROWHEADER), "Is not ANYROWHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANY), "Is ANY");
		assert.strictEqual(oInfo.rowIndex, 0, "Row Index: 0");
		assert.strictEqual(oInfo.columnIndex, -2, "Column Index: -2");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");

		/* SelectAll Cell */

		oCell = getSelectAll();
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.cell.get(0), oCell.get(0), "SelectAll Cell: Correct cell object returned");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.DATACELL), "Is not DATACELL");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER), "Is not COLUMNHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ROWHEADER), "Is not ROWHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ROWACTION), "Is not ROWACTION");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.COLUMNROWHEADER), "Is COLUMNROWHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYCONTENTCELL), "Is not ANYCONTENTCELL");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANYCOLUMNHEADER), "Is ANYCOLUMNHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANYROWHEADER), "Is ANYROWHEADER");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.ANY), "Is ANY");
		assert.strictEqual(oInfo.rowIndex, null, "Row Index: null");
		assert.strictEqual(oInfo.columnIndex, -1, "Column Index: -1");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");

		/* Not a table cell */

		var oDefaultInfo = {
			type: 0,
			cell: null,
			rowIndex: null,
			columnIndex: null,
			columnSpan: null
		};

		oInfo = TableUtils.getCellInfo(null);
		delete oInfo.isOfType;
		assert.deepEqual(oInfo, oDefaultInfo, "Passed null as parameter -> Returned the info object with default values");

		oInfo = TableUtils.getCellInfo(jQuery.sap.domById("outerelement"));
		delete oInfo.isOfType;
		assert.deepEqual(oInfo, oDefaultInfo, "Passed a dom element which is no table cell -> Returned the info object with default values");
	});

	QUnit.test("hasRowHeader", function(assert) {
		assert.ok(TableUtils.hasRowHeader(oTable), "Table has row header in selectionMode 'MultiToggle'");

		oTable.setSelectionMode(SelectionMode.None);
		sap.ui.getCore().applyChanges();
		assert.ok(!TableUtils.hasRowHeader(oTable), "Table has row header in selectionMode 'None'");

		oTable.setSelectionMode(SelectionMode.MultiToggle);
		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);
		sap.ui.getCore().applyChanges();
		assert.ok(!TableUtils.hasRowHeader(oTable), "Table has row header in selectionBehavior 'RowOnly'");
	});

	QUnit.test("hasSelectAll", function(assert) {
		function test(bEnableSelectAll, sSelectionMode, bShouldHaveSelectAll) {
			oTable.setEnableSelectAll(bEnableSelectAll);
			oTable.setSelectionMode(sSelectionMode);
			assert.strictEqual(TableUtils.hasSelectAll(oTable), bShouldHaveSelectAll,
				"The table should " + (bShouldHaveSelectAll ? "" : "not ") + "have a SelectAll checkbox"
			);
		}

		assert.ok(!TableUtils.hasSelectAll(), "Returned false: No parameter passed");
		test(false, SelectionMode.None, false);
		test(false, SelectionMode.Single, false);
		test(false, SelectionMode.Multi, false);
		test(false, SelectionMode.MultiToggle, false);
		test(true, SelectionMode.None, false);
		test(true, SelectionMode.Single, false);
		test(true, SelectionMode.Multi, true);
		test(true, SelectionMode.MultiToggle, true);
	});

	QUnit.test("hasRowHighlights", function(assert) {
		assert.ok(!TableUtils.hasRowHighlights(), "No table instance passed: Returned false");

		oTable.setRowSettingsTemplate(null);
		assert.ok(!TableUtils.hasRowHighlights(oTable), "No row settings configured: Returned false");

		oTable.setRowSettingsTemplate(new sap.ui.table.RowSettings({
			highlight: null
		}));
		assert.ok(!TableUtils.hasRowHighlights(oTable), "No row highlight configured: Returned false");

		oTable.setRowSettingsTemplate(new sap.ui.table.RowSettings({
			highlight: sap.ui.core.MessageType.None
		}));
		assert.ok(!TableUtils.hasRowHighlights(oTable), "Row highlight is set to 'None': Returned false");

		oTable.setRowSettingsTemplate(new sap.ui.table.RowSettings({
			highlight: sap.ui.core.MessageType.Success
		}));
		assert.ok(TableUtils.hasRowHighlights(oTable), "Row highlight is set to 'Success': Returned true");

		oTable.setRowSettingsTemplate(new sap.ui.table.RowSettings({
			highlight: sap.ui.core.MessageType.Warning
		}));
		assert.ok(TableUtils.hasRowHighlights(oTable), "Row highlight is set to 'Warning': Returned true");

		oTable.setRowSettingsTemplate(new sap.ui.table.RowSettings({
			highlight: sap.ui.core.MessageType.Error
		}));
		assert.ok(TableUtils.hasRowHighlights(oTable), "Row highlight is set to 'Error': Returned true");

		oTable.setRowSettingsTemplate(new sap.ui.table.RowSettings({
			highlight: sap.ui.core.MessageType.Information
		}));
		assert.ok(TableUtils.hasRowHighlights(oTable), "Row highlight is set to 'Information': Returned true");

		oTable.setRowSettingsTemplate(new sap.ui.table.RowSettings({
			highlight: "{bindingPath}"
		}));
		assert.ok(TableUtils.hasRowHighlights(oTable), "Row highlight is bound: Returned true");
	});

	QUnit.test("getVisibleColumnCount", function(assert) {
		assert.equal(TableUtils.getVisibleColumnCount(oTable), iNumberOfCols, "All columns visible");

		oTable.getColumns()[1].setVisible(false);
		sap.ui.getCore().applyChanges();

		assert.equal(TableUtils.getVisibleColumnCount(oTable), iNumberOfCols - 1, "1 column hidden");
	});

	QUnit.test("getHeaderRowCount", function(assert) {
		assert.equal(TableUtils.getHeaderRowCount(oTable), 1, "Initial Number of header rows");
		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();
		assert.equal(TableUtils.getHeaderRowCount(oTable), 0, "Headers hidden");
		oTable.setColumnHeaderVisible(true);
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b1"}));
		oTable.getColumns()[1].setHeaderSpan([2, 1]);
		sap.ui.getCore().applyChanges();
		assert.equal(TableUtils.getHeaderRowCount(oTable), 2, "Multiline Headers");
		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();
		assert.equal(TableUtils.getHeaderRowCount(oTable), 0, "Multiline Headers hidden");
	});

	QUnit.test("getTotalRowCount", function(assert) {
		assert.equal(TableUtils.getTotalRowCount(oTable), iNumberOfRows, "Number of data rows (#data > #visiblerows)");
		assert.equal(TableUtils.getTotalRowCount(oTable, true), iNumberOfRows, "Number of data rows (incl. empty) (#data > #visiblerows)");

		oTable.setVisibleRowCount(10);
		sap.ui.getCore().applyChanges();

		assert.equal(TableUtils.getTotalRowCount(oTable), iNumberOfRows, "Number of data rows (#data <= #visiblerows)");
		assert.equal(TableUtils.getTotalRowCount(oTable, true), 10, "Number of data rows (incl. empty) (#data <= #visiblerows)");
	});

	QUnit.test("getNonEmptyVisibleRowCount", function(assert) {
		var oTableDummy1 = {
			getVisibleRowCount: function() {
				return 10;
			},
			_getTotalRowCount: function() {
				return 5;
			}
		};
		var oTableDummy2 = {
			getVisibleRowCount: function() {
				return 10;
			},
			_getTotalRowCount: function() {
				return 15;
			}
		};
		var oTableDummy3 = {
			getVisibleRowCount: function() {
				return 10;
			},
			_getTotalRowCount: function() {
				return 10;
			}
		};
		assert.equal(TableUtils.getNonEmptyVisibleRowCount(oTableDummy1), oTableDummy1._getTotalRowCount(),
			"Number of data rows (#data < #visiblerows)");
		assert.equal(TableUtils.getNonEmptyVisibleRowCount(oTableDummy2), oTableDummy2.getVisibleRowCount(),
			"Number of visible rows (#data > #visiblerows)");
		assert.equal(TableUtils.getNonEmptyVisibleRowCount(oTableDummy3), oTableDummy3.getVisibleRowCount(),
			"Number of visible and data rows (#data = #visiblerows)");
	});

	QUnit.test("toggleRowSelection", function(assert) {
		var iCallbackIndex = -1;
		var fnSelectionCallback = function(iIndex) {
			iCallbackIndex = iIndex;
		};

		function testLocal(oRowIndicator) {
			oTable.clearSelection();
			oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
			sap.ui.getCore().applyChanges();

			var iRowIndex = 0;
			if (oRowIndicator === parseInt(oRowIndicator, 10)) {
				iRowIndex = oRowIndicator;
			}

			assert.ok(!oTable.isIndexSelected(iRowIndex), "Row not selected");
			TableUtils.toggleRowSelection(oTable, oRowIndicator); // Toggle
			assert.ok(oTable.isIndexSelected(iRowIndex), "Row selected");
			TableUtils.toggleRowSelection(oTable, oRowIndicator, true); // Select
			assert.ok(oTable.isIndexSelected(iRowIndex), "Row selected");
			TableUtils.toggleRowSelection(oTable, oRowIndicator); // Toggle
			assert.ok(!oTable.isIndexSelected(iRowIndex), "Row not selected");
			TableUtils.toggleRowSelection(oTable, oRowIndicator, false); // Deselect
			assert.ok(!oTable.isIndexSelected(iRowIndex), "Row not selected");
			TableUtils.toggleRowSelection(oTable, oRowIndicator, true); // Select
			assert.ok(oTable.isIndexSelected(iRowIndex), "Row selected");
			TableUtils.toggleRowSelection(oTable, oRowIndicator, false); // Deselect
			assert.ok(!oTable.isIndexSelected(iRowIndex), "Row not selected");

			iCallbackIndex = -1;
			TableUtils.toggleRowSelection(oTable, oRowIndicator, null, fnSelectionCallback); // Callback
			assert.strictEqual(iCallbackIndex, iRowIndex, "Callback called");
			assert.ok(!oTable.isIndexSelected(iRowIndex), "Row not selected");
		}

		// Test by passing a cell as the row indicator.
		testLocal(getRowHeader(0));
		testLocal(getCell(0, 0));

		// If row selection is not allowed on data cells the selection state should not change.
		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowSelector);
		sap.ui.getCore().applyChanges();

		var oElem = getCell(0, 0);
		TableUtils.toggleRowSelection(oTable, oElem); // Toggle
		assert.ok(!oTable.isIndexSelected(0), "Row not selected");
		TableUtils.toggleRowSelection(oTable, oElem, true); // Select
		assert.ok(!oTable.isIndexSelected(0), "Row not selected");
		TableUtils.toggleRowSelection(oTable, oElem, false); // Deselect
		assert.ok(!oTable.isIndexSelected(0), "Row not selected");

		iCallbackIndex = -1;
		TableUtils.toggleRowSelection(oTable, oElem, null, fnSelectionCallback); // Callback
		assert.strictEqual(iCallbackIndex, -1, "Callback not called");
		assert.ok(!oTable.isIndexSelected(0), "Row not selected");

		oTable.addSelectionInterval(0, 0);
		assert.ok(oTable.isIndexSelected(0), "Row selected");

		TableUtils.toggleRowSelection(oTable, oElem); // Toggle
		assert.ok(oTable.isIndexSelected(0), "Row selected");
		TableUtils.toggleRowSelection(oTable, oElem, true); // Select
		assert.ok(oTable.isIndexSelected(0), "Row selected");
		TableUtils.toggleRowSelection(oTable, oElem, false); // Deselect
		assert.ok(oTable.isIndexSelected(0), "Row selected");

		// Test by passing a row index as the row indicator.
		testLocal(0);
		testLocal(iNumberOfRows - 1);

		// Test by passing invalid row indices.
		assert.ok(!TableUtils.toggleRowSelection(oTable, -1), "Row index out of bound: No selection was performed"); // Toggle
		assert.ok(!TableUtils.toggleRowSelection(oTable, -1, true), "Row index out of bound: No selection was performed"); // Select
		assert.ok(!TableUtils.toggleRowSelection(oTable, -1, false), "Row index out of bound: No selection was performed"); // Deselect
		assert.ok(!TableUtils.toggleRowSelection(oTable, oTable._getTotalRowCount()), "Row index out of bound: No selection was performed"); // Toggle
		assert.ok(!TableUtils.toggleRowSelection(oTable, oTable._getTotalRowCount(), true), "Row index out of bound: No selection was performed"); // Select
		assert.ok(!TableUtils.toggleRowSelection(oTable, oTable._getTotalRowCount(), false), "Row index out of bound: No selection was performed"); // Deselect

		// Selection is not possible when the table has no row binding.
		oTable.unbindAggregation("rows");
		assert.ok(!TableUtils.toggleRowSelection(oTable, -1), "No row binding: No selection was performed"); // Toggle
		assert.ok(!TableUtils.toggleRowSelection(oTable, -1, true), "No row binding: No selection was performed"); // Select
		assert.ok(!TableUtils.toggleRowSelection(oTable, -1, false), "No row binding: No selection was performed"); // Deselect
	});

	QUnit.test("getRowColCell", function(assert) {
		oTable.getColumns()[2].setVisible(false);
		sap.ui.getCore().applyChanges();

		var oInfo = TableUtils.getRowColCell(oTable, 0, 0, false);
		assert.strictEqual(oInfo.row, oTable.getRows()[0], "Row 0");
		assert.strictEqual(oInfo.column, oTable.getColumns()[0], "Column 0");
		assert.strictEqual(oInfo.cell, oInfo.row.getCells()[0], "Cell 0,0");
		assert.strictEqual(oInfo.cell.getText(), "A1", "Cell 0,0");

		oInfo = TableUtils.getRowColCell(oTable, 1, 1, false);
		assert.strictEqual(oInfo.row, oTable.getRows()[1], "Row 1");
		assert.strictEqual(oInfo.column, oTable.getColumns()[1], "Column 1");
		assert.strictEqual(oInfo.cell, oInfo.row.getCells()[1], "Cell 1,1");
		assert.strictEqual(oInfo.cell.getText(), "B2", "Cell 1,1");

		oInfo = TableUtils.getRowColCell(oTable, 2, 2, false);
		assert.strictEqual(oInfo.row, oTable.getRows()[2], "Row 2");
		assert.strictEqual(oInfo.column, oTable.getColumns()[3], "Column 3 (Visible Column 2)");
		assert.strictEqual(oInfo.cell, oInfo.row.getCells()[2], "Cell 2,2");
		assert.strictEqual(oInfo.cell.getText(), "D3", "Cell 2,2");

		oInfo = TableUtils.getRowColCell(oTable, 1, 1, true);
		assert.strictEqual(oInfo.row, oTable.getRows()[1], "Row 1");
		assert.strictEqual(oInfo.column, oTable.getColumns()[1], "Column 1");
		assert.strictEqual(oInfo.cell, oInfo.row.getCells()[1], "Cell 1,1");
		assert.strictEqual(oInfo.cell.getText(), "B2", "Cell 1,1");

		oInfo = TableUtils.getRowColCell(oTable, 2, 2, true);
		assert.strictEqual(oInfo.row, oTable.getRows()[2], "Row 2");
		assert.strictEqual(oInfo.column, oTable.getColumns()[2], "Column 2");
		assert.ok(!oInfo.cell, "Cell 2,2");

		oInfo = TableUtils.getRowColCell(oTable, 2, 3, true);
		assert.strictEqual(oInfo.row, oTable.getRows()[2], "Row 2");
		assert.strictEqual(oInfo.column, oTable.getColumns()[3], "Column 3 (Visible Column 2)");
		assert.strictEqual(oInfo.cell, oInfo.row.getCells()[2], "Cell 2,2");
		assert.strictEqual(oInfo.cell.getText(), "D3", "Cell 2,2");
	});

	QUnit.test("getFirstFixedButtomRowIndex", function(assert) {
		function initTest(iFixedBottomCount, iRowCount) {
			oTable.setFixedBottomRowCount(iFixedBottomCount);
			oTable.setVisibleRowCount(iRowCount);
			sap.ui.getCore().applyChanges();
		}

		initTest(0, iNumberOfRows - 3);
		assert.equal(TableUtils.getFirstFixedButtomRowIndex(oTable), -1, "No fixed buttom rows");

		var iVisibleRows,
			iFixedBottomRows = 2;
		for (var i = 0; i < 10; i++) {
			iVisibleRows = iNumberOfRows - 3 + i;
			initTest(iFixedBottomRows, iVisibleRows);

			if (i <= 3) {
				assert.equal(TableUtils.getFirstFixedButtomRowIndex(oTable), iVisibleRows - iFixedBottomRows,
					"Fixed buttom rows, VisibleRowCount=" + iVisibleRows);
			} else {
				assert.equal(TableUtils.getFirstFixedButtomRowIndex(oTable), iNumberOfRows - iFixedBottomRows,
					"Fixed buttom rows, VisibleRowCount=" + iVisibleRows);
			}
		}
	});

	QUnit.test("getRowIndexOfFocusedCell", function(assert) {
		getCell(0, 0, true);
		assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), 0, "DATACELL 0,0");

		getCell(0, 2, true);
		assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), 0, "DATACELL 0,2");

		getCell(1, 1, true);
		assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), 1, "DATACELL 1,1");

		getRowHeader(0, true);
		assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), 0, "ROWHEADER 0");

		getRowHeader(2, true);
		assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), 2, "ROWHEADER 2");

		getColumnHeader(0, true);
		assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), -1, "COLUMNHEADER 0");

		getSelectAll(true);
		assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), -1, "COLUMNROWHEADER");
	});

	QUnit.test("focusItem", function(assert) {
		var oCell = getCell(1, 1);
		TableUtils.focusItem(oTable, 14 /*SelectAll + 5 Headers + 1st Row (Rowselector + 5 cells) + 2nd row (Rowselector + 2 cells)*/);
		assert.ok(oCell.get(0) != document.activeElement, "Focus not set becuase item navigation not yet initialized");
		getCell(0, 0, true);
		TableUtils.focusItem(oTable, 14 /*SelectAll + 5 Headers + 1st Row (Rowselector + 5 cells) + 2nd row (Rowselector + 2 cells)*/);
		oCell = getCell(1, 1);
		assert.ok(oCell.get(0) === document.activeElement, "Focus set");
	});

	QUnit.test("getFocusedItemInfo", function(assert) {
		var oCell = getCell(1, 1, true);
		var oInfo = TableUtils.getFocusedItemInfo(oTable);
		assert.strictEqual(oInfo.cell, 14, "cell");
		assert.strictEqual(oInfo.row, 2, "row");
		assert.strictEqual(oInfo.columnCount, iNumberOfCols + 1 /*row header*/, "columnCount");
		assert.strictEqual(oInfo.cellInRow, 2, "cellInRow");
		assert.strictEqual(oInfo.cellCount, (iNumberOfCols + 1) * (3 /*visible rows*/ + 1), "cellCount");
		assert.strictEqual(oInfo.domRef, oCell.get(0), "domRef");

		oCell = getCell(0, 0, true);
		oInfo = TableUtils.getFocusedItemInfo(oTable);
		assert.strictEqual(oInfo.cell, 7, "cell");
		assert.strictEqual(oInfo.row, 1, "row");
		assert.strictEqual(oInfo.columnCount, iNumberOfCols + 1 /*row header*/, "columnCount");
		assert.strictEqual(oInfo.cellInRow, 1, "cellInRow");
		assert.strictEqual(oInfo.cellCount, (iNumberOfCols + 1) * (3 /*visible rows*/ + 1), "cellCount");
		assert.strictEqual(oInfo.domRef, oCell.get(0), "domRef");

		var oTableDummy = {
			_getItemNavigation: function() {
			}
		};
		oInfo = TableUtils.getFocusedItemInfo(oTableDummy);
		assert.equal(oInfo, null, "FocusedItemInfo = null");
	});

	QUnit.test("getNoDataText", function(assert) {
		assert.equal(TableUtils.getNoDataText(oTable), TableUtils.getResourceBundle().getText("TBL_NO_DATA"));
		oTable.setNoData("Foobar");
		assert.equal(TableUtils.getNoDataText(oTable), "Foobar");
		oTable.setNoData(new Control());
		assert.strictEqual(TableUtils.getNoDataText(oTable), null);

		var oString = new String("Some Text");
		oTable.setNoData(oString);
		assert.equal(TableUtils.getNoDataText(oTable), oString);
	});

	QUnit.test("isNoDataVisible / hasData", function(assert) {
		function createFakeTable(bShowNoData, iBindingLength, bAnalytical, bHasTotals) {
			return {
				getShowNoData: function() {
					return bShowNoData;
				},
				_getTotalRowCount: function() {
					return iBindingLength;
				},
				getBinding: function() {
					var oBinding = {};
					if (bAnalytical) {
						oBinding.providesGrandTotal = function() {
							return bHasTotals;
						};
						oBinding.hasTotaledMeasures = function() {
							return bHasTotals;
						};
					}
					return oBinding;
				}
			};
		}

		function testNoDataVisibility(bShowNoData, iBindingLength, bAnalytical, bHasTotals, bExpectedResult) {
			var bResult = TableUtils.isNoDataVisible(createFakeTable(bShowNoData, iBindingLength, bAnalytical, bHasTotals));
			assert.equal(bResult, bExpectedResult,
				"ShowNoData: " + bShowNoData + ", Binding Length: " + iBindingLength + ", Analytical: " + bAnalytical + ", Totals: " + bHasTotals);
		}

		testNoDataVisibility(true, 2, false, false, false);
		testNoDataVisibility(true, 1, false, false, false);
		testNoDataVisibility(true, 0, false, false, true);
		testNoDataVisibility(false, 2, false, false, false);
		testNoDataVisibility(false, 1, false, false, false);
		testNoDataVisibility(false, 0, false, false, false);

		testNoDataVisibility(true, 2, true, false, false);
		testNoDataVisibility(true, 1, true, false, false);
		testNoDataVisibility(true, 0, true, false, true);
		testNoDataVisibility(false, 2, true, false, false);
		testNoDataVisibility(false, 1, true, false, false);
		testNoDataVisibility(false, 0, true, false, false);

		testNoDataVisibility(true, 2, true, true, false);
		testNoDataVisibility(true, 1, true, true, true);
		testNoDataVisibility(true, 0, true, true, true);
		testNoDataVisibility(false, 2, true, true, false);
		testNoDataVisibility(false, 1, true, true, false);
		testNoDataVisibility(false, 0, true, true, false);
	});

	QUnit.test("isBusyIndicatorVisible", function(assert) {
		oTable.setBusyIndicatorDelay(0);

		assert.ok(!TableUtils.isBusyIndicatorVisible(), "Invalid parameter passed: Returned false");
		assert.ok(!TableUtils.isBusyIndicatorVisible(null), "Invalid parameter passed: Returned false");
		assert.ok(!TableUtils.isBusyIndicatorVisible(oTable), "The busy indicator is not visible: Returned false");

		oTable.setBusy(true);
		sap.ui.getCore().applyChanges();
		assert.ok(TableUtils.isBusyIndicatorVisible(oTable),
			"The tables busy indicator is visible: Returned true");

		oTable.getRows()[0].getCells()[0].setBusyIndicatorDelay(0);
		oTable.getRows()[0].getCells()[0].setBusy(true);
		sap.ui.getCore().applyChanges();
		assert.ok(TableUtils.isBusyIndicatorVisible(oTable),
			"The tables busy indicator is visible, and a cells busy indicator is visible: Returned true");

		oTable.setBusy(false);
		sap.ui.getCore().applyChanges();
		assert.ok(!TableUtils.isBusyIndicatorVisible(oTable),
			"The tables busy indicator is not visible, but a cells busy indicator is visible: Returned false");
	});

	QUnit.test("hasPendingRequests", function(assert) {
		assert.ok(!TableUtils.hasPendingRequests(), "No parameters passed: Returned false");
		assert.ok(!TableUtils.hasPendingRequests(null), "Passed 'null': Returned false");

		this.stub(oTable, "getBinding").withArgs("rows").returns(undefined);
		assert.ok(!TableUtils.hasPendingRequests(oTable), "Rows not bound: Returned false");
		oTable.getBinding.restore();

		this.stub(TableUtils, "canUsePendingRequestsCounter").returns(true);
		oTable._iPendingRequests = -1;
		oTable._bPendingRequest = true;
		assert.ok(!TableUtils.hasPendingRequests(oTable), "(Counter) -1 pending requests: Returned false");
		oTable._iPendingRequests = 0;
		assert.ok(!TableUtils.hasPendingRequests(oTable), "(Counter) 0 pending requests: Returned false");
		oTable._iPendingRequests = 1;
		oTable._bPendingRequest = false;
		assert.ok(TableUtils.hasPendingRequests(oTable), "(Counter) 1 pending requests: Returned true");
		oTable._iPendingRequests = 2;
		assert.ok(TableUtils.hasPendingRequests(oTable), "(Counter) 2 pending requests: Returned true");

		TableUtils.canUsePendingRequestsCounter.returns(false);
		oTable._iPendingRequests = 0;
		oTable._bPendingRequest = true;
		assert.ok(TableUtils.hasPendingRequests(oTable), "(Flag) Indicates that a request is pending: Returned true");
		oTable._iPendingRequests = 1;
		oTable._bPendingRequest = false;
		assert.ok(!TableUtils.hasPendingRequests(oTable), "(Flag) Indicates that no request is pending: Returned false");

		TableUtils.canUsePendingRequestsCounter.restore();
	});

	QUnit.test("canUsePendingRequestsCounter", function(assert) {
		assert.ok(TableUtils.canUsePendingRequestsCounter(), "No parameters passed: Returned true");
		assert.ok(TableUtils.canUsePendingRequestsCounter(null), "Passed 'null': Returned true");

		this.stub(oTable, "getBinding").withArgs("rows").returns(undefined);
		assert.ok(TableUtils.canUsePendingRequestsCounter(oTable), "Rows not bound: Returned true");
		oTable.getBinding.restore();

		this.stub(TableUtils, "isInstanceOf").withArgs(oTable.getBinding("rows"), "sap/ui/model/analytics/AnalyticalBinding").returns(true);
		oTable.getBinding("rows").bUseBatchRequests = true;
		assert.ok(TableUtils.canUsePendingRequestsCounter(oTable), "AnalyticalBinding using batch requests: Returned true");

		oTable.getBinding("rows").bUseBatchRequests = false;
		assert.ok(!TableUtils.canUsePendingRequestsCounter(oTable), "AnalyticalBinding not using batch requests: Returned false");

		TableUtils.isInstanceOf.withArgs(oTable.getBinding("rows"), "sap/ui/model/analytics/AnalyticalBinding").returns(false);
		TableUtils.isInstanceOf.withArgs(oTable.getBinding("rows"), "sap/ui/model/TreeBinding").returns(true);
		assert.ok(!TableUtils.canUsePendingRequestsCounter(oTable), "TreeBinding: Returned false");

		TableUtils.isInstanceOf.withArgs(oTable.getBinding("rows"), "sap/ui/model/TreeBinding").returns(false);
		oTable.getBinding("rows").bUseBatchRequests = true;
		assert.ok(TableUtils.canUsePendingRequestsCounter(oTable), "Other binding: Returned true");

		TableUtils.isInstanceOf.restore();
		delete oTable.getBinding("rows").bUseBatchRequests;
	});

	QUnit.test("isInstanceOf", function(assert) {
		function checkLoaded(oObj) {
			if (!oObj || !oObj.prototype || !oObj.prototype.destroy) {
				//Check whether namespace is already available and whether it is not the lazy initialization hook
				return false;
			}
			return true;
		}

		assert.equal(TableUtils.isInstanceOf(oTable, null), false, "No type");
		assert.equal(TableUtils.isInstanceOf(null, "sap/ui/table/AnalyticalTable"), false, "No object");

		assert.ok(!checkLoaded(sap.ui.table.AnalyticalTable), "sap.ui.table.AnalyticalTable not loaded before check");
		assert.equal(TableUtils.isInstanceOf(oTable, "sap/ui/table/AnalyticalTable"), false, "Not of type sap.ui.table.AnalyticalTable");
		assert.ok(!checkLoaded(sap.ui.table.AnalyticalTable), "sap.ui.table.AnalyticalTable not loaded after check");

		var oAnalyticalTable = new sap.ui.table.AnalyticalTable();
		assert.ok(checkLoaded(sap.ui.table.AnalyticalTable), "sap.ui.table.AnalyticalTable not loaded before check");
		assert.equal(TableUtils.isInstanceOf(oAnalyticalTable, "sap/ui/table/AnalyticalTable"), true, "Is of type sap.ui.table.AnalyticalTable");
		assert.ok(checkLoaded(sap.ui.table.AnalyticalTable), "sap.ui.table.AnalyticalTable not loaded after check");
		oAnalyticalTable.destroy();
	});

	QUnit.test("isFirstScrollableRow / isLastScrollableRow", function(assert) {
		var iVisibleRowCount = 6;
		var iFixedTop = 2;
		var iFixedBottom = 2;

		oTable.setVisibleRowCount(iVisibleRowCount);
		oTable.setFixedRowCount(iFixedTop);
		oTable.setFixedBottomRowCount(iFixedBottom);
		sap.ui.getCore().applyChanges();

		for (var j = 0; j < 2; j++) {
			for (var i = 0; i < iVisibleRowCount; i++) {
				assert.equal(TableUtils.isFirstScrollableRow(oTable, getCell(i, 0)), i == iFixedTop, "isFirstScrollableRow (" + i + ")");
				assert.equal(TableUtils.isLastScrollableRow(oTable, getCell(i, 0)), i == iVisibleRowCount - iFixedBottom - 1,
					"isLastScrollableRow (" + i + ")");
			}
			oTable._getScrollExtension().scrollVertically(true, false);
		}
	});

	QUnit.test("sanitizeSelectionMode", function(assert) {
		var mSelectionMode = SelectionMode;
		assert.equal(TableUtils.sanitizeSelectionMode({}, mSelectionMode.None), mSelectionMode.None, "SelectionMode None");
		assert.equal(TableUtils.sanitizeSelectionMode({}, mSelectionMode.Single), mSelectionMode.Single, "SelectionMode Single");
		assert.equal(TableUtils.sanitizeSelectionMode({}, mSelectionMode.MultiToggle), mSelectionMode.MultiToggle, "SelectionMode MultiToggle");
		assert.equal(TableUtils.sanitizeSelectionMode({}, mSelectionMode.Multi), mSelectionMode.MultiToggle, "SelectionMode Multi");
		assert.equal(TableUtils.sanitizeSelectionMode({_enableLegacyMultiSelection: true}, mSelectionMode.Multi), mSelectionMode.MultiToggle,
			"SelectionMode Multi (legacy)");
	});

	QUnit.test("getCell", function(assert) {
		oTable.setRowActionCount(2);
		oTable.setRowActionTemplate(new RowAction());
		sap.ui.getCore().applyChanges();

		assert.strictEqual(TableUtils.getCell(), null, "Returned null: Invalid input");
		assert.strictEqual(TableUtils.getCell(oTable), null, "Returned null: Invalid input");
		assert.strictEqual(TableUtils.getCell(oTable, oTable.getDomRef()), null, "Returned null: Passed element is not a cell or inside a cell");

		var oElement = getSelectAll();
		assert.ok(TableUtils.getCell(oTable, oElement).is(oElement), "Returned SelectAll");
		assert.ok(TableUtils.getCell(oTable, oElement.find(":first")).is(oElement), "Returned SelectAll");

		oElement = getColumnHeader(0);
		assert.ok(TableUtils.getCell(oTable, oElement).is(oElement), "Returned Column Header");
		assert.ok(TableUtils.getCell(oTable, oElement.find(":first")).is(oElement), "Returned Column Header");

		oElement = getRowHeader(0);
		assert.ok(TableUtils.getCell(oTable, oElement).is(oElement), "Returned Row Header");
		assert.ok(TableUtils.getCell(oTable, oElement.find(":first")).is(oElement), "Returned Row Header");

		oElement = getRowAction(0);
		assert.ok(TableUtils.getCell(oTable, oElement).is(oElement), "Returned Row Action");
		assert.ok(TableUtils.getCell(oTable, oElement.find(":first")).is(oElement), "Returned Row Action");

		oElement = getCell(0, 0);
		assert.ok(TableUtils.getCell(oTable, oElement).is(oElement), "Returned Data Cell");
		assert.ok(TableUtils.getCell(oTable, oElement.find(":first")).is(oElement), "Returned Data Cell");
	});

	QUnit.test("getResourceBundle", function(assert) {
		var pPromise;
		var oBundle;
		var oPreviousBundle;
		var sOriginalLanguage = sap.ui.getCore().getConfiguration().getLanguage();
		var sTestLanguageA = sOriginalLanguage === "en-US" ? "de-DE" : "en-US";
		var sTestLanguageB = sOriginalLanguage === "en-US" ? "fr-FR" : "en-US";
		var fnOnLocalizationChanged = Table.prototype.onlocalizationChanged;
		var done = assert.async();

		Table.prototype.onlocalizationChanged = function() {};

		/* Synchronous */

		oBundle = TableUtils.getResourceBundle();
		assert.ok(jQuery.sap.resources.isBundle(oBundle), "{async: false, reload: false} - Should return a bundle");
		assert.strictEqual(TableUtils.getResourceBundle(), oBundle, "{async: false, reload: false} - Should return the already loaded bundle");

		sap.ui.getCore().getConfiguration().setLanguage(sTestLanguageA);

		oPreviousBundle = oBundle;
		assert.strictEqual(TableUtils.getResourceBundle(), oBundle,
			"{async: false, reload: false} (language changed) - Should return the already loaded bundle");
		oBundle = TableUtils.getResourceBundle({reload: true});
		assert.ok(oBundle !== oPreviousBundle && jQuery.sap.resources.isBundle(oBundle),
			"{async: false, reload: true} - Should return a new bundle");
		assert.strictEqual(TableUtils.getResourceBundle({reload: true}), oBundle,
			"{async: false, reload: true} - Should return the already loaded bundle");

		/* Asynchronous */

		sap.ui.getCore().getConfiguration().setLanguage(sTestLanguageB);

		pPromise = TableUtils.getResourceBundle({async: true});
		assert.ok(pPromise instanceof Promise, "{async: true, reload: false} (language changed) - Should return a Promise");
		pPromise.then(function(_oBundle) {
			oPreviousBundle = oBundle;
			oBundle = _oBundle;
			assert.strictEqual(oBundle, oPreviousBundle, "Promise should return the already loaded bundle");

			pPromise = TableUtils.getResourceBundle({async: true, reload: true});
			assert.ok(pPromise instanceof Promise, "{async: true, reload: true} - Should return a Promise");
			return pPromise;
		}).then(function(_oBundle) {
			oPreviousBundle = oBundle;
			oBundle = _oBundle;
			assert.ok(oBundle !== oPreviousBundle && jQuery.sap.resources.isBundle(oBundle), "Promise should return a new bundle");

			pPromise = TableUtils.getResourceBundle({async: true, reload: true});
			assert.ok(pPromise instanceof Promise, "{async: true, reload: true} - Should return a Promise");
			return pPromise;
		}).then(function(_oBundle) {
			oPreviousBundle = oBundle;
			oBundle = _oBundle;
			assert.strictEqual(oBundle, oPreviousBundle, "Promise should return the already loaded bundle");
		}).then(function() {
			// Restore
			sap.ui.getCore().getConfiguration().setLanguage(sOriginalLanguage);
			Table.prototype.onlocalizationChanged = fnOnLocalizationChanged;

			done();
		});
	});

	QUnit.test("dynamicCall", function(assert) {
		var bCallbackCalled = false;
		var oTestObject = {prop: "value", funcA: sinon.spy(), funcB: sinon.spy()};
		var oTestContext = {};

		function reset() {
			bCallbackCalled = false;
			oTestObject.funcA.reset();
			oTestObject.funcB.reset();
		}

		TableUtils.dynamicCall(oTestObject, function(vObject) {
			bCallbackCalled = true;
			assert.strictEqual(this, oTestObject, "Callback should be called with the default context");
			assert.strictEqual(vObject, oTestObject, "The object should be passed to the callback");
		});
		assert.ok(bCallbackCalled, "Callback should be called, if the object exists");
		reset();

		TableUtils.dynamicCall(undefined, function() {
			bCallbackCalled = true;
		});
		assert.ok(!bCallbackCalled, "Callback should not be called, if the object does not exist");
		reset();

		TableUtils.dynamicCall(function() {return oTestObject;}, function(vObject) {
			bCallbackCalled = true;
			assert.strictEqual(this, oTestContext, "Callback should be called with the specified context");
			assert.strictEqual(vObject, oTestObject, "The object should be passed to the callback");
		}, oTestContext);
		assert.ok(bCallbackCalled, "Callback should be called, if the object getter returns an object");
		reset();

		TableUtils.dynamicCall(function() {return undefined;}, function() {
			bCallbackCalled = true;
		});
		assert.ok(!bCallbackCalled, "Callback should not be called, if the object getter does not return an object");
		reset();

		TableUtils.dynamicCall(oTestObject, {
			prop: undefined, // not a function
			funcA: [1, "2", undefined],
			funcB: [],
			funcC: [""] // does not exist
		});
		assert.ok(oTestObject.funcA.calledOnce, "The function \"funcA\" should be called once");
		assert.ok(oTestObject.funcA.calledWith(1, "2", undefined), "The function \"funcA\" should be called with the specified arguments");
		assert.strictEqual(oTestObject.funcA.thisValues[0], oTestObject, "The function \"funcA\" should be called with the default context");
		assert.ok(oTestObject.funcB.calledOnce, "The function \"funcB\" should be called once");
		assert.ok(oTestObject.funcB.calledWith(), "The function \"funcB\" should be called with the specified arguments");
		assert.strictEqual(oTestObject.funcB.thisValues[0], oTestObject, "The function \"funcB\" should be called with the default context");
		reset();

		TableUtils.dynamicCall(oTestObject, {
			funcA: undefined
		}, oTestContext);
		assert.strictEqual(oTestObject.funcA.thisValues[0], oTestContext, "The function should be called with the specified context");
	});

	QUnit.module("Cozy", {
		beforeEach: function() {
			jQuery(document.body).toggleClass("sapUiSizeCozy", true);
			createTables();
		},
		afterEach: function() {
			destroyTables();
			jQuery(document.body).toggleClass("sapUiSizeCozy", false);
		}
	});

	/*QUnit.test("getRowHeightByIndex", function(assert) {
		var iDefaultRowHeight = oTable._getDefaultRowHeight();

		assert.equal(TableUtils.getRowHeightByIndex(oTable, 0), iDefaultRowHeight, "First Row Height is 48");
		assert.equal(TableUtils.getRowHeightByIndex(oTable, oTable.getRows().length - 1), iDefaultRowHeight, "Last Row Height is 48");
		assert.equal(TableUtils.getRowHeightByIndex(oTable, 50), 0, "Invalid Row Height is 0");
		assert.equal(TableUtils.getRowHeightByIndex(null, 0), 0, "No Table available returns 0px as row height");

		oTable.setFixedColumnCount(0);
		sap.ui.getCore().applyChanges();

		assert.equal(TableUtils.getRowHeightByIndex(oTable, 0), iDefaultRowHeight, "First Row Height is 48, with Table with no fixed columns");
		jQuery(document.body).toggleClass("sapUiSizeCozy", false);
	});*/

	QUnit.module("Resize Handler", {
		beforeEach: function() {
			jQuery("#qunit-fixture").append("<div id='__table-outer' style='height: 500px; width: 500px; overflow: hidden; background: red;'>" +
											"<div id='__table-inner' style='height: 200px; width: 200px; background: blue;'>" +
											"<div id='__table-center' style='height: 100px; width: 100px; background: green;'></div>" +
											"</div>" +
											"</div>");

			this.oTable = {
				id: "__table",
				getId: function(sSuffix) {
					if (sSuffix) {
						return this.id + "-" + sSuffix;
					} else {
						return this.id;
					}
				},
				getDomRef: function(sSuffix) {
					return document.getElementById(this.getId(sSuffix));
				},
				getResizeHandlerIdKeys: function() {
					var aKeys = [];
					for (var sKey in this._mResizeHandlerIds) {
						if (this._mResizeHandlerIds[sKey] !== undefined && this._mResizeHandlerIds.hasOwnProperty(sKey)) {
							aKeys.push(sKey);
						}
					}
					return aKeys.sort();
				}
			};
		}
	});

	QUnit.test("Register/Deregister", 17, function(assert) {
		var done = assert.async();
		var sResizeHandlerId;
		var fnTestOuter = function(oEvent) {
			assert.equal(oEvent.currentTarget.getAttribute("id"), this.oTable.getId("outer"), "ResizeHandler triggered for 'outer' element");
			jQuery("#" + this.oTable.getId("inner")).height("250px");
		};

		var fnTestCenterParent = function(oEvent) {
			assert.equal(oEvent.currentTarget.getAttribute("id"), this.oTable.getId("inner"),
				"ResizeHandler triggered for parent of 'center', 'inner'");
			// size change of center div should have no impact, as there is not ResizeHandler defined for it.
			jQuery("#" + this.oTable.getId("center")).height("50px");

			assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), ["center", "outer"], "All ResizeHandler IDs correctly stored at table instance");
			TableUtils.deregisterResizeHandler(this.oTable, "center");
			assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), ["outer"], "All ResizeHandler IDs correctly stored after remove 'center'");
			// size change should not have any effect
			jQuery("#" + this.oTable.getId("inner")).height("200px");

			// register new handlers for further testings
			TableUtils.registerResizeHandler(this.oTable, "inner", function() {
			});
			TableUtils.registerResizeHandler(this.oTable, "center", function() {
			});

			assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), ["center", "inner", "outer"],
				"All ResizeHandler IDs correctly stored at table instance");

			TableUtils.deregisterResizeHandler(this.oTable, ["center", "outer"]);
			assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), ["inner"],
				"All ResizeHandler IDs correctly stored after remove 'center', 'outer'");

			// register new handlers for further testings
			TableUtils.registerResizeHandler(this.oTable, "outer", function() {
			});
			TableUtils.registerResizeHandler(this.oTable, "center", function() {
			});

			TableUtils.deregisterResizeHandler(this.oTable);

			assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), [], "All ResizeHandler IDs correctly removed");

			// test type errors
			sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, {}, function() {
			});
			assert.strictEqual(sResizeHandlerId, undefined, "No ResizeHandler ID returned because of wrong type for sIdSuffix");
			sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, "", "");
			assert.strictEqual(sResizeHandlerId, undefined, "No ResizeHandler ID returned because of wrong type for handler function");
			assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), [], "No ResizeHandler IDs stored at table instance");

			done();
		};

		assert.strictEqual(this.oTable._mResizeHandlerIds, undefined, "No ResizeHandler registered, therefore no ResizeHandlerIds map");
		TableUtils.deregisterResizeHandler(this.oTable);
		assert.strictEqual(this.oTable._mResizeHandlerIds, undefined, "Deregister does not create ResizeHandlerIds map");

		sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, "outer", fnTestOuter.bind(this));
		assert.notStrictEqual(sResizeHandlerId, undefined, "ResizeHandler ID was returned for 'outer': '" + sResizeHandlerId + "'");
		assert.equal(this.oTable._mResizeHandlerIds.outer, sResizeHandlerId, "ResizeHandler ID correctly stored at table instance (outer)");

		sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, "center", fnTestCenterParent.bind(this), true);
		assert.notStrictEqual(sResizeHandlerId, undefined,
			"ResizeHandler ID was returned for 'inner', registered by parent of 'center': '" + sResizeHandlerId + "'");
		assert.equal(this.oTable._mResizeHandlerIds.center, sResizeHandlerId,
			"ResizeHandler ID correctly stored at table instance (parent of center)");

		sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, "doesNotExist", fnTestCenterParent.bind(this), true);
		assert.strictEqual(sResizeHandlerId, undefined, "No ResizeHandler ID returned for unknown DOM");

		jQuery("#" + this.oTable.getId("outer")).height("550px");
	});

	QUnit.module("Content Density", {
		beforeEach: function() {
			jQuery("#qunit-fixture").append("<div id='__table-outer'></div>");

			this.oTable = new Table();

			this.TableUtilsDummyControl = Control.extend("sap.ui.table.TableUtilsDummyControl", {
				metadata: {
					library: "sap.ui.table",
					aggregations: {
						content: {type: "sap.ui.core.Control", multiple: true}
					}
				},
				renderer: function(rm, oControl) {
					rm.write("<div");
					rm.writeControlData(oControl);
					rm.write(">");
					var aContent = oControl.getContent();
					for (var i = 0; i < aContent.length; i++) {
						rm.renderControl(aContent[i]);
					}
					rm.write("</div>");
				}
			}, false);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("getContentDensity", function(assert) {
		var oCore = sap.ui.getCore();
		var oNested = new sap.ui.table.TableUtilsDummyControl({content: [this.oTable]});
		var oControl = new sap.ui.table.TableUtilsDummyControl({content: [oNested]});

		oControl.placeAt("__table-outer", 0);
		oCore.applyChanges();
		assert.strictEqual(TableUtils.getContentDensity(this.oTable), undefined, "No content density set to far");

		jQuery(document.body).toggleClass("sapUiSizeCozy", true);
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy", "sapUiSizeCozy at body");

		oControl.addStyleClass("sapUiSizeCompact");
		oCore.applyChanges();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCompact", "sapUiSizeCompact at #Control");

		oNested.addStyleClass("sapUiSizeCondensed");
		oCore.applyChanges();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed", "sapUiSizeCondensed at #Nested");
		oNested.addStyleClass("sapUiSizeCozy");
		oCore.applyChanges();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed",
			"sapUiSizeCondensed and sapUiSizeCozy at #Nested -> sapUiSizeCondensed");
		oNested.addStyleClass("sapUiSizeCompact");
		oCore.applyChanges();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCompact",
			"sapUiSizeCompact, sapUiSizeCondensed and sapUiSizeCozy at #Nested -> sapUiSizeCompact");

		this.oTable.addStyleClass("sapUiSizeCozy");
		oCore.applyChanges();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy", "sapUiSizeCozy at table");

		this.oTable.$().toggleClass("sapUiSizeCondensed", true);
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed",
			"sapUiSizeCondensed at table DOM and sapUiSizeCozy at control level. DOM wins.");

		jQuery(document.body).toggleClass("sapUiSizeCozy", false);
	});

	QUnit.test("getContentDensity without DOM", function(assert) {
		var oNested = new sap.ui.table.TableUtilsDummyControl({content: [this.oTable]});
		var oControl = new sap.ui.table.TableUtilsDummyControl({content: [oNested]});

		assert.strictEqual(TableUtils.getContentDensity(this.oTable), undefined, "No content density set to far");

		jQuery(document.body).toggleClass("sapUiSizeCozy", true);
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy", "sapUiSizeCozy at body");

		oControl.addStyleClass("sapUiSizeCompact");
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCompact", "sapUiSizeCompact at #Control");

		oNested.addStyleClass("sapUiSizeCondensed");
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed", "sapUiSizeCondensed at #Nested");
		oNested.addStyleClass("sapUiSizeCozy");
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed",
			"sapUiSizeCondensed and sapUiSizeCozy at #Nested -> sapUiSizeCondensed");
		oNested.addStyleClass("sapUiSizeCompact");
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCompact",
			"sapUiSizeCompact, sapUiSizeCondensed and sapUiSizeCozy at #Nested -> sapUiSizeCompact");

		this.oTable.addStyleClass("sapUiSizeCozy");
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy", "sapUiSizeCozy at table");

		jQuery(document.body).toggleClass("sapUiSizeCozy", false);
	});

	QUnit.test("getContentDensity table in UI Area", function(assert) {
		var oCore = sap.ui.getCore();
		this.oTable.placeAt("__table-outer", 0);
		oCore.applyChanges();

		assert.strictEqual(TableUtils.getContentDensity(this.oTable), undefined, "No content density set to far");

		this.oTable.addStyleClass("sapUiSizeCozy");
		oCore.applyChanges();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy", "sapUiSizeCozy at table");
	});

	QUnit.module("Cell Content", {
		beforeEach: function() {
			createTables();

			function addColumn(sTitle, sText, bFocusable, bTabbable) {
				var oControlTemplate;
				if (!bFocusable) {
					oControlTemplate = new sap.ui.table.test.TestControl({
						text: "{" + sText + "}",
						index: iNumberOfCols,
						visible: true,
						tabbable: bTabbable
					});
				} else {
					oControlTemplate = new sap.ui.table.test.TestInputControl({
						text: "{" + sText + "}",
						index: iNumberOfCols,
						visible: true,
						tabbable: bTabbable
					});
				}

				oTable.addColumn(new Column({
					label: sTitle,
					width: "100px",
					template: oControlTemplate
				}));
				iNumberOfCols++;

				for (var i = 0; i < iNumberOfRows; i++) {
					oTable.getModel().getData().rows[i][sText] = sText + (i + 1);
				}
			}

			addColumn("Not Focusable & Not Tabbable", "NoFocusNoTab", false, false);
			addColumn("Focusable & Tabbable", "FocusTab", true, true);
			addColumn("Focusable & Not Tabbable", "NoTab", true, false);

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			destroyTables();
			iNumberOfCols -= 3;
		}
	});

	function _getFirstInteractiveElement(cell) {
		var $Cell = jQuery(cell);
		var $InteractiveElements = $Cell.find(":sapTabbable, input:sapFocusable, .sapUiTableTreeIcon");
		return $InteractiveElements[0];
	}

	QUnit.test("getParentCell", function(assert) {
		initRowActions(oTable, 1, 1);

		/* Data Cell */

		var oCell = getCell(0, iNumberOfCols - 1);
		var $ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell));
		assert.strictEqual($ParentCell.length, 1, "A data cell was returned");
		assert.strictEqual($ParentCell[0], oCell[0], "jQuery object passed: The correct data cell was returned");

		$ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell[0]));
		assert.strictEqual($ParentCell.length, 1, "A data cell was returned");
		assert.strictEqual($ParentCell[0], oCell[0], "DOM element passed: The correct data cell was returned");

		oCell = getCell(0, iNumberOfCols - 2);
		$ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell));
		assert.strictEqual($ParentCell.length, 1, "A data cell was returned");
		assert.strictEqual($ParentCell[0], oCell[0], "jQuery object passed: The correct data cell was returned");

		$ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell[0]));
		assert.strictEqual($ParentCell.length, 1, "A data cell was returned");
		assert.strictEqual($ParentCell[0], oCell[0], "DOM element passed: The correct data cell was returned");

		/* Row Action Cell */
		oCell = getRowAction(0);
		$ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell));
		assert.strictEqual($ParentCell.length, 1, "A row action cell was returned");
		assert.strictEqual($ParentCell[0], oCell[0], "jQuery object passed: The correct row action cell was returned");

		$ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell[0]));
		assert.strictEqual($ParentCell.length, 1, "A row action cell was returned");
		assert.strictEqual($ParentCell[0], oCell[0], "DOM element passed: The correct row action cell was returned");

		/* Invalid parameters */

		$ParentCell = TableUtils.getParentCell(oTable);
		assert.strictEqual($ParentCell, null, "No element passed: Null was returned");

		$ParentCell = TableUtils.getParentCell(null, _getFirstInteractiveElement(getCell(0, iNumberOfCols - 1)));
		assert.strictEqual($ParentCell, null, "No table passed: Null was returned");
	});
});