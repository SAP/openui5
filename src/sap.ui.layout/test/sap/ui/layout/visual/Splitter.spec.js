/* global describe, it, element, by, takeScreenshot, expect, browser*/

describe("sap.ui.layout.Splitter", function () {
	"use strict";

	var bDesktop = null;

	it("should load test page", function () {
		browser.executeScript(
			"return sap.ui.Device.system.desktop;")
			.then(function (response) {
				bDesktop = response;
		});
		expect(takeScreenshot(element(by.id("mySplitter")))).toLookAs("0_initial");
	});

	it("should focus vertical splitter bar", function () {
		if (bDesktop) {
			element(by.id("mySplitter-splitbar-0")).click();
			expect(takeScreenshot(element(by.id("mySplitter")))).toLookAs("1_vertical_bar_focused");
		}
	});

	it("should focus horizontal splitter bar", function () {
		if (bDesktop) {
			element(by.id("nestedSplitter-splitbar-0")).click();
			expect(takeScreenshot(element(by.id("mySplitter")))).toLookAs("2_horizontal_bar_focused");
		}
	});
});