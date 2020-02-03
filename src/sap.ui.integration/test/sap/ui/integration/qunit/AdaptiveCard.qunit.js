/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/f/cards/AdaptiveContent",
	"sap/ui/core/Core",
	"sap/f/cards/Header",
	"sap/base/Log"
],
	function (
		Card,
		AdaptiveContent,
		Core,
		Header,
		Log
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var oManifest = {
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [
						{
							"type": "TextBlock",
							"text": "style: compact, isMultiSelect: false"
						}
					]
				}
			}
		};

		var oDynamicManifest = {
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"request": {
						"url": "test-resources/sap/ui/integration/qunit/manifests/adaptive-card.json"
					}
				}
			}
		};

		var oDynamicManifest2 = {
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"request": {}
				}
			}
		};

		QUnit.test("Adaptive Card with inline MS JSON descriptor", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oManifest
			});

			var oLoadManifestFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_loadManifestFromUrl");
			var oFireCardReadyFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_fireCardReadyEvent");

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.notOk(oLoadManifestFunctionSpy.calledOnce, "The _loadManifestFromUrl function should not be called.");
				assert.ok(oFireCardReadyFunctionSpy.callCount, "_fireCardReadyEvent should be called.");
				assert.ok(oCard.getCardContent()._oCardConfig.body, "The MS AC body should be present in the manifest.");
				assert.ok(oCard.getCardContent()._bAdaptiveCardElementsReady, "Adaptive Card elements should be rendered.");
				assert.ok(oCard.getCardContent()._bComponentsReady, "Web components should be loaded.");
				assert.ok(document.querySelectorAll(".ac-textBlock"), "A TextBlock element should be present in the DOM.");

				// Cleanup
				oLoadManifestFunctionSpy.restore();
				oFireCardReadyFunctionSpy.restore();
				oCard.destroy();
				done();
			});
		});


		QUnit.test("Adaptive Card with dynamically loaded MS JSON descriptor", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oDynamicManifest
			});

			var oLoadManifestFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_loadManifestFromUrl");
			var oFireCardRadyFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_fireCardReadyEvent");

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.ok(oLoadManifestFunctionSpy.calledOnce, "The _loadManifestFromUrl function should be called.");
				assert.ok(oFireCardRadyFunctionSpy.callCount, "_fireCardReadyEvent should be called.");
				assert.ok(oCard.getCardContent()._bAdaptiveCardElementsReady, "Adaptive Card elements should be rendered.");
				assert.ok(oCard.getCardContent()._bComponentsReady, "Web components should be loaded.");
				assert.ok(document.querySelectorAll(".ac-textBlock"), "A TextBlock element should be present in the DOM.");

				// Cleanup
				oCard.destroy();
				oLoadManifestFunctionSpy.restore();
				oFireCardRadyFunctionSpy.restore();
				done();
			});
		});

		QUnit.test("Adaptive Card with wrong JSON descriptor request", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oDynamicManifest2
			});

			var oLoadManifestFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_loadManifestFromUrl");
			var oFireCardReadyFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_fireCardReadyEvent");

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.notOk(oLoadManifestFunctionSpy.callCount, "The _loadManifestFromUrl function should not be called.");
				assert.ok(oFireCardReadyFunctionSpy.callCount, "_fireCardReadyEvent should be called.");
				assert.notOk(oCard.getCardContent()._oCardConfig.body, "The MS AC body not should be present in the manifest.");
				assert.ok(oCard.getCardContent()._bAdaptiveCardElementsReady, "Adaptive Card elements should be rendered.");
				assert.ok(oCard.getCardContent()._bComponentsReady, "Web components should be loaded.");
				assert.notOk(document.querySelectorAll('.ac-adaptiveCard')[0].childElementCount, "An empty AdaptiveCard should be rendered.");

				// Cleanup
				oLoadManifestFunctionSpy.restore();
				oFireCardReadyFunctionSpy.restore();
				oCard.destroy();
				done();
			});
		});

		QUnit.test("Adaptive Card with empty content", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: {
					"sap.card": {
						"type": "AdaptiveCard",
						"content": {}
					}
				}
			});

			var oLoadManifestFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_loadManifestFromUrl");
			var oFireCardReadyFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_fireCardReadyEvent");

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.notOk(oLoadManifestFunctionSpy.callCount, "The _loadManifestFromUrl function should not be called.");
				assert.ok(oFireCardReadyFunctionSpy.callCount, "_fireCardReadyEvent should be called.");
				assert.notOk(oCard.getCardContent()._oCardConfig.body, "The MS AC body not should be present in the manifest.");
				assert.ok(oCard.getCardContent()._bAdaptiveCardElementsReady, "Adaptive Card elements should be rendered.");
				assert.ok(oCard.getCardContent()._bComponentsReady, "Web components should be loaded.");
				assert.notOk(document.querySelectorAll('.ac-adaptiveCard')[0].childElementCount, "An empty AdaptiveCard should be rendered.");

				// Cleanup
				oLoadManifestFunctionSpy.restore();
				oFireCardReadyFunctionSpy.restore();
				oCard.destroy();
				done();
			});
		});
	}
);
