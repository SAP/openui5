/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.Page", function () {
	"use strict";

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	//check page without header
	it("Should show page without header", function () {
		element(by.id("hide-show-header")).click();
		expect(takeScreenshot()).toLookAs("page-without-header");
		element(by.id("hide-show-header")).click();
	});

	//check page without footer
	it("Should show page without footer", function () {
		element(by.id("hide-show-footer")).click();
		expect(takeScreenshot()).toLookAs("page-without-footer");
		element(by.id("hide-show-footer")).click();
	});

	//check page with floating footer
	it("Should show page with floating footer", function () {
		element(by.id("toggle-floating-footer")).click();
		expect(takeScreenshot()).toLookAs("page-with-floating-footer");
	});

});
