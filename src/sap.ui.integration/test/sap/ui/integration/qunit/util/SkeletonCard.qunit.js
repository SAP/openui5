/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/SkeletonCard",
	"sap/ui/integration/util/ManifestResolver"
], function (
	SkeletonCard,
	ManifestResolver
) {
	"use strict";

	var oSampleManifest = {
		"manifest": {
			"sap.app": {
				"id": "manifestResolver.test.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Card"
				}
			}
		},
		"baseUrl": "/"
	};

	QUnit.module("Generic");

	QUnit.test("Can create a SkeletonCard", function (assert) {
		// Arrange
		var done = assert.async(1),
			oCard = new SkeletonCard(oSampleManifest);

		oCard.attachEvent("_ready", function () {
			// Assert
			assert.ok(true, "Card was created.");

			// Clean up
			oCard.destroy();

			done();
		});

		// Act
		oCard.startManifestProcessing();
	});

	QUnit.test("Calls ManifestResolver", function (assert) {
		// Arrange
		var fnManifestResolverSpy = sinon.spy(ManifestResolver, "resolveCard"),
			oCard = new SkeletonCard(oSampleManifest);

		// Act
		oCard.resolveManifest();

		// Assert
		assert.ok(fnManifestResolverSpy.calledOnce, "ManifestResolver.resolveCard() was called.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Can be refreshed", function (assert) {
		// Arrange
		var done = assert.async(1),
			oCard = new SkeletonCard(oSampleManifest),
			bFirstCall = false,
			fnStateChangedListener = function () {
				if (bFirstCall) {
					oCard.refresh();
					return;
				}

				// Assert
				assert.ok(true, "Card was refreshed");

				// Clean up
				oCard.destroy();

				done();
			};

		oCard.attachEvent("stateChanged", fnStateChangedListener);

		// Act
		oCard.refresh();
	});
});
