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

	/*
	 * Selecting a swatch from the Regular Color Palette section should show a focused and selected state
	 * for that swatch.
	 */
	it('Select color from default palette', function() {
		element(by.id(sOpenButtonId)).click();
		_getColorPaletteSwatch(false, 5).click();
		element(by.id(sOpenButtonId)).click();

		expect(takeScreenshot(_getColorPalette(sColorPaletteId))).toLookAs('color_palette_selected_color');
	});

	/*
	 * Selecting a swatch from the Recent Colors section should focus and select the first item in the
	 * Recent Colors palette section.
	 */
	it('Select color from recent colors palette', function() {
		element(by.id(sOpenButtonId)).click();
		_getColorPaletteSwatch(false, 2).click();

		element(by.id(sOpenButtonId)).click();
		_getColorPaletteSwatch(true, 1).click();

		element(by.id(sOpenButtonId)).click();

		expect(takeScreenshot(_getColorPalette(sColorPaletteId))).toLookAs('color_palette_selected_recent_color');
	});

	/*
	 * Selecting a color from the More Colors color picker should also focus and select the first item in
	 * the Recent Colors palette section.
	 */
	it('Select color from more colors and show in recent colors palette', function() {
		var sMoreColorsButtonId = "oCPPop-palette-btnMoreColors",
			sMoreColorsOkButtonId = "__button24";

		element(by.id(sOpenButtonId)).click();

		// Open More Colors color picker and confirm color selection
		element(by.id(sMoreColorsButtonId)).click();
		element(by.id(sMoreColorsOkButtonId)).click();

		element(by.id(sOpenButtonId)).click();

		expect(takeScreenshot(_getColorPalette(sColorPaletteId))).toLookAs('color_palette_selected_color_more');
	});

	/*
	* Selecting a color from the Default Colors color picker should also focus and "select" the Default color.
	* The color should also be added to the Recent Colors section.
	*/
	it('Select color from more colors and show in recent colors palette', function() {
		var sDefaultColorButtonId = "oCPPop-palette-btnDefaultColor";

		element(by.id(sOpenButtonId)).click();

		// Select Default Color and confirm color selection
		element(by.id(sDefaultColorButtonId)).click();

		element(by.id(sOpenButtonId)).click();

		expect(takeScreenshot(_getColorPalette(sColorPaletteId))).toLookAs('color_palette_selected_default_color');
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

	function _getColorPaletteSwatch(bRecentColors, iSwatch) {
		var sPaletteRegion = bRecentColors ? "recentColors" : "paletteColor",
			sSelector = `#oCPPop-palette-swatchCont-${sPaletteRegion} .sapMColorPaletteSquare:nth-of-type(${iSwatch})`;

		return element(by.css(sSelector));
	}
});