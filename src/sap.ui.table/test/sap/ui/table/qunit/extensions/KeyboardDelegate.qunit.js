/*global QUnit, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/extensions/KeyboardDelegate",
	"sap/ui/Device",
	"sap/ui/events/F6Navigation",
	"sap/ui/table/library",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/CreationRow",
	"sap/ui/table/rowmodes/Type",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/dom/jquery/Selectors" // provides jQuery custom selector ":sapTabbable"
], function(
	TableQUnitUtils,
	qutils,
	TableUtils,
	KeyboardDelegate,
	Device,
	F6Navigation,
	library,
	Table,
	Column,
	CreationRow,
	RowModeType,
	FixedRowMode,
	KeyCodes,
	JSONModel,
	jQuery,
	oCore
) {
	"use strict";

	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var iNumberOfRows = window.iNumberOfRows;
	var initRowActions = window.initRowActions;
	var checkFocus = window.checkFocus;
	var fakeGroupRow = window.fakeGroupRow;
	var TestInputControl = TableQUnitUtils.TestInputControl;
	var TestControl = TableQUnitUtils.TestControl;
	var aFocusDummyIds = [];

	function checkDelegateType(sExpectedType) {
		var oTbl = new Table();
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

		$Tabbables = jQuery.uniqueSort($Tabbables);
		return $Tabbables.filter(function() {
			return isContained(aScopes, this);
		});
	}

	function simulateTabEvent(oTarget, bBackward) {
		var oParams = {};
		oParams.keyCode = KeyCodes.TAB;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = !!bBackward;
		oParams.altKey = false;
		oParams.metaKey = false;
		oParams.ctrlKey = false;

		if (typeof (oTarget) == "string") {
			oTarget = document.getElementById(oTarget);
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

		var $Tabbables = findTabbables(document.activeElement, [document.getElementById("qunit-fixture")], !bBackward);
		if ($Tabbables.length) {
			$Tabbables.get(bBackward ? $Tabbables.length - 1 : 0).focus();
		}
	}

	function tabAndWaitFocusChange(bBackward, bScrolled) {
		return new Promise(function(resolve) {
			simulateTabEvent(document.activeElement, bBackward);
			if (bScrolled) {
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						resolve();
					}, 10);
				});
			} else {
				setTimeout(function() {
					resolve();
				}, 10);
			}
		});
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
		if (Device.browser.safari) {
			return;
		}

		var iSelectedCharacterCount = oTextInputElement.selectionEnd - oTextInputElement.selectionStart;
		var iTotalCharacterCount = oTextInputElement.value.length;
		var bSelected = iSelectedCharacterCount > 0 && iSelectedCharacterCount === iTotalCharacterCount;

		assert.strictEqual(bSelected, bExpectSelected, sText);
	}

	function legacyAreAllRowsSelected(oTable) {
		var oSelectionPlugin = oTable._getSelectionPlugin();
		var iSelectableRowCount = oSelectionPlugin.getSelectableCount();
		var iSelectedRowCount = oSelectionPlugin.getSelectedCount();

		return iSelectableRowCount > 0 && iSelectableRowCount === iSelectedRowCount;
	}

	function renderFocusDummy(sId) {
		aFocusDummyIds.push(sId);
		new TestControl(sId, {text: sId, tabbable: true}).placeAt("qunit-fixture");
	}

	function removeFocusDummies() {
		aFocusDummyIds.forEach(function(sId) {
			oCore.byId(sId).destroy();
		});
		aFocusDummyIds = [];
	}

	function setupTest() {
		createTables(true, true);
		renderFocusDummy("Focus1");
		oTable.placeAt("qunit-fixture");
		renderFocusDummy("Focus2");
		oTreeTable.placeAt("qunit-fixture");
		renderFocusDummy("Focus3");
		oCore.applyChanges();
	}

	function teardownTest() {
		destroyTables();
		removeFocusDummies();
	}

	function TriggerKeyMixin(oTable, mKeyInfo) {
		function onKeydown(oEvent) {
			this["on" + oEvent.type] = {
				defaultPrevented: oEvent.isDefaultPrevented(),
				propagationStopped: oEvent.isPropagationStopped()
			};
		}

		this.mKeyInfo = mKeyInfo;

		oTable.addEventDelegate(Object.values(mKeyInfo).reduce(function(oDelegate, mInfo) {
			oDelegate[mInfo.eventName] = onKeydown;
			return oDelegate;
		}, {}), this);

		/**
		 * Triggers a keydown event on an element and performs assertions.
		 *
		 * @param {int} iKeyCode Code of the key.
		 * @param {HTMLElement} oTarget The element that is focused and on which the keyboard event is triggered.
		 * @param {HTMLElement} oDestination The element that should be focused after triggering the event.
		 * @param {object} [mExpectation] Expectation details.
		 * @param {boolean} [mExpectation.defaultPrevented=true] Whether the event default was prevented.
		 * @param {boolean} [mExpectation.propagationStopped=true] Whether event propagation was stopped.
		 * @param {boolean} [mExpectation.rowsUpdate=false] Whether to expect a rows update and wait for it.
		 * @returns {Promise}
		 *     A promise that resolves after the key is triggered. If <code>mExpectation.rowsUpdate</code>is <code>true</code>, the promise resolves
		 *     after the rows are updated.
		 */
		this.triggerKey = function(iKeyCode, oTarget, oDestination, mExpectation) {
			var mKeyInfo = Object.assign({shift: false, alt: false, ctrl: false}, this.mKeyInfo[iKeyCode]);
			var that = this;

			QUnit.assert.ok(true, "Trigger '" + mKeyInfo.keyName + "' on " + oTarget.getAttribute("id"));

			mExpectation = Object.assign({
				defaultPrevented: true,
				propagationStopped: true,
				scrolled: false
			}, mExpectation);

			oTarget.focus();
			qutils.triggerKeydown(oTarget, iKeyCode, mKeyInfo.shift, mKeyInfo.alt, mKeyInfo.ctrl);

			function assert() {
				checkFocus(oDestination, QUnit.assert);

				QUnit.assert.ok(that[mKeyInfo.eventName].defaultPrevented === mExpectation.defaultPrevented,
					"Event default " + (mExpectation.defaultPrevented ? "" : "not ") + "prevented");
				QUnit.assert.ok(that[mKeyInfo.eventName].propagationStopped === mExpectation.propagationStopped,
					"Propagation " + (mExpectation.propagationStopped ? "" : "not ") + "stopped");
				delete that[mKeyInfo.eventName];
			}

			if (mExpectation.rowsUpdate) {
				return oTable.qunit.whenRenderingFinished().then(function() {
					assert();
				});
			} else {
				assert();
				return Promise.resolve();
			}
		};
	}

	/**
	 * Key string constants.
	 * "Arrow Left" and "Arrow Right" keys are switched in RTL mode.
	 */
	var Key = {
		Arrow: {
			LEFT: oCore.getConfiguration().getRTL() ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT,
			RIGHT: oCore.getConfiguration().getRTL() ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT,
			UP: KeyCodes.ARROW_UP,
			DOWN: KeyCodes.ARROW_DOWN
		},
		HOME: KeyCodes.HOME,
		END: KeyCodes.END,
		Page: {
			UP: KeyCodes.PAGE_UP,
			DOWN: KeyCodes.PAGE_DOWN
		},
		SHIFT: KeyCodes.SHIFT,
		F2: KeyCodes.F2,
		F4: KeyCodes.F4,
		SPACE: KeyCodes.SPACE,
		ENTER: KeyCodes.ENTER,
		ESCAPE: KeyCodes.ESCAPE,
		A: KeyCodes.A,
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
		assert.ok(checkDelegateType("sap.ui.table.extensions.KeyboardDelegate"), "Correct delegate");
	});

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

		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(Key.A), Key.A),
			"Pressed: A");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(Key.A, true), Key.A, CTRL),
			"Pressed: Ctrl+A");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(Key.A, true, false, true), Key.A, CTRL + SHIFT),
			"Pressed: Ctrl+Shift+A");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(null, true), null, CTRL),
			"Pressed: Ctrl");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(Key.A, true), null, CTRL),
			"Pressed: Ctrl+A (Checked only for Ctrl)");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(null, false, false, true, true), null, SHIFT + ALT),
			"Pressed: Shift+Alt");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(43), Key.PLUS),
			"Pressed: Plus");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(43, true), Key.PLUS, CTRL),
			"Pressed: Ctrl+Plus");

		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(Key.Arrow.DOWN), Key.A),
			"Not Pressed: A (pressed ArrowDown)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(Key.A, true, false, true), Key.A, CTRL),
			"Not Pressed: Ctrl+A (pressed Ctrl+Shift+A)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(Key.A, false, true), Key.A, CTRL),
			"Not Pressed: Ctrl+A (pressed Meta+A)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(Key.A, true), Key.A, CTRL + SHIFT),
			"Not Pressed: Ctrl+Shift+A (pressed Ctrl+A)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(null, false, false, true), null, CTRL),
			"Not Pressed: Ctrl (pressed Shift)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(Key.Arrow.DOWN), null, SHIFT + ALT),
			"Not Pressed: Shift+Alt (pressed ArrowDown)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(45), Key.PLUS),
			"Not Pressed: Plus (pressed Minus)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(43, false, true), Key.PLUS, CTRL),
			"Not Pressed: Ctrl+Plus (pressed Meta+Plus)");

		Device.os.macintosh = true;

		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(Key.A), Key.A),
			"Pressed: A");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(Key.A, false, true), Key.A, CTRL),
			"Pressed: Meta+A");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(Key.A, false, true, true), Key.A, CTRL + SHIFT),
			"Pressed: Meta+Shift+A");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(null, false, true), null, CTRL),
			"Pressed: Meta");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(Key.A, false, true), null, CTRL),
			"Pressed: Meta+A (Checked only for Meta)");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(null, false, false, true, true), null, SHIFT + ALT),
			"Pressed: Shift+Alt");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(43), Key.PLUS),
			"Pressed: Plus");
		assert.ok(KeyboardDelegate._isKeyCombination(getEvent(43, false, true), Key.PLUS, CTRL),
			"Pressed: Meta+Plus");

		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(Key.Arrow.DOWN), Key.A),
			"Not Pressed: A (pressed ArrowDown)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(Key.A, false, true, true), Key.A, CTRL),
			"Not Pressed: Meta+A (pressed Meta+Shift+A)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(Key.A, true), Key.A, CTRL),
			"Not Pressed: Meta+A (pressed Ctrl+A)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(Key.A, false, true), Key.A, CTRL + SHIFT),
			"Not Pressed: Meta+Shift+A (pressed Meta+A)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(null, false, false, true), null, CTRL),
			"Not Pressed: Meta (pressed Shift)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(Key.Arrow.DOWN), null, SHIFT + ALT),
			"Not Pressed: Shift+Alt (pressed ArrowDown)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(45), Key.PLUS),
			"Not Pressed: Plus (pressed Minus)");
		assert.ok(!KeyboardDelegate._isKeyCombination(getEvent(43, true), Key.PLUS, CTRL),
			"Not Pressed: Meta+Plus (pressed Ctrl+Plus)");

		Device.os.macintosh = bIsMacintosh;
	});

	QUnit.test("_allowsToggleExpandedState", function(assert) {
		initRowActions(oTable, 2, 2);

		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTable, getCell(0, 0)[0]),
			"Returned False: Pressing a key on a normal data cell can not toggle a group");
		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTable, TableUtils.getInteractiveElements(getCell(0, 0))[0]),
			"Returned False: Pressing a key on an interactive element inside a normal data cell can not toggle a group");
		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTable, getRowHeader(0)[0]),
			"Returned False: Pressing a key on a normal row header cell can not toggle a group");
		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTable, getRowAction(0)[0]),
			"Returned False: Pressing a key on a normal row action cell can not toggle a group");
		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTable, getColumnHeader(0)[0]),
			"Returned False: Pressing a key on a column header cell can not toggle a group");
		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTable, getSelectAll()[0]),
			"Returned False: Pressing a key on the SelectAll cell can not toggle a group");
	});

	/**
	 * @deprecated As of version 1.118.
	 */
	QUnit.test("_allowsToggleExpandedState with grouping", function(assert) {
		initRowActions(oTable, 2, 2);
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable.getColumns()[0]);
		oCore.applyChanges();

		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTable, getCell(0, 1)[0]),
			"Returned True: Pressing a key on a data cell in a grouping row can toggle a group");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTable, getRowHeader(0)[0]),
			"Returned True: Pressing a key on a row header cell in a grouping row can toggle a group");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTable, getRowAction(0)[0]),
			"Returned True: Pressing a key on a row action cell in a grouping row can toggle a group");
	});

	QUnit.test("_allowsToggleExpandedState - TreeTable", function(assert) {
		initRowActions(oTreeTable, 2, 2);

		var oTreeIconCell = getCell(0, 0, null, null, oTreeTable)[0];
		var sTreeIconOpenClass = "sapUiTableTreeIconNodeOpen";
		var sTreeIconClosedClass = "sapUiTableTreeIconNodeClosed";
		var sTreeIconLeafClass = "sapUiTableTreeIconLeaf";

		// Closed node
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTreeTable, oTreeIconCell),
			"Returned True: Pressing a key on a tree icon cell of a closed node can toggle a group");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTreeTable, TableUtils.getInteractiveElements(oTreeIconCell)[0]),
			"Returned True: Pressing a key on a close node element can toggle a group");

		// Open node
		oTreeIconCell.classList.remove(sTreeIconClosedClass);
		oTreeIconCell.classList.add(sTreeIconOpenClass);

		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTreeTable, oTreeIconCell),
			"Returned True: Pressing a key on a tree icon cell of a open node can toggle a group");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTreeTable, TableUtils.getInteractiveElements(oTreeIconCell)[0]),
			"Returned True: Pressing a key on a open node element can toggle a group");

		// Leaf node
		oTreeIconCell.classList.remove(sTreeIconOpenClass);
		oTreeIconCell.classList.add(sTreeIconLeafClass);

		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTreeTable, oTreeIconCell),
			"Returned True: Pressing a key on a tree icon cell of a leaf node can toggle a group");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTreeTable, TableUtils.getInteractiveElements(oTreeIconCell)[0]),
			"Returned True: Pressing a key on a leaf node element can toggle a group");

		// Other elements
		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTreeTable, TableUtils.getInteractiveElements(oTreeIconCell)[1]),
			"Returned False: Pressing a key on an interactive element inside a cell can not toggle a group");
		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTreeTable, getRowHeader(0, null, null, oTreeTable)[0]),
			"Returned False: Pressing a key on a normal row header cell can not toggle a group");
		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTreeTable, getRowAction(0, null, null, oTreeTable)[0]),
			"Returned False: Pressing a key on a normal row action cell can not toggle a group");
		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTreeTable, getColumnHeader(0, null, null, oTreeTable)[0]),
			"Returned False: Pressing a key on a column header cell can not toggle a group");
		assert.ok(!KeyboardDelegate._allowsToggleExpandedState(oTreeTable, getSelectAll(null, null, oTreeTable)[0]),
			"Returned False: Pressing a key on the SelectAll cell can not toggle a group");

		oTreeTable.setUseGroupMode(true);
		oCore.applyChanges();

		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTreeTable, getCell(0, 0, null, null, oTreeTable)[0]),
			"Returned True: Pressing a key on a data cell in a grouping row can toggle a group");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTreeTable, getCell(0, 1, null, null, oTreeTable)[0]),
			"Returned True: Pressing a key on a data cell in a grouping row can toggle a group");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTreeTable, getRowHeader(0, null, null, oTreeTable)[0]),
			"Returned True: Pressing a key on a row header cell in a grouping row can toggle a group");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(oTreeTable, getRowAction(0, null, null, oTreeTable)[0]),
			"Returned True: Pressing a key on a row action cell in a grouping row can toggle a group");
	});

	QUnit.test("_focusElement", function(assert) {
		var oElement;
		var oSetSilentFocusSpy = this.spy(oTable._getKeyboardExtension(), "setSilentFocus");
		var sInputType;
		var mInputTypes = {
			text: {supportsTextSelectionReadAPI: true, value: "text", columnIndex: null},
			password: {supportsTextSelectionReadAPI: true, value: "password", columnIndex: null},
			search: {supportsTextSelectionReadAPI: true, value: "search", columnIndex: null},
			tel: {supportsTextSelectionReadAPI: true, value: "123 456", columnIndex: null},
			url: {supportsTextSelectionReadAPI: true, value: "http://www.test.com", columnIndex: null},
			email: {supportsTextSelectionReadAPI: false, value: "test@test.com", columnIndex: null},
			number: {supportsTextSelectionReadAPI: false, value: "123456", columnIndex: null}
		};

		function getInputElement(iColumnIndex) {
			return oTable.getRows()[0].getCells()[iColumnIndex].getDomRef();
		}

		function testInputElement(mInputType, bSilentFocus) {
			oElement = getInputElement(mInputType.columnIndex);
			KeyboardDelegate._focusElement(oTable, oElement, bSilentFocus);
			checkFocus(oElement, assert);

			if (mInputType.supportsTextSelectionReadAPI) {
				assertTextSelection(assert, oElement, true, "Input type: " + oElement.type + " - The text is selected");
			}

			if (bSilentFocus) {
				assert.ok(oSetSilentFocusSpy.calledOnce, "Input type: " + oElement.type + " - The element was focused silently");
				oSetSilentFocusSpy.resetHistory();
			} else {
				assert.ok(oSetSilentFocusSpy.notCalled, "Input type: " + oElement.type + " - The element was not focused silently");
			}
		}

		for (sInputType in mInputTypes) {
			mInputTypes[sInputType].columnIndex = TableQUnitUtils.addColumn(oTable, sInputType, mInputTypes[sInputType].value, true, null, null,
																			sInputType, false).getIndex();
		}
		oCore.applyChanges();

		for (sInputType in mInputTypes) {
			testInputElement(mInputTypes[sInputType]);
		}
		for (sInputType in mInputTypes) {
			testInputElement(mInputTypes[sInputType], true);
		}

		oElement = getInputElement(mInputTypes.text.columnIndex);
		KeyboardDelegate._focusElement(oTable, oElement);
		checkFocus(oElement, assert);
		assert.ok(oSetSilentFocusSpy.notCalled, "The element was not focused silently");
		assertTextSelection(assert, oElement, true, "The text is selected");

		oElement = oTable.getRows()[0].getCells()[0].getDomRef();
		KeyboardDelegate._focusElement(oTable, oElement);
		checkFocus(oElement, assert);
		assert.ok(oSetSilentFocusSpy.notCalled, "The element was not focused silently");

		oElement = oTable.getRows()[0].getCells()[0].getDomRef();
		KeyboardDelegate._focusElement(oTable, oElement, true);
		checkFocus(oElement, assert);
		assert.ok(oSetSilentFocusSpy.calledOnce, "The element was focused silently");

		oSetSilentFocusSpy.restore();
	});

	QUnit.module("Interactive elements", {
		beforeEach: function() {
			createTables();

			TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "Focus&NoTabSpan", false, true, false);
			TableQUnitUtils.addColumn(oTable, "Not Focusable & Not Tabbable", "NoFocus&NoTabSpan", false, false, false);
			TableQUnitUtils.addColumn(oTable, "Focusable & Tabbable", "Focus&TabInput", true, null, true);
			TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "Focus&NoTabInput", true, null, false);

			initRowActions(oTable, 2, 2);
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("_isElementInteractive", function(assert) {
		var $FocusAndNoTabSpan = getCell(0, oTable.columnCount - 4).find("span");
		var $NoFocusAndNoTabSpan = getCell(0, oTable.columnCount - 3).find("span");
		var $FocusAndTabInput = getCell(0, oTable.columnCount - 2).find("input");
		var $FocusAndNoTabInput = getCell(0, oTable.columnCount - 1).find("input");
		var $TreeIconOpen = jQuery("<div class=\"sapUiTableTreeIcon sapUiTableTreeIconNodeOpen\"></div>");
		var $TreeIconClosed = jQuery("<div class=\"sapUiTableTreeIcon sapUiTableTreeIconNodeClosed\"></div>");
		var $TreeIconLeaf = jQuery("<div class=\"sapUiTableTreeIcon sapUiTableTreeIconLeaf\"></div>");
		var $RowActionIcon = getRowAction(0).find(".sapUiTableActionIcon");

		assert.ok(!KeyboardDelegate._isElementInteractive($NoFocusAndNoTabSpan),
			"(jQuery) Not focusable and not tabbable span element is not interactive");
		assert.ok(!KeyboardDelegate._isElementInteractive($FocusAndNoTabSpan),
			"(jQuery) Focusable and not tabbable span element is not interactive");
		assert.ok(KeyboardDelegate._isElementInteractive($FocusAndNoTabInput),
			"(jQuery) Focusable and not tabbable input element is interactive");
		assert.ok(KeyboardDelegate._isElementInteractive($FocusAndTabInput),
			"(jQuery) Focusable and tabbable input element is interactive");
		assert.ok(KeyboardDelegate._isElementInteractive($TreeIconOpen),
			"(jQuery) TreeIcon of open node is interactive");
		assert.ok(KeyboardDelegate._isElementInteractive($TreeIconClosed),
			"(jQuery) TreeIcon of closed node is interactive");
		assert.ok(!KeyboardDelegate._isElementInteractive($TreeIconLeaf),
			"(jQuery) TreeIcon of leaf node is not interactive");
		assert.ok(KeyboardDelegate._isElementInteractive($RowActionIcon),
			"(jQuery) ActionItem is interactive");

		assert.ok(!KeyboardDelegate._isElementInteractive($NoFocusAndNoTabSpan[0]),
			"(HTMLElement) Not focusable and not tabbable span element is not interactive");
		assert.ok(!KeyboardDelegate._isElementInteractive($FocusAndNoTabSpan)[0],
			"(HTMLElement) Focusable and not tabbable span element is not interactive");
		assert.ok(KeyboardDelegate._isElementInteractive($FocusAndNoTabInput[0]),
			"(HTMLElement) Focusable and not tabbable input element is interactive");
		assert.ok(KeyboardDelegate._isElementInteractive($FocusAndTabInput[0]),
			"(HTMLElement) Focusable and tabbable input element is interactive");
		assert.ok(KeyboardDelegate._isElementInteractive($TreeIconOpen[0]),
			"(HTMLElement) TreeIcon of open node is interactive");
		assert.ok(KeyboardDelegate._isElementInteractive($TreeIconClosed[0]),
			"(HTMLElement) TreeIcon of closed node is interactive");
		assert.ok(!KeyboardDelegate._isElementInteractive($TreeIconLeaf[0]),
			"(HTMLElement) TreeIcon of leaf node is not interactive");
		assert.ok(KeyboardDelegate._isElementInteractive($RowActionIcon[0]),
			"(HTMLElement) ActionItem is interactive");

		assert.ok(!KeyboardDelegate._isElementInteractive(), "No parameter passed: False was returned");
	});

	QUnit.test("_getFirstInteractiveElement", function(assert) {
		var $FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($FirstInteractiveElement.length, 1, "First row: One element was returned");
		assert.strictEqual($FirstInteractiveElement[0].value, "Focus&TabInput1", "First row: The correct element was returned");

		oTable.getColumns().forEach(function(oColumn) {
			oColumn.setVisible(false);
		});
		oCore.applyChanges();

		$FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($FirstInteractiveElement.length, 1, "First row: One element was returned");
		assert.strictEqual($FirstInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"First row: The correct element was returned");

		initRowActions(oTable, 1, 0);
		$FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($FirstInteractiveElement, null, "Row has no interactive elements: Null was returned");

		$FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement();
		assert.strictEqual($FirstInteractiveElement, null, "No parameter passed: Null was returned");
	});

	QUnit.test("_getLastInteractiveElement", function(assert) {
		var $LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($LastInteractiveElement.length, 1, "First row with row actions: One element was returned");
		assert.strictEqual($LastInteractiveElement.get(-1), getRowAction(0).find(".sapUiTableActionIcon:visible").get(-1),
			"First row with row actions: The correct element was returned");

		initRowActions(oTable, 2, 0);
		$LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($LastInteractiveElement.length, 1, "First row without row actions: One element was returned");
		assert.strictEqual($LastInteractiveElement[0].value, "Focus&NoTabInput1", "First row without row actions: The correct element was returned");

		$LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement();
		assert.strictEqual($LastInteractiveElement, null, "No parameter passed: Null was returned");
	});

	QUnit.test("_getPreviousInteractiveElement", function(assert) {
		var $LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement(oTable.getRows()[0]);

		var $PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $LastInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"The correct previous element was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0].value, "Focus&NoTabInput1", "The correct previous element was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0].value, "Focus&TabInput1", "The correct previous element was returned");

		var $FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);
		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $FirstInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement, null,
			"(jQuery) Getting the previous interactive element of the first interactive element: Null was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $LastInteractiveElement[0]);
		assert.strictEqual($PreviousInteractiveElement.length, 1,
			"(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"The correct previous element was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement[0]);
		assert.strictEqual($PreviousInteractiveElement.length, 1,
			"(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0].value, "Focus&NoTabInput1", "The correct previous element was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement[0]);
		assert.strictEqual($PreviousInteractiveElement.length, 1,
			"(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0].value, "Focus&TabInput1", "The correct previous element was returned");

		$FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);
		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $FirstInteractiveElement[0]);
		assert.strictEqual($PreviousInteractiveElement, null,
			"(HTMLElement) Getting the previous interactive element of the first interactive element: Null was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, getCell(0, 0));
		assert.strictEqual($PreviousInteractiveElement, null, "Data cell was passed: Null was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, getColumnHeader(0));
		assert.strictEqual($PreviousInteractiveElement, null, "Column header cell was passed: Null was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, getRowHeader(0));
		assert.strictEqual($PreviousInteractiveElement, null, "Row header cell was passed: Null was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, getSelectAll(0));
		assert.strictEqual($PreviousInteractiveElement, null, "SelectAll cell was passed: Null was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable);
		assert.strictEqual($PreviousInteractiveElement, null, "No interactive element was passed: Null was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement();
		assert.strictEqual($PreviousInteractiveElement, null, "No parameter was passed: Null was returned");
	});

	QUnit.test("_getNextInteractiveElement", function(assert) {
		var $FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);

		var $NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, $FirstInteractiveElement);
		assert.strictEqual($NextInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0].value, "Focus&NoTabInput1", "The correct next element was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, $NextInteractiveElement);
		assert.strictEqual($NextInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"The correct next element was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, $NextInteractiveElement);
		assert.strictEqual($NextInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[1],
			"The correct next element was returned");

		var $LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement(oTable.getRows()[0]);
		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, $LastInteractiveElement);
		assert.strictEqual($NextInteractiveElement, null,
			"(jQuery) Getting the next interactive element of the last interactive element: Null was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, $FirstInteractiveElement[0]);
		assert.strictEqual($NextInteractiveElement.length, 1, "(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0].value, "Focus&NoTabInput1", "The correct next element was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, $NextInteractiveElement[0]);
		assert.strictEqual($NextInteractiveElement.length, 1, "(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"The correct next element was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, $NextInteractiveElement[0]);
		assert.strictEqual($NextInteractiveElement.length, 1, "(HTMLElement) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($NextInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[1],
			"The correct next element was returned");

		$LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement(oTable.getRows()[0]);
		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, $LastInteractiveElement[0]);
		assert.strictEqual($NextInteractiveElement, null,
			"(HTMLElement) Getting the next interactive element of the last interactive element: Null was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, getCell(0, 0));
		assert.strictEqual($NextInteractiveElement, null, "Data cell was passed: Null was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, getColumnHeader(0));
		assert.strictEqual($NextInteractiveElement, null, "Column header cell was passed: Null was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, getRowHeader(0));
		assert.strictEqual($NextInteractiveElement, null, "Row header cell was passed: Null was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, getSelectAll(0));
		assert.strictEqual($NextInteractiveElement, null, "SelectAll cell was passed: Null was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable);
		assert.strictEqual($NextInteractiveElement, null, "No interactive element was passed: Null was returned");

		$NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement();
		assert.strictEqual($NextInteractiveElement, null, "No parameter was passed: Null was returned");
	});

	QUnit.module("Basics", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("getInterface", function(assert) {
		var oDelegate = new KeyboardDelegate();
		assert.ok(oDelegate === oDelegate.getInterface(), "getInterface returns the object itself");
	});

	QUnit.module("Navigation > Tab & Shift+Tab", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Default Test Table", function(assert) {
		var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getCell(0, 1), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
		oElem = checkFocus(getCell(1, 1), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(document.getElementById("Focus2"), assert);

		simulateTabEvent(oElem, true);
		checkFocus(getCell(1, 1), assert);

		oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		simulateTabEvent(oElem, false);
		checkFocus(getCell(1, 1), assert);

		oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(1), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, false, false, false);
		oElem = checkFocus(getColumnHeader(2), assert);
		simulateTabEvent(oElem, false);
		checkFocus(getCell(1, 2), assert);
	});

	QUnit.test("Row Actions", function(assert) {
		initRowActions(oTable, 1, 1);
		oCore.applyChanges();
		var oElem = checkFocus(getRowAction(1, true), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(document.getElementById("Focus2"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(getRowAction(1), assert);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.test("Extension and Footer", function(assert) {
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		oCore.applyChanges();

		var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(document.getElementById("Footer"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(getCell(0, 0), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, false, false, false);
		oElem = checkFocus(getRowHeader(0), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(getSelectAll(0), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(document.getElementById("Extension"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(document.getElementById("Focus1"), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(document.getElementById("Extension"), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getSelectAll(0), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getRowHeader(0), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(document.getElementById("Footer"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(document.getElementById("Focus2"), assert);

		oTable.setColumnHeaderVisible(false);
		oCore.applyChanges();
		oElem = getCell(1, 1, true);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Extension"), assert);
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

	QUnit.test("No cells", function(assert) {
		var oElem;

		oTable.setColumnHeaderVisible(false);
		oTable.getRowMode().setRowCount(0);
		oCore.applyChanges();

		oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem);
		oElem = checkFocus(document.getElementById("Focus2"), assert);

		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.test("No content cells", function(assert) {
		var oElem;

		oTable.getRowMode().setRowCount(0);
		oCore.applyChanges();

		oElem = checkFocus(getColumnHeader(0, true), assert);
		simulateTabEvent(oElem);
		oElem = checkFocus(document.getElementById("Focus2"), assert);

		simulateTabEvent(oElem, true);
		checkFocus(getColumnHeader(0), assert);
	});

	QUnit.test("CreationRow when hideEmptyRows is set to true", function(assert) {
		var oElem, oCreationRow, oInput, oApplyButton;

		oTable.getRowMode().setRowCount(5);
		oTable.setAggregation("rowMode", new FixedRowMode().setHideEmptyRows(true));
		oTable.getColumns()[0].setCreationTemplate(new TestInputControl({text: "test"}));
		oCreationRow = new CreationRow();
		oTable.setCreationRow(oCreationRow);
		oTable.unbindRows();
		oCore.applyChanges();

		oElem = checkFocus(getColumnHeader(0, true), assert);
		simulateTabEvent(oElem);

		oInput = KeyboardDelegate._getFirstInteractiveElement(oTable.getCreationRow())[0];
		oElem = checkFocus(oInput, assert);
		simulateTabEvent(oElem);

		oApplyButton = document.getElementById(oCreationRow.getId() + "-applyBtn");
		oElem = checkFocus(oApplyButton, assert);
		simulateTabEvent(oElem);

		oElem = checkFocus(document.getElementById("Focus2"), assert);
		simulateTabEvent(oElem, true);

		oElem = checkFocus(oApplyButton, assert);
		simulateTabEvent(oElem, true);

		oElem = checkFocus(oInput, assert);
		simulateTabEvent(oElem, true);
		checkFocus(getColumnHeader(0), assert);
	});

	QUnit.module("Navigation > Arrow Keys", {
		beforeEach: function() {
			renderFocusDummy("FocusDummyBeforeTable");

			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E", "F"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			// The KeyboardDelegate does not handle navigation to the right. The ItemNavigation handles onsapnext (onsapprevious in RTL).
			var bRTL = oCore.getConfiguration().getRTL();
			var mKeyInfo = {};
			mKeyInfo[Key.Arrow.UP] = {eventName: "onsapup", keyName: "ArrowUp"};
			mKeyInfo[Key.Arrow.DOWN] = {eventName: "onsapdown", keyName: "ArrowDown"};
			mKeyInfo[Key.Arrow.LEFT] = {eventName: bRTL ? "onsapprevious" : "onsapleft", keyName: "ArrowLeft"};
			mKeyInfo[Key.Arrow.RIGHT] = {eventName: bRTL ? "onsapleft" : "onsapnext", keyName: "ArrowRight"};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
			removeFocusDummies();
		},
		/**
		 * Navigates all around the table using the arrow keys, takes virtual vertical scrolling into account.
		 * Start from the left top cell -> to the right top cell -> to the right bottom cell -> to the left bottom cell -> to the left top cell.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @private
		 */
		testArrowKeys: function(assert) {
			var mRowCounts = this.oTable._getRowCounts();
			var bHasColumnHeaders = this.oTable.getColumnHeaderVisible();
			var bHasRowHeaders = TableUtils.hasRowHeader(this.oTable);
			var bHasRowActions = TableUtils.hasRowActions(this.oTable);
			var iColumnCount = this.oTable._getVisibleColumns().length;
			var iRowCount = window.iNumberOfRows;
			/**
			 *  @deprecated As of version 1.119.
			 */
			iRowCount = (this.oTable.getGroupBy && this.oTable.getGroupBy()) ? 2 * window.iNumberOfRows : window.iNumberOfRows;
			var oTarget, i, iRowIndex, oRow;

			oTarget = TableQUnitUtils.setFocusOutsideOfTable(assert, "FocusDummyBeforeTable");
			simulateTabEvent(oTarget, false);

			if (bHasColumnHeaders) {
				oTarget = this.oTable.qunit.getColumnHeaderCell(0);
			} else {
				oTarget = this.oTable.qunit.getDataCell(0, 0);
			}

			if (bHasRowHeaders) {
				if (bHasColumnHeaders) {
					this.triggerKey(Key.Arrow.LEFT, oTarget, this.oTable.qunit.getSelectAllCell());
					oTarget = this.oTable.qunit.getSelectAllCell();
				} else {
					this.triggerKey(Key.Arrow.LEFT, oTarget, this.oTable.qunit.getRowHeaderCell(0));
					oTarget = this.oTable.qunit.getRowHeaderCell(0);
				}
			}

			this.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			this.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);

			for (i = bHasRowHeaders ? 0 : 1; i < iColumnCount; i++) {
				if (bHasColumnHeaders) {
					this.triggerKey(Key.Arrow.RIGHT, oTarget, this.oTable.qunit.getColumnHeaderCell(i));
					oTarget = this.oTable.qunit.getColumnHeaderCell(i);
				} else {
					this.triggerKey(Key.Arrow.RIGHT, oTarget, this.oTable.qunit.getDataCell(0, i));
					oTarget = this.oTable.qunit.getDataCell(0, i);
				}
			}

			if (!bHasColumnHeaders && bHasRowActions) {
				this.triggerKey(Key.Arrow.RIGHT, oTarget, this.oTable.qunit.getRowActionCell(0));
				oTarget = this.oTable.qunit.getRowActionCell(0);
			}

			this.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
			this.triggerKey(Key.Arrow.UP, oTarget, oTarget);

			// The row action column header cell should not be accessible by keyboard navigation.
			if (bHasColumnHeaders && bHasRowActions) {
				this.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
				this.triggerKey(Key.Arrow.DOWN, oTarget, this.oTable.qunit.getDataCell(0, -1));
				this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getRowActionCell(0));

				oTarget = this.oTable.qunit.getRowActionCell(0);
				this.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
				this.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			}

			for (i = (bHasColumnHeaders && !bHasRowActions) ? 0 : 1; i < iRowCount; i++) {
				iRowIndex = i;
				if (i >= mRowCounts.count - mRowCounts.fixedBottom && i < iRowCount - mRowCounts.fixedBottom) {
					iRowIndex = mRowCounts.count - mRowCounts.fixedBottom - 1;
				} else if (i >= iRowCount - mRowCounts.fixedBottom) {
					iRowIndex = i - (iRowCount - mRowCounts.count);
				}

				if (bHasRowActions) {
					this.triggerKey(Key.Arrow.DOWN, oTarget, this.oTable.qunit.getRowActionCell(iRowIndex));
					oTarget = this.oTable.qunit.getRowActionCell(iRowIndex);
				} else {
					this.triggerKey(Key.Arrow.DOWN, oTarget, this.oTable.qunit.getDataCell(iRowIndex, -1));
					oTarget = this.oTable.qunit.getDataCell(iRowIndex, -1);
				}

				oRow = this.oTable.getRows()[iRowIndex];
				assert.equal(oRow.getIndex(), i, "Row index is: " + i);
			}

			this.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
			this.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);

			var iStartIndex = iColumnCount - (bHasRowActions ? 1 : 2);
			/**
			 *  @deprecated As of version 1.119.
			 */
			iStartIndex = iColumnCount - (bHasRowActions || this.oTable.getGroupBy() ? 1 : 2);
			var iEndIndex = 0;
			/**
			 *  @deprecated As of version 1.119.
			 */
			iEndIndex = (this.oTable.getGroupBy && this.oTable.getGroupBy()) ? 1 : 0;

			for (i = iStartIndex; i >= iEndIndex; i--) {
				this.triggerKey(Key.Arrow.LEFT, oTarget, this.oTable.qunit.getDataCell(-1, i));
				oTarget = this.oTable.qunit.getDataCell(-1, i);
			}

			if (bHasRowHeaders) {
				this.triggerKey(Key.Arrow.LEFT, oTarget, this.oTable.qunit.getRowHeaderCell(-1));
				oTarget = this.oTable.qunit.getRowHeaderCell(-1);
			}

			this.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			this.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);

			for (i = iRowCount - 2; i >= 0; i--) {
				iRowIndex = i;
				if (i >= mRowCounts.fixedTop && i < iRowCount - mRowCounts.count + mRowCounts.fixedTop + 1) {
					iRowIndex = mRowCounts.fixedTop;
				} else if (i >= iRowCount - mRowCounts.count + mRowCounts.fixedTop + 1) {
					iRowIndex = i - (iRowCount - mRowCounts.count);
				}

				if (bHasRowHeaders) {
					this.triggerKey(Key.Arrow.UP, oTarget, this.oTable.qunit.getRowHeaderCell(iRowIndex));
					oTarget = this.oTable.qunit.getRowHeaderCell(iRowIndex);
				} else {
					this.triggerKey(Key.Arrow.UP, oTarget, this.oTable.qunit.getDataCell(iRowIndex, 0));
					oTarget = this.oTable.qunit.getDataCell(iRowIndex, 0);
				}

				oRow = this.oTable.getRows()[iRowIndex];
				assert.equal(oRow.getIndex(), i, "Row index is: " + i);
			}

			if (bHasColumnHeaders) {
				if (bHasRowHeaders) {
					this.triggerKey(Key.Arrow.UP, oTarget, this.oTable.qunit.getSelectAllCell());
				} else {
					this.triggerKey(Key.Arrow.UP, oTarget, this.oTable.qunit.getColumnHeaderCell(0));
				}
			}
		},
		/**
		 * Updates the row states based on the defined states set in aStates array
		 *
		 * @param {Object} aStates Array of row states.
		 * @private
		 */
		setRowStates: function(aStates) {
			var i = 0;

			function updateRowState(oState) {
				Object.assign(oState, aStates[i]);
				i++;
			}

			TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState);
			this.oTable.getBinding().refresh(true);

			return this.oTable.qunit.whenRenderingFinished().then(function() {
				TableUtils.Hook.deregister(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState);
			}.bind(this));
		}
	});

	/**
	 * @deprecated As of version 1.28
	 */
	QUnit.test("Grouped", function(assert) {
		var oTable = this.oTable;
		var oRow = oTable.getRows()[0];
		var aRowInfo = [{
			title: "A",
			state: {type: oRow.Type.Standard, expandable: true, expanded: true},
			expectContentHidden: false
		}, {
			title: "B",
			state: {type: oRow.Type.Standard, expandable: true, expanded: true},
			expectContentHidden: true
		}, {
			title: "C",
			state: {type: oRow.Type.GroupHeader, expandable: true, expanded: true},
			expectContentHidden: true
		}, {
			title: "D",
			state: {type: oRow.Type.Summary, expandable: true, expanded: true},
			expectContentHidden: true
		}, {
			title: "E",
			state: {type: oRow.Type.Standard, expandable: true, expanded: true},
			expectContentHidden: true
		}, {
			title: "F",
			state: {type: oRow.Type.Standard, expandable: true, expanded: true},
			expectContentHidden: true
		}];

		this.setRowStates(aRowInfo.map(function(mRowInfo) {
			return mRowInfo.state;
		}));
		oCore.applyChanges();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.testArrowKeys(assert);
		}.bind(this));
	});

	QUnit.test("Fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(1);
		oCore.applyChanges();

		this.testArrowKeys(assert);
	});

	QUnit.test("Fixed columns + fixed rows", function(assert) {
		this.oTable.setFixedColumnCount(1);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		oCore.applyChanges();

		this.testArrowKeys(assert);
	});

	QUnit.test("No Row Header", function(assert) {
		this.oTable.setSelectionMode(library.SelectionMode.None);
		oCore.applyChanges();

		this.testArrowKeys(assert);
	});

	QUnit.test("No Column Header", function(assert) {
		this.oTable.setColumnHeaderVisible(false);
		oCore.applyChanges();

		this.testArrowKeys(assert);
	});

	QUnit.test("Row Actions", function(assert) {
		initRowActions(this.oTable, 1, 1);
		this.testArrowKeys(assert);
	});

	QUnit.test("Fixed columns + fixed rows + row header + column header + row actions", function(assert) {
		initRowActions(this.oTable, 1, 1);
		this.oTable.setFixedColumnCount(1);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		oCore.applyChanges();

		this.testArrowKeys(assert);
	});

	QUnit.test("Multi header", function(assert) {
		var that = this;

		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		this.oTable.getColumns()[1].setHeaderSpan([2, 1]);
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
		oCore.applyChanges();

		function getMultiHeader(iColumnIndex) {
			return document.getElementById(that.oTable.qunit.getColumnHeaderCell(iColumnIndex).getAttribute("id") + "_1");
		}

		simulateTabEvent(TableQUnitUtils.setFocusOutsideOfTable(assert, "FocusDummyBeforeTable"), false);
		this.triggerKey(Key.Arrow.DOWN, this.oTable.qunit.getColumnHeaderCell(0), getMultiHeader(0));
		this.triggerKey(Key.Arrow.RIGHT, getMultiHeader(0), getMultiHeader(1));
		this.triggerKey(Key.Arrow.UP, getMultiHeader(1), this.oTable.qunit.getColumnHeaderCell(1));
		this.triggerKey(Key.Arrow.DOWN, this.oTable.qunit.getColumnHeaderCell(1), getMultiHeader(1));
		this.triggerKey(Key.Arrow.RIGHT, getMultiHeader(1), getMultiHeader(2));
		this.triggerKey(Key.Arrow.UP, getMultiHeader(2), this.oTable.qunit.getColumnHeaderCell(1));
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getColumnHeaderCell(1), this.oTable.qunit.getColumnHeaderCell(3));
		this.triggerKey(Key.Arrow.DOWN, this.oTable.qunit.getColumnHeaderCell(3), getMultiHeader(3));
		this.triggerKey(Key.Arrow.LEFT, getMultiHeader(3), getMultiHeader(2));
		this.triggerKey(Key.Arrow.UP, getMultiHeader(2), this.oTable.qunit.getColumnHeaderCell(1));
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getColumnHeaderCell(1), this.oTable.qunit.getColumnHeaderCell(0));
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getSelectAllCell());
		this.triggerKey(Key.Arrow.DOWN, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getRowHeaderCell(0));
	});

	QUnit.test("Multi header + row actions", function(assert) {
		initRowActions(this.oTable, 1, 1);
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		this.oTable.getColumns()[1].setHeaderSpan([2, 1]);
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
		oCore.applyChanges();

		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(-1));
		this.triggerKey(Key.Arrow.RIGHT,
			document.getElementById(this.oTable.qunit.getColumnHeaderCell(-1).getAttribute("id") + "_1"),
			document.getElementById(this.oTable.qunit.getColumnHeaderCell(-1).getAttribute("id") + "_1"));
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("On a non-interactive element inside a cell", function(assert) {
		var oNonInteractiveElement = this.oTable.getRows()[1].getCells()[1].getDomRef();

		oNonInteractiveElement.tabIndex = -1;
		this.triggerKey(Key.Arrow.UP, oNonInteractiveElement, this.oTable.qunit.getDataCell(1, 1),
			{defaultPrevented: false, propagationStopped: false});
		this.triggerKey(Key.Arrow.DOWN, oNonInteractiveElement, this.oTable.qunit.getDataCell(1, 1),
			{defaultPrevented: false, propagationStopped: false});
	});

	QUnit.test("Variable row heights", function(assert) {
		this.oTable._bVariableRowHeightEnabled = true;
		this.oTable.invalidate();
		oCore.applyChanges();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.testArrowKeys(assert);
		}.bind(this));
	});

	QUnit.module("Navigation > Ctrl+Arrow Keys", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			var mKeyInfo = {};
			var bRTL = oCore.getConfiguration().getRTL();
			mKeyInfo[Key.Arrow.UP] = {eventName: "onsapupmodifiers", keyName: "ArrowUp", ctrl: true};
			mKeyInfo[Key.Arrow.DOWN] = {eventName: "onsapdownmodifiers", keyName: "ArrowDown", ctrl: true};
			mKeyInfo[Key.Arrow.LEFT] = {eventName: bRTL ? "onsaprightmodifiers" : "onsapleftmodifiers", keyName: "ArrowLeft", ctrl: true};
			mKeyInfo[Key.Arrow.RIGHT] = {eventName: bRTL ? "onsapleftmodifiers" : "onsaprightmodifiers", keyName: "ArrowRight", ctrl: true};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("On a data", function(assert) {
		this.triggerKey(Key.Arrow.DOWN, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(1, 0));
		this.triggerKey(Key.Arrow.UP, this.oTable.qunit.getDataCell(1, 0), this.oTable.qunit.getDataCell(0, 0));
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 1));
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getDataCell(0, 1), this.oTable.qunit.getDataCell(0, 0));
	});

	QUnit.module("Navigation > Shift+Arrow Keys", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			var mKeyInfo = {};
			var bRTL = oCore.getConfiguration().getRTL();
			mKeyInfo[Key.Arrow.UP] = {eventName: "onsapupmodifiers", keyName: "ArrowUp", shift: true};
			mKeyInfo[Key.Arrow.DOWN] = {eventName: "onsapdownmodifiers", keyName: "ArrowDown", shift: true};
			mKeyInfo[Key.Arrow.LEFT] = {eventName: bRTL ? "onsaprightmodifiers" : "onsapleftmodifiers", keyName: "ArrowLeft", shift: true};
			mKeyInfo[Key.Arrow.RIGHT] = {eventName: bRTL ? "onsapleftmodifiers" : "onsaprightmodifiers", keyName: "ArrowRight", shift: true};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Inside Header (Range Selection, Column Resizing)", function(assert) {
		var that = this;
		var oTarget;

		function test() {
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
		}

		// Range Selection
		oTarget = this.oTable.qunit.getSelectAllCell();
		oTarget.focus();
		qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.
		test();
		qutils.triggerKeyup(oTarget, Key.SHIFT, false, false, false); // End selection mode.

		oTarget = this.oTable.qunit.getColumnHeaderCell(0);
		oTarget.focus();
		qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.
		test();
		qutils.triggerKeyup(oTarget, Key.SHIFT, false, false, false); // End selection mode.

		// Column Resizing
		oTarget = this.oTable.qunit.getSelectAllCell();
		test();

		oTarget = this.oTable.qunit.getColumnHeaderCell(0);
		test();
	});

	QUnit.test("Inside Row Header, Fixed Rows (Range Selection)", function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowSelector);
		oCore.applyChanges();

		var that = this;
		var oTarget = this.oTable.qunit.getRowHeaderCell(0);

		function navigate(sKey, iDestinationRowIndex, iExpectedAbsoluteRowIndex, bExpectRowsUpdate) {
			var oDestination = that.oTable.qunit.getRowHeaderCell(iDestinationRowIndex);
			var pTriggerKey = that.triggerKey(sKey, oTarget, oDestination, {rowsUpdate: bExpectRowsUpdate});

			function test() {
				oTarget = oDestination;
				assert.equal(that.oTable.getRows()[iDestinationRowIndex].getIndex(), iExpectedAbsoluteRowIndex, "Row index");
			}

			if (bExpectRowsUpdate) {
				return pTriggerKey.then(function() {
					test();
				});
			} else {
				test();
			}
		}

		return Promise.resolve().then(function() {
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.

			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);

			assert.ok(true, "[INFO] Navigate from top to bottom");
			navigate(Key.Arrow.DOWN, 1, 1);
			navigate(Key.Arrow.DOWN, 2, 2);
			navigate(Key.Arrow.DOWN, 3, 3);
			return navigate(Key.Arrow.DOWN, 3, 4, true);
		}).then(function() {
			return navigate(Key.Arrow.DOWN, 3, 5, true);
		}).then(function() {
			navigate(Key.Arrow.DOWN, 4, 6);
			navigate(Key.Arrow.DOWN, 5, 7);
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);

			assert.ok(true, "[INFO] Navigate from bottom to top");
			navigate(Key.Arrow.UP, 4, 6);
			navigate(Key.Arrow.UP, 3, 5);
			navigate(Key.Arrow.UP, 2, 4);
			return navigate(Key.Arrow.UP, 2, 3, true);
		}).then(function() {
			return navigate(Key.Arrow.UP, 2, 2, true);
		}).then(function() {
			navigate(Key.Arrow.UP, 1, 1);
			navigate(Key.Arrow.UP, 0, 0);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
			qutils.triggerKeyup(oTarget, Key.SHIFT, false, false, false); // End selection mode.

			assert.ok(true, "[INFO] SelectionMode = Single");
			that.oTable.setSelectionMode(library.SelectionMode.Single);
			oCore.applyChanges();
			oTarget = that.oTable.qunit.getRowHeaderCell(1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);

			assert.ok(true, "[INFO] SelectionMode = None");
			qutils.triggerKeyup(oTarget, Key.SHIFT, false, false, false); // End selection mode.
			that.oTable.setSelectionMode(library.SelectionMode.None);
			oCore.applyChanges();
			oTarget = that.oTable.qunit.getRowHeaderCell(1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
		});
	});

	QUnit.test("Inside Data Rows, Fixed Rows (Range Selection)", function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		oCore.applyChanges();

		var that = this;
		var oTarget = this.oTable.qunit.getDataCell(0, 0);

		function navigate(sKey, iDestinationRowIndex, iExpectedAbsoluteRowIndex, iDestinationColumnIndex, bExpectRowsUpdate) {
			var oDestination = that.oTable.qunit.getDataCell(iDestinationRowIndex, iDestinationColumnIndex);
			var pTriggerKey = that.triggerKey(sKey, oTarget, oDestination, {rowsUpdate: bExpectRowsUpdate});

			function test() {
				oTarget = oDestination;
				assert.equal(that.oTable.getRows()[iDestinationRowIndex].getIndex(), iExpectedAbsoluteRowIndex, "Row index");
			}

			if (bExpectRowsUpdate) {
				return pTriggerKey.then(function() {
					test();
				});
			} else {
				test();
			}
		}

		return Promise.resolve().then(function() {
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.

			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);

			assert.ok(true, "[INFO] Navigate from left to right");
			navigate(Key.Arrow.RIGHT, 0, 0, 1);
			navigate(Key.Arrow.RIGHT, 0, 0, 2);
			navigate(Key.Arrow.RIGHT, 0, 0, 3);
			navigate(Key.Arrow.RIGHT, 0, 0, 4);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);

			assert.ok(true, "[INFO] Navigate from top to bottom");
			navigate(Key.Arrow.DOWN, 1, 1, 4);
			navigate(Key.Arrow.DOWN, 2, 2, 4);
			navigate(Key.Arrow.DOWN, 3, 3, 4);
			return navigate(Key.Arrow.DOWN, 3, 4, 4, true);
		}).then(function() {
			return navigate(Key.Arrow.DOWN, 3, 5, 4, true);
		}).then(function() {
			navigate(Key.Arrow.DOWN, 4, 6, 4);
			navigate(Key.Arrow.DOWN, 5, 7, 4);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);

			assert.ok(true, "[INFO] Navigate from right to left");
			navigate(Key.Arrow.LEFT, 5, 7, 3);
			navigate(Key.Arrow.LEFT, 5, 7, 2);
			navigate(Key.Arrow.LEFT, 5, 7, 1);
			navigate(Key.Arrow.LEFT, 5, 7, 0);

			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);

			assert.ok(true, "[INFO] Navigate from bottom to top");
			navigate(Key.Arrow.UP, 4, 6, 0);
			navigate(Key.Arrow.UP, 3, 5, 0);
			navigate(Key.Arrow.UP, 2, 4, 0);
			return navigate(Key.Arrow.UP, 2, 3, 0, true);
		}).then(function() {
			return navigate(Key.Arrow.UP, 2, 2, 0, true);
		}).then(function() {
			navigate(Key.Arrow.UP, 1, 1, 0);
			navigate(Key.Arrow.UP, 0, 0, 0);

			assert.ok(true, "[INFO] SelectionBehavior = RowSelector");
			qutils.triggerKeyup(oTarget, Key.SHIFT, false, false, false); // End selection mode.
			that.oTable.setSelectionBehavior(library.SelectionBehavior.RowSelector);
			oCore.applyChanges();
			oTarget = that.oTable.qunit.getDataCell(1, 1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.
			navigate(Key.Arrow.DOWN, 2, 2, 1);
			navigate(Key.Arrow.UP, 1, 1, 1);
			navigate(Key.Arrow.LEFT, 1, 1, 0);
			navigate(Key.Arrow.RIGHT, 1, 1, 1);

			assert.ok(true, "[INFO] SelectionMode = Single");
			qutils.triggerKeyup(oTarget, Key.SHIFT, false, false, false); // End selection mode.
			that.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
			that.oTable.setSelectionMode(library.SelectionMode.Single);
			oCore.applyChanges();
			oTarget = that.oTable.qunit.getDataCell(1, 1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);

			assert.ok(true, "[INFO] SelectionMode = None");
			qutils.triggerKeyup(oTarget, Key.SHIFT, false, false, false); // End selection mode.
			that.oTable.setSelectionMode(library.SelectionMode.None);
			oCore.applyChanges();
			oTarget = that.oTable.qunit.getDataCell(1, 1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
		});
	});

	QUnit.test("Inside Row Actions, Fixed Rows (Range Selection)", function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		initRowActions(this.oTable, 1, 1);

		var that = this;
		var oTarget = this.oTable.qunit.getRowActionCell(0);

		function navigate(sKey, iDestinationRowIndex, iExpectedAbsoluteRowIndex, bExpectRowsUpdate) {
			var oDestination = that.oTable.qunit.getRowActionCell(iDestinationRowIndex);
			var pTriggerKey = that.triggerKey(sKey, oTarget, oDestination, {rowsUpdate: bExpectRowsUpdate});

			function test() {
				oTarget = oDestination;
				assert.equal(that.oTable.getRows()[iDestinationRowIndex].getIndex(), iExpectedAbsoluteRowIndex, "Row index");
			}

			if (bExpectRowsUpdate) {
				return pTriggerKey.then(function() {
					test();
				});
			} else {
				test();
			}
		}

		return Promise.resolve().then(function() {
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.

			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);

			assert.ok(true, "[INFO] Navigate from top to bottom");
			navigate(Key.Arrow.DOWN, 1, 1);
			navigate(Key.Arrow.DOWN, 2, 2);
			navigate(Key.Arrow.DOWN, 3, 3);
			return navigate(Key.Arrow.DOWN, 3, 4, true);
		}).then(function() {
			return navigate(Key.Arrow.DOWN, 3, 5, true);
		}).then(function() {
			navigate(Key.Arrow.DOWN, 4, 6);
			navigate(Key.Arrow.DOWN, 5, 7);

			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);

			assert.ok(true, "[INFO] Navigate from bottom to top");
			navigate(Key.Arrow.UP, 4, 6);
			navigate(Key.Arrow.UP, 3, 5);
			navigate(Key.Arrow.UP, 2, 4);
			return navigate(Key.Arrow.UP, 2, 3, true);
		}).then(function() {
			return navigate(Key.Arrow.UP, 2, 2, true);
		}).then(function() {
			navigate(Key.Arrow.UP, 1, 1);
			navigate(Key.Arrow.UP, 0, 0);

			assert.ok(true, "[INFO] SelectionBehavior = RowSelector");
			qutils.triggerKeyup(oTarget, Key.SHIFT, false, false, false); // End selection mode.
			that.oTable.setSelectionBehavior(library.SelectionBehavior.RowSelector);
			oCore.applyChanges();
			oTarget = that.oTable.qunit.getRowActionCell(1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.
			navigate(Key.Arrow.DOWN, 2, 2);
			navigate(Key.Arrow.UP, 1, 1);

			assert.ok(true, "[INFO] SelectionMode = Single");
			qutils.triggerKeyup(oTarget, Key.SHIFT, false, false, false); // End selection mode.
			that.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
			that.oTable.setSelectionMode(library.SelectionMode.Single);
			oCore.applyChanges();
			oTarget = that.oTable.qunit.getRowActionCell(1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);

			assert.ok(true, "[INFO] SelectionMode = None");
			qutils.triggerKeyup(oTarget, Key.SHIFT, false, false, false); // End selection mode.
			that.oTable.setSelectionMode(library.SelectionMode.None);
			oCore.applyChanges();
			oTarget = that.oTable.qunit.getRowActionCell(1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT, false, false, false); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
		});
	});

	QUnit.test("Move between Row Header and Row (Range Selection)", function(assert) {
		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.oTable.qunit.getRowHeaderCell(0).focus();
		qutils.triggerKeydown(this.oTable.qunit.getRowHeaderCell(0), Key.SHIFT, false, false, false); // Start selection mode.
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getDataCell(0, 0));
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getRowHeaderCell(0));
	});

	QUnit.test("Move between Row Actions and Row (Range Selection)", function(assert) {
		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		initRowActions(this.oTable, 1, 1);
		this.oTable.qunit.getRowActionCell(0).focus();
		qutils.triggerKeydown(this.oTable.qunit.getRowActionCell(0), Key.SHIFT, false, false, false); // Start selection mode.
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getDataCell(0, -1));
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.module("Navigation > Alt+Arrow Keys", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			var mKeyInfo = {};
			var bRTL = oCore.getConfiguration().getRTL();
			mKeyInfo[Key.Arrow.UP] = {eventName: "onsapupmodifiers", keyName: "ArrowUp", alt: true};
			mKeyInfo[Key.Arrow.DOWN] = {eventName: "onsapdownmodifiers", keyName: "ArrowDown", alt: true};
			mKeyInfo[Key.Arrow.LEFT] = {eventName: bRTL ? "onsaprightmodifiers" : "onsapleftmodifiers", keyName: "ArrowLeft", alt: true};
			mKeyInfo[Key.Arrow.RIGHT] = {eventName: bRTL ? "onsapleftmodifiers" : "onsaprightmodifiers", keyName: "ArrowRight", alt: true};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("On a data cell", function(assert) {
		this.triggerKey(Key.Arrow.DOWN, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));
		this.triggerKey(Key.Arrow.UP, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));
	});

	QUnit.module("Navigation > Home & End", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			var mKeyInfo = {};
			mKeyInfo[Key.HOME] = {eventName: "onsaphome", keyName: "Home"};
			mKeyInfo[Key.END] = {eventName: "onsapend", keyName: "End"};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Element outside the grid", function(assert) {
		var oInput = new TestInputControl({tabbable: true});
		this.oTable.addExtension(oInput);
		oCore.applyChanges();

		this.triggerKey(Key.HOME, oInput.getDomRef(), oInput.getDomRef(), {defaultPrevented: false, propagationStopped: false});
		this.triggerKey(Key.END, oInput.getDomRef(), oInput.getDomRef(), {defaultPrevented: false, propagationStopped: false});
	});

	QUnit.test("Column header", function(assert) {
		// First cell
		// *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getSelectAllCell());

		// *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getSelectAllCell());

		// *END* -> First cell
		this.triggerKey(Key.END, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(-1));

		// *END* -> Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(-1));

		// *HOME* -> First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(0));
	});

	QUnit.test("Column header; No row selection", function(assert) {
		this.oTable.setSelectionMode(library.SelectionMode.None);
		oCore.applyChanges();

		// First cell
		// *HOME* -> First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(-1));

		// *END* -> Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(-1));

		// *HOME* -> First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(0));
	});

	QUnit.test("Column header; 1 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(1);
		oCore.applyChanges();

		// Fixed area - Single cell
		// *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getSelectAllCell());

		// *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getSelectAllCell());

		// *END* -> Fixed area - Single cell
		this.triggerKey(Key.END, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(-1));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(-1));

		// *HOME* -> Non-Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(this.oTable.getFixedColumnCount()));

		// *HOME* -> Fixed area - Single cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(this.oTable.getFixedColumnCount()), this.oTable.qunit.getColumnHeaderCell(0));
	});

	QUnit.test("Column header; 1 (of 5) fixed columns with row actions", function(assert) {
		this.oTable.setFixedColumnCount(1);
		initRowActions(this.oTable, 2, 2);

		// First Non-Fixed area - First Column Header
		// *END* -> Non-Fixed area - Last Column Header
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(1), this.oTable.qunit.getColumnHeaderCell(-1));

		// *HOME* -> Non-Fixed area - First Column Header
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(1));

		// *HOME* -> Fixed area - Single Column Header
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(1), this.oTable.qunit.getColumnHeaderCell(0));
	});

	QUnit.test("Column header; 2 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(2);
		oCore.applyChanges();

		// Fixed area - First cell
		// *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getSelectAllCell());

		// *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getSelectAllCell());

		// *END* -> Fixed area - First cell
		this.triggerKey(Key.END, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(1));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(1), this.oTable.qunit.getColumnHeaderCell(-1));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(-1));

		// *HOME* -> Non-Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(2));

		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(2), this.oTable.qunit.getColumnHeaderCell(0));
	});

	QUnit.test("Column header; 4 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(4);
		oCore.applyChanges();

		// Non-Fixed area - Single cell
		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(3));

		// *END* -> Non-Fixed area - Single cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(3), this.oTable.qunit.getColumnHeaderCell(-1));
	});

	QUnit.test("Column header; 5 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(5);
		oCore.applyChanges();

		// Fixed area - Last cell
		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(4));
	});

	QUnit.test("Content", function(assert) {
		// First cell
		// *HOME* -> Selection cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getRowHeaderCell(0));

		// *HOME* -> Selection cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getRowHeaderCell(0));

		// *END* -> First cell
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, -1));

		// *END* -> Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, -1));

		// *HOME* -> First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, 0));
	});

	QUnit.test("Content; No row selection", function(assert) {
		this.oTable.setSelectionMode(library.SelectionMode.None);
		oCore.applyChanges();

		// First cell
		// *HOME* -> First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, -1));

		// *END* -> Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, -1));

		// *HOME* -> First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, 0));
	});

	QUnit.test("Content; 1 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(1);
		oCore.applyChanges();

		// Fixed area - Single cell
		// *HOME* -> Selection cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getRowHeaderCell(0));

		// *HOME* -> Selection cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getRowHeaderCell(0));

		// *END* -> Fixed area - Single cell
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, -1));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, -1));

		// *HOME* -> Non-Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, 1));

		// *HOME* -> Fixed area - Single cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 1), this.oTable.qunit.getDataCell(0, 0));
	});

	QUnit.test("Content; 2 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(2);
		oCore.applyChanges();

		// Fixed area - First cell
		// *HOME* -> Selection cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getRowHeaderCell(0));

		// *HOME* -> Selection cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getRowHeaderCell(0));

		// *END* -> Fixed area - First cell
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 1));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 1), this.oTable.qunit.getDataCell(0, -1));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, -1));

		// *HOME* -> Non-Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, 2));

		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 2), this.oTable.qunit.getDataCell(0, 0));
	});

	QUnit.test("Content; 4 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(4);
		oCore.applyChanges();

		// Non-Fixed area - Single cell
		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 3));

		// *END* -> Non-Fixed area - Single cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 3), this.oTable.qunit.getDataCell(0, -1));
	});

	QUnit.test("Content; 5 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(5);
		oCore.applyChanges();

		// Fixed area - Last cell
		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 4));
	});

	QUnit.test("Row action", function(assert) {
		initRowActions(this.oTable, 2, 2);

		// Row Action
		// *END* -> Row Action
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

		// *HOME* -> First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, -1));

		// *END* -> Row Action
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("Row action; 1 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(1);
		initRowActions(this.oTable, 2, 2);

		// Row Action
		// *END* -> Row Action
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

		// *HOME* -> Non-Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getDataCell(0, 1));

		// *HOME* -> Fixed area - Single cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 1), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, -1));

		// *END* -> Row Action
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("Row action; 2 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(2);
		initRowActions(this.oTable, 2, 2);

		// Row Action
		// *END* -> Row Action
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

		// *HOME* -> Non-Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getDataCell(0, 2));

		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 2), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 1));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 1), this.oTable.qunit.getDataCell(0, -1));

		// *END* -> Row Action
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("Row action; 5 (of 5) fixed columns", function(assert) {
		this.oTable.setFixedColumnCount(5);
		initRowActions(this.oTable, 2, 2);

		// Row Action
		// *END* -> Row Action
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

		// *HOME* -> First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, -1));

		// *END* -> Row Action
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("Fixed columns with column span", function(assert) {
		var iColSpan = 2;

		this.oTable.setFixedColumnCount(4);
		this.oTable.getColumns()[2].setHeaderSpan([iColSpan]);
		oCore.applyChanges();

		// Fixed area - First cell
		// *END* -> Fixed area - Last cell (First cell of the span)
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(4 - iColSpan));

		// *END* -> Non-Fixed area - Single cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(4 - iColSpan), this.oTable.qunit.getColumnHeaderCell(-1));

		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(0));
	});

	QUnit.test("Fixed columns with multi header", function(assert) {
		var iColSpan = 2;
		var that = this;

		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		this.oTable.getColumns()[1].setHeaderSpan([iColSpan, 1]);
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
		this.oTable.getColumns()[3].setHeaderSpan([iColSpan, 1]);
		this.oTable.getColumns()[4].addMultiLabel(new TestControl({text: "d"}));
		this.oTable.getColumns()[4].addMultiLabel(new TestControl({text: "d2"}));
		this.oTable.setFixedColumnCount(3);
		oCore.applyChanges();

		function getMultiHeader(iColumnIndex) {
			return document.getElementById(that.oTable.qunit.getColumnHeaderCell(iColumnIndex).getAttribute("id") + "_1");
		}

		/* Test on first column header row */

		// Fixed area - First cell
		// *END* -> Fixed area - Last cell (First cell of the span)
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(3 - iColSpan));

		// *END* -> Non-Fixed area - Single cell (First cell of the span)
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(3 - iColSpan), this.oTable.qunit.getColumnHeaderCell(3));

		// *END* -> Non-Fixed area - Single cell (First cell of the span)
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(3), this.oTable.qunit.getColumnHeaderCell(3));

		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(3), this.oTable.qunit.getColumnHeaderCell(0));

		/* Test on second column header row */

		// Fixed area - First cell
		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, getMultiHeader(0), getMultiHeader(2));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, getMultiHeader(2), getMultiHeader(-1));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, getMultiHeader(-1), getMultiHeader(-1));

		// *HOME* -> Non-Fixed area - First cell
		this.triggerKey(Key.HOME, getMultiHeader(-1), getMultiHeader(3));

		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, getMultiHeader(3), getMultiHeader(0));
	});

	QUnit.test("Group Row Header", function(assert) {
		return fakeGroupRow(0, this.oTable).then(function() {
			// If the focus is on a group row header, the focus should not be changed by pressing Home or End.
			this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));
			this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));
		}.bind(this));
	});

	QUnit.module("Navigation > Ctrl+Home & Ctrl+End ", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E", "F"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			var mKeyInfo = {};
			mKeyInfo[Key.HOME] = {eventName: "onsaphomemodifiers", keyName: "Home", ctrl: true};
			mKeyInfo[Key.END] = {eventName: "onsapendmodifiers", keyName: "End", ctrl: true};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Row header column", function(assert) {
		var iTotalRowCount = this.oTable._getTotalRowCount();
		var iRowCount = this.oTable._getRowCounts().count;

		// SelectAll -> *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getSelectAllCell());

		// *END* -> Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getRowHeaderCell(-1));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *END* -> Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(-1), this.oTable.qunit.getRowHeaderCell(-1));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *HOME* -> SelectAll (scrolled to top)
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(-1), this.oTable.qunit.getSelectAllCell());
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");

		// Last row -> *END* -> Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(-1), this.oTable.qunit.getRowHeaderCell(-1));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");
	});

	QUnit.test("Row header column - Less data rows than rendered rows", function(assert) {
		this.oTable.getRowMode().setRowCount(10);
		oCore.applyChanges();

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);

		// SelectAll -> *END* -> Last row
		this.triggerKey(Key.END, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1));
		assert.equal(this.oTable.getRows()[iTotalRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *END* -> Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1), this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1));
		assert.equal(this.oTable.getRows()[iNonEmptyRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1), this.oTable.qunit.getSelectAllCell());
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");

		// Empty area - Last row -> *HOME* -> First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(-1), this.oTable.qunit.getRowHeaderCell(0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");
	});

	QUnit.test("Row header column - Less data rows than rendered rows and fixed rows", function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 12,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		oCore.applyChanges();

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var mRowCounts = this.oTable._getRowCounts();
		var iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);
		var iLastScrollableRowIndex = iNonEmptyRowCount - mRowCounts.fixedBottom - 1;
		var iLastDataRowIndex = iNonEmptyRowCount - 1;
		var iLastRowIndex = mRowCounts.fixedTop - 1;

		// SelectAll -> *END* -> Top fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getRowHeaderCell(iLastRowIndex));

		// *END* -> Scrollable area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(iLastRowIndex), this.oTable.qunit.getRowHeaderCell(iLastScrollableRowIndex));
		assert.equal(this.oTable.getRows()[iLastScrollableRowIndex].getIndex(), iTotalRowCount - mRowCounts.fixedBottom - 1, "Row index");

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(iLastScrollableRowIndex), this.oTable.qunit.getRowHeaderCell(iLastDataRowIndex));

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(iLastDataRowIndex), this.oTable.qunit.getRowHeaderCell(iLastDataRowIndex));

		// *HOME* -> Scrollable area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(iLastDataRowIndex), this.oTable.qunit.getRowHeaderCell(mRowCounts.fixedTop));
		assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Row index");

		// *HOME* -> Top fixed area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(mRowCounts.fixedTop), this.oTable.qunit.getRowHeaderCell(0));

		// *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getSelectAllCell());

		// Empty area - Last row -> *HOME* -> Scrollable area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(-1), this.oTable.qunit.getRowHeaderCell(mRowCounts.fixedTop));
		assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Row index");
	});

	QUnit.test("Row header column - No Column Header", function(assert) {
		this.oTable.setColumnHeaderVisible(false);
		oCore.applyChanges();

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var iRowCount = this.oTable._getRowCounts().count;

		// First row -> *HOME* -> First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getRowHeaderCell(0));

		// *END* -> Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getRowHeaderCell(iRowCount - 1));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *END* -> Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(iRowCount - 1), this.oTable.qunit.getRowHeaderCell(iRowCount - 1));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *HOME* -> First row (scrolled to top)
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(iRowCount - 1), this.oTable.qunit.getRowHeaderCell(0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");
	});

	QUnit.test("Row header column - Multi Header and Fixed Top/Bottom Rows", function(assert) {
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_1_1"}));
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_2_1"}));
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_3_1"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_1_1"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_1"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_2"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_1_1"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_2"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_3"}));
		this.oTable.getColumns()[0].setHeaderSpan([3, 2, 1]);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		oCore.applyChanges();

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var mRowCounts = this.oTable._getRowCounts();
		var iLastScrollableIndex = mRowCounts.count - mRowCounts.fixedBottom - 1;
		var iLastFixedTopIndex = mRowCounts.fixedTop - 1;

		// SelectAll -> *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getSelectAllCell());

		// *END* -> Top fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getRowHeaderCell(iLastFixedTopIndex));

		// *END* -> Scrollable area - Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(iLastFixedTopIndex), this.oTable.qunit.getRowHeaderCell(iLastScrollableIndex));
		assert.equal(this.oTable.getRows()[iLastScrollableIndex].getIndex(), iTotalRowCount - mRowCounts.fixedBottom - 1, "Row index");

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(iLastScrollableIndex), this.oTable.qunit.getRowHeaderCell(-1));

		// *ARROW_UP* -> Bottom fixed area - Second-last row
		qutils.triggerKeydown(this.oTable.qunit.getRowHeaderCell(-1), Key.Arrow.UP, false, false, false);
		checkFocus(this.oTable.qunit.getRowHeaderCell(-2), assert);

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(-2), this.oTable.qunit.getRowHeaderCell(-1));

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowHeaderCell(-1), this.oTable.qunit.getRowHeaderCell(-1));

		// *HOME* -> Scrollable area - First row (scrolled to top)
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(-1), this.oTable.qunit.getRowHeaderCell(mRowCounts.fixedTop));
		assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Row index");

		// *HOME* -> Top fixed area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(mRowCounts.fixedTop), this.oTable.qunit.getRowHeaderCell(0));

		// *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getSelectAllCell());

		// *END* -> Top fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getRowHeaderCell(iLastFixedTopIndex));

		// *HOME* -> SelectAll
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowHeaderCell(iLastFixedTopIndex), this.oTable.qunit.getSelectAllCell());
	});

	QUnit.test("Content column", function(assert) {
		var oTable = this.oTable;
		var iTotalRowCount = oTable._getTotalRowCount();
		var iRowCount = oTable._getRowCounts().count;
		var that = this;

		// *HOME* -> Header cell
		this.triggerKey(Key.HOME, oTable.qunit.getColumnHeaderCell(0), oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Last row (scrolled to bottom)
		this.triggerKey(Key.END, oTable.qunit.getColumnHeaderCell(0), oTable.qunit.getDataCell(-1, 0));
		assert.equal(oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oTable.getRows()[iRowCount - 1].getBindingContext().getProperty("A"), "A_7", "Row content");

			// *END* -> Last row
			that.triggerKey(Key.END, oTable.qunit.getDataCell(-1, 0), oTable.qunit.getDataCell(-1, 0));
			assert.equal(oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

			// *HOME* -> Header cell (scrolled to top)
			that.triggerKey(Key.HOME, oTable.qunit.getDataCell(-1, 0), oTable.qunit.getColumnHeaderCell(0));
			assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oTable.getRows()[0].getBindingContext().getProperty("A"), "A_0", "Row content");

			// Last row -> *END* -> Last row (scrolled to bottom)
			that.triggerKey(Key.END, oTable.qunit.getDataCell(-1, 0), oTable.qunit.getDataCell(-1, 0));
			assert.equal(oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");
		});
	});

	QUnit.test("Content column - Less data rows than rendered rows", function(assert) {
		this.oTable.getRowMode().setRowCount(10);
		oCore.applyChanges();

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var iRowCount = this.oTable._getRowCounts().count;
		var iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);

		// *END* -> Last row
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0));
		assert.equal(this.oTable.getRows()[iNonEmptyRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *END* -> Last row
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0), this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0));
		assert.equal(this.oTable.getRows()[iNonEmptyRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *HOME* -> Header cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0), this.oTable.qunit.getColumnHeaderCell(0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");

		// Empty area - Last row -> *HOME* -> First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(iRowCount - 1, 0), this.oTable.qunit.getDataCell(0, 0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");
	});

	QUnit.test("Content column - Less data rows than rendered rows and fixed rows", function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 12,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		oCore.applyChanges();

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var mRowCounts = this.oTable._getRowCounts();
		var iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);
		var iLastScrollableRowIndex = iNonEmptyRowCount - mRowCounts.fixedBottom - 1;

		// *END* -> Top fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getDataCell(mRowCounts.fixedTop - 1, 0));

		// *END* -> Scrollable area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(mRowCounts.fixedTop - 1, 0), this.oTable.qunit.getDataCell(iLastScrollableRowIndex, 0));
		assert.equal(this.oTable.getRows()[iLastScrollableRowIndex].getIndex(), iTotalRowCount - mRowCounts.fixedBottom - 1, "Row index");

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(iLastScrollableRowIndex, 0), this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0));

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0), this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0));

		// *HOME* -> Scrollable area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0), this.oTable.qunit.getDataCell(mRowCounts.fixedTop, 0));
		assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Row index");

		// *HOME* -> Top fixed area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(mRowCounts.fixedTop, 0), this.oTable.qunit.getDataCell(0, 0));

		// *HOME* -> Header cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getColumnHeaderCell(0));

		// Empty area - Last row -> *HOME* -> Scrollable area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(mRowCounts.fixedTop, 0));
		assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Row index");
	});

	QUnit.test("Content column - No Column Header", function(assert) {
		this.oTable.setColumnHeaderVisible(false);
		oCore.applyChanges();

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var iRowCount = this.oTable._getRowCounts().count;

		// *HOME* -> First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(-1, 0));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *END* -> Last row
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(-1, 0));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *HOME* -> First row (scrolled to top)
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(0, 0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");
	});

	QUnit.test("Content column - Multi Header and Fixed Top/Bottom Rows", function(assert) {
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_1_1"}));
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_2_1"}));
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_3_1"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_1_1"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_1"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_2"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_1_1"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_2"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_3"}));
		this.oTable.getColumns()[0].setHeaderSpan([3, 2, 1]);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		oCore.applyChanges();

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var mRowCounts = this.oTable._getRowCounts();
		var iLastScrollableIndex = mRowCounts.count - mRowCounts.fixedBottom - 1;

		// *HOME* -> Header - First row
		this.triggerKey(Key.HOME, document.getElementById(this.oTable.qunit.getColumnHeaderCell(0).getAttribute("id") + "_1"),
			this.oTable.qunit.getColumnHeaderCell(0));

		// *HOME* -> Header - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Top fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getDataCell(mRowCounts.fixedTop - 1, 0));

		// *END* -> Scrollable area - Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(mRowCounts.fixedTop - 1, 0), this.oTable.qunit.getDataCell(iLastScrollableIndex, 0));
		assert.equal(this.oTable.getRows()[iLastScrollableIndex].getIndex(), iTotalRowCount - mRowCounts.fixedBottom - 1, "Row index");

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(iLastScrollableIndex, 0), this.oTable.qunit.getDataCell(-1, 0));

		// *ARROW_UP* -> Bottom fixed area - Second-last row
		qutils.triggerKeydown(this.oTable.qunit.getDataCell(-1, 0), Key.Arrow.UP, false, false, false);
		checkFocus(this.oTable.qunit.getDataCell(-2, 0), assert);

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(-2, 0), this.oTable.qunit.getDataCell(-1, 0));

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(-1, 0));

		// *HOME* -> Scrollable area - First row (scrolled to top)
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(mRowCounts.fixedTop, 0));
		assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Row index");

		// *HOME* -> Top fixed area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(mRowCounts.fixedTop, 0), this.oTable.qunit.getDataCell(0, 0));

		// *HOME* -> Header - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Top fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getDataCell(mRowCounts.fixedTop - 1, 0));

		// *HOME* -> Header - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(mRowCounts.fixedTop - 1, 0), this.oTable.qunit.getColumnHeaderCell(0));
	});

	QUnit.test("Content column - Variable row heights", function(assert) {
		this.oTable._bVariableRowHeightEnabled = true;
		this.oTable.invalidate();
		oCore.applyChanges();

		var oTable = this.oTable;
		var iTotalRowCount = oTable._getTotalRowCount();
		var iRowCount = oTable._getRowCounts().count;
		var that = this;

		// *HOME* -> Header cell
		this.triggerKey(Key.HOME, oTable.qunit.getColumnHeaderCell(0), oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Last row (scrolled to bottom)
		this.triggerKey(Key.END, oTable.qunit.getColumnHeaderCell(0), oTable.qunit.getDataCell(-1, 0));
		assert.equal(oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oTable.getRows()[iRowCount - 1].getBindingContext().getProperty("A"), "A_7", "Row content");

			// *END* -> Last row
			that.triggerKey(Key.END, oTable.qunit.getDataCell(-1, 0), oTable.qunit.getDataCell(-1, 0));
			assert.equal(oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

			// *HOME* -> Header cell (scrolled to top)
			that.triggerKey(Key.HOME, oTable.qunit.getDataCell(-1, 0), oTable.qunit.getColumnHeaderCell(0));
			assert.equal(oTable.getRows()[0].getIndex(), 0, "Row index");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oTable.getRows()[0].getBindingContext().getProperty("A"), "A_0", "Row content");

			// Last row -> *END* -> Last row (scrolled to bottom)
			that.triggerKey(Key.END, oTable.qunit.getDataCell(-1, 0), oTable.qunit.getDataCell(-1, 0));
			assert.equal(oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");
		});
	});

	QUnit.test("Row action column", function(assert) {
		initRowActions(this.oTable, 2, 2);

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var iRowCount = this.oTable._getRowCounts().count;

		// *HOME* -> First Row Action
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

		// *END* -> Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(-1));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *END* -> Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(-1), this.oTable.qunit.getRowActionCell(-1));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *HOME* -> First Row Action
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(-1), this.oTable.qunit.getRowActionCell(0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");

		// Last row -> *END* -> Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(-1), this.oTable.qunit.getRowActionCell(-1));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");
	});

	QUnit.test("Row action column - Less data rows than rendered rows", function(assert) {
		this.oTable.getRowMode().setRowCount(10);
		initRowActions(this.oTable, 2, 2);

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);

		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1));
		assert.equal(this.oTable.getRows()[iTotalRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *END* -> Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1), this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1));
		assert.equal(this.oTable.getRows()[iNonEmptyRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *HOME* -> First Row Action
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1), this.oTable.qunit.getRowActionCell(0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");

		// Empty area - Last row -> *HOME* -> First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(-1), this.oTable.qunit.getRowActionCell(0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");
	});

	QUnit.test("Row action column - Less data rows than rendered rows and fixed rows", function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 12,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		initRowActions(this.oTable, 2, 2);

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var mRowCounts = this.oTable._getRowCounts();
		var iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);
		var iLastScrollableRowIndex = iNonEmptyRowCount - mRowCounts.fixedBottom - 1;

		// *END* -> Scrollable area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(iLastScrollableRowIndex));
		assert.equal(this.oTable.getRows()[iLastScrollableRowIndex].getIndex(), iTotalRowCount - mRowCounts.fixedBottom - 1, "Row index");

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(iLastScrollableRowIndex), this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1));

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1), this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1));

		// *HOME* -> Scrollable area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1), this.oTable.qunit.getRowActionCell(mRowCounts.fixedTop));
		assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Row index");

		// *HOME* -> Top fixed area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(mRowCounts.fixedTop), this.oTable.qunit.getRowActionCell(0));

		// *HOME* -> First Row Action
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

		// Empty area - Last row -> *HOME* -> Scrollable area - First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(mRowCounts.count - 1), this.oTable.qunit.getRowActionCell(mRowCounts.fixedTop));
		assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Row index");
	});

	QUnit.test("Row action column - No Column Header", function(assert) {
		this.oTable.setColumnHeaderVisible(false);
		initRowActions(this.oTable, 2, 2);

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var iRowCount = this.oTable._getRowCounts().count;

		// *HOME* -> First row
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

		// *END* -> Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(-1));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *END* -> Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(-1), this.oTable.qunit.getRowActionCell(-1));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *HOME* -> First row (scrolled to top)
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(-1), this.oTable.qunit.getRowActionCell(0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");
	});

	QUnit.test("Row action column - Multi Header and Fixed Top/Bottom Rows", function(assert) {
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_1_1"}));
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_2_1"}));
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_3_1"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_1_1"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_1"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_2"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_1_1"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_2"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_3"}));
		this.oTable.getColumns()[0].setHeaderSpan([3, 2, 1]);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		initRowActions(this.oTable, 2, 2);

		var iTotalRowCount = this.oTable._getTotalRowCount();
		var mRowCounts = this.oTable._getRowCounts();
		var iLastScrollableIndex = mRowCounts.count - mRowCounts.fixedBottom - 1;

		// *HOME* -> First Row Action
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

		// *END* -> Scrollable area - Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(iLastScrollableIndex));
		assert.equal(this.oTable.getRows()[iLastScrollableIndex].getIndex(), iTotalRowCount - mRowCounts.fixedBottom - 1, "Row index");

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(iLastScrollableIndex), this.oTable.qunit.getRowActionCell(-1));

		// *ARROW_UP* -> Bottom fixed area - Second-last row
		qutils.triggerKeydown(this.oTable.qunit.getRowActionCell(-1), Key.Arrow.UP, false, false, false);
		checkFocus(this.oTable.qunit.getRowActionCell(-2), assert);

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(-2), this.oTable.qunit.getRowActionCell(-1));

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(-1), this.oTable.qunit.getRowActionCell(-1));

		// *HOME* -> Scrollable area - First row (scrolled to top)
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(-1), this.oTable.qunit.getRowActionCell(mRowCounts.fixedTop));
		assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Row index");

		// *HOME* -> Top fixed area - First row (First Row Action)
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(mRowCounts.fixedTop), this.oTable.qunit.getRowActionCell(0));

		// *HOME* -> First Row Action
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.module("Navigation > Shift+Home & Shift+End", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			var mKeyInfo = {};
			mKeyInfo[Key.HOME] = {eventName: "onsaphomemodifiers", keyName: "Home", shift: true};
			mKeyInfo[Key.END] = {eventName: "onsapendmodifiers", keyName: "End", shift: true};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("On a data cell", function(assert) {
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(1, 1), this.oTable.qunit.getDataCell(1, 1));
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(1, 1), this.oTable.qunit.getDataCell(1, 1));
	});

	QUnit.module("Navigation > Alt+Home & Alt+End", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			var mKeyInfo = {};
			mKeyInfo[Key.HOME] = {eventName: "onsaphomemodifiers", keyName: "Home", alt: true};
			mKeyInfo[Key.END] = {eventName: "onsapendmodifiers", keyName: "End", alt: true};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("On a data cell", function(assert) {
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(1, 1), this.oTable.qunit.getDataCell(1, 1));
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(1, 1), this.oTable.qunit.getDataCell(1, 1));
	});

	QUnit.module("Navigation > Page Up & Page Down", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E", "F"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			var mKeyInfo = {};
			mKeyInfo[Key.Page.UP] = {eventName: "onsappageup", keyName: "PageUp"};
			mKeyInfo[Key.Page.DOWN] = {eventName: "onsappagedown", keyName: "PageDown"};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},

		/**
		 * Navigates down and back up using the PageUp and PageDown keys, including scrolling, in the row header column, and in the first data column.
		 * Start from the top cell -> to the bottom cell -> to the top cell.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @private
		 */
		testPageKeys: function(assert) {
			var mRowCounts = this.oTable._getRowCounts();
			var iTotalRowCount = this.oTable._getTotalRowCount();
			var iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);
			var iPageSize = iNonEmptyRowCount - mRowCounts.fixedTop - mRowCounts.fixedBottom;
			var iLastScrollableRowIndex = iNonEmptyRowCount - mRowCounts.fixedBottom - 1;
			var iHeaderRowCount = TableUtils.getHeaderRowCount(this.oTable);
			var i;

			/* Test on row header */

			// SelectAll -> *PAGE_UP* -> SelectAll
			this.triggerKey(Key.Page.UP, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getSelectAllCell());

			// *PAGE_DOWN* -> First row
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getRowHeaderCell(0));

			// *PAGE_DOWN* -> Scrollable area - Last row
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getRowHeaderCell(iLastScrollableRowIndex));

			// *PAGE_DOWN* -> Scrollable area - Last row - Scroll down all full pages
			for (i = iLastScrollableRowIndex + iPageSize; i < iTotalRowCount - mRowCounts.fixedBottom; i += iPageSize) {
				this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowHeaderCell(iLastScrollableRowIndex),
					this.oTable.qunit.getRowHeaderCell(iLastScrollableRowIndex));
				assert.equal(this.oTable.getRows()[iLastScrollableRowIndex].getIndex(), i, "Scrolled down: Row index");
			}

			// *PAGE_DOWN* -> Last row - Scrolled down the remaining rows
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowHeaderCell(iLastScrollableRowIndex),
				this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1));
			assert.equal(this.oTable.getRows()[iLastScrollableRowIndex].getIndex(), iTotalRowCount - mRowCounts.fixedBottom - 1,
				"Scrolled to bottom: Row index");

			// *PAGE_DOWN* -> Last row
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1),
				this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1));

			if (mRowCounts.fixedBottom > 1) {
				// *ARROW_UP* -> Bottom fixed area - Second-last row
				qutils.triggerKeydown(this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1), Key.Arrow.UP, false, false, false);
				checkFocus(this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 2), assert);

				// *PAGE_DOWN* -> Bottom fixed area - Last row
				this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 2),
					this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1));
			}

			// *PAGE_UP* -> Scrollable area - First row
			this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1),
				this.oTable.qunit.getRowHeaderCell(mRowCounts.fixedTop));

			// *PAGE_UP* -> Scrollable area - First row - Scroll up all full pages
			for (i = iTotalRowCount - mRowCounts.fixedBottom - iPageSize; i >= mRowCounts.fixedTop + iPageSize; i -= iPageSize) {
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowHeaderCell(mRowCounts.fixedTop), this.oTable.qunit.getRowHeaderCell(mRowCounts.fixedTop));
				assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), i - iPageSize, "Scrolled up: Row index");
			}

			if (mRowCounts.fixedTop > 0) {
				// *PAGE_UP* -> Top fixed area - First row - Scrolled up the remaining rows
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowHeaderCell(mRowCounts.fixedTop), this.oTable.qunit.getRowHeaderCell(0));
				assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Scrolled to top: Row index");
			}

			if (mRowCounts.fixedTop > 1) {
				// *ARROW_DOWN* -> Top fixed area - Second row
				qutils.triggerKeydown(this.oTable.qunit.getRowHeaderCell(0), Key.Arrow.DOWN, false, false, false);
				checkFocus(this.oTable.qunit.getRowHeaderCell(1), assert);

				// *PAGE_UP* -> Top fixed area - First row
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowHeaderCell(1), this.oTable.qunit.getRowHeaderCell(0));
			}

			// *PAGE_UP* -> SelectAll - Scrolled up the remaining rows
			this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getSelectAllCell());

			if (mRowCounts.fixedTop === 0) {
				assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Scrolled to top: Row index");
			}

			if (iTotalRowCount < mRowCounts.count) {
				// Empty area - Last row -> *PAGE_UP* -> Scrollable area - Last row
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowHeaderCell(-1), this.oTable.qunit.getRowHeaderCell(iTotalRowCount - 1));
			}

			/* Test on first content column */

			// Header -> First row -> *PAGE_UP* -> Header - First row
			this.triggerKey(Key.Page.UP, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(0));

			if (iHeaderRowCount > 1) {
				var oLastHeaderCell = document.getElementById(
					this.oTable.qunit.getColumnHeaderCell(0).getAttribute("id") + "_" + (iHeaderRowCount - 1));

				// *PAGE_DOWN* -> Header - Last row
				this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getColumnHeaderCell(0), oLastHeaderCell);

				// *PAGE_DOWN* -> First row
				this.triggerKey(Key.Page.DOWN, oLastHeaderCell, this.oTable.qunit.getDataCell(0, 0));
			} else {
				this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getDataCell(0, 0));
			}

			// *PAGE_DOWN* -> Scrollable area - Last row
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(iLastScrollableRowIndex, 0));

			// *PAGE_DOWN* -> Scrollable area - Last row - Scroll down all full pages
			for (i = iLastScrollableRowIndex + iPageSize; i < iTotalRowCount - mRowCounts.fixedBottom; i += iPageSize) {
				this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(iLastScrollableRowIndex, 0),
					this.oTable.qunit.getDataCell(iLastScrollableRowIndex, 0));
				assert.equal(this.oTable.getRows()[iLastScrollableRowIndex].getIndex(), i, "Scrolled down: Row index");
			}

			// *PAGE_DOWN* -> Last row - Scrolled down the remaining rows
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(iLastScrollableRowIndex, 0),
				this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0));
			assert.equal(this.oTable.getRows()[iLastScrollableRowIndex].getIndex(), iTotalRowCount - mRowCounts.fixedBottom - 1,
				"Scrolled to bottom: Row index");

			// *PAGE_DOWN* -> Last row
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0),
				this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0));

			if (mRowCounts.fixedBottom > 1) {
				// *ARROW_UP* -> Bottom fixed area - Second-last row
				qutils.triggerKeydown(this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0), Key.Arrow.UP, false, false, false);
				checkFocus(this.oTable.qunit.getDataCell(iNonEmptyRowCount - 2, 0), assert);

				// *PAGE_DOWN* -> Bottom fixed area - Last row
				this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(iNonEmptyRowCount - 2, 0),
					this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0));
			}

			// *PAGE_UP* -> Scrollable area - First row
			this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0),
				this.oTable.qunit.getDataCell(mRowCounts.fixedTop, 0));

			// *PAGE_UP* -> Scrollable area - First row - Scroll up all full pages
			for (i = iTotalRowCount - mRowCounts.fixedBottom - iPageSize; i >= mRowCounts.fixedTop + iPageSize; i -= iPageSize) {
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(mRowCounts.fixedTop, 0),
					this.oTable.qunit.getDataCell(mRowCounts.fixedTop, 0));
				assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), i - iPageSize, "Scrolled up: Row index");
			}

			if (mRowCounts.fixedTop > 0) {
				// *PAGE_UP* -> Top fixed area - First row - Scrolled up the remaining rows
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(mRowCounts.fixedTop, 0), this.oTable.qunit.getDataCell(0, 0));
				assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Scrolled to top: Row correct");
			}

			if (mRowCounts.fixedTop > 1) {
				// *ARROW_DOWN* -> Top fixed area - Second row
				qutils.triggerKeydown(this.oTable.qunit.getDataCell(0, 0), Key.Arrow.DOWN, false, false, false);
				checkFocus(this.oTable.qunit.getDataCell(1, 0), assert);

				// *PAGE_UP* -> Top fixed area - First row
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(1, 0), this.oTable.qunit.getDataCell(0, 0));
			}

			// *PAGE_UP* -> Header - First row - Scrolled up the remaining rows (if not already)
			this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getColumnHeaderCell(0));

			if (mRowCounts.fixedTop === 0) {
				assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Scrolled to top: Row correct");
			}

			if (iTotalRowCount < mRowCounts.count) {
				// Empty area -> Last row -> *PAGE_UP* -> Scrollable area - Last row
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(iTotalRowCount - 1, 0));
			}

			/* Test on row actions */

			initRowActions(this.oTable, 2, 2);

			// First Row Action -> *PAGE_UP* -> First Row Action
			this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

			// *PAGE_DOWN* -> Scrollable area - Last row
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(iLastScrollableRowIndex));

			// *PAGE_DOWN* -> Scrollable area - Last row - Scroll down all full pages
			for (i = iLastScrollableRowIndex + iPageSize; i < iTotalRowCount - mRowCounts.fixedBottom; i += iPageSize) {
				this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowActionCell(iLastScrollableRowIndex),
					this.oTable.qunit.getRowActionCell(iLastScrollableRowIndex));
				assert.equal(this.oTable.getRows()[iLastScrollableRowIndex].getIndex(), i, "Scrolled down: Row index");
			}

			// *PAGE_DOWN* -> Last row - Scrolled down the remaining rows
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowActionCell(iLastScrollableRowIndex),
				this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1));
			assert.equal(this.oTable.getRows()[iLastScrollableRowIndex].getIndex(), iTotalRowCount - mRowCounts.fixedBottom - 1,
				"Scrolled to bottom: Row index");

			// *PAGE_DOWN* -> Last row
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1),
				this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1));

			if (mRowCounts.fixedBottom > 1) {
				// *ARROW_UP* -> Bottom fixed area - Second-last row
				qutils.triggerKeydown(this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1), Key.Arrow.UP, false, false, false);
				checkFocus(this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 2), assert);

				// *PAGE_DOWN* -> Bottom fixed area - Last row
				this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 2),
					this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1));
			}

			// *PAGE_UP* -> Scrollable area - First row
			this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1),
				this.oTable.qunit.getRowActionCell(mRowCounts.fixedTop));

			// *PAGE_UP* -> Scrollable area - First row - Scroll up all full pages
			for (i = iTotalRowCount - mRowCounts.fixedBottom - iPageSize; i >= mRowCounts.fixedTop + iPageSize; i -= iPageSize) {
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowActionCell(mRowCounts.fixedTop),
					this.oTable.qunit.getRowActionCell(mRowCounts.fixedTop));
				assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), i - iPageSize, "Scrolled up: Row index");
			}

			if (mRowCounts.fixedTop > 0) {
				// *PAGE_UP* -> Top fixed area - First row - Scrolled up the remaining rows
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowActionCell(mRowCounts.fixedTop), this.oTable.qunit.getRowActionCell(0));
				assert.equal(this.oTable.getRows()[mRowCounts.fixedTop].getIndex(), mRowCounts.fixedTop, "Scrolled to top: Row index");
			}

			if (mRowCounts.fixedTop > 1) {
				// *ARROW_DOWN* -> Top fixed area - Second row
				qutils.triggerKeydown(this.oTable.qunit.getRowActionCell(0), Key.Arrow.DOWN, false, false, false);
				checkFocus(this.oTable.qunit.getRowActionCell(1), assert);

				// *PAGE_UP* -> Top fixed area - First row
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));
			}
		}
	});

	QUnit.test("More data rows than rendered rows", function(assert) {
		this.testPageKeys(assert);
	});

	QUnit.test("Less data rows than rendered rows", function(assert) {
		this.oTable.getRowMode().setRowCount(10);
		oCore.applyChanges();

		this.testPageKeys(assert);
	});

	QUnit.test("Multi Header", function(assert) {
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		this.oTable.getColumns()[1].setHeaderSpan([2, 1]);
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
		oCore.applyChanges();

		this.testPageKeys(assert);
	});

	QUnit.test("Fixed rows", function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		oCore.applyChanges();

		this.testPageKeys(assert);
	});

	QUnit.test("Less data rows than rendered rows and fixed rows", function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 10,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		oCore.applyChanges();

		this.testPageKeys(assert);
	});

	QUnit.test("Multi header and fixed rows", function(assert) {
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		this.oTable.getColumns()[1].setHeaderSpan([2, 1]);
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		oCore.applyChanges();

		this.testPageKeys(assert);
	});

	QUnit.test("Variable row heights", function(assert) {
		this.oTable._bVariableRowHeightEnabled = true;
		this.oTable.invalidate();
		this.oTable.getModel().destroy();
		this.oTable.setModel(TableQUnitUtils.createJSONModel(10));
		oCore.applyChanges();

		var oTable = this.oTable;
		var iTotalRowCount = oTable._getTotalRowCount();
		var mRowCounts = oTable._getRowCounts();
		var that = this;

		// *PAGE_DOWN* -> Last row
		that.triggerKey(Key.Page.DOWN, oTable.qunit.getDataCell(0, 0), oTable.qunit.getDataCell(-1, 0));

		// *PAGE_DOWN* -> Last row - Scrolled down
		that.triggerKey(Key.Page.DOWN, oTable.qunit.getDataCell(-1, 0), oTable.qunit.getDataCell(-1, 0));
		assert.equal(oTable.getRows()[mRowCounts.count - 1].getIndex(), mRowCounts.count * 2 - 1, "Scrolled down: Row index");

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oTable.getRows()[mRowCounts.count - 1].getBindingContext().getProperty("A"), "A_7", "Scrolled down: Row content");

			// *PAGE_DOWN* -> Last row - Scrolled to bottom
			that.triggerKey(Key.Page.DOWN, oTable.qunit.getDataCell(-1, 0), oTable.qunit.getDataCell(-1, 0));
			assert.equal(oTable.getRows()[mRowCounts.count - 1].getIndex(), iTotalRowCount - 1, "Scrolled to bottom: Row index");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oTable.getRows()[mRowCounts.count - 1].getBindingContext().getProperty("A"), "A_9", "Scrolled to bottom: Row content");

			// *PAGE_DOWN* -> Last row
			that.triggerKey(Key.Page.DOWN, oTable.qunit.getDataCell(-1, 0), oTable.qunit.getDataCell(-1, 0));

			// *PAGE_UP* -> Scrollable area - First row
			that.triggerKey(Key.Page.UP, oTable.qunit.getDataCell(-1, 0), oTable.qunit.getDataCell(0, 0));
			assert.equal(oTable.getRows()[0].getIndex(), iTotalRowCount - mRowCounts.count, "Row index");
			assert.equal(oTable.getRows()[0].getBindingContext().getProperty("A"), "A_6", "Row content");

			// *PAGE_UP* -> First row - Scrolled up
			that.triggerKey(Key.Page.UP, oTable.qunit.getDataCell(0, 0), oTable.qunit.getDataCell(0, 0));
			assert.equal(oTable.getRows()[0].getIndex(), iTotalRowCount - mRowCounts.count * 2, "Scrolled up: Row index");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oTable.getRows()[0].getBindingContext().getProperty("A"), "A_2", "Scrolled up: Row content");

			// *PAGE_UP* -> First row - Scrolled to top
			that.triggerKey(Key.Page.UP, oTable.qunit.getDataCell(0, 0), oTable.qunit.getColumnHeaderCell(0));
			assert.equal(oTable.getRows()[0].getIndex(), 0, "Scrolled to top: Row index");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oTable.getRows()[0].getBindingContext().getProperty("A"), "A_0", "Scrolled to top: Row content");
		});
	});

	QUnit.module("Navigation > Ctrl+Page Up & Ctrl+Page Down", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			var mKeyInfo = {};
			mKeyInfo[Key.Page.UP] = {eventName: "onsappageupmodifiers", keyName: "PageUp", ctrl: true};
			mKeyInfo[Key.Page.DOWN] = {eventName: "onsappagedownmodifiers", keyName: "PageDown", ctrl: true};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("On a data cell", function(assert) {
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(1, 1), this.oTable.qunit.getDataCell(1, 1));
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(1, 1), this.oTable.qunit.getDataCell(1, 1));
	});

	QUnit.module("Navigation > Shift+Page Up & Shift+Page Down", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			var mKeyInfo = {};
			mKeyInfo[Key.Page.UP] = {eventName: "onsappageupmodifiers", keyName: "PageUp", shift: true};
			mKeyInfo[Key.Page.DOWN] = {eventName: "onsappagedownmodifiers", keyName: "PageDown", shift: true};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("On a data cell", function(assert) {
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(1, 1), this.oTable.qunit.getDataCell(1, 1));
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(1, 1), this.oTable.qunit.getDataCell(1, 1));
	});

	QUnit.module("Navigation > Alt+Page Up & Alt+Page Down", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					(function() {
						var aColumns = [];

						for (var i = 0; i < 27; i++) {
							aColumns.push(TableQUnitUtils.createTextColumn({
								label: "A" + i,
								text: "A" + i,
								bind: true
							}));
						}

						return aColumns;
					})()
				]
			});

			var mKeyInfo = {};
			mKeyInfo[Key.Page.UP] = {eventName: "onsappageupmodifiers", keyName: "PageUp", alt: true};
			mKeyInfo[Key.Page.DOWN] = {eventName: "onsappagedownmodifiers", keyName: "PageDown", alt: true};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Column header", function(assert) {
		var oTarget;
		var iColumnCount = this.oTable.getColumns().length;
		var i;

		// SelectAll -> *PAGE_UP* -> SelectAll
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getSelectAllCell());

		// *PAGE_DOWN* -> First cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getColumnHeaderCell(0));
		oTarget = this.oTable.qunit.getColumnHeaderCell(0);

		// *PAGE_DOWN* -> Scroll right to the last cell
		for (i = 0; i < iColumnCount - 1; i += 5) {
			this.triggerKey(Key.Page.DOWN, oTarget, this.oTable.qunit.getColumnHeaderCell(Math.min(i + 5, iColumnCount - 1)));
			oTarget = this.oTable.qunit.getColumnHeaderCell(Math.min(i + 5, iColumnCount - 1));
		}

		// *PAGE_DOWN* -> Last cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(-1));
		oTarget = this.oTable.qunit.getColumnHeaderCell(-1);

		// *PAGE_UP* -> Scroll left to the first cell
		for (i = iColumnCount - 1; i >= 0; i -= 5) {
			this.triggerKey(Key.Page.UP, oTarget, this.oTable.qunit.getColumnHeaderCell(Math.max(i - 5, 0)));
			oTarget = this.oTable.qunit.getColumnHeaderCell(Math.max(i - 5, 0));
		}

		// *PAGE_UP* -> SelectAll
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getSelectAllCell());
	});

	QUnit.test("Column header; With row actions", function(assert) {
		var iColumnCount = this.oTable.getColumns().length;
		var oTarget;
		var i;

		initRowActions(this.oTable, 2, 2);

		// SelectAll -> *PAGE_UP* -> SelectAll
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getSelectAllCell());

		// *PAGE_DOWN* -> First cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getColumnHeaderCell(0));
		oTarget = this.oTable.qunit.getColumnHeaderCell(0);

		// *PAGE_DOWN* -> Scroll right to the last cell
		for (i = 0; i < iColumnCount - 1; i += 5) {
			this.triggerKey(Key.Page.DOWN, oTarget, this.oTable.qunit.getColumnHeaderCell(Math.min(i + 5, iColumnCount - 1)));
			oTarget = this.oTable.qunit.getColumnHeaderCell(Math.min(i + 5, iColumnCount - 1));
		}

		// *PAGE_DOWN* -> Last cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(-1));
	});

	QUnit.test("Column header; No row header", function(assert) {
		var iColumnCount = this.oTable.getColumns().length;
		var oTarget;
		var i;

		this.oTable.setSelectionMode(library.SelectionMode.None);
		oCore.applyChanges();

		// First cell -> *PAGE_UP* -> First cell
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(0));
		oTarget = this.oTable.qunit.getColumnHeaderCell(0);

		// *PAGE_DOWN* -> Scroll right to the last cell
		for (i = 0; i < iColumnCount - 1; i += 5) {
			this.triggerKey(Key.Page.DOWN, oTarget, this.oTable.qunit.getColumnHeaderCell(Math.min(i + 5, iColumnCount - 1)));
			oTarget = this.oTable.qunit.getColumnHeaderCell(Math.min(i + 5, iColumnCount - 1));
		}

		// *PAGE_DOWN* -> Last cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(-1));
		oTarget = this.oTable.qunit.getColumnHeaderCell(-1);

		// *PAGE_UP* -> Scroll left to the first cell
		for (i = iColumnCount - 1; i >= 0; i -= 5) {
			this.triggerKey(Key.Page.UP, oTarget, this.oTable.qunit.getColumnHeaderCell(Math.max(i - 5, 0)));
			oTarget = this.oTable.qunit.getColumnHeaderCell(Math.max(i - 5, 0));
		}
	});

	QUnit.test("Content", function(assert) {
		var oTarget;
		var iColumnCount = this.oTable.getColumns().length;
		var i;

		// Selection cell -> *PAGE_UP* -> Selection cell
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getRowHeaderCell(0));

		// *PAGE_DOWN* -> First cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getDataCell(0, 0));
		oTarget = this.oTable.qunit.getDataCell(0, 0);

		// *PAGE_DOWN* -> Scroll right to the last cell
		for (i = 0; i < iColumnCount - 1; i += 5) {
			this.triggerKey(Key.Page.DOWN, oTarget, this.oTable.qunit.getDataCell(0, Math.min(i + 5, iColumnCount - 1)));
			oTarget = this.oTable.qunit.getDataCell(0, Math.min(i + 5, iColumnCount - 1));
		}

		// *PAGE_DOWN* -> Last cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, -1));
		oTarget = this.oTable.qunit.getDataCell(0, -1);

		// *PAGE_UP* -> Scroll left to the first cell
		for (i = iColumnCount - 1; i >= 0; i -= 5) {
			this.triggerKey(Key.Page.UP, oTarget, this.oTable.qunit.getDataCell(0, Math.max(i - 5, 0)));
			oTarget = this.oTable.qunit.getDataCell(0, Math.max(i - 5, 0));
		}

		// *PAGE_UP* -> Selection cell
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getRowHeaderCell(0));
	});

	QUnit.test("Content; With row actions", function(assert) {
		var iColumnCount = this.oTable.getColumns().length;
		var oTarget;
		var i;

		initRowActions(this.oTable, 2, 2);

		// Selection cell -> *PAGE_DOWN* -> First cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getDataCell(0, 0));
		oTarget = this.oTable.qunit.getDataCell(0, 0);

		// *PAGE_DOWN* -> Scroll right to the last cell
		for (i = 0; i < iColumnCount - 1; i += 5) {
			this.triggerKey(Key.Page.DOWN, oTarget, this.oTable.qunit.getDataCell(0, Math.min(i + 5, iColumnCount - 1)));
			oTarget = this.oTable.qunit.getDataCell(0, Math.min(i + 5, iColumnCount - 1));
		}

		// *PAGE_DOWN* -> Row Action Cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getRowActionCell(0));

		// *PAGE_DOWN* -> Row Action Cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

		// *PAGE_UP* -> last cell
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getDataCell(0, -1));
		oTarget = this.oTable.qunit.getDataCell(0, -1);

		// *PAGE_UP* -> Scroll left to the first cell
		for (i = iColumnCount - 1; i >= 0; i -= 5) {
			this.triggerKey(Key.Page.UP, oTarget, this.oTable.qunit.getDataCell(0, Math.max(i - 5, 0)));
			oTarget = this.oTable.qunit.getDataCell(0, Math.max(i - 5, 0));
		}

		// *PAGE_UP* -> Selection cell
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getRowHeaderCell(0));
	});

	QUnit.test("Content; No row header", function(assert) {
		var iColumnCount = this.oTable.getColumns().length;
		var oTarget;
		var i;

		this.oTable.setSelectionMode(library.SelectionMode.None);
		oCore.applyChanges();

		// First cell -> *PAGE_UP* -> First cell
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));
		oTarget = this.oTable.qunit.getDataCell(0, 0);

		// *PAGE_DOWN* -> Scroll right to the last cell
		for (i = 0; i < iColumnCount - 1; i += 5) {
			this.triggerKey(Key.Page.DOWN, oTarget, this.oTable.qunit.getDataCell(0, Math.min(i + 5, iColumnCount - 1)));
			oTarget = this.oTable.qunit.getDataCell(0, Math.min(i + 5, iColumnCount - 1));
		}

		// *PAGE_DOWN* -> Last cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, -1));
		oTarget = this.oTable.qunit.getDataCell(0, -1);

		// *PAGE_UP* -> Scroll left to the first cell
		for (i = iColumnCount - 1; i >= 0; i -= 5) {
			this.triggerKey(Key.Page.UP, oTarget, this.oTable.qunit.getDataCell(0, Math.max(i - 5, 0)));
			oTarget = this.oTable.qunit.getDataCell(0, Math.max(i - 5, 0));
		}
	});

	QUnit.test("Column Spans", function(assert) {
		var iColumnCount = this.oTable.getColumns().length;
		var oTarget;
		var i;

		this.oTable.getColumns()[0].setHeaderSpan([3]);
		this.oTable.getColumns()[3].setHeaderSpan([8]);
		this.oTable.getColumns()[11].setHeaderSpan([2]);
		this.oTable.getColumns()[25].setHeaderSpan([2]);
		oCore.applyChanges();

		// First cell (3-span column) -> *PAGE_DOWN* -> 4th cell (8-span column)
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(3));

		// *PAGE_DOWN* -> 12th cell
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getColumnHeaderCell(3), this.oTable.qunit.getColumnHeaderCell(11));
		oTarget = this.oTable.qunit.getColumnHeaderCell(11);

		// *PAGE_DOWN* -> Scroll right to the last cell
		for (i = 11; i < iColumnCount - 2; i += 5) {
			this.triggerKey(Key.Page.DOWN, oTarget, this.oTable.qunit.getColumnHeaderCell(Math.min(i + 5, iColumnCount - 2)));
			oTarget = this.oTable.qunit.getColumnHeaderCell(Math.min(i + 5, iColumnCount - 2));
		}

		// *PAGE_UP* -> Scroll left to the 15th cell
		for (i = iColumnCount - 2; i > 15; i -= 5) {
			this.triggerKey(Key.Page.UP, oTarget, this.oTable.qunit.getColumnHeaderCell(i - 5));
			oTarget = this.oTable.qunit.getColumnHeaderCell(i - 5);
		}

		// *PAGE_UP* -> 12th cell (8-span column)
		this.triggerKey(Key.Page.UP, oTarget, this.oTable.qunit.getColumnHeaderCell(3));

		// *PAGE_UP* -> First cell (3-span column)
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getColumnHeaderCell(3), this.oTable.qunit.getColumnHeaderCell(0));

		// *PAGE_UP* -> SelectAll
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getSelectAllCell());
	});

	QUnit.test("Group Row Header", function(assert) {
		return fakeGroupRow(0, this.oTable).then(function() {
			// Selection cell -> *PAGE_DOWN* -> Group header
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getDataCell(0, 0));

			// *PAGE_DOWN* -> Group header
			this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));

			// *PAGE_UP* -> Selection cell
			this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getRowHeaderCell(0));
		}.bind(this));
	});

	QUnit.module("Navigation > F6 & Shift+F6", {
		beforeEach: function() {
			setupTest();

			// Enhance the Navigation Handler to use the test scope only (not the QUnit related DOM)
			this.handleF6GroupNavigationOriginal = F6Navigation.handleF6GroupNavigation;
			var that = this;
			F6Navigation.handleF6GroupNavigation = function(oEvent, oSettings) {
				oSettings = oSettings ? oSettings : {};
				if (!oSettings.scope) {
					oSettings.scope = document.getElementById("qunit-fixture");
				}
				that.handleF6GroupNavigationOriginal(oEvent, oSettings);
			};
		},
		afterEach: function() {
			teardownTest();

			F6Navigation.handleF6GroupNavigation = this.handleF6GroupNavigationOriginal;
			this.handleF6GroupNavigationOriginal = null;
		}
	});

	QUnit.test("F6 - Forward navigation - With Extension and Footer", function(assert) {
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		oCore.applyChanges();

		var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		checkFocus(document.getElementById("Footer"), assert);

		oElem = getCell(1, 1, true, assert);
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		checkFocus(document.getElementById("Footer"), assert);

		oElem = getRowHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		checkFocus(document.getElementById("Footer"), assert);

		oElem = getSelectAll(true, assert);
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		checkFocus(document.getElementById("Footer"), assert);

		oElem = getColumnHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6", false, false, false);
		checkFocus(document.getElementById("Footer"), assert);
	});

	QUnit.test("Shift+F6 - Backward navigation - With Extension and Footer", function(assert) {
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		oCore.applyChanges();

		var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		checkFocus(document.getElementById("Focus1"), assert);

		oElem = getCell(1, 1, true, assert);
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		checkFocus(document.getElementById("Focus1"), assert);

		oElem = getRowHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		checkFocus(document.getElementById("Focus1"), assert);

		oElem = getSelectAll(true, assert);
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		checkFocus(document.getElementById("Focus1"), assert);

		oElem = getColumnHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6", true, false, false);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.module("Navigation > Overlay", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Tab - Default Test Table", function(assert) {
		oTable.setShowOverlay(true);

		var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(document.getElementById("Focus2"), assert);
	});

	QUnit.test("Tab - With Extension and Footer", function(assert) {
		oTable.setShowOverlay(true);
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		oCore.applyChanges();

		var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(document.getElementById("Focus2"), assert);
	});

	QUnit.test("Shift+Tab - Default", function(assert) {
		oTable.setShowOverlay(true);

		var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.test("Shift+Tab - With Extension and Footer", function(assert) {
		oTable.setShowOverlay(true);
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		oCore.applyChanges();

		var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.module("Navigation > NoData", {
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
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(document.getElementById("Focus2"), assert);

			done();
		}

		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Tab - Without Column Header", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(document.getElementById("Focus2"), assert);

			done();
		}

		oTable.setColumnHeaderVisible(false);
		oCore.applyChanges();
		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Tab - With Extension and Footer", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
			simulateTabEvent(oElem, false);
			checkFocus(document.getElementById("Extension"), assert);
			simulateTabEvent(oElem, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(document.getElementById("Footer"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(document.getElementById("Focus2"), assert);

			done();
		}

		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		oCore.applyChanges();
		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Shift+Tab", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
			simulateTabEvent(oElem, true);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, true);
			oElem = checkFocus(getColumnHeader(0), assert);
			simulateTabEvent(oElem, true);
			checkFocus(document.getElementById("Focus1"), assert);

			done();
		}

		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Shift+Tab - With Extension and Footer", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
			simulateTabEvent(oElem, true);
			oElem = checkFocus(document.getElementById("Footer"), assert);
			simulateTabEvent(oElem, true);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, true);
			oElem = checkFocus(getColumnHeader(0), assert);
			simulateTabEvent(oElem, true);
			oElem = checkFocus(document.getElementById("Extension"), assert);
			simulateTabEvent(oElem, true);
			checkFocus(document.getElementById("Focus1"), assert);

			done();
		}

		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		oCore.applyChanges();
		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("No Vertical Navigation (Header <-> Content)", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
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

		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.module("Navigation > NoData & Overlay", {
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
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);
			var sId = "noDataCnt";

			while (sId) {
				var oElem = oTable.$(sId);
				oElem.trigger("focus");
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

		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Tab", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("overlay"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(document.getElementById("Focus2"), assert);

			done();
		}

		oTable.setShowOverlay(true);
		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Shift+Tab", function(assert) {
		var done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
			simulateTabEvent(oElem, true);
			oElem = checkFocus(oTable.getDomRef("overlay"), assert);
			simulateTabEvent(oElem, true);
			checkFocus(document.getElementById("Focus1"), assert);

			done();
		}

		oTable.setShowOverlay(true);
		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.module("Navigation > BusyIndicator", {
		beforeEach: function() {
			setupTest();

			oTable.setBusyIndicatorDelay(0);
			oTable.setBusy(true);
			oCore.applyChanges();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Tab", function(assert) {
		var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		// Due to changed BusyIndicator handling - BusyIndicator is now tabbable
		oElem = oTable.getDomRef("busyIndicator");
		checkFocus(oElem, assert);
		simulateTabEvent(oElem, false);
		checkFocus(document.getElementById("Focus2"), assert);
	});

	QUnit.test("Shift+Tab", function(assert) {
		var oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		// Due to changed BusyIndicator handling - BusyIndicator is now tabbable
		oElem = oTable.getDomRef("busyIndicator");
		checkFocus(oElem, assert);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.module("Navigation > Special Cases", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Focus on cell content - Home & End & Arrow Keys", function(assert) {
		var oElem = findTabbables(getCell(0, 0).get(0), [getCell(0, 0).get(0)], true);
		oElem.trigger("focus");

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
			getCell.bind(window, oTable._getRowCounts().count - 1, 0),
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

		assert.expect(aEventTargetGetters.length + aEventTargetGetters.length * aKeystrokes.length + 2);

		oTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(oEvent.isDefaultPrevented(), oEvent.target._oKeystroke.keyName + ": Default action was prevented (Page scrolling)");
			}
		});

		for (var i = 0; i < aEventTargetGetters.length; i++) {
			oTable.setFirstVisibleRow(1);
			oCore.applyChanges();

			var oEventTarget = aEventTargetGetters[i]();
			oEventTarget.trigger("focus");
			checkFocus(oEventTarget, assert);

			for (var j = 0; j < aKeystrokes.length; j++) {
				var oKeystroke = aKeystrokes[j];
				var aArguments = oKeystroke.arguments;

				oEventTarget.trigger("focus");
				oEventTarget[0]._oKeystroke = oKeystroke;
				aArguments[0] = oEventTarget; // The first parameter is the event target.
				oKeystroke.trigger.apply(qutils, aArguments);
			}
		}

		oTreeTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(oEvent.isDefaultPrevented(), "Space (keydown): Default action was prevented (Page scrolling)");
			}
		});

		var oTreeIcon = getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIconNodeClosed");
		oTreeIcon.trigger("focus");
		checkFocus(oTreeIcon, assert);
		qutils.triggerKeydown(oTreeIcon, Key.SPACE, false, false, false);
	});

	QUnit.test("After leaving action mode", function(assert) {
		oTable.setFixedColumnCount(1);
		initRowActions(oTable, 1, 1);

		function test(oInitiallyFocusedCell, oTestedCell, oFinallyFocusedCell, fnKeyPress, sTitle) {
			var bTestedCellIsRowHeader = TableUtils.getCellInfo(oTestedCell).isOfType(TableUtils.CELLTYPE.ROWHEADER);

			oInitiallyFocusedCell.trigger("focus");

			// Enter action mode
			if (bTestedCellIsRowHeader) {
				oTable._getKeyboardExtension()._actionMode = true;
				oTable._getKeyboardExtension().suspendItemNavigation();
				oTestedCell.trigger("focus");
			} else {
				TableUtils.getInteractiveElements(oTestedCell)[0].focus();
			}

			// Leave action mode
			qutils.triggerKeydown(document.activeElement, Key.F2, false, false, false);

			fnKeyPress();
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), sTitle + " - Table is in navigation mode");
			checkFocus(oFinallyFocusedCell, assert);
		}

		// Row header cell
		test(getCell(2, 2), getRowHeader(1), getRowHeader(0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
		}, "Row header cell: ArrowUp");
		test(getCell(2, 2), getRowHeader(1), getRowHeader(2), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
		}, "Row header cell: ArrowDown");
		test(getCell(2, 2), getRowHeader(1), getRowHeader(1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT, false, false, false);
		}, "Row header cell: ArrowLeft");
		test(getCell(2, 2), getRowHeader(1), getCell(1, 0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT, false, false, false);
		}, "Row header cell: ArrowRight");

		// Cell in fixed column
		test(getCell(2, 2), getCell(1, 0), getCell(0, 0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
		}, "Cell in fixed column: ArrowUp");
		test(getCell(2, 2), getCell(1, 0), getCell(2, 0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
		}, "Cell in fixed column: ArrowDown");
		test(getCell(2, 2), getCell(1, 0), getRowHeader(1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT, false, false, false);
		}, "Cell in fixed column: ArrowLeft");
		test(getCell(2, 2), getCell(1, 0), getCell(1, 1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT, false, false, false);
		}, "Cell in fixed column: ArrowRight");

		// Cell in scrollable column
		test(getCell(2, 3), getCell(1, 1), getCell(0, 1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
		}, "Cell in scrollable column: ArrowUp");
		test(getCell(2, 3), getCell(1, 1), getCell(2, 1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
		}, "Cell in scrollable column: ArrowDown");
		test(getCell(2, 3), getCell(1, 1), getCell(1, 0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT, false, false, false);
		}, "Cell in scrollable column: ArrowLeft");
		test(getCell(2, 3), getCell(1, 1), getCell(1, 2), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT, false, false, false);
		}, "Cell in scrollable column: ArrowRight");

		// Row action cell
		test(getCell(2, 2), getRowAction(1), getRowAction(0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
		}, "Row action cell: ArrowUp");
		test(getCell(2, 2), getRowAction(1), getRowAction(2), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
		}, "Row action cell: ArrowDown");
		test(getCell(2, 2), getRowAction(1), getCell(1, oTable.columnCount - 1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT, false, false, false);
		}, "Row action cell: ArrowLeft");
		test(getCell(2, 2), getRowAction(1), getRowAction(1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT, false, false, false);
		}, "Row action cell: ArrowRight");
	});

	QUnit.module("Navigation > After changing the DOM structure", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			}, function(oTable) {
				oTable.addColumn(new Column({
					label: new this.TestControl({text: "ColA"}),
					template: new this.TestControl({text: "content"})
				}));
				oTable.addColumn(new Column({
					label: new this.TestControl({text: "ColB"}),
					template: new this.TestControl({text: "content"})
				}));
			}.bind(this));

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		TestControl: TableQUnitUtils.TestControl
	});

	QUnit.test("Add column (focus on data cell)", function(assert) {
		var oTable = this.oTable;
		var TestControl = this.TestControl;

		oTable.qunit.getDataCell(1, 1).focus();
		oTable.insertColumn(new Column({
			template: new TestControl({text: "new"})
		}), 0);
		oCore.applyChanges();

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(1, 1), "The cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(1, 0), "ArrowLeft -> The cell to the left is focused");

			oTable.qunit.getDataCell(1, 1).focus();
			oTable.addColumn(new Column({
				template: new TestControl({text: "new"})
			}));
			oCore.applyChanges();

		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(1, 1), "The cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(1, 2), "ArrowRight -> The cell to the right is focused");
		});
	});

	QUnit.test("Add column (focus on header cell)", function(assert) {
		var oTable = this.oTable;
		var TestControl = this.TestControl;

		oTable.qunit.getColumnHeaderCell(1).focus();
		oTable.insertColumn(new Column({
			template: new TestControl({text: "new"})
		}), 0);
		oCore.applyChanges();

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getColumnHeaderCell(2), "The same cell is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getColumnHeaderCell(1), "ArrowLeft -> The cell to the left is focused");

			oTable.qunit.getColumnHeaderCell(1).focus();
			oTable.addColumn(new Column({
				template: new TestControl({text: "new"})
			}));
			oCore.applyChanges();

		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getColumnHeaderCell(1), "The same cell is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getColumnHeaderCell(2), "ArrowRight -> The cell to the right is focused");
		});
	});

	QUnit.test("Fix first column", function(assert) {
		var oTable = this.oTable;

		oTable.qunit.getDataCell(1, 1).focus();
		oTable.setFixedColumnCount(1);
		oCore.applyChanges();

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(1, 1), "The cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(1, 0), "ArrowLeft -> The cell to the left is focused");
		});
	});

	QUnit.test("Add row", function(assert) {
		var oTable = this.oTable;

		oTable.qunit.getDataCell(2, 1).focus();
		oTable.getRowMode().setRowCount(oTable.getRowMode().getRowCount() + 1);
		oCore.applyChanges();

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(2, 1), "The cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(3, 1), "ArrowDown -> The cell below is focused");
		});
	});

	QUnit.test("Fix first row", function(assert) {
		var oTable = this.oTable;

		oTable.qunit.getDataCell(1, 1).focus();
		oTable.getRowMode().setFixedTopRowCount(1);
		oCore.applyChanges();

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(1, 1), "The cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 1), "ArrowUp -> The cell above is focused");
		});
	});

	QUnit.test("Resize - Auto row mode", function(assert) {
		var oTable = this.oTable;

		oTable.setRowMode(RowModeType.Auto);
		oCore.applyChanges();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.qunit.getDataCell(1, 1).focus();

		}).then(oTable.qunit.$resize({height: "500px"})).then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(1, 1),
				"Height decreased: The data cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 1), "ArrowUp -> The data cell above is focused");

			oTable.qunit.getDataCell(1, 1).focus();

		}).then(oTable.qunit.resetSize).then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(1, 1),
				"Height increased: The data cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 1), "ArrowUp -> The data cell above is focused");

			oTable.qunit.getDataCell(0, 1).focus();

		}).then(oTable.qunit.$resize({height: "500px"})).then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 1),
				"Height decreased: The data cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getColumnHeaderCell(1), "ArrowUp -> The header cell above is focused");

			oTable.qunit.getDataCell(0, 1).focus();

		}).then(oTable.qunit.resetSize).then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 1),
				"Height increased: The header cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getColumnHeaderCell(1), "ArrowUp -> The header cell above is focused");

			oTable.qunit.getColumnHeaderCell(1).focus();

		}).then(oTable.qunit.$resize({height: "500px"})).then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getColumnHeaderCell(1),
				"Height decreased: The header cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 1), "ArrowDown -> The data cell below is focused");

			oTable.qunit.getColumnHeaderCell(1).focus();

		}).then(oTable.qunit.resetSize).then(function() {
			assert.strictEqual(document.activeElement, oTable.qunit.getColumnHeaderCell(1),
				"Height increased: The header cell at the same position is focused");

			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 1), "ArrowDown -> The data cell below is focused");
		});
	});

	QUnit.module("Interaction > Shift+Up & Shift+Down (Range Selection)", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				selectionBehavior: library.SelectionBehavior.Row,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					["A", "B", "C", "D", "E", "F"].map(function(sText) {
						return TableQUnitUtils.createTextColumn({
							label: sText,
							text: sText,
							bind: true
						});
					})
				]
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertSelection: function(assert, iIndex, bSelected) {
			assert.equal(this.oTable.isIndexSelected(iIndex), bSelected, "Row " + (iIndex + 1) + ": " + (bSelected ? "" : "Not ") + "Selected");
		},
		getCellOrRowHeader: function(bRowHeader, iRowIndex, iColumnIndex, bFocus) {
			var oCell;

			if (bRowHeader) {
				oCell = this.oTable.qunit.getRowHeaderCell(iRowIndex);
			} else {
				oCell = this.oTable.qunit.getDataCell(iRowIndex, iColumnIndex);
			}

			if (bFocus) {
				oCell.focus();
			}

			return jQuery(oCell);
		},

		/**
		 * A test for range selection and deselection.
		 * Start from the middle of the table -> Move up to the top -> Move down to the bottom -> Move up to the starting row.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @returns {Promise} A promise that resolves after the test completes.
		 * @private
		 */
		testRangeSelection: function(assert) {
			var iVisibleRowCount = this.oTable._getRowCounts().count;
			var iStartIndex = Math.floor(iNumberOfRows / 2);
			var i;
			var that = this;

			function test(bSelect, bRowHeader) {
				// Prepare selection states. Set the selection states of the first and last row equal to the selection state of the starting row
				// to see if already correctly set selection states are preserved.
				that.oTable.clearSelection();
				if (bSelect) {
					that.oTable.addSelectionInterval(0, 0);
					that.oTable.addSelectionInterval(iStartIndex, iStartIndex);
					that.oTable.addSelectionInterval(iNumberOfRows - 1, iNumberOfRows - 1);
				} else {
					that.oTable.selectAll();
					that.oTable.removeSelectionInterval(0, 0);
					that.oTable.removeSelectionInterval(iStartIndex, iStartIndex);
					that.oTable.removeSelectionInterval(iNumberOfRows - 1, iNumberOfRows - 1);
				}
				that.oTable.setFirstVisibleRow(iStartIndex);
				oCore.applyChanges();

				/*eslint-disable no-loop-func*/
				return that.oTable.qunit.whenRenderingFinished().then(function() {
					var oElem = that.getCellOrRowHeader(bRowHeader, 0, 0, true);

					oElem.focus();

					var pSequence = Promise.resolve().then(function() {
						that.assertSelection(assert, iStartIndex, bSelect);
						qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.
					});

					// Move up to the first row. All rows above the starting row should get (de)selected.
					for (i = iStartIndex - 1; i >= 0; i--) {
						(function() {
							var iIndex = i;
							var oTarget = oElem;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oTarget, Key.Arrow.UP, true, false, false);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								var mRowCounts = that.oTable._getRowCounts();

								if (iIndex >= mRowCounts.fixedTop && i < iNumberOfRows - mRowCounts.count + mRowCounts.fixedTop + 1) {
									iIndex = mRowCounts.fixedTop;
								} else if (iIndex >= iNumberOfRows - mRowCounts.count + mRowCounts.fixedTop + 1) {
									iIndex = iIndex - (iNumberOfRows - mRowCounts.count);
								}

								oElem = that.getCellOrRowHeader(bRowHeader, iIndex, 0);
								that.assertSelection(assert, that.oTable.getRows()[iIndex].getIndex(), bSelect);
							});
						}());
					}

					pSequence = pSequence.then(function() {
						qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
						that.assertSelection(assert, 0, bSelect);
					});

					// Move down to the starting row. When moving back down the rows always get deselected.
					for (i = 1; i <= iStartIndex; i++) {
						(function() {
							var mRowCounts = that.oTable._getRowCounts();
							var iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								if (iIndex >= iVisibleRowCount - mRowCounts.fixedBottom && iIndex < iNumberOfRows - mRowCounts.fixedBottom) {
									iIndex = iVisibleRowCount - mRowCounts.fixedBottom - 1;
								} else if (iIndex >= iNumberOfRows - mRowCounts.fixedBottom) {
									iIndex = iIndex - (iNumberOfRows - iVisibleRowCount);
								}
								oElem = that.getCellOrRowHeader(bRowHeader, iIndex, 0);

								that.assertSelection(assert, that.oTable.getRows()[iIndex - 1].getIndex(), false);
							});
						}());
					}

					pSequence = pSequence.then(function() {
						that.assertSelection(assert, iStartIndex, bSelect); // Selection state of the starting row never gets changed.
					});

					// Move down to the last row. All rows beneath the starting row should get (de)selected.
					for (i = iStartIndex + 1; i < iNumberOfRows; i++) {
						(function() {
							var mRowCounts = that.oTable._getRowCounts();
							var iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								if (iIndex >= iVisibleRowCount - mRowCounts.fixedBottom && iIndex < iNumberOfRows - mRowCounts.fixedBottom) {
									iIndex = iVisibleRowCount - mRowCounts.fixedBottom - 1;
								} else if (iIndex >= iNumberOfRows - mRowCounts.fixedBottom) {
									iIndex = iIndex - (iNumberOfRows - iVisibleRowCount);
								}
								oElem = that.getCellOrRowHeader(bRowHeader, iIndex, 0);

								that.assertSelection(assert, that.oTable.getRows()[iIndex].getIndex(), bSelect);
							});
						}());
					}

					// Move up to the starting row. When moving back up the rows always get deselected
					for (i = iNumberOfRows - 2; i >= iStartIndex; i--) {
						(function() {
							var iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								var mRowCounts = that.oTable._getRowCounts();

								if (iIndex >= mRowCounts.fixedTop && iIndex < iNumberOfRows - mRowCounts.count + mRowCounts.fixedTop + 1) {
									iIndex = mRowCounts.fixedTop;
								} else if (iIndex >= iNumberOfRows - mRowCounts.count + mRowCounts.fixedTop + 1) {
									iIndex = iIndex - (iNumberOfRows - mRowCounts.count);
								}

								oElem = that.getCellOrRowHeader(bRowHeader, iIndex, 0);

								that.assertSelection(assert, that.oTable.getRows()[iIndex + 1].getIndex(), false);
							});
						}());
					}

					pSequence = pSequence.then(function() {
						that.assertSelection(assert, iStartIndex, bSelect); // Selection state of the starting row never gets changed.
					});

					return pSequence;
				}).then(function() {
					/* Cancellation of the row selection mode. */

					// Prepare selection states.
					if (bSelect) {
						that.oTable.clearSelection();
						that.oTable.addSelectionInterval(iStartIndex, iStartIndex);
					} else {
						that.oTable.selectAll();
						that.oTable.removeSelectionInterval(iStartIndex, iStartIndex);
					}
					that.oTable.setFirstVisibleRow(iStartIndex - (iVisibleRowCount - 1));
					oCore.applyChanges();
				}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
					var oElem = that.getCellOrRowHeader(bRowHeader, iVisibleRowCount - 1, 0, true);
					var pSequence = Promise.resolve();

					// Move down to the last row. All rows beneath the starting row should get (de)selected.
					for (i = iStartIndex + 1; i < iNumberOfRows; i++) {
						(function() {
							var mRowCounts = that.oTable._getRowCounts();
							var iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								if (iIndex >= iVisibleRowCount - mRowCounts.fixedBottom && iIndex < iNumberOfRows - mRowCounts.fixedBottom) {
									iIndex = iVisibleRowCount - mRowCounts.fixedBottom - 1;
								} else if (iIndex >= iNumberOfRows - mRowCounts.fixedBottom) {
									iIndex = iIndex - (iNumberOfRows - iVisibleRowCount);
								}
								oElem = that.getCellOrRowHeader(bRowHeader, iIndex, 0);

								that.assertSelection(assert, that.oTable.getRows()[iIndex].getIndex(), bSelect);
							});
						}());
					}

					pSequence = pSequence.then(function() {
						qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false); // End selection mode.
					});

					// Move up to the starting row. Selection states should not change because selection mode was canceled.
					for (i = iNumberOfRows - 2; i >= iStartIndex; i--) {
						(function() {
							var iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, false);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								var mRowCounts = that.oTable._getRowCounts();

								if (iIndex >= mRowCounts.fixedTop && iIndex < iNumberOfRows - mRowCounts.count
									+ mRowCounts.fixedTop + 1) {
									iIndex = mRowCounts.fixedTop;
								} else if (iIndex >= iNumberOfRows - mRowCounts.count + mRowCounts.fixedTop + 1) {
									iIndex = iIndex - (iNumberOfRows - mRowCounts.count);
								}

								oElem = that.getCellOrRowHeader(bRowHeader, iIndex, 0);

								that.assertSelection(assert, that.oTable.getRows()[iIndex + 1].getIndex(), bSelect);
							});
						}());
					}

					pSequence = pSequence.then(function() {
						that.assertSelection(assert, iStartIndex, bSelect); // Selection state of the starting row never gets changed.
						qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false); // Start selection mode.
					});

					// Move up to the first row. All rows above the starting row should get (de)selected.
					for (i = iStartIndex - 1; i >= 0; i--) {
						(function() {
							var iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								var mRowCounts = that.oTable._getRowCounts();

								if (iIndex >= mRowCounts.fixedTop && iIndex < iNumberOfRows - mRowCounts.count + mRowCounts.fixedTop + 1) {
									iIndex = mRowCounts.fixedTop;
								} else if (iIndex >= iNumberOfRows - mRowCounts.count + mRowCounts.fixedTop + 1) {
									iIndex = iIndex - (iNumberOfRows - mRowCounts.count);
								}

								oElem = that.getCellOrRowHeader(bRowHeader, iIndex, 0);
								that.assertSelection(assert, that.oTable.getRows()[iIndex].getIndex(), bSelect);
							});
						}());
					}

					pSequence = pSequence.then(function() {
						qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false); // End selection mode.
					});

					// Move down to the starting row. Selection states should not change because selection mode was canceled.
					for (i = 1; i <= iStartIndex; i++) {
						(function() {
							var mRowCounts = that.oTable._getRowCounts();
							var iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, false);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								if (iIndex >= iVisibleRowCount - mRowCounts.fixedTop && iIndex < iNumberOfRows - mRowCounts.fixedTop) {
									iIndex = iVisibleRowCount - mRowCounts.fixedTop - 1;
								} else if (iIndex >= iNumberOfRows - mRowCounts.fixedTop) {
									iIndex = iIndex - (iNumberOfRows - iVisibleRowCount);
								}
								oElem = that.getCellOrRowHeader(bRowHeader, iIndex, 0);

								that.assertSelection(assert, that.oTable.getRows()[iIndex - 1].getIndex(), bSelect);
							});
						}());
					}

					return pSequence;
				});
				/*eslint-enable no-loop-func*/
			}

			return test(true, true).then(function() {
				return test(true, false);
			}).then(function() {
				return test(false, true);
			}).then(function() {
				return test(false, false);
			});
		}
	});

	QUnit.test("Enter and Leave the Range Selection mode", function(assert) {
		var oElem = this.oTable.qunit.getRowHeaderCell(0);

		oElem.focus();
		assert.ok(this.oTable._oRangeSelection === undefined, "Range Selection Mode: Not active");

		// Start selection mode.
		qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false);
		assert.ok(this.oTable._oRangeSelection !== undefined, "Range Selection Mode: Active");

		// End selection mode.
		qutils.triggerKeyup(oElem, Key.SHIFT, false, false, false);
		assert.ok(this.oTable._oRangeSelection === undefined, "Range Selection Mode: Not active");

		// Start selection mode.
		qutils.triggerKeydown(oElem, Key.SHIFT, true, false, false);
		assert.ok(this.oTable._oRangeSelection !== undefined, "Range Selection Mode: Active");

		// End selection mode.
		qutils.triggerKeyup(oElem, Key.SHIFT, true, false, false);
		assert.ok(this.oTable._oRangeSelection === undefined, "Range Selection Mode: Not active");
	});

	QUnit.test("Default Test Table - Reverse Range Selection", function(assert) {
		return this.testRangeSelection(assert);
	});

	QUnit.test("Fixed Rows - Reverse Range Selection", function(assert) {
		return this.testRangeSelection(assert);
	});

	QUnit.test("Default Test Table - Move between Row Header and Row", function(assert) {
		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.oTable.setSelectedIndex(0);
		oCore.applyChanges();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			var oElem = this.oTable.qunit.getRowHeaderCell(0);

			// Start selection mode.
			oElem.focus();
			qutils.triggerKeydown(oElem, Key.SHIFT, false, false, false);

			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
			oElem = this.oTable.qunit.getDataCell(0, 0);
			this.assertSelection(assert, 0, true);
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
			oElem = this.oTable.qunit.getDataCell(1, 0);
			this.assertSelection(assert, 1, true);
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
			oElem = this.oTable.qunit.getRowHeaderCell(1);
			this.assertSelection(assert, 1, true);
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true, false, false);
			oElem = this.oTable.qunit.getRowHeaderCell(2);
			this.assertSelection(assert, 2, true);
			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true, false, false);
			oElem = this.oTable.qunit.getDataCell(2, 0);
			this.assertSelection(assert, 2, true);
			qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
			oElem = this.oTable.qunit.getDataCell(1, 0);
			this.assertSelection(assert, 2, false);
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true, false, false);
			oElem = this.oTable.qunit.getRowHeaderCell(1);
			this.assertSelection(assert, 2, false);
			qutils.triggerKeydown(oElem, Key.Arrow.UP, true, false, false);
			this.assertSelection(assert, 1, false);
		}.bind(this));
	});

	QUnit.module("Interaction > Shift+Left & Shift+Right (Column Resizing)", {
		beforeEach: function() {
			setupTest();
			oTable._getVisibleColumns()[2].setResizable(false);
			oCore.applyChanges();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Default Test Table - Resize fixed column", function(assert) {
		var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		var iColumnResizeStep = TableUtils.convertCSSSizeToPixel("1rem");
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
		var iColumnResizeStep = TableUtils.convertCSSSizeToPixel("1rem");
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
		oCore.applyChanges();

		var aVisibleColumns = oTable._getVisibleColumns();
		var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		var iColumnResizeStep = TableUtils.convertCSSSizeToPixel("1rem");
		var oElem;

		function test(aResizingColumns, aNotResizingColumns) {
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
		test.call(this, [aVisibleColumns[0], aVisibleColumns[1]], [aVisibleColumns[2]]);

		// Second row - First span over 2 columns
		oElem = document.getElementById(getColumnHeader(0).attr("id") + "_1");
		oElem.focus();
		test.call(this, [aVisibleColumns[0], aVisibleColumns[1]], aVisibleColumns[2]);

		// Last row - Second column
		oElem = document.getElementById(getColumnHeader(1).attr("id") + "_2");
		oElem.focus();
		test.call(this, [aVisibleColumns[1]], [aVisibleColumns[0], aVisibleColumns[2]]);
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

	QUnit.module("Interaction > Ctrl+Left & Ctrl+Right (Column Reordering)", {
		beforeEach: function() {
			setupTest();
			oTable.setFixedColumnCount(0);
			oCore.applyChanges();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Default Test Table - Move columns", function(assert) {
		var oFirstColumn = oTable.getColumns()[0];
		var oLastColumn = oTable.getColumns()[oTable.columnCount - 1];
		var iOldColumnIndex;

		// First column.
		iOldColumnIndex = oFirstColumn.getIndex();
		oFirstColumn.focus();
		qutils.triggerKeydown(getColumnHeader(0), Key.Arrow.LEFT, false, false, true);

		return new Promise(function(resolve) {
			window.setTimeout(function() {
				assert.strictEqual(oFirstColumn.getIndex(), iOldColumnIndex, "First column was not moved to the left");
				qutils.triggerKeydown(getColumnHeader(0), Key.Arrow.RIGHT, false, false, true);
				resolve();
			}, 0);
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oFirstColumn.getIndex(), iOldColumnIndex + 1, "First column was moved to the right");
					iOldColumnIndex = oFirstColumn.getIndex();
					qutils.triggerKeydown(getColumnHeader(1), Key.Arrow.LEFT, false, false, true);
					resolve();
				}, 0);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oFirstColumn.getIndex(), iOldColumnIndex - 1, "It was moved back to the left");

					// Last column.
					iOldColumnIndex = oLastColumn.getIndex();
					qutils.triggerKeydown(getColumnHeader(oTable.columnCount - 1), Key.Arrow.RIGHT, false, false, true);
					resolve();
				}, 0);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oLastColumn.getIndex(), iOldColumnIndex, "Last column was not moved to the right");
					qutils.triggerKeydown(getColumnHeader(oTable.columnCount - 1), Key.Arrow.LEFT, false, false, true);
					resolve();
				}, 0);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oLastColumn.getIndex(), iOldColumnIndex - 1, "Last column was moved to the left");
					iOldColumnIndex = oLastColumn.getIndex();
					qutils.triggerKeydown(getColumnHeader(oTable.columnCount - 2), Key.Arrow.RIGHT, false, false, true);
					resolve();
				}, 0);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oLastColumn.getIndex(), iOldColumnIndex + 1, "It was moved back to the right");
					resolve();
				}, 0);
			});
		});
	});

	QUnit.test("Fixed Columns - Move fixed columns", function(assert) {
		oTable.setFixedColumnCount(2);
		oCore.applyChanges();

		var oFirstFixedColumn = oTable.getColumns()[0];
		var oLastFixedColumn = oTable.getColumns()[1];
		var iOldColumnIndex;

		// First fixed column.
		iOldColumnIndex = oFirstFixedColumn.getIndex();
		qutils.triggerKeydown(getColumnHeader(0), Key.Arrow.LEFT, false, false, true);

		return new Promise(function(resolve) {
			window.setTimeout(function() {
				assert.strictEqual(oFirstFixedColumn.getIndex(), iOldColumnIndex, "First fixed column was not moved to the left");
				qutils.triggerKeydown(getColumnHeader(0), Key.Arrow.RIGHT, false, false, true);
				resolve();
			}, 0);
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oFirstFixedColumn.getIndex(), iOldColumnIndex, "First fixed column was not moved to the right");

					// Last fixed column.
					iOldColumnIndex = oLastFixedColumn.getIndex();
					qutils.triggerKeydown(getColumnHeader(1), Key.Arrow.RIGHT, false, false, true);
					resolve();
				}, 0);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oLastFixedColumn.getIndex(), iOldColumnIndex, "Last fixed column was not moved to the right");
					qutils.triggerKeydown(getColumnHeader(1), Key.Arrow.LEFT, false, false, true);
					resolve();
				}, 0);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				assert.strictEqual(oLastFixedColumn.getIndex(), iOldColumnIndex, "Last fixed column was not moved to the left");
				resolve();
			});
		});
	});

	QUnit.test("Fixed Columns - Move scrollable columns", function(assert) {
		oTable.setFixedColumnCount(2);
		oCore.applyChanges();

		var oFirstColumn = oTable.getColumns()[2];
		var oLastColumn = oTable.getColumns()[oTable.columnCount - 1];
		var iOldColumnIndex;

		// First scrollable column.
		iOldColumnIndex = oFirstColumn.getIndex();
		qutils.triggerKeydown(getColumnHeader(2), Key.Arrow.LEFT, false, false, true);

		return new Promise(function(resolve) {
			window.setTimeout(function() {
				assert.strictEqual(oFirstColumn.getIndex(), iOldColumnIndex, "First movable column was not moved to the left");
				qutils.triggerKeydown(getColumnHeader(2), Key.Arrow.RIGHT, false, false, true);
				resolve();
			}, 0);
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oFirstColumn.getIndex(), iOldColumnIndex + 1, "First movable column was moved to the right");
					iOldColumnIndex = oFirstColumn.getIndex();
					qutils.triggerKeydown(getColumnHeader(3), Key.Arrow.LEFT, false, false, true);
					resolve();
				}, 0);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oFirstColumn.getIndex(), iOldColumnIndex - 1, "It was moved back to the left");

					// Last scrollable column.
					iOldColumnIndex = oLastColumn.getIndex();
					qutils.triggerKeydown(getColumnHeader(oTable.columnCount - 1), Key.Arrow.RIGHT, false, false, true);
					resolve();
				}, 0);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oLastColumn.getIndex(), iOldColumnIndex, "Last movable column was not moved to the right");
					qutils.triggerKeydown(getColumnHeader(oTable.columnCount - 1), Key.Arrow.LEFT, false, false, true);
					resolve();
				}, 0);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oLastColumn.getIndex(), iOldColumnIndex - 1, "Last movable column was moved to the left");
					iOldColumnIndex = oLastColumn.getIndex();
					qutils.triggerKeydown(getColumnHeader(oTable.columnCount - 2), Key.Arrow.RIGHT, false, false, true);
					resolve();
				}, 0);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.strictEqual(oLastColumn.getIndex(), iOldColumnIndex + 1, "It was moved back to the right");
					resolve();
				}, 0);
			});
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
	 * @deprecated As of Version 1.117
	 */
	function _testColumnHeaderContextMenus(sKey, bKeyDown, bShift, assert) {
		return new Promise(function(resolve) {
			var oColumn = oTable.getColumns()[0];
			var oElem = checkFocus(getColumnHeader(0, true), assert);

			oColumn.attachEventOnce("columnMenuOpen", function() {
				TableQUnitUtils.wait(0).then(function() {
					var oColumnMenu = oColumn.getMenu();

					assert.ok(oColumnMenu.bOpen, "Menu is opened");
					var bFirstItemHovered = oColumnMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
					assert.strictEqual(bFirstItemHovered, true, "The first item in the menu is hovered");
					qutils.triggerKeydown(document.activeElement, Key.ESCAPE, false, false, false);
					assert.ok(!oColumnMenu.bOpen, "Menu is closed");
					checkFocus(oElem, assert);

					oColumnMenu.close();
					return resolve();
				});
			});

			oColumn.setSortProperty("dummy");
			oColumn._openHeaderMenu(oColumn.getDomRef());
		});
	}

	QUnit.module("Interaction > Space & Enter", {
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

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("On a Column Header", function(assert) {
		var done = assert.async();
		_testColumnHeaderContextMenus(Key.SPACE, false, false, assert).then(function() {
			return _testColumnHeaderContextMenus(Key.ENTER, false, false, assert);
		}).then(done);
	});

	QUnit.test("On SelectAll", function(assert) {
		oTable.clearSelection();
		oCore.applyChanges();

		var oElem = checkFocus(getSelectAll(true), assert);

		// Space
		assert.ok(oTable.getSelectedIndices().length === 0, "No rows are selected");
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
		assert.ok(legacyAreAllRowsSelected(oTable), "All rows are selected");
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
		assert.ok(oTable.getSelectedIndices().length === 0, "No rows are selected");
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, true);
		assert.ok(oTable.getSelectedIndices().length === 0, "No rows are selected");

		// Enter
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
		assert.ok(legacyAreAllRowsSelected(oTable), "All rows are selected");
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
		assert.ok(oTable.getSelectedIndices().length === 0, "No rows are selected");
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, true);
		assert.ok(oTable.getSelectedIndices().length === 0, "No rows are selected");
	});

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.test("On SelectAll - legacyMultiSelection", function(assert) {
		oTable.clearSelection();
		oCore.applyChanges();

		var oElem = checkFocus(getSelectAll(true), assert);

		oTable._enableLegacyMultiSelection();
		// Space
		assert.ok(oTable.getSelectedIndices().length === 0, "No rows are selected");
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
		assert.ok(legacyAreAllRowsSelected(oTable), "All rows are selected");
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
		assert.ok(oTable.getSelectedIndices().length === 0, "No rows are selected");
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, true);
		assert.ok(oTable.getSelectedIndices().length === 0, "No rows are selected");

		// Enter
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
		assert.ok(legacyAreAllRowsSelected(oTable), "All rows are selected");
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
		assert.ok(oTable.getSelectedIndices().length === 0, "No rows are selected");
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, true);
		assert.ok(oTable.getSelectedIndices().length === 0, "No rows are selected");
	});

	QUnit.test("On a Row Header", function(assert) {
		oTable.clearSelection();
		oCore.applyChanges();

		var oElem1 = checkFocus(getRowHeader(0, true), assert);

		// Space
		this.assertSelection(assert, 0, false);
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, true);
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, false);
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, true);
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, false);

		// Enter
		qutils.triggerKeydown(oElem1, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, true);
		qutils.triggerKeydown(oElem1, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, false);
	});

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.test("On a Row Header - legacyMultiSelection", function(assert) {
		oTable.clearSelection();
		oCore.applyChanges();

		var oElem1 = checkFocus(getRowHeader(0, true), assert);
		var oElem2 = checkFocus(getRowHeader(1, true), assert);

		oTable._enableLegacyMultiSelection();
		//Space
		qutils.triggerKeyup(oElem2, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeyup(oElem2, Key.SPACE, false, false, true);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, true);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, true);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem2, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);

		qutils.triggerKeydown(oElem2, Key.SHIFT, false, false, false); // Start selection mode.
		qutils.triggerKeydown(oElem2, Key.Arrow.UP, true, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeydown(oElem2, Key.Arrow.DOWN, true, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeyup(oElem2, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);

		//Enter
		qutils.triggerKeydown(oElem2, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeydown(oElem1, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeyup(oElem2, Key.ENTER, false, false, true);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem1, Key.ENTER, false, false, true);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem1, Key.ENTER, false, false, true);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeydown(oElem2, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);
	});

	QUnit.test("On a Data Cell - SelectionBehavior = Row", function(assert) {
		var iCallCount = 0;
		var bPreventDefault = false;

		oTable.clearSelection();
		oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		oTable.attachCellClick(function(oEvent) {
			iCallCount++;
			if (bPreventDefault) {
				oEvent.preventDefault();
			}
		});
		oCore.applyChanges();

		var oElem1 = checkFocus(getCell(0, 0, true), assert);

		// Space
		this.assertSelection(assert, 0, false);
		assert.strictEqual(iCallCount, 0, "Click handler not called");
		iCallCount = 0;
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, true);
		assert.strictEqual(iCallCount, 1, "Click handler called");
		iCallCount = 0;
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(iCallCount, 1, "Click handler called");
		iCallCount = 0;
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, true);
		assert.strictEqual(iCallCount, 0, "Click handler called");
		iCallCount = 0;
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(iCallCount, 0, "Click handler called");
		iCallCount = 0;
		bPreventDefault = true;
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(iCallCount, 1, "Click handler called but selection not changed");
		iCallCount = 0;
		bPreventDefault = false;

		// Enter
		qutils.triggerKeydown(oElem1, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, true);
		assert.strictEqual(iCallCount, 1, "Click handler called");
		iCallCount = 0;
		qutils.triggerKeydown(oElem1, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(iCallCount, 1, "Click handler called");
		iCallCount = 0;
		bPreventDefault = true;
		qutils.triggerKeydown(oElem1, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(iCallCount, 1, "Click handler called but selection not changed");
		iCallCount = 0;
		bPreventDefault = false;
	});

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.test("On a Data Cell - SelectionBehavior = Row - legacyMultiSelection", function(assert) {
		var iCallCount = 0;
		var bPreventDefault = false;

		oTable.clearSelection();
		oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		oTable.attachCellClick(function(oEvent) {
			iCallCount++;
			if (bPreventDefault) {
				oEvent.preventDefault();
			}
		});
		oCore.applyChanges();

		var oElem1 = checkFocus(getCell(0, 0, true), assert);
		var oElem2 = checkFocus(getCell(1, 0, true), assert);
		oTable._enableLegacyMultiSelection();
		// Space
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, false);
		assert.strictEqual(iCallCount, 0, "Click handler not called");
		iCallCount = 0;
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, true);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, false);
		assert.strictEqual(iCallCount, 1, "Click handler called");
		iCallCount = 0;
		qutils.triggerKeyup(oElem2, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);
		assert.strictEqual(iCallCount, 1, "Click handler called");

		qutils.triggerKeydown(oElem2, Key.SHIFT, false, false, false); // Start selection mode.
		qutils.triggerKeydown(oElem2, Key.Arrow.UP, true, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeydown(oElem2, Key.Arrow.DOWN, true, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeyup(oElem2, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);

		iCallCount = 0;
		bPreventDefault = true;
		qutils.triggerKeyup(oElem2, Key.SPACE, false, false, true);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, true);
		assert.strictEqual(iCallCount, 1, "Click handler called but selection not changed");
		iCallCount = 0;
		bPreventDefault = false;

		// Enter
		qutils.triggerKeydown(oElem1, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, false);
		assert.strictEqual(iCallCount, 1, "Click handler called");
		iCallCount = 0;
		qutils.triggerKeyup(oElem2, Key.ENTER, false, false, true);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		assert.strictEqual(iCallCount, 1, "Click handler called");
		iCallCount = 0;
		bPreventDefault = true;
		qutils.triggerKeyup(oElem2, Key.ENTER, false, false, true);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		assert.strictEqual(iCallCount, 1, "Click handler called but selection not changed");
		iCallCount = 0;
		bPreventDefault = false;
	});

	QUnit.test("On a Data Cell - SelectionBehavior = RowSelector", function(assert) {
		var cellClickEventHandler = this.spy();

		oTable.clearSelection();
		oTable.attachCellClick(cellClickEventHandler);
		oCore.applyChanges();

		var oElem1 = checkFocus(getCell(0, 0, true), assert);

		// Space
		this.assertSelection(assert, 0, false);
		assert.strictEqual(cellClickEventHandler.callCount, 0, "Click handler not called");
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(cellClickEventHandler.callCount, 1, "Click handler called: 1");
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(cellClickEventHandler.callCount, 2, "Click handler called: 2");

		// Enter
		qutils.triggerKeydown(oElem1, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(cellClickEventHandler.callCount, 3, "Click handler called: 3");
		qutils.triggerKeydown(oElem1, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(cellClickEventHandler.callCount, 4, "Click handler called: 4");
	});

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.test("On a Data Cell - SelectionBehavior = RowSelector - legacyMultiSelection", function(assert) {
		var cellClickEventHandler = this.spy();

		oTable.clearSelection();
		oTable.attachCellClick(cellClickEventHandler);
		oCore.applyChanges();

		var oElem2 = checkFocus(getCell(1, 0, true), assert);
		var oElem1 = checkFocus(getCell(0, 0, true), assert);

		oTable._enableLegacyMultiSelection();
		// Space
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(cellClickEventHandler.callCount, 1, "Click handler called: 1");
		qutils.triggerKeyup(oElem1, Key.SPACE, false, false, true);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(cellClickEventHandler.callCount, 2, "Click handler called: 2");

		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, true);
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, false);

		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeydown(oElem1, Key.SHIFT, false, false, false); // Start selection mode.
		qutils.triggerKeydown(oElem1, Key.Arrow.DOWN, true, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem2, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeydown(oElem2, Key.Arrow.UP, true, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, false);

		// Enter
		qutils.triggerKeydown(oElem1, Key.ENTER, false, false, false);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(cellClickEventHandler.callCount, 3, "Click handler called: 3");
		qutils.triggerKeyup(oElem1, Key.ENTER, false, false, true);
		this.assertSelection(assert, 0, false);
		assert.strictEqual(cellClickEventHandler.callCount, 4, "Click handler called: 4");
	});

	QUnit.test("On a Row Action Cell - SelectionBehavior = RowSelector", function(assert) {
		var cellClickEventHandler = this.spy();

		oTable.clearSelection();
		oTable.attachCellClick(cellClickEventHandler);
		oCore.applyChanges();

		var oElem2 = checkFocus(getCell(1, 0, true), assert);
		var oElem1 = checkFocus(getCell(0, 0, true), assert);

		// Shift + Space, Shift + UP/DOWN
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeyup(oElem1, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeydown(oElem1, Key.SHIFT, false, false, false); // Start selection mode.
		qutils.triggerKeydown(oElem1, Key.Arrow.DOWN, true, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeyup(oElem2, Key.SPACE, true, false, false);
		this.assertSelection(assert, 0, true);
		this.assertSelection(assert, 1, false);
		qutils.triggerKeydown(oElem2, Key.Arrow.UP, true, false, false);
		this.assertSelection(assert, 0, false);
		this.assertSelection(assert, 1, false);
	});

	QUnit.test("On a Group Header Row", function(assert) {
		var cellClickEventHandler = this.spy();
		var oElem;
		var oRowToggleExpandedState = this.spy(oTable.getRows()[0], "toggleExpandedState");

		oTable.clearSelection();
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oTable._getVisibleColumns()[0]);
		oTable.attachCellClick(cellClickEventHandler);
		oCore.applyChanges();

		function test(assert) {
			oRowToggleExpandedState.resetHistory();
			qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
			checkFocus(oElem, assert);
			this.assertSelection(assert, 0, false);
			assert.ok(cellClickEventHandler.notCalled, "Click handler not called");
			assert.equal(oRowToggleExpandedState.callCount, 1, "Space: Row#toggleExpandedState called once");

			oRowToggleExpandedState.resetHistory();
			qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
			checkFocus(oElem, assert);
			this.assertSelection(assert, 0, false);
			assert.ok(cellClickEventHandler.notCalled, "Click handler not called");
			assert.equal(oRowToggleExpandedState.callCount, 1, "Enter: Row#toggleExpandedState called once");
		}

		oElem = checkFocus(getRowHeader(0, true), assert);
		test.call(this, assert);

		oElem = checkFocus(getCell(0, 1, true), assert);
		test.call(this, assert);
	});

	QUnit.test("TreeTable - Expand/Collapse", function(assert) {
		var oRowToggleExpandedState = this.spy(oTreeTable.getRows()[0], "toggleExpandedState");

		function testCollapseExpandAndFocus(assert, $Element) {
			$Element.trigger("focus");

			oRowToggleExpandedState.resetHistory();
			qutils.triggerKeyup($Element, Key.SPACE, false, false, false);
			assert.equal(oRowToggleExpandedState.callCount, 1, "Space: Row#toggleExpandedState called once");
			checkFocus($Element, assert);

			oRowToggleExpandedState.resetHistory();
			qutils.triggerKeydown($Element, Key.ENTER, false, false, false);
			assert.equal(oRowToggleExpandedState.callCount, 1, "Enter: Row#toggleExpandedState called once");
			checkFocus($Element, assert);
		}

		function testNoCollapseExpand(assert, $Element) {
			$Element.trigger("focus");

			oRowToggleExpandedState.resetHistory();
			qutils.triggerKeyup($Element, Key.SPACE, false, false, false);
			assert.ok(oRowToggleExpandedState.notCalled, "Space: Row#toggleExpandedState not called");

			oRowToggleExpandedState.resetHistory();
			qutils.triggerKeydown($Element, Key.ENTER, false, false, false);
			assert.ok(oRowToggleExpandedState.notCalled, "Enter: Row#toggleExpandedState not called");
		}

		testCollapseExpandAndFocus(assert, getCell(0, 0, false, null, oTreeTable));
		testCollapseExpandAndFocus(assert, getCell(0, 0, false, null, oTreeTable).find(".sapUiTableTreeIcon"));
		testNoCollapseExpand(assert, getCell(0, 1, false, null, oTreeTable));
		testNoCollapseExpand(assert, getRowHeader(0, false, null, oTreeTable));
	});

	QUnit.test("TreeTable - Focus if expanded row turns into leaf", function(assert) {
		oTreeTable.expand([6, 7]);
		oTreeTable.setFirstVisibleRow(8);

		return new Promise(function(resolve) {
			oTreeTable.attachEventOnce("rowsUpdated", resolve);
		}).then(function() {
			var $Element = getCell(1, 0, false, null, oTreeTable).find(".sapUiTableTreeIcon");

			$Element.trigger("focus");
			qutils.triggerKeydown($Element, Key.ENTER, false, false, false);

			return new Promise(function(resolve) {
				oTreeTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			checkFocus(getCell(1, 0, false, null, oTreeTable), assert);
			assert.ok(!oTreeTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		});
	});

	QUnit.module("Interaction > Ctrl+A (Select/Deselect All)", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("(De)Select All possible", function(assert) {
		oTable.setSelectionMode(library.SelectionMode.MultiToggle);
		oCore.applyChanges();

		oTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(oEvent.isDefaultPrevented(), "Default action was prevented");
			}
		});

		assert.expect(20);

		var oElem = checkFocus(getSelectAll(true), assert);
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.ok(legacyAreAllRowsSelected(oTable), "On SelectAll: All rows selected");
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.ok(!legacyAreAllRowsSelected(oTable), "On SelectAll: All rows deselected");

		oElem = checkFocus(getRowHeader(0, true), assert);
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.ok(legacyAreAllRowsSelected(oTable), "On Row Header: All rows selected");
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.ok(!legacyAreAllRowsSelected(oTable), "On Row Header: All rows deselected");

		oElem = checkFocus(getCell(0, 0, true), assert);
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.ok(legacyAreAllRowsSelected(oTable), "On Data Cell: All rows selected");
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.ok(!legacyAreAllRowsSelected(oTable), "On Data Cell: All rows deselected");

		initRowActions(oTable, 2, 2);
		oElem = checkFocus(getRowAction(0, true), assert);
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.ok(legacyAreAllRowsSelected(oTable), "On Row Action: All rows selected");
		qutils.triggerKeydown(oElem, Key.A, false, false, true);
		assert.ok(!legacyAreAllRowsSelected(oTable), "On Row Action: All rows deselected");
	});

	QUnit.test("(De)Select All not possible", function(assert) {
		function test(bSelected) {
			// Mass (De)Selection on column header is never allowed, regardless of the selection mode.
			oTable.setSelectionMode(library.SelectionMode.MultiToggle);
			if (bSelected) {
				oTable.selectAll();
			} else {
				oTable.clearSelection();
			}
			oCore.applyChanges();

			var oElem = checkFocus(getColumnHeader(0, true), assert);
			qutils.triggerKeydown(oElem, Key.A, false, false, true);
			assert.strictEqual(legacyAreAllRowsSelected(oTable), bSelected,
				"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

			// Setting the selection mode to "Single" or "None" clears the selection.
			// So we can stop here as we already tested mass selection when no row is selected.
			if (bSelected) {
				return;
			}

			// Mass (De)Selection is not allowed in selection mode "Single".
			oTable.setSelectionMode(library.SelectionMode.Single);
			oCore.applyChanges();

			oElem = getColumnHeader(0, true);
			qutils.triggerKeydown(oElem, Key.A, false, false, true);
			assert.strictEqual(legacyAreAllRowsSelected(oTable), bSelected,
				"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

			oElem = checkFocus(getSelectAll(true), assert);
			qutils.triggerKeydown(oElem, Key.A, false, false, true);
			assert.strictEqual(legacyAreAllRowsSelected(oTable), bSelected,
				"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

			oElem = checkFocus(getRowHeader(0, true), assert);
			qutils.triggerKeydown(oElem, Key.A, false, false, true);
			assert.strictEqual(legacyAreAllRowsSelected(oTable), bSelected,
				"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

			oElem = checkFocus(getCell(0, 0, true), assert);
			qutils.triggerKeydown(oElem, Key.A, false, false, true);
			assert.strictEqual(legacyAreAllRowsSelected(oTable), bSelected,
				"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

			// Mass (De)Selection is not allowed in selection mode "None".
			oTable.setSelectionMode(library.SelectionMode.None);
			oCore.applyChanges();

			oElem = getCell(0, 0, true);
			qutils.triggerKeydown(oElem, Key.A, false, false, true);
			assert.strictEqual(legacyAreAllRowsSelected(oTable), bSelected,
				"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));

			oElem = checkFocus(getCell(0, 0, true), assert);
			qutils.triggerKeydown(oElem, Key.A, false, false, true);
			assert.strictEqual(legacyAreAllRowsSelected(oTable), bSelected,
				"On Column Header: All rows still " + (bSelected ? "selected" : "deselected"));
		}

		oTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(oEvent.isDefaultPrevented(), "Default action was prevented");
			}
		});

		assert.expect(22);

		test(false);
		test(true);
	});

	QUnit.test("On element that is not a cell", function(assert) {
		oTable.addExtension(new TestInputControl());
		oTable.setFooter(new TestInputControl());
		oTable.setTitle(new TestInputControl());
		oTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(!oEvent.isDefaultPrevented(), "Default action was not prevented");
			}
		});
		oCore.applyChanges();

		var oCell = getCell(0, 0)[0];
		oCell.classList.remove("sapUiTableDataCell");
		oCell.classList.add("sapUiTablePseudoCell");

		var aTestElements = [
			oTable.getExtension()[0].getDomRef(),
			oTable.getFooter().getDomRef(),
			oTable.getTitle().getDomRef(),
			oCell,
			oTable.getRows()[0].getCells()[0].getDomRef(),
			oTable.getRows()[0].getCells()[1].getDomRef()
		];

		assert.expect(aTestElements.length);

		aTestElements.forEach(function(oElement) {
			oElement.focus();
			qutils.triggerKeydown(oElement, Key.A, false, false, true);
		});
	});

	QUnit.module("Interaction > Ctrl+Shift+A (Deselect All)", {
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
			oCore.applyChanges();

			var aCells = [
				getCell(0, 0),
				getRowAction(0)
			];

			if (sSelectionMode !== library.SelectionMode.None) {
				aCells.push(getSelectAll());
				aCells.push(getRowHeader(0));
			}

			for (var i = 0; i < aCells.length; i++) {
				var oElem = aCells[i];

				oElem.trigger("focus");
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
					assert.ok(!legacyAreAllRowsSelected(oTable), "DeselectAll on cell \"" + oElem.attr("id") + "\": All rows deselected");
				}

				qutils.triggerKeydown(oElem, Key.A, true, false, true);
				assert.ok(!legacyAreAllRowsSelected(oTable), "DeselectAll on cell \"" + oElem.attr("id") + "\": All rows still deselected");
			}
		}

		initRowActions(oTable, 2, 2);
		test(library.SelectionMode.None, []);
		test(library.SelectionMode.Single, [1]);
		test(library.SelectionMode.MultiToggle, [0, 1, 2]);
	});

	QUnit.test("Deselect All not possible", function(assert) {
		function test(sSelectionMode, aSelectedIndices) {
			oTable.setSelectionMode(sSelectionMode);
			oCore.applyChanges();

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

		test(library.SelectionMode.None, []);
		test(library.SelectionMode.Single, [1]);
		test(library.SelectionMode.MultiToggle, [0, 1, 2]);
	});

	QUnit.module("Interaction > Alt+ArrowUp & Alt+ArrowDown (Expand/Collapse Group)", {
		beforeEach: function() {
			setupTest();
			oTable.setEnableGrouping(true);
			oTable.setGroupBy(oTable.getColumns()[0]);
			oCore.applyChanges();
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
			var oRowExpand = this.spy(oTable.getRows()[0], "expand");
			var oRowCollapse = this.spy(oTable.getRows()[0], "collapse");

			oCellElement.trigger("focus");

			qutils.triggerKeydown(oCellElement, Key.Arrow.DOWN, false, true, false);
			assert.equal(oRowExpand.callCount, 1, "Row#expand called once");
			checkFocus(oCellElement, assert);

			qutils.triggerKeydown(oCellElement, Key.Arrow.UP, false, true, false);
			assert.equal(oRowCollapse.callCount, 1, "Row#collapse called once");
			checkFocus(oCellElement, assert);

			oRowExpand.restore();
			oRowCollapse.restore();
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
			var oRowExpand = this.spy(oTable.getRows()[0], "expand");
			var oRowCollapse = this.spy(oTable.getRows()[0], "collapse");

			oCellElement.trigger("focus");
			qutils.triggerKeydown(oCellElement, Key.Arrow.DOWN, false, false, false);
			assert.ok(oRowExpand.notCalled, "Row#expand not called");

			oCellElement.trigger("focus");
			qutils.triggerKeydown(oCellElement, Key.Arrow.UP, false, false, false);
			assert.ok(oRowCollapse.notCalled, "Row#collapse not called");

			oRowExpand.restore();
			oRowCollapse.restore();
		}
	});

	QUnit.test("Table with grouping", function(assert) {
		function testFocus(oCellElement) {
			oCellElement.trigger("focus");
			checkFocus(oCellElement, assert);

			qutils.triggerKeydown(oCellElement, Key.Arrow.DOWN, false, true, false);
			checkFocus(oCellElement, assert);
			qutils.triggerKeydown(oCellElement, Key.Arrow.UP, false, true, false);
			checkFocus(oCellElement, assert);
		}

		oTable.invalidate();
		oCore.applyChanges();
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

	QUnit.module("Interaction > F4 (Expand/Collapse Group)", {
		beforeEach: function() {
			setupTest();
			oTable.setEnableGrouping(true);
			oTable.setGroupBy(oTable.getColumns()[0]);
			oCore.applyChanges();
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
			var oRowToggleExpandedState = this.spy(oTable.getRows()[0], "toggleExpandedState");

			oCellElement.trigger("focus");

			qutils.triggerKeydown(oCellElement, Key.F4, false, false, false);
			assert.equal(oRowToggleExpandedState.callCount, 1, "Row#toggleExpandedState called once");
			checkFocus(oCellElement, assert);

			oRowToggleExpandedState.resetHistory();
			qutils.triggerKeydown(oCellElement, Key.F4, false, false, false);
			assert.equal(oRowToggleExpandedState.callCount, 1, "Row#toggleExpandedState called once");
			checkFocus(oCellElement, assert);

			oRowToggleExpandedState.restore();
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
			var oRowToggleExpandedState = this.spy(oTable.getRows()[0], "toggleExpandedState");

			oCellElement.trigger("focus");
			qutils.triggerKeydown(oCellElement, Key.F4, false, false, false);
			assert.ok(oRowToggleExpandedState.notCalled, "Row#toggleExpandedState not called");

			oRowToggleExpandedState.resetHistory();
			oCellElement.trigger("focus");
			qutils.triggerKeydown(oCellElement, Key.F4, false, false, false);
			assert.ok(oRowToggleExpandedState.notCalled, "Row#toggleExpandedState not called");

			oRowToggleExpandedState.restore();
		}
	});

	QUnit.test("Table with grouping", function(assert) {
		function testFocus(oCellElement) {
			oCellElement.trigger("focus");
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

	QUnit.module("Interaction > Plus & Minus (Expand/Collapse Group)", {
		beforeEach: function() {
			setupTest();
			oTable.setEnableGrouping(true);
			oTable.setGroupBy(oTable.getColumns()[0]);
			oCore.applyChanges();
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
			var oRowExpand = this.spy(oTable.getRows()[0], "expand");
			var oRowCollapse = this.spy(oTable.getRows()[0], "collapse");

			oCellElement.trigger("focus");

			qutils.triggerKeypress(oCellElement, Key.PLUS, false, false, false);
			assert.equal(oRowExpand.callCount, 1, "Row#expand called once");
			checkFocus(oCellElement, assert);

			qutils.triggerKeypress(oCellElement, Key.MINUS, false, false, false);
			assert.equal(oRowCollapse.callCount, 1, "Row#collapse called once");
			checkFocus(oCellElement, assert);

			oRowExpand.restore();
			oRowCollapse.restore();
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
			var oRowExpand = this.spy(oTable.getRows()[0], "expand");
			var oRowCollapse = this.spy(oTable.getRows()[0], "collapse");

			oCellElement.trigger("focus");
			qutils.triggerKeydown(oCellElement, Key.PLUS, false, false, false);
			assert.ok(oRowExpand.notCalled, "Row#expand not called");

			oCellElement.trigger("focus");
			qutils.triggerKeydown(oCellElement, Key.MINUS, false, false, false);
			assert.ok(oRowCollapse.notCalled, "Row#collapse not called");

			oRowExpand.restore();
			oRowCollapse.restore();
		}
	});

	QUnit.test("Table with grouping", function(assert) {
		function testFocus(oCellElement) {
			oCellElement.trigger("focus");
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

	QUnit.test("TreeTable", function(assert) {
		this.testCollapseExpandAndFocus(assert, oTreeTable, getCell(0, 0, null, null, oTreeTable));
		this.testCollapseExpandAndFocus(assert, oTreeTable, getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIcon"));
		this.testNoCollapseExpand(assert, oTreeTable, getCell(0, 1, null, null, oTreeTable));
		this.testNoCollapseExpand(assert, oTreeTable, getRowHeader(0, null, null, oTreeTable));
	});

	QUnit.module("Interaction > ContextMenu", {
		beforeEach: function() {
			setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("On a cell", function(assert) {
		var oContextMenuEventHandlerSpy = this.spy(oTable._getKeyboardExtension()._delegate, "oncontextmenu");
		var oOpenContextMenuSpy = this.spy(TableUtils.Menu, "openContextMenu");

		initRowActions(oTable, 1, 1);

		var aTestElements = [
			getCell(0, 0),
			getRowHeader(0),
			getRowAction(0),
			getColumnHeader(0),
			getSelectAll()
		];

		aTestElements.forEach(function(oElem) {
			var oContextMenuEventArgument;

			oElem.trigger("focus");
			jQuery(oElem).trigger("contextmenu");
			oContextMenuEventArgument = oContextMenuEventHandlerSpy.args[0][0];

			assert.ok(oOpenContextMenuSpy.calledOnceWithExactly(oTable, oContextMenuEventArgument),
				"TableUtils.Menu.openContextMenu was called with the correct arguments");
			checkFocus(oElem, assert);
			assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

			oOpenContextMenuSpy.resetHistory();
			oContextMenuEventHandlerSpy.resetHistory();
		});
	});

	QUnit.test("On a pseudo cell", function(assert) {
		var oContextMenuEventHandlerSpy = this.spy(oTable._getKeyboardExtension()._delegate, "oncontextmenu");
		var oContextMenuEventArgument;
		var oOpenContextMenuSpy = this.spy(TableUtils.Menu, "openContextMenu");
		var oElem = getCell(0, 0)[0];

		oElem.classList.remove("sapUiTableDataCell");
		oElem.classList.add("sapUiTablePseudoCell");
		oElem.focus();
		jQuery(oElem).trigger("contextmenu");
		assert.ok(oOpenContextMenuSpy.notCalled, "TableUtils.Menu.openContextMenu was not called");
		checkFocus(oElem, assert);

		oContextMenuEventArgument = oContextMenuEventHandlerSpy.args[0][0];
		assert.ok(!oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was not prevented");

		oOpenContextMenuSpy.resetHistory();
		oContextMenuEventHandlerSpy.resetHistory();

		oElem = oTable.getRows()[0].getCells()[0].getDomRef();
		oElem.focus();
		jQuery(oElem).trigger("contextmenu");
		assert.ok(oOpenContextMenuSpy.notCalled, "TableUtils.Menu.openContextMenu was not called");
		checkFocus(oElem, assert);

		oContextMenuEventArgument = oContextMenuEventHandlerSpy.args[0][0];
		assert.ok(!oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was not prevented");
	});

	QUnit.test("On cell content", function(assert) {
		var oContextMenuEventHandlerSpy = this.spy(oTable._getKeyboardExtension()._delegate, "oncontextmenu");
		var oOpenContextMenuSpy = this.spy(TableUtils.Menu, "openContextMenu");

		oTable.getColumns()[0].setLabel(new TestInputControl());
		initRowActions(oTable, 1, 1);

		var aTestElements = [
			oTable.getRows()[0].getCells()[0].getDomRef(),
			oTable.getRows()[0].getRowAction().getAggregation("_icons")[0].getDomRef(),
			oTable.getColumns()[0].getLabel().getDomRef()
		];

		aTestElements.forEach(function(oElem) {
			oElem.focus();
			jQuery(oElem).trigger("contextmenu");
			assert.ok(oOpenContextMenuSpy.notCalled, "TableUtils.Menu.openContextMenu was not called");
			checkFocus(oElem, assert);

			var oContextMenuEventArgument = oContextMenuEventHandlerSpy.args[0][0];
			assert.ok(!oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was not prevented");

			oOpenContextMenuSpy.resetHistory();
			oContextMenuEventHandlerSpy.resetHistory();
		});
	});

	QUnit.module("Action Mode > Enter and Leave", {
		beforeEach: function() {
			setupTest();

			oTable.removeAllColumns();
			TableQUnitUtils.addColumn(oTable, "Focusable & Tabbable", "Focus&TabInput", true, null, true);
			TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "Focus&NoTabSpan", false, true, false, null, null, true);
			TableQUnitUtils.addColumn(oTable, "Not Focusable & Not Tabbable", "NoFocus&NoTabSpan", false, false, false, null, null, true);
			TableQUnitUtils.addColumn(oTable, "Focusable & Tabbable", "Focus&TabInput", true, null, true, null, null, true);
			TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "Focus&NoTabInput", true, null, null, null, null, true);

			oCore.applyChanges();
		},
		afterEach: function() {
			teardownTest();
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
		 * @param {boolean} [bAllowsFocusCellContent=false] Whether the keyboard shortcut allows to focus interactive elements in column header cells.
		 */
		testOnHeaderCells: function(assert, key, sKeyName, bShift, bAlt, bCtrl, bTestLeaveActionMode, fEventTriggerer, bAllowsFocusCellContent) {
			bAllowsFocusCellContent = bAllowsFocusCellContent === true;

			var sKeyCombination = (bShift ? "Shift+" : "") + (bAlt ? "Alt+" : "") + (bCtrl ? "Ctrl+" : "") + sKeyName;
			var oElem;

			// Column header cell without interactive elements
			oElem = checkFocus(getColumnHeader(0, true), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
			checkFocus(getColumnHeader(0), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			// Column header cell with interactive elements
			oElem = checkFocus(getColumnHeader(1, true), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);

			if (bAllowsFocusCellContent) {
				oElem = TableUtils.getInteractiveElements(oElem)[0];
				assert.strictEqual(document.activeElement, oElem, sKeyCombination + ": First interactive element in the cell is focused");
			} else {
				checkFocus(getColumnHeader(1), assert);
			}

			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			// Row header cell
			oElem = checkFocus(getRowHeader(0, true), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
			checkFocus(getRowHeader(0), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			if (bTestLeaveActionMode) {
				oTable._getKeyboardExtension()._actionMode = true;
				oTable._getKeyboardExtension().suspendItemNavigation();
				assert.ok(oTable._getKeyboardExtension().isInActionMode() && oTable._getKeyboardExtension().isItemNavigationSuspended(),
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
			oTable.getRows()[0].toggleExpandedState();
			oCore.applyChanges();

			oElem = checkFocus(getRowHeader(0, true), assert);
			assert.ok(TableUtils.Grouping.isInGroupHeaderRow(oElem), "Cell to be tested is in a group header row");
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus group header icon cell: Table is in Navigation Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
			checkFocus(getRowHeader(0), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), sKeyCombination + ": Table is in Navigation Mode");

			if (bTestLeaveActionMode) {
				oTable._getKeyboardExtension()._actionMode = true;
				oTable._getKeyboardExtension().suspendItemNavigation();
				assert.ok(oTable._getKeyboardExtension().isInActionMode() && oTable._getKeyboardExtension().isItemNavigationSuspended(),
					"Table was programmatically set to Action Mode");
				fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
				checkFocus(getRowHeader(0), assert);
				assert.ok(!oTable._getKeyboardExtension().isInActionMode(), sKeyCombination + ": Table is in Navigation Mode");
			}

			oTable.setEnableGrouping(false);
			oCore.applyChanges();
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
			var oElement;

			// Focus cell with a focusable & tabbable element inside.
			oElement = checkFocus(getCell(0, oTable.columnCount - 2, true), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(),
				"Focus cell with a focusable and tabbable input element: Table is in Navigation Mode");

			// Enter action mode.
			fEventTriggerer(oElement, key, bShift, bAlt, bCtrl);
			oElement = TableUtils.getInteractiveElements(oElement)[0];
			assert.strictEqual(document.activeElement, oElement, sKeyCombination + ": First interactive element in the cell is focused");
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			assertTextSelection(assert, oElement, true, "The text in the input element is selected");

			// Focus cell with a focusable & non-tabbable element inside.
			oTable._getKeyboardExtension().setActionMode(false);
			oElement = checkFocus(getCell(0, oTable.columnCount - 1, true), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(),
				"Focus cell with a focusable and non-tabbable input element: Table is in Navigation Mode");

			// Enter action mode.
			fEventTriggerer(oElement, key, bShift, bAlt, bCtrl);
			oElement = TableUtils.getInteractiveElements(oElement)[0];
			assert.strictEqual(document.activeElement, oElement, sKeyCombination + ": First interactive element in the cell is focused");
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			assertTextSelection(assert, oElement, true, "The text in the input element is selected");

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
			oElem = checkFocus(getCell(0, oTable.columnCount - 3, true), assert);
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
		var oElement = TableUtils.getInteractiveElements(getCell(0, 0))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Text element in the cell is focused");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus a data cell.
		getCell(0, 0, true);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Enter Action Mode: Focus tabbable input control inside a data cell.
		oElement = TableUtils.getInteractiveElements(getCell(0, oTable.columnCount - 2))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Tabbable input element in the cell is focused");
		assertTextSelection(assert, oElement, false, "The text in the input element is not selected");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus a non-interactive element inside a data cell.
		oElement = oTable.getRows()[0].getCells()[oTable.columnCount - 4].getDomRef();
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Non-interactive element in the cell is focused");
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Enter Action Mode: Focus a non-tabbable input control inside a data cell.
		oElement = getCell(0, oTable.columnCount - 1).find("input")[0];
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
		oCore.applyChanges();

		oElement = checkFocus(getRowHeader(0, true), assert)[0];
		assert.ok(TableUtils.Grouping.isInGroupHeaderRow(oElement), "Cell to be tested is in a group header row");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Focus group header icon cell: Table is in Action Mode");

		// Enter Navigation Mode: Focus the SelectAll cell.
		getSelectAll(true);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus SelectAll cell: Table is in Navigation Mode");

		// Remove row selectors.
		oTable.setSelectionMode(library.SelectionMode.None);
		oCore.applyChanges();

		// Enter Action Mode: Focus tabbable input control inside a data cell.
		oElement = TableUtils.getInteractiveElements(getCell(1, oTable.columnCount - 2))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Tabbable input element in the cell is focused");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus a row header cell which is no group header icon cell or row selector cell.
		getRowHeader(1, true);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(),
			"Focus row header cell which is no group header icon cell or row selector cell: Table is in Navigation Mode");

		// Enter Action Mode: Focus tabbable input control inside a data cell.
		oElement = TableUtils.getInteractiveElements(getCell(1, oTable.columnCount - 2))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Tabbable input element in the cell is focused");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus an interactive element inside a column header cell.
		getColumnHeader(oTable.columnCount - 2, true);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(),
			"Interactive element in the column header cell is focused: Table is in Navigation Mode");
	});

	QUnit.test("F2 - On Column/Row/GroupIcon/SelectAll Header Cells", function(assert) {
		this.testOnHeaderCells(assert, Key.F2, "F2", false, false, false, true, qutils.triggerKeydown, true);
	});

	QUnit.test("F2 - On a Data Cell", function(assert) {
		var oElement = this.testOnDataCellWithInteractiveControls(assert, Key.F2, "F2", false, false, false, qutils.triggerKeydown);

		// Leave action mode.
		qutils.triggerKeydown(oElement, Key.F2, false, false, false);
		checkFocus(getCell(0, oTable.columnCount - 1), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		this.testOnDataCellWithoutInteractiveControls(assert, Key.F2, "F2", false, false, false, qutils.triggerKeydown);

		// Enter Action Mode: Focus tabbable input control inside a data cell.
		oElement = TableUtils.getInteractiveElements(getCell(0, oTable.columnCount - 2))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Interactive element in a cell is focused");
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus a non-interactive element inside a data cell.
		oElement = oTable.getRows()[0].getCells()[oTable.columnCount - 4].getDomRef();
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Non-interactive element in a cell is focused");
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Focus the cell.
		qutils.triggerKeydown(oElement, Key.F2, false, false, false);
		checkFocus(getCell(0, oTable.columnCount - 4), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	});

	QUnit.test("F2 - On a Row Action Cell", function(assert) {
		initRowActions(oTable, 2, 2);

		// Focus cell with a focusable & tabbable element inside.
		var oElem = checkFocus(getRowAction(0, true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Focus row action cell with content: Table is in Navigation Mode");

		// Enter action mode.
		qutils.triggerKeydown(oElem, Key.F2, false, false, false);
		var $InteractiveElements = TableUtils.getInteractiveElements(oElem);
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
		TableQUnitUtils.addColumn(oTable, "Not Focusable & Not Tabbable", "NoFocusNoTab", false, false, false);
		oCore.applyChanges();

		/* Test on a data cell with an interactive control inside */

		var oElem = checkFocus(getCell(0, 0, true), assert);
		var $Element = TableUtils.getInteractiveElements(getCell(0, 0))[0];

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

		oElem = checkFocus(getCell(0, oTable.columnCount - 1, true), assert);

		// Space
		assert.equal(oTable.isIndexSelected(0), false, "Row 1: Not Selected");
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		qutils.triggerKeyup(oElem, Key.SPACE, false, false, false);
		assert.equal(oTable.isIndexSelected(0), false, "Space: Row 1: Not Selected");
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		checkFocus(oElem, assert);

		// Enter
		oElem = checkFocus(getCell(0, oTable.columnCount - 1, true), assert);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		qutils.triggerKeydown(oElem, Key.ENTER, false, false, false);
		assert.equal(oTable.isIndexSelected(0), false, "Enter: Row 1: Not Selected");
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		checkFocus(oElem, assert);
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
		var $InteractiveElements = TableUtils.getInteractiveElements(oElem);
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
		$InteractiveElements = TableUtils.getInteractiveElements(oElem);
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

	QUnit.module("Action Mode > Navigation when some inputs are disabled", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: new JSONModel([
					{text: "A1", tabbable: true},
					{text: "A2", tabbable: false},
					{text: "A3", tabbable: false},
					{text: "A4", tabbable: true},
					{text: "A5", tabbable: true},
					{text: "A6", tabbable: false},
					{text: "A7", tabbable: false}
				]),
				columns: [
					new Column({
						label: new TestControl({text: "A"}),
						template: new TestControl({text: "{text}"}),
						width: "100px"
					}),
					new Column({
						label: new TestControl({text: "B"}),
						template: new TestControl({tabbable: "{tabbable}"}),
						width: "100px"
					})
				]
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("TAB & Shift+TAB", function(assert) {
		var oTable = this.oTable;

		return new Promise(function(resolve) {
			var oElem = oTable.getRows()[0].getCells()[1].getDomRef();

			oElem.focus();
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.qunit.getRowHeaderCell(1), assert);
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.qunit.getRowHeaderCell(2), assert);
			simulateTabEvent(oElem, false);
			oTable.attachEventOnce("rowsUpdated", function() {
				setTimeout(function() {
					assert.equal(oTable.getRows()[2].getIndex(), 3, "The table is scrolled");
					assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
					oElem = checkFocus(oTable.qunit.getRowHeaderCell(2), assert);
					resolve(oElem);
				}, 0);
			});
		}).then(function(oElem) {
			return new Promise(function(resolve) {
				simulateTabEvent(oElem, false);
				oElem = checkFocus(oTable.getRows()[2].getCells()[1].getDomRef(), assert);
				simulateTabEvent(oElem, false);
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						assert.equal(oTable.getRows()[2].getIndex(), 4, "The table is scrolled");
						assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						oElem = checkFocus(oTable.qunit.getRowHeaderCell(2), assert);
						resolve(oElem);
					}, 0);
				});
			});
		}).then(function(oElem) {
			return new Promise(function(resolve) {
				simulateTabEvent(oElem, true);
				oElem = checkFocus(oTable.getRows()[1].getCells()[1].getDomRef(), assert);
				simulateTabEvent(oElem, true);
				oElem = checkFocus(oTable.qunit.getRowHeaderCell(1), assert);
				simulateTabEvent(oElem, true);
				oElem = checkFocus(oTable.qunit.getRowHeaderCell(0), assert);
				simulateTabEvent(oElem, true);
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						assert.equal(oTable.getRows()[0].getIndex(), 1, "The table is scrolled");
						assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						oElem = checkFocus(oTable.qunit.getRowHeaderCell(0), assert);
						resolve(oElem);
					}, 0);
				});
			});
		}).then(function(oElem) {
			return new Promise(function(resolve) {
				simulateTabEvent(oElem, true);
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						assert.equal(oTable.getRows()[0].getIndex(), 0, "The table is scrolled");
						assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						oElem = checkFocus(oTable.getRows()[0].getCells()[1].getDomRef(), assert);
						resolve();
					}, 0);
				});
			});
		});
	});

	QUnit.test("TAB & Shift+TAB - selectionMode is None", function(assert) {
		var oTable = this.oTable;

		oTable.setSelectionMode("None");
		oCore.applyChanges();

		return oTable.qunit.whenRenderingFinished().then(function() {
			return new Promise(function(resolve) {
				var oElem = oTable.getRows()[0].getCells()[1].getDomRef();

				oElem.focus();
				simulateTabEvent(oElem, false);
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						assert.equal(oTable.getRows()[2].getIndex(), 3, "The table is scrolled");
						assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						oElem = checkFocus(oTable.getRows()[2].getCells()[1].getDomRef(), assert);
						resolve(oElem);
					}, 0);
				});
			});
		}).then(function(oElem) {
			return new Promise(function(resolve) {
				simulateTabEvent(oElem, false);
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						assert.equal(oTable.getRows()[2].getIndex(), 4, "The table is scrolled");
						assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						oElem = checkFocus(oTable.getRows()[2].getCells()[1].getDomRef(), assert);
						resolve(oElem);
					}, 0);
				});
			});
		}).then(function(oElem) {
			return new Promise(function(resolve) {
				simulateTabEvent(oElem, false);
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						assert.equal(oTable.getRows()[2].getIndex(), 5, "The table is scrolled");
						assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						oElem = checkFocus(oTable.qunit.getDataCell(2, 0), assert);
						resolve(oElem);
					}, 0);
				});
			});
		}).then(function(oElem) {
			return new Promise(function(resolve) {
				simulateTabEvent(oElem, true);
				oElem = checkFocus(oTable.getRows()[1].getCells()[1].getDomRef(), assert);
				simulateTabEvent(oElem, true);
				oElem = checkFocus(oTable.getRows()[0].getCells()[1].getDomRef(), assert);
				simulateTabEvent(oElem, true);
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						assert.equal(oTable.getRows()[0].getIndex(), 2, "The table is scrolled");
						assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						oElem = checkFocus(oTable.qunit.getDataCell(0, 0), assert);
						resolve(oElem);
					}, 0);
				});
			});
		}).then(function(oElem) {
			return new Promise(function(resolve) {
				simulateTabEvent(oElem, true);
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						assert.equal(oTable.getRows()[0].getIndex(), 1, "The table is scrolled");
						assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						oElem = checkFocus(oTable.qunit.getDataCell(0, 0), assert);
						resolve(oElem);
					}, 0);
				});
			});
		}).then(function(oElem) {
			return new Promise(function(resolve) {
				simulateTabEvent(oElem, true);
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						assert.equal(oTable.getRows()[0].getIndex(), 0, "The table is scrolled");
						assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						checkFocus(oTable.getRows()[0].getCells()[1].getDomRef(), assert);
						resolve();
					}, 0);
				});
			});
		});
	});

	QUnit.module("Action Mode > Navigation", {
		beforeEach: function() {
			setupTest();

			oTable.removeColumn(2); // Remove unnecessary columns to speed up the test.
			oTable.removeColumn(2);
			oTable.removeColumn(2);
			TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "Focus&NoTabSpan", false, true, false);
			TableQUnitUtils.addColumn(oTable, "Not Focusable & Not Tabbable", "NoFocus&NoTabSpan", false, false, false);
			TableQUnitUtils.addColumn(oTable, "Focusable & Tabbable", "Focus&TabInput", true, null, true);
			TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "Focus&NoTabInput", true, null, false, null, null, true);

			oCore.applyChanges();
		},
		afterEach: function() {
			teardownTest();
		},
		testAsync: function(mSettings) {
			mSettings.act();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						mSettings.assert();
						resolve();
					}, 10);
				});
			});
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
			var mRowCounts = oTable._getRowCounts();
			var iVisibleRowCount = mRowCounts.count;
			var iFixedRowCount = mRowCounts.fixedTop;
			var iFixedBottomRowCount = mRowCounts.fixedBottom;
			var bTableHasRowSelectors = TableUtils.isRowSelectorSelectionAllowed(oTable);
			var bTableIsInGroupMode = TableUtils.Grouping.isInGroupMode(oTable);
			var bTableHasRowHeader = bTableHasRowSelectors || bTableIsInGroupMode;
			var bTableHasRowActions = TableUtils.hasRowActions(oTable);
			var oKeyboardExtension = oTable._getKeyboardExtension();
			var iActionItemCount = bTableHasRowActions ? oTable.getRowActionTemplate()._getVisibleItems().length : 0;
			var iColumnCount = oTable.getColumns().filter(function(oColumn) {
				return oColumn.getVisible() || (oColumn.getGrouped ? oColumn.getGrouped() : false);
			}).length;
			var iLastColumnIndex = iColumnCount + Math.max(0, iActionItemCount - 1); // Action items are treated as columns in this test.
			var iRowCount = oTable._getTotalRowCount();
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

										if (TableUtils.Grouping.isInGroupHeaderRow(oElem)) {
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
									$InteractiveElements = TableUtils.getInteractiveElements($Cell);

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
									$InteractiveElements = TableUtils.getInteractiveElements($Cell);

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

								var oRow = oTable.getRows()[iRowIndex];
								var bScrolled = bIsLastElementInRow && TableUtils.isLastScrollableRow(oTable, TableUtils.getCell(oTable, oElem))
												&& oRow.getIndex() + iFixedBottomRowCount !== iRowCount - 1;
								if (bShowInfo) {
									assert.ok(true, "[INFO] Simulating TAB event on: " + document.activeElement.id);
									assert.ok(true, "[INFO] Scrolling will be performed: " + bScrolled);
								}

								tabAndWaitFocusChange(false, bScrolled).then(function() {
									if (iAbsoluteRowIndex === iRowCount - 1 && bIsLastElementInRow) {
										var oRowActionElementCell = getRowAction(iVisibleRowCount - 1);

										if (bTableHasRowActions && TableUtils.getInteractiveElements(oRowActionElementCell) !== null) {
											checkFocus(oRowActionElementCell, assert);
										} else {
											checkFocus(getCell(iVisibleRowCount - 1, iColumnCount - 1), assert);
										}

										assert.ok(!oKeyboardExtension.isInActionMode(), "Table is in Navigation Mode");
									} else {
										assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");
									}
									resolve();
								});
							});
						});
					}());
				}
			}
			/*eslint-enable no-loop-func*/

			sequence = sequence.then(function() {
				return new Promise(function(resolve) {
					oElem = TableUtils.getInteractiveElements(document.activeElement)[0];
					oKeyboardExtension.setActionMode(true);
					assert.strictEqual(document.activeElement, oElem,
						"The action mode was entered on the last cell of the last row - The cells first interactive element is focused");
					assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");

					// Focus the last interactive element in the last cell in the last row.
					var aRows = oTable.getRows();
					var oLastRow = aRows[aRows.length - 1];

					oElem = KeyboardDelegate._getLastInteractiveElement(oLastRow)[0];
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
										$InteractiveElements = TableUtils.getInteractiveElements($Cell);

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
									$InteractiveElements = TableUtils.getInteractiveElements($Cell);

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
										KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[iRowIndex])[0] === oElem;
									var bRowHasInteractiveRowHeader =
										bTableHasRowSelectors || TableUtils.Grouping.isInGroupHeaderRow(TableUtils.getCell(oTable, oElem));

									if (bIsFirstInteractiveElementInRow && iColumnIndex > 0 && !bRowHasInteractiveRowHeader) {
										resolve();
										return;
									}

								} else if (bTableHasRowHeader) { // Row Header Cell
									oElem = getRowHeader(iRowIndex);

									if (TableUtils.Grouping.isInGroupHeaderRow(oElem)) {
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

								var bIsFirstScrollableRow = TableUtils.isFirstScrollableRow(oTable, TableUtils.getCell(oTable, oElem));
								var oRow = oTable.getRows()[iRowIndex];
								var bScrolled = iColumnIndex === (bTableHasRowHeader ? -1 : 0) && bIsFirstScrollableRow
												&& oRow.getIndex() - iFixedRowCount !== 0;
								if (bShowInfo) {
									assert.ok(true, "[INFO] Simulating Shift+TAB event on: " + document.activeElement.id);
									assert.ok(true, "[INFO] Scrolling will be performed: " + bScrolled);
								}

								tabAndWaitFocusChange(true, bScrolled).then(function() {
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
								});
							});
						});
					}());
				}
			}
			/*eslint-enable no-loop-func*/

			return sequence;
		},

		/**
		 * Gets a cell or an interactive element inside the cell.
		 * Limited to the content area of the table, meaning everything except table header cells.
		 *
		 * @param {int} iRowIndex Row index.
		 * @param {int} iColumnIndex Column index. Set -1 for the row headers and -2 for the row actions column.
		 * @param {boolean} [bInteractiveElement=false] If <code>true</code>, the first interactive element inside the cell will be returned.
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
				oElement = TableUtils.getInteractiveElements(oElement).first();
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
			var iVisibleRows = oTable._getRowCounts().count;
			var i;
			var pTestSequence = Promise.resolve();
			var fnTestAsync = this.testAsync;

			oElem = this.getElement(0, iColumnIndex);
			oElem.trigger("focus");
			checkFocus(oElem, assert);

			pTestSequence = pTestSequence.then(function() {
				qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, true); // Use Ctrl to enter the action mode.
				oElem = checkFocus(this.getElement(1, iColumnIndex, true), assert);

				if (iColumnIndex === -1) {
					// In case of row header cells enter the action mode manually.
					oTable._getKeyboardExtension()._actionMode = true;
				}

				assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			}.bind(this));

			// Navigate down to the last visible row.
			for (i = 2; i < iVisibleRows; i++) {
				/*eslint-disable no-loop-func*/
				pTestSequence = pTestSequence.then(function(iRowIndex) {
					qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, bCtrlKey);

					oElem = checkFocus(this.getElement(iRowIndex, iColumnIndex, true), assert);
					assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
				}.bind(this, i));
				/*eslint-enable no-loop-func*/
			}

			// Scroll to the last row.
			for (i = iVisibleRows; i < iNumberOfRows; i++) {
				/*eslint-disable no-loop-func*/
				pTestSequence = pTestSequence.then(function() {
					return fnTestAsync({
						act: function() {
							qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, bCtrlKey);
						},
						assert: function() {
							oElem = checkFocus(this.getElement(iVisibleRows - 1, iColumnIndex, true), assert);
							assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						}.bind(this)
					});
				}.bind(this));
				/*eslint-enable no-loop-func*/
			}

			// Navigating down on the last row switches the action mode off.
			pTestSequence = pTestSequence.then(function() {
				qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, bCtrlKey);

				oElem = checkFocus(this.getElement(iVisibleRows - 1, iColumnIndex), assert);
				assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
			}.bind(this));

			// Navigate up to the first visible row.
			for (i = iVisibleRows - 2; i >= 0; i--) {
				/*eslint-disable no-loop-func*/
				pTestSequence = pTestSequence.then(function(iRowIndex) {
					// At the last row, always press Ctrl to switch to the action mode again.
					qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, iRowIndex === iVisibleRows - 2 || bCtrlKey);

					if (iColumnIndex === -1) {
						// In case of row header cells enter the action mode manually.
						oTable._getKeyboardExtension()._actionMode = true;
					}

					oElem = checkFocus(this.getElement(iRowIndex, iColumnIndex, true), assert);
					assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
				}.bind(this, i));
				/*eslint-enable no-loop-func*/
			}

			// Scroll up to the first row.
			for (i = iVisibleRows; i < iNumberOfRows; i++) {
				/*eslint-disable no-loop-func*/
				pTestSequence = pTestSequence.then(function() {
					return fnTestAsync({
						act: function() {
							qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, bCtrlKey);
						},
						assert: function() {
							oElem = checkFocus(this.getElement(0, iColumnIndex, true), assert);
							assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
						}.bind(this)
					});
				}.bind(this));
				/*eslint-enable no-loop-func*/
			}

			// Navigating up on the first row switches the action mode off.
			pTestSequence = pTestSequence.then(function() {
				qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, bCtrlKey);

				checkFocus(this.getElement(0, iColumnIndex), assert);
				assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
			}.bind(this));

			// Ctrl+Up on the first row does not navigate to the column header.
			pTestSequence = pTestSequence.then(function() {
				qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, true);

				checkFocus(this.getElement(0, iColumnIndex), assert);
				assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
			}.bind(this));

			return pTestSequence;
		},
		/**
		 * Returns an array of row information relevant for setting up the grouping
		 *
		 * @param {Object} oRow Row object.
		 * @private
		 */
		getRowGroupingInfo: function(oRow) {
			return [{
				title: "0",
				state: {type: oRow.Type.GroupHeader, expandable: true, expanded: true},
				expectContentHidden: false
			}, {
				title: "1",
				state: {type: oRow.Type.GroupHeader, expandable: true, expanded: true},
				expectContentHidden: true
			}, {
				title: "2",
				state: {type: oRow.Type.Standard},
				expectContentHidden: true
			}];
		},
		/**
		 * Changes the row states to in getRowGroupingInfo defined states
		 *
		 * @private
		 */
		setRowStates: function() {
			var i = 0;
			var oRow = oTable.getRows()[0];
			var aRowInfo = this.getRowGroupingInfo(oRow);
			var aStates = aRowInfo.map(function(mRowInfo) {
				return mRowInfo.state;
			});

			function updateRowState(oState) {
				Object.assign(oState, aStates[i]);
				i++;
			}

			TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.UpdateState, updateRowState);
			oTable.getBinding().refresh(true);
		}
	});

	QUnit.test("TAB & Shift+TAB", function(assert) {
		oTable.setSelectionMode(library.SelectionMode.None);
		oCore.applyChanges();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers", function(assert) {
		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Invisible Columns", function(assert) {
		oTable.getColumns()[1].setVisible(false);
		oCore.applyChanges();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns", function(assert) {
		oTable.setFixedColumnCount(2);
		oCore.applyChanges();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Row Actions", function(assert) {
		oTable.setFixedColumnCount(2);
		initRowActions(oTable, 2, 2);

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Row Actions, Fixed Top Rows, Fixed Bottom Rows", function(assert) {
		oTable.setFixedColumnCount(2);
		oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		initRowActions(oTable, 2, 2);

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Empty Row Actions, Fixed Top Rows, Fixed Bottom Rows", function(assert) {
		oTable.setFixedColumnCount(2);
		oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		initRowActions(oTable, 1, 0);

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Grouping", function(assert) {
		oTable.setSelectionMode(library.SelectionMode.None);
		this.setRowStates();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Row Actions, Fixed Top Rows, Fixed Bottom Rows, Grouping", function(assert) {
		oTable.setFixedColumnCount(2);
		oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		initRowActions(oTable, 2, 2);
		this.setRowStates();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Empty Row Actions, Fixed Top Rows, Fixed Bottom Rows, Grouping", function(assert) {
		oTable.setFixedColumnCount(2);
		oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		initRowActions(oTable, 1, 0);
		this.setRowStates();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - On first column", function(assert) {
		var oElement;

		return this.testActionModeUpDownNavigation(assert, 0, true).then(function() {
			oElement = getCell(0, 1).find("span")[0];
			oElement.tabIndex = -1;
			oElement.focus();
			checkFocus(oElement, assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			qutils.triggerKeydown(oElement, Key.Arrow.UP, false, false, true);
			checkFocus(getCell(0, 1), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			oTable._getScrollExtension().scrollVerticallyMax(true);
			oElement = getCell(oTable._getRowCounts().count - 1, 1).find("span")[0];
			oElement.tabIndex = -1;
			oElement.focus();
			checkFocus(oElement, assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			qutils.triggerKeydown(oElement, Key.Arrow.DOWN, false, false, true);
			checkFocus(getCell(oTable._getRowCounts().count - 1, 1), assert);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		});
	});

	QUnit.test("Up & Down - On first column", function(assert) {
		return this.testActionModeUpDownNavigation(assert, 0, false);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - On Row Headers", function(assert) {
		return this.testActionModeUpDownNavigation(assert, -1, true);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - On Row Actions", function(assert) {
		initRowActions(oTable, 1, 1);
		return this.testActionModeUpDownNavigation(assert, -2, true);
	});

	QUnit.test("Up & Down - On Row Actions", function(assert) {
		initRowActions(oTable, 1, 1);
		return this.testActionModeUpDownNavigation(assert, -2, false);
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
		oElem = TableUtils.getInteractiveElements(getCell(2, 1)).first();
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
		oElem = TableUtils.getInteractiveElements(getCell(0, 1)).first();
		checkFocus(oElem, assert); // The cells interactive element should be focused.
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - Navigate between text input elements", function(assert) {
		oTable.getRowMode().setRowCount(4);
		oCore.applyChanges();

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
		assertTextSelection(assert, oInputElement, true, "The text in the input element is selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
		checkFocus(oTextAreaElement, assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oTextAreaElement, false, "The text in the textarea is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
		// The interactive element in the cell under the textarea cell should be focused.
		checkFocus(TableUtils.getInteractiveElements(getCell(3, 1)).first(), assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		checkFocus(oTextAreaElement, assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oTextAreaElement, false, "The text in the textarea element is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		checkFocus(oInputElement, assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oInputElement, true, "The text in the input element is selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		// The interactive element in the cell above the input cell should be focused.
		checkFocus(TableUtils.getInteractiveElements(getCell(0, 1)).first(), assert);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
	});

	QUnit.test("Up & Down - Navigate between text input elements", function(assert) {
		oTable.getRowMode().setRowCount(4);
		oCore.applyChanges();

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

	QUnit.test("Focus handling when the table is in Action Mode and keyboard navigation scrolls the table", function(assert) {
		var aEvents = [];

		oTable.setFixedColumnCount(0);
		oTable.getRowMode().setRowCount(1);
		oTable.setSelectionMode(library.SelectionMode.None);
		oTable.removeAllColumns();
		TableQUnitUtils.addColumn(oTable, "Focus&TabSpan", "Focus&TabSpan", false, true, true).getTemplate().addEventDelegate({
			onsapfocusleave: function() {
				aEvents.push("sapfocusleave");
			},
			onfocusin: function() {
				aEvents.push("focusin");
			}
		});

		TableQUnitUtils.addColumn(oTable, "Focus&TabSpan", "Focus&TabSpan", true, true, true).getTemplate().addEventDelegate({
			onsapfocusleave: function() {
				aEvents.push("sapfocusleave");
			},
			onfocusin: function() {
				aEvents.push("focusin");
			}
		});
		oCore.applyChanges();

		var oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();
		var oInput = oTable.getRows()[0].getCells()[1];

		oInput.setFieldGroupIds(["fieldGroup1"]);
		oInput.attachValidateFieldGroup(function() {
			aEvents.push("validateFieldGroup");
		});

		function test(sTitle, aExpectedEvents, fnAct) {
			aEvents = [];
			fnAct();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", function() {
					setTimeout(function() {
						oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();
						assert.ok(oTable._getKeyboardExtension().isInActionMode(), sTitle + ": Table is in Action Mode");
						assert.deepEqual(aEvents, aExpectedEvents, sTitle + ": The events were correctly fired");
						resolve();
					}, 10);
				});
			});
		}

		oCellContent.focus();

		return new Promise(function(resolve) {
			oTable.attachEventOnce("rowsUpdated", resolve);
		}).then(function() {
			return test("Arrow down", ["sapfocusleave", "focusin"], function() {
				qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, false);
			});
		}).then(function() {
			return test("Arrow up", ["sapfocusleave", "focusin"], function() {
				qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, false);
			});
		}).then(function() {
			return test("Ctrl+Arrow down", ["sapfocusleave", "focusin"], function() {
				qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
			});
		}).then(function() {
			return test("Ctrl+Arrow up", ["sapfocusleave", "focusin"], function() {
				qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
			});
		}).then(function() {
			return new Promise(function(resolve) {
				simulateTabEvent(document.activeElement, false);
				setTimeout(function() {
					resolve();
				}, 0);
			});
		}).then(function() {
			return test("Ctrl+Arrow down", ["sapfocusleave", "validateFieldGroup", "focusin"], function() {
				qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
			});
		}).then(function() {
			return test("Ctrl+Arrow up", ["sapfocusleave", "validateFieldGroup", "focusin"], function() {
				qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
			});
		}).then(function() {
			return test("Tab", ["sapfocusleave", "validateFieldGroup", "focusin"], function() {
				simulateTabEvent(document.activeElement, false);
			});
		}).then(function() {
			return test("Shift+Tab", ["sapfocusleave", "focusin"], function() {
				simulateTabEvent(document.activeElement, true);
			});
		});
	});

	QUnit.test("TAB & Shift+TAB - Column Headers", function(assert) {
		var $ColumnHeaderCell = getColumnHeader(oTable.columnCount - 1, true, assert);
		var $InteractiveElements = TableUtils.getInteractiveElements($ColumnHeaderCell);

		$InteractiveElements[0].focus();
		assert.strictEqual(document.activeElement, $InteractiveElements[0], "First interactive element in the column header cell is focused");

		simulateTabEvent(document.activeElement);
		checkFocus($ColumnHeaderCell, assert);

		$InteractiveElements[0].focus();
		assert.strictEqual(document.activeElement, $InteractiveElements[0], "First interactive element in the column header cell is focused");

		simulateTabEvent(document.activeElement, false);
		checkFocus($ColumnHeaderCell, assert);
	});
});