/*global QUnit*/

sap.ui.define([
	"sap/ui/support/supportRules/util/EvalUtils",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"../SupportAssistantOpaConfig"
], function (EvalUtils, opaTest, Opa5) {
	"use strict";

	var CREATE_RULE_BUTTON = "Create Rule",
		ADD_RULE_BUTTON = "Add Rule",
		INDEX_OF_TEMPORARY_LIBRARY = 0,
		TEMP_RULE_TITLE_AFTER_UPDATE = "Title of the rule after update";

	QUnit.module("Support Assistant Temporary Rules");

	if (!EvalUtils.isEvalAllowed()) {
		opaTest("Temporary rules are not supported in this environment", function (Given, When, Then) {
			Given.waitFor({
				success: function () {
					Opa5.assert.ok(true, "Temporary rules are not supported in this environment");
				}
			});
		});
		return;
	}

	opaTest("Should create new temporary rule", function (Given, When, Then) {

		Given.iDeletePersistedData()
			.and.iStartMyApp();

		Then.onTheMainPage.iShouldSeeRulesButton(45);

		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(45);

		When.onTheRulesPage.iPressButtonWithText(CREATE_RULE_BUTTON);

		Then.onTheCreateTemporaryRulePage.iShouldSeeTheForm();

		When.onTheCreateTemporaryRulePage.iFillIdWith("testId")
			.and.iFillTitleWith("Title of the temp rule")
			.and.iFillDescriptionWith("Description")
			.and.iFillResolutionWith("Resolution")
			.and.iFillVersionWith("1");
		When.onTheRulesPage.iPressButtonWithText(ADD_RULE_BUTTON);

		Then.onTheRulesPage.iShouldSeeNumberOfRulesInLibrary(INDEX_OF_TEMPORARY_LIBRARY, 1)
			.and.iShouldSeeRuleSelectedInModel(INDEX_OF_TEMPORARY_LIBRARY, 0);
	});

	opaTest("Should create second temporary rule", function (Given, When, Then) {

		When.onTheRulesPage.iPressButtonWithText(CREATE_RULE_BUTTON);

		Then.onTheCreateTemporaryRulePage.iShouldSeeTheForm();

		When.onTheCreateTemporaryRulePage.iFillIdWith("testId2")
			.and.iFillTitleWith("Title of the temp rule2")
			.and.iFillDescriptionWith("Description2")
			.and.iFillResolutionWith("Resolution2")
			.and.iFillVersionWith("1.1");
		When.onTheRulesPage.iPressButtonWithText(ADD_RULE_BUTTON);

		Then.onTheRulesPage.iShouldSeeNumberOfRulesInLibrary(INDEX_OF_TEMPORARY_LIBRARY, 2)
			.and.iShouldSeeRuleSelectedInModel(INDEX_OF_TEMPORARY_LIBRARY, 1);
	});

	opaTest("Should deselect temporary rule without persistence enabled", function (Given, When, Then) {

		When.onTheRulesPage.iPressSelectCheckboxOf("Title of the temp rule", "The first temporary rule was pressed", "The first temporary rule was not pressed");

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(0);
	});

	opaTest("Should delete temporary rule without persistence enabled", function (Given, When, Then) {

		When.onTheRulesPage.iPressDeleteIconOfTemporaryRule("Title of the temp rule");

		Then.onTheRulesPage.iShouldSeeNumberOfRulesInLibrary(INDEX_OF_TEMPORARY_LIBRARY, 1);
	});

	opaTest("Should edit temporary rule without persistence enabled", function (Given, When, Then) {

		When.onTheRulesPage.iPressEditIconOfTemporaryRule("Title of the temp rule2");

		Then.onTheUpdateTemporaryRulePage.iShouldSeeTheForm();

		When.onTheUpdateTemporaryRulePage.iFillTitleWith(TEMP_RULE_TITLE_AFTER_UPDATE);

		When.onTheRulesPage.iPressButtonWithText("Update");

		Then.onTheRulesPage.iShouldSeeARuleWithSpecificTitle(INDEX_OF_TEMPORARY_LIBRARY, 0, TEMP_RULE_TITLE_AFTER_UPDATE);
	});

	opaTest("Should clone rule from existing without persistence enabled", function (Given, When, Then) {

		var sRuleTitle = "Title from cloned rule";

		When.onTheRulesPage.iPressCloneIconOfRule("EventBus publish");

		Then.onTheCreateTemporaryRulePage.iShouldSeeTheForm();

		When.onTheCreateTemporaryRulePage.iFillTitleWith(sRuleTitle);

		When.onTheRulesPage.iPressButtonWithText(ADD_RULE_BUTTON);

		Then.onTheRulesPage.iShouldSeeARuleWithSpecificTitle(INDEX_OF_TEMPORARY_LIBRARY, 1, sRuleTitle);
	});

	opaTest("Should deselect first temporary rule", function (Given, When, Then) {

		//first temporary rule
		When.onTheRulesPage.iPressSelectCheckboxOf("Title of the rule after update", "Rule has been deselected", "Could not deselect Rule");

		//temporary- library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(0);

		// Error logs - rule
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(INDEX_OF_TEMPORARY_LIBRARY);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(INDEX_OF_TEMPORARY_LIBRARY, 0);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(46, "46 Rules are selected", "Was not able to deselect rule");
	});

	opaTest("Should deselect second rule from  sap.ui.core", function (Given, When, Then) {

		//second rule from sap.ui.core
		When.onTheRulesPage.iPressSelectCheckboxOf("Error logs", "Rule has been deselected", "Could not deselect Rule");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(3);

		// Error logs - rule
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(5);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(45, "45 Rules are selected", "Was not able to deselect rule");

	});

	opaTest("Should load additional rule and deselect sap.ui.table rules", function (Given, When, Then) {
		Then.onTheRulesPage.iShouldSeeRuleInTable(TEMP_RULE_TITLE_AFTER_UPDATE, "Temporary rule " + TEMP_RULE_TITLE_AFTER_UPDATE + " disappeared")
			.and.iShouldSeeLibraryDeselectedInView(INDEX_OF_TEMPORARY_LIBRARY);

		When.onTheRulesPage.iPressIconTabHeader("additionalRulesets")
			.and.iSelectAdditionalRuleSet("sap.ui.table")
			.and.iPressLoadAdditionalRuleSetButton();

		Then.onTheRulesPage.iShouldSeeRuleInTable(TEMP_RULE_TITLE_AFTER_UPDATE, "Temporary rule '" + TEMP_RULE_TITLE_AFTER_UPDATE + "' disappeared after loading additional rulesets")
			.and.iShouldSeeLibraryDeselectedInView(INDEX_OF_TEMPORARY_LIBRARY);

		// first temp rule
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(INDEX_OF_TEMPORARY_LIBRARY);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(INDEX_OF_TEMPORARY_LIBRARY, 0);

		// second temp rule
		Then.onTheRulesPage.iShouldSeeRuleSelectedInView(2);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInModel(0, 1);

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(3);

		// Error logs - rule
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(5);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);

		// sap.ui.table
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(6);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(6, 0);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(45, "45 Rules are selected", "Was not able to deselect rule");

		Then.iTeardownSupportAssistantFrame();
	});

	opaTest("Should select duplicated rules together", function (Given, When, Then) {

		Given.iStartMyApp();

		When.onTheRulesPage.iPressButtonWithText(CREATE_RULE_BUTTON);

		Then.onTheCreateTemporaryRulePage.iShouldSeeTheForm();

		When.onTheCreateTemporaryRulePage.iFillIdWith("errorLogs")
			.and.iFillTitleWith("Title of the duplicated Error Logs")
			.and.iFillDescriptionWith("Description of the duplicated rule")
			.and.iFillResolutionWith("Resolution of the duplicated rule")
			.and.iFillVersionWith("1.1");
		When.onTheRulesPage.iPressButtonWithText(ADD_RULE_BUTTON);

		When.onTheRulesPage.iDeselectAllRules();

		When.onTheRulesPage.iPressSelectCheckboxOf("Error logs", "Rule has been selected", "Could not select Rule");

		Then.onTheRulesPage.iShouldSeeDuplicatedRuleSelectedInView("Title of the duplicated Error Logs");

		Then.onTheRulesPage.iShouldSeeRuleSelectedInView(4); // error logs rule index

		Then.iTeardownSupportAssistantFrame();
	});

	opaTest("Should run analyze and see issues", function (Given, When, Then) {

		Given.iStartMyApp();

		When.onTheRulesPage.iPressAnalyze();

		Then.onTheIssuesPage.iShouldSeeHighIssueInTemporaryLib();

		Then.iTeardownSupportAssistantFrame();
	});

});