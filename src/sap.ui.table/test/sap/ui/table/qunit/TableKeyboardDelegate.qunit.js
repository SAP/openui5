// Shortcuts
jQuery.sap.require("sap.ui.table.TableUtils");
var TableUtils = sap.ui.table.TableUtils;

jQuery.sap.require("sap.ui.table.TableKeyboardDelegate2");
var TableKeyboardDelegate2 = sap.ui.table.TableKeyboardDelegate2;

//************************************************************************
// Helper Functions
//************************************************************************

function checkDelegateType(sExpectedType) {
	var oTbl = new sap.ui.table.Table();
	var oExt = oTbl._getKeyboardExtension();
	var sType = oExt._delegate && oExt._delegate.getMetadata ? oExt._delegate.getMetadata().getName() : null;
	oTbl.destroy();
	return sType == sExpectedType;
}

// Checks whether the given DomRef is contained or equals (in) one of the given container
function isContained(aContainers, oRef) {
	for (var i = 0; i < aContainers.length; i++) {
		if (aContainers[i] === oRef || jQuery.contains(aContainers[i], oRef)) {
			return true;
		}
	}
	return false;
}

// Returns a jQuery object which contains all next/previous (bNext) tabbable DOM elements of the given starting point (oRef) within the given scopes (DOMRefs)
function findTabbables(oRef, aScopes, bNext) {
	var $Ref = jQuery(oRef),
		$All, $Tabbables;

	if (bNext) {
		$All = jQuery.merge($Ref.find("*"), jQuery.merge($Ref.nextAll(), $Ref.parents().nextAll()));
		$Tabbables = $All.find(':sapTabbable').addBack(':sapTabbable');
	} else {
		$All = jQuery.merge($Ref.prevAll(), $Ref.parents().prevAll());
		$Tabbables = jQuery.merge($Ref.parents(':sapTabbable'), $All.find(':sapTabbable').addBack(':sapTabbable'));
	}

	$Tabbables = jQuery.unique($Tabbables);
	return $Tabbables.filter(function() {
		return isContained(aScopes, this);
	});
}

function simulateTabEvent(oTarget, bBackward) {
	var oParams = {};
	oParams.keyCode = jQuery.sap.KeyCodes.TAB;
	oParams.which = oParams.keyCode;
	oParams.shiftKey = !!bBackward;
	oParams.altKey = false;
	oParams.metaKey = false;
	oParams.ctrlKey = false;

	if (typeof (oTarget) == "string") {
		oTarget = jQuery.sap.domById(oTarget);
	}

	var oEvent = jQuery.Event({type: "keydown"});
	for (var x in oParams) {
		oEvent[x] = oParams[x];
		oEvent.originalEvent[x] = oParams[x];
	}

	jQuery(oTarget).trigger(oEvent);

	if (oEvent.isDefaultPrevented()) {
		return;
	}

	var $Tabbables = findTabbables(document.activeElement, [jQuery.sap.domById("content")], !bBackward);
	if ($Tabbables.length) {
		$Tabbables.get(bBackward ? $Tabbables.length - 1 : 0).focus();
	}
}

function setupTest() {
	createTables(true, true);
	var oFocus = new TestControl("Focus1", {text: "Focus1", tabbable: true});
	oFocus.placeAt("content");
	oTable.placeAt("content");
	oFocus = new TestControl("Focus2", {text: "Focus2", tabbable: true});
	oFocus.placeAt("content");
	oTreeTable.placeAt("content");
	oFocus = new TestControl("Focus3", {text: "Focus3", tabbable: true});
	oFocus.placeAt("content");
	sap.ui.getCore().applyChanges();
}

function teardownTest() {
	destroyTables();
	for (var i = 1; i <= 3; i++) {
		sap.ui.getCore().byId("Focus" + i).destroy();
	}
}

/**
 * Key string constants.
 * "Arrow Left" and "Arrow Right" keys are switched in RTL mode.
 */
var Key = {
	Arrow: {
		LEFT: sap.ui.getCore().getConfiguration().getRTL() ? jQuery.sap.KeyCodes.ARROW_RIGHT : jQuery.sap.KeyCodes.ARROW_LEFT,
		RIGHT: sap.ui.getCore().getConfiguration().getRTL() ? jQuery.sap.KeyCodes.ARROW_LEFT : jQuery.sap.KeyCodes.ARROW_RIGHT,
		UP: jQuery.sap.KeyCodes.ARROW_UP,
		DOWN: jQuery.sap.KeyCodes.ARROW_DOWN
	},
	HOME: jQuery.sap.KeyCodes.HOME,
	END: jQuery.sap.KeyCodes.END,
	Page: {
		UP: jQuery.sap.KeyCodes.PAGE_UP,
		DOWN: jQuery.sap.KeyCodes.PAGE_DOWN
	},
	SHIFT: jQuery.sap.KeyCodes.SHIFT,
	F2: jQuery.sap.KeyCodes.F2,
	F4: jQuery.sap.KeyCodes.F4,
	F10: jQuery.sap.KeyCodes.F10,
	SPACE: jQuery.sap.KeyCodes.SPACE,
	ENTER: jQuery.sap.KeyCodes.ENTER,
	ESCAPE: jQuery.sap.KeyCodes.ESCAPE,
	A: jQuery.sap.KeyCodes.A,
	CONTEXTMENU: jQuery.sap.KeyCodes.CONTEXT_MENU,
	PLUS: "+",
	MINUS: "-"
};

//************************************************************************
// Test Code
//************************************************************************

QUnit.module("KeyboardDelegate", {
	beforeEach: function() {
	},
	afterEach: function() {
	}
});

QUnit.test("Delegate Type", function(assert) {
	assert.ok(checkDelegateType("sap.ui.table.TableKeyboardDelegate2"), "Correct delegate");
});

if (checkDelegateType("sap.ui.table.TableKeyboardDelegate") && !sap.ui.getCore().getConfiguration().getRTL()) {

//************************************************************************
// Tests for sap.ui.table.TableKeyboardDelegate
//************************************************************************

	QUnit.module("TableKeyboardDelegate - Keyboard Support: Item Navigation", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Arrow keys", function(assert) {
		var $Focus = checkFocus(getCell(0, 0, true), assert);

		qutils.triggerKeydown($Focus, "ARROW_LEFT", false, false, false);
		$Focus = checkFocus(getRowHeader(0, false), assert);

		qutils.triggerKeydown($Focus, "ARROW_LEFT", false, false, false);
		$Focus = checkFocus(getRowHeader(0, false), assert);

		qutils.triggerKeydown($Focus, "ARROW_UP", false, false, false);
		$Focus = checkFocus(getSelectAll(false), assert);

		qutils.triggerKeydown($Focus, "ARROW_RIGHT", false, false, false);
		$Focus = checkFocus(getColumnHeader(0, false), assert);

		qutils.triggerKeydown($Focus, "ARROW_RIGHT", false, false, false);
		$Focus = checkFocus(getColumnHeader(1, false), assert);

		var oRow, iIdx;
		var iVisibleRowCount = oTable.getVisibleRowCount();

		for (var i = 0; i < iNumberOfRows; i++) {
			qutils.triggerKeydown($Focus, "ARROW_DOWN", false, false, false);
			iIdx = i >= iVisibleRowCount ? iVisibleRowCount - 1 : i;
			oRow = oTable.getRows()[iIdx];
			$Focus = checkFocus(getCell(iIdx, 1), assert);
			assert.equal(oRow.getIndex(), i, "Row index correct");
		}
	});


	QUnit.test("Home/End", function(assert) {
		var $Focus = checkFocus(getCell(0, 0, true), assert);

		qutils.triggerKeydown($Focus, Key.HOME, false, false, false);
		$Focus = checkFocus(getRowHeader(0, false), assert);

		qutils.triggerKeydown($Focus, Key.END, false, false, false);
		$Focus = checkFocus(getCell(0, 0), assert);

		qutils.triggerKeydown($Focus, Key.END, false, false, false);
		$Focus = checkFocus(getCell(0, iNumberOfCols - 1), assert);
		var oRow = oTable.getRows()[0];
		assert.equal(oRow.getIndex(), 0, "Row index correct");

		var iVisibleRowCount = oTable.getVisibleRowCount();

		qutils.triggerKeydown($Focus, Key.END, false, false, true /*Ctrl*/);
		$Focus = checkFocus(getCell(iVisibleRowCount - 1, iNumberOfCols - 1), assert);
		oRow = oTable.getRows()[iVisibleRowCount - 1];
		assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");

		qutils.triggerKeydown($Focus, Key.HOME, false, false, true /*Ctrl*/);
		$Focus = checkFocus(getCell(0, iNumberOfCols - 1), assert);
		oRow = oTable.getRows()[0];
		assert.equal(oRow.getIndex(), 0, "Row index correct");

		qutils.triggerKeydown($Focus, Key.HOME, false, false, false);
		$Focus = checkFocus(getCell(0, 1), assert); //First Non-Fixed Column

		qutils.triggerKeydown($Focus, Key.HOME, false, false, false);
		$Focus = checkFocus(getCell(0, 0), assert);

		qutils.triggerKeydown($Focus, Key.HOME, false, false, false);
		$Focus = checkFocus(getRowHeader(0, false), assert);

		qutils.triggerKeydown($Focus, Key.END, false, false, true /*Ctrl*/);
		checkFocus(getRowHeader(iVisibleRowCount - 1), assert);
		oRow = oTable.getRows()[iVisibleRowCount - 1];
		assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");
	});


	QUnit.test("Action Mode on mouseup", function(assert) {
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
		var oExtension = sap.ui.table.TableExtension.enrich(oControl, sap.ui.table.TableKeyboardExtension);
		oExtension._delegate = {
			enterActionMode: function(oArgs) {
				testHandler(oArgs);
				return !bSkipActionMode;
			},
			leaveActionMode: testHandler
		};

		oExtension.setActionMode(true, oTestArgs); //Set to action mode
		assert.ok(oExtension.isInActionMode(), "In action mode again");
		bHandlerCalled = false;
		bTestArguments = false;
		var oEvent = jQuery.Event({type: "mouseup"});
		oControl._handleEvent(oEvent);
		assert.ok(bHandlerCalled, "leaveActionMode called on mouseup");
		assert.ok(!oExtension.isInActionMode(), "Not in action mode");
		oExtension.setActionMode(true, oTestArgs); //Set to action mode
		assert.ok(oExtension.isInActionMode(), "In action mode again");
		bHandlerCalled = false;
		oEvent = jQuery.Event({type: "mouseup"});
		oEvent.setMarked();
		oControl._handleEvent(oEvent);
		assert.ok(!bHandlerCalled, "leaveActionMode not called on marked mouseup");
		assert.ok(oExtension.isInActionMode(), "Still in action mode");

		oControl.destroy();
	});


	QUnit.module("TableKeyboardDelegate - Keyboard Support: Overlay and NoData", {
		beforeEach: setupTest,
		afterEach: teardownTest
	});

	QUnit.test("Overlay - TAB forward", function(assert) {
		oTable.setShowOverlay(true);

		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Focus2"), assert);
	});

	QUnit.test("Overlay - TAB forward (with extension and footer)", function(assert) {
		oTable.setShowOverlay(true);
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Focus2"), assert);
	});

	QUnit.test("Overlay - TAB backward", function(assert) {
		oTable.setShowOverlay(true);

		var oElem = setFocusOutsideOfTable("Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(jQuery.sap.domById("Focus1"), assert);
	});

	QUnit.test("Overlay - TAB backward (with extension and footer)", function(assert) {
		oTable.setShowOverlay(true);
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable("Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(jQuery.sap.domById("Focus1"), assert);
	});

	QUnit.asyncTest("NoData - TAB forward", function(assert) {
		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable("Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(jQuery.sap.domById("Focus2"), assert);

			QUnit.start();
		}

		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.asyncTest("NoData - TAB forward (with extension and footer)", function(assert) {
		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable("Focus1");
			simulateTabEvent(oElem, false);
			checkFocus(jQuery.sap.domById("Extension"), assert);
			simulateTabEvent(oElem, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(jQuery.sap.domById("Footer"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(jQuery.sap.domById("Focus2"), assert);

			QUnit.start();
		}

		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();
		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.asyncTest("NoData - TAB backward", function(assert) {
		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable("Focus2");
			simulateTabEvent(oElem, true);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, true);
			oElem = checkFocus(getColumnHeader(0), assert);
			simulateTabEvent(oElem, true);
			checkFocus(jQuery.sap.domById("Focus1"), assert);

			QUnit.start();
		}

		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.asyncTest("NoData - TAB backward (with extension and footer)", function(assert) {
		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable("Focus2");
			simulateTabEvent(oElem, true);
			oElem = checkFocus(jQuery.sap.domById("Footer"), assert);
			simulateTabEvent(oElem, true);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, true);
			oElem = checkFocus(getColumnHeader(0), assert);
			simulateTabEvent(oElem, true);
			oElem = checkFocus(jQuery.sap.domById("Extension"), assert);
			simulateTabEvent(oElem, true);
			checkFocus(jQuery.sap.domById("Focus1"), assert);

			QUnit.start();
		}

		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();
		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.asyncTest("NoData - Arrow keys only on header", function(assert) {
		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable("Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
			oElem = checkFocus(getColumnHeader(1), assert);
			qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
			checkFocus(getColumnHeader(0), assert);

			QUnit.start();
		}

		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.asyncTest("NoData and Overlay combined - TAB forward", function(assert) {
		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable("Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("overlay"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(jQuery.sap.domById("Focus2"), assert);

			QUnit.start();
		}

		oTable.setShowOverlay(true);
		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.asyncTest("NoData and Overlay combined - TAB backward", function(assert) {
		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable("Focus2");
			simulateTabEvent(oElem, true);
			oElem = checkFocus(oTable.getDomRef("overlay"), assert);
			simulateTabEvent(oElem, true);
			checkFocus(jQuery.sap.domById("Focus1"), assert);

			QUnit.start();
		}

		oTable.setShowOverlay(true);
		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});
}


//***************************************************************************
//Tests for sap.ui.table.TableKeyboardDelegate2 (Helpers)
//***************************************************************************

QUnit.module("Helper functions", {
	beforeEach: function() {
		setupTest();
	},
	afterEach: function() {
		teardownTest();
	}
});

QUnit.test("_isKeyCombination", function(assert) {
	var CTRL = 1;
	var SHIFT = 2;
	var ALT = 4;

	function getEvent(key, ctrl, meta, shift, alt) {
		var oEvent = {};
		oEvent.keyCode = key || null;
		oEvent.charCode = key || null;
		oEvent.ctrlKey = ctrl || false;
		oEvent.metaKey = meta || false;
		oEvent.shiftKey = shift || false;
		oEvent.altKey = alt || false;
		return oEvent;
	}

	var bIsMacintosh = sap.ui.Device.os.macintosh;

	// Real OS
	sap.ui.Device.os.macintosh = false;

	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A), Key.A), "Pressed: A");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true), Key.A, CTRL), "Pressed: Ctrl+A");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true, false, true), Key.A, CTRL + SHIFT), "Pressed: Ctrl+Shift+A");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(null, true), null, CTRL), "Pressed: Ctrl");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true), null, CTRL), "Pressed: Ctrl+A (Checked only for Ctrl)");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(null, false, false, true, true), null, SHIFT + ALT), "Pressed: Shift+Alt");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(43), Key.PLUS), "Pressed: Plus");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(43, true), Key.PLUS, CTRL), "Pressed: Ctrl+Plus");

	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.Arrow.DOWN), Key.A), "Not Pressed: A (pressed ArrowDown)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true, false, true), Key.A, CTRL), "Not Pressed: Ctrl+A (pressed Ctrl+Shift+A)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true), Key.A, CTRL), "Not Pressed: Ctrl+A (pressed Meta+A)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true), Key.A, CTRL + SHIFT), "Not Pressed: Ctrl+Shift+A (pressed Ctrl+A)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(null, false, false, true), null, CTRL), "Not Pressed: Ctrl (pressed Shift)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.Arrow.DOWN), null, SHIFT + ALT), "Not Pressed: Shift+Alt (pressed ArrowDown)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(45), Key.PLUS), "Not Pressed: Plus (pressed Minus)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(43, false, true), Key.PLUS, CTRL), "Not Pressed: Ctrl+Plus (pressed Meta+Plus)");

	// Macintosh
	sap.ui.Device.os.macintosh = true;

	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A), Key.A), "Pressed: A");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true), Key.A, CTRL), "Pressed: Meta+A");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true, true), Key.A, CTRL + SHIFT), "Pressed: Meta+Shift+A");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(null, false, true), null, CTRL), "Pressed: Meta");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true), null, CTRL), "Pressed: Meta+A (Checked only for Meta)");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(null, false, false, true, true), null, SHIFT + ALT), "Pressed: Shift+Alt");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(43), Key.PLUS), "Pressed: Plus");
	assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(43, false, true), Key.PLUS, CTRL), "Pressed: Meta+Plus");

	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.Arrow.DOWN), Key.A), "Not Pressed: A (pressed ArrowDown)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true, true), Key.A, CTRL), "Not Pressed: Meta+A (pressed Meta+Shift+A)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true), Key.A, CTRL), "Not Pressed: Meta+A (pressed Ctrl+A)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true), Key.A, CTRL + SHIFT), "Not Pressed: Meta+Shift+A (pressed Meta+A)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(null, false, false, true), null, CTRL), "Not Pressed: Meta (pressed Shift)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.Arrow.DOWN), null, SHIFT + ALT), "Not Pressed: Shift+Alt (pressed ArrowDown)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(45), Key.PLUS), "Not Pressed: Plus (pressed Minus)");
	assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(43, true), Key.PLUS, CTRL), "Not Pressed: Meta+Plus (pressed Ctrl+Plus)");

	sap.ui.Device.os.macintosh = bIsMacintosh;
});

QUnit.test("_isElementGroupToggler", function(assert) {
	// GridTable
	assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, getCell(0, 0)[0]), "Returned False: Pressing a key on a normal data cell can not toggle a group");
	assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, TableKeyboardDelegate2._getInteractiveElements(getCell(0, 0))[0]), "Returned False: Pressing a key on an interactive element inside a normal data cell can not toggle a group");
	assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, getRowHeader(0)[0]), "Returned False: Pressing a key on a normal row header cell can not toggle a group");
	assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, getColumnHeader(0)[0]), "Returned False: Pressing a key on a column header cell can not toggle a group");
	assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, getSelectAll()[0]), "Returned False: Pressing a key on the SelectAll cell can not toggle a group");

	oTable.setEnableGrouping(true);
	oTable.setGroupBy(oTable.getColumns()[0]);
	sap.ui.getCore().applyChanges();

	assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTable, getCell(0, 1)[0]), "Returned True: Pressing a key on a data cell in a grouping row can toggle a group");
	assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTable, getRowHeader(0)[0]), "Returned True: Pressing a key on a row header cell in a grouping row can toggle a group");

	// TreeTable
	assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getCell(0, 0, null, null, oTreeTable)[0]), "Returned True: Pressing a key on a normal data cell can not toggle a group");
	assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTable, TableKeyboardDelegate2._getInteractiveElements(getCell(0, 0, null, null, oTreeTable))[0]), "Returned True: Pressing a key on the tree icon can toggle a group");
	assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, TableKeyboardDelegate2._getInteractiveElements(getCell(0, 0, null, null, oTreeTable))[1]), "Returned False: Pressing a key on an interactive element inside a cell can not toggle a group");
	assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getRowHeader(0, null, null, oTreeTable)[0]), "Returned False: Pressing a key on a normal row header cell can not toggle a group");
	assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getColumnHeader(0, null, null, oTreeTable)[0]), "Returned False: Pressing a key on a column header cell can not toggle a group");
	assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getSelectAll(null, null, oTreeTable)[0]), "Returned False: Pressing a key on the SelectAll cell can not toggle a group");

	oTreeTable.setUseGroupMode(true);
	sap.ui.getCore().applyChanges();

	assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getCell(0, 0, null, null, oTreeTable)[0]), "Returned True: Pressing a key on a data cell in a grouping row can toggle a group");
	assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getCell(0, 1, null, null, oTreeTable)[0]), "Returned True: Pressing a key on a data cell in a grouping row can toggle a group");
	assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getRowHeader(0, null, null, oTreeTable)[0]), "Returned True: Pressing a key on a row header cell in a grouping row can toggle a group");
});

//***************************************************************************
//Tests for sap.ui.table.TableKeyboardDelegate2 (Interactive Element Helpers)
//***************************************************************************

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

