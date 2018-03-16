/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.Panel", function() {
	"use strict";

	it("should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("should show Panel with Text control inside", function() {
		element(by.id("panel2")).click();
		expect(takeScreenshot(element(by.id("panel1")))).toLookAs("panel-with-text");
	});

	it("should show Panel with defined size", function() {
		element(by.id("panel3")).click();
		expect(takeScreenshot(element(by.id("panel2")))).toLookAs("panel-defined-size");
	});

	it("should show Panel with header and info toolbar", function() {
		element(by.id("panel4")).click();
		expect(takeScreenshot(element(by.id("panel3")))).toLookAs("panel-header-toolbar");
	});

	it("should show Panel with header and info toolbar not expanded.", function() {
		browser.executeScript('document.getElementById("panel4").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("panel4")))).toLookAs("panel-not-expanded1");
		});
	});

	it("should show Panel with header and info toolbar expanded", function() {
		expect(takeScreenshot(element(by.id("panel5")))).toLookAs("panel-expanded1");
	});

	it("should show Panel with a button.", function() {
		browser.executeScript('document.getElementById("panel14").scrollIntoView()').then(function() {
			expect(takeScreenshot(element(by.id("panel14")))).toLookAs("panel-with-button");
		});
	});

	it("should show Panel with a button expanded", function() {
		expect(takeScreenshot(element(by.id("panel15")))).toLookAs("panel-expanded2");
	});

	it("should show Panel with a button not expanded", function() {
		expect(takeScreenshot(element(by.id("panel16")))).toLookAs("panel-not-expanded2");
	});

});
