/*global opaTest */
//declare unusual global vars for JSLint/SAPUI5 validation

sap.ui.require(
	[],
	function () {
		"use strict";

		QUnit.module("Object");

		opaTest("Should see the object view after metadata is loaded", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();

			//Actions
			When.onTheWorklistPage.iRememberTheItemAtPosition(1);
			When.onTheBrowser.iRestartTheAppWithTheRememberedItem({
				delay: 1000
			});

			// Assertions
			Then.onTheObjectPage.iShouldSeeTheRememberedObject().
				and.iTeardownMyAppFrame();
		});

	});
