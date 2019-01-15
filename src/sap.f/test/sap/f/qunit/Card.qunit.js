/*global QUnit */

sap.ui.define([
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/ui/core/Core"
],
function (
	Card,
	CardHeader,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Init");

	QUnit.test("Initialization", function (assert) {

		// Arrange
		var oCard = new Card("somecard", {
			header: new CardHeader({ title: "Title" }),
			content: new sap.m.Text({ text: "Text" })
		});

		// Act
		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.ok(oCard.getDomRef(), "The card is rendered");
		assert.ok(oCard.getHeader().getDomRef(), "Card header should be rendered.");
		assert.ok(oCard.getContent().getDomRef(), "Card content should be rendered.");
	});

});