/*global describe,it,takeScreenshot,expect,browser*/

describe("sap.m.IconTabHeaderResponsivePaddings", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.IconTabBar';

	// initial loading
	it("should load test page", function() {
		browser.executeScript(function () {
			return sap.ui.Device.system.phone;
		}).then(function () {
		});
		expect(takeScreenshot()).toLookAs("0_initial");
	});
});
