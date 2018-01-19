/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.DateTimePicker", function() {
	"use strict";

	// verify DateTimePicker is opened and the right date is initially selected and focused
	it("should open second DateTimePicker and 13th of June 2017 should be selected and focused", function() {
		element(by.id("DTP1_v0-icon")).click();
		expect(takeScreenshot(element(by.id("DTP1_v0-cal")))).toLookAs("initial_focused_and_selected");
	});

	// verify action change month selects the current day in the different month
	it("should select the same day and year if the month is changed", function() {
		var oCalendar = element(by.id("DTP1_v0-cal"));
		element(by.id("DTP1_v0-cal--Head-B1")).click();
		element(by.id("DTP1_v0-cal--MP-m7")).click();
		expect(takeScreenshot(oCalendar)).toLookAs("month_changed");
	});

	// verify action change year selects the current day in the different year
	it("should select the same day and month if the year is changed", function() {
		var oCalendar = element(by.id("DTP1_v0-cal"));
		element(by.id("DTP1_v0-cal--Head-B2")).click();
		element(by.id("DTP1_v0-cal--YP-y20130101")).click();
		expect(takeScreenshot(oCalendar)).toLookAs("year_changed");
	});
});
