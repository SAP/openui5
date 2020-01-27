/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/PlanningCalendar",
	"./pages/Browser",
	"./pages/SinglePlanningCalendar",
	"./pages/App"
], function (opaTest) {
	"use strict";

	// ID of the member to select
	var iMemberToSelect = 1;

	QUnit.module("SinglePlanningCalendar");

	opaTest("Should see the Single Planning Calendar initially set", function (Given, When, Then) {
		// Actions
		Given.iStartMyAppWithHash({}, iMemberToSelect);

		// Assertions
		Then.onTheSinglePlanningCalendarPage.theCalendarShouldHaveMembersSelected(iMemberToSelect).
			and.theCalendarViewIsProperlySet().
			and.theCalendarDateIsProperlySet();
	});

	opaTest("Open a Legend", function (Given, When, Then) {
		// Actions
		Given.onTheSinglePlanningCalendarPage.iClickOnALegendButton();

		// Assertions
		Then.onTheSinglePlanningCalendarPage.theCalendarLegendIsOpen();
	});

	opaTest("Select a view from the Single Planning Calendar View Selector", function (Given, When, Then) {
		// Actions
		Given.onTheSinglePlanningCalendarPage.iSelectASinglePlanningCalendarView();

		// Assertions
		Then.onTheSinglePlanningCalendarPage.theCalendarViewIsChangedToDay();
	});

	opaTest("Select a Planning Calendar from the Single Planning Calendar Team Button", function (Given, When, Then) {
		// Actions
		Given.onTheSinglePlanningCalendarPage.iClickOnATeamButton();

		// Assertions
		Then.onTheSinglePlanningCalendarPage.theViewIsChangedToPlanningCalendar();

		// Cleanup
		Then.iTeardownMyApp();
	});

});