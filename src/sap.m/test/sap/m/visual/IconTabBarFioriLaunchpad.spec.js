/* global describe, it, takeScreenshot, expect, browser */

describe("sap.m.IconTabBarFioriLaunchpad", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.m.IconTabBar";

	// initial loading
	it("should load test page", function(){
		expect(takeScreenshot()).toLookAs("0_initial");
	});
});
