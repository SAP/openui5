/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/m/Button",
	"sap/m/GenericTile",
	"sap/m/Label",
	"sap/m/NumericContent",
	"sap/m/Table",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/TileContent",
	"sap/ui/core/TooltipBase",
	"sap/ui/core/ResizeHandler",
	"sap/m/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/util/Mobile",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/theming/Parameters"
], function(Localization, Library, nextUIUpdate, jQuery, Button, GenericTile, Label, NumericContent, Table, Toolbar, ToolbarSpacer, Column, ColumnListItem, JSONModel, TileContent, TooltipBase, ResizeHandler, library, KeyCodes, Mobile, qutils, Parameters) {
	"use strict";

	var oResourceBundle = Library.getResourceBundleFor("sap.m");

	// shortcut for sap.m.ValueColor
	var ValueColor = library.ValueColor;

	// shortcut for sap.m.DeviationIndicator
	var DeviationIndicator = library.DeviationIndicator;

	// shortcut for sap.m.LoadState
	var LoadState = library.LoadState;

	// shortcut for sap.m.Size
	var Size = library.Size;

	Mobile.init();

	QUnit.module("Rendering test - sap.m.NumericContent", {
		beforeEach: async function() {
			this.oNumericContent = fnCreateExampleNumericContent();
			this.oNumericContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});

	QUnit.test("Numeric Content rendered.", async function(assert) {
		this.oNumericContent.setValue("12");
		await nextUIUpdate();
		fnAssertNumericContentHasRendered(assert);
	});

	QUnit.test("Numeric Content Focus.", function (assert) {
		this.oNumericContent.$().focus();
		assert.ok(getComputedStyle(this.oNumericContent.$().get(0)).outline.indexOf(Parameters.get("sapUiContentFocusStyle")), "Focus Style applied.");
		assert.ok(getComputedStyle(this.oNumericContent.$().get(0)).outline.indexOf(Parameters.get("sapUiContentFocusColor")), "Focus Color applied.");
		assert.ok(getComputedStyle(this.oNumericContent.$().get(0)).outline.indexOf(Parameters.get("sapUiContentFocusWidth")), "Focus Width applied.");
	});

	QUnit.test("Fire Event Not triggered when pressing enter key", async function(assert) {
		this.oNumericContent.setValue("12");
		await nextUIUpdate();
		var oSpy = this.spy(this.oNumericContent, "firePress");
		qutils.triggerKeyup("numeric-cnt", KeyCodes.ENTER);
		qutils.triggerKeyEvent("keypress", "numeric-cnt", KeyCodes.ENTER);
		assert.ok(oSpy.notCalled, "The firePress function has been called only once when the enter key is press");
	});

	QUnit.test("Numeric Content rendered with correct value and scale when formatterValue is set to true.", async function(assert) {
		var value = '12.2';
		var scale = '%';

		this.oNumericContent.setFormatterValue(true);

		this.oNumericContent.setValue(value + scale);
		await nextUIUpdate();
		assert.strictEqual(document.getElementById("numeric-cnt-value-inner").innerText, value, "Value is rendered correctly");
		assert.strictEqual(document.getElementById("numeric-cnt-scale").innerText, scale, "Scale is rendered correctly");

		// for few countries metric representation is different
		// for eg; in turkish % is written as %12.2 instead of 12.2%
		this.oNumericContent.setValue(scale + value);
		await nextUIUpdate();
		assert.strictEqual(document.getElementById("numeric-cnt-value-inner").innerText, value, "Value is rendered correctly");
		assert.strictEqual(document.getElementById("numeric-cnt-scale").innerText, scale, "Scale is rendered correctly");
	});

	QUnit.test("Numeric Content - Render Placeholder loading animation", async function(assert) {
		//Switch to Loading State
		this.oNumericContent.setState(LoadState.Loading);
		await nextUIUpdate();
		assert.ok(document.querySelector(".sapMNCLoadingShimmer"), "Loading Shimmer present on 'Loading' state");

		//Switch to Loaded State
		this.oNumericContent.setState(LoadState.Loaded);
		await nextUIUpdate();
		assert.equal(document.querySelector(".sapMNCLoadingShimmer"), null, "Loading Shimmer absent on 'Loaded' state");
	});

	QUnit.test("Numeric Content - State test", async function(assert) {
		this.oNumericContent.setValue(200);

		//Switch to Loading State
		this.oNumericContent.setState(LoadState.Loading);
		await nextUIUpdate();
		assert.ok(document.querySelector(".sapMNCLoadingShimmer"), "Loading Shimmer present on 'Loading' state");
		assert.equal(getComputedStyle(document.querySelector(".sapMNCLoadingShimmer")).opacity, "1" ,"Loading Shimmer Opacity is set correctly");
		assert.equal(getComputedStyle(document.querySelector(".sapMNCValue.Good.Loading")).opacity, "1" ,"NumericContent Opacity is set correctly");

		//Switch to Loaded State
		this.oNumericContent.setState(LoadState.Loaded);
		await nextUIUpdate();
		assert.equal(document.querySelector(".sapMNCLoadingShimmer"), null, "Loading Shimmer absent on 'Loaded' state");
		assert.equal(getComputedStyle(document.querySelector(".sapMNCValue.Good.Loaded")).opacity, "1" ,"NumericContent Opacity is set correctly");

		//Switch to Failed State
		this.oNumericContent.setState(LoadState.Failed);
		await nextUIUpdate();
		assert.equal(getComputedStyle(document.querySelector(".sapMNCValue.Good.Failed")).opacity, "0.25" ,"sapMNCValue Opacity is set correctly");
		assert.equal(getComputedStyle(document.querySelector(".sapMNCIconImage.Failed")).opacity, "1" ,"sapMNCValue Opacity is set correctly");
		assert.equal(getComputedStyle(document.querySelector(".sapMNCScale.Failed")).opacity, "1" ,"sapMNCScale Opacity is set correctly");

	});

	QUnit.test("Numeric Content has ARIA properties", function (assert) {
		assert.strictEqual(this.oNumericContent.$().attr("role"), "img", "The role is set to 'img'");
		assert.strictEqual(this.oNumericContent.$().attr("aria-label"), this.oNumericContent.getTooltip_AsString(), "The aria-label is set to numeric content's tooltip");
		assert.strictEqual(this.oNumericContent.$().attr("aria-roledescription"),  oResourceBundle.getText("NUMERIC_CONTENT_ROLE_DESCRIPTION"), "The roledescription is set to 'Numeric Content'");
	});

	QUnit.test("The Icon's cursor is pointer if press event is attached", function (assert) {
		// Arrange
		var oSpy = sinon.spy(this.oNumericContent, "_setPointerOnIcon");
		// Act
		this.oNumericContent.attachPress(function () {});
		// Assert
		assert.strictEqual(oSpy.callCount, 1, "setPointerOnIcon was called.");
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
		assert.strictEqual(oSpy.callCount, 2, "setPointerOnIcon was called.");
		assert.ok(!this.oNumericContent._oIcon.hasStyleClass("sapMPointer"), "sapMPointer class not present");
	});

	QUnit.test("setIcon calls _setPointerOnIcon", function (assert) {
		// Arrange
		var oSpy = sinon.spy(this.oNumericContent, "_setPointerOnIcon");
		// Act
		this.oNumericContent.setIcon();
		// Assert
		assert.strictEqual(oSpy.callCount, 1, "setPointerOnIcon was called.");
	});

	QUnit.test("setIndicatorIcon check via setIndicator function", function (assert) {
		var fnAssert = function (sExpectedIcon, sExpectedIndicator) {
			if (sExpectedIndicator !== "None") {
				assert.strictEqual(this.oNumericContent._oIndicatorIcon.getSrc(), sExpectedIcon, "Indicator icon src should be correct.");
				assert.ok(this.oNumericContent._oIndicatorIcon.hasStyleClass("sapMNCIndIcon"), "Indicator icon should have correct style class.");
				assert.strictEqual(this.oNumericContent.getIndicator(), sExpectedIndicator, "Indicator property should be set correctly.");
			}
			if (sExpectedIndicator === DeviationIndicator.None) {
				assert.strictEqual(this.oNumericContent._oIndicatorIcon.getSrc(), '', "There is no valid Indicator icon for DeviationIndicator.None, Hence there will be no indicator.");
			}
		}.bind(this);
		// Act
		this.oNumericContent.setIndicator(DeviationIndicator.Down);
		// Assert
		fnAssert("sap-icon://down", DeviationIndicator.Down);
		// Act
		this.oNumericContent.setIndicator(DeviationIndicator.Up);
		// Assert
		fnAssert("sap-icon://up", DeviationIndicator.Up);
		//Act
		this.oNumericContent.setIndicator(DeviationIndicator.None);
		// Assert
		fnAssert(null, DeviationIndicator.None);
	});

	QUnit.module("Rendering test - sap.m.NumericContent inside sap.m.Table");

	QUnit.test("Numeric content inside sap.m.Table", async function(assert) {
		var oModel = new JSONModel();
				oModel.setData({
					numbers: [
						{
						   number1: "12"
						},
						{
							number1: "14"
						}]
				});

				var oTable = new Table("idRandomDataTable", {
					headerToolbar: new Toolbar({
						content: [new Label({
							text: "Test"
						}), new ToolbarSpacer({}), new Button("idPersonalizationButton", {
							icon: "sap-icon://person-placeholder"
						})]
					}),

					columns: [new Column({
						width: "2em",
						header: new Label({
							text: "Number1"
						})

					})]

				});

				oTable.setModel(oModel);

				oTable.bindItems("/numbers", new ColumnListItem({

					cells: [new NumericContent({
						value: "{number1}"
					})]

				}));
		oTable.setWidth("320px");
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.equal(oTable.mAggregations.items[0].mAggregations.cells[0].$("value").hasClass("sapMNCValue"), true , "Success");
	});

	QUnit.module("Rendering test - sap.m.NumericContent inside sap.m.GenericTile");

	QUnit.test("Numeric Content inside sap.m.GenericTile rendered.", async function(assert) {
		// Arrange
		this.oNumericContent = fnCreateExampleNumericContent();
		this.oGenericTile = new GenericTile("generic-tile", {
			tileContent: [new TileContent({
				content: this.oNumericContent
			})]
		});
		this.oGenericTile.placeAt("qunit-fixture");
		await nextUIUpdate();

		// Act
		this.oNumericContent.setValue("12");
		await nextUIUpdate();

		// Assert
		assert.ok(document.getElementById("generic-tile"), "GenericTile (wrapper of NumericContent) was rendered successfully");
		fnAssertNumericContentHasRendered(assert);

		// Cleanup
		this.oGenericTile.destroy();
		this.oGenericTile = null;
		this.oNumericContent = null;
	});

	QUnit.test("Resize handler is registered in init phase.", async function(assert) {
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
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oSpyRegister.callCount, 2, "ResizeHandler.register was called.");
		this.oGenericTile.destroy();
		assert.strictEqual(oSpyDeregister.callCount, 3, "ResizeHandler.deregister was called.");

		// Cleanup
		this.oGenericTile = null;
		this.oNumericContent = null;
	});

	QUnit.module("Functional tests - sap.m.NumericContent", {
		beforeEach: async function() {
			this.oNumericContent = fnCreateExampleNumericContent();
			this.oNumericContent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});

	QUnit.test("Test formatter value processing", async function(assert) {
		this.oNumericContent.setFormatterValue(false);
		this.oNumericContent.setValue("68Mio.");
		await nextUIUpdate();

		assert.strictEqual(this.oNumericContent.getDomRef("value-inner").textContent, "68Mi", "Value was rendered successfully with formatter switched off");
		assert.strictEqual(this.oNumericContent.getDomRef("scale").textContent, "M", "Scale was rendered successfully with formatter switched off");
		this.oNumericContent.setFormatterValue(true);
		this.oNumericContent.setValue("68 Mio");
		await nextUIUpdate();

		assert.strictEqual(this.oNumericContent.getDomRef("value-inner").textContent, "68", "Value was rendered successfully with formatter switched on");
		assert.strictEqual(this.oNumericContent.getDomRef("scale").textContent, "Mio", "Scale was rendered successfully with formatter switched on");
		this.oNumericContent.setValue(undefined);
		await nextUIUpdate();
		assert.strictEqual(this.oNumericContent.getDomRef("value-inner").textContent, "0", "Value cleaned successfully with formatter switched on");
		assert.strictEqual(this.oNumericContent.getDomRef("scale"), null, "Scale cleaned successfully with formatter switched on");
	});

	QUnit.test("Test processing of formatter value with RTL and LTR mark", async function(assert) {
		this.oNumericContent.setFormatterValue(true);
		var sFormattedValue = String.fromCharCode(8206) + String.fromCharCode(8207) + "58,7 Mio";
		this.oNumericContent.setValue(sFormattedValue);
		await nextUIUpdate();

		assert.strictEqual(this.oNumericContent.getDomRef("value-inner").textContent, "58,7", "Value was rendered successfully with formatter switched on");
		assert.strictEqual(this.oNumericContent.getDomRef("scale").textContent, "Mio", "Scale was rendered successfully with formatter switched on");
	});

	QUnit.test("Test nullify parameter", async function(assert) {
		assert.strictEqual(this.oNumericContent.getDomRef("value-inner").textContent, "0", "Value was nullified successfully");
		this.oNumericContent.setNullifyValue(false);
		await nextUIUpdate();
		assert.strictEqual(this.oNumericContent.getDomRef("value-inner").textContent, "", "Value was not nullified");
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

	QUnit.test("Tests tooltip to check if it includes value color text", async function(assert) {
		//Arrange
		var sTooltip = this.oNumericContent.getTooltip_AsString();
		//Act
		var isValueColorPresent = sTooltip.indexOf(oResourceBundle.getText("SEMANTIC_COLOR_" + this.oNumericContent.getValueColor().toUpperCase())) > -1;
		//Assert
		assert.equal(isValueColorPresent, true, "The tooltip contains the value color text");

		//Arrange
		this.oNumericContent.setValueColor(ValueColor.None);
		//Act
		await nextUIUpdate();
		sTooltip = this.oNumericContent.getTooltip_AsString();
		isValueColorPresent = sTooltip.indexOf(ValueColor.None) > -1;

		//Assert
		assert.equal(this.oNumericContent.$("value").hasClass("Neutral"), true, "It contains the Neutral class for value color None");
		assert.equal(isValueColorPresent, false, "The tooltip does not contain the value color text");
	});

	QUnit.test("Test alternative text", function (assert) {
		//Act
		var sAltText = this.oNumericContent.getAltText();
		//Assert
		assert.strictEqual(sAltText, "0\nAscending\nGood", "Alternative text is correct");

		//Arrange
		this.oNumericContent.setIconDescription("Icon description");
		//Act
		sAltText = this.oNumericContent.getAltText();
		//Assert
		assert.strictEqual(sAltText, "Icon description\n0\nAscending\nGood", "Alternative text is correct with icon description");

		//Arrange
		this.oNumericContent.setNullifyValue(false);
		//Act
		sAltText = this.oNumericContent.getAltText();
		//Assert
		assert.strictEqual(sAltText, "Icon description\n\nAscending\nGood", "Alternative text is correct with nullify value set to false");

		//Arrange
		this.oNumericContent.setNullifyValue(true);
		//Act
		this.oNumericContent.setValue("10");
		this.oNumericContent.setScale("$");
		sAltText = this.oNumericContent.getAltText();
		//Assert
		assert.strictEqual(this.oNumericContent.getAltText(), "Icon description\n10$\nAscending\nGood", "Alternative text is correct with a value and scale set up");
	});

	QUnit.test("Test _getMaxDigitsData language", function (assert) {
		// Arrange 1
		var sOrigLang = Localization.getLanguage();
		var oExpected = {fontClass: "sapMNCLargeFontSize", maxLength: 4};
		Localization.setLanguage("en_US");

		// Act 1
		var oMaxDigitsData = this.oNumericContent._getMaxDigitsData();

		// Assert 1
		assert.deepEqual(oMaxDigitsData, oExpected, "Max digits data should be correct with normal language casing.");

		// Arrange 2
		Localization.setLanguage("EN_US");

		// Act 2
		oMaxDigitsData = this.oNumericContent._getMaxDigitsData();

		// Assert 2
		assert.deepEqual(oMaxDigitsData, oExpected, "Max digits data should be correct with uppercase language casing.");

		// Arrange 3
		Localization.setLanguage("en_us");

		// Act 3
		oMaxDigitsData = this.oNumericContent._getMaxDigitsData();

		// Assert 3
		assert.deepEqual(oMaxDigitsData, oExpected, "Max digits data should be correct with lowercase language casing.");

		// Arrange 4
		Localization.setLanguage("en-US-x-sappsd");

		// Act 4
		oMaxDigitsData = this.oNumericContent._getMaxDigitsData();

		// Assert 4
		assert.deepEqual(oMaxDigitsData, oExpected, "Max digits data should be correct for a language which is not defined in the language map.");

		// Arrange 5
		Localization.setLanguage("de");

		// Act 5
		oMaxDigitsData = this.oNumericContent._getMaxDigitsData();

		// Assert 5
		assert.deepEqual(oMaxDigitsData, {fontClass: "sapMNCSmallFontSize", maxLength: 8}, "Max digits data should be correct for de language.");

		// Restore
		Localization.setLanguage(sOrigLang);
	});

	QUnit.module("Property withoutMargin", {
		beforeEach: async function() {
			this.oNumericContent = new NumericContent({
				scale: "Mrd",
				indicator: DeviationIndicator.Up,
				value: "699"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});

	QUnit.test("Check default value", function (assert) {
		assert.ok(this.oNumericContent.getWithMargin(), "Default value shall be 'false'.");
	});

	QUnit.test("CSS Class needs to be added if withoutMargin is set to true", async function(assert) {
		assert.ok(!this.oNumericContent.$().hasClass("WithoutMargin"));
		this.oNumericContent.setWithMargin(false);
		await nextUIUpdate();
		assert.ok(this.oNumericContent.$().hasClass("WithoutMargin"), "'withoutMargin' CSS class expected.");
		assert.ok(jQuery(this.oNumericContent.$().children()[0]).hasClass("WithoutMargin"), "'withoutMargin' CSS class expected within the inner div container.");
		assert.ok(this.oNumericContent.$("value").hasClass("WithoutMargin"), "'withoutMargin' CSS class expected within the parent value container.");
		assert.strictEqual(this.oNumericContent.$("value").css("justify-content"), "center", "'center' CSS style expected within the parent value container.");
		assert.ok(this.oNumericContent.$().find(".sapMNCIndScale").hasClass("WithoutMargin"), "'withoutMargin' CSS class expected within the indicator and scale container.");
	});

	QUnit.module("Events test", {
		beforeEach: async function() {
			this.oNumericContent = fnCreateExampleNumericContent();
			this.oNumericContent.placeAt("qunit-fixture");
			await nextUIUpdate();
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
		assert.strictEqual(hasAttribute("tabindex", this.oNumericContent), false, "Attribute has not been added successfully since press handler was not available");
		assert.strictEqual(this.oNumericContent.$().hasClass("sapMPointer"), false, "Class has not been added successfully since press handler was not available");

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
		assert.strictEqual(hasAttribute("tabindex", this.oNumericContent), false, "Attribute not available since press was not defined");
		assert.strictEqual(this.oNumericContent.$().hasClass("sapMPointer"), false, "Class not available since press was not defined");

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
		assert.strictEqual(hasAttribute("tabindex", this.oNumericContent), false, "Attribute has been removed successfully");
		assert.strictEqual(this.oNumericContent.$().hasClass("sapMPointer"), false, "Class has been removed successfully");
	});
	QUnit.module("Negative values", {
		beforeEach: async function() {
			this.oNumericContent = new NumericContent("numeric-cnt", {
				indicator: DeviationIndicator.Up,
				value: "−859,65 t.",
				truncateValueTo: 7,
				formatterValue: true,
				animateTextChange: false,
				icon:  "sap-icon://line-charts"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});

	QUnit.test("Negative values in Finnish displayed Properly in formatter mode", function (assert){
		assert.strictEqual(this.oNumericContent.getDomRef("value-inner").textContent, "−859,65", "Value is correct");
		assert.strictEqual(this.oNumericContent.getDomRef("scale").textContent, "t", "Scale is correct");
	});

	QUnit.module("Adaptive font size", {
		beforeEach: async function() {
			this.oNumericContent = new NumericContent("numeric-cnt", {
				indicator: DeviationIndicator.Up,
				value: "12345678",
				animateTextChange: false,
				icon:  "sap-icon://line-charts"
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		},
		fnAssertFontSizeClassesForLanguage: function (assert, sExpectedFontSizeClass, sCurrentLanguageCode, sWhenCondition, sWhenValue, bNegativeAssert) {
			sWhenCondition = sWhenCondition || "When the language is set to";
			sWhenValue = sWhenValue || sCurrentLanguageCode;
			var sWhenMessagePart = sWhenCondition + " '" + sWhenValue + "' ",
				sOptionalNot = bNegativeAssert ? "NOT" : "",
				fnAssert = bNegativeAssert ? assert.notOk.bind(assert) : assert.ok.bind(assert);

			fnAssert(
				this.oNumericContent.$("icon-image").hasClass(sExpectedFontSizeClass),
				sWhenMessagePart + "the icon image should " + sOptionalNot + " have class " + sExpectedFontSizeClass + "."
			);
			fnAssert(
				this.oNumericContent.$("value-inner").hasClass(sExpectedFontSizeClass),
				sWhenMessagePart + "the inner value should " + sOptionalNot + " have class " + sExpectedFontSizeClass + "."
			);
			fnAssert(
				this.oNumericContent.$("indicator").hasClass(sExpectedFontSizeClass),
				sWhenMessagePart + "the indicator should " + sOptionalNot + " have class " + sExpectedFontSizeClass + "."
			);
		}
	});

	QUnit.test("Test the adaptive font size change based on language - small", async function(assert) {
		// Arrange
		var sDefaultLanguage = Localization.getLanguage(),
			sNewLanguage = "de";
		Localization.setLanguage(sNewLanguage);
		this.oNumericContent.invalidate();
		await nextUIUpdate();
		// Assert
		this.fnAssertFontSizeClassesForLanguage(assert, "sapMNCSmallFontSize", sNewLanguage);
		// Arrange
		sNewLanguage = "de-de";
		Localization.setLanguage(sNewLanguage);
		this.oNumericContent.invalidate();
		await nextUIUpdate();
		// Assert
		this.fnAssertFontSizeClassesForLanguage(assert, "sapMNCSmallFontSize", sNewLanguage);
		// Arrange
		this.oNumericContent.setAdaptiveFontSize(false);
		this.oNumericContent.invalidate();
		await nextUIUpdate();
		// Assert
		this.fnAssertFontSizeClassesForLanguage(assert, "sapMNCLargeFontSize", sNewLanguage);
		Localization.setLanguage(sDefaultLanguage);
	});

	QUnit.test("Test the adaptive font size change based on language - medium", async function(assert) {
		// Arrange
		var sDefaultLanguage = Localization.getLanguage(),
			sNewLanguage = "es";
		Localization.setLanguage(sNewLanguage);
		this.oNumericContent.invalidate();
		await nextUIUpdate();
		// Assert
		this.fnAssertFontSizeClassesForLanguage(assert, "sapMNCMediumFontSize", sNewLanguage);
		// Arrange
		this.oNumericContent.setAdaptiveFontSize(false);
		this.oNumericContent.invalidate();
		await nextUIUpdate();
		// Assert
		this.fnAssertFontSizeClassesForLanguage(assert, "sapMNCLargeFontSize", sNewLanguage);
		this.oNumericContent.setAdaptiveFontSize(true);
		Localization.setLanguage(sDefaultLanguage);
	});

	QUnit.test("Test the adaptive font size change based on language - large", async function(assert) {
		// Arrange
		var sDefaultLanguage = Localization.getLanguage(),
			sNewLanguage = "bg";
		Localization.setLanguage(sNewLanguage);
		this.oNumericContent.invalidate();
		await nextUIUpdate();
		// Assert
		this.fnAssertFontSizeClassesForLanguage(assert, "sapMNCLargeFontSize", sNewLanguage);
		// Arrange
		this.oNumericContent.setAdaptiveFontSize(false);
		this.oNumericContent.invalidate();
		await nextUIUpdate();
		// Assert
		this.fnAssertFontSizeClassesForLanguage(assert, "sapMNCLargeFontSize", sNewLanguage);
		this.oNumericContent.setAdaptiveFontSize(true);
		Localization.setLanguage(sDefaultLanguage);
	});

	QUnit.test("Test the adaptive font size change based on language - adaptiveFontSize: false", function (assert) {
		// Arrange
		this.oNumericContent.setAdaptiveFontSize(false);

		// Assert
		this.fnAssertFontSizeClassesForLanguage(assert, "sapMNCLargeFontSize", null, "When adaptiveFontSize is set to", "false");
		this.fnAssertFontSizeClassesForLanguage(assert, "sapMNCSmallFontSize", null, "When adaptiveFontSize is set to", "false", true);
		this.fnAssertFontSizeClassesForLanguage(assert, "sapMNCMediumFontSize", null, "When adaptiveFontSize is set to", "false", true);

		this.oNumericContent.setAdaptiveFontSize(true);
	});

	QUnit.module("Truncate value to", {
		beforeEach: async function() {
			this.oNumericContent = new NumericContent("numeric-cnt", {
				value: "12345678123456781234567812345678",
				animateTextChange: false
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oNumericContent.destroy();
			this.oNumericContent = null;
		}
	});

	QUnit.test("Test custom truncateValueTo property", async function(assert) {
		// Arrange
		this.oNumericContent.setTruncateValueTo(1);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 1, "Value is truncated to 1 char");

		// Arrange
		this.oNumericContent.setTruncateValueTo(20);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 20, "Value is truncated to 20 chars");
	});

	QUnit.test("Test default value when adaptiveFontSize=false", async function(assert) {
		// Arrange
		this.oNumericContent.setAdaptiveFontSize(false);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 4, "Value is truncated to 4 chars");
	});

	QUnit.test("Test default value for specific language", async function(assert) {
		// Arrange
		var sDefaultLanguage = Localization.getLanguage();
		Localization.setLanguage("de");
		this.oNumericContent.invalidate();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 8, "Value is truncated to 8 chars for 'de'");

		// Arrange
		Localization.setLanguage("es");
		this.oNumericContent.invalidate();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 6, "Value is truncated to 6 chars for 'es'");

		// Arrange
		Localization.setLanguage("en");
		this.oNumericContent.invalidate();
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oNumericContent.$("value-inner").html().length, 4, "Value is truncated to 4 chars for 'en'");

		// return the language
		Localization.setLanguage(sDefaultLanguage);
	});

	/* --- Helpers --- */

	function fnAssertNumericContentHasRendered (assert) {
		assert.ok(document.getElementById("numeric-cnt"), "NumericContent was rendered successfully");
		assert.ok(document.getElementById("numeric-cnt-icon-image"), "Icon was rendered successfully");
		assert.ok(document.getElementById("numeric-cnt-value"), "Value was rendered successfully");
		assert.ok(document.getElementById("numeric-cnt-value-inner"), "Inner value was rendered successfully");
		assert.ok(document.getElementById("numeric-cnt-indicator"), "Indicator was rendered successfully");
		assert.ok(document.getElementById("numeric-cnt-icon-indicator"), "Icon indicator was rendered successfully");
		assert.ok(document.getElementById("numeric-cnt-scale"), "Scale was rendered successfully");
	}

	function fnCreateExampleNumericContent () {
		return new NumericContent("numeric-cnt", {
			size: Size.L, // deprecated since 1.38
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
		return typeof sAttributeValue !== "undefined" && sAttributeValue !== false;
	}
});