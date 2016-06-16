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

//Checks whether the given DomRef is contained or equals (in) one of the given container
function isContained(aContainers, oRef) {
	for (var i = 0; i < aContainers.length; i++) {
		if (aContainers[i] === oRef || jQuery.contains(aContainers[i], oRef)) {
			return true;
		}
	}
	return false;
}

//Returns a jQuery object which contains all next/previous (bNext) tabbable DOM elements of the given starting point (oRef) within the given scopes (DOMRefs)
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

	var $Tabbables = jQuery.unique($Tabbables);
	return $Tabbables.filter(function(){
		return isContained(aScopes, this);
	});
}

function simulateTabEvent(oTarget, bBackward) {
	var oParams = {};
	oParams.keyCode = jQuery.sap.KeyCodes["TAB"];
	oParams.which = oParams.keyCode;
	oParams.shiftKey = !!bBackward;
	oParams.altKey = false;
	oParams.metaKey = false;
	oParams.ctrlKey = false;

	if (typeof (oTarget) == "string") {
		oTarget = jQuery.sap.domById(oTarget);
	}

	var oEvent = jQuery.Event({type:"keydown"});
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

//************************************************************************
//Test Code
//************************************************************************


QUnit.module("KeyboardDelegate");


QUnit.test("Delegate Type", function(assert) {
	//TBD: Switch type when new keyboard spec is implemented
	assert.ok(checkDelegateType("sap.ui.table.TableKeyboardDelegate"), "Correct delegate");
});


if (checkDelegateType("sap.ui.table.TableKeyboardDelegate")) {

//************************************************************************
// Tests for sap.ui.table.TableKeyboardDelegate
//************************************************************************

	QUnit.module("Keyboard Support: Item Navigation", {
		setup: function() {
			createTables();
		},
		teardown: function () {
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

		qutils.triggerKeydown($Focus, "HOME", false, false, false);
		$Focus = checkFocus(getRowHeader(0, false), assert);

		qutils.triggerKeydown($Focus, "END", false, false, false);
		$Focus = checkFocus(getCell(0, 0), assert);

		qutils.triggerKeydown($Focus, "END", false, false, false);
		$Focus = checkFocus(getCell(0, iNumberOfCols - 1), assert);
		var oRow = oTable.getRows()[0];
		assert.equal(oRow.getIndex(), 0, "Row index correct");

		var iVisibleRowCount = oTable.getVisibleRowCount();

		qutils.triggerKeydown($Focus, "END", false, false, true /*Ctrl*/);
		$Focus = checkFocus(getCell(iVisibleRowCount - 1, iNumberOfCols - 1), assert);
		oRow = oTable.getRows()[iVisibleRowCount - 1];
		assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");

		qutils.triggerKeydown($Focus, "HOME", false, false, true /*Ctrl*/);
		$Focus = checkFocus(getCell(0, iNumberOfCols - 1), assert);
		oRow = oTable.getRows()[0];
		assert.equal(oRow.getIndex(), 0, "Row index correct");

		qutils.triggerKeydown($Focus, "HOME", false, false, false);
		$Focus = checkFocus(getCell(0, 1), assert); //First Non-Fixed Column

		qutils.triggerKeydown($Focus, "HOME", false, false, false);
		$Focus = checkFocus(getCell(0, 0), assert);

		qutils.triggerKeydown($Focus, "HOME", false, false, false);
		$Focus = checkFocus(getRowHeader(0, false), assert);

		qutils.triggerKeydown($Focus, "END", false, false, true /*Ctrl*/);
		$Focus = checkFocus(getRowHeader(iVisibleRowCount - 1), assert);
		oRow = oTable.getRows()[iVisibleRowCount - 1];
		assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");
	});


	QUnit.test("Action Mode on mouseup", function(assert) {
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


	QUnit.module("Keyboard Support: Overlay and NoData", {
		setup: setupTest,
		teardown: teardownTest
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
		function doAfterNoDataDisplayed(){
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
		function doAfterNoDataDisplayed(){
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
		function doAfterNoDataDisplayed(){
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
		function doAfterNoDataDisplayed(){
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
		function doAfterNoDataDisplayed(){
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable("Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
			oElem = checkFocus(getColumnHeader(1), assert);
			qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
			oElem = checkFocus(getColumnHeader(0), assert);

			QUnit.start();
		}

		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.asyncTest("NoData and Overlay combined - TAB forward", function(assert) {
		function doAfterNoDataDisplayed(){
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
		function doAfterNoDataDisplayed(){
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


} else if (checkDelegateType("sap.ui.table.TableKeyboardDelegate2")) {

//************************************************************************
// Tests for sap.ui.table.TableKeyboardDelegate2 (new Keyboard Behavior)
//************************************************************************

	QUnit.module("Basics", {
		setup: setupTest,
		teardown: teardownTest
	});

	QUnit.test("getInterface", function(assert) {
		var oDelegate = new sap.ui.table.TableKeyboardDelegate2();
		assert.ok(oDelegate === oDelegate.getInterface(), "getInterface returns the obejct itself");
	});



	QUnit.module("Keyboard Support: Navigation", {
		setup: setupTest,
		teardown: teardownTest
	});

	QUnit.test("TAB - forward/backward", function(assert) {
		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getCell(0, 1), assert);
		qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
		oElem = checkFocus(getCell(1, 1), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(jQuery.sap.domById("Focus2"), assert);

		simulateTabEvent(oElem, true);
		oElem = checkFocus(getCell(1, 1), assert);

		oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getCell(1, 1), assert);

		oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
		oElem = checkFocus(getColumnHeader(2), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getCell(1, 2), assert);
	});

	QUnit.test("TAB - forward/backward (with extension and footer)", function(assert) {
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable("Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(jQuery.sap.domById("Footer"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(getCell(0, 0), assert);
		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
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
		oElem = checkFocus(jQuery.sap.domById("Focus2"), assert);

		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();
		oElem = getCell(1, 1, true);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(jQuery.sap.domById("Extension"), assert);
	});

	function _testArrowKeys(assert) {
		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);
		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);
		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);
		qutils.triggerKeydown(oElem, "ARROW_UP", false, false, false);
		oElem = checkFocus(getSelectAll(), assert);
		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(getSelectAll(), assert);
		qutils.triggerKeydown(oElem, "ARROW_UP", false, false, false);
		oElem = checkFocus(getSelectAll(), assert);
		var iColIdx;
		for (var i = 0; i < iNumberOfCols; i++) {
			iColIdx = i;
			qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
			oElem = checkFocus(getColumnHeader(iColIdx), assert);
		}
		qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
		oElem = checkFocus(getColumnHeader(iColIdx), assert);
		qutils.triggerKeydown(oElem, "ARROW_UP", false, false, false);
		oElem = checkFocus(getColumnHeader(iColIdx), assert);

		var oRow, iIdx;
		var iVisibleRowCount = oTable.getVisibleRowCount();

		for (var i = 0; i < iNumberOfRows; i++) {
			qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
			iIdx = i;
			if (i >= oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() && i < iNumberOfRows - oTable.getFixedBottomRowCount()) {
				iIdx = oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1;
			} else if (i >= iNumberOfRows - oTable.getFixedBottomRowCount()) {
				iIdx = i - (iNumberOfRows - oTable.getVisibleRowCount());
			}
			oRow = oTable.getRows()[iIdx];
			oElem = checkFocus(getCell(iIdx, iColIdx), assert);
			assert.equal(oRow.getIndex(), i, "Row index correct");
		}

		qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
		oElem = checkFocus(getCell(iIdx, iColIdx), assert);
		qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
		oElem = checkFocus(getCell(iIdx, iColIdx), assert);
		assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");

		for (var i = iNumberOfCols - 2; i >= 0; i--) {
			iColIdx = i;
			qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
			oElem = checkFocus(getCell(iIdx, iColIdx), assert);
		}

		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(getRowHeader(iIdx), assert);

		for (var i = iNumberOfRows - 2; i >= 0; i--) {
			qutils.triggerKeydown(oElem, "ARROW_UP", false, false, false);
			iIdx = i;

			if (i >= oTable.getFixedRowCount() && i < iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
				iIdx = oTable.getFixedRowCount();
			} else if (i >= iNumberOfRows - oTable.getVisibleRowCount() + oTable.getFixedRowCount() + 1) {
				iIdx = i - (iNumberOfRows - oTable.getVisibleRowCount());
			}
			oRow = oTable.getRows()[iIdx];
			oElem = checkFocus(getRowHeader(iIdx), assert);
			assert.equal(oRow.getIndex(), i, "Row index correct");
		}
	}

	QUnit.test("Arrow keys", function(assert) {
		_testArrowKeys(assert);
	});

	QUnit.test("Arrow keys - Fixed Rows", function(assert) {
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();

		_testArrowKeys(assert);
	});

	QUnit.test("Arrow keys - No Row Header", function(assert) {
		oTable.setSelectionMode("None");
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);
		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);
	});

	QUnit.test("Arrow keys - No Column Header", function(assert) {
		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getCell(0, 0), assert);
		qutils.triggerKeydown(oElem, "ARROW_UP", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);
		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);
		qutils.triggerKeydown(oElem, "ARROW_UP", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);
	});

	QUnit.test("Arrow keys - Multi Header", function(assert) {
		oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		oTable.getColumns()[1].setHeaderSpan([2,1]);
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
		oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
		oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(0).attr("id") + "_1"), assert);
		qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(1).attr("id") + "_1"), assert);
		qutils.triggerKeydown(oElem, "ARROW_UP", false, false, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(1).attr("id") + "_1"), assert);
		qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(2).attr("id") + "_1"), assert);
		qutils.triggerKeydown(oElem, "ARROW_UP", false, false, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
		oElem = checkFocus(getColumnHeader(3), assert);
		qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(3).attr("id") + "_1"), assert);
		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(2).attr("id") + "_1"), assert);
		qutils.triggerKeydown(oElem, "ARROW_UP", false, false, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(getSelectAll(), assert);
		qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);
	});



	QUnit.module("Keyboard Support: F6 Handling", {
		setup: function() {
			setupTest();

			// Enhance the Navigation Handler to use the test scope only (not the QUnit related DOM)
			jQuery.sap.handleF6GroupNavigation_orig = jQuery.sap.handleF6GroupNavigation;
			jQuery.sap.handleF6GroupNavigation = function(oEvent, oSettings){
				oSettings = oSettings ? oSettings : {};
				if(!oSettings.scope){
					oSettings.scope = jQuery.sap.domById("content");
				}
				jQuery.sap.handleF6GroupNavigation_orig(oEvent, oSettings);
			};
		},
		teardown: function() {
			teardownTest();

			jQuery.sap.handleF6GroupNavigation = jQuery.sap.handleF6GroupNavigation_orig;
			jQuery.sap.handleF6GroupNavigation_orig = null;
		}
	});

	QUnit.test("F6 - forward (with extension and footer)", function(assert) {
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable("Focus1");
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		oElem = checkFocus(jQuery.sap.domById("Footer"), assert);

		oElem = getCell(1, 1, true, assert);
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		oElem = checkFocus(jQuery.sap.domById("Footer"), assert);

		oElem = getRowHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		oElem = checkFocus(jQuery.sap.domById("Footer"), assert);

		oElem = getSelectAll(true, assert);
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		oElem = checkFocus(jQuery.sap.domById("Footer"), assert);

		oElem = getColumnHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		oElem = checkFocus(jQuery.sap.domById("Footer"), assert);
	});

	QUnit.test("F6 - backward (with extension and footer)", function(assert) {
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable("Focus2");
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		oElem = checkFocus(jQuery.sap.domById("Focus1"), assert);

		oElem = getCell(1, 1, true, assert);
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		oElem = checkFocus(jQuery.sap.domById("Focus1"), assert);

		oElem = getRowHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		oElem = checkFocus(jQuery.sap.domById("Focus1"), assert);

		oElem = getSelectAll(true, assert);
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		oElem = checkFocus(jQuery.sap.domById("Focus1"), assert);

		oElem = getColumnHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		oElem = checkFocus(jQuery.sap.domById("Focus1"), assert);
	});

}
