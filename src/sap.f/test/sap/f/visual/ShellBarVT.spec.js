/*global describe, it, element, by, takeScreenshot, expect, browser*/

describe('sap.f.ShellBarVT', function() {
	'use strict';

	browser.testrunner.currentSuite.meta.controlName = 'sap.f.ShellBar';

	it('Test page loaded', function() {
		element(by.css(".sapUiBody")).click();
		expect(takeScreenshot()).toLookAs('initial');
	});

	it("Mega Menu Expanded", function() {
		element(by.id("__button3-internalBtn")).click();
		expect(takeScreenshot()).toLookAs("megaMenu_expanded");
	});

	it("ShellBar scale",function() {
		element(by.id("oTestBtnWidth")).click();
		expect(takeScreenshot()).toLookAs("shellBar-scale");
	});

	it("ShellBar click overflow button",function() {

		if (element(by.css(".sapFShellBarOverflowButton"))){
			element(by.css(".sapFShellBarOverflowButton")).click();
		}
		expect(takeScreenshot()).toLookAs("shellBar-overflow-button-clicked");
	});
});
