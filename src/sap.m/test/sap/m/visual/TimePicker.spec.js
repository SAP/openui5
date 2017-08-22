/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.TimePicker", function() {
	"use strict";

	var sSutId = "__picker0",
		sSutIconClass = ".sapMInputValHelpInner",
		sSutPickerId,
		sSutPickerSliderId = sSutId + "-sliders-listSecs";

	it("Prepare environment", function () {
		var _prepareDesktopEnvironment = function () {
			sSutPickerId = sSutId + "-RP-popover";
			sSutPickerSliderId = sSutId + "-sliders-listSecs";
		};
		var _prepareMobileEnvironment = function () {
			sSutPickerId = sSutId + "-RP-dialog";
			sSutPickerSliderId = sSutId + "-sliders-listSecs";
		};

		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function (response) {
			var oResponse = JSON.parse(response);
			if (oResponse && oResponse === true) {
				_prepareMobileEnvironment();
			} else {
				_prepareDesktopEnvironment();
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
