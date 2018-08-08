sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function(Controller) {
	"use strict";

	var ColorPicker = Controller.extend("sap.ui.unified.sample.ColorPicker.Controller", {
		openPopover: function(oEvent) {
			var oRP = new sap.m.ResponsivePopover({
				title: "Color Picker",
				content:[
					new sap.ui.unified.ColorPicker({
						mode: sap.ui.unified.ColorPickerMode.HSL,
						displayMode: sap.ui.unified.ColorPickerDisplayMode.Large
					})
				]
			});

			if (sap.ui.Device.system.phone) {
				oRP.setBeginButton(
					new sap.m.Button({
						text: "Submit",
						press: function () {
							oRP.close();
						}
					})
				);
				oRP.setEndButton(
					new sap.m.Button({
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

	return ColorPicker;

});