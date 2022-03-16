/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.DateTimePicker", function() {
	"use strict";

	// verify DateTimePicker is opened and the right date is initially focused
	it("should open second DateTimePicker and 13th of June 2017 should be focused", function() {
		element(by.id("DTP1_v0-icon")).click();
		_takeScreenshot("DTP1_v0", "initial_focused_and_selected");
	});

	// verify that the "OK" button is enabled after a date is selected
	it("should enabled the 'OK' button on date selection", function() {
		element(by.id("DTP1_v0-cal--Month0-20170613")).click();
		_takeScreenshot("DTP1_v0", "confirm_button_enabled");
	});

	// verify action change month selects the current day in the different month
	it("should select the same day and year if the month is changed", function() {
		element(by.id("DTP1_v0-cal--Head-B1")).click();
		element(by.id("DTP1_v0-cal--MP-m7")).click();
		_takeScreenshot("DTP1_v0", "month_changed");
	});

	// verify action change year selects the current day in the different year
	it("should select the same day and month if the year is changed", function() {
		element(by.id("DTP1_v0-cal--Head-B2")).click();
		element(by.id("DTP1_v0-cal--YP-y20130101")).click();
		_takeScreenshot("DTP1_v0", "year_changed");
	});

	it("should verify that tab navigation works properly", function() {
		element(by.id("DTP2-icon")).click();
		_takeScreenshot("DTP2", "forward_focus_calendar_grid");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		_takeScreenshot("DTP2", "forward_focus_month_button");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		_takeScreenshot("DTP2", "forward_focus_year_button");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		_takeScreenshot("DTP2", "forward_focus_today_button");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		_takeScreenshot("DTP2", "forward_focus_hours_input");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		_takeScreenshot("DTP2", "forward_focus_minutes_input");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		_takeScreenshot("DTP2", "forward_focus_am_pm_button");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		_takeScreenshot("DTP2", "forward_focus_current_time_button");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		_takeScreenshot("DTP2", "forward_focus_ok_button");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		_takeScreenshot("DTP2", "forward_focus_cancel_button");
	});

	it("should verify that backward navigation with shift and tab works properly", function() {
		var shiftTab = protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB);
		_takeScreenshot("DTP2", "backward_focus_cancel_button");
		browser.actions().sendKeys(shiftTab).perform();
		_takeScreenshot("DTP2", "backward_focus_ok_button");
		browser.actions().sendKeys(shiftTab).perform();
		_takeScreenshot("DTP2", "backward_focus_current_time_button");
		browser.actions().sendKeys(shiftTab).perform();
		_takeScreenshot("DTP2", "backward_focus_am_pm_button");
		browser.actions().sendKeys(shiftTab).perform();
		_takeScreenshot("DTP2", "backward_focus_minutes_input");
		browser.actions().sendKeys(shiftTab).perform();
		_takeScreenshot("DTP2", "backward_focus_hours_input");
		browser.actions().sendKeys(shiftTab).perform();
		_takeScreenshot("DTP2", "backward_focus_today_button");
		browser.actions().sendKeys(shiftTab).perform();
		_takeScreenshot("DTP2", "backward_focus_year_button");
		browser.actions().sendKeys(shiftTab).perform();
		_takeScreenshot("DTP2", "backward_focus_month_button");
		browser.actions().sendKeys(shiftTab).perform();
		_takeScreenshot("DTP2", "backward_focus_calendar_grid");
	});

	function _takeScreenshot(id, img) {
		var oPopover = element(by.css("#" + id + "-RP-popover"));
		expect(takeScreenshot(oPopover)).toLookAs(img);
	}
});
