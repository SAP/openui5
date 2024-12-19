sap.ui.define([
	"sap/m/App",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/ToggleButton",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library"
], function(App, Label, Page, ToggleButton, VerticalLayout, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var oPageLayout = new VerticalLayout({
		content : [
			new Label("D1", {text: "General description", wrapping: true}),
			new Label("L1", { text: "Regular", wrapping: true }),
			new ToggleButton({ text: "Logged", ariaLabelledBy: ["L1"], ariaDescribedBy: ["D1"] }),
			new Label("L2", { text: "Disabled", wrapping: true }),
			new ToggleButton({ text: "Logged", enabled: false, ariaLabelledBy: ["L1"], ariaDescribedBy: ["D1"] }),
			new Label("L3", { text: "Disabled and pressed", wrapping: true }),
			new ToggleButton({ text: "Logged", pressed: true, enabled: false, ariaLabelledBy: ["L1"], ariaDescribedBy: ["D1"] }),
			new Label("L4", { text: "Icon only", wrapping: true }),
			new ToggleButton({ icon: "sap-icon://log", pressed: true, tooltip: "Logged", ariaLabelledBy: ["L1"], ariaDescribedBy: ["D1"] })
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "ToggleButton Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: oPageLayout
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
