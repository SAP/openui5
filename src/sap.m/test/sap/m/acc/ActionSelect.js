sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/VBox",
	"sap/ui/core/IconPool",
	"sap/ui/core/Item",
	"sap/ui/core/library",
	"sap/ui/layout/Grid"
], function(
	App,
	Button,
	CheckBox,
	Label,
	mobileLibrary,
	Page,
	Toolbar,
	ToolbarSpacer,
	VBox,
	IconPool,
	Item,
	coreLibrary,
	Grid
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.SelectType
	var SelectType = mobileLibrary.SelectType;

	var oApp = new App("myApp", {
				initialPage:"page1"
		}),
		oActionSelect0 = new undefined/*ActionSelect*/("default_sample", { // the selected item is not specified, the first one will be selected
			width: "33%",
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),
				new Item({
					key: "1",
					text: "item 1"
				})
			],
			buttons: [
				new Button({
					text: "Action 1",
					enabled: false
				}),
				new Button({
					text: "Action 2"
				})
			]
		}),
		oLabel0 = new Label({
			text: "ActionSelect with type Default:",
			labelFor: oActionSelect0
		}),
		oActionSelect1 = new undefined/*ActionSelect*/("icon_only",{	// the selected item is not specified, the first one will be selected
			type: SelectType.IconOnly,
			icon: IconPool.getIconURI("filter"),
			autoAdjustWidth: true,
			width: "10rem",
			items: [
				new Item({
					key: "0",
					text: "item 0"
				}),
				new Item({
					key: "1",
					text: "item 1"
				}),
				new Item({
					key: "2",
					text: "item 2"
				})
			],
			buttons: [
				new Button({
					text: "Action 1"
				}),
				new Button({
					text: "Action 2"
				})
			]
		}),
		oLabel4 = new Label({
			text: "ActionSelect with type IconOnly:",
			labelFor: oActionSelect1
		}),
		oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),
		oPage = new Page("page1", {
			title:  "ActionSelect Accessibility Test Page",
			titleLevel: TitleLevel.H1,
			content: [
				new Grid({
					content: [
						new VBox({items: [oLabel0, oActionSelect0]}),
						new VBox({items: [oLabel4, oActionSelect1]})
					]
				})
			],
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
