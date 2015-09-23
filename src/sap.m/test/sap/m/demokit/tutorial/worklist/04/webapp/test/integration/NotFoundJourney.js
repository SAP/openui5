sap.ui.define([], function() {
	"use strict";

	QUnit.module("NotFound");

	opaTest("Should see the resource not found page when changing to an invalid hash", function(Given, When, Then) {
		//Arrangement
		Given.iStartMyApp();

		//Actions
		When.onTheWorklistPage.iWaitUntilTheTableIsLoaded();
		When.onTheBrowser.iChangeTheHashToSomethingInvalid();

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeResourceNotFound();
	});

	opaTest("Clicking the 'Show my worklist' link on the 'Resource not found' page should bring me back to the worklist", function(Given,
		When, Then) {
		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();
		When.onTheNotFoundPage.iPressTheNotFoundShowWorklistLink();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheTable();
	});

	opaTest("Should see the not found text for no search results", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheWorklistPage.iSearchForSomethingWithNoResults();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheNoDataTextForNoSearchResults();
	});

	opaTest("Clicking the back button should take me back to the not found page", function(Given, When, Then) {
		//Actions
		When.onTheBrowser.iPressOnTheBackwardsButton();

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeResourceNotFound().
		and.iTeardownMyAppFrame();
	});

	opaTest("Should see the 'Object not found' page if an invalid object id has been called", function(Given, When, Then) {
		Given.iStartMyApp({
			hash: "/Products/SomeInvalidObjectId"
		});

		//Actions
		When.onTheNotFoundPage.iLookAtTheScreen();

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeObjectNotFound();
	});

	opaTest("Clicking the 'Show my worklist' link on the 'Object not found' page should bring me back to the worklist", function(Given, When,
		Then) {
		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();
		When.onTheNotFoundPage.iPressTheObjectNotFoundShowWorklistLink();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheTable().
		and.iTeardownMyAppFrame();
	});

});