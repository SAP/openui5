/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.DateTimePickerWithTimezone", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.DateTimePicker';

	it("timezone label truncation", function() {
		var oDTP1 = element(by.id("DTP1")),
			oBTN20 = element(by.id("BTN20"));

		expect(takeScreenshot(oDTP1)).toLookAs("buenos_aires_label_truncated");

		// shrink to 200px
		oBTN20.click();

		expect(takeScreenshot(oDTP1)).toLookAs("label_and_input_truncated");
	});

	it("timezone change", function() {
		var oDTP1 = element(by.id("DTP1")),
			oBTN40 = element(by.id("BTN40")),
			oBTNNY = element(by.id("BTNNY"));

		// expand to 400px and change the timezone
		oBTN40.click();
		oBTNNY.click();

		expect(takeScreenshot(oDTP1)).toLookAs("new_york_label_fully_visible");
	});

	it("picker displays the correct date", function() {
		var oDTP1Popover,
			oValueHelpIcon = element(by.id("DTP1-icon"));

		// open the picker
		oValueHelpIcon.click();

		oDTP1Popover = element(by.id("DTP1-RP-popover"));

		expect(takeScreenshot(oDTP1Popover)).toLookAs("picker_displays_20_Nov_2000_5_10_10");
	});

	it("picker displays the correct date when the app timezone is different", function() {
		var oDTP3Popover,
			oBtnChangeAppTimezone = element(by.id("BTNCHANGEAPPTIMEZONE")),
			oValueHelpIcon = element(by.id("DTP3-icon"));

		// open the picker
		oBtnChangeAppTimezone.click();
		oValueHelpIcon.click();

		oDTP3Popover = element(by.id("DTP3-RP-popover"));

		expect(takeScreenshot(oDTP3Popover)).toLookAs("picker_displays_24_Mar_2021_23_30_00");
	});
});
