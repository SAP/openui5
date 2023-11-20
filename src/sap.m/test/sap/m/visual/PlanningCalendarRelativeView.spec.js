/*global describe,it,takeScreenshot,browser,expect,element,by*/

describe("sap.m.PlanningCalendarRelativeView", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.PlanningCalendar';

	it("should render planningCalendar", function() {
		expect(takeScreenshot()).toLookAs("planning_calendar");
	});

	it("should render planningCalendar", function() {
		element(by.id("PC2-2-button")).click();
		expect(takeScreenshot()).toLookAs("planning_calendar_relative_week_period");
		element(by.id("PC2-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot()).toLookAs("planning_calendar_relative_picker_week");
	});

	it("should render planningCalendar", function() {
		element(by.id("PC2-3-button")).click();
		expect(takeScreenshot()).toLookAs("planning_calendar_relative_relative_day");
		element(by.id("PC2-Header-NavToolbar-PickerBtn")).click();
		expect(takeScreenshot()).toLookAs("planning_calendar_relative_picker_day");
	});
});
