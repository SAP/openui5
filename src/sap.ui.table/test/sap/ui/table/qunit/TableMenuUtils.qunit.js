//************************************************************************
// Helper Functions
//************************************************************************

jQuery.sap.require("sap.ui.table.TableUtils");
var TableUtils = sap.ui.table.TableUtils;

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
	TableUtils.Menu.openContextMenu();
	this.assertAllColumnContextMenusClosed();
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertNoColumnHeaderCellMenusExists();

	TableUtils.Menu.openContextMenu(oTable);
	this.assertAllColumnContextMenusClosed();
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertNoColumnHeaderCellMenusExists();

	TableUtils.Menu.openContextMenu(oTable, getSelectAll());
	this.assertAllColumnContextMenusClosed();
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertNoColumnHeaderCellMenusExists();

	TableUtils.Menu.openContextMenu(oTable, getRowHeader(0));
	this.assertAllColumnContextMenusClosed();
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertNoColumnHeaderCellMenusExists();

	TableUtils.Menu.openContextMenu(oTable, document.getElementsByTagName("body").item(0));
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
	TableUtils.Menu.openContextMenu(oTable, $ColumnA[0], false, false);
	this.assertColumnContextMenuOpen(0, true);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertColumnHeaderCellMenuExists($ColumnA, false);
	assert.ok(oColumnSelectEvent.notCalled, "The ColumnSelect event has not been fired");

	// Open the context menu of column 2. Fire the column select event.
	mExpectedArguments = {
		column: oColumnB,
		id: oTable.getId()
	};

	TableUtils.Menu.openContextMenu(oTable, $ColumnB, false, true);
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
	TableUtils.Menu.openContextMenu(oTable, $ColumnA, false, true);
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
	TableUtils.Menu.openContextMenu(oTable, $ColumnA);
	this.assertColumnContextMenuOpen(0, false);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No data cell menu exists");
	this.assertColumnHeaderCellMenuExists($ColumnA, true);
	assert.ok(oColumnSelectEvent.notCalled, "The ColumnSelect event has not been fired");

	// 2. The column header cell menu should be closed and the context menu should be opened.
	oColumnSelectEvent.reset();
	TableUtils.Menu.openContextMenu(oTable, $ColumnA);
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
	TableUtils.Menu.openContextMenu(oTable, $CellA[0], false, false);
	this.assertColumnContextMenuOpen(0, false);
	this.assertDataCellContextMenuOpen(0, 0, true);
	assert.ok(oCellContextMenuEvent.notCalled, "The CellContextMenu event has not been fired");

	// Open the cell menu on the cell in column 2 row 1. Fire the CellContextMenu event.
	oCellContextMenuEvent.reset();
	TableUtils.Menu.openContextMenu(oTable, $CellB, false, true);
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
	TableUtils.Menu.openContextMenu(oTable, $CellA, false, true);
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
	TableUtils.Menu.openColumnContextMenu();
	this.assertAllColumnContextMenusClosed();
	TableUtils.Menu.openColumnContextMenu(oTable, -1);
	this.assertAllColumnContextMenusClosed();
	TableUtils.Menu.openColumnContextMenu(oTable, iNumberOfCols);
	this.assertAllColumnContextMenusClosed();

	// Column menu has no items: The context menu will not be opened.
	TableUtils.Menu.openColumnContextMenu(oTable, 0);
	this.assertColumnContextMenuOpen(0, false);

	oColumnA.setSortProperty("dummy");
	oColumnB.setSortProperty("dummy");

	// Column is not visible: The context menu will not be opened.
	oColumnA.setVisible(false);
	TableUtils.Menu.openColumnContextMenu(oTable, 0);
	this.assertColumnContextMenuOpen(0, false);
	oColumnA.setVisible(true);

	// Open the context menu of column 1.
	TableUtils.Menu.openColumnContextMenu(oTable, 0);
	this.assertColumnContextMenuOpen(0, true);
	this.assertFirstMenuItemHovered(oColumnA.getMenu(), false);

	// Trying to open the context menu of column 1 again will leave it open.
	TableUtils.Menu.openColumnContextMenu(oTable, 0, true);
	this.assertColumnContextMenuOpen(0, true);
	this.assertFirstMenuItemHovered(oColumnA.getMenu(), false);

	// Open the context menu of column 2. The context menu of column 1 will be closed.
	TableUtils.Menu.openColumnContextMenu(oTable, 1, true);
	this.assertColumnContextMenuOpen(0, false);
	this.assertColumnContextMenuOpen(1, true);
	this.assertFirstMenuItemHovered(oColumnB.getMenu(), true);
});

