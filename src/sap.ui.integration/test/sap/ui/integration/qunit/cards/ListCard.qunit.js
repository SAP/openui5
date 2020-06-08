/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/ContentFactory",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core"
], function (
	ContentFactory,
	Card,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

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

	var oManifest_ListCard_StaticContent = {
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
			  "items":[
				{
				  "title":"Laurent Dubois",
				  "icon":"../images/Elena_Petrova.png",
				  "description":"I am Laurent. I put great attention to detail.",
				  "infoState":"Error",
				  "info":"Manager",
				  "highlight":"Success",
				  "action":{
					"url":"https://www.w3schools.com"
				  }
				},
				{
				  "title":"Alain Chevalier",
				  "icon":"../images/Alain_Chevalier.png",
				  "description":"I am Alain. I put great attention to detail.",
				  "infoState":"Success",
				  "info":"Credit Analyst",
				  "highlight":"Error"
				},
				{
				  "title":"Alain Chevalier",
				  "icon":"../images/Monique_Legrand.png",
				  "description":"I am Alain. I put great attention to detail.",
				  "infoState":"Information",
				  "info":"Configuration Expert",
				  "highlight":"Information"
				},
				{
				  "title":"Alain Chevalier",
				  "icon":"../images/Alain_Chevalier.png",
				  "description":"I am Alain. I put great attention to detail.",
				  "highlight":"Warning"
				},
				{
				  "title":"Laurent Dubois",
				  "icon":"../images/Elena_Petrova.png",
				  "description":"I am Laurent. I put great attention to detail.",
				  "infoState":"Error",
				  "info":"Manager",
				  "highlight":"Success",
				  "action":{
					"url":"https://www.w3schools.com"
				  }
				}
			  ]
			}
		  }
	};

	var oManifest_ListCard_MaxItems = {
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
				"maxItems": 3,
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

	var oManifest_ListCard_maxItems_Parameters = {
		"sap.card": {
			"configuration": {
				"parameters": {
					"max": {
						"value": 2
					}
				}
			},
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
						}
					]
				},
				"maxItems": "{{parameters.max}}",
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

	var oManifest_ListCard_BulletMicrochart = {
		"sap.app": {
			"id": "oManifest_ListCard_BulletMicrochart"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"data": {
					"json": [
						{
							"Name": "Comfort Easy",
							"Description": "32 GB Digital Assistant with high-resolution color screen",
							"Highlight": "Success",
							"MinValue": 0,
							"MaxValue": 300000,
							"Actual": 330000,
							"Target": 280000,
							"ChartColor": "Good"
						}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}",
					"chart": {
						"type": "Bullet",
						"minValue": "{MinValue}",
						"maxValue": "{MaxValue}",
						"target": "{Target}",
						"value": "{Actual}",
						"displayValue": "{= format.currency(${Actual}, 'EUR', {currencyCode:false})}",
						"color": "{ChartColor}",
						"scale": "$",
						"thresholds": [
							{
								"value": 50000,
								"color": "Error"
							},
							{
								"value": 50000,
								"color": "Error"
							}
						]
					}
				}
			}
		}
	};

	var oManifest_ListCard_StackedBarMicrochart = {
		"sap.app": {
			"id": "oManifest_ListCard_StackedBarMicrochart"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"data": {
					"json": {
						"maxOverYears": 700,
						"Notebooks": [
							{
								"Year": 2017,
								"Category": "Computer system accessories",
								"Notebook13": 200,
								"Notebook13Label": "Notebook 13 label",
								"Notebook13Color": "Good",
								"Notebook17Label": "Notebook 17 label",
								"Notebook17": 500
							},
							{
								"Year": 2018,
								"Category": "Computer system accessories",
								"Notebook13": 300,
								"Notebook13Label": "Notebook 13 label",
								"Notebook13Color": "Success",
								"Notebook17Label": "Notebook 17 label",
								"Notebook17": 320
							}
						]
					},
					"path": "/Notebooks"
				},
				"item": {
					"title": "{Year}",
					"description": "{Category}",
					"chart": {
						"type": "StackedBar",
						"displayValue": "{= ${Notebook13} + ${Notebook17}}K",
						"maxValue": "{/maxOverYears}",
						"bars": [
							{
								"value": "{Notebook13}",
								"displayValue": "{Notebook13Label}",
								"color": "{Notebook13Color}"
							},
							{
								"value": "{Notebook17}",
								"displayValue": "{Notebook17Label}"
							}
						]
					}
				}
			}
		}
	};

	QUnit.module("List Card", {
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

	QUnit.test("List Card - using manifest", function (assert) {

		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content");

			Core.applyChanges();

			// Assert
			assert.ok(oContent, "List Card content form manifest should be set");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_ListCard);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("List Card - static items", function (assert) {

		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content");

			Core.applyChanges();

			// Assert
			assert.ok(oContent, "List Card static content should be set");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_ListCard_StaticContent);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("List Card - item title and description with string values", function (assert) {

		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];
			var oItem = oManifest_ListCard2["sap.card"]["content"]["data"]["json"][0];

			Core.applyChanges();

			// Assert
			assert.equal(oListItem.getDescription(), oItem.Description, "Item description should be set.");
			assert.equal(oListItem.getTitle(), oItem.Name, "Item title should be set.");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_ListCard2);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Using maxItems manifest property", function (assert) {

		// Arrange
		var done = assert.async();
		var iMaxItems = oManifest_ListCard_MaxItems["sap.card"]["content"]["maxItems"];

		this.oCard.attachEvent("_ready", function () {

			Core.applyChanges();

			var iNumberOfItems = this.oCard.getCardContent().getAggregation("_content").getItems().length;
			assert.ok(iNumberOfItems <= iMaxItems, "Should have less items than the maximum.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_ListCard_MaxItems);
	});

	QUnit.test("Using maxItems set through parameters", function (assert) {

		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {

			Core.applyChanges();

			var iNumberOfItems = this.oCard.getCardContent().getAggregation("_content").getItems().length;
			assert.ok(iNumberOfItems === 2, "After Manifest is processed maxItems should be a number");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_ListCard_maxItems_Parameters);
	});

	QUnit.module("Loading of the Microchart library", {
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

	QUnit.test("Loading of Microchart library when there is NO chart in the content", function (assert) {
		// Arrange
		var done = assert.async(),
			loadLibraryStub = sinon.stub(Core, "loadLibrary");

		this.oCard.attachEvent("_ready", function () {
			// Assert
			assert.ok(loadLibraryStub.notCalled, "Should NOT load Microchart library when there is no chart in the content.");
			// Clean up
			loadLibraryStub.restore();
			done();
		});

		// Act
		this.oCard.setManifest({
			"sap.app": { id: "testListCard" },
			"sap.card": {
				type: "List",
				content: {
					item: {}
				}
			}
		});
	});

	QUnit.test("Loading of Microchart library when there is chart in the content", function (assert) {
		// Arrange
		var done = assert.async(),
			loadLibraryStub = sinon.stub(Core, "loadLibrary").resolves();

		this.oCard.attachEvent("_ready", function () {
			// Assert
			assert.ok(loadLibraryStub.called, "Should load Microchart library when there is chart in the content.");
			// Clean up
			loadLibraryStub.restore();
			done();
		});

		// Act
		this.oCard.setManifest({
			"sap.app": { id: "testListCard" },
			"sap.card": {
				type: "List",
				content: {
					item: {
						chart: {}
					}
				}
			}
		});
	});

	QUnit.module("Microchart creation", {
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

	var pIfMicrochartsAvailable = new Promise(function (resolve, reject) {
		var oContentFactory = new ContentFactory();
		return oContentFactory.create({
				cardType: "List",
				contentManifest: {
					item: {
						chart: {}
					}
				}
			})
			.then(resolve)
			.catch(reject);
	});

	function testMicrochartCreation(assert, oCard, oManifest, fnTest) {
		var done = assert.async();

		pIfMicrochartsAvailable
			.then(function () {
				oCard.attachEvent("_ready", function () {
					fnTest(done);
				});
				oCard.setManifest(oManifest);
			})
			.catch(function (sErr) {
				assert.strictEqual(sErr, "The usage of Microcharts is not available with this distribution.");
				done();
			});
	}

	QUnit.test("Creation of Bullet MicroChart", function (assert) {
		testMicrochartCreation(assert, this.oCard, oManifest_ListCard_BulletMicrochart, function (done) {
			var oChart = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getMicrochart().getChart(),
				oExpectedSettings = oManifest_ListCard_BulletMicrochart["sap.card"]["content"]["data"]["json"][0];

			// Assert
			assert.strictEqual(oChart.getMinValue(), oExpectedSettings.MinValue, "'minValue' property from the manifest should be set to the chart.");
			assert.strictEqual(oChart.getMaxValue(), oExpectedSettings.MaxValue, "'maxValue' property from the manifest should be set to the chart.");
			assert.strictEqual(oChart.getTargetValue(), oExpectedSettings.Target, "'target' property from the manifest should be set to the chart.");
			assert.strictEqual(oChart.getShowTargetValue(), !!oExpectedSettings.Target, "The chart should only show the target value, if it is provided.");
			assert.strictEqual(oChart.getScale(), "$", "'scale' property from the manifest should be set to the chart.");
			assert.strictEqual(oChart.getActual().getValue(), oExpectedSettings.Actual, "'value' property from the manifest should be set to the chart.");
			assert.strictEqual(oChart.getThresholds().length, 2, "Should have created 2 thresholds.");
			done();
		}.bind(this));
	});

	QUnit.test("Creation of StackedBar MicroChart", function (assert) {
		testMicrochartCreation(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart, function (done) {
			var oChart = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getMicrochart().getChart(),
				aBars = oChart.getBars(),
				oExpectedSettings = oManifest_ListCard_StackedBarMicrochart["sap.card"]["content"]["data"]["json"];

			// Assert
			assert.strictEqual(aBars.length, oExpectedSettings["Notebooks"].length, "Should have created 2 bars.");
			assert.strictEqual(oChart.getMaxValue(), oExpectedSettings.maxOverYears, "'maxValue' property from the manifest should be set to the chart.");
			assert.strictEqual(aBars[0].getValue(), oExpectedSettings["Notebooks"][0]["Notebook13"], "'value' property from the bar in the manifest should be set to the chart.");
			assert.strictEqual(aBars[0].getDisplayValue(), oExpectedSettings["Notebooks"][0]["Notebook13Label"], "'displayValue' property from the bar in the manifest should be set to the chart.");
			assert.strictEqual(aBars[0].getValueColor(), oExpectedSettings["Notebooks"][0]["Notebook13Color"], "'color' property from the bar in the manifest should be set to the chart.");

			done();
		}.bind(this));
	});

});
