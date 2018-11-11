/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/ValueHelpField",
	"sap/ui/core/library",
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes"
], function(qutils, createAndAppendDiv, ValueHelpField, coreLibrary, jQuery, KeyCodes) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4", "uiArea5"]);



	var sEvent = "";

	function handleValueHelpRequest(oEvent){
		sEvent = "ValueHelpRequest";
	}

	var oVHF1 = new ValueHelpField("VHF1",{
		valueHelpRequest: handleValueHelpRequest,
		ariaDescribedBy: ["D1", "D2"],
		ariaLabelledBy: "L1"
	}).placeAt("uiArea1");

	new ValueHelpField("VHF2",{
		value: "read only",
		editable: false
	}).placeAt("uiArea2");

	var oVHF3 = new ValueHelpField("VHF3",{
		value: "disabled",
		enabled: false,
		width: "200px"
	}).placeAt("uiArea3");

	new ValueHelpField("VHF4",{
		iconURL: "test-resources/sap/ui/commons/images/help.gif",
		valueState: ValueState.Error
	}).placeAt("uiArea4");

	var oVHF5 = new ValueHelpField("VHF5",{
		iconURL: "test-resources/sap/ui/commons/images/help.gif",
		iconHoverURL: "test-resources/sap/ui/commons/images/close.gif"
	}).placeAt("uiArea5");


	QUnit.module("Appearance");

	QUnit.test("Output", function(assert) {
		// default ValueHelpField

		assert.equal(document.getElementById("VHF3").offsetWidth, 200, "width of the field");

		// other images
		assert.ok(jQuery("#VHF4").children("img").get(0), "With URL: Icon image rendered");
		assert.equal(jQuery("#VHF4").children("img").attr('src'), "test-resources/sap/ui/commons/images/help.gif", "URL image displayed");

	});

	QUnit.test("ARIA", function(assert) {
		var oVHF = jQuery("#VHF1");
		var oVHFInput = jQuery("#VHF1 > input");
		assert.equal(oVHF.attr("aria-owns"), "VHF1-input VHF1-icon", "aria-owns");
		assert.equal(oVHFInput.attr("aria-describedby"), "D1 D2", "aria-describesby");
		assert.equal(oVHFInput.attr("aria-labelledby"), "L1", "aria-labelledby");
		assert.equal(oVHFInput.attr("aria-multiline"), "false", "aria-multiline");
		assert.equal(oVHFInput.attr("aria-autocomplete"), "none", "aria-autocomplete");
		assert.ok(!oVHFInput.attr("aria-invalid"), "aria-invalid");
		oVHF = jQuery("#VHF4");
		oVHFInput = jQuery("#VHF4 > input");
		assert.equal(oVHFInput.attr("aria-invalid"), "true", "aria-invalid");
});

	QUnit.test("hover", function(assert) {
		// only test for image possible, not for hover CSS styles - this must be tested in QTP

		//own image - but no own hover image -> no change
		qutils.triggerMouseEvent("VHF4-icon", "mouseover");
		assert.equal(jQuery("#VHF4").children("img").attr('src'), "test-resources/sap/ui/commons/images/help.gif", "URL image displayed");
		qutils.triggerMouseEvent("VHF4-icon", "mouseout");

		//own image + own hover image
		qutils.triggerMouseEvent("VHF5-icon", "mouseover");
		assert.equal(jQuery("#VHF5").children("img").attr('src'), "test-resources/sap/ui/commons/images/close.gif", "URL image displayed");
		qutils.triggerMouseEvent("VHF5-icon", "mouseout");
		assert.equal(jQuery("#VHF5").children("img").attr('src'), "test-resources/sap/ui/commons/images/help.gif", "URL image displayed");

	});

	QUnit.test("Change Image", function(assert) {
		oVHF1.setIconURL("test-resources/sap/ui/commons/images/ui5.png");
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery("#VHF1").children("img").attr('src'), "test-resources/sap/ui/commons/images/ui5.png", "URL image displayed");

		// go back to default
		oVHF1.setIconURL("");
		sap.ui.getCore().applyChanges();

		// disabled - regular image given - no disabled image -> regular image should be displayed (with opacity)
		oVHF3.setIconURL("test-resources/sap/ui/commons/images/save.png");
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery("#VHF3-icon").hasClass("sapUiTfValueHelpDsblIcon"), "opacity class set");
		// disabled image
		oVHF3.setIconDisabledURL("test-resources/sap/ui/commons/images/new.png");
		sap.ui.getCore().applyChanges();
		assert.ok(!jQuery("#VHF3-icon").hasClass("sapUiTfValueHelpDsblIcon"), "opacity class not set");

		// hover image change
		oVHF5.setIconHoverURL("test-resources/sap/ui/commons/images/personalize.gif");
		sap.ui.getCore().applyChanges();
		qutils.triggerMouseEvent("VHF5-icon", "mouseover");
		assert.equal(jQuery("#VHF5").children("img").attr('src'), "test-resources/sap/ui/commons/images/personalize.gif", "URL image displayed");
		qutils.triggerMouseEvent("VHF5-icon", "mouseout");
		assert.equal(jQuery("#VHF5").children("img").attr('src'), "test-resources/sap/ui/commons/images/help.gif", "URL image displayed");

	});

	QUnit.module("Interaction");

	QUnit.test("event", function(assert) {
		qutils.triggerMouseEvent("VHF1-icon", "click");
		assert.equal(sEvent, "ValueHelpRequest","Click - event fired");
		sEvent = "";

		qutils.triggerKeyboardEvent("VHF1", KeyCodes.F4, false, false, false);
		assert.equal(sEvent, "ValueHelpRequest","F4 - event fired");
		sEvent = "";

		// readonly
		qutils.triggerMouseEvent("VHF2-icon", "click");
		assert.equal(sEvent, "","Click - no event fired");
		sEvent = "";

		qutils.triggerKeyboardEvent("VHF2", KeyCodes.F4, false, false, false);
		assert.equal(sEvent, "","F4 - event fired");
		sEvent = "";

		// disabled
		qutils.triggerMouseEvent("VHF3-icon", "click");
		assert.equal(sEvent, "","Click - no event fired");
		sEvent = "";

		qutils.triggerKeyboardEvent("VHF3", KeyCodes.F4, false, false, false);
		assert.equal(sEvent, "","F4 - event fired");
		sEvent = "";

	});
});