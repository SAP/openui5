sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	return Controller.extend("sap.ui.integration.localServices.oath3lo.hostApp.Controller", {
		onInit: function () {
			// this happens in the hosting application
			const oChannel = new BroadcastChannel("sap-ui5-cardExplorer-simulateOAuth3LO");

			oChannel.postMessage({
				id: "simulate-consent-given"
			});

			setTimeout(() => {
				window.close();
			}, 4000);
		}
	});
});