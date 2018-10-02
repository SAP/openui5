/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/commons/library",
	"sap/ui/commons/ColorPicker"
], function(qutils, commonsLibrary, ColorPicker) {
	"use strict";

	// shortcut for sap.ui.commons.ColorPickerMode
	var ColorPickerMode = commonsLibrary.ColorPickerMode;



	/****************************************************
	* CREATION OF CONTROL
	*****************************************************/
	function createColorPicker(oProps) {
		var oPickerProps = {
			mode: ColorPickerMode.HSL
		};
		jQuery.extend(oPickerProps, oProps);

		return new  ColorPicker(oPickerProps);
	}

	/****************************************************
	* QUINIT TESTS MODULE 'INITIALIZATION'
	*****************************************************/
	// Set a Test Module for module "Initialization"
	QUnit.module("Initialization");

	//Testcase 1: Initialize and immediately destroy
	QUnit.test("Initialize and immediately destroy", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.destroy();

		assert.ok(true, "Initialized and destroyed control");
	});

	//Testcase 2: Initialize and immediately destroy
	QUnit.test("Default ColorPicker mode (HSV)", function(assert) {
		var oColorPicker = new ColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.getMode(), ColorPickerMode.HSV, "Default mode of ColorPicker is HSV");

		oColorPicker.destroy();
	});

	//Testcase 3: Initialize and immediately destroy
	QUnit.test("Color picker in HSL mode", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.getMode(), ColorPickerMode.HSL , "ColorPicker is in HSL mode");

		oColorPicker.destroy();
	});

	/****************************************************
	* QUINIT TESTS MODULE 'PROPERTIES'
	*****************************************************/
	// Set a Test Module for module "Properties"
	QUnit.module("Properties");

	//Testcase 1: Default values
	QUnit.test("Default Input Parameters: ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), "255" , "Default value RED: 255");
		assert.equal(oColorPicker.oGreenField.getValue(), "255" , "Default value GREEN: 255");
		assert.equal(oColorPicker.oBlueField.getValue(), "255" , "Default value BLUE: 255");
		assert.equal(oColorPicker.oHueField.getValue(), "0" , "Default value HUE: 0");
		assert.equal(oColorPicker.oSatField.getValue(), "0" , "Default value SATURATION: 0");
		assert.equal(oColorPicker.oLitField.getValue(), "100" , "Default value LIGHTNESS: 100");
		assert.equal(oColorPicker.oHexField.getValue(), "ffffff" , "Default value HEX: ffffff");

		oColorPicker.destroy();
	});

	//Testcase 2: Named Parameter
	QUnit.test("Input Parameter 'lime': ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "lime"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), "0" , "Value of RED: 0");
		assert.equal(oColorPicker.oGreenField.getValue(), "255" , "Value of GREEN: 255");
		assert.equal(oColorPicker.oBlueField.getValue(), "0" , "Value of BLUE: 0");
		assert.equal(oColorPicker.oHueField.getValue(), "120" , "Value of HUE: 120");
		assert.equal(oColorPicker.oSatField.getValue(), "100" , "Value of SATURATION: 100");
		assert.equal(oColorPicker.oLitField.getValue(), "50" , "Value of LIGHTNESS: 50");
		assert.equal(oColorPicker.oHexField.getValue(), "00ff00" , "Value of HEX: 00ff00");

		oColorPicker.destroy();
	});

	//Testcase 3: RGB Parameter
	QUnit.test("Input Parameter 'rgb120,177,60': ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "rgb120,177,60"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), "120" , "Value of RED: 120");
		assert.equal(oColorPicker.oGreenField.getValue(), "177" , "Value of GREEN: 177");
		assert.equal(oColorPicker.oBlueField.getValue(), "60" , "Value of BLUE: 60");
		assert.equal(oColorPicker.oHueField.getValue(), "89" , "Value of HUE: 89");
		assert.equal(oColorPicker.oSatField.getValue(), "49" , "Value of SATURATION: 49");
		assert.equal(oColorPicker.oLitField.getValue(), "46" , "Value of LIGHTNESS: 46");
		assert.equal(oColorPicker.oHexField.getValue(), "78b13c" , "Value of HEX: 78b13c");

		oColorPicker.destroy();
	});

	//Testcase 4: HSL Parameter
	QUnit.test("Input Parameter 'hsl(120,100%,75%)': ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "hsl(120,100%,75%)"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), "128" , "Value of RED: 128");
		assert.equal(oColorPicker.oGreenField.getValue(), "255" , "Value of GREEN: 255");
		assert.equal(oColorPicker.oBlueField.getValue(), "128" , "Value of BLUE: 128");
		assert.equal(oColorPicker.oHueField.getValue(), "120" , "Value of HUE: 120");
		assert.equal(oColorPicker.oSatField.getValue(), "100" , "Value of SATURATION: 100");
		assert.equal(oColorPicker.oLitField.getValue(), "75" , "Value of LIGHTNESS: 75");
		assert.equal(oColorPicker.oHexField.getValue(), "80ff80" , "Value of HEX: 80ff80");

		oColorPicker.destroy();
	});

	//Testcase 5: HSLa Parameter
	QUnit.test("Input Parameter 'hsla(204, 86%, 57%, 0.53)': ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "hsla(204, 86%, 57%, 0.53)"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), "51" , "Value of RED: 51");
		assert.equal(oColorPicker.oGreenField.getValue(), "164" , "Value of GREEN: 164");
		assert.equal(oColorPicker.oBlueField.getValue(), "240" , "Value of BLUE: 240");
		assert.equal(oColorPicker.oHueField.getValue(), "204" , "Value of HUE: 204");
		assert.equal(oColorPicker.oSatField.getValue(), "86" , "Value of SATURATION: 86");
		assert.equal(oColorPicker.oLitField.getValue(), "57" , "Value of LIGHTNESS: 57");
		assert.equal(oColorPicker.oHexField.getValue(), "33a4f0" , "Value of HEX: 33a4f0");

		oColorPicker.destroy();
	});

	//Testcase 6: HEX Parameter
	QUnit.test("Input Parameter '#18a': ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "#18a"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), "17" , "Value of RED: 17");
		assert.equal(oColorPicker.oGreenField.getValue(), "136" , "Value of GREEN: 136");
		assert.equal(oColorPicker.oBlueField.getValue(), "170" , "Value of BLUE: 170");
		assert.equal(oColorPicker.oHueField.getValue(), "193" , "Value of HUE: 193");
		assert.equal(oColorPicker.oSatField.getValue(), "82" , "Value of SATURATION: 90");
		assert.equal(oColorPicker.oLitField.getValue(), "37" , "Value of LIGHTNESS: 67");
		assert.equal(oColorPicker.oHexField.getValue(), "1188aa" , "Value of HEX: 1188aa");

		oColorPicker.destroy();
	});

	//Testcase 7: wrong Parameter
	QUnit.test("Wrong Parameter 'hsl(370,44,88)': ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "hsl(370,44,88)"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), "255" , "Default value RED: 255");
		assert.equal(oColorPicker.oGreenField.getValue(), "255" , "Default value GREEN: 255");
		assert.equal(oColorPicker.oBlueField.getValue(), "255" , "Default value BLUE: 255");
		assert.equal(oColorPicker.oHueField.getValue(), "0" , "Default value HUE: 0");
		assert.equal(oColorPicker.oSatField.getValue(), "0" , "Default value SATURATION: 0");
		assert.equal(oColorPicker.oLitField.getValue(), "100" , "Default value LIGHTNESS: 100");
		assert.equal(oColorPicker.oHexField.getValue(), "ffffff" , "Default value HEX: ffffff");

		oColorPicker.destroy();
	});

	/****************************************************
	* QUINIT TESTS MODULE 'DATA-INPUT'
	*****************************************************/
	// Set a Test Module for module "Data-Changes"
	QUnit.module("Data-Changes");

	//Testcase: Lightness changed
	QUnit.test("Lightness changed => values calculated: ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oLitField.setValue(50);
		oColorPicker.oLitField.fireChange({newValue:50});

		assert.equal(oColorPicker.oRedField.getValue(), "128" , "RED changed from 225 -> 125");
		assert.equal(oColorPicker.oGreenField.getValue(), "128" , "GREEN changed from 225 -> 125");
		assert.equal(oColorPicker.oBlueField.getValue(), "128" , "BLUE changed from 225 -> 125");
		assert.equal(oColorPicker.oHueField.getValue(), "0" , "HUE not changed: 0");
		assert.equal(oColorPicker.oSatField.getValue(), "0" , "SATURATION not changed: 0");
		assert.equal(oColorPicker.oLitField.getValue(), "50" , "LIGHTNESS manually changed from 100 -> 50");
		assert.equal(oColorPicker.oHexField.getValue(), "808080" , "HEX changed from ffffff -> 808080: ");

		oColorPicker.destroy();
	});

	//Testcase 8: Red changed
	QUnit.test("RED changed => H, S, L and HEX calculated: ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oRedField.setValue(123);
		oColorPicker.oRedField.fireChange({newValue:123});

		assert.equal(oColorPicker.oRedField.getValue(), "123" , "RED manually changed to 123: ");
		assert.equal(oColorPicker.oGreenField.getValue(), "255" , "GREEN not changed (default value): 255");
		assert.equal(oColorPicker.oBlueField.getValue(), "255" , "BLUE not changed (default value): 255");
		assert.equal(oColorPicker.oHueField.getValue(), "180" , "HUE changed from 0 -> 180: ");
		assert.equal(oColorPicker.oSatField.getValue(), "100" , "SATURATION changed from 0 -> 100: ");
		assert.equal(oColorPicker.oLitField.getValue(), "74" , "LIGHTNESS changed from 0 -> 74");
		assert.equal(oColorPicker.oHexField.getValue(), "7bffff" , "HEX changed from ffffff -> 7bffff: ");

		oColorPicker.destroy();
	});


	//Testcase 9: Saturation changed
	QUnit.test("default hsl(120,100%,75%), SATURATION changed => R, G, B and HEX calculated: ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "hsl(120,100%,75%)"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oSatField.setValue(4);
		oColorPicker.oSatField.fireChange({newValue:4});

		assert.equal(oColorPicker.oRedField.getValue(), "189" , "RED changed from 128 -> 189: ");
		assert.equal(oColorPicker.oGreenField.getValue(), "194" , "GREEN changed from 255 -> 194: ");
		assert.equal(oColorPicker.oBlueField.getValue(), "189" , "BLUE changed from 128 -> 189: ");
		assert.equal(oColorPicker.oHueField.getValue(), "120" , "HUE not changed (120): ");
		assert.equal(oColorPicker.oSatField.getValue(), "4" , "SATURATION manually changed from 100 -> 4: ");
		assert.equal(oColorPicker.oLitField.getValue(), "75" , "LIGHTNESS not changed (75): ");
		assert.equal(oColorPicker.oHexField.getValue(), "bdc2bd" , "HEX changed from 80ff80 -> bdc2bd: ");

		oColorPicker.destroy();
	});

	//Testcase 10: Hex changed
	QUnit.test("HEX changed => R, G, B, H, S and L calculated: ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "hsl(120,100%,75%)"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oHexField.setValue("16ba30");
		oColorPicker.oHexField.fireChange({newValue:"16ba30"});

		assert.equal(oColorPicker.oRedField.getValue(), "22" , "RED changed from 128 -> 22: ");
		assert.equal(oColorPicker.oGreenField.getValue(), "186" , "GREEN changed from 255 -> 186: ");
		assert.equal(oColorPicker.oBlueField.getValue(), "48" , "BLUE changed from 128 -> 48: ");
		assert.equal(oColorPicker.oHueField.getValue(), "130" , "HUE changed from 120 -> 130: ");
		assert.equal(oColorPicker.oSatField.getValue(), "79" , "SATURATION changed from 100 -> 79: ");
		assert.equal(oColorPicker.oLitField.getValue(), "41" , "LIGHTNESS changed from 75 -> 41: ");
		assert.equal(oColorPicker.oHexField.getValue(), "16ba30" , "HEX manually changed from 80ff80 -> 16ba30: ");

		oColorPicker.destroy();
	});

	//Testcase 11: Input a wrong RGB-value
	QUnit.test("Wrong data - BLUE changed to 260 => H, S, L and HEX calculated: ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "rgb120,177,60"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oBlueField.setValue(260);
		oColorPicker.oBlueField.fireChange({newValue:oColorPicker.oBlueField.getValue()});

		assert.equal(oColorPicker.oRedField.getValue(), "120" , "RED changed from 123 to 120: ");
		assert.equal(oColorPicker.oGreenField.getValue(), "177" , "GREEN changed from 255 -> 177: ");
		assert.equal(oColorPicker.oBlueField.getValue(), "255" , "BLUE manually changed to 260 => set to 255: ");
		assert.equal(oColorPicker.oHueField.getValue(), "215" , "HUE changed from 180 -> 215: ");
		assert.equal(oColorPicker.oSatField.getValue(), "100" , "SATURATION changed from 52 -> 100: ");
		assert.equal(oColorPicker.oLitField.getValue(), "74" , "LIGHTNESS changed from 46 -> 74: ");
		assert.equal(oColorPicker.oHexField.getValue(), "78b1ff" , "HEX changed from 78b13c -> 78b1ff: ");

		oColorPicker.destroy();
	});

	//Testcase 12a: Input a wrong Blue - value
	QUnit.test("Wrong data - BLUE changed to -20: ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oBlueField.setValue(-20);
		oColorPicker.oBlueField.fireChange({newValue:oColorPicker.oBlueField.getValue()});

		assert.equal(oColorPicker.oBlueField.getValue(), "0" , "BLUE manually changed to -20 => set to 0: ");

		oColorPicker.destroy();
	});

	QUnit.test("Wrong data - RED changed to 260: ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oRedField.setValue(260);
		oColorPicker.oRedField.fireChange({newValue:oColorPicker.oRedField.getValue()});

		assert.equal(oColorPicker.oRedField.getValue(), "255" , "RED manually changed to 260 => set to 255: ");

		oColorPicker.destroy();
	});

	QUnit.test("Wrong data - RED changed to -20: ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oRedField.setValue(-20);
		oColorPicker.oRedField.fireChange({newValue:oColorPicker.oRedField.getValue()});

		assert.equal(oColorPicker.oRedField.getValue(), "0" , "RED manually changed to -20 => set to 0: ");

		oColorPicker.destroy();
	});

	QUnit.test("Wrong data - GREEN changed to 260: ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oGreenField.setValue(260);
		oColorPicker.oGreenField.fireChange({newValue:oColorPicker.oGreenField.getValue()});

		assert.equal(oColorPicker.oGreenField.getValue(), "255" , "GREEN manually changed to 260 => set to 255: ");

		oColorPicker.destroy();
	});

	QUnit.test("Wrong data - GREEN changed to -20: ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oGreenField.setValue(-20);
		oColorPicker.oGreenField.fireChange({newValue:oColorPicker.oGreenField.getValue()});

		assert.equal(oColorPicker.oGreenField.getValue(), "0" , "GREEN manually changed to -20 => set to 0: ");

		oColorPicker.destroy();
	});

	//Testcase 12: Input a wrong S / V - value
	QUnit.test("Wrong data - SATURATION changed to 120 => R, G, B and HEX calculated: ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "#18a"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oSatField.setValue(120);
		oColorPicker.oSatField.fireChange({newValue:oColorPicker.oSatField.getValue()});

		assert.equal(oColorPicker.oRedField.getValue(), "0" , "RED changed from 17 -> 0: ");
		assert.equal(oColorPicker.oGreenField.getValue(), "148" , "GREEN changed from 136 -> 148: ");
		assert.equal(oColorPicker.oBlueField.getValue(), "189" , "BLUE not changed (189): ");
		assert.equal(oColorPicker.oHueField.getValue(), "193" , "HUE not changed (193): ");
		assert.equal(oColorPicker.oSatField.getValue(), "100" , "SATURATION manually changed to 120 => set to 100: ");
		assert.equal(oColorPicker.oLitField.getValue(), "37" , "LIGHTNESS not changed (37): ");
		assert.equal(oColorPicker.oHexField.getValue(), "0094bd" , "HEX changed from 1188aa -> 0094bd: ");

		oColorPicker.destroy();
	});

	//Testcase 12a: Input a wrong Saturation - value
	QUnit.test("Wrong data - SATURATION changed to -20: ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "#18a"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oSatField.setValue(-20);
		oColorPicker.oSatField.fireChange({newValue:oColorPicker.oSatField.getValue()});

		assert.equal(oColorPicker.oSatField.getValue(), "0" , "SATURATION manually changed to -20 => set to 0: ");

		oColorPicker.destroy();
	});

	//Testcase 13: Input a wrong HUE - value
	QUnit.test("Wrong data - HUE changed to -30 => other values calculated: ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "#7bffff"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oHueField.setValue(-30);
		oColorPicker.oHueField.fireChange({newValue:oColorPicker.oHueField.getValue()});

		assert.equal(oColorPicker.oRedField.getValue(), "255" , "RED changed from 123 -> 255: ");
		assert.equal(oColorPicker.oGreenField.getValue(), "122" , "GREEN changed from 255 -> 122: ");
		assert.equal(oColorPicker.oBlueField.getValue(), "122" , "BLUE changed from  255 -> 122: ");
		assert.equal(oColorPicker.oHueField.getValue(), "0" , "HUE manually changed to -30 => set to 0: ");
		assert.equal(oColorPicker.oSatField.getValue(), "100" , "SATURATION not changed (100): ");
		assert.equal(oColorPicker.oLitField.getValue(), "74" , "LIGHTNESS not changed (74): ");
		assert.equal(oColorPicker.oHexField.getValue(), "ff7a7a" , "HEX changed from 7bffff -> ff7a7a: ");

		oColorPicker.destroy();
	});

	//Testcase 13a: Input a wrong HUE - value
	QUnit.test("Wrong data - HUE changed to 370: ", function(assert) {
		var oColorPicker = createColorPicker({colorString: "#18a"});

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oHueField.setValue(370);
		oColorPicker.oHueField.fireChange({newValue:oColorPicker.oHueField.getValue()});

		assert.equal(oColorPicker.oHueField.getValue(), "360" , "SATURATION manually changed to 370 => set to 360: ");

		oColorPicker.destroy();
	});

	//Testcase: Input a wrong ALPHA - value
	QUnit.test("Wrong data - Alpha changed to -5: ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oAlphaField.setValue(-5);
		oColorPicker.oAlphaField.fireChange({newValue:oColorPicker.oAlphaField.getValue()});

		assert.equal(oColorPicker.oAlphaField.getValue(), "0" , "SATURATION manually changed to -5 => set to 0: ");

		oColorPicker.destroy();
	});

	//Testcase: Input a wrong ALPHA - value
	QUnit.test("Wrong data - Alpha changed to 2: ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.oAlphaField.setValue(2);
		oColorPicker.oAlphaField.fireChange({newValue:oColorPicker.oAlphaField.getValue()});

		assert.equal(oColorPicker.oAlphaField.getValue(), "1" , "SATURATION manually changed to 2 => set to 1: ");

		oColorPicker.destroy();
	});

	//Testcase 14: Set new color string (RGB-value)
	QUnit.test("New color string 'rgb(249,238,227)': ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.setColorString("rgb(249,238,227)").placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.setColorString("rgb(249,238,227)");

		assert.equal(oColorPicker.oRedField.getValue(), "249" , "RED set from color string to 249: ");
		assert.equal(oColorPicker.oGreenField.getValue(), "238" , "GREEN set from color string to 238: ");
		assert.equal(oColorPicker.oBlueField.getValue(), "227" , "BLUE set from color string to 227: ");

		oColorPicker.destroy();
	});

	//Testcase 14: Set new color string (RGBA-value)
	QUnit.test("New color string 'rgba(249,238,227,0.5)': ", function(assert) {
		var oColorPicker = createColorPicker();

		oColorPicker.setColorString("rgba(249,238,227,0.5)").placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oColorPicker.setColorString("rgba(249,238,227,0.5)");

		assert.equal(oColorPicker.oRedField.getValue(), "249" , "RED set from color string to 249: ");
		assert.equal(oColorPicker.oGreenField.getValue(), "238" , "GREEN set from color string to 238: ");
		assert.equal(oColorPicker.oBlueField.getValue(), "227" , "BLUE set from color string to 227: ");
		assert.equal(oColorPicker.oAlphaField.getValue(), "0.5" , "ALPHA set from color string to 0.5: ");

		oColorPicker.destroy();
	});

	/****************************************************
	* QUINIT TESTS MODULE 'RESULTS'
	*****************************************************/
	// Set a Test Module for module "Results"
	QUnit.module("Results");

	//Testcase 15: Results of named parameter
	QUnit.test("Result of Input Parameter 'lime': ", function(assert) {
		var colors = {};
		function handleColorPickerChange(oEvent) {
			colors = oEvent.getParameters();
		}
		var oColorPicker = createColorPicker();
			oColorPicker.attachChange(handleColorPickerChange);
			oColorPicker.setColorString("lime");

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), colors.r.toString(), "Value of RED: 0");
		assert.equal(oColorPicker.oGreenField.getValue(), colors.g.toString(), "Value of GREEN: 255");
		assert.equal(oColorPicker.oBlueField.getValue(), colors.b.toString(), "Value of BLUE: 0");
		assert.equal(oColorPicker.oHueField.getValue(), colors.h.toString(), "Value of HUE: 120");
		assert.equal(oColorPicker.oSatField.getValue(), colors.s.toString(), "Value of SATURATION: 100");
		assert.equal(oColorPicker.oLitField.getValue(), colors.l.toString(), "Value of LIGHTNESS: 50");
		assert.equal(oColorPicker.Color.hex, colors.hex , "Value of HEX: #00ff00");

		oColorPicker.destroy();
	});

	//Testcase 16: Results of wrong parameter
	QUnit.test("Result of wrong parameter set hsl(370,44,88): ", function(assert) {
		var colors = {};
		function handleColorPickerChange(oEvent) {
			colors = oEvent.getParameters();
		}
		var oColorPicker = createColorPicker();
			oColorPicker.attachChange(handleColorPickerChange);
			oColorPicker.setColorString("hsl(370,44,88)");

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), colors.r.toString() , "Value of RED: 255");
		assert.equal(oColorPicker.oGreenField.getValue(), colors.g.toString() , "Value of GREEN: 255");
		assert.equal(oColorPicker.oBlueField.getValue(), colors.b.toString() , "Value of BLUE: 255");
		assert.equal(oColorPicker.oHueField.getValue(), colors.h.toString() , "Value of HUE: 0");
		assert.equal(oColorPicker.oSatField.getValue(), colors.s.toString() , "Value of SATURATION: 0");
		assert.equal(oColorPicker.oLitField.getValue(), colors.l.toString() , "Value of LIGHTNESS: 100");
		assert.equal(oColorPicker.Color.hex, colors.hex , "Value of HEX: ffffff");

		oColorPicker.destroy();
	});


	/****************************************************
	* QUINIT TESTS MODULE 'EVENTS'
	*****************************************************/
	// Set a Test Module for module "Events"
	QUnit.module("Events");

	//Testcase 17: Mouse-Event of Slider
	QUnit.test("Mouse-Event: Click on Slider: ", function(assert) {
		var colors = {};
		function handleColorPickerChange(oEvent) {
			colors = oEvent.getParameters();
		}
		var oColorPicker = createColorPicker({id: "ColorPicker"});
			oColorPicker.attachChange(handleColorPickerChange);
			oColorPicker.setColorString("#18a");

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oHueField.getValue(), colors.h.toString() , "Value of HUE before mouse events: 193");
		qutils.triggerMouseEvent("ColorPicker-hSLD", "click", 166, 0, 0, 0 );
		assert.equal(oColorPicker.oHueField.getValue(), colors.h.toString() , "Value of HUE after mouse click 1: " + colors.h.toString());
		qutils.triggerMouseEvent("ColorPicker-hSLD", "click", 16, 0, 0, 0 );
		assert.equal(oColorPicker.oHueField.getValue(), colors.h.toString() , "Value of HUE after mouse click 2: " + colors.h.toString());
		qutils.triggerMouseEvent("ColorPicker-hSLD", "click", 250, 0, 0, 0 );
		assert.equal(oColorPicker.oHueField.getValue(), colors.h.toString() , "Value of HUE after mouse click 3: " + colors.h.toString());

		oColorPicker.destroy();
	});

	//Testcase 18: Mouse-Event of AlphaSlider
	QUnit.test("Mouse-Event: Click on Alpha Slider: ", function(assert) {
		var colors = {};
		function handleColorPickerChange(oEvent) {
			colors = oEvent.getParameters();
		}
		var oColorPicker = createColorPicker({id: "ColorPickerA"});
			oColorPicker.attachChange(handleColorPickerChange);
			oColorPicker.setColorString("#18a");

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oAlphaField.getValue(), colors.alpha.toString(), "Value of Alpha before mouse events: 1");
		qutils.triggerMouseEvent("ColorPickerA-aSLD", "click", 166, 0, 0, 0 );
		assert.equal(oColorPicker.oAlphaField.getValue(), colors.alpha.toString() , "Value of Alpha after mouse click 1: " + colors.alpha.toString());
		qutils.triggerMouseEvent("ColorPickerA-aSLD", "click", 16, 0, 0, 0 );
		assert.equal(oColorPicker.oHueField.getValue(), colors.h.toString() , "Value of Alpha after mouse click 2: " + colors.alpha.toString());
		qutils.triggerMouseEvent("ColorPickerA-aSLD", "click", 250, 0, 0, 0 );
		assert.equal(oColorPicker.oHueField.getValue(), colors.h.toString() , "Value of Alpha after mouse click 3: " + colors.alpha.toString());

		oColorPicker.destroy();
	});

	//Testcase 19: Mouse-Event of Colorpipcker-Box
	QUnit.test("Mouse-Event: Click in ColorPicker-Box: ", function(assert) {
		// Arrange
		var oColorPicker = createColorPicker({id: "ColorPicker2", colorString: "hsl(120,100%,75%)"}),
			oCPBox,
			cpBoxOffset,
			oCPBoxDomRef;

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oCPBox = oColorPicker.oCPBox;
		cpBoxOffset = oCPBox.$().offset();
		oCPBoxDomRef = oCPBox.getDomRef();

		// Assert
		assert.equal(oColorPicker.oSatField.getValue(), "100" , "SATURATION (before mouse events): 100");
		assert.equal(oColorPicker.oLitField.getValue(), "75" , "LIGHTNESS (before mouse events): 75");

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
		assert.equal(oColorPicker.oSatField.getValue(), "90" , "SATURATION (after mouse event 1): 90");
		assert.equal(oColorPicker.oLitField.getValue(), "9" , "LIGHTNESS (after mouse event 1): 9");

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
		assert.equal(oColorPicker.oSatField.getValue(), "68" , "SATURATION (after mouse event 2): 68");
		assert.equal(oColorPicker.oLitField.getValue(), "31" , "LIGHTNESS (after mouse event 2	): 31");

		oColorPicker.destroy();
	});

	//Testcase 20: Change evnt
	QUnit.test("ColorPicker change event", function(assert) {
		//Arrange
		var oSpy = this.spy();
		var oColorPicker = createColorPicker();
		oColorPicker.attachChange(oSpy);


		// System under test
		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		oColorPicker.setColorString("#18a");
		assert.strictEqual(oSpy.callCount, 1, "Chnage event was fired");

		// clean up
		oColorPicker.destroy();
	});

	//Testcase 21: LiveChange evnt
	QUnit.test("ColorPicker LiveChange event", function(assert) {
		//Arrange
		var oSpy = this.spy();
		var oColorPicker = createColorPicker();
		oColorPicker.attachLiveChange(oSpy);


		// System under test
		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		oColorPicker.setColorString("#18a");
		assert.strictEqual(oSpy.callCount, 1, "LiveChnage event was fired");

		// clean up
		oColorPicker.destroy();
	});

	//Testcase: LiveChange evnt
	QUnit.test("ColorPicker change event gets new color values", function(assert) {
		//Arrange
		var colors = {};
		function handleColorPickerChange(oEvent) {
			colors = oEvent.getParameters();
		}
		var oColorPicker = createColorPicker();
			oColorPicker.attachChange(handleColorPickerChange);
			oColorPicker.setColorString("red");

		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), colors.r.toString(), "Value of RED: 255");
		assert.equal(oColorPicker.oGreenField.getValue(), colors.g.toString(), "Value of GREEN: 0");
		assert.equal(oColorPicker.oBlueField.getValue(), colors.b.toString(), "Value of BLUE: 0");
		assert.equal(oColorPicker.oHueField.getValue(), colors.h.toString(), "Value of HUE: 0");
		assert.equal(oColorPicker.oSatField.getValue(), colors.s.toString(), "Value of SATURATION: 100");
		assert.equal(oColorPicker.oLitField.getValue(), colors.l.toString(), "Value of LIGHTNESS: 50");
		assert.equal(oColorPicker.Color.hex, colors.hex , "Value of HEX: #ff0000");

		oColorPicker.setColorString("lime");
		sap.ui.getCore().applyChanges();

		assert.equal(oColorPicker.oRedField.getValue(), colors.r.toString(), "Value of RED: 0");
		assert.equal(oColorPicker.oGreenField.getValue(), colors.g.toString(), "Value of GREEN: 255");
		assert.equal(oColorPicker.oBlueField.getValue(), colors.b.toString(), "Value of BLUE: 0");
		assert.equal(oColorPicker.oHueField.getValue(), colors.h.toString(), "Value of HUE: 120");
		assert.equal(oColorPicker.oSatField.getValue(), colors.s.toString(), "Value of SATURATION: 100");
		assert.equal(oColorPicker.oLitField.getValue(), colors.l.toString(), "Value of LIGHTNESS: 50");
		assert.equal(oColorPicker.Color.hex, colors.hex , "Value of HEX: #00ff00");

		// clean up
		oColorPicker.destroy();
	});


	QUnit.module("test isColor function e.g. test _parseColorString with bCheckOnly parameter set to true");

	QUnit.test("isColor test with named color parameter 'aquamarine'", function(assert) {
		//Arrange
		var oColorPicker = createColorPicker();

		// System under test
		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oColorPicker.isColor("aquamarine"), "'aquamarine' is a color");

		// clean up
		oColorPicker.destroy();
	});

	QUnit.test("isColor test with parameter 'dfggfdg'", function(assert) {
		//Arrange
		var oColorPicker = createColorPicker();

		// System under test
		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oColorPicker.isColor("dfggfdg"), "'dfggfdg' is not a color");

		// clean up
		oColorPicker.destroy();
	});

	QUnit.test("isColor test with parameter '000055'", function(assert) {
		//Arrange
		var oColorPicker = createColorPicker();

		// System under test
		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oColorPicker.isColor("000055"), "'000055' is a color");

		// clean up
		oColorPicker.destroy();
	});

	QUnit.test("isColor test with parameter '000055er'", function(assert) {
		//Arrange
		var oColorPicker = createColorPicker();

		// System under test
		oColorPicker.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oColorPicker.isColor("000055er"), "'000055er' is not a color");

		// clean up
		oColorPicker.destroy();
	});
});