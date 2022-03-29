/*global describe,it,takeScreenshot,expect,browser*/

describe("sap.m.IconTabBarResponsivePaddings", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.IconTabBar';

	// initial loading
	it("should load test page", function() {
		browser.executeScript(function () {
			setTimeout(function () {
			}, 5000);
		});

		expect(takeScreenshot()).toLookAs("0_initial");
	});
});
