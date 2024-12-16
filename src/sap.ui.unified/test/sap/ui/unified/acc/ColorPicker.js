sap.ui.define([
	"sap/m/Label",
	"sap/ui/unified/ColorPicker",
	"sap/ui/unified/ColorPickerPopover",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/m/MessageToast",
	"sap/ui/core/library",
	"sap/ui/unified/library"
], function(
	Label,
	ColorPicker,
	ColorPickerPopover,
	App,
	Page,
	Button,
	VerticalLayout,
	MessageToast,
	coreLibrary,
	unifiedLibrary
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.ui.unified.ColorPickerDisplayMode
	var ColorPickerDisplayMode = unifiedLibrary.ColorPickerDisplayMode;

	// shortcut for sap.ui.unified.ColorPickerMode
	var ColorPickerMode = unifiedLibrary.ColorPickerMode;

	var oLabel1 = new Label({
		text: "Default display mode. Select a color",
		wrapping: true,
		labelFor: "ColorPicker1"
	});
	var oColorPicker1 = new ColorPicker("ColorPicker1", {
		displayMode: ColorPickerDisplayMode.Default,
		mode: ColorPickerMode.HSL
	});

	var oLabel2 = new Label({
		text: "Simplified display mode. Select a color",
		wrapping: true,
		labelFor: "ColorPicker2"
	});
	var oColorPicker2 = new ColorPicker("ColorPicker2", {
		displayMode: ColorPickerDisplayMode.Simplified
	});

	var oLabel3 = new Label({
		text: "Select a color from the color picker",
		wrapping: true,
		labelFor: "openPicker"
	});
	var oColorPickerPopover = new ColorPickerPopover({
		mode: ColorPickerMode.HSL,
		change: function handleChange(oEvent) {
			MessageToast.show("Chosen color string: " + oEvent.getParameters().colorString);
		}
	});
	var oColorPickerButton = new Button("openPicker",{
		text: "Open picker",
		press: function(){
			oColorPickerPopover.openBy(this);
		}
	});

	var oPageLayout = new VerticalLayout({
		content: [
			oLabel3, oColorPickerButton,
			oLabel1, oColorPicker1,
			oLabel2, oColorPicker2
		]
	}).addStyleClass("sapUiContentPadding");

	var oApp = new App();
	var oPage = new Page({
		title: "ColorPicker Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: oPageLayout
	});

	oApp.addPage(oPage);
	oApp.placeAt("body");
});