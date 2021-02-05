/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/table/extensions/ExtensionBase",
	"sap/ui/table/extensions/Keyboard",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(TableQUnitUtils, TableUtils, qutils, Table, TreeTable, AnalyticalTable, containsOrEquals, ExtensionBase, KeyboardExtension, JSONModel, Device) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var initRowActions = window.initRowActions;

	var TestControl = TableQUnitUtils.TestControl;

	QUnit.module("Initialization", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("init()", function(assert) {
		var oExtension = oTable._getKeyboardExtension();
		assert.ok(!!oExtension, "Keyboard Extension available");
		assert.ok(!oExtension._itemNavigation, "Item Navigation not yet initialized");

		var iCount = 0;
		for (var i = 0; i < oTable.aDelegates.length; i++) {
			if (oTable.aDelegates[i].oDelegate === oExtension._delegate) {
				iCount++;
			}
		}
		assert.ok(iCount == 1, "Keyboard Delegate registered");

		getCell(0, 0, true, assert);
		assert.ok(oExtension._itemNavigation, "Item Navigation initialized on focus");
		TableQUnitUtils.setFocusOutsideOfTable(assert);
	});

	QUnit.test("_debug()", function(assert) {
		var oExtension = oTable._getKeyboardExtension();
		assert.ok(!oExtension._ExtensionHelper, "No debug mode");
		oExtension._debug();
		assert.ok(!!oExtension._ExtensionHelper, "Debug mode");
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
		var oExtension = ExtensionBase.enrich(new Table(), KeyboardExtension);
		assert.ok(!oExtension._itemNavigation, "Item Navigation not yet initialized");
		oExtension.initItemNavigation();
		assert.ok(oExtension._itemNavigation, "Item Navigation initialized on focus");
		oExtension.destroy();
		assert.ok(!oExtension._itemNavigation, "Item Navigation not available anymore after destroy");
	});

	QUnit.test("invalidation", function(assert) {
		var oExtension = oTable._getKeyboardExtension();
		assert.ok(oExtension._itemNavigationInvalidated, "Item Navigation invalid due to initial rendering");
		oExtension.initItemNavigation();
		assert.ok(!oExtension._itemNavigationInvalidated, "Item Navigation not invalid after initItemNavigation");
		oExtension.invalidateItemNavigation();
		assert.ok(oExtension._itemNavigationInvalidated, "Item Navigation invalid after invalidateItemNavigation");
	});

	var aEvents = [
		"focusin", "sapfocusleave", "mousedown", "sapnext", "sapnextmodifiers", "sapprevious", "sappreviousmodifiers",
		"sappageup", "sappagedown", "saphome", "saphomemodifiers", "sapend", "sapendmodifiers", "sapkeyup"
	];

	function setupItemNavigationFakeTest(assert) {
		var oControl = new TestControl();
		var oExtension = ExtensionBase.enrich(oControl, KeyboardExtension);
		oExtension._itemNavigation = {
			destroy: function() {
			}
		};
		/* eslint-disable no-loop-func */
		for (var i = 0; i < aEvents.length; i++) {
			oExtension._itemNavigation["on" + aEvents[i]] = function(oEvent) {
				assert.ok(true, oEvent.type + " reached ItemNavigation");
			};
		}
		/* eslint-enable no-loop-func */
		oControl.removeEventDelegate(oExtension._delegate);
		return oControl;
	}

	QUnit.test("ItemNavigationDelegate", function(assert) {
		var oControl = setupItemNavigationFakeTest(assert);

		assert.expect(14);
		for (var i = 0; i < aEvents.length; i++) {
			/*eslint-disable new-cap */
			oControl._handleEvent(jQuery.Event(aEvents[i]));
			/*eslint-enable new-cap */
		}

		oControl._getKeyboardExtension().destroy();
	});

	QUnit.test("Suspend / Resume", function(assert) {
		var oControl = setupItemNavigationFakeTest(assert);
		var i;

		oControl._getKeyboardExtension()._suspendItemNavigation();

		assert.expect(14);

		for (i = 0; i < aEvents.length; i++) {
			/*eslint-disable new-cap */
			oControl._handleEvent(jQuery.Event(aEvents[i]));
			/*eslint-enable new-cap */
		}

		oControl._getKeyboardExtension()._resumeItemNavigation();

		for (i = 0; i < aEvents.length; i++) {
			/*eslint-disable new-cap */
			oControl._handleEvent(jQuery.Event(aEvents[i]));
			/*eslint-enable new-cap */
		}

		oControl._getKeyboardExtension().destroy();
	});

	QUnit.test("Marked Event", function(assert) {
		var oControl = setupItemNavigationFakeTest(assert);
		var i;

		assert.expect(14);

		for (i = 0; i < aEvents.length; i++) {
			/*eslint-disable new-cap */
			var oEvent = jQuery.Event(aEvents[i]);
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
		var oExtension = oTable._getKeyboardExtension();
		oExtension._oLastFocusedCellInfo = null;
		oExtension.initItemNavigation();

		var oInfo = oExtension._getLastFocusedCellInfo();
		assert.strictEqual(oInfo.cell, oTable.columnCount + 2 /* 2* row header*/, "cell");
		assert.strictEqual(oInfo.row, 1, "row");
		assert.strictEqual(oInfo.columnCount, oTable.columnCount + 1 /*row header*/, "columnCount");
		assert.strictEqual(oInfo.cellInRow, 1, "cellInRow");
		assert.strictEqual(oInfo.cellCount, (oTable.columnCount + 1) * (3 /*visible rows*/ + 1), "cellCount");
		assert.strictEqual(oInfo.header, 1, "header");

		assert.ok(!oExtension._oLastFocusedCellInfo, "No LastFocusedCellInfo stored");

		getCell(1, 2, true, assert);

		oInfo = oExtension._getLastFocusedCellInfo();
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
		var oDelegate = {
			onfocusin: function(oEvent) {
				assert.ok(oEvent.isMarked("sapUiTableIgnoreFocusIn"), "Focus Event is marked to be ignored");
			}
		};
		oTable.addEventDelegate(oDelegate);
		assert.expect(1);
		var oExtension = oTable._getKeyboardExtension();
		oExtension._setSilentFocus(getCell(0, 0));
		oTable.removeEventDelegate(oDelegate);
	});

	QUnit.test("Resize Bar", function(assert) {
		var oDelegate = {
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
		var oTestArgs = {};
		var bSkipActionMode = false;
		var bTestArguments = true;
		var bHandlerCalled = false;

		function testHandler(oArgs) {
			assert.ok(!!oArgs, "Arguments given");
			if (bTestArguments) {
				assert.strictEqual(oArgs, oTestArgs, "Arguments forwarded as expected");
			}
			bHandlerCalled = true;
		}

		var oControl = new TestControl();
		var oExtension = ExtensionBase.enrich(oControl, KeyboardExtension);
		oExtension._delegate = {
			enterActionMode: function(oArgs) {
				testHandler(oArgs);
				return !bSkipActionMode;
			},
			leaveActionMode: testHandler
		};

		assert.ok(!oExtension.isInActionMode(), "Initially no action mode");

		oExtension.setActionMode(true, oTestArgs);
		assert.ok(bHandlerCalled, "enterActionMode called");
		assert.ok(oExtension.isInActionMode(), "Switched to action mode");
		bHandlerCalled = false;

		bTestArguments = false;
		oExtension.setActionMode(true, oTestArgs);
		assert.ok(!bHandlerCalled, "enterActionMode not called after duplicate setActionMode");
		assert.ok(oExtension.isInActionMode(), "Still in action mode");
		bTestArguments = true;

		oExtension.setActionMode(false, oTestArgs);
		assert.ok(bHandlerCalled, "leaveActionMode called");
		assert.ok(!oExtension.isInActionMode(), "Switched off action mode");
		bHandlerCalled = false;

		bTestArguments = false;
		oExtension.setActionMode(false, oTestArgs);
		assert.ok(!bHandlerCalled, "leaveActionMode not called after duplicate setActionMode");
		assert.ok(!oExtension.isInActionMode(), "Still not in action mode");
		bTestArguments = true;

		bSkipActionMode = true;
		oExtension.setActionMode(true, oTestArgs);
		assert.ok(bHandlerCalled, "enterActionMode called");
		assert.ok(!oExtension.isInActionMode(), "Still not in action mode");

		oControl.destroy();
	});

	QUnit.test("Table Type", function(assert) {
		assert.strictEqual((new TreeTable())._getKeyboardExtension()._getTableType(),
			ExtensionBase.TABLETYPES.TREE, "TREE");
		assert.strictEqual((new Table())._getKeyboardExtension()._getTableType(),
			ExtensionBase.TABLETYPES.STANDARD, "STANDARD");
		assert.strictEqual((new AnalyticalTable())._getKeyboardExtension()._getTableType(),
			ExtensionBase.TABLETYPES.ANALYTICAL, "ANALYTICAL");
	});

	function containsOrHasFocus(oTable, sIdSuffix) {
		return containsOrEquals(oTable.getDomRef(sIdSuffix), document.activeElement);
	}

	QUnit.test("Overlay / NoData focus handling", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			assert.ok(containsOrHasFocus(oTable, "overlay"), "focus is still on overlay after no data is displayed");
			oTable.setShowOverlay(false);
			var oElem = getColumnHeader(0);
			assert.equal(document.activeElement, oElem.get(0), "focus is on first column header after the overlay disappeared");
			done();
		}

		assert.ok(!containsOrHasFocus(oTable), "focus is not on the table before setShowOverlay");
		oTable.setShowOverlay(true);
		assert.ok(!containsOrHasFocus(oTable), "focus is not on the table after setShowOverlay");
		oTable.focus();
		assert.ok(containsOrHasFocus(oTable, "overlay"), "focus is on overlay after focus");
		oTable.attachEventOnce("rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	function addCreationRow(oTable) {
		oTable.addColumn(new sap.ui.table.Column({
			id: "column1",
			template: new TestControl({text: "test"})
		}).setCreationTemplate(new TestControl({text: "test"})));

		oTable.addColumn(new sap.ui.table.Column({
			id: "column2",
			template: new TestControl({text: "test2"})
		}).setCreationTemplate(new TableQUnitUtils.TestInputControl({text: "test2"})));

		oTable.setCreationRow(new sap.ui.table.CreationRow());
		sap.ui.getCore().applyChanges();
	}

	QUnit.test("Restore focus position after overlay", function(assert) {
		var $Cell = getCell(1, 1, true);

		addCreationRow(oTable);

		oTable.setShowOverlay(true);
		assert.ok(containsOrHasFocus(oTable, "overlay"), "focus is on overlay");
		oTable.setShowOverlay(false);
		assert.strictEqual(document.activeElement, $Cell[0], "focus is restored on the data cell");

		oTable.setShowOverlay(true);
		assert.ok(containsOrHasFocus(oTable, "overlay"), "focus is on overlay");
		oTable.removeColumn(oTable.getColumns()[1]);
		oTable.setShowOverlay(false);
		assert.strictEqual(document.activeElement, $Cell[0], "focus is restored on the data cell");

		var $Input = TableUtils.getFirstInteractiveElement(oTable.getCreationRow());
		oTable.getCreationRow().resetFocus();
		oTable.setShowOverlay(true);
		assert.ok(containsOrHasFocus(oTable, "overlay"), "focus is on overlay");
		oTable.setShowOverlay(false);
		assert.ok(window.checkFocus($Input, assert),
			"focus is restored on the interactive element in the CreationRow");

		oTable.addColumn(new sap.ui.table.Column({
			id: "column3",
			template: new TableQUnitUtils.TestInputControl({text: "test3"})
		}));
		sap.ui.getCore().applyChanges();

		$Cell = getCell(1, 6);
		TableUtils.getInteractiveElements($Cell)[0].focus();
		oTable.setShowOverlay(true);
		assert.ok(containsOrHasFocus(oTable, "overlay"), "focus is on overlay");
		oTable.setShowOverlay(false);
		assert.ok(window.checkFocus($Cell, assert),
			"focus is restored on the data cell");
	});

	QUnit.test("Restore focus position after noData", function(assert) {
		var done = assert.async();
		var oModel = oTable.getModel();
		var $Cell = getCell(1, 1, true);

		function onRowsUpdated() {
			if (TableUtils.isNoDataVisible(oTable)) {
				assert.ok(containsOrHasFocus(oTable,"noDataCnt"), "focus is on no data");
				oTable.setModel(oModel);
			} else {
				assert.strictEqual(document.activeElement, $Cell[0], "focus is restored on the data cell");
				oTable.detachRowsUpdated();
				done();
			}
		}

		oTable.attachRowsUpdated(onRowsUpdated);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Restore focus position after noData when column has been removed", function(assert) {
		var done = assert.async();
		var oModel = oTable.getModel();
		var $Cell = getCell(1, 1, true);

		function onRowsUpdated() {
			if (TableUtils.isNoDataVisible(oTable)) {
				assert.ok(containsOrHasFocus(oTable,"noDataCnt"), "focus is on no data");
				oTable.removeColumn(oTable.getColumns()[0]);
				oTable.setModel(oModel);
			} else {
				assert.strictEqual(document.activeElement, $Cell[0], "focus is restored on the data cell");
				oTable.detachRowsUpdated();
				done();
			}
		}

		oTable.attachRowsUpdated(onRowsUpdated);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Restore focus position after noData when focus has been on the cell content", function(assert) {
		var done = assert.async();
		var oModel = oTable.getModel();

		oTable.addColumn(new sap.ui.table.Column({
			id: "column3",
			template: new TableQUnitUtils.TestInputControl({text: "test3"})
		}));
		sap.ui.getCore().applyChanges();

		var $Cell = getCell(1, 5);
		TableUtils.getInteractiveElements($Cell)[0].focus();

		function onRowsUpdated() {
			if (TableUtils.isNoDataVisible(oTable)) {
				assert.ok(containsOrHasFocus(oTable,"noDataCnt"), "focus is on no data");
				oTable.setModel(oModel);
			} else {
				assert.strictEqual(document.activeElement, $Cell[0], "focus is restored on the data cell");
				oTable.detachRowsUpdated();
				done();
			}
		}

		oTable.attachRowsUpdated(onRowsUpdated);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("NoData focus handling with CreationRow", function(assert) {
		var done = assert.async();
		var oModel = oTable.getModel();

		addCreationRow(oTable);

		function onRowsUpdated() {
			if (TableUtils.isNoDataVisible(oTable)) {
				assert.ok(window.checkFocus($Input, assert),
					"focus stays on the interactive element in the CreationRow");
				oTable.setModel(oModel);
			} else {
				assert.ok(window.checkFocus($Input, assert),
					"focus stays on the interactive element in the CreationRow");
				oTable.detachRowsUpdated();
				done();
			}
		}

		var $Input = TableUtils.getFirstInteractiveElement(oTable.getCreationRow());
		oTable.getCreationRow().resetFocus();
		oTable.attachRowsUpdated(onRowsUpdated);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("IEFocusOutlineWorkaround", function(assert) {
		var bOriginalMSIE = Device.browser.msie;

		Device.browser.msie = false;
		var $Cell = getCell(0, 0);
		assert.ok(!$Cell.attr("data-sap-ui-table-focus"), "'data-sap-ui-table-focus' attribute not set");
		$Cell.trigger("focus");
		assert.ok(!$Cell.attr("data-sap-ui-table-focus"), "'data-sap-ui-table-focus' attribute not set");
		getCell(0, 1, true, assert); // Put focus somewhere else

		Device.browser.msie = true;
		$Cell = getCell(0, 0);
		assert.ok(!$Cell.attr("data-sap-ui-table-focus"), "'data-sap-ui-table-focus' attribute not set");
		$Cell.trigger("focus");
		var sValue1 = $Cell.attr("data-sap-ui-table-focus");
		assert.ok(!!sValue1, "'data-sap-ui-table-focus' attribute set");
		getCell(0, 1, true, assert);
		$Cell = getCell(0, 0);
		$Cell.trigger("focus");
		var sValue2 = $Cell.attr("data-sap-ui-table-focus");
		assert.ok(!!sValue2, "'data-sap-ui-table-focus' attribute set");
		assert.ok(sValue1 != sValue2, "'data-sap-ui-table-focus' attribute value changed");
		assert.ok(jQuery("head").text().indexOf(".sapUiTableStatic[data-sap-ui-table-focus]") >= 0, "Style set");

		Device.browser.msie = bOriginalMSIE;
	});

	QUnit.test("Focus restoration and item navigation reinitialization", function(assert) {
		initRowActions(oTable, 1, 1);
		sap.ui.getCore().applyChanges();

		var oKeyboardExtension = oTable._getKeyboardExtension();
		var aTestElementIds = [
			getCell(0, 0)[0].id,
			getColumnHeader(0)[0].id,
			getRowHeader(0)[0].id,
			getRowAction(0)[0].id,
			getSelectAll()[0].id
		];
		var oInitItemNavigationSpy;
		var oInvalidateItemNavigationSpy;
		var oOnFocusInSpy = sinon.spy();

		oTable.addEventDelegate({
			onfocusin: oOnFocusInSpy
		});

		oKeyboardExtension._debug();
		oInitItemNavigationSpy = sinon.spy(oKeyboardExtension._ExtensionHelper, "_initItemNavigation");

		aTestElementIds.forEach(function(sId) {
			document.getElementById(sId).focus();

			oInitItemNavigationSpy.reset();
			oOnFocusInSpy.reset();
			oTable.rerender();

			assert.ok(oInitItemNavigationSpy.calledOnce, "Re-rendered when focus was on " + sId + ": The item navigation was reinitialized");
			assert.strictEqual(document.activeElement.id, sId, "Re-rendered when focus was on " + sId + ": The correct element is focused");
			assert.ok(oOnFocusInSpy.callCount <= 1,
				"Re-rendered when focus was on " + sId + ": The onfocusin event was not triggered more than once");

			oInitItemNavigationSpy.reset();
			oOnFocusInSpy.reset();
			oTable._getRowMode().renderTableRows();

			assert.ok(oInitItemNavigationSpy.calledOnce, "Re-rendered rows when focus was on " + sId + ": The item navigation was reinitialized");
			assert.strictEqual(document.activeElement.id, sId, "Re-rendered rows when focus was on " + sId + ": The correct element is focused");
			assert.ok(oOnFocusInSpy.callCount <= 1,
				"Re-rendered rows when focus was on " + sId + ": The onfocusin event was not triggered more than once");
		});

		// Focus a cell in the TreeTable to check if the Table steals the focus.
		var oFocusedElement = getCell(0, 0, true, null, oTreeTable)[0];

		oInitItemNavigationSpy.reset();
		oInvalidateItemNavigationSpy = sinon.spy(oKeyboardExtension, "invalidateItemNavigation");
		oOnFocusInSpy.reset();
		oTable.rerender();

		assert.ok(oInitItemNavigationSpy.notCalled,
			"Re-rendered when focus was on an element outside the table: The item navigation was not reinitialized");
		assert.ok(oInvalidateItemNavigationSpy.calledOnce,
			"Re-rendered when focus was on an element outside the table: The item navigation was invalidated");
		assert.strictEqual(document.activeElement.id, oFocusedElement.id,
			"Re-rendered when focus was on an element outside the table: The correct element is focused");
		assert.ok(oOnFocusInSpy.notCalled,
			"Re-rendered when focus was on an element outside the table: The onfocusin event was not triggered");

		oInitItemNavigationSpy.reset();
		oInvalidateItemNavigationSpy.reset();
		oTable._getRowMode().renderTableRows();

		assert.ok(oInitItemNavigationSpy.notCalled,
			"Re-rendered rows when focus was on an element outside the table: The item navigation was not reinitialized");
		assert.ok(oInvalidateItemNavigationSpy.calledOnce,
			"Re-rendered rows when focus was on an element outside the table: The item navigation was invalidated");
		assert.strictEqual(document.activeElement.id, oFocusedElement.id,
			"Re-rendered rows when focus was on an element outside the table: The correct element is focused");
		assert.ok(oOnFocusInSpy.notCalled,
			"Re-rendered when focus was on an element outside the table: The onfocusin event was not triggered");
	});

	QUnit.module("Destruction", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("destroy()", function(assert) {
		var oExtension = oTable._getKeyboardExtension();
		oTable.destroy();
		assert.ok(!oExtension.getTable(), "Table cleared");
		assert.ok(!oExtension._itemNavigation, "Item Navigation cleared");
		assert.ok(!oExtension._delegate, "Delegate cleared");
	});
});