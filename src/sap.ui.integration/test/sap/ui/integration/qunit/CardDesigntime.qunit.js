/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core"
],
function (
	Card,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Card designtime", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Designtime can be loaded", function (assert) {

		// Arrange
		var done = assert.async();
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/cardWithDesigntime/manifest.json");
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		this.oCard.attachEvent("_ready", function () {
			this.oCard.loadDesigntime().then(function (oResult) {
				assert.ok(oResult.designtime, "Design time is loaded.");
				assert.ok(oResult.manifest, "Card manifest is provided in load designtime result.");
				done();
			});
		}.bind(this));
	});
});