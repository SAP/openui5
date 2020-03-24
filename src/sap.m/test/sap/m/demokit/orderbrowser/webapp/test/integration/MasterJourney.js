/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Master"
], function (opaTest) {
	"use strict";

	QUnit.module("Master List");

	opaTest("Should see the master list with all entries", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheList().
			and.theListShouldHaveAllEntries().
			and.theHeaderShouldDisplayAllEntries();
	});

	opaTest("Search for the First object should deliver results that contain the firstObject in the name", function (Given, When, Then) {
		var sSearch = "B";
		//Actions
		When.onTheMasterPage.iSearchFor(sSearch);

		// Assertions
		Then.onTheMasterPage.theListShowsOnlyObjectsContaining(sSearch);
	});

	opaTest("Entering something that cannot be found into search field and pressing search field's refresh should leave the list as it was", function (Given, When, Then) {
		//Actions
		When.onTheMasterPage.iSearchForNotFound()
			.and.iClearTheSearch();

		// Assertions
		Then.onTheMasterPage.theListHasEntries();
	});

	opaTest("Entering something that cannot be found into search field and pressing 'search' should display the list's 'not found' message", function (Given, When, Then) {
		//Actions
		When.onTheMasterPage.iSearchForNotFound();

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheNoDataText().
			and.theListHeaderDisplaysZeroHits();
	});

	opaTest("Should display items again if the searchfield is emptied", function (Given, When, Then) {
		//Actions
		When.onTheMasterPage.iClearTheSearch();

		// Assertions
		Then.onTheMasterPage.theListShouldHaveAllEntries();
	});

	opaTest("MasterList Filtering on Shipped Orders", function(Given, When, Then) {
		// Action
		When.onTheMasterPage.iFilterTheListOn("Only Shipped Orders");

		// Assertion
		Then.onTheMasterPage.theListShouldBeFilteredOnShippedOrders();
	});

	opaTest("MasterList remove filter should display all items", function(Given, When, Then) {
		// Action
		When.onTheMasterPage.iResetFilters();

		// Assertion
		Then.onTheMasterPage.theListShouldHaveAllEntries();
	});

	opaTest("MasterList grouping created group headers", function(Given, When, Then) {
		// Action
		When.onTheMasterPage.iGroupTheList();

		// Assertion
		Then.onTheMasterPage.theListShouldContainAGroupHeader();
	});

	opaTest("Remove grouping from MasterList delivers initial list", function(Given, When, Then) {
		// Action
		When.onTheMasterPage.iResetGrouping();

		// Assertion
		Then.onTheMasterPage.theListShouldNotContainGroupHeaders().
			and.theListShouldHaveAllEntries();

		// Cleanup
		Then.iTeardownMyApp();
	});
});