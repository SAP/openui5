/*global opaTest */
//declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
	[],
	function () {
		"use strict";

		QUnit.module("Navigation");

		opaTest("Should see the objects list", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();

			//Actions
			When.onTheWorklistPage.iLookAtTheScreen();

			// Assertions
			Then.onTheWorklistPage.iShouldSeeTheTable();
		});

		opaTest("Should react on hashchange", function (Given, When, Then) {
			// Actions
			When.onTheWorklistPage.iRememberTheItemAtPosition(7);
			When.onTheBrowser.iChangeTheHashToTheRememberedItem();

			// Assertions
			Then.onTheObjectPage.iShouldSeeTheRememberedObject();
		});

		opaTest("Should go back to the TablePage", function (Given, When, Then) {
			// Actions
			When.onTheObjectPage.iPressTheBackButton();

			// Assertions
			Then.onTheWorklistPage.iShouldSeeTheTable();
		});

		opaTest("Object Page shows the correct object Details", function (Given, When, Then) {
			// Actions
			When.onTheWorklistPage.iRememberTheItemAtPosition(1).
				and.iPressATableItemAtPosition(1);

			// Assertions
			Then.onTheObjectPage.iShouldSeeTheRememberedObject();
		});

		opaTest("Should be on the table page again when browser back is pressed", function (Given, When, Then) {
			// Actions
			When.onTheBrowser.iPressOnTheBackwardsButton();

			// Assertions
			Then.onTheWorklistPage.iShouldSeeTheTable();
		});

		opaTest("Should be on the object page again when browser forwards is pressed", function (Given, When, Then) {
			// Actions
			When.onTheBrowser.iPressOnTheForwardsButton();

			// Assertions
			Then.onTheObjectPage.iShouldSeeTheRememberedObject().
				and.iTeardownMyAppFrame();
		});

	}
);
