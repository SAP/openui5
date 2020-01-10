/*global describe,it,element,by,takeScreenshot,browser,expect,protractor*/

describe("sap.ui.unified.CalendarVisual", function() {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.Calendar';

	var sCalId = "Cal1",
		oCal = element(by.id(sCalId)),
		iDefaultTimeout = 60000; // timeout for test execution in milliseconds

	singleDaySelection();
	twoTypes();
	widthSet();
	intervalSelection();
	multiDaySelection();
	multiMonthSelection();

	function singleDaySelection(){
		// initial loading
		it("should load test page", function () {
			_initCalendar("1");
			expect(takeScreenshot(oCal)).toLookAs("000_initial_Rendering"); // January 2015 rendered, 2 selected, no focus
		});

		it("should select a date by click", function () {
			_pressDate(sCalId, "20150120"); // 20 selected an focused (2 unselected)
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

			if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
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

			if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
				browser.actions().mouseMove(element(by.css("#B1"))).perform();
				expect(takeScreenshot(oCal)).toLookAs("010_YearPicker_Select");
			}
		});

		keyboardTest();
	}

	function keyboardTest(){
		it("should handle keyboard navigation", function () {
			if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios" && browser.testrunner.runtime.browserName != "safari") {
				// only on desktop and not in Safari (sendKeys needs an Element in Safari, so test makes no sense there)
				_initCalendar("1");
				browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform(); // focus on 9
				expect(takeScreenshot(oCal)).toLookAs("011_keyboard_Arrow_Down");
				browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform(); // focus on 10
				expect(takeScreenshot(oCal)).toLookAs("012_keyboard_Arrow_Right");
				browser.actions().sendKeys(protractor.Key.ARROW_UP).perform(); // focus on 3
				expect(takeScreenshot(oCal)).toLookAs("013_keyboard_Arrow_Up");
				browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform(); // focus on 2
				expect(takeScreenshot(oCal)).toLookAs("014_keyboard_Arrow_Left");

				browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform(); // focus on 1
				browser.actions().sendKeys(protractor.Key.ENTER).perform(); // 1 selected
				expect(takeScreenshot(oCal)).toLookAs("015_keyboard_Enter");
				browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform(); // switch to December, focus on 31
				expect(takeScreenshot(oCal)).toLookAs("016_keyboard_Arrow_Left_other_Month");
				browser.actions().sendKeys(protractor.Key.SPACE).perform(); // 31 selected
				expect(takeScreenshot(oCal)).toLookAs("017_keyboard_Space");

				browser.actions().sendKeys(protractor.Key.PAGE_UP).perform(); // switch to November, focus on 30
				expect(takeScreenshot(oCal)).toLookAs("018_keyboard_PAGE_Up");
				browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform(); // switch to December, focus on 30
				expect(takeScreenshot(oCal)).toLookAs("019_keyboard_PABE_Down");

				browser.actions().sendKeys(protractor.Key.TAB).perform(); // focus on month
				expect(takeScreenshot(oCal)).toLookAs("020_keyboard_Tab1");
				browser.actions().sendKeys(protractor.Key.TAB).perform(); // focus on year
				expect(takeScreenshot(oCal)).toLookAs("021_keyboard_Tab2");
				browser.actions().sendKeys(protractor.Key.TAB).perform(); // focus leaves calendar
				expect(takeScreenshot(oCal)).toLookAs("022_keyboard_Tab3");

				var sShiftTab = protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB);
				browser.actions().sendKeys(sShiftTab).perform(); // focus on year
				expect(takeScreenshot(oCal)).toLookAs("023_keyboard_Shift_Tab1");
				if (browser.testrunner.runtime.browserName != "ie") {
					browser.actions().sendKeys(sShiftTab).perform(); // focus on month
					expect(takeScreenshot(oCal)).toLookAs("024_keyboard_Shift_Tab2");
					browser.actions().sendKeys(sShiftTab).perform(); // focus on 30
					expect(takeScreenshot(oCal)).toLookAs("025_keyboard_Shift_Tab3");
				} else {
					// shift+Tab don't work in selenium on IE on year and month button - So try to get to the December 30
					element(by.id("__page0-title")).click();
					browser.actions().sendKeys(protractor.Key.TAB).perform();
				}
			}
		}, iDefaultTimeout);

		it("should handle keyboard navigation for MonthPicker", function () {
			// MonthPicker
			if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios" && browser.testrunner.runtime.browserName != "safari") {
				// only on desktop and not in Safari (sendKeys needs an Element in Safari, so test makes no sense there)
				browser.actions().sendKeys(protractor.Key.TAB).perform();
				browser.actions().sendKeys(protractor.Key.SPACE).perform(); // month picker open, focus on December
				expect(takeScreenshot(oCal)).toLookAs("026_keyboard_Month_Space");
				browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform(); // focus on March 2015
				expect(takeScreenshot(oCal)).toLookAs("027_keyboard_MonthPicker_Arrow_Down");
				browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform(); // focus on April 2015
				expect(takeScreenshot(oCal)).toLookAs("028_keyboard_MonthPicker_Arrow_Right");
				browser.actions().sendKeys(protractor.Key.SPACE).perform(); // Month Picker closed, April displayed, focus on 30
				expect(takeScreenshot(oCal)).toLookAs("029_keyboard_MonthPicker_Space");

				browser.actions().sendKeys(protractor.Key.TAB).perform();
				browser.actions().sendKeys(protractor.Key.ENTER).perform(); // month picker open, focus on April
				expect(takeScreenshot(oCal)).toLookAs("030_keyboard_MonthPicker_Enter");
				browser.actions().sendKeys(protractor.Key.ARROW_UP).perform(); // focus on January
				expect(takeScreenshot(oCal)).toLookAs("031_keyboard_MonthPicker_Arrow_UP");
				browser.actions().sendKeys(protractor.Key.ESCAPE).perform(); // Month Picker closed, January displayed, focus on 30
				expect(takeScreenshot(oCal)).toLookAs("032_keyboard_MonthPicker_Escape");
			}
		}, iDefaultTimeout);

		it("should handle keyboard navigation for YearPicker", function () {
			// YearPicker
			if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios" && browser.testrunner.runtime.browserName != "safari") {
				// only on desktop and not in Safari (sendKeys needs an Element in Safari, so test makes no sense there)
				browser.actions().sendKeys(protractor.Key.TAB).perform();
				browser.actions().sendKeys(protractor.Key.TAB).perform();
				browser.actions().sendKeys(protractor.Key.SPACE).perform(); // year Picker open, focus on 2015
				expect(takeScreenshot(oCal)).toLookAs("033_keyboard_Year_Space");
				browser.actions().sendKeys(protractor.Key.ARROW_UP).perform(); // focus on 2011
				expect(takeScreenshot(oCal)).toLookAs("034_keyboard_YearPicker_Arrow_UP");
				browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform(); // focus on 2010
				expect(takeScreenshot(oCal)).toLookAs("035_keyboard_YearPicker_Arrow_Left");
				browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform(); // focus on 2014
				expect(takeScreenshot(oCal)).toLookAs("036_keyboard_YearPicker_Arrow_Down");
				browser.actions().sendKeys(protractor.Key.PAGE_UP).perform(); // years changed, focus on 1994
				expect(takeScreenshot(oCal)).toLookAs("037_keyboard_YearPicker_Page_UP");
				browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform(); // focus on 1995
				expect(takeScreenshot(oCal)).toLookAs("038_keyboard_YearPicker_Arrow_Right");
				browser.actions().sendKeys(protractor.Key.SPACE).perform(); // Year Picker closed, January 1995 displayed, focus on 30
				expect(takeScreenshot(oCal)).toLookAs("039_keyboard_YearPicker_Space");

				browser.actions().sendKeys(protractor.Key.TAB).perform();
				browser.actions().sendKeys(protractor.Key.TAB).perform();
				browser.actions().sendKeys(protractor.Key.ENTER).perform(); // year Picker open, focus on 1995 (selected)
				expect(takeScreenshot(oCal)).toLookAs("040_keyboard_Year_ENTER");
				browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform(); // years changed, focus on 2015
				expect(takeScreenshot(oCal)).toLookAs("041_keyboard_YearPicker_Page_DOWN");
				browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
				browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform(); // focus on 2017
				expect(takeScreenshot(oCal)).toLookAs("042_keyboard_YearPicker_Arrow_Right2");
				browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
				browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform(); // years changed, focus on 2025
				expect(takeScreenshot(oCal)).toLookAs("043_keyboard_YearPicker_Arrow_Down2");
				browser.actions().sendKeys(protractor.Key.ESCAPE).perform(); // Year Picker closed, January 1995 displayed, focus on 30
				expect(takeScreenshot(oCal)).toLookAs("044_keyboard_YearPicker_Escape");

				_initCalendar("1");
			}
		});

		it("YearRangePicker looks OK", function() {
			_pressYearPicker(sCalId); // click the year button to open YearPicker
			_pressYearPicker(sCalId); // click the year button again to open YearRangePicker
			expect(takeScreenshot(oCal)).toLookAs("045_year_range_picker_displayed");
		});
	}

	function twoTypes(){
		it("should show calendar with two types", function () {
			_initCalendar("4");
			expect(takeScreenshot(oCal)).toLookAs("050_two_types");
		});
	}

	function widthSet(){
		it("should show calendar with a width set", function () {
			_initCalendar("5");
			expect(takeScreenshot(oCal)).toLookAs("060_width_set");
		});
	}

	function intervalSelection(){
		it("should test interval selection", function () {
			_initCalendar("2");
			expect(takeScreenshot(oCal)).toLookAs("070_interval_selection_initial");

			_pressDate(sCalId, "20150120"); // old interval unselected, 20 selected and focused
			expect(takeScreenshot(oCal)).toLookAs("071_select_interval_start");
			_pressDate(sCalId, "20150122"); // 20-22 selected, 22 focused
			expect(takeScreenshot(oCal)).toLookAs("072_select_interval_end");
			_initCalendar("2");

			if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
				var sStartDateId = sCalId + "--Month0-" + "20150120";
				var sEndDateId = sCalId + "--Month0-" + "20150130";
				browser.actions().dragAndDrop(element(by.id(sStartDateId)), element(by.id(sEndDateId))).perform(); // old interval unselected, 20-30 selected, 30 focused
				expect(takeScreenshot(oCal)).toLookAs("073_select_interval_move");
			}
		});
	}

	function multiDaySelection(){
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
	}

	function multiMonthSelection(){
		it("should test multiple month display", function () {
			// we have multiple months displayed only on desktop, so skip the tests for mobile
			if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
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

				if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
					browser.actions().mouseMove(element(by.css("#B1"))).perform();
					expect(takeScreenshot(oCal)).toLookAs("094_multiple_month_MonthPicker_Select");
				}

				_initCalendar("6");
				_pressYearPicker(sCalId);   // year Picker shown, 2015 selected and focused
				expect(takeScreenshot(oCal)).toLookAs("095_multiple_month_YearPicker");
				_pressYear(sCalId, "2014"); // year picker closed, January-April 2014 shown, January 31 focused

				browser.actions().mouseMove(element(by.css("#B1"))).perform();
				expect(takeScreenshot(oCal)).toLookAs("096_multiple_month_YearPicker_Select");
			}
		}, iDefaultTimeout);

		it("should test multiple month display keyboard handling", function () {
			if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios" && browser.testrunner.runtime.browserName != "safari") {
				// only on desktop and not in Safari (sendKeys needs an Element in Safari, so test makes no sense there)
				_initCalendar("6");
				browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform(); // focus on February 1
				expect(takeScreenshot(oCal)).toLookAs("097_multiple_month_keyboard_Arrow_Right");
				browser.actions().sendKeys(protractor.Key.ARROW_UP).perform(); // focus on January 25
				expect(takeScreenshot(oCal)).toLookAs("098_multiple_month_keyboard_Arrow_UP");
				browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform(); // focus on February 1
				expect(takeScreenshot(oCal)).toLookAs("099_multiple_month_keyboard_Arrow_Down");
				browser.actions().sendKeys(protractor.Key.ARROW_LEFT).perform(); // focus on January 31
				expect(takeScreenshot(oCal)).toLookAs("100_multiple_month_keyboard_Arrow_Left");

				browser.actions().sendKeys(protractor.Key.PAGE_UP).perform(); // switch to December-March, focus on December 31
				expect(takeScreenshot(oCal)).toLookAs("101_multiple_month_keyboard_Page_Up1");
				browser.actions().sendKeys(protractor.Key.PAGE_UP).perform(); // focus on November-February 30
				expect(takeScreenshot(oCal)).toLookAs("102_multiple_month_keyboard_Page_Up2");
				browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform(); // focus on December-March 30
				expect(takeScreenshot(oCal)).toLookAs("103_multiple_month_keyboard_Page_Down1");
				browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform();  // switch to January-April, focus on January 30
				expect(takeScreenshot(oCal)).toLookAs("103_multiple_month_keyboard_Page_Down2");
			}
		});

		it("sap.ui.unified.calendar.Header looks OK when chinese language is set and calendar has two months", function() {
			_initCalendar("7");
			expect(takeScreenshot(oCal)).toLookAs("104_month_displayed");
			_pressYearPicker(sCalId); // click the year button to open YearPicker
			expect(takeScreenshot(oCal)).toLookAs("105_year_picker_displayed");
		});
	}

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