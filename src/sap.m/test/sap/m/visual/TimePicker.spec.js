/*global describe,it,element,by,takeScreenshot,expect,browser*/

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
});
