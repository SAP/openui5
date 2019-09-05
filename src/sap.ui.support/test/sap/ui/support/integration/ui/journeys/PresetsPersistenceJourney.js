/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/thirdparty/sinon",
	"sap/ui/core/library",
	"sap/ui/support/integration/ui/data/presetUtil"
], function(opaTest, sinon, library, presetUtil) {
	"use strict";

	var testPreset = presetUtil.loadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_1);
	var sModifiedTitle = presetUtil.getModifiedPresetTitle(presetUtil.titles.SYSTEM_ACCESSIBILITY_TITLE);

	QUnit.module("Support Assistant Rule Presets - Persistence");

	// /* Accessibility System Preset related tests */
	opaTest("Should be able to switch to 'Accessibility' Preset", function (Given, When, Then) {
		Given.iStartMyApp()
			.and.iDeletePersistedData();

		// allow persistance in local storage -- crucial to next steps in journey
		When.onTheRulesPage.iPressSettingsButton();
		When.onTheRulesPage.iPressDeleteButton();
		When.onTheRulesPage.iPressCheckBoxButton(true);

		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressPresetInPopover(presetUtil.titles.SYSTEM_ACCESSIBILITY_TITLE);
		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(presetUtil.titles.SYSTEM_ACCESSIBILITY_TITLE);

		Then.onThePresetsPage.iShouldSeePresetInPopover(presetUtil.titles.SYSTEM_ACCESSIBILITY_TITLE)
			.and.iShouldSeeSelectedPreset(presetUtil.titles.SYSTEM_ACCESSIBILITY_TITLE);

		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(presetUtil.titles.SYSTEM_ACCESSIBILITY_COUNT);
	});

	opaTest("Should be able to switch from 'Accessibility' preset and keep selections", function (Given, When, Then) {
		When.onTheRulesPage.iPressSelectCheckboxOf("Button: Consists of only an icon, needs a tooltip", "Rules selection was changed", "Could not change rules selection");

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressPresetInPopover(presetUtil.titles.MY_SELECTION_TITLE);

		// switch back to "Accessibility" and check the rules
		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressPresetInPopover(sModifiedTitle); //indirect check if title is visually modified
		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(presetUtil.titles.SYSTEM_ACCESSIBILITY_COUNT - 1);
	});

	opaTest("Should save persisted 'Accessibility' preset and selections", function (Given, When, Then) {
		When.onThePresetsPage.iOpenPresetsPopover();
		Then.onThePresetsPage.iShouldSeeSelectedPreset(sModifiedTitle);

		Then.iTeardownSupportAssistantFrame();
	});

	opaTest("Should load previously persisted 'Accessibility' preset and selections", function (Given, When, Then) {
		Given.iStartMyApp();

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(sModifiedTitle);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(sModifiedTitle)
			.and.iShouldSeeSelectedPreset(sModifiedTitle);
		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(presetUtil.titles.SYSTEM_ACCESSIBILITY_COUNT - 1);
	});

	opaTest("Should be able to undo changes in System Preset 'Accessibility' and see change in title", function(Given, When, Then) {
		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressUndoButton(sModifiedTitle);
		When.onThePresetsPage.iOpenPresetsPopover();
		Then.onThePresetsPage.iShouldSeePresetInPopover(presetUtil.titles.SYSTEM_ACCESSIBILITY_TITLE);

		Then.iTeardownSupportAssistantFrame();
	});

	opaTest("Should save persisted presets and selections", function (Given, When, Then) {
		Given.iStartMyApp();

		// setup one test preset
		When.onThePresetsPage.iOpenImportDialog();
		When.onThePresetsPage.iUploadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_1);
		When.onThePresetsPage.iPressImportFinalize();

		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressPresetInPopover(testPreset.title);

		When.onThePresetsPage.iOpenPresetsPopover();
		Then.onThePresetsPage.iShouldSeeSelectedPreset(testPreset.title);

		Then.iTeardownSupportAssistantFrame();

	});

	opaTest("Should load previously persisted presets and selections", function (Given, When, Then) {
		Given.iStartMyApp();

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPreset.title);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(presetUtil.titles.MY_SELECTION_TITLE)
			.and.iShouldSeePresetInPopover(testPreset.title)
			.and.iShouldSeeSelectedPreset(testPreset.title)
			.and.iShouldSeeSelectedRules(testPreset._forTestRulesIds);
	});

	opaTest("Should see 'System Presets' and 'Custom Presets' groups", function (Given, When, Then) {
		Then.onThePresetsPage.iShouldSeeGroupWithTitle(presetUtil.titles.PRESETS_GROUP_SYSTEM)
			.and.iShouldSeeGroupWithTitle(presetUtil.titles.PRESETS_GROUP_CUSTOM);
	});

	opaTest("Should create custom preset", function (Given, When, Then) {
		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressPresetInPopover(testPreset.title);
		When.onTheRulesPage.iPressSelectCheckboxOf("Error logs",  "Rules selection was changed", "Could not change rules selection");
		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPreset._forTestTitleIfModified);
	});

	opaTest("Should see custom preset persisted and be able to undo changes", function (Given, When, Then) {
		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressUndoButton(testPreset._forTestTitleIfModified);

		When.onThePresetsPage.iOpenPresetsPopover();
		Then.onThePresetsPage.iShouldSeePresetInPopover(testPreset.title);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3); // Error logs - rule

		// cleanup -- disable local storage
		When.onTheRulesPage.iPressSettingsButton();
		When.onTheRulesPage.iPressCheckBoxButton(false);
		Then.iTeardownSupportAssistantFrame();
	});

});