/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/rowmodes/FixedRowMode",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(FixedRowMode, Table, Column, RowAction, TableUtils, library, TableQUnitUtils, JSONModel, Device) {
	"use strict";

	var VisibleRowCountMode = library.VisibleRowCountMode;
	var HeightTestControl = TableQUnitUtils.HeightTestControl;

	QUnit.module("Legacy support", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCountMode: VisibleRowCountMode.Fixed,
				visibleRowCount: 5,
				fixedRowCount: 1,
				fixedBottomRowCount: 2,
				rowHeight: 8
			});
			this.oMode = this.oTable._getRowMode();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Property getters", function(assert) {
		var oTable = this.oTable;
		var oMode = this.oMode;

		assert.strictEqual(oMode.getRowCount(), 5, "The row count is taken from the table");
		assert.strictEqual(oMode.getFixedTopRowCount(), 1, "The fixed top row count is taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 2, "The fixed bottom row count is taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 8, "The row content height is taken from the table");

		oMode.setRowCount(10);
		oMode.setFixedTopRowCount(10);
		oMode.setFixedBottomRowCount(10);
		oMode.setRowContentHeight(10);

		assert.strictEqual(oMode.getRowCount(), 5, "The row count is taken from the table");
		assert.strictEqual(oMode.getFixedTopRowCount(), 1, "The fixed row count is taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 2, "The fixed bottom row count is taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 8, "The row content height is taken from the table");

		oTable.setVisibleRowCount(10);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(3);
		oTable.setRowHeight(13);

		assert.strictEqual(oMode.getRowCount(), 10, "The row count is taken from the table");
		assert.strictEqual(oMode.getFixedTopRowCount(), 2, "The fixed row count is taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 3, "The fixed bottom row count is taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 13, "The row content height is taken from the table");
	});

	QUnit.test("#getRowContainerStyles", function(assert) {
		sinon.stub(this.oMode, "getComputedRowCounts").returns({count: 9});
		sinon.stub(this.oMode, "getBaseRowHeightOfTable").returns(9);

		assert.deepEqual(this.oMode.getRowContainerStyles(), {
			minHeight: "81px"
		});
	});

	QUnit.module("Rendering");

	QUnit.test("Row Height", function(assert) {
		var oBody = document.body;
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var oTable = TableQUnitUtils.createTable({
			columns: [
				new Column({template: new HeightTestControl({height: "1px"})}),
				new Column({template: new HeightTestControl({height: "1px"})})
			],
			fixedColumnCount: 1,
			rowActionCount: 1,
			rowActionTemplate: new RowAction(),
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
		}, function(oTable) {
			oTable.setRowMode(new FixedRowMode());
		});
		var sequence = oTable.qunit.whenRenderingFinished();

		/* BCP: 1880420532 (IE), 1880455493 (Edge) */
		if (Device.browser.msie || Device.browser.edge) {
			document.getElementById("qunit-fixture").classList.remove("visible");
		}

		function test(mTestSettings) {
			sequence = sequence.then(function() {
				oTable.getRowMode().setRowContentHeight(mTestSettings.rowContentHeight || 0);
				oTable.getColumns()[1].setTemplate(new HeightTestControl({height: (mTestSettings.templateHeight || 1) + "px"}));
				oBody.classList.remove("sapUiSizeCozy");
				oBody.classList.remove("sapUiSizeCompact");
				oTable.removeStyleClass("sapUiSizeCondensed");

				if (mTestSettings.density != null) {
					if (mTestSettings.density === "sapUiSizeCondensed") {
						oBody.classList.add("sapUiSizeCompact");
						oTable.addStyleClass("sapUiSizeCondensed");
					} else {
						oBody.classList.add(mTestSettings.density);
					}
				}

				sap.ui.getCore().applyChanges();
				return oTable.qunit.whenRenderingFinished();

			}).then(function() {
				var sDensity = mTestSettings.density ? mTestSettings.density.replace("sapUiSize", "") : "undefined";
				mTestSettings.title += " (Density=\"" + sDensity + "\")";

				var aRowDomRefs = oTable.getRows()[0].getDomRefs();
				assert.strictEqual(aRowDomRefs.rowSelector.getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Selector height is ok");
				assert.strictEqual(aRowDomRefs.rowFixedPart.getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Fixed part height is ok");
				assert.strictEqual(aRowDomRefs.rowScrollPart.getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Scrollable part height is ok");
				assert.strictEqual(aRowDomRefs.rowAction.getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Action height is ok");
			});
		}

		aDensities.forEach(function(sDensity) {
			test({
				title: "Row height should be fixed to default height",
				density: sDensity,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity]
			});

			test({
				title: "Row height should be fixed to default height",
				density: sDensity,
				templateHeight: TableUtils.DefaultRowHeight[sDensity] * 2,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity]
			});

			test({
				title: "Application defined height should override default height",
				density: sDensity,
				rowContentHeight: 20,
				expectedHeight: 21
			});

			test({
				title: "Application defined height should override default height",
				density: sDensity,
				rowContentHeight: 20,
				templateHeight: 100,
				expectedHeight: 21
			});

			test({
				title: "Application defined height should override default height",
				density: sDensity,
				rowContentHeight: 100,
				expectedHeight: 101
			});

			test({
				title: "Application defined height should override default height",
				density: sDensity,
				rowContentHeight: 100,
				templateHeight: 120,
				expectedHeight: 101
			});
		});

		return sequence.then(function() {
			oTable.destroy();
			oBody.classList.remove("sapUiSizeCompact");
			oBody.classList.add("sapUiSizeCozy");

			/* BCP: 1880420532 (IE), 1880455493 (Edge) */
			if (Device.browser.msie || Device.browser.edge) {
				document.getElementById("qunit-fixture").classList.add("visible");
			}
		});
	});

	QUnit.test("Column Header Height", function(assert) {
		var oBody = document.body;
		var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];
		var oTable = TableQUnitUtils.createTable({
			columns: [
				new Column({template: new HeightTestControl({height: "1px"})}),
				new Column({template: new HeightTestControl({height: "1px"})})
			],
			fixedColumnCount: 1,
			rowActionCount: 1,
			rowActionTemplate: new RowAction(),
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
		}, function(oTable) {
			oTable.setRowMode(new FixedRowMode());
		});
		var sequence = oTable.qunit.whenRenderingFinished();
		var iPadding = 14;

		/* BCP: 1880420532 (IE), 1880455493 (Edge) */
		if (Device.browser.msie || Device.browser.edge) {
			document.getElementById("qunit-fixture").classList.remove("visible");
		}

		function test(mTestSettings) {
			sequence = sequence.then(function() {
				oTable.setColumnHeaderHeight(mTestSettings.columnHeaderHeight || 0);
				oTable.getRowMode().setRowContentHeight(mTestSettings.rowContentHeight || 0);
				oTable.getColumns()[1].setLabel(new HeightTestControl({height: (mTestSettings.labelHeight || 1) + "px"}));
				oBody.classList.remove("sapUiSizeCozy");
				oBody.classList.remove("sapUiSizeCompact");
				oTable.removeStyleClass("sapUiSizeCondensed");

				if (mTestSettings.density != null) {
					if (mTestSettings.density === "sapUiSizeCondensed") {
						oBody.classList.add("sapUiSizeCompact");
						oTable.addStyleClass("sapUiSizeCondensed");
					} else {
						oBody.classList.add(mTestSettings.density);
					}
				}

				sap.ui.getCore().applyChanges();
				return oTable.qunit.whenRenderingFinished();

			}).then(function() {
				var sDensity = mTestSettings.density ? mTestSettings.density.replace("sapUiSize", "") : "undefined";
				mTestSettings.title += " (Density=\"" + sDensity + "\")";

				var aRowDomRefs = oTable.getDomRef().querySelectorAll(".sapUiTableColHdrTr");
				var oColumnHeaderCnt = oTable.getDomRef().querySelector(".sapUiTableColHdrCnt");

				assert.strictEqual(aRowDomRefs[0].getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Fixed part height is ok");
				assert.strictEqual(aRowDomRefs[1].getBoundingClientRect().height, mTestSettings.expectedHeight,
					mTestSettings.title + ": Scrollable part height is ok");
				assert.strictEqual(oColumnHeaderCnt.getBoundingClientRect().height, mTestSettings.expectedHeight + 1 /* border */,
					mTestSettings.title + ": Column header container height is ok");
			});
		}

		aDensities.forEach(function(sDensity) {
			test({
				title: "Row content height should not apply to header rows",
				density: sDensity,
				labelHeight: 87,
				expectedHeight: 87 + iPadding
			});

			test({
				title: "Row content height should not apply to header rows",
				density: sDensity,
				rowContentHeight: 55,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity === "sapUiSizeCondensed" ? "sapUiSizeCompact" : sDensity]
			});

			test({
				title: "Row content height should not apply to header rows",
				density: sDensity,
				columnHeaderHeight: 55,
				expectedHeight: 55
			});
		});

		return sequence.then(function() {
			oTable.destroy();
			oBody.classList.remove("sapUiSizeCompact");
			oBody.classList.add("sapUiSizeCozy");

			/* BCP: 1880420532 (IE), 1880455493 (Edge) */
			if (Device.browser.msie || Device.browser.edge) {
				document.getElementById("qunit-fixture").classList.add("visible");
			}
		});
	});
});