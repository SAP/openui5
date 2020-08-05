/*global QUnit */
sap.ui.define([
	"jquery.sap.dom",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/suite/TaskCircle",
	"sap/ui/suite/library"
], function(jQuery, createAndAppendDiv, TaskCircle, suiteLibrary) {
	"use strict";

	// shortcut for sap.ui.suite.TaskCircleColor
	var TaskCircleColor = suiteLibrary.TaskCircleColor;


	// prepare DOM
	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");
	createAndAppendDiv("uiArea4");
	createAndAppendDiv("uiArea5");
	createAndAppendDiv("uiArea6");


	/****************************************************
	* PREPARATIONS
	*****************************************************/
	//declare variables
	var sPressMessage = "Control 1: press event OK!",
		sTooltip      = "Control 4: tooltip OK!";

	//simulate event
	function pressEventHandler() {
		throw sPressMessage;
	}


	/****************************************************
	* CREATION OF CONTROLS
	*****************************************************/
	// Prefix for Control ID
	var sCtrlId   = "TaskCircle";

	// Control 1 = Default values
	var oTaskCircle1 =  new TaskCircle(sCtrlId + "1");
	oTaskCircle1.attachPress(pressEventHandler);
	oTaskCircle1.placeAt("uiArea1");

	// Control 2 = Set Value to 30 percent
	var oTaskCircle2 =  new TaskCircle(sCtrlId + "2");
	oTaskCircle2.setProperty('value', 30);
	oTaskCircle2.placeAt("uiArea2");

	// Control 3 = Set Value to 0 percent
	var oTaskCircle3 =  new TaskCircle(sCtrlId + "3");
	oTaskCircle3.setProperty('value', 0);
	oTaskCircle3.placeAt("uiArea3");

	// Control 4 = Set Value to 100 percent
	var oTaskCircle4 =  new TaskCircle(sCtrlId + "4");
	oTaskCircle4.setProperty('value', 100);
	oTaskCircle4.setTooltip(sTooltip);
	oTaskCircle4.placeAt("uiArea4");

	// Control 5 = Set Value to <0
	var oTaskCircle5 =  new TaskCircle(sCtrlId + "5");
	oTaskCircle5.setProperty('value', -30);
	oTaskCircle5.placeAt("uiArea5");

	// Control 6 = Set Value to >100
	var oTaskCircle6 =  new TaskCircle(sCtrlId + "6");
	oTaskCircle6.setProperty('value', 111);
	oTaskCircle6.placeAt("uiArea6");



	/****************************************************
	* QUINIT TESTS - PREPARATIONS
	*****************************************************/


	/****************************************************
	* QUINIT TESTS MODULE 'PROPERTIES'
	*****************************************************/
	// Set a Test Module for module "Properties"
	QUnit.module("Properties");

	//Testcase 1: Default values
	QUnit.test("Default Values [Control 1]: ", function(assert) {
		assert.expect(4);
		assert.equal(oTaskCircle1.getValue(), 0 , "Default value: ");
		assert.equal(oTaskCircle1.getMaxValue(), 100 , "Default maximum value: ");
		assert.equal(oTaskCircle1.getMinValue(), 0 , "Default minimum value: ");
		assert.equal(oTaskCircle1.getColor(), TaskCircleColor.Gray , "Default color: ");
	});


	/****************************************************
	* QUINIT TESTS MODULE 'EVENTS'
	*****************************************************/
	// Set a Test Module for module "Events"
	QUnit.module("Events");

	//Testcase 7: Press Event
	QUnit.test("Press Event [Control 1]: ", function(assert) {
		assert.expect(1);
		try {
			oTaskCircle1.firePress();
			assert.ok(false, "exception should have been thrown!");
		} catch (e) {
			assert.equal(sPressMessage, e, "Press Event triggered");
		}
	});

	//Testcase 8: DetachPress Event
	QUnit.test("Detach Press Eventhandler [Control 1]: ", function(assert) {
		assert.expect(1);
		oTaskCircle1.detachPress(pressEventHandler);
		try {
			oTaskCircle1.firePress();
			assert.ok(true, "No event and thus no exception should be triggered!");
		} catch (e) {
			assert.ok(false, "should not occur");
		}
		// cleanup in order to be independent from order of execution of test-functions (e.g. in FF3 there was an issue)
		oTaskCircle1.attachPress(pressEventHandler);
	});


	/****************************************************
	* QUINIT TESTS MODULE 'TOOLTIPS'
	*****************************************************/
	// Set a Test Module for module "Tooltips"
	QUnit.module("Tooltips");

	//Testcase 9: Manually set Tooltip
	QUnit.test("Manual Tooltip [Control 4]: ", function(assert) {
		assert.expect(1);
		assert.equal(sTooltip, oTaskCircle4.getTooltip(), "Manual Tooltip");
	});

	//Testcase 10: Automatic Tooltip
	QUnit.test("Automatic Tooltip [Control 2]: ", function(assert) {
		assert.expect(1);
		if (!this.oThis){
			this.oThis = jQuery.sap.byId(sCtrlId + "2");
		}
		var AriaValue = this.oThis.attr('aria-valuenow');
		var Tooltip   = this.oThis.attr('title');
		assert.equal(AriaValue, Tooltip, "Automatic Tooltip");
	});


	/****************************************************
	* QUINIT TESTS MODULE 'ARIA'
	*****************************************************/
	QUnit.module("ARIA");

	//Testcase 11: Default ARIA-Value
	QUnit.test("Default ARIA-Values [Control 1]: ", function(assert) {
		assert.expect(3);
		if (!this.oThis){
			this.oThis = jQuery.sap.byId(sCtrlId + "1");
		}
		var ValueNow = this.oThis.attr('aria-valuenow');
		var ValueMax = this.oThis.attr('aria-valuemax');
		var ValueMin = this.oThis.attr('aria-valuemin');
		assert.equal(ValueNow, "0",   "Default ARIA-value: ");
		assert.equal(ValueMax, "100",   "Maximum ARIA-value: ");
		assert.equal(ValueMin, "0",     "Minimum ARIA-value: ");
	});

	//Testcase 12: ARIA-Value for positive values
	QUnit.test("ARIA-Value for positive values [Controls 2,4,6]: ", function(assert) {
		assert.expect(3);
		this.oThis2 = jQuery.sap.byId(sCtrlId + "2");
		this.oThis4 = jQuery.sap.byId(sCtrlId + "4");
		this.oThis6 = jQuery.sap.byId(sCtrlId + "6");
		var ValueNow2 = this.oThis2.attr('aria-valuenow');
		var ValueNow4 = this.oThis4.attr('aria-valuenow');
		var ValueNow6 = this.oThis6.attr('aria-valuenow');
		assert.equal(ValueNow2, "30",   "ARIA-value for 30 percent: ");
		assert.equal(ValueNow4, "100",   "ARIA-value for 100 percent: ");
		assert.equal(ValueNow6, "111",   "ARIA-value for 111 percent: ");
	});


	//Testcase 13: ARIA-Value for negative values
	QUnit.test("ARIA-Value for negative values [Control 5]: ", function(assert) {
		assert.expect(1);
		this.oThis5 = jQuery.sap.byId(sCtrlId + "5");
		var ValueNow5 = this.oThis5.attr('aria-valuenow');
		assert.equal(ValueNow5, "0",   "ARIA-value for -30 percent: ");
	});
});