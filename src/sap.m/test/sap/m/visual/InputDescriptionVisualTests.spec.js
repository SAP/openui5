/*global describe,it,takeScreenshot,expect,browser*/
describe("sap.m.InputDescriptionVisualTests", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Input';

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("1_initial");
	});

	it("should load second half of the test page", function () {
		browser.executeScript('document.getElementById("last").scrollIntoView()');
		expect(takeScreenshot()).toLookAs("2_initial");
	});
});