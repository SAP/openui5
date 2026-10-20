/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/util/TableToolbarFactory",
	"sap/ui/mdc/util/ToolbarFactory",
	"sap/m/OverflowToolbarButton",
	"sap/ui/mdc/enums/TableActionPosition"
], function(
	TableToolbarFactory,
	ToolbarFactory,
	OverflowToolbarButton,
	TableActionPosition
) {
	"use strict";

	QUnit.module("Inheritance");

	QUnit.test("inherits the shared factories from ToolbarFactory", function(assert) {
		assert.strictEqual(TableToolbarFactory.getToolbarButtonType, ToolbarFactory.getToolbarButtonType, "getToolbarButtonType inherited");
		assert.strictEqual(TableToolbarFactory.createSettingsButton, ToolbarFactory.createSettingsButton, "createSettingsButton inherited");
		assert.strictEqual(TableToolbarFactory.createExportButton, ToolbarFactory.createExportButton, "createExportButton inherited");
	});

	QUnit.module("Shared buttons use table action layout data");

	QUnit.test("settings button is positioned via the table action position", function(assert) {
		const oFakeTable = {getId: () => "fakeTable", isA: () => false};
		const oButton = TableToolbarFactory.createSettingsButton("myPrefix", [() => {}, oFakeTable]);

		const oLayout = oButton.getLayoutData();
		assert.ok(oLayout.isA("sap.ui.mdc.table.ActionLayoutData"), "Table ActionLayoutData is set as layoutData");
		assert.strictEqual(oLayout.getPosition(), TableActionPosition.PersonalizationActionsSettings, "Correct action position");

		oButton.destroy();
	});

	QUnit.test("export button is positioned via the table action position", function(assert) {
		const oFakeTable = {getId: () => "fakeTable"};
		const oMenuBtn = TableToolbarFactory.createExportButton("expPref", {
			"default": [() => {}, oFakeTable],
			exportAs: [() => {}, oFakeTable]
		});

		const oLayout = oMenuBtn.getLayoutData();
		assert.ok(oLayout.isA("sap.ui.mdc.table.ActionLayoutData"), "Table ActionLayoutData is set as layoutData");
		assert.strictEqual(oLayout.getPosition(), TableActionPosition.ExportActionsExport, "Correct action position");

		oMenuBtn.destroy();
	});

	QUnit.module("Table-only factories");

	QUnit.test("createCopyButton delegates to CopyProvider with layoutData and id", function(assert) {
		const oReturnedButton = new OverflowToolbarButton();
		const oCopyProvider = {
			getCopyButton: this.stub().returns(oReturnedButton)
		};

		const oButton = TableToolbarFactory.createCopyButton("prefixX", oCopyProvider);

		assert.strictEqual(oButton, oReturnedButton, "Returns the button provided by the CopyProvider");
		assert.ok(oCopyProvider.getCopyButton.calledOnce, "getCopyButton was invoked exactly once");
		const mArgs = oCopyProvider.getCopyButton.firstCall.args[0];
		assert.strictEqual(mArgs.id, "prefixX-copy", "Passes correct id");
		assert.ok(mArgs.layoutData.isA("sap.ui.mdc.table.ActionLayoutData"), "Passes ActionLayoutData");
		assert.strictEqual(mArgs.layoutData.getPosition(), TableActionPosition.ModificationActionsCopy, "Correct action position");
		assert.ok("type" in mArgs, "Passes type binding from _getButtonSettings");

		oReturnedButton.destroy();
	});

	QUnit.test("createPasteButton creates a button with paste provider dependent", async function(assert) {
		const oButton = TableToolbarFactory.createPasteButton("prefY");

		assert.ok(oButton.isA("sap.m.OverflowToolbarButton"), "Returns an OverflowToolbarButton");
		assert.strictEqual(oButton.getId(), "prefY-paste", "Correct id");
		const oLayout = oButton.getLayoutData();
		assert.strictEqual(oLayout.getPosition(), TableActionPosition.ModificationActionsPaste, "Correct action position");

		await new Promise((resolve) => {
			sap.ui.require(["sap/m/plugins/PasteProvider"], resolve);
		});
		const aDependents = oButton.getDependents();
		assert.strictEqual(aDependents.length, 1, "One dependent added");
		assert.ok(aDependents[0].isA("sap.m.plugins.PasteProvider"), "Dependent is PasteProvider");
		assert.strictEqual(aDependents[0].getPasteFor(), "prefY-innerTable", "PasteProvider references the inner table");

		oButton.destroy();
	});

	QUnit.test("createExpandCollapseButton returns Expand variant when bIsExpand is true", function(assert) {
		const oButton = TableToolbarFactory.createExpandCollapseButton("expPref", true, () => {});

		assert.ok(oButton.isA("sap.m.OverflowToolbarButton"), "Returns an OverflowToolbarButton");
		assert.strictEqual(oButton.getId(), "expPref-expandAll", "Correct expand id");
		assert.strictEqual(oButton.getIcon(), "sap-icon://expand-all", "Correct expand icon");
		assert.strictEqual(oButton.getLayoutData().getPosition(), TableActionPosition.PersonalizationActionsExpandAll, "Correct expand position");

		oButton.destroy();
	});

	QUnit.test("createExpandCollapseButton returns Collapse variant when bIsExpand is false", function(assert) {
		const oButton = TableToolbarFactory.createExpandCollapseButton("colPref", false, () => {});

		assert.strictEqual(oButton.getId(), "colPref-collapseAll", "Correct collapse id");
		assert.strictEqual(oButton.getIcon(), "sap-icon://collapse-all", "Correct collapse icon");
		assert.strictEqual(oButton.getLayoutData().getPosition(), TableActionPosition.PersonalizationActionsCollapseAll,
			"Correct collapse position");

		oButton.destroy();
	});

	QUnit.test("createExpandCollapseMenuButton returns Expand variant with tree/node menu items", function(assert) {
		const oMenuBtn = TableToolbarFactory.createExpandCollapseMenuButton("expMenu", true, {
			tree: () => {},
			node: () => {}
		});

		assert.ok(oMenuBtn.isA("sap.m.OverflowToolbarMenuButton"), "Returns an OverflowToolbarMenuButton");
		assert.strictEqual(oMenuBtn.getId(), "expMenu-expandAll", "Correct expand id");
		assert.strictEqual(oMenuBtn.getIcon(), "sap-icon://expand-all", "Correct expand icon");
		assert.strictEqual(oMenuBtn.getMenu().getItems().length, 2, "Menu has two items");
		assert.strictEqual(oMenuBtn.getLayoutData().getPosition(), TableActionPosition.PersonalizationActionsExpandAll,
			"Correct expand position");

		oMenuBtn.destroy();
	});

	QUnit.test("createExpandCollapseMenuButton returns Collapse variant when bIsExpand is false", function(assert) {
		const oMenuBtn = TableToolbarFactory.createExpandCollapseMenuButton("colMenu", false, {
			tree: () => {},
			node: () => {}
		});

		assert.strictEqual(oMenuBtn.getId(), "colMenu-collapseAll", "Correct collapse id");
		assert.strictEqual(oMenuBtn.getIcon(), "sap-icon://collapse-all", "Correct collapse icon");
		assert.strictEqual(oMenuBtn.getLayoutData().getPosition(), TableActionPosition.PersonalizationActionsCollapseAll,
			"Correct collapse position");

		oMenuBtn.destroy();
	});

	QUnit.module("type binding");

	function assertTypeBinding(assert, oButton) {
		const oBindingInfo = oButton.getBindingInfo("type");
		assert.ok(oBindingInfo, "type is bound");
		assert.strictEqual(oBindingInfo.parts[0].model, "$sap.ui.mdc.ToolbarFactory", "type binds to the shared model");
		assert.strictEqual(oBindingInfo.parts[0].path, "/buttonType", "type binds to the button type path");
		assert.ok(oButton.getModel("$sap.ui.mdc.ToolbarFactory"), "shared model is set on the button");
	}

	QUnit.test("createExpandCollapseButton binds the type to the shared model", function(assert) {
		const oButton = TableToolbarFactory.createExpandCollapseButton("expPref", true, () => {});
		assertTypeBinding(assert, oButton);
		oButton.destroy();
	});

	QUnit.test("createExpandCollapseMenuButton binds the type to the shared model", function(assert) {
		const oMenuBtn = TableToolbarFactory.createExpandCollapseMenuButton("expMenu", true, {
			tree: () => {},
			node: () => {}
		});
		assertTypeBinding(assert, oMenuBtn);
		oMenuBtn.destroy();
	});
});
