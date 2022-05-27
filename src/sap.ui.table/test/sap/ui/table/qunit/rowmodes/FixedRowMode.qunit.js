/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/rowmodes/FixedRowMode",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/plugins/PluginBase",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library"
], function(
	TableQUnitUtils, FixedRowMode, Table, Column, RowAction, PluginBase, TableUtils, library
) {
	"use strict";

	var VisibleRowCountMode = library.VisibleRowCountMode;
	var HeightTestControl = TableQUnitUtils.HeightTestControl;
	var aDensities = ["sapUiSizeCozy", "sapUiSizeCompact", "sapUiSizeCondensed", undefined];

	QUnit.module("Legacy support", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCountMode: VisibleRowCountMode.Fixed,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Instance", function(assert) {
		assert.ok(TableUtils.isA(this.oTable._getRowMode(), "sap.ui.table.rowmodes.FixedRowMode"),
			"The table creates an instance of sap.ui.table.rowmodes.FixedRowMode");
	});

	QUnit.test("Property getters", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			visibleRowCountMode: VisibleRowCountMode.Fixed,
			visibleRowCount: 5,
			fixedRowCount: 1,
			fixedBottomRowCount: 2,
			rowHeight: 8
		});
		var oMode = oTable._getRowMode();

		assert.strictEqual(oMode.getRowCount(), 5, "The row count is taken from the table");
		assert.strictEqual(oMode.getFixedTopRowCount(), 1, "The fixed top row count is taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 2, "The fixed bottom row count is taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 8, "The row content height is taken from the table");

		oMode.setRowCount(10);
		oMode.setFixedTopRowCount(10);
		oMode.setFixedBottomRowCount(10);
		oMode.setRowContentHeight(10);

		assert.strictEqual(oMode.getRowCount(), 5,
			"After setting the property on the mode, the row count is still taken from the table");
		assert.strictEqual(oMode.getFixedTopRowCount(), 1,
			"After setting the property on the mode, the fixed row count is still taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 2,
			"After setting the property on the mode, the fixed bottom row count is still taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 8,
			"After setting the property on the mode, the row content height is still taken from the table");

		oTable.setVisibleRowCount(10);
		oTable.setFixedRowCount(2);
		oTable.setFixedBottomRowCount(3);
		oTable.setRowHeight(13);

		assert.strictEqual(oMode.getRowCount(), 10,
			"After setting the property on the table, the new row count is taken from the table");
		assert.strictEqual(oMode.getFixedTopRowCount(), 2,
			"After setting the property on the table, the new fixed row count is taken from the table");
		assert.strictEqual(oMode.getFixedBottomRowCount(), 3,
			"After setting the property on the table, the new fixed bottom row count is taken from the table");
		assert.strictEqual(oMode.getRowContentHeight(), 13,
			"After setting the property on the table, the new row content height is taken from the table");

		oTable.destroy();
	});

	QUnit.test("#getRowContainerStyles", function(assert) {
		var oMode = this.oTable._getRowMode();

		sinon.stub(oMode, "getComputedRowCounts").returns({count: 9});
		sinon.stub(oMode, "getBaseRowHeightOfTable").returns(9);

		assert.deepEqual(oMode.getRowContainerStyles(), {
			minHeight: "81px"
		});
	});

	QUnit.test("Row height", function(assert) {
		var oTable = this.oTable;
		var sequence = Promise.resolve();

		oTable.addColumn(new Column({template: new HeightTestControl()}));
		oTable.addColumn(new Column({template: new HeightTestControl()}));
		oTable.setFixedColumnCount(1);
		oTable.setRowActionCount(1);
		oTable.setRowActionTemplate(new RowAction());

		function test(mTestSettings) {
			sequence = sequence.then(function() {
				oTable.setRowHeight(mTestSettings.rowHeight || 0);
				oTable.getColumns()[1].setTemplate(new HeightTestControl({height: (mTestSettings.templateHeight || 1) + "px"}));
				TableQUnitUtils.setDensity(oTable, mTestSettings.density);

				return oTable.qunit.whenRenderingFinished();
			}).then(function() {
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
				expectedHeight: TableUtils.DefaultRowHeight[sDensity] * 2 + 1
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Less than default",
				density: sDensity,
				rowHeight: 20,
				expectedHeight: 21
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Less than default; With large content",
				density: sDensity,
				rowHeight: 20,
				templateHeight: 100,
				expectedHeight: 101
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Greater than default",
				density: sDensity,
				rowHeight: 100,
				expectedHeight: 101
			});
		});

		aDensities.forEach(function(sDensity) {
			test({
				title: "Application-defined height; Greater than default; With large content",
				density: sDensity,
				rowHeight: 100,
				templateHeight: 120,
				expectedHeight: 121
			});
		});

		return sequence.then(function() {
			TableQUnitUtils.setDensity(oTable, "sapUiSizeCozy");
		});
	});

	QUnit.module("Row height", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode(),
				columns: [
					new Column({template: new HeightTestControl({height: "1px"})}),
					new Column({template: new HeightTestControl({height: "1px"})})
				],
				fixedColumnCount: 1,
				rowActionCount: 1,
				rowActionTemplate: new RowAction(),
				rows: {path: "/"},
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
				oTable.getColumns()[1].setTemplate(new HeightTestControl({height: (mTestSettings.templateHeight || 1) + "px"}));
				TableQUnitUtils.setDensity(oTable, mTestSettings.density);

				return oTable.qunit.whenRenderingFinished();

			}).then(function() {
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
				oTable.setColumnHeaderHeight(mTestSettings.columnHeaderHeight || 0);
				oTable.getRowMode().setRowContentHeight(mTestSettings.rowContentHeight || 0);
				oTable.getColumns()[1].setLabel(new HeightTestControl({height: (mTestSettings.labelHeight || 1) + "px"}));
				TableQUnitUtils.setDensity(oTable, mTestSettings.density);

				return oTable.qunit.whenRenderingFinished();

			}).then(function() {
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

	QUnit.module("Hide empty rows");

	QUnit.test("Initialize with hideEmptyRows=false", function(assert) {
		var oDisableNoData = sinon.spy(FixedRowMode.prototype, "disableNoData");
		var oEnableNoData = sinon.spy(FixedRowMode.prototype, "enableNoData");
		var oRowMode = new FixedRowMode();

		assert.ok(oDisableNoData.notCalled, "#disableNoData was not called");
		assert.ok(oEnableNoData.notCalled, "#enableNoData was not called");

		oDisableNoData.restore();
		oEnableNoData.restore();
		oRowMode.destroy();
	});

	QUnit.test("Initialize with hideEmptyRows=true", function(assert) {
		var oDisableNoData = sinon.spy(FixedRowMode.prototype, "disableNoData");
		var oEnableNoData = sinon.spy(FixedRowMode.prototype, "enableNoData");
		var oRowMode = new FixedRowMode({
			hideEmptyRows: true
		});

		assert.equal(oDisableNoData.callCount, 1, "#disableNoData was called once");
		assert.ok(oEnableNoData.notCalled, "#enableNoData was not called");

		oDisableNoData.restore();
		oEnableNoData.restore();
		oRowMode.destroy();
	});

	QUnit.test("Change 'hideEmptyRows' property", function(assert) {
		var oRowMode = new FixedRowMode();
		var oDisableNoData = sinon.spy(oRowMode, "disableNoData");
		var oEnableNoData = sinon.spy(oRowMode, "enableNoData");

		oRowMode.setHideEmptyRows(false);
		assert.ok(oDisableNoData.notCalled, "Change from true to false: #disableNoData was not called");
		assert.equal(oEnableNoData.callCount, 1, "Change from true to false: #enableNoData was called once");

		oDisableNoData.resetHistory();
		oEnableNoData.resetHistory();
		oRowMode.setHideEmptyRows(true);
		assert.equal(oDisableNoData.callCount, 1, "Change from false to true: #disableNoData was called once");
		assert.ok(oEnableNoData.notCalled, "Change from false to true: #enableNoData was not called");
	});

	QUnit.module("Get contexts", {
		beforeEach: function() {
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
			this.oGetContextsSpy.restore();
		},
		createTable: function(bVariableRowHeightEnabled) {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode(),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				_bVariableRowHeightEnabled: bVariableRowHeightEnabled
			});

			return this.oTable;
		}
	});

	QUnit.test("Initialization", function(assert) {
		return this.createTable().qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(this.oGetContextsSpy.callCount, 1, "Method to get contexts called once");
			assert.ok(this.oGetContextsSpy.calledWithExactly(0, 10, 100), "The call considers the row count");
		}.bind(this));
	});

	QUnit.test("Initialization; Variable row heights", function(assert) {
		return this.createTable(true).qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(this.oGetContextsSpy.callCount, 1, "Method to get contexts called once");
			assert.ok(this.oGetContextsSpy.calledWithExactly(0, 11, 100), "The call considers the row count");
		}.bind(this));
	});

	QUnit.test("Change row count", function(assert) {
		var oTable = this.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		oTable.setFirstVisibleRow(10);

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();

			oTable.getRowMode().setRowCount(8);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1, "Decreased row count: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(10, 8, 100), "Decreased row count: The call considers the row count");

			oGetContextsSpy.resetHistory();
			oTable.getRowMode().setRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1, "Increased row count: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(10, 10, 100), "Decreased row count: The call considers the row count");

			oTable.setFirstVisibleRow(100);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getRowMode().setRowCount(8);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1,
				"Decreased row count when scrolled to bottom: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(90, 8, 100),
				"Decreased row count when scrolled to bottom: The call considers the row count");

			oTable.setFirstVisibleRow(100);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getRowMode().setRowCount(10);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oGetContextsSpy.callCount, 1,
				"Increased row count when scrolled to bottom: Method to get contexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(90, 10, 100),
				"Increased row count when scrolled to bottom: The call considers the row count");
		});
	});

	QUnit.module("Row count constraints", {
		before: function() {
			this.TestPlugin = PluginBase.extend("sap.ui.table.plugins.test.Plugin");
		},
		beforeEach: function() {
			this.oPlugin = new this.TestPlugin();
			this.oRowMode = new FixedRowMode();
			this.oTable = TableQUnitUtils.createTable({
				dependents: [this.oPlugin],
				rowMode: this.oRowMode,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [TableQUnitUtils.createTextColumn()]
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Force fixed rows", function(assert) {
		this.oPlugin.setRowCountConstraints({fixedTop: true, fixedBottom: true});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertRenderedRows(assert, this.oTable, 1, 8, 1);
		}.bind(this));
	});

	QUnit.test("Force fixed rows if row count too low", function(assert) {
		this.oRowMode.setRowCount(1);
		this.oPlugin.setRowCountConstraints({fixedTop: true, fixedBottom: true});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 1, 0);
		}.bind(this));
	});

	QUnit.test("Disable fixed rows", function(assert) {
		this.oRowMode.setFixedTopRowCount(2);
		this.oRowMode.setFixedBottomRowCount(2);
		this.oPlugin.setRowCountConstraints({fixedTop: false, fixedBottom: false});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertRenderedRows(assert, this.oTable, 0, 10, 0);
		}.bind(this));
	});

	QUnit.test("Change constraints", function(assert) {
		var that = this;

		this.oRowMode.setFixedTopRowCount(2);
		this.oRowMode.setFixedBottomRowCount(2);
		this.oPlugin.setRowCountConstraints({fixedTop: false, fixedBottom: false});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			that.oPlugin.setRowCountConstraints({fixedTop: false});
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertRenderedRows(assert, that.oTable, 0, 8, 2);
		});
	});
});