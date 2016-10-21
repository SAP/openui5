//************************************************************************
// Helper Functions
//************************************************************************

jQuery.sap.require("sap.ui.table.TableUtils");
var TableUtils = sap.ui.table.TableUtils;

//************************************************************************
// Test Code
//************************************************************************

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

QUnit.test("isRowSelectionAllowed", function(assert) {
	function check(sSelectionBehavior, sSelectionMode, bGroup, bExpected) {
		oTreeTable.setSelectionBehavior(sSelectionBehavior);
		oTreeTable.setSelectionMode(sSelectionMode);
		oTreeTable.setUseGroupMode(bGroup);
		sap.ui.getCore().applyChanges();
		var bRes = TableUtils.isRowSelectionAllowed(oTreeTable);
		assert.ok(bRes && bExpected || !bRes && !bExpected, "isRowSelectionAllowed: " + sSelectionBehavior + ", " + sSelectionMode + ", Group: " + bGroup);
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
		assert.ok(bRes && bExpected || !bRes && !bExpected, "isRowSelectorSelectionAllowed: " + sSelectionBehavior + ", " + sSelectionMode + ", Group: " + bGroup);
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

QUnit.test("getHeaderRowCount", function(assert) {
	assert.equal(TableUtils.getHeaderRowCount(oTable), 1, "Initial Number of header rows");
	oTable.setColumnHeaderVisible(false);
	sap.ui.getCore().applyChanges();
	assert.equal(TableUtils.getHeaderRowCount(oTable), 0, "Headers hidden");
	oTable.setColumnHeaderVisible(true);
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
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
		_getRowCount: function() {
			return 5;
		}
	};
	var oTableDummy2 = {
		getVisibleRowCount: function() {
			return 10;
		},
		_getRowCount: function() {
			return 15;
		}
	};
	var oTableDummy3 = {
		getVisibleRowCount: function() {
			return 10;
		},
		_getRowCount: function() {
			return 10;
		}
	};
	assert.equal(TableUtils.getNonEmptyVisibleRowCount(oTableDummy1), oTableDummy1._getRowCount(), "Number of data rows (#data < #visiblerows)");
	assert.equal(TableUtils.getNonEmptyVisibleRowCount(oTableDummy2), oTableDummy2.getVisibleRowCount(), "Number of visible rows (#data > #visiblerows)");
	assert.equal(TableUtils.getNonEmptyVisibleRowCount(oTableDummy3), oTableDummy3.getVisibleRowCount(), "Number of visible and data rows (#data = #visiblerows)");
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

QUnit.test("isGroupingRow", function(assert) {
	fakeGroupRow(0);

	assert.ok(!TableUtils.isGroupingRow(), "Returned false: Invalid parameter passed");
	assert.ok(!TableUtils.isGroupingRow(null), "Returned false: Invalid parameter passed");

	assert.ok(TableUtils.isGroupingRow(oTable.getRows()[0].getDomRef()), "Returned true: Row 1 is a group header row");
	assert.ok(TableUtils.isGroupingRow(getRowHeader(0)), "Returned true: The row header cell in Row 1 is part of the group header row");

	assert.ok(!TableUtils.isGroupingRow(oTable.getRows()[1].getDomRef()), "Returned false: Row 2 is a normal row");
	assert.ok(!TableUtils.isGroupingRow(getCell(0, 0)), "Returned false: A cell is not a group header row");
	assert.ok(!TableUtils.isGroupingRow(getColumnHeader(0)), "Returned false: A column header cell is not a group header row");
});

QUnit.test("toggleGroupHeader", function(assert) {

	function checkExpanded(sType, bExpectExpanded) {
		assert.equal(oTreeTable.getBinding("rows").isExpanded(0), bExpectExpanded, sType + ": First row " + (bExpectExpanded ? "" : "not ") + "expanded");
	}

	function doToggle(sType, sText, oRef, bForceExpand, bExpectExpanded, bExpectChange) {
		var iIndex = -1;
		var bExpanded = false;
		var bCalled = false;
		oTreeTable._onGroupHeaderChanged = function(iRowIndex, bIsExpanded) {
			iIndex = iRowIndex;
			bExpanded = bIsExpanded;
			bCalled = true;
		};
		var bRes = TableUtils.toggleGroupHeader(oTreeTable, oRef, bForceExpand);
		assert.ok(bExpectChange && bRes || !bExpectChange && !bRes, sType + ": " + sText);
		if (bExpectChange) {
			assert.ok(bCalled, sType + ": _onGroupHeaderChanged called");
			assert.ok(bExpectExpanded === bExpanded, sType + ": _onGroupHeaderChanged provides correct expand state");
			assert.ok(iIndex == 0, sType + ": _onGroupHeaderChanged provides correct index");
		} else {
			assert.ok(!bCalled, sType + ": _onGroupHeaderChanged not called");
		}
		checkExpanded(sType, bExpectExpanded);
	}

	function testWithValidDomRef(sType, oRef) {
		assert.ok(!oTreeTable.getBinding("rows").isExpanded(0), sType + ": First row not expanded yet");
		doToggle(sType, "Nothing changed when force collapse", oRef, false, false, false);
		doToggle(sType, "Change when force expand", oRef, true, true, true);
		doToggle(sType, "Nothing changed when force expand again", oRef, true, true, false);
		doToggle(sType, "Changed when force collapse", oRef, false, false, true);
		doToggle(sType, "Change when toggle", oRef, null, true, true);
		doToggle(sType, "Change when toggle", oRef, null, false, true);
	}

	testWithValidDomRef("TreeIcon", jQuery.sap.byId(oTreeTable.getId() + "-rows-row0-col0").find(".sapUiTableTreeIcon"));

	oTreeTable.setUseGroupMode(true);
	sap.ui.getCore().applyChanges();

	testWithValidDomRef("GroupIcon", jQuery.sap.byId(oTreeTable.getId() + "-rowsel0"));

	doToggle("Wrong DomRef", "", oTreeTable.$(), true, false, false);
	doToggle("Wrong DomRef", "", oTreeTable.$(), false, false, false);
	doToggle("Wrong DomRef", "", oTreeTable.$(), null, false, false);
});

QUnit.test("toggleRowSelection", function(assert) {
	function test(oRowIndicator) {
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
	}

	// Test by passing a cell as the row indicator.
	test(getRowHeader(0));
	test(getCell(0, 0));

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

	oTable.addSelectionInterval(0, 0);
	assert.ok(oTable.isIndexSelected(0), "Row selected");

	TableUtils.toggleRowSelection(oTable, oElem); // Toggle
	assert.ok(oTable.isIndexSelected(0), "Row selected");
	TableUtils.toggleRowSelection(oTable, oElem, true); // Select
	assert.ok(oTable.isIndexSelected(0), "Row selected");
	TableUtils.toggleRowSelection(oTable, oElem, false); // Deselect
	assert.ok(oTable.isIndexSelected(0), "Row selected");

	// Test by passing a row index as the row indicator.
	test(0);
	test(iNumberOfRows - 1);

	// Test by passing invalid row indices.
	assert.ok(!TableUtils.toggleRowSelection(oTable, -1), "Row index out of bound: No selection was performed"); // Toggle
	assert.ok(!TableUtils.toggleRowSelection(oTable, -1, true), "Row index out of bound: No selection was performed"); // Select
	assert.ok(!TableUtils.toggleRowSelection(oTable, -1, false), "Row index out of bound: No selection was performed"); // Deselect
	assert.ok(!TableUtils.toggleRowSelection(oTable, oTable._getRowCount()), "Row index out of bound: No selection was performed"); // Toggle
	assert.ok(!TableUtils.toggleRowSelection(oTable, oTable._getRowCount(), true), "Row index out of bound: No selection was performed"); // Select
	assert.ok(!TableUtils.toggleRowSelection(oTable, oTable._getRowCount(), false), "Row index out of bound: No selection was performed"); // Deselect

	// Selection is not possible when the table has no row binding.
	oTable.unbindAggregation("rows");
	assert.ok(!TableUtils.toggleRowSelection(oTable, -1), "No row binding: No selection was performed"); // Toggle
	assert.ok(!TableUtils.toggleRowSelection(oTable, -1, true), "No row binding: No selection was performed"); // Select
	assert.ok(!TableUtils.toggleRowSelection(oTable, -1, false), "No row binding: No selection was performed"); // Deselect
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

	getCell(0, 0, true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), 0, "DATACELL 0");

	getCell(0, 2, true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), 2, "DATACELL 2");

	getRowHeader(0, true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), -1, "ROWHEADER");

	getColumnHeader(0, true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), 0, "COLUMNHEADER 0");

	getColumnHeader(2, true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), 2, "COLUMNHEADER 2");

	getSelectAll(true);
	assert.strictEqual(TableUtils.getColumnIndexOfFocusedCell(oTable), -1, "COLUMNROWHEADER");
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
	assert.equal(TableUtils.getNoDataText(oTable), oTable._oResBundle.getText("TBL_NO_DATA"));
	oTable.setNoData("Foobar");
	assert.equal(TableUtils.getNoDataText(oTable), "Foobar");
	oTable.setNoData(new sap.ui.core.Control());
	assert.strictEqual(TableUtils.getNoDataText(oTable), null);

	var oString = new String("Some Text");
	oTable.setNoData(oString);
	assert.equal(TableUtils.getNoDataText(oTable), oString);
});

