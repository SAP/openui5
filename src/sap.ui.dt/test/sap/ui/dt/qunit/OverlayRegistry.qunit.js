/* global QUnit */

sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/AggregationOverlay",
	"sap/ui/core/UIComponent",
	"sap/m/Button"
], function (
	OverlayRegistry,
	ElementOverlay,
	AggregationOverlay,
	UIComponent,
	Button
) {
	"use strict";

	QUnit.module("Basic functionality", {
		beforeEach: function() {
			this.oButton = new Button();
			this.oOverlay = new ElementOverlay({
				element: this.oButton
			});
		},
		afterEach: function() {
			this.oOverlay.destroy();
			this.oButton.destroy();
		}
	}, function () {
		QUnit.test("register()/deregister()/getOverlays()", function(assert) {
			OverlayRegistry.register(this.oOverlay);
			assert.strictEqual(OverlayRegistry.getOverlays().length, 1, "then OverlayRegistry has one overlay");

			OverlayRegistry.deregister(this.oOverlay);
			assert.strictEqual(OverlayRegistry.getOverlays().length, 0, "then OverlayRegistry has no overlays");
		});

		QUnit.test("hasOverlays()", function(assert) {
			OverlayRegistry.register(this.oOverlay);
			assert.ok(OverlayRegistry.hasOverlays(), "then OverlayRegistry has one overlay");

			OverlayRegistry.deregister(this.oOverlay);
			assert.notOk(OverlayRegistry.hasOverlays(), "then OverlayRegistry has no overlays");
		});

		QUnit.test("getOverlay()", function(assert) {
			OverlayRegistry.register(this.oOverlay);
			assert.strictEqual(OverlayRegistry.getOverlay(this.oOverlay.getId()), this.oOverlay, "then the correct overlay was returned by its id");
			assert.strictEqual(OverlayRegistry.getOverlay(this.oButton.getId()), this.oOverlay, "then the correct overlay was returned by corresponding element id");
			assert.strictEqual(OverlayRegistry.getOverlay(this.oButton), this.oOverlay, "then the correct overlay was returned by corresponding element instance");
			OverlayRegistry.deregister(this.oOverlay);
			assert.strictEqual(OverlayRegistry.getOverlay(this.oOverlay.getId()), undefined, "then no overlay was returned by its id");
			assert.strictEqual(OverlayRegistry.getOverlay(this.oButton.getId()), undefined, "then no overlay was returned by corresponding element id");
			assert.strictEqual(OverlayRegistry.getOverlay(this.oButton), undefined, "then no overlay was returned by corresponding element instance");
		});

		QUnit.test("getOverlay() for AggregationOverlay", function(assert) {
			var oAggregationOverlay = new AggregationOverlay({
				element: this.oButton
			});
			OverlayRegistry.register(oAggregationOverlay);
			assert.strictEqual(OverlayRegistry.getOverlay(oAggregationOverlay.getId()), oAggregationOverlay, "then the correct overlay was returned by its id");
			assert.strictEqual(OverlayRegistry.getOverlay(this.oButton.getId()), undefined, "then no overlay was returned by corresponding element id");
			assert.strictEqual(OverlayRegistry.getOverlay(this.oButton), undefined, "then no overlay was returned by corresponding element instance");
			OverlayRegistry.deregister(oAggregationOverlay);
		});
	});

	QUnit.module("Validation", function () {
		QUnit.test("register()/deregister()", function(assert) {
			assert.throws(
				function() {
					OverlayRegistry.register({});
				},
				/.*/,
				"then it's not possible to register anything but sap.ui.dt.Overlay descendant"
			);
			assert.throws(
				function() {
					OverlayRegistry.deregister({});
				},
				/.*/,
				"then it's not possible to deregister anything but sap.ui.dt.Overlay descendant"
			);
		});
	});

	QUnit.module("getOverlay() for Component", {
		beforeEach: function () {
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				createContent: function() {}
			});

			this.oComponent = new CustomComponent();

			this.oElementOverlay = new ElementOverlay({
				element: this.oComponent
			});
		},
		afterEach: function () {
			this.oElementOverlay.destroy();
			this.oComponent.destroy();
			OverlayRegistry.deregister(this.oElementOverlay);
		}
	}, function () {
		QUnit.test("getOverlay() by object instance", function (assert) {
			OverlayRegistry.register(this.oElementOverlay);
			assert.strictEqual(OverlayRegistry.getOverlays().length, 1);
			assert.strictEqual(OverlayRegistry.getOverlay(this.oComponent), this.oElementOverlay);
		});

		QUnit.test("getOverlay() by id", function (assert) {
			OverlayRegistry.register(this.oElementOverlay);
			assert.strictEqual(OverlayRegistry.getOverlays().length, 1);
			assert.strictEqual(OverlayRegistry.getOverlay(this.oComponent.getId()), this.oElementOverlay);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});