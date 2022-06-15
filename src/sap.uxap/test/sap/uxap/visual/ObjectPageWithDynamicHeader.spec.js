/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.uxap.ObjectPageWithDynamicHeader", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.uxap.ObjectPageLayout';

	it("Should load test page",function(){
		expect(takeScreenshot(element(by.id("__xmlview0--OPL-header-hitle")))).toLookAs("initial");
	});
});