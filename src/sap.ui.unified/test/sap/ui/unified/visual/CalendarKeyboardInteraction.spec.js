/*global describe,it,element,by,takeScreenshot,browser,expect,protractor*/

describe("sap.ui.unified.CalendarKeyboardInteraction", function() {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.Calendar';

	var sCalId = "Cal1",
		oCal = element(by.id(sCalId)),
		iDefaultTimeout = 40000; // timeout for test execution in milliseconds

	it("should handle keyboard navigation", function () {
		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios" && browser.testrunner.runtime.browserName !== "safari") {
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
			if (browser.testrunner.runtime.browserName !== "ie") {
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
		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios" && browser.testrunner.runtime.browserName !== "safari") {
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
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform(); // Month Picker closed, April displayed, focus on 30
			expect(takeScreenshot(oCal)).toLookAs("032_keyboard_MonthPicker_Escape");
		}
	});

	it("should handle keyboard navigation for YearPicker", function () {
		// YearPicker
		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios" && browser.testrunner.runtime.browserName !== "safari") {
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
			browser.actions().sendKeys(protractor.Key.SPACE).perform(); // Year Picker closed, April 1995 displayed, focus on 30
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
			browser.actions().sendKeys(protractor.Key.ESCAPE).perform(); // Year Picker closed, April 1995 displayed, focus on 30
			expect(takeScreenshot(oCal)).toLookAs("044_keyboard_YearPicker_Escape");
		}
	});

	it("YearRangePicker looks OK", function() {
		_initCalendar("1");
		_pressYearPicker(sCalId); // click the year button to open YearPicker
		_pressYearPicker(sCalId); // click the year button again to open YearRangePicker
		expect(takeScreenshot(oCal)).toLookAs("045_year_range_picker_displayed");
	});

	function _initCalendar(sVersion) {
		// initialize via Button function
		element(by.id("B" + sVersion)).click();
		oCal = element(by.id(sCalId));
	}

	function _pressYearPicker(sCalendarId) {
		element(by.id(sCalendarId + "--Head-B2")).click();
	}

});