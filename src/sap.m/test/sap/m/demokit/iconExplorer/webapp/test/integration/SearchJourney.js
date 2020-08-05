/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Overview"
], function (opaTest) {
	"use strict";

	QUnit.module("Search");

	opaTest("Search for the First object should deliver results that contain the firstObject in the name", function (Given, When, Then) {
		Given.iStartMyApp({
			hash: "/overview/SAP-icons"
		});
		//Actions
		When.onTheOverviewPage.iPressOnTheTabWithTheKey("details").
		and.iSearchForTheFirstObject();

		// Assertions
		Then.onTheOverviewPage.theTableShouldShowOnlyObjectsWithTheSearchStringInTheirTitle();
	});

	opaTest("Search for the First object and confirming with enter should deliver results that contain the name of the first object", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iClearTheSearch().
		and.iSearchForTheFirstObject(true);

		// Assertions
		Then.onTheOverviewPage.theTableShouldShowOnlyObjectsWithTheSearchStringInTheirTitle();
	});

	opaTest("Search for the 'copy' icon by its unicode should result in the 'copy' icon being displayed in the table", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iClearTheSearch().
		and.iSearchForValueWithEnter("xe245");

		// Assertions
		Then.onTheOverviewPage.theTableShouldContainOnlyTheIcon("copy");
	});

	opaTest("Entering something that cannot be found into search field should leave the list as it was", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iTypeSomethingInTheSearchThatCannotBeFound();

		// Assertions
		Then.onTheOverviewPage.theTableShouldHaveNoEntries();
	});

	opaTest("Clearing the search shows all items again", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iClearTheSearch();

		// Assertions
		Then.onTheOverviewPage.theTableShouldHaveAllEntries();

		// Cleanup
		Then.iTeardownMyApp();
	});
});