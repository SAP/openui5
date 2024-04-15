/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Table",
	"sap/ui/table/CreationRow",
	"sap/ui/table/extensions/ExtensionBase",
	"sap/ui/table/extensions/Keyboard",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/containsOrEquals"
], function(
	TableQUnitUtils,
	qutils,
	nextUIUpdate,
	TableUtils,
	Table,
	CreationRow,
	ExtensionBase,
	KeyboardExtension,
	JSONModel,
	jQuery,
	containsOrEquals
) {
	"use strict";

	const createTables = window.createTables;
	const destroyTables = window.destroyTables;
	const getCell = window.getCell;
	const getColumnHeader = window.getColumnHeader;
	const getRowHeader = window.getRowHeader;
	const getRowAction = window.getRowAction;
	const getSelectAll = window.getSelectAll;
	const TestControl = TableQUnitUtils.TestControl;

	QUnit.module("Lifecycle", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1),
				columns: TableQUnitUtils.createTextColumn()
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oExtension = this.oTable._getKeyboardExtension();
		let iDelegateCount = 0;

		assert.ok(oExtension, "Extension available in table");
		assert.ok(!oExtension._itemNavigation, "Item Navigation not yet initialized");

		for (let i = 0; i < this.oTable.aDelegates.length; i++) {
			if (this.oTable.aDelegates[i].oDelegate === oExtension._delegate) {
				iDelegateCount++;
			}
		}

		assert.equal(iDelegateCount, 1, "Keyboard Delegate registered");

		this.oTable.qunit.getDataCell(0, 0).focus();
		assert.ok(oExtension._itemNavigation, "Item Navigation initialized on focus");
	});

	QUnit.test("Destruction", function(assert) {
		const oExtension = this.oTable._getKeyboardExtension();

		this.oTable.destroy();
		assert.ok(!oExtension.getTable(), "Reference to table removed");
		assert.ok(!oExtension._delegate, "Delegate cleared");
		assert.ok(!oExtension._itemNavigation, "Item Navigation cleared");
	});

	QUnit.module("Item Navigation", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("init() / destroy()", function(assert) {
		const oExtension = ExtensionBase.enrich(new Table(), KeyboardExtension);
		assert.ok(!oExtension._itemNavigation, "Item Navigation not yet initialized");
		oExtension.initItemNavigation();
		assert.ok(oExtension._itemNavigation, "Item Navigation initialized on focus");
		oExtension.destroy();
		assert.ok(!oExtension._itemNavigation, "Item Navigation not available anymore after destroy");
	});

	QUnit.test("invalidation", function(assert) {
		const oExtension = oTable._getKeyboardExtension();
		assert.ok(oExtension._itemNavigationInvalidated, "Item Navigation invalid due to initial rendering");
		oExtension.initItemNavigation();
		assert.ok(!oExtension._itemNavigationInvalidated, "Item Navigation valid after initItemNavigation");
		oExtension.invalidateItemNavigation();
		assert.ok(oExtension._itemNavigationInvalidated, "Item Navigation invalid after invalidateItemNavigation");
	});

	const aEvents = [
		"focusin", "sapfocusleave", "mousedown", "sapnext", "sapnextmodifiers", "sapprevious", "sappreviousmodifiers",
		"sappageup", "sappagedown", "saphome", "saphomemodifiers", "sapend", "sapendmodifiers", "sapkeyup"
	];

	function setupItemNavigationFakeTest(assert) {
		const oControl = new TestControl();
		const oExtension = ExtensionBase.enrich(oControl, KeyboardExtension);
		oExtension._itemNavigation = {
			destroy: function() {
			}
		};
		/* eslint-disable no-loop-func */
		for (let i = 0; i < aEvents.length; i++) {
			oExtension._itemNavigation["on" + aEvents[i]] = function(oEvent) {
				assert.ok(true, oEvent.type + " reached ItemNavigation");
			};
		}
		/* eslint-enable no-loop-func */
		oControl.removeEventDelegate(oExtension._delegate);
		return oControl;
	}

	QUnit.test("ItemNavigationDelegate", function(assert) {
		const oControl = setupItemNavigationFakeTest(assert);

		assert.expect(14);
		for (let i = 0; i < aEvents.length; i++) {
			/*eslint-disable new-cap */
			oControl._handleEvent(jQuery.Event(aEvents[i]));
			/*eslint-enable new-cap */
		}

		oControl._getKeyboardExtension().destroy();
	});

	QUnit.test("Suspend / Resume", function(assert) {
		const oControl = setupItemNavigationFakeTest(assert);
		let i;

		oControl._getKeyboardExtension().suspendItemNavigation();

		assert.expect(14);

		for (i = 0; i < aEvents.length; i++) {
			/*eslint-disable new-cap */
			oControl._handleEvent(jQuery.Event(aEvents[i]));
			/*eslint-enable new-cap */
		}

		oControl._getKeyboardExtension().resumeItemNavigation();

		for (i = 0; i < aEvents.length; i++) {
			/*eslint-disable new-cap */
			oControl._handleEvent(jQuery.Event(aEvents[i]));
			/*eslint-enable new-cap */
		}

		oControl._getKeyboardExtension().destroy();
	});

	QUnit.test("Marked Event", function(assert) {
		const oControl = setupItemNavigationFakeTest(assert);
		let i;

		assert.expect(14);

		for (i = 0; i < aEvents.length; i++) {
			/*eslint-disable new-cap */
			const oEvent = jQuery.Event(aEvents[i]);
			/*eslint-enable new-cap */
			oEvent.setMarked("sapUiTableSkipItemNavigation");
			oControl._handleEvent(oEvent);
		}

		for (i = 0; i < aEvents.length; i++) {
			/*eslint-disable new-cap */
			oControl._handleEvent(jQuery.Event(aEvents[i]));
			/*eslint-enable new-cap */
		}

		oControl._getKeyboardExtension().destroy();
	});

	QUnit.test("Stored Focus Position", function(assert) {
		const oExtension = oTable._getKeyboardExtension();
		oExtension._oLastFocusedCellInfo = null;
		oExtension.initItemNavigation();

		let oInfo = oExtension.getLastFocusedCellInfo();
		assert.strictEqual(oInfo.cell, oTable.columnCount + 2 /* 2* row header*/, "cell");
		assert.strictEqual(oInfo.row, 1, "row");
		assert.strictEqual(oInfo.columnCount, oTable.columnCount + 1 /*row header*/, "columnCount");
		assert.strictEqual(oInfo.cellInRow, 1, "cellInRow");
		assert.strictEqual(oInfo.cellCount, (oTable.columnCount + 1) * (3 /*visible rows*/ + 1), "cellCount");
		assert.strictEqual(oInfo.header, 1, "header");

		assert.ok(!oExtension._oLastFocusedCellInfo, "No LastFocusedCellInfo stored");

		getCell(1, 2, true, assert);

		oInfo = oExtension.getLastFocusedCellInfo();
		assert.strictEqual(oInfo.cell, 2 * (oTable.columnCount + 1) + 3, "cell");
		assert.strictEqual(oInfo.row, 2, "row");
		assert.strictEqual(oInfo.columnCount, oTable.columnCount + 1 /*row header*/, "columnCount");
		assert.strictEqual(oInfo.cellInRow, 3, "cellInRow");
		assert.strictEqual(oInfo.cellCount, (oTable.columnCount + 1) * (3 /*visible rows*/ + 1), "cellCount");
		assert.strictEqual(oInfo.header, 1, "header");

		assert.ok(oExtension._oLastFocusedCellInfo === oInfo, "LastFocusedCellInfo stored");
	});

	QUnit.module("Misc", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Silent Focus", function(assert) {
		const oDelegate = {
			onfocusin: function(oEvent) {
				assert.ok(oEvent.isMarked("sapUiTableIgnoreFocusIn"), "Focus Event is marked to be ignored");
			}
		};
		oTable.addEventDelegate(oDelegate);
		assert.expect(1);
		const oExtension = oTable._getKeyboardExtension();
		oExtension.setSilentFocus(getCell(0, 0));
		oTable.removeEventDelegate(oDelegate);
	});

	QUnit.test("Resize Bar", function(assert) {
		const oDelegate = {
			onfocusin: function(oEvent) {
				assert.ok(false, "The resize bar should not get focus");
			}
		};
		oTable.addEventDelegate(oDelegate);
		assert.expect(0);
		qutils.triggerMouseEvent(oTable.$("rsz"), "click");
		oTable.removeEventDelegate(oDelegate);
	});

	QUnit.test("Action Mode", function(assert) {
		const oControl = new TestControl();
		const oExtension = ExtensionBase.enrich(oControl, KeyboardExtension);

		oExtension._delegate = {
			enterActionMode: sinon.stub(),
			leaveActionMode: sinon.spy()
		};

		function resetSpies() {
			oExtension._delegate.enterActionMode.resetHistory();
			oExtension._delegate.leaveActionMode.resetHistory();
		}

		assert.ok(!oExtension.isInActionMode(), "Initially not in action mode");

		oExtension._delegate.enterActionMode.returns(false);
		oExtension.setActionMode(true, true);
		assert.ok(oExtension._delegate.enterActionMode.calledOnceWithExactly(), "enterActionMode called once with the correct arguments");
		assert.ok(oExtension._delegate.leaveActionMode.notCalled, "leaveActionMode not called");
		assert.notOk(oExtension.isInActionMode(), "Action mode state");

		resetSpies();
		oExtension._delegate.enterActionMode.returns(true);
		oExtension.setActionMode(true, "test");
		assert.ok(oExtension._delegate.enterActionMode.calledOnceWithExactly(), "enterActionMode called once with the correct arguments");
		assert.ok(oExtension.isInActionMode(), "Action mode state");

		resetSpies();
		oExtension._delegate.enterActionMode.returns(false);
		oExtension.setActionMode(true);
		assert.ok(oExtension._delegate.enterActionMode.notCalled, "enterActionMode not called if already in action mode");
		assert.ok(oExtension.isInActionMode(), "Action mode state");

		resetSpies();
		oExtension.setActionMode(false, true);
		assert.ok(oExtension._delegate.leaveActionMode.calledOnceWithExactly(true), "leaveActionMode called once with the correct arguments");
		assert.ok(oExtension._delegate.enterActionMode.notCalled, "enterActionMode not called");
		assert.notOk(oExtension.isInActionMode(), "Action mode state");

		resetSpies();
		oExtension.setActionMode(false);
		assert.ok(oExtension._delegate.leaveActionMode.notCalled, "leaveActionMode not called if already not in action mode");
		assert.notOk(oExtension.isInActionMode(), "Action mode state");

		resetSpies();
		oExtension._delegate.enterActionMode.returns(true);
		oExtension.setActionMode(true);
		oExtension.setActionMode(false, false);
		assert.ok(oExtension._delegate.leaveActionMode.calledOnceWithExactly(false), "leaveActionMode called once with the correct arguments");
		assert.notOk(oExtension.isInActionMode(), "Action mode state");

		resetSpies();
		oExtension.setActionMode(true);
		oExtension.setActionMode(false, "test");
		assert.ok(oExtension._delegate.leaveActionMode.calledOnceWithExactly(false), "leaveActionMode called once with the correct arguments");
		assert.notOk(oExtension.isInActionMode(), "Action mode state");

		oControl.destroy();
	});

	QUnit.module("Focus handling", {
		beforeEach: async function() {
			createTables();
			oTable.addColumn(TableQUnitUtils.createInputColumn({text: "test3"}));
			await nextUIUpdate();
		},
		afterEach: function() {
			destroyTables();
		},
		addCreationRow: async function() {
			oTable.addColumn(TableQUnitUtils.createTextColumn({text: "test"}).setCreationTemplate(
				new TestControl({text: "test"})
			));
			oTable.addColumn(TableQUnitUtils.createTextColumn({text: "test2"}).setCreationTemplate(
				new TableQUnitUtils.TestInputControl({text: "test2"})
			));
			oTable.setCreationRow(new CreationRow());
			await nextUIUpdate();
		}
	});

	QUnit.test("Overlay / NoData focus handling", function(assert) {
		const done = assert.async();

		function doAfterNoDataDisplayed() {
			assert.strictEqual(document.activeElement, oTable.getDomRef("overlay"), "focus is still on overlay after no data is displayed");
			oTable.setShowOverlay(false);
			const oElem = getColumnHeader(0);
			assert.equal(document.activeElement, oElem.get(0), "focus is on first column header after the overlay disappeared");
			done();
		}

		function containsOrHasFocus(oTable, sIdSuffix) {
			return containsOrEquals(oTable.getDomRef(sIdSuffix), document.activeElement);
		}

		assert.ok(!containsOrHasFocus(oTable), "focus is not on the table before setShowOverlay");
		oTable.setShowOverlay(true);
		assert.ok(!containsOrHasFocus(oTable), "focus is not on the table after setShowOverlay");
		oTable.focus();
		assert.strictEqual(document.activeElement, oTable.getDomRef("overlay"), "focus is on overlay after focus");
		oTable.attachEventOnce("rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Restore focus position after overlay", async function(assert) {
		let $Cell = getCell(1, 1, true);

		await this.addCreationRow();

		oTable.setShowOverlay(true);
		assert.strictEqual(document.activeElement, oTable.getDomRef("overlay"), "focus is on overlay");
		oTable.setShowOverlay(false);
		assert.strictEqual(document.activeElement, $Cell[0], "focus is restored on the data cell");

		oTable.setShowOverlay(true);
		assert.strictEqual(document.activeElement, oTable.getDomRef("overlay"), "focus is on overlay");
		oTable.getColumns()[1].destroy();
		oTable.setShowOverlay(false);
		assert.strictEqual(document.activeElement, $Cell[0], "focus is restored on the data cell");

		const $Input = TableUtils.getFirstInteractiveElement(oTable.getCreationRow());
		oTable.getCreationRow().resetFocus();
		oTable.setShowOverlay(true);
		assert.strictEqual(document.activeElement, oTable.getDomRef("overlay"), "focus is on overlay");
		oTable.setShowOverlay(false);
		assert.ok(window.checkFocus($Input, assert),
			"focus is restored on the interactive element in the CreationRow");

		$Cell = getCell(1, 5);
		TableUtils.getInteractiveElements($Cell)[0].focus();
		oTable.setShowOverlay(true);
		assert.strictEqual(document.activeElement, oTable.getDomRef("overlay"), "focus is on overlay");
		oTable.setShowOverlay(false);
		assert.ok(window.checkFocus($Cell, assert), "focus is restored on the data cell");
	});

	QUnit.test("Restore focus position after noData", function(assert) {
		const done = assert.async();
		const oModel = oTable.getModel();
		const $Cell = getCell(1, 1, true);

		function onRowsUpdated() {
			if (TableUtils.isNoDataVisible(oTable)) {
				assert.strictEqual(document.activeElement, oTable.getDomRef("noDataCnt"), "focus is on no data");
				oTable.setModel(oModel);
			} else {
				assert.strictEqual(document.activeElement, $Cell[0], "focus is restored on the data cell");
				oTable.detachRowsUpdated(onRowsUpdated);
				done();
			}
		}

		oTable.attachRowsUpdated(onRowsUpdated);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Restore focus position after noData when column has been removed", function(assert) {
		const done = assert.async();
		const oModel = oTable.getModel();
		const $Cell = getCell(1, 1, true);

		function onRowsUpdated() {
			if (TableUtils.isNoDataVisible(oTable)) {
				assert.strictEqual(document.activeElement, oTable.getDomRef("noDataCnt"), "focus is on no data");
				oTable.getColumns()[0].destroy();
				oTable.setModel(oModel);
			} else {
				assert.strictEqual(document.activeElement, $Cell[0], "focus is restored on the data cell");
				oTable.detachRowsUpdated(onRowsUpdated);
				done();
			}
		}

		oTable.attachRowsUpdated(onRowsUpdated);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Restore focus position after noData when focus has been on the cell content", function(assert) {
		const done = assert.async();
		const oModel = oTable.getModel();

		const $Cell = getCell(1, 5);
		TableUtils.getInteractiveElements($Cell)[0].focus();

		function onRowsUpdated() {
			if (TableUtils.isNoDataVisible(oTable)) {
				assert.strictEqual(document.activeElement, oTable.getDomRef("noDataCnt"), "focus is on no data");
				oTable.setModel(oModel);
			} else {
				assert.strictEqual(document.activeElement, $Cell[0], "focus is restored on the data cell");
				oTable.detachRowsUpdated(onRowsUpdated);
				done();
			}
		}

		setTimeout(function() {
			oTable.attachRowsUpdated(onRowsUpdated);
			oTable.setModel(new JSONModel());
		}, 200);
	});

	QUnit.test("NoData focus handling with CreationRow", async function(assert) {
		const done = assert.async();
		const oModel = oTable.getModel();

		await this.addCreationRow();

		function onRowsUpdated() {
			if (TableUtils.isNoDataVisible(oTable)) {
				assert.ok(window.checkFocus($Input, assert),
					"focus stays on the interactive element in the CreationRow");
				oTable.setModel(oModel);
			} else {
				assert.ok(window.checkFocus($Input, assert),
					"focus stays on the interactive element in the CreationRow");
				oTable.detachRowsUpdated(onRowsUpdated);
				done();
			}
		}

		const $Input = TableUtils.getFirstInteractiveElement(oTable.getCreationRow());
		oTable.getCreationRow().resetFocus();
		oTable.attachRowsUpdated(onRowsUpdated);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Focus restoration and item navigation reinitialization", async function(assert) {
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		const oKeyboardExtension = oTable._getKeyboardExtension();
		const aTestElementIds = [
			getCell(0, 0)[0].id,
			getColumnHeader(0)[0].id,
			getRowHeader(0)[0].id,
			getRowAction(0)[0].id,
			getSelectAll()[0].id
		];
		const oOnFocusInSpy = sinon.spy();

		oTable.addEventDelegate({
			onfocusin: oOnFocusInSpy
		});

		oKeyboardExtension._debug();
		const oInitItemNavigationSpy = sinon.spy(oKeyboardExtension._ExtensionHelper, "_initItemNavigation");

		await aTestElementIds.reduce(async function(acc, sId) {
			await acc;

			document.getElementById(sId).focus();

			oInitItemNavigationSpy.resetHistory();
			oOnFocusInSpy.resetHistory();
			oTable.invalidate();
			await nextUIUpdate();

			assert.ok(oInitItemNavigationSpy.calledOnce, "Re-rendered when focus was on " + sId + ": The item navigation was reinitialized");
			assert.strictEqual(document.activeElement.id, sId, "Re-rendered when focus was on " + sId + ": The correct element is focused");
			assert.ok(oOnFocusInSpy.callCount <= 1,
				"Re-rendered when focus was on " + sId + ": The onfocusin event was not triggered more than once");

			oInitItemNavigationSpy.resetHistory();
			oOnFocusInSpy.resetHistory();
			oTable.getRowMode().renderTableRows();

			assert.ok(oInitItemNavigationSpy.calledOnce, "Re-rendered rows when focus was on " + sId + ": The item navigation was reinitialized");
			assert.strictEqual(document.activeElement.id, sId, "Re-rendered rows when focus was on " + sId + ": The correct element is focused");
			assert.ok(oOnFocusInSpy.callCount <= 1,
				"Re-rendered rows when focus was on " + sId + ": The onfocusin event was not triggered more than once");
		}, Promise.resolve());

		// Focus a cell in the TreeTable to check if the Table steals the focus.
		const oFocusedElement = getCell(0, 0, true, null, oTreeTable)[0];

		oInitItemNavigationSpy.resetHistory();
		const oInvalidateItemNavigationSpy = sinon.spy(oKeyboardExtension, "invalidateItemNavigation");
		oOnFocusInSpy.resetHistory();
		oTable.invalidate();
		await nextUIUpdate();

		assert.ok(oInitItemNavigationSpy.notCalled,
			"Re-rendered when focus was on an element outside the table: The item navigation was not reinitialized");
		assert.ok(oInvalidateItemNavigationSpy.calledOnce,
			"Re-rendered when focus was on an element outside the table: The item navigation was invalidated");
		assert.strictEqual(document.activeElement.id, oFocusedElement.id,
			"Re-rendered when focus was on an element outside the table: The correct element is focused");
		assert.ok(oOnFocusInSpy.notCalled,
			"Re-rendered when focus was on an element outside the table: The onfocusin event was not triggered");

		oInitItemNavigationSpy.resetHistory();
		oInvalidateItemNavigationSpy.resetHistory();
		oTable.getRowMode().renderTableRows();

		assert.ok(oInitItemNavigationSpy.notCalled,
			"Re-rendered rows when focus was on an element outside the table: The item navigation was not reinitialized");
		assert.ok(oInvalidateItemNavigationSpy.calledOnce,
			"Re-rendered rows when focus was on an element outside the table: The item navigation was invalidated");
		assert.strictEqual(document.activeElement.id, oFocusedElement.id,
			"Re-rendered rows when focus was on an element outside the table: The correct element is focused");
		assert.ok(oOnFocusInSpy.notCalled,
			"Re-rendered when focus was on an element outside the table: The onfocusin event was not triggered");
	});

	QUnit.test("Focus restoration after data update (DataCell -> NoData -> previously focused DataCell)", function(assert) {
		const done = assert.async();
		const oCell = oTable.getRows()[0].getDomRef("col0");
		const oModel = new JSONModel({modelData: oTable.getModel().getData()});

		oCell.focus();
		oTable.setModel(new JSONModel());

		oTable.attachEventOnce("rowsUpdated", function() {
			assert.strictEqual(document.activeElement.id, oTable.getDomRef("noDataCnt").id, "Focus on NoData");

			oTable.setModel(oModel);
			oTable.bindRows("/modelData");

			oTable.attachEventOnce("rowsUpdated", function() {
				assert.strictEqual(document.activeElement.id, oCell.id, "2nd focus on cell");
				done();
			});
		});
	});

	QUnit.test("Focus restoration after unbind and then bind (DataCell -> NoData -> previously focused DataCell)", function(assert) {
		const done = assert.async();
		const oCell = oTable.getRows()[0].getDomRef("col0");
		const oModel = new JSONModel({modelData: oTable.getModel().getData()});

		oCell.focus();
		oTable.unbindRows();

		oTable.attachEventOnce("rowsUpdated", function() {
			assert.strictEqual(document.activeElement.id, oTable.getDomRef("noDataCnt").id, "Focus on NoData");

			oTable.setModel(oModel);
			oTable.bindRows("/modelData");

			oTable.attachEventOnce("rowsUpdated", function() {
				assert.strictEqual(document.activeElement.id, oCell.id, "2nd focus on cell");
				done();
			});
		});
	});
});