/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/qunit/rowmodes/shared/RowsUpdated.ODataV2",
	"sap/ui/table/rowmodes/Auto",
	"sap/ui/table/Table",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device"
], function(
	TableQUnitUtils,
	RowsUpdatedTest,
	AutoRowMode,
	Table,
	TableUtils,
	Device
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		rowMode: new AutoRowMode(),
		rows: {path: "/Products"}
	});

	const iDeviceHeight = 550;
	const iComputedRequestLength = 22; // Based on the device height.

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer(200);
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");
			this.iOriginalDeviceHeight = Device.resize.height;
			Device.resize.height = iDeviceHeight;

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oGetContextsSpy.resetHistory();
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			this.oGetContextsSpy.restore();
			Device.resize.height = this.iOriginalDeviceHeight;
		},
		createTable: async function(mSettings, fnBeforePlaceAt) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = await TableQUnitUtils.createTable(Object.assign({}, {
				models: this.oDataModel,
				columns: [
					TableQUnitUtils.createTextColumn({
						label: "Name",
						text: "Name",
						bind: true
					})
				]
			}, mSettings), fnBeforePlaceAt);

			return this.oTable;
		}
	});

	QUnit.test("Initialization if metadata not yet loaded", async function(assert) {
		await this.createTable({models: TableQUnitUtils.createODataModel(null, true)});

		// auto rerender, refreshRows, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, this.oTable.getRowMode().getComputedRowCounts().count, 100);
			assert.notEqual(this.oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Initialization if metadata not yet loaded; Variable row heights", async function(assert) {
		await this.createTable({
			models: TableQUnitUtils.createODataModel(null, true),
			_bVariableRowHeightEnabled: true
		});

		// auto rerender, refreshRows, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, this.oTable.getRowMode().getComputedRowCounts().count + 1, 100);
			assert.notEqual(this.oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Initialization", async function(assert) {
		await this.createTable();

		// refreshRows, auto rerender, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, this.oTable.getRowMode().getComputedRowCounts().count, 100);
			assert.notEqual(this.oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Initialization; Variable row heights", async function(assert) {
		await this.createTable({_bVariableRowHeightEnabled: true});

		// refreshRows, auto rerender, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, this.oTable.getRowMode().getComputedRowCounts().count + 1, 100);
			assert.notEqual(this.oTable.getRowMode().getComputedRowCounts().count + 1, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Initialization; Bound on initialization; threshold = 1", async function(assert) {
		await this.createTable({threshold: 1});

		// refreshRows, auto rerender, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			const iComputedRowCount = this.oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 5);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, iComputedRequestLength, iComputedRowCount);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, iComputedRowCount, iComputedRowCount);
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Initialization; Bound on initialization; Variable row heights; threshold = 1", async function(assert) {
		await this.createTable({threshold: 1, _bVariableRowHeightEnabled: true});

		// refreshRows, auto rerender, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			const iComputedRowCount = this.oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 5);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, iComputedRequestLength, iComputedRowCount + 1);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, iComputedRowCount + 1, iComputedRowCount + 1);
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Initialization; Bound between initialization and rendering; threshold = 1", async function(assert) {
		await this.createTable({threshold: 1, rows: undefined}, function(oTable) {
			oTable.bindRows({path: "/Products"});
		});

		// refreshRows, auto rerender, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			const iComputedRowCount = this.oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			// Threshold is 5, because of the value of the "minRowCount" property.
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 5);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, iComputedRequestLength, iComputedRowCount);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, iComputedRowCount, iComputedRowCount);
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Initialization; Bound after rendering; threshold = 1", async function(assert) {
		await this.createTable({threshold: 1, rows: undefined});
		this.oTable.bindRows({path: "/Products"});

		// refreshRows, auto rerender, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			const iComputedRowCount = this.oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			// Threshold is 5, because of the value of the "minRowCount" property.
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 5);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, iComputedRequestLength, iComputedRowCount);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, iComputedRowCount, iComputedRowCount);
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Initialization; Bound after rendering; With fixed rows; threshold = 1", async function(assert) {
		await this.createTable({
			threshold: 1,
			rows: undefined,
			rowMode: new AutoRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1
			})
		});
		this.oTable.bindRows({path: "/Products"});

		// refreshRows, auto rerender, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			const mRowCounts = this.oTable.getRowMode().getComputedRowCounts();

			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			// Threshold is 5, because of the value of the "minRowCount" property.
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 5);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, iComputedRequestLength - 1, mRowCounts.scrollable);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, mRowCounts.scrollable + 1, mRowCounts.scrollable);
			assert.notEqual(mRowCounts.count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Initialization; Bound after rendering; With fixed rows; threshold = 1, minRowCount: 30", async function(assert) {
		await this.createTable({
			threshold: 1,
			rows: undefined,
			rowMode: new AutoRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1,
				minRowCount: 30
			})
		});
		this.oTable.bindRows({path: "/Products"});

		// refreshRows, auto rerender, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			const iComputedRowCount = this.oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			// Threshold is 30, because of the value of the "minRowCount" property.
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 30, 30);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, 29, 28);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, 29, 28);
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Resize", async function(assert) {
		await this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
		}).then(this.oTable.qunit.$resize({height: "756px"})).then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 1, "Method to get contexts called once");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, this.oTable.getRowMode().getComputedRowCounts().count, 100);
			this.oGetContextsSpy.resetHistory();
		}).then(this.oTable.qunit.resetSize).then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 1, "Method to get contexts called once");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, this.oTable.getRowMode().getComputedRowCounts().count, 100);
		});
	});

	QUnit.test("Refresh", async function(assert) {
		await this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().refresh();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, this.oTable.getRowMode().getComputedRowCounts().count, 100);
			assert.notEqual(this.oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Refresh; Variable row heights", async function(assert) {
		await this.createTable({_bVariableRowHeightEnabled: true});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().refresh();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, this.oTable.getRowMode().getComputedRowCounts().count + 1, 100);
			assert.notEqual(this.oTable.getRowMode().getComputedRowCounts().count + 1, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Refresh; With fixed rows; threshold = 1", async function(assert) {
		await this.createTable({
			threshold: 1,
			rowMode: new AutoRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1
			})
		});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().refresh();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			const mRowCounts = this.oTable.getRowMode().getComputedRowCounts();
			assert.equal(this.oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, iComputedRequestLength - 1, mRowCounts.scrollable);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, mRowCounts.scrollable + 1, mRowCounts.scrollable);
		});
	});

	QUnit.test("Refresh; With fixed rows; threshold = 1, minRowCount: 30", async function(assert) {
		await this.createTable({
			threshold: 1,
			rowMode: new AutoRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1,
				minRowCount: 30
			})
		});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().refresh();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 29, 28);
		});
	});

	RowsUpdatedTest.registerTo(QUnit, function(assert, fnOriginalTest) {
		switch (QUnit.config.current.testName) {
			case "Initial rendering":
				return testWithStableRowCount(fnOriginalTest);
			case "Initial rendering in invisible container":
				return RowsUpdatedTestInvisibleInitialRendering.apply(this, arguments);
			default:
				return fnOriginalTest();
		}
	});

	// To add a test case where the table does not need to adjust the row count to the avialable space after rendering.
	function testWithStableRowCount(fnTest) {
		return fnTest().then(() => {
			const oRowMode = TableQUnitUtils.getDefaultSettings().rowMode;

			oRowMode.minRowCount = 10;
			oRowMode.maxRowCount = 10;

			return fnTest().then(() => {
				delete oRowMode.minRowCount;
				delete oRowMode.maxRowCount;
			});
		});
	}

	function RowsUpdatedTestInvisibleInitialRendering(assert, fnOriginalTest) {
		return testWithStableRowCount(() => {
			return TableQUnitUtils.hideTestContainer().then(async () => {
				await this.createTable();
				return this.checkRowsUpdated(assert, []);
			}).then(() => {
				this.resetRowsUpdatedSpy();
				return TableQUnitUtils.showTestContainer();
			}).then(() => {
				return this.checkRowsUpdated(assert, [
					TableUtils.RowsUpdateReason.Render
				]);
			});
		});
	}
});