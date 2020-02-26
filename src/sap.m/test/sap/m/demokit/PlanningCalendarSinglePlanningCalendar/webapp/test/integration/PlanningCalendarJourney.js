/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/Device",
	"./pages/PlanningCalendar",
	"./pages/App"
], function (opaTest, Device) {
	"use strict";

	QUnit.module("PlanningCalendar");

	opaTest("Should see the Planning Calendar initially set", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Assertions
		Then.onThePlanningCalendarPage.theCalendarShouldHaveAllTeamMembers().
			and.theTeamSelectorHaveAllTeamMembers().
			and.theCalendarViewIsProperlySet().
			and.theCalendarDateIsProperlySet();
	});

	opaTest("Open a Legend", function (Given, When, Then) {
		// Actions
		Given.onThePlanningCalendarPage.iClickOnALegendButton();

		// Assertions
		Then.onThePlanningCalendarPage.theCalendarLegendIsOpen();
	});

	opaTest("Select a view from the Planning Calendar View Selector", function (Given, When, Then) {
		// Actions
		Given.onThePlanningCalendarPage.iSelectAPlanningCalendarView();

		// Assertions
		Then.onThePlanningCalendarPage.theCalendarViewIsChangedToDay();
	});

	opaTest("Select a Team Member from the Planning Calendar Team Selector", function (Given, When, Then) {
		// Actions
		Given.onThePlanningCalendarPage.iSelectATeamMember();

		// Assertions
		Then.onThePlanningCalendarPage.theViewIsChangedToSinglePlanningCalendar();

		// Cleanup
		Then.iTeardownMyApp();
	});

});