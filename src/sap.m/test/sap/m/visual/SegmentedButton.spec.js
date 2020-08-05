/*global describe,it,takeScreenshot,browser,expect*/

describe("sap.m.SegmentedButton", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.SegmentedButton';

	it("should render SegmentedButton", function() {
		expect(takeScreenshot()).toLookAs("SegmentedButton_initial");
	});

});