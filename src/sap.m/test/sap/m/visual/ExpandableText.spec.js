/*global describe,it,takeScreenshot,expect,browser*/

describe("sap.m.ExpandableText", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.m.ExpandableText";

	// initial loading
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});
});