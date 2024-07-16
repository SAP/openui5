// Note: the HTML page 'AlignedFlowLayoutSingle.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Page",
	"sap/m/Text",
	"sap/ui/layout/AlignedFlowLayout"
], async function(Core, App, Button, Input, Page, Text, AlignedFlowLayout) {
	"use strict";

	await Core.ready();

	var oAlignedFlowLayout = new AlignedFlowLayout({
		content: [
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input(),
			new Input()
		],
		endContent: new Button({
			text: "Search"
		})
	}).addStyleClass("sapUiContentPadding");

	new App({
		pages: new Page({
			title: "AlignedFlowLayout Test Page",
			content: [
				new Text({
					text: "A FilterBar-like Layout"
				}),
				oAlignedFlowLayout
			]
		})
	}).placeAt("content");
});