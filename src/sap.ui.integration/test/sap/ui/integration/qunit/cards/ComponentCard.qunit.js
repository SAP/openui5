/* global QUnit */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/integration/widgets/Card"
], function (
	library,
	Card
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";
	var CardPreviewMode = library.CardPreviewMode;

	QUnit.module("Component Card", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "800px"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("ComponentContainer shouldn't be created when preview mode is 'Abstract'", function (assert) {
		var done = assert.async();

		this.oCard.attachEventOnce("_ready", function () {
			assert.notOk(this.oCard.getCardContent().getAggregation("_content"), "ComponentContainer shouldn't have been created");

			done();
		}.bind(this));

		this.oCard.setPreviewMode(CardPreviewMode.Abstract);
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.component.card1",
				"type": "card"
			},
			"sap.card": {
				"type": "Component"
			}
		});
	});
});
