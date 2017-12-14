/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.TimePicker", function() {
	"use strict";

	var sSutId = "TP1",
		sSutIconClass = ".sapMInputValHelpInner",
		sSutPickerId,
		sSutPickerSliderId = sSutId + "-sliders-listSecs";

	it("Prepare environment", function () {
		var _fnPrepareTestEnvironment4Desktop = function () {
			sSutPickerId = sSutId + "-RP-popover";
			sSutPickerSliderId = sSutId + "-sliders-listSecs";
		};
		var _fnPrepareTestEnvironment4Mobile = function () {
			sSutPickerId = sSutId + "-RP-dialog";
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
		var oTPValueHelp = element(by.css('#' + sSutId + ' ' + sSutIconClass)),
			oPicker,
			oSecondsSlider;

		//Open picker
		oTPValueHelp.click();

		oPicker = element(by.id(sSutPickerId));
		oSecondsSlider = element(by.id(sSutPickerSliderId));

		//Assert
		expect(takeScreenshot(oPicker)).toLookAs("minutes_slider");

		//Expand seconds slider
		oSecondsSlider.click();

		//Assert
		expect(takeScreenshot(oPicker)).toLookAs("seconds_slider");
	});
});
