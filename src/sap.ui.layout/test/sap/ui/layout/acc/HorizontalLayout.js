sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/Page",
	"sap/ui/core/library",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/Splitter"
], function(App, Button, Image, Page, coreLibrary, HorizontalLayout, Splitter) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	const TitleLevel = coreLibrary.TitleLevel;

		// create a HorizontalLayout with some initial content
	const oDefaultLayout = new HorizontalLayout("myLayout", {
		allowWrapping: true,
		content:[
			new Button({text:"Hello World 1"}),
			new Button({text:"Hello World 2"}),
			new Button({text:"Hello World 3"}),
			new Button({text:"Hello World a"}),
			new Button({text:"Hello World b"}),
			new Button({text:"Hello World c"})
	]}).addStyleClass("sapUiContentPadding");

	const oSplitter = new Splitter("splitter", {
		contentAreas: new Page({
			title: "HorizontalLayout in Splitter",
			content: new HorizontalLayout({
				allowWrapping: true,
				content: [
					new Image({
						src: "../../../../sap/ui/documentation/sdk/images/HT-6100-large.jpg",
						alt: "item HT-6100",
						decorative: false,
						width: "220px",
						height: "220px",
						tooltip: "HT-6100"
					}).addStyleClass("sapUiTinyMarginBegin"),
					new Image({
						src: "../../../../sap/ui/documentation/sdk/images/HT-1112.jpg",
						alt: "item HT-1112",
						decorative: false,
						width: "220px",
						height: "220px",
						tooltip: "HT-1112"
					}).addStyleClass("sapUiTinyMarginBegin"),
					new Image({
						src: "../../../../sap/ui/documentation/sdk/images/HT-6100-large.jpg",
						alt: "item HT-6100",
						decorative: false,
						width: "220px",
						height: "220px",
						tooltip: "HT-6100"
					}).addStyleClass("sapUiTinyMarginBegin"),
					new Image({
						src: "../../../../sap/ui/documentation/sdk/images/HT-1112.jpg",
						alt: "item HT-1112",
						decorative: false,
						width: "220px",
						height: "220px",
						tooltip: "HT-1112"
					}).addStyleClass("sapUiTinyMarginBegin")
				]
			}).addStyleClass("sapUiContentPadding")
		})
	});

	new App({
		id: "myApp",
		pages: [
			new Page({
				id: "area-default",
				title: "HorizontalLayout",
				titleLevel: TitleLevel.H1,
				content: [oDefaultLayout, oSplitter]
			})
		]
	}).placeAt("content");
});
