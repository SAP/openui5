/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	QUnit.module("Desktop navigation");

	opaTest("Should start the app with empty hash: the hash should reflect the selection of the first item in the list", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheApp();
		//Actions
		When.onTheMasterPage.iRememberTheSelectedItem();

		// Assertions
		Then.onTheMasterPage.theFirstItemShouldBeSelected();
		Then.onTheBrowserPage.iShouldSeeTheHashForTheRememberedObject();
	});

	opaTest("Should navigate on press", function (Given, When, Then) {
		// Actions
		When.onTheMasterPage.iRememberTheIdOfListItemAtPosition(1).
			and.iPressOnTheObjectAtPosition(1);

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheRememberedObject().
			and.iShouldSeeHeaderActionButtons();
	});

	opaTest("Should press full screen toggle button: The app shows one column", function (Given, When, Then) {
		// Actions
		When.onTheDetailPage.iPressTheHeaderActionButton("fullScreenToggle");

		// Assertions
		Then.onTheDetailPage.theAppShowsFCLDesing("MidColumnFullScreen");
	});

	opaTest("Should press full screen toggle button: The app shows two columns", function (Given, When, Then) {
		// Actions
		When.onTheDetailPage.iPressTheHeaderActionButton("fullScreenToggle");

		// Assertions
		Then.onTheDetailPage.theAppShowsFCLDesing("TwoColumnsMidExpanded");
	});

	opaTest("Should react on hash change", function (Given, When, Then) {
		// Actions
		When.onTheMasterPage.iRememberTheIdOfListItemAtPosition(2);
		When.onTheBrowserPage.iChangeTheHashToTheRememberedItem();

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheRememberedObject().and.iShouldSeeNoBusyIndicator();
		Then.onTheMasterPage.theRememberedListItemShouldBeSelected();
	});

	opaTest("Detail Page Shows Object Details", function (Given, When, Then) {
		// Actions
		When.onTheDetailPage.iLookAtTheScreen();
		// Assertions
		Then.onTheDetailPage.iShouldSeeTheObjectLineItemsList().
			and.theDetailViewShouldContainOnlyFormattedUnitNumbers().
			and.theLineItemsListShouldHaveTheCorrectNumberOfItems().
			and.theLineItemsHeaderShouldDisplayTheAmountOfEntries().
			and.theLineItemsTableShouldContainOnlyFormattedUnitNumbers();

	});

	opaTest("Navigate to an object not on the client: no item should be selected and the object page should be displayed", function (Given, When, Then) {
		//Actions
		When.onTheMasterPage.iRememberAnIdOfAnObjectThatsNotInTheList();
		When.onTheBrowserPage.iChangeTheHashToTheRememberedItem();

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheRememberedObject();
	});

	opaTest("Should press close column button: The app shows one columns", function (Given, When, Then) {
		// Actions
		When.onTheDetailPage.iPressTheHeaderActionButton("closeColumn");

		// Assertions
		Then.onTheDetailPage.theAppShowsFCLDesing("OneColumn");

		// Cleanup
		Then.iTeardownMyAppFrame();
	});

	opaTest("Start the App and simulate metadata error: MessageBox should be shown", function (Given, When, Then) {
		//Arrangement
		Given.iStartMyAppOnADesktopToTestErrorHandler("metadataError=true");

		// Assertions
		Then.onTheAppPage.iShouldSeeTheMessageBox();

		// Cleanup
		Then.iTeardownMyAppFrame();
	});

	opaTest("Start the App and simulate bad request error: MessageBox should be shown", function (Given, When, Then) {
		//Arrangement
		Given.iStartMyAppOnADesktopToTestErrorHandler("errorType=serverError");

		// Assertions
		Then.onTheAppPage.iShouldSeeTheMessageBox();

		// Cleanup
		Then.iTeardownMyAppFrame();
	});

});