sap.ui.define([
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/m/Label",
	"sap/ui/core/Popup",
	"sap/ui/layout/VerticalLayout",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/ui/unified/MenuTextFieldItem",
	"sap/ui/core/library"
], function(Button, MessageToast, Label, Popup, VerticalLayout, App, Page, Menu, MenuItem, MenuTextFieldItem, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function handleMenuItemPress (oEvent) {
		var oItem = oEvent.getParameter("item"),
			sMsg;

		if (oItem.getSubmenu()) {
			return;
		}

		if (oItem.isA("sap.ui.unified.MenuTextFieldItem")) {
			sMsg = "'" + oItem.getValue() + "' entered";
		} else {
			sMsg = "'" + oItem.getText() + "' pressed";
		}

		MessageToast.show(sMsg);
	}

	function handleMenuButtonPress(oEvent) {
		var oSource = oEvent.getSource(),
			oMenu = getMenu();

		oMenu.open(window.bIsKeyboardPress, oSource, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oSource);
	}

	function getMenu() {
		if (!window.oMenu) {
			window.oMenu = new Menu({
				itemSelect: handleMenuItemPress,
				items: [
					new MenuItem({
						text: "View Settings",
						shortcutText: "Alt + F4"
					}),
					new MenuItem({
						text: "Create Settings",
						enabled: false
					}),
					new MenuItem({
						text: "Create Settings",
						icon: "sap-icon://create"
					}),
					new MenuItem({
						text: "Modify Settings",
						startsSection: true,
						icon: "sap-icon://edit",
						submenu: new Menu({
							itemSelect: handleMenuItemPress,
							items: [
								new MenuItem({
									text: "Edit"
								}),
								new MenuItem({
									text: "Delete"
								}),
								new MenuItem({
									text: "Edit Metadata",
									enabled: false
								})
							]
						})
					}),
					new MenuTextFieldItem({
						icon: "sap-icon://filter",
						label: "Filter",
						startsSection: true,
						select: handleMenuItemPress
					}),
					new MenuItem({
						text: "Clear filter"
					})
				]
			});
		}

		return window.oMenu;
	}

	var oTextForLabelling = new Label({
		text: "This text will be used as a label for one menu item",
		labelFor: "menuButton",
		wrapping: true
	});

	var oMenuButton = new Button("menuButton",{
		text: "Open settings menu",
		press: handleMenuButtonPress
	});

	oMenuButton.attachBrowserEvent("tap keyup", function (oEvent) {
		window.bIsKeyboardPress = (oEvent.type === "keyup");
	});

	var oLayout = new VerticalLayout({
		content: [
			oTextForLabelling,
			oMenuButton
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "Menu Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: oLayout
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
