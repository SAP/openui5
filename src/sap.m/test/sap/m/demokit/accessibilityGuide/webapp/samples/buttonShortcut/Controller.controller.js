sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.buttonShortcut.Controller", {
		onSave: function () {
			MessageToast.show("CTRL+S: save triggered on controller");
		},

		onDelete: function () {
			MessageToast.show("CTRL+D: delete triggered on controller");
		}
	});
});
