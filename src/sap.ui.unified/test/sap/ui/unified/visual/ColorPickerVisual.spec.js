/*global describe,it,element,by,takeScreenshot,browser,expect,protractor*/

describe("sap.ui.unified.ColorPickerVisual", function() {
	"use strict";
	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.ColorPicker';

	// Default mode
	it("should render default mode HSL color picker with RGB output", function() {
		element(by.id("remove_focus_btn")).click();
		expect(takeScreenshot(element(by.id("cp")))).toLookAs("Default_ColorPicker_HSL_RGB");
	});

	it("should render default mode HSV color picker with RGB output", function() {
		element(by.id("hsv_hsl_btn")).click();
		element(by.id("remove_focus_btn")).click();
		expect(takeScreenshot(element(by.id("cp")))).toLookAs("Default_ColorPicker_HSV_RGB");
	});

	it("should render default mode HSL color picker with HSL output", function() {
		element(by.id("hsv_hsl_btn")).click();
		element(by.id("cp-toggleMode")).click();
		element(by.id("remove_focus_btn")).click();
		expect(takeScreenshot(element(by.id("cp")))).toLookAs("Default_ColorPicker_HSL_HSL");
	});


	// Large mode
	it("should render large mode HSL color picker with RGB output", function() {
		element(by.id("hsv_hsl_btn")).click();
		element(by.id("select_mode-label")).click();
		element(by.id("large_mode")).click();
		element(by.id("remove_focus_btn")).click();
		expect(takeScreenshot(element(by.id("cp")))).toLookAs("Large_ColorPicker_HSV_RGB");
	});

	it("should render large mode HSV color picker with RGB output", function() {
		element(by.id("hsv_hsl_btn")).click();
		element(by.id("remove_focus_btn")).click();
		expect(takeScreenshot(element(by.id("cp")))).toLookAs("Large_ColorPicker_HSL_RGB");
	});

	it("should move navigate from first radio button to second from radio group", function() {
		element(by.id("select_mode-label")).click();
		element(by.id("large_mode")).click();
		element(by.css(".sapMRb")).click();
		browser.actions().sendKeys(protractor.Key.ARROW_DOWN).perform();
		expect(takeScreenshot(element(by.id("cp")))).toLookAs("Large_ColorPicker_radio_butto_group");
	});

	// Simplified mode
	it("should render simplified mode HSL color picker with RGB output", function() {
		element(by.id("select_mode-label")).click();
		element(by.id("simplified_mode")).click();
		element(by.id("remove_focus_btn")).click();
		expect(takeScreenshot(element(by.id("cp")))).toLookAs("Simplified_ColorPicker_HSL_RGB");
	});

	it("should render simplified mode HSV color picker with RGB output", function() {
		element(by.id("hsv_hsl_btn")).click();
		element(by.id("remove_focus_btn")).click();
		expect(takeScreenshot(element(by.id("cp")))).toLookAs("Simplified_ColorPicker_HSV_RGB");
	});

});