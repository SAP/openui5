/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/mdc/Table", "sap/ui/mdc/table/CreationRow", "sap/ui/model/json/JSONModel", "sap/ui/mdc/enums/TableType"
], function(Table, CreationRow, JSONModel, TableType) {
	"use strict";

	QUnit.module("Inner creation row", {
		beforeEach: function() {
			this.oCreationRow = new CreationRow();
			this.oMDCGridTable = new Table();
			this.oMDCResponsiveTable = new Table({
				type: TableType.ResponsiveTable
			});

			return Promise.all([this.oMDCGridTable.initialized(), this.oMDCResponsiveTable.initialized()]);
		},
		afterEach: function() {
			this.oCreationRow.destroy();
			this.oMDCGridTable._oTable.destroy();
			this.oMDCGridTable.destroy();
			this.oMDCResponsiveTable._oTable.destroy();
			this.oMDCResponsiveTable.destroy();
		}
	});

	QUnit.test("Instantiate", function(assert) {
		assert.ok(!this.oCreationRow._oInnerCreationRow, "No inner creation row instance exists");
	});

	QUnit.test("#update - Without parent", function(assert) {
		const done = assert.async();
		const that = this;

		this.oCreationRow.update().then(function() {
			assert.ok(!that.oCreationRow._oInnerCreationRow, "No inner creation row instance exists");
		}).then(done);
	});

	QUnit.test("#update - TableType = GridTable", function(assert) {
		const done = assert.async();
		const that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oMDCGridTable);

		this.oCreationRow.update().then(function() {
			const oInner = that.oCreationRow._oInnerCreationRow;
			const oInnerTableRowMode = that.oMDCGridTable._oTable.getRowMode();

			assert.ok(oInner.isA("sap.ui.table.CreationRow"), "Inner creation row is a sap.ui.table.CreationRow");
			assert.strictEqual(oInner.getVisible(), that.oCreationRow.getVisible(), "'visible' property was forwarded");
			assert.strictEqual(oInnerTableRowMode.getHideEmptyRows(), that.oCreationRow.getVisible(),
				"The inner table's 'hideEmptyRow' feature is enabled/disabled according to the creation row visibility");
			assert.strictEqual(oInner.getApplyEnabled(), that.oCreationRow.getApplyEnabled(), "'applyEnabled' property was forwarded");
			assert.ok(that.oMDCGridTable._oTable.getCreationRow() === oInner, "Inner creation row was inserted into inner table");
		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	QUnit.test("#update - TableType = GridTable delayed table creation", function(assert) {
		const done = assert.async();
		const that = this;
		const oGridTable = this.oMDCGridTable._oTable;
		// simulate no inner table exists
		delete this.oMDCGridTable._oTable;
		sinon.stub(this.oCreationRow, "_getTable").returns(this.oMDCGridTable);

		this.oCreationRow.update().then(function() {
			assert.ok(!that.oCreationRow._oInnerCreationRow, "No inner creation row instance exists");
			// simulate inner table now exists and an update is called
			that.oMDCGridTable._oTable = oGridTable;
			return that.oCreationRow.update();
		}).then(function() {
			const oInner = that.oCreationRow._oInnerCreationRow;
			const oInnerTableRowMode = that.oMDCGridTable._oTable.getRowMode();

			assert.ok(oInner.isA("sap.ui.table.CreationRow"), "Inner creation row is a sap.ui.table.CreationRow");
			assert.strictEqual(oInner.getVisible(), that.oCreationRow.getVisible(), "'visible' property was forwarded");
			assert.strictEqual(oInnerTableRowMode.getHideEmptyRows(), that.oCreationRow.getVisible(),
				"The inner table's 'hideEmptyRow' feature is enabled/disabled according to the creation row visibility");
			assert.strictEqual(oInner.getApplyEnabled(), that.oCreationRow.getApplyEnabled(), "'applyEnabled' property was forwarded");
			assert.ok(that.oMDCGridTable._oTable.getCreationRow() === oInner, "Inner creation row was inserted into inner table");
		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	QUnit.test("#update - TableType = ResponsiveTable", function(assert) {
		const done = assert.async();
		const that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oMDCResponsiveTable);

		this.oCreationRow.update().then(function() {
			assert.ok(!that.oCreationRow._oInnerCreationRow, "No inner creation row instance exists");
		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	QUnit.test("#update - Changing TableType", function(assert) {
		const done = assert.async();
		const that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oMDCGridTable);

		this.oCreationRow.update().then(function() {
			assert.ok(that.oCreationRow._oInnerCreationRow.isA("sap.ui.table.CreationRow"), "Table: Inner creation row is a sap.ui.table.CreationRow");

		}).then(function() {
			that.oCreationRow._getTable.returns(that.oMDCResponsiveTable);
			return that.oCreationRow.update();
		}).then(function() {
			assert.ok(!that.oCreationRow._oInnerCreationRow, "Change from Table to ResponsiveTable: No inner creation row instance exists");

		}).then(function() {
			that.oCreationRow._getTable.returns(that.oMDCGridTable);
			return that.oCreationRow.update();
		}).then(function() {
			assert.ok(that.oCreationRow._oInnerCreationRow.isA("sap.ui.table.CreationRow"), "Change from ResponsiveTable to Table: Inner creation row is a sap.ui.table.CreationRow");

		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	QUnit.test("Property/Aggregation/Event handling", function(assert) {
		const done = assert.async();
		const that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oMDCGridTable);

		this.oCreationRow.update().then(function() {
			const oInner = that.oCreationRow._oInnerCreationRow;
			const oInnerTableRowMode = that.oMDCGridTable._oTable.getRowMode();
			const oApplySpy = sinon.spy();
			let bDefaultPrevented;

			// Properties
			that.oCreationRow.setVisible(false);
			that.oCreationRow.setApplyEnabled(false);

			assert.strictEqual(oInner.getVisible(), false, "'visible' property was forwarded");
			assert.strictEqual(oInnerTableRowMode.getHideEmptyRows(), false,
				"The inner table's 'hideEmptyRow' feature is enabled/disabled according to the creation row visibility");
			assert.strictEqual(oInner.getApplyEnabled(), false, "'applyEnabled' property was forwarded");

			// Apply event execute default
			that.oCreationRow.attachApply(oApplySpy);
			oInner.attachEventOnce("apply", function(oEvent) {
				bDefaultPrevented = oEvent.bPreventDefault;
			});
			oInner.fireApply();

			assert.ok(oApplySpy.calledOnce, "The apply event handler was called once");
			assert.strictEqual(bDefaultPrevented, false, "The default action of the inner apply event was not prevented");

			// Apply event prevent default
			that.oCreationRow.attachApply(function(oEvent) {
				oEvent.preventDefault();
			});
			oInner.attachEventOnce("apply", function(oEvent) {
				bDefaultPrevented = oEvent.bPreventDefault;
			});
			oInner.fireApply();

			assert.ok(oApplySpy.calledTwice, "The apply event handler was called twice");
			assert.strictEqual(bDefaultPrevented, true, "The default action of the inner apply event was not prevented");

		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	// BCP: 2280082502
	QUnit.test("Enable 'hideEmptyRows' if CreationRow is made visible before initialization of inner CreationRow", function(assert) {
		const that = this;
		let pSequence;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oMDCGridTable);

		this.oCreationRow.setVisible(false);
		pSequence = this.oCreationRow.update();
		this.oCreationRow.setVisible(true);
		pSequence = pSequence.then(function() {
			const oInnerTableRowMode = that.oMDCGridTable._oTable.getRowMode();
			assert.strictEqual(oInnerTableRowMode.getHideEmptyRows(), true, "The inner table's 'hideEmptyRow' feature is enabled");
		}).then(function() {
			that.oCreationRow._getTable.restore();
		});

		return pSequence;
	});

	QUnit.test("Binding contexts", function(assert) {
		const oModel = new JSONModel();
		const done = assert.async();
		const that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oMDCGridTable);

		this.oCreationRow.setBindingContext(null);
		this.oCreationRow.setBindingContext(oModel.createBindingContext("/path"), "modelName");

		this.oCreationRow.update().then(function() {
			assert.strictEqual(that.oCreationRow._oInnerCreationRow.getBindingContext(), null, "Binding context of unnamed model was forwarded to the inner creation row on initialization");
			assert.strictEqual(that.oCreationRow.getBindingContext("modelName"), that.oCreationRow._oInnerCreationRow.getBindingContext("modelName"), "Binding context of named model was forwarded to the inner creation row on initialization");

			const oContext = oModel.createBindingContext("/path");
			that.oCreationRow.setBindingContext(undefined);
			that.oCreationRow.setBindingContext(oContext, "modelName");

			assert.strictEqual(that.oCreationRow.getBindingContext(), undefined, "Binding context of unnamed model was forwarded to the inner creation row on setBindingContext");
			assert.strictEqual(that.oCreationRow.getBindingContext("modelName"), oContext, "Binding context of named model was forwarded to the inner creation row on setBindingContext");
		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});

	QUnit.test("Busy state", function(assert) {
		const done = assert.async();
		const that = this;

		sinon.stub(this.oCreationRow, "_getTable").returns(this.oMDCGridTable);

		this.oCreationRow.update().then(function() {
			const oInner = that.oCreationRow._oInnerCreationRow;

			assert.ok(oInner.isA("sap.ui.table.CreationRow"), "Inner creation row is a sap.ui.table.CreationRow");
			assert.notOk(that.oCreationRow.getBusy(), "CreationRow is not busy");
			assert.notOk(oInner.getBusy(), "Inner CreationRow is not busy");

			that.oCreationRow.setBusy(true);
			assert.ok(that.oCreationRow.getBusy(), "CreationRow is busy");
			assert.ok(oInner.getBusy(), "Inner CreationRow is busy");

			/* Changing busy state on the inner control will not affect the mdc.table.CreationRow busy state */
			oInner.setBusy(false);
			assert.ok(that.oCreationRow.getBusy(), "CreationRow is busy");
			assert.notOk(oInner.getBusy(), "Inner CreationRow is not busy");

			that.oCreationRow.setBusy(false);
			assert.notOk(that.oCreationRow.getBusy(), "CreationRow is not busy");
			assert.notOk(oInner.getBusy(), "Inner CreationRow is not busy");

		}).then(function() {
			that.oCreationRow._getTable.restore();
			done();
		});
	});
});
