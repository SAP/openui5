sap.ui.define([
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/ui/core/Popup",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/ui/unified/MenuTextFieldItem"
], function(Button, MessageToast, Text, Popup, VerticalLayout, Menu, MenuItem, MenuTextFieldItem) {
	"use strict";

	// -----------------
	// Utility functions
	// -----------------

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
						text: "View Settings"
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
						text: "Item with ariaLabelledBy",
						icon: "sap-icon://blank-tag",
						ariaLabelledBy: "labelling-text"
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
					new MenuTextFieldItem({
						icon: "sap-icon://filter",
						label: "Another Filter",
						value: "FilterValue",
						enabled: false,
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


	// -------------------
	// Control preparation
	// -------------------

	var oTextForLabelling = new Text("labelling-text", {
		text: "This text will be used as a label for one menu item"
	});

	var oMenuButton = new Button({
		text: "Open settings menu",
		press: handleMenuButtonPress
	});

	oMenuButton.attachBrowserEvent("tap keyup", function (oEvent) {
		window.bIsKeyboardPress = (oEvent.type === "keyup");
	});


	// -------------
	// Page's layout
	// -------------

	var oLayout = new VerticalLayout({
		content: [
			oTextForLabelling,
			oMenuButton
		]
	});

	oLayout.placeAt("content");
});
