/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.DynamicDateRangeVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.DynamicDateRange';

	it("Suggestion popover gets opened", function() {
		var oInput = element(by.id("DDR1-input-inner"));
		oInput.click();

		browser.actions().sendKeys("10").perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot(element(by.id("vertical-box")))).toLookAs("error_state_applied");
	});

	it("Input error state", function() {
		var oInput = element(by.id("DDR1-input-inner"));
		oInput.click();

		browser.actions().sendKeys("abc").perform();
	});

	it("Group headers disabled when there are more then ten options available", function() {
		var oValueHelp = element(by.id("DDR1-input-vhi"));
		oValueHelp.click();

		var oPopover = element(by.id("DDR1-RP-popover"));

		expect(takeScreenshot(oPopover)).toLookAs("group_headers_disabled");
		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Fixed date and date range options with 'Calendar' based UI", function() {
		var oValueHelp = element(by.id("DDR2-input-vhi"));
		oValueHelp.click();

		var oPopover = element(by.id("DDR2-RP-popover"));
		expect(takeScreenshot(oPopover)).toLookAs("group_headers_enabled");

		var aListItems = element.all(by.css("#DDR2-RP-popover .sapMListItems .sapMSLI"));
		aListItems.get(0).click();

		expect(takeScreenshot(oPopover)).toLookAs("date_range_standard_option_ui");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot(oPopover)).toLookAs("date_range_start_date_preview");

		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot(oPopover)).toLookAs("date_range_end_date_preview");

		element(by.css("#DDR2-RP-popover .sapMBtnBack")).click();

		aListItems.get(1).click();

		expect(takeScreenshot(oPopover)).toLookAs("from_standard_option_ui");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot(oPopover)).toLookAs("from_value_preview");

		element(by.css("#DDR2-RP-popover .sapMBtnBack")).click();

		aListItems.get(3).click();

		expect(takeScreenshot(oPopover)).toLookAs("month_standard_option_ui");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot(oPopover)).toLookAs("month_value_preview");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

	it("Relative date and date range option with 'StepInput' based UI", function() {
		var oValueHelp = element(by.id("DDR3-input-vhi"));
		oValueHelp.click();

		var oPopover = element(by.id("DDR3-RP-popover"));
		expect(takeScreenshot(oPopover)).toLookAs("relative_options_list");

		var aListItems = element.all(by.css("#DDR3-RP-popover .sapMListItems .sapMSLI"));
		aListItems.get(0).click();

		expect(takeScreenshot(oPopover)).toLookAs("last_x_days_months_years");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot(oPopover)).toLookAs("last_x_option_value_preview");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();

		expect(takeScreenshot(oPopover)).toLookAs("last_x_option_value_preview_update");

		element(by.css("#DDR3-RP-popover .sapMBtnBack")).click();

		aListItems.get(1).click();

		expect(takeScreenshot(oPopover)).toLookAs("next_x_days");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys("10000").perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot(oPopover)).toLookAs("next_x_days_max_value_exceeded");

		element(by.css("#DDR3-RP-popover .sapMBtnBack")).click();

		aListItems.get(2).click();

		expect(takeScreenshot(oPopover)).toLookAs("today_x_y_offset_option");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot(oPopover)).toLookAs("today_x_y_value_preview");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	});

});