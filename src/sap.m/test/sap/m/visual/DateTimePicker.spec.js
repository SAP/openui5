/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.DateTimePicker", function() {
	"use strict";

	// verify DateTimePicker is opened and the right date is initially focused
	it("should open second DateTimePicker and 13th of June 2017 should be focused", function() {
		element(by.id("DTP1_v0-icon")).click();
		_takeScreenshot("initial_focused_and_selected");
	});

	// verify that the "OK" button is enabled after a date is selected
	it("should enabled the 'OK' button on date selection", function() {
		element(by.id("DTP1_v0-cal--Month0-20170613")).click();
		_takeScreenshot("confirm_button_enabled");
	});

	// verify action change month selects the current day in the different month
	it("should select the same day and year if the month is changed", function() {
		element(by.id("DTP1_v0-cal--Head-B1")).click();
		element(by.id("DTP1_v0-cal--MP-m7")).click();
		_takeScreenshot("month_changed");
	});

	// verify action change year selects the current day in the different year
	it("should select the same day and month if the year is changed", function() {
		element(by.id("DTP1_v0-cal--Head-B2")).click();
		element(by.id("DTP1_v0-cal--YP-y20130101")).click();
		_takeScreenshot("year_changed");
	});

	function _takeScreenshot(img) {
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			var oCalendar = element(by.css("#DTP1_v0-RP-popover"));
			expect(takeScreenshot(oCalendar)).toLookAs(img);
		} else {
			expect(takeScreenshot()).toLookAs(img);
		}
	}
});
