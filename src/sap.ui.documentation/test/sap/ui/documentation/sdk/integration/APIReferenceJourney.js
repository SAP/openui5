/*
 global QUnit
 */
sap.ui.define([
	'sap/ui/test/opaQunit'
], function (opaTest) {
	"use strict";

	QUnit.module("API Reference Journey Test");

	opaTest("Should start the app and see the landing page", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Assertions
		Then.onTheAppPage.iShouldSeeTheAppPage();
	});

	opaTest("Should navigate to API Reference Page", function (Given, When, Then) {
		// Action
		When.onTheAppPage.iPressTheApiMasterTabButton();
		// Assertions
		Then.onTheApiMasterPage.iShouldSeeTheApiMasterPage();
	});

	opaTest("Should see the tree filled with items", function (Given, When, Then) {
		Then.onTheApiMasterPage.iShouldSeeTheTreeFilled();
	});

	opaTest("Should Filter the tree", function (Given, When, Then) {
		When.onTheApiMasterPage.iSearchFor("sap.ui.base.o");
		Then.onTheApiMasterPage.iShouldSeeTheseItems(["sap", "ui", "base", "Object", "ObjectPool"]);
	});

	opaTest("Should select an item from the filtered tree", function (Given, When, Then) {
		Given.onTheApiMasterPage.iSearchFor("sap.ui.base.o");
		When.onTheApiMasterPage.iSelectATreeNode("Object");
		Then.onTheApiDetailPage.iShouldSeeTheApiDetailPage();
		Then.onTheSubApiDetailPage.iShouldSeeTheApiDetailObjectPage();
	});

	opaTest("Should see the details for the selected item (sap.ui.base.Object)", function (Given, When, Then) {
		Given.onTheApiMasterPage.iSearchFor("sap.ui.base.o");
		When.onTheApiMasterPage.iSelectATreeNode("Object");
		Then.onTheSubApiDetailPage.iShouldSeeTheCorrectTitleAndSubtitle("abstract class sap.ui.base.Object", "").
		and.iShouldSeeTheElementDetailsInHeaderContent().
		and.iShouldSeeTheseSections("Overview", "Constructor", "Methods").
		and.iShouldSeeTheCorrectSectionSelected("Overview");
	});

	opaTest("Should scroll to section via section buttons", function (Given, When, Then) {
		Given.onTheApiMasterPage.iSearchFor("sap.ui.base.o").
		and.iSelectATreeNode("Object");
		When.onTheSubApiDetailPage.iSelectASection("Constructor");
		Then.onTheSubApiDetailPage.iShouldSeeTheCorrectSectionSelected("Constructor");
		When.onTheSubApiDetailPage.iSelectASectionWithSubsections("Methods").and.iSelectASubSectionFromTheMenu("Summary");
		Then.onTheSubApiDetailPage.iShouldSeeTheCorrectSectionSelected("Methods");
	});

	opaTest("Should scroll to section via link", function (Given, When, Then) {
		When.onTheSubApiDetailPage.iSelectALink("getInterface");
		Then.onTheSubApiDetailPage.iShouldSeeTheCorrectSectionSelected("Methods").
		and.iShouldSeeTheCorrectSubSectionOnTop("getInterface");
	});

	opaTest("Should teardown my app", function(Given, When, Then) {
		expect(0); // eslint-disable-line no-undef
		Then.iTeardownMyApp();
	});

});
