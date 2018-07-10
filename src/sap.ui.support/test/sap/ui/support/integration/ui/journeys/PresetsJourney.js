/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function(opaTest) {
	"use strict";

	QUnit.module("Support Assistant Rule Presets");

	var ERROR_LOGS_RULE_CHECKBOX_ID = "__xmlview0--analysis--ruleList-rowsel3",
		MY_SELECTION_TITLE = "My Selection",
		EXAMPLE_PRESET_ACCESSIBILITY = "AccessibilityPreset.json",
		EXAMPLE_PRESET_S4HANA = "S4HanaPreset.json";

	function loadExamplePreset(fileName) {
		var preset = jQuery.sap.syncGetJSON("data/Presets/" + fileName).data;

		// prepare title if modified, used for testing
		preset._forTestTitleIfModified = preset.title + " (*)";

		// prepare a list of rules ids, very handy later
		preset._forTestRulesIds = preset.selections.map(function (oRule) {
			return oRule.ruleId;
		});

		return preset;
	}

	opaTest("Should see the Rule Presets variant select", function(Given, When, Then) {

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
			.and.iShouldSeeImportError();

		When.onThePresetsPage.iReopenImportDialog();
		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iUploadExamplePreset("InvalidJson.json.txt", "application/json");
		Then.onThePresetsPage.iShouldSeeImportData("fileName", "InvalidJson.json.txt")
			.and.iShouldSeeImportError();

		When.onThePresetsPage.iReopenImportDialog();
		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iUploadExamplePreset("InvalidPreset.json");
		Then.onThePresetsPage.iShouldSeeImportData("fileName", "InvalidPreset.json")
			.and.iShouldSeeImportError();

		When.onThePresetsPage.iPressImportCancel();

	});

	opaTest("Should be able to see import data", function(Given, When, Then) {

		When.onThePresetsPage.iOpenImportDialog();
		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iUploadExamplePreset(EXAMPLE_PRESET_ACCESSIBILITY);

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_ACCESSIBILITY);

		Then.onThePresetsPage.iShouldSeeImportDataForPreset(EXAMPLE_PRESET_ACCESSIBILITY, testPreset);

	});

	opaTest("Should be able to finalize an import", function(Given, When, Then) {

		When.onThePresetsPage.iPressImportFinalize();

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_ACCESSIBILITY);

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPreset.title)
			.and.iShouldSeeSelectedRules(testPreset._forTestRulesIds);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(testPreset.title)
			.and.iShouldSeeSelectedPreset(testPreset.title);

	});

	opaTest("Should be able to import second preset", function(Given, When, Then) {

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

		Then.onThePresetsPage.iShouldSeeNumberOfPresetsInPopover(3);

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
		When.onTheRulesPage.iPressOnTreeTableCheckBox(ERROR_LOGS_RULE_CHECKBOX_ID,  "Rules selection was changed", "Could not change rules selection"); // Error logs - rule

		When.onThePresetsPage.iOpenPresetsPopover();

		// switch preset and check rules
		var testPreset1 = loadExamplePreset(EXAMPLE_PRESET_ACCESSIBILITY);
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

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_ACCESSIBILITY);

		When.onThePresetsPage.iPressPresetInPopover(testPreset.title);

		When.onThePresetsPage.iOpenPresetsPopover();

		When.onThePresetsPage.iPressDeletePresetInPopover(testPreset.title);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeeNumberOfPresetsInPopover(2);

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

		Then.onThePresetsPage.iShouldSeeNumberOfPresetsInPopover(2)
			.and.iShouldSeePresetInPopover(MY_SELECTION_TITLE)
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
			.and.iShouldSeeExportData("title", "")
			.and.iShouldSeeExportData("description", "");

		When.onThePresetsPage.iEnterExportData("title", "Example title")
			.and.iEnterExportData("description", "Example description");

		When.onThePresetsPage.iPressExportFinalize();

		Then.onThePresetsPage.iShouldReceiveOneExportFile()
			.and.iShouldReceiveCorrectExportFile({
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
			.and.iShouldSeeExportData("description", testPreset.description);

		When.onThePresetsPage.iPressExportFinalize();

		Then.onThePresetsPage.iShouldReceiveOneExportFile();

		Then.onThePresetsPage.and.iShouldReceiveCorrectExportFile({
			"title": testPreset.title,
			"description": testPreset.description,
			"selections": testPreset.selections
		});

	});

	opaTest("Should be able to change selection and see change in title", function(Given, When, Then) {

		When.onThePresetsPage.iOpenPresetsPopover();

		var testPreset = loadExamplePreset(EXAMPLE_PRESET_S4HANA);

		When.onThePresetsPage.iPressPresetInPopover(testPreset.title);

		When.onTheRulesPage.iPressOnTreeTableCheckBox(ERROR_LOGS_RULE_CHECKBOX_ID,  "Rules selection was changed", "Could not change rules selection"); // Error logs - rule

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPreset._forTestTitleIfModified);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(testPreset._forTestTitleIfModified)
			.and.iShouldSeeSelectedPreset(testPreset._forTestTitleIfModified);

		// finalize all tests
		Then.iTeardownMyAppFrame();
	});
});
