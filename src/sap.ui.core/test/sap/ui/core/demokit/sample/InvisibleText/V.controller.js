sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Controller, MessageToast) {
	"use strict";

	var VController = Controller.extend("sap.ui.core.sample.InvisibleText.V", {

		onPress: function (evt) {
			MessageToast.show(evt.getSource().getId() + " Pressed");
		}
	});

	return VController;

});
