/*global describe,it,takeScreenshot,browser,expect,element,by*/

describe("sap.m.CarouselNoPages", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Carousel';

	// initial loading"
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it("should take picture of carousel with 100% width with error message and no pages ", function () {
		var carousel100 = element(by.id('car1'));
		expect(takeScreenshot(carousel100)).toLookAs('1_carousel_100');
	});

	it("should take picture of carousel with 40% width with error message and no pages", function () {
		var carousel40 = element(by.id('car2'));
		browser.executeScript('document.getElementById("car2").scrollIntoView()');
		expect(takeScreenshot(carousel40)).toLookAs('1_carousel_40');
	});
});
