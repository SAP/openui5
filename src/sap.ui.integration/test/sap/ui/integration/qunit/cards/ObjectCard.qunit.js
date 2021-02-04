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

	// shortcut for sap.m.AvatarSize
	var AvatarSize = mLibrary.AvatarSize;
	var AvatarColor = mLibrary.AvatarColor;

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifest_ObjectCard = {
		"sap.app": {
			"id": "test.cards.object.card1",
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
					"photo": "images/Woman_avatar_01.png",
					"manager": {
						"firstName": "John",
						"lastName": "Miller",
						"photo": "images/Woman_avatar_01.png"
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
				"groups": [{
						"title": "Contact Details",
						"items": [{
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
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "tel:{phone}"
										}
									}
								]
							},
							{
								"label": "Email",
								"value": "{email}",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "mailto:{email}"
										}
									}
								]
							}
						]
					},
					{
						"title": "Organizational Details",
						"items": [{
							"label": "Direct Manager",
							"value": "{manager/firstName} {manager/lastName}",
							"icon": {
								"src": "{manager/photo}"
							}
						}]
					},
					{
						"title": "Company Details",
						"items": [{
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
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "mailto:{company/email}?subject={company/emailSubject}"
										}
									}
								]
							},
							{
								"label": "Alt Email",
								"value": "newmail@example.com",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "mailto:newmail@example.com?subject=Mail Subject"
										}
									}
								]
							},
							{
								"label": "Website",
								"value": "{company/website}",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "{company/url}"
										}
									}
								]
							}
						]
					}
				]
			}
		}
	};

	var oManifest_ObjectCard_Visible = {
		"sap.app": {
			"id": "test.cards.object.card2",
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
					"photo": "images/Woman_avatar_01.png",
					"manager": {
						"firstName": "John",
						"lastName": "Miller",
						"photo": "images/Woman_avatar_02.png"
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
				"groups": [{
						"visible": "{visible}",
						"title": "Contact Details",
						"items": [{
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
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "tel:{phone}"
										}
									}
								]
							},
							{
								"label": "Email",
								"value": "{email}",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "mailto:{email}"
										}
									}
								]
							}
						]
					},
					{
						"title": "Company Details",
						"items": [{
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
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "mailto:{company/email}?subject={company/emailSubject}"
										}
									}
								]
							},
							{
								"label": "Alt Email",
								"value": "newmail@mail.com",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "mailto:newmail@mail.com?subject=Mail Subject"
										}
									}
								]
							},
							{
								"label": "Website",
								"value": "{company/website}",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "{company/url}"
										}
									}
								]
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
			assert.equal(oHeader.getIconSrc(), "test-resources/sap/ui/integration/qunit/testResources/images/Woman_avatar_01.png", "Should have correct header icon source.");

			// Group 1 assertions
			assert.equal(aGroups[0].getItems().length, 9, "Should have 9 items.");
			assert.equal(aGroups[0].getItems()[0].getText(), oManifestContent.groups[0].title, "Should have correct group title.");
			assert.equal(aGroups[0].getItems()[1].getText(), oManifestContent.groups[0].items[0].label + ":", "Should have correct item label.");
			assert.equal(aGroups[0].getItems()[2].getText(), oData.firstName, "Should have correct item value.");
			assert.equal(aGroups[0].getItems()[3].getText(), oManifestContent.groups[0].items[1].label + ":", "Should have correct item label.");
			assert.equal(aGroups[0].getItems()[4].getText(), oData.lastName, "Should have correct item value.");
			assert.equal(aGroups[0].getItems()[5].getText(), oManifestContent.groups[0].items[2].label + ":", "Should have correct item label.");
			assert.equal(aGroups[0].getItems()[6].getText(), oData.phone, "Should have correct item value.");

			// Group 2 assertions
			assert.equal(aGroups[1].getItems().length, 2, "Should have 2 items.");
			assert.equal(aGroups[1].getItems()[0].getText(), oManifestContent.groups[1].title, "Should have correct group title.");
			assert.equal(aGroups[1].getItems()[1].getItems()[0].getSrc(), "test-resources/sap/ui/integration/qunit/testResources/images/Woman_avatar_01.png", "Should have correct image source.");
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
			assert.equal(aGroups[2].getItems()[8].getText(), "newmail@example.com", "Should have correct item value.");
			assert.equal(aGroups[2].getItems()[10].getText(), oData.company.website, "Should have correct item value.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_ObjectCard);
	});

	QUnit.test("Spacing between groups are correctly calculated", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oObjectContent = this.getAggregation("_content");
			var oContent = oObjectContent.getAggregation("_content");
			var oEvent = {
				size: {
					width: 400
				},
				oldSize: {
					width: 0
				},
				control: oContent
			};

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
	});

	QUnit.test("Visible property of items - determined by binding", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
				"sap.app": {
					"id": "test.cards.object.visibleItemsWithBinding",
					"type": "card"
				},
				"sap.card": {
					"type": "Object",
					"data": {
						"json": {
							"visible": false
						}
					},
					"content": {
						"groups": [{
								"title": "Contact Details",
								"items": [{
										"label": "First Name",
										"value": "{firstName}",
										"actions": [
											{
												"type": "Navigation",
												"parameters": {
													"url": "example.com"
												}
											}
										],
										"visible": "{visible}"
									},
									{
										"label": "Email",
										"value": "{email}",
										"visible": "{visible}"
									}
								]
							}
						]
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oLayout = oContent.getAggregation("_content"),
				aGroupItems = oLayout.getContent()[0].getItems();

			Core.applyChanges();

			// Assert
			assert.notOk(aGroupItems[1].getVisible(), "Label for link is NOT visible");
			assert.notOk(aGroupItems[2].getVisible(), "Link is also NOT visible");
			assert.notOk(aGroupItems[3].getVisible(), "Label for text is NOT visible");
			assert.notOk(aGroupItems[4].getVisible(), "Text is also NOT visible");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.test("Visible property of items - determined by binding with parameters", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
				"sap.app": {
					"id": "test.cards.object.visibleItemsWithParameters",
					"type": "card"
				},
				"sap.card": {
					"type": "Object",
					"configuration": {
						"parameters": {
							"group1Visible": {
								"value": "false"
							},
							"group2Visible": {
								"value": "truthy value"
							},
							"groupItem1Visible": {
								"value": ""
							},
							"groupItem2Visible": {
								"value": "null"
							},
							"groupItem3Visible": {
								"value": "undefined"
							}
						}
					},
					"content": {
						"groups": [
							{
								"title": "Title",
								"visible": "{{parameters.group1Visible}}",
								"items": [
									{
										"label": "Label",
										"value": "Value"
									}
								]
							},
							{
								"visible": "{{parameters.group2Visible}}",
								"items": [
									{
										"label": "Label",
										"value": "Value",
										"visible": "{{parameters.groupItem1Visible}}"
									},
									{
										"label": "Label",
										"value": "Value",
										"visible": "{{parameters.groupItem2Visible}}"
									},
									{
										"label": "Label",
										"value": "Value",
										"visible": "{{parameters.groupItem3Visible}}"
									}
								]
							}
						]
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				aGroups = oContent.getAggregation("_content").getContent(),
				oFirstGroup = aGroups[0],
				oSecondGroup = aGroups[1];

			Core.applyChanges();

			// Assert
			assert.strictEqual(oFirstGroup.getVisible(), false, "Group is not visible");
			assert.strictEqual(oSecondGroup.getVisible(), true, "Group is visible");
			oSecondGroup.getItems().forEach(function (oGroupItem) {
				assert.strictEqual(oGroupItem.getVisible(), false, "Group item is not visible");
			});

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
		Core.applyChanges();
	});

	QUnit.test("Icon property", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oAvatar = oContent.getAggregation("_content").getContent()[0].getItems()[1].getItems()[0];

			assert.ok(oAvatar.hasStyleClass("sapFCardIcon"), "'sapFCardIcon' class is added");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"src": "sap-icon://error"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Icon default size should be 'XS'", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oAvatar = oContent.getAggregation("_content").getContent()[0].getItems()[1].getItems()[0];

			assert.strictEqual(oAvatar.getDisplaySize(), AvatarSize.XS, "Avatar default size is 'XS'");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"src": "sap-icon://error"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Icon allows to set custom 'size'", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oAvatar = oContent.getAggregation("_content").getContent()[0].getItems()[1].getItems()[0];

			assert.strictEqual(oAvatar.getDisplaySize(), AvatarSize.M, "'size' from the manifest is applied");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"src": "sap-icon://error",
								"size": "M"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("'backgroundColor' of icon with src", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oAvatar = oContent.getAggregation("_content").getContent()[0].getItems()[1].getItems()[0];

			// Assert
			assert.strictEqual(oAvatar.getBackgroundColor(), AvatarColor.Transparent, "Background should be 'Transparent' when there is only icon.");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"src": "sap-icon://error"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("'backgroundColor' of icon with initials", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oAvatar = oContent.getAggregation("_content").getContent()[0].getItems()[1].getItems()[0],
				sExpected = oAvatar.getMetadata().getPropertyDefaults().backgroundColor;

			// Assert
			assert.strictEqual(oAvatar.getBackgroundColor(), sExpected, "Background should have default value when there are initials.");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"text": "AC"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Group title is not rendered when missing from manifest", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				bHasTitle = !!oContent.$().find(".sapFCardObjectItemTitle").length;

			assert.strictEqual(bHasTitle, false, "group title is not rendered");
			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.noGroupTitle"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"label": "Label",
							"value": "Value"
						}]
					}]
				}
			}
		});
		Core.applyChanges();

	});

});