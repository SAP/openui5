/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.PlanningCalendarStickyHeader", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.PlanningCalendar';

	it("should render the whole page", function() {
		expect(takeScreenshot()).toLookAs("calendar_with_sticky_header");
	});

	it("should scroll", function() {
		element(by.id("R5A4")).click();
		expect(takeScreenshot()).toLookAs("calendar_with_sticky_header_scrolled");
	});

});
