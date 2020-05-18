/* global QUnit, sinon */
sap.ui.define([
		"sap/ui/integration/library",
		"sap/ui/integration/widgets/Card",
		"sap/ui/integration/Host",
		"sap/ui/integration/cards/AdaptiveContent",
		"sap/ui/integration/util/RequestDataProvider",
		"sap/ui/integration/util/CardActions",
		"sap/ui/integration/thirdparty/adaptivecards",
		"sap/ui/core/library",
		"sap/ui/core/Core"
	],
	function (
		library,
		Card,
		Host,
		AdaptiveContent,
		RequestDataProvider,
		CardActions,
		AdaptiveCards,
		coreLibrary,
		Core
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";
		// shortcut for sap.ui.core.MessageType
		var MessageType = coreLibrary.MessageType;

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


		var oTemplateManifest = {
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"data": {
						"json": {
							"name": "John"
						}
					},
					"body": [
						{
							"type": "TextBlock",
							"text": "{name}"
						}
					]
				}
			}
		};

		var oTemplateManifest2 = {
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"$data": {
						"name": "John"
					},
					"body": [
						{
							"type": "TextBlock",
							"text": "{name}"
						}
					]
				}
			}
		};

		var oTemplateManifest3 = {
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/adaptive-card-data.json"
						}
					},
					"body": [
						{
							"type": "TextBlock",
							"text": "{name}"
						},
						{
							"type": "TextBlock",
							"text": "{company.name}"
						}
					]
				}
			}
		};

		var oTemplateManifest4 = {
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"$data": {},
					"body": [
						{
							"type": "TextBlock",
							"text": "No {name}"
						}
					]
				}
			}
		};

		var oTemplateManifest5 = {
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"$data": {
						"company": "Coca Cola"
					},
					"body": [
						{
							"type": "TextBlock",
							"text": "No {name}"
						}
					]
				}
			}
		};

		var oTemplateManifest6 = {
			"sap.card": {
				"type": "AdaptiveCard",
				"data": {
					"json": {
						"company": "Coca Cola"
					}
				},
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [
						{
							"type": "TextBlock",
							"text": "{company}"
						}
					]
				}
			}
		};

		var oTemplateManifest7 = {
			"sap.card": {
				"type": "AdaptiveCard",
				"data": {
					"request": {
						"url": "test-resources/sap/ui/integration/qunit/manifests/adaptive-card-data.json"
					}
				},
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [
						{
							"type": "TextBlock",
							"text": "{name}"
						}
					]
				}
			}
		};

		var oTemplateManifest8 = {
			"sap.card": {
				"type": "AdaptiveCard",
				"data": {
					"json": {
						"name": "John"
					}
				},
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"data": {
						"json": {
							"name": "Diana"
						}
					},
					"$data": {
						"name": "George"
					},
					"body": [
						{
							"type": "TextBlock",
							"text": "{name}"
						}
					]
				}
			}
		};

		var oTemplateManifest9 = {
			"sap.card": {
				"type": "AdaptiveCard",
				"data": {
					"json": {
						"name": "John"
					}
				},
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"data": {
						"json": {
							"name": "Diana"
						}
					},
					"body": [
						{
							"type": "TextBlock",
							"text": "{name}"
						}
					]
				}
			}
		};

		var oMarkdownManifest1 = {
			"sap.card": {
				"configuration": {
					"enableMarkdown": true
				},
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [
						{
							"type": "TextBlock",
							"text": "This is some **bold** text"
						}
					]
				}
			}
		};

		var oMarkdownManifest2 = {
			"sap.card": {
				"configuration": {
					"enableMarkdown": false
				},
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [
						{
							"type": "TextBlock",
							"text": "This is some **bold** text"
						}
					]
				}
			}
		};

		var mActionSubmitManifest = {
			"sap.card": {
				"configuration": {
					"actionHandlers": {
						"submit": {
							"url": "https://my-fake.url",
							"method": "POST"
						}
					}
				},
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [
						{
							"type": "Input.Text",
							"placeholder": "Name",
							"style": "text",
							"id": "inputValue",
							"value": "My Text"
						}
					],
					"actions": [{
						"type": "Action.Submit",
						"title": "Action.Submit"
					}]
				}
			}
		};

		QUnit.module("Adaptive Card Initialization");

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
				assert.strictEqual(oCard.getCardContent().adaptiveCardInstance.renderedElement.tabIndex, -1, "Additional tab stop should be removed");
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

		QUnit.module("Adaptive Card Templating");

		QUnit.test("Templating with data feature on content level - inline json", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oTemplateManifest
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oCreateDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_createDataProvider");
			var oSetupDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupDataProvider");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.ok(oSetupCardFunctionSpy.callCount, "The _setupMSCardContent function should be called.");
				assert.ok(oCreateDataProviderFunctionSpy.callCount, "_createDataProvider should be called.");
				assert.ok(oCreateDataProviderFunctionSpy.args[0][0].json, "_createDataProvider should be called with a correct json object.");
				assert.ok(oSetupDataProviderFunctionSpy.callCount, "_setupDataProvider should be called.");
				assert.ok(oRenderCardFunctionSpy.callCount, "The _renderMSCardContent function should be called.");
				assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");
				assert.ok(oSetTemplatingFunctionSpy.callCount, "_setTemplating should be called.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][1].name, "_setTemplating should be called with a valid json data as a second argument.");
				assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");
				assert.ok(document.querySelectorAll(".ac-textBlock")[0], "A TextBlock element should be present in the DOM.");
				assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "John", "A TextBlock element with a correctly mapped text value should be present.");
				assert.ok(this._oDataProviderFactory._aDataProviders.length, "A data provider should be set.");

				// Cleanup
				oSetupCardFunctionSpy.restore();
				oCreateDataProviderFunctionSpy.restore();
				oSetupDataProviderFunctionSpy.restore();
				oRenderCardFunctionSpy.restore();
				oSetTemplatingFunctionSpy.restore();
				oCard.destroy();

				done();
			});
		});

		QUnit.test("Templating with $data", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oTemplateManifest2
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oCreateDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_createDataProvider");
			var oSetupDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupDataProvider");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.ok(oSetupCardFunctionSpy.callCount, "The _setupMSCardContent function should be called.");
				assert.ok(oCreateDataProviderFunctionSpy.callCount, "_createDataProvider should be called.");
				assert.ok(oCreateDataProviderFunctionSpy.args[0][0].json, "_createDataProvider should be called with a correct json object.");
				assert.ok(oSetupDataProviderFunctionSpy.callCount, "_setupDataProvider should be called.");
				assert.ok(oRenderCardFunctionSpy.callCount, "The _renderMSCardContent function should be called.");
				assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");
				assert.ok(oSetTemplatingFunctionSpy.callCount, "_setTemplating should be called.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][1].name, "_setTemplating should be called with a valid json data as a second argument.");
				assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");
				assert.ok(document.querySelectorAll(".ac-textBlock")[0], "A TextBlock element should be present in the DOM.");
				assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "John", "A TextBlock element with a correctly mapped text value should be present.");
				assert.ok(this._oDataProviderFactory._aDataProviders.length, "A data provider should be set.");

				// Cleanup
				oSetupCardFunctionSpy.restore();
				oCreateDataProviderFunctionSpy.restore();
				oSetupDataProviderFunctionSpy.restore();
				oRenderCardFunctionSpy.restore();
				oSetTemplatingFunctionSpy.restore();
				oCard.destroy();

				done();
			});
		});

		QUnit.test("Templating with empty $data", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oTemplateManifest4
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oCreateDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_createDataProvider");
			var oSetupDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupDataProvider");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.ok(oSetupCardFunctionSpy.callCount, "The _setupMSCardContent function should be called.");
				assert.ok(oCreateDataProviderFunctionSpy.callCount, "_createDataProvider should be called.");
				assert.ok(oCreateDataProviderFunctionSpy.args[0][0].json, "_createDataProvider should be called with a correct json object.");
				assert.ok(oSetupDataProviderFunctionSpy.callCount, "_setupDataProvider should be called.");
				assert.ok(oRenderCardFunctionSpy.callCount, "The _renderMSCardContent function should be called.");
				assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");
				assert.ok(oSetTemplatingFunctionSpy.callCount, "_setTemplating should be called.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
				assert.notOk(oSetTemplatingFunctionSpy.args[0][1].length, "An empty object should be passed as data.");
				assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");
				assert.ok(document.querySelectorAll(".ac-textBlock")[0], "A TextBlock element should be present in the DOM.");
				assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "No undefined", "A TextBlock element with a correctly mapped text value should be present.");
				assert.ok(this._oDataProviderFactory._aDataProviders.length, "A data provider should be set.");

				// Cleanup
				oSetupCardFunctionSpy.restore();
				oCreateDataProviderFunctionSpy.restore();
				oSetupDataProviderFunctionSpy.restore();
				oRenderCardFunctionSpy.restore();
				oSetTemplatingFunctionSpy.restore();
				oCard.destroy();

				done();
			});
		});

		QUnit.test("Templating with $data and incorrect templating", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oTemplateManifest5
			});

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "No undefined", "A TextBlock element with a mapped text value should be present.");

				// Cleanup
				oCard.destroy();
				done();
			});
		});

		QUnit.test("Templating with data feature on content level - request", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oTemplateManifest3
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oCreateDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_createDataProvider");
			var oSetupDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupDataProvider");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.ok(oSetupCardFunctionSpy.callCount, "The _setupMSCardContent function should be called.");
				assert.ok(oCreateDataProviderFunctionSpy.callCount, "_createDataProvider should be called.");
				assert.ok(oCreateDataProviderFunctionSpy.args[0][0].request, "_createDataProvider should be called with a data request json.");
				assert.ok(oSetupDataProviderFunctionSpy.callCount, "_setupDataProvider should be called.");
				assert.ok(oRenderCardFunctionSpy.callCount, "The _renderMSCardContent function should be called.");
				assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");
				assert.ok(oSetTemplatingFunctionSpy.callCount, "_setTemplating should be called.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][1].name, "_setTemplating should be called with a valid json data as a second argument.");
				assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");
				assert.strictEqual(document.querySelectorAll(".ac-textBlock").length, 2, "Two TextBlock elements should be present in the DOM.");
				assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "John", "A TextBlock element with a correctly mapped text value should be present.");
				assert.strictEqual(document.querySelectorAll(".ac-textBlock")[1].innerText, "Coca Cola", "A TextBlock element with a correctly mapped text value should be present.");
				assert.ok(this._oDataProviderFactory._aDataProviders.length, "A data provider should be set.");

				// Cleanup
				oSetupCardFunctionSpy.restore();
				oCreateDataProviderFunctionSpy.restore();
				oSetupDataProviderFunctionSpy.restore();
				oRenderCardFunctionSpy.restore();
				oSetTemplatingFunctionSpy.restore();
				oCard.destroy();

				done();
			});
		});

		QUnit.test("Templating with data feature on card level - request", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oTemplateManifest7
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oCreateDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_createDataProvider");
			var oSetupDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupDataProvider");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.ok(oSetupCardFunctionSpy.callCount, "The _setupMSCardContent function should be called.");
				assert.notOk(oCreateDataProviderFunctionSpy.callCount, "_createDataProvider should not be called.");
				assert.ok(oSetupDataProviderFunctionSpy.callCount, "_setupDataProvider should be called.");
				assert.ok(oRenderCardFunctionSpy.callCount, "The _renderMSCardContent function should be called.");
				assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");
				assert.ok(oSetTemplatingFunctionSpy.callCount, "_setTemplating should be called.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][1].name, "_setTemplating should be called with a valid json data as a second argument.");
				assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");
				assert.ok(document.querySelectorAll(".ac-textBlock").length, "A TextBlock elements should be present in the DOM.");
				assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "John", "A TextBlock element with a correctly mapped text value should be present.");

				// Cleanup
				oSetupCardFunctionSpy.restore();
				oCreateDataProviderFunctionSpy.restore();
				oSetupDataProviderFunctionSpy.restore();
				oRenderCardFunctionSpy.restore();
				oSetTemplatingFunctionSpy.restore();
				oCard.destroy();

				done();
			});
		});

		QUnit.test("Templating with data feature on card level", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oTemplateManifest6
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oCreateDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_createDataProvider");
			var oSetupDataProviderFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupDataProvider");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.ok(oSetupCardFunctionSpy.callCount, "The _setupMSCardContent function should be called.");
				assert.notOk(oCreateDataProviderFunctionSpy.callCount, "_createDataProvider should not be called.");
				assert.ok(oSetupDataProviderFunctionSpy.callCount, "_setupDataProvider should be called.");
				assert.ok(oRenderCardFunctionSpy.callCount, "The _renderMSCardContent function should be called.");
				assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");
				assert.ok(oSetTemplatingFunctionSpy.callCount, "_setTemplating should be called.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
				assert.ok(oSetTemplatingFunctionSpy.args[0][1].company, "_setTemplating should be called with a valid json data as a second argument.");
				assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");
				assert.ok(document.querySelectorAll(".ac-textBlock").length, "A TextBlock elements should be present in the DOM.");
				assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "Coca Cola", "A TextBlock element with a correctly mapped text value should be present.");

				// Cleanup
				oSetupCardFunctionSpy.restore();
				oCreateDataProviderFunctionSpy.restore();
				oSetupDataProviderFunctionSpy.restore();
				oRenderCardFunctionSpy.restore();
				oSetTemplatingFunctionSpy.restore();
				oCard.destroy();

				done();
			});
		});

		QUnit.test("Templating - mixed usage (full)", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oTemplateManifest8
			});

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.ok(document.querySelectorAll(".ac-textBlock").length, "A TextBlock elements should be present in the DOM.");
				assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "George", "A TextBlock element with a correctly mapped text value should be present.");

				// Cleanup
				oCard.destroy();

				done();
			});
		});

		QUnit.test("Templating - mixed usage (data feature)", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oTemplateManifest9
			});

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				assert.ok(document.querySelectorAll(".ac-textBlock").length, "A TextBlock elements should be present in the DOM.");
				assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "Diana", "A TextBlock element with a correctly mapped text value should be present.");

				// Cleanup
				oCard.destroy();

				done();
			});
		});

		QUnit.module("Adaptive Card Markdown Support");

		QUnit.test("Markdown support - enableMarkdown: true", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oMarkdownManifest1
			});

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				// Assert
				assert.ok(AdaptiveCards.AdaptiveCard.onProcessMarkdown, "onProcessMarkdown should be defined");
				assert.ok(AdaptiveCards.AdaptiveCard.onProcessMarkdown("text", {}), "onProcessMarkdown should return a result");

				// Cleanup
				oCard.destroy();
				done();
			});
		});

		QUnit.test("Markdown support - enableMarkdown: false", function (assert) {
			var done = assert.async();
			var oCard = new Card({
				manifest: oMarkdownManifest2
			});

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {

				// Assert
				assert.ok(AdaptiveCards.AdaptiveCard.onProcessMarkdown, "onProcessMarkdown should be defined");
				assert.notOk(AdaptiveCards.AdaptiveCard.onProcessMarkdown("text", {}), "onProcessMarkdown not should return a result, when enableMarkdown is false");

				// Cleanup
				oCard.destroy();
				done();
			});
		});

		QUnit.module("Adaptive Card Action.Submit Handling");

		QUnit.test("getSubmitActionHandler evaluate Success execution", function (assert) {
			var oAdaptiveContent,
				done = assert.async(),
				oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
				oCard = new Card({
					manifest: mActionSubmitManifest
				}).placeAt(DOM_RENDER_LOCATION);

			Core.applyChanges();


			oCard.attachEvent("_ready", function () {
				oAdaptiveContent = oCard.getCardContent();

				// Act
				CardActions.fireAction({
					card: oCard,
					host: null,
					action: {type: library.CardActionType.Submit},
					parameters: {configuration: {}, data: {foo: "bar"}},
					source: oCard.getCardContent()
				});

				// Assert
				setTimeout(function () { // .getData() returns a Promise and MessageStrip's manipulations are executed in then()'s callbacks
					assert.ok(oStubRequest.called, "DataProvider's _fetch should have been called");
					assert.strictEqual(oAdaptiveContent.getAggregation("_content").getItems()[0].getType(), MessageType.Success,
						"The success execution should put the state of the MessageStrip to Success");

					assert.ok(oAdaptiveContent.getAggregation("_content").getItems()[0].getVisible(),
						"The execution of data fetching should make the MessageStrip visible");

					// Cleanup
					oCard.destroy();
					done();
				});
			});
		});
	}
);
