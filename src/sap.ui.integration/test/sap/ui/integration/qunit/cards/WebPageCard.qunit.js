/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/cards/WebPageContent",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core"
], function (
	WebPageContent,
	Card,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";
	var BASE_URL = "test-resources/sap/ui/integration/qunit/testResources/";

	function bypassHttpsValidation() {
		sinon.stub(WebPageContent.prototype, "getSrc")
			.callsFake(function () {
				// eslint-disable-next-line no-new-wrappers
				var oSrc = new String(this.getProperty("src"));
				oSrc.startsWith = function (sStarsWith) {
					if (sStarsWith === "https://") {
						return true;
					}
					return String.prototype.startsWith.apply(this, arguments);
				};

				return oSrc;
			});
	}

	function restoreHttpsValidation() {
		WebPageContent.prototype.getSrc.restore(); // restore the getSrc method
	}

	QUnit.module("Setting the src of the iframe", {
		beforeEach: function () {
			this.oManifest = {
				"sap.app": {
					"id": "test.cards.webpage.testCard"
				},
				"sap.card": {
					"type": "WebPage",
					"header": {
						"title": "WebPage Card"
					},
					"content": { }
				}
			};
			this.oCard = new Card({
				baseUrl: BASE_URL
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Src set directly", function (assert) {
		// Arrange
		var done = assert.async();
		this.oManifest["sap.card"].content.src = "./page.html";
		bypassHttpsValidation();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			restoreHttpsValidation(); // restore the getSrc method
			var sSrc = this.oCard.getCardContent().getSrc();

			assert.strictEqual(sSrc, BASE_URL + "./page.html", "The src is correctly resolved");

			// clean up
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(this.oManifest);
	});

	QUnit.test("Src set with binding", function (assert) {
		// Arrange
		var done = assert.async();
		this.oManifest["sap.card"].content.data = {
			json: {
				frameSrc: "./page.html"
			}
		};
		this.oManifest["sap.card"].content.src = "{frameSrc}";
		bypassHttpsValidation();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			restoreHttpsValidation(); // restore the getSrc method
			var sSrc = this.oCard.getCardContent().getSrc();

			assert.strictEqual(sSrc, BASE_URL + "./page.html", "The src is correctly resolved");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(this.oManifest);
	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oManifest = {
				"sap.app": {
					"id": "test.cards.webpage.testCard"
				},
				"sap.card": {
					"type": "WebPage",
					"header": {
						"title": "WebPage Card"
					},
					"content": {
						"src": "./page.html"
					}
				}
			};
			this.oCard = new Card({
				baseUrl: BASE_URL,
				manifest: this.oManifest
			});

			bypassHttpsValidation();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			restoreHttpsValidation();
		}
	});

	QUnit.test("Frame DOM ref is preserved upon re-rendering", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEventOnce("_ready", function () {
			Core.applyChanges();
			var oContent = this.oCard.getCardContent(),
				oFrame = this.oCard.getCardContent().getDomRef("frame"),
				oDelegate = {
					onAfterRendering: function () {
						oContent.removeEventDelegate(oDelegate);
						assert.strictEqual(oContent.getDomRef("frame"), oFrame, "DOM ref of the iframe didn't change upon re-rendering");
						done();
					}
				};

			oContent.addEventDelegate(oDelegate);

			// Act - re-render the card
			this.oCard.invalidate();
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.module("Handling errors", {
		beforeEach: function () {
			this.oManifest = {
				"sap.app": {
					"id": "test.cards.webpage.testCard"
				},
				"sap.card": {
					"type": "WebPage",
					"header": {
						"title": "WebPage Card"
					},
					"content": {
						"src": "./page.html"
					}
				}
			};
			this.oCard = new Card({
				baseUrl: BASE_URL,
				manifest: this.oManifest,
				dataMode: "Active"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Error message is shown after frame fails to load for 15 seconds", function (assert) {
		// Arrange
		var clock = sinon.useFakeTimers();
		var done = assert.async();
		sinon.stub(WebPageContent.prototype, "_onFrameLoaded")
			.callsFake(function () {}); // simulate that load event didn't happen

		bypassHttpsValidation();

		this.oCard.attachEventOnce("_ready", function () {
			// Act - render the content and tick to trigger the error timeout
			Core.applyChanges();
			clock.tick(20000);

			// Assert
			assert.ok(this.oCard.getCardContent().hasStyleClass("sapFCardErrorContent"), "Error message should be shown after timeout");

			// Clean up
			WebPageContent.prototype._onFrameLoaded.restore();
			restoreHttpsValidation();
			clock.restore();
			done();
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.test("Error message is shown when the src doesn't start with 'https://'", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEventOnce("_ready", function () {
			// Act - render the content
			Core.applyChanges();

			// Assert
			assert.ok(this.oCard.getCardContent().hasStyleClass("sapFCardErrorContent"), "Error message should be shown");

			done();
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.test("Error message is shown when the src is empty string", function (assert) {
		// Arrange
		this.oManifest["sap.card"].content.src = "";
		var done = assert.async();

		this.oCard.attachEventOnce("_ready", function () {
			// Act - render the content
			Core.applyChanges();

			// Assert
			assert.ok(this.oCard.getCardContent().hasStyleClass("sapFCardErrorContent"), "Error message should be shown");

			done();
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

});
