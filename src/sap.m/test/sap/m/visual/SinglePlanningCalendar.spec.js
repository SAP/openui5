/*global describe,beforeEach, it,element,by,takeScreenshot,expect*/

describe("sap.m.SinglePlanningCalendar", function() {
	"use strict";

	beforeEach(function() {
		// This triggers the overriding of the current date, which is needed in order to have
		// the now marker at the same position every time the test is run.
		element(by.id("overrideTime")).click();
	});

	it('should load test page on day view', function () {
		// element(by.id("overrideTime")).click();
		expect(takeScreenshot(element(by.id("SinglePlanningCalendar")))).toLookAs("day_view");
	});

	it("should navigate to work week view", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("__item2-button")).click();
		// element(by.id("overrideTime")).click();

		expect(takeScreenshot(oSPC)).toLookAs("work_week_view");
	});

	it("should navigate to week view", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		element(by.id("__item3-button")).click();
		// element(by.id("overrideTime")).click();

		expect(takeScreenshot(oSPC)).toLookAs("week_view");
	});

	it("should show full day", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		// element(by.id("overrideTime")).click();
		element(by.id("showFullDayButton")).click();

		expect(takeScreenshot(oSPC)).toLookAs("full_day");
	});

	it("should show full day", function () {
		var oSPC = element(by.id("SinglePlanningCalendar"));

		// element(by.id("overrideTime")).click();
		element(by.id("SinglePlanningCalendar-Header-NavToolbar-PickerBtn")).click();

		expect(takeScreenshot(oSPC)).toLookAs("opened_picker");
	});

});
