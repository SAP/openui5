/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.f.DynamicPage", function() {
	"use strict";

	it("Initial state",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Collapsed header", function() {
		element(by.css(".sapFDynamicPageTitle")).click();
		expect(takeScreenshot()).toLookAs("header_collapsed");
	});
});
