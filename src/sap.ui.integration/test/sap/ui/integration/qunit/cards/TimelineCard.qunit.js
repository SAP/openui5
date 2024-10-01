/* global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/cards/TimelineContent",
	"sap/ui/integration/widgets/Card",
	"qunit/testResources/nextCardReadyEvent"
], function (
	Library,
	TimelineContent,
	Card,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	return Library.load("sap.suite.ui.commons").then(function () {
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
		});
	}).catch(function () {
		QUnit.module("Timeline Card");
		QUnit.test("Timeline content not supported", function (assert) {
			assert.ok(true, "Timeline content type is not available with this distribution.");
		});
	});
});
