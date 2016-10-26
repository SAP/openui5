//************************************************************************
// Test Code
//************************************************************************

sap.ui.test.qunit.delayTestStart(500);

QUnit.module("Initialization", {
	beforeEach: function() {
		createTables();
	},
	afterEach: function() {
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
	beforeEach: function() {
		createTables();
	},
	afterEach: function() {
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

QUnit.module("Scrollbars", {
	beforeEach: function() {
		this.sOriginalWidth = document.getElementById("content").style.width;
		this.sOriginalHeight = document.getElementById("content").style.height;

		document.getElementById("content").style.width = "300px";
		document.getElementById("content").style.height = "100px";

		createTables();

		this.oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
		this.oVSb = oTable._getScrollExtension().getVerticalScrollbar();
	},
	afterEach: function() {
		document.getElementById("content").style.width = this.sOriginalWidth;
		document.getElementById("content").style.height = this.sOriginalHeight;
		destroyTables();
	}
});

QUnit.test("Horizontal scrollbar visibility", function(assert) {
	assert.ok(this.oHSb.offsetWidth > 0 && this.oHSb.offsetHeight > 0, "Table content does not fit width -> Horizontal scrollbar is visible");

	destroyTables();
	document.getElementById("content").style.width = this.sOriginalWidth;
	createTables();
	assert.ok(this.oHSb.offsetWidth === 0 && this.oHSb.offsetHeight === 0, "Table content fits width -> Horizontal scrollbar is not visible");
});

QUnit.test("Vertical scrollbar visibility", function(assert) {
	assert.ok(this.oVSb.offsetWidth > 0 && this.oVSb.offsetHeight > 0, "Table content does not fit height -> Vertical scrollbar is visible");

	destroyTables();
	document.getElementById("content").style.height = this.sOriginalHeight;
	createTables();
	assert.ok(this.oVSb.offsetWidth === 0 && this.oVSb.offsetHeight === 0, "Table content fits height -> Vertical scrollbar is not visible");
});

QUnit.module("Horizontal scrolling", {
	beforeEach: function() {
		this.sOriginalWidth = document.getElementById("content").style.width;
		document.getElementById("content").style.width = "300px";

		createTables();

		this.oScrollExtension = oTable._getScrollExtension();
		this.oScrollExtension._debug();

		this.oHSb = this.oScrollExtension.getHorizontalScrollbar();
		this.oHeaderScroll = oTable.getDomRef("sapUiTableColHdrScr");
		this.oContentScroll = oTable.getDomRef("sapUiTableCtrlScr");
	},
	afterEach: function() {
		document.getElementById("content").style.width = this.sOriginalWidth;
		destroyTables();
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

QUnit.asyncTest("Imitating Arrow Left/Right and Home/End key navigation", function(assert) {
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

	function scrollWithMouseWheel(oTarget, iScrollDelta, iExpectedScrollPosition, bValidTarget) {
		return new Promise(
			function(resolve) {
				var oEvent = jQuery.Event({type: "wheel"});
				oEvent.shiftKey = true;
				oEvent.deltaX = iScrollDelta;
				oEvent.originalEvent.shiftKey = true;
				oEvent.originalEvent.deltaX = iScrollDelta;

				jQuery(oTarget).trigger(oEvent);

				window.setTimeout(function() {
					that.assertSynchronization(assert, iExpectedScrollPosition);

					if (!bValidTarget) {
						assert.ok(!oEvent.isDefaultPrevented(), "Target does not support mousewheel scrolling: Default action was not prevented");
						assert.ok(!oEvent.isPropagationStopped(), "Target does not support mousewheel scrolling: Propagation was not stopped");
					} else if (iCurrentScrollPosition === 0 && iScrollDelta < 0) {
						assert.ok(!oEvent.isDefaultPrevented(), "Scroll position is already at the beginning: Default action was not prevented");
						assert.ok(!oEvent.isPropagationStopped(), "Scroll position is already at the beginning: Propagation was not stopped");
					} else if (iCurrentScrollPosition === that.oHSb.scrollWidth - that.oHSb.clientWidth && iScrollDelta > 0) {
						assert.ok(!oEvent.isDefaultPrevented(), "Scroll position is already at the end: Default action was not prevented");
						assert.ok(!oEvent.isPropagationStopped(), "Scroll position is already at the end: Propagation was not stopped");
					} else {
						assert.ok(oEvent.isDefaultPrevented(), "Default action was prevented");
						assert.ok(oEvent.isPropagationStopped(), "Propagation was stopped");
					}

					iCurrentScrollPosition = iExpectedScrollPosition;

					resolve();
				}, iAssertionDelay);
			}
		);
	}

	oTarget = getCell(0, 0); // Cell in fixed column.
	scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition + 150, true).then(function() {
		return scrollWithMouseWheel(oTarget, 50, iCurrentScrollPosition + 50, true);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition - 150, true);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -50, iCurrentScrollPosition - 50, true);
	}).then(function() {

		oTarget = getCell(2, 2); // Cell in scrollable column.
		return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition + 150, true);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, 50, iCurrentScrollPosition + 50, true);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition - 150, true);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -50, iCurrentScrollPosition - 50, true);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -50, 0, true);
	}).then(function() {

		oTarget = getSelectAll();
		return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition, false);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition, false);
	}).then(function() {

		oTarget = getColumnHeader(1);
		return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition, false);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition, false);
	}).then(function() {

		oTarget = getRowHeader(0);
		return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition + 150, true);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, 50, iCurrentScrollPosition + 50, true);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition - 150, true);
	}).then(function() {
		return scrollWithMouseWheel(oTarget, -50, iCurrentScrollPosition - 50, true);
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
			}],
			originalEvent: {touches: true}
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
					}],
					originalEvent: {touches: true}
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

		oTarget = getCell(2, 2); // Cell in scrollable column.
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

