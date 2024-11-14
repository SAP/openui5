/*global QUnit*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/plugins/ODataV4Selection"
], function(
	TableQUnitUtils,
	Fixed,
	ODataV4Selection
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: [new ODataV4Selection()],
		rows: {
			path: '/BusinessPartners',
			parameters: {
				$count: false,
				$orderby: 'Country desc,Region desc,Segment,AccountResponsible',
				$$aggregation: {
					aggregate: {
						SalesAmountLocalCurrency: {
							grandTotal: true,
							subtotals: true,
							unit: "LocalCurrency"
						},
						SalesNumber: {}
					},
					group: {
						AccountResponsible: {},
						Country_Code: {additionally: ["Country"]}
					},
					groupLevels: ["Country_Code", "Region", "Segment"]
				}
			},
			suspended: true
		},
		columns: [
			TableQUnitUtils.createTextColumn({label: "Country", text: "Country", bind: true}),
			TableQUnitUtils.createTextColumn({label: "Region", text: "Region", bind: true}),
			TableQUnitUtils.createTextColumn({label: "Local Currency", text: "LocalCurrency", bind: true})
		],
		models: TableQUnitUtils.createModelForDataAggregationService(),
		rowMode: new Fixed({
			rowCount: 5
		}),
		threshold: 0
	});

	QUnit.module("Selection API", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable(function(oTable) {
				oTable.getBinding().resume();
			});
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			this.oSelectionChangeHandler = this.spy();
			this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
			await this.oTable.qunit.whenBindingChange();
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("#getSelectedContexts", async function(assert) {
		const aRows = this.oTable.getRows();

		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "No contexts selected");

		aRows[3].getBindingContext().expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(6);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		aRows[4].getBindingContext().expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(9);
		await this.oTable.qunit.whenRenderingFinished();
		aRows[4].getBindingContext().expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(11);
		await this.oTable.qunit.whenRenderingFinished();

		aRows[0].getBindingContext().setSelected(true); // Group header row
		aRows[4].getBindingContext().setSelected(true); // Sum row
		aRows[2].getBindingContext().setSelected(true); // Leaf row
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Only contexts of leaf rows are returned");
	});

	QUnit.test("#setSelected", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelected(aRows[0]);
		this.oSelectionPlugin.setSelected(aRows[1]);
		this.oSelectionPlugin.setSelected(aRows[4]);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "Row 1 is not selected (sum row)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "Row 2 is not selected (group header row)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[4]), false, "Row 5 is not selected (empty row)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");

		aRows[3].getBindingContext().expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(6);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		aRows[4].getBindingContext().expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(9);
		await this.oTable.qunit.whenRenderingFinished();
		aRows[4].getBindingContext().expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(11);
		await this.oTable.qunit.whenRenderingFinished();

		this.oSelectionPlugin.setSelected(aRows[3], true);
		this.oSelectionPlugin.setSelected(aRows[4], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), true, "Row 4 is selected (leaf)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[4]), true, "Row 5 is selected (leaf)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");
	});
});