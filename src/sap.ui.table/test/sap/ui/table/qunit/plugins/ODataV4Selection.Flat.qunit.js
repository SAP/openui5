/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV4",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/plugins/ODataV4Selection",
	"sap/ui/model/Filter",
	"sap/ui/core/IconPool",
	"sap/ui/thirdparty/jquery"
], function(
	TableQUnitUtils,
	TableUtils,
	ODataV4Selection,
	Filter,
	IconPool,
	jQuery
) {
	"use strict";

	TableQUnitUtils.setDefaultSettings({
		dependents: [new ODataV4Selection({enableNotification: true})],
		rows: {
			path: "/Products",
			parameters: {
				$count: true
			}
		},
		columns: TableQUnitUtils.createTextColumn({text: "Name", bind: true}),
		models: TableQUnitUtils.createModelForListDataService()
	});

	QUnit.module("Basic checks", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable();
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Lifecycle", function(assert) {
		this.oTable.removeDependent(this.oSelectionPlugin);

		const oActivateSpy = this.spy(this.oSelectionPlugin, "onActivate");
		this.oTable.addDependent(this.oSelectionPlugin);
		assert.ok(oActivateSpy.calledOnce, "The selection plugin is activated");
		assert.strictEqual(this.oTable.getSelectionMode(), "MultiToggle", "Selection mode of the table after activating the plugin");

		this.oSelectionPlugin.onDeactivate(this.oTable);
		assert.strictEqual(this.oTable.getSelectionMode(), "None", "Selection mode of the table after deactivating the plugin");

		const oNewSelectionPlugin = new ODataV4Selection({selectionMode: "Single", limit: 0});
		this.oSelectionPlugin.destroy();
		this.oTable.addDependent(oNewSelectionPlugin);
		assert.strictEqual(this.oTable.getSelectionMode(), "Single", "Selection mode of the table after replacing the selection plugin");
	});

	QUnit.test("Enable/Disable", function(assert) {
		const oActivateSpy = this.spy(this.oSelectionPlugin, "activate");
		const oDeactivateSpy = this.spy(this.oSelectionPlugin, "deactivate");

		this.oTable.getRows()[0].getBindingContext().setSelected(true);
		this.oSelectionPlugin.setEnabled(false);
		assert.ok(!this.oSelectionPlugin.getEnabled(), "Plugin is disabled");
		assert.ok(oDeactivateSpy.calledOnce, "#deactivate call");
		assert.strictEqual(this.oTable.getSelectionMode(), "None", "Table selection mode");
		assert.ok(this.oTable.getRows()[0].getBindingContext().isSelected(), "Context selected state");

		this.oSelectionPlugin.setEnabled(true);
		assert.ok(this.oSelectionPlugin.getEnabled(), "Plugin is enabled");
		assert.ok(oActivateSpy.calledOnce, "#deactivate call");
		assert.strictEqual(this.oTable.getSelectionMode(), "MultiToggle", "Table selection mode");
	});

	QUnit.test("Render config", function(assert) {
		let oHeaderSelector = this.oSelectionPlugin.getRenderConfig().headerSelector;

		assert.strictEqual(oHeaderSelector.type, "custom");
		assert.strictEqual(oHeaderSelector.visible, true);

		this.oSelectionPlugin.setLimit(0);
		oHeaderSelector = this.oSelectionPlugin.getRenderConfig().headerSelector;
		assert.strictEqual(oHeaderSelector.type, "toggle");
		assert.strictEqual(oHeaderSelector.visible, true);

		this.oSelectionPlugin.setSelectionMode("Single");
		oHeaderSelector = this.oSelectionPlugin.getRenderConfig().headerSelector;
		assert.strictEqual(oHeaderSelector.visible, false);
	});

	QUnit.test("Change selection mode", function(assert) {
		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");

		this.oSelectionPlugin.setSelectionMode("Single");
		assert.strictEqual(this.oTable.getSelectionMode(), "Single", "Selection mode of the table is updated");
		assert.equal(oClearSelection.callCount, 1, "#clearSelection call");
	});

	QUnit.module("Change binding or model instance", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable();
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Apply plugin after setting unsupported model", function(assert) {
		const oModel = this.oTable.getModel();
		const oModelIsAStub = this.stub(oModel, "isA");

		oModelIsAStub.withArgs("sap.ui.model.odata.v4.ODataModel").returns(false);
		this.oSelectionPlugin.destroy();
		this.oSelectionPlugin = new ODataV4Selection();
		assert.throws(() => {
			this.oTable.addDependent(this.oSelectionPlugin);
		},
			new Error("This plugin only works with a sap.ui.model.odata.v4.ODataModel."),
			"Error thrown when applying plugin to table with unsupported model"
		);
	});

	QUnit.test("Change to unsupported model", function(assert) {
		const oModel = this.oTable.getModel();
		const oModelIsAStub = this.stub(oModel, "isA");

		oModelIsAStub.withArgs("sap.ui.model.odata.v4.ODataModel").returns(false);
		this.oTable.setModel();
		assert.throws(() => {
			this.oTable.setModel(oModel);
		},
			new Error("This plugin only works with a sap.ui.model.odata.v4.ODataModel."),
			"Error thrown when changing model to unsupported model"
		);
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
		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");
		const oFireSelectionChange = this.spy(this.oSelectionPlugin, "fireSelectionChange");

		this.oTable.unbindRows();
		await this.oTable.qunit.whenRenderingFinished();

		oClearSelection.resetHistory();
		oFireSelectionChange.resetHistory();
		this.oTable.bindRows("/Products");
		await this.oTable.qunit.whenRenderingFinished();

		assert.equal(oClearSelection.callCount, 0, "#clearSelection call");
		assert.equal(oFireSelectionChange.callCount, 0, "fireSelectionChange call");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");
	});

	QUnit.test("Bind when disabled", async function(assert) {
		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");
		const oFireSelectionChange = this.spy(this.oSelectionPlugin, "fireSelectionChange");

		this.oTable.unbindRows();
		this.oSelectionPlugin.setEnabled(false);
		await this.oTable.qunit.whenRenderingFinished();

		oClearSelection.resetHistory();
		oFireSelectionChange.resetHistory();
		this.oTable.bindRows("/Products");
		await this.oTable.qunit.whenRenderingFinished();
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

	QUnit.test("Bind in selectionMode='Single' with relative binding", function(assert) {
		this.oSelectionPlugin.setSelectionMode("Single");
		this.oTable.bindRows("MyRelativePath");
		assert.ok(this.oSelectionPlugin.isActive(), "Active state");
		assert.notOk(this.oTable.getBinding().getHeaderContext(), "Header context");
	});

	QUnit.module("Selection API", {
		before: function() {
			this.oShowNotification = sinon.spy(TableUtils, "showNotificationPopoverAtIndex");
		},
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable();
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

		const aSelectedContexts = this.oSelectionPlugin.getSelectedContexts();

		assert.strictEqual(aSelectedContexts.length, 4, "4 contexts selected");
		assert.strictEqual(aSelectedContexts[0].getPath(), "/Products(1)", "Path of 1st selected context");
		assert.strictEqual(aSelectedContexts[1].getPath(), "/Products(2)", "Path of 2nd selected context");
		assert.strictEqual(aSelectedContexts[2].getPath(), "/Products(4)", "Path of 3rd selected context");
		assert.strictEqual(aSelectedContexts[3].getPath(), "/Products(10)", "Path of 4th selected context");

		this.oSelectionPlugin.setEnabled(false);
		assert.strictEqual(this.oSelectionPlugin.getSelectedContexts().length, 0, "Plugin disabled");
		assert.ok(aSelectedContexts.every((oContext) => oContext.isSelected()), "Plugin disabled: Contexts are still selected");
	});

	QUnit.test("#getSelectedCount", function(assert) {
		const aRows = this.oTable.getRows();

		aRows[1].getBindingContext().setSelected(true);
		aRows[2].getBindingContext().setSelected(true);
		aRows[4].getBindingContext().setSelected(true);
		this.oTable.getContextByIndex(aRows.length).setSelected(true);

		assert.strictEqual(this.oSelectionPlugin.getSelectedCount(), 4);

		this.oSelectionPlugin.setEnabled(false);
		assert.strictEqual(this.oSelectionPlugin.getSelectedCount(), 0, "Plugin disabled");
	});

	QUnit.test("#isSelected", function(assert) {
		const aRows = this.oTable.getRows();

		aRows[1].getBindingContext().setSelected(true);
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), true, "#isSelected (Row 2)");

		this.oSelectionPlugin.setEnabled(false);
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "Plugin disabled: #isSelected (Row 2)");
	});

	QUnit.test("#setSelected", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Row 1, true): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");
		assert.ok(aRows[0].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[0], "Selected context is related to correct row");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "#setSelected (Row 1, true): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");

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
		assert.ok(aRows[0].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[0],
			"First selected context is related to correct row");
		assert.ok(aRows[2].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[1],
			"Second selected context is related to correct row");

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

	QUnit.test("#setSelected in selection mode 'Single'", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelectionMode("Single");
		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Row 1, true): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");
		assert.ok(aRows[0].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[0], "Selected context is related to correct row");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[1], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "#setSelected (Row 2, true): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), true, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 context is selected");
		assert.ok(aRows[1].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[0], "Selected context is related to correct row");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setSelected(aRows[3], true, {range: true});
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "#setSelected (range to row 4): selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), true, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), false, "#isSelected (Row 3)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[3]), false, "#isSelected (Row 4)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "1 contexts is selected");
		assert.ok(aRows[1].getBindingContext() === this.oSelectionPlugin.getSelectedContexts()[0], "Selected context is related to correct row");
	});

	QUnit.test("#setSelected; Scroll down and select range", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelected(aRows[0], true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Selected first row");

		this.oSelectionChangeHandler.resetHistory();
		this.oTable.setFirstVisibleRow(95);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(aRows[5], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 101, "Selected contexts after scrolling down and selecting a range");
		assert.ok(this.oShowNotification.notCalled, "Limit notification not shown");
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
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

		aRows[1].getBindingContext().setSelected(true);
		aRows[2].getBindingContext().setSelected(true);
		aRows[4].getBindingContext().setSelected(true);
		this.oTable.getContextByIndex(aRows.length).setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.clearSelection();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");

		this.oTable.getBinding().getHeaderContext().setSelected(true);
		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.clearSelection();
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Header context was selected: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Header context was selected: Selected contexts");
		assert.ok(this.oTable.getBinding().getHeaderContext().isSelected(), "Header context was selected: Header context selected state");

		aRows[1].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(false);
		this.oSelectionPlugin.clearSelection();
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin disabled: selectionChange event");
		assert.ok(aRows[1].getBindingContext().isSelected(), "Plugin disabled: Context selected state");
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

	QUnit.test("#onHeaderSelectorPress in selection mode 'Single'", async function(assert) {
		this.oSelectionPlugin.onHeaderSelectorPress();
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");
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

	QUnit.test("#onKeyboardShortcut in selection mode 'Single'", async function(assert) {
		const oClearSelection = this.spy(this.oSelectionPlugin, "clearSelection");
		const oEvent = new jQuery.Event();

		this.spy(oEvent, "setMarked");
		this.oSelectionPlugin.setSelectionMode("Single");

		this.oSelectionPlugin.onKeyboardShortcut("toggle", oEvent);
		await TableQUnitUtils.wait(500);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Toggle selection: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Toggle selection: Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		oClearSelection.resetHistory();
		oEvent.setMarked.resetHistory();
		this.oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		this.oSelectionPlugin.onKeyboardShortcut("clear", oEvent);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "Clear selection: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Clear selection: Selected contexts");
		assert.equal(oClearSelection.callCount, 1, "Clear selection: #clearSelection call");
		assert.ok(oEvent.setMarked.calledWithExactly("sapUiTableClearAll"), "Clear selection: Event mark 'sapUiTableClearAll'");
	});

	QUnit.module("Binding selection API", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable();
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

	QUnit.test("Context#setSelected in selection mode 'Single'", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oSelectionPlugin.setSelectionMode("Single");

		aRows[0].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), true, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		aRows[1].getBindingContext().setSelected(true);
		aRows[2].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), false, "#isSelected (Row 2)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[2]), true, "#isSelected (Row 3)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 1, "Selected contexts");
	});

	QUnit.test("HeaderContext#setSelected", async function(assert) {
		const oHeaderContext = this.oTable.getBinding().getHeaderContext();

		oHeaderContext.setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.ok(this.oTable.getRows().every((oRow) => {
			return this.oSelectionPlugin.isSelected(oRow);
		}), "Every row is selected");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, this.oTable.getBinding().getAllCurrentContexts().length,
			"Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		oHeaderContext.setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.ok(this.oTable.getRows().every((oRow) => {
			return !this.oSelectionPlugin.isSelected(oRow);
		}), "No row is selected");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(false);
		oHeaderContext.setSelected(true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin disabled: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Plugin disabled: Selected contexts");
		assert.equal(oHeaderContext.isSelected(), true, "Plugin disabled: HeaderContext selected state");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin enabled: selectionChange event");
		assert.equal(oHeaderContext.isSelected(), true, "Plugin enabled: HeaderContext selected state");
	});

	QUnit.test("HeaderContext#setSelected(true) -> Context#setSelected(false)", async function(assert) {
		const aRows = this.oTable.getRows();

		this.oTable.getBinding().getHeaderContext().setSelected(true);
		aRows[0].getBindingContext().setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[0]), false, "#isSelected (Row 1)");
		assert.strictEqual(this.oSelectionPlugin.isSelected(aRows[1]), true, "#isSelected (Row 2)");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, this.oTable.getBinding().getAllCurrentContexts().length - 1,
			"Selected contexts");
	});

	QUnit.test("HeaderContext#setSelected in selection mode 'Single'", async function(assert) {
		const oHeaderContext = this.oTable.getBinding().getHeaderContext();

		this.oSelectionPlugin.setSelectionMode("Single");
		oHeaderContext.setSelected(true);
		await TableQUnitUtils.wait(10);
		assert.equal(oHeaderContext.isSelected(), false, "HeaderContext selected state");
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");

		this.oTable.getRows()[0].getBindingContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oSelectionChangeHandler.resetHistory();
		oHeaderContext.setSelected(false);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		assert.equal(this.oSelectionChangeHandler.callCount, 1, "selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Selected contexts");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(false);
		oHeaderContext.setSelected(true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin disabled: selectionChange event");
		assert.equal(this.oSelectionPlugin.getSelectedContexts().length, 0, "Plugin disabled: Selected contexts");
		assert.equal(oHeaderContext.isSelected(), true, "Plugin disabled: HeaderContext selected state");

		this.oSelectionChangeHandler.resetHistory();
		this.oSelectionPlugin.setEnabled(true);
		await TableQUnitUtils.wait(10);
		assert.equal(this.oSelectionChangeHandler.callCount, 0, "Plugin enabled: selectionChange event");
		assert.equal(oHeaderContext.isSelected(), false, "Plugin enabled: HeaderContext selected state");
	});

	QUnit.module("Header selector icon", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable();
			this.oSelectionPlugin = this.oTable.getDependents()[0];
			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
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
		this.oSelectionPlugin.setSelected(this.oTable.getRows()[0], true);
		this.oTable.setFirstVisibleRow(400);
		await this.oTable.qunit.whenBindingChange();
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(this.oTable.getRows()[9], true, {range: true});
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);
		this.oTable.setFirstVisibleRow(400);
		await this.oTable.qunit.whenRenderingFinished();
		this.oSelectionPlugin.setSelected(this.oTable.getRows()[9], true, {range: true});
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

	QUnit.test("Selecting the HeaderContext", async function(assert) {
		this.oTable.getBinding().getHeaderContext().setSelected(true);
		await TableQUnitUtils.nextEvent("selectionChange", this.oSelectionPlugin);

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
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
		this.oSelectionPlugin = new ODataV4Selection();
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
		this.oSelectionPlugin = new ODataV4Selection();
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
		this.oTable.setModel(TableQUnitUtils.createModelForListDataService({
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
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL"),
			disabled: true
		});

		this.oTable.getBinding().filter();
		await this.oTable.qunit.whenRenderingFinished();

		this.assertHeaderSelector({
			src: IconPool.getIconURI(TableUtils.ThemeParameters.clearSelectionIcon),
			title: TableUtils.getResourceText("TBL_DESELECT_ALL")
		});
	});

	QUnit.test("Filter with $$clearSelectionOnFilter=true", async function(assert) {
		this.oTable.setModel(TableQUnitUtils.createModelForListDataService({
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
});