QUnit.test("_isInteractiveElement", function(assert) {
	var $NoFocusNoTab = getCell(0, iNumberOfCols - 3).find("span");
	var $NoFocus = getCell(0, iNumberOfCols - 4).find("span");
	$NoFocus[0].tabIndex = 0;
	var $NoTab = getCell(0, iNumberOfCols - 1).find("input");
	var $FullyInteractive = getCell(0, iNumberOfCols - 2).find("input");
	var $TreeIconOpen = jQuery('<div class="sapUiTableTreeIcon sapUiTableTreeIconNodeOpen"></div>');
	var $TreeIconClosed = jQuery('<div class="sapUiTableTreeIcon sapUiTableTreeIconNodeClosed"></div>');
	var $TreeIconLeaf = jQuery('<div class="sapUiTableTreeIcon sapUiTableTreeIconLeaf"></div>');

	assert.ok(!TableKeyboardDelegate2._isElementInteractive($NoFocusNoTab), "(jQuery) Not focusable and not tabbable element is not interactive");
	assert.ok(TableKeyboardDelegate2._isElementInteractive($NoFocus), "(jQuery) Not focusable and tabbable element is interactive");
	assert.ok(TableKeyboardDelegate2._isElementInteractive($NoTab), "(jQuery) Focusable and not tabbable input element is interactive");
	assert.ok(TableKeyboardDelegate2._isElementInteractive($FullyInteractive), "(jQuery) Focusable and tabbable input element is interactive");
	assert.ok(TableKeyboardDelegate2._isElementInteractive($TreeIconOpen), "(jQuery) TreeIcon of open node is interactive");
	assert.ok(TableKeyboardDelegate2._isElementInteractive($TreeIconClosed), "(jQuery) TreeIcon of closed node is interactive");
	assert.ok(!TableKeyboardDelegate2._isElementInteractive($TreeIconLeaf), "(jQuery) TreeIcon of leaf node is not interactive");

	assert.ok(!TableKeyboardDelegate2._isElementInteractive($NoFocusNoTab[0]), "(HTMLElement) Not focusable and not tabbable element is not interactive");
	assert.ok(TableKeyboardDelegate2._isElementInteractive($NoFocus[0]), "(HTMLElement) Not focusable and tabbable element is interactive");
	assert.ok(TableKeyboardDelegate2._isElementInteractive($NoTab[0]), "(HTMLElement) Focusable and not tabbable input element is interactive");
	assert.ok(TableKeyboardDelegate2._isElementInteractive($FullyInteractive[0]), "(HTMLElement) Focusable and tabbable input element is interactive");
	assert.ok(TableKeyboardDelegate2._isElementInteractive($TreeIconOpen[0]), "(HTMLElement) TreeIcon of open node is interactive");
	assert.ok(TableKeyboardDelegate2._isElementInteractive($TreeIconClosed[0]), "(HTMLElement) TreeIcon of closed node is interactive");
	assert.ok(!TableKeyboardDelegate2._isElementInteractive($TreeIconLeaf[0]), "(HTMLElement) TreeIcon of leaf node is not interactive");

	assert.ok(!TableKeyboardDelegate2._isElementInteractive(), "No parameter passed: False was returned");
});

QUnit.test("_getInteractiveElements", function(assert) {
	var $InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 1));
	assert.strictEqual($InteractiveElements.length, 1, "(JQuery) Data cell with focusable element: One element was returned");
	assert.strictEqual($InteractiveElements[0].value, "NoTab1", "(HTMLElement) Data cell with focusable element: The correct element was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 1)[0]);
	assert.strictEqual($InteractiveElements.length, 1, "(DOM) Data cell with focusable element: One element was returned");
	assert.strictEqual($InteractiveElements[0].value, "NoTab1", "(DOM) Data cell with focusable element: The correct element was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 2));
	assert.strictEqual($InteractiveElements.length, 1, "(jQuery Data cell with focusable & tabbable element: One element was returned");
	assert.strictEqual($InteractiveElements[0].value, "FocusTab1", "(jQuery Data cell with focusable & tabbable element: The correct element was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 2)[0]);
	assert.strictEqual($InteractiveElements.length, 1, "(DOM) Data cell with focusable & tabbable element: One element was returned");
	assert.strictEqual($InteractiveElements[0].value, "FocusTab1", "(DOM) Data cell with focusable & tabbable element: The correct element was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 3));
	assert.strictEqual($InteractiveElements, null, "Data cell without interactive element: Null was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getColumnHeader(0));
	assert.strictEqual($InteractiveElements, null, "Column header: Null was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getRowHeader(0));
	assert.strictEqual($InteractiveElements, null, "Row header: Null was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getSelectAll(0));
	assert.strictEqual($InteractiveElements, null, "SelectAll: Null was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements();
	assert.strictEqual($InteractiveElements, null, "No parameter passed: Null was returned");
});

QUnit.test("_getInteractiveElements - TreeTable Icon Cell", function(assert) {
	var $TreeIconCell = getCell(0, 0, null, null, oTreeTable);
	var sTreeIconOpenClass = "sapUiTableTreeIconNodeOpen";
	var sTreeIconClosedClass = "sapUiTableTreeIconNodeClosed";
	var sTreeIconLeafClass = "sapUiTableTreeIconLeaf";

	// Closed node
	var $InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($TreeIconCell);
	assert.strictEqual($InteractiveElements.length, 1, "(JQuery) Tree icon cell of closed node: One element was returned");
	assert.ok($InteractiveElements[0].classList.contains(sTreeIconClosedClass),
		"(JQuery) Tree icon cell of closed node: The correct closed node element was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($TreeIconCell[0]);
	assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Tree icon cell of closed node: One element was returned");
	assert.ok($InteractiveElements[0].classList.contains(sTreeIconClosedClass),
		"(HTMLElement) Tree icon cell of closed node: The correct closed node element was returned");

	// Open node
	$InteractiveElements[0].classList.remove(sTreeIconClosedClass);
	$InteractiveElements[0].classList.add(sTreeIconOpenClass);

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($TreeIconCell);
	assert.strictEqual($InteractiveElements.length, 1, "(JQuery) Tree icon cell of open node: One element was returned");
	assert.ok($InteractiveElements[0].classList.contains(sTreeIconOpenClass),
		"(JQuery) Tree icon cell of open node: The correct open node element was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($TreeIconCell[0]);
	assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Tree icon cell of open node: One element was returned");
	assert.ok($InteractiveElements[0].classList.contains(sTreeIconOpenClass),
		"(HTMLElement) Tree icon cell of open node: The correct open node element was returned");

	// Leaf node
	$InteractiveElements[0].classList.remove(sTreeIconOpenClass);
	$InteractiveElements[0].classList.add(sTreeIconLeafClass);

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($TreeIconCell);
	assert.strictEqual($InteractiveElements, null, "(JQuery) Tree icon cell of leaf node: No element was returned");

	$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($TreeIconCell[0]);
	assert.strictEqual($InteractiveElements, null, "(HTMLElement) Tree icon cell of leaf node: No element was returned");
});

QUnit.test("_getFirstInteractiveElement", function(assert) {
	var $FirstInteractiveElement = TableKeyboardDelegate2._getFirstInteractiveElement(oTable.getRows()[0]);
	assert.strictEqual($FirstInteractiveElement.length, 1, "First row: One element was returned");
	assert.strictEqual($FirstInteractiveElement[0].value, "FocusTab1", "First row: The correct element was returned");

	$FirstInteractiveElement = TableKeyboardDelegate2._getFirstInteractiveElement();
	assert.strictEqual($FirstInteractiveElement, null, "No parameter passed: Null was returned");
});

QUnit.test("_getLastInteractiveElement", function(assert) {
	var $LastInteractiveElement = TableKeyboardDelegate2._getLastInteractiveElement(oTable.getRows()[0]);
	assert.strictEqual($LastInteractiveElement.length, 1, "First row: One element was returned");
	assert.strictEqual($LastInteractiveElement[0].value, "NoTab1", "First row: The correct element was returned");

	$LastInteractiveElement = TableKeyboardDelegate2._getLastInteractiveElement();
	assert.strictEqual($LastInteractiveElement, null, "No parameter passed: Null was returned");
});

QUnit.test("_getPreviousInteractiveElement", function(assert) {
	var $LastInteractiveElement = TableKeyboardDelegate2._getLastInteractiveElement(oTable.getRows()[0]);

	var $PreviousInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $LastInteractiveElement);
	assert.strictEqual($PreviousInteractiveElement.length, 1, "Passed an interactive element (jQuery): One interactive element was returned");
	assert.strictEqual($PreviousInteractiveElement[0].value, "FocusTab1", "The correct previous element was returned");

	$PreviousInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement);
	assert.strictEqual($PreviousInteractiveElement, null,
		"Getting the previous element of the previous element: Null was returned, it is the first interactive element in the row");

	$PreviousInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $LastInteractiveElement[0])
	assert.strictEqual($PreviousInteractiveElement.length, 1, "Passed an interactive element (HTMLElement): One interactive element was returned");
	assert.strictEqual($PreviousInteractiveElement[0].value, "FocusTab1", "First row: The correct previous element was returned");

	$PreviousInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement[0]);
	assert.strictEqual($PreviousInteractiveElement, null,
		"Getting the previous element of the previous element: Null was returned, it is the first interactive element in the row");

	$PreviousInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, getCell(0, 0));
	assert.strictEqual($PreviousInteractiveElement, null, "Data cell was passed: Null was returned");

	$PreviousInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, getColumnHeader(0));
	assert.strictEqual($PreviousInteractiveElement, null, "Column header cell was passed: Null was returned");

	$PreviousInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, getRowHeader(0));
	assert.strictEqual($PreviousInteractiveElement, null, "Row header cell was passed: Null was returned");

	$PreviousInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, getSelectAll(0));
	assert.strictEqual($PreviousInteractiveElement, null, "SelectAll cell was passed: Null was returned");

	$PreviousInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getPreviousInteractiveElement(oTable);
	assert.strictEqual($PreviousInteractiveElement, null, "No interactive element was passed: Null was returned");

	$PreviousInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getPreviousInteractiveElement();
	assert.strictEqual($PreviousInteractiveElement, null, "No parameter was passed: Null was returned");
});

QUnit.test("getNextInteractiveElement", function(assert) {
	var $FirstInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getFirstInteractiveElement(oTable.getRows()[0]);

	var $NextInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getNextInteractiveElement(oTable, $FirstInteractiveElement);
	assert.strictEqual($NextInteractiveElement.length, 1, "Passed an interactive element (jQuery): One interactive element was returned");
	assert.strictEqual($NextInteractiveElement[0].value, "NoTab1", "The correct next element was returned");

	$NextInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getNextInteractiveElement(oTable, $NextInteractiveElement);
	assert.strictEqual($NextInteractiveElement, null,
		"Getting the next element of the next element: Null was returned, it is the last interactive element in the row");

	$NextInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getNextInteractiveElement(oTable, $FirstInteractiveElement[0]);
	assert.strictEqual($NextInteractiveElement.length, 1, "Passed an interactive element (HTMLElement): One interactive element was returned");
	assert.strictEqual($NextInteractiveElement[0].value, "NoTab1", "First row: The correct next element was returned");

	$NextInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getNextInteractiveElement(oTable, $NextInteractiveElement[0]);
	assert.strictEqual($NextInteractiveElement, null,
		"Getting the previous element of the previous element: Null was returned, it is the last interactive element in the row");

	$NextInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getNextInteractiveElement(oTable, getCell(0, 0));
	assert.strictEqual($NextInteractiveElement, null, "Data cell was passed: Null was returned");

	$NextInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getNextInteractiveElement(oTable, getColumnHeader(0));
	assert.strictEqual($NextInteractiveElement, null, "Column header cell was passed: Null was returned");

	$NextInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getNextInteractiveElement(oTable, getRowHeader(0));
	assert.strictEqual($NextInteractiveElement, null, "Row header cell was passed: Null was returned");

	$NextInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getNextInteractiveElement(oTable, getSelectAll(0));
	assert.strictEqual($NextInteractiveElement, null, "SelectAll cell was passed: Null was returned");

	$NextInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getNextInteractiveElement(oTable);
	assert.strictEqual($NextInteractiveElement, null, "No interactive element was passed: Null was returned");

	$NextInteractiveElement = sap.ui.table.TableKeyboardDelegate2._getNextInteractiveElement();
	assert.strictEqual($NextInteractiveElement, null, "No parameter was passed: Null was returned");
});
































//************************************************************************
// Tests for sap.ui.table.TableKeyboardDelegate2 (new Keyboard Behavior)
//************************************************************************

QUnit.module("TableKeyboardDelegate2 - Basics", {
	beforeEach: function() {
		setupTest();
	},
	afterEach: teardownTest
});

QUnit.test("getInterface", function(assert) {
	var oDelegate = new TableKeyboardDelegate2();
	assert.ok(oDelegate === oDelegate.getInterface(), "getInterface returns the object itself");
});

QUnit.module("TableKeyboardDelegate2 - Navigation > Tab & Shift+Tab", {
	beforeEach: setupTest,
	afterEach: teardownTest
});

