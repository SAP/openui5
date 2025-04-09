/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/NavigationList",
	"./pages/ExploreSamples"
], function (opaTest) {
	"use strict";

	QUnit.module("Cleanup sample when navigating from one sample to another");

	opaTest("Should be able to switch from Calendar to Table sample without Calendar event appearing on top of Table sample.", function (Given, When, Then) {
		Given.iStartMyApp({ hash: "explore/list"});

		Then.onTheExploreSamplesPage.iShouldSeeSampleCard("card.explorer.highlight.list.card");

		When.onTheExploreSamplesPage.iSpyOnCardActionEvent();

		When.onTheNavigationList.iSwitchToSample("calendar");

		Then.onTheExploreSamplesPage.iShouldSeeSampleCard("card.explorer.simple.calendar.card");

		Then.onTheExploreSamplesPage.iShouldSeeCardActionEventCalls();

		When.onTheNavigationList.iSwitchToSample("table");

		Then.onTheExploreSamplesPage.iShouldSeeSampleCard("card.explorer.table.card");

		Then.onTheExploreSamplesPage.iShouldSeeNoCardActionEventCalls();

		When.onTheExploreSamplesPage.iStopSpyingOnCardActionEvent();

		Then.iTeardownMyApp();
	});
});
