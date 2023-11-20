sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/m/MessageToast',
		'sap/ui/integration/Host'
	], function(Controller, MessageToast, Host) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.AdaptiveCustomizedActions.AdaptiveCustomizedActions", {

		onCardAction: function (oEvent) {
			var sType = oEvent.getParameter("type"),
				sMessage = "The default action behaviour of this button has been customized in the application's controller";


			if (sType === "Navigation") {
				oEvent.preventDefault();
			}

			MessageToast.show(sMessage, {
				at: "center center",
				width: "25rem"
			});
		}
	});
});