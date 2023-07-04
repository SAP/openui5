sap.ui.define([
	"sap/m/App",
	"sap/m/Page",
	"sap/tnt/ToolHeader",
	"sap/m/IconTabHeader",
	"sap/m/IconTabFilter",
	"sap/m/IconTabSeparator",
	"sap/m/HBox",
	"sap/m/Button",
	"sap/m/OverflowToolbarLayoutData"
], function(
	App,
	Page,
	ToolHeader,
	IconTabHeader,
	IconTabFilter,
	IconTabSeparator,
	HBox,
	Button,
	OverflowToolbarLayoutData
) {
	"use strict";

	var toolHeader = new ToolHeader({
		content: [
			new Button({
				icon: "sap-icon://menu2",
				layoutData: new OverflowToolbarLayoutData({
					priority: "NeverOverflow"
				})
			}),
			new IconTabHeader({
				mode: "Inline",
				items: [
					new IconTabFilter({
						text: "My Home"
					}),
					new IconTabSeparator(),
					new IconTabFilter({
						text: "Accounts Payable"
					}),
					new IconTabFilter({
						text: "Entry 1"
					}),
					new IconTabFilter({
						text: "Entry 2"
					}),
					new IconTabFilter({
						text: "Entry 3"
					}),
					new IconTabFilter({
						text: "Entry 4"
					}),
					new IconTabFilter({
						text: "Entry 5"
					}),
					new IconTabFilter({
						text: "Entry 6"
					}),
					new IconTabFilter({
						text: "Entry 7"
					}),
					new IconTabFilter({
						text: "Entry 8"
					})
				]
			}).addStyleClass("sapUshellShellTabBar")
		]
	}).addStyleClass("sapUshellShellToolHeader");

	var iconTabHeader = new IconTabHeader({
		mode: "Inline",
		items: [
			new IconTabFilter({
				text: "My Home"
			}),
			new IconTabSeparator(),
			new IconTabFilter({
				text: "Accounts Payable"
			}),
			new IconTabFilter({
				text: "Entry 1"
			}),
			new IconTabFilter({
				text: "Entry 2"
			}),
			new IconTabFilter({
				text: "Entry 3"
			}),
			new IconTabFilter({
				text: "Entry 4"
			}),
			new IconTabFilter({
				text: "Entry 5"
			}),
			new IconTabFilter({
				text: "Entry 6"
			}),
			new IconTabFilter({
				text: "Entry 7"
			}),
			new IconTabFilter({
				text: "Entry 8"
			})
		]
	}).addStyleClass("sapUshellShellTabBar");

	var app = new App("myApp", {initialPage:"tabBarPage"});
	app.placeAt("body");

	var initialPage = new Page("tabBarPage", {
		showHeader: false,
		content: [
			toolHeader,
			new HBox({
				height: "50px"
			}),
			iconTabHeader
		]});
	app.addPage(initialPage);
});
