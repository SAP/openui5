/*global describe,it,takeScreenshot,browser,expect*/

describe("sap.uxap.ObjectPageWithDynamicHeader", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.uxap.ObjectPageLayout';

	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});
});