QUnit.test("isNoDataVisible", function(assert) {
	function createFakeTable(bShowNoData, iBindingLength, bAnalytical, bHasTotals) {
		return {
			getShowNoData: function() {
				return bShowNoData;
			},
			_getRowCount: function() {
				return iBindingLength
			},
			getBinding: function() {
				var oBinding = {};
				if (bAnalytical) {
					oBinding.providesGrandTotal = function() {
						return bHasTotals
					};
					oBinding.hasTotaledMeasures = function() {
						return bHasTotals
					};
				}
				return oBinding;
			}
		};
	}

	function testNoDataVisibility(bShowNoData, iBindingLength, bAnalytical, bHasTotals, bExpectedResult) {
		var bResult = TableUtils.isNoDataVisible(createFakeTable(bShowNoData, iBindingLength, bAnalytical, bHasTotals));
		assert.equal(bResult, bExpectedResult, "ShowNoData: " + bShowNoData + ", Binding Length: " + iBindingLength + ", Analytical: " + bAnalytical + ", Totals: " + bHasTotals);
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
			assert.equal(TableUtils.isLastScrollableRow(oTable, getCell(i, 0)), i == iVisibleRowCount - iFixedBottom - 1, "isLastScrollableRow (" + i + ")");
		}
		oTable._getScrollExtension().scroll(true, false);
	}
});

QUnit.test("sanitizeSelectionMode", function(assert) {
	var SM = sap.ui.table.SelectionMode;
	assert.equal(TableUtils.sanitizeSelectionMode({}, SM.None), SM.None, "SelectionMode None");
	assert.equal(TableUtils.sanitizeSelectionMode({}, SM.Single), SM.Single, "SelectionMode Single");
	assert.equal(TableUtils.sanitizeSelectionMode({}, SM.MultiToggle), SM.MultiToggle, "SelectionMode MultiToggle");
	assert.equal(TableUtils.sanitizeSelectionMode({}, SM.Multi), SM.MultiToggle, "SelectionMode Multi");
	assert.equal(TableUtils.sanitizeSelectionMode({_enableLegacyMultiSelection: true}, SM.Multi), SM.MultiToggle, "SelectionMode Multi (legacy)");
});

QUnit.test("getCell", function(assert) {
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

	oElement = getCell(0, 0);
	assert.ok(TableUtils.getCell(oTable, oElement).is(oElement), "Returned Data Cell");
	assert.ok(TableUtils.getCell(oTable, oElement.find(":first")).is(oElement), "Returned Data Cell");
});

QUnit.test("resizeColumn", function(assert) {
	oTable.setFixedColumnCount(0);
	oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_1_1"}));
	oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_2_1"}));
	oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_3_1"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_1_1"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_1"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_2"}));
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_1_1"}));
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_2"}));
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_3"}));
	oTable.getColumns()[0].setHeaderSpan([3, 2, 1]);
	sap.ui.getCore().applyChanges();

	var aVisibleColumns = oTable._getVisibleColumns();

	var aOriginalColumnWidths = [];
	for (var i = 0; i < aVisibleColumns.length; i++) {
		var oColumn = aVisibleColumns[i];
		aOriginalColumnWidths.push(parseInt(oColumn.getWidth(), 10));
	}

	function assertUnchanged(aExcludedColumns) {
		for (var i = 0; i < aVisibleColumns.length; i++) {
			if (aExcludedColumns && aExcludedColumns.indexOf(i) !== -1) {
				continue;
			}
			var oColumn = aVisibleColumns[i];
			assert.strictEqual(parseInt(oColumn.getWidth(), 10), aOriginalColumnWidths[i],
				"Column " + (i + 1) + " has its original width of " + aOriginalColumnWidths[i] + "px");
		}
	}

	function assertColumnWidth(iColumnIndex, iWidth) {
		var iActualColumnWidth = parseInt(aVisibleColumns[iColumnIndex].getWidth(), 10);
		assert.strictEqual(iActualColumnWidth, iWidth,
			"Column " + (iColumnIndex + 1) + " width is " + iActualColumnWidth + "px and should be " + iWidth + "px");
	}

	// Invalid input should not change the column widths.
	TableUtils.resizeColumn();
	assertUnchanged();
	TableUtils.resizeColumn(oTable);
	assertUnchanged();
	TableUtils.resizeColumn(oTable, 1);
	assertUnchanged();
	TableUtils.resizeColumn(oTable, aVisibleColumns.length, 1);
	assertUnchanged();
	TableUtils.resizeColumn(oTable, -1, 1);
	assertUnchanged();
	TableUtils.resizeColumn(oTable, 0, 0);
	assertUnchanged();
	TableUtils.resizeColumn(oTable, 0, -1);
	assertUnchanged();

	// Column 4
	TableUtils.resizeColumn(oTable, 3, 150, false);
	assertColumnWidth(3, 150);
	assertUnchanged([3]);
	TableUtils.resizeColumn(oTable, 3, aOriginalColumnWidths[3], false);
	assertUnchanged();

	// Column 1 to 3
	TableUtils.resizeColumn(oTable, 0, 434, false, 3);
	var iNewWidth = Math.round(434 / 3);
	assertColumnWidth(0, iNewWidth);
	assertColumnWidth(1, iNewWidth);
	assertColumnWidth(2, iNewWidth);
	assertUnchanged([0, 1, 2]);
	TableUtils.resizeColumn(oTable, 0, aOriginalColumnWidths[0] + aOriginalColumnWidths[1] + aOriginalColumnWidths[2], false, 3);
	assertUnchanged();

	// Column 1 to 3 - Column 2 not resizable
	aVisibleColumns[1].setResizable(false);
	TableUtils.resizeColumn(oTable, 0, 100, false, 3);
	assertColumnWidth(0, oTable._iColMinWidth);
	assertColumnWidth(2, oTable._iColMinWidth);
	assertUnchanged([0, 2]);
	TableUtils.resizeColumn(oTable, 0, aOriginalColumnWidths[0], false);
	TableUtils.resizeColumn(oTable, 2, aOriginalColumnWidths[2], false);
	assertUnchanged();
	aVisibleColumns[1].setResizable(true);

	// Column 2 - Not resizable
	aVisibleColumns[1].setResizable(false);
	TableUtils.resizeColumn(oTable, 1, 50, false);
	assertUnchanged();
	aVisibleColumns[1].setResizable(true);

	// Invalid span values default to 1
	TableUtils.resizeColumn(oTable, iNumberOfCols - 1, 150, false, 2);
	assertColumnWidth(iNumberOfCols - 1, 150);
	assertUnchanged([iNumberOfCols - 1]);
	TableUtils.resizeColumn(oTable, iNumberOfCols - 1, aOriginalColumnWidths[iNumberOfCols - 1], false, 0);
	assertUnchanged();

	// Do not decrease column width below the minimum column width value.
	TableUtils.resizeColumn(oTable, 1, 1, false);
	assertColumnWidth(1, oTable._iColMinWidth);
	assertUnchanged([1]);
	TableUtils.resizeColumn(oTable, 1, aOriginalColumnWidths[1], false);
	assertUnchanged();

	TableUtils.resizeColumn(oTable, 0, 1, false, 3);
	assertColumnWidth(0, oTable._iColMinWidth);
	assertColumnWidth(1, oTable._iColMinWidth);
	assertColumnWidth(2, oTable._iColMinWidth);
	assertUnchanged([0, 1, 2]);
	TableUtils.resizeColumn(oTable, 0, aOriginalColumnWidths[0] + aOriginalColumnWidths[1] + aOriginalColumnWidths[2], false, 3);
	assertUnchanged();

	// Fire the ColumnResize event.
	var oColumnResizeHandler = this.spy();
	oTable.attachColumnResize(oColumnResizeHandler);
	TableUtils.resizeColumn(oTable, 0, 250);
	assertColumnWidth(0, 250);
	assertUnchanged([0]);
	assert.ok(oColumnResizeHandler.called, "ColumnResize handler was called");
	oTable.detachColumnResize(oColumnResizeHandler);

	// Fire the ColumnResize event and prevent execution of the default action.
	oColumnResizeHandler = this.spy(function(oEvent) {
		oEvent.preventDefault();
	});
	oTable.attachColumnResize(oColumnResizeHandler);
	TableUtils.resizeColumn(oTable, 0, aOriginalColumnWidths[0]);
	assertColumnWidth(0, 250);
	assertUnchanged([0]);
	assert.ok(oColumnResizeHandler.called, "ColumnResize handler was called");

	// Do not fire the event.
	oColumnResizeHandler.reset();
	TableUtils.resizeColumn(oTable, 0, aOriginalColumnWidths[0], false);
	assertUnchanged();
	assert.ok(oColumnResizeHandler.notCalled, "ColumnResize handler was not called");
});

