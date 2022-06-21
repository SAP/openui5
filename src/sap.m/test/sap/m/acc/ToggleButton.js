sap.ui.define([
	"sap/m/App",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/Title",
	"sap/m/ToggleButton",
	"sap/ui/core/library"
], function(App, Label, Page, Title, ToggleButton, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var app = new App("myApp");

	var page1 = new Page("page1", {
		title:"ToggleButton Test page",
		content : [
			new Label("L1", { text: "switch mode", width: "100%" }),
			new Title({ text: "Default Buttons", level: TitleLevel.H2, width: "100%" }),
			new ToggleButton({ text: "Logged" }),
			new ToggleButton({ text: "Logged", enabled: false }),
			new ToggleButton({ text: "Logged", pressed: true, enabled: false }),
			new ToggleButton({ text: "Logged", icon: "sap-icon://log" }),
			new ToggleButton({ text: "Logged", pressed: true, icon: "sap-icon://log", iconFirst: false }),
			new ToggleButton({ icon: "sap-icon://log", tooltip: "Logged" }),
			new ToggleButton({ icon: "sap-icon://log", pressed: true, tooltip: "Logged" }),

			new Title({ text: "Buttons with Labels", level: TitleLevel.H2, width: "100%" }),
			new ToggleButton({ text: "Logged", ariaLabelledBy: ["L1"] }),
			new ToggleButton({ text: "Logged", enabled: false, ariaLabelledBy: ["L1"] }),
			new ToggleButton({ text: "Logged", pressed: true, enabled: false, ariaLabelledBy: ["L1"] }),
			new ToggleButton({ text: "Logged", icon: "sap-icon://log", ariaLabelledBy: ["L1"] }),
			new ToggleButton({ text: "Logged", pressed: true, icon: "sap-icon://log", iconFirst: false, ariaLabelledBy: ["L1"] }),
			new ToggleButton({ icon: "sap-icon://log", tooltip: "Logged", ariaLabelledBy: ["L1"] }),
			new ToggleButton({ icon: "sap-icon://log", pressed: true, tooltip: "Logged", ariaLabelledBy: ["L1"] }),

			new Title({ text: "Buttons with Description", level: TitleLevel.H2, width: "100%" }),
			new ToggleButton({ text: "Logged", ariaDescribedBy: ["L1"] }),
			new ToggleButton({ text: "Logged", enabled: false, ariaDescribedBy: ["L1"] }),
			new ToggleButton({ text: "Logged", pressed: true, enabled: false, ariaDescribedBy: ["L1"] }),
			new ToggleButton({ text: "Logged", icon: "sap-icon://log", ariaDescribedBy: ["L1"] }),
			new ToggleButton({ text: "Logged", pressed: true, icon: "sap-icon://log", iconFirst: false, ariaDescribedBy: ["L1"] }),
			new ToggleButton({ icon: "sap-icon://log", tooltip: "Logged", ariaDescribedBy: ["L1"] }),
			new ToggleButton({ icon: "sap-icon://log", pressed: true, tooltip: "Logged", ariaDescribedBy: ["L1"] })
		]
	});

	app.addPage(page1);

	app.placeAt("body");
});
