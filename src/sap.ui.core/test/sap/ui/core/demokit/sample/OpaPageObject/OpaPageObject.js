/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"myApp/test/arrangements/Common"
], function (Opa5, opaTest, Common) {
	"use strict";

	//Ensure to add arrangements, action, assertions before loading the page objects,
	//otherwise they would be overwritten.
	Opa5.extendConfig({
		viewNamespace : "view.",
		arrangements : new Common(),
		autoWait : true
	});

	//Load all page objects needed for this test
	sap.ui.require([
		"myApp/test/pageObjects/Intro",
		"myApp/test/pageObjects/Overview",
		"myApp/test/pageObjects/TestPage1",
		"myApp/test/pageObjects/TestPage2"
	], function () {
		QUnit.module("Page 1 journey");

		opaTest("Should go to Page 1", function(Given, When, Then) {

			Given.iStartMyApp();
			Given.onTheIntro.iPressOnGoToOverview(); //can serve as arrangement and action (see below)

			When.onTheOverview.iPressOnGoToPage1();

			Then.onPage1.iShouldSeeThePage1Text().
			and.iTeardownMyAppFrame();

		});

		QUnit.module("Page 2 journey");

		opaTest("Should go to Page 2", function(Given, When, Then) {

			Given.iStartMyApp();

			When.onTheIntro.iPressOnGoToOverview();
			When.onTheOverview.iPressOnGoToPage2();

			Then.onPage2.iShouldSeeThePage2Text().
			and.iTeardownMyAppFrame();

		});

		QUnit.start();
	});
});
