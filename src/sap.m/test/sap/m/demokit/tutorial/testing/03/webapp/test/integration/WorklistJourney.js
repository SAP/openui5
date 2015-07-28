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
				and.theTitleShouldDisplayTheTotalAmountOfItems().
				and.iTeardownMyAppFrame();
		});

	});
