/*global QUnit, sinon */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/ImageContent",
	"sap/ui/events/jquery/EventExtension"
], function(jQuery, ImageContent, EventExtension) {
	"use strict";


	var IMAGE_PATH = "test-resources/sap/m/images/";

	QUnit.module("Rendering test - sap.m.ImageContent", {
		beforeEach : function() {
			this.oImageContent = new ImageContent("img-cnt", {
				src: IMAGE_PATH + "headerImg1.png",
				description: "image descriptions ...",
				press: jQuery.noop
			});
			this.oImageContent.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oImageContent.destroy();
			this.oImageContent = null;
		}
	});

	QUnit.test("ImageContent and image rendered", function(assert) {
		assert.ok(jQuery.sap.domById("img-cnt"), "ImageContent was rendered successfully");
		assert.ok(jQuery.sap.domById("img-cnt-icon-image"), "Image was rendered successfully");
	});

	QUnit.test("Icon rendered", function(assert) {
		//Arrange
		var oSpy = sinon.spy(this.oImageContent, "_setPointerOnImage");
		//Act
		this.oImageContent.setSrc("sap-icon://travel-expense");
		sap.ui.getCore().applyChanges();
		//Assert
		assert.ok(jQuery.sap.domById("img-cnt-icon-image"), "Icon was rendered successfully");
		assert.equal(oSpy.callCount, 1, "During rendering _setPointerOnImage has been called");
	});

	QUnit.module("Tooltip test", {
		beforeEach : function() {
			this.oImageContent = new ImageContent("img-cnt", {
				src: IMAGE_PATH + "headerImg1.png",
				description: "        image descriptions        ",
				press: jQuery.noop
			});
			this.oImageContent.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oImageContent.destroy();
			this.oImageContent = null;
		}
	});

	QUnit.test("Tooltip generated", function(assert) {
		var sTooltip = this.oImageContent.getTooltip();
		assert.equal(sTooltip, "image descriptions", "The tooltip generated correctly");
	});

	QUnit.test("Description property is mapped to alt property of inner control", function(assert) {
		var sDescription = this.oImageContent.getDescription();
		var sAlt = this.oImageContent.getAggregation("_content").getAlt();
		assert.deepEqual(sDescription, sAlt, "Description is mapped to alt property of inner icon");
	});

	QUnit.test("getAltText returns 'description' property which was mapped to inner 'alt' property", function(assert) {
		var sAlt = this.oImageContent.getAggregation("_content").getAlt();
		var sAltTest = this.oImageContent.getAltText();
		assert.deepEqual(sAlt, sAltTest, "Description is mapped to alt property of inner icon");
	});

	QUnit.test("In case no description is set, getAltText method should return the default", function(assert) {
		this.oImageContent.setDescription("");
		sap.ui.getCore().applyChanges();
		var sAlt = this.oImageContent.getAggregation("_content").getAlt();
		assert.deepEqual(sAlt, "", "Alt property of inner control is empty");
	});

	QUnit.test("In case no description is set, getAltText method should return the default of the inner control", function(assert) {
		this.oImageContent.setDescription("");
		this.oImageContent.setSrc("sap-icon://travel-expense");
		sap.ui.getCore().applyChanges();
		var sAltText = this.oImageContent.getAltText();
		assert.equal(sAltText, "", "Inner control's text should be ignored for decorative images.");
	});

	QUnit.module("Event tests", {
		beforeEach : function() {
			this.ftnPressHandler = function() {
			};
			this.ftnHoverHandler = function() {
			};
			this.oImageContent = new ImageContent("img-cnt", {
				src: IMAGE_PATH + "headerImg1.png"
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			sinon.spy(this, "ftnPressHandler");
		},
		afterEach : function() {
			this.ftnPressHandler.restore();
			this.oImageContent.destroy();
			this.oImageContent = null;
		}
	});

	QUnit.test("Tap test", function(assert) {
		this.oImageContent.attachEvent("press", this.ftnPressHandler);
		this.oImageContent.$().trigger('tap');
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered");
	});

	QUnit.test("Enter test", function(assert) {
		this.oImageContent.attachEvent("press", this.ftnPressHandler);
		this.oImageContent.$().trigger(jQuery.Event('keydown', {which: 13}));
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered");
	});

	QUnit.test("Space test", function(assert) {
		this.oImageContent.attachEvent("press", this.ftnPressHandler);
		this.oImageContent.$().trigger(jQuery.Event('keydown', {which: 32}));
		assert.ok(this.ftnPressHandler.calledOnce, "Press event is triggered");
	});

	QUnit.test("Attach not available events", function(assert) {
		//Arrange
		//Act
		this.oImageContent.attachEvent("hover", this.ftnHoverHandler, this.oImageContent);
		//Assert
		assert.notOk(this.oImageContent.$().attr("tabindex"), "Attribute has not been added successfully because hover handler was not available");
		assert.notOk(this.oImageContent.$().hasClass("sapMPointer"), "Class has not been added successfully because hover handler was not available");
	});

	QUnit.test("Attach events", function(assert) {
		//Arrange
		//Act
		this.oImageContent.attachEvent("press", this.ftnPressHandler, this.oImageContent);
		//Assert
		assert.equal(this.oImageContent.$().attr("tabindex"), "0", "Attribute has been added successfully because press handler was available");
		assert.ok(this.oImageContent.$().hasClass("sapMPointer"), "Class has been added successfully because press handler was available");
		assert.ok(this.oImageContent.getAggregation("_content").hasStyleClass("sapMPointer"), "Class has been successfully added to the inner Image");
	});

	QUnit.test("Detach events", function(assert) {
		//Arrange
		this.oImageContent.attachEvent("press", this.ftnPressHandler, this.oImageContent);
		//Act
		this.oImageContent.detachEvent("press", this.ftnPressHandler, this.oImageContent);
		//Assert
		assert.notOk(this.oImageContent.$().attr("tabindex"), "Attribute has been removed successfully");
		assert.notOk(this.oImageContent.$().hasClass("sapMPointer"), "Class has been removed successfully");
		assert.notOk(this.oImageContent.getAggregation("_content").hasStyleClass("sapMPointer"), "Class has been successfully removed from the inner Image");
	});

});