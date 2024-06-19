/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/qunit/rowmodes/shared/RowsUpdated.ODataV2",
	"sap/ui/table/Table",
	"sap/ui/table/rowmodes/Fixed"
], function(
	TableQUnitUtils,
	RowsUpdatedTest,
	Table,
	FixedRowMode
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		rowMode: new FixedRowMode(),
		rows: {path: "/Products"}
	});

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");

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

		// render, refreshRows, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 10, 100);
		});
	});

	QUnit.test("Initialization if metadata not yet loaded; Variable row heights", async function(assert) {
		await this.createTable({
			models: TableQUnitUtils.createODataModel(null, true),
			_bVariableRowHeightEnabled: true
		});

		// render, refreshRows, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 11, 100);
		});
	});

	QUnit.test("Initialization", async function(assert) {
		await this.createTable();

		// refreshRows, render, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 10, 100);
		});
	});

	QUnit.test("Initialization; With fixed rows", async function(assert) {
		await this.createTable({
			rowMode: new FixedRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1
			})
		});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 4, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 9, 100); // refreshRows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, 9, 100); // render
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, 9, 100); // updateRows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(3), 15, 1, 0, true); // fixed bottom rows
		});
	});

	QUnit.test("Initialization; With fixed rows; firstVisibleRow = 1; threshold = 1", async function(assert) {
		await this.createTable({
			rowMode: new FixedRowMode({
				rowCount: 5,
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1
			}),
			firstVisibleRow: 1,
			threshold: 1
		});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			// refreshRows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 1, 0, true); // fixed top rows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 2, 3, 3); // scrollable rows
			// Fixed bottom rows can only be requested once the count is known.
			// render
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, 1, 0, true); // fixed top rows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(3), 2, 3, 3); // scrollable rows
			// updateRows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(4), 0, 1, 0, true); // fixed top rows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(5), 2, 3, 3); // scrollable rows
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(6), 15, 1, 0, true); // fixed bottom rows
		});
	});

	QUnit.test("Initialization; Variable row heights", async function(assert) {
		await this.createTable({_bVariableRowHeightEnabled: true});

		// refreshRows, render, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 10, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, 11, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, 11, 100);
		});
	});

	QUnit.test("Initialization; Bound on initialization; threshold = 1", async function(assert) {
		await this.createTable({threshold: 1});

		// refreshRows, render, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 10, 10);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, 10, 10);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, 10, 10);
		});
	});

	QUnit.test("Initialization; Bound on initialization; Variable row heights; threshold = 1", async function(assert) {
		await this.createTable({threshold: 1, _bVariableRowHeightEnabled: true});

		// refreshRows, render, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 10, 10);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, 11, 11);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, 11, 11);
		});
	});

	QUnit.test("Initialization; Bound between initialization and rendering; threshold = 1", async function(assert) {
		await this.createTable({threshold: 1, rows: undefined}, function(oTable) {
			oTable.bindRows({path: "/Products"});
		});

		// refreshRows, render, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 10, 10);
		});
	});

	QUnit.test("Initialization; Bound after rendering; threshold = 1", async function(assert) {
		await this.createTable({threshold: 1, rows: undefined});
		this.oTable.bindRows({path: "/Products"});

		// refreshRows, updateRows
		return this.oTable.qunit.whenRenderingFinished().then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 2, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 10, 10);
		});
	});

	QUnit.test("Refresh", async function(assert) {
		await this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().refresh();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 10, 100);
		});
	});

	QUnit.test("Refresh; With fixed rows", async function(assert) {
		await this.createTable({
			rowMode: new FixedRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1
			})
		});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().refresh();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 9, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 0, 9, 100);
			sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 15, 1, 0, true);
		});
	});

	QUnit.test("Refresh; With fixed rows; firstVisibleRow = 1; threshold = 1", async function(assert) {
		await this.createTable({
			rowMode: new FixedRowMode({
				rowCount: 5,
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1
			}),
			firstVisibleRow: 1,
			threshold: 1
		});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().refresh();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			return new Promise((resolve) => {
				setTimeout(() => {
					assert.equal(this.oGetContextsSpy.callCount, 11, "Call count of method to get contexts");
					// Fixed bottom rows can't be requested if the count is unknown, e.g. during refresh. As soon as the binding receives a
					// getContexts call that triggers a request, it ignores subsequent calls. Therefore, only fixed top rows are loaded initially.

					// refreshRows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 1, 0, true); // fixed top rows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 2, 3, 3); // scrollable rows
					// updateRows: Received fixed top rows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, 1, 0, true); // fixed top rows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(3), 2, 3, 3); // scrollable rows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(4), 15, 1, 0, true); // fixed bottom rows
					// updateRows: Received scrollable rows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(5), 0, 1, 0, true); // fixed top rows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(6), 2, 3, 3); // scrollable rows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(7), 15, 1, 0, true); // fixed bottom rows
					// updateRows: Received fixed bottom rows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(8), 0, 1, 0, true); // fixed top rows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(9), 2, 3, 3); // scrollable rows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(10), 15, 1, 0, true); // fixed bottom rows
					resolve();
				}, 500);
			});
		});
	});

	QUnit.test("Refresh; Variable row heights", async function(assert) {
		await this.createTable({_bVariableRowHeightEnabled: true});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().refresh();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			assert.equal(this.oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.alwaysCalledWithExactly(this.oGetContextsSpy, 0, 11, 100);
		});
	});

	QUnit.test("Sort; With fixed rows", async function(assert) {
		await this.createTable({
			rowMode: new FixedRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1
			})
		});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().sort();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			return new Promise((resolve) => {
				setTimeout(() => {
					assert.equal(this.oGetContextsSpy.callCount, 4, "Call count of method to get contexts");
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 9, 100);
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 15, 1, 0, true);
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, 9, 100);
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(3), 15, 1, 0, true);
					resolve();
				}, 500);
			});
		});
	});

	QUnit.test("Sort; With fixed rows, firstVisibleRow = 1, threshold = 1", async function(assert) {
		await this.createTable({
			rowMode: new FixedRowMode({
				rowCount: 5,
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1
			}),
			firstVisibleRow: 1,
			threshold: 1
		});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oGetContextsSpy.resetHistory();
			this.oTable.getBinding().sort();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			return new Promise((resolve) => {
				setTimeout(() => {
					assert.equal(this.oGetContextsSpy.callCount, 6, "Call count of method to get contexts");
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(0), 0, 4, 3); // refreshRows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(1), 15, 1, 0, true); // fixed bottom contexts
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(2), 0, 4, 3); // updateRows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(3), 15, 1, 0, true); // fixed bottom contexts
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(4), 0, 4, 3); // updateRows
					sinon.assert.calledWithExactly(this.oGetContextsSpy.getCall(5), 15, 1, 0, true); // fixed bottom contexts
					resolve();
				}, 500);
			});
		});
	});

	RowsUpdatedTest.registerTo(QUnit);
});