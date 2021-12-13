sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/base/Log"
], function (Controller, Log) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.NavigationService", {

		onCardAction: function (oEvent) {
			// informs CardActions that the action was handled and no further processing is needed on CardActions' end
			oEvent.preventDefault();

			var oActionParameters = oEvent.getParameter("parameters");

			Log.error("Event data: " + JSON.stringify(oActionParameters.data)); //TODO: 'data' parameter is contained in 'configuration' and looks obsolete. Can we remove it?
			Log.error("Event action handler configuration: " + JSON.stringify(oActionParameters.configuration));
		}
	});
});