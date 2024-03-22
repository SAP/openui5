/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/library",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
],
	function(
		Card,
		library,
		nextUIUpdate,
		nextCardReadyEvent
	) {
		"use strict";

		const DOM_RENDER_LOCATION = "qunit-fixture";

		const CardDisplayVariant = library.CardDisplayVariant;

		const sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue libero ut blandit faucibus. Phasellus sed urna id tortor consequat accumsan eget at leo. Cras quis arcu magna.";

		QUnit.module("Tile defaults");

		QUnit.test("Tooltips default header", async function (assert) {
			// Act
			const oCard = new Card({
				displayVariant: CardDisplayVariant.TileStandard,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources",
				manifest: {
					"sap.app": {
						"id": "test.card.tile.tooltips"
					},
					"sap.card": {
						"type": "Object",
						"header": {
							"title": sLongText,
							"subTitle": sLongText
						},
						"content": { }
					}
				}
			});

			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(oCard.getCardHeader().getProperty("useTooltips"), "Card header is set to use tooltips");

			oCard.destroy();
		});

		QUnit.test("Tooltips numeric header", async function (assert) {
			// Act
			const oCard = new Card({
				displayVariant: CardDisplayVariant.TileStandard,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources",
				manifest: {
					"sap.app": {
						"id": "test.card.tile.tooltips"
					},
					"sap.card": {
						"type": "Object",
						"header": {
							"type": "Numeric",
							"title": sLongText,
							"subTitle": sLongText,
							"details": sLongText,
							"sideIndicators": [
								{
									"title": sLongText,
									"number": 0
								},
								{
									"title": sLongText,
									"number": 0
								}
							]
						},
						"content": { }
					}
				}
			});

			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			// Assert
			const oHeader = oCard.getCardHeader();
			assert.ok(oHeader.getProperty("useTooltips"), "Card header is set to use tooltips");
			assert.ok(oHeader.getSideIndicators()[0].getProperty("useTooltips"), "Side Indicator 0 is set to use tooltips");
			assert.ok(oHeader.getSideIndicators()[1].getProperty("useTooltips"), "Side Indicator 1 is set to use tooltips");

			oCard.destroy();
		});

		QUnit.test("Header is rendered as link", async function (assert) {
			// Act
			const oCard = new Card({
				displayVariant: CardDisplayVariant.TileStandard,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources",
				manifest: {
					"sap.app": {
						"id": "test.card.tile.links"
					},
					"sap.card": {
						"type": "Object",
						"data":	{
							"json": {
								"url": "http://www.sap.com",
								"target": "_blank"
							}
						},
						"header": {
							"title": "Test",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "{url}",
										"target": "{target}"
									}
								}
							]
						},
						"content": { }
					}
				}
			});

			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			// Assert
			const oLink = oCard.getFocusDomRef();
			assert.strictEqual(oLink.tagName.toLowerCase(), "a", "Focusable element in header is an link");
			assert.strictEqual(oLink.href, "http://www.sap.com/", "Link has correct href");
			assert.strictEqual(oLink.target, "_blank", "Link has correct target");
			assert.strictEqual(oLink.rel, "noopener noreferrer", "Link has correct rel");

			oCard.destroy();
		});

		QUnit.test("Numeric header is rendered as link", async function (assert) {
			// Act
			const oCard = new Card({
				displayVariant: CardDisplayVariant.TileStandard,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources",
				manifest: {
					"sap.app": {
						"id": "test.card.tile.links"
					},
					"sap.card": {
						"type": "Object",
						"data":	{
							"json": {
								"url": "http://www.sap.com/",
								"target": "_blank"
							}
						},
						"header": {
							"type": "Numeric",
							"title": "Test",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "{url}",
										"target": "{target}"
									}
								}
							]
						},
						"content": { }
					}
				}
			});

			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			// Assert
			const oLink = oCard.getFocusDomRef();
			assert.strictEqual(oLink.tagName.toLowerCase(), "a", "Focusable element in header is an link");
			assert.strictEqual(oLink.href, "http://www.sap.com/", "Link has correct href");
			assert.strictEqual(oLink.target, "_blank", "Link has correct target");
			assert.strictEqual(oLink.rel, "noopener noreferrer", "Link has correct rel");

			oCard.destroy();
		});

	}
);

