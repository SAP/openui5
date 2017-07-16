/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	"use strict";

	QUnit.module("Navigation");

	opaTest("Should see the busy indicator on app view while icon metadata is loaded", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheOverviewPage.iLookAtTheScreen();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicatorForTheWholeApp().
			and.iTeardownMyAppFrame();
	});

	opaTest("Should see the busy indicator on overview table after metadata is loaded", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyAppOnTheDetailsTab();

		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();

		// Assertions
		Then.onTheOverviewPage.iShouldSeeTheResultsTableBusyIndicatorOrItemsLoaded().
			and.iTeardownMyAppFrame();
	});

});