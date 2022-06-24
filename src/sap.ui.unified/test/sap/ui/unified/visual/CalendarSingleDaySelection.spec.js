/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.ui.unified.CalendarSingleDaySelection", function() {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.Calendar';

	var sCalId = "Cal1",
		oCal = element(by.id(sCalId));

	// initial loading
	it("should load test page", function () {
		_initCalendar("1");
		expect(takeScreenshot(oCal)).toLookAs("000_initial_Rendering"); // January 2015 rendered, 2 selected, no focus
	});

	it("should select a date by click", function () {
		_pressDate(sCalId, "20150120"); // 20 selected a focused (2 unselected)
		expect(takeScreenshot(oCal)).toLookAs("001_press_date");
	});

	it("should select a date in other month by click to other month", function () {
		_pressDate(sCalId, "20141230"); // month says on January 2015, 20. January focused and 30. December selected
		expect(takeScreenshot(oCal)).toLookAs("002_press_date_other_month");
	});

	it("should show the previous month by click on prev-button", function () {
		_initCalendar("1");
		_pressPrev(sCalId); // December 2014 shown, 31 focus
		expect(takeScreenshot(oCal)).toLookAs("003_press_previous");
	});

	it("should show the next month by click on next-button", function () {
		_initCalendar("1");
		_pressNext(sCalId); // February 2015 shown, 1 focus
		expect(takeScreenshot(oCal)).toLookAs("004_press_next");
	});

	it("should handle the month picker", function () {
		_initCalendar("1");
		_pressMonthPicker(sCalId);  // month picker opened, January selected and focused
		expect(takeScreenshot(oCal)).toLookAs("005_MonthPicker");
		_pressPrev(sCalId); // year changed to 2014
		expect(takeScreenshot(oCal)).toLookAs("006_MonthPicker_Previous");
		_pressMonth(sCalId, "1"); // month picker closed, February 2014 shown, 2 focused

		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios") {
			browser.actions().mouseMove(element(by.css("#B1"))).perform();
			expect(takeScreenshot(oCal)).toLookAs("007_MonthPicker_Select");
		}
	});

	it("should handle the year picker", function () {
		_initCalendar("1");
		_pressYearPicker(sCalId);  // year Picker shown, 2015 selected and focused
		expect(takeScreenshot(oCal)).toLookAs("008_YearPicker");
		_pressPrev(sCalId); // years changed to 1985-2004, 1995 focused
		expect(takeScreenshot(oCal)).toLookAs("009_YearPicker_Previous");
		_pressYear(sCalId, "1990"); // year picker closed, January 1990 shown, 2 focused

		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios") {
			browser.actions().mouseMove(element(by.css("#B1"))).perform();
			expect(takeScreenshot(oCal)).toLookAs("010_YearPicker_Select");
		}
	});

	function _initCalendar(sVersion) {
		// initialize via Button function
		element(by.id("B" + sVersion)).click();
		oCal = element(by.id(sCalId));
	}

	function _pressDate(sCalendarId, sNewDate) {
		var sDateId = sCalendarId + "--Month0-" + sNewDate;
		element(by.id(sDateId)).click();
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