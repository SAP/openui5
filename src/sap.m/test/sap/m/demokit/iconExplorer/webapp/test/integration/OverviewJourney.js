sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	QUnit.module("Overview");

	opaTest("Should see the results table with all entries", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyAppOnTheDetailsTab();

		//Actions
		When.onTheOverviewPage.iLookAtTheScreen();

		// Assertions
		Then.onTheOverviewPage.theTableShouldHaveAllEntries().
			and.theTitleShouldDisplayTheTotalAmountOfItems();
	});

	opaTest("Should be able to load 50 more items", function(Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnMoreData();

		// Assertions
		Then.onTheOverviewPage.theTableShouldHaveTheDoubleAmountOfInitialEntries();
	});

	opaTest("Marking an icon as a favorite should display a message toast", function (Given, When, Then) {
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

	opaTest("Search for the First object should deliver results that contain the firstObject in the name", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheTabWithTheKey("details").
			and.iSearchForTheFirstObject();

		// Assertions
		Then.onTheOverviewPage.theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle();
	});

	opaTest("Search for the First object and confirming with enter should deliver results that contain the name of the first object", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iClearTheSearch().
			and.iSearchForTheFirstObject(true);

		// Assertions
		Then.onTheOverviewPage.theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle();
	});

	opaTest("Entering something that cannot be found into search field and pressing search field's refresh should leave the list as it was", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iTypeSomethingInTheSearchThatCannotBeFoundAndTriggerRefresh();

		// Assertions
		Then.onTheOverviewPage.theTableHasEntries();
	});

	opaTest("Clearing the search shows all items again", function (Given, When, Then) {
		Given.iStartMyAppOnTheDetailsTab();
		//Actions
		When.onTheOverviewPage.iClearTheSearch();

		// Assertions
		Then.onTheOverviewPage.theTableShouldHaveAllEntries();
	});

	opaTest("Selecting a tag on the favorite tab should deliver results that contain the tag value", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iMarkAnIconAsFavorite("activate").
		and.iPressOnTheTabWithTheKey("favorites").
		and.iSelectTheTagWithName("magic");

		// Assertions
		Then.onTheOverviewPage.theTableShowsOnlyObjectsWithTheTag("magic", "fav");

		// Cleanup: remove favorite
		When.onTheOverviewPage.iMarkAnIconAsFavorite("activate");
	});

	opaTest("Selecting a tag on the details page should deliver results that contain the tag value", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheTabWithTheKey("details").
			and.iSelectTheTagWithName("data");

		// Assertions
		Then.onTheOverviewPage.theTableShowsOnlyObjectsWithTheTag("data");
	});

	opaTest("Selecting another tag on the details page should deliver results that contain the tag value", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iSelectTheTagWithName("analytics");

		// Assertions
		Then.onTheOverviewPage.theTableShowsOnlyObjectsWithTheTag("analytics");
	});

	opaTest("Selecting a tag should deliver results that contain the tag value", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheTabWithTheKey("details").
			and.iSelectTheCategoryWithName("Objects");

		// Assertions
		Then.onTheOverviewPage.theTableShowsTheCategory("Objects").
			and.iTeardownMyAppFrame();
	});

});