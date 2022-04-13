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

	it("calendar selection in GMT+12 timezone", testDP16WithTimezoneBtn.bind(null, "btnEtcGMT-12", "GMT+12"));
	it("calendar selection in GMT-12 timezone", testDP16WithTimezoneBtn.bind(null, "btnEtcGMT12", "GMT-12"));
	it("calendar selection in UTC timezone", testDP16WithTimezoneBtn.bind(null, "btnUTC", "UTC"));

	it("January week numbers in UTC timezone", function() {
		var oCalendar;

		element(by.id("btnUTC")).click(); //change the timezone to UTC
		element(by.id("DP2-icon")).click(); //open the picker
		element(by.id("DP2-cal--Head-prev")).click().click(); //navigate to Jan 2014

		oCalendar = element(by.css("#DP2-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("calendar_Jan_2014_UTC");
	});

	function testDP16WithTimezoneBtn(sBtnId, sTimezone) {
		var oInput = element(by.css("#DP16")),
			oValueHelpIcon = element(by.id("DP16-icon")),
			oCalendar;

		element(by.id(sBtnId)).click(); //change the timezone

		oInput.click();
		browser.actions().sendKeys("Mar 2, 2022").perform(); //type Mar 2, 2022

		oValueHelpIcon.click(); //open the picker

		oCalendar = element(by.css("#DP16-RP-popover"));
		expect(takeScreenshot(oCalendar)).toLookAs("calendar_Mar_2_2022_" + sTimezone);

		element(by.id("DP16-cal--Month0-20220309")).click(); //select Mar 9, 2022
		expect(takeScreenshot(oInput)).toLookAs("input_Mar_9_2022_" + sTimezone);

		oValueHelpIcon.click(); //open the picker
		expect(takeScreenshot(oCalendar)).toLookAs("select_Mar_9_2022_" + sTimezone);
	}
});
