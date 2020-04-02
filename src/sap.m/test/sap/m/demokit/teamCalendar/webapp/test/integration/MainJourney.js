/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/Device",
	"./pages/Main"
//	"./pages/App"
], function (opaTest, Device) {
	"use strict";

	var oPCIds = {
			sCalendarId: "PlanningCalendar",
			sFragmentId: "PlanningCalendar",
			sSelectorId: "PlanningCalendarTeamSelector",
			sLegendButtonId: "PlanningCalendarLegendButton",
			sCreateButtonId: "PlanningCalendarCreateAppointmentButton"
		},
		oSPCIds = {
			sCalendarId: "SinglePlanningCalendar",
			sFragmentId: "SinglePlanningCalendar",
			sSelectorId: "SinglePlanningCalendarTeamSelector",
			sLegendButtonId: "SinglePlanningCalendarLegendButton",
			sCreateButtonId: "SinglePlanningCalendarCreateAppointmentButton"
		};

	QUnit.module("Team Calendar");

	opaTest("Should see the Planning Calendar initially set", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Assertions
		Then.onTheMainPage.thePlanningCalendarShouldHaveAllTeamMembers(oPCIds).
			and.theTeamSelectorHaveAllTeamMembers(oPCIds).
			and.theCalendarViewIsProperlySet(oPCIds);
	});

	opaTest("Open a Legend when Planning Calendar is displayed", function (Given, When, Then) {
		// Actions
		Given.onTheMainPage.iClickOnALegendButton(oPCIds);

		// Assertions
		Then.onTheMainPage.theCalendarLegendIsOpened();
	});

	opaTest("Select a view from the Planning Calendar View Selector", function (Given, When, Then) {
		// Actions
		Given.onTheMainPage.iSelectACalendarView(oPCIds, "Day");

		// Assertions
		Then.onTheMainPage.theCalendarViewIsProperlySet(oPCIds, "Day");
	});

	opaTest("Click on the Planning Calendar Create Button", function (Given, When, Then) {
		// Actions
		Given.onTheMainPage.iClickOnCreateButton(oPCIds);

		// Assertions
		Then.onTheMainPage.theMessageToastAppears();
	});

	opaTest("Switch to the Single Planning Calendar", function (Given, When, Then) {
		// Actions
		Given.onTheMainPage.iSelectATeamMember(oPCIds, 1); // select the item with index=1

		// Assertions
		Then.onTheMainPage.theSinglePlanningCalendarIsLoaded(oSPCIds, 1).
			and.theTeamSelectorHaveAllTeamMembers(oSPCIds).
			and.theCalendarViewIsProperlySet(oSPCIds, "Day");
	});

	opaTest("Open a Legend when Single Planning Calendar is displayed", function (Given, When, Then) {
		// Actions
		Given.onTheMainPage.iClickOnALegendButton(oSPCIds);

		// Assertions
		Then.onTheMainPage.theCalendarLegendIsOpened();
	});

	opaTest("Select a view from the Single Planning Calendar View Selector", function (Given, When, Then) {
		// Actions
		Given.onTheMainPage.iSelectACalendarView(oSPCIds, "Week");

		// Assertions
		Then.onTheMainPage.theCalendarViewIsProperlySet(oSPCIds, "Week");
	});

	opaTest("Click on the Single Planning Calendar Create Button", function (Given, When, Then) {
		// Actions
		Given.onTheMainPage.iClickOnCreateButton(oSPCIds);

		// Assertions
		Then.onTheMainPage.theMessageToastAppears();
	});

	opaTest("Switch back to the Planning Calendar", function (Given, When, Then) {
		// Actions
		Given.onTheMainPage.iSelectATeamMember(oSPCIds, 0); // select the item with index=0 - Team

		// Assertions
		Then.onTheMainPage.thePlanningCalendarShouldHaveAllTeamMembers(oPCIds).
		and.theTeamSelectorHaveAllTeamMembers(oPCIds).
		and.theCalendarViewIsProperlySet(oPCIds, "Week");

		// Cleanup
		Then.iTeardownMyApp();
	});

});