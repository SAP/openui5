/*global QUnit,qutils,sinon,oTable*/

(function () {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getSelectAll = window.getSelectAll;
	var iNumberOfRows = window.iNumberOfRows;

	// Shortcuts
	jQuery.sap.require("sap.ui.Device");
	var Device = sap.ui.Device;

	//************************************************************************
	// Test Code
	//************************************************************************

	sap.ui.test.qunit.delayTestStart(500);

	QUnit.module("Initialization", {
		beforeEach: function () {
			createTables();
		},
		afterEach: function () {
			destroyTables();
		}
	});

	QUnit.test("init()", function (assert) {
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

	QUnit.test("_debug()", function (assert) {
		var oScrollExtension = oTable._getScrollExtension();

		assert.ok(!oScrollExtension._ExtensionHelper, "No debug mode: ExtensionHelper is not accessible");
		assert.ok(!oScrollExtension._ExtensionDelegate, "No debug mode: ExtensionDelegate is not accessible");
		assert.ok(!oScrollExtension._HorizontalScrollingHelper, "No debug mode: HorizontalScrollingHelper is not accessible");
		assert.ok(!oScrollExtension._VerticalScrollingHelper, "No debug mode: VerticalScrollingHelper is not accessible");

		oScrollExtension._debug();
		assert.ok(oScrollExtension._ExtensionHelper, "Debug mode: ExtensionHelper is accessible");
		assert.ok(oScrollExtension._ExtensionDelegate, "Debug mode: ExtensionDelegate is accessible");
		assert.ok(oScrollExtension._HorizontalScrollingHelper, "Debug mode: HorizontalScrollingHelper is accessible");
		assert.ok(oScrollExtension._VerticalScrollingHelper, "Debug mode: VerticalScrollingHelper is accessible");
	});

	QUnit.module("Destruction", {
		beforeEach: function () {
			createTables();
		}
	});

	QUnit.test("destroy()", function (assert) {
		var oExtension = oTable._getScrollExtension();
		oTable.destroy();
		assert.ok(!oExtension.getTable(), "Table cleared");
		assert.ok(!oExtension._delegate, "Delegate cleared");
	});

	QUnit.module("Scrollbars", {
		beforeEach: function () {
			this.sOriginalWidth = document.getElementById("content").style.width;
			this.sOriginalHeight = document.getElementById("content").style.height;

			document.getElementById("content").style.width = "300px";
			document.getElementById("content").style.height = "100px";

			createTables();

			this.oScrollExtension = oTable._getScrollExtension();
			this.oHSb = this.oScrollExtension.getHorizontalScrollbar();
			this.oVSb = this.oScrollExtension.getVerticalScrollbar();
			this.oScrollExtension._debug();
		},
		afterEach: function () {
			document.getElementById("content").style.width = this.sOriginalWidth;
			document.getElementById("content").style.height = this.sOriginalHeight;
			destroyTables();
		}
	});

	QUnit.test("Horizontal scrollbar visibility", function (assert) {
		assert.ok(this.oHSb.offsetWidth > 0 && this.oHSb.offsetHeight > 0, "Table content does not fit width -> Horizontal scrollbar is visible");

		destroyTables();
		document.getElementById("content").style.width = this.sOriginalWidth;
		createTables();
		assert.ok(this.oHSb.offsetWidth === 0 && this.oHSb.offsetHeight === 0, "Table content fits width -> Horizontal scrollbar is not visible");
	});

	QUnit.test("Vertical scrollbar visibility", function (assert) {
		assert.ok(this.oVSb.offsetWidth > 0 && this.oVSb.offsetHeight > 0, "Table content does not fit height -> Vertical scrollbar is visible");

		destroyTables();
		document.getElementById("content").style.height = this.sOriginalHeight;
		createTables();
		assert.ok(this.oVSb.offsetWidth === 0 && this.oVSb.offsetHeight === 0, "Table content fits height -> Vertical scrollbar is not visible");
	});

	QUnit.test("Restoration of scrolling positions", function (assert) {
		var iAssertionDelay = 100;
		var done = assert.async();
		var that = this;

		function assertScrollPositions(sAction, iHorizontalScrollPosition, iVerticalScrollPosition) {
			var oHSb = that.oScrollExtension.getHorizontalScrollbar();
			var oVSb = that.oScrollExtension.getVerticalScrollbar();
			var oHeaderScroll = oTable.getDomRef("sapUiTableColHdrScr");
			var oContentScroll = oTable.getDomRef("sapUiTableCtrlScr");

			assert.strictEqual(oHSb.scrollLeft, iHorizontalScrollPosition, sAction + ":  The horizontal scroll position is " + iHorizontalScrollPosition);
			assert.ok(oHSb.scrollLeft === oHeaderScroll.scrollLeft && oHSb.scrollLeft === oContentScroll.scrollLeft,
				sAction + ":  The horizontal scroll positions are synchronized" +
				" [HSb: " + oHSb.scrollLeft + ", Header: " + oHeaderScroll.scrollLeft + ", Content: " + oContentScroll.scrollLeft + "]");
			assert.strictEqual(oVSb.scrollTop, iVerticalScrollPosition, sAction + ":  The vertical scroll position is " + iVerticalScrollPosition);
		}

		function assertOnAfterRenderingEventHandlerCall(sAction) {
			assert.ok(that.oOnAfterRenderingEventHandler.calledOnce, sAction + ": The onAfterRendering event handler of the scrolling extension has been called once");
			that.oOnAfterRenderingEventHandler.reset();
		}

		new Promise(function (resolve) {
			window.setTimeout(function () {
				assertScrollPositions("Initial", 0, 0);
				that.oScrollExtension.getHorizontalScrollbar().scrollLeft = 50;
				that.oScrollExtension.getVerticalScrollbar().scrollTop = 55;
				resolve();
			}, iAssertionDelay);
		}).then(function () {
			return new Promise(function (resolve) {
				window.setTimeout(function () {
					assertScrollPositions("Scrolled", 50, 55);
					that.oOnAfterRenderingEventHandler = sinon.spy(that.oScrollExtension._ExtensionDelegate, "onAfterRendering");
					oTable.rerender();
					resolve();
				}, iAssertionDelay);
			});
		}).then(function () {
			return new Promise(function (resolve) {
				window.setTimeout(function () {
					assertOnAfterRenderingEventHandlerCall("Rerendered");
					assertScrollPositions("Rerendered", 50, 55);
					oTable.invalidate();
					resolve();
				}, iAssertionDelay);
			});
		}).then(function () {
			return new Promise(function (resolve) {
				window.setTimeout(function () {
					assertOnAfterRenderingEventHandlerCall("Invalidated");
					assertScrollPositions("Invalidated", 50, 55);
					oTable.setProperty("visibleRowCountMode", sap.ui.table.VisibleRowCountMode.Auto, true);
					oTable._updateTableSizes();
					resolve();
				}, iAssertionDelay);
			});
		}).then(function () {
			window.setTimeout(function () {
				assertOnAfterRenderingEventHandlerCall("Content updated");
				assertScrollPositions("Content updated", 50, 55);
				done();
			}, iAssertionDelay);
		});
	});

	QUnit.module("Horizontal scrolling", {
		beforeEach: function () {
			this.sOriginalWidth = document.getElementById("content").style.width;
			document.getElementById("content").style.width = "300px";

			createTables();

			this.oScrollExtension = oTable._getScrollExtension();
			this.oScrollExtension._debug();

			this.oHSb = this.oScrollExtension.getHorizontalScrollbar();
			this.oHeaderScroll = oTable.getDomRef("sapUiTableColHdrScr");
			this.oContentScroll = oTable.getDomRef("sapUiTableCtrlScr");
		},
		afterEach: function () {
			document.getElementById("content").style.width = this.sOriginalWidth;
			destroyTables();
		},
		assertSynchronization: function (assert, iScrollPosition) {
			if (iScrollPosition == null) {
				iScrollPosition = this.oHSb.scrollLeft;
			}

			var bIsSynchronized = this.oHSb.scrollLeft === iScrollPosition &&
				(this.oHSb.scrollLeft === this.oHeaderScroll.scrollLeft && this.oHSb.scrollLeft === this.oContentScroll.scrollLeft);

			assert.ok(bIsSynchronized, "Scroll positions are synchronized at position " + iScrollPosition +
				" [HSb: " + this.oHSb.scrollLeft + ", Header: " + this.oHeaderScroll.scrollLeft + ", Content: " + this.oContentScroll.scrollLeft + "]");
		}
	});

	QUnit.test("Imitating scrollbar scrolling", function (assert) {
		var done = assert.async();
		var iAssertionDelay = 50;

		// Scroll right to 200
		/* eslint-disable no-loop-func */
		for (var i = 1; i <= 20; i++) {
			window.setTimeout(function (_i) {
				this.oHSb.scrollLeft = _i * 10;

				if (_i === 20) { // Delay the asserts so that all the scroll event handlers can be called before.
					window.setTimeout(function () {
						assert.strictEqual(this.oHSb.scrollLeft, 200, "Horizontal scrollbar scroll position is 200");
						assert.strictEqual(this.oHeaderScroll.scrollLeft, 200, "Header scroll position is 200");
						assert.strictEqual(this.oContentScroll.scrollLeft, 200, "Content scroll position is 200");
						scrollLeftTo20.bind(this)();
					}.bind(this), iAssertionDelay);
				}

			}.bind(this, i), i);
		}

		function scrollLeftTo20() {
			for (var i = 1; i <= 18; i++) {
				window.setTimeout(function (_i) {
					this.oHSb.scrollLeft = 200 - _i * 10;

					if (_i === 18) { // Delay the asserts so that all the scroll event handlers can be called before.
						window.setTimeout(function () {
							assert.strictEqual(this.oHSb.scrollLeft, 20, "Horizontal scrollbar scroll position is 20");
							assert.strictEqual(this.oHeaderScroll.scrollLeft, 20, "Header scroll position is 20");
							assert.strictEqual(this.oContentScroll.scrollLeft, 20, "Content scroll position is 20");
							done();
						}.bind(this), iAssertionDelay);
					}

				}.bind(this, i), i);
			}
		}
		/* eslint-enable no-loop-func */
	});

	QUnit.test("Imitating Arrow Left/Right and Home/End key navigation", function (assert) {
		var done = assert.async();
		var that = this;
		var iNumberOfCols = oTable.getColumns().length;
		var iAssertionDelay = 50;

		// Start at the first cell in the header.
		var iRowIndex = 0;
		var iColIndex = 0;
		var oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());
		oCell.focus();

		function navigateHorizontal(bRight) {
			return new Promise(
				function (resolve) {
					iColIndex = bRight ? iColIndex + 1 : iColIndex - 1;

					var sKey = bRight ? "ARROW_RIGHT" : "ARROW_LEFT";
					qutils.triggerKeydown(oCell, sKey, false, false, false);

					if (iRowIndex === 0) {
						oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());
					} else {
						oCell = jQuery.sap.domById(oTable.getId() + "-rows-row" + (iRowIndex - 1) + "-col" + iColIndex);
					}

					window.setTimeout(function () {
						that.assertSynchronization(assert);
						resolve();
					}, iAssertionDelay);
				}
			);
		}

		// Header: Navigate from the first column header cell to the last.
		navigateHorizontal(true).then(function () {	// 2
			return navigateHorizontal(true);		// 3
		}).then(function () {
			return navigateHorizontal(true);		// 4
		}).then(function () {
			return navigateHorizontal(true);		// 5
		}).then(function () {

			// Header: Navigate to the content.
			iRowIndex++;
			qutils.triggerKeydown(oCell, "ARROW_DOWN", false, false, false);
			oCell = jQuery.sap.domById(oTable.getId() + "-rows-row" + (iRowIndex - 1) + "-col" + iColIndex);

			// Content: Navigate to the first cell.
			return navigateHorizontal(false);		// 4
		}).then(function () {
			return navigateHorizontal(false);		// 3
		}).then(function () {
			return navigateHorizontal(false);		// 2
		}).then(function () {
			return navigateHorizontal(false);		// 1
		}).then(function () {

			// Content: Navigate to the last cell.
			return navigateHorizontal(true);		// 2
		}).then(function () {
			return navigateHorizontal(true);		// 3
		}).then(function () {
			return navigateHorizontal(true);		// 4
		}).then(function () {
			return navigateHorizontal(true);		// 5
		}).then(function () {

			// Content: Navigate to the header.
			iRowIndex--;
			qutils.triggerKeydown(oCell, "ARROW_UP", false, false, false);
			oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());

			// Header: Navigate to the first cell.
			return navigateHorizontal(false);		// 4
		}).then(function () {
			return navigateHorizontal(false);		// 3
		}).then(function () {
			return navigateHorizontal(false);		// 2
		}).then(function () {
			return navigateHorizontal(false);		// 1
		}).then(function () {

			// Header: Navigate to the last cell.
			iColIndex = iNumberOfCols - 1;
			qutils.triggerKeydown(oCell, "END", false, false, false);
			oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());

			return new Promise(
				function (resolve) {
					window.setTimeout(function () {
						that.assertSynchronization(assert);
						resolve();
					}, iAssertionDelay);
				}
			);

			// Header: Navigate to the first cell.
		}).then(function () {
			return navigateHorizontal(false);		// 4
		}).then(function () {
			return navigateHorizontal(false);		// 3
		}).then(function () {
			return navigateHorizontal(false);		// 2
		}).then(function () {
			return navigateHorizontal(false);		// 1
		}).then(function () {

			// Header: Navigate to the content.
			iRowIndex++;
			qutils.triggerKeydown(oCell, "ARROW_DOWN", false, false, false);
			oCell = jQuery.sap.domById(oTable.getId() + "-rows-row" + (iRowIndex - 1) + "-col" + iColIndex);

			// Content: Navigate to the last cell.
			return navigateHorizontal(true);		// 2
		}).then(function () {
			return navigateHorizontal(true);		// 3
		}).then(function () {
			return navigateHorizontal(true);		// 4
		}).then(function () {
			return navigateHorizontal(true);		// 5
		}).then(function () {

			// Content: Navigate to the first cell.
			return navigateHorizontal(false);		// 4
		}).then(function () {
			return navigateHorizontal(false);		// 3
		}).then(function () {
			return navigateHorizontal(false);		// 2
		}).then(function () {
			return navigateHorizontal(false);		// 1
		}).then(function () {

			// Content: Navigate to the header.
			iRowIndex--;
			qutils.triggerKeydown(oCell, "ARROW_UP", false, false, false);
			oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());

			// Header: Navigate to the last cell.
			return navigateHorizontal(true);		// 2
		}).then(function () {
			return navigateHorizontal(true);		// 3
		}).then(function () {
			return navigateHorizontal(true);		// 4
		}).then(function () {
			return navigateHorizontal(true);		// 5
		}).then(function () {

			// Navigate to the first cell in the header.
			qutils.triggerKeydown(oCell, "HOME", false, false, false);

			window.setTimeout(function () {
				that.assertSynchronization(assert, 0);
				done();
			}, iAssertionDelay);
		});
	});

	QUnit.test("Imitating mouse wheel", function (assert) {
		var done = assert.async();
		var that = this;
		var iAssertionDelay = 100;
		var oTarget;
		var iCurrentScrollPosition = this.oHSb.scrollLeft;

		function scrollWithMouseWheel(oTarget, iScrollDelta, iExpectedScrollPosition, bValidTarget) {
			return new Promise(
				function (resolve) {
					var sEventType = "wheel";

					if (Device.browser.firefox) {
						sEventType = "MozMousePixelScroll";
					}

					/*eslint-disable new-cap */
					var oEvent = jQuery.Event({type: sEventType});
					/*eslint-enable new-cap */

					oEvent.shiftKey = true;
					oEvent.originalEvent.shiftKey = true;

					if (Device.browser.firefox) {
						oEvent.originalEvent.detail = iScrollDelta;
					} else {
						oEvent.originalEvent.deltaX = iScrollDelta;
					}

					jQuery(oTarget).trigger(oEvent);

					window.setTimeout(function () {
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
		scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition + 150, true).then(function () {
			return scrollWithMouseWheel(oTarget, 50, iCurrentScrollPosition + 50, true);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition - 150, true);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, -50, iCurrentScrollPosition - 50, true);
		}).then(function () {

			oTarget = getCell(2, 2); // Cell in scrollable column.
			return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition + 150, true);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, 50, iCurrentScrollPosition + 50, true);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition - 150, true);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, -50, iCurrentScrollPosition - 50, true);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, -50, 0, true);
		}).then(function () {

			oTarget = getSelectAll();
			return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition, false);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition, false);
		}).then(function () {

			oTarget = getColumnHeader(1);
			return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition, false);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition, false);
		}).then(function () {

			oTarget = getRowHeader(0);
			return scrollWithMouseWheel(oTarget, 150, iCurrentScrollPosition + 150, true);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, 50, iCurrentScrollPosition + 50, true);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, -150, iCurrentScrollPosition - 150, true);
		}).then(function () {
			return scrollWithMouseWheel(oTarget, -50, iCurrentScrollPosition - 50, true);
		}).then(function () {
			done();
		});
	});

	QUnit.test("Imitating touch", function (assert) {
		var done = assert.async();
		var that = this;
		var iTouchPosition;
		var iCurrentScrollPosition = this.oHSb.scrollLeft;
		var oScrollDelegate = oTable._getScrollExtension()._ExtensionDelegate;
		var oTarget = oTable.getDomRef("tableCCnt");
		var iAssertionDelay = 100;

		function touchStart(oTarget, iPageX) {
			iTouchPosition = iPageX;

			var oTouchStartEventData = jQuery.Event("touchstart", {
				target: oTarget,
				touches: [{
					pageX: iPageX,
					pageY: 0
				}],
				originalEvent: {touches: true}
			});
			oScrollDelegate._ontouchstart.call(oTable, oTouchStartEventData);
		}

		function touchMove(oTarget, iScrollDelta, iExpectedScrollPosition) {
			return new Promise(
				function (resolve) {
					iTouchPosition -= iScrollDelta;

					var oTouchMoveEventData = jQuery.Event("touchmove", {
						target: oTarget,
						touches: [{
							pageX: iTouchPosition,
							pageY: 0
						}],
						originalEvent: {touches: true}
					});
					oScrollDelegate._ontouchmove.call(oTable, oTouchMoveEventData);

					window.setTimeout(function () {
						that.assertSynchronization(assert, iExpectedScrollPosition);
						iCurrentScrollPosition = iExpectedScrollPosition;
						resolve();
					}, iAssertionDelay);
				}
			);
		}

		touchStart(oTarget, 200);
		touchMove(oTarget, 150, iCurrentScrollPosition + 150).then(function () {
			return touchMove(oTarget, 50, iCurrentScrollPosition + 50);
		}).then(function () {
			return touchMove(oTarget, -150, iCurrentScrollPosition - 150);
		}).then(function () {
			return touchMove(oTarget, -50, iCurrentScrollPosition - 50);
		}).then(function () {
			done();
		});
	});

	QUnit.module("Public methods", {
		beforeEach: function () {
			this.sOriginalWidth = document.getElementById("content").style.width;
			this.sOriginalHeight = document.getElementById("content").style.height;

			document.getElementById("content").style.width = "300px";
			document.getElementById("content").style.height = "100px";

			createTables();

			this.oScrollExtension = oTable._getScrollExtension();
			this.oHSb = this.oScrollExtension.getHorizontalScrollbar();
			this.oVSb = this.oScrollExtension.getVerticalScrollbar();
		},
		afterEach: function () {
			document.getElementById("content").style.width = this.sOriginalWidth;
			document.getElementById("content").style.height = this.sOriginalHeight;
			destroyTables();
		}
	});

	QUnit.test("scroll", function (assert) {
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

	QUnit.test("scrollMax", function (assert) {
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

	QUnit.test("getHorizontalScrollbar", function (assert) {
		assert.strictEqual(this.oScrollExtension.getHorizontalScrollbar(), oTable.getDomRef(sap.ui.table.SharedDomRef.HorizontalScrollBar), "Returned: Horizontal scrollbar element");

		this.stub(this.oScrollExtension, "getTable").returns(undefined);
		assert.strictEqual(this.oScrollExtension.getHorizontalScrollbar(), null, "Returned null: The ScrollExtension has no reference to the table");
	});

	QUnit.test("getVerticalScrollbar", function (assert) {
		assert.strictEqual(this.oScrollExtension.getVerticalScrollbar(), oTable.getDomRef(sap.ui.table.SharedDomRef.VerticalScrollBar), "Returned: Vertical scrollbar element");

		this.stub(this.oScrollExtension, "getTable").returns(undefined);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollbar(), null, "Returned null: The ScrollExtension has no reference to the table");
	});

	QUnit.test("isHorizontalScrollbarVisible", function (assert) {
		assert.ok(this.oScrollExtension.isHorizontalScrollbarVisible(), "Table content does not fit width -> Horizontal scrollbar is visible");

		destroyTables();
		document.getElementById("content").style.width = this.sOriginalWidth;
		createTables();
		assert.ok(!this.oScrollExtension.isHorizontalScrollbarVisible(), "Table content fits width -> Horizontal scrollbar is not visible");
	});

	QUnit.test("isVerticalScrollbarVisible", function (assert) {
		assert.ok(this.oScrollExtension.isVerticalScrollbarVisible(), "Table content does not fit height -> Vertical scrollbar is visible");

		destroyTables();
		document.getElementById("content").style.height = this.sOriginalHeight;
		createTables();
		assert.ok(!this.oScrollExtension.isVerticalScrollbarVisible(), "Table content fits height -> Vertical scrollbar is not visible");
	});


	QUnit.module("Vertical scrolling", {
		beforeEach: function () {
			createTables();

			this.oDefaultSetting = {
				length: 30,
				visibleRowCount: 10,
				expectedFirstVisibleRow: 0,
				tolerance: 0,
				scrollTop: 0,
				rowHeight: 50,
				variableRowHeight: false
			};

			this.iAssertionDelay = 75;
		},
		afterEach: function () {
			destroyTables();
		},
		doTest: function (assert, oSetting) {
			var done = assert.async();
			oSetting = jQuery.extend({}, this.oDefaultSetting, oSetting);
			oTable.setVisibleRowCount(oSetting.visibleRowCount);
			oTable.setRowHeight(oSetting.rowHeight);
			oTable.unbindRows();
			oTable.bindRows("/rows");
			oTable._bVariableRowHeightEnabled = oSetting.variableRowHeight;
			if (oTable._bVariableRowHeightEnabled) {
				oTable.setFixedRowCount(0);
				oTable.setFixedBottomRowCount(0);
				oTable._collectRowHeights = function () {
					var oDomRef = this.getDomRef();
					if (!oDomRef) {
						return [];
					}
					var aResult = [];
					for (var i = 0; i < oSetting.visibleRowCount; i++) {
						aResult.push(i == 1 ? 70 : oSetting.rowHeight);
					}
				};
			}
			oTable.getBinding("rows").getLength = function () {
				return oSetting.length;
			};
			sap.ui.getCore().applyChanges();

			var iDelay = this.iAssertionDelay;

			setTimeout(function () {
				var oVSb = oTable.getDomRef(sap.ui.table.SharedDomRef.VerticalScrollBar);
				oVSb.scrollTop = oSetting.scrollTop;

				setTimeout(function () {
					var iExpectedFirstVisibleRow = oSetting.expectedFirstVisibleRow;
					if (typeof oSetting.expectedFirstVisibleRow === "function") {
						iExpectedFirstVisibleRow = oSetting.expectedFirstVisibleRow();
					}
					if (oSetting.tolerance > 0) {
						assert.ok(oTable.getFirstVisibleRow() >= iExpectedFirstVisibleRow - oSetting.tolerance, "Check FirstVisibleRow (>)");
						assert.ok(oTable.getFirstVisibleRow() <= iExpectedFirstVisibleRow + oSetting.tolerance, "Check FirstVisibleRow (<)");
					} else {
						assert.strictEqual(oTable.getFirstVisibleRow(), iExpectedFirstVisibleRow, "Check FirstVisibleRow");
					}
					done();
				}, iDelay);
			}, iDelay);
		}
	});

	QUnit.test("To Middle - small data - no variable row heights", function (assert) {

		this.doTest(assert, {scrollTop: 750, expectedFirstVisibleRow: 15});
	});

	QUnit.test("To End - small data - no variable row heights", function (assert) {
		this.doTest(assert, {scrollTop: 1000, expectedFirstVisibleRow: 20});
	});

	QUnit.test("To Middle - big data - no variable row heights", function (assert) {
		this.doTest(assert, {
			length: 20000000,
			tolerance: 5200,
			scrollTop: oTable._iMaxScrollbarHeight / 2,
			expectedFirstVisibleRow: 10000000
		});
	});

	QUnit.test("To End - big data - no variable row heights", function (assert) {
		this.doTest(assert, {
			length: 20000000,
			scrollTop: oTable._iMaxScrollbarHeight,
			expectedFirstVisibleRow: 20000000 - 10
		});
	});

	QUnit.test("To Middle - small data - variable row heights", function (assert) {
		this.doTest(assert, {scrollTop: 750, expectedFirstVisibleRow: 15});
	});

	QUnit.test("To End - small data - variable row heights", function (assert) {
		this.doTest(assert, {scrollTop: 1000, expectedFirstVisibleRow: 20});
	});

	QUnit.test("To Middle - big data - variable row heights", function (assert) {
		this.doTest(assert, {
			length: 20000000,
			tolerance: 5200,
			scrollTop: oTable._iMaxScrollbarHeight / 2,
			expectedFirstVisibleRow: 10000000
		});
	});

	QUnit.test("To End - big data - variable row heights", function (assert) {
		this.doTest(assert, {
			length: 20000000,
			scrollTop: oTable._iMaxScrollbarHeight,
			expectedFirstVisibleRow: 20000000 - 10
		});
	});

}());