/*global describe,it,takeScreenshot,expect,browser*/

describe('sap.tnt.ToolHeaderFLP', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.tnt.ToolHeader';

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});
});