QUnit.test("getColumnHeaderCellInfo", function(assert) {
	assert.strictEqual(TableUtils.getColumnHeaderCellInfo(), null, "Returned null: Passed nothing");
	assert.strictEqual(TableUtils.getColumnHeaderCellInfo(getSelectAll()), null, "Returned null: Passed SelectAll Cell");
	assert.strictEqual(TableUtils.getColumnHeaderCellInfo(getRowHeader(0)), null, "Returned null: Passed Row Header Cell");
	assert.strictEqual(TableUtils.getColumnHeaderCellInfo(getCell(0, 0)), null, "Returned null: Passed Data Cell");

	var oActualColumnHeaderInfo = TableUtils.getColumnHeaderCellInfo(getColumnHeader(1));
	console.log("oActualColumnHeaderInfo", oActualColumnHeaderInfo);
	assert.strictEqual(oActualColumnHeaderInfo.index, 1, "Correct index information returned");
	assert.strictEqual(oActualColumnHeaderInfo.span, 1, "Correct span information returned");
});

QUnit.test("getColumnWidth", function(assert) {
	var aVisibleColumns = oTable._getVisibleColumns();
	var iColumnWidth;

	assert.strictEqual(TableUtils.getColumnWidth(), null, "Returned null: No parameters passed");
	assert.strictEqual(TableUtils.getColumnWidth(oTable), null, "Returned null: No column index specified");
	assert.strictEqual(TableUtils.getColumnWidth(oTable, -1), null, "Returned null: Column index out of bound");
	assert.strictEqual(TableUtils.getColumnWidth(oTable, oTable.getColumns().length), null, "Returned null: Column index out of bound");

	assert.strictEqual(TableUtils.getColumnWidth(oTable, 0), 100, "Returned 100");

	aVisibleColumns[1].setWidth("123px");
	assert.strictEqual(TableUtils.getColumnWidth(oTable, 1), 123, "Returned 123");

	aVisibleColumns[2].setWidth("2em");
	var i2emInPixel = oTable._CSSSizeToPixel("2em");
	assert.strictEqual(TableUtils.getColumnWidth(oTable, 2), i2emInPixel, "Returned 2em in pixels: " + i2emInPixel);

	aVisibleColumns[3].setVisible(false);
	sap.ui.getCore().applyChanges();
	assert.strictEqual(TableUtils.getColumnWidth(oTable, 3), 100, "Returned 100: Column is not visible and width set to 100px");

	aVisibleColumns[3].setWidth("");
	sap.ui.getCore().applyChanges();
	assert.strictEqual(TableUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"\"");

	aVisibleColumns[3].setWidth("auto");
	sap.ui.getCore().applyChanges();
	assert.strictEqual(TableUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"auto\"");

	aVisibleColumns[3].setWidth("10%");
	sap.ui.getCore().applyChanges();
	assert.strictEqual(TableUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"10%\"");

	aVisibleColumns[4].setWidth("");
	sap.ui.getCore().applyChanges();
	iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
	assert.strictEqual(TableUtils.getColumnWidth(oTable, 4), iColumnWidth,
		"The width in pixels was correctly retrieved from the DOM in case the column width was set to \"\"");

	aVisibleColumns[4].setWidth("auto");
	sap.ui.getCore().applyChanges();
	iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
	assert.strictEqual(TableUtils.getColumnWidth(oTable, 4), iColumnWidth,
		"The width in pixels was correctly retrieved from the DOM in case the column width was set to \"auto\"");

	aVisibleColumns[4].setWidth("10%");
	sap.ui.getCore().applyChanges();
	iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
	assert.strictEqual(TableUtils.getColumnWidth(oTable, 4), iColumnWidth,
		"The width in pixels was correctly retrieved from the DOM in case of a column width specified in percentage");
});

QUnit.module("Context Menus", {
	beforeEach: function() {
		createTables();
	},
	afterEach: function() {
		destroyTables();
	},
	assertAllColumnContextMenusClosed: function() {
		var oColumns = oTable.getColumns();
		for (var i = 0; i < oColumns.length; i++) {
			var oColumn = oColumns[i];
			this.assertColumnContextMenuOpen(oColumn.getIndex(), false);
		}
	},
	assertColumnContextMenuOpen: function(iColumnIndex, bOpen) {
		var oMenu = oTable.getColumns()[iColumnIndex].getMenu();
		var bMenuOpen = oMenu.bOpen;
		assert.strictEqual(bMenuOpen, bOpen,
			"The column context menu is" + (bOpen ? " " : " not ") + "open (Column: " + (iColumnIndex + 1) + ")");
	},
	assertDataCellContextMenuOpen: function(iColumnIndex, iRowIndex, bOpen) {
		var bMenuOpen = oTable._oCellContextMenu && oTable._oCellContextMenu.bOpen;
		var oCellElement = TableUtils.getCell(oTable, oTable.getRows()[iRowIndex].getCells()[iColumnIndex].getDomRef())[0];
		var bMenuOpenAtSpecifiedCell = bMenuOpen && oTable._oCellContextMenu.oOpenerRef === oCellElement;
		assert.strictEqual(bMenuOpenAtSpecifiedCell, bOpen,
			"The data cell context menu is" + (bOpen ? " " : " not ") + "open (Column: " + (iColumnIndex + 1) + ", Row: " + (iRowIndex + 1) + ")");
	},
	assertFirstMenuItemHovered: function(oMenu, bHovered) {
		var bFirstItemHovered = oMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
		assert.strictEqual(bFirstItemHovered, bHovered,
			"The first item in the menu is" + (bHovered ? " " : " not ") + "hovered");
	},
	assertNoColumnHeaderCellMenusExists: function() {
		var oColumns = oTable.getColumns();
		for (var i = 0; i < oColumns.length; i++) {
			var oColumn = oColumns[i];
			this.assertColumnHeaderCellMenuExists(oColumn.$(), false);
		}
	},
	assertColumnHeaderCellMenuExists: function($Column, bExists) {
		var iColumnIndex = $Column.data("sap-ui-colindex");

		var bCellExists = $Column.find(".sapUiTableColCell").is(":hidden");
		assert.strictEqual(bExists, bCellExists,
			"The cell is" + (bExists ? " not " : " ") + "visible (Column: " + (iColumnIndex + 1) + ")");

		var bCellMenuExists = $Column.find(".sapUiTableColCellMenu").length > 0;
		assert.strictEqual(bExists, bCellMenuExists,
			"The cell menu does" + (bExists ? " " : " not ") + "exist (Column: " + (iColumnIndex + 1) + ")");
	},
	assertColumnHeaderCellMenuButtonExists: function($Column, bExists) {
		var iColumnIndex = $Column.data("sap-ui-colindex");

		var bContextMenuButtonExists = $Column.find(".sapUiTableColCellMenu > .sapUiTableColDropDown").length > 0;
		assert.strictEqual(bExists, bContextMenuButtonExists,
			"The context menu button does" + (bExists ? " " : " not ") + "exist (Column: " + (iColumnIndex + 1) + ")");
	},
	assertColumnHeaderCellResizeButtonExists: function($Column, bExists) {
		var iColumnIndex = $Column.data("sap-ui-colindex");

		var bResizeButtonExists = $Column.find(".sapUiTableColCellMenu > .sapUiTableColResizer").length > 0;
		assert.strictEqual(bExists, bResizeButtonExists,
			"The resize button does" + (bExists ? " " : " not ") + "exist (Column: " + iColumnIndex + ")");
	}
});

