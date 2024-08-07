/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/extensions/KeyboardDelegate",
	"sap/ui/table/library",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/Row",
	"sap/ui/table/CreationRow",
	"sap/ui/table/rowmodes/Type",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/Device",
	"sap/ui/events/F6Navigation",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Element",
	"sap/base/i18n/Localization",
	"sap/base/util/Deferred",
	"sap/ui/thirdparty/jquery",
	// provides jQuery custom selector ":sapTabbable"
	"sap/ui/dom/jquery/Selectors"
], function(
	TableQUnitUtils,
	qutils,
	nextUIUpdate,
	TableUtils,
	KeyboardDelegate,
	library,
	Table,
	Column,
	Row,
	CreationRow,
	RowModeType,
	FixedRowMode,
	Device,
	F6Navigation,
	KeyCodes,
	JSONModel,
	Element,
	Localization,
	Deferred,
	jQuery
) {
	"use strict";

	const createTables = window.createTables;
	const destroyTables = window.destroyTables;
	const getCell = window.getCell;
	const getColumnHeader = window.getColumnHeader;
	const getRowHeader = window.getRowHeader;
	const getRowAction = window.getRowAction;
	const getSelectAll = window.getSelectAll;
	const iNumberOfRows = window.iNumberOfRows;
	const checkFocus = window.checkFocus;
	const TestInputControl = TableQUnitUtils.TestInputControl;
	const TestControl = TableQUnitUtils.TestControl;
	let aFocusDummyIds = [];

	function checkDelegateType(sExpectedType) {
		const oTbl = new Table();
		const oExt = oTbl._getKeyboardExtension();
		const sType = oExt._delegate && oExt._delegate.getMetadata ? oExt._delegate.getMetadata().getName() : null;
		oTbl.destroy();
		return sType === sExpectedType;
	}

	// Checks whether the given DomRef is contained or equals (in) one of the given container
	function isContained(aContainers, oRef) {
		for (let i = 0; i < aContainers.length; i++) {
			if (aContainers[i] === oRef || aContainers[i] !== oRef && aContainers[i].contains(oRef)) {
				return true;
			}
		}
		return false;
	}

	// Returns a jQuery object which contains all next/previous (bNext) tabbable DOM elements of the given starting point (oRef)
	// within the given scopes (DOMRefs).
	function findTabbables(oRef, aScopes, bNext) {
		const $Ref = jQuery(oRef);
		let $All; let $Tabbables;

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
		const oParams = {};
		oParams.keyCode = KeyCodes.TAB;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = !!bBackward;
		oParams.altKey = false;
		oParams.metaKey = false;
		oParams.ctrlKey = false;

		if (typeof (oTarget) === "string") {
			oTarget = document.getElementById(oTarget);
		}

		const oEvent = new jQuery.Event({type: "keydown"});
		for (const x in oParams) {
			oEvent[x] = oParams[x];
			oEvent.originalEvent[x] = oParams[x];
		}

		jQuery(oTarget).trigger(oEvent);

		if (oEvent.isDefaultPrevented()) {
			return;
		}

		const $Tabbables = findTabbables(document.activeElement, [document.getElementById("qunit-fixture")], !bBackward);
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
		if (Device.browser.safari) {
			return;
		}

		const iSelectedCharacterCount = oTextInputElement.selectionEnd - oTextInputElement.selectionStart;
		const iTotalCharacterCount = oTextInputElement.value.length;
		const bSelected = iSelectedCharacterCount > 0 && iSelectedCharacterCount === iTotalCharacterCount;

		assert.strictEqual(bSelected, bExpectSelected, sText);
	}

	function renderFocusDummy(sId) {
		aFocusDummyIds.push(sId);
		new TestControl(sId, {text: sId, tabbable: true}).placeAt("qunit-fixture");
	}

	function removeFocusDummies() {
		aFocusDummyIds.forEach(function(sId) {
			Element.getElementById(sId).destroy();
		});
		aFocusDummyIds = [];
	}

	async function setupTest() {
		await createTables(true, true);
		renderFocusDummy("Focus1");
		oTable.placeAt("qunit-fixture");
		renderFocusDummy("Focus2");
		oTreeTable.placeAt("qunit-fixture");
		renderFocusDummy("Focus3");
		await nextUIUpdate();
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
			const mKeyInfo = Object.assign({shift: false, alt: false, ctrl: false}, this.mKeyInfo[iKeyCode]);
			const that = this;

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
	const Key = {
		Arrow: {
			LEFT: Localization.getRTL() ? KeyCodes.ARROW_RIGHT : KeyCodes.ARROW_LEFT,
			RIGHT: Localization.getRTL() ? KeyCodes.ARROW_LEFT : KeyCodes.ARROW_RIGHT,
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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10),
				columns: [
					TableQUnitUtils.createInteractiveTextColumn()
				]
			});

			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("_isKeyCombination", function(assert) {
		const CTRL = 1;
		const SHIFT = 2;
		const ALT = 4;

		function getEvent(key, ctrl, meta, shift, alt) {
			const oEvent = {};
			oEvent.keyCode = key || null;
			oEvent.charCode = key || null;
			oEvent.ctrlKey = ctrl || false;
			oEvent.metaKey = meta || false;
			oEvent.shiftKey = shift || false;
			oEvent.altKey = alt || false;
			return oEvent;
		}

		const bIsMacintosh = Device.os.macintosh;

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

	QUnit.test("_allowsToggleExpandedState; Standard row", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		assert.notOk(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getDataCell(0, 0)), "Data cell");
		assert.notOk(KeyboardDelegate._allowsToggleExpandedState(this.oTable,
			TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(0, 0))[0]), "Interactive element inside data cell");
		assert.notOk(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getRowHeaderCell(0)), "Row header cell");
		assert.notOk(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getRowActionCell(0)), "Row action cell");
		assert.notOk(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getColumnHeaderCell(0)), "Column header cell");
		assert.notOk(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getSelectAllCell()), "SelectAll cell");
	});

	QUnit.test("_allowsToggleExpandedState; Group row", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
		this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader}]);
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getDataCell(0, 0)), "Data cell");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getRowHeaderCell(0)), "Row header cell");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getRowActionCell(0)), "Row action cell");
	});

	QUnit.test("_allowsToggleExpandedState; Tree row", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		this.oTable.qunit.setRowStates([{expandable: true}]);
		await this.oTable.qunit.whenRenderingFinished();

		const oTreeIconCell = this.oTable.qunit.getDataCell(0, 0);
		const oTreeIcon = TableUtils.getInteractiveElements(oTreeIconCell)[0];

		assert.ok(KeyboardDelegate._allowsToggleExpandedState(this.oTable, oTreeIconCell), "Closed node: Data cell with tree icon");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(this.oTable, oTreeIcon), "Closed node: Tree icon");
		assert.notOk(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getRowHeaderCell(0)),
			"Closed node: Row header cell");
		assert.notOk(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getRowActionCell(0)),
			"Closed node: Row action cell");

		await this.oTable.qunit.setRowStates([{expandable: true, expanded: true}]);
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(this.oTable, oTreeIconCell), "Open node: Data cell with tree icon");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(this.oTable, oTreeIcon), "Open node: Tree icon");

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.GroupedTree);
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader, expandable: true}]);

		assert.ok(KeyboardDelegate._allowsToggleExpandedState(this.oTable, oTreeIconCell),
			"Node visualized as group header: Data cell");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getRowHeaderCell(0)),
			"Node visualized as group header: Row header cell");
		assert.ok(KeyboardDelegate._allowsToggleExpandedState(this.oTable, this.oTable.qunit.getRowActionCell(0)),
			"Node visualized as group header: Row action cell");
	});

	QUnit.test("_focusElement", async function(assert) {
		let oElement;
		const oSetSilentFocusSpy = this.spy(this.oTable._getKeyboardExtension(), "setSilentFocus");
		const mInputTypes = {
			text: {supportsTextSelectionReadAPI: true, value: "text", columnIndex: null},
			password: {supportsTextSelectionReadAPI: true, value: "password", columnIndex: null},
			search: {supportsTextSelectionReadAPI: true, value: "search", columnIndex: null},
			tel: {supportsTextSelectionReadAPI: true, value: "123 456", columnIndex: null},
			url: {supportsTextSelectionReadAPI: true, value: "http://www.test.com", columnIndex: null},
			email: {supportsTextSelectionReadAPI: false, value: "test@test.com", columnIndex: null},
			number: {supportsTextSelectionReadAPI: false, value: "123456", columnIndex: null}
		};
		const getInputElement = (iColumnIndex) => {
			return this.oTable.getRows()[0].getCells()[iColumnIndex].getDomRef();
		};
		const testInputElement = (mInputType, bSilentFocus) => {
			oElement = getInputElement(mInputType.columnIndex);
			KeyboardDelegate._focusElement(this.oTable, oElement, bSilentFocus);
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
		};

		for (const sInputType in mInputTypes) {
			const oColumn = new Column({
				label: new TestControl({text: sInputType}),
				template: new TestInputControl({
					text: mInputTypes[sInputType].value,
					type: mInputTypes[sInputType]
				})
			});
			this.oTable.addColumn(oColumn);
			mInputTypes[sInputType].columnIndex = oColumn.getIndex();
		}
		await this.oTable.qunit.whenRenderingFinished();

		for (const sInputType in mInputTypes) {
			testInputElement(mInputTypes[sInputType]);
		}
		for (const sInputType in mInputTypes) {
			testInputElement(mInputTypes[sInputType], true);
		}

		oElement = getInputElement(mInputTypes.text.columnIndex);
		KeyboardDelegate._focusElement(this.oTable, oElement);
		checkFocus(oElement, assert);
		assert.ok(oSetSilentFocusSpy.notCalled, "The element was not focused silently");
		assertTextSelection(assert, oElement, true, "The text is selected");

		oElement = this.oTable.getRows()[0].getCells()[0].getDomRef();
		KeyboardDelegate._focusElement(this.oTable, oElement);
		checkFocus(oElement, assert);
		assert.ok(oSetSilentFocusSpy.notCalled, "The element was not focused silently");

		oElement = this.oTable.getRows()[0].getCells()[0].getDomRef();
		KeyboardDelegate._focusElement(this.oTable, oElement, true);
		checkFocus(oElement, assert);
		assert.ok(oSetSilentFocusSpy.calledOnce, "The element was focused silently");

		oSetSilentFocusSpy.restore();
	});

	QUnit.module("Interactive elements", {
		beforeEach: async function() {
			await createTables();

			TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "Focus&NoTabSpan", false, true, false);
			TableQUnitUtils.addColumn(oTable, "Not Focusable & Not Tabbable", "NoFocus&NoTabSpan");
			TableQUnitUtils.addColumn(oTable, "Focusable & Tabbable", "Focus&TabInput", true, null, true);
			TableQUnitUtils.addColumn(oTable, "Focusable & Not Tabbable", "Focus&NoTabInput", true, null, false);
			oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
			oTable.setRowActionCount(2);

			await nextUIUpdate();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("_isElementInteractive", function(assert) {
		const $FocusAndNoTabSpan = getCell(0, oTable.columnCount - 4).find("span");
		const $NoFocusAndNoTabSpan = getCell(0, oTable.columnCount - 3).find("span");
		const $FocusAndTabInput = getCell(0, oTable.columnCount - 2).find("input");
		const $FocusAndNoTabInput = getCell(0, oTable.columnCount - 1).find("input");
		const $TreeIconOpen = jQuery("<div class=\"sapUiTableTreeIcon sapUiTableTreeIconNodeOpen\"></div>");
		const $TreeIconClosed = jQuery("<div class=\"sapUiTableTreeIcon sapUiTableTreeIconNodeClosed\"></div>");
		const $TreeIconLeaf = jQuery("<div class=\"sapUiTableTreeIcon sapUiTableTreeIconLeaf\"></div>");
		const $RowActionIcon = getRowAction(0).find(".sapUiTableActionIcon");

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

	QUnit.test("_getFirstInteractiveElement", async function(assert) {
		let $FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($FirstInteractiveElement.length, 1, "First row: One element was returned");
		assert.strictEqual($FirstInteractiveElement[0].value, "Focus&TabInput1", "First row: The correct element was returned");

		oTable.getColumns().forEach(function(oColumn) {
			oColumn.setVisible(false);
		});
		await nextUIUpdate();

		$FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($FirstInteractiveElement.length, 1, "First row: One element was returned");
		assert.strictEqual($FirstInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"First row: The correct element was returned");

		oTable.setRowActionCount(0);
		await nextUIUpdate();
		$FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($FirstInteractiveElement, null, "Row has no interactive elements: Null was returned");

		$FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement();
		assert.strictEqual($FirstInteractiveElement, null, "No parameter passed: Null was returned");
	});

	QUnit.test("_getLastInteractiveElement", async function(assert) {
		let $LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($LastInteractiveElement.length, 1, "First row with row actions: One element was returned");
		assert.strictEqual($LastInteractiveElement.get(-1), getRowAction(0).find(".sapUiTableActionIcon:visible").get(-1),
			"First row with row actions: The correct element was returned");

		oTable.setRowActionCount(0);
		await nextUIUpdate();
		$LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement(oTable.getRows()[0]);
		assert.strictEqual($LastInteractiveElement.length, 1, "First row without row actions: One element was returned");
		assert.strictEqual($LastInteractiveElement[0].value, "Focus&NoTabInput1", "First row without row actions: The correct element was returned");

		$LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement();
		assert.strictEqual($LastInteractiveElement, null, "No parameter passed: Null was returned");
	});

	QUnit.test("_getPreviousInteractiveElement", function(assert) {
		const $LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement(oTable.getRows()[0]);

		let $PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $LastInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0], getRowAction(0).find(".sapUiTableActionIcon:visible")[0],
			"The correct previous element was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0].value, "Focus&NoTabInput1", "The correct previous element was returned");

		$PreviousInteractiveElement = KeyboardDelegate._getPreviousInteractiveElement(oTable, $PreviousInteractiveElement);
		assert.strictEqual($PreviousInteractiveElement.length, 1, "(jQuery) Passed an interactive element: One interactive element was returned");
		assert.strictEqual($PreviousInteractiveElement[0].value, "Focus&TabInput1", "The correct previous element was returned");

		let $FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);
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
		const $FirstInteractiveElement = KeyboardDelegate._getFirstInteractiveElement(oTable.getRows()[0]);

		let $NextInteractiveElement = KeyboardDelegate._getNextInteractiveElement(oTable, $FirstInteractiveElement);
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

		let $LastInteractiveElement = KeyboardDelegate._getLastInteractiveElement(oTable.getRows()[0]);
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
		beforeEach: async function() {
			await setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("getInterface", function(assert) {
		const oDelegate = new KeyboardDelegate();
		assert.ok(oDelegate === oDelegate.getInterface(), "getInterface returns the object itself");
	});

	QUnit.module("Selection plugin integration", {
		beforeEach: async function() {
			this.oSelectionPlugin = new TableQUnitUtils.TestSelectionPlugin();
			this.oTable = await TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 5
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(4),
				columns: [
					TableQUnitUtils.createTextColumn()
				],
				rowActionTemplate: TableQUnitUtils.createRowAction(null),
				rowActionCount: 1,
				dependents: [this.oSelectionPlugin]
			});
			this.oSetSelected = this.spy(this.oSelectionPlugin, "setSelected");

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		testRowSelection(oTarget, iKeyCode, mSettings = {}) {
			const oRow = this.oTable.getRows()[TableUtils.getCellInfo(TableUtils.getCell(this.oTable, oTarget)).rowIndex];
			const bExpectSelected = !this.oSelectionPlugin.isSelected(oRow);
			let bCellClickFired = false;
			const onCellClick = (oEvent) => {
				oEvent.preventDefault();
				bCellClickFired = true;
			};

			if (mSettings.cellClickPreventDefault) {
				this.oTable.attachCellClick(onCellClick);
			}

			this.oSetSelected.resetHistory();

			sinon.assert.pass("Test: " + JSON.stringify({
				selectionBehavior: this.oTable.getSelectionBehavior(),
				keyCode: iKeyCode,
				...mSettings
			}));

			oTarget.focus();
			qutils.triggerKeydown(oTarget, iKeyCode, mSettings.shift);
			qutils.triggerKeyup(oTarget, iKeyCode, mSettings.shift);

			if (mSettings.cellClickPreventDefault && !bCellClickFired) {
				sinon.assert.fail("cellClick was expected to be fired, but was not fired");
			}

			if (mSettings.cellClickPreventDefault || mSettings.shouldNotCallPlugin) {
				sinon.assert.notCalled(this.oSetSelected);
			} else {
				sinon.assert.alwaysCalledWithExactly(this.oSetSelected, oRow, bExpectSelected);
				sinon.assert.callCount(this.oSetSelected, 1);
			}

			this.oTable.detachCellClick(onCellClick);
		}
	});

	QUnit.test("Space & Enter > Header selector", function(assert) {
		const oSpyHeaderSelectorPress = this.spy(this.oSelectionPlugin, "onHeaderSelectorPress");
		const oCell = this.oTable.qunit.getSelectAllCell();

		qutils.triggerKeydown(oCell, Key.SPACE);
		qutils.triggerKeyup(oCell, Key.SPACE);
		assert.ok(oSpyHeaderSelectorPress.calledOnceWithExactly(), "Space: onHeaderSelectorPress");

		oSpyHeaderSelectorPress.resetHistory();
		qutils.triggerKeydown(oCell, Key.ENTER);
		qutils.triggerKeyup(oCell, Key.ENTER);
		assert.ok(oSpyHeaderSelectorPress.calledOnceWithExactly(), "Enter: onHeaderSelectorPress");
	});

	QUnit.test("Space & Enter > Row Header Cell", function(assert) {
		const oCell = this.oTable.qunit.getRowHeaderCell(0);

		// selectionBehavior = RowSelector
		this.testRowSelection(oCell, Key.ENTER);
		this.testRowSelection(oCell, Key.SPACE);
		this.testRowSelection(oCell, Key.SPACE, {shift: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(oCell, Key.ENTER);
		this.testRowSelection(oCell, Key.SPACE);
		this.testRowSelection(oCell, Key.SPACE, {shift: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		this.testRowSelection(oCell, Key.ENTER, {shouldNotCallPlugin: true});
		this.testRowSelection(oCell, Key.SPACE, {shouldNotCallPlugin: true});
		this.testRowSelection(oCell, Key.SPACE, {shift: true});
	});

	QUnit.test("Space & Enter > Data Cell", function(assert) {
		const oCell = this.oTable.qunit.getDataCell(0, 0);

		// selectionBehavior = RowSelector
		this.testRowSelection(oCell, Key.ENTER, {shouldNotCallPlugin: true});
		this.testRowSelection(oCell, Key.SPACE, {shouldNotCallPlugin: true});
		this.testRowSelection(oCell, Key.SPACE, {shift: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(oCell, Key.ENTER);
		this.testRowSelection(oCell, Key.SPACE);
		this.testRowSelection(oCell, Key.SPACE, {shift: true});
		this.testRowSelection(oCell, Key.ENTER, {cellClickPreventDefault: true});
		this.testRowSelection(oCell, Key.SPACE, {cellClickPreventDefault: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		this.testRowSelection(oCell, Key.ENTER);
		this.testRowSelection(oCell, Key.SPACE);
		this.testRowSelection(oCell, Key.SPACE, {shift: true});
		this.testRowSelection(oCell, Key.ENTER, {cellClickPreventDefault: true});
		this.testRowSelection(oCell, Key.SPACE, {cellClickPreventDefault: true});
	});

	QUnit.test("Space & Enter > Row Action Cell", function(assert) {
		const oCell = this.oTable.qunit.getRowActionCell(0);

		// selectionBehavior = RowSelector
		this.testRowSelection(oCell, Key.ENTER, {shouldNotCallPlugin: true});
		this.testRowSelection(oCell, Key.SPACE, {shouldNotCallPlugin: true});
		this.testRowSelection(oCell, Key.SPACE, {shift: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(oCell, Key.ENTER);
		this.testRowSelection(oCell, Key.SPACE);
		this.testRowSelection(oCell, Key.SPACE, {shift: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		this.testRowSelection(oCell, Key.ENTER);
		this.testRowSelection(oCell, Key.SPACE);
		this.testRowSelection(oCell, Key.SPACE, {shift: true});
	});

	QUnit.test("Space & Enter > Cell in group header row", async function(assert) {
		const oRowHeaderCell = this.oTable.qunit.getRowHeaderCell(0);
		const oDataCell = this.oTable.qunit.getDataCell(0, 0);

		TableUtils.Grouping.setHierarchyMode(TableUtils.Grouping.HierarchyMode.Group);
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader}]);

		// selectionBehavior = RowSelector
		this.testRowSelection(oRowHeaderCell, Key.ENTER);
		this.testRowSelection(oRowHeaderCell, Key.SPACE);
		this.testRowSelection(oRowHeaderCell, Key.SPACE, {shift: true});
		this.testRowSelection(oDataCell, Key.ENTER, {shouldNotCallPlugin: true});
		this.testRowSelection(oDataCell, Key.SPACE, {shouldNotCallPlugin: true});
		this.testRowSelection(oDataCell, Key.SPACE, {shift: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(oRowHeaderCell, Key.ENTER);
		this.testRowSelection(oRowHeaderCell, Key.SPACE);
		this.testRowSelection(oRowHeaderCell, Key.SPACE, {shift: true});
		this.testRowSelection(oDataCell, Key.ENTER);
		this.testRowSelection(oDataCell, Key.SPACE);
		this.testRowSelection(oDataCell, Key.SPACE, {shift: true});
	});

	QUnit.test("Space & Enter > Cell in summary row", async function(assert) {
		const oRowHeaderCell = this.oTable.qunit.getRowHeaderCell(0);
		const oDataCell = this.oTable.qunit.getDataCell(0, 0);

		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.Summary}]);

		// selectionBehavior = RowSelector
		this.testRowSelection(oRowHeaderCell, Key.ENTER);
		this.testRowSelection(oRowHeaderCell, Key.SPACE);
		this.testRowSelection(oRowHeaderCell, Key.SPACE, {shift: true});
		this.testRowSelection(oDataCell, Key.ENTER, {shouldNotCallPlugin: true});
		this.testRowSelection(oDataCell, Key.SPACE, {shouldNotCallPlugin: true});
		this.testRowSelection(oDataCell, Key.SPACE, {shift: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(oRowHeaderCell, Key.ENTER);
		this.testRowSelection(oRowHeaderCell, Key.SPACE);
		this.testRowSelection(oRowHeaderCell, Key.SPACE, {shift: true});
		this.testRowSelection(oDataCell, Key.ENTER);
		this.testRowSelection(oDataCell, Key.SPACE);
		this.testRowSelection(oDataCell, Key.SPACE, {shift: true});
	});

	QUnit.test("Space & Enter > Cell in empty row", function(assert) {
		const test = (oTarget) => {
			sinon.assert.pass("Target: " + oTarget.id);
			oTarget.focus();

			this.oSetSelected.resetHistory();
			qutils.triggerKeydown(oTarget, Key.ENTER);
			qutils.triggerKeyup(oTarget, Key.ENTER);
			sinon.assert.notCalled(this.oSetSelected);

			this.oSetSelected.resetHistory();
			qutils.triggerKeydown(oTarget, Key.SPACE);
			qutils.triggerKeyup(oTarget, Key.SPACE);
			sinon.assert.notCalled(this.oSetSelected);

			this.oSetSelected.resetHistory();
			qutils.triggerKeydown(oTarget, Key.SPACE, true);
			qutils.triggerKeyup(oTarget, Key.SPACE, true);
			sinon.assert.notCalled(this.oSetSelected);
		};

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);

		test(this.oTable.qunit.getRowHeaderCell(-1));
		test(this.oTable.qunit.getDataCell(-1, -1));
		test(this.oTable.qunit.getRowActionCell(-1));
	});

	QUnit.test("Ctrl+A & Ctrl+Shift+A", async function(assert) {
		const oOnKeyboardShortcut = this.spy(this.oSelectionPlugin, "onKeyboardShortcut");
		let oEvent;
		const test = (oTarget, bExpectPluginCall = true) => {
			sinon.assert.pass("Ctrl+A on element " + oTarget.id);
			oOnKeyboardShortcut.resetHistory();
			qutils.triggerKeydown(oTarget, Key.A, false, false, true);

			if (bExpectPluginCall) {
				sinon.assert.alwaysCalledWithExactly(oOnKeyboardShortcut, "toggle", oEvent);
				sinon.assert.callCount(oOnKeyboardShortcut, 1);
			} else {
				sinon.assert.notCalled(oOnKeyboardShortcut);
			}

			sinon.assert.pass("Ctrl+Shift+A on element " + oTarget.id);
			oOnKeyboardShortcut.resetHistory();
			qutils.triggerKeydown(oTarget, Key.A, true, false, true);

			if (bExpectPluginCall) {
				sinon.assert.alwaysCalledWithExactly(oOnKeyboardShortcut, "clear", oEvent);
				sinon.assert.callCount(oOnKeyboardShortcut, 1);
			} else {
				sinon.assert.notCalled(oOnKeyboardShortcut);
			}
		};

		this.oTable.addDelegate({onkeydown: function(e) { oEvent = e; }});
		this.oTable.addExtension(new TestInputControl());
		this.oTable.setFooter(new TestInputControl());
		await this.oTable.qunit.whenRenderingFinished();

		test(this.oTable.qunit.getSelectAllCell());
		test(this.oTable.qunit.getDataCell(0, 0));
		test(this.oTable.qunit.getRowHeaderCell(0));
		test(this.oTable.qunit.getRowActionCell(0));
		test(this.oTable.qunit.getColumnHeaderCell(0), false);
		test(this.oTable.getExtension()[0].getDomRef(), false);
		test(this.oTable.getFooter().getDomRef(), false);
	});

	QUnit.test("Shift+Up & Shift+Down", async function(assert) {
		const oRowsUpdated = this.spy();
		const startRangeSelection = (oTarget) => {
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT);
		};
		const testRangeSelection = async (oTarget, iKeyCode, oRow, bSelected, bShouldScroll = false) => {
			sinon.assert.pass("Test: " + JSON.stringify({
				selectionBehavior: this.oTable.getSelectionBehavior(),
				target: oTarget.id,
				key: iKeyCode === Key.Arrow.UP ? "ArrowUp" : "ArrowDown"
			}));

			oTarget.focus();
			qutils.triggerKeydown(oTarget, iKeyCode, true);
			qutils.triggerKeyup(oTarget, iKeyCode, true);

			if (bShouldScroll) {
				await this.oTable.qunit.whenNextRenderingFinished();
				assert.ok(this.oSetSelected.calledAfter(oRowsUpdated), "setSelected called after scrolling");
			}

			sinon.assert.alwaysCalledWithExactly(this.oSetSelected, oRow, bSelected);
			sinon.assert.callCount(this.oSetSelected, 1);

			oRowsUpdated.resetHistory();
			this.oSetSelected.resetHistory();
		};
		const endRangeSelection = () => {
			qutils.triggerKeyup(document.activeElement, Key.SHIFT);
		};
		const toggleRowSelection = (oTarget) => {
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.ENTER);
			qutils.triggerKeyup(oTarget, Key.ENTER);
		};

		this.oTable.attachEvent("_rowsUpdated", oRowsUpdated);
		this.oTable.setModel(TableQUnitUtils.createJSONModel(20));
		await this.oTable.qunit.whenRenderingFinished();

		await toggleRowSelection(this.oTable.qunit.getRowHeaderCell(3)); // Select
		this.oSetSelected.resetHistory();

		// selectionBehavior = RowSelector
		startRangeSelection(this.oTable.qunit.getRowHeaderCell(3));
		await testRangeSelection(this.oTable.qunit.getRowHeaderCell(3), Key.Arrow.DOWN, this.oTable.getRows()[4], true);
		await testRangeSelection(this.oTable.qunit.getRowHeaderCell(4), Key.Arrow.DOWN, this.oTable.getRows()[4], true, true);
		await testRangeSelection(this.oTable.qunit.getDataCell(4, 0), Key.Arrow.UP, this.oTable.getRows()[4], false);
		await testRangeSelection(this.oTable.qunit.getDataCell(3, 0), Key.Arrow.UP, this.oTable.getRows()[3], false);
		await testRangeSelection(this.oTable.qunit.getRowActionCell(2), Key.Arrow.UP, this.oTable.getRows()[1], true);
		await testRangeSelection(this.oTable.qunit.getRowHeaderCell(1), Key.Arrow.UP, this.oTable.getRows()[0], true);
		await testRangeSelection(this.oTable.qunit.getRowHeaderCell(0), Key.Arrow.UP, this.oTable.getRows()[0], true, true);
		await testRangeSelection(this.oTable.qunit.getRowHeaderCell(0), Key.Arrow.DOWN, this.oTable.getRows()[0], false);
		endRangeSelection();

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		startRangeSelection(this.oTable.qunit.getDataCell(4, 0));
		await testRangeSelection(this.oTable.qunit.getDataCell(4, 0), Key.Arrow.DOWN, this.oTable.getRows()[4], false, true);
		await testRangeSelection(this.oTable.qunit.getDataCell(4, 0), Key.Arrow.UP, this.oTable.getRows()[4], false);
		await testRangeSelection(this.oTable.qunit.getRowHeaderCell(3), Key.Arrow.UP, this.oTable.getRows()[2], false);
		await testRangeSelection(this.oTable.qunit.getRowActionCell(2), Key.Arrow.UP, this.oTable.getRows()[1], false);
		await testRangeSelection(this.oTable.qunit.getDataCell(1, 0), Key.Arrow.UP, this.oTable.getRows()[0], false);
		await testRangeSelection(this.oTable.qunit.getDataCell(0, 0), Key.Arrow.UP, this.oTable.getRows()[0], false, true);
		await testRangeSelection(this.oTable.qunit.getDataCell(0, 0), Key.Arrow.DOWN, this.oTable.getRows()[0], false);
		endRangeSelection();
	});

	QUnit.module("Navigation > Tab & Shift+Tab", {
		beforeEach: async function() {
			await setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Default Test Table", function(assert) {
		let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT);
		oElem = checkFocus(getColumnHeader(1), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(getCell(0, 1), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN);
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
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT);
		oElem = checkFocus(getColumnHeader(2), assert);
		simulateTabEvent(oElem, false);
		checkFocus(getCell(1, 2), assert);
	});

	QUnit.test("Row Actions", async function(assert) {
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		let oElem = checkFocus(getRowAction(1, true), assert);
		simulateTabEvent(oElem, false);
		oElem = checkFocus(document.getElementById("Focus2"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(getRowAction(1), assert);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.test("Extension and Footer", async function(assert) {
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		await nextUIUpdate();

		let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(document.getElementById("Footer"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(getCell(0, 0), assert);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT);
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
		await nextUIUpdate();
		oElem = getCell(1, 1, true);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Extension"), assert);
	});

	QUnit.test("On a non-interactive element inside a cell", function(assert) {
		const oNonInteractiveElement = oTable.getRows()[0].getCells()[1].getDomRef();
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

	QUnit.test("No cells", async function(assert) {
		let oElem;

		oTable.setColumnHeaderVisible(false);
		oTable.getRowMode().setRowCount(0);
		await nextUIUpdate();

		oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem);
		oElem = checkFocus(document.getElementById("Focus2"), assert);

		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.test("No content cells", async function(assert) {
		let oElem;

		oTable.getRowMode().setRowCount(0);
		await nextUIUpdate();

		oElem = checkFocus(getColumnHeader(0, true), assert);
		simulateTabEvent(oElem);
		oElem = checkFocus(document.getElementById("Focus2"), assert);

		simulateTabEvent(oElem, true);
		checkFocus(getColumnHeader(0), assert);
	});

	QUnit.test("No columns", async function(assert) {
		let oElem;

		oTable.removeAllColumns();
		await nextUIUpdate();

		oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem);
		oElem = checkFocus(oTable.getDomRef("selall"), assert);
		simulateTabEvent(oElem);
		oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
		simulateTabEvent(oElem);
		oElem = checkFocus(document.getElementById("Focus2"), assert);

		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("selall"), assert);
		simulateTabEvent(oElem, true);
		oElem = checkFocus(document.getElementById("Focus1"), assert);

		oTable.setSelectionMode(library.SelectionMode.None);
		await nextUIUpdate();

		simulateTabEvent(oElem);
		oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
		simulateTabEvent(oElem);
		oElem = checkFocus(document.getElementById("Focus2"), assert);

		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.test("CreationRow when hideEmptyRows is set to true", async function(assert) {
		let oElem;
		const oCreationRow = new CreationRow();

		oTable.getRowMode().setRowCount(5);
		oTable.setAggregation("rowMode", new FixedRowMode().setHideEmptyRows(true));
		oTable.getColumns()[0].setCreationTemplate(new TestInputControl({text: "test"}));
		oTable.setCreationRow(oCreationRow);
		oTable.unbindRows();
		await nextUIUpdate();

		oElem = checkFocus(getColumnHeader(0, true), assert);
		simulateTabEvent(oElem);

		const oInput = KeyboardDelegate._getFirstInteractiveElement(oTable.getCreationRow())[0];
		oElem = checkFocus(oInput, assert);
		simulateTabEvent(oElem);

		const oApplyButton = document.getElementById(oCreationRow.getId() + "-applyBtn");
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
		beforeEach: async function() {
			renderFocusDummy("FocusDummyBeforeTable");

			this.oTable = await TableQUnitUtils.createTable({
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
			const bRTL = Localization.getRTL();
			const mKeyInfo = {};
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
			const mRowCounts = this.oTable._getRowCounts();
			const bHasColumnHeaders = this.oTable.getColumnHeaderVisible();
			const bHasRowHeaders = TableUtils.hasRowHeader(this.oTable);
			const bHasRowActions = TableUtils.hasRowActions(this.oTable);
			const iColumnCount = this.oTable._getVisibleColumns().length;
			const iRowCount = window.iNumberOfRows;
			let oTarget;let i;let iRowIndex;let oRow;

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

			const iStartIndex = iColumnCount - (bHasRowActions ? 1 : 2);
			const iEndIndex = 0;

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
		}
	});

	QUnit.test("Fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		this.testArrowKeys(assert);
	});

	QUnit.test("Fixed columns + fixed rows", async function(assert) {
		this.oTable.setFixedColumnCount(1);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		await this.oTable.qunit.whenRenderingFinished();

		this.testArrowKeys(assert);
	});

	QUnit.test("No Row Header", async function(assert) {
		this.oTable.setSelectionMode(library.SelectionMode.None);
		await this.oTable.qunit.whenRenderingFinished();

		this.testArrowKeys(assert);
	});

	QUnit.test("No Column Header", async function(assert) {
		this.oTable.setColumnHeaderVisible(false);
		await this.oTable.qunit.whenRenderingFinished();

		this.testArrowKeys(assert);
	});

	QUnit.test("Row Actions", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		this.testArrowKeys(assert);
	});

	QUnit.test("Fixed columns + fixed rows + row header + column header + row actions", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		this.oTable.setFixedColumnCount(1);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		await this.oTable.qunit.whenRenderingFinished();

		this.testArrowKeys(assert);
	});

	QUnit.test("Multi header", async function(assert) {
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		this.oTable.getColumns()[1].setHeaderSpan([2, 1]);
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
		await this.oTable.qunit.whenRenderingFinished();

		simulateTabEvent(TableQUnitUtils.setFocusOutsideOfTable(assert, "FocusDummyBeforeTable"), false);
		this.triggerKey(Key.Arrow.DOWN, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(0, 1));
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getColumnHeaderCell(0, 1), this.oTable.qunit.getColumnHeaderCell(1, 1));
		this.triggerKey(Key.Arrow.UP, this.oTable.qunit.getColumnHeaderCell(1, 1), this.oTable.qunit.getColumnHeaderCell(1));
		this.triggerKey(Key.Arrow.DOWN, this.oTable.qunit.getColumnHeaderCell(1), this.oTable.qunit.getColumnHeaderCell(1, 1));
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getColumnHeaderCell(1, 1), this.oTable.qunit.getColumnHeaderCell(2, 1));
		this.triggerKey(Key.Arrow.UP, this.oTable.qunit.getColumnHeaderCell(2, 1), this.oTable.qunit.getColumnHeaderCell(1));
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getColumnHeaderCell(1), this.oTable.qunit.getColumnHeaderCell(3));
		this.triggerKey(Key.Arrow.DOWN, this.oTable.qunit.getColumnHeaderCell(3), this.oTable.qunit.getColumnHeaderCell(3, 1));
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getColumnHeaderCell(3, 1), this.oTable.qunit.getColumnHeaderCell(2, 1));
		this.triggerKey(Key.Arrow.UP, this.oTable.qunit.getColumnHeaderCell(2, 1), this.oTable.qunit.getColumnHeaderCell(1));
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getColumnHeaderCell(1), this.oTable.qunit.getColumnHeaderCell(0));
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getSelectAllCell());
		this.triggerKey(Key.Arrow.DOWN, this.oTable.qunit.getSelectAllCell(), this.oTable.qunit.getRowHeaderCell(0));
	});

	QUnit.test("Multi header + row actions", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		this.oTable.getColumns()[1].setHeaderSpan([2, 1]);
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
		await this.oTable.qunit.whenRenderingFinished();

		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(-1));
		this.triggerKey(Key.Arrow.RIGHT,
			document.getElementById(this.oTable.qunit.getColumnHeaderCell(-1).getAttribute("id") + "_1"),
			document.getElementById(this.oTable.qunit.getColumnHeaderCell(-1).getAttribute("id") + "_1"));
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("On a non-interactive element inside a cell", function(assert) {
		const oNonInteractiveElement = this.oTable.getRows()[1].getCells()[1].getDomRef();

		oNonInteractiveElement.tabIndex = -1;
		this.triggerKey(Key.Arrow.UP, oNonInteractiveElement, this.oTable.qunit.getDataCell(1, 1),
			{defaultPrevented: false, propagationStopped: false});
		this.triggerKey(Key.Arrow.DOWN, oNonInteractiveElement, this.oTable.qunit.getDataCell(1, 1),
			{defaultPrevented: false, propagationStopped: false});
	});

	QUnit.test("Variable row heights", async function(assert) {
		this.oTable._bVariableRowHeightEnabled = true;
		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		this.testArrowKeys(assert);
	});

	QUnit.module("Navigation > Ctrl+Arrow Keys", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

			const mKeyInfo = {};
			const bRTL = Localization.getRTL();
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

	QUnit.test("Ctrl+Alt+ArrowUp & Ctrl+Alt+ArrowDown", function(assert) {
		this.oTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(!oEvent.isDefaultPrevented(), "Default action of keydown event is not prevented");
				assert.ok(!oEvent.isMarked(), "Event is not marked");
				oEvent.preventDefault();
			}
		});

		const oCell = this.oTable.qunit.getDataCell(1, 1);
		oCell.focus();
		qutils.triggerKeydown(oCell, Key.Arrow.UP, false, true, true);
		qutils.triggerKeydown(oCell, Key.Arrow.DOWN, false, true, true);
	});

	QUnit.module("Navigation > Shift+Arrow Keys", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

			const mKeyInfo = {};
			const bRTL = Localization.getRTL();
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
		const that = this;
		let oTarget;

		function test() {
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
		}

		// Range Selection
		oTarget = this.oTable.qunit.getSelectAllCell();
		oTarget.focus();
		qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.
		test();
		qutils.triggerKeyup(oTarget, Key.SHIFT); // End selection mode.

		oTarget = this.oTable.qunit.getColumnHeaderCell(0);
		oTarget.focus();
		qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.
		test();
		qutils.triggerKeyup(oTarget, Key.SHIFT); // End selection mode.

		// Column Resizing
		oTarget = this.oTable.qunit.getSelectAllCell();
		test();

		oTarget = this.oTable.qunit.getColumnHeaderCell(0);
		test();
	});

	QUnit.test("Inside Row Header, Fixed Rows (Range Selection)", async function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowSelector);
		await this.oTable.qunit.whenRenderingFinished();

		const that = this;
		let oTarget = this.oTable.qunit.getRowHeaderCell(0);

		function navigate(sKey, iDestinationRowIndex, iExpectedAbsoluteRowIndex, bExpectRowsUpdate) {
			const oDestination = that.oTable.qunit.getRowHeaderCell(iDestinationRowIndex);
			const pTriggerKey = that.triggerKey(sKey, oTarget, oDestination, {rowsUpdate: bExpectRowsUpdate});

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
			qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.

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
		}).then(async function() {
			navigate(Key.Arrow.UP, 1, 1);
			navigate(Key.Arrow.UP, 0, 0);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
			qutils.triggerKeyup(oTarget, Key.SHIFT); // End selection mode.

			assert.ok(true, "[INFO] SelectionMode = Single");
			that.oTable.setSelectionMode(library.SelectionMode.Single);
			await that.oTable.qunit.whenRenderingFinished();
			// eslint-disable-next-line require-atomic-updates
			oTarget = that.oTable.qunit.getRowHeaderCell(1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
		});
	});

	QUnit.test("Inside Data Rows, Fixed Rows (Range Selection)", async function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		await this.oTable.qunit.whenRenderingFinished();

		const that = this;
		let oTarget = this.oTable.qunit.getDataCell(0, 0);

		function navigate(sKey, iDestinationRowIndex, iExpectedAbsoluteRowIndex, iDestinationColumnIndex, bExpectRowsUpdate) {
			const oDestination = that.oTable.qunit.getDataCell(iDestinationRowIndex, iDestinationColumnIndex);
			const pTriggerKey = that.triggerKey(sKey, oTarget, oDestination, {rowsUpdate: bExpectRowsUpdate});

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
			qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.

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
		}).then(async function() {
			navigate(Key.Arrow.UP, 1, 1, 0);
			navigate(Key.Arrow.UP, 0, 0, 0);

			assert.ok(true, "[INFO] SelectionBehavior = RowSelector");
			qutils.triggerKeyup(oTarget, Key.SHIFT); // End selection mode.
			that.oTable.setSelectionBehavior(library.SelectionBehavior.RowSelector);
			await that.oTable.qunit.whenRenderingFinished();
			// eslint-disable-next-line require-atomic-updates
			oTarget = that.oTable.qunit.getDataCell(1, 1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.
			navigate(Key.Arrow.DOWN, 2, 2, 1);
			navigate(Key.Arrow.UP, 1, 1, 1);
			navigate(Key.Arrow.LEFT, 1, 1, 0);
			navigate(Key.Arrow.RIGHT, 1, 1, 1);

			assert.ok(true, "[INFO] SelectionMode = Single");
			qutils.triggerKeyup(oTarget, Key.SHIFT); // End selection mode.
			that.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
			that.oTable.setSelectionMode(library.SelectionMode.Single);
			await that.oTable.qunit.whenRenderingFinished();
			// eslint-disable-next-line require-atomic-updates
			oTarget = that.oTable.qunit.getDataCell(1, 1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);

			assert.ok(true, "[INFO] SelectionMode = None");
			qutils.triggerKeyup(oTarget, Key.SHIFT); // End selection mode.
			that.oTable.setSelectionMode(library.SelectionMode.None);
			await that.oTable.qunit.whenRenderingFinished();
			// eslint-disable-next-line require-atomic-updates
			oTarget = that.oTable.qunit.getDataCell(1, 1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
		});
	});

	QUnit.test("Inside Row Actions, Fixed Rows (Range Selection)", async function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		const that = this;
		let oTarget = this.oTable.qunit.getRowActionCell(0);

		function navigate(sKey, iDestinationRowIndex, iExpectedAbsoluteRowIndex, bExpectRowsUpdate) {
			const oDestination = that.oTable.qunit.getRowActionCell(iDestinationRowIndex);
			const pTriggerKey = that.triggerKey(sKey, oTarget, oDestination, {rowsUpdate: bExpectRowsUpdate});

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
			qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.

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
		}).then(async function() {
			navigate(Key.Arrow.UP, 1, 1);
			navigate(Key.Arrow.UP, 0, 0);

			assert.ok(true, "[INFO] SelectionBehavior = RowSelector");
			qutils.triggerKeyup(oTarget, Key.SHIFT); // End selection mode.
			that.oTable.setSelectionBehavior(library.SelectionBehavior.RowSelector);
			await that.oTable.qunit.whenRenderingFinished();
			// eslint-disable-next-line require-atomic-updates
			oTarget = that.oTable.qunit.getRowActionCell(1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.
			navigate(Key.Arrow.DOWN, 2, 2);
			navigate(Key.Arrow.UP, 1, 1);

			assert.ok(true, "[INFO] SelectionMode = Single");
			qutils.triggerKeyup(oTarget, Key.SHIFT); // End selection mode.
			that.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
			that.oTable.setSelectionMode(library.SelectionMode.Single);
			await that.oTable.qunit.whenRenderingFinished();
			// eslint-disable-next-line require-atomic-updates
			oTarget = that.oTable.qunit.getRowActionCell(1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);

			assert.ok(true, "[INFO] SelectionMode = None");
			qutils.triggerKeyup(oTarget, Key.SHIFT); // End selection mode.
			that.oTable.setSelectionMode(library.SelectionMode.None);
			await that.oTable.qunit.whenRenderingFinished();
			// eslint-disable-next-line require-atomic-updates
			oTarget = that.oTable.qunit.getRowActionCell(1);
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.SHIFT); // Start selection mode.
			that.triggerKey(Key.Arrow.DOWN, oTarget, oTarget);
			that.triggerKey(Key.Arrow.UP, oTarget, oTarget);
			that.triggerKey(Key.Arrow.LEFT, oTarget, oTarget);
			that.triggerKey(Key.Arrow.RIGHT, oTarget, oTarget);
		});
	});

	QUnit.test("Move between Row Header and Row (Range Selection)", function(assert) {
		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.oTable.qunit.getRowHeaderCell(0).focus();
		qutils.triggerKeydown(this.oTable.qunit.getRowHeaderCell(0), Key.SHIFT); // Start selection mode.
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getDataCell(0, 0));
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getRowHeaderCell(0));
	});

	QUnit.test("Move between Row Actions and Row (Range Selection)", async function(assert) {
		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		this.oTable.qunit.getRowActionCell(0).focus();
		qutils.triggerKeydown(this.oTable.qunit.getRowActionCell(0), Key.SHIFT); // Start selection mode.
		this.triggerKey(Key.Arrow.LEFT, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getDataCell(0, -1));
		this.triggerKey(Key.Arrow.RIGHT, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.module("Navigation > Alt+Arrow Keys", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

			const mKeyInfo = {};
			const bRTL = Localization.getRTL();
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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

			const mKeyInfo = {};
			mKeyInfo[Key.HOME] = {eventName: "onsaphome", keyName: "Home"};
			mKeyInfo[Key.END] = {eventName: "onsapend", keyName: "End"};

			TriggerKeyMixin.call(this, this.oTable, mKeyInfo);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Element outside the grid", async function(assert) {
		const oInput = new TestInputControl({tabbable: true});
		this.oTable.addExtension(oInput);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Column header; No row selection", async function(assert) {
		this.oTable.setSelectionMode(library.SelectionMode.None);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Column header; 1 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(1);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Column header; 1 (of 5) fixed columns with row actions", async function(assert) {
		this.oTable.setFixedColumnCount(1);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		// First Non-Fixed area - First Column Header
		// *END* -> Non-Fixed area - Last Column Header
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(1), this.oTable.qunit.getColumnHeaderCell(-1));

		// *HOME* -> Non-Fixed area - First Column Header
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(1));

		// *HOME* -> Fixed area - Single Column Header
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(1), this.oTable.qunit.getColumnHeaderCell(0));
	});

	QUnit.test("Column header; 2 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(2);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Column header; 4 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(4);
		await this.oTable.qunit.whenRenderingFinished();

		// Non-Fixed area - Single cell
		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(3));

		// *END* -> Non-Fixed area - Single cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(3), this.oTable.qunit.getColumnHeaderCell(-1));
	});

	QUnit.test("Column header; 5 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(5);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Content; No row selection", async function(assert) {
		this.oTable.setSelectionMode(library.SelectionMode.None);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Content; 1 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(1);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Content; 2 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(2);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Content; 4 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(4);
		await this.oTable.qunit.whenRenderingFinished();

		// Non-Fixed area - Single cell
		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 3));

		// *END* -> Non-Fixed area - Single cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 3), this.oTable.qunit.getDataCell(0, -1));
	});

	QUnit.test("Content; 5 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(5);
		await this.oTable.qunit.whenRenderingFinished();

		// Fixed area - Last cell
		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, -1), this.oTable.qunit.getDataCell(0, 0));

		// *END* -> Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 4));
	});

	QUnit.test("Row action", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Row action; 1 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(1);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Row action; 2 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(2);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Row action; 5 (of 5) fixed columns", async function(assert) {
		this.oTable.setFixedColumnCount(5);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Fixed columns with column span", async function(assert) {
		const iColSpan = 2;

		this.oTable.setFixedColumnCount(4);
		this.oTable.getColumns()[2].setHeaderSpan([iColSpan]);
		await this.oTable.qunit.whenRenderingFinished();

		// Fixed area - First cell
		// *END* -> Fixed area - Last cell (First cell of the span)
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(4 - iColSpan));

		// *END* -> Non-Fixed area - Single cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(4 - iColSpan), this.oTable.qunit.getColumnHeaderCell(-1));

		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1), this.oTable.qunit.getColumnHeaderCell(0));
	});

	QUnit.test("Fixed columns with multi header", async function(assert) {
		const iColSpan = 2;

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
		await this.oTable.qunit.whenRenderingFinished();

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
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0, 1), this.oTable.qunit.getColumnHeaderCell(2, 1));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(2, 1), this.oTable.qunit.getColumnHeaderCell(-1, 1));

		// *END* -> Non-Fixed area - Last cell
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(-1, 1), this.oTable.qunit.getColumnHeaderCell(-1, 1));

		// *HOME* -> Non-Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(-1, 1), this.oTable.qunit.getColumnHeaderCell(3, 1));

		// *HOME* -> Fixed area - First cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(3, 1), this.oTable.qunit.getColumnHeaderCell(0, 1));
	});

	QUnit.test("Group Row Header", async function(assert) {
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader}]);

		// If the focus is on a group row header, the focus should not be changed by pressing Home or End.
		this.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));
		this.triggerKey(Key.END, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));
	});

	QUnit.module("Navigation > Ctrl+Home & Ctrl+End ", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

			const mKeyInfo = {};
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
		const iTotalRowCount = this.oTable._getTotalRowCount();
		const iRowCount = this.oTable._getRowCounts().count;

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

	QUnit.test("Row header column - Less data rows than rendered rows", async function(assert) {
		this.oTable.getRowMode().setRowCount(10);
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);

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

	QUnit.test("Row header column - Less data rows than rendered rows and fixed rows", async function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 12,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const mRowCounts = this.oTable._getRowCounts();
		const iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);
		const iLastScrollableRowIndex = iNonEmptyRowCount - mRowCounts.fixedBottom - 1;
		const iLastDataRowIndex = iNonEmptyRowCount - 1;
		const iLastRowIndex = mRowCounts.fixedTop - 1;

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

	QUnit.test("Row header column - No Column Header", async function(assert) {
		this.oTable.setColumnHeaderVisible(false);
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const iRowCount = this.oTable._getRowCounts().count;

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

	QUnit.test("Row header column - Multi Header and Fixed Top/Bottom Rows", async function(assert) {
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
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const mRowCounts = this.oTable._getRowCounts();
		const iLastScrollableIndex = mRowCounts.count - mRowCounts.fixedBottom - 1;
		const iLastFixedTopIndex = mRowCounts.fixedTop - 1;

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
		qutils.triggerKeydown(this.oTable.qunit.getRowHeaderCell(-1), Key.Arrow.UP);
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
		const oTable = this.oTable;
		const iTotalRowCount = oTable._getTotalRowCount();
		const iRowCount = oTable._getRowCounts().count;
		const that = this;

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

	QUnit.test("Content column - Less data rows than rendered rows", async function(assert) {
		this.oTable.getRowMode().setRowCount(10);
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const iRowCount = this.oTable._getRowCounts().count;
		const iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);

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

	QUnit.test("Content column - Less data rows than rendered rows and fixed rows", async function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 12,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const mRowCounts = this.oTable._getRowCounts();
		const iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);
		const iLastScrollableRowIndex = iNonEmptyRowCount - mRowCounts.fixedBottom - 1;

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

	QUnit.test("Content column - No Column Header", async function(assert) {
		this.oTable.setColumnHeaderVisible(false);
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const iRowCount = this.oTable._getRowCounts().count;

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

	QUnit.test("Content column - Multi Header and Fixed Top/Bottom Rows", async function(assert) {
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
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const mRowCounts = this.oTable._getRowCounts();
		const iLastScrollableIndex = mRowCounts.count - mRowCounts.fixedBottom - 1;

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
		qutils.triggerKeydown(this.oTable.qunit.getDataCell(-1, 0), Key.Arrow.UP);
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

	QUnit.test("Content column - Variable row heights", async function(assert) {
		this.oTable._bVariableRowHeightEnabled = true;
		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const iRowCount = this.oTable._getRowCounts().count;
		const that = this;

		// *HOME* -> Header cell
		this.triggerKey(Key.HOME, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getColumnHeaderCell(0));

		// *END* -> Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getColumnHeaderCell(0), this.oTable.qunit.getDataCell(-1, 0));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oTable.getRows()[iRowCount - 1].getBindingContext().getProperty("A"), "A_7", "Row content");

		// *END* -> Last row
		that.triggerKey(Key.END, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(-1, 0));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");

		// *HOME* -> Header cell (scrolled to top)
		that.triggerKey(Key.HOME, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getColumnHeaderCell(0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Row index");
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oTable.getRows()[0].getBindingContext().getProperty("A"), "A_0", "Row content");

		// Last row -> *END* -> Last row (scrolled to bottom)
		that.triggerKey(Key.END, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(-1, 0));
		assert.equal(this.oTable.getRows()[iRowCount - 1].getIndex(), iTotalRowCount - 1, "Row index");
	});

	QUnit.test("Row action column", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const iRowCount = this.oTable._getRowCounts().count;

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

	QUnit.test("Row action column - Less data rows than rendered rows", async function(assert) {
		this.oTable.getRowMode().setRowCount(10);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);

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

	QUnit.test("Row action column - Less data rows than rendered rows and fixed rows", async function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 12,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const mRowCounts = this.oTable._getRowCounts();
		const iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);
		const iLastScrollableRowIndex = iNonEmptyRowCount - mRowCounts.fixedBottom - 1;

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

	QUnit.test("Row action column - No Column Header", async function(assert) {
		this.oTable.setColumnHeaderVisible(false);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const iRowCount = this.oTable._getRowCounts().count;

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

	QUnit.test("Row action column - Multi Header and Fixed Top/Bottom Rows", async function(assert) {
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
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const mRowCounts = this.oTable._getRowCounts();
		const iLastScrollableIndex = mRowCounts.count - mRowCounts.fixedBottom - 1;

		// *HOME* -> First Row Action
		this.triggerKey(Key.HOME, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));

		// *END* -> Scrollable area - Last row (scrolled to bottom)
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(iLastScrollableIndex));
		assert.equal(this.oTable.getRows()[iLastScrollableIndex].getIndex(), iTotalRowCount - mRowCounts.fixedBottom - 1, "Row index");

		// *END* -> Bottom fixed area - Last row
		this.triggerKey(Key.END, this.oTable.qunit.getRowActionCell(iLastScrollableIndex), this.oTable.qunit.getRowActionCell(-1));

		// *ARROW_UP* -> Bottom fixed area - Second-last row
		qutils.triggerKeydown(this.oTable.qunit.getRowActionCell(-1), Key.Arrow.UP);
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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

			const mKeyInfo = {};
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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

			const mKeyInfo = {};
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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

			const mKeyInfo = {};
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
		testPageKeys: async function(assert) {
			const mRowCounts = this.oTable._getRowCounts();
			const iTotalRowCount = this.oTable._getTotalRowCount();
			const iNonEmptyRowCount = TableUtils.getNonEmptyRowCount(this.oTable);
			const iPageSize = iNonEmptyRowCount - mRowCounts.fixedTop - mRowCounts.fixedBottom;
			const iLastScrollableRowIndex = iNonEmptyRowCount - mRowCounts.fixedBottom - 1;
			const iHeaderRowCount = TableUtils.getHeaderRowCount(this.oTable);
			let i;

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
				qutils.triggerKeydown(this.oTable.qunit.getRowHeaderCell(iNonEmptyRowCount - 1), Key.Arrow.UP);
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
				qutils.triggerKeydown(this.oTable.qunit.getRowHeaderCell(0), Key.Arrow.DOWN);
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
				const oLastHeaderCell = document.getElementById(
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
				qutils.triggerKeydown(this.oTable.qunit.getDataCell(iNonEmptyRowCount - 1, 0), Key.Arrow.UP);
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
				qutils.triggerKeydown(this.oTable.qunit.getDataCell(0, 0), Key.Arrow.DOWN);
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

			this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
			this.oTable.setRowActionCount(1);
			await this.oTable.qunit.whenRenderingFinished();

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
				qutils.triggerKeydown(this.oTable.qunit.getRowActionCell(iNonEmptyRowCount - 1), Key.Arrow.UP);
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
				qutils.triggerKeydown(this.oTable.qunit.getRowActionCell(0), Key.Arrow.DOWN);
				checkFocus(this.oTable.qunit.getRowActionCell(1), assert);

				// *PAGE_UP* -> Top fixed area - First row
				this.triggerKey(Key.Page.UP, this.oTable.qunit.getRowActionCell(0), this.oTable.qunit.getRowActionCell(0));
			}
		}
	});

	QUnit.test("More data rows than rendered rows", function(assert) {
		this.testPageKeys(assert);
	});

	QUnit.test("Less data rows than rendered rows", async function(assert) {
		this.oTable.getRowMode().setRowCount(10);
		await this.oTable.qunit.whenRenderingFinished();

		this.testPageKeys(assert);
	});

	QUnit.test("Multi Header", async function(assert) {
		this.oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[1].addMultiLabel(new TestControl({text: "b1"}));
		this.oTable.getColumns()[1].setHeaderSpan([2, 1]);
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b"}));
		this.oTable.getColumns()[2].addMultiLabel(new TestControl({text: "b2"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d"}));
		this.oTable.getColumns()[3].addMultiLabel(new TestControl({text: "d1"}));
		await this.oTable.qunit.whenRenderingFinished();

		this.testPageKeys(assert);
	});

	QUnit.test("Fixed rows", async function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		await this.oTable.qunit.whenRenderingFinished();

		this.testPageKeys(assert);
	});

	QUnit.test("Less data rows than rendered rows and fixed rows", async function(assert) {
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 10,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		await this.oTable.qunit.whenRenderingFinished();

		this.testPageKeys(assert);
	});

	QUnit.test("Multi header and fixed rows", async function(assert) {
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
		await this.oTable.qunit.whenRenderingFinished();

		this.testPageKeys(assert);
	});

	QUnit.test("Variable row heights", async function(assert) {
		this.oTable._bVariableRowHeightEnabled = true;
		this.oTable.invalidate();
		this.oTable.getModel().destroy();
		this.oTable.setModel(TableQUnitUtils.createJSONModel(10));
		await this.oTable.qunit.whenRenderingFinished();

		const iTotalRowCount = this.oTable._getTotalRowCount();
		const mRowCounts = this.oTable._getRowCounts();
		const that = this;

		// *PAGE_DOWN* -> Last row
		that.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(-1, 0));

		// *PAGE_DOWN* -> Last row - Scrolled down
		that.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(-1, 0));
		assert.equal(this.oTable.getRows()[mRowCounts.count - 1].getIndex(), mRowCounts.count * 2 - 1, "Scrolled down: Row index");

		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oTable.getRows()[mRowCounts.count - 1].getBindingContext().getProperty("A"), "A_7", "Scrolled down: Row content");

		// *PAGE_DOWN* -> Last row - Scrolled to bottom
		that.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(-1, 0));
		assert.equal(this.oTable.getRows()[mRowCounts.count - 1].getIndex(), iTotalRowCount - 1, "Scrolled to bottom: Row index");
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oTable.getRows()[mRowCounts.count - 1].getBindingContext().getProperty("A"), "A_9", "Scrolled to bottom: Row content");

		// *PAGE_DOWN* -> Last row
		that.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(-1, 0));

		// *PAGE_UP* -> Scrollable area - First row
		that.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(-1, 0), this.oTable.qunit.getDataCell(0, 0));
		assert.equal(this.oTable.getRows()[0].getIndex(), iTotalRowCount - mRowCounts.count, "Row index");
		assert.equal(this.oTable.getRows()[0].getBindingContext().getProperty("A"), "A_6", "Row content");

		// *PAGE_UP* -> First row - Scrolled up
		that.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));
		assert.equal(this.oTable.getRows()[0].getIndex(), iTotalRowCount - mRowCounts.count * 2, "Scrolled up: Row index");
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oTable.getRows()[0].getBindingContext().getProperty("A"), "A_2", "Scrolled up: Row content");

		// *PAGE_UP* -> First row - Scrolled to top
		that.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getColumnHeaderCell(0));
		assert.equal(this.oTable.getRows()[0].getIndex(), 0, "Scrolled to top: Row index");
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oTable.getRows()[0].getBindingContext().getProperty("A"), "A_0", "Scrolled to top: Row content");
	});

	QUnit.module("Navigation > Ctrl+Page Up & Ctrl+Page Down", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

			const mKeyInfo = {};
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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

			const mKeyInfo = {};
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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModel(8),
				columns: [
					(function() {
						const aColumns = [];

						for (let i = 0; i < 27; i++) {
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

			const mKeyInfo = {};
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
		let oTarget;
		const iColumnCount = this.oTable.getColumns().length;
		let i;

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

	QUnit.test("Column header; With row actions", async function(assert) {
		const iColumnCount = this.oTable.getColumns().length;
		let oTarget;
		let i;

		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Column header; No row header", async function(assert) {
		const iColumnCount = this.oTable.getColumns().length;
		let oTarget;
		let i;

		this.oTable.setSelectionMode(library.SelectionMode.None);
		await this.oTable.qunit.whenRenderingFinished();

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
		let oTarget;
		const iColumnCount = this.oTable.getColumns().length;
		let i;

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

	QUnit.test("Content; With row actions", async function(assert) {
		const iColumnCount = this.oTable.getColumns().length;
		let oTarget;
		let i;

		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Content; No row header", async function(assert) {
		const iColumnCount = this.oTable.getColumns().length;
		let oTarget;
		let i;

		this.oTable.setSelectionMode(library.SelectionMode.None);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Column Spans", async function(assert) {
		const iColumnCount = this.oTable.getColumns().length;
		let oTarget;
		let i;

		this.oTable.getColumns()[0].setHeaderSpan([3]);
		this.oTable.getColumns()[3].setHeaderSpan([8]);
		this.oTable.getColumns()[11].setHeaderSpan([2]);
		this.oTable.getColumns()[25].setHeaderSpan([2]);
		await this.oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Group Row Header", async function(assert) {
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader}]);

		// Selection cell -> *PAGE_DOWN* -> Group header
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getRowHeaderCell(0), this.oTable.qunit.getDataCell(0, 0));

		// *PAGE_DOWN* -> Group header
		this.triggerKey(Key.Page.DOWN, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getDataCell(0, 0));

		// *PAGE_UP* -> Selection cell
		this.triggerKey(Key.Page.UP, this.oTable.qunit.getDataCell(0, 0), this.oTable.qunit.getRowHeaderCell(0));
	});

	QUnit.module("Navigation > F6 & Shift+F6", {
		beforeEach: async function() {
			await setupTest();

			// Enhance the Navigation Handler to use the test scope only (not the QUnit related DOM)
			this.handleF6GroupNavigationOriginal = F6Navigation.handleF6GroupNavigation;
			const that = this;
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

	QUnit.test("F6 - Forward navigation - With Extension and Footer", async function(assert) {
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		await nextUIUpdate();

		let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		qutils.triggerKeydown(oElem, "F6");
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "F6");
		checkFocus(document.getElementById("Footer"), assert);

		oElem = getCell(1, 1, true, assert);
		qutils.triggerKeydown(oElem, "F6");
		checkFocus(document.getElementById("Footer"), assert);

		oElem = getRowHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6");
		checkFocus(document.getElementById("Footer"), assert);

		oElem = getSelectAll(true, assert);
		qutils.triggerKeydown(oElem, "F6");
		checkFocus(document.getElementById("Footer"), assert);

		oElem = getColumnHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6");
		checkFocus(document.getElementById("Footer"), assert);
	});

	QUnit.test("Shift+F6 - Backward navigation - With Extension and Footer", async function(assert) {
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		await nextUIUpdate();

		let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
		qutils.triggerKeydown(oElem, "F6", true);
		oElem = checkFocus(getColumnHeader(0), assert);
		qutils.triggerKeydown(oElem, "F6", true);
		checkFocus(document.getElementById("Focus1"), assert);

		oElem = getCell(1, 1, true, assert);
		qutils.triggerKeydown(oElem, "F6", true);
		checkFocus(document.getElementById("Focus1"), assert);

		oElem = getRowHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6", true);
		checkFocus(document.getElementById("Focus1"), assert);

		oElem = getSelectAll(true, assert);
		qutils.triggerKeydown(oElem, "F6", true);
		checkFocus(document.getElementById("Focus1"), assert);

		oElem = getColumnHeader(1, true, assert);
		qutils.triggerKeydown(oElem, "F6", true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.module("Navigation > Overlay", {
		beforeEach: async function() {
			await setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Tab - Default Test Table", function(assert) {
		oTable.setShowOverlay(true);

		let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(document.getElementById("Focus2"), assert);
	});

	QUnit.test("Tab - With Extension and Footer", async function(assert) {
		oTable.setShowOverlay(true);
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		await nextUIUpdate();

		let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, false);
		checkFocus(document.getElementById("Focus2"), assert);
	});

	QUnit.test("Shift+Tab - Default", function(assert) {
		oTable.setShowOverlay(true);

		let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.test("Shift+Tab - With Extension and Footer", async function(assert) {
		oTable.setShowOverlay(true);
		oTable.addExtension(new TestControl("Extension", {text: "Extension", tabbable: true}));
		oTable.setFooter(new TestControl("Footer", {text: "Footer", tabbable: true}));
		await nextUIUpdate();

		let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		oElem = checkFocus(oTable.getDomRef("overlay"), assert);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.module("Navigation > NoData", {
		beforeEach: async function() {
			await setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Tab - Default Test Table", function(assert) {
		const done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
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

	QUnit.test("Tab - Without Column Header", async function(assert) {
		const done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(oTable.getDomRef("noDataCnt"), assert);
			simulateTabEvent(oElem, false);
			checkFocus(document.getElementById("Focus2"), assert);

			done();
		}

		oTable.setColumnHeaderVisible(false);
		await nextUIUpdate();
		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Tab - With Extension and Footer", async function(assert) {
		const done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
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
		await nextUIUpdate();
		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("Shift+Tab", function(assert) {
		const done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
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

	QUnit.test("Shift+Tab - With Extension and Footer", async function(assert) {
		const done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
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
		await nextUIUpdate();
		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.test("No Vertical Navigation (Header <-> Content)", function(assert) {
		const done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
			simulateTabEvent(oElem, false);
			oElem = checkFocus(getColumnHeader(0), assert);
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN);
			oElem = checkFocus(getColumnHeader(0), assert);
			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT);
			oElem = checkFocus(getColumnHeader(1), assert);
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT);
			oElem = checkFocus(getColumnHeader(0), assert);
			qutils.triggerKeydown(oElem, Key.Page.DOWN);
			oElem = checkFocus(getColumnHeader(0), assert);
			qutils.triggerKeydown(oElem, Key.END, false, false, true);
			checkFocus(getColumnHeader(0), assert);

			done();
		}

		oTable.attachRowsUpdated(doAfterNoDataDisplayed);
		oTable.setModel(new JSONModel());
	});

	QUnit.module("Navigation > NoData & Overlay", {
		beforeEach: async function() {
			await setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("No Navigation", function(assert) {
		const done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);
			let sId = "noDataCnt";

			while (sId) {
				let oElem = oTable.$(sId);
				oElem.trigger("focus");
				oElem = checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.Arrow.DOWN);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.Arrow.LEFT);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.Arrow.RIGHT);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.Arrow.UP);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.HOME);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.END);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.HOME, false, false, true);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.END, false, false, true);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.Page.UP);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.Page.DOWN);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.Page.UP, false, true);
				checkFocus(oElem, assert);
				qutils.triggerKeydown(oElem, Key.Page.DOWN, false, true);
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
		const done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
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
		const done = assert.async();

		function doAfterNoDataDisplayed() {
			oTable.detachRowsUpdated(doAfterNoDataDisplayed);

			let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
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
		beforeEach: async function() {
			await setupTest();

			oTable.setBusyIndicatorDelay(0);
			oTable.setBusy(true);
			await nextUIUpdate();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Tab", function(assert) {
		let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus1");
		simulateTabEvent(oElem, false);
		// Due to changed BusyIndicator handling - BusyIndicator is now tabbable
		oElem = oTable.getDomRef("busyIndicator");
		checkFocus(oElem, assert);
		simulateTabEvent(oElem, false);
		checkFocus(document.getElementById("Focus2"), assert);
	});

	QUnit.test("Shift+Tab", function(assert) {
		let oElem = TableQUnitUtils.setFocusOutsideOfTable(assert, "Focus2");
		simulateTabEvent(oElem, true);
		// Due to changed BusyIndicator handling - BusyIndicator is now tabbable
		oElem = oTable.getDomRef("busyIndicator");
		checkFocus(oElem, assert);
		simulateTabEvent(oElem, true);
		checkFocus(document.getElementById("Focus1"), assert);
	});

	QUnit.module("Navigation > Special Cases", {
		beforeEach: async function() {
			await setupTest();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Focus on cell content - Home & End & Arrow Keys", function(assert) {
		const oElem = findTabbables(getCell(0, 0).get(0), [getCell(0, 0).get(0)], true);
		oElem.trigger("focus");

		// If the focus is on an element inside the cell,
		// the focus should not be changed when pressing one of the following keys.
		const aKeys = [Key.HOME, Key.END, Key.Arrow.LEFT, Key.Arrow.RIGHT];

		checkFocus(oElem, assert);
		for (let i = 0; i < aKeys.length; i++) {
			qutils.triggerKeydown(oElem, aKeys[i]);
			checkFocus(oElem, assert);
		}
	});

	QUnit.test("Page scrolling", async function(assert) {
		const aEventTargetGetters = [
			getCell.bind(window, 0, 0),
			getCell.bind(window, oTable._getRowCounts().count - 1, 0),
			getCell.bind(window, 2, 1),
			getColumnHeader.bind(window, 0)
		];
		const aKeystrokes = [
			{keyName: "Space (keydown)", trigger: qutils.triggerKeydown, arguments: [null, Key.SPACE]},
			{keyName: "ArrowUp", trigger: qutils.triggerKeydown, arguments: [null, Key.Arrow.UP]},
			{keyName: "ArrowDown", trigger: qutils.triggerKeydown, arguments: [null, Key.Arrow.DOWN]},
			{keyName: "ArrowLeft", trigger: qutils.triggerKeydown, arguments: [null, Key.Arrow.LEFT]},
			{keyName: "ArrowRight", trigger: qutils.triggerKeydown, arguments: [null, Key.Arrow.RIGHT]},
			{keyName: "Home", trigger: qutils.triggerKeydown, arguments: [null, Key.HOME]},
			{keyName: "End", trigger: qutils.triggerKeydown, arguments: [null, Key.END]},
			{keyName: "Ctrl+Home", trigger: qutils.triggerKeydown, arguments: [null, Key.HOME, false, false, true]},
			{keyName: "Ctrl+End", trigger: qutils.triggerKeydown, arguments: [null, Key.END, false, false, true]},
			{keyName: "PageUp", trigger: qutils.triggerKeydown, arguments: [null, Key.Page.UP]},
			{keyName: "PageDown", trigger: qutils.triggerKeydown, arguments: [null, Key.Page.DOWN]}
		];

		assert.expect(aEventTargetGetters.length + aEventTargetGetters.length * aKeystrokes.length + 2);

		oTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(oEvent.isDefaultPrevented(), oEvent.target._oKeystroke.keyName + ": Default action was prevented (Page scrolling)");
			}
		});

		for (let i = 0; i < aEventTargetGetters.length; i++) {
			oTable.setFirstVisibleRow(1);
			await nextUIUpdate();

			const oEventTarget = aEventTargetGetters[i]();
			oEventTarget.trigger("focus");
			checkFocus(oEventTarget, assert);

			for (let j = 0; j < aKeystrokes.length; j++) {
				const oKeystroke = aKeystrokes[j];
				const aArguments = oKeystroke.arguments;

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

		const oTreeIcon = getCell(0, 0, null, null, oTreeTable).find(".sapUiTableTreeIconNodeClosed");
		oTreeIcon.trigger("focus");
		checkFocus(oTreeIcon, assert);
		qutils.triggerKeydown(oTreeIcon, Key.SPACE);
	});

	QUnit.test("After leaving action mode", async function(assert) {
		oTable.setFixedColumnCount(1);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		function test(oInitiallyFocusedCell, oTestedCell, oFinallyFocusedCell, fnKeyPress, sTitle) {
			const bTestedCellIsRowHeader = TableUtils.getCellInfo(oTestedCell).isOfType(TableUtils.CELLTYPE.ROWHEADER);

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
			qutils.triggerKeydown(document.activeElement, Key.F2);

			fnKeyPress();
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), sTitle + " - Table is in navigation mode");
			checkFocus(oFinallyFocusedCell, assert);
		}

		// Row header cell
		test(getCell(2, 2), getRowHeader(1), getRowHeader(0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		}, "Row header cell: ArrowUp");
		test(getCell(2, 2), getRowHeader(1), getRowHeader(2), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		}, "Row header cell: ArrowDown");
		test(getCell(2, 2), getRowHeader(1), getRowHeader(1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT);
		}, "Row header cell: ArrowLeft");
		test(getCell(2, 2), getRowHeader(1), getCell(1, 0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT);
		}, "Row header cell: ArrowRight");

		// Cell in fixed column
		test(getCell(2, 2), getCell(1, 0), getCell(0, 0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		}, "Cell in fixed column: ArrowUp");
		test(getCell(2, 2), getCell(1, 0), getCell(2, 0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		}, "Cell in fixed column: ArrowDown");
		test(getCell(2, 2), getCell(1, 0), getRowHeader(1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT);
		}, "Cell in fixed column: ArrowLeft");
		test(getCell(2, 2), getCell(1, 0), getCell(1, 1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT);
		}, "Cell in fixed column: ArrowRight");

		// Cell in scrollable column
		test(getCell(2, 3), getCell(1, 1), getCell(0, 1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		}, "Cell in scrollable column: ArrowUp");
		test(getCell(2, 3), getCell(1, 1), getCell(2, 1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		}, "Cell in scrollable column: ArrowDown");
		test(getCell(2, 3), getCell(1, 1), getCell(1, 0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT);
		}, "Cell in scrollable column: ArrowLeft");
		test(getCell(2, 3), getCell(1, 1), getCell(1, 2), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT);
		}, "Cell in scrollable column: ArrowRight");

		// Row action cell
		test(getCell(2, 2), getRowAction(1), getRowAction(0), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		}, "Row action cell: ArrowUp");
		test(getCell(2, 2), getRowAction(1), getRowAction(2), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		}, "Row action cell: ArrowDown");
		test(getCell(2, 2), getRowAction(1), getCell(1, oTable.columnCount - 1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT);
		}, "Row action cell: ArrowLeft");
		test(getCell(2, 2), getRowAction(1), getRowAction(1), function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT);
		}, "Row action cell: ArrowRight");
	});

	QUnit.module("Navigation > After changing the DOM structure", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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

	QUnit.test("Add column (focus on data cell)", async function(assert) {
		this.oTable.qunit.getDataCell(1, 1).focus();
		this.oTable.insertColumn(new Column({
			template: new this.TestControl({text: "new"})
		}), 0);
		await this.oTable.qunit.whenRenderingFinished();
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(1, 1), "The cell at the same position is focused");
		qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(1, 0), "ArrowLeft -> The cell to the left is focused");

		this.oTable.qunit.getDataCell(1, 1).focus();
		this.oTable.addColumn(new Column({
			template: new this.TestControl({text: "new"})
		}));
		await this.oTable.qunit.whenRenderingFinished();
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(1, 1), "The cell at the same position is focused");
		qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(1, 2), "ArrowRight -> The cell to the right is focused");
	});

	QUnit.test("Add column (focus on header cell)", async function(assert) {
		this.oTable.qunit.getColumnHeaderCell(1).focus();
		this.oTable.insertColumn(new Column({
			template: new this.TestControl({text: "new"})
		}), 0);
		await this.oTable.qunit.whenRenderingFinished();
		assert.strictEqual(document.activeElement, this.oTable.qunit.getColumnHeaderCell(2), "The same cell is focused");
		qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getColumnHeaderCell(1), "ArrowLeft -> The cell to the left is focused");

		this.oTable.qunit.getColumnHeaderCell(1).focus();
		this.oTable.addColumn(new Column({
			template: new this.TestControl({text: "new"})
		}));
		await this.oTable.qunit.whenRenderingFinished();
		assert.strictEqual(document.activeElement, this.oTable.qunit.getColumnHeaderCell(1), "The same cell is focused");
		qutils.triggerKeydown(document.activeElement, Key.Arrow.RIGHT);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getColumnHeaderCell(2), "ArrowRight -> The cell to the right is focused");
	});

	QUnit.test("Fix first column", async function(assert) {
		this.oTable.qunit.getDataCell(1, 1).focus();
		this.oTable.setFixedColumnCount(1);
		await this.oTable.qunit.whenRenderingFinished();
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(1, 1), "The cell at the same position is focused");
		qutils.triggerKeydown(document.activeElement, Key.Arrow.LEFT);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(1, 0), "ArrowLeft -> The cell to the left is focused");
	});

	QUnit.test("Add row", async function(assert) {
		this.oTable.qunit.getDataCell(2, 1).focus();
		this.oTable.getRowMode().setRowCount(this.oTable.getRowMode().getRowCount() + 1);
		await this.oTable.qunit.whenRenderingFinished();
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(2, 1), "The cell at the same position is focused");
		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(3, 1), "ArrowDown -> The cell below is focused");
	});

	QUnit.test("Fix first row", async function(assert) {
		this.oTable.qunit.getDataCell(1, 1).focus();
		this.oTable.getRowMode().setFixedTopRowCount(1);
		await this.oTable.qunit.whenRenderingFinished();
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(1, 1), "The cell at the same position is focused");
		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(0, 1), "ArrowUp -> The cell above is focused");
	});

	QUnit.test("Resize - Auto row mode", async function(assert) {
		this.oTable.setRowMode(RowModeType.Auto);
		await this.oTable.qunit.whenRenderingFinished();

		this.oTable.qunit.getDataCell(1, 1).focus();
		await this.oTable.qunit.$resize({height: "500px"});
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(1, 1),
			"Height decreased: The data cell at the same position is focused");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(0, 1), "ArrowUp -> The data cell above is focused");

		this.oTable.qunit.getDataCell(1, 1).focus();
		await this.oTable.qunit.resetSize();
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(1, 1),
			"Height increased: The data cell at the same position is focused");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(0, 1), "ArrowUp -> The data cell above is focused");

		this.oTable.qunit.getDataCell(0, 1).focus();
		await this.oTable.qunit.$resize({height: "500px"});
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(0, 1),
			"Height decreased: The data cell at the same position is focused");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getColumnHeaderCell(1), "ArrowUp -> The header cell above is focused");

		this.oTable.qunit.getDataCell(0, 1).focus();
		await this.oTable.qunit.resetSize();
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(0, 1),
			"Height increased: The header cell at the same position is focused");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getColumnHeaderCell(1), "ArrowUp -> The header cell above is focused");

		this.oTable.qunit.getColumnHeaderCell(1).focus();
		await this.oTable.qunit.$resize({height: "500px"});
		assert.strictEqual(document.activeElement, this.oTable.qunit.getColumnHeaderCell(1),
			"Height decreased: The header cell at the same position is focused");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(0, 1), "ArrowDown -> The data cell below is focused");

		this.oTable.qunit.getColumnHeaderCell(1).focus();
		await this.oTable.qunit.resetSize();
		assert.strictEqual(document.activeElement, this.oTable.qunit.getColumnHeaderCell(1),
			"Height increased: The header cell at the same position is focused");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		assert.strictEqual(document.activeElement, this.oTable.qunit.getDataCell(0, 1), "ArrowDown -> The data cell below is focused");
	});

	QUnit.module("Interaction > Shift+Up & Shift+Down (Range Selection)", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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
			assert.equal(this.oTable.isIndexSelected(iIndex), bSelected, `Row #${iIndex + 1}: Selected state`);
		},
		getCellOrRowHeader: function(bRowHeader, iRowIndex, iColumnIndex, bFocus) {
			let oCell;

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
			const iVisibleRowCount = this.oTable._getRowCounts().count;
			const iStartIndex = Math.floor(iNumberOfRows / 2);
			let i;
			const that = this;

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

				/*eslint-disable no-loop-func*/
				return that.oTable.qunit.whenRenderingFinished().then(function() {
					let oElem = that.getCellOrRowHeader(bRowHeader, 0, 0, true);

					oElem.focus();

					let pSequence = Promise.resolve().then(function() {
						that.assertSelection(assert, iStartIndex, bSelect);
						qutils.triggerKeydown(oElem, Key.SHIFT); // Start selection mode.
					});

					// Move up to the first row. All rows above the starting row should get (de)selected.
					for (i = iStartIndex - 1; i >= 0; i--) {
						(function() {
							let iIndex = i;
							const oTarget = oElem;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oTarget, Key.Arrow.UP, true);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								const mRowCounts = that.oTable._getRowCounts();

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
						qutils.triggerKeydown(oElem, Key.Arrow.UP, true);
						that.assertSelection(assert, 0, bSelect);
					});

					// Move down to the starting row. When moving back down the rows always get deselected.
					for (i = 1; i <= iStartIndex; i++) {
						(function() {
							const mRowCounts = that.oTable._getRowCounts();
							let iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true);
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
							const mRowCounts = that.oTable._getRowCounts();
							let iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true);
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
							let iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.UP, true);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								const mRowCounts = that.oTable._getRowCounts();

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
				}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
					let oElem = that.getCellOrRowHeader(bRowHeader, iVisibleRowCount - 1, 0, true);
					let pSequence = Promise.resolve();

					// Move down to the last row. All rows beneath the starting row should get (de)selected.
					for (i = iStartIndex + 1; i < iNumberOfRows; i++) {
						(function() {
							const mRowCounts = that.oTable._getRowCounts();
							let iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true);
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
						qutils.triggerKeyup(oElem, Key.SHIFT); // End selection mode.
					});

					// Move up to the starting row. Selection states should not change because selection mode was canceled.
					for (i = iNumberOfRows - 2; i >= iStartIndex; i--) {
						(function() {
							let iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.UP);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								const mRowCounts = that.oTable._getRowCounts();

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
						qutils.triggerKeydown(oElem, Key.SHIFT); // Start selection mode.
					});

					// Move up to the first row. All rows above the starting row should get (de)selected.
					for (i = iStartIndex - 1; i >= 0; i--) {
						(function() {
							let iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.UP, true);
							}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
								const mRowCounts = that.oTable._getRowCounts();

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
						qutils.triggerKeyup(oElem, Key.SHIFT); // End selection mode.
					});

					// Move down to the starting row. Selection states should not change because selection mode was canceled.
					for (i = 1; i <= iStartIndex; i++) {
						(function() {
							const mRowCounts = that.oTable._getRowCounts();
							let iIndex = i;

							pSequence = pSequence.then(function() {
								qutils.triggerKeydown(oElem, Key.Arrow.DOWN);
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
		const oElem = this.oTable.qunit.getRowHeaderCell(0);

		oElem.focus();
		assert.ok(this.oTable._oRangeSelection === undefined, "Range Selection Mode: Not active");

		// Start selection mode.
		qutils.triggerKeydown(oElem, Key.SHIFT);
		assert.ok(this.oTable._oRangeSelection !== undefined, "Range Selection Mode: Active");

		// End selection mode.
		qutils.triggerKeyup(oElem, Key.SHIFT);
		assert.ok(this.oTable._oRangeSelection === undefined, "Range Selection Mode: Not active");

		// Start selection mode.
		qutils.triggerKeydown(oElem, Key.SHIFT, true);
		assert.ok(this.oTable._oRangeSelection !== undefined, "Range Selection Mode: Active");

		// End selection mode.
		qutils.triggerKeyup(oElem, Key.SHIFT, true);
		assert.ok(this.oTable._oRangeSelection === undefined, "Range Selection Mode: Not active");
	});

	QUnit.test("Default Test Table - Reverse Range Selection", function(assert) {
		return this.testRangeSelection(assert);
	});

	QUnit.test("Fixed Rows - Reverse Range Selection", function(assert) {
		return this.testRangeSelection(assert);
	});

	QUnit.test("Default Test Table - Move between Row Header and Row", async function(assert) {
		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.oTable.setSelectedIndex(0);
		await this.oTable.qunit.whenRenderingFinished();

		let oElem = this.oTable.qunit.getRowHeaderCell(0);

		// Start selection mode.
		oElem.focus();
		qutils.triggerKeydown(oElem, Key.SHIFT);

		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true);
		oElem = this.oTable.qunit.getDataCell(0, 0);
		this.assertSelection(assert, 0, true);
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true);
		oElem = this.oTable.qunit.getDataCell(1, 0);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);
		oElem = this.oTable.qunit.getRowHeaderCell(1);
		this.assertSelection(assert, 1, true);
		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, true);
		oElem = this.oTable.qunit.getRowHeaderCell(2);
		this.assertSelection(assert, 2, true);
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true);
		oElem = this.oTable.qunit.getDataCell(2, 0);
		this.assertSelection(assert, 2, true);
		qutils.triggerKeydown(oElem, Key.Arrow.UP, true);
		oElem = this.oTable.qunit.getDataCell(1, 0);
		this.assertSelection(assert, 2, false);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);
		oElem = this.oTable.qunit.getRowHeaderCell(1);
		this.assertSelection(assert, 2, false);
		qutils.triggerKeydown(oElem, Key.Arrow.UP, true);
		this.assertSelection(assert, 1, false);
	});

	QUnit.module("Interaction > Shift+Left & Shift+Right (Column Resizing)", {
		beforeEach: async function() {
			await setupTest();
			oTable._getVisibleColumns()[2].setResizable(false);
			await nextUIUpdate();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Default Test Table - Resize fixed column", function(assert) {
		const iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		const iColumnResizeStep = TableUtils.convertCSSSizeToPixel("1rem");
		let i;

		const oElem = getColumnHeader(0, true);
		for (i = TableUtils.Column.getColumnWidth(oTable, 0); i - iColumnResizeStep > iMinColumnWidth; i -= iColumnResizeStep) {
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);
			assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), i - iColumnResizeStep,
				"Column width decreased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 0) + "px");
		}

		let iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 0);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), iMinColumnWidth,
			"Column width decreased by " + (iColumnWidthBefore - TableUtils.Column.getColumnWidth(oTable, 0))
			+ "px to the minimum width of " + iMinColumnWidth + "px");
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), iMinColumnWidth,
			"Column width could not be decreased below the minimum of " + iMinColumnWidth + "px");

		for (i = 0; i < 10; i++) {
			iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 0);
			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true);
			assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 0), iColumnWidthBefore + iColumnResizeStep,
				"Column width increased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 0) + "px");
		}
	});

	QUnit.test("Default Test Table - Resize column", function(assert) {
		const iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		const iColumnResizeStep = TableUtils.convertCSSSizeToPixel("1rem");
		let i;

		const oElem = getColumnHeader(1, true);
		for (i = TableUtils.Column.getColumnWidth(oTable, 1); i - iColumnResizeStep > iMinColumnWidth; i -= iColumnResizeStep) {
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);
			assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), i - iColumnResizeStep,
				"Column width decreased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 1) + "px");
		}

		let iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 1);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), iMinColumnWidth,
			"Column width decreased by " + (iColumnWidthBefore - TableUtils.Column.getColumnWidth(oTable, 1))
			+ "px to the minimum width of " + iMinColumnWidth + "px");
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);
		assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), iMinColumnWidth,
			"Column width could not be decreased below the minimum of " + iMinColumnWidth + "px");

		for (i = 0; i < 10; i++) {
			iColumnWidthBefore = TableUtils.Column.getColumnWidth(oTable, 1);
			qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true);
			assert.strictEqual(TableUtils.Column.getColumnWidth(oTable, 1), iColumnWidthBefore + iColumnResizeStep,
				"Column width increased by " + iColumnResizeStep + "px to " + TableUtils.Column.getColumnWidth(oTable, 1) + "px");
		}
	});

	QUnit.test("Multi Header - Resize spans", async function(assert) {
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
		await nextUIUpdate();

		const aVisibleColumns = oTable._getVisibleColumns();
		const iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		const iColumnResizeStep = TableUtils.convertCSSSizeToPixel("1rem");
		let oElem;

		function test(aResizingColumns, aNotResizingColumns) {
			const iSharedColumnResizeStep = Math.round(iColumnResizeStep / aResizingColumns.length);
			let iMaxColumnSize = 0;
			let iNewColumnWidth;
			let i; let j;

			const aOriginalNotResizingColumnWidths = [];
			for (i = 0; i < aNotResizingColumns.length; i++) {
				aOriginalNotResizingColumnWidths.push(TableUtils.Column.getColumnWidth(oTable, aNotResizingColumns[i].getIndex()));
			}

			for (i = 0; i < aResizingColumns.length; i++) {
				iMaxColumnSize = Math.max(iMaxColumnSize, TableUtils.Column.getColumnWidth(oTable, aResizingColumns[i].getIndex()));
			}

			// Decrease the size to the minimum.
			for (i = iMaxColumnSize; i - iSharedColumnResizeStep > iMinColumnWidth; i -= iSharedColumnResizeStep) {
				qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);

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
			qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);

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
				const aOriginalColumnWidths = [];
				for (j = 0; j < aResizingColumns.length; j++) {
					aOriginalColumnWidths.push(TableUtils.Column.getColumnWidth(oTable, aResizingColumns[j].getIndex()));
				}

				qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true);

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
		const iOriginalColumnWidth = TableUtils.Column.getColumnWidth(oTable, 2);

		const oElem = getColumnHeader(2, true);
		qutils.triggerKeydown(oElem, Key.Arrow.LEFT, true);
		assert.strictEqual(iOriginalColumnWidth, TableUtils.Column.getColumnWidth(oTable, 2),
			"Column width did not change (" + iOriginalColumnWidth + "px)");
		qutils.triggerKeydown(oElem, Key.Arrow.RIGHT, true);
		assert.strictEqual(iOriginalColumnWidth, TableUtils.Column.getColumnWidth(oTable, 2),
			"Column width did not change (" + iOriginalColumnWidth + "px)");
	});

	QUnit.module("Interaction > Ctrl+Left & Ctrl+Right (Column Reordering)", {
		beforeEach: async function() {
			await setupTest();
			oTable.setFixedColumnCount(0);
			await nextUIUpdate();
		},
		afterEach: function() {
			teardownTest();
		}
	});

	QUnit.test("Default Test Table - Move columns", function(assert) {
		const oFirstColumn = oTable.getColumns()[0];
		const oLastColumn = oTable.getColumns()[oTable.columnCount - 1];
		let iOldColumnIndex;

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

	QUnit.test("Fixed Columns - Move fixed columns", async function(assert) {
		oTable.setFixedColumnCount(2);
		await nextUIUpdate();

		const oFirstFixedColumn = oTable.getColumns()[0];
		const oLastFixedColumn = oTable.getColumns()[1];
		let iOldColumnIndex;

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

	QUnit.test("Fixed Columns - Move scrollable columns", async function(assert) {
		oTable.setFixedColumnCount(2);
		await nextUIUpdate();

		const oFirstColumn = oTable.getColumns()[2];
		const oLastColumn = oTable.getColumns()[oTable.columnCount - 1];
		let iOldColumnIndex;

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

	QUnit.module("Interaction > Space & Enter", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(9),
				columns: [
					TableQUnitUtils.createTextColumn()
				],
				rowActionTemplate: TableQUnitUtils.createRowAction(null),
				rowActionCount: 1
			});

			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertSelection: function(assert, iIndex, bSelected) {
			assert.equal(this.oTable.isIndexSelected(iIndex), bSelected, "Row " + (iIndex + 1) + ": " + (bSelected ? "" : "Not ") + "Selected");
		}
	});

	QUnit.test("On a Column Header", async function(assert) {
		const oColumnHeaderMenu = new TableQUnitUtils.ColumnHeaderMenu();
		const oColumnHeaderCell = this.oTable.qunit.getColumnHeaderCell(0);
		let oMenuOpen = new Deferred();

		oColumnHeaderMenu.openBy = () => {
			oMenuOpen.resolve();
			oMenuOpen = new Deferred();
		};
		this.oTable.getColumns()[0].setHeaderMenu(oColumnHeaderMenu);

		qutils.triggerKeyup(oColumnHeaderCell, Key.SPACE);
		await oMenuOpen.promise;
		assert.ok(true, "Space: #openBy was called on the header menu instance");

		qutils.triggerKeyup(oColumnHeaderCell, Key.ENTER);
		await oMenuOpen.promise;
		assert.ok(true, "Enter: #openBy was called on the header menu instance");
	});

	QUnit.test("On a Data Cell", function(assert) {
		const oCellClickEventHandler = this.spy();
		const oCell = this.oTable.qunit.getDataCell(0, 0);

		oCell.focus();
		this.oTable.attachCellClick(oCellClickEventHandler);

		qutils.triggerKeyup(oCell, Key.SPACE);
		assert.ok(oCellClickEventHandler.calledOnce, "Space: cellClick event fired once");
		oCellClickEventHandler.resetHistory();
		qutils.triggerKeyup(oCell, Key.SPACE, true);
		assert.ok(oCellClickEventHandler.notCalled, "Shift+Space: cellClick event not fired");
		oCellClickEventHandler.resetHistory();
		qutils.triggerKeydown(oCell, Key.ENTER);
		assert.ok(oCellClickEventHandler.calledOnce, "Enter: cellClick event fired once");

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);

		oCellClickEventHandler.resetHistory();
		qutils.triggerKeyup(oCell, Key.SPACE);
		assert.ok(oCellClickEventHandler.calledOnce, "Space: cellClick event fired once");
		oCellClickEventHandler.resetHistory();
		qutils.triggerKeyup(oCell, Key.SPACE, true);
		assert.ok(oCellClickEventHandler.notCalled, "Shift+Space: cellClick event not fired");
		oCellClickEventHandler.resetHistory();
		qutils.triggerKeydown(oCell, Key.ENTER);
		assert.ok(oCellClickEventHandler.calledOnce, "Enter: cellClick event fired once");
	});

	QUnit.test("On a Row Action Cell", function(assert) {
		const oCellClickEventHandler = this.spy();
		const oCell = this.oTable.qunit.getRowActionCell(0);

		oCell.focus();
		this.oTable.attachCellClick(oCellClickEventHandler);

		qutils.triggerKeyup(oCell, Key.SPACE);
		assert.ok(oCellClickEventHandler.notCalled, "Space: cellClick event not fired");
		oCellClickEventHandler.resetHistory();
		qutils.triggerKeyup(oCell, Key.SPACE, true);
		assert.ok(oCellClickEventHandler.notCalled, "Shift+Space: cellClick event not fired");
		oCellClickEventHandler.resetHistory();
		qutils.triggerKeyup(oCell, Key.ENTER, true);
		assert.ok(oCellClickEventHandler.notCalled, "Enter: cellClick event not fired");
	});

	QUnit.test("On a cell in a group header row", async function(assert) {
		const oCellClickEventHandler = this.spy();
		const oRowToggleExpandedState = this.spy(this.oTable.getRows()[0], "toggleExpandedState");
		const test = (oCell) => {
			oRowToggleExpandedState.resetHistory();
			oCell.focus();
			qutils.triggerKeyup(oCell, Key.SPACE);
			assert.ok(oCellClickEventHandler.notCalled, "Space: cellClick event not fired");
			assert.equal(oRowToggleExpandedState.callCount, 1, "Space: Row#toggleExpandedState called once");

			oRowToggleExpandedState.resetHistory();
			oCell.focus();
			qutils.triggerKeydown(oCell, Key.ENTER);
			assert.ok(oCellClickEventHandler.notCalled, "Enter: cellClick event not fired");
			assert.equal(oRowToggleExpandedState.callCount, 1, "Enter: Row#toggleExpandedState called once");
		};

		this.oTable.attachCellClick(oCellClickEventHandler);
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader, expandable: true}]);

		test(this.oTable.qunit.getRowHeaderCell(0), assert);
		test(this.oTable.qunit.getDataCell(0, 0), assert);
	});

	QUnit.test("On a cell in an empty row", function(assert) {
		const oCellClickEventHandler = this.spy();
		const oCell = this.oTable.qunit.getDataCell(-1, -1);

		oCell.focus();
		this.oTable.attachCellClick(oCellClickEventHandler);

		qutils.triggerKeyup(oCell, Key.SPACE);
		assert.ok(oCellClickEventHandler.calledOnce, "Space: cellClick event fired once");
		oCellClickEventHandler.resetHistory();
		qutils.triggerKeyup(oCell, Key.SPACE, true);
		assert.ok(oCellClickEventHandler.notCalled, "Shift+Space: cellClick event not fired");
		oCellClickEventHandler.resetHistory();
		qutils.triggerKeydown(oCell, Key.ENTER);
		assert.ok(oCellClickEventHandler.calledOnce, "Enter: cellClick event fired once");
	});

	QUnit.test("On a cell in a tree row", async function(assert) {
		const oCellClickEventHandler = this.spy();
		const _testKey = (oTarget, iKeyCode, bExpectToggleExpandedState = true, bExpectCellClickEvent = true) => {
			const sKey = iKeyCode === Key.SPACE ? "Space" : "Enter";
			const oRow = this.oTable.getRows()[TableUtils.getCellInfo(TableUtils.getCell(this.oTable, oTarget)).rowIndex];

			this.spy(oRow, "toggleExpandedState");
			oCellClickEventHandler.resetHistory();

			oTarget.focus();
			qutils.triggerKeydown(oTarget, iKeyCode);
			qutils.triggerKeyup(oTarget, iKeyCode);

			if (bExpectToggleExpandedState) {
				assert.equal(oRow.toggleExpandedState.callCount, 1, `${sKey} - ${oTarget.id}: Row#toggleExpandedState called once`);
				assert.equal(oCellClickEventHandler.callCount, 0, `${sKey} - ${oTarget.id}: cellClick event not fired`);
			} else {
				assert.equal(oRow.toggleExpandedState.callCount, 0, `${sKey} - ${oTarget.id}: Row#toggleExpandedState not called`);

				if (bExpectCellClickEvent) {
					assert.equal(oCellClickEventHandler.callCount, 1, `${sKey} - ${oTarget.id}: cellClick event fired`);
				} else {
					assert.equal(oCellClickEventHandler.callCount, 0, `${sKey} - ${oTarget.id}: cellClick event not fired`);
				}
			}

			oRow.toggleExpandedState.restore();
		};
		const test = (oTarget, bExpectToggleExpandedState = true, bExpectCellClickEvent = true) => {
			_testKey(oTarget, Key.SPACE, bExpectToggleExpandedState, bExpectCellClickEvent);
			_testKey(oTarget, Key.ENTER, bExpectToggleExpandedState, bExpectCellClickEvent);
		};

		this.oTable.qunit.addTextColumn();
		this.oTable.attachCellClick(oCellClickEventHandler);
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		await this.oTable.qunit.setRowStates([{expandable: true}]);

		test(this.oTable.qunit.getDataCell(0, 0));
		test(this.oTable.qunit.getDataCell(0, 0).querySelector(".sapUiTableTreeIcon"));
		test(this.oTable.qunit.getDataCell(0, 1), false);
		test(this.oTable.qunit.getRowHeaderCell(0), false, false);
		test(this.oTable.qunit.getRowActionCell(0), false, false);
	});

	QUnit.test("Focus if expanded tree row turns into leaf", async function(assert) {
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		await this.oTable.qunit.setRowStates([{expandable: true}]);

		this.oTable.qunit.getDataCell(0, 0).querySelector(".sapUiTableTreeIcon").focus();
		await this.oTable.qunit.setRowStates();

		checkFocus(this.oTable.qunit.getDataCell(0, 0), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	});

	QUnit.module("Interaction > Ctrl+A", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(9),
				columns: [
					TableQUnitUtils.createInputColumn()
				],
				rowActionTemplate: TableQUnitUtils.createRowAction(null),
				rowActionCount: 1
			});

			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("On an element where the default should be prevented", function(assert) {
		const test = (oTarget) => {
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.A, false, false, true);
			qutils.triggerKeyup(oTarget, Key.A, false, false, true);
		};

		this.oTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(oEvent.isDefaultPrevented(), "Default is prevented on " + oEvent.target.id);
			}
		});

		assert.expect(5);

		test(this.oTable.qunit.getSelectAllCell());
		test(this.oTable.qunit.getRowHeaderCell(0));
		test(this.oTable.qunit.getDataCell(0, 0));
		test(this.oTable.qunit.getRowActionCell(0));
		test(this.oTable.qunit.getColumnHeaderCell(0));
	});

	QUnit.test("On an element where the default should not be prevented", async function(assert) {
		this.oTable.addExtension(new TestInputControl());
		this.oTable.setFooter(new TestInputControl());
		this.oTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(!oEvent.isDefaultPrevented(), "Default action is not prevented on " + oEvent.target.id);
			}
		});
		await this.oTable.qunit.whenRenderingFinished();

		const oCell = this.oTable.qunit.getDataCell(0, 0);
		oCell.classList.remove("sapUiTableDataCell");
		oCell.classList.add("sapUiTablePseudoCell");

		const aTestElements = [
			this.oTable.getExtension()[0].getDomRef(),
			this.oTable.getFooter().getDomRef(),
			oCell,
			this.oTable.getRows()[0].getCells()[0].getDomRef()
		];

		assert.expect(aTestElements.length);

		aTestElements.forEach(function(oElement) {
			oElement.focus();
			qutils.triggerKeydown(oElement, Key.A, true, false, true);
		});
	});

	QUnit.module("Interaction > Ctrl+Shift+A", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(9),
				columns: [
					TableQUnitUtils.createInputColumn()
				],
				rowActionTemplate: TableQUnitUtils.createRowAction(null),
				rowActionCount: 1
			});

			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("On an element where the default should be prevented", function(assert) {
		const test = (oTarget) => {
			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.A, true, false, true);
			qutils.triggerKeyup(oTarget, Key.A, true, false, true);
		};

		this.oTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(oEvent.isDefaultPrevented(), "Default is prevented on " + oEvent.target.id);
			}
		});

		assert.expect(4);

		test(this.oTable.qunit.getSelectAllCell());
		test(this.oTable.qunit.getRowHeaderCell(0));
		test(this.oTable.qunit.getDataCell(0, 0));
		test(this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("On an element where the default should not be prevented", async function(assert) {
		this.oTable.addExtension(new TestInputControl());
		this.oTable.setFooter(new TestInputControl());
		this.oTable.addEventDelegate({
			onkeydown: function(oEvent) {
				assert.ok(!oEvent.isDefaultPrevented(), "Default action is not prevented on " + oEvent.target.id);
			}
		});
		await this.oTable.qunit.whenRenderingFinished();

		const oCell = this.oTable.qunit.getDataCell(0, 0);
		oCell.classList.remove("sapUiTableDataCell");
		oCell.classList.add("sapUiTablePseudoCell");

		const aTestElements = [
			this.oTable.getExtension()[0].getDomRef(),
			this.oTable.getFooter().getDomRef(),
			oCell,
			this.oTable.getRows()[0].getCells()[0].getDomRef(),
			this.oTable.qunit.getColumnHeaderCell(0)
		];

		assert.expect(aTestElements.length);

		aTestElements.forEach(function(oElement) {
			oElement.focus();
			qutils.triggerKeydown(oElement, Key.A, true, false, true);
		});
	});

	QUnit.module("Interaction > Alt+ArrowUp & Alt+ArrowDown (Expand/Collapse)", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				columns: [TableQUnitUtils.createTextColumn()],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(5),
				rowActionTemplate: TableQUnitUtils.createRowAction(),
				rowActionCount: 1
			});
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		_testKey: function(assert, oTarget, iKeyCode, bExpectExpandCollapse = true) {
			const sKey = iKeyCode === Key.Arrow.DOWN ? "ArrowDown" : "ArrowUp";
			const sMethod = iKeyCode === Key.Arrow.DOWN ? "expand" : "collapse";
			const oRow = this.oTable.getRows()[TableUtils.getCellInfo(TableUtils.getCell(this.oTable, oTarget)).rowIndex];

			this.spy(oRow, sMethod);

			oTarget.focus();
			qutils.triggerKeydown(oTarget, iKeyCode, false, true, false);
			qutils.triggerKeyup(oTarget, iKeyCode, false, true, false);

			if (bExpectExpandCollapse) {
				assert.equal(oRow[sMethod].callCount, 1, `${sKey} - ${oTarget.id}: Row#${sMethod} called once`);
			} else {
				assert.equal(oRow[sMethod].callCount, 0, `${sKey} - ${oTarget.id}: Row#${sMethod} not called`);
			}

			checkFocus(oTarget, assert);

			oRow[sMethod].restore();
		},
		test: function(assert, oTarget, bExpectExpandCollapse = true) {
			this._testKey(assert, oTarget, Key.Arrow.DOWN, bExpectExpandCollapse);
			this._testKey(assert, oTarget, Key.Arrow.UP, bExpectExpandCollapse);
		}
	});

	QUnit.test("Group header row", async function(assert) {
		function test(oCellElement) {
			oCellElement.focus();
			qutils.triggerKeydown(oCellElement, Key.Arrow.DOWN, false, true, false);
			checkFocus(oCellElement, assert);
			qutils.triggerKeydown(oCellElement, Key.Arrow.UP, false, true, false);
			checkFocus(oCellElement, assert);
		}

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader, expandable: true}]);

		this.test(assert, this.oTable.qunit.getRowHeaderCell(0));
		this.test(assert, this.oTable.qunit.getDataCell(0, 0));
		this.test(assert, this.oTable.qunit.getRowActionCell(0));
		test(this.oTable.qunit.getColumnHeaderCell(0));
		test(this.oTable.qunit.getSelectAllCell(0));
	});

	QUnit.test("Tree row", async function(assert) {
		this.oTable.qunit.addTextColumn();
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		await this.oTable.qunit.setRowStates([{expandable: true}]);

		this.test(assert, this.oTable.qunit.getDataCell(0, 0));
		this.test(assert, this.oTable.qunit.getDataCell(0, 0).querySelector(".sapUiTableTreeIcon"));
		this.test(assert, this.oTable.qunit.getDataCell(0, 1), false);
		this.test(assert, this.oTable.qunit.getRowHeaderCell(0), false);
		this.test(assert, this.oTable.qunit.getRowActionCell(0), false);
	});

	QUnit.module("Interaction > F4 (Expand/Collapse)", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				columns: [TableQUnitUtils.createTextColumn()],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(5),
				rowActionTemplate: TableQUnitUtils.createRowAction(),
				rowActionCount: 1
			});
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		test: function(assert, oTarget, bExpectToggleExpandedState = true) {
			const oRow = this.oTable.getRows()[TableUtils.getCellInfo(TableUtils.getCell(this.oTable, oTarget)).rowIndex];

			this.spy(oRow, "toggleExpandedState");

			oTarget.focus();
			qutils.triggerKeydown(oTarget, Key.F4);
			qutils.triggerKeyup(oTarget, Key.F4);

			if (bExpectToggleExpandedState) {
				assert.equal(oRow.toggleExpandedState.callCount, 1, `${oTarget.id}: Row#toggleExpandedState called once`);
			} else {
				assert.equal(oRow.toggleExpandedState.callCount, 0, `${oTarget.id}: Row#toggleExpandedState not called`);
			}

			oRow.toggleExpandedState.restore();
		}
	});

	QUnit.test("Group header row", async function(assert) {
		function test(oCellElement) {
			oCellElement.focus();
			qutils.triggerKeydown(oCellElement, Key.F4);
			checkFocus(oCellElement, assert);
		}

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader, expandable: true}]);

		this.test(assert, this.oTable.qunit.getRowHeaderCell(0));
		this.test(assert, this.oTable.qunit.getDataCell(0, 0));
		this.test(assert, this.oTable.qunit.getRowActionCell(0));
		test(this.oTable.qunit.getColumnHeaderCell(0));
		test(this.oTable.qunit.getSelectAllCell(0));
	});

	QUnit.test("Tree row", async function(assert) {
		this.oTable.qunit.addTextColumn();
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		await this.oTable.qunit.setRowStates([{expandable: true}]);

		this.test(assert, this.oTable.qunit.getDataCell(0, 0));
		this.test(assert, this.oTable.qunit.getDataCell(0, 0).querySelector(".sapUiTableTreeIcon"));
		this.test(assert, this.oTable.qunit.getDataCell(0, 1), false);
		this.test(assert, this.oTable.qunit.getRowHeaderCell(0), false);
		this.test(assert, this.oTable.qunit.getRowActionCell(0), false);
	});

	QUnit.module("Interaction > Plus & Minus (Expand/Collapse)", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				columns: [TableQUnitUtils.createTextColumn()],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(5),
				rowActionTemplate: TableQUnitUtils.createRowAction(null),
				rowActionCount: 1
			});
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		_testKey: function(assert, oTarget, iKeyCode, bExpectExpandCollapse = true) {
			const sKey = iKeyCode === Key.PLUS ? "Plus" : "Minus";
			const oRow = this.oTable.getRows()[TableUtils.getCellInfo(TableUtils.getCell(this.oTable, oTarget)).rowIndex];

			this.spy(oRow, "expand");
			this.spy(oRow, "collapse");

			oTarget.focus();
			qutils.triggerKeypress(oTarget, iKeyCode);

			if (bExpectExpandCollapse) {
				assert.equal(oRow.expand.callCount, iKeyCode === Key.PLUS ? 1 : 0, `${sKey} - ${oTarget.id}: Row#expand call`);
				assert.equal(oRow.collapse.callCount, iKeyCode === Key.MINUS ? 1 : 0, `${sKey} - ${oTarget.id}: Row#collapse call`);
			} else {
				assert.equal(oRow.expand.callCount, 0, `${sKey} - ${oTarget.id}: Row#expand not called`);
				assert.equal(oRow.collapse.callCount, 0, `${sKey} - ${oTarget.id}: Row#collapse not called`);
			}

			checkFocus(oTarget, assert);

			oRow.expand.restore();
			oRow.collapse.restore();
		},
		test: function(assert, oTarget, bExpectExpandCollapse = true) {
			this._testKey(assert, oTarget, Key.PLUS, bExpectExpandCollapse);
			this._testKey(assert, oTarget, Key.MINUS, bExpectExpandCollapse);
		}
	});

	QUnit.test("Group header row", async function(assert) {
		function test(oCellElement) {
			oCellElement.focus();
			qutils.triggerKeypress(oCellElement, Key.PLUS);
			checkFocus(oCellElement, assert);
			qutils.triggerKeypress(oCellElement, Key.MINUS);
			checkFocus(oCellElement, assert);
		}

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader, expandable: true}]);

		this.test(assert, this.oTable.qunit.getRowHeaderCell(0));
		this.test(assert, this.oTable.qunit.getDataCell(0, 0));
		this.test(assert, this.oTable.qunit.getRowActionCell(0));
		test(this.oTable.qunit.getColumnHeaderCell(0));
		test(this.oTable.qunit.getSelectAllCell(0));
	});

	QUnit.test("Tree row", async function(assert) {
		this.oTable.qunit.addTextColumn();
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		await this.oTable.qunit.setRowStates([{expandable: true}]);

		this.test(assert, this.oTable.qunit.getDataCell(0, 0));
		this.test(assert, this.oTable.qunit.getDataCell(0, 0).querySelector(".sapUiTableTreeIcon"));
		this.test(assert, this.oTable.qunit.getDataCell(0, 1), false);
		this.test(assert, this.oTable.qunit.getRowHeaderCell(0), false);
		this.test(assert, this.oTable.qunit.getRowActionCell(0), false);
	});

	QUnit.module("Interaction > ContextMenu", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				columns: [
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createInteractiveTextColumn(),
					TableQUnitUtils.createInputColumn().destroyLabel().setLabel(new TestInputControl())
				],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(5),
				rowActionTemplate: TableQUnitUtils.createRowAction(),
				rowActionCount: 1
			});
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("On a cell", function(assert) {
		const oContextMenuEventHandlerSpy = this.spy(this.oTable._getKeyboardExtension()._delegate, "oncontextmenu");
		const oOpenContextMenuSpy = this.spy(TableUtils.Menu, "openContextMenu");
		const aTestElements = [
			this.oTable.qunit.getDataCell(0, 0),
			this.oTable.qunit.getRowHeaderCell(0),
			this.oTable.qunit.getRowActionCell(0),
			this.oTable.qunit.getColumnHeaderCell(0),
			this.oTable.qunit.getSelectAllCell()
		];

		aTestElements.forEach((oElem) => {
			oElem.focus();
			jQuery(oElem).trigger("contextmenu");
			const oContextMenuEventArgument = oContextMenuEventHandlerSpy.args[0][0];

			assert.ok(oOpenContextMenuSpy.calledOnceWithExactly(this.oTable, oContextMenuEventArgument),
				"TableUtils.Menu.openContextMenu was called with the correct arguments");
			checkFocus(oElem, assert);

			oOpenContextMenuSpy.resetHistory();
			oContextMenuEventHandlerSpy.resetHistory();
		});
	});

	QUnit.test("On a pseudo cell", function(assert) {
		const oContextMenuEventHandlerSpy = this.spy(this.oTable._getKeyboardExtension()._delegate, "oncontextmenu");
		let oContextMenuEventArgument;
		const oOpenContextMenuSpy = this.spy(TableUtils.Menu, "openContextMenu");
		let oElem = this.oTable.qunit.getDataCell(0, 0);

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

		oElem = this.oTable.getRows()[0].getCells()[1].getDomRef();
		oElem.focus();
		jQuery(oElem).trigger("contextmenu");
		assert.ok(oOpenContextMenuSpy.notCalled, "TableUtils.Menu.openContextMenu was not called");
		checkFocus(oElem, assert);

		oContextMenuEventArgument = oContextMenuEventHandlerSpy.args[0][0];
		assert.ok(!oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was not prevented");
	});

	QUnit.test("On interactive cell content", function(assert) {
		const oContextMenuEventHandlerSpy = this.spy(this.oTable._getKeyboardExtension()._delegate, "oncontextmenu");
		const oOpenContextMenuSpy = this.spy(TableUtils.Menu, "openContextMenu");
		const aTestElements = [
			this.oTable.getRows()[0].getRowAction().getAggregation("_icons")[0].getDomRef(),
			this.oTable.getRows()[0].getCells()[1].getDomRef(),
			this.oTable.getColumns()[1].getLabel().getDomRef(),
			this.oTable.getRows()[0].getCells()[2].getDomRef(),
			this.oTable.getColumns()[2].getLabel().getDomRef()
		];

		aTestElements.forEach(function(oElem) {
			oElem.focus();
			jQuery(oElem).trigger("contextmenu");
			assert.ok(oOpenContextMenuSpy.notCalled, "TableUtils.Menu.openContextMenu was not called");
			checkFocus(oElem, assert);

			const oContextMenuEventArgument = oContextMenuEventHandlerSpy.args[0][0];
			assert.ok(!oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was not prevented");

			oOpenContextMenuSpy.resetHistory();
			oContextMenuEventHandlerSpy.resetHistory();
		});
	});

	QUnit.test("On non-interactive cell content", function(assert) {
		const oContextMenuEventHandlerSpy = this.spy(this.oTable._getKeyboardExtension()._delegate, "oncontextmenu");
		const oOpenContextMenuSpy = this.spy(TableUtils.Menu, "openContextMenu");
		const aTestElements = [
			this.oTable.getRows()[0].getCells()[0].getDomRef(),
			this.oTable.getColumns()[0].getLabel().getDomRef()
		];

		aTestElements.forEach((oElem) => {
			jQuery(oElem).trigger("contextmenu");
			assert.ok(oOpenContextMenuSpy.notCalled, "TableUtils.Menu.openContextMenu was not called");

			const oContextMenuEventArgument = oContextMenuEventHandlerSpy.args[0][0];
			assert.ok(!oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was not prevented");

			oOpenContextMenuSpy.resetHistory();
			oContextMenuEventHandlerSpy.resetHistory();
		});
	});

	QUnit.module("Action Mode > Enter and Leave", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModel(8),
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				columns: [
					TableQUnitUtils.createTextColumn({
						label: "Focusable & Tabbable",
						text: "A",
						bind: true,
						focusable: true,
						tabbable: true,
						interactiveLabel: true
					}),
					TableQUnitUtils.createTextColumn({
						label: "Focusable & Not Tabbable",
						text: "B",
						bind: true,
						focusable: true
					}),
					TableQUnitUtils.createTextColumn({
						label: "Not Focusable & Not Tabbable",
						text: "C",
						bind: true
					}),
					TableQUnitUtils.createInputColumn({
						label: "Focusable & Tabbable",
						text: "D",
						bind: true,
						tabbable: true
					}),
					TableQUnitUtils.createInputColumn({
						label: "Focusable & Not Tabbable",
						text: "E",
						bind: true
					})
				]
			});

			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		setupGrouping: function() {
			TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
			return this.oTable.qunit.setRowStates([{
				type: Row.prototype.Type.GroupHeader,
				expandable: true
			}]);
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
		testOnHeaderCells: async function(assert, key, sKeyName, bShift, bAlt, bCtrl, bTestLeaveActionMode, fEventTriggerer,
										  bAllowsFocusCellContent = false) {

			const sKeyCombination = (bShift ? "Shift+" : "") + (bAlt ? "Alt+" : "") + (bCtrl ? "Ctrl+" : "") + sKeyName;
			let oElem;

			// Column header cell without interactive elements
			oElem = this.oTable.qunit.getColumnHeaderCell(1);
			oElem.focus();
			checkFocus(oElem, assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
			checkFocus(this.oTable.qunit.getColumnHeaderCell(1), assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			// Column header cell with interactive elements
			oElem = this.oTable.qunit.getColumnHeaderCell(0);
			oElem.focus();
			checkFocus(oElem, assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);

			if (bAllowsFocusCellContent) {
				oElem = TableUtils.getInteractiveElements(oElem)[0];
				assert.strictEqual(document.activeElement, oElem, sKeyCombination + ": First interactive element in the cell is focused");
			} else {
				checkFocus(this.oTable.qunit.getColumnHeaderCell(0), assert);
			}

			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			// Row header cell
			oElem = this.oTable.qunit.getRowHeaderCell(0);
			oElem.focus();
			checkFocus(oElem, assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
			checkFocus(this.oTable.qunit.getRowHeaderCell(0), assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			if (bTestLeaveActionMode) {
				this.oTable._getKeyboardExtension()._actionMode = true;
				this.oTable._getKeyboardExtension().suspendItemNavigation();
				assert.ok(this.oTable._getKeyboardExtension().isInActionMode() && this.oTable._getKeyboardExtension().isItemNavigationSuspended(),
					"Table was programmatically set to Action Mode");
				fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
				checkFocus(this.oTable.qunit.getRowHeaderCell(0), assert);
				assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), sKeyCombination + ": Table is in Navigation Mode");
			}

			// SelectAll cell
			oElem = this.oTable.qunit.getSelectAllCell();
			oElem.focus();
			checkFocus(oElem, assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
			checkFocus(this.oTable.qunit.getSelectAllCell(), assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			// Group header icon cell
			await this.setupGrouping();

			oElem = this.oTable.qunit.getRowHeaderCell(0);
			oElem.focus();
			checkFocus(oElem, assert);
			assert.ok(TableUtils.Grouping.isInGroupHeaderRow(oElem), "Cell to be tested is in a group header row");
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Focus group header icon cell: Table is in Navigation Mode");
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
			checkFocus(this.oTable.qunit.getRowHeaderCell(0), assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), sKeyCombination + ": Table is in Navigation Mode");

			if (bTestLeaveActionMode) {
				this.oTable._getKeyboardExtension()._actionMode = true;
				this.oTable._getKeyboardExtension().suspendItemNavigation();
				assert.ok(this.oTable._getKeyboardExtension().isInActionMode() && this.oTable._getKeyboardExtension().isItemNavigationSuspended(),
					"Table was programmatically set to Action Mode");
				fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
				checkFocus(this.oTable.qunit.getRowHeaderCell(0), assert);
				assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), sKeyCombination + ": Table is in Navigation Mode");
			}
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
			const sKeyCombination = (bShift ? "Shift+" : "") + (bAlt ? "Alt+" : "") + (bCtrl ? "Ctrl+" : "") + sKeyName;
			let oElement;

			// Focus cell with a focusable & tabbable element inside.
			oElement = this.oTable.qunit.getDataCell(0, 3);
			oElement.focus();
			checkFocus(oElement, assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(),
				"Focus cell with a focusable and tabbable input element: Table is in Navigation Mode");

			// Enter action mode.
			fEventTriggerer(oElement, key, bShift, bAlt, bCtrl);
			oElement = TableUtils.getInteractiveElements(oElement)[0];
			assert.strictEqual(document.activeElement, oElement, sKeyCombination + ": First interactive element in the cell is focused");
			assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			assertTextSelection(assert, oElement, true, "The text in the input element is selected");

			// Focus cell with a focusable & non-tabbable element inside.
			this.oTable._getKeyboardExtension().setActionMode(false);
			oElement = this.oTable.qunit.getDataCell(0, 4);
			oElement.focus();
			checkFocus(oElement, assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(),
				"Focus cell with a focusable and non-tabbable input element: Table is in Navigation Mode");

			// Enter action mode.
			fEventTriggerer(oElement, key, bShift, bAlt, bCtrl);
			oElement = TableUtils.getInteractiveElements(oElement)[0];
			assert.strictEqual(document.activeElement, oElement, sKeyCombination + ": First interactive element in the cell is focused");
			assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
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
			const sKeyCombination = (bShift ? "Shift+" : "") + (bAlt ? "Alt+" : "") + (bCtrl ? "Ctrl+" : "") + sKeyName;

			// Focus cell with a non-focusable & non-tabbable element inside.
			const oElem = this.oTable.qunit.getDataCell(0, 2);
			oElem.focus();
			checkFocus(oElem, assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(),
				"Focus cell with a non-focusable and non-tabbable element: Table is in Navigation Mode");

			// Stay in navigation mode.
			fEventTriggerer(oElem, key, bShift, bAlt, bCtrl);
			assert.strictEqual(document.activeElement, oElem, sKeyCombination + ": Cell is focused");
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		}
	});

	QUnit.test("Focus", async function(assert) {
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Enter Action Mode: Focus a tabbable text control inside a data cell.
		let oElement = TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(0, 0))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Text element in the cell is focused");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus a data cell.
		this.oTable.qunit.getDataCell(0, 0).focus();
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Enter Action Mode: Focus tabbable input control inside a data cell.
		oElement = TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(0, 3))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Tabbable input element in the cell is focused");
		assertTextSelection(assert, oElement, false, "The text in the input element is not selected");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus a non-interactive element inside a data cell.
		oElement = this.oTable.getRows()[0].getCells()[1].getDomRef();
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Non-interactive element in the cell is focused");
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Enter Action Mode: Focus a non-tabbable input control inside a data cell.
		oElement = this.oTable.qunit.getDataCell(0, 4).querySelector("input");
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Non-Tabbable input element in the cell is focused");
		assertTextSelection(assert, oElement, false, "The text in the input element is not selected");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Stay in Action Mode: Focus a row selector cell.
		this.oTable.qunit.getRowHeaderCell(0).focus();
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Focus row selector cell: Table is in Action Mode");

		// Stay in Action Mode: Focus a group header icon cell.
		await this.setupGrouping();

		oElement = this.oTable.qunit.getRowHeaderCell(0);
		oElement.focus();
		assert.ok(TableUtils.Grouping.isInGroupHeaderRow(oElement), "Cell to be tested is in a group header row");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Focus group header icon cell: Table is in Action Mode");

		// Enter Navigation Mode: Focus the SelectAll cell.
		this.oTable.qunit.getSelectAllCell().focus();
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Focus SelectAll cell: Table is in Navigation Mode");

		// Remove row selectors.
		this.oTable.setSelectionMode(library.SelectionMode.None);
		await this.oTable.qunit.whenRenderingFinished();

		// Enter Action Mode: Focus tabbable input control inside a data cell.
		oElement = TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(1, 3))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Tabbable input element in the cell is focused");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus a row header cell which is no group header icon cell or row selector cell.
		this.oTable.qunit.getRowHeaderCell(1).focus();
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(),
			"Focus row header cell which is no group header icon cell or row selector cell: Table is in Navigation Mode");

		// Enter Action Mode: Focus tabbable input control inside a data cell.
		oElement = TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(1, 3))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Tabbable input element in the cell is focused");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus an interactive element inside a column header cell.
		TableUtils.getInteractiveElements(this.oTable.qunit.getColumnHeaderCell(0))[0].focus();
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(),
			"Interactive element in the column header cell is focused: Table is in Navigation Mode");
	});

	QUnit.test("F2 - On Column/Row/GroupIcon/SelectAll Header Cells", function(assert) {
		return this.testOnHeaderCells(assert, Key.F2, "F2", false, false, false, true, qutils.triggerKeydown, true);
	});

	QUnit.test("F2 - On a Data Cell", function(assert) {
		let oElement = this.testOnDataCellWithInteractiveControls(assert, Key.F2, "F2", false, false, false, qutils.triggerKeydown);

		// Leave action mode.
		qutils.triggerKeydown(oElement, Key.F2);
		checkFocus(this.oTable.qunit.getDataCell(0, 4), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		this.testOnDataCellWithoutInteractiveControls(assert, Key.F2, "F2", false, false, false, qutils.triggerKeydown);

		// Enter Action Mode: Focus tabbable input control inside a data cell.
		oElement = TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(0, this.oTable.getColumns().length - 2))[0];
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Interactive element in a cell is focused");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Enter Navigation Mode: Focus a non-interactive element inside a data cell.
		oElement = this.oTable.getRows()[0].getCells()[1].getDomRef();
		oElement.focus();
		assert.strictEqual(document.activeElement, oElement, "Non-interactive element in a cell is focused");
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Focus the cell.
		qutils.triggerKeydown(oElement, Key.F2);
		checkFocus(this.oTable.qunit.getDataCell(0, 1), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	});

	QUnit.test("F2 - On a Row Action Cell", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		this.oTable.setRowActionCount(2);
		await this.oTable.qunit.whenRenderingFinished();

		// Focus cell with a focusable & tabbable element inside.
		let oElem = this.oTable.qunit.getRowActionCell(0);
		oElem.focus();
		checkFocus(oElem, assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Focus row action cell with content: Table is in Navigation Mode");

		// Enter action mode.
		qutils.triggerKeydown(oElem, Key.F2);
		oElem = TableUtils.getInteractiveElements(oElem)[0];
		assert.strictEqual(document.activeElement, oElem, "F2: First interactive element in the row action cell is focused");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		// Leave action mode.
		qutils.triggerKeydown(oElem, Key.F2);
		checkFocus(this.oTable.qunit.getRowActionCell(0), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// No content in row action cell
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		await this.oTable.qunit.whenRenderingFinished();
		oElem = this.oTable.qunit.getRowActionCell(0);
		oElem.focus();
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, Key.F2);
		checkFocus(this.oTable.qunit.getRowActionCell(0), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	});

	QUnit.test("Alt+ArrowUp & Alt+ArrowDown - On Column/Row/GroupIcon/SelectAll Header Cells", async function(assert) {
		await this.testOnHeaderCells(assert, Key.Arrow.UP, "Arrow Up", false, true, false, false, qutils.triggerKeydown);
		await this.testOnHeaderCells(assert, Key.Arrow.DOWN, "Arrow Down", false, true, false, false, qutils.triggerKeydown);
	});

	QUnit.test("Alt+ArrowUp & Alt+ArrowDown - On a Data Cell", function(assert) {
		this.testOnDataCellWithInteractiveControls(assert, Key.Arrow.UP, "Arrow Up", false, true, false, qutils.triggerKeydown);
		this.oTable._getKeyboardExtension().setActionMode(false);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		this.testOnDataCellWithoutInteractiveControls(assert, Key.Arrow.DOWN, "Arrow Down", false, true, false, qutils.triggerKeydown);

		this.testOnDataCellWithInteractiveControls(assert, Key.Arrow.UP, "Arrow Up", false, true, false, qutils.triggerKeydown);
		this.oTable._getKeyboardExtension().setActionMode(false);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		this.testOnDataCellWithoutInteractiveControls(assert, Key.Arrow.DOWN, "Arrow Down", true, false, false, qutils.triggerKeydown);
	});

	QUnit.test("F4 - On Column/Row/GroupIcon/SelectAll Header Cells", async function(assert) {
		await this.testOnHeaderCells(assert, Key.F4, "F4", false, false, false, false, qutils.triggerKeydown);
		await this.testOnHeaderCells(assert, Key.F4, "F4", false, false, false, false, qutils.triggerKeydown);
	});

	QUnit.test("F4 - On a Data Cell", function(assert) {
		this.testOnDataCellWithInteractiveControls(assert, Key.F4, "F4", false, false, false, qutils.triggerKeydown);
		this.oTable._getKeyboardExtension().setActionMode(false);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		this.testOnDataCellWithoutInteractiveControls(assert, Key.F4, "F4", false, false, false, qutils.triggerKeydown);

		this.testOnDataCellWithInteractiveControls(assert, Key.F4, "F4", false, false, false, qutils.triggerKeydown);
		this.oTable._getKeyboardExtension().setActionMode(false);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		this.testOnDataCellWithoutInteractiveControls(assert, Key.F4, "F4", false, false, false, qutils.triggerKeydown);
	});

	QUnit.test("Plus & Minus - On Column/Row/SelectAll Header Cells", async function(assert) {
		await this.testOnHeaderCells(assert, Key.PLUS, "Plus", false, false, false, false, qutils.triggerKeypress);
		await this.testOnHeaderCells(assert, Key.MINUS, "Minus", false, false, false, false, qutils.triggerKeypress);
	});

	QUnit.test("Plus & Minus - On a Data Cell", function(assert) {
		this.testOnDataCellWithInteractiveControls(assert, Key.PLUS, "Plus", false, false, false, qutils.triggerKeypress);
		this.oTable._getKeyboardExtension().setActionMode(false);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		this.testOnDataCellWithoutInteractiveControls(assert, Key.MINUS, "Minus", false, false, false, qutils.triggerKeypress);

		this.testOnDataCellWithInteractiveControls(assert, Key.PLUS, "Plus", false, false, false, qutils.triggerKeypress);
		this.oTable._getKeyboardExtension().setActionMode(false);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		this.testOnDataCellWithoutInteractiveControls(assert, Key.MINUS, "Minus", false, false, false, qutils.triggerKeypress);
	});

	QUnit.test("Space & Enter - On a Data Cell - Row selection not possible and no click handler", function(assert) {
		/* Test on a data cell with an interactive control inside */

		let oElem = this.oTable.qunit.getDataCell(0, 0);
		oElem.focus();
		checkFocus(oElem, assert);
		const oInteractiveElement = TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(0, 0))[0];

		// Space
		assert.equal(this.oTable.isIndexSelected(0), false, "Row 1: Not Selected");
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		qutils.triggerKeyup(oElem, Key.SPACE);
		assert.equal(this.oTable.isIndexSelected(0), false, "Space: Row 1: Not Selected");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assert.strictEqual(document.activeElement, oInteractiveElement, "First interactive element in the cell is focused");
		this.oTable._getKeyboardExtension().setActionMode(false);

		oElem = this.oTable.qunit.getDataCell(0, 0);
		oElem.focus();
		checkFocus(oElem, assert);

		// Enter
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		qutils.triggerKeydown(oElem, Key.ENTER);
		assert.equal(this.oTable.isIndexSelected(0), false, "Enter: Row 1: Not Selected");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assert.strictEqual(document.activeElement, oInteractiveElement, "First interactive element in the cell is focused");
		this.oTable._getKeyboardExtension().setActionMode(false);

		/* Test on a data cell without an interactive control inside */

		oElem = this.oTable.qunit.getDataCell(0, 1);
		oElem.focus();
		checkFocus(oElem, assert);

		// Space
		assert.equal(this.oTable.isIndexSelected(0), false, "Row 1: Not Selected");
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		qutils.triggerKeyup(oElem, Key.SPACE);
		assert.equal(this.oTable.isIndexSelected(0), false, "Space: Row 1: Not Selected");
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		checkFocus(oElem, assert);

		oElem = this.oTable.qunit.getDataCell(0, 1);
		oElem.focus();
		checkFocus(oElem, assert);

		// Enter
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		qutils.triggerKeydown(oElem, Key.ENTER);
		assert.equal(this.oTable.isIndexSelected(0), false, "Enter: Row 1: Not Selected");
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		checkFocus(oElem, assert);
	});

	QUnit.test("Space & Enter - On a Row Action Cell - Row selection not possible and no click handler", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		this.oTable.setRowActionCount(2);
		await this.oTable.qunit.whenRenderingFinished();

		/* Enter key */

		// Focus cell with a focusable & tabbable element inside.
		let oElem = this.oTable.qunit.getRowActionCell(0);
		oElem.focus();
		checkFocus(oElem, assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Focus row action cell with content: Table is in Navigation Mode");
		// Enter action mode.
		qutils.triggerKeydown(oElem, Key.ENTER);
		oElem = TableUtils.getInteractiveElements(oElem)[0];
		assert.strictEqual(document.activeElement, oElem, "Enter: First interactive element in the row action cell is focused");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assert.equal(this.oTable.isIndexSelected(0), false, "Row 1: Not Selected");

		// Leave action mode.
		this.oTable._getKeyboardExtension().setActionMode(false);

		/* Space key */

		// Focus cell with a focusable & tabbable element inside.
		oElem = this.oTable.qunit.getRowActionCell(0);
		oElem.focus();
		checkFocus(oElem, assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Focus row action cell with content: Table is in Navigation Mode");
		// Enter action mode.
		qutils.triggerKeyup(oElem, Key.SPACE);
		oElem = TableUtils.getInteractiveElements(oElem)[0];
		assert.strictEqual(document.activeElement, oElem, "SPACE: First interactive element in the row action cell is focused");
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assert.equal(this.oTable.isIndexSelected(0), false, "Row 1: Not Selected");

		// Leave action mode.
		this.oTable._getKeyboardExtension().setActionMode(false);

		// No content in row action cell
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		await this.oTable.qunit.whenRenderingFinished();
		oElem = this.oTable.qunit.getRowActionCell(0);
		oElem.focus();
		checkFocus(oElem, assert);
		qutils.triggerKeydown(oElem, Key.ENTER);
		checkFocus(this.oTable.qunit.getRowActionCell(0), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assert.equal(this.oTable.isIndexSelected(0), false, "Row 1: Not Selected");
		qutils.triggerKeyup(oElem, Key.SPACE);
		checkFocus(this.oTable.qunit.getRowActionCell(0), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assert.equal(this.oTable.isIndexSelected(0), false, "Row 1: Not Selected");
	});

	QUnit.module("Action Mode > Navigation when some inputs are disabled", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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
		const oTable = this.oTable;

		return new Promise(function(resolve) {
			let oElem = oTable.getRows()[0].getCells()[1].getDomRef();

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
		const oTable = this.oTable;

		oTable.setSelectionMode("None");

		return oTable.qunit.whenRenderingFinished().then(function() {
			return new Promise(function(resolve) {
				let oElem = oTable.getRows()[0].getCells()[1].getDomRef();

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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModel(8),
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				columns: [
					TableQUnitUtils.createTextColumn({
						label: "Focusable & Tabbable",
						text: "A",
						bind: true,
						focusable: true,
						tabbable: true
					}),
					TableQUnitUtils.createTextColumn({
						label: "Focusable & Not Tabbable",
						text: "B",
						bind: true,
						focusable: true
					}),
					TableQUnitUtils.createTextColumn({
						label: "Not Focusable & Not Tabbable",
						text: "C",
						bind: true
					}),
					TableQUnitUtils.createInputColumn({
						label: "Focusable & Tabbable",
						text: "D",
						bind: true,
						tabbable: true
					}),
					TableQUnitUtils.createInputColumn({
						label: "Focusable & Not Tabbable",
						text: "E",
						bind: true
					})
				]
			});

			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		setupGrouping: function() {
			const mGroupHeaderState = {
				type: Row.prototype.Type.GroupHeader,
				expandable: true,
				expanded: true,
				contentHidden: true
			};
			const aRowStates = [
				mGroupHeaderState,
				undefined,
				mGroupHeaderState,
				mGroupHeaderState,
				undefined,
				mGroupHeaderState
			];

			TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
			this.oTable.qunit.setRowStates(aRowStates);
		},
		simulateTabEvent: function(bBackward, bTriggersScrolling) {
			simulateTabEvent(document.activeElement, bBackward);

			if (bTriggersScrolling) {
				return this.oTable.qunit.whenNextRenderingFinished();
			} else {
				return this.oTable.qunit.whenRenderingFinished();
			}
		},
		/**
		 * Navigates through the whole table, from the first to the last cell including scrolling, using TAB while in action mode.
		 * Navigates back using Shift+TAB.
		 *
		 * @param {Object} assert QUnit assert object.
		 * @param {boolean} [bShowInfo=false] If <code>true</code>, additional information will be printed in the QUnit output.
		 * @private
		 */
		testActionModeTabNavigation: async function(assert, bShowInfo = false) {
			const mRowCounts = this.oTable._getRowCounts();
			const iVisibleRowCount = mRowCounts.count;
			const iFixedRowCount = mRowCounts.fixedTop;
			const iFixedBottomRowCount = mRowCounts.fixedBottom;
			const bTableHasRowSelectors = TableUtils.isRowSelectorSelectionAllowed(this.oTable);
			const bTableIsInGroupMode = TableUtils.Grouping.isInGroupMode(this.oTable);
			const bTableHasRowHeader = bTableHasRowSelectors || bTableIsInGroupMode;
			const bTableHasRowActions = TableUtils.hasRowActions(this.oTable);
			const oKeyboardExtension = this.oTable._getKeyboardExtension();
			const iActionItemCount = bTableHasRowActions ? this.oTable.getRowActionTemplate()._getVisibleItems().length : 0;
			const iColumnCount = this.oTable._getVisibleColumns().length;
			const iLastColumnIndex = iColumnCount + Math.max(0, iActionItemCount - 1); // Action items are treated as columns in this test.
			const iRowCount = this.oTable._getTotalRowCount();
			let oElem; let i; let j;

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
			 * Row  2: [ ]
			 * Row  3: [G]
			 * Row  4: [G]
			 * Row  5: [ ]
			 * Row  6: [G]
			 * Row  7: [ ]
			 * Row  8: [ ]
			 */

			if (bTableHasRowHeader) {
				// Focus the first row header cell and enter the action mode programmatically.
				this.oTable.qunit.getRowHeaderCell(0).focus();
				oKeyboardExtension._actionMode = true;
				assert.ok(oKeyboardExtension.isInActionMode(), "Action mode entered programmatically: Table is in Action Mode");
			} else {
				this.oTable.qunit.getDataCell(0, 0).focus();
				oKeyboardExtension.setActionMode(true);
			}

			// Tab to the last interactive control of the table. Then tab again to leave the action mode.
			for (i = 0; i < iRowCount; i++) {
				for (j = -1; j <= iLastColumnIndex; j++) {
					const iAbsoluteRowIndex = i;
					const iColumnIndex = j;
					let iRowIndex = i;

					if (iRowIndex >= iVisibleRowCount - iFixedBottomRowCount && iRowIndex < iRowCount - iFixedBottomRowCount) {
						iRowIndex = iVisibleRowCount - iFixedBottomRowCount - 1;
					} else if (iRowIndex >= iRowCount - iFixedBottomRowCount) {
						iRowIndex = iRowIndex - (iRowCount - iVisibleRowCount);
					}

					let oCell;
					let $InteractiveElements;
					const bIsLastElementInRow = iColumnIndex === iLastColumnIndex;

					if (iColumnIndex === -1) { // Row Header Cell
						if (bTableHasRowHeader) {
							oElem = this.oTable.qunit.getRowHeaderCell(iRowIndex);

							if (TableUtils.Grouping.isInGroupHeaderRow(oElem)) {
								assert.strictEqual(document.activeElement, oElem,
									"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
									+ "): Header Cell: Group Header Icon focused");
								continue; // The TAB event will be simulated after the iteration over the columns has reached the end.

							} else if (bTableHasRowSelectors) {
								assert.strictEqual(document.activeElement, oElem,
									"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
									+ "): Header Cell: Row Selector focused");

							} else {
								if (bShowInfo) {
									assert.ok(true,
										"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
										+ "): Header Cell: Skipped, is an empty row header (Grouping without Row Selectors)");
								}
								continue;
							}
						} else {
							if (bShowInfo) {
								assert.ok(true,
									"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
									+ "): Header Cell: Skipped, table has no row header");
							}
							continue;
						}

					} else if (iColumnIndex < iColumnCount) { // Data Cell
						oCell = this.oTable.qunit.getDataCell(iRowIndex, iColumnIndex);
						$InteractiveElements = TableUtils.getInteractiveElements(oCell);

						if ($InteractiveElements === null) {
							if (bShowInfo) {
								assert.ok(true,
									"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
									+ "): Cell " + (iColumnIndex + 1) + ": Skipped, no interactive elements");
							}
							continue;
						} else {
							oElem = $InteractiveElements[0];
							assert.strictEqual(document.activeElement, oElem,
								"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
								+ "): Cell " + (iColumnIndex + 1) + ": Interactive element focused");
							_assertTextSelection(document.activeElement);

							if (iColumnIndex === iColumnCount - 1 && iActionItemCount === 0) {
								continue; // If there are no row action items, the TAB event will be simulated after the iteration over the
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
							continue;
						}
					} else {
						oCell = this.oTable.qunit.getRowActionCell(iRowIndex);
						$InteractiveElements = TableUtils.getInteractiveElements(oCell);

						if ($InteractiveElements === null) {
							if (bShowInfo) {
								assert.ok(
									true,
									"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
									+ "): Row Action Cell: Skipped, no interactive elements"
								);
							}

							if (!bIsLastElementInRow) {
								continue;
							}
						} else {
							const iActionItemIndex = iColumnIndex - iColumnCount;
							const oActionItem = $InteractiveElements[iActionItemIndex];

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
									continue;
								}
							}
						}
					}

					const oRow = this.oTable.getRows()[iRowIndex];
					const bScrolled = bIsLastElementInRow
						&& TableUtils.isLastScrollableRow(this.oTable, TableUtils.getCell(this.oTable, oElem))
						&& oRow.getIndex() + iFixedBottomRowCount !== iRowCount - 1;

					if (bShowInfo) {
						assert.ok(true, "[INFO] Simulating TAB event on: " + document.activeElement.id);
						assert.ok(true, "[INFO] Scrolling will be performed: " + bScrolled);
					}

					await this.simulateTabEvent(false, bScrolled);

					if (iAbsoluteRowIndex === iRowCount - 1 && bIsLastElementInRow) {
						const oRowActionElementCell = this.oTable.qunit.getRowActionCell(iVisibleRowCount - 1);

						if (bTableHasRowActions && TableUtils.getInteractiveElements(oRowActionElementCell) !== null) {
							checkFocus(oRowActionElementCell, assert);
						} else {
							checkFocus(this.oTable.qunit.getDataCell(iVisibleRowCount - 1, iColumnCount - 1), assert);
						}

						assert.ok(!oKeyboardExtension.isInActionMode(), "Table is in Navigation Mode");
					} else {
						assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");
					}
				}
			}

			oElem = TableUtils.getInteractiveElements(document.activeElement)[0];
			oKeyboardExtension.setActionMode(true);
			assert.strictEqual(document.activeElement, oElem,
				"The action mode was entered on the last cell of the last row - The cells first interactive element is focused");
			assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");

			// Focus the last interactive element in the last cell in the last row.
			const aRows = this.oTable.getRows();
			const oLastRow = aRows[aRows.length - 1];

			oElem = KeyboardDelegate._getLastInteractiveElement(oLastRow)[0];
			oElem.focus();

			assert.strictEqual(document.activeElement, oElem, "The very last interactive element in the table is focused");
			assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");

			// Tab back to the first interactive control of the table. Then tab back again to leave the action mode.
			for (i = iRowCount - 1; i >= 0; i--) {
				for (j = iLastColumnIndex; j >= -1; j--) {
					const iAbsoluteRowIndex = i;
					const iColumnIndex = j;
					let iRowIndex = i;

					if (iRowIndex >= iFixedRowCount && iRowIndex < iRowCount - iVisibleRowCount + iFixedRowCount + 1) {
						iRowIndex = iFixedRowCount;
					} else if (iRowIndex >= iRowCount - iVisibleRowCount + iFixedRowCount + 1) {
						iRowIndex = iRowIndex - (iRowCount - iVisibleRowCount);
					}

					let $Cell;
					let $InteractiveElements;

					if (iColumnIndex >= iColumnCount) { // Row Action Cell
						if (!bTableHasRowActions) {
							if (bShowInfo) {
								assert.ok(true,
									"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
									+ "): Row Action Cell: Skipped, table has no row actions");
							}
							continue;
						} else {
							$Cell = this.oTable.qunit.getRowActionCell(iRowIndex);
							$InteractiveElements = TableUtils.getInteractiveElements($Cell);

							if ($InteractiveElements === null) {
								if (bShowInfo) {
									assert.ok(true,
										"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
										+ "): Row Action Cell: Skipped, no interactive elements");
								}
								continue;
							} else {
								const iActionItemIndex = iColumnIndex - iColumnCount;
								const oActionItem = $InteractiveElements[iActionItemIndex];

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
									continue;
								}
							}
						}

					} else if (iColumnIndex >= 0) { // Data Cell
						$Cell = this.oTable.qunit.getDataCell(iRowIndex, iColumnIndex);
						$InteractiveElements = TableUtils.getInteractiveElements($Cell);

						if ($InteractiveElements === null) {
							if (bShowInfo) {
								assert.ok(true,
									"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
									+ "): Cell " + (iColumnIndex + 1) + ": Skipped, no interactive elements");
							}
							continue;
						}

						oElem = $InteractiveElements[0];
						assert.strictEqual(document.activeElement, oElem,
							"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
							+ "): Cell " + (iColumnIndex + 1) + ": Interactive element focused");
						_assertTextSelection(document.activeElement);

						const bIsFirstInteractiveElementInRow =
							KeyboardDelegate._getFirstInteractiveElement(this.oTable.getRows()[iRowIndex])[0] === oElem;
						const bRowHasInteractiveRowHeader =
							bTableHasRowSelectors || TableUtils.Grouping.isInGroupHeaderRow(TableUtils.getCell(this.oTable, oElem));

						if (bIsFirstInteractiveElementInRow && iColumnIndex > 0 && !bRowHasInteractiveRowHeader) {
							continue;
						}

					} else if (bTableHasRowHeader) { // Row Header Cell
						oElem = this.oTable.qunit.getRowHeaderCell(iRowIndex);

						if (TableUtils.Grouping.isInGroupHeaderRow(oElem)) {
							assert.strictEqual(document.activeElement, oElem,
								"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
								+ "): Header Cell: Group Header Icon focused"
							);

						} else if (bTableHasRowSelectors) {
							assert.strictEqual(document.activeElement, oElem,
								"Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
								+ "): Header Cell: Row Selector focused"
							);

						} else {
							if (bShowInfo) {
								assert.ok(
									true,
									"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
									+ "): Header Cell: Skipped, is an empty row header (Grouping without Row Selectors)"
								);
							}
							continue;
						}
					} else {
						if (bShowInfo) {
							assert.ok(
								true,
								"[INFO] Row " + (iRowIndex + 1) + " (Absolute: " + (iAbsoluteRowIndex + 1)
								+ "): Header Cell: Skipped, table has no row header"
							);
						}
						continue;
					}

					const bIsFirstScrollableRow = TableUtils.isFirstScrollableRow(this.oTable, TableUtils.getCell(this.oTable, oElem));
					const oRow = this.oTable.getRows()[iRowIndex];
					const bScrolled = iColumnIndex === (oRow.isGroupHeader() || bTableHasRowSelectors ? -1 : 0)
						&& bIsFirstScrollableRow
						&& oRow.getIndex() - iFixedRowCount !== 0;

					if (bShowInfo) {
						assert.ok(true, "[INFO] Simulating Shift+TAB event on: " + document.activeElement.id);
						assert.ok(true, "[INFO] Scrolling will be performed: " + bScrolled);
					}

					await this.simulateTabEvent(true, bScrolled);

					if (iAbsoluteRowIndex === 0 && iColumnIndex === (bTableHasRowHeader ? -1 : 0)) {
						if (bTableHasRowHeader) {
							checkFocus(this.oTable.qunit.getRowHeaderCell(0), assert);
						} else {
							checkFocus(this.oTable.qunit.getDataCell(0, 0), assert);
						}
						assert.ok(!oKeyboardExtension.isInActionMode(), "Table is in Navigation Mode");
					} else {
						assert.ok(oKeyboardExtension.isInActionMode(), "Table is in Action Mode");
					}

					if (bScrolled) {
						break;
					}
				}
			}
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
			let oElement;

			switch (iColumnIndex) {
				case -1:
					// Row headers are themselves interactive elements.
					return this.oTable.qunit.getRowHeaderCell(iRowIndex);
				case -2:
					oElement = this.oTable.qunit.getRowActionCell(iRowIndex);
					break;
				default:
					oElement = this.oTable.qunit.getDataCell(iRowIndex, iColumnIndex);
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
		testActionModeUpDownNavigation: async function(assert, iColumnIndex, bCtrlKey) {
			let oElem;
			const iVisibleRowCount = this.oTable._getRowCounts().count;
			const iTotalRowCount = this.oTable._getTotalRowCount();

			oElem = this.getElement(0, iColumnIndex);
			oElem.focus();
			checkFocus(oElem, assert);

			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, true); // Use Ctrl to enter the action mode.
			oElem = checkFocus(this.getElement(1, iColumnIndex, true), assert);

			if (iColumnIndex === -1) {
				// In case of row header cells enter the action mode manually.
				this.oTable._getKeyboardExtension()._actionMode = true;
			}

			assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

			// Navigate down to the last visible row.
			for (let i = 2; i < iVisibleRowCount; i++) {
				qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, bCtrlKey);
				oElem = checkFocus(this.getElement(i, iColumnIndex, true), assert);
				assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			}

			// Scroll to the last row.
			for (let i = iVisibleRowCount; i < iTotalRowCount; i++) {
				qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, bCtrlKey);
				await this.oTable.qunit.whenNextRenderingFinished();
				oElem = checkFocus(this.getElement(iVisibleRowCount - 1, iColumnIndex, true), assert);
				assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			}

			// Navigating down on the last row switches the action mode off.
			qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, bCtrlKey);
			oElem = checkFocus(this.getElement(iVisibleRowCount - 1, iColumnIndex), assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			// Navigate up to the first visible row.
			for (let i = iVisibleRowCount - 2; i >= 0; i--) {
				// At the last row, always press Ctrl to switch to the action mode again.
				qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, i === iVisibleRowCount - 2 || bCtrlKey);

				if (iColumnIndex === -1) {
					// In case of row header cells enter the action mode manually.
					this.oTable._getKeyboardExtension()._actionMode = true;
				}

				oElem = checkFocus(this.getElement(i, iColumnIndex, true), assert);
				assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			}

			// Scroll up to the first row.
			for (let i = iVisibleRowCount; i < iTotalRowCount; i++) {
				qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, bCtrlKey);
				await this.oTable.qunit.whenNextRenderingFinished();
				oElem = checkFocus(this.getElement(0, iColumnIndex, true), assert);
				assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			}

			// Navigating up on the first row switches the action mode off.
			qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, bCtrlKey);
			checkFocus(this.getElement(0, iColumnIndex), assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

			// Ctrl+Up on the first row does not navigate to the column header.
			qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, true);
			checkFocus(this.getElement(0, iColumnIndex), assert);
			assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		}
	});

	QUnit.test("TAB & Shift+TAB", async function(assert) {
		this.oTable.setSelectionMode(library.SelectionMode.None);
		await this.oTable.qunit.whenRenderingFinished();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers", function(assert) {
		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Invisible Columns", async function(assert) {
		this.oTable.getColumns()[1].setVisible(false);
		await this.oTable.qunit.whenRenderingFinished();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns", async function(assert) {
		this.oTable.setFixedColumnCount(2);
		await this.oTable.qunit.whenRenderingFinished();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Row Actions", async function(assert) {
		this.oTable.setFixedColumnCount(2);
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		this.oTable.setRowActionCount(2);
		await this.oTable.qunit.whenRenderingFinished();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Row Actions, Fixed Top Rows, Fixed Bottom Rows", async function(assert) {
		this.oTable.setFixedColumnCount(2);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		this.oTable.setRowActionCount(2);
		await this.oTable.qunit.whenRenderingFinished();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Empty Row Actions, Fixed Top Rows, Fixed Bottom Rows", async function(assert) {
		this.oTable.setFixedColumnCount(2);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Grouping", async function(assert) {
		this.oTable.setSelectionMode(library.SelectionMode.None);
		this.setupGrouping();
		await this.oTable.qunit.whenRenderingFinished();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Row Actions, Fixed Top Rows, Fixed Bottom Rows, Grouping", async function(assert) {
		this.oTable.setFixedColumnCount(2);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		this.oTable.setRowActionCount(2);
		this.setupGrouping();
		await this.oTable.qunit.whenRenderingFinished();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("TAB & Shift+TAB - Row Headers, Fixed Columns, Empty Row Actions, Fixed Top Rows, Fixed Bottom Rows, Grouping", async function(assert) {
		this.oTable.setFixedColumnCount(2);
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 6,
			fixedTopRowCount: 2,
			fixedBottomRowCount: 2
		}));
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		this.oTable.setRowActionCount(1);
		this.setupGrouping();
		await this.oTable.qunit.whenRenderingFinished();

		return this.testActionModeTabNavigation(assert);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - On first column", async function(assert) {
		let oElement;

		await this.testActionModeUpDownNavigation(assert, 0, true);

		oElement = this.oTable.qunit.getDataCell(0, 1).querySelector("span");
		oElement.tabIndex = -1;
		oElement.focus();
		checkFocus(oElement, assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(oElement, Key.Arrow.UP, false, false, true);
		checkFocus(this.oTable.qunit.getDataCell(0, 1), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		this.oTable._getScrollExtension().scrollVerticallyMax(true);
		oElement = this.oTable.qunit.getDataCell(this.oTable._getRowCounts().count - 1, 1).querySelector("span");
		oElement.tabIndex = -1;
		oElement.focus();
		checkFocus(oElement, assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(oElement, Key.Arrow.DOWN, false, false, true);
		checkFocus(this.oTable.qunit.getDataCell(this.oTable._getRowCounts().count - 1, 1), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	});

	QUnit.test("Up & Down - On first column", function(assert) {
		return this.testActionModeUpDownNavigation(assert, 0, false);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - On Row Headers", function(assert) {
		return this.testActionModeUpDownNavigation(assert, -1, true);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - On Row Actions", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		await this.testActionModeUpDownNavigation(assert, -2, true);
	});

	QUnit.test("Up & Down - On Row Actions", async function(assert) {
		this.oTable.setRowActionTemplate(TableQUnitUtils.createRowAction());
		this.oTable.setRowActionCount(1);
		await this.oTable.qunit.whenRenderingFinished();

		return this.testActionModeUpDownNavigation(assert, -2, false);
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - Navigate between interchanging interactive and non-interactive cells", function(assert) {
		let oElem;

		// Prepare the cell in the second row to not have interactive elements.
		this.oTable.qunit.getDataCell(1, 0).querySelector("span").setAttribute("tabindex", "-1");

		oElem = this.oTable.qunit.getDataCell(0, 0);
		oElem.focus();
		checkFocus(oElem, assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, true);
		oElem = this.oTable.qunit.getDataCell(1, 0);
		checkFocus(oElem, assert); // The cell without interactive elements should be focused.
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		oElem = this.oTable.getRows()[1].getCells()[0].getDomRef();
		oElem.focus();
		checkFocus(oElem, assert); // The non-interactive element should be focused.
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(oElem, Key.Arrow.DOWN, false, false, true);
		oElem = TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(2, 0)).first();
		checkFocus(oElem, assert); // The cells interactive element should be focused.
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, true);
		oElem = this.oTable.qunit.getDataCell(1, 0);
		checkFocus(oElem, assert); // The cell without interactive elements should be focused.
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		oElem = this.oTable.getRows()[1].getCells()[0].getDomRef();
		oElem.focus();
		checkFocus(oElem, assert); // The non-interactive element should be focused.
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(oElem, Key.Arrow.UP, false, false, true);
		oElem = TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(0, 0)).first();
		checkFocus(oElem, assert); // The cells interactive element should be focused.
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
	});

	QUnit.test("Ctrl+Up & Ctrl+Down - Navigate between input elements", async function(assert) {
		this.oTable.getRowMode().setRowCount(4);
		await this.oTable.qunit.whenRenderingFinished();

		const oInputElement = document.createElement("input");
		oInputElement.setAttribute("id", this.oTable.getRows()[1].getCells()[0].getId());
		oInputElement.value = "test";
		this.oTable.qunit.getDataCell(1, 0).replaceChildren(oInputElement);

		const oTextAreaElement = document.createElement("textarea");
		oTextAreaElement.setAttribute("id", this.oTable.getRows()[2].getCells()[0].getId());
		oTextAreaElement.value = "test";
		this.oTable.qunit.getDataCell(2, 0).replaceChildren(oTextAreaElement);

		this.oTable.qunit.getDataCell(0, 0).focus();
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
		checkFocus(oInputElement, assert);
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oInputElement, true, "The text in the input element is selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
		checkFocus(oTextAreaElement, assert);
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oTextAreaElement, false, "The text in the textarea is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
		// The interactive element in the cell under the textarea cell should be focused.
		checkFocus(TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(3, 0)).first(), assert);
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		checkFocus(oTextAreaElement, assert);
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oTextAreaElement, false, "The text in the textarea element is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		checkFocus(oInputElement, assert);
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		assertTextSelection(assert, oInputElement, true, "The text in the input element is selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		// The interactive element in the cell above the input cell should be focused.
		checkFocus(TableUtils.getInteractiveElements(this.oTable.qunit.getDataCell(0, 0)).first(), assert);
		assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
	});

	QUnit.test("Up & Down - Navigate between input elements", async function(assert) {
		this.oTable.getRowMode().setRowCount(4);
		await this.oTable.qunit.whenRenderingFinished();

		const oInputElement = document.createElement("input");
		const oTextAreaElement = document.createElement("textarea");
		const oCellWithInput = this.oTable.qunit.getDataCell(1, 0);
		const oCellWithTextArea = this.oTable.qunit.getDataCell(2, 0);

		oCellWithInput.replaceChildren(oInputElement);
		oCellWithTextArea.replaceChildren(oTextAreaElement);
		oInputElement.setAttribute("id", this.oTable.getRows()[1].getCells()[0].getId());
		oInputElement.value = "test";
		oTextAreaElement.setAttribute("id", this.oTable.getRows()[2].getCells()[0].getId());
		oTextAreaElement.value = "test";

		this.oTable.qunit.getDataCell(0, 0).focus();
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		checkFocus(oCellWithInput, assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assertTextSelection(assert, oInputElement, false, "The text in the input element of type \"text\" is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		checkFocus(oCellWithTextArea, assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assertTextSelection(assert, oTextAreaElement, false, "The text in the textarea element is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		checkFocus(this.oTable.qunit.getDataCell(3, 0), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		checkFocus(oCellWithTextArea, assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assertTextSelection(assert, oTextAreaElement, false, "The text in the textarea element is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		checkFocus(oCellWithInput, assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
		assertTextSelection(assert, oInputElement, false, "The text in the input element of type \"text\" is not selected");

		qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		checkFocus(this.oTable.qunit.getDataCell(0, 0), assert);
		assert.ok(!this.oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");
	});

	QUnit.test("Allow cell content to handle focus-related events on navigation without focus change (on scroll)", async function(assert) {
		let aEvents = [];
		const test = async (sTitle, aExpectedEvents, fnAct) => {
			await TableQUnitUtils.wait(0);
			aEvents = [];
			fnAct();
			await this.oTable.qunit.whenNextRenderingFinished();
			assert.ok(this.oTable._getKeyboardExtension().isInActionMode(), sTitle + ": Table is in Action Mode");
			assert.deepEqual(aEvents, aExpectedEvents, sTitle + ": The events were correctly fired");
		};

		this.oTable.getRowMode().setRowCount(1);
		this.oTable.setSelectionMode(library.SelectionMode.None);
		this.oTable.destroyColumns();
		this.oTable.qunit.addTextColumn({
			label: "Focusable & Tabbable",
			text: "A",
			bind: true,
			focusable: true,
			tabbable: true
		}).getTemplate().addEventDelegate({
			onsapfocusleave: function() {
				aEvents.push("sapfocusleave");
			},
			onfocusin: function() {
				aEvents.push("focusin");
			}
		});
		await this.oTable.qunit.whenRenderingFinished();

		this.oTable.getRows()[0].getCells()[0].focus();
		await test("Arrow down", ["sapfocusleave", "focusin"], function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN);
		});
		await test("Arrow up", ["sapfocusleave", "focusin"], function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP);
		});
		await test("Ctrl+Arrow down", ["sapfocusleave", "focusin"], function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
		});
		await test("Ctrl+Arrow up", ["sapfocusleave", "focusin"], function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		});

		this.oTable.destroyColumns();
		this.oTable.qunit.addInputColumn({
			label: "Focusable & Tabbable",
			text: "Value",
			bind: true,
			tabbable: true
		}).getTemplate()
			.setFieldGroupIds(["fieldGroup1"])
			.attachValidateFieldGroup(function() {
				aEvents.push("validateFieldGroup");
			})
			.addEventDelegate({
				onsapfocusleave: function() {
					aEvents.push("sapfocusleave");
				},
				onfocusin: function() {
					aEvents.push("focusin");
				}
			});
		this.oTable.setFirstVisibleRow(0);
		await this.oTable.qunit.whenRenderingFinished();

		this.oTable.getRows()[0].getCells()[0].focus();
		await test("Ctrl+Arrow down", ["sapfocusleave", "validateFieldGroup", "focusin"], function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.DOWN, false, false, true);
		});
		await test("Ctrl+Arrow up", ["sapfocusleave", "validateFieldGroup", "focusin"], function() {
			qutils.triggerKeydown(document.activeElement, Key.Arrow.UP, false, false, true);
		});
		await test("Tab", ["sapfocusleave", "validateFieldGroup", "focusin"], function() {
			simulateTabEvent(document.activeElement);
		});
		await test("Shift+Tab", ["sapfocusleave", "validateFieldGroup", "focusin"], function() {
			simulateTabEvent(document.activeElement, true);
		});
	});

	QUnit.test("TAB & Shift+TAB - Column Headers", async function(assert) {
		this.oTable.getColumns()[0].setLabel(new TestInputControl());
		await this.oTable.qunit.whenRenderingFinished();

		const oColumnHeaderCell = this.oTable.qunit.getColumnHeaderCell(0);
		const $InteractiveElements = TableUtils.getInteractiveElements(oColumnHeaderCell);

		$InteractiveElements[0].focus();
		assert.strictEqual(document.activeElement, $InteractiveElements[0], "First interactive element in the column header cell is focused");

		simulateTabEvent(document.activeElement);
		checkFocus(oColumnHeaderCell, assert);

		$InteractiveElements[0].focus();
		assert.strictEqual(document.activeElement, $InteractiveElements[0], "First interactive element in the column header cell is focused");

		simulateTabEvent(document.activeElement, true);
		checkFocus(oColumnHeaderCell, assert);
	});
});