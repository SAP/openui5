/*global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./pages/Main"
], function (Opa5, Startup) {
	"use strict";

	return function (opaTestOrSkip) {

		Opa5.extendConfig({
			arrangements: new Startup(),
			viewNamespace: "v4server.integration.app.view.",
			autoWait: true
		});

		QUnit.module("Books");

		opaTestOrSkip("Should see the table with all books", function (Given, When, Then) {
			// Arrangements
			Given.iStartMyApp();

			// Assertions
			Then.onTheMainPage.theTableShouldHavePagination();
		});

		opaTestOrSkip("Should be able to load more items", function (Given, When, Then) {
			//Actions
			When.onTheMainPage.iPressOnMoreData();

			// Assertions
			Then.onTheMainPage.theTableShouldHaveMoreEntries();

			// Intentionally do not test more specific things about the data because this test should be low-maintenance

			// Cleanup
			Then.iTeardownMyApp();
		});
	};
});
