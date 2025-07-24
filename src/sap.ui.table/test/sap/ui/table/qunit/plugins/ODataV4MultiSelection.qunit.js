/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/plugins/ODataV4MultiSelection",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/Filter",
	"sap/ui/core/IconPool",
	"sap/ui/thirdparty/jquery"
], function(
	TableQUnitUtils,
	ODataV4MultiSelection,
	TableUtils,
	Filter,
	IconPool,
	jQuery
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: [new ODataV4MultiSelection({enableNotification: true})]
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
		assert.ok(ODataV4MultiSelection.findOn(this.oTable) === this.oSelectionPlugin, "Plugin found");
	});

	QUnit.test("Lifecycle", function(assert) {
		this.oTable.removeDependent(this.oSelectionPlugin);

		const oActivateSpy = this.spy(this.oSelectionPlugin, "onActivate");
		this.oTable.addDependent(this.oSelectionPlugin);
		assert.ok(oActivateSpy.calledOnce, "The selection plugin is activated");
		assert.strictEqual(this.oTable.getSelectionMode(), "MultiToggle", "Selection mode of the table after activating the plugin");

		this.oSelectionPlugin.onDeactivate(this.oTable);
		assert.strictEqual(this.oTable.getSelectionMode(), "None", "Selection mode of the table after deactivating the plugin");

		const oNewSelectionPlugin = new ODataV4MultiSelection();
		this.oSelectionPlugin.destroy();
		this.oTable.addDependent(oNewSelectionPlugin);
		assert.strictEqual(this.oTable.getSelectionMode(), "MultiToggle", "Selection mode of the table after replacing the selection plugin");
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
		assert.strictEqual(this.oTable.getSelectionMode(), "MultiToggle", "Table selection mode");
		await TableQUnitUtils.wait(10);
		assert.equal(oFireSelectionChange.callCount, 0, "#fireSelectionChange call");
	});

	QUnit.test("Render config", function(assert) {
		let oHeaderSelector = this.oSelectionPlugin.getRenderConfig().headerSelector;

		assert.strictEqual(oHeaderSelector.type, "custom");
		assert.strictEqual(oHeaderSelector.visible, true);

		this.oSelectionPlugin.setLimit(0);
		oHeaderSelector = this.oSelectionPlugin.getRenderConfig().headerSelector;
		assert.strictEqual(oHeaderSelector.type, "toggle");
		assert.strictEqual(oHeaderSelector.visible, true);
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
		before: function() {
			this.oShowNotification = sinon.spy(TableUtils, "showNotificationPopoverAtIndex");
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList());
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			this.oSelectionChangeHandler = this.spy();
			this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
			this.oShowNotification.resetHistory();
		},
		after: function() {
			this.oShowNotification.restore();
		}
	});

	QUnit.test("#getSelectedContexts", function(assert) {
		const aRows = this.oTable.getRows();

		assert.strictEqual(this.oSelectionPlugin.getSelectedContexts().length, 0, "No contexts selected");

		aRows[1].getBindingContext().setSelected(true);
		aRows[2].getBindingContext().setSelected(true);
		aRows[4].getBindingContext().setSelected(true);
		this.oTable.getContextByIndex(aRows.length).setSelected(true);

		let aSelectedContexts = this.oSelectionPlugin.getSelectedContexts();

		assert.strictEqual(aSelectedContexts.length, 4, "4 contexts selected");
		assert.strictEqual(aSelectedContexts[0].getPath(), "/Products(1)", "Path of 1st selected context");
		assert.strictEqual(aSelectedContexts[1].getPath(), "/Products(2)", "Path of 2nd selected context");
		assert.strictEqual(aSelectedContexts[2].getPath(), "/Products(4)", "Path of 3rd selected context");
		assert.strictEqual(aSelectedContexts[3].getPath(), "/Products(10)", "Path of 4th selected context");

		this.oSelectionPlugin.setEnabled(false);
		assert.strictEqual(this.oSelectionPlugin.getSelectedContexts().length, 0, "Plugin disabled");
		assert.ok(aSelectedContexts.every((oContext) => oContext.isSelected()), "Plugin disabled: Contexts are still selected");

		this.oSelectionPlugin.setEnabled(true);
		aSelectedContexts = this.oSelectionPlugin.getSelectedContexts();
		assert.strictEqual(aSelectedContexts.length, 4, "Plugin enabled: Contexts are still selected");
		assert.strictEqual(aSelectedContexts[0].getPath(), "/Products(1)", "Path of 1st selected context");
		assert.strictEqual(aSelectedContexts[1].getPath(), "/Products(2)", "Path of 2nd selected context");
		assert.strictEqual(aSelectedContexts[2].getPath(), "/Products(4)", "Path of 3rd selected context");
		assert.strictEqual(aSelectedContexts[3].getPath(), "/Products(10)", "Path of 4th selected context");

		aRows[4].getBindingContext().setSelected(false);
		aSelectedContexts = this.oSelectionPlugin.getSelectedContexts();
		assert.strictEqual(aSelectedContexts.length, 3, "3 contexts selected");
		assert.strictEqual(aSelectedContexts[0].getPath(), "/Products(1)", "Path of 1st selected context");
		assert.strictEqual(aSelectedContexts[1].getPath(), "/Products(2)", "Path of 2nd selected context");
		assert.strictEqual(aSelectedContexts[2].getPath(), "/Products(10)", "Path of 3rd selected context");
	});

	QUnit.test("#getSelectedContexts cache", async function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList({
			tableSettings: {
				rows: {
					events: {
						change: () => {
							assert.strictEqual(this.oTable.getDependents()[0].getSelectedContexts().length, 0, "Binding change");
						}
					}
				}
			}
		}));
		this.oSelectionPlugin = this.oTable.getDependents()[0];
		await this.oTable.qunit.whenRenderingFinished();
		const oContext = this.oTable.getRows()[0].getBindingContext();

		oContext.setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.strictEqual(this.oSelectionPlugin.getSelectedContexts().length, 1);

		this.stub(oContext, "isSelected").returns(false);
		assert.strictEqual(this.oSelectionPlugin.getSelectedContexts().length, 1, "Context deselected");

		this.oTable.getBinding().refresh();
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
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "#setSelected (Row 1, true): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[2], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (range to row 3): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), true, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "#isSelected (Row 3)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), false, "#isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 3, "3 contexts selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[2], true, {range: true});
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "#setSelected (range to row 3): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), true, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "#isSelected (Row 3)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), false, "#isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 3, "3 contexts selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[1], false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Row 2, false): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "2 contexts selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[1], false);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "#setSelected (Row 2, false): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "2 contexts selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(false);
		this.oSelectionPlugin.setSelected(aRows[1], true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin disabled, #setSelected (Row 2, true): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "Plugin disabled, #setSelected (Row 2, true): #isSelected (Row 2)");
		assert.notOk(aRows[1].getBindingContext().isSelected(), "Plugin disabled: Context selected state");
	});

	QUnit.test("#setSelected; Hierarchy", async function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForHierarchy(), (oTable) => {
			oTable.getBinding().resume();
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
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[4], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Leaf): selectionChange event");
		assert.equal(aRows[4].getBindingContext().isSelected(), true, "Context#isSelected (Leaf)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "2 contexts selected");
	});

	QUnit.test("#setSelected; Data Aggregation", async function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForDataAggregation(), (oTable) => {
			oTable.getBinding().resume();
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
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context selected");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[3], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Leaf): selectionChange event");
		assert.equal(aRows[3].getBindingContext().isSelected(), true, "Context#isSelected (Leaf)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "2 context selected");
	});

	QUnit.test("#setSelected; Scroll down and select range", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Selected first row");

		this.oSelectionChangeHandler.resetHistory();
		this.oTable.setFirstVisibleRow(95);
		await this.oTable.qunit.whenRenderingFinished();
		this.stub(aRows[1].getBindingContext(), "getProperty").withArgs("@$ui5.node.isTotal").returns(true);
		this.stub(aRows[2].getBindingContext(), "getProperty").withArgs("@$ui5.node.isExpanded").returns(true);
		this.oSelectionPlugin.setSelected(aRows[5], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 99, "Selected contexts after scrolling down and selecting a range");
		assert.ok(this.oShowNotification.notCalled, "Limit notification not shown");
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.equal(aRows[1].getBindingContext().isSelected(), false, "Sum row not selected");
		assert.equal(aRows[2].getBindingContext().isSelected(), false, "Group header not selected");
	});

	QUnit.test("#setSelected; Scroll up and select range", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oTable.setFirstVisibleRow(95);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(aRows[5], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Scrolled down and selected a row");

		this.oSelectionChangeHandler.resetHistory();
		this.oTable.setFirstVisibleRow(50);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(aRows[0], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 51, "Selected contexts after scrolling up and selecting a range");
		assert.ok(this.oShowNotification.notCalled, "Limit notification not shown");
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");

		this.oSelectionChangeHandler.resetHistory();
		this.oShowNotification.resetHistory();
		this.oTable.setFirstVisibleRow(0);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(aRows[0], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 101, "Selected contexts after scrolling to the top and selecting a range");
		assert.ok(this.oShowNotification.notCalled, "Limit notification not shown");
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
	});

	QUnit.test("#setSelected; Scroll down, select range, and reach limit", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setLimit(100);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Selected first row");

		this.oSelectionChangeHandler.resetHistory();
		this.oTable.setFirstVisibleRow(200);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(aRows[5], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 101, "Selected contexts after scrolling down and selecting a range");
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.calledOnceWithExactly(this.oTable, 100, 100), "Limit notification shown at correct position");
		assert.equal(this.oTable.getFirstVisibleRow(), 92, "Scroll position");

		this.oSelectionChangeHandler.resetHistory();
		this.oShowNotification.resetHistory();
		this.oTable.setFirstVisibleRow(300);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(aRows[5], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 201, "Selected contexts after scrolling down and selecting a range");
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.calledOnceWithExactly(this.oTable, 200, 100), "Limit notification shown at correct position");
		assert.equal(this.oTable.getFirstVisibleRow(), 192, "Scroll position");
	});

	QUnit.test("#setSelected; Scroll up, select range, and reach limit", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setLimit(100);
		this.oTable.setFirstVisibleRow(300);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(aRows[5], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Scrolled down and selected a row");

		this.oSelectionChangeHandler.resetHistory();
		this.oTable.setFirstVisibleRow(0);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(aRows[0], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 101, "Selected contexts after scrolling up and selecting a range");
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.calledOnceWithExactly(this.oTable, 205, 100), "Limit notification shown at correct position");
		assert.equal(this.oTable.getFirstVisibleRow(), 204, "Scroll position");

		this.oSelectionChangeHandler.resetHistory();
		this.oShowNotification.resetHistory();
		this.oTable.setFirstVisibleRow(0);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(aRows[0], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 201, "Selected contexts after scrolling up and selecting a range");
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.calledOnceWithExactly(this.oTable, 105, 100), "Limit notification shown at correct position");
		assert.equal(this.oTable.getFirstVisibleRow(), 104, "Scroll position");
	});

	QUnit.test("#clearSelection", async function(assert) {
		const aRows = this.oTable.getRows();
		const oHeaderContextSetSelected = this.spy(this.oTable.getBinding().getHeaderContext(), "setSelected");

		aRows[1].getBindingContext().setSelected(true);
		aRows[2].getBindingContext().setSelected(true);
		aRows[4].getBindingContext().setSelected(true);
		this.oTable.getContextByIndex(aRows.length).setSelected(true);
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
		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");

		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Limit enabled, no contexts selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 200, "Limit enabled, no selection: Selected contexts");
		assert.equal(this.oSelectionPlugin.getSelectedContexts()[199].getPath(), "/Products(199)",
			"Limit enabled, no selection: Last selected context");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.calledOnceWithExactly(this.oTable, 199, 200),
			"Limit enabled, no contexts selected: Limit notification shown at correct position");
		assert.equal(this.oTable.getFirstVisibleRow(), 191, "Limit enabled, no contexts selected: Scroll position");

		this.oSelectionChangeHandler.resetHistory();
		this.oShowNotification.resetHistory();
		oClearSelection.resetHistory();
		this.oTable.setFirstVisibleRow(0);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Limit enabled, some contexts selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Limit enabled, some contexts selected: Selected contexts");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.notCalled, "Limit enabled, some contexts selected: Limit notification not shown");
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "Limit enabled, some contexts selected: Scroll position");
		assert.equal(oClearSelection.callCount, 1, "Limit enabled, some contexts selected: #clearSelection call");

		this.oSelectionChangeHandler.resetHistory();
		this.oShowNotification.resetHistory();
		this.oTable.setFirstVisibleRow(0);
		this.oSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Limit disabled, no selection: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, this.oTable.getBinding().getLength(),
			"Limit disabled, no selection: Selected contexts");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.notCalled, "Limit disabled, no selection: Limit notification not shown");
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "Limit disabled, no selection: Scroll position");

		this.oTable.getRows()[1].getBindingContext().setSelected(false);
		this.oTable.getRows()[2].getBindingContext().setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Limit disabled, some contexts selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, this.oTable.getBinding().getLength(),
			"Limit disabled, some contexts selected: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		oClearSelection.resetHistory();
		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Limit disabled, all contexts selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Limit disabled, all contexts selected: Selected contexts");
		assert.equal(oClearSelection.callCount, 1, "Limit disabled, all contexts selected: #clearSelection call");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(false);
		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin disabled: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Plugin disabled: Selected contexts");
		assert.ok(this.oTable.getBinding().getAllCurrentContexts().every((oContext) => !oContext.isSelected()),
			"Plugin disabled: Contexts are not selected");
	});

	QUnit.test("#onHeaderSelectorPress; Hierarchy", async function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForHierarchy(), (oTable) => {
			oTable.getBinding().resume();
		});
		this.oSelectionPlugin = this.oTable.getDependents()[0];
		this.oSelectionChangeHandler = this.spy();
		this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
		await this.oTable.qunit.whenRenderingFinished();

		this.oSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();

		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 10, "Selected contexts");

		await this.oTable.getRows()[2].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 10, "Selected contexts after expanding a node");
		assert.strictEqual(this.oSelectionPlugin.isSelected(this.oTable.getRows()[3]), false, "Selection state of the first child");
	});

	QUnit.test("#onHeaderSelectorPress; Data Aggregation", async function(assert) {
		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForDataAggregation(), (oTable) => {
			oTable.getBinding().resume();
		});
		this.oSelectionPlugin = this.oTable.getDependents()[0];
		this.oSelectionChangeHandler = this.spy();
		this.oSelectionPlugin.attachSelectionChange(this.oSelectionChangeHandler);
		await this.oTable.qunit.whenRenderingFinished();

		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "#onHeaderSelectorPress (No selection): selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "#onHeaderSelectorPress (No selection): Selected contexts");

		await TableQUnitUtils.expandAndScrollTableWithDataAggregation(this.oTable);
		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");
		assert.ok(aRows[2].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[0], "1st elected context is related to correct row");
		assert.ok(aRows[3].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[1], "2nd selected context is related to correct row");
	});

	QUnit.test("#onKeyboardShortcut", async function(assert) {
		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");
		const oEvent = new jQuery.Event();

		this.spy(oEvent, "setMarked");

		this.oSelectionPlugin.onKeyboardShortcut("clear", oEvent);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Clear selection, no selection: selectionChange event");
		assert.equal(oClearSelection.callCount, 1, "Clear selection, no selection: #clearSelection call");
		assert.ok(oEvent.setMarked.calledWithExactly("sapUiTableClearAll"), "Clear selection, no selection: Event mark 'sapUiTableClearAll'");

		this.oSelectionChangeHandler.resetHistory();
		oEvent.setMarked.resetHistory();
		this.oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Toggle selection, limit enabled, no selection: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 200, "Toggle selection, limit enabled, no selection: Selected contexts");
		assert.equal(this.oSelectionPlugin.getSelectedContexts()[199].getPath(), "/Products(199)",
			"Toggle selection, limit enabled, no selection: Last selected context");
		assert.notOk(oEvent.setMarked.calledWithExactly("sapUiTableClearAll"),
			"Toggle selection, limit enabled, no selection: Event mark 'sapUiTableClearAll'");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.calledOnceWithExactly(this.oTable, 199, 200),
			"Toggle selection, limit enabled, no selection: Limit notification shown at correct position");
		assert.equal(this.oTable.getFirstVisibleRow(), 191, "Toggle selection, limit enabled, no selection: Scroll position");

		this.oSelectionChangeHandler.resetHistory();
		this.oShowNotification.resetHistory();
		oEvent.setMarked.resetHistory();
		this.oTable.setFirstVisibleRow(0);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0,
			"Toggle selection, limit enabled, all contexts in limit selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 200,
			"Toggle selection, limit enabled, all contexts in limit selected: Selected contexts");
		assert.equal(this.oSelectionPlugin.getSelectedContexts()[199].getPath(), "/Products(199)",
			"Toggle selection, limit enabled, all contexts in limit selected: Last selected context");
		assert.notOk(oEvent.setMarked.calledWithExactly("sapUiTableClearAll"),
			"Toggle selection, limit enabled, all contexts in limit selected: Event mark 'sapUiTableClearAll'");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.calledOnceWithExactly(this.oTable, 199, 200),
			"Toggle selection, limit enabled, all contexts in limit selected: Limit notification not shown");
		assert.equal(this.oTable.getFirstVisibleRow(), 191, "Toggle selection, limit enabled, all contexts in limit selected: Scroll position");

		this.oShowNotification.resetHistory();
		oEvent.setMarked.resetHistory();
		this.oTable.setFirstVisibleRow(0);
		await this.oTable.qunit.whenRenderingFinished();
		this.oTable.getContextByIndex(200).setSelected(true);
		this.oSelectionPlugin.getSelectedContexts()[198].setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1,
			"Toggle selection, limit enabled, some contexts in limit selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 201,
			"Toggle selection, limit enabled, some contexts in limit selected: Selected contexts");
		assert.equal(this.oSelectionPlugin.getSelectedContexts()[198].getPath(), "/Products(198)",
			"Toggle selection, limit enabled, some contexts in limit selected: Selected context in limit");
		assert.notOk(oEvent.setMarked.calledWithExactly("sapUiTableClearAll"),
			"Toggle selection, limit enabled, some contexts in limit selected: Event mark 'sapUiTableClearAll'");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.calledOnceWithExactly(this.oTable, 199, 200),
			"Toggle selection, limit enabled, some contexts in limit selected: Limit notification not shown");
		assert.equal(this.oTable.getFirstVisibleRow(), 191, "Toggle selection, limit enabled, some contexts in limit selected: Scroll position");

		this.oSelectionChangeHandler.resetHistory();
		oClearSelection.resetHistory();
		oEvent.setMarked.resetHistory();
		this.oSelectionPlugin.onKeyboardShortcut("clear", oEvent);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Clear selection: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Clear selection: Selected contexts");
		assert.equal(oClearSelection.callCount, 1, "Clear selection: #clearSelection call");
		assert.ok(oEvent.setMarked.calledWithExactly("sapUiTableClearAll"), "Clear selection: Event mark 'sapUiTableClearAll'");

		this.oSelectionChangeHandler.resetHistory();
		this.oShowNotification.resetHistory();
		oEvent.setMarked.resetHistory();
		this.oTable.setFirstVisibleRow(0);
		this.oSelectionPlugin.setLimit(0);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Toggle selection, limit disabled, no selection: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, this.oTable.getBinding().getLength(),
			"Toggle selection, limit disabled, no selection: Selected contexts");
		assert.notOk(oEvent.setMarked.calledWithExactly("sapUiTableClearAll"),
			"Toggle selection, limit disabled, no selection: Event mark 'sapUiTableClearAll'");
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(this.oShowNotification.notCalled,
			"Toggle selection, limit disabled, no selection: Limit notification not shown");
		assert.equal(this.oTable.getFirstVisibleRow(), 0, "Toggle selection, limit disabled, no selection: Scroll position");

		this.oSelectionPlugin.getSelectedContexts()[1].setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oSelectionChangeHandler.resetHistory();
		oEvent.setMarked.resetHistory();
		this.oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Toggle selection, limit disabled, some contexts selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, this.oTable.getBinding().getLength(),
			"Toggle selection, limit disabled, some contexts selected: Selected contexts");
		assert.notOk(oEvent.setMarked.calledWithExactly("sapUiTableClearAll"),
			"Toggle selection, limit disabled, some contexts selected: Event mark 'sapUiTableClearAll'");

		this.oSelectionChangeHandler.resetHistory();
		oClearSelection.resetHistory();
		oEvent.setMarked.resetHistory();
		this.oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Toggle selection, limit disabled, all contexts selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0,
			"Toggle selection, limit disabled, all contexts selected: Selected contexts");
		assert.equal(oClearSelection.callCount, 1, "Toggle selection, limit disabled, all contexts selected: #clearSelection call");
		assert.ok(oEvent.setMarked.calledWithExactly("sapUiTableClearAll"),
			"Toggle selection, limit disabled, all contexts selected: Event mark 'sapUiTableClearAll'");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(false);
		this.oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin disabled: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Plugin disabled: Selected contexts");
		assert.ok(this.oTable.getBinding().getAllCurrentContexts().every((oContext) => !oContext.isSelected()),
			"Plugin disabled: Contexts are not selected");
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

	QUnit.test("Context#setSelected in visible area", async function(assert) {
		const aRows = this.oTable.getRows();

		aRows[1].getBindingContext().setSelected(true);
		aRows[3].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), true, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "#isSelected (Row 3)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), true, "#isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		aRows[1].getBindingContext().setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "#isSelected (Row 3)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), true, "#isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(false);
		aRows[0].getBindingContext().setSelected(true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin disabled: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Plugin disabled: Selected contexts");
	});

	QUnit.test("Context#setSelected outside visible area", async function(assert) {
		this.oTable.getBinding().getAllCurrentContexts()[10].setSelected(true);
		this.oTable.getBinding().getAllCurrentContexts()[11].setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.ok(this.oTable.getRows().every((oRow) => {
			return !this.oSelectionPlugin.isSelected(oRow);
		}), "No row is selected");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		this.oTable.getBinding().getAllCurrentContexts()[11].setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Selected contexts");
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
		aRows[4].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected: selectionChange event");
		assert.equal(aRows[0].getBindingContext().isSelected(), true, "Context#isSelected (Node)");
		assert.equal(aRows[4].getBindingContext().isSelected(), true, "Context#isSelected (Leaf)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 2, "2 contexts selected");
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

	QUnit.module("Header selector icon", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForList());
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		createTableWithHierarchy: async function() {
			this.oTable.destroy();
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForHierarchy(), (oTable) => {
				oTable.getBinding().resume();
			});
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			await this.oTable.qunit.whenRenderingFinished();
		},
		createTableWithDataAggregation: async function() {
			this.oTable.destroy();
			this.oTable = TableQUnitUtils.createTable(TableQUnitUtils.createSettingsForDataAggregation(), (oTable) => {
				oTable.getBinding().resume();
			});
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			await this.oTable.qunit.whenRenderingFinished();
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

	QUnit.test("Limit < Data length; No selection", function(assert) {
		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});
	});

	QUnit.test("Limit < Data length; Some contexts selected", async function(assert) {
		this.oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});

	QUnit.test("Limit < Data length; All contexts selected", async function(assert) {
		const aContexts = await TableUtils.loadContexts(this.oTable.getBinding(), 0, this.oTable.getBinding().getLength());

		aContexts.forEach((oContext) => {
			oContext.setSelected(true);
		});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});

	QUnit.test("Limit > Data length; No selection", async function(assert) {
		this.oSelectionPlugin.setLimit(401);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});
	});

	QUnit.test("Limit > Data length; Some contexts selected", async function(assert) {
		this.oSelectionPlugin.setLimit(401);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});

	QUnit.test("Limit > Data length; All contexts selected", async function(assert) {
		this.oSelectionPlugin.setLimit(401);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});

	QUnit.test("Unbind", async function(assert) {
		this.oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oTable.unbindRows();
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL"),
			disabled: true
		});
	});

	QUnit.test("Rebind", async function(assert) {
		this.oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oTable.bindRows("/Products");
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});
	});

	QUnit.test("Bind after applying plugin", async function(assert) {
		this.oTable.unbindRows();
		this.oSelectionPlugin.destroy();
		this.oSelectionPlugin = new ODataV4MultiSelection();
		this.oTable.addDependent(this.oSelectionPlugin);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL"),
			disabled: true
		});

		this.oTable.bindRows("/Products");

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL"),
			disabled: true
		});

		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});
	});

	QUnit.test("Bind before applying plugin", async function(assert) {
		this.oSelectionPlugin.destroy();
		this.oSelectionPlugin = new ODataV4MultiSelection();
		this.oTable.addDependent(this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});

		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});
	});

	QUnit.test("Filter with $$clearSelectionOnFilter=false", async function(assert) {
		this.oTable.setModel(TableQUnitUtils.createModelForList({
			modelParameters: {
				operationMode: "Server"
			}
		}));
		await this.oTable.qunit.whenRenderingFinished();

		this.oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oTable.getBinding().filter(new Filter("Name", "EQ", "DoesNotExist"));
		await this.oTable.qunit.whenRenderingFinished();
		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon), // An invisible context is selected
			title: TableUtils.getResourceText("TBL_DESELECT_ALL"),
			disabled: true
		});

		this.oTable.getBinding().filter(new Filter("Name", "EQ", "Test Product (1)"));
		await this.oTable.qunit.whenRenderingFinished();
		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.allSelectedIcon), // An invisible context is selected and the length is 1
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});

		this.oTable.getBinding().filter();
		await this.oTable.qunit.whenRenderingFinished();
		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});

	QUnit.test("Filter with $$clearSelectionOnFilter=true", async function(assert) {
		this.oTable.setModel(TableQUnitUtils.createModelForList({
			modelParameters: {
				operationMode: "Server"
			}
		}));
		this.oTable.bindRows({
			path: "/Products",
			parameters: {
				$$clearSelectionOnFilter: true
			}
		});
		await this.oTable.qunit.whenRenderingFinished();

		this.oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oTable.getBinding().filter(new Filter("Name", "EQ", "DoesNotExist"));
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL"),
			disabled: true
		});

		this.oTable.getBinding().filter();
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});
	});

	QUnit.test("Hierarchy; All Contexts selected", async function(assert) {
		await this.createTableWithHierarchy();

		const aContexts = await TableUtils.loadContexts(this.oTable.getBinding(), 0, this.oTable.getBinding().getLength());

		aContexts.forEach((oContext) => {
			oContext.setSelected(true);
		});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});

	QUnit.test("Hierarchy; Expand/Collapse", async function(assert) {
		await this.createTableWithHierarchy();

		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		await this.oTable.getRows()[2].getBindingContext().expand();
		await this.oTable.qunit.whenNextRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});

		this.oTable.getRows()[2].getBindingContext().collapse();
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});

	QUnit.test("Data Aggregation; All contexts selected", async function(assert) {
		await this.createTableWithDataAggregation();
		await TableQUnitUtils.expandAndScrollTableWithDataAggregation(this.oTable);

		(await TableUtils.loadContexts(this.oTable.getBinding(), 0, this.oTable.getBinding().getLength())).filter((oContext) => {
			const bIsLeaf = oContext.getProperty("@$ui5.node.isExpanded") === undefined;
			const bIsTotal = oContext.getProperty("@$ui5.node.isTotal");
			return bIsLeaf && !bIsTotal;
		}).forEach((oContext) => {
			oContext.setSelected(true);
		});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});

	QUnit.test("Data Aggregation; Visual grouping and sums", async function(assert) {
		await this.createTableWithDataAggregation();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});

		const aRows = this.oTable.getRows();

		await aRows[3].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
		this.oTable.setFirstVisibleRow(6);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		await aRows[4].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
		this.oTable.setFirstVisibleRow(9);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});

		await aRows[4].getBindingContext().expand();
		await this.oTable.qunit.whenRenderingFinished();
		this.oTable.setFirstVisibleRow(12);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.checkboxIcon),
			title: TableUtils.getResourceText("TBL_SELECT_ALL")
		});

		this.oSelectionPlugin.setSelected(aRows[2], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});

		this.oSelectionPlugin.setSelected(aRows[3], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});

		aRows[1].getBindingContext().collapse();
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});
});