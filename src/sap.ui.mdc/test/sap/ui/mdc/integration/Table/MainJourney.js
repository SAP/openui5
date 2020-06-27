/*global QUnit, opaTest */
sap.ui.require([], function () {

	"use strict";

	QUnit.module("Journey - ManageProducts - MainJourney");

	opaTest("#1 Check if the table is displayed", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Assertions
		Then.onTheCommonPage.iShouldSeeTheControl("mainTable", "views.ResponsiveTable");
		Then.onTheCommonPage.iTearDownMyApp();
	});

});
