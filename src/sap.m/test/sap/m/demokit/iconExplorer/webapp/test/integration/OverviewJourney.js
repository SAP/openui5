/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Overview"
], function (opaTest) {
	"use strict";

	QUnit.module("Overview");

	opaTest("Should see the results table with all entries", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyAppOnTheDetailsTab();

		// Assertions
		Then.onTheOverviewPage.theTableShouldHaveAllEntries().
			and.theTitleShouldDisplayTheTotalAmountOfItems();
	});

	opaTest("Should be able to load 200 more items", function(Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnMoreData();

		// Assertions
		Then.onTheOverviewPage.theTableShouldHaveTheDoubleAmountOfInitialEntries();
	});

	opaTest("Selecting a tag on the favorite tab should deliver results that contain the tag value", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iMarkAnIconAsFavorite("activate").
		and.iPressOnTheTabWithTheKey("favorites").
		and.iSelectTheTagWithName("magic");

		// Assertions
		Then.onTheOverviewPage.theTableShouldShowOnlyObjectsWithTheTag("magic", "fav");

		// Cleanup: remove favorite
		When.onTheOverviewPage.iMarkAnIconAsFavorite("activate");
	});

	opaTest("Selecting a tag on the details page should deliver results that contain the tag value", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheTabWithTheKey("details").
			and.iSelectTheTagWithName("settings");

		// Assertions
		Then.onTheOverviewPage.theTableShouldShowOnlyObjectsWithTheTag("settings");
	});

	opaTest("Selecting another tag on the details page should deliver results that contain the tag value", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iSelectTheTagWithName("cogwheels");

		// Assertions
		Then.onTheOverviewPage.theTableShouldShowOnlyObjectsWithTheTag("cogwheels");
	});

	opaTest("Selecting a tag should deliver results that contain the tag value", function (Given, When, Then) {
		//Actions
		When.onTheOverviewPage.iPressOnTheTabWithTheKey("details").
			and.iSelectTheCategoryWithName("Objects");

		// Assertions
		Then.onTheOverviewPage.theTableShouldShowTheCategory("Objects");

		// Cleanup
		Then.iTeardownMyApp();
	});

});