QUnit.test("openContextMenu", function(assert) {
	var mExpectedArguments;
	var mActualArguments;

	// Invalid parameters: No context menu will be opened.
	TableUtils.openContextMenu();
	this.assertAllColumnContextMenusClosed();
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertNoColumnHeaderCellMenusExists();

	TableUtils.openContextMenu(oTable);
	this.assertAllColumnContextMenusClosed();
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertNoColumnHeaderCellMenusExists();

	TableUtils.openContextMenu(oTable, getSelectAll());
	this.assertAllColumnContextMenusClosed();
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertNoColumnHeaderCellMenusExists();

	TableUtils.openContextMenu(oTable, getRowHeader(0));
	this.assertAllColumnContextMenusClosed();
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertNoColumnHeaderCellMenusExists();

	TableUtils.openContextMenu(oTable, document.getElementsByTagName("body").item(0));
	this.assertAllColumnContextMenusClosed();
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertNoColumnHeaderCellMenusExists();

	/* Column Context Menu */

	var oColumnA = oTable.getColumns()[0];
	var $ColumnA = oColumnA.$();
	oColumnA.setSortProperty("dummy");

	var oColumnB = oTable.getColumns()[1];
	var $ColumnB = oColumnB.$();
	oColumnB.setSortProperty("dummy");

	var oColumnSelectEvent = this.spy(oTable, "fireColumnSelect");

	// Open the context menu of column 1. Do not fire the column select event.
	TableUtils.openContextMenu(oTable, $ColumnA[0], false, false);
	this.assertColumnContextMenuOpen(0, true);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertColumnHeaderCellMenuExists($ColumnA, false);
	assert.ok(oColumnSelectEvent.notCalled, "The ColumnSelect event has not been fired");

	// Open the context menu of column 2. Fire the column select event.
	mExpectedArguments = {
		column: oColumnB,
		id: oTable.getId()
	};

	TableUtils.openContextMenu(oTable, $ColumnB, false, true);
	this.assertColumnContextMenuOpen(0, false);
	this.assertColumnContextMenuOpen(1, true);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertColumnHeaderCellMenuExists($ColumnB, false);
	assert.ok(oColumnSelectEvent.calledOnce, "The ColumnSelect event has been fired");

	mActualArguments = oColumnSelectEvent.args[0][0];
	assert.deepEqual(mActualArguments, mExpectedArguments,
		"The ColumnSelect event handler has been called with the correct arguments");

	// Open the context menu of column 1. Fire the column select event and and prevent the default action.
	// The context menu should not be opened.
	mExpectedArguments = {
		column: oColumnA,
		id: oTable.getId()
	};

	oColumnSelectEvent.reset();
	var fOnColumnSelect = function(oEvent) {
		oEvent.preventDefault();
	};
	oTable.attachColumnSelect(fOnColumnSelect);
	TableUtils.openContextMenu(oTable, $ColumnA, false, true);
	oTable.detachColumnSelect(fOnColumnSelect);

	this.assertColumnContextMenuOpen(0, false);
	this.assertColumnContextMenuOpen(1, true);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertColumnHeaderCellMenuExists($ColumnA, false);
	assert.ok(oColumnSelectEvent.calledOnce, "The ColumnSelect event has been fired");

	mActualArguments = oColumnSelectEvent.args[0][0];
	assert.deepEqual(mActualArguments, mExpectedArguments,
		"The ColumnSelect event handler has been called with the correct arguments");

	// Open the context menu of column 1 on mobile.
	sap.ui.Device.system.desktop = false;

	// 1. The column header cell menu should be applied.
	oColumnSelectEvent.reset();
	TableUtils.openContextMenu(oTable, $ColumnA);
	this.assertColumnContextMenuOpen(0, false);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertColumnHeaderCellMenuExists($ColumnA, true);
	assert.ok(oColumnSelectEvent.notCalled, "The ColumnSelect event has not been fired");

	// 2. The column header cell menu should be closed and the context menu should be opened.
	oColumnSelectEvent.reset();
	TableUtils.openContextMenu(oTable, $ColumnA);
	this.assertColumnContextMenuOpen(0, true);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertColumnHeaderCellMenuExists($ColumnA, false);
	assert.ok(oColumnSelectEvent.calledOnce, "The ColumnSelect event has been fired");

	/* Cell Context Menu */

	oTable.setEnableCellFilter(true);

	oColumnA.setFilterProperty("dummy");
	var oCellA = oTable.getRows()[0].getCells()[0];
	var $CellA = oCellA.$();

	oColumnB.setFilterProperty("dummy");
	var oCellB = oTable.getRows()[0].getCells()[1];
	var $CellB = oCellB.$();

	var oCellContextMenuEvent = this.spy(oTable, "fireCellContextmenu");

	// Open the cell menu on the cell in column 1 row 1. Do not fire the CellContextMenu event.
	TableUtils.openContextMenu(oTable, $CellA[0], false, false);
	this.assertColumnContextMenuOpen(0, false);
	this.assertDataCellContextMenuOpen(0, 0, true);
	assert.ok(oCellContextMenuEvent.notCalled, "The CellContextMenu event has not been fired");

	// Open the cell menu on the cell in column 2 row 1. Fire the CellContextMenu event.
	oCellContextMenuEvent.reset();
	TableUtils.openContextMenu(oTable, $CellB, false, true);
	this.assertColumnContextMenuOpen(1, false);
	this.assertDataCellContextMenuOpen(0, 0, false);
	this.assertDataCellContextMenuOpen(1, 0, true);
	assert.ok(oCellContextMenuEvent.calledOnce, "The CellContextMenu event has been fired");

	mExpectedArguments = {
		rowIndex: 0,
		columnIndex: 1,
		columnId: oColumnB.getId(),
		cellControl: oCellB,
		rowBindingContext: oTable.getRows()[0].getBindingContext(oTable.getBindingInfo("rows").model),
		cellDomRef: getCell(0, 1)[0],
		id: oTable.getId()
	};
	mActualArguments = oCellContextMenuEvent.args[0][0];
	assert.deepEqual(mActualArguments, mExpectedArguments,
		"The CellContextMenu event handler has been called with the correct arguments");

	// Open the cell menu on the cell in column 1 row 1. Fire the CellContextMenu event and prevent execution of the default action.
	// The cell menu on column 1 row 1 should not open, and the cell menu on column 2 row 1 should stay open.
	var oCellContextmenuHandler = this.spy(function(oEvent) {
		oEvent.preventDefault();
	});
	oTable.attachCellContextmenu(oCellContextmenuHandler);

	oCellContextMenuEvent.reset();
	TableUtils.openContextMenu(oTable, $CellA, false, true);
	this.assertColumnContextMenuOpen(0, false);
	this.assertDataCellContextMenuOpen(0, 0, false);
	this.assertDataCellContextMenuOpen(1, 0, true);
	assert.ok(oCellContextMenuEvent.calledOnce, "The CellContextMenu event has been fired");

	mExpectedArguments = {
		rowIndex: 0,
		columnIndex: 0,
		columnId: oColumnA.getId(),
		cellControl: oCellA,
		rowBindingContext: oTable.getRows()[0].getBindingContext(oTable.getBindingInfo("rows").model),
		cellDomRef: getCell(0, 0)[0],
		id: oTable.getId()
	};
	mActualArguments = oCellContextMenuEvent.args[0][0];
	assert.deepEqual(mActualArguments, mExpectedArguments,
		"The CellContextMenu event handler has been called with the correct arguments");
});

