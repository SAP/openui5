/* global QUnit */

sap.ui.define([
	"sap/ui/dt/ControlObserver",
	"sap/m/Button",
	"sap/ui/qunit/utils/nextUIUpdate"
],
function(
	ControlObserver,
	Button,
	nextUIUpdate
) {
	"use strict";

	QUnit.module("Given that a Button is observed", {
		beforeEach() {
			this.oButton = new Button();
			this.oControlObserver = new ControlObserver({
				target: this.oButton
			});
			this.oButton.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach() {
			this.oControlObserver.destroy();
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when the property of the Button is modified", function(assert) {
			var done = assert.async();

			this.oControlObserver.attachEventOnce("modified", function(oEvent) {
				assert.ok(oEvent, 'then a "Changed" event is fired because of the property change');
				done();
			});

			this.oButton.setText("test");
		});

		QUnit.test("when the Button is re-rendered", function(assert) {
			var done = assert.async();

			this.oControlObserver.attachEventOnce("modified", function(oEvent) {
				assert.ok(oEvent.getParameter("type") === "afterRendering", "DomChanged event is fired");
				done();
			});

			this.oButton.invalidate();
			this.oButton.rerender();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});