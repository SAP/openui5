/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/TreeTable",
	"sap/ui/model/controlhelper/TreeBindingProxy"
], function(
	TableQUnitUtils,
	TreeTable,
	TreeBindingProxy
) {
	"use strict";

	QUnit.module("Busy Indicator", {
		beforeEach: async function() {
			TableQUnitUtils.setDefaultSettings({
				rows: {
					path: "/EMPLOYEES"
				},
				columns: [TableQUnitUtils.createTextColumn({text: "{ID}"})],
				models: TableQUnitUtils.createModelForHierarchyDataService(),
				threshold: 5,
				scrollThreshold: 10,
				enableBusyIndicator: true
			});

			this.oTable = await TableQUnitUtils.createTable(TreeTable, {}, function(oTable) {
				oTable._oProxy._bEnableV4 = true;
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

	QUnit.module("Hide/Show and suspend/resume TreeTable with ODataV4", {
		beforeEach: async function() {
			TableQUnitUtils.setDefaultSettings({
				rows: {
					path: "/EMPLOYEES",
					suspended: true
				},
				columns: [TableQUnitUtils.createTextColumn({text: "{ID}"})],
				models: TableQUnitUtils.createModelForHierarchyDataService(),
				visible: false
			});

			this.oTable = await TableQUnitUtils.createTable(TreeTable, {}, function(oTable) {
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