/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/ui/core/Manifest",
	"sap/base/Log",
	"sap/ui/core/ComponentContainer",
	"sap/ui/base/Event",
	"sap/ui/core/UIComponent",
	"sap/m/BadgeCustomData"
],
	function (
		Card,
		Core,
		CoreManifest,
		Log,
		ComponentContainer,
		Event,
		UIComponent,
		BadgeCustomData
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var oManifest_Header = {
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
					}
				}
			}
		};

		var oManifest_ListCard = {
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
								"icon": "../images/Woman_avatar_01.png",
								"state": "Information",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 17",
								"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1001",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Success",
								"info": "27.45 EUR",
								"infoState": "Success"

							},
							{
								"Name": "Notebook Basic 18",
								"Description": "Notebook Basic 18 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1002",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Warning",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "Notebook Basic 19",
								"Description": "Notebook Basic 19 with 2,80 GHz quad core, 19\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1003",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Error",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "ITelO Vault",
								"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
								"Id": "HT-1007",
								"SubCategoryId": "PDAs & Organizers",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 15",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1010",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 26",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1022",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 27",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1024",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Success",
								"info": "29.45 EUR",
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

		var oManifest_ListCard2 = {
			"sap.card": {
				"type": "List",
				"header": {
					"title": "L3 Request list content Card"
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Notebook Basic 15",
								"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1000",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Information",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 17",
								"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1001",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Success",
								"info": "27.45 EUR",
								"infoState": "Success"

							},
							{
								"Name": "Notebook Basic 18",
								"Description": "Notebook Basic 18 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1002",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Warning",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "Notebook Basic 19",
								"Description": "Notebook Basic 19 with 2,80 GHz quad core, 19\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1003",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Error",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "ITelO Vault",
								"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
								"Id": "HT-1007",
								"SubCategoryId": "PDAs & Organizers",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 15",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1010",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 26",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1022",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 27",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1024",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							}
						]
					},
					"item": {
						"title": "{Name}",
						"description": "{Description}"
					}
				}
			}
		};

		var oManifest_DefaultParameters = {
			"sap.card": {
				"configuration": {
					"parameters": {
						"city": {
							"value": "Vratza"
						},
						"country": {
							"value": "Bulgaria"
						}
					}
				},
				"type": "List",
				"header": {
					"title": "Default manifest parameters",
					"subTitle": "Default parameter from manifest"
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Notebook Basic 15",
								"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1000",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Information",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 17",
								"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1001",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
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
							"value": "{Name}, {{parameters.TODAY_ISO}}"
						},
						"description": {
							"value": "Stationed in: {{parameters.city}}, {{parameters.country}}. City again: {{parameters.city}}"
						},
						"highlight": "{state}"
					}
				}
			}
		};

		var oManifest_WithoutParameters = {
			"sap.card": {
				"configuration": {
					"parameters": {}
				},
				"type": "List",
				"header": {
					"title": "Default manifest parameters",
					"subTitle": "Default parameter from manifest"
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Notebook Basic 15",
								"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1000",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
								"state": "Information",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 17",
								"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1001",
								"SubCategoryId": "Notebooks",
								"icon": "../images/Woman_avatar_01.png",
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
							"value": "{Name}, {{parameters.TODAY_ISO}}"
						},
						"description": {
							"value": "Stationed in: {{parameters.city}}, {{parameters.country}}"
						},
						"highlight": "{state}"
					}
				}
			}
		};

		var oManifest_TableCard = {
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

		var oManifest_AvatarHeader = {
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
						"text": "AJ",
						"shape": "Circle",
						"alt": "Some alternative text", // Will be ignored as its not present in the Avatar control atm.
						"backgroundColor": "#000000", // Will be ignored as its not present in the Avatar control atm.
						"color": "#FF0000" // Will be ignored as its not present in the Avatar control atm.
					},
					"status": {
						"text": "100 of 200"
					}
				}
			}
		};

		var oManifest_NumericHeader = {
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

		var oManifest_NumericHeader2 = {
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"title": "Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation ",
					"subTitle": "Forecasted goal achievement depending on business logic and other important information Forecasted goal achievement depending on business logic and other important information",
					"unitOfMeasurement": "EUR",
					"mainIndicator": {
						"number": "56",
						"unit": "%",
						"trend": "Up",
						"state": "Good"
					},
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

		var oManifest_NumericHeader_OnlyTitleAndSubtitle = {
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"title": "Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation ",
					"subTitle": "Forecasted goal achievement depending on business logic and other important information Forecasted goal achievement depending on business logic and other important information",
					"unitOfMeasurement": "EUR"}
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

		var oManifest_Today_Parameter = {
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Default manifest parameters",
					"subTitle": "{{parameters.TODAY_ISO}}"
				}
			}
		};

		var oManifest_Today_And_Location_Parameter = {
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Default manifest parameters",
					"subTitle": "{{parameters.TODAY_ISO}} and {{parameters.LOCALE}}"
				}
			}
		};

		function testContentInitialization(oManifest, assert) {

			// Arrange
			var done = assert.async();

			var oCard = new Card("somecard", {
				manifest: oManifest,
				width: "400px",
				height: "600px"
			});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			// Assert
			assert.notOk(oCard.getAggregation("_header"), "Card header should be empty.");
			assert.notOk(oCard.getAggregation("_content"), "Card content should be empty.");
			assert.ok(oCard.getDomRef(), "Card should be rendered.");
			assert.equal(oCard.getDomRef().clientWidth, 398, "Card should have width set to 398px.");
			assert.equal(oCard.getDomRef().clientHeight, 598, "Card should have height set to 598px.");

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.ok(oCard.getAggregation("_header").getDomRef(), "Card header should be rendered.");
				assert.ok(oCard.getAggregation("_content").getDomRef(), "Card content should be rendered.");

				// Cleanup
				oCard.destroy();
				done();
			});
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

		QUnit.test("Initialization - ListContent", function (assert) {
			testContentInitialization(oManifest_ListCard, assert);
		});


		QUnit.test("Initialization - TableContent", function (assert) {
			testContentInitialization(oManifest_TableCard, assert);
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

		QUnit.test("createManifest called twice", function (assert) {
			var done = assert.async(),
				oStub = sinon.stub(this.oCard, "_setCardContent").callsFake(function () {
					assert.ok("_setCardContent is called only once and error is not thrown.");

					oStub.restore();

					done();
				});

			this.oCard.createManifest(oManifest_ListCard);

			this.oCard.destroyManifest();
			this.oCard.createManifest(oManifest_ListCard);
		});


		QUnit.test("setManifest with and without translated texts", function (assert) {

			var done = assert.async(),
				oLoadI18nSpy = sinon.spy(CoreManifest.prototype, "_loadI18n");

			// Arrange
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				// Assert
				assert.ok(oLoadI18nSpy.notCalled, "translation file is not fetched");

				// Arrange
				this.oCard.attachEventOnce("_ready", function () {

					Core.applyChanges();

					// Assert
					assert.ok(oLoadI18nSpy.called, "translation file is fetched");

					// Clean up
					oLoadI18nSpy.restore();
					done();
				});

				this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/translation/manifest.json");

			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Card headers", {
			beforeEach: function () {
				this.oCard = new Card("somecard", {
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

		QUnit.test("Default Header initialization", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				// Assert
				var oHeader = this.oCard.getAggregation("_header");
				assert.ok(oHeader, "Card should have header.");
				assert.ok(oHeader.getDomRef(), "Card header should be created and rendered.");
				assert.ok(oHeader.getAggregation("_title") && oHeader.getAggregation("_title").getDomRef(), "Card header title should be created and rendered.");
				assert.ok(oHeader.getAggregation("_subtitle") && oHeader.getAggregation("_subtitle").getDomRef(), "Card header subtitle should be created and rendered.");
				assert.ok(oHeader.getAggregation("_avatar") && oHeader.getAggregation("_avatar").getDomRef(), "Card header avatar should be created and rendered.");

				assert.equal(oHeader.getAggregation("_title").getText(), oManifest_Header["sap.card"].header.title, "Card header title should be correct.");
				assert.equal(oHeader.getAggregation("_subtitle").getText(), oManifest_Header["sap.card"].header.subTitle, "Card header subtitle should be correct.");
				assert.equal(oHeader.getAggregation("_avatar").getSrc(), oManifest_Header["sap.card"].header.icon.src, "Card header icon src should be correct.");
				assert.equal(oHeader.getStatusText(), oManifest_Header["sap.card"].header.status.text, "Card header status should be correct.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_Header);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			// Assert
			assert.notOk(this.oCard.getAggregation("_header"), "Card header should be empty.");
			assert.notOk(this.oCard.getAggregation("_content"), "Card content should be empty.");
		});

		QUnit.test("Default Header Avatar", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				// Assert
				var oHeader = this.oCard.getAggregation("_header");
				assert.notOk(oHeader.getAggregation("_avatar").getSrc(), "Card header icon src should be empty.");
				assert.equal(oHeader.getAggregation("_avatar").getDisplayShape(), "Circle", "Card header icon shape should be 'Circle'.");
				assert.equal(oHeader.getAggregation("_avatar").getInitials(), "AJ", "Card header initials should be 'AJ'.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_AvatarHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Numeric Header generic", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				// Assert
				var oHeader = this.oCard.getAggregation("_header");
				assert.ok(oHeader.getDomRef(), "Card Numeric header should be rendered.");

				// Assert properties
				assert.equal(oHeader.getAggregation("_title").getText(), oManifest_NumericHeader["sap.card"].header.title, "Card header title should be correct.");
				assert.equal(oHeader.getAggregation("_subtitle").getText(), oManifest_NumericHeader["sap.card"].header.subTitle, "Card header subtitle should be correct.");
				assert.equal(oHeader.getAggregation("_unitOfMeasurement").getText(), oManifest_NumericHeader["sap.card"].header.unitOfMeasurement, "Card header unitOfMeasurement should be correct.");
				assert.equal(oHeader.getAggregation("_details").getText(), oManifest_NumericHeader["sap.card"].header.details, "Card header details should be correct.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_NumericHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Numeric Header main indicator with json data", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				var oHeader = this.oCard.getAggregation("_header");

				Core.applyChanges();

				// Assert aggregation mainIndicator
				assert.ok(oHeader.getAggregation("_mainIndicator").getDomRef(), "Card header main indicator aggregation should be set and rendered");
				assert.equal(oHeader.getAggregation("_mainIndicator").getValue(), oManifest_NumericHeader["sap.card"].header.data.json["n"], "Card header main indicator value should be correct.");
				assert.equal(oHeader.getAggregation("_mainIndicator").getScale(), oManifest_NumericHeader["sap.card"].header.data.json["u"], "Card header main indicator scale should be correct.");
				assert.equal(oHeader.getAggregation("_mainIndicator").getIndicator(), oManifest_NumericHeader["sap.card"].header.data.json["trend"], "Card header main indicator indicator should be correct.");
				assert.equal(oHeader.getAggregation("_mainIndicator").getValueColor(), oManifest_NumericHeader["sap.card"].header.data.json["valueColor"], "Card header main indicator valueColor should be correct.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_NumericHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Numeric Header main indicator without 'data'", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				var oHeader = this.oCard.getAggregation("_header");

				Core.applyChanges();

				// Assert aggregation _mainIndicator
				assert.ok(oHeader.getAggregation("_mainIndicator").getDomRef(), "Card header main indicator aggregation should be set and rendered");
				assert.equal(oHeader.getAggregation("_mainIndicator").getValue(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.number, "Card header main indicator value should be correct.");
				assert.equal(oHeader.getAggregation("_mainIndicator").getScale(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.unit, "Card header main indicator scale should be correct.");
				assert.equal(oHeader.getAggregation("_mainIndicator").getIndicator(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.trend, "Card header main indicator indicator should be correct.");
				assert.equal(oHeader.getAggregation("_mainIndicator").getValueColor(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.state, "Card header main indicator valueColor should be correct.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_NumericHeader2);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Numeric Header side indicators", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				var oHeader = this.oCard.getAggregation("_header");

				Core.applyChanges();

				// Assert aggregation sideIndicators
				assert.ok(oHeader.getAggregation("sideIndicators"), "Card header side indicators should be set.");
				assert.equal(oHeader.getAggregation("sideIndicators").length, oManifest_NumericHeader["sap.card"].header.sideIndicators.length, "Card header should have two side indicators.");

				oHeader.getAggregation("sideIndicators").forEach(function (oIndicator, iIndex) {
					var oSideIndicator = oManifest_NumericHeader["sap.card"].header.sideIndicators[iIndex];
					assert.ok(oIndicator.getDomRef(), "Card header sideIndicators one should be rendered.");
					assert.equal(oIndicator.getTitle(), oSideIndicator.title, "Card header side indicator " + iIndex + " title should be correct.");
					assert.equal(oIndicator.getNumber(), oSideIndicator.number, "Card header side indicator " + iIndex + " number should be correct.");
					assert.equal(oIndicator.getUnit(), oSideIndicator.unit, "Card header side indicator " + iIndex + " unit should be correct.");
				});

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_NumericHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Numeric Header with no Details and no Indicators (Main and Side)", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				var oHeader = this.oCard.getAggregation("_header");

				Core.applyChanges();

				// Assert
				assert.equal((oHeader.getAggregation("_details").getText()).length, "", "Card header should have no Details.");
				assert.equal(oHeader.getAggregation("_mainIndicator").getValue(), "", "Card header should have no Main indicators.");
				assert.equal(oHeader.getAggregation("sideIndicators").length, 0, "Card header should have no Side indicators.");

				assert.equal(document.getElementsByClassName("sapFCardHeaderDetails").length, 0, "Card header Details are not rendered.");
				assert.equal(document.getElementsByClassName("sapFCardHeaderIndicators").length, 0, "Card header Indicators are not rendered.");
				assert.equal(document.getElementsByClassName("sapFCardHeaderMainIndicator").length, 0, "Card header Main Indicator is not rendered.");
				assert.equal(document.getElementsByClassName("sapFCardHeaderSideIndicators").length, 0, "Card header Side Indicator is not rendered.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_NumericHeader_OnlyTitleAndSubtitle);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.module("Card Accessibility", {
			beforeEach: function () {
				this.oRb = sap.ui.getCore().getLibraryResourceBundle("sap.f");
				this.oCard = new Card("somecard", {
					width: "400px",
					height: "600px"
				});
				this.oNumericHeaderCard = new Card("numericCard", {
					width: "400px",
					height: "600px"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				this.oNumericHeaderCard.placeAt(DOM_RENDER_LOCATION);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oNumericHeaderCard.destroy();
				this.oNumericHeaderCard = null;
				this.oRb = null;
			}
		});

		QUnit.test("Generic", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				// Assert
				var oCardDomRef = this.oCard.getDomRef(),
					oHeader = this.oCard.getAggregation("_header"),
					oHeaderDomRef = oHeader.getDomRef(),
					oContentDomRef = document.getElementsByClassName("sapFCardContent")[0],
					sAriaLabelledByIds = oHeader._getTitle().getId() + " " + oHeader._getSubtitle().getId() + " " + oHeader.getId() + "-status" + " " + oHeader._getAvatar().getId();

				// Assert Card Container
				assert.equal(oCardDomRef.getAttribute("role"), "region", "Card container should have a role - region");
				assert.equal(document.getElementById(this.oCard.getId() + "-ariaText").innerText, "List" + " " + this.oRb.getText("ARIA_ROLEDESCRIPTION_CARD") , "Card container should have aria-roledescription - List Card");

				// Assert Card Header
				assert.equal(oHeaderDomRef.getAttribute("role"), "heading", "Card header should have a role - heading");
				assert.equal(oHeaderDomRef.getAttribute("aria-level"), "3", "Card header should have a aria-level - 3");
				assert.equal(oHeaderDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER"), "Card header should have aria-roledescription - Card Header");
				assert.equal(oHeaderDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card container should have aria-lebelledby - pointing to the title, subtitle, status text and avatar ids if there is one");
				assert.equal(oHeaderDomRef.getAttribute("tabindex"), 0, "Card header should have tabindex=0");

				// Assert Card Content
				assert.equal(oContentDomRef.getAttribute("role"), "group", "Card content should have a role - group");
				assert.equal(oContentDomRef.getAttribute("aria-label"), this.oRb.getText("ARIA_LABEL_CARD_CONTENT"), "Card container should have aria-label - Card Content");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Generic Interactive", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				// Assert
				var oHeader = this.oCard.getAggregation("_header"),
					oHeaderDomRef = oHeader.getDomRef(),
					sAriaLabelledByIds = oHeader._getTitle().getId() + " " + oHeader._getSubtitle().getId() + " " + oHeader.getId() + "-status" + " " + oHeader._getAvatar().getId();

				// Assert Card Header
				assert.equal(oHeaderDomRef.getAttribute("role"), "button", "Card header should have a role - button");
				assert.notOk(oHeaderDomRef.getAttribute("aria-level"),  "Card header should not have aria-level");
				assert.equal(oHeaderDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER"), "Card header should have aria-roledescription - Card Header");
				assert.equal(oHeaderDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card container should have aria-lebelledby - pointing to the title, subtitle, status text and avatar ids if there is one");
				assert.equal(oHeaderDomRef.getAttribute("tabindex"), 0, "Card header should have tabindex=0");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_AvatarHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Numeric Header", function (assert) {

			// Arrange
			var done = assert.async();

			this.oNumericHeaderCard.attachEvent("_ready", function () {
				var oHeader = this.oNumericHeaderCard.getAggregation("_header");
				oHeader.setStatusText("3 of 5");

				Core.applyChanges();

				var oHeaderDomRef = oHeader.getDomRef(),
					sAriaLabelledByIds = oHeader._getTitle().getId() + " " + oHeader._getSubtitle().getId() + " " + oHeader.getId() + "-status" + " " + oHeader._getUnitOfMeasurement().getId() + " " + oHeader._getMainIndicator().getId() + oHeader._getSideIndicatorIds() + " " + oHeader._getDetails().getId();

				assert.equal(oHeaderDomRef.getAttribute("role"), "heading", "Card header should have a role - heading");
				assert.equal(oHeaderDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER"), "Card header should have aria-roledescription - Card Header");
				assert.equal(oHeaderDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card container should have aria-lebelledby - pointing to the title, subtitle, status text and avatar ids if there is one");
				assert.equal(oHeaderDomRef.getAttribute("tabindex"), 0, "Card header should have tabindex=0");
				done();
			}.bind(this));

			// Act
			this.oNumericHeaderCard.setManifest(oManifest_NumericHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Error handling", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Handler call", function (assert) {

			// Arrange
			var oLogSpy = sinon.spy(Log, "error"),
				sLogMessage = "Log this error in the console.";

			// Act
			this.oCard._handleError(sLogMessage);

			// Assert
			assert.ok(oLogSpy.calledOnceWith(sLogMessage), "Provided message should be logged to the console.");

			// Clean up
			oLogSpy.restore();
		});

		QUnit.test("Bad data url", function (assert) {

			// Arrange
			var oSpy = sinon.spy(Card.prototype, "_handleError"),
				done = assert.async();
			this.oCard.attachEvent("_error", function () {

				// Assert
				assert.ok(oSpy.calledOnce, "Should call error handler when manifest is 'null'");

				// Clean up
				oSpy.restore();
				done();
			});

			// Act
			this.oCard.setManifest({
				"sap.card": {
					"type": "List",
					"header": {},
					"content": {},
					"data": {
						"request": "invalidurl"
					}
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.module("Component Card");

		QUnit.test("Component Card - card and component manifests are in the same file", function (assert) {
			testComponentContentCreation(
				oManifest_ComponentCardAllInOne,
				oManifest_ComponentCardAllInOne,
				assert
			);
		});

		QUnit.module("Parameters", {
			beforeEach: function () {

				var oData = {
					"location": {
						"city": "Waldorf",
						"country": "Germany"
					}
				};
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});

				this.oCardWithParameters = new Card({
					width: "400px",
					height: "600px",
					parameters: oData.location
				});

			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;

				this.oCardWithParameters.destroy();
				this.oCardWithParameters = null;
			}
		});

		QUnit.test("Property is set with correct values", function (assert) {
			// Act
			this.oCard.setParameters({ "city": "Sofia" });

			var oParameters = this.oCardWithParameters.getParameters(),
				oSetterProperties = this.oCard.getParameters();
			// Assert
			assert.strictEqual(oParameters.city, "Waldorf", "Parameter property is set correctly");
			assert.strictEqual(oParameters.country, "Germany", "Parameter property is set correctly");
			assert.strictEqual(oSetterProperties.city, "Sofia", "Parameter property is set correctly");

		});

		QUnit.test("Default Parameters - In manifest only parameters", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();
				var oListItems = this.oCard.getCardContent()._getList().getItems(),
				 oItem = oManifest_ListCard2["sap.card"]["content"]["data"]["json"][0];
				// Assert
				assert.ok(oListItems[0].getDescription().indexOf("Vratza") > -1, "Card parameter 'city' should be replaced in rendered html  with 'Vratza'");
				assert.strictEqual(oListItems[0].getDescription().match(/Vratza/g).length, 2, "Parameter can occur multiple times and is replaced in every occurrence");
				assert.ok(oListItems[0].getDescription().indexOf("Bulgaria") > -1, "Card parameter 'country' should be replaced in rendered html  with 'Bulgaria'");
				assert.ok(oListItems[0].getTitle().indexOf(oItem.Name) > -1, "Card title should be rendered with its value");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_DefaultParameters);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Overwrite Parameters - Default value from manifest and one overwritten trough property", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();
				var oListItems = this.oCard.getCardContent()._getList().getItems(),
					oParameters = this.oCard.getCombinedParameters();

				// Assert
				assert.ok(oListItems[0].getDescription().indexOf("Sofia") > -1, "Card parameter 'city' should be replaced in rendered html  with 'Sofia'");
				assert.ok(oListItems[0].getDescription().indexOf("Bulgaria") > -1, "Card parameter 'country' should be replaced in rendered html  with 'Bulgaria'");

				assert.strictEqual(oParameters.city, "Sofia", "Card parameter 'city' is correct.");
				assert.strictEqual(oParameters.country, "Bulgaria", "Card parameter 'country' is correct.");

				done();
			}.bind(this));

			// Act
			this.oCard.setParameters({ "city": "Sofia" });
			this.oCard.setManifest(oManifest_DefaultParameters);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Default Parameters - In manifest and overwrite from property", function (assert) {

			// Arrange
			var done = assert.async(),
				oData = {
					"location": {
						"city": "Waldorf",
						"country": "Germany"
					}
				};
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				var oListItems = this.oCard.getCardContent()._getList().getItems(),
					oParameters = this.oCard.getCombinedParameters();

				// Assert
				assert.ok(oListItems[0].getDescription().indexOf("Waldorf") > -1, "Card parameter 'city' should be replaced in rendered html with 'Waldorf'");
				assert.ok(oListItems[0].getDescription().indexOf("Germany") > -1, "Card parameter 'country' should be replaced in rendered html  with 'Germany'");

				assert.strictEqual(oParameters.city, "Waldorf", "Card parameter 'city' is correct.");
				assert.strictEqual(oParameters.country, "Germany", "Card parameter 'country' is correct.");

				done();
			}.bind(this));

			// Act
			this.oCard.setParameters(oData.location);
			this.oCard.setManifest(oManifest_DefaultParameters);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Only parameter property set", function (assert) {

			// Arrange
			var done = assert.async(),
				oData = {
					"location": {
						"city": "Vratza",
						"country": "Bulgaria"
					}
				};
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();
				var oListItems = this.oCard.getCardContent()._getList().getItems();
				// Assert
				assert.ok(oListItems[0].getDescription().indexOf("Vratza") === -1, "Card parameter 'city' should NOT  be replaced in rendered html with 'Vratza'");
				assert.ok(oListItems[0].getDescription().indexOf("Bulgaria") === -1, "Card parameter 'country' NOT should be replaced in rendered html  with 'Bulgaria'");

				done();
			}.bind(this));

			// Act
			this.oCard.setParameters(oData.location);
			this.oCard.setManifest(oManifest_WithoutParameters);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Parameters are set after card is rendered once - In manifest and overwrite from property", function (assert) {

			// Arrange
			var done = assert.async(),
				oData = {
					"location": {
						"city": "Waldorf",
						"country": "Germany"
					}
				};

			this.oCard.attachEventOnce("_ready", function () {
				this.oCard.attachEventOnce("_ready", function () {
					Core.applyChanges();

					// Assert
					var oListItems = this.oCard.getCardContent()._getList().getItems();
					assert.ok(oListItems[0].getDescription().indexOf("Waldorf") > -1, "Card parameter 'city' should be replaced in rendered html with 'Waldorf'");
					assert.ok(oListItems[0].getDescription().indexOf("Germany") > -1, "Card parameter 'country' should be replaced in rendered html  with 'Germany'");
					done();
				}.bind(this));

				// Act
				this.oCard.setParameters(oData.location);
			}.bind(this));

			this.oCard.setManifest(oManifest_DefaultParameters);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Setting single parameter", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEventOnce("_ready", function () {
				this.oCard.attachEventOnce("_ready", function () {
					Core.applyChanges();

					// Assert
					var oListItems = this.oCard.getCardContent()._getList().getItems();
					assert.ok(oListItems[0].getDescription().indexOf("Tokyo") > -1, "Card parameter 'city' should be replaced in rendered html with 'Tokyo'");
					done();
				}.bind(this));

				// Act
				this.oCard.setParameter("city", "Tokyo");
			}.bind(this));

			this.oCard.setManifest(oManifest_DefaultParameters);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Only TODAY_ISO or NOW_ISO are used", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				// Act
				var sSubtitle = this.oCard.getCardHeader()._getSubtitle().getText();
				assert.ok(sSubtitle !== "", "Card should have a subtitle with the now Date");
				done();
			}.bind(this));

			this.oCard.setManifest(oManifest_Today_Parameter);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Only TODAY_ISO and LOCALE are used", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				// Act
				var sSubtitle = this.oCard.getCardHeader()._getSubtitle().getText();
				assert.ok(sSubtitle.indexOf(new Date().toISOString().slice(0, 10)) > -1 , "Card should have a subtitle with the now Date");
				assert.ok(sSubtitle.indexOf(Core.getConfiguration().getLocale().toString()) > -1 , "Card should have a subtitle with the locale");
				done();
			}.bind(this));

			this.oCard.setManifest(oManifest_Today_And_Location_Parameter);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Refreshing", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oManifest = {
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

		QUnit.test("Refreshing card state", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				this.oCard.attachEventOnce("_ready", function () {

					// Assert
					assert.ok(true, "Should have fired _ready event after refresh.");

					// Cleanup
					done();
				});

				// Act
				this.oCard.refresh();
			}.bind(this));

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest(this.oManifest);
		});

		QUnit.module("Data mode", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oManifest = {
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

		QUnit.test("Set data mode", function (assert) {

			// Arrange
			var done = assert.async(),
				oApplyManifestSpy = sinon.spy(Card.prototype, "_applyManifestSettings"),
				oRefreshSpy = sinon.spy(Card.prototype, "refresh");

			this.oCard.attachEventOnce("_ready", function () {

				// Assert
				assert.ok(oApplyManifestSpy.calledOnce, "Card with default 'Active' state should try to apply the manifest settings.");

				// Act
				oApplyManifestSpy.reset();
				this.oCard.setDataMode("Inactive");

				// Assert
				assert.ok(oApplyManifestSpy.notCalled, "Card with 'Inactive' state should NOT try to apply the manifest settings.");

				// Act
				this.oCard.setDataMode("Active");

				// Assert
				assert.ok(oRefreshSpy.calledOnce, "Should call refresh when turning to 'Active' mode.");

				// Cleanup
				oApplyManifestSpy.restore();
				done();

			}.bind(this));

			this.oCard.setManifest(this.oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Card manifest - URL", {
			beforeEach: function () {
				this.oCardUrl = new Card({
					width: "400px",
					height: "600px"
				});
			},
			afterEach: function () {
				this.oCardUrl.destroy();
				this.oCardUrl = null;
			}
		});

		QUnit.test("Card manifest set trough url", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCardUrl.attachEventOnce("_ready", function () {

				Core.applyChanges();

				// Assert
				assert.ok(true, "Should have fired _ready event.");

				// Cleanup
				done();
			});

			this.oCardUrl.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCardUrl.placeAt(DOM_RENDER_LOCATION);
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

		QUnit.test("Formatting with self translation", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.equal(oHeader.getStatusText(), "2 of 115", "Should have correctly formatted and translated counter.");

				// Cleanup
				done();
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/translation/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Formatting with custom translation", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.equal(oHeader.getStatusText(), "2 of custom 115", "Should have correctly formatted and translated counter.");

				// Cleanup
				done();
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/translation/manifest2.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Formatting with self translation and no custom translation", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.equal(oHeader.getStatusText(), "2 of 115", "Should have correctly formatted and translated counter.");

				// Cleanup
				done();
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/translation/manifest3.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Events - 'manifestReady'", {
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

		QUnit.test("getManifestEntry after 'manifestReady' event is fired.", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachManifestReady(function () {
				// Assert
				assert.deepEqual(this.oCard.getManifestEntry("/"), oManifest_ListCard, "getManifestEntry returns correct result for '/'");
				assert.deepEqual(this.oCard.getManifestEntry("/sap.card"), oManifest_ListCard["sap.card"], "getManifestEntry returns correct result for '/sap.card'");
				assert.strictEqual(this.oCard.getManifestEntry("/sap.card/header/title"), oManifest_ListCard["sap.card"]["header"]["title"], "getManifestEntry returns correct result for '/sap.card/header/title'");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
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

		QUnit.test("Change title with manifestChanges", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Assert
				assert.strictEqual(this.oCard.getAggregation("_header").getTitle(), "My new title 2", "The title is changed");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{content: {header: {title: "My new title 1"}}},
				{content: {header: {title: "My new title 2"}}}
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Check getManifestWithMergedChanges", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Assert
				var oMergedManifest = this.oCard.getManifestWithMergedChanges();
				assert.strictEqual(oMergedManifest["sap.card"]["header"]["title"], "Test title", "The manifest contains the given changes.");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{content: {header: {title: "Test title"}}}
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Style classes", {
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

		QUnit.test("sapFCardAnalytical is added only when the type is 'Analytical'", function (assert) {
			// Arrange
			var done = assert.async(),
				oAnalyticalManifest = {
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

			// Act
			this.oCard.attachEventOnce("_ready", function () {
				// Assert
				assert.ok(this.oCard.hasStyleClass("sapFCardAnalytical"), "'sapFCardAnalytical' class should be set.");

				this.oCard.attachEventOnce("_ready", function () {
					// Assert
					assert.notOk(this.oCard.hasStyleClass("sapFCardAnalytical"), "'sapFCardAnalytical' class should NOT be set.");
					done();
				}.bind(this));

				// Act
				this.oCard.setManifest(oTableManifest);

			}.bind(this));

			this.oCard.setManifest(oAnalyticalManifest);
		});


		QUnit.module("Badge", {
			beforeEach: function () {
				this.oCard = new Card({
					customData: [
						new BadgeCustomData({
							value: "10"
						})
					],
					width: "400px",
					height: "600px"
				});
			},
			afterEach: function () {
				// this.sinon.useFakeTimers = false;
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Rendering", function (assert) {
			var done = assert.async();

			// Arrange
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				// Assert
				assert.strictEqual(this.oCard.$().find(".sapMBadgeIndicator").attr("data-badge"), "10", "Badge indicator is correctly rendered");

				done();

			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});


		QUnit.test("Auto hide", function (assert) {
			var done = assert.async();

			// Arrange
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				this.clock = sinon.useFakeTimers();

				// Assert
				assert.ok(this.oCard.$().find(".sapMBadgeIndicator").attr("data-badge"), "Badge indicator is rendered");

				this.oCard.focus();

				this.clock.tick(4000);

				assert.equal(this.oCard._isBadgeAttached, false, "Badge indicator is not rendered");

				this.clock.restore();
				done();

			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});
	}
);
