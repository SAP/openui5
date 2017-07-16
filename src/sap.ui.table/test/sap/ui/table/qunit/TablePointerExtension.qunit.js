/*global QUnit,qutils,oTable,oTreeTable*/

(function () {
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

//************************************************************************
// Test Code
//************************************************************************

	sap.ui.test.qunit.delayTestStart(500);


	QUnit.module("Initialization", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function () {
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


	QUnit.module("VisibleRowCountMode 'Interactive'", {
		beforeEach: function() {
			jQuery.sap.byId("content").toggleClass("StablePosition", true);
			createTables(true);
			oTable.placeAt("content");
			oTable.setVisibleRowCountMode("Interactive");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			destroyTables();
			jQuery.sap.byId("content").toggleClass("StablePosition", false);
		}
	});

	QUnit.test("resize", function(assert) {
		function testAdaptations(bDuringResize) {
			assert.equal(jQuery.sap.byId(oTable.getId() + "-rzoverlay").length, bDuringResize ? 1 : 0, "The handle to resize overlay is" + (bDuringResize ? "" : " not") + " visible");
			assert.equal(jQuery.sap.byId(oTable.getId() + "-ghost").length, bDuringResize ? 1 : 0, "The handle to resize ghost is" + (bDuringResize ? "" : " not") + " visible");

			var oEvent = jQuery.Event({type : "selectstart"});
			oEvent.target = oTable.getDomRef();
			$Table.trigger(oEvent);
			assert.ok(oEvent.isDefaultPrevented() && bDuringResize || !oEvent.isDefaultPrevented() && !bDuringResize, "Prevent Default of selectstart event");
			assert.ok(oEvent.isPropagationStopped() && bDuringResize || !oEvent.isPropagationStopped() && !bDuringResize, "Stopped Propagation of selectstart event");
			var sUnselectable = jQuery(document.body).attr("unselectable") || "off";
			assert.ok(sUnselectable == (bDuringResize ? "on" : "off"), "Text Selection switched " + (bDuringResize ? "off" : "on"));
		}

		var $Table = oTable.$();
		var $Resizer = $Table.find('.sapUiTableHeightResizer');
		var iInitialHeight = $Table.height();
		var iY = $Resizer.offset().top;

		assert.equal($Resizer.length, 1, "The handle to resize the table is visible");
		assert.equal($Table.offset().top, 0, "Initial Offset");
		assert.equal(oTable.getVisibleRowCount(), 3, "Initial visible rows");
		testAdaptations(false);

		qutils.triggerMouseEvent(oTable.$("sb"), "mousedown", 0, 0, 10, iY, 0);
		for (var i = 0; i < 10; i++) {
			iY += 10;
			qutils.triggerMouseEvent($Table, "mousemove", 0, 0, 10, iY, 0);
			if (i == 5) { // Just check somewhere in between
				testAdaptations(true);
			}
		}
		qutils.triggerMouseEvent($Table, "mouseup", 0, 0, 10, iY + 10, 0);
		// resized table by 110px, in cozy mode this allows 2 rows to be added
		assert.equal(oTable.getVisibleRowCount(), 5, "Visible rows after resize");
		assert.ok(iInitialHeight < $Table.height(), "Height of the table increased");
		testAdaptations(false);
	});

	QUnit.module("Column Resizing", {
		beforeEach: function() {
			this.bOriginalSystemDesktop = sap.ui.Device.system.desktop;

			jQuery.sap.byId("content").toggleClass("StablePosition", true);
			createTables(true);
			oTable.placeAt("content");

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

			sap.ui.getCore().applyChanges();

			// Extend auto resize logic to know about the test control
			sap.ui.table.TablePointerExtension._fnCheckTextBasedControl = function(oControl) {
				return oControl.getMetadata().getName() === "TestControl";
			};
		},
		afterEach: function () {
			sap.ui.Device.system.desktop = this.bOriginalSystemDesktop;

			destroyTables();
			jQuery.sap.byId("content").toggleClass("StablePosition", false);
			sap.ui.table.TablePointerExtension._fnCheckTextBasedControl = null;
		}
	});

	function moveResizer(oColumn, assert, bExpect, iIndex) {
		qutils.triggerEvent("mousemove", oColumn.getId(), {
			clientX : Math.floor(oColumn.getDomRef().getBoundingClientRect().left + 10),
			clientY : Math.floor(oColumn.getDomRef().getBoundingClientRect().top + 100)
		});

		if (assert) {
			var bCorrect = Math.abs(parseInt(oTable.$("rsz").css("left"), 10) - 100 - oColumn.getDomRef().getBoundingClientRect().left) < 5;
			assert.ok(bExpect && bCorrect || !bExpect && !bCorrect, "Position of Resizer");
			assert.equal(oTable._iLastHoveredColumnIndex, iIndex, "Index of last hovered resizable table");
		}
	}

	QUnit.test("Moving Resizer", function(assert){
		var aVisibleColumns = oTable._getVisibleColumns();
		moveResizer(aVisibleColumns[0], assert, true, 0);
		moveResizer(aVisibleColumns[1], assert, false, 0);
		assert.ok(Math.abs(parseInt(oTable.$("rsz").css("left"), 10) - 100 - aVisibleColumns[0].getDomRef().getBoundingClientRect().left) < 10, "Position of Resizer still on column 0");
		moveResizer(aVisibleColumns[2], assert, true, 2);

	});

	QUnit.test("Automatic Column Resize via Double Click", function(assert){
		var done = assert.async();
		sap.ui.Device.system.desktop = true;

		function triggerDoubleClick(bExpect, iIndex) {
			// Move resizer to correct column
			moveResizer(oColumn, assert, bExpect, iIndex);
			// Double Click on resizer
			qutils.triggerMouseEvent(oTable.$("rsz"), "dblclick");
		}

		var oColumn = this.oColumn;
		assert.ok(!oColumn.getAutoResizable(), "Column is not yet autoresizable");
		assert.ok(!oColumn.getResizable(), "Column is not yet resizable");

		var iWidth = oColumn.$().width();
		assert.ok(Math.abs(iWidth - 100) < 10, "check column width before resize: " + iWidth);
		triggerDoubleClick(false, 0);

		setTimeout(function() {
			assert.equal(oColumn.$().width(), iWidth, "check column width after resize: " + iWidth);
			oColumn.setAutoResizable(true);
			sap.ui.getCore().applyChanges();
			assert.ok(oColumn.getAutoResizable(), "Column is autoresizable");
			assert.ok(!oColumn.getResizable(), "Column is not yet resizable");
			triggerDoubleClick(false, 0);

			setTimeout(function() {
				assert.equal(oColumn.$().width(), iWidth, "check column width after resize: " + iWidth);
				oColumn.setResizable(true);
				sap.ui.getCore().applyChanges();
				assert.ok(oColumn.getAutoResizable(), "Column is autoresizable");
				assert.ok(oColumn.getResizable(), "Column is resizable");
				sap.ui.Device.system.desktop = false;
				triggerDoubleClick(true, 1);

				setTimeout(function() {
					assert.equal(oColumn.$().width(), iWidth, "check column width after resize: " + iWidth);

					sap.ui.Device.system.desktop = true;
					triggerDoubleClick(true, 1);

					setTimeout(function() {
						iWidth = oColumn.$().width();
						assert.ok(Math.abs(iWidth - 270) < 40, "check column width after resize: " + iWidth);
						done();
					}, 50);
				}, 50);
			}, 50);
		}, 50);
	});

	QUnit.test("Automatic Column Resize via API", function(assert){
		var done = assert.async();
		var oColumn = this.oColumn;
		assert.ok(!oColumn.getAutoResizable(), "Column is not yet autoresizable");
		assert.ok(!oColumn.getResizable(), "Column is not yet resizable");

		var iWidth = oColumn.$().width();
		assert.ok(Math.abs(iWidth - 100) < 10, "check column width before resize: " + iWidth);
		oTable.autoResizeColumn(1);

		setTimeout(function() {
			assert.equal(oColumn.$().width(), iWidth, "check column width after resize: " + iWidth);
			oColumn.setAutoResizable(true);
			sap.ui.getCore().applyChanges();
			assert.ok(oColumn.getAutoResizable(), "Column is autoresizable");
			assert.ok(!oColumn.getResizable(), "Column is not yet resizable");
			oTable.autoResizeColumn(1);

			setTimeout(function() {
				assert.equal(oColumn.$().width(), iWidth, "check column width after resize: " + iWidth);
				oColumn.setResizable(true);
				sap.ui.getCore().applyChanges();
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
		var done = assert.async();
		var oColumn = this.oColumn;
		var $Resizer = oTable.$("rsz");

		// resizer should be way out of screen when the table gets rendered
		assert.equal(oTable.$("rsz").position().left, "-5", "Resizer is at the correct initial position");

		assert.ok(!oColumn.getAutoResizable(), "Column is not yet autoresizable");
		assert.ok(!oColumn.getResizable(), "Column is not yet resizable");

		var iWidth = oColumn.$().width();
		assert.ok(Math.abs(iWidth - 100) < 10, "check column width before resize: " + iWidth);

		// Resizer moved to the correct position when column is resizable
		moveResizer(oColumn, assert, false, 0);
		oColumn.setAutoResizable(true);
		sap.ui.getCore().applyChanges();
		moveResizer(oColumn, assert, false, 0);
		oColumn.setResizable(true);
		sap.ui.getCore().applyChanges();
		moveResizer(oColumn, assert, true, 1);

		// drag resizer to resize column
		var $Resizer = oTable.$("rsz");
		var iResizeHandlerTop = Math.floor(oColumn.getDomRef().getBoundingClientRect().top + 100);
		var iResizeHandlerLeft = $Resizer.position().left;
		qutils.triggerMouseEvent($Resizer, "mousedown", 1, 1, iResizeHandlerLeft, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeHandlerLeft + 90, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeHandlerLeft + 90 + 40, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mouseup", 1, 1, iResizeHandlerLeft + 90 + 40, iResizeHandlerTop, 0);

		setTimeout(function() {
			var iNewWidth = oColumn.$().width();
			assert.ok(Math.abs(iNewWidth - iWidth - 90 - 40) < 5, "check column width after resize: " + iNewWidth);
			done();
		}, 50);
	});

	QUnit.test("Resize via Resize Button", function(assert) {
		var done = assert.async();
		var oColumn = this.oColumn;
		oColumn.setResizable(true);
		sap.ui.getCore().applyChanges();

		var iWidth = oColumn.$().width();
		assert.ok(Math.abs(iWidth - 100) < 10, "check column width before resize: " + iWidth);

		var $Resizer = oTable.$("rsz");
		var iResizeHandlerTop = Math.floor(oColumn.getDomRef().getBoundingClientRect().top + 100);
		sap.ui.Device.system.desktop = false;
		sap.ui.table.TableUtils.Menu.openContextMenu(oTable, oColumn.getDomRef(), false);
		var $ResizeButton = oColumn.$().find(".sapUiTableColResizer");
		var iResizeButtonLeft = Math.floor(oColumn.getDomRef().getBoundingClientRect().left + 100);
		qutils.triggerMouseEvent($ResizeButton, "mousedown", 1, 1, iResizeButtonLeft, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeButtonLeft + 90, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeButtonLeft + 90 + 40, iResizeHandlerTop, 0);
		qutils.triggerMouseEvent($Resizer, "mouseup", 1, 1, iResizeButtonLeft + 90 + 40, iResizeHandlerTop, 0);

		setTimeout(function() {
			var iNewWidth = oColumn.$().width();
			assert.ok(Math.abs(iNewWidth - iWidth - 90 - 40) < 5, "check column width after resize: " + iNewWidth);
			done();
		}, 50);
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
		afterEach: function () {
			destroyTables();
		},

		/**
		 * Triggers a mouse down event on the passed element simulating the specified button.
		 *
		 * @param {jQuery|HTMLElement} oElement The target of the event.
		 * @param {int} iButton 0 = Left mouse button,
		 * 						1 = Middle mouse button,
		 * 						2 = Right mouse button
		 */
		triggerMouseDownEvent: function(oElement, iButton) {
			qutils.triggerMouseEvent(oElement, "mousedown", null, null, null, null, iButton);
		}
	});

	QUnit.test("Column Header", function(assert) {
		var oElem = getColumnHeader(0, true);
		var oColumn = oTable.getColumns()[0];
		var oColumnMenu = oColumn.getMenu();
		var oContextMenuEvent = this.spy(this.oPointerExtension._delegate, "oncontextmenu");
		var oContextMenuEventArgument;
		var bFirstItemHovered;

		// Try to open the menu with the left mouse button.
		this.triggerMouseDownEvent(oElem, 0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.ok(!oColumnMenu.bOpen, "Menu is closed");
		checkFocus(oElem, assert);

		// Try to open the menu with the right mouse button.
		this.triggerMouseDownEvent(oElem, 2);
		jQuery(oElem).trigger("contextmenu");
		assert.ok(!oColumnMenu.bOpen, "Menu is closed");
		oContextMenuEventArgument = oContextMenuEvent.args[0][0];
		oContextMenuEvent.reset();
		assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");
		checkFocus(oElem, assert);

		oColumn.setSortProperty("dummy");
		assert.ok(!oColumnMenu.bOpen, "Menu is closed");

		// Open the menu with the left mouse button.
		this.triggerMouseDownEvent(oElem, 0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.ok(oColumnMenu.bOpen, "Menu is opened");
		bFirstItemHovered = oColumnMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
		assert.strictEqual(!bFirstItemHovered, true, "The first item in the menu is not hovered");

		// Close the menu with the left mouse button.
		this.triggerMouseDownEvent(oElem, 0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.ok(!oColumnMenu.bOpen, "Menu is closed");
		checkFocus(oElem, assert);

		// Open the menu with the right mouse button.
		this.triggerMouseDownEvent(oElem, 2);
		jQuery(oElem).trigger("contextmenu");
		assert.ok(oColumnMenu.bOpen, "Menu is opened");
		bFirstItemHovered = oColumnMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
		assert.strictEqual(!bFirstItemHovered, true, "The first item in the menu is not hovered");
		oContextMenuEventArgument = oContextMenuEvent.args[0][0];
		oContextMenuEvent.reset();
		assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

		// Close the menu with the right mouse button.
		this.triggerMouseDownEvent(oElem, 2);
		jQuery(oElem).trigger("contextmenu");
		assert.ok(!oColumnMenu.bOpen, "Menu is closed");
		checkFocus(oElem, assert);
		oContextMenuEventArgument = oContextMenuEvent.args[0][0];
		oContextMenuEvent.reset();
		assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

		// Open the menu with the left mouse button.
		this.triggerMouseDownEvent(oElem, 0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.ok(oColumnMenu.bOpen, "Menu is opened");
		bFirstItemHovered = oColumnMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
		assert.strictEqual(!bFirstItemHovered, true, "The first item in the menu is not hovered");

		// Close the menu with the right mouse button.
		this.triggerMouseDownEvent(oElem, 2);
		jQuery(oElem).trigger("contextmenu");
		assert.ok(!oColumnMenu.bOpen, "Menu is closed");
		checkFocus(oElem, assert);
		oContextMenuEventArgument = oContextMenuEvent.args[0][0];
		oContextMenuEvent.reset();
		assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");
	});

	QUnit.test("Data Cell", function(assert) {
		var oElem = getCell(0, 0);
		var oColumn = oTable.getColumns()[0];
		var oContextMenuEvent = this.spy(this.oPointerExtension._delegate, "oncontextmenu");
		var oContextMenuEventArgument;
		var bFirstItemHovered;

		// Try to open the menu with the left mouse button.
		this.triggerMouseDownEvent(oElem, 0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.strictEqual(oTable._oCellContextMenu, undefined, "Menu is not yet created");
		checkFocus(oElem, assert);

		// Try to open the menu with the right mouse button.
		this.triggerMouseDownEvent(oElem, 2);
		jQuery(oElem).trigger("contextmenu");
		assert.strictEqual(oTable._oCellContextMenu, undefined, "Menu is not yet created");
		oContextMenuEventArgument = oContextMenuEvent.args[0][0];
		oContextMenuEvent.reset();
		assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");
		checkFocus(oElem, assert);

		oTable.setEnableCellFilter(true);
		this.stub(oColumn, "isFilterableByMenu").returns(true);

		// Try to open the menu with the left mouse button.
		this.triggerMouseDownEvent(oElem, 0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.strictEqual(oTable._oCellContextMenu, undefined, "Menu is not yet created");
		checkFocus(oElem, assert);

		// Open the menu with the right mouse button.
		this.triggerMouseDownEvent(oElem, 2);
		jQuery(oElem).trigger("contextmenu");
		assert.ok(oTable._oCellContextMenu.bOpen, "Menu is opened");
		bFirstItemHovered = oTable._oCellContextMenu.$().find("li:first").hasClass("sapUiMnuItmHov");
		assert.strictEqual(!bFirstItemHovered, true, "The first item in the menu is not hovered");
		oContextMenuEventArgument = oContextMenuEvent.args[0][0];
		oContextMenuEvent.reset();
		assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

		// Close the menu with the right mouse button.
		this.triggerMouseDownEvent(oElem, 2);
		jQuery(oElem).trigger("contextmenu");
		assert.ok(!oTable._oCellContextMenu.bOpen, "Menu is closed");
		checkFocus(oElem, assert);
		oContextMenuEventArgument = oContextMenuEvent.args[0][0];
		oContextMenuEvent.reset();
		assert.ok(oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was prevented");

		// If an interactive/clickable element inside a data cell was clicked, open the default context menu instead of the column or cell context menu.
		var aKnownClickableControls = this.oPointerExtension._KNOWNCLICKABLECONTROLS;
		var $CellContent = oTable.getRows()[0].getCells()[0].$();

		for (var i = 0; i < aKnownClickableControls.length; i++) {
			$CellContent.toggleClass(aKnownClickableControls[i], true);
			this.triggerMouseDownEvent($CellContent, 2);
			jQuery($CellContent).trigger("contextmenu");
			assert.ok(!oTable._oCellContextMenu.bOpen, "Menu is closed");
			oContextMenuEventArgument = oContextMenuEvent.args[0][0];
			oContextMenuEvent.reset();
			assert.ok(!oContextMenuEventArgument.isDefaultPrevented(), "Opening of the default context menu was not prevented");
			$CellContent.toggleClass(aKnownClickableControls[i], false);
		}
	});

	QUnit.module("Mousedown", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function () {
			destroyTables();
		}
	});

	QUnit.test("Columnheader", function(assert){
		var done = assert.async();
		var oColumn = oTable._getVisibleColumns()[3];
		var bColumnReorderingTriggered = false;
		var oPointerExtension = oTable._getPointerExtension();

		oPointerExtension.doReorderColumn = function() {
			bColumnReorderingTriggered = true;
		};

		qutils.triggerMouseEvent(getColumnHeader(3), "mousedown", 1, 1, 1, 1, 0);
		assert.ok(oPointerExtension._bShowMenu, "Show Menu flag set to be used in onSelect later");
		setTimeout(function(){
			assert.ok(!oPointerExtension._bShowMenu, "ShowMenu flag reset again");
			assert.ok(bColumnReorderingTriggered, "Column Reordering triggered");

			oColumn.getMenu().bOpen = true;
			oTable.setEnableColumnReordering(false);
			sap.ui.getCore().applyChanges();
			bColumnReorderingTriggered = false;

			qutils.triggerMouseEvent(getColumnHeader(3), "mousedown", 1, 1, 1, 1, 0);
			assert.ok(!oPointerExtension._bShowMenu, "Menu was opened -> _bShowMenu is false");
			setTimeout(function(){
				assert.ok(!bColumnReorderingTriggered, "Column Reordering not triggered (enableColumnReordering == false)");
				done();
			}, 250);
		}, 250);
	});

	QUnit.test("Scrollbar", function(assert){
		var oEvent = jQuery.Event({type : "mousedown"});
		oEvent.target = oTable._getScrollExtension().getHorizontalScrollbar();
		oEvent.button = 0;
		jQuery(oEvent.target).trigger(oEvent);
		assert.ok(oEvent.isDefaultPrevented(), "Prevent Default of mousedown on horizontal scrollbar");
		oEvent = jQuery.Event({type : "mousedown"});
		oEvent.target = oTable._getScrollExtension().getVerticalScrollbar();
		oEvent.button = 0;
		jQuery(oEvent.target).trigger(oEvent);
		assert.ok(oEvent.isDefaultPrevented(), "Prevent Default of mousedown on vertical scrollbar");
	});

	QUnit.module("Click", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function () {
			destroyTables();
		}
	});

	QUnit.test("Tree Icon", function(assert) {
		var done = assert.async();
		var oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		assert.equal(oTreeTable.getBinding("rows").getLength(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding("rows").isExpanded(0), "!Expanded");
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			assert.ok(false, "_doSelect should not be called");
		};

		var fnHandler = function() {
			sap.ui.getCore().applyChanges();
			assert.equal(oTreeTable.getBinding("rows").getLength(), iNumberOfRows + 1, "Row count after expand");
			assert.ok(oTreeTable.getBinding("rows").isExpanded(0), "Expanded");
			oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
			oExtension._ExtensionHelper.__handleClickSelection = null;
			done();
		};

		oTreeTable.attachEventOnce("_rowsUpdated", fnHandler);
		var $Icon = jQuery.sap.byId(oTreeTable.getId() + "-rows-row0-col0").find(".sapUiTableTreeIcon");
		qutils.triggerMouseEvent($Icon, "click");
	});


	QUnit.test("Group Header", function(assert) {
		var done = assert.async();
		var oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			assert.ok(false, "_doSelect should not be called");
		};

		assert.equal(oTreeTable.getBinding("rows").getLength(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding("rows").isExpanded(0), "!Expanded");

		var fnHandler = function() {
			sap.ui.getCore().applyChanges();
			assert.equal(oTreeTable.getBinding("rows").getLength(), iNumberOfRows + 1, "Row count after expand");
			assert.ok(oTreeTable.getBinding("rows").isExpanded(0), "Expanded");
			oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
			oExtension._ExtensionHelper.__handleClickSelection = null;
			done();
		};

		oTreeTable.attachEventOnce("_rowsUpdated", fnHandler);
		var $GroupHdr = jQuery.sap.byId(oTreeTable.getId() + "-rows-row0-groupHeader");
		qutils.triggerMouseEvent($GroupHdr, "click");
	});


	QUnit.test("Analytical Table Sum", function(assert) {
		var oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		var bSelected = false;
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			bSelected = true;
		};

		var $RowHdr = jQuery.sap.byId(oTreeTable.getId() + "-rowsel0");
		$RowHdr.addClass("sapUiAnalyticalTableSum");
		qutils.triggerMouseEvent($RowHdr, "click");
		assert.ok(!bSelected, "No Selection should happen");

		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;
	});


	QUnit.test("Mobile Group Menu Button", function(assert) {
		var oExtension = oTreeTable._getPointerExtension();
		oExtension._debug();

		var bSelected = false;
		var bContextMenu = false;
		oExtension._ExtensionHelper.__handleClickSelection = oExtension._ExtensionHelper._handleClickSelection;
		oExtension._ExtensionHelper._handleClickSelection = function() {
			bSelected = true;
		};
		oTreeTable._onContextMenu = function() {
			bContextMenu = true;
		};

		var $FakeButton = sap.ui.table.TableUtils.getRowColCell(oTreeTable, 0, 0).cell.$();
		$FakeButton.addClass("sapUiTableGroupMenuButton");
		qutils.triggerMouseEvent($FakeButton, "click");
		assert.ok(!bSelected, "No Selection should happen");
		assert.ok(bContextMenu, "Context Menu should be opened");

		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;
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

		var oRowColCell = sap.ui.table.TableUtils.getRowColCell(oTreeTable, 1, 2);
		initCellClickHandler(function(oEvent){
			bClickHandlerCalled = true;
			assert.ok(oEvent.getParameter("cellControl") === oRowColCell.cell, "Cell Click Event: Parameter cellControl");
			assert.ok(oEvent.getParameter("cellDomRef") === jQuery.sap.domById(oTreeTable.getId() + "-rows-row1-col2"), "Cell Click Event: Parameter cellDomRef");
			assert.equal(oEvent.getParameter("rowIndex"), 1, "Cell Click Event: Parameter rowIndex");
			assert.equal(oEvent.getParameter("columnIndex"), 2, "Cell Click Event: Parameter columnIndex");
			assert.equal(oEvent.getParameter("columnId"), oRowColCell.column.getId(), "Cell Click Event: Parameter columnId");
			assert.ok(oEvent.getParameter("rowBindingContext") === oRowColCell.row.getBindingContext(), "Cell Click Event: Parameter rowBindingContext");
		});
		var $Cell = oRowColCell.cell.$();
		qutils.triggerMouseEvent($Cell, "click"); // Should incease the counter
		assert.equal(iSelectCount, 1, iSelectCount + " Selections should happen");
		assert.ok(bClickHandlerCalled, "Cell Click Event handler called");

		initCellClickHandler(function(oEvent){
			oEvent.preventDefault();
			bClickHandlerCalled = true;
		});
		qutils.triggerMouseEvent($Cell, "click");
		assert.equal(iSelectCount, 1, iSelectCount + " Selections should happen");
		assert.ok(bClickHandlerCalled, "Cell Click Event handler called");

		initCellClickHandler(function(oEvent){
			bClickHandlerCalled = true;
		});
		$Cell = jQuery.sap.byId(oTreeTable.getId() + "-rows-row0-col0");
		qutils.triggerMouseEvent($Cell, "click"); // Should incease the counter
		assert.equal(iSelectCount, 2, iSelectCount + " Selections should happen");
		assert.ok(bClickHandlerCalled, "Cell Click Event handler called");

		bClickHandlerCalled = false;
		var oEvent = jQuery.Event({type : "click"});
		oEvent.setMarked();
		$Cell.trigger(oEvent);
		assert.equal(iSelectCount, 2, iSelectCount + " Selections should happen");
		assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");

		var $RowHdr = jQuery.sap.byId(oTreeTable.getId() + "-rowsel0");
		qutils.triggerMouseEvent($RowHdr, "click"); // Should incease the counter
		assert.equal(iSelectCount, 3, iSelectCount + " Selections should happen");
		assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");

		var $ColHdr = jQuery.sap.byId((oTable._getVisibleColumns()[0]).getId());
		qutils.triggerMouseEvent($ColHdr, "click");
		assert.equal(iSelectCount, 3, iSelectCount + " Selections should happen");
		assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");

		// Prevent Click on interactive controls

		var oExtension = oTable._getPointerExtension();
		oExtension._debug();
		var aKnownClickableControls = oExtension._KNOWNCLICKABLECONTROLS;

		$Cell = oRowColCell.cell.$();
		for (var i = 0; i < aKnownClickableControls.length; i++) {
			$Cell.toggleClass(aKnownClickableControls[i], true);
			qutils.triggerMouseEvent($Cell, "click");
			assert.equal(iSelectCount, 3, iSelectCount + " Selections should happen");
			assert.ok(!bClickHandlerCalled, "Cell Click Event handler not called");
			$Cell.toggleClass(aKnownClickableControls[i], false);
		}

		oRowColCell.cell.getEnabled = function() {return false;};
		$Cell = oRowColCell.cell.$();
		var iStartCount = iSelectCount;
		for (var i = 0; i < aKnownClickableControls.length; i++) {
			$Cell.toggleClass(aKnownClickableControls[i], true);
			qutils.triggerMouseEvent($Cell, "click");
			assert.equal(iSelectCount, iStartCount + i + 1, iSelectCount + " Selections should happen");
			assert.ok(bClickHandlerCalled, "Cell Click Event handler called");
			$Cell.toggleClass(aKnownClickableControls[i], false);
		}

		oExtension._ExtensionHelper._handleClickSelection = oExtension._ExtensionHelper.__handleClickSelection;
		oExtension._ExtensionHelper.__handleClickSelection = null;
	});


	QUnit.test("Selection", function(assert) {
		oTable.clearSelection();
		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);
		initRowActions(oTable, 2, 2);
		sap.ui.getCore().applyChanges();

		var oElem = getCell(0,0);
		assert.ok(!oTable.isIndexSelected(0), "Row not selected");
		qutils.triggerMouseEvent(oElem, "click");
		assert.ok(oTable.isIndexSelected(0), "Row selected");
		oElem = getRowHeader(0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.ok(!oTable.isIndexSelected(0), "Row not selected");
		oElem = getRowAction(0);
		qutils.triggerMouseEvent(oElem, "click");
		assert.ok(oTable.isIndexSelected(0), "Row selected");
	});


	QUnit.module("Column Reordering", {
		beforeEach: function() {
			jQuery.sap.byId("content").toggleClass("StablePosition", true);
			createTables(true);
			oTable.placeAt("content");
			oTreeTable.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			destroyTables();
			jQuery.sap.byId("content").toggleClass("StablePosition", false);
		}
	});

	function computeSettingsForReordering(oTable, iIndex, bIncreaseIndex) {
		var oSettings = {
			column : oTable._getVisibleColumns()[iIndex],
			relatedColumn : oTable._getVisibleColumns()[bIncreaseIndex ? iIndex + 1 : iIndex - 1]
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
		var iCount = 0;

		oTable.updateAnalyticalInfo = function(bFirst, bSecond) {
			assert.ok(bFirst, "updateAnalyticalInfo with first parameter true");
			assert.ok(bSecond, "updateAnalyticalInfo with second parameter true");
			iCount++;
		};

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function(){
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed because not dragged enough");
				assert.equal(iCount, 1, "updateAnalyticalInfo called");

				qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
				setTimeout(function(){
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
					setTimeout(function() {
						sap.ui.getCore().applyChanges();
						assert.equal(oTable.indexOfColumn(oColumn), 3, "Index of column changed");
						assert.equal(iCount, 2, "updateAnalyticalInfo called");
						done();
					}, 100);
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
		setTimeout(function(){
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed because not dragged enough");

				qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
				setTimeout(function(){
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
					setTimeout(function() {
						sap.ui.getCore().applyChanges();
						assert.equal(oTable.indexOfColumn(oColumn), 1, "Index of column changed");
						done();
					}, 100);
				}, 250);

			}, 100);
		}, 250);
	});

	QUnit.test("No Reordering of fixed columns (within fixed)", function(assert) {
		var done = assert.async();
		oTable.setFixedColumnCount(4);
		sap.ui.getCore().applyChanges();

		var oSettings = computeSettingsForReordering(oTable, 2, true);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function(){
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
				done();
			}, 100);
		}, 250);
	});

	QUnit.test("No Reordering of fixed columns (fixed to not fixed)", function(assert) {
		var done = assert.async();
		oTable.setFixedColumnCount(3);
		sap.ui.getCore().applyChanges();

		var oSettings = computeSettingsForReordering(oTable, 2, true);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function(){
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
				done();
			}, 100);
		}, 250);
	});

	QUnit.test("No Reordering of fixed columns (not fixed to fixed)", function(assert) {
		var done = assert.async();
		oTable.setFixedColumnCount(2);
		sap.ui.getCore().applyChanges();

		var oSettings = computeSettingsForReordering(oTable, 2, false);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function(){
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				assert.equal(oTable.indexOfColumn(oColumn), 2, "Index of column not changed");
				done();
			}, 100);
		}, 250);
	});

	QUnit.test("TreeTable - No Reordering via Drag&Drop of first column - increase index", function(assert) {
		var done = assert.async();
		oTreeTable.setFixedColumnCount(0);
		sap.ui.getCore().applyChanges();

		var oSettings = computeSettingsForReordering(oTreeTable, 0, true);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left + oSettings.breakeven;

		assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function(){
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				assert.equal(oTreeTable.indexOfColumn(oColumn), 0, "Index of column not changed because not dragged enough");

				qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
				setTimeout(function(){
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 30, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 20, oSettings.top, 0);
					qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft + 20, oSettings.top, 0);
					setTimeout(function() {
						sap.ui.getCore().applyChanges();
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
		sap.ui.getCore().applyChanges();

		var oSettings = computeSettingsForReordering(oTreeTable, 1, false);
		var oColumn = oSettings.column;
		var iLeft = oSettings.left - oSettings.breakeven;

		assert.equal(oTreeTable.indexOfColumn(oColumn), 1, "Initial index of column");

		qutils.triggerMouseEvent(oColumn.$(), "mousedown", 1, 1, oSettings.left, oSettings.top, 0);
		setTimeout(function(){
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft + 30, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mousemove", 1, 1, iLeft - 20, oSettings.top, 0);
			qutils.triggerMouseEvent(oColumn.$(), "mouseup", 1, 1, iLeft - 20, oSettings.top, 0);
			setTimeout(function() {
				sap.ui.getCore().applyChanges();
				assert.equal(oTreeTable.indexOfColumn(oColumn), 1, "Index of column not changed");
				done();
			}, 100);
		}, 250);
	});



	QUnit.module("Row Hover Effect", {
		beforeEach: function() {
			jQuery.sap.byId("content").toggleClass("StablePosition", true);
			createTables(true);
			oTable.placeAt("content");
			oTreeTable.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			destroyTables();
			jQuery.sap.byId("content").toggleClass("StablePosition", false);
		}
	});

	QUnit.test("RowHeader", function(assert) {
		assert.ok(!getRowHeader(0).hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		getRowHeader(0).mouseover();
		assert.ok(getRowHeader(0).hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		getRowHeader(0).mouseout();
		assert.ok(!getRowHeader(0).hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
	});

	QUnit.test("Fixed column area", function(assert) {
		assert.ok(!getRowHeader(0).hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		getCell(0, 0).mouseover();
		assert.ok(getRowHeader(0).hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		getCell(0, 0).mouseout();
		assert.ok(!getRowHeader(0).hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
	});

	QUnit.test("Scroll column area", function(assert) {
		assert.ok(!getRowHeader(0).hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
		getCell(0, 2).mouseover();
		assert.ok(getRowHeader(0).hasClass("sapUiTableRowHvr"), "Hover effect on row header");
		assert.ok(getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "Hover effect on fixed part of row");
		assert.ok(getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "Hover effect on scroll part of row");
		getCell(0, 2).mouseout();
		assert.ok(!getRowHeader(0).hasClass("sapUiTableRowHvr"), "No hover effect on row header");
		assert.ok(!getCell(0, 0).parent().hasClass("sapUiTableRowHvr"), "No hover effect on fixed part of row");
		assert.ok(!getCell(0, 2).parent().hasClass("sapUiTableRowHvr"), "No hover effect on scroll part of row");
	});



	QUnit.module("Helpers", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function () {
			destroyTables();
		}
	});

	QUnit.test("_debug()", function(assert) {
		var oExtension = oTable._getPointerExtension();
		assert.ok(!oExtension._ExtensionHelper, "_ExtensionHelper: No debug mode");
		assert.ok(!oExtension._ColumnResizeHelper, "_ColumnResizeHelper: No debug mode");
		assert.ok(!oExtension._InteractiveResizeHelper, "_InteractiveResizeHelper: No debug mode");
		assert.ok(!oExtension._ReorderHelper, "_ReorderHelper: No debug mode");
		assert.ok(!oExtension._ExtensionDelegate, "_ExtensionDelegate: No debug mode");
		assert.ok(!oExtension._RowHoverHandler, "_RowHoverHandler: No debug mode");
		assert.ok(!oExtension._KNOWNCLICKABLECONTROLS, "_KNOWNCLICKABLECONTROLS: No debug mode");

		oExtension._debug();
		assert.ok(!!oExtension._ExtensionHelper, "_ExtensionHelper: Debug mode");
		assert.ok(!!oExtension._ColumnResizeHelper, "_ColumnResizeHelper: Debug mode");
		assert.ok(!!oExtension._InteractiveResizeHelper, "_InteractiveResizeHelper: Debug mode");
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
	});

}());