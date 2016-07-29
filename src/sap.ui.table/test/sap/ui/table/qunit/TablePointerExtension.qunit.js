//************************************************************************
// Test Code
//************************************************************************

sap.ui.test.qunit.delayTestStart(500);


QUnit.module("Initialization", {
	setup: function() {
		createTables();
	},
	teardown: function () {
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
	setup: function() {
		jQuery.sap.byId("content").toggleClass("StablePosition", true);
		createTables(true);
		oTable.placeAt("content");
		oTable.setVisibleRowCountMode("Interactive");
		sap.ui.getCore().applyChanges();
	},
	teardown: function () {
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
	assert.equal(oTable.getVisibleRowCount(), 5, "Initial visible rows");
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
	assert.equal(oTable.getVisibleRowCount(), 7, "Visible rows after resize");
	assert.ok(iInitialHeight < $Table.height(), "Height of the table increased");
	testAdaptations(false);
});


QUnit.module("Column Resizing", {
	setup: function() {
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
	teardown: function () {
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
		var bCorrect = Math.abs(parseInt(oTable.$("rsz").css("left")) - 100 - oColumn.getDomRef().getBoundingClientRect().left) < 5;
		assert.ok(bExpect && bCorrect || !bExpect && !bCorrect, "Position of Resizer");
		assert.equal(oTable._iLastHoveredColumnIndex, iIndex, "Index of last hovered resizable table");
	}
}

QUnit.test("Moving Resizer", function(assert){
	var aVisibleColumns = oTable._getVisibleColumns();
	moveResizer(aVisibleColumns[0], assert, true, 0);
	moveResizer(aVisibleColumns[1], assert, false, 0);
	assert.ok(Math.abs(parseInt(oTable.$("rsz").css("left")) - 100 - aVisibleColumns[0].getDomRef().getBoundingClientRect().left) < 10, "Position of Resizer still on column 0");
	moveResizer(aVisibleColumns[2], assert, true, 2);

});

QUnit.asyncTest("Automatic Column Resize via Double Click", function(assert){
	function triggerDoubleClick(bExpect, iIndex) {
		// Move resizer to correct column
		moveResizer(oColumn, assert, bExpect, iIndex)

		// Double Click on resizer
		if (sap.ui.Device.support.touch) {
			qutils.triggerEvent("touchend", oTable.$("rsz"), {});
			qutils.triggerEvent("touchend", oTable.$("rsz"), {});
		} else {
			qutils.triggerMouseEvent(oTable.$("rsz"), "click");
			qutils.triggerMouseEvent(oTable.$("rsz"), "click");
		}
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
			triggerDoubleClick(true, 1);

			setTimeout(function() {
				iWidth = oColumn.$().width();
				assert.ok(Math.abs(iWidth - 270) < 40, "check column width after resize: " + iWidth);
				start();
			}, 50);
		}, 50);
	}, 50);
});

QUnit.asyncTest("Automatic Column Resize via API", function(assert){
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
				start();
			}, 50);
		}, 50);
	}, 50);
});

QUnit.asyncTest("Resize via Drag&Drop", function(assert) {
	var oColumn = this.oColumn;
	var $Resizer = oTable.$("rsz");

	// resizer should be way out of screen when the table gets rendered
	assert.equal(oTable.$("rsz").position().left, "0", "Resizer is at the correct initial position");

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
		start();
	}, 50);
});

QUnit.asyncTest("Resize via Resize Button", function(assert) {
	var oColumn = this.oColumn;
	oColumn.setResizable(true);
	sap.ui.getCore().applyChanges();

	var iWidth = oColumn.$().width();
	assert.ok(Math.abs(iWidth - 100) < 10, "check column width before resize: " + iWidth);

	var $Resizer = oTable.$("rsz");
	var iResizeHandlerTop = Math.floor(oColumn.getDomRef().getBoundingClientRect().top + 100);
	oTable._onColumnSelect(oColumn, oColumn.getDomRef(), true, false);
	var $ResizeButton = oColumn.$().find(".sapUiTableColResizer");
	var iResizeButtonLeft = Math.floor(oColumn.getDomRef().getBoundingClientRect().left + 100);
	qutils.triggerMouseEvent($ResizeButton, "mousedown", 1, 1, iResizeButtonLeft, iResizeHandlerTop, 0);
	qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeButtonLeft + 90, iResizeHandlerTop, 0);
	qutils.triggerMouseEvent($Resizer, "mousemove", 1, 1, iResizeButtonLeft + 90 + 40, iResizeHandlerTop, 0);
	qutils.triggerMouseEvent($Resizer, "mouseup", 1, 1, iResizeButtonLeft + 90 + 40, iResizeHandlerTop, 0);

	setTimeout(function() {
		var iNewWidth = oColumn.$().width();
		assert.ok(Math.abs(iNewWidth - iWidth - 90 - 40) < 5, "check column width after resize: " + iNewWidth);
		start();
	}, 50);
});


QUnit.module("Destruction", {
	setup: function() {
		createTables();
	},
	teardown: function () {
		oTable = null;
		oTreeTable.destroy();
		oTreeTable = null;
	}
});


QUnit.test("destroy()", function(assert) {
	var oExtension = oTable._getKeyboardExtension();
	oTable.destroy();
	assert.ok(!oExtension.getTable(), "Table cleared");
	assert.ok(!oExtension._delegate, "Delegate cleared");
});