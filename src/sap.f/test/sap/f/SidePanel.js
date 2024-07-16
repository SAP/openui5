sap.ui.define([
	"sap/m/Page",
	"sap/m/App",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Switch",
	"sap/m/VBox",
	"sap/m/MessageToast",
	"sap/f/SidePanel",
	"sap/f/SidePanelItem",
	"sap/ui/core/Element"
], function (
	Page,
	App,
	Text,
	Button,
	Input,
	Label,
	Switch,
	VBox,
	MessageToast,
	SidePanel,
	SidePanelItem,
	Element
) {
	"use strict";
	var oSidePanel = new SidePanel("mySidePanel", {
			mainContent: [
				new Button({ text: "Button 1" }),
				new Button({ text: "Button 2" }),
				new VBox({
					items: [
						new Label({ text: "Prevent next EXPAND event" }),
						new Switch("preventExpand", { type: "AcceptReject"}),
						new Label({ text: "Prevent next COLLAPSE event" }),
						new Switch("preventCollapse", { type: "AcceptReject" }).addStyleClass("sapUiSmallMarginBottom")
					]
				}).addStyleClass("sapUiSmallMarginTopBottom"),
				new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
				new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
				new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
				new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
				new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
				new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
				new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
				new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
				new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" }),
				new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum" })
			],
			sidePanelWidth: "400px",
			sidePanelResizable: true,
			items: [
				new SidePanelItem({
					icon: "sap-icon://physical-activity",
					text: "Run",
					content: [
						new Text({ text: "This is static content for 'Run' action item" })
					]
				}),
				new SidePanelItem({
					icon: "sap-icon://addresses",
					text: "Go home",
					enabled: false,
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://building",
					text: "Go to the office",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://bed",
					text: "Go to sleep",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://flight",
					text: "Fly abroad",
					content: [
						new Text({ text: "(Static content) The flight is scheduled for tomorrow." })
					]
				}),
				new SidePanelItem({
					icon: "sap-icon://cargo-train",
					text: "Travel",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://cart",
					text: "Go to the mall",
					content: [ new VBox({
						items: [
							new Text({ text: "Static content" }),
							new Button({ text: "Buy now" })
						]})
					]
				}),
				new SidePanelItem({
					icon: "sap-icon://car-rental",
					text: "Drive your car",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://create-leave-request",
					text: "Go on vacation",
					enabled: false,
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://family-protection",
					text: "Meet your family",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://lab",
					text: "Research",
					enabled: false,
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://theater",
					text: "Go to the theater",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://taxi",
					text: "Take a taxi",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://vehicle-repair",
					text: "Repair your car",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://wounds-doc",
					text: "Visit a doctor",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://umbrella",
					text: "Take an umbrella",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://puzzle",
					text: "Solve a puzzle",
					content: [

					]
				}),
				new SidePanelItem({
					icon: "sap-icon://picture",
					text: "Draw a picture",
					content: [

					]
				})
			],
			toggle: function(e) {
				var oPreventExpand = Element.getElementById("preventExpand"),
					oPreventCollapse = Element.getElementById("preventCollapse"),
					oItem = e.getParameter("item"),
					bExpanded = e.getParameter("expanded");

				oItem ? parseInt(oItem.getId().replace( /^\D+/g, '')) : -1;
				Element.getElementById("mySidePanel");

				if (!bExpanded) {
					if (oPreventCollapse.getState()) {
						MessageToast.show("I am prevented COLLAPSE event");
						oPreventCollapse.setState(false);
						e.preventDefault();
					}
				} else if (oPreventExpand.getState()) {
						MessageToast.show("I am prevented EXPAND event");
						oPreventExpand.setState(false);
						e.preventDefault();
				} else {
					!oItem.getContent().length && oItem.addContent(new VBox({
						items: [
							new Text({ text: "Dynamic content generated for item '" + oItem.getText() + "'" })
						]
					}));
				}
			}
		});

	var oPage = new Page("page", {
		title: "SidePanel",
		content: [ oSidePanel ]
	});

	new App({
		pages: [ oPage ]
	}).placeAt("body");
});