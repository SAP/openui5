sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/Text",
	"sap/m/Button",
	"sap/f/SidePanel",
	"sap/f/SidePanelItem",
	"sap/f/library"
], function (
	Core,
	Text,
	Button,
	SidePanel,
	SidePanelItem,
	library
) {
	"use strict";
	var oSidePanel1 = new SidePanel("SidePanel1", {
		mainContent: [
			new Button({ text: "Button 1" }),
			new Button({ text: "Button 2" }),
			new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
			new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
			new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
			new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
		],
		items: [
			new SidePanelItem({
				icon: "sap-icon://physical-activity",
				text: "Run",
				content: [
					new Text({ text: "Run - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." })
				]
			}),
			new SidePanelItem({
				icon: "sap-icon://addresses",
				text: "Go home",
				enabled: false,
				content: [
					new Text({ text: "Go home - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." })
				]
			}),
			new SidePanelItem({
				icon: "sap-icon://building",
				text: "Go to the office",
				content: [
					new Text({ text: "Go to the office - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." })
				]
			}),
			new SidePanelItem({
				icon: "sap-icon://bed",
				text: "Go to sleep",
				content: [
					new Text({ text: "Go to sleep - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." })
				]
			}),
			new SidePanelItem({
				icon: "sap-icon://flight",
				text: "Fly abroad",
				content: [
					new Text({ text: "Fly abroad - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." })
				]
			}),
			new SidePanelItem({
				icon: "sap-icon://cargo-train",
				text: "Travel",
				enabled: false,
				content: [
					new Text({ text: "Travel - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." })
				]
			}),
			new SidePanelItem({
				icon: "sap-icon://cart",
				text: "Go to the mall",
				content: [
					new Text({ text: "Go to the mall - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." })
				]
			}),
			new SidePanelItem({
				icon: "sap-icon://car-rental",
				text: "Drive your car",
				content: [
					new Text({ text: "Drive your car - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." })
				]
			})
		]
	}).placeAt("sp1");

	var oSidePanel2 = new SidePanel("SidePanel2", {
		mainContent: [
			new Button({ text: "Button 1" }),
			new Button({ text: "Button 2" }),
			new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
			new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
			new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
			new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
		],
		items: [
			new SidePanelItem({
				icon: "sap-icon://physical-activity",
				text: "Run",
				content: [
					new Text({ text: "Run - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." })
				]
			})
		]
	}).placeAt("sp2");

	new Button("PositionButton", {
		text: "Toggle SidePanel Position",
		press: function() {
			var sPos1 = oSidePanel1.getSidePanelPosition() === library.SidePanelPosition.Right ? library.SidePanelPosition.Left : library.SidePanelPosition.Right;
			var sPos2 = oSidePanel2.getSidePanelPosition() === library.SidePanelPosition.Right ? library.SidePanelPosition.Left : library.SidePanelPosition.Right;
			oSidePanel1.setSidePanelPosition(sPos1);
			oSidePanel2.setSidePanelPosition(sPos2);
		}
	}).placeAt("spp");
});