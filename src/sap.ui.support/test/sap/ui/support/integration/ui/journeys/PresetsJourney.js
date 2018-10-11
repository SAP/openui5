/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/core/ValueState",
	"sap/ui/thirdparty/sinon"
], function(opaTest, ValueState, sinon) {
	"use strict";

	QUnit.module("Support Assistant Rule Presets");

	var MY_SELECTION_TITLE = "My Selection",
		SYSTEM_ACCESSIBILITY_TITLE = "Accessibility",
		SYSTEM_ACCESSIBILITY_COUNT = 5,
		EXAMPLE_PRESET_1 = "TestPreset1.json",
		EXAMPLE_PRESET_S4HANA = "S4HanaPreset.json",
		PRESETS_GROUP_SYSTEM = "System Presets",
		PRESETS_GROUP_CUSTOM = "Custom Presets";

	function loadExamplePreset(fileName) {
		var preset = jQuery.sap.syncGetJSON("test-resources/sap/ui/support/integration/ui/data/Presets/" + fileName).data;

		// prepare title if modified, used for testing
		preset._forTestTitleIfModified = getModifiedPresetTitle(preset.title);

		// prepare a list of rules ids, very handy later
		preset._forTestRulesIds = preset.selections.map(function (oRule) {
			return oRule.ruleId;
		});

		return preset;
	}

	function getPresetsCount() {
		return document.activeElement.contentDocument.getElementById("presetsSelect--select").getElementsByClassName("sapMCLI").length;
	}

	function getModifiedPresetTitle(sTitle) {
		return "<em>" + sTitle + " *" + "</em>";
	}

	opaTest("Should see the Rule Presets variant select", function (Given, When, Then) {
		Given.iStartMyAppAndDeletePersistedData();

		Then.onThePresetsPage.iShouldSeePresetsVariantSelect();

	});

	opaTest("Should be able to open and close Rule Presets popover", function(Given, When, Then) {

		When.onThePresetsPage.iPressPresetsVariantSelect();

		Then.onThePresetsPage.iShouldSeePresetsPopover();

		When.onThePresetsPage.iPressPresetsVariantSelect();

		Then.onThePresetsPage.iShouldNotSeePresetsPopover();

	});

	opaTest("Should be able to see help icon", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeeHelpIcon();

	});

	opaTest("Should be able to see import dialog", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressImport();

		Then.onThePresetsPage.iShouldSeeImportDialog();

		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iPressImportCancel();

	});

	opaTest("Should have error if import file is invalid", function(Given, When, Then) {

		When.onThePresetsPage.iOpenImportDialog();

		When.onThePresetsPage.iUploadExamplePreset("WrongType.pdf", "application/pdf");
		Then.onThePresetsPage.iShouldSeeImportData("fileName", "WrongType.pdf")
			.and.iShouldSeeImportFileError();

		When.onThePresetsPage.iReopenImportDialog();
		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iUploadExamplePreset("InvalidJson.json.txt", "application/json");
		Then.onThePresetsPage.iShouldSeeImportData("fileName", "InvalidJson.json.txt")
			.and.iShouldSeeImportFileError();

		When.onThePresetsPage.iReopenImportDialog();
		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iUploadExamplePreset("InvalidPreset.json");
		Then.onThePresetsPage.iShouldSeeImportData("fileName", "InvalidPreset.json")
			.and.iShouldSeeImportFileError();

		When.onThePresetsPage.iPressImportCancel();

	});

	opaTest("Should be able to see import data", function(Given, When, Then) {

		When.onThePresetsPage.iOpenImportDialog();
		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iUploadExamplePreset(EXAMPLE_PRESET_1);

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_1);

		Then.onThePresetsPage.iShouldSeeImportDataForPreset(EXAMPLE_PRESET_1, testPreset);

	});

	opaTest("Should be able to finalize an import", function(Given, When, Then) {

		When.onThePresetsPage.iPressImportFinalize();

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_1);

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPreset.title)
			.and.iShouldSeeSelectedRules(testPreset._forTestRulesIds);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(testPreset.title)
			.and.iShouldSeeSelectedPreset(testPreset.title);

	});

	opaTest("Should be able to import second preset", function(Given, When, Then) {
		var presetsCountBeforeImport = getPresetsCount();

		When.onThePresetsPage.iOpenImportDialog();
		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iUploadExamplePreset(EXAMPLE_PRESET_S4HANA);

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_S4HANA);

		Then.onThePresetsPage.iShouldSeeImportDataForPreset(EXAMPLE_PRESET_S4HANA, testPreset);

		When.onThePresetsPage.iPressImportFinalize();

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPreset.title)
			.and.iShouldSeeSelectedRules(testPreset._forTestRulesIds);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(testPreset.title)
			.and.iShouldSeeSelectedPreset(testPreset.title);

		Then.onThePresetsPage.iShouldSeeNumberOfPresetsInPopover(presetsCountBeforeImport + 1);

	});

	opaTest("Should NOT be able to import preset with existing ID", function(Given, When, Then) {

		When.onThePresetsPage.iOpenImportDialog();
		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iUploadExamplePreset(EXAMPLE_PRESET_S4HANA);
		var testPreset = loadExamplePreset(EXAMPLE_PRESET_S4HANA);
		Then.onThePresetsPage.iShouldSeeImportDataForPreset(EXAMPLE_PRESET_S4HANA, testPreset);

		// Since the Import is unsuccessful the Import Dialog shouldn't close. And an error message should appear in the form.
		Then.onThePresetsPage.iShouldSeeImportDuplicateIdError("A preset with ID 'S4HANA_MUSTHAVE' is already imported.");

		When.onThePresetsPage.iPressImportCancel();
	});

	opaTest("Should be able to switch to My Selection", function(Given, When, Then) {
		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressPresetInPopover(MY_SELECTION_TITLE);

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(MY_SELECTION_TITLE);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(MY_SELECTION_TITLE)
			.and.iShouldSeeSelectedPreset(MY_SELECTION_TITLE);

	});

	opaTest("Should be able to switch presets and keep selection", function(Given, When, Then) {

		// change "My Selection" selected rules
		When.onTheRulesPage.iPressSelectCheckboxOf("Error logs",  "Rules selection was changed", "Could not change rules selection");

		When.onThePresetsPage.iOpenPresetsPopover();

		// switch preset and check rules
		var testPreset1 = loadExamplePreset(EXAMPLE_PRESET_1);
		When.onThePresetsPage.iPressPresetInPopover(testPreset1.title);
		Then.onThePresetsPage.iShouldSeeSelectedRules(testPreset1._forTestRulesIds);

		When.onThePresetsPage.iOpenPresetsPopover();

		// switch preset and check rules
		var testPreset2 = loadExamplePreset(EXAMPLE_PRESET_S4HANA);
		When.onThePresetsPage.iPressPresetInPopover(testPreset2.title);
		Then.onThePresetsPage.iShouldSeeSelectedRules(testPreset2._forTestRulesIds);

		When.onThePresetsPage.iOpenPresetsPopover();

		// switch back to "My Selection" and check the rules
		When.onThePresetsPage.iPressPresetInPopover(MY_SELECTION_TITLE);
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3); // Error logs - rule

	});

	opaTest("Should be able to delete a preset and fallback to My Selection", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_1);

		When.onThePresetsPage.iPressPresetInPopover(testPreset.title);

		When.onThePresetsPage.iOpenPresetsPopover();

		var presetsCountBeforeDelete = getPresetsCount();

		When.onThePresetsPage.iPressDeletePresetInPopover(testPreset.title);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeeNumberOfPresetsInPopover(presetsCountBeforeDelete - 1);

		Then.onThePresetsPage.iShouldSeeSelectedPreset(MY_SELECTION_TITLE);

	});

	opaTest("Should save persisted presets and selections", function (Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_S4HANA);

		When.onThePresetsPage.iPressPresetInPopover(testPreset.title);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeeSelectedPreset(testPreset.title);

		// allow local storage
		When.onTheRulesPage.iPressSettingsButton();
		When.onTheRulesPage.iPressCheckBoxButton(true);

		Then.iTeardownSupportAssistantFrame();

	});

	opaTest("Should load previously persisted presets and selections", function (Given, When, Then) {

		Given.iStartMyApp();

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_S4HANA);

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPreset.title);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(MY_SELECTION_TITLE)
			.and.iShouldSeePresetInPopover(testPreset.title)
			.and.iShouldSeeSelectedPreset(testPreset.title)
			.and.iShouldSeeSelectedRules(testPreset._forTestRulesIds);

		// disable local storage
		When.onTheRulesPage.iPressSettingsButton();
		When.onTheRulesPage.iPressCheckBoxButton(false);

	});

	opaTest("Should be able to export My Selection", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressPresetInPopover(MY_SELECTION_TITLE);

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

	});

	opaTest("Should be able to export example preset", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_S4HANA);

		When.onThePresetsPage.iPressPresetInPopover(testPreset.title);

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressExport();

		Then.onThePresetsPage.iShouldSeeExportDialog()
			.and.iShouldSeeExportData("title", testPreset.title)
			.and.iShouldSeeExportData("description", testPreset.description)
			.and.iShouldSeeExportData("presetId", testPreset.id);

		When.onThePresetsPage.iPressExportFinalize();

		Then.onThePresetsPage.iShouldReceiveOneExportFile();

		Then.onThePresetsPage.and.iShouldReceiveCorrectExportFile({
			"id": testPreset.id,
			"title": testPreset.title,
			"description": testPreset.description,
			"selections": testPreset.selections
		});

	});

	opaTest("Should be able to change selection and see change in title", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_S4HANA);

		When.onThePresetsPage.iPressPresetInPopover(testPreset.title);

		When.onTheRulesPage.iPressSelectCheckboxOf("Error logs",  "Rules selection was changed", "Could not change rules selection");

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPreset._forTestTitleIfModified);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(testPreset._forTestTitleIfModified)
			.and.iShouldSeeSelectedPreset(testPreset._forTestTitleIfModified);

	});

	opaTest("Should see 'System Presets' and 'Custom Presets' groups", function (Given, When, Then) {
		Then.onThePresetsPage.iShouldSeeGroupWithTitle(PRESETS_GROUP_SYSTEM)
			.and.iShouldSeeGroupWithTitle(PRESETS_GROUP_CUSTOM);

		// enable local storage
		When.onTheRulesPage.iPressSettingsButton();

		When.onTheRulesPage.iPressCheckBoxButton(true);

		Then.iTeardownSupportAssistantFrame();
	});

	opaTest("Should see custom preset persisted and be able to undo changes", function (Given, When, Then) {
		var testPreset = loadExamplePreset(EXAMPLE_PRESET_S4HANA);

		Given.iStartMyApp();

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressUndoButton(testPreset._forTestTitleIfModified);

		Then.onThePresetsPage.iShouldSeePresetInPopover(testPreset.title);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInView(3); // Error logs - rule
	});

	opaTest("Should see validation messages when required inputs are not filled", function(Given, When, Then) {

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

	/* Accessibility System Preset related tests */
	opaTest("Should be able to switch to 'Accessibility' Preset", function (Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressPresetInPopover(SYSTEM_ACCESSIBILITY_TITLE);

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(SYSTEM_ACCESSIBILITY_TITLE);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(SYSTEM_ACCESSIBILITY_TITLE)
			.and.iShouldSeeSelectedPreset(SYSTEM_ACCESSIBILITY_TITLE);

		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(SYSTEM_ACCESSIBILITY_COUNT);
	});

	opaTest("Should be able to switch from 'Accessibility' preset and keep selections", function (Given, When, Then) {

		// change "Accessibility" selected rules
		When.onTheRulesPage.iPressSelectCheckboxOf("Button: Consists of only an icon, needs a tooltip", "Rules selection was changed", "Could not change rules selection");

		When.onThePresetsPage.iOpenPresetsPopover();

		// switch preset and check the rules
		When.onThePresetsPage.iPressPresetInPopover(MY_SELECTION_TITLE);

		When.onThePresetsPage.iOpenPresetsPopover();

		// switch back to "Accessibility" and check the rules
		When.onThePresetsPage.iPressPresetInPopover(getModifiedPresetTitle(SYSTEM_ACCESSIBILITY_TITLE)); //indirect check if title is visually modified
		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(SYSTEM_ACCESSIBILITY_COUNT - 1);
	});

	opaTest("Should save persisted 'Accessibility' preset and selections", function (Given, When, Then) {
		When.onThePresetsPage.iOpenPresetsPopover();
		Then.onThePresetsPage.iShouldSeeSelectedPreset(getModifiedPresetTitle(SYSTEM_ACCESSIBILITY_TITLE));

		Then.iTeardownSupportAssistantFrame();
	});

	opaTest("Should load previously persisted 'Accessibility' preset and selections", function (Given, When, Then) {
		var sModifiedTitle = getModifiedPresetTitle(SYSTEM_ACCESSIBILITY_TITLE);

		Given.iStartMyApp();

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(sModifiedTitle);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(sModifiedTitle)
			.and.iShouldSeeSelectedPreset(sModifiedTitle);
		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(SYSTEM_ACCESSIBILITY_COUNT - 1);

		// disable local storage
		When.onTheRulesPage.iPressSettingsButton();
		When.onTheRulesPage.iPressCheckBoxButton(false);
	});

	opaTest("Should be able to undo changes in System Preset 'Accessibility' and see change in title", function(Given, When, Then) {
		When.onThePresetsPage.iOpenPresetsPopover();
		When.onThePresetsPage.iPressUndoButton(getModifiedPresetTitle(SYSTEM_ACCESSIBILITY_TITLE));
		Then.onThePresetsPage.iShouldSeePresetInPopover(SYSTEM_ACCESSIBILITY_TITLE);

		// finalize all tests
		Then.iTeardownSupportAssistantFrame();
	});
});