QUnit.test("openColumnContextMenu", function(assert) {
	var oColumnA = oTable.getColumns()[0];
	var oColumnB = oTable.getColumns()[1];

	// Invalid parameters: The column context menu will not be opened.
	this.assertAllColumnContextMenusClosed();
	TableUtils.openColumnContextMenu();
	this.assertAllColumnContextMenusClosed();
	TableUtils.openColumnContextMenu(oTable, -1);
	this.assertAllColumnContextMenusClosed();
	TableUtils.openColumnContextMenu(oTable, iNumberOfCols);
	this.assertAllColumnContextMenusClosed();

	// Column menu has no items: The context menu will not be opened.
	TableUtils.openColumnContextMenu(oTable, 0);
	this.assertColumnContextMenuOpen(0, false);

	oColumnA.setSortProperty("dummy");
	oColumnB.setSortProperty("dummy");

	// Column is not visible: The context menu will not be opened.
	oColumnA.setVisible(false);
	TableUtils.openColumnContextMenu(oTable, 0);
	this.assertColumnContextMenuOpen(0, false);
	oColumnA.setVisible(true);

	// Open the context menu of column 1.
	TableUtils.openColumnContextMenu(oTable, 0);
	this.assertColumnContextMenuOpen(0, true);
	this.assertFirstMenuItemHovered(oColumnA.getMenu(), false);

	// Trying to open the context menu of column 1 again will leave it open.
	TableUtils.openColumnContextMenu(oTable, 0, true);
	this.assertColumnContextMenuOpen(0, true);
	this.assertFirstMenuItemHovered(oColumnA.getMenu(), false);

	// Open the context menu of column 2. The context menu of column 1 will be closed.
	TableUtils.openColumnContextMenu(oTable, 1, true);
	this.assertColumnContextMenuOpen(0, false);
	this.assertColumnContextMenuOpen(1, true);
	this.assertFirstMenuItemHovered(oColumnB.getMenu(), true);
});

QUnit.test("closeColumnContextMenu", function(assert) {
	// Open the column context menu.
	oTable.getColumns()[0].setSortProperty("dummy");
	TableUtils.openColumnContextMenu(oTable, 0);
	this.assertColumnContextMenuOpen(0, true);

	// Invalid parameters: Leave the context menu open.
	TableUtils.closeColumnContextMenu();
	this.assertColumnContextMenuOpen(0, true);

	TableUtils.closeColumnContextMenu(oTable);
	this.assertColumnContextMenuOpen(0, true);

	TableUtils.closeColumnContextMenu(oTable, -1);
	this.assertColumnContextMenuOpen(0, true);

	TableUtils.closeColumnContextMenu(oTable, iNumberOfCols);
	this.assertColumnContextMenuOpen(0, true);

	TableUtils.closeColumnContextMenu(oTable, 1);
	this.assertColumnContextMenuOpen(0, true);

	// Close the context menu.
	TableUtils.closeColumnContextMenu(oTable, 0);
	this.assertColumnContextMenuOpen(0, false);
});

