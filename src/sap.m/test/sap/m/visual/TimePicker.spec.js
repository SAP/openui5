/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.TimePicker", function() {
	"use strict";

	var sSutId = "TP7",
		sSutIconId = sSutId + "-icon",
		sSutPickerSliderId = sSutId + "-sliders-listSecs";

	it("Prepare environment", function () {
		var _fnPrepareTestEnvironment4Desktop = function () {
			sSutPickerSliderId = sSutId + "-sliders-listSecs";
		};
		var _fnPrepareTestEnvironment4Mobile = function () {
			sSutPickerSliderId = sSutId + "-sliders-listSecs";
		};

		return browser.executeScript(function () {
			/*
			 * Note: This code is executed in separate browser environment so test environment variables are not available!
			 */
			return sap.ui.Device.system.phone;
		}).then(function (sResponse) {
			if (sResponse && sResponse === true) {
				_fnPrepareTestEnvironment4Mobile();
			} else {
				_fnPrepareTestEnvironment4Desktop();
			}
		});
	});

	it("correct margins", function () {
		var oTPValueHelp = element(by.id(sSutIconId)),
			oSecondsSlider;

		//Open picker
		oTPValueHelp.click();

		oSecondsSlider = element(by.id(sSutPickerSliderId));

		//Assert
		expect(takeScreenshot()).toLookAs("minutes_slider");

		//Expand seconds slider
		oSecondsSlider.click();

		//Assert
		expect(takeScreenshot()).toLookAs("seconds_slider");
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

	it("time picker disabled", function() {
		var oTimePickerIcon = element(by.id("TP2-icon"));
		//Act
		oTimePickerIcon.click();
		//Assert
		expect(takeScreenshot(element(by.id("TP2-toolbar")))).toLookAs("time_picker_not_opened");
	});
});
