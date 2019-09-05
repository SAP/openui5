/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	var EXPECTED_RULES_COUNT = 45;

	QUnit.module("Support Assistant Selection");

	opaTest("Should see the Tree Table of the Support Assistant with 45 rules selected ", function (Given, When, Then) {

		Given.iStartMyApp()
			.and.iDeletePersistedData();

		Then.onTheMainPage.iShouldSeeRulesButton(EXPECTED_RULES_COUNT);

		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(EXPECTED_RULES_COUNT);
	});

	opaTest("Should show/hide Rule details page on library/rule click", function (Given, When, Then) {

		Then.onTheRulesPage.iShouldSeeVisibleRuleDetailsPage();

		When.onTheRulesPage.iClickRow("sap.ui.core");

		Then.onTheRulesPage.iShouldSeeHiddenRuleDetailsPage();

		When.onTheRulesPage.iClickRow("EventBus publish");

		Then.onTheRulesPage.iShouldSeeVisibleRuleDetailsPage();
	});

	opaTest("Should deselect all rules in TreeTable", function (Given, When, Then) {

		When.onTheRulesPage.iPressSelectAllCheckbox();

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(0, "All Rules are deselected", "Was not able to deselect rules");

	});

	opaTest("Should select all rules in TreeTable", function (Given, When, Then) {

		When.onTheRulesPage.iPressSelectAllCheckbox();

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(EXPECTED_RULES_COUNT, "All rules are selected", "Was not able to select all rules");

	});

	opaTest("Should deselect only sap.ui.core ruleset in TreeTable", function (Given, When, Then) {

		//sap.ui.core ruleset
		When.onTheRulesPage.iPressSelectCheckboxOf("sap.ui.core", "RuleSet has been deselected", "Could not deselect RuleSet");

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(24, "Was able to deselect sap.m ruleset", "Was not able to deselect sap.m ruleset");

	});

	opaTest("All rules should be selected after ruleset is selected", function (Given, When, Then) {

		//sap.ui.core ruleset
		When.onTheRulesPage.iPressSelectCheckboxOf("sap.ui.core", "RuleSet has been selected", "Could not select RuleSet");

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(EXPECTED_RULES_COUNT, "All Rules are selected", "Was not able to select all rules");

	});

	opaTest("Should deselect one rule in model and view", function (Given, When, Then) {

		//sap.ui.core - Error logs - rule
		When.onTheRulesPage.iPressSelectCheckboxOf("Error logs", "Rule has been deselected", "Could not deselect Rule");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		// Error logs - rule
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(44, "Total selection count should be: 44", "Total selection count is not 44");

	});

	opaTest("Should select library node and child should be selected in model and view", function (Given, When, Then) {

		//sap.ui.core ruleset
		When.onTheRulesPage.iPressSelectCheckboxOf("sap.ui.core", "RuleSet has been selected", "Could not select RuleSet");

		//sap.ui.core - Error logs - rule
		//library row index and rule row index
		Then.onTheRulesPage.iShouldSeeRuleSelectedInView(1);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInView(3);

		Then.onTheRulesPage.iShouldSeeLibrarySelectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInModel(1, 1);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(EXPECTED_RULES_COUNT, "Total selection count should be: 45", "Total selection count is not 45");

	});

	opaTest("Should collapse library and selection to be preserved in model and view", function (Given, When, Then) {

		//sap.ui.core collapse
		When.onTheRulesPage.iPressExpandCollapseButtonOfRuleSet("sap.ui.core", "RuleSet was collapsed ", "Could not collapse RuleSet");

		//sap.ui.core - Error logs - rule
		//library row index and rule row index
		Then.onTheRulesPage.iShouldSeeRuleSelectedInView(1);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInView(3);

		Then.onTheRulesPage.iShouldSeeLibrarySelectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInModel(1, 1);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(EXPECTED_RULES_COUNT, "Total selection count should be: 45", "Total selection count is not 45");

	});

	opaTest("Should deselect ruleset when it is collapsed and selection to be preserved in model and view", function (Given, When, Then) {


		//sap.ui.core deselect ruleset
		When.onTheRulesPage.iPressSelectCheckboxOf("sap.ui.core", "RuleSet has been deselected", "Could not deselect RuleSet");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(24, "Total selection count should be: 24", "Total selection count is not 24");

	});

	opaTest("Should preserve selection when ruleset is expanded", function (Given, When, Then) {


		//sap.ui.core ruleset expand
		When.onTheRulesPage.iPressExpandCollapseButtonOfRuleSet("sap.ui.core", "RuleSet was expanded ", "Could not expand RuleSet");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(24, "Total selection count should be: 24", "Total selection count is not 24");

	});

	opaTest("Should preserve ruleset when selection is applied and it is collapsed and expanded", function (Given, When, Then) {

		When.onTheRulesPage.iPressSelectCheckboxOf("Unused namespaces in XML view",  "Rule has been selected", "Could not select Rule");

		//sap.ui.core ruleset collapse
		When.onTheRulesPage.iPressExpandCollapseButtonOfRuleSet("sap.ui.core", "RuleSet was collapsed ", "Could not collapse RuleSet");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInModel(1, 15);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(25, "Total selection count should be: 25", "Total selection count is not 25");

	});

	opaTest("Should preserve ruleset when selection is applied and it is collapsed and expanded", function (Given, When, Then) {

		//sap.ui.core ruleset expand
		When.onTheRulesPage.iPressExpandCollapseButtonOfRuleSet("sap.ui.core", "RuleSet was expanded ", "Could not expand RuleSet");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInView(17);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInModel(1, 15);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(25, "Total selection count should be: 25", "Total selection count is not 25");

		Then.iTeardownSupportAssistantFrame();

	});

	opaTest("Should see the Tree Table of the Support Assistant with 45 rules selected ", function (Given, When, Then) {

		Given.iStartMyApp();

		Then.onTheMainPage.iShouldSeeRulesButton(EXPECTED_RULES_COUNT);

		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(EXPECTED_RULES_COUNT);
	});

	opaTest("Should deselect one rule from sap.ui.core library ", function (Given, When, Then) {

		//sap.ui.core - Error logs - rule
		When.onTheRulesPage.iPressSelectCheckboxOf("Error logs", "Rule has been deselected", "Could not deselect Rule");

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(44, "Total selection count should be: 44", "Total selection count is not 44");
	});

	opaTest("Should see the same selection after navigation trough tabs ", function (Given, When, Then) {

		// Switch tabs a few times to ensure correct visibility state of the Rule Details Page at all times.
		Then.onTheRulesPage.iShouldSeeVisibleRuleDetailsPage();
		When.onTheRulesPage.iPressIconTabHeader("additionalRulesets");
		Then.onTheRulesPage.iShouldSeeHiddenRuleDetailsPage();
		When.onTheRulesPage.iPressIconTabHeader("availableRules");
		Then.onTheRulesPage.iShouldSeeVisibleRuleDetailsPage();
		When.onTheRulesPage.iPressIconTabHeader("additionalRulesets");
		Then.onTheRulesPage.iShouldSeeHiddenRuleDetailsPage();

		When.onTheRulesPage.iPressIconTabHeader("availableRules");
		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(44, "Total selection count should be: 44", "Total selection count is not 44");
	});

	opaTest("Should load additional rule and deselect sap.ui.table rules", function (Given, When, Then) {

		When.onTheRulesPage.iPressIconTabHeader("additionalRulesets");
		When.onTheRulesPage.iSelectAdditionalRuleSet("sap.ui.table");
		When.onTheRulesPage.iPressLoadAdditionalRuleSetButton();
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		// Error logs - rule
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);
		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(44, "Total selection count should be: 44", "Total selection count is not 44");
		Then.onTheRulesPage.iShouldSeeVisibleRuleDetailsPage();
	});

	opaTest("Should load additional rule and keep previous selection", function (Given, When, Then) {

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(6);
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(52);
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(6, 0);
		Then.iTeardownSupportAssistantFrame();
	});

});