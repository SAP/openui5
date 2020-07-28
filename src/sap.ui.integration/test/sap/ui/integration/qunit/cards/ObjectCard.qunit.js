/* global QUnit*/

sap.ui.define([
		"sap/ui/integration/widgets/Card",
		"sap/ui/core/Core"
	],
	function (
		Card,
		Core
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

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
									"label": "First Name",
									"value": "{firstName}"
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
									"label": "Alt Email",
									"value": "newmail@mail.com",
									"emailSubject": "Mail Subject",
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

		var oManifest_ObjectCard_Visible = {
			"sap.app": {
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"visible": false,
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
							"visible": "{visible}",
							"title": "Contact Details",
							"items": [
								{
									"label": "First Name",
									"value": "{firstName}"
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
							"title": "Company Details",
							"items": [
								{
									"visible": false,
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
									"label": "Alt Email",
									"value": "newmail@mail.com",
									"emailSubject": "Mail Subject",
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

		QUnit.module("Object Card", {
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

		QUnit.test("Using manifest", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var oObjectContent = this.oCard.getAggregation("_content");
				var oContent = oObjectContent.getAggregation("_content");
				var oHeader = this.oCard.getAggregation("_header");
				var aGroups = oContent.getContent();
				var oData = oManifest_ObjectCard["sap.card"].data.json;
				var oManifestContent = oManifest_ObjectCard["sap.card"].content;

				Core.applyChanges();

				assert.equal(aGroups.length, 3, "Should have 3 groups.");

				// Header assertions
				assert.equal(oHeader.getTitle(), oData.firstName + " " + oData.lastName, "Should have correct header title.");
				assert.equal(oHeader.getSubtitle(), oData.position, "Should have correct header subtitle.");
				assert.equal(oHeader.getIconSrc(), oData.photo, "Should have correct header icon source.");

				// Group 1 assertions
				assert.equal(aGroups[0].getItems().length, 9, "Should have 9 items.");
				assert.equal(aGroups[0].getItems()[0].getText(), oManifestContent.groups[0].title, "Should have correct group title.");
				assert.equal(aGroups[0].getItems()[1].getText(), oManifestContent.groups[0].items[0].label + ":", "Should have correct item label.");
				assert.equal(aGroups[0].getItems()[2].getText(), oData.firstName, "Should have correct item value.");
				assert.equal(aGroups[0].getItems()[3].getText(), oManifestContent.groups[0].items[1].label + ":", "Should have correct item label.");
				assert.equal(aGroups[0].getItems()[4].getText(), oData.lastName, "Should have correct item value.");
				assert.equal(aGroups[0].getItems()[5].getText(), oManifestContent.groups[0].items[2].label + ":", "Should have correct item label.");
				assert.equal(aGroups[0].getItems()[6].getText(), oData.phone, "Should have correct item value.");
				assert.equal(aGroups[0].getItems()[6].getHref(), "tel:" + oData.phone, "Should have correct phone link.");

				// Group 2 assertions
				assert.equal(aGroups[1].getItems().length, 2, "Should have 2 items.");
				assert.equal(aGroups[1].getItems()[0].getText(), oManifestContent.groups[1].title, "Should have correct group title.");
				assert.equal(aGroups[1].getItems()[1].getItems()[0].getSrc(), oData.manager.photo, "Should have correct image source.");
				assert.equal(aGroups[1].getItems()[1].getItems()[1].getItems()[0].getText(), oManifestContent.groups[1].items[0].label + ":", "Should have correct item label");
				assert.equal(aGroups[1].getItems()[1].getItems()[1].getItems()[1].getText(), oData.manager.firstName + " " + oData.manager.lastName, "Should have correct item value.");

				// Group 3 assertions
				assert.equal(aGroups[2].getItems().length, 11, "Should have 11 items.");
				assert.equal(aGroups[2].getItems()[0].getText(), oManifestContent.groups[2].title, "Should have correct group title.");
				assert.equal(aGroups[2].getItems()[1].getText(), oManifestContent.groups[2].items[0].label + ":", "Should have correct item label.");
				assert.equal(aGroups[2].getItems()[2].getText(), oData.company.name, "Should have correct item value.");
				assert.equal(aGroups[2].getItems()[3].getText(), oManifestContent.groups[2].items[1].label + ":", "Should have correct item label.");
				assert.equal(aGroups[2].getItems()[4].getText(), oData.company.address, "Should have correct item value.");
				assert.equal(aGroups[2].getItems()[5].getText(), oManifestContent.groups[2].items[2].label + ":", "Should have correct item label.");
				assert.equal(aGroups[2].getItems()[6].getText(), oData.company.email, "Should have correct item value.");
				assert.equal(aGroups[2].getItems()[6].getHref(), "mailto:" + oData.company.email + "?subject=" + oData.company.emailSubject, "Should have correct item links.");
				assert.equal(aGroups[2].getItems()[8].getText(), "newmail@mail.com", "Should have correct item value.");
				assert.equal(aGroups[2].getItems()[8].getHref(), "mailto:" + "newmail@mail.com" + "?subject=" + "Mail Subject", "Should have correct item link.");
				assert.equal(aGroups[2].getItems()[10].getText(), oData.company.website, "Should have correct item value.");
				assert.equal(aGroups[2].getItems()[10].getHref(), oData.company.url, "Should have correct item URL.");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ObjectCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Spacing between groups are correctly calculated", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var oObjectContent = this.getAggregation("_content");
				var oContent = oObjectContent.getAggregation("_content");
				var oEvent = { size: { width: 400 }, oldSize: { width: 0 }, control: oContent };

				Core.applyChanges();

				//This is the case when 2 groups are in one column and the last group is on another row
				oObjectContent.onAlignedFlowLayoutResize(oEvent);
				assert.ok(oContent.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The first group should have the separation class");
				assert.ok(!oContent.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The second group should not have the separation class");
				assert.ok(oContent.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The last group should have the separation class");

				//This is the case when all groups are in one column
				oEvent.size.width = 200;
				oObjectContent.onAlignedFlowLayoutResize(oEvent);
				assert.ok(!oContent.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
				assert.ok(!oContent.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
				assert.ok(!oContent.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");

				//This is the case when all groups are in one row
				oEvent.size.width = 800;
				oObjectContent.onAlignedFlowLayoutResize(oEvent);
				assert.ok(oContent.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should have the separation class");
				assert.ok(oContent.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should have the separation class");
				assert.ok(!oContent.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");

				done();
			});

			// Act
			this.oCard.setManifest(oManifest_ObjectCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Visible property", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {

				var oContent = this.oCard.getAggregation("_content"),
					oLayout = oContent.getAggregation("_content");

				Core.applyChanges();
				assert.ok(oLayout.getDomRef().children[0].classList.contains("sapFCardInvisibleContent"), "Group is hidden");
				assert.notOk(oLayout.getDomRef().children[1].classList.contains("sapFCardInvisibleContent"), "Group should be visible");
				assert.notOk(oLayout.getContent()[1].getItems()[1].getVisible(), "The group item should not be visible");
				assert.notOk(oLayout.getContent()[1].getItems()[2].getVisible(), "The group item should not be visible");
				assert.ok(oLayout.getContent()[1].getItems()[3].getVisible(), "The group item should be visible");
				assert.ok(oLayout.getContent()[1].getItems()[4].getVisible(), "The group item should be visible");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ObjectCard_Visible);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});
	}
);
