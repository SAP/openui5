/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.RangeSlider", function() {
	"use strict";

	it("should load test page", function() {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("should load test page", function() {
		// scroll to bottom
		element(by.id("__slider7-handle2")).click();
		expect(takeScreenshot()).toLookAs("initial2");
	});
});
