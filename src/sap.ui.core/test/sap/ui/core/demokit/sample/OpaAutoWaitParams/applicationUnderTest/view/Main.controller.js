sap.ui.define([
	'sap/m/MessageBox',
	"sap/ui/core/mvc/Controller"
], function (MessageBox, Controller) {
	"use strict";

	var bIsPolling = false;
	var iPollTimeout;

	var MainController = Controller.extend("view.Main", {
		startPolling: function (oEvent) {
			bIsPolling = !bIsPolling;
			oEvent.getSource().setText(bIsPolling ? "Stop" : "Start");

			if (bIsPolling) {
				console.debug("Start pressed");
				(function poll() {
					iPollTimeout = setTimeout(function () {
						console.debug("Polling");
						poll();
					}, 500);
				}());
			} else {
				console.debug("Stop pressed");
				clearTimeout(iPollTimeout);
			}
		}
	});

	return MainController;

});
