/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/rowmodes/InteractiveRowMode",
	"sap/ui/table/Table"
], function(TableQUnitUtils, InteractiveRowMode, Table) {
	"use strict";

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");

			TableQUnitUtils.setDefaultSettings({
				rowMode: new InteractiveRowMode(),
				rows: {path : "/Products"},
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
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, 10, 100), "All calls consider the row count");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, render, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, 10, 100), "All calls consider the row count");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound on initialization; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, render, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.getCall(0).calledWithExactly(0, 10, 100), "First call"); // #applySettings: Binding init before setThreshold
			assert.ok(oGetContextsSpy.getCall(1).calledWithExactly(0, 10, 10), "Second call");
			assert.ok(oGetContextsSpy.getCall(2).calledWithExactly(0, 10, 10), "Third call");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound between initialization and rendering; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, rows: undefined}, function(oTable) {
			oTable.bindRows({path : "/Products"});
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, render, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Method to get contexts called 3 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, 10, 10), "All calls consider the row count");
			oTable.destroy();
		});
	});

	QUnit.test("Initialization if metadata already loaded; Bound after rendering; threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({threshold: 1, rows: undefined});
		var oGetContextsSpy = this.oGetContextsSpy;

		oTable.bindRows({path : "/Products"});

		// refreshRows, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Method to get contexts called 2 times");
			assert.ok(oGetContextsSpy.alwaysCalledWithExactly(0, 10, 10), "All calls consider the row count");
			oTable.destroy();
		});
	});
});