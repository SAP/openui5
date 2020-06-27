/*global QUnit, opaTest */
sap.ui.require([], function () {

	"use strict";

	QUnit.module("Journey - ManageProducts - GridTableViewSettingsJourney");
	var bAscending = true;

	opaTest("#2 Check if the gridTable toolBar has SORT button", function(Given, When, Then) {
		//Arrangements
		Given.iStartMyApp("GridTable");
		//Assertions
		Then.onTheCommonPage.iShouldSeeTheControl("mainTable", "views.GridTable");
		Then.onTheTablePage.theTableHasASortButton();
		Then.onTheTablePage.iShouldSeeTheTableHeader();
	});

	opaTest("#3 Check View Settings Popup Dialog Comes Up with Sort Panel", function (Given, When, Then) {
		// Action
		When.onTheCommonPage.iClickOnButton("sort");
		//Assertion
		Then.onTheTablePage.theTableOnlyPageHasAViewSettingsDialogOpen("Sort By");
	});
	opaTest("#4 Check if data is sorted according to Category Column", function (Given, When, Then) {
		When.onTheTablePage.iClickListItemInViewSettings("Category");
		When.onTheCommonPage.iClickOnButton("OK");
		Then.onTheTablePage.theGridTableIsSorted("Category", bAscending);
	});
	opaTest("#5 Check if Column menu Sort works", function (Given, When, Then) {
		When.onTheTablePage.iClickOnColumnHeader("Category")
			.and
			.iSelectColumnMenuItem("Category", "Sort Descending");
		Then.onTheTablePage.theGridTableIsSorted("Category", !bAscending);
		Then.onTheTablePage.iTearDownMyApp();
	});

});
