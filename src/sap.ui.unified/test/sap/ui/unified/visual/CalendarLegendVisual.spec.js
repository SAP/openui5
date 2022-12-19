/*global describe,it,element,by,takeScreenshot,browser,expect,protractor*/

describe("sap.ui.unified.CalendarLegendVisual", function() {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.CalendarLegend';

	var iDefaultTimeout = 50000; // timeout for test execution in milliseconds

	var sCalId = "Cal",
		sLegendId = "Leg",
		oCal = element(by.id(sCalId)),
		oLegend = element(by.id(sLegendId));

	it("should not filter special days when calendar legend item is not focused", function () {
		expect(takeScreenshot(oCal)).toLookAs("no_filtered_specialdays_1");
		expect(takeScreenshot(oLegend)).toLookAs("no_legend_item_focused_1");

	}, iDefaultTimeout);

	it("should filter special days when calendar legend item is focused", function () {
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		expect(takeScreenshot(oCal)).toLookAs("no_filtered_specialdays_2");
		expect(takeScreenshot(oLegend)).toLookAs("first_legend_std_item_focused");

		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		expect(takeScreenshot(oLegend)).toLookAs("first_legend_item_focused");
		expect(takeScreenshot(oCal)).toLookAs("filtered_first_legend_item_specialdays");

		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		expect(takeScreenshot(oLegend)).toLookAs("second_calendar_legend_item_focused");
		expect(takeScreenshot(oCal)).toLookAs("filtered_second_legend_item_specialdays");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		expect(takeScreenshot(oCal)).toLookAs("no_filtered_specialdays_3");
		expect(takeScreenshot(oLegend)).toLookAs("no_calendar_item_focused_2");
	}, iDefaultTimeout);

});