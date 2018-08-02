sap.ui.define([
		'sap/ui/core/mvc/Controller'
	], function(Controller) {
	"use strict";

	var ColorPicker = Controller.extend("sap.ui.unified.sample.ColorPicker.Controller", {
		changeDisplayMode: function(oEvent) {
			var sColorPickerDisplay = oEvent.getParameter('selectedItem').getKey(),
				oCP = this.byId("cp");
			oCP.setDisplayMode(sColorPickerDisplay);
		}
	});

	return ColorPicker;

});
