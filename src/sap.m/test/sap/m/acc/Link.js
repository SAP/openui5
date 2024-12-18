sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Title",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/library"
], function(App, Page, Label, Link, Title, VerticalLayout, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function getTitle(sText) {
		return new Title({
			text: sText,
			level: TitleLevel.H2,
			wrapping: true,
			titleStyle: TitleLevel.H5
		}).addStyleClass("sapUiMediumMarginTop");
	}

	var oRegularLinksLayout = new VerticalLayout({
		content: [
			getTitle("Regular Links"),

			new Label({ text: "With href:", wrapping: true, labelFor: "destination1" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination1", { text: "destination 1", href: "https://www.sap.com" }),

			new Label({ text: "Without href:", wrapping: true, labelFor: "destination2" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination2", { text: "destination 2" }),

			new Label("regularLinkLabelledBy", { text: "Using ariaLabelledBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 3", href: "https://www.sap.com", ariaLabelledBy: "regularLinkLabelledBy" }),

			new Label("regularLinkDescribedBy", { text: "Using ariaDescribedBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 4", href: "https://www.sap.com", ariaDescribedBy: "regularLinkDescribedBy" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oSubtleLinksLayout = new VerticalLayout({
		content: [
			getTitle("Subtle Links"),

			new Label({ text: "With href:", wrapping: true, labelFor: "destination5" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination5", { text: "destination 5", href: "https://www.sap.com", subtle: true }),

			new Label({ text: "Without href:", wrapping: true, labelFor: "destination6" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination6", { text: "destination 6", subtle: true }),

			new Label("subtleLinkLabelledBy", { text: "Using ariaLabelledBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 7", href: "https://www.sap.com", ariaLabelledBy: "subtleLinkLabelledBy", subtle: true }),

			new Label("subtleLinkDescribedBy", { text: "Using ariaDescribedBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 8", href: "https://www.sap.com", ariaDescribedBy: "subtleLinkDescribedBy", subtle: true })
		]
	}).addStyleClass("sapUiContentPadding");

	var oEmphasizedLayout = new VerticalLayout({
		content: [
			getTitle("Emphasized Links"),

			new Label({ text: "With href:", wrapping: true, labelFor: "destination9" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination9", { text: "destination 9", href: "https://www.sap.com", emphasized: true }),

			new Label({ text: "Without href:", wrapping: true, labelFor: "destination10" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination10", { text: "destination 10", emphasized: true }),

			new Label("emphasizedLinkLabelledBy", { text: "Using ariaLabelledBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 11", href: "https://www.sap.com", ariaLabelledBy: "emphasizedLinkLabelledBy", emphasized: true }),

			new Label("emphasizedLinkDescribedBy", { text: "Using ariaDescribedBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 12", href: "https://www.sap.com", ariaDescribedBy: "emphasizedLinkDescribedBy", emphasized: true })
		]
	}).addStyleClass("sapUiContentPadding");

	var oCombinedLayout = new VerticalLayout({
		content: [
			getTitle("Combined Links (Subtle & Emphasized)"),

			new Label({ text: "With href:", wrapping: true, labelFor: "destination13" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination13", { text: "destination 13", href: "https://www.sap.com", subtle: true, emphasized: true }),

			new Label({ text: "Without href:", wrapping: true, labelFor: "destination14" }).addStyleClass("sapUiSmallMarginTop"),
			new Link("destination14", { text: "destination 14", subtle: true, emphasized: true }),

			new Label("combinedLinkLabelledBy", { text: "Using ariaLabelledBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 15", href: "https://www.sap.com", ariaLabelledBy: "combinedLinkLabelledBy", subtle: true, emphasized: true }),

			new Label("combinedLinkDescribedBy", { text: "Using ariaDescribedBy association:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new Link({ text: "destination 16", href: "https://www.sap.com", ariaDescribedBy: "combinedLinkDescribedBy", subtle: true, emphasized: true })
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App(),
		oPage = new Page({
			title: "Link Accessibility Test Page",
			titleLevel: TitleLevel.H1,
			content: [
				oRegularLinksLayout,
				oSubtleLinksLayout,
				oEmphasizedLayout,
				oCombinedLayout
			]
		});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
