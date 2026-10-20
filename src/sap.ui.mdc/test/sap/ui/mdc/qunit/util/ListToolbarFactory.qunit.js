/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/util/ListToolbarFactory",
	"sap/ui/mdc/util/ToolbarFactory",
	"sap/ui/mdc/enums/ListActionPosition"
], function(
	ListToolbarFactory,
	ToolbarFactory,
	ListActionPosition
) {
	"use strict";

	QUnit.module("Inheritance");

	QUnit.test("inherits the shared factories from ToolbarFactory", function(assert) {
		assert.strictEqual(ListToolbarFactory.createSettingsButton, ToolbarFactory.createSettingsButton, "createSettingsButton inherited");
		assert.strictEqual(ListToolbarFactory.createExportButton, ToolbarFactory.createExportButton, "createExportButton inherited");
	});

	QUnit.module("List action layout data");

	QUnit.test("settings button uses list ActionLayoutData with the list settings position", function(assert) {
		const oFakeList = {getId: () => "fakeList", isA: () => false};
		const oButton = ListToolbarFactory.createSettingsButton("myPrefix", [() => {}, oFakeList]);

		const oLayout = oButton.getLayoutData();
		assert.ok(oLayout.isA("sap.ui.mdc.list.ActionLayoutData"), "List ActionLayoutData is set as layoutData");
		assert.strictEqual(oLayout.getPosition(), ListActionPosition.PersonalizationActionsSettings, "Correct list action position");

		oButton.destroy();
	});

	QUnit.test("export button uses list ActionLayoutData with the list export position", function(assert) {
		const oFakeList = {getId: () => "fakeList"};
		const oMenuBtn = ListToolbarFactory.createExportButton("expPref", {
			"default": [() => {}, oFakeList],
			exportAs: [() => {}, oFakeList]
		});

		const oLayout = oMenuBtn.getLayoutData();
		assert.ok(oLayout.isA("sap.ui.mdc.list.ActionLayoutData"), "List ActionLayoutData is set as layoutData");
		assert.strictEqual(oLayout.getPosition(), ListActionPosition.ExportActionsExport, "Correct list action position");

		oMenuBtn.destroy();
	});
});
