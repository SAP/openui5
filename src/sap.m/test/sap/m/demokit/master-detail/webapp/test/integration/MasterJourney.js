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
				and.theHeaderShouldDisplayAllEntries().
				and.theListShouldContainOnlyFormattedUnitNumbers();
		});

		opaTest("Search for the First object should deliver results that contain the firstObject in the name", function (Given, When, Then) {
			//Actions
			When.onTheMasterPage.iSearchForTheFirstObject();

			// Assertions
			Then.onTheMasterPage.theListShowsOnlyObjectsWithTheSearchStringInTheirTitle();
		});

		opaTest("Entering something that cannot be found into search field and pressing search field's refresh should leave the list as it was", function (Given, When, Then) {
			//Actions
			When.onTheMasterPage.iTypeSomethingInTheSearchThatCannotBeFound().
				and.iTriggerRefresh();

			// Assertions
			Then.onTheMasterPage.theListHasEntries();
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
			Then.onTheMasterPage.theListShouldHaveAllEntries();
		});

		opaTest("MasterList Sorting on UnitNumber", function(Given, When, Then) {
			// Actions
			When.onTheMasterPage.iSortTheListOnUnitNumber();

			// Assertions
			Then.onTheMasterPage.theListShouldBeSortedAscendingOnUnitNumber();
		});

		opaTest("MasterList Sorting on Name", function(Given, When, Then) {
			// Actions
			When.onTheMasterPage.iSortTheListOnName();

			// Assertions
			Then.onTheMasterPage.theListShouldBeSortedAscendingOnName();
		});

		opaTest("MasterList Filtering on UnitNumber less than 100", function(Given, When, Then) {

			// Action
			When.onTheMasterPage.iOpenViewSettingsDialog().
				and.iSelectListItemInViewSettingsDialog("UnitNumber").
				and.iSelectListItemInViewSettingsDialog("<100 UnitOfMeasure").
				and.iPressOKInViewSelectionDialog();

			// Assertion
			Then.onTheMasterPage.theMasterListShouldBeFilteredOnUnitNumberValueLessThanTheGroupBoundary();
		});

		opaTest("MasterList Filtering on UnitNumber more than 100", function(Given, When, Then) {
			// Action
			When.onTheMasterPage.iOpenViewSettingsDialog().
				and.iSelectListItemInViewSettingsDialog(">100 UnitOfMeasure").
				and.iPressOKInViewSelectionDialog();

			// Assertion
			Then.onTheMasterPage.theMasterListShouldBeFilteredOnUnitNumberValueMoreThanTheGroupBoundary();
		});

		opaTest("MasterList remove filter should display all items", function(Given, When, Then) {
			// Action
			When.onTheMasterPage.iOpenViewSettingsDialog().
				and.iPressResetInViewSelectionDialog().
				and.iPressOKInViewSelectionDialog();

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
			When.onTheMasterPage.iRemoveListGrouping();

			// Assertion
			Then.onTheMasterPage.theListShouldNotContainGroupHeaders().
				and.theListShouldHaveAllEntries();
		});

		opaTest("Grouping the master list and filtering it by the object identifier should deliver the initial list", function(Given, When, Then) {
			// Action
			When.onTheMasterPage.iGroupTheList().
				and.iSortTheListOnName();

			// Assertion
			Then.onTheMasterPage.theListShouldNotContainGroupHeaders().
				and.iTeardownMyAppFrame();
		});

	}
);