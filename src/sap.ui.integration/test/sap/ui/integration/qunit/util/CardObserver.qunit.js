/* global QUnit, sinon */

sap.ui.define([
		"sap/ui/integration/library",
		"sap/ui/integration/widgets/Card",
		"sap/ui/integration/util/CardObserver",
		"sap/ui/core/Core"
	],
	function (
		library,
		Card,
		CardObserver,
		Core
	) {
		"use strict";

		var CardDataMode = library.CardDataMode;

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var oManifest_ListCard = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card4",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card",
					"subTitle": "Card Subtitle"
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						},
						"path": "/"
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						}
					}
				}
			}
		};

		QUnit.module("CardObserver", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
			}
		});

		QUnit.test("Changing card DOM ref", function (assert) {
			// Act - create card DOM ref
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			// Assert
			var oObservedDomRef = this.oCard._oCardObserver._oObservedDomRef;
			assert.strictEqual(oObservedDomRef, this.oCard.getDomRef(), "Observed DOM ref is stored");

			// Arrange
			var oUnobserveSpy = this.spy(this.oCard._oCardObserver._oObserver, "unobserve");

			// Act - change card DOM ref
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			// Assert
			var oNewObserverDomRef = this.oCard._oCardObserver._oObservedDomRef;
			assert.notStrictEqual(oNewObserverDomRef, oObservedDomRef,  "Observed DOM ref should be updated");
			assert.strictEqual(oUnobserveSpy.callCount, 1, "Old DOM ref is unobserved");
		});

		QUnit.module("CardObserver is instantiated only when dataMode:'Auto'", {
			beforeEach: function () {
				this.oCreateObserverSpy = sinon.spy(CardObserver.prototype, "_createObserver");
				this.oLoadManifestSpy = sinon.spy(CardObserver.prototype, "loadManifest");
				this.oObserveSpy = sinon.spy(CardObserver.prototype, "observe");

				this.oCardAuto = new Card({
					width: "400px",
					height: "600px",
					dataMode: CardDataMode.Auto
				});
			},
			afterEach: function () {
				this.oCardAuto.destroy();
				this.oCardAuto = null;
				this.oCreateObserverSpy.restore();
				this.oLoadManifestSpy.restore();
				this.oObserveSpy.restore();
			}
		});

		QUnit.test("CardObserver will be initialized", function (assert) {
			var done = assert.async();
			var oUnobserveSpy;

			this.oCardAuto.attachEvent("_ready", function () {
				Core.applyChanges();
				// Assert
				assert.strictEqual(this.oCreateObserverSpy.callCount, 1, "CardObserver is created");
				assert.strictEqual(this.oLoadManifestSpy.callCount, 1, "Manifest is loaded");
				assert.strictEqual(this.oObserveSpy.callCount, 1, "Observe function is called");
				assert.strictEqual(oUnobserveSpy.callCount, 1, "Card is unobserved");

				done();
			}.bind(this));

			this.oCardAuto.setManifest(oManifest_ListCard);
			this.oCardAuto.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			oUnobserveSpy = sinon.spy(this.oCardAuto._oCardObserver._oObserver, "unobserve");
		});

		QUnit.test("Manifest should be set when card is in viewport", function (assert) {
			var done = assert.async(),
				oStartProcessingManifestSpy = sinon.spy(this.oCardAuto, "startManifestProcessing");

			this.oCardAuto.attachEvent("_ready", function () {
				// Assert
				assert.strictEqual(oStartProcessingManifestSpy.callCount, 2, "Manifest is set");

				done();
			});

			this.oCardAuto.setManifest(oManifest_ListCard).placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("CardObserver is not instantiated", {
			beforeEach: function () {
				this.oCreateObserverSpy = sinon.spy(CardObserver.prototype, "_createObserver");
				this.oLoadManifestSpy = sinon.spy(CardObserver.prototype, "loadManifest");
				this.oUnobserveSpy = sinon.spy(CardObserver.prototype, "unobserve");

				this.oCard = new Card({
					width: "400px",
					height: "600px",
					dataMode: "Active"
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oCreateObserverSpy.restore();
				this.oLoadManifestSpy.restore();
				this.oUnobserveSpy.restore();

			}
		});

		QUnit.test("CardObserver will not be initialized", function (assert) {
			var done = assert.async();
			this.oCard.attachEvent("_ready", function () {
				// Assert
				assert.strictEqual(this.oUnobserveSpy.callCount, 2, "Unobserve function is called");
				assert.strictEqual(this.oCreateObserverSpy.callCount, 0, "CardObserver is not created");
				assert.strictEqual(this.oLoadManifestSpy.callCount, 0, "loadManifest function is not called");

				done();
			}.bind(this));

			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

	}
);
