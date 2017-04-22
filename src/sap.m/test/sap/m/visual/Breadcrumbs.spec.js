/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.Breadcrumbs", function() {
	"use strict";

	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should open picker", function() {
		element(by.css("#breadCrumbWithSelect-select")).click();

		expect(takeScreenshot()).toLookAs("picker");
	});
});
