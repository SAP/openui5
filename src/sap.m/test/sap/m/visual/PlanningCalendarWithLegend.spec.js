/*global describe,it,takeScreenshot,browser,expect*/

describe("sap.m.PlanningCalendarWithLegend", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.PlanningCalendar';

	it("should render planningCalendar with legend", function() {
		expect(takeScreenshot()).toLookAs("planning_calendar_with_legend");
	});

});
