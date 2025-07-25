/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/plugins/ODataV4MultiLevel",
	"sap/ui/table/utils/TableUtils"
], function(
	TableQUnitUtils,
	ODataV4MultiLevel,
	TableUtils
) {
	"use strict";

	const ODataV4MultiLevelPlugin = ODataV4MultiLevel.extend("sap.ui.table.test.ODataV4MultiLevelPlugin");

	TableQUnitUtils.setDefaultSettings({
		...TableQUnitUtils.createSettingsForList(), // We don't need hierarchy for this test
		dependents: new ODataV4MultiLevelPlugin()
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oPlugin = this.oTable.getDependents()[0];
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test(".findOn", function(assert) {
		assert.ok(ODataV4MultiLevel.findOn(this.oTable) === this.oPlugin, "Plugin found");
	});

	QUnit.module("Validation during activation", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Apply plugin when the table is not bound", function(assert) {
		this.oTable.removeDependent(this.oPlugin);
		this.oTable.unbindRows();
		this.oTable.addDependent(this.oPlugin);
		assert.ok(true, "No Error thrown");
	});

	QUnit.test("Apply plugin when the table is bound to an unsupported model", function(assert) {
		this.stub(this.oTable.getModel(), "isA")
			.withArgs("sap.ui.model.odata.v4.ODataModel")
			.returns(false);

		this.oTable.removeDependent(this.oPlugin);
		assert.throws(
			() => { this.oTable.addDependent(this.oPlugin); },
			new Error("Model must be sap.ui.model.odata.v4.ODataModel")
		);
	});

	QUnit.test("Enable plugin when the table is bound to an unsupported model", function(assert) {
		this.stub(this.oTable.getModel(), "isA")
			.withArgs("sap.ui.model.odata.v4.ODataModel")
			.returns(false);

		this.oPlugin.setEnabled(false);
		assert.throws(
			() => { this.oPlugin.setEnabled(true); },
			new Error("Model must be sap.ui.model.odata.v4.ODataModel")
		);
	});

	QUnit.test("Change to unsupported model", function(assert) {
		const oModel = this.oTable.getModel();

		this.oTable.setModel();
		this.stub(oModel, "isA")
			.withArgs("sap.ui.model.odata.v4.ODataModel")
			.returns(false);
		assert.throws(
			() => { this.oTable.setModel(oModel); },
			new Error("Model must be sap.ui.model.odata.v4.ODataModel")
		);
	});

	QUnit.module("Hierarchy mode", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oPlugin = this.oTable.getDependents()[0];
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("After deactivation", function(assert) {
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		this.oPlugin.setEnabled(false);
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Flat);
	});

	QUnit.module("Integration with table API", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable();
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Row#expand", function(assert) {
		const oRow = this.oTable.getRows()[2];

		this.stub(oRow, "isExpandable").returns(true);
		this.stub(oRow, "isExpanded").returns(false);
		this.stub(oRow.getBindingContext(), "expand");
		oRow.expand();

		assert.ok(oRow.getBindingContext().expand.calledOnceWithExactly(), "Context#expand call");
	});

	QUnit.test("Row#collapse", function(assert) {
		const oRow = this.oTable.getRows()[1];

		this.stub(oRow, "isExpandable").returns(true);
		this.stub(oRow, "isExpanded").returns(true);
		this.stub(oRow.getBindingContext(), "collapse");
		oRow.collapse();

		assert.ok(oRow.getBindingContext().collapse.calledOnceWithExactly(), "Context#collapse call");
	});
});