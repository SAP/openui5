/* global QUnit */
sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core"
], function (
	Card,
	Core
) {
	"use strict";
	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Formatters in different places of 'sap.card'", {
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

	QUnit.test("Default Header - Formatter in title", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
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
			sYear = new Date().getUTCFullYear();

		this.oCard.attachEventOnce("_ready", function () {
			var sTitle = this.oCard.getCardHeader().getTitle();

			Core.applyChanges();

			// Assert
			assert.ok(sTitle.indexOf(sYear) > 0, "Title should contain parsed year.");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.test("List content - Formatter in item title", function (assert) {
		// Arrange
		var done = assert.async(),
			oListManifest = {
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
			sYear = new Date().getUTCFullYear();

		this.oCard.attachEventOnce("_ready", function () {
			var oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];

			Core.applyChanges();

			// Assert
			assert.ok(oListItem.getTitle().indexOf(sYear) > 0, "List item should contain parsed year.");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oListManifest);
	});

	QUnit.test("Object content - formatter in group item", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
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
			sYear = new Date().getUTCFullYear();

		this.oCard.attachEvent("_ready", function () {
			var oObjectContent = this.oCard.getAggregation("_content");
			var oContent = oObjectContent.getAggregation("_content");
			var aGroups = oContent.getContent();

			Core.applyChanges();

			// Group 1 assertions
			assert.ok(aGroups[0].getItems()[1].getText().indexOf(sYear) > 0, "Should have correct year after expression binding and formatting.");
			assert.ok(aGroups[0].getItems()[2].getText().indexOf(sYear) > 0, "Should have correct year after expression binding and formatting.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.test("Table content - formatter", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
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

		this.oCard.attachEvent("_ready", function () {
			var oCardContent = this.oCard.getAggregation("_content"),
				oTable = oCardContent.getAggregation("_content"),
				sYear = new Date().getUTCFullYear(),
				aCells = oTable.getItems()[0].getCells();

			Core.applyChanges();

			// Column values
			assert.ok(aCells[0].getTitle().indexOf(sYear), "Should have correct year after expression binding and formatting.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
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

	QUnit.test("Text formatter", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var sTitle = this.oCard.getCardHeader().getTitle();

			// Column values
			assert.strictEqual(sTitle, "Hello World from card header.", "The text is properly formatted");

			done();
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

});
