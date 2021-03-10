/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/rowmodes/FixedRowMode",
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
				rows: {path : "/Products"},
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oGetContextsSpy.reset();
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
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// render, refreshRows, updateRows
		return pReady.then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, 10, 100), "All calls consider the row count");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata not yet loaded; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			models: TableQUnitUtils.createODataModel(null, true),
			_bVariableRowHeightEnabled: true
		});
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// render, refreshRows, updateRows
		return pReady.then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, 11, 100), "All calls consider the row count");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// refreshRows, render, updateRows
		return pReady.then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, 10, 100), "All calls consider the row count");
			oTable.destroy();
		});
	});

	QUnit.skip("Initialization if metadata already loaded; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({_bVariableRowHeightEnabled: true});
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished);

		// refreshRows, render, updateRows
		return pReady.then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 10, 100), "First call");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 11, 100), "Second call");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, 11, 100), "Third call");
			oTable.destroy();
		});
	});

	QUnit.test("Refresh", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(function() {
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Method to get contexts called 2 times"); // refreshRows, updateRows
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 10, 100), "The first call considers the row count");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 10, 100), "The second call considers the row count");
			oTable.destroy();
		});
	});

	QUnit.test("Refresh; Variable row heights", function(assert) {
		var oTable = TableQUnitUtils.createTable({_bVariableRowHeightEnabled: true});
		var oGetContextsSpy = this.oGetContextsSpy;
		var pReady = oTable.qunit.whenBindingChange()
						   .then(oTable.qunit.whenRenderingFinished)
						   .then(function() {
							   oGetContextsSpy.reset();
						   });

		return pReady.then(function() {
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Method to get contexts called 2 times"); // refreshRows, updateRows
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 11, 100), "The first call considers the row count");
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 11, 100), "The second call considers the row count");
			oTable.destroy();
		});
	});
});