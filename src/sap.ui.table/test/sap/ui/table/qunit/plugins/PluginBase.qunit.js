sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/PluginBase",
	"sap/ui/table/plugins/SelectionPlugin",
	"sap/ui/table/Table",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/core/Control"
], function(TableQUnitUtils, PluginBase, SelectionPlugin, Table, FixedRowMode, Control) {
	"use strict";
	/*global QUnit */

	const TestPlugin = PluginBase.extend("sap.ui.table.plugins.test.Plugin");
	const TestSelectionPlugin = SelectionPlugin.extend("sap.ui.table.plugins.test.SelectionPlugin");

	QUnit.module("Activation & Deactivation", {
		beforeEach: function() {
			this.oPlugin = new TestPlugin();
			this.oPluginMock = this.mock(this.oPlugin);
			this.oTable = new Table();
		},
		afterEach: function() {
			this.oPluginMock.verify();
			this.oPluginMock.restore();
			this.oPlugin.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("Init", function(assert) {
		const oPluginPrototypeMock = this.mock(TestPlugin.prototype);

		oPluginPrototypeMock.expects("onActivate").never();
		oPluginPrototypeMock.expects("onDeactivate").never();

		const oPlugin = new TestPlugin();

		assert.notOk(this.oPlugin.isActive(), "Not active");

		oPlugin.destroy();
	});

	QUnit.test("Not applicable", function(assert) {
		const oNotATable = new (Control.extend("sap.ui.table.plugins.test.Control"))();

		assert.throws(
			function() {
				oNotATable.addDependent(this.oPlugin);
			}.bind(this),
			new Error(this.oPlugin + " is not applicable to " + oNotATable), "By default, applying a plugin to a non-table throws an error"
		);

		this.stub(this.oPlugin, "isApplicable").returns(true);
		oNotATable.addDependent(this.oPlugin);
		assert.ok(true, "If applying a plugin to a non-table and #isApplicable returns true, no error is thrown");

		this.oPlugin.isApplicable.returns(false);
		assert.throws(
			function() {
				this.oTable.addDependent(this.oPlugin);
			}.bind(this),
			new Error(this.oPlugin + " is not applicable to " + this.oTable),
			"If applying a plugin to a table and #isApplicable returns false, an error is thrown"
		);

		oNotATable.destroy();
	});

	QUnit.test("Add to table", function(assert) {
		this.oPluginMock.expects("onActivate").once().withExactArgs(this.oTable);
		this.oPluginMock.expects("onDeactivate").never();

		this.oTable.addDependent(this.oPlugin);

		assert.ok(this.oPlugin.isActive(), "Active");
	});

	QUnit.test("Add to the same table again", function(assert) {
		this.oTable.addDependent(this.oPlugin);

		const oOnDeactivate = this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oTable);
		const oOnActivate = this.oPluginMock.expects("onActivate").once().withExactArgs(this.oTable);

		this.oTable.insertDependent(this.oPlugin, 0);

		assert.ok(this.oPlugin.isActive(), "Active");
		assert.ok(oOnActivate.calledAfter(oOnDeactivate), "First deactivate, then activate");
	});

	QUnit.test("Move to another table", function(assert) {
		const oOtherTable = new Table();

		this.oTable.addDependent(this.oPlugin);

		const oOnDeactivate = this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oTable);
		const oOnActivate = this.oPluginMock.expects("onActivate").once().withExactArgs(oOtherTable);

		oOtherTable.addDependent(this.oPlugin);

		assert.ok(this.oPlugin.isActive(), "Active");
		assert.ok(oOnActivate.calledAfter(oOnDeactivate), "First deactivate, then activate");
		this.oPluginMock.verify();

		oOtherTable.destroy();
	});

	QUnit.test("Remove from table", function(assert) {
		this.oTable.addDependent(this.oPlugin);

		this.oPluginMock.expects("onActivate").never();
		this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oTable);

		this.oTable.removeDependent(this.oPlugin);

		assert.notOk(this.oPlugin.isActive(), "Not active");
	});

	QUnit.test("Destroy", function(assert) {
		this.oTable.addDependent(this.oPlugin);

		this.oPluginMock.expects("onActivate").never();
		this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oTable);

		this.oPlugin.destroy();

		assert.notOk(this.oPlugin.isActive(), "Not active");
	});

	QUnit.test("Activate", function(assert) {
		this.oTable.addDependent(this.oPlugin);
		this.oPlugin.deactivate();

		this.oPluginMock.expects("onActivate").once().withExactArgs(this.oTable);
		this.oPluginMock.expects("onDeactivate").never();

		this.oPlugin.activate();

		assert.ok(this.oPlugin.isActive(), "Active");
	});

	QUnit.test("Deactivate", function(assert) {
		this.oTable.addDependent(this.oPlugin);

		this.oPluginMock.expects("onActivate").never();
		this.oPluginMock.expects("onDeactivate").once().withExactArgs(this.oTable);

		this.oPlugin.deactivate();

		assert.notOk(this.oPlugin.isActive(), "Not active");
	});

	QUnit.module("Row count constraints", {
		beforeEach: async function() {
			this.oPlugin = new TestPlugin();
			this.oTable = await TableQUnitUtils.createTable({
				dependents: [this.oPlugin],
				rowMode: new FixedRowMode()
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Set constraints", function(assert) {
		const oTableInvalidate = this.spy(this.oTable, "invalidate");

		this.oPlugin.setRowCountConstraints({fixedTop: true, fixedBottom: true});
		assert.deepEqual(this.oTable.getRowMode().getRowCountConstraints(), {fixedTop: true, fixedBottom: true}, "RowMode#getRowCountConstraints");
		assert.equal(oTableInvalidate.callCount, 1, "Table#invalidate called once");
	});

	QUnit.test("Change constraints", function(assert) {
		this.oPlugin.setRowCountConstraints({fixedTop: true, fixedBottom: true});
		this.oPlugin.setRowCountConstraints({fixedTop: false});
		assert.deepEqual(this.oTable.getRowMode().getRowCountConstraints(), {fixedTop: false}, "RowMode#getRowCountConstraints");
	});

	QUnit.test("Change row mode", function(assert) {
		this.oPlugin.setRowCountConstraints({fixedTop: true, fixedBottom: true});
		this.oTable.getRowMode().destroy();
		this.oTable.setRowMode(new FixedRowMode());
		assert.deepEqual(this.oTable.getRowMode().getRowCountConstraints(), {fixedTop: true, fixedBottom: true}, "RowMode#getRowCountConstraints");
	});

	QUnit.test("Table does not support constraints on rows", function(assert) {
		this.stub(this.oTable, "_setRowCountConstraints");
		this.oPlugin.setRowCountConstraints({fixedTop: true, fixedBottom: true});
		assert.deepEqual(this.oTable.getRowMode().getRowCountConstraints(), {}, "RowMode#getRowCountConstraints");
	});

	/*The following tests should become obsolte when sap.ui.table.plugins.PluginBase inherits in future from sap.m.plugins.PluginBase.*/

	QUnit.module("Static getPlugin", {
		beforeEach: async function(assert) {
			this.oPlugin = new TestPlugin();
			this.oSelectionPlugin = new TestSelectionPlugin();
			this.oTable = await TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oPlugin.destroy();
			this.oSelectionPlugin.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("Parameters", function(assert) {
		assert.ok(PluginBase.getPlugin() === undefined, "no parameters");
		assert.ok(PluginBase.getPlugin(null, "sap.ui.table.plugins.test.Test") === undefined, "no control");
		assert.ok(PluginBase.getPlugin(this.oTable, {}) === undefined, "no correct plugin type");
	});

	QUnit.test("Find plugins in different aggregations", function(assert) {
		this.oTable.destroyDependents();

		this.oTable.addDependent(this.oPlugin);
		assert.ok(PluginBase.getPlugin(this.oTable, "sap.ui.table.plugins.test.Plugin") === this.oPlugin,
			"Plugin of type sap.ui.table.plugins.test.Plugin found in dependents aggregation");
		assert.ok(PluginBase.getPlugin(this.oTable, TestPlugin) === this.oPlugin,
			"Plugin of type sap.ui.table.plugins.test.Plugin Class found in dependents aggregation");
		assert.ok(PluginBase.findOn(this.oTable) === this.oPlugin, "Plugin found with findOn");
		this.oTable.removeAllDependents();

		this.oTable.addDependent(this.oSelectionPlugin);
		assert.ok(PluginBase.getPlugin(this.oTable, "sap.ui.table.plugins.test.SelectionPlugin") === this.oSelectionPlugin,
			"Plugin of type sap.ui.table.plugins.test.SelectionPlugin found in dependents aggregation");
		assert.ok(PluginBase.getPlugin(this.oTable, TestSelectionPlugin) === this.oSelectionPlugin,
			"Plugin of type sap.ui.table.plugins.test.SelectionPlugin Class found in dependents aggregation");
		assert.ok(PluginBase.findOn(this.oTable) === this.oSelectionPlugin, "Plugin found with findOn");
		this.oTable.insertDependent(this.oPlugin, 0);
		assert.ok(PluginBase.findOn(this.oTable) === this.oPlugin, "Plugin found with findOn");
		this.oTable.removeAllDependents();
	});
});