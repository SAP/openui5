/*global describe,it,takeScreenshot,expect,browser,element,protractor,by*/

describe("sap.m.RangeSlider", function() {
	"use strict";

	it("should load test page", function() {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Shouldn't scroll the page down on Space press", function() {
		element(by.id("rangeSlider1-handle1")).click();
		element(by.id("rangeSlider1-handle1")).sendKeys(protractor.Key.SPACE);
		expect(takeScreenshot()).toLookAs("range-slider-space-press");
	});

	it("should show default RangeSlider", function() {
		expect(takeScreenshot(element(by.id("rangeSlider1")))).toLookAs("default-rangeSlider");
	});

	it("should show RangeSlider with set range and advanced tooltip", function() {
		element(by.id("rangeSlider2-handle1")).click();
		expect(takeScreenshot()).toLookAs("advancedTooltip-rangeSlider");
	});

	it("should show disabled RangeSlider", function() {
		expect(takeScreenshot(element(by.id("rangeSlider3")))).toLookAs("disabled-rangeSlider");
	});

	it("should show RangeSlider with steps", function() {
		element(by.id("rangeSlider4-handle1")).click();
		expect(takeScreenshot()).toLookAs("steps-rangeSlider");
	});

	it("should show RangeSlider with inputs", function() {
		element(by.id("rangeSlider5-handle1")).click();
		expect(takeScreenshot()).toLookAs("inputs-rangeSlider");
	});

	it("should show RangeSlider with tickmarks", function() {
		browser.executeScript('document.getElementById("rangeSlider7").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("rangeSlider7")))).toLookAs("tickmarks-rangeSlider");
		});
	});

	it("should show RangeSlider with tickmarks and labels", function() {
		browser.executeScript('document.getElementById("rangeSlider8").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("rangeSlider8")))).toLookAs("tickmarks-and-labels-rangeSlider");
		});
	});
});
