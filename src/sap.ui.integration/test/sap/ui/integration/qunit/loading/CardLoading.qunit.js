/* global QUnit, sinon */

sap.ui.define([
		"sap/ui/integration/widgets/Card",
		"sap/ui/integration/util/RequestDataProvider",
		"sap/ui/core/Core",
		"sap/ui/integration/util/LoadingProvider",
		"sap/ui/integration/cards/BaseContent",
		"sap/ui/integration/cards/Header",
		"sap/ui/integration/cards/filters/SelectFilter",
		"sap/ui/integration/library",
		"sap/ui/thirdparty/jquery"
	],
	function (
		Card,
		RequestDataProvider,
		Core,
		LoadingProvider,
		BaseContent,
		Header,
		Filter,
		integrationLibrary,
		jQuery
	) {
		"use strict";

		var CardArea = integrationLibrary.CardArea;

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var oManifest_CardCase1 = {
			"sap.app": {
				"id": "test.card.loading.card1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"data": {
						"request": {
							"url": "items.json"
						}
					},
					"title": "Some title",
					"subTitle": "{some}",
					"icon": {
						"src": "{totalResults}"
					},
					"status": {
						"text": "{totalResults} of 200"
					}
				}
			}
		};

		var oManifest_CardCase2 = {
			"sap.app": {
				"id": "test.card.loading.card2"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"request": {
						"url": "items.json"
					}
				},
				"header": {
					"data": {
						"path": "/"
					},
					"title": "Some title",
					"subTitle": "{some}",
					"icon": {
						"src": "{totalResults}"
					},
					"status": {
						"text": "{totalResults} of 200"
					}
				}
			}
		};

		var oManifest_CardCase3_No_Loading = {
			"sap.app": {
				"id": "test.card.loading.card3"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"request": {
						"url": "items.json"
					}
				},
				"header": {
					"data": {
						"json": {
							"some": "test",
							"img": "./images/Image_1.png"
						}
					},
					"title": "Some title",
					"subTitle": "{some}",
					"icon": {
						"src": "{img}"
					},
					"status": {
						"text": "{some} of 200"
					}
				}
			}
		};

		var oManifest_NumericHeader_ContentLevel = {
			"sap.app": {
				"id": "test.card.loading.card4"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"request": {
							"url": "items.json"
						}
					},
					"title": "Project Cloud Transformation {n}",
					"subTitle": "Depending on {n}",
					"unitOfMeasurement": "{n}",
					"mainIndicator": {
						"number": "{n}",
						"unit": "{u}",
						"trend": "{trend}",
						"state": "{valueColor}"
					},
					"details": "{n}",
					"sideIndicators": [{
							"title": "{n}",
							"number": "{n}",
							"unit": "K"
						},
						{
							"title": "{n}",
							"number": "22.43",
							"unit": "%"
						}
					]
				}
			}
		};

		var oManifest_NumericHeader_CardLevel = {
			"sap.app": {
				"id": "test.card.loading.card5"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"request": {
						"url": "items.json"
					}
				},
				"header": {
					"type": "Numeric",
					"data": {
						"path": "/"
					},
					"title": "Project Cloud Transformation {n}",
					"subTitle": "Depending on {n}",
					"unitOfMeasurement": "{n}",
					"mainIndicator": {
						"number": "{n}",
						"unit": "{u}",
						"trend": "{trend}",
						"state": "{valueColor}"
					},
					"details": "{n}",
					"sideIndicators": [{
							"title": "{n}",
							"number": "{n}",
							"unit": "K"
						},
						{
							"title": "{n}",
							"number": "{n}",
							"unit": "%"
						}
					]
				}
			}
		};

		var oManifest_NumericHeader_CardLevel_ContentJson = {
			"sap.app": {
				"id": "test.card.loading.card6"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"request": {
						"url": "items.json"
					}
				},
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
					"title": "Project Cloud Transformation {n}",
					"subTitle": "Depending on {n}",
					"unitOfMeasurement": "{n}",
					"mainIndicator": {
						"number": "{n}",
						"unit": "{u}",
						"trend": "{trend}",
						"state": "{valueColor}"
					},
					"details": "{n}",
					"sideIndicators": [{
							"title": "{n}",
							"number": "{n}",
							"unit": "K"
						},
						{
							"title": "{n}",
							"number": "22.43",
							"unit": "%"
						}
					]
				}
			}
		};

		var oManifest_List_CardLevel = {
			"sap.app": {
				"id": "test.card.loading.card7"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "items.json"
					}
				},
				"type": "List",
				"header": {
					"title": "Title",
					"subTitle": "Test Subtitle",
					"icon": {
						"src": "sap-icon://business-objects-experience"
					},
					"status": {
						"text": {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"/count"
								]
							}
						}
					}
				},
				"content": {
					"data": {
						"path": "/items"
					},
					"maxItems": 2,
					"item": {
						"icon": {
							"src": "{icon}"
						},
						"title": {
							"value": "{title}"
						},
						"description": {
							"value": "{description}"
						},
						"highlight": "{highlight}",
						"info": {
							"state": "{infoState}"
						}
					}
				}
			}
		};

		var oManifest_List_CardLevel_Error = {
			"sap.app": {
				"id": "test.card.loading.card8"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "some/invalid.data.json"
					}
				},
				"type": "List",
				"header": {
					"title": "Title",
					"subTitle": "Test Subtitle",
					"icon": {
						"src": "sap-icon://business-objects-experience"
					},
					"status": {
						"text": {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"/count"
								]
							}
						}
					}
				},
				"content": {
					"data": {
						"path": "/items"
					},
					"maxItems": 2,
					"item": {
						"icon": {
							"src": "{icon}"
						},
						"title": {
							"value": "{title}"
						},
						"description": {
							"value": "{description}"
						},
						"highlight": "{highlight}",
						"info": {
							"state": "{infoState}"
						}
					}
				}
			}
		};

		var oManifest_List_CardLevel_No_Loading = {
			"sap.app": {
				"id": "test.card.loading.card9"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "items.json"
					}
				},
				"type": "List",
				"header": {
					"title": "Title",
					"subTitle": "Test Subtitle",
					"icon": {
						"src": "sap-icon://business-objects-experience"
					},
					"status": {
						"text": {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"/count"
								]
							}
						}
					}
				},
				"content": {
					"data": {
						"json": {
							"items": [{
									"title": "Laurent Dubois",
									"icon": "../images/Elena_Petrova.png",
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
									"icon": "../images/Alain_Chevalier.png",
									"description": "I am Alain. I put great attention to detail.",
									"infoState": "Success",
									"info": "Credit Analyst",
									"highlight": "Error"
								},
								{
									"title": "Alain Chevalier",
									"icon": "../images/Monique_Legrand.png",
									"description": "I am Alain. I put great attention to detail.",
									"infoState": "Information",
									"info": "Configuration Expert",
									"highlight": "Information"
								},
								{
									"title": "Alain Chevalier",
									"icon": "../images/Alain_Chevalier.png",
									"description": "I am Alain. I put great attention to detail.",
									"highlight": "Warning"
								},
								{
									"title": "Laurent Dubois",
									"icon": "../images/Elena_Petrova.png",
									"description": "I am Laurent. I put great attention to detail.",
									"infoState": "Error",
									"info": "Manager",
									"highlight": "Success",
									"action": {
										"url": "https://www.w3schools.com"
									}
								}
							],
							"count": 115
						}
					},
					"maxItems": 2,
					"item": {
						"icon": {
							"src": "{icon}"
						},
						"title": {
							"value": "{title}"
						},
						"description": {
							"value": "{description}"
						},
						"highlight": "{highlight}",
						"info": {
							"state": "{infoState}"
						}
					}
				}
			}
		};

		var oManifest_List_ContentLevel = {
			"sap.app": {
				"id": "test.card.loading.card10"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Title",
					"subTitle": "Test Subtitle",
					"icon": {
						"src": "sap-icon://business-objects-experience"
					},
					"status": {
						"text": {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"/count"
								]
							}
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "items.json"
						}
					},
					"maxItems": 2,
					"item": {
						"icon": {
							"src": "{icon}"
						},
						"title": {
							"value": "{title}"
						},
						"description": {
							"value": "{description}"
						},
						"highlight": "{highlight}",
						"info": {
							"state": "{infoState}"
						}
					}
				}
			}
		};

		var oManifest_AnalyticalCard = {
			"sap.app": {
				"id": "test.card.loading.card11"
			},
			"sap.card": {
				"type": "Analytical",
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
					"chartType": "StackedBar",
					"legend": {
						"visible": "{legendVisible}",
						"position": "Bottom",
						"alignment": "Center"
					},
					"plotArea": {
						"dataLabel": {
							"visible": true,
							"showTotal": false
						},
						"categoryAxisText": {
							"visible": false
						},
						"valueAxisText": {
							"visible": true
						}
					},
					"title": {
						"text": "Stacked Bar chart",
						"visible": true,
						"alignment": "Center"
					},
					"measureAxis": "valueAxis",
					"dimensionAxis": "categoryAxis",
					"data": {
						"request": {
							"url": "items.json"
						}
					},
					"dimensions": [{
						"label": "Weeks",
						"value": "{Week}"
					}],
					"measures": [{
							"label": "{measures/revenueLabel}",
							"value": "{Revenue}"
						},
						{
							"label": "{measures/costLabel}",
							"value": "{Cost}"
						}
					]
				}
			}
		};

		var oManifest_ObjectCard = {
			"sap.app": {
				"id": "test.card.loading.card12"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"request": {
						"url": "items.json"
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
									"value": "{phone}",
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
									"actions": [
										{
											"type": "Navigation",
											"parameters": {
												"url": "mailto:{email}"
											}
										}
									]
								}
							]
						},
						{
							"title": "Organizational Details",
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
									"label": "Email",
									"value": "{company/email}",
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
									"actions": [
										{
											"type": "Navigation",
											"parameters": {
												"url": "{company/url}"
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

		var Manifest_TableCard_WithCardLevelData = {
			"sap.app": {
				"id": "test.card.loading.card13"
			},
			"sap.card": {
				"type": "Table",
				"data": {
					"request": {
						"url": "items.json"
					}
				},
				"header": {
					"title": "Sales Orders for Key Accounts"
				},
				"content": {
					"row": {
						"columns": [{
								"label": "Sales Order",
								"value": "{salesOrder}",
								"identifier": true
							},
							{
								"label": "Customer",
								"value": "{customer}"
							},
							{
								"label": "Status",
								"value": "{status}",
								"state": "{statusState}"
							},
							{
								"label": "Order ID",
								"value": "{orderUrl}",
								"url": "{orderUrl}"
							},
							{
								"label": "Progress",
								"progressIndicator": {
									"percent": "{percent}",
									"text": "{percentValue}",
									"state": "{progressState}"
								}
							},
							{
								"label": "Avatar",
								"icon": {
									"src": "{iconSrc}"
								}
							}
						]
					}
				}
			}
		};

		var oManifest_Filter = {
			"sap.app": {
				"id": "test.card.loading.card14"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"filters": {
						"f": {
							"data": {
								"request": {
									"url": "items.json"
								}
							}
						}
					}
				}
			}
		};

		var oManifest_Filter_Static_Items = {
			"sap.app": {
				"id": "test.card.loading.card15"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"filters": {
						"f": {
							"items": []
						}
					}
				}
			}
		};

		var oManifest_All_Sections_Loading = {
			"sap.app": {
				"id": "test.card.loading.card16"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"filters": {
						"f": {
							"data": {
								"request": {
									"url": "./manifests/manifest.json"
								}
							}
						}
					}
				},
				"header": {
					"data": {
						"request": {
							"url": "./manifests/manifest.json"
						}
					},
					"title": "{some}"
				},
				"content": {
					"data": {
						"request": {
							"url": "./manifests/manifest.json"
						}
					},
					"item": {
						"title": {
							"value": "{title}"
						}
					}
				}
			}
		};

		var oManifest_Header_IconStatic = {
			"sap.app": {
				"id": "test.card.loading.card17",
				"type": "card"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"data": {
						"request": {
							"url": "items.json"
						}
					},
					"title": "{some}",
					"subTitle": "{some}",
					"icon": {
						"src": "sap-icon://list"
					}
				},
				"content": {}
			}
		};

		var oManifest_Calendar_CardLevel = {
			"sap.app": {
				"id": "test.card.loading.card18"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "calendar.json"
					}
				},
				"type": "Calendar",
				"header": {
					"title": "Title",
					"subTitle": "Test Subtitle",
					"icon": {
						"src": "sap-icon://business-objects-experience"
					},
					"status": {
						"text": {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"/count"
								]
							}
						}
					}
				},
				"content": {
					"date": "2020-09-18",
					"maxItems": 5,
					"maxLegendItems": 5,
					"noItemsText": "You have nothing planned for this day",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}"
							},
							"type": "{type}",
							"actions": [
								{
									"type": "Navigation",
									"enabled": "{= ${url}}",
									"parameters": {
										"url": "{url}"
									}
								}
							]
						},
						"path": "/item"
					},
					"specialDate": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"type": "{type}"
						},
						"path": "/specialDate"
					},
					"legendItem": {
						"template": {
							"category": "{category}",
							"text": "{text}",
							"type": "{type}"
						},
						"path": "/legendItem"
					},
					"moreItems": {
						"actions": [
							{
								"type": "Navigation",
								"enabled": true,
								"parameters": {
									"url": "http://sap.com"
								}
							}
						]
					}
				}
			}
		};

		var oManifest_Calendar_CardLevel_Error = {
			"sap.app": {
				"id": "test.card.loading.card21"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "some/invalid.data.json"
					}
				},
				"type": "Calendar",
				"header": {
					"title": "Title",
					"subTitle": "Test Subtitle",
					"icon": {
						"src": "sap-icon://business-objects-experience"
					},
					"status": {
						"text": {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"/count"
								]
							}
						}
					}
				},
				"content": {
					"data": {
						"path": "/items"
					},
					"date": "2020-09-18",
					"maxItems": 5,
					"maxLegendItems": 5,
					"noItemsText": "You have nothing planned for this day",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}"
							},
							"type": "{type}",
							"actions": [
								{
									"type": "Navigation",
									"enabled": "{= ${url}}",
									"parameters": {
										"url": "{url}"
									}
								}
							]
						},
						"path": "/item"
					},
					"specialDate": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"type": "{type}"
						},
						"path": "/specialDate"
					},
					"legendItem": {
						"template": {
							"category": "{category}",
							"text": "{text}",
							"type": "{type}"
						},
						"path": "/legendItem"
					},
					"moreItems": {
						"actions": [
							{
								"type": "Navigation",
								"enabled": true,
								"parameters": {
									"url": "http://sap.com"
								}
							}
						]
					}
				}
			}
		};

		var oManifest_Calendar_CardLevel_No_Loading = {
			"sap.app": {
				"id": "test.card.loading.card20"
			},
			"sap.card": {
				"data": {
					"request": {
						"url": "items.json"
					}
				},
				"type": "Calendar",
				"header": {
					"title": "Title",
					"subTitle": "Test Subtitle",
					"icon": {
						"src": "sap-icon://business-objects-experience"
					},
					"status": {
						"text": {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"/count"
								]
							}
						}
					}
				},
				"content": {
					"data": {
						"json": {
							"item": [
								{
									"start": "2020-09-18T09:00",
									"end": "2020-09-18T10:00",
									"title": "Payment reminder",
									"icon": "sap-icon://desktop-mobile",
									"type": "Type06",
									"url": "http://sap.com"
								},
								{
									"start": "2020-09-18T17:00",
									"end": "2020-09-18T17:30",
									"title": "Private appointment",
									"icon": "sap-icon://desktop-mobile",
									"type": "Type07"
								},
								{
									"start": "2020-09-18T12:00",
									"end": "2020-09-18T13:00",
									"title": "Lunch",
									"text": "working",
									"icon": "sap-icon://desktop-mobile",
									"type": "Type03",
									"url": "http://sap.com"
								},
								{
									"start": "2020-09-16T08:30",
									"end": "2020-09-18T17:30",
									"title": "Workshop",
									"text": "Out of office",
									"icon": "sap-icon://sap-ui5",
									"type": "Type07"
								},
								{
									"start": "2020-09-18T14:00",
									"end": "2020-09-18T16:30",
									"title": "Discussion with clients",
									"text": "working",
									"icon": "sap-icon://desktop-mobile",
									"url": "http://sap.com"
								},
								{
									"start": "2020-09-18T01:00",
									"end": "2020-09-18T02:00",
									"title": "Team meeting",
									"text": "online meeting",
									"icon": "sap-icon://sap-ui5",
									"type": "Type04"
								},
								{
									"start": "2020-09-18T04:00",
									"end": "2020-09-18T06:30",
									"title": "Discussion with clients",
									"text": "working",
									"icon": "sap-icon://desktop-mobile",
									"url": "http://sap.com"
								},
								{
									"start": "2020-09-18T01:00",
									"end": "2020-09-18T02:00",
									"title": "Team meeting",
									"text": "online meeting",
									"icon": "sap-icon://sap-ui5",
									"type": "Type04"
								}
							],
							"specialDate": [
								{
									"start": "2020-09-13",
									"end": "2020-09-14",
									"type": "Type08"
								},
								{
									"start": "2020-09-24",
									"end": "2020-09-24",
									"type": "Type13"
								}
							],
							"legendItem": [
								{
									"category": "calendar",
									"text": "Team building",
									"type": "Type08"
								},
								{
									"category": "calendar",
									"text": "Public holiday",
									"type": "Type13"
								},
								{
									"category": "appointment",
									"text": "Reminder",
									"type": "Type06"
								},
								{
									"category": "appointment",
									"text": "Private appointment",
									"type": "Type07"
								},
								{
									"category": "appointment",
									"text": "Out of office",
									"type": "Type03"
								},
								{
									"category": "appointment",
									"text": "Collaboration with other team members",
									"type": "Type07"
								}
							]
						}
					},
					"date": "2020-09-18",
					"maxItems": 5,
					"maxLegendItems": 5,
					"noItemsText": "You have nothing planned for this day",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}"
							},
							"type": "{type}",
							"actions": [
								{
									"type": "Navigation",
									"enabled": "{= ${url}}",
									"parameters": {
										"url": "{url}"
									}
								}
							]
						},
						"path": "/item"
					},
					"specialDate": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"type": "{type}"
						},
						"path": "/specialDate"
					},
					"legendItem": {
						"template": {
							"category": "{category}",
							"text": "{text}",
							"type": "{type}"
						},
						"path": "/legendItem"
					},
					"moreItems": {
						"actions": [
							{
								"type": "Navigation",
								"enabled": true,
								"parameters": {
									"url": "http://sap.com"
								}
							}
						]
					}
				}
			}
		};

		var oManifest_Calendar_ContentLevel = {
			"sap.app": {
				"id": "test.card.loading.card19"
			},
			"sap.card": {
				"type": "Calendar",
				"header": {
					"title": "Title",
					"subTitle": "Test Subtitle",
					"icon": {
						"src": "sap-icon://business-objects-experience"
					},
					"status": {
						"text": {
							"format": {
								"translationKey": "i18n>CARD.COUNT_X_OF_Y",
								"parts": [
									"parameters>/visibleItems",
									"/count"
								]
							}
						}
					}
				},
				"content": {
					"data": {
						"request": {
							"url": "calendar.json"
						}
					},
					"date": "2020-09-18",
					"maxItems": 5,
					"maxLegendItems": 5,
					"noItemsText": "You have nothing planned for this day",
					"item": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"title": "{title}",
							"text": "{text}",
							"icon": {
								"src": "{icon}"
							},
							"type": "{type}",
							"actions": [
								{
									"type": "Navigation",
									"enabled": "{= ${url}}",
									"parameters": {
										"url": "{url}"
									}
								}
							]
						},
						"path": "/item"
					},
					"specialDate": {
						"template": {
							"startDate": "{start}",
							"endDate": "{end}",
							"type": "{type}"
						},
						"path": "/specialDate"
					},
					"legendItem": {
						"template": {
							"category": "{category}",
							"text": "{text}",
							"type": "{type}"
						},
						"path": "/legendItem"
					},
					"moreItems": {
						"actions": [
							{
								"type": "Navigation",
								"enabled": true,
								"parameters": {
									"url": "http://sap.com"
								}
							}
						]
					}
				}
			}
		};

		function isLoadingIndicatorShowingHeader(oManifest, oCard, bLoading, bExpectedTitle, bExpectedSubtitle, bExpectedAvatar, assert) {

			// Arrange
			var done = assert.async();
			oCard.attachManifestReady(function () {
				var oDelegate = {
					onAfterRendering: function () {
						oCard.removeEventDelegate(oDelegate);
						var oHeader = oCard.getCardHeader();
						assert.strictEqual(oHeader.isLoading(), bLoading, "isLoading should be 'true'");
						assert.strictEqual(oHeader.getDomRef().classList.contains("sapFCardHeaderLoading"), bLoading, "On header level there is a 'sapFCardHeaderLoading' CSS class");
						assert.strictEqual(oHeader._getTitle().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedTitle, "Title has no loading placeholder");
						assert.strictEqual(oHeader._getSubtitle().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedSubtitle, "Subtitle has a loading placeholder");
						assert.strictEqual(oHeader._getAvatar().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedAvatar, "Avatar has a loading placeholder");
						done();
					}
				};
				oCard.addEventDelegate(oDelegate, this);
			}.bind(this));

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}

		function isLoadingIndicatorShowingNumericHeader(oManifest, oCard, bLoading, bExpectedTitle, bExpectedSubtitle, bExpectedDetails, bExpectMainIndicator, bExpectSideIndicator, assert) {

			// Arrange
			var done = assert.async();
			oCard.attachManifestReady(function () {
				var oDelegate = {
					onAfterRendering: function () {
						oCard.removeEventDelegate(oDelegate);
						var oHeader = oCard.getCardHeader();
						assert.strictEqual(oHeader.isLoading(), bLoading, "isLoading should be 'true'");
						assert.strictEqual(oHeader.getDomRef().classList.contains("sapFCardHeaderLoading"), bLoading, "On header level there is a 'sapFCardHeaderLoading' CSS class");
						assert.strictEqual(oHeader._getTitle().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedTitle, "Title has no loading placeholder");
						assert.strictEqual(oHeader._getSubtitle().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedSubtitle, "Subtitle has no loading placeholder");
						assert.strictEqual(oHeader._getDetails().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectedDetails,  "Details has no loading placeholder");
						assert.strictEqual(oHeader._getNumericIndicators()._getMainIndicator().getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectMainIndicator,  "Main indicator has no loading placeholder");
						assert.strictEqual(oHeader.getSideIndicators()[0].getDomRef().classList.contains("sapFCardHeaderItemBinded"), bExpectSideIndicator,  "Side indicators has no loading placeholder");
						done();
					}
				};

				oCard.addEventDelegate(oDelegate, this);
			}.bind(this));

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}

		function isLoadingIndicatorShowingContent(oManifest, oCard, sMassage, bExpected, sCSSClass, assert) {

			// Arrange
			var done = assert.async();
			oCard.attachManifestReady(function () {
				var oDelegate = {
					onAfterRendering: function () {
						oCard.removeEventDelegate(oDelegate);
						var oContent = oCard.getCardContent();
						if (oContent) {
							assert.strictEqual(jQuery(sCSSClass).length > 0, bExpected, sMassage);
							done();
						}
					}
				};

				oCard.addEventDelegate(oDelegate, this);
			}.bind(this));

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}

		function isLoadingIndicatorShowingContentDataReady(oManifest, oCard, sMassage, bExpected, sCSSClass, assert) {

			// Arrange
			var done = assert.async();
			oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oContent = oCard.getCardContent();
				if (oContent) {
					assert.strictEqual(jQuery(sCSSClass).length > 0, bExpected, sMassage);
					done();
				}
			});

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}

		function isLoadingPlaceholderCorrectType(oLoadingProvider, oConfiguration, sType, sPlaceholderType, sMessage, assert) {

			// Arrange
			var oPlaceholder = oLoadingProvider.createContentPlaceholder(oConfiguration, sType);

			//Act
			assert.ok(oPlaceholder.getMetadata().getName().indexOf(sPlaceholderType) > -1, sMessage);
		}

		function isLoadingIndicatorShowingFilter(oManifest, oCard, sMassage, bExpected, sCSSClass, assert) {

			// Arrange
			var done = assert.async();
			oCard.attachManifestReady(function () {
				var oDelegate = {
					onAfterRendering: function () {
						oCard.removeEventDelegate(oDelegate);
						var oContent = oCard.getAggregation("_filterBar");
						if (oContent) {
							assert.strictEqual(jQuery(sCSSClass).length > 0, bExpected, sMassage);
							done();
						}
					}
				};

				oCard.addEventDelegate(oDelegate, this);
			}.bind(this));

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}

		QUnit.module("Loading", {
			beforeEach: function () {
				var fnFake = function (oRequestConfig) {

					return new Promise(function (resolve, reject) {

						var oRequest = {
							"mode": oRequestConfig.mode || "cors",
							"url": "test-resources/sap/ui/integration/qunit/testResources/" + oRequestConfig.url,
							"method": (oRequestConfig.method && oRequestConfig.method.toUpperCase()) || "GET",
							"data": oRequestConfig.parameters,
							"headers": oRequestConfig.headers,
							"timeout": 15000,
							"xhrFields": {
								"withCredentials": !!oRequestConfig.withCredentials
							}
						};

						if (oRequest.method === "GET") {
							oRequest.dataType = "json";
						}
						jQuery.ajax(oRequest).done(function (oData) {
							setTimeout(function () {
								resolve(oData);
							}, 150000000);
						}).fail(function (jqXHR, sTextStatus, sError) {
							reject(sError);
						});
					});
				};

				this.oCard = new Card({
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});
				this._fnRequestStub = sinon.stub(RequestDataProvider.prototype, "_fetch").callsFake(fnFake);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this._fnRequestStub.restore();
			}
		});


		QUnit.test("Default Header - Title should not have a loading indicator and all other controls should", function (assert) {
			isLoadingIndicatorShowingHeader(oManifest_CardCase1, this.oCard, true, false, true, true, assert);
		});

		QUnit.test("Default Header - Title should not have a loading indicator and all other controls should - card level level request", function (assert) {
			isLoadingIndicatorShowingHeader(oManifest_CardCase2, this.oCard, true, false, true, true, assert);
		});

		QUnit.test("Default Header - No loading indicator should be present - card level request, json data on header level", function (assert) {
			isLoadingIndicatorShowingHeader(oManifest_CardCase3_No_Loading, this.oCard, false, false, true, false, assert);
		});

		QUnit.test("Numeric Header - Elements should  have a loading indicator - content level request", function (assert) {
			isLoadingIndicatorShowingNumericHeader(oManifest_NumericHeader_ContentLevel, this.oCard, true, true, true, true, true, true, assert);
		});

		QUnit.test("Numeric Header - Elements should  have a loading indicator - card level level request", function (assert) {
			isLoadingIndicatorShowingNumericHeader(oManifest_NumericHeader_CardLevel, this.oCard, true, true, true, true, true, true, assert);
		});

		QUnit.test("Numeric Header - No loading indicator should be present - card level request, json data on content level", function (assert) {
			isLoadingIndicatorShowingNumericHeader(oManifest_NumericHeader_CardLevel_ContentJson, this.oCard, false, true, true, true, true, true, assert);
		});

		QUnit.test("Header - Avatar with static icon src should not show loading placeholder", function (assert) {
			isLoadingIndicatorShowingHeader(oManifest_Header_IconStatic, this.oCard, true, true, true, false, assert);
		});

		QUnit.test("List - Loading indicator should be present - card level request", function (assert) {
			isLoadingIndicatorShowingContent(oManifest_List_CardLevel, this.oCard, "List content has a loading placeholder", true, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("List - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContent(oManifest_List_ContentLevel, this.oCard, "List content has a loading placeholder", true, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("Calendar - Loading indicator should be present - card level request", function (assert) {
			isLoadingIndicatorShowingContent(oManifest_Calendar_CardLevel, this.oCard, "Calendar content has a loading placeholder", true, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("Calendar - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContent(oManifest_Calendar_ContentLevel, this.oCard, "Calendar content has a loading placeholder", true, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("Analytical - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContent(oManifest_AnalyticalCard, this.oCard, "Analytical content has a loading placeholder", true, ".sapFCardContentGenericPlaceholder", assert);
		});

		QUnit.test("Object - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContent(oManifest_ObjectCard, this.oCard, "Object content has a loading placeholder", true, ".sapFCardContentObjectPlaceholder", assert);
		});

		QUnit.test("Table - Loading indicator should be present - card level request", function (assert) {
			isLoadingIndicatorShowingContent(Manifest_TableCard_WithCardLevelData, this.oCard, "Table content has a loading placeholder", true, ".sapFCardContentTablePlaceholder", assert);
		});

		QUnit.test("Filter - Loading indicator should be present", function (assert) {
			isLoadingIndicatorShowingFilter(oManifest_Filter, this.oCard, "Filter has a loading placeholder", true, ".sapFCardFilterLoading", assert);
		});

		QUnit.module("Loading with loaded data", {
			beforeEach: function () {
				this.oCard = new Card({
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("List - Loading indicator should not be present - card level request, content level JSON", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_List_CardLevel_No_Loading, this.oCard, "List content does not have a loading placeholder", false, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("List - Loading indicator should not be present - card level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_List_CardLevel, this.oCard, "List content does not have a loading placeholder", false, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("Calendar - Loading indicator should not be present - card level request, content level JSON", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_Calendar_CardLevel_No_Loading, this.oCard, "Calendar content does not have a loading placeholder", false, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("Calendar - Loading indicator should not be present - card level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_Calendar_CardLevel, this.oCard, "Calendar content does not have a loading placeholder", false, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("Filter - Loading indicator should not be present when using static items", function (assert) {
			isLoadingIndicatorShowingFilter(oManifest_Filter_Static_Items, this.oCard, "Filter does not have a loading placeholder", false, ".sapFCardFilterLoading", assert);
		});

		QUnit.test("List - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_List_ContentLevel, this.oCard, "List content has a loading placeholder", false, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("Calendar - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_Calendar_ContentLevel, this.oCard, "Calendar content has a loading placeholder", false, ".sapFCardContentPlaceholder", assert);
		});

		QUnit.test("Analytical - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_AnalyticalCard, this.oCard, "Analytical content has a loading placeholder", false, ".sapFCardContentGenericPlaceholder", assert);
		});

		QUnit.test("Object - Loading indicator should be present - content level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_ObjectCard, this.oCard, "Object content has a loading placeholder", false, ".sapFCardContentObjectPlaceholder", assert);
		});

		QUnit.test("Table - Loading indicator should be present - card level request", function (assert) {
			isLoadingIndicatorShowingContentDataReady(Manifest_TableCard_WithCardLevelData, this.oCard, "Table content has a loading placeholder", false, ".sapFCardContentGenericPlaceholder", assert);
		});

		QUnit.test("List - error should be visible when request can not be resolved", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_List_CardLevel_Error, this.oCard, "Error content is visible", true, ".sapFCardErrorContent", assert);
		});

		QUnit.test("Calendar - error should be visible when request can not be resolved", function (assert) {
			isLoadingIndicatorShowingContentDataReady(oManifest_Calendar_CardLevel_Error, this.oCard, "Error content is visible", true, ".sapFCardErrorContent", assert);
		});

		QUnit.module("Placeholders lifecycle", {
			beforeEach: function () {
				this.oCard = new Card({
					baseUrl: "test-resources/sap/ui/integration/qunit/"
				});

				this.oCard.setManifest(oManifest_All_Sections_Loading);
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Placeholders are shown when the data starts loading", function (assert) {
			var done = assert.async();

			this.oCard.attachManifestReady(function () {
				var oDelegate = {
					onAfterRendering: function () {
						this.oCard.removeEventDelegate(oDelegate);

						var oHeader = this.oCard.getCardHeader();
						assert.strictEqual(oHeader.isLoading(), true, "Header is loading");
						assert.strictEqual(oHeader.getDomRef().classList.contains("sapFCardHeaderLoading"), true, "Header is showing placeholders");

						var oFilterBar = this.oCard.getAggregation("_filterBar");
						oFilterBar._getFilters().forEach(function (oFilter) {
							assert.strictEqual(oFilter.isLoading(), true, "Filter is loading");
							assert.strictEqual(oFilter.getDomRef().classList.contains("sapFCardFilterLoading"), true, "Filter is showing a placeholder");
						});

						var oContent = this.oCard.getCardContent();
						assert.strictEqual(oContent.isLoading(), true, "Content is loading");
						assert.notStrictEqual(oContent.getDomRef().querySelector(".sapFCardContentPlaceholder"), null, "Content is showing a placeholder");

						done();
					}
				};
				this.oCard.addEventDelegate(oDelegate, this);
			}.bind(this));

		});

		QUnit.test("Placeholders are removed when the data loads", function (assert) {
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oHeader = this.oCard.getCardHeader();
				assert.strictEqual(oHeader.isLoading(), false, "Header is not loading");
				assert.strictEqual(oHeader.getDomRef().classList.contains("sapFCardHeaderLoading"), false, "Header is not showing placeholders");

				var oFilterBar = this.oCard.getAggregation("_filterBar");
				oFilterBar._getFilters().forEach(function (oFilter) {
					assert.strictEqual(oFilter.isLoading(), false, "Filter is not loading");
					assert.strictEqual(oFilter.getDomRef().classList.contains("sapFCardFilterLoading"), false, "Filter is not showing a placeholder");
				});

				var oContent = this.oCard.getCardContent();
				assert.strictEqual(oContent.isLoading(), false, "Content is not loading");
				assert.strictEqual(oContent.getDomRef().querySelector(".sapFCardContentPlaceholder"), null, "Content is not showing a placeholder");

				assert.strictEqual(this.oCard.isLoading(), false, "Card is not loading");

				// Cleanup
				done();
			}.bind(this));
		});

		QUnit.test("Content is shown only after loading placeholder is hidden", function (assert) {
			var done = assert.async(),
				oCard = this.oCard;

			assert.expect(4);

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Arrange
				var oContent = oCard.getCardContent(),
					bShouldBeLoading = true;

				oContent.addEventDelegate({
					onAfterRendering: function () {
						var bContentLoading = !!oCard.$().find(".sapFCardContentLoading").length,
							bPlaceholderVisible = !!oCard.$().find(".sapFCardContentPlaceholder").length;

						if (bShouldBeLoading) {
							// Assert
							assert.ok(bContentLoading, "Content is hidden before re-rendering.");
							assert.ok(bPlaceholderVisible, "Placeholder is shown before re-rendering.");

							// Act
							bShouldBeLoading = false;
							oCard.hideLoadingPlaceholders(CardArea.Content);
							Core.applyChanges();
						} else {
							// Assert
							assert.notOk(bContentLoading, "Content is shown after re-rendering.");
							assert.notOk(bPlaceholderVisible, "Placeholder is hidden after re-rendering.");

							done();
						}
					}
				});

				// Act
				oCard.showLoadingPlaceholders(CardArea.Content);
				Core.applyChanges();
			});

		});

		QUnit.module("Loading Provider", {
			beforeEach: function () {
				this.oLoadingProvider = new LoadingProvider();
				this.oCard = new Card({
					baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
				});

			},
			afterEach: function () {
				this.oLoadingProvider.destroy();
				this.oLoadingProvider = null;
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Loading provider should provide correct loading placeholder", function (assert) {
			var oConfiguration = {
					"maxItems": 2
				},
				sType = "List";

			isLoadingPlaceholderCorrectType(this.oLoadingProvider, oConfiguration, sType, "List", "Loading placeholder is of type ListPlaceholder", assert);
		});

		QUnit.test("Loading provider should provide correct loading placeholder", function (assert) {
			var oConfiguration = {
					"maxItems": 2
				},
				sType = "Calendar";

			isLoadingPlaceholderCorrectType(this.oLoadingProvider, oConfiguration, sType, "Calendar", "Loading placeholder is of type CalendarPlaceholder", assert);
		});

		QUnit.test("Loading provider should provide correct loading placeholder", function (assert) {
			var oConfiguration = {
					"maxItems": 2
				},
				sType = "Table";

			isLoadingPlaceholderCorrectType(this.oLoadingProvider, oConfiguration, sType, "Table", "Loading placeholder is of type TablePlaceholder", assert);
		});

		QUnit.test("Loading provider should provide correct loading placeholder", function (assert) {
			var sType = "Object";

			isLoadingPlaceholderCorrectType(this.oLoadingProvider, {}, sType, "Object", "Loading placeholder is of type ObjectPlaceholder", assert);
		});

		QUnit.test("Loading provider should provide correct loading placeholder", function (assert) {
			var sType = "Analytical";

			isLoadingPlaceholderCorrectType(this.oLoadingProvider, {}, sType, "Generic", "Loading placeholder is of type GenericPlaceholder", assert);
		});

		QUnit.test("setConfiguration of BaseContent should be called with sType as a parameter", function (assert) {

			// Arrange
			var done = assert.async();

			var fnSetConfigurationSpy = sinon.spy(BaseContent.prototype, "setConfiguration");
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();
				var oConfiguration = this.oCard.getCardContent().getConfiguration();

				assert.ok(fnSetConfigurationSpy.calledWithExactly(oConfiguration, "List"), "setConfiguration is called with two arguments 'oConfiguration and sType'");

				// Cleanup
				fnSetConfigurationSpy.restore();
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_List_CardLevel);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Card Loading Placeholder API", {
			beforeEach: function () {
				this.oCard = new Card({
					baseUrl: "test-resources/sap/ui/integration/qunit/"
				});

				// Act
				this.oCard.setManifest(oManifest_All_Sections_Loading);
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Placeholders are toggled for individual sections of the card: showLoadingPlaceholders", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Arrange
				var oSandbox = sinon.createSandbox(),
					fnShowPlaceholderHeaderSpy = oSandbox.spy(Header.prototype, "showLoadingPlaceholders"),
					fnShowPlaceholderFiltersSpy = oSandbox.spy(Filter.prototype, "showLoadingPlaceholders"),
					fnShowPlaceholderContentSpy = oSandbox.spy(BaseContent.prototype, "showLoadingPlaceholders");

				// Act
				this.oCard.showLoadingPlaceholders();

				setTimeout(function () {
					// Assert
					assert.strictEqual(fnShowPlaceholderHeaderSpy.called, true, "Header#showLoadingPlaceholders has been called internally");
					assert.strictEqual(fnShowPlaceholderContentSpy.called, true, "BaseContent#showLoadingPlaceholders has been called internally");
					assert.strictEqual(fnShowPlaceholderFiltersSpy.called, true, "Filter#showLoadingPlaceholders has been called internally");

					// Clean-up
					oSandbox.restore();
					done();

				}, 200);

			}.bind(this));
		});

		QUnit.test("Placeholders are toggled for individual sections of the card: hideLoadingPlaceholders", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Arrange
				var oSandbox = sinon.createSandbox(),
					fnHidePlaceholderHeaderSpy = oSandbox.spy(Header.prototype, "hideLoadingPlaceholders"),
					fnHidePlaceholderFiltersSpy = oSandbox.spy(Filter.prototype, "hideLoadingPlaceholders"),
					fnHidePlaceholderContentSpy = oSandbox.spy(BaseContent.prototype, "hideLoadingPlaceholders");

				// Act
				this.oCard.hideLoadingPlaceholders();

				setTimeout(function () {
					// Assert
					assert.strictEqual(fnHidePlaceholderHeaderSpy.called, true, "Header#hideLoadingPlaceholders has been called internally");
					assert.strictEqual(fnHidePlaceholderContentSpy.called, true, "BaseContent#hideLoadingPlaceholders has been called internally");
					assert.strictEqual(fnHidePlaceholderFiltersSpy.called, true, "Filter#hideLoadingPlaceholders has been called internally");

					// Clean-up
					oSandbox.restore();
					done();

				}, 200);

			}.bind(this));
		});

		QUnit.test("Placeholders can be toggled separately for different sections of the card: showLoadingPlaceholders", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Arrange
				var oSandbox = sinon.createSandbox(),
					fnShowPlaceholderHeaderSpy = oSandbox.spy(Header.prototype, "showLoadingPlaceholders"),
					fnShowPlaceholderFiltersSpy = oSandbox.spy(Filter.prototype, "showLoadingPlaceholders"),
					fnShowPlaceholderContentSpy = oSandbox.spy(BaseContent.prototype, "showLoadingPlaceholders");

				// Act
				this.oCard.showLoadingPlaceholders(CardArea.Header);
				this.oCard.showLoadingPlaceholders(CardArea.Content);

				setTimeout(function () {
					// Assert
					assert.strictEqual(fnShowPlaceholderHeaderSpy.called, true, "Header#showLoadingPlaceholders has been called internally");
					assert.strictEqual(fnShowPlaceholderContentSpy.called, true, "BaseContent#showLoadingPlaceholders has been called internally");
					assert.strictEqual(fnShowPlaceholderFiltersSpy.called, false, "Filter#showLoadingPlaceholders has not been called internally");

					// Clean-up
					oSandbox.restore();
					done();

				}, 200);

			}.bind(this));
		});

		QUnit.test("Placeholders can be toggled separately for different sections of the card: hideLoadingPlaceholders", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Arrange
				var oSandbox = sinon.createSandbox(),
					fnHidePlaceholderHeaderSpy = oSandbox.spy(Header.prototype, "hideLoadingPlaceholders"),
					fnHidePlaceholderFiltersSpy = oSandbox.spy(Filter.prototype, "hideLoadingPlaceholders"),
					fnHidePlaceholderContentSpy = oSandbox.spy(BaseContent.prototype, "hideLoadingPlaceholders");

				// Act
				this.oCard.hideLoadingPlaceholders(CardArea.Header);
				this.oCard.hideLoadingPlaceholders(CardArea.Content);

				setTimeout(function () {
					// Assert
					assert.strictEqual(fnHidePlaceholderHeaderSpy.called, true, "Header#hideLoadingPlaceholders has been called internally");
					assert.strictEqual(fnHidePlaceholderContentSpy.called, true, "BaseContent#hideLoadingPlaceholders has been called internally");
					assert.strictEqual(fnHidePlaceholderFiltersSpy.called, false, "Filter#hideLoadingPlaceholders has not been called internally");

					// Clean-up
					oSandbox.restore();
					done();

				}, 200);

			}.bind(this));
		});

		QUnit.test("Card#showLoadingPlaceholders when there is footer", function (assert) {
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				this.oCard.showLoadingPlaceholders();

				setTimeout(function () {
					assert.ok(
						this.oCard.getAggregation("_footer").getDomRef().classList.contains("sapFCardFooterLoading"),
						"Loading class should be added to the footer"
					);
					done();
				}.bind(this), 200);

			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.loading"
				},
				"sap.card": {
					"type": "List",
					"content": {
						"item": {
							"title": {
								"value": "{title}"
							}
						}
					},
					"footer": {
						"actionsStrip": [{
							"text": "{someBindingPath}"
						}]
					}
				}
			});
		});

	});