QUnit.test("Default Test Table", function(assert) {
	var oElem = setFocusOutsideOfTable("Focus1");
	simulateTabEvent(oElem, false);
	oElem = checkFocus(getColumnHeader(0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
	oElem = checkFocus(getColumnHeader(1), assert);
	simulateTabEvent(oElem, false);
	oElem = checkFocus(getCell(0, 1), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
	oElem = checkFocus(getCell(1, 1), assert);
	simulateTabEvent(oElem, false);
	oElem = checkFocus(jQuery.sap.domById("Focus2"), assert);

	simulateTabEvent(oElem, true);
	checkFocus(getCell(1, 1), assert);

	oElem = setFocusOutsideOfTable("Focus1");
	simulateTabEvent(oElem, false);
	oElem = checkFocus(getColumnHeader(1), assert);
	simulateTabEvent(oElem, false);
	checkFocus(getCell(1, 1), assert);

	oElem = setFocusOutsideOfTable("Focus1");
	simulateTabEvent(oElem, false);
	oElem = checkFocus(getColumnHeader(1), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
	oElem = checkFocus(getColumnHeader(2), assert);
	simulateTabEvent(oElem, false);
	checkFocus(getCell(1, 2), assert);
});

QUnit.test("Extension and Footer", function(assert) {
	oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
	oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
	sap.ui.getCore().applyChanges();

	var oElem = setFocusOutsideOfTable("Focus2");
	simulateTabEvent(oElem, true);
	oElem = checkFocus(jQuery.sap.domById("Footer"), assert);
	simulateTabEvent(oElem, true);
	oElem = checkFocus(getCell(0, 0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	oElem = checkFocus(getRowHeader(0), assert);
	simulateTabEvent(oElem, true);
	oElem = checkFocus(getSelectAll(0), assert);
	simulateTabEvent(oElem, true);
	oElem = checkFocus(jQuery.sap.domById("Extension"), assert);
	simulateTabEvent(oElem, true);
	oElem = checkFocus(jQuery.sap.domById("Focus1"), assert);
	simulateTabEvent(oElem, false);
	oElem = checkFocus(jQuery.sap.domById("Extension"), assert);
	simulateTabEvent(oElem, false);
	oElem = checkFocus(getSelectAll(0), assert);
	simulateTabEvent(oElem, false);
	oElem = checkFocus(getRowHeader(0), assert);
	simulateTabEvent(oElem, false);
	oElem = checkFocus(jQuery.sap.domById("Footer"), assert);
	simulateTabEvent(oElem, false);
	checkFocus(jQuery.sap.domById("Focus2"), assert);

	oTable.setColumnHeaderVisible(false);
	sap.ui.getCore().applyChanges();
	oElem = getCell(1, 1, true);
	simulateTabEvent(oElem, true);
	checkFocus(jQuery.sap.domById("Extension"), assert);
});

QUnit.module("TableKeyboardDelegate2 - Navigation > Arrow Keys", {
	beforeEach: setupTest,
	afterEach: teardownTest
});

function _testArrowKeys(assert) {
	var oElem = setFocusOutsideOfTable("Focus1");
	simulateTabEvent(oElem, false);
	oElem = checkFocus(getColumnHeader(0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
	oElem = checkFocus(getCell(0, 0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	oElem = checkFocus(getRowHeader(0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	oElem = checkFocus(getRowHeader(0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
	oElem = checkFocus(getSelectAll(), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	oElem = checkFocus(getSelectAll(), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
	oElem = checkFocus(getSelectAll(), assert);

	var iColIdx;
	var i;

	for (i = 0; i < iNumberOfCols; i++) {
		iColIdx = i;
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
		oElem = checkFocus(getColumnHeader(iColIdx), assert);
	}
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
	oElem = checkFocus(getColumnHeader(iColIdx), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
	oElem = checkFocus(getColumnHeader(iColIdx), assert);

	var oRow, iIdx;
	var iVisibleRowCount = oTable.getVisibleRowCount();

	for (i = 0; i < iNumberOfRows; i++) {
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
		iIdx = i;
		if (i >= iVisibleRowCount - oTable.getFixedBottomRowCount() && i < iNumberOfRows - oTable.getFixedBottomRowCount()) {
			iIdx = iVisibleRowCount - oTable.getFixedBottomRowCount() - 1;
		} else if (i >= iNumberOfRows - oTable.getFixedBottomRowCount()) {
			iIdx = i - (iNumberOfRows - iVisibleRowCount);
		}
		oRow = oTable.getRows()[iIdx];
		oElem = checkFocus(getCell(iIdx, iColIdx), assert);
		assert.equal(oRow.getIndex(), i, "Row index correct");
	}

	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
	oElem = checkFocus(getCell(iIdx, iColIdx), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
	oElem = checkFocus(getCell(iIdx, iColIdx), assert);
	assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");

	for (i = iNumberOfCols - 2; i >= 0; i--) {
		iColIdx = i;
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
		oElem = checkFocus(getCell(iIdx, iColIdx), assert);
	}

	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	oElem = checkFocus(getRowHeader(iIdx), assert);

	for (i = iNumberOfRows - 2; i >= 0; i--) {
		qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
		iIdx = i;
		if (i >= oTable.getFixedRowCount() && i < iNumberOfRows - iVisibleRowCount + oTable.getFixedRowCount() + 1) {
			iIdx = oTable.getFixedRowCount();
		} else if (i >= iNumberOfRows - iVisibleRowCount + oTable.getFixedRowCount() + 1) {
			iIdx = i - (iNumberOfRows - iVisibleRowCount);
		}
		oRow = oTable.getRows()[iIdx];
		oElem = checkFocus(getRowHeader(iIdx), assert);
		assert.equal(oRow.getIndex(), i, "Row index correct");
	}
}

QUnit.test("Default Test Table", function(assert) {
	_testArrowKeys(assert);
});

QUnit.test("Fixed Rows", function(assert) {
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	sap.ui.getCore().applyChanges();

	_testArrowKeys(assert);
});

QUnit.test("No Row Header", function(assert) {
	oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
	sap.ui.getCore().applyChanges();

	var oElem = setFocusOutsideOfTable("Focus1");
	simulateTabEvent(oElem, false);
	oElem = checkFocus(getColumnHeader(0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
	oElem = checkFocus(getCell(0, 0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	checkFocus(getCell(0, 0), assert);
});

QUnit.test("No Column Header", function(assert) {
	oTable.setColumnHeaderVisible(false);
	sap.ui.getCore().applyChanges();

	var oElem = setFocusOutsideOfTable("Focus1");
	simulateTabEvent(oElem, false);
	oElem = checkFocus(getCell(0, 0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
	oElem = checkFocus(getCell(0, 0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	oElem = checkFocus(getRowHeader(0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
	checkFocus(getRowHeader(0), assert);
});

QUnit.test("Multi Header", function(assert) {
	oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
	oTable.getColumns()[1].setHeaderSpan([2, 1]);
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
	oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
	oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
	sap.ui.getCore().applyChanges();

	var oElem = setFocusOutsideOfTable("Focus1");
	simulateTabEvent(oElem, false);
	oElem = checkFocus(getColumnHeader(0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
	oElem = checkFocus(jQuery.sap.domById(getColumnHeader(0).attr("id") + "_1"), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
	oElem = checkFocus(jQuery.sap.domById(getColumnHeader(1).attr("id") + "_1"), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
	oElem = checkFocus(getColumnHeader(1), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
	oElem = checkFocus(jQuery.sap.domById(getColumnHeader(1).attr("id") + "_1"), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
	oElem = checkFocus(jQuery.sap.domById(getColumnHeader(2).attr("id") + "_1"), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
	oElem = checkFocus(getColumnHeader(1), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
	oElem = checkFocus(getColumnHeader(3), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
	oElem = checkFocus(jQuery.sap.domById(getColumnHeader(3).attr("id") + "_1"), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	oElem = checkFocus(jQuery.sap.domById(getColumnHeader(2).attr("id") + "_1"), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
	oElem = checkFocus(getColumnHeader(1), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
	oElem = checkFocus(getSelectAll(), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
	checkFocus(getRowHeader(0), assert);
});

QUnit.module("TableKeyboardDelegate2 - Navigation > Shift+Arrow Keys", {
	beforeEach: setupTest,
	afterEach: teardownTest
});

QUnit.test("Inside Header (Range Selection, Column Resizing)", function(assert) {
	var oElem;

	function test() {
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		checkFocus(oElem, assert);
	}

	// Range Selection
	oElem = checkFocus(getSelectAll(true), assert);
	qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.
	test();
	qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false); // End selection mode.

	oElem = checkFocus(getColumnHeader(0, true), assert);
	qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.
	test();
	qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false); // End selection mode.

	// Column Resizing
	oElem = checkFocus(getSelectAll(true), assert);
	test();

	oElem = checkFocus(getColumnHeader(0, true), assert);
	test();
});

QUnit.test("Inside Row Header, Fixed Rows (Range Selection)", function(assert) {
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowSelector);
	sap.ui.getCore().applyChanges();

	var i, iRowIndex, oRow;
	var iVisibleRowCount = oTable.getVisibleRowCount();

	var oElem = checkFocus(getRowHeader(0, true), assert);
	qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.

	qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	checkFocus(oElem, assert);

	for (i = 1; i < iNumberOfRows; i++) {
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
		iRowIndex = i;
		if (i >= iVisibleRowCount - oTable.getFixedBottomRowCount() && i < iNumberOfRows - oTable.getFixedBottomRowCount()) {
			iRowIndex = iVisibleRowCount - oTable.getFixedBottomRowCount() - 1;
		} else if (i >= iNumberOfRows - oTable.getFixedBottomRowCount()) {
			iRowIndex = i - (iNumberOfRows - iVisibleRowCount);
		}
		oRow = oTable.getRows()[iRowIndex];
		oElem = checkFocus(getRowHeader(iRowIndex), assert);
		assert.equal(oRow.getIndex(), i, "Row index correct");
	}

	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	checkFocus(oElem, assert);
	assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");

	for (i = iNumberOfRows - 2; i > 0; i--) {
		qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
		iRowIndex = i;
		if (i >= oTable.getFixedRowCount() && i < iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
			iRowIndex = oTable.getFixedRowCount();
		} else if (i >= iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
			iRowIndex = i - (iNumberOfRows - oTable.getVisibleRowCount());
		}
		oRow = oTable.getRows()[iRowIndex];
		oElem = checkFocus(getRowHeader(iRowIndex), assert);
		assert.equal(oRow.getIndex(), i, "Row index correct");
	}

	qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false); // End selection mode.

	oTable.setSelectionMode(sap.ui.table.SelectionMode.Single);
	sap.ui.getCore().applyChanges();

	oElem = checkFocus(getRowHeader(1, true), assert);
	qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	checkFocus(oElem, assert);
});

QUnit.test("Inside Data Rows, Fixed Rows (Range Selection)", function(assert) {
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);
	sap.ui.getCore().applyChanges();

	var i, iColumnIndex, oRow;
	var iRowIndex = 0;
	var iVisibleRowCount = oTable.getVisibleRowCount();

	var oElem = checkFocus(getCell(0, 0, true), assert);
	qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.

	qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	checkFocus(oElem, assert);

	// First Row, First Column -> First Row, Last Column
	for (i = 1; i < iNumberOfCols; i++) {
		iColumnIndex = i;
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);
	}

	qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
	oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);

	// First Row, Last Column -> Last Row, Last Column
	for (i = 1; i < iNumberOfRows; i++) {
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
		iRowIndex = i;
		if (i >= iVisibleRowCount - oTable.getFixedBottomRowCount() && i < iNumberOfRows - oTable.getFixedBottomRowCount()) {
			iRowIndex = iVisibleRowCount - oTable.getFixedBottomRowCount() - 1;
		} else if (i >= iNumberOfRows - oTable.getFixedBottomRowCount()) {
			iRowIndex = i - (iNumberOfRows - iVisibleRowCount);
		}
		oRow = oTable.getRows()[iRowIndex];
		oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);
		assert.equal(oRow.getIndex(), i, "Row index correct");
	}

	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
	oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);
	assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");

	// Last Row, Last Column -> Last Row, First Column
	for (i = iNumberOfCols - 2; i >= 0; i--) {
		iColumnIndex = i;
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);
	}

	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
	oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);

	// Last Row, First Column -> First Row, First Column
	for (i = iNumberOfRows - 2; i > 0; i--) {
		qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
		iRowIndex = i;
		if (i >= oTable.getFixedRowCount() && i < iNumberOfRows - iVisibleRowCount + oTable.getFixedRowCount() + 1) {
			iRowIndex = oTable.getFixedRowCount();
		} else if (i >= iNumberOfRows - iVisibleRowCount + oTable.getFixedRowCount() + 1) {
			iRowIndex = i - (iNumberOfRows - iVisibleRowCount);
		}
		oRow = oTable.getRows()[iRowIndex];
		oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);
		assert.equal(oRow.getIndex(), i, "Row index correct");
	}

	qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false); // End selection mode.

	oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowSelector);
	sap.ui.getCore().applyChanges();

	oElem = checkFocus(getCell(1, 1, true), assert);
	qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	checkFocus(oElem, assert);

	oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);
	oTable.setSelectionMode(sap.ui.table.SelectionMode.Single);
	sap.ui.getCore().applyChanges();

	oElem = checkFocus(getCell(1, 1, true), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	checkFocus(oElem, assert);

	oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
	sap.ui.getCore().applyChanges();

	oElem = checkFocus(getCell(1, 1, true), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	checkFocus(oElem, assert);
});

QUnit.test("Move between Row Header and Row (Range Selection)", function(assert) {
	oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
	sap.ui.getCore().applyChanges();

	var oElem = checkFocus(getRowHeader(0, true), assert);
	qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	oElem = checkFocus(getCell(0, 0), assert);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	checkFocus(getRowHeader(0), assert);
});

QUnit.module("TableKeyboardDelegate2 - Navigation > Home & End", {
	beforeEach: setupTest,
	afterEach: teardownTest
});

QUnit.test("Default Test Table", function(assert) {
	oTable.setFixedColumnCount(0);
	sap.ui.getCore().applyChanges();

	/* Test on column header */

	// First cell
	var oElem = checkFocus(getColumnHeader(0, true), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getSelectAll(), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getSelectAll(), assert);

	// *END* -> First cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *END* -> Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *END* -> Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *HOME* -> First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getColumnHeader(0), assert);

	/* Test on first content row */

	// First cell
	oElem = checkFocus(getCell(0, 0, true), assert);

	// *HOME* -> Selection cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getRowHeader(0), assert);

	// *HOME* -> Selection cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getRowHeader(0), assert);

	// *END* -> First cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getCell(0, 0), assert);

	// *END* -> Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

	// *END* -> Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

	// *HOME* -> First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getCell(0, 0), assert);
});

QUnit.test("No Row Header", function(assert) {
	oTable.setFixedColumnCount(0);
	oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
	sap.ui.getCore().applyChanges();

	/* Test on column header */

	// First cell
	var oElem = checkFocus(getColumnHeader(0, true), assert);

	// *HOME* -> First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *END* -> Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *END* -> Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *HOME* -> First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getColumnHeader(0), assert);

	/* Test on first content row */

	// First cell
	oElem = checkFocus(getCell(0, 0, true), assert);

	// *HOME* -> First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getCell(0, 0), assert);

	// *END* -> Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

	// *END* -> Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getCell(0, iNumberOfCols - 1), assert);

	// *HOME* -> First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getCell(0, 0), assert);
});

QUnit.test("Fixed Columns", function(assert) {
	/**
	 * 1 (of 5) Fixed Columns
	 */

	/* Test on column header */

	// Fixed area - Single cell
	var oElem = checkFocus(getColumnHeader(0, true), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getSelectAll(), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getSelectAll(), assert);

	// *END* -> Fixed area - Single cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *END* -> Non-Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *END* -> Non-Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *HOME* -> Non-Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount()), assert);

	// *HOME* -> Fixed area - Single cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getColumnHeader(0), assert);

	/* Test on first content row */

	// Fixed area - Single cell
	oElem = checkFocus(getCell(0, 0, true), assert);

	// *HOME* -> Selection cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getRowHeader(0), assert);

	// *HOME* -> Selection cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getRowHeader(0), assert);

	// *END* -> Fixed area - Single cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getCell(0, 0), assert);

	// *END* -> Non-Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

	// *END* -> Non-Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getCell(0, iNumberOfCols - 1), assert);

	// *HOME* -> Non-Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getCell(0, oTable.getFixedColumnCount()), assert);

	// *HOME* -> Fixed area - Single cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getCell(0, 0), assert);

	/**
	 * 2 (of 5) Fixed Columns
	 */

	oTable.setFixedColumnCount(2);
	sap.ui.getCore().applyChanges();

	/* Test on column header */

	// Fixed area - First cell
	oElem = checkFocus(getColumnHeader(0, true), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getSelectAll(), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getSelectAll(), assert);

	// *END* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *END* -> Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount() - 1), assert);

	// *END* -> Non-Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *END* -> Non-Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *HOME* -> Non-Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount()), assert);

	// *HOME* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getColumnHeader(0), assert);

	/* Test on first content row */

	// Fixed area - First cell
	oElem = checkFocus(getCell(0, 0, true), assert);

	// *HOME* -> Selection cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getRowHeader(0), assert);

	// *HOME* -> Selection cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getRowHeader(0), assert);

	// *END* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getCell(0, 0), assert);

	// *END* -> Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getCell(0, oTable.getFixedColumnCount() - 1), assert);

	// *END* -> Non-Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

	// *END* -> Non-Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getCell(0, iNumberOfCols - 1), assert);

	// *HOME* -> Non-Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getCell(0, oTable.getFixedColumnCount()), assert);

	// *HOME* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getCell(0, 0), assert);

	/**
	 * 4 (of 5) Fixed Columns
	 */

	oTable.setFixedColumnCount(4);
	sap.ui.getCore().applyChanges();

	/* Test on column header */

	// Non-Fixed area - Last cell
	oElem = checkFocus(getColumnHeader(iNumberOfCols - 1, true), assert);

	// *HOME* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *END* -> Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount() - 1), assert);

	// *END* -> Non-Fixed area - Single cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	/* Test on first content row */

	// Non-Fixed area - Single cell
	oElem = checkFocus(getCell(0, iNumberOfCols - 1, true), assert);

	// *HOME* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getCell(0, 0), assert);

	// *END* -> Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getCell(0, oTable.getFixedColumnCount() - 1), assert);

	// *END* -> Non-Fixed area - Single cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getCell(0, iNumberOfCols - 1), assert);

	/**
	 * 5 (of 5) Fixed Columns
	 */

	oTable.setFixedColumnCount(5);
	sap.ui.getCore().applyChanges();

	/* Test on column header */

	// Fixed area - Last cell
	oElem = checkFocus(getColumnHeader(iNumberOfCols - 1, true), assert);

	// *HOME* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *END* -> Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getColumnHeader(oTable.getFixedColumnCount() - 1), assert);

	/* Test on first content row */

	// Fixed area - Last cell
	oElem = checkFocus(getCell(0, iNumberOfCols - 1, true), assert);

	// *HOME* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(getCell(0, 0), assert);

	// *END* -> Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getCell(0, oTable.getFixedColumnCount() - 1), assert);
});

QUnit.test("Fixed Columns with Column Span", function(assert) {
	var iColSpan = 2;
	oTable.setFixedColumnCount(4);
	oTable.getColumns()[2].setHeaderSpan([iColSpan]);
	sap.ui.getCore().applyChanges();

	// Fixed area - First cell
	var oElem = checkFocus(getColumnHeader(0, true), assert);

	// *END* -> Fixed area - Last cell (First cell of the span)
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount() - iColSpan), assert);

	// *END* -> Non-Fixed area - Single cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *HOME* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getColumnHeader(0), assert);
});

QUnit.test("Fixed Columns with Multi Header", function(assert) {
	var iColSpan = 2;
	oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
	oTable.getColumns()[1].setHeaderSpan([iColSpan, 1]);
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
	oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
	oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
	oTable.getColumns()[3].setHeaderSpan([iColSpan, 1]);
	oTable.getColumns()[4].addMultiLabel(new TestControl({text: "d"}));
	oTable.getColumns()[4].addMultiLabel(new TestControl({text: "d2"}));
	oTable.setFixedColumnCount(3);
	sap.ui.getCore().applyChanges();

	/* Test on first column header row */

	// Fixed area - First cell
	var oElem = checkFocus(getColumnHeader(0, true), assert);

	// *END* -> Fixed area - Last cell (First cell of the span)
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount() - iColSpan), assert);

	// *END* -> Non-Fixed area - Single cell (First cell of the span)
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount()), assert);

	// *END* -> Non-Fixed area - Single cell (First cell of the span)
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(getColumnHeader(oTable.getFixedColumnCount()), assert);

	// *HOME* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(getColumnHeader(0), assert);

	/* Test on second column header row */

	// Fixed area - First cell
	oElem = jQuery.sap.domById(getColumnHeader(0).attr("id") + "_1");
	oElem.focus();
	checkFocus(oElem, assert);

	// *END* -> Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(jQuery.sap.domById(getColumnHeader(oTable.getFixedColumnCount() - 1).attr("id") + "_1"), assert);

	// *END* -> Non-Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	oElem = checkFocus(jQuery.sap.domById(getColumnHeader(iNumberOfCols - 1).attr("id") + "_1"), assert);

	// *END* -> Non-Fixed area - Last cell
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(jQuery.sap.domById(getColumnHeader(iNumberOfCols - 1).attr("id") + "_1"), assert);

	// *HOME* -> Non-Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	oElem = checkFocus(jQuery.sap.domById(getColumnHeader(oTable.getFixedColumnCount()).attr("id") + "_1"), assert);

	// *HOME* -> Fixed area - First cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(jQuery.sap.domById(getColumnHeader(0).attr("id") + "_1"), assert);
});

QUnit.test("Group Row Header", function(assert) {
	fakeGroupRow(0);

	// If the focus is on a group row header, the focus should not be changed by pressing Home or End.
	var oElem = getCell(0, 0, true, assert);
	qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
	checkFocus(oElem, assert);
	qutils.triggerKeydown(oElem, Key.END, false, false, false);
	checkFocus(oElem, assert);
});

QUnit.module("TableKeyboardDelegate2 - Navigation > Ctrl+Home & Ctrl+End ", {
	beforeEach: setupTest,
	afterEach: teardownTest
});

QUnit.test("Default Test Table", function(assert) {
	/* Test on row header */

	// SelectAll
	var oElem = checkFocus(getSelectAll(true), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getSelectAll(), assert);

	// *END* -> Last row (scrolled to bottom)
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *END* -> Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *HOME* -> SelectAll (scrolled to top)
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getSelectAll(), assert);
	assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

	// Last row
	oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1, true), assert);

	// *END* -> Last row (scrolled to bottom)
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	/* Test on first content column */

	// Header
	oElem = checkFocus(getColumnHeader(0, true), assert);

	// *HOME* -> Header cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *END* -> Last row (scrolled to bottom)
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *END* -> Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *HOME* -> Header cell (scrolled to top)
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getColumnHeader(0), assert);
	assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

	// Last row
	oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0, true), assert);

	// *END* -> Last row (scrolled to bottom)
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");
});

QUnit.test("Less data rows than visible rows", function(assert) {
	oTable.setVisibleRowCount(10);
	sap.ui.getCore().applyChanges();

	var iNonEmptyVisibleRowCount = TableUtils.getNonEmptyVisibleRowCount(oTable);

	/* Test on row header */

	// SelectAll
	var oElem = checkFocus(getSelectAll(true), assert);

	// *END* -> Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 1), assert);
	assert.equal(oTable.getRows()[oTable._getRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *END* -> Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 1), assert);
	assert.equal(oTable.getRows()[iNonEmptyVisibleRowCount - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getSelectAll(), assert);
	assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

	// Empty area - Last row
	oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1, true), assert);
	assert.equal(oTable.getRows()[oTable._getRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *HOME* -> First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getRowHeader(0, 0), assert);
	assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

	/* Test on first content column */

	// Header cell
	oElem = checkFocus(getColumnHeader(0, true), assert);

	// *END* -> Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getCell(iNonEmptyVisibleRowCount - 1, 0), assert);
	assert.equal(oTable.getRows()[iNonEmptyVisibleRowCount - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *END* -> Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getCell(iNonEmptyVisibleRowCount - 1, 0), assert);
	assert.equal(oTable.getRows()[iNonEmptyVisibleRowCount - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *HOME* -> Header cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getColumnHeader(0), assert);
	assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

	// Empty area -> Last row
	oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0, true), assert);
	assert.equal(oTable.getRows()[oTable._getRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *HOME* -> First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getCell(0, 0), assert);
	assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");
});

QUnit.test("Less data rows than visible rows and Fixed Top/Bottom Rows", function(assert) {
	oTable.setVisibleRowCount(12);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	sap.ui.getCore().applyChanges();

	var iNonEmptyVisibleRowCount = TableUtils.getNonEmptyVisibleRowCount(oTable);

	/* Test on row header */

	// SelectAll
	var oElem = checkFocus(getSelectAll(true), assert);

	// *END* -> Top fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(oTable.getFixedRowCount() - 1), assert);

	// *END* -> Scrollable area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(iNonEmptyVisibleRowCount - oTable.getFixedBottomRowCount() - 1), assert);
	assert.equal(oTable.getRows()[iNonEmptyVisibleRowCount - oTable.getFixedBottomRowCount() - 1].getIndex(),
		iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Row index correct");

	// *END* -> Bottom fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 1), assert);

	// *END* -> Bottom fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 1), assert);

	// *HOME* -> Scrollable area - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getRowHeader(oTable.getFixedRowCount()), assert);
	assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

	// *HOME* -> Top fixed area - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getRowHeader(0), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getSelectAll(), assert);

	// Empty area - Last row
	oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1, true), assert);
	assert.equal(oTable.getRows()[oTable._getRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *HOME* -> Scrollable area - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getRowHeader(oTable.getFixedRowCount()), assert);
	assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

	/* Test on first content column */

	// Header cell
	oElem = checkFocus(getColumnHeader(0, true), assert);

	// *END* -> Top fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getCell(oTable.getFixedRowCount() - 1, 0), assert);

	// *END* -> Scrollable area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getCell(iNonEmptyVisibleRowCount - oTable.getFixedBottomRowCount() - 1, 0), assert);
	assert.equal(oTable.getRows()[iNonEmptyVisibleRowCount - oTable.getFixedBottomRowCount() - 1].getIndex(),
		iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Row index correct");

	// *END* -> Bottom fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getCell(iNonEmptyVisibleRowCount - 1, 0), assert);

	// *END* -> Bottom fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getCell(iNonEmptyVisibleRowCount - 1, 0), assert);

	// *HOME* -> Scrollable area - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);
	assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

	// *HOME* -> Top fixed area - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getCell(0, 0), assert);

	// *HOME* -> Header cell
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getColumnHeader(0), assert);

	// Empty area -> Last row
	oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0, true), assert);
	assert.equal(oTable.getRows()[oTable._getRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *HOME* -> Scrollable area - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);
	assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");
});

QUnit.test("No Column Header", function(assert) {
	oTable.setColumnHeaderVisible(false);
	sap.ui.getCore().applyChanges();

	/* Test on row header */

	// Top cell
	var oElem = checkFocus(getRowHeader(0, true), assert);

	// *HOME* -> First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getRowHeader(0), assert);

	// *END* -> Last row (scrolled to bottom)
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *END* -> Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *HOME* -> First row (scrolled to top)
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getRowHeader(0), assert);
	assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

	/* Test on first content column */

	// Top cell
	oElem = checkFocus(getCell(0, 0, true), assert);

	// *HOME* -> First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getCell(0, 0), assert);

	// *END* -> Last row (scrolled to bottom)
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *END* -> Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

	// *HOME* -> First row (scrolled to top)
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getCell(0, 0), assert);
	assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");
});

QUnit.test("Multi Header and Fixed Top/Bottom Rows", function(assert) {
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
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	sap.ui.getCore().applyChanges();

	/* Test on row header */

	// SelectAll
	var oElem = checkFocus(getSelectAll(true), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getSelectAll(), assert);

	// *END* -> Top fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(oTable.getFixedRowCount() - 1), assert);

	// *END* -> Scrollable area - Last row (scrolled to bottom)
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1].getIndex(),
		iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Row index correct");

	// *END* -> Bottom fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);

	// *ARROW_UP* -> Bottom fixed area - Second-last row
	qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
	oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 2), assert);

	// *END* -> Bottom fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);

	// *END* -> Bottom fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);

	// *HOME* -> Scrollable area - First row (scrolled to top)
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getRowHeader(oTable.getFixedRowCount()), assert);
	assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

	// *HOME* -> Top fixed area - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getRowHeader(0), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getSelectAll(), assert);

	// *END* -> Top fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getRowHeader(oTable.getFixedRowCount() - 1), assert);

	// *HOME* -> SelectAll
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getSelectAll(), assert);

	/* Test on first content column */

	// Header - Second row
	oElem = jQuery.sap.domById(getColumnHeader(0).attr("id") + "_1");
	oElem.focus();
	checkFocus(oElem, assert);

	// *HOME* -> Header - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *HOME* -> Header - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getColumnHeader(0), assert);

	// *END* -> Top fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getCell(oTable.getFixedRowCount() - 1, 0), assert);

	// *END* -> Scrollable area - Last row (scrolled to bottom)
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getCell(oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1, 0), assert);
	assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1].getIndex(),
		iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Row index correct");

	// *END* -> Bottom fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);

	// *ARROW_UP* -> Bottom fixed area - Second-last row
	qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
	oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 2, 0), assert);

	// *END* -> Bottom fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);

	// *END* -> Bottom fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);

	// *HOME* -> Scrollable area - First row (scrolled to top)
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);
	assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

	// *HOME* -> Top fixed area - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getCell(0, 0), assert);

	// *HOME* -> Header - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *END* -> Top fixed area - Last row
	qutils.triggerKeydown(oElem, Key.END, false, false, true);
	oElem = checkFocus(getCell(oTable.getFixedRowCount() - 1, 0), assert);

	// *HOME* -> Header - First row
	qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
	checkFocus(getColumnHeader(0), assert);
});

QUnit.module("TableKeyboardDelegate2 - Navigation > Page Up & Page Down", {
	beforeEach: setupTest,
	afterEach: teardownTest
});

function _testPageKeys(assert) {
	var iNonEmptyVisibleRowCount = TableUtils.getNonEmptyVisibleRowCount(oTable);
	var iPageSize = iNonEmptyVisibleRowCount - oTable.getFixedRowCount() - oTable.getFixedBottomRowCount();
	var iLastScrollableRowIndex = iNonEmptyVisibleRowCount - oTable.getFixedBottomRowCount() - 1;
	var iHeaderRowCount = TableUtils.getHeaderRowCount(oTable);

	/* Test on row header */

	// SelectAll
	var oElem = checkFocus(getSelectAll(true), assert);

	// *PAGE_UP* -> SelectAll
	qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
	checkFocus(getSelectAll(), assert);

	// *PAGE_DOWN* -> First row
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
	oElem = checkFocus(getRowHeader(0), assert);

	// *PAGE_DOWN* -> Scrollable area - Last row
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
	oElem = checkFocus(getRowHeader(iLastScrollableRowIndex), assert);

	// *PAGE_DOWN* -> Scrollable area - Last row - Scroll down all full pages
	for (var i = iLastScrollableRowIndex + iPageSize; i < iNumberOfRows - oTable.getFixedBottomRowCount(); i += iPageSize) {
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
		checkFocus(getRowHeader(iLastScrollableRowIndex), assert);
		assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), i, "Scrolled down: Row index correct");
	}

	// *PAGE_DOWN* -> Last row - Scrolled down the remaining rows
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
	oElem = checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 1), assert);
	assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Scrolled to bottom: Row index correct");

	// *PAGE_DOWN* -> Last row
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
	checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 1), assert);

	if (oTable.getFixedBottomRowCount() > 1) {
		// *ARROW_UP* -> Bottom fixed area - Second-last row
		qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
		oElem = checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 2), assert);

		// *PAGE_DOWN* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
		oElem = checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 1), assert);
	}

	// *PAGE_UP* -> Scrollable area - First row
	qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
	oElem = checkFocus(getRowHeader(oTable.getFixedRowCount()), assert);

	// *PAGE_UP* -> Scrollable area - First row - Scroll up all full pages
	for (var i = iNumberOfRows - oTable.getFixedBottomRowCount() - iPageSize; i >= oTable.getFixedRowCount() + iPageSize; i -= iPageSize) {
		qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
		checkFocus(getRowHeader(oTable.getFixedRowCount()), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), i - iPageSize, "Scrolled up: Row index correct");
	}

	if (oTable.getFixedRowCount() > 0) {
		// *PAGE_UP* -> Top fixed area - First row - Scrolled up the remaining rows
		qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Scrolled to top: Row index correct");
	}

	if (oTable.getFixedRowCount() > 1) {
		// *ARROW_DOWN* -> Top fixed area - Second row
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
		oElem = checkFocus(getRowHeader(1), assert);

		// *PAGE_UP* -> Top fixed area - First row
		qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);
	}

	// *PAGE_UP* -> SelectAll - Scrolled up the remaining rows (it not already)
	qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
	checkFocus(getSelectAll(), assert);
	if (oTable.getFixedRowCount() === 0) {
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Scrolled to top: Row index correct");
	}

	if (oTable._getRowCount() < oTable.getVisibleRowCount()) {
		// Empty area - Last row
		oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1, true), assert);

		// *PAGE_UP* -> Scrollable area - Last row
		qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
		checkFocus(getRowHeader(oTable._getRowCount() - 1, 0), assert);
	}

	/* Test on first content column */

	// Header -> First row
	oElem = checkFocus(getColumnHeader(0, true), assert);

	// *PAGE_UP* -> Header - First row
	qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);

	if (iHeaderRowCount > 1) {
		// *PAGE_DOWN* -> Header - Last row
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(0).attr("id") + "_" + (iHeaderRowCount - 1)), assert);
	}

	// *PAGE_DOWN* -> First row
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
	oElem = checkFocus(getCell(0, 0), assert);

	// *PAGE_DOWN* -> Scrollable area - Last row
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
	oElem = checkFocus(getCell(iLastScrollableRowIndex, 0), assert);

	// *PAGE_DOWN* -> Scrollable area - Last row - Scroll down all full pages
	for (var i = iLastScrollableRowIndex + iPageSize; i < iNumberOfRows - oTable.getFixedBottomRowCount(); i += iPageSize) {
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
		checkFocus(getCell(iLastScrollableRowIndex, 0), assert);
		assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), i, "Scrolled down: Row index correct");
	}

	// *PAGE_DOWN* -> Last row - Scrolled down the remaining rows
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
	oElem = checkFocus(getCell(iNonEmptyVisibleRowCount - 1, 0), assert);
	assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Scrolled to bottom: Row index correct");

	// *PAGE_DOWN* -> Last row
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
	checkFocus(getCell(iNonEmptyVisibleRowCount - 1, 0), assert);

	if (oTable.getFixedBottomRowCount() > 1) {
		// *ARROW_UP* -> Bottom fixed area - Second-last row
		qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
		oElem = checkFocus(getCell(iNonEmptyVisibleRowCount - 2, 0), assert);

		// *PAGE_DOWN* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
		oElem = checkFocus(getCell(iNonEmptyVisibleRowCount - 1, 0), assert);
	}

	// *PAGE_UP* -> Scrollable area - First row
	qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
	oElem = checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);

	// *PAGE_UP* -> Scrollable area - First row - Scroll up all full pages
	for (var i = iNumberOfRows - oTable.getFixedBottomRowCount() - iPageSize; i >= oTable.getFixedRowCount() + iPageSize; i -= iPageSize) {
		qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
		checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), i - iPageSize, "Scrolled up: Row index correct");
	}

	if (oTable.getFixedRowCount() > 0) {
		// *PAGE_UP* -> Top fixed area - First row - Scrolled up the remaining rows
		qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Scrolled to top: Row index correct");
	}

	if (oTable.getFixedRowCount() > 1) {
		// *ARROW_DOWN* -> Top fixed area - Second row
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
		oElem = checkFocus(getCell(1, 0), assert);

		// *PAGE_UP* -> Top fixed area - First row
		qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);
	}

	// *PAGE_UP* -> Header - First row - Scrolled up the remaining rows (if not already)
	qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
	checkFocus(getColumnHeader(0), assert);
	if (oTable.getFixedRowCount() === 0) {
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Scrolled to top: Row index correct");
	}

	if (oTable._getRowCount() < oTable.getVisibleRowCount()) {
		// Empty area -> Last row
		oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0, true), assert);

		// *PAGE_UP* -> Scrollable area - Last row
		qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
		checkFocus(getCell(oTable._getRowCount() - 1, 0), assert);
	}
}

