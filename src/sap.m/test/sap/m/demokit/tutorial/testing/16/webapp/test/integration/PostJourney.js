/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Worklist",
	"./pages/Browser",
	"./pages/Post"
], function (opaTest) {
		"use strict";

		QUnit.module("Post");

		opaTest("Should see the post page when a user clicks on an entry of the list", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();

			//Actions
			When.onTheWorklistPage.iPressOnTheItemWithTheID("PostID_15");

			// Assertions
			Then.onThePostPage.theTitleShouldDisplayTheName("Jeans");
		});

		opaTest("Should go back to the TablePage", function (Given, When, Then) {
			// Actions
			When.onThePostPage.iPressTheBackButton();

			// Assertions
			Then.onTheWorklistPage.iShouldSeeTheTable();
		});

		opaTest("Should be on the post page again when the browser's forward button is pressed", function (Given, When, Then) {
			// Actions
			When.onTheBrowser.iPressOnTheForwardButton();

			// Assertions
			Then.onThePostPage.theTitleShouldDisplayTheName("Jeans");
		});

		opaTest("Should select the statistics tab", function (Given, When, Then) {
			// Actions
			When.onThePostPage.iPressOnTheTabWithTheKey("statistics");

			// Assertions
			Then.onThePostPage.iShouldSeeTheViewCounter();

			// Cleanup
			Then.iTeardownMyApp();
		});
	}
);
