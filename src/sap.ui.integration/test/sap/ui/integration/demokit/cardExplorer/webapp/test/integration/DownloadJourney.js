/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Explore"
], function (opaTest) {
	"use strict";

	QUnit.module("Home");

	opaTest("Should see the homepage displayed", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			hash: ""
		});

		// Assertions
		Then.onTheExplorePage.firstOpaTest();

		Then.iTeardownMyApp();
	});
});
