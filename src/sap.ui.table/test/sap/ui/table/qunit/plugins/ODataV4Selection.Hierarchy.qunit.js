/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/m/Text",
	"sap/ui/core/IconPool"
], function(
	TableQUnitUtils,
	TreeTable,
	Column,
	TableUtils,
	ODataV4Selection,
	Text,
	IconPool
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: [new ODataV4Selection()],
		rows: {
			path: "/EMPLOYEES",
			parameters: {$count: false, $orderby: "AGE", $$aggregation: {hierarchyQualifier: "OrgChart", expandTo: 3}},
			suspended: true
		},
		columns: [
			new Column({
				label: "ID",
				template: new Text({text: "{ID}"})
			}),
			new Column({
				label: "ManagerId",
				template: new Text({text: "{MANAGER_ID}"})
			}),
			new Column({
				label: "Name",
				template: new Text({text: "{Name}"})
			})
		],
		models: TableQUnitUtils.createModelForHierarchyDataService()
	});

	QUnit.module("Selection API", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable(TreeTable, {}, function(oTable) {
				oTable._oProxy._bEnableV4 = true;
				oTable.getBinding("rows").resume();
			});
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			this.oSelectionChangeHandler = this.spy();
			this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("#setSelected", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelected(aRows[0], true);
		this.oSelectionPlugin.setSelected(aRows[2], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");
		assert.ok(aRows[0].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[0],
			"First selected context is related to correct row");

		this.oSelectionChangeHandler.resetHistory();
		this.oTable.getRows()[1].collapse();
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Collapsed parent of selected row: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		this.oTable.getRows()[1].expand();
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Expanded parent of selected row: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");
	});

	QUnit.test("#onHeaderSelectorPress", async function(assert) {
		this.oTable.getRows()[1].collapse();
		this.oSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();

		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 8, "Selected contexts");

		this.oTable.getRows()[1].expand();
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 8, "Selected contexts after expanding a node");
		assert.strictEqual(this.oSelectionPlugin.isSelected(this.oTable.getRows()[2]), false, "Selection state of the first child");
	});

	QUnit.module("Header selector icon", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable(TreeTable, {}, function(oTable) {
				oTable._oProxy._bEnableV4 = true;
				oTable.getBinding("rows").resume();
			});
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		/**
		 * Asserts the state of the header selector cell, including the icon.
		 *
		 * @param {object} mAttributes The expected attributes
		 * @param {string} mAttributes.src The expected icon source
		 * @param {string} mAttributes.title The expected value of the 'title' attribute
		 * @param {boolean} [mAttributes.disabled=false] The expected value of the 'aria-disabled' attribute
		 */
		assertHeaderSelector: function(mAttributes) {
			const oIcon = this.oSelectionPlugin.getAggregation("icon");
			const oHeaderSelectorCell = this.oTable.qunit.getSelectAllCell();

			QUnit.assert.strictEqual(oIcon.getUseIconTooltip(), false, "Icon 'useIconToolTip' property");
			QUnit.assert.strictEqual(oIcon.getSrc(), mAttributes.src, "Icon 'src' property");
			QUnit.assert.ok(oIcon.hasStyleClass("sapUiTableSelectClear"), "Icon style class");
			QUnit.assert.strictEqual(oHeaderSelectorCell.getAttribute("title"), mAttributes.title,
				"HeaderSelector cell 'title' attribute");
			QUnit.assert.strictEqual(oHeaderSelectorCell.getAttribute("aria-disabled"), mAttributes.disabled ? "true" : null,
				"HeaderSelector cell 'aria-disabled' attribute");
		}
	});

	QUnit.test("Expand/Collapse", async function(assert) {
		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.oTable.getRows()[2].expand();
		await this.oTable.qunit.whenNextRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});

		this.oTable.getRows()[2].collapse();
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});
});