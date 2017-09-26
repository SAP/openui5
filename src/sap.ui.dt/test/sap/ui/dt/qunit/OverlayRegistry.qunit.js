/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/ElementOverlay',
	'sap/ui/dt/AggregationOverlay',
	'sap/m/Button'
],
function(
	OverlayRegistry,
	ElementOverlay,
	AggregationOverlay,
	Button
) {
	'use strict';
	QUnit.start();

	jQuery.sap.require("sap.m.Button");

	QUnit.module("Basic functionality", {
		beforeEach : function() {
			this.oButton = new Button();
			this.oOverlay = new ElementOverlay({
				element: this.oButton
			});
		},
		afterEach : function() {
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
});