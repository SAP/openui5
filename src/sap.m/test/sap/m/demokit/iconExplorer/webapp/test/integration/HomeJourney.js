/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Home",
	"./pages/Overview"
], function (opaTest) {
	"use strict";

	QUnit.module("Home");

	opaTest("Should see the homepage displayed", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			hash: ""
		});

		// Assertions
		Then.onTheHomePage.iShouldSeeSomeFontTiles();

	});
	opaTest("Should navigate to SAP icon TNT", function (Given, When, Then) {
		// Actions
		When.onTheHomePage.iClickOnTheTNTTitleLink();

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheTNTFontPage();
	});

	opaTest("Should be on the Home page when back button is pressed", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressTheNavigationBackButton();

		// Assertions
		Then.onTheHomePage.iShouldSeeSomeFontTiles();

		// Cleanup
		Then.iTeardownMyApp();
	});
});
