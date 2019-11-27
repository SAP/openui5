/* global QUnit */
sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/f/cards/formatters/DateTimeFormatter",
	"sap/f/cards/formatters/NumberFormatter"
],
function (
	Card,
	Core,
	DateTimeFormatter,
	NumberFormatter
) {
	"use strict";
	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oList_Manifest = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.highlight.list.card",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "The date is The date is {= format.date('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }",
				"subtitle": "The date is The date is {= format.date('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }",
				"icon": {
					"src": "sap-icon://desktop-mobile"
				},
				"status": {
					"text": "5 of 20"
				}
			},
			"content": {
				"data": {
					"json": [{
						"Name": "Comfort Easy",
						"Description": "32 GB Digital Assistant with high-resolution color screen",
						"Highlight": "Error",
						"price" : 510
					},
						{
							"Name": "ITelO Vault",
							"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
							"Highlight": "Warning",
							"price" : 30
						},
						{
							"Name": "Notebook Professional 15",
							"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
							"Highlight": "Success",
							"price" : 30
						},
						{
							"Name": "Ergo Screen E-I",
							"Description": "Optimum Hi-Resolution max. 1920 x 1080 @ 85Hz, Dot Pitch: 0.27mm",
							"Highlight": "Information"
						},
						{
							"Name": "Laser Professional Eco",
							"Description": "Print 2400 dpi image quality color documents at speeds of up to 32 ppm (color) or 36 ppm (monochrome), letter/A4. Powerful 500 MHz processor, 512MB of memory",
							"Highlight": "None"
						}
					]
				},
				"item": {
					"title": "The date is {= format.date('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }",
					"description": "The price is lower than 50: {= ${price} < 50 ? 'true' : 'false'}",
					"highlight": "{Highlight}"
				}
			}
		}
	};
	var oManifest_ObjectCard = {
		"sap.app": {
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"data": {
				"json": {
					"firstName": "Donna",
					"lastName": "Moore",
					"position": "Sales Executive",
					"phone": "+1 202 555 5555",
					"email": "my@mymail.com",
					"photo": "./Woman_avatar_01.png",
					"manager": {
						"firstName": "John",
						"lastName": "Miller",
						"photo": "./Woman_avatar_02.png"
					},
					"company": {
						"name": "Robert Brown Entertainment",
						"address": "481 West Street, Anytown OH 45066, USA",
						"email": "mail@mycompany.com",
						"emailSubject": "Subject",
						"website": "www.company_a.example.com",
						"url": "http://www.company_a.example.com"
					}
				}
			},
			"header": {
				"icon": {
					"src": "{photo}"
				},
				"title": "{firstName} {lastName}",
				"subTitle": "{position}"
			},
			"content": {
				"groups": [
					{
						"title": "Contact Details",
						"items": [
							{
								"label": "First Name {= format.date('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'})}",
								"value": "{firstName} {= format.date('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }"
							},
							{
								"label": "Last Name",
								"value": "{lastName}"
							},
							{
								"label": "Phone",
								"value": "{phone}",
								"type": "phone"
							},
							{
								"label": "Email",
								"value": "{email}",
								"type": "email"
							}
						]
					},
					{
						"title": "Organizational Details",
						"items": [
							{
								"label": "Direct Manager",
								"value": "{manager/firstName} {manager/lastName}",
								"icon": {
									"src": "{manager/photo}"
								}
							}
						]
					},
					{
						"title": "Company Details",
						"items": [
							{
								"label": "Company Name",
								"value": "{company/name}"
							},
							{
								"label": "Address",
								"value": "{company/address}"
							},
							{
								"label": "Email",
								"value": "{company/email}",
								"emailSubject": "{company/emailSubject}",
								"type": "email"
							},
							{
								"label": "Website",
								"value": "{company/website}",
								"url": "{company/url}",
								"type": "link"
							}
						]
					}
				]
			}
		}
	};

	var oManifest_TableCard = {
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
				"row": {
					"columns": [
						{
							"title": "Sales Order {= format.date('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }",
							"value": "{salesOrder} {= format.date('{{parameters.NOW_ISO}}', {pattern: 'd MMM y'}) }",
							"identifier": true
						},
						{
							"title": "Customer",
							"value": "{customer}"
						},
						{
							"title": "Status",
							"value": "{status}",
							"state": "{statusState}"
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

	QUnit.module("Formatter");

	QUnit.test("Format date should be dd MMM yy", function (assert) {

		var oDateResult = DateTimeFormatter.dateTime(new Date(1993, 11, 11), {format: "yMMMd"});
		assert.strictEqual(oDateResult, "Dec 11, 1993", "Date is formatted correctly");
	});

	QUnit.module("Number Formatters");

	QUnit.test("Currency formatter with options and locale", function (assert) {

		var oCurrencyResult = NumberFormatter.currency(50, "EUR", { "decimals":2 }, "en-US");
		assert.strictEqual(oCurrencyResult, "EUR 50.00", "currency is formatted correctly");
	});

	QUnit.test("Currency formatter with options only", function (assert) {

		var oCurrencyResult = NumberFormatter.currency(50, "EUR", { "decimals":2 });
		assert.strictEqual(oCurrencyResult, "EUR 50.00", "currency is formatted correctly");
	});
	QUnit.test("Currency formatter with locale only", function (assert) {

		var oCurrencyResult = NumberFormatter.currency(50, "EUR", 'en-US');
		assert.strictEqual(oCurrencyResult, "EUR 50.00", "currency is formatted correctly");
	});

	QUnit.test("Currency formatter no options no locale", function (assert) {

		var oCurrencyResult = NumberFormatter.currency(50, "EUR");
		assert.strictEqual(oCurrencyResult, "EUR 50.00", "currency is formatted correctly");
	});

	QUnit.test("Float formatter", function (assert) {

		var oCurrencyResult = NumberFormatter.float(1234.5678, { "decimals":2 });
		assert.strictEqual(oCurrencyResult, "1,234.57", "float is formatted correctly");
	});
	QUnit.test("Integer formatter", function (assert) {

		var oCurrencyResult = NumberFormatter.integer(1234.5678);
		assert.strictEqual(oCurrencyResult, "1234", "integer is formatted correctly");
	});
	QUnit.test("Percent formatter", function (assert) {

		var oCurrencyResult = NumberFormatter.percent(0.5);
		assert.strictEqual(oCurrencyResult, "50%", "percent is formatted correctly");
	});
	QUnit.test("Unit formatter", function (assert) {

		var oCurrencyResult = NumberFormatter.unit(12, "length-kilometer");
		assert.strictEqual(oCurrencyResult, "12 km", "unit is formatted correctly");
	});


	QUnit.module("Card Content formatter", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("List - Formatted date is set using expresion binding", function (assert) {

		// Arrange
		var done = assert.async(),
			sYear = new Date().getUTCFullYear();

		this.oCard.attachEventOnce("_ready", function () {
			var sSubtitle = this.oCard.getCardHeader().getTitle(),
				oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];

			Core.applyChanges();

			// Assert
			assert.ok(sSubtitle.indexOf(sYear) > 0, "Title should contain parsed year.");
			assert.ok(oListItem.getTitle().indexOf(sYear) > 0, "List item should contain parsed year.");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oList_Manifest);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Object content formatting", function (assert) {

		// Arrange
		var done = assert.async(),
			sYear = new Date().getUTCFullYear();

		this.oCard.attachEvent("_ready", function () {
			var oObjectContent = this.oCard.getAggregation("_content");
			var oContent = oObjectContent.getAggregation("_content");
			var aGroups = oContent.getContent();

			Core.applyChanges();

			// Group 1 assertions
			assert.ok(aGroups[0].getItems()[1].getText().indexOf(sYear) > 0, "Should have correct year after expresion binding and formatting.");
			assert.ok(aGroups[0].getItems()[2].getText().indexOf(sYear) > 0, "Should have correct year after expresion binding and formatting.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_ObjectCard);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Table content - formatter", function (assert) {

		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oCardContent = this.oCard.getAggregation("_content"),
				oTable = oCardContent.getAggregation("_content"),
				sYear = new Date().getUTCFullYear(),
				aCells = oTable.getItems()[0].getCells();

			Core.applyChanges();

			// Column values
			assert.ok(aCells[0].getTitle().indexOf(sYear), "Should have correct year after expresion binding and formatting.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_TableCard);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});


});
