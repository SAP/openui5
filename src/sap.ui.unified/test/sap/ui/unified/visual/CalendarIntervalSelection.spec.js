/*global describe,it,element,by,takeScreenshot,browser,expect,protractor*/

describe("sap.ui.unified.CalendarIntervalSelection", function() {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.Calendar';

	var sCalId = "Cal1",
		oCal = element(by.id(sCalId));

	it("should test interval selection", function () {
		_initCalendar("2");
		expect(takeScreenshot(oCal)).toLookAs("070_interval_selection_initial");

		_pressDate(sCalId, "20150120"); // old interval unselected, 20 selected and focused
		expect(takeScreenshot(oCal)).toLookAs("071_select_interval_start");
		_pressDate(sCalId, "20150122"); // 20-22 selected, 22 focused
		expect(takeScreenshot(oCal)).toLookAs("072_select_interval_end");
		_initCalendar("2");

		if (browser.testrunner.runtime.platformName !== "android" && browser.testrunner.runtime.platformName !== "ios") {
			var sStartDateId = sCalId + "--Month0-" + "20150120";
			var sEndDateId = sCalId + "--Month0-" + "20150130";
			browser.actions().dragAndDrop(element(by.id(sStartDateId)), element(by.id(sEndDateId))).perform(); // old interval unselected, 20-30 selected, 30 focused
			expect(takeScreenshot(oCal)).toLookAs("073_select_interval_move");
		}

		_initCalendar("2");
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		browser.actions().sendKeys(protractor.Key.PAGE_UP).perform();
		expect(takeScreenshot(oCal)).toLookAs("074_select_interval_unfinished");
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