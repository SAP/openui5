/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/rowmodes/FixedRowMode",
	"sap/ui/table/rowmodes/AutoRowMode",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device",
	"sap/ui/table/library",
	"sap/ui/table/Column",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Context",
	"sap/ui/model/ChangeReason"
], function(TableQUnitUtils, qutils, Table, TreeTable, RowAction, RowActionItem, FixedRowMode, AutoRowMode, TableUtils, Device, tableLibrary, Column,
			Control, JSONModel, Context, ChangeReason) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var initRowActions = window.initRowActions;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var iNumberOfRows = window.iNumberOfRows;

	// Shortcuts
	var VisibleRowCountMode = tableLibrary.VisibleRowCountMode;

	var MouseWheelDeltaMode = {
		PIXEL: 0,
		LINE: 1,
		PAGE: 2
	};

	function createMouseWheelEvent(iScrollDelta, iDeltaMode, bShift) {
		var oWheelEvent;

		if (typeof Event === "function") {
			oWheelEvent = new window.WheelEvent("wheel", {
				deltaY: bShift ? 0 : iScrollDelta,
				deltaX: bShift ? iScrollDelta : 0,
				deltaMode: iDeltaMode,
				shiftKey: bShift,
				bubbles: true,
				cancelable: true
			});
		} else { // IE or PhantomJS
			oWheelEvent = document.createEvent("Event");
			oWheelEvent.deltaY = bShift ? 0 : iScrollDelta;
			oWheelEvent.deltaX = bShift ? iScrollDelta : 0;
			oWheelEvent.deltaMode = iDeltaMode;
			oWheelEvent.shiftKey = bShift;
			oWheelEvent.initEvent("wheel", true, true);

			if (Device.browser.msie) {
				var fnOriginalPreventDefault = oWheelEvent.preventDefault;
				var bDefaultPrevented = false;

				Object.defineProperty(oWheelEvent, "defaultPrevented", {
					get: function() {
						return bDefaultPrevented;
					},
					set: function(value) {
						bDefaultPrevented = value;
					}
				});

				oWheelEvent.preventDefault = function() {
					fnOriginalPreventDefault.apply(this, arguments);
					oWheelEvent.defaultPrevented = true;
				};
			}
		}

		return oWheelEvent;
	}

	var iTouchPositionX;
	var iTouchPositionY;
	var oTouchTargetElement;

	function initTouchScrolling(oTargetElement, iPageX, iPageY) {
		var oTouchEvent;

		oTouchTargetElement = oTargetElement;
		iTouchPositionX = iPageX || 0;
		iTouchPositionY = iPageY || 0;

		if (typeof Event === "function" && typeof window.Touch === "function") {
			var oTouchObject = new window.Touch({
				identifier: Date.now(),
				target: oTouchTargetElement,
				pageX: iTouchPositionX,
				pageY: iTouchPositionY
			});

			oTouchEvent = new window.TouchEvent("touchstart", {
				bubbles: true,
				cancelable: true,
				touches: [oTouchObject]
			});
		} else { // Firefox, Edge, IE, PhantomJS
			oTouchEvent = document.createEvent("Event");
			oTouchEvent.touches = [
				{
					pageX: iTouchPositionX,
					pageY: iTouchPositionY
				}
			];
			oTouchEvent.initEvent("touchstart", true, true);
		}

		oTouchTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
	}

	function doTouchScrolling(iScrollDeltaX, iScrollDeltaY) {
		var oTouchEvent;

		iTouchPositionX -= iScrollDeltaX || 0;
		iTouchPositionY -= iScrollDeltaY || 0;

		if (typeof Event === "function" && typeof window.Touch === "function") {
			var oTouchObject = new window.Touch({
				identifier: Date.now(),
				target: oTouchTargetElement,
				pageX: iTouchPositionX,
				pageY: iTouchPositionY
			});

			oTouchEvent = new window.TouchEvent("touchmove", {
				bubbles: true,
				cancelable: true,
				touches: [oTouchObject]
			});
		} else { // Firefox, Edge, IE, PhantomJS
			oTouchEvent = document.createEvent("Event");
			oTouchEvent.touches = [
				{
					pageX: iTouchPositionX,
					pageY: iTouchPositionY
				}
			];
			oTouchEvent.initEvent("touchmove", true, true);

			if (Device.browser.msie) {
				var fnOriginalPreventDefault = oTouchEvent.preventDefault;
				var bDefaultPrevented = false;

				Object.defineProperty(oTouchEvent, "defaultPrevented", {
					get: function() {
						return bDefaultPrevented;
					},
					set: function(value) {
						bDefaultPrevented = value;
					}
				});

				oTouchEvent.preventDefault = function() {
					fnOriginalPreventDefault.apply(this, arguments);
					oTouchEvent.defaultPrevented = true;
				};
			}
		}

		oTouchTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
	}

	function endTouchScrolling() {
		var oTouchEvent;

		if (typeof Event === "function" && typeof window.Touch === "function") {
			var oTouchObject = new window.Touch({
				identifier: Date.now(),
				target: oTouchTargetElement,
				pageX: iTouchPositionX,
				pageY: iTouchPositionY
			});

			oTouchEvent = new window.TouchEvent("touchend", {
				bubbles: true,
				cancelable: true,
				changedTouches: [oTouchObject]
			});
		} else { // Firefox, Edge, IE, PhantomJS
			oTouchEvent = document.createEvent("Event");
			oTouchEvent.changedTouches = [
				{
					pageX: iTouchPositionX,
					pageY: iTouchPositionY
				}
			];
			oTouchEvent.initEvent("touchend", true, true);
		}

		oTouchTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
	}

	function createScrollEvent() {
		var oScrollEvent;

		if (typeof Event === "function") {
			oScrollEvent = new window.Event("scroll");
		} else {
			oScrollEvent = document.createEvent("Event");
			oScrollEvent.initEvent("scroll", false, false);
		}

		return oScrollEvent;
	}

	function changeRTL(bRTL) {
		return new Promise(function(resolve) {
			sap.ui.getCore().getConfiguration().setRTL(bRTL);
			sap.ui.getCore().applyChanges();

			// Give the text direction change enough time, otherwise the UI might not be ready when the tests start.
			// BCP: 1870395335
			setTimeout(resolve, 500);
		});
	}

	var HeightControl = Control.extend("sap.ui.table.test.HeightControl", {
		metadata: {
			properties: {height: "string", defaultValue: "1px"}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("height", oControl.getHeight());
				oRm.style("width", "100px");
				oRm.style("background-color", "orange");
				oRm.openEnd();
				oRm.close("div");
			}
		},
		setHeight: function(sHeight) {
			this.setProperty("height", sHeight, true);

			var oDomRef = this.getDomRef();
			if (oDomRef != null) {
				oDomRef.style.height = sHeight;
			}
		}
	});

	//*******************************************************************


	QUnit.module("Initialization", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("_init", function(assert) {
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

	QUnit.module("Destruction", {
		beforeEach: function() {
			createTables();
		}
	});

	QUnit.test("destroy", function(assert) {
		var oExtension = oTable._getScrollExtension();
		oTable.destroy();
		assert.ok(!oExtension.getTable(), "Table cleared");
		assert.ok(!oExtension._delegate, "Delegate cleared");
		oTreeTable.destroy();
	});

	QUnit.module("Scrollbars", {
		beforeEach: function() {
			createTables();

			oTreeTable.destroy();
			oTable.getColumns()[1].setWidth("5000px");
			sap.ui.getCore().applyChanges();

			this.oScrollExtension = oTable._getScrollExtension();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Horizontal scrollbar visibility", function(assert) {
		oTable.setFixedColumnCount(0);
		sap.ui.getCore().applyChanges();

		this.oHSb = this.oScrollExtension.getHorizontalScrollbar();

		assert.ok(this.oHSb.offsetWidth > 0 && this.oHSb.offsetHeight > 0,
			"Table content does not fit width -> Horizontal scrollbar is visible");

		oTable.getColumns()[1].setWidth("10px");
		sap.ui.getCore().applyChanges();

		this.oHSb = this.oScrollExtension.getHorizontalScrollbar();

		assert.ok(this.oHSb.offsetWidth === 0 && this.oHSb.offsetHeight === 0,
			"Table content fits width -> Horizontal scrollbar is not visible");
	});

	QUnit.test("Vertical scrollbar visibility", function(assert) {
		var done = assert.async();
		sinon.stub(oTable, "_getTotalRowCount").returns(4);
		oTable.setVisibleRowCount(3);
		sap.ui.getCore().applyChanges();

		this.oVSb = this.oScrollExtension.getVerticalScrollbar();

		assert.ok(this.oVSb.offsetWidth > 0 && this.oVSb.offsetHeight > 0,
			"Table content does not fit height -> Vertical scrollbar is visible");

		oTable._getTotalRowCount.returns(3);
		oTable.invalidate();
		sap.ui.getCore().applyChanges();

		this.oVSb = this.oScrollExtension.getVerticalScrollbar();

		assert.ok(this.oVSb.offsetWidth === 0 && this.oVSb.offsetHeight === 0,
			"Table content fits height -> Vertical scrollbar is not visible");


		// BCP: 1970484410
		var that = this;
		var iApiVersion = sap.ui.table.TableRenderer.apiVersion;
		oTable.attachEventOnce("_rowsUpdated", function() {
			that.oVSb = that.oScrollExtension.getVerticalScrollbar();

			assert.notEqual(that.oVSb, null,
				"Table is re-rendered without being invalidated -> Vertical scrollbar exists");
			if (that.oVSb) {
				assert.ok(that.oVSb.offsetWidth > 0 && that.oVSb.offsetHeight > 0,
					"Table content does not fit height -> Vertical scrollbar is visible");
			}

			sap.ui.table.TableRenderer.apiVersion = iApiVersion;
			oTable._getTotalRowCount.restore();
			done();
		});

		sap.ui.table.TableRenderer.apiVersion = 1;
		oTable._getTotalRowCount.returns(4);
		oTable.bindRows({
			path: "/"
		});
		oTable.rerender();
	});

	QUnit.test("Vertical scrollbar height if variable row heights enabled", function(assert) {
		oTable.setVisibleRowCount(10);
		oTable._bVariableRowHeightEnabled = true;
		oTable.addColumn(new Column({
			template: new HeightControl({
				height: "150px"
			})
		}));
		sap.ui.getCore().applyChanges();

		var oVsb = oTable._getScrollExtension().getVerticalScrollbar();
		var iVSbHeight = oVsb.clientHeight;

		assert.equal(iVSbHeight, 10 * oTable._getBaseRowHeight(), "iVSbHeight is correct");
	});

	QUnit.module("Extension methods", {
		beforeEach: function() {
			createTables();

			this.oScrollExtension = oTable._getScrollExtension();
			this.oHSb = this.oScrollExtension.getHorizontalScrollbar();
			this.oVSb = this.oScrollExtension.getVerticalScrollbar();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("scrollVertically", function(assert) {
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
				bScrolled = this.oScrollExtension.scrollVertically(true, false);
				assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
				assert.equal(oTable.getFirstVisibleRow(), i + 1, "First visible row after scroll");
			} else {
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row before scroll (forward, stepwise, " + i + ")");
				bScrolled = this.oScrollExtension.scrollVertically(true, false);
				assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row after scroll");
			}
		}

		for (i = 0; i < iNotVisibleRows + 2; i++) {
			if (i < iNotVisibleRows) {
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows - i, "First visible row before scroll (backward, stepwise, " + i + ")");
				bScrolled = this.oScrollExtension.scrollVertically(false, false);
				assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows - i - 1, "First visible row after scroll");
			} else {
				assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scroll (backward, stepwise, " + i + ")");
				bScrolled = this.oScrollExtension.scrollVertically(false, false);
				assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
				assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scroll");
			}
		}

		var iPos = 0;
		for (i = 0; i < iPages + 2; i++) {
			if (i < iPages - 1) {
				assert.equal(oTable.getFirstVisibleRow(), iPos, "First visible row before scroll (forward, pagewise, " + i + ")");
				bScrolled = this.oScrollExtension.scrollVertically(true, true);
				assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
				iPos = iPos + iPageSize;
				assert.equal(oTable.getFirstVisibleRow(), Math.min(iPos, iNotVisibleRows), "First visible row after scroll");
			} else {
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row before scroll (forward, pagewise, " + i + ")");
				bScrolled = this.oScrollExtension.scrollVertically(true, true);
				assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row after scroll");
			}
		}

		iPos = iNotVisibleRows;
		for (i = 0; i < iPages + 2; i++) {
			if (i < iPages - 1) {
				assert.equal(oTable.getFirstVisibleRow(), iPos, "First visible row before scroll (backward, pagewise, " + i + ")");
				bScrolled = this.oScrollExtension.scrollVertically(false, true);
				assert.ok(bScrolled, "scroll function indicates that scrolling was performed");
				iPos = iPos - iPageSize;
				assert.equal(oTable.getFirstVisibleRow(), Math.max(iPos, 0), "First visible row after scroll");
			} else {
				assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scroll (backward, pagewise, " + i + ")");
				bScrolled = this.oScrollExtension.scrollVertically(false, true);
				assert.ok(!bScrolled, "scroll function indicates that no scrolling was performed");
				assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scroll");
			}
		}
	});

	QUnit.test("scrollVerticallyMax", function(assert) {
		var bScrolled;

		/* More data rows than visible rows */
		// ↓ Down
		assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
		bScrolled = this.oScrollExtension.scrollVerticallyMax(true);
		assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
		assert.equal(oTable.getFirstVisibleRow(), iNumberOfRows - oTable.getVisibleRowCount(), "First visible row after scrolling");
		// ↑ Up
		bScrolled = this.oScrollExtension.scrollVerticallyMax(false);
		assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
		assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

		/* Less data rows than visible rows */
		oTable.setVisibleRowCount(10);
		sap.ui.getCore().applyChanges();
		// ↓ Down
		assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
		bScrolled = this.oScrollExtension.scrollVerticallyMax(true);
		assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
		assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
		// ↑ Up
		bScrolled = this.oScrollExtension.scrollVerticallyMax(false);
		assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
		assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

		/* More data rows than visible rows and fixed top/bottom rows */
		oTable.setVisibleRowCount(6);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(2);
		sap.ui.getCore().applyChanges();
		// ↓ Down
		assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
		bScrolled = this.oScrollExtension.scrollVerticallyMax(true);
		assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
		assert.equal(oTable.getFirstVisibleRow(), iNumberOfRows - oTable.getVisibleRowCount(), "First visible row after scrolling");
		// ↑ Up
		bScrolled = this.oScrollExtension.scrollVerticallyMax(false);
		assert.ok(bScrolled, "Scroll function indicates that scrolling was performed");
		assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

		/* Less data rows than visible rows and fixed top/bottom rows */
		oTable.setVisibleRowCount(10);
		sap.ui.getCore().applyChanges();
		// ↓ Down
		assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
		bScrolled = this.oScrollExtension.scrollVerticallyMax(true);
		assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
		assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
		// ↑ Up
		bScrolled = this.oScrollExtension.scrollVerticallyMax(false);
		assert.ok(!bScrolled, "Scroll function indicates that no scrolling was performed");
		assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
	});

	QUnit.test("getHorizontalScrollbar", function(assert) {
		assert.strictEqual(this.oScrollExtension.getHorizontalScrollbar(), oTable.getDomRef(tableLibrary.SharedDomRef.HorizontalScrollBar),
			"Returned: Horizontal scrollbar element");

		this.oScrollExtension.destroy();
		assert.strictEqual(this.oScrollExtension.getHorizontalScrollbar(), null,
			"Returned null: The ScrollExtension is destroyed and has no reference to the table");
	});

	QUnit.test("getVerticalScrollbar", function(assert) {
		assert.strictEqual(this.oScrollExtension.getVerticalScrollbar(), oTable.getDomRef(tableLibrary.SharedDomRef.VerticalScrollBar),
			"Returned the vertical scrollbar");

		var oScrollbar = this.oScrollExtension.getVerticalScrollbar();
		var oScrollbarParent = oScrollbar.parentNode;

		oScrollbarParent.removeChild(oScrollbar);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollbar(), null,
			"Returned null: The scrollbar was removed from DOM");
		assert.strictEqual(this.oScrollExtension.getVerticalScrollbar(true), oScrollbar,
			"Returned the vertical scrollbar: The scrollbar was removed from DOM, but the connection to the DOM is ignored");

		oScrollbarParent.appendChild(oScrollbar);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollbar(), oScrollbar,
			"Returned the vertical scrollbar: The scrollbar was added back to the DOM");

		destroyTables();
		createTables();

		this.oScrollExtension.destroy();
		assert.strictEqual(this.oScrollExtension.getVerticalScrollbar(), null,
			"Returned null: The ScrollExtension is destroyed and has no reference to the table");
	});

	QUnit.test("isHorizontalScrollbarVisible", function(assert) {
		oTable.setFixedColumnCount(0);
		oTable.removeAllColumns();
		oTable.addColumn(new Column({
			label: "large column",
			template: "dummy",
			width: "5000px"
		}));
		sap.ui.getCore().applyChanges();

		assert.ok(this.oScrollExtension.isHorizontalScrollbarVisible(),
			"Table content does not fit width -> Horizontal scrollbar is visible");

		oTable.getColumns()[0].setWidth("10px");
		sap.ui.getCore().applyChanges();

		assert.ok(!this.oScrollExtension.isHorizontalScrollbarVisible(),
			"Table content fits width -> Horizontal scrollbar is not visible");
	});

	QUnit.test("isVerticalScrollbarVisible", function(assert) {
		sinon.stub(oTable, "_getTotalRowCount").returns(4);
		oTable.setVisibleRowCount(3);
		sap.ui.getCore().applyChanges();

		assert.ok(this.oScrollExtension.isVerticalScrollbarVisible(),
			"Table content does not fit height -> Vertical scrollbar is visible");

		oTable._getTotalRowCount.returns(2);
		oTable.invalidate();
		sap.ui.getCore().applyChanges();

		assert.ok(!this.oScrollExtension.isVerticalScrollbarVisible(),
			"Table content fits height -> Vertical scrollbar is not visible");
	});

	QUnit.test("updateHorizontalScrollbar", function(assert) {
		var oTableSizes = oTable._collectTableSizes(oTable._collectRowHeights());
		var oHSbContent = oTable.getDomRef("hsb-content");

		oTable.removeAllColumns();

		oTableSizes.tableCtrlScrWidth = 392;
		oTableSizes.tableCtrlScrollWidth = 393;
		oTableSizes.tableCtrlFixedWidth = 10;
		oTableSizes.tableRowHdrScrWidth = 20;
		this.oScrollExtension.updateHorizontalScrollbar(oTableSizes);
		assert.ok(this.oScrollExtension.isHorizontalScrollbarVisible(), "The scrollbar is visible");
		assert.strictEqual(this.oHSb.style.marginLeft, "30px", "The left margin is correct");
		assert.strictEqual(this.oHSb.style.marginRight, "", "The right margin is correct");
		assert.strictEqual(oHSbContent.style.width, "393px", "The scroll range is correct");

		oTable._bRtlMode = true;
		this.oScrollExtension.updateHorizontalScrollbar(oTableSizes);
		assert.ok(this.oScrollExtension.isHorizontalScrollbarVisible(), "RTL: The scrollbar is visible");
		assert.strictEqual(this.oHSb.style.marginLeft, "", "RTL: The left margin is correct");
		assert.strictEqual(this.oHSb.style.marginRight, "30px", "RTL: The right margin is correct");
		assert.strictEqual(oHSbContent.style.width, "393px", "RTL: The scroll range is correct");

		oTable._bRtlMode = false;
		oTableSizes.tableCtrlScrWidth = 393;
		oTableSizes.tableCtrlFixedWidth = 20;
		oTableSizes.tableRowHdrScrWidth = 30;
		this.oScrollExtension.updateHorizontalScrollbar(oTableSizes);
		assert.ok(!this.oScrollExtension.isHorizontalScrollbarVisible(), "The scrollbar is not visible");
		assert.strictEqual(this.oHSb.style.marginLeft, "", "RTL: The left margin is correct");
		assert.strictEqual(this.oHSb.style.marginRight, "30px", "RTL: The right margin is correct");
		assert.strictEqual(oHSbContent.style.width, "393px", "The scroll range is correct");

		oTableSizes.tableCtrlScrollWidth = 444;
		this.oScrollExtension.updateHorizontalScrollbar(oTableSizes);
		assert.ok(this.oScrollExtension.isHorizontalScrollbarVisible(), "The scrollbar is visible");
		assert.strictEqual(this.oHSb.style.marginLeft, "50px", "The left margin is correct");
		assert.strictEqual(this.oHSb.style.marginRight, "", "The right margin is correct");
		assert.strictEqual(oHSbContent.style.width, "444px", "The scroll range is correct");
	});

	QUnit.test("updateVerticalScrollbarHeight", function(assert) {
		var oGetVerticalScrollbarHeightStub = sinon.stub(this.oScrollExtension, "getVerticalScrollbarHeight");

		function getHeight(oElement) {
			if (Device.browser.msie || Device.browser.edge) {
				return parseInt(window.getComputedStyle(oElement).height);
			} else {
				return oElement.getBoundingClientRect().height;
			}
		}

		var iInitialVSbHeight = getHeight(this.oVSb);

		oGetVerticalScrollbarHeightStub.returns(15);
		this.oScrollExtension.updateVerticalScrollbarHeight();
		assert.strictEqual(getHeight(this.oVSb), 15, "The height is 15px");
		assert.strictEqual(window.getComputedStyle(this.oVSb).maxHeight, "15px", "The maximum height is 15px");

		oGetVerticalScrollbarHeightStub.returns(iInitialVSbHeight);
		this.oScrollExtension.updateVerticalScrollbarHeight();
		assert.strictEqual(getHeight(this.oVSb), iInitialVSbHeight,
			"The height is " + iInitialVSbHeight + "px");
		assert.strictEqual(window.getComputedStyle(this.oVSb).maxHeight, iInitialVSbHeight + "px",
			"The maximum height is " + iInitialVSbHeight + "px");

		oGetVerticalScrollbarHeightStub.restore();
	});

	QUnit.test("updateVerticalScrollbarPosition", function(assert) {
		var iExpectedTopPosition;

		oTable.getDomRef().querySelector(".sapUiTableColHdrCnt").style.height = "78px";
		this.oScrollExtension.updateVerticalScrollbarPosition();
		iExpectedTopPosition = oTable.getDomRef("tableCCnt").offsetTop;
		assert.strictEqual(window.getComputedStyle(this.oVSb).top, iExpectedTopPosition + "px",
			"The top position is " + iExpectedTopPosition + "px");

		oTable.setFixedRowCount(1); // Note: Adds 48px to the top position.
		sap.ui.getCore().applyChanges();
		oTable.getDomRef().querySelector(".sapUiTableColHdrCnt").style.height = "78px";
		this.oScrollExtension.updateVerticalScrollbarPosition();
		iExpectedTopPosition = oTable.getDomRef("tableCCnt").offsetTop + TableUtils.BaseSize.sapUiSizeCozy;
		assert.strictEqual(window.getComputedStyle(this.oScrollExtension.getVerticalScrollbar()).top, iExpectedTopPosition + "px",
			"The top position is " + iExpectedTopPosition + "px");
	});

	QUnit.test("updateVerticalScrollHeight", function(assert) {
		var oGetVerticalScrollHeightStub = sinon.stub(this.oScrollExtension, "getVerticalScrollHeight");

		oGetVerticalScrollHeightStub.returns(888);
		this.oScrollExtension.updateVerticalScrollHeight();
		assert.strictEqual(this.oVSb.scrollHeight, 888, "The scroll range is 888px");

		oGetVerticalScrollHeightStub.returns(999999);
		this.oScrollExtension.updateVerticalScrollHeight();
		assert.strictEqual(this.oVSb.scrollHeight, 999999, "The scroll range is 999999px");

		oGetVerticalScrollHeightStub.restore();
	});

	QUnit.test("getVerticalScrollHeight", function(assert) {
		var oGetTotalRowCountStub = sinon.stub(oTable, "_getTotalRowCount");
		var oGetRowCountsStub = sinon.stub(oTable, "_getRowCounts");
		var oGetBaseRowHeightStub = sinon.stub(oTable, "_getBaseRowHeight");

		oTable._bVariableRowHeightEnabled = false;
		oGetTotalRowCountStub.returns(11);
		oGetRowCountsStub.returns({
			count: 10
		});
		oGetBaseRowHeightStub.returns(100);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollHeight(), 11 * 100,
			"Total row count > Visible row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(10);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollHeight(), 10 * 100,
			"Total row count = Visible row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(9);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollHeight(), 10 * 100,
			"Total row count < Visible row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(1000000);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollHeight(true), 1000000 * 100,
			"Total row count = 1000000: The vertical scroll height is correct");

		assert.strictEqual(this.oScrollExtension.getVerticalScrollHeight(), 1000000,
			"Total row count = 1000000: The vertical scroll height is at its maximum");

		oTable._bVariableRowHeightEnabled = true;
		oGetTotalRowCountStub.returns(12);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollHeight(), 13 * 100,
			"Variable row heights enabled & Total row count > Visible row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(11);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollHeight(), 12 * 100,
			"Variable row heights enabled & Total row count = Visible row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(10);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollHeight(), 12 * 100,
			"Variable row heights enabled & Total row count < Visible row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(1000000);
		assert.strictEqual(this.oScrollExtension.getVerticalScrollHeight(true), 1000001 * 100,
			"Variable row heights enabled & Total row count = 1000000: The vertical scroll height is correct");

		assert.strictEqual(this.oScrollExtension.getVerticalScrollHeight(), 1000000,
			"Variable row heights enabled & Total row count = 1000000: The vertical scroll height is at its maximum");

		oGetTotalRowCountStub.restore();
		oGetRowCountsStub.restore();
		oGetBaseRowHeightStub.restore();
	});

	QUnit.test("updateVerticalScrollbarVisibility", function(assert) {
		var oIsVerticalScrollbarRequiredStub = sinon.stub(this.oScrollExtension, "isVerticalScrollbarRequired");

		oIsVerticalScrollbarRequiredStub.returns(true);
		this.oScrollExtension.updateVerticalScrollbarVisibility();
		assert.ok(this.oScrollExtension.isVerticalScrollbarVisible(), "The scrollbar is visible");

		oIsVerticalScrollbarRequiredStub.returns(false);
		this.oVSb.scrollTop = 1;
		this.oScrollExtension.updateVerticalScrollbarVisibility();
		assert.ok(!this.oScrollExtension.isVerticalScrollbarVisible(), "The scrollbar is visible");
		assert.strictEqual(this.oVSb.scrollTop, 0, "The scroll position was reset");

		oIsVerticalScrollbarRequiredStub.returns(true);
		this.oScrollExtension.updateVerticalScrollbarVisibility();
		assert.ok(this.oScrollExtension.isVerticalScrollbarVisible(), "The scrollbar is visible");

		oIsVerticalScrollbarRequiredStub.restore();
	});

	QUnit.test("isVerticalScrollbarRequired", function(assert) {
		var oGetTotalRowCountStub = sinon.stub(oTable, "_getTotalRowCount");
		var oGetRowCountsStub = sinon.stub(oTable, "_getRowCounts");
		var that = this;
		oTable._bVariableRowHeightEnabled = true;

		function test(iTotalRowCount, iRowCount, bRowsOverflowViewport, bVSbShouldBeRequired) {
			oGetTotalRowCountStub.returns(iTotalRowCount);
			oGetRowCountsStub.returns({
				count: iRowCount
			});

			if (bRowsOverflowViewport) {
				oTable._aRowHeights = [(oTable._getBaseRowHeight() * iRowCount) + 1];
			} else {
				oTable._aRowHeights = [1];
			}

			assert.strictEqual(that.oScrollExtension.isVerticalScrollbarRequired(), bVSbShouldBeRequired,
				"Total row count: " + iTotalRowCount + ", Visible row count: " + iRowCount + ", Rows overflow viewport: " + bRowsOverflowViewport);
		}

		test(10, 10, false, false); // Total row count <= Visible row count
		test(10, 1, false, true); // Total row count > Visible row count
		test(1, 10, true, true); // Total row count <= Visible row count, but rows overflow viewport
		test(10, 1, true, true); // Total row count > Visible row count

		oTable._bVariableRowHeightEnabled = false;

		test(10, 10, false, false); // Total row count <= Visible row count
		test(10, 1, false, true); // Total row count > Visible row count
		test(1, 10, true, false); // Total row count <= Visible row count, but rows overflow viewport
		test(10, 1, true, true); // Total row count > Visible row count

		oGetTotalRowCountStub.restore();
		oGetRowCountsStub.restore();
	});

	QUnit.test("registerForMouseWheel", function(assert) {
		var Div = document.createElement("div");
		var vReturn = this.oScrollExtension.registerForMouseWheel([Div], this.oScrollExtension.constructor.ScrollDirection.BOTH);

		assert.strictEqual(vReturn, null, "The method should return null without synchronization enabled");
	});

	QUnit.test("registerForTouch", function(assert) {
		var Div = document.createElement("div");
		var vReturn = this.oScrollExtension.registerForMouseWheel([Div], this.oScrollExtension.constructor.ScrollDirection.BOTH);

		assert.strictEqual(vReturn, null, "The method should return null without synchronization enabled");
	});

	QUnit.module("Horizontal scrolling", {
		beforeEach: function() {
			createTables();

			oTable.getColumns()[1].setWidth("1000px");
			sap.ui.getCore().applyChanges();

			this.oScrollExtension = oTable._getScrollExtension();
			this.oHSb = this.oScrollExtension.getHorizontalScrollbar();
			this.oHeaderScroll = oTable.getDomRef("sapUiTableColHdrScr");
			this.oContentScroll = oTable.getDomRef("sapUiTableCtrlScr");
		},
		afterEach: function() {
			destroyTables();
		},
		assertSynchronization: function(assert, iScrollPosition) {
			var oHSb = this.oScrollExtension.getHorizontalScrollbar();
			var oHeaderScroll = oTable.getDomRef("sapUiTableColHdrScr");
			var oContentScroll = oTable.getDomRef("sapUiTableCtrlScr");

			if (iScrollPosition == null) {
				iScrollPosition = oHSb.scrollLeft;
			}

			var bIsSynchronized = oHSb.scrollLeft === iScrollPosition &&
								  (oHSb.scrollLeft === oHeaderScroll.scrollLeft && oHSb.scrollLeft === oContentScroll.scrollLeft);

			assert.ok(bIsSynchronized, "Scroll positions are synchronized at position " + iScrollPosition +
									   " [HSb: " + oHSb.scrollLeft + ", Header: " + oHeaderScroll.scrollLeft + ", Content: "
									   + oContentScroll.scrollLeft + "]");
		}
	});

	QUnit.test("Imitating scrollbar scrolling", function(assert) {
		var done = assert.async();
		var iAssertionDelay = 50;

		// Scroll right to 200
		/* eslint-disable no-loop-func */
		for (var i = 1; i <= 20; i++) {
			window.setTimeout(function(_i) {
				this.oHSb.scrollLeft = _i * 10;

				if (_i === 20) { // Delay the asserts so that all the scroll event handlers can be called before.
					window.setTimeout(function() {
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
				window.setTimeout(function(_i) {
					this.oHSb.scrollLeft = 200 - _i * 10;

					if (_i === 18) { // Delay the asserts so that all the scroll event handlers can be called before.
						window.setTimeout(function() {
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

	QUnit.test("Imitating Arrow Left/Right and Home/End key navigation", function(assert) {
		var that = this;
		var iAssertionDelay = 50;
		var iRowIndex = 0; // Start at the first cell in the header.
		var iColIndex = 0;
		var oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());

		oCell.focus();

		function navigateHorizontal(bRight) {
			return new Promise(function(resolve) {
				iColIndex = bRight ? iColIndex + 1 : iColIndex - 1;

				var sKey = bRight ? "ARROW_RIGHT" : "ARROW_LEFT";
				qutils.triggerKeydown(oCell, sKey, false, false, false);

				if (iRowIndex === 0) {
					oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());
				} else {
					oCell = jQuery.sap.domById(oTable.getId() + "-rows-row" + (iRowIndex - 1) + "-col" + iColIndex);
				}

				window.requestAnimationFrame(function() {
					setTimeout(function() {
						that.assertSynchronization(assert);
						resolve();
					}, iAssertionDelay);
				});
			});
		}

		// Header: Navigate from the first column header cell to the last.
		return navigateHorizontal(true).then(function() { // 2
			return navigateHorizontal(true); // 3
		}).then(function() {
			return navigateHorizontal(true); // 4
		}).then(function() {
			return navigateHorizontal(true); // 5
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
			iColIndex = oTable.columnCount - 1;
			qutils.triggerKeydown(oCell, "END", false, false, false);
			oCell = jQuery.sap.domById((oTable._getVisibleColumns()[iColIndex]).getId());

			return new Promise(
				function(resolve) {
					window.requestAnimationFrame(function() {
						setTimeout(function() {
							that.assertSynchronization(assert);
							resolve();
						}, iAssertionDelay);
					});
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

			return new Promise(function(resolve) {
				window.requestAnimationFrame(function() {
					setTimeout(function() {
						that.assertSynchronization(assert, 0);
						resolve();
					}, iAssertionDelay);
				});
			});
		});
	});

	QUnit.test("Imitating mouse wheel", function(assert) {
		initRowActions(oTable, 1, 1);
		this.oHSb = this.oScrollExtension.getHorizontalScrollbar();
		this.oHeaderScroll = oTable.getDomRef("sapUiTableColHdrScr");
		this.oContentScroll = oTable.getDomRef("sapUiTableCtrlScr");

		var that = this;
		var iAssertionDelay = 100;
		var iCurrentScrollPosition = this.oHSb.scrollLeft;
		var iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		var DeltaMode = MouseWheelDeltaMode;

		function scrollForwardAndBackToBeginning(oTargetElement) {
			that.oHSb.scrollLeft = 0;
			iCurrentScrollPosition = 0;

			return scrollWithMouseWheel(oTargetElement, 150, DeltaMode.PIXEL, true, iCurrentScrollPosition + 150, true).then(function() {
				return scrollWithMouseWheel(oTargetElement, 3, DeltaMode.LINE, true, iCurrentScrollPosition + iMinColumnWidth, true);
			}).then(function() {
				return scrollWithMouseWheel(oTargetElement, 2, DeltaMode.PAGE, true, iCurrentScrollPosition + iMinColumnWidth, true);
			}).then(function() {
				return scrollWithMouseWheel(oTargetElement, -100, DeltaMode.PIXEL, true, iCurrentScrollPosition - 100, true);
			}).then(function() {
				return scrollWithMouseWheel(oTargetElement, -50, DeltaMode.PIXEL, true, iCurrentScrollPosition - 50, true);
			}).then(function() {
				return scrollWithMouseWheel(oTargetElement, -3, DeltaMode.LINE, true, iCurrentScrollPosition - iMinColumnWidth, true);
			}).then(function() {
				return scrollWithMouseWheel(oTargetElement, -2, DeltaMode.PAGE, true, iCurrentScrollPosition - iMinColumnWidth, true);
			});
		}

		function scrollBeyondBoundaries(oTargetElement) {
			that.oHSb.scrollLeft = 0;
			iCurrentScrollPosition = 0;

			return scrollWithMouseWheel(oTargetElement, -150, DeltaMode.PIXEL, true, 0, true).then(function() {
				that.oHSb.scrollLeft = that.oHSb.scrollWidth - that.oHSb.getBoundingClientRect().width;
				iCurrentScrollPosition = that.oHSb.scrollLeft;

				return scrollWithMouseWheel(oTargetElement, 150, DeltaMode.PIXEL, true, iCurrentScrollPosition, true);
			});
		}

		function scrollOnInvalidTarget(oTargetElement) {
			that.oHSb.scrollLeft = 50;
			iCurrentScrollPosition = 50;

			return scrollWithMouseWheel(oTargetElement, 150, DeltaMode.PIXEL, true, iCurrentScrollPosition, false).then(function() {
				return scrollWithMouseWheel(oTargetElement, -150, DeltaMode.PIXEL, true, iCurrentScrollPosition, false);
			});
		}

		function scrollWithMouseWheel(oTargetElement, iScrollDelta, iDeltaMode, bShift, iExpectedScrollPosition, bValidTarget) {
			return new Promise(function(resolve) {
				var oWheelEvent = createMouseWheelEvent(iScrollDelta, iDeltaMode, bShift);

				var oStopPropagationSpy = sinon.spy(oWheelEvent, "stopPropagation");

				oTargetElement.dispatchEvent(oWheelEvent);

				window.setTimeout(function() {
					that.assertSynchronization(assert, iExpectedScrollPosition);

					if (!bValidTarget) {
						assert.ok(!oWheelEvent.defaultPrevented, "Target does not support mousewheel scrolling: Default action was not prevented");
						assert.ok(oStopPropagationSpy.notCalled, "Target does not support mousewheel scrolling: Propagation was not stopped");
					} else if (iCurrentScrollPosition === 0 && iScrollDelta < 0) {
						assert.ok(!oWheelEvent.defaultPrevented, "Scroll position is at the beginning: Default action was not prevented");
						assert.ok(oStopPropagationSpy.notCalled, "Scroll position is at the beginning: Propagation was not stopped");
					} else if (iCurrentScrollPosition === that.oHSb.scrollWidth - that.oHSb.getBoundingClientRect().width && iScrollDelta > 0) {
						assert.ok(!oWheelEvent.defaultPrevented, "Scroll position is at the end: Default action was not prevented");
						assert.ok(oStopPropagationSpy.notCalled, "Scroll position is at the end: Propagation was not stopped");
					} else {
						assert.ok(oWheelEvent.defaultPrevented, "Default action was prevented");
						assert.ok(oStopPropagationSpy.calledOnce, "Propagation was stopped");
					}

					iCurrentScrollPosition = iExpectedScrollPosition;

					resolve();
				}, iAssertionDelay);
			});
		}

		return scrollForwardAndBackToBeginning(getCell(0, 0)[0]).then(function() { // Cell in fixed column.
			return scrollForwardAndBackToBeginning(getCell(2, 2)[0]); // Cell in scrollable column.
		}).then(function() {
			return scrollForwardAndBackToBeginning(getRowHeader(0)[0]);
		}).then(function() {
			return scrollForwardAndBackToBeginning(getRowAction(0)[0]);
		}).then(function() {
			return scrollBeyondBoundaries(getCell(2, 2)[0]); // Cell in scrollable column.
		}).then(function() {
			return scrollOnInvalidTarget(getSelectAll()[0]);
		}).then(function() {
			return scrollOnInvalidTarget(getColumnHeader(1)[0]);
		});
	});

	QUnit.test("Imitating touch", function(assert) {
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;
		Device.support.pointer = false;
		Device.support.touch = true;

		oTable._getKeyboardExtension()._suspendItemNavigation(); // Touch can set the focus, which can lead to scrolling. Prevent it!
		oTable.setFixedRowCount(1);
		oTable.setEnableColumnReordering(false);
		initRowActions(oTable, 1, 1);
		this.oHSb = this.oScrollExtension.getHorizontalScrollbar();
		this.oHeaderScroll = oTable.getDomRef("sapUiTableColHdrScr");
		this.oContentScroll = oTable.getDomRef("sapUiTableCtrlScr");

		var that = this;
		var iAssertionDelay = 100;
		var iCurrentScrollPosition = this.oHSb.scrollLeft;

		function scrollForwardAndBackToBeginning(oTargetElement) {
			that.oHSb.scrollLeft = 0;
			iCurrentScrollPosition = 0;

			initTouchScrolling(oTargetElement, 200);
			return scrollWithTouch(150, iCurrentScrollPosition + 150, true).then(function() {
				return scrollWithTouch(-150, iCurrentScrollPosition - 150, true);
			}).then(function() {
				endTouchScrolling();
			});
		}

		function scrollBeyondBoundaries(oTargetElement) {
			that.oHSb.scrollLeft = 0;
			iCurrentScrollPosition = 0;

			initTouchScrolling(oTargetElement, 200);
			return scrollWithTouch(-150, 0, true).then(function() {
				endTouchScrolling();

				that.oHSb.scrollLeft = that.oHSb.scrollWidth - that.oHSb.getBoundingClientRect().width;
				iCurrentScrollPosition = that.oHSb.scrollLeft;

				initTouchScrolling(oTargetElement, 200);
				return scrollWithTouch(150, iCurrentScrollPosition, true);
			}).then(function() {
				endTouchScrolling();
			});
		}

		function scrollOnInvalidTarget(oTargetElement) {
			that.oHSb.scrollLeft = 50;
			iCurrentScrollPosition = 50;

			initTouchScrolling(oTargetElement, 200);
			return scrollWithTouch(150, iCurrentScrollPosition, false).then(function() {
				endTouchScrolling();
				initTouchScrolling(oTargetElement, 200);
				return scrollWithTouch(-150, iCurrentScrollPosition, false);
			}).then(function() {
				endTouchScrolling();
			});
		}

		function scrollWithTouch(iScrollDelta, iExpectedScrollPosition, bValidTarget) {
			return new Promise(function(resolve) {
				var oTouchEvent = doTouchScrolling(iScrollDelta);

				window.setTimeout(function() {
					that.assertSynchronization(assert, iExpectedScrollPosition);

					// Touch move is also a swipe on touch devices. See the moveHandler method in jquery-mobile-custom.js, to know why
					// preventDefault is always called on touch devices (except in chrome on desktop).

					if (!bValidTarget) {
						if (!bOriginalTouchSupport || bOriginalTouchSupport && Device.system.desktop && Device.browser.chrome) {
							assert.ok(!oTouchEvent.defaultPrevented, "Target does not support touch scrolling: Default action was not prevented");
						} else {
							assert.ok(oTouchEvent.defaultPrevented,
								"Target does not support touch scrolling: Default action was still prevented on a touch device (swipe action)");
						}
					} else if (iCurrentScrollPosition === 0 && iScrollDelta < 0) {
						if (!bOriginalTouchSupport || bOriginalTouchSupport && Device.system.desktop && Device.browser.chrome) {
							assert.ok(!oTouchEvent.defaultPrevented, "Scroll position is already at the beginning: Default action was not prevented");
						} else {
							assert.ok(oTouchEvent.defaultPrevented,
								"Scroll position is already at the beginning: Default action was still prevented on a touch device (swipe action)");
						}
					} else if (iCurrentScrollPosition === that.oHSb.scrollWidth - that.oHSb.getBoundingClientRect().width && iScrollDelta > 0) {
						if (!bOriginalTouchSupport || bOriginalTouchSupport && Device.system.desktop && Device.browser.chrome) {
							assert.ok(!oTouchEvent.defaultPrevented, "Scroll position is already at the end: Default action was not prevented");
						} else {
							assert.ok(oTouchEvent.defaultPrevented,
								"Scroll position is already at the end: Default action was still prevented on a touch device (swipe action)");
						}
					} else {
						assert.ok(oTouchEvent.defaultPrevented, "Default action was prevented");
					}

					iCurrentScrollPosition = iExpectedScrollPosition;

					resolve();
				}, iAssertionDelay);
			});
		}

		return scrollForwardAndBackToBeginning(getCell(0, 0)[0]).then(function() { // Cell in fixed column.
			return scrollForwardAndBackToBeginning(getCell(2, 2)[0]); // Cell in scrollable column.
		}).then(function() {
			return scrollForwardAndBackToBeginning(getRowHeader(0)[0]);
		}).then(function() {
			return scrollForwardAndBackToBeginning(getRowAction(0)[0]);
		}).then(function() {
			return scrollBeyondBoundaries(getCell(2, 2)[0]); // Cell in scrollable column.
		}).then(function() {
			return scrollOnInvalidTarget(getSelectAll()[0]);
		}).then(function() {
			return scrollOnInvalidTarget(getColumnHeader(1)[0]);
		}).then(function() {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("On focus", function(assert) {
		function getHeaderCellDomRef(iColumnIndex) {
			return oTable.getColumns()[iColumnIndex].getDomRef();
		}

		function getDataCellDomRef(iColumnIndex, iRowIndex) {
			return TableUtils.getCell(oTable, getCellContentDomRef(iColumnIndex, iRowIndex))[0];
		}

		function getCellContentDomRef(iColumnIndex, iRowIndex) {
			return oTable.getRows()[iRowIndex].getCells()[iColumnIndex].getDomRef();
		}

		function isScrolledIntoView(oCell, bRTL) {
			var oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
			var oRowContainer = oTable.getDomRef("sapUiTableCtrlScr");

			var iScrollLeft = bRTL ? jQuery(oHSb).scrollLeftRTL() : oHSb.scrollLeft;
			var iRowContainerWidth = oRowContainer.clientWidth;
			var iCellLeft = oCell.offsetLeft;
			var iCellRight = iCellLeft + oCell.offsetWidth;
			var iOffsetLeft = iCellLeft - iScrollLeft;
			var iOffsetRight = iCellRight - iRowContainerWidth - iScrollLeft;

			return iOffsetLeft >= 0 && iOffsetRight <= 0;
		}

		function test(sTestTitle, oDomElementToFocus, iInitialScrollLeft, bScrollPositionShouldNotChange, bRTL) {
			return new Promise(function(resolve) {
				var oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
				var $HSb = jQuery(oHSb);
				document.body.focus();

				if (bRTL){
					$HSb.scrollLeftRTL(iInitialScrollLeft);
				} else {
					oHSb.scrollLeft = iInitialScrollLeft;
				}

				window.setTimeout(function() {
					oDomElementToFocus.focus();

					window.setTimeout(function() {
						var iNewScrollLeft = bRTL ? $HSb.scrollLeftRTL() : oHSb.scrollLeft;
						if (bScrollPositionShouldNotChange) {
							assert.strictEqual(iNewScrollLeft, iInitialScrollLeft,
								sTestTitle + ": The horizontal scroll position did not change");
						} else {
							assert.notStrictEqual(iNewScrollLeft, iInitialScrollLeft,
								sTestTitle + ": The horizontal scroll position did change");
							assert.ok(isScrolledIntoView(oDomElementToFocus, bRTL),
								sTestTitle + ": The focused cell is fully visible");
						}
						resolve();
					}, 50);
				}, 50);
			});
		}

		oTable.getColumns()[1].setWidth("800px");
		oTable.getColumns()[2].setWidth("100px");
		oTable.getColumns()[3].setWidth("800px");
		oTable.getColumns()[4].setWidth("100px");
		sap.ui.getCore().applyChanges();

		return new Promise(function(resolve) {
			oTable.attachEventOnce("_rowsUpdated", resolve);
		}).then(function() {
			return test("Focus header cell in column 3 (scrollable column)", getHeaderCellDomRef(2), 0, false, false);
		}).then(function() {
			return test("Focus header cell in column 1 (fixed column)", getHeaderCellDomRef(0), 70, true, false);
		}).then(function() {
			return test("Focus header cell in column 2 (scrollable column)", getHeaderCellDomRef(1), 70, false, false);
		}).then(function() {
			return test("Focus header cell in column 3 (scrollable column)", getHeaderCellDomRef(2), 850, false, false);
		}).then(function() {
			return test("Focus header cell in column 4 (scrollable column)", getHeaderCellDomRef(3), 200, false, false);
		}).then(function() {
			return test("Focus data cell in column 3, row 1 (scrollable column)", getDataCellDomRef(2, 0), 0, false, false);
		}).then(function() {
			return test("Focus data cell in column 1, row 1 (fixed column)", getDataCellDomRef(0, 0), 70, true, false);
		}).then(function() {
			return test("Focus data cell in column 2, row 1 (scrollable column)", getDataCellDomRef(1, 0), 70, false, false);
		}).then(function() {
			return test("Focus data cell in column 3, row 1 (scrollable column)", getDataCellDomRef(2, 0), 850, false, false);
		}).then(function() {
			return test("Focus data cell in column 4, row 1 (scrollable column)", getDataCellDomRef(3, 0), 200, false, false);
		}).then(function() {
			oTable.getColumns()[1].setWidth("1000px");
			oTable.getColumns()[2].setWidth("100px");
			oTable.getColumns()[3].setWidth("1000px");
			oTable.getColumns()[4].setWidth("100px");
			sap.ui.getCore().applyChanges();

			if (Device.browser.msie) {
				// The following tests do not make sense in IE. IE scrolls when a cell that is wider than the row container is focused.
				// Subsequent tests will be skipped until the catch.
				return Promise.reject();
			}

			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(function() {
			return test("Focus header cell in column 2 (scrollable column)", getHeaderCellDomRef(1), 50, true, false);
		}).then(function() {
			return test("Focus header cell in column 4 (scrollable column)", getHeaderCellDomRef(3), 1150, true, false);
		}).then(function() {
			return test("Focus data cell in column 2, row 1 (scrollable column)", getDataCellDomRef(1, 0), 50, true, false);
		}).then(function() {
			return test("Focus data cell in column 2, row 2 (scrollable column)", getDataCellDomRef(1, 1), 50, true, false);
		}).then(function() {
			return test("Focus data cell in column 4, row 1 (scrollable column)", getDataCellDomRef(3, 0), 1150, true, false);
		}).then(function() {
			return test("Focus data cell in column 4, row 2 (scrollable column)", getDataCellDomRef(3, 1), 1150, true, false);
		}).then(function(){
			return changeRTL(true);
		}).catch(function(){
			return changeRTL(true);
		}).then(function() {
			oTable.getColumns()[1].setWidth("800px");
			oTable.getColumns()[2].setWidth("100px");
			oTable.getColumns()[3].setWidth("800px");
			oTable.getColumns()[4].setWidth("100px");
			sap.ui.getCore().applyChanges();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(function() {
			return test("RTL: Focus header cell in column 3 (scrollable column)", getHeaderCellDomRef(2), 950, false, true);
		}).then(function() {
			return test("RTL: Focus header cell in column 1 (fixed column)", getHeaderCellDomRef(0), 880, true, true);
		}).then(function() {
			return test("RTL: Focus header cell in column 2 (scrollable column)", getHeaderCellDomRef(1), 880, false, true);
		}).then(function() {
			return test("RTL: Focus header cell in column 3 (scrollable column)", getHeaderCellDomRef(2), 100, false, true);
		}).then(function() {
			return test("RTL: Focus header cell in column 4 (scrollable column)", getHeaderCellDomRef(3), 750, false, true);
		}).then(function() {
			return test("RTL: Focus data cell in column 3, row 1 (scrollable column)", getDataCellDomRef(2, 0), 950, false, true);
		}).then(function() {
			return test("RTL: Focus data cell in column 1, row 1 (fixed column)", getDataCellDomRef(0, 0), 880, true, true);
		}).then(function() {
			return test("RTL: Focus data cell in column 2, row 1 (scrollable column)", getDataCellDomRef(1, 0), 880, false, true);
		}).then(function() {
			return test("RTL: Focus data cell in column 3, row 1 (scrollable column)", getDataCellDomRef(2, 0), 100, false, true);
		}).then(function() {
			return test("RTL: Focus data cell in column 4, row 1 (scrollable column)", getDataCellDomRef(3, 0), 750, false, true);
		}).then(function() {
			oTable.getColumns()[1].setWidth("1000px");
			oTable.getColumns()[2].setWidth("100px");
			oTable.getColumns()[3].setWidth("1000px");
			oTable.getColumns()[4].setWidth("100px");
			sap.ui.getCore().applyChanges();

			if (Device.browser.msie) {
				// The following tests do not make sense in IE. IE scrolls when a cell that is wider than the row container is focused.
				return Promise.reject();
			}

			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(function() {
			return test("RTL: Focus header cell in column 2 (scrollable column)", getHeaderCellDomRef(1), 1250, true, true);
		}).then(function() {
			return test("RTL: Focus header cell in column 4 (scrollable column)", getHeaderCellDomRef(3), 150, true, true);
		}).then(function() {
			return test("RTL: Focus data cell in column 2, row 1 (scrollable column)", getDataCellDomRef(1, 0), 1250, true, true);
		}).then(function() {
			return test("RTL: Focus data cell in column 2, row 2 (scrollable column)", getDataCellDomRef(1, 1), 1250, true, true);
		}).then(function() {
			return test("RTL: Focus data cell in column 4, row 1 (scrollable column)", getDataCellDomRef(3, 0), 150, true, true);
		}).then(function() {
			return test("RTL: Focus data cell in column 4, row 2 (scrollable column)", getDataCellDomRef(3, 1), 150, true, true);
		}).then(function(){
			return changeRTL(false);
		}).catch(function(){
			return changeRTL(false);
		});
	});

	QUnit.test("Restoration of the scroll position", function(assert) {
		var that = this;

		function wait() {
			return TableQUnitUtils.wait(Device.browser.msie ? 250 : 150);
		}

		function afterRendering() {
			return new Promise(function(resolve) {
				oTable.addEventDelegate({
					onAfterRendering: resolve
				});
			});
		}

		that.assertSynchronization(assert, 0);
		that.oScrollExtension.getHorizontalScrollbar().scrollLeft = 50;

		return wait().then(function() {
			that.assertSynchronization(assert, 50);
			oTable.invalidate();
		}).then(afterRendering).then(wait).then(function() {
			that.assertSynchronization(assert, 50);
		});
	});

	QUnit.module("Vertical Scrolling", {
		before: function() {
			// Make sure that tested row modes render 10 rows. Otherwise there will be miscalculations in tests.
			this.mTestedRowModes = {};
			Object.defineProperties(this.mTestedRowModes, {
				FixedRowMode: {
					enumerable: true,
					get: function() {
						if (!this._oFixedRowMode || this._oFixedRowMode.bIsDestroyed || this._oFixedRowMode.getParent() != null) {
							this._oFixedRowMode = new FixedRowMode({
								rowCount: 10
							});
							this._oFixedRowMode.toString = function() {return "FixedRowMode";};
							this._oFixedRowMode.renderCellContentStyles = function() {}; // Allow row mode to have variable row heights.
						}

						return this._oFixedRowMode;
					}
				},
				AutoRowMode: {
					enumerable: true,
					get: function() {
						if (!this._oAutoRowMode || this._oAutoRowMode.bIsDestroyed || this._oAutoRowMode.getParent() != null) {
							this._oAutoRowMode = new AutoRowMode({
								minRowCount: 10,
								maxRowCount: 10
							});
							this._oAutoRowMode.toString = function() {return "AutoRowMode";};
							this._oAutoRowMode.renderCellContentStyles = function() {}; // Allow row mode to have variable row heights.
						}

						return this._oAutoRowMode;
					}
				}
			});

			// Default row mode is set in "createTable".
			this.mDefaultOptions = {
				models: new JSONModel({
					configA: {rowHeight: "1px", child: {rowHeight: "1px"}},
					configB: {rowHeight: "149px"} // 149px to have a row height of 150px, as the row adds 1px border.
				}),
				bindingLength: 100
			};

			this.iBaseRowHeight = 49;

			TableQUnitUtils.setDefaultOptions(this.mDefaultOptions);
		},
		afterEach: function() {
			this.destroyTable();
		},
		after: function() {
			TableQUnitUtils.setDefaultOptions();
			this.forEachTestedRowMode(function(mRowModeConfig) {
				mRowModeConfig.rowMode.destroy();
			});
		},
		forEachTestedRowMode: function(fnForEach) {
			// This array should ensure the expected order in which row modes are tested.
			var aTestedRowModeNames = ["FixedRowMode", "AutoRowMode"];
			var that = this;

			function getRowMode(sKey) {
				return this.mTestedRowModes[sKey];
			}

			for (var i = 0; i < aTestedRowModeNames.length; i++) {
				var sKey = aTestedRowModeNames[i];

				fnForEach(Object.create(null, {
					key: {value: sKey},
					rowMode: {get: getRowMode.bind(that, sKey)}
				}));
			}
		},
		getMaxFirstVisibleRow: function(iBindingLength, bVariableRowHeights) {
			bVariableRowHeights = bVariableRowHeights === true;
			iBindingLength = iBindingLength == null ? this.mDefaultOptions.bindingLength : iBindingLength;
			return iBindingLength - (bVariableRowHeights ? 5 : 10);
		},
		getMaxFirstRenderedRow: function(iBindingLength) {
			return this.getMaxFirstVisibleRow(iBindingLength) - 1;
		},
		getMaxScrollTop: function(iBindingLength, bVariableRowHeights) {
			bVariableRowHeights = bVariableRowHeights === true;
			iBindingLength = iBindingLength == null ? this.mDefaultOptions.bindingLength : iBindingLength;

			var iRowCount = 10 + (bVariableRowHeights ? 1 : 0);
			var iScrollHeight = (Math.max(iBindingLength, iRowCount) - (bVariableRowHeights ? 1 : 0)) * this.iBaseRowHeight
								+ (bVariableRowHeights ? 98 : 0); // Buffer
			var iScrollbarHeight = 10 * this.iBaseRowHeight;

			return Math.min(1000000, iScrollHeight) - iScrollbarHeight;
		},
		createTable: function(mOptions, fnBeforePlaceAt) {
			this.destroyTable();

			mOptions = Object.assign({
				rowMode: this.mTestedRowModes.FixedRowMode
			}, mOptions);

			TableQUnitUtils.createTable(mOptions, function(oTable, mOptions) {
				this.oTable = oTable;

				oTable._getBaseRowHeight = function() {
					return this.iBaseRowHeight;
				}.bind(this);

				oTable.addColumn(new Column({
					template: new HeightControl({height: "{rowHeight}"})
				}));

				this._bypassBinding(oTable, mOptions.bindingLength);

				oTable.bindRows({
					path: "/"
				});

				if (fnBeforePlaceAt) {
					fnBeforePlaceAt(oTable);
				}
			}.bind(this));

			return this.oTable;
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		_bypassBinding: function(oTable, iLength) {
			oTable._getTotalRowCount = function() {
				var oBinding = this.getBinding("rows");
				if (oBinding) {
					return iLength;
				} else {
					return 0;
				}
			};
			oTable._getContexts = function(iStartIndex, iLength) {
				var aContexts = [];
				if (this.getBinding("rows")) {
					var iBindingLength = oTable._getTotalRowCount();
					var iCount = iStartIndex + iLength > iBindingLength ? iBindingLength - iStartIndex : iLength;
					var bVariableHeights = TableUtils.isVariableRowHeightEnabled(oTable);

					for (var i = 0; i < iCount; i++) {
						var iIndex = iStartIndex + i;
						aContexts.push(new Context(oTable.getModel(), iIndex % 2 === 0 || !bVariableHeights ? "/configA" : "/configB"));
					}
				}
				return aContexts;
			};
			oTable.getContextByIndex = function(iIndex) {
				return iIndex >= 0 && this.getBinding("rows") ? oTable._getContexts(iIndex, 1)[0] : null;
			};
		},
		changeRowHeights: function(iHeightA, iHeightB) {
			if (!this.oTable) {
				return;
			}

			var oData = JSON.parse(JSON.stringify(this.mDefaultOptions.models.getProperty("/")));

			if (iHeightA != null) {
				oData.configA.rowHeight = iHeightA + "px";
			}

			if (iHeightB != null) {
				oData.configB.rowHeight = iHeightB + "px";
			}

			this.oTable.setModel(new JSONModel(oData));
		},
		changeBindingLength: function(iNewLength, sReason) {
			if (!this.oTable) {
				return;
			}

			var iOldLength = this.oTable._getTotalRowCount();
			var oBinding = this.oTable.getBinding("rows");

			this.oTable._getTotalRowCount = function() {
				if (oBinding) {
					return iNewLength;
				} else {
					return 0;
				}
			};

			if (iOldLength !== iNewLength && sReason && oBinding) {
				this.oTable._iBindingLength = -1; // Ensure that the table detects a binding length change to update the UI.
				oBinding._fireChange({reason: sReason});
			}
		},
		fakeODataBindingChange: function() {
			var oBinding = this.oTable ? this.oTable.getBinding("rows") : null;
			if (oBinding) {
				oBinding._fireChange({reason: ChangeReason.Change});
			}
		},
		fakeODataBindingRefresh: function(iNewLength) {
			var oBinding = this.oTable ? this.oTable.getBinding("rows") : null;

			if (!oBinding) {
				return;
			}

			var iBindingLength = this.oTable._getTotalRowCount();
			this.changeBindingLength(0);
			oBinding._fireRefresh({reason: ChangeReason.Refresh});

			setTimeout(function() {
				if (iNewLength != null) {
					this.changeBindingLength(iNewLength, ChangeReason.Change);
				} else {
					this.changeBindingLength(iBindingLength);
					this.fakeODataBindingChange();
				}
			}.bind(this), 50);
		},
		assertPosition: function(assert, iFirstVisibleRowIndex, iScrollPosition, iInnerScrollPosition, sTitle) {
			sTitle = sTitle == null ? "" : sTitle + ": ";

			assert.strictEqual(this.oTable.getFirstVisibleRow(), iFirstVisibleRowIndex,
				sTitle + "First visible row index");
			assert.strictEqual(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop, iScrollPosition,
				sTitle + "Scrollbar position");
			assert.strictEqual(this.oTable.getDomRef("tableCCnt").scrollTop, iInnerScrollPosition,
				sTitle + "Viewport position");
		},
		testRestoration: function(assert, sTitle) {
			sTitle = sTitle == null ? "" : sTitle + "; ";

			if (!this.oTable) {
				return Promise.reject();
			}

			var that = this;
			var iFirstVisibleRow = this.oTable.getFirstVisibleRow();
			var iScrollPosition = this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			var iInnerScrollPosition = this.oTable.getDomRef("tableCCnt").scrollTop;

			this.oTable.invalidate();
			sap.ui.getCore().applyChanges();

			return this.oTable.qunit.whenRenderingFinished().then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition, sTitle + "After re-rendering");

				that.fakeODataBindingChange();
			}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition, sTitle + "After binding change");

			}).then(function() {
				that.fakeODataBindingRefresh();
			}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition, sTitle + "After binding refresh");

				that.fakeODataBindingRefresh();
				that.oTable.invalidate();
			}).then(that.oTable.qunit.whenBindingChange).then(that.oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "After simultaneous re-rendering & binding refresh");
			});
		}
	});

	QUnit.test("Initial scroll position; Tiny data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: 5
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, 0, 0, 0,
					mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Tiny data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: mConfig.bindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				var iScrollPosition = mConfig.firstVisibleRow === 0 ? 0 : 10;
				var iInnerScrollPosition = mConfig.firstVisibleRow === 0 ? 0 : that.iBaseRowHeight;
				that.assertPosition(assert, mConfig.firstVisibleRow, iScrollPosition, iInnerScrollPosition,
					mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "No overflow, FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					bindingLength: 2,
					initialFirstVisibleRow: 1,
					firstVisibleRow: 0
				});
			}).then(function() {
				return test({
					title: "Overflow, FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					bindingLength: 10, // Row count = 10
					initialFirstVisibleRow: 1,
					firstVisibleRow: 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.firstVisibleRow * that.iBaseRowHeight, 0,
					mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 0",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 5",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 5
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Small data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow();
		var iMaxScrollTop = this.getMaxScrollTop(null, true);

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop,
					mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 0",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 0,
					firstVisibleRow: 0,
					scrollTop: 0,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 1,
					firstVisibleRow: 1,
					scrollTop: that.iBaseRowHeight,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 5",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 5,
					firstVisibleRow: 5,
					scrollTop: 5 * that.iBaseRowHeight,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = Max first rendered row index",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: iMaxFirstRenderedRow,
					firstVisibleRow: iMaxFirstRenderedRow,
					scrollTop: iMaxFirstRenderedRow * that.iBaseRowHeight,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = Max first rendered row index + 1",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: iMaxFirstRenderedRow + 1,
					firstVisibleRow: iMaxFirstRenderedRow + 1,
					scrollTop: 4383,
					innerScrollTop: 150
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = Max first rendered row index + 2",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: iMaxFirstRenderedRow + 2,
					firstVisibleRow: iMaxFirstRenderedRow + 2,
					scrollTop: 4391,
					innerScrollTop: that.iBaseRowHeight + 150
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: that.mDefaultOptions.bindingLength - 2,
					firstVisibleRow: iMaxFirstVisibleRow,
					scrollTop: iMaxScrollTop,
					innerScrollTop: 655
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: that.mDefaultOptions.bindingLength - 1,
					firstVisibleRow: iMaxFirstVisibleRow,
					scrollTop: iMaxScrollTop,
					innerScrollTop: 655
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Large data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iBindingLength = 1000000000;
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength);

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: iBindingLength
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, 0,
					mConfig.rowMode + ", " + mConfig.title, "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 0",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 0,
					scrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 1,
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 987654",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 987654,
					scrollTop: 987
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: iMaxFirstVisibleRow - 1,
					scrollTop: iMaxScrollTop - 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: iMaxFirstVisibleRow,
					scrollTop: iMaxScrollTop
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Large data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iBindingLength = 1000000000;
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop,
					mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 0",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 0,
					firstVisibleRow: 0,
					scrollTop: 0,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 1,
					firstVisibleRow: 1,
					scrollTop: 1,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 987654",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 987654,
					firstVisibleRow: 987654,
					scrollTop: 987,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = Max first rendered row index",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: iMaxFirstRenderedRow,
					firstVisibleRow: iMaxFirstRenderedRow,
					scrollTop: 999412,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = Max first rendered row index + 1",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: iMaxFirstRenderedRow + 1,
					firstVisibleRow: iMaxFirstRenderedRow + 1,
					scrollTop: 999434,
					innerScrollTop: 150
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = Max first rendered row index + 2",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: iMaxFirstRenderedRow + 2,
					firstVisibleRow: iMaxFirstRenderedRow + 2,
					scrollTop: 999442,
					innerScrollTop: that.iBaseRowHeight + 150
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: iBindingLength - 2,
					firstVisibleRow: iMaxFirstVisibleRow,
					scrollTop: iMaxScrollTop,
					innerScrollTop: 655
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: iBindingLength - 1,
					firstVisibleRow: iMaxFirstVisibleRow,
					scrollTop: iMaxScrollTop,
					innerScrollTop: 655
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Large data; Fixed row heights; Floating point precision edge case", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var oTable = this.createTable({
			rowMode: this.mTestedRowModes.FixedRowMode.setRowCount(18),
			firstVisibleRow: iBindingLength,
			bindingLength: iBindingLength
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			var iExpectedFirstVisibleRow = iBindingLength - 18;
			var iExpectedScrollPosition = 1000000 - oTable._getScrollExtension().getVerticalScrollbar().clientHeight;
			that.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollPosition, 0, "After rendering");
		}).then(function() {
			return that.testRestoration(assert);
		});
	});

	QUnit.test("Initial scroll position; Large data; Variable row heights; Floating point precision edge case", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var oTable = this.createTable({
			rowMode: this.mTestedRowModes.FixedRowMode.setRowCount(18),
			firstVisibleRow: iBindingLength,
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			var iExpectedScrollPosition = 1000000 - oTable._getScrollExtension().getVerticalScrollbar().clientHeight;
			that.assertPosition(assert, 999999991, iExpectedScrollPosition, 1059, "After rendering");
		}).then(function() {
			return that.testRestoration(assert);
		});
	});

	QUnit.test("Initial scroll position if binding length changed after rendering; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: 99
			}, function(oTable) {
				TableQUnitUtils.addEventDelegateOnce(oTable, "onAfterRendering", function() {
					that.changeBindingLength(100, ChangeReason.Change);
				});
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.firstVisibleRow * that.iBaseRowHeight, 0,
					mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 0",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 5",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 5
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll with scrollbar; Tiny data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", ScrollTop set to ";

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
				that.assertPosition(assert, 0, 1, 5, sTitle + "1");
			}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
				that.assertPosition(assert, 2, 48, 247, sTitle + "48");
			}).then(oTable.qunit.$scrollVSbTo(49)).then(function() {
				that.assertPosition(assert, 3, 49, 253, sTitle + "49");
			}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
				that.assertPosition(assert, 2, 48, 247, sTitle + "48");
			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.assertPosition(assert, 5, 98, 505, sTitle + "MAX");
			}).then(oTable.qunit.$scrollVSbTo(1)).then(function() {
				that.assertPosition(assert, 0, 1, 5, sTitle + "1");
			}).then(oTable.qunit.$scrollVSbTo(0)).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll with scrollbar; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		var iMaxScrollTop = this.getMaxScrollTop();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode
			});
			var sTitle = mConfig.rowMode + ", ScrollTop set to ";

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
				that.assertPosition(assert, 0, 1, 0, sTitle + "1");
			}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
				that.assertPosition(assert, 0, 48, 0, sTitle + "48");
			}).then(oTable.qunit.$scrollVSbTo(49)).then(function() {
				that.assertPosition(assert, 1, 49, 0, sTitle + "49");
			}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
				that.assertPosition(assert, 0, 48, 0, sTitle + "48");
			}).then(oTable.qunit.$scrollVSbTo(200)).then(function() {
				that.assertPosition(assert, 4, 200, 0, sTitle + "200");
			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
			}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, sTitle + "MAX - 1");
			}).then(oTable.qunit.$scrollVSbBy(-48)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 49, 0, sTitle + "MAX - 49");
			}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow - 2, iMaxScrollTop - 50, 0, sTitle + "MAX - 50");
			}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 49, 0, sTitle + "MAX - 49");
			}).then(oTable.qunit.$scrollVSbTo(iMaxScrollTop - 1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, sTitle + "MAX - 1");
			}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
			}).then(oTable.qunit.$scrollVSbTo(1)).then(function() {
				that.assertPosition(assert, 0, 1, 0, sTitle + "1");
			}).then(oTable.qunit.$scrollVSbTo(0)).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			}).then(function() {
				var oScrollExtension = oTable._getScrollExtension();
				var oScrollbar = oTable._getScrollExtension().getVerticalScrollbar();

				// Test restarting the scrollbar scroll process.

				oScrollbar.scrollTop = 100;
				oScrollbar.dispatchEvent(createScrollEvent());

				setTimeout(function() {
					oScrollbar.scrollTop = 200;
					oScrollbar.dispatchEvent(createScrollEvent());

					// Avoid that scroll events triggered by the browser are processed.
					oScrollbar.removeEventListener("scroll", oScrollExtension._onVerticalScrollEventHandler);
				}, 0);

				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenVSbScrolled).then(oTable.qunit.whenRenderingFinished);
			}).then(function() {
				that.assertPosition(assert, 4, 200, 0, sTitle + "200 with 2 scroll events");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll with scrollbar; Small data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		var iMaxScrollTop = this.getMaxScrollTop(null, true);

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", ScrollTop set to ";

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
				that.assertPosition(assert, 0, 1, 1, sTitle + "1");
			}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
				that.assertPosition(assert, 0, 48, 48, sTitle + "48");
			}).then(oTable.qunit.$scrollVSbTo(49)).then(function() {
				that.assertPosition(assert, 1, 49, 0, sTitle + "49");
			}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
				that.assertPosition(assert, 0, 48, 48, sTitle + "48");
			}).then(oTable.qunit.$scrollVSbTo(200)).then(function() {
				that.assertPosition(assert, 4, 200, 4, sTitle + "200");
			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX");
			}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop - 1, 648, sTitle + "MAX - 1");
			}).then(oTable.qunit.$scrollVSbBy(-48)).then(function() {
				that.assertPosition(assert, 91, iMaxScrollTop - 49, 328, sTitle + "MAX - 49");
			}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
				that.assertPosition(assert, 91, iMaxScrollTop - 50, 321, sTitle + "MAX - 50");
			}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
				that.assertPosition(assert, 91, iMaxScrollTop - 49, 328, sTitle + "MAX - 49");
			}).then(oTable.qunit.$scrollVSbTo(iMaxScrollTop - 1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop - 1, 648, sTitle + "MAX - 1");
			}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX");
			}).then(oTable.qunit.$scrollVSbTo(1)).then(function() {
				that.assertPosition(assert, 0, 1, 1, sTitle + "1");
			}).then(oTable.qunit.$scrollVSbTo(0)).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			}).then(function() {
				var oScrollExtension = oTable._getScrollExtension();
				var oScrollbar = oTable._getScrollExtension().getVerticalScrollbar();

				// Test restarting the scrollbar scroll process.

				oScrollbar.scrollTop = 100;
				oScrollbar.dispatchEvent(createScrollEvent());

				setTimeout(function() {
					oScrollbar.scrollTop = 200;
					oScrollbar.dispatchEvent(createScrollEvent());
					oScrollbar.removeEventListener("scroll", oScrollExtension._onVerticalScrollEventHandler);
				}, 0);

				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenVSbScrolled).then(oTable.qunit.whenRenderingFinished);
			}).then(function() {
				that.assertPosition(assert, 4, 200, 4, sTitle + "200 with 2 scroll events");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll with scrollbar; Large data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iBindingLength = 1000000000;
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		var iRowsPerPixel = iMaxFirstVisibleRow / iMaxScrollTop;

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength
			});
			var sTitle = mConfig.rowMode + ", ScrollTop set to ";

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
				that.assertPosition(assert, Math.floor(iRowsPerPixel), 1, 0, sTitle + "1");
			}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
				that.assertPosition(assert, Math.floor(iRowsPerPixel * 48), 48, 0, sTitle + "48");
			}).then(oTable.qunit.$scrollVSbTo(500000)).then(function() {
				that.assertPosition(assert, Math.floor(iRowsPerPixel * 500000), 500000, 0, sTitle + "500000");
			}).then(oTable.qunit.$scrollVSbTo(500001)).then(function() {
				that.assertPosition(assert, Math.floor(iRowsPerPixel * 500001), 500001, 0, sTitle + "500001");
			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
			}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
				that.assertPosition(assert, Math.floor(iRowsPerPixel * (iMaxScrollTop - 1)), iMaxScrollTop - 1, 0, sTitle + "MAX - 1");
			}).then(oTable.qunit.$scrollVSbBy(-47)).then(function() {
				that.assertPosition(assert, Math.floor(iRowsPerPixel * (iMaxScrollTop - 48)), iMaxScrollTop - 48, 0, sTitle + "MAX - 48");
			}).then(oTable.qunit.$scrollVSbTo(iMaxScrollTop - 1)).then(function() {
				that.assertPosition(assert, Math.floor(iRowsPerPixel * (iMaxScrollTop - 1)), iMaxScrollTop - 1, 0, sTitle + "MAX - 1");
			}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
			}).then(oTable.qunit.$scrollVSbTo(1)).then(function() {
				that.assertPosition(assert, Math.floor(iRowsPerPixel), 1, 0, sTitle + "1");
			}).then(oTable.qunit.$scrollVSbTo(0)).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll with scrollbar; Large data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iBindingLength = 1000000000;
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
				that.assertPosition(assert, 1000, 1, 29, "ScrollTop set to 1");
			}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
				that.assertPosition(assert, 48028, 48, 12, "ScrollTop set to 48");
			}).then(oTable.qunit.$scrollVSbTo(500000)).then(function() {
				that.assertPosition(assert, 500294167, 500000, 146, "ScrollTop set to 500000");
			}).then(oTable.qunit.$scrollVSbTo(500001)).then(function() {
				that.assertPosition(assert, 500295168, 500001, 27, "ScrollTop set to 500001");
			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "ScrollTop set to MAX");
			}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop - 1, 648, "ScrollTop set to MAX - 1");
			}).then(oTable.qunit.$scrollVSbBy(-9)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 10, 588, "ScrollTop set to MAX - 10");
			}).then(oTable.qunit.$scrollVSbBy(-38)).then(function() {
				that.assertPosition(assert, 999999991, iMaxScrollTop - 48, 334, "ScrollTop set to MAX - 48");
			}).then(oTable.qunit.$scrollVSbTo(iMaxScrollTop - 1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop - 1, 648, "ScrollTop set to MAX - 1");
			}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "ScrollTop set to MAX");
			}).then(oTable.qunit.$scrollVSbTo(1)).then(function() {
				that.assertPosition(assert, 1000, 1, 29, "ScrollTop set to 1");
			}).then(oTable.qunit.$scrollVSbTo(0)).then(function() {
				that.assertPosition(assert, 0, 0, 0, "ScrollTop set to 0");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll with scrollbar if binding length changed after rendering; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 99
			}, function(oTable) {
				TableQUnitUtils.addEventDelegateOnce(oTable, "onAfterRendering", function() {
					that.changeBindingLength(100, ChangeReason.Change);
				});
			});

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(49)).then(function() {
				that.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", ScrollTop set to 49");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll with scrollbar if re-rendered after setting FirstVisibleRow; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return new Promise(function(resolve) {
					oTable.setFirstVisibleRow(1);
					oTable.attachEventOnce("_rowsUpdated", function() {
						setTimeout(function() {
							oTable.rerender();
							oTable.qunit.whenNextRenderingFinished().then(resolve);
						}, 0);
					});
				});
			}).then(function() {
				that.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");
			}).then(oTable.qunit.$scrollVSbTo(98)).then(function() {
				that.assertPosition(assert, 2, 98, 0, mConfig.rowMode + ", ScrollTop set to 98");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll with scrollbar if re-rendered while setting FirstVisibleRow; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return new Promise(function(resolve) {
					oTable.setFirstVisibleRow(1);
					setTimeout(function() {
						oTable.rerender();
						oTable.qunit.whenRenderingFinished().then(resolve);
					}, 0);
				});
			}).then(function() {
				that.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");
			}).then(oTable.qunit.$scrollVSbTo(98)).then(function() {
				that.assertPosition(assert, 2, 98, 0, mConfig.rowMode + ", ScrollTop set to 98");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Tiny data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(1);
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}).then(function() {
				that.assertPosition(assert, 1, 10, 49, sTitle + "1");

				oTable.setFirstVisibleRow(3);
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}).then(function() {
				that.assertPosition(assert, 3, 48, 248, sTitle + "3");

				oTable.setFirstVisibleRow(7);
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}).then(function() {
				that.assertPosition(assert, 5, 98, 505, "FirstVisibleRow set to > MAX");

				oTable.setFirstVisibleRow(5);
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}).then(function() {
				that.assertPosition(assert, 5, 87, 447, sTitle + "MAX");

				oTable.setFirstVisibleRow(0);
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		var iMaxScrollTop = this.getMaxScrollTop();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode
			});
			var sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 1, that.iBaseRowHeight, 0, sTitle + "1");
				oTable.setFirstVisibleRow(33);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 33, 33 * that.iBaseRowHeight, 0, sTitle + "33");
				oTable.setFirstVisibleRow(iMaxFirstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
				oTable.setFirstVisibleRow(iMaxFirstVisibleRow - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - that.iBaseRowHeight, 0, sTitle + "MAX - 1");
				oTable.setFirstVisibleRow(0);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			}).then(oTable.qunit.$scrollVSbTo(2 * that.iBaseRowHeight + 10)).then(function() {
				that.assertPosition(assert, 2, 2 * that.iBaseRowHeight + 10, 0,
					mConfig.rowMode + ", Scrolled to FirstVisibleRow = 2 by setting ScrollTop");
				oTable.setFirstVisibleRow(2);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 2, 2 * that.iBaseRowHeight, 0, sTitle + "2");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Small data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow();
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		var iMaxScrollTop = this.getMaxScrollTop(null, true);

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 1, that.iBaseRowHeight, 0, sTitle + "1");
				oTable.setFirstVisibleRow(33);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 33, 33 * that.iBaseRowHeight, 0, sTitle + "33");
				oTable.setFirstVisibleRow(iMaxFirstRenderedRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstRenderedRow, iMaxFirstRenderedRow * that.iBaseRowHeight, 0,
					sTitle + "Max first rendered row index");
				oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstRenderedRow + 1, 4383, 150,
					sTitle + "Max first rendered row index + 1");
				oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 2);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstRenderedRow + 2, 4391, that.iBaseRowHeight + 150,
					sTitle + "Max first rendered row index + 2");
				oTable.setFirstVisibleRow(that.mDefaultOptions.bindingLength - 2);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX - 1");
				oTable.setFirstVisibleRow(that.mDefaultOptions.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX");
				oTable.setFirstVisibleRow(0);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			}).then(oTable.qunit.$scrollVSbTo(2 * that.iBaseRowHeight + 10)).then(function() {
				that.assertPosition(assert, 2, 2 * that.iBaseRowHeight + 10, 10,
					mConfig.rowMode + ", Scrolled to FirstVisibleRow = 2 by setting ScrollTop");
				oTable.setFirstVisibleRow(2);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 2, 2 * that.iBaseRowHeight, 0, sTitle + "2");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Large data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iBindingLength = 1000000000;
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		var iMiddleFirstVisibleRow = Math.floor((Math.round(iMaxScrollTop / 2) / iMaxScrollTop) * iMaxFirstVisibleRow);

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength
			});
			var sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 1, 1, 0, sTitle + "1");
				oTable.setFirstVisibleRow(500000000);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 500000000, Math.round(iMaxScrollTop / 2), 0, sTitle + "500000000");
				oTable.setFirstVisibleRow(iMaxFirstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
				oTable.setFirstVisibleRow(iMaxFirstVisibleRow - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, sTitle + "MAX - 1");
				oTable.setFirstVisibleRow(0);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			}).then(function() {
				return oTable.qunit.scrollVSbTo(Math.round(iMaxScrollTop / 2));
			}).then(function() {
				//  Scrolltop of iMaxScrollTop / 2 does not exactly match row 500000000 (ScrollExtensions internal float vs browsers scrolltop integer)
				that.assertPosition(assert, iMiddleFirstVisibleRow, Math.round(iMaxScrollTop / 2), 0,
					mConfig.rowMode + ", Scrolled to FirstVisibleRow = " + iMiddleFirstVisibleRow + " by setting ScrollTop");
				oTable.setFirstVisibleRow(iMiddleFirstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMiddleFirstVisibleRow, Math.round(iMaxScrollTop / 2), 0, sTitle + iMiddleFirstVisibleRow);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Large data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iBindingLength = 1000000000;
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(iBindingLength);
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 1, 1, 0, sTitle + "1");
				oTable.setFirstVisibleRow(500000000);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 500000000, 499706, 0, sTitle + "500000000");
				oTable.setFirstVisibleRow(iMaxFirstRenderedRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstRenderedRow, 999412, 0, sTitle + "Max first rendered row index");
				oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstRenderedRow + 1, 999434, 150, sTitle + "Max first rendered row index + 1");
				oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 2);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstRenderedRow + 2, 999442, that.iBaseRowHeight + 150,
					sTitle + "Max first rendered row index + 2");
				oTable.setFirstVisibleRow(iBindingLength - 2);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX - 1");
				oTable.setFirstVisibleRow(iBindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX");
				oTable.setFirstVisibleRow(0);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			}).then(function() {
				return oTable.qunit.scrollVSbTo(Math.round(iMaxScrollTop / 2));
			}).then(function() {
				//  Scrolltop of iMaxScrollTop / 2 does not exactly match row 500000000 (ScrollExtensions internal float vs browsers scrolltop integer)
				that.assertPosition(assert, 500049023, Math.round(iMaxScrollTop / 2), 124,
					mConfig.rowMode + ", Scrolled to FirstVisibleRow = 500049023 by setting ScrollTop");
				oTable.setFirstVisibleRow(500049023);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 500049023, Math.round(iMaxScrollTop / 2), 0, sTitle + "500049023");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll by setting FirstVisibleRow when re-rendering; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				TableQUnitUtils.addEventDelegateOnce(oTable, "onBeforeRendering", function() {
					oTable.setFirstVisibleRow(1);
				});
				oTable.invalidate();
				sap.ui.getCore().applyChanges();
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll with mouse wheel; Small data; Fixed row heights", function(assert) {
		var that = this;
		var oTable = this.createTable();
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		var iMaxScrollTop = this.getMaxScrollTop();

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode) {
			return function() {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 1, that.iBaseRowHeight, 0, "Scrolled 20 pixels down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 3, 3 * that.iBaseRowHeight, 0, "Scrolled 2 rows down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, 23, 23 * that.iBaseRowHeight, 0, "Scrolled 2 pages down");
		}).then(scrollWithMouseWheel(9999999, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		}).then(scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - that.iBaseRowHeight, 0, "Scrolled 20 pixels up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 3, iMaxScrollTop - (3 * that.iBaseRowHeight), 0, "Scrolled 2 rows up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 23, iMaxScrollTop - (23 * that.iBaseRowHeight), 0, "Scrolled 2 pages up");
		}).then(scrollWithMouseWheel(-9999999, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		});
	});

	QUnit.test("Scroll with mouse wheel; Small data; Variable row heights", function(assert) {
		var that = this;
		var oTable = this.createTable({
			_bVariableRowHeightEnabled: true
		});
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		var iMaxScrollTop = this.getMaxScrollTop(null, true);

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode) {
			return function() {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(scrollWithMouseWheel(60, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 1, that.iBaseRowHeight, 0, "Scrolled 60 pixels down");
		}).then(scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 2, 2 * that.iBaseRowHeight, 0, "Scrolled 20 pixels down");
		}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
			that.assertPosition(assert, 2, 2 * that.iBaseRowHeight + 1, 1, "Scrolled 1 pixel down with the scrollbar");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 4, 4 * that.iBaseRowHeight + 1, 1, "Scrolled 2 rows down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, 24, 24 * that.iBaseRowHeight + 1, 1, "Scrolled 2 pages down");
		}).then(scrollWithMouseWheel(9999999, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "Scrolled to the bottom");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 1, 4450, 597, "Scrolled 1 pixel up");
		}).then(scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 2, 4428, 447, "Scrolled 20 pixels up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 4, 4398, 248, "Scrolled 2 rows up");
		}).then(scrollWithMouseWheel(15, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 3, 4421, 398, "Scrolled 15 pixels down");
		}).then(scrollWithMouseWheel(-16, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 4, 4398, 248, "Scrolled 16 pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 5, 4391, 199, "Scrolled 1 pixel up");
		}).then(scrollWithMouseWheel(-100, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 7, (iMaxFirstVisibleRow - 6) * that.iBaseRowHeight, 49, "Scrolled 100 pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 8, 4279, 49, "Scrolled 1 row up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 9, (iMaxFirstVisibleRow - 8) * that.iBaseRowHeight, 49, "Scrolled 1 row up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 29, (iMaxFirstVisibleRow - 28) * that.iBaseRowHeight, 49, "Scrolled 2 pages up");
		}).then(scrollWithMouseWheel(-9999999, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		});
	});

	QUnit.test("Scroll with mouse wheel; Large data; Fixed row heights", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var oTable = this.createTable({
			bindingLength: iBindingLength
		});
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		var nPixelsPerRow = iMaxScrollTop / iMaxFirstVisibleRow;

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode) {
			return function() {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return Promise.race([
					that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished),
					that.oTable.qunit.whenNextRenderingFinished()
				]);
			};
		}

		var pReady = oTable.qunit.whenInitialRenderingFinished();

		return pReady.then(scrollWithMouseWheel(that.iBaseRowHeight - 1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 1, 1, 0, "Scrolled " + (that.iBaseRowHeight - 1) + " pixels down");
		}).then(scrollWithMouseWheel(1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 2, 1, 0, "Scrolled 1 pixel down");
		}).then(scrollWithMouseWheel(500000, MouseWheelDeltaMode.PIXEL)).then(function() {
			var iFirstVisibleRow = 2 + Math.floor(500000 / that.iBaseRowHeight);
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 500000 pixels down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)).then(function() {
			var iFirstVisibleRow = 4 + Math.floor(500000 / that.iBaseRowHeight);
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 rows down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)).then(function() {
			var iFirstVisibleRow = 24 + Math.floor(500000 / that.iBaseRowHeight);
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 pages down");
		}).then(scrollWithMouseWheel(1000000000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		}).then(scrollWithMouseWheel(-(that.iBaseRowHeight - 1), MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, "Scrolled " + (that.iBaseRowHeight - 1) + " pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 2, iMaxScrollTop - 1, 0, "Scrolled 1 pixel up");
		}).then(scrollWithMouseWheel(-500000, MouseWheelDeltaMode.PIXEL)).then(function() {
			var iFirstVisibleRow = iMaxFirstVisibleRow - 2 - Math.floor(500000 / that.iBaseRowHeight);
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 500000 pixels up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.LINE)).then(function() {
			var iFirstVisibleRow = iMaxFirstVisibleRow - 4 - Math.floor(500000 / that.iBaseRowHeight);
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 rows up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)).then(function() {
			var iFirstVisibleRow = iMaxFirstVisibleRow - 24 - Math.floor(500000 / that.iBaseRowHeight);
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 pages up");
		}).then(scrollWithMouseWheel(-1000000000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		});
	});

	QUnit.test("Scroll with mouse wheel; Large data; Variable row heights", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var oTable = this.createTable({
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode) {
			return function() {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return Promise.race([
					that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished),
					that.oTable.qunit.whenNextRenderingFinished()
				]);
			};
		}

		var pReady = oTable.qunit.whenInitialRenderingFinished();

		return pReady.then(scrollWithMouseWheel(that.iBaseRowHeight - 1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 1, 1, 0, "Scrolled " + (that.iBaseRowHeight - 1) + " pixels down");
		}).then(scrollWithMouseWheel(60, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 2, 1, 0, "Scrolled 60 pixels down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 4, 1, 0, "Scrolled 2 rows down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, 24, 1, 0, "Scrolled 2 pages down");
		}).then(scrollWithMouseWheel(1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 25, 1, 0, "Scrolled 1 pixels down");
		}).then(scrollWithMouseWheel(5000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 102065, 102, 0, "Scrolled 5000000 pixel down");
		}).then(scrollWithMouseWheel(1000000000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "Scrolled to the bottom");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 1, 999501, 597, "Scrolled 1 pixel up");
		}).then(scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 2, 999479, 447, "Scrolled 20 pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 3, 999472, 398, "Scrolled 1 row up");
		}).then(scrollWithMouseWheel(1, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 2, 999479, 447, "Scrolled 1 row down");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 12, 999412, 49, "Scrolled 1 page up");
		}).then(scrollWithMouseWheel(15, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 11, 999412, 49, "Scrolled 15 pixels down");
		}).then(scrollWithMouseWheel(-16, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 12, 999412, 49, "Scrolled 16 pixels up");
		}).then(scrollWithMouseWheel(-100, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 14, 999412, 49, "Scrolled 100 pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 15, 999412, 49, "Scrolled 1 row up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 35, 999412, 49, "Scrolled 2 pages up");
		}).then(scrollWithMouseWheel(-5000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 999897920, 999310, 49, "Scrolled 5000000 pixels up");
		}).then(scrollWithMouseWheel(-1000000000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		});
	});

	QUnit.test("Handling of mouse wheel events that do scroll", function(assert) {
		var done = assert.async();
		var that = this;
		var oTable = this.createTable({
			title: "test",
			extension: [new HeightControl()],
			footer: new HeightControl(),
			fixedColumnCount: 1,
			rowActionCount: 1,
			rowActionTemplate: new RowAction({items: [new RowActionItem({type: tableLibrary.RowActionType.Navigation})]})
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			return oTable.qunit.scrollVSbTo(0).then(function() {
				var oWheelEvent = createMouseWheelEvent(20, MouseWheelDeltaMode.PIXEL, false);
				var oStopPropagationSpy = sinon.spy(oWheelEvent, "stopPropagation");

				mConfig.element.dispatchEvent(oWheelEvent);

				return new Promise(function(resolve) {
					setTimeout(function() {
						that.assertPosition(assert, 1, 49, 0, "Mouse Wheel - " + mConfig.name + ": Scrolled");
						assert.ok(oWheelEvent.defaultPrevented, "Mouse Wheel - " + mConfig.name + ": Default action was prevented");
						assert.ok(oStopPropagationSpy.calledOnce, "Mouse Wheel - " + mConfig.name + ": Propagation was stopped");
						resolve();
					}, 100);
				});
			});
		}

		pTestSequence = pTestSequence.then(oTable.qunit.whenInitialRenderingFinished).then(function() {
			var aTestConfigs = [
				{name: "Cell in fixed column", element: oTable.qunit.getDataCell(0, 0)},
				{name: "Cell in scrollable column", element: oTable.qunit.getDataCell(0, 1)},
				{name: "Row header cell", element: oTable.qunit.getRowHeaderCell(0)},
				{name: "Row action cell", element: oTable.qunit.getRowActionCell(0)},
				{name: "Content in fixed column cell", element: oTable.qunit.getDataCell(0, 0).firstElementChild},
				{name: "Content in scrollable column cell", element: oTable.qunit.getDataCell(0, 1).firstElementChild},
				{name: "Content in row action cell", element: oTable.qunit.getRowActionCell(0).firstElementChild}
			];

			aTestConfigs.forEach(function(mConfig) {
				pTestSequence = pTestSequence.then(function() {
					return test(mConfig);
				});
			});

			pTestSequence.then(done);
		});
	});

	QUnit.test("Handling of mouse wheel events that do not scroll", function(assert) {
		var done = assert.async();
		var that = this;

		var oTable = this.createTable({
			title: "test",
			extension: [new HeightControl()],
			footer: new HeightControl(),
			fixedColumnCount: 1,
			rowActionCount: 1,
			rowActionTemplate: new RowAction({items: [new RowActionItem({type: tableLibrary.RowActionType.Navigation})]})
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var iScrollDelta = mConfig.scrollDelta == null ? 50 : mConfig.scrollDelta;
			var oWheelEvent = createMouseWheelEvent(iScrollDelta, MouseWheelDeltaMode.PIXEL, false);
			var oStopPropagationSpy = sinon.spy(oWheelEvent, "stopPropagation");
			var iExpectedFirstVisibleRow = mConfig.firstVisibleRow == null ? 0 : mConfig.firstVisibleRow;
			var iExpectedScrollTop = mConfig.scrollTop == null ? 0 : mConfig.scrollTop;

			mConfig.element.dispatchEvent(oWheelEvent);

			return new Promise(function(resolve) {
				setTimeout(function() {
					that.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollTop, 0,
						"Mouse Wheel - " + mConfig.name + ": Not scrolled");
					assert.ok(!oWheelEvent.defaultPrevented, "Mouse Wheel - " + mConfig.name + ": Default action was not prevented");
					assert.ok(oStopPropagationSpy.notCalled, "Mouse Wheel - " + mConfig.name + ": Propagation was not stopped");
					resolve();
				}, 100);
			});
		}

		pTestSequence = pTestSequence.then(oTable.qunit.whenInitialRenderingFinished).then(function() {
			var oDomRef = oTable.getDomRef();
			var aTestConfigs = [
				{name: "Horizontal scrollbar", element: oTable._getScrollExtension().getHorizontalScrollbar()},
				{name: "Column header container", element: oDomRef.querySelector(".sapUiTableColHdrCnt")},
				{name: "Title container", element: oDomRef.querySelector(".sapUiTableHdr")},
				{name: "Extension container", element: oDomRef.querySelector(".sapUiTableExt")},
				{name: "Footer container", element: oDomRef.querySelector(".sapUiTableFtr")}
			];

			aTestConfigs.forEach(function(mConfig) {
				pTestSequence = pTestSequence.then(function() {
					return test(mConfig);
				});
			});

			pTestSequence = pTestSequence.then(function() {
				return test({
					name: "Scrolling up if already scrolled to top",
					element: oTable.qunit.getDataCell(0, 1),
					scrollDelta: -50
				});
			});

			pTestSequence = pTestSequence.then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				return test({
					name: "Scrolling down if already scrolled to bottom",
					element: oTable.qunit.getDataCell(0, 1),
					scrollDelta: 50,
					firstVisibleRow: 90,
					scrollTop: 90 * oTable._getBaseRowHeight()
				});
			});

			pTestSequence.then(done);
		});
	});

	QUnit.test("Scroll with touch; Small data; Fixed row heights", function(assert) {
		var that = this;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var oTable = this.createTable();
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		var iMaxScrollTop = this.getMaxScrollTop();

		function scrollWithTouch(iScrollDelta) {
			return function() {
				doTouchScrolling(0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			initTouchScrolling(oTable.qunit.getDataCell(0, 0));
		}).then(scrollWithTouch(20)).then(function() {
			that.assertPosition(assert, 0, 20, 0, "Scrolled 20 pixels down");
		}).then(scrollWithTouch(30)).then(function() {
			that.assertPosition(assert, 1, 50, 0, "Scrolled 30 pixels down");
		}).then(scrollWithTouch(-30)).then(function() {
			that.assertPosition(assert, 0, 20, 0, "Scrolled 30 pixels up");
		}).then(scrollWithTouch(-100, true, "Scrolled to the top")).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		}).then(scrollWithTouch(iMaxScrollTop + 100, true, "Scrolled to the bottom")).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		}).then(scrollWithTouch(-50)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 30, 0, "Scrolled 30 pixels up");
		}).then(function() {
			endTouchScrolling();
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Scroll with touch; Small data; Variable row heights", function(assert) {
		var that = this;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var oTable = this.createTable({
			_bVariableRowHeightEnabled: true
		});
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		var iMaxScrollTop = this.getMaxScrollTop(null, true);

		function scrollWithTouch(iScrollDelta) {
			return function() {
				doTouchScrolling(0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			initTouchScrolling(oTable.qunit.getDataCell(0, 0));

			if (Device.browser.msie) {
				return TableQUnitUtils.wait(0);
			}
		}).then(scrollWithTouch(20)).then(function() {
			that.assertPosition(assert, 0, 20, 20, "Scrolled 20 pixels down");
		}).then(scrollWithTouch(30)).then(function() {
			that.assertPosition(assert, 1, 50, 3, "Scrolled 30 pixels down");
		}).then(scrollWithTouch(-30)).then(function() {
			that.assertPosition(assert, 0, 20, 20, "Scrolled 30 pixels up");
		}).then(scrollWithTouch(-100, true, "Scrolled to the top")).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		}).then(scrollWithTouch(4559, true, "Scrolled to the bottom")).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "Scrolled to the bottom");
		}).then(scrollWithTouch(-50)).then(function() {
			that.assertPosition(assert, 93, 4429, 454, "Scrolled 30 pixels up");
		}).then(scrollWithTouch(-100)).then(function() {
			that.assertPosition(assert, 88, 4329, 17, "Scrolled 100 pixels up");
		}).then(scrollWithTouch(-50)).then(function() {
			that.assertPosition(assert, 87, 4279, 49, "Scrolled 50 pixels up");
		}).then(function() {
			endTouchScrolling();
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Scroll with touch; Large data; Fixed row heights;", function(assert) {
		var that = this;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var iBindingLength = 1000000000;
		var oTable = this.createTable({
			bindingLength: iBindingLength
		});
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		var iRowsPerPixel = iMaxFirstVisibleRow / iMaxScrollTop;

		function scrollWithTouch(iScrollDelta) {
			return function() {
				doTouchScrolling(0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			initTouchScrolling(oTable.qunit.getDataCell(0, 0));
		}).then(scrollWithTouch(1)).then(function() {
			that.assertPosition(assert, Math.floor(iRowsPerPixel), 1, 0, "Scrolled 1 pixel down");
		}).then(scrollWithTouch(48)).then(function() {
			that.assertPosition(assert, Math.floor(iRowsPerPixel * 49), 49, 0, "Scrolled 48 pixels down");
		}).then(scrollWithTouch(500000)).then(function() {
			that.assertPosition(assert, Math.floor(iRowsPerPixel * 500049), 500049, 0, "Scrolled 500000 pixels down");
		}).then(scrollWithTouch(-500050, true, "Scrolled to the top")).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		}).then(scrollWithTouch(iMaxScrollTop + 2, true, "Scrolled to the bottom")).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		}).then(scrollWithTouch(-2)).then(function() {
			that.assertPosition(assert, Math.floor(iRowsPerPixel * (iMaxScrollTop - 1)), iMaxScrollTop - 1, 0, "Scrolled 1 pixel up");
		}).then(scrollWithTouch(-48)).then(function() {
			that.assertPosition(assert, Math.floor(iRowsPerPixel * (iMaxScrollTop - 49)), iMaxScrollTop - 49, 0, "Scrolled 48 pixels up");
		}).then(scrollWithTouch(-500000)).then(function() {
			that.assertPosition(assert, Math.floor(iRowsPerPixel * (iMaxScrollTop - 500049)), iMaxScrollTop - 500049, 0,
				"Scrolled 500000 pixels up");
		}).then(function() {
			endTouchScrolling();
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Scroll with touch; Large data; Variable row heights", function(assert) {
		var that = this;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var iBindingLength = 1000000000;
		var oTable = this.createTable({
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		function scrollWithTouch(iScrollDelta) {
			return function() {
				doTouchScrolling(0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			initTouchScrolling(oTable.qunit.getDataCell(0, 0));
		}).then(scrollWithTouch(1)).then(function() {
			that.assertPosition(assert, 1000, 1, 29, "Scrolled 1 pixel down");
		}).then(scrollWithTouch(48)).then(function() {
			that.assertPosition(assert, 49028, 49, 41, "Scrolled 48 pixels down");
		}).then(scrollWithTouch(500000)).then(function() {
			that.assertPosition(assert, 500343196, 500049, 39, "Scrolled 500000 pixels down");
		}).then(scrollWithTouch(-500050, true, "Scrolled to the top")).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		}).then(scrollWithTouch(iMaxScrollTop + 2, true, "Scrolled to the bottom")).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "Scrolled to the bottom");
		}).then(scrollWithTouch(-2)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop - 1, 648, "Scrolled 1 pixel up");
		}).then(scrollWithTouch(-48)).then(function() {
			that.assertPosition(assert, 999999991, iMaxScrollTop - 49, 328, "Scrolled 48 pixels up");
		}).then(scrollWithTouch(-500000)).then(function() {
			that.assertPosition(assert, 499754850, iMaxScrollTop - 500049, 42, "Scrolled 500000 pixels up");
		}).then(function() {
			endTouchScrolling();
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Handling of touch events that do scroll", function(assert) {
		var done = assert.async();
		var that = this;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var oTable = this.createTable({
			title: "test",
			extension: [new HeightControl()],
			footer: new HeightControl(),
			fixedColumnCount: 1,
			rowActionCount: 1,
			rowActionTemplate: new RowAction({items: [new RowActionItem({type: tableLibrary.RowActionType.Navigation})]})
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			return oTable.qunit.scrollVSbTo(0).then(function() {
				initTouchScrolling(mConfig.element);
				var oTouchMoveEvent = doTouchScrolling(0, 20);
				endTouchScrolling();
				var oStopPropagationSpy = sinon.spy(oTouchMoveEvent, "stopPropagation");

				return new Promise(function(resolve) {
					setTimeout(function() {
						that.assertPosition(assert, 0, 20, 0, "Touch - " + mConfig.name + ": Scrolled");
						assert.ok(oTouchMoveEvent.defaultPrevented, "Touch - " + mConfig.name + ": Default action was prevented");
						assert.ok(oStopPropagationSpy.notCalled, "Touch - " + mConfig.name + ": Propagation was not stopped");
						resolve();
					}, 100);
				});
			});
		}

		pTestSequence = pTestSequence.then(oTable.qunit.whenInitialRenderingFinished).then(function() {
			var aTestConfigs = [
				{name: "Cell in fixed column", element: oTable.qunit.getDataCell(0, 0)},
				{name: "Cell in scrollable column", element: oTable.qunit.getDataCell(0, 1)},
				{name: "Row header cell", element: oTable.qunit.getRowHeaderCell(0)},
				{name: "Row action cell", element: oTable.qunit.getRowActionCell(0)},
				{name: "Content in fixed column cell", element: oTable.qunit.getDataCell(0, 0).firstElementChild},
				{name: "Content in scrollable column cell", element: oTable.qunit.getDataCell(0, 1).firstElementChild},
				{name: "Content in row action cell", element: oTable.qunit.getRowActionCell(0).firstElementChild}
			];

			aTestConfigs.forEach(function(mConfig) {
				pTestSequence = pTestSequence.then(function() {
					return test(mConfig);
				});
			});

			pTestSequence = pTestSequence.then(oTable.qunit.$scrollVSbTo(0)).then(function() {
				var iMaxScrollTop = that.getMaxScrollTop();

				function testOutsideBoundaries(iScrollDelta) {
					return new Promise(function(resolve) {
						var oTouchMoveEvent = doTouchScrolling(0, iScrollDelta);
						var oStopPropagationSpy = sinon.spy(oTouchMoveEvent, "stopPropagation");
						setTimeout(function() {
							assert.ok(oTouchMoveEvent.defaultPrevented, "Touch - Scrolled further than the maximum: Default action was prevented");
							assert.ok(oStopPropagationSpy.notCalled, "Touch - Scrolled further than the maximum: Propagation was not stopped");
							resolve();
						}, 100);
					});
				}

				initTouchScrolling(aTestConfigs[0].element);

				return testOutsideBoundaries(iMaxScrollTop + 100).then(function() {
					return testOutsideBoundaries(100);
				}).then(function() {
					return testOutsideBoundaries(-iMaxScrollTop - 300);
				}).then(function() {
					return testOutsideBoundaries(-100);
				}).then(function() {
					endTouchScrolling();
				});
			});

			pTestSequence = pTestSequence.then(function() {
				Device.support.pointer = bOriginalPointerSupport;
				Device.support.touch = bOriginalTouchSupport;
				done();
			});
		});
	});

	QUnit.test("Handling of touch events that do not scroll", function(assert) {
		var done = assert.async();
		var that = this;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var oTable = this.createTable({
			title: "test",
			extension: [new HeightControl()],
			footer: new HeightControl(),
			fixedColumnCount: 1,
			rowActionCount: 1,
			rowActionTemplate: new RowAction({items: [new RowActionItem({type: tableLibrary.RowActionType.Navigation})]})
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var iScrollDelta = mConfig.scrollDelta == null ? 50 : mConfig.scrollDelta;

			if (mConfig.skipInitTouchScrolling !== true) {
				initTouchScrolling(mConfig.element);
			}
			var oTouchMoveEvent = doTouchScrolling(0, iScrollDelta);
			if (mConfig.skipInitTouchScrolling === true) {
				endTouchScrolling();
			}

			var oStopPropagationSpy = sinon.spy(oTouchMoveEvent, "stopPropagation");
			var iExpectedFirstVisibleRow = mConfig.firstVisibleRow == null ? 0 : mConfig.firstVisibleRow;
			var iExpectedScrollTop = mConfig.scrollTop == null ? 0 : mConfig.scrollTop;

			return new Promise(function(resolve) {
				setTimeout(function() {
					that.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollTop, 0, "Touch - " + mConfig.name + ": Not scrolled");
					assert.ok(!oTouchMoveEvent.defaultPrevented, "Touch - " + mConfig.name + ": Default action was not prevented");
					assert.ok(oStopPropagationSpy.notCalled, "Touch - " + mConfig.name + ": Propagation was not stopped");
					resolve();
				}, 100);
			});
		}

		pTestSequence = pTestSequence.then(oTable.qunit.whenInitialRenderingFinished).then(function() {
			var oDomRef = oTable.getDomRef();
			var aTestConfigs = [
				{name: "Horizontal scrollbar", element: oTable._getScrollExtension().getHorizontalScrollbar()},
				{name: "Column header container", element: oDomRef.querySelector(".sapUiTableColHdrCnt")},
				{name: "Title container", element: oDomRef.querySelector(".sapUiTableHdr")},
				{name: "Extension container", element: oDomRef.querySelector(".sapUiTableExt")},
				{name: "Footer container", element: oDomRef.querySelector(".sapUiTableFtr")}
			];

			aTestConfigs.forEach(function(mConfig) {
				pTestSequence = pTestSequence.then(function() {
					return test(mConfig);
				});
			});

			pTestSequence = pTestSequence.then(function() {
				return test({
					name: "Scrolling up if already scrolled to top",
					element: oTable.qunit.getDataCell(0, 1),
					scrollDelta: -50
				}).then(function() {
					return test({
						skipInitTouchScrolling: true,
						name: "Scrolling back down",
						element: oTable.qunit.getDataCell(0, 1),
						scrollDelta: 100
					});
				});
			});

			pTestSequence = pTestSequence.then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				return test({
					name: "Scrolling down if already scrolled to bottom",
					element: oTable.qunit.getDataCell(0, 1),
					scrollDelta: 50,
					firstVisibleRow: 90,
					scrollTop: 90 * oTable._getBaseRowHeight()
				}).then(function() {
					return test({
						skipInitTouchScrolling: true,
						name: "Scrolling back up",
						element: oTable.qunit.getDataCell(0, 1),
						scrollDelta: -100,
						firstVisibleRow: 90,
						scrollTop: 90 * oTable._getBaseRowHeight()
					});
				});
			});

			pTestSequence = pTestSequence.then(function() {
				Device.support.pointer = bOriginalPointerSupport;
				Device.support.touch = bOriginalTouchSupport;
				done();
			});
		});
	});

	QUnit.test("Scroll the viewport; Tiny data; Variable row heights", function(assert) {
		var that = this;
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(10, true);
		var iMaxScrollTop = this.getMaxScrollTop(10, true);
		var pTestSequence = Promise.resolve();

		function scrollViewport(iScrollTop) {
			return function() {
				that.oTable.getDomRef("tableCCnt").scrollTop = iScrollTop;
				return that.oTable.qunit.whenVSbScrolled();
			};
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(scrollViewport(100)).then(function() {
				that.assertPosition(assert, 1, 19, 100,
					mConfig.rowMode + ", Scrolled viewport to 100");
			}).then(scrollViewport(1000)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655 - 150 + that.iBaseRowHeight,
					mConfig.rowMode + "Scrolled viewport to MAX");
			}).then(scrollViewport(0)).then(function() {
				that.assertPosition(assert, 0, 0, 0,
					mConfig.rowMode + ", Scrolled viewport to 0");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll the viewport; Small data; Variable row heights", function(assert) {
		var that = this;
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow();
		var iMaxScrollTop = this.getMaxScrollTop(null, true);
		var pTestSequence = Promise.resolve();

		function scrollViewport(iScrollTop) {
			return function() {
				that.oTable.getDomRef("tableCCnt").scrollTop = iScrollTop;
				return that.oTable.qunit.whenVSbScrolled();
			};
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(scrollViewport(100)).then(function() {
				that.assertPosition(assert, 1, 66, 100,
					mConfig.rowMode + ", Scrolled viewport to 100 when scrolled to top");
			}).then(scrollViewport(1000)).then(function() {
				that.assertPosition(assert, 5, 280, 655 - 150 + that.iBaseRowHeight,
					mConfig.rowMode + ", Scrolled viewport to MAX when scrolled to top");
			}).then(scrollViewport(0)).then(function() {
				that.assertPosition(assert, 0, 0, 0,
					mConfig.rowMode + ", Scrolled viewport to 0 when scrolled to top");
			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(scrollViewport(180)).then(function() {
				that.assertPosition(assert, iMaxFirstRenderedRow + 1, 4388, 180,
					mConfig.rowMode + ", Scrolled viewport to 100 when scrolled to bottom");
			}).then(scrollViewport(1000)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655,
					mConfig.rowMode + ", Scrolled viewport to MAX when scrolled to bottom");
			}).then(scrollViewport(0)).then(function() {
				that.assertPosition(assert, iMaxFirstRenderedRow, iMaxScrollTop - 98, 0,
					mConfig.rowMode + ", Scrolled viewport to 0 when scrolled to bottom");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll the viewport; Large data; Variable row heights", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);
		var pTestSequence = Promise.resolve();

		function scrollViewport(iScrollTop, bExpectScrollbarScrolling) {
			return function() {
				that.oTable.getDomRef("tableCCnt").scrollTop = iScrollTop;

				if (bExpectScrollbarScrolling) {
					return that.oTable.qunit.whenVSbScrolled();
				} else {
					return that.oTable.qunit.whenViewportScrolled();
				}
			};
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(scrollViewport(100, true)).then(function() {
				that.assertPosition(assert, 1, 1, 100,
					mConfig.rowMode + ", Scrolled viewport to 100 when scrolled to top");
			}).then(scrollViewport(1000, false)).then(function() {
				that.assertPosition(assert, 5, 1, 655 - 150 + that.iBaseRowHeight,
					mConfig.rowMode + "Scrolled viewport to MAX when scrolled to top");
			}).then(scrollViewport(0, true)).then(function() {
				that.assertPosition(assert, 0, 0, 0,
					mConfig.rowMode + ", Scrolled viewport to 0 when scrolled to top");
			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(scrollViewport(180, true)).then(function() {
				that.assertPosition(assert, iMaxFirstRenderedRow + 1, 999439, 180,
					mConfig.rowMode + ", Scrolled viewport to 100 when scrolled to bottom");
			}).then(scrollViewport(1000, true)).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655,
					mConfig.rowMode + "Scrolled viewport to MAX when scrolled to bottom");
			}).then(scrollViewport(0, true)).then(function() {
				that.assertPosition(assert, iMaxFirstRenderedRow, iMaxScrollTop - 98, 0,
					mConfig.rowMode + ", Scrolled viewport to 0 when scrolled to bottom");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting ScrollTop; Tiny data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "ScrollTop = 1",
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "ScrollTop = 50",
					scrollTop: 50
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX",
					scrollTop: 9999999
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting ScrollTop; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "ScrollTop = 1",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "ScrollTop = 123",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 123
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 9999999
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: that.getMaxScrollTop() - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting ScrollTop; Small data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "ScrollTop = 1",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "ScrollTop = 123",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 123
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 9999999
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: that.getMaxScrollTop() - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting ScrollTop; Large data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "ScrollTop = 1",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "ScrollTop = 500000",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 500000
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 9999999
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: that.getMaxScrollTop(1000000000) - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting ScrollTop; Large data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "ScrollTop = 1",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "ScrollTop = 500000",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 500000
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: 9999999
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					scrollTop: that.getMaxScrollTop(1000000000, true) - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Tiny data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 3",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 3
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 7
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 33",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 33
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: that.mDefaultOptions.bindingLength
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: that.getMaxFirstVisibleRow() - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Small data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 33",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 33
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: that.mDefaultOptions.bindingLength
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: that.getMaxFirstVisibleRow() - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Large data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 500000000",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 500000000
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 1000000000
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: that.getMaxFirstVisibleRow(1000000000) - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Large data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				return that.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 500000000",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 500000000
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: 1000000000
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX - 1",
					rowMode: oRowModeConfig.rowMode,
					firstVisibleRow: that.getMaxFirstVisibleRow(1000000000) - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after changing the row heights; Tiny data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function changeRowHeights(iHeightA, iHeightB) {
			return function() {
				that.changeRowHeights(iHeightA, iHeightB);
				return that.oTable.qunit.whenRenderingFinished();
			};
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", Changed row heights";

			return oTable.qunit.whenInitialRenderingFinished().then(changeRowHeights(100, 175)).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + " when scrolled to top");
			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(changeRowHeights(90, 125)).then(function() {
				that.assertPosition(assert, 5, 98, 595, sTitle + " when scrolled to bottom");
			}).then(changeRowHeights(100, 175)).then(function() {
				that.assertPosition(assert, 5, 79, 725, sTitle + " when scrolled to bottom");
			}).then(oTable.qunit.$scrollVSbTo(50)).then(changeRowHeights(80, 100)).then(function() {
				that.assertPosition(assert, 3, 80, 342, sTitle);
			}).then(changeRowHeights(150, 150)).then(function() {
				that.assertPosition(assert, 3, 51, 532, sTitle);
			}).then(changeRowHeights(5, 5)).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after changing the row heights; Small data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function changeRowHeights(iHeightA, iHeightB) {
			return function() {
				that.changeRowHeights(iHeightA, iHeightB);
				return that.oTable.qunit.whenRenderingFinished();
			};
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", Changed row heights";

			return oTable.qunit.whenInitialRenderingFinished().then(changeRowHeights(100, 175)).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + " when scrolled to top");
			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(changeRowHeights(90, 125)).then(function() {
				that.assertPosition(assert, 95, 4459, 721, sTitle + " when scrolled to bottom");
			}).then(changeRowHeights(5, 5)).then(function() {
				that.assertPosition(assert, 90, 4459, that.iBaseRowHeight, sTitle + " when scrolled to bottom");
			}).then(changeRowHeights(100, 175)).then(function() {
				that.assertPosition(assert, 90, 4377, 176, sTitle + " when scrolled to bottom");
			}).then(oTable.qunit.$scrollVSbTo(500)).then(changeRowHeights(80, 100)).then(function() {
				that.assertPosition(assert, 10, 503, 21, sTitle);
			}).then(changeRowHeights(150, 150)).then(function() {
				that.assertPosition(assert, 10, 497, 21, sTitle);
			}).then(changeRowHeights(5, 5)).then(function() {
				that.assertPosition(assert, 10, 511, 21, sTitle);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after changing the row heights; Large data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function changeRowHeights(iHeightA, iHeightB) {
			return function() {
				that.changeRowHeights(iHeightA, iHeightB);
				return that.oTable.qunit.whenRenderingFinished();
			};
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", Changed row heights";

			return oTable.qunit.whenInitialRenderingFinished().then(changeRowHeights(100, 175)).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + " when scrolled to top");
			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(changeRowHeights(90, 125)).then(function() {
				that.assertPosition(assert, 999999995, 999510, 721, sTitle + " when scrolled to bottom");
			}).then(changeRowHeights(5, 5)).then(function() {
				that.assertPosition(assert, 999999990, 999510, that.iBaseRowHeight, sTitle + " when scrolled to bottom");
			}).then(changeRowHeights(100, 175)).then(function() {
				that.assertPosition(assert, 999999990, 999428, 176, sTitle + " when scrolled to bottom");
			}).then(oTable.qunit.$scrollVSbTo(500)).then(changeRowHeights(80, 100)).then(function() {
				that.assertPosition(assert, 500294, 500, 17, sTitle);
			}).then(changeRowHeights(150, 150)).then(function() {
				that.assertPosition(assert, 500294, 500, 17, sTitle);
			}).then(changeRowHeights(5, 5)).then(function() {
				that.assertPosition(assert, 500294, 500, 17, sTitle);
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after changing the row count; Tiny data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", ";
			var iFirstVisibleRow;
			var iScrollPosition;
			var iInnerScrollPosition;

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 46, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count increased");

				setRowCount(mConfig.rowMode, 11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 55, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count increased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count decreased");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 89, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After visible row count increased");

				setRowCount(mConfig.rowMode, 11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition - that.iBaseRowHeight,
					sTitle + "ScrollTop = MAX; After visible row count increased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 88, iInnerScrollPosition - that.iBaseRowHeight,
					sTitle + "ScrollTop = MAX; After visible row count decreased");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after changing the row count; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode
			});
			var sTitle = mConfig.rowMode + ", ";
			var iFirstVisibleRow;
			var iScrollPosition;

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;

				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count increased");

				setRowCount(mConfig.rowMode, 11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count increased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count decreased");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;

				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = MAX; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = MAX; After visible row count increased");

				setRowCount(mConfig.rowMode, 11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight, 0,
					sTitle + "ScrollTop = MAX; After visible row count increased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight, 0,
					sTitle + "ScrollTop = MAX; After visible row count decreased");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after changing the row count; Small data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", ";
			var iFirstVisibleRow;
			var iScrollPosition;
			var iInnerScrollPosition;

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count increased");

				setRowCount(mConfig.rowMode, 11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count increased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count decreased");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 4499, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After visible row count increased");

				setRowCount(mConfig.rowMode, 11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition - that.iBaseRowHeight, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After visible row count increased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 4452, iInnerScrollPosition - that.iBaseRowHeight,
					sTitle + "ScrollTop = MAX; After visible row count decreased");

				setRowCount(mConfig.rowMode, 30);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 85, iScrollPosition - (20 * that.iBaseRowHeight), 1665,
					sTitle + "ScrollTop = MAX; After visible row count increased");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after changing the row count; Large data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000
			});
			var sTitle = mConfig.rowMode + ", ";
			var iFirstVisibleRow;
			var iScrollPosition;

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "ScrollTop = 0; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "ScrollTop = 0; After visible row count increased");

			}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;

				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count increased");

				setRowCount(mConfig.rowMode, 11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count increased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count decreased");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;

				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition + that.iBaseRowHeight - 1, 0,
					sTitle + "ScrollTop = MAX; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After visible row count increased");

				setRowCount(mConfig.rowMode, 11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight, 0,
					sTitle + "ScrollTop = MAX; After visible row count increased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - 1, 0,
					sTitle + "ScrollTop = MAX; After visible row count decreased");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after changing the row count; Large data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", ";
			var iFirstVisibleRow;
			var iScrollPosition;
			var iInnerScrollPosition;

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "ScrollTop = 0; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "ScrollTop = 0; After visible row count increased");

			}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count increased");

				setRowCount(mConfig.rowMode, 11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count increased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 50; After visible row count decreased");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				setRowCount(mConfig.rowMode, 9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 999550, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After visible row count decreased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After visible row count increased");

				setRowCount(mConfig.rowMode, 11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition - that.iBaseRowHeight, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After visible row count increased");

				setRowCount(mConfig.rowMode, 10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 999503, iInnerScrollPosition - that.iBaseRowHeight,
					sTitle + "ScrollTop = MAX; After visible row count decreased");

				setRowCount(mConfig.rowMode, 30);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 999999985, iScrollPosition - (20 * that.iBaseRowHeight), 1665,
					sTitle + "ScrollTop = MAX; After visible row count increased");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after binding length change; Tiny data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", ";
			var iFirstVisibleRow;
			var iScrollPosition;
			var iInnerScrollPosition;

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(40)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				that.changeBindingLength(9, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 57, iInnerScrollPosition,
					sTitle + "ScrollTop = 40; After binding length decreased (collapse)");

				that.changeBindingLength(10, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 40; After binding length increased (expand)");

				that.changeBindingLength(11, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 36, iInnerScrollPosition,
					sTitle + "ScrollTop = 40; After binding length increased (expand)");

				that.changeBindingLength(10, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 40; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(40)).then(function() {
				that.fakeODataBindingRefresh(9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 57, iInnerScrollPosition,
					sTitle + "ScrollTop = 40; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 40; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 36, iInnerScrollPosition,
					sTitle + "ScrollTop = 40; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 40; After binding length decreased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				that.changeBindingLength(9, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 3, iScrollPosition, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

				that.changeBindingLength(10, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 3, 69, 355,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.changeBindingLength(11, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 89, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

				that.changeBindingLength(10, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(9);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 3, iScrollPosition,  iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 3, 69, 355, sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 89,  iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(100);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 264, 58,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

			}).then(function() {
				that.changeBindingLength(0, ChangeReason.Change);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "After binding length changed to 0");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after binding length change; Small data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode
			});
			var sTitle = mConfig.rowMode + ", ";
			var iFirstVisibleRow;
			var iScrollPosition;

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;

				that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

				that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultOptions.bindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;

				that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight, 0,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

				that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.changeBindingLength(that.mDefaultOptions.bindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight,  0,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition,  0,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

			}).then(function() {
				that.changeBindingLength(0, ChangeReason.Change);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "After binding length changed to 0");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after binding length change; Small data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", ";
			var iFirstVisibleRow;
			var iScrollPosition;
			var iInnerScrollPosition;

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

				that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultOptions.bindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - that.iBaseRowHeight, iInnerScrollPosition - 150 + that.iBaseRowHeight,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

				that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, 4437, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.changeBindingLength(that.mDefaultOptions.bindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 4499, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - that.iBaseRowHeight, iInnerScrollPosition - 150 + that.iBaseRowHeight,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, 4437, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 4499, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength + 100);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 4674, 58,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(function() {
				that.changeBindingLength(0, ChangeReason.Change);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "After binding length changed to 0");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after binding length change; Large data; Fixed row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iBindingLength = 1000000000;

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength
			});
			var sTitle = mConfig.rowMode + ", ";
			var iFirstVisibleRow;
			var iScrollPosition;

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;

				that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

				that.changeBindingLength(iBindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(iBindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(iBindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				that.fakeODataBindingRefresh(iBindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;

				that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

				that.changeBindingLength(iBindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - 1, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.changeBindingLength(iBindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition - 1, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

				that.changeBindingLength(iBindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(iBindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition,  0,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - 1, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(iBindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition - 1,  0,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

			}).then(function() {
				that.changeBindingLength(0, ChangeReason.Change);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "After binding length changed to 0");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after binding length change; Large data; Variable row heights", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iBindingLength = 1000000000;

		function test(mConfig) {
			var oTable = that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});
			var sTitle = mConfig.rowMode + ", ";
			var iFirstVisibleRow;
			var iScrollPosition;
			var iInnerScrollPosition;

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

				that.changeBindingLength(iBindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(iBindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(iBindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				that.fakeODataBindingRefresh(iBindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition, iInnerScrollPosition - 150 + that.iBaseRowHeight,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

				that.changeBindingLength(iBindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, 999488, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.changeBindingLength(iBindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 999501, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

				that.changeBindingLength(iBindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(iBindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition, iInnerScrollPosition - 150 + that.iBaseRowHeight,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, 999488, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(iBindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 999501, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength + 100);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 999412, 58,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(function() {
				that.changeBindingLength(0, ChangeReason.Change);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "After binding length changed to 0");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					rowMode: oRowModeConfig.rowMode
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("The table's DOM is removed without notifying the table", function(assert) {
		var oTable = this.createTable();
		var oScrollExtension = oTable._getScrollExtension();
		var oTableElement;
		var oTableParentElement;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oTableElement = oTable.getDomRef();
			oTableParentElement = oTableElement.parentNode;
			oTable.setFirstVisibleRow(5);
			oTableParentElement.removeChild(oTableElement);
		}).then(TableQUnitUtils.$wait()).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 5,
				"Remove DOM synchronously after setting firstVisibleRow: The firstVisibleRow is correct");

			oTable.setFirstVisibleRow(6);
		}).then(TableQUnitUtils.$wait()).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 6,
				"Set firstVisibleRow if DOM is removed: The firstVisibleRow is correct");

		}).then(function() {
			oTableParentElement.appendChild(oTableElement);
			oTable.setFirstVisibleRow(5);
		}).then(TableQUnitUtils.$wait()).then(function() {
			oTableParentElement.removeChild(oTableElement);
		}).then(TableQUnitUtils.$wait()).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 5,
				"Remove DOM asynchronously after setting firstVisibleRow: The firstVisibleRow is correct");

		}).then(function() {
			oTableParentElement.appendChild(oTableElement);
			oScrollExtension.getVerticalScrollbar().scrollTop = 150;
			oTableParentElement.removeChild(oTableElement);
		}).then(TableQUnitUtils.$wait()).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 5,
				"Remove DOM synchronously after scrolling with scrollbar: The firstVisibleRow is correct");

		}).then(function() {
			oTableParentElement.appendChild(oTableElement);
			oScrollExtension.getVerticalScrollbar().scrollTop = 100;
			return oTable.qunit.whenVSbScrolled();
		}).then(function() {
			oTableParentElement.removeChild(oTableElement);
		}).then(TableQUnitUtils.$wait()).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 2,
				"Remove DOM asynchronously after scrolling with scrollbar: The firstVisibleRow is correct");

		}).then(function() {
			oTableParentElement.appendChild(oTableElement);
			oTable._setLargeDataScrolling(true);
			oScrollExtension.getVerticalScrollbar().scrollTop = 200;
			return oTable.qunit.whenVSbScrolled();
		}).then(function() {
			oTableParentElement.removeChild(oTableElement);
		}).then(TableQUnitUtils.$wait(300)).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 2,
				"Remove DOM asynchronously after scrolling with scrollbar and large data scrolling enabled: The firstVisibleRow is correct");
		});
	});

	QUnit.module("Special cases");

	QUnit.test("Scrolling inside the cell", function(assert) {
		var DummyControl = Control.extend("sap.ui.table.test.DummyControl", {
			renderer: {
				apiVersion: 2,
				render: function(oRm, oControl) {
					oRm.openStart("div");
					oRm.style("display", "flex");
					oRm.style("flex-direction", "column");
					oRm.openEnd();

					oRm.openStart("span");
					oRm.attr("tabindex", "0");
					oRm.style("width", "100px");
					oRm.style("margin-top", "100px");
					oRm.openEnd();
					oRm.text("really very looooooooooong text");
					oRm.close("span");

					oRm.openStart("span", oControl); // This element should be returned by getDomRef()
					oRm.attr("tabindex", "0");
					oRm.style("width", "100px");
					oRm.style("margin-left", "100px");
					oRm.openEnd();
					oRm.text("really very looooooooooong text");
					oRm.close("span");

					oRm.close("div");
				}
			}
		});

		var oTreeTable = TableQUnitUtils.createTable(TreeTable, {
			columns: [
				new Column({template: new DummyControl(), width: "20px"}),
				new Column({template: new DummyControl(), width: "20px"})
			],
			rows: {path: "/"},
			models: new JSONModel([{}]),
			rowHeight: 10,
			fixedColumnCount: 1,
			visibleRowCountMode: VisibleRowCountMode.Auto
		});

		function test(iColumnIndex) {
			var oCellContentInColumn = oTreeTable.getRows()[0].getCells()[iColumnIndex].getDomRef();

			oCellContentInColumn.focus();

			return new Promise(function(resolve) {
				setTimeout(function() {
					var $InnerCellElement = TableUtils.getCell(oTreeTable, oCellContentInColumn).find(".sapUiTableCellInner");

					assert.strictEqual(document.activeElement, oCellContentInColumn,
						"The content of the cell in row 0 column " + iColumnIndex + " is focused");
					if (oTreeTable._bRtlMode) {
						assert.strictEqual($InnerCellElement.scrollLeftRTL(), $InnerCellElement[0].scrollWidth - $InnerCellElement[0].clientWidth,
							"The cell content is not scrolled horizontally");
					} else {
						assert.strictEqual($InnerCellElement[0].scrollLeft, 0, "The cell content is not scrolled horizontally");
					}
					assert.strictEqual($InnerCellElement[0].scrollTop, 0, "The cell content is not scrolled vertically");

					resolve();
				}, 100);
			});
		}

		return oTreeTable.qunit.whenInitialRenderingFinished().then(function() {
			return test(0);
		}).then(function() {
			return test(1);
		}).then(function() {
			return changeRTL(true);
		}).then(function() {
			return test(0);
		}).then(function() {
			return test(1);
		}).then(function() {
			return changeRTL(false);
		}).then(function() {
			oTreeTable.destroy();
		});
	});

	QUnit.module("Leave action mode on scrolling", {
		beforeEach: function() {
			createTables(false, true);
			oTable.setFixedColumnCount(0);
			oTable.setEnableColumnReordering(false);
			oTable.setWidth("500px");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Scrollbar", function(assert) {
		var oEvent;

		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Horizontal
		oTable.getRows()[0].getCells()[0].focus();
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		oEvent = document.createEvent('MouseEvents');
		oEvent.initEvent("mousedown", true, true);
		oTable.getDomRef("hsb").dispatchEvent(oEvent);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Clicked on horizontal scrollbar -> Table is in Navigation Mode again");
		assert.strictEqual(document.activeElement, getCell(0, 0)[0], "Cell has focus now");
	});

	QUnit.test("MouseWheel", function(assert) {
		var oWheelEvent;

		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Horizontal
		oTable.getRows()[0].getCells()[0].focus();
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		oWheelEvent = createMouseWheelEvent(150, MouseWheelDeltaMode.PIXEL, true);
		getCell(0, 0)[0].dispatchEvent(oWheelEvent);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled horizontally -> Table is in Navigation Mode again");
		assert.strictEqual(document.activeElement, getCell(0, 0)[0], "Cell has focus now");

		// Vertical
		oTable.getRows()[0].getCells()[0].focus();
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");

		oWheelEvent = createMouseWheelEvent(150, MouseWheelDeltaMode.PIXEL, false);
		getCell(0, 0)[0].dispatchEvent(oWheelEvent);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled vertically -> Table is in Navigation Mode again");
		assert.strictEqual(document.activeElement, getCell(0, 0)[0], "Cell has focus now");
	});

	QUnit.test("Touch", function(assert) {
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;
		var oTargetElement;
		Device.support.pointer = false;
		Device.support.touch = true;
		oTable.invalidate();
		sap.ui.getCore().applyChanges();
		oTable._getKeyboardExtension()._suspendItemNavigation(); // Touch can set the focus, which can lead to scrolling. Prevent it!

		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Table is in Navigation Mode");

		// Horizontal
		oTable.getRows()[0].getCells()[0].focus();
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		oTargetElement = oTable.getDomRef("tableCCnt");
		initTouchScrolling(oTargetElement, 200);
		doTouchScrolling(150);
		endTouchScrolling();

		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled horizontally -> Table is in Navigation Mode again");
		assert.strictEqual(document.activeElement, getCell(0, 0)[0], "Cell has focus now");

		// Vertical
		oTable.getRows()[0].getCells()[0].focus();
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		oTargetElement = oTable.getDomRef("tableCCnt");
		initTouchScrolling(oTargetElement, 200);
		doTouchScrolling(undefined, 150);
		endTouchScrolling();

		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled Vertically -> Table is in Navigation Mode again");
		assert.strictEqual(document.activeElement, getCell(0, 0)[0], "Cell has focus now");

		Device.support.pointer = bOriginalPointerSupport;
		Device.support.touch = bOriginalTouchSupport;
	});
});