QUnit.test("Default Test Table", function(assert) {
	_testPageKeys(assert);
});

QUnit.test("Less data rows than visible rows", function(assert) {
	oTable.setVisibleRowCount(10);
	sap.ui.getCore().applyChanges();

	_testPageKeys(assert);
});

QUnit.test("Multi Header", function(assert) {
	oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
	oTable.getColumns()[1].setHeaderSpan([2, 1]);
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
	oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
	oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
	sap.ui.getCore().applyChanges();

	_testPageKeys(assert);
});

QUnit.test("Fixed Top/Bottom Rows", function(assert) {
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	sap.ui.getCore().applyChanges();

	_testPageKeys(assert);
});

QUnit.test("Less data rows than visible rows and Fixed Top/Bottom Rows", function(assert) {
	oTable.setVisibleRowCount(10);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	sap.ui.getCore().applyChanges();

	_testPageKeys(assert);
});

QUnit.test("Multi Header and Fixed Top/Bottom Rows", function(assert) {
	oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
	oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
	oTable.getColumns()[1].setHeaderSpan([2, 1]);
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
	oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
	oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
	oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	sap.ui.getCore().applyChanges();

	_testPageKeys(assert);
});

QUnit.module("TableKeyboardDelegate2 - Navigation > Alt+Page Up & Alt+Page Down", {
	iAdditionalColumns: 22,
	beforeEach: function() {
		setupTest();

		// Add more columns for testing of horizontal "scrolling"
		for (var i = 1; i <= this.iAdditionalColumns; i++) {
			oTable.addColumn(new sap.ui.table.Column({
				label: (iNumberOfCols + i) + "_TITLE",
				width: "100px",
				template: new TestControl({
					text: i
				})
			}));
		}
		sap.ui.getCore().applyChanges();
		iNumberOfCols += this.iAdditionalColumns;
	},
	afterEach: function() {
		teardownTest();
		iNumberOfCols -= this.iAdditionalColumns;
	}
});

QUnit.test("Default Test Table - Additional columns", function(assert) {
	/* Test column header */

	// SelectAll
	var oElem = checkFocus(getSelectAll(true), assert);

	// *PAGE_UP* -> SelectAll
	qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
	checkFocus(getSelectAll(), assert);

	// *PAGE_DOWN* -> First cell
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *PAGE_DOWN* -> Scroll right to the last cell
	for (var i = 0; i < iNumberOfCols - 1; i += 5) {
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		oElem = checkFocus(getColumnHeader(Math.min(i + 5, iNumberOfCols - 1)), assert);
	}

	// *PAGE_DOWN* -> Last cell
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
	checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *PAGE_UP* -> Scroll left to the first cell
	for (var i = iNumberOfCols - 1; i >= 0; i -= 5) {
		qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
		oElem = checkFocus(getColumnHeader(Math.max(i - 5, 0)), assert);
	}

	// *PAGE_UP* -> SelectAll
	qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
	checkFocus(getSelectAll(), assert);

	/* Test on first content row */

	// Selection cell
	oElem = checkFocus(getRowHeader(0, true), assert);

	// *PAGE_UP* -> Selection cell
	qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
	checkFocus(getRowHeader(0), assert);

	// *PAGE_DOWN* -> First cell
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
	oElem = checkFocus(getCell(0, 0), assert);

	// *PAGE_DOWN* -> Scroll right to the last cell
	for (var i = 0; i < iNumberOfCols - 1; i += 5) {
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		oElem = checkFocus(getCell(0, Math.min(i + 5, iNumberOfCols - 1)), assert);
	}

	// *PAGE_DOWN* -> Last cell
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
	checkFocus(getCell(0, iNumberOfCols - 1), assert);

	// *PAGE_UP* -> Scroll left to the first cell
	for (var i = iNumberOfCols - 1; i >= 0; i -= 5) {
		qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
		oElem = checkFocus(getCell(0, Math.max(i - 5, 0)), assert);
	}

	// *PAGE_UP* -> Selection cell
	qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
	checkFocus(getRowHeader(0), assert);
});

QUnit.test("No Row Header", function(assert) {
	oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
	sap.ui.getCore().applyChanges();

	/* Test column header */

	// First cell
	var oElem = checkFocus(getColumnHeader(0, true), assert);

	// *PAGE_UP* -> First cell
	qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
	checkFocus(getColumnHeader(0), assert);

	// *PAGE_DOWN* -> Scroll right to the last cell
	for (var i = 0; i < iNumberOfCols - 1; i += 5) {
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		oElem = checkFocus(getColumnHeader(Math.min(i + 5, iNumberOfCols - 1)), assert);
	}

	// *PAGE_DOWN* -> Last cell
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
	checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

	// *PAGE_UP* -> Scroll left to the first cell
	for (var i = iNumberOfCols - 1; i >= 0; i -= 5) {
		qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
		oElem = checkFocus(getColumnHeader(Math.max(i - 5, 0)), assert);
	}

	/* Test on first content row */

	// First cell
	oElem = checkFocus(getCell(0, 0, true), assert);

	// *PAGE_UP* -> First cell
	qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
	checkFocus(getCell(0, 0), assert);

	// *PAGE_DOWN* -> Scroll right to the last cell
	for (var i = 0; i < iNumberOfCols - 1; i += 5) {
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		oElem = checkFocus(getCell(0, Math.min(i + 5, iNumberOfCols - 1)), assert);
	}

	// *PAGE_DOWN* -> Last cell
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
	oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

	// *PAGE_UP* -> Scroll left to the first cell
	for (var i = iNumberOfCols - 1; i >= 0; i -= 5) {
		qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
		oElem = checkFocus(getCell(0, Math.max(i - 5, 0)), assert);
	}
});

QUnit.test("Column Spans", function(assert) {
	oTable.getColumns()[0].setHeaderSpan([3]);
	oTable.getColumns()[1].setHeaderSpan([8]);
	oTable.getColumns()[11].setHeaderSpan([2]);
	oTable.getColumns()[25].setHeaderSpan([2]);
	sap.ui.getCore().applyChanges();

	// First cell (3-span column)
	var oElem = checkFocus(getColumnHeader(0, true), assert);

	// *PAGE_DOWN* -> Second cell (8-span column)
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
	oElem = checkFocus(getColumnHeader(1), assert);

	// *PAGE_DOWN* -> 3rd cell
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
	oElem = checkFocus(getColumnHeader(9), assert);

	// *PAGE_DOWN* -> Scroll right to the last cell
	for (var i = 9; i < iNumberOfCols - 2; i += 5) {
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		oElem = checkFocus(getColumnHeader(Math.min(i + 5, iNumberOfCols - 2), 0), assert);
	}

	// *PAGE_UP* -> Scroll left to the 3rd cell
	for (var i = iNumberOfCols - 2; i > 10; i -= 5) {
		qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
		oElem = checkFocus(getColumnHeader(i - 5), assert);
	}

	// *PAGE_UP* -> Second cell (8-span column)
	qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
	oElem = checkFocus(getColumnHeader(1), assert);

	// *PAGE_UP* -> First cell (3-span column)
	qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
	oElem = checkFocus(getColumnHeader(0), assert);

	// *PAGE_UP* -> SelectAll
	qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
	checkFocus(getSelectAll(), assert);
});

QUnit.test("Group Row Header", function(assert) {
	fakeGroupRow(0);

	// Selection cell
	var oElem = checkFocus(getRowHeader(0, true), assert);

	// *PAGE_DOWN* -> Group header
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
	oElem = checkFocus(getCell(0, 0), assert);

	// *PAGE_DOWN* -> Group header
	qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
	checkFocus(getCell(0, 0), assert);

	// *PAGE_UP* -> Selection cell
	qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
	checkFocus(getRowHeader(0), assert);
});

function _beforeEachF6Test() {
	setupTest();

	// Enhance the Navigation Handler to use the test scope only (not the QUnit related DOM)
	jQuery.sap.handleF6GroupNavigation_orig = jQuery.sap.handleF6GroupNavigation;
	jQuery.sap.handleF6GroupNavigation = function(oEvent, oSettings) {
		oSettings = oSettings ? oSettings : {};
		if (!oSettings.scope) {
			oSettings.scope = jQuery.sap.domById("content");
		}
		jQuery.sap.handleF6GroupNavigation_orig(oEvent, oSettings);
	};
}

function _afterEachF6Test() {
	teardownTest();

	jQuery.sap.handleF6GroupNavigation = jQuery.sap.handleF6GroupNavigation_orig;
	jQuery.sap.handleF6GroupNavigation_orig = null;
}

QUnit.module("TableKeyboardDelegate2 - Navigation > F6", {
	beforeEach: function() {
		_beforeEachF6Test();
	},
	afterEach: function() {
		_afterEachF6Test();
	}
});

QUnit.test("Forward - With Extension and Footer", function(assert) {
	oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
	oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
	sap.ui.getCore().applyChanges();

	var oElem = setFocusOutsideOfTable("Focus1");
	qutils.triggerKeydown(oElem, "F6", false, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);
	qutils.triggerKeydown(oElem, "F6", false, false, false);
	checkFocus(jQuery.sap.domById("Footer"), assert);

	oElem = getCell(1, 1, true, assert);
	qutils.triggerKeydown(oElem, "F6", false, false, false);
	checkFocus(jQuery.sap.domById("Footer"), assert);

	oElem = getRowHeader(1, true, assert);
	qutils.triggerKeydown(oElem, "F6", false, false, false);
	checkFocus(jQuery.sap.domById("Footer"), assert);

	oElem = getSelectAll(true, assert);
	qutils.triggerKeydown(oElem, "F6", false, false, false);
	checkFocus(jQuery.sap.domById("Footer"), assert);

	oElem = getColumnHeader(1, true, assert);
	qutils.triggerKeydown(oElem, "F6", false, false, false);
	checkFocus(jQuery.sap.domById("Footer"), assert);
});

QUnit.module("TableKeyboardDelegate2 - Navigation > Shift+F6", {
	beforeEach: function() {
		_beforeEachF6Test();
	},
	afterEach: function() {
		_afterEachF6Test();
	}
});

QUnit.test("Backward - With Extension and Footer", function(assert) {
	oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
	oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
	sap.ui.getCore().applyChanges();

	var oElem = setFocusOutsideOfTable("Focus2");
	qutils.triggerKeydown(oElem, "F6", true, false, false);
	oElem = checkFocus(getColumnHeader(0), assert);
	qutils.triggerKeydown(oElem, "F6", true, false, false);
	checkFocus(jQuery.sap.domById("Focus1"), assert);

	oElem = getCell(1, 1, true, assert);
	qutils.triggerKeydown(oElem, "F6", true, false, false);
	checkFocus(jQuery.sap.domById("Focus1"), assert);

	oElem = getRowHeader(1, true, assert);
	qutils.triggerKeydown(oElem, "F6", true, false, false);
	checkFocus(jQuery.sap.domById("Focus1"), assert);

	oElem = getSelectAll(true, assert);
	qutils.triggerKeydown(oElem, "F6", true, false, false);
	checkFocus(jQuery.sap.domById("Focus1"), assert);

	oElem = getColumnHeader(1, true, assert);
	qutils.triggerKeydown(oElem, "F6", true, false, false);
	checkFocus(jQuery.sap.domById("Focus1"), assert);
});

QUnit.module("TableKeyboardDelegate2 - Navigation > Overlay", {
	beforeEach: setupTest,
	afterEach: teardownTest
});

QUnit.test("Tab - Default Test Table", function(assert) {
	oTable.setShowOverlay(true);

	var oElem = setFocusOutsideOfTable("Focus1");
	simulateTabEvent(oElem, false);
	oElem = checkFocus(oTable.getDomRef("overlay"), assert);
	simulateTabEvent(oElem, false);
	checkFocus(jQuery.sap.domById("Focus2"), assert);
});

QUnit.test("Tab - With Extension and Footer", function(assert) {
	oTable.setShowOverlay(true);
	oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
	oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
	sap.ui.getCore().applyChanges();

	var oElem = setFocusOutsideOfTable("Focus1");
	simulateTabEvent(oElem, false);
	oElem = checkFocus(oTable.getDomRef("overlay"), assert);
	simulateTabEvent(oElem, false);
	checkFocus(jQuery.sap.domById("Focus2"), assert);
});

QUnit.test("Shift+Tab - Default", function(assert) {
	oTable.setShowOverlay(true);

	var oElem = setFocusOutsideOfTable("Focus2");
	simulateTabEvent(oElem, true);
	oElem = checkFocus(oTable.getDomRef("overlay"), assert);
	simulateTabEvent(oElem, true);
	checkFocus(jQuery.sap.domById("Focus1"), assert);
});

QUnit.test("Shift+Tab - With Extension and Footer", function(assert) {
	oTable.setShowOverlay(true);
	oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
	oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
	sap.ui.getCore().applyChanges();

	var oElem = setFocusOutsideOfTable("Focus2");
	simulateTabEvent(oElem, true);
	oElem = checkFocus(oTable.getDomRef("overlay"), assert);
	simulateTabEvent(oElem, true);
	checkFocus(jQuery.sap.domById("Focus1"), assert);
});

QUnit.module("TableKeyboardDelegate2 - Navigation > NoData", {
	beforeEach: setupTest,
	afterEach: teardownTest
});

QUnit.asyncTest("Tab - Default Test Table", function(assert) {
	function doAfterNoDataDisplayed() {
		oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Focus2"), assert);

		QUnit.start();
	}

	oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
	oTable.setModel(new sap.ui.model.json.JSONModel());
});

QUnit.asyncTest("Tab - Without Column Header", function(assert) {
	function doAfterNoDataDisplayed() {
		oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Focus2"), assert);

		QUnit.start();
	}

	oTable.setColumnHeaderVisible(false);
	sap.ui.getCore().applyChanges();
	oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
	oTable.setModel(new sap.ui.model.json.JSONModel());
});

QUnit.asyncTest("Tab - With Extension and Footer", function(assert) {
	function doAfterNoDataDisplayed() {
		oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Extension"), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Footer"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Focus2"), assert);

		QUnit.start();
	}

	oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
	oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
	sap.ui.getCore().applyChanges();
	oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
	oTable.setModel(new sap.ui.model.json.JSONModel());
});

