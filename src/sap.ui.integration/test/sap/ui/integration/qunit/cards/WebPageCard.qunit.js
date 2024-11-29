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

	QUnit.test("Src set with delayed binding", async function (assert) {
		// Arrange

		var done = assert.async();

		this.oManifest["sap.card"].content.data = {
			request: {
				url: "/mocked/url/frameSrc"
			}
		};
		this.oManifest["sap.card"].content.src = "{frameSrc}";
		bypassHttpsValidation();

		const fnSpy = sinon.spy(WebPageContent.prototype, "_onFrameLoaded");
		const oServer = sinon.fakeServer.create();
		oServer.autoRespond = false;
		oServer.respondWith("GET", "/mocked/url/frameSrc", [
			200,
			{ "Content-Type": "application/json" },
			JSON.stringify({ frameSrc: "./page.html" })
		]);


		// Act
		this.oCard.setManifest(this.oManifest);

		// Simulate delayed server response
		setTimeout(oServer.respond.bind(oServer), 2000);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		restoreHttpsValidation();
		const sSrc = this.oCard.getCardContent().getSrc();

		// Assert
		assert.strictEqual(sSrc, BASE_URL + "./page.html", "The src is correctly resolved");

		setTimeout(() => {
			assert.ok(fnSpy.calledOnce, "Frame loaded was called.");
			done();
			// Cleanup
			fnSpy.restore();
			oServer.restore();
		}, 1000);
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
						"src": "./page.html",
						"minHeight": "200px"
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

	QUnit.test("minHeight is correctly set from manifest", async function (assert) {
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oContent = this.oCard.getCardContent(),
			sMinHeight = oContent.getMinHeight();

		// Assert
		assert.strictEqual(sMinHeight, "200px", "The minHeight is correctly set from the manifest");
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
		await nextUIUpdate(clock);
		await nextCardReadyEvent(this.oCard);

		clock.tick(20000);
		await nextUIUpdate(clock);

		// Assert
		assert.ok(this.oCard.getCardContent().getAggregation("_blockingMessage"), "Error message should be shown after timeout");

		// Clean up
		WebPageContent.prototype._onFrameLoaded.restore();
		restoreHttpsValidation();
		clock.restore();
	});

	QUnit.test("There is only one load timer at the same time", async function (assert) {
		// Arrange
		bypassHttpsValidation();

		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const clearTimeoutSpy = sinon.spy(window, "clearTimeout");
		const currentTimeout = this.oCard.getCardContent()._iLoadTimeout;

		// Act
		this.oCard.getCardContent()._raceFrameLoad();

		// Assert
		assert.ok(clearTimeoutSpy.calledWith(currentTimeout), "Old timeout is cleared");

		// Clean up
		restoreHttpsValidation();
		clearTimeoutSpy.restore();
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

	QUnit.test("applyConfiguration with null configuration", async function (assert) {
		// Arrange
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oContent = this.oCard.getCardContent();

		// Act
		sinon.stub(oContent, "getParsedConfiguration").returns(null);
		oContent.applyConfiguration();

		// Assert
		assert.ok(true, "applyConfiguration handled null configuration correctly");

		// Clean up
		oContent.getParsedConfiguration.restore();
	});

	QUnit.test("_checkSrc with null card instance", async function (assert) {
		// Arrange
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oContent = this.oCard.getCardContent();

		// Act
		sinon.stub(oContent, "getCardInstance").returns(null);
		oContent._checkSrc();

		// Assert
		assert.ok(true, "_checkSrc handled null card instance correctly");

		// Clean up
		oContent.getCardInstance.restore();
	});

	QUnit.test("isReady method when card instance is null", async function (assert) {
		// Arrange
		this.oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oContent = this.oCard.getCardContent();
		sinon.stub(oContent, "getCardInstance").returns(null);

		// Act
		const bIsReady = oContent.isReady();

		// Assert
		assert.strictEqual(bIsReady, false, "isReady returns false when card instance is null");

		// Clean up
		oContent.getCardInstance.restore();
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
			bAllowFullscreen = this.oCard.getCardContent().getAllowFullscreen(),
			oIframe = this.oCard.getCardContent().getDomRef("frame");

		assert.strictEqual(sSandbox, "allow-scripts", "The sandbox is correctly resolved");
		assert.strictEqual(sAllow, "fullscreen", "The allow property is correctly resolved");
		assert.strictEqual(bAllowFullscreen, true, "The allowfullscreen property is correctly resolved");
		assert.strictEqual(oIframe.getAttribute("allowfullscreen"), "true", "The allowfullscreen property is rendered");
		assert.strictEqual(oIframe.getAttribute("allow"), "fullscreen", "The allow property is rendered");
		assert.strictEqual(oIframe.getAttribute("sandbox"), "allow-scripts", "The sandbox property is rendered");

	});

	QUnit.test("allowFullscreen property works with new camelCase", async function (assert) {
		// Arrange
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
						"allowFullscreen": {
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
					"allowFullscreen": "{parameters>/allowFullscreen/value}"
				}
			}
		};

		this.oManifest["sap.card"].content.src = "./page.html";
		bypassHttpsValidation();

		// Act
		this.oCard.setManifest(this.oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		restoreHttpsValidation();

		const bAllowFullscreen = this.oCard.getCardContent().getAllowFullscreen(),
			oIframe = this.oCard.getCardContent().getDomRef("frame");

		assert.strictEqual(bAllowFullscreen, true, "The allowFullscreen property is correctly resolved");
		assert.strictEqual(oIframe.getAttribute("allowfullscreen"), "true", "The allowFullscreen property is rendered");
	});

	QUnit.module("Omit sandbox");

	QUnit.test("Sandbox is there by default", async function (assert) {
		// Arrange
		bypassHttpsValidation();

		const oCard = new Card({
			baseUrl: BASE_URL,
			manifest: {
				"sap.app": {
					"id": "test.cards.webpage.testCard2"
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
			}
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		restoreHttpsValidation();

		assert.strictEqual(oCard.getCardContent().getDomRef("frame").getAttribute("sandbox"), "", "The sandbox is there by default and is empty.");

		// Clean up
		oCard.destroy();
	});

	QUnit.test("Sandbox is not there if omitSandbox is true", async function (assert) {
		// Arrange
		bypassHttpsValidation();

		const oCard = new Card({
			baseUrl: BASE_URL,
			manifest: {
				"sap.app": {
					"id": "test.cards.webpage.testCard3"
				},
				"sap.card": {
					"type": "WebPage",
					"header": {
						"title": "WebPage Card"
					},
					"content": {
						"src": "./page.html",
						"omitSandbox": true
					}
				}
			}
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		restoreHttpsValidation();

		assert.strictEqual(oCard.getCardContent().getDomRef("frame").getAttribute("sandbox"), null, "The sandbox attribute is not there if omitSandbox is true.");

		// Clean up
		oCard.destroy();
	});

	QUnit.module("Regular behaviour");

	QUnit.test("Normal loading", async function (assert) {
		// Arrange
		bypassHttpsValidation();
		const done = assert.async();
		const fnSpy = sinon.spy(WebPageContent.prototype, "_onFrameLoaded");
		const oCard = new Card({
			baseUrl: BASE_URL,
			manifest: {
				"sap.app": {
					"id": "test.cards.webpage.testCard3"
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
			}
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		await nextCardReadyEvent(oCard);
		await nextUIUpdate();

		restoreHttpsValidation();

		setTimeout(() => {
			assert.ok(fnSpy.calledOnce, "Frame loaded was called.");
			done();
			// Clean up
			fnSpy.restore();
			oCard.destroy();
		}, 1000);
	});

});
