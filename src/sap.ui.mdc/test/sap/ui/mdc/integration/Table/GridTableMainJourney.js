/*global QUnit, opaTest */
sap.ui.require([], function () {

	"use strict";

	QUnit.module("Journey - ManageProducts - GridTableMainJourney");

	opaTest("#1 Check if GridTable is displayed", function(Given, When, Then){
		Given.iStartMyApp("GridTable");
		Then.onTheCommonPage.iShouldSeeTheControl("mainTable", "views.GridTable");
		Then.onTheCommonPage.iTearDownMyApp();
	});
});
