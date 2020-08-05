/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Image",
	"sap/m/FlexBox",
	"sap/m/VBox",
	"jquery.sap.global"
], function(
	createAndAppendDiv,
	Image,
	FlexBox,
	VBox,
	jQuery
) {
	"use strict";

	createAndAppendDiv("content");

	var IMAGE_PATH = "test-resources/sap/m/images/";

	// Create items
	var oItem1 = new Image("item1", {
				src: IMAGE_PATH + "mark1.png",
				alt: "test image",
				decorative: false
			});

	var oItem2 = new Image("item2", {
				src: IMAGE_PATH + "mark2.png",
				alt: "test image",
				decorative: false
			});

	// Create a VBox with items
	var oVBox1 = new VBox("vbox1", {
		items:[
			oItem1,
			oItem2
		]
	});
	oVBox1.setDisplayInline(false);
	oVBox1.setJustifyContent('Center');
	oVBox1.setAlignItems('End');
	oVBox1.setRenderType('List');
	oVBox1.placeAt("content");


	// Create items
	var oItem3 = new Image("item3", {
				src: IMAGE_PATH + "mark1.png",
				alt: "test image",
				decorative: false
			});

	var oItem4 = new Image("item4", {
				src: IMAGE_PATH + "mark2.png",
				alt: "test image",
				decorative: false
			});

	// Create a VBox with items
	var oVBox2 = new VBox("vbox2", {
		items:[
			oItem3,
			oItem4
		]
	});
	oVBox2.setDirection("ColumnReverse");
	oVBox2.setDisplayInline(true);
	oVBox2.setJustifyContent('End');
	oVBox2.setAlignItems('Center');
	oVBox2.setRenderType('Div');
	oVBox2.placeAt("content");

	QUnit.test("Flex Boxes rendered", function(assert){
		assert.ok(jQuery.sap.domById("vbox1"), "VBox 1 should be rendered");
		assert.equal(jQuery.sap.byId("vbox1").get(0).tagName, "UL", "VBox 1 should be rendered as UL");
		assert.ok(jQuery.sap.domById("item1"), "First item of VBox 1 should be rendered");
		assert.equal(jQuery.sap.byId("vbox1").find(".sapMFlexItem:first-child").get(0).tagName, "LI", "First item of VBox 1 should be rendered as LI");
		assert.ok(jQuery.sap.domById("item2"), "Second item of VBox 1 should be rendered");
		assert.equal(jQuery.sap.byId("vbox1").find(".sapMFlexItem:nth-child(2)").get(0).tagName, "LI", "Second item of VBox 1 should be rendered as LI");
		assert.ok(jQuery.sap.domById("vbox2"), "VBox 2 should be rendered");
		assert.equal(jQuery.sap.byId("vbox2").get(0).tagName, "DIV", "VBox 2 should be rendered as DIV");
		assert.ok(jQuery.sap.domById("item3"), "First item of VBox 2 should be rendered");
		assert.equal(jQuery.sap.byId("vbox2").find(".sapMFlexItem:first-child").get(0).tagName, "DIV", "First item of VBox 2 should be rendered as DIV");
		assert.ok(jQuery.sap.domById("item4"), "Second item of VBox 2 should be rendered");
		assert.equal(jQuery.sap.byId("vbox2").find(".sapMFlexItem:nth-child(2)").get(0).tagName, "DIV", "Second item of VBox 2 should be rendered as DIV");
	});

	QUnit.module('Final spec property tests');

	QUnit.test("display", function(assert){
		assert.equal(jQuery("#vbox1").css('display'), "flex", "VBox display property should be set correctly in standard-compatible browsers");
		assert.equal(jQuery("#vbox2").css('display'), "inline-flex", "VBox display property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("flex-direction", function(assert){
		assert.equal(jQuery("#vbox1").css('flex-direction'), "column", "VBox flex-direction property should be set correctly in standard-compatible browsers");
		assert.equal(jQuery("#vbox2").css('flex-direction'), "column-reverse", "VBox flex-direction property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("justify-content", function(assert){
		assert.equal(jQuery("#vbox1").css('justify-content'), "center", "VBox justify-content property should be set correctly in standard-compatible browsers");
		assert.equal(jQuery("#vbox2").css('justify-content'), "flex-end", "VBox justify-content property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("align-items", function(assert){
		assert.equal(jQuery("#vbox1").css('align-items'), "flex-end", "VBox align-items property should be set correctly in standard-compatible browsers");
		assert.equal(jQuery("#vbox2").css('align-items'), "center", "VBox align-items property should be set correctly in standard-compatible browsers");
	});

	QUnit.module("Properties");

	QUnit.test("Direction - default value", function (assert) {
		var oVBox = new VBox();

		assert.strictEqual(oVBox.getDirection(), "Column", "The default value of 'direction' property should be 'Column'");
	});

	QUnit.module("Overridden methods");

	QUnit.test("init", function (assert) {
		var flexBoxInitSpy = sinon.spy(FlexBox.prototype, "init"),
			oVBox = new VBox();

		assert.ok(flexBoxInitSpy.calledOnce, "When VBox is initialized, the init method of FlexBox should also be called.");

		oVBox.destroy();
		flexBoxInitSpy.restore();
	});
});