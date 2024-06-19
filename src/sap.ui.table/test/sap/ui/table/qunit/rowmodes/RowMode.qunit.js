/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/rowmodes/RowMode",
	"sap/ui/table/Table",
	"sap/ui/table/utils/TableUtils"
], function(
	TableQUnitUtils,
	RowMode,
	Table,
	TableUtils
) {
	"use strict";

	const RowModeSubclass = RowMode.extend("sap.ui.table.test.RowModeSubClass", {
		getMinRequestLength: function() {
			return 0;
		},
		getComputedRowCounts: function() {
			return {
				count: 1,
				scrollable: 1,
				fixedTop: 0,
				fixedBottom: 0
			};
		},
		getTableStyles: function() {
			return {};
		},
		getRowContainerStyles: function() {
			return {};
		},
		getTableBottomPlaceholderStyles: function() {
			return {};
		},
		attachEvents: function() {
			this.delegate = {
				onBeforeRendering: function() {
					this.updateTable();
				},
				onAfterRendering: function() {
					this.fireRowsUpdated();
				}
			};
			TableUtils.addDelegate(this.getTable(), this.delegate, this);
		},
		detachEvents: function() {
			TableUtils.removeDelegate(this.getTable(), this.delegate);
		}
	});

	QUnit.module("Inheriting from RowMode");

	QUnit.test("Abstract methods", function(assert) {
		const InvalidSubclass = RowMode.extend("sap.ui.table.test.RowModeInvalidSubClass");
		const oMode = new InvalidSubclass();

		assert.throws(oMode.getMinRequestLength, "#getMinRequestLength throws an error if not implemented in subclass");
		assert.throws(oMode.getComputedRowCounts, "#getComputedRowCounts throws an error if not implemented in subclass");
		assert.throws(oMode.getTableStyles, "#getTableStyles throws an error if not implemented in subclass");
		assert.throws(oMode.getRowContainerStyles, "#getRowContainerStyles throws an error if not implemented in subclass");
	});

	QUnit.module("Methods", {
		beforeEach: function() {
			this.oRowMode = new RowModeSubclass();
			this.oTable = new Table();
		},
		afterEach: function() {
			this.oRowMode.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("computeStandardizedRowCounts", function(assert) {
		const aTestParameters = [
			{input: [-1, -1, -1], output: {count: 0, scrollable: 0, fixedTop: 0, fixedBottom: 0}},
			{input: [-1, 10, 10], output: {count: 0, scrollable: 0, fixedTop: 0, fixedBottom: 0}},
			{input: [5, 10, 10], output: {count: 5, scrollable: 1, fixedTop: 3, fixedBottom: 1}},
			{input: [3, 10, 10], output: {count: 3, scrollable: 1, fixedTop: 1, fixedBottom: 1}},
			{input: [2, 10, 10], output: {count: 2, scrollable: 1, fixedTop: 1, fixedBottom: 0}},
			{input: [1, 10, 10], output: {count: 1, scrollable: 1, fixedTop: 0, fixedBottom: 0}},
			{input: [5, 0, 10], output: {count: 5, scrollable: 1, fixedTop: 0, fixedBottom: 4}},
			{input: [5, 10, 0], output: {count: 5, scrollable: 1, fixedTop: 4, fixedBottom: 0}},
			{input: [5, -1, -1], output: {count: 5, scrollable: 5, fixedTop: 0, fixedBottom: 0}},
			{input: [5, 2, 0], output: {count: 5, scrollable: 3, fixedTop: 2, fixedBottom: 0}},
			{input: [5, 0, 2], output: {count: 5, scrollable: 3, fixedTop: 0, fixedBottom: 2}},
			{input: [5, 2, 2], output: {count: 5, scrollable: 1, fixedTop: 2, fixedBottom: 2}},
			{input: [10, 2, 2], output: {count: 10, scrollable: 6, fixedTop: 2, fixedBottom: 2}},
			{input: [10, 2, 2], output: {count: 10, scrollable: 8, fixedTop: 1, fixedBottom: 1}, constraints: {fixedTop: true, fixedBottom: true}},
			{input: [10, 2, 2], output: {count: 10, scrollable: 9, fixedTop: 1, fixedBottom: 0}, constraints: {fixedTop: true, fixedBottom: false}},
			{input: [10, 2, 2], output: {count: 10, scrollable: 9, fixedTop: 0, fixedBottom: 1}, constraints: {fixedTop: false, fixedBottom: true}},
			{input: [10, 2, 2], output: {count: 10, scrollable: 10, fixedTop: 0, fixedBottom: 0}, constraints: {fixedTop: false, fixedBottom: false}},
			{input: [10, 2, 2], output: {count: 10, scrollable: 7, fixedTop: 1, fixedBottom: 2}, constraints: {fixedTop: true}},
			{input: [10, 2, 2], output: {count: 10, scrollable: 8, fixedTop: 0, fixedBottom: 2}, constraints: {fixedTop: false}},
			{input: [10, 2, 2], output: {count: 10, scrollable: 7, fixedTop: 2, fixedBottom: 1}, constraints: {fixedBottom: true}},
			{input: [10, 2, 2], output: {count: 10, scrollable: 8, fixedTop: 2, fixedBottom: 0}, constraints: {fixedBottom: false}},
			{input: [5, 10, 10], output: {count: 5, scrollable: 3, fixedTop: 1, fixedBottom: 1}, constraints: {fixedTop: true, fixedBottom: true}},
			{input: [5, 10, 10], output: {count: 5, scrollable: 5, fixedTop: 0, fixedBottom: 0}, constraints: {fixedTop: false, fixedBottom: false}},
			{input: [5, 0, 10], output: {count: 5, scrollable: 4, fixedTop: 1, fixedBottom: 0}, constraints: {fixedTop: true, fixedBottom: false}},
			{input: [5, 10, 0], output: {count: 5, scrollable: 4, fixedTop: 0, fixedBottom: 1}, constraints: {fixedTop: false, fixedBottom: true}},
			{input: [1, 0, 0], output: {count: 1, scrollable: 1, fixedTop: 0, fixedBottom: 0}, constraints: {fixedTop: true, fixedBottom: true}},
			{input: [2, 0, 0], output: {count: 2, scrollable: 1, fixedTop: 1, fixedBottom: 0}, constraints: {fixedTop: true, fixedBottom: true}},
			{input: [3, 0, 0], output: {count: 3, scrollable: 1, fixedTop: 1, fixedBottom: 1}, constraints: {fixedTop: true, fixedBottom: true}}
		];
		const oGetRowCountConstraints = this.stub(this.oRowMode, "getRowCountConstraints");

		for (let i = 0; i < aTestParameters.length; i++) {
			const mTestParameter = aTestParameters[i];
			oGetRowCountConstraints.returns(mTestParameter.constraints || {});
			assert.deepEqual(this.oRowMode.computeStandardizedRowCounts.apply(this.oRowMode, mTestParameter.input), mTestParameter.output,
				"(count: " + mTestParameter.input[0]
				+ ", fixedTop: " + mTestParameter.input[1]
				+ ", fixedBottom: " + mTestParameter.input[2] + ")"
				+ " => " + JSON.stringify(mTestParameter.output, null, 1));
		}
	});

	QUnit.test("getBaseRowHeightOfTable", function(assert) {
		assert.strictEqual(this.oRowMode.getBaseRowHeightOfTable(), 0, "Returns 0 if not child of a table");

		this.stub(this.oTable, "_getBaseRowHeight").returns(11);
		this.oTable.setRowMode(this.oRowMode);
		assert.strictEqual(this.oRowMode.getBaseRowHeightOfTable(), 11, "Returns the default row height of the table");
	});

	QUnit.test("getTotalRowCountOfTable", function(assert) {
		assert.strictEqual(this.oRowMode.getTotalRowCountOfTable(), 0, "Returns 0 if not child of a table");

		this.stub(this.oTable, "_getTotalRowCount").returns(11);
		this.oTable.setRowMode(this.oRowMode);
		assert.strictEqual(this.oRowMode.getTotalRowCountOfTable(), 11, "Returns the total row count of the table");
	});

	QUnit.module("NoData", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rowMode: new RowModeSubclass(),
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [
					TableQUnitUtils.createTextColumn()
				]
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("isNoDataDisabled", function(assert) {
		assert.notOk(this.oTable.getRowMode().isNoDataDisabled(), "Initially");
		this.oTable.getRowMode().disableNoData();
		assert.ok(this.oTable.getRowMode().isNoDataDisabled(), "Disabled");
		this.oTable.getRowMode().enableNoData();
		assert.notOk(this.oTable.getRowMode().isNoDataDisabled(), "Enabled");
	});

	QUnit.test("After rendering, when NoData would be shown but is disabled", async function(assert) {
		this.oTable.destroy();
		this.oTable = await TableQUnitUtils.createTable({
			rowMode: new RowModeSubclass(),
			rows: "{/}",
			models: TableQUnitUtils.createJSONModelWithEmptyRows(0),
			columns: [
				TableQUnitUtils.createTextColumn()
			]
		}, function(oTable) {
			oTable.getRowMode().disableNoData();
		});
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false);
	});

	QUnit.test("Enable when it is disabled in the table", async function(assert) {
		this.oTable.setShowNoData(false);
		this.oTable.unbindRows();
		this.oTable.getRowMode().enableNoData();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false);
	});

	QUnit.test("Enable with data", async function(assert) {
		this.oTable.getRowMode().enableNoData();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false);
	});

	QUnit.test("Disable/Enable without data", async function(assert) {
		this.oTable.unbindRows();
		this.oTable.getRowMode().disableNoData();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Disable");

		this.oTable.getRowMode().disableNoData();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, false, "Disable again");

		this.oTable.getRowMode().enableNoData();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true, "Enable");

		this.oTable.getRowMode().enableNoData();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true, "Enable again");
	});

	QUnit.test("No columns", async function(assert) {
		this.oTable.removeAllColumns();
		this.oTable.setShowNoData(false);
		this.oTable.getRowMode().disableNoData();
		await this.oTable.qunit.whenRenderingFinished();
		TableQUnitUtils.assertNoDataVisible(assert, this.oTable, true, "Disable");
	});
});