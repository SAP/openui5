/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Host",
	"sap/ui/integration/cards/BaseContent",
	"sap/ui/integration/cards/Header",
	"sap/ui/integration/cards/filters/SelectFilter",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/integration/util/Manifest",
	"sap/ui/integration/library",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/Manifest",
	"sap/base/Log",
	"sap/ui/core/ComponentContainer",
	"sap/ui/base/Event",
	"sap/ui/core/UIComponent",
	"sap/m/BadgeCustomData",
	"sap/m/MessageStrip",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/base/util/deepExtend",
	"sap/base/util/LoaderExtensions",
	"sap/m/HBox",
	"sap/ui/model/json/JSONModel",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/nextCardDataReadyEvent",
	"qunit/testResources/nextCardContentReadyEvent",
	"qunit/testResources/nextCardManifestAppliedEvent",
	"qunit/testResources/nextCardManifestReadyEvent"
],
	function(
		Library,
		Card,
		Host,
		BaseContent,
		Header,
		Filter,
		DataProvider,
		CardManifest,
		library,
		MessageType,
		CoreManifest,
		Log,
		ComponentContainer,
		Event,
		UIComponent,
		BadgeCustomData,
		MessageStrip,
		DataProviderFactory,
		deepExtend,
		LoaderExtensions,
		HBox,
		JSONModel,
		IllustratedMessageType,
		IllustratedMessageSize,
		nextUIUpdate,
		nextCardReadyEvent,
		nextCardDataReadyEvent,
		nextCardContentReadyEvent,
		nextCardManifestAppliedEvent,
		nextCardManifestReadyEvent
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var CardDataMode = library.CardDataMode;
		var CardBlockingMessageType = library.CardBlockingMessageType;

		var oManifest_ListCard = {
			"sap.app": {
				"id": "my.card.qunit.test.ListCard"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "L3 Request list content Card",
					"subTitle": "Card subtitle",
					"icon": {
						"src": "sap-icon://accept"
					},
					"status": {
						"text": "100 of 200"
					},
					"dataTimestamp": "2021-03-18T12:00:00Z"
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Notebook Basic 15",
								"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1000",
								"SubCategoryId": "Notebooks",
								"state": "Information",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 17",
								"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1001",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 18",
								"Description": "Notebook Basic 18 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1002",
								"SubCategoryId": "Notebooks",
								"state": "Warning",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "Notebook Basic 19",
								"Description": "Notebook Basic 19 with 2,80 GHz quad core, 19\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1003",
								"SubCategoryId": "Notebooks",
								"state": "Error",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "ITelO Vault",
								"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
								"Id": "HT-1007",
								"SubCategoryId": "PDAs & Organizers",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 15",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1010",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 26",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1022",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 27",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1024",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							}
						]
					},
					"item": {
						"title": {
							"label": "Title",
							"value": "{Name}"
						},
						"description": {
							"label": "Description",
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

		var oManifest_ListCard_NoHeader = {
			"sap.app": {
				"id": "my.card.qunit.test.ListCard"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": [
							{
								"Name": "Notebook Basic 15",
								"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1000",
								"SubCategoryId": "Notebooks",
								"state": "Information",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 17",
								"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1001",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "27.45 EUR",
								"infoState": "Success"

							},
							{
								"Name": "Notebook Basic 18",
								"Description": "Notebook Basic 18 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1002",
								"SubCategoryId": "Notebooks",
								"state": "Warning",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "Notebook Basic 19",
								"Description": "Notebook Basic 19 with 2,80 GHz quad core, 19\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1003",
								"SubCategoryId": "Notebooks",
								"state": "Error",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "ITelO Vault",
								"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
								"Id": "HT-1007",
								"SubCategoryId": "PDAs & Organizers",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 15",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1010",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 26",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1022",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 27",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1024",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							}
						]
					},
					"item": {
						"title": {
							"label": "Title",
							"value": "{Name}"
						},
						"description": {
							"label": "Description",
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

		var oManifest_TableCard = {
			"sap.app": {
				"id": "my.card.qunit.test.TableCard"
			},
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
								"title": "Sales Order",
								"value": "{salesOrder}",
								"identifier": true
							},
							{
								"title": "Customer",
								"value": "{customer}"
							},
							{
								"title": "Status",
								"value": "{status}",
								"state": "{statusState}",
								"hAlign": "End"
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

		var oManifest_ComponentCardAllInOne = {
			"_version": "1.12.0",
			"sap.app": {
				"id": "sap.f.cardsdemo.cardcontent.componentContent.allInOne",
				"type": "card",
				"applicationVersion": {
					"version": "1.0.0"
				}
			},
			"sap.card": {
				"type": "Component"
			}
		};

		var oManifest_CustomModels = {
			"sap.app": {
				"id": "test.card.card15"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"name": "cities"
				},
				"content": {
					"data": {
						"path": "cities>/items"
					},
					"item": {
						"title": "{cities>name}"
					}
				}
			}
		};

		var oManifest_List_Simple = {
			"sap.app": {
				"id": "my.card.qunit.test.ListCardSimple"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "L3 Request list content Card",
					"subTitle": "Card subtitle"
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Notebook Basic 15"
							},
							{
								"Name": "Notebook Basic 17"
							},
							{
								"Name": "Notebook Basic 18"
							},
							{
								"Name": "Notebook Basic 19"
							}
						]
					},
					"item": {
						"title": {
							"label": "Title",
							"value": "{Name}"
						}
					}
				}
			}
		};

		var oManifest_No_Data_Object = {
			"sap.app": {
				"id": "test.card.NoData"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"firstName": "Donna",
						"lastName": "Moore",
						"manager": {
						},
						"company": {
							"name": "Robert Brown Entertainment"
						}
					}
				},
				"header": {},
				"content": {
					"hasData": "{/manager}",
					"groups": [
						{
							"title": "Contact Details",
							"items": [
								{
									"label": "First Name",
									"value": "{firstName}"
								}
							]
						}
					]
				}
			}
		};

		async function testContentInitialization(oManifest, assert) {
			// Arrange
			var oCard = new Card("somecard", {
				manifest: oManifest,
				width: "400px",
				height: "600px"
			});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();

			// Assert
			assert.notOk(oCard.getAggregation("_header"), "Card header should be empty.");
			assert.notOk(oCard.getAggregation("_content"), "Card content should be empty.");
			assert.ok(oCard.getDomRef(), "Card should be rendered.");
			assert.equal(oCard.getDomRef().clientWidth, 398, "Card should have width set to 398px.");
			assert.equal(oCard.getDomRef().clientHeight, 598, "Card should have height set to 598px.");

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(oCard.getAggregation("_header").getDomRef(), "Card header should be rendered.");
			assert.ok(oCard.getAggregation("_content").getDomRef(), "Card content should be rendered.");

			// Cleanup
			oCard.destroy();
		}

		function testComponentContentCreation(oCardManifest, oExpectedComponentManifest, assert) {
			// Arrange
			var done = assert.async(),
				oStub = sinon.stub(ComponentContainer.prototype, "applySettings"),
				oCard = new Card(),
				oStubEvent = new Event("componentCreated", this, {
					component: new UIComponent()
				});

			assert.expect(1);
			oStub.callsFake(function (mSettings) {
				assert.deepEqual(
					mSettings.manifest,
					oExpectedComponentManifest,
					"A ComponentContainer is created with expected settings"
				);

				mSettings.componentCreated(oStubEvent);

				oStub.restore();
				oCard.destroy();
				done();
			});

			// Act
			oCard.setManifest(oCardManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}

		QUnit.module("Init");

		QUnit.test("Initialization - ListContent", async function (assert) {
			await testContentInitialization(oManifest_ListCard, assert);
		});

		QUnit.test("Initialization - TableContent", async function (assert) {
			await testContentInitialization(oManifest_TableCard, assert);
		});

		QUnit.test("Empty header", async function (assert) {
			var done = assert.async();

			var oCard = new Card("somecard", {
				manifest: oManifest_ListCard_NoHeader,
				width: "400px",
				height: "600px"
			});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			// Assert
			setTimeout(function () {
				assert.notOk(oCard.getAggregation("_header"), "Card header should not be created.");

				// Cleanup
				oCard.destroy();
				done();
			}, 300);
		});

		QUnit.test("Rendered classes", async function (assert) {
			// Arrange
			var oCard = new Card();

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();

			// Assert
			assert.ok(oCard.$().hasClass("sapUiIntCard"), "Class is added to the root div");

			// Clean up
			oCard.destroy();
		});

		QUnit.test("Attribute data-sap-ui-card-id when sap.app/id is undefined", async function (assert) {
			// Arrange
			var oCard = new Card();

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();

			// Assert
			assert.notOk(oCard.getDomRef().dataset["sapUiCardId"], "Attribute is not there when sap.app/id is not there");

			// Clean up
			oCard.destroy();
		});

		QUnit.test("Attribute data-sap-ui-card-id when sap.app/id is defined", async function (assert) {
			// Arrange
			var oCard = new Card({
				manifest: oManifest_ListCard
			});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);

			// Assert
			assert.strictEqual(oCard.getDomRef().dataset["sapUiCardId"], "my.card.qunit.test.ListCard", "Attribute is correct when sap.app/id is there");

			// Clean up
			oCard.destroy();
		});

		QUnit.test("Attribute data-help-id with sap.app/id", async function (assert) {
			// Arrange
			const oCard = new Card({
				manifest: oManifest_ListCard
			});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);

			// Assert
			assert.strictEqual(oCard.getDomRef().dataset["helpId"], "my.card.qunit.test.ListCard", "Attribute data-help-id is correct");

			// Clean up
			oCard.destroy();
		});

		QUnit.test("Attribute data-help-id with sap.app/id", async function (assert) {
			// Arrange
			const oCard = new Card({
				manifest: oManifest_ListCard
			});

			oCard.data("help-id", "test-host-help-id", true);

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);

			// Assert
			assert.strictEqual(oCard.getDomRef().dataset["helpId"], "test-host-help-id", "Attribute data-help-id is correct");

			// Clean up
			oCard.destroy();
		});

		QUnit.test("Attribute data-help-id with sap.card/configuration/helpId", async function (assert) {
			// Arrange
			const oCard = new Card({
				manifest: {
					"sap.app": {
						"id": "my.card.qunit.test.helpId"
					},
					"sap.card": {
						"type": "List",
						"configuration": {
							"helpId": "test-config-help-id"
						},
						"header": {
							"title": "Test"
						},
						"content": {
							"item": {
								"title": "item1"
							}
						}
					}
				}
			});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);

			// Assert
			assert.strictEqual(oCard.getDomRef().dataset["helpId"], "test-config-help-id", "Attribute data-help-id is correct");

			// Clean up
			oCard.destroy();
		});

		QUnit.test("Card with manifest as object, without baseUrl", async function (assert) {
			// Arrange
			var oCard = new Card({
					manifest: {
						"sap.app": {
							"id": "my.card.qunit.test.NoBaseUrl",
							"i18n": "./i18n/i18n.properties"
						},
						"sap.card": {
							"type": "List",
							"header": {
								"title": "Test No Base URL"
							},
							"content": {
								"item": {
									"title": "item1"
								}
							}
						}
					}
				}),
				fnManifestLoadI18NSpy = sinon.spy(CardManifest.prototype, "loadI18n"),
				fnErrorSpy = sinon.spy(Log, "error");

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);

			// Assert
			assert.ok(fnManifestLoadI18NSpy.called, "Load of translation files is called.");
			assert.ok(fnErrorSpy.notCalled, "There is no error logged for missing base url.");

			// Clean up
			oCard.destroy();
			fnErrorSpy.restore();
		});

		QUnit.test("Register module path for card with manifest as object, without baseUrl", async function (assert) {
			// Arrange
			var oCard = new Card({
					manifest: oManifest_ListCard
				}),
				fnRegisterSpy = sinon.spy(LoaderExtensions, "registerResourcePath");

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);

			// Assert
			assert.ok(fnRegisterSpy.called, "LoaderExtensions.registerResourcePath is called.");
			assert.ok(fnRegisterSpy.calledWith("my/card/qunit/test/ListCard", "/"), "LoaderExtensions.registerResourcePath is called with correct params.");

			// Clean up
			oCard.destroy();
			fnRegisterSpy.restore();
		});

		QUnit.test("Register module path for card with manifest as object, with baseUrl", async function (assert) {
			// Arrange
			var sBaseUrl = "test-resources/sap/ui/integration/qunit/testResources/cardWithTranslations",
				oCard = new Card({
					manifest: oManifest_ListCard,
					baseUrl: sBaseUrl
				}),
				fnRegisterSpy = sinon.spy(LoaderExtensions, "registerResourcePath");

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);

			// Assert
			assert.ok(fnRegisterSpy.called, "LoaderExtensions.registerResourcePath is called.");
			assert.ok(fnRegisterSpy.calledWith("my/card/qunit/test/ListCard", sBaseUrl), "LoaderExtensions.registerResourcePath is called with correct params.");

			// Clean up
			oCard.destroy();
			fnRegisterSpy.restore();
		});

		QUnit.test("Register module path for card with manifest given by URL", async function (assert) {
			// Arrange
			var oCard = new Card({
					manifest: "test-resources/sap/ui/integration/qunit/testResources/cardWithTranslations/manifest.json"
				}),
				fnRegisterSpy = sinon.spy(LoaderExtensions, "registerResourcePath");

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);

			// Assert
			assert.ok(fnRegisterSpy.called, "LoaderExtensions.registerResourcePath is called.");
			assert.ok(fnRegisterSpy.calledWith("my/test/card", "test-resources/sap/ui/integration/qunit/testResources/cardWithTranslations"), "LoaderExtensions.registerResourcePath is called with correct params.");

			// Clean up
			oCard.destroy();
			fnRegisterSpy.restore();
		});

		QUnit.test("Default model is not propagated", async function (assert) {
			// Arrange
			var oContainer = new HBox({
					items: [
						new Card({
							manifest: oManifest_ListCard
						})
					]
				}),
				oModel = new JSONModel({"test": "propagated value"}),
				oCard;

			oContainer.setModel(oModel);

			oCard = oContainer.getItems()[0];

			// Act
			oContainer.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(oCard.getModel().getProperty("/test"), undefined, "Default model is not propagated to the card.");

			// Clean up
			oContainer.destroy();
			oModel.destroy();
		});

		QUnit.test("Severe errors are logged", async function (assert) {
			// Arrange
			var oCard = new Card();

			// Act
			oCard.setManifest({});
			oCard.startManifestProcessing();

			await nextCardReadyEvent(oCard);

			var aErrors = oCard.getSevereErrors();

			// Assert
			assert.ok(aErrors.length, "Error that the section 'sap.card' is missing is logged.");

			// Clean up
			oCard.destroy();
		});

		QUnit.test("Base url in combination with manifest path", async function (assert) {
			// Arrange
			var oCard = new Card({
					manifest: "test-resources/sap/ui/integration/qunit/manifests/manifest.json",
					baseUrl: "http://someurltest/"
				});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(oCard);

			// Assert
			assert.strictEqual(oCard.getRuntimeUrl("/"), "http://someurltest/", "The given baseUrl is used for card base url.");

			// Clean up
			oCard.destroy();
		});

		QUnit.module("Clone");

		QUnit.test("Cloned card has its own models", async function (assert) {
			var oCard = new Card("somecard", {
					manifest: oManifest_ListCard_NoHeader
				}),
				oClonedCard = oCard.clone();

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();

			oClonedCard.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			var aModels = ["parameters", "filters", "paginator", "form", "context"];

			assert.ok(oCard.getModel(), "Default model exists in original card.");
			assert.ok(oClonedCard.getModel(), "Default model exists in cloned card.");
			assert.notStrictEqual(oCard.getModel(), oClonedCard.getModel(), "Default model is unique per card.");

			aModels.forEach(function (sModelName) {
				assert.ok(oCard.getModel(sModelName), "Model '" + sModelName + "' exists in original card.");
				assert.ok(oClonedCard.getModel(sModelName), "Model '" + sModelName + "' exists in cloned card.");
				assert.notStrictEqual(oCard.getModel(sModelName), oClonedCard.getModel(sModelName), "Model '" + sModelName + "' is unique per card.");
			});

			oCard.destroy();
			oClonedCard.destroy();
		});

		QUnit.module("Methods", {
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

		QUnit.test("setManifest - correct and incorrect", async function (assert) {
			var oManifest_WrongType = deepExtend({}, oManifest_ListCard);

			oManifest_WrongType["sap.card"].type = "Wrong";

			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);

			this.oCard.setManifest(oManifest_WrongType);
			await nextCardReadyEvent(this.oCard);

			this.oCard.setManifest(oManifest_ListCard);
			await nextCardReadyEvent(this.oCard);
			// Assert
			assert.ok(true, "Exception is not thrown");
		});

		QUnit.test("setManifest - to undefined and then set again", async function (assert) {
			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			await nextCardReadyEvent(this.oCard);

			// Act - set manifest to undefined
			this.oCard.setManifest(undefined);
			await nextUIUpdate();

			// Act - set correct manifest
			this.oCard.setManifest(oManifest_ListCard);
			await nextUIUpdate();
			await nextCardReadyEvent(this.oCard);

			assert.ok(true, "Manifest can be set correctly second time after it was set to undefined.");
		});

		QUnit.test("createManifest called twice", function (assert) {
			var done = assert.async(),
				oStub = sinon.stub(this.oCard, "_setCardContent").callsFake(function () {
					assert.ok("_setCardContent is called only once and error is not thrown.");

					oStub.restore();

					done();
				});

			this.oCard.createManifest(oManifest_ListCard, "");

			this.oCard._destroyManifest();
			this.oCard.createManifest(oManifest_ListCard, "");
		});

		QUnit.test("Manifest works if it has very deep structure", async function (assert) {
			// Arrange
			var oManifest = {
					"sap.app": {
						"id": "test.card.deepStructure"
					},
					"sap.card": {
						"type": "List",
						"data": {

						}
					}
				},
				iDepth,
				oCurrentLevel = oManifest["sap.card"].data;

			for (iDepth = 0; iDepth < 200; iDepth++) {
				oCurrentLevel.depthTest = {
					level: iDepth
				};

				oCurrentLevel = oCurrentLevel.depthTest;
			}

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardManifestReadyEvent(this.oCard);

			// Assert
			assert.ok(true, "Manifest is set, there is no error.");
		});

		QUnit.test("getManifestRawJson", async function (assert) {
			// Arrange
			var oManifest = oManifest_ListCard;

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.setManifestChanges([
				{ content: { header: { title: "Changed title" } } }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardManifestReadyEvent(this.oCard);

			// Assert
			assert.deepEqual(this.oCard.getManifestRawJson(), oManifest, "Method getManifestRawJson returns the original raw json.");
		});

		QUnit.test("getDataProviderFactory", async function (assert) {
			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardManifestAppliedEvent(this.oCard);

			var oDataProviderFactory = this.oCard.getDataProviderFactory();

			// Assert
			assert.ok(oDataProviderFactory, "Method getDataProviderFactory returns the factory.");
			assert.ok(oDataProviderFactory instanceof DataProviderFactory, "The result is of type sap.ui.integration.util.DataProviderFactory.");
		});

		QUnit.test("getRuntimeUrl when baseUrl is not set", async function (assert) {
			// Arrange
			var oManifest = {
					"sap.app": {
						"id": "sample.card"
					}
				},
				mSamples = new Map([
					["", "/"],
					["some.json", "/some.json"],

					["./", "/./"],
					["./images/Avatar.png", "/./images/Avatar.png"],

					["/", "/"],
					["/some.json", "/some.json"],

					["//some.json", "//some.json"],

					["../some.json", "/../some.json"],

					["http://sap.com", "http://sap.com"],
					["https://sap.com", "https://sap.com"]
				]);


			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardManifestReadyEvent(this.oCard);

			// Assert
			mSamples.forEach((sExpectedResult, sUrl) => {
				var sResult = this.oCard.getRuntimeUrl(sUrl);

				assert.strictEqual(sResult, sExpectedResult, "Result is correct for '" + sUrl + "'.");
			});
		});

		QUnit.test("getRuntimeUrl when baseUrl is set", async function (assert) {
			// Arrange
			var sBaseUrl = "https://sdk.openui5.org",
				oManifest = {
					"sap.app": {
						"id": "sample.card"
					}
				},
				mSamples = new Map([
					["", sBaseUrl + "/"],
					["some.json", sBaseUrl + "/some.json"],

					["./", sBaseUrl + "/./"],
					["./images/Avatar.png", sBaseUrl + "/./images/Avatar.png"],

					["/", sBaseUrl + "/"],
					["/some.json", sBaseUrl + "/some.json"],

					["../some.json", sBaseUrl + "/../some.json"],

					["//some.json", "//some.json"],

					["http://sap.com", "http://sap.com"],
					["https://sap.com", "https://sap.com"]
				]);

			// Act
			this.oCard.setManifest(oManifest);
			this.oCard.setBaseUrl(sBaseUrl);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardManifestReadyEvent(this.oCard);

			// Assert
			mSamples.forEach((sExpectedResult, sUrl) => {
				var sResult = this.oCard.getRuntimeUrl(sUrl);

				assert.strictEqual(sResult, sExpectedResult, "Result is correct for '" + sUrl + "'.");
			});
		});

		QUnit.module("showMessage", {
			beforeEach: async function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("showMessage called on a card without manifest", function (assert) {
			// Arrange
			var oLogSpy = this.spy(Log, "error");

			// Act
			this.oCard.showMessage();

			// Assert
			assert.ok(oLogSpy.calledWith("'showMessage' cannot be used before the card instance is ready. Consider using the event 'manifestApplied' event."), "Error should be logged in the console");
		});

		QUnit.test("showMessage delegates the call to BaseContent once created", async function (assert) {
			var done = assert.async();
			this.stub(BaseContent.prototype, "showMessage")
				.callsFake(function () {
					// Assert
					assert.ok(true, "showMessage of the content should be called");
					done();
				});

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");

			await nextCardManifestAppliedEvent(this.oCard);

			// Act
			this.oCard.showMessage();
		});

		QUnit.test("showMessage creates and adds the message to the DOM", async function (assert) {
			var done = assert.async();

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");

			await nextCardManifestAppliedEvent(this.oCard);

			var oContent = this.oCard.getCardContent();
			var oDelegate = {
				onAfterRendering: function () {
					var oMessageContainer = oContent.getAggregation("_messageContainer");

					// Assert
					assert.ok(oMessageContainer.isA("sap.m.VBox"), "Message container should be created and added aggregated");
					assert.ok(oMessageContainer.getItems()[0].isA("sap.m.MessageStrip"), "_messageContainer has 1 message");
					assert.ok(oMessageContainer.getDomRef(), "Message container is added to the DOM");

					oContent.removeEventDelegate(oDelegate);
					done();
				}
			};

			oContent.addEventDelegate(oDelegate);

			// Act
			this.oCard.showMessage();
		});

		QUnit.test("Message container is destroyed when the message is closed", async function (assert) {
			var done = assert.async();

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");

			await nextCardManifestAppliedEvent(this.oCard);

			var oContent = this.oCard.getCardContent();
			var oDelegate = {
				onAfterRendering: function () {
					var oMessageContainer = oContent.getAggregation("_messageContainer");
					var oMessageContainerDestroySpy = this.spy(oMessageContainer, "destroy");

					// Act
					oMessageContainer.getItems()[0].fireClose();

					// Assert
					assert.ok(oMessageContainerDestroySpy.called, "Message container should be destroyed");

					oContent.removeEventDelegate(oDelegate);
					done();
				}
			};

			oContent.addEventDelegate(oDelegate, this);

			// Act
			this.oCard.showMessage();
		});

		QUnit.test("Multiple calls to showMessage - previous messages are destroyed", async function (assert) {
			var done = assert.async();
			var oMessageStripDestroySpy = this.spy(MessageStrip.prototype, "destroy");

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");

			await nextCardManifestAppliedEvent(this.oCard);

			var oContent = this.oCard.getCardContent();
			var oDelegate = {
				onAfterRendering: function () {
					var oMessageContainer = oContent.getAggregation("_messageContainer");
					var oMessage = oMessageContainer.getItems()[0];

					// Assert
					assert.strictEqual(oMessageStripDestroySpy.callCount, 2, "The previous messages should be destroyed");
					assert.strictEqual(oMessageContainer.getItems().length, 1, "There is only 1 message");
					assert.strictEqual(oMessage.getType(), "Success", "The last given message type is used");
					assert.strictEqual(oMessage.getText(), "Last message", "The last given message is used");

					oContent.removeEventDelegate(oDelegate);
					done();
				}
			};

			oContent.addEventDelegate(oDelegate);

			// Act
			this.oCard.showMessage();
			this.oCard.showMessage();
			this.oCard.showMessage("Last message", MessageType.Success);
		});

		QUnit.test("showMessage text containing expression binding with card formatters", async function (assert) {
			var done = assert.async();

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");

			await nextCardManifestAppliedEvent(this.oCard);

			var oContent = this.oCard.getCardContent();
			var oDelegate = {
				onAfterRendering: function () {
					var oMessageContainer = oContent.getAggregation("_messageContainer");
					var oMessage = oMessageContainer.getItems()[0];

					// Assert
					assert.strictEqual(oMessage.getText(), "My inserted text", "Card formatters should be available inside showMessage");

					oContent.removeEventDelegate(oDelegate);
					done();
				}
			};

			oContent.addEventDelegate(oDelegate);

			// Act
			this.oCard.showMessage("{= format.text('My {0} text', ['inserted'])}", MessageType.Error);
		});

		QUnit.test("Any messages are removed after calling hideMessage", async function (assert) {
			var done = assert.async();

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");

			await nextCardManifestAppliedEvent(this.oCard);

			this.oCard.attachEventOnce("stateChanged", () => {
				this.oCard.attachEventOnce("stateChanged", () => {
					var oContent = this.oCard.getCardContent(),
						oMessageContainer = oContent.getAggregation("_messageContainer"),
						aMessages = oMessageContainer.getItems();

						assert.strictEqual(aMessages.length, 0, "There are no messages after hideMessage().");
						done();
					});
				this.oCard.hideMessage();
			});

			// Act
			this.oCard.showMessage();
		});

		QUnit.module("Footer", {
			beforeEach: function () {
				this.oCard = new Card("somecard", {
					width: "400px",
					height: "600px"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("hidden footer", async function (assert) {
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Card title"
					},
					"footer": {
						"visible": false
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.notOk(this.oCard.getCardFooter().getVisible(), "Card Footer is hidden.");
		});

		QUnit.test("hidden footer with binding", async function (assert) {
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": {
							"footerVisible": false
						}
					},
					"header": {
						"title": "Card title"
					},
					"footer": {
						"visible": "{/footerVisible}"
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.notOk(this.oCard.getCardFooter().getVisible(), "Card Footer is hidden.");
		});

		QUnit.module("Card Accessibility", {
			beforeEach: function () {
				this.oRb = Library.getResourceBundleFor("sap.f");
				this.oCard = new Card("somecard", {
					width: "400px",
					height: "600px",
					dataMode: CardDataMode.Active
				});
				this.oNumericHeaderCard = new Card("numericCard", {
					width: "400px",
					height: "600px",
					dataMode: CardDataMode.Active
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				this.oNumericHeaderCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oNumericHeaderCard.destroy();
				this.oNumericHeaderCard = null;
				this.oRb = null;
			}
		});

		QUnit.test("Generic", async function (assert) {
			this.oCard.setManifest(oManifest_ListCard);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			var oCardDomRef = this.oCard.getDomRef(),
				oHeader = this.oCard.getAggregation("_header"),
				oHeaderDomRef = oHeader.getDomRef(),
				oHeaderFocusDomRef = oHeader.getDomRef("focusable"),
				oHeaderTitleDomRef = oHeaderDomRef.querySelector(".sapFCardTitle"),
				oContentDomRef = document.getElementsByClassName("sapFCardContent")[0],
				sAriaLabelledByIds = this.oCard._ariaText.getId() + " " + oHeader._getTitle().getId() + " " + oHeader._getSubtitle().getId() + " " + oHeader.getId() + "-status" + " " + oHeader.getId() + "-dataTimestamp" + " " + oHeader.getId() + "-ariaAvatarText";

			// Assert Card Container
			assert.strictEqual(oCardDomRef.getAttribute("role"), "region", "Card container should have a role - region");
			assert.strictEqual(oCardDomRef.getAttribute("aria-labelledby"), this.oCard._getAriaLabelledIds(), "Card container should have aria-lebelledby - pointing to the static text '[Type of Card] Card' id and title id");
			assert.notOk(oCardDomRef.hasAttribute("tabindex"), "Card container should NOT have 'tabindex'");

			// Assert Card Header
			assert.notOk(oHeaderDomRef.getAttribute("role"), "Card header should not have a role");
			assert.notOk(oHeaderDomRef.getAttribute("aria-roledescription"), "Card header should not have aria-roledescription");

			// Assert Card Header's focusable element
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER"), "Card header focusable element should have aria-roledescription - Card Header");
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("role"), "group", "Card header focusable element should have a role - group");
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card header's focusable element should have aria-lebelledby - pointing to an element describing the card type, title, subtitle, status text, dataTimestamp and avatar ids if there is one");
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("tabindex"), "0", "Card header's focusable element should have tabindex=0");

			// Assert Card Header Title
			assert.strictEqual(oHeaderTitleDomRef.getAttribute("role"), "heading", "Card header Title should have a role - heading");
			assert.strictEqual(oHeaderTitleDomRef.getAttribute("aria-level"), "3", "Card header Title should have a aria-level - 3");

			// Assert Card Content
			assert.strictEqual(oContentDomRef.getAttribute("role"), "group", "Card content should have a role - group");
			assert.strictEqual(oContentDomRef.getAttribute("aria-labelledby"), this.oCard.getId() + "-ariaContentText", "Card container should have aria-labelledby with the correct id");
			assert.strictEqual(this.oCard.getDomRef("ariaContentText").innerText, this.oRb.getText("ARIA_LABEL_CARD_CONTENT"), "ARIA content hidden text should have the correct value");
		});

		QUnit.test("Generic Interactive", async function (assert) {
			var oManifest_AvatarHeader = {
				"sap.app": {
					"id": "test.card.card8"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"actions": [
							{
								"type": "Navigation",
								"url": "https://www.sap.com"
							}
						],
						"title": "L3 Request list content Card",
						"subTitle": "Card subtitle",
						"icon": {
							"initials": "AJ",
							"shape": "Circle",
							"alt": "Some alternative text", // Will be ignored as its not present in the Avatar control atm.
							"color": "#FF0000" // Will be ignored as its not present in the Avatar control atm.
						},
						"status": {
							"text": "100 of 200"
						}
					}
				}
			};
			this.oCard.setManifest(oManifest_AvatarHeader);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			var oHeader = this.oCard.getAggregation("_header"),
				oHeaderFocusDomRef = oHeader.getDomRef("focusable"),
				sAriaLabelledByIds = this.oCard._ariaText.getId() + " " + oHeader._getTitle().getId() + " " + oHeader._getSubtitle().getId() + " " + oHeader.getId() + "-status" + " " + oHeader.getId() + "-ariaAvatarText";

			// Assert Card Header
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("role"), "button", "Card header focusable element should have a role - button");
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER"), "Card header focusable element should have aria-roledescription - Card Header");
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card header's focusable element should have aria-lebelledby - pointing to an element describing the card type, title, subtitle, status text and avatar ids if there is one");
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("tabindex"), "0", "Card header's focusable element should have tabindex=0");
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("role"), "button", "Card header's focusable element should have role=button");
		});

		QUnit.test("Generic when card has dataMode is set to 'Inactive'", async function (assert) {
			this.oCard.setDataMode(CardDataMode.Inactive);
			this.oCard.setManifest(oManifest_ListCard);

			await nextUIUpdate();

			const oCardDomRef = this.oCard.getDomRef();

			// Assert
			assert.strictEqual(oCardDomRef.getAttribute("tabindex"), "0", "Card container should have 'tabindex'");

			// Act
			this.oCard.focus();

			// Assert
			assert.strictEqual(document.activeElement, oCardDomRef);

			// Act
			this.oCard.setDataMode(CardDataMode.Active);
			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.notOk(oCardDomRef.hasAttribute("tabindex"), "Card container should NOT have 'tabindex'");
			assert.strictEqual(document.activeElement, this.oCard.getCardHeader().getFocusDomRef(), "Active element has been changed correctly after data mode change");
		});

		QUnit.test("Numeric Header", async function (assert) {
			var oManifest_NumericHeader = {
				"sap.app": {
					"id": "test.card.card9"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"type": "Numeric",
						"data": {
							"json": {
								"n": "56",
								"u": "%",
								"trend": "Up",
								"valueColor": "Good"
							}
						},
						"title": "Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation ",
						"subTitle": "Forecasted goal achievement depending on business logic and other important information Forecasted goal achievement depending on business logic and other important information",
						"unitOfMeasurement": "EUR",
						"mainIndicator": {
							"number": "{n}",
							"unit": "{u}",
							"trend": "{trend}",
							"state": "{valueColor}"
						},
						"dataTimestamp": "2021-03-18T12:00:00Z",
						"details": "Details, additional information, will directly truncate after there is no more space.Details, additional information, will directly truncate after there is no more space.",
						"sideIndicators": [
							{
								"title": "Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target",
								"number": "3252.234",
								"unit": "K"
							},
							{
								"title": "Long Deviation Long Deviation",
								"number": "22.43",
								"unit": "%"
							}
						]
					}
				}
			};

			this.oNumericHeaderCard.setManifest(oManifest_NumericHeader);

			await nextCardReadyEvent(this.oNumericHeaderCard);
			await nextUIUpdate();

			var oHeader = this.oNumericHeaderCard.getAggregation("_header");
			oHeader.setStatusText("3 of 5");

			await nextUIUpdate();

			var oHeaderFocusDomRef = oHeader.getDomRef("focusable"),
				sAriaLabelledByIds = this.oNumericHeaderCard._ariaText.getId() + " " +
									oHeader._getTitle().getId() + " " +
									oHeader._getSubtitle().getId() + " " +
									oHeader.getId() + "-status" + " " +
									oHeader.getId() + "-dataTimestamp" + " " +
									oHeader._getUnitOfMeasurement().getId() + " " +
									oHeader.getAggregation("_numericIndicators").getAggregation("_mainIndicator").getId() + " " +
									oHeader._getSideIndicatorIds() + " " +
									oHeader._getDetails().getId();

			assert.strictEqual(oHeaderFocusDomRef.getAttribute("role"), "group", "Card header focusable element should have a role - group");
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER"), "Card header focusable element should have aria-roledescription - Card Header");
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card header's focusable element should have aria-lebelledby - pointing to an element describing the card type, title, subtitle, status text, dataTimestamp and avatar ids if there is one");
			assert.strictEqual(oHeaderFocusDomRef.getAttribute("tabindex"), "0", "Card header should have tabindex=0");
		});

		QUnit.module("Error handling", {
			beforeEach: function () {
				this.oCard = new Card({
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
				});
				this.oRb = Library.getResourceBundleFor("sap.ui.integration");
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oRb = null;
			}
		});

		QUnit.test("Handler call", async function (assert) {
			// Arrange
			var oLogSpy = sinon.spy(Log, "error"),
				mErrorInfo = {
					title: "Log this error in the console."
				};

			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.setDataMode(CardDataMode.Active);
			await nextUIUpdate();

			// Act
			this.oCard._handleError(mErrorInfo);
			await nextUIUpdate();

			// Assert
			assert.ok(oLogSpy.calledWith(mErrorInfo.title), "Provided message should be logged to the console.");

			// Clean up
			oLogSpy.restore();
		});

		QUnit.test("In a card with no content, the error is rendered in the header", async function (assert) {
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.card16",
					"type": "card"
				},
				"sap.card": {
					"type": "Object",
					"header": {
						"title": "Header Title",
						"data": {
							"request": {
								"url": "fake-url"
							}
						}
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oHeaderDomRef = this.oCard.getCardHeader().getDomRef();

			// Assert
			assert.ok(oHeaderDomRef.querySelector(".sapUiIntBlockingMsg"), "error element is rendered in the header");
		});

		QUnit.test("Height of the Card should not change when error message is shown", async function (assert) {
			this.oCard.setManifest(oManifest_List_Simple);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var initialContentWrapperHeight = this.oCard.getDomRef("contentSection").offsetHeight;
			var initialContentHeight = this.oCard.getCardContent().getDomRef().offsetHeight;
			var EPS = 2;

			// Act
			this.oCard._handleError({
				title: "No new products",
				description: "Please review later",
				size: "Auto"
			});
			await nextUIUpdate();

			var oErrorMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");
			var currentContentWrapperHeight = this.oCard.getDomRef("contentSection").offsetHeight;
			var currentContentHeight = this.oCard.getCardContent().getDomRef().offsetHeight;

			// Assert
			assert.strictEqual(initialContentHeight + "px", oErrorMessage.getHeight(), "Height of the card error message is set correctly");
			assert.ok(initialContentWrapperHeight - currentContentWrapperHeight <= EPS, "Height of the card content wrapper is not changed");
			assert.ok(initialContentHeight - currentContentHeight <= EPS, "Height of the card content is not changed (Card error message is with the same height as the card before the error)");
		});


		QUnit.test("Card configuration error", async function (assert) {
			// Arrange
			var oLogSpy = this.spy(Log, "error");
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.bindingSyntax"
				},
				"sap.card": {
					"type": "ListD",
					"header": {},
					"content": {
						"item": { }
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var isMessageCorrect = oLogSpy.firstCall.args[1] ? oLogSpy.firstCall.args[1].message.includes("LISTD") : false;
			assert.ok(isMessageCorrect, "Error message with correct details should be logged");

			// Clean up
			oLogSpy.restore();
		});


		QUnit.module("No Data", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oRb = Library.getResourceBundleFor("sap.ui.integration");
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oRb = null;
			}
		});

		QUnit.test("IllustratedMessage should be set by developer", async function (assert) {
			// Act
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.NoData"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"messages": {
							"noData": {
								"type": "NoEntries",
								"title": "No new products",
								"description": "Please review later",
								"size": "Auto"
							}
						}
					},
					"header": {},
					"content": {
						"item": {
							"title": ""
						}
					},
					"data": {
						"json": []
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");

			// Assert
			assert.strictEqual(oMessage.getIllustrationType(), IllustratedMessageType.NoEntries, "The message type set by developer is correct");
			assert.strictEqual(oMessage.getIllustrationSize(), IllustratedMessageSize.Auto, "The message size set by developer is correct");
			assert.strictEqual(oMessage.getTitle(), "No new products", "The message title set by developer is correct");
			assert.strictEqual(oMessage.getDescription(), "Please review later", "The message description set by developer is correct");
		});

		QUnit.test("Default IllustratedMessage in no data scenario - List Card", async function (assert) {
			// Act
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.NoData"
				},
				"sap.card": {
					"type": "List",
					"header": {},
					"content": {
						"item": {
							"title": ""
						}
					},
					"data": {
						"json": []
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");

			// Assert
			assert.strictEqual(oMessage.getIllustrationType(), IllustratedMessageType.NoEntries, "Default message type is used for list");
			assert.strictEqual(oMessage.getTitle(), this.oRb.getText("CARD_NO_ITEMS_ERROR_LISTS"), "Correct message is displayed");
		});

		QUnit.test("Default IllustratedMessage in no data scenario - Table Card", async function (assert) {
			// Act
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.NoData"
				},
				"sap.card": {
					"type": "Table",
					"header": {},
					"content": {
						"row": {
							"columns": [
								{
									"title": "Customer",
									"value": "{customerName}"
								}
							]
						}
					},
					"data": {
						"json": []
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");

			// Assert
			assert.strictEqual(oMessage.getIllustrationType(), IllustratedMessageType.NoEntries, "Illustrated message type should be no data for Table Card");
			assert.strictEqual(oMessage.getTitle(), this.oRb.getText("CARD_NO_ITEMS_ERROR_LISTS"), "Correct message is displayed");
		});

		QUnit.test("Default IllustratedMessage in no data scenario - Object Card", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_No_Data_Object);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oMessage = this.oCard.getCardContent().getAggregation("_blockingMessage");

			// Assert
			assert.strictEqual(oMessage.getIllustrationType(), IllustratedMessageType.NoData, "Illustrated message type should be no data for Object Card");
			assert.strictEqual(oMessage.getTitle(), this.oRb.getText("CARD_NO_ITEMS_ERROR_CHART"), "Correct message is displayed");
		});

		QUnit.module("Component Card");

		QUnit.test("Card and component manifests are in the same file", function (assert) {
			testComponentContentCreation(
				oManifest_ComponentCardAllInOne,
				oManifest_ComponentCardAllInOne,
				assert
			);
		});

		QUnit.test("Controller must have access to the card during onInit", async function (assert) {
			// Arrange
			var oCard = new Card();

			oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/component/cardAccess/manifest.json");
			oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(oCard);
			await nextUIUpdate();

			var oContent = oCard.getCardContent();

			// Assert
			assert.strictEqual(oContent.$().find(".sapMText").text(), "Berlin", "Controller has access to card parameters during onInit.");

			// Clean up
			oCard.destroy();
		});

		QUnit.module("Refreshing", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oManifest = {
					"sap.app": {
						"id": "test.card.refreshing.card1"
					},
					"sap.card": {
						"type": "List",
						"content": {
							"data": {
								"json": [
									{ "Name": "Product 1" },
									{ "Name": "Product 2" },
									{ "Name": "Product 3" }
								]
							},
							"item": {
								"title": "{Name}"
							}
						}
					}
				};
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oManifest = null;
			}
		});

		QUnit.test("Refreshing card state", async function (assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest(this.oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Act
			this.oCard.refresh();

			await nextCardReadyEvent(this.oCard);

			// Assert
			assert.ok(true, "Should have fired _ready event after refresh.");
		});

		QUnit.module("Refreshing data", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Inner level data", async function (assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.refreshing.card1"
				},
				"sap.card": {
					"configuration": {
						"filters": {
							"f1": {
								"data": {
									"json": [
										{ "Name": "Product 1" }
									]
								}
							},
							"f2": {
								"data": {
									"json": [
										{ "Name": "Product 1" }
									]
								}
							}
						}
					},
					"type": "List",
					"header": {
						"title": "L3 Request list content Card",
						"data": {
							"json": [
								{ "Name": "Product 1" }
							]
						}
					},
					"content": {
						"data": {
							"json": [
								{ "Name": "Product 1" },
								{ "Name": "Product 2" },
								{ "Name": "Product 3" }
							]
						},
						"item": {
							"title": "{Name}"
						}
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContentSpy = sinon.spy(BaseContent.prototype, "refreshData"),
			oHeaderSpy = sinon.spy(Header.prototype, "refreshData"),
			oFilterSpy = sinon.spy(Filter.prototype, "refreshData"),
			oDataProviderSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

			await nextUIUpdate();
			this.oCard.refreshData();
			assert.ok(oContentSpy.called, "content refreshData method is called");
			assert.ok(oHeaderSpy.called, "header refreshData method is called");
			assert.strictEqual(oFilterSpy.callCount, 2, "filter refreshData method is called twice");
			assert.strictEqual(oDataProviderSpy.callCount, 4, "dataprovider triggerDataUpdate method is called 4 times");

			oContentSpy.restore();
			oHeaderSpy.restore();
			oFilterSpy.restore();
			oDataProviderSpy.restore();
		});

		QUnit.test("Root(card) level data", async function (assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.refreshing.card1"
				},
				"sap.card": {
					"data": {
						"json": [
							{ "Name": "Product 1" }
						]
					},
					"configuration": {
						"filters": {
							"f1": {

							},
							"f2": {

							}
						}
					},
					"type": "List",
					"header": {
						"title": "L3 Request list content Card"
					},
					"content": {
						"item": {
							"title": "{Name}"
						}
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContentSpy = sinon.spy(BaseContent.prototype, "refreshData"),
				oHeaderSpy = sinon.spy(Header.prototype, "refreshData"),
				oFilterSpy = sinon.spy(Filter.prototype, "refreshData"),
				oDataProviderSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

			await nextUIUpdate();

			this.oCard.refreshData();
			assert.ok(oContentSpy.called, "content refreshData method is called");
			assert.ok(oHeaderSpy.called, "header refreshData method is called");
			assert.strictEqual(oFilterSpy.callCount, 2, "filter refreshData method is called twice");
			assert.strictEqual(oDataProviderSpy.callCount, 1, "dataprovider triggerDataUpdate method is called once");

			oContentSpy.restore();
			oHeaderSpy.restore();
			oFilterSpy.restore();
			oDataProviderSpy.restore();
		});

		QUnit.test("No data", async function (assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.refreshing.card1"
				},
				"sap.card": {
					"configuration": {
						"filters": {
							"f1": {

							},
							"f2": {

							}
						}
					},
					"type": "List",
					"header": {
						"title": "L3 Request list content Card"
					},
					"content": {
						"item": {
							"title": "{Name}"
						}
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContentSpy = sinon.spy(BaseContent.prototype, "refreshData"),
				oHeaderSpy = sinon.spy(Header.prototype, "refreshData"),
				oFilterSpy = sinon.spy(Filter.prototype, "refreshData"),
				oDataProviderSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

			await nextUIUpdate();
			this.oCard.refreshData();

			assert.ok(oContentSpy.called, "content refreshData method is called");
			assert.ok(oHeaderSpy.called, "header refreshData method is called");
			assert.strictEqual(oFilterSpy.callCount, 2, "filter refreshData method is called twice");
			assert.ok(oDataProviderSpy.notCalled, "dataprovider triggerDataUpdate method is not called");

			oContentSpy.restore();
			oHeaderSpy.restore();
			oFilterSpy.restore();
			oDataProviderSpy.restore();
		});

		QUnit.test("Not ready", function (assert) {
			var bTypeError = false;

			try {
				this.oCard.placeAt(DOM_RENDER_LOCATION);
				this.oCard.setManifest({
					"sap.app": {
						"id": "test.card.refreshing.card1"
					},
					"sap.card": {
						"configuration": {
							"filters": {
								"f1": {

								},
								"f2": {

								}
							}
						},
						"type": "List",
						"header": {
							"title": "L3 Request list content Card"
						},
						"content": {
							"item": {
								"title": "{Name}"
							}
						}
					}
				});
				this.oCard.refreshData();
			} catch (error) {
				bTypeError = true;
			}

			assert.ok(!bTypeError, "There is no error"); // BCP 2280081647
		});

		QUnit.module("Refreshing data - invalid response", {
			beforeEach: function () {
				this.oServer = sinon.fakeServer.create();
				this.oServer.autoRespond = true;
				this.oServer.xhr.useFilters = true;
				this.oServer.xhr.addFilter(function (method, url) {
					return !url.startsWith("/GetSales");
				});

				this.bError = true;

				// Endpoints
				this.oServer.respondWith("/GetSalesSuccess", function (xhr) {

					var iResult = 500;
					var mResponseJSON = "";

					if (!this.bError) {
						iResult = 200;
						mResponseJSON = {items: [{title: "Title 1"}]};
					}

					this.bError = !this.bError;

					xhr.respond(iResult, {"Content-Type": "application/json"}, JSON.stringify(mResponseJSON));
				}.bind(this));

				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;

				this.oServer.reset();
				this.oServer = null;
			}
		});

		QUnit.test("Initially invalid response, valid second response", async function (assert) {
			// Arrange
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.refreshing.card1"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Sales Report"
					},
					"content": {
						"data": {
							"request": {
								"url": "/GetSalesSuccess"
							},
							"path": "/items"
						},
						"item": {
							"title": "{title}"
						},
						"maxItems": "5"
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oError = this.oCard.getCardContent().getAggregation("_blockingMessage");
			assert.ok(oError.isA("sap.ui.integration.controls.BlockingMessage"), "Error is displayed.");

			this.oCard.refreshData();

			await nextCardContentReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent();
			assert.ok(oContent.isA("sap.ui.integration.cards.BaseContent"), "Content is displayed correctly.");
		});

		QUnit.module("Event stateChanged", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Event stateChanged is fired on refreshData", function (assert) {
			var done = assert.async(),
				oHost = new Host();

			assert.expect(4);

			this.oCard.setHost(oHost);

			this.oCard.attachEventOnce("stateChanged", () => {
				assert.ok(true, "stateChanged is called on card ready");

				this.oCard.attachEventOnce("stateChanged", function () {
					assert.ok(true, "stateChanged is called after data refresh");
				});
			});

			oHost.attachEventOnce("cardStateChanged", () => {
				assert.ok(true, "cardStateChanged for host is called on card ready");

				oHost.attachEventOnce("cardStateChanged", function () {
					assert.ok(true, "cardStateChanged for host is called after data refresh");

					// Clean up
					oHost.destroy();
					done();
				});

				// Act
				this.oCard.refreshData();
			});

			// Act
			this.oCard.setBaseUrl("/test-resources/sap/ui/integration/qunit/testResources/");
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.stateChanged"
				},
				"sap.card": {
					"type": "List",
					"content": {
						"data": {
							"request": {
								"url": "items.json"
							}
						},
						"item": {
							"title": "{Name}"
						}
					}
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Event stateChanged is fired only once", async function (assert) {
			var done = assert.async(),
				iStateChangedCounter = 0;

			// Act
			this.oCard.setBaseUrl("/test-resources/sap/ui/integration/qunit/testResources/");
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.stateChanged2"
				},
				"sap.card": {
					"type": "Object",
					"header": {
						"title": "Test state changed"
					}
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			this.oCard.attachStateChanged(function () {
				iStateChangedCounter++;
			});

			this.oCard.scheduleFireStateChanged();
			this.oCard.scheduleFireStateChanged();

			setTimeout(function () {
				assert.strictEqual(iStateChangedCounter, 1, "Event stateChanged is fired only once.");
				done();
			}, 100);
		});

		QUnit.module("Data mode", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oManifest = {
					"sap.app": {
						"id": "test.card.dataMode.card1"
					},
					"sap.card": {
						"type": "List",
						"content": {
							"data": {
								"json": [
									{ "Name": "Product 1" },
									{ "Name": "Product 2" },
									{ "Name": "Product 3" }
								]
							},
							"item": {
								"title": "{Name}"
							}
						}
					}
				};
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oManifest = null;
			}
		});

		QUnit.test("Set data mode", async function (assert) {
			var oApplyManifestSpy = sinon.spy(Card.prototype, "_applyManifestSettings");

			this.oCard.setManifest(this.oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);

			// Assert
			assert.ok(oApplyManifestSpy.calledOnce, "Card with default 'Auto' state should try to apply the manifest settings.");

			// Act
			oApplyManifestSpy.reset();
			this.oCard.setDataMode(CardDataMode.Inactive);

			// Assert
			assert.ok(oApplyManifestSpy.notCalled, "Card with 'Inactive' state should NOT try to apply the manifest settings.");

			// Act
			oApplyManifestSpy.reset();
			this.oCard.setDataMode(CardDataMode.Active);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(oApplyManifestSpy.calledOnce, "Should call refresh when turning to 'Active' mode.");

			// Cleanup
			oApplyManifestSpy.restore();
		});

		QUnit.module("Card manifest - URL", {
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

		QUnit.test("Card manifest set through url", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(true, "Should have fired _ready event.");
		});

		QUnit.module("Header counter", {
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

		QUnit.test("Formatting with self translation", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsOwnCounter/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oHeader = this.oCard.getCardHeader();

			// Assert
			assert.equal(oHeader.getStatusText(), "2 of 115", "Should have correctly formatted and translated counter.");
		});

		QUnit.test("Formatting with custom translation", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsCustomCounter/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oHeader = this.oCard.getCardHeader();

			// Assert
			assert.equal(oHeader.getStatusText(), "2 of custom 115", "Should have correctly formatted and translated counter.");
		});

		QUnit.test("Formatting with self translation and no custom translation", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsOwnCounter/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oHeader = this.oCard.getCardHeader();

			// Assert
			assert.equal(oHeader.getStatusText(), "2 of 115", "Should have correctly formatted and translated counter.");
		});

		QUnit.module("Events", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("'manifestReady' event is fired.", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachManifestReady(function () {
				// Assert
				assert.ok(true, "Should have fired 'manifestReady' event.");
				done();
			});

			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("getManifestEntry after 'manifestReady' event is fired.", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardManifestReadyEvent(this.oCard);

			// Assert
			assert.deepEqual(this.oCard.getManifestEntry("/"), oManifest_ListCard, "getManifestEntry returns correct result for '/'");
			assert.deepEqual(this.oCard.getManifestEntry("/sap.card"), oManifest_ListCard["sap.card"], "getManifestEntry returns correct result for '/sap.card'");
			assert.strictEqual(this.oCard.getManifestEntry("/sap.card/header/title"), oManifest_ListCard["sap.card"]["header"]["title"], "getManifestEntry returns correct result for '/sap.card/header/title'");
		});

		QUnit.test("'manifestApplied' event is fired.", async function (assert) {
			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardManifestAppliedEvent(this.oCard);

			// Assert
			assert.ok(true, "Event 'manifestApplied' is fired.");
		});

		QUnit.module("Property 'manifestChanges'", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Change title with manifestChanges", async function (assert) {
			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ content: { header: { title: "My new title 1" } } },
				{ content: { header: { title: "My new title 2" } } }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(this.oCard.getAggregation("_header").getTitle(), "My new title 2", "The title is changed");
		});

		QUnit.test("Change title with manifestChanges with path syntax", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ "/sap.card/header/title": "My new title 1" },
				{ "/sap.card/header/title": "My new title 2" }

			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(this.oCard.getAggregation("_header").getTitle(), "My new title 2", "The title is changed");
		});

		QUnit.test("Change title with manifestChanges with mixed syntax, last path syntax", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ "/sap.card/header/title": "My new title 1" },
				{ content: { header: { title: "My new title 2" } } },
				{ content: { header: { title: "My new title 3" } } },
				{ "/sap.card/header/title": "My new title 4" }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(this.oCard.getAggregation("_header").getTitle(), "My new title 4", "The title is changed");
		});

		QUnit.test("Change title with manifestChanges with mixed syntax, last content syntax", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ "/sap.card/header/title": "My new title 1" },
				{ content: { header: { title: "My new title 2" } } },
				{ "/sap.card/header/title": "My new title 3" },
				{ content: { header: { title: "My new title 4" } } }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(this.oCard.getAggregation("_header").getTitle(), "My new title 4", "The title is changed");
		});

		QUnit.test("Check getManifestWithMergedChanges", async function (assert) {
			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ content: { header: { title: "Test title" } } }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			var oMergedManifest = this.oCard.getManifestWithMergedChanges();
			assert.strictEqual(oMergedManifest["sap.card"]["header"]["title"], "Test title", "The manifest contains the given changes.");
		});

		QUnit.test("Check getManifestWithMergedChanges with path syntax", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ "/sap.card/header/title": "Test title" }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			var oMergedManifest = this.oCard.getManifestWithMergedChanges();
			assert.strictEqual(oMergedManifest["sap.card"]["header"]["title"], "Test title", "The manifest contains the given changes.");
		});

		QUnit.module("Style classes", {
			beforeEach: async function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("'sapUiIntCardAnalytical' is added only when the type is 'Analytical'", async function (assert) {
			// Arrange
			var oAnalyticalManifest = {
					"sap.app": {
						"id": "someId"
					},
					"sap.card": {
						"type": "Analytical"
					}
				},
				oTableManifest = {
					"sap.app": {
						"id": "someId"
					},
					"sap.card": {
						"type": "Table"
					}
				};

			this.oCard.setManifest(oAnalyticalManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(this.oCard.$().hasClass("sapUiIntCardAnalytical"), "'sapUiIntCardAnalytical' class should be set.");

			// Act
			this.oCard.setManifest(oTableManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.notOk(this.oCard.$().hasClass("sapUiIntCardAnalytical"), "'sapUiIntCardAnalytical' class should NOT be set.");
		});

		QUnit.module("Badge", {
			beforeEach: function () {
				this.oCard = new Card({
					customData: [
						new BadgeCustomData({
							value: "New"
						})
					],
					width: "400px",
					height: "600px"
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Rendering", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var $badgeIndicator = this.oCard.$().find(".sapMBadgeIndicator");

			// Assert
			assert.strictEqual(this.oCard.$().find(".sapMBadgeIndicator").attr("data-badge"), "New", "Badge indicator is correctly rendered");
			assert.strictEqual($badgeIndicator.attr("aria-label"), "New", "Badge aria-label correctly rendered");
			assert.ok(this.oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf($badgeIndicator.attr('id')) > -1, "aria-labelledby contains the badge indicator id");
		});

		QUnit.test("Auto hide", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			this.clock = sinon.useFakeTimers();
			var $badgeIndicator = this.oCard.$().find(".sapMBadgeIndicator");

			// Assert
			assert.ok(this.oCard.$().find(".sapMBadgeIndicator").attr("data-badge"), "Badge indicator is rendered");

			this.oCard.focus();

			this.clock.tick(4000);

			assert.equal(this.oCard._isBadgeAttached, false, "Badge indicator is not rendered");
			assert.notOk($badgeIndicator.attr("aria-label"), "Badge aria-label is removed");
			assert.ok(this.oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf($badgeIndicator.attr('id')) === -1, "aria-labelledby does not contain the badge indicator id");

			this.oCard.addCustomData(new BadgeCustomData({value: "New"}));
			await nextUIUpdate(this.clock);

			$badgeIndicator = this.oCard.$().find(".sapMBadgeIndicator");

			// Assert
			assert.ok(this.oCard.$().find(".sapMBadgeIndicator").attr("data-badge"), "Badge indicator is rendered");

			this.oCard.onsapenter();
			assert.equal(this.oCard._isBadgeAttached, false, "Badge indicator is not rendered");

			this.clock.restore();
		});

		QUnit.module("Translations", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("I18n module is initialized with integration library resource bundle", function (assert) {
			var oModel;

			// Arrange
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			// Assert
			oModel = this.oCard.getModel("i18n");
			assert.strictEqual(oModel.getResourceBundle(), Library.getResourceBundleFor("sap.ui.integration"), "The i18n model of the card is correctly initialized.");
		});

		QUnit.test("Integration library resource bundle is not enhanced", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslations/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			var oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");
			assert.ok(oResourceBundle.aCustomBundles.length === 0, "The resource bundle for integration library is not enhanced.");
		});

		QUnit.test("I18n module is isolated", function (assert) {
			var oContainer = new HBox(),
				oModel;

			// Arrange
			oContainer.setModel(new JSONModel(), "i18n");
			oContainer.addItem(this.oCard);

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			oContainer.placeAt(DOM_RENDER_LOCATION);

			// Assert
			oModel = this.oCard.getModel("i18n");

			assert.ok(oModel.isA("sap.ui.model.resource.ResourceModel"), "The i18n model of the card is ResourceModel.");

			// Clean up
			oContainer.destroy();
		});

		QUnit.test("Card translations work", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslations/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(this.oCard.getCardHeader().getTitle(), "Card Translation Bundle", "The translation for title is correct.");
		});

		QUnit.test("Use getTranslatedText", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsCustomCounter/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(this.oCard.getTranslatedText("SUBTITLE"), "Some subtitle", "The translation for SUBTITLE is correct.");
			assert.strictEqual(this.oCard.getTranslatedText("COUNT_X_OF_Y", [3, 5]), "3 of custom 5", "The translation for COUNT_X_OF_Y is correct.");
		});

		QUnit.test("Refresh reloads translations correctly", async function (assert) {
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsOwnCounter/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			this.oCard.refresh();

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.strictEqual(this.oCard.getTranslatedText("SUBTITLE"), "Some subtitle", "The translation for SUBTITLE is correct.");
			assert.strictEqual(this.oCard.getTranslatedText("CARD.COUNT_X_OF_Y", [3, 5]), "3 of 5", "The translation for COUNT_X_OF_Y is correct.");
		});

		QUnit.module("Size", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Content height is not bigger than container height", async function (assert) {
			this.oCard.setWidth("400px");
			this.oCard.setHeight("200px");

			// Act
			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent(),
				iHeight = oContent.getDomRef().getBoundingClientRect().height;

			// Assert
			assert.ok(iHeight < 200, "The height of the content is not larger than the height of the container.");
		});

		QUnit.test("List Content height doesn't decrease after data is changed", async function (assert) {
			// Arrange
			var oServer = sinon.createFakeServer({
					autoRespond: true,
					respondImmediately: true
				}),
				bFirstCall = true,
				fFirstHeight;

			oServer.respondWith("GET", /fakeService\/getProducts/, function (oXhr) {
				if (bFirstCall) {
					bFirstCall = false;
					oXhr.respond(200, { "Content-Type": "application/json"}, JSON.stringify([{}, {}, {}, {}, {}, {}]));
				} else {
					oXhr.respond(200, { "Content-Type": "application/json"}, JSON.stringify([{}, {}, {}]));
				}
			});


			this.oCard.setManifest({
				"sap.app": {
					"id": "my.card.qunit.test.ListCard"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"request": {
							"url": "fakeService/getProducts"
						}
					},
					"header": {
						"title": "Header"
					},
					"content": {

						"item": {
							"title": "Item",
							"description": "Description"
						}
					}
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			fFirstHeight = this.oCard.getCardContent().getDomRef().getBoundingClientRect().height;

			// Assert
			assert.ok(fFirstHeight > 0, "The height of the content should be bigger than 0.");

			// Act
			this.oCard.refreshData();

			await nextCardDataReadyEvent(this.oCard);
			await nextUIUpdate();

			var iHeight = this.oCard.getCardContent().getDomRef().getBoundingClientRect().height;

			// Assert
			assert.ok(iHeight >= fFirstHeight, "The height of the content has shrunk. It is: " + iHeight + ", was: " + fFirstHeight);

			// Clean up
			oServer.restore();
		});

		QUnit.test("Content height doesn't decrease after data is changed", async function (assert) {
			// Arrange
			var oServer = sinon.createFakeServer({
					autoRespond: true,
					respondImmediately: true
				}),
				bFirstCall = true,
				fFirstHeight;

			oServer.respondWith("GET", /fakeService\/getProducts/, function (oXhr) {
				if (bFirstCall) {
					bFirstCall = false;
					oXhr.respond(200, { "Content-Type": "application/json"}, JSON.stringify([{}, {}, {}, {}, {}, {}]));
				} else {
					oXhr.respond(200, { "Content-Type": "application/json"}, JSON.stringify([{}, {}, {}]));
				}
			});

			// Act
			this.oCard.setManifest({
				"sap.app": {
					"id": "my.card.qunit.test.ListCard"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"request": {
							"url": "fakeService/getProducts"
						}
					},
					"header": {
						"title": "Header"
					},
					"content": {
						"minItems": 1,
						"maxItems": 6,
						"item": {
							"title": "Item",
							"description": "Description"
						}
					}
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			fFirstHeight = this.oCard.getCardContent().getDomRef().getBoundingClientRect().height;

			// Assert
			assert.ok(fFirstHeight > 0, "The height of the content should be bigger than 0.");

			// Act
			this.oCard.refreshData();

			await nextCardDataReadyEvent(this.oCard);
			await nextUIUpdate();

			var iHeight = this.oCard.getCardContent().getDomRef().getBoundingClientRect().height;

			// Assert
			assert.strictEqual(iHeight, fFirstHeight, "The height of the content did not decrease.");

			// Clean up
			oServer.restore();
		});

		QUnit.module("Card without rendering", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Full manifest processing is done by calling the method 'startManifestProcessing'", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.startManifestProcessing();

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var aItems = this.oCard.getCardContent().getInnerList().getItems();

			// Assert
			assert.ok(true, "Card processing was done even without rendering.");
			assert.strictEqual(aItems.length, 8, "The content has 8 items in its aggregation.");
		});

		QUnit.module("Destroy", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Destroy card while manifest is loading", async function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/listCard.manifest.json");
			this.oCard.setDataMode(CardDataMode.Active);
			await nextUIUpdate();

			assert.ok(this.oCard._oCardManifest, "There is Manifest instance");
			var oSpy = sinon.spy(this.oCard._oCardManifest, "loadDependenciesAndIncludes");

			// Act
			this.oCard.destroy();

			setTimeout(function () {
				// Assert
				assert.ok(oSpy.notCalled, "Method is not called if the card is destroyed");

				oSpy.restore();
				done();
			}, 500);
		});

		QUnit.module("Custom Models", {
			beforeEach: function () {
				this.oCard = new Card({
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources"
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("List items can be set through custom model", async function (assert) {
			// Act
			this.oCard.setManifest(oManifest_CustomModels);
			this.oCard.startManifestProcessing();

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var aItems;

			this.oCard.getModel("cities").setData({
				items: [
					{name: "City 1"},
					{name: "City 2"}
				]
			});

			await nextUIUpdate();

			aItems = this.oCard.getCardContent().getInnerList().getItems();

			// Assert
			assert.strictEqual(aItems.length, 2, "There are two items rendered from the custom model.");
		});

		QUnit.test("Registering custom models on multiple calls to setManifest", async function (assert) {
			// Arrange
			var fnErrorLogSpy = sinon.spy(Log, "error");

			// Act
			this.oCard.setManifest(oManifest_CustomModels);
			this.oCard.startManifestProcessing();

			await nextCardReadyEvent(this.oCard);

			var fnModelDestroySpy = sinon.spy(this.oCard.getModel("cities"), "destroy");

			// Act
			this.oCard.setManifest(oManifest_CustomModels);
			this.oCard.startManifestProcessing();

			await nextCardReadyEvent(this.oCard);

			// Assert - after second setManifest
			assert.ok(fnModelDestroySpy.calledOnce, "Destroy was called for the custom model on second setManifest.");
			assert.strictEqual(this.oCard._aCustomModels.length, 1, "Custom model is registered only once.");
			assert.notOk(fnErrorLogSpy.called, "There is no error logged for duplicate custom model names.");

			this.oCard.destroy();
			await nextUIUpdate();

			assert.ok(true, "Card can be successfully destroyed after multiple calls to setManifest.");

			// Clean up
			fnModelDestroySpy.restore();
			fnErrorLogSpy.restore();
		});

		QUnit.module("Creation of children cards", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Property referenceId is forwarded to children cards", async function (assert) {
			// Arrange
			var sReferenceId = "test-id",
				oChildCard;

			// Act
			this.oCard.setReferenceId(sReferenceId);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.childCard.card1"
				},
				"sap.card": {
					"type": "Object",
					"header": {
						"title": "Test Card"
					}
				}
			});
			this.oCard.startManifestProcessing();

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			oChildCard = this.oCard._createChildCard({
				manifest: {
					"sap.app": {
						"id": "test.card.childCard.card2"
					},
					"sap.card": {
						"type": "Object",
						"header": {
							"title": "Test Card 2"
						}
					}
				}
			});

			// Assert
			assert.strictEqual(oChildCard.getReferenceId(), sReferenceId, "The created child card has the same reference id as the parent card.");
		});

		QUnit.module("Design property", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Design property in list card", async function (assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setDesign("Transparent");
			this.oCard.setManifest(oManifest_ListCard);

			await nextCardReadyEvent(this.oCard);

			// Assert
			assert.strictEqual(this.oCard.getCardContent()._getList().getBackgroundDesign(), "Transparent", "The design property is set correctly.");
		});

		QUnit.test("Design property in table card", async function (assert) {
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setDesign("Transparent");
			this.oCard.setManifest(oManifest_TableCard);

			await nextCardReadyEvent(this.oCard);

			// Assert
			assert.strictEqual(this.oCard.getCardContent()._getTable().getBackgroundDesign(), "Transparent", "The design property is set correctly.");
		});

		QUnit.module("Card manifest initialization", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("setManifest with and without translated texts", async function (assert) {
			var oLoadI18nSpy = this.spy(CoreManifest.prototype, "_loadI18n");

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(oLoadI18nSpy.notCalled, "translation file is not fetched");

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslations/manifest.json");

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			// Assert
			assert.ok(oLoadI18nSpy.called, "translation file is fetched");
		});

		QUnit.test("Dependencies that are listed in the manifest are loaded", async function (assert) {
			// Arrange
			var oLoadDepsSpy = this.stub(CardManifest.prototype, "loadDependenciesAndIncludes").resolves();

			// Act
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.loadDependenciesAndIncludes"
				},
				"sap.ui5": {
					"dependencies": {
						"libs": {
							"card.test.shared.lib": {}
						}
					}
				},
				"sap.card": {
					"type": "Object",
					"header": {
						"title": "Title"
					},
					"content": {
						"groups": [{
							"items": [
								{
									"id": "item1"
								}
							]
						}]
					}
				}
			});

			await nextCardReadyEvent(this.oCard);

			// Assert
			assert.ok(oLoadDepsSpy.calledOnce, "Manifest#loadDependenciesAndIncludes should be called");
			assert.ok(this.oCard.getCardContent(), "The card content should be created");
		});

		QUnit.module("Card grouping items count", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Cards content items count", async function (assert) {
			this.oCard.setManifest({
				"sap.card": {
					"type": "List",
					"header": {
						"type": "Numeric",
						"status": {
							"text": {
								"format": {
									"translationKey": "i18n>CARD.COUNT_X_OF_Y",
									"parts": [
										"parameters>/visibleItems",
										"20"
									]
								}
							}
						},
						"title": "Top 5 Products Sales",
						"subTitle": "By Average Price",
						"unitOfMeasurement": "EUR",
						"mainIndicator": {
							"number": "{number}",
							"unit": "{unit}",
							"trend": "{trend}",
							"state": "{state}"
						},
						"details": "{details}"
					},
					"content": {
						"data": {
							"json": [{
									"Name": "Comfort Easy",
									"Description": "32 GB Digital Assistant with high-resolution color screen",
									"Sales": "150",
									"State": "Warning"
								},
								{
									"Name": "ITelO Vault",
									"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
									"Sales": "540",
									"State": "Success"
								},
								{
									"Name": "Notebook Professional 15",
									"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
									"Sales": "350",
									"State": "Success"
								},
								{
									"Name": "Ergo Screen E-I",
									"Description": "Optimum Hi-Resolution max. 1920 x 1080 @ 85Hz, Dot Pitch: 0.27mm",
									"Sales": "100",
									"State": "Error"
								},
								{
									"Name": "Laser Professional Eco",
									"Description": "Print 2400 dpi image quality color documents at speeds of up to 32 ppm (color) or 36 ppm (monochrome), letter/A4. Powerful 500 MHz processor, 512MB of memory",
									"Sales": "200",
									"State": "Warning"
								}
							]
						},
						"item": {
							"title": "{Name}",
							"description": "{Description}",
							"info": {
								"value": "{Sales} K",
								"state": "{State}"
							}
						},
						"group": {
							"title": "{= ${Sales} > 150 ? 'Over 150' : 'Under 150'}",
							"order": {
								"path": "Sales",
								"dir": "ASC"
							}
						}
					}
				}
			});

			await nextCardReadyEvent(this.oCard);

			// Assert
			assert.strictEqual(this.oCard.getCardHeader().getStatusText(), "5 of 20", "The group headers are not counted as visible list items");
		});

		QUnit.module("Card preview modes", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Card in 'Abstract' preview mode", async function (assert) {
			this.oCard.setPreviewMode(library.CardPreviewMode.Abstract);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.previewMode"
				},
				"sap.card": {
					"type": "Object",
					"header": {
						"title": "Title"
					},
					"content": {
						"groups": [{
							"items": [
								{
									"id": "item1"
								}
							]
						}]
					}
				}
			});

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent();
			var oLoadingPlaceholder = oContent.getAggregation("_loadingPlaceholder");

			// Assert
			assert.ok(oContent.isA("sap.ui.integration.cards.ObjectContent"), "ObjectContent is created as card content");
			assert.ok(oContent.getAggregation("_loadingPlaceholder").getDomRef(), "Loading placeholder is displayed in the content");
			assert.notOk(oLoadingPlaceholder.getDomRef().getAttribute("title"), "No tooltip is rendered");
			assert.ok(this.oCard.getDomRef().classList.contains("sapFCardPreview"), "'sapFCardPreview' CSS class should be added");
		});

		QUnit.test("Fallback to Abstract preview when mock data configuration is missing", async function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.setPreviewMode(library.CardPreviewMode.MockData);
			this.oCard.setManifest({
				"sap.app": {
					"type": "card",
					"id": "test.dataProvider.card2"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "List Card"
					},
					"content": {
						"data": {
							"request": {
								"url": "./relativeData.json"
							}
						},
						"item": {
							"title": {
								"value": "{Name}"
							}
						}
					}
				}
			});

			await nextCardReadyEvent(this.oCard);

			this.oCard.addEventDelegate({
				onAfterRendering: () => {
					// Assert
					assert.strictEqual(this.oCard.getPreviewMode(), library.CardPreviewMode.Abstract, "Fallback to Abstract preview.");
					assert.ok(this.oCard.getDomRef().classList.contains("sapFCardPreview"), library.CardPreviewMode.Abstract, "Abstract preview class is there.");

					done();
				}
			});
		});

		QUnit.test("Don't fallback to Abstract preview when data configuration is with 'path' only", async function (assert) {
			var done = assert.async();

			this.oCard.setPreviewMode(library.CardPreviewMode.MockData);
			this.oCard.setManifest({
				"sap.app": {
					"type": "card",
					"id": "test.dataProvider.card2"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "List Card"
					},
					"content": {
						"data": {
							"path": "/"
						},
						"item": {
							"title": {
								"value": "{Name}"
							}
						}
					}
				}
			});

			await nextCardReadyEvent(this.oCard);

			this.oCard.addEventDelegate({
				onAfterRendering: () => {
					// Assert
					assert.strictEqual(this.oCard.getPreviewMode(), library.CardPreviewMode.MockData, "Didn't fallback to Abstract preview.");
					assert.notOk(this.oCard.getDomRef().classList.contains("sapFCardPreview"), library.CardPreviewMode.Abstract, "Abstract preview class is not there.");

					done();
				}
			});
		});

		QUnit.module("Blocking Message", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("getBlockingMessage() when the card is not ready", function (assert) {
			assert.strictEqual(this.oCard.getBlockingMessage(), null, "'null' should be returned when the card is not ready");
		});

		QUnit.test("getBlockingMessage() on 'stateChanged' event", function (assert) {
			var done = assert.async();

			this.oCard.attachStateChanged(function () {
				assert.ok(this.oCard.getBlockingMessage(), "Blocking message should be returned");
				assert.strictEqual(this.oCard.getBlockingMessage().type, CardBlockingMessageType.NoData, "Correct blocking message should be returned");

				done();
			}, this);

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.NoData"
				},
				"sap.card": {
					"type": "List",
					"header": {},
					"content": {
						"item": {
							"title": ""
						}
					},
					"data": {
						"json": []
					}
				}
			});
		});

		QUnit.test("getBlockingMessage() when there is data", function (assert) {
			var done = assert.async();

			this.oCard.attachStateChanged(function () {
				assert.strictEqual(this.oCard.getBlockingMessage(), null, "'null' should be returned");

				done();
			}, this);

			this.oCard.setManifest(oManifest_ListCard);
		});

		QUnit.test("getBlockingMessage() on content that doesn't support 'No Data'", function (assert) {
			var done = assert.async();

			this.oCard.attachStateChanged(function () {
				assert.strictEqual(this.oCard.getBlockingMessage(), null, "'null' should be returned");

				done();
			}, this);

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.NoData"
				},
				"sap.card": {
					"type": "Calendar",
					"data": {
						"json": {
							"item": []
						}
					},
					"header": {
						"title": "My calendar"
					},
					"content": {}
				}
			});
		});

		QUnit.test("getBlockingMessage() after showBlockingMessage()", function (assert) {
			var done = assert.async();
			var stateChangedCount = 0;

			this.oCard.attachStateChanged(function () {
				stateChangedCount++;

				if (stateChangedCount === 1) {
					assert.strictEqual(this.oCard.getBlockingMessage(), null, "'null' should be returned");

					// Act
					this.oCard.showBlockingMessage({
						type: CardBlockingMessageType.NoData
					});
				} else if (stateChangedCount === 2) {
					assert.ok(this.oCard.getBlockingMessage(), "Blocking message should be returned");
					done();
				}
			}, this);

			this.oCard.setManifest(oManifest_ListCard);
		});

		QUnit.test("getBlockingMessage() when content couldn't be created", function (assert) {
			var done = assert.async();

			this.oCard.attachStateChanged(function () {
				var oBlockingMessage = this.oCard.getBlockingMessage();

				assert.ok(oBlockingMessage, "Blocking message should be returned");
				assert.strictEqual(oBlockingMessage.type, CardBlockingMessageType.Error, "Correct blocking message type should be set.");

				done();
			}, this);

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.invalid.content"
				},
				"sap.card": {
					"type": "invalidListType",
					"header": {
						"title": "Invalid card"
					},
					"content": {}
				}
			});
		});
	}
);

