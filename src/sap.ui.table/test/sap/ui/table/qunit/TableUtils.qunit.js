
//************************************************************************
// Helper Functions
//************************************************************************

jQuery.sap.require("sap.ui.table.TableUtils");
var TableUtils = sap.ui.table.TableUtils;


//************************************************************************
// Test Code
//************************************************************************

QUnit.module("TableUtils", {
	setup: function() {
		createTables();
	},
	teardown: function () {
		destroyTables();
	}
});


QUnit.test("hasFixedColumns", function(assert) {
	assert.ok(TableUtils.hasFixedColumns(oTable), "Table has fixed columns");
	assert.ok(!TableUtils.hasFixedColumns(oTreeTable), "Table has no fixed columns");
});

QUnit.test("isFixedColumn", function(assert) {
	assert.ok(TableUtils.isFixedColumn(oTable, 0), "Column 0 is fixed");
	assert.ok(!TableUtils.isFixedColumn(oTable, 1), "Column 1 is not fixed");
});

QUnit.test("getCellInfo", function(assert) {
	var oCell = getCell(0, 0);
	var oInfo = TableUtils.getCellInfo(oCell);
	assert.equal(oInfo.type, TableUtils.CELLTYPES.DATACELL, "DATACELL: Type");
	assert.strictEqual(oInfo.cell.get(0), oCell.get(0), "DATACELL: Cell");

	oCell = getColumnHeader(0);
	oInfo = TableUtils.getCellInfo(oCell);
	assert.equal(oInfo.type, TableUtils.CELLTYPES.COLUMNHEADER, "COLUMNHEADER: Type");
	assert.strictEqual(oInfo.cell.get(0), oCell.get(0), "COLUMNHEADER: Cell");

	oCell = getRowHeader(0);
	oInfo = TableUtils.getCellInfo(oCell);
	assert.equal(oInfo.type, TableUtils.CELLTYPES.ROWHEADER, "ROWHEADER: Type");
	assert.strictEqual(oInfo.cell.get(0), oCell.get(0), "ROWHEADER: Cell");

	oCell = getSelectAll();
	oInfo = TableUtils.getCellInfo(oCell);
	assert.equal(oInfo.type, TableUtils.CELLTYPES.COLUMNROWHEADER, "COLUMNROWHEADER: Type");
	assert.strictEqual(oInfo.cell.get(0), oCell.get(0), "COLUMNROWHEADER: Cell");

	oInfo = TableUtils.getCellInfo(null);
	assert.ok(!oInfo, "No info on null");

	oInfo = TableUtils.getCellInfo(jQuery.sap.domById("outerelement"));
	assert.ok(!oInfo, "No info on dom elements which are no table cells");
});

QUnit.test("hasRowHeader", function(assert) {
	assert.ok(TableUtils.hasRowHeader(oTable), "Table has row header in selectionMode 'MultiToggle'");

	oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
	sap.ui.getCore().applyChanges();
	assert.ok(!TableUtils.hasRowHeader(oTable), "Table has row header in selectionMode 'None'");

	oTable.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
	oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);
	sap.ui.getCore().applyChanges();
	assert.ok(!TableUtils.hasRowHeader(oTable), "Table has row header in selectionBehavior 'RowOnly'");
});

QUnit.test("getVisibleColumnCount", function(assert) {
	assert.equal(TableUtils.getVisibleColumnCount(oTable), iNumberOfCols, "All columns visible");

	oTable.getColumns()[1].setVisible(false);
	sap.ui.getCore().applyChanges();

	assert.equal(TableUtils.getVisibleColumnCount(oTable), iNumberOfCols - 1, "1 column hidden");
});

QUnit.test("getTotalRowCount", function(assert) {
	assert.equal(TableUtils.getTotalRowCount(oTable), iNumberOfRows, "Number of data rows (#data > #visiblerows)");
	assert.equal(TableUtils.getTotalRowCount(oTable, true), iNumberOfRows, "Number of data rows (incl. empty) (#data > #visiblerows)");

	oTable.setVisibleRowCount(7);
	sap.ui.getCore().applyChanges();

	assert.equal(TableUtils.getTotalRowCount(oTable), iNumberOfRows, "Number of data rows (#data <= #visiblerows)");
	assert.equal(TableUtils.getTotalRowCount(oTable, true), 7, "Number of data rows (incl. empty) (#data <= #visiblerows)");
});

