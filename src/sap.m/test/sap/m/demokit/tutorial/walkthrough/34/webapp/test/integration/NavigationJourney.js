/*global QUnit, opaTest*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/App"
], function () {
	"use strict";

	QUnit.module("Navigation");

	opaTest("Should open the Hello dialog", function (Given, When, Then) {

		// Arrangements
		Given.iStartMyAppInAFrame(sap.ui.require.toUrl("sap/ui/demo/walkthrough/test/mockServer") + ".html");

		//Actions
		When.onTheAppPage.iPressTheSayHelloWithDialogButton();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheHelloDialog();

		// Cleanup
		Then.iTeardownMyAppFrame();
	});
});
