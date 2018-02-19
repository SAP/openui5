/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	QUnit.module("Search");

	opaTest("Search for the First object should deliver results that contain the firstObject in the name", function (Given, When, Then) {

		// Arrangements
		Given.iStartMyAppOnTheDetailsTab();

		//Actions
		When.onTheOverviewPage.iSearchForTheFirstObject();

		// Assertions
		Then.onTheOverviewPage.theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle();
	});

	opaTest("Search for the First object and confirming with enter should deliver results that contain the name of the first object", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iSearchForTheFirstObject(true);

		// Assertions
		Then.onTheOverviewPage.theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle();
	});

	opaTest("Search for the 'copy' icon by its unicode should result in the 'copy' icon being displayed in the table", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iSearchForValueWithEnter("xe245");

		// Assertions
		Then.onTheOverviewPage.theTableContainsOnlyTheIcon("copy");
	});

	opaTest("Entering something that cannot be found into search field and pressing search field's refresh should show empty list", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iSearchForSomethingWithNoResults();

		// Assertions
		Then.onTheOverviewPage.theTableHasNoEntries();
	});

	opaTest("Clearing the search shows all items again", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iClearTheSearch();

		// Assertions
		Then.onTheOverviewPage.theTableShouldHaveAllEntries();
		Then.iTeardownMyApp();
	});
});