QUnit.test("closeColumnContextMenu", function(assert) {
	// Open the column context menu.
	oTable.getColumns()[0].setSortProperty("dummy");
	TableUtils.Menu.openColumnContextMenu(oTable, 0);
	this.assertColumnContextMenuOpen(0, true);

	// Invalid parameters: Leave the context menu open.
	TableUtils.Menu.closeColumnContextMenu();
	this.assertColumnContextMenuOpen(0, true);

	TableUtils.Menu.closeColumnContextMenu(oTable);
	this.assertColumnContextMenuOpen(0, true);

	TableUtils.Menu.closeColumnContextMenu(oTable, -1);
	this.assertColumnContextMenuOpen(0, true);

	TableUtils.Menu.closeColumnContextMenu(oTable, iNumberOfCols);
	this.assertColumnContextMenuOpen(0, true);

	TableUtils.Menu.closeColumnContextMenu(oTable, 1);
	this.assertColumnContextMenuOpen(0, true);

	// Close the context menu.
	TableUtils.Menu.closeColumnContextMenu(oTable, 0);
	this.assertColumnContextMenuOpen(0, false);
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
	TableUtils.Menu.openDataCellContextMenu(oTable, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "No row index parameter passed: The menu was not created");
	TableUtils.Menu.openDataCellContextMenu(oTable, -1, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Column index out of lower bound: The menu was not created");
	TableUtils.Menu.openDataCellContextMenu(oTable, iNumberOfCols, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Column index out of upper bound: The menu was not created");
	TableUtils.Menu.openDataCellContextMenu(oTable, 0, -1);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Row index out of lower bound: The menu was not created");
	TableUtils.Menu.openDataCellContextMenu(oTable, 0, iNumberOfRows + 1);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Row index out of upper bound: The menu was not created");
	TableUtils.Menu.openDataCellContextMenu(oTable, 0, iNumberOfRows);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Row index pointing to an empty row: The menu was not created");

	var oColumnA = oTable.getColumns()[0];
	var oIsColumnAFilterableByMenu = this.stub(oColumnA, "isFilterableByMenu");

	// Column is not visible: The cell context menu will not be created.
	oColumnA.setVisible(false);
	TableUtils.Menu.openDataCellContextMenu(oTable, 0, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Column index pointing to an invisible column: The menu was not created");
	oColumnA.setVisible(true);

	// Cell filters are not enabled: The cell context menu will not be created.
	oTable.setEnableCellFilter(false);
	TableUtils.Menu.openDataCellContextMenu(oTable, 0, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Cell filters are not enabled: The menu was not created");
	oTable.setEnableCellFilter(true);

	// Column is not filterable by menu: The cell context menu will not be created.
	oIsColumnAFilterableByMenu.returns(false);
	TableUtils.Menu.openDataCellContextMenu(oTable, 0, 0);
	assert.strictEqual(oTable._oCellContextMenu, undefined, "Column not filterable by menu: The menu was not created");
	oIsColumnAFilterableByMenu.returns(true);

	// Cell [0, 0]: The menu will be created and opened.
	TableUtils.Menu.openDataCellContextMenu(oTable, 0, 0);
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
	TableUtils.Menu.openDataCellContextMenu(oTable, 1, 0, true);
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
	TableUtils.Menu.openDataCellContextMenu(oTable, 1, 0, false);
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
	TableUtils.Menu.openDataCellContextMenu(oTable, 0, 0);

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

	TableUtils.Menu.openDataCellContextMenu(oTable, 0, 0);
	this.assertDataCellContextMenuOpen(0, 0, true);

	TableUtils.Menu.closeDataCellContextMenu();
	this.assertDataCellContextMenuOpen(0, 0, true);

	TableUtils.Menu.closeDataCellContextMenu(oTable);
	this.assertDataCellContextMenuOpen(0, 0, false);
});

QUnit.test("cleanupDataCellContextMenu", function(assert) {
	var oColumn = oTable.getColumns()[0];
	this.stub(oColumn, "isFilterableByMenu").returns(true);

	oTable.setEnableCellFilter(true);

	assert.ok(!oTable._oCellContextMenu, "Context menu does not exist");

	TableUtils.Menu.openDataCellContextMenu(oTable, 0, 0);
	this.assertDataCellContextMenuOpen(0, 0, true);

	TableUtils.Menu.closeDataCellContextMenu(oTable);
	this.assertDataCellContextMenuOpen(0, 0, false);

	assert.ok(!!oTable._oCellContextMenu, "Context menu exists");
	TableUtils.Menu.cleanupDataCellContextMenu();
	assert.ok(!!oTable._oCellContextMenu, "Context menu exists");
	TableUtils.Menu.cleanupDataCellContextMenu(oTable);
	assert.ok(!oTable._oCellContextMenu, "Context menu does not exist");
});

QUnit.test("applyColumnHeaderCellMenu", function(assert) {
	// Invalid parameters: No cell menu will be applied.
	TableUtils.Menu.applyColumnHeaderCellMenu();
	this.assertNoColumnHeaderCellMenusExists();
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable);
	this.assertNoColumnHeaderCellMenusExists();
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable, -1);
	this.assertNoColumnHeaderCellMenusExists();
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable, iNumberOfCols);
	this.assertNoColumnHeaderCellMenusExists();

	var oColumn = oTable.getColumns()[0];
	var $Column = oColumn.$();

	// Column is not visible: The cell menu will not be applied.
	oColumn.setVisible(false);
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, false);
	oColumn.setVisible(true);

	// Column is not resizable and has no menu items: The cell menu will not be applied.
	oColumn.setResizable(false);
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, false);
	oColumn.setResizable(true);

	// Column is resizable and has no menu items: A cell menu with a resize button will be applied.
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, true);
	this.assertColumnHeaderCellMenuButtonExists($Column, false);
	this.assertColumnHeaderCellResizeButtonExists($Column, true);

	oColumn = oTable.getColumns()[1];
	$Column = oColumn.$();

	// Column is not resizable and has menu items: A cell menu with a context menu button will be applied.
	oColumn.setResizable(false);
	this.stub(oColumn, "_menuHasItems").returns(true);
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 1);
	this.assertColumnHeaderCellMenuExists($Column, true);
	this.assertColumnHeaderCellMenuButtonExists($Column, true);
	this.assertColumnHeaderCellResizeButtonExists($Column, false);

	oColumn = oTable.getColumns()[2];
	$Column = oColumn.$();

	// Column is resizable and has menu items: A cell menu with a context menu and a resize button will be applied.
	this.stub(oColumn, "_menuHasItems").returns(true);
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 2);
	this.assertColumnHeaderCellMenuExists($Column, true);
	this.assertColumnHeaderCellMenuButtonExists($Column, true);
	this.assertColumnHeaderCellResizeButtonExists($Column, true);

	// Applying the cell menu to the same column header cell again.
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 2);
	this.assertColumnHeaderCellMenuExists($Column, true);
	this.assertColumnHeaderCellMenuButtonExists($Column, true);
	this.assertColumnHeaderCellResizeButtonExists($Column, true);
});

