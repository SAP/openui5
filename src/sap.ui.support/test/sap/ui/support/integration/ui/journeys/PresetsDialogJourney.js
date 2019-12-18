/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/thirdparty/sinon",
	"sap/ui/core/library",
	"sap/ui/support/integration/ui/data/presetUtil"
], function(opaTest, sinon, library, presetUtil) {
	"use strict";

	var testPresetHana = presetUtil.loadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_S4HANA);
	var testPresetExample = presetUtil.loadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_1);

	QUnit.module("Support Assistant Rule Presets - Dialog");

	opaTest("Should see the Rule Presets variant select", function (Given, When, Then) {
		Given.iDeletePersistedData()
			.and.iStartMyApp();

		Then.onThePresetsPage.iShouldSeePresetsVariantSelect();

	});

	opaTest("Should be able to open and close Rule Presets popover", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetsPopover();

		When.onThePresetsPage.iClosePresetsPopover();

		Then.onThePresetsPage.iShouldNotSeePresetsPopover();

	});

	opaTest("Should be able to see help icon", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeeHelpIcon();

	});

	opaTest("Should be able to see import dialog", function(Given, When, Then) {

		When.onThePresetsPage.iPressImport();

		Then.onThePresetsPage.iShouldSeeImportDialog();

		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iPressImportCancel();

	});

	opaTest("Should be able to import presets", function (Given, When, Then) {
		// this test imports 2 presets. they are used in the next steps to verify the navigation between presets
		When.onThePresetsPage.iOpenImportDialog();
		When.onThePresetsPage.iUploadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_1);
		When.onThePresetsPage.iPressImportFinalize();

		When.onThePresetsPage.iOpenImportDialog();
		When.onThePresetsPage.iUploadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_S4HANA);
		When.onThePresetsPage.iPressImportFinalize();
	});

	opaTest("Should be able to switch to My Selection", function(Given, When, Then) {
		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressPresetInPopover(presetUtil.titles.MY_SELECTION_TITLE);

		When.onThePresetsPage.iOpenPresetsPopover();
		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(presetUtil.titles.MY_SELECTION_TITLE);

		Then.onThePresetsPage.iShouldSeePresetInPopover(presetUtil.titles.MY_SELECTION_TITLE)
			.and.iShouldSeeSelectedPreset(presetUtil.titles.MY_SELECTION_TITLE);

		When.onThePresetsPage.iClosePresetsPopover();

	});

	opaTest("Should be able to switch presets and keep selection", function(Given, When, Then) {
		// change "My Selection" selected rules
		When.onTheRulesPage.iPressSelectCheckboxOf("Error logs",  "Rules selection was changed", "Could not change rules selection");

		// switch preset and check rules
		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressPresetInPopover(testPresetExample.title);
		Then.onThePresetsPage.iShouldSeeSelectedRules(testPresetExample._forTestRulesIds);

		// switch preset and check rules
		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressPresetInPopover(testPresetHana.title);
		Then.onThePresetsPage.iShouldSeeSelectedRules(testPresetHana._forTestRulesIds);

		// switch back to "My Selection" and check the rules
		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressPresetInPopover(presetUtil.titles.MY_SELECTION_TITLE);
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3); // Error logs - rule

	});

	opaTest("Should be able to change selection and see change in title", function(Given, When, Then) {
		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressPresetInPopover(testPresetHana.title);

		When.onTheRulesPage.iPressSelectCheckboxOf("Error logs",  "Rules selection was changed", "Could not change rules selection");

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPresetHana._forTestTitleIfModified);

		When.onThePresetsPage.iOpenPresetsPopover();
		Then.onThePresetsPage.iShouldSeePresetInPopover(testPresetHana._forTestTitleIfModified)
			.and.iShouldSeeSelectedPreset(testPresetHana._forTestTitleIfModified);

	});

	opaTest("Should be able to delete a preset and fallback to My Selection", function(Given, When, Then) {
		var presetsCountBeforeDelete = document.activeElement.contentDocument.getElementById("presetsSelect--select").getElementsByClassName("sapMCLI").length;

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressPresetInPopover(testPresetExample.title);

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressDeletePresetInPopover(testPresetExample.title);

		Then.onThePresetsPage.iShouldSeeNumberOfPresetsInPopover(presetsCountBeforeDelete - 1);
		Then.onThePresetsPage.iShouldSeeSelectedPreset(presetUtil.titles.MY_SELECTION_TITLE);

	});

	opaTest("Should be able to export My Selection", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressPresetInPopover(presetUtil.titles.MY_SELECTION_TITLE);

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressExport();

		Then.onThePresetsPage.iShouldSeeExportDialog()
			.and.iShouldSeeExportData("title", "My Selection")
			.and.iShouldSeeExportData("description", "My Current/Last Selection")
			.and.iShouldSeeExportData("presetId", "");

		When.onThePresetsPage.iEnterExportData("title", "Example title")
			.and.iEnterExportData("description", "Example description")
			.and.iEnterExportData("presetId", "");

		When.onThePresetsPage.iPressExportFinalize();

		Then.onThePresetsPage.iShouldReceiveOneExportFile()
			.and.iShouldReceiveCorrectExportFile({
				"id": sinon.match.truthy, // a generate id should appear in the file
				"title": "Example title",
				"description": "Example description"
			});

		Then.iTeardownSupportAssistantFrame();
	});

});