/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	// load arrangements
	"myApp/test/arrangements/Common",
	"myApp/test/arrangements/Arrangement",
	//Load all page objects needed for this test
	"myApp/test/pageObjects/Intro",
	"myApp/test/pageObjects/Overview",
	"myApp/test/pageObjects/TestPage1",
	"myApp/test/pageObjects/TestPage2"
], function (Opa5, opaTest, Common, Arrangement) {
	"use strict";

	QUnit.module("Page 1 journey");

	Opa5.extendConfig({
		viewNamespace : "appUnderTest.view.",
		arrangements : new Common(),
		autoWait : true
	});

	opaTest("Should go to Page 1", function (Given, When, Then) {

		Given.iSetupMyApp();
		// iPressOnGoToOverview can be used both as arrangement and action (see below)
		Given.onTheIntroPage.iPressOnGoToOverview();

		When.onTheOverviewPage.iPressOnGoToPage1();

		Then.onPage1.iShouldSeeThePage1Text().
		and.iTeardownMyAppFrame();

	});

	QUnit.module("Page 2 journey");

	Opa5.extendConfig({
		// these new arrangements should be merged with arrangements from Common:
		// any methods with the same name will be overwritten by the latest defined implementation
		// all other new methods or already existing methods will remain untouched
		arrangements : new Arrangement()
	});

	opaTest("Should go to Page 2", function(Given, When, Then) {

		Given.iSetupMyApp();
		Given.iAmOnTheOverviewPage();

		When.onTheOverviewPage.iPressOnGoToPage2();

		Then.onPage2.iShouldSeeThePage2Text().
		and.iTeardownMyAppFrame();

	});

	QUnit.start();
});
