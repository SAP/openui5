/*global describe,it,takeScreenshot,expect,browser*/

describe('sap.tnt.ToolPageWithSubHeader', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.tnt.ToolPage';

	it("initial load", function () {
		expect(takeScreenshot()).toLookAs("toolPage_initial");
	});
});
