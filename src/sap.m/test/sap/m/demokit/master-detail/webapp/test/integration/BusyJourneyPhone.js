/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/App",
	"./pages/Master"
], function (opaTest) {
	"use strict";

	QUnit.module("Phone busy indication");

	opaTest("Should see a global busy indication while loading the metadata", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheAppWithDelay("", 5000);

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicator();

		//Cleanup
		Then.iTeardownMyAppFrame();
	});

	opaTest("Should see a busy indication on the master after loading the metadata", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheAppWithDelay("", 2000);

		//Actions
		When.onTheAppPage.iWaitUntilTheBusyIndicatorIsGone();

		// Assertions
		Then.onTheMasterPage.iShouldSeeTheBusyIndicator();

		//Cleanup
		Then.iTeardownMyAppFrame();
	});

});
