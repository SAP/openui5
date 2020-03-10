/* global QUnit, sinon */

sap.ui.define([
		"sap/ui/integration/library",
		"sap/ui/integration/widgets/Card",
		"sap/f/cards/ListContent",
		"sap/f/cards/AnalyticalContent",
		"sap/ui/core/Core",
		"sap/f/cards/NumericHeader",
		"sap/f/cards/NumericSideIndicator",
		"sap/f/cards/Header",
		"sap/base/Log",
		"sap/ui/core/ComponentContainer",
		"sap/ui/integration/util/CardActions",
		"sap/ui/qunit/QUnitUtils",
		"./services/SampleServices"
	],
	function (
		library,
		Card,
		ListContent,
		AnalyticalContent,
		Core,
		NumericHeader,
		NumericSideIndicator,
		Header,
		Log,
		ComponentContainer,
		CardActions,
		qutils,
		SampleServices
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

		var oManifest_List_Bindend_Items = {
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

		var oManifest_Analytical_Service = {
			"_version": "1.8.0",
			"sap.app": {
				"type": "card"
			},
			"sap.ui5": {
				"services": {
					"Navigation4": {
						"factoryName": "test.service.SampleNavigationFactory"
					}
				}
			},
			"sap.card": {
				"type": "Analytical",
				"header": {
					"type": "Numeric",
					"title": "Content with Navigation Service",
					"data": {
						"json": {
							"n": 6547394.45496,
							"u": "М $",
							"trend": "Down",
							"valueColor": "Critical"
						}
					},
					"subTitle": "Success Rate",
					"mainIndicator": {
						"number": "{n}",
						"unit": "{u}",
						"trend": "{trend}",
						"state": "{valueColor}"
					},
					"sideIndicators": [
						{
							"title": "Decrease",
							"number": "24",
							"unit": "weeks"
						}
					]
				},
				"content": {
					"chartType": "Donut",
					"legend": {
						"visible": true,
						"position": "Top",
						"alignment": "Center"
					},
					"plotArea": {
						"dataLabel": {
							"visible": true,
							"showTotal": true
						}
					},
					"title": {
						"text": "Donut chart",
						"visible": true,
						"alignment": "Bottom"
					},
					"measureAxis": "size",
					"dimensionAxis": "color",
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/cost.json"
						},
						"path": "/milk"
					},
					"dimensions": [
						{
							"label": "Store Name",
							"value": "{Store Name}"
						}
					],
					"measures": [
						{
							"label": "Revenue",
							"value": "{Revenue}"
						}
					],
					"actions": [
						{
							"type": "Navigation",
							"service": {
								"name": "Navigation4"
							},
							"parameters": {
								"url": "https://www.sap.com"
							}
						}
					]
				}
			}
		};

		var oManifest_Analytical_Url = {
			"_version": "1.8.0",
			"sap.app": {
				"type": "card"
			},
			"sap.card": {
				"type": "Analytical",
				"header": {
					"type": "Numeric",
					"title": "Content with Navigation Service",
					"data": {
						"json": {
							"n": 6547394.45496,
							"u": "М $",
							"trend": "Down",
							"valueColor": "Critical"
						}
					},
					"subTitle": "Success Rate",
					"mainIndicator": {
						"number": "{n}",
						"unit": "{u}",
						"trend": "{trend}",
						"state": "{valueColor}"
					},
					"sideIndicators": [
						{
							"title": "Decrease",
							"number": "24",
							"unit": "weeks"
						}
					],
					"actions": [
						{
							"type": "Navigation",
							"url": "https://www.sap.com"
						}
					]
				},
				"content": {
					"chartType": "Donut",
					"legend": {
						"visible": true,
						"position": "Top",
						"alignment": "Center"
					},
					"plotArea": {
						"dataLabel": {
							"visible": true,
							"showTotal": true
						}
					},
					"title": {
						"text": "Donut chart",
						"visible": true,
						"alignment": "Bottom"
					},
					"measureAxis": "size",
					"dimensionAxis": "color",
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/cost.json"
						},
						"path": "/milk"
					},
					"dimensions": [
						{
							"label": "Store Name",
							"value": "{Store Name}"
						}
					],
					"measures": [
						{
							"label": "Revenue",
							"value": "{Revenue}"
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

		var oManifest_Analytical_No_Actions = {
			"_version": "1.8.0",
			"sap.app": {
				"type": "card"
			},
			"sap.card": {
				"type": "Analytical",
				"header": {
					"type": "Numeric",
					"title": "Content with Navigation Service",
					"data": {
						"json": {
							"n": 6547394.45496,
							"u": "М $",
							"trend": "Down",
							"valueColor": "Critical"
						}
					},
					"subTitle": "Success Rate",
					"mainIndicator": {
						"number": "{n}",
						"unit": "{u}",
						"trend": "{trend}",
						"state": "{valueColor}"
					},
					"sideIndicators": [
						{
							"title": "Decrease",
							"number": "24",
							"unit": "weeks"
						}
					]
				},
				"content": {
					"chartType": "Donut",
					"legend": {
						"visible": true,
						"position": "Top",
						"alignment": "Center"
					},
					"plotArea": {
						"dataLabel": {
							"visible": true,
							"showTotal": true
						}
					},
					"title": {
						"text": "Donut chart",
						"visible": true,
						"alignment": "Bottom"
					},
					"measureAxis": "size",
					"dimensionAxis": "color",
					"data": {
						"request": {
							"url": "test-resources/sap/ui/integration/qunit/manifests/cost.json"
						},
						"path": "/milk"
					},
					"dimensions": [
						{
							"label": "Store Name",
							"value": "{Store Name}"
						}
					],
					"measures": [
						{
							"label": "Revenue",
							"value": "{Revenue}"
						}
					]
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
					assert.ok(oCardLContent.hasStyleClass("sapFCardClickable"), "Card Content is clickable");
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
					manifest: oManifest_Analytical_Url
				});
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardLContent = oCard.getCardContent(),
					oCardHeader =  oCard.getCardHeader();

				// Assert
				assert.ok(oCardLContent.hasStyleClass("sapFCardClickable"), "Card Content is clickable");
				assert.ok(oCardHeader.hasStyleClass("sapFCardClickable"), "Card Header is clickable");

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
				assert.ok(oCardHeader.hasStyleClass("sapFCardClickable"), "Card Header has a clickable style is added");

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
				assert.ok(oCardHeader.hasStyleClass("sapFCardClickable"), "Card Header has a  clickable style is added");
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

		QUnit.test("No service URL in navigation actions", function (assert) {

			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oLogSpy = sinon.spy(Log, "error"),
				oCard = new Card({
					manifest: oManifest_List_Bindend_Items,
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
				oActionSpy = sinon.spy(CardActions, "fireAction");

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
				done();
			}.bind(this));
		});

		QUnit.module("Navigation Action - Analytical Content", {
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

		QUnit.test("Analytical content should be actionable - service ", function (assert) {

			testActionOnContentService(oManifest_Analytical_Service, assert);
		});

		QUnit.test("Analytical Card should be actionable - url", function (assert) {

			testActionOnContentUrl(oManifest_Analytical_Url, assert);
		});

		QUnit.test("Analytical Card should be not actionable", function (assert) {
			// Arrange
			var done = assert.async(),
				oActionSpy = sinon.spy(CardActions, "fireAction"),
				oStubOpenUrl = sinon.stub(CardActions, "_doPredefinedAction").callsFake( function () {});

			this.oCard.setManifest(oManifest_Analytical_No_Actions);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oCardLContent = this.oCard.getCardContent(),
					oCardHeader =  this.oCard.getCardHeader();

				// Assert
				assert.notOk(oCardLContent.hasStyleClass("sapFCardClickable"), "Card Content is clickable");
				assert.notOk(oCardHeader.hasStyleClass("sapFCardClickable"), "Card Content is clickable");

				//Act
				oCardLContent.firePress();
				oCardHeader.firePress();
				Core.applyChanges();

				//Assert
				assert.strictEqual(oActionSpy.callCount, 0, "Card Content and header are clicked and action event is fired twice");

				// Cleanup
				oStubOpenUrl.restore();
				oActionSpy.restore();
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

		QUnit.test("Object content should be actionable - service ", function (assert) {

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
				assert.ok(oCardLContent.hasStyleClass("sapFCardClickable"), "Card Content is clickable");
				assert.ok(oActionSpy.callCount === 0, "Card Content is clicked and action event is fired");

				// Cleanup
				oActionSpy.restore();
				done();
			}.bind(this));
		});
	}
);