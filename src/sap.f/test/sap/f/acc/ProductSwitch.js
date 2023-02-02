sap.ui.define([
	"sap/m/App",
	"sap/f/ProductSwitch",
	"sap/f/ProductSwitchItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/Page"
], function(App, ProductSwitch, ProductSwitchItem, JSONModel, Page) {
	"use strict";

	var oModel = new JSONModel();

	var mData = {
		"items": [
			{
				"src": "sap-icon://home",
				"title": "Home",
				"subTitle": "Central Home"
			},
			{
				"src": "sap-icon://business-objects-experience",
				"title": "Analytics Cloud",
				"subTitle": "Analytics Cloud"
			},
			{
				"src": "sap-icon://contacts",
				"title": "Catalog",
				"subTitle": "Ariba"
			},
			{
				"src": "sap-icon://credit-card",
				"title": "Guided Buying"
			},
			{
				"src": "sap-icon://cart-3",
				"title": "Strategic Procurement"
			},
			{
				"src": "sap-icon://flight",
				"title": "Travel & Expense",
				"subTitle": "Concur"
			},
			{
				"src": "sap-icon://shipping-status",
				"title": "Vendor Management",
				"subTitle": "Fieldglass"
			},
			{
				"src": "sap-icon://customer",
				"title": "Human Capital Management"
			},
			{
				"src": "sap-icon://sales-notification",
				"title": "Sales Cloud",
				"subTitle": "Sales Cloud"
			},
			{
				"src": "sap-icon://retail-store",
				"title": "Commerce Cloud",
				"subTitle": "Commerce cloud"
			},
			{
				"src": "sap-icon://marketing-campaign",
				"title": "Marketing Cloud",
				"subTitle": "Marketing Cloud"
			},
			{
				"src": "sap-icon://family-care",
				"title": "Service Cloud"
			},
			{
				"src": "sap-icon://customer-briefing",
				"title": "Customer Data Cloud"
			},
			{
				"src": "sap-icon://batch-payments",
				"title": "S/4HANA"
			}
		]
	};

	oModel.setData(mData);
	sap.ui.getCore().setModel(oModel);

	var oItemTemplate = new ProductSwitchItem({
		src: "{src}",
		title: "{title}",
		subTitle: "{subTitle}",
		target: "{target}"
	});

	var productSwitch = new ProductSwitch("productSwitch", {
		items: {
			path: "/items",
			template: oItemTemplate
		}
	});

	var oPage = new Page("page", {
		title: "Test Page for sap.f.ProductSwitch",
		content: [ productSwitch ]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App("myApp", { initialPage: "page" });
	oApp.addPage(oPage).placeAt("content");
});
