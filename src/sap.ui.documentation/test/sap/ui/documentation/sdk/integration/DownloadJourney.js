/*
 global QUnit
 */
sap.ui.define([
	'sap/ui/test/opaQunit'
], function (opaTest) {
	"use strict";

	QUnit.module("Download Journey");

	opaTest("Should start the app and see the landing page", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Assertions
		Then.onTheAppPage.iShouldSeeTheAppPage();
	});

	opaTest("Should navigate to Controls Master Page", function (Given, When, Then) {
		// Action
		When.onTheAppPage.iPressTheControlsMasterTabButton();
		// Assertions
		Then.onTheControlsMasterPage.iShouldSeeTheControlsMasterPage();
	});


	opaTest("Should be able to download a sample", function (Given, When, Then) {
		// Action
		When.onTheControlsMasterPage.iPressOnTheEntity("Dynamic Page");
		When.onTheEntityPage.iPressOnTheSample("Dynamic Page Freestyle Example");
		When.onTheSamplePage.iPressOnShowCode();
		// Assertions
		Then.onTheCodePage.iCheckThatTheDownloadButtonWorks();
	});

	opaTest("Should teardown my app", function(Given, When, Then) {
		expect(0); // eslint-disable-line no-undef
		Then.iTeardownMyApp();
	});

});
