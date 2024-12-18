sap.ui.define([
	"sap/m/Button",
	"sap/m/ColorPalette",
	"sap/m/ColorPalettePopover",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Page",
	"sap/m/App",
	"sap/ui/core/library"
], function(
	Button,
	ColorPalette,
	ColorPalettePopover,
	Label,
	MessageToast,
	VerticalLayout,
	Page,
	App,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	function handleColorSelect(oEvent) {
		MessageToast.show("value: " + oEvent.getParameter("value") +
			", \n defaultAction: " + oEvent.getParameter("defaultAction"));
	}

	var oColorPalettePopover = new ColorPalettePopover("oCPPop", {
		colorSelect: handleColorSelect
	});

	var oPageLayout = new VerticalLayout({
		content: [
			new Label({
				text: "Color Palette embedded mode, select a color",
				labelFor: "CP1",
				wrapping: true
			}),
			new ColorPalette("CP1", {
				colorSelect: handleColorSelect
			}),
			new Label({
				text: "Color Palette popover mode, select a color",
				labelFor: "btn1",
				wrapping: true
			}),
			new Button("btn1", {
				text: "Open",
				press: function () {
					oColorPalettePopover.openBy(this);
				}
			})
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "ColorPalette Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [ oPageLayout ]
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});
