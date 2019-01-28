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
		Given.iStartMyApp();

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
		Then.onTheAppPage.theAppShowsFCLDesign("MidColumnFullScreen");
		Then.onTheDetailPage.iShouldSeeTheFullScreenToggleButton("exitFullScreen");
	});

	opaTest("Should press full screen toggle button: The app shows two columns", function (Given, When, Then) {
		// Actions
		When.onTheDetailPage.iPressTheHeaderActionButton("exitFullScreen");

		// Assertions
		Then.onTheAppPage.theAppShowsFCLDesign("TwoColumnsMidExpanded");
		Then.onTheDetailPage.iShouldSeeTheFullScreenToggleButton("enterFullScreen");
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
		Then.onTheAppPage.theAppShowsFCLDesign("OneColumn");
		Then.onTheMasterPage.theListShouldHaveNoSelection();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Start the App and simulate metadata error: MessageBox should be shown", function (Given, When, Then) {
		//Arrangement
		Given.iStartMyApp({
			delay : 1000,
			metadataError : true
		});

		// Assertions
		Then.onTheAppPage.iShouldSeeTheMessageBox();

		// Actions
		When.onTheAppPage.iCloseTheMessageBox();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Start the App and simulate bad request error: MessageBox should be shown", function (Given, When, Then) {
		//Arrangement
		Given.iStartMyApp({
			delay : 1000,
			errorType : 'serverError'
		});

		// Assertions
		Then.onTheAppPage.iShouldSeeTheMessageBox();

		// Actions
		When.onTheAppPage.iCloseTheMessageBox();

		// Cleanup
		Then.iTeardownMyApp();
	});

});