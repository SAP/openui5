/*global QUnit, opaTest */
sap.ui.require([], function () {

	"use strict";

	QUnit.module("Journey - Products - MainJourneyViewSettings");

	var bAscending = true;

	opaTest("#2 Check if the table toolbar has SORT button", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Assertions
		Then.onTheCommonPage.iShouldSeeTheControl("mainTable", "views.ResponsiveTable");
		Then.onTheTablePage.theTableHasASortButton();
	});

	opaTest("#3 Check View Settings Popup Dialog Comes Up with Sort Panel", function (Given, When, Then) {
		// Action
		When.onTheCommonPage.iClickOnButton("sort");
		Then.onTheTablePage.theTableOnlyPageHasAViewSettingsDialogOpen("Sort By");
	});

	opaTest("#4 Check if data is sorted according to Category Column", function (Given, When, Then) {
		When.onTheTablePage.iClickListItemInViewSettings("Category");
		When.onTheCommonPage.iClickOnButton("OK");
		Then.onTheTablePage.theListIsSorted("Category", bAscending);
	});

	opaTest("#5 Check if data is sorted according to Width Column", function (Given, When, Then) {
		When.onTheCommonPage.iClickOnButton("sort");
		When.onTheTablePage.iClickListItemInViewSettings("Width");
		When.onTheCommonPage.iClickOnButton("OK");
		Then.onTheTablePage.theListIsSorted("Width", !bAscending);
		Then.onTheCommonPage.iTearDownMyApp();
	});

	opaTest("#6 Check if the table toolbar has GROUP button", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Assertions
		Then.onTheCommonPage.iShouldSeeTheControl("mainTable", "views.ResponsiveTable");
		Then.onTheTablePage.theTableHasAGroupButton();
	});

	opaTest("#7 Check View Settings Popup Dialog Comes Up with Group Panel", function (Given, When, Then) {
		// Action
		When.onTheCommonPage.iClickOnButton("group");
		Then.onTheTablePage.theTableOnlyPageHasAViewSettingsDialogOpen("Group By");
	});

	opaTest("#8 Check if data is grouped according to Category Column", function (Given, When, Then) {
		When.onTheTablePage.iClickListItemInViewSettings("Category");
		When.onTheCommonPage.iClickOnButton("OK");
		Then.onTheTablePage.theGroupHeadersAreSorted()
			.and
			.theListIsGrouped("Category");
	});

	opaTest("#9 Check if data is grouped according to Width Column", function (Given, When, Then) {
		When.onTheCommonPage.iClickOnButton("group");
		When.onTheTablePage.iClickListItemInViewSettings("Width");
		When.onTheCommonPage.iClickOnButton("OK");
		Then.onTheTablePage.theListIsGrouped("Width");
		Then.onTheCommonPage.iTearDownMyApp();
	});
});
