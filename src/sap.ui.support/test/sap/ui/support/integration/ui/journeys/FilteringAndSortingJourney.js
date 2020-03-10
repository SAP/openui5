/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"../SupportAssistantOpaConfig"
], function (opaTest) {
	"use strict";

	var EXPECTED_RULES_COUNT = 45,
		FILTERING_VALUE = "er";

	QUnit.module("Support Assistant Filtering and Sorting");

	opaTest("Should see the Tree Table of the Support Assistant with 45 rules selected", function (Given, When, Then) {

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

		Then.onTheRulesPage.iShouldSeeLibrarySelectedInView(2);
		// Error logs - rule
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);


	});

	opaTest("Should see column list menu", function (Given, When, Then) {

		When.onTheRulesPage.iPressTableHeader();

		Then.onTheRulesPage.iShouldSeeColumnListMenu();

	});

	opaTest("Enter filtering value and filter", function (Given, When, Then) {

		When.onTheRulesPage.iEnterFilterValue(FILTERING_VALUE);

		Then.onTheRulesPage.iShouldSeeFilterTextEnteredInFilterField(FILTERING_VALUE);

		When.onTheRulesPage.iFilterColumnOfTable();

		Then.iTeardownSupportAssistantFrame();

	});

	opaTest("Should see the Tree Table of the Support Assistant with 45 rules selected", function (Given, When, Then) {

		Given.iStartMyApp();

		Then.onTheMainPage.iShouldSeeRulesButton(EXPECTED_RULES_COUNT);

		Then.onTheRulesPage.iShouldSeeRulesSelectedCountColumnHeader(EXPECTED_RULES_COUNT);
	});

	opaTest("Should deselect one rule in model and view", function (Given, When, Then) {

		//sap.ui.core - Error logs - rule
		When.onTheRulesPage.iPressSelectCheckboxOf("Error logs", "Rule has been deselected", "Could not deselect Rule");

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(1);

		Then.onTheRulesPage.iShouldSeeLibrarySelectedInView(2);
		// Error logs - rule
		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(3);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);


	});

	opaTest("Should see column list menu", function (Given, When, Then) {

		When.onTheRulesPage.iPressTableHeader();

		Then.onTheRulesPage.iShouldSeeColumnListMenu();

	});

	opaTest("Should deselect one rule in model and view", function (Given, When, Then) {

		When.onTheRulesPage.iPressSortAscendingButton();

		//sap.ui.core - library
		Then.onTheRulesPage.iShouldSeeLibrarySelectedInView(1);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInView(18);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInView(28);

		Then.onTheRulesPage.iShouldSeeLibraryDeselectedInModel(1);

		Then.onTheRulesPage.iShouldSeeRuleDeselectedInModel(1, 1);

		Then.iTeardownSupportAssistantFrame();

	});

});