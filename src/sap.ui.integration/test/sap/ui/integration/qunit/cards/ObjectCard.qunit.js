/* global QUnit, sinon */

sap.ui.define([
	"sap/base/Log",
	"sap/m/library",
	"sap/ui/integration/library",
	"sap/ui/integration/cards/ObjectContent",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/qunit/utils/MemoryLeakCheck"
], function (
	Log,
	mLibrary,
	library,
	ObjectContent,
	Card,
	Core,
	CardActions,
	MemoryLeakCheck
) {
	"use strict";

	// shortcut for sap.m.AvatarSize
	var AvatarSize = mLibrary.AvatarSize;
	var AvatarColor = mLibrary.AvatarColor;
	var CardActionType = library.CardActionType;

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
					},
					"team": [
						{
							"name": "SD"
						},
						{
							"name": "GF"
						}
					]
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
							},
							{
								"visible": "{visible}",
								"type": "NumericData",
								"mainIndicator": {
									"number": "35",
									"unit": "h",
									"state": "Error",
									"size": "S"
								},
								"sideIndicators": [
									{
										"title": "Target",
										"number": "100",
										"unit": "K"
									},
									{
										"title": "Deviation",
										"number": "34.7",
										"unit": "%"
									}
								],
								"details": "Project Nanga Prabat (Ingo) 0 hours recorded."
							},
							{
								"visible": "{visible}",
								"label": "Team",
								"type": "IconGroup",
								"path": "team",
								"template": {
									"icon": {
										"text": "{/name}"
									}
								}
							}
						]
					}
				]
			}
		}
	};

	var oManifest_ComplexLayout = {
		"sap.app": {
			"id": "test.cards.object.card3",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"content": {
				"groups": [
					{
						"alignment": "Stretch",
						"items": [
							{
								"type": "NumericData",
								"mainIndicator": {
									"number": "35",
									"unit": "h",
									"state": "Error",
									"size": "S"
								},
								"sideIndicators": [
									{
										"title": "Target",
										"number": "100",
										"unit": "K"
									},
									{
										"title": "Deviation",
										"number": "34.7",
										"unit": "%"
									}
								],
								"details": "Project Nanga Prabat (Ingo) 0 hours recorded."
							}
						]
					},
					{
						"title": "Group",
						"items": [
							{
								"label": "Project",
								"value": "Nanga Prabat"
							}
						]
					},
					{
						"title": "Group",
						"items": [
							{
								"label": "Recorded Hours",
								"value": "0.00h"
							}
						]
					},
					{
						"alignment": "Stretch",
						"items": [
							{
								"value": "Establish the new central entry point experience with relevant content for the user to appear on the landing page.",
								"maxLines": 3,
								"state": "Error",
								"type": "Status"
							}
						]
					},
					{
						"title": "Group",
						"items": [
							{
								"label": "Project",
								"value": "Nanga Prabat"
							}
						]
					},
					{
						"title": "Group",
						"items": [
							{
								"label": "Recorded Hours",
								"value": "0.00h"
							}
						]
					}
				]
			}
		}
	};

	var oManifest_EmptyLabelWithBinding = {
		"sap.app": {
			"id": "test.cards.object.card4",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"data": {
				"json": {
					"isManager": false,
					"firstName": "Alain",
					"lastName": "Chevalier"
				}
			},
			"content": {
				"groups": [
					{
						"items": [
							{
								"label": "{= ${isManager} ? 'Manager' : ''}",
								"value": "{firstName} {lastName}",
								"icon": {
									"src": "sap-icon://account"
								}
							}
						]
					}
				]
			}
		}
	};

	var oManifest_ObjectCardFormElements = {
		"sap.app": {
			"id": "test.cards.object.card5",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"data": {
				"json": {
					"initialSelection": "reason1",
					"initialComment": "Free text comment",
					"reasons": [
						{
							"id": "reason1",
							"title": "Reason 1"
						},
						{
							"id": "reason2",
							"title": "Reason 2"
						}
					]
				}
			},
			"header": {
				"icon": {
					"src": "sap-icon://product"
				},
				"title": "PR255 - MacBook Purchase",
				"subTitle": "Procurement Purchase Requisition"
			},
			"content": {
				"groups": [
					{
						"alignment": "Stretch",
						"items": [
							{
								"id": "reason",
								"label": "Reason",
								"type": "ComboBox",
								"placeholder": "Select",
								"selectedKey": "{/initialSelection}",
								"item": {
									"path": "/reasons",
									"template": {
										"key": "{id}",
										"title": "{title}"
									}
								}
							},
							{
								"id": "comment",
								"label": "Comment",
								"type": "TextArea",
								"value": "{/initialComment}",
								"rows": 4,
								"placeholder": "Comment"
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
			var aGroups = oContent.getItems()[0].getContent();
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
			assert.equal(aGroups[0].getItems()[6].getItems()[0].getText(), oData.phone, "Should have correct item value.");

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
			assert.equal(aGroups[2].getItems()[6].getItems()[0].getText(), oData.company.email, "Should have correct item value.");
			assert.equal(aGroups[2].getItems()[8].getItems()[0].getText(), "newmail@example.com", "Should have correct item value.");
			assert.equal(aGroups[2].getItems()[10].getItems()[0].getText(), oData.company.website, "Should have correct item value.");

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
			var oRoot = oObjectContent.getAggregation("_content");
			var oLayout = oRoot.getItems()[0];
			var oEvent = {
				size: {
					width: 400
				},
				oldSize: {
					width: 0
				},
				control: oRoot
			};

			Core.applyChanges();

			//This is the case when 2 groups are in one column and the last group is on another row
			oObjectContent._onResize(oEvent);
			assert.ok(oLayout.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The first group should have the separation class");
			assert.ok(!oLayout.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The second group should not have the separation class");
			assert.ok(oLayout.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The last group should have the separation class");

			//This is the case when all groups are in one column
			oEvent.size.width = 200;
			oObjectContent._onResize(oEvent);
			assert.ok(!oLayout.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
			assert.ok(!oLayout.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
			assert.ok(!oLayout.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");

			//This is the case when all groups are in one row
			oEvent.size.width = 800;
			oObjectContent._onResize(oEvent);
			assert.ok(oLayout.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should have the separation class");
			assert.ok(oLayout.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should have the separation class");
			assert.ok(!oLayout.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");

			done();
		});

		// Act
		this.oCard.setManifest(oManifest_ObjectCard);
	});

	QUnit.test("Spacing around groups when the last group is 'stretched'", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oObjectContent = this.getAggregation("_content");
			var oRoot = oObjectContent.getAggregation("_content");
			var aItems = oRoot.getItems();
			var oEvent = {
				size: {
					width: 400
				},
				oldSize: {
					width: 0
				},
				control: oRoot
			};

			// Act
			Core.applyChanges();
			oObjectContent._onResize(oEvent);

			// Assert
			assert.strictEqual(oRoot.$().find(".sapFCardObjectGroupLastInColumn").length, 1, "There should be one group marked as last");
			assert.ok(aItems[aItems.length - 1].hasStyleClass("sapFCardObjectGroupLastInColumn"), "The last group should have the 'sapFCardObjectGroupLastInColumn' class");

			done();
		});

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.card3",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [
						{
							"items": [
								{
									"label": "Project",
									"value": "Nanga Prabat"
								}
							]
						},
						{
							"alignment": "Stretch",
							"items": [
								{
									"label": "Project",
									"value": "Nanga Prabat"
								}
							]
						}
					]
				}
			}
		});
	});

	QUnit.test("Visible property", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
				aTestItems = oLayout.getContent()[1].getItems();

			Core.applyChanges();

			assert.ok(oLayout.getDomRef().children[0].classList.contains("sapFCardInvisibleContent"), "Group is hidden");
			assert.notOk(oLayout.getDomRef().children[1].classList.contains("sapFCardInvisibleContent"), "Group should be visible");

			assert.notOk(aTestItems[1].getVisible(), "The group item should not be visible");
			assert.notOk(aTestItems[2].getVisible(), "The group item should not be visible");
			assert.ok(aTestItems[3].getVisible(), "The group item should be visible");
			assert.ok(aTestItems[4].getVisible(), "The group item should be visible");
			assert.ok(aTestItems[5].getVisible(), "The numeric data group item should not be visible");
			assert.ok(aTestItems[6].getVisible(), "The icon group group item should not be visible");
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
			var oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
				aGroupItems = oLayout.getContent()[0].getItems();

			Core.applyChanges();

			// Assert
			assert.notOk(aGroupItems[1].getVisible(), "Label for link is NOT visible");
			assert.notOk(aGroupItems[2].getItems()[0].getVisible(), "Link is also NOT visible");
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
			var oContent = this.oCard.getCardContent(),
				aGroups = oContent.getAggregation("_content").getItems()[0].getContent(),
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
	});

	QUnit.test("Icon property", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getCardContent(),
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

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
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

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
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

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
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

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
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0],
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
	});

	QUnit.test("'maxLines' set to text item", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
				oText = oGroup.getItems()[0];

			// Assert
			assert.strictEqual(oText.getMaxLines(), 2, "'maxLines' should be set to the inner text control");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.maxLines"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"value": "my text",
							"maxLines": 2
						}]
					}]
				}
			}
		});
	});

	QUnit.test("'size' of NumericData", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
				oNumericData = oGroup.getItems()[0].getItems()[0];
			Core.applyChanges();

			// Assert
			assert.ok(oNumericData.$().hasClass("sapMTileSmallPhone"), "Class for small size should be added");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.maxLines"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"type": "NumericData",
							"mainIndicator": {
								"number": "35",
								"size": "S"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Avatar group with template", function (assert) {
		// Arrange
		var done = assert.async();
		var oCardData = {
			team: [
				{},
				{},
				{}
			]
		};

		this.oCard.attachEvent("_ready", function () {
			var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
				oAvatarGroup = oGroup.getItems()[1];
			Core.applyChanges();

			// Assert
			assert.strictEqual(oAvatarGroup.getItems().length, oCardData.team.length, "Correct number of items should be created");
			oAvatarGroup.getItems().forEach(function (oItem) {
				assert.ok(oItem.getDomRef(), "Item " + oItem.getId() + " should be rendered");
			});

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.avatarGroup"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": oCardData
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Team",
							"type": "IconGroup",
							"path": "team",
							"template": {
								"icon": {
									"src": "{/iconSrc}",
									"text": "{/name}"
								}
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Properties of item template for avatars are correctly bound", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
				oAvatarGroup = oGroup.getItems()[1],
				oItemTemplate = oAvatarGroup.getBindingInfo("items").template;

			// Assert
			assert.strictEqual(oItemTemplate.getBindingPath("src"), "/iconSrc", "'src' property should be correctly bound");
			assert.strictEqual(oItemTemplate.getBindingPath("initials"), "/name", "'initials' property should be correctly bound");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.avatarGroup"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {}
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Team",
							"type": "IconGroup",
							"path": "team",
							"template": {
								"icon": {
									"src": "{/iconSrc}",
									"text": "{/name}"
								}
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Empty label with binding is not rendered", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
				aItems = oLayout.getContent()[0].getItems(),
				oLabel = aItems[0].getItems()[1].getItems()[0];

			// Assert
			assert.strictEqual(oLabel.getVisible(), false, "The empty label is not visible.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_EmptyLabelWithBinding);
	});

	QUnit.module("Accessibility", {
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

	QUnit.test("Actionable elements should be labeled", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oLayout = this.oCard.getAggregation("_content").getAggregation("_content").getItems()[0],
				oLabel = oLayout.getContent()[0].getItems()[0],
				oLink = oLayout.getContent()[0].getItems()[1].getItems()[0];

			assert.ok(oLink.getAriaLabelledBy().length,"Link should be labeled");
			assert.strictEqual(oLink.getAriaLabelledBy()[0], oLabel.getId(), "Link should be labeled by the correct label");
			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"label": "Label",
							"value": "Value",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "https://sap.com"
									}
								}
							]
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Actionable elements with missing label", function (assert) {
		var done = assert.async(),
			oLogSpy = this.spy(Log, "warning");

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			assert.ok(oLogSpy.calledWithExactly(sinon.match.any, sinon.match.any, "sap.ui.integration.widgets.Card"), "Warning for missing label should be logged");
			done();
		});

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"value": "Value",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "https://sap.com"
									}
								}
							]
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Email, link and phone fields should have tooltip set correctly", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			var oGroup = this.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
				oPhone = oGroup.getItems()[1].getItems()[0],
				oEmail = oGroup.getItems()[3].getItems()[0],
				oLink = oGroup.getItems()[5].getItems()[0];

			assert.strictEqual(oPhone.getDomRef().getAttribute("title"), "Make a call", "The tooltip of the phone is correct");
			assert.strictEqual(oEmail.getDomRef().getAttribute("title"), "Write an e-mail", "The tooltip of the email is correct");
			assert.strictEqual(oLink.getDomRef().getAttribute("title"),  "Visit website", "The tooltip of the link is correct (binding used)");
			done();
		});

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"websiteTooltip": "Visit website",
						"website": "www.company_a.example.com"
					}
				},
				"content": {
					"groups": [{
						"items": [{
								"label": "Phone",
								"value": "+1 202 555 5555",
								"tooltip": "Make a call",
								"actions": [{
									"type": "Navigation",
									"parameters": {
										"url": "tel: +1 202 555 5555"
									}
								}]
							},
							{
								"label": "Email",
								"value": "my@mymail.com",
								"tooltip": "Write an e-mail",
								"actions": [{
									"type": "Navigation",
									"parameters": {
										"url": "mailto: my@mymail.com"
									}
								}]
							},
							{
								"label": "Website",
								"value": "{website}",
								"tooltip": "{websiteTooltip}",
								"actions": [{
									"type": "Navigation",
									"parameters": {
										"url": "www.company_a.example.com"
									}
								}]
							}
						]
					}]
				}
			}
		});
	});

	QUnit.module("Layout", {
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

	QUnit.test("Elements are properly nested", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getCardContent(),
				oRoot = oContent._getRootContainer();

			// Assert
			assert.ok(oRoot.isA("sap.m.VBox"), "Root container is sap.m.VBox");
			assert.strictEqual(oRoot.getItems().length, 4, "Root container has 4 items");
			assert.ok(oRoot.getItems()[1].isA("sap.ui.layout.AlignedFlowLayout"), "AlignedFlowLayout is created");
			assert.strictEqual(oRoot.getItems()[1].getContent().length, 2, "2 items are added in the AlignedFlowLayout");
			done();
		}.bind(this));

		this.oCard.setManifest(oManifest_ComplexLayout);
	});

	QUnit.test("Resize handler is called for AlignedFlowLayout containers", function (assert) {
		var done = assert.async(),
			oResizeSpy = this.spy(ObjectContent.prototype, "_onAlignedFlowLayoutResize");

		this.oCard.attachEvent("_ready", function () {
			// Act
			this.oCard.getCardContent()._onResize({
				size: {
					width: 400
				},
				oldSize: {
					width: 0
				}
			});

			// Assert
			assert.strictEqual(oResizeSpy.callCount, 2, "First AlignedFlowLayout is destroyed");

			done();
		}.bind(this));

		this.oCard.setManifest(oManifest_ComplexLayout);
	});

	MemoryLeakCheck.checkControl("ObjectContent with IconGroup", function () {
		// Arrange
		var oObjectContent = new ObjectContent();
		var oConfig = {
			"groups": [{
				"items": [{
					"label": "Team",
					"type": "IconGroup",
					"path": "team",
					"template": {
						"icon": {
							"src": "{/iconSrc}",
							"text": "{/name}"
						}
					}
				}]
			}]
		};

		sinon.stub(oObjectContent, "getCardInstance").returns({
			getBindingContext: function () {
				return undefined;
			},
			getBindingNamespaces: function () {
				return {};
			},
			isSkeleton: function () {
				return false;
			}
		});

		oObjectContent.setActions(new CardActions());

		// Act
		oObjectContent.setConfiguration(oConfig);

		return oObjectContent;
	});

	QUnit.module("Form elements", {
		beforeEach: function () {
			this.oCard = new Card({
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

	QUnit.test("Elements are properly created", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			var oLayout = oCard.getCardContent().getAggregation("_content").getItems()[0],
				aItems = oLayout.getItems(),
				oComboBox = aItems[1],
				oTextArea = aItems[3];

			// Assert Combo Box
			assert.ok(oComboBox.isA("sap.m.ComboBox"), "ComboBox is created.");
			assert.strictEqual(oComboBox.getPlaceholder(), "Select", "ComboBox has correct placeholder.");
			assert.strictEqual(oComboBox.getSelectedKey(), "reason1", "ComboBox has correct value.");
			assert.strictEqual(oComboBox.getItems().length, 2, "ComboBox has 2 options.");
			assert.strictEqual(oComboBox.getLabels()[0].getText(), "Reason:", "ComboBox is referenced to the correct label.");

			// Assert Text Area
			assert.ok(oTextArea.isA("sap.m.TextArea"), "TextArea is created.");
			assert.strictEqual(oTextArea.getPlaceholder(), "Comment", "TextArea has correct placeholder.");
			assert.strictEqual(oTextArea.getValue(), "Free text comment", "TextArea has correct value.");
			assert.strictEqual(oTextArea.getRows(), 4, "TextArea has 4 rows.");
			assert.strictEqual(oTextArea.getLabels()[0].getText(), "Comment:", "TextArea is referenced to the correct label.");

			done();
		});

		oCard.setManifest(oManifest_ObjectCardFormElements);
		Core.applyChanges();
	});

	QUnit.test("Element values are properly passed on submit action", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachAction(function (oEvent) {
			var mParameters = oEvent.getParameter("parameters"),
				mExpectedData = {
					"reason": {
						"key": "reason1",
						"value": "Reason 1"
					},
					"comment": "Free text comment"
				};

			assert.deepEqual(mParameters.data, mExpectedData, "Data is properly passed to action handler.");
			assert.deepEqual(oCard.getModel("form").getData(), mExpectedData, "Data is properly populated in the form model.");

			done();
		});

		oCard.attachEvent("_ready", function () {
			oCard.triggerAction({
				"type": CardActionType.Submit
			});
		});

		oCard.setManifest(oManifest_ObjectCardFormElements);
		Core.applyChanges();
	});
});