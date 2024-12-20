/* global QUnit, sinon */

sap.ui.define([
	"sap/f/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"sap/ui/qunit/QUnitUtils"
], function(
	library,
	KeyCodes,
	Card,
	CardActions,
	nextUIUpdate,
	nextCardReadyEvent,
	qutils
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const SemanticRole = library.cards.SemanticRole;

	async function timeout(iDuration) {
		await new Promise(function(resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}

	QUnit.module("Actions", {
		beforeEach: function () {
			this.oCard = new Card({
				semanticRole: SemanticRole.ListItem,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				action: (oEvent) => {
					oEvent.preventDefault();
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("List Card with action on card level", async function (assert) {
		const oActionSpy = sinon.spy(CardActions, "fireAction");

		this.oCard.setManifest({
			"_version": "1.14.0",
			"sap.app": {
				"id": "list.card",
				"type": "card",
				"applicationVersion": {
					"version": "1.0.0"
				}
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"actions": [{
					"type": "Navigation",
					"parameters": {
						"url": "https://sap.com",
						"target": "_blank"
					}
				}],
				"type": "List",
				"data": {
					"json": {
						"items": [
							{"title": "Item 1"},
							{"title": "Item 2"},
							{"title": "Item 3"},
							{"title": "Item 4"}
						]
					}
				},
				"header": {
					"title": "Action on card level",
					"subTitle": "sematicRole - listitem"
				},
				"content": {
					"data": {
						"path": "/items"
					},
					"item": {
						"title": "{title}"
					},
					"maxItems": 4
				},
				"footer": {
					"actionsStrip": [
						{
							"type": "ToolbarSpacer"
						},
						{
							"type": "Link",
							"text": "Agenda",
							"icon": "sap-icon://action",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "{agendaUrl}"
									}
								}
							]
						},
						{
							"text": "Approve",
							"overflowPriority": "High",
							"actions": [
								{
									"type": "Custom",
									"parameters": {
										"method": "approve"
									}
								}
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		//Act
		qutils.triggerMouseEvent(this.oCard.getCardHeader().getFocusDomRef(), "tap");
		assert.ok(oActionSpy.callCount === 1, "Card header is clicked and action event is fired");
		assert.strictEqual(oActionSpy.args[0][0].source, this.oCard, "Card is the source of the event");

		qutils.triggerKeydown(this.oCard.getFocusDomRef(), KeyCodes.ENTER);
		assert.ok(oActionSpy.callCount === 2, "Enter is pressed and card action event is fired");
		assert.strictEqual(oActionSpy.args[1][0].source, this.oCard, "Card is the source of the event");

		const oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];

		//Act
		qutils.triggerMouseEvent(oListItem.getFocusDomRef(), "tap");
		await timeout();

		assert.ok(oActionSpy.callCount === 2, "List item is clicked and action event is not fired");

		oActionSpy.restore();
	});

	QUnit.test("List Card with action on card and List Item", async function (assert) {
		const oActionSpy = sinon.spy(CardActions, "fireAction");

		this.oCard.setManifest({
			"_version": "1.14.0",
			"sap.app": {
				"id": "list.card",
				"type": "card",
				"applicationVersion": {
					"version": "1.0.0"
				}
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"actions": [{
					"type": "Navigation",
					"parameters": {
						"url": "https://sap.com",
						"target": "_blank"
					}
				}],
				"type": "List",
				"data": {
					"json": {
						"items": [
							{"title": "Item 1"},
							{"title": "Item 2"},
							{"title": "Item 3"},
							{"title": "Item 4"}
						]
					}
				},
				"header": {
					"title": "Card and List Item Actions",
					"subTitle": "sematicRole - listitem"
				},
				"content": {
					"data": {
						"path": "/items"
					},
					"item": {
						"title": "{title}",
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"url": "https://sap.com",
									"target": "_blank"
								}
							}
						]
					},
					"maxItems": 4
				},
				"footer": {
					"actionsStrip": [
						{
							"type": "ToolbarSpacer"
						},
						{
							"type": "Link",
							"text": "Agenda",
							"icon": "sap-icon://action",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "{agendaUrl}"
									}
								}
							]
						},
						{
							"text": "Approve",
							"overflowPriority": "High",
							"actions": [
								{
									"type": "Custom",
									"parameters": {
										"method": "approve"
									}
								}
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		//Act
		qutils.triggerMouseEvent(this.oCard.getCardHeader().getFocusDomRef(), "tap");
		assert.ok(oActionSpy.callCount === 1, "Card header is clicked and action event is fired");
		assert.strictEqual(oActionSpy.args[0][0].source, this.oCard, "Card is the source of the event");

		const oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];

		//Act
		qutils.triggerMouseEvent(oListItem.getFocusDomRef(), "tap");
		await timeout();

		assert.ok(oActionSpy.callCount === 2, "List item is clicked and action event is fired");
		assert.strictEqual(oActionSpy.args[1][0].source, oListItem, "List Item is the source of the event");

		oActionSpy.restore();
	});

	QUnit.test("List Card with action on card and header", async function (assert) {
		const oActionSpy = sinon.spy(CardActions, "fireAction");

		this.oCard.setManifest({
			"_version": "1.14.0",
			"sap.app": {
				"id": "list.card",
				"type": "card",
				"applicationVersion": {
					"version": "1.0.0"
				}
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"actions": [{
					"type": "Navigation",
					"parameters": {
						"url": "https://sap.com",
						"target": "_blank"
					}
				}],
				"type": "List",
				"data": {
					"json": {
						"items": [
							{"title": "Item 1"},
							{"title": "Item 2"},
							{"title": "Item 3"},
							{"title": "Item 4"}
						]
					}
				},
				"header": {
					"actions": [{
						"type": "Navigation",
						"parameters": {
							"url": "https://sap.com",
							"target": "_blank"
						}
					}],
					"title": "Action on card level and header level",
					"subTitle": "sematicRole - listitem"
				},
				"content": {
					"data": {
						"path": "/items"
					},
					"item": {
						"title": "{title}"
					},
					"maxItems": 4
				},
				"footer": {
					"actionsStrip": [
						{
							"type": "ToolbarSpacer"
						},
						{
							"type": "Link",
							"text": "Agenda",
							"icon": "sap-icon://action",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "{agendaUrl}"
									}
								}
							]
						},
						{
							"text": "Approve",
							"overflowPriority": "High",
							"actions": [
								{
									"type": "Custom",
									"parameters": {
										"method": "approve"
									}
								}
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		//Act
		qutils.triggerMouseEvent(this.oCard.getCardHeader().getFocusDomRef(), "tap");
		assert.ok(oActionSpy.callCount === 1, "Card header is clicked and action event is fired");
		assert.strictEqual(oActionSpy.args[0][0].source, this.oCard.getCardHeader(), "Header is the source of the event");

		qutils.triggerKeydown(this.oCard.getCardHeader().getFocusDomRef(), KeyCodes.ENTER);
		assert.ok(oActionSpy.callCount === 2, "Enter is pressed and action event is fired");
		assert.strictEqual(oActionSpy.args[1][0].source, this.oCard.getCardHeader(), "Header is the source of the event");

		const oFooter = this.oCard.getCardFooter();

		//Act
		qutils.triggerMouseEvent(oFooter.getDomRef(), "tap");

		assert.ok(oActionSpy.callCount === 3, "Footer is clicked and action event is fired");
		assert.strictEqual(oActionSpy.args[2][0].source, this.oCard, "Card is the source of the event");

		oActionSpy.restore();
	});

	QUnit.test("Object Card with action on card", async function (assert) {
		const oActionSpy = sinon.spy(CardActions, "fireAction");

		this.oCard.setManifest({
			"_version": "1.14.0",
			"sap.app": {
				"id": "list.card",
				"type": "card",
				"applicationVersion": {
					"version": "1.0.0"
				}
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"actions": [{
					"type": "Navigation",
					"parameters": {
						"url": "https://sap.com",
						"target": "_blank"
					}
				}],
				"type": "Object",
				"data": {
					"json": {
						"firstName": "Donna",
						"lastName": "Moore",
						"position": "Sales Executive",
						"phone": "+1 202 555 5555",
						"email": "my@mymail.com",
						"phoneTooltip": "Make a call",
						"emailTooltip": "Write an e-mail",
						"agendaTooltip": "Open a calendar",
						"photo": "./DonnaMoore.png",
						"agendaUrl": "/agenda",
						"manager": {
							"firstName": "Alain",
							"lastName": "Chevalier",
							"photo": "./AlainChevalier.png"
						},
						"company": {
							"name": "Robert Brown Entertainment",
							"address": "481 West Street, Anytown OH 45066, USA",
							"email": "mail@mycompany.com",
							"emailTooltip": "Write an e-mail",
							"websiteTooltip": "Visit website",
							"emailSubject": "Subject",
							"website": "www.company_a.example.com",
							"url": "https://www.company_a.example.com"
						},
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
						"src": "{photo}"
					},
					"title": "Action on card level",
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
									"id": "name",
									"label": "Name",
									"type": "Input",
									"placeholder": "Name"
								},
								{
									"id": "reason",
									"label": "Reason",
									"type": "ComboBox",
									"placeholder": "Select",
									"item": {
										"path": "/reasons",
										"template": {
											"key": "{id}",
											"title": "{title}"
										}
									}
								},
								{
									"label": "Phone",
									"value": "{phone}",
									"tooltip":  "{phoneTooltip}",
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
									"tooltip":  "{emailTooltip}",
									"actions": [
										{
											"type": "Navigation",
											"parameters": {
												"url": "mailto:{email}"
											}
										}
									]
								},
								{
									"label": "Agenda",
									"value": "Book a meeting",
									"tooltip":  "{agendaTooltip}",
									"actions": [
										{
											"type": "Navigation",
											"enabled": "{= ${agendaUrl}}",
											"parameters": {
												"url": "{agendaUrl}"
											}
										}
									]
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
									"tooltip":  "{company/emailTooltip}",
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
									"label": "Website",
									"value": "{company/website}",
									"tooltip": "{company/websiteTooltip}",
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
									"label": "Rating",
									"type": "RatingIndicator",
									"value": 3.5
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
						}
					]
				},
				"footer": {
					"actionsStrip": [
						{
							"type": "ToolbarSpacer"
						},
						{
							"type": "Link",
							"text": "Agenda",
							"icon": "sap-icon://action",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "{agendaUrl}"
									}
								}
							]
						},
						{
							"text": "Approve",
							"overflowPriority": "High",
							"actions": [
								{
									"type": "Custom",
									"parameters": {
										"method": "approve"
									}
								}
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oContent = this.oCard.getCardContent();

		//Act
		qutils.triggerMouseEvent(oContent.getDomRef(), "tap");
		assert.ok(oActionSpy.callCount === 1, "Card content is clicked and action event is fired");
		assert.strictEqual(oActionSpy.args[0][0].source, this.oCard, "Card is the source of the event");

		oActionSpy.restore();
	});

	QUnit.test("Object Card with action on card and content", async function (assert) {
		const oActionSpy = sinon.spy(CardActions, "fireAction");

		this.oCard.setManifest({
			"_version": "1.14.0",
			"sap.app": {
				"id": "list.card",
				"type": "card",
				"applicationVersion": {
					"version": "1.0.0"
				}
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://list"
				}
			},
			"sap.card": {
				"actions": [{
					"type": "Navigation",
					"parameters": {
						"url": "https://sap.com",
						"target": "_blank"
					}
				}],
				"type": "Object",
				"data": {
					"json": {
						"firstName": "Donna",
						"lastName": "Moore",
						"position": "Sales Executive",
						"phone": "+1 202 555 5555",
						"email": "my@mymail.com",
						"phoneTooltip": "Make a call",
						"emailTooltip": "Write an e-mail",
						"agendaTooltip": "Open a calendar",
						"photo": "./DonnaMoore.png",
						"agendaUrl": "/agenda",
						"manager": {
							"firstName": "Alain",
							"lastName": "Chevalier",
							"photo": "./AlainChevalier.png"
						},
						"company": {
							"name": "Robert Brown Entertainment",
							"address": "481 West Street, Anytown OH 45066, USA",
							"email": "mail@mycompany.com",
							"emailTooltip": "Write an e-mail",
							"websiteTooltip": "Visit website",
							"emailSubject": "Subject",
							"website": "www.company_a.example.com",
							"url": "https://www.company_a.example.com"
						},
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
						"src": "{photo}"
					},
					"title": "Action on card and content levels",
					"subTitle": "{position}"
				},
				"content": {
					"actions": [{
						"type": "Navigation",
						"parameters": {
							"url": "https://sap.com",
							"target": "_blank"
						}
					}],
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
									"id": "name",
									"label": "Name",
									"type": "Input",
									"placeholder": "Name"
								},
								{
									"id": "reason",
									"label": "Reason",
									"type": "ComboBox",
									"placeholder": "Select",
									"item": {
										"path": "/reasons",
										"template": {
											"key": "{id}",
											"title": "{title}"
										}
									}
								},
								{
									"label": "Phone",
									"value": "{phone}",
									"tooltip":  "{phoneTooltip}",
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
									"tooltip":  "{emailTooltip}",
									"actions": [
										{
											"type": "Navigation",
											"parameters": {
												"url": "mailto:{email}"
											}
										}
									]
								},
								{
									"label": "Agenda",
									"value": "Book a meeting",
									"tooltip":  "{agendaTooltip}",
									"actions": [
										{
											"type": "Navigation",
											"enabled": "{= ${agendaUrl}}",
											"parameters": {
												"url": "{agendaUrl}"
											}
										}
									]
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
									"tooltip":  "{company/emailTooltip}",
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
									"label": "Website",
									"value": "{company/website}",
									"tooltip": "{company/websiteTooltip}",
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
									"label": "Rating",
									"type": "RatingIndicator",
									"value": 3.5
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
						}
					]
				},
				"footer": {
					"actionsStrip": [
						{
							"type": "ToolbarSpacer"
						},
						{
							"type": "Link",
							"text": "Agenda",
							"icon": "sap-icon://action",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "{agendaUrl}"
									}
								}
							]
						},
						{
							"text": "Approve",
							"overflowPriority": "High",
							"actions": [
								{
									"type": "Custom",
									"parameters": {
										"method": "approve"
									}
								}
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oContent = this.oCard.getCardContent();

		//Act
		qutils.triggerMouseEvent(oContent.getDomRef(), "tap");
		assert.ok(oActionSpy.callCount === 1, "Card content is clicked and action event is fired");
		assert.strictEqual(oActionSpy.args[0][0].source, oContent, "Content is the source of the event");

		oActionSpy.restore();
	});
});
