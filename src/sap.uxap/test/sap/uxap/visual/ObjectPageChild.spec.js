/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.uxap.ObjectPageChild", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.uxap.ObjectPageLayout';

	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should open anchor menu", function() {
		if (browser.testrunner.runtime.platformName == "android" || browser.testrunner.runtime.platformName == "ios") {
			element(by.css(".sapMSltArrow")).click();
		} else {
			element(by.css(".sapUxAPAnchorBarButton:nth-child(2) .sapMSBArrow")).click();
		}

		expect(takeScreenshot()).toLookAs("anchormenu");
	});

	it("Should collapse header", function() {
		if (browser.testrunner.runtime.platformName == "android" || browser.testrunner.runtime.platformName == "ios") {
			element(by.css(".sapUxAPHierarchicalSelectFirstLevel:nth-child(2)")).click();
		} else {
			element(by.css(".sapUxAPAnchorBarButton:nth-child(2) .sapMSBText")).click();
		}

		expect(takeScreenshot()).toLookAs("snapheader");
	});
});
