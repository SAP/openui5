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
});