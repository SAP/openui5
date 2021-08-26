sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.messageToast.Controller", {
		fnHandler: function () {
			MessageToast.show("Toasted!!!");
		}
	});
});
