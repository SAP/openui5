/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/Table"
], function(
	TableQUnitUtils
) {
	"use strict";

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