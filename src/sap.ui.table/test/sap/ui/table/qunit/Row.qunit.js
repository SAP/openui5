/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/Row",
	"sap/ui/table/Column",
	"sap/ui/table/utils/TableUtils"
], function(TableQUnitUtils, Row, Column, TableUtils) {
	"use strict";

	var initRowActions = window.initRowActions;
	var TestControl = TableQUnitUtils.TestControl;

	QUnit.module("Cells", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCount: 1,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1),
				columns: [
					new Column(),
					TableQUnitUtils.createTextColumn({text: "Column2"}),
					TableQUnitUtils.createTextColumn({text: "Column3"}).setVisible(false),
					TableQUnitUtils.createTextColumn({text: "Column4"})
				]
			});

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
			this.oTable = TableQUnitUtils.createTable({
				visibleRowCount: 1,
				fixedColumnCount: 1,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1),
				columns: [
					new Column(),
					TableQUnitUtils.createTextColumn({text: "Column2"}),
					TableQUnitUtils.createTextColumn({text: "Column3"}).setVisible(false),
					TableQUnitUtils.createTextColumn({text: "Column4"})
				]
			}, function(oTable) {
				initRowActions(oTable, 2, 2);
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
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
		var oRow = this.oTable.getRows()[0];

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
		var oRow = this.oTable.getRows()[0];

		this.assertRowStyleUnselected(assert, oRow);
		oRow._setSelected(true);
		assert.deepEqual(this.oTable.getSelectedIndices(), [], "Styling the row as selected should not actually perform selection");
		this.assertRowStyleSelected(assert, oRow);
		oRow._setSelected(true);
		this.assertRowStyleSelected(assert, oRow);
		this.oTable.setSelectedIndex(0);
		oRow._setSelected(false);
		assert.deepEqual(this.oTable.getSelectedIndices(), [0], "Styling the row as unselected should not actually perform deselection");
		this.assertRowStyleUnselected(assert, oRow);
		oRow._setSelected(false);
		this.assertRowStyleUnselected(assert, oRow);
	});

	QUnit.test("_setFocus", function(assert) {
		var oRow = this.oTable.getRows()[0];
		var $SelectAll = this.oTable.$("selall");

		oRow._setFocus();
		assert.deepEqual(document.activeElement, oRow.getDomRef("col0"),
			"_setFocus called with no parameter: focus is set on the first data cell");
		$SelectAll.focus();
		assert.deepEqual(document.activeElement, $SelectAll[0], "Focus set outside of Row");
		oRow._setFocus(false);
		assert.deepEqual(document.activeElement, oRow.getDomRef("col0"),
			"_setFocus(false): focus is set on the first data cell");
		$SelectAll.focus();
		assert.deepEqual(document.activeElement, $SelectAll[0], "Focus set outside of Row");
		oRow._setFocus(true);
		assert.deepEqual(document.activeElement, oRow.getDomRef("col0"),
			"_setFocus(true), but no interactive elements: focus is set on the first data cell");
		$SelectAll.focus();
		assert.deepEqual(document.activeElement, $SelectAll[0], "Focus set outside of Row");
		oRow.getCells()[0].$().attr("tabindex", 0);
		oRow.getCells()[1].$().attr("tabindex", 0);
		oRow._setFocus(true);
		assert.deepEqual(document.activeElement, oRow.getCells()[0].getDomRef(),
			"_setFocus(true): focus is set on the first interactive element");
	});

	QUnit.module("Hooks", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.oRow = new Row();
			this.oTable.addDependent(this.oRow);
			sinon.stub(this.oRow, "isExpandable");
			sinon.stub(this.oRow, "isExpanded");
		},
		afterEach: function() {
			this.oRow.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("Expand", function(assert) {
		var oExpandSpy = sinon.spy();

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.Expand, oExpandSpy);

		this.oRow.isExpandable.returns(false);
		this.oRow.isExpanded.returns(false);
		this.oRow.expand();
		assert.ok(oExpandSpy.notCalled, "'Expand' hook not called when calling #expand on a non-expandable row");

		this.oRow.isExpandable.returns(false);
		this.oRow.isExpanded.returns(false);
		this.oRow.toggleExpandedState();
		assert.ok(oExpandSpy.notCalled, "'Expand' hook not called when calling #toggleExpandedState on a non-expandable row");

		this.oRow.isExpandable.returns(true);
		this.oRow.isExpanded.returns(true);
		this.oRow.expand();
		assert.ok(oExpandSpy.notCalled, "'Expand' hook not called when calling #expand on an expanded row");

		this.oRow.isExpandable.returns(true);
		this.oRow.isExpanded.returns(false);
		this.oRow.expand();
		assert.strictEqual(oExpandSpy.callCount, 1, "'Expand' hook called once when calling #expand on a collapsed row");

		oExpandSpy.reset();
		this.oRow.isExpandable.returns(true);
		this.oRow.isExpanded.returns(false);
		this.oRow.toggleExpandedState();
		assert.strictEqual(oExpandSpy.callCount, 1, "'Expand' hook called once when calling #toggleExpandedState on a collapsed row");
	});

	QUnit.test("Collapse", function(assert) {
		var oCollapseSpy = sinon.spy();

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.Collapse, oCollapseSpy);

		this.oRow.isExpandable.returns(false);
		this.oRow.isExpanded.returns(true);
		this.oRow.collapse();
		assert.ok(oCollapseSpy.notCalled, "'Collapse' hook not called when calling #collapse on a non-expandable row");

		this.oRow.isExpandable.returns(false);
		this.oRow.isExpanded.returns(true);
		this.oRow.toggleExpandedState();
		assert.ok(oCollapseSpy.notCalled, "'Collapse' hook not called when calling #toggleExpandedState on a non-expandable row");

		this.oRow.isExpandable.returns(true);
		this.oRow.isExpanded.returns(false);
		this.oRow.collapse();
		assert.ok(oCollapseSpy.notCalled, "'Collapse' hook not called when calling #collapse on a collapsed row");

		this.oRow.isExpandable.returns(true);
		this.oRow.isExpanded.returns(true);
		this.oRow.collapse();
		assert.strictEqual(oCollapseSpy.callCount, 1, "'Collapse' hook called once when calling #collapse on an expanded row");

		oCollapseSpy.reset();
		this.oRow.isExpandable.returns(true);
		this.oRow.isExpanded.returns(true);
		this.oRow.toggleExpandedState();
		assert.strictEqual(oCollapseSpy.callCount, 1, "'Collapse' hook called once when calling #toggleExpandedState on a collapsed row");
	});
});