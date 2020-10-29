/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/rowmodes/AutoRowMode",
	"sap/ui/model/odata/v2/ODataListBinding",
	"sap/ui/Device"
], function(TableQUnitUtils, AutoRowMode, ODataListBinding, Device) {
	"use strict";

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(ODataListBinding.prototype, "getContexts");
			this.iOriginalDeviceHeight = Device.resize.height;
			Device.resize.height = 500;

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oGetContextsSpy.reset();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			this.oMockServer.destroy();
			this.oGetContextsSpy.restore();
			Device.resize.height = this.iOriginalDeviceHeight;
		},
		createTable: function(oModel) {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new AutoRowMode(),
				rows: {path : "/Products"},
				models: oModel ? oModel : this.oDataModel
			});

			return this.oTable;
		}
	});

	QUnit.test("Initialization when metadata not yet loaded", function(assert) {
		var oTable = this.createTable(TableQUnitUtils.createODataModel(null, true));
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// render, auto rerender, refreshRows, updateRows
		return pReady.then(function() {
			assert.equal(oGetContextsSpy.callCount, 4, "Binding#getContexts called 4 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 20, 100),
				"The first call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 20, 100),
				"The second call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, 20, 100),
				"The third call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(3).calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The fourth call to Binding#getContexts considers the row count");
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, 20,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("Initialization when metadata already loaded", function(assert) {
		var oTable = this.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// refreshRows, render, auto rerender, updateRows
		return pReady.then(function() {
			assert.equal(oGetContextsSpy.callCount, 4, "Binding#getContexts called 4 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 20, 100),
				"The first call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 20, 100),
				"The second call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, 20, 100),
				"The third call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(3).calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The fourth call to Binding#getContexts considers the row count");
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, 20,
				"The computed request length and the row count should not be equal in this test");
		});
	});

	QUnit.test("VisibleRowCountMode = Auto: Resize", function(assert) {
		var oTable = this.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(oTable.qunit.$resize({height: "756px"})).then(function() {
			assert.equal(oGetContextsSpy.callCount, 1, "Binding#getContexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The call to Binding#getContexts considers the row count");
			oGetContextsSpy.reset();

		}).then(oTable.qunit.resetSize).then(function() {
			assert.equal(oGetContextsSpy.callCount, 1, "Binding#getContexts called once");
			assert.ok(oGetContextsSpy.calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The call to Binding#getContexts considers the row count");
		});
	});

	QUnit.test("VisibleRowCountMode = Auto: Refresh", function(assert) {
		var oTable = this.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(function() {
			oTable.getBinding("rows").refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Binding#getContexts called 2 times"); // refreshRows, updateRows
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 20, 100),
				"The first call to Binding#getContexts considers the device height for the length");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, oTable.getRowMode().getComputedRowCounts().count, 100),
				"The second call to Binding#getContexts considers the row count");
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, 20,
				"The computed request length and the row count should not be equal in this test");
		});
	});
});