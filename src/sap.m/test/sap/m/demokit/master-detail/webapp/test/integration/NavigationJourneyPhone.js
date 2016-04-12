sap.ui.define([
		"sap/ui/test/opaQunit"
	], function (opaTest) {
		"use strict";

		QUnit.module("Phone navigation");

		opaTest("Should see the objects list", function (Given, When, Then) {
			// Arrangements
			Given.iStartTheApp();

			//Actions
			When.onTheMasterPage.iLookAtTheScreen();

			// Assertions
			Then.onTheMasterPage.iShouldSeeTheList();
			Then.onTheBrowserPage.iShouldSeeAnEmptyHash();
		});

		opaTest("Should react on hashchange", function (Given, When, Then) {
			// Actions
			When.onTheMasterPage.iRememberTheIdOfListItemAtPosition(3);
			When.onTheBrowserPage.iChangeTheHashToTheRememberedItem();

			// Assertions
			Then.onTheDetailPage.iShouldSeeTheRememberedObject();
		});

		opaTest("Detail Page Shows Object Details", function (Given, When, Then) {
			// Actions
			When.onTheDetailPage.iLookAtTheScreen();

			// Assertions
			Then.onTheDetailPage.iShouldSeeTheObjectLineItemsList().
				and.theLineItemsListShouldHaveTheCorrectNumberOfItems().
				and.theLineItemsHeaderShouldDisplayTheAmountOfEntries();
		});

		opaTest("Should navigate on press", function (Given, When, Then) {
			// Actions
			When.onTheDetailPage.iPressTheBackButton();
			When.onTheMasterPage.iRememberTheIdOfListItemAtPosition(2).
				and.iPressOnTheObjectAtPosition(2);

			// Assertions
			Then.onTheDetailPage.iShouldSeeTheRememberedObject().
				and.iTeardownMyAppFrame();
		});

	}
);