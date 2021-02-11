/* global QUnit*/

sap.ui.define([
	"sap/ui/dt/ControlObserver",
	"sap/m/Button"
],
function (
	ControlObserver,
	Button
) {
	"use strict";

	QUnit.module("Given that a Button is observed", {
		beforeEach: function() {
			this.oButton = new Button();
			this.oControlObserver = new ControlObserver({
				target: this.oButton
			});
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oControlObserver.destroy();
			this.oButton.destroy();
		}
	}, function () {
		QUnit.test("when the property of the Button is modified", function (assert) {
			var done = assert.async();

			this.oControlObserver.attachEventOnce("modified", function (oEvent) {
				assert.ok(oEvent, 'then a "Changed" event is fired because of the property change');
				done();
			});

			this.oButton.setText("test");
		});

		QUnit.test("when the Button is re-rendered", function (assert) {
			var done = assert.async();

			this.oControlObserver.attachEventOnce("modified", function (oEvent) {
				assert.ok(oEvent.getParameter("type") === "afterRendering", 'DomChanged event is fired');
				done();
			});

			this.oButton.rerender();
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});