
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

	// the setter for navigationMode would default to NavigationMode.Scrollbar, Therefore use the generic setter for this test
	oTable.setProperty("navigationMode", sap.ui.table.NavigationMode.Paginator);
	assert.ok(!TableUtils.isVariableRowHeightEnabled(oTable), "VariableRowHeight is not allowed when oTable has a Paginator.");
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
	oTable.getColumns()[1].setHeaderSpan([2,1]);
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
		getVisibleRowCount: function() { return 10;	},
		_getRowCount: function() { return 5; }
	};
	var oTableDummy2 = {
		getVisibleRowCount: function() { return 10; },
		_getRowCount: function() { return 15; }
	};
	var oTableDummy3 = {
		getVisibleRowCount: function() { return 10; },
		_getRowCount: function() { return 10; }
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
		_getItemNavigation: function() {}
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
			getShowNoData: function(){return bShowNoData;},
			_getRowCount: function(){return iBindingLength},
			getBinding: function(){
				var oBinding = {};
				if (bAnalytical) {
					oBinding.providesGrandTotal = function(){return bHasTotals};
					oBinding.hasTotaledMeasures = function(){return bHasTotals};
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

QUnit.test("scroll", function(assert) {
	var iVisibleRowCount = 5;
	var iFixedTop = 2;
	var iFixedBottom = 1;
	var iNotVisibleRows = iNumberOfRows - iVisibleRowCount;
	var iPageSize = iVisibleRowCount - iFixedTop - iFixedBottom;
	var iPages = Math.ceil((iNumberOfRows - iFixedTop - iFixedBottom) / iPageSize);

	oTable.setVisibleRowCount(iVisibleRowCount);
	oTable.setFixedRowCount(iFixedTop);
	oTable.setFixedBottomRowCount(iFixedBottom);
	sap.ui.getCore().applyChanges();

	var bScrolled = false;

	for (var i = 0; i < iNotVisibleRows + 2; i++) {
		if (i < iNotVisibleRows) {
			assert.equal(oTable.getFirstVisibleRow(), i, "First visible row before scroll (forward, stepwise, " + i + ")");
			bScrolled = TableUtils.scroll(oTable, true, false);
			assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), i + 1, "First visible row after scroll");
		} else {
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row before scroll (forward, stepwise, " + i + ")");
			bScrolled = TableUtils.scroll(oTable, true, false);
			assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row after scroll");
		}
	}

	for (var i = 0; i < iNotVisibleRows + 2; i++) {
		if (i < iNotVisibleRows) {
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows - i, "First visible row before scroll (backward, stepwise, " + i + ")");
			bScrolled = TableUtils.scroll(oTable, false, false);
			assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows - i - 1, "First visible row after scroll");
		} else {
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scroll (backward, stepwise, " + i + ")");
			bScrolled = TableUtils.scroll(oTable, false, false);
			assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scroll");
		}
	}

	var iPos = 0;
	for (var i = 0; i < iPages + 2; i++) {
		if (i < iPages - 1) {
			assert.equal(oTable.getFirstVisibleRow(), iPos, "First visible row before scroll (forward, pagewise, " + i + ")");
			bScrolled = TableUtils.scroll(oTable, true, true);
			assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
			iPos = iPos + iPageSize;
			assert.equal(oTable.getFirstVisibleRow(), Math.min(iPos, iNotVisibleRows), "First visible row after scroll");
		} else {
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row before scroll (forward, pagewise, " + i + ")");
			bScrolled = TableUtils.scroll(oTable, true, true);
			assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row after scroll");
		}
	}

	iPos = iNotVisibleRows;
	for (var i = 0; i < iPages + 2; i++) {
		if (i < iPages - 1) {
			assert.equal(oTable.getFirstVisibleRow(), iPos, "First visible row before scroll (backward, pagewise, " + i + ")");
			bScrolled = TableUtils.scroll(oTable, false, true);
			assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
			iPos = iPos - iPageSize;
			assert.equal(oTable.getFirstVisibleRow(), Math.max(iPos, 0), "First visible row after scroll");
		} else {
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scroll (backward, pagewise, " + i + ")");
			bScrolled = TableUtils.scroll(oTable, false, true);
			assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scroll");
		}
	}
});

