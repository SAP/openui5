/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/RangeSlider",
	"sap/ui/thirdparty/jquery"
], function(qutils, createAndAppendDiv, RangeSlider, jQuery) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4", "uiArea5", "uiArea6", "uiArea7",
		"uiArea8", "uiArea9", "uiArea10", "uiArea11", "uiArea12", "uiArea13", "uiArea14"]);



	var oSlis = {};

	var initSli = function(idx, iWidth, iHeight, fMin, fMax, fVal, fVal2,
			fStep, bVisible, bEditable, iTotalUnits, bStepLabels, bVertical) {
		var sId = "oSli" + idx;
		var oSli = new RangeSlider(sId);
		if (iWidth != -1) {oSli.setWidth(iWidth);}
		if (iHeight != -1) {oSli.setHeight(iHeight);}
		if (fMin != -1) {oSli.setMin(fMin);}
		if (fMax != -1) {oSli.setMax(fMax);}
		if (fStep != -1) {oSli.setSmallStepWidth(fStep);}
		if (fVal != -1) {oSli.setValue(fVal);}
		if (fVal2 != -1) {oSli.setValue2(fVal2);}
		if (bVisible != -1) {oSli.setVisible(bVisible);}
		if (bEditable != -1) {oSli.setEditable(bEditable);}
		if (iTotalUnits != -1) {oSli.setTotalUnits(iTotalUnits);}
		if (bStepLabels != -1) {oSli.setStepLabels(bStepLabels);}
		if (bVertical != -1) {oSli.setVertical(bVertical);}

		oSli.placeAt("uiArea" + idx);
		oSlis[sId] = oSli;
	};

	initSli(1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1); //default values
	initSli(2, "512px", "", 10, 210, 100, 150, 5, true, true, 0, false, false); // with step-wide
	initSli(3, "512px", "", 10, 210, 100, 150, null, true, true, 5, false, false); // without step-wide (512px because so lenght of bar is 500px)
	initSli(4, "512px", "", 10, 210, 100, 150, 5, true, true, 8, true, false); // with step-wide, ticks & Texts
	initSli(5, "512px", "", 10, 210, 100, 150, 5, false, true, 0, false, false); // with step-wide INVISIBLE
	initSli(6, "512px", "", 10, 210, 100, 150, 5, true, false, 0, true, false); // with step-wide READ ONLY - no ticks but text -> also no text
	initSli(7, "", "512px", 10, 210, 100, 150, 5, true, true, 0, false, true); // with step-wide
	initSli(8, "", "512px", 10, 210, 100, 150, 0.1, true, true, 5, false, true); // without step-wide (512px because so lenght of bar is 500px)
	initSli(9, "", "512px", 10, 210, 100, 150, 5, true, true, 8, true, true); // with step-wide, ticks & Texts
	initSli(10, "", "512px", 10, 210, 100, 150, 5, false, true, 0, false, true); // with step-wide INVISIBLE
	initSli(11, "", "512px", 10, 210, 100, 150, 5, true, false, 0, true, true); // with step-wide READ ONLY - no ticks but text -> also no text
	initSli(12, "512px", "", 100, 200, -1, 90, 5, true, true, 0, false, false); // with right grip before min
	initSli(13, "512px", "", 100, 200, 210, -1, 5, true, true, 0, false, false); // with left grip after max
	initSli(14, "512px", "", 100, 200, 180, 170, 5, true, true, 0, false, false); // with right grip before left grip



	QUnit.module("Horizontal: Properties");

	QUnit.test("Default Values", function(assert) {
		var oSli = oSlis["oSli1"];
		assert.equal(oSli.getValue(), 50, "Default 'value':");
		assert.equal(oSli.getValue2(), 80, "Default 'value2':");
		assert.equal(oSli.getMin(), 0, "Default 'min':");
		assert.equal(oSli.getMax(), 100, "Default 'max':");
		assert.equal(oSli.getSmallStepWidth(), 0, "Default 'step':");
		assert.equal(oSli.getWidth(), "100%", "Default 'width':");
		assert.equal(oSli.getVisible(), true, "Default 'visible':");
		assert.equal(oSli.getEditable(), true, "Default 'editable':");
		assert.equal(oSli.getTotalUnits(), 0, "Default 'TotalUnits':");
		assert.equal(oSli.getStepLabels(), false, "Default 'StepLabels':");
	});

	QUnit.test("Custom Values", function(assert) {
		var oSli = oSlis["oSli4"];
		assert.equal(oSli.getValue(), 100, "Custom 'value':");
		assert.equal(oSli.getValue2(), 150, "Custom 'value2':");
		assert.equal(oSli.getMin(), 10, "Custom 'min':");
		assert.equal(oSli.getMax(), 210, "Custom 'max':");
		assert.equal(oSli.getSmallStepWidth(), 5, "Custom 'step':");
		assert.equal(oSli.getWidth(), "512px", "Custom 'width':");
		assert.equal(oSli.getVisible(), true, "Custom 'visible':");
		assert.equal(oSli.getEditable(), true, "Custom 'editable:");
		assert.equal(oSli.getTotalUnits(), 8, "Custom 'TotalUnits':");
		assert.equal(oSli.getStepLabels(), true, "Custom 'StepLabels':");
	});

	QUnit.test("invalid Values", function(assert) {
		var oSli = oSlis["oSli12"];
		assert.equal(oSli.getValue(), 100, "Corrected 'value':");
		assert.equal(oSli.getValue2(), 100, "Corrected 'value2':");
		oSli = oSlis["oSli13"];
		assert.equal(oSli.getValue(), 200, "Corrected 'value':");
		assert.equal(oSli.getValue2(), 200, "Corrected 'value2':");
		oSli = oSlis["oSli14"];
		assert.equal(oSli.getValue(), 180, "Corrected 'value':");
		assert.equal(oSli.getValue2(), 180, "Corrected 'value2':");
	});

	QUnit.test("Set Value", function(assert) {
		var oSli = oSlis["oSli2"];
		oSli.setValue(66);
		assert.equal(oSli.getValue(), 65, "Set Value with Step-wide: ");

		/* reduce position with 6px because of shift to middle of grip -> pssotion of 138 is now 132*/
		var oGrip = document.getElementById('oSli2-grip');
		assert.equal(oGrip.offsetLeft, 133, "Grip position after Set Value with Step-wide: ");

		oSli.setValue2(82);
		assert.equal(oSli.getValue2(), 80, "Set Value2 with Step-wide: ");

		/* reduce position with 6px because of shift to middle of grip -> pssotion of 138 is now 132*/
		oGrip = document.getElementById('oSli2-grip2');
		assert.equal(oGrip.offsetLeft, 170, "Grip position after Set Value2 with Step-wide: ");

		oSli.setValue2(50);
		assert.equal(oSli.getValue2(), 65, "Set Value2 with Step-wide smaller than value: ");

		/* reduce position with 6px because of shift to middle of grip -> pssotion of 138 is now 132*/
		oGrip = document.getElementById('oSli2-grip2');
		assert.equal(oGrip.offsetLeft, 133, "Grip position after Set smaller Value2 with Step-wide: ");

		oSli.setValue(80);
		assert.equal(oSli.getValue(), 80, "Set Value with Step-wide value larger value2: ");

		/* reduce position with 6px because of shift to middle of grip -> pssotion of 138 is now 132*/
		oGrip = document.getElementById('oSli2-grip2');
		assert.equal(oGrip.offsetLeft, 133, "Grip position after Set larger Value with Step-wide: ");

		oSli = oSlis["oSli3"];
		oSli.setValue(66);
		assert.equal(oSli.getValue(), 66, "Set Value without Step-wide: ");

		oGrip = document.getElementById('oSli3-grip');
		assert.equal(oGrip.offsetLeft, 135, "Grip position after Set Value without Step-wide: ");
	});

	QUnit.module("Horizontal: Interaction");

	QUnit.test("Keyboard with Step", function(assert) {
		var oSli = oSlis["oSli2"];
		var oGrip = document.getElementById('oSli2-grip');
		var oGrip2 = document.getElementById('oSli2-grip2');
		jQuery("#oSli2").trigger("focus");
		oSli.setValue2(200);
		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli2-grip", "mousedown", 1, 1);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli2", "ARROW_RIGHT");
		assert.equal(oSli.getValue(), 110, "Value after keyboard right Arrow with step-wide:");

		assert.equal(oGrip.offsetLeft, 245, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_LEFT");
		qutils.triggerKeyboardEvent("oSli2", "ARROW_LEFT");
		assert.equal(oSli.getValue(), 90, "Value after keyboard left Arrow with step-wide:");

		assert.equal(oGrip.offsetLeft, 195, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_UP");
		assert.equal(oSli.getValue(), 105, "Value after keyboard up Arrow with step-wide:");

		assert.equal(oGrip.offsetLeft, 233, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_DOWN");
		assert.equal(oSli.getValue(), 95, "Value after keyboard down Arrow with step-wide:");

		assert.equal(oGrip.offsetLeft, 208, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli2", "NUMPAD_PLUS");
		assert.equal(oSli.getValue(), 105, "Value after keyboard '+' with step-wide:");

		assert.equal(oGrip.offsetLeft, 233, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli2", "NUMPAD_MINUS");
		assert.equal(oSli.getValue(), 95, "Value after keyboard '-' with step-wide:");

		assert.equal(oGrip.offsetLeft, 208, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue(), 80, "Value after keyboard down arrow + Ctrl with step-wide:");

		assert.equal(oGrip.offsetLeft, 170, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue(), 120, "Value after keyboard up arrow + Ctrl with step-wide:");

		assert.equal(oGrip.offsetLeft, 270, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli2", "HOME");
		assert.equal(oSli.getValue(), 10, "Value after keyboard home with step-wide:");

		assert.equal(oGrip.offsetLeft, -5, "Grip position after above change: ");

		qutils.triggerKeyboardEvent("oSli2", "HOME");
		qutils.triggerKeyboardEvent("oSli2", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli2", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("oSli2", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue(), 30, "Value after keyboard multible keys with step-wide:");

		assert.equal(oGrip.offsetLeft, 45, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerMouseEvent("oSli2-grip2", "mousedown", 1, 1);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli2", "ARROW_RIGHT");
		assert.equal(oSli.getValue2(), 210, "Value after keyboard right Arrow with step-wide:");

		assert.equal(oGrip2.offsetLeft, 495, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_LEFT");
		qutils.triggerKeyboardEvent("oSli2", "ARROW_LEFT");
		assert.equal(oSli.getValue2(), 190, "Value after keyboard left Arrow with step-wide:");

		assert.equal(oGrip2.offsetLeft, 445, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_UP");
		assert.equal(oSli.getValue2(), 205, "Value after keyboard up Arrow with step-wide:");

		assert.equal(oGrip2.offsetLeft, 483, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_DOWN");
		assert.equal(oSli.getValue2(), 195, "Value after keyboard down Arrow with step-wide:");

		assert.equal(oGrip2.offsetLeft, 458, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli2", "NUMPAD_PLUS");
		assert.equal(oSli.getValue2(), 205, "Value after keyboard '+' with step-wide:");

		assert.equal(oGrip2.offsetLeft, 483, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli2", "NUMPAD_MINUS");
		assert.equal(oSli.getValue2(), 195, "Value after keyboard '-' with step-wide:");

		assert.equal(oGrip2.offsetLeft, 458, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue2(), 180, "Value after keyboard down arrow + Ctrl with step-wide:");

		assert.equal(oGrip2.offsetLeft, 420, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli2", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue2(), 210, "Value after keyboard up arrow + Ctrl with step-wide:");

		assert.equal(oGrip2.offsetLeft, 495, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli2", "END");
		assert.equal(oSli.getValue2(), 210, "Value after keyboard end with step-wide:");

		assert.equal(oGrip2.offsetLeft, 495, "Grip position after above change: ");

		qutils.triggerKeyboardEvent("oSli2", "END");
		qutils.triggerKeyboardEvent("oSli2", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli2", "ARROW_UP");
		qutils.triggerKeyboardEvent("oSli2", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue2(), 190, "Value after keyboard multible keys with step-wide:");

		assert.equal(oGrip2.offsetLeft, 445, "Grip position after above change: ");

	});

	QUnit.test("Keyboard without Step", function(assert) {
		var oSli = oSlis["oSli3"];
		var oGrip = document.getElementById('oSli3-grip');
		var oGrip2 = document.getElementById('oSli3-grip2');
		jQuery("#oSli3").trigger("focus");
		oSli.setValue2(200);
		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli3-grip", "mousedown", 1);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_RIGHT");
		assert.equal(oSli.getValue(), 100.4, "Value after keyboard right Arrow without step-wide:");

		assert.equal(oGrip.offsetLeft, 221, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_LEFT");
		assert.equal(oSli.getValue(), 99.6, "Value after keyboard left Arrow without step-wide:");

		assert.equal(oGrip.offsetLeft, 219, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_UP");
		assert.equal(oSli.getValue(), 100.4, "Value after keyboard up Arrow without step-wide:");

		assert.equal(oGrip.offsetLeft, 221, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_DOWN");
		assert.equal(oSli.getValue(), 99.6, "Value after keyboard down Arrow without step-wide:");

		assert.equal(oGrip.offsetLeft, 219, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli3", "NUMPAD_PLUS");
		assert.equal(oSli.getValue(), 100.4, "Value after keyboard '+' without step-wide:");

		assert.equal(oGrip.offsetLeft, 221, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli3", "NUMPAD_MINUS");
		assert.equal(oSli.getValue(), 99.6, "Value after keyboard '-' without step-wide:");

		assert.equal(oGrip.offsetLeft, 219, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue(), 60, "Value after keyboard down arrow + Ctrl without step-wide:");

		assert.equal(oGrip.offsetLeft, 120, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue(), 140, "Value after keyboard up arrow + Ctrl without step-wide:");

		assert.equal(oGrip.offsetLeft, 320, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli3", "HOME");
		assert.equal(oSli.getValue(), 10, "Value after keyboard home without step-wide:");

		assert.equal(oGrip.offsetLeft, -5, "Grip position after above change: ");

		qutils.triggerKeyboardEvent("oSli3", "HOME");
		qutils.triggerKeyboardEvent("oSli3", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli3", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("oSli3", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue(), 50, "Value after keyboard multible keys without step-wide:");

		assert.equal(oGrip.offsetLeft, 95, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerMouseEvent("oSli3-grip2", "mousedown", 1, 1);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_RIGHT");
		assert.equal(oSli.getValue2(), 200.4, "Value after keyboard right Arrow without step-wide:");

		assert.equal(oGrip2.offsetLeft, 471, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_LEFT");
		assert.equal(oSli.getValue2(), 199.6, "Value after keyboard left Arrow without step-wide:");

		assert.equal(oGrip2.offsetLeft, 469, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_UP");
		assert.equal(oSli.getValue2(), 200.4, "Value after keyboard up Arrow without step-wide:");

		assert.equal(oGrip2.offsetLeft, 471, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_DOWN");
		assert.equal(oSli.getValue2(), 199.6, "Value after keyboard down Arrow without step-wide:");

		assert.equal(oGrip2.offsetLeft, 469, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli3", "NUMPAD_PLUS");
		assert.equal(oSli.getValue2(), 200.4, "Value after keyboard '+' without step-wide:");

		assert.equal(oGrip2.offsetLeft, 471, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli3", "NUMPAD_MINUS");
		assert.equal(oSli.getValue2(), 199.6, "Value after keyboard '-' without step-wide:");

		assert.equal(oGrip2.offsetLeft, 469, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue2(), 160, "Value after keyboard down arrow + Ctrl without step-wide:");

		assert.equal(oGrip2.offsetLeft, 370, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli3", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue2(), 210, "Value after keyboard up arrow + Ctrl without step-wide:");

		assert.equal(oGrip2.offsetLeft, 495, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli3", "END");
		assert.equal(oSli.getValue2(), 210, "Value after keyboard end without step-wide:");

		assert.equal(oGrip2.offsetLeft, 495, "Grip position after above change: ");

		qutils.triggerKeyboardEvent("oSli3", "END");
		qutils.triggerKeyboardEvent("oSli3", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli3", "ARROW_UP");
		qutils.triggerKeyboardEvent("oSli3", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue2(), 170, "Value after keyboard multible keys without step-wide:");

		assert.equal(oGrip2.offsetLeft, 395, "Grip position after above change: ");
	});

	QUnit.test("Keyboard with Read Only", function(assert) {
		var oSli = oSlis["oSli6"];
		var oGrip = document.getElementById('oSli6-grip');
		var oGrip2 = document.getElementById('oSli6-grip2');
		jQuery("#oSli6").trigger("focus");
		oSli.setValue2(200);
		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli6-grip", "mousedown", 1);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_RIGHT");
		assert.equal(oSli.getValue(), 100, "Value after keyboard right Arrow on read only:");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_LEFT");
		assert.equal(oSli.getValue(), 100, "Value after keyboard left Arrow on read only:");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_UP");
		assert.equal(oSli.getValue(), 100, "Value after keyboard up Arrow on read only:");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_DOWN");
		assert.equal(oSli.getValue(), 100, "Value after keyboard down Arrow on read only:");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli6", "NUMPAD_PLUS");
		assert.equal(oSli.getValue(), 100, "Value after keyboard '+' on read only:");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli6", "NUMPAD_MINUS");
		assert.equal(oSli.getValue(), 100, "Value after keyboard '-' on read only:");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue(), 100, "Value after keyboard down arrow + Ctrl on read only:");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue(), 100, "Value after keyboard up arrow + Ctrl on read only:");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli6", "HOME");
		assert.equal(oSli.getValue(), 100, "Value after keyboard home on read only:");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli6", "END");
		assert.equal(oSli.getValue(), 100, "Value after keyboard end on read only:");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli6-grip2", "mousedown", 1);
		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_RIGHT");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard right Arrow on read only:");

		assert.equal(oGrip2.offsetLeft, 473, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_LEFT");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard left Arrow on read only:");

		assert.equal(oGrip2.offsetLeft, 473, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_UP");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard up Arrow on read only:");

		assert.equal(oGrip2.offsetLeft, 473, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_DOWN");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard down Arrow on read only:");

		assert.equal(oGrip2.offsetLeft, 473, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli6", "NUMPAD_PLUS");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard '+' on read only:");

		assert.equal(oGrip2.offsetLeft, 473, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli6", "NUMPAD_MINUS");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard '-' on read only:");

		assert.equal(oGrip2.offsetLeft, 473, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue2(), 200, "Value after keyboard down arrow + Ctrl on read only:");

		assert.equal(oGrip2.offsetLeft, 473, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli6", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue2(), 200, "Value after keyboard up arrow + Ctrl on read only:");

		assert.equal(oGrip2.offsetLeft, 473, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli6", "HOME");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard home on read only:");

		assert.equal(oGrip2.offsetLeft, 473, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli6", "END");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard end on read only:");

		assert.equal(oGrip2.offsetLeft, 473, "Grip position after above change: ");

	});

	QUnit.test("Click with Step", function(assert) {
		var oSli = oSlis["oSli2"];
		var oGrip = document.getElementById('oSli2-grip');
		var oGrip2 = document.getElementById('oSli2-grip2');
		qutils.triggerMouseEvent("oSli2", "click", 117, 1);
		assert.equal(oSli.getValue(), 55, "Value after click on control (with spep-wide):");
		assert.equal(oSli.getValue2(), 190, "Value after click on control (with spep-wide):");

		assert.equal(oGrip.offsetLeft, 108, "Grip position after above change: ");
		assert.equal(oGrip2.offsetLeft, 445, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli2-bar", "click", 55, 2);
		assert.equal(oSli.getValue(), 30, "Value after click on bar (with spep-wide):");
		assert.equal(oSli.getValue2(), 190, "Value after click on bar (with spep-wide):");

		assert.equal(oGrip.offsetLeft, 45, "Grip position after above change: ");
		assert.equal(oGrip2.offsetLeft, 445, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli2-left", "click", 1, 1);
		assert.equal(oSli.getValue(), 10, "Value after click on left end (with spep-wide):");
		assert.equal(oSli.getValue2(), 190, "Value after click on left end (with spep-wide):");

		assert.equal(oGrip.offsetLeft, -5, "Grip position after above change: ");
		assert.equal(oGrip2.offsetLeft, 445, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli2-right", "click", 505, 2);
		assert.equal(oSli.getValue(), 10, "Value after click on right end (with spep-wide):");
		assert.equal(oSli.getValue2(), 210, "Value after click on right end (with spep-wide):");

		assert.equal(oGrip.offsetLeft, -5, "Grip position after above change: ");
		assert.equal(oGrip2.offsetLeft, 495, "Grip position after above change: ");

	});

	QUnit.test("Click without Step", function(assert) {
		var oSli = oSlis["oSli3"];
		var oGrip = document.getElementById('oSli3-grip');
		var fValueChange = -1;
		oSli.attachChange(function(oEvent) {
			fValueChange = oEvent.getParameter("value");
		});
		qutils.triggerMouseEvent("oSli3", "click", 116, 1);
		assert.equal(oSli.getValue(), 54, "Value after click on control (without spep-wide):");
		assert.equal(fValueChange, 54, "Change event value after click on control (without spep-wide):");

		assert.equal(oGrip.offsetLeft, 105, "Grip position after above change: ");
		fValueChange = -1;

		qutils.triggerMouseEvent("oSli3-bar", "click", 55, 2);
		assert.equal(oSli.getValue(), 32, "Value after click on bar (without spep-wide):");
		assert.equal(fValueChange, 32, "Change event value after click on bar (without spep-wide):");

		assert.equal(oGrip.offsetLeft, 50, "Grip position after above change: ");

		fValueChange = -1;
		qutils.triggerMouseEvent("oSli3-left", "click", 1, 1);
		assert.equal(oSli.getValue(), 10, "Value after click on left end (without spep-wide):");
		assert.equal(fValueChange, 10, "Change event value after click on left end (without spep-wide):");

		assert.equal(oGrip.offsetLeft, -5, "Grip position after above change: ");

		fValueChange = -1;
		qutils.triggerMouseEvent("oSli3-right", "click", 505, 2);
		assert.equal(oSli.getValue(), 10, "Value after click on right end (without spep-wide):");
		assert.equal(fValueChange, 10, "Change event value after click on right end (without spep-wide):");

		assert.equal(oGrip.offsetLeft, -5, "Grip position after above change: ");

		fValueChange = -1;
		qutils.triggerMouseEvent("oSli3-tick4", "click", 1, 2);
		assert.equal(oSli.getValue(), 10, "Value after click on tick4 (without spep-wide):");
		assert.equal(fValueChange, 10, "Change event value after click on tick4 (without spep-wide):");

		assert.equal(oGrip.offsetLeft, -5, "Grip position after above change: ");
		oSli.detachChange();
	});

	QUnit.test("Click Read only", function(assert) {
		var oSli = oSlis["oSli6"];
		var oGrip = document.getElementById('oSli6-grip');
		var fValueChange = -1;
		oSli.attachChange(function(oEvent) {
			fValueChange = oEvent.getParameter("value");
		});
		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli6", "click", 117, 1);
		assert.equal(oSli.getValue(), 100, "Value after click on control (read only):");
		assert.equal(fValueChange, -1, "Change event value after click on control (read only):");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli6-bar", "click", 55, 2);
		assert.equal(oSli.getValue(), 100, "Value after click on bar (read only):");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli6-left", "click", 1, 1);
		assert.equal(oSli.getValue(), 100, "Value after click on left end (read only):");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli6-right", "click", 505, 2);
		assert.equal(oSli.getValue(), 100, "Value after click on right end (read only):");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli6-tick6", "click", 1, 2);
		assert.equal(oSli.getValue(), 100, "Value after click on tick6 (read only):");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");

		oSli.detachChange();
	});

	QUnit.test("Mouse Move", function(assert) {
		// Simulate mousemove using "not real" coordinates. Works, because only difference is used to calculate position
		var oSli = oSlis["oSli2"];
		var oGrip = document.getElementById('oSli2-grip');

		var fValueChange = -1, fValueLiveChange = -1;
		oSli.attachChange(function(oEvent) {
			fValueChange = oEvent.getParameter("value");
		});
		oSli.attachLiveChange(function(oEvent) {
			fValueLiveChange = oEvent.getParameter("value");
		});

		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli2-grip", "mousedown", 1, 1, 100, 100);
		qutils.triggerMouseEvent("oSli2", "mousemove", 1, 1, 105, 100);
		assert.equal(fValueLiveChange, -1, "liveChange event value after 1. mousemove on control (with spep-wide):");
		assert.equal(fValueChange, -1, "Change event value after 1. mousemove on control (with spep-wide):");
		qutils.triggerMouseEvent("oSli2", "mousemove", 1, 1, 110, 100);
		assert.equal(fValueLiveChange, 105, "liveChange event value after 2. mousemove on control (with spep-wide):");
		qutils.triggerMouseEvent("oSli2-grip", "mouseup", 1, 1);
		assert.equal(oSli.getValue(), 105, "Value after mousemove on control (with spep-wide):");
		assert.equal(fValueChange, 105, "Change event value after mouseup on control (with spep-wide):");

		assert.equal(oGrip.offsetLeft, 233, "Grip position after above change: ");
		oSli.detachChange();
		oSli.detachLiveChange();

		oSli = oSlis["oSli3"];
		oGrip = document.getElementById('oSli3-grip');
		fValueChange = -1;
		fValueLiveChange = -1;
		oSli.attachChange(function(oEvent) {
			fValueChange = oEvent.getParameter("value");
		});
		oSli.attachLiveChange(function(oEvent) {
			fValueLiveChange = oEvent.getParameter("value");
		});
		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli3-grip", "mousedown", 1, 1, 100, 100);
		qutils.triggerMouseEvent("oSli3", "mousemove", 1, 1, 105, 100);
		assert.equal(fValueLiveChange, 102, "liveChange event value after 1. mousemove on control (without spep-wide):");
		assert.equal(fValueChange, -1, "Change event value after 1. mousemove on control (without spep-wide):");
		qutils.triggerMouseEvent("oSli3", "mousemove", 1, 1, 110, 100);
		assert.equal(fValueLiveChange, 104, "liveChange event value after 1. mousemove on control (without spep-wide):");
		qutils.triggerMouseEvent("oSli3-grip", "mouseup", 1, 1);
		assert.equal(oSli.getValue(), 104, "Value after mousemove on control (without spep-wide):");
		assert.equal(fValueChange, 104, "Change event value after mouseup on control (without spep-wide):");

		assert.equal(oGrip.offsetLeft, 230, "Grip position after above change: ");
		oSli.detachChange();
		oSli.detachLiveChange();

		oSli = oSlis["oSli6"];
		oGrip = document.getElementById('oSli6-grip');
		fValueChange = -1;
		fValueLiveChange = -1;
		oSli.attachChange(function(oEvent) {
			fValueChange = oEvent.getParameter("value");
		});
		oSli.attachLiveChange(function(oEvent) {
			fValueLiveChange = oEvent.getParameter("value");
		});
		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli6-grip", "mousedown", 1, 1, 100, 100);
		qutils.triggerMouseEvent("oSli6", "mousemove", 1, 1, 105, 100);
		assert.equal(fValueLiveChange, -1, "liveChange event value after 1. mousemove on control (read only):");
		qutils.triggerMouseEvent("oSli6", "mousemove", 1, 1, 110, 100);
		assert.equal(fValueLiveChange, -1, "liveChange event value after 2. mousemove on control (read only):");
		qutils.triggerMouseEvent("oSli6-grip", "mouseup", 1, 1);
		assert.equal(oSli.getValue(), 100, "Value after mousemove on control (read only):");
		assert.equal(fValueChange, -1, "Change event value after mouseup on control (read only):");

		assert.equal(oGrip.offsetLeft, 223, "Grip position after above change: ");
		oSli.detachChange();
		oSli.detachLiveChange();

		oSli = oSlis["oSli2"];

		fValueChange = -1;
		fValueLiveChange = -1;
		oSli.attachChange(function(oEvent) {
			fValueChange = oEvent.getParameter("value2");
		});
		oSli.attachLiveChange(function(oEvent) {
			fValueLiveChange = oEvent.getParameter("value2");
		});

		oSli.setValue2(200);
		oGrip = document.getElementById('oSli2-grip2');
		qutils.triggerMouseEvent("oSli2-grip2", "mousedown", 1, 1, 200, 100);
		qutils.triggerMouseEvent("oSli2", "mousemove", 1, 1, 195, 100);
		assert.equal(fValueLiveChange, -1, "liveChange event value after 1. mousemove on control (with spep-wide):");
		assert.equal(fValueChange, -1, "Change event value after 1. mousemove on control (with spep-wide):");
		qutils.triggerMouseEvent("oSli2", "mousemove", 1, 1, 190, 100);
		assert.equal(fValueLiveChange, 195, "liveChange event value after 2. mousemove on control (with spep-wide):");
		qutils.triggerMouseEvent("oSli2-grip2", "mouseup", 1, 1);
		assert.equal(oSli.getValue2(), 195, "Value after mousemove on control (with spep-wide):");
		assert.equal(fValueChange, 195, "Change event value after mouseup on control (with spep-wide):");

		assert.equal(oGrip.offsetLeft, 458, "Grip position after above change: ");
		oSli.detachChange();
		oSli.detachLiveChange();

		oSli = oSlis["oSli3"];
		oGrip = document.getElementById('oSli3-grip2');
		fValueChange = -1;
		fValueLiveChange = -1;
		oSli.attachChange(function(oEvent) {
			fValueChange = oEvent.getParameter("value2");
		});
		oSli.attachLiveChange(function(oEvent) {
			fValueLiveChange = oEvent.getParameter("value2");
		});
		oSli.setValue2(200);
		qutils.triggerMouseEvent("oSli3-grip2", "mousedown", 1, 1, 200, 100);
		qutils.triggerMouseEvent("oSli3", "mousemove", 1, 1, 195, 100);
		assert.equal(fValueLiveChange, 198, "liveChange event value after 1. mousemove on control (without spep-wide):");
		assert.equal(fValueChange, -1, "Change event value after 1. mousemove on control (without spep-wide):");
		qutils.triggerMouseEvent("oSli3", "mousemove", 1, 1, 190, 100);
		assert.equal(fValueLiveChange, 196, "liveChange event value after 1. mousemove on control (without spep-wide):");
		qutils.triggerMouseEvent("oSli3-grip2", "mouseup", 1, 1);
		assert.equal(oSli.getValue2(), 196, "Value after mousemove on control (without spep-wide):");
		assert.equal(fValueChange, 196, "Change event value after mouseup on control (without spep-wide):");

		assert.equal(oGrip.offsetLeft, 460, "Grip position after above change: ");
		oSli.detachChange();
		oSli.detachLiveChange();

		oSli = oSlis["oSli6"];
		oGrip = document.getElementById('oSli6-grip2');
		fValueChange = -1;
		fValueLiveChange = -1;
		oSli.attachChange(function(oEvent) {
			fValueChange = oEvent.getParameter("value2");
		});
		oSli.attachLiveChange(function(oEvent) {
			fValueLiveChange = oEvent.getParameter("value2");
		});
		oSli.setValue2(200);
		qutils.triggerMouseEvent("oSli6-grip2", "mousedown", 1, 1, 100, 100);
		qutils.triggerMouseEvent("oSli6", "mousemove", 1, 1, 105, 100);
		assert.equal(fValueLiveChange, -1, "liveChange event value after 1. mousemove on control (read only):");
		qutils.triggerMouseEvent("oSli6", "mousemove", 1, 1, 110, 100);
		assert.equal(fValueLiveChange, -1, "liveChange event value after 2. mousemove on control (read only):");
		qutils.triggerMouseEvent("oSli6-grip2", "mouseup", 1, 1);
		assert.equal(oSli.getValue2(), 200, "Value after mousemove on control (read only):");
		assert.equal(fValueChange, -1, "Change event value after mouseup on control (read only):");

		assert.equal(oGrip.offsetLeft, 473, "Grip position after above change: ");
		oSli.detachChange();
		oSli.detachLiveChange();

	});

	QUnit.module("Horizontal: Visual Appearence");

	QUnit.test("Visibility", function(assert) {
		assert.ok(jQuery("#oSli3").get(0), "Visible: expected defined");
		assert.equal(jQuery("#oSli5").get(0), undefined, "Invisible:");

		var oTick = document.getElementById('oSli2-tick2');
		assert.equal(oTick, null, "No Ticks:");
		var oText = document.getElementById('oSli2-text0');
		assert.equal(oText, null, "No left Text:");
		oText = document.getElementById('oSli2-text1');
		assert.equal(oText, null, "No second Text:");

		oTick = null;
		oText = null;
		oTick = document.getElementById('oSli3-tick3');
		assert.ok(oTick, "Ticks visible: expected defined");
		assert.equal(oTick.offsetLeft, 299, "3. tick position:");
		oText = document.getElementById('oSli3-text0');
		assert.equal(oText, null, "No left Text:");
		oText = document.getElementById('oSli3-text1');
		assert.equal(oText, null, "No second Text:");

		oTick = null;
		oText = null;
		oTick = document.getElementById('oSli4-tick4');
		assert.ok(oTick, "Ticks visible: expected defined");
		assert.equal(oTick.offsetLeft, 249, "Middle tick position:");
		oText = document.getElementById('oSli4-text0');
		assert.ok(oText, "left text visible: expected defined");
		assert.equal(jQuery(oText).text(), "10", "left text:");
		oText = null;
		oText = document.getElementById('oSli4-text4');
		assert.ok(oText, "middle text visible: expected defined");
		assert.equal(jQuery(oText).text(), "110", "middle text:");
		oText = null;
		oText = document.getElementById('oSli4-text8');
		assert.equal(jQuery(oText).text(), "210", "right text:");
		assert.ok(oText, "right text visible: expected defined");
	});

	QUnit.module("Vertical: Properties");

	QUnit.test("Set Value", function(assert) {
		var oSli = oSlis["oSli7"];
		oSli.setValue(66);
		assert.equal(oSli.getValue(), 65, "Set Value with Step-wide: ");

		/* reduce position with 6px because of shift to middle of grip -> pssotion of 138 is now 132*/
		var oGrip = document.getElementById('oSli7-grip');
		assert.equal(oGrip.offsetTop, 358, "Grip position after Set Value with Step-wide: ");

		oSli.setValue2(82);
		assert.equal(oSli.getValue2(), 80, "Set Value2 with Step-wide: ");

		/* reduce position with 6px because of shift to middle of grip -> pssotion of 138 is now 132*/
		oGrip = document.getElementById('oSli7-grip2');
		assert.equal(oGrip.offsetTop, 320, "Grip position after Set Value2 with Step-wide: ");

		oSli.setValue2(50);
		assert.equal(oSli.getValue2(), 65, "Set Value2 with Step-wide smaller than value: ");

		/* reduce position with 6px because of shift to middle of grip -> pssotion of 138 is now 132*/
		oGrip = document.getElementById('oSli7-grip2');
		assert.equal(oGrip.offsetTop, 358, "Grip position after Set smaller Value2 with Step-wide: ");

		oSli.setValue(80);
		assert.equal(oSli.getValue(), 80, "Set Value with Step-wide value larger value2: ");

		/* reduce position with 6px because of shift to middle of grip -> pssotion of 138 is now 132*/
		oGrip = document.getElementById('oSli7-grip2');
		assert.equal(oGrip.offsetTop, 358, "Grip position after Set larger Value with Step-wide: ");

		oSli = oSlis["oSli8"];
		oSli.setValue(66);
		assert.equal(oSli.getValue(), 66, "Set Value without Step-wide: ");

		oGrip = document.getElementById('oSli8-grip');
		assert.equal(oGrip.offsetTop, 355, "Grip position after Set Value without Step-wide: ");
	});

	QUnit.module("Vertical: Interaction");

	QUnit.test("Keyboard with Step", function(assert) {
		var oSli = oSlis["oSli7"];
		var oGrip = document.getElementById('oSli7-grip');
		var oGrip2 = document.getElementById('oSli7-grip2');
		jQuery("#oSli7").trigger("focus");
		oSli.setValue2(200);
		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli7-grip", "mousedown", 1, 1);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli7", "ARROW_RIGHT");
		assert.equal(oSli.getValue(), 110, "Value after keyboard right Arrow with step-wide:");

		assert.equal(oGrip.offsetTop, 245, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_LEFT");
		qutils.triggerKeyboardEvent("oSli7", "ARROW_LEFT");
		assert.equal(oSli.getValue(), 90, "Value after keyboard left Arrow with step-wide:");

		assert.equal(oGrip.offsetTop, 295, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_UP");
		assert.equal(oSli.getValue(), 105, "Value after keyboard up Arrow with step-wide:");

		assert.equal(oGrip.offsetTop, 258, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_DOWN");
		assert.equal(oSli.getValue(), 95, "Value after keyboard down Arrow with step-wide:");

		assert.equal(oGrip.offsetTop, 283, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli7", "NUMPAD_PLUS");
		assert.equal(oSli.getValue(), 105, "Value after keyboard '+' with step-wide:");

		assert.equal(oGrip.offsetTop, 258, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli7", "NUMPAD_MINUS");
		assert.equal(oSli.getValue(), 95, "Value after keyboard '-' with step-wide:");

		assert.equal(oGrip.offsetTop, 283, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue(), 80, "Value after keyboard down arrow + Ctrl with step-wide:");

		assert.equal(oGrip.offsetTop, 320, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue(), 120, "Value after keyboard up arrow + Ctrl with step-wide:");

		assert.equal(oGrip.offsetTop, 220, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli7", "HOME");
		assert.equal(oSli.getValue(), 10, "Value after keyboard home with step-wide:");

		assert.equal(oGrip.offsetTop, 495, "Grip position after above change: ");

		qutils.triggerKeyboardEvent("oSli7", "HOME");
		qutils.triggerKeyboardEvent("oSli7", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli7", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("oSli7", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue(), 30, "Value after keyboard multible keys with step-wide:");

		assert.equal(oGrip.offsetTop, 445, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerMouseEvent("oSli7-grip2", "mousedown", 1, 1);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli7", "ARROW_RIGHT");
		assert.equal(oSli.getValue2(), 210, "Value after keyboard right Arrow with step-wide:");

		assert.equal(oGrip2.offsetTop, -5, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_LEFT");
		qutils.triggerKeyboardEvent("oSli7", "ARROW_LEFT");
		assert.equal(oSli.getValue2(), 190, "Value after keyboard left Arrow with step-wide:");

		assert.equal(oGrip2.offsetTop, 45, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_UP");
		assert.equal(oSli.getValue2(), 205, "Value after keyboard up Arrow with step-wide:");

		assert.equal(oGrip2.offsetTop, 8, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_DOWN");
		assert.equal(oSli.getValue2(), 195, "Value after keyboard down Arrow with step-wide:");

		assert.equal(oGrip2.offsetTop, 33, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli7", "NUMPAD_PLUS");
		assert.equal(oSli.getValue2(), 205, "Value after keyboard '+' with step-wide:");

		assert.equal(oGrip2.offsetTop, 8, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli7", "NUMPAD_MINUS");
		assert.equal(oSli.getValue2(), 195, "Value after keyboard '-' with step-wide:");

		assert.equal(oGrip2.offsetTop, 33, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue2(), 180, "Value after keyboard down arrow + Ctrl with step-wide:");

		assert.equal(oGrip2.offsetTop, 70, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli7", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue2(), 210, "Value after keyboard up arrow + Ctrl with step-wide:");

		assert.equal(oGrip2.offsetTop, -5, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli7", "END");
		assert.equal(oSli.getValue2(), 210, "Value after keyboard end with step-wide:");

		assert.equal(oGrip2.offsetTop, -5, "Grip position after above change: ");

		qutils.triggerKeyboardEvent("oSli7", "END");
		qutils.triggerKeyboardEvent("oSli7", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli7", "ARROW_UP");
		qutils.triggerKeyboardEvent("oSli7", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue2(), 190, "Value after keyboard multible keys with step-wide:");

		assert.equal(oGrip2.offsetTop, 45, "Grip position after above change: ");

	});

	QUnit.test("Keyboard without Step", function(assert) {
		var oSli = oSlis["oSli8"];
		var oGrip = document.getElementById('oSli8-grip');
		var oGrip2 = document.getElementById('oSli8-grip2');
		jQuery("#oSli8").trigger("focus");
		oSli.setValue2(200);
		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli8-grip", "mousedown", 1);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_RIGHT");
		assert.equal(oSli.getValue(), 100.4, "Value after keyboard right Arrow without step-wide:");

		assert.equal(oGrip.offsetTop, 269, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_LEFT");
		assert.equal(oSli.getValue(), 99.6, "Value after keyboard left Arrow without step-wide:");

		assert.equal(oGrip.offsetTop, 271, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_UP");
		assert.equal(oSli.getValue(), 100.4, "Value after keyboard up Arrow without step-wide:");

		assert.equal(oGrip.offsetTop, 269, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_DOWN");
		assert.equal(oSli.getValue(), 99.6, "Value after keyboard down Arrow without step-wide:");

		assert.equal(oGrip.offsetTop, 271, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli8", "NUMPAD_PLUS");
		assert.equal(oSli.getValue(), 100.4, "Value after keyboard '+' without step-wide:");

		assert.equal(oGrip.offsetTop, 269, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli8", "NUMPAD_MINUS");
		assert.equal(oSli.getValue(), 99.6, "Value after keyboard '-' without step-wide:");

		assert.equal(oGrip.offsetTop, 271, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue(), 60, "Value after keyboard down arrow + Ctrl without step-wide:");

		assert.equal(oGrip.offsetTop, 370, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue(), 140, "Value after keyboard up arrow + Ctrl without step-wide:");

		assert.equal(oGrip.offsetTop, 170, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli8", "HOME");
		assert.equal(oSli.getValue(), 10, "Value after keyboard home without step-wide:");

		assert.equal(oGrip.offsetTop, 495, "Grip position after above change: ");

		qutils.triggerKeyboardEvent("oSli8", "HOME");
		qutils.triggerKeyboardEvent("oSli8", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli8", "ARROW_DOWN");
		qutils.triggerKeyboardEvent("oSli8", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue(), 50, "Value after keyboard multible keys without step-wide:");

		assert.equal(oGrip.offsetTop, 395, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerMouseEvent("oSli8-grip2", "mousedown", 1, 1);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_RIGHT");
		assert.equal(oSli.getValue2(), 200.4, "Value after keyboard right Arrow without step-wide:");

		assert.equal(oGrip2.offsetTop, 19, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_LEFT");
		assert.equal(oSli.getValue2(), 199.6, "Value after keyboard left Arrow without step-wide:");

		assert.equal(oGrip2.offsetTop, 21, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_UP");
		assert.equal(oSli.getValue2(), 200.4, "Value after keyboard up Arrow without step-wide:");

		assert.equal(oGrip2.offsetTop, 19, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_DOWN");
		assert.equal(oSli.getValue2(), 199.6, "Value after keyboard down Arrow without step-wide:");

		assert.equal(oGrip2.offsetTop, 21, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli8", "NUMPAD_PLUS");
		assert.equal(oSli.getValue2(), 200.4, "Value after keyboard '+' without step-wide:");

		assert.equal(oGrip2.offsetTop, 19, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli8", "NUMPAD_MINUS");
		assert.equal(oSli.getValue2(), 199.6, "Value after keyboard '-' without step-wide:");

		assert.equal(oGrip2.offsetTop, 21, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue2(), 160, "Value after keyboard down arrow + Ctrl without step-wide:");

		assert.equal(oGrip2.offsetTop, 120, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli8", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue2(), 210, "Value after keyboard up arrow + Ctrl without step-wide:");

		assert.equal(oGrip2.offsetTop, -5, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli8", "END");
		assert.equal(oSli.getValue2(), 210, "Value after keyboard end without step-wide:");

		assert.equal(oGrip2.offsetTop, -5, "Grip position after above change: ");

		qutils.triggerKeyboardEvent("oSli8", "END");
		qutils.triggerKeyboardEvent("oSli8", "ARROW_RIGHT");
		qutils.triggerKeyboardEvent("oSli8", "ARROW_UP");
		qutils.triggerKeyboardEvent("oSli8", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue2(), 170, "Value after keyboard multible keys without step-wide:");

		assert.equal(oGrip2.offsetTop, 95, "Grip position after above change: ");
	});

	QUnit.test("Keyboard with Read Only", function(assert) {
		var oSli = oSlis["oSli11"];
		var oGrip = document.getElementById('oSli11-grip');
		var oGrip2 = document.getElementById('oSli11-grip2');
		jQuery("#oSli11").trigger("focus");
		oSli.setValue2(200);
		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli11-grip", "mousedown", 1);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_RIGHT");
		assert.equal(oSli.getValue(), 100, "Value after keyboard right Arrow on read only:");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_LEFT");
		assert.equal(oSli.getValue(), 100, "Value after keyboard left Arrow on read only:");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_UP");
		assert.equal(oSli.getValue(), 100, "Value after keyboard up Arrow on read only:");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_DOWN");
		assert.equal(oSli.getValue(), 100, "Value after keyboard down Arrow on read only:");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli11", "NUMPAD_PLUS");
		assert.equal(oSli.getValue(), 100, "Value after keyboard '+' on read only:");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli11", "NUMPAD_MINUS");
		assert.equal(oSli.getValue(), 100, "Value after keyboard '-' on read only:");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue(), 100, "Value after keyboard down arrow + Ctrl on read only:");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue(), 100, "Value after keyboard up arrow + Ctrl on read only:");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli11", "HOME");
		assert.equal(oSli.getValue(), 100, "Value after keyboard home on read only:");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		oSli.setValue(100);
		qutils.triggerKeyboardEvent("oSli11", "END");
		assert.equal(oSli.getValue(), 100, "Value after keyboard end on read only:");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli11-grip2", "mousedown", 1);
		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_RIGHT");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard right Arrow on read only:");

		assert.equal(oGrip2.offsetTop, 23, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_LEFT");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard left Arrow on read only:");

		assert.equal(oGrip2.offsetTop, 23, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_UP");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard up Arrow on read only:");

		assert.equal(oGrip2.offsetTop, 23, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_DOWN");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard down Arrow on read only:");

		assert.equal(oGrip2.offsetTop, 23, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli11", "NUMPAD_PLUS");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard '+' on read only:");

		assert.equal(oGrip2.offsetTop, 23, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli11", "NUMPAD_MINUS");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard '-' on read only:");

		assert.equal(oGrip2.offsetTop, 23, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_DOWN", false, false, true);
		assert.equal(oSli.getValue2(), 200, "Value after keyboard down arrow + Ctrl on read only:");

		assert.equal(oGrip2.offsetTop, 23, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli11", "ARROW_UP", false, false, true);
		assert.equal(oSli.getValue2(), 200, "Value after keyboard up arrow + Ctrl on read only:");

		assert.equal(oGrip2.offsetTop, 23, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli11", "HOME");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard home on read only:");

		assert.equal(oGrip2.offsetTop, 23, "Grip position after above change: ");

		oSli.setValue2(200);
		qutils.triggerKeyboardEvent("oSli11", "END");
		assert.equal(oSli.getValue2(), 200, "Value after keyboard end on read only:");

		assert.equal(oGrip2.offsetTop, 23, "Grip position after above change: ");
	});

	QUnit.test("Click with Step", function(assert) {
		var oSli = oSlis["oSli7"];
		var oGrip = document.getElementById('oSli7-grip');
		var oGrip2 = document.getElementById('oSli7-grip2');
		qutils.triggerMouseEvent("oSli7", "click", 1, 117);
		assert.equal(oSli.getValue(), 30, "Value after click on control (with spep-wide):");
		assert.equal(oSli.getValue2(), 165, "Value after click on control (with spep-wide):");

		assert.equal(oGrip.offsetTop, 445, "Grip position after above change: ");
		assert.equal(oGrip2.offsetTop, 108, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli7-bar", "click", 2, 55);
		assert.equal(oSli.getValue(), 30, "Value after click on bar (with spep-wide):");
		assert.equal(oSli.getValue2(), 190, "Value after click on bar (with spep-wide):");

		assert.equal(oGrip.offsetTop, 445, "Grip position after above change: ");
		assert.equal(oGrip2.offsetTop, 45, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli7-left", "click", 1, 1);
		assert.equal(oSli.getValue(), 30, "Value after click on left end (with spep-wide):");
		assert.equal(oSli.getValue2(), 210, "Value after click on left end (with spep-wide):");

		assert.equal(oGrip.offsetTop, 445, "Grip position after above change: ");
		assert.equal(oGrip2.offsetTop, -5, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli7-right", "click", 2, 505);
		assert.equal(oSli.getValue(), 10, "Value after click on right end (with spep-wide):");
		assert.equal(oSli.getValue2(), 210, "Value after click on right end (with spep-wide):");

		assert.equal(oGrip.offsetTop, 495, "Grip position after above change: ");
		assert.equal(oGrip2.offsetTop, -5, "Grip position after above change: ");
	});

	QUnit.test("Click without Step", function(assert) {
		var oSli = oSlis["oSli8"];
		var oGrip = document.getElementById('oSli8-grip');
		var fValueChange = -1;
		oSli.attachChange(function(oEvent) {
			fValueChange = oEvent.getParameter("value");
		});
		qutils.triggerMouseEvent("oSli8", "click", 1, 116);
		assert.equal(oSli.getValue(), 50, "Value after click on control (without spep-wide):");
		assert.equal(fValueChange, 50, "Change event value after click on control (without spep-wide):");

		assert.equal(oGrip.offsetTop, 395, "Grip position after above change: ");
		fValueChange = -1;

		qutils.triggerMouseEvent("oSli8-bar", "click", 2, 55);
		assert.equal(oSli.getValue(), 50, "Value after click on bar (without spep-wide):");
		assert.equal(fValueChange, 50, "Change event value after click on bar (without spep-wide):");

		assert.equal(oGrip.offsetTop, 395, "Grip position after above change: ");

		fValueChange = -1;
		qutils.triggerMouseEvent("oSli8-left", "click", 1, 1);
		assert.equal(oSli.getValue(), 50, "Value after click on left end (without spep-wide):");
		assert.equal(fValueChange, 50, "Change event value after click on left end (without spep-wide):");

		assert.equal(oGrip.offsetTop, 395, "Grip position after above change: ");

		fValueChange = -1;
		qutils.triggerMouseEvent("oSli8-right", "click", 2, 505);
		assert.equal(oSli.getValue(), 10, "Value after click on right end (without spep-wide):");
		assert.equal(fValueChange, 10, "Change event value after click on right end (without spep-wide):");

		assert.equal(oGrip.offsetTop, 495, "Grip position after above change: ");

		fValueChange = -1;
		qutils.triggerMouseEvent("oSli8-tick4", "click", 2, 1);
		assert.equal(oSli.getValue(), 170, "Value after click on tick4 (without spep-wide):");
		assert.equal(fValueChange, 170, "Change event value after click on tick4 (without spep-wide):");

		assert.equal(oGrip.offsetTop, 95, "Grip position after above change: ");
		oSli.detachChange();
	});

	QUnit.test("Click Read only", function(assert) {
		var oSli = oSlis["oSli11"];
		var oGrip = document.getElementById('oSli11-grip');
		var fValueChange = -1;
		oSli.attachChange(function(oEvent) {
			fValueChange = oEvent.getParameter("value");
		});
		oSli.setValue(100);
		qutils.triggerMouseEvent("oSli11", "click", 1, 117);
		assert.equal(oSli.getValue(), 100, "Value after click on control (read only):");
		assert.equal(fValueChange, -1, "Change event value after click on control (read only):");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli11-bar", "click", 2, 55);
		assert.equal(oSli.getValue(), 100, "Value after click on bar (read only):");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli11-left", "click", 1, 1);
		assert.equal(oSli.getValue(), 100, "Value after click on left end (read only):");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli11-right", "click", 2, 505);
		assert.equal(oSli.getValue(), 100, "Value after click on right end (read only):");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		qutils.triggerMouseEvent("oSli11-tick6", "click", 2, 1);
		assert.equal(oSli.getValue(), 100, "Value after click on tick6 (read only):");

		assert.equal(oGrip.offsetTop, 273, "Grip position after above change: ");

		oSli.detachChange();
	});

	QUnit.module("Vertical: Visual Appearence");

	QUnit.test("Visibility", function(assert) {
		assert.ok(jQuery("#oSli8").get(0), "Visible: expected defined");
		assert.equal(jQuery("#oSli10").get(0), undefined, "Invisible:");

		var oTick = document.getElementById('oSli7-tick2');
		assert.equal(oTick, null, "No Ticks:");
		var oText = document.getElementById('oSli7-text0');
		assert.equal(oText, null, "No left Text:");
		oText = document.getElementById('oSli7-text1');
		assert.equal(oText, null, "No second Text:");

		oTick = null;
		oText = null;
		oTick = document.getElementById('oSli8-tick3');
		assert.ok(oTick, "Ticks visible: expected defined");
		assert.equal(oTick.offsetTop, 200, "3. tick position:");
		oText = document.getElementById('oSli8-text0');
		assert.equal(oText, null, "No left Text:");
		oText = document.getElementById('oSli8-text1');
		assert.equal(oText, null, "No second Text:");

		oTick = null;
		oText = null;
		oTick = document.getElementById('oSli9-tick4');
		assert.ok(oTick, "Ticks visible: expected defined");
		assert.equal(oTick.offsetTop, 250, "Middle tick position:");
		oText = document.getElementById('oSli9-text0');
		assert.ok(oText, "left text visible: expected defined");
		assert.equal(jQuery(oText).text(), "10", "left text:");
		oText = null;
		oText = document.getElementById('oSli9-text4');
		assert.ok(oText, "middle text visible: expected defined");
		assert.equal(jQuery(oText).text(), "110", "middle text:");
		oText = null;
		oText = document.getElementById('oSli9-text8');
		assert.equal(jQuery(oText).text(), "210", "right text:");
		assert.ok(oText, "right text visible: expected defined");
	});

	QUnit.module("Events");

	QUnit.test("Change Event", function(assert) {
		var done = assert.async();
		// Randomize number of repetitions
		var iRepetitions = 10 + Math.round(Math.random() * 20);
		var iDelay = 50;

		var oSlider = oSlis["oSli2"];

		// Initialize test
		oSlider.setValue(10);
		oSlider.setValue2(100);

		// Track results
		var mTests = {
			changes : 0,
			changed : 0
		};

		// Track change events
		oSlider.attachChange(function(oEvent) {
			mTests.changed++;
		});

		var iCurrentRepetition = 0;
		var bUseGrip2 = false;
		var fnCheckChangeEvent = function() {
			var bChange = Math.random() > 0.5;

			if (bChange) {
				// Trigger a change
				bUseGrip2 = !bUseGrip2;
				var sGripId = bUseGrip2 ? "oSli2-grip" : "oSli2-grip2";

				jQuery("#" + sGripId).trigger("focus");
				qutils.triggerKeyboardEvent(sGripId, "ARROW_RIGHT");
				mTests.changes++;
			}

			iCurrentRepetition++;
			if (iCurrentRepetition < iRepetitions) {
				setTimeout(fnCheckChangeEvent, iDelay);
			} else {
				setTimeout(function() {
					assert.ok(
						iCurrentRepetition > 0,
						"Test was triggered several times (" + iCurrentRepetition + ")"
					);
					assert.ok(
						mTests.changed === mTests.changes,
						"Number of triggered change-events equals number of changes (" + mTests.changed + "/" + mTests.changes + ")"
					);

					done();
				}, iDelay + 10);
			}
		};
		fnCheckChangeEvent();
	});
});