/*global QUnit*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/ui/table/plugins/V4Aggregation",
	"sap/m/Text",
	"sap/ui/core/IconPool"
], function(
	TableQUnitUtils,
	Table,
	Column,
	TableUtils,
	Fixed,
	ODataV4Selection,
	V4Aggregation,
	Text,
	IconPool
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: [
			new ODataV4Selection(),
			new V4Aggregation()
		],
		rows: {
			path: '/BusinessPartners',
			parameters: {
				$count: false,
				$orderby: 'Country desc,Region desc,Segment,AccountResponsible'
			},
			suspended: true
		},
		columns: [
			new Column({
				label: "Country",
				template: new Text({text: "{Country}"})
			}),
			new Column({
				label: "Region",
				template: new Text({text: "{Region}"})
			}),
			new Column({
				label: "SalesAmount",
				template: new Text({
					text: "{parts: ['SalesAmountLocalCurrency', 'LocalCurrency', {mode: 'OneTime', path: '/##@@requestCurrencyCodes', " +
							"targetType: 'any'}], type: 'sap.ui.model.odata.type.Currency', formatOptions: {showMeasure: false}}"
				})
			}),
			new Column({
				label: "Local Currency",
				template: new Text({text: "{LocalCurrency}"})
			})
		],
		models: TableQUnitUtils.createModelForDataAggregationService(),
		rowMode: new Fixed({
			rowCount: 5
		}),
		threshold: 0
	});

	QUnit.module("Selection API", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable(Table, {}, function(oTable) {
				const oV4AggregationPlugin = oTable.getDependents()[1];
				oV4AggregationPlugin.setPropertyInfos([
					{key: "SalesAmountLocalCurrency", path: "SalesAmountLocalCurrency", aggregatable: true, unit: "LocalCurrency"},
					{key: "LocalCurrency", path: "LocalCurrency"},
					{key: "SalesNumber", path: "SalesNumber", aggregatable: true},
					{key: "AccountResponsible", path: "AccountResponsible", groupable: true},
					{key: "Country_Code", path: "Country_Code", groupable: true, text: "Country"},
					{key: "Country", path: "Country", groupable: true},
					{key: "Region", path: "Region", groupable: true},
					{key: "Segment", path: "Segment", groupable: true}
				]);
				oV4AggregationPlugin.setAggregationInfo({
					visible: ["SalesAmountLocalCurrency", "LocalCurrency", "SalesNumber", "AccountResponsible", "Country_Code", "Country", "Region",
							"Segment"],
					groupLevels: ["Country_Code", "Region", "Segment"],
					subtotals: ["SalesAmountLocalCurrency"],
					grandTotal: ["SalesAmountLocalCurrency"]
				});
				oTable.getBinding("rows").resume();
			});
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			this.oSelectionChangeHandler = this.spy();
			this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("#getSelectedContexts", async function(assert) {
		const aRows = this.oTable.getRows();

		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "No contexts selected");

		aRows[2].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(6);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		aRows[3].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(9);
		await this.oTable.qunit.whenRenderingFinished();
		aRows[3].expand();
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
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "Row 2 is not selected (group header row)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), false, "Row 1 is not selected (sum row)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[4]), false, "Row 5 is not selected (empty row)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");

		aRows[2].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(6);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		aRows[3].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(9);
		await this.oTable.qunit.whenRenderingFinished();
		aRows[3].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(11);
		await this.oTable.qunit.whenRenderingFinished();

		this.oSelectionPlugin.setSelected(aRows[2], true);
		this.oSelectionPlugin.setSelected(aRows[3], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "Row 4 is selected (leaf)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), true, "Row 5 is selected (leaf)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");
	});

	QUnit.test("#clearSelection", async function(assert) {
		const aRows = this.oTable.getRows();

		aRows[2].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(6);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		aRows[3].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(9);
		await this.oTable.qunit.whenRenderingFinished();
		aRows[3].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(11);
		await this.oTable.qunit.whenRenderingFinished();

		aRows[0].getBindingContext().setSelected(true); // Group header row
		aRows[4].getBindingContext().setSelected(true); // Sum row
		await TableQUnitUtils.wait(10);
		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.clearSelection();
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Only group and sum row selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Only group and sum row selected: Selected contexts");
		assert.ok(aRows[0].getBindingContext().isSelected(), "Only group and sum row selected: Group header row is still selected");
		assert.ok(aRows[4].getBindingContext().isSelected(), "Only group and sum row selected: Sum row is still selected");

		this.oSelectionPlugin.setSelected(aRows[2], true); // Leaf row
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.clearSelection();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Leaf row selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Leaf row selected: Selected contexts");
		assert.ok(aRows[0].getBindingContext().isSelected(), "Leaf row selected: Group header row is still selected");
		assert.ok(aRows[4].getBindingContext().isSelected(), "Leaf row selected: Sum row is still selected");
	});

	QUnit.test("#onHeaderSelectorPress", async function(assert) {
		const aRows = this.oTable.getRows();

		aRows[2].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(6);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		aRows[3].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(9);
		await this.oTable.qunit.whenRenderingFinished();
		aRows[3].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(12);
		await this.oTable.qunit.whenRenderingFinished();

		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");
		assert.ok(aRows[1].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[0], "1st elected context is related to correct row");
		assert.ok(aRows[2].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[1], "2nd selected context is related to correct row");

		this.oSelectionChangeHandler.resetHistory();
		aRows[0].collapse();
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Node collapsed: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Node collapse: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		aRows[0].expand();
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Node expanded: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Node expanded: Selected contexts");
	});

	QUnit.module("Binding selection API", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable(Table, {}, function(oTable) {
				const oV4AggregationPlugin = oTable.getDependents()[1];
				oV4AggregationPlugin.setPropertyInfos([
					{key: "SalesAmountLocalCurrency", path: "SalesAmountLocalCurrency", aggregatable: true, unit: "LocalCurrency"},
					{key: "LocalCurrency", path: "LocalCurrency"},
					{key: "SalesNumber", path: "SalesNumber", aggregatable: true},
					{key: "AccountResponsible", path: "AccountResponsible", groupable: true},
					{key: "Country_Code", path: "Country_Code", groupable: true, text: "Country"},
					{key: "Country", path: "Country", groupable: true},
					{key: "Region", path: "Region", groupable: true},
					{key: "Segment", path: "Segment", groupable: true}
				]);
				oV4AggregationPlugin.setAggregationInfo({
					visible: ["SalesAmountLocalCurrency", "LocalCurrency", "SalesNumber", "AccountResponsible", "Country_Code", "Country", "Region",
							"Segment"],
					groupLevels: ["Country_Code", "Region", "Segment"],
					subtotals: ["SalesAmountLocalCurrency"],
					grandTotal: ["SalesAmountLocalCurrency"]
				});
				oTable.getBinding("rows").resume();
			});
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			this.oSelectionChangeHandler = this.spy();
			this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);

			await this.oTable.qunit.whenRenderingFinished();

			this.oTable.getRows()[2].expand();
			await this.oTable.qunit.whenNextRenderingFinished();
			this.oTable.setFirstVisibleRow(6);
			await this.oTable.qunit.whenBindingChange();
			await this.oTable.qunit.whenRenderingFinished();
			this.oTable.getRows()[3].expand();
			await this.oTable.qunit.whenNextRenderingFinished();
			this.oTable.setFirstVisibleRow(9);
			await this.oTable.qunit.whenRenderingFinished();
			this.oTable.getRows()[3].expand();
			await this.oTable.qunit.whenNextRenderingFinished();
			this.oTable.setFirstVisibleRow(11);
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Context#setSelected", async function(assert) {
		const aRows = this.oTable.getRows();

		aRows[2].getBindingContext().setSelected(true);
		aRows[3].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Select leaf row: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "Select leaf row: #isSelected (Row 3)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), true, "Select leaf row: #isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Select leaf row: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		aRows[2].getBindingContext().setSelected(true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Select same row: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "Select same row: #isSelected (Row 3)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), true, "Select same row: #isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Select same row: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		aRows[3].getBindingContext().setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Deselect leaf row: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "Deselect leaf row: #isSelected (Row 3)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), false, "Deselect leaf row: #isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Deselect leaf row: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		aRows[0].getBindingContext().setSelected(true);
		aRows[4].getBindingContext().setSelected(true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Select group header and sum row: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "Select group header and sum row: #isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Select group header and sum row: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		aRows[0].getBindingContext().setSelected(false);
		aRows[4].getBindingContext().setSelected(false);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Deselect group header and sum row: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "Deselect group header and sum row: #isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Deselect group header and sum row: Selected contexts");
	});

	QUnit.test("Context#setSelected in selection mode 'Single'", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelectionMode("Single");

		aRows[2].getBindingContext().setSelected(true); // Leaf row
		aRows[0].getBindingContext().setSelected(true); // Group header row
		aRows[3].getBindingContext().setSelected(true); // Leaf row
		aRows[4].getBindingContext().setSelected(true); // Sum row
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Select group header, sum, and leaf row: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "Select group header, sum, and leaf row: #isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "Select group header, sum, and leaf row: #isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "Select group header, sum, and leaf row: #isSelected (Row 3)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), true, "Select group header, sum, and leaf row: #isSelected (Row 4)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[4]), false, "Select group header, sum, and leaf row: #isSelected (Row 5)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Select group header, sum, and leaf row: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		aRows[0].getBindingContext().setSelected(false);
		aRows[4].getBindingContext().setSelected(false);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Deselect group header and sum row: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), true, "Deselect group header and sum row: #isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Deselect group header and sum row: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		aRows[0].getBindingContext().setSelected(true);
		aRows[4].getBindingContext().setSelected(true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Select group header and sum row: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), true, "Select group header and sum row: #isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Select group header and sum row: Selected contexts");
	});

	QUnit.test("HeaderContext#setSelected", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oTable.getBinding().getHeaderContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "#isSelected (Row 3)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), true, "#isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		this.oTable.getBinding().getHeaderContext().setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.ok(this.oTable.getRows().every((oRow) => {
			return !this.oSelectionPlugin.isSelected(oRow);
		}), "No row is selected");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");
	});

	QUnit.test("HeaderContext#setSelected in selection mode 'Single'", async function(assert) {
		this.oSelectionPlugin.setSelectionMode("Single");
		this.oTable.getBinding().getHeaderContext().setSelected(true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oTable.getBinding().getHeaderContext().isSelected(), false, "HeaderContext selected state");
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");

		this.oTable.getRows()[2].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oSelectionChangeHandler.resetHistory();
		this.oTable.getBinding().getHeaderContext().setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");
	});

	QUnit.module("Header selector icon", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable(Table, {}, function(oTable) {
				const oV4AggregationPlugin = oTable.getDependents()[1];
				oV4AggregationPlugin.setPropertyInfos([
					{key: "SalesAmountLocalCurrency", path: "SalesAmountLocalCurrency", aggregatable: true, unit: "LocalCurrency"},
					{key: "LocalCurrency", path: "LocalCurrency"},
					{key: "SalesNumber", path: "SalesNumber", aggregatable: true},
					{key: "AccountResponsible", path: "AccountResponsible", groupable: true},
					{key: "Country_Code", path: "Country_Code", groupable: true, text: "Country"},
					{key: "Country", path: "Country", groupable: true},
					{key: "Region", path: "Region", groupable: true},
					{key: "Segment", path: "Segment", groupable: true}
				]);
				oV4AggregationPlugin.setAggregationInfo({
					visible: ["SalesAmountLocalCurrency", "LocalCurrency", "SalesNumber", "AccountResponsible", "Country_Code", "Country", "Region",
							"Segment"],
					groupLevels: ["Country_Code", "Region", "Segment"],
					subtotals: ["SalesAmountLocalCurrency"],
					grandTotal: ["SalesAmountLocalCurrency"]
				});
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

	QUnit.test("Visual grouping and sums", async function(assert) {
		const aRows = this.oTable.getRows();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL"),
			disabled: true
		});

		aRows[2].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(6);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		aRows[3].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(9);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL"),
			disabled: true
		});

		aRows[3].expand();
		await this.oTable.qunit.whenNextRenderingFinished();
		this.oTable.setFirstVisibleRow(12);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});

		this.oSelectionPlugin.setSelected(aRows[1], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});

		this.oSelectionPlugin.setSelected(aRows[2], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});

		aRows[0].collapse();
		await this.oTable.qunit.whenNextRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL"),
			disabled: true
		});
	});
});