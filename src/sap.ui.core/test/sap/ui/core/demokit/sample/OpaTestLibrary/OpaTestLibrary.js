/* global QUnit */

QUnit.config.autostart = false;

// require test library modules as well
sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"appUnderTest/test/pageObjects/Item",
	"testLibrary/pageObjects/List"
], function (Opa5, opaTest, Item, List) {
	"use strict";

	// configure test library
	Opa5.extendConfig({
		viewNamespace: "view.",
		autoWait: true,
		testLibs: {
			testLibrary: {
				listViewName: "Main"
			}
		}
	});

	QUnit.module("List Journey");

	opaTest("Should filter list", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		// directly start using test library page objects
		When.onTheListPage
			.iSetTheFilter("Sample1");

		Then.onTheListPage
			.theResultListIsVisible(2);
	});

	opaTest("Should navigate to details", function (Given, When, Then) {
		When.onTheListPage
			.iNavigateFromListItem("name", "Sample12");

		// you can also define and use test-specific page objects
		Then.onTheItemPage
			.theTitleIsCorrect("Sample12")
			.and
			.iTeardownMyApp();
	});

	QUnit.start();
});
