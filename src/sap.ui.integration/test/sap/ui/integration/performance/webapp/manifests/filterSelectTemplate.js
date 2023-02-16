sap.ui.define([], function () {
	"use strict";

	return {
		"sap.app": {
			"id": "",
			"type": "card"
		},
		"sap.card": {
			"data": {
				"json": [{
					"Name": "Notebook Basic 15",
					"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
					"Id": "HT-1000",
					"SubCategoryId": "Notebooks",
					"icon": "./images/DonnaMoore.png",
					"state": "Information",
					"info": "27.45 EUR",
					"infoState": "Success"
				},
				{
					"Name": "Notebook Basic 17",
					"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
					"Id": "HT-1001",
					"SubCategoryId": "Notebooks",
					"icon": "./images/DonnaMoore.png",
					"state": "Success",
					"info": "27.45 EUR",
					"infoState": "Success"

				},
				{
					"Name": "Notebook Basic 18",
					"Description": "Notebook Basic 18 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
					"Id": "HT-1002",
					"SubCategoryId": "Notebooks",
					"icon": "./images/DonnaMoore.png",
					"state": "Warning",
					"info": "9.45 EUR",
					"infoState": "Error"
				},
				{
					"Name": "Notebook Basic 19",
					"Description": "Notebook Basic 19 with 2,80 GHz quad core, 19\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
					"Id": "HT-1003",
					"SubCategoryId": "Notebooks",
					"icon": "./images/DonnaMoore.png",
					"state": "Error",
					"info": "9.45 EUR",
					"infoState": "Error"
				},
				{
					"Name": "ITelO Vault",
					"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
					"Id": "HT-1007",
					"SubCategoryId": "PDAs & Organizers",
					"icon": "./images/DonnaMoore.png",
					"state": "Success",
					"info": "29.45 EUR",
					"infoState": "Success"
				},
				{
					"Name": "Notebook Professional 15",
					"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
					"Id": "HT-1010",
					"SubCategoryId": "Notebooks",
					"icon": "./images/DonnaMoore.png",
					"state": "Success",
					"info": "29.45 EUR",
					"infoState": "Success"
				}
			]},
			"configuration": {
				"filters": {
					"f": {
						"value": 1,
						"items": [{
								"key": 1,
								"title": "Option 1"
							},
							{
								"key": 2,
								"title": "Option 2"
							},
							{
								"key": 3,
								"title": "Option 3"
							},
							{
								"key": 4,
								"title": "Option 4"
							}
						]
					}
				}
			},
			"type": "List",
			"header": {
				"title": "Card with a Filter",
				"icon": {
					"src": "sap-icon://filter"
				}
			},
			"content": {
				"maxItems": 4,
				"item": {
					"icon": {
						"src": "{icon}"
					},
					"title": "{Name}",
					"description": "{Description}"
				}
			}
		}
	};
});