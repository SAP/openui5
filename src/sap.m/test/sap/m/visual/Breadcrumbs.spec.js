/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.Breadcrumbs", function() {
	"use strict";

	it("should load test page",function(){
		expect(takeScreenshot(element(by.id("breadcrumbs_0")))).toLookAs("initial");
	});

	it("Should open picker", function() {
		element(by.css("#breadCrumbWithSelect-select")).click();

		expect(takeScreenshot(element(by.id("__popover2")))).toLookAs("picker");
	});
});
