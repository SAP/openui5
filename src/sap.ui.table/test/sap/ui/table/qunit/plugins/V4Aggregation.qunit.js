/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/plugins/V4Aggregation",
	"sap/ui/table/utils/TableUtils"
], function(
	TableQUnitUtils,
	V4Aggregation,
	TableUtils
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: new V4Aggregation()
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
		assert.ok(V4Aggregation.findOn(this.oTable) === this.oPlugin, "Plugin found in dependents aggregation");
	});

	QUnit.module("Hierarchy mode", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList({
				modelParameters: {
					autoExpandSelect: true
				}
			}));
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initial with list", function(assert) {
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Group);
	});

	QUnit.test("Initial with data aggregation", function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList({
			tableSettings: {
				rows: {
					parameters: {
						$$aggregation: {group: {MyGroup: {}}}
					}
				}
			}
		}));
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Group);
	});

	QUnit.test("Initial with hierarchy", async function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList({
			tableSettings: {
				rows: {
					parameters: {
						$$aggregation: {hierarchyQualifier: "MyHierarchy"}
					}
				}
			},
			modelParameters: {
				autoExpandSelect: true
			}
		}));
		await this.oTable.qunit.whenBindingRefresh(); // Bindings refresh event is fired asynchronously if autoExpandSelect is enabled
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Tree);
	});

	QUnit.test("Change to data aggregation", function(assert) {
		this.oTable.getBinding().setAggregation({group: {MyGroup: {}}});
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Group);
	});

	QUnit.test("Change to hierarchy", function(assert) {
		this.oTable.getBinding().setAggregation({hierarchyQualifier: "MyHierarchy"});
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Tree);
	});

	QUnit.test("Change to list", function(assert) {
		this.oTable.getBinding().setAggregation({hierarchyQualifier: "MyHierarchy"});
		this.oTable.getBinding().setAggregation();
		assert.strictEqual(TableUtils.Grouping.getHierarchyMode(this.oTable), TableUtils.Grouping.HierarchyMode.Group);
	});

	QUnit.module("Integration with table API", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList());
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

	QUnit.module("Row state with list", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList());
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
		for (const oRow of this.oTable.getRows()) {
			this.assertRowState(oRow, {
				type: "Standard",
				level: 1,
				expandable: false,
				expanded: false
			});
		}
	});

	QUnit.module("Row state with data aggregation", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForDataAggregation(), (oTable) => {
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

		await aRows[3].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
		this.oTable.setFirstVisibleRow(6);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		await aRows[4].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
		this.oTable.setFirstVisibleRow(9);
		await this.oTable.qunit.whenRenderingFinished();
		await aRows[4].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
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

	QUnit.module("Row state with hierarchy", {
		beforeEach: async function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForHierarchy(), (oTable) => {
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