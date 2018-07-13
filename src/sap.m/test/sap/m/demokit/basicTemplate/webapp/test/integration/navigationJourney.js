/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/App"
], function (opaTest) {
	"use strict";

	QUnit.module("Navigation Journey");

	opaTest("Should see the initial page of the app", function (Given, When, Then) {
		// Arrangements
		Given.iStartTheApp();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheApp();

		//Cleanup
		Then.iTeardownMyAppFrame();
	});
});
