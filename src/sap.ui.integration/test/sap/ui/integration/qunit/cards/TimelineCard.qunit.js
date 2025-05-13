/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/cards/TimelineContent",
	"sap/ui/integration/widgets/Card",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/genericTests/actionEnablementTests"
], function (
	Library,
	TimelineContent,
	Card,
	nextCardReadyEvent,
	actionEnablementTests
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const oRb = Library.getResourceBundleFor("sap.ui.integration");

	return Library.load("sap.suite.ui.commons").then(function () {
		actionEnablementTests("TimelineCard", {
			manifest: {
				"sap.app": {
					"id": "test.card.actions.card.timeline",
					"type": "card"
				},
				"sap.card": {
					"type": "Timeline",
					"header": {
						"title": "Card Title"
					},
					"content": {
						"data": {
							"json": [{
								"Title": "Weekly sync: Marketplace / Design Stream",
								"Description": "MRR WDF18 C3.2(GLASSBOX)",
								"Time": "2021-10-25T10:00:00.000Z"
							}]
						},
						"item": {
							"dateTime": {
								"value": "{Time}"
							},
							"description": {
								"value": "{Description}"
							},
							"title": {
								"value": "{Title}"
							}
						}
					}
				}
			},
			partUnderTestPath: "/sap.card/content/item",
			getActionControl: (oCard) => {
				return oCard.getCardContent().getInnerList().getContent()[0];
			},
			skipEnabledTests: true,
			DOM_RENDER_LOCATION,
			QUnit,
			sinon
		});

		QUnit.module("Navigation Action - Timeline Content", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.module("Timeline Card", {
			beforeEach: function () {
				this.oTimelineContent = new TimelineContent();
				return this.oTimelineContent.loadDependencies();
			},
			afterEach: function () {
				this.oTimelineContent.destroy();
			}
		});

		QUnit.test("Growing should be disabled by default", function (assert) {
			// assert
			assert.strictEqual(this.oTimelineContent.getInnerList().getGrowingThreshold(), 0, "Growing should be disabled by default");
		});

		QUnit.test("Growing should be enabled when 'maxItems' is set", function (assert) {
			// arrange
			this.stub(this.oTimelineContent, "getCardInstance")
				.returns({
					getBindingNamespaces: function () {
						return {};
					},
					removeActiveLoadingProvider: function () {

					},
					getId: function () {
						return "id1";
					}
				});
			this.oTimelineContent.setConfiguration({
				maxItems: 35
			});
			this.oTimelineContent.applyConfiguration();

			// assert
			assert.strictEqual(this.oTimelineContent.getInnerList().getGrowingThreshold(), 35, "Growing threshold should be set according to 'maxItems'");
		});

		QUnit.module("Data and items length", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Data and items length when maxItems property is set", async function (assert) {
			// Arrange
			var oManifest = {
					"sap.app": {
						"id": "testTimelineCardItemsLength"
					},
					"sap.card": {
						"type": "Timeline",
						"header": {
							"title": "TImeline Card"
						},
						"content": {
							"data": {
								"json": [
									{
										"Title": "Weekly sync: Marketplace / Design Stream"
									},
									{
										"Title": "Video Conference for FLP@SF, S4,Hybris"
									},
									{
										"Title": "Call 'Project Nimbus'"
									}
								]
							},
							"item": {
								"title": {
									"value": "{Title}"
								}
							},
							"maxItems": 2
						}
					}
				};

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);

			assert.strictEqual(this.oCard.getCardContent().getItemsLength(), 2, "#getItemsLength result should be correct");
			assert.strictEqual(this.oCard.getCardContent().getDataLength(), 3, "#getDataLength result should be correct");

			const aIds = this.oCard.getDomRef().getAttribute("aria-describedby").split(" ");
			assert.strictEqual(document.getElementById(aIds[0]).innerText, oRb.getText("ARIA_DESCRIPTION_CARD_TYPE_TIMELINE"), "aria text for card type is correct.");
		});
	}).catch(function () {
		QUnit.module("Timeline Card");
		QUnit.test("Timeline content not supported", function (assert) {
			assert.ok(true, "Timeline content type is not available with this distribution.");
		});
	});
});
