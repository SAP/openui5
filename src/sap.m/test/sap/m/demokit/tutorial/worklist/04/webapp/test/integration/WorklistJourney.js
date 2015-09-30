sap.ui.define([], function() {
	"use strict";

	module("Worklist");

	opaTest("Should see the table with all entries", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheWorklistPage.iLookAtTheScreen();

		// Assertions
		Then.onTheWorklistPage.theTableShouldHaveAllEntries().
		and.theTableShouldContainOnlyFormattedUnitNumbers().
		and.theTitleShouldDisplayTheTotalAmountOfItems();
	});

	opaTest("Should be able to load 10 more items", function(Given, When, Then) {
		//Actions
		When.onTheWorklistPage.iPressOnMoreData();

		// Assertions
		Then.onTheWorklistPage.theTableShouldHaveTheDoubleAmountOfInitialEntries();
	});

	opaTest("Search for the First object should deliver results that contain the firstObject in the name", function(Given, When, Then) {
		//Actions
		When.onTheWorklistPage.iSearchForTheFirstObject();

		// Assertions
		Then.onTheWorklistPage.theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle();
	});

	opaTest("Entering something that cannot be found into search field and pressing search field's refresh should leave the list as it was",
		function(Given, When, Then) {
			//Actions
			When.onTheWorklistPage.iTypeSomethingInTheSearchThatCannotBeFound().
			and.iTriggerRefresh();

			// Assertions
			Then.onTheWorklistPage.theTableHasEntries().and.iTeardownMyAppFrame();
		});

	opaTest("Should see the busy indicator on app view while worklist view metadata is loaded", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			delay: 5000
		});

		//Actions
		When.onTheWorklistPage.iLookAtTheScreen();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicatorForTheWholeApp();
	});

	opaTest("Should see the busy indicator on worklist table after metadata is loaded", function(Given, When, Then) {
		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheWorklistTableBusyIndicator().
		and.iTeardownMyAppFrame();
	});

});