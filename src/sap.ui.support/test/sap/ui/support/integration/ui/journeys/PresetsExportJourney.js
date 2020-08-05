/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/thirdparty/sinon",
	"sap/ui/core/library",
	"../data/presetUtil",
	"../SupportAssistantOpaConfig"
], function(opaTest, sinon, library, presetUtil) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = library.ValueState;
	var testPresetExample = presetUtil.loadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_1);

	QUnit.module("Support Assistant Rule Presets - Export");

	opaTest("Should see validation messages when required inputs are not filled", function(Given, When, Then) {
		Given.iDeletePersistedData()
			.and.iStartMyApp();

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressExport();

		When.onThePresetsPage.iEnterExportData("title", "")
			.and.iEnterExportData("presetId", "")
			.and.iEnterExportData("description", "");
		When.onThePresetsPage.iPressExportFinalize();
		Then.onThePresetsPage.iShouldSeeExportDialog();
		Then.onThePresetsPage.iShouldSeeCorrectValueState("title", ValueState.Error)
			.and.iShouldSeeCorrectValueState("presetId", ValueState.None)
			.and.iShouldSeeCorrectValueState("description", ValueState.None);

	});

	opaTest("Should see validation messages when inputs with constraints have invalid values", function(Given, When, Then) {

		When.onThePresetsPage.iEnterExportData("title", "Title")
			.and.iEnterExportData("description", "Description")
			.and.iEnterExportData("presetId", "id+with+invalid+characters");

		When.onThePresetsPage.iPressExportFinalize();

		Then.onThePresetsPage.iShouldSeeExportDialog();

		Then.onThePresetsPage.iShouldSeeCorrectValueState("presetId", ValueState.Error)
			.and.iShouldSeeCorrectValueState("title", ValueState.None)
			.and.iShouldSeeCorrectValueState("description", ValueState.None);

	});

	opaTest("Should be able to export after inputs are filled with valid values", function(Given, When, Then) {

		When.onThePresetsPage.iEnterExportData("presetId", "valid_id");

		When.onThePresetsPage.iPressExportFinalize();

		Then.onThePresetsPage.iShouldReceiveOneExportFile()
			.and.iShouldReceiveCorrectExportFile({
				"id": "valid_id",
				"title": "Title",
				"description": "Description"
			});
	});

	opaTest("Should have a generated id if left empty on export", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressExport();

		When.onThePresetsPage.iEnterExportData("presetId", "");

		When.onThePresetsPage.iPressExportFinalize();

		Then.onThePresetsPage.iShouldReceiveOneExportFile()
			.and.iShouldReceiveCorrectExportFile({
				"id": sinon.match.truthy
			});
	});

	opaTest("Should be able to export example preset", function(Given, When, Then) {
		When.onThePresetsPage.iOpenImportDialog();
		When.onThePresetsPage.iUploadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_1);
		When.onThePresetsPage.iPressImportFinalize();

		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressPresetInPopover(testPresetExample.title);

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressExport();

		Then.onThePresetsPage.iShouldSeeExportDialog()
			.and.iShouldSeeExportData("title", testPresetExample.title)
			.and.iShouldSeeExportData("description", testPresetExample.description)
			.and.iShouldSeeExportData("presetId", testPresetExample.id);

		When.onThePresetsPage.iPressExportFinalize();

		Then.onThePresetsPage.iShouldReceiveOneExportFile();

		Then.onThePresetsPage.and.iShouldReceiveCorrectExportFile({
			"id": testPresetExample.id,
			"title": testPresetExample.title,
			"description": testPresetExample.description,
			"selections": testPresetExample.selections
		});

		Then.iTeardownSupportAssistantFrame();

	});

});
