/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Image",
	"sap/m/HBox"
], function (
	createAndAppendDiv,
	Image,
	HBox
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

	// Create a HBox with items
	var oHBox1 = new HBox("hbox1", {
		items: [
			oItem1,
			oItem2
		]
	});
	oHBox1.setDisplayInline(false);
	oHBox1.setJustifyContent("Center");
	oHBox1.setAlignItems("End");
	oHBox1.setRenderType("List");
	oHBox1.placeAt("content");

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

	// Create a HBox with box items
	var oHBox2 = new HBox("hbox2", {
		items:[
			oItem3,
			oItem4
		]
	});
	oHBox2.setDirection("RowReverse");
	oHBox2.setDisplayInline(true);
	oHBox2.setJustifyContent("End");
	oHBox2.setAlignItems("Center");
	oHBox2.setRenderType("Div");
	oHBox2.placeAt("content");

	QUnit.test("Flex Boxes rendered", function(assert) {
		var hbox1 = document.getElementById("hbox1");
		assert.ok(hbox1, "HBox 1 should be rendered");
		assert.strictEqual(hbox1.tagName, "UL", "HBox 1 should be rendered as UL");

		var item1 = document.getElementById("item1");
		assert.ok(item1, "First item of HBox 1 should be rendered");
		assert.strictEqual(hbox1.querySelector(".sapMFlexItem:first-child").tagName, "LI", "First item of HBox 1 should be rendered as LI");

		var item2 = document.getElementById("item2");
		assert.ok(item2, "Second item of HBox 1 should be rendered");
		assert.strictEqual(hbox1.querySelector(".sapMFlexItem:nth-child(2)").tagName, "LI", "Second item of HBox 1 should be rendered as LI");

		var hbox2 = document.getElementById("hbox2");
		assert.ok(hbox2, "HBox 2 should be rendered");
		assert.strictEqual(hbox2.tagName, "DIV", "HBox 2 should be rendered as DIV");

		var item3 = document.getElementById("item3");
		assert.ok(item3, "First item of HBox 2 should be rendered");
		assert.strictEqual(hbox2.querySelector(".sapMFlexItem:first-child").tagName, "DIV", "First item of HBox 2 should be rendered as DIV");

		var item4 = document.getElementById("item4");
		assert.ok(item4, "Second item of HBox 2 should be rendered");
		assert.strictEqual(hbox2.querySelector(".sapMFlexItem:nth-child(2)").tagName, "DIV", "Second item of HBox 2 should be rendered as DIV");
	});

	QUnit.module("Final spec property tests", {
		before: function () {
			this.hbox1ComputedStyle = window.getComputedStyle(document.getElementById("hbox1"));
			this.hbox2ComputedStyle = window.getComputedStyle(document.getElementById("hbox2"));
		},
		after: function () {
			this.hbox1ComputedStyle = null;
			this.hbox2ComputedStyle = null;
		}
	});

	QUnit.test("display", function(assert) {
		assert.strictEqual(this.hbox1ComputedStyle.getPropertyValue("display"), "flex", "HBox display property should be set correctly in standard-compatible browsers");
		assert.strictEqual(this.hbox2ComputedStyle.getPropertyValue("display"), "inline-flex", "HBox display property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("flex-direction", function(assert) {
		assert.equal(this.hbox1ComputedStyle.getPropertyValue("flex-direction"), "row", "HBox flex-direction property should be set correctly in standard-compatible browsers");
		assert.equal(this.hbox2ComputedStyle.getPropertyValue("flex-direction"), "row-reverse", "HBox flex-direction property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("justify-content", function(assert) {
		assert.equal(this.hbox1ComputedStyle.getPropertyValue("justify-content"), "center", "HBox justify-content property should be set correctly in standard-compatible browsers");
		assert.equal(this.hbox2ComputedStyle.getPropertyValue("justify-content"), "flex-end", "HBox justify-content property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("align-items", function(assert) {
		assert.equal(this.hbox1ComputedStyle.getPropertyValue("align-items"), "flex-end", "HBox align-items property should be set correctly in standard-compatible browsers");
		assert.equal(this.hbox2ComputedStyle.getPropertyValue("align-items"), "center", "HBox align-items property should be set correctly in standard-compatible browsers");
	});

	QUnit.module("Properties");

	QUnit.test("Direction - default value", function (assert) {
		assert.strictEqual(new HBox().getDirection(), "Row", "The default value of 'direction' property should be 'Row'");
	});
});