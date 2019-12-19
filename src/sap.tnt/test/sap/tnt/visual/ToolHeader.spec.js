/* global describe, it, takeScreenshot, expect */

describe("sap.tnt.ToolHeader", function () {
	"use strict";

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});
});