QUnit.test("openDataCellContextMenu", function(assert) {
	oTable.setVisibleRowCount(iNumberOfRows + 1);
	sap.ui.getCore().applyChanges();

	// Invalid parameters: The cell context menu will not be created.
	assert.strictEqual(oTable._oCellContextMenu, undefined, "The menu is not yet created");
	TableUtils.openDataCellContextMenu();
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No parameters passed: The menu was not created");
	TableUtils.openDataCellContextMenu(oTable);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No column and row index parameters passed: The menu was not created");
	TableUtils.openDataCellContextMenu(oTable, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No row index parameter passed: The menu was not created");
	TableUtils.openDataCellContextMenu(oTable, -1, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Column index out of lower bound: The menu was not created");
	TableUtils.openDataCellContextMenu(oTable, iNumberOfCols, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Column index out of upper bound: The menu was not created");
	TableUtils.openDataCellContextMenu(oTable, 0, -1);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Row index out of lower bound: The menu was not created");
	TableUtils.openDataCellContextMenu(oTable, 0, iNumberOfRows + 1);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Row index out of upper bound: The menu was not created");
	TableUtils.openDataCellContextMenu(oTable, 0, iNumberOfRows);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Row index pointing to an empty row: The menu was not created");

	var oColumnA = oTable.getColumns()[0];
	var oIsColumnAFilterableByMenu = this.stub(oColumnA, "isFilterableByMenu");

	// Column is not visible: The cell context menu will not be created.
	oColumnA.setVisible(false);
	TableUtils.openDataCellContextMenu(oTable, 0, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Column index pointing to an invisible column: The menu was not created");
	oColumnA.setVisible(true);

	// Cell filters are not enabled: The cell context menu will not be created.
	oTable.setEnableCellFilter(false);
	TableUtils.openDataCellContextMenu(oTable, 0, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Cell filters are not enabled: The menu was not created");
	oTable.setEnableCellFilter(true);

	// Column is not filterable by menu: The cell context menu will not be created.
	oIsColumnAFilterableByMenu.returns(false);
	TableUtils.openDataCellContextMenu(oTable, 0, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Column not filterable by menu: The menu was not created");
	oIsColumnAFilterableByMenu.returns(true);

	// Cell [0, 0]: The menu will be created and opened.
	TableUtils.openDataCellContextMenu(oTable, 0, 0);
	assert.ok(oTable._oCellContextMenu != undefined, "The menu has been created");
	assert.strictEqual(oTable._oCellContextMenu.getItems().length, 1, "One menu item has been created");
	assert.strictEqual(oTable._oCellContextMenu.getItems()[0].mEventRegistry.select.length, 1,
		"One menu item select event handler has been attached");
	this.assertDataCellContextMenuOpen(0, 0, true);
	this.assertFirstMenuItemHovered(oTable._oCellContextMenu, false);
	oTable._oCellContextMenu.__isOriginal = true;
	oTable._oCellContextMenu.getItems()[0].__isOriginal = true;
	oTable._oCellContextMenu.getItems()[0].mEventRegistry.select[0].fFunction.__isOriginal = true;

	var oColumnB = oTable.getColumns()[1];
	this.stub(oColumnB, "isFilterableByMenu").returns(true);

	// Cell [0, 0]: The menu will be closed.
	// Cell [1, 0]: The menu will be opened.
	TableUtils.openDataCellContextMenu(oTable, 1, 0, true);
	this.assertDataCellContextMenuOpen(0, 0, false);
	this.assertDataCellContextMenuOpen(1, 0, true);
	this.assertFirstMenuItemHovered(oTable._oCellContextMenu, true);
	assert.ok(oTable._oCellContextMenu.__isOriginal, "The menu has been reused");
	assert.ok(oTable._oCellContextMenu.getItems()[0].__isOriginal, "The menu item has been reused");
	assert.strictEqual(oTable._oCellContextMenu.getItems().length, 1, "There is still only one menu item");
	assert.ok(!oTable._oCellContextMenu.getItems()[0].mEventRegistry.select[0].fFunction.__isOriginal,
		"The menu item select event handler has been updated");
	assert.strictEqual(oTable._oCellContextMenu.getItems()[0].mEventRegistry.select.length, 1,
		"There is still only one menu item select event handler attached");

	// Cell [1, 0]: The menu will stay open.
	TableUtils.openDataCellContextMenu(oTable, 1, 0, false);
	this.assertDataCellContextMenuOpen(1, 0, true);
	this.assertFirstMenuItemHovered(oTable._oCellContextMenu, true);
	assert.ok(oTable._oCellContextMenu.__isOriginal, "The menu has been reused");
	assert.ok(oTable._oCellContextMenu.getItems()[0].__isOriginal, "The menu item has been reused");
	assert.strictEqual(oTable._oCellContextMenu.getItems().length, 1, "There is still only one menu item");
	assert.ok(!oTable._oCellContextMenu.getItems()[0].mEventRegistry.select[0].fFunction.__isOriginal,
		"The menu item select event handler has been updated");
	assert.strictEqual(oTable._oCellContextMenu.getItems()[0].mEventRegistry.select.length, 1,
		"There is still only one menu item select event handler attached");
});

QUnit.test("openDataCellContextMenu - Filter & Fire CustomFilter event", function(assert) {
	var oColumn = oTable.getColumns()[0];
	oColumn.setFilterProperty("A");

	oTable.setEnableCellFilter(true);
	TableUtils.openDataCellContextMenu(oTable, 0, 0);

	// Filter
	var oFilter = this.spy(oTable, "filter");
	oTable._oCellContextMenu.getItems()[0].fireSelect();

	assert.ok(oFilter.calledOnce, "The filter function has been called");

	var mActualColumnArgument = oFilter.args[0][0];
	assert.deepEqual(mActualColumnArgument, oColumn,
		"The CustomFilter event handler has been called with the correct column argument");

	var sActualFilterValueArgument = oFilter.args[0][1];
	var oRowContext = oTable.getContextByIndex(0);
	var sFilterProperty = oColumn.getFilterProperty();
	var sExpectedFilterValueArgument = oRowContext.getProperty(sFilterProperty);
	assert.strictEqual(sActualFilterValueArgument, sExpectedFilterValueArgument,
		"The CustomFilter event handler has been called with the correct filter value argument");

	// CustomFilter
	var oCustomFilterEvent = this.spy(oTable, "fireCustomFilter");
	oTable.setEnableCustomFilter(true);
	oTable._oCellContextMenu.getItems()[0].fireSelect();

	assert.ok(oCustomFilterEvent.calledOnce, "The CustomFilter event handler has been called");

	var mExpectedArguments = {
		column: oColumn,
		value: sExpectedFilterValueArgument,
		id: oTable.getId()
	};
	var mActualArguments = oCustomFilterEvent.args[0][0];
	assert.deepEqual(mActualArguments, mExpectedArguments,
		"The CustomFilter event handler has been called with the correct arguments");
});

QUnit.test("closeDataCellContextMenu", function(assert) {
	var oColumn = oTable.getColumns()[0];
	this.stub(oColumn, "isFilterableByMenu").returns(true);

	oTable.setEnableCellFilter(true);

	TableUtils.openDataCellContextMenu(oTable, 0, 0);
	this.assertDataCellContextMenuOpen(0, 0, true);

	TableUtils.closeDataCellContextMenu();
	this.assertDataCellContextMenuOpen(0, 0, true);

	TableUtils.closeDataCellContextMenu(oTable);
	this.assertDataCellContextMenuOpen(0, 0, false);
});

QUnit.test("applyColumnHeaderCellMenu", function(assert) {
	// Invalid parameters: No cell menu will be applied.
	TableUtils.applyColumnHeaderCellMenu();
	this.assertNoColumnHeaderCellMenusExists();
	TableUtils.applyColumnHeaderCellMenu(oTable);
	this.assertNoColumnHeaderCellMenusExists();
	TableUtils.applyColumnHeaderCellMenu(oTable, -1);
	this.assertNoColumnHeaderCellMenusExists();
	TableUtils.applyColumnHeaderCellMenu(oTable, iNumberOfCols);
	this.assertNoColumnHeaderCellMenusExists();

	var oColumn = oTable.getColumns()[0];
	var $Column = oColumn.$();

	// Column is not visible: The cell menu will not be applied.
	oColumn.setVisible(false);
	TableUtils.applyColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, false);
	oColumn.setVisible(true);

	// Column is not resizable and has no menu items: The cell menu will not be applied.
	oColumn.setResizable(false);
	TableUtils.applyColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, false);
	oColumn.setResizable(true);

	// Column is resizable and has no menu items: A cell menu with a resize button will be applied.
	TableUtils.applyColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, true);
	this.assertColumnHeaderCellMenuButtonExists($Column, false);
	this.assertColumnHeaderCellResizeButtonExists($Column, true);

	oColumn = oTable.getColumns()[1];
	$Column = oColumn.$();

	// Column is not resizable and has menu items: A cell menu with a context menu button will be applied.
	oColumn.setResizable(false);
	this.stub(oColumn, "_menuHasItems").returns(true);
	TableUtils.applyColumnHeaderCellMenu(oTable, 1);
	this.assertColumnHeaderCellMenuExists($Column, true);
	this.assertColumnHeaderCellMenuButtonExists($Column, true);
	this.assertColumnHeaderCellResizeButtonExists($Column, false);

	oColumn = oTable.getColumns()[2];
	$Column = oColumn.$();

	// Column is resizable and has menu items: A cell menu with a context menu and a resize button will be applied.
	this.stub(oColumn, "_menuHasItems").returns(true);
	TableUtils.applyColumnHeaderCellMenu(oTable, 2);
	this.assertColumnHeaderCellMenuExists($Column, true);
	this.assertColumnHeaderCellMenuButtonExists($Column, true);
	this.assertColumnHeaderCellResizeButtonExists($Column, true);

	// Applying the cell menu to the same column header cell again.
	TableUtils.applyColumnHeaderCellMenu(oTable, 2);
	this.assertColumnHeaderCellMenuExists($Column, true);
	this.assertColumnHeaderCellMenuButtonExists($Column, true);
	this.assertColumnHeaderCellResizeButtonExists($Column, true);
});

QUnit.test("removeColumnHeaderCellMenu", function(assert) {
	var $Column = getColumnHeader(0);

	// Apply the cell menu.
	TableUtils.applyColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, true);

	// Invalid parameters: The cell menu will not be removed.
	TableUtils.removeColumnHeaderCellMenu();
	this.assertColumnHeaderCellMenuExists($Column, true);
	TableUtils.removeColumnHeaderCellMenu(oTable);
	this.assertColumnHeaderCellMenuExists($Column, true);
	TableUtils.removeColumnHeaderCellMenu(oTable, -1);
	this.assertColumnHeaderCellMenuExists($Column, true);
	TableUtils.removeColumnHeaderCellMenu(oTable, iNumberOfCols);
	this.assertColumnHeaderCellMenuExists($Column, true);

	// Remove the cell menu.
	TableUtils.removeColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, false);

	// When a column header cell has no cell menu, removing the cell menu has no effect.
	TableUtils.removeColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, false);
});

QUnit.test("removeColumnHeaderCellMenu - On Focus Out", function(assert) {
	var spy = this.spy(TableUtils, "removeColumnHeaderCellMenu");
	var $Column = getColumnHeader(0, true, assert);

	this.assertColumnHeaderCellMenuExists($Column, false);

	// Apply the cell menu.
	TableUtils.applyColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, true);

	// When the column header cell looses the focus the cell menu should be removed.
	qutils.triggerEvent("focusout", $Column);
	assert.ok(spy.called, "removeColumnHeaderCellMenu was called when the column header cell has lost the focus");
	this.assertColumnHeaderCellMenuExists($Column, false);
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

QUnit.test("getRowHeightByIndex", function(assert) {
	var iDefaultRowHeight = oTable._getDefaultRowHeight();

	assert.equal(TableUtils.getRowHeightByIndex(oTable, 0), iDefaultRowHeight, "First Row Height is 48");
	assert.equal(TableUtils.getRowHeightByIndex(oTable, oTable.getRows().length - 1), iDefaultRowHeight, "Last Row Height is 48");
	assert.equal(TableUtils.getRowHeightByIndex(oTable, 50), 0, "Invalid Row Height is 0");
	assert.equal(TableUtils.getRowHeightByIndex(null, 0), 0, "No Table available returns 0px as row height");

	oTable.setFixedColumnCount(0);
	sap.ui.getCore().applyChanges();

	assert.equal(TableUtils.getRowHeightByIndex(oTable, 0), iDefaultRowHeight, "First Row Height is 48, with Table with no fixed columns");
	jQuery(document.body).toggleClass("sapUiSizeCozy", false);
});

QUnit.module("Resize Handler", {
	beforeEach: function() {
		jQuery("#content").append("<div id='__table-outer' style='height: 500px; width: 500px; overflow: hidden; background: red;'>" +
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
	},
	afterEach: function() {
		jQuery("#content").empty();
	}
});

QUnit.asyncTest("Register/Deregister", 17, function(assert) {
	var sResizeHandlerId;
	var fnTestOuter = function(oEvent) {
		assert.equal(oEvent.currentTarget.getAttribute("id"), this.oTable.getId("outer"), "ResizeHandler triggered for 'outer' element");
		jQuery("#" + this.oTable.getId("inner")).height("250px");
	};

	var fnTestCenterParent = function(oEvent) {
		assert.equal(oEvent.currentTarget.getAttribute("id"), this.oTable.getId("inner"), "ResizeHandler triggered for parent of 'center', 'inner'");
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

		assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), ["center", "inner", "outer"], "All ResizeHandler IDs correctly stored at table instance");

		TableUtils.deregisterResizeHandler(this.oTable, ["center", "outer"]);
		assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), ["inner"], "All ResizeHandler IDs correctly stored after remove 'center', 'outer'");

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

		QUnit.start();
	};

	assert.strictEqual(this.oTable._mResizeHandlerIds, undefined, "No ResizeHandler registered, therefore no ResizeHandlerIds map");
	TableUtils.deregisterResizeHandler(this.oTable);
	assert.strictEqual(this.oTable._mResizeHandlerIds, undefined, "Deregister does not create ResizeHandlerIds map");

	sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, "outer", fnTestOuter.bind(this));
	assert.notStrictEqual(sResizeHandlerId, undefined, "ResizeHandler ID was returned for 'outer': '" + sResizeHandlerId + "'");
	assert.equal(this.oTable._mResizeHandlerIds.outer, sResizeHandlerId, "ResizeHandler ID correctly stored at table instance (outer)");

	sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, "center", fnTestCenterParent.bind(this), true);
	assert.notStrictEqual(sResizeHandlerId, undefined, "ResizeHandler ID was returned for 'inner', registered by parent of 'center': '" + sResizeHandlerId + "'");
	assert.equal(this.oTable._mResizeHandlerIds.center, sResizeHandlerId, "ResizeHandler ID correctly stored at table instance (parent of center)");

	sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, "doesNotExist", fnTestCenterParent.bind(this), true);
	assert.strictEqual(sResizeHandlerId, undefined, "No ResizeHandler ID returned for unknown DOM");

	jQuery("#" + this.oTable.getId("outer")).height("550px");
});

