/*global QUnit */
sap.ui.define([
	"sap/ui/core/ScrollBar",
	"sap/ui/Device",
	"sap/ui/events/jquery/EventSimulation",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Configuration"
], function(ScrollBar, Device, EventSimulation, jQuery, createAndAppendDiv, nextUIUpdate, Configuration) {
	"use strict";

	// create page content
	createAndAppendDiv(["target1", "target2", "target3", "target4"]);

	function createTestScrollbars(context) {
		// vertical scrollbar
		context.oVSB = new ScrollBar("vertSB", {
			vertical: true,
			size: "200px",
			// contentSize: "1000px", // disabled, oVSB should use 'step mode'
			scrollPosition: 4,
			steps: 100
		}).placeAt("target1");

		// horizontal scrollbar
		context.oHSB = new ScrollBar("horiSB", {
			vertical: false,
			size: "200px",
			contentSize: "1000px",
			scrollPosition: 50
		}).placeAt("target2");
	}

	QUnit.module("API and initial rendering", {
		beforeEach: function() {
			createTestScrollbars(this);
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oHSB.destroy();
			this.oVSB.destroy();
		}
	});

	QUnit.test("Orientation", function(assert) {
		assert.strictEqual(this.oVSB.getVertical(), true, "This is vertical scrollbar");
		assert.strictEqual(this.oHSB.getVertical(), false, "This is horizontal scrollbar");

		this.oVSB.setVertical(false);
		assert.strictEqual(this.oVSB.getVertical(), false, "This is not vertical scrollbar");
		this.oVSB.setVertical(true);
		assert.equal(this.oVSB.getVertical(), true, "This is vertical scrollbar");
	});

	QUnit.test("Scroll Position", function(assert) {
		assert.equal(jQuery("#horiSB-sb").scrollLeft(), 50, "Initial scroll position is 50");
		this.oVSB.setScrollPosition(5); // steps
		this.oHSB.setScrollPosition(38); // pixels
		assert.equal(jQuery("#horiSB-sb").scrollLeft(), 38, "scroll position is 38");

		assert.equal(this.oVSB.getScrollPosition(), 5, "1scroll position should be 5");
		assert.equal(this.oHSB.getScrollPosition(), 38, "1scroll position is 38");
		this.oVSB.rerender();
		this.oHSB.rerender();

		var done = assert.async();
		window.setTimeout(function(){
			assert.equal(this.oVSB.getScrollPosition(), 5, "2scroll position should be 5");
			assert.equal(this.oHSB.getScrollPosition(), 38, "2scroll position is 38");
			done();
		}.bind(this), 100);
	});

	QUnit.test("Size", function(assert) {
		this.oVSB.setSize("100px");
		assert.equal(this.oVSB.getSize(), "100px", "size of vertical scrollbar is 100px");
		assert.equal(this.oHSB.getSize(), "200px", "size of horizontal scrollbar is 200");
	});

	QUnit.test("Content Size and steps", function(assert) {
		assert.equal(this.oHSB.getContentSize(), "1000px", "size of content is 1000");
		assert.equal(this.oVSB.getSteps(), 100, "number of steps for vertical scrollbar is 100");
	});

	QUnit.module("Event handler", {
		beforeEach: function() {
			createTestScrollbars(this);
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oHSB.destroy();
			this.oVSB.destroy();
		}
	});

	QUnit.test("Scroll Event", function(assert) {
		assert.expect(3);
		var done = assert.async();

		var bScrolled = false;
		this.oHSB.attachScroll(function() {bScrolled = true;});
		assert.notEqual(bScrolled, true, "Scroll event was not fired yet");
		if ( Configuration.getRTL() && Device.browser.firefox){
			jQuery('#' + this.oHSB.getId() + ' > div').scrollLeft(-15);
		} else {
			jQuery('#' + this.oHSB.getId() + ' > div').scrollLeft(15);
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
		this.oVSB.setScrollPosition(8);
		// jQuery("#horiSB-sb").scrollLeft(155);

		setTimeout(function() {
			assert.equal(this.oVSB.getScrollPosition(), "8", "scroll position is 8 step");
			// TODO: this is quite often failing! Check why! Maybe we increase the timeout!
			//assert.equal(this.oHSB.getScrollPosition(), "155", "scroll position is 155 px");
			done();
		}.bind(this), 10);
	});


	QUnit.test("Scroll Huge Scrollbars", async function(assert) {
		assert.expect(1);
		var done = assert.async();
		// Support of Huge number of steps
		this.oVSB.setSteps(1000000); //8000000px in Chrom
		this.oVSB.setScrollPosition(300000);
		await nextUIUpdate.runSync(); // await is only kept to indicate later call w/o ".runSync"
		setTimeout(function() {
			assert.equal(this.oVSB.getScrollPosition(), "300000", "scroll position is 300000 step");
			done();
		}.bind(this), 500);
	});


	// Touch support
	QUnit.module("Touch Support", {
		beforeEach : function() {
			this.stub(EventSimulation, "touchEventMode").value("ON");

			this.oVSB = new ScrollBar("vertSBTouch");
			this.oVSB.setVertical(true);
			this.oVSB.setSize("200px");
			this.oVSB.setSteps(100);
			this.oVSB.placeAt("target3");

			// Horizontal Scrollbar
			this.oHSB = new ScrollBar("horiSBTouch");
			this.oHSB.setVertical(false);
			this.oHSB.setSize("200px");
			this.oHSB.setContentSize("1000px");
			this.oHSB.placeAt("target4");
			return nextUIUpdate();
		},

		afterEach : function() {
			this.oVSB.destroy();
			this.oVSB = null;
			this.oHSB.destroy();
			this.oHSB = null;
		}
	});

	QUnit.test("Touch Scrolling", function(assert) {
		assert.expect(2);
		var done = assert.async();
		this.oVSB._handleTouchScroll(0,192);
		this.oHSB._handleTouchScroll(155,0);

		setTimeout(function() {
			assert.equal(this.oVSB.getScrollPosition(), "8", "scroll position is 8 step");
			assert.equal(this.oHSB.getScrollPosition(), "155", "scroll position is 155 px");
			done();
		}.bind(this), 10);
	});

});
