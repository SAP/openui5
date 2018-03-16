/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	QUnit.module("NotFound");

	/* page not found tests */
	opaTest("Should see the resource not found page when changing to an invalid hash", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iWaitUntilTheTableIsLoaded();
		When.onTheBrowser.iChangeTheHashToSomethingInvalid();

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeResourceNotFound();
	});

	opaTest("Clicking the 'Show icons' link on the 'Resource not found' page should bring me back to the overview", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();
		When.onTheNotFoundPage.iPressTheNotFoundShowOverviewLink();

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheTable();
	});

	opaTest("Clicking the back button should take me back to the not found page", function (Given, When, Then) {
		//Actions
		When.onTheBrowser.iPressOnTheBackwardsButton();

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeResourceNotFound().
		and.iTeardownMyApp();
	});

	/* no data text tests for all 4 tabs */
	opaTest("Should see the not found text for no search results on the details tab", function (Given, When, Then) {
		//Arrangement
		Given.iStartMyAppOnTheDetailsTab();

		//Actions
		When.onTheOverviewPage.iSearchForSomethingWithNoResults();

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheNoDataTextForNoSearchResults();
	});

	opaTest("Should see the not found text for no search results on the grid tab", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheTabWithTheKey("grid");

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheNoDataTextForNoSearchResults();
	});

	opaTest("Should see the not found text for no search results on the visual tab", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheTabWithTheKey("visual");

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheNoDataTextForNoSearchResults();
	});

	opaTest("Should see the not found text for no search results on the favorites tab", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheTabWithTheKey("favorites");

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheNoDataTextForNoSearchResults();
	});

	opaTest("Should see the 'error' icon on the preview pane when an invalid icon was set in the hash", function (Given, When, Then) {

		//Actions
		When.onTheBrowser.iChangeTheHashParameter("icon", "xXxXx");

		// Assertions
		Then.onThePreviewPage.iShouldSeeThePreviewArea().
			and.iShouldSeeTheIcon("error").
			and.iTeardownMyApp();
	});

});