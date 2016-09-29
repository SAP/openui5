//************************************************************************
// Test Code
//************************************************************************

sap.ui.test.qunit.delayTestStart(500);

QUnit.module("Initialization", {
	setup: function() {
		createTables();
	},
	teardown: function() {
		destroyTables();
	}
});

QUnit.test("init()", function(assert) {
	var oExtension = oTable._getScrollExtension();
	assert.ok(!!oExtension, "Scroll Extension available");

	var iCount = 0;
	for (var i = 0; i < oTable.aDelegates.length; i++) {
		if (oTable.aDelegates[i].oDelegate === oExtension._delegate) {
			iCount++;
		}
	}
	assert.ok(iCount == 1, "Scroll Delegate registered");
});

QUnit.test("_debug()", function(assert) {
	var oExtension = oTable._getKeyboardExtension();
	assert.ok(!oExtension._ExtensionHelper, "No debug mode");
	oExtension._debug();
	// TBD: assert.ok(!!oExtension._ExtensionHelper, "Debug mode");
});


QUnit.module("Destruction", {
	setup: function() {
		createTables();
	},
	teardown: function() {
		oTable = null;
		oTreeTable.destroy();
		oTreeTable = null;
	}
});

QUnit.test("destroy()", function(assert) {
	var oExtension = oTable._getScrollExtension();
	oTable.destroy();
	assert.ok(!oExtension.getTable(), "Table cleared");
	assert.ok(!oExtension._delegate, "Delegate cleared");
});

QUnit.module("Horizontal scrolling", {
	before: function() {
		this.sOriginalWidth = document.getElementById("content").style.width;
	},
	beforeEach: function() {
		document.getElementById("content").style.width = "300px";
		createTables();
		oTable._getScrollExtension()._debug();
		this.oHSb = oTable.getDomRef(sap.ui.table.SharedDomRef.HorizontalScrollBar);
		this.oHeaderScroll = oTable.getDomRef("sapUiTableColHdrScr");
		this.oContentScroll = oTable.getDomRef("sapUiTableCtrlScr");
	},
	afterEach: function() {
		destroyTables();
	},
	after: function() {
		document.getElementById("content").style.width = this.sOriginalWidth;
	},
	assertSynchronization: function(assert, iScrollPosition) {
		if (iScrollPosition == null) {
			iScrollPosition = this.oHSb.scrollLeft;
		}

		var bIsSynchronized = this.oHSb.scrollLeft === iScrollPosition &&
			(this.oHSb.scrollLeft === this.oHeaderScroll.scrollLeft && this.oHSb.scrollLeft === this.oContentScroll.scrollLeft);

		assert.ok(bIsSynchronized, "Scroll positions are synchronized at position " + iScrollPosition +
			" [HSb: " + this.oHSb.scrollLeft + ", Header: " + this.oHeaderScroll.scrollLeft + ", Content: " + this.oContentScroll.scrollLeft + "]");
	}
});

QUnit.test("Scrollbar visibility", function(assert) {
	assert.ok(this.oHSb.offsetWidth > 0 && this.oHSb.offsetHeight > 0, "Table content does not fit width -> Horizontal scrollbar is visible");

	destroyTables();
	document.getElementById("content").style.width = this.sOriginalWidth;
	createTables();
	assert.ok(this.oHSb.offsetWidth === 0 && this.oHSb.offsetHeight === 0, "Table content fits width -> Horizontal scrollbar is not visible");
});

QUnit.asyncTest("Imitating scrollbar scrolling", function(assert) {
	// Scroll right to 200
	this.oHSb.scrollLeft = 10;

	for (var i = 1; i < 20; i++) {
		window.setTimeout(function(_i) {
			this.oHSb.scrollLeft = 10 + _i * 10;

			if (_i === 19) { // Delay the asserts so that all the scroll event handlers can be called before.
				window.setTimeout(function() {
					assert.strictEqual(this.oHSb.scrollLeft, 200, "Horizontal scrollbar scroll position is 200");
					assert.strictEqual(this.oHeaderScroll.scrollLeft, 200, "Header scroll position is 200");
					assert.strictEqual(this.oContentScroll.scrollLeft, 200, "Content scroll position is 200");
					scrollLeftTo20.bind(this)();
				}.bind(this), 50);
			}

		}.bind(this, i), i);
	}

	function scrollLeftTo20() {
		for (var i = 1; i < 19; i++) {
			window.setTimeout(function (_i) {
				this.oHSb.scrollLeft = 200 - _i * 10;

				if (_i === 18) { // Delay the asserts so that all the scroll event handlers can be called before.
					window.setTimeout(function() {
						assert.strictEqual(this.oHSb.scrollLeft, 20, "Horizontal scrollbar scroll position is 20");
						assert.strictEqual(this.oHeaderScroll.scrollLeft, 20, "Header scroll position is 20");
						assert.strictEqual(this.oContentScroll.scrollLeft, 20, "Content scroll position is 20");
						QUnit.start();
					}.bind(this), 50);
				}

			}.bind(this, i), i + 100);
		}
	}
});

