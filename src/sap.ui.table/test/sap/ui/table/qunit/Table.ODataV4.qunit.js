/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/Table"
], function(
	TableQUnitUtils, Table
) {
	"use strict";

	QUnit.module("Busy Indicator", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				models: TableQUnitUtils.createModelForListDataService(),
				columns: [TableQUnitUtils.createTextColumn()],
				rows: {
					path: "/Products"
				},
				threshold: 5,
				scrollThreshold: 10,
				enableBusyIndicator: true
			});
		},
		afterEach: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("setBusy not called", async function(assert) {
		const oTable = this.oTable;

		await oTable.qunit.whenRenderingFinished();
		await TableQUnitUtils.wait(10); // Wait for the busy state to be set to false

		const oSetBusySpy = sinon.spy(oTable, "setBusy");
		const oScrollExtension = oTable._getScrollExtension();
		const oDataRequestedSpy = sinon.spy(oTable.getBinding("rows"), "fireDataRequested");

		assert.equal(oTable.getBusy(), false, "Table is not busy");

		oScrollExtension.scrollVertically(true, true);
		await TableQUnitUtils.nextEvent("dataRequested", oTable.getBinding("rows"));

		assert.ok(oDataRequestedSpy.calledOnce, "DataRequested event fired");
		assert.ok(oSetBusySpy.notCalled, "setBusy not called");

		oSetBusySpy.restore();
	});

	QUnit.module("Hide/Show table and suspend/resume binding", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				models: TableQUnitUtils.createModelForListDataService(),
				columns: [TableQUnitUtils.createTextColumn()],
				rows: {path: "/Products", suspended: true},
				visible: false
			});
			this.fnBindingContextSpy = sinon.spy(this.oTable.getBinding(), "getContexts");
		},
		afterEach: function() {
			this.oTable?.destroy();
			this.fnBindingContextSpy.restore();
		}
	});

	QUnit.test("Initialized hidden table with suspended binding", async function(assert) {
		await TableQUnitUtils.wait(100);
		assert.ok(this.fnBindingContextSpy.notCalled, "Binding.getContexts() was not called");
		assert.notOk(this.oTable.getRows()[0].getBindingContext(), "Table doesn't have rows with bindingContext");

		this.fnBindingContextSpy.resetHistory();
		this.oTable.setVisible(true);
		this.oTable.getBinding("rows").resume();
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(this.fnBindingContextSpy.called, "Binding.getContexts() was called");
		assert.ok(this.oTable.getRows()[0].getBindingContext(), "Table has rows with bindingContext");
	});

	QUnit.test("Table show/hide at runtime", async function(assert) {
		await TableQUnitUtils.wait(100);
		assert.ok(this.fnBindingContextSpy.notCalled, "Binding.getContexts() was not called");
		assert.notOk(this.oTable.getRows()[0].getBindingContext(), "Table doesn't have rows with bindingContext");

		this.fnBindingContextSpy.resetHistory();
		this.oTable.setVisible(true);
		this.oTable.getBinding("rows").resume();
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(this.fnBindingContextSpy.called, "Binding.getContexts() was called");
		assert.ok(this.oTable.getRows()[0].getBindingContext(), "Table has rows with bindingContext");

		this.fnBindingContextSpy.resetHistory();
		this.oTable.setVisible(false);
		this.oTable.getBinding("rows").suspend();
		await TableQUnitUtils.wait(100);

		assert.ok(this.fnBindingContextSpy.notCalled, "Binding.getContexts() was not called");
		assert.notOk(this.oTable.getRows()[0].getBindingContext(), "Table doesn't have rows with bindingContext");
	});
});