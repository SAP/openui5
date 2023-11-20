/*global describe,it,element,by,takeScreenshot,expect,browser*/
describe("sap.m.IconTabBar", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.IconTabBar';

	// initial loading
	it("should load test page", function(){
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	//check Contrast IconTabBar with transparent backgrounds
	it("should have transparent background", function() {
		browser.executeScript("document.getElementById('contrastPlusIconTabBar').scrollIntoView()").then(function() {
			expect(takeScreenshot(element(by.id("contrastPlusIconTabBar")))).toLookAs("Contrast_Plus_IconTabBar");
		});
	});
});
