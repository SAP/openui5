/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/App",
	"./pages/Master"
], function (opaTest) {
	"use strict";

	QUnit.module("Desktop busy indication");

	opaTest("Should see a global busy indication while loading the metadata", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({delay :1000});

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicator();
	});

	opaTest("Should see a busy indication on the master after loading the metadata", function (Given, When, Then) {
		// Assertions
		Then.onTheMasterPage.iShouldSeeTheBusyIndicator().
			and.theListHeaderDisplaysZeroHits();

		// Cleanup
		Then.iTeardownMyApp();
	});

});