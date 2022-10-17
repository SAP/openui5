sap.ui.define([
	"sap/m/App",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Page",
	"sap/m/Table",
	"sap/m/Text",
	"sap/m/Title",
	"sap/ui/layout/VerticalLayout"
], function(App, Column, ColumnListItem, Label, Link, Page, Table, MText, Title, VerticalLayout) {
	"use strict";

	// ----------------
	// Utility functions
	// ----------------

	function getText(sText) {
		return new MText({ text: sText }).addStyleClass("sapUiSmallMarginTop");
	}

	function getTitle(sText) {
		return new Title({
			text: sText,
			titleStyle: "H3"
		}).addStyleClass("sapUiMediumMarginTop");
	}


	// ----------------
	// Layout sections
	// ----------------

	var oRegularLinksLayout = new VerticalLayout({
		content: [
			getTitle("Regular Links"),

			getText("With href:"),
			new Link({ text: "Something", href: "https://www.sap.com" }),

			getText("Without href:"),
			new Link({ text: "Something" }),

			getText("Disabled:"),
			new Link({ text: "Something", href: "https://www.sap.com", enabled: false}),

			getText("Connected to a Label:"),
			new Label({ text: "Label", labelFor: "regularLinkWithLabel" }),
			new Link("regularLinkWithLabel", { text: "Something", href: "https://www.sap.com" }),

			getText("Using ariaLabelledBy association:"),
			new MText("regularLinkLabelledBy", { text: "Label" }),
			new Link({ text: "Something", href: "https://www.sap.com", ariaLabelledBy: "regularLinkLabelledBy" }),

			getText("Using ariaDescribedBy association:"),
			new MText("regularLinkDescribedBy", { text: "Description" }),
			new Link({ text: "Something", href: "https://www.sap.com", ariaDescribedBy: "regularLinkDescribedBy" })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oSubtleLinksLayout = new VerticalLayout({
		content: [
			getTitle("Subtle Links"),

			getText("With href:"),
			new Link({ text: "Something", href: "https://www.sap.com", subtle: true }),

			getText("Without href:"),
			new Link({ text: "Something", subtle: true }),

			getText("Disabled:"),
			new Link({ text: "Something", href: "https://www.sap.com", enabled: false, subtle: true}),

			getText("Connected to a Label:"),
			new Label({ text: "Label", labelFor: "subtleLinkWithLabel" }),
			new Link("subtleLinkWithLabel", { text: "Something", href: "https://www.sap.com", subtle: true }),

			getText("Using ariaLabelledBy association:"),
			new MText("subtleLinkLabelledBy", { text: "Label" }),
			new Link({ text: "Something", href: "https://www.sap.com", ariaLabelledBy: "subtleLinkLabelledBy", subtle: true }),

			getText("Using ariaDescribedBy association:"),
			new MText("subtleLinkDescribedBy", { text: "Description" }),
			new Link({ text: "Something", href: "https://www.sap.com", ariaDescribedBy: "subtleLinkDescribedBy", subtle: true })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oEmphasizedLayout = new VerticalLayout({
		content: [
			getTitle("Emphasized Links"),

			getText("With href:"),
			new Link({ text: "Something", href: "https://www.sap.com", emphasized: true }),

			getText("Without href:"),
			new Link({ text: "Something", emphasized: true }),

			getText("Disabled:"),
			new Link({ text: "Something", href: "https://www.sap.com", enabled: false, emphasized: true}),

			getText("Connected to a Label:"),
			new Label({ text: "Label", labelFor: "emphasizedLinkWithLabel" }),
			new Link("emphasizedLinkWithLabel", { text: "Something", href: "https://www.sap.com", emphasized: true }),

			getText("Using ariaLabelledBy association:"),
			new MText("emphasizedLinkLabelledBy", { text: "Label" }),
			new Link({ text: "Something", href: "https://www.sap.com", ariaLabelledBy: "emphasizedLinkLabelledBy", emphasized: true }),

			getText("Using ariaDescribedBy association:"),
			new MText("emphasizedLinkDescribedBy", { text: "Description" }),
			new Link({ text: "Something", href: "https://www.sap.com", ariaDescribedBy: "emphasizedLinkDescribedBy", emphasized: true })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oCombinedLayout = new VerticalLayout({
		content: [
			getTitle("Combined Links (Subtle & Emphasized)"),

			getText("With href:"),
			new Link({ text: "Something", href: "https://www.sap.com", subtle: true, emphasized: true }),

			getText("Without href:"),
			new Link({ text: "Something", subtle: true, emphasized: true }),

			getText("Disabled:"),
			new Link({ text: "Something", href: "https://www.sap.com", enabled: false, subtle: true, emphasized: true}),

			getText("Connected to a Label:"),
			new Label({ text: "Label", labelFor: "combinedLinkWithLabel" }),
			new Link("combinedLinkWithLabel", { text: "Something", href: "https://www.sap.com", subtle: true, emphasized: true }),

			getText("Using ariaLabelledBy association:"),
			new MText("combinedLinkLabelledBy", { text: "Label" }),
			new Link({ text: "Something", href: "https://www.sap.com", ariaLabelledBy: "combinedLinkLabelledBy", subtle: true, emphasized: true }),

			getText("Using ariaDescribedBy association:"),
			new MText("combinedLinkDescribedBy", { text: "Description" }),
			new Link({ text: "Something", href: "https://www.sap.com", ariaDescribedBy: "combinedLinkDescribedBy", subtle: true, emphasized: true })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");


	var oTableLayout = new VerticalLayout({
		content: [
			getTitle("Links in Table").addStyleClass("sapUiLargeMarginBegin sapUiSmallMarginBottom"),

			new Table({
				columns: [
					new Column({
						header: new MText({text: "Link's type"})
					}),
					new Column({
						header: new MText({text: "Control with href"})
					}),
					new Column({
						header: new MText({text: "Control without href"})
					}),
					new Column({
						header: new MText({text: "Disabled control"})
					})
				],
				items: [
					new ColumnListItem({
						cells: [
							new MText({text: "Regular"}),
							new Link({text: "Something", href: "https://www.sap.com"}),
							new Link({text: "Something"}),
							new Link({text: "Something", href: "https://www.sap.com", enabled: false})
						]
					}),
					new ColumnListItem({
						cells: [
							new MText({text: "Subtle"}),
							new Link({text: "Something", href: "https://www.sap.com", subtle: true}),
							new Link({text: "Something", subtle: true}),
							new Link({text: "Something", href: "https://www.sap.com", subtle: true, enabled: false})
						]
					}),
					new ColumnListItem({
						cells: [
							new MText({text: "Emphasized"}),
							new Link({text: "Something", href: "https://www.sap.com", emphasized: true}),
							new Link({text: "Something", emphasized: true}),
							new Link({text: "Something", href: "https://www.sap.com", emphasized: true, enabled: false})
						]
					}),
					new ColumnListItem({
						cells: [
							new MText({text: "Combined"}),
							new Link({text: "Something", href: "https://www.sap.com", subtle: true, emphasized: true}),
							new Link({text: "Something", subtle: true, emphasized: true}),
							new Link({text: "Something", href: "https://www.sap.com", subtle: true, emphasized: true, enabled: false})
						]
					})
				]
			})
		]
	});


	// ----------------
	// Final page
	// ----------------

	var oApp = new App(),
		oPage = new Page({
			title: "Link ACC Test Page",
			content: [
				oRegularLinksLayout,
				oSubtleLinksLayout,
				oEmphasizedLayout,
				oCombinedLayout,
				oTableLayout
			]
		});

	oApp.addPage(oPage);
	oApp.placeAt("content");
});
