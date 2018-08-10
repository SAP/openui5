/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/Device",
	"./pages/Worklist",
	"./pages/App"
], function (opaTest, Device) {
	"use strict";

	var iDelay = (Device.browser.msie || Device.browser.edge) ? 1500 : 1000;

	QUnit.module("Worklist");

	opaTest("Should see the table with all entries", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Assertions
		Then.onTheWorklistPage.theTableShouldHaveAllEntries().
		and.theTableShouldContainOnlyFormattedUnitNumbers().
		and.theTitleShouldDisplayTheTotalAmountOfItems();
	});

	opaTest("Search for the First object should deliver results that contain the firstObject in the name", function (Given, When, Then) {
		//Actions
		When.onTheWorklistPage.iSearchForTheFirstObject();

		// Assertions
		Then.onTheWorklistPage.theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle();
	});

	opaTest("Entering something that cannot be found into search field and pressing search field's refresh should leave the list as it was", function (Given, When, Then) {
		//Actions
		When.onTheWorklistPage.iTypeSomethingInTheSearchThatCannotBeFoundAndTriggerRefresh();

		// Assertions
		Then.onTheWorklistPage.theTableHasEntries();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Should see the busy indicator on app view while worklist view metadata is loaded", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({
			delay: iDelay,
			autoWait: false
		});

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicatorForTheWholeApp();
	});

	opaTest("Should see the busy indicator on worklist table after metadata is loaded", function (Given, When, Then) {
		//Actions
		When.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();

		// Assertions
		Then.onTheWorklistPage.iShouldSeeTheWorklistTableBusyIndicator();

		// Cleanup
		Then.iTeardownMyApp();
	});

});