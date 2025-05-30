/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.DynamicDateRangeVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.DynamicDateRange';
	var iDefaultTimeout = 35000; // timeout for test execution in milliseconds

	it("Suggestion popover gets opened", function() {
		var oInput = element(by.id("DDR1-input-inner")),
			oVBox = element(by.id("Page1"));

		oInput.click();
		browser.actions().sendKeys("10").perform();
		expect(takeScreenshot(oVBox)).toLookAs("suggestion_popover_opened");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	}, iDefaultTimeout);

	it("Input error state", function() {
		var oInput = element(by.id("DDR1-input-inner")),
			oVBox = element(by.id("Page1"));

		oInput.click();
		browser.actions().sendKeys("abc").perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot(oVBox)).toLookAs("error_state_applied");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	}, iDefaultTimeout);

	it("Group headers disabled when there are more than ten options available", function() {
		var oDDRInputField = element(by.id("DDR3-input-inner")),
			sAltArrowDown = protractor.Key.chord(protractor.Key.ALT, protractor.Key.ARROW_DOWN),
			sAltArrowUp = protractor.Key.chord(protractor.Key.ALT, protractor.Key.ARROW_UP);

		oDDRInputField.click();
		browser.actions().sendKeys(sAltArrowUp).perform();

		expect(takeScreenshot()).toLookAs("group_headers_disabled");

		browser.actions().sendKeys(sAltArrowDown).perform();
	}, iDefaultTimeout);

	it("Group headers enabled when there are less then ten options available", function() {
		var oValueHelp = element(by.id("DDR2-input-vhi"));

		oValueHelp.click();
		expect(takeScreenshot()).toLookAs("group_headers_enabled");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	}, iDefaultTimeout);

	it("Currently selected option is marked as selected", function() {
		var oInput = element(by.id("DDR2-input-inner")),
			oValueHelp = element(by.id("DDR2-input-vhi"));

		oInput.click();
		browser.actions().sendKeys("May 23, 2022").perform();
		oValueHelp.click();

		expect(takeScreenshot()).toLookAs("current_option_selected");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
		oInput.click();
	}, iDefaultTimeout);

	it("Fixed date and date range with 'Calendar' based UI", function() {
		var oValueHelp = element(by.id("DDR2-input-vhi")),
			aListItems;

		oValueHelp.click();

		aListItems = element.all(by.css("#DDR2-RP-popover .sapMListItems .sapMSLI"));

		aListItems.get(13).click(); // select the date range option
		expect(takeScreenshot()).toLookAs("date_range_ui");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();

		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // select start date
		expect(takeScreenshot()).toLookAs("date_range_start_date_preview");

		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // select end date
		expect(takeScreenshot()).toLookAs("date_range_end_date_preview");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		expect(takeScreenshot()).toLookAs("from_date_ui1");
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // get back to suggestions popover

		oValueHelp.click();
		aListItems.get(15).click(); // select "from" date option
		expect(takeScreenshot()).toLookAs("from_date_ui");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // select date
		expect(takeScreenshot()).toLookAs("from_date_ui_selected");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // get back to suggestions popover

		oValueHelp.click();
		aListItems.get(27).click(); // select "month" option
		expect(takeScreenshot()).toLookAs("month_ui");

		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot()).toLookAs("month_ui_selected");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // get back to suggestions popover

		oValueHelp.click();
		aListItems.get(28).click(); // select "month in year" option
		expect(takeScreenshot()).toLookAs("monthinyear_ui");
		var shiftTab = protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB);
		browser.actions().sendKeys(shiftTab).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		expect(takeScreenshot()).toLookAs("monthinyear_ui_selected1");
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot()).toLookAs("monthinyear_ui_selected");
	}, iDefaultTimeout);

	it("Relative date and date range", function() {
		var oValueHelp = element(by.id("DDR3-input-vhi")),
			aListItems;

		oValueHelp.click();
		expect(takeScreenshot()).toLookAs("relative_options_list");

		aListItems = element.all(by.css("#DDR3-RP-popover .sapMListItems .sapMSLI"));
		aListItems.get(21).click(); // select Last X options
		expect(takeScreenshot()).toLookAs("last_x_minutes");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot()).toLookAs("last_x_hours");

		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot()).toLookAs("last_x_days");

		var shiftTab = protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB);
		browser.actions().sendKeys(shiftTab).perform();
		browser.actions().sendKeys(shiftTab).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		aListItems.get(22).click(); // select Next X minutes
		expect(takeScreenshot()).toLookAs("next_x_minutes");

		browser.actions().sendKeys("10000").perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot()).toLookAs("next_x_minutes_max_value_exceeded");

		browser.actions().sendKeys(shiftTab).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		aListItems.get(23).click(); // select Today -X/+Y
		expect(takeScreenshot()).toLookAs("today_x_y");

		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot()).toLookAs("today_x_y_values_changed");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	}, iDefaultTimeout);

});