/*global describe,it,takeScreenshot,browser,expect*/

describe("sap.uxap.ObjectPageRtl", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.uxap.ObjectPageLayout';

	it("The scrollbar should be fully visible",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});
});
