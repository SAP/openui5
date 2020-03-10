/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/NavigationList",
	"./pages/Learn",
	"./pages/ExploreSamples",
	"./pages/ExploreOverview",
	"./pages/Integrate",
	"./pages/ToolHeader"
], function (opaTest) {
	"use strict";

	QUnit.module("Navigation between sections");

	opaTest("Should be able to switch to Integrate Section.", function (Given, When, Then) {
		Given.iStartMyApp({ hash: "explore/list"});

		When.onTheToolHeader.iPressOnSection("Integrate");

		Then.onTheToolHeader.iShouldBeOnSection("Integrate");

		// topics switch test
		When.onTheNavigationList.iSwitchToSample("usage");
		Then.onTheIntegratePage.iShouldSeeSampleTitle("Use Cards in Apps");

		When.onTheNavigationList.iSwitchToSample("api");
		Then.onTheIntegratePage.iShouldSeeSampleTitle("API");

		When.onTheNavigationList.iSwitchToSample("overview");
		Then.onTheIntegratePage.iShouldSeeSampleTitle("Overview");

	});

	opaTest("Should be able to switch to Explore Section.", function (Given, When, Then) {
		When.onTheToolHeader.iPressOnSection("Explore");
		Then.onTheToolHeader.iShouldBeOnSection("ExploreSamples");

		When.onTheNavigationList.iSwitchToSample("types");
		Then.onTheExploreOverviewPage.iShouldSeeSampleTitle("Card Types");

		When.onTheNavigationList.iSwitchToSample("list");
		Then.onTheExploreSamplesPage.iShouldSeeSampleTitle("List");
	});

	opaTest("Should be able to switch from Explore sub sample to Integrate and back.", function (Given, When, Then) {
		// ticket 1980487941 check
		When.onTheExploreSamplesPage.iChangeDropdownValue("Numeric");
		When.onTheToolHeader.iPressOnSection("Integrate");
		When.onTheToolHeader.iPressOnSection("Explore");
		Then.onTheExploreSamplesPage.iShouldSeeSubSample("numeric");
	});

	opaTest("Should be able to switch to Learn Section.", function (Given, When, Then) {
		When.onTheToolHeader.iPressOnSection("Learn");

		Then.onTheToolHeader.iShouldBeOnSection("LearnDetail");

		// topics switch test
		When.onTheNavigationList.iSwitchToSample("headers");
		Then.onTheLearnPage.iShouldSeeSampleTitle("Card Headers");

		When.onTheNavigationList.iSwitchToSample("cardActions");
		Then.onTheLearnPage.iShouldSeeSampleTitle("Card Features");

		When.onTheNavigationList.iSwitchToSample("gettingStarted");
		Then.onTheLearnPage.iShouldSeeSampleTitle("Integration Card Getting Started");

		When.onTheNavigationList.iSwitchToSample("overview");
		Then.onTheLearnPage.iShouldSeeSampleTitle("Integration Card Overview");

		Then.iTeardownMyApp();
	});
});
