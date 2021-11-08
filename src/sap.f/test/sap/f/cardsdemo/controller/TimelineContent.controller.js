sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.TimelineController", {
		onAction: function (oEvent) {
			MessageToast.show(JSON.stringify(oEvent.getParameter("parameters")));

			oEvent.preventDefault();
		}
	});
});