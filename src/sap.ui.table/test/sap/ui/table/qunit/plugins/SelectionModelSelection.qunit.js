/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/SelectionPlugin",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter"
], function(TableQUnitUtils, SelectionPlugin, Sorter, Filter) {
	"use strict";

	QUnit.module("Selection API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("setSelectionInterval", function(assert) {
		this.oTable.setSelectionInterval(2, 6);
		assert.deepEqual(this.oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection");
	});

	QUnit.module("Automatic deselection", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10)
			});
			this.oSelectionChangeSpy = sinon.spy();
			this.oTable.setSelectionInterval(2, 6);
			this.oTable.attachRowSelectionChange(this.oSelectionChangeSpy);
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Rebind", function(assert) {
		this.oTable.bindRows(this.oTable.getBindingInfo("rows"));
		assert.deepEqual(this.oTable.getSelectedIndices(), [], "Selection");

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(this.oSelectionChangeSpy.callCount, 0, "rowSelectionChange event not fired");
		}.bind(this));
	});

	QUnit.test("Unbind", function(assert) {
		this.oTable.unbindRows();
		assert.deepEqual(this.oTable.getSelectedIndices(), [], "Selection");

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(this.oSelectionChangeSpy.callCount, 0, "rowSelectionChange event not fired");
		}.bind(this));
	});

	QUnit.test("Sort", function(assert) {
		this.oTable.getBinding().sort(new Sorter({path: "something"}));
		assert.deepEqual(this.oTable.getSelectedIndices(), [], "Selection");
		assert.equal(this.oSelectionChangeSpy.callCount, 1, "rowSelectionChange event fired");
	});

	QUnit.test("Filter", function(assert) {
		this.oTable.getBinding().filter(new Filter({path: "something", operator: "EQ", value1: "something"}));
		assert.deepEqual(this.oTable.getSelectedIndices(), [], "Selection");
		assert.equal(this.oSelectionChangeSpy.callCount, 1, "rowSelectionChange event fired");
	});

	QUnit.test("Initial change of total number of rows", function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable({
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModelWithEmptyRows(10)
		}, function(oTable) {
			oTable.setSelectionInterval(2, 6);
		});

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.deepEqual(this.oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection");
		}.bind(this));
	});

	QUnit.test("Change total number of rows before rendering", function(assert) {
		this.oTable.getBinding().getModel().getData().push({});
		this.oTable.getBinding().refresh();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.deepEqual(this.oTable.getSelectedIndices(), [], "Selection");
			assert.equal(this.oSelectionChangeSpy.callCount, 1, "rowSelectionChange event fired");
		}.bind(this));
	});

	QUnit.test("Change total number of rows after rendering", function(assert) {
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.oTable.getBinding().getModel().getData().push({});
			this.oTable.getBinding().refresh();
		}.bind(this)).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.deepEqual(this.oTable.getSelectedIndices(), [], "Selection");
			assert.equal(this.oSelectionChangeSpy.callCount, 1, "rowSelectionChange event fired");
		}.bind(this));
	});

	QUnit.test("Change total number of rows if activated after binding initialization", function(assert) {
		this.oTable.insertPlugin(new (SelectionPlugin.extend("sap.ui.table.test.SelectionPlugin"))(), 0);
		this.oTable.getPlugins()[0].destroy();
		this.oTable.setSelectionInterval(2, 6);
		this.oSelectionChangeSpy.resetHistory();
		this.oTable.getBinding().getModel().getData().push({});
		this.oTable.getBinding().refresh();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.deepEqual(this.oTable.getSelectedIndices(), [], "Selection");
			assert.equal(this.oSelectionChangeSpy.callCount, 1, "rowSelectionChange event fired");
		}.bind(this));
	});

	QUnit.test("Selection during rebind", function(assert) {
		this.oTable.bindRows(this.oTable.getBindingInfo("rows"));
		this.oTable.setSelectionInterval(2, 6);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.deepEqual(this.oTable.getSelectedIndices(), [2, 3, 4, 5, 6], "Selection");
		}.bind(this));
	});
});