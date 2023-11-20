/* global describe, it, element, by, takeScreenshot, expect, browser */

describe("sap.ui.layout.ResponsiveSplitter", function () {
	"use strict";

	var bDesktop = false;

	it("should load test page", function () {
		browser.executeScript(
			"return sap.ui.Device.system.desktop;")
		.then(function (response) {
			bDesktop = response;
		});

		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it("should focus vertical splitter bar", function () {
		if (bDesktop) {
			element(by.id("__splitter2-splitbar-0")).click();
			expect(takeScreenshot()).toLookAs("1_vertical_bar_focused");
		}
	});

	it("should focus horizontal splitter bar", function () {
		if (bDesktop) {
			element(by.id("__splitter0-splitbar-0")).click();
			expect(takeScreenshot()).toLookAs("2_horizontal_bar_focused");
		}
	});

	it("should visualize paginator", function () {
		if (bDesktop) {
			browser.executeScript("sap.ui.getCore().byId('responsiveSplitter').setWidth('500px');");
			expect(takeScreenshot()).toLookAs("3_responsivesplitter_with_paginator");
		}
	});
});