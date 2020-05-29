/* global QUnit */

sap.ui.define([
	"sap/ui/integration/Widget",
	"sap/ui/core/Core"
],
	function (
		Widget,
		Core
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		QUnit.module("Translations", {
			beforeEach: function () {
				this.oWidget = new Widget();
			},
			afterEach: function () {
				this.oWidget.destroy();
				this.oWidget = null;
			}
		});

		QUnit.test("Widget translations work", function (assert) {
			// Arrange
			var done = assert.async(),
				oExpected = {
					title: "Title of the Widget",
					description: "Description of the Widget"
				};

			this.oWidget.attachEventOnce("_ready", function () {
				var oApp = this.oWidget.getManifestEntry("/sap.app"),
					oParams = this.oWidget.getManifestEntry("/sap.widget/configuration/parameters");

				// Assert
				assert.strictEqual(oApp.title, oExpected.title, "Title is translated in sap.app.");
				assert.strictEqual(oParams.title.value, oExpected.title, "Title is translated in parameters.");
				assert.strictEqual(oApp.description, oExpected.description, "Description is translated in sap.app.");
				assert.strictEqual(oParams.description.value, oExpected.description, "Description is translated in parameters.");

				done();
			}.bind(this));

			// Act
			this.oWidget.setManifest("test-resources/sap/ui/integration/qunit/manifests/widget/manifest.json");

			this.oWidget.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});
	}
);
