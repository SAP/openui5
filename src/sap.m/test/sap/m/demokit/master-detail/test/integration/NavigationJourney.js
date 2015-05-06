/*global opaTest*/
//declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.require(
[],
function () {
	"use strict";

	QUnit.module("Desktop navigation");

	opaTest("Should start the app with empty hash: the hash should reflect the selection of the first item in the list", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheApp();

		//Actions
		When.onTheMasterPage.iRememberTheSelectedItem();

		// Assertions
		Then.onTheMasterPage.theFirstItemShouldBeSelected();
		Then.onTheDetailPage.iShouldSeeTheRememberedObject().and.iShouldSeeNoBusyIndicator();
		Then.onTheBrowserPage.iShouldSeeTheHashForTheRememberedObject();
	});

	opaTest("Should react on hashchange", function (Given, When, Then) {
		// Actions
		When.onTheMasterPage.iRememberTheIdOfListItemAtPosition(3);
		When.onTheBrowserPage.iChangeTheHashToTheRememberedId();

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheRememberedObject().and.iShouldSeeNoBusyIndicator();
		Then.onTheMasterPage.theRememberedListItemShouldBeSelected();
	});


	opaTest("Should navigate on press", function (Given, When, Then) {
		// Actions
		When.onTheMasterPage.iRememberTheIdOfListItemAtPosition(2).
			and.iPressOnTheObjectAtPosition(2);

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheRememberedObject();
	});

	opaTest("Detail Page Shows Object Details", function (Given, When, Then) {
		// Actions
		When.onTheDetailPage.iLookAtTheScreen();

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheObjectLineItemsList().
			and.theLineItemsListShouldHaveTheCorrectNumberOfItems().
			and.theLineItemsHeaderShouldDisplayTheAmountOfEntries();

	});

	opaTest("Navigate directly to an object not on the client with hash: no item should be selected and the object page should be displayed", function (Given, When, Then) {
		//Actions
		When.onTheMasterPage.iRememberAnIdOfAnObjectThatsNotInTheList();
		When.onTheBrowserPage.iReloadMyAppWithTheRememberedId();

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheRememberedObjectId();
		Then.onTheMasterPage.theListShouldHaveNoSelection().
			and.iTeardownMyAppFrame();
	});
	opaTest("Start the App and simulate metadata error: MessageBox should be shown", function (Given, When, Then) {
		//Arrangement
		Given.iStartMyAppOnADesktopToTestErrorHandler("metadataError=true");

		//Actions
		When.onTheAppPage.iWaitUntilTheMessageBoxIsShown("metadataErrorMessageBox");

		// Assertions
		Then.iTeardownMyAppFrame();

	});

	opaTest("Start the App and simulate bad request error: MessageBox should be shown", function (Given, When, Then) {
		//Arrangement
		Given.iStartMyAppOnADesktopToTestErrorHandler("errorType=serverError");

		//Actions
		When.onTheAppPage.iWaitUntilTheMessageBoxIsShown("serviceErrorMessageBox");

		// Assertions
		Then.iTeardownMyAppFrame();
	});

});
