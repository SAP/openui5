/* global QUnit, sinon */

sap.ui.define([
	"../services/SampleServices",
	"sap/ui/integration/library",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/Host",
	"sap/ui/core/Core",
	"sap/base/Log",
	"sap/ui/integration/util/CardActions",
	"sap/ui/qunit/QUnitUtils"
],
	function (
		SampleServices,
		library,
		Card,
		RequestDataProvider,
		Host,
		Core,
		Log,
		CardActions,
		qutils
	) {
		"use strict";

		var CardActionType = library.CardActionType;

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
					"actions": [
						{
							"type": "Navigation",
							"service": "Navigation2",
							"parameters": {
								"url": "https://www.sap.com"
							}
						}
					]
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
					"actions": [
						{
							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com"
							}
						}
					]
				}
			}
		};

		var oManifest__Action_Disabled = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "test.card.actions.card3",
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
					"actions": [
						{
							"enabled": false,
							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com"
							}
						}
					]
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
					"actions": [
						{
							"parameters": {
								"url": "https://www.sap.com"
							}
						}
					]
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
						"actions": [
							{
								"enabled": "{= ${url}}",
								"parameters": {
									"url": "{url}",
									"target": "_blank",
									"somekey": "{someparam}"
								}
							}
						]
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
						"actions": [
							{
								"type": "Navigation",
								"enabled": "{= ${url}}",
								"parameters": {
									"url": "{url}",
									"target": "_blank",
									"somekey": "{someparam}"
								}
							}
						]
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
						"actions": [
							{
								"type": "Navigation",
								"enabled": "{= ${enabled}}",
								"parameters": {
									"url": "{url}",
									"target": "_blank"
								}
							}
						]
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
						"json":
							[{
								"Name": "Comfort Easy",
								"Category": "PDA & Organizers",
								"url": "https://www.sap.com"
							},
							{
								"Name": "ITelO Vault",
								"Category": "PDA & Organizers"
							}]
					},
					"item": {
						"title": {
							"value": "{Name}"
						},
						"actions": [
							{
								"type": "Navigation",
								"enabled": "{= ${url}}",
								"parameters": {
									"url": "{url}"
								}
							}
						]
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
						"actions": [
							{
								"type": "Navigation",
								"service": "IntentBasedNavigation",
								"parameters": {
									"intentSemanticObject": "SalesOrder",
									"name": "{Name}"
								}
							}
						]
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
						"actions": [
							{
								"type": "Navigation",
								"service": "IntentBasedNavigation",
								"parameters": {
									"intentSemanticObject": "SalesOrder",
									"name": "{Name}",
									"hidden": "{url}"
								}
							}
						]
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
						"actions": [
							{
								"type": "Navigation",
								"service": "IntentBasedNavigation",
								"parameters": {
									"intentSemanticObject": "SalesOrder",
									"name": "{Name}",
									"hidden": "{url}"
								}
							}
						]
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
									"value": "{phone}"
								}
							]
						},
						{
							"title": "Organization Details",
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
									"label": "Website",
									"value": "{company/website}",
									"actions": [
										{
											"type": "Navigation",
											"parameters": {
												"url": "{company/website}"
											}
										}
									]
								}
							]
						}
					],
					"actions": [
						{
							"type": "Navigation",
							"enabled": "{= ${url}}",
							"parameters": {
								"url": "{url}",
								"target": "_blank"
							}
						}
					]
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
					"groups": [
						{
							"items": [
								{
									"label": "Website",
									"value": "{company/website}",
									"actions": [
										{
											"type": "Navigation",
											"service": "Navigation2",
											"parameters": {
												"url": "{company/website}"
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
					"actions": [
						{
							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com"
							}

						}
					]
				},
				"content": {
					"groups": [
						{
							"title": "Contact Details",
							"items": [
								{
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
							"title": "Organization Details",
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
									"label": "Website",
									"value": "{company/website}",
									"actions": [
										{
											"type": "Navigation",
											"enabled": false,
											"parameters": {
												"url": "{company/website}"
											}
										}
									]
								}
							]
						}
					],
					"actions": [
						{
							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com"
							}
						}
					]
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
					"actions": [
						{
							"type": "Navigation",
							"parameters": {
								"url": "https://www.sap.com"
							}
						}
					],
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
						"json": [
							{
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
						"json": [
							{
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
						"columns": [
							{
								"title": "Name",
								"value": "{Name}"
							},
							{
								"title": "Number",
								"value": "{Number}",
								"actions": [
									{
										"type": "Navigation",
										"enabled": "{= ${ActionUrl}}",
										"parameters": {
											"url": "{ActionUrl}"
										}
									}
								]
							}
						]
					}
				}
			}
		};

		function testNavigationServiceListContent(oManifest, assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = this.oCard.getCardContent()._getList().getItems();

				// Assert
				assert.ok(oCardListItems[0].getType() === CardActionType.Navigation, "Card list item is actionable");
				assert.notOk(oCardListItems[1].getType() === CardActionType.Navigation, "Card list item is NOT actionable");

				//Act
				oCardListItems[0].firePress();
				Core.applyChanges();

				// Assert
				assert.ok(oActionSpy.callCount === 1, "Card List Item is clicked");

				// Cleanup
				oStubOpenUrl.restore();
				oActionSpy.restore();

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest);
		}

		function testActionOnContentService(oManifest, assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () { });

			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();
				var oCardLContent = this.oCard.getCardContent();

				this.oCard.attachAction(function (oEvent) {

					oEvent.preventDefault();

					// Assert
					assert.ok(oCardLContent.$().hasClass("sapFCardClickable"), "Card Content is clickable");
					assert.ok(oActionSpy.callCount === 1, "Card Content is clicked and action event is fired");

					// Cleanup
					oStubOpenUrl.restore();
					oActionSpy.restore();

					done();
				});

				//Act
				oCardLContent.firePress();
				Core.applyChanges();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest);
		}

		function testActionOnContentUrl(oManifest, assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () { });

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardLContent = this.oCard.getCardContent(),
					oCardHeader = this.oCard.getCardHeader();

				// Assert
				assert.ok(oCardLContent.$().hasClass("sapFCardClickable"), "Card Content is clickable");
				assert.ok(oCardHeader.$().hasClass("sapFCardClickable"), "Card Header is clickable");

				//Act
				oCardLContent.firePress();
				oCardHeader.firePress();
				Core.applyChanges();

				//Assert
				assert.strictEqual(oActionSpy.callCount, 2, "Card Content and header are clicked and action event is fired twice");

				// Cleanup
				oStubOpenUrl.restore();
				oActionSpy.restore();

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest);
		}

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

		QUnit.test("Service navigation", function (assert) {

			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oLogSpy = sinon.spy(Log, "error");

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardHeader = this.oCard.getCardHeader();

				assert.ok(oCardHeader.$().hasClass("sapFCardClickable"), "Card Header has a clickable style is added");

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
				Core.applyChanges();

			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_Header_Service);
		});

		QUnit.test("Action URL should navigate", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oCardHeader = this.oCard.getCardHeader();
				assert.ok(oCardHeader.$().hasClass("sapFCardClickable"), "Card Header has a clickable style is added");
				//Act
				oCardHeader.firePress();
				Core.applyChanges();

				// Assert
				assert.ok(oActionSpy.callCount, "Card Header is clicked");

				//Clean up
				oStubOpenUrl.restore();
				oActionSpy.restore();
				done();

			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_Header_Url);
		});

		QUnit.test("Action URL should navigate without parameters", function (assert) {
			var done = assert.async(),
				oStubOpenUrl = sinon.stub(CardActions, "openUrl").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oCardHeader = this.oCard.getCardHeader();

				//Act
				oCardHeader.firePress();
				Core.applyChanges();

				// Assert
				assert.strictEqual(oStubOpenUrl.callCount, 1, "Header has navigate to new url");

				//Clean up
				oStubOpenUrl.restore();
				done();

			}.bind(this));

			// Act
			this.oCard.setManifest(oIntegrationCardManifest);
		});

		QUnit.test("Enabled property of actions is set to false", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction");

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardHeader = this.oCard.getCardHeader();
				// Assert
				assert.notOk(oCardHeader.hasStyleClass("sapFCardClickable"), "Card Header doesn't have a clickable style");

				//Act
				oCardHeader.firePress();
				Core.applyChanges();

				// Assert
				assert.notOk(oActionSpy.callCount, "Card Header is not clicked");

				//Clean up
				oActionSpy.restore();
				done();

			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest__Action_Disabled);
		});

		QUnit.test("No actions available", function (assert) {
			var done = assert.async(),
				oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardHeader = this.oCard.getCardHeader();

				// Assert
				assert.notOk(oCardHeader.hasStyleClass("sapFCardClickable"), "Card Header has not a clickable style is added");
				assert.ok(oAttachNavigationSpy.callCount === 0, "_attachAction should not be called");

				//Clean up
				oAttachNavigationSpy.restore();
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ListCard_No_Actions);
		});

		QUnit.test("No action type available", function (assert) {
			var done = assert.async(),
				oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardHeader = this.oCard.getCardHeader();

				// Assert
				assert.notOk(oCardHeader.hasStyleClass("sapFCardHeaderClickable"), "Card Header has not a clickable style is added");
				assert.ok(oAttachNavigationSpy.callCount === 0, "_attachAction should not be called");

				//Clean up
				oAttachNavigationSpy.restore();
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ListCard_Actions_Missing_Type);
		});

		QUnit.test("Actions 'enabled' is set to false", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction");

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oCardHeader = this.oCard.getCardHeader();
				assert.notOk(oCardHeader.hasStyleClass("sapFCardHeaderClickable"), "Card Header has not a clickable style is added");
				//Act
				oCardHeader.firePress();
				Core.applyChanges();

				// Assert
				assert.ok(oActionSpy.callCount === 0, "Card Header is can not be clicked");

				//Clean up
				oActionSpy.restore();
				done();

			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ListCard_CONTENT_ACTION);
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

		QUnit.test("List should be actionable ", function (assert) {

			testNavigationServiceListContent.call(this, oManifest_ListCard_CONTENT_ACTION, assert);
		});

		QUnit.test("Static Data - List should be actionable ", function (assert) {

			testNavigationServiceListContent.call(this, oManifest_ListCard_No_Request, assert);
		});

		QUnit.test("Card items with url should be hidden", function (assert) {
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var oCardListItems = this.oCard.getCardContent()._getList().getItems();

				//Assert
				assert.ok(oCardListItems.length === 1, "There should be only one item");
				assert.ok(oCardListItems[1] === undefined, "There should be no second item");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_List_Hidden_Items);
		});

		QUnit.test("Card items should be visible if service does not implement method 'hidden'", function (assert) {
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var oCardListItems = this.oCard.getCardContent()._getList().getItems();

				//Assert
				assert.strictEqual(oCardListItems.length, 2, "All items should be visible if 'hidden' is not implemented.");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_List_Broken_Navigation);
		});

		QUnit.test("No service URL in navigation actions", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oLogSpy = sinon.spy(Log, "error");

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = this.oCard.getCardContent()._getList().getItems();

				this.oCard.attachAction(function () {
					// Assert
					assert.ok(oCardListItems[0].getType() === CardActionType.Navigation, "Card list item is actionable");
					assert.notOk(oCardListItems[1].getType() === CardActionType.Navigation, "Card list item is NOT actionable");
					assert.ok(oLogSpy.calledWith(LOG_MESSAGE), "Provided message should be logged to the console.");
					assert.ok(oActionSpy.callCount, "Card List item is clicked");

					//Clean up
					oLogSpy.restore();
					oActionSpy.restore();

					done();
				});

				//Act
				oCardListItems[0].firePress();
				Core.applyChanges();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_List_Binded_Items);
		});

		QUnit.test("Action enabled/disabled in template, no service", function (assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = this.oCard.getCardContent()._getList().getItems();

				//Act
				oCardListItems[3].firePress();
				Core.applyChanges();

				// Assert
				assert.notOk(oCardListItems[0].getType() === CardActionType.Navigation, "Card list item is NOT actionable");
				assert.notOk(oCardListItems[1].getType() === CardActionType.Navigation, "Card list item is NOT actionable");
				assert.notOk(oCardListItems[2].getType() === CardActionType.Navigation, "Card list item is NOT actionable");
				assert.ok(oCardListItems[3].getType() === CardActionType.Navigation, "Card list item is actionable");
				assert.ok(oCardListItems[4].getType() === CardActionType.Navigation, "Card list item is actionable");

				assert.ok(oActionSpy.callCount, "Card List item is clicked");

				//Clean up
				oStubOpenUrl.restore();
				oActionSpy.restore();

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ListCard_Action_Enabled);
		});

		QUnit.test("No actions available", function (assert) {
			// Arrange
			var done = assert.async(),
				oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = this.oCard.getCardContent()._getList().getItems();
				// Assert
				assert.notOk(oCardListItems[0].getType() === CardActionType.Navigation, "Card list item is actionable");
				assert.notOk(oCardListItems[1].getType() === CardActionType.Navigation, "Card list item is NOT actionable");
				assert.strictEqual(oAttachNavigationSpy.callCount, 0, "_attachAction should not be called");

				//Clean up
				oAttachNavigationSpy.restore();

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ListCard_No_Actions);
		});

		QUnit.test("No action type available", function (assert) {
			// Arrange
			var done = assert.async(),
				oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = this.oCard.getCardContent()._getList().getItems();
				// Assert
				assert.notOk(oCardListItems[0].getType() === CardActionType.Navigation, "Card list item is actionable");
				assert.notOk(oCardListItems[1].getType() === CardActionType.Navigation, "Card list item is NOT actionable");
				assert.strictEqual(oAttachNavigationSpy.callCount, 0, "_attachAction should not be called");

				//Clean up
				oAttachNavigationSpy.restore();

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ListCard_Actions_Missing_Type);
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

		QUnit.test("List should be actionable ", function (assert) {

			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () {
					Log.error(LOG_MESSAGE);
				});

			// Act
			this.oCard.setManifest(oManifest_ListCard_No_Request);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = this.oCard.getCardContent()._getList().getItems();

				// Assert
				assert.ok(oCardListItems[0].getType() === CardActionType.Navigation, "Card list item is actionable");
				assert.notOk(oCardListItems[1].getType() === CardActionType.Navigation, "Card list item is NOT actionable");

				//Act
				oCardListItems[0].firePress();
				Core.applyChanges();

				// Assert
				assert.ok(oActionSpy.callCount === 1, "Card List Item is clicked");

				// Cleanup
				oActionSpy.restore();
				oStubOpenUrl.restore();
				done();
			}.bind(this));
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

		QUnit.test("Object content should be actionable - service", function (assert) {

			testActionOnContentService.call(this, objectContent_service, assert);
		});

		QUnit.test("Object content should be actionable - url", function (assert) {

			testActionOnContentUrl.call(this, objectContent_url, assert);
		});

		QUnit.test("Using a service for action on link in object content should not throw error", function (assert) {
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Assert
				assert.ok(true, "Error was not thrown");

				done();
			});

			// Act
			this.oCard.setManifest(objectContentItemDetail_service);
		});

		QUnit.test("On pressing link, action should be fired", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () {});

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oObjContent = this.oCard.getCardContent();

				//Act
				var oLink = oObjContent.$().find(".sapMLnk").control(0);
				oLink.firePress();

				Core.applyChanges();

				// Assert
				assert.ok(oObjContent.$().hasClass("sapFCardClickable"), "Card Content is clickable");
				assert.ok(oActionSpy.callCount === 1, "Link is clicked and action event is not fired");

				// Cleanup
				oActionSpy.restore();
				oStubOpenUrl.restore();
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(objectContent_service);
		});

		QUnit.test("Disabled actions should also disable links", function (assert) {
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oContent = this.oCard.getCardContent();

				//Act
				var oLink = oContent.$().find(".sapMLabel:contains('Website')+a").control(0);
				assert.strictEqual(oLink.getEnabled(), false, "Link is disabled");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(objectContent_url);
		});

		QUnit.test("Pressing a field with type 'action' should fire an action", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () {});

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oContent = this.oCard.getCardContent();

				//Act
				var oLink = oContent.$().find("a:contains('Book a meeting')").control(0);
				assert.strictEqual(oLink.getEnabled(), true, "Link is enabled");
				oLink.firePress();

				Core.applyChanges();

				// Assert
				assert.ok(oContent.$().hasClass("sapFCardClickable"), "Card Content is clickable");
				assert.ok(oActionSpy.callCount === 1, "Field with type='action' is clicked and action event is fired");

				// Cleanup
				oActionSpy.restore();
				oStubOpenUrl.restore();
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(objectContent_url);
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

		QUnit.test("Pressing a table row column with type 'action' should fire an action", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake(function () {});

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oContent = this.oCard.getCardContent();

				//Act
				var oLink = oContent.$().find(".sapMLnk:not(.sapMLnkDsbl)").control(0);
				qutils.triggerKeydown(oLink.getDomRef(), jQuery.sap.KeyCodes.ENTER);

				Core.applyChanges();

				// Assert
				assert.ok(oActionSpy.callCount === 1, "Field with type='action' is clicked and action event is fired");

				// Cleanup
				oActionSpy.restore();
				oStubOpenUrl.restore();
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(tableContent_action_on_cell);
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

		QUnit.test("Submit action handler", function (assert) {
			var mEventArguments,
				done = assert.async(),
				oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
				oSpyActionHandler = this.spy(CardActions, "handleSubmitAction");

			// Setup
			this.oCard.setManifest(oManifestActionSubmit);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();


			this.oCard.attachEvent("_ready", function () {
				mEventArguments = {
					card: this.oCard,
					host: null,
					action: { type: CardActionType.Submit },
					parameters: { configuration: {}, data: { foo: "bar" } },
					source: this.oCard.getCardContent()
				};
				// Act
				CardActions.fireAction(mEventArguments);

				Core.applyChanges();

				assert.ok(oStubRequest.called, "DataProvider's getData should have been called.");
				assert.ok(oSpyActionHandler.called, "Submit Action's handler should have been called.");
				assert.ok(oSpyActionHandler.calledWith(mEventArguments), "Submit Action's handler should have been called with the event configuration.");

				done();
			}.bind(this));
		});

		QUnit.test("Submit action handler at the Host", function (assert) {
			var mEventArguments,
				done = assert.async(),
				oStubRequest = this.stub(RequestDataProvider.prototype, "getData").resolves("Success"),
				oSpyActionHandler = this.spy(CardActions, "handleSubmitAction"),
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
			Core.applyChanges();


			this.oCard.attachEvent("_ready", function () {
				mEventArguments = {
					card: this.oCard,
					host: oHost1,
					action: { type: CardActionType.Submit },
					parameters: { configuration: {}, data: { foo: "bar" } },
					source: this.oCard.getCardContent()
				};
				// Act
				CardActions.fireAction(mEventArguments);
				Core.applyChanges();

				// Assert
				assert.ok(oHostActionHandlerSpy1.calledOnce, "Host's action handler should have been called");
				assert.ok(oStubRequest.calledOnce, "DataProvider's getData should have been called.");
				assert.ok(oSpyActionHandler.calledOnce, "Submit Action's handler should have been called.");
				assert.ok(oSpyActionHandler.calledWith(mEventArguments), "Submit Action's handler should have been called with the event configuration.");

				// Act
				this.oCard.setHost(oHost2);
				mEventArguments.host = oHost2;
				CardActions.fireAction(mEventArguments);
				Core.applyChanges();

				// Assert
				assert.ok(oHostActionHandlerSpy2.calledOnce, "Host's action handler should have been called");
				assert.ok(oSpyActionHandler.calledOnce, "Submit Action's handler should be skipped this time.");

				done();
			}.bind(this));
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

		QUnit.test("When preventing an action within action handler, no further processing of that action should be done", function (assert) {
			var done = assert.async(2),
				oCardFireActionSpy = sinon.spy(this.oCard, "fireAction"),
				oFurtherProcessingSpy = sinon.spy(CardActions, "_doPredefinedAction");

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

			this.oCard.attachEvent("_ready", function () {
				//Act
				var oLink = this.oCard.getCardContent().$().find(".sapMLnk:not(.sapMLnkDsbl)").control(0);
				qutils.triggerKeydown(oLink.getDomRef(), jQuery.sap.KeyCodes.ENTER);
			}.bind(this));

			// Act
			this.oCard.setManifest(tableContent_action_on_cell);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Trigger action", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard,
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "openUrl").callsFake(function () { });

			oCard.attachEvent("_ready", function () {
				// Act
				oCard.triggerAction({
					type: "Navigation",
					parameters: {
						url: "test-url"
					}
				});

				// Assert
				assert.ok(oActionSpy.calledOnce, "The action is triggered.");
				assert.ok(oStubOpenUrl.calledOnce, "The predefined action is executed.");
				assert.ok(oStubOpenUrl.calledWith("test-url"), "The predefined action has correct parameters.");

				done();

				// Clean
				oActionSpy.restore();
				oStubOpenUrl.restore();
			});

			oCard.setManifest(oIntegrationCardManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

	}
);