QUnit.module("Public methods", {
	beforeEach: function() {
		this.sOriginalWidth = document.getElementById("content").style.width;
		this.sOriginalHeight = document.getElementById("content").style.height;

		document.getElementById("content").style.width = "300px";
		document.getElementById("content").style.height = "100px";

		createTables();

		this.oScrollExtension = oTable._getScrollExtension();
		this.oHSb = this.oScrollExtension.getHorizontalScrollbar();
		this.oVSb = this.oScrollExtension.getVerticalScrollbar();
	},
	afterEach: function() {
		document.getElementById("content").style.width = this.sOriginalWidth;
		document.getElementById("content").style.height = this.sOriginalHeight;
		destroyTables();
	}
});

QUnit.test("scroll", function(assert) {
	var iVisibleRowCount = 5;
	var iFixedTop = 2;
	var iFixedBottom = 1;
	var iNotVisibleRows = iNumberOfRows - iVisibleRowCount;
	var iPageSize = iVisibleRowCount - iFixedTop - iFixedBottom;
	var iPages = Math.ceil((iNumberOfRows - iFixedTop - iFixedBottom) / iPageSize);
	var i;

	oTable.setVisibleRowCount(iVisibleRowCount);
	oTable.setFixedRowCount(iFixedTop);
	oTable.setFixedBottomRowCount(iFixedBottom);
	sap.ui.getCore().applyChanges();

	var bScrolled = false;

	for (i = 0; i < iNotVisibleRows + 2; i++) {
		if (i < iNotVisibleRows) {
			assert.equal(oTable.getFirstVisibleRow(), i, "First visible row before scroll (forward, stepwise, " + i + ")");
			bScrolled = this.oScrollExtension.scroll(true, false);
			assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), i + 1, "First visible row after scroll");
		} else {
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row before scroll (forward, stepwise, " + i + ")");
			bScrolled = this.oScrollExtension.scroll(true, false);
			assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row after scroll");
		}
	}

	for (i = 0; i < iNotVisibleRows + 2; i++) {
		if (i < iNotVisibleRows) {
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows - i, "First visible row before scroll (backward, stepwise, " + i + ")");
			bScrolled = this.oScrollExtension.scroll(false, false);
			assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows - i - 1, "First visible row after scroll");
		} else {
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scroll (backward, stepwise, " + i + ")");
			bScrolled = this.oScrollExtension.scroll(false, false);
			assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scroll");
		}
	}

	var iPos = 0;
	for (i = 0; i < iPages + 2; i++) {
		if (i < iPages - 1) {
			assert.equal(oTable.getFirstVisibleRow(), iPos, "First visible row before scroll (forward, pagewise, " + i + ")");
			bScrolled = this.oScrollExtension.scroll(true, true);
			assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
			iPos = iPos + iPageSize;
			assert.equal(oTable.getFirstVisibleRow(), Math.min(iPos, iNotVisibleRows), "First visible row after scroll");
		} else {
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row before scroll (forward, pagewise, " + i + ")");
			bScrolled = this.oScrollExtension.scroll(true, true);
			assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row after scroll");
		}
	}

	iPos = iNotVisibleRows;
	for (i = 0; i < iPages + 2; i++) {
		if (i < iPages - 1) {
			assert.equal(oTable.getFirstVisibleRow(), iPos, "First visible row before scroll (backward, pagewise, " + i + ")");
			bScrolled = this.oScrollExtension.scroll(false, true);
			assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
			iPos = iPos - iPageSize;
			assert.equal(oTable.getFirstVisibleRow(), Math.max(iPos, 0), "First visible row after scroll");
		} else {
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scroll (backward, pagewise, " + i + ")");
			bScrolled = this.oScrollExtension.scroll(false, true);
			assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
			assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scroll");
		}
	}
});

