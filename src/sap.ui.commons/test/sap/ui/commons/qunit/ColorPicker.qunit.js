/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/unified/ColorPicker",
	"sap/ui/commons/ColorPicker",
	"sap/ui/unified/library"
], function(
	qutils,
	createAndAppendDiv,
	UnifiedColorPicker,
	ColorPicker,
	unifiedLibrary
) {
	"use strict";

	// prepare DOM
	["uiArea8","uiArea7","uiArea6","uiArea5","uiArea4","uiArea3","uiArea2","uiArea1"].forEach(function(id) {
		document.body.insertBefore(createAndAppendDiv(id), document.body.firstChild).setAttribute("style", "display:inline-block");
	});



	/****************************************************
	* PREPARATIONS
	*****************************************************/
	//declare variables
	var sCtrlId  = "ColorPicker";
	var colors2 = {},
		colors6 = {};

	// Get control constants
	var CONSTANTS = new UnifiedColorPicker()._getConstants();

	/****************************************************
	* EVENT-HANDLER
	*****************************************************/
	//	Eventhandler for Change Event of ColorPicker 2
	function handleColorPicker2Change(oEvent) {
		colors2 = oEvent.getParameters();
	}

	//	Eventhandler for Change Event of ColorPicker 6
	function handleColorPicker6Change(oEvent) {
		colors6 = oEvent.getParameters();
	}


	/****************************************************
	* CREATION OF CONTROLS
	*****************************************************/
	// Control 1 = Default values
	var oColorPicker1 =  new ColorPicker(sCtrlId + "1");
	oColorPicker1.placeAt("uiArea1");

	// Control 2 = Set parameter to 'lime'
	var oColorPicker2 =  new ColorPicker(sCtrlId + "2");
	oColorPicker2.attachChange(handleColorPicker2Change);
	oColorPicker2.setColorString('lime');
	oColorPicker2.placeAt("uiArea2");

	// Control 3 = Set parameter to 'rgb120,177,60'
	var oColorPicker3 =  new ColorPicker(sCtrlId + "3");
	oColorPicker3.setColorString('rgb120,177,60');
	oColorPicker3.placeAt("uiArea3");

	// Control 4 = Set parameter to 'hsv(270,44,88)'
	var oColorPicker4 =  new ColorPicker(sCtrlId + "4");
	oColorPicker4.setColorString('hsv(270,44,88)');
	oColorPicker4.placeAt("uiArea4");

	// Control 5 = Set parameter to '#18a'
	var oColorPicker5 =  new ColorPicker(sCtrlId + "5");
	oColorPicker5.setColorString('#18a');
	oColorPicker5.placeAt("uiArea5");

	// Control 6 = Set parameter to 'hsv(370,44,88)'
	var oColorPicker6 =  new ColorPicker(sCtrlId + "6");
	oColorPicker6.attachChange(handleColorPicker6Change);
	oColorPicker6.setColorString('hsv(370,44,88)');
	oColorPicker6.placeAt("uiArea6");



	/****************************************************
	* QUINIT TESTS - PREPARATIONS
	*****************************************************/



	/****************************************************
	* QUINIT TESTS MODULE 'INITIALIZATION'
	*****************************************************/
	// Set a Test Module for module "Initialization"
	QUnit.module("Initialization");

	//Testcase 1: Initialize and immediately destroy
	QUnit.test("Initialize and immediately destroy", function(assert) {
		assert.expect(1);

		var cp = new ColorPicker();
		cp.destroy();

		assert.ok(true, "Initialized and destroyed control");
	});

	/****************************************************
	* QUINIT TESTS MODULE 'PROPERTIES'
	*****************************************************/
	// Set a Test Module for module "Properties"
	QUnit.module("Properties");

	//Testcase 1: Default values
	QUnit.test("Default Input Parameters [Control 1]: ", function(assert) {
		assert.expect(7);
		assert.equal(oColorPicker1.oRedField.getValue(), "255" , "Default value RED: ");
		assert.equal(oColorPicker1.oGreenField.getValue(), "255" , "Default value GREEN: ");
		assert.equal(oColorPicker1.oBlueField.getValue(), "255" , "Default value BLUE: ");
		assert.equal(oColorPicker1.oHueField.getValue(), "0" , "Default value HUE: ");
		assert.equal(oColorPicker1.oSatField.getValue(), "0" , "Default value SATURATION: ");
		assert.equal(oColorPicker1.oValField.getValue(), "100" , "Default value VALUE: ");
		assert.equal(oColorPicker1.oHexField.getValue(), "ffffff" , "Default value HEX: ");
	});

	//Testcase 2: Named Parameter
	QUnit.test("Input Parameter 'lime' [Control 2]: ", function(assert) {
		assert.expect(7);
		assert.equal(oColorPicker2.oRedField.getValue(), "0" , "Value of RED: ");
		assert.equal(oColorPicker2.oGreenField.getValue(), "255" , "Value of GREEN: ");
		assert.equal(oColorPicker2.oBlueField.getValue(), "0" , "Value of BLUE: ");
		assert.equal(oColorPicker2.oHueField.getValue(), "120" , "Value of HUE: ");
		assert.equal(oColorPicker2.oSatField.getValue(), "100" , "Value of SATURATION: ");
		assert.equal(oColorPicker2.oValField.getValue(), "100" , "Value of VALUE: ");
		assert.equal(oColorPicker2.oHexField.getValue(), "00ff00" , "Value of HEX: ");
	});

	//Testcase 3: RGB Parameter
	QUnit.test("Input Parameter 'rgb120,177,60' [Control 3]: ", function(assert) {
		assert.expect(7);
		assert.equal(oColorPicker3.oRedField.getValue(), "120" , "Value of RED: ");
		assert.equal(oColorPicker3.oGreenField.getValue(), "177" , "Value of GREEN: ");
		assert.equal(oColorPicker3.oBlueField.getValue(), "60" , "Value of BLUE: ");
		assert.equal(oColorPicker3.oHueField.getValue(), "89" , "Value of HUE: ");
		assert.equal(oColorPicker3.oSatField.getValue(), "66" , "Value of SATURATION: ");
		assert.equal(oColorPicker3.oValField.getValue(), "69" , "Value of VALUE: ");
		assert.equal(oColorPicker3.oHexField.getValue(), "78b13c" , "Value of HEX: ");
	});

	//Testcase 4: HSV Parameter
	QUnit.test("Input Parameter 'hsv(270,44,88)' [Control 4]: ", function(assert) {
		assert.expect(7);
		assert.equal(oColorPicker4.oRedField.getValue(), "175" , "Value of RED: ");
		assert.equal(oColorPicker4.oGreenField.getValue(), "125" , "Value of GREEN: ");
		assert.equal(oColorPicker4.oBlueField.getValue(), "224" , "Value of BLUE: ");
		assert.equal(oColorPicker4.oHueField.getValue(), "270" , "Value of HUE: ");
		assert.equal(oColorPicker4.oSatField.getValue(), "44" , "Value of SATURATION: ");
		assert.equal(oColorPicker4.oValField.getValue(), "88" , "Value of VALUE: ");
		assert.equal(oColorPicker4.oHexField.getValue(), "af7de0" , "Value of HEX: ");
	});

	//Testcase 5: HEX Parameter
	QUnit.test("Input Parameter '#18a' [Control 5]: ", function(assert) {
		assert.expect(7);
		assert.equal(oColorPicker5.oRedField.getValue(), "17" , "Value of RED: ");
		assert.equal(oColorPicker5.oGreenField.getValue(), "136" , "Value of GREEN: ");
		assert.equal(oColorPicker5.oBlueField.getValue(), "170" , "Value of BLUE: ");
		assert.equal(oColorPicker5.oHueField.getValue(), "193" , "Value of HUE: ");
		assert.equal(oColorPicker5.oSatField.getValue(), "90" , "Value of SATURATION: ");
		assert.equal(oColorPicker5.oValField.getValue(), "67" , "Value of VALUE: ");
		assert.equal(oColorPicker5.oHexField.getValue(), "1188aa" , "Value of HEX: ");
	});

	//Testcase 6: wrong Parameter
	QUnit.test("Wrong Parameter 'hsv(370,44,88)'=> default [Control 6]: ", function(assert) {
		assert.expect(7);
		assert.equal(oColorPicker6.oRedField.getValue(), "255" , "Value of RED: ");
		assert.equal(oColorPicker6.oGreenField.getValue(), "255" , "Value of GREEN: ");
		assert.equal(oColorPicker6.oBlueField.getValue(), "255" , "Value of BLUE: ");
		assert.equal(oColorPicker6.oHueField.getValue(), "0" , "Value of HUE: ");
		assert.equal(oColorPicker6.oSatField.getValue(), "0" , "Value of SATURATION: ");
		assert.equal(oColorPicker6.oValField.getValue(), "100" , "Value of VALUE: ");
		assert.equal(oColorPicker6.oHexField.getValue(), "ffffff" , "Value of HEX: ");
	});


	/****************************************************
	* QUINIT TESTS MODULE 'DATA-INPUT'
	*****************************************************/
	// Set a Test Module for module "Data-Changes"
	QUnit.module("Data-Changes");

	//Testcase 7: Input a RGB-value
	QUnit.test("RED changed => H, S, V and HEX calculated [Control 1]: ", function(assert) {
		oColorPicker1.oRedField.setValue(123);
		oColorPicker1.oRedField.fireChange({newValue:123});
		assert.expect(7);
		assert.equal(oColorPicker1.oRedField.getValue(), "123" , "RED manually changed to 123: ");
		assert.equal(oColorPicker1.oGreenField.getValue(), "255" , "GREEN not changed (default value): ");
		assert.equal(oColorPicker1.oBlueField.getValue(), "255" , "BLUE not changed (default value): ");
		assert.equal(oColorPicker1.oHueField.getValue(), "180" , "HUE changed from 0 -> 180: ");
		assert.equal(oColorPicker1.oSatField.getValue(), "52" , "SATURATION changed from 0 -> 52: ");
		assert.equal(oColorPicker1.oValField.getValue(), "100" , "VALUE not changed (default value): ");
		assert.equal(oColorPicker1.oHexField.getValue(), "7bffff" , "HEX changed from ffffff -> 7bffff: ");
	});

	//Testcase 8: Input a HSV-value
	QUnit.test("SATURATION changed => R, G, B and HEX calculated [Control 4]: ", function(assert) {
		oColorPicker4.oSatField.setValue(4);
		oColorPicker4.oSatField.fireChange({newValue:4});
		assert.expect(7);
		assert.equal(oColorPicker4.oRedField.getValue(), "219" , "RED changed from 175 -> 219: ");
		assert.equal(oColorPicker4.oGreenField.getValue(), "215" , "GREEN changed from 126 -> 215: ");
		assert.equal(oColorPicker4.oBlueField.getValue(), "224" , "BLUE not changed (224): ");
		assert.equal(oColorPicker4.oHueField.getValue(), "270" , "HUE not changed (270): ");
		assert.equal(oColorPicker4.oSatField.getValue(), "4" , "SATURATION manually changed from 44 -> 4: ");
		assert.equal(oColorPicker4.oValField.getValue(), "88" , "VALUE not changed (88): ");
		assert.equal(oColorPicker4.oHexField.getValue(), "dbd7e0" , "HEX changed from af7ee0 -> dbd7e0: ");
	});

	//Testcase 9: Input a HEX-value
	QUnit.test("HEX changed => R, G, B, H, S and V calculated [Control 6]: ", function(assert) {
		oColorPicker6.oHexField.setValue("16ba30");
		oColorPicker6.oHexField.fireChange({newValue:"16ba30"});
		assert.expect(7);
		assert.equal(oColorPicker6.oRedField.getValue(), "22" , "RED changed from 255 -> 22: ");
		assert.equal(oColorPicker6.oGreenField.getValue(), "186" , "GREEN changed from 255 -> 186: ");
		assert.equal(oColorPicker6.oBlueField.getValue(), "48" , "BLUE changed from 255 -> 48: ");
		assert.equal(oColorPicker6.oHueField.getValue(), "130" , "HUE changed from 0 -> 130: ");
		assert.equal(oColorPicker6.oSatField.getValue(), "88" , "SATURATION changed from 0 -> 88: ");
		assert.equal(oColorPicker6.oValField.getValue(), "73" , "VALUE changed from 100 -> 73: ");
		assert.equal(oColorPicker6.oHexField.getValue(), "16ba30" , "HEX manually changed from ffffff -> 16ba30: ");
	});

	//Testcase 10: Input a wrong RGB-value
	QUnit.test("Wrong data - BLUE changed to 260 => H, S, V and HEX calculated [Control 3]: ", function(assert) {
		oColorPicker3.oBlueField.setValue(260);
		oColorPicker3.oBlueField.fireChange({newValue:oColorPicker3.oBlueField.getValue()});
		assert.expect(7);
		assert.equal(oColorPicker3.oRedField.getValue(), "120" , "RED changed from 123 to 120: ");
		assert.equal(oColorPicker3.oGreenField.getValue(), "177" , "GREEN changed from 255 -> 177: ");
		assert.equal(oColorPicker3.oBlueField.getValue(), "255" , "BLUE manually changed to 260 => set to 255: ");
		assert.equal(oColorPicker3.oHueField.getValue(), "215" , "HUE changed from 180 -> 215: ");
		assert.equal(oColorPicker3.oSatField.getValue(), "53" , "SATURATION changed from 52 -> 53: ");
		assert.equal(oColorPicker3.oValField.getValue(), "100" , "VALUE not changed (100): ");
		assert.equal(oColorPicker3.oHexField.getValue(), "78b1ff" , "HEX changed from 78b13c -> 78b1ff: ");
	});

	//Testcase 11: Input a wrong S / V - value
	QUnit.test("Wrong data - SATURATION changed to 120 => R, G, B and HEX calculated [Control 5]: ", function(assert) {
		oColorPicker5.oSatField.setValue(120);
		oColorPicker5.oSatField.fireChange({newValue:oColorPicker5.oSatField.getValue()});
		assert.expect(7);
		assert.equal(oColorPicker5.oRedField.getValue(), "0" , "RED changed from 17 -> 0: ");
		assert.equal(oColorPicker5.oGreenField.getValue(), "133" , "GREEN changed from 136 -> 133: ");
		assert.equal(oColorPicker5.oBlueField.getValue(), "170" , "BLUE not changed (170): ");
		assert.equal(oColorPicker5.oHueField.getValue(), "193" , "HUE not changed (193): ");
		assert.equal(oColorPicker5.oSatField.getValue(), "100" , "SATURATION manually changed to 120 => set to 100: ");
		assert.equal(oColorPicker5.oValField.getValue(), "67" , "VALUE not changed (67): ");
		assert.equal(oColorPicker5.oHexField.getValue(), "0085aa" , "HEX changed from 1188aa -> 0085aa: ");
	});

	//Testcase 12: Input a wrong HUE - value
	QUnit.test("Wrong data - HUE changed to -30 => other values calculated [Control 1]: ", function(assert) {
		oColorPicker1.oHueField.setValue(-30);
		oColorPicker1.oHueField.fireChange({newValue:oColorPicker1.oHueField.getValue()});
		assert.expect(7);
		assert.equal(oColorPicker1.oRedField.getValue(), "255" , "RED changed from 123 -> 255: ");
		assert.equal(oColorPicker1.oGreenField.getValue(), "122" , "GREEN changed from 255 -> 122: ");
		assert.equal(oColorPicker1.oBlueField.getValue(), "122" , "BLUE changed from  255 -> 122: ");
		assert.equal(oColorPicker1.oHueField.getValue(), "0" , "HUE manually changed to -30 => set to 0: ");
		assert.equal(oColorPicker1.oSatField.getValue(), "52" , "SATURATION not changed (52): ");
		assert.equal(oColorPicker1.oValField.getValue(), "100" , "VALUE not changed (100): ");
		assert.equal(oColorPicker1.oHexField.getValue(), "ff7a7a" , "HEX changed from 7bffff -> ff7a7a: ");
	});

	//Testcase 13: Set new color string (RGB-value)
	QUnit.test("New color string 'rgb(249,238,227)' [Control 3]: ", function(assert) {
		oColorPicker3.setColorString("rgb(249,238,227)");
		sap.ui.getCore().applyChanges();
		assert.expect(3);
		assert.equal(oColorPicker3.oRedField.getValue(), "249" , "RED set from color string to 249: ");
		assert.equal(oColorPicker3.oGreenField.getValue(), "238" , "GREEN set from color string to 238: ");
		assert.equal(oColorPicker3.oBlueField.getValue(), "227" , "BLUE set from color string to 227: ");
	});

	/****************************************************
	* QUINIT TESTS MODULE 'RESULTS'
	*****************************************************/
	// Set a Test Module for module "Results"
	QUnit.module("Results");

	//Testcase 14: Results of named parameter
	QUnit.test("Result of Input Parameter 'lime' [Control 2]: ", function(assert) {
		assert.expect(7);
		assert.equal(oColorPicker2.oRedField.getValue(), colors2.r.toString() , "Value of RED: ");
		assert.equal(oColorPicker2.oGreenField.getValue(), colors2.g.toString() , "Value of GREEN: ");
		assert.equal(oColorPicker2.oBlueField.getValue(), colors2.b.toString() , "Value of BLUE: ");
		assert.equal(oColorPicker2.oHueField.getValue(), colors2.h.toString() , "Value of HUE: ");
		assert.equal(oColorPicker2.oSatField.getValue(), colors2.s.toString() , "Value of SATURATION: ");
		assert.equal(oColorPicker2.oValField.getValue(), colors2.v.toString() , "Value of VALUE: ");
		assert.equal(oColorPicker2.Color.hex, colors2.hex , "Value of HEX: ");
	});

	//Testcase 15: Results of wrong parameter
	QUnit.test("Result of wrong parameter [Control 6]: ", function(assert) {
		assert.expect(7);
		assert.equal(oColorPicker6.oRedField.getValue(), colors6.r.toString() , "Value of RED: ");
		assert.equal(oColorPicker6.oGreenField.getValue(), colors6.g.toString() , "Value of GREEN: ");
		assert.equal(oColorPicker6.oBlueField.getValue(), colors6.b.toString() , "Value of BLUE: ");
		assert.equal(oColorPicker6.oHueField.getValue(), colors6.h.toString() , "Value of HUE: ");
		assert.equal(oColorPicker6.oSatField.getValue(), colors6.s.toString() , "Value of SATURATION: ");
		assert.equal(oColorPicker6.oValField.getValue(), colors6.v.toString() , "Value of VALUE: ");
		assert.equal(oColorPicker6.Color.hex, colors6.hex , "Value of HEX: ");
	});


	/****************************************************
	* QUINIT TESTS MODULE 'EVENTS'
	*****************************************************/
	// Set a Test Module for module "Events"
	QUnit.module("Events");

	//Testcase 16: Mouse-Event of Slider
	QUnit.test("Mouse-Event: Click on Slider [Control 6]: ", function(assert) {
		assert.expect(4);
		assert.equal(oColorPicker6.oHueField.getValue(), colors6.h.toString() , "Value of HUE before mouse events: ");
		qutils.triggerMouseEvent("ColorPicker6-hSLD", "click", 166, 0, 0, 0 );
		assert.equal(oColorPicker6.oHueField.getValue(), colors6.h.toString() , "Value of HUE after mouse click 1: ");
		qutils.triggerMouseEvent("ColorPicker6-hSLD", "click", 16, 0, 0, 0 );
		assert.equal(oColorPicker6.oHueField.getValue(), colors6.h.toString() , "Value of HUE after mouse click 2: ");
		qutils.triggerMouseEvent("ColorPicker6-hSLD", "click", 250, 0, 0, 0 );
		assert.equal(oColorPicker6.oHueField.getValue(), colors6.h.toString() , "Value of HUE after mouse click 3: ");

	});

	//Testcase 17: Mouse-Event of Colorpipcker-Box
	QUnit.test("Mouse-Event: Click in ColorPicker-Box [Control 4]: ", function(assert) {
		// Arrange
		var oCPBox = oColorPicker4.oCPBox,
			cpBoxOffset = oCPBox.$().offset(),
			oCPBoxDomRef = oCPBox.getDomRef();

		assert.expect(6);

		// Assert
		assert.equal(oColorPicker4.oSatField.getValue(), "4" , "SATURATION (before mouse events): ");
		assert.equal(oColorPicker4.oValField.getValue(), "88" , "VALUE (before mouse events): ");

		// Act
		qutils.triggerTouchEvent("touchstart", oCPBoxDomRef, {
			targetTouches: {
				0: {
					pageX: cpBoxOffset.left + 10,
					pageY: cpBoxOffset.top + 10
				}
			},
			srcControl: oCPBox
		});

		// Assert
		assert.equal(oColorPicker4.oSatField.getValue(), "90" , "SATURATION (after mouse event 1): ");
		assert.equal(oColorPicker4.oValField.getValue(), "9" , "VALUE (after mouse event 1): ");

		// Act
		qutils.triggerTouchEvent("touchstart", oCPBoxDomRef, {
			targetTouches: {
				0: {
					pageX: cpBoxOffset.left + 33,
					pageY: cpBoxOffset.top + 33
				}
			},
			srcControl: oCPBox
		});

		// Assert
		assert.equal(oColorPicker4.oSatField.getValue(), "68" , "SATURATION (after mouse event 2): ");
		assert.equal(oColorPicker4.oValField.getValue(), "31" , "VALUE (after mouse event 2	): ");
	});

	QUnit.module("sap.ui.unified._ColorPickerHelper");

	QUnit.test("Responsive mode", function (oAssert) {
		// Arrange
		var oHelper = unifiedLibrary.ColorPickerHelper,
			oFactory = oHelper.factory,
			oRBGroup,
			oSlider,
			oInput;

		// Assert - Properties
		oAssert.strictEqual(oHelper.isResponsive(), false, "Helper should be in responsive mode");
		oAssert.notOk(oHelper.bFinal, "Further overwriting of this object is not prohibited");

		// Assert - Factory
		oAssert.ok(oFactory.createLabel() instanceof sap.ui.commons.Label,
			"Factory label control should be instance of sap.ui.commons.Label");

		oInput = oFactory.createInput("MYCUSTOMINPUTID");
		oAssert.ok(oInput instanceof sap.ui.commons.TextField,
			"Factory input control should be instance of sap.ui.commons.TextField");
		oAssert.strictEqual(oInput.getId(), "MYCUSTOMINPUTID",
			"Factory input control should have 'MYCUSTOMINPUTID' assigned as ID");

		// RadioButton group and RadioButtonItem
		oRBGroup = oFactory.createRadioButtonGroup({
			// Keep in mind that we are using the "buttons" aggregation here
			buttons: oHelper.factory.createRadioButtonItem()
		});
		oAssert.ok(oRBGroup instanceof sap.ui.commons.RadioButtonGroup,
			"Factory RadioButtonGroup control should be instance of sap.ui.commons.RadioButtonGroup");
		oAssert.ok(oRBGroup.getItems()[0] instanceof sap.ui.core.Item,
			"Factory RadioButtonGroup buttons aggregation should be propagated to items " +
			"aggregation and returned item from createRadioButtonItem should be instance of " +
			"sap.ui.core.Item");

		// Slider
		oSlider = oFactory.createSlider("MYCUSTOMSLIDERID", {
			// Keep in mind that we are using the "step" property here
			step: 0.1
		});
		oAssert.ok(oSlider instanceof sap.ui.commons.Slider,
			"Factory Slider control should be instance of sap.ui.commons.Slider");
		oAssert.strictEqual(oSlider.getId(), "MYCUSTOMSLIDERID",
			"Factory Slider control should have 'MYCUSTOMSLIDERID' assigned as ID");
		oAssert.strictEqual(oSlider.getSmallStepWidth(), 0.1, 'used "step" property should be ' +
			'propagated to the "smallStepWidth" property during creation');
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

	QUnit.test("_adaptControlToLibrary", function (oAssert) {
		// Arrange
		var oGrid;

		// Act
		this.oCP._createLayout(); // Force creation of inner controls
		oGrid = this.oCP.getAggregation("_grid");

		// Assert
		oAssert.notStrictEqual(oGrid._iBreakPointTablet, 314, "The breakpoint for tablet should not be changed to 314");
		oAssert.notOk(oGrid.hasStyleClass(CONSTANTS.CPResponsiveClass), "Responsive CSS class is not applied to the Grid");
	});

	QUnit.test("_createLayout", function (oAssert) {
		// Arrange
		var aAggregations,
			oCounts = {},
			oGrid,
			sName,
			i;

		// Act - init creation of internal controls
		this.oCP._createLayout();
		oGrid = this.oCP.getAggregation("_grid");

		// Act - Get all child aggregations of the Grid recursively
		aAggregations = oGrid.findAggregatedObjects(true, true);

		// Count by control type
		for (i = 0; i < aAggregations.length; i++) {
			sName = aAggregations[i].getMetadata().getElementName();
			oCounts[sName] = 1 + (oCounts[sName] || 0);
		}

		// Assert
		oAssert.strictEqual(oCounts["sap.ui.commons.Slider"], 2, "There should be 2 Sliders created");
		oAssert.strictEqual(oCounts["sap.ui.commons.Label"], 13, "There should be 13 labels created");
		oAssert.strictEqual(oCounts["sap.ui.commons.TextField"], 10, "There should be 10 inputs created");
		oAssert.strictEqual(oCounts["sap.ui.commons.RadioButtonGroup"], 1, "There should be 1 RadioButton group created");
		oAssert.strictEqual(oCounts["sap.ui.core.Item"], 2, "There should be 2 Items created");
	});
});