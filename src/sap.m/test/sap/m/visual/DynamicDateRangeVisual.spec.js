/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.DynamicDateRangeVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.DynamicDateRange';
	var iDefaultTimeout = 35000; // timeout for test execution in milliseconds

	it("Mock now Date", function() {
		var el = element(by.tagName('body'));

		// We have to mock the current date in order to have stable tests as the dates used in the DynamicDateRange
		// control are relative to the current date. This is done by executing a script on body level in the HTML page -
		// the case where there are no arguments passed to the Date object returns a solid date in the past. The magic
		// string passed to the executeScript function is the same as the lines below but without the spaces:

		// var a = new Date(2015,0,1);
		// Date = class extends Date{
		// 	constructor(options) {
		// 		if (options) {
		// 			super(options);
		// 		} else {
		// 			super(a);
		// 		}
		// 	}
		// };

		browser.executeScript('var a = new Date(2015,1,1);Date = class extends Date{constructor(options) {if (options) {super(options);} else {super(a);}}};', el);
	}, iDefaultTimeout);

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

	it("Group headers disabled when there are more then ten options available", function() {
		var oDDRInputField = element(by.id("DDR3-input-inner")),
			sAltArrowDown = protractor.Key.chord(protractor.Key.ALT, protractor.Key.ARROW_DOWN),
			sAltArrowUp = protractor.Key.chord(protractor.Key.ALT, protractor.Key.ARROW_UP),
			oPopover;

		oDDRInputField.click();
		browser.actions().sendKeys(sAltArrowUp).perform();

		oPopover = element(by.id("DDR3-RP-popover"));
		expect(takeScreenshot(oPopover)).toLookAs("group_headers_disabled");

		browser.actions().sendKeys(sAltArrowDown).perform();
	}, iDefaultTimeout);

	it("Group headers enabled when there are less then ten options available", function() {
		var oValueHelp = element(by.id("DDR2-input-vhi")),
			oPopover;

		oValueHelp.click();
		oPopover = element(by.id("DDR2-RP-popover"));
		expect(takeScreenshot(oPopover)).toLookAs("group_headers_enabled");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	}, iDefaultTimeout);

	it("Fixed date and date range with 'Calendar' based UI", function() {
		var oValueHelp = element(by.id("DDR2-input-vhi")),
			aListItems, oPopover;

		oValueHelp.click();

		aListItems = element.all(by.css("#DDR2-RP-popover .sapMListItems .sapMSLI"));
		oPopover = element(by.id("DDR2-RP-popover"));

		aListItems.get(1).click(); // select the date range option
		expect(takeScreenshot(oPopover)).toLookAs("date_range_ui");

		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // select start date
		expect(takeScreenshot(oPopover)).toLookAs("date_range_start_date_preview");

		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // select end date
		expect(takeScreenshot(oPopover)).toLookAs("date_range_end_date_preview");

		element(by.css("#DDR2-RP-popover .sapMBtnBack")).click(); // get back to suggestions popover
		aListItems.get(2).click(); // select "from" date option
		expect(takeScreenshot(oPopover)).toLookAs("from_date_ui");

		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // select date
		expect(takeScreenshot(oPopover)).toLookAs("from_date_ui_selected");

		element(by.css("#DDR2-RP-popover .sapMBtnBack")).click(); // get back to suggestions popover
		aListItems.get(5).click(); // select "month" option
		expect(takeScreenshot(oPopover)).toLookAs("month_ui");

		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot(oPopover)).toLookAs("month_ui_selected");

		element(by.css("#DDR2-RP-popover .sapMBtnBack")).click(); // get back to suggestions popover
		aListItems.get(4).click(); // select "month in year" option
		expect(takeScreenshot(oPopover)).toLookAs("monthinyear_ui");
		browser.actions().sendKeys(protractor.Key.TAB).perform();
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
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot(element(by.css("body")))).toLookAs("monthinyear_ui_selected");
	}, iDefaultTimeout);

	it("Relative date and date range", function() {
		var oValueHelp = element(by.id("DDR3-input-vhi")),
			oPopover, aListItems;

		oValueHelp.click();
		oPopover = element(by.id("DDR3-RP-popover"));
		expect(takeScreenshot(oPopover)).toLookAs("relative_options_list");

		aListItems = element.all(by.css("#DDR3-RP-popover .sapMListItems .sapMSLI"));
		aListItems.get(0).click(); // select Last X days
		expect(takeScreenshot(oPopover)).toLookAs("last_x_days");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot(oPopover)).toLookAs("last_x_months");

		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot(oPopover)).toLookAs("last_x_years");

		element(by.css("#DDR3-RP-popover .sapMBtnBack")).click();
		aListItems.get(1).click(); // select Next X days
		expect(takeScreenshot(oPopover)).toLookAs("next_x_days");

		browser.actions().sendKeys("10000").perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot(oPopover)).toLookAs("next_x_days_max_value_exceeded");

		element(by.css("#DDR3-RP-popover .sapMBtnBack")).click();
		aListItems.get(2).click(); // select Today -X/+Y
		expect(takeScreenshot(oPopover)).toLookAs("today_x_y");

		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ARROW_UP).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		expect(takeScreenshot(oPopover)).toLookAs("today_x_y_values_changed");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	}, iDefaultTimeout);

	it("DateTime option", function() {
		var oValueHelp = element(by.id("DDR4-input-vhi")),
			oPage = element(by.id("Page1")),
			oPopover, aListItems;

		oValueHelp.click();
		oPopover = element(by.id("DDR4-RP-popover"));
		expect(takeScreenshot(oPopover)).toLookAs("datetime_options_list");

		aListItems = element.all(by.css("#DDR4-RP-popover .sapMListItems .sapMSLI"));
		aListItems.get(0).click(); // select Date and Time
		expect(takeScreenshot(oPopover)).toLookAs("datetime_options_datepicker");

		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();
		expect(takeScreenshot(oPopover)).toLookAs("datetime_options_timepicker");

		element(by.css("#DDR4-RP-popover .sapMBtnBack")).click();
		aListItems.get(1).click(); // select From Date and Time
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // select date and move to time part
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();// select time and close popover
		expect(takeScreenshot(oPage)).toLookAs("fromdatetime_option_datepicker");

		oValueHelp.click();
		aListItems.get(1).click(); // select To Date and Time
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform(); // select date and move to time part
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		browser.actions().sendKeys(protractor.Key.ENTER).perform();// select time and close popover
		expect(takeScreenshot(oPage)).toLookAs("todatetime_option_datepicker");

		browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
	}, iDefaultTimeout);

	it("pick today in GMT-12 timezone", testDateTimeWithTimezoneBtn.bind(null, "btnEtcGMT-12", "GMT-12"), iDefaultTimeout);
	it("pick today in GMT+12 timezone", testDateTimeWithTimezoneBtn.bind(null, "btnEtcGMT12", "GMT12"), iDefaultTimeout);
	it("pick today in UTC timezone", testDateTimeWithTimezoneBtn.bind(null, "btnUTC", "UTC"), iDefaultTimeout);

	function testDateTimeWithTimezoneBtn(sBtnId, sTimezone) {
		var oValueHelp = element(by.id("DDR5-input-vhi")),
			oPopover, aListItems, oTimeSegBtn, oOtherDate, oBtnApply;

		var oInput = element(by.css("#DDR5-input-inner"));

		element(by.id(sBtnId)).click(); //change the timezone

		oInput.click();
		browser.actions().sendKeys("Dec 20, 2000, 1:00:00 AM").perform(); //type
		browser.actions().sendKeys(protractor.Key.ENTER).perform();

		oValueHelp.click();
		oPopover = element(by.id("DDR5-RP-popover"));

		aListItems = element.all(by.css("#DDR5-RP-popover .sapMListItems .sapMSLI"));
		aListItems.get(0).click(); // select Date and Time

		expect(takeScreenshot(oPopover)).toLookAs("calendar_Dec_20_2000_" + sTimezone);

		// select time part
		oTimeSegBtn = element.all(by.css("#DDR5-RP-popover .sapMTimePickerSwitch .sapMSegBBtn")).get(1);
		oTimeSegBtn.click();

		expect(takeScreenshot(oPopover)).toLookAs("clock_Dec_20_2000_" + sTimezone);

		// select date part
		oTimeSegBtn = element.all(by.css("#DDR5-RP-popover .sapMTimePickerSwitch .sapMSegBBtn")).get(0);
		oTimeSegBtn.click();

		// click another date
		oOtherDate = element.all(by.css("#DDR5-RP-popover .sapUiCalItem")).get(5); //1 dec, 2000
		oOtherDate.click();

		// click apply btn
		oBtnApply = element.all(by.css("#DDR5-RP-footer .sapMBtn")).get(0);
		oBtnApply.click();

		expect(takeScreenshot(oInput)).toLookAs("input_Dec_1_2000_" + sTimezone);
	}
});