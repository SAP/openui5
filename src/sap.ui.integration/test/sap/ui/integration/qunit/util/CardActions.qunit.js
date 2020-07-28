/* global QUnit, sinon */

sap.ui.define([
		"sap/ui/integration/library",
		"sap/ui/integration/widgets/Card",
		"sap/ui/integration/cards/ListContent",
		"sap/ui/integration/util/RequestDataProvider",
		"sap/ui/integration/Host",
		"sap/ui/core/Core",
		"sap/f/cards/NumericSideIndicator",
		"sap/ui/integration/cards/NumericHeader",
		"sap/ui/integration/cards/Header",
		"sap/base/Log",
		"sap/ui/core/ComponentContainer",
		"sap/ui/integration/util/CardActions",
		"sap/ui/qunit/QUnitUtils",
		"../services/SampleServices",
		"sap/ui/events/KeyCodes"
	],
	function (
		library,
		Card,
		ListContent,
		RequestDataProvider,
		Host,
		Core,
		NumericSideIndicator,
		NumericHeader,
		Header,
		Log,
		ComponentContainer,
		CardActions,
		qutils,
		SampleServices,
		KeyCodes
	) {
		"use strict";

		var CardActionType = library.CardActionType;

		var DOM_RENDER_LOCATION = "qunit-fixture",
			LOG_MESSAGE = "Navigate successfully";

		var oManifest_Header_Service = {
			"_version": "1.8.0",
			"sap.app": {
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
							"url": "https://www.sap.com"
						}
					]
				}
			}
		};

		var oManifest__Action_Disabled = {
			"_version": "1.8.0",
			"sap.app": {
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
							"url": "https://www.sap.com"
						}
					]
				}
			}
		};

		var oManifest_ListCard_No_Actions = {
			"_version": "1.8.0",
			"sap.app": {
				"type": "card"
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
							"url": "test-resources/sap/ui/integration/qunit/manifests/someitems_services.json"
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
						}
					}
				}
			}
		};

		var oManifest_ListCard_Actions_Missing_Type = {
			"_version": "1.8.0",
			"sap.app": {
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
					},
					"actions": [
						{
							"url": "https://www.sap.com"
						}
					]
				},
				"content": {
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/someitems_services.json"
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
								"target": "_blank",
								"enabled": "{= ${url}}",
								"url": "{url}",
								"parameters": {
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
							"url": "test-resources/sap/ui/integration/qunit/manifests/someitems_services.json"
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
								"target": "_blank",
								"enabled": "{= ${url}}",
								"url": "{url}",
								"parameters": {
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
				"type": "card"
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
							"url": "test-resources/sap/ui/integration/qunit/manifests/someitems_services_action_enabled.json"
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
								"target": "_blank",
								"enabled": "{= ${enabled}}",
								"url": "{url}"
							}
						]
					}
				}
			}
		};

		var oManifest_ListCard_No_Request = {
			"_version": "1.8.0",
			"sap.app": {
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
					"subTitle": "With static list items",
					"icon": {
						"src": "sap-icon://business-objects-experience"
					},
					"status": {
						"text": "5 of 17"
					}
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
								"url": "test-resources/sap/ui/integration/qunit/manifests/someitems_services2.json"
							},
							"path": "/items"
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
								"url": "test-resources/sap/ui/integration/qunit/manifests/items.json"
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
						"url": "test-resources/sap/ui/integration/qunit/manifests/datahandling_employee.json"
					}
				},
				"header": {
					"data": {
						"path": "/nested_level_1/nested_level_2"
					},
					"icon": {
						"src": "{photo}"
					},
					"title": "{firstName} {lastName}",
					"subTitle": "{position}"
				},
				"content": {
					"data": {
						"path": "/nested_level_1/nested_level_2"
					},
					"groups": [
						{
							"title": "{{contactDetails}}",
							"items": [
								{
									"label": "{{firstName}}",
									"value": "{firstName}"
								},
								{
									"label": "{{lastName}}",
									"value": "{lastName}"
								},
								{
									"label": "{{phone}}",
									"value": "{phone}"
								}
							]
						},
						{
							"title": "{{organizationalDetails}}",
							"items": [
								{
									"label": "{{directManager}}",
									"value": "{manager/firstName} {manager/lastName}",
									"icon": {
										"src": "{manager/photo}"
									}
								}
							]
						},
						{
							"title": "{{companyDetails}}",
							"items": [
								{
									"label": "{{companyName}}",
									"value": "{company/name}"
								},
								{
									"label": "{{address}}",
									"value": "{company/address}"
								},
								{
									"label": "{{website}}",
									"type": "link",
									"value": "{company/website}"
								}
							]
						}
					],
					"actions": [
						{
							"type": "Navigation",
							"target": "_blank",
							"enabled": "{= ${url}}",
							"url": "{url}"
						}
					]
				}
			}
		};

		var objectCotnent_url = {
			"sap.app": {
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "test-resources/sap/ui/integration/qunit/manifests/employee.json"
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
							"url": "https://www.sap.com"

						}
					]
				},
				"content": {
					"groups": [
						{
							"title": "{{contactDetails}}",
							"items": [
								{
									"label": "{{firstName}}",
									"value": "{firstName}"
								},
								{
									"label": "{{lastName}}",
									"value": "{lastName}"
								},
								{
									"label": "{{phone}}",
									"value": "{phone}"
								}
							]
						},
						{
							"title": "{{organizationalDetails}}",
							"items": [
								{
									"label": "{{directManager}}",
									"value": "{manager/firstName} {manager/lastName}",
									"icon": {
										"src": "{manager/photo}"
									}
								}
							]
						},
						{
							"title": "{{companyDetails}}",
							"items": [
								{
									"label": "{{companyName}}",
									"value": "{company/name}"
								},
								{
									"label": "{{address}}",
									"value": "{company/address}"
								},
								{
									"label": "{{website}}",
									"link": "{company/website}"
								}
							]
						}
					],
					"actions": [
						{
							"type": "Navigation",
							"url": "https://www.sap.com"

						}
					]
				}
			}
		};

		var oManifestActionSubmit = {
			"_version": "1.8.0",
			"sap.app": {
				"id": "adativecard.embedded",
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
			"sap.card": {
				"type": "List",
				"header": {
					"actions": [
						{
							"type": "Navigation",
							"url": "https://www.sap.com"
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
							"label": "{{title_label}}",
							"value": "{Name}"
						},
						"description": {
							"label": "{{description_label}}",
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

		function testNavigationServiceListContent(oManifest, assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake( function () {
					Log.error(LOG_MESSAGE);
				}),
				oCard = new Card({
					manifest: oManifest,
					width: "400px",
					height: "600px"
				});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = oCard.getCardContent()._getList().getItems();

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
				oCard.destroy();
				done();
			});
		}

		function testActionOnContentService(oManifest, assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake( function () {}),
				oCard = new Card({
					width: "400px",
					height: "600px",
					manifest: oManifest
				});
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {

				Core.applyChanges();
				var oCardLContent = oCard.getCardContent();

				oCard.attachAction(function (oEvent) {

					oEvent.preventDefault();

					// Assert
					assert.ok(oCardLContent.$().hasClass("sapFCardClickable"), "Card Content is clickable");
					assert.ok(oActionSpy.callCount === 1, "Card Content is clicked and action event is fired");

					// Cleanup
					oStubOpenUrl.restore();
					oActionSpy.restore();
					oCard.destroy();
					done();
				});

				//Act
				oCardLContent.firePress();
				Core.applyChanges();
			});
		}

		function testActionOnContentUrl(oManifest, assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake( function () {}),
				oCard = new Card({
					width: "400px",
					height: "600px",
					manifest: oManifest
				});
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardLContent = oCard.getCardContent(),
					oCardHeader =  oCard.getCardHeader();

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
				oCard.destroy();
				done();
			});
		}

		QUnit.module("Action Enablement - Header", {
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

		QUnit.test("Service navigation", function (assert) {

			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oLogSpy = sinon.spy(Log, "error");

			// Act
			this.oCard.setManifest(oManifest_Header_Service);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

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
		});

		QUnit.test("Action URL should navigate", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake( function () {
					Log.error(LOG_MESSAGE);
				});

			// Act
			this.oCard.setManifest(oManifest_Header_Url);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oCardHeader = this.oCard.getCardHeader();
				assert.ok(oCardHeader.$().hasClass("sapFCardClickable"), "Card Header has a  clickable style is added");
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
		});

		QUnit.test("Action URL should navigate without parameters", function (assert) {
			var done = assert.async(),
				oStubOpenUrl = sinon.stub(CardActions, "openUrl").callsFake( function () {
					Log.error(LOG_MESSAGE);
				});

			// Act
			this.oCard.setManifest(oIntegrationCardManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

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
		});

		QUnit.test("Enabled property of actions is set to false", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction");

			// Act
			this.oCard.setManifest(oManifest__Action_Disabled);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

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
		});

		QUnit.test("No actions available", function (assert) {
			var done = assert.async(),
				oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			// Act
			this.oCard.setManifest(oManifest_ListCard_No_Actions);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

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
		});

		QUnit.test("No action type available", function (assert) {
			var done = assert.async(),
				oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction");

			// Act
			this.oCard.setManifest(oManifest_ListCard_Actions_Missing_Type);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

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
		});

		QUnit.test("Actions 'enabled' is set to false", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction");

			// Act
			this.oCard.setManifest(oManifest_ListCard_CONTENT_ACTION);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

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
		});

		QUnit.module("Navigation Service - List Content");

		QUnit.test("List should be actionable ", function (assert) {

			testNavigationServiceListContent(oManifest_ListCard_CONTENT_ACTION, assert);
		});

		QUnit.test("Static Data - List should be actionable ", function (assert) {

			testNavigationServiceListContent(oManifest_ListCard_No_Request, assert);
		});

		QUnit.test("Card items with url should be hidden", function (assert) {

			var done = assert.async(),

				oCard = new Card({
					manifest: oManifest_List_Hidden_Items,
					width: "400px",
					height: "600px"
				});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				var oCardListItems = oCard.getCardContent()._getList().getItems();

			//Assert
				assert.ok(oCardListItems.length === 1, "There should be only one item");
				assert.ok(oCardListItems[1] === undefined , "There should be no second item");
				oCard.destroy();
				done();
			});
		});

		QUnit.test("No service URL in navigation actions", function (assert) {

			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oLogSpy = sinon.spy(Log, "error"),
				oCard = new Card({
					manifest: oManifest_List_Binded_Items,
					width: "400px",
					height: "600px"
				});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = oCard.getCardContent()._getList().getItems();

				oCard.attachAction(function () {
					// Assert
					assert.ok(oCardListItems[0].getType() === CardActionType.Navigation, "Card list item is actionable");
					assert.notOk(oCardListItems[1].getType() === CardActionType.Navigation , "Card list item is NOT actionable");
					assert.ok(oLogSpy.calledWith(LOG_MESSAGE), "Provided message should be logged to the console.");
					assert.ok(oActionSpy.callCount, "Card List item is clicked");

					//Clean up
					oLogSpy.restore();
					oActionSpy.restore();
					oCard.destroy();
					done();
				});

				//Act
				oCardListItems[0].firePress();
				Core.applyChanges();

			});
		});

		QUnit.test("Action enabled/disabled in template, no service", function (assert) {

			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake( function () {
					Log.error(LOG_MESSAGE);
				}),
				oCard = new Card({
					manifest: oManifest_ListCard_Action_Enabled,
					width: "400px",
					height: "600px"
				});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = oCard.getCardContent()._getList().getItems();

				//Act
				oCardListItems[3].firePress();
				Core.applyChanges();

				// Assert
				assert.notOk(oCardListItems[0].getType() === CardActionType.Navigation, "Card list item is NOT actionable");
				assert.notOk(oCardListItems[1].getType() === CardActionType.Navigation , "Card list item is NOT actionable");
				assert.notOk(oCardListItems[2].getType() === CardActionType.Navigation, "Card list item is NOT actionable");
				assert.ok(oCardListItems[3].getType() === CardActionType.Navigation , "Card list item is actionable");
				assert.ok(oCardListItems[4].getType() === CardActionType.Navigation , "Card list item is actionable");

				assert.ok(oActionSpy.callCount, "Card List item is clicked");

				//Clean up
				oStubOpenUrl.restore();
				oActionSpy.restore();
				oCard.destroy();
				done();
			});
		});

		QUnit.test("No actions available", function (assert) {

			var done = assert.async(),
				oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction"),
				oCard = new Card({
					manifest: oManifest_ListCard_No_Actions,
					width: "400px",
					height: "600px"
				});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = oCard.getCardContent()._getList().getItems();
					// Assert
					assert.notOk(oCardListItems[0].getType() === CardActionType.Navigation, "Card list item is actionable");
					assert.notOk(oCardListItems[1].getType() === CardActionType.Navigation , "Card list item is NOT actionable");
					assert.strictEqual(oAttachNavigationSpy.callCount, 0, "_attachAction should not be called");

					//Clean up
					oAttachNavigationSpy.restore();
					oCard.destroy();
					done();
			});
		});

		QUnit.test("No action type available", function (assert) {

			var done = assert.async(),
				oAttachNavigationSpy = sinon.spy(CardActions.prototype, "_attachAction"),
				oCard = new Card({
					manifest: oManifest_ListCard_Actions_Missing_Type,
					width: "400px",
					height: "600px"
				});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardListItems = oCard.getCardContent()._getList().getItems();
				// Assert
				assert.notOk(oCardListItems[0].getType() === CardActionType.Navigation, "Card list item is actionable");
				assert.notOk(oCardListItems[1].getType() === CardActionType.Navigation , "Card list item is NOT actionable");
				assert.strictEqual(oAttachNavigationSpy.callCount, 0, "_attachAction should not be called");

				//Clean up
				oAttachNavigationSpy.restore();
				oCard.destroy();
				done();
			});
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
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake( function () {
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
					height: "600px"
				});

			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Object content should be actionable - service", function (assert) {

			testActionOnContentService(objectContent_service, assert);
		});

		QUnit.test("Object content should be actionable - url", function (assert) {

			testActionOnContentUrl(objectCotnent_url, assert);
		});

		QUnit.test("On pressing link, action should not be fired", function (assert) {
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction");

			this.oCard.setManifest(objectContent_service);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardLContent = this.oCard.getCardContent();

				//Act
				qutils.triggerEvent("mousedown", document.querySelector("[role='link']"));
				Core.applyChanges();

				// Assert
				assert.ok(oCardLContent.$().hasClass("sapFCardClickable"), "Card Content is clickable");
				assert.ok(oActionSpy.callCount === 0, "Card Content is clicked and action event is fired");

				// Cleanup
				oActionSpy.restore();
				done();
			}.bind(this));
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
					action: {type: CardActionType.Submit},
					parameters: {configuration: {}, data: {foo: "bar"}},
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
					action: {type: CardActionType.Submit},
					parameters: {configuration: {}, data: {foo: "bar"}},
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
	}
);
