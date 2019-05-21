/*global QUnit, oTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/Device"
], function(TableQUnitUtils, qutils, TableUtils, Menu, MenuItem, Device) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getSelectAll = window.getSelectAll;
	var iNumberOfRows = window.iNumberOfRows;

	//************************************************************************
	// Test Code
	//************************************************************************

	QUnit.module("Misc", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Connection to TableUtils", function(assert) {
		assert.ok(!!TableUtils.Menu, "MenuUtils namespace available");
		assert.ok(TableUtils.Menu.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.module("Context Menus", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		},
		assertAllColumnContextMenusClosed: function(assert) {
			var oColumns = oTable.getColumns();
			for (var i = 0; i < oColumns.length; i++) {
				var oColumn = oColumns[i];
				this.assertColumnContextMenuOpen(assert, oColumn.getIndex(), false);
			}
		},
		assertColumnContextMenuOpen: function(assert, iColumnIndex, bOpen) {
			var oMenu = oTable.getColumns()[iColumnIndex].getMenu();
			var bMenuOpen = oMenu.bOpen;
			assert.strictEqual(bMenuOpen, bOpen,
				"The column context menu is" + (bOpen ? " " : " not ") + "open (Column: " + (iColumnIndex + 1) + ")");
		},
		assertDataCellContextMenuOpen: function(assert, iRowIndex, iColumnIndex, bOpen) {
			var bMenuOpen = oTable._oCellContextMenu && oTable._oCellContextMenu.bOpen;
			var oCellElement = TableUtils.getCell(oTable, oTable.getRows()[iRowIndex].getCells()[iColumnIndex].getDomRef())[0];
			var bMenuOpenAtSpecifiedCell = bMenuOpen && oTable._oCellContextMenu.oOpenerRef === oCellElement;
			assert.strictEqual(bMenuOpenAtSpecifiedCell, bOpen,
				"The data cell context menu is" + (bOpen ? " " : " not ") + "open (Column: " + (iColumnIndex + 1)
				+ ", Row: " + (iRowIndex + 1) + ")");
		},
		assertFirstMenuItemHovered: function(assert, oMenu, bHovered) {
			var bFirstItemHovered = oMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
			assert.strictEqual(bFirstItemHovered, bHovered,
				"The first item in the menu is" + (bHovered ? " " : " not ") + "hovered");
		},
		assertNoColumnHeaderCellMenusExists: function(assert) {
			var oColumns = oTable.getColumns();
			for (var i = 0; i < oColumns.length; i++) {
				var oColumn = oColumns[i];
				this.assertColumnHeaderCellMenuExists(assert, oColumn.$(), false);
			}
		},
		assertColumnHeaderCellMenuExists: function(assert, $Column, bExists) {
			var iColumnIndex = +$Column.attr("data-sap-ui-colindex");

			var bCellExists = $Column.find(".sapUiTableCellInner").is(":hidden");
			assert.strictEqual(bExists, bCellExists,
				"The cell is" + (bExists ? " not " : " ") + "visible (Column: " + (iColumnIndex + 1) + ")");

			var bCellMenuExists = $Column.find(".sapUiTableCellTouchMenu").length > 0;
			assert.strictEqual(bExists, bCellMenuExists,
				"The cell menu does" + (bExists ? " " : " not ") + "exist (Column: " + (iColumnIndex + 1) + ")");
		},
		assertColumnHeaderCellMenuButtonExists: function(assert, $Column, bExists) {
			var iColumnIndex = +$Column.attr("data-sap-ui-colindex");

			var bContextMenuButtonExists = $Column.find(".sapUiTableCellTouchMenu > .sapUiTableColDropDown").length > 0;
			assert.strictEqual(bExists, bContextMenuButtonExists,
				"The context menu button does" + (bExists ? " " : " not ") + "exist (Column: " + (iColumnIndex + 1) + ")");
		},
		assertColumnHeaderCellResizeButtonExists: function(assert, $Column, bExists) {
			var iColumnIndex = +$Column.attr("data-sap-ui-colindex");

			var bResizeButtonExists = $Column.find(".sapUiTableCellTouchMenu > .sapUiTableColResizer").length > 0;
			assert.strictEqual(bExists, bResizeButtonExists,
				"The resize button does" + (bExists ? " " : " not ") + "exist (Column: " + iColumnIndex + ")");
		}
	});

	QUnit.test("openContextMenu", function(assert) {
		var mActualParameters;
		var mExpectedParameters;

		// Invalid parameters: No context menu will be opened.
		TableUtils.Menu.openContextMenu();
		this.assertAllColumnContextMenusClosed(assert);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertNoColumnHeaderCellMenusExists(assert);

		TableUtils.Menu.openContextMenu(oTable);
		this.assertAllColumnContextMenusClosed(assert);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertNoColumnHeaderCellMenusExists(assert);

		TableUtils.Menu.openContextMenu(oTable, getSelectAll());
		this.assertAllColumnContextMenusClosed(assert);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertNoColumnHeaderCellMenusExists(assert);

		TableUtils.Menu.openContextMenu(oTable, getRowHeader(0));
		this.assertAllColumnContextMenusClosed(assert);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertNoColumnHeaderCellMenusExists(assert);

		TableUtils.Menu.openContextMenu(oTable, document.getElementsByTagName("body").item(0));
		this.assertAllColumnContextMenusClosed(assert);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertNoColumnHeaderCellMenusExists(assert);

		/* Column Context Menu */

		var oColumnA = oTable.getColumns()[0];
		var $ColumnA = oColumnA.$();
		oColumnA.setSortProperty("dummy");

		var oColumnB = oTable.getColumns()[1];
		var $ColumnB = oColumnB.$();
		oColumnB.setSortProperty("dummy");

		var oColumnSelectEventHandler = this.spy(function(oEvent) {
			mActualParameters = oEvent.mParameters;
		});
		oTable.attachColumnSelect(oColumnSelectEventHandler);

		// Open the context menu of column 1. Do not fire the column select event.
		TableUtils.Menu.openContextMenu(oTable, $ColumnA[0], false, false);
		this.assertColumnContextMenuOpen(assert, 0, true);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertColumnHeaderCellMenuExists(assert, $ColumnA, false);
		assert.ok(oColumnSelectEventHandler.notCalled, "The ColumnSelect event handler has not been called");
		oColumnSelectEventHandler.reset();
		mActualParameters = null;

		// Open the context menu of column 2. Fire the column select event.
		mExpectedParameters = {
			column: oColumnB,
			id: oTable.getId()
		};

		TableUtils.Menu.openContextMenu(oTable, $ColumnB, false, true);
		this.assertColumnContextMenuOpen(assert, 0, false);
		this.assertColumnContextMenuOpen(assert, 1, true);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertColumnHeaderCellMenuExists(assert, $ColumnB, false);
		assert.ok(oColumnSelectEventHandler.calledOnce, "The ColumnSelect event handler has been called once");
		assert.deepEqual(mActualParameters, mExpectedParameters,
			"The ColumnSelect event object contains the correct parameters");
		oColumnSelectEventHandler.reset();
		mActualParameters = null;

		// Open the context menu of column 1. Fire the column select event and and prevent the default action.
		// The context menu should not be opened.
		mExpectedParameters = {
			column: oColumnA,
			id: oTable.getId()
		};

		oTable.attachEventOnce("columnSelect", function(oEvent) {
			oEvent.preventDefault();
		});

		TableUtils.Menu.openContextMenu(oTable, $ColumnA, false, true);
		this.assertColumnContextMenuOpen(assert, 0, false);
		this.assertColumnContextMenuOpen(assert, 1, true);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertColumnHeaderCellMenuExists(assert, $ColumnA, false);
		assert.ok(oColumnSelectEventHandler.calledOnce, "The ColumnSelect event handler has been called once");
		assert.deepEqual(mActualParameters, mExpectedParameters,
			"The ColumnSelect event object contains the correct parameters");
		oColumnSelectEventHandler.reset();
		mActualParameters = null;

		// Make the first column invisible and open the menu of column 2 (which is not the first visible column).
		oColumnA.setVisible(false);
		sap.ui.getCore().applyChanges();
		$ColumnB = oColumnB.$();
		mExpectedParameters = {
			column: oColumnB,
			id: oTable.getId()
		};

		TableUtils.Menu.openContextMenu(oTable, $ColumnB, false, true);
		this.assertColumnContextMenuOpen(assert, 0, false);
		this.assertColumnContextMenuOpen(assert, 1, true);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertColumnHeaderCellMenuExists(assert, $ColumnB, false);
		assert.ok(oColumnSelectEventHandler.calledOnce, "The ColumnSelect event handler has been called once");
		assert.deepEqual(mActualParameters, mExpectedParameters,
			"The ColumnSelect event object contains the correct parameters");
		oColumnSelectEventHandler.reset();
		mActualParameters = null;

		oColumnA.setVisible(true);
		sap.ui.getCore().applyChanges();
		$ColumnA = oColumnA.$();

		// Open the context menu of column 1 on mobile.
		Device.system.desktop = false;

		// 1. The column header cell menu should be applied.
		TableUtils.Menu.openContextMenu(oTable, $ColumnA);
		this.assertColumnContextMenuOpen(assert, 0, false);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertColumnHeaderCellMenuExists(assert, $ColumnA, true);
		assert.ok(oColumnSelectEventHandler.notCalled, "The ColumnSelect event handler has not been called");
		oColumnSelectEventHandler.reset();
		mActualParameters = null;

		// 2. The column header cell menu should be closed and the context menu should be opened.
		TableUtils.Menu.openContextMenu(oTable, $ColumnA);
		this.assertColumnContextMenuOpen(assert, 0, true);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
		this.assertColumnHeaderCellMenuExists(assert, $ColumnA, false);
		assert.ok(oColumnSelectEventHandler.calledOnce, "The ColumnSelect event handler has not been called");

		/* Cell Context Menu */

		oTable.setEnableCellFilter(true);

		oColumnA.setFilterProperty("dummy");
		var oCellA = oTable.getRows()[0].getCells()[0];
		var $CellA = oCellA.$();

		oColumnB.setFilterProperty("dummy");
		var oCellB = oTable.getRows()[0].getCells()[1];
		var $CellB = oCellB.$();

		var oCellContextMenuEventHandler = this.spy(function(oEvent) {
			mActualParameters = oEvent.mParameters;
		});
		oTable.attachCellContextmenu(oCellContextMenuEventHandler);

		// Open the cell menu on the cell in column 1 row 1. Do not fire the CellContextMenu event.
		TableUtils.Menu.openContextMenu(oTable, $CellA[0], false, false);
		this.assertColumnContextMenuOpen(assert, 0, false);
		this.assertDataCellContextMenuOpen(assert, 0, 0, true);
		assert.ok(oCellContextMenuEventHandler.notCalled, "The CellContextMenu event handler has not been called");
		oCellContextMenuEventHandler.reset();
		mActualParameters = null;

		// Open the cell menu on the cell in column 2 row 1. Fire the CellContextMenu event.
		mExpectedParameters = {
			rowIndex: 0,
			columnIndex: 1,
			columnId: oColumnB.getId(),
			cellControl: oCellB,
			rowBindingContext: oTable.getRows()[0].getBindingContext(oTable.getBindingInfo("rows").model),
			cellDomRef: getCell(0, 1)[0],
			id: oTable.getId()
		};

		TableUtils.Menu.openContextMenu(oTable, $CellB, false, true);
		this.assertColumnContextMenuOpen(assert, 1, false);
		this.assertDataCellContextMenuOpen(assert, 0, 0, false);
		this.assertDataCellContextMenuOpen(assert, 0, 1, true);
		assert.ok(oCellContextMenuEventHandler.calledOnce, "The CellContextMenu event handler has been called once");
		assert.deepEqual(mActualParameters, mExpectedParameters,
			"The CellContextMenu event object contains the correct parameters");
		oCellContextMenuEventHandler.reset();
		mActualParameters = null;

		// Open the cell menu on the cell in column 1 row 1. Fire the CellContextMenu event and prevent execution of the default action.
		// The cell menu on column 1 row 1 should not open, and the cell menu on column 2 row 1 should stay open.
		mExpectedParameters = {
			rowIndex: 0,
			columnIndex: 0,
			columnId: oColumnA.getId(),
			cellControl: oCellA,
			rowBindingContext: oTable.getRows()[0].getBindingContext(oTable.getBindingInfo("rows").model),
			cellDomRef: getCell(0, 0)[0],
			id: oTable.getId()
		};

		oTable.attachEventOnce("cellContextmenu", function(oEvent) {
			oEvent.preventDefault();
		});

		TableUtils.Menu.openContextMenu(oTable, $CellA, false, true);
		this.assertColumnContextMenuOpen(assert, 0, false);
		this.assertDataCellContextMenuOpen(assert, 0, 0, false);
		this.assertDataCellContextMenuOpen(assert, 0, 1, true);
		assert.ok(oCellContextMenuEventHandler.calledOnce, "The CellContextMenu event handler has been called once");
		assert.deepEqual(mActualParameters, mExpectedParameters,
			"The CellContextMenu event object contains the correct parameters");
	});

	QUnit.test("openColumnContextMenu", function(assert) {
		var oColumnA = oTable.getColumns()[0];
		var oColumnB = oTable.getColumns()[1];

		// Invalid parameters: The column context menu will not be opened.
		this.assertAllColumnContextMenusClosed(assert);
		TableUtils.Menu.openColumnContextMenu();
		this.assertAllColumnContextMenusClosed(assert);
		TableUtils.Menu.openColumnContextMenu(oTable, -1);
		this.assertAllColumnContextMenusClosed(assert);
		TableUtils.Menu.openColumnContextMenu(oTable, oTable.columnCount);
		this.assertAllColumnContextMenusClosed(assert);

		// Column menu has no items: The context menu will not be opened.
		TableUtils.Menu.openColumnContextMenu(oTable, 0);
		this.assertColumnContextMenuOpen(assert, 0, false);

		oColumnA.setSortProperty("dummy");
		oColumnB.setSortProperty("dummy");

		// Column is not visible: The context menu will not be opened.
		oColumnA.setVisible(false);
		TableUtils.Menu.openColumnContextMenu(oTable, 0);
		this.assertColumnContextMenuOpen(assert, 0, false);
		oColumnA.setVisible(true);

		// Open the context menu of column 1.
		TableUtils.Menu.openColumnContextMenu(oTable, 0);
		this.assertColumnContextMenuOpen(assert, 0, true);
		this.assertFirstMenuItemHovered(assert, oColumnA.getMenu(), true);

		// Trying to open the context menu of column 1 again will leave it open.
		TableUtils.Menu.openColumnContextMenu(oTable, 0, true);
		this.assertColumnContextMenuOpen(assert, 0, true);
		this.assertFirstMenuItemHovered(assert, oColumnA.getMenu(), true);

		// Open the context menu of column 2. The context menu of column 1 will be closed.
		TableUtils.Menu.openColumnContextMenu(oTable, 1, true);
		this.assertColumnContextMenuOpen(assert, 0, false);
		this.assertColumnContextMenuOpen(assert, 1, true);
		this.assertFirstMenuItemHovered(assert, oColumnB.getMenu(), true);
	});

	QUnit.test("closeColumnContextMenu", function(assert) {
		// Open the column context menu.
		oTable.getColumns()[0].setSortProperty("dummy");
		TableUtils.Menu.openColumnContextMenu(oTable, 0);
		this.assertColumnContextMenuOpen(assert, 0, true);

		// Invalid parameters: Leave the context menu open.
		TableUtils.Menu.closeColumnContextMenu();
		this.assertColumnContextMenuOpen(assert, 0, true);

		TableUtils.Menu.closeColumnContextMenu(oTable);
		this.assertColumnContextMenuOpen(assert, 0, true);

		TableUtils.Menu.closeColumnContextMenu(oTable, -1);
		this.assertColumnContextMenuOpen(assert, 0, true);

		TableUtils.Menu.closeColumnContextMenu(oTable, oTable.columnCount);
		this.assertColumnContextMenuOpen(assert, 0, true);

		TableUtils.Menu.closeColumnContextMenu(oTable, 1);
		this.assertColumnContextMenuOpen(assert, 0, true);

		// Close the context menu.
		TableUtils.Menu.closeColumnContextMenu(oTable, 0);
		this.assertColumnContextMenuOpen(assert, 0, false);
	});

	QUnit.test("openDataCellContextMenu", function(assert) {
		oTable.setVisibleRowCount(iNumberOfRows + 1);
		sap.ui.getCore().applyChanges();

		// Invalid parameters: The cell context menu will not be created.
		assert.strictEqual(oTable._oCellContextMenu, undefined, "The menu is not yet created");
		TableUtils.Menu.openDataCellContextMenu();
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No parameters passed: The menu was not created");
		TableUtils.Menu.openDataCellContextMenu(oTable);
		assert.strictEqual(oTable._oCellContextMenu, undefined, "No column and row index parameters passed: The menu was not created");
		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(null));
		assert.strictEqual(oTable._oCellContextMenu, undefined, "Empty CellInfo: The menu was not created");

		var oColumnA = oTable.getColumns()[0];
		var oIsColumnAFilterableByMenu = this.stub(oColumnA, "isFilterableByMenu");

		// Column is not visible: The cell context menu will not be created.
		oColumnA.setVisible(false);
		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(getCell(0, 0)));
		assert.strictEqual(oTable._oCellContextMenu, undefined, "Column index pointing to an invisible column: The menu was not created");
		oColumnA.setVisible(true);

		// Cell filters are not enabled: The cell context menu will not be created.
		oTable.setEnableCellFilter(false);
		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(getCell(0, 0)));
		assert.strictEqual(oTable._oCellContextMenu, undefined, "Cell filters are not enabled: The menu was not created");
		oTable.setEnableCellFilter(true);

		// Column is not filterable by menu: The cell context menu will not be created.
		oIsColumnAFilterableByMenu.returns(false);
		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(getCell(0, 0)));
		assert.strictEqual(oTable._oCellContextMenu, undefined, "Column not filterable by menu: The menu was not created");
		oIsColumnAFilterableByMenu.returns(true);

		// Cell [0, 0]: The menu will be created and opened.
		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(getCell(0, 0)));
		assert.ok(oTable._oCellContextMenu != undefined, "The menu has been created");
		assert.strictEqual(oTable._oCellContextMenu.getItems().length, 1, "One menu item has been created");
		assert.strictEqual(oTable._oCellContextMenu.getItems()[0].mEventRegistry.select.length, 1,
			"One menu item select event handler has been attached");
		this.assertDataCellContextMenuOpen(assert, 0, 0, true);
		this.assertFirstMenuItemHovered(assert, oTable._oCellContextMenu, true);
		oTable._oCellContextMenu.__isOriginal = true;
		oTable._oCellContextMenu.getItems()[0].__isOriginal = true;
		oTable._oCellContextMenu.getItems()[0].mEventRegistry.select[0].fFunction.__isOriginal = true;

		// Cell [0, 0]: The menu will be closed.
		// Cell [1, 0]: The menu will be opened.
		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(getCell(1, 0)), true);
		this.assertDataCellContextMenuOpen(assert, 0, 0, false);
		this.assertDataCellContextMenuOpen(assert, 1, 0, true);
		this.assertFirstMenuItemHovered(assert, oTable._oCellContextMenu, true);
		assert.ok(oTable._oCellContextMenu.__isOriginal, "The menu has been reused");
		assert.ok(oTable._oCellContextMenu.getItems()[0].__isOriginal, "The menu item has been reused");
		assert.strictEqual(oTable._oCellContextMenu.getItems().length, 1, "There is still only one menu item");
		assert.ok(!oTable._oCellContextMenu.getItems()[0].mEventRegistry.select[0].fFunction.__isOriginal,
			"The menu item select event handler has been updated");
		assert.strictEqual(oTable._oCellContextMenu.getItems()[0].mEventRegistry.select.length, 1,
			"There is still only one menu item select event handler attached");

		// Cell [1, 0]: The menu will stay open.
		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(getCell(1, 0)), false);
		this.assertDataCellContextMenuOpen(assert, 1, 0, true);
		this.assertFirstMenuItemHovered(assert, oTable._oCellContextMenu, true);
		assert.ok(oTable._oCellContextMenu.__isOriginal, "The menu has been reused");
		assert.ok(oTable._oCellContextMenu.getItems()[0].__isOriginal, "The menu item has been reused");
		assert.strictEqual(oTable._oCellContextMenu.getItems().length, 1, "There is still only one menu item");
		assert.ok(!oTable._oCellContextMenu.getItems()[0].mEventRegistry.select[0].fFunction.__isOriginal,
			"The menu item select event handler has been updated");
		assert.strictEqual(oTable._oCellContextMenu.getItems()[0].mEventRegistry.select.length, 1,
			"There is still only one menu item select event handler attached");

		oColumnA.setVisible(false);
		sap.ui.getCore().applyChanges();

		var oColumnB = oTable.getColumns()[1];
		this.stub(oColumnB, "isFilterableByMenu").returns(true);

		// Cell [1, 0]: The menu will be closed.
		// Cell [2, 0]: The menu will be opened.
		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(getCell(0, 0)), true);
		this.assertDataCellContextMenuOpen(assert, 0, 0, true);
		this.assertDataCellContextMenuOpen(assert, 1, 0, false);
		this.assertFirstMenuItemHovered(assert, oTable._oCellContextMenu, true);
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
		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(getCell(0, 0)));

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

		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(getCell(0, 0)));
		this.assertDataCellContextMenuOpen(assert, 0, 0, true);

		TableUtils.Menu.closeDataCellContextMenu();
		this.assertDataCellContextMenuOpen(assert, 0, 0, true);

		TableUtils.Menu.closeDataCellContextMenu(oTable);
		this.assertDataCellContextMenuOpen(assert, 0, 0, false);
	});

	QUnit.test("cleanupDataCellContextMenu", function(assert) {
		var oColumn = oTable.getColumns()[0];
		this.stub(oColumn, "isFilterableByMenu").returns(true);

		oTable.setEnableCellFilter(true);

		assert.ok(!oTable._oCellContextMenu, "Context menu does not exist");

		TableUtils.Menu.openDataCellContextMenu(oTable, TableUtils.getCellInfo(getCell(0, 0)));
		this.assertDataCellContextMenuOpen(assert, 0, 0, true);

		TableUtils.Menu.closeDataCellContextMenu(oTable);
		this.assertDataCellContextMenuOpen(assert, 0, 0, false);

		assert.ok(!!oTable._oCellContextMenu, "Context menu exists");
		TableUtils.Menu.cleanupDataCellContextMenu();
		assert.ok(!!oTable._oCellContextMenu, "Context menu exists");
		TableUtils.Menu.cleanupDataCellContextMenu(oTable);
		assert.ok(!oTable._oCellContextMenu, "Context menu does not exist");
	});

	QUnit.test("applyColumnHeaderCellMenu", function(assert) {
		// Invalid parameters: No cell menu will be applied.
		TableUtils.Menu.applyColumnHeaderCellMenu();
		this.assertNoColumnHeaderCellMenusExists(assert);
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable);
		this.assertNoColumnHeaderCellMenusExists(assert);
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, -1);
		this.assertNoColumnHeaderCellMenusExists(assert);
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, oTable.columnCount);
		this.assertNoColumnHeaderCellMenusExists(assert);

		var oColumn = oTable.getColumns()[0];
		var $Column = oColumn.$();

		// Column is not visible: The cell menu will not be applied.
		oColumn.setVisible(false);
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 0);
		this.assertColumnHeaderCellMenuExists(assert, $Column, false);
		oColumn.setVisible(true);

		// Column is not resizable and has no menu items: The cell menu will not be applied.
		oColumn.setResizable(false);
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 0);
		this.assertColumnHeaderCellMenuExists(assert, $Column, false);
		oColumn.setResizable(true);

		// Column is resizable and has no menu items: A cell menu with a resize button will be applied.
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 0);
		this.assertColumnHeaderCellMenuExists(assert, $Column, true);
		this.assertColumnHeaderCellMenuButtonExists(assert, $Column, false);
		this.assertColumnHeaderCellResizeButtonExists(assert, $Column, true);

		oColumn = oTable.getColumns()[1];
		$Column = oColumn.$();

		// Column is not resizable and has menu items: A cell menu with a context menu button will be applied.
		oColumn.setResizable(false);
		this.stub(oColumn, "_menuHasItems").returns(true);
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 1);
		this.assertColumnHeaderCellMenuExists(assert, $Column, true);
		this.assertColumnHeaderCellMenuButtonExists(assert, $Column, true);
		this.assertColumnHeaderCellResizeButtonExists(assert, $Column, false);

		oColumn = oTable.getColumns()[2];
		$Column = oColumn.$();

		// Column is resizable and has menu items: A cell menu with a context menu and a resize button will be applied.
		this.stub(oColumn, "_menuHasItems").returns(true);
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 2);
		this.assertColumnHeaderCellMenuExists(assert, $Column, true);
		this.assertColumnHeaderCellMenuButtonExists(assert, $Column, true);
		this.assertColumnHeaderCellResizeButtonExists(assert, $Column, true);

		// Applying the cell menu to the same column header cell again.
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 2);
		this.assertColumnHeaderCellMenuExists(assert, $Column, true);
		this.assertColumnHeaderCellMenuButtonExists(assert, $Column, true);
		this.assertColumnHeaderCellResizeButtonExists(assert, $Column, true);

		// Applying the cell menu to another column header cell.
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 3);
		this.assertColumnHeaderCellMenuExists(assert, $Column, false);
		this.assertColumnHeaderCellMenuExists(assert, oTable.getColumns()[3].$(), true);
	});

	QUnit.test("removeColumnHeaderCellMenu", function(assert) {
		var $Column = getColumnHeader(0);

		// Apply the cell menu.
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 0);
		this.assertColumnHeaderCellMenuExists(assert, $Column, true);

		// Remove the cell menu.
		TableUtils.Menu.removeColumnHeaderCellMenu(oTable);
		this.assertColumnHeaderCellMenuExists(assert, $Column, false);

		// When a column header cell has no cell menu, removing the cell menu has no effect.
		TableUtils.Menu.removeColumnHeaderCellMenu(oTable);
		this.assertColumnHeaderCellMenuExists(assert, $Column, false);
	});

	QUnit.test("removeColumnHeaderCellMenu - On Focus Out", function(assert) {
		var spy = this.spy(TableUtils.Menu, "removeColumnHeaderCellMenu");
		var $Column = getColumnHeader(0, true, assert);

		this.assertColumnHeaderCellMenuExists(assert, $Column, false);

		// Apply the cell menu.
		TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 0);
		this.assertColumnHeaderCellMenuExists(assert, $Column, true);

		// When the column header cell looses the focus the cell menu should be removed.
		qutils.triggerEvent("focusout", $Column);
		assert.ok(spy.called, "removeColumnHeaderCellMenu was called when the column header cell has lost the focus");
		this.assertColumnHeaderCellMenuExists(assert, $Column, false);
	});

	QUnit.test("openDataCellContextMenu with contextMenu aggregation of the table", function(assert) {
		oTable.setContextMenu(new Menu({
			items: [
				new MenuItem({text: "ContextMenuItem"})
			]
		}));
		var fnOpenAsContextMenu = this.spy(oTable.getContextMenu(), "openAsContextMenu");

		var oCellInfo = TableUtils.getCellInfo(getCell(0, 0));
		var oEvent = {
			target: oCellInfo.cell
		};

		TableUtils.Menu.openDataCellContextMenu(oTable, oCellInfo, true, oEvent);
		assert.ok(fnOpenAsContextMenu.calledWith(oEvent, oCellInfo.cell), "sap.m.Menu.openAsContextMenu called with correct args");
	});
});