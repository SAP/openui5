/*
 global QUnit
 */
sap.ui.define([
	'sap/ui/test/opaQunit'
], function (opaTest) {
	"use strict";

	QUnit.module("Samples Journey");

	opaTest("Should start the app and see the landing page", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Assertions
		Then.onTheAppPage.iShouldSeeTheAppPage();
	});

	opaTest("Should navigate to Controls Master Page", function (Given, When, Then) {
		// Action
		When.onTheAppPage.iPressTheControlsMasterTabButton();
		// Assertions
		Then.onTheControlsMasterPage.iShouldSeeTheControlsMasterPage();
	});

	opaTest("Should group the list initially", function (Given, When, Then) {
		// Assertions
		Then.onTheControlsMasterPage.iShouldSeeAGroupCalled("Testing").
			and.theListShouldBeSortedAscendingByName();
	});

	opaTest("Should be able to sort descending ", function (Given, When, Then) {
		// Action
		When.onTheControlsMasterPage.iGroupByCategoryDescending();
		// Assertions
		Then.onTheControlsMasterPage.theListShouldBeSortedDescendingByCategory();
	});

	opaTest("Should be able to filter the list", function (Given, When, Then) {
		// Action
		When.onTheControlsMasterPage.iTriggerTheSearchFor("test");
		// Assertions
		Then.onTheControlsMasterPage.iShouldNotSeeAnEntityCalled("Busy Indicator").
			and.iShouldSeeAnEntityCalled("OPA5").
			and.iShouldSeeAGroupCalled("Testing");
	});

	opaTest("Should be able to open concrete sample", function (Given, When, Then) {
		// Action
		When.onTheControlsMasterPage.iTriggerTheSearchFor("Generic Tag");
		// Assertions
		When.onTheControlsMasterPage.iPressOnTheEntity("Generic Tag");
		When.onTheEntityPage.iPressOnTheSample("Generic Tag with Different Configurations");
		When.onTheSamplePage.iPressOnShowCode();
		Then.onTheCodePage.iShouldBeAbleToSwitchFiles("manifest.json");
	});

	opaTest("Should be able to edit sample code", function (Given, When, Then) {
		// Action
		Then.onTheCodePage.iShouldBeAbleToSwitchFiles("Page.view.xml");
		When.onTheCodePage.iShouldSeeCodeEditor();
		//Then.onTheCodePage.iShouldSeeAnErrorOnThePage();
		Then.onTheCodePage.iShouldSeeEditedNotification();
		Then.onTheCodePage.iShouldSeeResetChangesButton();
	});

	opaTest("Should teardown my app", function(Given, When, Then) {
		expect(0); // eslint-disable-line no-undef
		Then.iTeardownMyApp();
	});

});