QUnit.module("Content Density", {
	beforeEach: function() {
		jQuery("#content").append("<div id='__table-outer'>" +
			"</div>");

		this.oTable = new sap.ui.table.Table();

		this.TableUtilsDummyControl = sap.ui.core.Control.extend("sap.ui.table.TableUtilsDummyControl", {
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
		jQuery("#content").empty();
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
	assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed", "sapUiSizeCondensed and sapUiSizeCozy at #Nested -> sapUiSizeCondensed");
	oNested.addStyleClass("sapUiSizeCompact");
	oCore.applyChanges();
	assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCompact", "sapUiSizeCompact, sapUiSizeCondensed and sapUiSizeCozy at #Nested -> sapUiSizeCompact");

	this.oTable.addStyleClass("sapUiSizeCozy");
	oCore.applyChanges();
	assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy", "sapUiSizeCozy at table");

	this.oTable.$().toggleClass("sapUiSizeCondensed", true);
	assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed", "sapUiSizeCondensed at table DOM and sapUiSizeCozy at control level. DOM wins.");

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
	assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed", "sapUiSizeCondensed and sapUiSizeCozy at #Nested -> sapUiSizeCondensed");
	oNested.addStyleClass("sapUiSizeCompact");
	assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCompact", "sapUiSizeCompact, sapUiSizeCondensed and sapUiSizeCozy at #Nested -> sapUiSizeCompact");

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

QUnit.module("Interactive elements", {
	beforeEach: function() {
		createTables();

		function addColumn(sTitle, sText, bFocusable, bTabbable) {
			var oControlTemplate;
			if (!bFocusable) {
				oControlTemplate = new TestControl({
					text: "{" + sText + "}",
					index: iNumberOfCols,
					visible: true,
					tabbable: bTabbable
				})
			} else {
				oControlTemplate = new TestInputControl({
					text: "{" + sText + "}",
					index: iNumberOfCols,
					visible: true,
					tabbable: bTabbable
				})
			}

			oTable.addColumn(new sap.ui.table.Column({
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

QUnit.test("isInteractiveElement", function(assert) {
	var $NoFocusNoTab = getCell(0, iNumberOfCols - 3).find("span");
	var $NoFocus = getCell(0, iNumberOfCols - 4).find("span");
	$NoFocus[0].tabIndex = 0;
	var $NoTab = getCell(0, iNumberOfCols - 1).find("input");
	var $FullyInteractive = getCell(0, iNumberOfCols - 2).find("input");
	var $TreeIcon = jQuery('<div class="sapUiTableTreeIcon"></div>');

	assert.ok(!TableUtils.isElementInteractive($NoFocusNoTab), "(jQuery) Not focusable and not tabbable element is not interactive");
	assert.ok(TableUtils.isElementInteractive($NoFocus), "(jQuery) Not focusable and tabbable element is interactive");
	assert.ok(TableUtils.isElementInteractive($NoTab), "(jQuery) Focusable and not tabbable input element is interactive");
	assert.ok(TableUtils.isElementInteractive($FullyInteractive), "(jQuery) Focusable and tabbable input element is interactive");
	assert.ok(TableUtils.isElementInteractive($TreeIcon), "(jQuery) TreeIcon is interactive");

	assert.ok(!TableUtils.isElementInteractive($NoFocusNoTab[0]), "(HTMLElement) Not focusable and not tabbable element is not interactive");
	assert.ok(TableUtils.isElementInteractive($NoFocus[0]), "(HTMLElement) Not focusable and tabbable element is interactive");
	assert.ok(TableUtils.isElementInteractive($NoTab[0]), "(HTMLElement) Focusable and not tabbable input element is interactive");
	assert.ok(TableUtils.isElementInteractive($FullyInteractive[0]), "(HTMLElement) Focusable and tabbable input element is interactive");
	assert.ok(TableUtils.isElementInteractive($TreeIcon[0]), "(HTMLElement) TreeIcon is interactive");

	assert.ok(!TableUtils.isElementInteractive(), "No parameter passed: False was returned");
});

QUnit.test("getInteractiveElements", function(assert) {
	var $InteractiveElements = TableUtils.getInteractiveElements(getCell(0, iNumberOfCols - 1));
	assert.strictEqual($InteractiveElements.length, 1, "Data cell with focusable element: One element was returned");
	assert.strictEqual($InteractiveElements[0].value, "NoTab1", "Data cell (jQuery) with focusable element: The correct element was returned");

	$InteractiveElements = TableUtils.getInteractiveElements(getCell(0, iNumberOfCols - 1)[0]);
	assert.strictEqual($InteractiveElements.length, 1, "Data cell with focusable element: One element was returned");
	assert.strictEqual($InteractiveElements[0].value, "NoTab1", "Data cell (DOM) with focusable element: The correct element was returned");

	$InteractiveElements = TableUtils.getInteractiveElements(getCell(0, iNumberOfCols - 2));
	assert.strictEqual($InteractiveElements.length, 1, "Data cell with focusable & tabbable element: One element was returned");
	assert.strictEqual($InteractiveElements[0].value, "FocusTab1", "Data cell (jQuery) with focusable & tabbable element: The correct element was returned");

	$InteractiveElements = TableUtils.getInteractiveElements(getCell(0, iNumberOfCols - 2)[0]);
	assert.strictEqual($InteractiveElements.length, 1, "Data cell with focusable & tabbable element: One element was returned");
	assert.strictEqual($InteractiveElements[0].value, "FocusTab1", "Data cell (DOM) with focusable & tabbable element: The correct element was returned");

	$InteractiveElements = TableUtils.getInteractiveElements(getCell(0, iNumberOfCols - 3));
	assert.strictEqual($InteractiveElements, null, "Data cell without interactive element: Null was returned");

	$InteractiveElements = TableUtils.getInteractiveElements(getColumnHeader(0));
	assert.strictEqual($InteractiveElements, null, "Column header: Null was returned");

	$InteractiveElements = TableUtils.getInteractiveElements(getRowHeader(0));
	assert.strictEqual($InteractiveElements, null, "Row header: Null was returned");

	$InteractiveElements = TableUtils.getInteractiveElements(getSelectAll(0));
	assert.strictEqual($InteractiveElements, null, "SelectAll: Null was returned");

	$InteractiveElements = TableUtils.getInteractiveElements();
	assert.strictEqual($InteractiveElements, null, "No parameter passed: Null was returned");
});

QUnit.test("getFirstInteractiveElement", function(assert) {
	var $FirstInteractiveElement = TableUtils.getFirstInteractiveElement(oTable.getRows()[0]);
	assert.strictEqual($FirstInteractiveElement.length, 1, "First row: One element was returned");
	assert.strictEqual($FirstInteractiveElement[0].value, "FocusTab1", "First row: The correct element was returned");

	$FirstInteractiveElement = TableUtils.getFirstInteractiveElement();
	assert.strictEqual($FirstInteractiveElement, null, "No parameter passed: Null was returned");
});

QUnit.test("getLastInteractiveElement", function(assert) {
	var $LastInteractiveElement = TableUtils.getLastInteractiveElement(oTable.getRows()[0]);
	assert.strictEqual($LastInteractiveElement.length, 1, "First row: One element was returned");
	assert.strictEqual($LastInteractiveElement[0].value, "NoTab1", "First row: The correct element was returned");

	$LastInteractiveElement = TableUtils.getLastInteractiveElement();
	assert.strictEqual($LastInteractiveElement, null, "No parameter passed: Null was returned");
});

QUnit.test("getPreviousInteractiveElement", function(assert) {
	var $LastInteractiveElement = TableUtils.getLastInteractiveElement(oTable.getRows()[0]);

	var $PreviousInteractiveElement = TableUtils.getPreviousInteractiveElement(oTable, $LastInteractiveElement);
	assert.strictEqual($PreviousInteractiveElement.length, 1, "Passed an interactive element (jQuery): One interactive element was returned");
	assert.strictEqual($PreviousInteractiveElement[0].value, "FocusTab1", "The correct previous element was returned");

	$PreviousInteractiveElement = TableUtils.getPreviousInteractiveElement(oTable, $PreviousInteractiveElement);
	assert.strictEqual($PreviousInteractiveElement, null,
		"Getting the previous element of the previous element: Null was returned, it is the first interactive element in the row");

	$PreviousInteractiveElement = TableUtils.getPreviousInteractiveElement(oTable, $LastInteractiveElement[0])
	assert.strictEqual($PreviousInteractiveElement.length, 1, "Passed an interactive element (HTMLElement): One interactive element was returned");
	assert.strictEqual($PreviousInteractiveElement[0].value, "FocusTab1", "First row: The correct previous element was returned");

	$PreviousInteractiveElement = TableUtils.getPreviousInteractiveElement(oTable, $PreviousInteractiveElement[0]);
	assert.strictEqual($PreviousInteractiveElement, null,
		"Getting the previous element of the previous element: Null was returned, it is the first interactive element in the row");

	$PreviousInteractiveElement = TableUtils.getPreviousInteractiveElement(oTable, getCell(0, 0));
	assert.strictEqual($PreviousInteractiveElement, null, "Data cell was passed: Null was returned");

	$PreviousInteractiveElement = TableUtils.getPreviousInteractiveElement(oTable, getColumnHeader(0));
	assert.strictEqual($PreviousInteractiveElement, null, "Column header cell was passed: Null was returned");

	$PreviousInteractiveElement = TableUtils.getPreviousInteractiveElement(oTable, getRowHeader(0));
	assert.strictEqual($PreviousInteractiveElement, null, "Row header cell was passed: Null was returned");

	$PreviousInteractiveElement = TableUtils.getPreviousInteractiveElement(oTable, getSelectAll(0));
	assert.strictEqual($PreviousInteractiveElement, null, "SelectAll cell was passed: Null was returned");

	$PreviousInteractiveElement = TableUtils.getPreviousInteractiveElement(oTable);
	assert.strictEqual($PreviousInteractiveElement, null, "No interactive element was passed: Null was returned");

	$PreviousInteractiveElement = TableUtils.getPreviousInteractiveElement();
	assert.strictEqual($PreviousInteractiveElement, null, "No parameter was passed: Null was returned");
});

QUnit.test("getNextInteractiveElement", function(assert) {
	var $FirstInteractiveElement = TableUtils.getFirstInteractiveElement(oTable.getRows()[0]);

	var $NextInteractiveElement = TableUtils.getNextInteractiveElement(oTable, $FirstInteractiveElement);
	assert.strictEqual($NextInteractiveElement.length, 1, "Passed an interactive element (jQuery): One interactive element was returned");
	assert.strictEqual($NextInteractiveElement[0].value, "NoTab1", "The correct next element was returned");

	$NextInteractiveElement = TableUtils.getNextInteractiveElement(oTable, $NextInteractiveElement);
	assert.strictEqual($NextInteractiveElement, null,
		"Getting the next element of the next element: Null was returned, it is the last interactive element in the row");

	$NextInteractiveElement = TableUtils.getNextInteractiveElement(oTable, $FirstInteractiveElement[0]);
	assert.strictEqual($NextInteractiveElement.length, 1, "Passed an interactive element (HTMLElement): One interactive element was returned");
	assert.strictEqual($NextInteractiveElement[0].value, "NoTab1", "First row: The correct next element was returned");

	$NextInteractiveElement = TableUtils.getNextInteractiveElement(oTable, $NextInteractiveElement[0]);
	assert.strictEqual($NextInteractiveElement, null,
		"Getting the previous element of the previous element: Null was returned, it is the last interactive element in the row");

	$NextInteractiveElement = TableUtils.getNextInteractiveElement(oTable, getCell(0, 0));
	assert.strictEqual($NextInteractiveElement, null, "Data cell was passed: Null was returned");

	$NextInteractiveElement = TableUtils.getNextInteractiveElement(oTable, getColumnHeader(0));
	assert.strictEqual($NextInteractiveElement, null, "Column header cell was passed: Null was returned");

	$NextInteractiveElement = TableUtils.getNextInteractiveElement(oTable, getRowHeader(0));
	assert.strictEqual($NextInteractiveElement, null, "Row header cell was passed: Null was returned");

	$NextInteractiveElement = TableUtils.getNextInteractiveElement(oTable, getSelectAll(0));
	assert.strictEqual($NextInteractiveElement, null, "SelectAll cell was passed: Null was returned");

	$NextInteractiveElement = TableUtils.getNextInteractiveElement(oTable);
	assert.strictEqual($NextInteractiveElement, null, "No interactive element was passed: Null was returned");

	$NextInteractiveElement = TableUtils.getNextInteractiveElement();
	assert.strictEqual($NextInteractiveElement, null, "No parameter was passed: Null was returned");
});

QUnit.test("getParentDataCell", function(assert) {
	var oCell = getCell(0, iNumberOfCols - 1);
	var $InteractiveControls = TableUtils.getInteractiveElements(oCell);
	var $ParentDataCell = TableUtils.getParentDataCell(oTable, $InteractiveControls[0]);
	assert.strictEqual($ParentDataCell.length, 1, "A data cell was returned");
	assert.strictEqual($ParentDataCell[0], oCell[0], "jQuery object passed: The correct data cell was returned");

	$InteractiveControls = TableUtils.getInteractiveElements(oCell[0]);
	$ParentDataCell = TableUtils.getParentDataCell(oTable, $InteractiveControls[0]);
	assert.strictEqual($ParentDataCell.length, 1, "A data cell was returned");
	assert.strictEqual($ParentDataCell[0], oCell[0], "DOM element passed: The correct data cell was returned");

	oCell = getCell(0, iNumberOfCols - 2);
	$InteractiveControls = TableUtils.getInteractiveElements(oCell);
	$ParentDataCell = TableUtils.getParentDataCell(oTable, $InteractiveControls[0]);
	assert.strictEqual($ParentDataCell.length, 1, "A data cell was returned");
	assert.strictEqual($ParentDataCell[0], oCell[0], "jQuery object passed: The correct data cell was returned");

	$InteractiveControls = TableUtils.getInteractiveElements(oCell[0]);
	$ParentDataCell = TableUtils.getParentDataCell(oTable, $InteractiveControls[0]);
	assert.strictEqual($ParentDataCell.length, 1, "A data cell was returned");
	assert.strictEqual($ParentDataCell[0], oCell[0], "DOM element passed: The correct data cell was returned");

	$ParentDataCell = TableUtils.getParentDataCell(oTable);
	assert.strictEqual($ParentDataCell, null, "No element parameter passed: Null was returned");
});