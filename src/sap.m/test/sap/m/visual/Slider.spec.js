/*global describe,it,element,by,takeScreenshot,expect,browser, protractor*/

describe("sap.m.Slider", function() {
	"use strict";

	it("should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Shouldn't scroll the page down on Space press", function() {
		element(by.id("__slider0-handle")).click();
		element(by.id("__slider0-handle")).sendKeys(protractor.Key.SPACE);
		expect(takeScreenshot()).toLookAs("slider-space-press");
	});

	it("should show default Slider", function() {
		expect(takeScreenshot(element(by.id("__slider0")))).toLookAs("default-slider");
	});

	it("should show Slider with initial value", function() {
		expect(takeScreenshot(element(by.id("__slider1")))).toLookAs("slider-initial-value");
	});

	it("should show disabled Slider", function() {
		expect(takeScreenshot(element(by.id("__slider5")))).toLookAs("slider-disabled");
	});

	it("should show Slider with tooltip", function() {
		element(by.id("__slider7-handle")).click();
		expect(takeScreenshot()).toLookAs("slider-tooltip");
	});

	it("should show Slider with editable tooltip", function() {
		element(by.id("__slider9-handle")).click();
		expect(takeScreenshot()).toLookAs("slider-editable-tooltip");
	});

	it("should show Slider with tickmarks", function() {
		expect(takeScreenshot(element(by.id("__slider12")))).toLookAs("slider-tickmarks");
	});

	it("should show Slider with tickmarks and labels", function() {
		expect(takeScreenshot(element(by.id("__slider13")))).toLookAs("slider-tickmarks-and-labels");
	});

	it("should show Slider with tickmarks and labels 70% width", function() {
		expect(takeScreenshot(element(by.id("__slider14")))).toLookAs("slider-tickmarks-70percent");
	});

	it("should show Slider with tickmarks and labels 300px width", function() {
		expect(takeScreenshot(element(by.id("__slider15")))).toLookAs("slider-tickmarks-300px");
	});

	it("should show hide some tickmarks when Slider is resized", function() {
		browser.executeScript('sap.ui.getCore().byId("__slider14").setWidth("20%")').then(function() {
			expect(takeScreenshot(element(by.id("__slider14")))).toLookAs("slider-tickmarks-and-labels-resized");
		});
	});

	it("should show the same amount of tickmarks after the size is back to the initial", function() {
		browser.executeScript('sap.ui.getCore().byId("__slider14").setWidth("70%")').then(function() {
			expect(takeScreenshot(element(by.id("__slider14")))).toLookAs("slider-tickmarks-and-labels-resized2");
		});
	});
});
