sap.ui.define([
	"sap/ui/core/IconPool",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/m/TabContainerItem",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/TabContainer",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/OverflowToolbar"
], function(
	IconPool,
	MessageBox,
	JSONModel,
	TabContainerItem,
	ObjectPageLayout,
	ObjectPageHeader,
	ObjectPageSection,
	ObjectPageSubSection,
	Label,
	MessageToast,
	TabContainer,
	Button,
	MText,
	App,
	Page,
	OverflowToolbar
) {
	"use strict";

	// shortcut for sap.m.MessageBox.Action
	var Action = MessageBox.Action;

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

	sap.ui.getCore().setModel(oProductModel);

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

	var fnOnAddButtonClick = function() {
		MessageToast.show("Add button clicked!", {duration: 500});
	};

	var fnOnItemSelected = function(oEvent) {
		var oItem = oEvent.getParameter("item");
		if (oItem) {
			MessageToast.show("Item selected: " + oEvent.getParameter("item").getName(), {duration: 500});
		} else {
			MessageToast.show("No Items selected", {duration: 500});
		}
	};

	var fnCloseItem = function(oEvent) {
		// prevent the tab being closed by default
		oEvent.preventDefault();
		var oItemToClose = oEvent.getParameter('item');
		MessageBox.confirm("Do you want to close the tab '" + oItemToClose.getName() + "'?", {
			onClose: function (oAction) {
				if (oAction === Action.OK) {
					tabContainer.removeItem(oItemToClose);
					MessageToast.show("Item closed: " + oItemToClose.getName(), {duration: 500});
				} else {
					MessageToast.show("Item close canceled: " + oItemToClose.getName(), {duration: 500});
				}
			}
		});

	};

	var tabContainer = new TabContainer({
		items: {
			path: "/ProductCollection",
			template: oTemplate
		},
		itemSelect: fnOnItemSelected,
		itemClose: fnCloseItem,
		addNewButtonPress: fnOnAddButtonClick
	}).addStyleClass("sapUiResponsivePadding--header");

	var addButton = new Button({
		type: "Emphasized",
		text: "Add",
		press: function() {
			tabContainer.addItem(
					new TabContainerItem({
						name: "SAP",
						additionalText: "Customer",
						modified: true
					})
			);
		}
	});

	var insertButton = new Button({
		type: "Emphasized",
		text: "Insert (2)",
		press: function() {
			tabContainer.insertItem(
					new TabContainerItem({
						name: "Apple",
						additionalText: "Customer",
						content: new MText({ text: "Apple tab" })
					}),
					2
			);
		}
	});

	var removeButton = new Button({
		type: "Emphasized",
		text: "Remove (0)",
		press: function() {
			tabContainer.removeItem(0);
		}
	});

	var removeAllButton = new Button({
		type: "Emphasized",
		text: "Remove all",
		press: function() {
			tabContainer.removeAllItems();
		}
	});

	var destroyItemsButton = new Button({
		type: "Emphasized",
		text: "Destroy items",
		press: function() {
			tabContainer.destroyItems();
		}
	});

	var destroyTabStripButton = new Button({
		type: "Emphasized",
		text: "Destroy TabStrip",
		press: function() {
			tabContainer.destroyAggregation("_tabStrip");
		}
	});

	var destroyTabContainer = new Button({
		type: "Emphasized",
		text: "Destroy",
		press: function() {
			tabContainer.destroy();
		}
	});

	var changeTabButton1 = new Button({
		text: "0",
		tooltip: "{/ProductCollection/0/Name}",
		press: function() {
			tabContainer.setSelectedItem(tabContainer.getItems()[0]);
		}
	});

	var changeTabButton2 = new Button({
		text: "1",
		tooltip: "{/ProductCollection/1/Name}",
		press: function() {
			tabContainer.setSelectedItem(tabContainer.getItems()[1]);
		}
	});

	var changeTabButton3 = new Button({
		text: "2",
		tooltip: "{/ProductCollection/2/Name}",
		press: function() {
			tabContainer.setSelectedItem(tabContainer.getItems()[2]);
		}
	});
	var changeNameButton = new Button({
		type: "Emphasized",
		text: "Change Name (3)",
		press: function() {
			tabContainer.getItems()[3].setName("New Name");
		}
	});

	var addIconButton = new Button({
		type: "Emphasized",
		text: "Add Icon (3)",
		press: function() {
			tabContainer.getItems()[3].setIcon("sap-icon://syringe");
		}
	});

	var removeIconButton = new Button({
		type: "Emphasized",
		text: "Remove Icon (4)",
		press: function() {
			tabContainer.getItems()[4].setIcon("");
		}
	});

	var changeIconButton = new Button({
		type: "Emphasized",
		text: "Change Icon (5)",
		press: function() {
			tabContainer.getItems()[5].setIcon("sap-icon://syringe");
		}
	});

	var toggleModifiedButton = new Button({
		type: "Emphasized",
		text: "Toggle Modified(3)",
		press: function() {
			tabContainer.getItems()[3].setModified(!tabContainer.getItems()[3].getModified());
		}
	});
	new App().addPage(new Page({
		title: "sap.m.TabContainer test page",
		content: [tabContainer],
		footer: new OverflowToolbar({
			content: [
				changeTabButton1,
				changeTabButton2,
				changeTabButton3,
				changeNameButton,
				addIconButton,
				changeIconButton,
				removeIconButton,
				toggleModifiedButton,
				addButton,
				insertButton,
				removeButton,
				removeAllButton,
				destroyItemsButton,
				destroyTabStripButton,
				destroyTabContainer
			]
		})
	})).placeAt("body");
});
