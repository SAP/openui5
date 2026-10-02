/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/Row",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils"
], function(
	TableQUnitUtils,
	Row,
	Column,
	FixedRowMode,
	TableUtils
) {
	"use strict";

	const TestControl = TableQUnitUtils.TestControl;

	QUnit.module("Cells", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 1
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1),
				columns: [
					new Column(),
					TableQUnitUtils.createTextColumn({text: "Column2"}),
					TableQUnitUtils.createTextColumn({text: "Column3"}).setVisible(false),
					TableQUnitUtils.createTextColumn({text: "Column4"})
				]
			});

			return this.oTable.qunit.rendered();
		},
		assertCells: function(assert) {
			const aActualCells = this.oTable.getRows()[0].getCells().map((oCell) => oCell.getText());
			const aExpectedCells = Array.prototype.slice.call(arguments, 1);

			assert.deepEqual(aActualCells, aExpectedCells, "The row has the correct cells");
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initial", function(assert) {
		this.assertCells(assert, "Column2", "Column4");
	});

	QUnit.test("After changing column visibility", async function(assert) {
		this.oTable.getColumns()[1].setVisible(false);
		await this.oTable.qunit.rendered();
		this.assertCells(assert, "Column4");

		this.oTable.getColumns()[2].setVisible(true);
		await this.oTable.qunit.rendered();
		this.assertCells(assert, "Column3", "Column4");
	});

	QUnit.test("After setting column templates", async function(assert) {
		this.oTable.getColumns()[0].setTemplate(new TestControl({text: "Column1"}));
		await this.oTable.qunit.rendered();
		this.assertCells(assert, "Column1", "Column2", "Column4");
	});

	QUnit.test("After removing column templates", async function(assert) {
		this.oTable.getColumns()[1].setTemplate(null);
		await this.oTable.qunit.rendered();
		this.assertCells(assert, "Column4");
	});

	QUnit.test("After destroying column templates", async function(assert) {
		this.oTable.getColumns()[1].destroyTemplate();
		this.oTable.getColumns()[3].getTemplate().destroy();
		await this.oTable.qunit.rendered();
		this.assertCells(assert);
	});

	QUnit.test("After changing column templates", async function(assert) {
		this.oTable.getColumns()[1].getTemplate().setText("Not Column2");
		await this.oTable.qunit.rendered();
		this.assertCells(assert, "Column2", "Column4");
	});

	QUnit.test("After removing columns", async function(assert) {
		this.oTable.removeColumn(this.oTable.getColumns()[1]);
		await this.oTable.qunit.rendered();
		this.assertCells(assert, "Column4");

		this.oTable.removeAllColumns();
		await this.oTable.qunit.rendered();
		this.assertCells(assert);
	});

	QUnit.test("After destroying columns", async function(assert) {
		this.oTable.getColumns()[1].destroy();
		await this.oTable.qunit.rendered();
		this.assertCells(assert, "Column4");

		this.oTable.destroyColumns();
		await this.oTable.qunit.rendered();
		this.assertCells(assert);
	});

	QUnit.test("After adding columns", async function(assert) {
		this.oTable.addColumn(new Column({template: new TestControl({text: "Column5"})}));
		await this.oTable.qunit.rendered();
		this.assertCells(assert, "Column2", "Column4", "Column5");

		this.oTable.insertColumn(new Column({template: new TestControl({text: "Column0"})}), 0);
		await this.oTable.qunit.rendered();
		this.assertCells(assert, "Column0", "Column2", "Column4", "Column5");
	});

	QUnit.module("Functions", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 1
				}),
				fixedColumnCount: 1,
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(1),
				columns: [
					new Column(),
					TableQUnitUtils.createTextColumn({text: "Column2"}),
					TableQUnitUtils.createTextColumn({text: "Column3"}).setVisible(false),
					TableQUnitUtils.createTextColumn({text: "Column4"})
				],
				rowActionTemplate: TableQUnitUtils.createRowAction(),
				rowActionCount: 2
			});

			return this.oTable.qunit.rendered();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertRowStyleHovered: function(assert, oRow) {
			const mDomRefs = oRow.getDomRefs(false);
			assert.ok(mDomRefs.rowHeaderPart.classList.contains("sapUiTableRowHvr"), "Selector part is styled as hovered");
			assert.ok(mDomRefs.rowFixedPart.classList.contains("sapUiTableRowHvr"), "Fixed part is styled as hovered");
			assert.ok(mDomRefs.rowScrollPart.classList.contains("sapUiTableRowHvr"), "Scrollable part is styled as hovered");
			assert.ok(mDomRefs.rowActionPart.classList.contains("sapUiTableRowHvr"), "Action part is styled as hovered");
		},
		assertRowStyleUnhovered: function(assert, oRow) {
			const mDomRefs = oRow.getDomRefs(false);
			assert.ok(!mDomRefs.rowHeaderPart.classList.contains("sapUiTableRowHvr"), "Selector part is styled as unhovered");
			assert.ok(!mDomRefs.rowFixedPart.classList.contains("sapUiTableRowHvr"), "Fixed part is styled as unhovered");
			assert.ok(!mDomRefs.rowScrollPart.classList.contains("sapUiTableRowHvr"), "Scrollable part is styled as unhovered");
			assert.ok(!mDomRefs.rowActionPart.classList.contains("sapUiTableRowHvr"), "Action part is styled as unhovered");
		},
		assertRowStyleSelected: function(assert, oRow) {
			const mDomRefs = oRow.getDomRefs(false);
			assert.ok(mDomRefs.rowHeaderPart.classList.contains("sapUiTableRowSel"), "Selector part is styled as selected");
			assert.ok(mDomRefs.rowFixedPart.classList.contains("sapUiTableRowSel"), "Fixed part is styled as selected");
			assert.ok(mDomRefs.rowScrollPart.classList.contains("sapUiTableRowSel"), "Scrollable part is styled as selected");
			assert.ok(mDomRefs.rowActionPart.classList.contains("sapUiTableRowSel"), "Action part is styled as selected");
		},
		assertRowStyleUnselected: function(assert, oRow) {
			const mDomRefs = oRow.getDomRefs(false);
			assert.ok(!mDomRefs.rowHeaderPart.classList.contains("sapUiTableRowSel"), "Selector part is styled as unselected");
			assert.ok(!mDomRefs.rowFixedPart.classList.contains("sapUiTableRowSel"), "Fixed part is styled as unselected");
			assert.ok(!mDomRefs.rowScrollPart.classList.contains("sapUiTableRowSel"), "Scrollable part is styled as unselected");
			assert.ok(!mDomRefs.rowActionPart.classList.contains("sapUiTableRowSel"), "Action part is styled as unselected");
		}
	});

	QUnit.test("_setHovered", function(assert) {
		const oRow = this.oTable.getRows()[0];

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
		const oRow = this.oTable.getRows()[0];
		const oSelectionPlugin = new TableQUnitUtils.TestSelectionPlugin();

		this.oTable.addDependent(oSelectionPlugin);
		sinon.spy(oSelectionPlugin, "setSelected");

		oRow._setSelected(true);
		assert.ok(oSelectionPlugin.setSelected.calledOnceWithExactly(oRow, true), "SelectionPlugin#setSelected");

		oSelectionPlugin.setSelected.resetHistory();
		oRow._setSelected(false);
		assert.ok(oSelectionPlugin.setSelected.calledOnceWithExactly(oRow, false), "SelectionPlugin#setSelected");
	});

	QUnit.test("_isSelected", function(assert) {
		const oRow = this.oTable.getRows()[0];
		const oSelectionPlugin = new TableQUnitUtils.TestSelectionPlugin();

		this.oTable.addDependent(oSelectionPlugin);
		sinon.stub(oSelectionPlugin, "isSelected").withArgs(oRow).returns(true);

		assert.deepEqual(oRow._isSelected(), true);

		oSelectionPlugin.isSelected.withArgs(oRow).returns(false);
		assert.deepEqual(oRow._isSelected(), false);
	});

	QUnit.test("_updateSelection", function(assert) {
		const oRow = this.oTable.getRows()[0];
		const oSelectionPlugin = new TableQUnitUtils.TestSelectionPlugin();

		this.oTable.addDependent(oSelectionPlugin);

		sinon.stub(oSelectionPlugin, "isSelected").withArgs(oRow).returns(false);
		oRow._updateSelection();
		this.assertRowStyleUnselected(assert, oRow);

		oSelectionPlugin.isSelected.withArgs(oRow).returns(true);
		oRow._updateSelection();
		this.assertRowStyleSelected(assert, oRow);

		oSelectionPlugin.isSelected.withArgs(oRow).returns(false);
		oRow._updateSelection();
		this.assertRowStyleUnselected(assert, oRow);
	});

	QUnit.test("isSelectable", function(assert) {
		const oRow = this.oTable.getRows()[0];
		assert.ok(oRow.isSelectable(), "Row is selectable by default");
	});

	QUnit.test("isSelectable - empty row", function(assert) {
		const oRow = this.oTable.getRows()[0];
		assert.ok(!oRow.isEmpty(), "Row is not empty");
		assert.ok(oRow.isSelectable(), "Non-empty row is selectable");

		oRow.setRowBindingContext(null, this.oTable);
		assert.ok(oRow.isEmpty(), "Row is empty after removing binding context");
		assert.notOk(oRow.isSelectable(), "Empty row is not selectable");
	});

	QUnit.test("sapUiTableRowSelectable CSS class", function(assert) {
		const oRow = this.oTable.getRows()[0];
		const oSelectionPlugin = new TableQUnitUtils.TestSelectionPlugin();
		const mDomRefs = oRow.getDomRefs(false);

		this.oTable.addDependent(oSelectionPlugin);
		sinon.stub(oSelectionPlugin, "isSelected").withArgs(oRow).returns(false);

		oRow._updateSelection();
		assert.ok(mDomRefs.rowScrollPart.classList.contains("sapUiTableRowSelectable"),
			"Selectable row has sapUiTableRowSelectable class");

		sinon.stub(oRow, "isSelectable").returns(false);
		oRow._updateSelection();
		assert.notOk(mDomRefs.rowScrollPart.classList.contains("sapUiTableRowSelectable"),
			"Not-selectable row does not have sapUiTableRowSelectable class");
	});

	QUnit.test("sapUiTableRowSelectable CSS class - not selectable via row state", function(assert) {
		const oRow = this.oTable.getRows()[0];
		const oSelectionPlugin = new TableQUnitUtils.TestSelectionPlugin();
		const mDomRefs = oRow.getDomRefs(false);

		this.oTable.addDependent(oSelectionPlugin);
		sinon.stub(oSelectionPlugin, "isSelected").withArgs(oRow).returns(false);

		oRow._updateSelection();
		assert.ok(mDomRefs.rowScrollPart.classList.contains("sapUiTableRowSelectable"),
			"Row with binding context has sapUiTableRowSelectable class");

		oRow.setRowBindingContext(null, this.oTable);
		oRow._updateSelection();
		assert.notOk(oRow.isSelectable(), "Empty row is not selectable");
		assert.notOk(mDomRefs.rowScrollPart.classList.contains("sapUiTableRowSelectable"),
			"Empty row does not have sapUiTableRowSelectable class");
	});

	QUnit.test("_setFocus", function(assert) {
		const oRow = this.oTable.getRows()[0];
		const $SelectAll = this.oTable.$("selall");

		oRow._setFocus();
		assert.deepEqual(document.activeElement, oRow.getDomRef("col0"),
			"_setFocus called with no parameter: focus is set on the first data cell");
		$SelectAll.trigger("focus");
		assert.deepEqual(document.activeElement, $SelectAll[0], "Focus set outside of Row");
		oRow._setFocus(false);
		assert.deepEqual(document.activeElement, oRow.getDomRef("col0"),
			"_setFocus(false): focus is set on the first data cell");
		$SelectAll.trigger("focus");
		assert.deepEqual(document.activeElement, $SelectAll[0], "Focus set outside of Row");
		oRow._setFocus(true);
		assert.deepEqual(document.activeElement, oRow.getDomRef("col0"),
			"_setFocus(true), but no interactive elements: focus is set on the first data cell");
		$SelectAll.trigger("focus");
		assert.deepEqual(document.activeElement, $SelectAll[0], "Focus set outside of Row");
		oRow.getCells()[0].$().attr("tabindex", 0);
		oRow.getCells()[1].$().attr("tabindex", 0);
		oRow._setFocus(true);
		assert.deepEqual(document.activeElement, oRow.getCells()[0].getDomRef(),
			"_setFocus(true): focus is set on the first interactive element");
	});

	QUnit.test("Keyboard-shortcut on Row", function(assert) {
		const oRow = this.oTable.getRows()[0];
		const oRowAction = oRow.getRowAction();
		const oRowActionItem1 = oRowAction.getItems()[0];
		const oRowActionItem2 = oRowAction.getItems()[1];
		sinon.spy(oRowActionItem1, "onKeyboardShortcut");
		sinon.spy(oRowActionItem2, "onKeyboardShortcut");

		oRow.onKeyboardShortcut("navigation");

		assert.ok(oRowActionItem1.onKeyboardShortcut.calledWith("navigation"), "onKeyboardShortcut called on first action item");
		assert.ok(oRowActionItem2.onKeyboardShortcut.calledWith("navigation"), "onKeyboardShortcut called on second action item");
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

	QUnit.test("UpdateState - called when a non-null context is set", function(assert) {
		const oUpdateStateSpy = sinon.spy();

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, oUpdateStateSpy);

		this.oRow.setRowBindingContext(null, this.oTable);
		assert.ok(oUpdateStateSpy.notCalled, "'UpdateState' hook not called when context is null");

		this.oRow.setRowBindingContext({}, this.oTable);
		assert.strictEqual(oUpdateStateSpy.callCount, 1, "'UpdateState' hook called once when context is set");
	});

	QUnit.test("UpdateState - state.context is the context that was set", function(assert) {
		const oContext = {};
		let oContextInState;

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, (oState) => {
			oContextInState = oState.context;
		});

		this.oRow.setRowBindingContext(oContext, this.oTable);
		assert.strictEqual(oContextInState, oContext, "oState.context is the context passed to setRowBindingContext");
	});

	QUnit.test("UpdateState - state properties can be read and written", function(assert) {
		let oState;

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, (_oState) => {
			oState = _oState;
			_oState.type = _oState.Type.GroupHeader;
			_oState.contentHidden = true;
			_oState.title = "My Title";
			_oState.expandable = true;
			_oState.expanded = true;
			_oState.level = 3;
			_oState.selectable = false;
		});

		this.oRow.setRowBindingContext({}, this.oTable);

		assert.strictEqual(oState.type, oState.Type.GroupHeader, "type is set to GroupHeader");
		assert.strictEqual(oState.contentHidden, true, "contentHidden is set to true");
		assert.strictEqual(oState.title, "My Title", "title is set");
		assert.strictEqual(oState.expandable, true, "expandable is set to true");
		assert.strictEqual(oState.expanded, true, "expanded is true when expandable is true");
		assert.strictEqual(oState.level, 3, "level is set to 3");
		assert.strictEqual(oState.selectable, false, "selectable is set to false");
	});

	QUnit.test("UpdateState - state is reset before the hook is called on each update", function(assert) {
		let iCallCount = 0;

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, (oState) => {
			iCallCount++;
			if (iCallCount === 1) {
				oState.selectable = false;
				oState.title = "First";
			}
		});

		this.oRow.setRowBindingContext({}, this.oTable);
		assert.strictEqual(this.oRow.isSelectable(), false, "selectable is false after first update");
		assert.strictEqual(this.oRow.getTitle(), "First", "title is 'First' after first update");

		this.oRow.setRowBindingContext({}, this.oTable);
		assert.strictEqual(this.oRow.isSelectable(), true, "selectable is reset to true before second update");
		assert.strictEqual(this.oRow.getTitle(), "", "title is reset to empty before second update");
	});

	QUnit.test("UpdateState - selectable defaults to false when row is empty", function(assert) {
		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, (oState) => {
			oState.selectable = true;
		});

		this.oRow.setRowBindingContext(null, this.oTable);
		assert.strictEqual(this.oRow.isSelectable(), false, "empty row is not selectable even if hook sets selectable to true");
	});

	QUnit.test("UpdateState - expanded defaults to false when not expandable", function(assert) {
		let oState;

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, (_oState) => {
			oState = _oState;
			_oState.expandable = false;
			_oState.expanded = true;
		});

		this.oRow.setRowBindingContext({}, this.oTable);
		assert.strictEqual(oState.expanded, false, "expanded is false when expandable is false");
	});

	QUnit.test("UpdateState - invalid type throws", function(assert) {
		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, (oState) => {
			assert.throws(() => {
				oState.type = "InvalidType";
			}, /not a valid type/i, "Setting an invalid type throws an error");
		});

		this.oRow.setRowBindingContext({}, this.oTable);
	});

	QUnit.test("UpdateState - state.Type is read-only", function(assert) {
		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, (oState) => {
			assert.throws(() => {
				oState.Type = {};
			}, "Assigning to state.Type throws");
		});

		this.oRow.setRowBindingContext({}, this.oTable);
	});

	QUnit.test("UpdateState - state.empty is read-only and reflects context presence", function(assert) {
		let oState;

		TableUtils.Hook.register(this.oTable, TableUtils.Hook.Keys.Row.UpdateState, (_oState) => {
			oState = _oState;
			assert.throws(() => {
				_oState.empty = true;
			}, "Assigning to state.empty throws");
		});

		this.oRow.setRowBindingContext({}, this.oTable);
		assert.strictEqual(oState.empty, false, "state.empty is false when a context is set");
	});

	QUnit.test("Expand", function(assert) {
		const oExpandSpy = sinon.spy();

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

		oExpandSpy.resetHistory();
		this.oRow.isExpandable.returns(true);
		this.oRow.isExpanded.returns(false);
		this.oRow.toggleExpandedState();
		assert.strictEqual(oExpandSpy.callCount, 1, "'Expand' hook called once when calling #toggleExpandedState on a collapsed row");
	});

	QUnit.test("Collapse", function(assert) {
		const oCollapseSpy = sinon.spy();

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

		oCollapseSpy.resetHistory();
		this.oRow.isExpandable.returns(true);
		this.oRow.isExpanded.returns(true);
		this.oRow.toggleExpandedState();
		assert.strictEqual(oCollapseSpy.callCount, 1, "'Collapse' hook called once when calling #toggleExpandedState on a collapsed row");
	});
});