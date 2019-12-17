/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.DateRangeSelection", function() {
	"use strict";

	it("should highlight the hovered month", function() {
		var oCalendar;
		element(by.id("DRS8-icon")).click();
		element(by.id("DRS8-cal--MP-m5")).click();
		browser.actions().mouseMove(element(by.id("DRS8-cal--MP-m10"))).perform();
		oCalendar = element(by.css("#DRS8-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("month_hovered");
		element(by.id("DRS8-cal--MP-m10")).click();
	});

	it("should select a range of months", function() {
		var oCalendar;
		element(by.id("DRS8-icon")).click();
		oCalendar = element(by.css("#DRS8-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("month_range_selected");
	});

	it("should move mouse over a year", function() {
		var oCalendar;
		element(by.id("DRS10-icon")).click();
		element(by.id("DRS10-cal--YP-y20140101")).click();
		browser.actions().mouseMove(element(by.id("DRS10-cal--YP-y20230101"))).perform();
		oCalendar = element(by.css("#DRS10-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("hovered");
		element(by.id("DRS10-cal--YP-y20230101")).click();
	});

	it("should select a range of months", function() {
		var oCalendar;
		element(by.id("DRS10-icon")).click();
		oCalendar = element(by.css("#DRS10-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("year_range_selected");
	});

});
