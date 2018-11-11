/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/layout/VerticalLayout",
	"sap/ui/commons/Button",
	"sap/ui/commons/TextField",
	"sap/ui/commons/Image",
	"sap/ui/commons/Slider",
	"sap/ui/commons/TextArea",
	"sap/ui/commons/RatingIndicator",
	"sap/ui/commons/CheckBox",
	"sap/ui/thirdparty/jquery"
], function(
	createAndAppendDiv,
	VerticalLayout,
	Button,
	TextField,
	Image,
	Slider,
	TextArea,
	RatingIndicator,
	CheckBox,
	jQuery
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["uiArea1", "uiArea2"]);



	var oLayout1 = new VerticalLayout("Layout1", {
		content: [
			new Button("B1",{text:"Press me", tooltip:"Button tooltip"}),
			new TextField("TF1",{value:"Test"}),
			new Image("I1",{src:"http://www.sap.com/global/images/SAPLogo.gif"})
		]
	});
	oLayout1.placeAt("uiArea1");

	var oLayout2 = new VerticalLayout("Layout2", {
		width: "200px",
		content: [
			new Slider("S2",{Value:25, tooltip:"Slider tooltip", width: "300px"}),
			new TextArea("TA2",{value:"Test \n1\n2\n3\n4\n5\n6\n7\n8\n9", width: "250px", height: "150px"}),
			new RatingIndicator("RI2",{value: 4}),
			new CheckBox("CB2",{text: "Test"})
		]
	});
	oLayout2.placeAt("uiArea2");



	QUnit.module("Properties");

	QUnit.test("Default Values", function(assert) {
		assert.equal(oLayout1.getWidth(), "", "Default 'Width':");
	});

	QUnit.test("Custom Values", function(assert) {
		assert.equal(oLayout2.getWidth(), "200px", "Custom 'Width':");
	});

	QUnit.module("Visual Appearence");

	QUnit.test("Visibility", function(assert) {
		// controls must be one below the other -> same X coordinate, nut higher Y coordinate
		var oButtonDom = document.getElementById('B1');
		var oTextDom = document.getElementById('TF1');
		var oImageDom = document.getElementById('I1');
		assert.equal(oButtonDom.offsetLeft, oTextDom.offsetLeft, "Left offset of Button same as for TextField");
		assert.equal(oButtonDom.offsetLeft, oImageDom.offsetLeft, "Left offset of Button same as for Image");
		assert.ok(oButtonDom.offsetTop < oTextDom.offsetTop, "Top offset of Button < TextField");
		assert.ok(oTextDom.offsetTop < oImageDom.offsetTop, "Top offset of TextField < Image");

		// width must fit to defined one even if content is larger
		var oLayout2Dom = document.getElementById('Layout2');
		assert.equal(oLayout2Dom.offsetWidth, 200, "Width of Layout fits defined one");
		var oSliderDom = document.getElementById('S2');
		var oTextADom = document.getElementById('TA2');
		var oRatingDom = document.getElementById('RI2');
		var oCheckBDom = document.getElementById('CB2');
		assert.equal(oSliderDom.offsetLeft, oTextADom.offsetLeft, "Left offset of Slider same as for TextArea");
		assert.equal(oSliderDom.offsetLeft, oRatingDom.offsetLeft, "Left offset of Slider same as for RatingIndicator");
		assert.equal(oSliderDom.offsetLeft, oCheckBDom.offsetLeft, "Left offset of Slider same as for CheckBox");
		assert.ok(oSliderDom.offsetTop < oTextADom.offsetTop, "Top offset of Slider < TextArea");
		assert.ok(oTextADom.offsetTop < oRatingDom.offsetTop, "Top offset of TextArea < RatingIndicator");
		assert.ok(oRatingDom.offsetTop < oCheckBDom.offsetTop, "Top offset of RatingIndicator < CheckBox");


	});
});