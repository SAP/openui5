sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter"
], function(
	TableQUnitUtils,
	TableUtils,
	Sorter,
	Filter
) {
	"use strict";

	const QUnit = TableQUnitUtils.createQUnitTestCollector();

	QUnit.module("RowsUpdated event", {
		afterEach: function() {
			this.oTable.destroy();
		},
		createTable: function(mSettings) {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = TableQUnitUtils.createTable(Object.assign({}, {
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100),
				columns: [
					TableQUnitUtils.createTextColumn({
						label: "Last Name",
						text: "lastName",
						bind: true
					})
						.setSortProperty("lastName")
						.setFilterProperty("lastName")
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

	QUnit.test("Initial rendering without binding", function(assert) {
		this.createTable({rows: ""});
		return this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Initial rendering without binding in invisible container", function(assert) {
		return TableQUnitUtils.hideTestContainer().then(() => {
			this.createTable({rows: ""});
			return this.checkRowsUpdated(assert, []);
		})
			.then(() => {
				this.resetRowsUpdatedSpy();
				return TableQUnitUtils.showTestContainer();
			}).then(() => {
				return this.checkRowsUpdated(assert, []);
			});
	});

	QUnit.test("Initial rendering with binding", function(assert) {
		this.createTable();

		return this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
	});

	QUnit.test("Initial rendering with binding in invisible container", function(assert) {
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

	QUnit.test("Re-render without binding", async function(assert) {
		this.createTable({rows: ""});
		await this.oTable.qunit.whenRenderingFinished();
		this.resetRowsUpdatedSpy();
		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Re-render without binding in invisible container", async function(assert) {
		this.createTable({rows: ""});
		await this.oTable.qunit.whenRenderingFinished();
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.hideTestContainer();
		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		await this.checkRowsUpdated(assert, []);
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.showTestContainer();
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Re-render with binding", async function(assert) {
		this.createTable();
		await this.oTable.qunit.whenRenderingFinished();
		this.resetRowsUpdatedSpy();
		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
	});

	QUnit.test("Re-render with binding in invisible container", async function(assert) {
		this.createTable();
		await this.oTable.qunit.whenRenderingFinished();
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.hideTestContainer();
		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		await this.checkRowsUpdated(assert, [
			TableUtils.RowsUpdateReason.Render
		]);
		this.resetRowsUpdatedSpy();
		await TableQUnitUtils.showTestContainer();
		await this.checkRowsUpdated(assert, []);
	});

	QUnit.test("Sort with Table#sort", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.sort(this.oTable.getColumns()[0], "Ascending");
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	});

	QUnit.test("Sort with Binding#sort", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getBinding().sort(new Sorter(this.oTable.getColumns()[0].getSortProperty()));
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Sort
			]);
		});
	});

	QUnit.test("Filter with Table#filter", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.filter(this.oTable.getColumns()[0], "test");
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	});

	QUnit.test("Filter with Binding#filter", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.getBinding().filter(new Filter(this.oTable.getColumns()[0].getFilterProperty(), "Contains", "test"));
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Filter
			]);
		});
	});

	QUnit.test("Unbind with showNoData=true", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.unbindRows();
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Unbind
			]);
		});
	});

	QUnit.test("Unbind with showNoData=false", function(assert) {
		this.createTable({showNoData: false});

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.unbindRows();
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Unbind
			]);
		});
	});

	QUnit.test("Unbind when invalid", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.invalidate();
			this.oTable.unbindRows();

			// Because the table was invalidated, rows will be re-rendered, clearing all modifications that were done in a "rowsUpdated" event
			// listener. It is therefore not required to fire the event because of the unbind. In general, the "rowsUpdated" event is not fired
			// if the table has no binding for the rows aggregation.
			return this.checkRowsUpdated(assert, []);
		});
	});

	QUnit.test("Bind with client binding", function(assert) {
		this.createTable();
		this.oBindingInfo = this.oTable.getBindingInfo("rows");

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.oTable.unbindRows();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.bindRows(this.oBindingInfo);
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Change
			]);
		});
	});

	QUnit.test("Vertical scrolling", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 100;
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.VerticalScroll
			]);
		});
	});

	QUnit.test("Change first visible row by API call (setFirstVisibleRow)", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.setFirstVisibleRow(1);
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.FirstVisibleRowChange
			]);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.setFirstVisibleRow();
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.FirstVisibleRowChange
			]);
		}).then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.setFirstVisibleRow(null);
			return this.checkRowsUpdated(assert, []);
		});
	});

	QUnit.test("Theme change", function(assert) {
		this.createTable();

		return this.oTable.qunit.whenRenderingFinished().then(() => {
			this.resetRowsUpdatedSpy();
			this.oTable.onThemeChanged();
		}).then(this.oTable.qunit.whenRenderingFinished).then(() => {
			return this.checkRowsUpdated(assert, [
				TableUtils.RowsUpdateReason.Render
			]);
		});
	});

	return QUnit;
});