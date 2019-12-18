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

	QUnit.module("Support Assistant Rule Presets - Import");

	opaTest("Should have error if import file is invalid", function(Given, When, Then) {
		Given.iDeletePersistedData()
			.and.iStartMyApp();

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

		When.onThePresetsPage.iUploadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_1);

		Then.onThePresetsPage.iShouldSeeImportDataForPreset(presetUtil.titles.EXAMPLE_PRESET_1, testPresetExample);

	});

	opaTest("Should be able to finalize an import", function(Given, When, Then) {
		When.onThePresetsPage.iPressImportFinalize();

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPresetExample.title)
			.and.iShouldSeeSelectedRules(testPresetExample._forTestRulesIds);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(testPresetExample.title)
			.and.iShouldSeeSelectedPreset(testPresetExample.title);

		When.onThePresetsPage.iClosePresetsPopover();

	});

	opaTest("Should be able to import second preset", function(Given, When, Then) {
		var presetsCountBeforeImport = document.activeElement.contentDocument.getElementById("presetsSelect--select").getElementsByClassName("sapMCLI").length;

		When.onThePresetsPage.iOpenImportDialog();
		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iUploadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_S4HANA);

		Then.onThePresetsPage.iShouldSeeImportDataForPreset(presetUtil.titles.EXAMPLE_PRESET_S4HANA, testPresetHana);

		When.onThePresetsPage.iPressImportFinalize();

		Then.onThePresetsPage.iShouldSeePresetTitleInVariantSelect(testPresetHana.title)
			.and.iShouldSeeSelectedRules(testPresetHana._forTestRulesIds);

		When.onThePresetsPage.iOpenPresetsPopover();

		Then.onThePresetsPage.iShouldSeePresetInPopover(testPresetHana.title)
			.and.iShouldSeeSelectedPreset(testPresetHana.title);

		Then.onThePresetsPage.iShouldSeeNumberOfPresetsInPopover(presetsCountBeforeImport + 1);

		When.onThePresetsPage.iClosePresetsPopover();

	});

	opaTest("Should NOT be able to import preset with existing ID", function(Given, When, Then) {
		When.onThePresetsPage.iOpenImportDialog();
		Then.onThePresetsPage.iShouldSeeEmptyImportDialog();

		When.onThePresetsPage.iUploadExamplePreset(presetUtil.titles.EXAMPLE_PRESET_S4HANA);
		Then.onThePresetsPage.iShouldSeeImportDataForPreset(presetUtil.titles.EXAMPLE_PRESET_S4HANA, testPresetHana);

		// Since the Import is unsuccessful the Import Dialog shouldn't close. And an error message should appear in the form.
		Then.onThePresetsPage.iShouldSeeImportDuplicateIdError("A preset with ID 'S4HANA_MUSTHAVE' is already imported.");

		When.onThePresetsPage.iPressImportCancel();

		Then.iTeardownSupportAssistantFrame();
	});

});