/*global QUnit, sinon */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Lib",
	"sap/ui/unified/ColorPicker",
	"sap/ui/unified/ColorPickerDisplayMode",
	"sap/ui/unified/library",
	"sap/m/InputBase",
	"sap/m/Label",
	"sap/m/RadioButtonGroup",
	"sap/m/RadioButton",
	"sap/m/Slider",
	"sap/ui/core/InvisibleText",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/Device",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/ColorPickerHelper"
], function(
	Localization,
	Library,
	ColorPicker,
	ColorPickerDisplayMode,
	library,
	InputBase,
	Label,
	RadioButtonGroup,
	RadioButton,
	Slider,
	InvisibleText,
	qutils,
	Device,
	KeyCodes,
	jQuery,
	nextUIUpdate,
	ColorPickerHelper
) {
	"use strict";

		var ColorPickerMode = library.ColorPickerMode;
		var CONSTANTS = new ColorPicker()._getConstants(); // Get control constants

		QUnit.module("sap.ui.unified.ColorPickerHelper");

		QUnit.test("Responsive mode", function (oAssert) {
			var oColorPickerHelper = ColorPickerHelper.getHelper();
			// Arrange
			var oRBGroup,
				oInput,
				oSlider;

			// Assert - Properties
			oAssert.strictEqual(oColorPickerHelper.isResponsive(), true, "Helper should be in responsive mode");

			// Assert - Factory
			oAssert.ok(oColorPickerHelper.factory.createLabel() instanceof Label,
				"Factory label control should be instance of sap.m.Label");

			oInput = oColorPickerHelper.factory.createInput("MYCUSTOMINPUTID");
			oAssert.ok(oInput instanceof InputBase,
				"Factory input control should be instance of sap.m.InputBase");
			oAssert.strictEqual(oInput.getId(), "MYCUSTOMINPUTID",
				"Factory input control should have 'MYCUSTOMINPUTID' assigned as ID");

			// RadioButton group and RadioButtonItem
			oRBGroup = oColorPickerHelper.factory.createRadioButtonGroup({
				buttons: oColorPickerHelper.factory.createRadioButtonItem()
			});
			oAssert.ok(oRBGroup instanceof RadioButtonGroup,
				"Factory RadioButtonGroup control should be instance of sap.m.RadioButtonGroup");
			oAssert.ok(oRBGroup.getButtons()[0] instanceof RadioButton,
				"Factory RadioButtonGroup items aggregation should be propagated to buttons " +
				"aggregation and returned item from createRadioButtonItem should be instance of " +
				"sap.m.RadioButton");

			// Slider
			oSlider = oColorPickerHelper.factory.createSlider("MYCUSTOMSLIDERID", {step: 0.1});
			oAssert.ok(oSlider instanceof Slider, "Factory Slider control should be instance of sap.m.Slider");
			oAssert.strictEqual(oSlider.getId(), "MYCUSTOMSLIDERID",
				"Factory Slider control should have 'MYCUSTOMSLIDERID' assigned as ID");
		});

		QUnit.module("API", {
			beforeEach: function () {
				this.oCP = new ColorPicker();
			},
			afterEach: function () {
				this.oCP.destroy();
				this.oCP = null;
			}
		});

		QUnit.test("mode property", function (oAssert) {
			// Assert
			oAssert.strictEqual(this.oCP.getMode(), ColorPickerMode.HSV,
				"By default the control should be in HSV mode");

			// Act - change mode to HSL
			this.oCP.setMode(ColorPickerMode.HSL);

			// Assert
			oAssert.strictEqual(this.oCP.getMode(), ColorPickerMode.HSL,
				"Control mode property should be set to HSL");
		});

		QUnit.test("colorString property with 'transparent' string case handling", async function (oAssert) {
			// Arrange
			this.oCP.placeAt("qunit-fixture");

			// Act
			this.oCP.setColorString("transparent");
			await nextUIUpdate();

			// Assert
			oAssert.strictEqual(this.oCP.oAlphaSlider.getValue(), 0,
				"The alpha slider value should be 0 - transparent");
			oAssert.strictEqual(this.oCP.oAlphaField.getValue(), "0",
				"The alpha field value should be '0' - transparent");
			oAssert.strictEqual(this.oCP.oAlphaField2.getValue(), "0",
			"The second alpha field value should be '0' - transparent");
			oAssert.strictEqual(this.oCP.oHexField.getValue(), "000000",
				"The hex field value should be '000000'");
		});

		QUnit.module("Internals", {
			beforeEach: function () {
				this.oCP = new ColorPicker("cp");
			},
			afterEach: function () {
				this.oCP.destroy();
				this.oCP = null;
			}
		});

		QUnit.test("_bHSLMode size property", function (oAssert) {
			// Assert
			oAssert.strictEqual(this.oCP._bHSLMode, false, "Internal _bHSLMode property should be set to false");

			// Act - change mode to HSL
			this.oCP.setMode(ColorPickerMode.HSL);

			// Assert
			oAssert.strictEqual(this.oCP._bHSLMode, true, "Internal _bHSLMode property should be set to true");
		});

		QUnit.test("_iCPCursorSize size property", function (oAssert) {
			// Assert
			oAssert.ok(this.oCP._iCPCursorSize, "Internal _iCPCursorSize property should be set");
		});

		QUnit.test("RTL flag", function (oAssert) {
			// Arrange
			var bFrameworkRtlMode = Localization.getRTL();

			// Assert
			oAssert.strictEqual(this.oCP.bRtl, bFrameworkRtlMode,
				"Boolean flag should be set to '" + bFrameworkRtlMode + "'");
		});

		QUnit.test("_processChanges method replaced with a valid method", function (oAssert) {
			// Assert
			oAssert.strictEqual(this.oCP._processChanges, this.oCP._processHSVChanges,
				"By default method should be a reference to _processHSVChanges");

			// Act - change control mode
			this.oCP.setMode(ColorPickerMode.HSL);

			// Assert
			oAssert.strictEqual(this.oCP._processChanges, this.oCP._processHSLChanges,
				"When control is in HSL mode the method should be a reference to _processHSLChanges");
		});

		QUnit.test("_handleAlphaSliderChange - Color conversion related to output mode", async function (oAssert) {
			// Arrange
			var oPHSLCSpy = sinon.spy(this.oCP, "_processHSLChanges"),
				oPRGBCSpy = sinon.spy(this.oCP, "_processRGBChanges");

			this.oCP.setColorString("427cac");
			this.oCP.setMode(ColorPickerMode.HSL);
			this.oCP.Color.formatHSL = false; // Mock RGB output mode
			this.oCP.placeAt("qunit-fixture");
			await nextUIUpdate();

			// Act - change slider value and fire the event handler.
			// Keep in mind that we are calling the event handler manually because setters should not call events.
			this.oCP.oAlphaSlider.setValue(0.5);
			this.oCP._handleAlphaSliderChange();

			// Assert
			oAssert.strictEqual(this.oCP.oHexField.getValue(), "427cac",
				"The hex value won't change when changing the Alpha slider in RGB output mode");
			oAssert.strictEqual(oPHSLCSpy.callCount, 0, "_processHSLChanges should not be called");
			oAssert.strictEqual(oPRGBCSpy.callCount, 0, "_processRGBChanges should not be called");

			// Arrange
			oPRGBCSpy.resetHistory();
			this.oCP.Color.formatHSL = true; // Mock HSL output mode

			// Act - change slider value and fire the event handler.
			this.oCP.oAlphaSlider.setValue(0.2);
			this.oCP._handleAlphaSliderChange();

			// Assert
			oAssert.strictEqual(this.oCP.oHexField.getValue(), "427cac",
				"The hex value will not change when changing the Alpha slider in HSL output mode");
			oAssert.strictEqual(this.oCP.oAlphaField.getValue(), "0.2",
			"The alpha value will change when changing the Alpha slider in HSL output mode");
			oAssert.strictEqual(this.oCP.oAlphaField2.getValue(), "0.2",
			"The second alpha value will change when changing the Alpha slider in HSL output mode");

			oAssert.strictEqual(oPHSLCSpy.callCount, 0, "_processHSLChanges should not be called");
			oAssert.strictEqual(oPRGBCSpy.callCount, 0, "_processRGBChanges should not be called");
		});

		QUnit.test("Alpha fields and alpha slider are in sync", async function (oAssert) {
			// Arrange
			this.oCP.setColorString("427cac");
			this.oCP.setMode(ColorPickerMode.HSL);
			this.oCP.placeAt("qunit-fixture");
			await nextUIUpdate();

			// Act - simulate typing in the first alpha value field.
			this.oCP.oAlphaField.focus();
			jQuery("#cp-aF").find("input").val("0.5");
			qutils.triggerKeydown("cp-aF-inner", KeyCodes.ENTER, false, false, false);
			jQuery("#cp-aF").find("input").trigger("change");

			// Assert
			oAssert.strictEqual(this.oCP.oAlphaField2.getValue(), "0.5",
			"The second alpha value will change when we type in the first alpha field");
			oAssert.strictEqual(this.oCP.oAlphaSlider.getValue(), 0.5,
			"The alpha slider value will change when we type in the first alpha field");

			// Act - simulate typing in the second alpha value field.
			this.oCP.oAlphaField.focus();
			jQuery("#cp-aF2").find("input").val("0.3");
			qutils.triggerKeydown("cp-aF2-inner", KeyCodes.ENTER, false, false, false);
			jQuery("#cp-aF2").find("input").trigger("change");

			// Assert
			oAssert.strictEqual(this.oCP.oAlphaField.getValue(), "0.3",
			"The first alpha value will change when typing in the second alpha field");
			oAssert.strictEqual(this.oCP.oAlphaSlider.getValue(), 0.3,
			"The alpha slider value will change when we type in the second alpha field");

		});

		QUnit.module("Accessibility", {
			beforeEach: async function () {
				this.oCP = new ColorPicker().placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oCP.destroy();
				this.oCP = null;
			}
		});

		QUnit.test("Root ARIA attributes", function (oAssert) {
			var $colorPickerRef = this.oCP.$(),
				sExpectedRoledescription = Library.getResourceBundleFor("sap.ui.unified").getText("COLOR_PICKER_TITLE");

			oAssert.strictEqual($colorPickerRef.attr("role"), "group", "Color Picker has a 'group' role");
			oAssert.strictEqual($colorPickerRef.attr("aria-roledescription"), sExpectedRoledescription, "roledescription contains control's name");
		});

		QUnit.test("Sliders invisible texts", function (oAssert) {
			// Arrange
			var aInvisibleTexts,
				oInvisibleHueText,
				oInvisibleAlphaText;

			aInvisibleTexts = this.oCP.getAggregation("_invisibleTexts");
			oInvisibleHueText = aInvisibleTexts[0];
			oInvisibleAlphaText = aInvisibleTexts[1];

			// Assert
			oAssert.strictEqual(aInvisibleTexts.length, 2, "We have 2 invisible texts in the aggregation");

			// Assert - HUE Slider
			oAssert.strictEqual(this.oCP.oSlider.getAriaLabelledBy()[0], oInvisibleHueText.getId(),
				"Invisible text is added as association to HUE slider");
			oAssert.strictEqual(oInvisibleHueText.$().length, 1,
				"Invisible text for Hue slider is rendered in the DOM");

			// Assert - Alpha Slider
			oAssert.strictEqual(this.oCP.oAlphaSlider.getAriaLabelledBy()[0], oInvisibleAlphaText.getId(),
				"Invisible text is added as association to Alpha slider");
			oAssert.strictEqual(oInvisibleAlphaText.$().length, 1,
				"Invisible text for Alpha slider is rendered in the DOM");

			// Assert Output RadioButton group
			oAssert.ok(this.oCP.$().find('[labelFor="' + this.oCP.oRGBorHSLRBGroup.getId() + '"]'),
				"There is a label with labelFor set for the output RadioButton group");

		});

		QUnit.test("Inputs invisible texts", function (oAssert) {
			// Assert
			oAssert.strictEqual(this.oCP.oHexField.getAriaLabelledBy()[0], InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_HEX"),
				"Hex input is properly labelled by an invisible text.");

			oAssert.strictEqual(this.oCP.oRedField.getAriaLabelledBy()[0], InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_RED"),
				"Red input is properly labelled by an invisible text.");

			oAssert.strictEqual(this.oCP.oGreenField.getAriaLabelledBy()[0], InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_GREEN"),
				"Green input is properly labelled by an invisible text.");

			oAssert.strictEqual(this.oCP.oBlueField.getAriaLabelledBy()[0], InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_BLUE"),
				"Blue input is properly labelled by an invisible text.");

			oAssert.strictEqual(this.oCP.oHueField.getAriaLabelledBy()[0], InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_HUE"),
				"Hue input is properly labelled by an invisible text.");

			oAssert.strictEqual(this.oCP.oSatField.getAriaLabelledBy()[0], InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_SAT") +
				" " + InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_PERCENTAGE"),
				"Saturation input is properly labelled by an invisible text, including percentage indication.");

			oAssert.strictEqual(this.oCP.oLitField.getAriaLabelledBy()[0], InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_LIGHTNESS") +
				" " + InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_PERCENTAGE"),
				"Lightness input is properly labelled by an invisible text, including percentage indication.");

			oAssert.strictEqual(this.oCP.oAlphaField.getAriaLabelledBy()[0], InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_ALPHA"),
				"Alpha input is properly labelled by an invisible text.");

			oAssert.strictEqual(this.oCP.oAlphaField2.getAriaLabelledBy()[0], InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_ALPHA"),
			"Second Alpha input is properly labelled by an invisible text.");

			oAssert.strictEqual(this.oCP.oValField.getAriaLabelledBy()[0], InvisibleText.getStaticId("sap.ui.unified", "COLORPICKER_VALUE"),
				"Value input is properly labelled by an invisible text.");
		});

		QUnit.test("Radio buttons tooltips", function (oAssert) {
			var oRB = Library.getResourceBundleFor("sap.ui.unified");

			// Assert
			oAssert.strictEqual(this.oCP.oRbRGB.getTooltip(), oRB.getText("COLORPICKER_SELECT_RGB_TOOLTIP"),
				"The radio button for RGB color mode has correct tooltip text.");

			oAssert.strictEqual(this.oCP.oRbHSLV.getTooltip(), oRB.getText("COLORPICKER_SELECT_HSL_TOOLTIP"),
				"The radio button for HSL color mode has correct tooltip text.");
		});

		QUnit.test("Current and New color box tooltips", function (oAssert) {
			var oRB = Library.getResourceBundleFor("sap.ui.unified");

			// Assert
			oAssert.strictEqual(document.getElementsByClassName("sapUiColorPicker-ColorPickerOldColor")[0].title, oRB.getText("COLOR_PICKER_CURRENT_COLOR_TOOLTIP"),
				"The Current color box has correct tooltip text.");

			oAssert.strictEqual(document.getElementsByClassName("sapUiColorPicker-ColorPickerNewColor")[0].title, oRB.getText("COLOR_PICKER_NEW_COLOR_TOOLTIP"),
				"The New color box has correct tooltip text.");
		});

		QUnit.module("Private methods", {
			beforeEach: function () {
				this.oCP = new ColorPicker();
			},
			afterEach: function () {
				this.oCP.destroy();
				this.oCP = null;
			}
		});

		QUnit.test("_updateColorStringProperty", function (oAssert) {
			// Assert
			oAssert.strictEqual(this.oCP.getColorString(), "",
				"Before the method is called by default no color string is available");

			// Arrange - attach events with always failing asserts
			this.oCP.attachChange(function () {
				oAssert.ok(false, "Change event should not be called with no parameters passed to method");
			});
			this.oCP.attachLiveChange(function () {
				oAssert.ok(false, "Live change event should not be called with no parameters passed to method");
			});

			// Act - call method with no parametes
			this.oCP._updateColorStringProperty();

			// Assert
			oAssert.strictEqual(this.oCP.getColorString(), "rgb(255,255,255)",
				"After update the value of the ColorString property should be equal to RGB white color");
		});

		QUnit.test("_updateColorStringProperty - firing events", function (oAssert) {
			// Arrange
			var fnDone = oAssert.async();

			this.oCP.attachLiveChange(function () {
				oAssert.ok(true, "Live change event is fired and its fired before change event");
			});
			this.oCP.attachChange(function () {
				oAssert.ok(true, "Change event is fired");
				fnDone(); // Live change should be fired first if not the test will fail - 2 assertions expected!
			});

			// Act - call method with true for firing both events
			this.oCP._updateColorStringProperty(true, true);
		});

		QUnit.test("change event", async function(assert) {
			// arrange
			var oCP = new ColorPicker();
			var oFireChangeSpy = this.spy(oCP, "fireChange");

			// act
			oCP.placeAt("qunit-fixture");
			await nextUIUpdate();

			// assert
			assert.strictEqual(oFireChangeSpy.callCount, 0, "no events are fired on rendering");

			// act
			oCP.setColorString("red");
			await nextUIUpdate();

			assert.strictEqual(oFireChangeSpy.callCount, 0, "no events are fired on rendering");

			// clean
			oCP.destroy();
		});

		QUnit.test("_updateControlVisualState - mock commons control mode", function (oAssert) {
			// Arrange
			this.oCP.bResponsive = false; // Mock commons mode

			this.oCP._createLayout(); // Force creation of inner controls
			var oGrid = this.oCP.getAggregation("_grid");

			// Act
			this.oCP._updateControlVisualState();

			// Assert
			oAssert.strictEqual(this.oCP.swatches.getSpanS(), 3, 'Property "spanS" should be set to 3');
			oAssert.notOk(this.oCP.swatches.getLinebreak(), 'Property "linebreak" should be false');
			oAssert.notOk(oGrid.hasStyleClass(CONSTANTS.HSLClass),
				'The grid should not have class "' + CONSTANTS.HSLClass + '"');

			// Act - switch to HSL mode
			this.oCP.setMode(ColorPickerMode.HSL);
			this.oCP._updateControlVisualState();

			// Assert
			oAssert.strictEqual(this.oCP.swatches.getSpanS(), 4, 'Property "spanS" should be set to 4');
			oAssert.ok(this.oCP.swatches.getLinebreak(), 'Property "linebreak" should be true');
			oAssert.ok(oGrid.hasStyleClass(CONSTANTS.HSLClass),
				'The grid should have class "' + CONSTANTS.HSLClass + '"');

			// Restore mocked mode
			this.oCP.bResponsive = true;
		});

		QUnit.test("_createRowFromInput", function (oAssert) {
			// Arrange
			var oInput = new InputBase(),
				sTooltipID = "COLORPICKER_HEX",
				sTooltipResult = Library.getResourceBundleFor("sap.ui.unified").getText(sTooltipID),
				oLabel,
				oUnitLabel,
				oHL;

			// Act
			oHL = this.oCP._createRowFromInput(oInput, sTooltipID, "Static label", "Unit label");

			// Assert
			oAssert.ok(oHL instanceof sap.ui.layout.HorizontalLayout,
				"The returned control should be instance of sap.ui.layout.HorizontalLayout");

			oAssert.strictEqual(oInput.getTooltip(), sTooltipResult,
				"Tooltip applied to the input control should match the returned from the resource bundle");

			// Arrange - Label
			oLabel = oHL.getContent()[0];

			// Assert
			oAssert.strictEqual(oLabel.getText(), "Static label", "Label text should match the argument passed");
			oAssert.strictEqual(oLabel.getTooltip(), sTooltipResult,
				"Tooltip applied to the label control should match the returned from the resource bundle");
			oAssert.ok(oLabel.hasStyleClass(CONSTANTS.LabelClass),
				'Label class "' + CONSTANTS.LabelClass + '" should be applied to the label');
			oAssert.strictEqual(oLabel.getLabelFor(), oInput.getId(), "Label for must point to the input ID");

			// Arrange - Unit Label
			oUnitLabel = oHL.getContent()[2];

			// Assert
			oAssert.strictEqual(oUnitLabel.getText(), "Unit label", "Unit label text should match the argument passed");
			oAssert.ok(oUnitLabel.hasStyleClass(CONSTANTS.LabelClass),
				'Class "' + CONSTANTS.LabelClass + '" should be applied to the unit label');
			oAssert.ok(oUnitLabel.hasStyleClass(CONSTANTS.UnitLabelClass),
				'Class "' + CONSTANTS.UnitLabelClass + '" should be applied to the unit	 label');
			oAssert.strictEqual(oUnitLabel.getLabelFor(), oInput.getId(), "Unit label for must point to the input ID");

			// Act - using only 2 arguments
			oHL = this.oCP._createRowFromInput(oInput, sTooltipID, "Static label");

			// Assert
			oAssert.strictEqual(oHL.getContent().length, 2,
				"When using the method with only 2 arguments the returned HorizontalLayout should contain " +
				"only 2 items in it's 'content' aggregation");
		});

		QUnit.test("_createLayout lifecycle", async function (oAssert) {
			// Arrange
			var oSpy = sinon.spy(this.oCP, "_createLayout");

			// Act
			this.oCP.placeAt("qunit-fixture");
			await nextUIUpdate();

			// Assert
			oAssert.strictEqual(oSpy.callCount, 1, "Internal controls should be created only once");
			oAssert.strictEqual(this.oCP._bLayoutControlsCreated, true,
				"Flag for internal control creation is set to true");

			// Cleanup
			oSpy.restore();
		});

		QUnit.test("exit - cleanup", async function (oAssert) {
			// Arrange
			this.oCP.placeAt("qunit-fixture");
			await nextUIUpdate();

			// Act
			this.oCP.destroy();

			// Assert - internally created controls which have a pointer on the control context should be destroyed
			['oCPBox',
			'oAlphaField',
			'oAlphaField2',
			'oAlphaSlider',
			'oBlueField',
			'oGreenField',
			'oHexField',
			'oHueField',
			'oLitField',
			'oRGBorHSLRBGroup',
			'oRedField',
			'oSatField',
			'oSlider',
			'oValField'].forEach(function (sControlName) {
				oAssert.ok(this.oCP[sControlName].bIsDestroyed,
					"Internally created control ColorPicker." + sControlName + " should be destroyed");
			}.bind(this));
		});

		QUnit.test("getRGB method", async function (oAssert) {
			// Arrange
			this.oCP.placeAt("qunit-fixture");

			// Assert
			oAssert.deepEqual(this.oCP.getRGB(), {r: 255, g: 255, b: 255},
				"The returned object should contain the default white color values for RGB");

			// Act
			this.oCP.setColorString("rgb(255,0,0)");
			await nextUIUpdate();

			// Assert
			oAssert.deepEqual(this.oCP.getRGB(), {r: 255, g: 0, b: 0},
				"The returned object should contain the color values for RED color");
		});

		QUnit.test("_parseRGB method validation only", function (oAssert) {
			// Assert
			oAssert.strictEqual(this.oCP._parseRGB("rgb(255, 255, 255)", true), true,
				"The parsed string is a valid RGB CSS Color");

			oAssert.strictEqual(this.oCP._parseRGB("rgba(255, 255, 255, 0.5)", true), true,
				"The parsed string is a valid RGBA CSS Color string");

			oAssert.strictEqual(this.oCP._parseRGB("hsl(10, 10, 10)", true), false,
				"The parsed string is not a valid RGB|A CSS Color string");

			oAssert.strictEqual(this.oCP._parseRGB("rgb(255, 255, 255, 0)", true), false,
				"The passed string is not a valid RGB CSS Color string");

			oAssert.strictEqual(this.oCP._parseRGB("rgba(255, 255, 255)", true), false,
				"The passed string is not a valid RGBA CSS Color string");

			oAssert.strictEqual(this.oCP._parseRGB("rgb(-255, -255, -255)", true), false,
				"The passed string is not a valid RGB CSS Color string");
		});

		QUnit.test("_parseHSL method validation only", function (oAssert) {
			// Assert
			oAssert.strictEqual(this.oCP._parseHSL("hsl(360, 100, 100)", true), true,
				"The parsed string is a valid HSL CSS Color");

			oAssert.strictEqual(this.oCP._parseHSL("hsla(360, 100, 100, 0.5)", true), true,
				"The parsed string is a valid HSLA CSS Color string");

			oAssert.strictEqual(this.oCP._parseHSL("rgb(10, 10, 10)", true), false,
				"The parsed string is not a valid HSL|A CSS Color string");

			oAssert.strictEqual(this.oCP._parseHSL("hsl(360, 100, 100, 0)", true), false,
				"The passed string is not a valid HSL CSS Color string");

			oAssert.strictEqual(this.oCP._parseHSL("hsla(360, 100, 100)", true), false,
				"The passed string is not a valid HSLA CSS Color string");

			oAssert.strictEqual(this.oCP._parseHSL("hsl(-360, -255, -255)", true), false,
				"The passed string is not a valid HSL CSS Color string");
		});

		QUnit.test("_processRGBChanges - does not reset the HUE slide if pure white color is used", async function (oAssert) {
			// Arrange
			var iHueValue = 30, // Arbitrary number different than 0
				oCalculateHSVSpy,
				oHueFieldSetterSpy;

			this.oCP.setColorString("white");
			this.oCP.placeAt("qunit-fixture");

			await nextUIUpdate();

			oCalculateHSVSpy = sinon.spy(this.oCP, "_calculateHSV");
			oHueFieldSetterSpy = sinon.spy(this.oCP.oHueField, "setValue");

			// Act
			this.oCP.Color.h = iHueValue;
			this.oCP._processRGBChanges();

			// Assert
			oAssert.strictEqual(this.oCP.Color.h, iHueValue,
				"Internal HUE value should not be reset nor changed");
			oAssert.strictEqual(oCalculateHSVSpy.callCount, 0, "_calculateHSV should not be called");
			oAssert.strictEqual(oHueFieldSetterSpy.callCount, 0, "HUE field 'setValue' should not be called");
		});

		QUnit.test("_toggleFields", async function (oAssert) {
			var oDevicePhoneStub = this.stub(Device.system, "phone").value(true);

			this.oCP.placeAt("qunit-fixture");
			await nextUIUpdate();

			// Assert
			oAssert.ok(document.getElementsByClassName("sapUiCPHexVisible").length, "Hex field is visible by default on phone");

			// Act
			this.oCP._toggleFields();

			// Assert
			oAssert.ok(document.getElementsByClassName("sapUiCPHideHex").length, "Hex field is hidden");
			oAssert.notOk(document.getElementsByClassName("sapUiCPDisplayRGB").length, "HSL field is visible");

			// Act
			this.oCP._toggleFields();

			// Assert
			oAssert.ok(document.getElementsByClassName("sapUiCPHideHex").length, "Hex field is hidden");
			oAssert.ok(document.getElementsByClassName("sapUiCPDisplayRGB").length, "RGB field is visible");

			oDevicePhoneStub.restore();
		});

		QUnit.module("sap.ui.unified._ColorPickerBox", {
			beforeEach: async function () {
				this.oCP = new ColorPicker();
				this.oCP.placeAt("qunit-fixture");
				await nextUIUpdate();
				this.oCPBox = this.oCP.oCPBox;
			},
			afterEach: function () {
				this.oCP.destroy();
				this.oCP = null;
				this.oCPBox.destroy();
				this.oCPBox = null;
			}
		});

		QUnit.test("rendering", function (oAssert) {
			// Assert
			oAssert.ok(this.oCPBox.getDomRef(), "Control is rendered");
		});

		QUnit.test("Methods and internals", function (oAssert) {
			// Arrange
			var iWidth,
				oOffset,
				oHandle;

			// Assert - getWidth
			iWidth = this.oCPBox.getWidth();
			oAssert.ok(typeof iWidth === "number", "Returned value is integer");
			oAssert.ok(iWidth > 0, "Returned value is greater than zero");

			// Assert - getOffset
			oOffset = this.oCPBox.getOffset();
			oAssert.strictEqual(typeof oOffset.left, "number", "Object.left has left key and it's value is a number");

			// Assert - getHandle
			oHandle = this.oCPBox.getHandle();
			oAssert.strictEqual(oHandle.length, 1, "There is one jQuery dom handle returned");
		});

		QUnit.test("Internal RTL flag", function (oAssert) {
			// Arrange
			var bFrameworkRtlMode = Localization.getRTL();

			// Assert
			oAssert.strictEqual(this.oCPBox.bRtl, bFrameworkRtlMode,
				"Boolean flag should be set to '" + bFrameworkRtlMode + "'");
		});

		QUnit.test("select event", function (oAssert) {
			// Mock getWidth method to return a fixed number
			this.oCPBox.getWidth = function () {return 100;};
			this.oCPBox.attachSelect(function (oEvent) {
				// Assert
				oAssert.ok(true, "Select event is fired");
				oAssert.ok(typeof oEvent.getParameter("value") === "number",
					"The returned event has a parameter 'value' and it's a number");

				oAssert.ok(typeof oEvent.getParameter("saturation") === "number",
					"The returned event has a parameter 'saturation' and it's a number");
			});

			// Act
			this.oCPBox.ontouchmove({offsetX: 10, offsetY: 10});
		});

		QUnit.test("resize event", function (oAssert) {
			// Arrange
			var fnDone = oAssert.async();
			this.oCPBox.attachResize(function (oEvent) {
				// Assert
				oAssert.ok(true, "Resize event is fired");
				oAssert.ok(typeof oEvent.getParameter("size") === "number",
					"The returned event has a parameter 'size' and it's a number");
				fnDone();
			});

			// Act - change width so event will be fired
			this.oCPBox.$().width("500px");
		});

		QUnit.test("ontouchstart and ontouchend events", function (oAssert) {
			// Arrange
			var oSpy = sinon.spy(this.oCPBox, "handleTouch"),
				oMockEventData = {offsetX: 10, offsetY: 10};

			// Act - emulate 'ontouchstart' event with mock data
			this.oCPBox.ontouchstart(oMockEventData);

			// Assert
			oAssert.strictEqual(oSpy.callCount, 1,
				"On event 'ontouchstart' the method 'handleTouch' should also be called to handle initial Color Picker box interaction");

			// Arrange - reset spy counters
			oSpy.resetHistory();

			// Act - emulate 'ontouchend' event with mock data
			this.oCPBox.ontouchend(oMockEventData);

			// Assert
			oAssert.strictEqual(oSpy.callCount, 1,
				"On event 'ontouchend' the method 'handleTouch' should also be called to handle last Color Picker box interaction");

			// Cleanup
			oSpy.restore();
		});

		QUnit.test("ontouchmove event", function (oAssert) {
			// Arrange
			var oSpy = sinon.spy(this.oCPBox, "calculateValuesFromEvent"),
				oEventSpy = sinon.spy(this.oCPBox, "fireSelect");

			// Act - emulate 'ontouchmove' event with valid mock data
			this.oCPBox.ontouchstart({offsetX: 10, offsetY: 10});

			// Assert
			oAssert.strictEqual(oSpy.callCount, 1, "Method 'calculateValuesFromEvent' should be called once");
			oAssert.strictEqual(oEventSpy.callCount, 1, "Event 'fireSelect' called once");

			// Arrange - reset spy counters
			oSpy.resetHistory();
			oEventSpy.resetHistory();

			// Act - emulate 'ontouchmove' event with invalid mock data
			this.oCPBox.ontouchmove({offsetX: undefined, offsetY: undefined});

			// Assert
			oAssert.strictEqual(oSpy.callCount, 1, "Method 'calculateValuesFromEvent' should be called once");
			oAssert.strictEqual(oEventSpy.callCount, 0, "Event 'fireSelect' should not be called");
		});

		QUnit.test("calculateValuesFromEvent - calculations", function (oAssert) {
			// Arrange
			var oResult;

			// Mock getWidth method to return a fixed number
			this.oCPBox.getWidth = function () {
				return 100;
			};

			// Mock getOffset method to return offset object with a fixed offset from screen top
			this.oCPBox.getOffset = function () {
				return {left: 0, top: 0};
			};

			// Act
			oResult = this.oCPBox.calculateValuesFromEvent({offsetX: 10, offsetY: 10});

			// Assert
			oAssert.strictEqual(oResult.value, 10, "Result value should be 10");
			oAssert.strictEqual(oResult.saturation, 90, "Result saturation should be 90");

			// Act - out of range numbers negative
			oResult = this.oCPBox.calculateValuesFromEvent({offsetX: -1, offsetY: -1});

			// Assert
			oAssert.strictEqual(oResult.value, 0, "Result value should be 0");
			oAssert.strictEqual(oResult.saturation, 100, "Result saturation should be 100");

			// Act - out of range numbers positive
			oResult = this.oCPBox.calculateValuesFromEvent({offsetX: 101, offsetY: 101});

			// Assert
			oAssert.strictEqual(oResult.value, 100, "Result value should be 100");
			oAssert.strictEqual(oResult.saturation, 0, "Result saturation should be 0");

			// Act - passing event with no position data
			oResult = this.oCPBox.calculateValuesFromEvent({offsetX: undefined, offsetY: undefined});

			// Assert
			oAssert.strictEqual(oResult, false, "Passing event with no position data should return 'false'");

			// Act - passing event with pageX and pageY coordinates
			oResult = this.oCPBox.calculateValuesFromEvent({offsetX: undefined, offsetY: undefined, pageX: 10, pageY: 10});

			// Assert
			oAssert.strictEqual(oResult.value, 10, "Result value should be 10");
			oAssert.strictEqual(oResult.saturation, 90, "Result saturation should be 90");

			// Act - passing event with targetTouches coordinates
			oResult = this.oCPBox.calculateValuesFromEvent({
				offsetX: undefined,
				offsetY: undefined,
				targetTouches: [
					{pageX: 10, pageY: 10}
				]
			});

			// Assert
			oAssert.strictEqual(oResult.value, 10, "Result value should be 10");
			oAssert.strictEqual(oResult.saturation, 90, "Result saturation should be 90");
		});

		QUnit.test("calculateValuesFromEvent - Right To Left mode", function (oAssert) {
			// Arrange
			var oResult;

			// Mock getWidth method to return a fixed number
			this.oCPBox.getWidth = function () {
				return 100;
			};

			// Mock Right To Left mode (Note: only value is affected here as in this mode only X coordinates are flipped)
			this.oCPBox.bRtl = true;

			// Act
			oResult = this.oCPBox.calculateValuesFromEvent({offsetX: 10, offsetY: 0});

			// Assert
			oAssert.strictEqual(oResult.value, 90, "Result value should be 90");

			// Act
			oResult = this.oCPBox.calculateValuesFromEvent({offsetX: -1, offsetY: 0});

			// Assert
			oAssert.strictEqual(oResult.value, 100, "Result value should be 100");

			// Act
			oResult = this.oCPBox.calculateValuesFromEvent({offsetX: 101, offsetY: 0});

			// Assert
			oAssert.strictEqual(oResult.value, 0, "Result value should be 0");
		});

		QUnit.module("displayMode", {
			beforeEach: function () {
				this.oCP = new ColorPicker();
			},
			afterEach: function () {
				this.oCP.destroy();
				this.oCP = null;
			}
		});

		QUnit.test("rendering", async function (oAssert) {
			// Act
			this.oCP.placeAt("qunit-fixture");
			await nextUIUpdate();

			// Assert
			oAssert.strictEqual(this.oCP.getDisplayMode(), "Default", "The ColorPicker's default displayMode is 'Default'");

			// Act
			this.oCP.setDisplayMode(ColorPickerDisplayMode.Simplified);

			// Assert
			oAssert.strictEqual(this.oCP.getDisplayMode(), "Simplified", "The ColorPicker's displayMode is Simplified");

			// Act
			this.oCP.setDisplayMode(ColorPickerDisplayMode.Large);

			// Assert
			oAssert.strictEqual(this.oCP.getDisplayMode(), "Large", "The ColorPicker's displayMode is Large");
		});

		QUnit.test("in display mode Large, half the inputs are disabled", async function(assert) {
			// arrange
			this.oCP.setDisplayMode(ColorPickerDisplayMode.Large);
			this.oCP.placeAt("qunit-fixture");
			await nextUIUpdate();

			// assert
			assert.equal(this.oCP.oRedField.getEnabled(), true, "red is enabled");
			assert.equal(this.oCP.oRedField.getEnabled(), true, "green is enabled");
			assert.equal(this.oCP.oRedField.getEnabled(), true, "blue is enabled");
			assert.equal(this.oCP.oHueField.getEnabled(), false, "hue is disabled");
			assert.equal(this.oCP.oSatField.getEnabled(), false, "sat is disabled");
			assert.equal(this.oCP.oLitField.getEnabled(), false, "lit is disabled");
			assert.equal(this.oCP.oValField.getEnabled(), false, "val is disabled");

			// act
			this.oCP.oRGBorHSLRBUnifiedGroup.fireSelect({
				selectedIndex : 1
			});

			//assert
			assert.equal(this.oCP.oRedField.getEnabled(), false, "red is disabled");
			assert.equal(this.oCP.oRedField.getEnabled(), false, "green is disabled");
			assert.equal(this.oCP.oRedField.getEnabled(), false, "blue is disabled");
			assert.equal(this.oCP.oHueField.getEnabled(), true, "hue is enabled");
			assert.equal(this.oCP.oSatField.getEnabled(), true, "sat is enabled");
			assert.equal(this.oCP.oLitField.getEnabled(), true, "lit is enabled");
			assert.equal(this.oCP.oValField.getEnabled(), true, "val is enabled");
		});

		QUnit.module("values conversions", {
			beforeEach: function() {
				this.oCP = new ColorPicker();
			},
			afterEach: function() {
				this.oCP.destroy();
				this.oCP = null;
			}
		});

		QUnit.test("_calculateRGBAdvanced hue edge cases", function(assert) {
			// Act
			this.oCP._calculateRGBAdvanced(0, 50, 50);

			// Assert
			assert.strictEqual(this.oCP.RGB.r, 191, 'red value is as expected');
			assert.strictEqual(this.oCP.RGB.g, 64, 'green value is as expected');
			assert.strictEqual(this.oCP.RGB.b, 64, 'blue value is as expected');

			// Act
			this.oCP._calculateRGBAdvanced(360, 50, 50);

			// Assert
			assert.strictEqual(this.oCP.RGB.r, 191, 'red value is as expected');
			assert.strictEqual(this.oCP.RGB.g, 64, 'green value is as expected');
			assert.strictEqual(this.oCP.RGB.b, 64, 'blue value is as expected');
		});

		QUnit.test("_calculateHSL hue edge cases", function(assert) {
			// Act
			this.oCP.Color.h = 360;
			this.oCP._calculateHSL(191, 64, 64);

			// Assert
			assert.strictEqual(this.oCP.Color.h, 360, 'hue is ok');
			assert.strictEqual(this.oCP.Color.s, 50, 'saturation is ok');
			assert.strictEqual(this.oCP.Color.l, 50, 'light is ok');
		});

});