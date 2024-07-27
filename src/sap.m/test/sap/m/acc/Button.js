sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/Title",
	"sap/ui/core/library",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout"
], function(App, Button, Label, mobileLibrary, Page, Title, coreLibrary, VerticalLayout, HorizontalLayout) {
	"use strict";

	// shortcut for sap.m.ButtonType
	const ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.ui.core.TitleLevel
	const TitleLevel = coreLibrary.TitleLevel;

	const app = new App("myApp");

	const oDefaultButtons = new VerticalLayout({
		content: [
			new Title({ text: "Default Buttons with label", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", enabled: false, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaLabelledBy: ["L1"] }),

			new Title("T1", { text: "Default Buttons with Description", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaDescribedBy: ["T1"], ariaLabelledBy: ["L1"]}),
			new Button({ text: "Home", enabled: false, ariaDescribedBy: ["T1"], ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaDescribedBy: ["T1"], ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaDescribedBy: ["T1"], ariaLabelledBy: ["L1"] })
		]
	}).addStyleClass("sapUiSmallMargin");

	const ButtonsWithSpecialTypesBack = new VerticalLayout({
		content: [
			new Title({ text: "Type: Back with label", level: TitleLevel.H3, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaLabelledBy: ["L1"], type: ButtonType.Back }),
			new Button({ text: "Home", enabled: false, ariaLabelledBy: ["L1"], type: ButtonType.Back }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaLabelledBy: ["L1"], type: ButtonType.Back }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaLabelledBy: ["L1"], type: ButtonType.Back }),
			new Button({ icon: "sap-icon://home", tooltip: "Home", ariaLabelledBy: ["L1"], type: ButtonType.Back }),

			new Title("T2", { text: "Type: Back with Description", level: TitleLevel.H3, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaDescribedBy: ["T2"], type: ButtonType.Back, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", enabled: false, ariaDescribedBy: ["T2"], type: ButtonType.Back, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaDescribedBy: ["T2"], type: ButtonType.Back, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaDescribedBy: ["T2"], type: ButtonType.Back, ariaLabelledBy: ["L1"] }),
			new Button({ icon: "sap-icon://home", tooltip: "Home", ariaDescribedBy: ["T2"], type: ButtonType.Back, ariaLabelledBy: ["L1"] })
		]
	}).addStyleClass("sapUiSmallMargin");

	const ButtonsWithSpecialTypesAccept = new VerticalLayout({
		content: [
			new Title({ text: "Type: Accept with label", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaLabelledBy: ["L1"], type: ButtonType.Accept }),
			new Button({ text: "Home", enabled: false, ariaLabelledBy: ["L1"], type: ButtonType.Accept }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaLabelledBy: ["L1"], type: ButtonType.Accept }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaLabelledBy: ["L1"], type: ButtonType.Accept }),
			new Button({ icon: "sap-icon://home", tooltip: "Home", ariaLabelledBy: ["L1"], type: ButtonType.Accept }),

			new Title("T3", { text: "Type: Accept with Description", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaDescribedBy: ["T3"], type: ButtonType.Accept, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", enabled: false, ariaDescribedBy: ["T3"], type: ButtonType.Accept, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaDescribedBy: ["T3"], type: ButtonType.Accept, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaDescribedBy: ["L1"], type: ButtonType.Accept, ariaLabelledBy: ["L1"] }),
			new Button({ icon: "sap-icon://home", tooltip: "Home", ariaDescribedBy: ["T3"], type: ButtonType.Accept, ariaLabelledBy: ["L1"] })
		]
	}).addStyleClass("sapUiSmallMargin");

	const ButtonsWithSpecialTypesReject = new VerticalLayout({
		content: [
			new Title({ text: "Type: Reject with label", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaLabelledBy: ["L1"], type: ButtonType.Reject }),
			new Button({ text: "Home", enabled: false, ariaLabelledBy: ["L1"], type: ButtonType.Reject }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaLabelledBy: ["L1"], type: ButtonType.Reject }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaLabelledBy: ["L1"], type: ButtonType.Reject }),
			new Button({ icon: "sap-icon://home", tooltip: "Home", ariaLabelledBy: ["L1"], type: ButtonType.Reject }),

			new Title("T4", { text: "Type: Reject with Description", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaDescribedBy: ["T4"], type: ButtonType.Reject, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", enabled: false, ariaDescribedBy: ["T4"], type: ButtonType.Reject, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaDescribedBy: ["T4"], type: ButtonType.Reject, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaDescribedBy: ["T4"], type: ButtonType.Reject, ariaLabelledBy: ["L1"] }),
			new Button({ icon: "sap-icon://home", tooltip: "Home", ariaDescribedBy: ["T4"], type: ButtonType.Reject, ariaLabelledBy: ["L1"] })
		]
	}).addStyleClass("sapUiSmallMargin");

	const ButtonsWithSpecialTypesAttention = new VerticalLayout({
		content: [
			new Title({ text: "Type: Attention with label", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaLabelledBy: ["L1"], type: ButtonType.Attention }),
			new Button({ text: "Home", enabled: false, ariaLabelledBy: ["L1"], type: ButtonType.Attention }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaLabelledBy: ["L1"], type: ButtonType.Attention }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaLabelledBy: ["L1"], type: ButtonType.Attention }),
			new Button({ icon: "sap-icon://home", tooltip: "Home", ariaLabelledBy: ["L1"], type: ButtonType.Attention }),

			new Title("T5", { text: "Type: Attention with Description", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaDescribedBy: ["T5"], type: ButtonType.Attention, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", enabled: false, ariaDescribedBy: ["T5"], type: ButtonType.Attention, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaDescribedBy: ["T5"], type: ButtonType.Attention, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaDescribedBy: ["T5"], type: ButtonType.Attention, ariaLabelledBy: ["L1"] }),
			new Button({ icon: "sap-icon://home", tooltip: "Home", ariaDescribedBy: ["T5"], type: ButtonType.Attention, ariaLabelledBy: ["L1"] })
		]
	}).addStyleClass("sapUiSmallMargin");

	const ButtonsWithSpecialTypesEmphasized = new VerticalLayout({
		content: [
			new Title({ text: "Type: Emphasized with label", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaLabelledBy: ["L1"], type: ButtonType.Emphasized }),
			new Button({ text: "Home", enabled: false, ariaLabelledBy: ["L1"], type: ButtonType.Emphasized }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaLabelledBy: ["L1"], type: ButtonType.Emphasized }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaLabelledBy: ["L1"], type: ButtonType.Emphasized }),
			new Button({ icon: "sap-icon://home", tooltip: "Home", ariaLabelledBy: ["L1"], type: ButtonType.Emphasized }),

			new Title("T6", { text: "Type: Emphasized with Description", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			new Button({ text: "Home", ariaDescribedBy: ["T6"], type: ButtonType.Emphasized, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", enabled: false, ariaDescribedBy: ["T6"], type: ButtonType.Emphasized, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", ariaDescribedBy: ["T6"], type: ButtonType.Emphasized, ariaLabelledBy: ["L1"] }),
			new Button({ text: "Home", icon: "sap-icon://home", iconFirst: false, ariaDescribedBy: ["T6"], type: ButtonType.Emphasized, ariaLabelledBy: ["L1"] }),
			new Button({ icon: "sap-icon://home", tooltip: "Home", ariaDescribedBy: ["T6"], type: ButtonType.Emphasized, ariaLabelledBy: ["L1"] })
		]
	}).addStyleClass("sapUiSmallMargin");

	const oPage = new Page("page1", {
		title:"Button Test page",
		titleLevel: TitleLevel.H1,
		content : [
			new Label("L1", { text: "Go to homepage", width: "100%" }),
			oDefaultButtons,
			new Title({ text: "Buttons with special types:", level: TitleLevel.H2, width: "100%" }).addStyleClass("sapUiSmallMarginTop"),
			ButtonsWithSpecialTypesBack,
			ButtonsWithSpecialTypesAccept,
			ButtonsWithSpecialTypesReject,
			ButtonsWithSpecialTypesAttention,
			ButtonsWithSpecialTypesEmphasized
		]
	});

	oPage.addStyleClass("sapUiContentPadding");
	app.addPage(oPage);
	app.placeAt("body");
});
