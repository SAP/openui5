// Note: the HTML page 'MenuVisual.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/m/Button",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/ui/unified/MenuTextFieldItem",
	"sap/ui/unified/MenuItemsGroup",
	"sap/ui/core/library",
	"sap/ui/core/Popup",
	"sap/m/App",
	"sap/m/Page"
], function(Button, Menu, MenuItem, MenuTextFieldItem, MenuItemsGroup, coreLibrary, Popup, App, Page) {
	"use strict";

	var ItemSelectionMode = coreLibrary.ItemSelectionMode;

	var oTestMenu = new Menu("mainMenu"),
		oTestMenu3 = new Menu("shortcutsMenu", {
			items: [
				new MenuItem({
					text: "Item 1",
					shortcutText: "Ctrl+S",
					icon: "sap-icon://save"
				}),
				new MenuItem({
					text: "Item 2"
				}),
				new MenuItem({
					text: "Item 3",
					shortcutText: "Ctrl+A",
					icon: "sap-icon://save",
					submenu: new Menu({
						items: [
							new MenuItem({
								text: "Submenu Item 1",
								shortcutText: "Ctrl+B",
								icon: "sap-icon://save"
							}),
							new MenuItem({
								text: "Submenu Item 2",
								icon: "sap-icon://save"
							}),
						]
					})
				}),
				new MenuItem({
					text: "Item 4",
					shortcutText: "Ctrl+C"
				}),
				new MenuItem({
					text: "Regular Item 5",
					icon: "sap-icon://save"
				}),
				new MenuTextFieldItem({
					label: "Find",
					startsSection: true,
					icon: "sap-icon://filter"
				})
			]
		}),
		oTestMenu4 = new Menu("selectionMenu", {
			items: [
			new MenuItem({
					text: "New",
					shortcutText: "Ctrl+N",
					icon: "sap-icon://create"
				}),
				new MenuItem({
					text: "Open",
					shortcutText: "Ctrl+O",
					icon: "sap-icon://open-folder"
				}),
				new MenuItem({
					text: "Save",
					icon: "sap-icon://save",
					submenu: new Menu({
						items: [
							new MenuItem({
								text: "Submenu Item 1",
								shortcutText: "Ctrl+B",
								icon: "sap-icon://save"
							}),
							new MenuItem({
								text: "Submenu Item 2",
								icon: "sap-icon://save"
							}),
						]
					})
				}),
				new MenuItemsGroup({
					itemSelectionMode: ItemSelectionMode.MultiSelect,
					items: [
						new MenuItem({
							text: "Bold",
							icon: "sap-icon://bold-text",
							shortcutText: "Ctrl + B"
						}),
						new MenuItem({
							text: "Italic",
							icon: "sap-icon://italic-text",
							shortcutText: "Ctrl + I"
						}),
						new MenuItem({
							selected: true,
							text: "Underline",
							icon: "sap-icon://underline-text",
							shortcutText: "Ctrl + U"
						}),
						new MenuItem({
							selected: true,
							text: "Strikethrough",
							icon: "sap-icon://strikethrough",
							shortcutText: "Ctrl + T"
						})
					]
				}),
				new MenuTextFieldItem({
					label: "Find",
					startsSection: true,
					icon: "sap-icon://filter"
				}),
				new MenuItemsGroup({
					itemSelectionMode: ItemSelectionMode.SingleSelect,
					items: [
						new MenuItem({
							text: "Left Alignment",
							icon: "sap-icon://text-align-left"
						}),
						new MenuItem({
							text: "Center Alignment",
							icon: "sap-icon://text-align-center"
						}),
						new MenuItem({
							selected: true,
							text: "Right Alignment",
							icon: "sap-icon://text-align-right"
						})
					]
				})
			]
		}),
		oFirstMenuItem = new MenuItem("I221"),
		oSecondMenuItem = new MenuTextFieldItem("I222", {}),
		oButton1,
		oButton2,
		oButton3,
		oButton4,
		oApp,
		oPage,
		eDock = Popup.Dock;

	oTestMenu.addItem(oFirstMenuItem);
	oTestMenu.addItem(oSecondMenuItem);

	oButton1 = new Button("B1", {
		text : "FirstButton",
		press : function(){
			oTestMenu.open(false, oButton1, eDock.BeginTop, eDock.BeginTop, oButton1, "0 0");
		}
	});

	oButton2 = new Button("B2", {
		text : "SecondButton",
		press : function(){
		}
	});

	oButton3 = new Button("B3", {
		text : "ThirdButton",
		press : function(){
			oTestMenu3.open(false, oButton3, eDock.BeginTop, eDock.BeginTop, oButton3, "0 0");
		}
	});

	oButton4 = new Button("B4", {
		text : "FourthButton",
		press : function(){
			oTestMenu4.open(false, oButton4, eDock.BeginTop, eDock.BeginTop, oButton4, "0 0");
		}
	});

	oApp = new App("myApp").placeAt("body");

	oPage = new Page({
		title: "Menu Test",
		content : [
			oButton1,
			oButton2,
			oButton3,
			oButton4
		]
	});

	oApp.addPage(oPage);
});