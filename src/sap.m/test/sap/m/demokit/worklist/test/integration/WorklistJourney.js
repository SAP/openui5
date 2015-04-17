/*global opaTest *///declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
[
	"sap/ui/test/Opa5"
],
function (Opa5) {
	"use strict";

	module("Worklist");

	opaTest("Should see the table with all entries", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheWorklistPage.iLookAtTheScreen();

		// Assertions
		Then.onTheWorklistPage.theTableShouldHaveAllEntries().
			and.theTitleShouldDisplayTheTotalAmountOfItems();
	});

	opaTest("Should be able to load 10 more items", function (Given, When, Then) {
		//Actions
		When.onTheWorklistPage.iPressOnMoreData();

		// Assertions
		Then.onTheWorklistPage.theTableShouldHaveTheDoubleAmountOfInitialEntries().
			and.iTeardownMyAppFrame();
	});

	opaTest("Should see the busy indicator on app view while worklist view metadata is loaded", function (Given, When, Then) {
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

	opaTest("Should see the busy indicator on worklist table after metadata is loaded", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			delay: "1000"
		});

		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheWorklistTableBusyIndicator().
			and.iTeardownMyAppFrame();
	});

	opaTest("Should see the busy indicator on app view while worklist view metadata is loaded, after starting app with object and navigating back", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			delay: 10000,
			hash: "/object/ObjectID_10"
		});

		// Actions
		When.onTheObjectPage.iPressTheBackButton();
		When.onTheWorklistPage.iLookAtTheScreen();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicatorForTheWholeApp().
			and.iTeardownMyAppFrame();
	});

	opaTest("Should see the busy indicator on worklist view after metadata is loaded, after starting app with object and navigating back", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			delay: 2000,
			hash: "/object/ObjectID_10"
		});

		// Actions
		When.onTheObjectPage.iPressTheBackButton();
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheWorklistTableBusyIndicator();
	});

	opaTest("Should open the share menu and display the share buttons", function (Given, When, Then) {
		// Actions
		When.onTheBrowser.iChangeTheHashToObject(10);
		When.onTheWorklistPage.iPressOnTheShareButton();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheShareEmailButton().
			and.iTeardownMyAppFrame();
	});

});
