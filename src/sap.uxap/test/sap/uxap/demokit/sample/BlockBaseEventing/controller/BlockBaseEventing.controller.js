sap.ui.define(["sap/m/MessageToast", "sap/ui/core/mvc/Controller"], function (MessageToast, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.BlockBaseEventing.controller.BlockBaseEventing", {
		onDummy: function (oEvent) {
			MessageToast.show('dummy event fired by control ' + oEvent.getSource().getId());
		}
	});
});
