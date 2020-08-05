/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	// require test library modules
	// the test library should be loaded before any page objects that need to use the test library utilities!
	"testLibrary/SampleTestLibrary"
], function (Opa5, opaTest) {
	"use strict";

	// setup test libraries
	Opa5.extendConfig({
		viewNamespace: "view.",
		autoWait: true,
		testLibs: {
			// declare that the test wants to use this library's utilities
			// and set constants that can be used by the test library
			sampleLibrary: {
				listViewName: "Main"
			}
		}
	});

	sap.ui.require([
		// require pageObjects only for this test
		"appUnderTest/test/pageObjects/Item"
	], function () {

		QUnit.module("List Journey");

		opaTest("Should filter list", function (Given, When, Then) {
			// arrangement created in testLibrary.pageObjects.Common1
			// and declared in testLibrary.pageObjects.List
			Given.iStartMyApp();

			// Action defined in testLibrary.pageObjects.List.
			// We can use it directly without further configuration because
			// the page object is already registered in the imported library module
			When.onTheListPage
				.iSetTheFilter("Sample1");

			Then.onTheListPage
				.theResultListIsVisible(2);

			// assertion defined in testLibrary.pageObjects.Common2
			Then.iResetMyApp()
				.and
				.iTeardownMyApp();
		});

		opaTest("Should navigate to details", function (Given, When, Then) {
			Given.iStartMyApp();
			When.onTheListPage
				.iNavigateFromListItem("name", "Sample12");

			// this action will use test library utilities
			When.onTheItemPage.iSelectItem("2");

			// you can also define and use test-specific page objects like appUnderTest.test.pageObjects.Item
			Then.onTheItemPage
				.theTitleIsCorrect("Sample12")
				.and
				.iTeardownMyApp();
		});

		QUnit.start();
	});
});
