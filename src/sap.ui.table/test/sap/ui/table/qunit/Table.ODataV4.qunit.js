/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/model/odata/v4/ODataListBinding"
], function(
	TableQUnitUtils,
	ODataListBinding
) {
	"use strict";

	QUnit.module("Busy Indicator", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				...TableQUnitUtils.createSettingsForList(),
				threshold: 5,
				scrollThreshold: 10,
				enableBusyIndicator: true
			});
		},
		afterEach: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("setBusy call", async function(assert) {
		const oTable = this.oTable;

		await oTable.qunit.whenRenderingFinished();
		await TableQUnitUtils.wait(10); // Wait for the busy state to be set to false

		const oSetBusySpy = sinon.spy(oTable, "setBusy");
		const oScrollExtension = oTable._getScrollExtension();
		const oDataRequestedSpy = sinon.spy(oTable.getBinding(), "fireDataRequested");

		assert.equal(oTable.getBusy(), false, "Table is not busy");

		oScrollExtension.scrollVertically(true, true);
		await TableQUnitUtils.nextEvent("dataRequested", oTable.getBinding());

		/* Table#setBusy will be called to ensure that it reacts to dynamic
		 * changes in case of multiple requests. In this case, it is called
		 * with false which does not impact the busy state of the table.
		 * Nevertheless, we need to wait for 10 ms because removing the
		 * busy state is done asynchronously to prevent flickering.
		 */
		await TableQUnitUtils.wait(10);

		assert.ok(oDataRequestedSpy.calledOnce, "DataRequested event fired");
		assert.ok(oSetBusySpy.called, "setBusy is called");
		assert.ok(oSetBusySpy.calledWith(false), "setBusy called with false");
		assert.notOk(oSetBusySpy.calledWith(true), "setBusy not called with true");

		oSetBusySpy.restore();
		oDataRequestedSpy.restore();
	});

	QUnit.module("Hide/Show table and suspend/resume binding", {
		beforeEach: function() {
			this.fnBindingGetContextSpy = sinon.spy(ODataListBinding.prototype, "getContexts");
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList({
				tableSettings: {
					rows: {suspended: true},
					visible: false
				}
			}));
		},
		afterEach: function() {
			this.oTable?.destroy();
			this.fnBindingGetContextSpy.restore();
		}
	});

	QUnit.test("Initialized hidden table with suspended binding", async function(assert) {
		await TableQUnitUtils.wait(100);
		assert.ok(this.fnBindingGetContextSpy.notCalled, "Binding#getContexts not called");
		assert.notOk(this.oTable.getRows()[0].getBindingContext(), "Table doesn't have rows with binding context");
	});

	QUnit.test("Change visibility of table and suspension state of binding", async function(assert) {
		this.fnBindingGetContextSpy.resetHistory();
		this.oTable.setVisible(true);
		this.oTable.getBinding().resume();
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.fnBindingGetContextSpy.called, "Show table and resume binding: Binding#getContexts called");
		assert.ok(this.oTable.getRows()[0].getBindingContext(), "Show table and resume binding: Table has rows with bindingContext");

		this.fnBindingGetContextSpy.resetHistory();
		this.oTable.setVisible(false);
		this.oTable.getBinding().suspend();
		await TableQUnitUtils.wait(100);
		assert.ok(this.fnBindingGetContextSpy.notCalled, "Hide table and suspend binding: Binding#getContexts not called");
		assert.notOk(this.oTable.getRows()[0].getBindingContext(), "Hide table and suspend binding: Table doesn't have rows with bindingcontext");
	});
});