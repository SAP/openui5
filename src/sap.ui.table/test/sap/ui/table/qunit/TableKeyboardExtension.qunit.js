/*global QUnit, oTable */

sap.ui.require([
	"sap/ui/qunit/QUnitUtils"
], function(qutils) {
	"use strict";

	// mapping of global function calls
	var oModel = window.oModel;
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var iNumberOfCols = window.iNumberOfCols;
	var setFocusOutsideOfTable = window.setFocusOutsideOfTable;

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
		setFocusOutsideOfTable(assert);
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
		var oExtension = sap.ui.table.TableExtension.enrich(new sap.ui.table.Table(), sap.ui.table.TableKeyboardExtension);
		assert.ok(!oExtension._itemNavigation, "Item Navigation not yet initialized");
		oExtension.initItemNavigation();
		assert.ok(oExtension._itemNavigation, "Item Navigation initialized on focus");
		oExtension.destroy();
		assert.ok(!oExtension._itemNavigation, "Item Navigation not available anymore after destroy");
	});

	QUnit.test("invalidation", function(assert) {
		var oExtension = oTable._getKeyboardExtension();
		assert.ok(oExtension._itemNavigationInvalidated, "Item Navigation invalid due to intial rendering");
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
		var oControl = new sap.ui.table.test.TestControl();
		var oExtension = sap.ui.table.TableExtension.enrich(oControl, sap.ui.table.TableKeyboardExtension);
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
		assert.strictEqual(oInfo.cell, iNumberOfCols + 2 /* 2* row header*/, "cell");
		assert.strictEqual(oInfo.row, 1, "row");
		assert.strictEqual(oInfo.columnCount, iNumberOfCols + 1 /*row header*/, "columnCount");
		assert.strictEqual(oInfo.cellInRow, 1, "cellInRow");
		assert.strictEqual(oInfo.cellCount, (iNumberOfCols + 1) * (3 /*visible rows*/ + 1), "cellCount");
		assert.strictEqual(oInfo.header, 1, "header");

		assert.ok(!oExtension._oLastFocusedCellInfo, "No LastFocusedCellInfo stored");

		getCell(1, 2, true, assert);

		oInfo = oExtension._getLastFocusedCellInfo();
		assert.strictEqual(oInfo.cell, 2 * (iNumberOfCols + 1) + 3, "cell");
		assert.strictEqual(oInfo.row, 2, "row");
		assert.strictEqual(oInfo.columnCount, iNumberOfCols + 1 /*row header*/, "columnCount");
		assert.strictEqual(oInfo.cellInRow, 3, "cellInRow");
		assert.strictEqual(oInfo.cellCount, (iNumberOfCols + 1) * (3 /*visible rows*/ + 1), "cellCount");
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

		var oControl = new sap.ui.table.test.TestControl();
		var oExtension = sap.ui.table.TableExtension.enrich(oControl, sap.ui.table.TableKeyboardExtension);
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
		assert.strictEqual((new sap.ui.table.TreeTable())._getKeyboardExtension()._getTableType(),
			sap.ui.table.TableExtension.TABLETYPES.TREE, "TREE");
		assert.strictEqual((new sap.ui.table.Table())._getKeyboardExtension()._getTableType(),
			sap.ui.table.TableExtension.TABLETYPES.STANDARD, "STANDARD");
		assert.strictEqual((new sap.ui.table.AnalyticalTable())._getKeyboardExtension()._getTableType(),
			sap.ui.table.TableExtension.TABLETYPES.ANALYTICAL, "ANALYTICAL");
	});

	QUnit.test("Overly / NoData focus handling", function(assert) {
		var done = assert.async();

		function containsOrHasFocus(sIdSuffix) {
			return jQuery.sap.containsOrEquals(oTable.getDomRef(sIdSuffix), document.activeElement);
		}

		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			assert.ok(containsOrHasFocus("overlay"), "focus is still on overlay after no data is displayed");
			oTable.setShowOverlay(false);
			assert.ok(containsOrHasFocus("noDataCnt"), "focus is on noData container after overlay dissappeared");

			oTable.attachEvent("_rowsUpdated", doAfterNoDataIsHidden);
			oTable.setModel(oModel);
		}

		function doAfterNoDataIsHidden() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataIsHidden);
			var oElem = getColumnHeader(0);
			assert.ok(oElem.length && oElem.get(0) === document.activeElement, "focus is on first column header after no Data dissappeared");
			done();
		}

		assert.ok(!containsOrHasFocus(), "focus is not on the table before setShowOverlay");
		oTable.setShowOverlay(true);
		assert.ok(!containsOrHasFocus(), "focus is not on the table after setShowOverlay");
		oTable.focus();
		assert.ok(containsOrHasFocus("overlay"), "focus is on overlay after focus");
		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.test("IEFocusOutlineWorkaround", function(assert) {
		var bOriginalMSIE = sap.ui.Device.browser.msie;

		sap.ui.Device.browser.msie = false;
		var $Cell = getCell(0, 0);
		assert.ok(!$Cell.attr("data-sap-ui-table-focus"), "'data-sap-ui-table-focus' attribute not set");
		$Cell.focus();
		assert.ok(!$Cell.attr("data-sap-ui-table-focus"), "'data-sap-ui-table-focus' attribute not set");
		getCell(0, 1, true, assert); // Put focus somewhere else

		sap.ui.Device.browser.msie = true;
		$Cell = getCell(0, 0);
		assert.ok(!$Cell.attr("data-sap-ui-table-focus"), "'data-sap-ui-table-focus' attribute not set");
		$Cell.focus();
		var sValue1 = $Cell.attr("data-sap-ui-table-focus");
		assert.ok(!!sValue1, "'data-sap-ui-table-focus' attribute set");
		getCell(0, 1, true, assert);
		$Cell = getCell(0, 0);
		$Cell.focus();
		var sValue2 = $Cell.attr("data-sap-ui-table-focus");
		assert.ok(!!sValue2, "'data-sap-ui-table-focus' attribute set");
		assert.ok(sValue1 != sValue2, "'data-sap-ui-table-focus' attribute value changed");
		assert.ok(jQuery("head").text().indexOf(".sapUiTableStatic[data-sap-ui-table-focus]") >= 0, "Style set");

		sap.ui.Device.browser.msie = bOriginalMSIE;
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