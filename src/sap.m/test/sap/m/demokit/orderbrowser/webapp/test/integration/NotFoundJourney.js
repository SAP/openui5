/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Master",
	"./pages/NotFound",
	"./pages/Browser"
], function (opaTest) {
	"use strict";

	QUnit.module("Desktop not found");

	opaTest("Should see the resource not found page when navigating to an invalid hash", function (Given, When, Then) {
		//Arrangement
		Given.iStartMyApp();

		//Actions
		When.onTheMasterPage.iWaitUntilTheListIsLoaded();
		When.onTheBrowserPage.iChangeTheHashToSomethingInvalid();

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeTheNotFoundPage().
			and.theNotFoundPageShouldSayResourceNotFound();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Should see the not found master and detail page if an invalid object id has been called", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({ hash: "/Orders/SomeInvalidObjectId" });

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeTheObjectNotFoundPage().
			and.theNotFoundPageShouldSayObjectNotFound();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Should see the not found text for no search results", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheMasterPage.iSearchForNotFound();

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheNoDataText();

		// Cleanup
		Then.iTeardownMyApp();
	});

});