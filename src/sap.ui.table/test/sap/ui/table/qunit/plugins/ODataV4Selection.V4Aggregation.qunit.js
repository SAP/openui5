/*global QUnit*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/ui/table/plugins/V4Aggregation",
	"sap/m/Text"
], function(
	TableQUnitUtils,
	QUnitUtils,
	nextUIUpdate,
	Table,
	Column,
	Fixed,
	ODataV4Selection,
	V4Aggregation,
	Text
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: [
			new ODataV4Selection(),
			new V4Aggregation({
				totalSummaryOnTop: "On",
				totalSummaryOnBottom: "Off"
			})
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

	QUnit.module("Basic checks", {
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
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		triggerRowSelectorClick: function(oTable, iIndex, bShiftKey) {
			QUnitUtils.triggerEvent("tap", oTable.qunit.getRowHeaderCell(iIndex), {shiftKey: bShiftKey});
		},
		whenSelectionChange: function(oODataV4Selection) {
			return new Promise(function(resolve) {
				oODataV4Selection.attachEventOnce("selectionChange", resolve);
			});
		}
	});

	QUnit.test("Selection", function(assert) {
		const oTable = this.oTable;
		const oODataV4Selection = oTable.getDependents()[0];

		return oTable.qunit.whenRenderingFinished().then(function() {
			this.triggerRowSelectorClick(oTable, 0, false);
			assert.strictEqual(oODataV4Selection.isSelected(oTable.getRows()[0]), false, 'Row 1 is not selected (sum row)');
			this.triggerRowSelectorClick(oTable, 1, false);
			assert.strictEqual(oODataV4Selection.isSelected(oTable.getRows()[1]), false, 'Row 2 is not selected (group row)');
			this.triggerRowSelectorClick(oTable, 4, false);
			assert.strictEqual(oODataV4Selection.isSelected(oTable.getRows()[4]), false, 'Row 5 is not selected (empty row)');

			oTable.getRows()[3].expand();
			return oTable.qunit.whenBindingChange();
		}.bind(this)).then(function() {
			oTable.setFirstVisibleRow(6);
			return oTable.qunit.whenBindingChange();
		}).then(function() {
			oTable.getRows()[4].expand();
			return oTable.qunit.whenBindingChange();
		}).then(function() {
			oTable.setFirstVisibleRow(9);
			return oTable.qunit.whenVSbScrolled();
		}).then(function() {
			oTable.getRows()[4].expand();
			return oTable.qunit.whenBindingChange();
		}).then(function() {
			oTable.setFirstVisibleRow(11);
			return oTable.qunit.whenVSbScrolled();
		}).then(function() {
			oTable.getRows()[2].expand();
			return oTable.qunit.whenRenderingFinished();
		}).then(async function() {
			this.triggerRowSelectorClick(oTable, 3, false);
			assert.strictEqual(oODataV4Selection.isSelected(oTable.getRows()[3]), true, 'Row 4 is selected (leaf)');
			this.triggerRowSelectorClick(oTable, 4, false);
			assert.strictEqual(oODataV4Selection.isSelected(oTable.getRows()[4]), true, 'Row 5 is selected (leaf)');
			oODataV4Selection.onHeaderSelectorPress();
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 0, 'all rows are deselected');

			oODataV4Selection.setLimit(0);
			await nextUIUpdate();
			oODataV4Selection.onHeaderSelectorPress();
			return this.whenSelectionChange(oODataV4Selection);
		}.bind(this)).then(function() {
			assert.equal(oODataV4Selection.getSelectedContexts().length, 2, "All selectable contexts are selected");
			assert.equal(oODataV4Selection.getSelectedContexts()[0].getPath(),
						"/BusinessPartners(Country_Code='3',Region='Baden-W%C3%BCrttemberg',Segment='Small',AccountResponsible='Erwin%20Fischer')",
						"Selected context is the leaf node");
			assert.equal(oODataV4Selection.getSelectedContexts()[1].getPath(),
						"/BusinessPartners(Country_Code='3',Region='Baden-W%C3%BCrttemberg',Segment='Small',AccountResponsible='Winfried%20Maier')",
						"Selected context is the leaf node");
		});
	});
});