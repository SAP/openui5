/* global QUnit */
sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/date/UI5Date",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function(
	Card,
	UI5Date,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";
	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Formatters in different places of 'sap.card'", {
		beforeEach: async function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Default Header - Formatter in title", async function (assert) {
		// Arrange
		var oManifest = {
				"sap.app": {
					"id": "card.explorer.highlight.list.card",
					"type": "card"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "The date is The date is {= format.dateTime('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }"
					},
					"content": {
						"item": {}
					}
				}
			},
			sYear = UI5Date.getInstance().getUTCFullYear();


		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var sTitle = this.oCard.getCardHeader().getTitle();

		// Assert
		assert.ok(sTitle.indexOf(sYear) > 0, "Title should contain parsed year.");
	});

	QUnit.test("List content - Formatter in item title", async function (assert) {
		// Arrange
		var oListManifest = {
				"sap.app": {
					"id": "card.explorer.highlight.list.card",
					"type": "card"
				},
				"sap.card": {
					"type": "List",
					"content": {
						"data": {
							"json": [{
								"Name": "Comfort Easy",
								"Description": "32 GB Digital Assistant with high-resolution color screen",
								"price" : 510
							}]
						},
						"item": {
							"title": "The date is {= format.dateTime('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }",
							"description": "The price is lower than 50: {= ${price} < 50 ? 'true' : 'false'}"
						}
					}
				}
			},
			sYear = UI5Date.getInstance().getUTCFullYear();

		// Act
		this.oCard.setManifest(oListManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];

		// Assert
		assert.ok(oListItem.getTitle().indexOf(sYear) > 0, "List item should contain parsed year.");
	});

	QUnit.test("Object content - formatter in group item", async function (assert) {
		// Arrange
		var oManifest = {
				"sap.app": {
					"id": "test.object.card",
					"type": "card"
				},
				"sap.card": {
					"type": "Object",
					"data": {
						"json": {
							"firstName": "Donna"
						}
					},
					"content": {
						"groups": [
							{
								"title": "Contact Details",
								"items": [
									{
										"label": "First Name {= format.dateTime('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'})}",
										"value": "{firstName} {= format.dateTime('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }"
									}
								]
							}
						]
					}
				}
			},
			sYear = UI5Date.getInstance().getUTCFullYear();

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
		var oContent = oObjectContent.getAggregation("_content");
		var aGroups = oContent.getItems()[0].getContent();

		// Group 1 assertions
		assert.ok(aGroups[0].getItems()[1].getText().indexOf(sYear) > 0, "Should have correct year after expression binding and formatting.");
		assert.ok(aGroups[0].getItems()[2].getText().indexOf(sYear) > 0, "Should have correct year after expression binding and formatting.");
	});

	QUnit.test("Table content - formatter", async function (assert) {
		// Arrange
		var oManifest = {
				"sap.app": {
					"id": "test.table.card.formatter"
				},
				"sap.card": {
					"type": "Table",
					"content": {
						"data": {
							"json": [{
									"salesOrder": "5000010050"
							}]
						},
						"row": {
							"columns": [
								{
									"title": "Sales Order {= format.dateTime('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }",
									"value": "{salesOrder} {= format.dateTime('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }",
									"identifier": true
								}
							]
						}
					}
				}
			};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oCardContent = this.oCard.getAggregation("_content"),
			oTable = oCardContent.getAggregation("_content"),
			sYear = UI5Date.getInstance().getUTCFullYear(),
			aCells = oTable.getItems()[0].getCells();

		// Column values
		assert.ok(aCells[0].getTitle().indexOf(sYear), "Should have correct year after expression binding and formatting.");
	});

	QUnit.module("Formatters using i18n model of the card", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				manifest: "test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsAndFormatters/manifest.json"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Text formatter", async function (assert) {
		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var sTitle = this.oCard.getCardHeader().getTitle();

		// Column values
		assert.strictEqual(sTitle, "Hello World from card header.", "The text is properly formatted");
	});

});
