/*global describe, it, element, by, takeScreenshot, expect, browser*/

describe("sap.f.ShellBarVT", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.f.ShellBar";

	it("Test page loaded", function() {
		element(by.css(".sapUiBody")).click();
		expect(takeScreenshot(element(by.id("shell-bar")))).toLookAs("initial");
	});

	it("Mega Menu Expanded", function() {
		element(by.id("__button3-internalBtn")).click();
		expect(takeScreenshot(element(by.id("__menu1")))).toLookAs("megaMenu_expanded");
	});

	it("ShellBar scale",function() {
		element(by.id("oTestBtnWidth")).click();
		expect(takeScreenshot(element(by.id("shell-bar")))).toLookAs("shellBar-scale");
	});

	it("ShellBar click overflow button",function() {

		if (element(by.css(".sapFShellBarOverflowButton"))) {
			element(by.css(".sapFShellBarOverflowButton")).click();
		}
		expect(takeScreenshot(element(by.id("__toolbar0-popover")))).toLookAs("shellBar-overflow-button-clicked");
	});
});
