/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/table/Column",
	"sap/ui/table/CreationRow",
	"sap/ui/table/rowmodes/Type",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/rowmodes/Auto",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/m/TextArea",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Context",
	"sap/ui/model/ChangeReason",
	"sap/m/Menu",
	"sap/m/MenuItem"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	Column,
	CreationRow,
	RowModeType,
	FixedRowMode,
	AutoRowMode,
	TableUtils,
	library,
	TextArea,
	Device,
	Control,
	JSONModel,
	Context,
	ChangeReason,
	Menu,
	MenuItem
) {
	"use strict";

	const HeightControl = TableQUnitUtils.HeightTestControl;
	const MouseWheelDeltaMode = {
		PIXEL: 0,
		LINE: 1,
		PAGE: 2
	};

	QUnit.module("Lifecycle", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
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
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				width: "500px",
				columns: [TableQUnitUtils.createTextColumn().setWidth("800px")],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(6),
				rowMode: new FixedRowMode({
					rowCount: 1
				})
			});

			return this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Horizontal scrollbar visibility + Vertical scrollbar position", async function(assert) {
		const oTable = this.oTable;
		const oScrollExtension = oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();
		const oHSb = oScrollExtension.getHorizontalScrollbar();
		const oHSbComputedStyle = window.getComputedStyle(oHSb);
		const oModel = oTable.getModel();

		assert.ok(oHSb.offsetWidth > 0 && oHSb.offsetHeight > 0, "Table content does not fit: Horizontal scrollbar is visible");
		assert.equal(oVSb.style.bottom, oHSbComputedStyle.height, "Vertical scrollbar position is correct");

		oTable.getColumns()[0].setWidth("10px");
		await oTable.qunit.rendered();
		assert.ok(oHSb.offsetWidth === 0 && oHSb.offsetHeight === 0, "Table content does fit: Horizontal scrollbar is not visible");
		assert.equal(oVSb.style.bottom, "0px", "Vertical scrollbar position is correct");

		oTable.setSelectionMode(library.SelectionMode.None);
		oTable.getRowMode().setRowCount(6);
		oTable.getColumns()[0].setWidth("495px");
		await oTable.qunit.rendered();
		oModel.oData.push({});
		oModel.refresh();
		await oTable.qunit.rendered();
		assert.ok(oHSb.offsetWidth > 0 && oHSb.offsetHeight > 0,
			"Increase binding length so that vertical scrollbar appears: Horizontal scrollbar is visible");
		assert.equal(oVSb.style.bottom, oHSbComputedStyle.height, "Vertical scrollbar position is correct");

		oTable.setRowMode(RowModeType.Auto);
		await oTable.qunit.rendered();
		await oTable.qunit.resize({height: "400px"});
		assert.ok(oHSb.offsetWidth > 0 && oHSb.offsetHeight > 0,
			"Decrease visible rows so that vertical scrollbar appears: Horizontal scrollbar is visible");
		assert.equal(oVSb.style.bottom, oHSbComputedStyle.height, "Vertical scrollbar position is correct");

		const oCreationRow = new CreationRow();
		oTable.setCreationRow(oCreationRow);
		await oTable.qunit.rendered();
		assert.equal(oVSb.style.bottom, oHSb.offsetHeight + oCreationRow.getDomRef().offsetHeight + "px", "Vertical scrollbar position is correct");

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
		await oTable.qunit.rendered();

		assert.strictEqual(oHSbComputedStyle.marginLeft, "48px", "Left margin");
		assert.strictEqual(oHSbComputedStyle.marginRight, "17px", "Right margin");
		assert.strictEqual(oHSbContentComputedStyle.width, "800px", "Scroll range");

		oTable.getColumns()[0].setWidth("10px");
		await oTable.qunit.rendered();

		assert.strictEqual(oHSb.style.marginLeft, "", "Scrollbar hidden: Left margin");
		assert.strictEqual(oHSb.style.marginRight, "", "Scrollbar hidden: Right margin");
		assert.strictEqual(oHSbContent.style.width, "", "Scrollbar hidden: Scroll range");

		oTable.getColumns()[0].setWidth("500px");
		oTable.insertColumn(TableQUnitUtils.createTextColumn().setWidth("40px"), 0);
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(2);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		await oTable.qunit.rendered();

		assert.strictEqual(oHSbComputedStyle.marginLeft, "88px", "Fixed columns and row actions: Left margin");
		assert.strictEqual(oHSbComputedStyle.marginRight, "91px", "Fixed columns and row actions: Right margin");
		assert.strictEqual(oHSbContentComputedStyle.width, "500px", "Fixed columns and row actions: Scroll range");
	});

	QUnit.test("Vertical scrollbar visibility", async function(assert) {
		const oTable = this.oTable;
		const oScrollExtension = oTable._getScrollExtension();
		let oVSb = oScrollExtension.getVerticalScrollbar();

		assert.ok(oVSb.offsetWidth > 0 && oVSb.offsetHeight > 0, "Table content does not fit height -> Vertical scrollbar is visible");

		oTable.getRowMode().setRowCount(6);

		await oTable.qunit.rendered();
		oVSb = oScrollExtension.getVerticalScrollbar();
		assert.ok(oVSb.offsetWidth === 0 && oVSb.offsetHeight === 0, "Table content fits height -> Vertical scrollbar is not visible");
	});

	QUnit.test("Vertical scrollbar position", async function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();
		const oHSb = oScrollExtension.getHorizontalScrollbar();
		const oVSbComputedStyle = window.getComputedStyle(oVSb);

		this.oTable.setColumnHeaderHeight(78);
		await this.oTable.qunit.rendered();
		assert.strictEqual(oVSbComputedStyle.bottom, oHSb.offsetHeight + "px", "Position bottom");

		this.oTable.setRowMode(new FixedRowMode({
			rowCount: 2,
			fixedBottomRowCount: 1
		}));
		await this.oTable.qunit.rendered();
		assert.strictEqual(oVSbComputedStyle.bottom, TableUtils.BaseSize.sapUiSizeCozy + TableUtils.BaseBorderWidth + oHSb.offsetHeight + "px",
			"Fixed rows: Position bottom");
	});

	QUnit.test("Vertical scrollbar height if variable row heights enabled", async function(assert) {
		this.oTable.getRowMode().setRowCount(5);
		this.oTable._bVariableRowHeightEnabled = true;
		this.oTable.addColumn(new Column({
			template: new HeightControl({
				height: "150px"
			})
		}));

		await this.oTable.qunit.rendered();
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();
		assert.equal(oVSb.clientHeight, 5 * this.oTable._getBaseRowHeight(), "Vertical scrollbar height is correct");
	});

	QUnit.module("Extension methods", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 5,
					fixedTopRowCount: 1,
					fixedBottomRowCount: 1
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10),
				columns: [TableQUnitUtils.createTextColumn().setWidth("1100px")]
			});

			return this.oTable.qunit.rendered();
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
		await this.oTable.qunit.rendered();

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
		await this.oTable.qunit.rendered();

		// ↓ Down
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row before scrolling");
		oScrollExtension.scrollVerticallyMax(true);
		assert.equal(this.oTable.getFirstVisibleRow(), iTotalRowCount - this.oTable._getRowCounts().count, "First visible row after scrolling");
		// ↑ Up
		oScrollExtension.scrollVerticallyMax(false);
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "First visible row after scrolling");

		/* As many data rows as there are visible rows, without fixed top/bottom rows */
		this.oTable.getRowMode().setRowCount(10);
		await this.oTable.qunit.rendered();

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
		await this.oTable.qunit.rendered();
		assert.ok(!oScrollExtension.isHorizontalScrollbarVisible(), "Table content fits width -> Horizontal scrollbar is not visible");
	});

	QUnit.test("isVerticalScrollbarVisible", async function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();

		assert.ok(oScrollExtension.isVerticalScrollbarVisible(), "Table content does not fit height -> Vertical scrollbar is visible");

		this.oTable.getRowMode().setRowCount(10);
		await this.oTable.qunit.rendered();
		assert.ok(!oScrollExtension.isVerticalScrollbarVisible(), "Table content fits height -> Vertical scrollbar is not visible");
	});

	QUnit.test("updateVerticalScrollbarHeight", function(assert) {
		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();
		const oGetVerticalScrollbarHeightStub = sinon.stub(oScrollExtension, "getVerticalScrollbarHeight");
		const iInitialVSbHeight = oVSb.clientHeight;

		oGetVerticalScrollbarHeightStub.returns(15);
		oScrollExtension.updateVerticalScrollbarHeight();
		assert.strictEqual(oVSb.clientHeight, 15, "The height is 15px");
		assert.strictEqual(window.getComputedStyle(oVSb).maxHeight, "15px", "The maximum height is 15px");

		oGetVerticalScrollbarHeightStub.returns(iInitialVSbHeight);
		oScrollExtension.updateVerticalScrollbarHeight();
		assert.strictEqual(oVSb.clientHeight, iInitialVSbHeight, "The height is " + iInitialVSbHeight + "px");
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
				`Total row count: ${iTotalRowCount}, Visible row count: ${iRowCount}, Rows overflow viewport: ${bRowsOverflowViewport}`);
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
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
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

			return this.oTable.qunit.rendered();
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

			assert.ok(bIsSynchronized,
				`Scroll positions are synchronized at position ${iScrollPosition} ` +
				`[HSb: ${oHSb.scrollLeft}, Header: ${oHeaderScroll.scrollLeft}, ` +
				`Content: ${oContentScroll.scrollLeft}]`);
		}
	});

	QUnit.test("Scrollbar", async function(assert) {
		const oTable = this.oTable;
		const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
		const oHeaderScroll = oTable.getDomRef("sapUiTableColHdrScr");
		const oContentScroll = oTable.getDomRef("sapUiTableCtrlScr");

		await new Promise(function(resolve) {
			// Scroll right to 200
			function scrollRight(i) {
				if (i === 20) {
					oTable.qunit.hScrolled().then(resolve);
				}

				oHSb.scrollLeft = i * 10;
			}

			for (let i = 1; i <= 20; i++) {
				window.setTimeout(scrollRight.bind(this, i), i);
			}
		});
		assert.strictEqual(oHSb.scrollLeft, 200, "Horizontal scrollbar scroll position is 200");
		assert.strictEqual(oHeaderScroll.scrollLeft, 200, "Header scroll position is 200");
		assert.strictEqual(oContentScroll.scrollLeft, 200, "Content scroll position is 200");

		// Scroll left to 20
		await new Promise(function(resolve) {
			function scrollLeft(i, fnResolve) {
				if (i === 18) {
					oTable.qunit.hScrolled().then(fnResolve);
				}

				oHSb.scrollLeft = 200 - i * 10;
			}

			for (let i = 1; i <= 18; i++) {
				window.setTimeout(scrollLeft.bind(this, i, resolve), i);
			}
		});
		assert.strictEqual(oHSb.scrollLeft, 20, "Horizontal scrollbar scroll position is 20");
		assert.strictEqual(oHeaderScroll.scrollLeft, 20, "Header scroll position is 20");
		assert.strictEqual(oContentScroll.scrollLeft, 20, "Content scroll position is 20");
	});

	QUnit.test("MouseWheel", async function(assert) {
		const oTable = this.oTable;
		let iCurrentScrollPosition;
		const iMinColumnWidth = TableUtils.Column.getMinColumnWidth();
		const DeltaMode = MouseWheelDeltaMode;

		const scrollWithMouseWheel = async (oTargetElement, iScrollDelta, iDeltaMode, bShift, iExpectedScrollPosition, bValidTarget) => {
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
				await oTable.qunit.hScrolled();
			}

			this.assertSynchronization(assert, iExpectedScrollPosition);
		};

		async function scrollForwardAndBackToBeginning(oTargetElement) {
			await oTable.qunit.scrollHSbTo(0);
			iCurrentScrollPosition = 0;
			await scrollWithMouseWheel(oTargetElement, 150, DeltaMode.PIXEL, true, iCurrentScrollPosition + 150, true);
			await scrollWithMouseWheel(oTargetElement, 3, DeltaMode.LINE, true, iCurrentScrollPosition + iMinColumnWidth, true);
			await scrollWithMouseWheel(oTargetElement, 2, DeltaMode.PAGE, true, iCurrentScrollPosition + iMinColumnWidth, true);
			await scrollWithMouseWheel(oTargetElement, -100, DeltaMode.PIXEL, true, iCurrentScrollPosition - 100, true);
			await scrollWithMouseWheel(oTargetElement, -50, DeltaMode.PIXEL, true, iCurrentScrollPosition - 50, true);
			await scrollWithMouseWheel(oTargetElement, -3, DeltaMode.LINE, true, iCurrentScrollPosition - iMinColumnWidth, true);
			await scrollWithMouseWheel(oTargetElement, -2, DeltaMode.PAGE, true, iCurrentScrollPosition - iMinColumnWidth, true);
		}

		async function scrollBeyondBoundaries(oTargetElement) {
			await oTable.qunit.scrollHSbTo(0);
			iCurrentScrollPosition = 0;
			await scrollWithMouseWheel(oTargetElement, -150, DeltaMode.PIXEL, true, 0, true);
			await oTable.qunit.scrollHSbTo(oHSb.scrollWidth - oHSb.getBoundingClientRect().width);
			iCurrentScrollPosition = oHSb.scrollLeft;
			await scrollWithMouseWheel(oTargetElement, 150, DeltaMode.PIXEL, true, iCurrentScrollPosition, true);
		}

		async function scrollOnInvalidTarget(oTargetElement) {
			await oTable.qunit.scrollHSbTo(50);
			iCurrentScrollPosition = 50;
			await scrollWithMouseWheel(oTargetElement, 150, DeltaMode.PIXEL, true, iCurrentScrollPosition, false);
			await scrollWithMouseWheel(oTargetElement, -150, DeltaMode.PIXEL, true, iCurrentScrollPosition, false);
		}

		oTable.setFixedColumnCount(1);
		oTable.setRowActionTemplate(TableQUnitUtils.createRowAction(null));
		oTable.setRowActionCount(1);
		await nextUIUpdate();

		await oTable.qunit.rendered();
		const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
		await scrollForwardAndBackToBeginning(oTable.qunit.getDataCell(0, 0)); // Cell in fixed column.;
		await scrollForwardAndBackToBeginning(oTable.qunit.getDataCell(2, 2)); // Cell in scrollable column.;
		await scrollForwardAndBackToBeginning(oTable.qunit.getRowHeaderCell(0));
		await scrollForwardAndBackToBeginning(oTable.qunit.getRowActionCell(0));
		await scrollBeyondBoundaries(oTable.qunit.getDataCell(2, 2));
		await scrollOnInvalidTarget(oTable.qunit.getSelectAllCell());
		await scrollOnInvalidTarget(oTable.qunit.getColumnHeaderCell(1));

	});

	QUnit.test("Touch", async function(assert) {
		const oTable = this.oTable;
		let iCurrentScrollPosition;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		const scrollWithTouch = async (iScrollDelta, iExpectedScrollPosition, bValidTarget) => {
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
				await oTable.qunit.hScrolled();
			}

			this.assertSynchronization(assert, iExpectedScrollPosition);
		};

		async function scrollForwardAndBackToBeginning(oTargetElement) {
			await oTable.qunit.scrollHSbTo(0);
			iCurrentScrollPosition = 0;
			TableQUnitUtils.startTouchScrolling(oTargetElement, 200);
			await scrollWithTouch(150, iCurrentScrollPosition + 150, true);
			await scrollWithTouch(-150, iCurrentScrollPosition - 150, true);
			TableQUnitUtils.endTouchScrolling();
		}

		async function scrollBeyondBoundaries(oTargetElement) {
			await oTable.qunit.scrollHSbTo(0);
			iCurrentScrollPosition = 0;
			TableQUnitUtils.startTouchScrolling(oTargetElement, 200);
			await scrollWithTouch(-150, 0, true);
			TableQUnitUtils.endTouchScrolling();
			await oTable.qunit.scrollHSbTo(oHSb.scrollWidth - oHSb.getBoundingClientRect().width);
			iCurrentScrollPosition = oHSb.scrollLeft;
			TableQUnitUtils.startTouchScrolling(oTargetElement, 200);
			await scrollWithTouch(150, iCurrentScrollPosition, true);
			TableQUnitUtils.endTouchScrolling();
		}

		async function scrollOnInvalidTarget(oTargetElement) {
			await oTable.qunit.scrollHSbTo(50);
			iCurrentScrollPosition = 50;
			TableQUnitUtils.startTouchScrolling(oTargetElement, 200);
			await scrollWithTouch(150, iCurrentScrollPosition, false);
			TableQUnitUtils.endTouchScrolling();
			TableQUnitUtils.startTouchScrolling(oTargetElement, 200);
			await scrollWithTouch(-150, iCurrentScrollPosition, false);
			TableQUnitUtils.endTouchScrolling();
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

		await oTable.qunit.rendered();
		const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
		await scrollForwardAndBackToBeginning(oTable.qunit.getDataCell(0, 0)); // Cell in fixed column.;
		await scrollForwardAndBackToBeginning(oTable.qunit.getDataCell(2, 2)); // Cell in scrollable column.;
		await scrollForwardAndBackToBeginning(oTable.qunit.getRowHeaderCell(0));
		await scrollForwardAndBackToBeginning(oTable.qunit.getRowActionCell(0));
		await scrollBeyondBoundaries(oTable.qunit.getDataCell(2, 2));
		await scrollOnInvalidTarget(oTable.qunit.getSelectAllCell());
		await scrollOnInvalidTarget(oTable.qunit.getColumnHeaderCell(1));

		Device.support.pointer = bOriginalPointerSupport;
		Device.support.touch = bOriginalTouchSupport;
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

		async function test(sTestTitle, oDomElementToFocus, iInitialScrollLeft, bScrollPositionShouldChange) {
			document.body.focus();

			await oTable.qunit.scrollHSbTo(iInitialScrollLeft);
			await oTable.qunit.focus(oDomElementToFocus);
			if (bScrollPositionShouldChange) {
				await oTable.qunit.hScrolled();
				assert.notStrictEqual(getScrollLeft(), iInitialScrollLeft, sTestTitle + ": The horizontal scroll position did change");
				assert.ok(isScrolledIntoView(oDomElementToFocus), sTestTitle + ": The focused cell is fully visible");
			} else {
				await TableQUnitUtils.sleep(50);
				assert.strictEqual(getScrollLeft(), iInitialScrollLeft, sTestTitle + ": The horizontal scroll position did not change");
			}
		}

		oTable.getColumns()[1].setWidth("800px");
		oTable.getColumns()[2].setWidth("100px");
		oTable.getColumns()[3].setWidth("800px");
		oTable.getColumns()[4].setWidth("100px");
		oTable.setFixedColumnCount(1);
		await oTable.qunit.rendered();

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
		await oTable.qunit.rendered();

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
		await this.oTable.qunit.rendered();
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
							this._oFixedRowMode.renderCellContentStyles = function() { }; // Allow row mode to have variable row heights.
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
							this._oAutoRowMode.renderCellContentStyles = function() { }; // Allow row mode to have variable row heights.
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

			for (const sKey of aTestedRowModeNames) {
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
		createTable: function(mSettings, fnBeforePlaceAt) {
			this.destroyTable();

			mSettings = Object.assign({
				rowMode: this.mTestedRowModes.FixedRowMode
			}, mSettings);

			TableQUnitUtils.createTable(mSettings, (oTable, mSettings) => {
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
			});

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

			setTimeout(() => {
				if (iNewLength != null) {
					this.changeBindingLength(iNewLength, ChangeReason.Change);
				} else {
					this.changeBindingLength(iBindingLength);
					this.fakeODataBindingChange();
				}
			}, 50);
		},
		assertPosition: function(assert, iFirstVisibleRowIndex, iScrollPosition, iInnerScrollPosition, sTitle, iRowTolerance) {
			sTitle = sTitle == null ? "" : sTitle + ": ";

			const iActualFirstVisibleRow = this.oTable.getFirstVisibleRow();
			const iActualScrollTop = this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			const iActualInnerScrollTop = this.oTable.getDomRef("tableCCnt").scrollTop;
			// At extreme binding lengths, a 1px scrollbar slack maps to many rows
			// (iRowsPerPixel can reach ~200 with 100M rows). Callers may pass a wider
			// row tolerance for such cases; default is ±1.
			const iEffectiveRowTolerance = iRowTolerance == null ? 1 : iRowTolerance;

			assert.ok(Math.abs(iActualFirstVisibleRow - iFirstVisibleRowIndex) <= iEffectiveRowTolerance,
				`${sTitle}First visible row index (expected ${iFirstVisibleRowIndex} ±${iEffectiveRowTolerance}, got ${iActualFirstVisibleRow})`);
			assert.ok(Math.abs(iActualScrollTop - iScrollPosition) <= 1,
				`${sTitle}Scrollbar position (expected ${iScrollPosition} ±1, got ${iActualScrollTop})`);
			assert.ok(Math.abs(iActualInnerScrollTop - iInnerScrollPosition) <= 1,
				`${sTitle}Viewport position (expected ${iInnerScrollPosition} ±1, got ${iActualInnerScrollTop})`);
		},
		assertPositionWithMomentumScroll: function(assert, iFirstVisibleRowIndex, iScrollPosition, iInnerScrollPosition, sTitle) {
			sTitle = sTitle == null ? "" : sTitle + ": ";

			assert.ok(this.oTable.getFirstVisibleRow() >= iFirstVisibleRowIndex,
				sTitle + "First visible row index");
			assert.ok(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop >= iScrollPosition,
				sTitle + "Scrollbar position");
			assert.ok(this.oTable.getDomRef("tableCCnt").scrollTop >= iInnerScrollPosition,
				sTitle + "Viewport position");
		},
		testRestoration: async function(assert, sTitle) {
			sTitle = sTitle == null ? "" : sTitle + "; ";

			if (!this.oTable) {
				throw new Error("No table");
			}

			const iFirstVisibleRow = this.oTable.getFirstVisibleRow();
			const iScrollPosition = this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			const iInnerScrollPosition = this.oTable.getDomRef("tableCCnt").scrollTop;

			this.oTable.invalidate();

			await this.oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition, sTitle + "After re-rendering");
			this.fakeODataBindingChange();
			await this.oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition, sTitle + "After binding change");

			this.fakeODataBindingRefresh();
			await this.oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition, sTitle + "After binding refresh");

			this.fakeODataBindingRefresh();
			this.oTable.invalidate();
			await this.oTable.qunit.bindingChangeEvent();
			await this.oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "After simultaneous re-rendering & binding refresh");
		}
	});

	QUnit.test("Initial scroll position; Tiny data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: 5
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0,
				mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 1
			});
		}

	});

	QUnit.test("Initial scroll position; Tiny data; Variable row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(10, true);
		const iMaxScrollTop = this.getMaxScrollTop(10, true);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: mConfig.bindingLength,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop,
				mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "No overflow, FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				bindingLength: 2,
				initialFirstVisibleRow: 1,
				firstVisibleRow: 0,
				scrollTop: 0,
				innerScrollTop: 0
			});
			await test({
				title: "Overflow, FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				bindingLength: 10,
				initialFirstVisibleRow: 1,
				firstVisibleRow: 1,
				scrollTop: 10,
				innerScrollTop: this.iBaseRowHeight
			});
			await test({
				title: "Overflow, FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				bindingLength: 10,
				initialFirstVisibleRow: 10,
				firstVisibleRow: iMaxFirstVisibleRow,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 505
			});
		}

	});

	QUnit.test("Initial scroll position; Small data; Fixed row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.firstVisibleRow * this.iBaseRowHeight, 0,
				mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 0",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 0
			});
			await test({
				title: "FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 1
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: iMaxFirstVisibleRow,
				firstVisibleRow: iMaxFirstVisibleRow
			});
		}

	});

	QUnit.test("Initial scroll position; Small data; Variable row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow();
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop,
				mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 0",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 0,
				firstVisibleRow: 0,
				scrollTop: 0,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 1,
				firstVisibleRow: 1,
				scrollTop: this.iBaseRowHeight,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = 5",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 5,
				firstVisibleRow: 5,
				scrollTop: 5 * this.iBaseRowHeight,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = Max first rendered row index",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: iMaxFirstRenderedRow,
				firstVisibleRow: iMaxFirstRenderedRow,
				scrollTop: iMaxFirstRenderedRow * this.iBaseRowHeight,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = Max first rendered row index + 1",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: iMaxFirstRenderedRow + 1,
				firstVisibleRow: iMaxFirstRenderedRow + 1,
				scrollTop: 4383,
				innerScrollTop: 150
			});
			await test({
				title: "FirstVisibleRow = Max first rendered row index + 2",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: iMaxFirstRenderedRow + 2,
				firstVisibleRow: iMaxFirstRenderedRow + 2,
				scrollTop: 4391,
				innerScrollTop: this.iBaseRowHeight + 150
			});
			await test({
				title: "FirstVisibleRow = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: this.mDefaultSettings.bindingLength - 2,
				firstVisibleRow: iMaxFirstVisibleRow,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 655
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: this.mDefaultSettings.bindingLength - 1,
				firstVisibleRow: iMaxFirstVisibleRow,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 655
			});
		}

	});

	QUnit.test("Initial scroll position; Large data; Fixed row heights", async function(assert) {
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: iBindingLength
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, 0,
				mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 0",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 0,
				scrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 1,
				scrollTop: 1
			});
			await test({
				title: "FirstVisibleRow = 987654",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 987654,
				scrollTop: 987
			});
			await test({
				title: "FirstVisibleRow = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: iMaxFirstVisibleRow - 1,
				scrollTop: iMaxScrollTop - 1
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: iMaxFirstVisibleRow,
				scrollTop: iMaxScrollTop
			});
		}

	});

	QUnit.test("Initial scroll position; Large data; Variable row heights", async function(assert) {
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop,
				mConfig.rowMode + ", " + mConfig.title + "; After rendering");
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 0",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 0,
				firstVisibleRow: 0,
				scrollTop: 0,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 1,
				firstVisibleRow: 1,
				scrollTop: 1,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = 987654",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 987654,
				firstVisibleRow: 987654,
				scrollTop: 987,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = Max first rendered row index",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: iMaxFirstRenderedRow,
				firstVisibleRow: iMaxFirstRenderedRow,
				scrollTop: 999412,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = Max first rendered row index + 1",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: iMaxFirstRenderedRow + 1,
				firstVisibleRow: iMaxFirstRenderedRow + 1,
				scrollTop: 999434,
				innerScrollTop: 150
			});
			await test({
				title: "FirstVisibleRow = Max first rendered row index + 2",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: iMaxFirstRenderedRow + 2,
				firstVisibleRow: iMaxFirstRenderedRow + 2,
				scrollTop: 999442,
				innerScrollTop: this.iBaseRowHeight + 150
			});
			await test({
				title: "FirstVisibleRow = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: iBindingLength - 2,
				firstVisibleRow: iMaxFirstVisibleRow,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 655
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: iBindingLength - 1,
				firstVisibleRow: iMaxFirstVisibleRow,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 655
			});
		}

	});

	QUnit.test("Initial scroll position; Large data; Fixed row heights; Floating point precision edge case", async function(assert) {
		const iBindingLength = 1000000000;
		const oTable = this.createTable({
			rowMode: this.mTestedRowModes.FixedRowMode.setRowCount(18),
			firstVisibleRow: iBindingLength,
			bindingLength: iBindingLength
		});

		await oTable.qunit.rendered();
		const iExpectedFirstVisibleRow = iBindingLength - 18;
		const iExpectedScrollPosition = 1000000 - oTable._getScrollExtension().getVerticalScrollbar().clientHeight;
		this.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollPosition, 0, "After rendering");
		await this.testRestoration(assert);

	});

	QUnit.test("Initial scroll position; Large data; Variable row heights; Floating point precision edge case", async function(assert) {
		const iBindingLength = 1000000000;
		const oTable = this.createTable({
			rowMode: this.mTestedRowModes.FixedRowMode.setRowCount(18),
			firstVisibleRow: iBindingLength,
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});

		await oTable.qunit.rendered();
		const iExpectedScrollPosition = 1000000 - oTable._getScrollExtension().getVerticalScrollbar().clientHeight;
		this.assertPosition(assert, 999999991, iExpectedScrollPosition, 1059, "After rendering");
		await this.testRestoration(assert);

	});

	QUnit.test("Initial scroll position if bound after rendering; Small data; Fixed row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				models: undefined,
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.initialFirstVisibleRow, 0, 0,
				mConfig.rowMode + ", " + mConfig.title + "; Before binding created");
			oTable.setModel(this.mDefaultSettings.models);
			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.firstVisibleRow * this.iBaseRowHeight, 0,
				mConfig.rowMode + ", " + mConfig.title + "; After binding created");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 0",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 0,
				firstVisibleRow: 0
			});
			await test({
				title: "FirstVisibleRow = 5",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 5,
				firstVisibleRow: 5
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: this.mDefaultSettings.bindingLength,
				firstVisibleRow: iMaxFirstVisibleRow
			});
		}

	});

	QUnit.test("Initial scroll position if bound after rendering; Small data; Variable row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				models: undefined,
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true,
				firstVisibleRow: mConfig.initialFirstVisibleRow
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.initialFirstVisibleRow, 0, 0,
				mConfig.rowMode + ", " + mConfig.title + "; Before binding created");
			oTable.setModel(this.mDefaultSettings.models);
			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop,
				mConfig.rowMode + ", " + mConfig.title + "; After binding created");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 0",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 0,
				firstVisibleRow: 0,
				scrollTop: 0,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = 5",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 5,
				firstVisibleRow: 5,
				scrollTop: 5 * this.iBaseRowHeight,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: this.mDefaultSettings.bindingLength,
				firstVisibleRow: iMaxFirstVisibleRow,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 655
			});
		}

	});

	QUnit.test("Initial scroll position if binding length initialized after rendering; Small data; Fixed row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: 0,
				bindingSuspended: true // Avoid change event of client binding when it is initialized.
			}, (oTable) => {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", () => {
					this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength);
				});
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.firstVisibleRow * this.iBaseRowHeight, 0,
				mConfig.rowMode + ", " + mConfig.title + "; After rendering");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 0",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 0,
				firstVisibleRow: 0
			});
			await test({
				title: "FirstVisibleRow = 5",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 5,
				firstVisibleRow: 5
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: this.mDefaultSettings.bindingLength,
				firstVisibleRow: iMaxFirstVisibleRow
			});
		}

	});

	QUnit.test("Initial scroll position if binding length initialized after rendering; Small data; Variable row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true,
				firstVisibleRow: mConfig.initialFirstVisibleRow,
				bindingLength: 0,
				bindingSuspended: true // Avoid change event of client binding when it is initialized.
			}, (oTable) => {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", () => {
					this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength);
				});
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.scrollTop, mConfig.innerScrollTop,
				mConfig.rowMode + ", " + mConfig.title + "; After rendering");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 0",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 0,
				firstVisibleRow: 0,
				scrollTop: 0,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = 5",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: 5,
				firstVisibleRow: 5,
				scrollTop: 5 * this.iBaseRowHeight,
				innerScrollTop: 0
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				initialFirstVisibleRow: this.mDefaultSettings.bindingLength,
				firstVisibleRow: iMaxFirstVisibleRow,
				scrollTop: iMaxScrollTop,
				innerScrollTop: 655
			});
		}

	});

	QUnit.test("Initial scroll position if binding length changed after rendering; Small data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: this.mDefaultSettings.bindingLength - 1
			}, (oTable) => {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", () => {
					this.changeBindingLength(this.mDefaultSettings.bindingLength, ChangeReason.Change);
				});
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.firstVisibleRow * this.iBaseRowHeight, 0,
				mConfig.rowMode + ", " + mConfig.title + "; After rendering");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 0",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 0
			});
			await test({
				title: "FirstVisibleRow = 5",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 5
			});
		}

	});

	QUnit.test("Initial scroll position if binding length changed after rendering; Small data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				firstVisibleRow: mConfig.firstVisibleRow,
				bindingLength: this.mDefaultSettings.bindingLength - 1,
				_bVariableRowHeightEnabled: true
			}, (oTable) => {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", () => {
					this.changeBindingLength(this.mDefaultSettings.bindingLength, ChangeReason.Change);
				});
			});

			await oTable.qunit.rendered();
			this.assertPosition(assert, mConfig.firstVisibleRow, mConfig.firstVisibleRow * this.iBaseRowHeight, 0,
				mConfig.rowMode + ", " + mConfig.title + "; After rendering");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 0",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 0
			});
			await test({
				title: "FirstVisibleRow = 5",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 5
			});
		}

	});

	QUnit.test("Scroll with scrollbar; Tiny data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ScrollTop set to ";

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(1);
			this.assertPosition(assert, 0, 1, 5, sTitle + "1");
			await oTable.qunit.scrollVSbTo(48);
			this.assertPosition(assert, 2, 48, 247, sTitle + "48");
			await oTable.qunit.scrollVSbTo(49);
			this.assertPosition(assert, 3, 49, 253, sTitle + "49");
			await oTable.qunit.scrollVSbTo(48);
			this.assertPosition(assert, 2, 48, 247, sTitle + "48");
			await oTable.qunit.scrollVSbTo(9999999);
			this.assertPosition(assert, 5, 98, 505, sTitle + "MAX");
			await oTable.qunit.scrollVSbTo(1);
			this.assertPosition(assert, 0, 1, 5, sTitle + "1");
			await oTable.qunit.scrollVSbTo(0);
			this.assertPosition(assert, 0, 0, 0, sTitle + "0");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll with scrollbar; Small data; Fixed row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		const iMaxScrollTop = this.getMaxScrollTop();

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode
			});
			const sTitle = mConfig.rowMode + ", ScrollTop set to ";

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(1);
			this.assertPosition(assert, 0, 1, 0, sTitle + "1");
			await oTable.qunit.scrollVSbTo(48);
			this.assertPosition(assert, 0, 48, 0, sTitle + "48");
			await oTable.qunit.scrollVSbTo(49);
			this.assertPosition(assert, 1, 49, 0, sTitle + "49");
			await oTable.qunit.scrollVSbTo(48);
			this.assertPosition(assert, 0, 48, 0, sTitle + "48");
			await oTable.qunit.scrollVSbTo(200);
			this.assertPosition(assert, 4, 200, 0, sTitle + "200");
			await oTable.qunit.scrollVSbTo(9999999);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
			await oTable.qunit.scrollVSbBy(-1);
			this.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, sTitle + "MAX - 1");
			await oTable.qunit.scrollVSbBy(-48);
			this.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 49, 0, sTitle + "MAX - 49");
			await oTable.qunit.scrollVSbBy(-1);
			this.assertPosition(assert, iMaxFirstVisibleRow - 2, iMaxScrollTop - 50, 0, sTitle + "MAX - 50");
			await oTable.qunit.scrollVSbBy(1);
			this.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 49, 0, sTitle + "MAX - 49");
			await oTable.qunit.scrollVSbTo(iMaxScrollTop - 1);
			this.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, sTitle + "MAX - 1");
			await oTable.qunit.scrollVSbBy(1);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
			await oTable.qunit.scrollVSbTo(1);
			this.assertPosition(assert, 0, 1, 0, sTitle + "1");
			await oTable.qunit.scrollVSbTo(0);
			this.assertPosition(assert, 0, 0, 0, sTitle + "0");
			const oScrollExtension = oTable._getScrollExtension();
			const oScrollbar = oTable._getScrollExtension().getVerticalScrollbar();
			// Test restarting the scrollbar scroll process.
			oScrollbar.scrollTop = 100;
			oScrollbar.dispatchEvent(TableQUnitUtils.createScrollEvent());
			setTimeout(() => {
				oScrollbar.scrollTop = 200;
				oScrollbar.dispatchEvent(TableQUnitUtils.createScrollEvent());
				// Avoid that scroll events triggered by the browser are processed.
				oScrollbar.removeEventListener("scroll", oScrollExtension._onVerticalScrollEventHandler);
			}, 0);
			await oTable.qunit.vScrolled();
			await oTable.qunit.vScrolled();
			await oTable.qunit.rendered();
			this.assertPosition(assert, 4, 200, 0, sTitle + "200 with 2 scroll events");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll with scrollbar; Small data; Variable row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ScrollTop set to ";

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(1);
			this.assertPosition(assert, 0, 1, 1, sTitle + "1");
			await oTable.qunit.scrollVSbTo(48);
			this.assertPosition(assert, 0, 48, 48, sTitle + "48");
			await oTable.qunit.scrollVSbTo(49);
			this.assertPosition(assert, 1, 49, 0, sTitle + "49");
			await oTable.qunit.scrollVSbTo(48);
			this.assertPosition(assert, 0, 48, 48, sTitle + "48");
			await oTable.qunit.scrollVSbTo(200);
			this.assertPosition(assert, 4, 200, 4, sTitle + "200");
			await oTable.qunit.scrollVSbTo(9999999);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX");
			await oTable.qunit.scrollVSbBy(-1);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop - 1, 648, sTitle + "MAX - 1");
			await oTable.qunit.scrollVSbBy(-48);
			this.assertPosition(assert, 91, iMaxScrollTop - 49, 328, sTitle + "MAX - 49");
			await oTable.qunit.scrollVSbBy(-1);
			this.assertPosition(assert, 91, iMaxScrollTop - 50, 321, sTitle + "MAX - 50");
			await oTable.qunit.scrollVSbBy(1);
			this.assertPosition(assert, 91, iMaxScrollTop - 49, 328, sTitle + "MAX - 49");
			await oTable.qunit.scrollVSbTo(iMaxScrollTop - 1);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop - 1, 648, sTitle + "MAX - 1");
			await oTable.qunit.scrollVSbBy(1);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX");
			await oTable.qunit.scrollVSbTo(1);
			this.assertPosition(assert, 0, 1, 1, sTitle + "1");
			await oTable.qunit.scrollVSbTo(0);
			this.assertPosition(assert, 0, 0, 0, sTitle + "0");
			const oScrollExtension = oTable._getScrollExtension();
			const oScrollbar = oTable._getScrollExtension().getVerticalScrollbar();
			// Test restarting the scrollbar scroll process.
			oScrollbar.scrollTop = 100;
			oScrollbar.dispatchEvent(TableQUnitUtils.createScrollEvent());
			setTimeout(() => {
				oScrollbar.scrollTop = 200;
				oScrollbar.dispatchEvent(TableQUnitUtils.createScrollEvent());
				oScrollbar.removeEventListener("scroll", oScrollExtension._onVerticalScrollEventHandler);
			}, 0);
			await oTable.qunit.vScrolled();
			await oTable.qunit.vScrolled();
			await oTable.qunit.rendered();
			this.assertPosition(assert, 4, 200, 4, sTitle + "200 with 2 scroll events");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll with scrollbar; Large data; Fixed row heights", async function(assert) {
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		const iRowsPerPixel = iMaxFirstVisibleRow / iMaxScrollTop;

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength
			});
			const sTitle = mConfig.rowMode + ", ScrollTop set to ";

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(1);
			this.assertPosition(assert, Math.floor(iRowsPerPixel), 1, 0, sTitle + "1");
			await oTable.qunit.scrollVSbTo(48);
			this.assertPosition(assert, Math.floor(iRowsPerPixel * 48), 48, 0, sTitle + "48");
			await oTable.qunit.scrollVSbTo(500000);
			this.assertPosition(assert, Math.floor(iRowsPerPixel * 500000), 500000, 0, sTitle + "500000");
			await oTable.qunit.scrollVSbTo(500001);
			this.assertPosition(assert, Math.floor(iRowsPerPixel * 500001), 500001, 0, sTitle + "500001");
			await oTable.qunit.scrollVSbTo(9999999);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
			await oTable.qunit.scrollVSbBy(-1);
			this.assertPosition(assert, Math.floor(iRowsPerPixel * (iMaxScrollTop - 1)), iMaxScrollTop - 1, 0, sTitle + "MAX - 1");
			await oTable.qunit.scrollVSbBy(-47);
			this.assertPosition(assert, Math.floor(iRowsPerPixel * (iMaxScrollTop - 48)), iMaxScrollTop - 48, 0, sTitle + "MAX - 48");
			await oTable.qunit.scrollVSbTo(iMaxScrollTop - 1);
			this.assertPosition(assert, Math.floor(iRowsPerPixel * (iMaxScrollTop - 1)), iMaxScrollTop - 1, 0, sTitle + "MAX - 1");
			await oTable.qunit.scrollVSbBy(1);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
			await oTable.qunit.scrollVSbTo(1);
			this.assertPosition(assert, Math.floor(iRowsPerPixel), 1, 0, sTitle + "1");
			await oTable.qunit.scrollVSbTo(0);
			this.assertPosition(assert, 0, 0, 0, sTitle + "0");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll with scrollbar; Large data; Variable row heights", async function(assert) {
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(1);
			this.assertPosition(assert, 1000, 1, 29, "ScrollTop set to 1");
			await oTable.qunit.scrollVSbTo(48);
			this.assertPosition(assert, 48028, 48, 12, "ScrollTop set to 48");
			await oTable.qunit.scrollVSbTo(500000);
			this.assertPosition(assert, 500294167, 500000, 146, "ScrollTop set to 500000");
			await oTable.qunit.scrollVSbTo(500001);
			this.assertPosition(assert, 500295168, 500001, 27, "ScrollTop set to 500001");
			await oTable.qunit.scrollVSbTo(9999999);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "ScrollTop set to MAX");
			await oTable.qunit.scrollVSbBy(-1);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop - 1, 648, "ScrollTop set to MAX - 1");
			await oTable.qunit.scrollVSbBy(-9);
			this.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 10, 588, "ScrollTop set to MAX - 10");
			await oTable.qunit.scrollVSbBy(-38);
			this.assertPosition(assert, 999999991, iMaxScrollTop - 48, 334, "ScrollTop set to MAX - 48");
			await oTable.qunit.scrollVSbTo(iMaxScrollTop - 1);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop - 1, 648, "ScrollTop set to MAX - 1");
			await oTable.qunit.scrollVSbBy(1);
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "ScrollTop set to MAX");
			await oTable.qunit.scrollVSbTo(1);
			this.assertPosition(assert, 1000, 1, 29, "ScrollTop set to 1");
			await oTable.qunit.scrollVSbTo(0);
			this.assertPosition(assert, 0, 0, 0, "ScrollTop set to 0");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll with scrollbar if binding length changed after rendering; Small data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 99
			}, (oTable) => {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", () => {
					this.changeBindingLength(100, ChangeReason.Change);
				});
			});

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(49);
			this.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", ScrollTop set to 49");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll with scrollbar if re-rendered after setting FirstVisibleRow; Small data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode
			});

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(1);
			await oTable.qunit.rowsUpdated();
			await TableQUnitUtils.sleep(0);
			oTable.invalidate();
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");
			await oTable.qunit.scrollVSbTo(98);
			this.assertPosition(assert, 2, 98, 0, mConfig.rowMode + ", ScrollTop set to 98");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll with scrollbar if re-rendered while setting FirstVisibleRow; Small data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode
			});

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(1);
			await TableQUnitUtils.sleep(0);
			oTable.invalidate();
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");
			await oTable.qunit.scrollVSbTo(98);
			this.assertPosition(assert, 2, 98, 0, mConfig.rowMode + ", ScrollTop set to 98");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow; Tiny data; Variable row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(10, true);
		const iMaxScrollTop = this.getMaxScrollTop(10, true);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(1);
			await oTable.qunit.vScrolled();
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 10, 49, sTitle + "1");
			oTable.setFirstVisibleRow(3);
			await oTable.qunit.vScrolled();
			await oTable.qunit.rendered();
			this.assertPosition(assert, 3, 48, 248, sTitle + "3");
			oTable.setFirstVisibleRow(7);
			await oTable.qunit.vScrolled();
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 505, "FirstVisibleRow set to > MAX");
			oTable.setFirstVisibleRow(iMaxFirstVisibleRow);
			await oTable.qunit.vScrolled();
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstVisibleRow, 87, 447, sTitle + "MAX");
			oTable.setFirstVisibleRow(0);
			await oTable.qunit.vScrolled();
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "0");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow; Small data; Fixed row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		const iMaxScrollTop = this.getMaxScrollTop();

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode
			});
			const sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, this.iBaseRowHeight, 0, sTitle + "1");
			oTable.setFirstVisibleRow(33);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 33, 33 * this.iBaseRowHeight, 0, sTitle + "33");
			oTable.setFirstVisibleRow(iMaxFirstVisibleRow);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
			oTable.setFirstVisibleRow(iMaxFirstVisibleRow - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - this.iBaseRowHeight, 0, sTitle + "MAX - 1");
			oTable.setFirstVisibleRow(0);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "0");
			await oTable.qunit.scrollVSbTo(2 * this.iBaseRowHeight + 10);
			this.assertPosition(assert, 2, 2 * this.iBaseRowHeight + 10, 0,
				mConfig.rowMode + ", Scrolled to FirstVisibleRow = 2 by setting ScrollTop");
			oTable.setFirstVisibleRow(2);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 2, 2 * this.iBaseRowHeight, 0, sTitle + "2");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow; Small data; Variable row heights", async function(assert) {
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, this.iBaseRowHeight, 0, sTitle + "1");
			oTable.setFirstVisibleRow(33);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 33, 33 * this.iBaseRowHeight, 0, sTitle + "33");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstRenderedRow, iMaxFirstRenderedRow * this.iBaseRowHeight, 0,
				sTitle + "Max first rendered row index");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstRenderedRow + 1, 4383, 150,
				sTitle + "Max first rendered row index + 1");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 2);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstRenderedRow + 2, 4391, this.iBaseRowHeight + 150,
				sTitle + "Max first rendered row index + 2");
			oTable.setFirstVisibleRow(this.mDefaultSettings.bindingLength - 2);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX - 1");
			oTable.setFirstVisibleRow(this.mDefaultSettings.bindingLength - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX");
			oTable.setFirstVisibleRow(0);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "0");
			await oTable.qunit.scrollVSbTo(2 * this.iBaseRowHeight + 10);
			this.assertPosition(assert, 2, 2 * this.iBaseRowHeight + 10, 10,
				mConfig.rowMode + ", Scrolled to FirstVisibleRow = 2 by setting ScrollTop");
			oTable.setFirstVisibleRow(2);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 2, 2 * this.iBaseRowHeight, 0, sTitle + "2");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow; Large data; Fixed row heights", async function(assert) {
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		const iMiddleFirstVisibleRow = Math.floor((Math.round(iMaxScrollTop / 2) / iMaxScrollTop) * iMaxFirstVisibleRow);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength
			});
			const sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 1, 0, sTitle + "1");
			oTable.setFirstVisibleRow(500000000);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 500000000, Math.round(iMaxScrollTop / 2), 0, sTitle + "500000000");
			oTable.setFirstVisibleRow(iMaxFirstVisibleRow);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, sTitle + "MAX");
			oTable.setFirstVisibleRow(iMaxFirstVisibleRow - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, sTitle + "MAX - 1");
			oTable.setFirstVisibleRow(0);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "0");
			await oTable.qunit.scrollVSbTo(Math.round(iMaxScrollTop / 2));
			// Scrolltop of iMaxScrollTop / 2 does not exactly match row 500000000 (ScrollExtensions internal float vs browsers scrolltop integer)
			this.assertPosition(assert, iMiddleFirstVisibleRow, Math.round(iMaxScrollTop / 2), 0,
				mConfig.rowMode + ", Scrolled to FirstVisibleRow = " + iMiddleFirstVisibleRow + " by setting ScrollTop");
			oTable.setFirstVisibleRow(iMiddleFirstVisibleRow);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMiddleFirstVisibleRow, Math.round(iMaxScrollTop / 2), 0, sTitle + iMiddleFirstVisibleRow);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow; Large data; Variable row heights", async function(assert) {
		const iBindingLength = 1000000000;
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(iBindingLength);
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", FirstVisibleRow set to ";

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 1, 0, sTitle + "1");
			oTable.setFirstVisibleRow(500000000);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 500000000, 499706, 0, sTitle + "500000000");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstRenderedRow, 999412, 0, sTitle + "Max first rendered row index");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstRenderedRow + 1, 999434, 150, sTitle + "Max first rendered row index + 1");
			oTable.setFirstVisibleRow(iMaxFirstRenderedRow + 2);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstRenderedRow + 2, 999442, this.iBaseRowHeight + 150,
				sTitle + "Max first rendered row index + 2");
			oTable.setFirstVisibleRow(iBindingLength - 2);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX - 1");
			oTable.setFirstVisibleRow(iBindingLength - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, sTitle + "MAX");
			oTable.setFirstVisibleRow(0);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "0");
			await oTable.qunit.scrollVSbTo(Math.round(iMaxScrollTop / 2));
			// Scrolltop of iMaxScrollTop / 2 does not exactly match row 500000000 (ScrollExtensions internal float vs browsers scrolltop integer)
			this.assertPosition(assert, 500049023, Math.round(iMaxScrollTop / 2), 124,
				mConfig.rowMode + ", Scrolled to FirstVisibleRow = 500049023 by setting ScrollTop");
			oTable.setFirstVisibleRow(500049023);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 500049023, Math.round(iMaxScrollTop / 2), 0, sTitle + "500049023");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow when re-rendering; Small data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode
			});

			await oTable.qunit.rendered();
			TableQUnitUtils.addDelegateOnce(oTable, "onBeforeRendering", function() {
				oTable.setFirstVisibleRow(1);
			});
			oTable.invalidate();
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow when re-rendering; Small data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			TableQUnitUtils.addDelegateOnce(oTable, "onBeforeRendering", function() {
				oTable.setFirstVisibleRow(1);
			});
			oTable.invalidate();
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow when binding refresh; Small data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode
			});

			await oTable.qunit.rendered();
			this.fakeODataBindingRefresh();
			oTable.setFirstVisibleRow(1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow when binding refresh; Small data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			this.fakeODataBindingRefresh();
			oTable.setFirstVisibleRow(1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow before being bound; Small data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				models: undefined,
				rowMode: mConfig.rowMode
			});

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(1);
			await oTable.qunit.rendered();
			oTable.setModel(this.mDefaultSettings.models);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll by setting FirstVisibleRow before being bound; Small data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				models: undefined,
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(1);
			await oTable.qunit.rendered();
			oTable.setModel(this.mDefaultSettings.models);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 1, 49, 0, mConfig.rowMode + ", FirstVisibleRow = 1");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll with mouse wheel; Small data; Fixed row heights", async function(assert) {
		const oTable = this.createTable();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		const iMaxScrollTop = this.getMaxScrollTop();

		const scrollWithMouseWheel = (iScrollDelta, iDeltaMode) => {
			return async () => {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				await this.oTable.qunit.vScrolled();
				await oTable.qunit.rendered();
			};
		};

		await oTable.qunit.rendered();
		await scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 1, this.iBaseRowHeight, 0, "Scrolled 20 pixels down");
		await scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)();
		this.assertPosition(assert, 3, 3 * this.iBaseRowHeight, 0, "Scrolled 2 rows down");
		await scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)();
		this.assertPosition(assert, 23, 23 * this.iBaseRowHeight, 0, "Scrolled 2 pages down");
		await scrollWithMouseWheel(9999999, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		await scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - this.iBaseRowHeight, 0, "Scrolled 20 pixels up");
		await scrollWithMouseWheel(-2, MouseWheelDeltaMode.LINE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 3, iMaxScrollTop - (3 * this.iBaseRowHeight), 0, "Scrolled 2 rows up");
		await scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 23, iMaxScrollTop - (23 * this.iBaseRowHeight), 0, "Scrolled 2 pages up");
		await scrollWithMouseWheel(-9999999, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 0, 0, 0, "Scrolled to the top");

	});

	QUnit.test("Scroll with mouse wheel; Small data; Variable row heights", async function(assert) {
		const oTable = this.createTable({
			_bVariableRowHeightEnabled: true
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		const scrollWithMouseWheel = (iScrollDelta, iDeltaMode) => {
			return async () => {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				await this.oTable.qunit.vScrolled();
				await oTable.qunit.rendered();
			};
		};

		await oTable.qunit.rendered();
		await scrollWithMouseWheel(60, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 1, this.iBaseRowHeight, 0, "Scrolled 60 pixels down");
		await scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 2, 2 * this.iBaseRowHeight, 0, "Scrolled 20 pixels down");
		await oTable.qunit.scrollVSbBy(1);
		this.assertPosition(assert, 2, 2 * this.iBaseRowHeight + 1, 1, "Scrolled 1 pixel down with the scrollbar");
		await scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)();
		this.assertPosition(assert, 4, 4 * this.iBaseRowHeight + 1, 1, "Scrolled 2 rows down");
		await scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)();
		this.assertPosition(assert, 24, 24 * this.iBaseRowHeight + 1, 1, "Scrolled 2 pages down");
		await scrollWithMouseWheel(9999999, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "Scrolled to the bottom");
		await scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 1, 4450, 597, "Scrolled 1 pixel up");
		await scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 2, 4428, 447, "Scrolled 20 pixels up");
		await scrollWithMouseWheel(-2, MouseWheelDeltaMode.LINE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 4, 4398, 248, "Scrolled 2 rows up");
		await scrollWithMouseWheel(15, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 3, 4421, 398, "Scrolled 15 pixels down");
		await scrollWithMouseWheel(-16, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 4, 4398, 248, "Scrolled 16 pixels up");
		await scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 5, 4391, 199, "Scrolled 1 pixel up");
		await scrollWithMouseWheel(-100, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 7, (iMaxFirstVisibleRow - 6) * this.iBaseRowHeight, 49, "Scrolled 100 pixels up");
		await scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 8, 4279, 49, "Scrolled 1 row up");
		await scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 9, (iMaxFirstVisibleRow - 8) * this.iBaseRowHeight, 49, "Scrolled 1 row up");
		await scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 29, (iMaxFirstVisibleRow - 28) * this.iBaseRowHeight, 49, "Scrolled 2 pages up");
		await scrollWithMouseWheel(-9999999, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 0, 0, 0, "Scrolled to the top");

	});

	QUnit.test("Scroll with mouse wheel; Large data; Fixed row heights", async function(assert) {
		const iBindingLength = 1000000000;
		const oTable = this.createTable({
			bindingLength: iBindingLength
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		const nPixelsPerRow = iMaxScrollTop / iMaxFirstVisibleRow;

		const scrollWithMouseWheel = (iScrollDelta, iDeltaMode) => {
			return () => {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return Promise.race([
					this.oTable.qunit.vScrolled().then(oTable.qunit.rendered),
					this.oTable.qunit.nextRender()
				]);
			};
		};

		await oTable.qunit.rendered();
		await scrollWithMouseWheel(this.iBaseRowHeight - 1, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 1, 1, 0, "Scrolled " + (this.iBaseRowHeight - 1) + " pixels down");
		await scrollWithMouseWheel(1, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 2, 1, 0, "Scrolled 1 pixel down");
		await scrollWithMouseWheel(500000, MouseWheelDeltaMode.PIXEL)();
		const iFirstVisibleRow1 = 2 + Math.floor(500000 / this.iBaseRowHeight);
		this.assertPosition(assert, iFirstVisibleRow1, Math.round(iFirstVisibleRow1 * nPixelsPerRow), 0, "Scrolled 500000 pixels down");
		await scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)();
		const iFirstVisibleRow2 = 4 + Math.floor(500000 / this.iBaseRowHeight);
		this.assertPosition(assert, iFirstVisibleRow2, Math.round(iFirstVisibleRow2 * nPixelsPerRow), 0, "Scrolled 2 rows down");
		await scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)();
		const iFirstVisibleRow3 = 24 + Math.floor(500000 / this.iBaseRowHeight);
		this.assertPosition(assert, iFirstVisibleRow3, Math.round(iFirstVisibleRow3 * nPixelsPerRow), 0, "Scrolled 2 pages down");
		await scrollWithMouseWheel(1000000000000, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		await scrollWithMouseWheel(-(this.iBaseRowHeight - 1), MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 1, 0, "Scrolled " + (this.iBaseRowHeight - 1) + " pixels up");
		await scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 2, iMaxScrollTop - 1, 0, "Scrolled 1 pixel up");
		await scrollWithMouseWheel(-500000, MouseWheelDeltaMode.PIXEL)();
		const iFirstVisibleRow4 = iMaxFirstVisibleRow - 2 - Math.floor(500000 / this.iBaseRowHeight);
		this.assertPosition(assert, iFirstVisibleRow4, Math.round(iFirstVisibleRow4 * nPixelsPerRow), 0, "Scrolled 500000 pixels up");
		await scrollWithMouseWheel(-2, MouseWheelDeltaMode.LINE)();
		const iFirstVisibleRow5 = iMaxFirstVisibleRow - 4 - Math.floor(500000 / this.iBaseRowHeight);
		this.assertPosition(assert, iFirstVisibleRow5, Math.round(iFirstVisibleRow5 * nPixelsPerRow), 0, "Scrolled 2 rows up");
		await scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)();
		const iFirstVisibleRow6 = iMaxFirstVisibleRow - 24 - Math.floor(500000 / this.iBaseRowHeight);
		this.assertPosition(assert, iFirstVisibleRow6, Math.round(iFirstVisibleRow6 * nPixelsPerRow), 0, "Scrolled 2 pages up");
		await scrollWithMouseWheel(-1000000000000, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
	});

	QUnit.test("Scroll with mouse wheel when the table is inside a scrollable container", async function(assert) {
		const iBindingLength = 20;
		const oTable = this.createTable({
			bindingLength: iBindingLength
		});

		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);

		const scrollWithMouseWheel = async (iScrollDelta, iDeltaMode, bTableScrolls, bContainerScrolls) => {
			const oEvent = TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, false);
			const oPreventDefaultSpy = sinon.spy(oEvent, "preventDefault");
			oTable.qunit.getDataCell(0, 0).dispatchEvent(oEvent);
			if (bTableScrolls) {
				await Promise.race([
					this.oTable.qunit.vScrolled().then(oTable.qunit.rendered),
					this.oTable.qunit.nextRender()
				]);
				assert.ok(oPreventDefaultSpy.calledOnce, "Page scrolling is prevented");
			} else {
				await wait(600);
				if (bContainerScrolls) {
					assert.ok(oPreventDefaultSpy.notCalled, "Page scrolling is not prevented");
				} else {
					assert.ok(oPreventDefaultSpy.calledOnce, "Page scrolling is prevented");
				}
			}
		};

		function wait(iMilliseconds) {
			return new Promise((resolve) => {
				setTimeout(resolve, iMilliseconds);
			});
		}

		await oTable.qunit.rendered();
		await scrollWithMouseWheel(9999999, MouseWheelDeltaMode.PIXEL, true, false);
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		await scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL, false, false);
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "The table is already scrolled to the bottom");
		await scrollWithMouseWheel(20, MouseWheelDeltaMode.PIXEL, false, true);
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "The table is already scrolled to the bottom");
		await scrollWithMouseWheel(-9999999, MouseWheelDeltaMode.PIXEL, true, false);
		this.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		await scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL, false, false);
		this.assertPosition(assert, 0, 0, 0, "The table is already scrolled to the top");
		await scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL, false, true);
		this.assertPosition(assert, 0, 0, 0, "The table is already scrolled to the top");

	});

	QUnit.test("Scroll with mouse wheel; Large data; Variable row heights", async function(assert) {
		const iBindingLength = 1000000000;
		const oTable = this.createTable({
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		const scrollWithMouseWheel = (iScrollDelta, iDeltaMode) => {
			return () => {
				oTable.qunit.getDataCell(0, 0).dispatchEvent(TableQUnitUtils.createMouseWheelEvent(iScrollDelta, iDeltaMode, false));
				return Promise.race([
					this.oTable.qunit.vScrolled().then(oTable.qunit.rendered),
					this.oTable.qunit.nextRender()
				]);
			};
		};

		await oTable.qunit.rendered();
		await scrollWithMouseWheel(this.iBaseRowHeight - 1, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 1, 1, 0, "Scrolled " + (this.iBaseRowHeight - 1) + " pixels down");
		await scrollWithMouseWheel(60, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 2, 1, 0, "Scrolled 60 pixels down");
		await scrollWithMouseWheel(2, MouseWheelDeltaMode.LINE)();
		this.assertPosition(assert, 4, 1, 0, "Scrolled 2 rows down");
		await scrollWithMouseWheel(2, MouseWheelDeltaMode.PAGE)();
		this.assertPosition(assert, 24, 1, 0, "Scrolled 2 pages down");
		await scrollWithMouseWheel(1, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 25, 1, 0, "Scrolled 1 pixels down");
		await scrollWithMouseWheel(5000000, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 102065, 102, 0, "Scrolled 5000000 pixel down");
		await scrollWithMouseWheel(1000000000000, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "Scrolled to the bottom");
		await scrollWithMouseWheel(-1, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 1, 999501, 597, "Scrolled 1 pixel up");
		await scrollWithMouseWheel(-20, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 2, 999479, 447, "Scrolled 20 pixels up");
		await scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 3, 999472, 398, "Scrolled 1 row up");
		await scrollWithMouseWheel(1, MouseWheelDeltaMode.LINE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 2, 999479, 447, "Scrolled 1 row down");
		await scrollWithMouseWheel(-1, MouseWheelDeltaMode.PAGE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 12, 999412, 49, "Scrolled 1 page up");
		await scrollWithMouseWheel(15, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 11, 999412, 49, "Scrolled 15 pixels down");
		await scrollWithMouseWheel(-16, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 12, 999412, 49, "Scrolled 16 pixels up");
		await scrollWithMouseWheel(-100, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 14, 999412, 49, "Scrolled 100 pixels up");
		await scrollWithMouseWheel(-1, MouseWheelDeltaMode.LINE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 15, 999412, 49, "Scrolled 1 row up");
		await scrollWithMouseWheel(-2, MouseWheelDeltaMode.PAGE)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 35, 999412, 49, "Scrolled 2 pages up");
		await scrollWithMouseWheel(-5000000, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 999897920, 999310, 49, "Scrolled 5000000 pixels up");
		await scrollWithMouseWheel(-1000000000000, MouseWheelDeltaMode.PIXEL)();
		this.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
	});

	QUnit.test("Handling of mouse wheel events that do scroll", async function(assert) {
		const oTable = this.createTable({
			fixedColumnCount: 1,
			rowActionCount: 1,
			rowActionTemplate: TableQUnitUtils.createRowAction()
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});
		let oWheelEvent;
		let oStopPropagationSpy;

		const test = async (mConfig) => {
			await oTable.qunit.scrollVSbTo(0);
			oWheelEvent = TableQUnitUtils.createMouseWheelEvent(20, MouseWheelDeltaMode.PIXEL, false);
			oStopPropagationSpy = sinon.spy(oWheelEvent, "stopPropagation");
			mConfig.element.dispatchEvent(oWheelEvent);
			await oTable.qunit.vScrolled();
			this.assertPosition(assert, 1, 49, 0, "Mouse Wheel - " + mConfig.name + ": Scrolled");
			assert.ok(oWheelEvent.defaultPrevented, "Mouse Wheel - " + mConfig.name + ": Default action was prevented");
			assert.ok(oStopPropagationSpy.calledOnce, "Mouse Wheel - " + mConfig.name + ": Propagation was stopped");
		};

		await oTable.qunit.rendered();

		const aTestConfigs = [
			{name: "Cell in fixed column", element: oTable.qunit.getDataCell(0, 0)},
			{name: "Cell in scrollable column", element: oTable.qunit.getDataCell(0, 1)},
			{name: "Row header cell", element: oTable.qunit.getRowHeaderCell(0)},
			{name: "Row action cell", element: oTable.qunit.getRowActionCell(0)},
			{name: "Content in fixed column cell", element: oTable.qunit.getDataCell(0, 0).firstElementChild},
			{name: "Content in scrollable column cell", element: oTable.qunit.getDataCell(0, 1).firstElementChild},
			{name: "Content in row action cell", element: oTable.qunit.getRowActionCell(0).firstElementChild}
		];

		for (const mConfig of aTestConfigs) {
			await test(mConfig);
		}
	});

	QUnit.test("Handling of mouse wheel events that do not scroll", async function(assert) {
		const oTable = this.createTable({
			title: "test",
			extension: [new HeightControl()],
			footer: new HeightControl()
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});

		const test = async (mConfig) => {
			const iScrollDelta = mConfig.scrollDelta == null ? 50 : mConfig.scrollDelta;
			const oWheelEvent = TableQUnitUtils.createMouseWheelEvent(iScrollDelta, MouseWheelDeltaMode.PIXEL, false);
			const oStopPropagationSpy = sinon.spy(oWheelEvent, "stopPropagation");
			const iExpectedFirstVisibleRow = mConfig.firstVisibleRow == null ? 0 : mConfig.firstVisibleRow;
			const iExpectedScrollTop = mConfig.scrollTop == null ? 0 : mConfig.scrollTop;

			mConfig.element.dispatchEvent(oWheelEvent);

			await TableQUnitUtils.sleep(600);
			this.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollTop, 0,
				"Mouse Wheel - " + mConfig.name + ": Not scrolled");
			assert.ok(!oWheelEvent.defaultPrevented, "Mouse Wheel - " + mConfig.name + ": Default action was not prevented");
			assert.ok(oStopPropagationSpy.notCalled, "Mouse Wheel - " + mConfig.name + ": Propagation was not stopped");
		};

		await oTable.qunit.rendered();

		const oDomRef = oTable.getDomRef();
		const aTestConfigs = [
			{name: "Horizontal scrollbar", element: oTable._getScrollExtension().getHorizontalScrollbar()},
			{name: "Column header container", element: oDomRef.querySelector(".sapUiTableColHdrCnt")},
			{name: "Extension container", element: oDomRef.querySelector(".sapUiTableExt")},
			{name: "Footer container", element: oDomRef.querySelector(".sapUiTableFtr")}
		];

		for (const mConfig of aTestConfigs) {
			await test(mConfig);
		}

		await test({
			name: "Scrolling up if already scrolled to top",
			element: oTable.qunit.getDataCell(0, 1),
			scrollDelta: -50
		});

		await oTable.qunit.scrollVSbTo(9999999);
		await test({
			name: "Scrolling down if already scrolled to bottom",
			element: oTable.qunit.getDataCell(0, 1),
			scrollDelta: 50,
			firstVisibleRow: 90,
			scrollTop: 90 * oTable._getBaseRowHeight()
		});
	});

	QUnit.test("Scroll with touch; Small data; Fixed row heights", async function(assert) {
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const oTable = this.createTable();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		const iMaxScrollTop = this.getMaxScrollTop();

		const scrollWithTouch = (iScrollDelta) => {
			return async () => {
				TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				await this.oTable.qunit.vScrolled();
				await oTable.qunit.rendered();
			};
		};

		await oTable.qunit.rendered();
		oTable.qunit.preventFocusOnTouch();
		TableQUnitUtils.startTouchScrolling(oTable.qunit.getDataCell(0, 0));
		await scrollWithTouch(20)();
		this.assertPosition(assert, 0, 20, 0, "Scrolled 20 pixels down");
		await scrollWithTouch(30)();
		this.assertPosition(assert, 1, 50, 0, "Scrolled 30 pixels down");
		await scrollWithTouch(-30)();
		this.assertPosition(assert, 0, 20, 0, "Scrolled 30 pixels up");
		await scrollWithTouch(-100, true, "Scrolled to the top")();
		this.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		await scrollWithTouch(iMaxScrollTop + 100, true, "Scrolled to the bottom")();
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		await scrollWithTouch(-50)();
		this.assertPosition(assert, iMaxFirstVisibleRow - 1, iMaxScrollTop - 30, 0, "Scrolled 30 pixels up");
		TableQUnitUtils.endTouchScrolling();

		Device.support.pointer = bOriginalPointerSupport;
		Device.support.touch = bOriginalTouchSupport;
	});

	QUnit.test("Scroll with touch; Small data; Variable row heights", async function(assert) {
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const oTable = this.createTable({
			_bVariableRowHeightEnabled: true
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		const scrollWithTouch = (iScrollDelta) => {
			return async () => {
				TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				await this.oTable.qunit.vScrolled();
				await oTable.qunit.rendered();
			};
		};

		await oTable.qunit.rendered();
		oTable.qunit.preventFocusOnTouch();
		TableQUnitUtils.startTouchScrolling(oTable.qunit.getDataCell(0, 0));
		await scrollWithTouch(20)();
		this.assertPosition(assert, 0, 20, 20, "Scrolled 20 pixels down");
		await scrollWithTouch(30)();
		this.assertPosition(assert, 1, 50, 3, "Scrolled 30 pixels down");
		await scrollWithTouch(-30)();
		this.assertPosition(assert, 0, 20, 20, "Scrolled 30 pixels up");
		await scrollWithTouch(-100, true, "Scrolled to the top")();
		this.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		await scrollWithTouch(4559, true, "Scrolled to the bottom")();
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655, "Scrolled to the bottom");
		await scrollWithTouch(-50)();
		this.assertPosition(assert, 93, 4429, 454, "Scrolled 30 pixels up");
		await scrollWithTouch(-100)();
		this.assertPosition(assert, 88, 4329, 17, "Scrolled 100 pixels up");
		await scrollWithTouch(-50)();
		this.assertPosition(assert, 87, 4279, 49, "Scrolled 50 pixels up");
		TableQUnitUtils.endTouchScrolling();

		Device.support.pointer = bOriginalPointerSupport;
		Device.support.touch = bOriginalTouchSupport;
	});

	QUnit.test("Scroll with touch; Large data; Fixed row heights;", async function(assert) {
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const iBindingLength = 100000000;
		const oTable = this.createTable({
			bindingLength: iBindingLength
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength);
		const nScrollRangeRowFraction = iMaxScrollTop / iMaxFirstVisibleRow;
		const nSensitivityFactor = Math.max(0.002, Math.min(1, nScrollRangeRowFraction / this.iBaseRowHeight));
		const iRowsPerPixel = iMaxFirstVisibleRow / iMaxScrollTop;

		const scrollWithTouch = (iScrollDelta) => {
			return async () => {
				TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				await this.oTable.qunit.vScrolled();
				await oTable.qunit.rendered();
			};
		};

		await oTable.qunit.rendered();
		oTable.qunit.preventFocusOnTouch();
		TableQUnitUtils.startTouchScrolling(oTable.qunit.getDataCell(0, 0));
		await scrollWithTouch(500)();
		const iScrollTop1 = Math.round(500 * nSensitivityFactor);
		this.assertPosition(assert, Math.floor(iScrollTop1 * iRowsPerPixel), iScrollTop1, 0, "Scrolled 500 pixels down");
		await scrollWithTouch(499500)();
		const iScrollTop2 = Math.round(500000 * nSensitivityFactor);
		this.assertPosition(assert, Math.floor(iScrollTop2 * iRowsPerPixel), iScrollTop2, 0, "Scrolled 499.500 pixels down");
		await scrollWithTouch(-500000)();
		this.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		await scrollWithTouch(iMaxScrollTop / nSensitivityFactor)();
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0, "Scrolled to the bottom");
		await scrollWithTouch(-50000)();
		const iScrollTop3 = Math.round(iMaxScrollTop - 50000 * nSensitivityFactor);
		// iRowsPerPixel can be very large here (~200): a 1px scrollbar slack amplifies into many rows.
		this.assertPosition(assert, Math.floor(iScrollTop3 * iRowsPerPixel), iScrollTop3, 0, "Scrolled 50.000 pixels up",
			Math.ceil(iRowsPerPixel));
		await scrollWithTouch(-500000)();
		const iScrollTop4 = Math.round(iMaxScrollTop - 550000 * nSensitivityFactor);
		this.assertPosition(assert, Math.floor(iScrollTop4 * iRowsPerPixel), iScrollTop4, 0,
			"Scrolled 500000 pixels up", Math.ceil(iRowsPerPixel));
		TableQUnitUtils.endTouchScrolling();

		Device.support.pointer = bOriginalPointerSupport;
		Device.support.touch = bOriginalTouchSupport;
	});

	QUnit.test("Scroll with touch; Large data; Variable row heights", async function(assert) {
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const iBindingLength = 300000;
		const oTable = this.createTable({
			bindingLength: iBindingLength,
			_bVariableRowHeightEnabled: true
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		// For variable row heights, the scroll range without buffer determines the non-buffer row mapping.
		// buffer = VERTICAL_OVERFLOW_BUFFER_LENGTH(2) * iBaseRowHeight(49) = 98
		const iScrollRangeWithoutBuffer = iMaxScrollTop - 98;
		const iVirtualRowCount = iBindingLength - 10; // _fullsize = 10
		const nScrollRangeRowFraction = iScrollRangeWithoutBuffer / iVirtualRowCount;
		const nSensitivityFactor = Math.max(0.002, Math.min(1, nScrollRangeRowFraction / this.iBaseRowHeight));

		// Touch deltas are multiplied by the sensitivity factor to obtain the effective scrollbar position.
		const scrollWithTouch = (iScrollDelta) => {
			return async () => {
				TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				await this.oTable.qunit.vScrolled();
				await oTable.qunit.rendered();
			};
		};

		await oTable.qunit.rendered();
		oTable.qunit.preventFocusOnTouch();
		TableQUnitUtils.startTouchScrolling(oTable.qunit.getDataCell(0, 0));
		await scrollWithTouch(500)();
		const iScrollTop1 = Math.round(500 * nSensitivityFactor);
		this.assertPosition(assert, Math.floor(iScrollTop1 / nScrollRangeRowFraction), iScrollTop1, 10, "Scrolled 500 pixels down");
		await scrollWithTouch(499500)();
		const iScrollTop2 = Math.round(500000 * nSensitivityFactor);
		this.assertPosition(assert, Math.floor(iScrollTop2 / nScrollRangeRowFraction), iScrollTop2, 8, "Scrolled 499500 pixels down");
		await scrollWithTouch(-500000)();
		this.assertPosition(assert, 0, 0, 0, "Scrolled to the top");
		await scrollWithTouch(iMaxScrollTop / nSensitivityFactor)();
		const iScrollTop3 = iMaxScrollTop;
		this.assertPosition(assert, iMaxFirstVisibleRow, iScrollTop3, 655, "Scrolled to the bottom");
		await scrollWithTouch(-50000)();
		const iScrollTop4 = Math.round((iMaxScrollTop / nSensitivityFactor - 50000) * nSensitivityFactor);
		this.assertPosition(assert, Math.floor(iScrollTop4 / nScrollRangeRowFraction), iScrollTop4, 23, "Scrolled 50000 pixels up");
		await scrollWithTouch(-500000)();
		const iScrollTop5 = Math.round((iMaxScrollTop / nSensitivityFactor - 550000) * nSensitivityFactor);
		this.assertPosition(assert, Math.floor(iScrollTop5 / nScrollRangeRowFraction), iScrollTop5, 49,
			"Scrolled 550000 pixels up");
		TableQUnitUtils.endTouchScrolling();

		Device.support.pointer = bOriginalPointerSupport;
		Device.support.touch = bOriginalTouchSupport;
	});

	QUnit.test("Handling of touch events that do scroll", async function(assert) {
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const oTable = this.createTable({
			fixedColumnCount: 1,
			rowActionCount: 1,
			rowActionTemplate: TableQUnitUtils.createRowAction()
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});
		let oTouchMoveEvent;
		let oStopPropagationSpy;

		const test = async (mConfig) => {
			await oTable.qunit.scrollVSbTo(0);
			TableQUnitUtils.startTouchScrolling(mConfig.element);
			oTouchMoveEvent = TableQUnitUtils.doTouchScrolling(0, 20);
			TableQUnitUtils.endTouchScrolling();
			oStopPropagationSpy = sinon.spy(oTouchMoveEvent, "stopPropagation");
			await oTable.qunit.vScrolled();
			this.assertPositionWithMomentumScroll(assert, 0, 20, 0, "Touch - " + mConfig.name + ": Scrolled");
			assert.ok(oTouchMoveEvent.defaultPrevented, "Touch - " + mConfig.name + ": Default action was prevented");
			assert.ok(oStopPropagationSpy.notCalled, "Touch - " + mConfig.name + ": Propagation was not stopped");
			TableQUnitUtils.startTouchScrolling(mConfig.element);
			TableQUnitUtils.endTouchScrolling();
		};

		oTable.qunit.preventFocusOnTouch();

		try {
			await oTable.qunit.rendered();

			const aTestConfigs = [
				{name: "Cell in fixed column", element: oTable.qunit.getDataCell(0, 0)},
				{name: "Cell in scrollable column", element: oTable.qunit.getDataCell(0, 1)},
				{name: "Row header cell", element: oTable.qunit.getRowHeaderCell(0)},
				{name: "Row action cell", element: oTable.qunit.getRowActionCell(0)},
				{name: "Content in fixed column cell", element: oTable.qunit.getDataCell(0, 0).firstElementChild},
				{name: "Content in scrollable column cell", element: oTable.qunit.getDataCell(0, 1).firstElementChild},
				{name: "Content in row action cell", element: oTable.qunit.getRowActionCell(0).firstElementChild}
			];

			for (const mConfig of aTestConfigs) {
				await test(mConfig);
			}

			await oTable.qunit.scrollVSbTo(0);
			const iMaxScrollTop = this.getMaxScrollTop();

			const testOutsideBoundaries = async (iScrollDelta) => {
				oTouchMoveEvent = TableQUnitUtils.doTouchScrolling(0, iScrollDelta);
				oStopPropagationSpy = sinon.spy(oTouchMoveEvent, "stopPropagation");

				await TableQUnitUtils.sleep(100);
				assert.ok(oTouchMoveEvent.defaultPrevented, "Touch - Scrolled further than the maximum: Default action was prevented");
				assert.ok(oStopPropagationSpy.notCalled, "Touch - Scrolled further than the maximum: Propagation was not stopped");
			};

			TableQUnitUtils.startTouchScrolling(aTestConfigs[0].element);

			await testOutsideBoundaries(iMaxScrollTop + 100);
			await testOutsideBoundaries(100);
			await testOutsideBoundaries(-iMaxScrollTop - 300);
			await testOutsideBoundaries(-100);
			TableQUnitUtils.endTouchScrolling();
		} finally {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		}
	});

	QUnit.test("Handling of touch events that do not scroll", async function(assert) {
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		const oTable = this.createTable({
			extension: [new HeightControl()],
			footer: new HeightControl()
		}, function(oTable) {
			oTable.addColumn(new Column({template: new HeightControl()}));
		});

		const test = async (mConfig) => {
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

			await TableQUnitUtils.sleep(100);
			this.assertPosition(assert, iExpectedFirstVisibleRow, iExpectedScrollTop, 0, "Touch - " + mConfig.name + ": Not scrolled");
			assert.ok(!oTouchMoveEvent.defaultPrevented, "Touch - " + mConfig.name + ": Default action was not prevented");
			assert.ok(oStopPropagationSpy.notCalled, "Touch - " + mConfig.name + ": Propagation was not stopped");
		};

		oTable.qunit.preventFocusOnTouch();

		try {
			await oTable.qunit.rendered();

			const oDomRef = oTable.getDomRef();
			const aTestConfigs = [
				{name: "Horizontal scrollbar", element: oTable._getScrollExtension().getHorizontalScrollbar()},
				{name: "Column header container", element: oDomRef.querySelector(".sapUiTableColHdrCnt")},
				{name: "Extension container", element: oDomRef.querySelector(".sapUiTableExt")},
				{name: "Footer container", element: oDomRef.querySelector(".sapUiTableFtr")}
			];

			for (const mConfig of aTestConfigs) {
				await test(mConfig);
			}

			await test({
				name: "Scrolling up if already scrolled to top",
				element: oTable.qunit.getDataCell(0, 1),
				scrollDelta: -50
			});
			await test({
				skipStartTouchScrolling: true,
				name: "Scrolling back down",
				element: oTable.qunit.getDataCell(0, 1),
				scrollDelta: 100
			});

			await oTable.qunit.scrollVSbTo(9999999);
			await test({
				name: "Scrolling down if already scrolled to bottom",
				element: oTable.qunit.getDataCell(0, 1),
				scrollDelta: 50,
				firstVisibleRow: 90,
				scrollTop: 90 * oTable._getBaseRowHeight()
			});
			await test({
				skipStartTouchScrolling: true,
				name: "Scrolling back up",
				element: oTable.qunit.getDataCell(0, 1),
				scrollDelta: -100,
				firstVisibleRow: 90,
				scrollTop: 90 * oTable._getBaseRowHeight()
			});
		} finally {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		}
	});

	QUnit.test("Scroll the viewport; Tiny data; Variable row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(10, true);
		const iMaxScrollTop = this.getMaxScrollTop(10, true);

		const scrollViewport = (iScrollTop) => {
			return () => {
				this.oTable.getDomRef("tableCCnt").scrollTop = iScrollTop;
				return this.oTable.qunit.vScrolled();
			};
		};

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			await scrollViewport(100)();
			this.assertPosition(assert, 1, 19, 100,
				mConfig.rowMode + ", Scrolled viewport to 100");
			await scrollViewport(1000)();
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655 - 150 + this.iBaseRowHeight,
				mConfig.rowMode + "Scrolled viewport to MAX");
			await scrollViewport(0)();
			this.assertPosition(assert, 0, 0, 0,
				mConfig.rowMode + ", Scrolled viewport to 0");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll the viewport; Small data; Variable row heights", async function(assert) {
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow();
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		const scrollViewport = (iScrollTop) => {
			return () => {
				this.oTable.getDomRef("tableCCnt").scrollTop = iScrollTop;
				return this.oTable.qunit.vScrolled();
			};
		};

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			await scrollViewport(100)();
			this.assertPosition(assert, 1, 66, 100,
				mConfig.rowMode + ", Scrolled viewport to 100 when scrolled to top");
			await scrollViewport(1000)();
			this.assertPosition(assert, 5, 280, 655 - 150 + this.iBaseRowHeight,
				mConfig.rowMode + ", Scrolled viewport to MAX when scrolled to top");
			await scrollViewport(0)();
			this.assertPosition(assert, 0, 0, 0,
				mConfig.rowMode + ", Scrolled viewport to 0 when scrolled to top");
			await oTable.qunit.scrollVSbTo(9999999);
			await scrollViewport(180)();
			this.assertPosition(assert, iMaxFirstRenderedRow + 1, 4388, 180,
				mConfig.rowMode + ", Scrolled viewport to 100 when scrolled to bottom");
			await scrollViewport(1000)();
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655,
				mConfig.rowMode + ", Scrolled viewport to MAX when scrolled to bottom");
			await scrollViewport(0)();
			this.assertPosition(assert, iMaxFirstRenderedRow, iMaxScrollTop - 98, 0,
				mConfig.rowMode + ", Scrolled viewport to 0 when scrolled to bottom");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll the viewport; Large data; Variable row heights", async function(assert) {
		const iBindingLength = 1000000000;
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(iBindingLength, true);
		const iMaxFirstRenderedRow = this.getMaxFirstRenderedRow(iBindingLength);
		const iMaxScrollTop = this.getMaxScrollTop(iBindingLength, true);

		const scrollViewport = (iScrollTop, bExpectScrollbarScrolling) => {
			return () => {
				this.oTable.getDomRef("tableCCnt").scrollTop = iScrollTop;

				if (bExpectScrollbarScrolling) {
					return this.oTable.qunit.vScrolled();
				} else {
					return this.oTable.qunit.viewportScrolled();
				}
			};
		};

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			await scrollViewport(100, true)();
			this.assertPosition(assert, 1, 1, 100,
				mConfig.rowMode + ", Scrolled viewport to 100 when scrolled to top");
			await scrollViewport(1000, false)();
			this.assertPosition(assert, 5, 1, 655 - 150 + this.iBaseRowHeight,
				mConfig.rowMode + "Scrolled viewport to MAX when scrolled to top");
			await scrollViewport(0, true)();
			this.assertPosition(assert, 0, 0, 0,
				mConfig.rowMode + ", Scrolled viewport to 0 when scrolled to top");
			await oTable.qunit.scrollVSbTo(9999999);
			await scrollViewport(180, true)();
			this.assertPosition(assert, iMaxFirstRenderedRow + 1, 999439, 180,
				mConfig.rowMode + ", Scrolled viewport to 100 when scrolled to bottom");
			await scrollViewport(1000, true)();
			this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655,
				mConfig.rowMode + "Scrolled viewport to MAX when scrolled to bottom");
			await scrollViewport(0, true)();
			this.assertPosition(assert, iMaxFirstRenderedRow, iMaxScrollTop - 98, 0,
				mConfig.rowMode + ", Scrolled viewport to 0 when scrolled to bottom");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll row-wise with #scrollVertically; Small data; Fixed row heights", async function(assert) {
		const oTable = this.createTable();

		await this.oTable.qunit.rendered();
		oTable._getScrollExtension().scrollVertically(true, false);
		await oTable.qunit.rendered();
		this.assertPosition(assert, 1, this.iBaseRowHeight, 0);
		oTable._getScrollExtension().scrollVertically(false, false);
		await oTable.qunit.rendered();
		this.assertPosition(assert, 0, 0, 0);
	});

	QUnit.test("Scroll row-wise with #scrollVertically; Small data; Variable row heights", async function(assert) {
		const oTable = this.createTable({
			_bVariableRowHeightEnabled: true
		});

		await this.oTable.qunit.rendered();
		oTable._getScrollExtension().scrollVertically(true, false);
		await oTable.qunit.rendered();
		this.assertPosition(assert, 7, 362, 655);
		oTable._getScrollExtension().scrollVertically(false, false);
		await oTable.qunit.rendered();
		this.assertPosition(assert, 0, 0, 0);
	});

	QUnit.test("Scroll page-wise with #scrollVertically; Small data; Fixed row heights", async function(assert) {
		const oTable = this.createTable();

		await this.oTable.qunit.rendered();
		oTable._getScrollExtension().scrollVertically(true, true);
		await oTable.qunit.rendered();
		this.assertPosition(assert, 10, 490, 0);
		oTable._getScrollExtension().scrollVertically(false, true);
		await oTable.qunit.rendered();
		this.assertPosition(assert, 0, 0, 0);
	});

	QUnit.test("Scroll page-wise with #scrollVertically; Small data; Variable row heights", async function(assert) {
		const oTable = this.createTable({
			_bVariableRowHeightEnabled: true
		});

		await this.oTable.qunit.rendered();
		oTable._getScrollExtension().scrollVertically(true, true);
		await oTable.qunit.rendered();
		this.assertPosition(assert, 17, 852, 655);
		oTable._getScrollExtension().scrollVertically(false, true);
		await oTable.qunit.rendered();
		this.assertPosition(assert, 0, 0, 0);
	});

	QUnit.test("Scroll to top and bottom with #scrollVerticallyMax; Small data; Fixed row heights", async function(assert) {
		const oTable = this.createTable();
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow();
		const iMaxScrollTop = this.getMaxScrollTop();

		await this.oTable.qunit.rendered();
		oTable._getScrollExtension().scrollVerticallyMax(true);
		await oTable.qunit.rendered();
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 0);
		oTable._getScrollExtension().scrollVerticallyMax(false);
		await oTable.qunit.rendered();
		this.assertPosition(assert, 0, 0, 0);
	});

	QUnit.test("Scroll to top and bottom with #scrollVerticallyMax; Small data; Variable row heights", async function(assert) {
		const oTable = this.createTable({
			_bVariableRowHeightEnabled: true
		});
		const iMaxFirstVisibleRow = this.getMaxFirstVisibleRow(null, true);
		const iMaxScrollTop = this.getMaxScrollTop(null, true);

		await this.oTable.qunit.rendered();
		oTable._getScrollExtension().scrollVerticallyMax(true);
		await oTable.qunit.rendered();
		this.assertPosition(assert, iMaxFirstVisibleRow, iMaxScrollTop, 655);
		oTable._getScrollExtension().scrollVerticallyMax(false);
		await oTable.qunit.rendered();
		this.assertPosition(assert, 0, 0, 0);
	});

	QUnit.test("Restore scroll position after setting ScrollTop; Tiny data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (let i = 0; i < aRowModeConfigs.length; i++) {
			await test({
				title: "ScrollTop = 1",
				scrollTop: 1
			});
			await test({
				title: "ScrollTop = 50",
				scrollTop: 50
			});
			await test({
				title: "ScrollTop = MAX",
				scrollTop: 9999999
			});
		}

	});

	QUnit.test("Restore scroll position after setting ScrollTop; Small data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode
			});

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "ScrollTop = 1",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 1
			});
			await test({
				title: "ScrollTop = 123",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 123
			});
			await test({
				title: "ScrollTop = MAX",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 9999999
			});
			await test({
				title: "ScrollTop = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: this.getMaxScrollTop() - 1
			});
		}

	});

	QUnit.test("Restore scroll position after setting ScrollTop; Small data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "ScrollTop = 1",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 1
			});
			await test({
				title: "ScrollTop = 123",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 123
			});
			await test({
				title: "ScrollTop = MAX",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 9999999
			});
			await test({
				title: "ScrollTop = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: this.getMaxScrollTop() - 1
			});
		}

	});

	QUnit.test("Restore scroll position after setting ScrollTop; Large data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000
			});

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "ScrollTop = 1",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 1
			});
			await test({
				title: "ScrollTop = 500000",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 500000
			});
			await test({
				title: "ScrollTop = MAX",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 9999999
			});
			await test({
				title: "ScrollTop = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: this.getMaxScrollTop(1000000000) - 1
			});
		}

	});

	QUnit.test("Restore scroll position after setting ScrollTop; Large data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(mConfig.scrollTop);
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "ScrollTop = 1",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 1
			});
			await test({
				title: "ScrollTop = 500000",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 500000
			});
			await test({
				title: "ScrollTop = MAX",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: 9999999
			});
			await test({
				title: "ScrollTop = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				scrollTop: this.getMaxScrollTop(1000000000, true) - 1
			});
		}

	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Tiny data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			await oTable.qunit.vScrolled();
			await oTable.qunit.rendered();
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 1
			});
			await test({
				title: "FirstVisibleRow = 3",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 3
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 7
			});
		}

	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Small data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode
			});

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			await oTable.qunit.rendered();
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 1
			});
			await test({
				title: "FirstVisibleRow = 33",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 33
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: this.mDefaultSettings.bindingLength
			});
			await test({
				title: "FirstVisibleRow = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: this.getMaxFirstVisibleRow() - 1
			});
		}

	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Small data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			await oTable.qunit.rendered();
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 1
			});
			await test({
				title: "FirstVisibleRow = 33",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 33
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: this.mDefaultSettings.bindingLength
			});
			await test({
				title: "FirstVisibleRow = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: this.getMaxFirstVisibleRow() - 1
			});
		}

	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Large data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000
			});

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			await oTable.qunit.rendered();
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 1
			});
			await test({
				title: "FirstVisibleRow = 500000000",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 500000000
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 1000000000
			});
			await test({
				title: "FirstVisibleRow = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: this.getMaxFirstVisibleRow(1000000000) - 1
			});
		}

	});

	QUnit.test("Restore scroll position after setting FirstVisibleRow; Large data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});

			await oTable.qunit.rendered();
			oTable.setFirstVisibleRow(mConfig.firstVisibleRow);
			await oTable.qunit.rendered();
			await this.testRestoration(assert, mConfig.rowMode + ", " + mConfig.title);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				title: "FirstVisibleRow = 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 1
			});
			await test({
				title: "FirstVisibleRow = 500000000",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 500000000
			});
			await test({
				title: "FirstVisibleRow = MAX",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: 1000000000
			});
			await test({
				title: "FirstVisibleRow = MAX - 1",
				rowMode: oRowModeConfig.rowMode,
				firstVisibleRow: this.getMaxFirstVisibleRow(1000000000) - 1
			});
		}

	});

	QUnit.test("Restore scroll position after changing the row heights; Tiny data; Variable row heights", async function(assert) {

		const changeRowHeights = (iHeightA, iHeightB) => {
			return () => {
				this.changeRowHeights(iHeightA, iHeightB);
				return this.oTable.qunit.rendered();
			};
		};

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", Changed row heights";

			await oTable.qunit.rendered();
			await changeRowHeights(100, 175)();
			this.assertPosition(assert, 0, 0, 0, sTitle + " when scrolled to top");
			await oTable.qunit.scrollVSbTo(9999999);
			await changeRowHeights(90, 125)();
			this.assertPosition(assert, 5, 98, 595, sTitle + " when scrolled to bottom");
			await changeRowHeights(100, 175)();
			this.assertPosition(assert, 5, 79, 725, sTitle + " when scrolled to bottom");
			await oTable.qunit.scrollVSbTo(50);
			await changeRowHeights(80, 100)();
			this.assertPosition(assert, 3, 80, 342, sTitle);
			await changeRowHeights(150, 150)();
			this.assertPosition(assert, 3, 51, 532, sTitle);
			await changeRowHeights(5, 5)();
			this.assertPosition(assert, 0, 0, 0, sTitle);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after changing the row heights; Small data; Variable row heights", async function(assert) {

		const changeRowHeights = (iHeightA, iHeightB) => {
			return () => {
				this.changeRowHeights(iHeightA, iHeightB);
				return this.oTable.qunit.rendered();
			};
		};

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", Changed row heights";

			await oTable.qunit.rendered();
			await changeRowHeights(100, 175)();
			this.assertPosition(assert, 0, 0, 0, sTitle + " when scrolled to top");
			await oTable.qunit.scrollVSbTo(9999999);
			await changeRowHeights(90, 125)();
			this.assertPosition(assert, 95, 4459, 721, sTitle + " when scrolled to bottom");
			await changeRowHeights(5, 5)();
			this.assertPosition(assert, 90, 4459, this.iBaseRowHeight, sTitle + " when scrolled to bottom");
			await changeRowHeights(100, 175)();
			this.assertPosition(assert, 90, 4377, 176, sTitle + " when scrolled to bottom");
			await oTable.qunit.scrollVSbTo(500);
			await changeRowHeights(80, 100)();
			this.assertPosition(assert, 10, 503, 21, sTitle);
			await changeRowHeights(150, 150)();
			this.assertPosition(assert, 10, 497, 21, sTitle);
			await changeRowHeights(5, 5)();
			this.assertPosition(assert, 10, 511, 21, sTitle);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after changing the row heights; Large data; Variable row heights", async function(assert) {

		const changeRowHeights = (iHeightA, iHeightB) => {
			return () => {
				this.changeRowHeights(iHeightA, iHeightB);
				return this.oTable.qunit.rendered();
			};
		};

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", Changed row heights";

			await oTable.qunit.rendered();
			await changeRowHeights(100, 175)();
			this.assertPosition(assert, 0, 0, 0, sTitle + " when scrolled to top");
			await oTable.qunit.scrollVSbTo(9999999);
			await changeRowHeights(90, 125)();
			this.assertPosition(assert, 999999995, 999510, 721, sTitle + " when scrolled to bottom");
			await changeRowHeights(5, 5)();
			this.assertPosition(assert, 999999990, 999510, this.iBaseRowHeight, sTitle + " when scrolled to bottom");
			await changeRowHeights(100, 175)();
			this.assertPosition(assert, 999999990, 999428, 176, sTitle + " when scrolled to bottom");
			await oTable.qunit.scrollVSbTo(500);
			await changeRowHeights(80, 100)();
			this.assertPosition(assert, 500294, 500, 17, sTitle);
			await changeRowHeights(150, 150)();
			this.assertPosition(assert, 500294, 500, 17, sTitle);
			await changeRowHeights(5, 5)();
			this.assertPosition(assert, 500294, 500, 17, sTitle);

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after changing the row count; Tiny data; Variable row heights", async function(assert) {

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(50);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 46, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count increased");
			setRowCount(mConfig.rowMode, 11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 55, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count increased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count decreased");
			await oTable.qunit.scrollVSbTo(9999999);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 89, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After visible row count increased");
			setRowCount(mConfig.rowMode, 11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition - this.iBaseRowHeight,
				sTitle + "ScrollTop = MAX; After visible row count increased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 88, iInnerScrollPosition - this.iBaseRowHeight,
				sTitle + "ScrollTop = MAX; After visible row count decreased");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after changing the row count; Small data; Fixed row heights", async function(assert) {

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(50);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count increased");
			setRowCount(mConfig.rowMode, 11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count increased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count decreased");
			await oTable.qunit.scrollVSbTo(9999999);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = MAX; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = MAX; After visible row count increased");
			setRowCount(mConfig.rowMode, 11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - this.iBaseRowHeight, 0,
				sTitle + "ScrollTop = MAX; After visible row count increased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - this.iBaseRowHeight, 0,
				sTitle + "ScrollTop = MAX; After visible row count decreased");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after changing the row count; Small data; Variable row heights", async function(assert) {

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(50);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count increased");
			setRowCount(mConfig.rowMode, 11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count increased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count decreased");
			await oTable.qunit.scrollVSbTo(9999999);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 4499, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After visible row count increased");
			setRowCount(mConfig.rowMode, 11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition - this.iBaseRowHeight, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After visible row count increased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 4452, iInnerScrollPosition - this.iBaseRowHeight,
				sTitle + "ScrollTop = MAX; After visible row count decreased");
			setRowCount(mConfig.rowMode, 30);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 85, iScrollPosition - (20 * this.iBaseRowHeight), 1665,
				sTitle + "ScrollTop = MAX; After visible row count increased");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after changing the row count; Large data; Fixed row heights", async function(assert) {

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;

			await oTable.qunit.rendered();
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "ScrollTop = 0; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "ScrollTop = 0; After visible row count increased");
			await oTable.qunit.scrollVSbTo(50);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count increased");
			setRowCount(mConfig.rowMode, 11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count increased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, sTitle + "ScrollTop = 50; After visible row count decreased");
			await oTable.qunit.scrollVSbTo(9999999);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition + this.iBaseRowHeight - 1, 0,
				sTitle + "ScrollTop = MAX; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = MAX; After visible row count increased");
			setRowCount(mConfig.rowMode, 11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - this.iBaseRowHeight, 0,
				sTitle + "ScrollTop = MAX; After visible row count increased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - 1, 0,
				sTitle + "ScrollTop = MAX; After visible row count decreased");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after changing the row count; Large data; Variable row heights", async function(assert) {

		function setRowCount(oRowMode, iRowCount) {
			if (oRowMode instanceof FixedRowMode) {
				oRowMode.setRowCount(iRowCount);
			} else if (oRowMode instanceof AutoRowMode) {
				oRowMode.setMinRowCount(iRowCount);
				oRowMode.setMaxRowCount(iRowCount);
			}
		}

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 1000000000,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			await oTable.qunit.rendered();
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "ScrollTop = 0; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "ScrollTop = 0; After visible row count increased");
			await oTable.qunit.scrollVSbTo(50);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count increased");
			setRowCount(mConfig.rowMode, 11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count increased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 50; After visible row count decreased");
			await oTable.qunit.scrollVSbTo(9999999);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			setRowCount(mConfig.rowMode, 9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 999550, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After visible row count decreased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After visible row count increased");
			setRowCount(mConfig.rowMode, 11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition - this.iBaseRowHeight, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After visible row count increased");
			setRowCount(mConfig.rowMode, 10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 999503, iInnerScrollPosition - this.iBaseRowHeight,
				sTitle + "ScrollTop = MAX; After visible row count decreased");
			setRowCount(mConfig.rowMode, 30);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 999999985, iScrollPosition - (20 * this.iBaseRowHeight), 1665,
				sTitle + "ScrollTop = MAX; After visible row count increased");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after changing the row count on resize; Small data; Fixed row heights", async function(assert) {
		const oTable = this.createTable({
			rowMode: this.mTestedRowModes.AutoRowMode.setMinRowCount(8)
		});
		let iFirstVisibleRow;
		let iScrollPosition;

		await oTable.qunit.rendered();
		await oTable.qunit.scrollVSbTo(200);
		iFirstVisibleRow = oTable.getFirstVisibleRow();
		iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		await oTable.qunit.resize({height: "400px"});
		this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 200; After height decreased");
		await oTable.qunit.resetSize();
		this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = 200; After height increased");
		await oTable.qunit.scrollVSbTo(9999999);
		iFirstVisibleRow = oTable.getFirstVisibleRow();
		iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		await oTable.qunit.resize({height: "400px"});
		this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0, "ScrollTop = MAX; After height decreased");
		await oTable.qunit.scrollVSbTo(9999999);
		iFirstVisibleRow = oTable.getFirstVisibleRow();
		iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
		await oTable.qunit.resetSize();
		this.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - this.iBaseRowHeight * 2, 0,
			"ScrollTop = MAX; After height increased");

	});

	QUnit.test("Restore scroll position after binding length change; Tiny data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: 10,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(40);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			this.changeBindingLength(9, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 57, iInnerScrollPosition,
				sTitle + "ScrollTop = 40; After binding length decreased (collapse)");
			this.changeBindingLength(10, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 40; After binding length increased (expand)");
			this.changeBindingLength(11, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 36, iInnerScrollPosition,
				sTitle + "ScrollTop = 40; After binding length increased (expand)");
			this.changeBindingLength(10, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 40; After binding length decreased (collapse)");
			await oTable.qunit.scrollVSbTo(40);
			this.fakeODataBindingRefresh(9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 57, iInnerScrollPosition,
				sTitle + "ScrollTop = 40; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 40; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 36, iInnerScrollPosition,
				sTitle + "ScrollTop = 40; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 40; After binding length decreased (refresh)");
			await oTable.qunit.scrollVSbTo(9999999);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			this.changeBindingLength(9, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 3, iScrollPosition, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");
			this.changeBindingLength(10, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 3, 69, 355,
				sTitle + "ScrollTop = MAX; After binding length increased (expand)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.changeBindingLength(11, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 89, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After binding length increased (expand)");
			this.changeBindingLength(10, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.fakeODataBindingRefresh(9);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 3, iScrollPosition, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 3, 69, 355,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.fakeODataBindingRefresh(11);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 89, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(10);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(100);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 264, 58,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			this.changeBindingLength(0, ChangeReason.Change);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "After binding length changed to 0");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after binding length change; Small data; Fixed row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(60);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			this.changeBindingLength(this.mDefaultSettings.bindingLength - 1, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length decreased (collapse)");
			this.changeBindingLength(this.mDefaultSettings.bindingLength, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length increased (expand)");
			this.changeBindingLength(this.mDefaultSettings.bindingLength + 1, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length increased (expand)");
			this.changeBindingLength(this.mDefaultSettings.bindingLength, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length decreased (collapse)");
			await oTable.qunit.scrollVSbTo(60);
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength + 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length decreased (refresh)");
			await oTable.qunit.scrollVSbTo(9999999);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			this.changeBindingLength(this.mDefaultSettings.bindingLength - 1, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - this.iBaseRowHeight, 0,
				sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");
			this.changeBindingLength(this.mDefaultSettings.bindingLength, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - this.iBaseRowHeight, 0,
				sTitle + "ScrollTop = MAX; After binding length increased (expand)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.changeBindingLength(this.mDefaultSettings.bindingLength + 1, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = MAX; After binding length increased (expand)");
			this.changeBindingLength(this.mDefaultSettings.bindingLength, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - this.iBaseRowHeight, 0,
				sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - this.iBaseRowHeight, 0,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength + 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");
			this.changeBindingLength(0, ChangeReason.Change);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "After binding length changed to 0");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after binding length change; Small data; Variable row heights", async function(assert) {

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(60);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			this.changeBindingLength(this.mDefaultSettings.bindingLength - 1, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length decreased (collapse)");
			this.changeBindingLength(this.mDefaultSettings.bindingLength, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length increased (expand)");
			this.changeBindingLength(this.mDefaultSettings.bindingLength + 1, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length increased (expand)");
			this.changeBindingLength(this.mDefaultSettings.bindingLength, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length decreased (collapse)");
			await oTable.qunit.scrollVSbTo(60);
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength + 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length decreased (refresh)");
			await oTable.qunit.scrollVSbTo(9999999);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			this.changeBindingLength(this.mDefaultSettings.bindingLength - 1, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - this.iBaseRowHeight, iInnerScrollPosition - 150 + this.iBaseRowHeight,
				sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");
			this.changeBindingLength(this.mDefaultSettings.bindingLength, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 2, 4437, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After binding length increased (expand)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.changeBindingLength(this.mDefaultSettings.bindingLength + 1, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 4499, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After binding length increased (expand)");
			this.changeBindingLength(this.mDefaultSettings.bindingLength, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition - this.iBaseRowHeight, iInnerScrollPosition - 150 + this.iBaseRowHeight,
				sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 2, 4437, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength + 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 4499, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(this.mDefaultSettings.bindingLength + 100);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 4674, 58,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			this.changeBindingLength(0, ChangeReason.Change);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "After binding length changed to 0");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after binding length change; Large data; Fixed row heights", async function(assert) {
		const iBindingLength = 1000000000;

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(60);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			this.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length decreased (collapse)");
			this.changeBindingLength(iBindingLength, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length increased (expand)");
			this.changeBindingLength(iBindingLength + 1, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length increased (expand)");
			this.changeBindingLength(iBindingLength, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length decreased (collapse)");
			await oTable.qunit.scrollVSbTo(60);
			this.fakeODataBindingRefresh(iBindingLength - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength + 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = 60; After binding length decreased (refresh)");
			await oTable.qunit.scrollVSbTo(9999999);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			this.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition, 0,
				sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");
			this.changeBindingLength(iBindingLength, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - 1, 0,
				sTitle + "ScrollTop = MAX; After binding length increased (expand)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.changeBindingLength(iBindingLength + 1, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition - 1, 0,
				sTitle + "ScrollTop = MAX; After binding length increased (expand)");
			this.changeBindingLength(iBindingLength, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.fakeODataBindingRefresh(iBindingLength - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition, 0,
				sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 1, iScrollPosition - 1, 0,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.fakeODataBindingRefresh(iBindingLength + 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition - 1, 0,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, 0,
				sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");
			this.changeBindingLength(0, ChangeReason.Change);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "After binding length changed to 0");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Restore scroll position after binding length change; Large data; Variable row heights", async function(assert) {
		const iBindingLength = 1000000000;

		const test = async (mConfig) => {
			const oTable = await this.createTable({
				rowMode: mConfig.rowMode,
				bindingLength: iBindingLength,
				_bVariableRowHeightEnabled: true
			});
			const sTitle = mConfig.rowMode + ", ";
			let iFirstVisibleRow;
			let iScrollPosition;
			let iInnerScrollPosition;

			await oTable.qunit.rendered();
			await oTable.qunit.scrollVSbTo(60);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			this.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length decreased (collapse)");
			this.changeBindingLength(iBindingLength, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length increased (expand)");
			this.changeBindingLength(iBindingLength + 1, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length increased (expand)");
			this.changeBindingLength(iBindingLength, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length decreased (collapse)");
			await oTable.qunit.scrollVSbTo(60);
			this.fakeODataBindingRefresh(iBindingLength - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength + 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = 60; After binding length decreased (refresh)");
			await oTable.qunit.scrollVSbTo(9999999);
			iFirstVisibleRow = oTable.getFirstVisibleRow();
			iScrollPosition = oTable._getScrollExtension().getVerticalScrollbar().scrollTop;
			iInnerScrollPosition = oTable.getDomRef("tableCCnt").scrollTop;
			this.changeBindingLength(iBindingLength - 1, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition, iInnerScrollPosition - 150 + this.iBaseRowHeight,
				sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");
			this.changeBindingLength(iBindingLength, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 2, 999488, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After binding length increased (expand)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.changeBindingLength(iBindingLength + 1, ChangeReason.Expand);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 999501, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After binding length increased (expand)");
			this.changeBindingLength(iBindingLength, ChangeReason.Collapse);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After binding length decreased (collapse)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.fakeODataBindingRefresh(iBindingLength - 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 2, iScrollPosition, iInnerScrollPosition - 150 + this.iBaseRowHeight,
				sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow - 2, 999488, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			await oTable.qunit.scrollVSbTo(9999999);
			this.fakeODataBindingRefresh(iBindingLength + 1);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 999501, iInnerScrollPosition - 150,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, iScrollPosition, iInnerScrollPosition,
				sTitle + "ScrollTop = MAX; After binding length decreased (refresh)");
			this.fakeODataBindingRefresh(iBindingLength + 100);
			await oTable.qunit.rendered();
			this.assertPosition(assert, iFirstVisibleRow, 999412, 58,
				sTitle + "ScrollTop = MAX; After binding length increased (refresh)");
			this.changeBindingLength(0, ChangeReason.Change);
			await oTable.qunit.rendered();
			this.assertPosition(assert, 0, 0, 0, sTitle + "After binding length changed to 0");

		};

		const aRowModeConfigs = [];
		this.forEachTestedRowMode(function(oRowModeConfig) {
			aRowModeConfigs.push(oRowModeConfig);
		});
		for (const oRowModeConfig of aRowModeConfigs) {
			await test({
				rowMode: oRowModeConfig.rowMode
			});
		}

	});

	QUnit.test("Scroll with scrollbar; The table's DOM is removed without notifying the table", async function(assert) {
		const oTable = this.createTable();
		const oScrollExtension = oTable._getScrollExtension();
		await oTable.qunit.rendered();
		const oTableElement = oTable.getDomRef();
		const oTableParentElement = oTableElement.parentNode;
		oScrollExtension.getVerticalScrollbar().scrollTop = 100;
		await oTable.qunit.vScrolled();
		oTableParentElement.removeChild(oTableElement);
		await TableQUnitUtils.nextFrame();
		assert.strictEqual(oTable.getFirstVisibleRow(), 2,
			"Remove DOM after scrolling with scrollbar: The firstVisibleRow is correct");
		oTableParentElement.appendChild(oTableElement);
		oTable._setLargeDataScrolling(true);
		const oVSb = oScrollExtension.getVerticalScrollbar();
		oVSb.dispatchEvent(new Event("pointerdown")); // Seed the baseline for the speed calculation.
		await TableQUnitUtils.sleep(50); // Wait so that the scroll delta is below the fast scroll threshold (slow scroll -> immediate update).
		oVSb.scrollTop = 200;
		await oTable.qunit.vScrolled();
		oTableParentElement.removeChild(oTableElement);
		await TableQUnitUtils.sleep(300);
		assert.strictEqual(oTable.getFirstVisibleRow(), 4,
			"Remove DOM after scrolling with scrollbar and large data scrolling enabled: The firstVisibleRow is correct");

	});

	QUnit.test("Scroll by setting FirstVisibleRow; The table's DOM is removed without notifying the table", async function(assert) {
		const oTable = this.createTable();
		await oTable.qunit.rendered();
		const oTableElement = oTable.getDomRef();
		const oTableParentElement = oTableElement.parentNode;
		oTable.setFirstVisibleRow(5);
		oTableParentElement.removeChild(oTableElement);
		await TableQUnitUtils.nextFrame();
		assert.strictEqual(oTable.getFirstVisibleRow(), 5,
			"Remove DOM synchronously after setting firstVisibleRow: The firstVisibleRow is correct");
		oTable.setFirstVisibleRow(6);
		await TableQUnitUtils.nextFrame();
		assert.strictEqual(oTable.getFirstVisibleRow(), 6,
			"Set firstVisibleRow if DOM is removed: The firstVisibleRow is correct");
		oTableParentElement.appendChild(oTableElement);
		oTable.setFirstVisibleRow(5);
		await TableQUnitUtils.nextFrame();
		oTableParentElement.removeChild(oTableElement);
		await TableQUnitUtils.nextFrame();
		assert.strictEqual(oTable.getFirstVisibleRow(), 5,
			"Remove DOM asynchronously after setting firstVisibleRow: The firstVisibleRow is correct");

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

		const oTable = TableQUnitUtils.createTable({
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

		async function test(sTitle, iColumnIndex) {
			const oCellContent = oTable.getRows()[0].getCells()[iColumnIndex].getDomRef();

			await oTable.qunit.focus(oCellContent);
			const $InnerCellElement = TableUtils.getCell(oTable, oCellContent).find(".sapUiTableCellInner");

			assert.strictEqual($InnerCellElement[0].scrollLeft, 0, sTitle + ": The cell content is not scrolled horizontally");
			assert.strictEqual($InnerCellElement[0].scrollTop, 0, sTitle + ": The cell content is not scrolled vertically");
		}

		await oTable.qunit.rendered();
		await test("Fixed column", 0);
		await test("Scrollable column", 1);

		oTable.destroy();
	});

	QUnit.module("Leave action mode on scrolling", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				width: "500px",
				columns: [TableQUnitUtils.createInteractiveTextColumn().setWidth("800px")],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(20)
			});

			return this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Scrollbar", async function(assert) {
		const oTable = this.oTable;
		const oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();
		await oTable.qunit.focus(oCellContent);
		// Horizontal
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		const oEvent = document.createEvent('MouseEvents');
		oEvent.initEvent("mousedown", true, true);
		oTable._getScrollExtension().getHorizontalScrollbar().dispatchEvent(oEvent);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Clicked on horizontal scrollbar -> Table is in Navigation Mode");
		assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
		await oTable.qunit.focus(oCellContent);
		// Vertical
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 1;
		await oTable.qunit.vScrolled();
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled the vertical scrollbar -> Table is in Navigation Mode");
		assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
	});

	QUnit.test("Scrollbar; Large data scrolling", async function(assert) {
		const oTable = this.oTable;
		const oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();

		oTable._bLargeDataScrolling = true;

		await oTable.qunit.focus(oCellContent);
		// Vertical
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 1;
		await oTable.qunit.vScrolled();
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled the vertical scrollbar -> Table is in Navigation Mode");
		assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
	});

	QUnit.test("MouseWheel", async function(assert) {
		const oTable = this.oTable;
		const oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();
		const oTableContainer = oTable.getDomRef("tableCCnt");
		let oWheelEvent;

		await oTable.qunit.focus(oCellContent);
		// Horizontal
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		oWheelEvent = TableQUnitUtils.createMouseWheelEvent(150, MouseWheelDeltaMode.PIXEL, true);
		oTableContainer.dispatchEvent(oWheelEvent);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled horizontally -> Table is in Navigation Mode");
		assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
		await oTable.qunit.focus(oCellContent);
		// Vertical
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		oWheelEvent = TableQUnitUtils.createMouseWheelEvent(150, MouseWheelDeltaMode.PIXEL, false);
		oTableContainer.dispatchEvent(oWheelEvent);
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled vertically -> Table is in Navigation Mode again");
		assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
	});

	QUnit.test("MouseWheel; textarea element inside a cell", async function(assert) {
		let oWheelEvent = TableQUnitUtils.createMouseWheelEvent(20, MouseWheelDeltaMode.PIXEL, false);
		const oStopPropagationSpy = sinon.spy(oWheelEvent, "stopPropagation");

		this.oTable.insertColumn(new Column({template: new TextArea({value: "A\nB\nC\nD\nE"})}), 0);
		await this.oTable.qunit.rendered();

		const oTargetElement = this.oTable.qunit.getDataCell(0, 0).querySelector("textarea");
		oTargetElement.dispatchEvent(oWheelEvent);

		await TableQUnitUtils.sleep(100);
		assert.ok(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop === 0, "Table did not scroll");
		assert.ok(!oWheelEvent.defaultPrevented, "Default action was not prevented");
		assert.ok(oStopPropagationSpy.notCalled, "Propagation was not stopped");

		oTargetElement.scrollTop = 70;
		oTargetElement.dispatchEvent(oWheelEvent);
		await TableQUnitUtils.sleep(100);
		assert.ok(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop === 0, "TextArea is scrolled to bottom, Table did not scroll");
		assert.ok(!oWheelEvent.defaultPrevented, "Default action was not prevented");
		assert.ok(oStopPropagationSpy.notCalled, "Propagation was not stopped");

		oWheelEvent = TableQUnitUtils.createMouseWheelEvent(-20, MouseWheelDeltaMode.PIXEL, false);
		oTargetElement.dispatchEvent(oWheelEvent);
		await TableQUnitUtils.sleep(100);
		assert.ok(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop === 0, "Table did not scroll");
		assert.ok(!oWheelEvent.defaultPrevented, "Default action was not prevented");
		assert.ok(oStopPropagationSpy.notCalled, "Propagation was not stopped");

		oTargetElement.scrollTop = 0;
		oTargetElement.dispatchEvent(oWheelEvent);
		await TableQUnitUtils.sleep(100);
		assert.ok(this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop === 0, "TextArea is scrolled to top, Table did not scroll");
		assert.ok(!oWheelEvent.defaultPrevented, "Default action was not prevented");
		assert.ok(oStopPropagationSpy.notCalled, "Propagation was not stopped");

		oStopPropagationSpy.restore();
	});

	QUnit.test("Touch", async function(assert) {
		const oTable = this.oTable;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;
		oTable.invalidate();
		oTable.qunit.preventFocusOnTouch();

		await oTable.qunit.rendered();
		await oTable.qunit.focus(oTable.getRows()[0].getCells()[0].getDomRef());
		// Horizontal
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		TableQUnitUtils.startTouchScrolling(oTable.getDomRef("tableCCnt"), 200);
		TableQUnitUtils.doTouchScrolling(150);
		TableQUnitUtils.endTouchScrolling();
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled horizontally -> Table is in Navigation Mode");
		assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");
		await oTable.qunit.focus(oTable.getRows()[0].getCells()[0].getDomRef());
		// Vertical
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		TableQUnitUtils.startTouchScrolling(oTable.getDomRef("tableCCnt"), 200);
		TableQUnitUtils.doTouchScrolling(undefined, 150);
		TableQUnitUtils.endTouchScrolling();
		assert.ok(!oTable._getKeyboardExtension().isInActionMode(), "Scrolled Vertically -> Table is in Navigation Mode");
		assert.strictEqual(document.activeElement, oTable.qunit.getDataCell(0, 0), "Cell has focus");

		Device.support.pointer = bOriginalPointerSupport;
		Device.support.touch = bOriginalTouchSupport;
	});

	QUnit.test("FirstVisibleRow", async function(assert) {
		const oTable = this.oTable;
		const oCellContent = oTable.getRows()[0].getCells()[0].getDomRef();

		await oTable.qunit.focus(oCellContent);
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Table is in Action Mode");
		oTable.setFirstVisibleRow(1);
		await oTable.qunit.rendered();
		assert.ok(oTable._getKeyboardExtension().isInActionMode(), "Scrolled the vertical scrollbar -> Table is in Action Mode");
		assert.strictEqual(document.activeElement, oCellContent, "Cell content has focus");
	});

	QUnit.module("Momentum scrolling", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCount: 5,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [
					TableQUnitUtils.createTextColumn().setWidth("400px"),
					TableQUnitUtils.createTextColumn().setWidth("400px"),
					TableQUnitUtils.createTextColumn().setWidth("400px"),
					TableQUnitUtils.createTextColumn().setWidth("400px")
				]
			});

			// Store original device support
			this.bOriginalPointerSupport = Device.support.pointer;
			this.bOriginalTouchSupport = Device.support.touch;

			return this.oTable.qunit.rendered();
		},
		afterEach: function() {
			// Restore original device support
			Device.support.pointer = this.bOriginalPointerSupport;
			Device.support.touch = this.bOriginalTouchSupport;
			this.oTable.destroy();
		},
		/**
		 * Waits for momentum scrolling to complete by checking if scroll position stabilizes.
		 * @param {Element} oScrollbar - The scrollbar element to monitor
		 * @param {number} [iTimeout=2000] - Maximum wait time in ms
		 * @returns {Promise} Resolves when scrolling stops or timeout is reached
		 */
		waitForMomentumEnd: function(oScrollbar, iTimeout) {
			iTimeout = iTimeout || 2000;
			return new Promise((resolve) => {
				let iLastScrollPosition = oScrollbar.scrollTop || oScrollbar.scrollLeft;
				let iStableCount = 0;
				const iStartTime = Date.now();

				function checkScrollComplete() {
					const iCurrentPosition = oScrollbar.scrollTop || oScrollbar.scrollLeft;

					if (iCurrentPosition === iLastScrollPosition) {
						iStableCount++;
						// Consider stable after 3 consecutive checks (~50ms of no movement)
						if (iStableCount >= 3) {
							resolve();
							return;
						}
					} else {
						iStableCount = 0;
						iLastScrollPosition = iCurrentPosition;
					}

					if (Date.now() - iStartTime >= iTimeout) {
						resolve(); // Timeout fallback
						return;
					}

					setTimeout(checkScrollComplete, 16); // Check every frame (~60fps)
				}

				// Start checking after a small delay to allow animation to begin
				setTimeout(checkScrollComplete, 50);
			});
		}
	});

	QUnit.test("Momentum animation triggered after fast swipe", async function(assert) {
		const oTable = this.oTable;
		const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
		const iInitialScrollTop = oVSb.scrollTop;

		Device.support.pointer = false;
		Device.support.touch = true;
		oTable.invalidate();

		await oTable.qunit.rendered();
		const oTargetElement = oTable.qunit.getDataCell(0, 0);
		TableQUnitUtils.startTouchScrolling(oTargetElement);

		// Simulate a fast swipe with minimal delays to ensure high velocity
		TableQUnitUtils.doTouchScrolling(0, 40);
		await TableQUnitUtils.sleep(10);
		TableQUnitUtils.doTouchScrolling(0, 40);
		await TableQUnitUtils.sleep(10);
		TableQUnitUtils.doTouchScrolling(0, 40);

		// End touch - this should trigger momentum
		TableQUnitUtils.endTouchScrolling();

		// Wait for momentum animation to complete
		await this.waitForMomentumEnd(oVSb);

		const iScrollTopAfterMomentum = oVSb.scrollTop;
		// Momentum should scroll beyond the initial touch distance (240px total touch movement)
		assert.ok(iScrollTopAfterMomentum > iInitialScrollTop + 240,
			`Momentum scrolling continued after touch end (scrolled more than touch distance). Initial: ${iInitialScrollTop}, ` +
			`After: ${iScrollTopAfterMomentum}`);
	});

	QUnit.test("New touch cancels active momentum animation", async function(assert) {
		const oTable = this.oTable;
		const oVSb = oTable._getScrollExtension().getVerticalScrollbar();

		Device.support.pointer = false;
		Device.support.touch = true;
		oTable.invalidate();

		await oTable.qunit.rendered();
		let oTargetElement = oTable.qunit.getDataCell(0, 0);

		// First swipe to start momentum
		TableQUnitUtils.startTouchScrolling(oTargetElement);
		TableQUnitUtils.doTouchScrolling(0, 40);
		await TableQUnitUtils.sleep(10);
		TableQUnitUtils.doTouchScrolling(0, 40);
		TableQUnitUtils.endTouchScrolling();

		// Wait briefly for momentum to start
		await TableQUnitUtils.sleep(30);

		oTargetElement = oTable.qunit.getDataCell(0, 0);

		// Start a new touch (should cancel momentum)
		TableQUnitUtils.startTouchScrolling(oTargetElement);

		// Record position immediately after new touch
		const iScrollAfterNewTouchStart = oVSb.scrollTop;

		// Wait to verify no further momentum scrolling occurs
		await TableQUnitUtils.sleep(200);

		const iScrollAfterWait = oVSb.scrollTop;

		// Scroll should not have changed significantly after the new touch started
		assert.ok(Math.abs(iScrollAfterWait - iScrollAfterNewTouchStart) < 5,
			`New touch cancelled momentum animation. Position at new touch: ${iScrollAfterNewTouchStart}, After wait: ${iScrollAfterWait}`);

		TableQUnitUtils.endTouchScrolling();
	});

	QUnit.test("Horizontal momentum scrolling", async function(assert) {
		const oTable = this.oTable;
		const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
		const iInitialScrollLeft = oHSb.scrollLeft;

		Device.support.pointer = false;
		Device.support.touch = true;
		oTable.invalidate();

		await oTable.qunit.rendered();
		const oTargetElement = oTable.qunit.getDataCell(0, 0);
		TableQUnitUtils.startTouchScrolling(oTargetElement);

		// Horizontal swipe with minimal delays for high velocity
		TableQUnitUtils.doTouchScrolling(80, 0);
		await TableQUnitUtils.sleep(10);
		TableQUnitUtils.doTouchScrolling(80, 0);
		TableQUnitUtils.endTouchScrolling();

		// Wait for momentum to complete
		await this.waitForMomentumEnd(oHSb);

		const iScrollLeftAfterMomentum = oHSb.scrollLeft;
		assert.ok(iScrollLeftAfterMomentum > iInitialScrollLeft + 160,
			`Horizontal momentum scrolling works. Initial: ${iInitialScrollLeft}, After: ${iScrollLeftAfterMomentum}`);
	});

	QUnit.module("Distinguish between tap and scroll on touch", {
		beforeEach: async function() {
			this.bOriginalPointerSupport = Device.support.pointer;
			this.bOriginalTouchSupport = Device.support.touch;
			Device.support.pointer = false;
			Device.support.touch = true;

			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(20),
				columns: [
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createTextColumn()
				],
				rowActionCount: 1,
				rowActionTemplate: TableQUnitUtils.createRowAction(null)
			});

			await this.oTable.qunit.rendered();
		},
		afterEach: function() {
			Device.support.pointer = this.bOriginalPointerSupport;
			Device.support.touch = this.bOriginalTouchSupport;
			this.oTable.destroy();
		},
		triggerTouchEvent: function(sEventName, oTarget) {
			const oEvent = TableQUnitUtils.createTouchEvent(sEventName, {
				touches: sEventName === "touchend" ? [] : [
					TableQUnitUtils.createTouchObject({
						identifier: 1,
						target: oTarget,
						pageX: 0,
						pageY: sEventName === "touchmove" ? -100 : 0
					})
				]
			});
			oTarget.dispatchEvent(oEvent);
			return oEvent;
		},
		testTouchOnCell: function(assert, oCell, bTouchMove) {
			const oKeyboardExtension = this.oTable._getKeyboardExtension();
			document.body.focus();
			this.triggerTouchEvent("touchstart", oCell);
			assert.ok(oKeyboardExtension.isItemNavigationSuspended(), "Item navigation is suspended after touchstart on a content cell");

			if (bTouchMove) {
				this.triggerTouchEvent("touchmove", oCell);
			}

			this.triggerTouchEvent("touchend", oCell);
			assert.notOk(oKeyboardExtension.isItemNavigationSuspended(), "Item navigation is resumed after touchend");

			if (bTouchMove) {
				assert.notEqual(document.activeElement, oCell, "Cell is not focused after scroll");
			} else {
				assert.strictEqual(document.activeElement, oCell, "Cell is focused after tap");
			}
		}
	});

	QUnit.test("Data cell", function(assert) {
		const oCell = this.oTable.qunit.getDataCell(1, 0);
		this.testTouchOnCell(assert, oCell, true);
		this.testTouchOnCell(assert, oCell, false);
	});

	QUnit.test("Row header cell", function(assert) {
		const oCell = this.oTable.qunit.getRowHeaderCell(1);
		this.testTouchOnCell(assert, oCell, true);
		this.testTouchOnCell(assert, oCell, false);
	});

	QUnit.test("Row action cell", function(assert) {
		const oCell = this.oTable.qunit.getRowActionCell(1);
		this.testTouchOnCell(assert, oCell, true);
		this.testTouchOnCell(assert, oCell, false);
	});

	QUnit.module("LargeDataScrolling", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({rowCount: 5}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1000),
				columns: [TableQUnitUtils.createTextColumn()]
			});

			return this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		makeBindingNonClient: function() {
			const oBinding = this.oTable.getBinding();
			const fnIsA = oBinding.isA.bind(oBinding);
			sinon.stub(oBinding, "isA").callsFake(function(sType) {
				return sType === "sap.ui.model.ClientListBinding" ? false : fnIsA(sType);
			});
		},
		/**
		 * Performs a fast scroll and returns once the scroll event has been processed.
		 */
		fastScroll: async function() {
			const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();
			oVSb.dispatchEvent(new Event("pointerdown")); // Seed the baseline for the speed calculation.
			oVSb.scrollTop += 490; // 10 rows at once.
			await this.oTable.qunit.vScrolled();
		},
		/**
		 * Performs a slow scroll and returns once the scroll event has been processed.
		 */
		slowScroll: async function() {
			const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();
			oVSb.dispatchEvent(new Event("pointerdown")); // Seed the baseline for the speed calculation.
			await TableQUnitUtils.sleep(50); // Wait so that a 1-row delta is below the fast scroll threshold.
			oVSb.scrollTop += 49; // One row.
			await this.oTable.qunit.vScrolled();
		},
		/**
		 * Grabs the scroll handle and performs a fast scroll, returning once the scroll event has been processed.
		 */
		fastHandleDrag: async function() {
			this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
			await this.oTable.qunit.rendered();

			const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();
			oVSb.dispatchEvent(new Event("pointerdown")); // Create and show the handle.
			const oHandle = oVSb.parentElement.querySelector(".sapUiTableVScrHandle");

			// Grab the handle (still needed otherwise the scroll wouldn't be treated as a handle drag).
			oHandle.dispatchEvent(new PointerEvent("pointerdown", {clientY: 0}));
			oVSb.scrollTop += 490; // 10 rows at once.
			await this.oTable.qunit.vScrolled();
		},
		assertSkeletons: function(bExpected, sPrefix) {
			for (const [iIndex, oRow] of this.oTable.getRows().entries()) {
				QUnit.assert.equal(oRow.getDomRef().classList.contains("sapUiTableRowSkeleton"), bExpected,
					(sPrefix ? sPrefix + ": " : "") + "Row " + iIndex + (bExpected ? " has" : " does not have") + " the skeleton class");
			}
		}
	});

	QUnit.test("Client model", async function(assert) {
		const iInitialFirstVisibleRow = this.oTable.getFirstVisibleRow();

		assert.ok(this.oTable.getBinding().isA("sap.ui.model.ClientListBinding"), "The binding is a client binding");

		await this.fastScroll();
		await TableQUnitUtils.sleep(200);

		assert.ok(this.oTable.getFirstVisibleRow() > iInitialFirstVisibleRow,
			"firstVisibleRow is updated immediately - large data scrolling is not active for a client binding");
		this.assertSkeletons(false);
	});

	QUnit.test("Non-client model - Slow scroll", async function(assert) {
		const iInitialFirstVisibleRow = this.oTable.getFirstVisibleRow();

		this.makeBindingNonClient();

		await this.slowScroll();

		assert.ok(this.oTable.getFirstVisibleRow() > iInitialFirstVisibleRow, "firstVisibleRow updated immediately for slow scroll (no debounce)");
		this.assertSkeletons(false);
	});

	QUnit.test("Non-client model - Fast scroll", async function(assert) {
		this.makeBindingNonClient();

		const iInitialFirstVisibleRow = this.oTable.getFirstVisibleRow();
		await this.fastScroll();
		await TableQUnitUtils.sleep(200);

		assert.equal(this.oTable.getFirstVisibleRow(), iInitialFirstVisibleRow,
			"firstVisibleRow not updated immediately for fast scroll (debounced 300ms)");
		this.assertSkeletons(true);

		await TableQUnitUtils.sleep(200);
		assert.ok(this.oTable.getFirstVisibleRow() > iInitialFirstVisibleRow, "firstVisibleRow updated after debounce for fast scroll");
		this.assertSkeletons(false);
	});

	QUnit.test("Explicitly enabled with a client model - Fast scroll", async function(assert) {
		this.oTable._setLargeDataScrolling(true);

		const iInitialFirstVisibleRow = this.oTable.getFirstVisibleRow();
		await this.fastScroll();
		await TableQUnitUtils.sleep(200);

		assert.equal(this.oTable.getFirstVisibleRow(), iInitialFirstVisibleRow,
			"firstVisibleRow not updated immediately for fast scroll - large data scrolling is active");
		this.assertSkeletons(true);
	});

	QUnit.test("Explicitly disabled with a non-client model - Fast scroll", async function(assert) {
		this.makeBindingNonClient();
		this.oTable._setLargeDataScrolling(false);

		const iInitialFirstVisibleRow = this.oTable.getFirstVisibleRow();
		await this.fastScroll();
		await TableQUnitUtils.sleep(200);

		assert.ok(this.oTable.getFirstVisibleRow() > iInitialFirstVisibleRow,
			"firstVisibleRow is updated immediately - large data scrolling is not active");
		this.assertSkeletons(false);
	});

	QUnit.test("Threshold combinations", async function(assert) {
		this.makeBindingNonClient();
		const oGetTotalRowCountStub = sinon.stub(this.oTable, "_getTotalRowCount");

		const aTestCases = [
			{threshold: 100, scrollThreshold: -1, totalRowCount: 501, expectLargeDataScrolling: true},
			{threshold: 100, scrollThreshold: -1, totalRowCount: 500, expectLargeDataScrolling: false},
			{threshold: 100, scrollThreshold: 200, totalRowCount: 1001, expectLargeDataScrolling: true},
			{threshold: 100, scrollThreshold: 200, totalRowCount: 1000, expectLargeDataScrolling: false},
			{threshold: 100, scrollThreshold: 0, totalRowCount: 100000, expectLargeDataScrolling: false}
		];

		for (const oTestCase of aTestCases) {
			const sTitle = `threshold=${oTestCase.threshold}, scrollThreshold=${oTestCase.scrollThreshold}, totalRowCount=${oTestCase.totalRowCount}`;
			this.oTable.setThreshold(oTestCase.threshold);
			this.oTable.setScrollThreshold(oTestCase.scrollThreshold);
			oGetTotalRowCountStub.returns(oTestCase.totalRowCount);

			// Each case scrolls a bit further down; the position does not affect whether large data scrolling is active.
			const iInitialFirstVisibleRow = this.oTable.getFirstVisibleRow();
			await this.fastScroll();

			// Observe the state within the debounce window (300ms). Large data scrolling is debounced, so the rows are not yet updated
			// and skeletons are shown. Otherwise the rows are updated immediately without skeletons.
			await TableQUnitUtils.sleep(200);

			if (oTestCase.expectLargeDataScrolling) {
				assert.equal(this.oTable.getFirstVisibleRow(), iInitialFirstVisibleRow, sTitle + ": debounced update");
				this.assertSkeletons(true, sTitle);
			} else {
				assert.ok(this.oTable.getFirstVisibleRow() > iInitialFirstVisibleRow, sTitle + ": immediate update");
				this.assertSkeletons(false, sTitle);
			}

			// Wait for the (debounced) update to finish so the next case starts from a settled state.
			await this.oTable.qunit.rendered();
		}
	});

	QUnit.test("Fast scroll to the already rendered position", async function(assert) {
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		this.makeBindingNonClient();

		await this.fastScroll();
		oVSb.scrollTop = 0; // Scroll back to previous position.
		await this.oTable.qunit.vScrolled();
		this.assertSkeletons(true);
		await TableQUnitUtils.sleep(500); // Wait for the debounce (300ms) and the update to finish.

		// Even though no rows update was triggered, the skeletons must be cleared once the debounced update finishes.
		this.assertSkeletons(false);
	});

	QUnit.test("Slow scroll while a fast scroll update is pending", async function(assert) {
		this.makeBindingNonClient();

		await this.fastScroll();
		const iFastScrollFirstVisibleRow = this.oTable.getFirstVisibleRow();
		this.assertSkeletons(true);

		// Continue scrolling slowly before the debounced fast scroll elapses.
		await this.slowScroll();

		assert.ok(this.oTable.getFirstVisibleRow() > iFastScrollFirstVisibleRow, "firstVisibleRow updated immediately for the slow scroll");
		this.assertSkeletons(false);
	});

	QUnit.test("Fast handle drag", async function(assert) {
		this.makeBindingNonClient();

		const iInitialFirstVisibleRow = this.oTable.getFirstVisibleRow();
		await this.fastHandleDrag();
		await TableQUnitUtils.sleep(200);

		assert.equal(this.oTable.getFirstVisibleRow(), iInitialFirstVisibleRow,
			"firstVisibleRow not updated immediately for a fast handle drag (debounced 300ms)");
		this.assertSkeletons(true);

		await TableQUnitUtils.sleep(200);
		assert.ok(this.oTable.getFirstVisibleRow() > iInitialFirstVisibleRow, "firstVisibleRow updated after debounce for a fast handle drag");
		this.assertSkeletons(false);

		document.dispatchEvent(new PointerEvent("pointerup")); // Release the handle to clean up the drag listeners.
	});

	QUnit.test("Fast handle drag while touch scrolling is active", async function(assert) {
		this.makeBindingNonClient();
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.Default);
		await this.oTable.qunit.rendered();

		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();
		const oTableContent = this.oTable.getDomRef("tableCCnt");

		// Simulate a touch scroll with enough velocity to trigger a momentum animation.
		oTableContent.dispatchEvent(new PointerEvent("pointerdown", {pointerType: "touch", clientX: 100, clientY: 200}));
		await TableQUnitUtils.sleep(20);
		oTableContent.dispatchEvent(new PointerEvent("pointermove", {pointerType: "touch", clientX: 100, clientY: 160}));
		oTableContent.dispatchEvent(new PointerEvent("pointerup", {pointerType: "touch", clientX: 100, clientY: 160}));
		await TableQUnitUtils.sleep(20);

		const oHandle = oVSb.parentElement.querySelector(".sapUiTableVScrHandle");
		oHandle.dispatchEvent(new PointerEvent("pointerdown", {clientY: 0}));

		const iScrollTopAfterGrab = oVSb.scrollTop;
		await TableQUnitUtils.sleep(100);
		assert.equal(oVSb.scrollTop, iScrollTopAfterGrab, "Scroll position does not change after grabbing the handle");

		const iInitialFirstVisibleRow = this.oTable.getFirstVisibleRow();
		oVSb.scrollTop += 490; // 10 rows at once.
		await this.oTable.qunit.vScrolled();
		await TableQUnitUtils.sleep(200);

		assert.equal(this.oTable.getFirstVisibleRow(), iInitialFirstVisibleRow, "firstVisibleRow not updated immediately for a fast handle drag");
		this.assertSkeletons(true);

		await TableQUnitUtils.sleep(200);
		assert.ok(this.oTable.getFirstVisibleRow() > iInitialFirstVisibleRow, "firstVisibleRow updated after the debounce");
		this.assertSkeletons(false);

		document.dispatchEvent(new PointerEvent("pointerup")); // Release the handle to clean up the drag listeners.
	});

	QUnit.test("Fast handle drag updates the handle during the debounce", async function(assert) {
		this.makeBindingNonClient();
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		await this.oTable.qunit.rendered();

		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();
		oVSb.dispatchEvent(new Event("pointerdown")); // Create and show the handle.
		const oHandle = oVSb.parentElement.querySelector(".sapUiTableVScrHandle");
		const sInitialText = oHandle.firstChild.textContent;
		const iInitialFirstVisibleRow = this.oTable.getFirstVisibleRow();

		oHandle.dispatchEvent(new PointerEvent("pointerdown", {clientY: 0})); // Grab the handle (activates drag mode).
		oVSb.scrollTop += 490; // 10 rows at once.
		await this.oTable.qunit.vScrolled();

		// The row update is debounced
		assert.equal(this.oTable.getFirstVisibleRow(), iInitialFirstVisibleRow, "firstVisibleRow not updated yet during the debounce");
		this.assertSkeletons(true);
		// The scroll handle already reflects the drag target position.
		assert.notEqual(oHandle.firstChild.textContent, sInitialText, "Handle content updated immediately while the row update is debounced");

		document.dispatchEvent(new PointerEvent("pointerup")); // Release the handle to clean up the drag listeners.
	});

	QUnit.test("Unseeded scroll is debounced", async function(assert) {
		this.makeBindingNonClient();

		const iInitialFirstVisibleRow = this.oTable.getFirstVisibleRow();
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		oVSb.scrollTop += 49; // One row.
		await this.oTable.qunit.vScrolled();
		await TableQUnitUtils.sleep(200);

		assert.equal(this.oTable.getFirstVisibleRow(), iInitialFirstVisibleRow,
			"firstVisibleRow not updated immediately for the first (unseeded) movement - it is debounced");
		this.assertSkeletons(true);

		await TableQUnitUtils.sleep(200);
		assert.ok(this.oTable.getFirstVisibleRow() > iInitialFirstVisibleRow, "firstVisibleRow updated after the debounce");
		this.assertSkeletons(false);
	});

	QUnit.test("Resume after a debounced update stays debounced", async function(assert) {
		this.makeBindingNonClient();

		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		// Seed and fast scroll, then let the debounce complete. Completing the debounced update deletes the speed baseline.
		oVSb.dispatchEvent(new Event("pointerdown"));
		oVSb.scrollTop += 490; // 10 rows at once.
		await this.oTable.qunit.vScrolled();
		await TableQUnitUtils.sleep(400); // Wait out the debounce (300ms); completing the update deletes the baseline.
		await this.oTable.qunit.rendered(); // Wait for the resulting row update to render.

		const iFirstVisibleRowAfterUpdate = this.oTable.getFirstVisibleRow();
		oVSb.scrollTop += 49; // One row.
		await this.oTable.qunit.vScrolled();
		await TableQUnitUtils.sleep(200);

		assert.equal(this.oTable.getFirstVisibleRow(), iFirstVisibleRowAfterUpdate,
			"firstVisibleRow not updated immediately when resuming after a debounced update");
		this.assertSkeletons(true);
	});

	QUnit.module("Scroll handle", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({rowCount: 10}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [TableQUnitUtils.createTextColumn()]
			});

			await this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		getHandle: function() {
			return this.oTable._getScrollExtension().getVerticalScrollbar()?.parentElement.querySelector(".sapUiTableVScrHandle");
		}
	});

	QUnit.test("showScrollHandle is Off", function(assert) {
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.Off);
		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();

		oScrollExtension._bTouchScroll = true;
		oVSb.dispatchEvent(new Event("pointerdown"));
		assert.notOk(this.getHandle(), "ShowScrollHandle.Off with _bTouchScroll: handle is not created");
		delete oScrollExtension._bTouchScroll;

		oScrollExtension._bIOSThumbDrag = true;
		oVSb.dispatchEvent(new Event("pointerdown"));
		assert.notOk(this.getHandle(), "ShowScrollHandle.Off with _bIOSThumbDrag: handle is not created");
		delete oScrollExtension._bIOSThumbDrag;
	});

	QUnit.test("showScrollHandle is On", function(assert) {
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();

		delete oScrollExtension._bTouchScroll;
		delete oScrollExtension._bIOSThumbDrag;
		oVSb.dispatchEvent(new Event("pointerdown"));
		assert.ok(this.getHandle(), "ShowScrollHandle.On without touch flags: handle is created");
	});

	QUnit.test("showScrollHandle is Default, no touch scroll or thumb dragging", function(assert) {
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.Default);
		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();

		delete oScrollExtension._bTouchScroll;
		delete oScrollExtension._bIOSThumbDrag;

		oVSb.dispatchEvent(new Event("pointerdown"));
		assert.notOk(this.getHandle(), "ShowScrollHandle.Default without touch: handle is not created");
	});

	QUnit.test("showScrollHandle is Default with touch scroll", function(assert) {
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.Default);
		const oScrollExtension = this.oTable._getScrollExtension();
		const oVSb = oScrollExtension.getVerticalScrollbar();

		oScrollExtension._bTouchScroll = true;
		oVSb.dispatchEvent(new Event("pointerdown"));
		assert.ok(this.getHandle(), "ShowScrollHandle.Default with _bTouchScroll: handle is created");
		delete oScrollExtension._bTouchScroll;
	});

	QUnit.test("Rendering", function(assert) {
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		oVSb.dispatchEvent(new Event("pointerdown"));

		const oHandle = this.getHandle();
		assert.ok(oHandle, "Handle element exists in DOM");
		assert.ok(oHandle.classList.contains("sapUiTableVScrHandleVisible"), "Handle has visible CSS class");
		assert.strictEqual(oHandle.getAttribute("tabindex"), "-1", "tabindex is -1");
		assert.strictEqual(oHandle.getAttribute("role"), "none", "role is none");
		assert.strictEqual(oHandle.getAttribute("aria-hidden"), "true", "aria-hidden is true");
		assert.ok(oHandle.querySelector(".sapUiTableVScrHandleGrip"), "Grip icon span exists");
		assert.ok(oHandle.classList.contains("sapUiTableVScrHandleVisible"), "Handle has visible CSS class after update");
		assert.ok(oHandle.style.top, "Top style is set");
	});

	QUnit.test("Content", function(assert) {
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		// Binding length is final for JSONModel (100 rows, 10 visible).
		oVSb.dispatchEvent(new Event("pointerdown"));

		let oHandle = this.getHandle();
		assert.ok(oHandle, "Handle element exists");
		let sText = oHandle.firstChild.textContent;
		assert.equal(sText, TableUtils.getResourceText("TBL_SCROLL_HANDLE_ROWS_OF", [1, 10, 100]));

		const oBinding = this.oTable.getBinding();
		const oIsLengthFinalStub = sinon.stub(oBinding, "isLengthFinal").returns(false);
		oVSb.dispatchEvent(new Event("pointerdown"));

		oHandle = this.getHandle();
		assert.ok(oHandle, "Handle element exists");
		sText = oHandle.firstChild.textContent;
		assert.equal(sText, TableUtils.getResourceText("TBL_SCROLL_HANDLE_ROWS", [1, 10]));

		// With 2 fixed top and 2 fixed bottom rows (6 scrollable rows visible).
		const oRowMode = this.oTable.getRowMode();
		oRowMode.setFixedTopRowCount(2);
		oRowMode.setFixedBottomRowCount(2);

		oVSb.dispatchEvent(new Event("pointerdown"));

		oHandle = this.getHandle();
		sText = oHandle.firstChild.textContent;
		assert.equal(sText, TableUtils.getResourceText("TBL_SCROLL_HANDLE_ROWS", [3, 8]));

		oIsLengthFinalStub.restore();
		oVSb.dispatchEvent(new Event("pointerdown"));

		oHandle = this.getHandle();
		sText = oHandle.firstChild.textContent;
		assert.equal(sText, TableUtils.getResourceText("TBL_SCROLL_HANDLE_ROWS_OF", [3, 8, 100]));

		// Simulate a binding that doesn't implement isLengthFinal (e.g. AnalyticalBinding extends TreeBinding, not ListBinding).
		// The optional chaining in setScrollHandleContent must not throw and must fall back to the text without total.
		const oMissingIsLengthFinalStub = sinon.stub(oBinding, "isLengthFinal").value(undefined);
		oVSb.dispatchEvent(new Event("pointerdown"));

		oHandle = this.getHandle();
		sText = oHandle.firstChild.textContent;
		assert.equal(sText, TableUtils.getResourceText("TBL_SCROLL_HANDLE_ROWS", [3, 8]),
			"Falls back to the text without total when the binding doesn't implement isLengthFinal");

		oMissingIsLengthFinalStub.restore();
	});

	QUnit.test("Reuses existing element on repeated calls", function(assert) {
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		oVSb.dispatchEvent(new Event("pointerdown"));
		const oHandle1 = this.getHandle();

		oVSb.dispatchEvent(new Event("pointerdown"));
		const oHandle2 = this.getHandle();

		assert.strictEqual(oHandle1, oHandle2, "The same handle element is reused");
		assert.strictEqual(oVSb.parentElement.querySelectorAll(".sapUiTableVScrHandle").length, 1, "Only one handle element exists in the DOM");
	});

	QUnit.test("hideScrollHandle - hides handle after timeout", function(assert) {
		const clock = sinon.useFakeTimers();
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		oVSb.dispatchEvent(new Event("pointerdown"));
		const oHandle = this.getHandle();
		assert.ok(oHandle, "Handle is shown");

		oVSb.dispatchEvent(new Event("pointerup"));
		assert.ok(oHandle.classList.contains("sapUiTableVScrHandleVisible"), "Visible class still present before timeout");

		clock.tick(3000);
		assert.notOk(oHandle.classList.contains("sapUiTableVScrHandleVisible"), "Visible class removed after timeout");
		clock.restore();
	});

	QUnit.test("hideScrollHandle - debounces repeated calls", function(assert) {
		const clock = sinon.useFakeTimers();
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		oVSb.dispatchEvent(new Event("pointerdown"));
		const oHandle = this.getHandle();

		// First hide call starts a 3s timeout.
		oVSb.dispatchEvent(new Event("pointerup"));
		clock.tick(2000);
		// Second hide call before timeout fires must reset it.
		oVSb.dispatchEvent(new Event("pointerup"));
		clock.tick(2000);
		// Only 2000ms elapsed since last hide call, so handle is still visible.
		assert.ok(oHandle.classList.contains("sapUiTableVScrHandleVisible"), "Handle still visible: debounce reset the timer");

		clock.tick(1001);
		assert.notOk(oHandle.classList.contains("sapUiTableVScrHandleVisible"), "Handle hidden after full 3s from last hide call");
		clock.restore();
	});

	QUnit.test("hideScrollHandle - waits 3000ms after dragging", function(assert) {
		const clock = sinon.useFakeTimers();
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		// Show the handle first.
		oVSb.dispatchEvent(new PointerEvent("pointerdown"));
		const oHandle = this.getHandle();
		assert.ok(oHandle, "Handle is shown");

		// Start a drag on the handle.
		oHandle.dispatchEvent(new PointerEvent("pointerdown", {bubbles: true, cancelable: true, clientY: 100}));
		clock.tick(1000);
		assert.ok(oHandle.classList.contains("sapUiTableVScrHandleVisible"), "Handle stays visible while dragging");

		// End drag.
		document.dispatchEvent(new PointerEvent("pointerup", {bubbles: true}));
		clock.tick(3000);
		assert.notOk(oHandle.classList.contains("sapUiTableVScrHandleVisible"), "Handle hidden after drag ends and timeout fires");
		clock.restore();
	});

	QUnit.test("drag via mouse - updates scrollbar scrollTop", function(assert) {
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		oVSb.dispatchEvent(new PointerEvent("pointerdown"));
		const oHandle = this.getHandle();
		assert.ok(oHandle, "Handle is shown");

		const iScrollRangeBefore = oVSb.scrollHeight - oVSb.clientHeight;
		assert.ok(iScrollRangeBefore > 0, "Table is scrollable");

		// Simulate a pointerdown on the handle at Y=200, then move down by 50px.
		oHandle.dispatchEvent(new PointerEvent("pointerdown", {bubbles: true, cancelable: true, clientY: 200}));
		document.dispatchEvent(new PointerEvent("pointermove", {bubbles: true, clientY: 250}));

		assert.ok(oVSb.scrollTop > 0, "scrollTop increased after dragging the handle down");

		document.dispatchEvent(new PointerEvent("pointerup", {bubbles: true}));
	});

	QUnit.test("drag via touch - updates scrollbar scrollTop", function(assert) {
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		oVSb.dispatchEvent(new PointerEvent("pointerdown"));
		const oHandle = this.getHandle();
		assert.ok(oHandle, "Handle is shown");

		const iScrollRangeBefore = oVSb.scrollHeight - oVSb.clientHeight;
		assert.ok(iScrollRangeBefore > 0, "Table is scrollable");

		oHandle.dispatchEvent(new PointerEvent("pointerdown", {bubbles: true, cancelable: true, clientY: 200}));
		document.dispatchEvent(new PointerEvent("pointermove", {bubbles: true, clientY: 250}));

		assert.ok(oVSb.scrollTop > 0, "scrollTop increased after touch-dragging the handle down");

		document.dispatchEvent(new PointerEvent("pointerup", {bubbles: true}));
	});

	QUnit.test("pointerdown on scrollbar shows handle", function(assert) {
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		assert.notOk(this.getHandle(), "Handle does not exist before pointerdown");
		oVSb.dispatchEvent(new Event("pointerdown"));
		assert.ok(this.getHandle(), "Handle exists after pointerdown on scrollbar");
		assert.ok(this.getHandle().classList.contains("sapUiTableVScrHandleVisible"), "Handle is visible after pointerdown");
	});

	QUnit.test("pointerup on scrollbar schedules hide", function(assert) {
		const clock = sinon.useFakeTimers();
		this.oTable.setShowScrollHandle(library.ShowScrollHandle.On);
		const oVSb = this.oTable._getScrollExtension().getVerticalScrollbar();

		oVSb.dispatchEvent(new Event("pointerdown"));
		const oHandle = this.getHandle();
		oVSb.dispatchEvent(new Event("pointerup"));

		clock.tick(3000);
		assert.notOk(oHandle.classList.contains("sapUiTableVScrHandleVisible"), "Handle is hidden after pointerup and timeout");
		clock.restore();
	});
});