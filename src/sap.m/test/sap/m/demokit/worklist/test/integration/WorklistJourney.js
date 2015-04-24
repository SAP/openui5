/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
[],
function () {
	"use strict";

	module("Worklist");

	opaTest("Should see the table with all entries", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheWorklistPage.iLookAtTheScreen();

		// Assertions
		Then.onTheWorklistPage.theTableShouldHaveAllEntries().
			and.theTitleShouldDisplayTheTotalAmountOfItems();
	});

	opaTest("Should be able to load 10 more items", function (Given, When, Then) {
		//Actions
		When.onTheWorklistPage.iPressOnMoreData();

		// Assertions
		Then.onTheWorklistPage.theTableShouldHaveTheDoubleAmountOfInitialEntries();
	});

	opaTest("Should open the share menu and display the share buttons", function (Given, When, Then) {
		// Actions
		When.onTheWorklistPage.iPressOnTheShareButton();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheShareEmailButton().
			and.iTeardownMyAppFrame();
	});

	opaTest("Should see the busy indicator on app view while worklist view metadata is loaded", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			delay: 5000
		});

		//Actions
		When.onTheWorklistPage.iLookAtTheScreen();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicatorForTheWholeApp();
	});

	opaTest("Should see the busy indicator on worklist table after metadata is loaded", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheWorklistTableBusyIndicator().
			and.iTeardownMyAppFrame();
	});


});
