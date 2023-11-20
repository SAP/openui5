/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/commons/ResponsiveContainer",
	"sap/ui/commons/TextView",
	"sap/ui/commons/ResponsiveContainerRange",
	"sap/m/Text"
], function(ResponsiveContainer, TextView, ResponsiveContainerRange, Text) {
	"use strict";


	QUnit.module("Rendering", {
		beforeEach : function () {

			this.oRC = new ResponsiveContainer({
				defaultContent: new TextView({
					text: "No content, too small"
				}),
				ranges: [
					new ResponsiveContainerRange({
						width: "200px",
						content: new Text({text: "test content 1"})
					}),
					new ResponsiveContainerRange({
						width: "400px",
						content: new Text({text: "test content 2"})
					}),
					new ResponsiveContainerRange({
						width: "60em",
						content: new Text({text: "test content 3"})
					})
				]
			});

			this.oRC.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oRC.destroy();
			this.oRC = null;
		}
	});

	QUnit.test("Inheritance", function (assert) {
		var oFirstRange = this.oRC.getRanges()[0];
		assert.strictEqual(oFirstRange.getMetadata().getParent().getName(), "sap.ui.core.Element", "'sap.ui.commons.ResponsiveContainerRange' inherits correctly");
	});

	QUnit.test("Control is rendered correctly", function (assert) {
		var $hiddenDiv = this.oRC.$().find("> div");
		var aRangeDivs = $hiddenDiv.find("> div");

		//Assert
		assert.strictEqual(this.oRC.$().length, 1, "Control is rendered");
		assert.strictEqual(this.oRC.$().find("> span").length, 1, "There should be one visible span containing the visible part of the control");
		assert.strictEqual($hiddenDiv.width(), 0, "Width of the hidden content should be 0");
		assert.strictEqual($hiddenDiv.height(), 0, "Height of the hidden content should be 0");
		assert.strictEqual($hiddenDiv.css("overflow"), "hidden", "Overflow of the hidden content should be 'hidden'");
		assert.strictEqual(aRangeDivs.length, 3, "There should be 3 range divs in the hidden content");
	});

	QUnit.module("API", {
		beforeEach : function () {
			this.oRCR = new ResponsiveContainerRange();
			this.oRC = new ResponsiveContainer({
				ranges: this.oRCR
			});
			this.oRC.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oRC.destroy();
			this.oRCR.destroy();
			this.oRC = null;
		}
	});

	QUnit.test("Default API values ResponsiveContainer", function (assert) {
		//Assert
		assert.strictEqual(this.oRC.getWidth(), "100%", "Width");
		assert.strictEqual(this.oRC.getHeight(), "100%", "Height");
	});

	QUnit.test("Default API values ResponsiveContainerRange", function (assert) {
		//Assert
		assert.strictEqual(this.oRCR.getWidth(), "", "Width");
		assert.strictEqual(this.oRCR.getHeight(), "", "Height");
		assert.strictEqual(this.oRCR.getKey(), "", "Key");
	});

	QUnit.test("setWidth", function (assert) {
		//Act
		this.oRC.setWidth("200px");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(this.oRC.$().css("width"), "200px", "Dom width shoud be set to 200px");
	});

	QUnit.test("setHeight", function (assert) {
		//Act
		this.oRC.setHeight("200px");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(this.oRC.$().css("height"), "200px", "Dom height shoud be set to 200px");
	});

	QUnit.module("Behaviour", {
		beforeEach : function () {

			this.oRC = new ResponsiveContainer({
				width: "199px",
				defaultContent: new TextView({
					text: "No content, too small"
				}),
				ranges: [
					new ResponsiveContainerRange("range1", {
						width: "200px",
						content: new Text({text: "test content 1"})
					}),
					new ResponsiveContainerRange("range2", {
						width: "400px",
						content: new Text({text: "test content 2"})
					}),
					new ResponsiveContainerRange("range3", {
						width: "60em",
						content: new Text({text: "test content 3"})
					})
				]
			});

			this.oRC.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// TODO-BRIDGE remove once the sinon-4 sandbox supports fake timers
			if ( this.clock == null ) {
				this.clock = this._oSandbox.useFakeTimers();
			}
		},
		afterEach : function () {
			this.oRC.destroy();
			this.oRC = null;
		}
	});

	QUnit.test("Default range", function (assert) {
		//Assert
		assert.strictEqual(this.oRC.$().width(), 199, "Current width should equal 199px");
		assert.strictEqual(this.oRC.findMatchingRange(), null, "Current range must be null");
		assert.strictEqual(this.oRC.$().find("> span").text(), "No content, too small", "On this size the current visible text should equal the default content");
	});

	QUnit.test("Range 1", function (assert) {
		//Act
		this.oRC.setWidth("201px");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1);

		//Assert
		assert.strictEqual(this.oRC.findMatchingRange().getId(), "range1", "On this container size the current matching range should be the first one");
		assert.strictEqual(this.oRC.$().find("> span").text(), "test content 1", "On this size the current visible content should be the first one");
	});

	QUnit.test("Range 2", function (assert) {
		//Act
		this.oRC.setWidth("401px");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1);

		//Assert
		assert.strictEqual(this.oRC.findMatchingRange().getId(), "range2", "On this container size the current matching range should be the second one");
		assert.strictEqual(this.oRC.$().find("> span").text(), "test content 2", "On this size the current visible content should be the second one");
	});

	QUnit.test("Range 3", function (assert) {
		//Act
		this.oRC.setWidth("60em");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1);

		//Assert
		assert.strictEqual(this.oRC.findMatchingRange().getId(), "range3", "On this container size the current matching range should be the third one");
		assert.strictEqual(this.oRC.$().find("> span").text(), "test content 3", "On this size the current visible content should be the third one");
	});

	QUnit.module("Events", {
		beforeEach : function () {

			this.oRC = new ResponsiveContainer({
				width: "199px",
				defaultContent: new TextView({
					text: "No content, too small"
				}),
				ranges: [
					new ResponsiveContainerRange({
						width: "200px",
						content: new Text({text: "test content 1"})
					}),
					new ResponsiveContainerRange({
						width: "400px",
						content: new Text({text: "test content 2"})
					})
				]
			});

			this.oRC.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// TODO-BRIDGE remove once the sinon-4 sandbox supports fake timers
			if ( this.clock == null ) {
				this.clock = this._oSandbox.useFakeTimers();
			}
		},
		afterEach : function () {
			this.oRC.destroy();
			this.oRC = null;
		}
	});

	QUnit.test("rangeSwitch event", function (assert) {
		// Arrange
		sinon.spy(this.oRC, 'onresize');
		sinon.spy(this.oRC, 'refreshRangeDimensions');
		sinon.spy(this.oRC, 'fireRangeSwitch');

		//Act
		this.oRC.setWidth("201px");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1);

		//Assert
		assert.ok(this.oRC.onresize.calledOnce, "onrezise method is called");
		assert.ok(this.oRC.refreshRangeDimensions.called, "refreshRangeDimensions event is called");
		assert.ok(this.oRC.fireRangeSwitch.called, "rangeSwitch event is called");
	});

	QUnit.module("Cleanup", {
		beforeEach : function () {
			this.oRC = new ResponsiveContainer();
			this.oRC.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach : function () {
			this.oRC.destroy();
			this.oRC = null;
		}
	});

	QUnit.test("Resize listener", function (assert) {
		//Assert
		assert.ok(this.oRC.sResizeListenerId, "Initially there should be a resize listener");

		//Act
		this.oRC.destroy();

		//Assert
		assert.ok(!this.oRC.sResizeListenerId, "After the control is destroyed the resize listener should be removed");
	});
});