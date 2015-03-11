sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var VController = Controller.extend("sap.ui.core.sample.InvisibleText.V", {

		onPress: function (evt) {
			sap.m.MessageToast.show(evt.getSource().getId() + " Pressed");
		}
	});

	return VController;

});