QUnit.asyncTest("Shift+Tab", function(assert) {
	function doAfterNoDataDisplayed() {
		oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

		var oElem = setFocusOutsideOfTable("Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(getColumnHeader(0), assert);
		simulateTabEvent(oElem, true);
		checkFocus(jQuery.sap.domById("Focus1"), assert);

		QUnit.start();
	}

	oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
	oTable.setModel(new sap.ui.model.json.JSONModel());
});

QUnit.asyncTest("Shift+Tab - With Extension and Footer", function(assert) {
	function doAfterNoDataDisplayed() {
		oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

		var oElem = setFocusOutsideOfTable("Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(jQuery.sap.domById("Footer"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(getColumnHeader(0), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(jQuery.sap.domById("Extension"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(jQuery.sap.domById("Focus1"), assert);

		QUnit.start();
	}

	oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
	oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
	sap.ui.getCore().applyChanges();
	oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
	oTable.setModel(new sap.ui.model.json.JSONModel());
});

QUnit.asyncTest("No Vertical Navigation (Header <-> Content)", function(assert) {
	function doAfterNoDataDisplayed() {
		oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		checkFocus(getColumnHeader(0), assert);

		QUnit.start();
	}

	oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
	oTable.setModel(new sap.ui.model.json.JSONModel());
});

QUnit.module("TableKeyboardDelegate2 - Navigation > NoData & Overlay", {
	beforeEach: setupTest,
	afterEach: teardownTest
});

QUnit.asyncTest("No Navigation", function(assert) {
	function doAfterNoDataDisplayed() {
		oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		var sId = "noDataCnt";

		while (sId) {
			var oElem = oTable.$(sId);
			oElem.focus();
			oElem = checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.END, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.END, false, false, true);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
			checkFocus(oElem, assert);

			sId = sId == "noDataCnt" ? "overlay" : null;
			oTable.setShowOverlay(true);
		}

		QUnit.start();
	}

	oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
	oTable.setModel(new sap.ui.model.json.JSONModel());
});

QUnit.asyncTest("Tab", function(assert) {
	function doAfterNoDataDisplayed() {
		oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Focus2"), assert);

		QUnit.start();
	}

	oTable.setShowOverlay(true);
	oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
	oTable.setModel(new sap.ui.model.json.JSONModel());
});

QUnit.asyncTest("Shift+Tab", function(assert) {
	function doAfterNoDataDisplayed() {
		oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

		var oElem = setFocusOutsideOfTable("Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(jQuery.sap.domById("Focus1"), assert);

		QUnit.start();
	}

	oTable.setShowOverlay(true);
	oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
	oTable.setModel(new sap.ui.model.json.JSONModel());
});

QUnit.module("TableKeyboardDelegate2 - Navigation > BusyIndicator", {
	beforeEach: function() {
		setupTest();

		oTable.setBusyIndicatorDelay(0);
		oTable.setBusy(true);
		sap.ui.getCore().applyChanges();
	},
	afterEach: function() {
		teardownTest();
	}
});

QUnit.test("Tab", function(assert) {
	var oElem = setFocusOutsideOfTable("Focus1");
	simulateTabEvent(oElem, false);
	// Due to changed BusyIndicator handling - BusyIndicator is now tabbable
	oElem = jQuery.sap.domById(oTable.getId() + "-busyIndicator");
	checkFocus(oElem, assert);
	simulateTabEvent(oElem, false);
	checkFocus(jQuery.sap.domById("Focus2"), assert);
});

QUnit.test("Shift+Tab", function(assert) {
	var oElem = setFocusOutsideOfTable("Focus2");
	simulateTabEvent(oElem, true);
	// Due to changed BusyIndicator handling - BusyIndicator is now tabbable
	oElem = jQuery.sap.domById(oTable.getId() + "-busyIndicator");
	checkFocus(oElem, assert);
	simulateTabEvent(oElem, true);
	checkFocus(jQuery.sap.domById("Focus1"), assert);
});

QUnit.module("TableKeyboardDelegate2 - Navigation > Special Cases", {
	beforeEach: setupTest,
	afterEach: teardownTest
});

QUnit.test("Focus on cell content - Home & End & Arrow Keys", function(assert) {
	var oElem = findTabbables(getCell(0, 0).get(0), [getCell(0, 0).get(0)], true);
	oElem.focus();

	// If the focus is on an element inside the cell,
	// the focus should not be changed when pressing one of the following keys.
	var aKeys = [Key.HOME, Key.END, Key.Arrow.LEFT, Key.Arrow.UP, Key.Arrow.RIGHT, Key.Arrow.DOWN];

	checkFocus(oElem, assert);
	for (var i = 0; i < aKeys.length; i++) {
		qutils.triggerKeydown(oElem, aKeys[i], false, false, false);
		checkFocus(oElem, assert);
	}
});

QUnit.module("TableKeyboardDelegate2 - Interaction > Shift+Up & Shift+Down (Range Selection)", {
	beforeEach: function() {
		setupTest();
		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
		sap.ui.getCore().applyChanges();
	},
	afterEach: teardownTest,
	assertSelection: function(assert, iIndex, bSelected) {
		assert.equal(oTable.isIndexSelected(iIndex), bSelected, "Row " + (iIndex + 1) + ": " + (bSelected ? "" : "Not ") + "Selected");
	},
	getCellOrRowHeader: function(bRowHeader, iRowIndex, iColumnIndex, bFocus) {
		if (bRowHeader) {
			return getRowHeader(iRowIndex, bFocus);
		} else {
			return getCell(iRowIndex, iColumnIndex, bFocus);
		}
	}
});

/**
 * A test for range selection and deselection.
 * Start from the middle of the table -> Move up to the top -> Move down to the bottom -> Move up to the starting row.
 * @private
 * @param assert
 */
function _testRangeSelection(assert) {
	var iVisibleRowCount = oTable.getVisibleRowCount();
	var iStartIndex = Math.floor(iNumberOfRows / 2);
	var iIndex;

	function test(bSelect, bRowHeader) {
		// Prepare selection states. Set the selection states of the first and last row equal to the selection state of the starting row
		// to see if already correctly set selection states are preserved.
		oTable.clearSelection();
		if (bSelect) {
			oTable.addSelectionInterval(0, 0);
			oTable.addSelectionInterval(iStartIndex, iStartIndex);
			oTable.addSelectionInterval(iNumberOfRows - 1, iNumberOfRows - 1);
		} else {
			oTable.selectAll();
			oTable.removeSelectionInterval(0, 0);
			oTable.removeSelectionInterval(iStartIndex, iStartIndex);
			oTable.removeSelectionInterval(iNumberOfRows - 1, iNumberOfRows - 1);
		}
		oTable.setFirstVisibleRow(iStartIndex);
		sap.ui.getCore().applyChanges();

		// Prepare focus.
		var oElem = this.getCellOrRowHeader(bRowHeader, 0, 0, true);
		this.assertSelection(assert, iStartIndex, bSelect);

		// Start selection mode.
		qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false);

		// Move up to the first row. All rows above the starting row should get (de)selected.
		for (var i = iStartIndex - 1; i >= 0; i--) {
			qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
			iIndex = i;
			if (i >= oTable.getFixedRowCount() && i < iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
				iIndex = oTable.getFixedRowCount();
			} else if (i >= iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
				iIndex = i - (iNumberOfRows - oTable.getVisibleRowCount());
			}
			oElem = this.getCellOrRowHeader(bRowHeader, iIndex, 0);
			this.assertSelection(assert, oTable.getRows()[iIndex].getIndex(), bSelect);
		}

		qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
		this.assertSelection(assert, 0, bSelect);

		// Move down to the starting row. When moving back down the rows always get deselected.
		for (var i = 1; i <= iStartIndex; i++) {
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
			iIndex = i;
			if (i >= iVisibleRowCount - oTable.getFixedBottomRowCount() && i < iNumberOfRows - oTable.getFixedBottomRowCount()) {
				iIndex = iVisibleRowCount - oTable.getFixedBottomRowCount() - 1;
			} else if (i >= iNumberOfRows - oTable.getFixedBottomRowCount()) {
				iIndex = i - (iNumberOfRows - iVisibleRowCount);
			}
			oElem = this.getCellOrRowHeader(bRowHeader, iIndex, 0);

			this.assertSelection(assert, oTable.getRows()[iIndex - 1].getIndex(), false);
		}

		this.assertSelection(assert, iStartIndex, bSelect); // Selection state of the starting row never gets changed.

		// Move down to the last row. All rows beneath the starting row should get (de)selected.
		for (var i = iStartIndex + 1; i < iNumberOfRows; i++) {
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
			iIndex = i;
			if (i >= iVisibleRowCount - oTable.getFixedBottomRowCount() && i < iNumberOfRows - oTable.getFixedBottomRowCount()) {
				iIndex = iVisibleRowCount - oTable.getFixedBottomRowCount() - 1;
			} else if (i >= iNumberOfRows - oTable.getFixedBottomRowCount()) {
				iIndex = i - (iNumberOfRows - iVisibleRowCount);
			}
			oElem = this.getCellOrRowHeader(bRowHeader, iIndex, 0);

			this.assertSelection(assert, oTable.getRows()[iIndex].getIndex(), bSelect);
		}

		// Move up to the starting row. When moving back up the rows always get deselected
		for (var i = iNumberOfRows - 2; i >= iStartIndex; i--) {
			qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
			iIndex = i;
			if (i >= oTable.getFixedRowCount() && i < iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
				iIndex = oTable.getFixedRowCount();
			} else if (i >= iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
				iIndex = i - (iNumberOfRows - oTable.getVisibleRowCount());
			}
			oElem = this.getCellOrRowHeader(bRowHeader, iIndex, 0);

			this.assertSelection(assert, oTable.getRows()[iIndex + 1].getIndex(), false);
		}

		this.assertSelection(assert, iStartIndex, bSelect); // Selection state of the starting row never gets changed.

		/* Cancellation of the row selection mode. */

		// Prepare selection states.
		if (bSelect) {
			oTable.clearSelection();
			oTable.addSelectionInterval(iStartIndex, iStartIndex);
		} else {
			oTable.selectAll();
			oTable.removeSelectionInterval(iStartIndex, iStartIndex);
		}
		oTable.setFirstVisibleRow(iStartIndex - (iVisibleRowCount - 1));
		sap.ui.getCore().applyChanges();

		oElem = this.getCellOrRowHeader(bRowHeader, iVisibleRowCount - 1, 0, true);

		// Move down to the last row. All rows beneath the starting row should get (de)selected.
		for (var i = iStartIndex + 1; i < iNumberOfRows; i++) {
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
			iIndex = i;
			if (i >= iVisibleRowCount - oTable.getFixedBottomRowCount() && i < iNumberOfRows - oTable.getFixedBottomRowCount()) {
				iIndex = iVisibleRowCount - oTable.getFixedBottomRowCount() - 1;
			} else if (i >= iNumberOfRows - oTable.getFixedBottomRowCount()) {
				iIndex = i - (iNumberOfRows - iVisibleRowCount);
			}
			oElem = this.getCellOrRowHeader(bRowHeader, iIndex, 0);

			this.assertSelection(assert, oTable.getRows()[iIndex].getIndex(), bSelect);
		}

		// End selection mode.
		qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false);

		// Move up to the starting row. Selection states should not change because selection mode was canceled.
		for (var i = iNumberOfRows - 2; i >= iStartIndex; i--) {
			qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
			iIndex = i;
			if (i >= oTable.getFixedRowCount() && i < iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
				iIndex = oTable.getFixedRowCount();
			} else if (i >= iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
				iIndex = i - (iNumberOfRows - oTable.getVisibleRowCount());
			}
			oElem = this.getCellOrRowHeader(bRowHeader, iIndex, 0);

			this.assertSelection(assert, oTable.getRows()[iIndex + 1].getIndex(), bSelect);
		}

		this.assertSelection(assert, iStartIndex, bSelect); // Selection state of the starting row never gets changed.

		// Start selection mode.
		qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false);

		// Move up to the first row. All rows above the starting row should get (de)selected.
		for (var i = iStartIndex - 1; i >= 0; i--) {
			qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
			iIndex = i;
			if (i >= oTable.getFixedRowCount() && i < iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
				iIndex = oTable.getFixedRowCount();
			} else if (i >= iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
				iIndex = i - (iNumberOfRows - oTable.getVisibleRowCount());
			}
			oElem = this.getCellOrRowHeader(bRowHeader, iIndex, 0);
			this.assertSelection(assert, oTable.getRows()[iIndex].getIndex(), bSelect);
		}

		// End selection mode.
		qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false);

		// Move down to the starting row. Selection states should not change because selection mode was canceled.
		for (var i = 1; i <= iStartIndex; i++) {
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
			iIndex = i;
			if (i >= iVisibleRowCount - oTable.getFixedBottomRowCount() && i < iNumberOfRows - oTable.getFixedBottomRowCount()) {
				iIndex = iVisibleRowCount - oTable.getFixedBottomRowCount() - 1;
			} else if (i >= iNumberOfRows - oTable.getFixedBottomRowCount()) {
				iIndex = i - (iNumberOfRows - iVisibleRowCount);
			}
			oElem = this.getCellOrRowHeader(bRowHeader, iIndex, 0);

			this.assertSelection(assert, oTable.getRows()[iIndex - 1].getIndex(), bSelect);
		}
	}

	test.call(this, true, true);
	test.call(this, true, false);
	test.call(this, false, true);
	test.call(this, false, false);
}

QUnit.test("Enter and Leave the Range Selection mode", function(assert) {
	var oElem = getRowHeader(0, true);

	assert.ok(oTable._oRangeSelection === undefined, "Range Selection Mode: Not active");

	// Start selection mode.
	qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false);
	assert.ok(oTable._oRangeSelection !== undefined, "Range Selection Mode: Active");

	// End selection mode.
	qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false);
	assert.ok(oTable._oRangeSelection === undefined, "Range Selection Mode: Not active");

	// Start selection mode.
	qutils.triggerKeydown(oElem, Key.SHIFT, true, false, false);
	assert.ok(oTable._oRangeSelection !== undefined, "Range Selection Mode: Active");

	// End selection mode.
	qutils.triggerKeyup(oElem, Key.SHIFT, true, false, false);
	assert.ok(oTable._oRangeSelection === undefined, "Range Selection Mode: Not active");
});

QUnit.test("Default Test Table - Reverse Range Selection", function(assert) {
	_testRangeSelection.call(this, assert);
});

QUnit.test("Fixed Rows - Reverse Range Selection", function(assert) {
	_testRangeSelection.call(this, assert);
});

QUnit.test("Default Test Table - Move between Row Header and Row", function(assert) {
	oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
	sap.ui.getCore().applyChanges();

	var oElem = getRowHeader(0, true);

	// Start selection mode.
	qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false);

	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	oElem = getCell(0, 0);
	this.assertSelection(assert, 0, true);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
	oElem = getCell(1, 0);
	this.assertSelection(assert, 1, true);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	oElem = getRowHeader(1);
	this.assertSelection(assert, 1, true);
	qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
	oElem = getRowHeader(2);
	this.assertSelection(assert, 2, true);
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	oElem = getCell(2, 0);
	this.assertSelection(assert, 2, true);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
	oElem = getCell(1, 0);
	this.assertSelection(assert, 2, false);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	oElem = getRowHeader(1);
	this.assertSelection(assert, 2, false);
	qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
	this.assertSelection(assert, 1, false);
});

QUnit.module("TableKeyboardDelegate2 - Interaction > Shift+Left & Shift+Right (Column Resizing)", {
	beforeEach: function() {
		setupTest();
		oTable._getVisibleColumns()[2].setResizable(false);
		sap.ui.getCore().applyChanges();
	},
	afterEach: teardownTest
});

QUnit.test("Default Test Table - Resize fixed column", function(assert) {
	var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
	var iColumnResizeStep = oTable._CSSSizeToPixel("1em");

	var oElem = getColumnHeader(0, true);
	for (var i = TableUtils.Column.getColumnWidth(oTable, 0); i - iColumnResizeStep > iMinColumnWidth; i -= iColumnResizeStep) {
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), i - iColumnResizeStep,
			"Column width decreased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 0) + "px");
	}

	var iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 0);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), iMinColumnWidth,
		"Column width decreased by " + (iColumnWidthBefore - TableUtils.Column.getColumnWidth(oTable, 0)) + "px to the minimum width of " + iMinColumnWidth + "px");
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), iMinColumnWidth,
		"Column width could not be decreased below the minimum of " + iMinColumnWidth + "px");

	for (var i = 0; i < 10; i++) {
		iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 0);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), iColumnWidthBefore + iColumnResizeStep,
			"Column width increased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 0) + "px");
	}
});

QUnit.test("Default Test Table - Resize column", function(assert) {
	var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
	var iColumnResizeStep = oTable._CSSSizeToPixel("1em");

	var oElem = getColumnHeader(1, true);
	for (var i = TableUtils.Column.getColumnWidth(oTable, 1); i - iColumnResizeStep > iMinColumnWidth; i -= iColumnResizeStep) {
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), i - iColumnResizeStep,
			"Column width decreased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 1) + "px");
	}

	var iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 1);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), iMinColumnWidth,
		"Column width decreased by " + (iColumnWidthBefore - TableUtils.Column.getColumnWidth(oTable, 1)) + "px to the minimum width of " + iMinColumnWidth + "px");
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), iMinColumnWidth,
		"Column width could not be decreased below the minimum of " + iMinColumnWidth + "px");

	for (var i = 0; i < 10; i++) {
		iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 1);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), iColumnWidthBefore + iColumnResizeStep,
			"Column width increased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 1) + "px");
	}
});

QUnit.test("Multi Header - Resize spans", function(assert) {
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
	var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
	var iColumnResizeStep = oTable._CSSSizeToPixel("1em");
	var oElem;

	function test(aResizingColumns, aNotResizingColumns) {
		var iSharedColumnResizeStep = Math.round(iColumnResizeStep / aResizingColumns.length);
		var iMaxColumnSize = 0;
		var iNewColumnWidth;

		var aOriginalNotResizingColumnWidths = [];
		for (var i = 0; i < aNotResizingColumns.length; i++) {
			aOriginalNotResizingColumnWidths.push(TableUtils.Column.getColumnWidth(oTable, aNotResizingColumns[i].getIndex()));
		}

		for (var i = 0; i < aResizingColumns.length; i++) {
			iMaxColumnSize = Math.max(iMaxColumnSize, TableUtils.Column.getColumnWidth(oTable, aResizingColumns[i].getIndex()));
		}

		// Decrease the size to the minimum.
		for (var i = iMaxColumnSize; i - iSharedColumnResizeStep > iMinColumnWidth; i -= iSharedColumnResizeStep) {
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);

			// Check resizable columns.
			for (var j = 0; j < aResizingColumns.length; j++) {
				iNewColumnWidth = TableUtils.Column.getColumnWidth(oTable, aResizingColumns[j].getIndex());
				assert.strictEqual(iNewColumnWidth, Math.max(iMinColumnWidth, i - iSharedColumnResizeStep),
					"Column " + (aResizingColumns[j].getIndex() + 1) + " width decreased by " + iSharedColumnResizeStep + "px to " + iNewColumnWidth + "px");
			}

			// Check not resizable columns.
			for (var j = 0; j < aNotResizingColumns.length; j++) {
				assert.strictEqual(aOriginalNotResizingColumnWidths[j], TableUtils.Column.getColumnWidth(oTable, aNotResizingColumns[j].getIndex()),
					"Column " + (aNotResizingColumns[j].getIndex() + 1) + " width did not change");
			}
		}

		// Ensure that all resizable columns widths were resized to the minimum.
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);

		// Check resizable columns for minimum width.
		for (var i = 0; i < aResizingColumns.length; i++) {
			assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, aResizingColumns[i].getIndex()), iMinColumnWidth,
				"Column " + (aResizingColumns[i].getIndex() + 1) + " width decreased to the minimum width of " + iMinColumnWidth + "px");
		}

		// Check not resizable columns for unchanged width.
		for (var i = 0; i < aNotResizingColumns.length; i++) {
			assert.strictEqual(aOriginalNotResizingColumnWidths[i], TableUtils.Column.getColumnWidth(oTable, aNotResizingColumns[i].getIndex()),
				"Column " + (aNotResizingColumns[i].getIndex() + 1) + " width did not change");
		}

		// Increase the size.
		for (var i = 0; i < 10; i++) {
			var aOriginalColumnWidths = [];
			for (var j = 0; j < aResizingColumns.length; j++) {
				aOriginalColumnWidths.push(TableUtils.Column.getColumnWidth(oTable, aResizingColumns[j].getIndex()));
			}

			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);

			// Check resizable columns.
			for (var j = 0; j < aResizingColumns.length; j++) {
				iNewColumnWidth = TableUtils.Column.getColumnWidth(oTable, aResizingColumns[j].getIndex());
				assert.strictEqual(iNewColumnWidth, aOriginalColumnWidths[j] + iSharedColumnResizeStep,
					"Column " + (aResizingColumns[j].getIndex() + 1) + " width increased by " + iSharedColumnResizeStep + "px to " + iNewColumnWidth + "px");
			}

			// Check not resizable columns.
			for (var j = 0; j < aNotResizingColumns.length; j++) {
				assert.strictEqual(aOriginalNotResizingColumnWidths[j], TableUtils.Column.getColumnWidth(oTable, aNotResizingColumns[j].getIndex()),
					"Column " + (aNotResizingColumns[j].getIndex() + 1) + " width did not change");
			}
		}
	}

	// Top row - Span over all 3 columns (3rd. column is not resizable)
	oElem = getColumnHeader(0, true);
	test.call(this, [aVisibleColumns[0], aVisibleColumns[1]], [aVisibleColumns[2]]);

	// Second row - First span over 2 columns
	oElem = jQuery.sap.domById(getColumnHeader(0).attr("id") + "_1");
	oElem.focus();
	test.call(this, [aVisibleColumns[0], aVisibleColumns[1]], aVisibleColumns[2]);

	// Last row - Second column
	oElem = jQuery.sap.domById(getColumnHeader(1).attr("id") + "_2");
	oElem.focus();
	test.call(this, [aVisibleColumns[1]], [aVisibleColumns[0], aVisibleColumns[2]]);
});

QUnit.test("Default Test Table - Resize not resizable column", function(assert) {
	var iOriginalColumnWidth = TableUtils.Column.getColumnWidth(oTable, 2);

	var oElem = getColumnHeader(2, true);
	qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
	assert.strictEqual(iOriginalColumnWidth, TableUtils.Column.getColumnWidth(oTable, 2), "Column width did not change (" + iOriginalColumnWidth + "px)");
	qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
	assert.strictEqual(iOriginalColumnWidth, TableUtils.Column.getColumnWidth(oTable, 2), "Column width did not change (" + iOriginalColumnWidth + "px)");
});

QUnit.module("TableKeyboardDelegate2 - Interaction > Ctrl+Left & Ctrl+Right (Column Reordering)", {
	beforeEach: function() {
		setupTest();
		oTable.setFixedColumnCount(0);
		sap.ui.getCore().applyChanges();
	},
	afterEach: teardownTest
});

QUnit.test("Default Test Table - Move columns", function(assert) {
	var done = assert.async();
	var oFirstColumn = oTable.getColumns()[0];
	var oLastColumn = oTable.getColumns()[iNumberOfCols - 1];
	var iOldColumnIndex, iNewColumnIndex;

	// First column.
	iOldColumnIndex = oFirstColumn.$().data("sap-ui-colindex");
	qutils.triggerKeydown(getColumnHeader(0), Key.Arrow.LEFT, false, false, true);

	new Promise(function(resolve) {
		window.setTimeout(function() {
			iNewColumnIndex = oFirstColumn.$().data("sap-ui-colindex");
			assert.strictEqual(iNewColumnIndex, iOldColumnIndex, "First column was not moved to the left");

			qutils.triggerKeydown(getColumnHeader(0), Key.Arrow.RIGHT, false, false, true);

			resolve();
		}, 0);
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oFirstColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex + 1, "First column was moved to the right");

				iOldColumnIndex = oFirstColumn.$().data("sap-ui-colindex");
				qutils.triggerKeydown(getColumnHeader(1), Key.Arrow.LEFT, false, false, true);

				resolve();
			}, 0);
		});
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oFirstColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex - 1, "It was moved back to the left");

				// Last column.
				iOldColumnIndex = oLastColumn.$().data("sap-ui-colindex");
				qutils.triggerKeydown(getColumnHeader(iNumberOfCols - 1), Key.Arrow.RIGHT, false, false, true);

				resolve();
			}, 0);
		});
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oLastColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex, "Last column was not moved to the right");

				qutils.triggerKeydown(getColumnHeader(iNumberOfCols - 1), Key.Arrow.LEFT, false, false, true);

				resolve();
			}, 0);
		});
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oLastColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex - 1, "Last column was moved to the left");

				iOldColumnIndex = oLastColumn.$().data("sap-ui-colindex");
				qutils.triggerKeydown(getColumnHeader(iNumberOfCols - 2), Key.Arrow.RIGHT, false, false, true);

				resolve();
			}, 0);
		});
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oLastColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex + 1, "It was moved back to the right");

				resolve();
			}, 0);
		});
	}).then(function() {
		done();
	});
});

