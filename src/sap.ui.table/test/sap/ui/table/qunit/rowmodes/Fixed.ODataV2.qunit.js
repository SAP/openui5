/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/Table"
], function(TableQUnitUtils, FixedRowMode, Table) {
	"use strict";

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");

			TableQUnitUtils.setDefaultSettings({
				rowMode: new FixedRowMode(),
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
			TableQUnitUtils.setDefaultSettings();
		}
	});

	QUnit.test("Initialization if metadata not yet loaded", function(assert) {
		var oTable = TableQUnitUtils.createTable({models: TableQUnitUtils.createODataModel(null, true)});
		var oGetContextsSpy = this.oGetContextsSpy;

		// render, refreshRows, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 10, 100);
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata not yet loaded; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			models: TableQUnitUtils.createODataModel(null, true),
			_bVariableRowHeightEnabled: true
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		// render, refreshRows, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 11, 100);
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, render, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 10, 100);
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({_bVariableRowHeightEnabled: true});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, render, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, 10, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, 11, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, 11, 100);
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound on initialization; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, render, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, 10, 10);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, 10, 10);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, 10, 10);
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound on initialization; Variable row heights; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, _bVariableRowHeightEnabled: true});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, render, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, 10, 10);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, 11, 11);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, 11, 11);
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound between initialization and rendering; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, rows: undefined}, function(oTable) {
			oTable.bindRows({path: "/Products"});
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, render, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 10, 10);
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound after rendering; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, rows: undefined});
		var oGetContextsSpy = this.oGetContextsSpy;

		oTable.bindRows({path: "/Products"});

		// refreshRows, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 10, 10);
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
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 10, 100);
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
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 11, 100);
			oTable.destroy();
		});
	});
});