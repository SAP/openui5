/*global opaTest*/
//declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
[
	"sap/ui/test/Opa5"
],
function (Opa5) {
	"use strict";

	module("FLP Integration");

	opaTest("Should open the share menu and display the share buttons on the worklist page", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Actions
		When.onTheObjectPage.iPressOnTheShareButton();

		// Assertions
		Then.onTheObjectPage.iShouldSeeTheShareEmailButton("Object").
			and.iShouldSeeTheShareTileButton("Object").
			and.iShouldSeeTheShareJamButton("Object");
	});

	opaTest("Should open the share menu and display the share buttons", function (Given, When, Then) {
		// Actions
		When.onTheBrowser.iChangeTheHashToObject(10);
		When.onTheWorklistPage.iPressOnTheShareButton();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheShareEmailButton().
			and.iShouldSeeTheShareTileButton().
			and.iShouldSeeTheShareJamButton().
			and.iTeardownMyAppFrame();
	});

});
