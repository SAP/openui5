/* global QUnit, sinon */

sap.ui.define([
		"../../services/SampleServices",
		"sap/ui/core/Lib",
		"sap/ui/integration/library",
		"sap/ui/integration/widgets/Card",
		"sap/ui/integration/cards/actions/CardActions",
		"sap/ui/integration/cards/actions/NavigationAction",
		"sap/ui/integration/cards/actions/SubmitAction",
		"sap/ui/integration/util/RequestDataProvider",
		"sap/ui/integration/Host",
		"sap/ui/core/Element",
		"sap/base/Log",
		"sap/ui/events/KeyCodes",
		"sap/ui/qunit/QUnitUtils",
		"sap/m/library",
		"sap/ui/qunit/utils/nextUIUpdate",
		"qunit/testResources/nextCardReadyEvent"
],
	function (
		SampleServices,
		Library,
		library,
		Card,
		CardActions,
		NavigationAction,
		SubmitAction,
		RequestDataProvider,
		Host,
		Element,
		Log,
		KeyCodes,
		qutils,
		mLibrary,
		nextUIUpdate,
		nextCardReadyEvent
	) {
		"use strict";

		var CardActionType = library.CardActionType;
		var ListType = mLibrary.ListType;

		var DOM_RENDER_LOCATION = "qunit-fixture",
			LOG_MESSAGE = "Navigate successfully";

		var oManifest_Header_Service = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card1",
				"type": "card"
			},
			"sap.ui5": {
				"services": {
					"Navigation2": {
						"factoryName": "test.service.SampleNavigationFactory"
					}
				}
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card",
					"subTitle": "Card Subtitle",
					"icon": {
						"src": "sap-icon://accept"
					},
					"status": {
						"text": "100 of 200"
					},
					"actions": [{
						"type": "Navigation",
						"service": "Navigation2",
						"parameters": {
							"url": "https://www.sap.com"
						}
					}]
				}
			}
		};

		var oManifest_Header_Url = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card2",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card 2",
					"subTitle": "Card Subtitle",
					"icon": {
						"src": "sap-icon://accept"
					},
					"status": "100 of 200",
					"actions": [{
						"type": "Navigation",
						"parameters": {
							"url": "https://www.sap.com"
						}
					}]
				}
			}
		};

		var oManifest_ListCard_No_Actions = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card4",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card",
					"subTitle": "Card Subtitle"
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						},
						"path": "/"
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						}
					}
				}
			}
		};

		var oManifest_ListCard_Actions_Missing_Type = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card5",
				"type": "card"
			},
			"sap.ui5": {
				"services": {
					"Navigation3": {
						"factoryName": "test.service.SampleNavigationFactory"
					}
				}
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card",
					"subTitle": "Card Subtitle",
					"actions": [{
						"parameters": {
							"url": "https://www.sap.com"
						}
					}]
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						},
						"path": "/"
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						},
						"actions": [{
							"enabled": "{= ${url}}",
							"parameters": {
								"url": "{url}",
								"target": "_blank",
								"somekey": "{someparam}"
							}
						}]
					}
				}
			}
		};

		var oManifest_ListCard_CONTENT_ACTION = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card6",
				"type": "card"
			},
			"sap.ui5": {
				"services": {
					"Navigation3": {
						"factoryName": "test.service.SampleNavigationFactory"
					}
				}
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card",
					"subTitle": "Card Subtitle",
					"icon": {
						"src": "sap-icon://accept"
					},
					"status": {
						"text": "100 of 200"
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						},
						"path": "/"
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						},
						"actions": [{
							"type": "Navigation",
							"enabled": "{= ${url}}",
							"parameters": {
								"url": "{url}",
								"target": "_blank",
								"somekey": "{someparam}"
							}
						}]
					}
				}
			}
		};

		var oManifest_ListCard_Action_Enabled = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card7",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Request list content Card",
					"subTitle": "Card Subtitle"
				},
				"content": {
					"data": {
						"request": {
							"url": "someitems_services_action_enabled.json"
						},
						"path": "/"
					},
					"item": {
						"icon": {
							"src": "{icon}"
						},
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						},
						"actions": [{
							"type": "Navigation",
							"enabled": "{= ${enabled}}",
							"parameters": {
								"url": "{url}",
								"target": "_blank"
							}
						}]
					}
				}
			}
		};

		var oManifest_ListCard_No_Request = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card8",
				"type": "card"
			},
			"sap.ui5": {
				"services": {
					"IntentBasedNavigation": {
						"factoryName": "test.service.SampleNavigationFactory"
					}
				}
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "List Card",
					"subTitle": "With static list items"
				},
				"content": {
					"data": {
						"json": [{
								"Name": "Comfort Easy",
								"Category": "PDA & Organizers",
								"url": "https://www.sap.com"
							},
							{
								"Name": "ITelO Vault",
								"Category": "PDA & Organizers"
							}
						]
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"actions": [{
							"type": "Navigation",
							"enabled": "{= ${url}}",
							"parameters": {
								"url": "{url}"
							}
						}]
					}
				}
			}
		};

		var oManifest_List_Binded_Items = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card9",
				"type": "card"
			},
			"sap.ui5": {
				"services": {
					"IntentBasedNavigation": {
						"factoryName": "test.service.SampleNavigationFactory"
					}
				}
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Sales Orders",
					"subTitle": "Static Data",
					"icon": {
						"src": "sap-icon://sales-order"
					},
					"status": {
						"text": "100 of 200"
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						}
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"actions": [{
							"type": "Navigation",
							"service": "IntentBasedNavigation",
							"parameters": {
								"intentSemanticObject": "SalesOrder",
								"name": "{Name}"
							}
						}]
					}
				}
			}
		};

		var oManifest_List_Hidden_Items = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card10",
				"type": "card"
			},
			"sap.ui5": {
				"services": {
					"IntentBasedNavigation": {
						"factoryName": "test.service.SampleNavigationFactory"
					}
				}
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Sales Orders",
					"subTitle": "Static Data",
					"icon": {
						"src": "sap-icon://sales-order"
					},
					"status": {
						"text": "100 of 200"
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						}
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"actions": [{
							"type": "Navigation",
							"service": "IntentBasedNavigation",
							"parameters": {
								"intentSemanticObject": "SalesOrder",
								"name": "{Name}",
								"hidden": "{url}"
							}
						}]
					}
				}
			}
		};

		var oManifest_List_Broken_Navigation = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card21",
				"type": "card"
			},
			"sap.ui5": {
				"services": {
					"IntentBasedNavigation": {
						"factoryName": "test.service.BrokenNavigationFactory"
					}
				}
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Sales Orders",
					"subTitle": "Static Data",
					"icon": {
						"src": "sap-icon://sales-order"
					},
					"status": {
						"text": "100 of 200"
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						}
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"actions": [{
							"type": "Navigation",
							"service": "IntentBasedNavigation",
							"parameters": {
								"intentSemanticObject": "SalesOrder",
								"name": "{Name}",
								"hidden": "{url}"
							}
						}]
					}
				}
			}
		};

		var objectContent_service = {
			"sap.app": {
				"id": "test.card.actions.card11",
				"type": "card"
			},
			"sap.ui5": {
				"services": {
					"Navigation2": {
						"factoryName": "test.service.SampleNavigationFactory"
					}
				}
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "employee.json"
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
									"value": "{phone}"
								}
							]
						},
						{
							"title": "Organization Details",
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
									"label": "Website",
									"value": "{company/website}",
									"actions": [{
										"type": "Navigation",
										"parameters": {
											"url": "{company/website}"
										}
									}]
								}
							]
						}
					],
					"actions": [{
						"type": "Navigation",
						"enabled": "{= ${url}}",
						"parameters": {
							"url": "{url}",
							"target": "_blank"
						}
					}]
				}
			}
		};

		var objectContentItemDetail_service = {
			"sap.app": {
				"id": "test.card.actions.card11detail",
				"type": "card"
			},
			"sap.ui5": {
				"services": {
					"Navigation2": {
						"factoryName": "test.service.SampleNavigationFactory"
					}
				}
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "employee.json"
					}
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Website",
							"value": "{company/website}",
							"actions": [{
								"type": "Navigation",
								"service": "Navigation2",
								"parameters": {
									"url": "{company/website}"
								}
							}]
						}]
					}]
				}
			}
		};

		var objectContent_url = {
			"sap.app": {
				"id": "test.card.actions.card12",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "employee.json"
					}
				},
				"header": {
					"icon": {
						"src": "{photo}"
					},
					"title": "{firstName} {lastName}",
					"subTitle": "{position}",
					"actions": [{
						"type": "Navigation",
						"parameters": {
							"url": "https://www.sap.com"
						}

					}]
				},
				"content": {
					"groups": [{
							"title": "Contact Details",
							"items": [{
									"label": "Fist Name",
									"value": "{firstName}"
								},
								{
									"label": "Last Name",
									"value": "{lastName}"
								},
								{
									"label": "Phone",
									"value": "{phone}"
								},
								{
									"label": "Agenda",
									"value": "Book a meeting",
									"type": "action",
									"actions": [{
										"type": "Navigation",
										"enabled": "{= ${agendaUrl}}",
										"parameters": {
											"url": "{agendaUrl}"
										}
									}]
								}
							]
						},
						{
							"title": "Organization Details",
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
									"label": "Website",
									"value": "{company/website}",
									"actions": [{
										"type": "Navigation",
										"enabled": false,
										"parameters": {
											"url": "{company/website}"
										}
									}]
								}
							]
						}
					],
					"actions": [{
						"type": "Navigation",
						"parameters": {
							"url": "https://www.sap.com"
						}
					}]
				}
			}
		};

		var oManifestActionSubmit = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "adaptivecard.embedded",
				"type": "card"
			},
			"sap.card": {
				"configuration": {
					"actionHandlers": {
						"submit": {
							"url": "./my-fake.url",
							"method": "POST"
						}
					}
				},
				"type": "AdaptiveCard",
				"content": {
					"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
					"type": "AdaptiveCard",
					"version": "1.0",
					"body": [{
						"type": "TextBlock",
						"size": "medium",
						"weight": "bolder",
						"isSubtle": true,
						"text": "Input.Text elements",
						"horizontalAlignment": "center"
					}]
				}
			}
		};

		var oIntegrationCardManifest = {
			"sap.app": {
				"id": "test.card.actions.card13"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"actions": [{
						"type": "Navigation",
						"parameters": {
							"url": "https://www.sap.com"
						}
					}],
					"title": "Integration Card with action",
					"subTitle": "Card subtitle",
					"icon": {
						"src": "sap-icon://activities"
					},
					"status": {
						"text": "100 of 200"
					}
				},
				"content": {
					"data": {
						"json": [{
								"Name": "Notebook Basic 15",
								"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1000",
								"SubCategoryId": "Notebooks",
								"icon": "sap-icon://laptop",
								"state": "Information",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 17",
								"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1001",
								"SubCategoryId": "Notebooks",
								"icon": "sap-icon://laptop",
								"state": "Success",
								"info": "27.45 EUR",
								"infoState": "Success"

							}
						]
					},
					"item": {
						"icon": {
							"src": "{icon}"
						},
						"title": {
							"value": "{Name}"
						},
						"description": {
							"value": "{Description}"
						},
						"highlight": "{state}",
						"info": {
							"value": "{info}",
							"state": "{infoState}"
						}
					}
				}
			}
		};

		var tableContent_action_on_cell = {
			"sap.app": {
				"type": "card",
				"id": "test.card.actions.card14"
			},
			"sap.card": {
				"type": "Table",
				"header": {
					"title": "Table Card with Top 5 Products",
					"subTitle": "These are the top sellers this month",
					"icon": {
						"src": "sap-icon://sales-order"
					},
					"status": {
						"text": "5 of 100"
					}
				},
				"content": {
					"data": {
						"json": [{
								"Name": "Ergo Screen E-I",
								"Number": "356865544"
							},
							{
								"Name": "Laser Professional Eco",
								"Number": "356865544",
								"ActionUrl": "https://www.sap.com/corporate/en/company/innovation.html"
							}
						]
					},
					"row": {
						"columns": [{
								"title": "Name",
								"value": "{Name}"
							},
							{
								"title": "Number",
								"value": "{Number}",
								"actions": [{
									"type": "Navigation",
									"enabled": "{= ${ActionUrl}}",
									"parameters": {
										"url": "{ActionUrl}"
									}
								}]
							}
						]
					}
				}
			}
		};

		var oManifest_TimelineCard_No_Request = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card.timeline",
				"type": "card"
			},
			"sap.card": {
				"type": "Timeline",
				"header": {
					"title": "Past Activities",
					"subTitle": "For October"
				},
				"content": {
					"maxItems": 3,
					"data": {
						"json": [{
								"Title": "Weekly sync: Marketplace / Design Stream",
								"Description": "MRR WDF18 C3.2(GLASSBOX)",
								"Icon": "sap-icon://appointment-2",
								"Time": "2021-10-25T10:00:00.000Z",
								"Url": "/activity1"
							},
							{
								"Title": "Video Conference for FLP@SF, S4,Hybris",
								"Icon": "sap-icon://my-view",
								"Time": "2021-10-25T14:00:00.000Z",
								"Url": "/activity2"
							},
							{
								"Title": "Call 'Project Nimbus'",
								"Icon": "sap-icon://outgoing-call",
								"Time": "2021-10-25T16:00:00.000Z",
								"Url": "/activity3"
							}
						]
					},
					"item": {
						"dateTime": {
							"value": "{Time}"
						},
						"description": {
							"value": "{Description}"
						},
						"title": {
							"value": "{Title}"
						},
						"icon": {
							"src": "{Icon}"
						},
						"actions": [{
							"type": "Navigation",
							"parameters": {
								"url": "{Url}"
							}
						}]
					}
				}
			}
		};

		var oManifest_ActionsStrip = {
			"sap.app": {
				"id": "card.explorer.footer.manyButtons",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"firstName": "Donna",
						"company": {
							"email": "mail@mycompany.com",
							"emailSubject": "Subject"
						}
					}
				},
				"content": {
					"groups": [{
						"title": "Contact Details",
						"items": [{
							"label": "First Name",
							"value": "{firstName}"
						}]
					}]
				},
				"footer": {
					"actionsStrip": [{
							"text": "Disabled",
							"overflowPriority": "High",
							"actions": [{
								"enabled": false,
								"type": "Custom",
								"parameters": {
									"method": "approve"
								}
							}]
						},
						{
							"buttonType": "Transparent",
							"text": "Enabled: {= !${company/email} }",
							"actions": [{
								"type": "Navigation",
								"enabled": "{= !${company/email} }",
								"parameters": {
									"url": "mailto:{company/email}?subject={company/emailSubject}"
								}
							}]
						}
					]
				}
			}
		};

		async function testNavigationServiceListContent(oManifest, assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();

			// Assert
			assert.strictEqual(oCardListItems[0].getType(), ListType.Active, "Card list item is actionable");
			assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");

			//Act
			oCardListItems[0].firePress();
			await nextUIUpdate();

			// Assert
			assert.ok(oActionSpy.callCount === 1, "Card List Item is clicked");

			// Cleanup
			oStubOpenUrl.restore();
			oActionSpy.restore();
		}

		async function testActionOnContentService(oManifest, assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardLContent = this.oCard.getCardContent();

			this.oCard.attachAction(function (oEvent) {
				oEvent.preventDefault();

				// Assert
				assert.ok(oCardLContent.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
				assert.ok(oActionSpy.callCount === 1, "Card Content is clicked and action event is fired");

				// Cleanup
				oStubOpenUrl.restore();
				oActionSpy.restore();

				done();
			});

			//Act
			oCardLContent.firePress();
		}

		async function testActionOnContentUrl(oManifest, assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardLContent = this.oCard.getCardContent(),
				oCardHeader = this.oCard.getCardHeader();

			// Assert
			assert.ok(oCardLContent.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
			assert.ok(oCardHeader.$().hasClass("sapFCardSectionClickable"), "Card Header is clickable");

			//Act
			oCardLContent.firePress();
			oCardHeader.firePress();

			await nextUIUpdate();

			//Assert
			assert.strictEqual(oActionSpy.callCount, 2, "Card Content and header are clicked and action event is fired twice");

			// Cleanup
			oStubOpenUrl.restore();
			oActionSpy.restore();
		}

		QUnit.module("CardActions API", {
			beforeEach: function () {
				this.oActions = new CardActions();
			},
			afterEach: function () {
				this.oActions.destroy();
			}
		});

		QUnit.test("Resolving binding path with custom bindingPathResolver", function (assert) {
			// Arrange
			var stubResolver = sinon.stub().returns("/custom/resolved/path");
			this.oActions.setBindingPathResolver(stubResolver);
			var oFakeEvent = {
				getSource: function () {
					return {
						getBindingContext: function () {}
					};
				}
			};

			// Act
			var sPath = this.oActions._resolveBindingPath(oFakeEvent);

			// Assert
			assert.strictEqual(sPath, "/custom/resolved/path", "Custom binding path resolver should be used when provided");
			assert.ok(stubResolver.calledWith(oFakeEvent), "Custom binding path resolver should be called with the action event");
		});

		QUnit.test("Unknown action type", function (assert) {
			// Arrange
			var oCard = new Card();
			this.oActions.setCard(oCard);
			var oLogSpy = this.spy(Log, "error");

			// Act
			this.oActions.fireAction({}, "Unknown Type", {});

			// Assert
			assert.ok(
				oLogSpy.calledWith("Unknown action type 'Unknown Type'. Expected one of " + Object.values(CardActionType).join(", "), sinon.match.any, "sap.ui.integration.widgets.Card"),
				"Error should be logged when attempted to fire unknown action"
			);

			// Clean up
			oCard.destroy();
		});

		QUnit.module("Action Enablement - Header", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Service navigation", async function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oLogSpy = sinon.spy(Log, "error");


			// Act
			this.oCard.setManifest(oManifest_Header_Service);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardHeader = this.oCard.getCardHeader();

			assert.ok(oCardHeader.$().hasClass("sapFCardSectionClickable"), "Card Header has a clickable style is added");

			this.oCard.attachAction(function () {
				// Assert
				assert.ok(oLogSpy.calledWith(LOG_MESSAGE), "Provided message should be logged to the console.");
				assert.ok(oActionSpy.callCount, "Card Header is clicked");

				//Clean up
				oLogSpy.restore();
				oActionSpy.restore();
				done();
			});

			//Act
			oCardHeader.firePress();
		});

		QUnit.test("Action URL should navigate", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			// Act
			this.oCard.setManifest(oManifest_Header_Url);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			var oCardHeader = this.oCard.getCardHeader();
			assert.ok(oCardHeader.$().hasClass("sapFCardSectionClickable"), "Card Header has a clickable style is added");

			// Act
			oCardHeader.firePress();
			await nextUIUpdate();

			// Assert
			assert.ok(oActionSpy.callCount, "Card Header is clicked");

			// Clean up
			oStubOpenUrl.restore();
			oActionSpy.restore();
		});

		QUnit.test("Action URL should navigate without parameters", async function (assert) {
			var oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			// Act
			this.oCard.setManifest(oIntegrationCardManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardHeader = this.oCard.getCardHeader();

			//Act
			oCardHeader.firePress();
			await nextUIUpdate();

			// Assert
			assert.strictEqual(oStubOpenUrl.callCount, 1, "Header has navigate to new url");

			//Clean up
			oStubOpenUrl.restore();
		});

		QUnit.test("Enabled property of header action set to 'false'", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction");

			// Act
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.actions.enabledPropertySetToFalse",
					"type": "card"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Card Title",
						"actions": [{
							"enabled": false,
							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com"
							}
						}]
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardHeader = this.oCard.getCardHeader();
			// Assert
			assert.notOk(oCardHeader.$().hasClass("sapFCardSectionClickable"), "Card Header doesn't have a clickable style");

			//Act
			qutils.triggerEvent("tap", oCardHeader);

			// Assert
			assert.ok(oActionSpy.notCalled, "Clicking on the header shouldn't fire action event");

			//Clean up
			oActionSpy.restore();
		});

		QUnit.test("Enabled property of header action set to 'false' with binding", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction");

			// Act
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.actions.enabledPropertySetToFalseWithBinding",
					"type": "card"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": {
							"headerActionEnabled": false
						}
					},
					"header": {
						"title": "Card Title",
						"actions": [{
							"enabled": "{/headerActionEnabled}",
							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com"
							}
						}]
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardHeader = this.oCard.getCardHeader();

			// Assert
			assert.notOk(oCardHeader.$().hasClass("sapFCardSectionClickable"), "Card Header doesn't have a clickable style");

			// Act
			qutils.triggerEvent("tap", oCardHeader);

			// Assert
			assert.ok(oActionSpy.notCalled, "Clicking on the header shouldn't fire action event");

			// Clean up
			oActionSpy.restore();
		});

		QUnit.test("No actions available", async function (assert) {
			var oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			// Act
			this.oCard.setManifest(oManifest_ListCard_No_Actions);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardHeader = this.oCard.getCardHeader();

			// Assert
			assert.notOk(oCardHeader.$().hasClass("sapFCardSectionClickable"), "Card Header has not a clickable style is added");
			assert.ok(oAttachNavigationSpy.callCount === 0, "_attachAction should not be called");

			//Clean up
			oAttachNavigationSpy.restore();
		});

		QUnit.test("No action type available", async function (assert) {
			var oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			// Act
			this.oCard.setManifest(oManifest_ListCard_Actions_Missing_Type);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardHeader = this.oCard.getCardHeader();

			// Assert
			assert.notOk(oCardHeader.hasStyleClass("sapFCardHeaderClickable"), "Card Header has not a clickable style is added");
			assert.ok(oAttachNavigationSpy.callCount === 0, "_attachAction should not be called");

			//Clean up
			oAttachNavigationSpy.restore();
		});

		QUnit.module("Action Enablement - NumericHeader", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Enabled property of numeric header action set to 'false'", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction");

			// Act
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.actions.numeric.enabledPropertySetToFalse",
					"type": "card"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Card Title",
						"type": "Numeric",
						"actions": [{
							"enabled": false,
							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com"
							}
						}]
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardHeader = this.oCard.getCardHeader();
			// Assert
			assert.notOk(oCardHeader.$().hasClass("sapFCardSectionClickable"), "Card Header doesn't have a clickable style");

			//Act
			qutils.triggerEvent("tap", oCardHeader);

			// Assert
			assert.ok(oActionSpy.notCalled, "Clicking on the header shouldn't fire action event");

			//Clean up
			oActionSpy.restore();
		});

		QUnit.test("Enabled property of numeric header action set to 'false' with binding", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction");

			// Act
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.actions.numeric.enabledPropertySetToFalseWithBinding",
					"type": "card"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": {
							"headerActionEnabled": false
						}
					},
					"header": {
						"title": "Card Title",
						"type": "Numeric",
						"actions": [{
							"enabled": "{/headerActionEnabled}",
							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com"
							}
						}]
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardHeader = this.oCard.getCardHeader();

			// Assert
			assert.notOk(oCardHeader.$().hasClass("sapFCardSectionClickable"), "Card Header doesn't have a clickable style");

			// Act
			qutils.triggerEvent("tap", oCardHeader);

			// Assert
			assert.ok(oActionSpy.notCalled, "Clicking on the header shouldn't fire action event");

			// Clean up
			oActionSpy.restore();
		});

		QUnit.module("Navigation Service - List Content", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
			}
		});

		QUnit.test("List should be actionable ", async function (assert) {
			await testNavigationServiceListContent.call(this, oManifest_ListCard_CONTENT_ACTION, assert);
		});

		QUnit.test("Static Data - List should be actionable ", async function (assert) {
			await testNavigationServiceListContent.call(this, oManifest_ListCard_No_Request, assert);
		});

		QUnit.test("Card items with url should be hidden", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_List_Hidden_Items);

			await nextCardReadyEvent(this.oCard);

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();

			//Assert
			assert.ok(oCardListItems.length === 2, "There should be two items");
			assert.notOk(oCardListItems[0].getVisible(), "First items should not be visible");
			assert.ok(oCardListItems[1].getVisible(), "Second item should be visible");
		});

		QUnit.test("Card items should be visible if service does not implement method 'hidden'", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_List_Broken_Navigation);

			await nextCardReadyEvent(this.oCard);

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();

			//Assert
			assert.strictEqual(oCardListItems.length, 2, "All items should be visible if 'hidden' is not implemented.");
		});

		QUnit.test("No service URL in navigation actions", async function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oLogSpy = sinon.spy(Log, "error");

			// Act
			this.oCard.setManifest(oManifest_List_Binded_Items);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();

			this.oCard.attachAction(function () {
				// Assert
				assert.strictEqual(oCardListItems[0].getType(), ListType.Active, "Card list item is actionable");
				assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");
				assert.ok(oLogSpy.calledWith(LOG_MESSAGE), "Provided message should be logged to the console.");
				assert.ok(oActionSpy.callCount, "Card List item is clicked");

				//Clean up
				oLogSpy.restore();
				oActionSpy.restore();

				done();
			});

			//Act
			oCardListItems[0].firePress();
		});

		QUnit.test("Action enabled/disabled in template", async function (assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});


			// Act
			this.oCard.setManifest(oManifest_ListCard_Action_Enabled);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();

			//Act
			oCardListItems[3].firePress();
			await nextUIUpdate();

			// Assert
			assert.strictEqual(oCardListItems[0].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oCardListItems[2].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oCardListItems[3].getType(), ListType.Active, "Card list item is actionable");
			assert.strictEqual(oCardListItems[4].getType(), ListType.Active, "Card list item is actionable");

			assert.ok(oActionSpy.callCount, "Card List item is clicked");

			//Clean up
			oStubOpenUrl.restore();
			oActionSpy.restore();
		});

		QUnit.test("No actions available", async function (assert) {
			// Arrange
			var oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			// Act
			this.oCard.setManifest(oManifest_ListCard_No_Actions);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();
			// Assert
			assert.strictEqual(oCardListItems[0].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oAttachNavigationSpy.callCount, 0, "_attachAction should not be called");

			//Clean up
			oAttachNavigationSpy.restore();
		});

		QUnit.test("No action type available", async function (assert) {
			// Arrange
			var oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			// Act
			this.oCard.setManifest(oManifest_ListCard_Actions_Missing_Type);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();
			// Assert
			assert.strictEqual(oCardListItems[0].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");
			assert.strictEqual(oAttachNavigationSpy.callCount, 0, "_attachAction should not be called");

			//Clean up
			oAttachNavigationSpy.restore();
		});

		QUnit.module("Navigation Action - List Content", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});

			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("List should be actionable ", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			// Act
			this.oCard.setManifest(oManifest_ListCard_No_Request);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oCardListItems = this.oCard.getCardContent()._getList().getItems();

			// Assert
			assert.strictEqual(oCardListItems[0].getType(), ListType.Active, "Card list item is actionable");
			assert.strictEqual(oCardListItems[1].getType(), ListType.Inactive, "Card list item is NOT actionable");

			//Act
			oCardListItems[0].firePress();
			await nextUIUpdate();

			// Assert
			assert.ok(oActionSpy.callCount === 1, "Card List Item is clicked");

			// Cleanup
			oActionSpy.restore();
			oStubOpenUrl.restore();
		});

		QUnit.module("Navigation Action - Object Content", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Object content should be actionable - service", async function (assert) {
			await testActionOnContentService.call(this, objectContent_service, assert);
		});

		QUnit.test("Object content should be actionable - url", async function (assert) {
			await testActionOnContentUrl.call(this, objectContent_url, assert);
		});

		QUnit.test("Using a service for action on link in object content should not throw error", async function (assert) {
			// Act
			this.oCard.setManifest(objectContentItemDetail_service);

			await nextCardReadyEvent(this.oCard);

			// Assert
			assert.ok(true, "Error was not thrown");
		});

		QUnit.test("On pressing link, action should be fired", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Act
			this.oCard.setManifest(objectContent_service);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oObjContent = this.oCard.getCardContent();

			//Act
			var oLink = Element.closestTo(oObjContent.$().find(".sapMLnk")[0]);
			oLink.firePress();

			await nextUIUpdate();

			// Assert
			assert.ok(oObjContent.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
			assert.ok(oActionSpy.callCount === 1, "Link is clicked and action event is not fired");

			// Cleanup
			oActionSpy.restore();
			oStubOpenUrl.restore();
		});

		QUnit.test("Disabled actions should also disable links", async function (assert) {
			// Act
			this.oCard.setManifest(objectContent_url);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent();

			//Act
			var oLink = Element.closestTo(oContent.$().find(".sapMLnk")[1]);
			assert.strictEqual(oLink.getEnabled(), false, "Link is disabled");
		});

		QUnit.test("Pressing a field with type 'action' should fire an action", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Act
			this.oCard.setManifest(objectContent_url);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent();

			//Act
			var oLink = Element.closestTo(oContent.$().find("a:contains('Book a meeting')")[0]);
			assert.strictEqual(oLink.getEnabled(), true, "Link is enabled");
			oLink.firePress();

			await nextUIUpdate();

			// Assert
			assert.ok(oContent.$().hasClass("sapFCardSectionClickable"), "Card Content is clickable");
			assert.ok(oActionSpy.callCount === 1, "Field with type='action' is clicked and action event is fired");

			// Cleanup
			oActionSpy.restore();
			oStubOpenUrl.restore();
		});

		QUnit.module("Navigation Action - Table Content", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Pressing a table row column with type 'action' should fire an action", async function (assert) {
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Act
			this.oCard.setManifest(tableContent_action_on_cell);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent();

			//Act
			var oLink = Element.closestTo(oContent.$().find(".sapMLnk:not(.sapMLnkDsbl)")[0]);
			qutils.triggerKeydown(oLink.getDomRef(), KeyCodes.ENTER);

			await nextUIUpdate();

			// Assert
			assert.ok(oActionSpy.callCount === 1, "Field with type='action' is clicked and action event is fired");

			// Cleanup
			oActionSpy.restore();
			oStubOpenUrl.restore();
		});

		QUnit.module("Action Handlers", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});

			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Submit action handler", async function (assert) {
			var oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
				oSpyActionHandler = this.spy(SubmitAction.prototype, "execute");

			// Setup
			this.oCard.setManifest(oManifestActionSubmit);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const mEventArguments = {
				card: this.oCard,
				host: null,
				action: {
					type: CardActionType.Submit
				},
				parameters: {
					param1: "test"
				},
				source: this.oCard.getCardContent()
			};

			// Act
			CardActions.fireAction(mEventArguments);
			await nextUIUpdate();

			assert.ok(oStubRequest.called, "DataProvider's getData should have been called.");
			assert.ok(oSpyActionHandler.called, "Submit Action's handler should have been called.");
			assert.deepEqual(oSpyActionHandler.thisValues[0].getParameters(), mEventArguments.parameters, "Submit Action's handler should have been called with the event configuration.");
		});

		QUnit.test("Submit action handler at the Host", async function (assert) {
			var oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
				oSpyActionHandler = this.spy(SubmitAction.prototype, "execute"),
				oHostActionHandlerSpy1 = this.spy(),
				oHost1 = new Host({
					action: oHostActionHandlerSpy1
				}),
				oHostActionHandlerSpy2 = this.spy(function (oEvent) {
					oEvent.preventDefault();
				}),
				oHost2 = new Host({
					action: oHostActionHandlerSpy2
				});

			// Setup
			this.oCard.setManifest(oManifestActionSubmit);
			this.oCard.setHost(oHost1);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			const mEventArguments = {
				card: this.oCard,
				host: oHost1,
				action: {
					type: CardActionType.Submit
				},
				parameters: {
					param1: "test"
				},
				source: this.oCard.getCardContent()
			};
			// Act
			CardActions.fireAction(mEventArguments);
			await nextUIUpdate();

			// Assert
			assert.ok(oHostActionHandlerSpy1.calledOnce, "Host's action handler should have been called");
			assert.ok(oStubRequest.calledOnce, "DataProvider's getData should have been called.");
			assert.ok(oSpyActionHandler.calledOnce, "Submit Action's handler should have been called.");
			assert.deepEqual(oSpyActionHandler.thisValues[0].getParameters(), mEventArguments.parameters, "Submit Action's handler should have been called with the event configuration.");

			// Act
			this.oCard.setHost(oHost2);
			mEventArguments.host = oHost2;
			CardActions.fireAction(mEventArguments);
			await nextUIUpdate();

			// Assert
			assert.ok(oHostActionHandlerSpy2.calledOnce, "Host's action handler should have been called");
			assert.ok(oSpyActionHandler.calledOnce, "Submit Action's handler should be skipped this time.");
		});

		QUnit.module("Card API", {
			beforeEach: function () {
				this.oCard = new Card();

			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("When preventing an action within action handler, no further processing of that action should be done", async function (assert) {
			var done = assert.async(2),
				oCardFireActionSpy = sinon.spy(this.oCard, "fireAction"),
				oFurtherProcessingSpy = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {});

			// Arrange
			this.oCard.attachEvent("action", function (oEvent) {
				// Act
				oEvent.preventDefault();
				done();

				setTimeout(function () {
					// Assert
					assert.strictEqual(oCardFireActionSpy.returned(), false, "Event fired from Card was prevented");
					assert.strictEqual(oFurtherProcessingSpy.notCalled, true, "Further processing has not happened");

					// Cleanup
					oCardFireActionSpy.restore();
					oFurtherProcessingSpy.restore();
					done();
				}, 300);
			});

			// Act
			this.oCard.setManifest(tableContent_action_on_cell);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			//Act
			var oLink = Element.closestTo(this.oCard.getCardContent().$().find(".sapMLnk:not(.sapMLnkDsbl)")[0]);
			qutils.triggerKeydown(oLink.getDomRef(), KeyCodes.ENTER);
		});

		QUnit.test("Trigger action", async function (assert) {
			// Arrange
			var oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(NavigationAction.prototype, "_openUrl").callsFake(function () {});

			this.oCard.setManifest(oIntegrationCardManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			// Act
			this.oCard.triggerAction({
				type: "Navigation",
				parameters: {
					url: "test-url"
				}
			});

			// Assert
			assert.ok(oActionSpy.calledOnce, "The action is triggered.");
			assert.ok(oStubOpenUrl.calledOnce, "The predefined action is executed.");
			assert.ok(oStubOpenUrl.calledWith("test-url"), "The predefined action has correct parameters.");

			// Clean
			oActionSpy.restore();
			oStubOpenUrl.restore();
		});

		QUnit.module("ActionsStrip", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px",
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
			}
		});

		QUnit.test("Complex expression binding", async function (assert) {
			this.oCard.setManifest(oManifest_ActionsStrip);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			var oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
				aButtons = oActionsStrip._getToolbar().getContent();

			// Assert
			assert.notOk(aButtons[1].getEnabled(), "Button is disabled.");
			assert.notOk(aButtons[2].getEnabled(), "Button is disabled.");
		});

		return Library.load("sap.suite.ui.commons").then(function () {
			QUnit.module("Navigation Action - Timeline Content", {
				beforeEach: function () {
					this.oCard = new Card({
						width: "400px",
						height: "600px"
					});
				},
				afterEach: function () {
					this.oCard.destroy();
					this.oCard = null;
				}
			});

			QUnit.test("Timeline should be actionable ", async function (assert) {
				var oActionSpy = sinon.spy(CardActions, "fireAction"),
					oStubOpenUrl = sinon.stub(NavigationAction.prototype, "execute").callsFake(function () {
						Log.error(LOG_MESSAGE);
					});

				// Act
				this.oCard.setManifest(oManifest_TimelineCard_No_Request);
				this.oCard.placeAt(DOM_RENDER_LOCATION);

				await nextCardReadyEvent(this.oCard);
				await nextUIUpdate();

				var oContentItems = this.oCard.getCardContent().getInnerList().getContent();

				//Act
				oContentItems[0].fireSelect();
				await nextUIUpdate();

				// Assert
				assert.ok(oActionSpy.callCount === 1, "Timeline item action is fired");

				// Cleanup
				oActionSpy.restore();
				oStubOpenUrl.restore();
			});
		}).catch(function () {
			QUnit.module("Navigation Action - Timeline Content");
			QUnit.test("Timeline not supported", function (assert) {
				assert.ok(true, "Timeline content type is not available with this distribution.");
			});
		});
	}
);