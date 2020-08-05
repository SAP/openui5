/*global QUnit, oTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/Column"
], function(TableQUnitUtils, Column) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var initRowActions = window.initRowActions;

	var TestControl = TableQUnitUtils.TestControl;

	QUnit.module("Cells", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCount: 1,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1)
			}, function(oTable) {
				oTable.addColumn(new Column());
				oTable.addColumn(new Column({template: new TestControl({text: "Column2"})}));
				oTable.addColumn(new Column({template: new TestControl({text: "Column3"}), visible: false}));
				oTable.addColumn(new Column({template: new TestControl({text: "Column4"})}));
			});

			sap.ui.getCore().applyChanges();
			return this.oTable.qunit.whenRenderingFinished();
		},
		assertCells: function(assert) {
			var aActualCells = this.oTable.getRows()[0].getCells().map(function(oCell) {
				return oCell.getText();
			});
			var aExpectedCells = Array.prototype.slice.call(arguments, 1);

			assert.deepEqual(aActualCells, aExpectedCells, "The row has the correct cells");
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initial", function(assert) {
		this.assertCells(assert, "Column2", "Column4");
	});

	QUnit.test("After changing column visibility", function(assert) {
		this.oTable.getColumns()[1].setVisible(false);
		sap.ui.getCore().applyChanges();
		this.assertCells(assert, "Column4");

		this.oTable.getColumns()[2].setVisible(true);
		sap.ui.getCore().applyChanges();
		this.assertCells(assert, "Column3", "Column4");
	});

	QUnit.test("After setting column templates", function(assert) {
		this.oTable.getColumns()[0].setTemplate(new TestControl({text: "Column1"}));
		sap.ui.getCore().applyChanges();
		this.assertCells(assert, "Column1", "Column2", "Column4");
	});

	QUnit.test("After removing column templates", function(assert) {
		this.oTable.getColumns()[1].setTemplate(null);
		sap.ui.getCore().applyChanges();
		this.assertCells(assert, "Column4");
	});

	QUnit.test("After destroying column templates", function(assert) {
		this.oTable.getColumns()[1].destroyTemplate();
		this.oTable.getColumns()[3].getTemplate().destroy();
		sap.ui.getCore().applyChanges();
		this.assertCells(assert);
	});

	QUnit.test("After changing column templates", function(assert) {
		this.oTable.getColumns()[1].getTemplate().setText("Not Column2");
		sap.ui.getCore().applyChanges();
		this.assertCells(assert, "Column2", "Column4");
	});

	QUnit.test("After removing columns", function(assert) {
		this.oTable.removeColumn(this.oTable.getColumns()[1]);
		sap.ui.getCore().applyChanges();
		this.assertCells(assert, "Column4");

		this.oTable.removeAllColumns();
		sap.ui.getCore().applyChanges();
		this.assertCells(assert);
	});

	QUnit.test("After destroying columns", function(assert) {
		this.oTable.getColumns()[1].destroy();
		sap.ui.getCore().applyChanges();
		this.assertCells(assert, "Column4");

		this.oTable.destroyColumns();
		sap.ui.getCore().applyChanges();
		this.assertCells(assert);
	});

	QUnit.test("After adding columns", function(assert) {
		this.oTable.addColumn(new Column({template: new TestControl({text: "Column5"})}));
		sap.ui.getCore().applyChanges();
		this.assertCells(assert, "Column2", "Column4", "Column5");

		this.oTable.insertColumn(new Column({template: new TestControl({text: "Column0"})}), 0);
		sap.ui.getCore().applyChanges();
		this.assertCells(assert, "Column0", "Column2", "Column4", "Column5");
	});

	QUnit.module("Functions", {
		beforeEach: function() {
			createTables();
			oTable.clearSelection();
			initRowActions(oTable, 2, 2);
		},
		afterEach: function() {
			destroyTables();
		},
		assertRowStyleHovered: function(assert, oRow) {
			var mDomRefs = oRow.getDomRefs(false);
			assert.ok(mDomRefs.rowHeaderPart.classList.contains("sapUiTableRowHvr"), "Selector part is styled as hovered");
			assert.ok(mDomRefs.rowFixedPart.classList.contains("sapUiTableRowHvr"), "Fixed part is styled as hovered");
			assert.ok(mDomRefs.rowScrollPart.classList.contains("sapUiTableRowHvr"), "Scrollable part is styled as hovered");
			assert.ok(mDomRefs.rowActionPart.classList.contains("sapUiTableRowHvr"), "Action part is styled as hovered");
		},
		assertRowStyleUnhovered: function(assert, oRow) {
			var mDomRefs = oRow.getDomRefs(false);
			assert.ok(!mDomRefs.rowHeaderPart.classList.contains("sapUiTableRowHvr"), "Selector part is styled as unhovered");
			assert.ok(!mDomRefs.rowFixedPart.classList.contains("sapUiTableRowHvr"), "Fixed part is styled as unhovered");
			assert.ok(!mDomRefs.rowScrollPart.classList.contains("sapUiTableRowHvr"), "Scrollable part is styled as unhovered");
			assert.ok(!mDomRefs.rowActionPart.classList.contains("sapUiTableRowHvr"), "Action part is styled as unhovered");
		},
		assertRowStyleSelected: function(assert, oRow) {
			var mDomRefs = oRow.getDomRefs(false);
			assert.ok(mDomRefs.rowHeaderPart.classList.contains("sapUiTableRowSel"), "Selector part is styled as selected");
			assert.ok(mDomRefs.rowFixedPart.classList.contains("sapUiTableRowSel"), "Fixed part is styled as selected");
			assert.ok(mDomRefs.rowScrollPart.classList.contains("sapUiTableRowSel"), "Scrollable part is styled as selected");
			assert.ok(mDomRefs.rowActionPart.classList.contains("sapUiTableRowSel"), "Action part is styled as selected");
		},
		assertRowStyleUnselected: function(assert, oRow) {
			var mDomRefs = oRow.getDomRefs(false);
			assert.ok(!mDomRefs.rowHeaderPart.classList.contains("sapUiTableRowSel"), "Selector part is styled as unselected");
			assert.ok(!mDomRefs.rowFixedPart.classList.contains("sapUiTableRowSel"), "Fixed part is styled as unselected");
			assert.ok(!mDomRefs.rowScrollPart.classList.contains("sapUiTableRowSel"), "Scrollable part is styled as unselected");
			assert.ok(!mDomRefs.rowActionPart.classList.contains("sapUiTableRowSel"), "Action part is styled as unselected");
		}
	});

	QUnit.test("_setHovered", function(assert) {
		var oRow = oTable.getRows()[0];

		this.assertRowStyleUnhovered(assert, oRow);
		oRow._setHovered(true);
		this.assertRowStyleHovered(assert, oRow);
		oRow._setHovered(true);
		this.assertRowStyleHovered(assert, oRow);
		oRow._setHovered(false);
		this.assertRowStyleUnhovered(assert, oRow);
		oRow._setHovered(false);
		this.assertRowStyleUnhovered(assert, oRow);
	});

	QUnit.test("_setSelected", function(assert) {
		var oRow = oTable.getRows()[0];

		this.assertRowStyleUnselected(assert, oRow);
		oRow._setSelected(true);
		assert.deepEqual(oTable.getSelectedIndices(), [], "Styling the row as selected should not actually perform selection");
		this.assertRowStyleSelected(assert, oRow);
		oRow._setSelected(true);
		this.assertRowStyleSelected(assert, oRow);
		oTable.setSelectedIndex(5);
		oRow._setSelected(false);
		assert.deepEqual(oTable.getSelectedIndices(), [5], "Styling the row as unselected should not actually perform deselection");
		this.assertRowStyleUnselected(assert, oRow);
		oRow._setSelected(false);
		this.assertRowStyleUnselected(assert, oRow);
	});
});