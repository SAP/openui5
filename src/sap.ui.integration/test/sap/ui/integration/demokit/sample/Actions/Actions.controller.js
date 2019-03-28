sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/integration/library"
], function (Controller, MessageToast, library) {
	"use strict";

	var ActionsController = Controller.extend("sap.ui.integration.sample.Actions.Actions", {
		onAction: function (oEvent) {
			if (oEvent.getParameter("type") === library.CardActionType.Navigation) {
				MessageToast.show("Relative URL: " + oEvent.getParameter("manifestParameters").url);
			}
		}
	});

	return ActionsController;

});
