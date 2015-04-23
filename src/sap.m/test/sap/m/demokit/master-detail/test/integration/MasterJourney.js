/*global opaTest*/
//declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.require(
[],
function () {
	"use strict";

	QUnit.module("Master List");

	opaTest("Should see the master list with all entries", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheApp();

		//Actions
		When.onTheMasterPage.iLookAtTheScreen();

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheList().
			and.theListShouldHaveAllEntries()
			.and.theHeaderShouldDisplayAllEntries();
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

	opaTest("MasterList Sorting on UnitNumber", function(Given, When, Then) {
		// Actions
		When.onTheMasterPage.iClearTheSearch().
			and.iSortTheListOnUnitNumber();

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
			and.iSelectListItemInViewSettingsDialog("Unit Number").
			and.iSelectListItemInViewSettingsDialog("<100 UoM").
			and.iPressOKInViewSelectionDialog();

		// Assertion
		Then.onTheMasterPage.theMasterListShouldBeFilteredOnUnitNumberValueLessThanTheGroupBoundary();
	});

	opaTest("MasterList Filtering on UnitNumber more than 100", function(Given, When, Then) {
		// Action
		When.onTheMasterPage.iOpenViewSettingsDialog().
			and.iSelectListItemInViewSettingsDialog(">100 UoM").
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
				and.theListShouldHaveAllEntries().
				and.iTeardownMyAppFrame();
		});
	});
