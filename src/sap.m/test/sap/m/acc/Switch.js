sap.ui.define([
	"sap/m/library",
	"sap/ui/core/library",
	"sap/m/Title",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Switch",
	"sap/m/Label",
	"sap/m/App",
	"sap/m/Page"
], function(mobileLibrary, coreLibrary, Title, VerticalLayout, Switch, Label, App, Page) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.SwitchType
	var SwitchType = mobileLibrary.SwitchType;

	function getTitle(sText) {
		return new Title({
			text: sText,
			titleLevel: TitleLevel.H2,
			titleStyle: TitleLevel.H5,
			wrapping: true
		}).addStyleClass("sapUiMediumMarginTop");
	}

	var oDefaultType = new VerticalLayout({
		content: [
			getTitle("Default type"),

			new Label({text: "Regular", wrapping: true, labelFor: "defaultSwitch"}),
			new Switch("defaultSwitch", {}),

			new Label({text: "Disabled", wrapping: true, labelFor: "disabledSwitch"}),
			new Switch("disabledSwitch", { enabled: false }),

			new Label({ text: "Label", wrapping: true, labelFor: "defaultSwitchWithLabel" }),
			new Switch("defaultSwitchWithLabel"),

			new Label({ text: "Using ariaLabelledBy association", wrapping: true, labelFor: "defaultSwitchLabelledBy" }),
			new Switch({ ariaLabelledBy: "defaultSwitchLabelledBy" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oDefaultCustomTextLayout = new VerticalLayout({
		content: [
			getTitle("Default type with custom text"),

			new Label({ text: "Regular with text", wrapping: true, labelFor: "regularWithText" }),
			new Switch("regularWithText", { customTextOn: "Yes", customTextOff: "No" }),

			new Label({ text: "Disabled with text", wrapping: true, labelFor: "disabledWithText" }),
			new Switch("disabledWithText", { customTextOn: "Yes", customTextOff: "No", enabled: false }),

			new Label({ text: "Switch with label", wrapping: true, labelFor: "defaultCustomTextSwitchWithLabel" }),
			new Switch("defaultCustomTextSwitchWithLabel", { customTextOn: "Yes", customTextOff: "No" }),

			new Label("defaultCustomTextSwitchLabelledBy", { text: "Using ariaLabelledBy association", wrapping: true }),
			new Switch({ customTextOn: "Yes", customTextOff: "No", ariaLabelledBy: "defaultCustomTextSwitchLabelledBy" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oDefaultNoTextLayout = new VerticalLayout({
		content: [
			getTitle("Default type without text (via custom text)"),

			new Label({ text: "Regular without text", wrapping: true, labelFor: "regularWithoutText" }),
			new Switch("regularWithoutText", { customTextOn: " ", customTextOff: " " }),

			new Label({ text: "Disabled without text", wrapping: true, labelFor: "disabledWithoutText" }),
			new Switch("disabledWithoutText", { customTextOn: " ", customTextOff: " ", enabled: false }),

			new Label("defaultNoTextSwitchLabelledBy", { text: "Using ariaLabelledBy association", wrapping: true }),
			new Switch({ customTextOn: " ", customTextOff: " ", ariaLabelledBy: "defaultNoTextSwitchLabelledBy" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oAcceptRejectLayout = new VerticalLayout({
		content: [
			getTitle("AcceptReject type"),

			new Label({ text: "Regular", labelFor: "regularWithAcceptStatus" }),
			new Switch("regularWithAcceptStatus", { type: SwitchType.AcceptReject }),

			new Label({ text: "Disabled", labelFor: "disabledWithAcceptStatus" }),
			new Switch("disabledWithAcceptStatus", { type: SwitchType.AcceptReject, enabled: false }),

			new Label("acceptRejectSwitchLabelledBy", { text: "Using ariaLabelledBy association" }),
			new Switch({ type: SwitchType.AcceptReject, ariaLabelledBy: "acceptRejectSwitchLabelledBy" })
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App(),
		oPage = new Page({
			title: "Switch Accessibility Test Page",
			titleLevel: TitleLevel.H1,
			content: [
				oDefaultType,
				oDefaultCustomTextLayout,
				oDefaultNoTextLayout,
				oAcceptRejectLayout
			]
		});

	oApp.addPage(oPage);
	oApp.placeAt("content");
});
