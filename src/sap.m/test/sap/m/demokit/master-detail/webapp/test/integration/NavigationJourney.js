/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Master",
	"./pages/Detail",
	"./pages/Browser",
	"./pages/App"
], function (opaTest) {
	"use strict";

	QUnit.module("Desktop navigation");

	opaTest("Should navigate on press", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheApp();

		// Actions
		When.onTheMasterPage.iRememberTheIdOfListItemAtPosition(1).
			and.iPressOnTheObjectAtPosition(1);

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheRememberedObject().
			and.iShouldSeeHeaderActionButtons();
		Then.onTheBrowserPage.iShouldSeeTheHashForTheRememberedObject();
	});

	opaTest("Should press full screen toggle button: The app shows one column", function (Given, When, Then) {
		// Actions
		When.onTheDetailPage.iPressTheHeaderActionButton("enterFullScreen");

		// Assertions
		Then.onTheDetailPage.theAppShowsFCLDesign("MidColumnFullScreen").
			and.iShouldSeeTheFullScreenToggleButton("exitFullScreen");
	});

	opaTest("Should press full screen toggle button: The app shows two columns", function (Given, When, Then) {
		// Actions
		When.onTheDetailPage.iPressTheHeaderActionButton("exitFullScreen");

		// Assertions
		Then.onTheDetailPage.theAppShowsFCLDesign("TwoColumnsMidExpanded").
			and.iShouldSeeTheFullScreenToggleButton("enterFullScreen");
	});

	opaTest("Should react on hash change", function (Given, When, Then) {
		// Actions
		When.onTheMasterPage.iRememberTheIdOfListItemAtPosition(1);
		When.onTheBrowserPage.iChangeTheHashToTheRememberedItem();

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheRememberedObject().and.iShouldSeeNoBusyIndicator();
		Then.onTheMasterPage.theRememberedListItemShouldBeSelected();
	});


	opaTest("Detail Page Shows Object Details", function (Given, When, Then) {

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheObjectLineItemsList().
			and.theDetailViewShouldContainOnlyFormattedUnitNumbers().
			and.theLineItemsListShouldHaveTheCorrectNumberOfItems().
			and.theLineItemsHeaderShouldDisplayTheAmountOfEntries();

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
		Then.onTheDetailPage.theAppShowsFCLDesign("OneColumn");
		Then.onTheMasterPage.theListShouldHaveNoSelection();

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