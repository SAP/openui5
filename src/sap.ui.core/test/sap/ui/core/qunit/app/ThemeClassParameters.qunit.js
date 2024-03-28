/*global QUnit */
sap.ui.define([
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters"
], function (Theming, Parameters) {
	"use strict";

	/**
	 * converts a textual font-size value to its px representation
	 * @param {string} sFontSize a string based font-size
	 * @return {string} the px font-size value
	 */
	function fontSizeToPx(sFontSize) {
		switch (sFontSize) {
			case "small": return "13px";
			case "medium": return "16px";
			case "large": return "18px";
			case "x-large": return "24px";
			default: return sFontSize;
		}
	}

	/**
	 * converts short notation hex color code to long notation
	 * @param {string} input Color string, e.g. #abc
	 * @returns {string} Normalized, 6-hex-digit color string, e.g. #aabbcc
	 */
	function unifyHexNotation(input) {
		if (input.length === 4) {
			const colorShortNotationRegexp = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			const sResult = colorShortNotationRegexp.exec(input);
			if (sResult) {
				return "#" + sResult[1] + sResult[1] + sResult[2] + sResult[2] + sResult[3] + sResult[3];
			}
		}
		return input;
	}

	/**
	 * converts a hex color value to RGB
	 * @param {string} sHex a hex color value in #rgb or #rrggbb value
	 * @return {string} the rgv(r,g,b) color value
	 */
	function hexToRgb(sHex) {

		sHex = unifyHexNotation(sHex);

		const sResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sHex);

		return (sResult ? "rgb(" + parseInt(sResult[1], 16) + ", " + parseInt(sResult[2], 16) + ", " + parseInt(sResult[3], 16) + ")" : sHex);
	}

	function canonicalize(value, cssProperty) {
		if (cssProperty === "font-size") {
			return fontSizeToPx(value);
		}
		return hexToRgb(value);
	}

	function normalizeValue(sCssPropertyValue) {
		return sCssPropertyValue ? sCssPropertyValue.replace(/\s/g, "").replace(/\"/g, "\'") : sCssPropertyValue;
	}

	/**
	 * Get a theme parameter by its name.
	 *
	 * @param {string} name Name of the parameter (without the leading "@" of the less parameter name)
	 * @returns {Promise<string|undefined>} Value of the theme parameter
	 */
	function getThemeParameter(name) {
		return new Promise((resolve) => {
			const value = Parameters.get({
				name: name,
				callback: resolve
			});
			if ( value !== undefined ) {
				resolve(value);
			}
		});
	}

	/**
	 * Creates a QUnit.module with one QUnit.test for each given scenario.
	 * Each test applies the given CSS class and compares the CSS property value with the value of the theme parameter.
	 * @param {string} caption Common topic of the scenarios
	 * @param {Array<Array<string>>} scenarios Scenarios to test
	 * @param {string} scenarios[].0 CSS class to apply
	 * @param {string} scenarios[].1 Style property to check
	 * @param {string} scenarios[].2 Theme parameter defining the expected value
	 */
	function makeModule(caption, scenarios) {

		QUnit.module(`Theme-Dependent CSS Classes for "${Theming.getTheme()}" (${caption})`);

		scenarios.forEach(([sClassName, sCSSProperty, sThemeParameter]) => {
			QUnit.test(`Should set the theme base class "${sClassName}" correctly"`, async function(assert) {
				const expectedValue = await getThemeParameter(sThemeParameter);
				const normalizedExpectedValue = normalizeValue(canonicalize(expectedValue, sCSSProperty));

				// Arrange
				const domElement = document.createElement("div");
				document.getElementById("qunit-fixture").appendChild(domElement);

				// Act
				domElement.className = sClassName;

				// Assert
				const actualValue = window.getComputedStyle(domElement)[sCSSProperty];
				const normalizedActualValue = normalizeValue(actualValue);
				assert.ok(actualValue,
					`The class "${sClassName}" should result in a non-empty value for CSS property "${sCSSProperty}"`);
				assert.strictEqual(normalizedActualValue, normalizedExpectedValue,
					`The class "${sClassName}" should set the CSS property "${sCSSProperty}" to "@${sThemeParameter}"`
					+ ` (= ${expectedValue}) - normalized results: ${normalizedActualValue} vs ${normalizedExpectedValue}`);

				// cleanup
				domElement.remove();
			});
		});
	}

	/* font */
	makeModule("font", [
		["sapThemeFont", "font-family", "sapUiFontFamily"],
		["sapThemeFont", "font-size", "sapUiFontSize"],
		["sapThemeFontFamily", "font-family", "sapUiFontFamily"],
		["sapThemeFontSize", "font-size", "sapUiFontSize"]
	]);

	/* text color */
	makeModule("text color", [
		["sapThemeText", "color", "sapUiBaseText"],
		["sapThemeText-asColor", "color", "sapUiBaseText"],
		["sapThemeText-asBackgroundColor", "background-color", "sapUiBaseText"],
		["sapThemeText-asBorderColor", "border-color", "sapUiBaseText"],
		["sapThemeText-asOutlineColor", "outline-color", "sapUiBaseText"]
	]);

	/* text color inverted */
	makeModule("ext color inverted", [
		["sapThemeTextInverted", "color", "sapUiContentContrastTextColor"],
		["sapThemeTextInverted-asColor", "color", "sapUiContentContrastTextColor"]
	]);

	/* background color */
	makeModule("background color", [
		["sapThemeBaseBG", "background-color", "sapUiBaseBG"],
		["sapThemeBaseBG-asColor", "color", "sapUiBaseBG"],
		["sapThemeBaseBG-asBackgroundColor", "background-color", "sapUiBaseBG"],
		["sapThemeBaseBG-asBorderColor", "border-color", "sapUiBaseBG"]
	]);

	/* brand color */
	makeModule("brand color", [
		["sapThemeBrand", "color", "sapUiBrand"],
		["sapThemeBrand-asColor", "color", "sapUiBrand"],
		["sapThemeBrand-asBackgroundColor", "background-color", "sapUiBrand"],
		["sapThemeBrand-asBorderColor", "border-color", "sapUiBrand"],
		["sapThemeBrand-asOutlineColor", "outline-color", "sapUiBrand"]
	]);

	/* highlight color */
	makeModule("highlight color", [
		["sapThemeHighlight", "color", "sapUiHighlight"],
		["sapThemeHighlight-asColor", "color", "sapUiHighlight"],
		["sapThemeHighlight-asBackgroundColor", "background-color", "sapUiHighlight"],
		["sapThemeHighlight-asBorderColor", "border-color", "sapUiHighlight"],
		["sapThemeHighlight-asOutlineColor", "outline-color", "sapUiHighlight"]
	]);

	/* border color */
	makeModule("border color", [
		["sapThemeForegroundBorderColor", "border-color", "sapUiContentForegroundBorderColor"],
		["sapThemeForegroundBorderColor-asBorderColor", "border-color", "sapUiContentForegroundBorderColor"]
	]);

});
