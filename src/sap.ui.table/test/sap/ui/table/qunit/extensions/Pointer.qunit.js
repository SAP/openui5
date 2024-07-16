/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/extensions/Pointer",
	"sap/ui/table/Row",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device"
], function(
	TableQUnitUtils,
	qutils,
	nextUIUpdate,
	PointerExtension,
	Row,
	TableUtils,
	library,
	FixedRowMode,
	jQuery,
	Device
) {
	"use strict";

	const oModel = window.oModel;
	const aFields = window.aFields;
	const createTables = window.createTables;
	const destroyTables = window.destroyTables;
	const getCell = window.getCell;
	const getRowHeader = window.getRowHeader;
	const getRowAction = window.getRowAction;
	const iNumberOfRows = window.iNumberOfRows;
	const checkFocus = window.checkFocus;

	function createPointerEvent(sEventType) {
		return new window.PointerEvent(sEventType, {
			bubbles: true,
			cancelable: true
		});
	}

	QUnit.module("Lifecycle", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oExtension = this.oTable._getPointerExtension();
		let iDelegateCount = 0;

		assert.ok(oExtension, "Extension available in table");

		for (let i = 0; i < this.oTable.aDelegates.length; i++) {
			if (this.oTable.aDelegates[i].oDelegate === oExtension._delegate) {
				iDelegateCount++;
			}
		}

		assert.equal(iDelegateCount, 1, "Pointer delegate registered");
	});

	QUnit.test("Destruction", function(assert) {
		const oExtension = this.oTable._getPointerExtension();

		this.oTable.destroy();
		assert.ok(!oExtension.getTable(), "Reference to table removed");
		assert.ok(!oExtension._delegate, "Delegate cleared");
	});

	QUnit.module("Column Resizing", {
		beforeEach: async function() {
			this.bOriginalSystemDesktop = Device.system.desktop;

			await createTables();

			// Ensure that the last column is "streched" and the others have their defined size
			const oLastColumn = oTable.getColumns()[oTable.getColumns().length - 1];
			oLastColumn.setWidth(null);

			// Ensure bigger cell content for the column with index 1
			const aRows = oModel.getData().rows;
			for (let i = 0; i < aRows.length; i++) {
				aRows[i][aFields[1]] = "AAAAAAAAAAAAAAAAAAAAAAAAA" + i;
			}
			oModel.refresh(true);

			this.oColumn = oTable.getColumns()[1];
			this.oColumn.setResizable(false);

			await nextUIUpdate();

			// Extend auto resize logic to know about the test control
			PointerExtension._fnCheckTextBasedControl = function(oControl) {
				return oControl.getMetadata().getName() === "TestControl";
			};
		},
		afterEach: function() {
			Device.system.desktop = this.bOriginalSystemDesktop;

			destroyTables();
			PointerExtension._fnCheckTextBasedControl = null;
		}
	});

	function moveResizer(oColumn, assert, bExpect, iIndex) {
		qutils.triggerEvent("mousemove", oColumn.getId(), {
			clientX: Math.floor(oColumn.getDomRef().getBoundingClientRect().left + 10),
			clientY: Math.floor(oColumn.getDomRef().getBoundingClientRect().top + 100)
		});

		if (assert) {
			const iDistance = oTable.getDomRef("rsz").getBoundingClientRect().left - oColumn.getDomRef().getBoundingClientRect().right;
			const bCorrect = Math.abs(iDistance) < 5;
			assert.ok(bExpect && bCorrect || !bExpect && !bCorrect, "Position of Resizer");
			assert.equal(oTable._iLastHoveredVisibleColumnIndex, iIndex, "Index of last hovered resizable column");
		}
	}

	QUnit.test("Moving Resizer", function(assert) {
		const aVisibleColumns = oTable._getVisibleColumns();
		moveResizer(aVisibleColumns[0], assert, true, 0);
		moveResizer(aVisibleColumns[1], assert, false, 0);
		assert.ok(Math.abs(oTable.getDomRef("rsz").getBoundingClientRect().left - aVisibleColumns[0].getDomRef().getBoundingClientRect().right) < 5,
			"Position of Resizer still on column 0");
		moveResizer(aVisibleColumns[2], assert, true, 2);
	});

	QUnit.test("Moving Resizer with padding on the root element", function(assert) {
		oTable.getDomRef().style.padding = "1rem";
		const aVisibleColumns = oTable._getVisibleColumns();
		moveResizer(aVisibleColumns[0], assert, true, 0);
		moveResizer(aVisibleColumns[1], assert, false, 0);
		assert.ok(Math.abs(oTable.getDomRef("rsz").getBoundingClientRect().left - aVisibleColumns[0].getDomRef().getBoundingClientRect().right) < 5,
			"Position of Resizer still on column 0");
		moveResizer(aVisibleColumns[2], assert, true, 2);
	});

	QUnit.test("Automatic Column Resize via Double Click", async function(assert) {
		const assertAutoResizeCalled = (bCalled) => {
			const sMessage =
				` - resizable=${this.oColumn.getResizable()}, autoResizable=${this.oColumn.getAutoResizable()}, desktop=${Device.system.desktop}`;

			if (bCalled) {
				assert.ok(this.oColumn.autoResize.calledOnceWithExactly(), "Column#autoResize called once with correct parameters" + sMessage);
			} else {
				assert.ok(this.oColumn.autoResize.notCalled, "Column#autoResize not called" + sMessage);
			}

			this.oColumn.autoResize.resetHistory();
		};
		const triggerDoubleClick = () => {
			const oResizer = oTable.getDomRef("rsz");

			// Move resizer to correct column
			moveResizer(this.oColumn);

			// Simulate double click on resizer
			return new Promise(function(resolve) {
				oResizer.dispatchEvent(createPointerEvent("mousedown"));
				oResizer.dispatchEvent(createPointerEvent("mouseup"));
				oResizer.dispatchEvent(createPointerEvent("click"));
				setTimeout(resolve, 50);
			}).then(function() {
				return new Promise(function(resolve) {
					oResizer.dispatchEvent(createPointerEvent("mousedown"));
					oResizer.dispatchEvent(createPointerEvent("mouseup"));
					oResizer.dispatchEvent(createPointerEvent("click"));
					oResizer.dispatchEvent(createPointerEvent("dblclick"));
					setTimeout(resolve, 50);
				});
			});
		};

		sinon.spy(this.oColumn, "autoResize");

		Device.system.desktop = true;
		await triggerDoubleClick();
		assertAutoResizeCalled(false);

		this.oColumn.setAutoResizable(true);
		await nextUIUpdate();
		await triggerDoubleClick();
		assertAutoResizeCalled(false);

		this.oColumn.setResizable(true);
		await nextUIUpdate();
		Device.system.desktop = false;
		await triggerDoubleClick();
		assertAutoResizeCalled(false);

		Device.system.desktop = true;
		await triggerDoubleClick();
		assertAutoResizeCalled(true);

		this.oColumn.setAutoResizable(false);
		await triggerDoubleClick();
		assertAutoResizeCalled(false);
	});

	QUnit.test("Resize via Drag&Drop", async function(assert) {
		const oColumn = this.oColumn;
		let $Resizer = oTable.$("rsz");

		// resizer should be way out of screen when the table gets rendered
		const nLeft = oTable.$("rsz").position().left;
		assert.equal(nLeft, "-5", "Resizer is at the correct initial position");

		const iWidth = oColumn.$().width();
		assert.ok(Math.abs(iWidth - 100) < 10, "check column width before resize: " + iWidth);

		// Resizer moved to the correct position when column is resizable
		moveResizer(oColumn, assert, false, 0);
		oColumn.setAutoResizable(true);
		await nextUIUpdate();

		moveResizer(oColumn, assert, false, 0);
		oColumn.setResizable(true);
		await nextUIUpdate();

		moveResizer(oColumn, assert, true, 1);
		await TableQUnitUtils.nextEvent("rowsUpdated", oTable);

		// drag resizer to resize column
		$Resizer = oTable.$("rsz");
		const iResizeHandlerTop = Math.floor(oColumn.getDomRef().getBoundingClientRect().top + 100);
		const iResizeHandlerLeft = $Resizer.offset().left;

		qutils.triggerMouseEvent($Resizer, "mousedown", 1, 1, iResizeHandlerLeft, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeHandlerLeft + 90, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeHandlerLeft + 90 + 40, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mouseup", 1, 1, iResizeHandlerLeft + 90 + 40, iResizeHandlerTop, 0);
		await TableQUnitUtils.nextEvent("rowsUpdated", oTable);

		const iNewWidth = oColumn.getDomRef().offsetWidth;
		assert.ok(Math.abs(iNewWidth - iWidth - 90 - 40) < 5, "check column width after resize: " + iNewWidth);
	});

	QUnit.test("Skip trigger resize when resizing already started", function(assert) {
		oTable._getPointerExtension()._debug();
		const ColumnResizeHelper = oTable._getPointerExtension()._ColumnResizeHelper;
		oTable._bIsColumnResizerMoving = true;
		assert.ok(!oTable.$().hasClass("sapUiTableResizing"), "Before Trigger");
		ColumnResizeHelper.initColumnResizing(oTable);
		assert.ok(!oTable.$().hasClass("sapUiTableResizing"), "After Trigger");
	});

	QUnit.module("Menus", {
		beforeEach: async function() {
			await createTables();
			this.oPointerExtension = oTable._getPointerExtension();
			this.oPointerExtension._debug();
		},
		afterEach: function() {
			destroyTables();
		},

		/**
		 * Triggers a mouse down event on the passed element simulating the specified button.
		 *
		 * @param {jQuery|HTMLElement} oElement The target of the event.
		 * @param {int} iButton 0 = Left mouse button,
		 *                      1 = Middle mouse button,
		 *                      2 = Right mouse button
		 */
		triggerMouseDownEvent: function(oElement, iButton) {
			qutils.triggerMouseEvent(oElement, "mousedown", null, null, null, null, iButton);
		}
	});

	QUnit.test("Data cell", function(assert) {
		const oElem = getCell(0, 0);
		const oColumn = oTable.getColumns()[0];
		const oContextMenuEvent = this.spy(this.oPointerExtension._delegate, "oncontextmenu");
		let oContextMenuEventArgument;

		// Try to open the menu with the left mouse button.
		this.triggerMouseDownEvent(oElem, 0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.equal(oTable._oCellContextMenu, null, "Menu is not yet created");
		checkFocus(oElem, assert);

		// Try to open the menu with the right mouse button.
		this.triggerMouseDownEvent(oElem, 2);
		jQuery(oElem).trigger("contextmenu");
		assert.notEqual(oTable._oCellContextMenu, null, "Menu is created");
		oContextMenuEventArgument = oContextMenuEvent.args[0][0];
		oContextMenuEvent.resetHistory();
		assert.ok(!oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was not prevented");
		checkFocus(oElem, assert);

		TableUtils.Menu.cleanupDefaultContentCellContextMenu(oTable);
		oTable.setEnableCellFilter(true);
		this.stub(oColumn, "isFilterableByMenu").returns(true);

		// Try to open the menu with the left mouse button.
		this.triggerMouseDownEvent(oElem, 0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.equal(oTable._oCellContextMenu, null, "Menu is not yet created");
		checkFocus(oElem, assert);

		// Open the menu with the right mouse button.
		this.triggerMouseDownEvent(oElem, 2);
		jQuery(oElem).trigger("contextmenu");
		assert.ok(oTable._oCellContextMenu.isOpen(), "Menu is opened");
		const bFirstItemHovered = oTable._oCellContextMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
		assert.strictEqual(bFirstItemHovered, true, "The first item in the menu is hovered");
		oContextMenuEventArgument = oContextMenuEvent.args[0][0];
		oContextMenuEvent.resetHistory();
		assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

		// Open the menu with the right mouse button on the same element.
		this.triggerMouseDownEvent(oElem, 2);
		jQuery(oElem).trigger("contextmenu");
		assert.ok(oTable._oCellContextMenu.isOpen(), "Menu is opened");
		oContextMenuEventArgument = oContextMenuEvent.args[0][0];
		oContextMenuEvent.resetHistory();
		assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

		// If an interactive/clickable element inside a data cell was clicked, open the default context menu instead of the column or cell context
		// menu.
		const aKnownClickableControls = this.oPointerExtension._KNOWNCLICKABLECONTROLS;
		const $CellContent = oTable.getRows()[0].getCells()[0].$();

		for (let i = 0; i < aKnownClickableControls.length; i++) {
			$CellContent.toggleClass(aKnownClickableControls[i], true);
			this.triggerMouseDownEvent($CellContent, 2);
			jQuery($CellContent).trigger("contextmenu");
			assert.ok(!oTable._oCellContextMenu.isOpen(), "Menu is closed");
			oContextMenuEventArgument = oContextMenuEvent.args[0][0];
			oContextMenuEvent.resetHistory();
			assert.ok(!oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was not prevented");
			$CellContent.toggleClass(aKnownClickableControls[i], false);
		}
	});

	QUnit.module("Mousedown", {
		beforeEach: async function() {
			await createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Scrollbar", function(assert) {
		let oEvent = jQuery.Event({type: "mousedown"});
		oEvent.target = oTable._getScrollExtension().getHorizontalScrollbar();
		oEvent.button = 0;
		jQuery(oEvent.target).trigger(oEvent);
		assert.ok(oEvent.isDefaultPrevented(), "Prevent Default of mousedown on horizontal scrollbar");
		oEvent = jQuery.Event({type: "mousedown"});
		oEvent.target = oTable._getScrollExtension().getVerticalScrollbar();
		oEvent.button = 0;
		jQuery(oEvent.target).trigger(oEvent);
		assert.ok(oEvent.isDefaultPrevented(), "Prevent Default of mousedown on vertical scrollbar");
	});

	QUnit.module("Click", {
		beforeEach: async function() {
			await createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Tree Icon", async function(assert) {
		const oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding().isExpanded(0), "!Expanded");
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			assert.ok(false, "_doSelect was not called");
		};

		const oTreeIcon = oTreeTable.getRows()[0].getDomRef("col0").querySelector(".sapUiTableTreeIcon");
		qutils.triggerMouseEvent(oTreeIcon, "tap");
		await TableQUnitUtils.nextEvent("rowsUpdated", oTreeTable);
		await nextUIUpdate();

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
		assert.ok(oTreeTable.getBinding().isExpanded(0), "Expanded");
		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;
	});

	QUnit.test("Group Header", async function(assert) {
		const oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		oTreeTable.setUseGroupMode(true);
		await nextUIUpdate();
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			assert.ok(false, "_doSelect was not called");
		};

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding().isExpanded(0), "!Expanded");

		const oGroupHeader = oTreeTable.getRows()[0].getDomRef("groupHeader");
		qutils.triggerMouseEvent(oGroupHeader, "tap");
		await TableQUnitUtils.nextEvent("rowsUpdated", oTreeTable);
		await nextUIUpdate();

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
		assert.ok(oTreeTable.getBinding().isExpanded(0), "Expanded");
		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;
	});

	QUnit.test("Mobile Group Menu Button", function(assert) {
		const oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		let bSelected = false;
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			bSelected = true;
		};

		const oOpenContextMenu = this.spy(TableUtils.Menu, "openContextMenu");
		const $FakeButton = TableUtils.getRowColCell(oTreeTable, 0, 0).cell.$();

		$FakeButton.addClass("sapUiTableGroupMenuButton");
		qutils.triggerMouseEvent($FakeButton, "tap");
		assert.ok(!bSelected, "Selection was not performed");
		assert.ok(oOpenContextMenu.calledOnce, "Context Menu was opened");

		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;

		oOpenContextMenu.restore();
	});

	QUnit.test("Cell + Cell Click Event", function(assert) {
		let oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		let iSelectCount = 0;
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			iSelectCount++;
		};

		let fnClickHandler; let bClickHandlerCalled;

		function initCellClickHandler(fnHandler) {
			if (fnClickHandler) {
				oTreeTable.detachCellClick(fnClickHandler);
				fnClickHandler = null;
			}
			bClickHandlerCalled = false;
			if (fnHandler) {
				oTreeTable.attachCellClick(fnHandler);
				fnClickHandler = fnHandler;
			}
		}

		const oRowColCell = TableUtils.getRowColCell(oTreeTable, 1, 2);
		initCellClickHandler(function(oEvent) {
			bClickHandlerCalled = true;
			assert.ok(oEvent.getParameter("cellControl") === oRowColCell.cell, "Cell Click Event: Parameter cellControl");
			assert.ok(oEvent.getParameter("cellDomRef") === document.getElementById(oTreeTable.getId() + "-rows-row1-col2"),
				"Cell Click Event: Parameter cellDomRef");
			assert.equal(oEvent.getParameter("rowIndex"), 1, "Cell Click Event: Parameter rowIndex");
			assert.equal(oEvent.getParameter("columnIndex"), 2, "Cell Click Event: Parameter columnIndex");
			assert.equal(oEvent.getParameter("columnId"), oRowColCell.column.getId(), "Cell Click Event: Parameter columnId");
			assert.ok(oEvent.getParameter("rowBindingContext") === oRowColCell.row.getBindingContext(),
				"Cell Click Event: Parameter rowBindingContext");
		});
		let $Cell = oRowColCell.cell.$();
		qutils.triggerMouseEvent($Cell, "tap"); // Should increase the counter
		assert.equal(iSelectCount, 1, iSelectCount + " selections performed");
		assert.ok(bClickHandlerCalled, "Cell Click Event handler called");

		initCellClickHandler(function(oEvent) {
			oEvent.preventDefault();
			bClickHandlerCalled = true;
		});
		qutils.triggerMouseEvent($Cell, "tap");
		assert.equal(iSelectCount, 1, iSelectCount + " selections performed");
		assert.ok(bClickHandlerCalled, "Cell Click Event handler called");

		initCellClickHandler(function(oEvent) {
			bClickHandlerCalled = true;
		});
		$Cell = oTreeTable.getRows()[0].$("col0");
		qutils.triggerMouseEvent($Cell, "tap"); // Should increase the counter
		assert.equal(iSelectCount, 2, iSelectCount + " selections performed");
		assert.ok(bClickHandlerCalled, "Cell Click Event handler called");

		bClickHandlerCalled = false;
		const oEvent = jQuery.Event({type: "tap"});
		oEvent.setMarked();
		$Cell.trigger(oEvent);
		assert.equal(iSelectCount, 2, iSelectCount + " selections performed");
		assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");

		qutils.triggerMouseEvent(oTreeTable.getDomRef("rowsel0"), "tap"); // Should increase the counter
		assert.equal(iSelectCount, 3, iSelectCount + " selections performed");
		assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");

		qutils.triggerMouseEvent(oTable._getVisibleColumns()[0].getDomRef(), "tap");
		assert.equal(iSelectCount, 3, iSelectCount + " selections performed");
		assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");

		// Prevent Click on interactive controls

		oExtension = oTable._getPointerExtension();
		oExtension._debug();
		const aKnownClickableControls = oExtension._KNOWNCLICKABLECONTROLS;

		$Cell = oRowColCell.cell.$();
		for (let i = 0; i < aKnownClickableControls.length; i++) {
			$Cell.toggleClass(aKnownClickableControls[i], true);
			qutils.triggerMouseEvent($Cell, "tap");
			assert.equal(iSelectCount, 3, iSelectCount + " selections performed");
			assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");
			$Cell.toggleClass(aKnownClickableControls[i], false);
		}

		oRowColCell.cell.getEnabled = function() { return false; };
		$Cell = oRowColCell.cell.$();
		const iStartCount = iSelectCount;
		for (let i = 0; i < aKnownClickableControls.length; i++) {
			$Cell.toggleClass(aKnownClickableControls[i], true);
			qutils.triggerMouseEvent($Cell, "tap");
			assert.equal(iSelectCount, iStartCount + i + 1, iSelectCount + " selections performed");
			assert.ok(bClickHandlerCalled, "Cell Click Event handler called");
			$Cell.toggleClass(aKnownClickableControls[i], false);
		}

		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;
	});

	QUnit.test("Single Selection", async function(assert) {
		oTable.clearSelection();
		oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		oTable.setSelectionMode(library.SelectionMode.Single);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		assert.ok(!oTable.isIndexSelected(0), "First row is not selected");

		qutils.triggerMouseEvent(getCell(0, 0), "tap");
		assert.ok(oTable.isIndexSelected(0), "Click on data cell in first row -> First row selected");

		qutils.triggerMouseEvent(getRowHeader(0), "tap");
		assert.ok(!oTable.isIndexSelected(0), "Click on row header cell in first row -> First row  not selected");

		qutils.triggerMouseEvent(getRowAction(0), "tap");
		assert.ok(oTable.isIndexSelected(0), "Click on row action cell in first row -> First row selected");

		qutils.triggerMouseEvent(getCell(1, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [1], "Click on data cell in second row -> Second row selected");
	});

	QUnit.test("MultiToggle Selection - Range", async function(assert) {
		oTable.clearSelection();
		oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		qutils.triggerMouseEvent(getCell(0, 0), "tap");
		assert.ok(oTable.isIndexSelected(0), "Click on first row -> Row selected");

		oTable.setFirstVisibleRow(3); // Scroll down 3 rows
		await nextUIUpdate();
		qutils.triggerEvent("tap", getCell(2, 0), {shiftKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5], "Range selection with Shift + Click selected the correct rows");
		assert.strictEqual(window.getSelection().toString(), "", "Range selection with Shift + Click did not select text");

		qutils.triggerMouseEvent(getCell(0, 0), "tap"); // Deselect row with index 3
		qutils.triggerMouseEvent(getCell(0, 0), "tap"); // Select row with index 3
		qutils.triggerMouseEvent(getCell(0, 0), "tap"); // Deselect row with index 3
		qutils.triggerEvent("tap", getCell(2, 0), {shiftKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 4, 5], "Range selection with Shift + Click did not deselect");
	});

	QUnit.test("MultiToggle Selection - Toggle", async function(assert) {
		oTable.clearSelection();
		oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		qutils.triggerMouseEvent(getCell(0, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [0], "Click on unselected row with index 0");

		qutils.triggerMouseEvent(getCell(1, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1], "Click on unselected row with index 1");

		qutils.triggerMouseEvent(getCell(0, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [1], "Click on selected row with index 0");
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
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createInputColumn()
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
		testRowSelection: function(oTarget, mSettings = {}) {
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
				target: oTarget.id,
				...mSettings
			}));

			qutils.triggerMouseEvent(oTarget, "tap");

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

	QUnit.test("Row selection", function(assert) {
		// selectionBehavior = RowSelector
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0), {shouldNotCallPlugin: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {cellClickPreventDefault: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0));

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {cellClickPreventDefault: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("Cell in group header row", async function(assert) {
		TableUtils.Grouping.setHierarchyMode(TableUtils.Grouping.HierarchyMode.Group);
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader}]);

		// selectionBehavior = RowSelector
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0), {shouldNotCallPlugin: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {cellClickPreventDefault: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0));

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0));
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {cellClickPreventDefault: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("Cell in summary row", async function(assert) {
		await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.Summary}]);

		// selectionBehavior = RowSelector
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0), {shouldNotCallPlugin: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0), {shouldNotCallPlugin: true});

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(0, 0), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(0), {shouldNotCallPlugin: true});
	});

	QUnit.test("Cell in empty row", function(assert) {
		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		this.testRowSelection(this.oTable.qunit.getRowHeaderCell(-1), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getDataCell(-1, -1), {shouldNotCallPlugin: true});
		this.testRowSelection(this.oTable.qunit.getRowActionCell(-1), {shouldNotCallPlugin: true});
	});

	QUnit.test("Range selection", function(assert) {
		const testRangeSelection = (oTarget, bExpectPluginCall = true) => {
			this.oSetSelected.resetHistory();

			sinon.assert.pass("Test: " + JSON.stringify({
				selectionBehavior: this.oTable.getSelectionBehavior(),
				target: oTarget.id
			}));

			qutils.triggerEvent("tap", oTarget, {shiftKey: true});

			if (bExpectPluginCall) {
				const oRow = this.oTable.getRows()[TableUtils.getCellInfo(TableUtils.getCell(this.oTable, oTarget)).rowIndex];
				sinon.assert.alwaysCalledWithExactly(this.oSetSelected, oRow, true, {range: true});
				sinon.assert.callCount(this.oSetSelected, 1);
			} else {
				sinon.assert.notCalled(this.oSetSelected);
			}
		};

		// selectionBehavior = RowSelector
		testRangeSelection(this.oTable.qunit.getRowHeaderCell(0));
		testRangeSelection(this.oTable.qunit.getRowHeaderCell(4), false); // Empty row
		testRangeSelection(this.oTable.qunit.getRowHeaderCell(1));
		testRangeSelection(this.oTable.qunit.getDataCell(0, 0), false);
		testRangeSelection(this.oTable.qunit.getRowActionCell(0), false);

		this.oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		testRangeSelection(this.oTable.qunit.getRowHeaderCell(0));
		testRangeSelection(this.oTable.qunit.getDataCell(0, 0));
		testRangeSelection(this.oTable.qunit.getRowActionCell(0));

		this.oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		testRangeSelection(this.oTable.qunit.getRowHeaderCell(0), false);
		testRangeSelection(this.oTable.qunit.getDataCell(0, 0));
		testRangeSelection(this.oTable.qunit.getRowActionCell(0));
	});

	QUnit.test("Header selector press", function(assert) {
		const oHeaderSelectorPress = this.spy(this.oSelectionPlugin, "onHeaderSelectorPress");

		qutils.triggerMouseEvent(this.oTable.qunit.getSelectAllCell(), "tap");
		sinon.assert.alwaysCalledWithExactly(oHeaderSelectorPress);
		sinon.assert.callCount(oHeaderSelectorPress, 1);
	});

	QUnit.module("Column Reordering", {
		beforeEach: async function() {
			await createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	function computeSettingsForReordering(oTable, iIndex, bIncreaseIndex) {
		const oSettings = {
			column: oTable._getVisibleColumns()[iIndex],
			relatedColumn: oTable._getVisibleColumns()[bIncreaseIndex ? iIndex + 1 : iIndex - 1]
		};

		const initialXPos = 2; //Move mouse 2px from left onto the column

		oSettings.top = Math.floor(oSettings.column.getDomRef().getBoundingClientRect().top);
		oSettings.left = Math.floor(oSettings.column.getDomRef().getBoundingClientRect().left) + initialXPos;
		oSettings.breakeven = (bIncreaseIndex ? oSettings.column.$().outerWidth() : 0) - initialXPos + oSettings.relatedColumn.$().outerWidth() / 2;

		return oSettings;
	}

	QUnit.test("Reordering via Drag&Drop - increase Index", async function(assert) {
		const oSettings = computeSettingsForReordering(oTable, 2, true);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.wait(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
		await TableQUnitUtils.wait(100);
		await nextUIUpdate();

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed because not dragged enough");
		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.wait(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
		assert.equal(oTable.indexOfColumn(oColumn), 3, "Index of column changed");

		await nextUIUpdate();
		assert.strictEqual(document.activeElement, oColumn.getDomRef(), "Focused element");
		assert.strictEqual(oTable._getKeyboardExtension()._itemNavigation.getFocusedDomRef(), oColumn.getDomRef(),
			"Focused element in item navigation");
	});

	QUnit.test("Reordering via Drag&Drop - decrease Index", async function(assert) {
		const oSettings = computeSettingsForReordering(oTable, 2, false);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.wait(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
		await TableQUnitUtils.wait(100);

		await nextUIUpdate();
		assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed because not dragged enough");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.wait(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
		assert.equal(oTable.indexOfColumn(oColumn), 1, "Index of column changed");

		await nextUIUpdate();
		assert.strictEqual(document.activeElement, oColumn.getDomRef(), "Focused element");
		assert.strictEqual(oTable._getKeyboardExtension()._itemNavigation.getFocusedDomRef(), oColumn.getDomRef(),
			"Focused element in item navigation");
	});

	QUnit.test("No Reordering of fixed columns (within fixed)", async function(assert) {
		oTable.setFixedColumnCount(4);
		await nextUIUpdate();

		const oSettings = computeSettingsForReordering(oTable, 2, true);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.wait(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
		await TableQUnitUtils.wait(100);

		await nextUIUpdate();
		assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
	});

	QUnit.test("No Reordering of fixed columns (fixed to not fixed)", async function(assert) {
		oTable.setFixedColumnCount(3);
		await nextUIUpdate();

		const oSettings = computeSettingsForReordering(oTable, 2, true);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.wait(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
		await TableQUnitUtils.wait(100);

		await nextUIUpdate();
		assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
	});

	QUnit.test("No Reordering of fixed columns (not fixed to fixed)", async function(assert) {
		oTable.setFixedColumnCount(2);
		await nextUIUpdate();

		const oSettings = computeSettingsForReordering(oTable, 2, false);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.wait(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
		await TableQUnitUtils.wait(100);

		await nextUIUpdate();
		assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
	});

	QUnit.test("TreeTable - No Reordering via Drag&Drop of first column - increase index", async function(assert) {
		const done = assert.async();
		oTreeTable.setFixedColumnCount(0);
		await nextUIUpdate();

		const oSettings = computeSettingsForReordering(oTreeTable, 0, true);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.wait(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
		await TableQUnitUtils.wait(100);
		await nextUIUpdate();

		assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Index of column not changed because not dragged enough");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		await TableQUnitUtils.wait(250);

		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
		qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
		await TableQUnitUtils.wait(100);

		await nextUIUpdate();
		assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Index of column not changed");
		done();
	});

	QUnit.test("TreeTable - No Reordering via Drag&Drop of first column - decrease index", async function(assert) {
		const done = assert.async();
		oTreeTable.setFixedColumnCount(0);
		await nextUIUpdate();

		const oSettings = computeSettingsForReordering(oTreeTable, 1, false);
		const oColumn = oSettings.column;
		const iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTreeTable.indexOfColumn(oColumn), 1, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function() {
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
			setTimeout(async function() {
				await nextUIUpdate();
				assert.equal(oTreeTable.indexOfColumn(oColumn), 1, "Index of column not changed");
				done();
			}, 100);
		}, 250);
	});

	QUnit.module("Row Hover Effect", {
		beforeEach: async function() {
			await createTables();
			oTable.setSelectionBehavior(library.SelectionBehavior.Row);
			oTable.invalidate();
			await nextUIUpdate();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("RowHeader", function(assert) {
		assert.ok(!getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		getRowHeader(0).trigger("mouseover");
		assert.ok(getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		getRowHeader(0).trigger("mouseout");
		assert.ok(!getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
	});

	QUnit.test("Fixed column area", function(assert) {
		assert.ok(!getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		getCell(0, 0).trigger("mouseover");
		assert.ok(getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		getCell(0, 0).trigger("mouseout");
		assert.ok(!getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
	});

	QUnit.test("Scroll column area", function(assert) {
		assert.ok(!getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		getCell(0, 2).trigger("mouseover");
		assert.ok(getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		getCell(0, 2).trigger("mouseout");
		assert.ok(!getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
	});

	QUnit.test("Row Hover Effect depending on SelectionMode and SelectionBehavior", async function(assert) {
		oTable.setSelectionMode("None");
		oTable.invalidate();
		await nextUIUpdate();
		getCell(0, 2).trigger("mouseover");
		assert.ok(!getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		getCell(0, 2).trigger("mouseout");
		oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		oTable.invalidate();
		await nextUIUpdate();
		getCell(0, 2).trigger("mouseover");
		assert.ok(!getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		getCell(0, 2).trigger("mouseout");
		oTable.setSelectionMode("MultiToggle");
		oTable.setSelectionBehavior(library.SelectionBehavior.Row);
		oTable.invalidate();
		await nextUIUpdate();
		getCell(0, 2).trigger("mouseover");
		assert.ok(getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		getCell(0, 2).trigger("mouseout");
		oTable.setSelectionBehavior(library.SelectionBehavior.RowOnly);
		oTable.invalidate();
		await nextUIUpdate();
		getCell(0, 2).trigger("mouseover");
		assert.ok(getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		getCell(0, 2).trigger("mouseout");
		oTable.setSelectionMode("None");
		oTable.setSelectionBehavior(library.SelectionBehavior.RowSelector);
		oTable.invalidate();
		await nextUIUpdate();
		oTable.attachCellClick(function() {});
		getCell(0, 2).trigger("mouseover");
		assert.ok(getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
	});

	QUnit.module("Helpers", {
		beforeEach: async function() {
			await createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("_debug()", function(assert) {
		const oExtension = oTable._getPointerExtension();
		assert.ok(!oExtension._ExtensionHelper, "_ExtensionHelper: No debug mode");
		assert.ok(!oExtension._ColumnResizeHelper, "_ColumnResizeHelper: No debug mode");
		assert.ok(!oExtension._ReorderHelper, "_ReorderHelper: No debug mode");
		assert.ok(!oExtension._ExtensionDelegate, "_ExtensionDelegate: No debug mode");
		assert.ok(!oExtension._RowHoverHandler, "_RowHoverHandler: No debug mode");
		assert.ok(!oExtension._KNOWNCLICKABLECONTROLS, "_KNOWNCLICKABLECONTROLS: No debug mode");

		oExtension._debug();
		assert.ok(!!oExtension._delegate, "_Delegate: Debug mode");
		assert.ok(!!oExtension._ExtensionHelper, "_ExtensionHelper: Debug mode");
		assert.ok(!!oExtension._ColumnResizeHelper, "_ColumnResizeHelper: Debug mode");
		assert.ok(!!oExtension._ReorderHelper, "_ReorderHelper: Debug mode");
		assert.ok(!!oExtension._ExtensionDelegate, "_ExtensionDelegate: Debug mode");
		assert.ok(!!oExtension._RowHoverHandler, "_RowHoverHandler: Debug mode");
		assert.ok(!!oExtension._KNOWNCLICKABLECONTROLS, "_KNOWNCLICKABLECONTROLS: Debug mode");
	});

	QUnit.test("_getEventPosition()", function(assert) {
		oTable._getPointerExtension()._debug();
		const oExtensionHelper = oTable._getPointerExtension()._ExtensionHelper;
		let oEvent;
		let oPos;
		const x = 15;
		const y = 20;
		const oCoord = {pageX: x, pageY: y};

		oEvent = jQuery.extend({originalEvent: {}}, oCoord);

		oPos = oExtensionHelper._getEventPosition(oEvent, oTable);
		assert.equal(oPos.x, x, "MouseEvent - X");
		assert.equal(oPos.y, y, "MouseEvent - Y");

		oEvent = {
			targetTouches: [oCoord],
			originalEvent: {
				touches: []
			}
		};

		oPos = oExtensionHelper._getEventPosition(oEvent, oTable);
		assert.equal(oPos.x, x, "TouchEvent - X");
		assert.equal(oPos.y, y, "TouchEvent - Y");

		oEvent = {
			touches: [oCoord],
			originalEvent: {
				touches: [],
				targetTouches: [oCoord]
			}
		};

		oPos = oExtensionHelper._getEventPosition(oEvent, oTable);
		assert.equal(oPos.x, x, "TouchEvent (wrapped) - X");
		assert.equal(oPos.y, y, "TouchEvent (wrapped) - Y");
	});
});