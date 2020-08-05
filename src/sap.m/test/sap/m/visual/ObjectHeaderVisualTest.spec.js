/*global describe,it,element,by,takeScreenshot,browser,expect,protractor*/

describe("sap.m.ObjectHeaderVisualTest", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ObjectHeader';

	it("OH with 2 states and property fullScreenOptimized set to true",function() {
		expect(takeScreenshot()).toLookAs("2states-next-to-Title");
	});

	it("OH with 2 states and property fullScreenOptimized set to false",function() {
		element(by.id("change_fullscreen")).click();
		expect(takeScreenshot()).toLookAs("2states-below-Title");
	});

	it("OH with 5 states and property fullScreenOptimized set to false",function() {
		element(by.id("add_states")).click();
		expect(takeScreenshot()).toLookAs("5states-3columns-below-Title");
	});

	it("OH with 5 states and property fullScreenOptimized set to true",function() {
		element(by.id("add_states")).click();
		element(by.id("change_fullscreen")).click();
		expect(takeScreenshot()).toLookAs("5states-4columns-below-Title");
	});

	it("Title is clicked",function() {
		element(by.id("oh1-txt")).click();
		expect(takeScreenshot()).toLookAs("title-clicked");
	});

	it("Intro is clicked",function() {
		element(by.id("oh1-intro")).click();
		expect(takeScreenshot()).toLookAs("intro-clicked");
	});

	it("Set circle shape image",function() {
		element(by.id("change_image_shape")).click();
		expect(takeScreenshot()).toLookAs("circle-image");
	});

	it("Set none responsive",function() {
		element(by.id("change_OH_type")).click();
		expect(takeScreenshot()).toLookAs("old-OH");
	});

	it("Set condensed",function() {
		element(by.id("change_to_condensed")).click();
		expect(takeScreenshot()).toLookAs("condensed-OH");
	});

	it("OH with 1 status and 1 empty attribute",function() {
		element(by.id("change_OH_type")).click();
		element(by.id("change_fullscreen")).click();
		element(by.id("one_state_empty_attribute")).click();
		expect(takeScreenshot()).toLookAs("1_status_1_empty_attribute");
	});

	it("should type Space inside input field", function () {
		var oOHSpace = element(by.id("ohSpace"));

		//there is no keyboard on mobile
		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("typeSpace-inner")).click();
			element(by.id("typeSpace-inner")).sendKeys(protractor.Key.SPACE);
			element(by.id("typeSpace-inner")).sendKeys(protractor.Key.NUMPAD7);

			expect(takeScreenshot(oOHSpace)).toLookAs("OH_Input_has_space");
		}
	});
});