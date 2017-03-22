sap.ui.define(['sap/ui/core/mvc/Controller', "sap/m/MessageToast"], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.Breadcrumbs.Page", {
		onPress: function (oEvent) {
			MessageToast.show(oEvent.getSource().getText() + " has been activated");
		}
	});
});
