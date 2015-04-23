/*global opaTest */
//declare unusual global vars for JSLint/SAPUI5 validation
sap.ui.require(
[
	"sap/ui/test/Opa5"
],
function (Opa5) {
	"use strict";

	QUnit.module("Phone navigation");

	opaTest("Should see the objects list", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheApp();

		//Actions
		When.onTheMasterPage.iLookAtTheScreen();

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheList();
	});

	opaTest("Should react on hashchange", function (Given, When, Then) {
		// Actions
		When.onTheBrowserPage.iChangeTheHashToObjectN(3);

		// Assertions
		Then.onTheDetailPage.iShouldBeOnTheObjectNPage(3);
	});

	opaTest("Should navigate on press", function (Given, When, Then) {
		// Actions
		When.onTheDetailPage.iPressTheBackButton();
		When.onTheMasterPage.iPressOnTheObject1InList();

		// Assertions
		Then.onTheDetailPage.iShouldBeOnTheObjectNPage(1);
	});

	opaTest("Detail Page Shows Object Details", function (Given, When, Then) {
		// Actions
		When.onTheDetailPage.iLookAtTheScreen();

		// Assertions
		Then.onTheDetailPage.iShouldSeeTheObjectLineItemsList().
			and.theLineItemsListShouldHave4Entries().
			and.theFirstLineItemHasIDLineItemID1().
			and.iTeardownMyAppFrame();
	});

	opaTest("Start the app with an empty hash: the hash should still be empty after loading", function (Given, When, Then) {
		//Arrangement
		Given.iStartTheApp();

		//Actions
		When.onTheMasterPage.iWaitUntilTheListIsLoaded();

		//Assertions
		Then.onTheBrowserPage.iShouldSeeAnEmptyHash().
			and.iTeardownMyAppFrame();
	});

});
