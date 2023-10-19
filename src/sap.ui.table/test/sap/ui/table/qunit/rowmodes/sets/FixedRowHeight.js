sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction"
], function(
	TableQUnitUtils,
	TableUtils,
	Column,
	RowAction
) {
	"use strict";

	const QUnit = TableQUnitUtils.createQUnitTestCollector();
	const HeightTestControl = TableQUnitUtils.HeightTestControl;
	const aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];

	QUnit.module("Row height", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				columns: [
					new Column({template: new HeightTestControl({height: "1px"})}),
					new Column({template: new HeightTestControl({height: "1px"})})
				],
				fixedColumnCount: 1,
				rowActionCount: 1,
				rowActionTemplate: new RowAction(),
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			});
		},
		afterEach: function() {
			TableQUnitUtils.setDensity(this.oTable, "sapUiSizeCozy");
			this.oTable.destroy();
		}
	});

	QUnit.test("Content", function(assert) {
		var oTable = this.oTable;
		var pSequence = Promise.resolve();

		function test(mTestSettings) {
			pSequence = pSequence.then(function() {
				oTable.getRowMode().setRowContentHeight(mTestSettings.rowContentHeight || 0);
				oTable.getColumns()[1].getTemplate().setHeight((mTestSettings.templateHeight || 1) + "px");
				TableQUnitUtils.setDensity(oTable, mTestSettings.density);
				oTable.invalidate();
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				TableQUnitUtils.assertRowHeights(assert, oTable, mTestSettings);
			});
		}

		aDensities.forEach(function(sDensity) {
			test({
				title: "Default height",
				density: sDensity,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity]
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Default height; With large content",
				density: sDensity,
				templateHeight: TableUtils.DefaultRowHeight[sDensity] * 2,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity]
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Less than default",
				density: sDensity,
				rowContentHeight: 20,
				expectedHeight: 21
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Less than default; With large content",
				density: sDensity,
				rowContentHeight: 20,
				templateHeight: 100,
				expectedHeight: 21
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Greater than default",
				density: sDensity,
				rowContentHeight: 100,
				expectedHeight: 101
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Greater than default; With large content",
				density: sDensity,
				rowContentHeight: 100,
				templateHeight: 120,
				expectedHeight: 101
			});
		});

		return pSequence;
	});

	QUnit.test("Header", function(assert) {
		var oTable = this.oTable;
		var pSequence = Promise.resolve();

		function test(mTestSettings) {
			pSequence = pSequence.then(function() {
				oTable.getRowMode().setRowContentHeight(mTestSettings.rowContentHeight || 0);
				TableQUnitUtils.setDensity(oTable, mTestSettings.density);
				oTable.invalidate();
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				TableQUnitUtils.assertColumnHeaderHeights(assert, oTable, mTestSettings);
			});
		}

		aDensities.forEach(function(sDensity) {
			test({
				title: "Row content height should not apply to header rows",
				density: sDensity,
				rowContentHeight: 55,
				expectedHeight: TableUtils.DefaultRowHeight[sDensity === "sapUiSizeCondensed" ? "sapUiSizeCompact" : sDensity]
			});
		});

		return pSequence;
	});

	return QUnit;
});