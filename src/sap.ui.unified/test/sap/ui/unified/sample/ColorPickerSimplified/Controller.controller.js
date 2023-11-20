sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/ResponsivePopover',
	'sap/ui/unified/ColorPicker',
	'sap/ui/unified/library',
	'sap/m/Button',
	'sap/ui/Device'
], function(Controller, ResponsivePopover, ColorPicker, unifiedLibrary, Button, Device) {
	"use strict";

	var ColorPickerMode = unifiedLibrary.ColorPickerMode,
		ColorPickerDisplayMode = unifiedLibrary.ColorPickerDisplayMode;

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