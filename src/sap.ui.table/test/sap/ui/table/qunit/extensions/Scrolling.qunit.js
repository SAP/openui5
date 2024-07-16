/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Type",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/rowmodes/Auto",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/TableRenderer",
	"sap/ui/table/library",
	"sap/m/TextArea",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Context",
	"sap/ui/model/ChangeReason"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	Column,
	RowModeType,
	FixedRowMode,
	AutoRowMode,
	TableUtils,
	TableRenderer,
	library,
	TextArea,
	Device,
	Control,
	JSONModel,
	Context,
	ChangeReason
) {
	"use strict";

	const HeightControl = TableQUnitUtils.HeightTestControl;
	const MouseWheelDeltaMode = {
		PIXEL: 0,
		LINE: 1,
		PAGE: 2
	};

	QUnit.module("Lifecycle", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oExtension = this.oTable._getScrollExtension();
		assert.ok(oExtension, "Extension available in table");
	});

	QUnit.test("Destruction", function(assert) {
		const oExtension = this.oTable._getScrollExtension();

		this.oTable.destroy();
		assert.ok(!oExtension.getTable(), "Reference to table removed");
	});

	QUnit.module("Scrollbars", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				width: "500px",
				columns: [TableQUnitUtils.createTextColumn().setWidth("800px")],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(6),
				rowMode: new FixedRowMode({
					rowCount: 1
				})
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Horizontal scrollbar visibility", async function(assert) {
		const oTable = this.oTable;
		const oScrollExtension = oTable._getScrollExtension();
		const oHSb = oScrollExtension.getHorizontalScrollbar();
		const oModel = oTable.getModel();

		assert.ok(oHSb.offsetWidth > 0 && oHSb.offsetHeight > 0, "Table content does not fit: Horizontal scrollbar is visible");

		oTable.getColumns()[0].setWidth("10px");
		await oTable.qunit.whenRenderingFinished();
		assert.ok(oHSb.offsetWidth === 0 && oHSb.offsetHeight === 0, "Table content does fit: Horizontal scrollbar is not visible");

		oTable.setSelectionMode(library.SelectionMode.None);
		oTable.getRowMode().setRowCount(6);
		oTable.getColumns()[0].setWidth("495px");
		await oTable.qunit.whenRenderingFinished();
		oModel.oData.push({});
		oModel.refresh();
		await oTable.qunit.whenRenderingFinished();
		assert.ok(oHSb.offsetWidth > 0 && oHSb.offsetHeight > 0,
			"Increase binding length so that vertical scrollbar appears: Horizontal scrollbar is visible");

		oTable.setRowMode(RowModeType.Auto);
		await oTable.qunit.whenRenderingFinished();
		await oTable.qunit.$resize({height: "400px"});
		assert.ok(oHSb.offsetWidth > 0 && oHSb.offsetHeight > 0,
			"Decrease visible rows so that vertical scrollbar appears: Horizontal scrollbar is visible");
		await oTable.qunit.resetSize();
	});

	// Test fails in Safari, skip until fixed
	QUnit[Device.browser.safari ? "skip" : "test"]("Horizontal scrollbar position", async function(assert) {
		const oTable = this.oTable;
		const oScrollExtension = oTable._getScrollExtension();
		const oHSb = oScrollExtension.getHorizontalScrollbar();
		const oHSbContent = oTable.getDomRef("hsb-content");
		const oHSbComputedStyle = window.getComputedStyle(oHSb);
		const oHSbContentComputedStyle = window.getComputedStyle(oHSbContent);

		oTable.invalidate();
		await oTable.qunit.whenRenderingFinished();

		assert.strictEqual(oHSbComputedStyle.marginLeft, "48px", "Left margin");
		assert.strictEqual(oHSbComputedStyle.marginRight, "17px", "Right margin");
		assert.strictEqual(oHSbContentComputedStyle.width, "800px", "Scroll range");

		oTable.getColumns()[0].setWidth("10px");
		await oTable.qunit.whenRenderingFinished();

		assert.strictEqual(oHSb.style.marginLeft, "", "Scrollbar hidden: Left margin");
		assert.strictEqual(oHSb.style.marginRight, "", "Scrollbar hidden: Right margin");
		assert.strictEqual(oHSbContent.style.width, "", "Scrollbar hidden: Scroll range");

		oTable.getColumns()[0].setWidth("500px");
		oTable.insertColumn(TableQUnitUtils.createTextColumn().setWidth("40px"), 0);
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(2);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		await oTable.qunit.whenRenderingFinished();

		assert.strictEqual(oHSbComputedStyle.marginLeft, "88px", "Fixed columns and row actions: Left margin");
		assert.strictEqual(oHSbComputedStyle.marginRight, "91px", "Fixed columns and row actions: Right margin");
		assert.strictEqual(oHSbContentComputedStyle.width, "500px", "Fixed columns and row actions: Scroll range");
	});

	QUnit.test("Vertical scrollbar visibility", function(assert) {
		const oTable = this.oTable;
		const oScrollExtension = oTable._getScrollExtension();
		let oVSb = oScrollExtension.getVerticalScrollbar();
		const iOriginalApiVersion = TableRenderer.apiVersion;

		assert.ok(oVSb.offsetWidth > 0 && oVSb.offsetHeight > 0, "Table content does not fit height -> Vertical scrollbar is visible");

		oTable.getRowMode().setRowCount(6);

		return oTable.qunit.whenRenderingFinished().then(function() {
			oVSb = oScrollExtension.getVerticalScrollbar();
			assert.ok(oVSb.offsetWidth === 0 && oVSb.offsetHeight === 0, "Table content fits height -> Vertical scrollbar is not visible");

		}).then(function() {
			// BCP: 1970484410
			TableRenderer.apiVersion = 1;
			oTable.setModel(TableQUnitUtils.createJSONModelWithEmptyRows(7), "other");
			oTable.bindRows({
				path: "/",
				model: "other"
			});
			oTable.invalidate();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oVSb = oScrollExtension.getVerticalScrollbar();

			assert.notEqual(oVSb, null, "Table is re-rendered without being invalidated -> Vertical scrollbar exists");

			if (oVSb) {
				assert.ok(oVSb.offsetWidth > 0 && oVSb.offsetHeight > 0, "Table content does not fit height -> Vertical scrollbar is visible");
			}
		}).finally(function() {
			TableRenderer.apiVersion = iOriginalApiVersion;
		});
	});

	QUnit.test("Vertical scrollbar position", async function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();
		const oVSbComputedStyle = window.getComputedStyle(oVSb);

		this.oTable.setColumnHeaderHeight(78);
		await this.oTable.qunit.whenRenderingFinished();
		assert.strictEqual(oVSbComputedStyle.top, "0px", "Top position");

		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 2,
			fixedTopRowCount: 1
		}));
		await this.oTable.qunit.whenRenderingFinished();
		assert.strictEqual(oVSbComputedStyle.top, TableUtils.BaseSize.sapUiSizeCozy + "px", "Fixed rows: Top position");
	});

	QUnit.test("Vertical scrollbar height if variable row heights enabled", async function(assert) {
		this.oTable.getRowMode().setRowCount(5);
		this.oTable._bVariableRowHeightEnabled = true;
		this.oTable.addColumn(new Column({
			template: new HeightControl({
				height: "150px"
			})
		}));

		await this.oTable.qunit.whenRenderingFinished();
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();
		assert.equal(oVSb.clientHeight, 5 * this.oTable._getBaseRowHeight(), "Vertical scrollbar height is correct");
	});

	QUnit.module("Extension methods", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 5,
					fixedTopRowCount: 1,
					fixedBottomRowCount: 1
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10),
				columns: [TableQUnitUtils.createTextColumn().setWidth("1100px")]
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("scrollVertically (row-wise)", function(assert) {
		const oTable = this.oTable;
		const oScrollExtension = oTable._getScrollExtension();
		const iTotalRowCount = oTable._getTotalRowCount();
		const iVisibleRowCount = oTable._getRowCounts().count;
		const iNotVisibleRows = iTotalRowCount - iVisibleRowCount;
		let i;

		for (i = 0; i < iNotVisibleRows + 2; i++) {
			if (i < iNotVisibleRows) {
				assert.equal(oTable.getFirstVisibleRow(), i, "First visible row before scroll (forward, " + i + ")");
				oScrollExtension.scrollVertically(true, false);
				assert.equal(oTable.getFirstVisibleRow(), i + 1, "First visible row after scroll");
			} else {
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row before scroll (forward, " + i + ")");
				oScrollExtension.scrollVertically(true, false);
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row after scroll");
			}
		}

		for (i = 0; i < iNotVisibleRows + 2; i++) {
			if (i < iNotVisibleRows) {
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows - i, "First visible row before scroll (backward, " + i + ")");
				oScrollExtension.scrollVertically(false, false);
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows - i - 1, "First visible row after scroll");
			} else {
				assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scroll (backward, " + i + ")");
				oScrollExtension.scrollVertically(false, false);
				assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scroll");
			}
		}
	});

	QUnit.test("scrollVertically (page-wise)", function(assert) {
		const oTable = this.oTable;
		const mRowCounts = oTable._getRowCounts();
		const oScrollExtension = oTable._getScrollExtension();
		const iTotalRowCount = oTable._getTotalRowCount();
		const iVisibleRowCount = mRowCounts.count;
		const iFixedTop = mRowCounts.fixedTop;
		const iFixedBottom = mRowCounts.fixedBottom;
		const iNotVisibleRows = iTotalRowCount - iVisibleRowCount;
		const iPageSize = iVisibleRowCount - iFixedTop - iFixedBottom;
		const iPages = Math.ceil((iTotalRowCount - iFixedTop - iFixedBottom) / iPageSize);
		let iCurrentPosition = 0;
		let i;

		for (i = 0; i < iPages + 2; i++) {
			if (i < iPages - 1) {
				assert.equal(oTable.getFirstVisibleRow(), iCurrentPosition, "First visible row before scroll (forward, " + i + ")");
				oScrollExtension.scrollVertically(true, true);
				iCurrentPosition += iPageSize;
				assert.equal(oTable.getFirstVisibleRow(), Math.min(iCurrentPosition, iNotVisibleRows), "First visible row after scroll");
			} else {
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row before scroll (forward, " + i + ")");
				oScrollExtension.scrollVertically(true, true);
				assert.equal(oTable.getFirstVisibleRow(), iNotVisibleRows, "First visible row after scroll");
			}
		}

		iCurrentPosition = iNotVisibleRows;
		for (i = 0; i < iPages + 2; i++) {
			if (i < iPages - 1) {
				assert.equal(oTable.getFirstVisibleRow(), iCurrentPosition, "First visible row before scroll (backward, " + i + ")");
				oScrollExtension.scrollVertically(false, true);
				iCurrentPosition -= iPageSize;
				assert.equal(oTable.getFirstVisibleRow(), Math.max(iCurrentPosition, 0), "First visible row after scroll");
			} else {
				assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row before scroll (backward, " + i + ")");
				oScrollExtension.scrollVertically(false, true);
				assert.equal(oTable.getFirstVisibleRow(), 0, "First visible row after scroll");
			}
		}
	});

	QUnit.test("scrollVerticallyMax", async function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();
		const iTotalRowCount = this.oTable._getTotalRowCount();

		/* More data rows than visible rows, with fixed top/bottom rows */
		// ↓ Down
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
		oScrollExtension.scrollVerticallyMax(true);
		assert.equal(this.oTable.getFirstVisibleRow(), iTotalRowCount - this.oTable._getRowCounts().count, "First visible row after scrolling");
		// ↑ Up
		oScrollExtension.scrollVerticallyMax(false);
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

		/* As many data rows as there are visible rows, with fixed top/bottom rows */
		this.oTable.getRowMode().setRowCount(10);
		await this.oTable.qunit.whenRenderingFinished();

		// ↓ Down
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
		oScrollExtension.scrollVerticallyMax(true);
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
		// ↑ Up
		oScrollExtension.scrollVerticallyMax(false);
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

		/* More data rows than visible rows, without fixed top/bottom rows */
		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 5
		}));
		await this.oTable.qunit.whenRenderingFinished();

		// ↓ Down
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
		oScrollExtension.scrollVerticallyMax(true);
		assert.equal(this.oTable.getFirstVisibleRow(), iTotalRowCount - this.oTable._getRowCounts().count, "First visible row after scrolling");
		// ↑ Up
		oScrollExtension.scrollVerticallyMax(false);
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

		/* As many data rows as there are visible rows, without fixed top/bottom rows */
		this.oTable.getRowMode().setRowCount(10);
		await this.oTable.qunit.whenRenderingFinished();

		// ↓ Down
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
		oScrollExtension.scrollVerticallyMax(true);
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
		// ↑ Up
		oScrollExtension.scrollVerticallyMax(false);
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");
	});

	QUnit.test("getHorizontalScrollbar", function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();

		assert.strictEqual(oScrollExtension.getHorizontalScrollbar(), this.oTable.getDomRef(library.SharedDomRef.HorizontalScrollBar),
			"Returned: Horizontal scrollbar element");

		oScrollExtension.destroy();
		assert.strictEqual(oScrollExtension.getHorizontalScrollbar(), null,
			"Returned null: The ScrollExtension is destroyed and has no reference to the table");
	});

	QUnit.test("getVerticalScrollbar", function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();
		const oScrollbar = oScrollExtension.getVerticalScrollbar();
		const oScrollbarParent = oScrollbar.parentNode;

		assert.strictEqual(oScrollExtension.getVerticalScrollbar(), this.oTable.getDomRef(library.SharedDomRef.VerticalScrollBar),
			"Returned the vertical scrollbar");

		oScrollbarParent.removeChild(oScrollbar);
		assert.strictEqual(oScrollExtension.getVerticalScrollbar(), null,
			"Returned null: The scrollbar was removed from DOM");

		oScrollbarParent.appendChild(oScrollbar);
		assert.strictEqual(oScrollExtension.getVerticalScrollbar(), oScrollbar,
			"Returned the vertical scrollbar: The scrollbar was added back to the DOM");

		oScrollExtension.destroy();
		assert.strictEqual(oScrollExtension.getVerticalScrollbar(), null,
			"Returned null: The ScrollExtension is destroyed and has no reference to the table");
	});

	QUnit.test("isHorizontalScrollbarVisible", async function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();

		assert.ok(oScrollExtension.isHorizontalScrollbarVisible(), "Table content does not fit width -> Horizontal scrollbar is visible");

		this.oTable.getColumns()[0].setWidth("10px");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(!oScrollExtension.isHorizontalScrollbarVisible(), "Table content fits width -> Horizontal scrollbar is not visible");
	});

	QUnit.test("isVerticalScrollbarVisible", async function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();

		assert.ok(oScrollExtension.isVerticalScrollbarVisible(), "Table content does not fit height -> Vertical scrollbar is visible");

		this.oTable.getRowMode().setRowCount(10);
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(!oScrollExtension.isVerticalScrollbarVisible(), "Table content fits height -> Vertical scrollbar is not visible");
	});

	QUnit.test("updateVerticalScrollbarHeight", function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();
		const oGetVerticalScrollbarHeightStub = sinon.stub(oScrollExtension, "getVerticalScrollbarHeight");
		const iInitialVSbHeight = getHeight(oVSb);

		function getHeight(oElement) {
			return oElement.getBoundingClientRect().height;
		}

		oGetVerticalScrollbarHeightStub.returns(15);
		oScrollExtension.updateVerticalScrollbarHeight();
		assert.strictEqual(getHeight(oVSb), 15, "The height is 15px");
		assert.strictEqual(window.getComputedStyle(oVSb).maxHeight, "15px", "The maximum height is 15px");

		oGetVerticalScrollbarHeightStub.returns(iInitialVSbHeight);
		oScrollExtension.updateVerticalScrollbarHeight();
		assert.strictEqual(getHeight(oVSb), iInitialVSbHeight, "The height is " + iInitialVSbHeight + "px");
		assert.strictEqual(window.getComputedStyle(oVSb).maxHeight, iInitialVSbHeight + "px", "The maximum height is " + iInitialVSbHeight + "px");

		oGetVerticalScrollbarHeightStub.restore();
	});

	QUnit.test("updateVerticalScrollHeight", function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();
		const oGetVerticalScrollHeightStub = sinon.stub(oScrollExtension, "getVerticalScrollHeight");

		oGetVerticalScrollHeightStub.returns(888);
		oScrollExtension.updateVerticalScrollHeight();
		assert.strictEqual(oVSb.scrollHeight, 888, "The scroll range is 888px");

		oGetVerticalScrollHeightStub.returns(999999);
		oScrollExtension.updateVerticalScrollHeight();
		assert.strictEqual(oVSb.scrollHeight, 999999, "The scroll range is 999999px");

		oGetVerticalScrollHeightStub.restore();
	});

	QUnit.test("getVerticalScrollHeight", function(assert) {
		const oTable = this.oTable;
		const oScrollExtension = oTable._getScrollExtension();
		const oGetTotalRowCountStub = sinon.stub(oTable, "_getTotalRowCount");
		const oGetRowCountsStub = sinon.stub(oTable, "_getRowCounts");
		const oGetBaseRowHeightStub = sinon.stub(oTable, "_getBaseRowHeight");

		oTable._bVariableRowHeightEnabled = false;
		oGetTotalRowCountStub.returns(11);
		oGetRowCountsStub.returns({
			count: 10
		});
		oGetBaseRowHeightStub.returns(100);
		assert.strictEqual(oScrollExtension.getVerticalScrollHeight(), 11 * 100,
			"Total row count > Table row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(10);
		assert.strictEqual(oScrollExtension.getVerticalScrollHeight(), 10 * 100,
			"Total row count = Table row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(9);
		assert.strictEqual(oScrollExtension.getVerticalScrollHeight(), 10 * 100,
			"Total row count < Table row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(1000000);
		assert.strictEqual(oScrollExtension.getVerticalScrollHeight(true), 1000000 * 100,
			"Total row count = 1000000: The vertical scroll height is correct");

		assert.strictEqual(oScrollExtension.getVerticalScrollHeight(), 1000000,
			"Total row count = 1000000: The vertical scroll height is at its maximum");

		oTable._bVariableRowHeightEnabled = true;
		oGetTotalRowCountStub.returns(11);
		assert.strictEqual(oScrollExtension.getVerticalScrollHeight(), 12 * 100,
			"Variable row heights enabled & Total row count > Table row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(10);
		assert.strictEqual(oScrollExtension.getVerticalScrollHeight(), 11 * 100,
			"Variable row heights enabled & Total row count = Table row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(9);
		assert.strictEqual(oScrollExtension.getVerticalScrollHeight(), 11 * 100,
			"Variable row heights enabled & Total row count < Table row count: The vertical scroll height is correct");

		oGetTotalRowCountStub.returns(1000000);
		assert.strictEqual(oScrollExtension.getVerticalScrollHeight(true), 1000001 * 100,
			"Variable row heights enabled & Total row count = 1000000: The vertical scroll height is correct");

		assert.strictEqual(oScrollExtension.getVerticalScrollHeight(), 1000000,
			"Variable row heights enabled & Total row count = 1000000: The vertical scroll height is at its maximum");

		oGetTotalRowCountStub.restore();
		oGetRowCountsStub.restore();
		oGetBaseRowHeightStub.restore();
	});

	QUnit.test("isVerticalScrollbarRequired", function(assert) {
		const oTable = this.oTable;
		const oScrollExtension = oTable._getScrollExtension();
		const oGetTotalRowCountStub = sinon.stub(oTable, "_getTotalRowCount");
		const oGetRowCountsStub = sinon.stub(oTable, "_getRowCounts");

		oTable._bVariableRowHeightEnabled = true;

		function test(iTotalRowCount, iRowCount, bRowsOverflowViewport, bVSbShouldBeRequired) {
			oGetTotalRowCountStub.returns(iTotalRowCount);
			oGetRowCountsStub.returns({
				_fullsize: iRowCount
			});

			if (bRowsOverflowViewport) {
				oTable._aRowHeights = [(oTable._getBaseRowHeight() * iRowCount) + 1];
			} else {
				oTable._aRowHeights = [1];
			}

			assert.strictEqual(oScrollExtension.isVerticalScrollbarRequired(), bVSbShouldBeRequired,
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
		const oScrollExtension = this.oTable._getScrollExtension();
		const Div = document.createElement("div");
		const vReturn = oScrollExtension.registerForMouseWheel([Div], oScrollExtension.constructor.ScrollDirection.BOTH);

		assert.strictEqual(vReturn, null, "The method should return null without synchronization enabled");
	});

	QUnit.test("registerForTouch", function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();
		const Div = document.createElement("div");
		const vReturn = oScrollExtension.registerForMouseWheel([Div], oScrollExtension.constructor.ScrollDirection.BOTH);

		assert.strictEqual(vReturn, null, "The method should return null without synchronization enabled");
	});

	QUnit.module("Horizontal scrolling", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10),
				columns: [
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createTextColumn().setWidth("1000px"),
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createTextColumn()
				]
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertSynchronization: function(assert, iScrollPosition) {
			const oHSb = this.oTable._getScrollExtension().getHorizontalScrollbar();
			const oHeaderScroll = this.oTable.getDomRef("sapUiTableColHdrScr");
			const oContentScroll = this.oTable.getDomRef("sapUiTableCtrlScr");

			if (iScrollPosition == null) {
				iScrollPosition = oHSb.scrollLeft;
			}

			const bIsSynchronized = oHSb.scrollLeft === iScrollPosition
								  && oHSb.scrollLeft === oHeaderScroll.scrollLeft
								  && oHSb.scrollLeft === oContentScroll.scrollLeft;

			assert.ok(bIsSynchronized, "Scroll positions are synchronized at position " + iScrollPosition +
									   " [HSb: " + oHSb.scrollLeft
									   + ", Header: " + oHeaderScroll.scrollLeft
									   + ", Content: " + oContentScroll.scrollLeft + "]");
		}
	});

	QUnit.test("Scrollbar", function(assert) {
		const oTable = this.oTable;
		const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
		const oHeaderScroll = oTable.getDomRef("sapUiTableColHdrScr");
		const oContentScroll = oTable.getDomRef("sapUiTableCtrlScr");

		return new Promise(function(resolve) {
			// Scroll right to 200
			function scrollRight(i) {
				if (i === 20) {
					oTable.qunit.whenHSbScrolled().then(resolve);
				}

				oHSb.scrollLeft = i * 10;
			}

			for (let i = 1; i <= 20; i++) {
				window.setTimeout(scrollRight.bind(this, i), i);
			}
		}).then(function() {
			assert.strictEqual(oHSb.scrollLeft, 200, "Horizontal scrollbar scroll position is 200");
			assert.strictEqual(oHeaderScroll.scrollLeft, 200, "Header scroll position is 200");
			assert.strictEqual(oContentScroll.scrollLeft, 200, "Content scroll position is 200");

		}).then(function() {
			// Scroll left to 20
			return new Promise(function(resolve) {
				function scrollLeft(i, fnResolve) {
					if (i === 18) {
						oTable.qunit.whenHSbScrolled().then(fnResolve);
					}

					oHSb.scrollLeft = 200 - i * 10;
				}

				for (let i = 1; i <= 18; i++) {
					window.setTimeout(scrollLeft.bind(this, i, resolve), i);
				}
			});
		}).then(function() {
			assert.strictEqual(oHSb.scrollLeft, 20, "Horizontal scrollbar scroll position is 20");
			assert.strictEqual(oHeaderScroll.scrollLeft, 20, "Header scroll position is 20");
			assert.strictEqual(oContentScroll.scrollLeft, 20, "Content scroll position is 20");
		});
	});

	QUnit.test("MouseWheel", async function(assert) {
		const oTable = this.oTable;
		let oHSb;
		let iCurrentScrollPosition;
		const iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		const DeltaMode = MouseWheelDeltaMode;
		const that = this;

		function scrollForwardAndBackToBeginning(oTargetElement) {
			return oTable.qunit.scrollHSbTo(0).then(function() {
				iCurrentScrollPosition = 0;
				return scrollWithMouseWheel(oTargetElement, 150, DeltaMode.PIXEL, true, iCurrentScrollPosition + 150, true);
			}).then(function() {
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
			return oTable.qunit.scrollHSbTo(0).then(function() {
				iCurrentScrollPosition = 0;
				return scrollWithMouseWheel(oTargetElement, -150, DeltaMode.PIXEL, true, 0, true);
			}).then(oTable.qunit.$scrollHSbTo(oHSb.scrollWidth - oHSb.getBoundingClientRect().width)).then(function() {
				iCurrentScrollPosition = oHSb.scrollLeft;
				return scrollWithMouseWheel(oTargetElement, 150, DeltaMode.PIXEL, true, iCurrentScrollPosition, true);
			});
		}

		function scrollOnInvalidTarget(oTargetElement) {
			return oTable.qunit.scrollHSbTo(50).then(function() {
				iCurrentScrollPosition = 50;
				return scrollWithMouseWheel(oTargetElement, 150, DeltaMode.PIXEL, true, iCurrentScrollPosition, false);
			}).then(function() {
				return scrollWithMouseWheel(oTargetElement, -150, DeltaMode.PIXEL, true, iCurrentScrollPosition, false);
			});
		}

		function scrollWithMouseWheel(oTargetElement, iScrollDelta, iDeltaMode, bShift, iExpectedScrollPosition, bValidTarget) {
			return new Promise(function(resolve) {
				const oWheelEvent = TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, bShift);
				const oStopPropagationSpy = sinon.spy(oWheelEvent, "stopPropagation");
				let bExpectScrolling = false;

				oTargetElement.dispatchEvent(oWheelEvent);

				if (!bValidTarget) {
					assert.ok(!oWheelEvent.defaultPrevented, "Target does not support mousewheel scrolling: Default action was not prevented");
					assert.ok(oStopPropagationSpy.notCalled, "Target does not support mousewheel scrolling: Propagation was not stopped");
				} else if (iCurrentScrollPosition === 0 && iScrollDelta < 0) {
					assert.ok(!oWheelEvent.defaultPrevented, "Scroll position is at the beginning: Default action was not prevented");
					assert.ok(oStopPropagationSpy.notCalled, "Scroll position is at the beginning: Propagation was not stopped");
				} else if (iCurrentScrollPosition === oHSb.scrollWidth - oHSb.getBoundingClientRect().width && iScrollDelta > 0) {
					assert.ok(!oWheelEvent.defaultPrevented, "Scroll position is at the end: Default action was not prevented");
					assert.ok(oStopPropagationSpy.notCalled, "Scroll position is at the end: Propagation was not stopped");
				} else {
					assert.ok(oWheelEvent.defaultPrevented, "Default action was prevented");
					assert.ok(oStopPropagationSpy.calledOnce, "Propagation was stopped");
					bExpectScrolling = true;
				}

				iCurrentScrollPosition = iExpectedScrollPosition;

				if (bExpectScrolling) {
					oTable.qunit.whenHSbScrolled().then(function() {
						that.assertSynchronization(assert, iExpectedScrollPosition);
						resolve();
					});
				} else {
					that.assertSynchronization(assert, iExpectedScrollPosition);
					resolve();
				}
			});
		}

		oTable.setFixedColumnCount(1);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
			return scrollForwardAndBackToBeginning(oTable.qunit.getDataCell(0, 0)); // Cell in fixed column.
		}).then(function() {
			return scrollForwardAndBackToBeginning(oTable.qunit.getDataCell(2, 2)); // Cell in scrollable column.
		}).then(function() {
			return scrollForwardAndBackToBeginning(oTable.qunit.getRowHeaderCell(0));
		}).then(function() {
			return scrollForwardAndBackToBeginning(oTable.qunit.getRowActionCell(0));
		}).then(function() {
			return scrollBeyondBoundaries(oTable.qunit.getDataCell(2, 2));
		}).then(function() {
			return scrollOnInvalidTarget(oTable.qunit.getSelectAllCell());
		}).then(function() {
			return scrollOnInvalidTarget(oTable.qunit.getColumnHeaderCell(1));
		});
	});

	QUnit.test("Touch", async function(assert) {
		const oTable = this.oTable;
		let oHSb;
		let iCurrentScrollPosition;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;
		const that = this;

		function scrollForwardAndBackToBeginning(oTargetElement) {
			return oTable.qunit.scrollHSbTo(0).then(function() {
				iCurrentScrollPosition = 0;
				TableQUnitUtils.startTouchScrolling(oTargetElement, 200);
				return scrollWithTouch(150, iCurrentScrollPosition + 150, true);
			}).then(function() {
				return scrollWithTouch(-150, iCurrentScrollPosition - 150, true);
			}).then(function() {
				TableQUnitUtils.endTouchScrolling();
			});
		}

		function scrollBeyondBoundaries(oTargetElement) {
			return oTable.qunit.scrollHSbTo(0).then(function() {
				iCurrentScrollPosition = 0;
				TableQUnitUtils.startTouchScrolling(oTargetElement, 200);
				return scrollWithTouch(-150, 0, true);
			}).then(function() {
				TableQUnitUtils.endTouchScrolling();
			}).then(oTable.qunit.$scrollHSbTo(oHSb.scrollWidth - oHSb.getBoundingClientRect().width)).then(function() {
				iCurrentScrollPosition = oHSb.scrollLeft;
				TableQUnitUtils.startTouchScrolling(oTargetElement, 200);
				return scrollWithTouch(150, iCurrentScrollPosition, true);
			}).then(function() {
				TableQUnitUtils.endTouchScrolling();
			});
		}

		function scrollOnInvalidTarget(oTargetElement) {
			return oTable.qunit.scrollHSbTo(50).then(function() {
				iCurrentScrollPosition = 50;
				TableQUnitUtils.startTouchScrolling(oTargetElement, 200);
				return scrollWithTouch(150, iCurrentScrollPosition, false);
			}).then(function() {
				TableQUnitUtils.endTouchScrolling();
				TableQUnitUtils.startTouchScrolling(oTargetElement, 200);
				return scrollWithTouch(-150, iCurrentScrollPosition, false);
			}).then(function() {
				TableQUnitUtils.endTouchScrolling();
			});
		}

		function scrollWithTouch(iScrollDelta, iExpectedScrollPosition, bValidTarget) {
			return new Promise(function(resolve) {
				const oTouchEvent = TableQUnitUtils.doTouchScrolling(iScrollDelta);
				let bExpectScrolling = false;

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
				} else if (iCurrentScrollPosition === oHSb.scrollWidth - oHSb.getBoundingClientRect().width && iScrollDelta > 0) {
					if (!bOriginalTouchSupport || bOriginalTouchSupport && Device.system.desktop && Device.browser.chrome) {
						assert.ok(!oTouchEvent.defaultPrevented, "Scroll position is already at the end: Default action was not prevented");
					} else {
						assert.ok(oTouchEvent.defaultPrevented,
							"Scroll position is already at the end: Default action was still prevented on a touch device (swipe action)");
					}
				} else {
					assert.ok(oTouchEvent.defaultPrevented, "Default action was prevented");
					bExpectScrolling = true;
				}

				iCurrentScrollPosition = iExpectedScrollPosition;

				if (bExpectScrolling) {
					oTable.qunit.whenHSbScrolled().then(function() {
						that.assertSynchronization(assert, iExpectedScrollPosition);
						resolve();
					});
				} else {
					that.assertSynchronization(assert, iExpectedScrollPosition);
					resolve();
				}
			});
		}

		Device.support.pointer = false;
		Device.support.touch = true;
		oTable.qunit.preventFocusOnTouch();
		oTable.setRowMode(new FixedRowMode({
			fixedTopRowCount: 1
		}));
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
			return scrollForwardAndBackToBeginning(oTable.qunit.getDataCell(0, 0)); // Cell in fixed column.
		}).then(function() {
			return scrollForwardAndBackToBeginning(oTable.qunit.getDataCell(2, 2)); // Cell in scrollable column.
		}).then(function() {
			return scrollForwardAndBackToBeginning(oTable.qunit.getRowHeaderCell(0));
		}).then(function() {
			return scrollForwardAndBackToBeginning(oTable.qunit.getRowActionCell(0));
		}).then(function() {
			return scrollBeyondBoundaries(oTable.qunit.getDataCell(2, 2));
		}).then(function() {
			return scrollOnInvalidTarget(oTable.qunit.getSelectAllCell());
		}).then(function() {
			return scrollOnInvalidTarget(oTable.qunit.getColumnHeaderCell(1));
		}).finally(function() {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Focus", async function(assert) {
		const oTable = this.oTable;

		function getScrollLeft() {
			return oTable._getScrollExtension().getHorizontalScrollbar().scrollLeft;
		}

		function isScrolledIntoView(oCell) {
			const oRowContainer = oTable.getDomRef("sapUiTableCtrlScr");
			const iScrollLeft = getScrollLeft();
			const iRowContainerWidth = oRowContainer.clientWidth;
			const iCellLeft = oCell.offsetLeft;
			const iCellRight = iCellLeft + oCell.offsetWidth;
			const iOffsetLeft = iCellLeft - iScrollLeft;
			const iOffsetRight = iCellRight - iRowContainerWidth - iScrollLeft;

			return iOffsetLeft >= 0 && iOffsetRight <= 0;
		}

		function test(sTestTitle, oDomElementToFocus, iInitialScrollLeft, bScrollPositionShouldChange) {
			document.body.focus();

			return oTable.qunit.scrollHSbTo(iInitialScrollLeft).then(oTable.qunit.$focus(oDomElementToFocus)).then(function() {
				if (bScrollPositionShouldChange) {
					return oTable.qunit.whenHSbScrolled().then(function() {
						assert.notStrictEqual(getScrollLeft(), iInitialScrollLeft, sTestTitle + ": The horizontal scroll position did change");
						assert.ok(isScrolledIntoView(oDomElementToFocus), sTestTitle + ": The focused cell is fully visible");
					});
				} else {
					return TableQUnitUtils.wait(50).then(function() {
						assert.strictEqual(getScrollLeft(), iInitialScrollLeft, sTestTitle + ": The horizontal scroll position did not change");
					});
				}
			});
		}

		oTable.getColumns()[1].setWidth("800px");
		oTable.getColumns()[2].setWidth("100px");
		oTable.getColumns()[3].setWidth("800px");
		oTable.getColumns()[4].setWidth("100px");
		oTable.setFixedColumnCount(1);
		await oTable.qunit.whenRenderingFinished();

		await test("Focus header cell in column 3 (scrollable column)", oTable.qunit.getColumnHeaderCell(2), 0, true);
		await test("Focus header cell in column 1 (fixed column)", oTable.qunit.getColumnHeaderCell(0), 70, false);
		await test("Focus header cell in column 2 (scrollable column)", oTable.qunit.getColumnHeaderCell(1), 70, true);
		await test("Focus header cell in column 3 (scrollable column)", oTable.qunit.getColumnHeaderCell(2), 850, true);
		await test("Focus header cell in column 4 (scrollable column)", oTable.qunit.getColumnHeaderCell(3), 200, true);
		await test("Focus data cell in column 3, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 2), 0, true);
		await test("Focus data cell in column 1, row 1 (fixed column)", oTable.qunit.getDataCell(0, 0), 70, false);
		await test("Focus data cell in column 2, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 1), 70, true);
		await test("Focus data cell in column 3, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 2), 850, true);
		await test("Focus data cell in column 4, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 3), 200, true);

		oTable.getColumns()[1].setWidth("1000px");
		oTable.getColumns()[2].setWidth("100px");
		oTable.getColumns()[3].setWidth("1000px");
		oTable.getColumns()[4].setWidth("100px");
		await oTable.qunit.whenRenderingFinished();

		await test("Focus header cell in column 2 (scrollable column)", oTable.qunit.getColumnHeaderCell(1), 50, false);
		await test("Focus header cell in column 4 (scrollable column)", oTable.qunit.getColumnHeaderCell(3), 1150, false);
		await test("Focus data cell in column 2, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 1), 50, false);
		await test("Focus data cell in column 2, row 2 (scrollable column)", oTable.qunit.getDataCell(1, 1), 50, false);
		await test("Focus data cell in column 4, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 3), 1150, false);
		await test("Focus data cell in column 4, row 2 (scrollable column)", oTable.qunit.getDataCell(1, 3), 1150, false);
	});

	QUnit.test("Restoration of the scroll position", async function(assert) {
		await this.oTable.qunit.scrollHSbTo(50);
		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		this.assertSynchronization(assert, 50);
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
							this._oFixedRowMode.toString = function() { return "FixedRowMode"; };
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
							this._oAutoRowMode.toString = function() { return "AutoRowMode"; };
							this._oAutoRowMode.renderCellContentStyles = function() {}; // Allow row mode to have variable row heights.
						}

						return this._oAutoRowMode;
					}
				}
			});

			// Default row mode is set in "createTable".
			this.mDefaultSettings = {
				models: new JSONModel({
					configA: {rowHeight: "1px", child: {rowHeight: "1px"}},
					configB: {rowHeight: "149px"} // 149px to have a row height of 150px, since the row adds 1px border.
				}),
				bindingLength: 100
			};

			this.iBaseRowHeight = 49;

			TableQUnitUtils.setDefaultSettings(this.mDefaultSettings);
		},
		afterEach: function() {
			this.destroyTable();
		},
		after: function() {
			TableQUnitUtils.setDefaultSettings();
			this.forEachTestedRowMode(function(mRowModeConfig) {
				mRowModeConfig.rowMode.destroy();
			});
		},
		forEachTestedRowMode: function(fnForEach) {
			// This array should ensure the expected order in which row modes are tested.
			const aTestedRowModeNames = ["FixedRowMode", "AutoRowMode"];
			const that = this;

			function getRowMode(sKey) {
				return this.mTestedRowModes[sKey];
			}

			for (let i = 0; i < aTestedRowModeNames.length; i++) {
				const sKey = aTestedRowModeNames[i];

				fnForEach(Object.create(null, {
					key: {value: sKey},
					rowMode: {get: getRowMode.bind(that, sKey)}
				}));
			}
		},
		getMaxFirstVisibleRow: function(iBindingLength, bVariableRowHeights) {
			bVariableRowHeights = bVariableRowHeights === true;
			iBindingLength = iBindingLength == null ? this.mDefaultSettings.bindingLength : iBindingLength;
			return iBindingLength - (bVariableRowHeights ? 5 : 10);
		},
		getMaxFirstRenderedRow: function(iBindingLength) {
			return this.getMaxFirstVisibleRow(iBindingLength) - 1;
		},
		getMaxScrollTop: function(iBindingLength, bVariableRowHeights) {
			bVariableRowHeights = bVariableRowHeights === true;
			iBindingLength = iBindingLength == null ? this.mDefaultSettings.bindingLength : iBindingLength;

			const iRowCount = 10 + (bVariableRowHeights ? 1 : 0);
			const iScrollHeight = (Math.max(iBindingLength, iRowCount) - (bVariableRowHeights ? 1 : 0)) * this.iBaseRowHeight
								+ (bVariableRowHeights ? 98 : 0); // Buffer
			const iScrollbarHeight = 10 * this.iBaseRowHeight;

			return Math.min(1000000, iScrollHeight) - iScrollbarHeight;
		},
		createTable: async function(mSettings, fnBeforePlaceAt) {
			this.destroyTable();

			mSettings = Object.assign({
				rowMode: this.mTestedRowModes.FixedRowMode
			}, mSettings);

			await TableQUnitUtils.createTable(mSettings, function(oTable, mSettings) {
				this.oTable = oTable;

				oTable._getBaseRowHeight = function() {
					return this.iBaseRowHeight;
				}.bind(this);

				oTable.addColumn(new Column({
					template: new HeightControl({height: "{rowHeight}"})
				}));

				this._bypassBinding(oTable, mSettings.bindingLength);

				oTable.bindRows({
					path: "/",
					suspended: mSettings.bindingSuspended
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
			const fnGetTotalRowCount = oTable._getTotalRowCount;

			oTable.__iBindingLength = iLength;
			oTable._getTotalRowCount = function() {
				const oBinding = oTable.getBinding();
				if (oBinding) {
					oBinding.getLength = function() {
						return oTable.__iBindingLength;
					};
				}
				return fnGetTotalRowCount.apply(oTable, arguments);
			};
			oTable._getContexts = function(iStartIndex, iLength) {
				const aContexts = [];
				if (this.getBinding()) {
					const iBindingLength = oTable.__iBindingLength;
					const iCount = iStartIndex + iLength > iBindingLength ? iBindingLength - iStartIndex : iLength;
					const bVariableHeights = TableUtils.isVariableRowHeightEnabled(oTable);

					for (let i = 0; i < iCount; i++) {
						const iIndex = iStartIndex + i;
						aContexts.push(new Context(oTable.getModel(), iIndex % 2 === 0 || !bVariableHeights ? "/configA" : "/configB"));
					}
				}
				return aContexts;
			};
			oTable.getContextByIndex = function(iIndex) {
				return iIndex >= 0 && this.getBinding() ? oTable._getContexts(iIndex, 1)[0] : null;
			};
		},
		changeRowHeights: function(iHeightA, iHeightB) {
			if (!this.oTable) {
				return;
			}

			const oData = JSON.parse(JSON.stringify(this.mDefaultSettings.models.getProperty("/")));

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

			const iOldLength = this.oTable._getTotalRowCount();
			const oBinding = this.oTable.getBinding();

			this.oTable.__iBindingLength = iNewLength;

			if (iOldLength !== iNewLength && sReason && oBinding) {
				this.oTable._iBindingLength = -1; // Ensure that the table detects a binding length change to update the UI.
				oBinding.fireEvent("change", {reason: sReason});
			}
		},
		fakeODataBindingChange: function() {
			const oBinding = this.oTable ? this.oTable.getBinding() : null;
			if (oBinding) {
				oBinding.fireEvent("change", {reason: ChangeReason.Change});
			}
		},
		fakeODataBindingRefresh: function(iNewLength) {
			const oBinding = this.oTable ? this.oTable.getBinding() : null;

			if (!oBinding) {
				return;
			}

			const iBindingLength = this.oTable.__iBindingLength;
			this.changeBindingLength(0);
			oBinding.fireEvent("refresh", {reason: ChangeReason.Refresh});

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

			const that = this;
			const iFirstVisibleRow = this.oTable.getFirstVisibleRow();
			const iScrollPosition = this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			const iInnerScrollPosition = this.oTable.getDomRef("tableCCnt").scrollTop;

			this.oTable.invalidate();

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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: 5
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = that.getMaxFirstVisibleRow(10, true);
		const iMaxScrollTop = that.getMaxScrollTop(10, true);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: mConfig.bindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop,
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
					firstVisibleRow: 0,
					scrollTop: 0,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "Overflow, FirstVisibleRow = 1",
					rowMode: oRowModeConfig.rowMode,
					bindingLength: 10,
					initialFirstVisibleRow: 1,
					firstVisibleRow: 1,
					scrollTop: 10,
					innerScrollTop: that.iBaseRowHeight
				});
			}).then(function() {
				return test({
					title: "Overflow, FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					bindingLength: 10,
					initialFirstVisibleRow: 10,
					firstVisibleRow: iMaxFirstVisibleRow,
					scrollTop: iMaxScrollTop,
					innerScrollTop: 505
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Small data; Fixed row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = that.getMaxFirstVisibleRow();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: iMaxFirstVisibleRow,
					firstVisibleRow: iMaxFirstVisibleRow
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Small data; Variable row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow();
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
					initialFirstVisibleRow: that.mDefaultSettings.bindingLength - 2,
					firstVisibleRow: iMaxFirstVisibleRow,
					scrollTop: iMaxScrollTop,
					innerScrollTop: 655
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: that.mDefaultSettings.bindingLength - 1,
					firstVisibleRow: iMaxFirstVisibleRow,
					scrollTop: iMaxScrollTop,
					innerScrollTop: 655
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position; Large data; Fixed row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: iBindingLength
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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

	QUnit.test("Initial scroll position; Large data; Fixed row heights; Floating point precision edge case", async function(assert) {
		const that = this;
		const iBindingLength = 1000000000;
		const oTable = await this.createTable({
			rowMode: this.mTestedRowModes.FixedRowMode.setRowCount(18),
			firstVisibleRow: iBindingLength,
			bindingLength: iBindingLength
		});

		return oTable.qunit.whenRenderingFinished().then(function() {
			const iExpectedFirstVisibleRow = iBindingLength - 18;
			const iExpectedScrollPosition = 1000000 - oTable._getScrollExtension().getVerticalScrollbar().clientHeight;
			that.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollPosition, 0, "After rendering");
		}).then(function() {
			return that.testRestoration(assert);
		});
	});

	QUnit.test("Initial scroll position; Large data; Variable row heights; Floating point precision edge case", async function(assert) {
		const that = this;
		const iBindingLength = 1000000000;
		const oTable = await this.createTable({
			rowMode: this.mTestedRowModes.FixedRowMode.setRowCount(18),
			firstVisibleRow: iBindingLength,
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});

		return oTable.qunit.whenRenderingFinished().then(function() {
			const iExpectedScrollPosition = 1000000 - oTable._getScrollExtension().getVerticalScrollbar().clientHeight;
			that.assertPosition(assert, 999999991, iExpectedScrollPosition, 1059, "After rendering");
		}).then(function() {
			return that.testRestoration(assert);
		});
	});

	QUnit.test("Initial scroll position if bound after rendering; Small data; Fixed row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();

		async function test(mConfig) {
			const oTable = await that.createTable({
				models: undefined,
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.initialFirstVisibleRow, 0, 0,
					mConfig.rowMode + ", " + mConfig.title + "; Before binding created");
				oTable.setModel(that.mDefaultSettings.models);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.firstVisibleRow * that.iBaseRowHeight, 0,
					mConfig.rowMode + ", " + mConfig.title + "; After binding created");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 0",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 0,
					firstVisibleRow: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 5",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 5,
					firstVisibleRow: 5
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: that.mDefaultSettings.bindingLength,
					firstVisibleRow: iMaxFirstVisibleRow
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position if bound after rendering; Small data; Variable row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		async function test(mConfig) {
			const oTable = await that.createTable({
				models: undefined,
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true,
				firstVisibleRow: mConfig.initialFirstVisibleRow
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.initialFirstVisibleRow, 0, 0,
					mConfig.rowMode + ", " + mConfig.title + "; Before binding created");
				oTable.setModel(that.mDefaultSettings.models);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop,
					mConfig.rowMode + ", " + mConfig.title + "; After binding created");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			if (oRowModeConfig.rowMode.isA("sap.ui.table.rowmodes.Auto")) {
				return;
			}
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
					title: "FirstVisibleRow = 5",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 5,
					firstVisibleRow: 5,
					scrollTop: 5 * that.iBaseRowHeight,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: that.mDefaultSettings.bindingLength,
					firstVisibleRow: iMaxFirstVisibleRow,
					scrollTop: iMaxScrollTop,
					innerScrollTop: 655
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position if binding length initialized after rendering; Small data; Fixed row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: 0,
				bindingSuspended: true // Avoid change event of client binding when it is initialized.
			}, function(oTable) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength);
				});
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.firstVisibleRow * that.iBaseRowHeight, 0,
					mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			});
		}

		this.forEachTestedRowMode(function(oRowModeConfig) {
			pTestSequence = pTestSequence.then(function() {
				return test({
					title: "FirstVisibleRow = 0",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 0,
					firstVisibleRow: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = 5",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 5,
					firstVisibleRow: 5
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: that.mDefaultSettings.bindingLength,
					firstVisibleRow: iMaxFirstVisibleRow
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position if binding length initialized after rendering; Small data; Variable row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: 0,
				bindingSuspended: true // Avoid change event of client binding when it is initialized.
			}, function(oTable) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength);
				});
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				that.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop,
					mConfig.rowMode + ", " + mConfig.title + "; After rendering");
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
					title: "FirstVisibleRow = 5",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: 5,
					firstVisibleRow: 5,
					scrollTop: 5 * that.iBaseRowHeight,
					innerScrollTop: 0
				});
			}).then(function() {
				return test({
					title: "FirstVisibleRow = MAX",
					rowMode: oRowModeConfig.rowMode,
					initialFirstVisibleRow: that.mDefaultSettings.bindingLength,
					firstVisibleRow: iMaxFirstVisibleRow,
					scrollTop: iMaxScrollTop,
					innerScrollTop: 655
				});
			});
		});

		return pTestSequence;
	});

	QUnit.test("Initial scroll position if binding length changed after rendering; Small data; Fixed row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: that.mDefaultSettings.bindingLength - 1
			}, function(oTable) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					that.changeBindingLength(that.mDefaultSettings.bindingLength, ChangeReason.Change);
				});
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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

	QUnit.test("Initial scroll position if binding length changed after rendering; Small data; Variable row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: that.mDefaultSettings.bindingLength - 1,
				_bVariableRowHeightEnabled: true
			}, function(oTable) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					that.changeBindingLength(that.mDefaultSettings.bindingLength, ChangeReason.Change);
				});
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ScrollTop set to ";

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		const iMaxScrollTop = this.getMaxScrollTop();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode
			});
			const sTitle = mConfig.rowMode + ", ScrollTop set to ";

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
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
				const oScrollExtension = oTable._getScrollExtension();
				const oScrollbar = oTable._getScrollExtension().getVerticalScrollbar();

				// Test restarting the scrollbar scroll process.

				oScrollbar.scrollTop = 100;
				oScrollbar.dispatchEvent(TableQUnitUtils.createScrollEvent());

				setTimeout(function() {
					oScrollbar.scrollTop = 200;
					oScrollbar.dispatchEvent(TableQUnitUtils.createScrollEvent());

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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ScrollTop set to ";

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
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
				const oScrollExtension = oTable._getScrollExtension();
				const oScrollbar = oTable._getScrollExtension().getVerticalScrollbar();

				// Test restarting the scrollbar scroll process.

				oScrollbar.scrollTop = 100;
				oScrollbar.dispatchEvent(TableQUnitUtils.createScrollEvent());

				setTimeout(function() {
					oScrollbar.scrollTop = 200;
					oScrollbar.dispatchEvent(TableQUnitUtils.createScrollEvent());
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		const iRowsPerPixel = iMaxFirstVisibleRow / iMaxScrollTop;

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength
			});
			const sTitle = mConfig.rowMode + ", ScrollTop set to ";

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(1)).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 99
			}, function(oTable) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					that.changeBindingLength(100, ChangeReason.Change);
				});
			});

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(49)).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(1);
			}).then(oTable.qunit.whenNextRowsUpdated).then(TableQUnitUtils.$wait(0)).then(function() {
				oTable.invalidate();
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(1);
			}).then(TableQUnitUtils.$wait(0)).then(function() {
				oTable.invalidate();
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(10, true);
		const iMaxScrollTop = this.getMaxScrollTop(10, true);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			return oTable.qunit.whenRenderingFinished().then(function() {
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
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 505, "FirstVisibleRow set to > MAX");

				oTable.setFirstVisibleRow(iMaxFirstVisibleRow);
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, 87, 447, sTitle + "MAX");

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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		const iMaxScrollTop = this.getMaxScrollTop();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode
			});
			const sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			return oTable.qunit.whenRenderingFinished().then(function() {
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
				oTable.setFirstVisibleRow(that.mDefaultSettings.bindingLength - 2);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX - 1");
				oTable.setFirstVisibleRow(that.mDefaultSettings.bindingLength - 1);
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		const iMiddleFirstVisibleRow = Math.floor((Math.round(iMaxScrollTop / 2) / iMaxScrollTop) * iMaxFirstVisibleRow);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength
			});
			const sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iBindingLength = 1000000000;
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(iBindingLength);
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				TableQUnitUtils.addDelegateOnce(oTable, "onBeforeRendering", function() {
					oTable.setFirstVisibleRow(1);
				});
				oTable.invalidate();
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

	QUnit.test("Scroll by setting FirstVisibleRow when re-rendering; Small data; Variable row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				TableQUnitUtils.addDelegateOnce(oTable, "onBeforeRendering", function() {
					oTable.setFirstVisibleRow(1);
				});
				oTable.invalidate();
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

	QUnit.test("Scroll by setting FirstVisibleRow when binding refresh; Small data; Fixed row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				that.fakeODataBindingRefresh();
				oTable.setFirstVisibleRow(1);
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

	QUnit.test("Scroll by setting FirstVisibleRow when binding refresh; Small data; Variable row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				that.fakeODataBindingRefresh();
				oTable.setFirstVisibleRow(1);
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

	QUnit.test("Scroll by setting FirstVisibleRow before being bound; Small data; Fixed row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				models: undefined,
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				oTable.setModel(that.mDefaultSettings.models);
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

	QUnit.test("Scroll by setting FirstVisibleRow before being bound; Small data; Variable row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				models: undefined,
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
				oTable.setFirstVisibleRow(1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				oTable.setModel(that.mDefaultSettings.models);
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

	QUnit.test("Scroll with mouse wheel; Small data; Fixed row heights", async function(assert) {
		const that = this;
		const oTable = await this.createTable();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		const iMaxScrollTop = this.getMaxScrollTop();

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode) {
			return function() {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenRenderingFinished().then(scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL)).then(function() {
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

	QUnit.test("Scroll with mouse wheel; Small data; Variable row heights", async function(assert) {
		const that = this;
		const oTable = await this.createTable({
			_bVariableRowHeightEnabled: true
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode) {
			return function() {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenRenderingFinished().then(scrollWithMouseWheel(60, MouseWheelDeltaMode.PIXEL)).then(function() {
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

	QUnit.test("Scroll with mouse wheel; Large data; Fixed row heights", async function(assert) {
		const that = this;
		const iBindingLength = 1000000000;
		const oTable = await this.createTable({
			bindingLength: iBindingLength
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		const nPixelsPerRow = iMaxScrollTop / iMaxFirstVisibleRow;

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode) {
			return function() {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return Promise.race([
					that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished),
					that.oTable.qunit.whenNextRenderingFinished()
				]);
			};
		}

		const pReady = oTable.qunit.whenRenderingFinished();

		return pReady.then(scrollWithMouseWheel(that.iBaseRowHeight - 1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 1, 1, 0, "Scrolled " + (that.iBaseRowHeight - 1) + " pixels down");
		}).then(scrollWithMouseWheel(1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 2, 1, 0, "Scrolled 1 pixel down");
		}).then(scrollWithMouseWheel(500000, MouseWheelDeltaMode.PIXEL)).then(function() {
			const iFirstVisibleRow = 2 + Math.floor(500000 / that.iBaseRowHeight);
			const iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 500000 pixels down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)).then(function() {
			const iFirstVisibleRow = 4 + Math.floor(500000 / that.iBaseRowHeight);
			const iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 rows down");
		}).then(scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)).then(function() {
			const iFirstVisibleRow = 24 + Math.floor(500000 / that.iBaseRowHeight);
			const iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 pages down");
		}).then(scrollWithMouseWheel(1000000000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		}).then(scrollWithMouseWheel(-(that.iBaseRowHeight - 1), MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, "Scrolled " + (that.iBaseRowHeight - 1) + " pixels up");
		}).then(scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow - 2, iMaxScrollTop - 1, 0, "Scrolled 1 pixel up");
		}).then(scrollWithMouseWheel(-500000, MouseWheelDeltaMode.PIXEL)).then(function() {
			const iFirstVisibleRow = iMaxFirstVisibleRow - 2 - Math.floor(500000 / that.iBaseRowHeight);
			const iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 500000 pixels up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.LINE)).then(function() {
			const iFirstVisibleRow = iMaxFirstVisibleRow - 4 - Math.floor(500000 / that.iBaseRowHeight);
			const iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 rows up");
		}).then(scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)).then(function() {
			const iFirstVisibleRow = iMaxFirstVisibleRow - 24 - Math.floor(500000 / that.iBaseRowHeight);
			const iScrollTop = Math.round(iFirstVisibleRow * nPixelsPerRow);
			that.assertPosition(assert, iFirstVisibleRow, iScrollTop, 0, "Scrolled 2 pages up");
		}).then(scrollWithMouseWheel(-1000000000000, MouseWheelDeltaMode.PIXEL)).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		});
	});

	QUnit.test("Scroll with mouse wheel when the table is inside a scrollable container", async function(assert) {
		const that = this;
		const iBindingLength = 20;
		const oTable = await this.createTable({
			bindingLength: iBindingLength
		});

		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode, bTableScrolls, bContainerScrolls) {
			return new Promise(function(resolve) {
				const oEvent = TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, false);
				const oPreventDefaultSpy = sinon.spy(oEvent, "preventDefault");
				oTable.qunit.getDataCell(0, 0).dispatchEvent(oEvent);
				if (bTableScrolls) {
					Promise.race([
						that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished),
						that.oTable.qunit.whenNextRenderingFinished()
					]).then(function() {
						assert.ok(oPreventDefaultSpy.calledOnce, "Page scrolling is prevented");
						resolve();
					});
				} else {
					wait(600).then(function() {
						if (bContainerScrolls) {
							assert.ok(oPreventDefaultSpy.notCalled, "Page scrolling is not prevented");
						} else {
							assert.ok(oPreventDefaultSpy.calledOnce, "Page scrolling is prevented");
						}
						resolve();
					});
				}
			});
		}

		function wait(iMilliseconds) {
			return new Promise(function(resolve) {
				setTimeout(resolve, iMilliseconds);
			});
		}

		return oTable.qunit.whenRenderingFinished().then(function() {
			return scrollWithMouseWheel(9999999, MouseWheelDeltaMode.PIXEL, true, false);
		}).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		}).then(function() {
			return scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL, false, false);
		}).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "The table is already scrolled to the bottom");
		}).then(function() {
			return scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL, false, true);
		}).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "The table is already scrolled to the bottom");
		}).then(function() {
			return scrollWithMouseWheel(-9999999, MouseWheelDeltaMode.PIXEL, true, false);
		}).then(function() {
			that.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		}).then(function() {
			return scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL, false, false);
		}).then(function() {
			that.assertPosition(assert, 0, 0, 0, "The table is already scrolled to the top");
		}).then(function() {
			return scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL, false, true);
		}).then(function() {
			that.assertPosition(assert, 0, 0, 0, "The table is already scrolled to the top");
		});
	});

	QUnit.test("Scroll with mouse wheel; Large data; Variable row heights", async function(assert) {
		const that = this;
		const iBindingLength = 1000000000;
		const oTable = await this.createTable({
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		function scrollWithMouseWheel(iScrollDelta, iDeltaMode) {
			return function() {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return Promise.race([
					that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished),
					that.oTable.qunit.whenNextRenderingFinished()
				]);
			};
		}

		const pReady = oTable.qunit.whenRenderingFinished();

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

	QUnit.test("Handling of mouse wheel events that do scroll", async function(assert) {
		const done = assert.async();
		const that = this;
		const oTable = await this.createTable({
			fixedColumnCount: 1,
			rowActionCount: 1,
			rowActionTemplate: TableQUnitUtils.createRowAction()
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});
		let oWheelEvent;
		let oStopPropagationSpy;
		let pTestSequence = Promise.resolve();

		function test(mConfig) {
			return oTable.qunit.scrollVSbTo(0).then(function() {
				oWheelEvent = TableQUnitUtils.createMouseWheelEvent(20, MouseWheelDeltaMode.PIXEL, false);
				oStopPropagationSpy = sinon.spy(oWheelEvent, "stopPropagation");
				mConfig.element.dispatchEvent(oWheelEvent);
			}).then(oTable.qunit.whenVSbScrolled).then(function() {
				that.assertPosition(assert, 1, 49, 0, "Mouse Wheel - " + mConfig.name + ": Scrolled");
				assert.ok(oWheelEvent.defaultPrevented, "Mouse Wheel - " + mConfig.name + ": Default action was prevented");
				assert.ok(oStopPropagationSpy.calledOnce, "Mouse Wheel - " + mConfig.name + ": Propagation was stopped");
			});
		}

		pTestSequence = pTestSequence.then(oTable.qunit.whenRenderingFinished).then(function() {
			const aTestConfigs = [
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

	QUnit.test("Handling of mouse wheel events that do not scroll", async function(assert) {
		const done = assert.async();
		const that = this;

		const oTable = await this.createTable({
			title: "test",
			extension: [new HeightControl()],
			footer: new HeightControl()
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});
		let pTestSequence = Promise.resolve();

		function test(mConfig) {
			const iScrollDelta = mConfig.scrollDelta == null ? 50 : mConfig.scrollDelta;
			const oWheelEvent = TableQUnitUtils.createMouseWheelEvent(iScrollDelta, MouseWheelDeltaMode.PIXEL, false);
			const oStopPropagationSpy = sinon.spy(oWheelEvent, "stopPropagation");
			const iExpectedFirstVisibleRow = mConfig.firstVisibleRow == null ? 0 : mConfig.firstVisibleRow;
			const iExpectedScrollTop = mConfig.scrollTop == null ? 0 : mConfig.scrollTop;

			mConfig.element.dispatchEvent(oWheelEvent);

			return TableQUnitUtils.wait(600).then(function() {
				that.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollTop, 0,
					"Mouse Wheel - " + mConfig.name + ": Not scrolled");
				assert.ok(!oWheelEvent.defaultPrevented, "Mouse Wheel - " + mConfig.name + ": Default action was not prevented");
				assert.ok(oStopPropagationSpy.notCalled, "Mouse Wheel - " + mConfig.name + ": Propagation was not stopped");
			});
		}

		pTestSequence = pTestSequence.then(oTable.qunit.whenRenderingFinished).then(function() {
			const oDomRef = oTable.getDomRef();
			const aTestConfigs = [
				{name: "Horizontal scrollbar", element: oTable._getScrollExtension().getHorizontalScrollbar()},
				{name: "Column header container", element: oDomRef.querySelector(".sapUiTableColHdrCnt")},
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

	QUnit.test("Scroll with touch; Small data; Fixed row heights", async function(assert) {
		const that = this;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const oTable = await this.createTable();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		const iMaxScrollTop = this.getMaxScrollTop();

		function scrollWithTouch(iScrollDelta) {
			return function() {
				TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.qunit.preventFocusOnTouch();
			TableQUnitUtils.startTouchScrolling(oTable.qunit.getDataCell(0, 0));
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
			TableQUnitUtils.endTouchScrolling();
		}).finally(function() {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Scroll with touch; Small data; Variable row heights", async function(assert) {
		const that = this;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const oTable = await this.createTable({
			_bVariableRowHeightEnabled: true
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		function scrollWithTouch(iScrollDelta) {
			return function() {
				TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.qunit.preventFocusOnTouch();
			TableQUnitUtils.startTouchScrolling(oTable.qunit.getDataCell(0, 0));
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
			TableQUnitUtils.endTouchScrolling();
		}).finally(function() {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Scroll with touch; Large data; Fixed row heights;", async function(assert) {
		const that = this;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const iBindingLength = 1000000000;
		const oTable = await this.createTable({
			bindingLength: iBindingLength
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		const iRowsPerPixel = iMaxFirstVisibleRow / iMaxScrollTop;

		function scrollWithTouch(iScrollDelta) {
			return function() {
				TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.qunit.preventFocusOnTouch();
			TableQUnitUtils.startTouchScrolling(oTable.qunit.getDataCell(0, 0));
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
			TableQUnitUtils.endTouchScrolling();
		}).finally(function() {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Scroll with touch; Large data; Variable row heights", async function(assert) {
		const that = this;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const iBindingLength = 1000000000;
		const oTable = await this.createTable({
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		function scrollWithTouch(iScrollDelta) {
			return function() {
				TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				return that.oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			};
		}

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.qunit.preventFocusOnTouch();
			TableQUnitUtils.startTouchScrolling(oTable.qunit.getDataCell(0, 0));
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
			TableQUnitUtils.endTouchScrolling();
		}).finally(function() {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Handling of touch events that do scroll", async function(assert) {
		const done = assert.async();
		const that = this;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const oTable = await this.createTable({
			fixedColumnCount: 1,
			rowActionCount: 1,
			rowActionTemplate: TableQUnitUtils.createRowAction()
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});
		let oTouchMoveEvent;
		let oStopPropagationSpy;
		let pTestSequence = Promise.resolve();

		function test(mConfig) {
			return oTable.qunit.scrollVSbTo(0).then(function() {
				TableQUnitUtils.startTouchScrolling(mConfig.element);
				oTouchMoveEvent = TableQUnitUtils.doTouchScrolling(0, 20);
				TableQUnitUtils.endTouchScrolling();
				oStopPropagationSpy = sinon.spy(oTouchMoveEvent, "stopPropagation");
			}).then(oTable.qunit.whenVSbScrolled).then(function() {
				that.assertPosition(assert, 0, 20, 0, "Touch - " + mConfig.name + ": Scrolled");
				assert.ok(oTouchMoveEvent.defaultPrevented, "Touch - " + mConfig.name + ": Default action was prevented");
				assert.ok(oStopPropagationSpy.notCalled, "Touch - " + mConfig.name + ": Propagation was not stopped");
			});
		}

		oTable.qunit.preventFocusOnTouch();

		pTestSequence = pTestSequence.then(oTable.qunit.whenRenderingFinished).then(function() {
			const aTestConfigs = [
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
				const iMaxScrollTop = that.getMaxScrollTop();

				function testOutsideBoundaries(iScrollDelta) {
					oTouchMoveEvent = TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
					oStopPropagationSpy = sinon.spy(oTouchMoveEvent, "stopPropagation");

					return TableQUnitUtils.wait(100).then(function() {
						assert.ok(oTouchMoveEvent.defaultPrevented, "Touch - Scrolled further than the maximum: Default action was prevented");
						assert.ok(oStopPropagationSpy.notCalled, "Touch - Scrolled further than the maximum: Propagation was not stopped");
					});
				}

				TableQUnitUtils.startTouchScrolling(aTestConfigs[0].element);

				return testOutsideBoundaries(iMaxScrollTop + 100).then(function() {
					return testOutsideBoundaries(100);
				}).then(function() {
					return testOutsideBoundaries(-iMaxScrollTop - 300);
				}).then(function() {
					return testOutsideBoundaries(-100);
				}).then(function() {
					TableQUnitUtils.endTouchScrolling();
				});
			});

			pTestSequence = pTestSequence.finally(function() {
				Device.support.pointer = bOriginalPointerSupport;
				Device.support.touch = bOriginalTouchSupport;
				done();
			});
		});
	});

	QUnit.test("Handling of touch events that do not scroll", async function(assert) {
		const done = assert.async();
		const that = this;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const oTable = await this.createTable({
			title: "test",
			extension: [new HeightControl()],
			footer: new HeightControl()
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});
		let pTestSequence = Promise.resolve();

		function test(mConfig) {
			const iScrollDelta = mConfig.scrollDelta == null ? 50 : mConfig.scrollDelta;

			if (mConfig.skipStartTouchScrolling !== true) {
				TableQUnitUtils.startTouchScrolling(mConfig.element);
			}
			const oTouchMoveEvent = TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
			if (mConfig.skipStartTouchScrolling === true) {
				TableQUnitUtils.endTouchScrolling();
			}

			const oStopPropagationSpy = sinon.spy(oTouchMoveEvent, "stopPropagation");
			const iExpectedFirstVisibleRow = mConfig.firstVisibleRow == null ? 0 : mConfig.firstVisibleRow;
			const iExpectedScrollTop = mConfig.scrollTop == null ? 0 : mConfig.scrollTop;

			return TableQUnitUtils.wait(100).then(function() {
				that.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollTop, 0, "Touch - " + mConfig.name + ": Not scrolled");
				assert.ok(!oTouchMoveEvent.defaultPrevented, "Touch - " + mConfig.name + ": Default action was not prevented");
				assert.ok(oStopPropagationSpy.notCalled, "Touch - " + mConfig.name + ": Propagation was not stopped");
			});
		}

		oTable.qunit.preventFocusOnTouch();

		pTestSequence = pTestSequence.then(oTable.qunit.whenRenderingFinished).then(function() {
			const oDomRef = oTable.getDomRef();
			const aTestConfigs = [
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
						skipStartTouchScrolling: true,
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
						skipStartTouchScrolling: true,
						name: "Scrolling back up",
						element: oTable.qunit.getDataCell(0, 1),
						scrollDelta: -100,
						firstVisibleRow: 90,
						scrollTop: 90 * oTable._getBaseRowHeight()
					});
				});
			});

			pTestSequence = pTestSequence.finally(function() {
				Device.support.pointer = bOriginalPointerSupport;
				Device.support.touch = bOriginalTouchSupport;
				done();
			});
		});
	});

	QUnit.test("Scroll the viewport; Tiny data; Variable row heights", function(assert) {
		const that = this;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(10, true);
		const iMaxScrollTop = this.getMaxScrollTop(10, true);
		let pTestSequence = Promise.resolve();

		function scrollViewport(iScrollTop) {
			return function() {
				that.oTable.getDomRef("tableCCnt").scrollTop = iScrollTop;
				return that.oTable.qunit.whenVSbScrolled();
			};
		}

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(scrollViewport(100)).then(function() {
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
		const that = this;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow();
		const iMaxScrollTop = this.getMaxScrollTop(null, true);
		let pTestSequence = Promise.resolve();

		function scrollViewport(iScrollTop) {
			return function() {
				that.oTable.getDomRef("tableCCnt").scrollTop = iScrollTop;
				return that.oTable.qunit.whenVSbScrolled();
			};
		}

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(scrollViewport(100)).then(function() {
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
		const that = this;
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);
		let pTestSequence = Promise.resolve();

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

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(scrollViewport(100, true)).then(function() {
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

	QUnit.test("Scroll row-wise with #scrollVertically; Small data; Fixed row heights", async function(assert) {
		const oTable = await this.createTable();
		const that = this;

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			oTable._getScrollExtension().scrollVertically(true, false);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 1, that.iBaseRowHeight, 0);
			oTable._getScrollExtension().scrollVertically(false, false);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 0, 0, 0);
		});
	});

	QUnit.test("Scroll row-wise with #scrollVertically; Small data; Variable row heights", async function(assert) {
		const oTable = await this.createTable({
			_bVariableRowHeightEnabled: true
		});
		const that = this;

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			oTable._getScrollExtension().scrollVertically(true, false);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 7, 362, 655);
			oTable._getScrollExtension().scrollVertically(false, false);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 0, 0, 0);
		});
	});

	QUnit.test("Scroll page-wise with #scrollVertically; Small data; Fixed row heights", async function(assert) {
		const oTable = await this.createTable();
		const that = this;

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			oTable._getScrollExtension().scrollVertically(true, true);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 10, 490, 0);
			oTable._getScrollExtension().scrollVertically(false, true);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 0, 0, 0);
		});
	});

	QUnit.test("Scroll page-wise with #scrollVertically; Small data; Variable row heights", async function(assert) {
		const oTable = await this.createTable({
			_bVariableRowHeightEnabled: true
		});
		const that = this;

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			oTable._getScrollExtension().scrollVertically(true, true);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 17, 852, 655);
			oTable._getScrollExtension().scrollVertically(false, true);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 0, 0, 0);
		});
	});

	QUnit.test("Scroll to top and bottom with #scrollVerticallyMax; Small data; Fixed row heights", async function(assert) {
		const oTable = await this.createTable();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		const iMaxScrollTop = this.getMaxScrollTop();
		const that = this;

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			oTable._getScrollExtension().scrollVerticallyMax(true);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0);
			oTable._getScrollExtension().scrollVerticallyMax(false);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 0, 0, 0);
		});
	});

	QUnit.test("Scroll to top and bottom with #scrollVerticallyMax; Small data; Variable row heights", async function(assert) {
		const oTable = await this.createTable({
			_bVariableRowHeightEnabled: true
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);
		const that = this;

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			oTable._getScrollExtension().scrollVerticallyMax(true);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655);
			oTable._getScrollExtension().scrollVerticallyMax(false);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			that.assertPosition(assert, 0, 0, 0);
		});
	});

	QUnit.test("Restore scroll position after setting ScrollTop; Tiny data; Variable row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
					firstVisibleRow: that.mDefaultSettings.bindingLength
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
					firstVisibleRow: that.mDefaultSettings.bindingLength
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		function changeRowHeights(iHeightA, iHeightB) {
			return function() {
				that.changeRowHeights(iHeightA, iHeightB);
				return that.oTable.qunit.whenRenderingFinished();
			};
		}

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", Changed row heights";

			return oTable.qunit.whenRenderingFinished().then(changeRowHeights(100, 175)).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		function changeRowHeights(iHeightA, iHeightB) {
			return function() {
				that.changeRowHeights(iHeightA, iHeightB);
				return that.oTable.qunit.whenRenderingFinished();
			};
		}

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", Changed row heights";

			return oTable.qunit.whenRenderingFinished().then(changeRowHeights(100, 175)).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		function changeRowHeights(iHeightA, iHeightB) {
			return function() {
				that.changeRowHeights(iHeightA, iHeightB);
				return that.oTable.qunit.whenRenderingFinished();
			};
		}

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", Changed row heights";

			return oTable.qunit.whenRenderingFinished().then(changeRowHeights(100, 175)).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(50)).then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;

			return oTable.qunit.whenRenderingFinished().then(function() {
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
		const that = this;
		let pTestSequence = Promise.resolve();

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			return oTable.qunit.whenRenderingFinished().then(function() {
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

	QUnit.test("Restore scroll position after changing the row count on resize; Small data; Fixed row heights", async function(assert) {
		const that = this;
		const oTable = await this.createTable({
			rowMode: this.mTestedRowModes.AutoRowMode.setMinRowCount(8)
		});
		let iFirstVisibleRow;
		let iScrollPosition;

		return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(200)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		}).then(oTable.qunit.$resize({height: "400px"})).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 200; After height decreased");
		}).then(oTable.qunit.resetSize).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 200; After height increased");
		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		}).then(oTable.qunit.$resize({height: "400px"})).then(function() {
			that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = MAX; After height decreased");
		}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		}).then(oTable.qunit.resetSize).then(function() {
			that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - that.iBaseRowHeight * 2, 0,
				"ScrollTop = MAX; After height increased");
		});
	});

	QUnit.test("Restore scroll position after binding length change; Tiny data; Variable row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(40)).then(function() {
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
				that.assertPosition(assert, 3, iScrollPosition, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, 3, 69, 355,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(11);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 89, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(10);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(100);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 264, 58,
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

	QUnit.test("Restore scroll position after binding length change; Small data; Fixed row heights", function(assert) {
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;

				that.changeBindingLength(that.mDefaultSettings.bindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

				that.changeBindingLength(that.mDefaultSettings.bindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultSettings.bindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultSettings.bindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;

				that.changeBindingLength(that.mDefaultSettings.bindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight, 0,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

				that.changeBindingLength(that.mDefaultSettings.bindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.changeBindingLength(that.mDefaultSettings.bindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultSettings.bindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight, 0,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - that.iBaseRowHeight, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength);
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
		const that = this;
		let pTestSequence = Promise.resolve();

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				that.changeBindingLength(that.mDefaultSettings.bindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

				that.changeBindingLength(that.mDefaultSettings.bindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultSettings.bindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultSettings.bindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(60)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = 60; After binding length decreased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				iFirstVisibleRow = oTable.getFirstVisibleRow();
				iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
				iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;

				that.changeBindingLength(that.mDefaultSettings.bindingLength - 1, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - that.iBaseRowHeight, iInnerScrollPosition - 150 + that.iBaseRowHeight,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

				that.changeBindingLength(that.mDefaultSettings.bindingLength, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, 4437, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.changeBindingLength(that.mDefaultSettings.bindingLength + 1, ChangeReason.Expand);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 4499, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (expand)");

				that.changeBindingLength(that.mDefaultSettings.bindingLength, ChangeReason.Collapse);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength - 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - that.iBaseRowHeight, iInnerScrollPosition - 150 + that.iBaseRowHeight,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 2, 4437, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, 4499, iInnerScrollPosition - 150,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(that.mDefaultSettings.bindingLength + 100);
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iBindingLength = 1000000000;

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(60)).then(function() {
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
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition, 0,
					sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");

				that.fakeODataBindingRefresh(iBindingLength);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - 1, 0,
					sTitle + "ScrollTop = MAX; After binding length increased (refresh)");

			}).then(oTable.qunit.$scrollVSbTo(9999999)).then(function() {
				that.fakeODataBindingRefresh(iBindingLength + 1);
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				that.assertPosition(assert, iFirstVisibleRow, iScrollPosition - 1, 0,
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
		const that = this;
		let pTestSequence = Promise.resolve();
		const iBindingLength = 1000000000;

		async function test(mConfig) {
			const oTable = await that.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$scrollVSbTo(60)).then(function() {
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

	QUnit.test("The table's DOM is removed without notifying the table", async function(assert) {
		const oTable = await this.createTable();
		const oScrollExtension = oTable._getScrollExtension();
		let oTableElement;
		let oTableParentElement;

		return oTable.qunit.whenRenderingFinished().then(function() {
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

	QUnit.test("Scrolling inside the cell", async function(assert) {
		const DummyControl = Control.extend("sap.ui.table.test.DummyControl", {
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

		const oTable = await TableQUnitUtils.createTable({
			columns: [
				new Column({template: new DummyControl(), width: "20px"}),
				new Column({template: new DummyControl(), width: "20px"})
			],
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModelWithEmptyRows(1),
			rowMode: new FixedRowMode({
				rowCount: 1,
				rowContentHeight: 10
			}),
			fixedColumnCount: 1
		});

		function test(sTitle, iColumnIndex) {
			const oCellContent = oTable.getRows()[0].getCells()[iColumnIndex].getDomRef();

			return oTable.qunit.focus(oCellContent).then(function() {
				const $InnerCellElement = TableUtils.getCell(oTable, oCellContent).find(".sapUiTableCellInner");

				assert.strictEqual($InnerCellElement[0].scrollLeft, 0, sTitle + ": The cell content is not scrolled horizontally");
				assert.strictEqual($InnerCellElement[0].scrollTop, 0, sTitle + ": The cell content is not scrolled vertically");
			});
		}

		return oTable.qunit.whenRenderingFinished().then(() => {
			return test("Fixed column", 0);
		}).then(() => {
			return test("Scrollable column", 1);
		}).finally(() => {
			oTable.destroy();
		});
	});

	QUnit.module("Leave action mode on scrolling", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				width: "500px",
				columns: [TableQUnitUtils.createInteractiveTextColumn().setWidth("800px")],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(20)
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Scrollbar", function(assert) {
		const oTable = this.oTable;
		const oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();
		let oEvent;

		return oTable.qunit.focus(oCellContent).then(function() {
			// Horizontal
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			oEvent = document.createEvent('MouseEvents');
			oEvent.initEvent("mousedown", true, true);
			oTable._getScrollExtension().getHorizontalScrollbar().dispatchEvent(oEvent);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Clicked on horizontal scrollbar -> Table is in Navigation Mode");
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
		}).then(oTable.qunit.$focus(oCellContent)).then(function() {
			// Vertical
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 1;
			return oTable.qunit.whenVSbScrolled().then(function() {
				assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled the vertical scrollbar -> Table is in Navigation Mode");
				assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
			});
		});
	});

	QUnit.test("Scrollbar; Large data scrolling", function(assert) {
		const oTable = this.oTable;
		const oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();

		oTable._bLargeDataScrolling = true;

		return oTable.qunit.focus(oCellContent).then(function() {
			// Vertical
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 1;
			return oTable.qunit.whenVSbScrolled().then(function() {
				assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled the vertical scrollbar -> Table is in Navigation Mode");
				assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
			});
		});
	});

	QUnit.test("MouseWheel", function(assert) {
		const oTable = this.oTable;
		const oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();
		const oTableContainer = oTable.getDomRef("tableCCnt");
		let oWheelEvent;

		return oTable.qunit.focus(oCellContent).then(function() {
			// Horizontal
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			oWheelEvent = TableQUnitUtils.createMouseWheelEvent(150, MouseWheelDeltaMode.PIXEL, true);
			oTableContainer.dispatchEvent(oWheelEvent);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled horizontally -> Table is in Navigation Mode");
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
		}).then(oTable.qunit.$focus(oCellContent)).then(function() {
			// Vertical
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			oWheelEvent = TableQUnitUtils.createMouseWheelEvent(150, MouseWheelDeltaMode.PIXEL, false);
			oTableContainer.dispatchEvent(oWheelEvent);
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled vertically -> Table is in Navigation Mode again");
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
		});
	});

	QUnit.test("MouseWheel; textarea element inside a cell", async function(assert) {
		let oWheelEvent = TableQUnitUtils.createMouseWheelEvent(20, MouseWheelDeltaMode.PIXEL, false);
		const oStopPropagationSpy = sinon.spy(oWheelEvent, "stopPropagation");

		this.oTable.insertColumn(new Column({template: new TextArea({value: "A\nB\nC\nD\nE"})}), 0);
		await this.oTable.qunit.whenRenderingFinished();

		const oTargetElement = this.oTable.qunit.getDataCell(0, 0).querySelector("textarea");
		oTargetElement.dispatchEvent(oWheelEvent);

		await TableQUnitUtils.wait(100);
		assert.ok(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop === 0, "Table did not scroll");
		assert.ok(!oWheelEvent.defaultPrevented, "Default action was not prevented");
		assert.ok(oStopPropagationSpy.notCalled, "Propagation was not stopped");

		oTargetElement.scrollTop = 70;
		oTargetElement.dispatchEvent(oWheelEvent);
		await TableQUnitUtils.$wait(100);
		assert.ok(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop === 0, "TextArea is scrolled to bottom, Table did not scroll");
		assert.ok(!oWheelEvent.defaultPrevented, "Default action was not prevented");
		assert.ok(oStopPropagationSpy.notCalled, "Propagation was not stopped");

		oWheelEvent = TableQUnitUtils.createMouseWheelEvent(-20, MouseWheelDeltaMode.PIXEL, false);
		oTargetElement.dispatchEvent(oWheelEvent);
		await TableQUnitUtils.$wait(100);
		assert.ok(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop === 0, "Table did not scroll");
		assert.ok(!oWheelEvent.defaultPrevented, "Default action was not prevented");
		assert.ok(oStopPropagationSpy.notCalled, "Propagation was not stopped");

		oTargetElement.scrollTop = 0;
		oTargetElement.dispatchEvent(oWheelEvent);
		await TableQUnitUtils.$wait(100);
		assert.ok(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop === 0, "TextArea is scrolled to top, Table did not scroll");
		assert.ok(!oWheelEvent.defaultPrevented, "Default action was not prevented");
		assert.ok(oStopPropagationSpy.notCalled, "Propagation was not stopped");

		oStopPropagationSpy.restore();
	});

	QUnit.test("Touch", function(assert) {
		const oTable = this.oTable;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;
		oTable.invalidate();
		oTable.qunit.preventFocusOnTouch();

		return oTable.qunit.whenRenderingFinished().then(oTable.qunit.$focus(oTable.getRows()[0].getCells()[0].getDomRef())).then(function() {
			// Horizontal
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			TableQUnitUtils.startTouchScrolling(oTable.getDomRef("tableCCnt"), 200);
			TableQUnitUtils.doTouchScrolling(150);
			TableQUnitUtils.endTouchScrolling();
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled horizontally -> Table is in Navigation Mode");
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
		}).then(oTable.qunit.$focus(oTable.getRows()[0].getCells()[0].getDomRef())).then(function() {
			// Vertical
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			TableQUnitUtils.startTouchScrolling(oTable.getDomRef("tableCCnt"), 200);
			TableQUnitUtils.doTouchScrolling(undefined, 150);
			TableQUnitUtils.endTouchScrolling();
			assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled Vertically -> Table is in Navigation Mode");
			assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
		}).finally(function() {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("FirstVisibleRow", function(assert) {
		const oTable = this.oTable;
		const oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();

		return oTable.qunit.focus(oCellContent).then(function() {
			assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
			oTable.setFirstVisibleRow(1);
			return oTable.qunit.whenRenderingFinished().then(function() {
				assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Scrolled the vertical scrollbar -> Table is in Action Mode");
				assert.strictEqual(document.activeElement, oCellContent, "Cell content has focus");
			});
		});
	});
});