QUnit.test("removeColumnHeaderCellMenu", function(assert) {
	var $Column = getColumnHeader(0);

	// Apply the cell menu.
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, true);

	// Invalid parameters: The cell menu will not be removed.
	TableUtils.Menu.removeColumnHeaderCellMenu();
	this.assertColumnHeaderCellMenuExists($Column, true);
	TableUtils.Menu.removeColumnHeaderCellMenu(oTable);
	this.assertColumnHeaderCellMenuExists($Column, true);
	TableUtils.Menu.removeColumnHeaderCellMenu(oTable, -1);
	this.assertColumnHeaderCellMenuExists($Column, true);
	TableUtils.Menu.removeColumnHeaderCellMenu(oTable, iNumberOfCols);
	this.assertColumnHeaderCellMenuExists($Column, true);

	// Remove the cell menu.
	TableUtils.Menu.removeColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, false);

	// When a column header cell has no cell menu, removing the cell menu has no effect.
	TableUtils.Menu.removeColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, false);
});

QUnit.test("removeColumnHeaderCellMenu - On Focus Out", function(assert) {
	var spy = this.spy(TableUtils.Menu, "removeColumnHeaderCellMenu");
	var $Column = getColumnHeader(0, true, assert);

	this.assertColumnHeaderCellMenuExists($Column, false);

	// Apply the cell menu.
	TableUtils.Menu.applyColumnHeaderCellMenu(oTable, 0);
	this.assertColumnHeaderCellMenuExists($Column, true);

	// When the column header cell looses the focus the cell menu should be removed.
	qutils.triggerEvent("focusout", $Column);
	assert.ok(spy.called, "removeColumnHeaderCellMenu was called when the column header cell has lost the focus");
	this.assertColumnHeaderCellMenuExists($Column, false);
});