/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/NotFound",
	"./pages/Master"
], function (opaTest) {
	"use strict";

	QUnit.module("Phone not found");

	opaTest("Should see the not found page if the hash is something that matches no route", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({hash: "somethingThatDoesNotExist"});

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeTheNotFoundPage().
			and.theNotFoundPageShouldSayResourceNotFound();
	});

	opaTest("Should end up on the master list, if the back button is pressed", function (Given, When, Then) {
		// Actions
		When.onTheNotFoundPage.iPressTheBackButton("NotFound");

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheList();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Should see the not found detail page if an invalid object id has been called", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({ hash: "/Orders/SomeInvalidObjectId" });

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeTheObjectNotFoundPage().
			and.theNotFoundPageShouldSayObjectNotFound();
	});

	opaTest("Should end up on the master list, if the back button is pressed", function (Given, When, Then) {
		// Actions
		When.onTheNotFoundPage.iPressTheBackButton("DetailObjectNotFound");

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheList();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Should see the not found text for no search results", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Actions
		When.onTheMasterPage.iSearchForNotFound();

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheNoDataText();

		// Cleanup
		Then.iTeardownMyApp();
	});

});