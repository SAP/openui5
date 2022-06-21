sap.ui.define([
	"sap/m/library",
	"sap/m/Text",
	"sap/m/Title",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Switch",
	"sap/m/Label",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/App",
	"sap/m/Page"
], function(mobileLibrary, MText, Title, VerticalLayout, Switch, Label, Table, Column, ColumnListItem, App, Page) {
	"use strict";

	// shortcut for sap.m.SwitchType
	var SwitchType = mobileLibrary.SwitchType;

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

	var oDefaultType = new VerticalLayout({
		content: [
			getTitle("Default type"),

			getText("Regular:"),
			new Switch(),

			getText("Disabled:"),
			new Switch({ enabled: false }),

			getText("Connected to a Label:"),
			new Label({ text: "Label", labelFor: "defaultSwitchWithLabel" }),
			new Switch("defaultSwitchWithLabel"),

			getText("Using ariaLabelledBy association:"),
			new MText("defaultSwitchLabelledBy", { text: "Label" }),
			new Switch({ ariaLabelledBy: "defaultSwitchLabelledBy" })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oDefaultCustomTextLayout = new VerticalLayout({
		content: [
			getTitle("Default type with custom text"),

			getText("Regular:"),
			new Switch({ customTextOn: "Yes", customTextOff: "No" }),

			getText("Disabled:"),
			new Switch({ customTextOn: "Yes", customTextOff: "No", enabled: false }),

			getText("Connected to a Label:"),
			new Label({ text: "Label", labelFor: "defaultCustomTextSwitchWithLabel" }),
			new Switch("defaultCustomTextSwitchWithLabel", { customTextOn: "Yes", customTextOff: "No" }),

			getText("Using ariaLabelledBy association:"),
			new MText("defaultCustomTextSwitchLabelledBy", { text: "Label" }),
			new Switch({ customTextOn: "Yes", customTextOff: "No", ariaLabelledBy: "defaultCustomTextSwitchLabelledBy" })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oDefaultNoTextLayout = new VerticalLayout({
		content: [
			getTitle("Default type without text (via custom text)"),

			getText("Regular:"),
			new Switch({ customTextOn: " ", customTextOff: " " }),

			getText("Disabled:"),
			new Switch({ customTextOn: " ", customTextOff: " ", enabled: false }),

			getText("Connected to a Label:"),
			new Label({ text: "Label", labelFor: "defaultNoTextSwitchWithLabel" }),
			new Switch("defaultNoTextSwitchWithLabel", { customTextOn: " ", customTextOff: " " }),

			getText("Using ariaLabelledBy association:"),
			new MText("defaultNoTextSwitchLabelledBy", { text: "Label" }),
			new Switch({ customTextOn: " ", customTextOff: " ", ariaLabelledBy: "defaultNoTextSwitchLabelledBy" })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oAcceptRejectLayout = new VerticalLayout({
		content: [
			getTitle("AcceptReject type"),

			getText("Regular:"),
			new Switch({ type: SwitchType.AcceptReject }),

			getText("Disabled:"),
			new Switch({ type: SwitchType.AcceptReject, enabled: false }),

			getText("Connected to a Label:"),
			new Label({ text: "Label", labelFor: "acceptRejectSwitchWithLabel" }),
			new Switch("acceptRejectSwitchWithLabel", { type: SwitchType.AcceptReject }),

			getText("Using ariaLabelledBy association:"),
			new MText("acceptRejectSwitchLabelledBy", { text: "Label" }),
			new Switch({ type: SwitchType.AcceptReject, ariaLabelledBy: "acceptRejectSwitchLabelledBy" })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oTableLayout = new VerticalLayout({
		content: [
			getTitle("Switches in Table").addStyleClass("sapUiLargeMarginBegin sapUiSmallMarginBottom"),

			new Table({
				columns: [
					new Column({
						header: new MText({text: "Switch's type"})
					}),
					new Column({
						header: new MText({text: "Regular control"})
					}),
					new Column({
						header: new MText({text: "Disabled control"})
					})
				],
				items: [
					new ColumnListItem({
						cells: [
							new MText({text: "Default"}),
							new Switch(),
							new Switch({ enabled: false })
						]
					}),
					new ColumnListItem({
						cells: [
							new MText({ text: "Default with custom text" }),
							new Switch({ customTextOn: "Yes", customTextOff: "No" }),
							new Switch({ customTextOn: "Yes", customTextOff: "No", enabled: false })
						]
					}),
					new ColumnListItem({
						cells: [
							new MText({text: "Default without text"}),
							new Switch({ customTextOn: " ", customTextOff: " " }),
							new Switch({ customTextOn: " ", customTextOff: " ", enabled: false })
						]
					}),
					new ColumnListItem({
						cells: [
							new MText({text: "Accept Reject"}),
							new Switch({ type: SwitchType.AcceptReject }),
							new Switch({ type: SwitchType.AcceptReject, enabled: false })
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
			title: "Switch ACC Test Page",
			content: [
				oDefaultType,
				oDefaultCustomTextLayout,
				oDefaultNoTextLayout,
				oAcceptRejectLayout,
				oTableLayout
			]
		});

	oApp.addPage(oPage);
	oApp.placeAt("content");
});
