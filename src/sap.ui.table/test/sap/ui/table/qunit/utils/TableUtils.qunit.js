/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Table",
	"sap/ui/table/CreationRow",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/library",
	"sap/ui/table/RowSettings",
	"sap/ui/core/Control",
	"sap/ui/core/Theming",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/core/message/MessageType",
	"sap/ui/base/Object",
	"sap/base/i18n/ResourceBundle",
	"sap/base/i18n/Localization",
	"sap/ui/thirdparty/jquery",
	// provides jQuery custom selectors ":sapTabbable", ":sapFocusable"
	"sap/ui/dom/jquery/Selectors"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	TableUtils,
	Table,
	CreationRow,
	FixedRowMode,
	TableLibrary,
	RowSettings,
	Control,
	Theming,
	InvisibleMessage,
	MessageType,
	BaseObject,
	ResourceBundle,
	Localization,
	jQuery
) {
	"use strict";

	const SelectionMode = TableLibrary.SelectionMode;
	const createTables = window.createTables;
	const destroyTables = window.destroyTables;
	const getCell = window.getCell;
	const getColumnHeader = window.getColumnHeader;
	const getRowHeader = window.getRowHeader;
	const getRowAction = window.getRowAction;
	const getSelectAll = window.getSelectAll;
	const iNumberOfRows = window.iNumberOfRows;
	const TestControl = TableQUnitUtils.TestControl;
	const TestInputControl = TableQUnitUtils.TestInputControl;

	QUnit.module("TableUtils", {
		beforeEach: async function() {
			await createTables();
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

	QUnit.test("isRowSelectionAllowed", async function(assert) {
		async function check(sSelectionBehavior, sSelectionMode, bGroup, bExpected) {
			oTreeTable.setSelectionBehavior(sSelectionBehavior);
			oTreeTable.setSelectionMode(sSelectionMode);
			oTreeTable.setUseGroupMode(bGroup);
			await nextUIUpdate();

			const bRes = TableUtils.isRowSelectionAllowed(oTreeTable);
			assert.ok(bRes && bExpected || !bRes && !bExpected,
				"isRowSelectionAllowed: " + sSelectionBehavior + ", " + sSelectionMode + ", Group: " + bGroup);
		}

		await check("RowSelector", "MultiToggle", false, false);
		await check("Row", "MultiToggle", false, true);
		await check("RowOnly", "MultiToggle", false, true);
		await check("RowSelector", "Single", false, false);
		await check("Row", "Single", false, true);
		await check("RowOnly", "Single", false, true);
		await check("RowSelector", "None", false, false);
		await check("Row", "None", false, false);
		await check("RowOnly", "None", false, false);
		await check("RowSelector", "MultiToggle", true, false);
		await check("Row", "MultiToggle", true, true);
		await check("RowOnly", "MultiToggle", true, true);
		await check("RowSelector", "Single", true, false);
		await check("Row", "Single", true, true);
		await check("RowOnly", "Single", true, true);
		await check("RowSelector", "None", true, false);
		await check("Row", "None", true, false);
		await check("RowOnly", "None", true, false);
	});

	QUnit.test("isRowSelectorSelectionAllowed", async function(assert) {
		async function check(sSelectionBehavior, sSelectionMode, bGroup, bExpected) {
			oTreeTable.setSelectionBehavior(sSelectionBehavior);
			oTreeTable.setSelectionMode(sSelectionMode);
			oTreeTable.setUseGroupMode(bGroup);
			await nextUIUpdate();

			const bRes = TableUtils.isRowSelectorSelectionAllowed(oTreeTable);
			assert.ok(bRes && bExpected || !bRes && !bExpected,
				"isRowSelectorSelectionAllowed: " + sSelectionBehavior + ", " + sSelectionMode + ", Group: " + bGroup);
		}

		await check("RowSelector", "MultiToggle", false, true);
		await check("Row", "MultiToggle", false, true);
		await check("RowOnly", "MultiToggle", false, false);
		await check("RowSelector", "Single", false, true);
		await check("Row", "Single", false, true);
		await check("RowOnly", "Single", false, false);
		await check("RowSelector", "None", false, false);
		await check("Row", "None", false, false);
		await check("RowOnly", "None", false, false);
		await check("RowSelector", "MultiToggle", true, true);
		await check("Row", "MultiToggle", true, true);
		await check("RowOnly", "MultiToggle", true, true);
		await check("RowSelector", "Single", true, true);
		await check("Row", "Single", true, true);
		await check("RowOnly", "Single", true, true);
		await check("RowSelector", "None", true, false);
		await check("Row", "None", true, false);
		await check("RowOnly", "None", true, false);
	});

	QUnit.test("hasRowActions", function(assert) {
		assert.ok(!TableUtils.hasRowActions(), "No table passed: Returned false");
		assert.ok(!TableUtils.hasRowActions(oTable), "Table has no row actions");

		oTable.setRowActionCount(2);
		assert.ok(!TableUtils.hasRowActions(oTable), "Table has still no row actions");

		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		assert.ok(TableUtils.hasRowActions(oTable), "Table has row actions");
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

		oTable.getRowMode().setFixedTopRowCount(1);
		assert.ok(!TableUtils.isVariableRowHeightEnabled(oTable), "VariableRowHeight is disabled when fixed top rows are available.");
		oTable.getRowMode().setFixedTopRowCount(0);
		oTable.getRowMode().setFixedBottomRowCount(1);
		assert.ok(!TableUtils.isVariableRowHeightEnabled(oTable), "VariableRowHeight is disabled when fixed bottom rows are available.");
	});

	QUnit.test("getCellInfo", async function(assert) {
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		oTable.getColumns()[1].setVisible(false);
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_1_1"}));
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_2"}));
		oTable.getColumns()[2].setHeaderSpan(2);
		oTable.getColumns()[0].setCreationTemplate(new TestInputControl());
		oTable.setCreationRow(new CreationRow());
		await nextUIUpdate();

		/* Data Cells */

		let oCell = getCell(0, 0);
		let oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.cell, oCell.get(0), "Data Cell: Correct cell object returned");
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
		assert.strictEqual(oInfo.cell, oCell.get(0), "Column Header Cell: Correct cell object returned");
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

		oCell = document.getElementById(getColumnHeader(2).attr("id") + "_1");
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.rowIndex, 1, "Row Index: 1");
		assert.strictEqual(oInfo.columnIndex, 3, "Column Index: 3");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");

		/* Row Header Cells */

		oCell = getRowHeader(0);
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.cell, oCell.get(0), "Row Header Cell: Correct cell object returned");
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
		assert.strictEqual(oInfo.cell, oCell.get(0), "Row Action Cell: Correct cell object returned");
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
		assert.strictEqual(oInfo.cell, oCell.get(0), "SelectAll Cell: Correct cell object returned");
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

		/* Pseudo Cells */

		oCell = oTable.getCreationRow()._getCellDomRef(0);
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.cell, oCell.get(0), "Creation Row Pseudo Cell: Correct cell object returned");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.DATACELL), "Is not DATACELL");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER), "Is not COLUMNHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ROWHEADER), "Is not ROWHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ROWACTION), "Is not ROWACTION");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.COLUMNROWHEADER), "Is not COLUMNROWHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYCONTENTCELL), "Is not ANYCONTENTCELL");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYCOLUMNHEADER), "Is not ANYCOLUMNHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANYROWHEADER), "Is not ANYROWHEADER");
		assert.ok(!oInfo.isOfType(TableUtils.CELLTYPE.ANY), "Is not ANY");
		assert.ok(oInfo.isOfType(TableUtils.CELLTYPE.PSEUDO), "Is PSEUDO");
		assert.strictEqual(oInfo.rowIndex, -1, "Row Index: -1");
		assert.strictEqual(oInfo.columnIndex, 0, "Column Index: 0");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");

		/* Not a table cell */

		const oDefaultInfo = {
			type: 0,
			cell: null,
			rowIndex: null,
			columnIndex: null,
			columnSpan: null
		};

		oInfo = TableUtils.getCellInfo(null);
		delete oInfo.isOfType;
		assert.deepEqual(oInfo, oDefaultInfo, "Passed null as parameter -> Returned the info object with default values");

		oInfo = TableUtils.getCellInfo(document.getElementById("outerelement"));
		delete oInfo.isOfType;
		assert.deepEqual(oInfo, oDefaultInfo, "Passed a dom element which is no table cell -> Returned the info object with default values");

		/* Cell of a destroyed column before rerendering */

		oCell = getCell(0, 0);
		oTable.getColumns()[0].destroy();
		oInfo = TableUtils.getCellInfo(oCell);
		assert.strictEqual(oInfo.rowIndex, 0, "Row Index: 0");
		assert.strictEqual(oInfo.columnIndex, -1, "Column Index: -1");
		assert.strictEqual(oInfo.columnSpan, 1, "Span Length: 1");
	});

	QUnit.test("hasRowHeader", async function(assert) {
		assert.ok(TableUtils.hasRowHeader(oTable), "Table has row header in selectionMode 'MultiToggle'");

		oTable.setSelectionMode(SelectionMode.None);
		await nextUIUpdate();
		assert.ok(!TableUtils.hasRowHeader(oTable), "Table has row header in selectionMode 'None'");

		oTable.setSelectionMode(SelectionMode.MultiToggle);
		oTable.setSelectionBehavior(TableLibrary.SelectionBehavior.RowOnly);
		await nextUIUpdate();
		assert.ok(!TableUtils.hasRowHeader(oTable), "Table has row header in selectionBehavior 'RowOnly'");
	});

	QUnit.test("hasSelectAll", function(assert) {
		function test(bEnableSelectAll, sSelectionMode, bShouldHaveSelectAll) {
			oTable.setEnableSelectAll(bEnableSelectAll);
			oTable.setSelectionMode(sSelectionMode);
			assert.strictEqual(TableUtils.hasSelectAll(oTable), bShouldHaveSelectAll,
				"The table does " + (bShouldHaveSelectAll ? "" : "not ") + "have a SelectAll checkbox"
			);
		}

		assert.ok(!TableUtils.hasSelectAll(), "Returned false: No parameter passed");
		test(false, SelectionMode.None, false);
		test(false, SelectionMode.Single, false);
		test(false, SelectionMode.MultiToggle, false);
		test(true, SelectionMode.None, false);
		test(true, SelectionMode.Single, false);
		test(true, SelectionMode.MultiToggle, true);
	});

	QUnit.test("hasRowHighlights", function(assert) {
		assert.ok(!TableUtils.hasRowHighlights(), "No table instance passed: Returned false");

		oTable.setRowSettingsTemplate(null);
		assert.ok(!TableUtils.hasRowHighlights(oTable), "No row settings configured: Returned false");

		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: null
		}));
		assert.ok(!TableUtils.hasRowHighlights(oTable), "No row highlight configured: Returned false");

		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: MessageType.None
		}));
		assert.ok(!TableUtils.hasRowHighlights(oTable), "Row highlight is set to 'None': Returned false");

		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: MessageType.Success
		}));
		assert.ok(TableUtils.hasRowHighlights(oTable), "Row highlight is set to 'Success': Returned true");

		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: MessageType.Warning
		}));
		assert.ok(TableUtils.hasRowHighlights(oTable), "Row highlight is set to 'Warning': Returned true");

		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: MessageType.Error
		}));
		assert.ok(TableUtils.hasRowHighlights(oTable), "Row highlight is set to 'Error': Returned true");

		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: MessageType.Information
		}));
		assert.ok(TableUtils.hasRowHighlights(oTable), "Row highlight is set to 'Information': Returned true");

		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: "{bindingPath}"
		}));
		assert.ok(TableUtils.hasRowHighlights(oTable), "Row highlight is bound: Returned true");
	});

	QUnit.test("hasRowNavigationIndicators", function(assert) {
		assert.ok(!TableUtils.hasRowNavigationIndicators(), "No table instance passed: Returned false");

		oTable.setRowSettingsTemplate(null);
		assert.ok(!TableUtils.hasRowNavigationIndicators(oTable), "No row settings configured: Returned false");

		oTable.setRowSettingsTemplate(new RowSettings({
			navigated: null
		}));
		assert.ok(!TableUtils.hasRowNavigationIndicators(oTable), "No row navigated configured: Returned false");

		oTable.setRowSettingsTemplate(new RowSettings({
			navigated: false
		}));
		assert.ok(!TableUtils.hasRowNavigationIndicators(oTable), "Returned false");

		oTable.setRowSettingsTemplate(new RowSettings({
			navigated: true
		}));
		assert.ok(TableUtils.hasRowNavigationIndicators(oTable), "Returned true");

		oTable.setRowSettingsTemplate(new RowSettings({
			navigated: "{bindingPath}"
		}));
		assert.ok(TableUtils.hasRowNavigationIndicators(oTable), "Row navigated is bound: Returned true");
	});

	QUnit.test("getVisibleColumnCount", async function(assert) {
		assert.equal(TableUtils.getVisibleColumnCount(oTable), oTable.columnCount, "All columns visible");

		oTable.getColumns()[1].setVisible(false);
		await nextUIUpdate();

		assert.equal(TableUtils.getVisibleColumnCount(oTable), oTable.columnCount - 1, "1 column hidden");
	});

	QUnit.test("getHeaderRowCount", async function(assert) {
		assert.equal(TableUtils.getHeaderRowCount(oTable), 1, "Initial Number of header rows");
		oTable.setColumnHeaderVisible(false);
		await nextUIUpdate();
		assert.equal(TableUtils.getHeaderRowCount(oTable), 0, "Headers hidden");
		oTable.setColumnHeaderVisible(true);
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		oTable.getColumns()[1].setHeaderSpan([2, 1]);
		await nextUIUpdate();
		assert.equal(TableUtils.getHeaderRowCount(oTable), 2, "Multiline Headers");
		oTable.setColumnHeaderVisible(false);
		await nextUIUpdate();
		assert.equal(TableUtils.getHeaderRowCount(oTable), 0, "Multiline Headers hidden");
	});

	QUnit.test("getNonEmptyRowCount", function(assert) {
		const oTableDummy1 = {
			_getRowCounts: function() {
				return {
					count: 10
				};
			},
			_getTotalRowCount: function() {
				return 5;
			}
		};
		const oTableDummy2 = {
			_getRowCounts: function() {
				return {
					count: 10
				};
			},
			_getTotalRowCount: function() {
				return 15;
			}
		};
		const oTableDummy3 = {
			_getRowCounts: function() {
				return {
					count: 10
				};
			},
			_getTotalRowCount: function() {
				return 10;
			}
		};
		assert.equal(TableUtils.getNonEmptyRowCount(oTableDummy1), oTableDummy1._getTotalRowCount(),
			"Number of data rows (#data < #visiblerows)");
		assert.equal(TableUtils.getNonEmptyRowCount(oTableDummy2), oTableDummy2._getRowCounts().count,
			"Number of visible rows (#data > #visiblerows)");
		assert.equal(TableUtils.getNonEmptyRowCount(oTableDummy3), oTableDummy3._getRowCounts().count,
			"Number of visible and data rows (#data = #visiblerows)");
	});

	QUnit.test("toggleRowSelection", async function(assert) {
		let iCallbackIndex = -1;
		const fnSelectionCallback = function(oRow) {
			iCallbackIndex = oRow.getIndex();
		};

		async function testLocal(vRowIndicator) {
			let iRowIndex = 0;

			oTable.clearSelection();
			oTable.setSelectionBehavior(TableLibrary.SelectionBehavior.Row);
			await nextUIUpdate();

			if (vRowIndicator === parseInt(vRowIndicator)) {
				iRowIndex = vRowIndicator;
			} else if (TableUtils.isA(vRowIndicator, "sap.ui.table.Row")) {
				iRowIndex = vRowIndicator.getIndex();
			}

			assert.ok(!oTable.isIndexSelected(iRowIndex), "Row not selected");
			TableUtils.toggleRowSelection(oTable, vRowIndicator); // Toggle
			assert.ok(oTable.isIndexSelected(iRowIndex), "Row selected");
			TableUtils.toggleRowSelection(oTable, vRowIndicator, true); // Select
			assert.ok(oTable.isIndexSelected(iRowIndex), "Row selected");
			TableUtils.toggleRowSelection(oTable, vRowIndicator); // Toggle
			assert.ok(!oTable.isIndexSelected(iRowIndex), "Row not selected");
			TableUtils.toggleRowSelection(oTable, vRowIndicator, false); // Deselect
			assert.ok(!oTable.isIndexSelected(iRowIndex), "Row not selected");
			TableUtils.toggleRowSelection(oTable, vRowIndicator, true); // Select
			assert.ok(oTable.isIndexSelected(iRowIndex), "Row selected");
			TableUtils.toggleRowSelection(oTable, vRowIndicator, false); // Deselect
			assert.ok(!oTable.isIndexSelected(iRowIndex), "Row not selected");

			iCallbackIndex = -1;
			TableUtils.toggleRowSelection(oTable, vRowIndicator, null, fnSelectionCallback); // Callback
			assert.strictEqual(iCallbackIndex, iRowIndex, "Callback called");
			assert.ok(!oTable.isIndexSelected(iRowIndex), "Row not selected");
		}

		// Test by passing a cell as the row indicator.
		await testLocal(getRowHeader(0));
		await testLocal(getCell(0, 0));

		// If row selection is not allowed on data cells the selection state should not change.
		oTable.setSelectionBehavior(TableLibrary.SelectionBehavior.RowSelector);
		await nextUIUpdate();

		const oElem = getCell(0, 0);
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
		await testLocal(0);
		await testLocal(2);

		// Test by passing a row instance as the row indicator.
		await testLocal(oTable.getRows()[0]);
		await testLocal(oTable.getRows()[2]);
	});

	QUnit.test("getRowColCell", async function(assert) {
		oTable.getColumns()[2].setVisible(false);
		await nextUIUpdate();

		let oInfo = TableUtils.getRowColCell(oTable, 0, 0, false);
		assert.strictEqual(oInfo.row, oTable.getRows()[0], "Row 1");
		assert.strictEqual(oInfo.column, oTable.getColumns()[0], "Column 1");
		assert.strictEqual(oInfo.cell, oInfo.row.getCells()[0], "Cell 1,1");
		assert.strictEqual(oInfo.cell.getText(), "A1", "Cell 1,1");

		oInfo = TableUtils.getRowColCell(oTable, 1, 1, false);
		assert.strictEqual(oInfo.row, oTable.getRows()[1], "Row 2");
		assert.strictEqual(oInfo.column, oTable.getColumns()[1], "Column 2");
		assert.strictEqual(oInfo.cell, oInfo.row.getCells()[1], "Cell 2,2");
		assert.strictEqual(oInfo.cell.getText(), "B2", "Cell 2,2");

		oInfo = TableUtils.getRowColCell(oTable, 2, 2, false);
		assert.strictEqual(oInfo.row, oTable.getRows()[2], "Row 3");
		assert.strictEqual(oInfo.column, oTable.getColumns()[3], "Column 4 (Column 3 is invisible)");
		assert.strictEqual(oInfo.cell, oInfo.row.getCells()[2], "Cell 3,3");
		assert.strictEqual(oInfo.cell.getText(), "D3", "Cell 3,3");

		oInfo = TableUtils.getRowColCell(oTable, 1, 1, true);
		assert.strictEqual(oInfo.row, oTable.getRows()[1], "Row 2");
		assert.strictEqual(oInfo.column, oTable.getColumns()[1], "Column 2");
		assert.strictEqual(oInfo.cell, oInfo.row.getCells()[1], "Cell 2,2");
		assert.strictEqual(oInfo.cell.getText(), "B2", "Cell 2,2");

		oInfo = TableUtils.getRowColCell(oTable, 2, 2, true);
		assert.strictEqual(oInfo.row, oTable.getRows()[2], "Row 3");
		assert.strictEqual(oInfo.column, oTable.getColumns()[2], "Column 3");
		assert.ok(!oInfo.cell, "Cell 3,3");

		oInfo = TableUtils.getRowColCell(oTable, 2, 3, true);
		assert.strictEqual(oInfo.row, oTable.getRows()[2], "Row 3");
		assert.strictEqual(oInfo.column, oTable.getColumns()[3], "Column 4 (Column 3 is invisible)");
		assert.strictEqual(oInfo.cell, oInfo.row.getCells()[2], "Cell 3,3");
		assert.strictEqual(oInfo.cell.getText(), "D3", "Cell 3,3");

		oInfo = TableUtils.getRowColCell(oTable, -1, -1, true);
		assert.strictEqual(oInfo.row, null, "Row not found");
		assert.strictEqual(oInfo.column, null, "Column not found");
		assert.strictEqual(oInfo.cell, null, "Cell not found");

		oInfo = TableUtils.getRowColCell(oTable, -1, -1, false);
		assert.strictEqual(oInfo.row, null, "Row not found");
		assert.strictEqual(oInfo.column, null, "Column not found");
		assert.strictEqual(oInfo.cell, null, "Cell not found");

		oInfo = TableUtils.getRowColCell(oTable, oTable.getRows().length, oTable.getColumns().length, true);
		assert.strictEqual(oInfo.row, null, "Row not found");
		assert.strictEqual(oInfo.column, null, "Column not found");
		assert.strictEqual(oInfo.cell, null, "Cell not found");

		oInfo = TableUtils.getRowColCell(oTable, oTable.getRows().length, oTable._getVisibleColumns().length, false);
		assert.strictEqual(oInfo.row, null, "Row not found");
		assert.strictEqual(oInfo.column, null, "Column not found");
		assert.strictEqual(oInfo.cell, null, "Cell not found");
	});

	QUnit.test("getFirstFixedBottomRowIndex", async function(assert) {
		async function initTest(iFixedBottomCount, iRowCount) {
			oTable.setRowMode(new FixedRowMode({
				rowCount: iRowCount,
				fixedBottomRowCount: iFixedBottomCount
			}));
			await nextUIUpdate();
		}

		await initTest(0, iNumberOfRows - 3);
		assert.equal(TableUtils.getFirstFixedBottomRowIndex(oTable), -1, "No fixed buttom rows");

		let iVisibleRows;
		const iFixedBottomRows = 2;

		for (let i = 0; i < 10; i++) {
			iVisibleRows = iNumberOfRows - 3 + i;
			await initTest(iFixedBottomRows, iVisibleRows);

			if (i <= 3) {
				assert.equal(TableUtils.getFirstFixedBottomRowIndex(oTable), iVisibleRows - iFixedBottomRows,
					"Fixed buttom rows, row count=" + iVisibleRows);
			} else {
				assert.equal(TableUtils.getFirstFixedBottomRowIndex(oTable), iNumberOfRows - iFixedBottomRows,
					"Fixed buttom rows, row count=" + iVisibleRows);
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
		let oCell = getCell(1, 1);
		TableUtils.focusItem(oTable, 14 /*SelectAll + 5 Headers + 1st Row (Rowselector + 5 cells) + 2nd row (Rowselector + 2 cells)*/);
		assert.ok(oCell.get(0) !== document.activeElement, "Focus not set becuase item navigation not yet initialized");
		getCell(0, 0, true);
		TableUtils.focusItem(oTable, 14 /*SelectAll + 5 Headers + 1st Row (Rowselector + 5 cells) + 2nd row (Rowselector + 2 cells)*/);
		oCell = getCell(1, 1);
		assert.ok(oCell.get(0) === document.activeElement, "Focus set");
	});

	QUnit.test("scrollTableToIndex", function(assert) {
		const oRowsUpdatedSpy = sinon.spy();
		oTable.attachRowsUpdated(oRowsUpdatedSpy);

		return TableUtils.scrollTableToIndex(oTable, 5, false).then(function() {
			assert.equal(oTable.getFirstVisibleRow(), 4, "table is scrolled to the correct position");
			assert.ok(oRowsUpdatedSpy.calledOnce, "rowsUpdated event is fired");
			oRowsUpdatedSpy.resetHistory();

			return TableUtils.scrollTableToIndex(oTable, 5, true);
		}).then(function() {
			assert.equal(oTable.getFirstVisibleRow(), 4, "table scroll position is already correct");
			assert.ok(oRowsUpdatedSpy.notCalled, "rowsUpdated event is not fired"); // the table didn't scroll

			return TableUtils.scrollTableToIndex(oTable, 0, true);
		}).then(function() {
			assert.equal(oTable.getFirstVisibleRow(), 0, "table is scrolled to the correct position");
			assert.ok(oRowsUpdatedSpy.calledOnce, "rowsUpdated event is fired");
			oRowsUpdatedSpy.resetHistory();

			return TableUtils.scrollTableToIndex(oTable, 10, false);
		}).then(function() {
			assert.equal(oTable.getFirstVisibleRow(), 5, "table is scrolled to the end"); // the table has 3 visible rows and 8 rows in total
			assert.ok(oRowsUpdatedSpy.calledOnce, "rowsUpdated event is fired");

			return Promise.resolve();
		});
	});

	QUnit.test("showNotificationPopoverAtIndex", function(assert) {
		const oAfterOpenSpy = sinon.spy();
		const fnInvisibleMessageAnnounce = sinon.spy(InvisibleMessage.prototype, "announce");
		let oOpenSpy; let oCloseSpy; let sMessage;

		assert.notOk(oTable._oNotificationPopover, "the notification popover is not initialized");

		return TableUtils.showNotificationPopoverAtIndex(oTable, 0, 3).then(function() {
			assert.ok(oTable._oNotificationPopover, "the notification popover is initialized");
			sMessage = oTable._oNotificationPopover.getContent()[0].getText();
			assert.equal(sMessage, TableUtils.getResourceText("TBL_SELECT_LIMIT", [3]),
				"the notification message is correct");

			oOpenSpy = sinon.spy(oTable._oNotificationPopover, "openBy");
			oCloseSpy = sinon.spy(oTable._oNotificationPopover, "close");
			oTable._oNotificationPopover.attachAfterOpen(oAfterOpenSpy);
			assert.ok(fnInvisibleMessageAnnounce.calledOnceWith(sMessage), "The message text is announced");
			oTable.fireFirstVisibleRowChanged({firstVisibleRow: 1});
			assert.ok(oCloseSpy.calledOnce, "the popover closes on scroll");
			fnInvisibleMessageAnnounce.resetHistory();

			return TableUtils.showNotificationPopoverAtIndex(oTable, 1, 5);
		}).then(function() {
			sMessage = oTable._oNotificationPopover.getContent()[0].getText();
			assert.equal(sMessage, TableUtils.getResourceText("TBL_SELECT_LIMIT", [5]),
				"the notification message is correct");
			oOpenSpy.calledOnceWithExactly(oTable.getRows()[1].getDomRefs().rowSelector, "the popover is opened by the correct element");
			assert.ok(oAfterOpenSpy.calledOnce, "the afterOpen event is fired");
			assert.ok(fnInvisibleMessageAnnounce.calledOnceWith(sMessage), "The message text is announced");

			oTable._oNotificationPopover.close();
			oAfterOpenSpy.resetHistory();
			oOpenSpy.resetHistory();
			fnInvisibleMessageAnnounce.resetHistory();

			return TableUtils.showNotificationPopoverAtIndex(oTable, 2, 3);
		}).then(function() {
			sMessage = oTable._oNotificationPopover.getContent()[0].getText();
			assert.equal(sMessage, TableUtils.getResourceText("TBL_SELECT_LIMIT", [3]),
				"the notification message is correct");
			oOpenSpy.calledOnceWithExactly(oTable.getRows()[2].getDomRefs().rowSelector);
			assert.ok(oAfterOpenSpy.calledOnce, "the popover is opened by the correct element");
			assert.ok(fnInvisibleMessageAnnounce.calledOnceWith(sMessage), "The message text is announced");

			oTable._oNotificationPopover.close();
			fnInvisibleMessageAnnounce.restore();
		});
	});

	QUnit.test("loadContexts", function(assert) {
		const oFakeBinding = {
			limit: 2,
			length: 8,
			loadedContexts: [],
			getLength: function() {
				return this.length;
			},
			getContexts: function(iStartIndex, iLength, iThreshold, bKeepCurrent) {
				this.loadedContexts = this.loadedContexts.filter(function(item) {
					return Boolean(item);
				});
				const iLoadedContextsCount = this.loadedContexts.length;
				for (let j = Math.max(iLoadedContextsCount, iStartIndex); j < Math.min(this.length, iLength); j++) {
					if (j < iLoadedContextsCount + this.limit) {
						this.loadedContexts.push({});
					} else {
						this.loadedContexts.push(undefined);
					}
				}
				return this.loadedContexts;
			},
			attachEventOnce: function(sEvent, fn) {
				fn();
			}
		};

		const oGetContextsSpy = sinon.spy(oFakeBinding, "getContexts");
		const oAttachEventSpy = sinon.spy(oFakeBinding, "attachEventOnce");

		return TableUtils.loadContexts(oFakeBinding, 0, 2).then(function(aContexts) {
			assert.ok(oGetContextsSpy.calledOnceWithExactly(0, 2, 0, true), "Binding#getContexts is called once with the correct parameters");
			assert.ok(oAttachEventSpy.notCalled, "requested contexts are available, so no dataReceived event listener is attached");
			assert.equal(aContexts.length, 2, "the method resolves with 2 contexts");
			oGetContextsSpy.resetHistory();
			return TableUtils.loadContexts(oFakeBinding, 0, 7);
		}).then(function(aContexts) {
			assert.equal(oGetContextsSpy.callCount, 3, "Binding#getContexts is called thrice");
			assert.ok(oGetContextsSpy.alwaysCalledWith(0, 7, 0, true), "with the correct parameters");
			assert.ok(oAttachEventSpy.callCount === 2 && oAttachEventSpy.alwaysCalledWith("dataReceived"),
				"dataReceived event listener is attached twice");
			assert.equal(aContexts.length, 7, "the method resolves with 7 contexts");
		});
	});

	QUnit.test("getFocusedItemInfo", function(assert) {
		let oCell = getCell(1, 1, true);
		let oInfo = TableUtils.getFocusedItemInfo(oTable);
		assert.strictEqual(oInfo.cell, 14, "cell");
		assert.strictEqual(oInfo.row, 2, "row");
		assert.strictEqual(oInfo.columnCount, oTable.columnCount + 1 /*row header*/, "columnCount");
		assert.strictEqual(oInfo.cellInRow, 2, "cellInRow");
		assert.strictEqual(oInfo.cellCount, (oTable.columnCount + 1) * (3 /*visible rows*/ + 1), "cellCount");
		assert.strictEqual(oInfo.domRef, oCell.get(0), "domRef");

		oCell = getCell(0, 0, true);
		oInfo = TableUtils.getFocusedItemInfo(oTable);
		assert.strictEqual(oInfo.cell, 7, "cell");
		assert.strictEqual(oInfo.row, 1, "row");
		assert.strictEqual(oInfo.columnCount, oTable.columnCount + 1 /*row header*/, "columnCount");
		assert.strictEqual(oInfo.cellInRow, 1, "cellInRow");
		assert.strictEqual(oInfo.cellCount, (oTable.columnCount + 1) * (3 /*visible rows*/ + 1), "cellCount");
		assert.strictEqual(oInfo.domRef, oCell.get(0), "domRef");

		const oTableDummy = {
			_getItemNavigation: function() {
			}
		};
		oInfo = TableUtils.getFocusedItemInfo(oTableDummy);
		assert.equal(oInfo, null, "FocusedItemInfo = null");
	});

	QUnit.test("getNoContentMessage", function(assert) {
		assert.strictEqual(TableUtils.getNoContentMessage(oTable), TableUtils.getResourceText("TBL_NO_DATA"), "'noData' is empty");

		oTable.setNoData("Some Text");
		assert.strictEqual(TableUtils.getNoContentMessage(oTable), "Some Text", "'noData' is plain text");

		oTable.setNoData(new Control());
		assert.strictEqual(TableUtils.getNoContentMessage(oTable), oTable.getNoData(), "'noData' is a control");
		oTable.destroyNoData();

		oTable.destroyColumns();
		assert.strictEqual(TableUtils.getNoContentMessage(oTable), TableUtils.getResourceText("TBL_NO_COLUMNS"),
			"No columns: 'noData' and '_noColumnsMessage' are empty");

		oTable.setNoData("Some Text");
		assert.strictEqual(TableUtils.getNoContentMessage(oTable), TableUtils.getResourceText("TBL_NO_COLUMNS"),
			"No columns: 'noData' is plain text and '_noColumnsMessage' is empty");

		oTable.setNoData(new Control());
		assert.strictEqual(TableUtils.getNoContentMessage(oTable), TableUtils.getResourceText("TBL_NO_COLUMNS"),
			"No columns: 'noData' is a control and '_noColumnsMessage' is empty");

		oTable.setAggregation("_noColumnsMessage", new Control());
		assert.strictEqual(TableUtils.getNoContentMessage(oTable), oTable.getAggregation("_noColumnsMessage"),
			"No columns: 'noData' and '_noColumnsMessage' are controls");
		oTable.destroyNoData();
	});

	QUnit.test("isNoDataVisible", function(assert) {
		sinon.stub(oTable, "_getTotalRowCount");

		function prepareTable(bShowNoData, iBindingLength) {
			oTable.setShowNoData(bShowNoData);
			oTable._getTotalRowCount.returns(iBindingLength);
		}

		function testNoDataVisibility(sTitle, bShowNoData, iBindingLength, bExpectedResult) {
			prepareTable(bShowNoData, iBindingLength);
			assert.strictEqual(TableUtils.isNoDataVisible(oTable), bExpectedResult,
				sTitle + " - ShowNoData: " + bShowNoData + "; Binding Length: " + iBindingLength);
		}

		testNoDataVisibility("With visible columns", true, 1, false);
		testNoDataVisibility("With visible columns", true, 0, true);
		testNoDataVisibility("With visible columns", false, 1, false);
		testNoDataVisibility("With visible columns", false, 0, false);

		oTable.getColumns().forEach(function(oColumn) {
			oColumn.setVisible(false);
		});
		testNoDataVisibility("Without visible columns", true, 1, true);
		testNoDataVisibility("Without visible columns", true, 0, true);
		testNoDataVisibility("Without visible columns", false, 1, true);
		testNoDataVisibility("Without visible columns", false, 0, true);

		oTable.destroyColumns();
		testNoDataVisibility("Without columns", true, 1, true);
		testNoDataVisibility("Without columns", true, 0, true);
		testNoDataVisibility("Without columns", false, 1, true);
		testNoDataVisibility("Without columns", false, 0, true);
	});

	QUnit.test("hasData", function(assert) {
		sinon.stub(oTable, "_getTotalRowCount");

		oTable._getTotalRowCount.returns(1);
		assert.strictEqual(TableUtils.hasData(oTable), true, "Table has data");

		oTable._getTotalRowCount.returns(0);
		assert.strictEqual(TableUtils.hasData(oTable), false, "Table has no data");
	});

	QUnit.test("isBusyIndicatorVisible", async function(assert) {
		oTable.setBusyIndicatorDelay(0);

		assert.ok(!TableUtils.isBusyIndicatorVisible(), "Invalid parameter passed: Returned false");
		assert.ok(!TableUtils.isBusyIndicatorVisible(null), "Invalid parameter passed: Returned false");
		assert.ok(!TableUtils.isBusyIndicatorVisible(oTable), "The busy indicator is not visible: Returned false");

		oTable.setBusy(true);
		await nextUIUpdate();
		assert.ok(TableUtils.isBusyIndicatorVisible(oTable),
			"The tables busy indicator is visible: Returned true");

		oTable.getRows()[0].getCells()[0].setBusyIndicatorDelay(0);
		oTable.getRows()[0].getCells()[0].setBusy(true);
		await nextUIUpdate();
		assert.ok(TableUtils.isBusyIndicatorVisible(oTable),
			"The tables busy indicator is visible, and a cells busy indicator is visible: Returned true");

		oTable.setBusy(false);
		await nextUIUpdate();
		assert.ok(!TableUtils.isBusyIndicatorVisible(oTable),
			"The tables busy indicator is not visible, but a cells busy indicator is visible: Returned false");
	});

	QUnit.test("isA", function(assert) {
		const oBaseObjectIsA = this.spy(BaseObject, "isObjectA");

		// TableUtils.isA is just a wrapper for sap.ui.base.Object.isA. Therefore, we only check whether TableUtils.isA correctly calls the base
		// method and returns the same value.

		[
			[oTable, null],
			[null, "sap.ui.table.Table"],
			[oTable, "sap.ui.table.Table"],
			[oTable, "sap.ui.table.AnalyticalTable"],
			[oTable, ["sap.ui.table.Table", "sap.ui.table.AnalyticalTable"]]
		].forEach(function(aArguments) {
			const vBaseObjectReturnValue = BaseObject.isObjectA(aArguments[0], aArguments[1]);

			oBaseObjectIsA.resetHistory();
			assert.strictEqual(vBaseObjectReturnValue, TableUtils.isA(aArguments[0], aArguments[1]),
				"TableUtils.isA returns the same as sap.ui.base.Object.isObjectA");
			assert.ok(oBaseObjectIsA.calledOnceWithExactly(aArguments[0], aArguments[1]),
				"sap.ui.base.Object.isObjectA was called once with the same parameters as TableUtils.isA");
		});

		oBaseObjectIsA.restore();
	});

	QUnit.test("isFirstScrollableRow / isLastScrollableRow", async function(assert) {
		const iVisibleRowCount = 6;
		const iFixedTop = 2;
		const iFixedBottom = 2;

		oTable.setRowMode(new FixedRowMode({
			rowCount: iVisibleRowCount,
			fixedTopRowCount: iFixedTop,
			fixedBottomRowCount: iFixedBottom
		}));
		await nextUIUpdate();

		for (let j = 0; j < 2; j++) {
			for (let i = 0; i < iVisibleRowCount; i++) {
				assert.equal(TableUtils.isFirstScrollableRow(oTable, getCell(i, 0)), i === iFixedTop, "isFirstScrollableRow (" + i + ")");
				assert.equal(TableUtils.isLastScrollableRow(oTable, getCell(i, 0)), i === iVisibleRowCount - iFixedBottom - 1,
					"isLastScrollableRow (" + i + ")");
			}
			oTable._getScrollExtension().scrollVertically(true);
		}
	});

	QUnit.test("getCell", async function(assert) {
		oTable.setRowActionCount(2);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.getColumns()[0].setCreationTemplate(new TestInputControl());
		oTable.setCreationRow(new CreationRow());
		await nextUIUpdate();

		assert.strictEqual(TableUtils.getCell(), null, "Returned null: Invalid input");
		assert.strictEqual(TableUtils.getCell(oTable), null, "Returned null: Invalid input");
		assert.strictEqual(TableUtils.getCell(oTable, oTable.getDomRef()), null, "Returned null: Passed element is not a cell or inside a cell");

		let oElement = getSelectAll();
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

		oElement = oTable.getCreationRow()._getCellDomRef(0);
		assert.strictEqual(TableUtils.getCell(oTable, oElement), null, "Returned null: Element is a Pseudo Cell");
		assert.strictEqual(TableUtils.getCell(oTable, oElement.find(":first")), null, "Returned null: Element is in a Pseudo Cell");
		assert.ok(TableUtils.getCell(oTable, oElement, true).is(oElement), "Returned Pseudo Cell in Creation Row");
		assert.ok(TableUtils.getCell(oTable, oElement.find(":first"), true).is(oElement), "Returned Pseudo Cell in Creation Row");
	});

	QUnit.test("getResourceBundle", function(assert) {
		let pPromise;
		let oBundle;
		let oPreviousBundle;
		const sOriginalLanguage = Localization.getLanguage();
		const sTestLanguageA = sOriginalLanguage === "en-US" ? "de-DE" : "en-US";
		const sTestLanguageB = sOriginalLanguage === "en-US" ? "fr-FR" : "en-US";
		const fnOnLocalizationChanged = Table.prototype.onLocalizationChanged;
		const done = assert.async();

		Table.prototype.onLocalizationChanged = function() {};

		/* Synchronous */

		oBundle = TableUtils.getResourceBundle();
		assert.ok(oBundle instanceof ResourceBundle, "{async: false, reload: false} - Returned a bundle");
		assert.strictEqual(TableUtils.getResourceBundle(), oBundle, "{async: false, reload: false} - Returned the already loaded bundle");

		Localization.setLanguage(sTestLanguageA);

		oPreviousBundle = oBundle;
		assert.strictEqual(TableUtils.getResourceBundle(), oBundle,
			"{async: false, reload: false} (language changed) - Returned the already loaded bundle");
		oBundle = TableUtils.getResourceBundle({reload: true});
		assert.ok(oBundle !== oPreviousBundle && oBundle instanceof ResourceBundle,
			"{async: false, reload: true} - Returned a new bundle");
		assert.strictEqual(TableUtils.getResourceBundle({reload: true}), oBundle,
			"{async: false, reload: true} - Returned the already loaded bundle");

		/* Asynchronous */

		Localization.setLanguage(sTestLanguageB);

		pPromise = TableUtils.getResourceBundle({async: true});
		assert.ok(pPromise instanceof Promise, "{async: true, reload: false} (language changed) - Returned a Promise");
		pPromise.then(function(_oBundle) {
			oPreviousBundle = oBundle;
			oBundle = _oBundle;
			assert.strictEqual(oBundle, oPreviousBundle, "Promise returned the already loaded bundle");

			pPromise = TableUtils.getResourceBundle({async: true, reload: true});
			assert.ok(pPromise instanceof Promise, "{async: true, reload: true} - Returned a Promise");
			return pPromise;
		}).then(function(_oBundle) {
			oPreviousBundle = oBundle;
			oBundle = _oBundle;
			assert.ok(oBundle !== oPreviousBundle && oBundle instanceof ResourceBundle, "Promise returned a new bundle");

			pPromise = TableUtils.getResourceBundle({async: true, reload: true});
			assert.ok(pPromise instanceof Promise, "{async: true, reload: true} - Returned a Promise");
			return pPromise;
		}).then(function(_oBundle) {
			oPreviousBundle = oBundle;
			oBundle = _oBundle;
			assert.strictEqual(oBundle, oPreviousBundle, "Promise returned the already loaded bundle");
		}).then(function() {
			// Restore
			Localization.setLanguage(sOriginalLanguage);
			Table.prototype.onLocalizationChanged = fnOnLocalizationChanged;

			done();
		});
	});

	QUnit.test("dynamicCall", function(assert) {
		let bCallbackCalled = false;
		const oTestObject = {prop: "value", funcA: sinon.spy(), funcB: sinon.spy()};
		const oTestObjectWithReturn = {returnString: function() { return "string"; }, returnNumber: function() { return 1; }};
		const oTestContext = {};

		function reset() {
			bCallbackCalled = false;
			oTestObject.funcA.resetHistory();
			oTestObject.funcB.resetHistory();
		}

		TableUtils.dynamicCall(oTestObject, function(vObject) {
			bCallbackCalled = true;
			assert.strictEqual(this, oTestObject, "Callback was called with the default context");
			assert.strictEqual(vObject, oTestObject, "The object was passed to the callback");
		});
		assert.ok(bCallbackCalled, "The object exists, so the callback was called");
		reset();

		TableUtils.dynamicCall(undefined, function() {
			bCallbackCalled = true;
		});
		assert.ok(!bCallbackCalled, "The object does not exist, so the callback was not called");
		reset();

		TableUtils.dynamicCall(function() { return oTestObject; }, function(vObject) {
			bCallbackCalled = true;
			assert.strictEqual(this, oTestContext, "Callback was called with the specified context");
			assert.strictEqual(vObject, oTestObject, "The object was passed to the callback");
		}, oTestContext);
		assert.ok(bCallbackCalled, "The object getter returns an object, so the callback was called");
		reset();

		TableUtils.dynamicCall(function() { return undefined; }, function() {
			bCallbackCalled = true;
		});
		assert.ok(!bCallbackCalled, "The object getter does not return an object, so the callback was not called");
		reset();

		TableUtils.dynamicCall(oTestObject, {
			prop: undefined, // not a function
			funcA: [1, "2", undefined],
			funcB: [],
			funcC: [""] // does not exist
		});
		assert.ok(oTestObject.funcA.calledOnce, "The function \"funcA\" was called once");
		assert.ok(oTestObject.funcA.calledWith(1, "2", undefined), "The function \"funcA\" was called with the specified arguments");
		assert.strictEqual(oTestObject.funcA.thisValues[0], oTestObject, "The function \"funcA\" was called with the default context");
		assert.ok(oTestObject.funcB.calledOnce, "The function \"funcB\" was called once");
		assert.ok(oTestObject.funcB.calledWith(), "The function \"funcB\" was called with the specified arguments");
		assert.strictEqual(oTestObject.funcB.thisValues[0], oTestObject, "The function \"funcB\" was called with the default context");
		reset();

		TableUtils.dynamicCall(oTestObject, {
			funcA: undefined
		}, oTestContext);
		assert.strictEqual(oTestObject.funcA.thisValues[0], oTestContext, "The function was called with the specified context");

		assert.strictEqual(TableUtils.dynamicCall(oTestObjectWithReturn, {returnString: []}), "string", "The return value was returned");
		assert.deepEqual(TableUtils.dynamicCall(oTestObjectWithReturn, {
			returnString: [],
			returnNumber: []
		}), ["string", 1], "The array of return values was returned");
	});

	QUnit.test("getInteractiveElements", async function(assert) {
		TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "Focus&NoTabSpan", false, true, false);
		TableQUnitUtils.addColumn(oTable, "Not Focusable & Not Tabbable", "NoFocus&NoTabSpan", false, false, false);
		TableQUnitUtils.addColumn(oTable, "Focusable & Tabbable", "Focus&TabInput", true, null, true, null, null, true);
		TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "Focus&NoTabInput", true, null, false);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		oTable.setRowActionCount(2);
		await nextUIUpdate();

		/* Data cells */

		let $InteractiveElements = TableUtils.getInteractiveElements(getCell(0, oTable.columnCount - 1));
		assert.strictEqual($InteractiveElements.length, 1, "(JQuery) Data cell with focusable element: One element was returned");
		assert.strictEqual($InteractiveElements[0].value, "Focus&NoTabInput1",
			"(JQuery) Data cell with focusable element: The correct element was returned");

		$InteractiveElements = TableUtils.getInteractiveElements(getCell(0, oTable.columnCount - 1)[0]);
		assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Data cell with focusable element: One element was returned");
		assert.strictEqual($InteractiveElements[0].value, "Focus&NoTabInput1",
			"(HTMLElement) Data cell with focusable element: The correct element was returned");

		$InteractiveElements = TableUtils.getInteractiveElements(getCell(0, oTable.columnCount - 2));
		assert.strictEqual($InteractiveElements.length, 1, "(jQuery) Data cell with focusable & tabbable element: One element was returned");
		assert.strictEqual($InteractiveElements[0].value, "Focus&TabInput1",
			"(jQuery) Data cell with focusable & tabbable element: The correct element was returned");

		$InteractiveElements = TableUtils.getInteractiveElements(getCell(0, oTable.columnCount - 2)[0]);
		assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Data cell with focusable & tabbable element: One element was returned");
		assert.strictEqual($InteractiveElements[0].value, "Focus&TabInput1",
			"(HTMLElement) Data cell with focusable & tabbable element: The correct element was returned");

		$InteractiveElements = TableUtils.getInteractiveElements(getCell(0, oTable.columnCount - 3));
		assert.strictEqual($InteractiveElements, null, "Data cell without interactive element: Null was returned");

		/* Row action cells */

		let $RowActionCell = getRowAction(0);
		let $RowActionIcons = $RowActionCell.find(".sapUiTableActionIcon:visible");
		$InteractiveElements = TableUtils.getInteractiveElements($RowActionCell);
		assert.strictEqual($InteractiveElements.length, 2, "(jQuery) Row Action cell with 2 action items: Two elements have been returned");
		assert.strictEqual($InteractiveElements[0], $RowActionIcons[0], "(jQuery) The first returned element is the correct row action icon");
		assert.strictEqual($InteractiveElements[1], $RowActionIcons[1], "(jQuery) The second returned element is the correct row action icon");

		$InteractiveElements = TableUtils.getInteractiveElements($RowActionCell[0]);
		assert.strictEqual($InteractiveElements.length, 2, "(HTMLElement) Row Action cell with 2 action items: Two elements have been returned");
		assert.strictEqual($InteractiveElements[0], $RowActionIcons[0], "(HTMLElement) The first returned element is the correct row action icon");
		assert.strictEqual($InteractiveElements[1], $RowActionIcons[1], "(HTMLElement) The second returned element is the correct row action icon");

		oTable.setRowActionCount(1);
		await nextUIUpdate();
		$RowActionCell = getRowAction(0);
		$RowActionIcons = $RowActionCell.find(".sapUiTableActionIcon:visible");
		$InteractiveElements = TableUtils.getInteractiveElements($RowActionCell);
		assert.strictEqual($InteractiveElements.length, 1, "(jQuery) Row Action cell with 1 action item: One element was returned");
		assert.strictEqual($InteractiveElements[0], $RowActionIcons[0], "(jQuery) The returned element is the correct row action icon");

		$InteractiveElements = TableUtils.getInteractiveElements($RowActionCell[0]);
		assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Row Action cell with 1 action item: One elements was returned");
		assert.strictEqual($InteractiveElements[0], $RowActionIcons[0], "(HTMLElement) The first returned element is the correct row action icon");

		/* Header cells */

		$InteractiveElements = TableUtils.getInteractiveElements(getColumnHeader(oTable.columnCount - 2));
		assert.strictEqual($InteractiveElements.length, 1, "(JQuery) Column header cell with focusable element: One element was returned");
		assert.strictEqual($InteractiveElements[0].innerText, "Focusable & Tabbable",
			"(JQuery) Column header cell with focusable element: The correct element was returned");

		$InteractiveElements = TableUtils.getInteractiveElements(getColumnHeader(oTable.columnCount - 2)[0]);
		assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Column header cell with focusable element: One element was returned");
		assert.strictEqual($InteractiveElements[0].innerText, "Focusable & Tabbable",
			"(HTMLElement)  Column header cell with focusable element: The correct element was returned");

		/* Cells without interactive elements */

		oTable.setRowActionCount(0);
		await nextUIUpdate();
		$InteractiveElements = TableUtils.getInteractiveElements(getRowAction(0));
		assert.strictEqual($InteractiveElements, null, "Row action cell without interactive element: Null was returned");

		$InteractiveElements = TableUtils.getInteractiveElements(getColumnHeader(0));
		assert.strictEqual($InteractiveElements, null, "Column header cell without interactive element: Null was returned");

		$InteractiveElements = TableUtils.getInteractiveElements(getRowHeader(0));
		assert.strictEqual($InteractiveElements, null, "Row header: Null was returned");

		$InteractiveElements = TableUtils.getInteractiveElements(getSelectAll(0));
		assert.strictEqual($InteractiveElements, null, "SelectAll: Null was returned");

		$InteractiveElements = TableUtils.getInteractiveElements();
		assert.strictEqual($InteractiveElements, null, "No parameter passed: Null was returned");
	});

	QUnit.test("getInteractiveElements - TreeTable Icon Cell", function(assert) {
		const $TreeIconCell = getCell(0, 0, null, null, oTreeTable);
		const sTreeIconOpenClass = "sapUiTableTreeIconNodeOpen";
		const sTreeIconClosedClass = "sapUiTableTreeIconNodeClosed";
		const sTreeIconLeafClass = "sapUiTableTreeIconLeaf";

		// Closed node
		let $InteractiveElements = TableUtils.getInteractiveElements($TreeIconCell);
		assert.strictEqual($InteractiveElements.length, 1, "(JQuery) Tree icon cell of closed node: One element was returned");
		assert.ok($InteractiveElements[0].classList.contains(sTreeIconClosedClass),
			"(JQuery) Tree icon cell of closed node: The correct closed node element was returned");

		$InteractiveElements = TableUtils.getInteractiveElements($TreeIconCell[0]);
		assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Tree icon cell of closed node: One element was returned");
		assert.ok($InteractiveElements[0].classList.contains(sTreeIconClosedClass),
			"(HTMLElement) Tree icon cell of closed node: The correct closed node element was returned");

		// Open node
		$InteractiveElements[0].classList.remove(sTreeIconClosedClass);
		$InteractiveElements[0].classList.add(sTreeIconOpenClass);

		$InteractiveElements = TableUtils.getInteractiveElements($TreeIconCell);
		assert.strictEqual($InteractiveElements.length, 1, "(JQuery) Tree icon cell of open node: One element was returned");
		assert.ok($InteractiveElements[0].classList.contains(sTreeIconOpenClass),
			"(JQuery) Tree icon cell of open node: The correct open node element was returned");

		$InteractiveElements = TableUtils.getInteractiveElements($TreeIconCell[0]);
		assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Tree icon cell of open node: One element was returned");
		assert.ok($InteractiveElements[0].classList.contains(sTreeIconOpenClass),
			"(HTMLElement) Tree icon cell of open node: The correct open node element was returned");

		// Leaf node
		$InteractiveElements[0].classList.remove(sTreeIconOpenClass);
		$InteractiveElements[0].classList.add(sTreeIconLeafClass);

		$InteractiveElements = TableUtils.getInteractiveElements($TreeIconCell);
		assert.strictEqual($InteractiveElements, null, "(JQuery) Tree icon cell of leaf node: No element was returned");

		$InteractiveElements = TableUtils.getInteractiveElements($TreeIconCell[0]);
		assert.strictEqual($InteractiveElements, null, "(HTMLElement) Tree icon cell of leaf node: No element was returned");
	});

	QUnit.test("getFirstInteractiveElement", async function(assert) {
		let oRow = oTable.getRows()[0];

		assert.equal(TableUtils.getFirstInteractiveElement(undefined), null, "The row instance is undefined: returns null");
		assert.equal(TableUtils.getFirstInteractiveElement(null), null, "The row instance is equal to null: returns null");
		assert.equal(TableUtils.getFirstInteractiveElement(oRow), null, "There are no interactive elements: returns null");

		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		oTable.setRowActionCount(2);
		await nextUIUpdate();

		assert.equal(TableUtils.getFirstInteractiveElement(oRow, false), null, "");
		const $RowActionCell = getRowAction(0);
		const $RowActionIcons = $RowActionCell.find(".sapUiTableActionIcon:visible");
		oRow = oTable.getRows()[0];
		assert.equal(TableUtils.getFirstInteractiveElement(oRow, false), null, "ActionCells are not taken in consideration");
		assert.equal(TableUtils.getFirstInteractiveElement(oRow, true), $RowActionIcons[0], "ActionCells are taken in consideration");

		oRow.getCells()[0].$().attr("tabindex", 0);
		oRow.getCells()[1].$().attr("tabindex", 0);
		assert.equal(TableUtils.getFirstInteractiveElement(oRow, true), oRow.getCells()[0].getDomRef(), "Returns the first interactive element");
	});

	QUnit.test("convertCSSSizeToPixel", function(assert) {
		assert.equal(TableUtils.convertCSSSizeToPixel("10em", true), "160px", "10em converted to pixel string correctly.");
		assert.equal(TableUtils.convertCSSSizeToPixel("10.11em", true), "161.76px", "10.11em converted to pixel string correctly.");
		assert.equal(TableUtils.convertCSSSizeToPixel("10rem"), 160, "10rem converted to pixel integer correctly.");
		assert.equal(TableUtils.convertCSSSizeToPixel("10.11rem"), 161.76, "10.11rem converted to pixel float correctly.");
		assert.equal(TableUtils.convertCSSSizeToPixel("100px"), 100, "100px converted to pixel integer correctly.");
		assert.equal(TableUtils.convertCSSSizeToPixel("100.11px"), 100.11, "100.11px converted to pixel float correctly.");

		assert.equal(TableUtils.convertCSSSizeToPixel(), null, "undefined could not be converted. Returned null.");
		assert.equal(TableUtils.convertCSSSizeToPixel("100"), null, "100 could not be converted. Returned null.");
		assert.equal(TableUtils.convertCSSSizeToPixel("10vh"), null, "100vh could not be converted. Returned null.");
		assert.equal(TableUtils.convertCSSSizeToPixel(100), null, "Integer could not be converted. Returned null.");
		assert.equal(TableUtils.convertCSSSizeToPixel(100.11), null, "Float could not be converted. Returned null.");
	});

	QUnit.test("getBaseFontSize", function(assert) {
		assert.equal(TableUtils.getBaseFontSize(), 16, "Base font size returned");
	});

	QUnit.test("addDelegate", function(assert) {
		const oDelegateSpy = sinon.spy(oTable, "addDelegate");
		const oDelegateDummy = {prop: 1};
		const oThisDummy = {otherProp: 1};

		TableUtils.addDelegate();
		assert.ok(oDelegateSpy.notCalled, "No parameters passed: Element#addDelegate was not called");

		TableUtils.addDelegate(oTable);
		assert.ok(oDelegateSpy.notCalled, "No delegate passed: Element#addDelegate was not called");

		TableUtils.addDelegate(oTable, oDelegateDummy);
		assert.ok(oDelegateSpy.calledOnce, "Element#addDelegate was called once");
		assert.ok(oDelegateSpy.calledWithExactly(oDelegateDummy, false, oDelegateDummy, false),
			"Element#addDelegate is called with the correct parameters");
		oDelegateSpy.resetHistory();

		TableUtils.addDelegate(oTable, oDelegateDummy, oThisDummy);
		assert.ok(oDelegateSpy.calledOnce, "Element#addDelegate was called once");
		assert.ok(oDelegateSpy.calledWithExactly(oDelegateDummy, false, oThisDummy, false),
			"Element#addDelegate is called with the correct parameters");

		oDelegateSpy.restore();
	});

	QUnit.test("removeDelegate", function(assert) {
		const oDelegateSpy = sinon.spy(oTable, "removeDelegate");
		const oDelegateDummy = {prop: 1};

		TableUtils.removeDelegate();
		assert.ok(oDelegateSpy.notCalled, "No parameters passed: Element#removeDelegate was not called");

		TableUtils.removeDelegate(oTable);
		assert.ok(oDelegateSpy.notCalled, "No delegate passed: Element#removeDelegate was not called");

		TableUtils.removeDelegate(oTable, oDelegateDummy);
		assert.ok(oDelegateSpy.calledOnce, "Element#addDelegate was called once");
		assert.ok(oDelegateSpy.calledWithExactly(oDelegateDummy), "Element#removeDelegate is called with the correct parameters");

		oDelegateSpy.restore();
	});

	QUnit.test("createWeakMapFacade", function(assert) {
		const oWeakMapFacade = TableUtils.createWeakMapFacade();
		const oKeyA = {};
		const oKeyB = {};

		assert.strictEqual(oWeakMapFacade(undefined), null, "WeakMap is not accessible if the key is undefined");
		assert.strictEqual(oWeakMapFacade(null), null, "WeakMap is not accessible if the key is null");
		assert.strictEqual(oWeakMapFacade("not an object"), null, "WeakMap is not accessible if the key is a string");

		assert.deepEqual(oWeakMapFacade(oKeyA), {}, "New value object created vor key A");
		assert.deepEqual(oWeakMapFacade(oKeyB), {}, "New value object created for key B");

		oWeakMapFacade(oKeyA).foo = "bar";
		assert.deepEqual(oWeakMapFacade(oKeyA), {foo: "bar"}, "Value of key A was changed");
		assert.deepEqual(oWeakMapFacade(oKeyB), {}, "Value of key B was not changed");

		assert.deepEqual(TableUtils.createWeakMapFacade()(oKeyA), {}, "New value object created vor key A in another WeakMap");
	});

	QUnit.test("isThemeApplied", function(assert) {
		const done = assert.async();
		let sCurrentTheme;
		let iPass = 0;

		const fnThemeChanged = (oEvent) => {
			const sTheme = oEvent.theme;

			if (iPass === 0) {
				sCurrentTheme = Theming.getTheme();
				iPass++;
				assert.strictEqual(sTheme, sCurrentTheme, "Initial: Correct current Theme: " + sTheme);
				assert.ok(TableUtils.isThemeApplied(), sTheme + " is applied");
				// use an artifical theme because a real theme might already in the cache and is then applied sync
				// (next check would fail depending on the scenario).
				Theming.setTheme("my_dummy_theme");
				assert.notOk(TableUtils.isThemeApplied(), "sap_horizon_hcb is not applied after setTheme");
			} else if (iPass === 1) {
				iPass++;
				assert.strictEqual(sTheme, "my_dummy_theme", "After Change: Correct current Theme: " + sTheme);
				assert.ok(TableUtils.isThemeApplied(), sTheme + " is applied");
				Theming.setTheme(sCurrentTheme); // Just reset theme back to the standard one to cleanup for later tests
			} else {
				assert.strictEqual(sTheme, sCurrentTheme, "Final: Correct current Theme: " + sTheme);
				Theming.detachApplied(fnThemeChanged);
				done();
			}
		};

		Theming.attachApplied(fnThemeChanged);
	});

	QUnit.test("getEventPosition", function(assert) {
		let oEvent;
		let oPos;
		const x = 15;
		const y = 20;
		const oCoord = {pageX: x, pageY: y};

		oEvent = jQuery.extend({originalEvent: {}}, oCoord);

		oPos = TableUtils.getEventPosition(oEvent, oTable);
		assert.equal(oPos.x, x, "MouseEvent - X");
		assert.equal(oPos.y, y, "MouseEvent - Y");

		oEvent = {
			targetTouches: [oCoord],
			originalEvent: {
				touches: []
			}
		};

		oPos = TableUtils.getEventPosition(oEvent, oTable);
		assert.equal(oPos.x, x, "TouchEvent - X");
		assert.equal(oPos.y, y, "TouchEvent - Y");

		oEvent = {
			touches: [oCoord],
			originalEvent: {
				touches: [],
				targetTouches: [oCoord]
			}
		};

		oPos = TableUtils.getEventPosition(oEvent, oTable);
		assert.equal(oPos.x, x, "TouchEvent (wrapped) - X");
		assert.equal(oPos.y, y, "TouchEvent (wrapped) - Y");
	});

	QUnit.module("Resize Handler", {
		beforeEach: function() {
			jQuery("#qunit-fixture").append("<div id='__table-outer'>" +
											"<div id='__table-inner'>" +
											"<div id='__table-center'></div>" +
											"</div>" +
											"</div>");
			jQuery("#__table-outer").attr("style", "height: 500px; width: 500px; overflow: hidden; background: red;");
			jQuery("#__table-inner").attr("style", "height: 200px; width: 200px; background: blue;");
			jQuery("#__table-center").attr("style", "height: 100px; width: 100px; background: green;");

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
					const aKeys = [];
					for (const sKey in this._mResizeHandlerIds) {
						if (this._mResizeHandlerIds[sKey] !== undefined && this._mResizeHandlerIds.hasOwnProperty(sKey)) {
							aKeys.push(sKey);
						}
					}
					return aKeys.sort();
				}
			};
		}
	});

	QUnit.test("Register/Deregister", function(assert) {
		const done = assert.async();
		let sResizeHandlerId;

		const fnTestOuter = function(oEvent) {
			assert.equal(oEvent.currentTarget.getAttribute("id"), this.oTable.getId("outer"), "ResizeHandler triggered for 'outer' element");
			jQuery("#" + this.oTable.getId("inner")).height("250px");
		}.bind(this);

		const fnTestCenterParent = function(oEvent) {
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
			TableUtils.registerResizeHandler(this.oTable, "inner", function() {}, "inner");
			TableUtils.registerResizeHandler(this.oTable, "center", function() {}, "center");

			assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), ["center", "inner", "outer"],
				"All ResizeHandler IDs correctly stored at table instance");

			TableUtils.deregisterResizeHandler(this.oTable, ["center", "outer"]);
			assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), ["inner"],
				"All ResizeHandler IDs correctly stored after remove 'center', 'outer'");

			// register new handlers for further testings
			TableUtils.registerResizeHandler(this.oTable, "outer", function() {}, "outer");
			TableUtils.registerResizeHandler(this.oTable, "center", function() {}, "center");

			TableUtils.deregisterResizeHandler(this.oTable);

			assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), [], "All ResizeHandler IDs correctly removed");

			// test type errors
			assert.strictEqual(TableUtils.registerResizeHandler(), undefined,
				"No ResizeHandler ID returned because no parameters passed");
			assert.strictEqual(TableUtils.registerResizeHandler(this.oTable, {}, function() {}), undefined,
				"No ResizeHandler ID returned because of wrong type for handler id");
			assert.strictEqual(TableUtils.registerResizeHandler(this.oTable, "id", ""), undefined,
				"No ResizeHandler ID returned because of wrong type for handler function");
			assert.strictEqual(TableUtils.registerResizeHandler(this.oTable, "id", function() {}, {}), undefined,
				"No ResizeHandler ID returned because of wrong type for DOM id suffix");
			assert.deepEqual(this.oTable.getResizeHandlerIdKeys(), [], "No ResizeHandler IDs stored at table instance");

			done();
		}.bind(this);

		assert.strictEqual(this.oTable._mResizeHandlerIds, undefined, "No ResizeHandler registered, therefore no ResizeHandlerIds map");
		TableUtils.deregisterResizeHandler(this.oTable);
		assert.strictEqual(this.oTable._mResizeHandlerIds, undefined, "Deregister does not create ResizeHandlerIds map");

		sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, "outer", fnTestOuter, "outer");
		assert.notStrictEqual(sResizeHandlerId, undefined, "ResizeHandler ID was returned for 'outer': '" + sResizeHandlerId + "'");
		assert.equal(this.oTable._mResizeHandlerIds.outer, sResizeHandlerId, "ResizeHandler ID correctly stored at table instance (outer)");

		sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, "center", fnTestCenterParent, "center", true);
		assert.notStrictEqual(sResizeHandlerId, undefined,
			"ResizeHandler ID was returned for 'inner', registered by parent of 'center': '" + sResizeHandlerId + "'");
		assert.equal(this.oTable._mResizeHandlerIds.center, sResizeHandlerId,
			"ResizeHandler ID correctly stored at table instance (parent of center)");

		sResizeHandlerId = TableUtils.registerResizeHandler(this.oTable, "doesNotExist", fnTestCenterParent, "doesNotExist", true);
		assert.strictEqual(sResizeHandlerId, undefined, "No ResizeHandler ID returned for unknown DOM");

		jQuery("#" + this.oTable.getId("outer")).height("550px");
	});

	QUnit.module("Content Density", {
		beforeEach: function() {
			jQuery("#qunit-fixture").append("<div id='__table-outer'></div>");

			this.oTable = new Table();

			this.TableUtilsDummyControl = Control.extend("sap.ui.table.utils.TableUtilsDummyControl", {
				metadata: {
					library: "sap.ui.table",
					aggregations: {
						content: {type: "sap.ui.core.Control", multiple: true}
					}
				},
				renderer: {
					apiVersion: 2,
					render: function(rm, oControl) {
						rm.openStart("div", oControl).openEnd();
						const aContent = oControl.getContent();
						for (let i = 0; i < aContent.length; i++) {
							rm.renderControl(aContent[i]);
						}
						rm.close("div");
					}
				}
			}, false);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("getContentDensity", async function(assert) {
		const oSecondLevel = new this.TableUtilsDummyControl({content: [this.oTable]});
		const oFirstLevel = new this.TableUtilsDummyControl({content: [oSecondLevel]});
		const $Body = jQuery(document.body);
		$Body.toggleClass("sapUiSizeCozy", false);

		oFirstLevel.placeAt("__table-outer", 0);
		await nextUIUpdate();
		assert.strictEqual(TableUtils.getContentDensity(this.oTable), undefined, "No content density set to far");

		$Body.toggleClass("sapUiSizeCozy", true);
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy", "sapUiSizeCozy at Body");

		oFirstLevel.addStyleClass("sapUiSizeCompact");
		await nextUIUpdate();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCompact", "sapUiSizeCompact at FirstLevel");

		oSecondLevel.addStyleClass("sapUiSizeCondensed");
		await nextUIUpdate();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed", "sapUiSizeCondensed at SecondLevel");

		oSecondLevel.addStyleClass("sapUiSizeCozy");
		await nextUIUpdate();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed",
			"sapUiSizeCozy and sapUiSizeCondensed at SecondLevel -> sapUiSizeCondensed");

		oSecondLevel.addStyleClass("sapUiSizeCompact");
		await nextUIUpdate();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed",
			"sapUiSizeCozy, sapUiSizeCompact and sapUiSizeCondensed at SecondLevel -> sapUiSizeCondensed");

		oSecondLevel.removeStyleClass("sapUiSizeCompact");
		this.oTable.addStyleClass("sapUiSizeCompact");
		await nextUIUpdate();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCompact", "sapUiSizeCompact at Table");

		oSecondLevel.addStyleClass("sapUiSizeCompact");
		this.oTable.$().toggleClass("sapUiSizeCompact", false);
		this.oTable.$().toggleClass("sapUiSizeCozy", true);
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy",
			"sapUiSizeCozy at table DOM and sapUiSizeCompact at control level. DOM wins -> sapUiSizeCozy");

		this.oTable.$().toggleClass("sapUiSizeCondensed", true);
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed",
			"sapUiSizeCondensed at table DOM, sapUiSizeCozy at table DOM and sapUiSizeCompact at control level. DOM wins. -> sapUiSizeCondensed");

		$Body.toggleClass("sapUiSizeCozy", true);
	});

	QUnit.test("getContentDensity without DOM", function(assert) {
		const oSecondLevel = new this.TableUtilsDummyControl({content: [this.oTable]});
		const oFirstLevel = new this.TableUtilsDummyControl({content: [oSecondLevel]});
		const $Body = jQuery(document.body);
		$Body.toggleClass("sapUiSizeCozy", false);

		assert.strictEqual(TableUtils.getContentDensity(this.oTable), undefined, "No content density set to far");

		$Body.toggleClass("sapUiSizeCozy", true);
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy", "sapUiSizeCozy at Body");

		oFirstLevel.addStyleClass("sapUiSizeCompact");
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCompact", "sapUiSizeCompact at FirstLevel");

		oSecondLevel.addStyleClass("sapUiSizeCondensed");
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed", "sapUiSizeCondensed at SecondLevel");

		oSecondLevel.addStyleClass("sapUiSizeCozy");
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed",
			"sapUiSizeCondensed and sapUiSizeCozy at SecondLevel -> sapUiSizeCondensed");

		oSecondLevel.addStyleClass("sapUiSizeCompact");
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCondensed",
			"sapUiSizeCompact, sapUiSizeCondensed and sapUiSizeCozy at SecondLevel -> sapUiSizeCondensed");

		this.oTable.addStyleClass("sapUiSizeCozy");
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy", "sapUiSizeCozy at Table");

		$Body.toggleClass("sapUiSizeCozy", true);
	});

	QUnit.test("getContentDensity table in UI Area", async function(assert) {
		this.oTable.placeAt("__table-outer", 0);
		await nextUIUpdate();
		const $Body = jQuery(document.body);
		$Body.toggleClass("sapUiSizeCozy", false);

		assert.strictEqual(TableUtils.getContentDensity(this.oTable), undefined, "No content density set to far");

		this.oTable.addStyleClass("sapUiSizeCozy");
		await nextUIUpdate();
		assert.equal(TableUtils.getContentDensity(this.oTable), "sapUiSizeCozy", "sapUiSizeCozy at table");

		$Body.toggleClass("sapUiSizeCozy", true);
	});

	QUnit.module("Cell Content", {
		beforeEach: async function() {
			await createTables();
			TableQUnitUtils.addColumn(oTable, "Not Focusable & Not Tabbable", "NoFocusNoTab");
			TableQUnitUtils.addColumn(oTable, "Focusable & Tabbable", "FocusTab", true, null, true);
			TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "NoTab", true, null, false);

			await nextUIUpdate();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	function _getFirstInteractiveElement(cell) {
		const $Cell = jQuery(cell);
		const $InteractiveElements = $Cell.find(":sapTabbable, input:sapFocusable, .sapUiTableTreeIcon");
		return $InteractiveElements[0];
	}

	QUnit.test("getParentCell", async function(assert) {
		oTable.getColumns()[0].setCreationTemplate(new TestInputControl());
		oTable.setCreationRow(new CreationRow());
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		/* Data Cell */

		let oCell = getCell(0, oTable.columnCount - 1);
		let $ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell));
		assert.strictEqual($ParentCell.length, 1, "A data cell was returned");
		assert.strictEqual($ParentCell[0], oCell[0], "jQuery object passed: The correct data cell was returned");

		$ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell[0]));
		assert.strictEqual($ParentCell.length, 1, "A data cell was returned");
		assert.strictEqual($ParentCell[0], oCell[0], "DOM element passed: The correct data cell was returned");

		oCell = getCell(0, oTable.columnCount - 2);
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

		/* Pseudo Cell */

		oCell = oTable.getCreationRow()._getCellDomRef(0);

		$ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell));
		assert.strictEqual($ParentCell, null, "Element is in a pseudo cell: Null was returned");

		$ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell), true);
		assert.strictEqual($ParentCell.length, 1, "A creation row pseudo cell was returned");
		assert.strictEqual($ParentCell[0], oCell[0], "jQuery object passed: The correct creation row pseudo cell was returned");

		$ParentCell = TableUtils.getParentCell(oTable, _getFirstInteractiveElement(oCell[0]), true);
		assert.strictEqual($ParentCell.length, 1, "A creation row pseudo cell was returned");
		assert.strictEqual($ParentCell[0], oCell[0], "DOM element passed: The correct creation row pseudo cell was returned");

		/* Invalid parameters */

		$ParentCell = TableUtils.getParentCell(oTable);
		assert.strictEqual($ParentCell, null, "No element passed: Null was returned");

		$ParentCell = TableUtils.getParentCell(null, _getFirstInteractiveElement(getCell(0, oTable.columnCount - 1)));
		assert.strictEqual($ParentCell, null, "No table passed: Null was returned");
	});

	QUnit.module("Throttle", {
		before: function() {
			this.oClock = sinon.useFakeTimers();
		},
		beforeEach: function() {
			this.fnTestFunction = sinon.spy();
		},
		after: function() {
			this.oClock.restore();
		},
		assertNotCalled: function(assert) {
			assert.equal(this.fnTestFunction.callCount, 0, "Not called");
			this.fnTestFunction.resetHistory();
		},
		assertCalled: function(assert, oContext, aLastArguments) {
			assert.equal(this.fnTestFunction.callCount, 1, "Called once");

			if (this.fnTestFunction.callCount === 1) {
				if (oContext != null) {
					assert.strictEqual(this.fnTestFunction.lastCall.thisValue, oContext, "Context (this) of the call");
				}

				if (aLastArguments != null) {
					assert.deepEqual(this.fnTestFunction.lastCall.args, aLastArguments, "Called with the correct arguments");
				} else {
					assert.deepEqual(this.fnTestFunction.lastCall.args, [], "Called without arguments");
				}
			}

			this.fnTestFunction.resetHistory();
		}
	});

	QUnit.test("Return a throttled function", function(assert) {
		assert.ok(TableUtils.throttle(this.fnTestFunction, 50).cancel, "The throttled function is returned");
	});

	QUnit.test("Asynchronous leading invocation", function(assert) {
		let fnThrottled = TableUtils.throttle(this.fnTestFunction, 50, {
			leading: false,
			asyncLeading: true
		});
		const oContext = {iAmThis: true};
		const that = this;

		fnThrottled();

		return Promise.resolve().then(function() {
			that.assertNotCalled(assert);
			that.oClock.tick(50);
			that.assertCalled(assert);
		}).then(function() {
			fnThrottled = TableUtils.throttle(that.fnTestFunction, 50, {
				leading: true,
				asyncLeading: true
			});
			assert.ok(fnThrottled.cancel, "The throttled function is returned");

			fnThrottled.call(oContext, "something");
			that.assertNotCalled(assert);
		}).then(function() {
			that.assertCalled(assert, oContext, ["something"]);
			that.oClock.tick(50);
			that.assertNotCalled(assert);

			fnThrottled.call(oContext, "something");
			fnThrottled.call(oContext, "something 2");
			that.assertNotCalled(assert);
		}).then(function() {
			that.assertCalled(assert, oContext, ["something 2"]);
			that.oClock.tick(50);
			that.assertCalled(assert, oContext, ["something 2"]);

			fnThrottled.call(oContext, "something");
			that.assertNotCalled(assert);
		}).then(function() {
			that.assertCalled(assert, oContext, ["something"]);
		});
	});

	QUnit.test("Cancellation of asynchronous leading invocation", function(assert) {
		const fnThrottled = TableUtils.throttle(this.fnTestFunction, 50, {
			leading: true,
			asyncLeading: true
		});
		const that = this;

		fnThrottled();
		fnThrottled.cancel();

		return Promise.resolve().then(function() {
			that.assertNotCalled(assert);
		});
	});

	QUnit.test("Frame-wise - No calls", function(assert) {
		TableUtils.throttleFrameWise(this.fnTestFunction);

		this.oClock.runToFrame();
		this.assertNotCalled(assert);
	});

	QUnit.test("Frame-wise - One call", function(assert) {
		const fnThrottled = TableUtils.throttleFrameWise(this.fnTestFunction);
		const oContext = {iAmThis: true};

		fnThrottled.call(oContext, "animation frame");
		this.oClock.runToFrame();
		this.assertCalled(assert, oContext, ["animation frame"]);

		fnThrottled.call(oContext);
		this.oClock.runToFrame();
		fnThrottled.call(oContext, "animation frame", 3);
		this.assertCalled(assert, oContext);

		this.oClock.runToFrame();
		this.assertCalled(assert, oContext, ["animation frame", 3]);

		this.oClock.runToFrame();
		this.assertNotCalled(assert);
	});

	QUnit.test("Frame-wise - Multiple calls", function(assert) {
		const fnThrottled = TableUtils.throttleFrameWise(this.fnTestFunction);
		const oContext = {iAmThis: true};

		fnThrottled.call();
		fnThrottled.call(oContext, "something");
		fnThrottled.call(oContext, "animation frame");
		this.oClock.runToFrame();
		this.assertCalled(assert, oContext, ["animation frame"]);

		fnThrottled.call(oContext, "something");
		fnThrottled.call(oContext, "animation frame", 2);
		fnThrottled.call(oContext);
		this.oClock.runToFrame();

		fnThrottled.call();
		fnThrottled.call(oContext, "something");
		fnThrottled.call(oContext, "animation frame", 3);
		this.assertCalled(assert, oContext);

		this.oClock.runToFrame();
		this.assertCalled(assert, oContext, ["animation frame", 3]);

		this.oClock.runToFrame();
		this.assertNotCalled(assert);
	});

	QUnit.test("Frame-wise - Cancellation", function(assert) {
		const fnThrottled = TableUtils.throttleFrameWise(this.fnTestFunction);
		const oContext = {iAmThis: true};

		fnThrottled();
		fnThrottled.cancel();

		this.oClock.runToFrame();
		this.assertNotCalled(assert);

		fnThrottled.call(oContext, "animation frame");
		this.oClock.runToFrame();
		this.assertCalled(assert, oContext, ["animation frame"]);
	});
});