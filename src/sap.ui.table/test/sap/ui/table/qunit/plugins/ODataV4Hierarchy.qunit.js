/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/plugins/ODataV4Hierarchy",
	"sap/ui/table/utils/TableUtils"
], function(
	TableQUnitUtils,
	ODataV4Hierarchy,
	TableUtils
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		...TableQUnitUtils.createSettingsForHierarchy(),
		dependents: new ODataV4Hierarchy()
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visible: false // To prevent the table from calling getContexts on a suspended binding, which causes an error
			});
			this.oPlugin = this.oTable.getDependents()[0];
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test(".findOn", function(assert) {
		assert.ok(ODataV4Hierarchy.findOn(this.oTable) === this.oPlugin, "Plugin found");
	});

	QUnit.module("Validation during activation", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visible: false // To prevent the table from calling getContexts on a suspended binding, which causes an error
			});
			this.oPlugin = this.oTable.getDependents()[0];
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

	QUnit.test("Apply plugin with a list", function(assert) {
		this.oTable.removeDependent(this.oPlugin);
		this.stub(this.oTable.getBinding(), "getAggregation").returns();
		assert.throws(() => { this.oTable.addDependent(this.oPlugin); }, new Error("Only data aggregation is supported"));
	});

	QUnit.test("Enable plugin with a list", function(assert) {
		this.oPlugin.setEnabled(false);
		this.stub(this.oTable.getBinding(), "getAggregation").returns();
		assert.throws(() => { this.oPlugin.setEnabled(true); }, new Error("Only data aggregation is supported"));
	});

	QUnit.test("Change to list", function(assert) {
		const oBinding = this.oTable.getBinding();

		this.stub(oBinding, "getAggregation").returns();

		assert.throws(() => {
			oBinding.resume();
			oBinding.setAggregation();
		}, new Error("Only data aggregation is supported"));
	});

	QUnit.test("Apply plugin with data aggregation", function(assert) {
		this.oTable.removeDependent(this.oPlugin);
		this.stub(this.oTable.getBinding(), "getAggregation").returns({});
		assert.throws(() => { this.oTable.addDependent(this.oPlugin); }, new Error("Only data aggregation is supported"));
	});

	QUnit.test("Enable plugin with data aggregation", function(assert) {
		this.oPlugin.setEnabled(false);
		this.stub(this.oTable.getBinding(), "getAggregation").returns({});
		assert.throws(() => { this.oPlugin.setEnabled(true); }, new Error("Only data aggregation is supported"));
	});

	QUnit.test("Change to data aggregation", function(assert) {
		const oBinding = this.oTable.getBinding();

		this.stub(oBinding, "getAggregation").returns({});
		assert.throws(
			() => {
				oBinding.resume();
				oBinding.setAggregation();
			},
			new Error("Only data aggregation is supported")
		);
	});

	QUnit.module("Table hierarchy mode", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visible: false // To prevent the table from calling getContexts on a suspended binding, which causes an error
			});
			this.oPlugin = this.oTable.getDependents()[0];
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("After activation", function(assert) {
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Tree);
	});

	QUnit.test("After deactivation", function(assert) {
		this.oPlugin.setEnabled(false);
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Flat);
	});

	QUnit.module("Integration with table API", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable((oTable) => {
				oTable.getBinding().resume();
			});
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

	QUnit.module("Row state", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable((oTable) => {
				oTable.getBinding().resume();
			});
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertRowState: function(oRow, mState) {
			QUnit.assert.deepEqual({
				type: oRow.getType(),
				level: oRow.getLevel(),
				expandable: oRow.isExpandable(),
				expanded: oRow.isExpanded()
			}, mState, `State of row ${oRow.getId()}`);
		}
	});

	QUnit.test("After rendering", function(assert) {
		const aRows = this.oTable.getRows();

		this.assertRowState(aRows[0], {
			type: "Standard",
			level: 1,
			expandable: true,
			expanded: true
		});
		this.assertRowState(aRows[1], {
			type: "Standard",
			level: 2,
			expandable: true,
			expanded: true
		});
		this.assertRowState(aRows[2], {
			type: "Standard",
			level: 3,
			expandable: true,
			expanded: false
		});
		this.assertRowState(aRows[4], {
			type: "Standard",
			level: 2,
			expandable: false,
			expanded: false
		});
	});

	QUnit.test("Expand", async function(assert) {
		const aRows = this.oTable.getRows();

		await aRows[2].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();

		this.assertRowState(aRows[2], {
			type: "Standard",
			level: 3,
			expandable: true,
			expanded: true
		});
		this.assertRowState(aRows[3], {
			type: "Standard",
			level: 4,
			expandable: false,
			expanded: false
		});
	});

	QUnit.test("Expand and scroll", async function(assert) {
		const aRows = this.oTable.getRows();

		await aRows[2].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
		this.oTable.setFirstVisibleRow(2);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertRowState(aRows[0], {
			type: "Standard",
			level: 3,
			expandable: true,
			expanded: true
		});
		this.assertRowState(aRows[1], {
			type: "Standard",
			level: 4,
			expandable: false,
			expanded: false
		});
		this.assertRowState(aRows[2], {
			type: "Standard",
			level: 4,
			expandable: false,
			expanded: false
		});
		this.assertRowState(aRows[3], {
			type: "Standard",
			level: 3,
			expandable: true,
			expanded: false
		});
	});
});