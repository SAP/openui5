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

	it('After selecting an item, the focus returns to main menu opener button', function () {
		var oButton1 = element(by.id("B1"));

		oButton1.click();
		element(by.id("I221")).click();

		expect(takeScreenshot(oButton1)).toLookAs("focus_returned_to_domRef");
	});
});