/*global describe,it,element,by,takeScreenshot,browser,expect,protractor*/

describe("sap.ui.unified.CalendarMultipleMonths", function() {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.Calendar';

	var sCalId = "Cal1",
		oCal = element(by.id(sCalId)),
		iDefaultTimeout = 40000; // timeout for test execution in milliseconds;

	it("should test multiple month display", function () {
		// we have multiple months displayed only on desktop, so skip the tests for mobile
		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios") {
			_initCalendar("6");
			expect(takeScreenshot(oCal)).toLookAs("090_multiple_month_initilal");

			_pressPrev(sCalId); // month switched to December 2014, 31 focused
			expect(takeScreenshot(oCal)).toLookAs("091_multiple_month_press_previous");

			_initCalendar("6");
			_pressNext(sCalId); // month switched to February 2015, 1 focused
			expect(takeScreenshot(oCal)).toLookAs("092_multiple_month_press_next");

			_initCalendar("6");
			_pressMonthPicker(sCalId);  // month picker opened, January selected and focused
			expect(takeScreenshot(oCal)).toLookAs("093_multiple_month_MonthPicker");
			_pressMonth(sCalId, "1"); // month picker closed, February 28 focused

			_initCalendar("6");
			_pressYearPicker(sCalId);   // year Picker shown, 2015 selected and focused
			expect(takeScreenshot(oCal)).toLookAs("094_multiple_month_YearPicker");
			_pressYear(sCalId, "2014"); // year picker closed, January-April 2014 shown, January 31 focused

			expect(takeScreenshot(oCal)).toLookAs("095_multiple_month_YearPicker_Select");
		}
	});

	it("should test multiple month display keyboard handling", function () {
		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios" && browser.testrunner.runtime.browserName !== "safari") {
			// only on desktop and not in Safari (sendKeys needs an Element in Safari, so test makes no sense there)
			_initCalendar("6");
			browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform(); // focus on February 1
			expect(takeScreenshot(oCal)).toLookAs("096_multiple_month_keyboard_Arrow_Right");
			browser.actions().sendKeys(protractor.Key.ARROW_UP).perform(); // focus on January 25
			expect(takeScreenshot(oCal)).toLookAs("097_multiple_month_keyboard_Arrow_UP");
			browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform(); // focus on February 1
			expect(takeScreenshot(oCal)).toLookAs("098_multiple_month_keyboard_Arrow_Down");
			browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform(); // focus on January 31
			expect(takeScreenshot(oCal)).toLookAs("099_multiple_month_keyboard_Arrow_Left");

			browser.actions().sendKeys(protractor.Key.PAGE_UP).perform(); // switch to December-March, focus on December 31
			expect(takeScreenshot(oCal)).toLookAs("100_multiple_month_keyboard_Page_Up1");
			browser.actions().sendKeys(protractor.Key.PAGE_UP).perform(); // switch to November-February, focus on November 30
			expect(takeScreenshot(oCal)).toLookAs("101_multiple_month_keyboard_Page_Up2");
			browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform(); // focus on December 30
			expect(takeScreenshot(oCal)).toLookAs("102_multiple_month_keyboard_Page_Down1");
			browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform();  // focus on January 30
			expect(takeScreenshot(oCal)).toLookAs("102_multiple_month_keyboard_Page_Down2");
		}
	});

	it("sap.ui.unified.calendar.Header looks OK when chinese language is set", function() {
		_initCalendar("70");
		expect(takeScreenshot(oCal)).toLookAs("103_month_displayed");
	});

	it("sap.ui.unified.calendar.Header looks OK when chinese language is set and calendar has two months", function() {
		_initCalendar("7");
		expect(takeScreenshot(oCal)).toLookAs("104_month_displayed");
		_pressYearPicker(sCalId); // click the year button to open YearPicker
		expect(takeScreenshot(oCal)).toLookAs("105_year_picker_displayed");
	});

	it("sap.ui.unified.calendar.Header should test two months header button", function() {
		_initCalendar("8");
		expect(takeScreenshot(oCal)).toLookAs("106_month_displayed");
		_pressNext(sCalId); // Month switched to February - March
		expect(takeScreenshot(oCal)).toLookAs("107_february_march_displayed");
		_pressPrev(sCalId); // Month switch to January - February
		expect(takeScreenshot(oCal)).toLookAs("108_january_february_displayed");
		_pressMonthPicker(sCalId); //right month picker open, focus on January
		expect(takeScreenshot(oCal)).toLookAs("109_month_picker_displayed_focus_january");
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // Show month is April and May
		expect(takeScreenshot(oCal)).toLookAs("110_month_displayed_apr_may");
		_pressMonthPickerSecondHeader(sCalId); //left month picker open, focus on May
		expect(takeScreenshot(oCal)).toLookAs("111_month_picker_displayed_focus_may");
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // Show month December prev. year and January
		expect(takeScreenshot(oCal)).toLookAs("112_month_displayed_dec_jan");
		_pressPrev(sCalId); // Month switch to Nov. - Dec.
		expect(takeScreenshot(oCal)).toLookAs("113_november_december_displayed");
		_pressNext(sCalId); // Month switch to Dec. - Jan next year
		expect(takeScreenshot(oCal)).toLookAs("114_december_january_displayed");
		_pressNext(sCalId); // Month switch to Jan - Feb
		expect(takeScreenshot(oCal)).toLookAs("115_january_february_displayed");
		_pressMonthPicker(sCalId);
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // Month switch to Jul - Aug
		element(by.css("[data-sap-day='20150827']")).click(); // Select a day after max date
		expect(takeScreenshot(oCal)).toLookAs("116_24_august_focused"); // Max date is focused
	}, iDefaultTimeout);

	it("sap.ui.unified.calendar.Header elements in the TAB chain", function() {
		_initCalendar("8");
		expect(takeScreenshot(oCal)).toLookAs("117_2th_january_focused");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		expect(takeScreenshot(oCal)).toLookAs("118_first_month_button_focused");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		expect(takeScreenshot(oCal)).toLookAs("119_first_year_button_focused");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		expect(takeScreenshot(oCal)).toLookAs("120_focus_moves_after_the_calendar");
	});

	function _initCalendar(sVersion) {
		// initialize via Button function
		element(by.id("B" + sVersion)).click();
		oCal = element(by.id(sCalId));
	}

	function _pressPrev(sCalendarId) {
		element(by.id(sCalendarId + "--Head-prev")).click();
	}

	function _pressNext(sCalendarId) {
		element(by.id(sCalendarId + "--Head-next")).click();
	}

	function _pressMonthPicker(sCalendarId) {
		element(by.id(sCalendarId + "--Head-B1")).click();
	}

	function _pressMonthPickerSecondHeader(sCalendarId) {
		element(by.id(sCalendarId + "--Head-B3")).click();
	}

	function _pressYearPicker(sCalendarId) {
		element(by.id(sCalendarId + "--Head-B2")).click();
	}

	function _pressMonth(sCalendarId, sNewMonth) {
		var sMonthId = sCalendarId + "--MP-m" + sNewMonth;
		element(by.id(sMonthId)).click();
	}

	function _pressYear(sCalendarId, sNewYear) {
		var sYearId = sCalendarId + "--YP-y" + sNewYear + "0101";
		element(by.id(sYearId)).click();
	}

});