QUnit.asyncTest("Imitating Arrow and Home/End key navigation", function(assert) {
	var that = this;
	var iNumberOfCols = oTable.getColumns().length;
	var iAssertionDelay = 75;

	// Start at the first cell in the header.
	var iRowIndex = 0;
	var iColIndex = 0;
	var oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());
	oCell.focus();

	function navigateHorizontal(bRight) {
		return new Promise(
			function(resolve) {
				iColIndex = bRight ? iColIndex + 1 : iColIndex - 1;

				var sKey = bRight ? "ARROW_RIGHT" : "ARROW_LEFT";
				qutils.triggerKeydown(oCell, sKey, false, false, false);

				if (iRowIndex === 0) {
					oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());
				} else {
					oCell = jQuery.sap.domById(oTable.getId() + "-rows-row" + (iRowIndex - 1) + "-col" + iColIndex);
				}

				window.setTimeout(function() {
					that.assertSynchronization(assert);
					resolve();
				}, iAssertionDelay);
			}
		);
	}

	// Header: Navigate from the first column header cell to the last.
	navigateHorizontal(true).then(function() {	// 2
		return navigateHorizontal(true);		// 3
	}).then(function() {
		return navigateHorizontal(true);		// 4
	}).then(function() {
		return navigateHorizontal(true);		// 5
	}).then(function() {

		// Header: Navigate to the content.
		iRowIndex++;
		qutils.triggerKeydown(oCell, "ARROW_DOWN", false, false, false);
		oCell = jQuery.sap.domById(oTable.getId() + "-rows-row" + (iRowIndex - 1) + "-col" + iColIndex);

		// Content: Navigate to the first cell.
		return navigateHorizontal(false);		// 4
	}).then(function() {
		return navigateHorizontal(false);		// 3
	}).then(function() {
		return navigateHorizontal(false);		// 2
	}).then(function() {
		return navigateHorizontal(false);		// 1
	}).then(function() {

		// Content: Navigate to the last cell.
		return navigateHorizontal(true);		// 2
	}).then(function() {
		return navigateHorizontal(true);		// 3
	}).then(function() {
		return navigateHorizontal(true);		// 4
	}).then(function() {
		return navigateHorizontal(true);		// 5
	}).then(function() {

		// Content: Navigate to the header.
		iRowIndex--;
		qutils.triggerKeydown(oCell, "ARROW_UP", false, false, false);
		oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());

		// Header: Navigate to the first cell.
		return navigateHorizontal(false);		// 4
	}).then(function() {
		return navigateHorizontal(false);		// 3
	}).then(function() {
		return navigateHorizontal(false);		// 2
	}).then(function() {
		return navigateHorizontal(false);		// 1
	}).then(function() {

		// Header: Navigate to the last cell.
		iColIndex = iNumberOfCols - 1;
		qutils.triggerKeydown(oCell, "END", false, false, false);
		oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());

		return new Promise(
			function (resolve) {
				window.setTimeout(function() {
					that.assertSynchronization(assert);
					resolve();
				}, iAssertionDelay);
			}
		);

		// Header: Navigate to the first cell.
	}).then(function() {
		return navigateHorizontal(false);		// 4
	}).then(function() {
		return navigateHorizontal(false);		// 3
	}).then(function() {
		return navigateHorizontal(false);		// 2
	}).then(function() {
		return navigateHorizontal(false);		// 1
	}).then(function() {

		// Header: Navigate to the content.
		iRowIndex++;
		qutils.triggerKeydown(oCell, "ARROW_DOWN", false, false, false);
		oCell = jQuery.sap.domById(oTable.getId() + "-rows-row" + (iRowIndex - 1) + "-col" + iColIndex);

		// Content: Navigate to the last cell.
		return navigateHorizontal(true);		// 2
	}).then(function() {
		return navigateHorizontal(true);		// 3
	}).then(function() {
		return navigateHorizontal(true);		// 4
	}).then(function() {
		return navigateHorizontal(true);		// 5
	}).then(function() {

		// Content: Navigate to the first cell.
		return navigateHorizontal(false);		// 4
	}).then(function() {
		return navigateHorizontal(false);		// 3
	}).then(function() {
		return navigateHorizontal(false);		// 2
	}).then(function() {
		return navigateHorizontal(false);		// 1
	}).then(function() {

		// Content: Navigate to the header.
		iRowIndex--;
		qutils.triggerKeydown(oCell, "ARROW_UP", false, false, false);
		oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());

		// Header: Navigate to the last cell.
		return navigateHorizontal(true);		// 2
	}).then(function() {
		return navigateHorizontal(true);		// 3
	}).then(function() {
		return navigateHorizontal(true);		// 4
	}).then(function() {
		return navigateHorizontal(true);		// 5
	}).then(function() {

		// Navigate to the first cell in the header.
		qutils.triggerKeydown(oCell, "HOME", false, false, false);

		window.setTimeout(function() {
			that.assertSynchronization(assert, 0);
			QUnit.start();
		}, iAssertionDelay);
	})
});

