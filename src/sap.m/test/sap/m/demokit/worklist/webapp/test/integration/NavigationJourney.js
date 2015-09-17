sap.ui.define([
		"sap/ui/test/opaQunit"
	], function (opaTest) {
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
			When.onTheWorklistPage.iRememberTheItemAtPosition(2);
			When.onTheBrowser.iChangeTheHashToTheRememberedItem();

			// Assertions
			Then.onTheObjectPage.iShouldSeeTheRememberedObject().
				and.theViewIsNotBusyAnymore();
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

		opaTest("Should see a busy indication while loading the metadata", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp({
				delay: 10000
			});

			//Actions
			When.onTheWorklistPage.iLookAtTheScreen();

			// Assertions
			Then.onTheAppPage.iShouldSeeTheBusyIndicatorForTheWholeApp().
				and.iTeardownMyAppFrame();
		});


		opaTest("Start the App and simulate metadata error: MessageBox should be shown", function (Given, When, Then) {
			//Arrangement
			Given.iStartMyAppOnADesktopToTestErrorHandler("metadataError=true");

			//Assertions
			Then.onTheAppPage.iShouldSeeTheMessageBox("metadataErrorMessageBox").
				and.iTeardownMyAppFrame();

		});

		opaTest("Start the App and simulate bad request error: MessageBox should be shown", function (Given, When, Then) {
			//Arrangement
			Given.iStartMyAppOnADesktopToTestErrorHandler("errorType=serverError");

			//Assertions
			Then.onTheAppPage.iShouldSeeTheMessageBox("serviceErrorMessageBox").
				and.iTeardownMyAppFrame();

		});

	}
);
