/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
],
	function(
		Card,
		nextUIUpdate,
		nextCardReadyEvent
	) {
		"use strict";

		const DOM_RENDER_LOCATION = "qunit-fixture";

		const sLongText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum congue libero ut blandit faucibus. Phasellus sed urna id tortor consequat accumsan eget at leo. Cras quis arcu magna.";

		QUnit.module("Role - region" , {
			beforeEach: async function() {
				this.oCard = new Card({
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
							"content": {
								"groups": []
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Cards attributes", function (assert) {
			// Assert
			assert.ok(this.oCard.getSemanticRole(), "region", "Card role is regions");
			assert.notOk(this.oCard.getDomRef().getAttribute("tabindex"), "Card should  not have tabindex");
			assert.notOk(this.oCard.getDomRef().classList["value"].indexOf("sapFCardInteractive") > -1, "Card should  not have interactive styles");
		});

		QUnit.module("Role - listitem" , {
			beforeEach: async function() {
				this.oCard = new Card({
					semanticRole: "ListItem",
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
							"content": {
								"groups": []
							}
						}
					}
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
				await nextCardReadyEvent(this.oCard);
			},
			afterEach: function() {
				this.oCard.destroy();
			}
		});

		QUnit.test("Testing attributes", function (assert) {
			// Assert
			assert.ok(this.oCard.getSemanticRole(), "ListItem", "Card role is listitem");
			assert.strictEqual(this.oCard.getDomRef().getAttribute("tabindex"), "0", "Card should have tabindex");
			assert.ok(this.oCard.getDomRef().classList["value"].indexOf("sapFCardInteractive") === -1, "Card should not have interactive styles");
		});
	}
);

