/* global QUnit, sinon */
sap.ui.define([
		"sap/ui/integration/library",
		"sap/ui/integration/widgets/Card",
		"sap/ui/integration/cards/AdaptiveContent",
		"sap/ui/integration/util/RequestDataProvider",
		"sap/ui/integration/util/DataProvider",
		"sap/ui/integration/cards/actions/CardActions",
		"sap/ui/integration/thirdparty/adaptivecards",
		"sap/ui/qunit/utils/nextUIUpdate",
		"qunit/testResources/nextCardReadyEvent"
],
	function (
		library,
		Card,
		AdaptiveContent,
		RequestDataProvider,
		DataProvider,
		CardActions,
		AdaptiveCards,
		nextUIUpdate,
		nextCardReadyEvent
	) {
		"use strict";

		const DOM_RENDER_LOCATION = "qunit-fixture";

		const CardMessageType = library.CardMessageType;

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
			"sap.app": {
				"id": "testsuite.adaptive.card1",
				"type": "card"
			},
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"request": {
						"url": "./adaptive-card.json"
					}
				}
			}
		};

		var oDynamicManifest2 = {
			"sap.app": {
				"id": "testsuite.adaptive.card2",
				"type": "card"
			},
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"request": {}
				}
			}
		};


		var oTemplateManifest = {
			"sap.app": {
				"id": "testsuite.adaptive.card12",
				"type": "card"
			},
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
							"text": "${name}"
						}
					]
				}
			}
		};

		var oTemplateManifest2 = {
			"sap.app": {
				"id": "testsuite.adaptive.card13",
				"type": "card"
			},
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
							"text": "${name}"
						}
					]
				}
			}
		};

		var oTemplateManifest3 = {
			"sap.app": {
				"id": "testsuite.adaptive.card3",
				"type": "card"
			},
			"sap.card": {
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"data": {
						"request": {
							"url": "./adaptive-card-data.json"
						}
					},
					"body": [
						{
							"type": "TextBlock",
							"text": "${name}"
						},
						{
							"type": "TextBlock",
							"text": "${company.name}"
						}
					]
				}
			}
		};

		var oTemplateManifest4 = {
			"sap.app": {
				"id": "testsuite.adaptive.card4",
				"type": "card"
			},
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
							"text": "No ${name}"
						}
					]
				}
			}
		};

		var oTemplateManifest5 = {
			"sap.app": {
				"id": "testsuite.adaptive.card5",
				"type": "card"
			},
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
							"text": "No ${name}"
						}
					]
				}
			}
		};

		var oTemplateManifest6 = {
			"sap.app": {
				"id": "testsuite.adaptive.card6",
				"type": "card"
			},
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
							"text": "${company}"
						}
					]
				}
			}
		};

		var oTemplateManifest7 = {
			"sap.app": {
				"id": "testsuite.adaptive.card7",
				"type": "card"
			},
			"sap.card": {
				"type": "AdaptiveCard",
				"data": {
					"request": {
						"url": "./adaptive-card-data.json"
					}
				},
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [
						{
							"type": "TextBlock",
							"text": "${name}"
						}
					]
				}
			}
		};

		var oTemplateManifest8 = {
			"sap.app": {
				"id": "testsuite.adaptive.card8",
				"type": "card"
			},
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
							"text": "${name}"
						}
					]
				}
			}
		};

		var oTemplateManifest9 = {
			"sap.app": {
				"id": "testsuite.adaptive.card9",
				"type": "card"
			},
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
							"text": "${name}"
						}
					]
				}
			}
		};

		var oMarkdownManifest1 = {
			"sap.app": {
				"id": "testsuite.adaptive.card14",
				"type": "card"
			},
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
			"sap.app": {
				"id": "testsuite.adaptive.card15",
				"type": "card"
			},
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
			"sap.app": {
				"id": "testsuite.adaptive.card16",
				"type": "card"
			},
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

		QUnit.test("Adaptive Card with inline MS JSON descriptor", async function (assert) {
			var oCard = new Card({
				manifest: oManifest
			});

			var oLoadManifestFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_loadManifestFromUrl");
			var oFireEventSpy = sinon.spy(AdaptiveContent.prototype, "fireEvent");

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.strictEqual(oCard.getCardContent().adaptiveCardInstance.renderedElement.tabIndex, -1, "Additional tab stop should be removed");
			assert.notOk(oLoadManifestFunctionSpy.calledOnce, "The _loadManifestFromUrl function should not be called.");
			assert.ok(oCard.getCardContent().getConfiguration().body, "The MS AC body should be present in the manifest.");
			assert.ok(oFireEventSpy.calledWith("_adaptiveCardElementsReady"), "Adaptive Card elements should be marked as ready.");
			assert.ok(oCard.getCardContent()._bComponentsReady, "Web components should be loaded.");
			assert.ok(document.querySelectorAll(".ac-textBlock"), "A TextBlock element should be present in the DOM.");

			// Cleanup
			oLoadManifestFunctionSpy.restore();
			oFireEventSpy.restore();
			oCard.destroy();
		});

		QUnit.test("Adaptive Card with dynamically loaded MS JSON descriptor with wrong url", async function (assert) {
			var oCard = new Card({
				manifest: oDynamicManifest,
				baseUrl: sap.ui.require.toUrl("test-resources/sap/ui/integration/qunit/manifests")
			});

			var oLoadManifestFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_loadManifestFromUrl");
			var oFireEventSpy = sinon.spy(AdaptiveContent.prototype, "fireEvent");

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.ok(oLoadManifestFunctionSpy.calledOnce, "The _loadManifestFromUrl function should be called.");
			assert.ok(oFireEventSpy.calledWith("_adaptiveCardElementsReady"), "Adaptive Card elements should be marked as ready.");
			assert.ok(oCard.getCardContent()._bComponentsReady, "Web components should be loaded.");
			assert.ok(document.querySelectorAll(".ac-textBlock"), "A TextBlock element should be present in the DOM.");

			// Cleanup
			oCard.destroy();
			oLoadManifestFunctionSpy.restore();
			oFireEventSpy.restore();
		});

		QUnit.test("Adaptive Card with wrong JSON descriptor request", async function (assert) {
			var oCard = new Card({
				manifest: oDynamicManifest2
			});

			var oLoadManifestFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_loadManifestFromUrl");
			var oFireEventSpy = sinon.spy(AdaptiveContent.prototype, "fireEvent");

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.notOk(oLoadManifestFunctionSpy.callCount, "The _loadManifestFromUrl function should not be called.");
			assert.notOk(oCard.getCardContent().getConfiguration().body, "The MS AC body not should be present in the manifest.");
			assert.ok(oFireEventSpy.calledWith("_adaptiveCardElementsReady"), "Adaptive Card elements should be marked as ready.");
			assert.ok(oCard.getCardContent()._bComponentsReady, "Web components should be loaded.");
			assert.notOk(document.querySelectorAll('.ac-adaptiveCard')[0].childElementCount, "An empty AdaptiveCard should be rendered.");

			// Cleanup
			oLoadManifestFunctionSpy.restore();
			oFireEventSpy.restore();
			oCard.destroy();
		});

		QUnit.test("Adaptive Card with empty content", async function (assert) {
			var oCard = new Card({
				manifest: {
					"sap.card": {
						"type": "AdaptiveCard",
						"content": {}
					}
				}
			});

			var oLoadManifestFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_loadManifestFromUrl");
			var oFireEventSpy = sinon.spy(AdaptiveContent.prototype, "fireEvent");

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.notOk(oLoadManifestFunctionSpy.callCount, "The _loadManifestFromUrl function should not be called.");
			assert.notOk(oCard.getCardContent().getConfiguration().body, "The MS AC body not should be present in the manifest.");
			assert.ok(oFireEventSpy.calledWith("_adaptiveCardElementsReady"), "Adaptive Card elements should be marked as ready.");
			assert.ok(oCard.getCardContent()._bComponentsReady, "Web components should be loaded.");
			assert.notOk(document.querySelectorAll('.ac-adaptiveCard')[0].childElementCount, "An empty AdaptiveCard should be rendered.");

			// Cleanup
			oLoadManifestFunctionSpy.restore();
			oFireEventSpy.restore();
			oCard.destroy();
		});

		QUnit.test("Adaptive Card should not make new data request when re-rendered", async function (assert) {
			// Arrange
			var done = assert.async(),
				oDataRequestSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate"),
				oCard = new Card({
					manifest: oTemplateManifest7
				});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(oDataRequestSpy.calledOnce, "Data is correctly fetched only once");

			// Act
			oCard.invalidate();
			await nextUIUpdate();

			// Wait until card gets rerendered and ready again
			setTimeout(function() {
				// Assert
				assert.ok(oDataRequestSpy.calledOnce, "Data is correctly not fetched again after card re-rendering");

				// Cleanup
				oCard.destroy();
				oDataRequestSpy.restore();
				done();
			}, 100);
		});

		QUnit.module("Adaptive Card Templating");

		QUnit.test("Templating with data feature on content level - inline json", async function (assert) {
			var oCard = new Card({
				manifest: oTemplateManifest
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");
			var oSetDataConfigurationSpy = sinon.spy(AdaptiveContent.prototype, "setDataConfiguration");
			var oDataRequestSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.ok(oSetupCardFunctionSpy.called, "The _setupMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.called, "The _renderMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");

			assert.ok(oSetTemplatingFunctionSpy.called, "_setTemplating should be called.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][1].name, "_setTemplating should be called with a valid json data as a second argument.");
			assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");

			assert.ok(oSetDataConfigurationSpy.called, "setDataConfiguration should be called.");
			assert.ok(oSetDataConfigurationSpy.calledWith(oTemplateManifest["sap.card"].content.data), "setDataConfiguration should be called with the data settings as an argument.");
			assert.ok(oDataRequestSpy.calledOnce, "Data is correctly fetched only once");

			assert.ok(document.querySelectorAll(".ac-textBlock")[0], "A TextBlock element should be present in the DOM.");
			assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "John", "A TextBlock element with a correctly mapped text value should be present.");
			assert.ok(oCard._oDataProviderFactory._aDataProviders.length, "A data provider should be set.");

			// Cleanup
			oSetupCardFunctionSpy.restore();
			oSetDataConfigurationSpy.restore();
			oRenderCardFunctionSpy.restore();
			oSetTemplatingFunctionSpy.restore();
			oDataRequestSpy.restore();
			oCard.destroy();
		});

		QUnit.test("Templating with $data", async function (assert) {
			var oCard = new Card({
				manifest: oTemplateManifest2
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");
			var oSetDataConfigurationSpy = sinon.spy(AdaptiveContent.prototype, "setDataConfiguration");
			var oDataRequestSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.ok(oSetupCardFunctionSpy.called, "The _setupMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.called, "The _renderMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");

			assert.ok(oSetTemplatingFunctionSpy.called, "_setTemplating should be called.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][1].name, "_setTemplating should be called with a valid json data as a second argument.");
			assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");

			assert.ok(oSetDataConfigurationSpy.called, "setDataConfiguration should be called.");
			assert.ok(oSetDataConfigurationSpy.calledWith({json: oTemplateManifest2["sap.card"].content.$data }), "setDataConfiguration should be called with the data settings within a json property.");
			assert.ok(oDataRequestSpy.calledOnce, "Data is correctly fetched only once");

			assert.ok(document.querySelectorAll(".ac-textBlock")[0], "A TextBlock element should be present in the DOM.");
			assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "John", "A TextBlock element with a correctly mapped text value should be present.");
			assert.ok(oCard._oDataProviderFactory._aDataProviders.length, "A data provider should be set.");

			// Cleanup
			oSetupCardFunctionSpy.restore();
			oRenderCardFunctionSpy.restore();
			oSetTemplatingFunctionSpy.restore();
			oSetDataConfigurationSpy.restore();
			oDataRequestSpy.restore();
			oCard.destroy();
		});

		QUnit.test("Templating with empty $data", async function (assert) {
			var oCard = new Card({
				manifest: oTemplateManifest4
			});
			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");
			var oSetDataConfigurationSpy = sinon.spy(AdaptiveContent.prototype, "setDataConfiguration");
			var oDataRequestSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.ok(oSetupCardFunctionSpy.called, "The _setupMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.called, "The _renderMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");

			assert.ok(oSetTemplatingFunctionSpy.called, "_setTemplating should be called.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
			assert.notOk(oSetTemplatingFunctionSpy.args[0][1].length, "An empty object should be passed as data.");
			assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");

			assert.ok(oSetDataConfigurationSpy.called, "setDataConfiguration should be called.");
			assert.ok(oSetDataConfigurationSpy.calledWith({json: oTemplateManifest4["sap.card"].content.$data }), "setDataConfiguration should be called with the data settings within a json property as an argument.");
			assert.ok(oDataRequestSpy.calledOnce, "Data is correctly fetched only once");

			assert.ok(document.querySelectorAll(".ac-textBlock")[0], "A TextBlock element should be present in the DOM.");
			assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "No ${name}", "A TextBlock element with a correctly non-mapped text value should be present.");
			assert.ok(oCard._oDataProviderFactory._aDataProviders.length, "A data provider should be set.");

			// Cleanup
			oSetupCardFunctionSpy.restore();
			oRenderCardFunctionSpy.restore();
			oSetTemplatingFunctionSpy.restore();
			oSetDataConfigurationSpy.restore();
			oDataRequestSpy.restore();
			oCard.destroy();
		});

		QUnit.test("Templating with $data and incorrect templating", async function (assert) {
			var oCard = new Card({
				manifest: oTemplateManifest5
			});

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "No ${name}", "A TextBlock element with a non-mapped text value should be present.");

			// Cleanup
			oCard.destroy();
		});

		QUnit.test("Templating with data feature on content level - request", async function (assert) {
			var oCard = new Card({
				manifest: oTemplateManifest3,
				baseUrl: sap.ui.require.toUrl("test-resources/sap/ui/integration/qunit/manifests/")
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");
			var oSetDataConfigurationSpy = sinon.spy(AdaptiveContent.prototype, "setDataConfiguration");
			var oDataRequestSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.ok(oSetupCardFunctionSpy.called, "The _setupMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.called, "The _renderMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");

			assert.ok(oSetTemplatingFunctionSpy.called, "_setTemplating should be called.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][1].name, "_setTemplating should be called with a valid json data as a second argument.");
			assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");

			assert.ok(oSetDataConfigurationSpy.called, "setDataConfiguration should be called.");
			assert.ok(oSetDataConfigurationSpy.calledWith(oTemplateManifest3["sap.card"].content.data), "setDataConfiguration should be called with data set on content level");
			assert.ok(oDataRequestSpy.calledOnce, "Data is correctly fetched only once");

			assert.strictEqual(document.querySelectorAll(".ac-textBlock").length, 2, "Two TextBlock elements should be present in the DOM.");
			assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "John", "A TextBlock element with a correctly mapped text value should be present.");
			assert.strictEqual(document.querySelectorAll(".ac-textBlock")[1].innerText, "Coca Cola", "A TextBlock element with a correctly mapped text value should be present.");
			assert.ok(oCard._oDataProviderFactory._aDataProviders.length, "A data provider should be set.");

			// Cleanup
			oSetupCardFunctionSpy.restore();
			oRenderCardFunctionSpy.restore();
			oSetTemplatingFunctionSpy.restore();
			oSetDataConfigurationSpy.restore();
			oDataRequestSpy.restore();
			oCard.destroy();
		});

		QUnit.test("Templating with data feature on card level - request", async function (assert) {
			var oCard = new Card({
				manifest: oTemplateManifest7,
				baseUrl: sap.ui.require.toUrl("test-resources/sap/ui/integration/qunit/manifests/")
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");
			var oSetDataConfigurationSpy = sinon.spy(AdaptiveContent.prototype, "setDataConfiguration");
			var oDataRequestSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.ok(oSetupCardFunctionSpy.called, "The _setupMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.called, "The _renderMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");

			assert.ok(oSetTemplatingFunctionSpy.called, "_setTemplating should be called.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][1].name, "_setTemplating should be called with a valid json data as a second argument.");

			assert.ok(oSetDataConfigurationSpy.called, "setDataConfiguration should be called.");
			assert.ok(oSetDataConfigurationSpy.calledWith(undefined), "setDataConfiguration should be called with empty data argument");
			assert.ok(oDataRequestSpy.calledOnce, "Data is correctly fetched only once");

			assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");
			assert.ok(document.querySelectorAll(".ac-textBlock").length, "A TextBlock elements should be present in the DOM.");
			assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "John", "A TextBlock element with a correctly mapped text value should be present.");

			// Cleanup
			oSetupCardFunctionSpy.restore();
			oRenderCardFunctionSpy.restore();
			oSetTemplatingFunctionSpy.restore();
			oSetDataConfigurationSpy.restore();
			oDataRequestSpy.restore();
			oCard.destroy();
		});

		QUnit.test("Templating with data feature on card level", async function (assert) {
			var oCard = new Card({
				manifest: oTemplateManifest6
			});

			var oSetupCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setupMSCardContent");
			var oRenderCardFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_renderMSCardContent");
			var oSetTemplatingFunctionSpy = sinon.spy(AdaptiveContent.prototype, "_setTemplating");
			var oSetDataConfigurationSpy = sinon.spy(AdaptiveContent.prototype, "setDataConfiguration");
			var oDataRequestSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.ok(oSetupCardFunctionSpy.called, "The _setupMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.called, "The _renderMSCardContent function should be called.");
			assert.ok(oRenderCardFunctionSpy.args[0][0].$schema, "_renderMSCardContent should be called with a MS AC card json.");

			assert.ok(oSetTemplatingFunctionSpy.called, "_setTemplating should be called.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][0].$schema, "_setTemplating should be called with a card json as a first argument.");
			assert.ok(oSetTemplatingFunctionSpy.args[0][1].company, "_setTemplating should be called with a valid json data as a second argument.");
			assert.ok(oSetTemplatingFunctionSpy.returnValues[0].$schema, "_setTemplating should return a valid card json.");

			assert.ok(oSetDataConfigurationSpy.called, "setDataConfiguration should be called.");
			assert.ok(oSetDataConfigurationSpy.calledWith(undefined), "setDataConfiguration should be called with empty data argument");
			assert.ok(oDataRequestSpy.calledOnce, "Data is correctly fetched only once");

			assert.ok(document.querySelectorAll(".ac-textBlock").length, "A TextBlock elements should be present in the DOM.");
			assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "Coca Cola", "A TextBlock element with a correctly mapped text value should be present.");

			// Cleanup
			oSetupCardFunctionSpy.restore();
			oRenderCardFunctionSpy.restore();
			oSetTemplatingFunctionSpy.restore();
			oSetDataConfigurationSpy.restore();
			oDataRequestSpy.restore();
			oCard.destroy();
		});

		QUnit.test("Templating - mixed usage (full)", async function (assert) {
			var oCard = new Card({
				manifest: oTemplateManifest8
			});

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.ok(document.querySelectorAll(".ac-textBlock").length, "A TextBlock elements should be present in the DOM.");
			assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "George", "A TextBlock element with a correctly mapped text value should be present.");

			// Cleanup
			oCard.destroy();
		});

		QUnit.test("Templating - mixed usage (data feature)", async function (assert) {
			var oCard = new Card({
				manifest: oTemplateManifest9
			});

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			assert.ok(document.querySelectorAll(".ac-textBlock").length, "A TextBlock elements should be present in the DOM.");
			assert.strictEqual(document.querySelectorAll(".ac-textBlock")[0].innerText, "Diana", "A TextBlock element with a correctly mapped text value should be present.");

			// Cleanup
			oCard.destroy();
		});

		QUnit.module("Adaptive Card Markdown Support");

		QUnit.test("Markdown support - enableMarkdown: true", async function (assert) {
			var oCard = new Card({
				manifest: oMarkdownManifest1
			});

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);

			// Assert
			assert.ok(AdaptiveCards.AdaptiveCard.onProcessMarkdown, "onProcessMarkdown should be defined");
			assert.ok(AdaptiveCards.AdaptiveCard.onProcessMarkdown("text", {}), "onProcessMarkdown should return a result");

			// Cleanup
			oCard.destroy();
		});

		QUnit.test("Markdown support - enableMarkdown: false", async function (assert) {
			var oCard = new Card({
				manifest: oMarkdownManifest2
			});

			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);

			// Assert
			assert.ok(AdaptiveCards.AdaptiveCard.onProcessMarkdown, "onProcessMarkdown should be defined");
			assert.notOk(AdaptiveCards.AdaptiveCard.onProcessMarkdown("text", {}), "onProcessMarkdown not should return a result, when enableMarkdown is false");

			// Cleanup
			oCard.destroy();
		});

		QUnit.module("Adaptive Card Action.Submit Handling");

		QUnit.test("getSubmitActionHandler evaluate Success execution", async function (assert) {
			var oAdaptiveContent,
				done = assert.async(),
				oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
				oCard = new Card({
					manifest: mActionSubmitManifest
				}).placeAt(DOM_RENDER_LOCATION);


			await nextCardReadyEvent(oCard);

			oAdaptiveContent = oCard.getCardContent();

			// Act
			CardActions.fireAction({
				card: oCard,
				host: null,
				action: {type: library.CardActionType.Submit},
				parameters: {configuration: {}},
				source: oCard.getCardContent()
			});

			// Assert
			setTimeout(async function () { // .getData() returns a Promise and MessageStrip's manipulations are executed in then()'s callbacks
				await nextUIUpdate();
				assert.ok(oStubRequest.called, "DataProvider's _fetch should have been called");
				assert.strictEqual(oAdaptiveContent.getAggregation("_messageContainer").getItems()[0].getType(), CardMessageType.Success,
					"The success execution should put the state of the MessageStrip to Success");

				assert.ok(oAdaptiveContent.getAggregation("_messageContainer").getItems()[0].$().is(":visible"),
					"The execution of data fetching should make the MessageStrip visible");

				// Cleanup
				oCard.destroy();
				done();
			});
		});
	}
);
