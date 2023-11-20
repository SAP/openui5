/*global describe,it,takeScreenshot,expect,browser*/

describe("sap.m.InputClearIcon", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Input';

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});
});
