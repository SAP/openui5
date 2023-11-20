/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.Shell", function() {
	"use strict";

	it("logo after theme changed", function() {
		element(by.id("__xmlview0--btnChangeTheme")).click();
		expect(takeScreenshot()).toLookAs("logo-after-theme-changed");
	});

});