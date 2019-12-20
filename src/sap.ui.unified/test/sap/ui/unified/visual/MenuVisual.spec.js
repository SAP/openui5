/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.ui.unified.MenuVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.Menu';

	it('Tab when menu is opened navigates to next focusable element', function() {
		var oButton1 = element(by.id("B1")),
			oButton2 = element(by.id("B2"));
		oButton1.click();
		browser.actions().sendKeys(protractor.Key.TAB).perform();
		expect(takeScreenshot(oButton2)).toLookAs('second_button_focused_after_tab');
	});

	it('Focus persists on the last focused menu item on mouse out of the menu', function() {
		var oMenu = element(by.id("mainMenu"));

		if (browser.testrunner.runtime.platformName != "android" && browser.testrunner.runtime.platformName != "ios") {
			element(by.id("B1")).click();
			browser.actions().mouseMove(element(by.id("I222"))).perform();
			browser.actions().mouseMove(element(by.id("__page0-title"))).perform();

			expect(takeScreenshot(oMenu)).toLookAs("focus_persists_on_menuitem");
		}
	});
});