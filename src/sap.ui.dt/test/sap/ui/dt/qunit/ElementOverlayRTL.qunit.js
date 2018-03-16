/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	// internal
	"sap/ui/dt/ElementOverlay",
	// external
	"sap/m/Button"
], function(
	ElementOverlay,
	Button
) {
	'use strict';

	QUnit.module("Given that an Overlay Container is created on RTL mode", {
		beforeEach : function(assert) {
			var fnDone = assert.async();
			this.oButton = new Button({
				text : "Button"
			});

			this.oButton.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oOverlay = new ElementOverlay({
				element : this.oButton,
				isRoot: true,
				designTimeMetadata : {}
			});
			this.oOverlay.attachEventOnce("init", function() {
				this.oOverlay.placeInOverlayContainer();
				this.oOverlay.applyStyles();
				fnDone();
			}.bind(this));
		},
		afterEach : function() {
			this.oButton.destroy();
		}
	});

	QUnit.test("then", function(assert) {
		// Math.ceil is required for IE and Edge
		assert.deepEqual(
			Math.ceil(this.oOverlay.$().offset()),
			Math.ceil(this.oButton.$().offset()),
			"overlay has same position as the control"
		);
	});

	QUnit.start();
});