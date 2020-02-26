/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/PlanningCalendar",
	"./pages/SinglePlanningCalendar",
	"./pages/Browser",
	"./pages/NotFound",
	"./pages/App"
], function (opaTest) {
	"use strict";

	QUnit.module("NotFound");

	opaTest("Should see the resource not found page when changing to an invalid hash", function (Given, When, Then) {
		// Arrangement
		Given.iStartMyApp();

		// Actions
		When.onTheBrowser.iChangeTheHashToSomethingInvalid();

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeResourceNotFound();

	});

	opaTest("Clicking the 'Back to Team Calendar' link on the 'Resource not found' page should bring me back to the Planning Calendar", function (Given, When, Then) {
		// Actions
		When.onTheNotFoundPage.iPressTheNotFoundShowPlanningCalendarLink();

		// Assertions
		Then.onThePlanningCalendarPage.theCalendarIsDisplayed();
	});

	opaTest("Clicking the back button should take me back to the not found page", function (Given, When, Then) {
		// Actions
		When.onTheBrowser.iPressOnTheBackwardsButton();

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeResourceNotFound();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Should see the 'Team Member not found' page if an invalid member id has been called", function (Given, When, Then) {
		// Arrangement
		Given.iStartMyApp({hash : "memberCalendar/SomeInvalidObjectId"});

		// Assertions
		Then.onTheNotFoundPage.iShouldSeeObjectNotFound();
	});

	opaTest("Clicking the 'Back to Team Calendar' link on the 'Team Member not found' page should bring me back to the Planning Calendar", function (Given, When, Then) {
		// Actions
		When.onTheNotFoundPage.iPressTheMemberNotFoundShowPlanningCalendarLink();

		// Assertions
		Then.onThePlanningCalendarPage.theCalendarIsDisplayed();

		// Cleanup
		Then.iTeardownMyApp();
	});

});