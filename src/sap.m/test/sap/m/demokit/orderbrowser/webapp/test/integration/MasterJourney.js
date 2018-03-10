/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	QUnit.module("Master List");

	opaTest("Should see the master list with all entries", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheApp();

		//Actions
		When.onTheMasterPage.iLookAtTheScreen();

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
		Then.onTheMasterPage.theListShowsOnlyObjectsWithTheSearchString(sSearch);
	});

	opaTest("Entering something that cannot be found into search field and pressing search field's refresh should show empty list", function (Given, When, Then) {
		//Actions
		When.onTheMasterPage.iSearchForSomethingWithNoResults();

		// Assertions
		Then.onTheMasterPage.theListHasNoEntries();
	});

	opaTest("Entering something that cannot be found into search field and pressing 'search' should display the list's 'not found' message", function (Given, When, Then) {
		//Actions
		When.onTheMasterPage.iSearchForSomethingWithNoResults();

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheNoDataTextForNoSearchResults().
			and.theListHeaderDisplaysZeroHits();
	});

	opaTest("Should display items again if the searchfield is emptied", function (Given, When, Then) {
		//Actions
		When.onTheMasterPage.iClearTheSearch();

		// Assertions
		Then.onTheMasterPage.theListShouldHaveAllEntries().
			and.iTeardownMyAppFrame();
	});


});