QUnit.asyncTest("Imitating mouse wheel", function(assert) {
	var that = this;
	var iAssertionDelay = 75;
	var oTarget;
	var iCurrentScrollPosition = this.oHSb.scrollLeft;

	function scrollWithMouseWheel(oTarget, iScrollDelta, iExpectedScrollPosition) {
		return new Promise(
			function(resolve) {
				qutils.triggerEvent("wheel", oTarget, {
					shiftKey: true,
					deltaX: iScrollDelta
				});

				window.setTimeout(function() {
					that.assertSynchronization(assert, iExpectedScrollPosition);
					iCurrentScrollPosition = iExpectedScrollPosition;
					resolve();
				}, iAssertionDelay);
			}
		);
	}

	oTarget = getCell(0, 0); // Cell in fixed column.
	scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition + 150).then(function() {
		return scrollWithMouseWheel(oTarget, 50, iCurrentScrollPosition + 50);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition - 150);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -50, iCurrentScrollPosition - 50);
	}).then(function() {

		oTarget = getCell(2, 2); // Cell in scrollable column.
		return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition + 150);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, 50, iCurrentScrollPosition + 50);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition - 150);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -50, iCurrentScrollPosition - 50);
	}).then(function() {

		oTarget = getSelectAll();
		return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition);
	}).then(function() {

		oTarget = getColumnHeader(1);
		return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition);
	}).then(function() {

		oTarget = getRowHeader(0);
		return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition + 150);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, 50, iCurrentScrollPosition + 50);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition - 150);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -50, iCurrentScrollPosition - 50);
	}).then(function() {
		QUnit.start();
	});
});

QUnit.asyncTest("Imitating touch", function(assert) {
	var that = this;
	var itouchPosition;
	var iCurrentScrollPosition = this.oHSb.scrollLeft;
	var oScrollDelegate = oTable._getScrollExtension()._ExtensionDelegate;
	var oTarget;
	var iAssertionDelay = 50;

	function touchStart(oTarget, iPageX) {
		itouchPosition = iPageX;

		var oTouchStartEventData = jQuery.Event("touchstart", {
			target: oTarget,
			targetTouches: [{
				pageX: iPageX,
				pageY: 0
			}]
		});
		oScrollDelegate.ontouchstart.call(oTable, oTouchStartEventData);
	}

	function touchMove(oTarget, iScrollDelta, iExpectedScrollPosition) {
		return new Promise(
			function(resolve) {
				itouchPosition -= iScrollDelta;

				var oTouchMoveEventData = jQuery.Event("touchmove", {
					target: oTarget,
					targetTouches: [{
						pageX: itouchPosition,
						pageY: 0
					}]
				});
				oScrollDelegate.ontouchmove.call(oTable, oTouchMoveEventData);

				window.setTimeout(function() {
					that.assertSynchronization(assert, iExpectedScrollPosition);
					iCurrentScrollPosition = iExpectedScrollPosition;
					resolve();
				}, iAssertionDelay);
			}
		);
	}

	document.ontouchstart = "dummy";

	oTarget = getCell(0, 0); // Cell in fixed column.
	touchStart(oTarget, 200);
	touchMove(oTarget, 150, iCurrentScrollPosition + 150).then(function() {
		return touchMove(oTarget, 50, iCurrentScrollPosition + 50);
	}).then(function() {
		return touchMove(oTarget, -150, iCurrentScrollPosition - 150);
	}).then(function() {
		return touchMove(oTarget, -50, iCurrentScrollPosition - 50);
	}).then(function() {

		oTarget = getCell(2, 2); // Cell in scrollable coumn.
		touchStart(oTarget, 200);
		return touchMove(oTarget, 150, iCurrentScrollPosition + 150);
	}).then(function() {
		return touchMove(oTarget, 50, iCurrentScrollPosition + 50);
	}).then(function() {
		return touchMove(oTarget, -150, iCurrentScrollPosition - 150);
	}).then(function() {
		return touchMove(oTarget, -50, iCurrentScrollPosition - 50);
	}).then(function() {

		oTarget = getSelectAll();
		touchStart(oTarget, 200);
		return touchMove(oTarget, 150, iCurrentScrollPosition);
	}).then(function() {
		return touchMove(oTarget, -150, iCurrentScrollPosition);
	}).then(function() {

		oTarget = getColumnHeader(1);
		touchStart(oTarget, 200);
		return touchMove(oTarget, 150, iCurrentScrollPosition);
	}).then(function() {
		return touchMove(oTarget, -150, iCurrentScrollPosition);
	}).then(function() {

		oTarget = getRowHeader(0);
		touchStart(oTarget, 200);
		return touchMove(oTarget, 150, iCurrentScrollPosition + 150);
	}).then(function() {
		return touchMove(oTarget, 50, iCurrentScrollPosition + 50);
	}).then(function() {
		return touchMove(oTarget, -150, iCurrentScrollPosition - 150);
	}).then(function() {
		return touchMove(oTarget, -50, iCurrentScrollPosition - 50);
	}).then(function() {
		delete document.ontouchstart;
		QUnit.start();
	});
});