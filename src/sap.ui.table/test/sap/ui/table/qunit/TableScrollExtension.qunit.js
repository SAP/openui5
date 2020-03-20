/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/TableUtils",
	"sap/ui/Device",
	"sap/ui/table/library",
	"sap/ui/table/Column",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Context",
	"sap/ui/model/ChangeReason"
], function(TableQUnitUtils, qutils, Table, TreeTable, RowAction, RowActionItem, TableUtils, Device, tableLibrary, Column, Control, JSONModel,
			Context, ChangeReason) {
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

	function initTouchScrolling(oTargetElement, iPageX, iPageY) {
		var oTouchEvent;

		iTouchPositionX = iPageX || 0;
		iTouchPositionY = iPageY || 0;

		if (typeof Event === "function" && typeof window.Touch === "function") {
			var oTouchObject = new window.Touch({
				identifier: Date.now(),
				target: oTargetElement,
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

		oTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
	}

	function doTouchScrolling(oTargetElement, iScrollDeltaX, iScrollDeltaY) {
		var oTouchEvent;

		iTouchPositionX -= iScrollDeltaX || 0;
		iTouchPositionY -= iScrollDeltaY || 0;

		if (typeof Event === "function" && typeof window.Touch === "function") {
			var oTouchObject = new window.Touch({
				identifier: Date.now(),
				target: oTargetElement,
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

		oTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
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

	QUnit.test("_debug", function(assert) {
		var oScrollExtension = oTable._getScrollExtension();

		assert.ok(!oScrollExtension._ScrollingHelper, "No debug mode: ScrollingHelper is not accessible");
		assert.ok(!oScrollExtension._ExtensionDelegate, "No debug mode: ExtensionDelegate is not accessible");
		assert.ok(!oScrollExtension._HorizontalScrollingHelper, "No debug mode: HorizontalScrollingHelper is not accessible");
		assert.ok(!oScrollExtension._VerticalScrollingHelper, "No debug mode: VerticalScrollingHelper is not accessible");

		oScrollExtension._debug();
		assert.ok(oScrollExtension._ScrollingHelper, "Debug mode: ScrollingHelper is accessible");
		assert.ok(oScrollExtension._ExtensionDelegate, "Debug mode: ExtensionDelegate is accessible");
		assert.ok(oScrollExtension._HorizontalScrollingHelper, "Debug mode: HorizontalScrollingHelper is accessible");
		assert.ok(oScrollExtension._VerticalScrollingHelper, "Debug mode: VerticalScrollingHelper is accessible");
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
			this.oScrollExtension._debug();
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
			this.oScrollExtension._debug();
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
		var oGetInnerVerticalScrollRangeStub = sinon.stub(this.oScrollExtension._VerticalScrollingHelper, "getInnerScrollRange");
		var that = this;
		oTable._bVariableRowHeightEnabled = true;

		function test(iTotalRowCount, iRowCount, iInnerScrollRange, bVSbShouldBeRequired) {
			oGetTotalRowCountStub.returns(iTotalRowCount);
			oGetRowCountsStub.returns({
				count: iRowCount
			});
			oGetInnerVerticalScrollRangeStub.returns(iInnerScrollRange);

			assert.strictEqual(that.oScrollExtension.isVerticalScrollbarRequired(), bVSbShouldBeRequired,
				"Total row count: " + iTotalRowCount + ", Visible row count: " + iRowCount + ", Inner scroll range: " + iInnerScrollRange);
		}

		test(10, 10, 0, false); // Total row count <= Visible row count
		test(10, 1, 0, true); // Total row count > Visible row count
		test(1, 10, 1, true); // Total row count <= Visible row count, but inner scroll range > 0 (increased row heights)
		test(10, 1, 1, true); // Total row count > Visible row count

		oTable._bVariableRowHeightEnabled = false;

		test(10, 10, 0, false); // Total row count <= Visible row count
		test(10, 1, 0, true); // Total row count > Visible row count
		test(1, 10, 1, false); // Total row count <= Visible row count, but inner scroll range > 0 (increased row heights)
		test(10, 1, 1, true); // Total row count > Visible row count

		oGetTotalRowCountStub.restore();
		oGetRowCountsStub.restore();
		oGetInnerVerticalScrollRangeStub.restore();
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
			this.oScrollExtension._debug();

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

				window.setTimeout(function() {
					that.assertSynchronization(assert);
					resolve();
				}, iAssertionDelay);
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

			return new Promise(function(resolve) {
				window.setTimeout(function() {
					that.assertSynchronization(assert);
					resolve();
				}, iAssertionDelay);
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
			return scrollWithTouch(oTargetElement, 150, iCurrentScrollPosition + 150, true).then(function() {
				return scrollWithTouch(oTargetElement, -150, iCurrentScrollPosition - 150, true);
			});
		}

		function scrollBeyondBoundaries(oTargetElement) {
			that.oHSb.scrollLeft = 0;
			iCurrentScrollPosition = 0;

			initTouchScrolling(oTargetElement, 200);
			return scrollWithTouch(oTargetElement, -150, 0, true).then(function() {
				that.oHSb.scrollLeft = that.oHSb.scrollWidth - that.oHSb.getBoundingClientRect().width;
				iCurrentScrollPosition = that.oHSb.scrollLeft;

				initTouchScrolling(oTargetElement, 200);
				return scrollWithTouch(oTargetElement, 150, iCurrentScrollPosition, true);
			});
		}

		function scrollOnInvalidTarget(oTargetElement) {
			that.oHSb.scrollLeft = 50;
			iCurrentScrollPosition = 50;

			initTouchScrolling(oTargetElement, 200);
			return scrollWithTouch(oTargetElement, 150, iCurrentScrollPosition, false).then(function() {
				initTouchScrolling(oTargetElement, 200);
				return scrollWithTouch(oTargetElement, -150, iCurrentScrollPosition, false);
			});
		}

		function scrollWithTouch(oTargetElement, iScrollDelta, iExpectedScrollPosition, bValidTarget) {
			return new Promise(function(resolve) {
				var oTouchEvent = doTouchScrolling(oTargetElement, iScrollDelta);

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

		function changeRTL(bRTL) {
			return new Promise(function(resolve) {
				sap.ui.getCore().getConfiguration().setRTL(bRTL);
				// Give the text direction change enough time, otherwise the UI might not be ready when the tests start.
				// BCP: 1870395335
				window.setTimeout(function() {
					oTable.invalidate();
					sap.ui.getCore().applyChanges();
					resolve();
				}, 500);
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
			this.mDefaultOptions = {
				models: new JSONModel({
					configA: {rowHeight: "1px", child: {rowHeight: "1px"}},
					configB: {rowHeight: "149px"} // 149px to have a row height of 150px, as the row adds 1px border.
				}),
				bindingLength: 100
			};
			this.fakeAutoRowCount = 15;

			this.aTestedVisibleRowCountModes = [
				VisibleRowCountMode.Fixed,
				VisibleRowCountMode.Auto
			];

			TableQUnitUtils.setDefaultOptions(this.mDefaultOptions);

			// Collect rendering information for later usage.
			var oTable = this.createTable();
			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				this.defaultRowHeight = oTable._getBaseRowHeight();
				this.fixedScrollbarHeight = oTable._getScrollExtension().getVerticalScrollbar().clientHeight;
				oTable.destroy();
				oTable = this.createTable({visibleRowCountMode: VisibleRowCountMode.Auto});
			}.bind(this)).then(oTable.qunit.whenInitialRenderingFinished).then(function() {
				this.autoScrollbarHeight = oTable._getScrollExtension().getVerticalScrollbar().clientHeight;
				oTable.destroy();
			}.bind(this));
		},
		afterEach: function() {
			this.destroyTable();
		},
		after: function() {
			TableQUnitUtils.setDefaultOptions();
		},
		getMaxFirstVisibleRow: function(sVisibleRowCountMode, iBindingLength) {
			iBindingLength = iBindingLength == null ? this.mDefaultOptions.bindingLength : iBindingLength;
			return iBindingLength - (sVisibleRowCountMode === VisibleRowCountMode.Auto ? this.fakeAutoRowCount : 10);
		},
		getMaxFirstRenderedRow: function(sVisibleRowCountMode, iBindingLength) {
			return this.getMaxFirstVisibleRow(sVisibleRowCountMode, iBindingLength) - 1;
		},
		getMaxScrollTop: function(sVisibleRowCountMode, iBindingLength) {
			iBindingLength = iBindingLength == null ? this.mDefaultOptions.bindingLength : iBindingLength;
			var iScrollRange = Math.min(1000000, iBindingLength * this.defaultRowHeight);
			return iScrollRange - (sVisibleRowCountMode === VisibleRowCountMode.Auto ? this.autoScrollbarHeight : this.fixedScrollbarHeight);
		},
		createTable: function(mOptions, fnBeforePlaceAt) {
			this.destroyTable();

			TableQUnitUtils.createTable(null, mOptions, function(oTable, mOptions) {
				this.oTable = oTable;

				oTable._getBaseRowHeight = function() {
					return 49;
				};

				oTable.addColumn(new Column({
					template: new HeightControl({height: "{rowHeight}"})
				}));

				if (oTable._getRowMode().isA("sap.ui.table.rowmodes.AutoRowMode")) {
					oTable._getRowMode().determineAvailableSpace = function() {
						return this.fakeAutoRowCount * this.defaultRowHeight;
					}.bind(this);
				}

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
				sTitle + "The first visible row is correct");
			assert.strictEqual(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop, iScrollPosition,
				sTitle + "The scroll position is correct");
			assert.strictEqual(this.oTable.getDomRef("tableCCnt").scrollTop, iInnerScrollPosition,
				sTitle + "The inner scroll position is correct");
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

			that.oTable.invalidate();
			sap.ui.getCore().applyChanges();

			return that.oTable.qunit.whenRenderingFinished().then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition, sTitle + "After re-rendering");

				that.fakeODataBindingChange();
			}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition, sTitle + "After binding change");

			}).then(function() {
				that.fakeODataBindingRefresh();
			}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition, sTitle + "After binding refresh");

			// TODO: TDD - Make these tests pass.
			//that.fakeODataBindingRefresh();
			//that.oTable.invalidate();
			//}).then(that.oTable.qunit.whenRenderingFinished).then(function() {
			//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
			//	sTitle + "After simultaneous re-rendering & binding refresh");
			});
		}
	});

	QUnit.test("Initial scroll position; Tiny data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: 5
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, 0, 0, 0, mConfig.visibleRowCountMode + " mode, " + mConfig.title + "; After rendering");
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Tiny data; Variable row heights; Fixed mode", function(assert) {
		var that = this;

		function test(mConfig) {
			var oTable = that.createTable({
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: mConfig.bindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, 0, 0, 0, mConfig.title + "; After rendering");
			});
		}

		return test({
			title: "No overflow, FirstVisibleRow = 1",
			bindingLength: 2,
			firstVisibleRow: 1
		}).then(function() {
			return test({
				title: "Overflow, FirstVisibleRow = 1",
				bindingLength: 11, // VisibleRowCount = 10, but 1 row is always in the buffer
				firstVisibleRow: 1
			});
		});
	});

	QUnit.test("Initial scroll position; Tiny data; Variable row heights; Auto mode", function(assert) {
		var that = this;

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: VisibleRowCountMode.Auto,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: mConfig.bindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, 0, 0, 0, mConfig.title + "; After rendering");
			});
		}

		return test({
			title: "No overflow, FirstVisibleRow = 1",
			bindingLength: 2,
			firstVisibleRow: 1
		}).then(function() {
			return test({
				title: "Overflow, FirstVisibleRow = 1",
				bindingLength: that.fakeAutoRowCount + 1, // 1 row is always in the buffer
				firstVisibleRow: 1
			});
		});
	});

	QUnit.test("Initial scroll position; Small data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode,
				firstVisibleRow: mConfig.firstVisibleRow
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.firstVisibleRow * that.defaultRowHeight, 0,
					mConfig.visibleRowCountMode + " mode, " + mConfig.title + "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.visibleRowCountMode + " mode, " + mConfig.title);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 0",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 5",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 5
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Small data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(VisibleRowCountMode.Fixed);
		var iMaxScrollTop = 4459;

		function test(mConfig) {
			var oTable = that.createTable({
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop, mConfig.title + "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.title);
			});
		}

		return test({
			title: "FirstVisibleRow = 0",
			initialFirstVisibleRow: 0,
			firstVisibleRow: 0,
			scrollTop: 0,
			innerScrollTop: 0
		}).then(function() {
			return test({
				title: "FirstVisibleRow = 1",
				initialFirstVisibleRow: 1,
				firstVisibleRow: 1,
				scrollTop: 1 * that.defaultRowHeight,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = 5",
				initialFirstVisibleRow: 5,
				firstVisibleRow: 5,
				scrollTop: 5 * that.defaultRowHeight,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index",
				initialFirstVisibleRow: iMaxFirstRenderedRow,
				firstVisibleRow: iMaxFirstRenderedRow,
				scrollTop: iMaxFirstRenderedRow * that.defaultRowHeight,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index + 1",
				initialFirstVisibleRow: iMaxFirstRenderedRow + 1,
				firstVisibleRow: iMaxFirstRenderedRow + 1,
				scrollTop: 4375,
				innerScrollTop: 150
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index + 2",
				initialFirstVisibleRow: iMaxFirstRenderedRow + 2,
				firstVisibleRow: iMaxFirstRenderedRow + 2,
				scrollTop: 4389,
				innerScrollTop: that.defaultRowHeight + 150
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = MAX - 1",
				initialFirstVisibleRow: that.mDefaultOptions.bindingLength - 2,
				firstVisibleRow: 96,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 655
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = MAX",
				initialFirstVisibleRow: that.mDefaultOptions.bindingLength - 1,
				firstVisibleRow: 96,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 655
			});
		});
	});

	QUnit.test("Initial scroll position; Small data; Variable row heights; Auto mode", function(assert) {
		var that = this;
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(VisibleRowCountMode.Auto);
		var iMaxScrollTop = 4214;

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: VisibleRowCountMode.Auto,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop, mConfig.title + "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.title);
			});
		}

		return test({
			title: "FirstVisibleRow = 0",
			visibleRowCountMode: VisibleRowCountMode.Auto,
			initialFirstVisibleRow: 0,
			firstVisibleRow: 0,
			scrollTop: 0,
			innerScrollTop: 0
		}).then(function() {
			return test({
				title: "FirstVisibleRow = 1",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: 1,
				firstVisibleRow: 1,
				scrollTop: 1 * that.defaultRowHeight,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = 5",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: 5,
				firstVisibleRow: 5,
				scrollTop: 5 * that.defaultRowHeight,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: iMaxFirstRenderedRow,
				firstVisibleRow: iMaxFirstRenderedRow,
				scrollTop: iMaxFirstRenderedRow * that.defaultRowHeight,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index + 1",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: iMaxFirstRenderedRow + 1,
				firstVisibleRow: iMaxFirstRenderedRow + 1,
				scrollTop: 4126,
				innerScrollTop: that.defaultRowHeight
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index + 2",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: iMaxFirstRenderedRow + 2,
				firstVisibleRow: iMaxFirstRenderedRow + 2,
				scrollTop: 4136,
				innerScrollTop: that.defaultRowHeight + 150
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = MAX - 1",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: that.mDefaultOptions.bindingLength - 2,
				firstVisibleRow: 94,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 857
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = MAX",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: that.mDefaultOptions.bindingLength - 1,
				firstVisibleRow: 94,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 857
			});
		});
	});

	QUnit.test("Initial scroll position; Large data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iBindingLength = 1000000000;

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: iBindingLength
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, 0,
					mConfig.visibleRowCountMode + " mode, " + mConfig.title, "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.visibleRowCountMode + " mode, " + mConfig.title);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 0",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 0,
					scrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 1,
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 987654",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 987654,
					scrollTop: 987
				});
			}).then(function() {
				// TODO: TDD - Make these tests pass.
				//return test({
				//	title: "FirstVisibleRow = MAX - 1",
				//	visibleRowCountMode: sVisibleRowCountMode,
				//	firstVisibleRow: that.getMaxFirstVisibleRow(sVisibleRowCountMode, iBindingLength) - 1,
				//	scrollTop: that.getMaxScrollTop(sVisibleRowCountMode, iBindingLength) - 1
				//});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: that.getMaxFirstVisibleRow(sVisibleRowCountMode, iBindingLength),
					scrollTop: that.getMaxScrollTop(sVisibleRowCountMode, iBindingLength)
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Large data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(VisibleRowCountMode.Fixed, iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Fixed, iBindingLength);

		function test(mConfig) {
			var oTable = that.createTable({
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop, mConfig.title + "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.title);
			});
		}

		return test({
			title: "FirstVisibleRow = 0",
			initialFirstVisibleRow: 0,
			firstVisibleRow: 0,
			scrollTop: 0,
			innerScrollTop: 0
		}).then(function() {
			return test({
				title: "FirstVisibleRow = 1",
				initialFirstVisibleRow: 1,
				firstVisibleRow: 1,
				scrollTop: 1,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = 987654",
				initialFirstVisibleRow: 987654,
				firstVisibleRow: 987654,
				scrollTop: 987,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index",
				initialFirstVisibleRow: iMaxFirstRenderedRow,
				firstVisibleRow: iMaxFirstRenderedRow,
				scrollTop: 999412,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index + 1",
				initialFirstVisibleRow: iMaxFirstRenderedRow + 1,
				firstVisibleRow: iMaxFirstRenderedRow + 1,
				scrollTop: 999426,
				innerScrollTop: 150
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index + 2",
				initialFirstVisibleRow: iMaxFirstRenderedRow + 2,
				firstVisibleRow: iMaxFirstRenderedRow + 2,
				scrollTop: 999440,
				innerScrollTop: that.defaultRowHeight + 150
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = MAX - 1",
				initialFirstVisibleRow: iBindingLength - 2,
				firstVisibleRow: 999999996,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 655
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = MAX",
				initialFirstVisibleRow: iBindingLength - 1,
				firstVisibleRow: 999999996,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 655
			});
		});
	});

	QUnit.test("Initial scroll position; Large data; Variable row heights; Auto mode", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(VisibleRowCountMode.Auto, iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Auto, iBindingLength);

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: VisibleRowCountMode.Auto,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop, mConfig.title + "; After rendering");
			}).then(function() {
				return that.testRestoration(assert, mConfig.title);
			});
		}

		return test({
			title: "FirstVisibleRow = 0",
			visibleRowCountMode: VisibleRowCountMode.Auto,
			initialFirstVisibleRow: 0,
			firstVisibleRow: 0,
			scrollTop: 0,
			innerScrollTop: 0
		}).then(function() {
			return test({
				title: "FirstVisibleRow = 1",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: 1,
				firstVisibleRow: 1,
				scrollTop: 1,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = 987654",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: 987654,
				firstVisibleRow: 987654,
				scrollTop: 987,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: iMaxFirstRenderedRow,
				firstVisibleRow: iMaxFirstRenderedRow,
				scrollTop: 999167,
				innerScrollTop: 0
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index + 1",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: iMaxFirstRenderedRow + 1,
				firstVisibleRow: iMaxFirstRenderedRow + 1,
				scrollTop: 999177,
				innerScrollTop: that.defaultRowHeight
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = Max first rendered row index + 2",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: iMaxFirstRenderedRow + 2,
				firstVisibleRow: iMaxFirstRenderedRow + 2,
				scrollTop: 999187,
				innerScrollTop: that.defaultRowHeight + 150
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = MAX - 1",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: iBindingLength - 2,
				firstVisibleRow: 999999994,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 857
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = MAX",
				visibleRowCountMode: VisibleRowCountMode.Auto,
				initialFirstVisibleRow: iBindingLength - 1,
				firstVisibleRow: 999999994,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 857
			});
		});
	});

	QUnit.test("Initial scroll position; Large data; Fixed row heights; Fixed mode; Floating point precision edge case", function(assert) {
		var that = this;
		var oTable = that.createTable({
			firstVisibleRow: 1000000000,
			visibleRowCount: 18,
			bindingLength: 1000000000
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			var iExpectedFirstVisibleRow = 1000000000 - 18;
			var iExpectedScrollPosition = 1000000 - oTable._getScrollExtension().getVerticalScrollbar().clientHeight;
			that.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollPosition, 0, "After rendering");
		}).then(function() {
			return that.testRestoration(assert);
		});
	});

	QUnit.test("Initial scroll position; Large data; Variable row heights; Fixed mode; Floating point precision edge case", function(assert) {
		var that = this;
		var oTable = that.createTable({
			firstVisibleRow: 1000000000,
			visibleRowCount: 18,
			bindingLength: 1000000000,
			_bVariableRowHeightEnabled: true
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			var iExpectedScrollPosition = 1000000 - oTable._getScrollExtension().getVerticalScrollbar().clientHeight;
			that.assertPosition(assert, 999999992, iExpectedScrollPosition, 1059, "After rendering");
		}).then(function() {
			return that.testRestoration(assert);
		});
	});

	QUnit.test("Scroll by setting ScrollTop; Tiny data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			bindingLength: 11,
			_bVariableRowHeightEnabled: true
		});

		return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
			that.assertPosition(assert, 0, 1, 3, "ScrollTop set to 1");
		}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
			that.assertPosition(assert, 2, 48, 245, "ScrollTop set to 48");
		}).then(oTable.qunit.$scrollVSbTo(49)).then(function() {
			that.assertPosition(assert, 3, 49, 248, "ScrollTop set to 49");
		}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
			that.assertPosition(assert, 2, 48, 245, "ScrollTop set to 48");
		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			// TODO: TDD - Remove these tests after enabling the below commented out tests.
			that.assertPosition(assert, 6, 98, 554, "ScrollTop set to MAX");
			// TODO: TDD - Make these tests pass.
			//that.assertPosition(assert, 5, 98, 554, "ScrollTop set to MAX");
		}).then(oTable.qunit.$scrollVSbTo(1)).then(function() {
			that.assertPosition(assert, 0, 1, 3, "ScrollTop set to 1");
		}).then(oTable.qunit.$scrollVSbTo(0)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "ScrollTop set to 0");
		});
	});

	QUnit.test("Scroll by setting ScrollTop; Small data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTable({
				visibleRowCountMode: sVisibleRowCountMode
			});
			var iMaxFirstVisibleRow = that.getMaxFirstVisibleRow(sVisibleRowCountMode);
			var iMaxScrollTop = that.getMaxScrollTop(sVisibleRowCountMode);
			var sTitle = sVisibleRowCountMode + " mode, ScrollTop set to ";

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
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test(sVisibleRowCountMode);
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll by setting ScrollTop; Small data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			_bVariableRowHeightEnabled: true
		});
		var iMaxScrollTop = 4459;

		return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
			that.assertPosition(assert, 0, 1, 1, "ScrollTop set to 1");
		}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
			that.assertPosition(assert, 0, 48, 48, "ScrollTop set to 48");
		}).then(oTable.qunit.$scrollVSbTo(49)).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop set to 49");
		}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
			that.assertPosition(assert, 0, 48, 48, "ScrollTop set to 48");
		}).then(oTable.qunit.$scrollVSbTo(200)).then(function() {
			that.assertPosition(assert, 4, 200, 4, "ScrollTop set to 200");
		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			that.assertPosition(assert, 96, iMaxScrollTop, 655, "ScrollTop set to MAX");
		}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
			that.assertPosition(assert, 95, iMaxScrollTop - 1, 655, "ScrollTop set to MAX - 1");
		}).then(oTable.qunit.$scrollVSbBy(-48)).then(function() {
			that.assertPosition(assert, 92, iMaxScrollTop - 49, 373, "ScrollTop set to MAX - 49");
		}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
			that.assertPosition(assert, 92, iMaxScrollTop - 50, 370, "ScrollTop set to MAX - 50");
		}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
			that.assertPosition(assert, 92, iMaxScrollTop - 49, 373, "ScrollTop set to MAX - 49");
		}).then(oTable.qunit.$scrollVSbTo(iMaxScrollTop - 1)).then(function() {
			that.assertPosition(assert, 95, iMaxScrollTop - 1, 655, "ScrollTop set to MAX - 1");
		}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
			that.assertPosition(assert, 96, iMaxScrollTop, 655, "ScrollTop set to MAX");
		}).then(oTable.qunit.$scrollVSbTo(1)).then(function() {
			that.assertPosition(assert, 0, 1, 1, "ScrollTop set to 1");
		}).then(oTable.qunit.$scrollVSbTo(0)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "ScrollTop set to 0");
		});
	});

	QUnit.test("Scroll by setting ScrollTop; Small data; Variable row heights; Auto mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto,
			_bVariableRowHeightEnabled: true
		});
		var iMaxScrollTop = 4214;

		return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
			that.assertPosition(assert, 0, 1, 1, "ScrollTop set to 1");
		}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
			that.assertPosition(assert, 0, 48, 48, "ScrollTop set to 48");
		}).then(oTable.qunit.$scrollVSbTo(49)).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop set to 49");
		}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
			that.assertPosition(assert, 0, 48, 48, "ScrollTop set to 48");
		}).then(oTable.qunit.$scrollVSbTo(200)).then(function() {
			that.assertPosition(assert, 4, 200, 4, "ScrollTop set to 200");
		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			that.assertPosition(assert, 94, iMaxScrollTop, 857, "ScrollTop set to MAX");
		}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
			that.assertPosition(assert, 93, iMaxScrollTop - 1, 857, "ScrollTop set to MAX - 1");
		}).then(oTable.qunit.$scrollVSbBy(-48)).then(function() {
			that.assertPosition(assert, 89, iMaxScrollTop - 49, 447, "ScrollTop set to MAX - 49");
		}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
			that.assertPosition(assert, 88, iMaxScrollTop - 50, 442, "ScrollTop set to MAX - 50");
		}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
			that.assertPosition(assert, 89, iMaxScrollTop - 49, 447, "ScrollTop set to MAX - 49");
		}).then(oTable.qunit.$scrollVSbTo(iMaxScrollTop - 1)).then(function() {
			that.assertPosition(assert, 93, iMaxScrollTop - 1, 857, "ScrollTop set to MAX - 1");
		}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
			that.assertPosition(assert, 94, iMaxScrollTop, 857, "ScrollTop set to MAX");
		}).then(oTable.qunit.$scrollVSbTo(1)).then(function() {
			that.assertPosition(assert, 0, 1, 1, "ScrollTop set to 1");
		}).then(oTable.qunit.$scrollVSbTo(0)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "ScrollTop set to 0");
		});
	});

	QUnit.test("Scroll by setting ScrollTop; Large data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTable({
				visibleRowCountMode: sVisibleRowCountMode,
				bindingLength: 1000000000
			});
			var iMaxFirstVisibleRow = that.getMaxFirstVisibleRow(sVisibleRowCountMode, 1000000000);
			var iMaxScrollTop = that.getMaxScrollTop(sVisibleRowCountMode, 1000000000);
			var iRowsPerPixel = iMaxFirstVisibleRow / iMaxScrollTop;
			var sTitle = sVisibleRowCountMode + " mode, ScrollTop set to ";

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

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test(sVisibleRowCountMode);
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll by setting ScrollTop; Large data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			bindingLength: 1000000000,
			_bVariableRowHeightEnabled: true
		});
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Fixed, 1000000000);

		return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
			that.assertPosition(assert, 1000, 1, 29, "ScrollTop set to 1");
		}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
			that.assertPosition(assert, 48028, 48, 12, "ScrollTop set to 48");
		}).then(oTable.qunit.$scrollVSbTo(500000)).then(function() {
			that.assertPosition(assert, 500294167, 500000, 146, "ScrollTop set to 500000");
		}).then(oTable.qunit.$scrollVSbTo(500001)).then(function() {
			that.assertPosition(assert, 500295168, 500001, 27, "ScrollTop set to 500001");
		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			that.assertPosition(assert, 999999996, iMaxScrollTop, 655, "ScrollTop set to MAX");
		}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
			that.assertPosition(assert, 999999995, iMaxScrollTop - 1, 655, "ScrollTop set to MAX - 1");
		}).then(oTable.qunit.$scrollVSbBy(-9)).then(function() {
			that.assertPosition(assert, 999999995, iMaxScrollTop - 10, 639, "ScrollTop set to MAX - 10");
		}).then(oTable.qunit.$scrollVSbBy(-38)).then(function() {
			that.assertPosition(assert, 999999992, iMaxScrollTop - 48, 377, "ScrollTop set to MAX - 48");
		}).then(oTable.qunit.$scrollVSbTo(iMaxScrollTop - 1)).then(function() {
			that.assertPosition(assert, 999999995, iMaxScrollTop - 1, 655, "ScrollTop set to MAX - 1");
		}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
			that.assertPosition(assert, 999999996, iMaxScrollTop, 655, "ScrollTop set to MAX");
		}).then(oTable.qunit.$scrollVSbTo(1)).then(function() {
			that.assertPosition(assert, 1000, 1, 29, "ScrollTop set to 1");
		}).then(oTable.qunit.$scrollVSbTo(0)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "ScrollTop set to 0");
		});
	});

	QUnit.test("Scroll by setting ScrollTop; Large data; Variable row heights; Auto mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto,
			bindingLength: 1000000000,
			_bVariableRowHeightEnabled: true
		});
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Auto, 1000000000);

		return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
			that.assertPosition(assert, 1000, 1, 41, "ScrollTop set to 1");
		}).then(oTable.qunit.$scrollVSbTo(48)).then(function() {
			that.assertPosition(assert, 48040, 48, 1, "ScrollTop set to 48");
		}).then(oTable.qunit.$scrollVSbTo(500000)).then(function() {
			that.assertPosition(assert, 500416839, 500000, 109, "ScrollTop set to 500000");
		}).then(oTable.qunit.$scrollVSbTo(500001)).then(function() {
			that.assertPosition(assert, 500417840, 500001, 27, "ScrollTop set to 500001");
		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			that.assertPosition(assert, 999999994, iMaxScrollTop, 857, "ScrollTop set to MAX");
		}).then(oTable.qunit.$scrollVSbBy(-1)).then(function() {
			that.assertPosition(assert, 999999993, iMaxScrollTop - 1, 857, "ScrollTop set to MAX - 1");
		}).then(oTable.qunit.$scrollVSbBy(-9)).then(function() {
			that.assertPosition(assert, 999999992, iMaxScrollTop - 10, 844, "ScrollTop set to MAX - 10");
		}).then(oTable.qunit.$scrollVSbBy(-38)).then(function() {
			that.assertPosition(assert, 999999989, iMaxScrollTop - 48, 462, "ScrollTop set to MAX - 48");
		}).then(oTable.qunit.$scrollVSbTo(iMaxScrollTop - 1)).then(function() {
			that.assertPosition(assert, 999999993, iMaxScrollTop - 1, 857, "ScrollTop set to MAX - 1");
		}).then(oTable.qunit.$scrollVSbBy(1)).then(function() {
			that.assertPosition(assert, 999999994, iMaxScrollTop, 857, "ScrollTop set to MAX");
		}).then(oTable.qunit.$scrollVSbTo(1)).then(function() {
			that.assertPosition(assert, 1000, 1, 41, "ScrollTop set to 1");
		}).then(oTable.qunit.$scrollVSbTo(0)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "ScrollTop set to 0");
		});
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Tiny data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			bindingLength: 11,
			_bVariableRowHeightEnabled: true
		});

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oTable.setFirstVisibleRow(1);
			return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
		}).then(function() {
			that.assertPosition(assert, 1, 16, 49, "FirstVisibleRow set to 1");

			oTable.setFirstVisibleRow(3);
			return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
		}).then(function() {
			that.assertPosition(assert, 3, 49, 248, "FirstVisibleRow set to 3");

			oTable.setFirstVisibleRow(7);
			return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
		}).then(function() {
			// TODO: TDD - Remove these tests after enabling the below commented out tests.
			that.assertPosition(assert, 6, 98, 554, "FirstVisibleRow set to > MAX");
			// TODO: TDD - Make these tests pass.
			//that.assertPosition(assert, 5, 98, 554, "FirstVisibleRow set to > MAX");

			oTable.setFirstVisibleRow(5);
			return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
		}).then(function() {
			that.assertPosition(assert, 5, 82, 447, "FirstVisibleRow set to MAX");

			oTable.setFirstVisibleRow(0);
			return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
		}).then(function() {
			that.assertPosition(assert, 0, 0, 0, "FirstVisibleRow set to 0");
		});
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Small data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTable({
				visibleRowCountMode: sVisibleRowCountMode
			});
			var iMaxFirstVisibleRow = that.getMaxFirstVisibleRow(sVisibleRowCountMode);
			var iMaxScrollTop = that.getMaxScrollTop(sVisibleRowCountMode);
			var sTitle = sVisibleRowCountMode + " mode, FirstVisibleRow set to ";

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 1, that.defaultRowHeight, 0, sTitle + "1");
				oTable.setFirstVisibleRow(33);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 33, 33 * that.defaultRowHeight, 0, sTitle + "33");
				oTable.setFirstVisibleRow(iMaxFirstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
				oTable.setFirstVisibleRow(iMaxFirstVisibleRow - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - that.defaultRowHeight, 0, sTitle + "MAX - 1");
				oTable.setFirstVisibleRow(0);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			}).then(oTable.qunit.$scrollVSbTo(2 * that.defaultRowHeight + 10)).then(function() {
				that.assertPosition(assert, 2, 2 * that.defaultRowHeight + 10, 0,
					sVisibleRowCountMode + " mode, Scrolled to FirstVisibleRow = 2 by setting ScrollTop");
				oTable.setFirstVisibleRow(2);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 2, 2 * that.defaultRowHeight, 0, sTitle + "2");
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test(sVisibleRowCountMode);
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Small data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			_bVariableRowHeightEnabled: true
		});
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(VisibleRowCountMode.Fixed);
		var iMaxScrollTop = 4459;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oTable.setFirstVisibleRow(1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, that.defaultRowHeight, 0, "FirstVisibleRow set to 1");
			oTable.setFirstVisibleRow(33);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 33, 33 * that.defaultRowHeight, 0, "FirstVisibleRow set to 33");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow, iMaxFirstRenderedRow * that.defaultRowHeight, 0,
				"FirstVisibleRow set to Max first rendered row index");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow + 1, 4375, 150,
				"FirstVisibleRow set to Max first rendered row index + 1");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 2);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow + 2, 4389, that.defaultRowHeight + 150,
				"FirstVisibleRow set to Max first rendered row index + 2");
			oTable.setFirstVisibleRow(that.mDefaultOptions.bindingLength - 2);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 96, iMaxScrollTop, 655, "FirstVisibleRow set to MAX - 1");
			oTable.setFirstVisibleRow(that.mDefaultOptions.bindingLength - 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 96, iMaxScrollTop, 655, "FirstVisibleRow set to MAX");
			oTable.setFirstVisibleRow(0);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 0, 0, 0, "FirstVisibleRow set to 0");
		}).then(oTable.qunit.$scrollVSbTo(2 * that.defaultRowHeight + 10)).then(function() {
			that.assertPosition(assert, 2, 2 * that.defaultRowHeight + 10, 10, "Scrolled to FirstVisibleRow = 2 by setting ScrollTop");
			oTable.setFirstVisibleRow(2);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 2, 2 * that.defaultRowHeight, 0, "FirstVisibleRow set to 2");
		});
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Small data; Variable row heights; Auto mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto,
			_bVariableRowHeightEnabled: true
		});
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(VisibleRowCountMode.Auto);
		var iMaxScrollTop = 4214;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oTable.setFirstVisibleRow(1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, that.defaultRowHeight, 0, "FirstVisibleRow set to 1");
			oTable.setFirstVisibleRow(33);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 33, 33 * that.defaultRowHeight, 0, "FirstVisibleRow set to 33");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow, iMaxFirstRenderedRow * that.defaultRowHeight, 0,
				"FirstVisibleRow set to Max first rendered row index");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow + 1, 4126, that.defaultRowHeight,
				"FirstVisibleRow set to Max first rendered row index + 1");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 2);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow + 2, 4136, that.defaultRowHeight + 150,
				"FirstVisibleRow set to Max first rendered row index + 2");
			oTable.setFirstVisibleRow(that.mDefaultOptions.bindingLength - 2);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 94, iMaxScrollTop, 857, "FirstVisibleRow set to MAX - 1");
			oTable.setFirstVisibleRow(that.mDefaultOptions.bindingLength - 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 94, iMaxScrollTop, 857, "FirstVisibleRow set to MAX");
			oTable.setFirstVisibleRow(0);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 0, 0, 0, "FirstVisibleRow set to 0");
		}).then(oTable.qunit.$scrollVSbTo(2 * that.defaultRowHeight + 10)).then(function() {
			that.assertPosition(assert, 2, 2 * that.defaultRowHeight + 10, 10, "Scrolled to FirstVisibleRow = 2 by setting ScrollTop");
			oTable.setFirstVisibleRow(2);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 2, 2 * that.defaultRowHeight, 0, "FirstVisibleRow set to 2");
		});
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Large data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(sVisibleRowCountMode) {
			var oTable = that.createTable({
				visibleRowCountMode: sVisibleRowCountMode,
				bindingLength: 1000000000
			});
			var iMaxFirstVisibleRow = that.getMaxFirstVisibleRow(sVisibleRowCountMode, 1000000000);
			var iMaxScrollTop = that.getMaxScrollTop(sVisibleRowCountMode, 1000000000);
			var iMiddleFirstVisibleRow = Math.floor((Math.round(iMaxScrollTop / 2) / iMaxScrollTop) * iMaxFirstVisibleRow);
			var sTitle = sVisibleRowCountMode + " mode, FirstVisibleRow set to ";

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
				// TODO: TDD - Make these tests pass.
				//	oTable.setFirstVisibleRow(iMaxFirstVisibleRow - 1);
				//}).then(oTable.qunit.whenRenderingFinished).then(function() {
				//	that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, "FirstVisibleRow set to MAX - 1");
				oTable.setFirstVisibleRow(0);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 0, 0, 0, sTitle + "0");
			}).then(function() {
				return oTable.qunit.scrollVSbTo(Math.round(iMaxScrollTop / 2));
			}).then(function() {
				//  Scrolltop of iMaxScrollTop / 2 does not exactly match row 500000000 (ScrollExtensions internal float vs browsers scrolltop integer)
				that.assertPosition(assert, iMiddleFirstVisibleRow, Math.round(iMaxScrollTop / 2), 0,
					sVisibleRowCountMode + " mode, Scrolled to FirstVisibleRow = " + iMiddleFirstVisibleRow + " by setting ScrollTop");
				oTable.setFirstVisibleRow(iMiddleFirstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMiddleFirstVisibleRow, Math.round(iMaxScrollTop / 2), 0, sTitle + iMiddleFirstVisibleRow);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test(sVisibleRowCountMode);
			});
		});

		return pTestSequence;
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Large data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var oTable = that.createTable({
			bindingLength: 1000000000,
			_bVariableRowHeightEnabled: true
		});
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(VisibleRowCountMode.Fixed, iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Fixed, iBindingLength);

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oTable.setFirstVisibleRow(1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, 1, 0, "FirstVisibleRow set to 1");
			oTable.setFirstVisibleRow(500000000);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 500000000, 499706, 0, "FirstVisibleRow set to 500000000");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow, 999412, 0, "FirstVisibleRow set to Max first rendered row index");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow + 1, 999426, 150, "FirstVisibleRow set to Max first rendered row index + 1");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 2);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow + 2, 999440, that.defaultRowHeight + 150,
				"FirstVisibleRow set to Max first rendered row index + 2");
			oTable.setFirstVisibleRow(iBindingLength - 2);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 999999996, iMaxScrollTop, 655, "FirstVisibleRow set to MAX - 1");
			oTable.setFirstVisibleRow(iBindingLength - 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 999999996, iMaxScrollTop, 655, "FirstVisibleRow set to MAX");
			oTable.setFirstVisibleRow(0);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 0, 0, 0, "FirstVisibleRow set to 0");
		}).then(function() {
			return oTable.qunit.scrollVSbTo(Math.round(iMaxScrollTop / 2));
		}).then(function() {
			//  Scrolltop of iMaxScrollTop / 2 does not exactly match row 500000000 (ScrollExtensions internal float vs browsers scrolltop integer)
			that.assertPosition(assert, 500049023, Math.round(iMaxScrollTop / 2), 124,
				"Scrolled to FirstVisibleRow = 500049023 by setting ScrollTop");
			oTable.setFirstVisibleRow(500049023);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 500049023, Math.round(iMaxScrollTop / 2), 0, "FirstVisibleRow set to 500049023");
		});
	});

	QUnit.test("Scroll by setting FirstVisibleRow; Large data; Variable row heights; Auto mode", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var oTable = that.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto,
			bindingLength: 1000000000,
			_bVariableRowHeightEnabled: true
		});
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(VisibleRowCountMode.Auto, iBindingLength);
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Auto, iBindingLength);

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oTable.setFirstVisibleRow(1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, 1, 0, "FirstVisibleRow set to 1");
			oTable.setFirstVisibleRow(500000000);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 500000000, 499584, 0, "FirstVisibleRow set to 500000000");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow, 999167, 0, "FirstVisibleRow set to Max first rendered row index");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow + 1, 999177, that.defaultRowHeight, "FirstVisibleRow set to Max first rendered row index + 1");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 2);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow + 2, 999187, that.defaultRowHeight + 150,
				"FirstVisibleRow set to Max first rendered row index + 2");
			oTable.setFirstVisibleRow(iBindingLength - 2);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 999999994, iMaxScrollTop, 857, "FirstVisibleRow set to MAX - 1");
			oTable.setFirstVisibleRow(iBindingLength - 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 999999994, iMaxScrollTop, 857, "FirstVisibleRow set to MAX");
			oTable.setFirstVisibleRow(0);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 0, 0, 0, "FirstVisibleRow set to 0");
		}).then(function() {
			return oTable.qunit.scrollVSbTo(Math.round(iMaxScrollTop / 2));
		}).then(function() {
			//  Scrolltop of iMaxScrollTop / 2 does not exactly match row 500000000 (ScrollExtensions internal float vs browsers scrolltop integer)
			that.assertPosition(assert, 500049533, Math.round(iMaxScrollTop / 2), 115,
				"Scrolled to FirstVisibleRow = 500049533 by setting ScrollTop");
			oTable.setFirstVisibleRow(500049533);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 500049533, Math.round(iMaxScrollTop / 2), 0, "FirstVisibleRow set to 500049533");
		});
	});

	QUnit.test("Scroll with mouse wheel; Small data; Fixed row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable();
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(VisibleRowCountMode.Fixed);
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Fixed);

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode) {
			return function() {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 20, 0, "Scrolled 20 pixels down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 2, 2 * that.defaultRowHeight + 20, 0, "Scrolled 2 rows down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, 22, 22 * that.defaultRowHeight + 20, 0, "Scrolled 2 pages down");
		}).then(scrollWithMouseWheel(9999999, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		}).then(scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 89, 90 * that.defaultRowHeight - 20, 0, "Scrolled 20 pixels up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 87, 88 * that.defaultRowHeight - 20, 0, "Scrolled 2 rows up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, 67, 68 * that.defaultRowHeight - 20, 0, "Scrolled 2 pages up");
		}).then(scrollWithMouseWheel(-9999999, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		});
	});

	QUnit.test("Scroll with mouse wheel; Small data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			_bVariableRowHeightEnabled: true
		});
		var iMaxScrollTop = 4459;

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode) {
			return function() {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(scrollWithMouseWheel(60, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 1, that.defaultRowHeight, 0, "Scrolled 60 pixels down");
		}).then(scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 1, that.defaultRowHeight + 20, 61, "Scrolled 20 pixels down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 3, 3 * that.defaultRowHeight + 20, 61, "Scrolled 2 rows down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, 23, 23 * that.defaultRowHeight + 20, 61, "Scrolled 2 pages down");
		}).then(scrollWithMouseWheel(9999999, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 96, iMaxScrollTop, 655, "Scrolled to the bottom");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 95, iMaxScrollTop - 1, 655, "Scrolled 1 pixel up");
		}).then(scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 94, iMaxScrollTop - 21, 572, "Scrolled 20 pixels up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 89, 89 * that.defaultRowHeight, 0, "Scrolled 2 rows up");
		}).then(scrollWithMouseWheel(15, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 90, 89 * that.defaultRowHeight + 15, 153, "Scrolled 15 pixels down");
		}).then(scrollWithMouseWheel(-16, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 89, 89 * that.defaultRowHeight, 0, "Scrolled 16 pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 88, 89 * that.defaultRowHeight - 1, 48, "Scrolled 1 pixel up");
		}).then(scrollWithMouseWheel(-60, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 87, 88 * that.defaultRowHeight - 1, 147, "Scrolled 60 pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 86, 87 * that.defaultRowHeight - 1, 48, "Scrolled 1 row up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, 66, 67 * that.defaultRowHeight - 1, 48, "Scrolled 2 pages up");
		}).then(scrollWithMouseWheel(-9999999, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		});
	});

	QUnit.test("Scroll with mouse wheel; Large data; Fixed row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			bindingLength: 1000000000
		});
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(VisibleRowCountMode.Fixed, 1000000000);
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Fixed, 1000000000);
		var nPixelsPerRow = iMaxScrollTop / iMaxFirstVisibleRow;
		var nVirtualScrollRange = (iMaxFirstVisibleRow + 1) * that.defaultRowHeight;

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

		return pReady.then(scrollWithMouseWheel(that.defaultRowHeight - 1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 1, 0, "Scrolled " + (that.defaultRowHeight - 1) + " pixels down");
		}).then(scrollWithMouseWheel(1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 1, 1, 0, "Scrolled 1 pixel down");
		}).then(scrollWithMouseWheel(500000, MouseWheelDeltaMode.PIXEL)).then(function() {
			var iFirstVisibleRow = Math.round((500000 + that.defaultRowHeight) / that.defaultRowHeight);
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 500000 pixels down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)).then(function() {
			var iFirstVisibleRow = Math.round((500000 + that.defaultRowHeight) / that.defaultRowHeight) + 2;
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 rows down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)).then(function() {
			var iFirstVisibleRow = Math.round((500000 + that.defaultRowHeight) / that.defaultRowHeight) + 22;
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 pages down");
		}).then(scrollWithMouseWheel(1000000000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		}).then(scrollWithMouseWheel(-(that.defaultRowHeight - 1), MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop - 1, 0, "Scrolled " + (that.defaultRowHeight - 1) + " pixels up");
		// TODO: TDD - Make these tests pass.
		//}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)).then(function() {
		//	that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, "Scrolled 1 pixel up");
		}).then(scrollWithMouseWheel(-500000, MouseWheelDeltaMode.PIXEL)).then(function() {
			var iFirstVisibleRow = Math.round((nVirtualScrollRange - that.defaultRowHeight - 500000) / that.defaultRowHeight);
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 500000 pixels up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.LINE)).then(function() {
			var iFirstVisibleRow = Math.round((nVirtualScrollRange - that.defaultRowHeight - 500000) / that.defaultRowHeight) - 2;
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 rows up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)).then(function() {
			var iFirstVisibleRow = Math.round((nVirtualScrollRange - that.defaultRowHeight - 500000) / that.defaultRowHeight) - 22;
			var iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 pages up");
		}).then(scrollWithMouseWheel(-1000000000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		});
	});

	QUnit.test("Scroll with mouse wheel; Large data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			bindingLength: 1000000000,
			_bVariableRowHeightEnabled: true
		});
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Fixed, 1000000000);
		var iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(VisibleRowCountMode.Fixed, 1000000000);

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

		return pReady.then(scrollWithMouseWheel(that.defaultRowHeight - 1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 1, that.defaultRowHeight - 1, "Scrolled " + (that.defaultRowHeight - 1) + " pixels down");
		}).then(scrollWithMouseWheel(60, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 1, 1, 147, "Scrolled 60 pixels down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 3, 1, 147, "Scrolled 2 rows down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, 23, 1, 147, "Scrolled 2 pages down");
		}).then(scrollWithMouseWheel(1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 24, 1, 0, "Scrolled 1 pixels down");
		}).then(scrollWithMouseWheel(5000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 102064, 102, 0, "Scrolled 5000000 pixel down");
		}).then(scrollWithMouseWheel(1000000000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 999999996, iMaxScrollTop, 655, "Scrolled to the bottom");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 999999995, iMaxScrollTop - 1, 655, "Scrolled 1 pixel up");
		}).then(scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 999999994, iMaxScrollTop - 21, 572, "Scrolled 20 pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 999999991, iMaxScrollTop - 21 - that.defaultRowHeight, 199, "Scrolled 1 row up");
		}).then(scrollWithMouseWheel(1, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, 999999994, iMaxScrollTop - 21, 572, "Scrolled 1 row down");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow, 999412, 0, "Scrolled 1 page up");
		}).then(scrollWithMouseWheel(15, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow + 1, 999427, 153, "Scrolled 15 pixels down");
		}).then(scrollWithMouseWheel(-16, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow, 999412, 0, "Scrolled 16 pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow - 1, 999412, 48, "Scrolled 1 pixel up");
		}).then(scrollWithMouseWheel(-60, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow - 2, 999412, 147, "Scrolled 60 pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow - 3, 999412, 48, "Scrolled 1 row up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)).then(function() {
			that.assertPosition(assert, iMaxFirstRenderedRow - 23, 999412, 48, "Scrolled 2 pages up");
		}).then(scrollWithMouseWheel(-5000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 999897926, 999310, 48, "Scrolled 5000000 pixels up");
		}).then(scrollWithMouseWheel(-1000000000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		});
	});

	QUnit.test("Handling of mouse wheel events that do scroll", function(assert) {
		var done = assert.async();
		var that = this;
		var oTable = that.createTable({
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
						that.assertPosition(assert, 0, 20, 0, "Mouse Wheel - " + mConfig.name + ": Scrolled");
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

		var oTable = that.createTable({
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

	QUnit.test("Scroll with touch, Small data; Fixed row heights; Fixed mode", function(assert) {
		var that = this;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var oTable = that.createTable();
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(VisibleRowCountMode.Fixed);
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Fixed);
		var oEventTarget;

		function scrollWithTouch(iScrollDelta) {
			return function() {
				doTouchScrolling(oEventTarget, 0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oEventTarget = oTable.qunit.getDataCell(0, 0);
			initTouchScrolling(oEventTarget);
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
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Scroll with touch, Small data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var oTable = that.createTable({
			_bVariableRowHeightEnabled: true
		});
		var oEventTarget;

		function scrollWithTouch(iScrollDelta) {
			return function() {
				doTouchScrolling(oEventTarget, 0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oEventTarget = oTable.qunit.getDataCell(0, 0);
			initTouchScrolling(oEventTarget);
		}).then(scrollWithTouch(20)).then(function() {
			that.assertPosition(assert, 0, 20, 20, "Scrolled 20 pixels down");
		}).then(scrollWithTouch(30)).then(function() {
			that.assertPosition(assert, 1, 50, 3, "Scrolled 30 pixels down");
		}).then(scrollWithTouch(-30)).then(function() {
			that.assertPosition(assert, 0, 20, 20, "Scrolled 30 pixels up");
		}).then(scrollWithTouch(-100, true, "Scrolled to the top")).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		}).then(scrollWithTouch(4559, true, "Scrolled to the bottom")).then(function() {
			that.assertPosition(assert, 96, 4459, 655, "Scrolled to the bottom");
		}).then(scrollWithTouch(-50)).then(function() {
			that.assertPosition(assert, 93, 4429, 526, "Scrolled 30 pixels up");
		}).then(scrollWithTouch(-100)).then(function() {
			that.assertPosition(assert, 88, 4329, 17, "Scrolled 100 pixels up");
		}).then(scrollWithTouch(-50)).then(function() {
			that.assertPosition(assert, 87, 4279, 49, "Scrolled 50 pixels up");
		}).then(function() {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Scroll with touch; Large data; Fixed row heights; Fixed mode", function(assert) {
		var that = this;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var oTable = that.createTable({
			bindingLength: 1000000000
		});
		var iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(VisibleRowCountMode.Fixed, 1000000000);
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Fixed, 1000000000);
		var iRowsPerPixel = iMaxFirstVisibleRow / iMaxScrollTop;
		var oEventTarget;

		function scrollWithTouch(iScrollDelta) {
			return function() {
				doTouchScrolling(oEventTarget, 0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oEventTarget = oTable.qunit.getDataCell(0, 0);
			initTouchScrolling(oEventTarget);
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
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Scroll with touch; Large data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		var oTable = that.createTable({
			bindingLength: 1000000000,
			_bVariableRowHeightEnabled: true
		});
		var iMaxScrollTop = this.getMaxScrollTop(VisibleRowCountMode.Fixed, 1000000000);
		var oEventTarget;

		function scrollWithTouch(iScrollDelta) {
			return function() {
				doTouchScrolling(oEventTarget, 0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oEventTarget = oTable.qunit.getDataCell(0, 0);
			initTouchScrolling(oEventTarget);
		}).then(scrollWithTouch(1)).then(function() {
			that.assertPosition(assert, 1000, 1, 29, "Scrolled 1 pixel down");
		}).then(scrollWithTouch(48)).then(function() {
			that.assertPosition(assert, 49028, 49, 41, "Scrolled 48 pixels down");
		}).then(scrollWithTouch(500000)).then(function() {
			that.assertPosition(assert, 500343196, 500049, 39, "Scrolled 500000 pixels down");
		}).then(scrollWithTouch(-500050, true, "Scrolled to the top")).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		}).then(scrollWithTouch(iMaxScrollTop + 2, true, "Scrolled to the bottom")).then(function() {
			that.assertPosition(assert, 999999996, iMaxScrollTop, 655, "Scrolled to the bottom");
		}).then(scrollWithTouch(-2)).then(function() {
			that.assertPosition(assert, 999999995, iMaxScrollTop - 1, 655, "Scrolled 1 pixel up");
		}).then(scrollWithTouch(-48)).then(function() {
			that.assertPosition(assert, 999999992, iMaxScrollTop - 49, 373, "Scrolled 48 pixels up");
		}).then(scrollWithTouch(-500000)).then(function() {
			that.assertPosition(assert, 499754850, iMaxScrollTop - 500049, 42, "Scrolled 500000 pixels up");
		}).then(function() {
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

		var oTable = that.createTable({
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
				var oTouchMoveEvent = doTouchScrolling(mConfig.element, 0, 20);
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
				var iMaxScrollTop = that.getMaxScrollTop(VisibleRowCountMode.Fixed);

				function testOutsideBoundaries(iScrollDelta) {
					return new Promise(function(resolve) {
						var oTouchMoveEvent = doTouchScrolling(aTestConfigs[0].element, 0, iScrollDelta);
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
				});
			});

			pTestSequence.then(function() {
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

		var oTable = that.createTable({
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
			var oTouchMoveEvent = doTouchScrolling(mConfig.element, 0, iScrollDelta);
			var oStopPropagationSpy = sinon.spy(oTouchMoveEvent, "stopPropagation");
			var iExpectedFirstVisibleRow = mConfig.firstVisibleRow == null ? 0 : mConfig.firstVisibleRow;
			var iExpectedScrollTop = mConfig.scrollTop == null ? 0 : mConfig.scrollTop;

			// Touch move is also a swipe on touch devices. See the moveHandler method in jquery-mobile-custom.js, to know why
			// preventDefault is always called on touch devices (except in chrome on desktop).

			return new Promise(function(resolve) {
				setTimeout(function() {
					that.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollTop, 0, "Touch - " + mConfig.name + ": Not scrolled");
					if (!bOriginalTouchSupport || bOriginalTouchSupport && Device.system.desktop && Device.browser.chrome) {
						assert.ok(!oTouchMoveEvent.defaultPrevented, "Touch - " + mConfig.name + ": Default action was not prevented");
					} else {
						assert.ok(oTouchMoveEvent.defaultPrevented,
							"Touch - " + mConfig.name + ": Default action was still prevented on a touch device (swipe action)");
					}
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

			pTestSequence.then(function() {
				Device.support.pointer = bOriginalPointerSupport;
				Device.support.touch = bOriginalTouchSupport;
				done();
			});
		});
	});

	// TODO: TDD - Make these tests pass. BLI: CPOUIFTEAMB-667
	//QUnit.test("Scroll on focus; Small data; Variable row heights; Fixed mode", function(assert) {
	//	var that = this;
	//	var oTable = this.createTable({
	//		_bVariableRowHeightEnabled: true
	//	});
	//
	//	function focusCellInRow(iRowNumber) {
	//		oTable.qunit.getDataCell(iRowNumber + 1, 0).focus();
	//
	//		return function() {
	//			return Promise.race([
	//				that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished),
	//				that.oTable.qunit.whenRenderingFinished()
	//			]);
	//		};
	//	}
	//
	//	return oTable.qunit.whenInitialRenderingFinished().then(focusCellInRow(6)).then(function() {
	//		that.assertPosition(assert, 1, NaN, 58);
	//	}).then(focusCellInRow(1)).then(function() {
	//		that.assertPosition(assert, 1, that.defaultRowHeight, 0);
	//	}).then(oTable.qunit.$scrollVSbTo(550)).then(focusCellInRow(5)).then(function() {
	//		that.assertPosition(assert, 11, NaN, 58);
	//	}).then(focusCellInRow(1)).then(function() {
	//		that.assertPosition(assert, 11, 11 * that.defaultRowHeight, 0);
	//	}).then(oTable.qunit.$scrollVSbTo(4408)).then(focusCellInRow(5)).then(function() {
	//		that.assertPosition(assert, 92, NaN, 366);
	//	}).then(focusCellInRow(1)).then(function() {
	//		that.assertPosition(assert, 92, NaN, 349);
	//	}).then(oTable.qunit.$scrollVSbTo(4448)).then(focusCellInRow(5)).then(function() {
	//		that.assertPosition(assert, 96, 4459, 655);
	//	}).then(focusCellInRow(1)).then(function() {
	//		that.assertPosition(assert, 95, 4445, 597);
	//	});
	//});

	// TODO: TDD - Make these tests pass. BLI: CPOUIFTEAMB-667
	//QUnit.test("Scroll on focus; Large data; Variable row heights; Fixed mode", function(assert) {
	//	var that = this;
	//	var oTable = this.createTable({
	//		bindingLength: 1000000000,
	//		_bVariableRowHeightEnabled: true
	//	});
	//
	//	function focusCellInRow(iRowNumber) {
	//		oTable.qunit.getDataCell(iRowNumber + 1, 0).focus();
	//
	//		return function() {
	//			return Promise.race([
	//				that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished),
	//				that.oTable.qunit.whenRenderingFinished()
	//			]);
	//		};
	//	}
	//
	//	return oTable.qunit.whenInitialRenderingFinished()(focusCellInRow(6)).then(function() {
	//		that.assertPosition(assert, 1, 1, 58);
	//	}).then(focusCellInRow(1)).then(function() {
	//		that.assertPosition(assert, 1, 1, 0);
	//	}).then(oTable.qunit.$scrollVSbTo(550)).then(focusCellInRow(5)).then(function() {
	//		that.assertPosition(assert, 550323, NaN, 107);
	//	}).then(focusCellInRow(1)).then(function() {
	//		that.assertPosition(assert, 550323, NaN, 0);
	//	}).then(oTable.qunit.$scrollVSbTo(999460)).then(focusCellInRow(5)).then(function() {
	//		that.assertPosition(assert, 999999993, NaN, 456);
	//	}).then(focusCellInRow(1)).then(function() {
	//		that.assertPosition(assert, 999999993, NaN, 398);
	//	}).then(oTable.qunit.$scrollVSbTo(999490)).then(focusCellInRow(5)).then(function() {
	//		that.assertPosition(assert, 999999996, 999510, 655);
	//	}).then(focusCellInRow(1)).then(function() {
	//		that.assertPosition(assert, 999999995, 999496, 597);
	//	});
	//});

	QUnit.test("Restore scroll position after setting ScrollTop; Tiny data; Variable row heights; Fixed mode", function(assert) {
		var that = this;

		function test(mConfig) {
			var oTable = that.createTable({
				bindingLength: 11,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			}).then(function() {
				return that.testRestoration(assert, mConfig.title);
			});
		}

		return test({
			title: "ScrollTop = 1",
			scrollTop: 1
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

	QUnit.test("Restore scroll position after setting ScrollTop; Small data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			}).then(function() {
				return that.testRestoration(assert, mConfig.visibleRowCountMode + " mode, " + mConfig.title);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "ScrollTop = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "ScrollTop = 123",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 123
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 9999999
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX - 1",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: that.getMaxScrollTop(sVisibleRowCountMode) - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting ScrollTop; Small data; Variable row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			}).then(function() {
				return that.testRestoration(assert, mConfig.visibleRowCountMode + " mode, " + mConfig.title);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "ScrollTop = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "ScrollTop = 123",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 123
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 9999999
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX - 1",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: that.getMaxScrollTop(sVisibleRowCountMode) - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting ScrollTop; Large data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode,
				bindingLength: 1000000000
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			}).then(function() {
				return that.testRestoration(assert, mConfig.visibleRowCountMode + " mode, " + mConfig.title);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "ScrollTop = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "ScrollTop = 500000",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 500000
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 9999999
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX - 1",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: that.getMaxScrollTop(sVisibleRowCountMode, 1000000000) - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting ScrollTop; Large data; Variable row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				return oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			}).then(function() {
				return that.testRestoration(assert, mConfig.visibleRowCountMode + " mode, " + mConfig.title);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "ScrollTop = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 1
				});
			}).then(function() {
				return test({
					title: "ScrollTop = 500000",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 500000
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: 9999999
				});
			}).then(function() {
				return test({
					title: "ScrollTop = MAX - 1",
					visibleRowCountMode: sVisibleRowCountMode,
					scrollTop: that.getMaxScrollTop(sVisibleRowCountMode, 1000000000) - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Tiny data; Variable row heights; Fixed mode", function(assert) {
		var that = this;

		function test(mConfig) {
			var oTable = that.createTable({
				bindingLength: 11,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}).then(function() {
				return that.testRestoration(assert, mConfig.title);
			});
		}

		return test({
			title: "FirstVisibleRow = 1",
			firstVisibleRow: 1
		}).then(function() {
			return test({
				title: "FirstVisibleRow = 3",
				firstVisibleRow: 3
			});
		}).then(function() {
			return test({
				title: "FirstVisibleRow = MAX",
				firstVisibleRow: 7
			});
		});
	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Small data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				return that.testRestoration(assert, mConfig.visibleRowCountMode + " mode, " + mConfig.title);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 33",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 33
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: that.mDefaultOptions.bindingLength
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX - 1",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: that.getMaxFirstVisibleRow(sVisibleRowCountMode) - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Small data; Variable row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				return that.testRestoration(assert, mConfig.visibleRowCountMode + " mode, " + mConfig.title);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 33",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 33
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: that.mDefaultOptions.bindingLength
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX - 1",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: that.getMaxFirstVisibleRow(sVisibleRowCountMode) - 1
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Large data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode,
				bindingLength: 1000000000
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				return that.testRestoration(assert, mConfig.visibleRowCountMode + " mode, " + mConfig.title);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 500000000",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 500000000
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 1000000000
				});
			}).then(function() {
				// TODO: TDD - Make these tests pass.
				//return test({
				//	title: "FirstVisibleRow = MAX - 1",
				//	visibleRowCountMode: sVisibleRowCountMode,
				//	firstVisibleRow: that.getMaxFirstVisibleRow(sVisibleRowCountMode, 1000000000) - 1
				//});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Large data; Variable row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();

		function test(mConfig) {
			var oTable = that.createTable({
				visibleRowCountMode: mConfig.visibleRowCountMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				return that.testRestoration(assert, mConfig.visibleRowCountMode + " mode, " + mConfig.title);
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 1",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 1
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 500000000",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 500000000
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					visibleRowCountMode: sVisibleRowCountMode,
					firstVisibleRow: 1000000000
				});
			}).then(function() {
				// TODO: TDD - Make these tests pass.
				//return test({
				//	title: "FirstVisibleRow = MAX - 1",
				//	visibleRowCountMode: sVisibleRowCountMode,
				//	firstVisibleRow: that.getMaxFirstVisibleRow(sVisibleRowCountMode, 1000000000) - 1
				//});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after changing VisibleRowCount; Tiny data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			bindingLength: 10,
			_bVariableRowHeightEnabled: true
		});
		var iFirstVisibleRow;
		var iScrollPosition;
		var iInnerScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			oTable.setVisibleRowCount(9);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				"ScrollTop = 50; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			oTable.setVisibleRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				"ScrollTop = 50; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			oTable.setVisibleRowCount(9);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition + that.defaultRowHeight,
				"ScrollTop = MAX; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			oTable.setVisibleRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition - that.defaultRowHeight,
				"ScrollTop = MAX; After visible row count increased");
		});
	});

	QUnit.test("Restore scroll position after changing VisibleRowCount; Small data; Fixed row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable();
		var iFirstVisibleRow;
		var iScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			oTable.setVisibleRowCount(9);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 50; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			oTable.setVisibleRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 50; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			oTable.setVisibleRowCount(9);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = MAX; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			oTable.setVisibleRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.defaultRowHeight, 0,
				"ScrollTop = MAX; After visible row count increased");
		});
	});

	QUnit.test("Restore scroll position after changing VisibleRowCount; Small data; Fixed row heights; Auto mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto
		});
		var iFirstVisibleRow;
		var iScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {

		// TODO: TDD - Remove these tests after enabling the below commented out tests.
		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeAutoRowCount--;
		}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After visible row count decreased");
		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeAutoRowCount++;
		}).then(oTable.qunit.resetSize).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After visible row count increased");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	that.fakeAutoRowCount--;
		//}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 50; After visible row count decreased");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	that.fakeAutoRowCount++;
		//}).then(oTable.qunit.resetSize).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 50; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			that.fakeAutoRowCount--;
		}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = MAX; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			that.fakeAutoRowCount++;
		}).then(oTable.qunit.resetSize).then(function() {
			that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.defaultRowHeight, 0,
				"ScrollTop = MAX; After visible row count increased");
		});
	});

	QUnit.test("Restore scroll position after changing VisibleRowCount; Small data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			_bVariableRowHeightEnabled: true
		});
		var iFirstVisibleRow;
		var iScrollPosition;
		var iInnerScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			oTable.setVisibleRowCount(9);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				"ScrollTop = 50; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			oTable.setVisibleRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				"ScrollTop = 50; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			oTable.setVisibleRowCount(9);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			// TODO: TDD - Make these tests pass.
			//that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
			//	"ScrollTop = MAX; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			oTable.setVisibleRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition - that.defaultRowHeight, 655,
				"ScrollTop = MAX; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			oTable.setVisibleRowCount(30);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 86, iScrollPosition - that.defaultRowHeight * 20, 1665,
				"ScrollTop = MAX; After visible row count increased");
		});
	});

	QUnit.test("Restore scroll position after changing VisibleRowCount; Small data; Variable row heights; Auto mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto,
			_bVariableRowHeightEnabled: true
		});
		var iFirstVisibleRow;
		var iScrollPosition;
		//var iInnerScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {

		// TODO: TDD - Remove these tests after enabling the below commented out tests.
		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeAutoRowCount--;
		}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After visible row count decreased");
		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeAutoRowCount++;
		}).then(oTable.qunit.resetSize).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After visible row count increased");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeAutoRowCount--;
		//}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After visible row count decreased");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeAutoRowCount++;
		//}).then(oTable.qunit.resetSize).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			//iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.fakeAutoRowCount--;
		}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
			// TODO: TDD - Make these tests pass.
			//that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
			//	"ScrollTop = MAX; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			that.fakeAutoRowCount++;
		}).then(oTable.qunit.resetSize).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition - that.defaultRowHeight, 857,
				"ScrollTop = MAX; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			that.fakeAutoRowCount += 20;
		}).then(oTable.qunit.$resize({height: "1050px"})).then(function() {
			that.assertPosition(assert, 84, iScrollPosition - that.defaultRowHeight * 20, 1867,
				"ScrollTop = MAX; After visible row count increased");

			that.fakeAutoRowCount -= 20;
		}).then(oTable.qunit.resetSize);
	});

	QUnit.test("Restore scroll position after changing VisibleRowCount; Large data; Fixed row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			bindingLength: 1000000000
		});
		var iFirstVisibleRow;
		//var iScrollPosition;
		var iMaxScrollTop = that.getMaxScrollTop(VisibleRowCountMode.Fixed, 1000000000);

		return oTable.qunit.whenInitialRenderingFinished().then(function() {

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	oTable.setVisibleRowCount(9);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, 0, "ScrollTop = 50; After visible row count decreased");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	oTable.setVisibleRowCount(10);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, 0, "ScrollTop = 50; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			//iFirstVisibleRow = oTable.getFirstVisibleRow();
			//iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			oTable.setVisibleRowCount(9);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			//that.assertPosition(assert, iFirstVisibleRow, iScrollPosition - 1, 0, "ScrollTop = MAX; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			oTable.setVisibleRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow - 1, iMaxScrollTop, 0, "ScrollTop = MAX; After visible row count increased");
		});
	});

	QUnit.test("Restore scroll position after changing VisibleRowCount; Large data; Fixed row heights; Auto mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto,
			bindingLength: 1000000000
		});
		var iFirstVisibleRow;
		var iScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			that.fakeAutoRowCount--;
		}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 50; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			that.fakeAutoRowCount++;
		}).then(oTable.qunit.resetSize).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 50; After visible row count increased");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	that.fakeAutoRowCount--;
		//}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = MAX; After visible row count decreased");
		//
		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	that.fakeAutoRowCount++;
		//}).then(oTable.qunit.resetSize).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = MAX; After visible row count increased");
		});
	});

	QUnit.test("Restore scroll position after changing VisibleRowCount; Large data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			bindingLength: 1000000000,
			_bVariableRowHeightEnabled: true
		});
		var iFirstVisibleRow;
		//var iInnerScrollPosition;
		var iMaxScrollTop = that.getMaxScrollTop(VisibleRowCountMode.Fixed, 1000000000);

		return oTable.qunit.whenInitialRenderingFinished().then(function() {

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	oTable.setVisibleRowCount(9);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, iInnerScrollPosition,
		//		"ScrollTop = 50; After visible row count decreased");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	oTable.setVisibleRowCount(10);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, iInnerScrollPosition,
		//		"ScrollTop = 50; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			//iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			oTable.setVisibleRowCount(9);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			// TODO: TDD - Make these tests pass.
			//that.assertPosition(assert, iFirstVisibleRow, iMaxScrollTop - 1, iInnerScrollPosition,
			//	"ScrollTop = MAX; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			oTable.setVisibleRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iMaxScrollTop, 655,
				"ScrollTop = MAX; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			oTable.setVisibleRowCount(30);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 999999986, 998530, 1665, "ScrollTop = MAX; After visible row count increased");
		});
	});

	QUnit.test("Restore scroll position after changing VisibleRowCount; Large data; Variable row heights; Auto mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto,
			bindingLength: 1000000000,
			_bVariableRowHeightEnabled: true
		});
		var iFirstVisibleRow;
		var iScrollPosition;
		//var iInnerScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {

		// TODO: TDD - Remove these tests after enabling the below commented out tests.
		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			that.fakeAutoRowCount--;
		}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 50; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			that.fakeAutoRowCount++;
		}).then(oTable.qunit.resetSize).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 50; After visible row count increased");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeAutoRowCount--;
		//}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After visible row count decreased");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeAutoRowCount++;
		//}).then(oTable.qunit.resetSize).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			//iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.fakeAutoRowCount--;
		}).then(oTable.qunit.$resize({height: "950px"})).then(function() {
			// TODO: TDD - Make these tests pass.
			//that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
			//	"ScrollTop = MAX; After visible row count decreased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			that.fakeAutoRowCount++;
		}).then(oTable.qunit.resetSize).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition - that.defaultRowHeight, 857,
				"ScrollTop = MAX; After visible row count increased");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			that.fakeAutoRowCount += 20;
		}).then(oTable.qunit.$resize({height: "1050px"})).then(function() {
			that.assertPosition(assert, 999999984, iScrollPosition - that.defaultRowHeight * 20, 1867,
				"ScrollTop = MAX; After visible row count increased");

			that.fakeAutoRowCount -= 20;
		}).then(oTable.qunit.resetSize);
	});

	QUnit.test("Restore scroll position after binding length change; Tiny data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			bindingLength: 11,
			_bVariableRowHeightEnabled: true
		});
		var iFirstVisibleRow;
		var iScrollPosition;
		var iInnerScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {

		// TODO: TDD - Remove these tests after enabling the below commented out tests.
		}).then(oTable.qunit.$scrollVSbTo(40)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.changeBindingLength(10, ChangeReason.Collapse);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 2, 33, 199, "ScrollTop = 40; After binding length decreased (collapse)");

		}).then(oTable.qunit.$scrollVSbTo(40)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.changeBindingLength(11, ChangeReason.Expand);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 2, 33, 199,	"ScrollTop = 40; After binding length increased (expand)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(40)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(10, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 40; After binding length decreased (collapse)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(40)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(11, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 40; After binding length increased (expand)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(40)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 40; After binding length increased (refresh)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(40)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 40; After binding length increased (refresh)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.changeBindingLength(10, ChangeReason.Collapse);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition - that.defaultRowHeight,
				"ScrollTop = MAX; After binding length decreased (collapse)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(11, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = MAX; After binding length increased (expand)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(10);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition,  iInnerScrollPosition - that.defaultRowHeight,
		//		"ScrollTop = MAX; After binding length decreased (refresh)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(11);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = MAX; After binding length increased (refresh)");
		//
		//}).then(function() {
		//	that.changeBindingLength(0, ChangeReason.Change);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, 0, 0, 0, "After binding length changed to 0");
		});
	});

	QUnit.test("Restore scroll position after binding length change; Small data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iFirstVisibleRow;
		var iScrollPosition;

		function test(sVisibleRowCountMode) {
			var oTable = that.createTable({
				visibleRowCountMode: sVisibleRowCountMode
			});

			return oTable.qunit.whenInitialRenderingFinished().then(function() {

			// TODO: TDD - Remove these tests after enabling the below commented out tests.
			}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 1, 49, 0,
					sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 1, 49, 0,
					sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length increased (expand)");

			}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 1, 49, 0,
					sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 1, 49, 0,
					sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length increased (refresh)");

			// TODO: TDD - Make these tests pass.
			//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			//	iFirstVisibleRow = oTable.getFirstVisibleRow();
			//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			//	that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
			//}).then(oTable.qunit.whenRenderingFinished).then(function() {
			//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
			//		sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length decreased (collapse)");
			//
			//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			//	iFirstVisibleRow = oTable.getFirstVisibleRow();
			//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			//	that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
			//}).then(oTable.qunit.whenRenderingFinished).then(function() {
			//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
			//		sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length increased (expand)");
			//
			//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			//	iFirstVisibleRow = oTable.getFirstVisibleRow();
			//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
			//}).then(oTable.qunit.whenRenderingFinished).then(function() {
			//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
			//		sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length increased (refresh)");
			//
			//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			//	iFirstVisibleRow = oTable.getFirstVisibleRow();
			//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			//}).then(oTable.qunit.whenRenderingFinished).then(function() {
			//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
			//		sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.defaultRowHeight, 0,
					sVisibleRowCountMode + " mode, ScrollTop = MAX; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sVisibleRowCountMode + " mode, ScrollTop = MAX; After binding length increased (expand)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.defaultRowHeight, 0,
					sVisibleRowCountMode + " mode, ScrollTop = MAX; After binding length decreased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sVisibleRowCountMode + " mode, ScrollTop = MAX; After binding length increased (refresh)");
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test(sVisibleRowCountMode);
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after binding length change; Small data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			_bVariableRowHeightEnabled: true
		});
		var iFirstVisibleRow;
		var iScrollPosition;
		var iInnerScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
		// TODO: TDD - Remove these tests after enabling the below commented out tests.
		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After binding length decreased (collapse)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After binding length increased (expand)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After binding length increased (refresh)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After binding length increased (refresh)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length decreased (collapse)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (expand)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (refresh)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (refresh)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - that.defaultRowHeight,
				iInnerScrollPosition - 150 + that.defaultRowHeight, "ScrollTop = MAX; After binding length decreased (collapse)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, 4431, 548, "ScrollTop = MAX; After binding length increased (expand)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(4438)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(that.mDefaultOptions.bindingLength + 1, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, iInnerScrollPosition - 150,
		//		"ScrollTop = In buffer; After visible row count increased (expand)");
		//
		//	that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = In buffer; After visible row count decreased (collapse)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - that.defaultRowHeight,
				iInnerScrollPosition - 150 + that.defaultRowHeight, "ScrollTop = MAX; After binding length decreased (refresh)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, 4431, 548, "ScrollTop = MAX; After binding length increased (refresh)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(4438)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength + 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, iInnerScrollPosition - 150,
		//		"ScrollTop = In buffer; After visible row count increased (refresh)");
		//
		//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = In buffer; After visible row count decreased (refresh)");
		});
	});

	QUnit.test("Restore scroll position after binding length change; Small data; Variable row heights; Auto mode", function(assert) {
		var that = this;
		var oTable = that.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto,
			_bVariableRowHeightEnabled: true
		});
		var iFirstVisibleRow;
		var iScrollPosition;
		var iInnerScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {

		// TODO: TDD - Remove these tests after enabling the below commented out tests.
		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After binding length decreased (collapse)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After binding length increased (expand)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After binding length increased (refresh)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, 49, 0, "ScrollTop = 50; After binding length increased (refresh)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length decreased (collapse)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (expand)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (refresh)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (refresh)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.changeBindingLength(that.mDefaultOptions.bindingLength - 1, ChangeReason.Collapse);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - that.defaultRowHeight, iInnerScrollPosition,
				"ScrollTop = MAX; After binding length decreased (collapse)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Expand);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, 4194, 796, "ScrollTop = MAX; After binding length increased (expand)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(4199)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(that.mDefaultOptions.bindingLength + 1, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, iInnerScrollPosition - that.defaultRowHeight,
		//		"ScrollTop = In buffer; After visible row count increased (expand)");
		//
		//	that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = In buffer; After visible row count decreased (collapse)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength - 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - that.defaultRowHeight, iInnerScrollPosition,
				"ScrollTop = MAX; After binding length decreased (refresh)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, 4194, 796, "ScrollTop = MAX; After binding length increased (refresh)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(4199)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(that.mDefaultOptions.bindingLength + 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, iInnerScrollPosition - that.defaultRowHeight,
		//		"ScrollTop = In buffer; After visible row count increased (refresh)");
		//
		//	that.changeBindingLength(that.mDefaultOptions.bindingLength, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = In buffer; After visible row count decreased (collapse)");
		});
	});

	QUnit.test("Restore scroll position after binding length change; Large data; Fixed row heights; Fixed & Auto mode", function(assert) {
		var that = this;
		var pTestSequence = Promise.resolve();
		var iBindingLength = 1000000000;
		var iFirstVisibleRow;
		var iScrollPosition;

		function test(sVisibleRowCountMode) {
			var oTable = that.createTable({
				visibleRowCountMode: sVisibleRowCountMode,
				bindingLength: iBindingLength
			});

			return oTable.qunit.whenInitialRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				that.changeBindingLength(iBindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length increased (expand)");

			}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				that.fakeODataBindingRefresh(iBindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				that.fakeODataBindingRefresh(iBindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sVisibleRowCountMode + " mode, ScrollTop = 50; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition, 0,
					sVisibleRowCountMode + " mode, ScrollTop = MAX; After binding length decreased (collapse)");

			// TODO: TDD - Make these tests pass.
			//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			//	iFirstVisibleRow = oTable.getFirstVisibleRow();
			//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			//	that.changeBindingLength(iBindingLength, ChangeReason.Expand);
			//}).then(oTable.qunit.whenRenderingFinished).then(function() {
			//	that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - 1, 0,
			//		sVisibleRowCountMode + " mode, ScrollTop = MAX; After binding length increased (expand)");
			//
			//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			//	iFirstVisibleRow = oTable.getFirstVisibleRow();
			//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			//	that.fakeODataBindingRefresh(iBindingLength - 1);
			//}).then(oTable.qunit.whenRenderingFinished).then(function() {
			//	that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition, 0,
			//		sVisibleRowCountMode + " mode, ScrollTop = MAX; After binding length decreased (refresh)");
			//
			//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			//	iFirstVisibleRow = oTable.getFirstVisibleRow();
			//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			//	that.fakeODataBindingRefresh(iBindingLength);
			//}).then(oTable.qunit.whenRenderingFinished).then(function() {
			//	that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - 1, 0,
			//		sVisibleRowCountMode + " mode, ScrollTop = MAX; After binding length increased (refresh)");
			});
		}

		this.aTestedVisibleRowCountModes.forEach(function(sVisibleRowCountMode) {
			pTestSequence = pTestSequence.then(function() {
				return test(sVisibleRowCountMode);
			});
		});

		return pTestSequence;
	});

	QUnit.test("Restore scroll position after binding length change; Large data; Variable row heights; Fixed mode", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var oTable = that.createTable({
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});
		var iFirstVisibleRow;
		var iScrollPosition;
		var iInnerScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {

		// TODO: TDD - Remove these tests after enabling the below commented out tests.
		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 50029, 50, 0, "ScrollTop = 50; After binding length decreased (collapse)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.changeBindingLength(iBindingLength, ChangeReason.Expand);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 50029, 50, 0, "ScrollTop = 50; After binding length increased (expand)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeODataBindingRefresh(iBindingLength - 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 50029, 50, 0, "ScrollTop = 50; After binding length increased (refresh)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeODataBindingRefresh(iBindingLength);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 50029, 50, 0, "ScrollTop = 50; After binding length increased (refresh)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length decreased (collapse)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(iBindingLength, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (expand)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(iBindingLength - 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (refresh)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(iBindingLength);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (refresh)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition, iInnerScrollPosition - 150 + that.defaultRowHeight,
				"ScrollTop = MAX; After binding length decreased (collapse)");

		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			that.changeBindingLength(iBindingLength, ChangeReason.Expand);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, 999482, 548, "ScrollTop = MAX; After binding length increased (expand)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(4438)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(iBindingLength + 1, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, iInnerScrollPosition - 150,
		//		"ScrollTop = In buffer; After visible row count increased (expand)");
		//
		//	that.changeBindingLength(iBindingLength, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = In buffer; After visible row count decreased (collapse)");

		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(iBindingLength - 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition, iInnerScrollPosition - 150 + that.defaultRowHeight,
		//		"ScrollTop = MAX; After binding length decreased (refresh)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(iBindingLength);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, 999482, 548, "ScrollTop = MAX; After binding length increased (refresh)");

		//}).then(oTable.qunit.$scrollVSbTo(4438)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(iBindingLength + 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, iInnerScrollPosition - 150,
		//		"ScrollTop = In buffer; After visible row count increased (refresh)");
		//
		//	that.changeBindingLength(iBindingLength, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = In buffer; After visible row count decreased (collapse)");
		});
	});

	QUnit.test("Restore scroll position after binding length change; Large data; Variable row heights; Auto mode", function(assert) {
		var that = this;
		var iBindingLength = 1000000000;
		var oTable = that.createTable({
			visibleRowCountMode: VisibleRowCountMode.Auto,
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});
		//var iFirstVisibleRow;
		//var iScrollPosition;
		//var iInnerScrollPosition;

		return oTable.qunit.whenInitialRenderingFinished().then(function() {

		// TODO: TDD - Remove these tests after enabling the below commented out tests.
		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 50041, 50, 0, "ScrollTop = 50; After binding length decreased (collapse)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.changeBindingLength(iBindingLength, ChangeReason.Expand);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 50041, 50, 0, "ScrollTop = 50; After binding length increased (expand)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeODataBindingRefresh(iBindingLength - 1);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 50041, 50, 0, "ScrollTop = 50; After binding length increased (refresh)");

		}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
			that.fakeODataBindingRefresh(iBindingLength);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 50041, 50, 0, "ScrollTop = 50; After binding length increased (refresh)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length decreased (collapse)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(iBindingLength, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (expand)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(iBindingLength - 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (refresh)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(50)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(iBindingLength);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = 50; After binding length increased (refresh)");

		// TODO: TDD - Make these tests pass.
		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = MAX; After binding length decreased (collapse)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(iBindingLength, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, NaN, "ScrollTop = MAX; After binding length increased (expand)");

		//}).then(oTable.qunit.$scrollVSbTo(4438)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.changeBindingLength(iBindingLength + 1, ChangeReason.Expand);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, iInnerScrollPosition - 150,
		//		"ScrollTop = In buffer; After visible row count increased (expand)");
		//
		//	that.changeBindingLength(iBindingLength, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = In buffer; After visible row count decreased (collapse)");

		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(iBindingLength - 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition, iInnerScrollPosition - 150 + that.defaultRowHeight,
		//		"ScrollTop = MAX; After binding length decreased (refresh)");
		//
		//}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(iBindingLength);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, NaN, "ScrollTop = MAX; After binding length increased (refresh)");

		//}).then(oTable.qunit.$scrollVSbTo(4438)).then(function() {
		//	iFirstVisibleRow = oTable.getFirstVisibleRow();
		//	iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		//	iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
		//	that.fakeODataBindingRefresh(iBindingLength + 1);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, NaN, iInnerScrollPosition - 150,
		//		"ScrollTop = In buffer; After visible row count increased (refresh)");
		//
		//	that.changeBindingLength(iBindingLength, ChangeReason.Collapse);
		//}).then(oTable.qunit.whenRenderingFinished).then(function() {
		//	that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
		//		"ScrollTop = In buffer; After visible row count decreased (collapse)");
		});
	});

	QUnit.test("The table's DOM is removed without notifying the table", function(assert) {
		var that = this;
		var oTable = that.createTable();
		var oScrollExtension = oTable._getScrollExtension();
		var oTableElement;
		var oTableParentElement;

		oScrollExtension._debug();

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oTableElement = oTable.getDomRef();
			oTableParentElement = oTableElement.parentNode;
			oTable.setFirstVisibleRow(5);
			oTableParentElement.removeChild(oTableElement);

		}).then(TableQUnitUtils.$wait()).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 5,
				"Remove DOM synchronously after setting firstVisibleRow: The firstVisibleRow is correct");
			assert.strictEqual(oScrollExtension._VerticalScrollingHelper.getScrollPosition(oTable), 5 * that.defaultRowHeight,
				"Remove DOM synchronously after setting firstVisibleRow: ScrollTop is correct");

			oTable.setFirstVisibleRow(6);

		}).then(TableQUnitUtils.$wait()).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 6,
				"Set firstVisibleRow if DOM is removed: The firstVisibleRow is correct");
			assert.strictEqual(oScrollExtension._VerticalScrollingHelper.getScrollPosition(oTable), 6 * that.defaultRowHeight,
				"Set firstVisibleRow if DOM is removed: The vertical scroll position is correct");

		}).then(function() {
			oTableParentElement.appendChild(oTableElement);
			oTable.setFirstVisibleRow(5);
		}).then(TableQUnitUtils.$wait()).then(function() {
			oTableParentElement.removeChild(oTableElement);

		}).then(TableQUnitUtils.$wait()).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 5,
				"Remove DOM asynchronously after setting firstVisibleRow: The firstVisibleRow is correct");
			assert.strictEqual(oScrollExtension._VerticalScrollingHelper.getScrollPosition(oTable), 5 * that.defaultRowHeight,
				"Remove DOM asynchronously after setting firstVisibleRow: ScrollTop is correct");

		}).then(function() {
			oTableParentElement.appendChild(oTableElement);
			oScrollExtension.getVerticalScrollbar().scrollTop = 100;
			oTableParentElement.removeChild(oTableElement);

		}).then(TableQUnitUtils.$wait()).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 5,
				"Remove DOM synchronously after scrolling with scrollbar: The firstVisibleRow is correct");
			assert.strictEqual(oScrollExtension._VerticalScrollingHelper.getScrollPosition(oTable), 5 * that.defaultRowHeight,
				"Remove DOM synchronously after scrolling with scrollbar: The vertical scroll position is correct");

		}).then(function() {
			oTableParentElement.appendChild(oTableElement);
			oScrollExtension.getVerticalScrollbar().scrollTop = 100;
			return oTable.qunit.whenVSbScrolled();

		}).then(function() {
			oTableParentElement.removeChild(oTableElement);

		}).then(TableQUnitUtils.$wait()).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 2,
				"Remove DOM asynchronously after scrolling with scrollbar: The firstVisibleRow is correct");
			assert.strictEqual(oScrollExtension._VerticalScrollingHelper.getScrollPosition(oTable), 100,
				"Remove DOM asynchronously after scrolling with scrollbar: The vertical scroll position is correct");

		}).then(function() {
			oTableParentElement.appendChild(oTableElement);
			oTable._setLargeDataScrolling(true);
			oScrollExtension.getVerticalScrollbar().scrollTop = 200;
			return oTable.qunit.whenVSbScrolled();

		}).then(function() {
			oTableParentElement.removeChild(oTableElement);

		}).then(TableQUnitUtils.$wait(300)).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 4,
				"Remove DOM asynchronously after scrolling with scrollbar and large data scrolling enabled: The firstVisibleRow is correct");
			assert.strictEqual(oScrollExtension._VerticalScrollingHelper.getScrollPosition(oTable), 200,
				"Remove DOM asynchronously after scrolling with scrollbar and large data scrolling enabled: The vertical scroll position is correct");
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

		function changeRTL(bRTL) {
			return new Promise(function(resolve) {
				sap.ui.getCore().getConfiguration().setRTL(bRTL);
				sap.ui.getCore().applyChanges();
				// Give the text direction change enough time, otherwise the UI might not be ready when the tests start.
				// BCP: 1870395335
				setTimeout(resolve, 500);
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
		doTouchScrolling(oTargetElement, 150);

		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled horizontally -> Table is in Navigation Mode again");
		assert.strictEqual(document.activeElement, getCell(0, 0)[0], "Cell has focus now");

		// Vertical
		oTable.getRows()[0].getCells()[0].focus();
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		oTargetElement = oTable.getDomRef("tableCCnt");
		initTouchScrolling(oTargetElement, 200);
		doTouchScrolling(oTargetElement, undefined, 150);

		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled Vertically -> Table is in Navigation Mode again");
		assert.strictEqual(document.activeElement, getCell(0, 0)[0], "Cell has focus now");

		Device.support.pointer = bOriginalPointerSupport;
		Device.support.touch = bOriginalTouchSupport;
	});
});