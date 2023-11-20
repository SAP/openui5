/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"../SupportAssistantOpaConfig"
], function (opaTest) {
	"use strict";

	var EXPECTED_RULES_COUNT = 45;

	QUnit.module("Support Assistant Local Storage Persistency");

	opaTest("Should see the Tree Table of the Support Assistant with 45 rules selected ", function (Given, When, Then) {

		Given.iDeletePersistedData()
			.and.iStartMyApp();

		Then.onTheMainPage.iShouldSeeRulesButton(EXPECTED_RULES_COUNT);

		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(EXPECTED_RULES_COUNT);
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

	opaTest("Should see storage settings popover", function (Given, When, Then) {

		When.onTheRulesPage.iPressSettingsButton();

		Then.onTheRulesPage.iShouldSeeStorageSettingsPopOver();

	});

	opaTest("Should see storage settings checkbox selected", function (Given, When, Then) {

		When.onTheRulesPage.iPressCheckBoxButton(true);

		Then.onTheRulesPage.iShouldSeeStorageSettingsCheckBoxSelected(true);

		Then.onTheMainPage.iShouldPersistingDataInStorageLabelOnToolbar();

	});

	opaTest("Should deselect EventBus publish in model and view and sap.ui.core", function (Given, When, Then) {

		//sap.ui.core - EventBus publish - rule
		When.onTheRulesPage.iPressSelectCheckboxOf("EventBus publish", "RuleSet sap.ui.core has been deselected", "Could not deselect RuleSet sap.ui.core");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(2);
		// Error logs - rule
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(2);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 0);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(43, "Total selection count should be: 43", "Total selection count is not 43");

		Then.iTeardownSupportAssistantFrame();
	});

	opaTest("Should see the Tree Table of the Support Assistant with 43 rules selected ", function (Given, When, Then) {

		Given.iStartMyApp();

		Then.onTheMainPage.iShouldSeeRulesButton(43);

		Then.onTheMainPage.iShouldPersistingDataInStorageLabelOnToolbar();

	});

	opaTest("Should see the deselected rule loaded from local storage", function (Given, When, Then) {

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(2);
		// Error logs - rule
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(2);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 0);

		Then.onTheRulesPage.iShouldSeeRulesSelectionStateChanged(43, "Total selection count should be: 43", "Total selection count is not 43");

	});

	opaTest("Should see storage settings popover", function (Given, When, Then) {

		When.onTheRulesPage.iPressSettingsButton();

		Then.onTheRulesPage.iShouldSeeStorageSettingsPopOver();

	});

	opaTest("Should remove local storage persistency", function (Given, When, Then) {

		When.onTheRulesPage.iPressCheckBoxButton(false);

		Then.onTheRulesPage.iShouldSeeStorageSettingsCheckBoxSelected(false);

		Then.iTeardownSupportAssistantFrame();

	});

	opaTest("Should see the Tree Table of the Support Assistant with 45 rules selected after local storage persistency was removed ", function (Given, When, Then) {

		Given.iStartMyApp();

		Then.onTheMainPage.iShouldSeeRulesButton(EXPECTED_RULES_COUNT);

		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(EXPECTED_RULES_COUNT);

		Then.iTeardownSupportAssistantFrame();

	});
});