QUnit.test("Fixed Columns - Move fixed columns", function(assert) {
	oTable.setFixedColumnCount(2);
	sap.ui.getCore().applyChanges();

	var done = assert.async();
	var oFirstFixedColumn = oTable.getColumns()[0];
	var oLastFixedColumn = oTable.getColumns()[1];
	var iOldColumnIndex, iNewColumnIndex;

	// First fixed column.
	iOldColumnIndex = oFirstFixedColumn.$().data("sap-ui-colindex");
	qutils.triggerKeydown(getColumnHeader(0), Key.Arrow.LEFT, false, false, true);

	new Promise(function(resolve) {
		window.setTimeout(function() {
			iNewColumnIndex = oFirstFixedColumn.$().data("sap-ui-colindex");
			assert.strictEqual(iNewColumnIndex, iOldColumnIndex, "First fixed column was not moved to the left");

			qutils.triggerKeydown(getColumnHeader(0), Key.Arrow.RIGHT, false, false, true);

			resolve();
		}, 0);
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oFirstFixedColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex, "First fixed column was not moved to the right");

				// Last fixed column.
				iOldColumnIndex = oLastFixedColumn.$().data("sap-ui-colindex");
				qutils.triggerKeydown(getColumnHeader(1), Key.Arrow.RIGHT, false, false, true);

				resolve();
			}, 0);
		});
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oLastFixedColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex, "Last fixed column was not moved to the right");

				qutils.triggerKeydown(getColumnHeader(1), Key.Arrow.LEFT, false, false, true);
				iNewColumnIndex = oLastFixedColumn.$().data("sap-ui-colindex");

				resolve();
			}, 0);
		});
	}).then(function() {
		return new Promise(function(resolve) {
			assert.strictEqual(iNewColumnIndex, iOldColumnIndex, "Last fixed column was not moved to the left");

			resolve();
		});
	}).then(function() {
		done();
	});
});

QUnit.test("Fixed Columns - Move movable columns", function(assert) {
	oTable.setFixedColumnCount(2);
	sap.ui.getCore().applyChanges();

	var done = assert.async();
	var oFirstColumn = oTable.getColumns()[2];
	var oLastColumn = oTable.getColumns()[iNumberOfCols - 1];
	var iOldColumnIndex, iNewColumnIndex;

	// First normal column.
	iOldColumnIndex = oFirstColumn.$().data("sap-ui-colindex");
	qutils.triggerKeydown(getColumnHeader(2), Key.Arrow.LEFT, false, false, true);

	new Promise(function(resolve) {
		window.setTimeout(function() {
			iNewColumnIndex = oFirstColumn.$().data("sap-ui-colindex");
			assert.strictEqual(iNewColumnIndex, iOldColumnIndex, "First movable column was not moved to the left");

			qutils.triggerKeydown(getColumnHeader(2), Key.Arrow.RIGHT, false, false, true);

			resolve();
		}, 0);
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oFirstColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex + 1, "First movable column was moved to the right");

				iOldColumnIndex = oFirstColumn.$().data("sap-ui-colindex");
				qutils.triggerKeydown(getColumnHeader(3), Key.Arrow.LEFT, false, false, true);

				resolve();
			}, 0);
		});
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oFirstColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex - 1, "It was moved back to the left");

				// Last normal column.
				iOldColumnIndex = oLastColumn.$().data("sap-ui-colindex");
				qutils.triggerKeydown(getColumnHeader(iNumberOfCols - 1), Key.Arrow.RIGHT, false, false, true);

				resolve();
			}, 0);
		});
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oLastColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex, "Last movable column was not moved to the right");

				qutils.triggerKeydown(getColumnHeader(iNumberOfCols - 1), Key.Arrow.LEFT, false, false, true);

				resolve();
			}, 0);
		});
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oLastColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex - 1, "Last movable column was moved to the left");

				iOldColumnIndex = oLastColumn.$().data("sap-ui-colindex");
				qutils.triggerKeydown(getColumnHeader(iNumberOfCols - 2), Key.Arrow.RIGHT, false, false, true);

				resolve();
			}, 0);
		});
	}).then(function() {
		return new Promise(function(resolve) {
			window.setTimeout(function() {
				iNewColumnIndex = oLastColumn.$().data("sap-ui-colindex");
				assert.strictEqual(iNewColumnIndex, iOldColumnIndex + 1, "It was moved back to the right");

				resolve();
			}, 0);
		});
	}).then(function() {
		done();
	});
});

/**
 * Opens a column header conext menu and closes it by pressing the Escape key.
 * @param sKey The key to press.
 * @param bKeydown Indicates whether to trigger keydown or keyup.
 * @param bShift
 * @private
 */
function _testColumnHeaderContextMenus(sKey, bKeydown, bShift) {
	var oColumn = oTable.getColumns()[0];
	oColumn.setSortProperty("dummy");
	var oElem = checkFocus(getColumnHeader(0, true), assert);
	var oColumnMenu = oColumn.getMenu();

	assert.ok(!oColumnMenu.bOpen, "Menu is closed");
	if (bKeydown) {
		qutils.triggerKeydown(oElem, sKey, bShift, false, false);
	} else {
		qutils.triggerKeyup(oElem, sKey, bShift, false, false);
	}
	assert.ok(oColumnMenu.bOpen, "Menu is opened");
	var bFirstItemHovered = oColumnMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
	assert.strictEqual(bFirstItemHovered, true, "The first item in the menu is hovered");
	qutils.triggerKeydown(document.activeElement, Key.ESCAPE, false, false, false);
	assert.ok(!oColumnMenu.bOpen, "Menu is closed");
	checkFocus(oElem, assert);
}

QUnit.module("TableKeyboardDelegate2 - Interaction > Space & Enter", {
	beforeEach: function() {
		setupTest();
	},
	afterEach: teardownTest,
	assertSelection: function(assert, iIndex, bSelected) {
		assert.equal(oTable.isIndexSelected(iIndex), bSelected, "Row " + (iIndex + 1) + ": " + (bSelected ? "" : "Not ") + "Selected");
	}
});

QUnit.test("On a Column Header", function(assert) {
	_testColumnHeaderContextMenus(Key.SPACE, false, false);
	_testColumnHeaderContextMenus(Key.ENTER, false, false);
});

QUnit.test("On SelectAll", function(assert) {
	oTable.clearSelection();
	sap.ui.getCore().applyChanges();

	var oElem = checkFocus(getSelectAll(true), assert);

	// Space
	assert.ok(oTable._oSelection.aSelectedIndices.length === 0, "No rows are selected");
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	assert.ok(TableUtils.areAllRowsSelected(oTable), "All rows are selected");
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	assert.ok(oTable._oSelection.aSelectedIndices.length === 0, "No rows are selected");

	// Enter
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	assert.ok(TableUtils.areAllRowsSelected(oTable), "All rows are selected");
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	assert.ok(oTable._oSelection.aSelectedIndices.length === 0, "No rows are selected");
});

QUnit.test("On a Row Header", function(assert) {
	oTable.clearSelection();
	sap.ui.getCore().applyChanges();

	var oElem = checkFocus(getRowHeader(0, true), assert);

	// Space
	this.assertSelection(assert, 0, false);
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	this.assertSelection(assert, 0, true);
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	this.assertSelection(assert, 0, false);
	qutils.triggerKeyup(oElem, Key.SPACE, true, false, false);
	this.assertSelection(assert, 0, false);

	// Enter
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	this.assertSelection(assert, 0, true);
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	this.assertSelection(assert, 0, false);
});

QUnit.test("On a Data Cell - Row selection possible", function(assert) {
	var iCallCount = 0;
	var bPreventDefault = false;

	oTable.clearSelection();
	oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
	oTable.attachCellClick(function(oEvent) {
		iCallCount++;
		if (bPreventDefault) {
			oEvent.preventDefault();
		}
	});
	sap.ui.getCore().applyChanges();

	var oElem = checkFocus(getCell(0, 0, true), assert);

	// Space
	this.assertSelection(assert, 0, false);
	assert.strictEqual(iCallCount, 0, "Click handler not called");
	iCallCount = 0;
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	this.assertSelection(assert, 0, true);
	assert.strictEqual(iCallCount, 1, "Click handler called");
	iCallCount = 0;
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	this.assertSelection(assert, 0, false);
	assert.strictEqual(iCallCount, 1, "Click handler called");
	iCallCount = 0;
	qutils.triggerKeyup(oElem, Key.SPACE, true, false, false);
	this.assertSelection(assert, 0, false);
	assert.strictEqual(iCallCount, 0, "Click handler not called");
	iCallCount = 0;
	bPreventDefault = true;
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	this.assertSelection(assert, 0, false);
	assert.strictEqual(iCallCount, 1, "Click handler called but selection not changed");
	iCallCount = 0;
	bPreventDefault = false;

	// Enter
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	this.assertSelection(assert, 0, true);
	assert.strictEqual(iCallCount, 1, "Click handler called");
	iCallCount = 0;
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	this.assertSelection(assert, 0, false);
	assert.strictEqual(iCallCount, 1, "Click handler called");
	iCallCount = 0;
	bPreventDefault = true;
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	this.assertSelection(assert, 0, false);
	assert.strictEqual(iCallCount, 1, "Click handler called but selection not changed");
	iCallCount = 0;
	bPreventDefault = false;
});

QUnit.test("On a Data Cell - Row selection not possible", function(assert) {
	var cellClickEventHandler = this.spy();

	oTable.clearSelection();
	oTable.attachCellClick(cellClickEventHandler);
	sap.ui.getCore().applyChanges();

	var oElem = checkFocus(getCell(0, 0, true), assert);

	// Space
	this.assertSelection(assert, 0, false);
	assert.strictEqual(cellClickEventHandler.callCount, 0, "Click handler not called");
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	this.assertSelection(assert, 0, false);
	assert.strictEqual(cellClickEventHandler.callCount, 1, "Click handler called: 1");
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	this.assertSelection(assert, 0, false);
	assert.strictEqual(cellClickEventHandler.callCount, 2, "Click handler called: 2");

	// Enter
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	this.assertSelection(assert, 0, false);
	assert.strictEqual(cellClickEventHandler.callCount, 3, "Click handler called: 3");
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	this.assertSelection(assert, 0, false);
	assert.strictEqual(cellClickEventHandler.callCount, 4, "Click handler called: 4");
});

QUnit.test("On a Group Header Row", function(assert) {
	var cellClickEventHandler = this.spy();
	var oElem;

	oTable.clearSelection();
	oTable.setEnableGrouping(true);
	oTable.setGroupBy(oTable._getVisibleColumns()[0]);
	oTable.attachCellClick(cellClickEventHandler);
	sap.ui.getCore().applyChanges();

	function test(assert) {
		this.assertSelection(assert, 0, false);
		assert.ok(cellClickEventHandler.notCalled, "Click handler not called");
		assert.ok(oTable.getBinding("rows").isExpanded(0), "Group is expanded");

		// Space
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
		checkFocus(oElem, assert);
		this.assertSelection(assert, 0, false);
		assert.ok(cellClickEventHandler.notCalled, 0, "Click handler not called");
		assert.ok(!oTable.getBinding("rows").isExpanded(0), "Group is collapsed");
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
		checkFocus(oElem, assert);
		this.assertSelection(assert, 0, false);
		assert.ok(cellClickEventHandler.notCalled, 0, "Click handler not called");
		assert.ok(oTable.getBinding("rows").isExpanded(0), "Group is expanded");

		// Enter
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
		checkFocus(oElem, assert);
		this.assertSelection(assert, 0, false);
		assert.ok(cellClickEventHandler.notCalled, 0, "Click handler not called");
		assert.ok(!oTable.getBinding("rows").isExpanded(0), "Group is collapsed");
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
		checkFocus(oElem, assert);
		this.assertSelection(assert, 0, false);
		assert.ok(cellClickEventHandler.notCalled, 0, "Click handler not called");
		assert.ok(oTable.getBinding("rows").isExpanded(0), "Group is expanded");
	}

	/* Row Header */
	oElem = checkFocus(getRowHeader(0, true), assert);
	test.call(this, assert);

	/* Data Cell */
	oElem = checkFocus(getCell(0, 1, true), assert);
	test.call(this, assert);
});

QUnit.test("TreeTable - Expand/Collapse Group", function(assert) {
	var oRowBinding = oTreeTable.getBinding("rows");

	function testCollapseExpandAndFocus(oCellElement) {
		TableUtils.Grouping.toggleGroupHeader(oTreeTable, 0, true);
		oCellElement.focus();
		checkFocus(oCellElement, assert);
		assert.ok(oRowBinding.isExpanded(0), "The group is expanded");

		qutils.triggerKeydown(oCellElement, Key.ENTER, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "Enter: The group is collapsed");
		checkFocus(oCellElement, assert);

		qutils.triggerKeydown(oCellElement, Key.ENTER, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "Enter: The group is expanded");
		checkFocus(oCellElement, assert);

		qutils.triggerKeyup(oCellElement, Key.SPACE, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "Space: The group is collapsed");
		checkFocus(oCellElement, assert);

		qutils.triggerKeyup(oCellElement, Key.SPACE, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "Space: The group is expanded");
		checkFocus(oCellElement, assert);
	}

	function testNoCollapseExpand(oCellElement) {
		TableUtils.Grouping.toggleGroupHeader(oTreeTable, 0, true);
		assert.ok(oRowBinding.isExpanded(0), "The group is expanded");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.ENTER, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "Enter: The group is still expanded");

		oCellElement.focus();
		qutils.triggerKeyup(oCellElement, Key.SPACE, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "Space: The group is still expanded");

		TableUtils.Grouping.toggleGroupHeader(oTreeTable, 0, false);
		assert.ok(!oRowBinding.isExpanded(0), "The group is collapsed");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.ENTER, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "Enter: The group is still collapsed");

		oCellElement.focus();
		qutils.triggerKeyup(oCellElement, Key.SPACE, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "Space: The group is still collapsed");
	}

	testCollapseExpandAndFocus(getCell(0, 0, null, null, oTreeTable));
	testCollapseExpandAndFocus(getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIcon"));
	testNoCollapseExpand(getCell(0, 1, null, null, oTreeTable));
	testNoCollapseExpand(getRowHeader(0, null, null, oTreeTable));
});

QUnit.module("TableKeyboardDelegate2 - Interaction > Ctrl+A (Select/Deselect All)", {
	beforeEach: function() {
		setupTest();
	},
	afterEach: function() {
		teardownTest();
	}
});

QUnit.test("(De)Select All possible", function(assert) {
	oTable.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
	sap.ui.getCore().applyChanges();

	var oElem = checkFocus(getSelectAll(true), assert);
	qutils.triggerKeydown(oElem, Key.A, false, false, true);
	assert.ok(TableUtils.areAllRowsSelected(oTable), "On SelectAll: All rows selected");
	qutils.triggerKeydown(oElem, Key.A, false, false, true);
	assert.ok(!TableUtils.areAllRowsSelected(oTable), "On SelectAll: All rows deselected");

	oElem = checkFocus(getRowHeader(0, true), assert);
	qutils.triggerKeydown(oElem, Key.A, false, false, true);
	assert.ok(TableUtils.areAllRowsSelected(oTable), "On Row Header: All rows selected");
	qutils.triggerKeydown(oElem, Key.A, false, false, true);
	assert.ok(!TableUtils.areAllRowsSelected(oTable), "On Row Header: All rows deselected");

	oElem = checkFocus(getCell(0, 0, true), assert);
	qutils.triggerKeydown(oElem, Key.A, false, false, true);
	assert.ok(TableUtils.areAllRowsSelected(oTable), "On Data Cell: All rows selected");
	qutils.triggerKeydown(oElem, Key.A, false, false, true);
	assert.ok(!TableUtils.areAllRowsSelected(oTable), "On Data Cell: All rows deselected");
});

