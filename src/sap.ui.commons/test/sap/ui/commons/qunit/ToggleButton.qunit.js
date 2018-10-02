/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/ToggleButton",
	"jquery.sap.global"
], function(qutils, createAndAppendDiv, ToggleButton, jQuery) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2"]);


	var sToggleButtonId = "testToggleButton";
	var oToggleButton1 = new ToggleButton( sToggleButtonId + "_1" , {text:"TestButton", tooltip:"TestButton", pressed:true});
	oToggleButton1.placeAt("uiArea1");
	var oToggleButton2 = new ToggleButton( sToggleButtonId + "_2" , {text:"TestButton1", tooltip:"TestButton1", pressed:false});
	oToggleButton2.placeAt("uiArea2");

	QUnit.test("TestGetPressedStateOK", function(assert){
		assert.equal(oToggleButton1.getPressed(), true, "getPressedState for testToggleButton_1");
		assert.equal(oToggleButton2.getPressed(), false, "getPressedState for testToggleButton_2");
	});
	QUnit.test("TestPressedToUnpressedOK", function(assert){
		qutils.triggerEvent("click", sToggleButtonId + "_1");
		assert.equal(oToggleButton1.getPressed(), false, "getPressedState");
	});

	QUnit.test("TestUnpressedToPressedOK", function(assert){
		qutils.triggerEvent("click", sToggleButtonId + "_2");
		assert.equal(oToggleButton2.getPressed(), true, "getPressedState");
	});

	QUnit.test("ARIA", function(assert){
		var done = assert.async();
		setTimeout(function() {
			var oTB1 = jQuery.sap.domById(sToggleButtonId + "_1");
			assert.equal(jQuery(oTB1).attr("aria-pressed"),"false","ARIA-PRESSED: for testToggleButton_1");
			var oTB2 = jQuery.sap.domById(sToggleButtonId + "_2");
			assert.equal(jQuery(oTB2).attr("aria-pressed"),"true","ARIA-PRESSED: for testToggleButton_2");
			done();
		},0);
	});
});