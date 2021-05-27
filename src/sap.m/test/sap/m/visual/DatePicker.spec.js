/*global describe,it,element,by,browser,protractor,takeScreenshot,expect*/

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

	it("changes the month via picker, when the selected date has maximum year in Gregorian calendar", function() {
		var oCalendar;
		element(by.id("DP15-icon")).click();
		element(by.id("DP15-cal--Head-B1")).click();
		element(by.id("DP15-cal--MP-m11")).click();
		oCalendar = element(by.css("#DP15-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("month_properly_selected");
		browser.actions().sendKeys(protractor.Key.SPACE).perform();
	});

	it("when selecting a date from the day picker by space and enter, the picker is closed", function() {
		var oPickerInput = element(by.css("#DP15")),
			oCalendar;
		element(by.id("DP15-icon")).click();
		oCalendar = element(by.css("#DP15-RP-popover"));
		browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform();
		expect(takeScreenshot(oCalendar)).toLookAs("001_keyboard_Arrow_Left");
		browser.actions().sendKeys(protractor.Key.SPACE).perform();
		expect(takeScreenshot(oPickerInput)).toLookAs("select_date_with_space_for_first_time");

		element(by.id("DP15-icon")).click();
		browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform();
		expect(takeScreenshot(oCalendar)).toLookAs("0003_keyboard_Arrow_Left_two_times");
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot(oPickerInput)).toLookAs("select_date_with_space_for_second_time");
	});
});
