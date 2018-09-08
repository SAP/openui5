/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/App"
], function (opaTest) {
	"use strict";

	QUnit.module("Check Journey");

	opaTest("Should start the app and see the 'Do Something' button with its label", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheDoSomethingButton().and.iShouldSeeTheButtonLabel();
	});

	opaTest("Should be able to press the 'Do Something' button", function (Given, When, Then) {
		// Actions
		When.onTheAppPage.iPressTheDoSomethingButton();

		// Assertions
		Then.onTheAppPage.iShouldSeeMessageToast();
	});
});