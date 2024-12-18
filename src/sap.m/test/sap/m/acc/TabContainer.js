sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/TabContainerItem",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/Label",
	"sap/m/TabContainer",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/core/library"
], function(
	JSONModel,
	TabContainerItem,
	ObjectPageLayout,
	ObjectPageHeader,
	ObjectPageSection,
	ObjectPageSubSection,
	Label,
	TabContainer,
	App,
	Page,
	coreLibrary
) {
	"use strict";

	var TitleLevel = coreLibrary.TitleLevel;

	var oProductModel = new JSONModel({
		"ProductCollection": [
			{
				"ProductId": "1239102",
				"Name": "Power Projector 4713",
				"Category": "Projector",
				"SupplierName": "Titanium",
				"Description": "A very powerful projector with special features for Internet usability, USB",
				"Price": 856.49,
				"CurrencyCode": "EUR"
			},
			{
				"ProductId": "2212-121-828",
				"Name": "Gladiator MX",
				"Category": "Graphics Card",
				"SupplierName": "Technocom",
				"Description": "Gladiator MX: DDR2 RoHS 128MB Supporting 512MB Clock rate: 350 MHz Memory Clock: 533 MHz, Bus Type: PCI-Express, Memory Type: DDR2 Memory Bus: 32-bit Highlighted Features: DVI Out, TV Out , HDTV",
				"Price": 81.7,
				"CurrencyCode": "EUR",
				"modified" : true
			},
			{
				"ProductId": "K47322.1",
				"Name": "Hurricane GX",
				"Category": "Graphics Card",
				"SupplierName": "Red Point Stores",
				"Description": "Hurricane GX: DDR2 RoHS 512MB Supporting 1024MB Clock rate: 550 MHz Memory Clock: 933 MHz, Bus Type: PCI-Express, Memory Type: DDR2 Memory Bus: 64-bit Highlighted Features: DVI Out, TV-In, TV-Out, HDTV",
				"Price": 219,
				"CurrencyCode": "EUR"
			},
			{
				"ProductId": "KTZ-12012.V2",
				"Name": "Deskjet Super Highspeed",
				"Category": "Printer",
				"SupplierName": "Red Point Stores",
				"Description": "1200 dpi x 1200 dpi - up to 25 ppm (mono) / up to 24 ppm (colour) - capacity: 100 sheets - Hi-Speed USB2.0, Ethernet",
				"Price": 117.19,
				"CurrencyCode": "EUR"
			},
			{
				"Name": "Laser Allround Pro",
				"Category": "Printer",
				"SupplierName": "Red Point Stores",
				"Description": "Should be one line in height",
				"Price": 39.99,
				"CurrencyCode": "EUR",
				"icon": "sap-icon://notes"
			},
			{
				"Name": "Laser Allround Pro2",
				"Category": "Printer",
				"SupplierName": "",
				"Description": "Should be one line in height",
				"Price": 39.99,
				"CurrencyCode": "EUR",
				"icon": "../ui/documentation/sdk/images/HT-6120.jpg"
			},
			{
				"Name": "Hurricane GX",
				"Category": "Printer",
				"SupplierName": "",
				"Description": "Should be one line in height",
				"Price": 39.99,
				"CurrencyCode": "EUR"
			},
			{
				"icon": "sap-icon://notes",
				"Category": "Projector",
				"SupplierName": "",
				"Description": "Should be one line in height",
				"Price": 39.99,
				"CurrencyCode": "EUR"
			}
		]
	});

	var oTemplate = new TabContainerItem({
		name: "{Name}",
		additionalText: "{SupplierName}",
		icon: "{icon}",
		iconTooltip: "{Category}",
		modified: "{modified}",
		content: new ObjectPageLayout({
			headerTitle: new ObjectPageHeader({
				objectTitle:"{Name}",
				objectSubtitle: "{SupplierName}",
				objectImageURI: "{icon}",
				isObjectIconAlwaysVisible: true
			}),
			sections: [
				new ObjectPageSection({
					title:"Description",
					subSections: new ObjectPageSubSection({
						blocks: new Label({text: "{Description}" })
					})
				}),
				new ObjectPageSection({
					title:"Supplier",
					subSections: new ObjectPageSubSection({
						blocks: new Label({text: "{SupplierName}" })
					})
				}),
				new ObjectPageSection({
					title:"Category",
					subSections: new ObjectPageSubSection({
						blocks: new Label({text: "{Category}" })
					})
				})
			]
		})
	});

	var fnCloseItem = function(oEvent) {
		oEvent.preventDefault();
		tabContainer.removeItem(oEvent.getParameter("item"));
	};

	var tabContainer = new TabContainer({
		items: {
			path: "/ProductCollection",
			template: oTemplate
		},
		itemClose: fnCloseItem
	}).addStyleClass("sapUiResponsivePadding--header");

	new App().addPage(new Page({
		title: "TabContainer Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [tabContainer],
		models: oProductModel
	})).placeAt("body");
});
