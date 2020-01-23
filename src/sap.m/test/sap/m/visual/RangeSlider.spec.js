/*global describe,it,takeScreenshot,expect,browser*/

describe("sap.m.RangeSlider", function() {
	"use strict";

	it("should load test page", function() {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("should load test page", function() {
		browser.executeScript("document.getElementById('scrollToBottom').scrollIntoView()").then(function() {
			expect(takeScreenshot()).toLookAs("initial2");
		});
	});
});
