sap.ui.define(['sap/m/MessageToast','sap/ui/core/mvc/Controller'],
	function(MessageToast, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.ToggleButton.Page", {

			onPress: function (oEvent) {
			if (oEvent.getSource().getPressed()) {
				MessageToast.show(oEvent.getSource().getId() + " Pressed");
			} else {
				MessageToast.show(oEvent.getSource().getId() + " Unpressed");
			}
		}
	});

});
