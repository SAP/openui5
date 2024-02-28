/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.TimePicker", function() {
	"use strict";

	var iDefaultTimeout = 50000; // timeout for test execution in milliseconds

	it("time picker disabled", function() {
		element(by.id("TP2-icon")).click();
		expect(takeScreenshot(element(by.id("TP2-toolbar")))).toLookAs("time_picker_not_opened");
	});

	it("focus in behavior when mask mode is on", function () {
		var oInnerInput = element(by.id("TP1-inner"));

		//Focus input field
		oInnerInput.click();
		//Move the caret one symbol to the right
		browser.actions().sendKeys(protractor.Key.ARROW_RIGHT).perform();
		//Remove the first symbol
		browser.actions().sendKeys(protractor.Key.BACK_SPACE).perform();
		//Focus out of the input field
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		//Focus input field again
		oInnerInput.click();

		//Assert
		expect(takeScreenshot(element(by.id("TP1-toolbar")))).toLookAs("input_value_selected");
	});

	it("mouse press: time picker with display format - mm:ss and 15 step", function() {
		element(by.id("TP1-icon")).click();
		var oClock = element(by.id("TP1-RP-popover"));
		expect(takeScreenshot(oClock)).toLookAs("TP1_minutes_03_15");

		var oMinutesCover = element(by.id("TP1-clocks-clockM-cover"));
		browser.actions().mouseMove(oMinutesCover, {x: 135, y: 10}).click().perform();
		expect(takeScreenshot(oClock)).toLookAs("TP1_minutes_00_15");

		var oSecondsCover = element(by.id("TP1-clocks-clockS-cover"));
		browser.actions().mouseMove(oSecondsCover, {x: 10, y: 135}).click().perform();
		expect(takeScreenshot(oClock)).toLookAs("TP1_seconds_00_45");

		// Close popover
		element(by.id("TP1-Cancel")).click();
	});

	it("mouse press: time picker with display format - hh:mm", function() {
		element(by.id("TP14-icon")).click();
		var oClock = element(by.id("TP14-RP-popover"));

		var oHoursCover = element(by.id("TP14-clocks-clockH-cover"));
		browser.actions().mouseMove(oHoursCover, {x: 165, y: 55}).click().perform();
		expect(takeScreenshot(oClock)).toLookAs("TP14_hours_13_15");

		var oMinutesCover = element(by.id("TP14-clocks-clockM-cover"));
		browser.actions().mouseMove(oMinutesCover, {x: 135, y: 260}).click().perform();
		expect(takeScreenshot(oClock)).toLookAs("TP14_minutes_13_30");

		// Close popover
		element(by.id("TP14-Cancel")).click();
	});

	it("separators", function() {
		element(by.id("TP21-icon")).click();
		var oClock = element(by.id("TP21-RP-popover"));
		expect(takeScreenshot(oClock)).toLookAs("TP21_no_separator");
		element(by.id("TP21-Cancel")).click();

		element(by.id("TP22-icon")).click();
		var oClock = element(by.id("TP22-RP-popover"));
		expect(takeScreenshot(oClock)).toLookAs("TP22_separator_end");
		element(by.id("TP22-Cancel")).click();

		element(by.id("TP23-icon")).click();
		var oClock = element(by.id("TP23-RP-popover"));
		expect(takeScreenshot(oClock)).toLookAs("TP23_separator_begin_end");
		element(by.id("TP23-Cancel")).click();

		element(by.id("TP24-icon")).click();
		var oClock = element(by.id("TP24-RP-popover"));
		expect(takeScreenshot(oClock)).toLookAs("TP24_no_separator_begin_end");
		element(by.id("TP24-Cancel")).click();

		element(by.id("TP17-icon")).click();
		var oClock = element(by.id("TP17-RP-popover"));
		expect(takeScreenshot(oClock)).toLookAs("TP17_separator_chinese");
		element(by.id("TP17-Cancel")).click();
	}, iDefaultTimeout);

	it("TimePicker input press triggers a popover to be opened on mobile", function() {
		var oToggleMobileButton = element(by.id("toggleMobile"));
		var oPopover = element(by.id("TP7-NP"));

		// Simulate mobile device
		oToggleMobileButton.click();

		// Open popover
		element(by.id("TP7-inner")).click();

		expect(takeScreenshot(oPopover)).toLookAs("TP7_input_popover");

		// Close popover
		element(by.id("TP7-NumericCancel")).click();

		// Disable mobile device simulation
		oToggleMobileButton.click();
	});

	it("clocks selection in GMT+12 timezone", testTPTZWithTimezoneBtn.bind(null, "btnEtcGMT-12", "GMT12"));
	it("clocks selection in GMT-12 timezone", testTPTZWithTimezoneBtn.bind(null, "btnEtcGMT12", "GMT-12"));
	it("clocks selection in UTC timezone", testTPTZWithTimezoneBtn.bind(null, "btnUTC", "UTC"));

	function testTPTZWithTimezoneBtn(sBtnId, sTimezone) {
		var oInput = element(by.css("#TPTZ")),
			oValueHelpIcon = element(by.id("TPTZ-icon")),
			oPicker,
			oHoursCover;

		element(by.id(sBtnId)).click(); //change the timezone

		oInput.click();
		browser.actions().sendKeys("5:20:12 AM").perform(); //type

		oValueHelpIcon.click(); //open the picker

		oPicker = element(by.css("#TPTZ-RP-popover"));
		expect(takeScreenshot(oPicker)).toLookAs("picker_5_20_12_AM_" + sTimezone);

		oHoursCover = element(by.id("TPTZ-clocks-clockH-cover"));
		browser.actions().mouseMove(oHoursCover, {x: 67, y: 245 }).click().perform(); //select hours -> 7
		element(by.id("TPTZ-OK")).click(); //click OK
		expect(takeScreenshot(oInput)).toLookAs("input_7_20_12_AM_" + sTimezone);

		oValueHelpIcon.click(); //open the picker
		expect(takeScreenshot(oPicker)).toLookAs("picker_7_20_12_AM_" + sTimezone);
	}

});

