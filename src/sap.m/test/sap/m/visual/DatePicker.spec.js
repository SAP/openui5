/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.DatePicker", function() {
	"use strict";

	it("should open the third DatePicker - without footer", function() {
		var oCalendar;
		element(by.id("DP2-icon")).click();
		oCalendar = element(by.css("#DP2-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("picker_without_footer");
	});

	it("should open the second DatePicker and footer is showed", function() {
		var oCalendar;
		element(by.id("DP1_v0-icon")).click();
		oCalendar = element(by.css("#DP1_v0-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("picker_with_footer");
		element(by.id("DP1_v0-cal--Month0-20170620")).click();
		expect(takeScreenshot(oCalendar)).toLookAs("picker_still_opened");
	});

	it("should open a DatePicker (month & year) in compact mode to check the year range", function() {
		var oCalendar;
		element(by.id("DP14-icon")).click();
		element(by.id("DP14-cal--Head-B2")).click();
		oCalendar = element(by.css("#DP14-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("year_range_correctly_rendered");
	});
});
