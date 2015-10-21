sap.ui.define([
		"sap/ui/test/opaQunit"
	], function (opaTest) {
		"use strict";

		QUnit.module("Desktop not found");

		opaTest("Should see the resource not found page and no selection in the master list when navigating to an invalid hash", function (Given, When, Then) {
			//Arrangement
			Given.iStartTheApp();

			//Actions
			When.onTheMasterPage.iWaitUntilTheListIsLoaded()
				.and.iWaitUntilTheFirstItemIsSelected();
			When.onTheBrowserPage.iChangeTheHashToSomethingInvalid();

			// Assertions
			Then.onTheNotFoundPage.iShouldSeeTheNotFoundPage().
				and.theNotFoundPageShouldSayResourceNotFound();
			Then.onTheMasterPage.theListShouldHaveNoSelection().
				and.iTeardownMyAppFrame();
		});

		opaTest("Should see the not found page if the hash is something that matches no route", function (Given, When, Then) {
			// Arrangements
			Given.iStartTheApp({ hash : "somethingThatDoesNotExist" });

			// Actions
			When.onTheNotFoundPage.iLookAtTheScreen();

			// Assertions
			Then.onTheNotFoundPage.iShouldSeeTheNotFoundPage().
				and.theNotFoundPageShouldSayResourceNotFound().
				and.iTeardownMyAppFrame();
		});

		opaTest("Should see the not found master and detail page if an invalid object id has been called", function (Given, When, Then) {
			// Arrangements
			Given.iStartTheApp({ hash : "/Objects/SomeInvalidObjectId" });

			//Actions
			When.onTheNotFoundPage.iLookAtTheScreen();

			// Assertions
			Then.onTheNotFoundPage.iShouldSeeTheObjectNotFoundPage().
				and.theNotFoundPageShouldSayObjectNotFound().
				and.iTeardownMyAppFrame();
		});

		opaTest("Should see the not found text for no search results", function (Given, When, Then) {
			// Arrangements
			Given.iStartTheApp();

			//Actions
			When.onTheMasterPage.iSearchForSomethingWithNoResults();

			// Assertions
			Then.onTheMasterPage.iShouldSeeTheNoDataTextForNoSearchResults().
				and.iTeardownMyAppFrame();
		});

	}
);
