/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Text"
], function(
	TableQUnitUtils,
	TreeTable,
	Column,
	ODataV4Selection,
	QUnitUtils,
	Text
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: [new ODataV4Selection()],
		rows: {
			path: '/EMPLOYEES',
			parameters: {$count: false, $orderby: 'AGE', $$aggregation: {hierarchyQualifier: "OrgChart", expandTo: 3}},
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

	QUnit.module("Basic checks", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TreeTable, {}, function(oTable) {
				oTable._oProxy._bEnableV4 = true;
				oTable.getBinding("rows").resume();
			});
			return this.oTable.qunit.whenRenderingFinished();
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
		const fnFireSelectionChangeSpy = sinon.spy(oODataV4Selection, "fireSelectionChange");
		let oRow; let aSelectedContexts;

		aSelectedContexts = oODataV4Selection.getSelectedContexts();
		assert.strictEqual(aSelectedContexts.length, 0, 'Count of selected contexts is 0');
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 0, 'getSelectedCount returns 0');
		oRow = oTable.getRows()[0];
		assert.strictEqual(oODataV4Selection.isSelected(oRow), false, 'Row 1 is not selected');
		oODataV4Selection.setSelected(oRow, true);
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 1, 'The "selectionChange" event is fired once');
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 1, 'getSelectedCount returns 1');
		assert.strictEqual(oODataV4Selection.isSelected(oRow), true, 'Row 1 is selected');

		oRow = oTable.getRows()[1];
		assert.strictEqual(oODataV4Selection.isSelected(oRow), false, 'Row 2 is not selected');
		oODataV4Selection.setSelected(oRow, true);
		assert.strictEqual(fnFireSelectionChangeSpy.callCount, 2, 'The "selectionChange" event is fired twice');
		assert.strictEqual(oODataV4Selection.getSelectedCount(), 2, 'getSelectedCount returns 2');
		assert.strictEqual(oODataV4Selection.isSelected(oRow), true, 'Row 2 selected');

		aSelectedContexts = oODataV4Selection.getSelectedContexts();
		assert.strictEqual(aSelectedContexts.length, 2, 'getSelectedContexts returns 2');
		assert.strictEqual(aSelectedContexts[0].sPath, "/EMPLOYEES('0')", 'sPath of first element in getSelectedContexts is correct');
		assert.strictEqual(aSelectedContexts[1].sPath, "/EMPLOYEES('1')", 'sPath of second element in getSelectedContexts is correct');

		oTable.getRows()[1].collapse();
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 2, 'selectedCount did not change');
			this.triggerRowSelectorClick(oTable, 3, false);
			aSelectedContexts = oODataV4Selection.getSelectedContexts();
			assert.strictEqual(aSelectedContexts.length, 3, 'selectedCount is correct');
			assert.strictEqual(aSelectedContexts[2].sPath, "/EMPLOYEES('3')", 'sPath of third element in getSelectedContexts is correct');
			oTable.getRows()[1].expand();
			return oTable.qunit.whenRenderingFinished();
		}.bind(this)).then(function() {
			aSelectedContexts = oODataV4Selection.getSelectedContexts();
			assert.strictEqual(aSelectedContexts.length, 3, 'selectedCount did not change');

			oTable.getRows()[0].collapse();
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			this.triggerRowSelectorClick(oTable, 3, false);
			assert.strictEqual(aSelectedContexts.length, 3, 'selectedCount did not change becuase the selection was triggered on an empty row');

			oODataV4Selection.clearSelection();
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 0, 'selection cleared');
			fnFireSelectionChangeSpy.restore();
		}.bind(this));
	});

	QUnit.test("SelectAll", function(assert) {
		const oTable = this.oTable;
		const oODataV4Selection = oTable.getDependents()[0];
		oTable.getRows()[1].collapse();
		oODataV4Selection.setLimit(0);
		oODataV4Selection.onHeaderSelectorPress();
		return this.whenSelectionChange(oODataV4Selection).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 8, 'all rows are selected');
			oTable.getRows()[1].expand();
			return oTable.qunit.whenRenderingFinished();
		}).then(function() {
			assert.strictEqual(oODataV4Selection.getSelectedCount(), 8, '8 are selected');
			assert.strictEqual(oODataV4Selection.isSelected(oTable.getRows()[2]), false,
				'the newly rendered row after expanding a node is not selected');
			assert.strictEqual(oODataV4Selection.isSelected(oTable.getRows()[3]), false,
				'the newly rendered row after expanding a node is not selected');
		});
	});
});