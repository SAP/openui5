/* global QUnit */

sap.ui.define([
	"sap/ui/integration/cards/TimelineContent",
	"sap/ui/core/Core",
	"sap/ui/integration/cards/BaseListContent",
	"sap/ui/integration/widgets/Card"

], function (
	TimelineContent,
	Core,
	BaseListContent,
	Card
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	return Core.loadLibrary("sap.suite.ui.commons", { async: true }).then(function () {
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

		QUnit.test("No items pagination", function (assert) {

			// Arrange
			var done = assert.async();
			var oBaseListContentSpy = this.spy(BaseListContent.prototype, "getDataLength");
			var oCard =  new Card();
			oCard.attachEventOnce("_ready", function () {

				var oPaginator = oCard.getCardFooter().getPaginator();
				Core.applyChanges();

				//Assert
				assert.strictEqual(oBaseListContentSpy.callCount, 0, "The getDataLength method is not called");
				assert.notOk(oPaginator.$().find(".sapMCrslBulleted span").length, "dots are not rendered");
				assert.notOk(oPaginator.getDomRef(), "paginator is not rendered when there are no items");

				var $numericIndicator = oPaginator.$().find(".sapMCrslNumeric span");
				assert.notOk($numericIndicator.length, "numeric indicator is not rendered");

				done();
				oCard.destroy();
				oCard = null;
			});

			// Act
			oCard.setManifest({
				"sap.app": {
					"id": "card.qunit.activities.timeline.card"
				},
				"sap.card": {
					"type": "Timeline",
					"header": {
						"title": "Past Activities"
					},
					"content": {
						"maxItems": 2,
						"data": {
							"json": {
								"parameters": {
									"$format": "json",
									"$top": 0
								}
							},
							"path": "/value"
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
							},
							"icon": {
								"src": "{Icon}"
							},
							"actions": [{
								"type": "Navigation",
								"parameters": {
									"url": "{Url}"
								}
							}]
						}
					},
					"footer": {
						"paginator": {
							"pageSize": 2
						}
					}
				}
			});

			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.module("Data and items length", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Data and items length when maxItems property is set", function (assert) {
			// Arrange
			var done = assert.async(),
				oManifest = {
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

			this.oCard.attachEvent("_ready", function () {
				assert.strictEqual(this.oCard.getCardContent().getItemsLength(), 2, "#getItemsLength result should be correct");
				assert.strictEqual(this.oCard.getCardContent().getDataLength(), 3, "#getDataLength result should be correct");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest);
		});
	}).catch(function () {
		QUnit.module("Timeline Card");
		QUnit.test("Timeline content not supported", function (assert) {
			assert.ok(true, "Timeline content type is not available with this distribution.");
		});
	});
});
