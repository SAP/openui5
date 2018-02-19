/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	QUnit.module("Worklist");

	opaTest("Should see the table with all entries", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheWorklistPage.iLookAtTheScreen();

		// Assertions
		Then.onTheWorklistPage.theTableShouldHaveAllEntries().
			and.theTableShouldContainOnlyFormattedUnitNumbers().
			and.theTitleShouldDisplayTheTotalAmountOfItems();
	});

	opaTest("Search for the First object should deliver results that contain the firstObject in the name", function (Given, When, Then) {
		//Actions
		When.onTheWorklistPage.iSearchForTheFirstObject();

		// Assertions
		Then.onTheWorklistPage.theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle();
	});

	opaTest("Entering something that cannot be found into search field and pressing search field's refresh should show empty list", function (Given, When, Then) {
		//Actions
		When.onTheWorklistPage.iSearchForSomethingWithNoResults();

		// Assertions
		Then.onTheWorklistPage.theTableHasNoEntries().
			and.iTeardownMyAppFrame();
	});

	opaTest("Should see the busy indicator on app view while worklist view metadata is loaded", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			delay: 5000
		});

		//Actions
		When.onTheWorklistPage.iLookAtTheScreen();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicatorForTheWholeApp();
	});

	opaTest("Should see the busy indicator on worklist table after metadata is loaded", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheWorklistTableBusyIndicator().
			and.iTeardownMyAppFrame();
	});

});