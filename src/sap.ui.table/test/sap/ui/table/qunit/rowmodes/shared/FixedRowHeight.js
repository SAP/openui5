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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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
			this.oTable.qunit.resetDensity();
			this.oTable.destroy();
		}
	});

	QUnit.test("Content", function(assert) {
		const oTable = this.oTable;
		let pSequence = Promise.resolve();

		function test(mTestSettings) {
			pSequence = pSequence.then(async function() {
				oTable.getRowMode().setRowContentHeight(mTestSettings.rowContentHeight || 0);
				oTable.getColumns()[1].getTemplate().setHeight((mTestSettings.templateHeight || 1) + "px");
				await oTable.qunit.setDensity(mTestSettings.density);
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
		const oTable = this.oTable;
		let pSequence = Promise.resolve();

		function test(mTestSettings) {
			pSequence = pSequence.then(async function() {
				oTable.getRowMode().setRowContentHeight(mTestSettings.rowContentHeight || 0);
				await oTable.qunit.setDensity(mTestSettings.density);
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