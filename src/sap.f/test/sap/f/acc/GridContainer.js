sap.ui.define([
	"sap/f/GridContainer",
	"sap/f/GridContainerItemLayoutData",
	"sap/m/App",
	"sap/m/GenericTile",
	"sap/m/Page",
	"sap/ui/integration/widgets/Card"
], function(GridContainer, GridContainerItemLayoutData, App, GenericTile, Page, Card) {
	"use strict";

	var oListCardInteractive_Manifest = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.highlight.list.card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"actions": [
					{
						"type": "Navigation",
						"parameters": {
							"url": "/quickLinks"
						}
					}
				],
				"title": "Top 5 Products",
				"subTitle": "These are the top sellers this month",
				"icon": {
					"src": "sap-icon://desktop-mobile",
					"alt": "Desktop-mobile icon"
				},
				"status": {
					"text": "5 of 20"
				}
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Comfort Easy",
							"Description": "32 GB Digital Assistant with high-resolution color screen",
							"Highlight": "Error"
						},
						{
							"Name": "ITelO Vault",
							"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
							"Highlight": "Warning"
						},
						{
							"Name": "Notebook Professional 15",
							"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
							"Highlight": "Success"
						},
						{
							"Name": "Ergo Screen E-I",
							"Description": "Optimum Hi-Resolution max. 1920 x 1080 @ 85Hz, Dot Pitch: 0.27mm",
							"Highlight": "Information"
						},
						{
							"Name": "Laser Professional Eco",
							"Description": "Print 2400 dpi image quality color documents at speeds of up to 32 ppm (color) or 36 ppm (monochrome), letter/A4. Powerful 500 MHz processor, 512MB of memory",
							"Highlight": "None"
						}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}"
				}
			}
		}
	};
	var oListCard_Manifest = {
		"_version": "1.14.0",
		"sap.app": {
			"id": "card.explorer.highlight.list.card",
			"type": "card"
		},
		"sap.card": {
			"type": "List",
			"header": {
				"title": "Top 5 Products",
				"subTitle": "These are the top sellers this month",
				"icon": {
					"src": "sap-icon://desktop-mobile",
					"alt": "Desktop-mobile icon"
				},
				"status": {
					"text": "5 of 20"
				}
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Comfort Easy",
							"Description": "32 GB Digital Assistant with high-resolution color screen",
							"Highlight": "Error"
						},
						{
							"Name": "ITelO Vault",
							"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
							"Highlight": "Warning"
						},
						{
							"Name": "Notebook Professional 15",
							"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
							"Highlight": "Success"
						},
						{
							"Name": "Ergo Screen E-I",
							"Description": "Optimum Hi-Resolution max. 1920 x 1080 @ 85Hz, Dot Pitch: 0.27mm",
							"Highlight": "Information"
						},
						{
							"Name": "Laser Professional Eco",
							"Description": "Print 2400 dpi image quality color documents at speeds of up to 32 ppm (color) or 36 ppm (monochrome), letter/A4. Powerful 500 MHz processor, 512MB of memory",
							"Highlight": "None"
						}
					]
				},
				"item": {
					"title": "{Name}",
					"description": "{Description}",
					"highlight": "{Highlight}"
				}
			}
		}
	};

	var oListCardInteractive = new Card({
		manifest: oListCardInteractive_Manifest,
		baseUrl: "./",
		layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 3 })
	});

	var oListCard = new Card({
		manifest: oListCard_Manifest,
		baseUrl: "./",
		layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 3 })
	});

	var oGenericTile = new GenericTile({
		header:"Sales Fulfillment Application Title",
		layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 2 })
	});

	var oGridContainer = new GridContainer({
		items: [
			oListCardInteractive,
			oListCard,
			oGenericTile
		]
	}).addStyleClass("sapUiSmallMargin");

	new App("myApp", {
		initialPage:"myPage",
		pages: [
			new Page("myPage", {
				content: [
					oGridContainer
				]
			})
		]
	}).placeAt("body");
});

