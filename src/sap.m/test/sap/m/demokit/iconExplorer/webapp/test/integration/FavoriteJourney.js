/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	QUnit.module("Favorite");

    opaTest("Marking an icon as a favorite should display a message toast", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyAppOnTheDetailsTab();

        //Actions
        When.onTheOverviewPage.iMarkAnIconAsFavorite("activate");

        // Assertions
        Then.onTheAppPage.iShouldSeeMessageToast();
    });

    opaTest("A favorite icon should be found in the favorite tab", function (Given, When, Then) {
        //Actions
        When.onTheOverviewPage.iPressOnTheTabWithTheKey("favorites");

        // Assertions
        Then.onTheOverviewPage.theTableContainsTheIcon("activate");
    });

    opaTest("The icon is marked as favorite on the details tab", function (Given, When, Then) {
        //Actions
        When.onTheOverviewPage.iPressOnTheTabWithTheKey("details");

        // Assertions
        Then.onTheOverviewPage.theIconIsMarkedAsFavorite("activate");
    });

    opaTest("Unmarking an icon as a favorite should display a message toast", function (Given, When, Then) {
        //Actions
        When.onTheOverviewPage.iMarkAnIconAsFavorite("activate");

        // Assertions
        Then.onTheAppPage.iShouldSeeMessageToast();
    });

    opaTest("The icon that was unmarked should not be found in the favorite tab", function (Given, When, Then) {
        //Actions
        When.onTheOverviewPage.iPressOnTheTabWithTheKey("favorites");

        // Assertions
        Then.onTheOverviewPage.theTableDoesNotContainTheIcon("activate");
    });
});