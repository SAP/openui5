/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.Toolbar", function() {
	"use strict";

	it("Toolbar initial rendering",function() {
		expect(takeScreenshot()).toLookAs("toolbar-initial");
	});

	it("Toolbar open select",function() {
		element(by.id("selH")).click();
		expect(takeScreenshot(element(by.id("selH-valueStateText")))).toLookAs("toolbar-open-select");
	});

	it("Click info Toolbar",function() {
		element(by.id("info_bar")).click();
		expect(takeScreenshot(element(by.id("info_bar")))).toLookAs("toolbar-info-bar");
	});

	it("Resize Toolbar",function() {
		element(by.id("size_btn")).click();
		expect(takeScreenshot()).toLookAs("toolbar-resized");
	});

});