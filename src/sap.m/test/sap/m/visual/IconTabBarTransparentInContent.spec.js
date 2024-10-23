/*global describe,it,element,by,takeScreenshot,expect,browser*/
describe("sap.m.IconTabBarTransparentInContent", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.IconTabBar';

	// initial loading
	it("should load test page", function(){
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	//check IconTabBar with transparent header and background
	it("should have transparent header and background", function() {
		browser.executeScript("document.getElementById('ITBtransparentInContent').scrollIntoView()").then(function() {
			expect(takeScreenshot(element(by.id("ITBtransparentInContent")))).toLookAs("IconTabBar_Transparent_In_Content");
		});
	});
});
