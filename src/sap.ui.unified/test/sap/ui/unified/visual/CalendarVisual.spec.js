/*global describe,it,element,by,takeScreenshot,browser,expect,protractor*/

describe("sap.ui.unified.CalendarVisual", function() {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.Calendar';

	var sCalId = "Cal1",
		oCal = element(by.id(sCalId));

	it("should show calendar with a width set", function () {
		_initCalendar("5");
		expect(takeScreenshot(oCal)).toLookAs("060_width_set");
	});

	it("should test multiple day selection", function () {
		_initCalendar("3");
		expect(takeScreenshot(oCal)).toLookAs("080_multiple_day_selection_initilal");

		_pressDate(sCalId, "20150120"); // 2 and 20 selected, 20 focused
		expect(takeScreenshot(oCal)).toLookAs("081_multiple_day_selection_press_date1");
		_pressDate(sCalId, "20150122"); // 2, 20, 22 selected, 22 focused
		expect(takeScreenshot(oCal)).toLookAs("082_multiple_day_selection_press_date2");
		_pressDate(sCalId, "20150120"); // 2 and 22 selected, 20 focused
		expect(takeScreenshot(oCal)).toLookAs("083_multiple_day_selection_press_date3");
	});

	it("should show calendar with current date button", function () {
		_initCalendar("9");

		var sShiftTab = protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB);
		browser.actions().sendKeys(sShiftTab).perform();
		expect(takeScreenshot(oCal)).toLookAs("today_button_focus");
	});

	it("should show arabic two months calendar in RTL", function () {
		_initCalendar("RTL");

		expect(takeScreenshot(oCal)).toLookAs("Arabic_two_months_calendar");
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

});