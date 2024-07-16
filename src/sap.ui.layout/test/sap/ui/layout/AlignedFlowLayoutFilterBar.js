// Note: the HTML page 'AlignedFlowLayoutFilterBar.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/App",
	"sap/m/Button",
	"sap/m/DatePicker",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/Select",
	"sap/m/Text",
	"sap/m/ToggleButton",
	"sap/ui/layout/AlignedFlowLayout",
	"sap/ui/layout/VerticalLayout"
], async function(Core, App, Button, DatePicker, Label, Page, Select, Text, ToggleButton, AlignedFlowLayout, VerticalLayout) {
	"use strict";

	await Core.ready();

	var oAlignedFlowLayout = new AlignedFlowLayout({
		content: [
			new VerticalLayout({
				content: [
					new Label({text: "Delivery Date", required: true}),
					new DatePicker({width: "100%"})
				]
			}).addStyleClass("sapUiCompFilterBarItem"),

			new VerticalLayout({
				content: [
					new Label({text: "Region", required: true}),
					new Select({width: "100%"})
				]
			}).addStyleClass("sapUiCompFilterBarItem"),

			new VerticalLayout({
				content: [
					new Label({text: "Other Date"}),
					new DatePicker({width: "100%"})
				]
			}).addStyleClass("sapUiCompFilterBarItem"),

			new VerticalLayout({
				content: [
					new Label({text: "Other State"}),
					new Select({width: "100%"})
				]
			}).addStyleClass("sapUiCompFilterBarItem")

		],
		endContent: [
			new Button({
				text: "Adapt Filters (1)",
				type: "Transparent"
			}),
			new Button({
				text: "Go",
				type: "Emphasized"
			}),
			new ToggleButton({
				icon: "sap-icon://pushpin-off",
				type: "Transparent"
			})
		]
	});

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