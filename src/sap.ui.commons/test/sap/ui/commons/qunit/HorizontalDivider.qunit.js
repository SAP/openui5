/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/HorizontalDivider"
], function(createAndAppendDiv, HorizontalDivider) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2", "uiArea3", "uiArea4", "uiArea5", "uiArea6", "uiArea7", "uiArea8", "uiArea9", "uiArea10"]);



	var oDividers = {};

	var initDivider = function(idx, sWidth, sHeight, sType, bVisible){
		var sId = "oDivider" + idx;
		var oDivider = new HorizontalDivider(sId);
		if (sWidth) {oDivider.setWidth(sWidth);}
		if (sHeight) {oDivider.setHeight(sHeight);}
		if (sType) {oDivider.setType(sType);}
		if (bVisible != -1) {oDivider.setVisible(bVisible);}
		sap.ui.setRoot("uiArea" + idx, oDivider);
		oDividers[sId] = oDivider;
	};

	initDivider(1, null, null, null, -1); //Default values
	initDivider(2, "50%", "Large", "Page", false); //Invisible
	initDivider(3, "100px", "Ruleheight", "Area", -1);
	initDivider(4, "100px", "Small", "Area", -1);
	initDivider(5, "100px", "Medium", "Area", -1);
	initDivider(6, "100px", "Large", "Area", -1);
	initDivider(7, "100px", "Ruleheight", "Page", -1);
	initDivider(8, "100px", "Small", "Page", -1);
	initDivider(9, "100px", "Medium", "Page", -1);
	initDivider(10, "100px", "Large", "Page", -1);



	QUnit.module("Properties");

	QUnit.test("Default Values", function(assert) {
		var oDivider = oDividers["oDivider1"];
		assert.equal(oDivider.getWidth(), "100%", "Default 'width':");
		assert.equal(oDivider.getHeight(), "Medium", "Default 'height':");
		assert.equal(oDivider.getVisible(), true, "Default 'visible':");
		assert.equal(oDivider.getType(), "Area", "Default 'type':");
	 });

	QUnit.test("Custom Values", function(assert) {
		var oDivider = oDividers["oDivider2"];
		assert.equal(oDivider.getWidth(), "50%", "Custom 'width':");
		assert.equal(oDivider.getHeight(), "Large", "Custom 'height':");
		assert.equal(oDivider.getVisible(), false, "Custom 'visible':");
		assert.equal(oDivider.getType(), "Page", "Custom 'type':");
	 });

	QUnit.module("Visual Appearence");

	QUnit.test("Visibility", function(assert) {
		assert.equal(jQuery("#oDivider2").get(0), undefined, "Invisible:");
		assert.ok(jQuery("#oDivider1").get(0), "Visible: expected defined");
	});

	QUnit.test("Area Divider", function(assert) {
		for (var i = 3; i < 7; i++){
			var oDivider = jQuery("#oDivider" + i);
			var sDividerStyle = oDivider.attr("style");
			assert.ok(sDividerStyle.toLowerCase().indexOf("width: 100px") != -1 || sDividerStyle.toLowerCase().indexOf("width:100px") != -1, "Area - width set for divider " + i + " (" + sDividerStyle + "): expected 100px");
			assert.ok(oDivider.hasClass("sapUiCommonsHoriDiv"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDiv'");
			assert.ok(oDivider.hasClass("sapUiCommonsHoriDivTypeArea"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDivTypeArea'");
			switch (i){
				case 3:
					assert.ok(oDivider.hasClass("sapUiCommonsHoriDivHeightR"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDivHeightR'");
					break;
				case 4:
					assert.ok(oDivider.hasClass("sapUiCommonsHoriDivHeightS"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDivHeightS'");
					break;
				case 5:
					assert.ok(oDivider.hasClass("sapUiCommonsHoriDivHeightM"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDivHeightM'");
					break;
				case 6:
					assert.ok(oDivider.hasClass("sapUiCommonsHoriDivHeightL"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDivHeightL'");
					break;
				default:
					break;
			}
		}
	});

	QUnit.test("Page Divider", function(assert) {
		for (var i = 7; i < 11; i++){
			var oDivider = jQuery("#oDivider" + i);
			var sDividerStyle = oDivider.attr("style");
			assert.ok(sDividerStyle.toLowerCase().indexOf("width: 100px") != -1 || sDividerStyle.toLowerCase().indexOf("width:100px") != -1, "Area - width set for divider " + i + " (" + sDividerStyle + "): expected 100px");
			assert.ok(oDivider.hasClass("sapUiCommonsHoriDiv"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDiv'");
			assert.ok(oDivider.hasClass("sapUiCommonsHoriDivTypePage"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDivTypePage'");
			switch (i){
				case 7:
					assert.ok(oDivider.hasClass("sapUiCommonsHoriDivHeightR"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDivHeightR'");
					break;
				case 8:
					assert.ok(oDivider.hasClass("sapUiCommonsHoriDivHeightS"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDivHeightS'");
					break;
				case 9:
					assert.ok(oDivider.hasClass("sapUiCommonsHoriDivHeightM"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDivHeightM'");
					break;
				case 10:
					assert.ok(oDivider.hasClass("sapUiCommonsHoriDivHeightL"), "Divider " + i + " has CSS class 'sapUiCommonsHoriDivHeightL'");
					break;
				default:
					break;
			}
		}
	});
});