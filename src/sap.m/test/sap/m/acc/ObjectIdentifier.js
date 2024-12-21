sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/ObjectIdentifier",
	"sap/ui/layout/VerticalLayout",
	"sap/m/MessageToast",
	"sap/m/Label",
	"sap/m/Title",
	"sap/ui/core/library"
], function(App, Page, ObjectIdentifier, VerticalLayout, MessageToast, Label, Title, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function onTitlePress(oEvent) {
		MessageToast.show(oEvent.getSource().getId() + " pressed");
	}

	function getTitle(sText) {
		return new Title({
			text: sText,
			level: TitleLevel.H2,
			titleStyle: TitleLevel.H5,
			wrapping: true
		}).addStyleClass("sapUiMediumMarginTop");
	}

	function getObjectIdentifier(oProps, bShouldIndent) {
		var oGeneratedObjectIdentifier = new ObjectIdentifier(oProps);

		if (bShouldIndent) {
			oGeneratedObjectIdentifier.addStyleClass("sapUiMediumMarginBegin");
		}

		return oGeneratedObjectIdentifier;
	}

	var oActiveObjectIdentifier = getObjectIdentifier({
		title: "Notebook",
		text: "Perfectly fine for daily use",
		titleActive: true,
		titlePress: onTitlePress,
		ariaLabelledBy: ["L1"]
	}, true);

	var oObjectIdentifier = getObjectIdentifier({
		title: "Gaming Notebook",
		text: "Your wallet is going to feel this",
		ariaLabelledBy: ["L2"]
	}, true);

	var oActiveTextlessObjectIdentifier = getObjectIdentifier({
		title: "Ultrawide monitor",
		titleActive: true,
		titlePress: onTitlePress,
		ariaLabelledBy: ["L3"]
	}, true);

	var oTextlessObjectIdentifier = getObjectIdentifier({
		title: "Standard monitor"
	}, true);

	var oTitlelessObjectIdentifier = getObjectIdentifier({
		text: "Just a regular computer shop"
	}, true);

	var oLayout = new VerticalLayout({
		content: [
			getTitle("Standalone ObjectIdentifiers"),

			new Label("L1", {text: "Active ObjectIdentifier with title and text:", wrapping: true}),
			oActiveObjectIdentifier,
			new Label("L2", {text: "Active ObjectIdentifier with title and text:", wrapping: true}),
			oObjectIdentifier,
			new Label("L3", {text: "Active ObjectIdentifier with title only:", wrapping: true}),
			oActiveTextlessObjectIdentifier,
			new Label("L4", {text: "ObjectIdentifier with title only:", wrapping: true}),
			oTextlessObjectIdentifier,
			new Label("L5", {text: "ObjectIdentifier with text only:", wrapping: true}),
			oTitlelessObjectIdentifier
		]
	}).addStyleClass("sapUiContentPadding");

	new App({
		pages: new Page({
			title: "ObjectIdentifiers Accessibility Test Page",
			titleLevel: TitleLevel.H1,
			content: oLayout
		})
	}).placeAt("body");
});