QUnit.test("scrollMax", function(assert) {
	var bScrolled = false;

	/* More data rows than visible rows */
	// ↓ Down
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
	bScrolled = TableUtils.scrollMax(oTable, true);
	assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), iNumberOfRows - oTable.getVisibleRowCount(), "First visible row after scrolling");
	// ↑ Up
	bScrolled = TableUtils.scrollMax(oTable, false);
	assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

	/* Less data rows than visible rows */
	oTable.setVisibleRowCount(10);
	sap.ui.getCore().applyChanges();
	// ↓ Down
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
	bScrolled = TableUtils.scrollMax(oTable, true);
	assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
	// ↑ Up
	bScrolled = TableUtils.scrollMax(oTable, false);
	assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

	/* More data rows than visible rows and fixed top/bottom rows */
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	sap.ui.getCore().applyChanges();
	// ↓ Down
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
	bScrolled = TableUtils.scrollMax(oTable, true);
	assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), iNumberOfRows - oTable.getVisibleRowCount(), "First visible row after scrolling");
	// ↑ Up
	bScrolled = TableUtils.scrollMax(oTable, false);
	assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

	/* Less data rows than visible rows and fixed top/bottom rows */
	oTable.setVisibleRowCount(10);
	sap.ui.getCore().applyChanges();
	// ↓ Down
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
	bScrolled = TableUtils.scrollMax(oTable, true);
	assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
	// ↑ Up
	bScrolled = TableUtils.scrollMax(oTable, false);
	assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
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
		TableUtils.scroll(oTable, true, false);
	}

});

QUnit.module("TableUtils", {
	setup: function() {
		jQuery(document.body).toggleClass("sapUiSizeCozy", true);
		createTables();
	},
	teardown: function () {
		destroyTables();
		jQuery(document.body).toggleClass("sapUiSizeCozy", false);
	}
});

QUnit.test("getRowHeightByIndex", function(assert) {
	assert.equal(TableUtils.getRowHeightByIndex(oTable, 0), 48, "First Row Height is 48");
	assert.equal(TableUtils.getRowHeightByIndex(oTable, oTable.getRows().length - 1), 48, "Last Row Height is 48");
	assert.equal(TableUtils.getRowHeightByIndex(oTable, 50), 0, "Invalid Row Height is 0");
	assert.equal(TableUtils.getRowHeightByIndex(null, 0), 0, "No Table available returns 0px as row height");

	oTable.setFixedColumnCount(0);
	sap.ui.getCore().applyChanges();

	assert.equal(TableUtils.getRowHeightByIndex(oTable, 0), 48, "First Row Height is 48, with Table with no fixed columns");
	jQuery(document.body).toggleClass("sapUiSizeCozy", false);
});


QUnit.module("TableUtils", {
	setup: function() {
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
	teardown: function () {
		jQuery("#content").empty();
	}
});


QUnit.asyncTest("ResizeHandler", 17, function(assert) {
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
		TableUtils.registerResizeHandler(this.oTable, "inner", function(){});
		TableUtils.registerResizeHandler(this.oTable, "center", function(){});

		assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), ["center", "inner", "outer"], "All ResizeHandler IDs correctly stored at table instance");

		TableUtils.deregisterResizeHandler(this.oTable, ["center", "outer"]);
		assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), ["inner"], "All ResizeHandler IDs correctly stored after remove 'center', 'outer'");

		// register new handlers for further testings
		TableUtils.registerResizeHandler(this.oTable, "outer", function(){});
		TableUtils.registerResizeHandler(this.oTable, "center", function(){});

		TableUtils.deregisterResizeHandler(this.oTable);

		assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), [], "All ResizeHandler IDs correctly removed");

		// test type errors
		sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, {}, function(){});
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

QUnit.module("TableUtils", {
	setup: function() {
		jQuery("#content").append("<div id='__table-outer'>" +
			"</div>");

		this.oTable = new sap.ui.table.Table();

		this.TableUtilsDummyControl = sap.ui.core.Control.extend("sap.ui.table.TableUtilsDummyControl", {
			metadata: {
				library : "sap.ui.table",
				aggregations : {
					content : {type : "sap.ui.core.Control", multiple : true}
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
	teardown: function () {
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