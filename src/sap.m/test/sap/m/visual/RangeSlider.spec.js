/*global describe,it,takeScreenshot,expect,browser,element,protractor,by*/

describe("sap.m.RangeSlider", function() {
	"use strict";

	it("should load test page", function() {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Shouldn't scroll the page down on Space press", function() {
		element(by.id("__slider0-handle1")).click();
		element(by.id("__slider0-handle1")).sendKeys(protractor.Key.SPACE);
		expect(takeScreenshot()).toLookAs("range-slider-space-press");
	});

	it("should load test page", function() {
		browser.executeScript("document.getElementById('scrollToBottom').scrollIntoView()").then(function() {
			expect(takeScreenshot()).toLookAs("initial2");
		});
	});
});
