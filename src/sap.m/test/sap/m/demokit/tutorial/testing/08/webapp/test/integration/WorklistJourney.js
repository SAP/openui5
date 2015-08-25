sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("Posts");

		opaTest("Should see the table with all Posts", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();

			//Actions
			When.onTheWorklistPage.iLookAtTheScreen();

			// Assertions
			Then.onTheWorklistPage.theTitleShouldDisplayTheTotalAmountOfItems();
		});

		opaTest("Should be able to load more items", function (Given, When, Then) {
			//Actions
			When.onTheWorklistPage.iPressOnMoreData();

			// Assertions
			Then.onTheWorklistPage.theTableShouldHaveAllEntries().
				and.iTeardownMyAppFrame();
		});
	}
);
