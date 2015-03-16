sap.ui.define(['sap/m/MessageToast','sap/ui/core/mvc/Controller'],
	function(MessageToast, Controller) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.ToggleButton.Page", {

			onPress: function (evt) {
			if (evt.getSource().getPressed()) {
				MessageToast.show(evt.getSource().getId() + " Pressed");
			} else {
				MessageToast.show(evt.getSource().getId() + " Unpressed");
			};
		}
	});

	return PageController;

});
