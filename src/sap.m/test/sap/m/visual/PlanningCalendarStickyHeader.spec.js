/*global describe,it,element,by,takeScreenshot,browser,protractor,expect*/

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

	it("first row is fully visible after it gets navigated to via keyboard", function() {
		//Row5-Head-content
		element(by.id("Row5-Head-content")).click();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		expect(takeScreenshot()).toLookAs("calendar_with_sticky_header_clear_focus");
	});

});
