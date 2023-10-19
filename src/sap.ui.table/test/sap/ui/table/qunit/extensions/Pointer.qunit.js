/*global QUnit, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/Device",
	"sap/ui/table/extensions/Pointer",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core"
], function(TableQUnitUtils, qutils, Device, PointerExtension, TableUtils, tableLibrary, jQuery, oCore) {
	"use strict";

	// mapping of global function calls
	var oModel = window.oModel;
	var aFields = window.aFields;
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var iNumberOfRows = window.iNumberOfRows;
	var initRowActions = window.initRowActions;
	var checkFocus = window.checkFocus;
	var fakeSumRow = window.fakeSumRow;

	function createPointerEvent(sEventType) {
		return new window.PointerEvent(sEventType, {
			bubbles: true,
			cancelable: true
		});
	}

	QUnit.module("Initialization", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("init()", function(assert) {
		var oExtension = oTable._getPointerExtension();
		assert.ok(!!oExtension, "Pointer Extension available");

		var iCount = 0;
		for (var i = 0; i < oTable.aDelegates.length; i++) {
			if (oTable.aDelegates[i].oDelegate === oExtension._delegate) {
				iCount++;
			}
		}
		assert.ok(iCount == 1, "Pointer Delegate registered");
	});

	QUnit.module("Column Resizing", {
		beforeEach: function() {
			this.bOriginalSystemDesktop = Device.system.desktop;

			createTables();

			// Ensure that the last column is "streched" and the others have their defined size
			var oLastColumn = oTable.getColumns()[oTable.getColumns().length - 1];
			oLastColumn.setWidth(null);

			// Ensure bigger cell content for the column with index 1
			var aRows = oModel.getData().rows;
			for (var i = 0; i < aRows.length; i++) {
				aRows[i][aFields[1]] = "AAAAAAAAAAAAAAAAAAAAAAAAA" + i;
			}
			oModel.refresh(true);

			this.oColumn = oTable.getColumns()[1];
			this.oColumn.setResizable(false);

			oCore.applyChanges();

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
			var iDistance = oTable.getDomRef("rsz").getBoundingClientRect().left - oColumn.getDomRef().getBoundingClientRect().right;
			var bCorrect = Math.abs(iDistance) < 5;
			assert.ok(bExpect && bCorrect || !bExpect && !bCorrect, "Position of Resizer");
			assert.equal(oTable._iLastHoveredVisibleColumnIndex, iIndex, "Index of last hovered resizable table");
		}
	}

	QUnit.test("Moving Resizer", function(assert) {
		var aVisibleColumns = oTable._getVisibleColumns();
		moveResizer(aVisibleColumns[0], assert, true, 0);
		moveResizer(aVisibleColumns[1], assert, false, 0);
		assert.ok(Math.abs(oTable.getDomRef("rsz").getBoundingClientRect().left - aVisibleColumns[0].getDomRef().getBoundingClientRect().right) < 5,
			"Position of Resizer still on column 0");
		moveResizer(aVisibleColumns[2], assert, true, 2);
	});

	QUnit.test("Moving Resizer with padding on the root element", function(assert) {
		oTable.getDomRef().style.padding = "1rem";
		var aVisibleColumns = oTable._getVisibleColumns();
		moveResizer(aVisibleColumns[0], assert, true, 0);
		moveResizer(aVisibleColumns[1], assert, false, 0);
		assert.ok(Math.abs(oTable.getDomRef("rsz").getBoundingClientRect().left - aVisibleColumns[0].getDomRef().getBoundingClientRect().right) < 5,
			"Position of Resizer still on column 0");
		moveResizer(aVisibleColumns[2], assert, true, 2);
	});

	QUnit.test("Automatic Column Resize via Double Click", function(assert) {
		Device.system.desktop = true;

		function triggerDoubleClick(bExpect, iIndex) {
			var oResizer = oTable.getDomRef("rsz");

			// Move resizer to correct column
			moveResizer(oColumn, assert, bExpect, iIndex);

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
		}

		var oColumn = this.oColumn;
		var iWidth = oColumn.$().width();

		assert.ok(Math.abs(iWidth - 100) < 10, "check column width before resize: " + iWidth);

		return triggerDoubleClick(false, 0).then(function() {
			assert.equal(oColumn.$().width(), iWidth, "check column width after resize: " + iWidth);
			oColumn.setAutoResizable(true);
			oCore.applyChanges();
			assert.ok(oColumn.getAutoResizable(), "Column is autoresizable");
			assert.ok(!oColumn.getResizable(), "Column is not yet resizable");
			return triggerDoubleClick(false, 0);
		}).then(function() {
			assert.equal(oColumn.$().width(), iWidth, "check column width after resize: " + iWidth);
			oColumn.setResizable(true);
			oCore.applyChanges();
			assert.ok(oColumn.getAutoResizable(), "Column is autoresizable");
			assert.ok(oColumn.getResizable(), "Column is resizable");
			Device.system.desktop = false;
			return triggerDoubleClick(true, 1);
		}).then(function() {
			assert.equal(oColumn.$().width(), iWidth, "check column width after resize: " + iWidth);

			Device.system.desktop = true;
			return triggerDoubleClick(true, 1);
		}).then(function() {
			iWidth = oColumn.$().width();
			assert.ok(Math.abs(iWidth - 270) < 40, "check column width after resize: " + iWidth);
		});
	});

	QUnit.test("Automatic Column Resize via API", function(assert) {
		var done = assert.async();
		var oColumn = this.oColumn;
		var iWidth = oColumn.$().width();

		assert.ok(Math.abs(iWidth - 100) < 10, "check column width before resize: " + iWidth);
		oTable.autoResizeColumn(1);

		setTimeout(function() {
			assert.equal(oColumn.$().width(), iWidth, "check column width after resize: " + iWidth);
			oColumn.setAutoResizable(true);
			oCore.applyChanges();
			assert.ok(oColumn.getAutoResizable(), "Column is autoresizable");
			assert.ok(!oColumn.getResizable(), "Column is not yet resizable");
			oTable.autoResizeColumn(1);

			setTimeout(function() {
				assert.equal(oColumn.$().width(), iWidth, "check column width after resize: " + iWidth);
				oColumn.setResizable(true);
				oCore.applyChanges();
				assert.ok(oColumn.getAutoResizable(), "Column is autoresizable");
				assert.ok(oColumn.getResizable(), "Column is resizable");
				oTable.autoResizeColumn(1);

				setTimeout(function() {
					iWidth = oColumn.$().width();
					assert.ok(Math.abs(iWidth - 270) < 40, "check column width after resize: " + iWidth);
					done();
				}, 50);
			}, 50);
		}, 50);
	});

	QUnit.test("Resize via Drag&Drop", function(assert) {
		var oColumn = this.oColumn;
		var $Resizer = oTable.$("rsz");

		// resizer should be way out of screen when the table gets rendered
		var nLeft = oTable.$("rsz").position().left;
		assert.equal(nLeft, "-5", "Resizer is at the correct initial position");

		var iWidth = oColumn.$().width();
		assert.ok(Math.abs(iWidth - 100) < 10, "check column width before resize: " + iWidth);

		// Resizer moved to the correct position when column is resizable
		moveResizer(oColumn, assert, false, 0);
		oColumn.setAutoResizable(true);
		oCore.applyChanges();
		moveResizer(oColumn, assert, false, 0);
		oColumn.setResizable(true);
		oCore.applyChanges();
		moveResizer(oColumn, assert, true, 1);

		return new Promise(function(resolve) {
			oTable.attachEventOnce("rowsUpdated", resolve);
		}).then(function() {
			// drag resizer to resize column
			$Resizer = oTable.$("rsz");
			var iResizeHandlerTop = Math.floor(oColumn.getDomRef().getBoundingClientRect().top + 100);
			var iResizeHandlerLeft = $Resizer.offset().left;

			qutils.triggerMouseEvent($Resizer, "mousedown", 1, 1, iResizeHandlerLeft, iResizeHandlerTop, 0);
			qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeHandlerLeft + 90, iResizeHandlerTop, 0);
			qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeHandlerLeft + 90 + 40, iResizeHandlerTop, 0);
			qutils.triggerMouseEvent($Resizer, "mouseup", 1, 1, iResizeHandlerLeft + 90 + 40, iResizeHandlerTop, 0);

			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			var iNewWidth = oColumn.getDomRef().offsetWidth;
			assert.ok(Math.abs(iNewWidth - iWidth - 90 - 40) < 5, "check column width after resize: " + iNewWidth);
		});
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("Resize via Resize Button", function(assert) {
		var done = assert.async();
		var oColumn = this.oColumn;
		var oColumnDomRef = oColumn.getDomRef();
		var iWidthBeforeResize;

		function resize() {
			var $Resizer = oTable.$("rsz");
			var $Column = oColumn.$();

			iWidthBeforeResize = oColumnDomRef.offsetWidth;
			oColumn._openHeaderMenu(oColumnDomRef);
			return TableQUnitUtils.wait(0).then(function() {
				var $ResizeButton = $Column.find(".sapUiTableColResizer");
				var $ResizeButtonOffset = $ResizeButton.offset();
				var oResizeButton = $ResizeButton[0];
				var iResizeHandlerTop = Math.floor($ResizeButtonOffset.top + (oResizeButton.offsetHeight / 2));
				var iResizeButtonLeft = Math.floor($ResizeButtonOffset.left + (oResizeButton.offsetWidth / 2));

				qutils.triggerMouseEvent($ResizeButton, "mousedown", 1, 1, iResizeButtonLeft, iResizeHandlerTop, 0);
				qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeButtonLeft + 90, iResizeHandlerTop, 0);
				qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeButtonLeft + 90 + 40, iResizeHandlerTop, 0);
				qutils.triggerMouseEvent($Resizer, "mouseup", 1, 1, iResizeButtonLeft + 90 + 40, iResizeHandlerTop, 0);

				return new Promise(function(resolve) {
					oTable.attachEventOnce("rowsUpdated", resolve);
				});
			});
		}

		oColumn.attachEventOnce("columnMenuOpen", function() {
			oColumn.getMenu().close();
			this.stub(Device.system, "desktop").value(false);
			oColumn.setResizable(true);
			oCore.applyChanges();

			resize().then(function() {
				var iExpectedWidth = iWidthBeforeResize + 110;
				assert.ok(Math.abs(oColumn.getDomRef().offsetWidth - iExpectedWidth) < 5,
					"The column was resized to the correct width: " + iExpectedWidth);
			}).then(function() {
				oTable.getColumns()[0].setVisible(false);
				oCore.applyChanges();

				return new Promise(function(resolve) {
					oTable.attachEventOnce("rowsUpdated", resolve);
				});
			}).then(resize).then(function() {
				var iExpectedWidth = iWidthBeforeResize + 110;
				assert.ok(Math.abs(oColumn.getDomRef().offsetWidth - iExpectedWidth) < 5,
					"With invisible columns - The column was resized to the correct width: " + iExpectedWidth);

				done();
			});
		}.bind(this));

		oColumn.setSortProperty("dummy");
		oColumn._openHeaderMenu(oColumnDomRef);
	});

	QUnit.test("Skip trigger resize when resizing already started", function(assert) {
		oTable._getPointerExtension()._debug();
		var ColumnResizeHelper = oTable._getPointerExtension()._ColumnResizeHelper;
		oTable._bIsColumnResizerMoving = true;
		assert.ok(!oTable.$().hasClass("sapUiTableResizing"), "Before Trigger");
		ColumnResizeHelper.initColumnResizing(oTable);
		assert.ok(!oTable.$().hasClass("sapUiTableResizing"), "After Trigger");
	});

	QUnit.module("Menus", {
		beforeEach: function() {
			createTables();
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

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("Column header", function(assert) {
		var done = assert.async();
		var oElem = getColumnHeader(0, true);
		var oColumn = oTable.getColumns()[0];
		var oContextMenuEvent = this.spy(this.oPointerExtension._delegate, "oncontextmenu");
		var oContextMenuEventArgument;
		var bFirstItemHovered;

		oColumn.attachEventOnce("columnMenuOpen", function() {
			var oColumnMenu = oColumn.getMenu();
			oColumnMenu.close();

			// Open the menu with the left mouse button.
			this.triggerMouseDownEvent(oElem, 0);
			qutils.triggerMouseEvent(oElem, "click");
			assert.ok(oColumnMenu.isOpen(), "Menu is opened");
			bFirstItemHovered = oColumnMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
			assert.strictEqual(bFirstItemHovered, true, "The first item in the menu is hovered");

			// Close the menu with the left mouse button.
			this.triggerMouseDownEvent(oElem, 0);
			qutils.triggerMouseEvent(oElem, "click");
			assert.ok(!oColumnMenu.isOpen(), "Menu is closed");
			checkFocus(oElem, assert);

			// Open the menu with the right mouse button.
			this.triggerMouseDownEvent(oElem, 2);
			jQuery(oElem).trigger("contextmenu");
			assert.ok(oColumnMenu.isOpen(), "Menu is opened");
			bFirstItemHovered = oColumnMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
			assert.strictEqual(bFirstItemHovered, true, "The first item in the menu is hovered");
			oContextMenuEventArgument = oContextMenuEvent.args[0][0];
			oContextMenuEvent.resetHistory();
			assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

			// Close the menu with the right mouse button.
			this.triggerMouseDownEvent(oElem, 2);
			jQuery(oElem).trigger("contextmenu");
			assert.ok(!oColumnMenu.isOpen(), "Menu is closed");
			checkFocus(oElem, assert);
			oContextMenuEventArgument = oContextMenuEvent.args[0][0];
			oContextMenuEvent.resetHistory();
			assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

			// Open the menu with the left mouse button.
			this.triggerMouseDownEvent(oElem, 0);
			qutils.triggerMouseEvent(oElem, "click");
			assert.ok(oColumnMenu.isOpen(), "Menu is opened");
			bFirstItemHovered = oColumnMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
			assert.strictEqual(bFirstItemHovered, true, "The first item in the menu is hovered");

			// Close the menu with the right mouse button.
			this.triggerMouseDownEvent(oElem, 2);
			jQuery(oElem).trigger("contextmenu");
			assert.ok(!oColumnMenu.isOpen(), "Menu is closed");
			checkFocus(oElem, assert);
			oContextMenuEventArgument = oContextMenuEvent.args[0][0];
			oContextMenuEvent.resetHistory();
			assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

			oColumn.setVisible(false);
			oCore.applyChanges();
			oColumn = oTable.getColumns()[oTable.getColumns().length - 1];
			oColumn.setSortProperty("dummy");
			oElem = getColumnHeader(oTable._getVisibleColumns().indexOf(oColumn), true);
			this.triggerMouseDownEvent(oElem, 0);
			qutils.triggerMouseEvent(oElem, "click");
			oColumnMenu = oColumn.getMenu();
			assert.ok(oColumnMenu.isOpen(), "Menu is opened if there are invisible columns in the aggregation before this column");

			oColumn = oTable.getColumns()[1];
			oElem = getColumnHeader(1, true);
			// Try to open the menu with the left mouse button.
			this.triggerMouseDownEvent(oElem, 0);
			qutils.triggerMouseEvent(oElem, "click");
			oColumnMenu = oColumn.getMenu();
			assert.ok(!oColumnMenu, "No column menu");
			checkFocus(oElem, assert);

			// Try to open the menu with the right mouse button.
			this.triggerMouseDownEvent(oElem, 2);
			jQuery(oElem).trigger("contextmenu");
			assert.ok(!oColumnMenu, "No column menu");
			checkFocus(oElem, assert);

			oContextMenuEvent.resetHistory();
			done();
		}.bind(this));

		oColumn.setSortProperty("dummy");
		oColumn._openHeaderMenu(oColumn.getDomRef());
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("Column header if first row is a summary", function(assert) {
		return fakeSumRow(0, oTable).then(function() {
			var done = assert.async();
			var oElem = getColumnHeader(0, true);
			var oColumn = oTable.getColumns()[0];

			oColumn.attachEventOnce("columnMenuOpen", function() {
				var oColumnMenu = oColumn.getMenu();
				oColumnMenu.close();

				this.triggerMouseDownEvent(oElem, 0);
				qutils.triggerMouseEvent(oElem, "click");
				assert.ok(oColumnMenu.isOpen(), "Menu is opened");
				done();
			}.bind(this));

			oColumn.setSortProperty("dummy");
			oColumn._openHeaderMenu(oColumn.getDomRef());
		}.bind(this));
	});

	QUnit.test("Data cell", function(assert) {
		var oElem = getCell(0, 0);
		var oColumn = oTable.getColumns()[0];
		var oContextMenuEvent = this.spy(this.oPointerExtension._delegate, "oncontextmenu");
		var oContextMenuEventArgument;
		var bFirstItemHovered;

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
		bFirstItemHovered = oTable._oCellContextMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
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
		var aKnownClickableControls = this.oPointerExtension._KNOWNCLICKABLECONTROLS;
		var $CellContent = oTable.getRows()[0].getCells()[0].$();

		for (var i = 0; i < aKnownClickableControls.length; i++) {
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
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	/**
	 * @deprecated As of version 1.117
	 */
	QUnit.test("Column header", function(assert) {
		var done = assert.async();
		var oColumn = oTable._getVisibleColumns()[3];
		var bColumnReorderingTriggered = false;
		var oPointerExtension = oTable._getPointerExtension();
		var oOpenContextMenuSpy = this.spy(TableUtils.Menu, "openContextMenu");

		oColumn.setSortProperty('dummy');

		oPointerExtension.doReorderColumn = function() {
			bColumnReorderingTriggered = true;
		};

		qutils.triggerMouseEvent(getColumnHeader(3), "mousedown", 1, 1, 1, 1, 0);
		assert.ok(oPointerExtension._bShowMenu, "Show Menu flag set to be used in onSelect later");
		qutils.triggerMouseEvent(getColumnHeader(3), "click", 1, 1, 1, 1, 0);
		assert.ok(oOpenContextMenuSpy.calledOnce, "openContextMenu is called");
		setTimeout(function() {
			assert.ok(!oPointerExtension._bShowMenu, "ShowMenu flag reset again");
			assert.ok(bColumnReorderingTriggered, "Column Reordering triggered");

			assert.ok(oColumn.getMenu().isOpen(), "Menu is open");
			oTable.setEnableColumnReordering(false);
			oCore.applyChanges();
			bColumnReorderingTriggered = false;
			oOpenContextMenuSpy.resetHistory();

			qutils.triggerMouseEvent(getColumnHeader(3), "mousedown", 1, 1, 1, 1, 0);
			assert.ok(!oPointerExtension._bShowMenu, "Menu was opened -> _bShowMenu is false");
			qutils.triggerMouseEvent(getColumnHeader(3), "click", 1, 1, 1, 1, 0);
			assert.ok(oOpenContextMenuSpy.notCalled, "Menu was opened -> openContextMenu is not called");
			setTimeout(function() {
				assert.ok(!bColumnReorderingTriggered, "Column Reordering not triggered (enableColumnReordering == false)");
				done();
			}, 250);
		}, 250);
	});

	QUnit.test("Scrollbar", function(assert) {
		var oEvent = jQuery.Event({type: "mousedown"});
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
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Tree Icon", function(assert) {
		var done = assert.async();
		var oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding().isExpanded(0), "!Expanded");
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			assert.ok(false, "_doSelect was not called");
		};

		var fnHandler = function() {
			oCore.applyChanges();
			assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
			assert.ok(oTreeTable.getBinding().isExpanded(0), "Expanded");
			oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
			oExtension._ExtensionHelper.__handleClickSelection = null;
			done();
		};

		oTreeTable.attachEventOnce("rowsUpdated", fnHandler);
		var oTreeIcon = oTreeTable.getRows()[0].getDomRef("col0").querySelector(".sapUiTableTreeIcon");
		qutils.triggerMouseEvent(oTreeIcon, "tap");
	});

	QUnit.test("Group Header", function(assert) {
		var done = assert.async();
		var oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		oTreeTable.setUseGroupMode(true);
		oCore.applyChanges();
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			assert.ok(false, "_doSelect was not called");
		};

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding().isExpanded(0), "!Expanded");

		var fnHandler = function() {
			oCore.applyChanges();
			assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
			assert.ok(oTreeTable.getBinding().isExpanded(0), "Expanded");
			oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
			oExtension._ExtensionHelper.__handleClickSelection = null;
			done();
		};

		oTreeTable.attachEventOnce("rowsUpdated", fnHandler);
		var oGroupHeader = oTreeTable.getRows()[0].getDomRef("groupHeader");
		qutils.triggerMouseEvent(oGroupHeader, "tap");
	});

	QUnit.test("Analytical Table Sum", function(assert) {
		var oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		var bSelected = false;
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			bSelected = true;
		};

		return fakeSumRow(0, oTreeTable).then(function() {
			qutils.triggerMouseEvent(oTreeTable.getDomRef("rowsel0"), "tap");
			assert.ok(!bSelected, "Selection was not performed");

			oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
			oExtension._ExtensionHelper.__handleClickSelection = null;
		});
	});

	QUnit.test("Mobile Group Menu Button", function(assert) {
		var oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		var bSelected = false;
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			bSelected = true;
		};

		var oOpenContextMenu = this.spy(TableUtils.Menu, "openContextMenu");
		var $FakeButton = TableUtils.getRowColCell(oTreeTable, 0, 0).cell.$();

		$FakeButton.addClass("sapUiTableGroupMenuButton");
		qutils.triggerMouseEvent($FakeButton, "tap");
		assert.ok(!bSelected, "Selection was not performed");
		assert.ok(oOpenContextMenu.calledOnce, "Context Menu was opened");

		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;

		oOpenContextMenu.restore();
	});

	QUnit.test("Cell + Cell Click Event", function(assert) {
		var oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		var iSelectCount = 0;
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			iSelectCount++;
		};

		var fnClickHandler, bClickHandlerCalled;

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

		var oRowColCell = TableUtils.getRowColCell(oTreeTable, 1, 2);
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
		var $Cell = oRowColCell.cell.$();
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
		var oEvent = jQuery.Event({type: "tap"});
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

		var oExtension = oTable._getPointerExtension();
		oExtension._debug();
		var aKnownClickableControls = oExtension._KNOWNCLICKABLECONTROLS;

		$Cell = oRowColCell.cell.$();
		for (var i = 0; i < aKnownClickableControls.length; i++) {
			$Cell.toggleClass(aKnownClickableControls[i], true);
			qutils.triggerMouseEvent($Cell, "tap");
			assert.equal(iSelectCount, 3, iSelectCount + " selections performed");
			assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");
			$Cell.toggleClass(aKnownClickableControls[i], false);
		}

		oRowColCell.cell.getEnabled = function() { return false; };
		$Cell = oRowColCell.cell.$();
		var iStartCount = iSelectCount;
		for (var i = 0; i < aKnownClickableControls.length; i++) {
			$Cell.toggleClass(aKnownClickableControls[i], true);
			qutils.triggerMouseEvent($Cell, "tap");
			assert.equal(iSelectCount, iStartCount + i + 1, iSelectCount + " selections performed");
			assert.ok(bClickHandlerCalled, "Cell Click Event handler called");
			$Cell.toggleClass(aKnownClickableControls[i], false);
		}

		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;
	});

	QUnit.test("Single Selection", function(assert) {
		oTable.clearSelection();
		oTable.setSelectionBehavior(tableLibrary.SelectionBehavior.Row);
		oTable.setSelectionMode(tableLibrary.SelectionMode.Single);
		initRowActions(oTable, 2, 2);
		oCore.applyChanges();

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

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.test("Single Selection - legacyMultiSelection", function(assert) {
		oTable.clearSelection();
		oTable.setSelectionBehavior(tableLibrary.SelectionBehavior.Row);
		oTable.setSelectionMode(tableLibrary.SelectionMode.Single);
		initRowActions(oTable, 2, 2);
		oCore.applyChanges();

		oTable._enableLegacyMultiSelection();
		qutils.triggerEvent("tap", getCell(0, 0), {metaKey: true, ctrlKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [0],
			"Ctrl+Click on data cell in first row with legacy multi selection enabled -> First row selected");
	});

	QUnit.test("MultiToggle Selection - Range", function(assert) {
		oTable.clearSelection();
		oTable.setSelectionBehavior(tableLibrary.SelectionBehavior.Row);
		initRowActions(oTable, 2, 2);
		oCore.applyChanges();

		qutils.triggerMouseEvent(getCell(0, 0), "tap");
		assert.ok(oTable.isIndexSelected(0), "Click on first row -> Row selected");

		oTable.setFirstVisibleRow(3); // Scroll down 3 rows
		oCore.applyChanges();
		qutils.triggerEvent("tap", getCell(2, 0), {shiftKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 3, 4, 5], "Range selection with Shift + Click selected the correct rows");
		assert.strictEqual(window.getSelection().toString(), "", "Range selection with Shift + Click did not select text");

		qutils.triggerMouseEvent(getCell(0, 0), "tap"); // Deselect row with index 3
		qutils.triggerMouseEvent(getCell(0, 0), "tap"); // Select row with index 3
		qutils.triggerMouseEvent(getCell(0, 0), "tap"); // Deselect row with index 3
		qutils.triggerEvent("tap", getCell(2, 0), {shiftKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1, 2, 4, 5], "Range selection with Shift + Click did not deselect");
	});

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.test("MultiToggle Selection - Range - legacyMultiSelection", function(assert) {
		oTable.clearSelection();
		oTable.setSelectionBehavior(tableLibrary.SelectionBehavior.Row);
		initRowActions(oTable, 2, 2);
		oCore.applyChanges();

		oTable._enableLegacyMultiSelection();
		oTable.setFirstVisibleRow(0);
		oCore.applyChanges();
		qutils.triggerMouseEvent(getCell(0, 0), "tap"); // Select row with index 5
		qutils.triggerEvent("tap", getCell(2, 0), {shiftKey: true, ctrlKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1, 2],
			"Range selection with Shift + Click selected the correct rows,"
			+ "even though Ctrl was also pressed and legacy multi selection was enabled");
		assert.strictEqual(window.getSelection().toString(), "",
			"Range selection with Shift + Click did not select text");
	});

	QUnit.test("MultiToggle Selection - Toggle", function(assert) {
		oTable.clearSelection();
		oTable.setSelectionBehavior(tableLibrary.SelectionBehavior.Row);
		initRowActions(oTable, 2, 2);
		oCore.applyChanges();

		qutils.triggerMouseEvent(getCell(0, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [0], "Click on unselected row with index 0");

		qutils.triggerMouseEvent(getCell(1, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1], "Click on unselected row with index 1");

		qutils.triggerMouseEvent(getCell(0, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [1], "Click on selected row with index 0");
	});

	/**
	 * @deprecated As of version 1.115
	 */
	QUnit.test("Legacy Multi Selection", function(assert) {
		oTable.clearSelection();
		oTable.setSelectionBehavior(tableLibrary.SelectionBehavior.Row);
		initRowActions(oTable, 2, 2);
		oCore.applyChanges();

		oTable._enableLegacyMultiSelection();

		qutils.triggerMouseEvent(getCell(0, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [0], "Click on unselected row with index 0");

		qutils.triggerMouseEvent(getCell(1, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [1], "Click on unselected row with index 1");

		qutils.triggerEvent("tap", getCell(2, 0), {metaKey: true, ctrlKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [1, 2], "Ctrl + Click on unselected row with index 2");

		qutils.triggerEvent("tap", getCell(0, 0), {metaKey: true, ctrlKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1, 2], "Ctrl + Click on unselected row with index 0");

		qutils.triggerEvent("tap", getCell(1, 0), {metaKey: true, ctrlKey: true});
		assert.deepEqual(oTable.getSelectedIndices(), [0, 2], "Ctrl + Click on selected row with index 1");

		qutils.triggerMouseEvent(getCell(2, 0), "tap");
		assert.deepEqual(oTable.getSelectedIndices(), [2], "Click on selected row with index 2");
	});

	QUnit.module("Column Reordering", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	function computeSettingsForReordering(oTable, iIndex, bIncreaseIndex) {
		var oSettings = {
			column: oTable._getVisibleColumns()[iIndex],
			relatedColumn: oTable._getVisibleColumns()[bIncreaseIndex ? iIndex + 1 : iIndex - 1]
		};

		var initialXPos = 2; //Move mouse 2px from left onto the column

		oSettings.top = Math.floor(oSettings.column.getDomRef().getBoundingClientRect().top);
		oSettings.left = Math.floor(oSettings.column.getDomRef().getBoundingClientRect().left) + initialXPos;
		oSettings.breakeven = (bIncreaseIndex ? oSettings.column.$().outerWidth() : 0) - initialXPos + oSettings.relatedColumn.$().outerWidth() / 2;

		return oSettings;
	}

	QUnit.test("Reordering via Drag&Drop - increase Index", function(assert) {
		var done = assert.async();
		var oSettings = computeSettingsForReordering(oTable, 2, true);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function() {
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
			setTimeout(function() {
				oCore.applyChanges();
				assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed because not dragged enough");

				qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
				setTimeout(function() {
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
					assert.equal(oTable.indexOfColumn(oColumn), 3, "Index of column changed");

					oCore.applyChanges();
					assert.strictEqual(document.activeElement, oColumn.getDomRef(), "Focused element");
					assert.strictEqual(oTable._getKeyboardExtension()._itemNavigation.getFocusedDomRef(), oColumn.getDomRef(),
						"Focused element in item navigation");
					done();
				}, 250);
			}, 100);
		}, 250);
	});

	QUnit.test("Reordering via Drag&Drop - decrease Index", function(assert) {
		var done = assert.async();
		var oSettings = computeSettingsForReordering(oTable, 2, false);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function() {
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
			setTimeout(function() {
				oCore.applyChanges();
				assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed because not dragged enough");

				qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
				setTimeout(function() {
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
					assert.equal(oTable.indexOfColumn(oColumn), 1, "Index of column changed");

					oCore.applyChanges();
					assert.strictEqual(document.activeElement, oColumn.getDomRef(), "Focused element");
					assert.strictEqual(oTable._getKeyboardExtension()._itemNavigation.getFocusedDomRef(), oColumn.getDomRef(),
						"Focused element in item navigation");
					done();
				}, 250);
			}, 100);
		}, 250);
	});

	QUnit.test("No Reordering of fixed columns (within fixed)", function(assert) {
		var done = assert.async();
		oTable.setFixedColumnCount(4);
		oCore.applyChanges();

		var oSettings = computeSettingsForReordering(oTable, 2, true);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function() {
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
			setTimeout(function() {
				oCore.applyChanges();
				assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
				done();
			}, 100);
		}, 250);
	});

	QUnit.test("No Reordering of fixed columns (fixed to not fixed)", function(assert) {
		var done = assert.async();
		oTable.setFixedColumnCount(3);
		oCore.applyChanges();

		var oSettings = computeSettingsForReordering(oTable, 2, true);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function() {
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
			setTimeout(function() {
				oCore.applyChanges();
				assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
				done();
			}, 100);
		}, 250);
	});

	QUnit.test("No Reordering of fixed columns (not fixed to fixed)", function(assert) {
		var done = assert.async();
		oTable.setFixedColumnCount(2);
		oCore.applyChanges();

		var oSettings = computeSettingsForReordering(oTable, 2, false);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function() {
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
			setTimeout(function() {
				oCore.applyChanges();
				assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
				done();
			}, 100);
		}, 250);
	});

	QUnit.test("TreeTable - No Reordering via Drag&Drop of first column - increase index", function(assert) {
		var done = assert.async();
		oTreeTable.setFixedColumnCount(0);
		oCore.applyChanges();

		var oSettings = computeSettingsForReordering(oTreeTable, 0, true);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function() {
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
			setTimeout(function() {
				oCore.applyChanges();
				assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Index of column not changed because not dragged enough");

				qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
				setTimeout(function() {
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
					setTimeout(function() {
						oCore.applyChanges();
						assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Index of column not changed");
						done();
					}, 100);
				}, 250);

			}, 100);
		}, 250);
	});

	QUnit.test("TreeTable - No Reordering via Drag&Drop of first column - decrease index", function(assert) {
		var done = assert.async();
		oTreeTable.setFixedColumnCount(0);
		oCore.applyChanges();

		var oSettings = computeSettingsForReordering(oTreeTable, 1, false);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTreeTable.indexOfColumn(oColumn), 1, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function() {
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
			setTimeout(function() {
				oCore.applyChanges();
				assert.equal(oTreeTable.indexOfColumn(oColumn), 1, "Index of column not changed");
				done();
			}, 100);
		}, 250);
	});

	QUnit.module("Row Hover Effect", {
		beforeEach: function() {
			createTables();
			oTable.setSelectionBehavior("Row");
			oTable.rerender();
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

	QUnit.test("Row Hover Effect depending on SelectionMode and SelectionBehavior", function(assert) {
		oTable.setSelectionMode("None");
		oTable.rerender();
		getCell(0, 2).trigger("mouseover");
		assert.ok(!getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		getCell(0, 2).trigger("mouseout");
		oTable.setSelectionBehavior("RowOnly");
		oTable.rerender();
		getCell(0, 2).trigger("mouseover");
		assert.ok(!getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		getCell(0, 2).trigger("mouseout");
		oTable.setSelectionMode("MultiToggle");
		oTable.setSelectionBehavior("Row");
		oTable.rerender();
		getCell(0, 2).trigger("mouseover");
		assert.ok(getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		getCell(0, 2).trigger("mouseout");
		oTable.setSelectionBehavior("RowOnly");
		oTable.rerender();
		getCell(0, 2).trigger("mouseover");
		assert.ok(getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		getCell(0, 2).trigger("mouseout");
		oTable.setSelectionMode("None");
		oTable.setSelectionBehavior("RowSelector");
		oTable.rerender();
		oTable.attachCellClick(function() {});
		getCell(0, 2).trigger("mouseover");
		assert.ok(getRowHeader(0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
	});

	QUnit.module("Helpers", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("_debug()", function(assert) {
		var oExtension = oTable._getPointerExtension();
		assert.ok(!oExtension._ExtensionHelper, "_ExtensionHelper: No debug mode");
		assert.ok(!oExtension._ColumnResizeHelper, "_ColumnResizeHelper: No debug mode");
		assert.ok(!oExtension._ReorderHelper, "_ReorderHelper: No debug mode");
		assert.ok(!oExtension._ExtensionDelegate, "_ExtensionDelegate: No debug mode");
		assert.ok(!oExtension._RowHoverHandler, "_RowHoverHandler: No debug mode");
		assert.ok(!oExtension._KNOWNCLICKABLECONTROLS, "_KNOWNCLICKABLECONTROLS: No debug mode");

		oExtension._debug();
		assert.ok(!!oExtension._ExtensionHelper, "_ExtensionHelper: Debug mode");
		assert.ok(!!oExtension._ColumnResizeHelper, "_ColumnResizeHelper: Debug mode");
		assert.ok(!!oExtension._ReorderHelper, "_ReorderHelper: Debug mode");
		assert.ok(!!oExtension._ExtensionDelegate, "_ExtensionDelegate: Debug mode");
		assert.ok(!!oExtension._RowHoverHandler, "_RowHoverHandler: Debug mode");
		assert.ok(!!oExtension._KNOWNCLICKABLECONTROLS, "_KNOWNCLICKABLECONTROLS: Debug mode");
	});

	QUnit.test("_getEventPosition()", function(assert) {
		oTable._getPointerExtension()._debug();
		var oExtensionHelper = oTable._getPointerExtension()._ExtensionHelper;

		var oEvent,
			oPos,
			x = 15,
			y = 20,
			oCoord = {pageX: x, pageY: y};

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

	QUnit.module("Destruction", {
		beforeEach: function() {
			createTables();
		}
	});

	QUnit.test("destroy()", function(assert) {
		var oExtension = oTable._getPointerExtension();
		oTable.destroy();
		assert.ok(!oExtension.getTable(), "Table cleared");
		assert.ok(!oExtension._delegate, "Delegate cleared");
		oTreeTable.destroy();
	});
});