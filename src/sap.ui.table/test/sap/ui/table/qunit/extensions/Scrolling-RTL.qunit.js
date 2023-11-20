/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device",
	"sap/ui/table/library",
	"sap/ui/table/Column",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/dom/jquery/scrollLeftRTL" // provides jQuery.fn.scrollLeftRTL
], function(
	TableQUnitUtils,
	RowAction,
	RowActionItem,
	FixedRowMode,
	TableUtils,
	Device,
	tableLibrary,
	Column,
	Control,
	jQuery,
	oCore
) {
	"use strict";

	QUnit.module("Scrollbars", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				width: "500px",
				columns: [TableQUnitUtils.createTextColumn().setWidth("500px")],
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(6),
				rowMode: new FixedRowMode({rowCount: 1}),
				rowActionCount: 2,
				rowActionTemplate: new RowAction({items: [new RowActionItem({type: tableLibrary.RowActionType.Navigation})]})
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	// Test fails in Safari, skip until fixed
	QUnit[Device.browser.safari ? "skip" : "test"]("Horizontal scrollbar position", function(assert) {
		var oHSb = this.oTable._getScrollExtension().getHorizontalScrollbar();
		var oHSbContent = this.oTable.getDomRef("hsb-content");
		var oHSbComputedStyle = window.getComputedStyle(oHSb);
		var oHSbContentComputedStyle = window.getComputedStyle(oHSbContent);

		assert.strictEqual(oHSbComputedStyle.marginLeft, "107px", "Left margin");
		assert.strictEqual(oHSbComputedStyle.marginRight, "48px", "Right margin");
		assert.strictEqual(oHSbContentComputedStyle.width, "500px", "Scroll range");
	});

	QUnit.module("Horizontal scrolling", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10),
				columns: [
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createTextColumn().setWidth("800px"),
					TableQUnitUtils.createTextColumn().setWidth("100px"),
					TableQUnitUtils.createTextColumn().setWidth("800px"),
					TableQUnitUtils.createTextColumn().setWidth("100px")
				],
				fixedColumnCount: 1
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Focus", function(assert) {
		var oTable = this.oTable;

		function getScrollLeft() {
			return jQuery(oTable._getScrollExtension().getHorizontalScrollbar()).scrollLeftRTL();
		}

		function isScrolledIntoView(oCell) {
			var oRowContainer = oTable.getDomRef("sapUiTableCtrlScr");
			var iScrollLeft = getScrollLeft();
			var iRowContainerWidth = oRowContainer.clientWidth;
			var iCellLeft = oCell.offsetLeft;
			var iCellRight = iCellLeft + oCell.offsetWidth;
			var iOffsetLeft = iCellLeft - iScrollLeft;
			var iOffsetRight = iCellRight - iRowContainerWidth - iScrollLeft;

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

		return test("Focus header cell in column 3 (scrollable column)", oTable.qunit.getColumnHeaderCell(2), 950, true).then(function() {
			return test("Focus header cell in column 1 (fixed column)", oTable.qunit.getColumnHeaderCell(0), 880, false);
		}).then(function() {
			return test("Focus header cell in column 2 (scrollable column)", oTable.qunit.getColumnHeaderCell(1), 880, true);
		}).then(function() {
			return test("Focus header cell in column 3 (scrollable column)", oTable.qunit.getColumnHeaderCell(2), 100, true);
		}).then(function() {
			return test("Focus header cell in column 4 (scrollable column)", oTable.qunit.getColumnHeaderCell(3), 750, true);
		}).then(function() {
			return test("Focus data cell in column 3, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 2), 950, true);
		}).then(function() {
			return test("Focus data cell in column 1, row 1 (fixed column)", oTable.qunit.getDataCell(0, 0), 880, false);
		}).then(function() {
			return test("Focus data cell in column 2, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 1), 880, true);
		}).then(function() {
			return test("Focus data cell in column 3, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 2), 100, true);
		}).then(function() {
			return test("Focus data cell in column 4, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 3), 750, true);
		}).then(function() {
			oTable.getColumns()[1].setWidth("1000px");
			oTable.getColumns()[3].setWidth("1000px");
			oCore.applyChanges();
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			return test("Focus header cell in column 2 (scrollable column)", oTable.qunit.getColumnHeaderCell(1), 1250, false);
		}).then(function() {
			return test("Focus header cell in column 4 (scrollable column)", oTable.qunit.getColumnHeaderCell(3), 150, false);
		}).then(function() {
			return test("Focus data cell in column 2, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 1), 1250, false);
		}).then(function() {
			return test("Focus data cell in column 2, row 2 (scrollable column)", oTable.qunit.getDataCell(1, 1), 1250, false);
		}).then(function() {
			return test("Focus data cell in column 4, row 1 (scrollable column)", oTable.qunit.getDataCell(0, 3), 150, false);
		}).then(function() {
			return test("Focus data cell in column 4, row 2 (scrollable column)", oTable.qunit.getDataCell(1, 3), 150, false);
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

		var oTable = TableQUnitUtils.createTable({
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
			var oCellContent = oTable.getRows()[0].getCells()[iColumnIndex].getDomRef();

			return oTable.qunit.focus(oCellContent).then(function() {
				var $InnerCellElement = TableUtils.getCell(oTable, oCellContent).find(".sapUiTableCellInner");

				assert.strictEqual($InnerCellElement.scrollLeftRTL(), $InnerCellElement[0].scrollWidth - $InnerCellElement[0].clientWidth,
					sTitle + ": The cell content is not scrolled horizontally");
				assert.strictEqual($InnerCellElement[0].scrollTop, 0, sTitle + ": The cell content is not scrolled vertically");
			});
		}

		return oTable.qunit.whenRenderingFinished().then(function() {
			return test("Fixed column", 0);
		}).then(function() {
			return test("Scrollable column", 1);
		}).then(function() {
			oTable.destroy();
		});
	});
});