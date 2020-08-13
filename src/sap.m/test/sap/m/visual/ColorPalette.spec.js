/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe("sap.m.ColorPalette", function() {
	"use strict";

	var sOpenButtonId = "__button2",
		sColorPaletteId = "oCPPop-palette";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ColorPalette';

	it('Open color palette', function() {
		element(by.id(sOpenButtonId)).click();
		expect(takeScreenshot(_getColorPalette(sColorPaletteId))).toLookAs('color_palette_opened');
	});

	it('Navigate with END keyboard key', function () {
		browser.actions().sendKeys(protractor.Key.END).perform();
		expect(takeScreenshot(_getColorPalette(sColorPaletteId))).toLookAs("end_keyboard_button_pressed");
	});

	it('Navigate with HOME keyboard key', function () {
		browser.actions().sendKeys(protractor.Key.HOME).perform();
		expect(takeScreenshot(_getColorPalette(sColorPaletteId))).toLookAs("home_keyboard_button_pressed");
	});

	function _getColorPalette(sColorPaletteId) {
		return element(by.id(sColorPaletteId));
	}
});