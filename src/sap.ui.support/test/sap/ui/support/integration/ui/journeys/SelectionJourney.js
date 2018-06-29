/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	var EXPECTED_RULES_COUNT = 45,
		SAP_CORE_RULESET_CHECKBOX_ID = "__xmlview0--analysis--ruleList-rowsel1",
		ERROR_LOGS_RULE_CHECKBOX_ID = "__xmlview0--analysis--ruleList-rowsel3",
		SAP_CORE_COLLAPSE_EXPAND_BUTTON = "__xmlview0--analysis--ruleList-rows-row1-treeicon";

	QUnit.module("Support Assistant Selection");

	opaTest("Should see the Tree Table of the Support Assistant with 45 rules selected ", function (Given, When, Then) {

		Given.iStartMyApp();

		Then.onTheMainPage.iShouldSeeRulesButton(EXPECTED_RULES_COUNT);

		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(EXPECTED_RULES_COUNT);
	});

	opaTest("Should deselect all rules in TreeTable", function (Given, When, Then) {

		When.onTheRulesPage.iPressOnTreeTableCheckBox("__xmlview0--analysis--ruleList-selall", "The parent note button in tree table was pressed", "The parent note button in tree table is not there");

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(0, "All Rules are deselected", "Was not able to deselect rules");

	});

	opaTest("Should select all rules in TreeTable", function (Given, When, Then) {

		When.onTheRulesPage.iPressOnTreeTableCheckBox("__xmlview0--analysis--ruleList-selall", "The parent note button in tree table was pressed", "The parent note button in tree table is not there");

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(EXPECTED_RULES_COUNT, "All rules are selected", "Was not able to select all rules");

	});

	opaTest("Should deselect only sap.m ruleset in TreeTable", function (Given, When, Then) {

		//sap.ui.core ruleset
		When.onTheRulesPage.iPressOnTreeTableCheckBox(SAP_CORE_RULESET_CHECKBOX_ID,  "RuleSet has been deselected", "Could not deselect RuleSet");

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(24, "Was able to deselect sap.m ruleset", "Was not able to deselect sap.m ruleset");

	});

	opaTest("All rules should be selected after ruleset is selected", function (Given, When, Then) {

		//sap.ui.core ruleset
		When.onTheRulesPage.iPressOnTreeTableCheckBox(SAP_CORE_RULESET_CHECKBOX_ID,  "RuleSet has been selected", "Could not select RuleSet");

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(EXPECTED_RULES_COUNT, "All Rules are selected", "Was not able to select all rules");

	});

	opaTest("Should deselect one rule in model and view", function (Given, When, Then) {

		//sap.ui.core - Error logs - rule
		When.onTheRulesPage.iPressOnTreeTableCheckBox(ERROR_LOGS_RULE_CHECKBOX_ID,  "Rule has been deselected", "Could not deselect Rule");

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
		When.onTheRulesPage.iPressOnTreeTableCheckBox(SAP_CORE_RULESET_CHECKBOX_ID,  "RuleSet has been selected", "Could not select RuleSet");

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
		When.onTheRulesPage.iPressOnTreeTableCheckBox(SAP_CORE_COLLAPSE_EXPAND_BUTTON,  "RuleSet was collapsed ", "Could not collapse RuleSet");

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
		When.onTheRulesPage.iPressOnTreeTableCheckBox(SAP_CORE_RULESET_CHECKBOX_ID,  "RuleSet has been deselected", "Could not deselect RuleSet");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(24, "Total selection count should be: 24", "Total selection count is not 24");

	});

	opaTest("Should preserve selection when ruleset is expanded", function (Given, When, Then) {


		//sap.ui.core ruleset expand
		When.onTheRulesPage.iPressOnTreeTableCheckBox(SAP_CORE_COLLAPSE_EXPAND_BUTTON,  "RuleSet was expanded ", "Could not expand RuleSet");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(24, "Total selection count should be: 24", "Total selection count is not 24");

	});

	opaTest("Should preserve ruleset when selection is applied and it is collapsed and expanded", function (Given, When, Then) {

        //sap.ui.core - last rule - rule
		When.onTheRulesPage.iPressOnTreeTableCheckBox("__xmlview0--analysis--ruleList-rowsel17",  "Rule has been selected", "Could not select Rule");

		//sap.ui.core ruleset collapse
		When.onTheRulesPage.iPressOnTreeTableCheckBox(SAP_CORE_COLLAPSE_EXPAND_BUTTON,  "RuleSet was collapsed ", "Could not collapse RuleSet");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInModel(1, 15);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(25, "Total selection count should be: 25", "Total selection count is not 25");

	});

	opaTest("Should preserve ruleset when selection is applied and it is collapsed and expanded", function (Given, When, Then) {

		//sap.ui.core ruleset expand
		When.onTheRulesPage.iPressOnTreeTableCheckBox(SAP_CORE_COLLAPSE_EXPAND_BUTTON,  "RuleSet was expanded ", "Could not expand RuleSet");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInView(17);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleSelectedInModel(1, 15);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(25, "Total selection count should be: 25", "Total selection count is not 25");

		Then.iTeardownSupportAssistantFrame();

	});

});