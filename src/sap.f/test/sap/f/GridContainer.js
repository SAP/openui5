sap.ui.define([
	"sap/m/Page",
	"sap/m/App",
	"sap/m/HBox",
	"sap/f/GridContainer",
	"sap/m/Title",
	"sap/f/Card",
	"sap/f/cards/Header",
	"sap/f/GridContainerItemLayoutData"
], function (
	Page,
	App,
	HBox,
	GridContainer,
	Title,
	Card,
	CardHeader,
	GridContainerItemLayoutData
) {
	"use strict";

	var oGridContainer = new GridContainer("gridContainer", {
		items: [
			new Title("title", {
				text: "This is an sap.m.Title control inside sap.f.GridContainer",
				layoutData: new GridContainerItemLayoutData({
					columns: 100
				})
			}),
			new Card({
				height: "100%",
				layoutData: new GridContainerItemLayoutData({
					minRows: 3,
					columns: 2
				})
			}),
			new Card("cardWithNestedCards", {
				height: "100%",
				layoutData: new GridContainerItemLayoutData({
					minRows: 3,
					columns: 2
				}),
				header: new CardHeader({
					title: "Parent Card"
				}),
				content: new HBox({
					width: "100%",
					items: [
						new Card({
							header: new CardHeader({
								title: "Child Card"
							})
						}),
						new Card({
							header: new CardHeader({
								title: "Child Card"
							})
						})
					]
				})
			})
		]
	});

	var oPage = new Page("page", {
		title: "Test Page for sap.f.GridContainer",
		content: [ oGridContainer ]
	}).addStyleClass("sapUiContentPadding");

	new App({
		pages: [ oPage ]
	}).placeAt("body");
});