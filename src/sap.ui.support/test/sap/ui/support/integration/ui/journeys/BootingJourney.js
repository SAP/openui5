/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	var EXPECTED_RULES_COUNT = 45;

	QUnit.module("Support Assistant Booting");

	opaTest("Should see the toolbar of the Support Assistant", function (Given, When, Then) {

		Given.iStartMyApp()
			.and.iDeletePersistedData();

		Then.onTheMainPage.iShouldSeeTheToolbar();
	});

	opaTest("Should have rules ready", function (Given, When, Then) {

		Then.onTheRulesPage.iShouldSeeRulesTreeTable();

		Then.onTheMainPage.iShouldSeeRulesButton(EXPECTED_RULES_COUNT);

		Then.iTeardownSupportAssistantFrame();
	});

});