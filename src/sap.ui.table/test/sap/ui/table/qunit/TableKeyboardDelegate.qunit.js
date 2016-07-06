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

	$Tabbables = jQuery.unique($Tabbables);
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
		checkFocus(getRowHeader(iVisibleRowCount - 1), assert);
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
		}

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
			checkFocus(getColumnHeader(0), assert);

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
		assert.ok(oDelegate === oDelegate.getInterface(), "getInterface returns the object itself");
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
		checkFocus(getCell(1, 1), assert);

		oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		simulateTabEvent(oElem, false);
		checkFocus(getCell(1, 1), assert);

		oElem = setFocusOutsideOfTable("Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
		oElem = checkFocus(getColumnHeader(2), assert);
		simulateTabEvent(oElem, false);
		checkFocus(getCell(1, 2), assert);
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
		checkFocus(jQuery.sap.domById("Focus2"), assert);

		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();
		oElem = getCell(1, 1, true);
		simulateTabEvent(oElem, true);
		checkFocus(jQuery.sap.domById("Extension"), assert);
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
		var i;

		for (i = 0; i < iNumberOfCols; i++) {
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

		for (i = 0; i < iNumberOfRows; i++) {
			qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
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

		qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
		oElem = checkFocus(getCell(iIdx, iColIdx), assert);
		qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
		oElem = checkFocus(getCell(iIdx, iColIdx), assert);
		assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index correct");

		for (i = iNumberOfCols - 2; i >= 0; i--) {
			iColIdx = i;
			qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
			oElem = checkFocus(getCell(iIdx, iColIdx), assert);
		}

		qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
		oElem = checkFocus(getRowHeader(iIdx), assert);

		for (i = iNumberOfRows - 2; i >= 0; i--) {
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
		checkFocus(getCell(0, 0), assert);
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
		checkFocus(getRowHeader(0), assert);
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
		checkFocus(getRowHeader(0), assert);
	});

	QUnit.test("Home/End", function(assert) {
		oTable.setFixedColumnCount(0);
		sap.ui.getCore().applyChanges();

		/* Test on column header */

		// First cell
		var oElem = checkFocus(getColumnHeader(0, true), assert);

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getSelectAll(), assert);

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getSelectAll(), assert);

		// *END* -> First cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *HOME* -> First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		checkFocus(getColumnHeader(0), assert);

		/* Test on first content row */

		// First cell
		oElem = checkFocus(getCell(0, 0, true), assert);

		// *HOME* -> Selection cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);

		// *HOME* -> Selection cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);

		// *END* -> First cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *HOME* -> First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		checkFocus(getCell(0, 0), assert);
	});

	QUnit.test("Home/End - No Row Header", function(assert) {
		oTable.setFixedColumnCount(0);
		oTable.setSelectionMode("None");
		sap.ui.getCore().applyChanges();

		/* Test on column header */

		// First cell
		var oElem = checkFocus(getColumnHeader(0, true), assert);

		// *HOME* -> First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *HOME* -> First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		checkFocus(getColumnHeader(0), assert);

		/* Test on first content row */

		// First cell
		oElem = checkFocus(getCell(0, 0, true), assert);

		// *HOME* -> First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *HOME* -> First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		checkFocus(getCell(0, 0), assert);
	});

	QUnit.test("Home/End - Fixed Column", function(assert) {
		/**
		 * 1 (of 5) Fixed Columns
		 */

		/* Test on column header */

		// Fixed area - Single cell
		var oElem = checkFocus(getColumnHeader(0, true), assert);

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getSelectAll(), assert);

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getSelectAll(), assert);

		// *END* -> Fixed area - Single cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *HOME* -> Non-Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount()), assert);

		// *HOME* -> Fixed area - Single cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		checkFocus(getColumnHeader(0), assert);

		/* Test on first content row */

		// Fixed area - Single cell
		oElem = checkFocus(getCell(0, 0, true), assert);

		// *HOME* -> Selection cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);

		// *HOME* -> Selection cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);

		// *END* -> Fixed area - Single cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *HOME* -> Non-Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getCell(0, oTable.getFixedColumnCount()), assert);

		// *HOME* -> Fixed area - Single cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
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
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getSelectAll(), assert);

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getSelectAll(), assert);

		// *END* -> Fixed area - First cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);

		// *END* -> Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount() - 1), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *HOME* -> Non-Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount()), assert);

		// *HOME* -> Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		checkFocus(getColumnHeader(0), assert);

		/* Test on first content row */

		// Fixed area - First cell
		oElem = checkFocus(getCell(0, 0, true), assert);

		// *HOME* -> Selection cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);

		// *HOME* -> Selection cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);

		// *END* -> Fixed area - First cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);

		// *END* -> Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, oTable.getFixedColumnCount() - 1), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *HOME* -> Non-Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getCell(0, oTable.getFixedColumnCount()), assert);

		// *HOME* -> Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
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
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);

		// *END* -> Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount() - 1), assert);

		// *END* -> Non-Fixed area - Single cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		/* Test on first content row */

		// Non-Fixed area - Single cell
		oElem = checkFocus(getCell(0, iNumberOfCols - 1, true), assert);

		// *HOME* -> Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);

		// *END* -> Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getCell(0, oTable.getFixedColumnCount() - 1), assert);

		// *END* -> Non-Fixed area - Single cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
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
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);

		// *END* -> Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		checkFocus(getColumnHeader(oTable.getFixedColumnCount() - 1), assert);

		/* Test on first content row */

		// Fixed area - Last cell
		oElem = checkFocus(getCell(0, iNumberOfCols - 1, true), assert);

		// *HOME* -> Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);

		// *END* -> Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		checkFocus(getCell(0, oTable.getFixedColumnCount() - 1), assert);
	});

	QUnit.test("Home/End - Fixed Column with Column Span", function(assert) {
		var iColSpan = 2;
		oTable.setFixedColumnCount(4);
		oTable.getColumns()[2].setHeaderSpan([iColSpan]);
		sap.ui.getCore().applyChanges();

		/* Test on column header */

		// Fixed area - First cell
		var oElem = checkFocus(getColumnHeader(0, true), assert);

		// *END* -> Fixed area - Last cell (First cell of the span)
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount() - iColSpan), assert);

		// *END* -> Non-Fixed area - Single cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *HOME* -> Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		checkFocus(getColumnHeader(0), assert);
	});

	QUnit.test("Home/End - Fixed Column with Multi Column", function(assert) {
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
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount() - iColSpan), assert);

		// *END* -> Non-Fixed area - Single cell (First cell of the span)
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount()), assert);

		// *END* -> Non-Fixed area - Single cell (First cell of the span)
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(getColumnHeader(oTable.getFixedColumnCount()), assert);

		// *HOME* -> Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		checkFocus(getColumnHeader(0), assert);

		/* Test on second column header row */

		// Fixed area - First cell
		oElem = jQuery.sap.domById(getColumnHeader(0).attr("id") + "_1");
		oElem.focus();
		checkFocus(oElem, assert);

		// *END* -> Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(oTable.getFixedColumnCount() - 1).attr("id") + "_1"), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(iNumberOfCols - 1).attr("id") + "_1"), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, "END", false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(iNumberOfCols - 1).attr("id") + "_1"), assert);

		// *HOME* -> Non-Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		oElem = checkFocus(jQuery.sap.domById(getColumnHeader(oTable.getFixedColumnCount()).attr("id") + "_1"), assert);

		// *HOME* -> Fixed area - First cell
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		checkFocus(jQuery.sap.domById(getColumnHeader(0).attr("id") + "_1"), assert);
	});

	QUnit.test("Home/End - Group row header", function(assert) {
		fakeGroupRow(0);

		// If the focus is on a group row header, the focus should not be changed by pressing Home or End.
		var oElem = getCell(0, 0, true, assert);
		qutils.triggerKeydown(oElem, "HOME", false, false, false);
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, "END", false, false, false);
		checkFocus(oElem, assert);
	});

	QUnit.test("Ctrl + Home/End", function(assert) {
		/* Test on row header */

		// SelectAll
		var oElem = checkFocus(getSelectAll(true), assert);

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getSelectAll(), assert);

		// *END* -> Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *END* -> Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> SelectAll (scrolled to top)
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getSelectAll(), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

		// Last row
		oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1, true), assert);

		// *END* -> Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		/* Test on first content column */

		// Header
		oElem = checkFocus(getColumnHeader(0, true), assert);

		// *HOME* -> Header cell
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getColumnHeader(0), assert);

		// *END* -> Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *END* -> Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> Header cell (scrolled to top)
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getColumnHeader(0), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

		// Last row
		oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0, true), assert);

		// *END* -> Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");
	});

	QUnit.test("Ctrl + Home/End - Less data rows than visible rows", function(assert) {
		oTable.setVisibleRowCount(10);
		sap.ui.getCore().applyChanges();

		/* Test on row header */

		// SelectAll
		var oElem = checkFocus(getSelectAll(true), assert);

		// *END* -> Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getRowHeader(Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1), assert);
		assert.equal(oTable.getRows()[oTable._getRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *END* -> Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getRowHeader(Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1), assert);
		assert.equal(oTable.getRows()[Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getSelectAll(), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

		// Empty area - Last row
		oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1, true), assert);
		assert.equal(oTable.getRows()[oTable._getRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getRowHeader(0, 0), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

		/* Test on first content column */

		// Header cell
		oElem = checkFocus(getColumnHeader(0, true), assert);

		// *END* -> Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getCell(Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1, 0), assert);
		assert.equal(oTable.getRows()[Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *END* -> Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getCell(Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1, 0), assert);
		assert.equal(oTable.getRows()[Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> Header cell
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getColumnHeader(0), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

		// Empty area -> Last row
		oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0, true), assert);
		assert.equal(oTable.getRows()[oTable._getRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getCell(0, 0), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");
	});

	QUnit.test("Ctrl + Home/End - Less data rows than visible rows and Fixed Top/Bottom Rows", function(assert) {
		oTable.setVisibleRowCount(12);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();

		/* Test on row header */

		// SelectAll
		var oElem = checkFocus(getSelectAll(true), assert);

		// *END* -> Top fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getRowHeader(oTable.getFixedRowCount() - 1), assert);

		// *END* -> Scrollable area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getRowHeader(Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - oTable.getFixedBottomRowCount() - 1), assert);
		assert.equal(oTable.getRows()[Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - oTable.getFixedBottomRowCount() - 1].getIndex(),
			iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Row index correct");

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getRowHeader(Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1), assert);

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getRowHeader(Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1), assert);

		// *HOME* -> Scrollable area - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getRowHeader(oTable.getFixedRowCount()), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

		// *HOME* -> Top fixed area - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getRowHeader(0), assert);

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getSelectAll(), assert);

		// Empty area - Last row
		oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1, true), assert);
		assert.equal(oTable.getRows()[oTable._getRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> Scrollable area - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getRowHeader(oTable.getFixedRowCount()), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

		/* Test on first content column */

		// Header cell
		oElem = checkFocus(getColumnHeader(0, true), assert);

		// *END* -> Top fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getCell(oTable.getFixedRowCount() - 1, 0), assert);

		// *END* -> Scrollable area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getCell(Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - oTable.getFixedBottomRowCount() - 1, 0), assert);
		assert.equal(oTable.getRows()[Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - oTable.getFixedBottomRowCount() - 1].getIndex(),
			iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Row index correct");

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getCell(Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1, 0), assert);

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getCell(Math.min(oTable.getVisibleRowCount(), oTable._getRowCount()) - 1, 0), assert);

		// *HOME* -> Scrollable area - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

		// *HOME* -> Top fixed area - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getCell(0, 0), assert);

		// *HOME* -> Header cell
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getColumnHeader(0), assert);

		// Empty area -> Last row
		oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0, true), assert);
		assert.equal(oTable.getRows()[oTable._getRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> Scrollable area - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");
	});

	QUnit.test("Ctrl + Home/End - No Column Header", function(assert) {
		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();

		/* Test on row header */

		// Top cell
		var oElem = checkFocus(getRowHeader(0, true), assert);

		// *HOME* -> First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getRowHeader(0), assert);

		// *END* -> Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *END* -> Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> First row (scrolled to top)
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getRowHeader(0), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

		/* Test on first content column */

		// Top cell
		oElem = checkFocus(getCell(0, 0, true), assert);

		// *HOME* -> First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getCell(0, 0), assert);

		// *END* -> Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *END* -> Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> First row (scrolled to top)
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getCell(0, 0), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");
	});

	QUnit.test("Ctrl + Home/End - Multi Header and Fixed Top/Bottom Rows", function(assert) {
		oTable.setFixedColumnCount(0);
		oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_1"}));
		oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_2_1"}));
		oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_3_1"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_1"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_1"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_3_2"}));
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_1"}));
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_2_2"}));
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
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getSelectAll(), assert);

		// *END* -> Top fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getRowHeader(oTable.getFixedRowCount() - 1), assert);

		// *END* -> Scrollable area - Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1].getIndex(),
			iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Row index correct");

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1), assert);

		// *HOME* -> Scrollable area - First row (scrolled to top)
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getRowHeader(oTable.getFixedRowCount()), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

		// *HOME* -> Top fixed area - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getRowHeader(0), assert);

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getSelectAll(), assert);

		// *END* -> Top fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getRowHeader(oTable.getFixedRowCount() - 1), assert);

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getSelectAll(), assert);

		/* Test on first content column */

		// Header - Second row
		oElem = jQuery.sap.domById(getColumnHeader(0).attr("id") + "_1");
		oElem.focus();
		checkFocus(oElem, assert);

		// *HOME* -> Header - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getColumnHeader(0), assert);

		// *HOME* -> Header - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getColumnHeader(0), assert);

		// *END* -> Top fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getCell(oTable.getFixedRowCount() - 1, 0), assert);

		// *END* -> Scrollable area - Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getCell(oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1, 0), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1].getIndex(),
			iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Row index correct");

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0), assert);

		// *HOME* -> Scrollable area - First row (scrolled to top)
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

		// *HOME* -> Top fixed area - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getCell(0, 0), assert);

		// *HOME* -> Header - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		oElem = checkFocus(getColumnHeader(0), assert);

		// *END* -> Top fixed area - Last row
		qutils.triggerKeydown(oElem, "END", false, false, true);
		oElem = checkFocus(getCell(oTable.getFixedRowCount() - 1, 0), assert);

		// *HOME* -> Header - First row
		qutils.triggerKeydown(oElem, "HOME", false, false, true);
		checkFocus(getColumnHeader(0), assert);
	});

	function _testPageKeys(assert) {
		var iNonEmptyVisibleRowCount = Math.min(oTable.getVisibleRowCount(), oTable._getRowCount());
		var iPageSize = iNonEmptyVisibleRowCount - oTable.getFixedRowCount() - oTable.getFixedBottomRowCount();
		var iLastScrollableRowIndex = iNonEmptyVisibleRowCount - oTable.getFixedBottomRowCount() - 1;
		var iHeaderRowCount = TableUtils.getHeaderRowCount(oTable);

		/* Test on row header */

		// SelectAll
		var oElem = checkFocus(getSelectAll(true), assert);

		// *PAGE_UP* -> SelectAll
		qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
		checkFocus(getSelectAll(), assert);

		// *PAGE_DOWN* -> First row
		qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);

		// *PAGE_DOWN* -> Scrollable area - Last row
		qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
		oElem = checkFocus(getRowHeader(iLastScrollableRowIndex), assert);

		// *PAGE_DOWN* -> Scrollable area - Last row - Scroll down all full pages
		for (var i = iLastScrollableRowIndex + iPageSize; i < iNumberOfRows - oTable.getFixedBottomRowCount(); i += iPageSize) {
			qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
			checkFocus(getRowHeader(iLastScrollableRowIndex), assert);
			assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), i, "Scrolled down: Row index correct");
		}

		// *PAGE_DOWN* -> Last row - Scrolled down the remaining rows
		qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
		oElem = checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 1), assert);
		assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Scrolled to bottom: Row index correct");

		// *PAGE_DOWN* -> Last row
		qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
		checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 1), assert);

		// *PAGE_UP* -> Scrollable area - First row
		qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
		oElem = checkFocus(getRowHeader(oTable.getFixedRowCount()), assert);

		// *PAGE_UP* -> Scrollable area - First row - Scroll up all full pages
		for (var i = iNumberOfRows - oTable.getFixedBottomRowCount() - iPageSize; i >= oTable.getFixedRowCount() + iPageSize; i -= iPageSize) {
			qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
			checkFocus(getRowHeader(oTable.getFixedRowCount()), assert);
			assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), i - iPageSize, "Scrolled up: Row index correct");
		}

		if (oTable.getFixedRowCount() > 0) {
			// *PAGE_UP* -> Top fixed area - First row - Scrolled up the remaining rows
			qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
			oElem = checkFocus(getRowHeader(0), assert);
			assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Scrolled to top: Row index correct");
		}

		// *PAGE_UP* -> SelectAll - Scrolled up the remaining rows (it not already)
		qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
		checkFocus(getSelectAll(), assert);
		if (oTable.getFixedRowCount() === 0) {
			assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Scrolled to top: Row index correct");
		}

		if (oTable._getRowCount() < oTable.getVisibleRowCount()) {
			// Empty area - Last row
			oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1, true), assert);

			// *PAGE_UP* -> Scrollable area - Last row
			qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
			checkFocus(getRowHeader(oTable._getRowCount() - 1, 0), assert);
		}

		/* Test on first content column */

		// Header -> First row
		oElem = checkFocus(getColumnHeader(0, true), assert);

		// *PAGE_UP* -> Header - First row
		qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);

		if (iHeaderRowCount > 1) {
			// *PAGE_DOWN* -> Header - Last row
			qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
			oElem = checkFocus(jQuery.sap.domById(getColumnHeader(0).attr("id") + "_" + (iHeaderRowCount - 1)), assert);
		}

		// *PAGE_DOWN* -> First row
		qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);

		// *PAGE_DOWN* -> Scrollable area - Last row
		qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
		oElem = checkFocus(getCell(iLastScrollableRowIndex, 0), assert);

		// *PAGE_DOWN* -> Scrollable area - Last row - Scroll down all full pages
		for (var i = iLastScrollableRowIndex + iPageSize; i < iNumberOfRows - oTable.getFixedBottomRowCount(); i += iPageSize) {
			qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
			checkFocus(getCell(iLastScrollableRowIndex, 0), assert);
			assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), i, "Scrolled down: Row index correct");
		}

		// *PAGE_DOWN* -> Last row - Scrolled down the remaining rows
		qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
		oElem = checkFocus(getCell(iNonEmptyVisibleRowCount - 1, 0), assert);
		assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Scrolled to bottom: Row index correct");

		// *PAGE_DOWN* -> Last row
		qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
		checkFocus(getCell(iNonEmptyVisibleRowCount - 1, 0), assert);

		// *PAGE_UP* -> Scrollable area - First row
		qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
		oElem = checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);

		// *PAGE_UP* -> Scrollable area - First row - Scroll up all full pages
		for (var i = iNumberOfRows - oTable.getFixedBottomRowCount() - iPageSize; i >= oTable.getFixedRowCount() + iPageSize; i -= iPageSize) {
			qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
			checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);
			assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), i - iPageSize, "Scrolled up: Row index correct");
		}

		if (oTable.getFixedRowCount() > 0) {
			// *PAGE_UP* -> Top fixed area - First row - Scrolled up the remaining rows
			qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
			oElem = checkFocus(getCell(0, 0), assert);
			assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Scrolled to top: Row index correct");
		}

		// *PAGE_UP* -> Header - First row - Scrolled up the remaining rows (if not already)
		qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
		checkFocus(getColumnHeader(0), assert);
		if (oTable.getFixedRowCount() === 0) {
			assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Scrolled to top: Row index correct");
		}

		if (oTable._getRowCount() < oTable.getVisibleRowCount()) {
			// Empty area -> Last row
			oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0, true), assert);

			// *PAGE_UP* -> Scrollable area - Last row
			qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
			checkFocus(getCell(oTable._getRowCount() - 1, 0), assert);
		}
	}

	QUnit.test("PageUp/PageDown", function(assert) {
		_testPageKeys(assert);
	});

	QUnit.test("PageUp/PageDown - Less data rows than visible rows", function(assert) {
		oTable.setVisibleRowCount(10);
		sap.ui.getCore().applyChanges();

		_testPageKeys(assert);
	});

	QUnit.test("PageUp/PageDown - Multi Header", function(assert) {
		oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		oTable.getColumns()[1].setHeaderSpan([2,1]);
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
		oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
		oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
		sap.ui.getCore().applyChanges();

		_testPageKeys(assert);
	});

	QUnit.test("PageUp/PageDown - Fixed Top/Bottom Rows", function(assert) {
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();

		_testPageKeys(assert);
	});

	QUnit.test("PageUp/PageDown - Fixed Top/Bottom Rows and Less data rows than visible rows", function(assert) {
		oTable.setVisibleRowCount(10);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();

		_testPageKeys(assert);
	});

	QUnit.test("PageUp/PageDown - Multi Header and Fixed Top/Bottom Rows", function(assert) {
		oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		oTable.getColumns()[1].setHeaderSpan([2,1]);
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

	QUnit.test("Focus on cell content", function(assert) {
		var oElem = findTabbables(getCell(0,0).get(0),[getCell(0,0).get(0)],true);
		oElem.focus();

		// If the focus is on an element inside the cell,
		// the focus should not be changed when pressing one the following keys.
		var aKeys = ["HOME", "END", "ARROW_LEFT", "ARROW_UP", "ARROW_RIGHT", "ARROW_DOWN"];

		checkFocus(oElem, assert);
		for (var i = 0; i < aKeys.length; i++) {
			qutils.triggerKeydown(oElem, aKeys[i], false, false, false);
			checkFocus(oElem, assert);
		}
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

	QUnit.test("F6 - backward (with extension and footer)", function(assert) {
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

	QUnit.asyncTest("NoData - TAB forward without column header", function(assert) {
		function doAfterNoDataDisplayed(){
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable("Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, false);
			oElem = checkFocus(jQuery.sap.domById("Focus2"), assert);

			QUnit.start();
		}

		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();
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

	QUnit.asyncTest("NoData - No vertical navigation (header <-> content)", function(assert) {
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
			qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			qutils.triggerKeydown(oElem, "END", false, false, true);
			checkFocus(getColumnHeader(0), assert);

			QUnit.start();
		}

		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.asyncTest("NoData / Overlay - No Navigation", function(assert) {
		function doAfterNoDataDisplayed(){
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);
			var sId = "noDataCnt";

			while (sId) {
				var oElem = oTable.$(sId);
				oElem.focus();
				oElem = checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "ARROW_DOWN", false, false, false);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "ARROW_LEFT", false, false, false);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "ARROW_RIGHT", false, false, false);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "ARROW_UP", false, false, false);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "HOME", false, false, false);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "END", false, false, false);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "HOME", false, false, true);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "END", false, false, true);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "PAGE_UP", false, false, false);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "PAGE_DOWN", false, false, false);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "PAGE_UP", false, true, false);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, "PAGE_DOWN", false, true, false);
				checkFocus(oElem, assert);

				sId = sId == "noDataCnt" ? "overlay" : null;
				oTable.setShowOverlay(true);
			}

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

}
