/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.ui.unified.MenuVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.Menu';

	it('After selecting an item, the focus returns to main menu opener button', function () {
		var oButton1 = element(by.id("B1"));

		oButton1.click();
		element(by.id("I221")).click();

		expect(takeScreenshot(oButton1)).toLookAs("focus_returned_to_domRef");
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