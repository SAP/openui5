sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/Select",
	"sap/m/ToggleButton",
	"sap/ui/core/Item",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/unified/ColorPicker",
	"sap/ui/unified/ColorPickerPopover",
	"sap/ui/unified/library",
	"sap/ui/thirdparty/jquery"
], function(App, Button, Label, MessageToast, Page, Select, ToggleButton, Item, VerticalLayout, ColorPicker, ColorPickerPopover, unifiedLibrary, jQuery) {
	"use strict";

	var ColorPickerDisplayMode = unifiedLibrary.ColorPickerDisplayMode;
	var ColorPickerMode = unifiedLibrary.ColorPickerMode;

	var oCP,
		oCPP = new ColorPickerPopover({
			mode: ColorPickerMode.HSL,
			change: function handleChange(oEvent) {
				MessageToast.show("Chosen color string: " + oEvent.getParameters().colorString);
			}
		}),
		oSelect = new Select('select_mode', {
			items: [
				new Item("default_mode", {
					text: 'Default',
					key: ColorPickerDisplayMode.Default
				}),
				new Item("large_mode", {
					text: 'Large',
					key: ColorPickerDisplayMode.Large
				}),
				new Item("simplified_mode", {
					text: 'Simplified',
					key: ColorPickerDisplayMode.Simplified
				})
			],
			change: function(oEvent) {
				var sColorPickerDisplay = oEvent.getParameter('selectedItem').getKey();
				oCP.setDisplayMode(sColorPickerDisplay);
				oCPP.setDisplayMode(sColorPickerDisplay);
			}
		}),
		oSelectLabel = new Label({
			text: "Select display mode:",
			labelFor: oSelect
		}).addStyleClass("sapUiMediumMarginTop"),
		oButton = new Button("toggle_mode", {
			text: "Toggle Compact Mode",
			press: function(){
				jQuery("body").toggleClass("sapUiSizeCompact");
			}
		});

	new App({
		pages: [
			new Page("ColorPickerArea", {
				showHeader:false,
				content: [
					new VerticalLayout({
						width: "100%",
						content: [
							new VerticalLayout({
								width: "100%",
								content: [
									oCP = new ColorPicker("cp", {
										colorString: "white",
										mode: ColorPickerMode.HSL
									})
								]
							}),
							oSelectLabel,
							oSelect,
							oButton,
							new ToggleButton("hsv_hsl_btn", {
								text: "Toggle HSV/HSL",
								press: function () {
									oCP.setMode(ColorPickerMode[this.getPressed() ? 'HSL' : 'HSV']);
								}
							}),
							new Button("btnPopoverBottom", {
								text : "Open ColorPicker popover",
								press : function() {
									oCPP.openBy(this);
								}
							})
						]
					})
				]
			}).addStyleClass("sapUiResponsiveContentPadding")
		]
	}).placeAt("content");
});