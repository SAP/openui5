/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	// require test library modules
	"testLibrary/pageObjects/List",
	// require pageObjects only for this test
	"appUnderTest/test/pageObjects/Item"
], function (Opa5, opaTest, Common) {
	"use strict";

	// setup test libraries
	Opa5.extendConfig({
		viewNamespace: "view.",
		autoWait: true,
		testLibs: {
			// plain object libraries can provide 'constants' commonly used by tests
			viewsLibrary: {
				listViewName: "Main"
			}
		}
	});

	QUnit.module("List Journey");

	opaTest("Should filter list", function (Given, When, Then) {
		// arrangement created in testLibrary.pageObjects.Common1
		// and declared in testLibrary.pageObjects.List
		Given.iStartMyApp();

		// Action defined in tstLibrary.pageObjects.List.
		// We can use it directly without further configuration because
		// the page object is already registered in the imported library module
		When.onTheListPage
			.iSetTheFilter("Sample1");

		Then.onTheListPage
			.theResultListIsVisible(2);

		// assertion defined in testLibrary.pageObjects.Common2
		Then.iLeaveMyApp();
	});

	opaTest("Should navigate to details", function (Given, When, Then) {
		When.onTheListPage
			.iNavigateFromListItem("name", "Sample12");

		// you can also define and use test-specific page objects like appUnderTest.test.pageObjects.Item
		Then.onTheItemPage
			.theTitleIsCorrect("Sample12")
			.and
			.iTeardownMyApp();
	});

	QUnit.start();
});
