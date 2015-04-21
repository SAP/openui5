/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
[],
function () {
	"use strict";

	QUnit.module("Desktop navigation");

	opaTest("Should see the objects list", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheApp();

		//Actions
		When.onTheMasterPage.iLookAtTheScreen();

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheList().
			and.theListShouldHaveNEntries(10).
			and.theHeaderShouldDisplay20Entries();
		Then.onTheDetailPage.theObjectPageShowsTheFirstObject();
	});

	opaTest("Should react on hashchange", function (Given, When, Then) {
		// Actions
		When.onTheBrowserPage.iChangeTheHashToObjectN(10);

		// Assertions
		Then.onTheDetailPage.iShouldBeOnTheObjectNPage(10);
		Then.onTheMasterPage.theObjectNShouldBeSelectedInTheList(10);
	});


	opaTest("Should navigate on press", function (Given, When, Then) {
		// Actions
		When.onTheMasterPage.iPressOnTheObject1InList();

		// Assertions
		Then.onTheDetailPage.iShouldBeOnTheObjectNPage(1);
	});

	opaTest("Detail Page Shows Object Details", function (Given, When, Then) {
		// Actions
		When.onTheMasterPage.iPressOnTheObject1InList();

		// Assertions
		Then.onTheDetailPage.iShouldBeOnTheObjectNPage(1).
			and.iShouldSeeTheObjectLineItemsList().
			and.theLineItemsListShouldHave4Entries().
			and.theLineItemsHeaderShouldDisplay4Entries().
			and.theFirstLineItemHasIDLineItemID1().
			and.iTeardownMyAppFrame();

	});

	opaTest("Navigate directly to an object not on the client with hash: no item should be selected and the object page should be displayed", function (Given, When, Then) {
		//Arrangement
		Given.iStartTheApp("#/object/ObjectID_2");

		//Actions
		When.onTheMasterPage.iWaitUntilTheListIsLoaded();

		// Assertions
		Then.onTheDetailPage.iShouldBeOnTheObjectNPage(2);
		Then.onTheMasterPage.theListShouldHaveNoSelection().
			and.iTeardownMyAppFrame();
	});

	opaTest("Start the app with empty hash: the hash should reflect the selection of the first item in the list", function (Given, When, Then) {
		//Arrangement
		Given.iStartTheApp();

		//Actions
		When.onTheMasterPage.iWaitUntilTheListIsLoaded();
		//Assertions

		Then.onTheMasterPage.theObjectNShouldBeSelectedInTheList(1);
		Then.onTheDetailPage.iShouldBeOnTheObjectNPage(1);
		Then.onTheBrowserPage.iShouldSeeTheHashForObjectN(1).
			and.iTeardownMyAppFrame();
	});

	opaTest("Start the App and simulate metadata error: MessageBox should be shown", function (Given, When, Then) {
		//Arrangement
		Given.iStartMyAppOnADesktopToTestErrorHandler("metadataError=true");

		//Actions
		When.onTheAppPage.iWaitUntilTheMessageBoxIsShown("metadataErrorMessageBox");

		//Assertioens
		Then.iTeardownMyAppFrame();

	});

	opaTest("Start the App and simulate bad request error: MessageBox should be shown", function (Given, When, Then) {
		//Arrangement
		Given.iStartMyAppOnADesktopToTestErrorHandler("errorType=serverError");

		//Actions
		When.onTheAppPage.iWaitUntilTheMessageBoxIsShown("serviceErrorMessageBox");

		//Assertioens
		Then.iTeardownMyAppFrame();

	});

});
