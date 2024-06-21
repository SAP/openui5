/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/cards/WebPageContent",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function (
	WebPageContent,
	Card,
	nextUIUpdate,
	nextCardReadyEvent
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

	QUnit.test("Src set directly", async function (assert) {
		// Arrange
		this.oManifest["sap.card"].content.src = "./page.html";
		bypassHttpsValidation();

		// Act
		this.oCard.setManifest(this.oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		restoreHttpsValidation(); // restore the getSrc method
		var sSrc = this.oCard.getCardContent().getSrc();

		assert.strictEqual(sSrc, BASE_URL + "./page.html", "The src is correctly resolved");
	});

	QUnit.test("Src set with binding", async function (assert) {
		// Arrange
		this.oManifest["sap.card"].content.data = {
			json: {
				frameSrc: "./page.html"
			}
		};
		this.oManifest["sap.card"].content.src = "{frameSrc}";
		bypassHttpsValidation();

		// Act
		this.oCard.setManifest(this.oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		restoreHttpsValidation(); // restore the getSrc method
		var sSrc = this.oCard.getCardContent().getSrc();

		assert.strictEqual(sSrc, BASE_URL + "./page.html", "The src is correctly resolved");
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

	QUnit.test("Frame DOM ref is preserved upon re-rendering", async function (assert) {
		// Arrange
		var done = assert.async();

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

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

	QUnit.test("Error message is shown after frame fails to load for 15 seconds", async function (assert) {
		// Arrange
		var clock = sinon.useFakeTimers();
		sinon.stub(WebPageContent.prototype, "_onFrameLoaded")
			.callsFake(function () {}); // simulate that load event didn't happen

		bypassHttpsValidation();

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		// Act - render the content and tick to trigger the error timeout
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate(clock);
		clock.tick(20000);

		// Assert
		assert.ok(this.oCard.getCardContent().getAggregation("_blockingMessage"), "Error message should be shown after timeout");

		// Clean up
		WebPageContent.prototype._onFrameLoaded.restore();
		restoreHttpsValidation();
		clock.restore();
	});

	QUnit.test("Error message is shown when the src doesn't start with 'https://'", async function (assert) {
		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oCard.getCardContent().getAggregation("_blockingMessage"), "Error message should be shown");
	});

	QUnit.test("Error message is shown when the src is empty string", async function (assert) {
		// Arrange
		this.oManifest["sap.card"].content.src = "";

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oCard.getCardContent().getAggregation("_blockingMessage"), "Error message should be shown");
	});

	QUnit.module("Allow and sandbox attributes", {
		beforeEach: function () {
			this.oManifest = {
				"sap.app": {
					"id": "test.cards.webpage.testCard"
				},
				"sap.card": {
					"type": "WebPage",
					"configuration": {
						"parameters": {
							"sandbox": {
								"value": "allow-scripts"
							},
							"allow": {
								"value": "fullscreen"
							},
							"allowfullscreen": {
								"value": true
							}
						}
					},
					"header": {
						"title": "WebPage Card"
					},
					"content": {
						"allow": "{parameters>/allow/value}",
						"sandbox": "{parameters>/sandbox/value}",
						"allowfullscreen": "{parameters>/allowfullscreen/value}"
					}
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

	QUnit.test("Properties are set with binding", async function (assert) {
		// Arrange
		this.oManifest["sap.card"].content.src = "./page.html";
		bypassHttpsValidation();

		// Act
		this.oCard.setManifest(this.oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		restoreHttpsValidation();

		const sSandbox = this.oCard.getCardContent().getSandbox(),
			sAllow = this.oCard.getCardContent().getAllow(),
			bAllowfullscreen = this.oCard.getCardContent().getAllowfullscreen(),
			oIframe = this.oCard.getCardContent().getDomRef("frame");

		assert.strictEqual(sSandbox, "allow-scripts", "The sandbox is correctly resolved");
		assert.strictEqual(sAllow, "fullscreen", "The allow property is correctly resolved");
		assert.strictEqual(bAllowfullscreen, true, "The allowfullscreen property is correctly resolved");
		assert.strictEqual(oIframe.getAttribute("allowfullscreen"), "true", "The allowfullscreen property is rendered");
		assert.strictEqual(oIframe.getAttribute("allow"), "fullscreen", "The allow property is rendered");
		assert.strictEqual(oIframe.getAttribute("sandbox"), "allow-scripts", "The sandbox property is rendered");

	});

});
