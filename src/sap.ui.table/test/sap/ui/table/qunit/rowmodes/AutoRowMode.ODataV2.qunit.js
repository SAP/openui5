/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/rowmodes/AutoRowMode",
	"sap/ui/table/Table",
	"sap/ui/Device"
], function(TableQUnitUtils, AutoRowMode, Table, Device) {
	"use strict";

	var iDeviceHeight = 550;
	var iComputedRequestLength = 22; // Based on the device height.

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer(200);
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");
			this.iOriginalDeviceHeight = Device.resize.height;
			Device.resize.height = iDeviceHeight;

			TableQUnitUtils.setDefaultSettings({
				rowMode: new AutoRowMode(),
				rows: {path: "/Products"},
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oGetContextsSpy.resetHistory();
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			this.oGetContextsSpy.restore();
			Device.resize.height = this.iOriginalDeviceHeight;
			TableQUnitUtils.setDefaultSettings();
		}
	});

	QUnit.test("Initialization if metadata not yet loaded", function(assert) {
		var oTable = TableQUnitUtils.createTable({models: TableQUnitUtils.createODataModel(null, true)});
		var oGetContextsSpy = this.oGetContextsSpy;

		// auto rerender, refreshRows, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, oTable.getRowMode().getComputedRowCounts().count, 100);
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata not yet loaded; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			models: TableQUnitUtils.createODataModel(null, true),
			_bVariableRowHeightEnabled: true
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		// auto rerender, refreshRows, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, oTable.getRowMode().getComputedRowCounts().count + 1, 100);
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, oTable.getRowMode().getComputedRowCounts().count, 100);
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({_bVariableRowHeightEnabled: true});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, oTable.getRowMode().getComputedRowCounts().count + 1, 100);
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count + 1, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound on initialization; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			var iComputedRowCount = oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			// Threshold is 100, because binding is initialized before 'threshold' property is set (see ManagedObject#applySettings).
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, iComputedRequestLength, iComputedRowCount);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, iComputedRowCount, iComputedRowCount);
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound on initialization; Variable row heights; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, _bVariableRowHeightEnabled: true});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			var iComputedRowCount = oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			// Threshold is 100, because binding is initialized before 'threshold' property is set (see ManagedObject#applySettings).
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, iComputedRequestLength, iComputedRowCount + 1);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, iComputedRowCount + 1, iComputedRowCount + 1);
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound between initialization and rendering; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, rows: undefined}, function(oTable) {
			oTable.bindRows({path: "/Products"});
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			var iComputedRowCount = oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			// Threshold is 5, because of the value of the "minRowCount" property.
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 5);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, iComputedRequestLength, iComputedRowCount);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, iComputedRowCount, iComputedRowCount);
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound after rendering; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, rows: undefined});
		var oGetContextsSpy = this.oGetContextsSpy;

		oTable.bindRows({path: "/Products"});

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			var iComputedRowCount = oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			// Threshold is 5, because of the value of the "minRowCount" property.
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 5);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, iComputedRequestLength, iComputedRowCount);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, iComputedRowCount, iComputedRowCount);
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound after rendering; With fixed rows; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			threshold: 1,
			rows: undefined,
			rowMode: new AutoRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1
			})
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		oTable.bindRows({path: "/Products"});

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			var mRowCounts = oTable.getRowMode().getComputedRowCounts();

			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			// Threshold is 5, because of the value of the "minRowCount" property.
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 5);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, iComputedRequestLength - 1, mRowCounts.scrollable);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, mRowCounts.scrollable + 1, mRowCounts.scrollable);
			assert.notEqual(mRowCounts.count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound after rendering; With fixed rows; threshold = 1, minRowCount: 30", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			threshold: 1,
			rows: undefined,
			rowMode: new AutoRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1,
				minRowCount: 30
			})
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		oTable.bindRows({path: "/Products"});

		// refreshRows, auto rerender, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			var iComputedRowCount = oTable.getRowMode().getComputedRowCounts().count;

			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			// Threshold is 30, because of the value of the "minRowCount" property.
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, 30, 30);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, 29, 28);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, 29, 28);
			assert.notEqual(iComputedRowCount, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Resize", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
		}).then(oTable.qunit.$resize({height: "756px"})).then(function() {
			assert.equal(oGetContextsSpy.callCount, 1, "Method to get contexts called once");
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, oTable.getRowMode().getComputedRowCounts().count, 100);
			oGetContextsSpy.resetHistory();

		}).then(oTable.qunit.resetSize).then(function() {
			assert.equal(oGetContextsSpy.callCount, 1, "Method to get contexts called once");
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, oTable.getRowMode().getComputedRowCounts().count, 100);
			oTable.destroy();
		});
	});

	QUnit.test("Refresh", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, oTable.getRowMode().getComputedRowCounts().count, 100);
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Refresh; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({_bVariableRowHeightEnabled: true});
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, oTable.getRowMode().getComputedRowCounts().count + 1, 100);
			assert.notEqual(oTable.getRowMode().getComputedRowCounts().count + 1, iComputedRequestLength,
				"The computed request length and the row count should not be equal in this test");
			oTable.destroy();
		});
	});

	QUnit.test("Refresh; With fixed rows; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			threshold: 1,
			rowMode: new AutoRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1
			})
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			var mRowCounts = oTable.getRowMode().getComputedRowCounts();

			assert.equal(oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, iComputedRequestLength - 1, mRowCounts.scrollable);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, mRowCounts.scrollable + 1, mRowCounts.scrollable);
			oTable.destroy();
		});
	});

	QUnit.test("Refresh; With fixed rows; threshold = 1, minRowCount: 30", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			threshold: 1,
			rowMode: new AutoRowMode({
				fixedTopRowCount: 1,
				fixedBottomRowCount: 1,
				minRowCount: 30
			})
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Call count of method to get contexts"); // refreshRows, updateRows
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 29, 28);
			oTable.destroy();
		});
	});
});