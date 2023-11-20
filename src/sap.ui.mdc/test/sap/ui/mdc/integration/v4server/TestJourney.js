/*global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"./arrangements/Startup",
	"./pages/Main"
], function (Opa5, opaTest, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "v4server.integration.app.view.",
		autoWait: true
	});

	QUnit.module("Books");

	opaTest("Should see the table with all books", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Assertions
		Then.onTheMainPage.theTableShouldHavePagination();
	});

	opaTest("Should be able to load more items", function (Given, When, Then) {
		//Actions
		When.onTheMainPage.iPressOnMoreData();

		// Assertions
		Then.onTheMainPage.theTableShouldHaveMoreEntries();

		// Intentionally do not test more specific things about the data because this test should be low-maintenance

		// Cleanup
		Then.iTeardownMyApp();
	});
});
