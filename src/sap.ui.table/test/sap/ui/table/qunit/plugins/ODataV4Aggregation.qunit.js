/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/plugins/ODataV4Aggregation",
	"sap/ui/table/utils/TableUtils"
], function(
	TableQUnitUtils,
	ODataV4Aggregation,
	TableUtils
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		...TableQUnitUtils.createSettingsForDataAggregation(),
		dependents: new ODataV4Aggregation()
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
		assert.ok(ODataV4Aggregation.findOn(this.oTable) === this.oPlugin, "Plugin found");
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

	QUnit.test("Apply plugin with a hierarchy", function(assert) {
		this.oTable.removeDependent(this.oPlugin);
		this.stub(this.oTable.getBinding(), "getAggregation").returns({hierarchyQualifier: "hierarchy"});
		assert.throws(() => { this.oTable.addDependent(this.oPlugin); }, new Error("Only data aggregation is supported"));
	});

	QUnit.test("Enable plugin with a hierarchy", function(assert) {
		this.oPlugin.setEnabled(false);
		this.stub(this.oTable.getBinding(), "getAggregation").returns({hierarchyQualifier: "hierarchy"});
		assert.throws(() => { this.oPlugin.setEnabled(true); }, new Error("Only data aggregation is supported"));
	});

	QUnit.test("Change to hierarchy", function(assert) {
		const oBinding = this.oTable.getBinding();

		this.stub(oBinding, "getAggregation").returns({hierarchyQualifier: "hierarchy"});

		assert.throws(() => {
			oBinding.resume();
			oBinding.setAggregation();
		}, new Error("Only data aggregation is supported"));
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
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Group);
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

	QUnit.module("Cell content visibility", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visible: false, // To prevent the table from calling getContexts on a suspended binding, which causes an error
				columns: (() => {
					const aColumns = [];
					for (let i = 0; i < 6; i++) {
						const oColumn = TableQUnitUtils.createTextColumn({id: "col" + i});
						this.spy(oColumn, "_setCellContentVisibilitySettings");
						aColumns.push(oColumn);
					}
					return aColumns;
				})()
			});
			this.oPlugin = this.oTable.getDependents()[0];
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertColumnCellVisibilitySettings: function(assert, mExpectedSettings) {
			this.oTable.getColumns().forEach(function(oColumn) {
				const sColumnId = oColumn.getId();
				const oSpy = oColumn._setCellContentVisibilitySettings;
				const sMessagePrefix = sColumnId + " - ";

				assert.equal(oSpy.callCount, 1, sMessagePrefix + "Settings set");

				if (mExpectedSettings?.[sColumnId]) {
					sinon.assert.calledWithExactly(oSpy, mExpectedSettings[sColumnId]);
				} else {
					sinon.assert.calledWithExactly(oSpy);
				}
			});
			this.resetSpies();
		},
		resetSpies: function() {
			this.oTable.getColumns().forEach(function(oColumn) {
				oColumn._setCellContentVisibilitySettings.resetHistory();
			});
		}
	});

	QUnit.test("Initial", function(assert) {
		this.oTable.getColumns().forEach(function(oColumn) {
			assert.ok(oColumn._setCellContentVisibilitySettings.notCalled,
				`Column#_setCellContentVisibilitySettings not called (${oColumn.getId()})`);
		});
	});

	QUnit.test("Declare which columns have totals", function(assert) {
		this.oPlugin.declareColumnsHavingTotals([
			this.oTable.getColumns()[0],
			this.oTable.getColumns()[2],
			this.oTable.getColumns()[4]
		]);

		this.assertColumnCellVisibilitySettings(assert, {
			col0: {groupHeader: true, summary: true},
			col1: {groupHeader: false, summary: false},
			col2: {groupHeader: true, summary: true},
			col3: {groupHeader: false, summary: false},
			col4: {groupHeader: true, summary: true},
			col5: {groupHeader: false, summary: false}
		});

		this.oPlugin.declareColumnsHavingTotals([
			this.oTable.getColumns()[2]
		]);

		this.assertColumnCellVisibilitySettings(assert, {
			col0: {groupHeader: false, summary: false},
			col1: {groupHeader: false, summary: false},
			col2: {groupHeader: true, summary: true},
			col3: {groupHeader: false, summary: false},
			col4: {groupHeader: false, summary: false},
			col5: {groupHeader: false, summary: false}
		});
	});

	QUnit.test("Disable plugin", function(assert) {
		this.oPlugin.declareColumnsHavingTotals([
			this.oTable.getColumns()[2]
		]);
		this.resetSpies();
		this.oPlugin.setEnabled(false);
		this.assertColumnCellVisibilitySettings(assert);
	});

	QUnit.module("Row state", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable((oTable) => {
				oTable.getBinding().resume();
			});
			this.oPlugin = this.oTable.getDependents()[0];
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
				expanded: oRow.isExpanded(),
				title: oRow.getTitle()
			}, mState, `State of row ${oRow.getId()}`);
		}
	});

	QUnit.test("Grand total at top and collapsed group header", function(assert) {
		const aRows = this.oTable.getRows();

		this.assertRowState(aRows[0], {
			type: "Summary",
			level: 1,
			expandable: false,
			expanded: false,
			title: ""
		});
		this.assertRowState(aRows[2], {
			type: "GroupHeader",
			level: 1,
			expandable: true,
			expanded: false,
			title: "2"
		});
		this.assertRowState(aRows[3], {
			type: "GroupHeader",
			level: 1,
			expandable: true,
			expanded: false,
			title: "3"
		});
	});

	QUnit.test("Expand", async function(assert) {
		const aRows = this.oTable.getRows();

		await aRows[3].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();

		this.assertRowState(aRows[3], {
			type: "GroupHeader",
			level: 1,
			expandable: true,
			expanded: true,
			title: "3"
		});
		this.assertRowState(aRows[4], {
			type: "GroupHeader",
			level: 2,
			expandable: true,
			expanded: false,
			title: "Saxony"
		});
	});

	QUnit.test("Expand and scroll", async function(assert) {
		const aRows = this.oTable.getRows();

		await aRows[3].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
		this.oTable.setFirstVisibleRow(6);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		await aRows[4].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
		this.oTable.setFirstVisibleRow(9);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertRowState(aRows[1], {
			type: "GroupHeader",
			level: 2,
			expandable: true,
			expanded: true,
			title: "Baden-Württemberg"
		});
		this.assertRowState(aRows[4], {
			type: "GroupHeader",
			level: 3,
			expandable: true,
			expanded: false,
			title: "Small"
		});
	});

	QUnit.test("Standard row, subtotals, and grand total at bottom", async function(assert) {
		const aRows = this.oTable.getRows();

		await TableQUnitUtils.expandAndScrollTableWithDataAggregation(this.oTable);
		this.oTable.setFirstVisibleRow(20);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertRowState(aRows[0], {
			type: "Standard",
			level: 4,
			expandable: false,
			expanded: false,
			title: ""
		});
		this.assertRowState(aRows[1], {
			type: "Summary",
			level: 4,
			expandable: false,
			expanded: false,
			title: ""
		});
		this.assertRowState(aRows[2], {
			type: "Summary",
			level: 3,
			expandable: false,
			expanded: false,
			title: ""
		});
		this.assertRowState(aRows[3], {
			type: "Summary",
			level: 2,
			expandable: false,
			expanded: false,
			title: ""
		});
		this.assertRowState(aRows[4], {
			type: "Summary",
			level: 1,
			expandable: false,
			expanded: false,
			title: ""
		});
	});

	QUnit.test("Custom group header formatter", async function(assert) {
		const aRows = this.oTable.getRows();
		const oFormatter = this.stub().returns("My Custom Group Header Title");

		this.oPlugin.setGroupHeaderFormatter(oFormatter);
		await this.oTable.qunit.whenRenderingFinished();
		this.assertRowState(aRows[1], {
			type: "GroupHeader",
			level: 1,
			expandable: true,
			expanded: false,
			title: "My Custom Group Header Title"
		});
		this.assertRowState(aRows[2], {
			type: "GroupHeader",
			level: 1,
			expandable: true,
			expanded: false,
			title: "My Custom Group Header Title"
		});
		assert.equal(oFormatter.callCount, 3, "Formatter calls");
		sinon.assert.calledWithExactly(oFormatter.getCall(0), aRows[1].getBindingContext(), "Country_Code");
		sinon.assert.calledWithExactly(oFormatter.getCall(1), aRows[2].getBindingContext(), "Country_Code");
		sinon.assert.calledWithExactly(oFormatter.getCall(2), aRows[3].getBindingContext(), "Country_Code");

		oFormatter.resetHistory();
		oFormatter.returns("My Custom Group Header Title 2");
		await aRows[3].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
		this.assertRowState(aRows[4], {
			type: "GroupHeader",
			level: 2,
			expandable: true,
			expanded: false,
			title: "My Custom Group Header Title 2"
		});
		assert.equal(oFormatter.callCount, 4, "Formatter calls");
		sinon.assert.calledWithExactly(oFormatter.getCall(3), aRows[4].getBindingContext(), "Region");

		this.oPlugin.setGroupHeaderFormatter(() => "Formatter changed");
		await this.oTable.qunit.whenRenderingFinished();
		this.assertRowState(aRows[4], {
			type: "GroupHeader",
			level: 2,
			expandable: true,
			expanded: false,
			title: "Formatter changed"
		});
	});
});