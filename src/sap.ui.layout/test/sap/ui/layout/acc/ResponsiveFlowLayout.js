sap.ui.define([
	"sap/m/App",
	"sap/m/Image",
	"sap/m/Page",
	"sap/ui/layout/ResponsiveFlowLayout",
	"sap/ui/layout/ResponsiveFlowLayoutData",
	"sap/ui/core/library"
], function(App, Image, Page,  ResponsiveFlowLayout, ResponsiveFlowLayoutData, coreLibrary) {
	"use strict";

	const bResponsive = true;

	// shortcut for sap.ui.core.TitleLevel
	const TitleLevel = coreLibrary.TitleLevel;

	const oResponsiveFlowInnerFirst = new ResponsiveFlowLayout("innerFirst", {
		responsive: bResponsive,
		layoutData: new ResponsiveFlowLayoutData({
			minWidth : 250,
			margin : false
		}),
		content: [
			new Image({
				src: "../../../../sap/ui/documentation/sdk/images/HT-1112.jpg",
				alt: "item HT-1112",
				decorative: false,
				width: "100%",
				tooltip: "HT-1112"
			}).addStyleClass("sapUiTinyMarginBegin"),
			new Image({
				src: "../../../../sap/ui/documentation/sdk/images/HT-1112.jpg",
				alt: "item HT-1112",
				decorative: false,
				width: "100%",
				tooltip: "HT-1112"
			})
		]
	}).addStyleClass("sapUiContentPadding");

	const oResponsiveFlowInnerMid = new ResponsiveFlowLayout("innerMid", {
		id: "rfl_lastname",
		responsive: bResponsive,
		layoutData: new ResponsiveFlowLayoutData({
			minWidth : 250
		}),
		content: [
			new Image({
				src: "../../../../sap/ui/documentation/sdk/images/HT-1112.jpg",
				alt: "item HT-1112",
				decorative: false,
				width: "100%",
				tooltip: "HT-1112"
			})
		]
	}).addStyleClass("sapUiContentPadding");

	const oResponsiveFlowInnerLast = new ResponsiveFlowLayout({
		id: "rfl_address",
		responsive: bResponsive,
		layoutData: new ResponsiveFlowLayoutData({
			minWidth : 250,
			linebreak : true
		}),
		content: [
			new Image({
				src: "../../../../sap/ui/documentation/sdk/images/HT-1112.jpg",
				alt: "item HT-1112",
				decorative: false,
				width: "100%",
				tooltip: "HT-1112"
			}).addStyleClass("sapUiTinyMarginBegin"),
			new Image({
				src: "../../../../sap/ui/documentation/sdk/images/HT-1112.jpg",
				alt: "item HT-1112",
				decorative: false,
				width: "100%",
				tooltip: "HT-1112"
			}),
			new Image({
				src: "../../../../sap/ui/documentation/sdk/images/HT-1112.jpg",
				alt: "item HT-1112",
				decorative: false,
				width: "100%",
				tooltip: "HT-1112"
			})
		]
	}).addStyleClass("sapUiContentPadding");

	var oRFL = new ResponsiveFlowLayout({
		id: "rfl_outer",
		responsive : bResponsive,
		content: [
			oResponsiveFlowInnerFirst,
			oResponsiveFlowInnerMid,
			oResponsiveFlowInnerLast
		]
	});
	new App({
		id: "myApp",
		pages: [
			new Page({
				id: "area-default",
				title: "ResponsiveFlowLayout",
				titleLevel: TitleLevel.H1,
				content: [oRFL]
			})
		]
	}).placeAt("content");
});
