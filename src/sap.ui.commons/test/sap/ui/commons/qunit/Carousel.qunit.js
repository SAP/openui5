/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/commons/Carousel",
	"sap/ui/commons/Image",
	"sap/ui/commons/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/dom/jquery/Focusable"
], function(qutils, createAndAppendDiv, Carousel, Image, commonsLibrary, KeyCodes) {
	"use strict";

	// shortcut for sap.ui.commons.enums.Orientation
	var Orientation = commonsLibrary.enums.Orientation;

	// prepare DOM
	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");



	function createCarousel(sOrientation) {
		var oCarousel = new Carousel();
		oCarousel.setHeight("400px");
		oCarousel.setOrientation(sOrientation);

		oCarousel.addContent(new Image("IMG1", {
			src : "test-resources/sap/ui/commons/images/carousel/img1.jpg",
			alt : "sample image",
			width : "200px",
			height : "150px"
		}));

		oCarousel.addContent(new Image("IMG2", {
			src : "test-resources/sap/ui/commons/images/carousel/img2.jpg",
			alt : "sample image",
			width : "100%",
			height : "100%"
		}));

		oCarousel.addContent(new Image("IMG3", {
			src : "test-resources/sap/ui/commons/images/carousel/img3.jpg",
			alt : "sample image",
			width : "100%",
			height : "100%"
		}));

		oCarousel.addContent(new Image("IMG4", {
			src : "test-resources/sap/ui/commons/images/carousel/img4.jpg",
			alt : "sample image",
			width : "100%",
			height : "100%"
		}));

		oCarousel.addContent(new Image("IMG5", {
			src : "test-resources/sap/ui/commons/images/carousel/img5.jpg",
			alt : "sample image",
			width : "100%",
			height : "100%"
		}));

		oCarousel.addContent(new Image("IMG6", {
			src : "test-resources/sap/ui/commons/images/carousel/img6.jpg",
			alt : "sample image",
			width : "100%",
			height : "100%"
		}));

		oCarousel.placeAt("uiArea1");

		return oCarousel;
	}

	function createCarousel2() {
		var oCarousel2 = new Carousel();
		oCarousel2.setWidth("900px");

		oCarousel2.addContent(new Image("IMG8", {
			src : "test-resources/sap/ui/commons/images/carousel/img1.jpg",
			alt : "sample image",
			width : "100%",
			height : "100%"
		}));

		oCarousel2.addContent(new Image("IMG9", {
			src : "test-resources/sap/ui/commons/images/carousel/img2.jpg",
			alt : "sample image",
			width : "100%",
			height : "100%"
		}));

		oCarousel2.addContent(new Image("IMG10", {
			src : "test-resources/sap/ui/commons/images/carousel/img3.jpg",
			alt : "sample image",
			width : "100%",
			height : "100%"
		}));

		oCarousel2.placeAt("uiArea2");
		return oCarousel2;
	}



	QUnit.module("Control Test - sap.ui.commons.Carousel API", {
		beforeEach : function () {
			this.oCarousel1 = createCarousel("vertical");
			this.oCarousel2 = createCarousel2();
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oCarousel1.destroy();
			this.oCarousel1 = null;
			this.oCarousel2.destroy();
			this.oCarousel2 = null;
		}
	});

	QUnit.test("Navigation Next Test", function(assert) {
		var done = assert.async();
		this.oCarousel1.showNext();
		this.oCarousel2.showNext();
		var that = this;
		setTimeout(
			function() {
				assert.strictEqual(that.oCarousel1.$('scrolllist').find('li:first')[0],
						that.oCarousel1.$('item-IMG2')[0],
					"Image 2 should be at first position.");
				assert.strictEqual(that.oCarousel2.$('scrolllist').find('li:first')[0],
						that.oCarousel2.$('item-IMG9')[0],
					"Image 9 should be at first position.");
				done();
			}, Math.max(this.oCarousel1.getAnimationDuration(), this.oCarousel2.getAnimationDuration()) + 750);
	});

	QUnit.test("Navigation Previous", function(assert) {
		var done = assert.async();
		this.oCarousel1.showPrevious();
		this.oCarousel2.showPrevious();
		var that = this;
		setTimeout(
			function() {
				assert.strictEqual(that.oCarousel1.$('scrolllist').find('li:first')[0],
						that.oCarousel1.$('item-IMG6')[0],
					"Image 6 should be at first position.");
				assert.strictEqual(that.oCarousel2.$('scrolllist') .find('li:first')[0],
						that.oCarousel2.$('item-IMG10')[0],
					"Image 10 should be at first position.");
				done();
			}, Math.max(this.oCarousel1.getAnimationDuration(), this.oCarousel2.getAnimationDuration()) + 750);
	});

	QUnit.test("Navigation ByID - test showElementWithId()", function(assert) {
		this.oCarousel1.showElementWithId('IMG4');
		assert.strictEqual(this.oCarousel1.$('scrolllist').find('li:first')[0], this.oCarousel1.$('item-IMG4')[0], "Image 4 should be at first position.");
		this.oCarousel2.showElementWithId('IMG10');
		assert.strictEqual(this.oCarousel2.$('scrolllist').find('li:first')[0], this.oCarousel2.$('item-IMG10')[0], "Image 10 should be at first position.");
	});

	QUnit.test("Test properties defaults as they are like a contract and part of API", function(assert) {
		var oCarousel = new Carousel();
		assert.strictEqual(oCarousel.getOrientation(), Orientation.horizontal, "Default orientation should be horizontal.");
		assert.strictEqual(oCarousel.getWidth(), "", "Default Width should be null.");
		assert.strictEqual(oCarousel.getHeight(), "", "Default Height should be null.");
		assert.strictEqual(oCarousel.getDefaultItemHeight(), 150, "Default Height should be 150.");
		assert.strictEqual(oCarousel.getDefaultItemWidth(), 150, "Default Width should be 150.");
		assert.strictEqual(oCarousel.getAnimationDuration(), 500, "Default Animation should be 500.");
		assert.strictEqual(oCarousel.getVisibleItems(), 0, "Default VisibleItems should be null.");
		assert.strictEqual(oCarousel.getHandleSize(), 22, "Default HandleSize should be 22.");
		assert.strictEqual(oCarousel.getFirstVisibleIndex(), 0, "Default FirstVisibleItem should be 0.");

		oCarousel.destroy();
		oCarousel = null;

	});

	QUnit.test("Test setFirstVisibleIndex ", function(assert) {

		this.oCarousel1.setFirstVisibleIndex(7);  // invalid value
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oCarousel1.$('scrolllist').find('li:first')[0], this.oCarousel1.$('item-IMG1')[0], "Image 1 should be at first position, as 7 is not valid.");
		assert.strictEqual(this.oCarousel1.getFirstVisibleIndex(), 0, "The default value should be 0, as 7 is not valid value");

		this.oCarousel1.setFirstVisibleIndex(5);  // the last element
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oCarousel1.$('scrolllist').find('li:first')[0], this.oCarousel1.$('item-IMG6')[0], "Image 6 should be at first position.");

	});

	QUnit.test("Test Navigation with empty list ", function(assert) {
		this.oCarousel1.destroyAggregation("content");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oCarousel1.getContent().length, 0, "Content size should be 0");
		this.oCarousel1.showNext();
		assert.strictEqual(this.oCarousel1.getFirstVisibleIndex(), 0, "The value should be default 0, as content is empty");

		this.oCarousel1.showPrevious();
		assert.strictEqual(this.oCarousel1.getFirstVisibleIndex(),0 , "The value should be default 0, as content is empty");
	});


	QUnit.module("sap.ui.commons.Carousel Events testing", {
		beforeEach : function () {
			this.oCarousel1 = createCarousel("vertical");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oCarousel1.destroy();
			this.oCarousel1 = null;
		}
	});

	QUnit.test("Test click on the control - Previous btn", function(assert) {
		var done = assert.async();
		assert.strictEqual(this.oCarousel1.$().length, 1 ,"Control is rendered...");
		var oPrevButton = this.oCarousel1.$("prevbutton");
		assert.strictEqual(oPrevButton.length, 1 ,"Previous element is rendered...");
		var oEvent = {
			target: this.oCarousel1.$('prevbutton')[0]
		};
		this.oCarousel1.onclick(oEvent);
//				oPrevButton.trigger("tap");
		var that = this;
		setTimeout(
				function() {
					assert.strictEqual(that.oCarousel1.$('scrolllist').find('li:first')[0],
							that.oCarousel1.$('item-IMG6')[0],
							"Image 6 should be at first position.");
					done();
				}, this.oCarousel1.getAnimationDuration() + 750);
	});

	QUnit.test("Test click on the control - Next btn", function(assert) {
		var done = assert.async();
		assert.strictEqual(this.oCarousel1.$().length, 1 ,"Control is rendered...");
		var oNextButton = this.oCarousel1.$("nextbutton");
		assert.strictEqual(oNextButton.length, 1 ,"Next element is rendered...");
		var oEvent = {
			target: this.oCarousel1.$('nextbutton')[0]
		};
		this.oCarousel1.onclick(oEvent);
		var that = this;
		setTimeout(
				function() {
					assert.strictEqual(that.oCarousel1.$('scrolllist').find('li:first')[0],
							that.oCarousel1.$('item-IMG2')[0],
							"Image 2 should be at first position.");
					done();
				}, this.oCarousel1.getAnimationDuration() + 750);
	});

	QUnit.test("Test click on the control - Invalid btn", function(assert) {
		var done = assert.async();
		assert.strictEqual(this.oCarousel1.$().length, 1 ,"Control is rendered...");

		var oEvent = {
			target: this.oCarousel1.$('alabala')[0]
		};
		this.oCarousel1.onclick(oEvent);
		var that = this;
		setTimeout(
				function() {
					assert.strictEqual(that.oCarousel1.$('scrolllist').find('li:first')[0],
							that.oCarousel1.$('item-IMG1')[0],
							"Image 1 should be at first position.");
					done();
				}, this.oCarousel1.getAnimationDuration() + 750);
	});

	QUnit.module("sap.ui.commons.Carousel Keyboard handling", {
		beforeEach : function () {
			this.oCarousel1 = createCarousel("vertical");
			this.oCarousel1.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oCarousel1.destroy();
			this.oCarousel1 = null;
		}
	});

	QUnit.test("Test keydown and Action mode ", function(assert) {
		var done = assert.async();
		// Action mode should be false
		assert.strictEqual(this.oCarousel1._bActionMode, undefined, "Action mode should be false by default");
		this.oCarousel1._oItemNavigation.setFocusedIndex(0);
		var $item = this.oCarousel1._oItemNavigation.getFocusedDomRef();
		qutils.triggerKeydown($item, KeyCodes.F2); // trigger F2 in order to start the mode
		qutils.triggerKeydown($item, KeyCodes.ARROW_DOWN); // trigger arrow down in order to move to the next el.
		var that = this;

		setTimeout(
				function() {

					assert.strictEqual(that.oCarousel1.$('scrolllist').find('li:first')[0],
							that.oCarousel1.$('item-IMG2')[0],
							"Image 2 should be at first position.");
					done();

				}, this.oCarousel1.getAnimationDuration() + 750);
	});

	QUnit.test("Test Arrow Up and Action mode ", function(assert) {
		var done = assert.async();

		// Action mode should be undefined
		assert.strictEqual(this.oCarousel1._bActionMode, undefined, "Action mode should be undefined by default");
		this.oCarousel1._oItemNavigation.setFocusedIndex(0);
		var $item = this.oCarousel1._oItemNavigation.getFocusedDomRef();
		qutils.triggerKeydown($item, KeyCodes.F2); // trigger F2 in order to start the mode
		qutils.triggerKeydown($item, KeyCodes.ARROW_UP); // trigger arrow up in order to move to the previous el.
		var that = this;
		var oEvent = {
			target: this.oCarousel1.$().find(".sapUiCrslScl").lastFocusableDomRef(),
			preventDefault: function() {
				assert.ok(true, "preventDefault is executed");
			},
			stopPropagation: function() {
				assert.ok(true, "stopPropagation is executed");
			}
		};

		setTimeout(
				function() {

					assert.strictEqual(that.oCarousel1.$('scrolllist').find('li:first')[0],
							that.oCarousel1.$('item-IMG6')[0],
							"Image 6 should be at first position.");
//
					that.oCarousel1._enterActionMode($item);
					assert.strictEqual(that.oCarousel1._bActionMode, true, "Action mode should be true ");

					that.oCarousel1.onsaptabnext(oEvent);

					that.oCarousel1._leaveActionMode({});
					assert.strictEqual(that.oCarousel1._bActionMode, false, "Action mode should be false ");
					// press Escape - should leave the action mode
					qutils.triggerKeydown($item, KeyCodes.ESCAPE);
					assert.strictEqual(that.oCarousel1._bActionMode, false, "Action mode should be false ");

					// remove from DOM and execute onresize test
					that.oCarousel1.$().remove();
					that.oCarousel1.onresize();
					assert.strictEqual(that.oCarousel1.sResizeListenerId, null, "Resize listener Id should be null ");

					done();

				}, this.oCarousel1.getAnimationDuration() + 750);
	});
});