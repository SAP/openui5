sap.ui.define([
		"sap/ui/test/opaQunit"
	], function (opaTest) {
		"use strict";

		QUnit.module("Phone busy indication");

		opaTest("Should see a global busy indication while loading the metadata", function (Given, When, Then) {
			// Arrangements
			Given.iStartTheAppWithDelay("", 5000);

			//Actions
			When.onTheAppPage.iLookAtTheScreen();

			// Assertions
			Then.onTheAppPage.iShouldSeeTheBusyIndicator().
				and.iTeardownMyAppFrame();
		});

		opaTest("Should see a busy indication on the master after loading the metadata", function (Given, When, Then) {
			// Arrangements
			Given.iStartTheAppWithDelay("", 2000);

			//Actions
			When.onTheAppPage.iWaitUntilTheBusyIndicatorIsGone();

			// Assertions
			Then.onTheMasterPage.iShouldSeeTheBusyIndicator().
				and.iTeardownMyAppFrame();
		});

	}
);