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
			Then.onTheWorklistPage.theTableShouldHaveTheDoubleAmountOfInitialEntries().
				and.iTeardownMyAppFrame();
		});

	});