QUnit.test("isInGroupingRow", function(assert) {
	fakeGroupRow(0);

	assert.ok(TableUtils.isInGroupingRow(getCell(0, 0)), "DATACELL in group row");
	assert.ok(!TableUtils.isInGroupingRow(getCell(1, 0)), "DATACELL in normal row");

	assert.ok(TableUtils.isInGroupingRow(getRowHeader(0)), "ROWHEADER in group row");
	assert.ok(!TableUtils.isInGroupingRow(getRowHeader(1)), "ROWHEADER in normal row");

	assert.ok(!TableUtils.isInGroupingRow(getColumnHeader(0)), "COLUMNHEADER");
	assert.ok(!TableUtils.isInGroupingRow(getSelectAll()), "COLUMNROWHEADER");
	assert.ok(!TableUtils.isInGroupingRow(null), "null");
	assert.ok(!TableUtils.isInGroupingRow(jQuery.sap.domById("outerelement")), "Foreign DOM");
});

QUnit.test("isInSumRow", function(assert) {
	fakeSumRow(0);

	assert.ok(TableUtils.isInSumRow(getCell(0, 0)), "DATACELL in sum row");
	assert.ok(!TableUtils.isInSumRow(getCell(1, 0)), "DATACELL in normal row");

	assert.ok(TableUtils.isInSumRow(getRowHeader(0)), "ROWHEADER in sum row");
	assert.ok(!TableUtils.isInSumRow(getRowHeader(1)), "ROWHEADER in normal row");

	assert.ok(!TableUtils.isInSumRow(getColumnHeader(0)), "COLUMNHEADER");
	assert.ok(!TableUtils.isInSumRow(getSelectAll()), "COLUMNROWHEADER");
	assert.ok(!TableUtils.isInSumRow(null), "null");
	assert.ok(!TableUtils.isInSumRow(jQuery.sap.domById("outerelement")), "Foreign DOM");
});

QUnit.test("getRowColCell", function(assert) {
	var oInfo = TableUtils.getRowColCell(oTable, 0, 0);
	assert.strictEqual(oInfo.row, oTable.getRows()[0], "Row 0");
	assert.strictEqual(oInfo.column, oTable.getColumns()[0], "Column 0");
	assert.strictEqual(oInfo.cell, oInfo.row.getCells()[0], "Cell 0,0");
	assert.strictEqual(oInfo.cell.getText(), "A1", "Cell 0,0");

	oInfo = TableUtils.getRowColCell(oTable, 1, 1);
	assert.strictEqual(oInfo.row, oTable.getRows()[1], "Row 1");
	assert.strictEqual(oInfo.column, oTable.getColumns()[1], "Column 1");
	assert.strictEqual(oInfo.cell, oInfo.row.getCells()[1], "Cell 1,1");
	assert.strictEqual(oInfo.cell.getText(), "B2", "Cell 1,1");
});

QUnit.test("getColumnIndexOfFocusedCell", function(assert) {
	oTable.getColumns()[1].setVisible(false);
	sap.ui.getCore().applyChanges();

	var oCell = getCell(0, 0, true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), 0, "DATACELL 0");

	oCell = getCell(0, 2, true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), 2, "DATACELL 2");

	oCell = getRowHeader(0, true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), -1, "ROWHEADER");

	oCell = getColumnHeader(0, true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), 0, "COLUMNHEADER 0");

	oCell = getColumnHeader(2, true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), 2, "COLUMNHEADER 2");

	oCell = getSelectAll(true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), -1, "COLUMNROWHEADER");
});

QUnit.test("getRowIndexOfFocusedCell", function(assert) {
	var oCell = getCell(0, 0, true);
	assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), 0, "DATACELL 0,0");

	oCell = getCell(0, 2, true);
	assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), 0, "DATACELL 0,2");

	oCell = getCell(1, 1, true);
	assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), 1, "DATACELL 1,1");

	oCell = getRowHeader(0, true);
	assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), 0, "ROWHEADER 0");

	oCell = getRowHeader(2, true);
	assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), 2, "ROWHEADER 2");

	oCell = getColumnHeader(0, true);
	assert.strictEqual(TableUtils.getRowIndexOfFocusedCell(oTable), -1, "COLUMNHEADER 0");

	oCell = getSelectAll(true);
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
});
