/* global describe, it, takeScreenshot, browser, expect */

describe("sap.ui.layout.ResponsiveColumnLayout", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.ui.layout.cssgrid.ResponsiveColumnLayout";

	it("should visualize CSSGrid with ResponsiveColumnLayout", function () {
		expect(takeScreenshot()).toLookAs("0_ResponsiveColumnLayout");
	});

	it("should visualize CSSGrid with ResponsiveColumnLayout after resizing", function () {
		browser.executeScript("sap.ui.getCore().byId('panelContainer').setWidth('1000px');");
		expect(takeScreenshot()).toLookAs("1_ResponsiveColumnLayoutResized");
	});
});