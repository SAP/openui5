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
			this.fnBindingContextSpy = sinon.spy(this.oTable.getBinding(), "getContexts");
		},
		afterEach: function() {
			this.oTable?.destroy();
			this.fnBindingContextSpy.restore();
		}
	});

	QUnit.test("Initialized hidden table with suspended binding", async function(assert) {
		await TableQUnitUtils.wait(100);
		assert.ok(this.fnBindingContextSpy.notCalled, "Binding#getContexts was not called");
		assert.notOk(this.oTable.getRows()[0].getBindingContext(), "Table has no rows with bindingContext");
	});

	QUnit.test("Change visibility of table and suspension state of binding", async function(assert) {
		this.fnBindingContextSpy.resetHistory();
		this.oTable.setVisible(true);
		this.oTable.getBinding().resume();
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.fnBindingContextSpy.called, "Show table and resume binding: Binding#getContexts called");
		assert.ok(this.oTable.getRows()[0].getBindingContext(), "Show table and resume binding: Table has rows with bindingContext");

		this.fnBindingContextSpy.resetHistory();
		this.oTable.setVisible(false);
		this.oTable.getBinding().suspend();
		await TableQUnitUtils.wait(100);
		assert.ok(this.fnBindingContextSpy.notCalled, "Hide table and suspend binding: Binding#getContexts not called");
		assert.notOk(this.oTable.getRows()[0].getBindingContext(), "Hide table and suspend binding: Table doesn't have rows with bindingcontext");
	});
});