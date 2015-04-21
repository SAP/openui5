/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

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
			and.theListShouldHaveAllEntries();
	});

	opaTest("Search for 'Object 2' should deliver exactly two results", function (Given, When, Then) {
		//Actions
		When.onTheMasterPage.iSearchForObject2();

		// Assertions
		Then.onTheMasterPage.theListShowsObject2().
			and.theListShouldHaveNEntries(2);
	});


	opaTest("Entering 'Object 3' into search field and pressing search field's refresh should leave the list as it was", function (Given, When, Then) {
		//Actions
		When.onTheMasterPage.iEnterObject3InTheSearchField().
			and.iTriggerRefresh();

		// Assertions
		Then.onTheMasterPage.theListShowsObject2().
			and.theListShouldHaveNEntries(2);
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
		Then.onTheMasterPage.theListShouldBeFilteredOnUnitNumberValue();
	});

	opaTest("MasterList Filtering on UnitNumber more than 100", function(Given, When, Then) {
		// Action
		When.onTheMasterPage.iOpenViewSettingsDialog().
			and.iSelectListItemInViewSettingsDialog(">100 UoM").
			and.iPressOKInViewSelectionDialog();

		// Assertion
		Then.onTheMasterPage.theListShouldBeFilteredOnUnitNumberValue();
	});

	opaTest("MasterList remove filter should display all items", function(Given, When, Then) {
		// Action
		When.onTheMasterPage.iOpenViewSettingsDialog().
			and.iPressResetInViewSelectionDialog().
			and.iPressOKInViewSelectionDialog();

		// Assertion
		Then.onTheMasterPage.theListShouldHaveAllEntries();
	});

	opaTest("MasterList grouping delivers a group with one member and a group with 8 members", function(Given, When, Then) {
		// Action
		When.onTheMasterPage.iGroupTheList();

		// Assertion
		Then.onTheMasterPage.theListShouldContainGroup20OrLess().
			and.theListShouldContainGroup20OrMore().
			and.theListGroupShouldBeFilteredOnUnitNumberValue20OrLess();
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
