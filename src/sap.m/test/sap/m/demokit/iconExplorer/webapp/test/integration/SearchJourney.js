/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	QUnit.module("Search");

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

	opaTest("Search for the 'copy' icon by its unicode should result in the 'copy' icon being displayed in the table", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iClearTheSearch().
		and.iSearchForValueWithEnter("xe245");

		// Assertions
		Then.onTheOverviewPage.theTableContainsOnlyTheIcon("copy");
	});

	opaTest("Entering something that cannot be found into search field and pressing search field's refresh should leave the list as it was", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iTypeSomethingInTheSearchThatCannotBeFoundAndTriggerRefresh();

		// Assertions
		Then.onTheOverviewPage.theTableHasEntries();
	});

	opaTest("Clearing the search shows all items again", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iClearTheSearch();

		// Assertions
		Then.onTheOverviewPage.theTableShouldHaveAllEntries().
			and.iTeardownMyApp();
	});
});