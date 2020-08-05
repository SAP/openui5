/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/TextArea",
	"sap/ui/core/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes"
], function(qutils, createAndAppendDiv, TextArea, coreLibrary, jQuery, KeyCodes) {
	"use strict";

	// shortcut for sap.ui.core.Wrapping
	var Wrapping = coreLibrary.Wrapping;

	// shortcut for sap.ui.core.Design
	var Design = coreLibrary.Design;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4", "uiArea5"]);



	var oTAs = {};

	var initTA = function(idx, sValue, sWidth, sHeight, iCols, iRows, bEditable, sValueState, bRequired, sDesign, sWrapping, iCursorPos, iMaxLength, sExplanation, sLabeledBy, sTooltip ){
		var sId = "oTA" + idx;
		var oTA = new TextArea(sId);
		if (sValue != -1) {oTA.setValue(sValue);}
		if (sWidth != -1) {oTA.setWidth(sWidth);}
		if (sHeight != -1) {oTA.setHeight(sHeight);}
		if (iCols != -1) {oTA.setCols(iCols);}
		if (iRows != -1) {oTA.setRows(iRows);}
		if (bEditable != -1) {oTA.setEditable(bEditable);}
		if (sValueState != -1) {oTA.setValueState(sValueState);}
		if (bRequired != -1) {oTA.setRequired(bRequired);}
		if (sDesign != -1) {oTA.setDesign(sDesign);}
		if (sWrapping != -1) {oTA.setWrapping(sWrapping);}
		if (iCursorPos != -1) {oTA.setCursorPos(iCursorPos);}
		if (iMaxLength != -1) {oTA.setMaxLength(iMaxLength);}
		if (sExplanation != -1) {oTA.setExplanation(sExplanation);}
		if (sLabeledBy != -1) {oTA.setLabeledBy(sLabeledBy);}
		if (sTooltip != -1) {oTA.setTooltip(sTooltip);}

		oTA.placeAt("uiArea" + idx);
		oTAs[sId] = oTA;
	};

	initTA(1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1); //default values
	initTA(2, "Standard Text Area", "500px", "100px", 10, 10, true, ValueState.None, false, Design.Standard, Wrapping.Soft, 3, 20, -1, -1, "Tooltip 1");
	initTA(3, "Row1 \nRow2 \nRow3", -1, -1, 10, 3, true, ValueState.Error, false, Design.Monospace, Wrapping.Soft, -1, -1, -1, -1, "Tooltip 2");
	initTA(4, "Row1 \nRow2 \nRow3", "10em", -1, -1, 3, true, ValueState.Warning, false, -1, Wrapping.Hard, -1, -1, -1, -1, "Tooltip 3");
	initTA(5, "Row1 \nRow2 \nRow3", "30%", -1, -1, 3, false, ValueState.None, false, -1, Wrapping.Off, -1, -1, -1, -1, "Tooltip 4");



	QUnit.module("Properties");

	QUnit.test("Default Values", function(assert) {
		var oTA = oTAs["oTA1"];
		assert.equal(oTA.getValue(), "", "Default 'value':");
		assert.equal(oTA.getWidth(), "", "Default 'width':");
		assert.equal(oTA.getHeight(), "", "Default 'heigth':");
		assert.equal(oTA.getCols(), 0, "Default 'cols':");
		assert.equal(oTA.getRows(), 0, "Default 'rows':");
		assert.equal(oTA.getEditable(), true, "Default 'editable':");
		assert.equal(oTA.getValueState(), ValueState.None, "Default 'valueState':");
		assert.equal(oTA.getRequired(), false, "Default 'required':");
		assert.equal(oTA.getDesign(), Design.Standard, "Default 'design':");
		assert.equal(oTA.getWrapping(), Wrapping.None, "Default 'wrapping':");
		assert.equal(oTA.getCursorPos(), 0, "Default 'cursorPos':");
		assert.equal(oTA.getMaxLength(), 0, "Default 'maxLength':");
		assert.equal(oTA.getExplanation(), "", "Default 'explanation':");
		assert.equal(oTA.getLabeledBy(), "", "Default 'labeledBy':");
		assert.equal(oTA.getTooltip(), null, "Default 'tooltip':");
	});

	QUnit.test("Custom Values", function(assert) {
		var oTA = oTAs["oTA2"];
		assert.equal(oTA.getValue(), "Standard Text Area", "Custom 'value':");
		assert.equal(oTA.getWidth(), "500px", "Custom 'width':");
		assert.equal(oTA.getHeight(), "100px", "Custom 'heigth':");
		assert.equal(oTA.getCols(), 10, "Custom 'cols':");
		assert.equal(oTA.getRows(), 10, "Custom 'rows':");
		assert.equal(oTA.getEditable(), true, "Custom 'editable':");
		assert.equal(oTA.getValueState(), ValueState.None, "Custom 'valueState':");
		assert.equal(oTA.getRequired(), false, "Custom 'required':");
		assert.equal(oTA.getDesign(), Design.Standard, "Custom 'design':");
		assert.equal(oTA.getWrapping(), Wrapping.Soft, "Custom 'wrapping':");
		assert.equal(oTA.getCursorPos(), 3, "Custom 'cursorPos':");
		assert.equal(oTA.getMaxLength(), 20, "Custom 'maxLength':");
		assert.equal(oTA.getExplanation(), "", "Custom 'explanation':");
		assert.equal(oTA.getLabeledBy(), "", "Custom 'labeledBy':");
		assert.equal(oTA.getTooltip(), "Tooltip 1", "Custom 'tooltip':");

		oTA = oTAs["oTA3"];
		assert.equal(oTA.getValue(), "Row1 \nRow2 \nRow3", "Custom 'value' with wrap:");

	});

	QUnit.test("Set Value", function(assert) {
		var done = assert.async();
		var oTA = oTAs["oTA2"];
		oTA.setValue("This is a test");
		assert.equal(oTA.getValue(), "This is a test", "Set Value:");

		//check for cut on MaxLength
		oTA.setValue("This is a long text that should be cut.");
		assert.equal(oTA.getValue(), "This is a long text ", "Set Valuee with long text > MaxLength:");

		var oTADom = document.getElementById('oTA2');
		oTADom.focus();
		// async because of IE9 and focus() with jQuery < 1.6.2
		var delayedCall = function(){
			oTA.setCursorPos(5);

			assert.equal(jQuery(oTADom).cursorPos(), 5, "Cursor Position:");
			done();
		};
		setTimeout(delayedCall, 0);

	});

	QUnit.module("Visual Appearence");

	QUnit.test("Visibility", function(assert) {
		var done = assert.async();
		assert.ok(jQuery("#oTA2").get(0), "Visible: expected defined");

		var oTA = oTAs["oTA2"];
		var oTADom = document.getElementById('oTA2');
		assert.ok(jQuery(oTADom).hasClass("sapUiTfStd"), "Visible: Standard Class");
		assert.equal(jQuery(oTADom).hasClass("sapUiTfRo"), false, "Visible: no ReadOnly Class");
		oTA.setEditable(false);
		assert.ok(jQuery(oTADom).hasClass("sapUiTfRo"), "Visible:toggle to ReadOnly: ReadOnly Class");
		assert.equal(jQuery(oTADom).hasClass("sapUiTfStd"), false, "Visibility:toggle to ReadOnly:Visible: no Standard Class");
		oTA.setValueState(ValueState.Error);
		assert.ok(jQuery(oTADom).hasClass("sapUiTfRo"), "Visible:toggle to error: Standard Class");
		assert.ok(jQuery(oTADom).hasClass("sapUiTfErr"), "Visible:toggle to error: Error Class");
		oTA.setValueState(ValueState.Warning);
		assert.ok(jQuery(oTADom).hasClass("sapUiTfRo"), "Visible:toggle to warning: Standard Class");
		assert.equal(jQuery(oTADom).hasClass("sapUiTfErr"), false, "Visible:toggle to warning: no Error Class");
		assert.ok(jQuery(oTADom).hasClass("sapUiTfWarn"), "Visible:toggle to warning: warning Class");
		oTA.setValueState(ValueState.None);
		assert.ok(jQuery(oTADom).hasClass("sapUiTfRo"), "Visible:toggle to standard: Standard Class");
		assert.equal(jQuery(oTADom).hasClass("sapUiTfErr"), false, "Visible:toggle to Standard: no Error Class");
		assert.equal(jQuery(oTADom).hasClass("sapUiTfWarn"), false, "Visible:toggle to Standard: no warning Class");
		oTA.setEditable(true);
		assert.ok(jQuery(oTADom).hasClass("sapUiTfStd"), "Visible:toggle to standard: Standard Class");
		assert.equal(jQuery(oTADom).hasClass("sapUiTfRo"), false, "Visible:toggle to standard: no ReadOnly Class");

		oTADom = document.getElementById('oTA4');
		assert.ok(jQuery(oTADom).hasClass("sapUiTfWarn"), "Visible: Warning Class");

		oTADom = document.getElementById('oTA5');
		assert.ok(jQuery(oTADom).hasClass("sapUiTfRo"), "Visible: ReadOnly Class");
		assert.equal(jQuery(oTADom).hasClass("sapUiTfStd"), false, "Visible: no Standard Class");

		oTADom = document.getElementById('oTA3');
		oTADom.focus();
		assert.ok(jQuery(oTADom).hasClass("sapUiTfErr"), "Visible: Error Class");
		// async because of IE9 with focus() and jQuery < 1.6.2
		var delayedCall = function(){
			assert.ok(jQuery(oTADom).hasClass("sapUiTfFoc"), "Visible: Focus Class");
			done();
		};
		setTimeout(delayedCall, 0);

	});

	QUnit.test("ARIA", function(assert) {
		var oTA = oTAs["oTA1"];
		oTA.addAriaDescribedBy("D1");
		oTA.addAriaLabelledBy("L1");
		sap.ui.getCore().applyChanges();
		var $oTA = jQuery("#oTA1");
		assert.equal($oTA.attr("role"), "textbox", "oTA1: Role");
		assert.equal($oTA.attr("aria-required"), "false", "oTA1: aria-required");
		assert.equal($oTA.attr("aria-readonly"), "false", "oTA1: aria-readonly");
		assert.equal($oTA.attr("aria-multiline"), "true", "oTA1: aria-multiline");
		assert.equal($oTA.attr("aria-autocomplete"), "none", "oTA1: aria-autocomplete");
		assert.equal($oTA.attr("aria-invalid"), "false", "oTA1: aria-invalid");
		assert.equal($oTA.attr("aria-describedby"), "D1", "oTA1: aria-describesby");
		assert.equal($oTA.attr("aria-labelledby"), "L1", "oTA1: aria-labelledby");

		$oTA = jQuery("#oTA3");
		assert.equal($oTA.attr("aria-invalid"), "true", "oTA3: aria-invalid");

		$oTA = jQuery("#oTA5");
		assert.equal($oTA.attr("aria-readonly"), "true", "oTA5: aria-readonly");
	});

	QUnit.module("Behaviour");

	// async because of IE9 focus issue
	QUnit.test("Typing", function(assert) {
		var done = assert.async();
		var oTA = oTAs["oTA1"];
		var bChange = false;
		var bLiveChange = false;
		function handleChange(oEvent){bChange = true;}
		function handleLiveChange(oEvent){bLiveChange = true;}
		oTA.attachChange(handleChange);
		oTA.attachLiveChange(handleLiveChange);
		document.getElementById('oTA1').focus();

		qutils.triggerCharacterInput("oTA1", "A");
		qutils.triggerEvent("input", "oTA1");
		qutils.triggerKeyup("oTA1", KeyCodes.A, true, false, false);
		assert.equal(oTA.getValue(), "", "Value after Typing");
		assert.equal(oTA.getLiveValue(), "A", "LiveValue after typing");
		assert.equal(bChange, false, "Change event fired after typing");
		assert.equal(bLiveChange, true, "LiveChange event fired after typing");
		bChange = false;
		bLiveChange = false;

		qutils.triggerCharacterInput("oTA1", "b");
		qutils.triggerEvent("input", "oTA1");
		qutils.triggerKeyup("oTA1", KeyCodes.B, false, false, false);
		assert.equal(oTA.getValue(), "", "Value after Typing");
		assert.equal(oTA.getLiveValue(), "Ab", "LiveValue after typing");
		assert.equal(bChange, false, "Change event fired after typing");
		assert.equal(bLiveChange, true, "LiveChange event fired after typing");
		bChange = false;
		bLiveChange = false;

		document.getElementById('oTA2').focus();
		setTimeout(function(){
			assert.equal(oTA.getValue(), "Ab", "Value after focus out");
			assert.equal(oTA.getLiveValue(), "Ab", "LiveValue after focus out");
			assert.equal(bChange, true, "Change event fired after focus out");
			assert.equal(bLiveChange, false, "LiveChange event fired after focus out");
			bChange = false;
			bLiveChange = false;

			// Escape
			document.getElementById('oTA1').focus();
			qutils.triggerCharacterInput("oTA1", "c");
			qutils.triggerEvent("input", "oTA1");
			qutils.triggerKeyup("oTA1", KeyCodes.C, false, false, false);
			assert.equal(oTA.getValue(), "Ab", "Value after Typing");
			assert.equal(oTA.getLiveValue(), "Abc", "LiveValue after typing");
			assert.equal(bChange, false, "Change event fired after typing");
			assert.equal(bLiveChange, true, "LiveChange event fired after typing");
			bChange = false;
			bLiveChange = false;

			qutils.triggerKeyEvent("keydown", "oTA1", KeyCodes.ESCAPE);
			qutils.triggerKeyEvent("keypress", "oTA1", KeyCodes.ESCAPE);
			qutils.triggerKeyup("oTA1", KeyCodes.ESCAPE, false, false, false);
			assert.equal(oTA.getValue(), "Ab", "Value after escape");
			assert.equal(oTA.getLiveValue(), "Ab", "LiveValue after escape");
			assert.equal(bChange, false, "Change event fired after escape");
			assert.equal(bLiveChange, true, "LiveChange event fired after escape");
			bChange = false;
			bLiveChange = false;

			oTA.detachChange(handleChange);
			oTA.detachLiveChange(handleLiveChange);
			done();
		}, 10);
});
});