QUnit.test("(De)Select All not possible", function(assert) {
	function test(bSelected) {
		// Mass (De)Selection on column header is never allowed, regardless of the selection mode.
		oTable.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
		if (bSelected) {
			oTable.selectAll();
		} else {
			oTable.clearSelection();
		}
		sap.ui.getCore().applyChanges();

		var oElem = checkFocus(getColumnHeader(0, true), assert);
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.strictEqual(TableUtils.areAllRowsSelected(oTable), bSelected,
			"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

		// Setting the selection mode to "Single" or "None" clears the selection.
		// So we can stop here as we already tested mass selection when no row is selected.
		if (bSelected) {
			return;
		}

		// Mass (De)Selection is not allowed in selection mode "Single".
		oTable.setSelectionMode(sap.ui.table.SelectionMode.Single);
		sap.ui.getCore().applyChanges();

		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.strictEqual(TableUtils.areAllRowsSelected(oTable), bSelected,
			"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

		oElem = checkFocus(getSelectAll(true), assert);
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.strictEqual(TableUtils.areAllRowsSelected(oTable), bSelected,
			"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

		oElem = checkFocus(getRowHeader(0, true), assert);
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.strictEqual(TableUtils.areAllRowsSelected(oTable), bSelected,
			"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

		oElem = checkFocus(getCell(0, 0, true), assert);
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.strictEqual(TableUtils.areAllRowsSelected(oTable), bSelected,
			"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

		// Mass (De)Selection is not allowed in selection mode "None".
		oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
		sap.ui.getCore().applyChanges();

		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.strictEqual(TableUtils.areAllRowsSelected(oTable), bSelected,
			"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

		oElem = checkFocus(getCell(0, 0, true), assert);
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.strictEqual(TableUtils.areAllRowsSelected(oTable), bSelected,
			"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));
	}

	test(false);
	test(true);
});

QUnit.module("TableKeyboardDelegate2 - Interaction > Ctrl+Shift+A (Deselect All)", {
	beforeEach: function() {
		setupTest();
	},
	afterEach: function() {
		teardownTest();
	}
});

QUnit.test("Deselect All possible", function(assert) {
	function test(sSelectionMode, aSelectedIndices) {
		oTable.setSelectionMode(sSelectionMode);
		sap.ui.getCore().applyChanges();

		var aCells = [ getCell(0, 0) ];
		if (TableUtils.hasRowHeader(oTable)) {
			aCells.push(getSelectAll());
			aCells.push(getRowHeader(0));
		}

		for (var i = 0; i < aCells.length; i++) {
			var oElem = aCells[i];

			oElem.focus();
			checkFocus(oElem, assert);

			for (var j = 0; j < aSelectedIndices.length; j++) {
				var iRowIndex = aSelectedIndices[j];
				TableUtils.toggleRowSelection(oTable, iRowIndex);
			}

			var sAssertionMessage = "No rows are selected";
			if (aSelectedIndices.length > 0) {
				sAssertionMessage = "Rows with indices [" + aSelectedIndices.join(", ") + "] are selected";
			}
			assert.deepEqual(oTable.getSelectedIndices(), aSelectedIndices, sAssertionMessage);

			if (aSelectedIndices.length > 0) {
				qutils.triggerKeydown(oElem, Key.A, true, false, true);
				assert.ok(!TableUtils.areAllRowsSelected(oTable), "DeselectAll on cell \"" + oElem.attr("id") + "\": All rows deselected");
			}

			qutils.triggerKeydown(oElem, Key.A, true, false, true);
			assert.ok(!TableUtils.areAllRowsSelected(oTable), "DeselectAll on cell \"" + oElem.attr("id") + "\": All rows still deselected");
		}
	}

	test(sap.ui.table.SelectionMode.None, []);
	test(sap.ui.table.SelectionMode.Single, [1]);
	test(sap.ui.table.SelectionMode.MultiToggle, [0, 1, 4]);
});

QUnit.test("Deselect All not possible", function(assert) {
	function test(sSelectionMode, aSelectedIndices) {
		oTable.setSelectionMode(sSelectionMode);
		sap.ui.getCore().applyChanges();

		var oElem = checkFocus(getColumnHeader(0, true), assert);

		for (var j = 0; j < aSelectedIndices.length; j++) {
			var iRowIndex = aSelectedIndices[j];
			TableUtils.toggleRowSelection(oTable, iRowIndex);
		}

		var sAssertionMessage = "No rows are selected";
		if (aSelectedIndices.length > 0) {
			sAssertionMessage = "Rows with indices [" + aSelectedIndices.join(", ") + "] are selected";
		}
		assert.deepEqual(oTable.getSelectedIndices(), aSelectedIndices, sAssertionMessage);

		qutils.triggerKeydown(oElem, Key.A, true, false, true);
		assert.deepEqual(oTable.getSelectedIndices(), aSelectedIndices, "DeselectAll on cell \"" + oElem.attr("id") + "\": All rows are still selected");
	}

	test(sap.ui.table.SelectionMode.None, []);
	test(sap.ui.table.SelectionMode.Single, [1]);
	test(sap.ui.table.SelectionMode.MultiToggle, [0, 1, 4]);
});

QUnit.module("TableKeyboardDelegate2 - Interaction > Shift+F10 & ContextMenu (Open Context Menus)", {
	beforeEach: function() {
		setupTest();
	},
	afterEach: teardownTest
});

QUnit.test("On a Column Header", function(assert) {
	var oKeydownEvent = this.spy(oTable._getKeyboardExtension()._delegate, "onkeydown");
	var oContextMenuEvent = this.spy(oTable._getKeyboardExtension()._delegate, "oncontextmenu");

	// Shift+F10
	_testColumnHeaderContextMenus(Key.F10, true, true);
	var oKeyDownEventArgument = oKeydownEvent.args[0][0];
	assert.ok(oKeyDownEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

	// ContextMenu
	var oColumn = oTable.getColumns()[0];
	oColumn.setSortProperty("dummy");
	var oElem = checkFocus(getColumnHeader(0, true), assert);
	var oColumnMenu = oColumn.getMenu();

	assert.ok(!oColumnMenu.bOpen, "Menu is closed");
	jQuery(oElem).trigger("contextmenu");
	assert.ok(oColumnMenu.bOpen, "Menu is opened");
	var bFirstItemHovered = oColumnMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
	assert.strictEqual(bFirstItemHovered, true, "The first item in the menu is hovered");
	qutils.triggerKeydown(document.activeElement, Key.ESCAPE, false, false, false);
	assert.ok(!oColumnMenu.bOpen, "Menu is closed");
	checkFocus(oElem, assert);

	var oContextMenuEventArgument = oContextMenuEvent.args[0][0];
	assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");
});

QUnit.test("On a Data Cell", function(assert) {
	var oElem = checkFocus(getCell(0, 0, true), assert);
	var oColumn = oTable.getColumns()[0];
	var oKeydownEvent = this.spy(oTable._getKeyboardExtension()._delegate, "onkeydown");
	var oContextMenuEvent = this.spy(oTable._getKeyboardExtension()._delegate, "oncontextmenu");
	var bFirstItemHovered;

	oTable.setEnableCellFilter(true);
	this.stub(oColumn, "isFilterableByMenu").returns(true);

	// Shift+F10
	assert.strictEqual(oTable._oCellContextMenu, undefined, "The cell context menu object is not yet created");
	qutils.triggerKeydown(oElem, Key.F10, true, false, false);
	assert.notEqual(oTable._oCellContextMenu, undefined, "The cell context menu object has been created");
	assert.ok(oTable._oCellContextMenu.bOpen, "Menu is opened");
	bFirstItemHovered = oTable._oCellContextMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
	assert.strictEqual(bFirstItemHovered, true, "The first item in the menu is hovered");
	qutils.triggerKeydown(document.activeElement, Key.ESCAPE, false, false, false);
	assert.ok(!oTable._oCellContextMenu.bOpen, "Menu is closed");
	checkFocus(oElem, assert);

	var oKeyDownEventArgument = oKeydownEvent.args[0][0];
	assert.ok(oKeyDownEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

	// ContextMenu
	oKeydownEvent.reset();
	oContextMenuEvent.reset();

	assert.notEqual(oTable._oCellContextMenu, undefined, "The cell context menu object already exists");
	assert.ok(!oTable._oCellContextMenu.bOpen, "Menu is closed");
	jQuery(oElem).trigger("contextmenu");
	assert.ok(oTable._oCellContextMenu.bOpen, "Menu is opened");
	bFirstItemHovered = oTable._oCellContextMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
	assert.strictEqual(bFirstItemHovered, true, "The first item in the menu is hovered");
	qutils.triggerKeydown(document.activeElement, Key.ESCAPE, false, false, false);
	assert.ok(!oTable._oCellContextMenu.bOpen, "Menu is closed");
	checkFocus(oElem, assert);

	var oContextMenuEventArgument = oContextMenuEvent.args[0][0];
	assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");
});

QUnit.test("On other cells", function(assert) {
	var oElem;
	var oColumn = oTable.getColumns()[0];
	oColumn.setSortProperty("dummy");
	var oColumnMenu = oColumn.getMenu();
	var oKeydownEvent = this.spy(oTable._getKeyboardExtension()._delegate, "onkeydown");
	var oContextMenuEvent = this.spy(oTable._getKeyboardExtension()._delegate, "oncontextmenu");

	oTable.setEnableCellFilter(true);
	this.stub(oColumn, "isFilterableByMenu").returns(true);

	// Shift+F10
	oElem = checkFocus(getSelectAll(true), assert);
	qutils.triggerKeydown(oElem, Key.F10, true, false, false);
	assert.ok(!oColumnMenu.bOpen, "Menu is not open");
	assert.strictEqual(oTable._oCellContextMenu, undefined, "The cell context menu is not open");
	assert.ok(oKeydownEvent.args[0][0].isDefaultPrevented(), "Opening of the default context menu was prevented");
	checkFocus(oElem, assert);

	oElem = checkFocus(getRowHeader(0, true), assert);
	qutils.triggerKeydown(oElem, Key.F10, true, false, false);
	assert.ok(!oColumnMenu.bOpen, "Menu is not open");
	assert.strictEqual(oTable._oCellContextMenu, undefined, "The cell context menu is not open");
	assert.ok(oKeydownEvent.args[1][0].isDefaultPrevented(), "Opening of the default context menu was prevented");
	checkFocus(oElem, assert);

	// ContextMenu
	oElem = checkFocus(getSelectAll(true), assert);
	jQuery(oElem).trigger("contextmenu");
	assert.ok(!oColumnMenu.bOpen, "Menu is not open");
	assert.strictEqual(oTable._oCellContextMenu, undefined, "The cell context menu is not open");
	assert.ok(oContextMenuEvent.args[0][0].isDefaultPrevented(), "Opening of the default context menu was prevented");
	checkFocus(oElem, assert);

	oElem = checkFocus(getRowHeader(0, true), assert);
	jQuery(oElem).trigger("contextmenu");
	assert.ok(!oColumnMenu.bOpen, "Menu is not open");
	assert.strictEqual(oTable._oCellContextMenu, undefined, "The cell context menu is not open");
	assert.ok(oContextMenuEvent.args[1][0].isDefaultPrevented(), "Opening of the default context menu was prevented");
	checkFocus(oElem, assert);
});

QUnit.module("TableKeyboardDelegate2 - Interaction > Alt+ArrowUp & Alt+ArrowDown (Expand/Collapse Group)", {
	beforeEach: function() {
		setupTest();
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable.getColumns()[0]);
		sap.ui.getCore().applyChanges();
	},
	afterEach: function() {
		teardownTest();
	},

	/**
	 * Check whether the keyboard events, which should cause a group to expand and collapse, are handled correctly when triggered on the passed element.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
	 */
	testCollapseExpandAndFocus: function(oTable, oCellElement) {
		var oRowBinding = oTable.getBinding("rows");

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);
		assert.ok(oRowBinding.isExpanded(0), "The group is expanded");
		oCellElement.focus();
		checkFocus(oCellElement, assert);

		qutils.triggerKeydown(oCellElement, Key.Arrow.DOWN, false, true, false);
		assert.ok(oRowBinding.isExpanded(0), "Alt+ArrowDown: The group is expanded");
		checkFocus(oCellElement, assert);

		qutils.triggerKeydown(oCellElement, Key.Arrow.UP, false, true, false);
		assert.ok(!oRowBinding.isExpanded(0), "Alt+ArrowUp: The group is collapsed");
		checkFocus(oCellElement, assert);

		qutils.triggerKeydown(oCellElement, Key.Arrow.UP, false, true, false);
		assert.ok(!oRowBinding.isExpanded(0), "Alt+ArrowUp: The group is collapsed");
		checkFocus(oCellElement, assert);

		qutils.triggerKeydown(oCellElement, Key.Arrow.DOWN, false, true, false);
		assert.ok(oRowBinding.isExpanded(0), "Alt+ArrowDown: The group is expanded");
		checkFocus(oCellElement, assert);
	},

	/**
	 * Check whether the keyboard events, which should not cause a group to expand and collapse, are handled correctly when triggered on the passed element.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
	 */
	testNoCollapseExpand: function(oTable, oCellElement) {
		var oRowBinding = oTable.getBinding("rows");

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);
		assert.ok(oRowBinding.isExpanded(0), "The group is expanded");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.Arrow.DOWN, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "Alt+ArrowDown: The group is still expanded");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.Arrow.UP, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "Alt+ArrowUp: The group is still expanded");

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, false);
		assert.ok(!oRowBinding.isExpanded(0), "The group is collapsed");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.Arrow.DOWN, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "Alt+ArrowDown: The group is still collapsed");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.Arrow.UP, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "Alt+ArrowUp: The group is still collapsed");
	}
});

QUnit.test("Table with grouping", function(assert) {
	function testFocus(oCellElement) {
		oCellElement.focus();
		checkFocus(oCellElement, assert);

		qutils.triggerKeydown(oCellElement, Key.Arrow.DOWN, false, true, false);
		checkFocus(oCellElement, assert);
		qutils.triggerKeydown(oCellElement, Key.Arrow.UP, false, true, false);
		checkFocus(oCellElement, assert);
	}

	this.testCollapseExpandAndFocus(oTable, getCell(0, 1));
	this.testCollapseExpandAndFocus(oTable, getRowHeader(0));
	this.testNoCollapseExpand(oTable, getColumnHeader(0));
	testFocus(getColumnHeader(0));
	this.testNoCollapseExpand(oTable, getSelectAll());
	testFocus(getSelectAll());
});

QUnit.test("TreeTable", function(assert) {
	this.testCollapseExpandAndFocus(oTreeTable, getCell(0, 0, null, null, oTreeTable));
	this.testCollapseExpandAndFocus(oTreeTable, getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIcon"));
	this.testNoCollapseExpand(oTreeTable, getCell(0, 1, null, null, oTreeTable));
	this.testNoCollapseExpand(oTreeTable, getRowHeader(0, null, null, oTreeTable));
});

QUnit.module("TableKeyboardDelegate2 - Interaction > F4 (Expand/Collapse Group)", {
	beforeEach: function() {
		setupTest();
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable.getColumns()[0]);
		sap.ui.getCore().applyChanges();
	},
	afterEach: function() {
		teardownTest();
	},

	/**
	 * Check whether the keyboard events, which should cause a group to expand and collapse, are handled correctly when triggered on the passed element.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
	 */
	testCollapseExpandAndFocus: function(oTable, oCellElement) {
		var oRowBinding = oTable.getBinding("rows");

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);
		assert.ok(oRowBinding.isExpanded(0), "The group is expanded");
		oCellElement.focus();
		checkFocus(oCellElement, assert);

		qutils.triggerKeydown(oCellElement, Key.F4, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "F4: The group is collapsed");
		checkFocus(oCellElement, assert);

		qutils.triggerKeydown(oCellElement, Key.F4, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "F4: The group is expanded");
		checkFocus(oCellElement, assert);
	},

	/**
	 * Check whether the keyboard events, which should not cause a group to expand and collapse, are handled correctly when triggered on the passed element.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
	 */
	testNoCollapseExpand: function(oTable, oCellElement) {
		var oRowBinding = oTable.getBinding("rows");

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);
		assert.ok(oRowBinding.isExpanded(0), "The group is expanded");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.F4, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "F4: The group is still expanded");

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, false);
		assert.ok(!oRowBinding.isExpanded(0), "The group is collapsed");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.F4, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "F4: The group is still collapsed");
	}
});

QUnit.test("Table with grouping", function(assert) {
	var oRowBinding = oTable.getBinding("rows");

	function testFocus(oCellElement) {
		oCellElement.focus();
		checkFocus(oCellElement, assert);

		qutils.triggerKeydown(oCellElement, Key.F4, false, false, false);
		checkFocus(oCellElement, assert);
	}

	this.testCollapseExpandAndFocus(oTable, getCell(0, 1));
	this.testCollapseExpandAndFocus(oTable, getRowHeader(0));
	this.testNoCollapseExpand(oTable, getColumnHeader(0));
	testFocus(getColumnHeader(0));
	this.testNoCollapseExpand(oTable, getSelectAll());
	testFocus(getSelectAll());
});

QUnit.test("TreeTable", function(assert) {
	this.testCollapseExpandAndFocus(oTreeTable, getCell(0, 0, null, null, oTreeTable));
	this.testCollapseExpandAndFocus(oTreeTable, getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIcon"));
	this.testNoCollapseExpand(oTreeTable, getCell(0, 1, null, null, oTreeTable));
	this.testNoCollapseExpand(oTreeTable, getRowHeader(0, null, null, oTreeTable));
});

QUnit.module("TableKeyboardDelegate2 - Interaction > Plus & Minus (Expand/Collapse Group)", {
	beforeEach: function() {
		setupTest();
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable.getColumns()[0]);
		sap.ui.getCore().applyChanges();
	},
	afterEach: function() {
		teardownTest();
	},

	/**
	 * Check whether the keyboard events, which should cause a group to expand and collapse, are handled correctly when triggered on the passed element.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
	 */
	testCollapseExpandAndFocus: function(oTable, oCellElement) {
		var oRowBinding = oTable.getBinding("rows");

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);
		assert.ok(oRowBinding.isExpanded(0), "The group is expanded");
		oCellElement.focus();
		checkFocus(oCellElement, assert);

		qutils.triggerKeypress(oCellElement, Key.PLUS, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "Plus: The group is expanded");
		checkFocus(oCellElement, assert);

		qutils.triggerKeypress(oCellElement, Key.MINUS, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "Minus: The group is collapsed");
		checkFocus(oCellElement, assert);

		qutils.triggerKeypress(oCellElement, Key.MINUS, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "Minus: The group is collapsed");
		checkFocus(oCellElement, assert);

		qutils.triggerKeypress(oCellElement, Key.PLUS, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "Plus: The group is expanded");
		checkFocus(oCellElement, assert);
	},

	/**
	 * Check whether the keyboard events, which should not cause a group to expand and collapse, are handled correctly when triggered on the passed element.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
	 */
	testNoCollapseExpand: function(oTable, oCellElement) {
		var oRowBinding = oTable.getBinding("rows");

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);
		assert.ok(oRowBinding.isExpanded(0), "The group is expanded");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.PLUS, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "PLUS: The group is still expanded");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.MINUS, false, false, false);
		assert.ok(oRowBinding.isExpanded(0), "MINUS: The group is still expanded");

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, false);
		assert.ok(!oRowBinding.isExpanded(0), "The group is collapsed");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.PLUS, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "PLUS: The group is still collapsed");

		oCellElement.focus();
		qutils.triggerKeydown(oCellElement, Key.MINUS, false, false, false);
		assert.ok(!oRowBinding.isExpanded(0), "MINUS: The group is still collapsed");
	}
});

QUnit.test("Table with grouping", function(assert) {
	var oRowBinding = oTable.getBinding("rows");

	function testFocus(oCellElement) {
		oCellElement.focus();
		checkFocus(oCellElement, assert);

		qutils.triggerKeypress(oCellElement, Key.PLUS, false, false, false);
		checkFocus(oCellElement, assert);
		qutils.triggerKeypress(oCellElement, Key.MINUS, false, false, false);
		checkFocus(oCellElement, assert);
	}

	this.testCollapseExpandAndFocus(oTable, getCell(0, 1));
	this.testCollapseExpandAndFocus(oTable, getRowHeader(0));
	this.testNoCollapseExpand(oTable, getColumnHeader(0));
	testFocus(getColumnHeader(0));
	this.testNoCollapseExpand(oTable, getSelectAll());
	testFocus(getSelectAll());
});

