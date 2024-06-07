/* global QUnit, sinon */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Lib",
	"sap/ui/integration/cards/BaseListContent",
	"sap/ui/integration/cards/ListContent",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/MemoryLeakCheck",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function (
	mLibrary,
	Library,
	BaseListContent,
	ListContent,
	CardActions,
	Card,
	MemoryLeakCheck,
	QUnitUtils,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const AvatarColor = mLibrary.AvatarColor;
	const pIfMicrochartsAvailable = Library.load("sap.suite.ui.microchart");

	function testWithMicrochart(assert, oCard, oManifest, fnTest) {
		const done = assert.async();

		pIfMicrochartsAvailable
			.then(function () {
				oCard.attachEventOnce("_ready", function () {
					fnTest(done);
				});
				oCard.setManifest(oManifest);
			})
			.catch(function () {
				assert.ok(true, "Usage of Microcharts is not available with this distribution.");
				done();
			});
	}

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
							"infoState": "Success",
							"showInfoStateIcon": true
						},
						{
							"Name": "Notebook Basic 17",
							"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1001",
							"SubCategoryId": "Notebooks",
							"state": "Success",
							"info": "27.45 EUR",
							"infoState": "Success",
							"Visibility": true

						},
						{
							"Name": "Notebook Basic 18",
							"Description": "Notebook Basic 18 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1002",
							"SubCategoryId": "Notebooks",
							"state": "Warning",
							"info": "9.45 EUR",
							"infoState": "Error",
							"showInfoStateIcon": true,
							"customInfoStatusIcon": "sap-icon://hint"
						},
						{
							"Name": "Notebook Basic 19",
							"Description": "Notebook Basic 19 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1002",
							"SubCategoryId": "Notebooks",
							"state": "Warning",
							"info": "19.45 EUR",
							"infoState": "Error",
							"showInfoStateIcon": true,
							"customInfoStatusIcon": "sap-icon://hint",
							"Visibility": false
						}
					]
				},
				"item": {
					"title": "{Name}",
					"description": {
						"value": "{Description}",
						"visible": "{Visibility}"
					},
					"highlight": "{state}",
					"highlightText": "{state}",
					"info": {
						"value": "{info}",
						"state": "{infoState}",
						"showStateIcon": "{showInfoStateIcon}",
						"customStateIcon": "{customInfoStatusIcon}",
						"visible": "{Visibility}"
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
				"items": [
					{
						"title": "Laurent Dubois",
						"description": "I am Laurent. I put great attention to detail.",
						"infoState": "Error",
						"info": "Manager",
						"highlight": "Success",
						"action": {
							"url": "https://www.w3schools.com"
						}
					},
					{
						"title": "Alain Chevalier",
						"description": "I am Alain. I put great attention to detail.",
						"infoState": "Success",
						"info": "Credit Analyst",
						"highlight": "Error"
					},
					{
						"title": "Alain Chevalier",
						"description": "I am Alain. I put great attention to detail.",
						"infoState": "Information",
						"info": "Configuration Expert",
						"highlight": "Information"
					},
					{
						"title": "Alain Chevalier",
						"description": "I am Alain. I put great attention to detail.",
						"highlight": "Warning"
					},
					{
						"title": "Laurent Dubois",
						"description": "I am Laurent. I put great attention to detail.",
						"infoState": "Error",
						"info": "Manager",
						"highlight": "Success",
						"action": {
							"url": "https://www.w3schools.com"
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
					"json": [
						{
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

	var oManifest_ListCard_maxItems_Parameters_Binding = {
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
					"json": [
						{
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
				"maxItems": "{parameters>/max/value}",
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

	var oManifest_ListCard_BulletMicrochartMultiple = {
		"sap.app": {
			"id": "oManifest_ListCard_BulletMicrochartMultiple"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"data": {
					"json": [
						{
							"Name": "Comfort Easy",
							"Description": "32 GB Digital Assistant",
							"Highlight": "Success",
							"Expected": 300000,
							"Actual": 330000,
							"Target": 280000,
							"ChartColor": "Good"
						},
						{
							"Name": "Ergo Screen E-I",
							"Description": "Optimum Hi-Resolution max.",
							"Highlight": "Warning",
							"Expected": 300000,
							"Actual": 100000,
							"Target": 100000,
							"ChartColor": "Neutral"
						},
						{
							"Name": "Laser Professional Eco",
							"Description": "Powerful 500 MHz processor",
							"Highlight": "Error",
							"Expected": 300000,
							"Actual": 60000,
							"Target": 75000,
							"ChartColor": "Error"
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
						"displayZeroValue": false,
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
						"displayZeroValue": "{/displayZeroValue}",
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
								"legendTitle": "Notebook 17 title"
							}
						]
					}
				}
			}
		}
	};

	var oManifest_ListCard_Attributes = {
		"sap.app": {
			"id": "oManifest_ListCard_Attributes"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Notebooks"
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Notebook Basic 15",
							"Availability": "Out of stock",
							"AvailabilityState": "Error",
							"Processor": "2,80 GHz quad core",
							"Monitor": "15\" LCD",
							"RAM": "4 GB DDR3 RAM",
							"HHD": "500 GB Hard Disc",
							"OS": "Windows 8 Pro",
							"OSState": "Success"
						},
						{
							"Name": "Notebook Basic 17",
							"Availability": "Available",
							"AvailabilityState": "Success",
							"Processor": "2,80 GHz quad core",
							"Monitor": "17\" LCD",
							"RAM": "4 GB DDR3 RAM",
							"HHD": "500 GB Hard Disc",
							"OS": "Windows 8 Pro",
							"OSState": "Success",
							"OSShowStateIcon": true,
							"AttributesLayoutType": "OneColumn"
						},
						{
							"Name": "Notebook Basic 19",
							"Availability": "Only 2 left",
							"AvailabilityState": "Warning",
							"Processor": "2,80 GHz quad core",
							"Monitor": "18\" LCD",
							"RAM": "4 GB DDR3 RAM",
							"HHD": "1000 GB Hard Disc",
							"HHDState": "Success",
							"OS": "Windows 8 Pro",
							"OSState": "Success"
						}
					]
				},
				"maxItems": 3,
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"info": {
						"value": "{Availability}",
						"state": "{AvailabilityState}"
					},
					"attributesLayoutType": "{AttributesLayoutType}",
					"attributes": [
						{
							"value": "{Processor}"
						},
						{
							"value": "{Monitor}"
						},
						{
							"value": "{RAM}"
						},
						{
							"value": "{HHD}",
							"state": "{HHDState}"
						},
						{
							"value": "{OS}",
							"state": "{OSState}",
							"showStateIcon": "{OSShowStateIcon}"
						}
					]
				}
			}
		}
	};

	var oManifest_TitleAndDescriptionFromParams = {
		"sap.app": {
			"id": "oManifest_TitleAndDescriptionFromParams"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"parameters": {
					"titleColumn": {
						"value": "salesOrder"
					},
					"descriptionColumn": {
						"value": "status"
					}
				}
			},
			"header": {
				"title": "Title and description from parameters"
			},
			"content": {
				"data": {
					"json": [
						{
							"product": "Beam Breaker B-1",
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
							"product": "Beam Breaker B-2",
							"salesOrder": "5000010051",
							"customer": "Entertainment Argentinia",
							"status": "Canceled",
							"statusState": "Error",
							"orderUrl": "http://www.sap.com",
							"percent": 70,
							"percentValue": "70 of 100",
							"progressState": "Success",
							"iconSrc": "sap-icon://help",
							"showStateIcon": true,
							"customStateIcon": "sap-icon://bbyd-active-sales"
						}
					]
				},
				"item": {
					"title": "{= ${}[${parameters>/titleColumn/value}]}",
					"description": "{= ${}[${parameters>/descriptionColumn/value}]}"
				}
			}
		}
	};

	var oManifest_ListCard_Microchart_Pagination = {
		"sap.app": {
			"id": "oManifest_ListCard_Microchart_Pagination"
		},
		"sap.card": {
			"type": "List",
			"data": {
				"json": {
					"items": [
						{
							"title": "Item 1",
							"group": "Group A",
							"agreed": 10,
							"consumed": 3
						},
						{
							"title": "Item 2",
							"group": "Group A",
							"agreed": 10,
							"consumed": 5
						},
						{
							"title": "Item 3",
							"group": "Group B",
							"agreed": 20,
							"consumed": 15
						},
						{
							"title": "Item 4",
							"group": "Group B",
							"agreed": 10,
							"consumed": 0
						}
					]
				}
			},
			"header": {
				"type": "Default",
				"title": "Sales Report"
			},
			"content": {
				"data": {
					"path": "/items"
				},
				"item": {
					"title": "{title}",
					"chart": {
						"type": "Bullet",
						"minValue": 0,
						"maxValue": "{agreed}",
						"value": "{consumed}",
						"scale": "%",
						"displayValue": "{consumed} of {agreed} Tickets"
					}
				},
				"group": {
					"title": "{group}",
					"order": {
						"path": "group",
						"dir": "ASC"
					}
				}
			},
			"footer": {
				"paginator": {
					"pageSize": 3
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
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("List Card - using manifest", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ListCard);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getAggregation("_content");
		var oList = oContent.getAggregation("_content");
		var aItems = oList.getItems();
		var oManifestData = oManifest_ListCard["sap.card"].content.data.json;

		// Assert
		assert.equal(oList.getAriaLabelledBy()[0], this.oCard.getCardHeader().getAggregation("_title").getId() + "-inner", "Should have correct table aria label");

		// Assert
		assert.ok(oContent, "List Card content form manifest should be set");

		// items highlight
		assert.equal(aItems[0].getHighlight(), oManifestData[0].state, "Should have correct highlight value");
		assert.equal(aItems[1].getHighlight(), oManifestData[1].state, "Should have correct highlight value");
		assert.equal(aItems[2].getHighlight(), oManifestData[2].state, "Should have correct highlight value");

		assert.equal(aItems[0].getHighlightText(), oManifestData[0].state, "Should have correct highlight text");
		assert.equal(aItems[1].getHighlightText(), oManifestData[1].state, "Should have correct highlight text");
		assert.equal(aItems[2].getHighlightText(), oManifestData[2].state, "Should have correct highlight text");
	});

	QUnit.test("List Card - static items", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ListCard_StaticContent);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getAggregation("_content");

		// Assert
		assert.ok(oContent, "List Card static content should be set");
	});

	QUnit.test("List Card - item title and description with string values", async function (assert) {
		// Arrange
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
							"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
							"Icon": "./images/Nonexistent.png"
						}]
					},
					"item": {
						"title": "{Name}",
						"description": "{Description}",
						"icon": {
							"src": "{Icon}",
							"shape": "Circle",
							"alt": "Human image"
						}
					}
				}
			}
		};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItem = this.oCard.getCardContent().getAggregation("_content").getItems()[0];
		var oItem = oManifest["sap.card"]["content"]["data"]["json"][0];

		// Assert
		assert.equal(oListItem.getDescription(), oItem.Description, "Item description should be set.");
		assert.equal(oListItem.getTitle(), oItem.Name, "Item title should be set.");
		assert.strictEqual(oListItem._getAvatar().getDisplaySize(), "S", "Item avatar should be set and to be with the correct size");
	});

	QUnit.test("List card with title and description defined by parameters", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_TitleAndDescriptionFromParams);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItems = this.oCard.getCardContent().getAggregation("_content").getItems();

		// Assert column values
		assert.equal(oListItems[0].getTitle(), "5000010050", "First item should have correct value for first column.");
		assert.equal(oListItems[0].getDescription(), "Delivered", "First item should have correct value for second column.");

		assert.equal(oListItems[1].getTitle(), "5000010051", "Second item should have correct value for first column.");
		assert.equal(oListItems[1].getDescription(), "Canceled", "Second item should have correct value for second column.");
	});

	QUnit.test("List Card - info field", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ListCard);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItem1 = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
			oListItem2 = this.oCard.getCardContent().getAggregation("_content").getItems()[1],
			oListItem3 = this.oCard.getCardContent().getAggregation("_content").getItems()[2],
			oListItem4 = this.oCard.getCardContent().getAggregation("_content").getItems()[3];

		assert.equal(oListItem1.$().find(".sapMObjStatusShowIcon").length, 1, "Status icon is shown");
		assert.equal(oListItem2.$().find(".sapMObjStatusShowIcon").length, 0, "Status icon is not shown");
		assert.equal(oListItem2.$().find(".sapMObjStatusIcon").length, 0, "Status icon div is not rendered");
		assert.equal(oListItem3.$().find(".sapMObjStatusShowIcon").length, 0, "Default status icon is not shown");
		assert.equal(oListItem3.$().find(".sapMObjStatusShowCustomIcon").length, 1, "Custom status icon is shown");
		assert.equal(oListItem2.$().find(".sapUiIntLCIInfo").length, 1, "Info is displayed when visibility is set to true");
		assert.equal(oListItem3.$().find(".sapUiIntLCIInfo").length, 1, "Info is displayed when visibility is not defined");
		assert.equal(oListItem4.$().find(".sapUiIntLCIInfo").length, 0, "Info is not displayed when visibility is set to false");
	});

	QUnit.test("Info visible property without binding", async function (assert) {
		// Arrange
		var oManifest = {
				"sap.app": {
					"id": "list.card.test.infoVisible"
				},
				"sap.card": {
					"type": "List",

					"content": {
						"data": {
							"json": [{
								"Name": "Comfort Easy",
								"Description": "32 GB Digital Assistant with high-resolution color screen"
							}]
						},
						"item": {
							"title": "{Name}",
							"description": "{Description}",
							"info": {
								"value": "100",
								"visible": false
							}
						}
					}
				}
			};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItem1 = this.oCard.getCardContent().getAggregation("_content").getItems()[0];

		assert.strictEqual(oListItem1.$().find(".sapUiIntLCIInfo").length, 0, "Info is not visible");
	});

	QUnit.test("Description visible property", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ListCard);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItem1 = this.oCard.getCardContent().getAggregation("_content").getItems()[3];

		assert.strictEqual(oListItem1.$().find(".sapUiIntLCIDescription").length, 0, "Description is not visible");
	});

	QUnit.test("List Card - attributes", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ListCard_Attributes);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItem1 = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
			oListItem2 = this.oCard.getCardContent().getAggregation("_content").getItems()[1],
			oListItem3 = this.oCard.getCardContent().getAggregation("_content").getItems()[2];


		// Assert
		assert.strictEqual(oListItem1.$().find(".sapUiIntLCIAttrRow").length, 3, "3 attr rows are created.");
		assert.strictEqual(oListItem1.$().find(".sapUiIntLCIAttrCell").length, 5, "5 attr cells are created.");
		assert.strictEqual(oListItem1.$().find(".sapUiIntLCIAttrSecondCell").length, 2, "2 attr second cells are created.");

		assert.strictEqual(oListItem2.$().find(".sapUiIntLCIAttrRow").length, 5, "5 attr rows are created.");
		assert.strictEqual(oListItem2.$().find(".sapUiIntLCIAttrCell").length, 5, "5 attr cells are created.");
		assert.notOk(oListItem2.$().find(".sapUiIntLCIAttrSecondCell").length, "attr second cells are not created.");

		assert.ok(oListItem2.$().find(".sapUiIntLCIAttrRow:nth-of-type(6) .sapMObjStatusShowIcon").length, "Status icon is shown");
		assert.notOk(oListItem3.$().find(".sapUiIntLCIAttrRow:nth-of-type(4) .sapMObjStatusShowIcon").length, "Status icon is not shown");

		QUnitUtils.triggerEvent("focusin", oListItem1.getDomRef());
		assert.notOk(oListItem1.getDomRef().getAttribute("aria-labelledby"), "aria-labelledby is not set when focused");
	});

	QUnit.test("List Card - attributes visibility", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "oManifest_ListCard_Attributes"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": [
							{
								"Name": "Notebook Basic 15",
								"Processor": "2,80 GHz quad core",
								"Monitor": "15\" LCD",
								"RAM": "4 GB DDR3 RAM",
								"HHD": "500 GB Hard Disc",
								"OS": "Windows"
							}
						]
					},
					"item": {
						"title": "{Name}",
						"attributes": [
							{
								"value": "{Processor}"
							},
							{
								"value": "{Monitor}",
								"visible": false
							},
							{
								"value": "{RAM}"
							},
							{
								"value": "{HHD}"
							},
							{
								"value": "{OS}",
								"visible": "{= ${OS} !== 'Windows'}"
							}
						]
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oListItem1 = this.oCard.getCardContent().getAggregation("_content").getItems()[0];

		// Assert
		assert.strictEqual(oListItem1.$().find(".sapUiIntLCIAttrRow").length, 2, "2 attr rows are created.");
		assert.strictEqual(oListItem1.$().find(".sapUiIntLCIAttrCell").length, 3, "3 attr cells are created.");
		assert.strictEqual(oListItem1.$().find(".sapUiIntLCIAttrSecondCell").length, 1, "1 attr second cells is created.");
	});

	QUnit.test("List Card - ActionsStrip", async function (assert) {
		// Arrange
		var oManifest = {
			"sap.app": {
				"id": "oManifest_ListCard_Actions_Strip"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Notebooks"
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Comfort Easy"
							},
							{
								"Name": "ITelO Vault"
							}
						]
					},
					"item": {
						"title": "{Name}",
						"actionsStrip": [
							{
								"text": "Add to Favorites {Name}",
								"visible": "{= !${IsFavorite}}"
							}
						]
					}
				}
			}
		};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oCardContent = this.oCard.getCardContent(),
			oList = oCardContent.getAggregation("_content"),
			oListContentItem = oList.getItems()[0],
			oActionsStrip = oListContentItem.getActionsStrip(),
			aItems = oActionsStrip._getToolbar().getContent();

		assert.strictEqual(aItems[1].getText(), "Add to Favorites Comfort Easy", "Action text is correct");
		assert.ok(aItems[1].getEnabled(), "Action is initially enabled");
	});

	QUnit.test("List Card - ActionsStrip with template", async function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "oManifest_ListCard_Actions_Strip"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Notebooks"
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Comfort Easy",
								"Actions": [{
									"text": "Action 1"
								}, {
									"text": "Action 2"
								}]
							},
							{
								"Name": "ITelO Vault"
							}
						]
					},
					"item": {
						"title": "{Name}",
						"actionsStrip": {
							"item": {
								"template": {
									"text": "{text}"
								},
								"path": "Actions"
							}
						}
					}
				}
			}
		};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oCardContent = this.oCard.getCardContent(),
			oList = oCardContent.getAggregation("_content"),
			oListContentItem = oList.getItems()[0],
			oActionsStrip = oListContentItem.getActionsStrip(),
			aItems = oActionsStrip._getToolbar().getContent();

		assert.strictEqual(aItems[1].getText(), "Action 1", "Action text is correct");
		assert.strictEqual(aItems[2].getText(), "Action 2", "Action text is correct");
	});

	QUnit.test("Using maxItems manifest property", async function (assert) {
		// Arrange
		var iMaxItems = oManifest_ListCard_MaxItems["sap.card"]["content"]["maxItems"];

		// Act
		this.oCard.setManifest(oManifest_ListCard_MaxItems);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var iNumberOfItems = this.oCard.getCardContent().getAggregation("_content").getItems().length;
		assert.ok(iNumberOfItems <= iMaxItems, "Should have less items than the maximum.");
	});

	QUnit.test("Using maxItems set through parameters", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ListCard_maxItems_Parameters);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var iNumberOfItems = this.oCard.getCardContent().getAggregation("_content").getItems().length;
		assert.strictEqual(iNumberOfItems, 2, "After Manifest is processed maxItems should be a number");
	});

	QUnit.test("Using maxItems set through binding", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ListCard_maxItems_Parameters_Binding);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var iNumberOfItems = this.oCard.getCardContent().getAggregation("_content").getItems().length;
		assert.strictEqual(iNumberOfItems, 2, "After Manifest is processed maxItems should be a number");
	});

	QUnit.test("Icon properties", async function (assert) {
		// Arrange
		var oManifest = {
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
								"initials": "IT"
							}
						}
					}
				}
			};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);

		var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

		assert.strictEqual(oAvatar.getSrc(), "test-resources/sap/ui/integration/qunit/testResources/images/Image_1.png", "Should have correct avatar src");
		assert.strictEqual(oAvatar.getDisplayShape(), oManifest["sap.card"].content.item.icon.shape, "Should have 'Circle' shape");
		assert.strictEqual(oAvatar.getTooltip_AsString(), oManifest["sap.card"].content.item.icon.alt, "Should have tooltip set");
		assert.strictEqual(oAvatar.getInitials(), oManifest["sap.card"].content.item.icon.initials, "Should have initials set");
		assert.ok(oAvatar.hasStyleClass("sapFCardIcon"), "'sapFCardIcon' class is added");
	});

	QUnit.test("Icon visible property", async function (assert) {
		// Arrange
		var oManifest = {
				"sap.app": {
					"id": "list.card.test.icon"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": [{
							"avatar": "images/Image_1.png",
							"iconVisible": false
						}]
					},
					"content": {
						"item": {
							"icon": {
								"src": "{avatar}",
								"shape": "Circle",
								"visible": "{iconVisible}"
							}
						}
					}
				}
			};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);

		var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();
		assert.strictEqual(oAvatar.getVisible(), false, "Should not have an icon when visible is set to false");
	});

	QUnit.test("Icon initials set with deprecated 'text' property", async function (assert) {
		// Arrange
		var oManifest = {
				"sap.app": {
					"id": "list.card.test.icon"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": [{}]
					},
					"content": {
						"item": {
							"icon": {
								"text": "IT"
							}
						}
					}
				}
			};

		// Act
		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

		// Assert
		assert.strictEqual(oAvatar.getInitials(), oManifest["sap.card"].content.item.icon.text, "Should have initials set");
	});

	QUnit.test("Default 'size' of icon when there is no description", async function (assert) {
		// Arrange
		var oManifest = {
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
							"title": "item title",
							"icon": {
								"src": "{avatar}"
							}
						}
					}
				}
			};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);

		var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

		assert.strictEqual(oAvatar.getDisplaySize(), "XS", "Should have 'XS' size");
	});

	QUnit.test("Default 'size' of icon when there are title and description", async function (assert) {
		// Arrange
		var oManifest = {
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

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);

		var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

		assert.strictEqual(oAvatar.getDisplaySize(), "S", "Should have 'S' size");
	});

	QUnit.test("Icon allows to set custom 'size'", async function (assert) {
		// Arrange
		var oManifest = {
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

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);

		var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

		assert.strictEqual(oAvatar.getDisplaySize(), "M", "Should have 'M' size");
	});

	QUnit.module("Overridden methods", {
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

	QUnit.test("#hideLoadingPlaceholders - Placeholder is hidden after loading has completed", async function (assert) {
		// Arrange
		var spy = sinon.spy(BaseListContent.prototype, "hideLoadingPlaceholders"),
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

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);

		assert.ok(spy.called, "The method in the base class for hiding placeholder is called.");
	});

	QUnit.module("Data and items length", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Data and items length when there is grouping", async function (assert) {
		// Arrange
		var oManifest = {
				"sap.app": {
					"id": "test.cards.list.itemsLengthGrouping"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Items Length"
					},
					"content": {
						"data": {
							"json": [
								{
									"Name": "Product 1",
									"Price": "100"
								},
								{
									"Name": "Product 2",
									"Price": "200"
								},
								{
									"Name": "Product 3",
									"Price": "200"
								}
							]
						},
						"item": {
							"title": "{Name}"
						},
						"group": {
							"title": "{= ${Price} > 150 ? 'Expensive' : 'Cheap'}",
							"order": {
								"path": "Price"
							}
						}
					}
				}
			};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);

		assert.strictEqual(this.oCard.getCardContent().getItemsLength(), 3, "#getItemsLength result should be correct");
		assert.strictEqual(this.oCard.getCardContent().getDataLength(), 3, "#getDataLength result should be correct");
	});

	QUnit.test("Data and items length when maxItems property is set", async function (assert) {
		// Arrange
		var oManifest = {
				"sap.app": {
					"id": "test.cards.list.itemsLengthGrouping"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Items Length"
					},
					"content": {
						"data": {
							"json": [
								{
									"Name": "Product 1"
								},
								{
									"Name": "Product 2"
								},
								{
									"Name": "Product 3"
								}
							]
						},
						"item": {
							"title": "{Name}"
						},
						"maxItems": 2
					}
				}
			};

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);

		assert.strictEqual(this.oCard.getCardContent().getItemsLength(), 2, "#getItemsLength result should be correct");
		assert.strictEqual(this.oCard.getCardContent().getDataLength(), 3, "#getDataLength result should be correct");
	});

	QUnit.module("Icons", {
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

	QUnit.test("'backgroundColor' when there is icon src", async function (assert) {
		// Arrange
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

		await nextCardReadyEvent(this.oCard);

		var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar();

		// Assert
		assert.strictEqual(oAvatar.getBackgroundColor(), AvatarColor.Transparent, "Background should be 'Transparent' when there is only icon.");
	});

	QUnit.test("'backgroundColor' when there are initials", async function (assert) {
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
							"initials": "{initials}"
						}
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oAvatar = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar(),
			sExpected = oAvatar.getMetadata().getPropertyDefaults().backgroundColor;

		// Assert
		assert.strictEqual(oAvatar.getBackgroundColor(), sExpected, "Background should have default value when there are initials.");
	});

	QUnit.test("Default icons when src is empty string and shape is 'Circle'", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "testListCard"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": [{
							"src": ""
						}]
					},
					"item": {
						"icon": {
							"src": "{src}",
							"shape": "Circle"
						}
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oAvatarIcon = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar()._getIcon(),
			sPersonPlaceHolder = "sap-icon://person-placeholder";

		// Assert
		assert.strictEqual(oAvatarIcon.getSrc(), sPersonPlaceHolder, "Should show 'sap-icon://person-placeholder' when icon src is empty and the shape is 'Circle'.");
	});

	QUnit.test("Default icons when src is empty string and shape is 'Square'", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "testListCard"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": [{
							"src": ""
						}]
					},
					"item": {
						"icon": {
							"src": "{src}",
							"shape": "Square"
						}
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oAvatarIcon = this.oCard.getCardContent().getAggregation("_content").getItems()[0]._getAvatar()._getIcon(),
			sProduct = "sap-icon://product";

		// Assert
		assert.strictEqual(oAvatarIcon.getSrc(), sProduct, "Should show 'sap-icon://product' when icon src is empty and the shape is 'Square'.");
	});

	QUnit.module("Loading of the Microchart library", {
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

	QUnit.test("Loading of Microchart library when there is NO chart in the content", async function (assert) {
		// Arrange
		var loadLibraryStub = sinon.stub(Library, "load");

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

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.ok(loadLibraryStub.notCalled, "Should NOT load Microchart library when there is no chart in the content.");
		// Clean up
		loadLibraryStub.restore();
	});

	QUnit.test("Loading of Microchart library when there is chart in the content", async function (assert) {
		// Arrange
		var loadLibraryStub = sinon.stub(Library, "load").resolves();

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

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.ok(loadLibraryStub.called, "Should load Microchart library when there is chart in the content.");
		// Clean up
		loadLibraryStub.restore();
	});

	QUnit.module("Microchart creation", {
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

	QUnit.test("Creation of Bullet MicroChart", function (assert) {
		testWithMicrochart(assert, this.oCard, oManifest_ListCard_BulletMicrochart, function (done) {
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
		testWithMicrochart(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart, function (done) {
			var oChart = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getMicrochart().getChart(),
				aBars = oChart.getBars(),
				oExpectedSettings = oManifest_ListCard_StackedBarMicrochart["sap.card"]["content"]["data"]["json"];

			// Assert
			assert.strictEqual(aBars.length, oExpectedSettings["Notebooks"].length, "Should have created 2 bars.");
			assert.strictEqual(oChart.getMaxValue(), oExpectedSettings.maxOverYears, "'maxValue' property from the manifest should be set to the chart.");
			assert.strictEqual(oChart.getDisplayZeroValue(), oExpectedSettings.displayZeroValue, "'displayZeroValue' property from the manifest should be set to the chart.");
			assert.strictEqual(aBars[0].getValue(), oExpectedSettings["Notebooks"][0]["Notebook13"], "'value' property from the bar in the manifest should be set to the chart.");
			assert.strictEqual(aBars[0].getDisplayValue(), oExpectedSettings["Notebooks"][0]["Notebook13Title"], "'displayValue' property from the bar in the manifest should be set to the chart.");
			assert.strictEqual(aBars[0].getValueColor(), oExpectedSettings["Notebooks"][0]["Notebook13Color"], "'color' property from the bar in the manifest should be set to the chart.");

			done();
		}.bind(this));
	});

	QUnit.test("Bullet MicroCharts sizes are equal", function (assert) {
		testWithMicrochart(assert, this.oCard, oManifest_ListCard_BulletMicrochartMultiple, function (done) {
			var $charts = this.oCard.$().find(".sapUiIntMicrochartChart"),
				sMaxWidth,
				bMaxWidthIsSame = true;

			setTimeout(function () {
				$charts.find(".sapUiIntMicrochartChartInner").each(function (iInd, oElement) {
					var sElementMaxWidth = oElement.style.maxWidth;

					if (!sMaxWidth) {
						sMaxWidth = sElementMaxWidth;
					}

					if (!sElementMaxWidth || sElementMaxWidth !== sMaxWidth) {
						bMaxWidthIsSame = false;
					}
				});

				// Assert
				assert.ok(bMaxWidthIsSame, "All charts have same max width");

				done();
			}, 100);
		}.bind(this));
	});

	QUnit.test("StackedBar MicroCharts sizes are equal", function (assert) {
		testWithMicrochart(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart, function (done) {
			var $charts = this.oCard.$().find(".sapUiIntMicrochartChart"),
				sMaxWidth,
				bMaxWidthIsSame = true;

			setTimeout(function () {
				$charts.find(".sapUiIntMicrochartChartInner").each(function (iInd, oElement) {
					var sElementMaxWidth = oElement.style.maxWidth;

					if (!sMaxWidth) {
						sMaxWidth = sElementMaxWidth;
					}

					if (!sElementMaxWidth || sElementMaxWidth !== sMaxWidth) {
						bMaxWidthIsSame = false;
					}
				});

				// Assert
				assert.ok(bMaxWidthIsSame, "All charts have same max width");

				done();
			}, 100);
		}.bind(this));
	});

	QUnit.test("Visibility of MicroChart", function (assert) {
		var oManifest = {
			"sap.app": {
				"id": "oManifest_ListCard_StackedBarMicrochartVisibility"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": {
							"chartVisible": false
						}
					},
					"item": {
						"title": "{Year}",
						"chart": {
							"type": "StackedBar",
							"visible": "{chartVisible}",
							"bars": [
								{
									"value": "{Notebook17}"
								}
							]
						}
					}
				}
			}
		};

		testWithMicrochart(assert, this.oCard, oManifest, function (done) {
			var oMicrochart = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getMicrochart();
			var oLegend = this.oCard.getCardContent().getAggregation("_legend");

			assert.strictEqual(oMicrochart.getVisible(), false, "Visibility is correctly resolved.");
			assert.strictEqual(oLegend.getVisible(), false, "Visibility is correctly resolved.");

			done();
		}.bind(this));
	});

	QUnit.test("Creation of Microcharts and Pagination", function (assert) {
		const done = assert.async();

		const fnLoadDependencies = sinon.stub(ListContent.prototype, "loadDependencies").callsFake(function(){
			return new Promise(function (resolve) {
				pIfMicrochartsAvailable
					.then(function () {
						setTimeout(function () {
							resolve();
						}, 100);
					})
					.catch(function () {
						assert.ok(true, "Usage of Microcharts is not available with this distribution.");
						fnLoadDependencies.restore();
						done();
					});
			});
		});

		const oCard = this.oCard;

		oCard.attachEventOnce("_ready", function () {
			pIfMicrochartsAvailable
				.then(function () {
					const oPaginator = oCard.getAggregation("_footer").getPaginator();

					assert.ok(oPaginator, "paginator is created");
					assert.strictEqual(oPaginator.getPageCount(), 2, "page count is correct");

					fnLoadDependencies.restore();
					done();
				});
		});
		oCard.setManifest(oManifest_ListCard_Microchart_Pagination);
	});

	QUnit.module("Legend", {
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

	QUnit.test("There should be a legend when chart type is 'StackedBar'", function (assert) {
		testWithMicrochart(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart, function (done) {
			assert.ok(this.oCard.getCardContent().getAggregation("_legend"), "Legend is created.");
			done();
		}.bind(this));
	});

	QUnit.test("Relative binding - the legend items should have correct titles", function (assert) {
		testWithMicrochart(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart, async function (done) {
			// Arrange
			await nextUIUpdate();
			var aExpectedTitles = oManifest_ListCard_StackedBarMicrochart["sap.card"]["content"]["data"]["json"]["Notebooks"],
				aActualTitles = this.oCard.getCardContent().getAggregation("_legend").getAggregation("_titles");

			// Assert
			assert.strictEqual(aActualTitles[0].getText(), aExpectedTitles[0].Notebook13Title, "Relative binding to the item is resolved correctly.");
			assert.strictEqual(aActualTitles[1].getText(), aExpectedTitles[1].Notebook17Title, "Relative binding to the item is resolved correctly.");
			done();
		}.bind(this));
	});

	QUnit.test("Absolute binding- the legend items should have correct titles", function (assert) {
		testWithMicrochart(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart_AbsoluteBinding, async function (done) {
			// Arrange
			await nextUIUpdate();
			var oTitles = oManifest_ListCard_StackedBarMicrochart_AbsoluteBinding["sap.card"]["content"]["data"]["json"]["titles"],
				aActualTitles = this.oCard.getCardContent().getAggregation("_legend").getAggregation("_titles");

			// Assert
			assert.strictEqual(aActualTitles[0].getText(), oTitles.Notebook13, "Absolute binding is resolved correctly.");
			assert.strictEqual(aActualTitles[1].getText(), oTitles.Notebook17, "Absolute binding is resolved correctly.");
			done();
		}.bind(this));
	});

	QUnit.test("No binding- the legend items should have the same titles as the chart bars", function (assert) {
		testWithMicrochart(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart_NoBinding, async function (done) {
			// Arrange
			await nextUIUpdate();
			var aExpectedTitles = oManifest_ListCard_StackedBarMicrochart_NoBinding["sap.card"]["content"]["item"]["chart"]["bars"],
				aActualTitles = this.oCard.getCardContent().getAggregation("_legend").getAggregation("_titles");

			// Assert
			assert.strictEqual(aActualTitles[0].getText(), aExpectedTitles[0].legendTitle, "Title is set correctly.");
			assert.strictEqual(aActualTitles[1].getText(), aExpectedTitles[1].legendTitle, "Title is set correctly.");
			done();
		}.bind(this));
	});

	QUnit.test("Legend is destroyed when the card type has changed", function (assert) {
		testWithMicrochart(assert, this.oCard, oManifest_ListCard_StackedBarMicrochart, function (done) {
			assert.ok(this.oCard.getCardContent().getAggregation("_legend"), "Legend is created when it is needed.");

			this.oCard.attachEvent("_ready", function () {
				assert.notOk(this.oCard.getCardContent().getAggregation("_legend"), "Legend is destroyed when it is NO longer needed.");
				done();
			}.bind(this));

			this.oCard.setManifest(oManifest_ListCard);
		}.bind(this));
	});

	MemoryLeakCheck.checkControl("ListContent", function () {
		var oListContent = new ListContent();

		sinon.stub(oListContent, "getCardInstance").returns({
			getId: function () {
				return "id1";
			},
			getBindingContext: function () {
				return undefined;
			},
			getBindingNamespaces: function () {
				return {};
			},
			isSkeleton: function () {
				return false;
			},
			addActiveLoadingProvider: function () { },
			removeActiveLoadingProvider: function () { },
			getManifestEntry: function () { },
			getPreviewMode: function () { },
			getHeight: function () { },
			getContentMinItems: function () {
				return null;
			}
		});

		oListContent.setActions(new CardActions());
		oListContent.setConfiguration({
			item: {}
		});

		return oListContent;
	});

	QUnit.module("List Card Rendering", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Rounded corners is applied on focusin of the last item", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ListCard);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getCardContent();
		var aItems = oContent.getInnerList().getItems();
		var oFirstItem = aItems[0];
		var oLastItem = aItems[aItems.length - 1];

		// Assert
		assert.notOk(oFirstItem.getDomRef().classList.contains("sapUiIntLCIRoundedCorners"), "Rounded corners class should NOT be applied on the first item");
		assert.notOk(oLastItem.getDomRef().classList.contains("sapUiIntLCIRoundedCorners"), "Rounded corners class should NOT be applied on the last item yet");

		// Act
		QUnitUtils.triggerEvent("focusin", oFirstItem.getDomRef());

		// Assert
		assert.notOk(oFirstItem.getDomRef().classList.contains("sapUiIntLCIRoundedCorners"), "Rounded corners class should NOT be applied on the first item");

		// Act
		QUnitUtils.triggerEvent("focusin", oLastItem.getDomRef());

		// Assert
		assert.ok(oLastItem.getDomRef().classList.contains("sapUiIntLCIRoundedCorners"), "Rounded corners class should be applied on the last item");

	});

	QUnit.module("List card grouping", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("List card items can be grouped", async function (assert) {
		// Act
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.listGrouping.card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "List Card"
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Product 1",
								"Price": "100"
							},
							{
								"Name": "Product 2",
								"Price": "200"
							}
						]
					},
					"item": {
						"title": "{Name}",
						"description": "{Price}"
					},
					"group": {
						"title": "{= ${Price} > 150 ? 'Expensive' : 'Cheap'}",
						"order": {
							"path": "Price",
							"dir": "DESC"
						}
					}
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		const aItems = this.oCard.getCardContent().getInnerList().getItems();

		// Assert
		assert.strictEqual(aItems.length, 4, "There are two list items and two group titles in the list.");
		assert.ok(aItems[0].isA("sap.m.GroupHeaderListItem"), "The first item of the list is the group title");
		assert.strictEqual(aItems[0].getTitle(), "Expensive", "The group title is correct");
	});

	QUnit.test("List card grouping with microcharts", function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "test.card.listGrouping.card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "List Card"
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Product 1",
								"Price": "100"
							},
							{
								"Name": "Product 2",
								"Price": "200"
							}
						]
					},
					"item": {
						"title": "{Name}",
						"chart": {
							"type": "StackedBar",
							"bars": [
								{
									"value": 1000
								}
							]
						}
					},
					"group": {
						"title": "{= ${Price} > 150 ? 'Expensive' : 'Cheap'}",
						"order": {
							"path": "Price"
						}
					}
				}
			}
		};

		testWithMicrochart(assert, this.oCard, oManifest, (done) => {
			const aItems = this.oCard.getCardContent().getInnerList().getItems();

			// Assert
			assert.strictEqual(aItems.length, 4, "There are two list items and two group titles in the list.");
			assert.ok(aItems[0].isA("sap.m.GroupHeaderListItem"), "The first item of the list is the group title");
			assert.strictEqual(aItems[0].getTitle(), "Cheap", "The group title is correct");

			done();
		});
	});
});
