/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Image",
	"sap/m/FlexBox",
	"sap/m/VBox"
], function (
	createAndAppendDiv,
	Image,
	FlexBox,
	VBox
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
		items: [
			oItem1,
			oItem2
		]
	});
	oVBox1.setDisplayInline(false);
	oVBox1.setJustifyContent("Center");
	oVBox1.setAlignItems("End");
	oVBox1.setRenderType("List");
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
		var vbox1 = document.getElementById("vbox1");
		assert.ok(vbox1, "VBox 1 should be rendered");
		assert.strictEqual(vbox1.tagName, "UL", "VBox 1 should be rendered as UL");

		var item1 = document.getElementById("item1");
		assert.ok(item1, "First item of VBox 1 should be rendered");
		assert.strictEqual(vbox1.querySelector(".sapMFlexItem:first-child").tagName, "LI", "First item of VBox 1 should be rendered as LI");

		var item2 = document.getElementById("item2");
		assert.ok(item2, "Second item of VBox 1 should be rendered");
		assert.strictEqual(vbox1.querySelector(".sapMFlexItem:nth-child(2)").tagName, "LI", "Second item of VBox 1 should be rendered as LI");

		var vbox2 = document.getElementById("vbox2");
		assert.ok(vbox2, "VBox 2 should be rendered");
		assert.strictEqual(vbox2.tagName, "DIV", "VBox 2 should be rendered as DIV");

		var item3 = document.getElementById("item3");
		assert.ok(item3, "First item of VBox 2 should be rendered");
		assert.strictEqual(vbox2.querySelector(".sapMFlexItem:first-child").tagName, "DIV", "First item of VBox 2 should be rendered as DIV");

		var item4 = document.getElementById("item4");
		assert.ok(item4, "Second item of VBox 2 should be rendered");
		assert.strictEqual(vbox2.querySelector(".sapMFlexItem:nth-child(2)").tagName, "DIV", "Second item of VBox 2 should be rendered as DIV");
	});

	QUnit.module("Final spec property tests", {
		before: function () {
			this.vbox1ComputedStyle = window.getComputedStyle(document.getElementById("vbox1"));
			this.vbox2ComputedStyle = window.getComputedStyle(document.getElementById("vbox2"));
		},
		after: function () {
			this.vbox1ComputedStyle = null;
			this.vbox2ComputedStyle = null;
		}
	});

	QUnit.test("display", function(assert){
		assert.strictEqual(this.vbox1ComputedStyle.getPropertyValue("display"), "flex", "VBox display property should be set correctly in standard-compatible browsers");
		assert.strictEqual(this.vbox2ComputedStyle.getPropertyValue("display"), "inline-flex", "VBox display property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("flex-direction", function(assert){
		assert.strictEqual(this.vbox1ComputedStyle.getPropertyValue("flex-direction"), "column", "VBox flex-direction property should be set correctly in standard-compatible browsers");
		assert.strictEqual(this.vbox2ComputedStyle.getPropertyValue("flex-direction"), "column-reverse", "VBox flex-direction property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("justify-content", function(assert){
		assert.strictEqual(this.vbox1ComputedStyle.getPropertyValue("justify-content"), "center", "VBox justify-content property should be set correctly in standard-compatible browsers");
		assert.strictEqual(this.vbox2ComputedStyle.getPropertyValue("justify-content"), "flex-end", "VBox justify-content property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("align-items", function(assert){
		assert.strictEqual(this.vbox1ComputedStyle.getPropertyValue("align-items"), "flex-end", "VBox align-items property should be set correctly in standard-compatible browsers");
		assert.strictEqual(this.vbox2ComputedStyle.getPropertyValue("align-items"), "center", "VBox align-items property should be set correctly in standard-compatible browsers");
	});

	QUnit.module("Properties");

	QUnit.test("Direction - default value", function (assert) {
		assert.strictEqual(new VBox().getDirection(), "Column", "The default value of 'direction' property should be 'Column'");
	});

	QUnit.module("Overridden methods");

	QUnit.test("init", function (assert) {
		var flexBoxInitSpy = sinon.spy(FlexBox.prototype, "init"),
			oVBox = new VBox();

		assert.strictEqual(flexBoxInitSpy.calledOnce, true, "When VBox is initialized, the init method of FlexBox should also be called.");

		oVBox.destroy();
	});
});