/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.TimePickerVisualPart2", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.TimePicker';

	var iDefaultTimeout = 50000; // timeout for test execution in milliseconds

	// 12 hours clock
	it("keyboard interaction: time picker with display format - 'h:mm:ss a'", function() {
		element(by.id("TP12-icon")).click();

		var oClock = element(by.id("page1-cont"));
		expect(takeScreenshot(oClock)).toLookAs("TP12_hours_9_15_16_initial");

		// Hours shortcut
		browser.actions().sendKeys(protractor.Key.PAGE_UP).perform();
		expect(takeScreenshot(oClock)).toLookAs("TP12_hours_10_15_16_page_up");

		browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform();
		expect(takeScreenshot(oClock)).toLookAs("TP12_hours_9_15_16_page_down");

		// Minutes shortcut
		browser.actions().keyDown(protractor.Key.SHIFT).perform();

		browser.actions().sendKeys(protractor.Key.PAGE_UP).perform();
		expect(takeScreenshot(oClock)).toLookAs("TP12_minutes_9_16_16_page_up");

		browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform();
		expect(takeScreenshot(oClock)).toLookAs("TP12_minutes_9_15_16_page_down");

		// Seconds shortcut
		browser.actions().keyDown(protractor.Key.CONTROL).perform();

		browser.actions().sendKeys(protractor.Key.PAGE_UP).perform();
		expect(takeScreenshot(oClock)).toLookAs("TP12_seconds_9_15_17_page_up");

		browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform();
		expect(takeScreenshot(oClock)).toLookAs("TP12_seconds_9_15_16_page_down");

		// Separator shortcut
		browser.actions().keyUp(protractor.Key.CONTROL).perform();
		browser.actions().sendKeys(':').perform();
		expect(takeScreenshot(oClock)).toLookAs("TP12_hours_9_15_16_separator");

		browser.actions().sendKeys(':').perform();
		expect(takeScreenshot(oClock)).toLookAs("TP12_minutes_9_15_16_separator");

		browser.actions().sendKeys(':').perform();
		expect(takeScreenshot(oClock)).toLookAs("TP12_seconds_9_15_16_separator");

		browser.actions().keyUp(protractor.Key.SHIFT).perform();

		// Close popover
		element(by.id("TP12-Cancel")).click();
	}, iDefaultTimeout);

	// 24 hours clock
	it("keyboard interaction: time picker with display format - 'HH:mm'", function() {
		element(by.id("TP24-icon")).click();
		var oClock = element(by.id("page1-cont"));
		expect(takeScreenshot(oClock)).toLookAs("TP24_hours_21_15_initial");

		// Hours shortcut
		browser.actions().sendKeys(protractor.Key.PAGE_UP).perform();
		expect(takeScreenshot(oClock)).toLookAs("TP24_hours_22_15_page_up");

		browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform();
		expect(takeScreenshot(oClock)).toLookAs("TP24_hours_21_15_page_down");

		// Minutes shortcut
		browser.actions().keyDown(protractor.Key.SHIFT).perform();

		browser.actions().sendKeys(protractor.Key.PAGE_UP).perform();
		expect(takeScreenshot(oClock)).toLookAs("TP24_minutes_21_16_page_up");

		browser.actions().sendKeys(protractor.Key.PAGE_DOWN).perform();
		expect(takeScreenshot(oClock)).toLookAs("TP24_minutes_21_15_page_down");

		// Separator shortcut
		browser.actions().sendKeys(':').perform();
		expect(takeScreenshot(oClock)).toLookAs("TP24_hours_21_15_separator");

		browser.actions().sendKeys(':').perform();
		expect(takeScreenshot(oClock)).toLookAs("TP24_minutes_21_15_separator");

		browser.actions().keyUp(protractor.Key.SHIFT).perform();

		// Close popover
		element(by.id("TP24-Cancel")).click();
	});

	// 24 hours clock with symbol B
	it("Time picker with a 'B HH:mm' display format, AM/PM buttons should not be shown.", function() {
		element(by.id("TP25-icon")).click();
		var oClock = element(by.id("page1-cont"));
		expect(takeScreenshot(oClock)).toLookAs("TP25_hours_21_15_initial");
		// Close popover
		element(by.id("TP25-Cancel")).click();
	});
	// 12 hours clock with symbol B
	it("TimePicker with a 'B HH:mm' display format, AM/PM buttons should be shown.", function() {
		element(by.id("TP26-icon")).click();
		var oClock = element(by.id("page1-cont"));
		expect(takeScreenshot(oClock)).toLookAs("TP26_hours_9_15_PM_initial");
		// Close popover
		element(by.id("TP26-Cancel")).click();
	});

});

