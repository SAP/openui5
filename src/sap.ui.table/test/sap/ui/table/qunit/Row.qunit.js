/*global QUnit, oTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils"
], function(TableQUnitUtils) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var initRowActions = window.initRowActions;

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
			assert.ok(mDomRefs.rowSelector.classList.contains("sapUiTableRowHvr"), "Selector part is styled as hovered");
			assert.ok(mDomRefs.rowFixedPart.classList.contains("sapUiTableRowHvr"), "Fixed part is styled as hovered");
			assert.ok(mDomRefs.rowScrollPart.classList.contains("sapUiTableRowHvr"), "Scrollable part is styled as hovered");
			assert.ok(mDomRefs.rowAction.classList.contains("sapUiTableRowHvr"), "Action part is styled as hovered");
		},
		assertRowStyleUnhovered: function(assert, oRow) {
			var mDomRefs = oRow.getDomRefs(false);
			assert.ok(!mDomRefs.rowSelector.classList.contains("sapUiTableRowHvr"), "Selector part is styled as unhovered");
			assert.ok(!mDomRefs.rowFixedPart.classList.contains("sapUiTableRowHvr"), "Fixed part is styled as unhovered");
			assert.ok(!mDomRefs.rowScrollPart.classList.contains("sapUiTableRowHvr"), "Scrollable part is styled as unhovered");
			assert.ok(!mDomRefs.rowAction.classList.contains("sapUiTableRowHvr"), "Action part is styled as unhovered");
		},
		assertRowStyleSelected: function(assert, oRow) {
			var mDomRefs = oRow.getDomRefs(false);
			assert.ok(mDomRefs.rowSelector.classList.contains("sapUiTableRowSel"), "Selector part is styled as selected");
			assert.ok(mDomRefs.rowFixedPart.classList.contains("sapUiTableRowSel"), "Fixed part is styled as selected");
			assert.ok(mDomRefs.rowScrollPart.classList.contains("sapUiTableRowSel"), "Scrollable part is styled as selected");
			assert.ok(mDomRefs.rowAction.classList.contains("sapUiTableRowSel"), "Action part is styled as selected");
		},
		assertRowStyleUnselected: function(assert, oRow) {
			var mDomRefs = oRow.getDomRefs(false);
			assert.ok(!mDomRefs.rowSelector.classList.contains("sapUiTableRowSel"), "Selector part is styled as unselected");
			assert.ok(!mDomRefs.rowFixedPart.classList.contains("sapUiTableRowSel"), "Fixed part is styled as unselected");
			assert.ok(!mDomRefs.rowScrollPart.classList.contains("sapUiTableRowSel"), "Scrollable part is styled as unselected");
			assert.ok(!mDomRefs.rowAction.classList.contains("sapUiTableRowSel"), "Action part is styled as unselected");
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