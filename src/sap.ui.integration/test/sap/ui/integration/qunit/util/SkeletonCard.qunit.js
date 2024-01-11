/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/SkeletonCard",
	"sap/ui/integration/util/ManifestResolver",
	"qunit/testResources/nextCardReadyEvent"
], function (
	SkeletonCard,
	ManifestResolver,
	nextCardReadyEvent
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

	QUnit.test("Can create a SkeletonCard", async function (assert) {
		// Arrange
		var oCard = new SkeletonCard(oSampleManifest);

		// Act
		oCard.startManifestProcessing();

		await nextCardReadyEvent(oCard);

		// Assert
		assert.ok(true, "Card was created.");

		// Clean up
		oCard.destroy();
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
