sap.ui.define([
	"sap/m/App",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Menu",
	"sap/m/MenuButton",
	"sap/m/MenuItem",
	"sap/m/OverflowToolbar",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Page",
	"sap/ui/core/library",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout"
], function(App, Label, mobileLibrary, Menu, MenuButton, MenuItem, OverflowToolbar, MText, Title, Page, coreLibrary, VerticalLayout, HorizontalLayout) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.MenuButtonMode
	var MenuButtonMode = mobileLibrary.MenuButtonMode;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

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
			wrapping: true,
			titleStyle: TitleLevel.H2
		}).addStyleClass("sapUiMediumMarginTop");
	}

	function getText(sText) {
		return new MText({text: sText}).addStyleClass("sapUiSmallMarginTop");
	}


	// -----------------
	// Layout sections
	// -----------------

	var oStandardRegularModeLayout = new VerticalLayout({
		content: [
			getTitle("Standard - Regular mode "),

			getText("Default:"),
			new MenuButton({ text: "Something", menu: generateMenu() }),

			getText("Connected to a label:"),
			new Label({ text: "Label", labelFor: "standardRegularModeWithLabel" }),
			new MenuButton("standardRegularModeWithLabel", { text: "Something", menu: generateMenu() }),

			getText("Using ariaLabelledBy:"),
			new MText("standardRegularLabelledBy", { text: "Label" }),
			new MenuButton({ text: "Something", ariaLabelledBy: "standardRegularLabelledBy", menu: generateMenu() }),

			getText("Using ariaDescribedBy:"),
			new MText("standardRegularDescribedBy", { text: "Description" }),
			new MenuButton({ text: "Something", ariaLabelledBy: "standardRegularDescribedBy", menu: generateMenu() })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oIconOnlyRegularMenuButtonsLayout = new VerticalLayout({
		content: [
			getTitle("Icon only - Regular mode "),

			getText("Default:"),
			new MenuButton({ icon: "sap-icon://action", menu: generateMenu() }),

			getText("Connected to a label:"),
			new Label({ text: "Label", labelFor: "iconOnlyRegularModeWithLabel" }),
			new MenuButton("iconOnlyRegularModeWithLabel", { icon: "sap-icon://action", menu: generateMenu() }),

			getText("Using ariaLabelledBy:"),
			new MText("iconOnlyRegularLabelledBy", { text: "Label" }),
			new MenuButton({ icon: "sap-icon://action", ariaLabelledBy: "iconOnlyRegularLabelledBy", menu: generateMenu() }),

			getText("Using ariaDescribedBy:"),
			new MText("iconOnlyRegularDescribedBy", { text: "Description" }),
			new MenuButton({ icon: "sap-icon://action", ariaLabelledBy: "iconOnlyRegularDescribedBy", menu: generateMenu() })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oStandardSplitModeLayout = new VerticalLayout({
		content: [
			getTitle("Standard - Split mode "),

			getText("Default:"),
			new MenuButton({ text: "Something", buttonMode: MenuButtonMode.Split, menu: generateMenu() }),

			getText("Connected to a label:"),
			new Label({ text: "Label", labelFor: "standardSplitModeWithLabel" }),
			new MenuButton("standardSplitModeWithLabel", { text: "Something", buttonMode: MenuButtonMode.Split, menu: generateMenu() }),

			getText("Using ariaLabelledBy:"),
			new MText("standardSplitLabelledBy", { text: "Label" }),
			new MenuButton({ text: "Something", buttonMode: MenuButtonMode.Split, ariaLabelledBy: "standardSplitLabelledBy", menu: generateMenu() }),

			getText("Using ariaDescribedBy:"),
			new MText("standardSplitDescribedBy", { text: "Description" }),
			new MenuButton({ text: "Something", buttonMode: MenuButtonMode.Split, ariaLabelledBy: "standardSplitDescribedBy", menu: generateMenu() })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oIconOnlySplitModeLayout = new VerticalLayout({
		content: [
			getTitle("Icon only - Split mode "),

			getText("Default:"),
			new MenuButton({ icon: "sap-icon://action", buttonMode: MenuButtonMode.Split, menu: generateMenuIcons() }),

			getText("Connected to a label:"),
			new Label({ text: "Label", labelFor: "iconOnlySplitModeWithLabel" }),
			new MenuButton("iconOnlySplitModeWithLabel", { icon: "sap-icon://action", buttonMode: MenuButtonMode.Split, menu: generateMenuIcons() }),

			getText("Using ariaLabelledBy:"),
			new MText("iconOnlySplitLabelledBy", { text: "Label" }),
			new MenuButton({ icon: "sap-icon://action", buttonMode: MenuButtonMode.Split, ariaLabelledBy: "iconOnlySplitLabelledBy", menu: generateMenuIcons() }),

			getText("Using ariaDescribedBy:"),
			new MText("iconOnlySplitDescribedBy", { text: "Description" }),
			new MenuButton({ icon: "sap-icon://action", buttonMode: MenuButtonMode.Split, ariaLabelledBy: "iconOnlySplitDescribedBy", menu: generateMenuIcons() })
		]
	}).addStyleClass("sapUiLargeMarginBeginEnd");

	var oStandardRegularModeTypesLayout = new VerticalLayout({
		width:"100%",
		content: [
			getTitle("Types: Standard - Regular mode ").addStyleClass("sapUiLargeMarginBeginEnd"),
			new OverflowToolbar({
				width: "100%",
				content: [
					new MenuButton({ text: "Something", type: ButtonType.Accept, menu: generateMenu() }).addStyleClass("sapUiSmallMarginEnd"),
					new MenuButton({ text: "Something", type: ButtonType.Reject, menu: generateMenu() }).addStyleClass("sapUiSmallMarginEnd"),
					new MenuButton({ text: "Something", type: ButtonType.Emphasized, menu: generateMenu() }),
					new MenuButton({ text: "Something", type: ButtonType.Attention, menu: generateMenu() }).addStyleClass("sapUiSmallMarginEnd")
				]
			}).addStyleClass("sapUiSmallMarginTop").addStyleClass("sapUiLargeMarginBeginEnd")
		]
	});

	var oIconOnlyRegularModeTypesLayout = new VerticalLayout({
		width: "100%",
		content: [
			getTitle("Types: Icon only - Regular mode ").addStyleClass("sapUiLargeMarginBeginEnd"),
			new OverflowToolbar({
				width: "100%",
				content: [
					new MenuButton({ icon: "sap-icon://action", type: ButtonType.Accept, menu: generateMenu() }).addStyleClass("sapUiSmallMarginEnd"),
					new MenuButton({ icon: "sap-icon://action", type: ButtonType.Reject, menu: generateMenu() }).addStyleClass("sapUiSmallMarginEnd"),
					new MenuButton({ icon: "sap-icon://action", type: ButtonType.Emphasized, menu: generateMenu() }),
					new MenuButton({ icon: "sap-icon://action", type: ButtonType.Attention, menu: generateMenu() }).addStyleClass("sapUiSmallMarginEnd")
				]
			}).addStyleClass("sapUiSmallMarginTop").addStyleClass("sapUiLargeMarginBeginEnd")
		]
	});

	var oStandardSplitModeTypesLayout = new VerticalLayout({
		width: "100%",
		content: [
			getTitle("Types: Standard - Split mode ").addStyleClass("sapUiLargeMarginBeginEnd"),
			new OverflowToolbar({
				width: "100%",
				content: [
					new MenuButton({ text: "Something", type: ButtonType.Accept, buttonMode: MenuButtonMode.Split, menu: generateMenu() }).addStyleClass("sapUiSmallMarginEnd"),
					new MenuButton({ text: "Something", type: ButtonType.Reject, buttonMode: MenuButtonMode.Split, menu: generateMenu() }).addStyleClass("sapUiSmallMarginEnd"),
					new MenuButton({ text: "Something", type: ButtonType.Emphasized, buttonMode: MenuButtonMode.Split, menu: generateMenu() }),
					new MenuButton({ text: "Something", type: ButtonType.Attention, buttonMode: MenuButtonMode.Split, menu: generateMenu() }).addStyleClass("sapUiSmallMarginEnd")
				]
			}).addStyleClass("sapUiSmallMarginTop").addStyleClass("sapUiLargeMarginBeginEnd")
		]
	});

	var oIconOnlySplitModeTypesLayout = new VerticalLayout({
		width: "100%",
		content: [
			getTitle("Types: Icon only - Regular mode ").addStyleClass("sapUiLargeMarginBeginEnd"),
			new OverflowToolbar({
				width: "100%",
				content: [
					new MenuButton({ icon: "sap-icon://action", type: ButtonType.Accept, buttonMode: MenuButtonMode.Split, menu: generateMenuIcons() }).addStyleClass("sapUiSmallMarginEnd"),
					new MenuButton({ icon: "sap-icon://action", type: ButtonType.Reject, buttonMode: MenuButtonMode.Split, menu: generateMenuIcons() }).addStyleClass("sapUiSmallMarginEnd"),
					new MenuButton({ icon: "sap-icon://action", type: ButtonType.Emphasized, buttonMode: MenuButtonMode.Split, menu: generateMenuIcons() }),
					new MenuButton({ icon: "sap-icon://action", type: ButtonType.Attention, buttonMode: MenuButtonMode.Split, menu: generateMenuIcons() }).addStyleClass("sapUiSmallMarginEnd")
				]
			}).addStyleClass("sapUiSmallMarginTop").addStyleClass("sapUiLargeMarginBeginEnd")
		]
	});

	// -----------------
	// Final page
	// -----------------

	var oApp = new App(),
		oPage = new Page({
			title: "MenuButton ACC Test Page",
			titleLevel: TitleLevel.H1,
			content: [
				oStandardRegularModeLayout,
				oIconOnlyRegularMenuButtonsLayout,
				oStandardSplitModeLayout,
				oIconOnlySplitModeLayout,
				oStandardRegularModeTypesLayout,
				oIconOnlyRegularModeTypesLayout,
				oStandardSplitModeTypesLayout,
				oIconOnlySplitModeTypesLayout
			]
		});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
