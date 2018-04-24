/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Overview",
	"./pages/Preview",
	"./pages/Browser",
	"./pages/App"
], function (opaTest) {
	"use strict";

	QUnit.module("Preview");

	opaTest("Should see the objects list and no preview", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyAppOnTheDetailsTab();

		//Actions
		When.onTheOverviewPage.iSelectTheCategoryWithName("All");

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheTable();
		Then.onThePreviewPage.iShouldNotSeeThePreviewArea();
	});

	opaTest("preview page shows the correct icon details", function (Given, When, Then) {
		// Actions
		When.onTheOverviewPage.iPressATableItemWithName("activate");

		// Assertions
		Then.onThePreviewPage.iShouldSeeThePreviewArea().
		and.iShouldSeeTheIcon("activate").
		and.iShouldSeeTheCopyArea().
		and.iShouldSeeTheUseCasesArea().
		and.iShouldSeeTheInfoArea().
		and.iShouldSeeTheUnicodeInfo().
		and.iShouldSeeTheCategoryInfo();
	});

	opaTest("Should be on the table page without preview when browser back is pressed", function (Given, When, Then) {
		// Actions
		When.onTheBrowser.iPressOnTheBackwardsButton();

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheTable();
		Then.onThePreviewPage.iShouldNotSeeThePreviewArea();
	});

	opaTest("Should show the icon preview again when browser forwards is pressed", function (Given, When, Then) {
		// Actions
		When.onTheBrowser.iPressOnTheForwardsButton();

		// Assertions
		Then.onThePreviewPage.iShouldSeeThePreviewArea().
		and.iShouldSeeTheIcon("activate");
	});

	opaTest("Should react on hashchange", function (Given, When, Then) {
		// Actions
		When.onTheOverviewPage.iRememberTheItemAtPosition(2);
		When.onTheBrowser.iChangeTheHashToTheRememberedItem();

		// Assertions
		Then.onThePreviewPage.iShouldSeeThePreviewArea().
		and.iShouldSeeTheRememberedObject();
	});

	opaTest("Preview shows the correct icon details", function (Given, When, Then) {
		// Actions
		When.onTheOverviewPage.iRememberTheItemAtPosition(1).
		and.iPressATableItemAtPosition(1);

		// Assertions
		Then.onThePreviewPage.iShouldSeeThePreviewArea().
		and.iShouldSeeTheRememberedObject();
	});

	opaTest("Preview Page shows a random icon when pressing the surprise me button", function (Given, When, Then) {
		// Actions
		When.onTheBrowser.iChangeTheHashParameter("icon", "");
		When.onTheOverviewPage.iPressTheSurpriseMeButton();

		// Assertions
		Then.onThePreviewPage.iShouldSeeARandomIcon();
	});

	opaTest("Shows a message toast when copying the icon code to the clipboard", function (Given, When, Then) {
		// Actions
		When.onThePreviewPage.iCopyToClipBoard();

		// Assertions
		Then.onTheAppPage.iShouldSeeAMessageToast("Copy to clipboard");

		// Cleanup
		Then.iTeardownMyApp();
	});
});