/*global QUnit */
sap.ui.define(["sap/ui/core/theming/Parameters"], function (Parameters) {
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
	 * @param input, e.g. #abc
	 * @returns {string}, e.g. #aabbcc
	 */
	function unifyHexNotation(input) {
		if (input.length === 4) {
			var colorShortNotationRegexp = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			var sResult = colorShortNotationRegexp.exec(input);
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

		var sResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sHex);

		return (sResult ? "rgb(" + parseInt(sResult[1], 16) + ", " + parseInt(sResult[2], 16) + ", " + parseInt(sResult[3], 16) + ")" : sHex);
	}

	function normalizeValue(sCssPropertyValue) {
		return sCssPropertyValue ? sCssPropertyValue.replace(/\s/g, "").replace(/\"/g, "\'") : sCssPropertyValue;
	}

	/**
	 * test case function that compares the CSS on the DOM node to the according less parameter
	 * @param {object} assert the QUnit assert object
	 * @param {string} sClassName
	 * @param {string} sCSSProperty
	 * @param {string} sExpectedLessParameter
	 */
	function cssClassTestCase(assert, sClassName, sCSSProperty, sExpectedLessParameter) {
		// Arrange
		var $domElement = jQuery("#qunit-fixture div");
		sExpectedLessParameter = (sExpectedLessParameter[0] === "@" ? sExpectedLessParameter.substring(1) : sExpectedLessParameter);

		// Act
		$domElement.addClass(sClassName);

		// Assert
		var sThemeParameterValue = Parameters.get(sExpectedLessParameter);
		if (sCSSProperty === "font-size") {
			sThemeParameterValue = fontSizeToPx(sThemeParameterValue);
		} else {
			if (sCSSProperty === "border-color") {
				// fix: edge, IE11, firefox do not support shorthand CSS properties, so use one of the border properties instead
				sCSSProperty = "borderTopColor";
			}
			sThemeParameterValue = hexToRgb(sThemeParameterValue);
		}

		assert.ok(!!$domElement.css(sCSSProperty), "The class \"" + sClassName + "\" has a non-empty value for CSS property \"" + sCSSProperty + "\" ");
		assert.strictEqual(normalizeValue($domElement.css(sCSSProperty)), normalizeValue(sThemeParameterValue), "The class \"" + sClassName + "\" set CSS property \"" + sCSSProperty + "\" to \"@" + sExpectedLessParameter
			+ "\" (" + Parameters.get(sExpectedLessParameter) + ") - normalized results: " + normalizeValue($domElement.css(sCSSProperty)) + " vs " + normalizeValue(sThemeParameterValue));
	}

	QUnit.module("Theme-Dependent CSS Classes for: " + sap.ui.getCore().getConfiguration().getTheme(), {
		beforeEach: function () {
			jQuery("#qunit-fixture").append(jQuery("<div>I love theming!</div>"));
		},
		afterEach: function () {
			jQuery("#qunit-fixture").empty();
		}
	});

	/* font */
	QUnit.test("Should set the theme base class \"sapThemeFont\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeFont", "font-family", "sapUiFontFamily");
		cssClassTestCase.call(this, assert, "sapThemeFont", "font-size", "sapUiFontSize");
		cssClassTestCase.call(this, assert, "sapThemeFont", "font-size", "sapUiFontSize");
	});

	QUnit.test("Should set the theme base class \"sapThemeFontFamily\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeFontFamily", "font-family", "sapUiFontFamily");
	});

	QUnit.test("Should set the theme base class \"sapThemeFontSize\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeFontSize", "font-size", "sapUiFontSize");
	});

	/* text color */
	QUnit.test("Should set the theme base class \"sapThemeText\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeText", "color", "sapUiText");
	});

	QUnit.test("Should set the theme base class \"sapThemeText-asColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeText-asColor", "color", "sapUiText");
	});

	QUnit.test("Should set the theme base class \"sapThemeText-asBackgroundColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeText-asBackgroundColor", "background-color", "sapUiText");
	});

	QUnit.test("Should set the theme base class \"sapThemeText-asBorderColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeText-asBorderColor", "border-color", "sapUiText");
	});

	QUnit.test("Should set the theme base class \"sapThemeText-asOutlineColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeText-asOutlineColor", "outline-color", "sapUiText");
	});

	/* text color inverted */
	QUnit.test("Should set the theme base class \"sapThemeTextInverted\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeTextInverted", "color", "sapUiTextInverted");
	});

	QUnit.test("Should set the theme base class \"sapThemeTextInverted-asColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeTextInverted-asColor", "color", "sapUiTextInverted");
	});

	/* background color */
	QUnit.test("Should set the theme base class \"sapThemeBaseBG\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeBaseBG", "background-color", "sapUiBaseBG");
	});

	QUnit.test("Should set the theme base class \"sapThemeBaseBG-asColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeBaseBG-asColor", "color", "sapUiBaseBG");
	});

	QUnit.test("Should set the theme base class \"sapThemeBaseBG-asBackgroundColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeBaseBG-asBackgroundColor", "background-color", "sapUiBaseBG");
	});

	QUnit.test("Should set the theme base class \"sapThemeBaseBG-asBorderColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeBaseBG-asBorderColor", "border-color", "sapUiBaseBG");
	});

	/* brand color */
	QUnit.test("Should set the theme base class \"sapThemeBrand\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeBrand", "color", "sapUiBrand");
	});

	QUnit.test("Should set the theme base class \"sapThemeBrand-asColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeBrand-asColor", "color", "sapUiBrand");
	});

	QUnit.test("Should set the theme base class \"sapThemeBrand-asBackgroundColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeBrand-asBackgroundColor", "background-color", "sapUiBrand");
	});

	QUnit.test("Should set the theme base class \"sapThemeBrand-asBorderColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeBrand-asBorderColor", "border-color", "sapUiBrand");
	});

	QUnit.test("Should set the theme base class \"sapThemeBrand-asOutlineColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeBrand-asOutlineColor", "outline-color", "sapUiBrand");
	});

	/* highlight color */
	QUnit.test("Should set the theme base class \"sapThemeHighlight\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeHighlight", "color", "sapUiHighlight");
	});

	QUnit.test("Should set the theme base class \"sapThemeHighlight-asColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeHighlight-asColor", "color", "sapUiHighlight");
	});

	QUnit.test("Should set the theme base class \"sapThemeHighlight-asBackgroundColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeHighlight-asBackgroundColor", "background-color", "sapUiHighlight");
	});

	QUnit.test("Should set the theme base class \"sapThemeHighlight-asBorderColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeHighlight-asBorderColor", "border-color", "sapUiHighlight");
	});

	QUnit.test("Should set the theme base class \"sapThemeHighlight-asOutlineColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeHighlight-asOutlineColor", "outline-color", "sapUiHighlight");
	});

	/* border color */
	QUnit.test("Should set the theme base class \"sapThemeForegroundBorderColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeForegroundBorderColor", "border-color", "sapContent_ForegroundBorderColor");
	});

	QUnit.test("Should set the theme base class \"sapThemeForegroundBorderColor-asBorderColor\" correctly", function (assert) {
		cssClassTestCase.call(this, assert, "sapThemeForegroundBorderColor-asBorderColor", "border-color", "sapContent_ForegroundBorderColor");
	});

});