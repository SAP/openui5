/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/plugins/ODataV4SingleSelection",
	"sap/ui/thirdparty/jquery"
], function(
	TableQUnitUtils,
	ODataV4SingleSelection,
	jQuery
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: [new ODataV4SingleSelection()]
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
		assert.ok(ODataV4SingleSelection.findOn(this.oTable) === this.oSelectionPlugin, "Plugin found");
	});

	QUnit.test("Lifecycle", function(assert) {
		this.oTable.removeDependent(this.oSelectionPlugin);

		const oActivateSpy = this.spy(this.oSelectionPlugin, "onActivate");
		this.oTable.addDependent(this.oSelectionPlugin);
		assert.ok(oActivateSpy.calledOnce, "The selection plugin is activated");
		assert.strictEqual(this.oTable.getSelectionMode(), "Single", "Selection mode of the table after activating the plugin");

		this.oSelectionPlugin.onDeactivate(this.oTable);
		assert.strictEqual(this.oTable.getSelectionMode(), "None", "Selection mode of the table after deactivating the plugin");

		const oNewSelectionPlugin = new ODataV4SingleSelection();
		this.oSelectionPlugin.destroy();
		this.oTable.addDependent(oNewSelectionPlugin);
		assert.strictEqual(this.oTable.getSelectionMode(), "Single", "Selection mode of the table after replacing the selection plugin");
	});

	QUnit.test("Enable/Disable", async function(assert) {
		const oFireSelectionChange = this.spy(this.oSelectionPlugin, "fireSelectionChange");

		this.oTable.getRows()[0].getBindingContext().setSelected(true);
		this.oSelectionPlugin.setEnabled(false);
		assert.strictEqual(this.oTable.getSelectionMode(), "None", "Table selection mode");
		assert.ok(this.oTable.getRows()[0].getBindingContext().isSelected(), "Context selected state");
		await TableQUnitUtils.wait(10);
		assert.equal(oFireSelectionChange.callCount, 0, "#fireSelectionChange call");

		oFireSelectionChange.resetHistory();
		this.oSelectionPlugin.setEnabled(true);
		assert.ok(this.oSelectionPlugin.getEnabled(), "Plugin is enabled");
		assert.strictEqual(this.oTable.getSelectionMode(), "Single", "Table selection mode");
		await TableQUnitUtils.wait(10);
		assert.equal(oFireSelectionChange.callCount, 0, "#fireSelectionChange call");
	});

	QUnit.test("Render config", function(assert) {
		assert.deepEqual(this.oSelectionPlugin.getRenderConfig(), {
			headerSelector: {
				type: "none"
			}
		});
	});

	QUnit.test("Unbind", async function(assert) {
		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");
		const oFireSelectionChange = this.spy(this.oSelectionPlugin, "fireSelectionChange");

		this.oTable.unbindRows();
		await this.oTable.qunit.whenRenderingFinished();

		assert.equal(oClearSelection.callCount, 0, "#clearSelection call");
		assert.equal(oFireSelectionChange.callCount, 0, "#fireSelectionChange call");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");
		assert.strictEqual(this.oSelectionPlugin.isActive(), true, "Active state");
	});

	QUnit.test("Bind", async function(assert) {
		this.oTable.unbindRows();
		await this.oTable.qunit.whenRenderingFinished();

		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");
		const oFireSelectionChange = this.spy(this.oSelectionPlugin, "fireSelectionChange");

		this.oTable.bindRows("/Products");
		await this.oTable.qunit.whenRenderingFinished();

		assert.equal(oClearSelection.callCount, 0, "#clearSelection call");
		assert.equal(oFireSelectionChange.callCount, 0, "fireSelectionChange call");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");
	});

	QUnit.test("Bind when disabled", async function(assert) {
		this.oTable.unbindRows();
		this.oSelectionPlugin.setEnabled(false);
		await this.oTable.qunit.whenRenderingFinished();

		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");
		const oFireSelectionChange = this.spy(this.oSelectionPlugin, "fireSelectionChange");

		this.oTable.bindRows("/Products");
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(oClearSelection.callCount, 0, "#clearSelection call");
		assert.equal(oFireSelectionChange.callCount, 0, "fireSelectionChange call");
		assert.strictEqual(this.oSelectionPlugin.isActive(), false, "Active state after binding");

		this.oSelectionPlugin.setEnabled(true);
		assert.strictEqual(this.oSelectionPlugin.isActive(), true, "Active state after binding and enabling");
	});

	QUnit.test("Rebind", async function(assert) {
		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");
		const oFireSelectionChange = this.spy(this.oSelectionPlugin, "fireSelectionChange");

		this.oTable.bindRows("/Products");
		await this.oTable.qunit.whenRenderingFinished();

		assert.equal(oClearSelection.callCount, 0, "#clearSelection call");
		assert.equal(oFireSelectionChange.callCount, 0, "#fireSelectionChange call");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");
	});

	QUnit.test("Bind with unresolved binding", function(assert) {
		this.oTable.bindRows("MyRelativePath");
		assert.ok(this.oSelectionPlugin.isActive(), "Active state");
		assert.notOk(this.oTable.getBinding().getHeaderContext(), "Header context");
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

	QUnit.test("Apply plugin when multiple contexts are selected", function(assert) {
		this.oTable.removeDependent(this.oSelectionPlugin);

		for (const oContext of this.oTable.getBinding().getCurrentContexts().slice(0, 2)) {
			oContext.setSelected(true);
		}

		assert.throws(
			() => { this.oTable.addDependent(this.oSelectionPlugin); },
			new Error("Multiple contexts selected")
		);
	});

	QUnit.test("Enable plugin when multiple contexts are selected", function(assert) {
		this.oSelectionPlugin.setEnabled(false);

		for (const oContext of this.oTable.getBinding().getCurrentContexts().slice(0, 2)) {
			oContext.setSelected(true);
		}

		assert.throws(
			() => { this.oSelectionPlugin.setEnabled(true); },
			new Error("Multiple contexts selected")
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

	QUnit.test("#getSelectedContext", function(assert) {
		const aRows = this.oTable.getRows();
		let oSelectedContext;

		assert.strictEqual(this.oSelectionPlugin.getSelectedContext(), undefined, "No context selected");

		aRows[1].getBindingContext().setSelected(true);
		oSelectedContext = this.oSelectionPlugin.getSelectedContext();
		assert.ok(oSelectedContext, "1 context selected");
		assert.strictEqual(oSelectedContext.getPath(), "/Products(1)", "Path of the selected context");

		this.oSelectionPlugin.setEnabled(false);
		assert.strictEqual(this.oSelectionPlugin.getSelectedContext(), undefined, "Plugin disabled: No context selected");

		this.oSelectionPlugin.setEnabled(true);
		oSelectedContext = this.oSelectionPlugin.getSelectedContext();
		assert.ok(oSelectedContext, "Plugin enabled: 1 context selected");
		assert.strictEqual(oSelectedContext.getPath(), "/Products(1)", "Plugin enabled: Path of the selected context");

		aRows[1].getBindingContext().setSelected(false);
		assert.strictEqual(this.oSelectionPlugin.getSelectedContext(), undefined, "Context deselected: No context selected");
	});

	QUnit.test("#getSelectedContexts", function(assert) {
		const aRows = this.oTable.getRows();
		let aSelectedContexts;

		assert.strictEqual(this.oSelectionPlugin.getSelectedContexts().length, 0, "No context selected");

		aRows[1].getBindingContext().setSelected(true);
		aSelectedContexts = this.oSelectionPlugin.getSelectedContexts();
		assert.strictEqual(aSelectedContexts.length, 1, "1 context selected");
		assert.strictEqual(aSelectedContexts[0].getPath(), "/Products(1)", "Path of the selected context");

		this.oSelectionPlugin.setEnabled(false);
		assert.strictEqual(this.oSelectionPlugin.getSelectedContexts().length, 0, "Plugin disabled");
		assert.ok(aSelectedContexts.every((oContext) => oContext.isSelected()), "Plugin disabled: Context is still selected");

		this.oSelectionPlugin.setEnabled(true);
		aSelectedContexts = this.oSelectionPlugin.getSelectedContexts();
		assert.strictEqual(aSelectedContexts.length, 1, "Plugin enabled: 1 context selected");
		assert.strictEqual(aSelectedContexts[0].getPath(), "/Products(1)", "Plugin enabled: Path of the selected context");

		aRows[1].getBindingContext().setSelected(false);
		assert.strictEqual(this.oSelectionPlugin.getSelectedContexts().length, 0, "Context deselected: No context selected");
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

	QUnit.test("#setSelected", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Row 1, true): selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), true, "Context#isSelected (Row 1)");
		assert.equal(aRows[1].getBindingContext().isSelected(), false, "Context#isSelected (Row 2)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "#setSelected (Row 1, true): selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), true, "Context#isSelected (Row 1)");
		assert.equal(aRows[1].getBindingContext().isSelected(), false, "Context#isSelected (Row 2)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[1], false);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "#setSelected (Row 2, false): selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), true, "Context#isSelected (Row 1)");
		assert.equal(aRows[1].getBindingContext().isSelected(), false, "Context#isSelected (Row 2)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[1], true);
		this.oSelectionPlugin.setSelected(aRows[2], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Row 2, true; Row 3, true): selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), false, "Context#isSelected (Row 1)");
		assert.equal(aRows[1].getBindingContext().isSelected(), false, "Context#isSelected (Row 2)");
		assert.equal(aRows[2].getBindingContext().isSelected(), true, "Context#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[2], false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Row 3, false): selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), false, "Context#isSelected (Row 1)");
		assert.equal(aRows[1].getBindingContext().isSelected(), false, "Context#isSelected (Row 2)");
		assert.equal(aRows[2].getBindingContext().isSelected(), false, "Context#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "No context selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[1], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Row 2, true): selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), false, "Context#isSelected (Row 1)");
		assert.equal(aRows[1].getBindingContext().isSelected(), true, "Context#isSelected (Row 2)");
		assert.equal(aRows[2].getBindingContext().isSelected(), false, "Context#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[3], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (range to row 4): selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), false, "Context#isSelected (Row 1)");
		assert.equal(aRows[1].getBindingContext().isSelected(), false, "Context#isSelected (Row 2)");
		assert.equal(aRows[2].getBindingContext().isSelected(), false, "Context#isSelected (Row 3)");
		assert.equal(aRows[3].getBindingContext().isSelected(), true, "Context#isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 contexts is selected");
	});

	QUnit.test("#setSelected; Hierarchy", async function(assert) {
		this.oTable.destroy();
		this.stub(ODataV4SingleSelection.prototype, "getSelectedCount").returns(0);
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForHierarchy(), (oTable) => {
			oTable.getBinding().resume();
			ODataV4SingleSelection.prototype.getSelectedCount.restore();
		});
		this.oSelectionPlugin = this.oTable.getDependents()[0];
		this.oSelectionChangeHandler = this.spy();
		this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
		await this.oTable.qunit.whenRenderingFinished();

		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Node): selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), true, "Context#isSelected (Node)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[4], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Leaf): selectionChange event");
		assert.equal(aRows[4].getBindingContext().isSelected(), true, "Context#isSelected (Leaf)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");
	});

	QUnit.test("#setSelected; Data Aggregation", async function(assert) {
		this.oTable.destroy();
		this.stub(ODataV4SingleSelection.prototype, "getSelectedCount").returns(0);
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForDataAggregation(), (oTable) => {
			oTable.getBinding().resume();
			ODataV4SingleSelection.prototype.getSelectedCount.restore();
		});
		this.oSelectionPlugin = this.oTable.getDependents()[0];
		this.oSelectionChangeHandler = this.spy();
		this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
		await this.oTable.qunit.whenRenderingFinished();

		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "#setSelected (Sum): selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), false, "Context#isSelected (Sum)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "No context selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[1], true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "#setSelected (Group Header): selectionChange event");
		assert.equal(aRows[1].getBindingContext().isSelected(), false, "Context#isSelected (Group Header)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "No context selected");

		await TableQUnitUtils.expandAndScrollTableWithDataAggregation(this.oTable);

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[2], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Leaf): selectionChange event");
		assert.equal(aRows[2].getBindingContext().isSelected(), true, "Context#isSelected (Leaf)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");
	});

	QUnit.test("#clearSelection", async function(assert) {
		const aRows = this.oTable.getRows();
		const oHeaderContextSetSelected = this.spy(this.oTable.getBinding().getHeaderContext(), "setSelected");

		aRows[1].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.clearSelection();
		assert.ok(oHeaderContextSetSelected.calledOnceWithExactly(false), "HeaderContext#setSelected call");
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");

		aRows[1].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		oHeaderContextSetSelected.resetHistory();
		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(false);
		this.oSelectionPlugin.clearSelection();
		assert.ok(oHeaderContextSetSelected.notCalled, "Plugin disabled: HeaderContext#setSelected call");
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin disabled: selectionChange event");
		assert.ok(aRows[1].getBindingContext().isSelected(), "Plugin disabled: Context selected state");
	});

	QUnit.test("#clearSelection with unresolved binding", function(assert) {
		this.oTable.bindRows("MyRelativePath");
		// An unresolved binding has no contexts, so there is nothing to deselect. We just check that no error is thrown.
		this.oSelectionPlugin.clearSelection();
		assert.notOk(this.oTable.getBinding().getHeaderContext(), "Header context");
	});

	QUnit.test("#onHeaderSelectorPress", async function(assert) {
		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.wait(200);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");
	});

	QUnit.test("#onKeyboardShortcut", async function(assert) {
		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");
		const oEvent = new jQuery.Event();

		this.spy(oEvent, "setMarked");
		this.oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.wait(200);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Toggle selection: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Toggle selection: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
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
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		assert.throws(
			() => { aRows[1].getBindingContext().setSelected(true); },
			new Error("Multiple contexts selected"),
			"Selecting a second context throws an error"
		);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Selected contexts");
	});

	QUnit.test("Context#setSelected; Hierarchy", async function(assert) {
		this.oTable.destroy();
		this.stub(ODataV4SingleSelection.prototype, "getSelectedCount").returns(0);
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForHierarchy(), (oTable) => {
			oTable.getBinding().resume();
			ODataV4SingleSelection.prototype.getSelectedCount.restore();
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
		this.stub(ODataV4SingleSelection.prototype, "getSelectedCount").returns(0);
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForDataAggregation(), (oTable) => {
			oTable.getBinding().resume();
			ODataV4SingleSelection.prototype.getSelectedCount.restore();
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