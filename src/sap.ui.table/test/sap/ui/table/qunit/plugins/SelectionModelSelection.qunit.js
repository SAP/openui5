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

	QUnit.test("#setSelected", function(assert) {
		var oSelectionPlugin = this.oTable._getSelectionPlugin();

		oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0], "Select a row");

		oSelectionPlugin.setSelected(this.oTable.getRows()[2], true, {range: true});
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 1, 2], "Select a range");

		oSelectionPlugin.setSelected(this.oTable.getRows()[1], false);
		assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [0, 2], "Deselect a row");

		oSelectionPlugin.clearSelection();
		this.oTable.getModel().setData();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
			return new Promise(function(resolve) {
				setTimeout(resolve, 100);
			});
		}.bind(this)).then(function() {
			assert.deepEqual(oSelectionPlugin.getSelectedIndices(), [], "Select a row that is not selectable");
		});
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
			var oSelectionPlugin = oTable._getSelectionPlugin();
			oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
				assert.deepEqual(oEvent.getParameter("_internalTrigger"), undefined,
					"SelectionChange _internalTrigger parameter is undefined");
			});
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
		var oSelectionPlugin = this.oTable._getSelectionPlugin();
		oSelectionPlugin.attachEventOnce("selectionChange", function(oEvent) {
			assert.deepEqual(oEvent.getParameter("_internalTrigger"), true,
				"SelectionChange _internalTrigger parameter is true after total number of row change");
		});
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			this.oTable.getBinding().getModel().getData().push({});
			this.oTable.getBinding().refresh();
		}.bind(this)).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.deepEqual(this.oTable.getSelectedIndices(), [], "Selection");
			assert.equal(this.oSelectionChangeSpy.callCount, 1, "rowSelectionChange event fired");
		}.bind(this));
	});

	QUnit.test("Change total number of rows if activated after binding initialization", function(assert) {
		this.oTable.insertDependent(new (SelectionPlugin.extend("sap.ui.table.test.SelectionPlugin"))(), 0);
		this.oTable.getDependents()[0].destroy();
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