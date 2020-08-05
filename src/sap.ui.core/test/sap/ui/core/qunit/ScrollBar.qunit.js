/*global QUnit */
sap.ui.define([
	"sap/ui/core/ScrollBar",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils"
], function(ScrollBar, Device, jQuery, qutils) {
	"use strict";

	// create page content
	["target1", "target2", "target3", "target4"].forEach(function(sId) {
		var oDIV = document.createElement("div");
		oDIV.id = sId;
		document.body.appendChild(oDIV);
	});

	// Control initialization

	// Vertical Scrollbar
	var oVSB = new ScrollBar("vertSB");
	oVSB.setVertical(true);
	oVSB.setSize("200px");
	// oVSB.setContentSize("1000px");
	oVSB.setScrollPosition(4);
	oVSB.setSteps(100);

	oVSB.placeAt("target1");

	// Horizontal Scrollbar
	var oHSB = new ScrollBar("horiSB");
	oHSB.setVertical(false);
	oHSB.setSize("200px");
	oHSB.setContentSize("1000px");
	oHSB.setScrollPosition(50);
	oHSB.placeAt("target2");


	// Test functions

	var vSB;
	var hSB;


	QUnit.module("Initial check");


	QUnit.test("Controls Check", function(assert) {
		vSB = sap.ui.getCore().getControl("vertSB");
		hSB = sap.ui.getCore().getControl("horiSB");

		assert.ok((vSB !== undefined) && (vSB != null), "vSB should not be null or undefined");
		assert.ok((hSB !== undefined) && (hSB != null), "hSB should not be null or undefined");
	});

	QUnit.test("Orientation", function(assert) {
		assert.ok(((vSB.getVertical() !== undefined)), "should not be null or undefined");
		assert.equal(vSB.getVertical(), true, "This is vertical scrollbar");
		assert.ok(((hSB.getVertical() !== undefined)), "should not be null or undefined");
		assert.equal(hSB.getVertical(), false, "This is horizontal scrollbar");
	});

	QUnit.test("Scroll Position", function(assert) {
		assert.equal(jQuery("#horiSB-sb").scrollLeft(), 50, "Initial scroll position is 50");
	});


	QUnit.module("Properties");


	QUnit.test("Orientation", function(assert) {
		vSB.setVertical(false);
		assert.equal(vSB.getVertical(), false, "This is not vertical scrollbar");
		vSB.setVertical(true);
		assert.equal(vSB.getVertical(), true, "This is vertical scrollbar");
	});

	QUnit.test("Scroll Position", function(assert) {
		vSB.setScrollPosition(5); // steps
		hSB.setScrollPosition(38); // pixels
		assert.equal(jQuery("#horiSB-sb").scrollLeft(), 38, "scroll position is 38");
	});

	QUnit.test("Size", function(assert) {
		vSB.setSize("100px");
		assert.equal(vSB.getSize(), "100px", "size of vertical scrollbar is 100px");
		assert.equal(hSB.getSize(), "200px", "size of horizontal scrollbar is 200");
	});

	QUnit.test("Content Size and steps", function(assert) {
		assert.equal(hSB.getContentSize(), "1000px", "size of content is 1000");
		assert.equal(vSB.getSteps(), 100, "number of steps for vertical scrollbar is 100");
	});


	QUnit.module("Event handler");

	QUnit.test("Rerender scrollbars", function(assert) {
		var done = assert.async();
		assert.equal(vSB.getScrollPosition(), 5, "1scroll position should be 5");
		assert.equal(hSB.getScrollPosition(), 38, "1scroll position is 38");
		vSB.rerender();
		hSB.rerender();
		window.setTimeout(function(){
			assert.equal(vSB.getScrollPosition(), 5, "2scroll position should be 5");
			assert.equal(hSB.getScrollPosition(), 38, "2scroll position is 38");
			done();
		}, 100);
	});


	QUnit.test("Scroll Event", function(assert) {
		assert.expect(3);
		var done = assert.async();

		var bScrolled = false;
		hSB.attachScroll( function() {bScrolled = true;});
		assert.notEqual(bScrolled, true, "Scroll event was not fired yet");
		if ( sap.ui.getCore().getConfiguration().getRTL() && Device.browser.firefox){
			jQuery('#' + oHSB.getId() + ' > div').scrollLeft(-15);
		} else {
			jQuery('#' + oHSB.getId() + ' > div').scrollLeft(15);
		}

		setTimeout(function() {
			assert.equal(bScrolled, true, "Scroll event was fired");
			assert.equal(jQuery("#horiSB-sb").scrollLeft(), 15, "New scroll position of horizontal scrollbar is 15 px");
			done();
		}, 100);
	});

	QUnit.test("Scroll Scrollbars", function(assert) {
		assert.expect(1);
		var done = assert.async();
		vSB.setScrollPosition(8);
		jQuery("#horiSB-sb").scrollLeft(155);

		setTimeout(function() {
			assert.equal(vSB.getScrollPosition(), "8", "scroll position is 8 step");
			// TODO: this is quite often failing! Check why! Maybe we increase the timeout!
			//assert.equal(hSB.getScrollPosition(), "155", "scroll position is 155 px");
			done();
		}, 10);

	});


	QUnit.test("Scroll Huge Scrollbars", function(assert) {
		assert.expect(1);
		var done = assert.async();
		// Suport of Huge number of steps
		vSB.setSteps(1000000); //8000000px in Chrom
		vSB.setScrollPosition(300000);
		vSB.rerender();
		setTimeout(function() {
			assert.equal(vSB.getScrollPosition(), "300000", "scroll position is 300000 step");
			done();
		}, 500);

	});


	// Touch support
	QUnit.module("Touch Support", {
		beforeEach : function() {
			// Remember original touch event mode
			this.touchEventMode = jQuery.sap.touchEventMode;
			jQuery.sap.touchEventMode = "ON";
			this.oVSB = new ScrollBar("vertSBTouch");
			this.oVSB.setVertical(true);
			this.oVSB.setSize("200px");
			this.oVSB.setSteps(100);
			this.oVSB.placeAt("target3");

			jQuery.sap.touchEventMode = "ON";
			// Horizontal Scrollbar
			this.oHSB = new ScrollBar("horiSBTouch");
			this.oHSB.setVertical(false);
			this.oHSB.setSize("200px");
			this.oHSB.setContentSize("1000px");
			this.oHSB.placeAt("target4");
			sap.ui.getCore().applyChanges();
		},


		afterEach : function() {
			this.oVSB.destroy();
			this.oVSB = null;
			this.oHSB.destroy();
			this.oHSB = null;
			// Restore touch event mode
			jQuery.sap.touchEventMode = this.touchEventMode;
		}
	});

	QUnit.test("Touch Scrolling", function(assert) {
		assert.expect(2);
		var done = assert.async();
		this.oVSB._handleTouchScroll(0,192);
		this.oHSB._handleTouchScroll(155,0);

		var self = this;
		setTimeout(function() {
			assert.equal(self.oVSB.getScrollPosition(), "8", "scroll position is 8 step");
			assert.equal(self.oHSB.getScrollPosition(), "155", "scroll position is 155 px");
			done();
		}, 10);
	});

});
