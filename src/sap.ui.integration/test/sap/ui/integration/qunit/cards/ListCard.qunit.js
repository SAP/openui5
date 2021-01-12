/* global QUnit, sinon */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/integration/cards/BaseListContent",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function (
	mLibrary,
	Core,
	BaseListContent,
	Card,
	waitForThemeApplied
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var AvatarColor = mLibrary.AvatarColor;

	var pIfMicrochartsAvailable = Core.loadLibrary("sap.suite.ui.microchart", { async: true });

	var oManifest_ListCard = {
		"sap.app": {
			"id": "test.cards.list.card1"
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
						}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{state}",
					"info": {
						"value": "{info}",
						"state": "{infoState}"
					}
				}
			}
		}
	};

	var oManifest_ListCard_StaticContent = {
		"sap.app": {
			"id": "test.cards.list.card2"
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
			  "items":[
				{
				  "title":"Laurent Dubois",
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
				  "description":"I am Alain. I put great attention to detail.",
				  "infoState":"Success",
				  "info":"Credit Analyst",
				  "highlight":"Error"
				},
				{
				  "title":"Alain Chevalier",
				  "description":"I am Alain. I put great attention to detail.",
				  "infoState":"Information",
				  "info":"Configuration Expert",
				  "highlight":"Information"
				},
				{
				  "title":"Alain Chevalier",
				  "description":"I am Alain. I put great attention to detail.",
				  "highlight":"Warning"
				},
				{
				  "title":"Laurent Dubois",
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
		"sap.app": {
			"id": "test.cards.list.card3"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "L3 Request list content Card"
			},
			"content": {
				"data": {
					"json": [{
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
						},
						{
							"Name": "ITelO Vault"
						},
						{
							"Name": "Notebook Professional 15"
						},
						{
							"Name": "Notebook Professional 26"
						},
						{
							"Name": "Notebook Professional 27"
						}
					]
				},
				"maxItems": 3,
				"item": {
					"title": "{Name}"
				}
			}
		}
	};

	var oManifest_ListCard_maxItems_Parameters = {
		"sap.app": {
			"id": "test.cards.list.card4"
		},
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
				"title": "L3 Request list content Card"
			},
			"content": {
				"data": {
					"json": [{
							"Name": "Notebook Basic 15"
						},
						{
							"Name": "Notebook Basic 17"
						},
						{
							"Name": "Notebook Basic 18"
						}
					]
				},
				"maxItems": "{{parameters.max}}",
				"item": {
					"title": "{Name}"
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
								"Notebook13Title": "Notebook 13 title",
								"Notebook13Color": "Good",
								"Notebook17Title": "Notebook 17 title",
								"Notebook17": 500
							},
							{
								"Year": 2018,
								"Category": "Computer system accessories",
								"Notebook13": 300,
								"Notebook13Title": "Notebook 13 title",
								"Notebook13Color": "Success",
								"Notebook17Title": "Notebook 17 title",
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
								"displayValue": "{Notebook13Title}",
								"color": "{Notebook13Color}",
								"legendTitle": "{Notebook13Title}"
							},
							{
								"value": "{Notebook17}",
								"displayValue": "{Notebook17Title}",
								"legendTitle": "{Notebook17Title}"
							}
						]
					}
				}
			}
		}
	};

	var oManifest_ListCard_StackedBarMicrochart_AbsoluteBinding = {
		"sap.app": {
			"id": "oManifest_ListCard_StackedBarMicrochart"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"data": {
					"json": {
						"maxOverYears": 700,
						"titles": {
							"Notebook13": "Notebook 13 title",
							"Notebook17": "Notebook 17 title"
						},
						"Notebooks": [
							{
								"Year": 2017,
								"Category": "Computer system accessories",
								"Notebook13": 200,
								"Notebook17": 500
							},
							{
								"Year": 2018,
								"Category": "Computer system accessories",
								"Notebook13": 300,
								"Notebook13Color": "Success",
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
								"legendTitle": "{/titles/Notebook13}"
							},
							{
								"value": "{Notebook17}",
								"legendTitle": "{/titles/Notebook17}"
							}
						]
					}
				}
			}
		}
	};

	var oManifest_ListCard_StackedBarMicrochart_NoBinding = {
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
								"Notebook13": 200,
								"Notebook17": 500
							},
							{
								"Year": 2018,
								"Notebook13": 300,
								"Notebook17": 320
							}
						]
					},
					"path": "/Notebooks"
				},
				"item": {
					"chart": {
						"type": "StackedBar",
						"displayValue": "{= ${Notebook13} + ${Notebook17}}K",
						"maxValue": "{/maxOverYears}",
						"bars": [
							{
								"value": "{Notebook13}",
								"legendTitle": "Notebook 13 title",
								"color": "{Notebook13Color}"
							},
							{
								"value": "{Notebook17}",
								"legendTitle":"Notebook 17 title"
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
		var oManifest = {
			"sap.app": {
				"id": "test.cards.list.cardTitleAndDescription"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "L3 Request list content Card"
				},
				"content": {
					"data": {
						"json": [{
							"Name": "Notebook Basic 15",
							"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro"
						}]
					},
					"item": {
						"title": "{Name}",
						"description": "{Description}"
					}
				}
			}
		};

		this.oCard.attachEvent("_ready", function () {
			var oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];
			var oItem = oManifest["sap.card"]["content"]["data"]["json"][0];

			Core.applyChanges();

			// Assert
			assert.equal(oListItem.getDescription(), oItem.Description, "Item description should be set.");
			assert.equal(oListItem.getTitle(), oItem.Name, "Item title should be set.");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
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

	QUnit.test("Icon properties", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
				"sap.app": {
					"id": "list.card.test.icon"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": [{
							"avatar": "images/Image_1.png"
						}]
					},
					"content": {
						"item": {
							"icon": {
								"src": "{avatar}",
								"shape": "Circle",
								"alt": "human image",
								"text": "IT"
							}
						}
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

			assert.strictEqual(oAvatar.getSrc(), "test-resources/sap/ui/integration/qunit/testResources/images/Image_1.png", "Should have correct avatar src");
			assert.strictEqual(oAvatar.getDisplayShape(), oManifest["sap.card"].content.item.icon.shape, "Should have 'Circle' shape");
			assert.strictEqual(oAvatar.getTooltip_AsString(), oManifest["sap.card"].content.item.icon.alt, "Should have tooltip set");
			assert.strictEqual(oAvatar.getInitials(), oManifest["sap.card"].content.item.icon.text, "Should have initials set");
			assert.ok(oAvatar.hasStyleClass("sapFCardIcon"), "'sapFCardIcon' class is added");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.test("Default 'size' of icon when there is no description", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
				"sap.app": {
					"id": "list.card.test.icon"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": [{
							"avatar": "sap-icon://error"
						}]
					},
					"content": {
						"item": {
							"icon": {
								"src": "{avatar}"
							}
						}
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

			assert.strictEqual(oAvatar.getDisplaySize(), "XS", "Should have 'XS' size");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.test("Default 'size' of icon when there are title and description", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
				"sap.app": {
					"id": "list.card.test.icon"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": [{
							"avatar": "sap-icon://error"
						}]
					},
					"content": {
						"item": {
							"title": "Title",
							"description": "Description",
							"icon": {
								"src": "{avatar}"
							}
						}
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

			assert.strictEqual(oAvatar.getDisplaySize(), "S", "Should have 'S' size");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.test("Icon allows to set custom 'size'", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
				"sap.app": {
					"id": "list.card.test.icon"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": [{
							"avatar": "sap-icon://error"
						}]
					},
					"content": {
						"item": {
							"title": "Title",
							"description": "Description",
							"icon": {
								"src": "{avatar}",
								"size": "M"
							}
						}
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

			assert.strictEqual(oAvatar.getDisplaySize(), "M", "Should have 'M' size");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.module("Overridden methods", {
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

	QUnit.test("#hideLoadingPlaceholders - Placeholder is hidden after loading has completed", function (assert) {
		// Arrange
		var done = assert.async(),
			spy = sinon.spy(BaseListContent.prototype, "hideLoadingPlaceholders"),
			oManifest = {
				"sap.app": {
					"id": "test.cards.list.card.hidePlaceholder"
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
							"title": "{Name}",
							"description": "{Description}"
						}
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			assert.ok(spy.called, "The method in the base class for hiding placeholder is called.");
			done();
		});

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.module("Icons", {
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

	QUnit.test("'backgroundColor' when there is icon src", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

			// Assert
			assert.strictEqual(oAvatar.getBackgroundColor(), AvatarColor.Transparent, "Background should be 'Transparent' when there is only icon.");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"id": "testListCard"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": [{
							"src": "sap-icon://error"
						}]
					},
					"item": {
						"icon": {
							"src": "{src}"
						}
					}
				}
			}
		});
	});

	QUnit.test("'backgroundColor' when there are initials", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar(),
				sExpected = oAvatar.getMetadata().getPropertyDefaults().backgroundColor;

			// Assert
			assert.strictEqual(oAvatar.getBackgroundColor(), sExpected, "Background should have default value when there are initials.");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"id": "testListCard"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": [{
							"initials": "AC"
						}]
					},
					"item": {
						"icon": {
							"text": "{initials}"
						}
					}
				}
			}
		});
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

	function testMicrochartCreation(assert, oCard, oManifest, fnTest) {
		var done = assert.async();

		pIfMicrochartsAvailable
			.then(function () {
				oCard.attachEventOnce("_ready", function () {
					fnTest(done);
				});
				oCard.setManifest(oManifest);
			})
			.catch(function () {
				assert.ok(true, "The usage of Microcharts is not available with this distribution.");
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
			assert.strictEqual(aBars[0].getDisplayValue(), oExpectedSettings["Notebooks"][0]["Notebook13Title"], "'displayValue' property from the bar in the manifest should be set to the chart.");
			assert.strictEqual(aBars[0].getValueColor(), oExpectedSettings["Notebooks"][0]["Notebook13Color"], "'color' property from the bar in the manifest should be set to the chart.");

			done();
		}.bind(this));
	});

	QUnit.module("Legend", {
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

	function testLegend(assert, oCard, oManifest, fnTest) {
		var done = assert.async();

		pIfMicrochartsAvailable
			.then(function () {
				oCard.attachEventOnce("_ready", function () {
					fnTest(done);
				});
				oCard.setManifest(oManifest);
			})
			.catch(function () {
				assert.ok(true, "The usage of Microcharts is not available with this distribution.");
				done();
			});
	}

	QUnit.test("There should be a legend when chart type is 'StackedBar'", function (assert) {
		testLegend(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart, function (done) {
			assert.ok(this.oCard.getCardContent().getAggregation("_legend"), "Legend is created.");
			done();
		}.bind(this));
	});

	QUnit.test("Relative binding - the legend items should have correct titles", function (assert) {
		testLegend(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart, function (done) {
			// Arrange
			Core.applyChanges();
			var aExpectedTitles = oManifest_ListCard_StackedBarMicrochart["sap.card"]["content"]["data"]["json"]["Notebooks"],
				aActualTitles = this.oCard.getCardContent().getAggregation("_legend").getAggregation("_titles");

			// Assert
			assert.strictEqual(aActualTitles[0].getText(), aExpectedTitles[0].Notebook13Title, "Relative binding to the item is resolved correctly.");
			assert.strictEqual(aActualTitles[1].getText(), aExpectedTitles[1].Notebook17Title, "Relative binding to the item is resolved correctly.");
			done();
		}.bind(this));
	});

	QUnit.test("Absolute binding- the legend items should have correct titles", function (assert) {
		testLegend(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart_AbsoluteBinding, function (done) {
			// Arrange
			Core.applyChanges();
			var oTitles = oManifest_ListCard_StackedBarMicrochart_AbsoluteBinding["sap.card"]["content"]["data"]["json"]["titles"],
				aActualTitles = this.oCard.getCardContent().getAggregation("_legend").getAggregation("_titles");

			// Assert
			assert.strictEqual(aActualTitles[0].getText(), oTitles.Notebook13, "Absolute binding is resolved correctly.");
			assert.strictEqual(aActualTitles[1].getText(), oTitles.Notebook17, "Absolute binding is resolved correctly.");
			done();
		}.bind(this));
	});

	QUnit.test("No binding- the legend items should have the same titles as the chart bars", function (assert) {
		testLegend(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart_NoBinding, function (done) {
			// Arrange
			Core.applyChanges();
			var aExpectedTitles = oManifest_ListCard_StackedBarMicrochart_NoBinding["sap.card"]["content"]["item"]["chart"]["bars"],
				aActualTitles = this.oCard.getCardContent().getAggregation("_legend").getAggregation("_titles");

			// Assert
			assert.strictEqual(aActualTitles[0].getText(), aExpectedTitles[0].legendTitle, "Title is set correctly.");
			assert.strictEqual(aActualTitles[1].getText(), aExpectedTitles[1].legendTitle, "Title is set correctly.");
			done();
		}.bind(this));
	});

	QUnit.test("Legend is destroyed when the card type has changed", function (assert) {
		testLegend(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart, function (done) {
			assert.ok(this.oCard.getCardContent().getAggregation("_legend"), "Legend is created when it is needed.");

			this.oCard.attachEvent("_ready", function () {
				assert.notOk(this.oCard.getCardContent().getAggregation("_legend"), "Legend is destroyed when it is NO longer needed.");
				done();
			}.bind(this));

			this.oCard.setManifest(oManifest_ListCard);
		}.bind(this));
	});

	return waitForThemeApplied();
});
