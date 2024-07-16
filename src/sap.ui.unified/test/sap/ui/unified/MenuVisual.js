// Note: the HTML page 'MenuVisual.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/ui/unified/MenuTextFieldItem",
	"sap/ui/core/Popup",
	"sap/m/Button",
	"sap/m/App",
	"sap/m/Page"
], function(Menu, MenuItem, MenuTextFieldItem, Popup, Button, App, Page) {
	"use strict";

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
		oFirstMenuItem = new MenuItem("I221"),
		oSecondMenuItem = new MenuTextFieldItem("I222", {}),
		oButton1,
		oButton2,
		oButton3,
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

	oApp = new App("myApp").placeAt("body");

	oPage = new Page({
		title: "Menu Test",
		content : [
			oButton1,
			oButton2,
			oButton3
		]
	});

	oApp.addPage(oPage);
});