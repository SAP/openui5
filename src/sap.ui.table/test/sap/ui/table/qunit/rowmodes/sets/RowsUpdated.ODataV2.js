sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/core/Core"
], function(
	TableQUnitUtils,
	TableUtils,
	Core
) {
	"use strict";

	const QUnit = TableQUnitUtils.createQUnitTestCollector();

	QUnit.module("RowsUpdated event", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			this.oMockServer.destroy();
		},
		createTable: function(mSettings) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = TableQUnitUtils.createTable(Object.assign({}, {
				rows: "{/Products}",
				models: TableQUnitUtils.createODataModel(),
				columns: [
					TableQUnitUtils.createTextColumn({
						label: "Name",
						text: "Name",
						bind: true
					})
					.setSortProperty("Name")
					.setFilterProperty("Name")
				]
			}, mSettings), (oTable) => {
				oTable.qunit.aRowsUpdatedEvents = [];
				oTable.attachEvent("_rowsUpdated", (oEvent) => {
					oTable.qunit.aRowsUpdatedEvents.push(oEvent.getParameter("reason"));
				});
			});

			return this.oTable;
		},
		checkRowsUpdated: function(assert, aExpectedReasons, iDelay) {
			return new Promise((resolve) => {
				setTimeout(() => {
					assert.deepEqual(this.oTable.qunit.aRowsUpdatedEvents, aExpectedReasons,
						aExpectedReasons.length > 0
							? "The event _rowsUpdated has been fired in order with reasons: " + aExpectedReasons.join(", ")
							: "The event _rowsUpdated has not been fired"
					);
					resolve();
				}, iDelay == null ? 500 : iDelay);
			});
		},
		resetRowsUpdatedSpy: function() {
			this.oTable.qunit.aRowsUpdatedEvents = [];
		}
	});

	QUnit.test("Initial rendering", function(assert) {
		this.createTable();
		return this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
	});

	QUnit.test("Initial rendering in invisible container", function(assert) {
		return TableQUnitUtils.hideTestContainer().then(() => {
			this.createTable();
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			return TableQUnitUtils.showTestContainer();
		}).then(() => {
			return this.checkRowsUpdated(assert, []);
		});
	});

	QUnit.test("Re-render and refresh", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.invalidate();
			this.oTable.getBinding().refresh(true);
			Core.applyChanges();

			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	});

	QUnit.test("Refresh", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getBinding().refresh(true);

			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Change
			]);
		});
	});

	QUnit.test("Sort", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.sort(this.oTable.getColumns()[0], "Ascending");

			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Sort
			]);
		});
	});

	QUnit.test("Filter", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.filter(this.oTable.getColumns()[0], "test");

			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Filter
			]);
		});
	});

	QUnit.test("Bind", function(assert) {
		this.createTable();
		this.oBindingInfo = this.oTable.getBindingInfo("rows");

		return this.oTable.qunit.whenBindingChange().then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.oTable.unbindRows();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.bindRows(this.oBindingInfo);

			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Change
			]);
		});
	});

	return QUnit;
});