//************************************************************************
// Preparation Code
//************************************************************************

createTables();


//************************************************************************
// Test Code
//************************************************************************

sap.ui.test.qunit.delayTestStart(500);


QUnit.module("Initialization");

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
	setFocusOutsideOfTable();
});


QUnit.module("Item Navigation");


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
	assert.ok(!oExtension._itemNavigationInvalidated, "Item Navigation not invalid");
	oExtension.invalidateItemNavigation();
	assert.ok(oExtension._itemNavigationInvalidated, "Item Navigation invalid");
	oExtension.initItemNavigation();
	assert.ok(!oExtension._itemNavigationInvalidated, "Item Navigation not invalid");
});

var aEvents = ["focusin", "sapfocusleave", "mousedown", "sapnext", "sapnextmodifiers", "sapprevious", "sappreviousmodifiers",
				"sappageup", "sappagedown", "saphome", "saphomemodifiers", "sapend", "sapendmodifiers", "sapkeyup"];

function setupItemNavigationFakeTest() {
	var oControl = new TestControl();
	var oExtension = sap.ui.table.TableExtension.enrich(oControl, sap.ui.table.TableKeyboardExtension);
	oExtension._itemNavigation = {destroy : function() {}};
	for (var i = 0; i < aEvents.length; i++) {
		oExtension._itemNavigation["on" + aEvents[i]] = function(oEvent) { ok(true, oEvent.type + " reached ItemNavigation"); };
	}
	oControl.removeEventDelegate(oExtension._delegate);
	return oControl;
}

QUnit.test("ItemNavigationDelegate", function(assert) {
	var oControl = setupItemNavigationFakeTest();

	assert.expect(14);
	for (var i = 0; i < aEvents.length; i++) {
		oControl._handleEvent(jQuery.Event(aEvents[i]));
	}

	oControl._getKeyboardExtension().destroy();
});

QUnit.test("Suspend / Resume", function(assert) {
	var oControl = setupItemNavigationFakeTest();

	oControl._getKeyboardExtension()._suspendItemNavigation();

	assert.expect(14);

	for (var i = 0; i < aEvents.length; i++) {
		oControl._handleEvent(jQuery.Event(aEvents[i]));
	}

	oControl._getKeyboardExtension()._resumeItemNavigation();

	for (var i = 0; i < aEvents.length; i++) {
		oControl._handleEvent(jQuery.Event(aEvents[i]));
	}

	oControl._getKeyboardExtension().destroy();
});

QUnit.test("Marked Event", function(assert) {
	var oControl = setupItemNavigationFakeTest();

	assert.expect(14);

	for (var i = 0; i < aEvents.length; i++) {
		var oEvent = jQuery.Event(aEvents[i]);
		oEvent.setMarked("sapUiTableSkipItemNavigation");
		oControl._handleEvent(oEvent);
	}

	for (var i = 0; i < aEvents.length; i++) {
		oControl._handleEvent(jQuery.Event(aEvents[i]));
	}

	oControl._getKeyboardExtension().destroy();
});

QUnit.test("Stored Focus Position", function(assert) {
	var oExtension = oTable._getKeyboardExtension();
	oExtension._oLastFocusedCellInfo = null;

	var oInfo = oExtension._getLastFocusedCellInfo();
	assert.strictEqual(oInfo.cell, iNumberOfCols + 2 /* 2* row header*/, "cell");
	assert.strictEqual(oInfo.row, 1, "row");
	assert.strictEqual(oInfo.columnCount, iNumberOfCols + 1 /*row header*/, "columnCount");
	assert.strictEqual(oInfo.cellInRow, 1, "cellInRow");
	assert.strictEqual(oInfo.cellCount, (iNumberOfCols + 1) * (3 /*visible rows*/ + 1), "cellCount");
	assert.strictEqual(oInfo.header, 1, "header");

	ok(!oExtension._oLastFocusedCellInfo, "No LastFocusedCellInfo stored");

	getCell(1, 2, true, assert);

	oInfo = oExtension._getLastFocusedCellInfo();
	assert.strictEqual(oInfo.cell, 2 * (iNumberOfCols + 1) + 3, "cell");
	assert.strictEqual(oInfo.row, 2, "row");
	assert.strictEqual(oInfo.columnCount, iNumberOfCols + 1 /*row header*/, "columnCount");
	assert.strictEqual(oInfo.cellInRow, 3, "cellInRow");
	assert.strictEqual(oInfo.cellCount, (iNumberOfCols + 1) * (3 /*visible rows*/ + 1), "cellCount");
	assert.strictEqual(oInfo.header, 1, "header");

	ok(oExtension._oLastFocusedCellInfo === oInfo, "LastFocusedCellInfo stored");
});


QUnit.module("Misc");


QUnit.test("Silent Focus", function(assert) {
	var oDelegate = {
		onfocusin : function(oEvent) {
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
		onfocusin : function(oEvent) {
			assert.ok(oEvent.isMarked("sapUiTableSkipItemNavigation"), "Focus Event is marked to be ignored by the item navigation");
		}
	};
	oTable.addEventDelegate(oDelegate);
	assert.expect(1);
	jQuery.sap.domById(oTable.getId() + "-rsz").focus();
	oTable.removeEventDelegate(oDelegate);
});


QUnit.test("Action Mode", function(assert) {
	var oTestArgs = {};
	var bSkipActionMode = false;
	var bTestArguments = true;
	var bHandlerCalled = false;

	function testHandler (oArgs) {
		assert.ok(!!oArgs, "Arguments given");
		if (bTestArguments) {
			assert.strictEqual(oArgs, oTestArgs, "Arguments forwarded as expected");
		}
		bHandlerCalled = true;
	};

	var oControl = new TestControl();
	var oExtension = sap.ui.table.TableExtension.enrich(oControl, sap.ui.table.TableKeyboardExtension);
	oExtension._delegate = {
		enterActionMode : function(oArgs) {
			testHandler(oArgs);
			return !bSkipActionMode;
		},
		leaveActionMode : testHandler
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


QUnit.module("Destruction");


QUnit.test("destroy()", function(assert) {
	var oExtension = oTable._getKeyboardExtension();
	oTable.destroy();
	assert.ok(!oExtension.getTable(), "Table cleared");
	assert.ok(!oExtension._itemNavigation, "Item Navigation cleared");
	assert.ok(!oExtension._delegate, "Delegate cleared");
});