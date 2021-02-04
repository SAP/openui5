/* global QUnit*/

sap.ui.define([
	"sap/m/library",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core"
], function (
	mLibrary,
	Card,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var AvatarSize = mLibrary.AvatarSize;
	var AvatarColor = mLibrary.AvatarColor;

	var oManifest_TableCard = {
		"sap.app": {
			"id": "test.cards.table.card1"
		},
		"sap.card": {
			"type": "Table",
			"header": {
				"title": "Sales Orders for Key Accounts"
			},
			"content": {
				"data": {
					"json": [
						{
							"salesOrder": "5000010050",
							"customer": "Robert Brown Entertainment",
							"status": "Delivered",
							"statusState": "Success",
							"orderUrl": "http://www.sap.com",
							"percent": 30,
							"percentValue": "30%",
							"progressState": "Error",
							"iconSrc": "sap-icon://help"
						},
						{
							"salesOrder": "5000010051",
							"customer": "Entertainment Argentinia",
							"status": "Canceled",
							"statusState": "Error",
							"orderUrl": "http://www.sap.com",
							"percent": 70,
							"percentValue": "70 of 100",
							"progressState": "Success",
							"iconSrc": "sap-icon://help"
						},
						{
							"salesOrder": "5000010052",
							"customer": "Brazil Technologies",
							"status": "In Progress",
							"statusState": "Warning",
							"orderUrl": "http://www.sap.com",
							"percent": 55,
							"percentValue": "55GB of 100",
							"progressState": "Warning",
							"iconSrc": "sap-icon://help"
						}
					]
				},
				"row": {
					"columns": [
						{
							"title": "Sales Order",
							"value": "{salesOrder}",
							"identifier": true
						},
						{
							"title": "Customer",
							"value": "{customer}"
						},
						{
							"title": "Status",
							"value": "{status}",
							"state": "{statusState}",
							"hAlign": "End"
						},
						{
							"title": "Order ID",
							"value": "{orderUrl}",
							"url": "{orderUrl}"
						},
						{
							"title": "Progress",
							"progressIndicator": {
								"percent": "{percent}",
								"text": "{percentValue}",
								"state": "{progressState}"
							}
						},
						{
							"title": "Avatar",
							"icon": {
								"src": "{iconSrc}"
							}
						},
						{
							"title": "Sales Order",
							"value": "{salesOrder}",
							"identifier": {
								"url": "{orderUrl}"
							}
						}
					]
				}
			}
		}
	};

	var oManifest_TableCard_Visible = {
			"_version": "1.15.0",
			"sap.app": {
				"id": "card.explorer.table.card",
				"type": "card",
				"title": "Sample of a Table Card",
				"subTitle": "Sample of a Table Card",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"shortTitle": "A short title for this Card",
				"info": "Additional information about this Card",
				"description": "A long description for this Card",
				"tags": {
					"keywords": [
						"Table",
						"Card",
						"Sample"
					]
				}
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://table-view"
				}
			},
			"sap.card": {
				"type": "Table",
				"data": {
					"json": {
						"results": [
							{
								"salesOrder": "5000010050",
								"customerName": "Robert Brown Entertainment",
								"netAmount": "2K USD",
								"status": "Delivered",
								"statusState": "Success"
							},
							{
								"salesOrder": "5000010051",
								"customerName": "Entertainment Argentinia",
								"netAmount": "127k USD",
								"status": "Canceled",
								"statusState": "Error"
							},
							{
								"salesOrder": "5000010052",
								"customerName": "Brazil Technologies",
								"netAmount": "8K USD",
								"status": "In Progress",
								"statusState": "Warning"
							},
							{
								"salesOrder": "5000010053",
								"customerName": "Quimica Madrilenos",
								"netAmount": "25K USD",
								"status": "Delivered",
								"statusState": "Success"
							},
							{
								"salesOrder": "5000010054",
								"customerName": "Development Para O Governo",
								"netAmount": "7K USD",
								"status": "Delivered",
								"statusState": "Success"
							},
							{
								"salesOrder": "5000010050",
								"customerName": "Robert Brown Entertainment",
								"netAmount": "2K USD",
								"status": "Delivered",
								"statusState": "Success"
							},
							{
								"salesOrder": "5000010051",
								"customerName": "Entertainment Argentinia",
								"netAmount": "127k USD",
								"status": "Canceled",
								"statusState": "Error"
							},
							{
								"salesOrder": "5000010052",
								"customerName": "Brazil Technologies",
								"netAmount": "8K USD",
								"status": "In Progress",
								"statusState": "Warning"
							},
							{
								"salesOrder": "5000010052",
								"customerName": "Brazil Technologies",
								"netAmount": "8K USD",
								"status": "In Progress",
								"statusState": "Warning"
							}
						],
						"columns": [
							{
								"title": "Sales Order",
								"visibleFlag": true,
								"identifier": true
							},
							{
								"title": "Customer",
								"visibleFlag": true
							},
							{
								"title": "Net Amount",
								"visibleFlag": false
							},
							{
								"title": "Status",
								"visibleFlag": false
							}
						]
					}
				},
				"header": {
					"title": "Sales Orders for Key Accounts",
					"subTitle": "Today"
				},
				"content": {
					"data": {
						"path": "/results"
					},
					"row": {
						"columns": [
							{
								"title": "{/columns/0/title}",
								"value": "{salesOrder}",
								"identifier": "{/columns/0/identifier}",
								"visible": "{/columns/0/visibleFlag}"
							},
							{
								"title": "{/columns/1/title}",
								"value": "{customerName}",
								"visible": "{/columns/1/visibleFlag}"
							},
							{
								"title": "{/columns/2/title}",
								"value": "{netAmount}",
								"hAlign": "End",
								"visible": "{/columns/2/visibleFlag}"
							},
							{
								"title": "{/columns/3/title}",
								"value": "{status}",
								"state": "{statusState}",
								"visible": false
							}
						]
					}
				}
			}
		};

	var oManifest_TableCard_WithCardLevelData = {
		"sap.app": {
			"id": "test.cards.table.card3"
		},
		"sap.card": {
			"type": "Table",
			"data": {
				"json": [
					{
						"salesOrder": "5000010050",
						"customer": "Robert Brown Entertainment",
						"status": "Delivered",
						"statusState": "Success",
						"orderUrl": "http://www.sap.com",
						"percent": 30,
						"percentValue": "30%",
						"progressState": "Error",
						"iconSrc": "sap-icon://help"
					},
					{
						"salesOrder": "5000010051",
						"customer": "Entertainment Argentinia",
						"status": "Canceled",
						"statusState": "Error",
						"orderUrl": "http://www.sap.com",
						"percent": 70,
						"percentValue": "70 of 100",
						"progressState": "Success",
						"iconSrc": "sap-icon://help"
					},
					{
						"salesOrder": "5000010052",
						"customer": "Brazil Technologies",
						"status": "In Progress",
						"statusState": "Warning",
						"orderUrl": "http://www.sap.com",
						"percent": 55,
						"percentValue": "55GB of 100",
						"progressState": "Warning",
						"iconSrc": "sap-icon://help"
					},
					{
						"salesOrder": "5000010053",
						"customer": "Quimica Madrilenos",
						"status": "Delivered",
						"statusState": "Success",
						"orderUrl": "http://www.sap.com",
						"percent": 10,
						"percentValue": "10GB",
						"progressState": "Error",
						"iconSrc": "sap-icon://help"
					},
					{
						"salesOrder": "5000010054",
						"customer": "Development Para O Governo",
						"status": "Delivered",
						"statusState": "Success",
						"orderUrl": "http://www.sap.com",
						"percent": 100,
						"percentValue": "100%",
						"progressState": "Success",
						"iconSrc": "sap-icon://help"
					}
				]
			},
			"header": {
				"title": "Sales Orders for Key Accounts"
			},
			"content": {
				"row": {
					"columns": [
						{
							"label": "Sales Order",
							"value": "{salesOrder}",
							"identifier": true
						},
						{
							"label": "Customer",
							"value": "{customer}"
						},
						{
							"label": "Status",
							"value": "{status}",
							"state": "{statusState}"
						},
						{
							"label": "Order ID",
							"value": "{orderUrl}",
							"url": "{orderUrl}"
						},
						{
							"label": "Progress",
							"progressIndicator": {
								"percent": "{percent}",
								"text": "{percentValue}",
								"state": "{progressState}"
							}
						},
						{
							"label": "Avatar",
							"icon": {
								"src": "{iconSrc}"
							}
						}
					]
				}
			}
		}
	};

	var oManifest_TableCard_MaxItems = {
		"sap.app": {
			"id": "test.cards.table.card4"
		},
		"sap.card": {
			"type": "Table",
			"data": {
				"json": [
					{
						"customer": "Robert Brown Entertainment"
					},
					{
						"customer": "Entertainment Argentinia"
					},
					{
						"customer": "Brazil Technologies"
					},
					{
						"customer": "Quimica Madrilenos"
					},
					{
						"customer": "Development Para O Governo"
					}
				]
			},
			"header": {
				"title": "Sales Orders for Key Accounts"
			},
			"content": {
				"maxItems": 3,
				"row": {
					"columns": [
						{
							"label": "Customer",
							"value": "{customer}"
						}
					]
				}
			}
		}
	};

	var oManifest_TableCard_StaticContent = {
		"sap.app": {
			"id": "test.cards.table.card5"
		},
		"sap.card": {
			"type": "Table",
			"header": {
				"title": "Table Card with Static content",
				"subTitle": "Table Card subtitle"
			},
			"content": {
				"columns": [
					{
						"title": "Avatar",
						"width": "15%"
					},
					{
						"title": "First Name"
					},
					{
						"title": "Last Name"
					},
					{
						"title": "Progress"
					}
				],
				"rows": [
					{
						"cells": [
							{
								"value": "Petra"
							},
							{
								"value": "Maier"
							},
							{
								"progressIndicator": {
									"percent": 70,
									"text": "70 of 100",
									"state": "Success"
								}
							}
						]
					},
					{
						"cells": [
							{
								"value": "Anna"
							},
							{
								"value": "Smith"
							},
							{
								"progressIndicator": {
									"percent": 30,
									"text": "40 of 100",
									"state": "Warning"
								}
							}
						],
						"actions": [
							{
								"type": "Navigation",
								"url": "https://www.sap.com"
							}
						]
					}
				]
			}
		}
	};

	QUnit.module("Table Card", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "800px"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Using manifest", function (assert) {

		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oManifestData = oManifest_TableCard["sap.card"].content.data.json;
			var oManifestContent = oManifest_TableCard["sap.card"].content;
			var oCardContent = this.oCard.getAggregation("_content");
			var oTable = oCardContent.getAggregation("_content");
			var aColumns = oTable.getColumns();
			var aCells = oTable.getItems()[0].getCells();

			Core.applyChanges();

			// Assert
			assert.equal(aColumns.length, 7, "Should have 7 columns.");

			// Columns titles
			assert.equal(aColumns[0].getHeader().getText(), oManifestContent.row.columns[0].title, "Should have correct column title");
			assert.equal(aColumns[1].getHeader().getText(), oManifestContent.row.columns[1].title, "Should have correct column title");
			assert.equal(aColumns[2].getHeader().getText(), oManifestContent.row.columns[2].title, "Should have correct column title");
			assert.equal(aColumns[3].getHeader().getText(), oManifestContent.row.columns[3].title, "Should have correct column title");
			assert.equal(aColumns[4].getHeader().getText(), oManifestContent.row.columns[4].title, "Should have correct column title");
			assert.equal(aColumns[5].getHeader().getText(), oManifestContent.row.columns[5].title, "Should have correct column title");
			assert.equal(aColumns[5].getHeader().getText(), oManifestContent.row.columns[5].title, "Should have correct column title");
			assert.equal(aColumns[6].getHeader().getText(), oManifestContent.row.columns[6].title, "Should have correct column title");

			// Column cells types
			assert.ok(aCells[0].isA("sap.m.ObjectIdentifier"), "Column with 'identifier' set to 'true' should be of type 'ObjectIdentifier'");
			assert.ok(aCells[1].isA("sap.m.Text"), "Column with 'value' only should be of type 'Text'");
			assert.ok(aCells[2].isA("sap.m.ObjectStatus"), "Column with a 'state' should be of type 'ObjectStatus'");
			assert.ok(aCells[3].isA("sap.m.Link"), "Column with an 'url' should be of type 'Link'");
			assert.ok(aCells[4].isA("sap.m.ProgressIndicator"), "Column with a 'progressIndicator' should be of type 'ProgressIndicator'");
			assert.ok(aCells[5].isA("sap.m.Avatar"), "Column with an 'icon' should be of type 'Avatar'");
			assert.ok(aCells[6].isA("sap.m.ObjectIdentifier"), "Column with 'identifier' as an object should be of type 'ObjectIdentifier'");

			// Column properties
			assert.equal(aColumns[2].getHAlign(), "End", "The status column is aligned at 'End'");

			// Column values
			assert.equal(aCells[0].getTitle(), oManifestData[0].salesOrder, "Should have correct identifier value.");
			assert.equal(aCells[1].getText(), oManifestData[0].customer, "Should have correct text value.");
			assert.equal(aCells[2].getText(), oManifestData[0].status, "Should have correct text value.");
			assert.equal(aCells[2].getState(), oManifestData[0].statusState, "Should have correct state.");
			assert.equal(aCells[3].getText(), oManifestData[0].orderUrl, "Should have correct text value.");
			assert.equal(aCells[4].getPercentValue(), oManifestData[0].percent, "Should have correct percentage.");
			assert.equal(aCells[4].getDisplayValue(), oManifestData[0].percentValue, "Should have correct progress text.");
			assert.equal(aCells[4].getState(), oManifestData[0].progressState, "Should have correct progress state.");
			assert.equal(aCells[5].getSrc(), oManifestData[0].iconSrc, "Should have correct icon src.");
			assert.ok(aCells[6].getTitleActive(), "Should be active identifier.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_TableCard);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Visible columns", function (assert) {

		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oCardContent = this.oCard.getAggregation("_content"),
				oTable = oCardContent.getAggregation("_content"),
				aColumns = oTable.getColumns();

			Core.applyChanges();
			// Assert
			assert.notOk(aColumns[2].getVisible(), "Column three should not be visible");
			assert.ok(aColumns[1].getVisible(), "Column two should be visible");
			assert.notOk(aColumns[3].getVisible(), "Column four should not be visible");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_TableCard_Visible);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Table Card - static content", function (assert) {

		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content");

			Core.applyChanges();

			// Assert
			assert.ok(oContent, "Table Card static content should be set");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_TableCard_StaticContent);
	});

	QUnit.test("Using manifest with card level data section", function (assert) {

		// Arrange
		var done = assert.async();
		var oManifestValueToCheck = oManifest_TableCard_WithCardLevelData["sap.card"].data.json[0].salesOrder;

		this.oCard.attachEvent("_ready", function () {

			Core.applyChanges();

			var aItems = this.oCard.getCardContent().getAggregation("_content").getItems();
			assert.equal(aItems.length, 5, "Should have 5 items in the table.");

			var oItemCell = aItems[0].getCells()[0];
			assert.ok(oItemCell.isA("sap.m.ObjectIdentifier"), "Should have created an object identifier.");

			// Aggregation binding succeeded if one of the cells have correct value.
			assert.equal(oItemCell.getTitle(), oManifestValueToCheck, "Cell should have correct value.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_TableCard_WithCardLevelData);
	});

	QUnit.test("Using maxItems manifest property", function (assert) {

		// Arrange
		var done = assert.async();
		var iMaxItems = oManifest_TableCard_MaxItems["sap.card"]["content"]["maxItems"];

		this.oCard.attachEvent("_ready", function () {

			Core.applyChanges();

			var iNumberOfItems = this.oCard.getCardContent().getAggregation("_content").getItems().length;
			assert.ok(iNumberOfItems <= iMaxItems, "Should have less items than the maximum.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_TableCard_MaxItems);
	});

	QUnit.module("Manifest properties", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "800px",
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

	QUnit.test("Icon properties", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
				"sap.app": {
					"id": "table.card.test.icon"
				},
				"sap.card": {
					"type": "Table",
					"data": {
						"json": [{
							"avatar": "images/Image_1.png"
						}]
					},
					"content": {
						"row": {
							"columns": [{
								"title": "Avatar",
								"icon": {
									"src": "{avatar}",
									"shape": "Circle",
									"alt": "human image",
									"text": "IT"
								}
							}]
						}
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getCells()[0];

			assert.strictEqual(oAvatar.getSrc(), "test-resources/sap/ui/integration/qunit/testResources/images/Image_1.png", "Should have correct avatar src");
			assert.strictEqual(oAvatar.getDisplayShape(), oManifest["sap.card"].content.row.columns[0].icon.shape, "Should have 'Circle' shape");
			assert.strictEqual(oAvatar.getTooltip_AsString(), oManifest["sap.card"].content.row.columns[0].icon.alt, "Should have tooltip set");
			assert.strictEqual(oAvatar.getInitials(), oManifest["sap.card"].content.row.columns[0].icon.text, "Should have initials set");
			assert.strictEqual(oAvatar.getDisplaySize(), AvatarSize.XS, "The default size of the avatar is 'XS'");
			assert.ok(oAvatar.hasStyleClass("sapFCardIcon"), "'sapFCardIcon' class is added");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.test("Icon with 'size'", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
				"sap.app": {
					"id": "table.card.test.icon"
				},
				"sap.card": {
					"type": "Table",
					"data": {
						"json": [{
							"avatar": "sap-icon://warning"
						}]
					},
					"content": {
						"row": {
							"columns": [{
								"title": "Avatar",
								"icon": {
									"src": "{avatar}",
									"size": "S"
								}
							}]
						}
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getCells()[0];

			assert.strictEqual(oAvatar.getDisplaySize(), AvatarSize.S, "'size' is as in the manifest.");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.test("'backgroundColor' of icon with src", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getCells()[0];

			// Assert
			assert.strictEqual(oAvatar.getBackgroundColor(), AvatarColor.Transparent, "Background should be 'Transparent' when there is only icon.");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"id": "testTableCard"
			},
			"sap.card": {
				"type": "Table",
				"content": {
					"data": {
						"json": [{
							"src": "sap-icon://error"
						}]
					},
					"row": {
						"columns": [{
							"icon": {
								"src": "{src}"
							}
						}]
					}
				}
			}
		});
	});

	QUnit.test("'backgroundColor' of icon with initials", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getCells()[0],
				sExpected = oAvatar.getMetadata().getPropertyDefaults().backgroundColor;

			// Assert
			assert.strictEqual(oAvatar.getBackgroundColor(), sExpected, "Background should have default value when there are initials.");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"id": "testTableCard"
			},
			"sap.card": {
				"type": "Table",
				"content": {
					"data": {
						"json": [{
							"initials": "AC"
						}]
					},
					"row": {
						"columns": [{
							"icon": {
								"text": "{initials}"
							}
						}]
					}
				}
			}
		});
	});

});