QUnit.test("scrollMax", function(assert) {
	var bScrolled;

	/* More data rows than visible rows */
	// ↓ Down
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
	bScrolled = this.oScrollExtension.scrollMax(true);
	assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), iNumberOfRows - oTable.getVisibleRowCount(), "First visible row after scrolling");
	// ↑ Up
	bScrolled = this.oScrollExtension.scrollMax(false);
	assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

	/* Less data rows than visible rows */
	oTable.setVisibleRowCount(10);
	sap.ui.getCore().applyChanges();
	// ↓ Down
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
	bScrolled = this.oScrollExtension.scrollMax(true);
	assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
	// ↑ Up
	bScrolled = this.oScrollExtension.scrollMax(false);
	assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

	/* More data rows than visible rows and fixed top/bottom rows */
	oTable.setVisibleRowCount(6);
	oTable.setFixedRowCount(2);
	oTable.setFixedBottomRowCount(2);
	sap.ui.getCore().applyChanges();
	// ↓ Down
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
	bScrolled = this.oScrollExtension.scrollMax(true);
	assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), iNumberOfRows - oTable.getVisibleRowCount(), "First visible row after scrolling");
	// ↑ Up
	bScrolled = this.oScrollExtension.scrollMax(false);
	assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

	/* Less data rows than visible rows and fixed top/bottom rows */
	oTable.setVisibleRowCount(10);
	sap.ui.getCore().applyChanges();
	// ↓ Down
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
	bScrolled = this.oScrollExtension.scrollMax(true);
	assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
	// ↑ Up
	bScrolled = this.oScrollExtension.scrollMax(false);
	assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
	assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
});

QUnit.test("getHorizontalScrollbar", function(assert) {
	assert.strictEqual(this.oScrollExtension.getHorizontalScrollbar(), oTable.getDomRef(sap.ui.table.SharedDomRef.HorizontalScrollBar), "Returned: Horizontal scrollbar element");

	this.stub(this.oScrollExtension, "getTable").returns(undefined);
	assert.strictEqual(this.oScrollExtension.getHorizontalScrollbar(), null, "Returned null: The ScrollExtension has no reference to the table");
});

QUnit.test("getVerticalScrollbar", function(assert) {
	assert.strictEqual(this.oScrollExtension.getVerticalScrollbar(), oTable.getDomRef(sap.ui.table.SharedDomRef.VerticalScrollBar), "Returned: Vertical scrollbar element");

	this.stub(this.oScrollExtension, "getTable").returns(undefined);
	assert.strictEqual(this.oScrollExtension.getVerticalScrollbar(), null, "Returned null: The ScrollExtension has no reference to the table");
});

QUnit.test("isHorizontalScrollbarVisible", function(assert) {
	assert.ok(this.oScrollExtension.isHorizontalScrollbarVisible(), "Table content does not fit width -> Horizontal scrollbar is visible");

	destroyTables();
	document.getElementById("content").style.width = this.sOriginalWidth;
	createTables();
	assert.ok(!this.oScrollExtension.isHorizontalScrollbarVisible(), "Table content fits width -> Horizontal scrollbar is not visible");
});

QUnit.test("isVerticalScrollbarVisible", function(assert) {
	assert.ok(this.oScrollExtension.isVerticalScrollbarVisible(), "Table content does not fit height -> Vertical scrollbar is visible");

	destroyTables();
	document.getElementById("content").style.height = this.sOriginalHeight;
	createTables();
	assert.ok(!this.oScrollExtension.isVerticalScrollbarVisible(), "Table content fits height -> Vertical scrollbar is not visible");
});