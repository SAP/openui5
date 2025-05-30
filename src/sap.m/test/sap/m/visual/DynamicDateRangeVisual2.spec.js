/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.DynamicDateRangeVisual2", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.DynamicDateRange';
	var iDefaultTimeout = 35000; // timeout for test execution in milliseconds

	it("Time picker clock is visible", function() {
		var oValueHelp = element(by.id("DDR1-input-vhi")),
			aListItems;

		oValueHelp.click();

		aListItems = element.all(by.css("#DDR1-RP-popover .sapMListItems .sapMSLI"));

		aListItems.get(12).click(); // select the date and time option

		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot()).toLookAs("time_picker_loaded");
	}, iDefaultTimeout);

	it("DateTime option", function() {
		var oValueHelp = element(by.id("DDR4-input-vhi")),
			aListItems;

		oValueHelp.click();
		expect(takeScreenshot()).toLookAs("datetime_options_list");

		aListItems = element.all(by.css("#DDR4-RP-popover .sapMListItems .sapMSLI"));
		aListItems.get(0).click(); // select Date and Time
		expect(takeScreenshot()).toLookAs("datetime_options_datepicker");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot()).toLookAs("datetime_options_timepicker");

		var shiftTab = protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB);
		browser.actions().sendKeys(shiftTab).perform();
		browser.actions().sendKeys(shiftTab).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		aListItems.get(15).click(); // select From Date and Time
		expect(takeScreenshot()).toLookAs("fromdatetime_option_datepicker");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // select date and move to time part
		expect(takeScreenshot()).toLookAs("fromdatetime_option_timepicker");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();// select time and close popover
		expect(takeScreenshot()).toLookAs("fromdatetime_option_selected");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		oValueHelp.click();
		aListItems.get(17).click(); // select To Date and Time
		expect(takeScreenshot()).toLookAs("todatetime_option_datepicker");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // select date and move to time part
		expect(takeScreenshot()).toLookAs("todatetime_option_timepicker");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();// select time and close popover
		expect(takeScreenshot()).toLookAs("todatetime_option_selected");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	}, iDefaultTimeout);

	it("pick today in GMT-12 timezone", testDateTimeWithTimezoneBtn.bind(null, "btnEtcGMT-12", "GMT-12"), iDefaultTimeout);
	it("pick today in GMT+12 timezone", testDateTimeWithTimezoneBtn.bind(null, "btnEtcGMT12", "GMT12"), iDefaultTimeout);
	it("pick today in UTC timezone", testDateTimeWithTimezoneBtn.bind(null, "btnUTC", "UTC"), iDefaultTimeout);

	function testDateTimeWithTimezoneBtn(sBtnId, sTimezone) {
		var oValueHelp = element(by.id("DDR5-input-vhi")),
			aListItems, oTimeSegBtn, oOtherDate, oBtnApply;

		var oInput = element(by.css("#DDR5-input-inner"));

		element(by.id(sBtnId)).click(); //change the timezone

		oInput.click();
		browser.actions().sendKeys("Dec 20, 2000, 1:00:00 AM").perform(); //type
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		oValueHelp.click();

		aListItems = element.all(by.css("#DDR5-RP-popover .sapMListItems .sapMSLI"));
		aListItems.get(12).click(); // select Date and Time

		expect(takeScreenshot()).toLookAs("calendar_Dec_20_2000_" + sTimezone);

		// select time part
		oTimeSegBtn = element.all(by.css("#DDR5-RP-popover .sapMTimePickerSwitch .sapMSegBBtn")).get(1);
		oTimeSegBtn.click();

		expect(takeScreenshot()).toLookAs("clock_Dec_20_2000_" + sTimezone);

		// select date part
		oTimeSegBtn = element.all(by.css("#DDR5-RP-popover .sapMTimePickerSwitch .sapMSegBBtn")).get(0);
		oTimeSegBtn.click();

		// click another date
		oOtherDate = element.all(by.css("#DDR5-RP-popover .sapUiCalItem")).get(5); //1 dec, 2000
		oOtherDate.click();

		// click apply btn
		oBtnApply = element.all(by.css("#DDR5-RP-footer .sapMBtn")).get(0);
		oBtnApply.click();

		expect(takeScreenshot()).toLookAs("input_Dec_1_2000_" + sTimezone);
	}

});