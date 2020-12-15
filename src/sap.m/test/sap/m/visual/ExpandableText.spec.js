/*global describe,it,takeScreenshot,expect*/

describe("sap.m.ExpandableText", function() {
	"use strict";

	// initial loading
	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});
});