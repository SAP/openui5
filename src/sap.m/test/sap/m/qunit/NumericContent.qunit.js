/*global QUnit, sinon */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/GenericTile",
	"sap/m/NumericContent",
	"sap/m/TileContent",
	"sap/ui/core/TooltipBase",
	"sap/ui/core/ResizeHandler",
	"sap/m/library"
], function (jQuery, GenericTile, NumericContent, TileContent, TooltipBase, ResizeHandler, library) {
	"use strict";

	// shortcut for sap.m.ValueColor
	var ValueColor = library.ValueColor;

	// shortcut for sap.m.DeviationIndicator
	var DeviationIndicator = library.DeviationIndicator;

	// shortcut for sap.m.LoadState
	var LoadState = library.LoadState;

	// shortcut for sap.m.Size
	var Size = library.Size;

	jQuery.sap.initMobile();

	QUnit.module("Rendering test - sap.m.NumericContent", {
		beforeEach: function () {
			this.oNumericContent = fnCreateExampleNumericContent();
			this.oNumericContent.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});
	QUnit.test("Numeric Content rendered.", function (assert) {
		this.oNumericContent.setValue("12");
		sap.ui.getCore().applyChanges();
		fnAssertNumericContentHasRendered(assert);
	});

	QUnit.test("The Icon's cursor is pointer if press event is attached", function (assert) {
		// Arrange
		var oSpy = sinon.spy(this.oNumericContent, "_setPointerOnIcon");
		// Act
		this.oNumericContent.attachPress(function () {});
		// Assert
		assert.equal(oSpy.callCount, 1, "setPointerOnIcon was called.");
		assert.ok(this.oNumericContent._oIcon.hasStyleClass("sapMPointer"), "sapMPointer class was added");
	});

	QUnit.test("The Icon's cursor is default if press event is detached", function (assert) {
		// Arrange
		var oSpy = sinon.spy(this.oNumericContent, "_setPointerOnIcon");
		function onPress () {}
		// Act
		this.oNumericContent.attachPress(onPress);
		this.oNumericContent.detachPress(onPress);
		// Assert
		assert.equal(oSpy.callCount, 2, "setPointerOnIcon was called.");
		assert.ok(!this.oNumericContent._oIcon.hasStyleClass("sapMPointer"), "sapMPointer class not present");
	});

	QUnit.test("setIcon calls _setPointerOnIcon", function (assert) {
		// Arrange
		var oSpy = sinon.spy(this.oNumericContent, "_setPointerOnIcon");
		// Act
		this.oNumericContent.setIcon();
		// Assert
		assert.equal(oSpy.callCount, 1, "setPointerOnIcon was called.");
	});

	QUnit.module("Rendering test - sap.m.NumericContent inside sap.m.GenericTile");

	QUnit.test("Numeric Content inside sap.m.GenericTile rendered.", function (assert) {
		// Arrange
		this.oNumericContent = fnCreateExampleNumericContent();
		this.oGenericTile = new GenericTile("generic-tile", {
			tileContent: [new TileContent({
				content: this.oNumericContent
			})]
		});
		this.oGenericTile.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		this.oNumericContent.setValue("12");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(jQuery.sap.domById("generic-tile"), "GenericTile (wrapper of NumericContent) was rendered successfully");
		fnAssertNumericContentHasRendered(assert);

		// Cleanup
		this.oGenericTile.destroy();
		this.oGenericTile = null;
		this.oNumericContent = null;
	});

	QUnit.test("Resize handler is registered in init phase.", function (assert) {
		// Arrange
		var oSpyRegister = sinon.spy(ResizeHandler, "register");
		var oSpyDeregister = sinon.spy(ResizeHandler, "deregister");
		this.oNumericContent = fnCreateExampleNumericContent();
		this.oGenericTile = new GenericTile("generic-tile", {
			tileContent: [new TileContent({
				content: this.oNumericContent
			})]
		});

		// Act
		this.oGenericTile.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oSpyRegister.callCount, 1, "ResizeHandler.register was called.");
		this.oGenericTile.destroy();
		assert.equal(oSpyDeregister.callCount, 1, "ResizeHandler.deregister was called.");

		// Cleanup
		this.oGenericTile = null;
		this.oNumericContent = null;
	});

	QUnit.module("Functional tests - sap.m.NumericContent", {
		beforeEach: function () {
			this.oNumericContent = fnCreateExampleNumericContent();
			this.oNumericContent.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});

	QUnit.test("Test formatter value processing", function (assert) {
		this.oNumericContent.setFormatterValue(false);
		this.oNumericContent.setValue("68Mio.");
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery.sap.byId("numeric-cnt-value").text(), "68Mi", "Value was rendered successfully with formatter switched off");
		assert.equal(jQuery.sap.byId("numeric-cnt-scale").text(), "M", "Scale was rendered successfully with formatter switched off");
		this.oNumericContent.setFormatterValue(true);
		this.oNumericContent.setValue("68 Mio");
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery.sap.byId("numeric-cnt-value").text(), "68", "Value was rendered successfully with formatter switched on");
		assert.equal(jQuery.sap.byId("numeric-cnt-scale").text(), "Mio", "Scale was rendered successfully with formatter switched on");
		this.oNumericContent.setValue(undefined);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery.sap.byId("numeric-cnt-value").text(), "0", "Value cleaned successfully with formatter switched on");
		assert.equal(jQuery.sap.byId("numeric-cnt-scale").text(), "", "Scale cleaned successfully with formatter switched on");
	});

	QUnit.test("Test processing of formatter value with RTL and LTR mark", function (assert) {
		this.oNumericContent.setFormatterValue(true);
		var sFormattedValue = String.fromCharCode(8206) + String.fromCharCode(8207) + "58,7 Mio";
		this.oNumericContent.setValue(sFormattedValue);
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery.sap.byId("numeric-cnt-value").text(), "58,7", "Value was rendered successfully with formatter switched on");
		assert.equal(jQuery.sap.byId("numeric-cnt-scale").text(), "Mio", "Scale was rendered successfully with formatter switched on");
	});

	QUnit.test("Test nullify parameter", function (assert) {
		assert.equal(jQuery.sap.byId("numeric-cnt-value").text(), "0", "Value was nullified successfully");
		this.oNumericContent.setNullifyValue(false);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery.sap.byId("numeric-cnt-value").text(), "", "Value was not nullified");
	});

	QUnit.test("Test tooltip text", function (assert) {
		//Arrange
		this.oNumericContent.setTooltip("Test, test");
		//Act
		var sTooltip = this.oNumericContent.getTooltip();
		//Assert
		assert.deepEqual(sTooltip, "Test, test", "Tooltip is a string and it's correct");

		//Act
		sTooltip = this.oNumericContent.getTooltip_AsString();
		//Assert
		assert.deepEqual(sTooltip, "Test, test", "Tooltip is correct");

		//Arrange
		var oTooltip = new TooltipBase({text: "Test, test"});
		this.oNumericContent.setTooltip(oTooltip);
		//Act
		sTooltip = this.oNumericContent.getTooltip();
		//Assert
		assert.notDeepEqual(sTooltip, "Test, test", "Tooltip is not a string");
	});

	QUnit.test("Test alternative text", function (assert) {
		//Act
		var sAltText = this.oNumericContent.getAltText();
		//Assert
		assert.equal(sAltText, "0\nAscending\nGood", "Alternative text is correct");

		//Arrange
		this.oNumericContent.setIconDescription("Icon description");
		//Act
		sAltText = this.oNumericContent.getAltText();
		//Assert
		assert.equal(sAltText, "Icon description\n0\nAscending\nGood", "Alternative text is correct with icon description");

		//Arrange
		this.oNumericContent.setNullifyValue(false);
		//Act
		sAltText = this.oNumericContent.getAltText();
		//Assert
		assert.equal(sAltText, "Icon description\n\nAscending\nGood", "Alternative text is correct with nullify value set to false");

		//Arrange
		this.oNumericContent.setNullifyValue(true);
		//Act
		this.oNumericContent.setValue("10");
		this.oNumericContent.setScale("$");
		sAltText = this.oNumericContent.getAltText();
		//Assert
		assert.equal(this.oNumericContent.getAltText(), "Icon description\n10$\nAscending\nGood", "Alternative text is correct with a value and scale set up");
	});

	QUnit.test("Test _getMaxDigitsData language", function (assert) {
		// Arrange 1
		var sOrigLang = sap.ui.getCore().getConfiguration().getLanguage();
		var oExpected = {fontClass: "sapMNCLargeFontSize", maxLength: 4};
		sap.ui.getCore().getConfiguration().setLanguage("en_US");

		// Act 1
		var oMaxDigitsData = this.oNumericContent._getMaxDigitsData();

		// Assert 1
		assert.deepEqual(oMaxDigitsData, oExpected, "Max digits data should be correct with normal language casing.");

		// Arrange 2
		sap.ui.getCore().getConfiguration().setLanguage("EN_US");

		// Act 2
		oMaxDigitsData = this.oNumericContent._getMaxDigitsData();

		// Assert 2
		assert.deepEqual(oMaxDigitsData, oExpected, "Max digits data should be correct with uppercase language casing.");

		// Arrange 3
		sap.ui.getCore().getConfiguration().setLanguage("en_us");

		// Act 3
		oMaxDigitsData = this.oNumericContent._getMaxDigitsData();

		// Assert 3
		assert.deepEqual(oMaxDigitsData, oExpected, "Max digits data should be correct with lowercase language casing.");

		// Arrange 4
		sap.ui.getCore().getConfiguration().setLanguage("en-US-x-sappsd");

		// Act 4
		oMaxDigitsData = this.oNumericContent._getMaxDigitsData();

		// Assert 4
		assert.deepEqual(oMaxDigitsData, oExpected, "Max digits data should be correct for a language which is not defined in the language map.");

		// Arrange 5
		sap.ui.getCore().getConfiguration().setLanguage("de");

		// Act 5
		oMaxDigitsData = this.oNumericContent._getMaxDigitsData();

		// Assert 5
		assert.deepEqual(oMaxDigitsData, {fontClass: "sapMNCSmallFontSize", maxLength: 8}, "Max digits data should be correct for de language.");

		// Restore
		sap.ui.getCore().getConfiguration().setLanguage(sOrigLang);
	});

	QUnit.module("Property withoutMargin", {
		beforeEach: function () {
			this.oNumericContent = new NumericContent({
				scale: "Mrd",
				indicator: DeviationIndicator.Up,
				value: "699"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});

	QUnit.test("Check default value", function (assert) {
		assert.ok(this.oNumericContent.getWithMargin(), "Default value shall be 'false'.");
	});

	QUnit.test("CSS Class needs to be added if withoutMargin is set to true", function (assert) {
		assert.ok(!this.oNumericContent.$().hasClass("WithoutMargin"));
		this.oNumericContent.setWithMargin(false);
		sap.ui.getCore().applyChanges();
		assert.ok(this.oNumericContent.$().hasClass("WithoutMargin"), "'withoutMargin' CSS class expected.");
		assert.ok(jQuery(this.oNumericContent.$().children()[0]).hasClass("WithoutMargin"), "'withoutMargin' CSS class expected within the inner div container.");
		assert.ok(this.oNumericContent.$("value").hasClass("WithoutMargin"), "'withoutMargin' CSS class expected within the parent value container.");
		assert.ok(this.oNumericContent.$("value-scr").hasClass("WithoutMargin"), "'withoutMargin' CSS class expected within the value container.");
		assert.ok(this.oNumericContent.$().find(".sapMNCIndScale").hasClass("WithoutMargin"), "'withoutMargin' CSS class expected within the indicator and scale container.");
	});

	QUnit.module("Events test", {
		beforeEach: function () {
			this.oNumericContent = fnCreateExampleNumericContent();
			this.oNumericContent.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});

	QUnit.test("Attach events", function (assert) {
		//Arrange
		//Act
		var oNumericContent = this.oNumericContent.attachEvent("hover", fnHoverHandler, this.oNumericContent);
		//Assert
		assert.deepEqual(oNumericContent, this.oNumericContent, "NumericContent returned is equal to initial one");
		assert.equal(hasAttribute("tabindex", this.oNumericContent), false, "Attribute has not been added successfully since press handler was not available");
		assert.equal(this.oNumericContent.$().hasClass("sapMPointer"), false, "Class has not been added successfully since press handler was not available");

		//Arrange
		//Act
		oNumericContent = this.oNumericContent.attachEvent("press", fnPressHandler, this.oNumericContent);
		//Assert
		assert.ok(hasAttribute("tabindex", this.oNumericContent), "Attribute has been added successfully since press handler was available");
		assert.ok(this.oNumericContent.$().hasClass("sapMPointer"), "Class has been added successfully since press handler was available");
	});

	QUnit.test("Detach events.", function (assert) {
		//Arrange
		//Act
		var oNumericContent = this.oNumericContent.detachEvent("press", fnPressHandler, this.oNumericContent);
		//Assert
		assert.deepEqual(oNumericContent, this.oNumericContent, "NumericContentreturned is equal to initial one");
		assert.equal(hasAttribute("tabindex", this.oNumericContent), false, "Attribute not available since press was not defined");
		assert.equal(this.oNumericContent.$().hasClass("sapMPointer"), false, "Class not available since press was not defined");

		//Arrange
		oNumericContent = this.oNumericContent.attachEvent("press", fnPressHandler, this.oNumericContent);
		oNumericContent = this.oNumericContent.attachEvent("hover", fnHoverHandler, this.oNumericContent);
		//Act
		oNumericContent = this.oNumericContent.detachEvent("hover", fnHoverHandler, this.oNumericContent);
		//Assert
		assert.ok(hasAttribute("tabindex", this.oNumericContent), "Attribute still available since hover was unregistered (not press)");
		assert.ok(this.oNumericContent.$().hasClass("sapMPointer"), "Class still available since hover was unregistered (not press)");

		//Arrange
		//Act
		oNumericContent = this.oNumericContent.detachEvent("press", fnPressHandler, this.oNumericContent);
		//Assert
		assert.equal(hasAttribute("tabindex", this.oNumericContent), false, "Attribute has been removed successfully");
		assert.equal(this.oNumericContent.$().hasClass("sapMPointer"), false, "Class has been removed successfully");
	});

	QUnit.module("Adaptive font size", {
		beforeEach: function () {
			this.oNumericContent = new NumericContent("numeric-cnt", {
				indicator: DeviationIndicator.Up,
				value: "12345678",
				animateTextChange: false
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});

	QUnit.test("Test the adaptive font size change based on language - small", function(assert){
		// Arrange
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
		sap.ui.getCore().getConfiguration().setLanguage("de");
		this.oNumericContent.invalidate();
		sap.ui.getCore().applyChanges();
		// Assert
		assert.ok(this.oNumericContent.$("value-scr").hasClass("sapMNCSmallFontSize"),"When the language is set to 'de' the font should be smaller");
		// Arrange
		this.oNumericContent.setAdaptiveFontSize(false);
		this.oNumericContent.invalidate();
		sap.ui.getCore().applyChanges();
		// Assert
		assert.ok(this.oNumericContent.$("value-scr").hasClass("sapMNCLargeFontSize"),"When the language is set to 'de' and adaptiveFontSize is set to false the font should be larger");
		sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);

	});
	QUnit.test("Test the adaptive font size change based on language - medium", function(assert){
		// Arrange
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
		sap.ui.getCore().getConfiguration().setLanguage("es");
		this.oNumericContent.invalidate();
		sap.ui.getCore().applyChanges();
		// Assert
		assert.ok(this.oNumericContent.$("value-scr").hasClass("sapMNCMediumFontSize"),"When the language is set to 'es' the font should be smaller");
		// Arrange
		this.oNumericContent.setAdaptiveFontSize(false);
		this.oNumericContent.invalidate();
		sap.ui.getCore().applyChanges();
		// Assert
		assert.ok(this.oNumericContent.$("value-scr").hasClass("sapMNCLargeFontSize"),"When the language is set to 'es' and adaptiveFontSize is set to false the font should be larger");
		this.oNumericContent.setAdaptiveFontSize(true);
		sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);

	});
	QUnit.test("Test the adaptive font size change based on language - large", function(assert){
		// Arrange
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
		sap.ui.getCore().getConfiguration().setLanguage("bg");
		this.oNumericContent.invalidate();
		sap.ui.getCore().applyChanges();
		// Assert
		assert.ok(this.oNumericContent.$("value-scr").hasClass("sapMNCLargeFontSize"),"When the language is set to 'bg' the font should be smaller");
		// Arrange
		this.oNumericContent.setAdaptiveFontSize(false);
		this.oNumericContent.invalidate();
		sap.ui.getCore().applyChanges();
		// Assert
		assert.ok(this.oNumericContent.$("value-scr").hasClass("sapMNCLargeFontSize"),"When the language is set to 'bg' and adaptiveFontSize is set to false the font should stay the same");
		this.oNumericContent.setAdaptiveFontSize(true);
		sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);

	});

	QUnit.test("Test the adaptive font size change based on language - adaptiveFontSize: false", function(assert){
		// Arrange
		this.oNumericContent.setAdaptiveFontSize(false);

		// Assert
		assert.notOk(this.oNumericContent.$("value-scr").hasClass("sapMNCSmallFontSize") || this.oNumericContent.$("value-scr").hasClass("sapMNCMediumFontSize"),"When adaptiveFontSize is set to false the font size class should not change");
		assert.ok(this.oNumericContent.$("value-scr").hasClass("sapMNCLargeFontSize"), "When adaptiveFontSize is set to false the font size class should be the default one");

		this.oNumericContent.setAdaptiveFontSize(true);

	});

	QUnit.module("Truncate value to", {
		beforeEach: function () {
			this.oNumericContent = new NumericContent("numeric-cnt", {
				value: "12345678123456781234567812345678",
				animateTextChange: false
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});

	QUnit.test("Test custom truncateValueTo property", function(assert) {
		// Arrange
		this.oNumericContent.setTruncateValueTo(1);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 1, "Value is truncated to 1 char");

		// Arrange
		this.oNumericContent.setTruncateValueTo(20);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 20, "Value is truncated to 20 chars");
	});

	QUnit.test("Test default value when adaptiveFontSize=false", function(assert) {
		// Arrange
		this.oNumericContent.setAdaptiveFontSize(false);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 4, "Value is truncated to 4 chars");
	});

	QUnit.test("Test default value for specific language", function(assert) {
		// Arrange
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
		sap.ui.getCore().getConfiguration().setLanguage("de");
		this.oNumericContent.invalidate();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 8, "Value is truncated to 8 chars for 'de'");

		// Arrange
		sap.ui.getCore().getConfiguration().setLanguage("es");
		this.oNumericContent.invalidate();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 6, "Value is truncated to 6 chars for 'es'");

		// Arrange
		sap.ui.getCore().getConfiguration().setLanguage("en");
		this.oNumericContent.invalidate();
		sap.ui.getCore().applyChanges();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 4, "Value is truncated to 4 chars for 'en'");

		// return the language
		sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
	});

	/* --- Helpers --- */

	function fnAssertNumericContentHasRendered (assert) {
		assert.ok(jQuery.sap.domById("numeric-cnt"), "NumericContent was rendered successfully");
		assert.ok(jQuery.sap.domById("numeric-cnt-indicator"), "Indicator was rendered successfully");
		assert.ok(jQuery.sap.domById("numeric-cnt-value"), "Value was rendered successfully");
		assert.ok(jQuery.sap.domById("numeric-cnt-scale"), "Scale was rendered successfully");
		assert.ok(jQuery.sap.domById("numeric-cnt-icon-image"), "Icon was rendered successfully");
	}

	function fnCreateExampleNumericContent () {
		return new NumericContent("numeric-cnt", {
			size: Size.L,
			state: LoadState.Loaded,
			scale: "M",
			indicator: DeviationIndicator.Up,
			nullifyValue: true,
			formatterValue: false,
			valueColor: ValueColor.Good,
			icon: "sap-icon://customer-financial-fact-sheet"
		});
	}

	function fnHoverHandler () {
	}

	function fnPressHandler () {
	}

	function hasAttribute (sAttribute, oCurrentObject) {
		var sAttributeValue = oCurrentObject.$().attr(sAttribute);
		return typeof sAttributeValue !== typeof undefined && sAttributeValue !== false;
	}

});