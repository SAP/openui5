/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/util/ToolbarFactory",
	"sap/ui/core/theming/Parameters"
], function(
	ToolbarFactory,
	ThemeParameters
) {
	"use strict";

	QUnit.module("Factory methods");

	QUnit.test("getToolbarButtonType returns configured value or Ghost fallback", function(assert) {
		const oStub = this.stub(ThemeParameters, "get");
		oStub.withArgs({name: "_sap_ui_mdc_Table_OverflowButtonType"}).returns("Transparent");
		assert.strictEqual(ToolbarFactory.getToolbarButtonType(), "Transparent", "Returns theme-configured button type");

		oStub.withArgs({name: "_sap_ui_mdc_Table_OverflowButtonType"}).returns(undefined);
		assert.strictEqual(ToolbarFactory.getToolbarButtonType(), "Ghost", "Falls back to Ghost when theme parameter is undefined");
	});

	QUnit.test("createSettingsButton creates a configured OverflowToolbarButton", function(assert) {
		const oFakeTable = {getId: () => "fakeTable", isA: () => false};
		const oButton = ToolbarFactory.createSettingsButton("myPrefix", [() => {}, oFakeTable]);

		assert.ok(oButton.isA("sap.m.OverflowToolbarButton"), "Returns an OverflowToolbarButton");
		assert.strictEqual(oButton.getId(), "myPrefix-settings", "Correct id");
		assert.strictEqual(oButton.getIcon(), "sap-icon://action-settings", "Correct icon");
		assert.strictEqual(oButton.getAriaHasPopup(), "Dialog", "Correct aria-haspopup");
		assert.ok(oButton.getText().length > 0, "Text is resolved from resource bundle");
		assert.ok(oButton.getTooltip().length > 0, "Tooltip is resolved from resource bundle");

		oButton.destroy();
	});

	QUnit.test("createExportButton creates a split menu button with two menu items", function(assert) {
		const fnDefault = () => {};
		const fnExportAs = () => {};
		const oFakeTable = {getId: () => "fakeTable"};
		const oMenuBtn = ToolbarFactory.createExportButton("expPref", {
			"default": [fnDefault, oFakeTable],
			exportAs: [fnExportAs, oFakeTable]
		});

		assert.ok(oMenuBtn.isA("sap.m.OverflowToolbarMenuButton"), "Returns an OverflowToolbarMenuButton");
		assert.strictEqual(oMenuBtn.getId(), "expPref-export", "Correct id");
		assert.strictEqual(oMenuBtn.getIcon(), "sap-icon://excel-attachment", "Correct icon");
		assert.strictEqual(oMenuBtn.getButtonMode(), "Split", "Split button mode");
		assert.ok(oMenuBtn.getUseDefaultActionOnly(), "Uses default action only");
		const oMenu = oMenuBtn.getMenu();
		assert.ok(oMenu, "Menu is attached");
		assert.strictEqual(oMenu.getItems().length, 2, "Menu has two items");

		oMenuBtn.destroy();
	});

	QUnit.test("base factory does not decide the action layout data", function(assert) {
		assert.strictEqual(ToolbarFactory._getActionLayoutData("settings"), undefined,
			"_getActionLayoutData is an empty hook on the base factory");
	});

	QUnit.module("type binding");

	QUnit.test("shared factories bind the type to the shared toolbar factory model", function(assert) {
		const oFakeTable = {getId: () => "fakeTable", isA: () => false};
		const aButtons = [
			ToolbarFactory.createSettingsButton("s", [() => {}, oFakeTable]),
			ToolbarFactory.createExportButton("e", {
				"default": [() => {}, oFakeTable],
				exportAs: [() => {}, oFakeTable]
			})
		];

		for (const oButton of aButtons) {
			const oBindingInfo = oButton.getBindingInfo("type");
			assert.ok(oBindingInfo, oButton.getId() + ": type is bound");
			assert.strictEqual(oBindingInfo.parts[0].model, "$sap.ui.mdc.ToolbarFactory", oButton.getId() + ": type binds to the shared model");
			assert.strictEqual(oBindingInfo.parts[0].path, "/buttonType", oButton.getId() + ": type binds to the button type path");
			assert.ok(oButton.getModel("$sap.ui.mdc.ToolbarFactory"), oButton.getId() + ": shared model is set on the button");
			oButton.destroy();
		}
	});
});
