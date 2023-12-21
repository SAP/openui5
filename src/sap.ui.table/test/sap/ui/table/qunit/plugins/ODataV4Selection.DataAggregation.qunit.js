/*global QUnit*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Text"
], function(
	TableQUnitUtils,
	Table,
	Column,
	Fixed,
	ODataV4Selection,
	QUnitUtils,
	Text
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
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(Table, {}, function(oTable) {
				oTable.getBinding("rows").resume();
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		triggerRowSelectorClick: function(oTable, iIndex, bShiftKey) {
			QUnitUtils.triggerEvent("tap", oTable.qunit.getRowHeaderCell(iIndex), {shiftKey: bShiftKey});
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

			oTable.getRows()[3].getBindingContext().expand();
			return oTable.qunit.whenBindingChange();
		}.bind(this)).then(function() {
			oTable.setFirstVisibleRow(6);
			return oTable.qunit.whenBindingChange();
		}).then(function() {
			oTable.getRows()[4].getBindingContext().expand();
			return oTable.qunit.whenBindingChange();
		}).then(function() {
			oTable.setFirstVisibleRow(9);
			return oTable.qunit.whenVSbScrolled();
		}).then(function() {
			oTable.getRows()[4].getBindingContext().expand();
			return oTable.qunit.whenBindingChange();
		}).then(function() {
			oTable.setFirstVisibleRow(11);
			return oTable.qunit.whenVSbScrolled();
		}).then(function() {
			this.triggerRowSelectorClick(oTable, 3, false);
			assert.strictEqual(oODataV4Selection.isSelected(oTable.getRows()[3]), true, 'Row 4 is selected (leaf)');
			this.triggerRowSelectorClick(oTable, 4, false);
			assert.strictEqual(oODataV4Selection.isSelected(oTable.getRows()[4]), true, 'Row 5 is selected (leaf)');
			oODataV4Selection.onHeaderSelectorPress();
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 0, 'all rows are deselected');
		}.bind(this));
	});
});