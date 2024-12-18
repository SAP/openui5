sap.ui.define([
	"sap/m/App",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Menu",
	"sap/m/MenuButton",
	"sap/m/MenuItem",
	"sap/m/Title",
	"sap/m/Page",
	"sap/ui/core/library",
	"sap/ui/layout/VerticalLayout"
], function(App, Label, mobileLibrary, Menu, MenuButton, MenuItem, Title, Page, coreLibrary, VerticalLayout) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.MenuButtonMode
	var MenuButtonMode = mobileLibrary.MenuButtonMode;

	function generateMenu() {
		return new Menu({
			items: [
				new MenuItem({text: "First dummy item"}),
				new MenuItem({text: "Second dummy item"})
			]
		});
	}

	function generateMenuIcons() {
		return new Menu({
			items: [
				new MenuItem({text: "First dummy item", icon: "sap-icon://favorite"}),
				new MenuItem({text: "Second dummy item", icon: "sap-icon://heart"})
			]
		});
	}

	function getTitle(sText) {
		return new Title({
			text: sText,
			level: TitleLevel.H2,
			wrapping: true,
			titleStyle: TitleLevel.H5
		}).addStyleClass("sapUiMediumMarginTop");
	}

	var oStandardRegularModeLayout = new VerticalLayout({
		content: [
			getTitle("Standard - Regular mode "),

			new Label({ text: "Default:", wrapping: true, labelFor: "action1" }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton("action1", { text: "action 1", menu: generateMenu() }),

			new Label("standardRegularLabelledBy", { text: "Using ariaLabelledBy:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton({ text: "action 2", ariaLabelledBy: "standardRegularLabelledBy", menu: generateMenu() }),

			new Label("standardRegularDescribedBy", { text: "Using ariaDescribedBy:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton({ text: "action 3", ariaDescribedBy: "standardRegularDescribedBy", menu: generateMenu() })
		]
	}).addStyleClass("sapUiContentPadding");

	var oIconOnlyRegularMenuButtonsLayout = new VerticalLayout({
		content: [
			getTitle("Icon only - Regular mode "),

			new Label({ text: "Default:", wrapping: true, labelFor: "action4" }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton("action4", { icon: "sap-icon://action", menu: generateMenu() }),

			new Label("iconOnlyRegularLabelledBy", { text: "Using ariaLabelledBy:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton({ icon: "sap-icon://action", ariaLabelledBy: "iconOnlyRegularLabelledBy", menu: generateMenu() }),

			new Label("iconOnlyRegularDescribedBy", { text: "Using ariaDescribedBy:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton({ icon: "sap-icon://action", ariaDescribedBy: "iconOnlyRegularDescribedBy", menu: generateMenu() })
		]
	}).addStyleClass("sapUiContentPadding");

	var oStandardSplitModeLayout = new VerticalLayout({
		content: [
			getTitle("Standard - Split mode "),

			new Label({ text: "Default:", wrapping: true, labelFor: "action5" }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton("action5", { text: "action 5", buttonMode: MenuButtonMode.Split, menu: generateMenu() }),

			new Label("standardSplitLabelledBy", { text: "Using ariaLabelledBy:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton({ text: "action 6", buttonMode: MenuButtonMode.Split, ariaLabelledBy: "standardSplitLabelledBy", menu: generateMenu() }),

			new Label("standardSplitDescribedBy", { text: "Using ariaDescribedBy:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton({ text: "action 7", buttonMode: MenuButtonMode.Split, ariaDescribedBy: "standardSplitDescribedBy", menu: generateMenu() })
		]
	}).addStyleClass("sapUiContentPadding");

	var oIconOnlySplitModeLayout = new VerticalLayout({
		content: [
			getTitle("Icon only - Split mode "),

			new Label({ text: "Default:", wrapping: true, labelFor: "action8" }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton("action8", { icon: "sap-icon://action", buttonMode: MenuButtonMode.Split, menu: generateMenuIcons() }),

			new Label("iconOnlySplitLabelledBy", { text: "Using ariaLabelledBy:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton({ icon: "sap-icon://action", buttonMode: MenuButtonMode.Split, ariaLabelledBy: "iconOnlySplitLabelledBy", menu: generateMenuIcons() }),

			new Label("iconOnlySplitDescribedBy", { text: "Using ariaDescribedBy:", wrapping: true }).addStyleClass("sapUiSmallMarginTop"),
			new MenuButton({ icon: "sap-icon://action", buttonMode: MenuButtonMode.Split, ariaDescribedBy: "iconOnlySplitDescribedBy", menu: generateMenuIcons() })
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App(),
		oPage = new Page({
			title: "MenuButton Accessibility Test Page",
			titleLevel: TitleLevel.H1,
			content: [
				oStandardRegularModeLayout,
				oIconOnlyRegularMenuButtonsLayout,
				oStandardSplitModeLayout,
				oIconOnlySplitModeLayout
			]
		});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
