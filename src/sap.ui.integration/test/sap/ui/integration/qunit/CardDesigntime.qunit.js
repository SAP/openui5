/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/ui/integration/Designtime"
],
function (
	Card,
	Core,
	Designtime
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
		var done = assert.async(),
			fnCardReadySpy = sinon.spy(Designtime.prototype, "onCardReady");

		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithDesigntime/manifest.json");

		this.oCard.loadDesigntime().then(function (oResult) {
			assert.ok(oResult instanceof Designtime, "Design time is loaded.");
			assert.ok(fnCardReadySpy.calledOnce, "Designtime.onCardReady was called.");
			done();
		});

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});
});