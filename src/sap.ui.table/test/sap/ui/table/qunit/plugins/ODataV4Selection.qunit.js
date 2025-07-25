/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/ui/thirdparty/jquery"
], function(
	TableQUnitUtils,
	ODataV4Selection,
	jQuery
) {
	"use strict";

	const ODataV4SelectionPlugin = ODataV4Selection.extend("sap.ui.table.test.ODataV4SelectionPlugin");

	TableQUnitUtils.setDefaultSettings({
		dependents: [new ODataV4SelectionPlugin()]
	});

	QUnit.module("Basic checks", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList());
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test(".findOn", function(assert) {
		assert.ok(ODataV4Selection.findOn(this.oTable) === this.oSelectionPlugin, "Plugin found");
	});

	QUnit.test("Enable/Disable", async function(assert) {
		const oFireSelectionChange = this.spy(this.oSelectionPlugin, "fireSelectionChange");

		this.oTable.getRows()[0].getBindingContext().setSelected(true);
		this.oSelectionPlugin.setEnabled(false);
		await TableQUnitUtils.wait(10);
		assert.equal(oFireSelectionChange.callCount, 0, "Disabled: #fireSelectionChange call");

		oFireSelectionChange.resetHistory();
		this.oSelectionPlugin.setEnabled(true);
		await TableQUnitUtils.wait(10);
		assert.equal(oFireSelectionChange.callCount, 0, "Enabled: #fireSelectionChange call");

		// When the plugin was disabled with a pending selectionChange event, it should have reset the timeout and selections after enabling again
		// should fire the selectionChange event.
		this.oTable.getRows()[0].getBindingContext().setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(oFireSelectionChange.callCount, 1, "#fireSelectionChange call");
	});

	QUnit.test("Render config", function(assert) {
		assert.deepEqual(this.oSelectionPlugin.getRenderConfig(), {
			headerSelector: {
				type: "none"
			}
		});
	});

	QUnit.module("Validation during activation", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList());
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Apply plugin when the table is not bound", function(assert) {
		this.oTable.removeDependent(this.oSelectionPlugin);
		this.oTable.unbindRows();
		this.oTable.addDependent(this.oSelectionPlugin);
		assert.ok(true, "No Error thrown");
	});

	QUnit.test("Apply plugin when the table is bound to an unsupported model", function(assert) {
		this.stub(this.oTable.getModel(), "isA")
			.withArgs("sap.ui.model.odata.v4.ODataModel")
			.returns(false);

		this.oTable.removeDependent(this.oSelectionPlugin);
		assert.throws(
			() => { this.oTable.addDependent(this.oSelectionPlugin); },
			new Error("Model must be sap.ui.model.odata.v4.ODataModel")
		);
	});

	QUnit.test("Enable plugin when the table is bound to an unsupported model", function(assert) {
		this.stub(this.oTable.getModel(), "isA")
			.withArgs("sap.ui.model.odata.v4.ODataModel")
			.returns(false);

		this.oSelectionPlugin.setEnabled(false);
		assert.throws(
			() => { this.oSelectionPlugin.setEnabled(true); },
			new Error("Model must be sap.ui.model.odata.v4.ODataModel")
		);
	});

	QUnit.test("Change to unsupported model", function(assert) {
		const oModel = this.oTable.getModel();

		this.oTable.setModel();
		this.stub(oModel, "isA")
			.withArgs("sap.ui.model.odata.v4.ODataModel")
			.returns(false);
		assert.throws(
			() => { this.oTable.setModel(oModel); },
			new Error("Model must be sap.ui.model.odata.v4.ODataModel")
		);
	});

	QUnit.test("Apply plugin when the header context is selected", function(assert) {
		this.oTable.removeDependent(this.oSelectionPlugin);
		this.oTable.getBinding().getHeaderContext().setSelected(true);

		assert.throws(
			() => { this.oTable.addDependent(this.oSelectionPlugin); },
			new Error(`Context ${this.oTable.getBinding().getHeaderContext()} is not allowed to be selected`)
		);
	});

	QUnit.test("Enable plugin when the header context is selected", function(assert) {
		this.oSelectionPlugin.setEnabled(false);
		this.oTable.getBinding().getHeaderContext().setSelected(true);

		assert.throws(
			() => { this.oSelectionPlugin.setEnabled(true); },
			new Error(`Context ${this.oTable.getBinding().getHeaderContext()} is not allowed to be selected`)
		);
	});

	QUnit.test("Apply plugin when a context is selected that is not allowed to be selected", function(assert) {
		const oContext = this.oTable.getRows()[0].getBindingContext();

		this.oTable.removeDependent(this.oSelectionPlugin);
		oContext.setSelected(true);
		this.stub(oContext, "getProperty").withArgs("@$ui5.node.isTotal").returns(true);
		assert.throws(
			() => { this.oTable.addDependent(this.oSelectionPlugin); },
			new Error(`Context ${oContext} is not allowed to be selected`),
			"Sum"
		);

		this.oTable.removeDependent(this.oSelectionPlugin);
		oContext.getProperty.restore();
		this.stub(oContext, "getProperty").withArgs("@$ui5.node.isExpanded").returns(true);
		assert.throws(
			() => { this.oTable.addDependent(this.oSelectionPlugin); },
			new Error(`Context ${oContext} is not allowed to be selected`),
			"Group Header"
		);
	});

	QUnit.test("Enable plugin when a context is selected that is not allowed to be selected", function(assert) {
		const oContext = this.oTable.getRows()[0].getBindingContext();

		this.oSelectionPlugin.setEnabled(false);
		oContext.setSelected(true);
		this.stub(oContext, "getProperty").withArgs("@$ui5.node.isTotal").returns(true);

		assert.throws(
			() => { this.oSelectionPlugin.setEnabled(true); },
			new Error(`Context ${oContext} is not allowed to be selected`),
			"Sum"
		);

		this.oSelectionPlugin.setEnabled(false);
		oContext.getProperty.restore();
		this.stub(oContext, "getProperty").withArgs("@$ui5.node.isExpanded").returns(true);
		assert.throws(
			() => { this.oSelectionPlugin.setEnabled(true); },
			new Error(`Context ${oContext} is not allowed to be selected`),
			"Group Header"
		);
	});

	QUnit.module("Selection API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList());
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			this.oSelectionChangeHandler = this.spy();
			this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("#isContextSelectable", function(assert) {
		assert.notOk(this.oSelectionPlugin.isContextSelectable(this.oTable.getBinding().getHeaderContext()), "Header context");

		const oContext = this.oTable.getRows()[0].getBindingContext();
		this.stub(oContext, "getProperty");

		assert.ok(this.oSelectionPlugin.isContextSelectable(oContext), "Row in a list");

		oContext.getProperty.withArgs("@$ui5.node.isTotal").returns(true);
		assert.notOk(this.oSelectionPlugin.isContextSelectable(oContext), "Total row in an aggregation");

		oContext.getProperty.withArgs("@$ui5.node.isTotal").returns(false);
		oContext.getProperty.withArgs("@$ui5.node.isExpanded").returns(true);
		assert.notOk(this.oSelectionPlugin.isContextSelectable(oContext), "Expanded row in an aggregation");

		oContext.getProperty.withArgs("@$ui5.node.isExpanded").returns(false);
		assert.notOk(this.oSelectionPlugin.isContextSelectable(oContext), "Collapsed row in an aggregation");

		this.stub(this.oTable.getBinding(), "getAggregation").returns({hierarchyQualifier: "hierarchy"});
		oContext.getProperty.withArgs("@$ui5.node.isTotal").returns(true);
		oContext.getProperty.withArgs("@$ui5.node.isExpanded").returns();
		assert.ok(this.oSelectionPlugin.isContextSelectable(oContext), "Total row in a hierarchy");

		oContext.getProperty.withArgs("@$ui5.node.isTotal").returns(false);
		oContext.getProperty.withArgs("@$ui5.node.isExpanded").returns(true);
		assert.ok(this.oSelectionPlugin.isContextSelectable(oContext), "Expanded row in a hierarchy");

		oContext.getProperty.withArgs("@$ui5.node.isExpanded").returns(false);
		assert.ok(this.oSelectionPlugin.isContextSelectable(oContext), "Collapsed row in a hierarchy");
	});

	QUnit.test("#getSelectedContexts", function(assert) {
		const aRows = this.oTable.getRows();
		let aSelectedContexts;

		assert.strictEqual(this.oSelectionPlugin.getSelectedContexts().length, 0, "No context selected");

		aRows[1].getBindingContext().setSelected(true);
		aRows[2].getBindingContext().setSelected(true);
		aSelectedContexts = this.oSelectionPlugin.getSelectedContexts();
		assert.strictEqual(aSelectedContexts.length, 2, "2 contexts selected");

		this.oSelectionPlugin.setEnabled(false);
		assert.strictEqual(this.oSelectionPlugin.getSelectedContexts().length, 0, "Plugin disabled");
		assert.ok(aSelectedContexts.every((oContext) => oContext.isSelected()), "Plugin disabled: Contexts are still selected");

		this.oSelectionPlugin.setEnabled(true);
		aSelectedContexts = this.oSelectionPlugin.getSelectedContexts();
		assert.strictEqual(aSelectedContexts.length, 2, "Plugin enabled: 2 contexts selected");
	});

	QUnit.test("#getSelectedCount", function(assert) {
		this.stub(this.oTable.getBinding(), "getSelectionCount").returns(3);
		assert.strictEqual(this.oSelectionPlugin.getSelectedCount(), 3);

		this.oSelectionPlugin.setEnabled(false);
		assert.strictEqual(this.oSelectionPlugin.getSelectedCount(), 0, "Plugin disabled");
	});

	QUnit.test("#isSelected", function(assert) {
		const oRow = this.oTable.getRows()[0];
		const oContextIsSelected = this.stub(oRow.getBindingContext(), "isSelected").returns(true);

		assert.strictEqual(this.oSelectionPlugin.isSelected(oRow), true, "Context is selected");

		oContextIsSelected.returns(false);
		assert.strictEqual(this.oSelectionPlugin.isSelected(oRow), false, "Context is not selected");

		oContextIsSelected.returns(true);
		this.oSelectionPlugin.setEnabled(false);
		assert.strictEqual(this.oSelectionPlugin.isSelected(oRow), false, "Context is selected, plugin is disabled");
	});

	QUnit.test("#clearSelection", async function(assert) {
		const aRows = this.oTable.getRows();
		const oHeaderContextSetSelected = this.spy(this.oTable.getBinding().getHeaderContext(), "setSelected");

		aRows[1].getBindingContext().setSelected(true);
		aRows[2].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.clearSelection();
		assert.ok(oHeaderContextSetSelected.calledOnceWithExactly(false), "HeaderContext#setSelected call");
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
	});

	QUnit.test("#clearSelection with unresolved binding", function(assert) {
		this.oTable.bindRows("MyRelativePath");
		// An unresolved binding has no contexts, so there is nothing to deselect. We just check that no error is thrown.
		this.oSelectionPlugin.clearSelection();
		assert.notOk(this.oTable.getBinding().getHeaderContext(), "Header context");
	});

	QUnit.test("#onKeyboardShortcut", async function(assert) {
		const aRows = this.oTable.getRows();
		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");
		const oEvent = new jQuery.Event();

		this.spy(oEvent, "setMarked");
		this.oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.wait(200);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Toggle selection: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Toggle selection: Selected contexts");

		aRows[1].getBindingContext().setSelected(true);
		aRows[2].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oSelectionChangeHandler.resetHistory();
		oClearSelection.resetHistory();
		oEvent.setMarked.resetHistory();
		this.oSelectionPlugin.onKeyboardShortcut("clear", oEvent);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Clear selection: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Clear selection: Selected contexts");
		assert.equal(oClearSelection.callCount, 1, "Clear selection: #clearSelection call");
		assert.ok(oEvent.setMarked.calledWithExactly("sapUiTableClearAll"), "Clear selection: Event mark 'sapUiTableClearAll'");
	});

	QUnit.module("Binding selection API", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList());
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			this.oSelectionChangeHandler = this.spy();
			this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Context#setSelected", async function(assert) {
		const aRows = this.oTable.getRows();

		aRows[0].getBindingContext().setSelected(true);
		aRows[1].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), true, "#isSelected (Row 2)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");
	});

	QUnit.test("Context#setSelected; Hierarchy", async function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForHierarchy(), (oTable) => {
			oTable.getBinding().resume();
		});
		this.oSelectionPlugin = this.oTable.getDependents()[0];
		this.oSelectionChangeHandler = this.spy();
		this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
		await this.oTable.qunit.whenRenderingFinished();

		const aRows = this.oTable.getRows();

		aRows[0].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Node): selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), true, "Context#isSelected (Node)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");

		aRows[0].getBindingContext().setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.oSelectionChangeHandler.resetHistory();
		aRows[4].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Leaf): selectionChange event");
		assert.equal(aRows[4].getBindingContext().isSelected(), true, "Context#isSelected (Leaf)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");
	});

	QUnit.test("Context#setSelected; Data Aggregation", async function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForDataAggregation(), (oTable) => {
			oTable.getBinding().resume();
		});
		this.oSelectionPlugin = this.oTable.getDependents()[0];
		this.oSelectionChangeHandler = this.spy();
		this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
		await this.oTable.qunit.whenRenderingFinished();

		const aRows = this.oTable.getRows();

		assert.throws(() => { aRows[0].getBindingContext().setSelected(true); }, "Sum: Selecting the context throws an error");
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Sum: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "Sum: #isSelected (Row)");
		assert.equal(aRows[0].getBindingContext().isSelected(), false, "Sum: Context selected state");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Sum: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		assert.throws(() => { aRows[1].getBindingContext().setSelected(true); }, "Group Header: Selecting the context throws an error");
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Group Header: selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "Group Header: #isSelected (Row)");
		assert.equal(aRows[1].getBindingContext().isSelected(), false, "Group Header: Context selected state");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Group Header: Selected contexts");

		await TableQUnitUtils.expandAndScrollTableWithDataAggregation(this.oTable);

		this.oSelectionChangeHandler.resetHistory();
		aRows[2].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Leaf): selectionChange event");
		assert.equal(aRows[2].getBindingContext().isSelected(), true, "Context#isSelected (Leaf)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");
	});

	QUnit.test("HeaderContext#setSelected", async function(assert) {
		const oHeaderContext = this.oTable.getBinding().getHeaderContext();
		const aRows = this.oTable.getRows();

		aRows[0].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oSelectionChangeHandler.resetHistory();
		assert.throws(
			() => { oHeaderContext.setSelected(true); },
			"Selecting the header context throws an error"
		);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "HeaderContext selected: selectionChange event");
		assert.equal(oHeaderContext.isSelected(), false, "HeaderContext selected: HeaderContext selected state");
		assert.ok(this.oTable.getRows().every((oRow) => {
			return !this.oSelectionPlugin.isSelected(oRow);
		}), "HeaderContext selected: No row is selected");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "HeaderContext selected: Selected contexts");

		aRows[0].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oSelectionChangeHandler.resetHistory();
		oHeaderContext.setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "HeaderContext deselected: selectionChange event");
		assert.equal(oHeaderContext.isSelected(), false, "HeaderContext selected: HeaderContext selected state");
		assert.ok(this.oTable.getRows().every((oRow) => {
			return !this.oSelectionPlugin.isSelected(oRow);
		}), "HeaderContext deselected: No row is selected");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "HeaderContext deselected: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(false);
		oHeaderContext.setSelected(true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin disabled: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Plugin disabled: Selected contexts");
		assert.equal(oHeaderContext.isSelected(), true, "Plugin disabled: HeaderContext selected state");
	});
});