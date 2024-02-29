/*global describe,it,element,by,takeScreenshot,expect,browser,jQuery,protractor*/

describe("sap.m.PageFloatingFooter", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Page';

	it("Should load test page", function () {
		expect(takeScreenshot()).toLookAs("initial");
	});

	it("Should scroll into view the element on focus", function () {
		browser.executeScript(function() {
			var oPageDomRef = sap.ui.core.Element.getElementById("page").getDomRef();
			jQuery(oPageDomRef).css("height", "400px");
		});
		expect(takeScreenshot()).toLookAs("focused_element_not_fully_visible");

		element(by.id("button0")).click();
		browser.actions().sendKeys(protractor.Key.TAB).perform();

		expect(takeScreenshot()).toLookAs("focused_element_visible");
	});
});