/*global QUnit */
sap.ui.define([
	"jquery.sap.dom",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/suite/VerticalProgressIndicator"
], function(jQuery, createAndAppendDiv, VerticalProgressIndicator) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2").setAttribute("style", "position:relative; top:-13px; margin-left:40px");
	createAndAppendDiv("uiArea3").setAttribute("style", "position:relative; top:-26px; margin-left:80px");
	createAndAppendDiv("uiArea4").setAttribute("style", "position:relative; top:-39px; margin-left:120px");
	createAndAppendDiv("uiArea5").setAttribute("style", "position:relative; top:-52px; margin-left:160px");
	createAndAppendDiv("uiArea6").setAttribute("style", "position:relative; top:-65px; margin-left:200px");


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
	var sCtrlId   = "VertProgInd";

	// Control 1 = Default values
	var oVPIndicator1 =  new VerticalProgressIndicator(sCtrlId + "1");
	oVPIndicator1.attachPress(pressEventHandler);
	oVPIndicator1.placeAt("uiArea1");

	// Control 2 = Set Value to 30 percent
	var oVPIndicator2 =  new VerticalProgressIndicator(sCtrlId + "2");
	oVPIndicator2.setProperty('percentage', 30);
	oVPIndicator2.placeAt("uiArea2");

	// Control 3 = Set Value to 0 percent
	var oVPIndicator3 =  new VerticalProgressIndicator(sCtrlId + "3");
	oVPIndicator3.setProperty('percentage', 0);
	oVPIndicator3.placeAt("uiArea3");

	// Control 4 = Set Value to 100 percent
	var oVPIndicator4 =  new VerticalProgressIndicator(sCtrlId + "4");
	oVPIndicator4.setProperty('percentage', 100);
	oVPIndicator4.setTooltip(sTooltip);
	oVPIndicator4.placeAt("uiArea4");

	// Control 5 = Set Value to <0
	var oVPIndicator5 =  new VerticalProgressIndicator(sCtrlId + "5");
	oVPIndicator5.setProperty('percentage', -30);
	oVPIndicator5.placeAt("uiArea5");

	// Control 6 = Set Value to >100
	var oVPIndicator6 =  new VerticalProgressIndicator(sCtrlId + "6");
	oVPIndicator6.setProperty('percentage', 111);
	oVPIndicator6.placeAt("uiArea6");



	/****************************************************
	* QUINIT TESTS - PREPARATIONS
	*****************************************************/

	//Helper-functions to determine the correct Pixels & ARIA values
	//This is needed because no values <0 and >100 are allowed

	//Calculate the height of inner <DIV>
	function determineHeight(iPercentage){
		return Math.round(determineAria(iPercentage) * 58 / 100);
	}

	//Calculate the top position (relative) if the inner <DIV>
	function determineTop(iPercentage){
		return (58 - determineHeight(iPercentage));
	}

	//determine ARIA-value
	function determineAria(iPercentage){
		if (iPercentage < 0) {
			iPercentage = 0;
		}
		if (iPercentage > 100) {
			iPercentage = 100;
		}
		return iPercentage;
	}


	/****************************************************
	* QUINIT TESTS MODULE 'PROPERTIES'
	*****************************************************/
	// Set a Test Module for module "Properties"
	QUnit.module("Properties");

	//Testcase 1: Default values
	QUnit.test("Default Values [Control 1]: ", function(assert) {
		assert.expect(4);
		var percentage = 0;
		this.oBar = jQuery.sap.domById(sCtrlId + "1-bar");
		var BarHeight = jQuery(this.oBar).css("height");
		var BarTop    = jQuery(this.oBar).css("top");
		var BarWidth  = jQuery(this.oBar).css("width");
		assert.equal(oVPIndicator1.getPercentage(), percentage, "Default Percentage: ");
		assert.equal(BarHeight, determineHeight(percentage) + "px",  "Default height of inner <DIV>: ");
		assert.equal(BarWidth,  '31px', "Default width of inner <DIV>: ");
		assert.equal(BarTop,    determineTop(percentage) + "px", "Default top position of inner <DIV>: ");
	});


	//Testcase 2: Percentage set to 30 percent
	QUnit.test("Percentage set to 30 percent [Control 2]: ", function(assert) {
		assert.expect(4);
		var percentage = 30;
		this.oBar = jQuery.sap.domById(sCtrlId + "2-bar");
		var BarHeight = jQuery(this.oBar).css("height");
		var BarTop    = jQuery(this.oBar).css("top");
		var BarWidth  = jQuery(this.oBar).css("width");
		assert.equal(oVPIndicator2.getPercentage(), percentage, "Current Percentage: ");
		assert.equal(BarHeight, determineHeight(percentage) + "px",  "Current height of inner <DIV>: ");
		assert.equal(BarWidth,  '31px', "Current width of inner <DIV>: ");
		assert.equal(BarTop,    determineTop(percentage) + "px", "Current top position of inner <DIV>: ");
	});


	//Testcase 3: Percentage set to 0 percent
	QUnit.test("Percentage set to 0 percent [Control 3]: ", function(assert) {
		assert.expect(4);
		var percentage = 0;
		this.oBar = jQuery.sap.domById(sCtrlId + "3-bar");
		var BarHeight = jQuery(this.oBar).css("height");
		var BarTop    = jQuery(this.oBar).css("top");
		var BarWidth  = jQuery(this.oBar).css("width");
		assert.equal(oVPIndicator3.getPercentage(), percentage, "Current Percentage: ");
		assert.equal(BarHeight, determineHeight(percentage) + "px",  "Current height of inner <DIV>: ");
		assert.equal(BarWidth,  '31px', "Current width of inner <DIV>: ");
		assert.equal(BarTop,    determineTop(percentage) + "px", "Current top position of inner <DIV>: ");
	});


	//Testcase 4: Percentage set to 100 percent
	QUnit.test("Percentage set to 100 percent [Control 4]: ", function(assert) {
		assert.expect(4);
		var percentage = 100;
		this.oBar = jQuery.sap.domById(sCtrlId + "4-bar");
		var BarHeight = jQuery(this.oBar).css("height");
		var BarTop    = jQuery(this.oBar).css("top");
		var BarWidth  = jQuery(this.oBar).css("width");
		assert.equal(oVPIndicator4.getPercentage(), percentage, "Current Percentage: ");
		assert.equal(BarHeight, determineHeight(percentage) + "px",  "Current height of inner <DIV>: ");
		assert.equal(BarWidth,  '31px', "Current width of inner <DIV>: ");
		assert.equal(BarTop,    determineTop(percentage) + "px", "Current top position of inner <DIV>: ");
	});


	//Testcase 5: Percentage set to -30 percent
	QUnit.test("Percentage set to -30 percent [Control 5]: ", function(assert) {
		assert.expect(4);
		var percentage = -30;
		this.oBar = jQuery.sap.domById(sCtrlId + "5-bar");
		var BarHeight = jQuery(this.oBar).css("height");
		var BarTop    = jQuery(this.oBar).css("top");
		var BarWidth  = jQuery(this.oBar).css("width");
		assert.equal(oVPIndicator5.getPercentage(), percentage, "Current Percentage: ");
		assert.equal(BarHeight, determineHeight(percentage) + "px",  "Current height of inner <DIV>: ");
		assert.equal(BarWidth,  '31px', "Current width of inner <DIV>: ");
		assert.equal(BarTop,    determineTop(percentage) + "px", "Current top position of inner <DIV>: ");
	});


	//Testcase 6: Percentage set to 111 percent
	QUnit.test("Percentage set to 111 percent [Control 6]: ", function(assert) {
		assert.expect(4);
		var percentage = 111;
		this.oBar = jQuery.sap.domById(sCtrlId + "6-bar");
		var BarHeight = jQuery(this.oBar).css("height");
		var BarTop    = jQuery(this.oBar).css("top");
		var BarWidth  = jQuery(this.oBar).css("width");
		assert.equal(oVPIndicator6.getPercentage(), percentage, "Current Percentage: ");
		assert.equal(BarHeight, determineHeight(percentage) + "px",  "Current height of inner <DIV>: ");
		assert.equal(BarWidth,  '31px', "Current width of inner <DIV>: ");
		assert.equal(BarTop,    determineTop(percentage) + "px", "Current top position of inner <DIV>: ");
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
			oVPIndicator1.firePress();
			assert.ok(false, "exception should have been thrown!");
		} catch (e) {
			assert.equal(sPressMessage, e, "Press Event triggered");
		}
		});

	//Testcase 8: DetachPress Event
	QUnit.test("Detach Press Eventhandler [Control 1]: ", function(assert) {
		assert.expect(1);
		oVPIndicator1.detachPress(pressEventHandler);
		try {
			oVPIndicator1.firePress();
			assert.ok(true, "No event and thus no exception should be triggered!");
		} catch (e) {
			assert.ok(false, "should not occur");
		}
		// cleanup in order to be independent from order of execution of test-functions (e.g. in FF3 there was an issue)
		oVPIndicator1.attachPress(pressEventHandler);
	});


	/****************************************************
	* QUINIT TESTS MODULE 'TOOLTIPS'
	*****************************************************/
	// Set a Test Module for module "Tooltips"
	QUnit.module("Tooltips");

	//Testcase 9: Manually set Tooltip
	QUnit.test("Manual Tooltip [Control 4]: ", function(assert) {
		assert.expect(1);
		assert.equal(sTooltip, oVPIndicator4.getTooltip(), "Manual Tooltip");
	});

	//Testcase 10: Automatic Tooltip
	QUnit.test("Automatic Tooltip [Control 2]: ", function(assert) {
		assert.expect(1);
		if (!this.oThis){
			this.oThis = jQuery.sap.byId(sCtrlId + "2");
		}
		var AriaValue = this.oThis.attr('aria-valuenow');
		var Tooltip   = this.oThis.attr('title');
		assert.equal(AriaValue, Tooltip + "%", "Automatic Tooltip");
	});


	/****************************************************
	* QUINIT TESTS MODULE 'ARIA'
	*****************************************************/
	// Set a Test Module for module "ARIA"
	QUnit.module("ARIA");

	//Testcase 11: Default ARIA-Value
	QUnit.test("Default ARIA-Values [Control 1]: ", function(assert) {
		assert.expect(3);
		var percentage = 0;
		if (!this.oThis){
			this.oThis = jQuery.sap.byId(sCtrlId + "1");
		}
		var ValueNow = this.oThis.attr('aria-valuenow');
		var ValueMax = this.oThis.attr('aria-valuemax');
		var ValueMin = this.oThis.attr('aria-valuemin');
		assert.equal(ValueNow, determineAria(percentage) + "%",   "Default ARIA-value: ");
		assert.equal(ValueMax, "100%",   "Maximum ARIA-value: ");
		assert.equal(ValueMin, "0%",     "Minimum ARIA-value: ");
	});

	//Testcase 12: ARIA-Value for Percentage in Range (0-100)
	QUnit.test("ARIA-Value for Percentage in Range [Controls 2,3,4]: ", function(assert) {
		assert.expect(3);
		this.oThis2 = jQuery.sap.byId(sCtrlId + "2");
		this.oThis3 = jQuery.sap.byId(sCtrlId + "3");
		this.oThis4 = jQuery.sap.byId(sCtrlId + "4");
		var ValueNow2   = this.oThis2.attr('aria-valuenow');
		var ValueNow3   = this.oThis3.attr('aria-valuenow');
		var ValueNow4   = this.oThis4.attr('aria-valuenow');
		assert.equal(ValueNow2, determineAria(30) + "%",   "ARIA-value for 30%: ");
		assert.equal(ValueNow3, determineAria(0) + "%",   "ARIA-value for 0%: ");
		assert.equal(ValueNow4, determineAria(100) + "%",   "ARIA-value for 100%: ");
	});


	//Testcase 13: ARIA-Value for Percentage out of Range (<0 or >100)
	QUnit.test("ARIA-Value for Percentage out of Range [Controls 5,6]: ", function(assert) {
		assert.expect(2);
		this.oThis5 = jQuery.sap.byId(sCtrlId + "5");
		this.oThis6 = jQuery.sap.byId(sCtrlId + "6");
		var ValueNow5   = this.oThis5.attr('aria-valuenow');
		var ValueNow6   = this.oThis6.attr('aria-valuenow');
		assert.equal(ValueNow5, determineAria(-30) + "%",   "ARIA-value for -30%: ");
		assert.equal(ValueNow6, determineAria(111) + "%",   "ARIA-value for 111%: ");
	});
});