QUnit.module("TreeTable", function(assert) {
	this.testCollapseExpandAndFocus(oTreeTable, getCell(0, 0, null, null, oTreeTable));
	this.testCollapseExpandAndFocus(oTreeTable, getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIcon"));
	this.testNoCollapseExpand(oTreeTable, getCell(0, 1, null, null, oTreeTable));
	this.testNoCollapseExpand(oTreeTable, getRowHeader(0, null, null, oTreeTable));
});

QUnit.module("TableKeyboardDelegate2 - Action Mode > Enter and Leave", {
	beforeEach: function() {
		setupTest();

		function addColumn(sTitle, sText, bFocusable, bTabbable) {
			var oControlTemplate;
			if (bFocusable) {
				oControlTemplate = new TestInputControl({
					text: "{" + sText + "}",
					index: iNumberOfCols,
					visible: true,
					tabbable: bTabbable
				});
			} else {
				oControlTemplate = new TestControl({
					text: "{" + sText + "}",
					index: iNumberOfCols,
					visible: true,
					tabbable: bTabbable
				});
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

		addColumn("Not Focusable & Not Tabbable", "NoFocus&NoTab", false, false);
		addColumn("Focusable & Tabbable", "Focus&Tab", true, true);
		addColumn("Focusable & Not Tabbable", "Focus&NoTab", true, false);

		sap.ui.getCore().applyChanges();
	},
	afterEach: function() {
		teardownTest();
		iNumberOfCols -= 3;
	},

	/**
	 *  Tests if entering and leaving the action mode works correctly when the focus is on a header cell.
	 *  Tested header cells are: Column header cell, row header cell, SelectAll cell and group header cell.
	 *
	 * @param {Object} assert
	 * @param {int|string} key
	 * @param {string} sKeyName
	 * @param {boolean} bShift
	 * @param {boolean} bAlt
	 * @param {boolean} bCtrl
	 * @param {boolean} bTestLeaveActionMode
	 * @param {Function} fEventTriggerer
	 */
	testOnHeaderCells: function(assert, key, sKeyName, bShift, bAlt, bCtrl, bTestLeaveActionMode, fEventTriggerer) {
		var sKeyCombination = (bShift ? "Shift+" : "") + (bAlt ? "Alt+" : "") + (bCtrl ? "Ctrl+" : "") + sKeyName;
		var oElem;

		// Column header cell
		oElem = checkFocus(getColumnHeader(0, true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
		checkFocus(getColumnHeader(0), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Row header cell
		oElem = checkFocus(getRowHeader(0, true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
		checkFocus(getRowHeader(0), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		if (bTestLeaveActionMode) {
			oTable._getKeyboardExtension()._actionMode = true;
			oTable._getKeyboardExtension()._suspendItemNavigation();
			assert.ok(oTable._getKeyboardExtension().isInActionMode() && oTable._getKeyboardExtension()._isItemNavigationSuspended(), "Table was programmatically set to Action Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
			checkFocus(getRowHeader(0), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), sKeyCombination + ": Table is in Navigation Mode");
		}

		// SelectAll cell
		oElem = checkFocus(getSelectAll(true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
		checkFocus(getSelectAll(), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Group header icon cell
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable.getColumns()[0]);
		TableUtils.Grouping.toggleGroupHeader(oTable, 0);
		sap.ui.getCore().applyChanges();

		oElem = checkFocus(getRowHeader(0, true), assert);
		assert.ok(TableUtils.Grouping.isInGroupingRow(oElem), "Cell to be tested is in a group header row");
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus group header icon cell: Table is in Navigation Mode");
		fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
		checkFocus(getRowHeader(0), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), sKeyCombination + ": Table is in Navigation Mode");

		if (bTestLeaveActionMode) {
			oTable._getKeyboardExtension()._actionMode = true;
			oTable._getKeyboardExtension()._suspendItemNavigation();
			assert.ok(oTable._getKeyboardExtension().isInActionMode() && oTable._getKeyboardExtension()._isItemNavigationSuspended(), "Table was programmatically set to Action Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
			checkFocus(getRowHeader(0), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), sKeyCombination + ": Table is in Navigation Mode");
		}

		oTable.setEnableGrouping(false);
		sap.ui.getCore().applyChanges();
	},

	/**
	 *  Tests if the action mode can be entered when a data cell with interactive controls inside is focused and the specified key is pressed.
	 *  At the end of this test the table is in action mode.
	 *
	 * @param {Object} assert
	 * @param {int|string} key
	 * @param {string} sKeyName
	 * @param {boolean} bShift
	 * @param {boolean} bAlt
	 * @param {boolean} bCtrl
	 * @param {Function} fEventTriggerer
	 * @returns {HTMLElement} Returns the first interactive element inside a data cell. This element has the focus.
	 */
	testOnDataCellWithInteractiveControls: function(assert, key, sKeyName, bShift, bAlt, bCtrl, fEventTriggerer) {
		var sKeyCombination = (bShift ? "Shift+" : "") + (bAlt ? "Alt+" : "") + (bCtrl ? "Ctrl+" : "") + sKeyName;
		var oElem, $Element;

		function isTextSelected(oInputElement) {
			return oInputElement.selectionStart === 0 && oInputElement.selectionEnd === oInputElement.value.length;
		}

		// Focus cell with a focusable & tabbable element inside.
		oElem = checkFocus(getCell(0, iNumberOfCols - 2, true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus cell with a focusable and tabbable input element: Table is in Navigation Mode");

		// Enter action mode.
		fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
		$Element = TableKeyboardDelegate2._getInteractiveElements(oElem);
		oElem = $Element[0];
		assert.strictEqual(document.activeElement, oElem, sKeyCombination + ": First interactive element in the cell is focused");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assert.ok(isTextSelected(oElem), "The text in the input element is selected");

		// Focus cell with a focusable & non-tabbable element inside.
		oTable._getKeyboardExtension().setActionMode(false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1, true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus cell with a focusable and non-tabbable input element: Table is in Navigation Mode");

		// Enter action mode.
		fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
		$Element = TableKeyboardDelegate2._getInteractiveElements(oElem);
		oElem = $Element[0];
		assert.strictEqual(document.activeElement, oElem, sKeyCombination + ": First interactive element in the cell is focused");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assert.ok(isTextSelected(oElem), "The text in the input element is selected");

		return $Element[0];
	},

	/**
	 * Tests if the table stays in navigation mode when a data cell without interactive controls inside is focused and the specified key is pressed.
	 *
	 * @param {Object} assert
	 * @param {int|string} key
	 * @param {string} sKeyName
	 * @param {boolean} bShift
	 * @param {boolean} bAlt
	 * @param {boolean} bCtrl
	 * @param {Function} fEventTriggerer
	 */
	testOnDataCellWithoutInteractiveControls: function(assert, key, sKeyName, bShift, bAlt, bCtrl, fEventTriggerer) {
		var sKeyCombination = (bShift ? "Shift+" : "") + (bAlt ? "Alt+" : "") + (bCtrl ? "Ctrl+" : "") + sKeyName;
		var oElem;

		// Focus cell with a non-focusable & non-tabbable element inside.
		oElem = checkFocus(getCell(0, iNumberOfCols - 3, true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus cell with a non-focusable and non-tabbable element: Table is in Navigation Mode");

		// Stay in navigation mode.
		fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
		assert.strictEqual(document.activeElement, oElem[0], sKeyCombination + ": Cell is focused");
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	}
});

QUnit.test("Focus", function(assert) {
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

	// Enter Action Mode: Focus a tabbable text control inside a data cell.
	var oElement = TableKeyboardDelegate2._getInteractiveElements(getCell(0, 0))[0];
	oElement.focus();
	assert.strictEqual(document.activeElement, oElement, "Text element in the cell is focused");
	assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

	// Enter Navigation Mode: Focus a data cell.
	getCell(0, 0, true);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

	// Enter Action Mode: Focus tabbable input control inside a data cell.
	oElement = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 2))[0];
	oElement.focus();
	assert.strictEqual(document.activeElement, oElement, "Tabbable input element in the cell is focused");
	assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

	// Stay in Action Mode: Focus a non-tabbable input control inside a data cell.
	oElement = getCell(0, iNumberOfCols - 1).find("input")[0];
	oElement.focus();
	assert.strictEqual(document.activeElement, oElement, "Non-Tabbable input element in the cell is focused");
	assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

	// Stay in Action Mode: Focus a row selector cell.
	checkFocus(getRowHeader(0, true), assert);
	assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Focus row selector cell: Table is in Action Mode");

	// Stay in Action Mode: Focus a group header icon cell.
	oTable.setEnableGrouping(true);
	oTable.setGroupBy(oTable.getColumns()[0]);
	TableUtils.Grouping.toggleGroupHeader(oTable, 0);
	TableUtils.Grouping.toggleGroupHeader(oTable, 7);
	TableUtils.Grouping.toggleGroupHeader(oTable, 8);
	sap.ui.getCore().applyChanges();

	oElement = checkFocus(getRowHeader(0, true), assert)[0];
	assert.ok(TableUtils.Grouping.isInGroupingRow(oElement), "Cell to be tested is in a group header row");
	assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Focus group header icon cell: Table is in Action Mode");

	// Enter Navigation Mode: Focus the SelectAll cell.
	getSelectAll(true);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus SelectAll cell: Table is in Navigation Mode");

	// Remove row selectors.
	oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
	sap.ui.getCore().applyChanges();

	// Enter Action Mode: Focus tabbable input control inside a data cell.
	oElement = TableKeyboardDelegate2._getInteractiveElements(getCell(2, iNumberOfCols - 2))[0];
	oElement.focus();
	assert.strictEqual(document.activeElement, oElement, "Tabbable input element in the cell is focused");
	assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

	// Enter Navigation Mode: Focus a row header cell which is no group header icon cell or row selector cell.
	getRowHeader(2, true);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(),
		"Focus row header cell which is no group header icon cell or row selector cell: Table is in Navigation Mode");
});

QUnit.test("F2 - On Column/Row/GroupIcon/SelectAll Header Cells", function(assert) {
	this.testOnHeaderCells(assert, Key.F2, "F2", false, false, false, true, qutils.triggerKeydown);
});

QUnit.test("F2 - On a Data Cell", function(assert) {
	var oElem = this.testOnDataCellWithInteractiveControls(assert, Key.F2, "F2", false, false, false, qutils.triggerKeydown);

	// Leave action mode.
	qutils.triggerKeydown(oElem, Key.F2, false, false, false);
	checkFocus(getCell(0, iNumberOfCols - 1), assert);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

	this.testOnDataCellWithoutInteractiveControls(assert, Key.F2, "F2", false, false, false, qutils.triggerKeydown);
});

QUnit.test("Alt+ArrowUp & Alt+ArrowDown - On Column/Row/GroupIcon/SelectAll Header Cells", function(assert) {
	this.testOnHeaderCells(assert, Key.Arrow.UP, "Arrow Up", false, true, false, false, qutils.triggerKeydown);
	this.testOnHeaderCells(assert, Key.Arrow.DOWN, "Arrow Down", false, true, false, false, qutils.triggerKeydown);
});

QUnit.test("Alt+ArrowUp & Alt+ArrowDown - On a Data Cell", function(assert) {
	this.testOnDataCellWithInteractiveControls(assert, Key.Arrow.UP, "Arrow Up", false, true, false, qutils.triggerKeydown);
	oTable._getKeyboardExtension().setActionMode(false);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	this.testOnDataCellWithoutInteractiveControls(assert, Key.Arrow.DOWN, "Arrow Down", false, true, false, qutils.triggerKeydown);

	this.testOnDataCellWithInteractiveControls(assert, Key.Arrow.UP, "Arrow Up", false, true, false, qutils.triggerKeydown);
	oTable._getKeyboardExtension().setActionMode(false);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	this.testOnDataCellWithoutInteractiveControls(assert, Key.Arrow.DOWN, "Arrow Down", true, false, false, qutils.triggerKeydown);
});

QUnit.test("F4 - On Column/Row/GroupIcon/SelectAll Header Cells", function(assert) {
	this.testOnHeaderCells(assert, Key.F4, "F4", false, false, false, false, qutils.triggerKeydown);
	this.testOnHeaderCells(assert, Key.F4, "F4", false, false, false, false, qutils.triggerKeydown);
});

QUnit.test("F4 - On a Data Cell", function(assert) {
	this.testOnDataCellWithInteractiveControls(assert, Key.F4, "F4", false, false, false, qutils.triggerKeydown);
	oTable._getKeyboardExtension().setActionMode(false);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	this.testOnDataCellWithoutInteractiveControls(assert, Key.F4, "F4", false, false, false, qutils.triggerKeydown);

	this.testOnDataCellWithInteractiveControls(assert, Key.F4, "F4", false, false, false, qutils.triggerKeydown);
	oTable._getKeyboardExtension().setActionMode(false);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	this.testOnDataCellWithoutInteractiveControls(assert, Key.F4, "F4", false, false, false, qutils.triggerKeydown);
});

QUnit.test("Plus & Minus - On Column/Row/SelectAll Header Cells", function(assert) {
	this.testOnHeaderCells(assert, Key.PLUS, "Plus", false, false, false, false, qutils.triggerKeypress);
	this.testOnHeaderCells(assert, Key.MINUS, "Minus", false, false, false, false, qutils.triggerKeypress);
});

QUnit.test("Plus & Minus - On a Data Cell", function(assert) {
	this.testOnDataCellWithInteractiveControls(assert, Key.PLUS, "Plus", false, false, false, qutils.triggerKeypress);
	oTable._getKeyboardExtension().setActionMode(false);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	this.testOnDataCellWithoutInteractiveControls(assert, Key.MINUS, "Minus", false, false, false, qutils.triggerKeypress);

	this.testOnDataCellWithInteractiveControls(assert, Key.PLUS, "Plus", false, false, false, qutils.triggerKeypress);
	oTable._getKeyboardExtension().setActionMode(false);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	this.testOnDataCellWithoutInteractiveControls(assert, Key.MINUS, "Minus", false, false, false, qutils.triggerKeypress);
});

QUnit.test("Space & Enter - On a Data Cell - Row selection not possible and no click handler", function(assert) {
	oTable.clearSelection();
	oTable.addColumn(new sap.ui.table.Column({
		label: "Not Focusable & Not Tabbable",
		width: "100px",
		template: new TestControl({
			text: "{NoFocusNoTab}",
			index: iNumberOfCols,
			visible: true,
			tabbable: false
		})
	}));
	iNumberOfCols++;
	sap.ui.getCore().applyChanges();

	/* Test on a data cell with an interactive control inside */

	var oElem = checkFocus(getCell(0, 0, true), assert);
	var $Element = TableKeyboardDelegate2._getInteractiveElements(getCell(0, 0))[0];

	// Space
	assert.equal(oTable.isIndexSelected(0), false, "Row 1: Not Selected");
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	assert.equal(oTable.isIndexSelected(0), false, "Space: Row 1: Not Selected");
	assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
	assert.strictEqual(document.activeElement, $Element, "First interactive element in the cell is focused");
	oTable._getKeyboardExtension().setActionMode(false);

	// Enter
	oElem = checkFocus(getCell(0, 0, true), assert);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	assert.equal(oTable.isIndexSelected(0), false, "Enter: Row 1: Not Selected");
	assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
	assert.strictEqual(document.activeElement, $Element, "First interactive element in the cell is focused");
	oTable._getKeyboardExtension().setActionMode(false);

	/* Test on a data cell without an interactive control inside */

	oElem = checkFocus(getCell(0, iNumberOfCols - 1, true), assert);

	// Space
	assert.equal(oTable.isIndexSelected(0), false, "Row 1: Not Selected");
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
	assert.equal(oTable.isIndexSelected(0), false, "Space: Row 1: Not Selected");
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	checkFocus(oElem, assert);

	// Enter
	oElem = checkFocus(getCell(0, iNumberOfCols - 1, true), assert);
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
	assert.equal(oTable.isIndexSelected(0), false, "Enter: Row 1: Not Selected");
	assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	checkFocus(oElem, assert);

	iNumberOfCols--;
});

QUnit.module("TableKeyboardDelegate2 - Action Mode > Navigation", {
	beforeEach: function() {
		setupTest();

		function addColumn(sTitle, sText, bFocusable, bTabbable) {
			var oControlTemplate;
			if (bFocusable) {
				oControlTemplate = new TestInputControl({
					text: "{" + sText + "}",
					index: iNumberOfCols,
					visible: true,
					tabbable: bTabbable
				});
			} else {
				oControlTemplate = new TestControl({
					text: "{" + sText + "}",
					index: iNumberOfCols,
					visible: true,
					tabbable: bTabbable
				});
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

		addColumn("Not Focusable & Not Tabbable", "NoFocus&NoTab", false, false);
		addColumn("Focusable & Tabbable", "Focus&Tab", true, true);
		addColumn("Focusable & Not Tabbable", "Focus&NoTab", true, false);

		sap.ui.getCore().applyChanges();
	},
	afterEach: function() {
		teardownTest();
		iNumberOfCols -= 3;
	},

	setupGrouping: function() {
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable.getColumns()[0]);
		TableUtils.Grouping.toggleGroupHeader(oTable, 0);
		TableUtils.Grouping.toggleGroupHeader(oTable, 7);
		TableUtils.Grouping.toggleGroupHeader(oTable, 8);
		sap.ui.getCore().applyChanges();
	}
});

function _testActionModeTabNavigation(assert, bShowInfo) {
	var done = assert.async();
	var iVisibleRowCount = oTable.getVisibleRowCount();
	var iFixedRowCount = oTable.getFixedRowCount();
	var iFixedBottomRowCount = oTable.getFixedBottomRowCount();
	var bTableHasRowSelectors = TableUtils.isRowSelectorSelectionAllowed(oTable);
	var bTableIsInGroupMode = TableUtils.Grouping.isGroupMode(oTable);
	var bTableHasRowHeader = bTableHasRowSelectors || bTableIsInGroupMode;
	var oKeyboardExtension = oTable._getKeyboardExtension();
	var iColumnCount = oTable.getColumns().filter(function(oColumn){
		return oColumn.getVisible() || oColumn.getGrouped();
	}).length;
	var iRowCount = oTable._getRowCount();
	var iDelayAfterInRowTabbing = 0;
	var iDelayAfterScrollTabbing = 100;
	var oElem, i, j;

	if (bShowInfo == null) {
		bShowInfo = false;
	}

	function assertTextSelection(oInputElement) {
		if (oInputElement instanceof window.HTMLInputElement) {
			assert.ok(oInputElement.selectionStart === 0 && oInputElement.selectionEnd === oInputElement.value.length,
				"The text in the input element is selected");
		}
	}

	/* Table Grouping Setup:
	 *
	 * [G] = Group header row
	 * [ ] = Normal row
	 *
	 * Row  1: [G]
	 * Row  2: [G]
	 * Row  3: [ ]
	 * Row  4: [G]
	 * Row  5: [ ]
	 * Row  6: [G]
	 * Row  7: [ ]
	 * Row  8: [G]
	 * Row  9: [G]
	 * Row 10: [G]
	 * Row 11: [ ]
	 * Row 12: [G]
	 * Row 13: [ ]
	 */

	if (bTableHasRowHeader) {
		// Focus the first row header cell and enter the action mode programmatically.
		checkFocus(getRowHeader(0, true), assert);
		oKeyboardExtension._actionMode = true;
		assert.ok(oKeyboardExtension.isInActionMode(), "Action mode entered programmatically: Table is in Action Mode");
	} else {
		checkFocus(getCell(0, 0, true), assert);
		oKeyboardExtension.setActionMode(true);
	}

	// Tab to the last interactive control of the table. Then tab again to leave the action mode.
	var sequence = Promise.resolve();
	for (i = 0; i < iRowCount; i++) {
		for (j = -1; j < iColumnCount; j++) {
			(function() {
				var iAbsoluteRowIndex = i;
				var iColumnIndex = j;
				var iRowIndex = i;

				if (iRowIndex >= iVisibleRowCount - iFixedBottomRowCount && iRowIndex < iRowCount - iFixedBottomRowCount) {
					iRowIndex = iVisibleRowCount - iFixedBottomRowCount - 1;
				} else if (iRowIndex >= iRowCount - iFixedBottomRowCount) {
					iRowIndex = iRowIndex - (iRowCount - iVisibleRowCount);
				}

				sequence = sequence.then(function() {
					return new Promise(function(resolve) {
						if (iColumnIndex === -1) { // Row Header
							if (bTableHasRowHeader) {
								oElem = getRowHeader(iRowIndex);

								if (TableUtils.Grouping.isInGroupingRow(oElem)) {
									assert.strictEqual(document.activeElement, oElem[0],
										"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Header Cell: Group Header Icon focused");
									resolve();
									return; // The TAB event will be simulated after the last cell in this row has been reached.

								} else if (bTableHasRowSelectors) {
									assert.strictEqual(document.activeElement, oElem[0],
										"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Header Cell: Row Selector focused");

								} else {
									if (bShowInfo) {
										assert.ok(true,
											"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Header Cell: Skipped, is an empty row header (Grouping without Row Selectors)");
									}
									resolve();
									return;
								}
							} else {
								if (bShowInfo) {
									assert.ok(true,
										"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Header Cell: Skipped, table has no row header");
								}
								resolve();
								return;
							}

						} else {
							var $Cell = getCell(iRowIndex, iColumnIndex);
							var $InteractiveElement = TableKeyboardDelegate2._getInteractiveElements($Cell);

							if ($InteractiveElement === null) {
								var bIsLastCellInGroupHeaderRow = iColumnIndex === iColumnCount - 1 && TableUtils.Grouping.isInGroupingRow(oElem);

								if (bShowInfo) {
									assert.ok(true,
										"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Cell " + (iColumnIndex + 1) + ": Skipped, no interactive elements");
								}

								if (!bIsLastCellInGroupHeaderRow) {
									resolve();
									return;
								}

							} else {
								oElem = $InteractiveElement[0];
								assert.strictEqual(document.activeElement, oElem,
									"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Cell " + (iColumnIndex + 1) + ": Interactive element focused");
								assertTextSelection(document.activeElement);
							}
						}

						if (bShowInfo) {
							assert.ok(true, "[INFO] Simulating TAB event on: " + document.activeElement.id);
						}

						simulateTabEvent(document.activeElement);

						var bScrolled = iColumnIndex === iColumnCount - 1 && TableUtils.isLastScrollableRow(oTable, TableUtils.getCell(oTable, oElem));

						if (bShowInfo) {
							assert.ok(true, "[INFO] Scrolling will be performed: " + bScrolled);
						}

						setTimeout(function() {
							if (iAbsoluteRowIndex === iRowCount - 1 && iColumnIndex === iColumnCount - 1) {
								checkFocus(getCell(iVisibleRowCount - 1, iColumnCount - 1), assert);
								assert.ok(!oKeyboardExtension.isInActionMode(), "Table is in Navigation Mode");
							} else {
								assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");
							}
							resolve();
						}, bScrolled ? iDelayAfterScrollTabbing : iDelayAfterInRowTabbing);
					});
				});
			}())
		}
	}

	sequence = sequence.then(function() {
		return new Promise(function(resolve) {
			// Focus the interactive element in the last cell in the last row.
			oElem = TableKeyboardDelegate2._getInteractiveElements(document.activeElement)[0];
			oKeyboardExtension.setActionMode(true);
			assert.strictEqual(document.activeElement, oElem, "Last interactive element in the table focused");
			assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");
			resolve();
		});
	});

	// Tab back to the first interactive control of the table. Then tab back again to leave the action mode.
	for (i = iRowCount - 1; i >= 0; i--) {
		for (j = iColumnCount - 1; j >= -1; j--) {
			(function() {
				var iAbsoluteRowIndex = i;
				var iColumnIndex = j;
				var iRowIndex = i;

				if (iRowIndex >= iFixedRowCount && iRowIndex < iRowCount - iVisibleRowCount + iFixedRowCount + 1) {
					iRowIndex = iFixedRowCount;
				} else if (iRowIndex >= iRowCount - iVisibleRowCount + iFixedRowCount + 1) {
					iRowIndex = iRowIndex - (iRowCount - iVisibleRowCount);
				}

				sequence = sequence.then(function() {
					return new Promise(function(resolve) {
						if (iColumnIndex === -1) { // Row Header
							if (bTableHasRowHeader) {
								oElem = getRowHeader(iRowIndex);

								if (TableUtils.Grouping.isInGroupingRow(oElem)) {
									assert.strictEqual(document.activeElement, oElem[0],
										"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Header Cell: Group Header Icon focused");

								} else if (bTableHasRowSelectors) {
									assert.strictEqual(document.activeElement, oElem[0],
										"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Header Cell: Row Selector focused");

								} else {
									if (bShowInfo) {
										assert.ok(true,
											"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Header Cell: Skipped, is an empty row header (Grouping without Row Selectors)");
									}
								}
							} else {
								if (bShowInfo) {
									assert.ok(true,
										"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Header Cell: Skipped, table has no row header");
								}
								resolve();
								return;
							}

						} else {
							var $Cell = getCell(iRowIndex, iColumnIndex);
							var $InteractiveElement = TableKeyboardDelegate2._getInteractiveElements($Cell);

							if ($InteractiveElement === null) {
								if (bShowInfo) {
									assert.ok(true,
										"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Cell " + (iColumnIndex + 1) + ": Skipped, no interactive elements");
								}
								resolve();
								return;
							}

							oElem = $InteractiveElement[0];
							assert.strictEqual(document.activeElement, oElem,
								"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1) + "): Cell " + (iColumnIndex + 1) + ": Interactive element focused");
							assertTextSelection(document.activeElement);

							var bIsFirstInteractiveElementInRow = TableKeyboardDelegate2._getFirstInteractiveElement(oTable.getRows()[iRowIndex])[0] === oElem;
							var bRowHasInteractiveRowHeader = bTableHasRowSelectors || TableUtils.Grouping.isInGroupingRow(TableUtils.getCell(oTable, oElem));

							if (bIsFirstInteractiveElementInRow && iColumnIndex > 0 && !bRowHasInteractiveRowHeader) {
								resolve();
								return;
							}
						}

						if (bShowInfo) {
							assert.ok(true, "[INFO] Simulating Shift+TAB event on: " + document.activeElement.id);
						}

						simulateTabEvent(document.activeElement, true);

						var bIsFirstScrollableRow = TableUtils.isFirstScrollableRow(oTable, TableUtils.getCell(oTable, oElem));
						var bScrolled = iColumnIndex === (bTableHasRowHeader ? -1 : 0) && bIsFirstScrollableRow;

						if (bShowInfo) {
							assert.ok(true, "[INFO] Scrolling will be performed: " + bScrolled);
						}

						setTimeout(function() {
							if (iAbsoluteRowIndex === 0 && iColumnIndex === (bTableHasRowHeader ? -1 : 0)) {
								if (bTableHasRowHeader) {
									checkFocus(getRowHeader(0), assert);
								} else {
									checkFocus(getCell(0, 0), assert);
								}
								assert.ok(!oKeyboardExtension.isInActionMode(), "Table is in Navigation Mode");
							} else {
								assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");
							}
							resolve();
						}, bScrolled ? iDelayAfterScrollTabbing : iDelayAfterInRowTabbing);
					});
				});
			}())
		}
	}

	sequence.then(function() {
		done();
	});
}

QUnit.test("TAB & Shift+TAB - Default Test Table", function(assert) {
	_testActionModeTabNavigation(assert);
});

QUnit.test("TAB & Shift+TAB - Invisible Columns", function(assert) {
	oTable.getColumns()[1].setVisible(false);
	sap.ui.getCore().applyChanges();

	_testActionModeTabNavigation(assert);
});

QUnit.test("TAB & Shift+TAB - Fixed Top and Bottom Rows", function(assert) {
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	sap.ui.getCore().applyChanges();

	_testActionModeTabNavigation(assert);
});

QUnit.test("TAB & Shift+TAB - Fixed Top and Bottom Rows, Fixed Columns", function(assert) {
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	oTable.setFixedColumnCount(2);
	sap.ui.getCore().applyChanges();

	_testActionModeTabNavigation(assert);
});

QUnit.test("TAB & Shift+TAB - Fixed Top and Bottom Rows, Fixed Columns, No Row Headers", function(assert) {
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	oTable.setFixedColumnCount(2);
	oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
	sap.ui.getCore().applyChanges();

	_testActionModeTabNavigation(assert);
});

QUnit.test("TAB & Shift+TAB - Grouping", function(assert) {
	this.setupGrouping();
	_testActionModeTabNavigation(assert);
});

QUnit.test("TAB & Shift+TAB - Grouping, Fixed Top and Bottom Rows", function(assert) {
	this.setupGrouping();
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	sap.ui.getCore().applyChanges();

	_testActionModeTabNavigation(assert);
});

QUnit.test("TAB & Shift+TAB - Grouping, Fixed Top and Bottom Rows, Fixed Columns", function(assert) {
	this.setupGrouping();
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	oTable.setFixedColumnCount(2);
	sap.ui.getCore().applyChanges();

	_testActionModeTabNavigation(assert);
});

QUnit.test("TAB & Shift+TAB - Grouping, Fixed Top and Bottom Rows, Fixed Columns, No Row Headers", function(assert) {
	this.setupGrouping();
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	oTable.setFixedColumnCount(2);
	oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
	sap.ui.getCore().applyChanges();

	_testActionModeTabNavigation(assert);
});