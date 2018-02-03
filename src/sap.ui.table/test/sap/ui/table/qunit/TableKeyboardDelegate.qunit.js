/*global QUnit, oTable, oTreeTable */

sap.ui.require([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/TableUtils",
	"sap/ui/table/TableKeyboardDelegate2",
	"sap/ui/Device",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/events/F6Navigation"
], function(qutils, TableUtils, TableKeyboardDelegate2, Device, MenuM, MenuItemM, F6Navigation) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var iNumberOfCols = window.iNumberOfCols;
	var iNumberOfRows = window.iNumberOfRows;
	var initRowActions = window.initRowActions;
	var checkFocus = window.checkFocus;
	var setFocusOutsideOfTable = window.setFocusOutsideOfTable;
	var fakeGroupRow = window.fakeGroupRow;

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

	// Returns a jQuery object which contains all next/previous (bNext) tabbable DOM elements of the given starting point (oRef)
	// within the given scopes (DOMRefs).
	function findTabbables(oRef, aScopes, bNext) {
		var $Ref = jQuery(oRef),
			$All, $Tabbables;

		if (bNext) {
			$All = jQuery.merge($Ref.find("*"), jQuery.merge($Ref.nextAll(), $Ref.parents().nextAll()));
			$Tabbables = $All.find(":sapTabbable").addBack(":sapTabbable");
		} else {
			$All = jQuery.merge($Ref.prevAll(), $Ref.parents().prevAll());
			$Tabbables = jQuery.merge($Ref.parents(":sapTabbable"), $All.find(":sapTabbable").addBack(":sapTabbable"));
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

		/*eslint-disable new-cap */
		var oEvent = jQuery.Event({type: "keydown"});
		/*eslint-enable new-cap */
		for (var x in oParams) {
			oEvent[x] = oParams[x];
			oEvent.originalEvent[x] = oParams[x];
		}

		jQuery(oTarget).trigger(oEvent);

		if (oEvent.isDefaultPrevented()) {
			return;
		}

		var $Tabbables = findTabbables(document.activeElement, [jQuery.sap.domById("qunit-fixture")], !bBackward);
		if ($Tabbables.length) {
			$Tabbables.get(bBackward ? $Tabbables.length - 1 : 0).focus();
		}
	}

	/**
	 * Checks whether the complete text in an text input element is selected.
	 *
	 * @param {Object} assert QUnit assert object.
	 * @param {HTMLElement} oTextInputElement The input or textarea element to check for text selection.
	 * @param {boolean} bExpectSelected Whether the text in the input is expected to be selected.
	 * @param {string} sText The assertion message.
	 */
	function assertTextSelection(assert, oTextInputElement, bExpectSelected, sText) {
		if (Device.browser.phantomJS || Device.browser.safari) {
			return;
		}

		var iFirstSelectedIndex = typeof oTextInputElement.selectionStart === "number" ? oTextInputElement.selectionStart : 0;
		var iLastSelectedIndex = typeof oTextInputElement.selectionEnd === "number" ? oTextInputElement.selectionEnd : 0;
		var iSelectedCharacterCount = iLastSelectedIndex - iFirstSelectedIndex;
		var iTotalCharacterCount = oTextInputElement.value.length;
		var bSelected = iSelectedCharacterCount > 0 && iSelectedCharacterCount === iTotalCharacterCount;

		assert.strictEqual(bSelected, bExpectSelected, sText);
	}

	/**
	 * Adds a column to the tested table.
	 *
	 * @param {string} sTitle The label of the column.
	 * @param {string} sText The text of the column template.
	 * @param {boolean} bInputElement If set to <code>true</code>, the column template will be an input element, otherwise a span.
	 * @param {boolean} bFocusable If set to <code>true</code>, the column template will focusable. Only relevant, if <code>bInputElement</code>
	 *                             is set to true.
	 * @param {boolean} bTabbable If set to <code>true</code>, the column template will be tabbable.
	 * @param {string} sInputType The type of the input element. Only relevant, if <code>bInputElement</code> is set to true.
	 * @param {boolean} [bBindText=true] If set to <code>true</code>, the text property will be bound to the value of <code>sText</code>.
	 * @returns {int} The index of the added column.
	 */
	function addColumn(sTitle, sText, bInputElement, bFocusable, bTabbable, sInputType, bBindText) {
		if (bBindText == null) {
			bBindText = true;
		}

		var oControlTemplate;

		if (bInputElement) {
			oControlTemplate = new sap.ui.table.test.TestInputControl({
				text: bBindText ? "{" + sText + "}" : sText,
				index: iNumberOfCols,
				visible: true,
				tabbable: bTabbable,
				type: sInputType
			});
		} else {
			oControlTemplate = new sap.ui.table.test.TestControl({
				text: bBindText ? "{" + sText + "}" : sText,
				index: iNumberOfCols,
				visible: true,
				focusable: bFocusable,
				tabbable: bFocusable && bTabbable
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

		return iNumberOfCols - 1;
	}

	function setupTest() {
		createTables(true, true);
		var oFocus = new sap.ui.table.test.TestControl("Focus1", {text: "Focus1", tabbable: true});
		oFocus.placeAt("qunit-fixture");
		oTable.placeAt("qunit-fixture");
		oFocus = new sap.ui.table.test.TestControl("Focus2", {text: "Focus2", tabbable: true});
		oFocus.placeAt("qunit-fixture");
		oTreeTable.placeAt("qunit-fixture");
		oFocus = new sap.ui.table.test.TestControl("Focus3", {text: "Focus3", tabbable: true});
		oFocus.placeAt("qunit-fixture");
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

	//***************************************************************************
	// Tests for sap.ui.table.TableKeyboardDelegate2 (Helpers)
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

		var bIsMacintosh = Device.os.macintosh;

		Device.os.macintosh = false;

		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A), Key.A),
			"Pressed: A");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true), Key.A, CTRL),
			"Pressed: Ctrl+A");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true, false, true), Key.A, CTRL + SHIFT),
			"Pressed: Ctrl+Shift+A");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(null, true), null, CTRL),
			"Pressed: Ctrl");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true), null, CTRL),
			"Pressed: Ctrl+A (Checked only for Ctrl)");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(null, false, false, true, true), null, SHIFT + ALT),
			"Pressed: Shift+Alt");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(43), Key.PLUS),
			"Pressed: Plus");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(43, true), Key.PLUS, CTRL),
			"Pressed: Ctrl+Plus");

		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.Arrow.DOWN), Key.A),
			"Not Pressed: A (pressed ArrowDown)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true, false, true), Key.A, CTRL),
			"Not Pressed: Ctrl+A (pressed Ctrl+Shift+A)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true), Key.A, CTRL),
			"Not Pressed: Ctrl+A (pressed Meta+A)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true), Key.A, CTRL + SHIFT),
			"Not Pressed: Ctrl+Shift+A (pressed Ctrl+A)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(null, false, false, true), null, CTRL),
			"Not Pressed: Ctrl (pressed Shift)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.Arrow.DOWN), null, SHIFT + ALT),
			"Not Pressed: Shift+Alt (pressed ArrowDown)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(45), Key.PLUS),
			"Not Pressed: Plus (pressed Minus)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(43, false, true), Key.PLUS, CTRL),
			"Not Pressed: Ctrl+Plus (pressed Meta+Plus)");

		Device.os.macintosh = true;

		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A), Key.A),
			"Pressed: A");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true), Key.A, CTRL),
			"Pressed: Meta+A");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true, true), Key.A, CTRL + SHIFT),
			"Pressed: Meta+Shift+A");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(null, false, true), null, CTRL),
			"Pressed: Meta");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true), null, CTRL),
			"Pressed: Meta+A (Checked only for Meta)");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(null, false, false, true, true), null, SHIFT + ALT),
			"Pressed: Shift+Alt");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(43), Key.PLUS),
			"Pressed: Plus");
		assert.ok(TableKeyboardDelegate2._isKeyCombination(getEvent(43, false, true), Key.PLUS, CTRL),
			"Pressed: Meta+Plus");

		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.Arrow.DOWN), Key.A),
			"Not Pressed: A (pressed ArrowDown)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true, true), Key.A, CTRL),
			"Not Pressed: Meta+A (pressed Meta+Shift+A)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, true), Key.A, CTRL),
			"Not Pressed: Meta+A (pressed Ctrl+A)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.A, false, true), Key.A, CTRL + SHIFT),
			"Not Pressed: Meta+Shift+A (pressed Meta+A)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(null, false, false, true), null, CTRL),
			"Not Pressed: Meta (pressed Shift)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(Key.Arrow.DOWN), null, SHIFT + ALT),
			"Not Pressed: Shift+Alt (pressed ArrowDown)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(45), Key.PLUS),
			"Not Pressed: Plus (pressed Minus)");
		assert.ok(!TableKeyboardDelegate2._isKeyCombination(getEvent(43, true), Key.PLUS, CTRL),
			"Not Pressed: Meta+Plus (pressed Ctrl+Plus)");

		Device.os.macintosh = bIsMacintosh;
	});

	QUnit.test("_isElementGroupToggler", function(assert) {
		initRowActions(oTable, 2, 2);

		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, getCell(0, 0)[0]),
			"Returned False: Pressing a key on a normal data cell can not toggle a group");
		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, TableKeyboardDelegate2._getInteractiveElements(getCell(0, 0))[0]),
			"Returned False: Pressing a key on an interactive element inside a normal data cell can not toggle a group");
		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, getRowHeader(0)[0]),
			"Returned False: Pressing a key on a normal row header cell can not toggle a group");
		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, getRowAction(0)[0]),
			"Returned False: Pressing a key on a normal row action cell can not toggle a group");
		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, getColumnHeader(0)[0]),
			"Returned False: Pressing a key on a column header cell can not toggle a group");
		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTable, getSelectAll()[0]),
			"Returned False: Pressing a key on the SelectAll cell can not toggle a group");

		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable.getColumns()[0]);
		sap.ui.getCore().applyChanges();

		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTable, getCell(0, 1)[0]),
			"Returned True: Pressing a key on a data cell in a grouping row can toggle a group");
		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTable, getRowHeader(0)[0]),
			"Returned True: Pressing a key on a row header cell in a grouping row can toggle a group");
		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTable, getRowAction(0)[0]),
			"Returned True: Pressing a key on a row action cell in a grouping row can toggle a group");
	});

	QUnit.test("_isElementGroupToggler - TreeTable", function(assert) {
		initRowActions(oTreeTable, 2, 2);

		var oTreeIconCell = getCell(0, 0, null, null, oTreeTable)[0];
		var sTreeIconOpenClass = "sapUiTableTreeIconNodeOpen";
		var sTreeIconClosedClass = "sapUiTableTreeIconNodeClosed";
		var sTreeIconLeafClass = "sapUiTableTreeIconLeaf";

		// Closed node
		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, oTreeIconCell),
			"Returned True: Pressing a key on a tree icon cell of a closed node can toggle a group");
		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, TableKeyboardDelegate2._getInteractiveElements(oTreeIconCell)[0]),
			"Returned True: Pressing a key on a close node element can toggle a group");

		// Open node
		oTreeIconCell.classList.remove(sTreeIconClosedClass);
		oTreeIconCell.classList.add(sTreeIconOpenClass);

		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, oTreeIconCell),
			"Returned True: Pressing a key on a tree icon cell of a open node can toggle a group");
		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, TableKeyboardDelegate2._getInteractiveElements(oTreeIconCell)[0]),
			"Returned True: Pressing a key on a open node element can toggle a group");

		// Leaf node
		oTreeIconCell.classList.remove(sTreeIconOpenClass);
		oTreeIconCell.classList.add(sTreeIconLeafClass);

		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, oTreeIconCell),
			"Returned True: Pressing a key on a tree icon cell of a leaf node can toggle a group");
		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, TableKeyboardDelegate2._getInteractiveElements(oTreeIconCell)[0]),
			"Returned True: Pressing a key on a leaf node element can toggle a group");

		// Other elements
		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, TableKeyboardDelegate2._getInteractiveElements(oTreeIconCell)[1]),
			"Returned False: Pressing a key on an interactive element inside a cell can not toggle a group");
		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getRowHeader(0, null, null, oTreeTable)[0]),
			"Returned False: Pressing a key on a normal row header cell can not toggle a group");
		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getRowAction(0, null, null, oTreeTable)[0]),
			"Returned False: Pressing a key on a normal row action cell can not toggle a group");
		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getColumnHeader(0, null, null, oTreeTable)[0]),
			"Returned False: Pressing a key on a column header cell can not toggle a group");
		assert.ok(!TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getSelectAll(null, null, oTreeTable)[0]),
			"Returned False: Pressing a key on the SelectAll cell can not toggle a group");

		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getCell(0, 0, null, null, oTreeTable)[0]),
			"Returned True: Pressing a key on a data cell in a grouping row can toggle a group");
		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getCell(0, 1, null, null, oTreeTable)[0]),
			"Returned True: Pressing a key on a data cell in a grouping row can toggle a group");
		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getRowHeader(0, null, null, oTreeTable)[0]),
			"Returned True: Pressing a key on a row header cell in a grouping row can toggle a group");
		assert.ok(TableKeyboardDelegate2._isElementGroupToggler(oTreeTable, getRowAction(0, null, null, oTreeTable)[0]),
			"Returned True: Pressing a key on a row action cell in a grouping row can toggle a group");
	});

	QUnit.test("_focusElement", function(assert) {
		var oElement, oPreviousElement;
		var oSetSilentFocusSpy = this.spy(oTable._getKeyboardExtension(), "_setSilentFocus");
		var sInputType;
		var mInputTypes = {
			text: {supportsTextSelection: true, value: "text", columnIndex: null},
			password: {supportsTextSelection: true, value: "password", columnIndex: null},
			search: {supportsTextSelection: true, value: "search", columnIndex: null},
			tel: {supportsTextSelection: true, value: "123 456", columnIndex: null},
			url: {supportsTextSelection: true, value: "http://www.test.com", columnIndex: null},
			email: {supportsTextSelection: false, value: "test@test.com", columnIndex: null},
			number: {supportsTextSelection: false, value: "123456", columnIndex: null}
		};

		function getInputElement(iColumnIndex) {
			return oTable.getRows()[0].getCells()[iColumnIndex].getDomRef();
		}

		function testInputElement(mInputType, bSilentFocus) {
			oElement = getInputElement(mInputType.columnIndex);

			TableKeyboardDelegate2._focusElement(oTable, oElement, bSilentFocus);

			checkFocus(oElement, assert);

			if (mInputType.supportsTextSelection) {
				assertTextSelection(assert, oElement, true, "Input type: " + oElement.type + " - The text is selected");
			}

			if (bSilentFocus) {
				assert.ok(oSetSilentFocusSpy.calledOnce, "Input type: " + oElement.type + " - The element was focused silently");
				oSetSilentFocusSpy.reset();
			} else {
				assert.ok(oSetSilentFocusSpy.notCalled, "Input type: " + oElement.type + " - The element was not focused silently");
			}

			if (oPreviousElement != oElement) {
				if (oPreviousElement != null) {
					assertTextSelection(assert, oPreviousElement, false, "The text of the previously focused input element is not selected");
				}
				oPreviousElement = oElement;
			}
		}

		for (sInputType in mInputTypes) {
			mInputTypes[sInputType].columnIndex = addColumn(sInputType, mInputTypes[sInputType].value, true, null, null, sInputType, false);
		}
		sap.ui.getCore().applyChanges();

		for (sInputType in mInputTypes) {
			testInputElement(mInputTypes[sInputType]);
		}
		for (sInputType in mInputTypes) {
			testInputElement(mInputTypes[sInputType], true);
		}

		oElement = getInputElement(mInputTypes.text.columnIndex);
		oPreviousElement = oElement;
		TableKeyboardDelegate2._focusElement(oTable, oElement);
		checkFocus(oElement, assert);
		assert.ok(oSetSilentFocusSpy.notCalled, "The element was not focused silently");
		assertTextSelection(assert, oElement, true, "The text is selected");

		oElement = oTable.getRows()[0].getCells()[0].getDomRef();
		TableKeyboardDelegate2._focusElement(oTable, oElement);
		checkFocus(oElement, assert);
		assert.ok(oSetSilentFocusSpy.notCalled, "The element was not focused silently");
		assertTextSelection(assert, oPreviousElement, false, "The text of the previously focused element is not selected");

		oElement = oTable.getRows()[0].getCells()[0].getDomRef();
		TableKeyboardDelegate2._focusElement(oTable, oElement, true);
		checkFocus(oElement, assert);
		assert.ok(oSetSilentFocusSpy.calledOnce, "The element was focused silently");

		iNumberOfCols -= Object.keys(mInputTypes).length;
		oSetSilentFocusSpy.restore();
	});

	//***************************************************************************
	// Tests for sap.ui.table.TableKeyboardDelegate2 (Interactive Element Helpers)
	//***************************************************************************

	QUnit.module("Interactive elements", {
		beforeEach: function() {
			createTables();

			addColumn("Focusable & Not Tabbable", "Focus&NoTabSpan", false, true, false);
			addColumn("Not Focusable & Not Tabbable", "NoFocus&NoTabSpan", false, false, false);
			addColumn("Focusable & Tabbable", "Focus&TabInput", true, null, true);
			addColumn("Focusable & Not Tabbable", "Focus&NoTabInput", true, null, false);

			initRowActions(oTable, 2, 2);
		},
		afterEach: function() {
			destroyTables();
			iNumberOfCols -= 4;
		}
	});

	QUnit.test("_isInteractiveElement", function(assert) {
		var $FocusAndNoTabSpan = getCell(0, iNumberOfCols - 4).find("span");
		var $NoFocusAndNoTabSpan = getCell(0, iNumberOfCols - 3).find("span");
		var $FocusAndTabInput = getCell(0, iNumberOfCols - 2).find("input");
		var $FocusAndNoTabInput = getCell(0, iNumberOfCols - 1).find("input");
		var $TreeIconOpen = jQuery("<div class=\"sapUiTableTreeIcon sapUiTableTreeIconNodeOpen\"></div>");
		var $TreeIconClosed = jQuery("<div class=\"sapUiTableTreeIcon sapUiTableTreeIconNodeClosed\"></div>");
		var $TreeIconLeaf = jQuery("<div class=\"sapUiTableTreeIcon sapUiTableTreeIconLeaf\"></div>");
		var $RowActionIcon = getRowAction(0).find(".sapUiTableActionIcon");

		assert.ok(!TableKeyboardDelegate2._isElementInteractive($NoFocusAndNoTabSpan),
			"(jQuery) Not focusable and not tabbable span element is not interactive");
		assert.ok(!TableKeyboardDelegate2._isElementInteractive($FocusAndNoTabSpan),
			"(jQuery) Focusable and not tabbable span element is not interactive");
		assert.ok(TableKeyboardDelegate2._isElementInteractive($FocusAndNoTabInput),
			"(jQuery) Focusable and not tabbable input element is interactive");
		assert.ok(TableKeyboardDelegate2._isElementInteractive($FocusAndTabInput),
			"(jQuery) Focusable and tabbable input element is interactive");
		assert.ok(TableKeyboardDelegate2._isElementInteractive($TreeIconOpen),
			"(jQuery) TreeIcon of open node is interactive");
		assert.ok(TableKeyboardDelegate2._isElementInteractive($TreeIconClosed),
			"(jQuery) TreeIcon of closed node is interactive");
		assert.ok(!TableKeyboardDelegate2._isElementInteractive($TreeIconLeaf),
			"(jQuery) TreeIcon of leaf node is not interactive");
		assert.ok(TableKeyboardDelegate2._isElementInteractive($RowActionIcon),
			"(jQuery) ActionItem is interactive");

		assert.ok(!TableKeyboardDelegate2._isElementInteractive($NoFocusAndNoTabSpan[0]),
			"(HTMLElement) Not focusable and not tabbable span element is not interactive");
		assert.ok(!TableKeyboardDelegate2._isElementInteractive($FocusAndNoTabSpan)[0],
			"(HTMLElement) Focusable and not tabbable span element is not interactive");
		assert.ok(TableKeyboardDelegate2._isElementInteractive($FocusAndNoTabInput[0]),
			"(HTMLElement) Focusable and not tabbable input element is interactive");
		assert.ok(TableKeyboardDelegate2._isElementInteractive($FocusAndTabInput[0]),
			"(HTMLElement) Focusable and tabbable input element is interactive");
		assert.ok(TableKeyboardDelegate2._isElementInteractive($TreeIconOpen[0]),
			"(HTMLElement) TreeIcon of open node is interactive");
		assert.ok(TableKeyboardDelegate2._isElementInteractive($TreeIconClosed[0]),
			"(HTMLElement) TreeIcon of closed node is interactive");
		assert.ok(!TableKeyboardDelegate2._isElementInteractive($TreeIconLeaf[0]),
			"(HTMLElement) TreeIcon of leaf node is not interactive");
		assert.ok(TableKeyboardDelegate2._isElementInteractive($RowActionIcon[0]),
			"(HTMLElement) ActionItem is interactive");

		assert.ok(!TableKeyboardDelegate2._isElementInteractive(), "No parameter passed: False was returned");
	});

	QUnit.test("_getInteractiveElements", function(assert) {
		var $InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 1));
		assert.strictEqual($InteractiveElements.length, 1, "(JQuery) Data cell with focusable element: One element was returned");
		assert.strictEqual($InteractiveElements[0].value, "Focus&NoTabInput1",
			"(JQuery) Data cell with focusable element: The correct element was returned");

		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 1)[0]);
		assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Data cell with focusable element: One element was returned");
		assert.strictEqual($InteractiveElements[0].value, "Focus&NoTabInput1",
			"(HTMLElement) Data cell with focusable element: The correct element was returned");

		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 2));
		assert.strictEqual($InteractiveElements.length, 1, "(jQuery) Data cell with focusable & tabbable element: One element was returned");
		assert.strictEqual($InteractiveElements[0].value, "Focus&TabInput1",
			"(jQuery) Data cell with focusable & tabbable element: The correct element was returned");

		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 2)[0]);
		assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Data cell with focusable & tabbable element: One element was returned");
		assert.strictEqual($InteractiveElements[0].value, "Focus&TabInput1",
			"(HTMLElement) Data cell with focusable & tabbable element: The correct element was returned");

		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 3));
		assert.strictEqual($InteractiveElements, null, "Data cell without interactive element: Null was returned");

		var $RowActionCell = getRowAction(0);
		var $RowActionIcons = $RowActionCell.find(".sapUiTableActionIcon:visible");
		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($RowActionCell);
		assert.strictEqual($InteractiveElements.length, 2, "(jQuery) Row Action cell with 2 action items: Two elements have been returned");
		assert.strictEqual($InteractiveElements[0], $RowActionIcons[0], "(jQuery) The first returned element is the correct row action icon");
		assert.strictEqual($InteractiveElements[1], $RowActionIcons[1], "(jQuery) The second returned element is the correct row action icon");

		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($RowActionCell[0]);
		assert.strictEqual($InteractiveElements.length, 2, "(HTMLElement) Row Action cell with 2 action items: Two elements have been returned");
		assert.strictEqual($InteractiveElements[0], $RowActionIcons[0], "(HTMLElement) The first returned element is the correct row action icon");
		assert.strictEqual($InteractiveElements[1], $RowActionIcons[1], "(HTMLElement) The second returned element is the correct row action icon");

		initRowActions(oTable, 1, 1);
		$RowActionCell = getRowAction(0);
		$RowActionIcons = $RowActionCell.find(".sapUiTableActionIcon:visible");
		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($RowActionCell);
		assert.strictEqual($InteractiveElements.length, 1, "(jQuery) Row Action cell with 1 action item: One element was returned");
		assert.strictEqual($InteractiveElements[0], $RowActionIcons[0], "(jQuery) The returned element is the correct row action icon");

		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($RowActionCell[0]);
		assert.strictEqual($InteractiveElements.length, 1, "(HTMLElement) Row Action cell with 1 action item: One elements was returned");
		assert.strictEqual($InteractiveElements[0], $RowActionIcons[0], "(HTMLElement) The first returned element is the correct row action icon");

		initRowActions(oTable, 1, 0);
		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getRowAction(0));
		assert.strictEqual($InteractiveElements, null, "Row action cell without interactive element: Null was returned");

		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getColumnHeader(0));
		assert.strictEqual($InteractiveElements, null, "Column header: Null was returned");

		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getRowHeader(0));
		assert.strictEqual($InteractiveElements, null, "Row header: Null was returned");

		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(getRowAction(0));
		assert.strictEqual($InteractiveElements, null, "Row action: Null was returned");

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
		assert.strictEqual($FirstInteractiveElement[0].value, "Focus&TabInput1", "First row: The correct element was returned");

		oTable.getColumns().forEach(function(oColumn) {
			oColumn.setVisible(false);
		});
		sap.ui.getCore().applyChanges();

		$FirstInteractiveElement = TableKeyboardDelegate2._getFirstInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($FirstInteractiveElement.length, 1, "First row: One element was returned");
		assert.strictEqual($FirstInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"First row: The correct element was returned");

		initRowActions(oTable, 1, 0);
		$FirstInteractiveElement = TableKeyboardDelegate2._getFirstInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($FirstInteractiveElement, null, "Row has no interactive elements: Null was returned");

		$FirstInteractiveElement = TableKeyboardDelegate2._getFirstInteractiveElement();
		assert.strictEqual($FirstInteractiveElement, null, "No parameter passed: Null was returned");
	});

	QUnit.test("_getLastInteractiveElement", function(assert) {
		var $LastInteractiveElement = TableKeyboardDelegate2._getLastInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($LastInteractiveElement.length, 1, "First row with row actions: One element was returned");
		assert.strictEqual($LastInteractiveElement.get(-1), getRowAction(0).find(".sapUiTableActionIcon:visible").get(-1),
			"First row with row actions: The correct element was returned");

		initRowActions(oTable, 2, 0);
		$LastInteractiveElement = TableKeyboardDelegate2._getLastInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($LastInteractiveElement.length, 1, "First row without row actions: One element was returned");
		assert.strictEqual($LastInteractiveElement[0].value, "Focus&NoTabInput1", "First row without row actions: The correct element was returned");

		$LastInteractiveElement = TableKeyboardDelegate2._getLastInteractiveElement();
		assert.strictEqual($LastInteractiveElement, null, "No parameter passed: Null was returned");
	});

	QUnit.test("_getPreviousInteractiveElement", function(assert) {
		var $LastInteractiveElement = TableKeyboardDelegate2._getLastInteractiveElement(oTable.getRows()[0]);

		var $PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $LastInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"The correct previous element was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0].value, "Focus&NoTabInput1", "The correct previous element was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0].value, "Focus&TabInput1", "The correct previous element was returned");

		var $FirstInteractiveElement = TableKeyboardDelegate2._getFirstInteractiveElement(oTable.getRows()[0]);
		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $FirstInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement, null,
			"(jQuery) Getting the previous interactive element of the first interactive element: Null was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $LastInteractiveElement[0]);
		assert.strictEqual($PreviousInteractiveElement.length, 1,
			"(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"The correct previous element was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement[0]);
		assert.strictEqual($PreviousInteractiveElement.length, 1,
			"(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0].value, "Focus&NoTabInput1", "The correct previous element was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement[0]);
		assert.strictEqual($PreviousInteractiveElement.length, 1,
			"(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0].value, "Focus&TabInput1", "The correct previous element was returned");

		$FirstInteractiveElement = TableKeyboardDelegate2._getFirstInteractiveElement(oTable.getRows()[0]);
		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, $FirstInteractiveElement[0]);
		assert.strictEqual($PreviousInteractiveElement, null,
			"(HTMLElement) Getting the previous interactive element of the first interactive element: Null was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, getCell(0, 0));
		assert.strictEqual($PreviousInteractiveElement, null, "Data cell was passed: Null was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, getColumnHeader(0));
		assert.strictEqual($PreviousInteractiveElement, null, "Column header cell was passed: Null was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, getRowHeader(0));
		assert.strictEqual($PreviousInteractiveElement, null, "Row header cell was passed: Null was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable, getSelectAll(0));
		assert.strictEqual($PreviousInteractiveElement, null, "SelectAll cell was passed: Null was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement(oTable);
		assert.strictEqual($PreviousInteractiveElement, null, "No interactive element was passed: Null was returned");

		$PreviousInteractiveElement = TableKeyboardDelegate2._getPreviousInteractiveElement();
		assert.strictEqual($PreviousInteractiveElement, null, "No parameter was passed: Null was returned");
	});

	QUnit.test("_getNextInteractiveElement", function(assert) {
		var $FirstInteractiveElement = TableKeyboardDelegate2._getFirstInteractiveElement(oTable.getRows()[0]);

		var $NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, $FirstInteractiveElement);
		assert.strictEqual($NextInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0].value, "Focus&NoTabInput1", "The correct next element was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, $NextInteractiveElement);
		assert.strictEqual($NextInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"The correct next element was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, $NextInteractiveElement);
		assert.strictEqual($NextInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[1],
			"The correct next element was returned");

		var $LastInteractiveElement = TableKeyboardDelegate2._getLastInteractiveElement(oTable.getRows()[0]);
		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, $LastInteractiveElement);
		assert.strictEqual($NextInteractiveElement, null,
			"(jQuery) Getting the next interactive element of the last interactive element: Null was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, $FirstInteractiveElement[0]);
		assert.strictEqual($NextInteractiveElement.length, 1, "(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0].value, "Focus&NoTabInput1", "The correct next element was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, $NextInteractiveElement[0]);
		assert.strictEqual($NextInteractiveElement.length, 1, "(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"The correct next element was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, $NextInteractiveElement[0]);
		assert.strictEqual($NextInteractiveElement.length, 1, "(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[1],
			"The correct next element was returned");

		$LastInteractiveElement = TableKeyboardDelegate2._getLastInteractiveElement(oTable.getRows()[0]);
		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, $LastInteractiveElement[0]);
		assert.strictEqual($NextInteractiveElement, null,
			"(HTMLElement) Getting the next interactive element of the last interactive element: Null was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, getCell(0, 0));
		assert.strictEqual($NextInteractiveElement, null, "Data cell was passed: Null was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, getColumnHeader(0));
		assert.strictEqual($NextInteractiveElement, null, "Column header cell was passed: Null was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, getRowHeader(0));
		assert.strictEqual($NextInteractiveElement, null, "Row header cell was passed: Null was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable, getSelectAll(0));
		assert.strictEqual($NextInteractiveElement, null, "SelectAll cell was passed: Null was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement(oTable);
		assert.strictEqual($NextInteractiveElement, null, "No interactive element was passed: Null was returned");

		$NextInteractiveElement = TableKeyboardDelegate2._getNextInteractiveElement();
		assert.strictEqual($NextInteractiveElement, null, "No parameter was passed: Null was returned");
	});

	//************************************************************************
	// Tests for sap.ui.table.TableKeyboardDelegate2 (new Keyboard Behavior)
	//************************************************************************

	QUnit.module("TableKeyboardDelegate2 - Basics", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("getInterface", function(assert) {
		var oDelegate = new TableKeyboardDelegate2();
		assert.ok(oDelegate === oDelegate.getInterface(), "getInterface returns the object itself");
	});

	QUnit.module("TableKeyboardDelegate2 - Navigation > Tab & Shift+Tab", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Default Test Table", function(assert) {
		var oElem = setFocusOutsideOfTable(assert, "Focus1");
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

		oElem = setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		simulateTabEvent(oElem, false);
		checkFocus(getCell(1, 1), assert);

		oElem = setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
		oElem = checkFocus(getColumnHeader(2), assert);
		simulateTabEvent(oElem, false);
		checkFocus(getCell(1, 2), assert);
	});

	QUnit.test("Row Actions", function(assert) {
		initRowActions(oTable, 1, 1);
		sap.ui.getCore().applyChanges();
		var oElem = checkFocus(getRowAction(1, true), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(jQuery.sap.domById("Focus2"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(getRowAction(1), assert);
		simulateTabEvent(oElem, true);
		checkFocus(jQuery.sap.domById("Focus1"), assert);
	});

	QUnit.test("Extension and Footer", function(assert) {
		oTable.addExtension(new sap.ui.table.test.TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new sap.ui.table.test.TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable(assert, "Focus2");
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

	QUnit.test("On a non-interactive element inside a cell", function(assert) {
		var oNonInteractiveElement = oTable.getRows()[0].getCells()[1].getDomRef();
		oNonInteractiveElement.tabIndex = -1; // Make it non-interactive.

		oNonInteractiveElement.focus();
		checkFocus(oNonInteractiveElement, assert);

		simulateTabEvent(oNonInteractiveElement, false);
		checkFocus(getCell(0, 1), assert);

		oNonInteractiveElement.focus();
		checkFocus(oNonInteractiveElement, assert);

		simulateTabEvent(oNonInteractiveElement, true);
		checkFocus(getCell(0, 1), assert);
	});

	QUnit.module("TableKeyboardDelegate2 - Navigation > Arrow Keys", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		},

		/**
		 * Navigates all around the table using the arrow keys, takes virtual vertical scrolling into account.
		 * Start from the left top cell -> to the right top cell -> to the right bottom cell -> to the left bottom cell -> to the left top cell.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {boolean} [bShowInfo=false] If <code>true</code>, additional information will be printed in the QUnit output.
		 * @private
		 */
		testArrowKeys: function(assert, bShowInfo) {
			var iVisibleRowCount = oTable.getVisibleRowCount();
			var iFixedTopRowCount = oTable.getFixedRowCount();
			var iFixedBottomRowCount = oTable.getFixedBottomRowCount();
			var bHasColumnHeaders = oTable.getColumnHeaderVisible();
			var bHasRowHeaders = TableUtils.hasRowHeader(oTable);
			var bHasRowActions = TableUtils.hasRowActions(oTable);
			var oElem, i, iRowIndex, oRow;

			if (bShowInfo == null) {
				bShowInfo = false;
			}

			oElem = setFocusOutsideOfTable(assert, "Focus1");

			if (bShowInfo) {
				assert.ok(true, "[INFO] Tab into the table and navigate to the top left cell.");
			}

			simulateTabEvent(oElem, false);

			if (bHasColumnHeaders) {
				oElem = checkFocus(getColumnHeader(0), assert);
			} else {
				oElem = checkFocus(getCell(0, 0), assert);
			}
			if (bHasRowHeaders) {
				qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);

				if (bHasColumnHeaders) {
					oElem = checkFocus(getSelectAll(), assert);
				} else {
					oElem = checkFocus(getRowHeader(0), assert);
				}
			}

			if (bShowInfo) {
				assert.ok(true, "[INFO] Navigating left or up should have no effect if the focus is already at the top left cell.");
			}

			qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
			checkFocus(oElem, assert);

			if (bShowInfo) {
				assert.ok(true, "[INFO] Navigate right to the top right cell.");
			}

			for (i = bHasRowHeaders ? 0 : 1; i < iNumberOfCols; i++) {
				qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);

				if (bHasColumnHeaders) {
					oElem = checkFocus(getColumnHeader(i), assert);
				} else {
					oElem = checkFocus(getCell(0, i), assert);
				}
			}
			if (!bHasColumnHeaders && bHasRowActions) {
				qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
				oElem = checkFocus(getRowAction(0), assert);
			}

			if (bShowInfo) {
				assert.ok(true, "[INFO] Navigating right or up should have no effect if the focus is already at the top right cell.");
			}

			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
			checkFocus(oElem, assert);

			// The row action column header cell should not be accessible by keyboard navigation.
			if (bHasColumnHeaders && bHasRowActions) {
				if (bShowInfo) {
					assert.ok(true, "[INFO] There is a column header and row actions, so we stopped at the rightmost column header cell. Navigate"
									+ " to the top row action cell.");
				}

				qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
				checkFocus(oElem, assert);

				qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
				oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);
				qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
				oElem = checkFocus(getRowAction(0), assert);

				if (bShowInfo) {
					assert.ok(true, "[INFO] Navigating right or up should have no effect if the focus is already at the top right cell.");
				}

				qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
				checkFocus(oElem, assert);
			}

			if (bShowInfo) {
				assert.ok(true, "[INFO] Navigate down to the bottom right cell, taking scrolling into account.");
			}

			for (i = (bHasColumnHeaders && !bHasRowActions) ? 0 : 1; i < iNumberOfRows; i++) {
				qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);

				iRowIndex = i;
				if (i >= iVisibleRowCount - iFixedBottomRowCount && i < iNumberOfRows - iFixedBottomRowCount) {
					iRowIndex = iVisibleRowCount - iFixedBottomRowCount - 1;
				} else if (i >= iNumberOfRows - iFixedBottomRowCount) {
					iRowIndex = i - (iNumberOfRows - iVisibleRowCount);
				}

				if (bHasRowActions) {
					oElem = checkFocus(getRowAction(iRowIndex), assert);
				} else {
					oElem = checkFocus(getCell(iRowIndex, iNumberOfCols - 1), assert);
				}

				oRow = oTable.getRows()[iRowIndex];
				assert.equal(oRow.getIndex(), i, "Row index is: " + oRow.getIndex() + ", should be: " + i);
			}

			if (bShowInfo) {
				assert.ok(true, "[INFO] Navigating right or down should have no effect if the focus is already at the bottom right cell.");
			}

			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
			checkFocus(oElem, assert);

			if (bShowInfo) {
				assert.ok(true, "[INFO] Navigate left to the bottom left cell.");
			}

			for (i = iNumberOfCols - (bHasRowActions ? 1 : 2); i >= 0; i--) {
				qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
				oElem = checkFocus(getCell(iVisibleRowCount - 1, i), assert);
			}
			if (bHasRowHeaders) {
				qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
				oElem = checkFocus(getRowHeader(iVisibleRowCount - 1), assert);
			}

			if (bShowInfo) {
				assert.ok(true, "[INFO] Navigating left or down should have no effect if the focus is already at the bottom left cell.");
			}

			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
			checkFocus(oElem, assert);

			if (bShowInfo) {
				assert.ok(true, "[INFO] Navigate up to the top left cell.");
			}

			for (i = iNumberOfRows - 2; i >= 0; i--) {
				qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);

				iRowIndex = i;
				if (i >= iFixedTopRowCount && i < iNumberOfRows - iVisibleRowCount + iFixedTopRowCount + 1) {
					iRowIndex = iFixedTopRowCount;
				} else if (i >= iNumberOfRows - iVisibleRowCount + iFixedTopRowCount + 1) {
					iRowIndex = i - (iNumberOfRows - iVisibleRowCount);
				}

				if (bHasRowHeaders) {
					oElem = checkFocus(getRowHeader(iRowIndex), assert);
				} else {
					oElem = checkFocus(getCell(iRowIndex, 0), assert);
				}

				oRow = oTable.getRows()[iRowIndex];
				assert.equal(oRow.getIndex(), i, "Row index is: " + oRow.getIndex() + ", should be: " + i);
			}
			if (bHasColumnHeaders) {
				qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);

				if (bHasRowHeaders) {
					checkFocus(getSelectAll(), assert);
				} else {
					checkFocus(getColumnHeader(0), assert);
				}
			}
		}
	});

	QUnit.test("Default Test Table - Row Header, Column Header", function(assert) {
		this.testArrowKeys(assert);
	});

	QUnit.test("Fixed Rows", function(assert) {
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();

		this.testArrowKeys(assert);
	});

	QUnit.test("No Row Header", function(assert) {
		oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
		sap.ui.getCore().applyChanges();

		this.testArrowKeys(assert);
	});

	QUnit.test("No Column Header", function(assert) {
		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();

		this.testArrowKeys(assert);
	});

	QUnit.test("Row Actions", function(assert) {
		initRowActions(oTable, 1, 1);
		this.testArrowKeys(assert);
	});

	QUnit.test("Column Header, Row Header, Row Actions, Fixed Rows", function(assert) {
		initRowActions(oTable, 1, 1);
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();

		this.testArrowKeys(assert);
	});

	QUnit.test("Multi Header", function(assert) {
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b1"}));
		oTable.getColumns()[1].setHeaderSpan([2, 1]);
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "b2"}));
		oTable.getColumns()[3].addMultiLabel(new sap.ui.table.test.TestControl({text: "d"}));
		oTable.getColumns()[3].addMultiLabel(new sap.ui.table.test.TestControl({text: "d1"}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable(assert, "Focus1");
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

	QUnit.test("Multi Header, Row Actions", function(assert) {
		initRowActions(oTable, 1, 1);
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b1"}));
		oTable.getColumns()[1].setHeaderSpan([2, 1]);
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "b2"}));
		oTable.getColumns()[3].addMultiLabel(new sap.ui.table.test.TestControl({text: "d"}));
		oTable.getColumns()[3].addMultiLabel(new sap.ui.table.test.TestControl({text: "d1"}));
		sap.ui.getCore().applyChanges();

		var oElem = checkFocus(getColumnHeader(iNumberOfCols - 1, true), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
		checkFocus(oElem, assert);
		oElem = jQuery.sap.domById(getColumnHeader(iNumberOfCols - 1).attr("id") + "_1");
		oElem.focus();
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
		checkFocus(oElem, assert);

		oElem = checkFocus(getRowAction(0, true), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
		checkFocus(oElem, assert);
	});

	QUnit.test("On a non-interactive element inside a cell", function(assert) {
		var oNonInteractiveElement = oTable.getRows()[1].getCells()[1].getDomRef();
		oNonInteractiveElement.tabIndex = -1; // Make it non-interactive.

		oNonInteractiveElement.focus();
		checkFocus(oNonInteractiveElement, assert);

		qutils.triggerKeydown(oNonInteractiveElement, Key.Arrow.UP, false, false, false);
		checkFocus(getCell(1, 1), assert);

		oNonInteractiveElement.focus();
		checkFocus(oNonInteractiveElement, assert);

		qutils.triggerKeydown(oNonInteractiveElement, Key.Arrow.DOWN, false, false, false);
		checkFocus(getCell(1, 1), assert);
	});

	QUnit.module("TableKeyboardDelegate2 - Navigation > Shift+Arrow Keys", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Inside Header (Range Selection, Column Resizing)", function(assert) {
		var oElem;

		function testLocal() {
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
		testLocal();
		qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false); // End selection mode.

		oElem = checkFocus(getColumnHeader(0, true), assert);
		qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.
		testLocal();
		qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false); // End selection mode.

		// Column Resizing
		oElem = checkFocus(getSelectAll(true), assert);
		testLocal();

		oElem = checkFocus(getColumnHeader(0, true), assert);
		testLocal();
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
		sap.ui.getCore().applyChanges();

		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);

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
			assert.equal(oRow.getIndex(), i, "Row index is: " + oRow.getIndex() + ", should be: " + i);
		}

		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
		oElem = checkFocus(getCell(iRowIndex, iColumnIndex), assert);
		assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index is: " + oRow.getIndex() + ", should be: " + (iNumberOfRows - 1));

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
			assert.equal(oRow.getIndex(), i, "Row index is: " + oRow.getIndex() + ", should be: " + i);
		}

		qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false); // End selection mode.

		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowSelector);

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

	QUnit.test("Inside Row Actions, Fixed Rows (Range Selection)", function(assert) {
		initRowActions(oTable, 1, 1);
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();

		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);

		var i, iRowIndex, oRow;
		var iVisibleRowCount = oTable.getVisibleRowCount();
		var iFixedTopRowCount = oTable.getFixedRowCount();
		var iFixedBottomRowCount = oTable.getFixedBottomRowCount();

		var oElem = checkFocus(getRowAction(0, true), assert);
		qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.

		qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		checkFocus(oElem, assert);

		// First Row -> Last Row
		for (i = 1; i < iNumberOfRows; i++) {
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
			iRowIndex = i;
			if (i >= iVisibleRowCount - iFixedBottomRowCount && i < iNumberOfRows - iFixedBottomRowCount) {
				iRowIndex = iVisibleRowCount - iFixedBottomRowCount - 1;
			} else if (i >= iNumberOfRows - iFixedBottomRowCount) {
				iRowIndex = i - (iNumberOfRows - iVisibleRowCount);
			}
			oRow = oTable.getRows()[iRowIndex];
			oElem = checkFocus(getRowAction(iRowIndex), assert);
			assert.equal(oRow.getIndex(), i, "Row index is: " + oRow.getIndex() + ", should be: " + i);
		}

		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		oElem = checkFocus(getRowAction(iRowIndex), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
		oElem = checkFocus(getRowAction(iRowIndex), assert);
		assert.equal(oRow.getIndex(), iNumberOfRows - 1, "Row index is: " + oRow.getIndex() + ", should be: " + (iNumberOfRows - 1));

		// Last Row -> First Row
		for (i = iNumberOfRows - 2; i > 0; i--) {
			qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
			iRowIndex = i;
			if (i >= iFixedTopRowCount && i < iNumberOfRows - iVisibleRowCount + iFixedTopRowCount + 1) {
				iRowIndex = iFixedTopRowCount;
			} else if (i >= iNumberOfRows - iVisibleRowCount + iFixedTopRowCount + 1) {
				iRowIndex = i - (iNumberOfRows - iVisibleRowCount);
			}
			oRow = oTable.getRows()[iRowIndex];
			oElem = checkFocus(getRowAction(iRowIndex), assert);
			assert.equal(oRow.getIndex(), i, "Row index is: " + oRow.getIndex() + ", should be: " + i);
		}

		qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false); // End selection mode.

		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowSelector);

		oElem = checkFocus(getRowAction(1, true), assert);
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

		oElem = checkFocus(getRowAction(1, true), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		checkFocus(oElem, assert);

		oTable.setSelectionMode(sap.ui.table.SelectionMode.None);

		oElem = checkFocus(getRowAction(1, true), assert);
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

		var oElem = checkFocus(getRowHeader(0, true), assert);
		qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		oElem = checkFocus(getCell(0, 0), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		checkFocus(getRowHeader(0), assert);
	});

	QUnit.test("Move between Row Actions and Row (Range Selection)", function(assert) {
		initRowActions(oTable, 1, 1);
		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);

		var oElem = checkFocus(getRowAction(0, true), assert);
		qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		checkFocus(getRowAction(0), assert);
	});

	QUnit.module("TableKeyboardDelegate2 - Navigation > Home & End", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Default Test Table", function(assert) {
		var oInput = new sap.ui.table.test.TestInputControl({tabbable: true});
		var iPreventDefaultCount = 0;

		oTable.setFixedColumnCount(0);
		oTable.addExtension(oInput);
		oTable.addEventDelegate({
			onsaphome: function(oEvent) {
				if (oEvent.isDefaultPrevented()) {
					iPreventDefaultCount++;
				}
			},
			onsapend: function(oEvent) {
				if (oEvent.isDefaultPrevented()) {
					iPreventDefaultCount++;
				}
			}
		});
		sap.ui.getCore().applyChanges();

		/* Test on element outside the grid */

		oInput.focus();
		var oElem = checkFocus(oInput.getDomRef(), assert);

		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(oElem, assert);
		assert.ok(iPreventDefaultCount === 0, "Event default not prevented");

		iPreventDefaultCount = 0;
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		checkFocus(oElem, assert);
		assert.ok(iPreventDefaultCount === 0, "Event default not prevented");

		oInput.focus();
		oElem = checkFocus(oInput.getDomRef(), assert);

		iPreventDefaultCount = 0;
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(oElem, assert);
		assert.ok(iPreventDefaultCount === 0, "Event default not prevented");

		iPreventDefaultCount = 0;
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		checkFocus(oElem, assert);
		assert.ok(iPreventDefaultCount === 0, "Event default not prevented");

		/* Test on column header */

		// First cell
		oElem = checkFocus(getColumnHeader(0, true), assert);

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(getSelectAll(), assert);
		assert.ok(iPreventDefaultCount === 1, "Event default prevented");

		// *HOME* -> SelectAll
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		checkFocus(getSelectAll(), assert);
		assert.ok(iPreventDefaultCount === 2, "Event default prevented");

		// *END* -> First cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		assert.ok(iPreventDefaultCount === 3, "Event default prevented");

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);
		assert.ok(iPreventDefaultCount === 4, "Event default prevented");

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);
		assert.ok(iPreventDefaultCount === 5, "Event default prevented");

		// *HOME* -> First cell
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		checkFocus(getColumnHeader(0), assert);
		assert.ok(iPreventDefaultCount === 6, "Event default prevented");

		/* Test on first content row */

		iPreventDefaultCount = 0;

		// First cell
		oElem = checkFocus(getCell(0, 0, true), assert);

		// *HOME* -> Selection cell
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);
		assert.ok(iPreventDefaultCount === 1, "Event default prevented");

		// *HOME* -> Selection cell
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		checkFocus(getRowHeader(0), assert);
		assert.ok(iPreventDefaultCount === 2, "Event default prevented");

		// *END* -> First cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);
		assert.ok(iPreventDefaultCount === 3, "Event default prevented");

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);
		assert.ok(iPreventDefaultCount === 4, "Event default prevented");

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);
		assert.ok(iPreventDefaultCount === 5, "Event default prevented");

		// *HOME* -> First cell
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		checkFocus(getCell(0, 0), assert);
		assert.ok(iPreventDefaultCount === 6, "Event default prevented");

		/* Test on row actions */

		initRowActions(oTable, 2, 2);
		iPreventDefaultCount = 0;

		// Row Action
		oElem = checkFocus(getRowAction(0, true), assert);

		// *END* -> Row Action
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getRowAction(0), assert);
		assert.ok(iPreventDefaultCount === 1, "Event default prevented");

		// *HOME* -> First cell
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);
		assert.ok(iPreventDefaultCount === 2, "Event default prevented");

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);
		assert.ok(iPreventDefaultCount === 3, "Event default prevented");

		// *END* -> Row Action
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		checkFocus(getRowAction(0), assert);
		assert.ok(iPreventDefaultCount === 4, "Event default prevented");
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

		/* Test on row actions */

		initRowActions(oTable, 2, 2);

		// Row Action
		oElem = checkFocus(getRowAction(0, true), assert);

		// *END* -> Row Action
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getRowAction(0), assert);

		// *HOME* -> Non-Fixed area - First cell
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(getCell(0, 1), assert);

		// *HOME* -> Fixed area - Single cell
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *END* -> Row Action
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		checkFocus(getRowAction(0), assert);

		/* Test with row actions on header */

		// First Non-Fixed area - First Column Header
		oElem = checkFocus(getColumnHeader(1, true), assert);

		// *END* -> Non-Fixed area - Last Column Header
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *HOME* -> Non-Fixed area - First Column Header
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(getColumnHeader(1), assert);

		// *HOME* -> Fixed area - Single Column Header
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);

		//Cleanup
		initRowActions(oTable, 0, 0);

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

		/* Test on row actions */

		initRowActions(oTable, 2, 2);

		// Row Action
		oElem = checkFocus(getRowAction(0, true), assert);

		// *END* -> Row Action
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getRowAction(0), assert);

		// *HOME* -> Non-Fixed area - First cell
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(getCell(0, 2), assert);

		// *HOME* -> Fixed area - First cell
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		oElem = checkFocus(getCell(0, 0), assert);

		// *END* -> Fixed area - Last cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getCell(0, 1), assert);

		// *END* -> Non-Fixed area - Last cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *END* -> Row Action
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		checkFocus(getRowAction(0), assert);

		//Cleanup
		initRowActions(oTable, 0, 0);

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

		/* Test on row actions */

		initRowActions(oTable, 2, 2);

		// Row Action
		oElem = checkFocus(getRowAction(0, true), assert);

		// *END* -> Row Action
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getRowAction(0), assert);

		// *HOME* -> First cell
		qutils.triggerKeydown(oElem, Key.HOME, false, false, false);
		checkFocus(getCell(0, 0), assert);

		// *END* -> Last cell
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *END* -> Row Action
		qutils.triggerKeydown(oElem, Key.END, false, false, false);
		checkFocus(getRowAction(0), assert);
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
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b1"}));
		oTable.getColumns()[1].setHeaderSpan([iColSpan, 1]);
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "b2"}));
		oTable.getColumns()[3].addMultiLabel(new sap.ui.table.test.TestControl({text: "d"}));
		oTable.getColumns()[3].addMultiLabel(new sap.ui.table.test.TestControl({text: "d1"}));
		oTable.getColumns()[3].setHeaderSpan([iColSpan, 1]);
		oTable.getColumns()[4].addMultiLabel(new sap.ui.table.test.TestControl({text: "d"}));
		oTable.getColumns()[4].addMultiLabel(new sap.ui.table.test.TestControl({text: "d2"}));
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
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
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

		/* Test on row actions */

		initRowActions(oTable, 2, 2);

		// First Row Action
		oElem = checkFocus(getRowAction(0, true), assert);

		// *HOME* -> First Row Action
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getRowAction(0), assert);

		// *END* -> Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		oElem = checkFocus(getRowAction(oTable.getVisibleRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *END* -> Last row
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		checkFocus(getRowAction(oTable.getVisibleRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> First Row Action
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getRowAction(0), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

		// Last row
		oElem = checkFocus(getRowAction(oTable.getVisibleRowCount() - 1, true), assert);

		// *END* -> Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		checkFocus(getRowAction(oTable.getVisibleRowCount() - 1), assert);
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
		assert.equal(oTable.getRows()[oTable._getTotalRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

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
		assert.equal(oTable.getRows()[oTable._getTotalRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

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
		assert.equal(oTable.getRows()[oTable._getTotalRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> First row
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getCell(0, 0), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

		/* Test on row actions */

		initRowActions(oTable, 2, 2);

		// First Row Action
		oElem = checkFocus(getRowAction(0, true), assert);

		// *END* -> Last row
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		oElem = checkFocus(getRowAction(iNonEmptyVisibleRowCount - 1), assert);
		assert.equal(oTable.getRows()[oTable._getTotalRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *END* -> Last row
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		checkFocus(getRowAction(iNonEmptyVisibleRowCount - 1), assert);
		assert.equal(oTable.getRows()[iNonEmptyVisibleRowCount - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> First Row Action
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getRowAction(0), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");

		// Empty area - Last row
		oElem = checkFocus(getRowAction(oTable.getVisibleRowCount() - 1, true), assert);
		assert.equal(oTable.getRows()[oTable._getTotalRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> First row
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getRowAction(0, 0), assert);
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
		assert.equal(oTable.getRows()[oTable._getTotalRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

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
		assert.equal(oTable.getRows()[oTable._getTotalRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> Scrollable area - First row
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getCell(oTable.getFixedRowCount(), 0), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

		/* Test on row actions */

		initRowActions(oTable, 2, 2);

		// First Row Action
		oElem = checkFocus(getRowAction(0, true), assert);

		// *END* -> Scrollable area - Last row
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		oElem = checkFocus(getRowAction(iNonEmptyVisibleRowCount - oTable.getFixedBottomRowCount() - 1), assert);
		assert.equal(oTable.getRows()[iNonEmptyVisibleRowCount - oTable.getFixedBottomRowCount() - 1].getIndex(),
			iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Row index correct");

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		oElem = checkFocus(getRowAction(iNonEmptyVisibleRowCount - 1), assert);

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		checkFocus(getRowAction(iNonEmptyVisibleRowCount - 1), assert);

		// *HOME* -> Scrollable area - First row
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		oElem = checkFocus(getRowAction(oTable.getFixedRowCount()), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

		// *HOME* -> Top fixed area - First row
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		oElem = checkFocus(getRowAction(0), assert);

		// *HOME* -> First Row Action
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getRowAction(0), assert);

		// Empty area - Last row
		oElem = checkFocus(getRowAction(oTable.getVisibleRowCount() - 1, true), assert);
		assert.equal(oTable.getRows()[oTable._getTotalRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> Scrollable area - First row
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getRowAction(oTable.getFixedRowCount()), assert);
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

		/* Test on row actions */

		initRowActions(oTable, 2, 2);

		// First Row Action
		oElem = checkFocus(getRowAction(0, true), assert);

		// *HOME* -> First row
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getRowAction(0), assert);

		// *END* -> Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		oElem = checkFocus(getRowAction(oTable.getVisibleRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *END* -> Last row
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		checkFocus(getRowAction(oTable.getVisibleRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - 1].getIndex(), iNumberOfRows - 1, "Row index correct");

		// *HOME* -> First row (scrolled to top)
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getRowAction(0), assert);
		assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index correct");
	});

	QUnit.test("Multi Header and Fixed Top/Bottom Rows", function(assert) {
		oTable.setFixedColumnCount(0);
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_1_1"}));
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_2_1"}));
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_3_1"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_1_1"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_2_1"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_2_2"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_1_1"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_3_2"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_3_3"}));
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

		/* Test on row actions */

		initRowActions(oTable, 2, 2);

		// First Row Action
		oElem = checkFocus(getRowAction(0, true), assert);

		// *HOME* -> First Row Action
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		oElem = checkFocus(getRowAction(0), assert);

		// *END* -> Scrollable area - Last row (scrolled to bottom)
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		oElem = checkFocus(getRowAction(oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1), assert);
		assert.equal(oTable.getRows()[oTable.getVisibleRowCount() - oTable.getFixedBottomRowCount() - 1].getIndex(),
			iNumberOfRows - oTable.getFixedBottomRowCount() - 1, "Row index correct");

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		oElem = checkFocus(getRowAction(oTable.getVisibleRowCount() - 1), assert);

		// *ARROW_UP* -> Bottom fixed area - Second-last row
		qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
		oElem = checkFocus(getRowAction(oTable.getVisibleRowCount() - 2), assert);

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		oElem = checkFocus(getRowAction(oTable.getVisibleRowCount() - 1), assert);

		// *END* -> Bottom fixed area - Last row
		qutils.triggerKeydown(oElem, Key.END, false, false, true);
		checkFocus(getRowAction(oTable.getVisibleRowCount() - 1), assert);

		// *HOME* -> Scrollable area - First row (scrolled to top)
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		oElem = checkFocus(getRowAction(oTable.getFixedRowCount()), assert);
		assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Row index correct");

		// *HOME* -> Top fixed area - First row (First Row Action)
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		oElem = checkFocus(getRowAction(0), assert);

		// *HOME* -> First Row Action
		qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
		checkFocus(getRowAction(0), assert);
	});

	QUnit.module("TableKeyboardDelegate2 - Navigation > Page Up & Page Down", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		},

		/**
		 * Navigates down and back up using the PageUp and PageDown keys, including scrolling, in the row header column, and in the first data column.
		 * Start from the top cell -> to the bottom cell -> to the top cell.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @private
		 */
		testPageKeys: function(assert) {
			var iNonEmptyVisibleRowCount = TableUtils.getNonEmptyVisibleRowCount(oTable);
			var iPageSize = iNonEmptyVisibleRowCount - oTable.getFixedRowCount() - oTable.getFixedBottomRowCount();
			var iLastScrollableRowIndex = iNonEmptyVisibleRowCount - oTable.getFixedBottomRowCount() - 1;
			var iHeaderRowCount = TableUtils.getHeaderRowCount(oTable);
			var i;

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
			for (i = iLastScrollableRowIndex + iPageSize; i < iNumberOfRows - oTable.getFixedBottomRowCount(); i += iPageSize) {
				qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
				checkFocus(getRowHeader(iLastScrollableRowIndex), assert);
				assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), i, "Scrolled down: Row index correct");
			}

			// *PAGE_DOWN* -> Last row - Scrolled down the remaining rows
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
			oElem = checkFocus(getRowHeader(iNonEmptyVisibleRowCount - 1), assert);
			assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), iNumberOfRows - oTable.getFixedBottomRowCount() - 1,
				"Scrolled to bottom: Row index correct");

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
			for (i = iNumberOfRows - oTable.getFixedBottomRowCount() - iPageSize; i >= oTable.getFixedRowCount() + iPageSize; i -= iPageSize) {
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

			if (oTable._getTotalRowCount() < oTable.getVisibleRowCount()) {
				// Empty area - Last row
				oElem = checkFocus(getRowHeader(oTable.getVisibleRowCount() - 1, true), assert);

				// *PAGE_UP* -> Scrollable area - Last row
				qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
				checkFocus(getRowHeader(oTable._getTotalRowCount() - 1, 0), assert);
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
			for (i = iLastScrollableRowIndex + iPageSize; i < iNumberOfRows - oTable.getFixedBottomRowCount(); i += iPageSize) {
				qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
				checkFocus(getCell(iLastScrollableRowIndex, 0), assert);
				assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), i, "Scrolled down: Row index correct");
			}

			// *PAGE_DOWN* -> Last row - Scrolled down the remaining rows
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
			oElem = checkFocus(getCell(iNonEmptyVisibleRowCount - 1, 0), assert);
			assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), iNumberOfRows - oTable.getFixedBottomRowCount() - 1,
				"Scrolled to bottom: Row index correct");

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
			for (i = iNumberOfRows - oTable.getFixedBottomRowCount() - iPageSize; i >= oTable.getFixedRowCount() + iPageSize; i -= iPageSize) {
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

			if (oTable._getTotalRowCount() < oTable.getVisibleRowCount()) {
				// Empty area -> Last row
				oElem = checkFocus(getCell(oTable.getVisibleRowCount() - 1, 0, true), assert);

				// *PAGE_UP* -> Scrollable area - Last row
				qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
				checkFocus(getCell(oTable._getTotalRowCount() - 1, 0), assert);
			}

			/* Test on row actions */

			initRowActions(oTable, 2, 2);

			// First Row Action
			oElem = checkFocus(getRowAction(0, true), assert);

			// *PAGE_UP* -> First Row Action
			qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
			checkFocus(getRowAction(0), assert);

			// *PAGE_DOWN* -> Scrollable area - Last row
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
			oElem = checkFocus(getRowAction(iLastScrollableRowIndex), assert);

			// *PAGE_DOWN* -> Scrollable area - Last row - Scroll down all full pages
			for (i = iLastScrollableRowIndex + iPageSize; i < iNumberOfRows - oTable.getFixedBottomRowCount(); i += iPageSize) {
				qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
				checkFocus(getRowAction(iLastScrollableRowIndex), assert);
				assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), i, "Scrolled down: Row index correct");
			}

			// *PAGE_DOWN* -> Last row - Scrolled down the remaining rows
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
			oElem = checkFocus(getRowAction(iNonEmptyVisibleRowCount - 1), assert);
			assert.equal(oTable.getRows()[iLastScrollableRowIndex].getIndex(), iNumberOfRows - oTable.getFixedBottomRowCount() - 1,
				"Scrolled to bottom: Row index correct");

			// *PAGE_DOWN* -> Last row
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
			checkFocus(getRowAction(iNonEmptyVisibleRowCount - 1), assert);

			if (oTable.getFixedBottomRowCount() > 1) {
				// *ARROW_UP* -> Bottom fixed area - Second-last row
				qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
				oElem = checkFocus(getRowAction(iNonEmptyVisibleRowCount - 2), assert);

				// *PAGE_DOWN* -> Bottom fixed area - Last row
				qutils.triggerKeydown(oElem, Key.Page.DOWN, false, false, false);
				oElem = checkFocus(getRowAction(iNonEmptyVisibleRowCount - 1), assert);
			}

			// *PAGE_UP* -> Scrollable area - First row
			qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
			oElem = checkFocus(getRowAction(oTable.getFixedRowCount()), assert);

			// *PAGE_UP* -> Scrollable area - First row - Scroll up all full pages
			for (i = iNumberOfRows - oTable.getFixedBottomRowCount() - iPageSize; i >= oTable.getFixedRowCount() + iPageSize; i -= iPageSize) {
				qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
				checkFocus(getRowAction(oTable.getFixedRowCount()), assert);
				assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), i - iPageSize, "Scrolled up: Row index correct");
			}

			if (oTable.getFixedRowCount() > 0) {
				// *PAGE_UP* -> Top fixed area - First row - Scrolled up the remaining rows
				qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
				oElem = checkFocus(getRowAction(0), assert);
				assert.equal(oTable.getRows()[oTable.getFixedRowCount()].getIndex(), oTable.getFixedRowCount(), "Scrolled to top: Row index correct");
			}

			if (oTable.getFixedRowCount() > 1) {
				// *ARROW_DOWN* -> Top fixed area - Second row
				qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
				oElem = checkFocus(getRowAction(1), assert);

				// *PAGE_UP* -> Top fixed area - First row
				qutils.triggerKeydown(oElem, Key.Page.UP, false, false, false);
				checkFocus(getRowAction(0), assert);
			}
		}
	});

	QUnit.test("Default Test Table", function(assert) {
		this.testPageKeys(assert);
	});

	QUnit.test("Less data rows than visible rows", function(assert) {
		oTable.setVisibleRowCount(10);
		sap.ui.getCore().applyChanges();

		this.testPageKeys(assert);
	});

	QUnit.test("Multi Header", function(assert) {
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b1"}));
		oTable.getColumns()[1].setHeaderSpan([2, 1]);
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "b2"}));
		oTable.getColumns()[3].addMultiLabel(new sap.ui.table.test.TestControl({text: "d"}));
		oTable.getColumns()[3].addMultiLabel(new sap.ui.table.test.TestControl({text: "d1"}));
		sap.ui.getCore().applyChanges();

		this.testPageKeys(assert);
	});

	QUnit.test("Fixed Top/Bottom Rows", function(assert) {
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();

		this.testPageKeys(assert);
	});

	QUnit.test("Less data rows than visible rows and Fixed Top/Bottom Rows", function(assert) {
		oTable.setVisibleRowCount(10);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();

		this.testPageKeys(assert);
	});

	QUnit.test("Multi Header and Fixed Top/Bottom Rows", function(assert) {
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "b1"}));
		oTable.getColumns()[1].setHeaderSpan([2, 1]);
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "b"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "b2"}));
		oTable.getColumns()[3].addMultiLabel(new sap.ui.table.test.TestControl({text: "d"}));
		oTable.getColumns()[3].addMultiLabel(new sap.ui.table.test.TestControl({text: "d1"}));
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();

		this.testPageKeys(assert);
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
					template: new sap.ui.table.test.TestControl({
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
		var i;

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
		for (i = 0; i < iNumberOfCols - 1; i += 5) {
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
			oElem = checkFocus(getColumnHeader(Math.min(i + 5, iNumberOfCols - 1)), assert);
		}

		// *PAGE_DOWN* -> Last cell
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *PAGE_UP* -> Scroll left to the first cell
		for (i = iNumberOfCols - 1; i >= 0; i -= 5) {
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
		for (i = 0; i < iNumberOfCols - 1; i += 5) {
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
			oElem = checkFocus(getCell(0, Math.min(i + 5, iNumberOfCols - 1)), assert);
		}

		// *PAGE_DOWN* -> Last cell
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *PAGE_UP* -> Scroll left to the first cell
		for (i = iNumberOfCols - 1; i >= 0; i -= 5) {
			qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
			oElem = checkFocus(getCell(0, Math.max(i - 5, 0)), assert);
		}

		// *PAGE_UP* -> Selection cell
		qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
		checkFocus(getRowHeader(0), assert);
	});

	QUnit.test("Row Actions", function(assert) {
		initRowActions(oTable, 2, 2);

		var i;

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
		for (i = 0; i < iNumberOfCols - 1; i += 5) {
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
			oElem = checkFocus(getColumnHeader(Math.min(i + 5, iNumberOfCols - 1)), assert);
		}

		// *PAGE_DOWN* -> Last cell
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		/* Test on first content row */

		// Selection cell
		oElem = checkFocus(getRowHeader(0, true), assert);

		// *PAGE_DOWN* -> First cell
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		oElem = checkFocus(getCell(0, 0), assert);

		// *PAGE_DOWN* -> Scroll right to the last cell
		for (i = 0; i < iNumberOfCols - 1; i += 5) {
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
			oElem = checkFocus(getCell(0, Math.min(i + 5, iNumberOfCols - 1)), assert);
		}

		// *PAGE_DOWN* -> Row Action Cell
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		oElem = checkFocus(getRowAction(0), assert);

		// *PAGE_DOWN* -> Row Action Cell
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		checkFocus(getRowAction(0), assert);

		// *PAGE_UP* -> last cell
		qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *PAGE_UP* -> Scroll left to the first cell
		for (i = iNumberOfCols - 1; i >= 0; i -= 5) {
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

		var i;

		/* Test column header */

		// First cell
		var oElem = checkFocus(getColumnHeader(0, true), assert);

		// *PAGE_UP* -> First cell
		qutils.triggerKeydown(oElem, Key.Page.UP, false, true, false);
		checkFocus(getColumnHeader(0), assert);

		// *PAGE_DOWN* -> Scroll right to the last cell
		for (i = 0; i < iNumberOfCols - 1; i += 5) {
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
			oElem = checkFocus(getColumnHeader(Math.min(i + 5, iNumberOfCols - 1)), assert);
		}

		// *PAGE_DOWN* -> Last cell
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		checkFocus(getColumnHeader(iNumberOfCols - 1), assert);

		// *PAGE_UP* -> Scroll left to the first cell
		for (i = iNumberOfCols - 1; i >= 0; i -= 5) {
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
		for (i = 0; i < iNumberOfCols - 1; i += 5) {
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
			oElem = checkFocus(getCell(0, Math.min(i + 5, iNumberOfCols - 1)), assert);
		}

		// *PAGE_DOWN* -> Last cell
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		oElem = checkFocus(getCell(0, iNumberOfCols - 1), assert);

		// *PAGE_UP* -> Scroll left to the first cell
		for (i = iNumberOfCols - 1; i >= 0; i -= 5) {
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

		var i;

		// First cell (3-span column)
		var oElem = checkFocus(getColumnHeader(0, true), assert);

		// *PAGE_DOWN* -> Second cell (8-span column)
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		oElem = checkFocus(getColumnHeader(1), assert);

		// *PAGE_DOWN* -> 3rd cell
		qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
		oElem = checkFocus(getColumnHeader(9), assert);

		// *PAGE_DOWN* -> Scroll right to the last cell
		for (i = 9; i < iNumberOfCols - 2; i += 5) {
			qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true, false);
			oElem = checkFocus(getColumnHeader(Math.min(i + 5, iNumberOfCols - 2), 0), assert);
		}

		// *PAGE_UP* -> Scroll left to the 3rd cell
		for (i = iNumberOfCols - 2; i > 10; i -= 5) {
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

	QUnit.module("TableKeyboardDelegate2 - Navigation > F6 & Shift+F6", {
		beforeEach: function() {
			setupTest();

			// Enhance the Navigation Handler to use the test scope only (not the QUnit related DOM)
			jQuery.sap.handleF6GroupNavigationOriginal = jQuery.sap.handleF6GroupNavigation;
			jQuery.sap.handleF6GroupNavigation = F6Navigation.handleF6GroupNavigation = function(oEvent, oSettings) {
				oSettings = oSettings ? oSettings : {};
				if (!oSettings.scope) {
					oSettings.scope = jQuery.sap.domById("qunit-fixture");
				}
				jQuery.sap.handleF6GroupNavigationOriginal(oEvent, oSettings);
			};
		},
		afterEach: function() {
			teardownTest();

			jQuery.sap.handleF6GroupNavigation = F6Navigation.handleF6GroupNavigation = jQuery.sap.handleF6GroupNavigationOriginal;
			jQuery.sap.handleF6GroupNavigationOriginal = null;
		}
	});

	QUnit.test("F6 - Forward navigation - With Extension and Footer", function(assert) {
		oTable.addExtension(new sap.ui.table.test.TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new sap.ui.table.test.TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable(assert, "Focus1");
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

	QUnit.test("Shift+F6 - Backward navigation - With Extension and Footer", function(assert) {
		oTable.addExtension(new sap.ui.table.test.TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new sap.ui.table.test.TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable(assert, "Focus2");
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
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Tab - Default Test Table", function(assert) {
		oTable.setShowOverlay(true);

		var oElem = setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Focus2"), assert);
	});

	QUnit.test("Tab - With Extension and Footer", function(assert) {
		oTable.setShowOverlay(true);
		oTable.addExtension(new sap.ui.table.test.TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new sap.ui.table.test.TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Focus2"), assert);
	});

	QUnit.test("Shift+Tab - Default", function(assert) {
		oTable.setShowOverlay(true);

		var oElem = setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(jQuery.sap.domById("Focus1"), assert);
	});

	QUnit.test("Shift+Tab - With Extension and Footer", function(assert) {
		oTable.setShowOverlay(true);
		oTable.addExtension(new sap.ui.table.test.TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new sap.ui.table.test.TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();

		var oElem = setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(jQuery.sap.domById("Focus1"), assert);
	});

	QUnit.module("TableKeyboardDelegate2 - Navigation > NoData", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Tab - Default Test Table", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable(assert, "Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(jQuery.sap.domById("Focus2"), assert);

			done();
		}

		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.test("Tab - Without Column Header", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable(assert, "Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(jQuery.sap.domById("Focus2"), assert);

			done();
		}

		oTable.setColumnHeaderVisible(false);
		sap.ui.getCore().applyChanges();
		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.test("Tab - With Extension and Footer", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable(assert, "Focus1");
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

			done();
		}

		oTable.addExtension(new sap.ui.table.test.TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new sap.ui.table.test.TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();
		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.test("Shift+Tab", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable(assert, "Focus2");
			simulateTabEvent(oElem, true);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, true);
			oElem = checkFocus(getColumnHeader(0), assert);
			simulateTabEvent(oElem, true);
			checkFocus(jQuery.sap.domById("Focus1"), assert);

			done();
		}

		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.test("Shift+Tab - With Extension and Footer", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable(assert, "Focus2");
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

			done();
		}

		oTable.addExtension(new sap.ui.table.test.TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new sap.ui.table.test.TestControl("Footer", {text: "Footer", tabbable: true}));
		sap.ui.getCore().applyChanges();
		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.test("No Vertical Navigation (Header <-> Content)", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable(assert, "Focus1");
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

			done();
		}

		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.module("TableKeyboardDelegate2 - Navigation > NoData & Overlay", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("No Navigation", function(assert) {
		var done = assert.async();

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

				sId = sId === "noDataCnt" ? "overlay" : null;
				oTable.setShowOverlay(true);
			}

			done();
		}

		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.test("Tab", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable(assert, "Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("overlay"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(jQuery.sap.domById("Focus2"), assert);

			done();
		}

		oTable.setShowOverlay(true);
		oTable.attachEvent("_rowsUpdated", doAfterNoDataDisplayed);
		oTable.setModel(new sap.ui.model.json.JSONModel());
	});

	QUnit.test("Shift+Tab", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachEvent("_rowsUpdated", doAfterNoDataDisplayed);

			var oElem = setFocusOutsideOfTable(assert, "Focus2");
			simulateTabEvent(oElem, true);
			oElem = checkFocus(oTable.getDomRef("overlay"), assert);
			simulateTabEvent(oElem, true);
			checkFocus(jQuery.sap.domById("Focus1"), assert);

			done();
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
		var oElem = setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		// Due to changed BusyIndicator handling - BusyIndicator is now tabbable
		oElem = jQuery.sap.domById(oTable.getId() + "-busyIndicator");
		checkFocus(oElem, assert);
		simulateTabEvent(oElem, false);
		checkFocus(jQuery.sap.domById("Focus2"), assert);
	});

	QUnit.test("Shift+Tab", function(assert) {
		var oElem = setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		// Due to changed BusyIndicator handling - BusyIndicator is now tabbable
		oElem = jQuery.sap.domById(oTable.getId() + "-busyIndicator");
		checkFocus(oElem, assert);
		simulateTabEvent(oElem, true);
		checkFocus(jQuery.sap.domById("Focus1"), assert);
	});

	QUnit.module("TableKeyboardDelegate2 - Navigation > Special Cases", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Focus on cell content - Home & End & Arrow Keys", function(assert) {
		var oElem = findTabbables(getCell(0, 0).get(0), [getCell(0, 0).get(0)], true);
		oElem.focus();

		// If the focus is on an element inside the cell,
		// the focus should not be changed when pressing one of the following keys.
		var aKeys = [Key.HOME, Key.END, Key.Arrow.LEFT, Key.Arrow.RIGHT];

		checkFocus(oElem, assert);
		for (var i = 0; i < aKeys.length; i++) {
			qutils.triggerKeydown(oElem, aKeys[i], false, false, false);
			checkFocus(oElem, assert);
		}
	});

	QUnit.test("Page scrolling", function(assert) {
		var aEventTargetGetters = [
			getCell.bind(window, 0, 0),
			getCell.bind(window, oTable.getVisibleRowCount() - 1, 0),
			getCell.bind(window, 2, 1),
			getColumnHeader.bind(window, 0)
		];
		var aKeystrokes = [
			{keyName: "Space (keydown)", trigger: qutils.triggerKeydown, arguments: [null, Key.SPACE, false, false, false]},
			{keyName: "ArrowUp", trigger: qutils.triggerKeydown, arguments: [null, Key.Arrow.UP, false, false, false]},
			{keyName: "ArrowDown", trigger: qutils.triggerKeydown, arguments: [null, Key.Arrow.DOWN, false, false, false]},
			{keyName: "ArrowLeft", trigger: qutils.triggerKeydown, arguments: [null, Key.Arrow.LEFT, false, false, false]},
			{keyName: "ArrowRight", trigger: qutils.triggerKeydown, arguments: [null, Key.Arrow.RIGHT, false, false, false]},
			{keyName: "Home", trigger: qutils.triggerKeydown, arguments: [null, Key.HOME, false, false, false]},
			{keyName: "End", trigger: qutils.triggerKeydown, arguments: [null, Key.END, false, false, false]},
			{keyName: "Ctrl+Home", trigger: qutils.triggerKeydown, arguments: [null, Key.HOME, false, false, true]},
			{keyName: "Ctrl+End", trigger: qutils.triggerKeydown, arguments: [null, Key.END, false, false, true]},
			{keyName: "PageUp", trigger: qutils.triggerKeydown, arguments: [null, Key.Page.UP, false, false, false]},
			{keyName: "PageDown", trigger: qutils.triggerKeydown, arguments: [null, Key.Page.DOWN, false, false, false]}
		];

		assert.expect(aEventTargetGetters.length + aEventTargetGetters.length * aKeystrokes.length);

		function assertDefaultPrevented(oEvent) {
			assert.ok(oEvent.isDefaultPrevented(), oEvent.target._oKeystroke.keyName + ": Default action was prevented (Page scrolling)");
		}

		oTable.addEventDelegate({
			onkeydown: assertDefaultPrevented,
			onkeyup: assertDefaultPrevented
		});

		for (var i = 0; i < aEventTargetGetters.length; i++) {
			oTable.setFirstVisibleRow(1);
			sap.ui.getCore().applyChanges();

			var oEventTarget = aEventTargetGetters[i]();
			oEventTarget.focus();
			checkFocus(oEventTarget, assert);

			for (var j = 0; j < aKeystrokes.length; j++) {
				var oKeystroke = aKeystrokes[j];
				var aArguments = oKeystroke.arguments;

				oEventTarget.focus();
				oEventTarget[0]._oKeystroke = oKeystroke;
				aArguments[0] = oEventTarget; // The first parameter is the event target.
				oKeystroke.trigger.apply(qutils, aArguments);
			}
		}
	});

	QUnit.module("TableKeyboardDelegate2 - Interaction > Shift+Up & Shift+Down (Range Selection)", {
		beforeEach: function() {
			setupTest();
			oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			teardownTest();
		},
		assertSelection: function(assert, iIndex, bSelected) {
			assert.equal(oTable.isIndexSelected(iIndex), bSelected, "Row " + (iIndex + 1) + ": " + (bSelected ? "" : "Not ") + "Selected");
		},
		getCellOrRowHeader: function(bRowHeader, iRowIndex, iColumnIndex, bFocus) {
			if (bRowHeader) {
				return getRowHeader(iRowIndex, bFocus);
			} else {
				return getCell(iRowIndex, iColumnIndex, bFocus);
			}
		},

		/**
		 * A test for range selection and deselection.
		 * Start from the middle of the table -> Move up to the top -> Move down to the bottom -> Move up to the starting row.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @private
		 */
		testRangeSelection: function(assert) {
			var iVisibleRowCount = oTable.getVisibleRowCount();
			var iStartIndex = Math.floor(iNumberOfRows / 2);
			var iIndex;
			var i;

			function testLocal(bSelect, bRowHeader) {
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
				for (i = iStartIndex - 1; i >= 0; i--) {
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
				for (i = 1; i <= iStartIndex; i++) {
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
				for (i = iStartIndex + 1; i < iNumberOfRows; i++) {
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
				for (i = iNumberOfRows - 2; i >= iStartIndex; i--) {
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
				for (i = iStartIndex + 1; i < iNumberOfRows; i++) {
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
				for (i = iNumberOfRows - 2; i >= iStartIndex; i--) {
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
				for (i = iStartIndex - 1; i >= 0; i--) {
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
				for (i = 1; i <= iStartIndex; i++) {
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

			testLocal.call(this, true, true);
			testLocal.call(this, true, false);
			testLocal.call(this, false, true);
			testLocal.call(this, false, false);
		}
	});

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
		this.testRangeSelection.call(this, assert);
	});

	QUnit.test("Fixed Rows - Reverse Range Selection", function(assert) {
		this.testRangeSelection.call(this, assert);
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
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Default Test Table - Resize fixed column", function(assert) {
		var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		var iColumnResizeStep = oTable._CSSSizeToPixel("1em");
		var i;

		var oElem = getColumnHeader(0, true);
		for (i = TableUtils.Column.getColumnWidth(oTable, 0); i - iColumnResizeStep > iMinColumnWidth; i -= iColumnResizeStep) {
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
			assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), i - iColumnResizeStep,
				"Column width decreased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 0) + "px");
		}

		var iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 0);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), iMinColumnWidth,
			"Column width decreased by " + (iColumnWidthBefore - TableUtils.Column.getColumnWidth(oTable, 0))
			+ "px to the minimum width of " + iMinColumnWidth + "px");
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), iMinColumnWidth,
			"Column width could not be decreased below the minimum of " + iMinColumnWidth + "px");

		for (i = 0; i < 10; i++) {
			iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 0);
			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
			assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), iColumnWidthBefore + iColumnResizeStep,
				"Column width increased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 0) + "px");
		}
	});

	QUnit.test("Default Test Table - Resize column", function(assert) {
		var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		var iColumnResizeStep = oTable._CSSSizeToPixel("1em");
		var i;

		var oElem = getColumnHeader(1, true);
		for (i = TableUtils.Column.getColumnWidth(oTable, 1); i - iColumnResizeStep > iMinColumnWidth; i -= iColumnResizeStep) {
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
			assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), i - iColumnResizeStep,
				"Column width decreased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 1) + "px");
		}

		var iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 1);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), iMinColumnWidth,
			"Column width decreased by " + (iColumnWidthBefore - TableUtils.Column.getColumnWidth(oTable, 1))
			+ "px to the minimum width of " + iMinColumnWidth + "px");
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), iMinColumnWidth,
			"Column width could not be decreased below the minimum of " + iMinColumnWidth + "px");

		for (i = 0; i < 10; i++) {
			iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 1);
			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
			assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), iColumnWidthBefore + iColumnResizeStep,
				"Column width increased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 1) + "px");
		}
	});

	QUnit.test("Multi Header - Resize spans", function(assert) {
		oTable.setFixedColumnCount(0);
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_1_1"}));
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_2_1"}));
		oTable.getColumns()[0].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_3_1"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_1_1"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_2_1"}));
		oTable.getColumns()[1].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_2_2"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_1_1"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_3_2"}));
		oTable.getColumns()[2].addMultiLabel(new sap.ui.table.test.TestControl({text: "a_3_3"}));
		oTable.getColumns()[0].setHeaderSpan([3, 2, 1]);
		sap.ui.getCore().applyChanges();

		var aVisibleColumns = oTable._getVisibleColumns();
		var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		var iColumnResizeStep = oTable._CSSSizeToPixel("1em");
		var oElem;

		function testLocal(aResizingColumns, aNotResizingColumns) {
			var iSharedColumnResizeStep = Math.round(iColumnResizeStep / aResizingColumns.length);
			var iMaxColumnSize = 0;
			var iNewColumnWidth;
			var i, j;

			var aOriginalNotResizingColumnWidths = [];
			for (i = 0; i < aNotResizingColumns.length; i++) {
				aOriginalNotResizingColumnWidths.push(TableUtils.Column.getColumnWidth(oTable, aNotResizingColumns[i].getIndex()));
			}

			for (i = 0; i < aResizingColumns.length; i++) {
				iMaxColumnSize = Math.max(iMaxColumnSize, TableUtils.Column.getColumnWidth(oTable, aResizingColumns[i].getIndex()));
			}

			// Decrease the size to the minimum.
			for (i = iMaxColumnSize; i - iSharedColumnResizeStep > iMinColumnWidth; i -= iSharedColumnResizeStep) {
				qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);

				// Check resizable columns.
				for (j = 0; j < aResizingColumns.length; j++) {
					iNewColumnWidth = TableUtils.Column.getColumnWidth(oTable, aResizingColumns[j].getIndex());
					assert.strictEqual(iNewColumnWidth, Math.max(iMinColumnWidth, i - iSharedColumnResizeStep),
						"Column " + (aResizingColumns[j].getIndex() + 1) + " width decreased by " + iSharedColumnResizeStep + "px to "
						+ iNewColumnWidth + "px"
					);
				}

				// Check not resizable columns.
				for (j = 0; j < aNotResizingColumns.length; j++) {
					assert.strictEqual(aOriginalNotResizingColumnWidths[j],
						TableUtils.Column.getColumnWidth(oTable, aNotResizingColumns[j].getIndex()),
						"Column " + (aNotResizingColumns[j].getIndex() + 1) + " width did not change"
					);
				}
			}

			// Ensure that all resizable columns widths were resized to the minimum.
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);

			// Check resizable columns for minimum width.
			for (i = 0; i < aResizingColumns.length; i++) {
				assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, aResizingColumns[i].getIndex()), iMinColumnWidth,
					"Column " + (aResizingColumns[i].getIndex() + 1) + " width decreased to the minimum width of " + iMinColumnWidth + "px");
			}

			// Check not resizable columns for unchanged width.
			for (i = 0; i < aNotResizingColumns.length; i++) {
				assert.strictEqual(aOriginalNotResizingColumnWidths[i], TableUtils.Column.getColumnWidth(oTable, aNotResizingColumns[i].getIndex()),
					"Column " + (aNotResizingColumns[i].getIndex() + 1) + " width did not change");
			}

			// Increase the size.
			for (i = 0; i < 10; i++) {
				var aOriginalColumnWidths = [];
				for (j = 0; j < aResizingColumns.length; j++) {
					aOriginalColumnWidths.push(TableUtils.Column.getColumnWidth(oTable, aResizingColumns[j].getIndex()));
				}

				qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);

				// Check resizable columns.
				for (j = 0; j < aResizingColumns.length; j++) {
					iNewColumnWidth = TableUtils.Column.getColumnWidth(oTable, aResizingColumns[j].getIndex());
					assert.strictEqual(iNewColumnWidth, aOriginalColumnWidths[j] + iSharedColumnResizeStep,
						"Column " + (aResizingColumns[j].getIndex() + 1) + " width increased by " + iSharedColumnResizeStep + "px to "
						+ iNewColumnWidth + "px"
					);
				}

				// Check not resizable columns.
				for (j = 0; j < aNotResizingColumns.length; j++) {
					assert.strictEqual(aOriginalNotResizingColumnWidths[j],
						TableUtils.Column.getColumnWidth(oTable, aNotResizingColumns[j].getIndex()),
						"Column " + (aNotResizingColumns[j].getIndex() + 1) + " width did not change"
					);
				}
			}
		}

		// Top row - Span over all 3 columns (3rd. column is not resizable)
		oElem = getColumnHeader(0, true);
		testLocal.call(this, [aVisibleColumns[0], aVisibleColumns[1]], [aVisibleColumns[2]]);

		// Second row - First span over 2 columns
		oElem = jQuery.sap.domById(getColumnHeader(0).attr("id") + "_1");
		oElem.focus();
		testLocal.call(this, [aVisibleColumns[0], aVisibleColumns[1]], aVisibleColumns[2]);

		// Last row - Second column
		oElem = jQuery.sap.domById(getColumnHeader(1).attr("id") + "_2");
		oElem.focus();
		testLocal.call(this, [aVisibleColumns[1]], [aVisibleColumns[0], aVisibleColumns[2]]);
	});

	QUnit.test("Default Test Table - Resize not resizable column", function(assert) {
		var iOriginalColumnWidth = TableUtils.Column.getColumnWidth(oTable, 2);

		var oElem = getColumnHeader(2, true);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
		assert.strictEqual(iOriginalColumnWidth, TableUtils.Column.getColumnWidth(oTable, 2),
			"Column width did not change (" + iOriginalColumnWidth + "px)");
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
		assert.strictEqual(iOriginalColumnWidth, TableUtils.Column.getColumnWidth(oTable, 2),
			"Column width did not change (" + iOriginalColumnWidth + "px)");
	});

	QUnit.module("TableKeyboardDelegate2 - Interaction > Ctrl+Left & Ctrl+Right (Column Reordering)", {
		beforeEach: function() {
			setupTest();
			oTable.setFixedColumnCount(0);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			teardownTest();
		}
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
	 * Opens a column header context menu and closes it by pressing the Escape key.
	 *
	 * @param {string} sKey The key to press.
	 * @param {boolean} bKeyDown Whether to trigger key down or key up.
	 * @param {boolean} bShift Whether to simulate a pressed shift key.
	 * @param {Object} assert QUnit assert object.
	 * @private
	 */
	function _testColumnHeaderContextMenus(sKey, bKeyDown, bShift, assert) {
		var oColumn = oTable.getColumns()[0];
		oColumn.setSortProperty("dummy");
		var oElem = checkFocus(getColumnHeader(0, true), assert);
		var oColumnMenu = oColumn.getMenu();

		assert.ok(!oColumnMenu.bOpen, "Menu is closed");
		if (bKeyDown) {
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
		afterEach: function() {
			teardownTest();
		},
		assertSelection: function(assert, iIndex, bSelected) {
			assert.equal(oTable.isIndexSelected(iIndex), bSelected, "Row " + (iIndex + 1) + ": " + (bSelected ? "" : "Not ") + "Selected");
		}
	});

	QUnit.test("On a Column Header", function(assert) {
		_testColumnHeaderContextMenus(Key.SPACE, false, false, assert);
		_testColumnHeaderContextMenus(Key.ENTER, false, false, assert);
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

		function testLocal(assert) {
			var oRowBinding = oTable.getBinding("rows");

			this.assertSelection(assert, 0, false);
			assert.ok(cellClickEventHandler.notCalled, "Click handler not called");
			assert.ok(oRowBinding.isExpanded(0), "Group is expanded");

			// Space
			qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
			checkFocus(oElem, assert);
			this.assertSelection(assert, 0, false);
			assert.ok(cellClickEventHandler.notCalled, 0, "Click handler not called");
			assert.ok(!oRowBinding.isExpanded(0), "Group is collapsed");
			qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
			checkFocus(oElem, assert);
			this.assertSelection(assert, 0, false);
			assert.ok(cellClickEventHandler.notCalled, 0, "Click handler not called");
			assert.ok(oRowBinding.isExpanded(0), "Group is expanded");

			// Enter
			qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
			checkFocus(oElem, assert);
			this.assertSelection(assert, 0, false);
			assert.ok(cellClickEventHandler.notCalled, 0, "Click handler not called");
			assert.ok(!oRowBinding.isExpanded(0), "Group is collapsed");
			qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
			checkFocus(oElem, assert);
			this.assertSelection(assert, 0, false);
			assert.ok(cellClickEventHandler.notCalled, 0, "Click handler not called");
			assert.ok(oRowBinding.isExpanded(0), "Group is expanded");
		}

		/* Row Header */
		oElem = checkFocus(getRowHeader(0, true), assert);
		testLocal.call(this, assert);

		/* Data Cell */
		oElem = checkFocus(getCell(0, 1, true), assert);
		testLocal.call(this, assert);
	});

	QUnit.test("TreeTable - Expand/Collapse Group", function(assert) {
		var oRowBinding = oTreeTable.getBinding("rows");

		function testCollapseExpandAndFocus(assert, oCellElement) {
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

		function testNoCollapseExpand(assert, oCellElement) {
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

		testCollapseExpandAndFocus(assert, getCell(0, 0, null, null, oTreeTable));
		testCollapseExpandAndFocus(assert, getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIcon"));
		testNoCollapseExpand(assert, getCell(0, 1, null, null, oTreeTable));
		testNoCollapseExpand(assert, getRowHeader(0, null, null, oTreeTable));
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

		initRowActions(oTable, 2, 2);
		oElem = checkFocus(getRowAction(0, true), assert);
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.ok(TableUtils.areAllRowsSelected(oTable), "On Row Action: All rows selected");
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.ok(!TableUtils.areAllRowsSelected(oTable), "On Row Action: All rows deselected");
	});

	QUnit.test("(De)Select All not possible", function(assert) {
		function testLocal(bSelected) {
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

		testLocal(false);
		testLocal(true);
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
		initRowActions(oTable, 2, 2);

		var done = assert.async();

		function testLocal(sSelectionMode, aSelectedIndices, bFinalTest) {
			oTable.setSelectionMode(sSelectionMode);
			sap.ui.getCore().applyChanges();

			// We use a promise here because after the second call of applyChanges (the first happens in initRowactions), the UI needs some time
			// before the focus can be set to a table cell. Otherwise the focus would be set to the body.
			return Promise.resolve().then(function() {
				var aCells = [
					getSelectAll(),
					getRowHeader(0),
					getCell(0, 0),
					getRowAction(0)
				];

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

				if (bFinalTest) {
					done();
				}
			});
		}

		testLocal(sap.ui.table.SelectionMode.None, []);
		testLocal(sap.ui.table.SelectionMode.Single, [1]);
		testLocal(sap.ui.table.SelectionMode.MultiToggle, [0, 1, 4], true);
	});

	QUnit.test("Deselect All not possible", function(assert) {
		function testLocal(sSelectionMode, aSelectedIndices) {
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
			assert.deepEqual(oTable.getSelectedIndices(), aSelectedIndices,
				"DeselectAll on cell \"" + oElem.attr("id") + "\": All rows are still selected");
		}

		testLocal(sap.ui.table.SelectionMode.None, []);
		testLocal(sap.ui.table.SelectionMode.Single, [1]);
		testLocal(sap.ui.table.SelectionMode.MultiToggle, [0, 1, 4]);
	});

	QUnit.module("TableKeyboardDelegate2 - Interaction > Shift+F10 & ContextMenu (Open Context Menus)", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("On a Column Header", function(assert) {
		var oKeydownEvent = this.spy(oTable._getKeyboardExtension()._delegate, "onkeydown");
		var oContextMenuEvent = this.spy(oTable._getKeyboardExtension()._delegate, "oncontextmenu");

		// Shift+F10
		_testColumnHeaderContextMenus(Key.F10, true, true, assert);
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

	QUnit.test("On a Data cell - Custom context menu", function(assert) {
		oTable.setContextMenu(new MenuM({
			items: [
				new MenuItemM({text: "ContextMenuItem"})
			]
		}));
		var oMenu = oTable.getContextMenu();
		var fnOpenAsContextMenu = this.spy(oTable.getContextMenu(), "openAsContextMenu");
		initRowActions(oTable, 1, 1);
		var aElem = [
			getCell(0, 0),
			getRowHeader(0),
			getRowAction(0)
		];

		// Shift+F10 to open the custom context menu
		aElem.forEach(function(oElem) {
			oElem.focus();
			qutils.triggerKeydown(oElem, Key.F10, true, false, false);
			oMenu.close();
			checkFocus(oElem, assert);

			oElem.trigger("contextmenu");
			oMenu.close();
			checkFocus(oElem, assert);
			assert.ok(fnOpenAsContextMenu.calledTwice, "sap.m.Menu.openAsContextMenu called using Shift+F10 keys");
			fnOpenAsContextMenu.reset();
		});

		// selectAll checkbox test for context menu
		fnOpenAsContextMenu.reset();
		var oSelectAll = getSelectAll(true);
		oSelectAll.trigger("contexmenu");
		assert.ok(!fnOpenAsContextMenu.called, "Menu did not open");
		qutils.triggerKeydown(oSelectAll, Key.F10, true, false, false);
		assert.ok(!fnOpenAsContextMenu.called, "Menu did not open");
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
		 * Check whether the keyboard events, which should cause a group to expand and collapse, are handled correctly when triggered on the passed
		 * element.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
		 */
		testCollapseExpandAndFocus: function(assert, oTable, oCellElement) {
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
		 * Check whether the keyboard events, which should not cause a group to expand and collapse, are handled correctly when triggered on the
		 * passed element.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
		 */
		testNoCollapseExpand: function(assert, oTable, oCellElement) {
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

		this.testCollapseExpandAndFocus(assert, oTable, getCell(0, 1));
		this.testCollapseExpandAndFocus(assert, oTable, getRowHeader(0));
		this.testNoCollapseExpand(assert, oTable, getColumnHeader(0));
		testFocus(getColumnHeader(0));
		this.testNoCollapseExpand(assert, oTable, getSelectAll());
		testFocus(getSelectAll());

		initRowActions(oTable, 2, 2);
		this.testCollapseExpandAndFocus(assert, oTable, getRowAction(0));
	});

	QUnit.test("TreeTable", function(assert) {
		this.testCollapseExpandAndFocus(assert, oTreeTable, getCell(0, 0, null, null, oTreeTable));
		this.testCollapseExpandAndFocus(assert, oTreeTable, getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIcon"));
		this.testNoCollapseExpand(assert, oTreeTable, getCell(0, 1, null, null, oTreeTable));
		this.testNoCollapseExpand(assert, oTreeTable, getRowHeader(0, null, null, oTreeTable));
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
		 * Check whether the keyboard events, which should cause a group to expand and collapse, are handled correctly when triggered on the passed
		 * element.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
		 */
		testCollapseExpandAndFocus: function(assert, oTable, oCellElement) {
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
		 * Check whether the keyboard events, which should not cause a group to expand and collapse, are handled correctly when triggered on the
		 * passed element.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
		 */
		testNoCollapseExpand: function(assert, oTable, oCellElement) {
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
		function testFocus(oCellElement) {
			oCellElement.focus();
			checkFocus(oCellElement, assert);

			qutils.triggerKeydown(oCellElement, Key.F4, false, false, false);
			checkFocus(oCellElement, assert);
		}

		this.testCollapseExpandAndFocus(assert, oTable, getCell(0, 1));
		this.testCollapseExpandAndFocus(assert, oTable, getRowHeader(0));
		this.testNoCollapseExpand(assert, oTable, getColumnHeader(0));
		testFocus(getColumnHeader(0));
		this.testNoCollapseExpand(assert, oTable, getSelectAll());
		testFocus(getSelectAll());

		initRowActions(oTable, 2, 2);
		this.testCollapseExpandAndFocus(assert, oTable, getRowAction(0));
	});

	QUnit.test("TreeTable", function(assert) {
		this.testCollapseExpandAndFocus(assert, oTreeTable, getCell(0, 0, null, null, oTreeTable));
		this.testCollapseExpandAndFocus(assert, oTreeTable, getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIcon"));
		this.testNoCollapseExpand(assert, oTreeTable, getCell(0, 1, null, null, oTreeTable));
		this.testNoCollapseExpand(assert, oTreeTable, getRowHeader(0, null, null, oTreeTable));
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
		 * Check whether the keyboard events, which should cause a group to expand and collapse, are handled correctly when triggered on the passed
		 * element.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
		 */
		testCollapseExpandAndFocus: function(assert, oTable, oCellElement) {
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
		 * Check whether the keyboard events, which should not cause a group to expand and collapse, are handled correctly when triggered on the
		 * passed element.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery|HTMLElement} oCellElement The element on which the keyboard events should be triggered.
		 */
		testNoCollapseExpand: function(assert, oTable, oCellElement) {
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
		function testFocus(oCellElement) {
			oCellElement.focus();
			checkFocus(oCellElement, assert);

			qutils.triggerKeypress(oCellElement, Key.PLUS, false, false, false);
			checkFocus(oCellElement, assert);
			qutils.triggerKeypress(oCellElement, Key.MINUS, false, false, false);
			checkFocus(oCellElement, assert);
		}

		this.testCollapseExpandAndFocus(assert, oTable, getCell(0, 1));
		this.testCollapseExpandAndFocus(assert, oTable, getRowHeader(0));
		this.testNoCollapseExpand(assert, oTable, getColumnHeader(0));
		testFocus(getColumnHeader(0));
		this.testNoCollapseExpand(assert, oTable, getSelectAll());
		testFocus(getSelectAll());

		initRowActions(oTable, 2, 2);
		this.testCollapseExpandAndFocus(assert, oTable, getRowAction(0));
	});

	QUnit.module("TreeTable", function(assert) {
		this.testCollapseExpandAndFocus(assert, oTreeTable, getCell(0, 0, null, null, oTreeTable));
		this.testCollapseExpandAndFocus(assert, oTreeTable, getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIcon"));
		this.testNoCollapseExpand(assert, oTreeTable, getCell(0, 1, null, null, oTreeTable));
		this.testNoCollapseExpand(assert, oTreeTable, getRowHeader(0, null, null, oTreeTable));
	});

	QUnit.module("TableKeyboardDelegate2 - Action Mode > Enter and Leave", {
		beforeEach: function() {
			setupTest();

			addColumn("Focusable & Not Tabbable", "Focus&NoTabSpan", false, true, false);
			addColumn("Not Focusable & Not Tabbable", "NoFocus&NoTabSpan", false, false, false);
			addColumn("Focusable & Tabbable", "Focus&TabInput", true, null, true);
			addColumn("Focusable & Not Tabbable", "Focus&NoTabInput", true, null, false);

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			teardownTest();
			iNumberOfCols -= 4;
		},

		/**
		 *  Tests if entering and leaving the action mode works correctly when the focus is on a header cell.
		 *  Tested header cells are: Column header cell, row header cell, SelectAll cell and group header cell.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {int|string} key The keyCode or character.
		 * @param {string} sKeyName The name representing the key.
		 * @param {boolean} bShift Whether to simulate a pressed Shift key.
		 * @param {boolean} bAlt Whether to simulate a pressed Alt key.
		 * @param {boolean} bCtrl Whether to simulate a pressed Ctrl key.
		 * @param {boolean} bTestLeaveActionMode Whether leaving the action mode should be tested.
		 * @param {Function} fEventTriggerer The function which triggers the event.
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
				assert.ok(oTable._getKeyboardExtension().isInActionMode() && oTable._getKeyboardExtension()._isItemNavigationSuspended(),
					"Table was programmatically set to Action Mode");
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
				assert.ok(oTable._getKeyboardExtension().isInActionMode() && oTable._getKeyboardExtension()._isItemNavigationSuspended(),
					"Table was programmatically set to Action Mode");
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
		 * @param {Object} assert QUnit assert object.
		 * @param {int|string} key The keyCode or character.
		 * @param {string} sKeyName The name representing the key.
		 * @param {boolean} bShift Whether to simulate a pressed Shift key.
		 * @param {boolean} bAlt Whether to simulate a pressed Alt key.
		 * @param {boolean} bCtrl Whether to simulate a pressed Ctrl key.
		 * @param {Function} fEventTriggerer The function which triggers the event.
		 * @returns {HTMLElement} Returns the first interactive element inside a data cell. This element has the focus.
		 */
		testOnDataCellWithInteractiveControls: function(assert, key, sKeyName, bShift, bAlt, bCtrl, fEventTriggerer) {
			var sKeyCombination = (bShift ? "Shift+" : "") + (bAlt ? "Alt+" : "") + (bCtrl ? "Ctrl+" : "") + sKeyName;
			var oElement, oPreviousElement;

			// Focus cell with a focusable & tabbable element inside.
			oElement = checkFocus(getCell(0, iNumberOfCols - 2, true), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(),
				"Focus cell with a focusable and tabbable input element: Table is in Navigation Mode");

			// Enter action mode.
			fEventTriggerer(oElement, key, bShift, bAlt, bCtrl);
			oElement = TableKeyboardDelegate2._getInteractiveElements(oElement)[0];
			oPreviousElement = oElement;
			assert.strictEqual(document.activeElement, oElement, sKeyCombination + ": First interactive element in the cell is focused");
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			assertTextSelection(assert, oElement, true, "The text in the input element of type \"text\" is selected");

			// Focus cell with a focusable & non-tabbable element inside.
			oTable._getKeyboardExtension().setActionMode(false);
			oElement = checkFocus(getCell(0, iNumberOfCols - 1, true), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(),
				"Focus cell with a focusable and non-tabbable input element: Table is in Navigation Mode");
			assertTextSelection(assert, oPreviousElement, false,
				"The text in the previously focused input element of type \"text\" is no longer selected");

			// Enter action mode.
			var oInputElement = TableKeyboardDelegate2._getInteractiveElements(oElement)[0];
			oInputElement.value = "123";
			oInputElement.type = "number";
			fEventTriggerer(oElement, key, bShift, bAlt, bCtrl);
			oElement = oInputElement;
			assert.strictEqual(document.activeElement, oElement, sKeyCombination + ": First interactive element in the cell is focused");
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			assertTextSelection(assert, oElement, false, "The text in the input element of type \"number\" is not selected");

			return oElement;
		},

		/**
		 * Tests if the table stays in navigation mode when a data cell without interactive controls inside is focused and the specified key is
		 * pressed.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {int|string} key The keyCode or character.
		 * @param {string} sKeyName The name representing the key.
		 * @param {boolean} bShift Whether to simulate a pressed Shift key.
		 * @param {boolean} bAlt Whether to simulate a pressed Alt key.
		 * @param {boolean} bCtrl Whether to simulate a pressed Ctrl key.
		 * @param {Function} fEventTriggerer The function which triggers the event.
		 */
		testOnDataCellWithoutInteractiveControls: function(assert, key, sKeyName, bShift, bAlt, bCtrl, fEventTriggerer) {
			var sKeyCombination = (bShift ? "Shift+" : "") + (bAlt ? "Alt+" : "") + (bCtrl ? "Ctrl+" : "") + sKeyName;
			var oElem;

			// Focus cell with a non-focusable & non-tabbable element inside.
			oElem = checkFocus(getCell(0, iNumberOfCols - 3, true), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(),
				"Focus cell with a non-focusable and non-tabbable element: Table is in Navigation Mode");

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
		assertTextSelection(assert, oElement, false, "The text in the input element is not selected");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus a non-interactive element inside a data cell.
		oElement = oTable.getRows()[0].getCells()[iNumberOfCols - 4].getDomRef();
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Non-interactive element in the cell is focused");
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Enter Action Mode: Focus a non-tabbable input control inside a data cell.
		oElement = getCell(0, iNumberOfCols - 1).find("input")[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Non-Tabbable input element in the cell is focused");
		assertTextSelection(assert, oElement, false, "The text in the input element is not selected");
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
		var oElement = this.testOnDataCellWithInteractiveControls(assert, Key.F2, "F2", false, false, false, qutils.triggerKeydown);
		var oPreviousElement = oElement;

		// Leave action mode.
		qutils.triggerKeydown(oElement, Key.F2, false, false, false);
		checkFocus(getCell(0, iNumberOfCols - 1), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assertTextSelection(assert, oPreviousElement, false, "The text in the previously selected element is no longer selected");

		this.testOnDataCellWithoutInteractiveControls(assert, Key.F2, "F2", false, false, false, qutils.triggerKeydown);

		// Enter Action Mode: Focus tabbable input control inside a data cell.
		oElement = TableKeyboardDelegate2._getInteractiveElements(getCell(0, iNumberOfCols - 2))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Interactive element in a cell is focused");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus a non-interactive element inside a data cell.
		oElement = oTable.getRows()[0].getCells()[iNumberOfCols - 4].getDomRef();
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Non-interactive element in a cell is focused");
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Focus the cell.
		qutils.triggerKeydown(oElement, Key.F2, false, false, false);
		checkFocus(getCell(0, iNumberOfCols - 4), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	});

	QUnit.test("F2 - On a Row Action Cell", function(assert) {
		initRowActions(oTable, 2, 2);

		// Focus cell with a focusable & tabbable element inside.
		var oElem = checkFocus(getRowAction(0, true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus row action cell with content: Table is in Navigation Mode");

		// Enter action mode.
		qutils.triggerKeydown(oElem, Key.F2, false, false, false);
		var $InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(oElem);
		oElem = $InteractiveElements[0];
		assert.strictEqual(document.activeElement, oElem, "F2: First interactive element in the row action cell is focused");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Leave action mode.
		qutils.triggerKeydown(oElem, Key.F2, false, false, false);
		checkFocus(getRowAction(0), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// No content in row action cell
		initRowActions(oTable, 2, 0);
		oElem = checkFocus(getRowAction(0, true), assert);
		qutils.triggerKeydown(oElem, Key.F2, false, false, false);
		checkFocus(getRowAction(0), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
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
		addColumn("Not Focusable & Not Tabbable", "NoFocusNoTab", false, false, false);
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

	QUnit.test("Space & Enter - On a Row Action Cell - Row selection not possible and no click handler", function(assert) {
		oTable.clearSelection();
		initRowActions(oTable, 2, 2);

		/* Enter key */

		// Focus cell with a focusable & tabbable element inside.
		var oElem = checkFocus(getRowAction(0, true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus row action cell with content: Table is in Navigation Mode");
		// Enter action mode.
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
		var $InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(oElem);
		oElem = $InteractiveElements[0];
		assert.strictEqual(document.activeElement, oElem, "Enter: First interactive element in the row action cell is focused");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assert.equal(oTable.isIndexSelected(0), false, "Row 1: Not Selected");

		// Leave action mode.
		oTable._getKeyboardExtension().setActionMode(false);

		/* Space key */

		// Focus cell with a focusable & tabbable element inside.
		oElem = checkFocus(getRowAction(0, true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus row action cell with content: Table is in Navigation Mode");
		// Enter action mode.
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
		$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements(oElem);
		oElem = $InteractiveElements[0];
		assert.strictEqual(document.activeElement, oElem, "SPACE: First interactive element in the row action cell is focused");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assert.equal(oTable.isIndexSelected(0), false, "Row 1: Not Selected");

		// Leave action mode.
		oTable._getKeyboardExtension().setActionMode(false);

		// No content in row action cell
		initRowActions(oTable, 2, 0);
		oElem = checkFocus(getRowAction(0, true), assert);
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
		checkFocus(getRowAction(0), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assert.equal(oTable.isIndexSelected(0), false, "Row 1: Not Selected");
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
		checkFocus(getRowAction(0), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assert.equal(oTable.isIndexSelected(0), false, "Row 1: Not Selected");
	});

	QUnit.module("TableKeyboardDelegate2 - Action Mode > Navigation", {
		beforeEach: function() {
			setupTest();

			oTable.removeColumn(2); // Remove unnecessary columns to speed up the test.
			oTable.removeColumn(2);
			oTable.removeColumn(2);
			addColumn("Focusable & Not Tabbable", "Focus&NoTabSpan", false, true, false);
			addColumn("Not Focusable & Not Tabbable", "NoFocus&NoTabSpan", false, false, false);
			addColumn("Focusable & Tabbable", "Focus&TabInput", true, null, true);
			addColumn("Focusable & Not Tabbable", "Focus&NoTabInput", true, null, false);

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			teardownTest();
			iNumberOfCols -= 4;
		},

		setupGrouping: function() {
			oTable.setEnableGrouping(true);
			oTable.setGroupBy(oTable.getColumns()[0]);
			TableUtils.Grouping.toggleGroupHeader(oTable, 0);
			TableUtils.Grouping.toggleGroupHeader(oTable, 7);
			TableUtils.Grouping.toggleGroupHeader(oTable, 8);
			sap.ui.getCore().applyChanges();
		},

		/**
		 * Navigates through the whole table, from the first to the last cell including scrolling, using TAB while in action mode.
		 * Navigates back using Shift+TAB.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {boolean} [bShowInfo=false] If <code>true</code>, additional information will be printed in the QUnit output.
		 * @private
		 */
		testActionModeTabNavigation: function(assert, bShowInfo) {
			var done = assert.async();
			var iVisibleRowCount = oTable.getVisibleRowCount();
			var iFixedRowCount = oTable.getFixedRowCount();
			var iFixedBottomRowCount = oTable.getFixedBottomRowCount();
			var bTableHasRowSelectors = TableUtils.isRowSelectorSelectionAllowed(oTable);
			var bTableIsInGroupMode = TableUtils.Grouping.isGroupMode(oTable);
			var bTableHasRowHeader = bTableHasRowSelectors || bTableIsInGroupMode;
			var bTableHasRowActions = TableUtils.hasRowActions(oTable);
			var oKeyboardExtension = oTable._getKeyboardExtension();
			var iActionItemCount = bTableHasRowActions ? oTable.getRowActionTemplate()._iLen : 0;
			var iColumnCount = oTable.getColumns().filter(function(oColumn) {
				return oColumn.getVisible() || oColumn.getGrouped();
			}).length;
			var iLastColumnIndex = iColumnCount + Math.max(0, iActionItemCount - 1); // Action items are treated as columns in this test.
			var iRowCount = oTable._getTotalRowCount();
			var iDelayAfterInRowTabbing = Device.browser.msie ? 50 : 0;
			var iDelayAfterScrollTabbing = Device.browser.msie ? 300 : 100;
			var oElem, i, j;

			if (bShowInfo == null) {
				bShowInfo = false;
			}

			function _assertTextSelection(oInputElement) {
				if (oInputElement instanceof window.HTMLInputElement) {
					assertTextSelection(assert, oInputElement, true, "The text in the input element is selected");
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
			/*eslint-disable no-loop-func*/
			for (i = 0; i < iRowCount; i++) {
				for (j = -1; j <= iLastColumnIndex; j++) {
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
								var $Cell;
								var $InteractiveElements;
								var bIsLastElementInRow = iColumnIndex === iLastColumnIndex;

								if (iColumnIndex === -1) { // Row Header Cell
									if (bTableHasRowHeader) {
										oElem = getRowHeader(iRowIndex);

										if (TableUtils.Grouping.isInGroupingRow(oElem)) {
											assert.strictEqual(document.activeElement, oElem[0],
												"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
												+ "): Header Cell: Group Header Icon focused");
											resolve();
											return; // The TAB event will be simulated after the iteration over the columns has reached the end.

										} else if (bTableHasRowSelectors) {
											assert.strictEqual(document.activeElement, oElem[0],
												"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
												+ "): Header Cell: Row Selector focused");

										} else {
											if (bShowInfo) {
												assert.ok(true,
													"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
													+ "): Header Cell: Skipped, is an empty row header (Grouping without Row Selectors)");
											}
											resolve();
											return;
										}
									} else {
										if (bShowInfo) {
											assert.ok(true,
												"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
												+ "): Header Cell: Skipped, table has no row header");
										}
										resolve();
										return;
									}

								} else if (iColumnIndex < iColumnCount) { // Data Cell
									$Cell = getCell(iRowIndex, iColumnIndex);
									$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($Cell);

									if ($InteractiveElements === null) {
										if (bShowInfo) {
											assert.ok(true,
												"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
												+ "): Cell " + (iColumnIndex + 1) + ": Skipped, no interactive elements");
										}
										resolve();
										return;
									} else {
										oElem = $InteractiveElements[0];
										assert.strictEqual(document.activeElement, oElem,
											"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
											+ "): Cell " + (iColumnIndex + 1) + ": Interactive element focused");
										_assertTextSelection(document.activeElement);

										if (iColumnIndex === iColumnCount - 1 && iActionItemCount === 0) {
											resolve();
											return; // If there are no row action items, the TAB event will be simulated after the iteration over the
													// columns has reached the end.
										}
									}

								} else if (!bTableHasRowActions) { // Row Action Cell
									if (bShowInfo) {
										assert.ok(
											true,
											"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
											+ "): Row Action Cell: Skipped, table has no row actions"
										);
									}

									if (!bIsLastElementInRow) {
										resolve();
										return;
									}
								} else {
									$Cell = getRowAction(iRowIndex);
									$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($Cell);

									if ($InteractiveElements === null) {
										if (bShowInfo) {
											assert.ok(
												true,
												"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
												+ "): Row Action Cell: Skipped, no interactive elements"
											);
										}

										if (!bIsLastElementInRow) {
											resolve();
											return;
										}
									} else {
										var iActionItemIndex = iColumnIndex - iColumnCount;
										var oActionItem = $InteractiveElements[iActionItemIndex];

										if (oActionItem != null) {
											oElem = oActionItem;
											assert.strictEqual(document.activeElement, oElem,
												"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
												+ "): Row Action Cell: Action Item " + (iActionItemIndex + 1) + " focused"
											);
										} else {
											if (bShowInfo) {
												assert.ok(
													true,
													"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
													+ "): Row Action Cell: Action Item " + (iActionItemIndex + 1)
													+ ": Skipped, it does not exist"
												);
											}

											if (!bIsLastElementInRow) {
												resolve();
												return;
											}
										}
									}
								}

								if (bShowInfo) {
									assert.ok(true, "[INFO] Simulating TAB event on: " + document.activeElement.id);
								}

								simulateTabEvent(document.activeElement);

								var bScrolled = bIsLastElementInRow && TableUtils.isLastScrollableRow(oTable, TableUtils.getCell(oTable, oElem));

								if (bShowInfo) {
									assert.ok(true, "[INFO] Scrolling will be performed: " + bScrolled);
								}

								setTimeout(function() {
									if (iAbsoluteRowIndex === iRowCount - 1 && bIsLastElementInRow) {
										var oRowActionElementCell = getRowAction(iVisibleRowCount - 1);

										if (bTableHasRowActions && TableKeyboardDelegate2._getInteractiveElements(oRowActionElementCell) !== null) {
											checkFocus(oRowActionElementCell, assert);
										} else {
											checkFocus(getCell(iVisibleRowCount - 1, iColumnCount - 1), assert);
										}

										assert.ok(!oKeyboardExtension.isInActionMode(), "Table is in Navigation Mode");
									} else {
										assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");
									}
									resolve();
								}, bScrolled ? iDelayAfterScrollTabbing : iDelayAfterInRowTabbing);
							});
						});
					}());
				}
			}
			/*eslint-enable no-loop-func*/

			sequence = sequence.then(function() {
				return new Promise(function(resolve) {
					oElem = TableKeyboardDelegate2._getInteractiveElements(document.activeElement)[0];
					oKeyboardExtension.setActionMode(true);
					assert.strictEqual(document.activeElement, oElem,
						"The action mode was entered on the last cell of the last row - The cells first interactive element is focused");
					assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");

					// Focus the last interactive element in the last cell in the last row.
					var aRows = oTable.getRows();
					var oLastRow = aRows[aRows.length - 1];

					oElem = TableKeyboardDelegate2._getLastInteractiveElement(oLastRow)[0];
					oElem.focus();

					assert.strictEqual(document.activeElement, oElem, "The very last interactive element in the table is focused");
					assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");
					resolve();
				});
			});

			// Tab back to the first interactive control of the table. Then tab back again to leave the action mode.
			/*eslint-disable no-loop-func*/
			for (i = iRowCount - 1; i >= 0; i--) {
				for (j = iLastColumnIndex; j >= -1; j--) {
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
								var $Cell;
								var $InteractiveElements;

								if (iColumnIndex >= iColumnCount) { // Row Action Cell
									if (!bTableHasRowActions) {
										if (bShowInfo) {
											assert.ok(true,
												"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
												+ "): Row Action Cell: Skipped, table has no row actions");
										}
										resolve();
										return;
									} else {
										$Cell = getRowAction(iRowIndex);
										$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($Cell);

										if ($InteractiveElements === null) {
											if (bShowInfo) {
												assert.ok(true,
													"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
													+ "): Row Action Cell: Skipped, no interactive elements");
											}
											resolve();
											return;
										} else {
											var iActionItemIndex = iColumnIndex - iColumnCount;
											var oActionItem = $InteractiveElements[iActionItemIndex];

											if (oActionItem != null) {
												oElem = oActionItem;
												assert.strictEqual(document.activeElement, oElem,
													"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
													+ "): Row Action Cell: Action Item " + (iActionItemIndex + 1) + " focused");
											} else {
												if (bShowInfo) {
													assert.ok(true,
														"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
														+ "): Row Action Cell: Action Item " + (iActionItemIndex + 1)
														+ ": Skipped, it does not exist");
												}
												resolve();
												return;
											}
										}
									}

								} else if (iColumnIndex >= 0) { // Data Cell
									$Cell = getCell(iRowIndex, iColumnIndex);
									$InteractiveElements = TableKeyboardDelegate2._getInteractiveElements($Cell);

									if ($InteractiveElements === null) {
										if (bShowInfo) {
											assert.ok(true,
												"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
												+ "): Cell " + (iColumnIndex + 1) + ": Skipped, no interactive elements");
										}
										resolve();
										return;
									}

									oElem = $InteractiveElements[0];
									assert.strictEqual(document.activeElement, oElem,
										"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
										+ "): Cell " + (iColumnIndex + 1) + ": Interactive element focused");
									_assertTextSelection(document.activeElement);

									var bIsFirstInteractiveElementInRow =
										TableKeyboardDelegate2._getFirstInteractiveElement(oTable.getRows()[iRowIndex])[0] === oElem;
									var bRowHasInteractiveRowHeader =
										bTableHasRowSelectors || TableUtils.Grouping.isInGroupingRow(TableUtils.getCell(oTable, oElem));

									if (bIsFirstInteractiveElementInRow && iColumnIndex > 0 && !bRowHasInteractiveRowHeader) {
										resolve();
										return;
									}

								} else if (bTableHasRowHeader) { // Row Header Cell
									oElem = getRowHeader(iRowIndex);

									if (TableUtils.Grouping.isInGroupingRow(oElem)) {
										assert.strictEqual(document.activeElement, oElem[0],
											"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
											+ "): Header Cell: Group Header Icon focused"
										);

									} else if (bTableHasRowSelectors) {
										assert.strictEqual(document.activeElement, oElem[0],
											"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
											+ "): Header Cell: Row Selector focused"
										);

									} else if (bShowInfo) {
										assert.ok(
											true,
											"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
											+ "): Header Cell: Skipped, is an empty row header (Grouping without Row Selectors)"
										);
									}
								} else {
									if (bShowInfo) {
										assert.ok(
											true,
											"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
											+ "): Header Cell: Skipped, table has no row header"
										);
									}
									resolve();
									return;
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
					}());
				}
			}
			/*eslint-enable no-loop-func*/

			sequence.then(function() {
				done();
			});
		},

		/**
		 * Gets a cell or an interactive element inside the cell.
		 * Limited to the content area of the table, meaning everything except table header cells.
		 *
		 * @param {int} iRowIndex Row index.
		 * @param {int} iColumnIndex Column index. Set -1 for the row headers and -2 for the row actions column.
		 * @param {boolean} [bInteractiveElement=false] If <code>true</true>, the first interactive element inside the cell will be returned.
		 * @returns {jQuery} The jQuery object containing the element.
		 */
		getElement: function(iRowIndex, iColumnIndex, bInteractiveElement) {
			var oElement;

			switch (iColumnIndex) {
				case -1:
					// Row headers are themselves interactive elements.
					return getRowHeader(iRowIndex);
				case -2:
					oElement = getRowAction(iRowIndex);
					break;
				default:
					oElement = getCell(iRowIndex, iColumnIndex);
			}

			if (bInteractiveElement === true) {
				oElement = TableKeyboardDelegate2._getInteractiveElements(oElement).first();
			}

			return oElement;
		},

		/**
		 * Navigates through the whole table with up and down keys, from the first to the last row in the specified column including scrolling.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {int} iColumnIndex Column index. Set -1 for the row headers and -2 for the row actions column
		 * @param {boolean} bCtrlKey Set true if the Ctrl key should be used by navigation
		 * @private
		 */
		testActionModeUpDownNavigation: function(assert, iColumnIndex, bCtrlKey) {
			var oElem;
			var iVisibleRows = oTable.getVisibleRowCount();
			var i;

			oElem = this.getElement(0, iColumnIndex);
			oElem.focus();
			checkFocus(oElem, assert);
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, true); // Use Ctrl to enter the action mode.
			oElem = checkFocus(this.getElement(1, iColumnIndex, true), assert);

			if (iColumnIndex === -1) {
				// In case of row header cells enter the action mode manually.
				oTable._getKeyboardExtension()._actionMode = true;
			}
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

			// Navigate down to the last visible row.
			for (i = 2; i < iVisibleRows; i++) {
				qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, bCtrlKey);
				oElem = checkFocus(this.getElement(i, iColumnIndex, true), assert);
				assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			}

			// Scroll to the last row.
			for (i = iVisibleRows; i < iNumberOfRows; i++) {
				qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, bCtrlKey);
				oElem = checkFocus(this.getElement(iVisibleRows - 1, iColumnIndex, true), assert);
				assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			}

			// Navigating down on the last row switches the action mode off.
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, bCtrlKey);
			oElem = checkFocus(this.getElement(iVisibleRows - 1, iColumnIndex), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			// Navigate up to the first visible row.
			for (i = iVisibleRows - 2; i >= 0; i--) {
				// At the last row, always press Ctrl to switch to the action mode again.
				qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, i === iVisibleRows - 2 || bCtrlKey);
				oElem = checkFocus(this.getElement(i, iColumnIndex, true), assert);

				if (iColumnIndex === -1) {
					// In case of row header cells enter the action mode manually.
					oTable._getKeyboardExtension()._actionMode = true;
				}
				assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			}

			// Scroll up to the first row.
			for (i = iVisibleRows; i < iNumberOfRows; i++) {
				qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, bCtrlKey);
				oElem = checkFocus(this.getElement(0, iColumnIndex, true), assert);
				assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			}

			// Navigating up on the first row switches the action mode off.
			qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, bCtrlKey);
			checkFocus(this.getElement(0, iColumnIndex), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			// Ctrl+Up on the first row does not navigate to the column header.
			qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, true);
			checkFocus(this.getElement(0, iColumnIndex), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		}
	});

	QUnit.test("TAB & Shift+TAB", function(assert) {
		oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
		sap.ui.getCore().applyChanges();

		this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers", function(assert) {
		this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Invisible Columns", function(assert) {
		oTable.getColumns()[1].setVisible(false);
		sap.ui.getCore().applyChanges();

		this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns", function(assert) {
		oTable.setFixedColumnCount(2);
		sap.ui.getCore().applyChanges();

		this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Row Actions", function(assert) {
		oTable.setFixedColumnCount(2);
		initRowActions(oTable, 2, 2);

		this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Row Actions, Fixed Top Rows, Fixed Bottom Rows", function(assert) {
		oTable.setFixedColumnCount(2);
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		initRowActions(oTable, 2, 2);

		this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Empty Row Actions, Fixed Top Rows, Fixed Bottom Rows", function(assert) {
		oTable.setFixedColumnCount(2);
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		initRowActions(oTable, 1, 0);

		this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Grouping", function(assert) {
		oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
		this.setupGrouping();

		this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Row Actions, Fixed Top Rows, Fixed Bottom Rows, Grouping", function(assert) {
		oTable.setFixedColumnCount(2);
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		initRowActions(oTable, 2, 2);
		this.setupGrouping();

		this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Empty Row Actions, Fixed Top Rows, Fixed Bottom Rows, Grouping", function(assert) {
		oTable.setFixedColumnCount(2);
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		initRowActions(oTable, 1, 0);
		this.setupGrouping();

		this.testActionModeTabNavigation(assert);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - On first column", function(assert) {
		this.testActionModeUpDownNavigation(assert, 0, true);

		var oElement = getCell(0, 1).find("span")[0];

		oElement.tabIndex = -1;
		oElement.focus();
		checkFocus(oElement, assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(oElement, Key.Arrow.UP, false, false, true);
		checkFocus(getCell(0, 1), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		oTable._getScrollExtension().scrollVerticallyMax(true);
		oElement = getCell(oTable.getVisibleRowCount() - 1, 1).find("span")[0];
		oElement.tabIndex = -1;
		oElement.focus();
		checkFocus(oElement, assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(oElement, Key.Arrow.DOWN, false, false, true);
		checkFocus(getCell(oTable.getVisibleRowCount() - 1, 1), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	});

	QUnit.test("Up & Down - On first column", function(assert) {
		this.testActionModeUpDownNavigation(assert, 0, false);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - On Row Headers", function(assert) {
		this.testActionModeUpDownNavigation(assert, -1, true);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - On Row Actions", function(assert) {
		initRowActions(oTable, 1, 1);
		this.testActionModeUpDownNavigation(assert, -2, true);
	});

	QUnit.test("Up & Down - On Row Actions", function(assert) {
		initRowActions(oTable, 1, 1);
		this.testActionModeUpDownNavigation(assert, -2, false);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - Navigate between interchanging interactive and non-interactive cells", function(assert) {
		var oElem;

		getCell(1, 1).find("span").attr("tabindex", "-1"); // Prepare the cell in the second row to not have interactive elements.
		oElem = getCell(0, 1, true, assert);
		checkFocus(oElem, assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, true);
		oElem = getCell(1, 1);
		checkFocus(oElem, assert); // The cell without interactive elements should be focused.
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		oElem = oTable.getRows()[1].getCells()[1].getDomRef();
		oElem.focus();
		checkFocus(oElem, assert); // The non-interactive element should be focused.
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, true);
		oElem = TableKeyboardDelegate2._getInteractiveElements(getCell(2, 1)).first();
		checkFocus(oElem, assert); // The cells interactive element should be focused.
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, true);
		oElem = getCell(1, 1);
		checkFocus(oElem, assert); // The cell without interactive elements should be focused.
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		oElem = oTable.getRows()[1].getCells()[1].getDomRef();
		oElem.focus();
		checkFocus(oElem, assert); // The non-interactive element should be focused.
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, true);
		oElem = TableKeyboardDelegate2._getInteractiveElements(getCell(0, 1)).first();
		checkFocus(oElem, assert); // The cells interactive element should be focused.
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - Navigate between text input elements", function(assert) {
		oTable.setVisibleRowCount(4);
		sap.ui.getCore().applyChanges();

		var oInputElement = document.createElement("input");
		oInputElement.setAttribute("id", oTable.getRows()[1].getCells()[1].getId());
		oInputElement.value = "test";
		getCell(1, 1).empty().append(oInputElement);

		var oTextAreaElement = document.createElement("textarea");
		oTextAreaElement.setAttribute("id", oTable.getRows()[2].getCells()[1].getId());
		oTextAreaElement.value = "test";
		getCell(2, 1).empty().append(oTextAreaElement);

		getCell(0, 1, true, assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
		checkFocus(oInputElement, assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oInputElement, true, "The text in the input element of type \"text\" is selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
		checkFocus(oTextAreaElement, assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oTextAreaElement, false, "The text in the textarea is not selected");
		assertTextSelection(assert, oInputElement, false, "The text in the input element of type \"text\" is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
		// The interactive element in the cell under the textarea cell should be focused.
		checkFocus(TableKeyboardDelegate2._getInteractiveElements(getCell(3, 1)).first(), assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		checkFocus(oTextAreaElement, assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oTextAreaElement, false, "The text in the textarea element is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		checkFocus(oInputElement, assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oInputElement, true, "The text in the input element of type \"text\" is selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		// The interactive element in the cell above the input cell should be focused.
		checkFocus(TableKeyboardDelegate2._getInteractiveElements(getCell(0, 1)).first(), assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oInputElement, false, "The text in the input element of type \"text\" is not selected");
	});

	QUnit.test("Up & Down - Navigate between text input elements", function(assert) {
		oTable.setVisibleRowCount(4);
		sap.ui.getCore().applyChanges();

		var oInputElement = document.createElement("input");
		var oTextAreaElement = document.createElement("textarea");
		var oCellWithInput = getCell(1, 1).empty().append(oInputElement);
		var oCellWithTextArea = getCell(2, 1).empty().append(oTextAreaElement);

		oInputElement.setAttribute("id", oTable.getRows()[1].getCells()[1].getId());
		oInputElement.value = "test";
		oTextAreaElement.setAttribute("id", oTable.getRows()[2].getCells()[1].getId());
		oTextAreaElement.value = "test";

		getCell(0, 1, true, assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
		checkFocus(oCellWithInput, assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assertTextSelection(assert, oInputElement, false, "The text in the input element of type \"text\" is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
		checkFocus(oCellWithTextArea, assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assertTextSelection(assert, oTextAreaElement, false, "The text in the textarea element is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
		checkFocus(getCell(3, 1), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
		checkFocus(oCellWithTextArea, assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assertTextSelection(assert, oTextAreaElement, false, "The text in the textarea element is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
		checkFocus(oCellWithInput, assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assertTextSelection(assert, oInputElement, false, "The text in the input element of type \"text\" is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
		checkFocus(getCell(0, 1), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	});
});