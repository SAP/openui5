/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/events/KeyCodes",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"sap/ui/qunit/QUnitUtils"
], function(
	Library,
	KeyCodes,
	CardActions,
	nextUIUpdate,
	nextCardReadyEvent,
	qutils
) {
	"use strict";

	async function timeout(iDuration) {
		await new Promise(function (resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}

	function setListCardManifest(oCard) {
		oCard.setManifest({
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
							{ "title": "Item 1" },
							{ "title": "Item 2" },
							{ "title": "Item 3" },
							{ "title": "Item 4" }
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
	}

	function runTests() {
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
								{ "title": "Item 1" },
								{ "title": "Item 2" },
								{ "title": "Item 3" },
								{ "title": "Item 4" }
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
								{ "title": "Item 1" },
								{ "title": "Item 2" },
								{ "title": "Item 3" },
								{ "title": "Item 4" }
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
								{ "title": "Item 1" },
								{ "title": "Item 2" },
								{ "title": "Item 3" },
								{ "title": "Item 4" }
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
										"tooltip": "{phoneTooltip}",
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
										"tooltip": "{emailTooltip}",
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
										"tooltip": "{agendaTooltip}",
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
										"tooltip": "{company/emailTooltip}",
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
										"tooltip": "{phoneTooltip}",
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
										"tooltip": "{emailTooltip}",
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
										"tooltip": "{agendaTooltip}",
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
										"tooltip": "{company/emailTooltip}",
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

		QUnit.test("Action on header level is transfered to card level", async function (assert) {
			const oActionSpy = sinon.spy(CardActions, "fireAction");
			const oCard = this.oCard;

			oCard.setManifest({
				"_version": "1.14.0",
				"sap.app": {
					"id": "list.card",
					"type": "card"
				},
				"sap.card": {
					"type": "Object",
					"header": {
						"data": {
							"request": {
								"url": "./headerData.json"
							}
						},
						"actions": [
							{
								"type": "Navigation",
								"enabled": "{enabled}",
								"parameters": {
									"url": "{url}"
								}
							}
						],
						"title": "Action on header transfered to card"
					},
					"content": {
						"groups": [
							{
								"title": "Group 1",
								"items": []
							}
						]
					}
				}
			});

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			//Act - Header is clickable and not focusable
			const oHeader = oCard.getCardHeader();
			qutils.triggerMouseEvent(oHeader.getFocusDomRef(), "tap");

			// Assert
			assert.strictEqual(oActionSpy.callCount, 1, "Card header is clicked and action event is fired");
			assert.strictEqual(oActionSpy.args[0][0].source, oHeader, "Header is the source of the event");
			assert.strictEqual(oHeader.getFocusDomRef().getAttribute("tabindex"), null, "Header is not focusable");

			// Act - Card is not clickable
			oActionSpy.reset();
			const oCardFocusRef = oCard.getFocusDomRef();
			qutils.triggerMouseEvent(oCardFocusRef, "tap");

			// Assert
			assert.strictEqual(oActionSpy.callCount, 0, "Card can not be clicked");
			assert.ok(oCard.getDomRef().classList.contains("sapFCardDisableMouseInteraction"), "Card has disabled mouse interaction.");

			// Assert - Card has correct acc attributes
			assert.ok(oCardFocusRef.hasAttribute("tabindex"), "Card is focusable");

			const oRb = Library.getResourceBundleFor("sap.f");
			const sDescribedBy = oCardFocusRef.getAttribute("aria-describedby").split(" ")[1];
			assert.strictEqual(document.getElementById(sDescribedBy).innerText, oRb.getText("ARIA_ACTIVATE_CARD"), "Card has the interactive card description");

			// Act - Card can be focused and activated with Enter
			oActionSpy.reset();
			qutils.triggerKeydown(oCardFocusRef, KeyCodes.ENTER);

			// Assert - Card is activated with enter
			assert.strictEqual(oActionSpy.callCount, 1, "Card is activated with ENTER");
			assert.strictEqual(oActionSpy.args[0][0].source, oHeader, "Header is the source of the event, not the card.");

			oActionSpy.restore();
		});

		QUnit.test("Enter event should fire press on keydown", async function (assert) {
			setListCardManifest(this.oCard);
			const pressSpy = this.spy(this.oCard, "firePress");

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();
			const pressHeaderSpy = sinon.spy(this.oCard.getCardHeader(), "firePress");

			// Action
			qutils.triggerKeydown(this.oCard.getDomRef(), KeyCodes.ENTER);

			// Assert
			assert.equal(pressSpy.callCount, 1, "Press event should be fired once on");

			pressSpy.resetHistory();
			pressSpy.reset();

			// Action
			qutils.triggerKeydown(this.oCard.getDomRef(), KeyCodes.ENTER, false, false, true);

			// Assert
			assert.equal(pressSpy.callCount, 0, "Press event was not fired for Ctrl+ENTER");

			pressSpy.resetHistory();
			pressSpy.reset();

			qutils.triggerKeydown(this.oCard.getCardHeader().getFocusDomRef(), KeyCodes.ENTER);

			// Assert
			assert.equal(pressHeaderSpy.callCount, 1, "Press event should be fired once on header");
		});

		QUnit.test("Enter event should not fire press on keyup", async function (assert) {
			setListCardManifest(this.oCard);
			const pressSpy = this.spy(this.oCard, "firePress");

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();
			const pressHeaderSpy = sinon.spy(this.oCard.getCardHeader(), "firePress");

			// Action
			qutils.triggerKeyup(this.oCard.getDomRef(), KeyCodes.ENTER);

			// Assert
			assert.equal(pressSpy.callCount, 0, "Press event should not be fired on card");

			pressSpy.resetHistory();
			pressSpy.reset();

			// Action
			qutils.triggerKeyup(this.oCard.getDomRef(), KeyCodes.ENTER);

			// Assert
			assert.equal(pressHeaderSpy.callCount, 0, "Press event should not be fired on header");
		});

		QUnit.test("Space event should not fire press on keydown", async function (assert) {
			setListCardManifest(this.oCard);
			var pressSpy = this.spy(this.oCard, "firePress");

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();
			const pressHeaderSpy = sinon.spy(this.oCard.getCardHeader(), "firePress");

			// Action
			qutils.triggerKeydown(this.oCard.getDomRef(), KeyCodes.SPACE);

			// Assert
			assert.equal(pressSpy.callCount, 0, "Press event should not be fired on card");


			pressSpy.resetHistory();
			pressSpy.reset();

			// Action
			qutils.triggerKeydown(this.oCard.getCardHeader().getFocusDomRef(), KeyCodes.SPACE);

			// Assert
			assert.equal(pressHeaderSpy.callCount, 0, "Press event should not be fired on");
		});

		QUnit.test("Space event should fire press on keyup", async function (assert) {
			setListCardManifest(this.oCard);
			const pressSpy = this.spy(this.oCard, "firePress");

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const pressHeaderSpy = sinon.spy(this.oCard.getCardHeader(), "firePress");

			// Action
			qutils.triggerKeyup(this.oCard.getDomRef(), KeyCodes.SPACE);

			// Assert
			assert.equal(pressSpy.callCount, 1, "Press event should be fired once on card");


			pressSpy.resetHistory();
			pressSpy.reset();

			// Action
			qutils.triggerKeyup(this.oCard.getCardHeader().getFocusDomRef(), KeyCodes.SPACE);

			// Assert
			assert.equal(pressHeaderSpy.callCount, 1, "Press event should be fired once on header");
		});

		QUnit.test("Space event should not fire press if SHIFT is pressed and released after the Space is released", async function (assert) {
			setListCardManifest(this.oCard);
			const pressSpy = this.spy(this.oCard, "firePress");

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Action
			qutils.triggerKeydown(this.oCard.getDomRef(), KeyCodes.SPACE);
			qutils.triggerKeydown(this.oCard.getDomRef(), KeyCodes.SHIFT);
			qutils.triggerKeyup(this.oCard.getDomRef(), KeyCodes.SPACE);
			qutils.triggerKeyup(this.oCard.getDomRef(), KeyCodes.SHIFT);

			// Assert
			assert.equal(pressSpy.callCount, 0, "Press event should not be fired");
		});

		QUnit.test("Space event should not fire press if ESCAPE is pressed and released after the Space is released", async function (assert) {
			setListCardManifest(this.oCard);
			const pressSpy = this.spy(this.oCard, "firePress");

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Action
			qutils.triggerKeydown(this.oCard.getDomRef(), KeyCodes.SPACE);
			qutils.triggerKeydown(this.oCard.getDomRef(), KeyCodes.ESCAPE);
			qutils.triggerKeyup(this.oCard.getDomRef(), KeyCodes.SPACE);
			qutils.triggerKeyup(this.oCard.getDomRef(), KeyCodes.ESCAPE);

			// Assert
			assert.equal(pressSpy.callCount, 0, "Press event should not be fired");
		});

		QUnit.test("F7 keyboard handling", async function (assert) {
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
								{ "title": "Item 1" },
								{ "title": "Item 2" },
								{ "title": "Item 3" },
								{ "title": "Item 4" }
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
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const oContent = this.oCard.getCardContent(),
				oHeader = this.oCard.getCardHeader(),
				aItems = oContent.getInnerList().getItems(),
				oCardDomRef = this.oCard.getDomRef();

			this.oCard.focus();
			assert.strictEqual(document.activeElement, oCardDomRef);

			qutils.triggerEvent("keydown", oCardDomRef, { code: "F7" });
			assert.strictEqual(oHeader.getFocusDomRef(), document.activeElement, "The header is correctly focused");

			qutils.triggerEvent("keydown", document.activeElement, { code: "F7" });
			assert.strictEqual(this.oCard.getFocusDomRef(), document.activeElement, "The card is focused");

			qutils.triggerEvent("keydown", document.activeElement, { code: "F7" });
			assert.strictEqual(oHeader.getFocusDomRef(), document.activeElement, "The header is correctly focused again");

			aItems[0].focus();
			assert.strictEqual(aItems[0].getDomRef(), document.activeElement, "The first list item is correctly focused");

			qutils.triggerEvent("keydown", document.activeElement, { code: "F7" });
			assert.strictEqual(this.oCard.getFocusDomRef(), document.activeElement, "The card is focused");

			qutils.triggerEvent("keydown", document.activeElement, { code: "F7" });
			assert.strictEqual(aItems[0].getFocusDomRef(), document.activeElement, "The first list item is correctly focused again");

			aItems[1].focus();
			assert.strictEqual(aItems[1].getFocusDomRef(), document.activeElement, "The second list item is correctly focused");

			qutils.triggerEvent("keydown", document.activeElement, { code: "F7" });
			assert.strictEqual(this.oCard.getFocusDomRef(), document.activeElement, "The card is focused");

			qutils.triggerEvent("keydown", document.activeElement, { code: "F7" });
			assert.strictEqual(aItems[1].getFocusDomRef(), document.activeElement, "The second list item is correctly focused again");
		});
	}

	return runTests;
});
