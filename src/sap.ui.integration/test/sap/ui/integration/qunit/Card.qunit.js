/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/f/cards/ListContent",
	"sap/f/cards/AnalyticalContent",
	"sap/ui/core/Core",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/NumericSideIndicator",
	"sap/f/cards/Header",
	"sap/base/Log",
	"sap/ui/core/ComponentContainer"
],
	function (
		Card,
		ListContent,
		AnalyticalContent,
		Core,
		NumericHeader,
		NumericSideIndicator,
		Header,
		Log,
		ComponentContainer
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
							"value": "Stationed in: {{parameters.city}}, {{parameters.country}}"
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

		var oManifest_AnalyticalCard = {
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
						"visible": true,
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
						"json": [
							{
								"Week": "CW14",
								"Revenue": 431000.22,
								"Cost": 230000.00,
								"Cost1": 24800.63,
								"Cost2": 205199.37,
								"Cost3": 199999.37,
								"Target": 500000.00,
								"Budget": 210000.00
							},
							{
								"Week": "CW15",
								"Revenue": 494000.30,
								"Cost": 238000.00,
								"Cost1": 99200.39,
								"Cost2": 138799.61,
								"Cost3": 200199.37,
								"Target": 500000.00,
								"Budget": 224000.00
							},
							{
								"Week": "CW16",
								"Revenue": 491000.17,
								"Cost": 221000.00,
								"Cost1": 70200.54,
								"Cost2": 150799.46,
								"Cost3": 80799.46,
								"Target": 500000.00,
								"Budget": 238000.00
							},
							{
								"Week": "CW17",
								"Revenue": 536000.34,
								"Cost": 280000.00,
								"Cost1": 158800.73,
								"Cost2": 121199.27,
								"Cost3": 108800.46,
								"Target": 500000.00,
								"Budget": 252000.00
							},
							{
								"Week": "CW18",
								"Revenue": 675000.00,
								"Cost": 230000.00,
								"Cost1": 140000.91,
								"Cost2": 89999.09,
								"Cost3": 100099.09,
								"Target": 600000.00,
								"Budget": 266000.00
							},
							{
								"Week": "CW19",
								"Revenue": 680000.00,
								"Cost": 250000.00,
								"Cost1": 172800.15,
								"Cost2": 77199.85,
								"Cost3": 57199.85,
								"Target": 600000.00,
								"Budget": 280000.00
							},
							{
								"Week": "CW20",
								"Revenue": 659000.14,
								"Cost": 325000.00,
								"Cost1": 237200.74,
								"Cost2": 87799.26,
								"Cost3": 187799.26,
								"Target": 600000.00,
								"Budget": 294000.00
							}
						]
					},
					"dimensions": [
						{
							"label": "Weeks",
							"value": "{Week}"
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

		var oManifest_ObjectCard = {
			"sap.app": {
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"firstName": "Donna",
						"lastName": "Moore",
						"position": "Sales Executive",
						"phone": "+1 202 555 5555",
						"email": "my@mymail.com",
						"photo": "./Woman_avatar_01.png",
						"manager": {
							"firstName": "John",
							"lastName": "Miller",
							"photo": "./Woman_avatar_02.png"
						},
						"company": {
							"name": "Robert Brown Entertainment",
							"address": "481 West Street, Anytown OH 45066, USA",
							"email": "mail@mycompany.com",
							"emailSubject": "Subject",
							"website": "www.company_a.example.com",
							"url": "http://www.company_a.example.com"
						}
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
									"value": "{phone}",
									"type": "phone"
								},
								{
									"label": "Email",
									"value": "{email}",
									"type": "email"
								}
							]
						},
						{
							"title": "Organizational Details",
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
									"label": "Email",
									"value": "{company/email}",
									"emailSubject": "{company/emailSubject}",
									"type": "email"
								},
								{
									"label": "Website",
									"value": "{company/website}",
									"url": "{company/url}",
									"type": "link"
								}
							]
						}
					]
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
								"state": "{statusState}"
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

		var oManifest_TableCard_WithCardLevelData = {
			"sap.card": {
				"type": "Table",
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
				"header": {
					"title": "Sales Orders for Key Accounts"
				},
				"content": {
					"row": {
						"columns": [
							{
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

		var oManifest_TableCard_MaxItems = {
			"sap.card": {
				"type": "Table",
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
				"header": {
					"title": "Sales Orders for Key Accounts"
				},
				"content": {
					"maxItems": 3,
					"row": {
						"columns": [
							{
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

		var oManifest_TableCard_StaticContent = {
			"sap.card": {
				"type": "Table",
				"header": {
					"title": "Table Card with Static content",
					"subTitle": "Table Card subtitle"
				},
				"content": {
					"columns": [
						{
							"title": "Avatar",
							"width": "15%"
						},
						{
							"title": "First Name"
						},
						{
							"title": "Last Name"
						},
						{
							"title": "Progress"
						}
					],
					"rows": [
						{
							"cells": [
								{
									"icon": {
										"src": "../images/Woman_avatar_01.png"
									}
								},
								{
									"value": "Petra"
								},
								{
									"value": "Maier"
								},
								{
									"progressIndicator": {
										"percent": 70,
										"text": "70 of 100",
										"state": "Success"
									}
								}
							]
						},
						{
							"cells": [
								{
									"width": "12%",
									"icon": {
										"src": "../images/Woman_avatar_02.png"
									}
								},
								{
									"value": "Anna"
								},
								{
									"value": "Smith"
								},
								{
									"progressIndicator": {
										"percent": 30,
										"text": "40 of 100",
										"state": "Warning"
									}
								}
							],
							"actions": [
								{
									"type": "Navigation",
									"url": "https://www.sap.com"
								}
							]
						}
					]
				}
			}
		};

		var oManifest_AvatarHeader = {
			"sap.card": {
				"type": "List",
				"header": {
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

		var oManifest_Today_Parameter = {
			"sap.card": {
				"type": "List",
				"header": {
					"title": "Default manifest parameters",
					"subTitle": "{{parameters.TODAY_ISO}}"
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
				oCard = new Card();

			assert.expect(1);
			oStub.callsFake(function (mSettings) {
				assert.deepEqual(
					mSettings.manifest,
					oExpectedComponentManifest,
					"A ComponentContainer is created with expected settings"
				);

				mSettings.componentCreated();

				oStub.restore();
				oCard.destroy();
				done();
			});

			// Act
			oCard.setManifest(oCardManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		}

		QUnit.module("Init");

		QUnit.test("Initialization - ListContent", function (assert) {
			testContentInitialization(oManifest_ListCard, assert);
		});

		QUnit.test("Initialization - AnalyticalContent", function (assert) {
			testContentInitialization(oManifest_AnalyticalCard, assert);
		});

		QUnit.test("Initialization - TableContent", function (assert) {
			testContentInitialization(oManifest_TableCard, assert);
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


		QUnit.module("Analytical Card", {
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

		QUnit.test("Using manifest", function (assert) {

			// Arrange
			var done = assert.async(),
				window = {
					"start": "firstDataPoint",
					"end": "lastDataPoint"
				};

			this.oCard.attachEvent("_ready", function () {
				var oContent = this.oCard.getAggregation("_content"),
					oChart = oContent.getAggregation("_content"),
					oVizProperites = oChart.getVizProperties();

				Core.applyChanges();

				// Assert aggregation sideIndicators
				assert.ok(oContent, "Analytical Card content form manifest should be set");
				assert.ok(oChart.getDomRef(), "Analytical Card content - chart should be rendered");
				assert.equal(oChart.getVizType(), "stacked_bar", "Chart should have a vizType set");
				assert.equal(oVizProperites.legend.visible, true, "Chart should have a legend visible property set to true");
				assert.equal(oVizProperites.legendGroup.layout.position, "bottom", "Chart should have a legend position property set to bottom");
				assert.equal(oVizProperites.legendGroup.layout.alignment, "center", "Chart should have a legend alignment property set to center");
				assert.equal(oVizProperites.plotArea.window.end, window.end, "Chart should have a plotAreas window property set to this window object");
				assert.equal(oVizProperites.plotArea.window.start, window.start, "Chart should have a plotAreas window property set to this window object");
				assert.equal(oVizProperites.plotArea.dataLabel.visible, true, "Chart should have a plotArea.datalabel.visible set to true");
				assert.equal(oVizProperites.plotArea.dataLabel.showTotal, false, "Chart should have a plotArea.datalabel.showTotal set to false");
				assert.equal(oVizProperites.categoryAxis.title.visible, false, "Chart should have a categoryAxis.title.visible set to false");
				assert.equal(oVizProperites.valueAxis.title.visible, true, "Chart should have a valueAxis.title.visible set to false");
				assert.equal(oVizProperites.title.visible, true, "Chart should have a title.visible set to true");
				assert.equal(oVizProperites.title.text, "Stacked Bar chart", "Chart should have a title.text set to true");
				assert.equal(oVizProperites.title.alignment, "center", "Chart should have a title.alignment set to center");
				assert.equal(oChart.getFeeds()[0].getProperty("uid"), "valueAxis", "Chart should have a feed item whit property 'uid'");
				assert.equal(oChart.getFeeds()[0].getProperty("type"), "Measure", "Chart should have a feed item whit property 'Measure'");
				assert.equal(oChart.getFeeds()[1].getProperty("uid"), "categoryAxis", "Chart should have a feed item whit property 'uid'");
				assert.equal(oChart.getFeeds()[1].getProperty("type"), "Dimension", "Chart should have a feed item whit property 'Measure'");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_AnalyticalCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

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

		QUnit.test("Using maxItems set trough parameters", function (assert) {

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

		QUnit.module("Object Card", {
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

		QUnit.test("Using manifest", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var oObjectContent = this.oCard.getAggregation("_content");
				var oContent = oObjectContent.getAggregation("_content");
				var oHeader = this.oCard.getAggregation("_header");
				var aGroups = oContent.getContent();
				var oData = oManifest_ObjectCard["sap.card"].data.json;
				var oManifestContent = oManifest_ObjectCard["sap.card"].content;

				Core.applyChanges();

				assert.equal(aGroups.length, 3, "Should have 3 groups.");

				// Header assertions
				assert.equal(oHeader.getTitle(), oData.firstName + " " + oData.lastName, "Should have correct header title.");
				assert.equal(oHeader.getSubtitle(), oData.position, "Should have correct header subtitle.");
				assert.equal(oHeader.getIconSrc(), oData.photo, "Should have correct header icon source.");

				// Group 1 assertions
				assert.equal(aGroups[0].getItems().length, 9, "Should have 9 items.");
				assert.equal(aGroups[0].getItems()[0].getText(), oManifestContent.groups[0].title, "Should have correct group title.");
				assert.equal(aGroups[0].getItems()[1].getText(), oManifestContent.groups[0].items[0].label + ":", "Should have correct item label.");
				assert.equal(aGroups[0].getItems()[2].getText(), oData.firstName, "Should have correct item value.");
				assert.equal(aGroups[0].getItems()[3].getText(), oManifestContent.groups[0].items[1].label + ":", "Should have correct item label.");
				assert.equal(aGroups[0].getItems()[4].getText(), oData.lastName, "Should have correct item value.");
				assert.equal(aGroups[0].getItems()[5].getText(), oManifestContent.groups[0].items[2].label + ":", "Should have correct item label.");
				assert.equal(aGroups[0].getItems()[6].getText(), oData.phone, "Should have correct item value.");
				assert.equal(aGroups[0].getItems()[6].getHref(), "tel:" + oData.phone, "Should have correct phone link.");

				// Group 2 assertions
				assert.equal(aGroups[1].getItems().length, 2, "Should have 2 items.");
				assert.equal(aGroups[1].getItems()[0].getText(), oManifestContent.groups[1].title, "Should have correct group title.");
				assert.equal(aGroups[1].getItems()[1].getItems()[0].getSrc(), oData.manager.photo, "Should have correct image source.");
				assert.equal(aGroups[1].getItems()[1].getItems()[1].getItems()[0].getText(), oManifestContent.groups[1].items[0].label + ":", "Should have correct item label");
				assert.equal(aGroups[1].getItems()[1].getItems()[1].getItems()[1].getText(), oData.manager.firstName + " " + oData.manager.lastName, "Should have correct item value.");

				// Group 3 assertions
				assert.equal(aGroups[2].getItems().length, 9, "Should have 9 items.");
				assert.equal(aGroups[2].getItems()[0].getText(), oManifestContent.groups[2].title, "Should have correct group title.");
				assert.equal(aGroups[2].getItems()[1].getText(), oManifestContent.groups[2].items[0].label + ":", "Should have correct item label.");
				assert.equal(aGroups[2].getItems()[2].getText(), oData.company.name, "Should have correct item value.");
				assert.equal(aGroups[2].getItems()[3].getText(), oManifestContent.groups[2].items[1].label + ":", "Should have correct item label.");
				assert.equal(aGroups[2].getItems()[4].getText(), oData.company.address, "Should have correct item value.");
				assert.equal(aGroups[2].getItems()[5].getText(), oManifestContent.groups[2].items[2].label + ":", "Should have correct item label.");
				assert.equal(aGroups[2].getItems()[6].getText(), oData.company.email, "Should have correct item value.");
				assert.equal(aGroups[2].getItems()[6].getHref(), "mailto:" + oData.company.email + "?subject=" + oData.company.emailSubject, "Should have correct item link.");
				assert.equal(aGroups[2].getItems()[8].getText(), oData.company.website, "Should have correct item value.");
				assert.equal(aGroups[2].getItems()[8].getHref(), oData.company.url, "Should have correct item URL.");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ObjectCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Spacing between groups are correctly calculated", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var oObjectContent = this.getAggregation("_content");
				var oContent = oObjectContent.getAggregation("_content");
				var oEvent = { size: { width: 400 }, oldSize: { width: 0 }, control: oContent };

				Core.applyChanges();

				//This is the case when 2 groups are in one column and the last group is on another row
				oObjectContent.onAlignedFlowLayoutResize(oEvent);
				assert.ok(oContent.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The first group should have the separation class");
				assert.ok(!oContent.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The second group should not have the separation class");
				assert.ok(oContent.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The last group should have the separation class");

				//This is the case when all groups are in one column
				oEvent.size.width = 200;
				oObjectContent.onAlignedFlowLayoutResize(oEvent);
				assert.ok(!oContent.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
				assert.ok(!oContent.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
				assert.ok(!oContent.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");

				//This is the case when all groups are in one row
				oEvent.size.width = 800;
				oObjectContent.onAlignedFlowLayoutResize(oEvent);
				assert.ok(oContent.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should have the separation class");
				assert.ok(oContent.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should have the separation class");
				assert.ok(!oContent.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");

				done();
			});

			// Act
			this.oCard.setManifest(oManifest_ObjectCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Table Card", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "800px"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Using manifest", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var oManifestData = oManifest_TableCard["sap.card"].content.data.json;
				var oManifestContent = oManifest_TableCard["sap.card"].content;
				var oCardContent = this.oCard.getAggregation("_content");
				var oTable = oCardContent.getAggregation("_content");
				var aColumns = oTable.getColumns();
				var aCells = oTable.getItems()[0].getCells();

				Core.applyChanges();

				// Assert
				assert.equal(aColumns.length, 7, "Should have 7 columns.");

				// Columns titles
				assert.equal(aColumns[0].getHeader().getText(), oManifestContent.row.columns[0].title, "Should have correct column title");
				assert.equal(aColumns[1].getHeader().getText(), oManifestContent.row.columns[1].title, "Should have correct column title");
				assert.equal(aColumns[2].getHeader().getText(), oManifestContent.row.columns[2].title, "Should have correct column title");
				assert.equal(aColumns[3].getHeader().getText(), oManifestContent.row.columns[3].title, "Should have correct column title");
				assert.equal(aColumns[4].getHeader().getText(), oManifestContent.row.columns[4].title, "Should have correct column title");
				assert.equal(aColumns[5].getHeader().getText(), oManifestContent.row.columns[5].title, "Should have correct column title");
				assert.equal(aColumns[5].getHeader().getText(), oManifestContent.row.columns[5].title, "Should have correct column title");
				assert.equal(aColumns[6].getHeader().getText(), oManifestContent.row.columns[6].title, "Should have correct column title");

				// Column cells types
				assert.ok(aCells[0].isA("sap.m.ObjectIdentifier"), "Column with 'identifier' set to 'true' should be of type 'ObjectIdentifier'");
				assert.ok(aCells[1].isA("sap.m.Text"), "Column with 'value' only should be of type 'Text'");
				assert.ok(aCells[2].isA("sap.m.ObjectStatus"), "Column with a 'state' should be of type 'ObjectStatus'");
				assert.ok(aCells[3].isA("sap.m.Link"), "Column with an 'url' should be of type 'Link'");
				assert.ok(aCells[4].isA("sap.m.ProgressIndicator"), "Column with a 'progressIndicator' should be of type 'ProgressIndicator'");
				assert.ok(aCells[5].isA("sap.f.Avatar"), "Column with an 'icon' should be of type 'Avatar'");
				assert.ok(aCells[6].isA("sap.m.ObjectIdentifier"), "Column with 'identifier' as an object should be of type 'ObjectIdentifier'");

				// Column values
				assert.equal(aCells[0].getTitle(), oManifestData[0].salesOrder, "Should have correct identifier value.");
				assert.equal(aCells[1].getText(), oManifestData[0].customer, "Should have correct text value.");
				assert.equal(aCells[2].getText(), oManifestData[0].status, "Should have correct text value.");
				assert.equal(aCells[2].getState(), oManifestData[0].statusState, "Should have correct state.");
				assert.equal(aCells[3].getText(), oManifestData[0].orderUrl, "Should have correct text value.");
				assert.equal(aCells[3].getHref(), oManifestData[0].orderUrl, "Should have correct url value.");
				assert.equal(aCells[4].getPercentValue(), oManifestData[0].percent, "Should have correct percentage.");
				assert.equal(aCells[4].getDisplayValue(), oManifestData[0].percentValue, "Should have correct progress text.");
				assert.equal(aCells[4].getState(), oManifestData[0].progressState, "Should have correct progress state.");
				assert.equal(aCells[5].getSrc(), oManifestData[0].iconSrc, "Should have correct icon src.");
				assert.ok(aCells[6].getTitleActive(), "Should be active identifier.");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_TableCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Table Card - static content", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				var oContent = this.oCard.getAggregation("_content");

				Core.applyChanges();

				// Assert
				assert.ok(oContent, "Table Card static content should be set");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_TableCard_StaticContent);
		});

		QUnit.test("Using manifest with card level data section", function (assert) {

			// Arrange
			var done = assert.async();
			var oManifestValueToCheck = oManifest_TableCard_WithCardLevelData["sap.card"].data.json[0].salesOrder;

			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				var aItems = this.oCard.getCardContent().getAggregation("_content").getItems();
				assert.equal(aItems.length, 5, "Should have 5 items in the table.");

				var oItemCell = aItems[0].getCells()[0];
				assert.ok(oItemCell.isA("sap.m.ObjectIdentifier"), "Should have created an object identifier.");

				// Aggregation binding succeeded if one of the cells have correct value.
				assert.equal(oItemCell.getTitle(), oManifestValueToCheck, "Cell should have correct value.");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_TableCard_WithCardLevelData);
		});

		QUnit.test("Using maxItems manifest property", function (assert) {

			// Arrange
			var done = assert.async();
			var iMaxItems = oManifest_TableCard_MaxItems["sap.card"]["content"]["maxItems"];

			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				var iNumberOfItems = this.oCard.getCardContent().getAggregation("_content").getItems().length;
				assert.ok(iNumberOfItems <= iMaxItems, "Should have less items than the maximum.");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_TableCard_MaxItems);
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
					sAriaLabelledByIds = oHeader._getTitle().getId() + " " + oHeader._getSubtitle().getId() + " " + oHeader._getAvatar().getId();

				// Assert Grid Container
				assert.equal(oCardDomRef.getAttribute("role"), "region", "Card container should have a role - region");
				assert.equal(oCardDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_CARD"), "Card container should have aria-roledescription - Card");
				assert.equal(oCardDomRef.getAttribute("aria-labelledby"), oHeader._getTitle().getId(), "Card container should have aria-lebelledby - pointing to the title id if there is one");

				// Assert Card Header
				assert.equal(oHeaderDomRef.getAttribute("role"), "group", "Card header should have a role - group");
				assert.equal(oHeaderDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER"), "Card header should have aria-roledescription - Card Header");
				assert.equal(oHeaderDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card container should have aria-lebelledby - pointing to the title, subtitle and avatar ids if there is one");
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

		QUnit.test("Numeric Header", function (assert) {

			// Arrange
			var done = assert.async();

			this.oNumericHeaderCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oHeader = this.oNumericHeaderCard.getAggregation("_header"),
					oHeaderDomRef = oHeader.getDomRef(),
					sAriaLabelledByIds = oHeader._getTitle().getId() + " " + oHeader._getSubtitle().getId() + " " + oHeader._getUnitOfMeasurement().getId() + " " + oHeader._getMainIndicator().getId() + oHeader._getSideIndicatorIds() + " " + oHeader._getDetails().getId();

				assert.equal(oHeaderDomRef.getAttribute("role"), "group", "Card header should have a role - group");
				assert.equal(oHeaderDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER"), "Card header should have aria-roledescription - Card Header");
				assert.equal(oHeaderDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card container should have aria-lebelledby - pointing to the title, subtitle and avatar ids if there is one");
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
				var oListItems = this.oCard.getCardContent()._getList().getItems();
				// Assert
				assert.ok(oListItems[0].getDescription().indexOf("Sofia") > -1, "Card parameter 'city' should be replaced in rendered html  with 'Sofia'");
				assert.ok(oListItems[0].getDescription().indexOf("Bulgaria") > -1, "Card parameter 'country' should be replaced in rendered html  with 'Bulgaria'");

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

				var oListItems = this.oCard.getCardContent()._getList().getItems();
				// Assert
				assert.ok(oListItems[0].getDescription().indexOf("Waldorf") > -1, "Card parameter 'city' should be replaced in rendered html with 'Waldorf'");
				assert.ok(oListItems[0].getDescription().indexOf("Germany") > -1, "Card parameter 'country' should be replaced in rendered html  with 'Germany'");

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
	}
);
