sap.ui.define([
	"sap/m/Button",
	"sap/m/ColorPalette",
	"sap/m/ColorPalettePopover",
	"sap/m/HBox",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/Title",
	"sap/m/VBox",
	"sap/m/Page",
	"sap/m/App",
	"sap/ui/core/library"
], function(
	Button,
	ColorPalette,
	ColorPalettePopover,
	HBox,
	Input,
	Label,
	mobileLibrary,
	MessageToast,
	Title,
	VBox,
	Page,
	App,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.m.FlexAlignItems
	var FlexAlignItems = mobileLibrary.FlexAlignItems;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function handleColorSelect(oEvent) {
		MessageToast.show("value: " + oEvent.getParameter("value") +
			", \n defaultAction: " + oEvent.getParameter("defaultAction"));
	}

	function generateColorPalettePopoverElements() {
		var oCPPop, oCPPop2Colors, oCPPop7Colors;

		oCPPop = new ColorPalettePopover("oCPPop", {
			defaultColor: "red",
			colorSelect: handleColorSelect
		});

		oCPPop2Colors = new ColorPalettePopover("kpop2", {
			defaultColor: "black",
			showDefaultColorButton: false,
			colors: [
				"red",
				"#ffff00"
			],
			colorSelect: handleColorSelect
		});

		oCPPop7Colors = new ColorPalettePopover("oCPPop7Colors", {
			showDefaultColorButton: false,
			showMoreColorsButton: false,
			colors: [
				"red",
				"#ffff00",
				"green",
				"hsl(350, 60%, 60%)",
				"lightblue",
				"#a811ff",
				"black"
			],
			colorSelect: handleColorSelect
		});

		return [
			new HBox({
				alignItems: FlexAlignItems.Center,
				items: [
					new Label("lbl1", {
						text: "Color Palette with default settings",
						wrapping: true
					}),
					new Button({
						text: "Open",
						press: function () {
							oCPPop.openBy(this);
						},
						ariaLabelledBy: "lbl1"
					})
				]
			}),

			new HBox({
				alignItems: FlexAlignItems.Center,
				items: [
					new Label("lbl2", {
						text: "Color Palette with 2 colors and 'More Colors' button",
						wrapping: true
					}),
					new Button({
						text: "Open",
						press: function () {
							oCPPop2Colors.openBy(this);
						},
						ariaLabelledBy: "lbl2"
					})
				]
			}),

			new HBox({
				alignItems: FlexAlignItems.Center,
				items: [
					new Label("lbl3", {
						text: "Color Palette with 7 colors without any button",
						wrapping: true
					}),
					new Button({
						text: "Open",
						press: function () {
							oCPPop7Colors.openBy(this);
						},
						ariaLabelledBy: "lbl3"
					})
				]
			})
		];
	}

	var app = new App("myApp");
	var page1 = new Page("page1", {
		title: "Color Palette Test page",
		titleLevel: TitleLevel.H1,
		content: [
			//As Popover
			new VBox({
				items: [
					new Title({
						text: "Color Palette samples where the palette is wrapped in a Popover(desktop)/Dialog (mobile)",
						level: TitleLevel.H2,
						titleStyle: TitleLevel.H2,
						wrapping: true
					}),
					generateColorPalettePopoverElements()
				]
			}),

			//Default Color Palette in standalone mode
			new VBox({
				items: [
					new Title({
						text: "Color Palette in standalone mode with default settings",
						level: TitleLevel.H2,
						titleStyle: TitleLevel.H2,
						wrapping: true
					}),
					new Label({text: "Before: ", labelFor: "before"}),
					new Input("before", {placeholder: "An interactive control before Color Palette"}),
					new ColorPalette({
						colorSelect: handleColorSelect
					}),
					new Label({text: "After: ", labelFor: "after"}),
					new Input("after", {placeholder: "An interactive control after Color Palette"})
				]
			})
		]
	});

	app.addPage(page1);

	app.placeAt("content");

});
