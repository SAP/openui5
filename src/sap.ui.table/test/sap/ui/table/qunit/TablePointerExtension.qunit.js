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