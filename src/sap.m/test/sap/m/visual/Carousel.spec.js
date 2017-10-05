/*global describe,it,takeScreenshot,browser,expect*/

describe("sap.m.Carousel", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Carousel';

	// initial loading"
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});
});
