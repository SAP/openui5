sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/ResponsivePopover',
	'sap/ui/unified/ColorPicker',
	'sap/m/Button',
	'sap/ui/Device'
], function(Controller, ResponsivePopover, ColorPicker, Button, Device) {
	"use strict";

	var ColorPickerMode = sap.ui.unified.ColorPickerMode,
		ColorPickerDisplayMode = sap.ui.unified.ColorPickerDisplayMode;

	return Controller.extend("sap.ui.unified.sample.ColorPicker.Controller", {
		openPopover: function(oEvent) {
			var oRP = new ResponsivePopover({
				title: "Color Picker",
				content:[
					new ColorPicker({
						mode: ColorPickerMode.HSL,
						displayMode: ColorPickerDisplayMode.Simplified
					})
				]
			});

			if (Device.system.phone) {
				oRP.setBeginButton(
					new Button({
						text: "Submit",
						press: function () {
							oRP.close();
						}
					})
				);
				oRP.setEndButton(
					new Button({
						text: "Cancel",
						press: function () {
							oRP.close();
						}
					}));
			} else {
				oRP.setShowHeader(false);
			}

			oRP.openBy(oEvent.getSource());
		}
	});

});