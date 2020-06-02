/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/Image",
	"sap/m/HBox",
	"jquery.sap.global"
], function(createAndAppendDiv, Image, HBox, jQuery) {
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
		items:[
			oItem1,
			oItem2
		]
	});
	oHBox1.setDisplayInline(false);
	oHBox1.setJustifyContent('Center');
	oHBox1.setAlignItems('End');
	oHBox1.setRenderType('List');
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
	oHBox2.setJustifyContent('End');
	oHBox2.setAlignItems('Center');
	oHBox2.setRenderType('Div');
	oHBox2.placeAt("content");



	QUnit.test("Flex Boxes rendered", function(assert) {
		assert.ok(jQuery.sap.domById("hbox1"), "HBox 1 should be rendered");
		assert.equal(jQuery.sap.byId("hbox1").get(0).tagName, "UL", "HBox 1 should be rendered as UL");
		assert.ok(jQuery.sap.domById("item1"), "First item of HBox 1 should be rendered");
		assert.equal(jQuery.sap.byId("hbox1").find(".sapMFlexItem:first-child").get(0).tagName, "LI", "First item of HBox 1 should be rendered as LI");
		assert.ok(jQuery.sap.domById("item2"), "Second item of HBox 1 should be rendered");
		assert.equal(jQuery.sap.byId("hbox1").find(".sapMFlexItem:nth-child(2)").get(0).tagName, "LI", "Second item of HBox 1 should be rendered as LI");
		assert.ok(jQuery.sap.domById("hbox2"), "HBox 2 should be rendered");
		assert.equal(jQuery.sap.byId("hbox2").get(0).tagName, "DIV", "HBox 2 should be rendered as DIV");
		assert.ok(jQuery.sap.domById("item3"), "First item of HBox 2 should be rendered");
		assert.equal(jQuery.sap.byId("hbox2").find(".sapMFlexItem:first-child").get(0).tagName, "DIV", "First item of HBox 2 should be rendered as DIV");
		assert.ok(jQuery.sap.domById("item4"), "Second item of HBox 2 should be rendered");
		assert.equal(jQuery.sap.byId("hbox2").find(".sapMFlexItem:nth-child(2)").get(0).tagName, "DIV", "Second item of HBox 2 should be rendered as DIV");
	});

	QUnit.module('Final spec property tests');

	QUnit.test("display", function(assert) {
		assert.equal(jQuery("#hbox1").css('display'), "flex", "HBox display property should be set correctly in standard-compatible browsers");
		assert.equal(jQuery("#hbox2").css('display'), "inline-flex", "HBox display property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("flex-direction", function(assert) {
		assert.equal(jQuery("#hbox1").css('flex-direction'), "row", "HBox flex-direction property should be set correctly in standard-compatible browsers");
		assert.equal(jQuery("#hbox2").css('flex-direction'), "row-reverse", "HBox flex-direction property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("justify-content", function(assert) {
		assert.equal(jQuery("#hbox1").css('justify-content'), "center", "HBox justify-content property should be set correctly in standard-compatible browsers");
		assert.equal(jQuery("#hbox2").css('justify-content'), "flex-end", "HBox justify-content property should be set correctly in standard-compatible browsers");
	});

	QUnit.test("align-items", function(assert) {
		assert.equal(jQuery("#hbox1").css('align-items'), "flex-end", "HBox align-items property should be set correctly in standard-compatible browsers");
		assert.equal(jQuery("#hbox2").css('align-items'), "center", "HBox align-items property should be set correctly in standard-compatible browsers");
	});
});