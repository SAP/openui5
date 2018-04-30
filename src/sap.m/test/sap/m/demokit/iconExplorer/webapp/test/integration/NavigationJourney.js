/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/App",
	"./pages/Overview",
	"./pages/Home",
	"./pages/Preview"
], function (opaTest) {
	"use strict";

	QUnit.module("Navigation");

	opaTest("Should see the busy indicator on app view while icon metadata is loaded", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			hash: "overview/SAP-icons",
			delay: 5000 // to really see the busy indicator
		});

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicatorForTheWholeApp();
	});

	opaTest("Should see the busy indicator on overview table after metadata is loaded", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheResultsTableBusyIndicatorOrItemsLoaded();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Search for an Icon should navigate to the Overview page", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			hash: ""
		});

		//Actions
		When.onTheHomePage.iSearchForAnIcon("arrow").
			and.iSelectASuggestion("refresh");

		// Assertions
		Then.onTheOverviewPage.theTableShouldContainTheIcon("refresh");

		Then.onThePreviewPage.iShouldSeeThePreviewArea().
			and.iShouldSeeTheIcon("refresh");
	});

	opaTest("Should navigate to tnt font when using the font selection dropdown", function (Given, When, Then) {
		// Actions
		When.onTheOverviewPage.iClickonTheFontSelectionButton().
			and.iSelectTheIconFont("SAP-icons-TNT");

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheTNTFontPage();

		// Cleanup
		Then.iTeardownMyApp();
	});
});