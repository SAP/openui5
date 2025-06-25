/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/TreeTable",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/model/controlhelper/TreeBindingProxy"
], function(
	TableQUnitUtils,
	TreeTable,
	FixedRowMode,
	TreeBindingProxy
) {
	"use strict";

	QUnit.module("Busy Indicator", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TreeTable, {
				...TableQUnitUtils.createSettingsForHierarchy(),
				threshold: 1,
				enableBusyIndicator: true,
				rowMode: new FixedRowMode({
					rowCount: 5
				})
			}, function(oTable) {
				oTable._oProxy._bEnableV4 = true;
				oTable.getBinding().resume();
			});
		},
		afterEach: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("Scrolling to existing data", async function(assert) {
		await this.oTable.qunit.whenRenderingFinished();
		this.spy(this.oTable, "setBusy");
		this.oTable.setFirstVisibleRow(1);
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(this.oTable.setBusy.neverCalledWith(true), "Table not set to busy");
	});

	QUnit.module("Hide/Show and suspend/resume TreeTable with ODataV4", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TreeTable, {
				...TableQUnitUtils.createSettingsForHierarchy(),
				visible: false
			}, function(oTable) {
				oTable._oProxy._bEnableV4 = true;
			});

			this.fnBindingContextSpy = sinon.spy(TreeBindingProxy.prototype, "getContexts");
		},
		afterEach: function() {
			this.oTable?.destroy();
			this.fnBindingContextSpy.restore();
		}
	});

	QUnit.test("Initialized hidden table with suspended binding", async function(assert) {
		await TableQUnitUtils.wait(100);
		assert.ok(this.fnBindingContextSpy.notCalled, "TreeBindingProxy#getContexts() was not called");
		assert.notOk(this.oTable.getRows()[0].getBindingContext(), "Table has no rows with bindingContext");

		this.fnBindingContextSpy.resetHistory();
		this.oTable.setVisible(true);
		this.oTable.getBinding("rows").resume();
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(this.fnBindingContextSpy.called, "Table._getContexts() was called");
		assert.ok(this.oTable.getRows()[0].getBindingContext(), "Table has rows with bindingContext");
	});

	QUnit.test("Hide/show and suspend/resume table during runtime", async function(assert) {
		await TableQUnitUtils.wait(100);
		assert.ok(this.fnBindingContextSpy.notCalled, "TreeBindingProxy#getContexts() was not called");
		assert.notOk(this.oTable.getRows()[0].getBindingContext(), "Table has no rows with bindingContext");

		this.fnBindingContextSpy.resetHistory();
		this.oTable.setVisible(true);
		this.oTable.getBinding("rows").resume();
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(this.fnBindingContextSpy.called, "TreeBindingProxy#getContexts() was called");
		assert.equal(this.oTable.getVisible(), true, "Table is visible");
		assert.equal(this.oTable.getBinding("rows").isSuspended(), false, "Binding isn't suspended");
		assert.ok(this.oTable.getRows()[0].getBindingContext(), "Table has rows with bindingContext");

		this.fnBindingContextSpy.resetHistory();
		this.oTable.setVisible(false);
		this.oTable.getBinding("rows").suspend();
		await TableQUnitUtils.wait(100);

		assert.ok(this.fnBindingContextSpy.notCalled, "TreeBindingProxy#getContexts() was not called");
		assert.notOk(this.oTable.getRows()[0].getBindingContext(), "Table has no rows with bindingContext");
	});

	QUnit.test("#_getContexts", function(assert) {
		const oGetContexts = sinon.stub(this.oTable.getBinding(), "getContexts");
		assert.deepEqual(this.oTable._getContexts(), [], "Called without arguments on invisible and suspended table: [ ]");
		assert.equal(oGetContexts.callCount, 0, "Called without arguments: Binding#getContexts not called");

		oGetContexts.restore();
	});

});